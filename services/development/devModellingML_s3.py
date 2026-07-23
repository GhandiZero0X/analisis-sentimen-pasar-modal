# services/development/devModellingML.py
"""
=============================================================
STEP 3a: FEATURE EXTRACTION + TRAINING SVM (SCENARIO 3)
=============================================================
Tahapan:
    1. Feature Extraction  -> TF-IDF (TfidfVectorizer scikit-learn)
    2. Split Data          -> 80% train / 20% test
    3. Penanganan Imbalance (HYBRID):
        a. Data-level      -> SMOTE (hanya pada data train, setelah TF-IDF)
        b. Algorithm-level -> class_weight="balanced" pada LinearSVC
    4. Modeling            -> LinearSVC + GridSearchCV (hyperparameter tuning)
    5. Simpan Model        -> .joblib (siap dipakai devEvaluasiML.py)

Scenario 3:
    - Label NEGATIF, NETRAL, POSITIF semuanya dipakai
    - Tidak ada label yang dibuang

Catatan:
    Imbalance ditangani dengan pendekatan HYBRID (sama seperti Skenario
    1 & 2). Perbedaan dengan Skenario 1 & 2: karena Skenario 3 memiliki
    3 kelas sekaligus (bukan binary), SMOTE dan class_weight bekerja
    secara multi-class -- bukan hanya menyamakan 1 kelas minoritas ke
    1 kelas mayoritas, tapi menyamakan SELURUH kelas ke jumlah kelas
    dengan sampel terbanyak.

      1) SMOTE (data-level)
         Representasi TF-IDF berupa vektor numerik kontinu, sehingga
         interpolasi linear antar sampel tetangga (prinsip kerja SMOTE)
         valid secara matematis. imblearn.SMOTE mendukung multi-class
         secara native: setiap kelas yang jumlahnya lebih sedikit dari
         kelas dengan sampel terbanyak akan dibuatkan sampel sintetis
         hingga seimbang. Diterapkan SETELAH TF-IDF fit_transform dan
         HANYA pada data train (setelah split, sebelum training). Test
         set TIDAK ikut di-SMOTE, supaya tetap merepresentasikan
         distribusi data asli dan tidak terjadi data leakage.

      2) class_weight="balanced" (algorithm-level)
         Tetap dipertahankan pada LinearSVC sebagai lapisan tambahan
         (hybrid), meskipun data train sudah diseimbangkan oleh SMOTE.
         Skema "balanced" pada LinearSVC otomatis menghitung bobot
         untuk seluruh kelas (bukan cuma 2), sehingga tetap valid
         dipakai pada kasus multi-class ini.

Input  : dev_database/3_preprocessing/S1S3/ml/
         tweets_all_periods_labellingLexicon_preprocessingML.csv

Output : dev_database/4_model/S3/ml/all_periods/
         svm_model.joblib
         tfidf_vectorizer.joblib
         label_encoder.joblib
         X_test.joblib
         y_test.joblib
         train_info.txt
=============================================================
"""

import pandas as pd
import joblib
import numpy as np
import time

from pathlib import Path
from datetime import datetime

from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, f1_score

from imblearn.over_sampling import SMOTE

# ══════════════════════════════════════════════════════════════
#  PATH CONFIGURATION
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
INPUT_DIR  = BASE_DIR / "dev_database" / "3_preprocessing" / "S1S3" / "ml"
OUTPUT_DIR = BASE_DIR / "dev_database" / "4_model" / "S3" / "ml" / "covid"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILE      = INPUT_DIR / "tweets_covid_labellingLexicon_preprocessingML.csv"
MODEL_FILE      = OUTPUT_DIR / "svm_model.joblib"
VECTORIZER_FILE = OUTPUT_DIR / "tfidf_vectorizer.joblib"
ENCODER_FILE    = OUTPUT_DIR / "label_encoder.joblib"
X_TEST_FILE     = OUTPUT_DIR / "X_test.joblib"
Y_TEST_FILE     = OUTPUT_DIR / "y_test.joblib"
TRAIN_INFO_FILE = OUTPUT_DIR / "train_info.txt"

# -- Konfigurasi penanganan imbalance (HYBRID) --
SMOTE_RANDOM_SEED = 0
SMOTE_K_NEIGHBORS = 5   # default SMOTE; akan otomatis disesuaikan jika kelas minoritas < 6 sampel

# ══════════════════════════════════════════════════════════════
#  TIMER TOTAL
# ══════════════════════════════════════════════════════════════
total_start_time = time.time()

# ══════════════════════════════════════════════════════════════
#  1. LOAD DATASET
# ══════════════════════════════════════════════════════════════
print("=" * 60)
print("  TRAINING SVM - TF-IDF + LinearSVC + GridSearchCV (SCENARIO 3)")
print("  HYBRID IMBALANCE HANDLING: SMOTE + class_weight balanced")
print("=" * 60)
print(f"\nInput : {INPUT_FILE}\n")

df = pd.read_csv(INPUT_FILE, dtype=str).fillna("")
print(f"Dataset dimuat               : {len(df):,} baris")

# Hapus baris kosong pada teks hasil preprocessing
df = df[df["tweet_preprocessed"].str.strip() != ""].copy()
print(f"Setelah filter kosong        : {len(df):,} baris")

# Normalisasi label
df["sentiment"] = df["sentiment"].astype(str).str.lower().str.strip()

# Scenario 3: pakai semua label
valid_labels = ["negatif", "netral", "positif"]
df = df[df["sentiment"].isin(valid_labels)].reset_index(drop=True)

if len(df) == 0:
    raise ValueError("Tidak ada data valid setelah filtering label.")

print(f"Setelah filter label         : {len(df):,} baris")
print(f"   (label dipakai: negatif, netral, positif)")

print(f"\nDistribusi label:")
dist = df["sentiment"].value_counts()

for label, count in dist.items():
    pct = count / len(df) * 100
    bar = "#" * int(pct / 4)
    print(f"   {label:<12} {count:>6,} ({pct:5.1f}%) {bar}")

X_raw = df["tweet_preprocessed"]
y_raw = df["sentiment"]

# ══════════════════════════════════════════════════════════════
#  LABEL ENCODING
# ══════════════════════════════════════════════════════════════
le = LabelEncoder()
y  = le.fit_transform(y_raw)

print(f"\nLabel encoding:")
for cls, idx in zip(le.classes_, range(len(le.classes_))):
    print(f"   {cls:<12} -> {idx}")

if len(le.classes_) != 3:
    raise ValueError(f"Scenario 3 harus 3 kelas, tetapi ditemukan: {list(le.classes_)}")

# ══════════════════════════════════════════════════════════════
#  SPLIT DATA
# ══════════════════════════════════════════════════════════════
X_train_raw, X_test_raw, y_train, y_test = train_test_split(
    X_raw,
    y,
    test_size    = 0.2,
    random_state = 0,
    stratify     = y
)

print(f"\nSplit data:")
print(f"   Train : {len(X_train_raw):,}")
print(f"   Test  : {len(X_test_raw):,}")

# ══════════════════════════════════════════════════════════════
#  TF-IDF
# ══════════════════════════════════════════════════════════════
print(f"\nTF-IDF Vectorization...")

tfidf_start = time.time()

vectorizer = TfidfVectorizer(
    ngram_range  = (1, 2),
    max_features = 10000,
    min_df       = 5,
    max_df       = 0.9,
    sublinear_tf = True,
)

# PENTING: fit HANYA pada X_train, transform saja untuk X_test,
# supaya tidak terjadi data leakage dari test set ke dalam vocabulary/IDF.
X_train = vectorizer.fit_transform(X_train_raw)
X_test  = vectorizer.transform(X_test_raw)

tfidf_time = time.time() - tfidf_start

print(f"TF-IDF selesai")
print(f"   Jumlah fitur  : {X_train.shape[1]:,}")
print(f"   Shape train   : {X_train.shape}")
print(f"   Shape test    : {X_test.shape}")
print(f"   Runtime TFIDF : {tfidf_time:.2f} detik")

# ══════════════════════════════════════════════════════════════
#  PENANGANAN IMBALANCE - DATA LEVEL (SMOTE, MULTI-CLASS)
# ══════════════════════════════════════════════════════════════
print(f"\nPenanganan Imbalance: SMOTE (data-level, multi-class)")
print(f"   Diterapkan SETELAH TF-IDF, HANYA pada data train")

n_train_before_smote = X_train.shape[0]

unique, counts_before = np.unique(y_train, return_counts=True)
print(f"\n   Distribusi train SEBELUM SMOTE:")
for cls_idx, cnt in zip(unique, counts_before):
    print(f"   {le.classes_[cls_idx]:<12} {cnt:>8,}")

# k_neighbors SMOTE tidak boleh >= jumlah sampel kelas minoritas.
# Disesuaikan otomatis supaya tidak error jika kelas minoritas kecil.
minority_count = counts_before.min()
k_neighbors_adjusted = min(SMOTE_K_NEIGHBORS, minority_count - 1)
k_neighbors_adjusted = max(k_neighbors_adjusted, 1)

if k_neighbors_adjusted != SMOTE_K_NEIGHBORS:
    print(
        f"\n   Catatan: k_neighbors disesuaikan dari {SMOTE_K_NEIGHBORS} "
        f"menjadi {k_neighbors_adjusted} (kelas minoritas hanya {minority_count} sampel)"
    )

smote_start = time.time()

# SMOTE bawaan imblearn otomatis menangani multi-class: strategy default
# "not majority" akan meng-oversample SEMUA kelas selain kelas mayoritas
# hingga jumlahnya sama dengan kelas mayoritas.
smote = SMOTE(
    random_state = SMOTE_RANDOM_SEED,
    k_neighbors  = k_neighbors_adjusted,
)

X_train, y_train = smote.fit_resample(X_train, y_train)

smote_time = time.time() - smote_start

unique_after, counts_after = np.unique(y_train, return_counts=True)
print(f"\n   Distribusi train SESUDAH SMOTE:")
for cls_idx, cnt in zip(unique_after, counts_after):
    pct = cnt / len(y_train) * 100
    print(f"   {le.classes_[cls_idx]:<12} {cnt:>8,} ({pct:5.1f}%)")

print(f"\n   Train sebelum SMOTE : {n_train_before_smote:,} baris")
print(f"   Train sesudah SMOTE : {X_train.shape[0]:,} baris")
print(f"   Runtime SMOTE       : {smote_time:.2f} detik")

# ══════════════════════════════════════════════════════════════
#  TRAINING SVM
# ══════════════════════════════════════════════════════════════
print(f"\nTraining LinearSVC + GridSearchCV...")
print(f"   (proses dapat memakan waktu beberapa menit)\n")

param_grid = {
    "C": [0.01, 0.1, 1, 10, 100]
}

# class_weight="balanced" TETAP dipertahankan sebagai lapisan
# algorithm-level, meskipun data train sudah diseimbangkan lewat SMOTE.
# Ini menjadikan penanganan imbalance pada SVM bersifat HYBRID, sama
# seperti pendekatan pada IndoBERTweet (Random Oversampling + Weighted CE).
svm = LinearSVC(
    class_weight = "balanced",
    random_state = 0,
    max_iter     = 2000,
)

cv = StratifiedKFold(
    n_splits = 5,
    shuffle  = True,
    random_state = 0
)

grid_search = GridSearchCV(
    estimator  = svm,
    param_grid = param_grid,
    scoring    = "f1_macro",
    cv         = cv,
    n_jobs     = -1,
    verbose    = 1,
)

# TIMER TRAINING
train_start = time.time()

grid_search.fit(X_train, y_train)

train_time = time.time() - train_start

best_model = grid_search.best_estimator_
best_C     = grid_search.best_params_["C"]
best_score = grid_search.best_score_

print(f"\nGridSearch selesai")
print(f"   Best C         : {best_C}")
print(f"   Best F1 Macro  : {best_score:.4f}")
print(f"   Runtime Train  : {train_time:.2f} detik")

# ══════════════════════════════════════════════════════════════
#  EVALUASI CEPAT
# ══════════════════════════════════════════════════════════════
y_train_pred = best_model.predict(X_train)
y_test_pred  = best_model.predict(X_test)

train_acc = accuracy_score(y_train, y_train_pred)
test_acc  = accuracy_score(y_test, y_test_pred)

train_f1_macro = f1_score(y_train, y_train_pred, average="macro", zero_division=0)
test_f1_macro  = f1_score(y_test, y_test_pred, average="macro", zero_division=0)

print(f"\nAkurasi:")
print(f"   Train : {train_acc:.4f}")
print(f"   Test  : {test_acc:.4f}")
print(f"   Train F1 Macro : {train_f1_macro:.4f}")
print(f"   Test F1 Macro  : {test_f1_macro:.4f}")

if train_acc - test_acc > 0.1:
    print(f"   Peringatan: potensi overfitting")

# ══════════════════════════════════════════════════════════════
#  SAVE MODEL
# ══════════════════════════════════════════════════════════════
print(f"\nMenyimpan artefak...")

joblib.dump(best_model, MODEL_FILE)
joblib.dump(vectorizer, VECTORIZER_FILE)
joblib.dump(le, ENCODER_FILE)
joblib.dump(X_test, X_TEST_FILE)
joblib.dump(y_test, Y_TEST_FILE)

# TOTAL RUNTIME
total_runtime = time.time() - total_start_time

# ══════════════════════════════════════════════════════════════
#  TRAIN INFO
# ══════════════════════════════════════════════════════════════
info = f"""
TRAINING INFO - SVM LinearSVC (Scenario 3, Hybrid Imbalance Handling)
==========================================

Tanggal          : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Input file       : {INPUT_FILE.name}

Total data       : {len(df):,}

Kelas            : {list(le.classes_)}

Train (sebelum SMOTE) : {n_train_before_smote:,}
Train (sesudah SMOTE) : {X_train.shape[0]:,}
Test                  : {len(X_test_raw):,}

TF-IDF:
  ngram_range    : (1, 2)
  max_features   : 10000
  min_df         : 5
  max_df         : 0.9
  sublinear_tf   : True
  jumlah fitur   : {X_train.shape[1]:,}

Penanganan Imbalance (HYBRID):
  1. Data-level      : SMOTE (multi-class)
                        k_neighbors    : {k_neighbors_adjusted}
                        random_state   : {SMOTE_RANDOM_SEED}
                        Setiap kelas yang jumlahnya lebih sedikit dari
                        kelas dengan sampel terbanyak dibuatkan sampel
                        sintetis hingga seimbang. Diterapkan setelah
                        TF-IDF, hanya pada data train. Test set tidak
                        diubah.
  2. Algorithm-level  : class_weight="balanced" (LinearSVC)

GridSearch:
  C dicoba       : {param_grid["C"]}
  C terbaik      : {best_C}
  F1 Macro CV    : {best_score:.4f}
  CV             : StratifiedKFold (5-fold)

Akurasi:
  Train          : {train_acc:.4f}
  Test           : {test_acc:.4f}

F1 Macro:
  Train          : {train_f1_macro:.4f}
  Test           : {test_f1_macro:.4f}

Runtime:
  TF-IDF         : {tfidf_time:.2f} detik
  SMOTE          : {smote_time:.2f} detik
  Training SVM   : {train_time:.2f} detik
  Total Runtime  : {total_runtime:.2f} detik
"""

TRAIN_INFO_FILE.write_text(info.strip(), encoding="utf-8")

print(f"\n{'='*60}")
print(f"Semua artefak berhasil disimpan")
print(f"Output : {OUTPUT_DIR}")
print(f"{'='*60}")

print(f"\nLanjut ke: python devEvaluasiML.py")