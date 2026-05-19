# services/development/devEvaluasiDL.py
"""
=============================================================
STEP 4b: EVALUASI MODEL IndoBERTweet (SKENARIO 2)
=============================================================
Tahapan evaluasi:
  a. Confusion Matrix
     - Accuracy   : ketepatan keseluruhan
     - Precision  : ketepatan per kelas
     - Recall     : kemampuan temukan data benar per kelas
     - F1-score   : keseimbangan precision & recall (binary)
  b. Plot training curve (loss & accuracy per epoch)

Catatan:
  Model dilatih hanya dengan 2 kelas: positif & negatif (tanpa netral)
  → F1 menggunakan average="binary" (bukan macro)

Input  : dev_database/4_model/S2/dl/covid/    ← ✅ S2, covid
         best_model.bin
         config.json
         tokenizer/
         label_encoder.joblib
         split_indices.joblib
         train_log.csv

Output : dev_database/4_model/S2/dl/covid/
         confusion_matrix_indobertweet.png
         training_curve_indobertweet.png
         classification_report_indobertweet.txt
         evaluation_info.txt
=============================================================
"""

import joblib
import numpy as np
import pandas as pd
import torch
import time
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
from pathlib import Path
from datetime import datetime
from torch.utils.data import Dataset, DataLoader
from tqdm import tqdm

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_recall_fscore_support,
    f1_score,
)
from transformers import (
    AutoConfig,
    AutoTokenizer,
    AutoModelForSequenceClassification,
)

# ══════════════════════════════════════════════════════════════
#  PATH CONFIGURATION
#  ✅ S2 — binary (positif & negatif), periode covid
# ══════════════════════════════════════════════════════════════
BASE_DIR  = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "dev_database" / "4_model" / "S2" / "dl" / "after"

MODEL_BIN_FILE = MODEL_DIR / "best_model.bin"
TOKENIZER_DIR  = MODEL_DIR / "tokenizer"
ENCODER_FILE   = MODEL_DIR / "label_encoder.joblib"
SPLIT_FILE     = MODEL_DIR / "split_indices.joblib"
TRAIN_LOG_FILE = MODEL_DIR / "train_log.csv"

CM_FILE        = MODEL_DIR / "confusion_matrix_indobertweet.png"
CURVE_FILE     = MODEL_DIR / "training_curve_indobertweet.png"
REPORT_FILE    = MODEL_DIR / "classification_report_indobertweet.txt"
EVAL_INFO_FILE = MODEL_DIR / "evaluation_info.txt"

MAX_LENGTH = 128
BATCH_SIZE = 16

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
#  LOAD ARTEFAK
# ══════════════════════════════════════════════════════════════
script_start_time = time.time()

print("=" * 62)
print("  EVALUASI IndoBERTweet — Confusion Matrix & Training Curve")
print("  Skenario 2: positif & negatif (tanpa netral)")
print("=" * 62)

for f in [MODEL_BIN_FILE, ENCODER_FILE, SPLIT_FILE]:
    if not f.exists():
        raise FileNotFoundError(
            f"\nFile tidak ditemukan: {f}\n"
            "Pastikan sudah menjalankan devModellingDL.py (S2) terlebih dahulu."
        )

load_start_time = time.time()

le         = joblib.load(ENCODER_FILE)
split_data = joblib.load(SPLIT_FILE)
X_test     = split_data["X_test"]
y_test     = split_data["y_test"]

class_names = list(le.classes_)   # ['negatif', 'positif']
n_classes   = len(class_names)    # 2

# Validasi memang 2 kelas
if n_classes != 2:
    raise ValueError(
        f"Skenario 2 membutuhkan 2 kelas, ditemukan: {class_names}\n"
        "Pastikan model yang diload adalah hasil training Skenario 2."
    )

pos_label = list(le.classes_).index("positif")   # → 1

print(f"✅ Artefak dimuat")
print(f"   Kelas     : {class_names}")
print(f"   Pos label : positif (idx={pos_label})")
print(f"   Test set  : {len(X_test):,} baris\n")

# ── Setup device ──
device      = torch.device("cuda" if torch.cuda.is_available() else "cpu")
device_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
print(f"🖥️  Device: {device_name}")

# ── Load tokenizer ──
print(f"⬇️  Loading tokenizer dari : {TOKENIZER_DIR}")
tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_DIR)

# ── Load model ──
# from_pretrained(folder) hanya mencari pytorch_model.bin / model.safetensors
# Solusi: load arsitektur dari config.json, bobot manual dari best_model.bin
print(f"⬇️  Loading model dari      : {MODEL_BIN_FILE}")
config = AutoConfig.from_pretrained(MODEL_DIR, num_labels=n_classes)
model  = AutoModelForSequenceClassification.from_config(config)
state_dict = torch.load(MODEL_BIN_FILE, map_location=device)
model.load_state_dict(state_dict, strict=True)
model.to(device)
model.eval()
print(f"✅ Model berhasil di-load\n")

load_time = time.time() - load_start_time

# ══════════════════════════════════════════════════════════════
#  INFERENSI PADA TEST SET
# ══════════════════════════════════════════════════════════════
infer_start_time = time.time()

test_dataset = TweetDataset(X_test, y_test, tokenizer, MAX_LENGTH)
test_loader  = DataLoader(
    test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0
)

all_preds  = []
all_labels = []

print("🔍 Inferensi pada test set...")
with torch.no_grad():
    for batch in tqdm(test_loader, desc="   Test", ncols=75):
        input_ids      = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        labels         = batch["label"].to(device)

        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        preds   = torch.argmax(outputs.logits, dim=1)

        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

all_preds  = np.array(all_preds)
all_labels = np.array(all_labels)

infer_time = time.time() - infer_start_time

# ══════════════════════════════════════════════════════════════
#  a. CONFUSION MATRIX + CLASSIFICATION REPORT
# ══════════════════════════════════════════════════════════════
print("\n" + "─" * 62)
print("  a. CONFUSION MATRIX & CLASSIFICATION REPORT")
print("─" * 62)

acc    = accuracy_score(all_labels, all_preds)
report = classification_report(
    all_labels, all_preds,
    target_names = class_names,
    digits       = 4,
)

print(f"\n  Accuracy : {acc:.4f}\n")
print(report)

# Per-class metrics
precision, recall, f1, support = precision_recall_fscore_support(
    all_labels, all_preds,
    average = None,
    labels  = list(range(n_classes)),
)

# ✅ Binary F1 — sesuai 2 kelas
binary_f1 = f1_score(
    all_labels, all_preds,
    average       = "binary",
    pos_label     = pos_label,
    zero_division = 0,
)

# ── Plot Confusion Matrix ──
cm_plot_start = time.time()
cm = confusion_matrix(all_labels, all_preds)

fig, ax = plt.subplots(figsize=(6, 5))
sns.heatmap(
    cm,
    annot       = True,
    fmt         = "d",
    cmap        = "Blues",
    xticklabels = [c.capitalize() for c in class_names],
    yticklabels = [c.capitalize() for c in class_names],
    linewidths  = 0.5,
    ax          = ax,
)
ax.set_xlabel("Prediksi", fontsize=12, labelpad=10)
ax.set_ylabel("Aktual",   fontsize=12, labelpad=10)
ax.set_title(
    f"Confusion Matrix — IndoBERTweet (S2)\nAccuracy: {acc:.4f}",
    fontsize=13, pad=15
)

for i in range(n_classes):
    for j in range(n_classes):
        pct = cm[i, j] / cm[i].sum() * 100 if cm[i].sum() > 0 else 0
        ax.text(j + 0.5, i + 0.72, f"({pct:.1f}%)",
                ha="center", va="center", fontsize=8, color="gray")

plt.tight_layout()
plt.savefig(CM_FILE, dpi=150, bbox_inches="tight")
plt.close()
print(f"✅ Confusion matrix disimpan : {CM_FILE.name}")

cm_plot_time = time.time() - cm_plot_start

# ══════════════════════════════════════════════════════════════
#  b. TRAINING CURVE
# ══════════════════════════════════════════════════════════════
print("\n" + "─" * 62)
print("  b. TRAINING CURVE")
print("─" * 62)

curve_start_time = time.time()

if TRAIN_LOG_FILE.exists():
    log_df = pd.read_csv(TRAIN_LOG_FILE)

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    fig.suptitle("Training Curve — IndoBERTweet (S2)", fontsize=13)

    # Plot Loss
    axes[0].plot(log_df["epoch"], log_df["train_loss"],
                 "o-",  color="#3498db", label="Train Loss", linewidth=2)
    axes[0].plot(log_df["epoch"], log_df["val_loss"],
                 "s--", color="#e74c3c", label="Val Loss",   linewidth=2)
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Loss")
    axes[0].set_title("Loss per Epoch")
    axes[0].legend()
    axes[0].grid(alpha=0.3)
    axes[0].xaxis.set_major_locator(mticker.MaxNLocator(integer=True))

    # Plot Accuracy & F1
    axes[1].plot(log_df["epoch"], log_df["train_acc"],
                 "o-",  color="#3498db", label="Train Acc",      linewidth=2)
    axes[1].plot(log_df["epoch"], log_df["val_acc"],
                 "s--", color="#e74c3c", label="Val Acc",        linewidth=2)
    # ✅ Label F1 binary
    axes[1].plot(log_df["epoch"], log_df["val_f1"],
                 "^:",  color="#2ecc71", label="Val F1-binary",  linewidth=2)
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Score")
    axes[1].set_title("Accuracy & F1 per Epoch")
    axes[1].set_ylim([0, 1.05])
    axes[1].legend()
    axes[1].grid(alpha=0.3)
    axes[1].xaxis.set_major_locator(mticker.MaxNLocator(integer=True))

    plt.tight_layout()
    plt.savefig(CURVE_FILE, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"✅ Training curve disimpan : {CURVE_FILE.name}")
else:
    print(f"⚠️  train_log.csv tidak ditemukan, training curve dilewati")

curve_time = time.time() - curve_start_time

# ══════════════════════════════════════════════════════════════
#  SIMPAN LAPORAN TEKS
# ══════════════════════════════════════════════════════════════
total_eval_time = time.time() - script_start_time

report_text = f"""EVALUATION REPORT — IndoBERTweet (Skenario 2 — Binary)
=======================================================
Tanggal      : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Skenario     : 2 (tanpa kelas netral)
Model        : indolem/indobertweet-base-uncased
Test set     : {len(X_test):,} baris
Kelas        : {class_names}

ACCURACY
--------
{acc:.4f}

CLASSIFICATION REPORT
---------------------
{report}
PER-CLASS DETAIL
----------------
"""
for i, cls in enumerate(class_names):
    report_text += (
        f"  {cls:<12} "
        f"precision: {precision[i]:.4f} | "
        f"recall: {recall[i]:.4f} | "
        f"f1: {f1[i]:.4f} | "
        f"support: {int(support[i])}\n"
    )

report_text += f"""
Binary F1
---------
{binary_f1:.4f}  (pos_label=positif)

RUNTIME
-------
  Load model    : {load_time:.2f} detik
  Inferensi     : {infer_time:.2f} detik
  Plot CM       : {cm_plot_time:.2f} detik
  Plot curve    : {curve_time:.2f} detik
  Total runtime : {total_eval_time:.2f} detik
"""

REPORT_FILE.write_text(report_text.strip(), encoding="utf-8")
print(f"✅ Laporan disimpan        : {REPORT_FILE.name}")

eval_info = f"""EVALUATION INFO — IndoBERTweet (Skenario 2)
============================================
Tanggal        : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Skenario       : 2 (tanpa kelas netral)
Model          : indolem/indobertweet-base-uncased
Test set       : {len(X_test):,} baris
Kelas          : {class_names}
Accuracy       : {acc:.4f}
Binary F1      : {binary_f1:.4f}

Runtime:
  Load model    : {load_time:.2f} detik
  Inferensi     : {infer_time:.2f} detik
  Plot CM       : {cm_plot_time:.2f} detik
  Plot curve    : {curve_time:.2f} detik
  Total runtime : {total_eval_time:.2f} detik
"""
EVAL_INFO_FILE.write_text(eval_info.strip(), encoding="utf-8")

# ══════════════════════════════════════════════════════════════
#  RINGKASAN AKHIR
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*62}")
print(f"  ✅ Evaluasi selesai! (Skenario 2 — Binary)")
print(f"{'='*62}")
print(f"  📊 Accuracy   : {acc:.4f}")
print(f"  📊 Binary F1  : {binary_f1:.4f}")
print(f"  ⏱  Load model : {load_time:.2f} detik")
print(f"  ⏱  Inferensi  : {infer_time:.2f} detik")
print(f"  ⏱  Plot CM    : {cm_plot_time:.2f} detik")
print(f"  ⏱  Plot curve : {curve_time:.2f} detik")
print(f"  ⏱  Total eval : {total_eval_time:.2f} detik")
print(f"\n  Per-kelas:")
for i, cls in enumerate(class_names):
    print(f"   {cls:<12} P:{precision[i]:.4f}  R:{recall[i]:.4f}  F1:{f1[i]:.4f}")
print(f"\n  🖼  {CM_FILE.name}")
print(f"  🖼  {CURVE_FILE.name}")
print(f"  📄  {REPORT_FILE.name}")
print(f"  📄  {EVAL_INFO_FILE.name}")
print(f"{'='*62}")