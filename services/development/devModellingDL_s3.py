# services/development/devModellingDL.py
"""
=============================================================
STEP 4a: FINE-TUNING IndoBERTweet (3 CLASS) — SKENARIO 3
=============================================================
Model    : indolem/indobertweet-base-uncased
Source   : https://huggingface.co/indolem/indobertweet-base-uncased

Scenario 3:
  - Label NEGATIF, NETRAL, POSITIF semuanya dipakai
  - Tidak ada label yang dibuang
  - Evaluasi utama pakai macro F1 + weighted F1 + accuracy

Tahapan:
  1. Split Data       -> 80% train / 10% val / 10% test
  2. Tokenisasi       -> AutoTokenizer (subword WordPiece, max_length=128)
  3. Penanganan Imbalance (HYBRID):
        a. Data-level      -> Random Oversampling (hanya pada data train)
        b. Algorithm-level -> Weighted Cross-Entropy Loss
  4. Fine-tuning      -> PyTorch training loop + validation per epoch
  5. Simpan           -> checkpoint .bin (model terbaik berdasarkan val loss)

Catatan:
  - Berbeda dari Skenario 1 & 2 (binary), Skenario 3 memakai 3 kelas
    sekaligus (negatif, netral, positif), sehingga class weight dan
    oversampling dihitung/diterapkan terhadap SEMUA kelas -- bukan
    hanya menyamakan 1 kelas minoritas ke 1 kelas mayoritas, tapi
    menyamakan seluruh kelas ke jumlah kelas dengan sampel terbanyak.

  Imbalance ditangani dengan pendekatan HYBRID (sama seperti Skenario
  1 & 2):

      1) RANDOM OVERSAMPLING (data-level)
         Baris-baris pada kelas yang jumlahnya lebih sedikit (negatif
         dan/atau netral, tergantung distribusi asli) pada data TRAIN
         diduplikasi (with replacement) sampai jumlahnya sama dengan
         kelas dengan sampel terbanyak. Hanya diterapkan pada data
         train (setelah split, sebelum tokenisasi) -- val/test TIDAK
         diubah, supaya tetap merepresentasikan distribusi data asli
         dan tidak terjadi data leakage.

      2) WEIGHTED CROSS-ENTROPY LOSS (algorithm-level)
         Bobot tiap kelas dihitung dari distribusi TRAIN ASLI (SEBELUM
         oversampling), lalu dipakai pada CrossEntropyLoss. Urutan ini
         sengaja dijaga: kalau bobot dihitung SESUDAH oversampling,
         datanya sudah rata sehingga bobot mendekati sama rata untuk
         semua kelas dan weighted loss jadi tidak lagi berkontribusi.

    SMOTE tidak dipakai karena bekerja dengan menginterpolasi vektor
    numerik kontinu, sedangkan token ID hasil tokenisasi BERT bersifat
    kategorikal diskrit -- interpolasi antar token ID tidak punya makna
    linguistik apa pun.

Input  : dev_database/3_preprocessing/S1S3/dl/
         tweets_all_periods_labellingLexicon_preprocessingDL.csv

Output : dev_database/4_model/S3/dl/all_periods/
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
from sklearn.utils import resample
from sklearn.utils.class_weight import compute_class_weight
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
INPUT_DIR  = BASE_DIR / "dev_database" / "3_preprocessing" / "S1S3" / "dl"
OUTPUT_DIR = BASE_DIR / "dev_database" / "4_model" / "S3" / "dl" / "covid"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILE = INPUT_DIR / "tweets_covid_labellingLexicon_preprocessingDL.csv"
MODEL_NAME = "indolem/indobertweet-base-uncased"

# -- Hyperparameter --
MAX_LENGTH    = 128
BATCH_SIZE    = 16
EPOCHS        = 5
LEARNING_RATE = 2e-5
WARMUP_RATIO  = 0.1
WEIGHT_DECAY  = 0.01
RANDOM_SEED   = 0

# -- Proporsi split --
TRAIN_RATIO = 0.80
VAL_RATIO   = 0.10
TEST_RATIO  = 0.10

# -- Konfigurasi penanganan imbalance (HYBRID) --
IMBALANCE_METHOD_DATA_LEVEL      = "random_oversampling"      # data-level
IMBALANCE_METHOD_ALGORITHM_LEVEL = "weighted_cross_entropy"   # algorithm-level

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
#  HELPER: RANDOM OVERSAMPLING (PENANGANAN IMBALANCE - DATA LEVEL)
# ══════════════════════════════════════════════════════════════
def random_oversample_train(X_train, y_train, class_names, random_state):
    """
    Menyeimbangkan data TRAIN dengan Random Oversampling (multi-class).

    Setiap kelas yang jumlah sampelnya lebih sedikit dari kelas dengan
    sampel terbanyak akan diduplikasi (with replacement) sampai
    jumlahnya sama, sehingga seluruh kelas pada data train memiliki
    jumlah sampel yang seimbang sebelum masuk ke tahap tokenisasi dan
    training. Berlaku untuk berapa pun jumlah kelas (binary maupun
    multi-class seperti Skenario 3 dengan 3 kelas).

    PENTING:
    - Hanya diterapkan pada X_train/y_train, dilakukan SETELAH split
      dan SEBELUM tokenisasi.
    - Data validation dan test TIDAK ikut di-oversample, supaya kedua
      set tersebut tetap merepresentasikan distribusi data asli dan
      tidak terjadi data leakage akibat baris duplikat tersebar ke
      luar data train.
    - Class weight untuk Weighted Cross-Entropy Loss dihitung dari
      distribusi train yang ASLI (sebelum fungsi ini dipanggil), bukan
      dari hasil oversampling, supaya weighted loss tetap punya efek
      yang berarti di atas data yang sudah di-oversample (lihat
      compute_class_weights_tensor).

    Parameters
    ----------
    X_train : list[str]
        Teks tweet hasil preprocessing, khusus data train.
    y_train : array-like
        Label hasil encoding (angka), khusus data train.
    class_names : list[str]
        Nama kelas asli, urutan sesuai LabelEncoder (le.classes_),
        untuk keperluan logging yang mudah dibaca.
    random_state : int
        Seed, supaya hasil oversampling reproducible.

    Returns
    -------
    tuple(list[str], np.ndarray)
        X_train dan y_train baru yang sudah seimbang di semua kelas.
    """
    y_train = np.array(y_train)
    df_train = pd.DataFrame({"text": X_train, "label": y_train})

    counts       = df_train["label"].value_counts()
    majority_lbl = counts.idxmax()
    majority_n   = int(counts.max())

    print(f"\nPenanganan Imbalance: Random Oversampling (data-level)")
    print(f"   {'Kelas':<12} {'Sebelum':>12}")
    for idx, cname in enumerate(class_names):
        jumlah = int((y_train == idx).sum())
        print(f"   {cname:<12} {jumlah:>12,}")

    frames = []
    for lbl, group in df_train.groupby("label"):
        if lbl == majority_lbl:
            frames.append(group)
        else:
            group_upsampled = resample(
                group,
                replace      = True,
                n_samples    = majority_n,
                random_state = random_state,
            )
            frames.append(group_upsampled)

    # Shuffle supaya baris hasil duplikasi tidak menumpuk berurutan
    df_balanced = pd.concat(frames).sample(
        frac=1, random_state=random_state
    ).reset_index(drop=True)

    print(f"\n   Distribusi setelah oversampling:")
    for idx, cname in enumerate(class_names):
        jumlah = int((df_balanced["label"] == idx).sum())
        pct    = jumlah / len(df_balanced) * 100
        print(f"   {cname:<12} {jumlah:>12,} ({pct:5.1f}%)")

    return df_balanced["text"].tolist(), df_balanced["label"].to_numpy()


# ══════════════════════════════════════════════════════════════
#  HELPER: HITUNG CLASS WEIGHT (PENANGANAN IMBALANCE - ALGORITHM LEVEL)
# ══════════════════════════════════════════════════════════════
def compute_class_weights_tensor(y_train, class_names, device):
    """
    Menghitung bobot kelas untuk menangani imbalance pada fine-tuning
    IndoBERTweet menggunakan skema WEIGHTED CROSS-ENTROPY LOSS.

    Berlaku untuk multi-class (3 kelas pada Skenario 3): bobot dihitung
    untuk setiap kelas relatif terhadap jumlah sampelnya masing-masing,
    bukan hanya 1 pasang kelas minoritas-mayoritas seperti pada kasus
    binary.

    CATATAN PENTING (konteks hybrid dengan Random Oversampling):
    ---------------------------------------------------------------
    Fungsi ini HARUS dipanggil dengan y_train ASLI (SEBELUM
    random_oversample_train dijalankan). Jika dipanggil sesudah
    oversampling, distribusi kelas sudah rata sehingga bobot yang
    dihasilkan akan mendekati sama rata untuk semua kelas -- artinya
    weighted loss tidak lagi memberi efek apa pun, dan penanganan
    imbalance yang sebenarnya bekerja hanya oversampling saja.

    Rumus (skema "balanced", mengikuti sklearn):
        weight_kelas_c = n_total_sample / (n_kelas x n_sample_kelas_c)

    PENTING: bobot dihitung HANYA dari y_train (bukan seluruh dataset),
    supaya tidak terjadi data leakage dari data validasi/uji ke dalam
    proses training.

    Parameters
    ----------
    y_train : array-like
        Label hasil encoding (angka) untuk data TRAIN ASLI (sebelum
        oversampling).
    class_names : list[str]
        Nama kelas asli, urutan harus sesuai dengan LabelEncoder
        (le.classes_), untuk keperluan logging yang mudah dibaca.
    device : torch.device
        Device tempat tensor bobot akan ditempatkan (harus sama
        dengan device model, kalau tidak akan error saat forward pass).

    Returns
    -------
    torch.Tensor
        Tensor bobot kelas, siap dipakai di nn.CrossEntropyLoss(weight=...).
    """
    class_weights = compute_class_weight(
        class_weight = "balanced",
        classes      = np.unique(y_train),
        y            = y_train,
    )

    print(f"\nPenanganan Imbalance: Weighted Cross-Entropy Loss (algorithm-level)")
    print(f"   Dihitung dari distribusi TRAIN ASLI (sebelum oversampling)")
    print(f"   {'Kelas':<12} {'Jumlah (train asli)':>20} {'Class Weight':>14}")
    for idx, cname in enumerate(class_names):
        jumlah = int((y_train == idx).sum())
        print(f"   {cname:<12} {jumlah:>20,} {class_weights[idx]:>14.4f}")

    weights_tensor = torch.tensor(class_weights, dtype=torch.float32).to(device)
    return weights_tensor


# ══════════════════════════════════════════════════════════════
#  HELPER: SATU EPOCH TRAINING (dengan weighted loss)
# ══════════════════════════════════════════════════════════════
def train_epoch(model, dataloader, optimizer, scheduler, device, loss_fn):
    """
    Menjalankan satu epoch training.

    Loss dihitung manual pakai `loss_fn` (weighted CrossEntropyLoss,
    dengan bobot untuk ketiga kelas) terhadap outputs.logits. Model
    dipanggil TANPA argumen `labels`, supaya model hanya mengembalikan
    logits mentah -- loss sepenuhnya dikontrol sendiri lewat loss_fn
    yang sudah diberi bobot kelas.
    """
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
        )
        logits = outputs.logits

        loss = loss_fn(logits, labels)

        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        scheduler.step()

        preds          = torch.argmax(logits, dim=1)
        total_correct += (preds == labels).sum().item()
        total_loss    += loss.item() * len(labels)
        total_samples += len(labels)

    return total_loss / total_samples, total_correct / total_samples


# ══════════════════════════════════════════════════════════════
#  HELPER: EVALUASI (VAL / TEST)
# ══════════════════════════════════════════════════════════════
def evaluate_epoch(model, dataloader, device, loss_fn):
    """
    Evaluasi model pada data validasi/uji (multi-class, 3 kelas).

    Loss validasi TETAP dihitung pakai `loss_fn` yang sama (weighted)
    dengan training, supaya angka val_loss yang dipakai untuk memilih
    'best_model.bin' konsisten dengan loss yang benar-benar dioptimasi
    selama training.

    Macro F1 dan Weighted F1 dipakai sebagai metrik utama (bukan F1
    binary), karena Skenario 3 memiliki 3 kelas sekaligus.

    Data validasi/uji TIDAK di-oversample -- tetap memakai distribusi
    asli, sehingga hasil evaluasi mencerminkan performa model pada
    kondisi data yang sebenarnya (bukan data yang sudah diseimbangkan).
    """
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
            )
            logits = outputs.logits
            loss   = loss_fn(logits, labels)

            preds = torch.argmax(logits, dim=1)

            total_correct  += (preds == labels).sum().item()
            total_loss     += loss.item() * len(labels)
            total_samples  += len(labels)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    avg_loss = total_loss / total_samples
    accuracy = total_correct / total_samples

    macro_f1 = f1_score(
        all_labels, all_preds,
        average       = "macro",
        zero_division = 0,
    )

    weighted_f1 = f1_score(
        all_labels, all_preds,
        average       = "weighted",
        zero_division = 0,
    )

    return avg_loss, accuracy, macro_f1, weighted_f1


# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════
def main():
    total_start_time = time.time()

    print("=" * 62)
    print("  FINE-TUNING IndoBERTweet - 3 CLASS (SKENARIO 3)")
    print("  HYBRID IMBALANCE HANDLING")
    print("=" * 62)
    print(f"\nInput  : {INPUT_FILE}")
    print(f"Output : {OUTPUT_DIR}\n")

    # -- 1. Load dataset --
    df = pd.read_csv(INPUT_FILE, dtype=str).fillna("")

    # hanya buang teks kosong
    df = df[df["tweet_preprocessed_dl"].str.strip() != ""].copy()

    # normalisasi label
    df["sentiment"] = df["sentiment"].astype(str).str.lower().str.strip()

    # pakai 3 kelas: negatif, netral, positif
    df = df[df["sentiment"].isin(["negatif", "netral", "positif"])].reset_index(drop=True)

    print(f"Dataset dimuat : {len(df):,} baris")

    print(f"\nDistribusi label (final, sebelum oversampling):")
    dist = df["sentiment"].value_counts()
    for label, count in dist.items():
        pct = count / len(df) * 100
        bar = "#" * int(pct / 4)
        print(f"   {label:<12} {count:>6,} ({pct:5.1f}%)  {bar}")

    # -- Encode label --
    le = LabelEncoder()
    y  = le.fit_transform(df["sentiment"])
    X  = df["tweet_preprocessed_dl"].tolist()

    print(f"\nLabel encoding:")
    for cls, idx in zip(le.classes_, range(len(le.classes_))):
        print(f"   {cls:<12} -> {idx}")

    # -- 2. Split 80 / 10 / 10 --
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

    print(f"\nSplit data (80/10/10):")
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

    # -- Setup device --
    device      = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    device_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    print(f"\nDevice: {device_name}")

    # -- 2b. Hitung class weight dari TRAIN ASLI (SEBELUM oversampling) --
    # Urutan ini disengaja: kalau dihitung SESUDAH oversampling, distribusi
    # sudah rata sehingga bobot mendekati sama rata dan weighted loss tidak
    # lagi berkontribusi. Dihitung dari y_train SAJA (bukan y penuh) supaya
    # tidak ada data leakage dari val/test set ke dalam bobot training.
    class_weights_tensor = compute_class_weights_tensor(
        y_train     = np.array(y_train),
        class_names = list(le.classes_),
        device      = device,
    )
    loss_fn = nn.CrossEntropyLoss(weight=class_weights_tensor)

    n_train_before_oversampling = len(X_train)

    # -- 2c. Random Oversampling (PENANGANAN IMBALANCE - DATA LEVEL) --
    # Hanya diterapkan ke X_train/y_train, val & test tetap distribusi asli.
    # Untuk 3 kelas, seluruh kelas yang bukan mayoritas akan di-oversample
    # hingga jumlahnya sama dengan kelas dengan sampel terbanyak.
    X_train, y_train = random_oversample_train(
        X_train, y_train,
        class_names  = list(le.classes_),
        random_state = RANDOM_SEED,
    )

    print(f"\nTrain sebelum oversampling : {n_train_before_oversampling:,} baris")
    print(f"Train sesudah oversampling : {len(X_train):,} baris")

    # -- 3. Load tokenizer & model --
    print(f"\nLoading tokenizer & model: {MODEL_NAME}")
    load_model_start = time.time()

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    # penting: mapping label 3 kelas
    id2label = {i: label for i, label in enumerate(le.classes_)}
    label2id = {label: i for i, label in id2label.items()}

    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels = len(le.classes_),
        id2label   = id2label,
        label2id   = label2id,
    )
    model.to(device)

    tokenizer.save_pretrained(OUTPUT_DIR / "tokenizer")
    load_model_time = time.time() - load_model_start

    print(f"Model loaded")
    print(f"   Runtime loading : {load_model_time:.2f} detik")

    # -- DataLoader --
    train_dataset = TweetDataset(X_train, y_train, tokenizer, MAX_LENGTH)
    val_dataset   = TweetDataset(X_val,   y_val,   tokenizer, MAX_LENGTH)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0)
    val_loader   = DataLoader(val_dataset,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # -- Optimizer & Scheduler --
    optimizer    = AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)
    total_steps  = len(train_loader) * EPOCHS
    warmup_steps = int(total_steps * WARMUP_RATIO)

    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps   = warmup_steps,
        num_training_steps = total_steps,
    )

    print(f"Model siap | Total steps: {total_steps:,} | Warmup: {warmup_steps:,}")

    # -- 4. Training loop --
    print(f"\nMulai fine-tuning ({EPOCHS} epoch)...\n")
    print(f"{'-'*62}")

    best_val_loss = float("inf")
    best_epoch    = 0
    train_log     = []

    training_start_time = time.time()

    for epoch in range(1, EPOCHS + 1):
        epoch_start_time = time.time()

        print(f"\n  Epoch {epoch}/{EPOCHS}")

        train_loss, train_acc = train_epoch(
            model, train_loader, optimizer, scheduler, device, loss_fn
        )

        val_loss, val_acc, val_f1_macro, val_f1_weighted = evaluate_epoch(
            model, val_loader, device, loss_fn
        )

        epoch_runtime = time.time() - epoch_start_time

        train_log.append({
            "epoch"           : epoch,
            "train_loss"      : round(train_loss, 5),
            "train_acc"       : round(train_acc,  4),
            "val_loss"        : round(val_loss,   5),
            "val_acc"         : round(val_acc,    4),
            "val_f1_macro"    : round(val_f1_macro, 4),
            "val_f1_weighted" : round(val_f1_weighted, 4),
            "runtime_sec"     : round(epoch_runtime, 2),
        })

        print(f"   Train  -> loss: {train_loss:.4f} | acc: {train_acc:.4f}")
        print(
            f"   Val    -> loss: {val_loss:.4f} | acc: {val_acc:.4f} | "
            f"f1_macro: {val_f1_macro:.4f} | f1_weighted: {val_f1_weighted:.4f}"
        )
        print(f"   Runtime epoch : {epoch_runtime:.2f} detik")

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_epoch    = epoch
            torch.save(model.state_dict(), OUTPUT_DIR / "best_model.bin")
            model.config.save_pretrained(OUTPUT_DIR)
            print(f"   Checkpoint disimpan (val_loss: {val_loss:.4f})")
        else:
            print(f"   -- Tidak ada peningkatan (best epoch: {best_epoch})")

    training_runtime = time.time() - training_start_time
    total_runtime    = time.time() - total_start_time

    pd.DataFrame(train_log).to_csv(OUTPUT_DIR / "train_log.csv", index=False)
    joblib.dump(le, OUTPUT_DIR / "label_encoder.joblib")

    class_weight_info = "\n".join(
        f"    {cname:<10}: {class_weights_tensor[idx].item():.4f}"
        for idx, cname in enumerate(le.classes_)
    )

    info = f"""TRAINING INFO - IndoBERTweet Fine-tuning (3 Class - Skenario 3)
=====================================
Tanggal          : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Model pretrained : {MODEL_NAME}
Input file       : {INPUT_FILE.name}
Total data       : {len(df):,}
Kelas            : {list(le.classes_)}  <- negatif, netral, positif

Split:
  Train (asli)                 : {n_train_before_oversampling:,}
  Train (setelah oversampling) : {len(X_train):,}
  Validation                   : {len(X_val):,}
  Test                         : {len(X_test):,}

Penanganan Imbalance (HYBRID):
  1. Data-level      : Random Oversampling
                        Setiap kelas yang jumlahnya lebih sedikit dari
                        kelas dengan sampel terbanyak diduplikasi
                        (with replacement) hingga seimbang. Diterapkan
                        hanya pada data train, setelah split, sebelum
                        tokenisasi. Val & test tidak diubah.
  2. Algorithm-level : Weighted Cross-Entropy Loss
                        Class weight dihitung dari distribusi TRAIN ASLI
                        (sebelum oversampling), skema "balanced":
{class_weight_info}

Hyperparameter:
  max_length     : {MAX_LENGTH}
  batch_size     : {BATCH_SIZE}
  epochs         : {EPOCHS}
  learning_rate  : {LEARNING_RATE}
  warmup_ratio   : {WARMUP_RATIO}
  weight_decay   : {WEIGHT_DECAY}
  random_seed    : {RANDOM_SEED}
  optimizer      : AdamW
  gradient_clip  : 1.0

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
    print(f"  Fine-tuning selesai!")
    print(f"  Best epoch : {best_epoch} (val_loss: {best_val_loss:.4f})")
    print(f"{'='*62}")
    print(f"  best_model.bin")
    print(f"  tokenizer/")
    print(f"  train_log.csv")
    print(f"  train_info.txt")
    print(f"{'='*62}")
    print(f"\n  -> Lanjut ke: python devEvaluasiDL.py")


if __name__ == "__main__":
    main()