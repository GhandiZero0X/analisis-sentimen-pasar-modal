# dev_database/03a_train_svm.py
"""
=============================================================
STEP 3a: FEATURE EXTRACTION + TRAINING SVM
=============================================================
Tahapan:
  1. Feature Extraction  → TF-IDF (TfidfVectorizer scikit-learn)
  2. Split Data          → 80% train / 20% test (train_test_split)
  3. Modeling            → LinearSVC + GridSearchCV (hyperparameter tuning)
  4. Simpan Model        → .joblib (siap dipakai 03b_eval_svm.py)

Input  : dev_database/3_preprocessing/ml/
         tweets_all_periods_labelling_preprocessingML.csv

Output : dev_database/4_model/ml/
         svm_model.joblib
         tfidf_vectorizer.joblib
         label_encoder.joblib
         X_test.joblib   ← data test untuk script evaluasi
         y_test.joblib   ← label test untuk script evaluasi
         train_info.txt
=============================================================
"""

import pandas as pd
import joblib
import numpy as np
from pathlib import Path
from datetime import datetime

from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

# ══════════════════════════════════════════════════════════════
#  PATH CONFIGURATION
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
INPUT_DIR  = BASE_DIR / "dev_database" / "3_preprocessing" / "ml"
OUTPUT_DIR = BASE_DIR / "dev_database" / "4_model" / "ml" / "covid"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILE      = INPUT_DIR  / "tweets_covid_labellingLexicon_preprocessingML.csv"
MODEL_FILE      = OUTPUT_DIR / "svm_model.joblib"
VECTORIZER_FILE = OUTPUT_DIR / "tfidf_vectorizer.joblib"
ENCODER_FILE    = OUTPUT_DIR / "label_encoder.joblib"
X_TEST_FILE     = OUTPUT_DIR / "X_test.joblib"
Y_TEST_FILE     = OUTPUT_DIR / "y_test.joblib"
TRAIN_INFO_FILE = OUTPUT_DIR / "train_info.txt"

# ══════════════════════════════════════════════════════════════
#  1. LOAD DATASET
# ══════════════════════════════════════════════════════════════
print("=" * 60)
print("  TRAINING SVM — TF-IDF + LinearSVC + GridSearchCV")
print("=" * 60)
print(f"\n📂 Input : {INPUT_FILE}\n")

df = pd.read_csv(INPUT_FILE, dtype=str).fillna("")
print(f"✅ Dataset dimuat          : {len(df):,} baris")

# Hapus baris dengan tweet_preprocessed kosong
df = df[df["tweet_preprocessed"].str.strip() != ""]
print(f"✅ Setelah filter kosong   : {len(df):,} baris")

# Hanya pakai 3 kelas yang valid
valid_labels = {"positif", "netral", "negatif"}
df = df[df["sentiment"].isin(valid_labels)]
print(f"✅ Setelah filter label    : {len(df):,} baris")

print(f"\n📊 Distribusi label:")
dist = df["sentiment"].value_counts()
for label, count in dist.items():
    pct = count / len(df) * 100
    bar = "█" * int(pct / 4)
    print(f"   {label:<12} {count:>6,} ({pct:5.1f}%)  {bar}")

X_raw = df["tweet_preprocessed"]
y_raw = df["sentiment"]

# ══════════════════════════════════════════════════════════════
#  ENCODE LABEL → integer (wajib untuk LinearSVC)
# ══════════════════════════════════════════════════════════════
le = LabelEncoder()
y  = le.fit_transform(y_raw)   # negatif=0, netral=1, positif=2

print(f"\n🔖 Label encoding:")
for cls, idx in zip(le.classes_, range(len(le.classes_))):
    print(f"   {cls:<12} → {idx}")

# ══════════════════════════════════════════════════════════════
#  2. SPLIT DATA — 80% TRAIN / 20% TEST
# ══════════════════════════════════════════════════════════════
X_train_raw, X_test_raw, y_train, y_test = train_test_split(
    X_raw, y,
    test_size=0.2,
    random_state=0,
    stratify=y      # distribusi label seimbang di train & test
)

print(f"\n✂️  Split data (80/20):")
print(f"   Train : {len(X_train_raw):,} baris")
print(f"   Test  : {len(X_test_raw):,} baris")

# ══════════════════════════════════════════════════════════════
#  1. FEATURE EXTRACTION — TF-IDF
#     fit HANYA pada data train → cegah data leakage ke test set
# ══════════════════════════════════════════════════════════════
print(f"\n⚙️  TF-IDF Vectorization...")

vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),     # unigram + bigram
    max_features=10000,     # 10.000 fitur paling informatif
    min_df=5,               # abaikan kata yang muncul < 5 dokumen
    max_df=0.9,             # abaikan kata yang muncul di > 90% dokumen
    sublinear_tf=True,      # tf = 1 + log(tf), reduksi dominasi frekuensi tinggi
)

X_train = vectorizer.fit_transform(X_train_raw)   # fit + transform train
X_test  = vectorizer.transform(X_test_raw)        # transform saja test (no leakage)

print(f"✅ TF-IDF selesai")
print(f"   Jumlah fitur : {X_train.shape[1]:,}")
print(f"   Shape train  : {X_train.shape}")
print(f"   Shape test   : {X_test.shape}")

# ══════════════════════════════════════════════════════════════
#  3. MODELING — LinearSVC + GridSearchCV
# ══════════════════════════════════════════════════════════════
print(f"\n🚀 Training LinearSVC + GridSearchCV...")
print(f"   (Proses ini membutuhkan beberapa menit)\n")

param_grid = {"C": [0.01, 0.1, 1, 10, 100]}

svm = LinearSVC(
    class_weight="balanced",    # tangani class imbalance
    random_state=0,
    max_iter=2000,
)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)

grid_search = GridSearchCV(
    estimator=svm,
    param_grid=param_grid,
    scoring="f1_macro",         # cocok untuk 3 kelas (rata-rata tidak berbobot)
    cv=cv,
    n_jobs=-1,                  # pakai semua CPU core
    verbose=1,
)

grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_
best_C     = grid_search.best_params_["C"]
best_score = grid_search.best_score_

print(f"\n✅ GridSearchCV selesai")
print(f"   Parameter terbaik  : C = {best_C}")
print(f"   F1-macro CV terbaik : {best_score:.4f}")

# Cek cepat overfitting
y_train_pred = best_model.predict(X_train)
y_test_pred  = best_model.predict(X_test)
train_acc    = accuracy_score(y_train, y_train_pred)
test_acc     = accuracy_score(y_test,  y_test_pred)

print(f"\n📊 Akurasi cepat:")
print(f"   Train : {train_acc:.4f}")
print(f"   Test  : {test_acc:.4f}")
if train_acc - test_acc > 0.1:
    print(f"   ⚠️  Gap > 0.1 → potensi overfitting, coba C lebih kecil")

# ══════════════════════════════════════════════════════════════
#  4. SIMPAN MODEL & ARTEFAK
# ══════════════════════════════════════════════════════════════
print(f"\n💾 Menyimpan artefak...")

joblib.dump(best_model,  MODEL_FILE)
joblib.dump(vectorizer,  VECTORIZER_FILE)
joblib.dump(le,          ENCODER_FILE)
joblib.dump(X_test,      X_TEST_FILE)
joblib.dump(y_test,      Y_TEST_FILE)

info = f"""TRAINING INFO — SVM LinearSVC
==============================
Tanggal          : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Input file       : {INPUT_FILE.name}
Total data       : {len(df):,}
Train / Test     : {len(X_train_raw):,} / {len(X_test_raw):,}
Kelas            : {list(le.classes_)}

TF-IDF:
  ngram_range    : (1, 2)
  max_features   : 10,000
  min_df / max_df: 5 / 0.9
  sublinear_tf   : True
  Jumlah fitur   : {X_train.shape[1]:,}

GridSearch:
  C dicoba       : {param_grid["C"]}
  C terbaik      : {best_C}
  F1-macro CV    : {best_score:.4f}
  CV strategy    : StratifiedKFold (5 fold)

Akurasi:
  Train          : {train_acc:.4f}
  Test           : {test_acc:.4f}
"""
TRAIN_INFO_FILE.write_text(info.strip(), encoding="utf-8")

print(f"\n{'='*60}")
print(f"  ✅ Artefak tersimpan di: {OUTPUT_DIR}/")
print(f"{'='*60}")
print(f"  📦 svm_model.joblib")
print(f"  📦 tfidf_vectorizer.joblib")
print(f"  📦 label_encoder.joblib")
print(f"  📦 X_test.joblib + y_test.joblib")
print(f"  📄 train_info.txt")
print(f"{'='*60}")
print(f"\n  ➡  Lanjut ke: python 03b_eval_svm.py")