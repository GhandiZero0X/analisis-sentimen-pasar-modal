# services/development/devEvaluasiML_s3.py
"""
=============================================================
STEP 3b: EVALUASI MODEL SVM (SKENARIO 3)
=============================================================
Tahapan evaluasi:
  a. Confusion Matrix → Accuracy, Precision, Recall, F1-score
  b. AUC-ROC          → One-vs-Rest untuk 3 kelas
  c. Simpan metrics ke CSV (1 baris saja)

Catatan:
  Model dilatih dengan 3 kelas: negatif, netral, positif
  → AUC-ROC menggunakan One-vs-Rest (bukan binary)
  → y_score dari decision_function berbentuk 2D (n_samples, 3)
  → F1 menggunakan average="macro"

Input  : dev_database/4_model/S3/ml/all_periods/
         svm_model.joblib
         label_encoder.joblib
         X_test.joblib
         y_test.joblib

Output : dev_database/4_model/S3/ml/all_periods/
         confusion_matrix_svm.png
         roc_curve_svm.png
         evaluation_metrics.csv
         classification_report_svm.txt
         evaluation_info.txt
=============================================================
"""

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import time
from pathlib import Path
from datetime import datetime

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_curve,
    auc,
    roc_auc_score,
    precision_recall_fscore_support
)
from sklearn.preprocessing import label_binarize

# ══════════════════════════════════════════════════════════════
#  PATH CONFIGURATION
#  ✅ S3 — 3 kelas (negatif, netral, positif)
# ══════════════════════════════════════════════════════════════
BASE_DIR  = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "dev_database" / "4_model" / "S3" / "ml" / "all_periods"

MODEL_FILE      = MODEL_DIR / "svm_model.joblib"
ENCODER_FILE    = MODEL_DIR / "label_encoder.joblib"
X_TEST_FILE     = MODEL_DIR / "X_test.joblib"
Y_TEST_FILE     = MODEL_DIR / "y_test.joblib"

CM_FILE         = MODEL_DIR / "confusion_matrix_svm.png"
ROC_FILE        = MODEL_DIR / "roc_curve_svm.png"
METRIC_CSV_FILE = MODEL_DIR / "evaluation_metrics.csv"
REPORT_FILE     = MODEL_DIR / "classification_report_svm.txt"
EVAL_INFO_FILE  = MODEL_DIR / "evaluation_info.txt"

# ══════════════════════════════════════════════════════════════
#  TIMER
# ══════════════════════════════════════════════════════════════
script_start_time = time.time()

# ══════════════════════════════════════════════════════════════
#  LOAD ARTEFAK
# ══════════════════════════════════════════════════════════════
print("=" * 60)
print("  EVALUASI SVM — Confusion Matrix & AUC-ROC (3 Kelas)")
print("  Skenario 3: negatif · netral · positif")
print("=" * 60)

for f in [MODEL_FILE, ENCODER_FILE, X_TEST_FILE, Y_TEST_FILE]:
    if not f.exists():
        raise FileNotFoundError(
            f"File tidak ditemukan: {f}\n"
            "Jalankan devModellingML.py (Skenario 3) terlebih dahulu."
        )

load_start_time = time.time()

model  = joblib.load(MODEL_FILE)
le     = joblib.load(ENCODER_FILE)
X_test = joblib.load(X_TEST_FILE)
y_test = joblib.load(Y_TEST_FILE)

load_time = time.time() - load_start_time

class_names = list(le.classes_)   # ['negatif', 'netral', 'positif']
n_classes   = len(class_names)     # 3

# Validasi memang 3 kelas
if n_classes != 3:
    raise ValueError(
        f"Skenario 3 membutuhkan 3 kelas, ditemukan: {class_names}\n"
        "Pastikan model yang diload adalah hasil training Skenario 3."
    )

print(f"✅ Model & data test dimuat")
print(f"   Kelas    : {class_names}")
print(f"   Test set : {X_test.shape[0]:,} baris")
print(f"   Runtime load model : {load_time:.2f} detik\n")

# ══════════════════════════════════════════════════════════════
#  PREDIKSI
# ══════════════════════════════════════════════════════════════
predict_start_time = time.time()

y_pred = model.predict(X_test)
y_score = model.decision_function(X_test)   # shape: (n_samples, 3)

predict_time = time.time() - predict_start_time

# ══════════════════════════════════════════════════════════════
#  a. CONFUSION MATRIX + CLASSIFICATION REPORT
# ══════════════════════════════════════════════════════════════
print("─" * 60)
print("  a. CONFUSION MATRIX & CLASSIFICATION REPORT")
print("─" * 60)

acc = accuracy_score(y_test, y_pred)

report = classification_report(
    y_test,
    y_pred,
    target_names=class_names,
    digits=4,
    zero_division=0,
)

print(f"\n  Accuracy : {acc:.4f}\n")
print(report)

# Per-class metrics
precision_per_class, recall_per_class, f1_per_class, support = (
    precision_recall_fscore_support(
        y_test,
        y_pred,
        average=None,
        labels=list(range(n_classes)),
        zero_division=0,
    )
)

# Macro metrics untuk multiclass
macro_precision = precision_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0,
)

macro_recall = recall_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0,
)

macro_f1 = f1_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0,
)

# ── Plot Confusion Matrix ──
cm_start_time = time.time()
cm = confusion_matrix(y_test, y_pred)

fig, ax = plt.subplots(figsize=(7, 6))
sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=[c.capitalize() for c in class_names],
    yticklabels=[c.capitalize() for c in class_names],
    linewidths=0.5,
    ax=ax,
)

ax.set_xlabel("Prediksi", fontsize=12, labelpad=10)
ax.set_ylabel("Aktual", fontsize=12, labelpad=10)
ax.set_title(
    f"Confusion Matrix — SVM LinearSVC (S3)\nAccuracy: {acc:.4f}",
    fontsize=13,
    pad=15,
)

for i in range(n_classes):
    for j in range(n_classes):
        pct = cm[i, j] / cm[i].sum() * 100 if cm[i].sum() > 0 else 0
        ax.text(
            j + 0.5,
            i + 0.7,
            f"({pct:.1f}%)",
            ha="center",
            va="center",
            fontsize=8,
            color="gray",
        )

plt.tight_layout()
plt.savefig(CM_FILE, dpi=150, bbox_inches="tight")
plt.close()
print(f"✅ Confusion matrix disimpan : {CM_FILE.name}")

cm_plot_time = time.time() - cm_start_time

# ══════════════════════════════════════════════════════════════
#  b. AUC-ROC — ONE-VS-REST (3 kelas)
# ══════════════════════════════════════════════════════════════
print("\n" + "─" * 60)
print("  b. AUC-ROC (One-vs-Rest, 3 kelas)")
print("─" * 60)

roc_start_time = time.time()

y_test_bin = label_binarize(y_test, classes=list(range(n_classes)))

colors = ["#e74c3c", "#3498db", "#2ecc71"]
auc_scores = {}

fig, ax = plt.subplots(figsize=(7, 6))

for i, (cls, color) in enumerate(zip(class_names, colors)):
    fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_score[:, i])
    roc_auc_cls = auc(fpr, tpr)
    auc_scores[cls] = roc_auc_cls
    ax.plot(
        fpr,
        tpr,
        color=color,
        lw=2,
        label=f"{cls.capitalize()} (AUC = {roc_auc_cls:.4f})",
    )

ax.plot([0, 1], [0, 1], "k--", lw=1.5, label="Random Classifier")

macro_auc = roc_auc_score(
    y_test_bin,
    y_score,
    average="macro",
    multi_class="ovr",
)

ax.set_title(
    f"ROC Curve — SVM LinearSVC (S3)\nMacro AUC = {macro_auc:.4f}",
    fontsize=13,
)
ax.set_xlabel("False Positive Rate (FPR)", fontsize=12)
ax.set_ylabel("True Positive Rate (TPR)", fontsize=12)
ax.set_xlim([0.0, 1.0])
ax.set_ylim([0.0, 1.05])
ax.legend(loc="lower right", fontsize=10)
ax.grid(alpha=0.3)

plt.tight_layout()
plt.savefig(ROC_FILE, dpi=150, bbox_inches="tight")
plt.close()

print(f"\n  AUC per kelas (One-vs-Rest):")
for cls, score in auc_scores.items():
    print(f"   {cls:<12} : {score:.4f}")
print(f"   {'Macro AUC':<12} : {macro_auc:.4f}")
print(f"\n✅ ROC curve disimpan        : {ROC_FILE.name}")

roc_plot_time = time.time() - roc_start_time

# ══════════════════════════════════════════════════════════════
#  SIMPAN METRICS KE CSV — 1 BARIS SAJA
# ══════════════════════════════════════════════════════════════
metrics_df = pd.DataFrame([{
    "accuracy": acc,
    "precision": macro_precision,
    "recall": macro_recall,
    "f1_score": macro_f1,
    "auc_roc": macro_auc,
}])

metrics_df.to_csv(METRIC_CSV_FILE, index=False, encoding="utf-8-sig")
print(f"✅ Metrics CSV disimpan      : {METRIC_CSV_FILE.name}")

# ══════════════════════════════════════════════════════════════
#  SIMPAN LAPORAN TEKS
# ══════════════════════════════════════════════════════════════
total_eval_time = time.time() - script_start_time

report_text = f"""EVALUATION REPORT — SVM LinearSVC (Skenario 3 — 3 Kelas)
==========================================================
Tanggal     : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Skenario    : 3 (negatif · netral · positif)
Test set    : {X_test.shape[0]:,} baris
Kelas       : {class_names}

ACCURACY
--------
{acc:.4f}

CLASSIFICATION REPORT
---------------------
{report}

MACRO METRICS
-------------
precision: {macro_precision:.4f}
recall   : {macro_recall:.4f}
f1       : {macro_f1:.4f}

AUC-ROC (One-vs-Rest)
---------------------
"""
for cls, score in auc_scores.items():
    report_text += f"  {cls:<12} : {score:.4f}\n"
report_text += f"  {'Macro AUC':<12} : {macro_auc:.4f}\n"

report_text += f"""
RUNTIME
-------
  Load model    : {load_time:.2f} detik
  Predict       : {predict_time:.2f} detik
  Plot CM       : {cm_plot_time:.2f} detik
  Plot ROC      : {roc_plot_time:.2f} detik
  Total runtime : {total_eval_time:.2f} detik
"""

REPORT_FILE.write_text(report_text.strip(), encoding="utf-8")
print(f"✅ Laporan disimpan          : {REPORT_FILE.name}")

eval_info = f"""EVALUATION INFO — SVM LinearSVC (Skenario 3)
=============================================
Tanggal        : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Skenario       : 3 (negatif · netral · positif)
Test set       : {X_test.shape[0]:,} baris
Accuracy       : {acc:.4f}
Precision      : {macro_precision:.4f}
Recall         : {macro_recall:.4f}
F1-score       : {macro_f1:.4f}
AUC-ROC        : {macro_auc:.4f}

AUC per kelas:
"""
for cls, score in auc_scores.items():
    eval_info += f"  {cls:<12} : {score:.4f}\n"

eval_info += f"""
Runtime:
  Load model    : {load_time:.2f} detik
  Predict       : {predict_time:.2f} detik
  Plot CM       : {cm_plot_time:.2f} detik
  Plot ROC      : {roc_plot_time:.2f} detik
  Total runtime : {total_eval_time:.2f} detik
"""
EVAL_INFO_FILE.write_text(eval_info.strip(), encoding="utf-8")

# ══════════════════════════════════════════════════════════════
#  RINGKASAN AKHIR
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*60}")
print("  ✅ Evaluasi selesai! (Skenario 3 — 3 Kelas)")
print(f"{'='*60}")
print(f"  📊 Accuracy   : {acc:.4f}")
print(f"  📊 Precision  : {macro_precision:.4f}")
print(f"  📊 Recall     : {macro_recall:.4f}")
print(f"  📊 F1-score   : {macro_f1:.4f}")
print(f"  📈 AUC-ROC    : {macro_auc:.4f}")

print(f"\n  AUC per kelas:")
for cls, score in auc_scores.items():
    print(f"   {cls:<12} : {score:.4f}")

print(f"  ⏱ Load model  : {load_time:.2f} detik")
print(f"  ⏱ Predict     : {predict_time:.2f} detik")
print(f"  ⏱ Plot CM     : {cm_plot_time:.2f} detik")
print(f"  ⏱ Plot ROC    : {roc_plot_time:.2f} detik")
print(f"  ⏱ Total eval  : {total_eval_time:.2f} detik")

print(f"\n  🖼  {CM_FILE.name}")
print(f"  🖼  {ROC_FILE.name}")
print(f"  📄  {METRIC_CSV_FILE.name}")
print(f"  📄  {REPORT_FILE.name}")
print(f"  📄  {EVAL_INFO_FILE.name}")
print(f"{'='*60}")