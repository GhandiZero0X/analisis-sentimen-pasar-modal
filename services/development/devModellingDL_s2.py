# services/development/devModellingDL.py
"""
=============================================================
STEP 4a: FINE-TUNING IndoBERTweet (BINARY)
=============================================================
Model    : indolem/indobertweet-base-uncased
Source   : https://huggingface.co/indolem/indobertweet-base-uncased

Tahapan:
  1. Split Data   → 80% train / 10% val / 10% test
  2. Tokenisasi   → AutoTokenizer (subword WordPiece, max_length=128)
  3. Fine-tuning  → PyTorch training loop + validation per epoch
  4. Simpan       → checkpoint .bin (model terbaik berdasarkan val loss)

Catatan:
  - Data sudah hanya berisi label POSITIF dan NEGATIF
  - Model akan dilatih menggunakan kedua kelas tersebut saja

Input  : dev_database/3_preprocessing/dl/
         tweets_covid_labellingLexicon_preprocessingDL.csv

Output : dev_database/4_model/dl/covid/
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
import time
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from pathlib import Path
from datetime import datetime
from tqdm import tqdm

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, f1_score

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup,
)

# ══════════════════════════════════════════════════════════════
#  KONFIGURASI
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
INPUT_DIR  = BASE_DIR / "dev_database" / "3_preprocessing" / "S2" / "dl"
OUTPUT_DIR = BASE_DIR / "dev_database" / "4_model" / "S2" / "dl" / "all_periods"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILE = INPUT_DIR / "tweets_all_periods_labellingLexicon_preprocessingDL.csv"
MODEL_NAME = "indolem/indobertweet-base-uncased"

# ── Hyperparameter ──
MAX_LENGTH    = 128
BATCH_SIZE    = 16
EPOCHS        = 5
LEARNING_RATE = 2e-5
WARMUP_RATIO  = 0.1
WEIGHT_DECAY  = 0.01
RANDOM_SEED   = 0

# ── Proporsi split ──
TRAIN_RATIO = 0.80
VAL_RATIO   = 0.10
TEST_RATIO  = 0.10

# ══════════════════════════════════════════════════════════════
#  REPRODUCIBILITY
# ══════════════════════════════════════════════════════════════
torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(RANDOM_SEED)

# ══════════════════════════════════════════════════════════════
#  DATASET CLASS
# ══════════════════════════════════════════════════════════════
class TweetDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length):
        self.texts      = texts
        self.labels     = labels
        self.tokenizer  = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = self.tokenizer(
            self.texts[idx],
            max_length     = self.max_length,
            padding        = "max_length",
            truncation     = True,
            return_tensors = "pt",
        )
        return {
            "input_ids"      : encoding["input_ids"].squeeze(0),
            "attention_mask" : encoding["attention_mask"].squeeze(0),
            "label"          : torch.tensor(self.labels[idx], dtype=torch.long),
        }

# ══════════════════════════════════════════════════════════════
#  HELPER: SATU EPOCH TRAINING
# ══════════════════════════════════════════════════════════════
def train_epoch(model, dataloader, optimizer, scheduler, device):
    model.train()
    total_loss, total_correct, total_samples = 0, 0, 0

    for batch in tqdm(dataloader, desc="   Train", ncols=75, leave=False):
        input_ids      = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        labels         = batch["label"].to(device)

        optimizer.zero_grad()
        outputs = model(
            input_ids      = input_ids,
            attention_mask = attention_mask,
            labels         = labels,
        )

        loss   = outputs.loss
        logits = outputs.logits

        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        scheduler.step()

        preds = torch.argmax(logits, dim=1)
        total_correct += (preds == labels).sum().item()
        total_loss    += loss.item() * len(labels)
        total_samples += len(labels)

    return total_loss / total_samples, total_correct / total_samples


# ══════════════════════════════════════════════════════════════
#  HELPER: EVALUASI (VAL / TEST)
# ══════════════════════════════════════════════════════════════
def evaluate_epoch(model, dataloader, device, pos_label):
    model.eval()
    total_loss, total_correct, total_samples = 0, 0, 0
    all_preds, all_labels = [], []

    with torch.no_grad():
        for batch in tqdm(dataloader, desc="   Eval ", ncols=75, leave=False):
            input_ids      = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels         = batch["label"].to(device)

            outputs = model(
                input_ids      = input_ids,
                attention_mask = attention_mask,
                labels         = labels,
            )

            preds = torch.argmax(outputs.logits, dim=1)

            total_correct  += (preds == labels).sum().item()
            total_loss     += outputs.loss.item() * len(labels)
            total_samples  += len(labels)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    avg_loss = total_loss / total_samples
    accuracy = total_correct / total_samples

    f1 = f1_score(
        all_labels, all_preds,
        average   = "binary",
        pos_label = pos_label,
        zero_division = 0,
    )
    return avg_loss, accuracy, f1


# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════
def main():
    total_start_time = time.time()

    print("=" * 62)
    print("  FINE-TUNING IndoBERTweet — indolem/indobertweet-base-uncased")
    print("=" * 62)
    print(f"\n📂 Input  : {INPUT_FILE}")
    print(f"📂 Output : {OUTPUT_DIR}\n")

    # ── 1. Load dataset ──
    df = pd.read_csv(INPUT_FILE, dtype=str).fillna("")

    # hanya buang teks kosong
    df = df[df["tweet_preprocessed_dl"].str.strip() != ""].copy()

    # normalisasi label
    df["sentiment"] = df["sentiment"].astype(str).str.lower().str.strip()

    # Data sudah berisi hanya 2 kelas: negatif dan positif
    print(f"✅ Dataset dimuat : {len(df):,} baris")

    print(f"\n📊 Distribusi label (final):")
    dist = df["sentiment"].value_counts()
    for label, count in dist.items():
        pct = count / len(df) * 100
        bar = "█" * int(pct / 4)
        print(f"   {label:<12} {count:>6,} ({pct:5.1f}%)  {bar}")

    # ── Encode label ──
    le = LabelEncoder()
    y  = le.fit_transform(df["sentiment"])
    X  = df["tweet_preprocessed_dl"].tolist()

    pos_label = list(le.classes_).index("positif")   # → 1

    print(f"\n🔖 Label encoding: {dict(zip(le.classes_, range(len(le.classes_))))}")
    print(f"   pos_label untuk F1 binary : {pos_label} (positif)")

    # ── 2. Split 80 / 10 / 10 ──
    X_train_val, X_test, y_train_val, y_test, idx_train_val, idx_test = \
        train_test_split(
            X, y, range(len(X)),
            test_size    = TEST_RATIO,
            random_state = RANDOM_SEED,
            stratify     = y,
        )

    val_size_adjusted = VAL_RATIO / (TRAIN_RATIO + VAL_RATIO)
    X_train, X_val, y_train, y_val, idx_train, idx_val = \
        train_test_split(
            X_train_val, y_train_val, idx_train_val,
            test_size    = val_size_adjusted,
            random_state = RANDOM_SEED,
            stratify     = y_train_val,
        )

    print(f"\n✂️  Split data (80/10/10):")
    print(f"   Train      : {len(X_train):,} baris")
    print(f"   Validation : {len(X_val):,} baris")
    print(f"   Test       : {len(X_test):,} baris")

    joblib.dump({
        "idx_train" : list(idx_train),
        "idx_val"   : list(idx_val),
        "idx_test"  : list(idx_test),
        "X_test"    : X_test,
        "y_test"    : y_test,
    }, OUTPUT_DIR / "split_indices.joblib")

    # ── Setup device ──
    device      = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    device_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    print(f"\n🖥️  Device: {device_name}")

    # ── 3. Load tokenizer & model ──
    print(f"\n⬇️  Loading tokenizer & model: {MODEL_NAME}")
    load_model_start = time.time()

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels = len(le.classes_),   # 2 kelas
    )
    model.to(device)

    tokenizer.save_pretrained(OUTPUT_DIR / "tokenizer")
    load_model_time = time.time() - load_model_start

    print(f"✅ Model loaded")
    print(f"   Runtime loading : {load_model_time:.2f} detik")

    # ── DataLoader ──
    train_dataset = TweetDataset(X_train, y_train, tokenizer, MAX_LENGTH)
    val_dataset   = TweetDataset(X_val,   y_val,   tokenizer, MAX_LENGTH)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0)
    val_loader   = DataLoader(val_dataset,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # ── Optimizer & Scheduler ──
    optimizer    = AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)
    total_steps  = len(train_loader) * EPOCHS
    warmup_steps = int(total_steps * WARMUP_RATIO)
    scheduler    = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps   = warmup_steps,
        num_training_steps = total_steps,
    )

    print(f"✅ Model siap | Total steps: {total_steps:,} | Warmup: {warmup_steps:,}")

    # ── 4. Training loop ──
    print(f"\n🚀 Mulai fine-tuning ({EPOCHS} epoch)...\n")
    print(f"{'─'*62}")

    best_val_loss = float("inf")
    best_epoch    = 0
    train_log     = []

    training_start_time = time.time()

    for epoch in range(1, EPOCHS + 1):
        epoch_start_time = time.time()

        print(f"\n  Epoch {epoch}/{EPOCHS}")

        train_loss, train_acc = train_epoch(model, train_loader, optimizer, scheduler, device)
        val_loss, val_acc, val_f1 = evaluate_epoch(model, val_loader, device, pos_label)

        epoch_runtime = time.time() - epoch_start_time

        train_log.append({
            "epoch"       : epoch,
            "train_loss"  : round(train_loss, 5),
            "train_acc"   : round(train_acc, 4),
            "val_loss"    : round(val_loss, 5),
            "val_acc"     : round(val_acc, 4),
            "val_f1"      : round(val_f1, 4),
            "runtime_sec" : round(epoch_runtime, 2),
        })

        print(f"   Train  → loss: {train_loss:.4f} | acc: {train_acc:.4f}")
        print(f"   Val    → loss: {val_loss:.4f}   | acc: {val_acc:.4f} | f1: {val_f1:.4f}")
        print(f"   Runtime epoch : {epoch_runtime:.2f} detik")

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_epoch    = epoch
            torch.save(model.state_dict(), OUTPUT_DIR / "best_model.bin")
            model.config.save_pretrained(OUTPUT_DIR)
            print(f"   ✅ Checkpoint disimpan (val_loss: {val_loss:.4f})")
        else:
            print(f"   — Tidak ada peningkatan (best epoch: {best_epoch})")

    training_runtime = time.time() - training_start_time
    total_runtime    = time.time() - total_start_time

    pd.DataFrame(train_log).to_csv(OUTPUT_DIR / "train_log.csv", index=False)
    joblib.dump(le, OUTPUT_DIR / "label_encoder.joblib")

    info = f"""TRAINING INFO — IndoBERTweet Fine-tuning
=====================================
Tanggal          : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Model pretrained : {MODEL_NAME}
Input file       : {INPUT_FILE.name}
Total data       : {len(df):,}
Kelas            : {list(le.classes_)}  ← hanya positif & negatif

Split:
  Train          : {len(X_train):,}
  Validation     : {len(X_val):,}
  Test           : {len(X_test):,}

Hyperparameter:
  max_length     : {MAX_LENGTH}
  batch_size     : {BATCH_SIZE}
  epochs         : {EPOCHS}
  learning_rate  : {LEARNING_RATE}
  warmup_ratio   : {WARMUP_RATIO}
  weight_decay   : {WEIGHT_DECAY}

Hasil:
  Best epoch     : {best_epoch}
  Best val_loss  : {best_val_loss:.5f}

Runtime:
  Load model     : {load_model_time:.2f} detik
  Fine-tuning    : {training_runtime:.2f} detik
  Total runtime  : {total_runtime:.2f} detik

Device: {device_name}
"""
    (OUTPUT_DIR / "train_info.txt").write_text(info.strip(), encoding="utf-8")

    print(f"\n{'='*62}")
    print(f"  ✅ Fine-tuning selesai!")
    print(f"  Best epoch : {best_epoch} (val_loss: {best_val_loss:.4f})")
    print(f"{'='*62}")
    print(f"  📦 best_model.bin")
    print(f"  📁 tokenizer/")
    print(f"  📄 train_log.csv")
    print(f"  📄 train_info.txt")
    print(f"{'='*62}")
    print(f"\n  ➡  Lanjut ke: python devEvaluasiDL.py")


if __name__ == "__main__":
    main()