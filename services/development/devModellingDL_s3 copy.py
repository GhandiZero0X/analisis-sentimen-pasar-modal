# services/development/devModellingDL.py
"""
=============================================================
STEP 4a: FINE-TUNING IndoBERTweet (3 CLASS)
=============================================================
Model    : indolem/indobertweet-base-uncased
Source   : https://huggingface.co/indolem/indobertweet-base-uncased

Scenario 3:
  - Label NEGATIF, NETRAL, POSITIF semuanya dipakai
  - Tidak ada label yang dibuang
  - Evaluasi utama pakai macro F1 + weighted F1 + accuracy

Tahapan:
  1. Split Data   → 80% train / 10% val / 10% test
  2. Tokenisasi   → AutoTokenizer (subword WordPiece, max_length=128)
  3. Fine-tuning  → PyTorch training loop + validation per epoch
  4. Simpan       → checkpoint .bin (model terbaik berdasarkan val loss)

Input  : dev_database/3_preprocessing/dl/
         tweets_all_periods_labellingLexicon_preprocessingDL.csv

Output : dev_database/4_model/dl/all_periods/
         best_model.bin
         config.json
         tokenizer/
         label_encoder.joblib
         split_indices.joblib
         train_log.csv
         train_info.txt
=============================================================
"""
import joblib
import math
import time
import os
import gc
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from torch.amp import autocast, GradScaler
from pathlib import Path
from datetime import datetime
from tqdm import tqdm

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import f1_score

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup,
)

# ══════════════════════════════════════════════════════════════
#  PATH
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
INPUT_DIR  = BASE_DIR / "dev_database" / "3_preprocessing" / "S1S3" / "dl"
OUTPUT_DIR = BASE_DIR / "dev_database" / "4_model" / "S3" / "dl" / "all_periods"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILE = INPUT_DIR / "tweets_all_periods_labellingLexicon_preprocessingDL.csv"
MODEL_NAME = "indolem/indobertweet-base-uncased"

# ══════════════════════════════════════════════════════════════
#  AUTO-DETECT VRAM → pilih config yang sesuai
#  Jalankan dulu: nvidia-smi  atau
#  python -c "import torch; print(torch.cuda.get_device_properties(0).total_memory/1024**3)"
# ══════════════════════════════════════════════════════════════
def _get_vram_gb():
    if not torch.cuda.is_available():
        return 0.0
    return torch.cuda.get_device_properties(0).total_memory / 1024**3

_VRAM_GB = _get_vram_gb()

if _VRAM_GB >= 5.5:          # RTX 3050 6GB
    BATCH_SIZE       = 32
    GRAD_ACCUM_STEPS = 1
    NUM_WORKERS      = 4
    _CONFIG_LABEL    = "6GB mode"
else:                         # RTX 3050 4GB
    BATCH_SIZE       = 16
    GRAD_ACCUM_STEPS = 2
    NUM_WORKERS      = 2
    _CONFIG_LABEL    = "4GB mode"

# ── Hyperparameter (tidak berubah antar config) ──────────────
MAX_LENGTH    = 128
EPOCHS        = 5
LEARNING_RATE = 2e-5
WARMUP_RATIO  = 0.1
WEIGHT_DECAY  = 0.01
RANDOM_SEED   = 0

# ── Proporsi split ──────────────────────────────────────────
TRAIN_RATIO = 0.80
VAL_RATIO   = 0.10
TEST_RATIO  = 0.10


# ══════════════════════════════════════════════════════════════
#  REPRODUCIBILITY + CUDA SETUP
# ══════════════════════════════════════════════════════════════
torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

if torch.cuda.is_available():
    torch.cuda.manual_seed_all(RANDOM_SEED)
    torch.backends.cudnn.benchmark     = True
    torch.backends.cudnn.deterministic = False
    os.environ.setdefault(
        "PYTORCH_CUDA_ALLOC_CONF",
        "max_split_size_mb:128,garbage_collection_threshold:0.8"
    )


# ══════════════════════════════════════════════════════════════
#  HELPER: MONITORING VRAM
# ══════════════════════════════════════════════════════════════
def vram_status(label=""):
    if not torch.cuda.is_available():
        return
    allocated = torch.cuda.memory_allocated() / 1e9
    reserved  = torch.cuda.memory_reserved()  / 1e9
    total     = torch.cuda.get_device_properties(0).total_memory / 1e9
    tag = f"[{label}] " if label else ""
    print(f"   {tag}VRAM: {allocated:.2f}GB pakai / "
          f"{reserved:.2f}GB reserved / {total:.1f}GB total")


# ══════════════════════════════════════════════════════════════
#  DATASET — Pre-tokenize sekali, simpan sebagai tensor di CPU RAM
# ══════════════════════════════════════════════════════════════
class TweetDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length):
        print(f"   Pre-tokenizing {len(texts):,} samples...", end=" ", flush=True)
        t0 = time.time()

        encoding = tokenizer(
            texts,
            max_length     = max_length,
            padding        = "max_length",
            truncation     = True,
            return_tensors = "pt",
        )
        self.input_ids      = encoding["input_ids"]       # CPU RAM, bukan VRAM
        self.attention_mask = encoding["attention_mask"]
        self.labels         = torch.tensor(labels, dtype=torch.long)

        ram_mb = self.input_ids.element_size() * self.input_ids.nelement() * 2 / 1e6
        print(f"selesai {time.time()-t0:.1f}s | RAM: ~{ram_mb:.0f}MB")

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return {
            "input_ids"      : self.input_ids[idx],
            "attention_mask" : self.attention_mask[idx],
            "label"          : self.labels[idx],
        }


# ══════════════════════════════════════════════════════════════
#  TRAINING — AMP fp16 + Gradient Accumulation
# ══════════════════════════════════════════════════════════════
def train_epoch(model, dataloader, optimizer, scheduler, scaler, device):
    model.train()
    total_loss, total_correct, total_samples = 0, 0, 0

    optimizer.zero_grad(set_to_none=True)

    for step, batch in enumerate(tqdm(dataloader, desc="   Train", ncols=75, leave=False)):
        input_ids      = batch["input_ids"].to(device, non_blocking=True)
        attention_mask = batch["attention_mask"].to(device, non_blocking=True)
        labels         = batch["label"].to(device, non_blocking=True)

        with autocast(device_type="cuda", dtype=torch.float16):
            outputs = model(
                input_ids      = input_ids,
                attention_mask = attention_mask,
                labels         = labels,
            )
            loss = outputs.loss / GRAD_ACCUM_STEPS

        scaler.scale(loss).backward()

        if (step + 1) % GRAD_ACCUM_STEPS == 0 or (step + 1) == len(dataloader):
            scaler.unscale_(optimizer)
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            scaler.step(optimizer)
            scaler.update()
            scheduler.step()
            optimizer.zero_grad(set_to_none=True)

        with torch.no_grad():
            preds = torch.argmax(outputs.logits, dim=1)
            total_correct += (preds == labels).sum().item()
            total_loss    += outputs.loss.item() * len(labels)
            total_samples += len(labels)

    return total_loss / total_samples, total_correct / total_samples


# ══════════════════════════════════════════════════════════════
#  EVALUASI — AMP fp16
# ══════════════════════════════════════════════════════════════
def evaluate_epoch(model, dataloader, device):
    model.eval()
    total_loss, total_correct, total_samples = 0, 0, 0
    all_preds, all_labels = [], []

    with torch.no_grad():
        for batch in tqdm(dataloader, desc="   Eval ", ncols=75, leave=False):
            input_ids      = batch["input_ids"].to(device, non_blocking=True)
            attention_mask = batch["attention_mask"].to(device, non_blocking=True)
            labels         = batch["label"].to(device, non_blocking=True)

            with autocast(device_type="cuda", dtype=torch.float16):
                outputs = model(
                    input_ids      = input_ids,
                    attention_mask = attention_mask,
                    labels         = labels,
                )

            preds = torch.argmax(outputs.logits, dim=1)
            total_correct += (preds == labels).sum().item()
            total_loss    += outputs.loss.item() * len(labels)
            total_samples += len(labels)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    return (
        total_loss / total_samples,
        total_correct / total_samples,
        f1_score(all_labels, all_preds, average="macro",    zero_division=0),
        f1_score(all_labels, all_preds, average="weighted", zero_division=0),
    )


# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════
def main():
    total_start_time = time.time()

    print("=" * 62)
    print("  FINE-TUNING IndoBERTweet — 3 CLASS")
    print("=" * 62)

    # ── Info GPU & config ──
    if not torch.cuda.is_available():
        print("\n⚠️  CUDA tidak tersedia — berjalan di CPU (lambat)")
    else:
        props = torch.cuda.get_device_properties(0)
        print(f"\n🖥️  GPU        : {props.name}")
        print(f"   VRAM       : {_VRAM_GB:.1f} GB")
        print(f"   Config     : {_CONFIG_LABEL}")
    print(f"   batch/GPU  : {BATCH_SIZE}")
    print(f"   grad_accum : {GRAD_ACCUM_STEPS}")
    print(f"   eff. batch : {BATCH_SIZE * GRAD_ACCUM_STEPS}")
    print(f"   workers    : {NUM_WORKERS}")
    print(f"   AMP fp16   : ✅")
    print(f"   compile    : ❌ (dimatikan untuk RTX 3050)")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # ── 1. Load & filter data ──
    print(f"\n📂 {INPUT_FILE.name}")
    df = pd.read_csv(INPUT_FILE, dtype=str).fillna("")
    df = df[df["tweet_preprocessed_dl"].str.strip() != ""].copy()
    df["sentiment"] = df["sentiment"].str.lower().str.strip()
    df = df[df["sentiment"].isin(["negatif", "netral", "positif"])].reset_index(drop=True)

    print(f"✅ Dataset : {len(df):,} baris")
    for label, count in df["sentiment"].value_counts().items():
        pct = count / len(df) * 100
        print(f"   {label:<12} {count:>6,} ({pct:4.1f}%)  {'█'*int(pct/4)}")

    # ── Encode label ──
    le = LabelEncoder()
    y  = le.fit_transform(df["sentiment"])
    X  = df["tweet_preprocessed_dl"].tolist()
    print(f"\n🔖 Kelas: {list(le.classes_)}")

    # ── 2. Split ──
    X_tv, X_test, y_tv, y_test, idx_tv, idx_test = train_test_split(
        X, y, range(len(X)), test_size=TEST_RATIO,
        random_state=RANDOM_SEED, stratify=y)

    X_train, X_val, y_train, y_val, idx_train, idx_val = train_test_split(
        X_tv, y_tv, idx_tv,
        test_size=VAL_RATIO / (TRAIN_RATIO + VAL_RATIO),
        random_state=RANDOM_SEED, stratify=y_tv)

    print(f"\n✂️  train={len(X_train):,} | val={len(X_val):,} | test={len(X_test):,}")

    joblib.dump({"idx_train": list(idx_train), "idx_val": list(idx_val),
                 "idx_test": list(idx_test), "X_test": X_test, "y_test": y_test},
                OUTPUT_DIR / "split_indices.joblib")

    # ── 3. Tokenizer & Model ──
    print(f"\n⬇️  Loading: {MODEL_NAME}")
    t0 = time.time()
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    id2label = {i: l for i, l in enumerate(le.classes_)}
    label2id = {l: i for i, l in id2label.items()}

    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME, num_labels=len(le.classes_),
        id2label=id2label, label2id=label2id,
    )
    model.to(device)
    tokenizer.save_pretrained(OUTPUT_DIR / "tokenizer")
    vram_status("setelah load model")
    print(f"✅ Model loaded ({time.time()-t0:.1f}s)")

    # ── 4. Dataset & DataLoader ──
    print(f"\n🔤 Pre-tokenisasi...")
    train_dataset = TweetDataset(X_train, y_train, tokenizer, MAX_LENGTH)
    val_dataset   = TweetDataset(X_val,   y_val,   tokenizer, MAX_LENGTH)

    dl_kwargs = dict(
        batch_size         = BATCH_SIZE,
        num_workers        = NUM_WORKERS,
        pin_memory         = torch.cuda.is_available(),
        persistent_workers = NUM_WORKERS > 0,
        prefetch_factor    = 2 if NUM_WORKERS > 0 else None,
    )
    train_loader = DataLoader(train_dataset, shuffle=True,  **dl_kwargs)
    val_loader   = DataLoader(val_dataset,   shuffle=False, **dl_kwargs)

    # ── Optimizer & Scheduler ──
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)

    total_steps  = math.ceil(len(train_loader) / GRAD_ACCUM_STEPS) * EPOCHS
    warmup_steps = int(total_steps * WARMUP_RATIO)
    scheduler    = get_linear_schedule_with_warmup(optimizer, warmup_steps, total_steps)

    scaler = GradScaler("cuda", enabled=torch.cuda.is_available())

    print(f"\n✅ total_steps={total_steps:,} | warmup={warmup_steps:,}")

    # ── 5. Training loop ──
    print(f"\n🚀 Fine-tuning ({EPOCHS} epoch)...\n{'─'*62}")

    best_val_loss = float("inf")
    best_epoch    = 0
    train_log     = []

    for epoch in range(1, EPOCHS + 1):
        t_epoch = time.time()
        print(f"\n  Epoch {epoch}/{EPOCHS}")

        train_loss, train_acc = train_epoch(
            model, train_loader, optimizer, scheduler, scaler, device)

        val_loss, val_acc, val_f1_macro, val_f1_weighted = evaluate_epoch(
            model, val_loader, device)

        epoch_time = time.time() - t_epoch
        vram_status(f"epoch {epoch}")

        train_log.append({
            "epoch"          : epoch,
            "train_loss"     : round(train_loss, 5),
            "train_acc"      : round(train_acc,  4),
            "val_loss"       : round(val_loss,   5),
            "val_acc"        : round(val_acc,    4),
            "val_f1_macro"   : round(val_f1_macro, 4),
            "val_f1_weighted": round(val_f1_weighted, 4),
            "runtime_sec"    : round(epoch_time, 2),
        })

        print(f"   Train  → loss: {train_loss:.4f} | acc: {train_acc:.4f}")
        print(f"   Val    → loss: {val_loss:.4f} | acc: {val_acc:.4f} | "
              f"f1_macro: {val_f1_macro:.4f} | f1_w: {val_f1_weighted:.4f}")
        print(f"   Runtime : {epoch_time:.1f}s")

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_epoch    = epoch
            raw_model = getattr(model, "_orig_mod", model)
            torch.save(raw_model.state_dict(), OUTPUT_DIR / "best_model.bin")
            raw_model.config.save_pretrained(OUTPUT_DIR)
            print(f"   ✅ Checkpoint disimpan (val_loss: {val_loss:.4f})")
        else:
            print(f"   — No improvement (best: epoch {best_epoch})")

    t_total = time.time() - total_start_time

    pd.DataFrame(train_log).to_csv(OUTPUT_DIR / "train_log.csv", index=False)
    joblib.dump(le, OUTPUT_DIR / "label_encoder.joblib")

    info = (
        f"TRAINING INFO — IndoBERTweet (3 Class)\n"
        f"{'='*50}\n"
        f"Tanggal        : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"GPU            : {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}\n"
        f"VRAM           : {_VRAM_GB:.1f} GB ({_CONFIG_LABEL})\n"
        f"Model          : {MODEL_NAME}\n"
        f"Total data     : {len(df):,}\n"
        f"Kelas          : {list(le.classes_)}\n\n"
        f"Split:\n"
        f"  Train        : {len(X_train):,}\n"
        f"  Val          : {len(X_val):,}\n"
        f"  Test         : {len(X_test):,}\n\n"
        f"Hyperparameter:\n"
        f"  max_length   : {MAX_LENGTH}\n"
        f"  batch_size   : {BATCH_SIZE}\n"
        f"  grad_accum   : {GRAD_ACCUM_STEPS}\n"
        f"  eff_batch    : {BATCH_SIZE * GRAD_ACCUM_STEPS}\n"
        f"  epochs       : {EPOCHS}\n"
        f"  lr           : {LEARNING_RATE}\n"
        f"  warmup_ratio : {WARMUP_RATIO}\n"
        f"  weight_decay : {WEIGHT_DECAY}\n"
        f"  total_steps  : {total_steps}\n\n"
        f"Hasil:\n"
        f"  Best epoch   : {best_epoch}\n"
        f"  Best val_loss: {best_val_loss:.5f}\n\n"
        f"Runtime total  : {t_total:.1f}s ({t_total/60:.1f} menit)\n"
    )
    (OUTPUT_DIR / "train_info.txt").write_text(info, encoding="utf-8")

    print(f"\n{'='*62}")
    print(f"  ✅ Selesai! Best epoch {best_epoch} (val_loss: {best_val_loss:.4f})")
    print(f"  Total runtime : {t_total/60:.1f} menit")
    print(f"{'='*62}")
    print(f"  ➡  Lanjut ke: python devEvaluasiDL.py")


if __name__ == "__main__":
    main()