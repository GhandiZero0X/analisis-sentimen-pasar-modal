# dev_database/03b_eval_svm.py
"""
=============================================================
STEP 3b: EVALUASI MODEL SVM
=============================================================
Tahapan evaluasi:
  a. Confusion Matrix → Accuracy, Precision, Recall, F1-score
  b. AUC-ROC          → True Positive Rate vs False Positive Rate
                        (One-vs-Rest untuk 3 kelas)

Input  : dev_database/4_model/ml/
         svm_model.joblib
         tfidf_vectorizer.joblib
         label_encoder.joblib
         X_test.joblib
         y_test.joblib

Output : dev_database/4_model/ml/
         confusion_matrix_svm.png
         roc_curve_svm.png
         classification_report_svm.txt
=============================================================
"""

import joblib
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
from pathlib import Path
from datetime import datetime

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    roc_curve,
    auc,
    roc_auc_score,
)
from sklearn.preprocessing import label_binarize

# ══════════════════════════════════════════════════════════════
#  PATH CONFIGURATION
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
MODEL_DIR  = BASE_DIR / "dev_database" / "4_model" / "ml"

MODEL_FILE      = MODEL_DIR / "svm_model.joblib"
VECTORIZER_FILE = MODEL_DIR / "tfidf_vectorizer.joblib"
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
print("  EVALUASI SVM — Confusion Matrix & AUC-ROC")
print("=" * 60)

for f in [MODEL_FILE, ENCODER_FILE, X_TEST_FILE, Y_TEST_FILE]:
    if not f.exists():
        raise FileNotFoundError(
            f"File tidak ditemukan: {f}\n"
            "Jalankan 03a_train_svm.py terlebih dahulu."
        )

model   = joblib.load(MODEL_FILE)
le      = joblib.load(ENCODER_FILE)
X_test  = joblib.load(X_TEST_FILE)
y_test  = joblib.load(Y_TEST_FILE)

class_names = list(le.classes_)         # ['negatif', 'netral', 'positif']
n_classes   = len(class_names)

print(f"✅ Model & data test dimuat")
print(f"   Kelas   : {class_names}")
print(f"   Test set: {X_test.shape[0]:,} baris\n")

# ══════════════════════════════════════════════════════════════
#  PREDIKSI
# ══════════════════════════════════════════════════════════════
y_pred  = model.predict(X_test)

# decision_function dipakai sebagai skor untuk AUC-ROC
# LinearSVC tidak punya predict_proba, decision_function adalah alternatif resmi
y_score = model.decision_function(X_test)   # shape: (n_samples, n_classes)

# ══════════════════════════════════════════════════════════════
#  a. CONFUSION MATRIX + CLASSIFICATION REPORT
# ══════════════════════════════════════════════════════════════
print("─" * 60)
print("  a. CONFUSION MATRIX & CLASSIFICATION REPORT")
print("─" * 60)

acc    = accuracy_score(y_test, y_pred)
report = classification_report(
    y_test, y_pred,
    target_names=class_names,
    digits=4,               # 4 desimal untuk laporan skripsi
)

print(f"\n  Accuracy : {acc:.4f}\n")
print(report)

# ── Plot Confusion Matrix ──
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
ax.set_ylabel("Aktual",   fontsize=12, labelpad=10)
ax.set_title("Confusion Matrix — SVM LinearSVC", fontsize=13, pad=15)

# Tambahkan persentase di setiap sel
for i in range(n_classes):
    for j in range(n_classes):
        pct = cm[i, j] / cm[i].sum() * 100
        ax.text(j + 0.5, i + 0.7, f"({pct:.1f}%)",
                ha="center", va="center",
                fontsize=8, color="gray")

plt.tight_layout()
plt.savefig(CM_FILE, dpi=150, bbox_inches="tight")
plt.close()
print(f"✅ Confusion matrix disimpan : {CM_FILE.name}")

# ══════════════════════════════════════════════════════════════
#  b. AUC-ROC (One-vs-Rest untuk 3 kelas)
# ══════════════════════════════════════════════════════════════
print("\n" + "─" * 60)
print("  b. AUC-ROC (One-vs-Rest, 3 kelas)")
print("─" * 60)

# Binarize label untuk OvR: [[1,0,0], [0,1,0], [0,0,1]]
y_test_bin = label_binarize(y_test, classes=list(range(n_classes)))

# Hitung ROC curve per kelas
colors = ["#e74c3c", "#3498db", "#2ecc71"]  # merah, biru, hijau

fig, ax = plt.subplots(figsize=(7, 6))

auc_scores = {}
for i, (cls, color) in enumerate(zip(class_names, colors)):
    fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_score[:, i])
    roc_auc     = auc(fpr, tpr)
    auc_scores[cls] = roc_auc

    ax.plot(fpr, tpr, color=color, lw=2,
            label=f"{cls.capitalize()} (AUC = {roc_auc:.4f})")

# Diagonal garis acak
ax.plot([0, 1], [0, 1], "k--", lw=1.5, label="Random Classifier")

# Makro AUC rata-rata
macro_auc = roc_auc_score(y_test_bin, y_score, average="macro", multi_class="ovr")
ax.set_title(f"ROC Curve — SVM LinearSVC\nMacro AUC = {macro_auc:.4f}", fontsize=13)
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
print(f"\n✅ ROC curve disimpan : {ROC_FILE.name}")

# ══════════════════════════════════════════════════════════════
#  SIMPAN LAPORAN TEKS
# ══════════════════════════════════════════════════════════════
report_text = f"""EVALUATION REPORT — SVM LinearSVC
===================================
Tanggal     : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Test set    : {X_test.shape[0]:,} baris
Kelas       : {class_names}

ACCURACY
--------
{acc:.4f}

CLASSIFICATION REPORT
---------------------
{report}

AUC-ROC (One-vs-Rest)
---------------------
"""
for cls, score in auc_scores.items():
    report_text += f"  {cls:<12} : {score:.4f}\n"
report_text += f"  {'Macro AUC':<12} : {macro_auc:.4f}\n"

REPORT_FILE.write_text(report_text.strip(), encoding="utf-8")
print(f"✅ Laporan disimpan   : {REPORT_FILE.name}")

# ══════════════════════════════════════════════════════════════
#  RINGKASAN AKHIR
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*60}")
print(f"  ✅ Evaluasi selesai!")
print(f"{'='*60}")
print(f"  📊 Accuracy           : {acc:.4f}")
print(f"  📈 Macro AUC-ROC      : {macro_auc:.4f}")
print(f"  🖼  confusion_matrix_svm.png")
print(f"  🖼  roc_curve_svm.png")
print(f"  📄  classification_report_svm.txt")
print(f"{'='*60}")