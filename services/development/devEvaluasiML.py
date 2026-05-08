# dev_database/devEvaluasiML.py
"""
=============================================================
STEP 3b: EVALUASI MODEL SVM
=============================================================
Tahapan evaluasi:
  a. Confusion Matrix → Accuracy, Precision, Recall, F1-score
  b. AUC-ROC          → Binary (positif vs negatif)

Catatan:
  Model hanya dilatih dengan 2 kelas: positif & negatif
  → AUC-ROC menggunakan binary roc_curve (bukan One-vs-Rest)
  → y_score dari decision_function berbentuk 1D (n_samples,)

Input  : dev_database/4_model/ml/covid/
         svm_model.joblib
         label_encoder.joblib
         X_test.joblib
         y_test.joblib

Output : dev_database/4_model/ml/covid/
         confusion_matrix_svm.png
         roc_curve_svm.png
         classification_report_svm.txt
=============================================================
"""

import joblib
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from datetime import datetime

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    roc_curve,
    auc,
)

# ══════════════════════════════════════════════════════════════
#  PATH CONFIGURATION
# ══════════════════════════════════════════════════════════════
BASE_DIR  = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "dev_database" / "4_model" / "ml" / "all_periods"

MODEL_FILE      = MODEL_DIR / "svm_model.joblib"
ENCODER_FILE    = MODEL_DIR / "label_encoder.joblib"
X_TEST_FILE     = MODEL_DIR / "X_test.joblib"
Y_TEST_FILE     = MODEL_DIR / "y_test.joblib"

CM_FILE         = MODEL_DIR / "confusion_matrix_svm.png"
ROC_FILE        = MODEL_DIR / "roc_curve_svm.png"
REPORT_FILE     = MODEL_DIR / "classification_report_svm.txt"

# ══════════════════════════════════════════════════════════════
#  LOAD ARTEFAK
# ══════════════════════════════════════════════════════════════
print("=" * 60)
print("  EVALUASI SVM — Confusion Matrix & AUC-ROC (Binary)")
print("=" * 60)

for f in [MODEL_FILE, ENCODER_FILE, X_TEST_FILE, Y_TEST_FILE]:
    if not f.exists():
        raise FileNotFoundError(
            f"File tidak ditemukan: {f}\n"
            "Jalankan devModellingML.py terlebih dahulu."
        )

model       = joblib.load(MODEL_FILE)
le          = joblib.load(ENCODER_FILE)
X_test      = joblib.load(X_TEST_FILE)
y_test      = joblib.load(Y_TEST_FILE)

class_names = list(le.classes_)   # ['negatif', 'positif']
n_classes   = len(class_names)    # 2

# pos_label = indeks kelas "positif" di LabelEncoder
# LabelEncoder mengurutkan alfabetis: negatif=0, positif=1
pos_label = list(le.classes_).index("positif")   # → 1

print(f"✅ Model & data test dimuat")
print(f"   Kelas     : {class_names}")
print(f"   Pos label : positif (idx={pos_label})")
print(f"   Test set  : {X_test.shape[0]:,} baris\n")

# ══════════════════════════════════════════════════════════════
#  PREDIKSI
# ══════════════════════════════════════════════════════════════
y_pred = model.predict(X_test)

# ✅ Binary: decision_function → shape (n_samples,) bukan (n_samples, n_classes)
# Nilai positif = condong ke kelas positif, negatif = condong ke kelas negatif
y_score = model.decision_function(X_test)   # shape: (n_samples,)

# ══════════════════════════════════════════════════════════════
#  a. CONFUSION MATRIX + CLASSIFICATION REPORT
# ══════════════════════════════════════════════════════════════
print("─" * 60)
print("  a. CONFUSION MATRIX & CLASSIFICATION REPORT")
print("─" * 60)

acc    = accuracy_score(y_test, y_pred)
report = classification_report(
    y_test, y_pred,
    target_names = class_names,
    digits       = 4,
)

print(f"\n  Accuracy : {acc:.4f}\n")
print(report)

# ── Plot Confusion Matrix ──
cm = confusion_matrix(y_test, y_pred)

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
ax.set_title(f"Confusion Matrix — SVM LinearSVC\nAccuracy: {acc:.4f}",
             fontsize=13, pad=15)

# Persentase di setiap sel
for i in range(n_classes):
    for j in range(n_classes):
        pct = cm[i, j] / cm[i].sum() * 100 if cm[i].sum() > 0 else 0
        ax.text(j + 0.5, i + 0.7, f"({pct:.1f}%)",
                ha="center", va="center", fontsize=8, color="gray")

plt.tight_layout()
plt.savefig(CM_FILE, dpi=150, bbox_inches="tight")
plt.close()
print(f"✅ Confusion matrix disimpan : {CM_FILE.name}")

# ══════════════════════════════════════════════════════════════
#  b. AUC-ROC — BINARY (positif vs negatif)
# ══════════════════════════════════════════════════════════════
print("\n" + "─" * 60)
print("  b. AUC-ROC (Binary: positif vs negatif)")
print("─" * 60)

# ✅ Binary roc_curve: langsung pakai y_score 1D + pos_label
fpr, tpr, _ = roc_curve(y_test, y_score, pos_label=pos_label)
roc_auc     = auc(fpr, tpr)

print(f"\n  AUC-ROC : {roc_auc:.4f}")

# ── Plot ROC Curve ──
fig, ax = plt.subplots(figsize=(7, 6))

ax.plot(fpr, tpr, color="#e74c3c", lw=2,
        label=f"SVM LinearSVC (AUC = {roc_auc:.4f})")
ax.plot([0, 1], [0, 1], "k--", lw=1.5, label="Random Classifier")

ax.set_title(f"ROC Curve — SVM LinearSVC\nAUC = {roc_auc:.4f}", fontsize=13)
ax.set_xlabel("False Positive Rate (FPR)", fontsize=12)
ax.set_ylabel("True Positive Rate (TPR)", fontsize=12)
ax.set_xlim([0.0, 1.0])
ax.set_ylim([0.0, 1.05])
ax.legend(loc="lower right", fontsize=11)
ax.grid(alpha=0.3)

plt.tight_layout()
plt.savefig(ROC_FILE, dpi=150, bbox_inches="tight")
plt.close()
print(f"✅ ROC curve disimpan        : {ROC_FILE.name}")

# ══════════════════════════════════════════════════════════════
#  SIMPAN LAPORAN TEKS
# ══════════════════════════════════════════════════════════════
report_text = f"""EVALUATION REPORT — SVM LinearSVC (Binary)
===========================================
Tanggal     : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Test set    : {X_test.shape[0]:,} baris
Kelas       : {class_names}  ← hanya positif & negatif

ACCURACY
--------
{acc:.4f}

CLASSIFICATION REPORT
---------------------
{report}
AUC-ROC (Binary)
----------------
  AUC         : {roc_auc:.4f}
  Pos label   : positif
"""

REPORT_FILE.write_text(report_text.strip(), encoding="utf-8")
print(f"✅ Laporan disimpan          : {REPORT_FILE.name}")

# ══════════════════════════════════════════════════════════════
#  RINGKASAN AKHIR
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*60}")
print(f"  ✅ Evaluasi selesai!")
print(f"{'='*60}")
print(f"  📊 Accuracy      : {acc:.4f}")
print(f"  📈 AUC-ROC       : {roc_auc:.4f}")
print(f"  🖼  {CM_FILE.name}")
print(f"  🖼  {ROC_FILE.name}")
print(f"  📄  {REPORT_FILE.name}")
print(f"{'='*60}")