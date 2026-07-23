# services/updateModelML.py
"""
Pipeline Update Model SVM (production):
    1. Preprocessing   ->
        1. Casefolding
        2. Text Cleaning:
            i.   Hapus URL
            ii.  Hapus hashtag (#), cashtag ($), mention (@)
            iii. Hapus emoji dan emotikon
            iv.  Hapus angka yang tidak memiliki makna kontekstual
            v.   Hapus karakter selain alfabet
            vi.  Normalisasi singkatan & slang -> kata baku (kamus)
        3. Tokenization  (Stanza)
        4. Stopword Removal (NLTK)
        5. Stemming (Sastrawi)
    2. Modelling       -> gabung data baru + data lama (analisis CSV),
                            Penanganan imbalance (HYBRID):
                            a. Data-level      -> SMOTE (hanya pada data train, setelah TF-IDF)
                            b. Algorithm-level -> class_weight="balanced" pada LinearSVC
                            retrain TF-IDF + LinearSVC dari awal dengan data lengkap,
                            label NEGATIF, NETRAL, POSITIF semuanya dipakai
    3. Evaluasi        -> confusion matrix, ROC curve, metrics CSV,
                            classification report, AUC-ROC (OvR)
    4. Komparasi       -> update tabel_komparasi.csv
    5. Analisis        -> prediksi sentimen data baru, gabung dengan data lama
"""

from __future__ import annotations

import joblib
import os
import re
import time
import warnings
from datetime import datetime
from pathlib import Path
from typing import Callable

import emoji
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import nltk
import stanza

from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from nltk.corpus import stopwords

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score,
    auc,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, label_binarize
from sklearn.svm import LinearSVC

from imblearn.over_sampling import SMOTE

warnings.filterwarnings("ignore")

# ══════════════════════════════════════════════════════════════
#  KONSTANTA
# ══════════════════════════════════════════════════════════════
PERIOD_TO_FOLDER = {
    "before":      "data/modelML/before",
    "covid":       "data/modelML/covid",
    "after":       "data/modelML/after",
    "all_periods": "data/modelML/all_periods",
}

PERIOD_LABELS = {
    "before":      "Sebelum COVID",
    "covid":       "Masa COVID",
    "after":       "Setelah COVID",
    "all_periods": "Semua Periode",
}

# CSV analisis lama — dipakai sebagai sumber data historis untuk retrain
ANALISIS_FILES = {
    "before":      "data/csv/ml/tweets_before_labelling_analisisML.csv",
    "covid":       "data/csv/ml/tweets_covid_labelling_analisisML.csv",
    "after":       "data/csv/ml/tweets_after_labelling_analisisML.csv",
    "all_periods": "data/csv/ml/tweets_all_periods_labelling_analisisML.csv",
}

KOMPARASI_CSV = "data/komparasi/tabel_komparasi.csv"
KAMUS_FILE    = "data/kamus/kamuskatabaku.xlsx"

VALID_LABELS = ["negatif", "netral", "positif"]
RANDOM_SEED  = 0
TEST_RATIO   = 0.20

# TF-IDF hyperparameter
TFIDF_PARAMS = {
    "ngram_range":  (1, 2),
    "max_features": 10_000,
    "min_df":       5,
    "max_df":       0.9,
    "sublinear_tf": True,
}

# C candidates untuk seleksi ringan
C_CANDIDATES = [0.01, 0.1, 1, 10, 100]

# -- Konfigurasi penanganan imbalance (HYBRID, sama seperti devModellingML.py) --
SMOTE_RANDOM_SEED = RANDOM_SEED
SMOTE_K_NEIGHBORS = 5   # default SMOTE; akan otomatis disesuaikan jika kelas minoritas < 6 sampel


# ══════════════════════════════════════════════════════════════
#  LAZY-LOAD NLP RESOURCES
# ══════════════════════════════════════════════════════════════
_nlp_stanza = None
_stop_words = None
_stemmer    = None


def _get_nlp(root_path: str):
    global _nlp_stanza
    if _nlp_stanza is None:
        try:
            _nlp_stanza = stanza.Pipeline(
                lang="id", processors="tokenize",
                tokenize_no_ssplit=True, verbose=False,
            )
        except Exception:
            stanza.download("id", verbose=False)
            _nlp_stanza = stanza.Pipeline(
                lang="id", processors="tokenize",
                tokenize_no_ssplit=True, verbose=False,
            )
    return _nlp_stanza


def _get_stopwords():
    global _stop_words
    if _stop_words is None:
        nltk.download("stopwords", quiet=True)
        _stop_words = set(stopwords.words("indonesian"))
    return _stop_words


def _get_stemmer():
    global _stemmer
    if _stemmer is None:
        _stemmer = StemmerFactory().create_stemmer()
    return _stemmer


def _load_kamus(root_path: str) -> dict:
    kamus_path = os.path.join(root_path, KAMUS_FILE)
    if not os.path.exists(kamus_path):
        return {}
    df = pd.read_excel(kamus_path)
    return dict(zip(
        df["tidak_baku"].astype(str).str.lower(),
        df["kata_baku"].astype(str).str.lower(),
    ))


# ══════════════════════════════════════════════════════════════
#  STEP 1 — PREPROCESSING
# ══════════════════════════════════════════════════════════════
def _preprocess_text(tweet: str, kamus: dict, nlp, stop_words: set, stemmer) -> str:
    tweet = str(tweet).lower()

    # Text Cleaning
    tweet = re.sub(r"(https?://|ftp://|www\.)\S+|bit\.ly/\S+|t\.co/\S+", " ", tweet)
    tweet = re.sub(r"#\w+", " ", tweet)
    tweet = re.sub(r"\$\w+", " ", tweet)
    tweet = re.sub(r"@\w+", " ", tweet)
    tweet = emoji.replace_emoji(tweet, replace=" ")
    tweet = re.sub(
        r"(:-?\)|:-?\(|;-?\)|:-?D|:-?P|:-?\||:'[(\)]|<3|>:<|xD|:'\))",
        " ", tweet, flags=re.IGNORECASE,
    )
    tweet = re.sub(r"\b\d+\b", " ", tweet)
    tweet = re.sub(r"[^a-z\s]", " ", tweet)
    tweet = re.sub(r"\s+", " ", tweet).strip()

    # Normalisasi slang
    words = [kamus.get(w, w) for w in tweet.split()]
    tweet = " ".join(words)

    # Tokenization (Stanza)
    doc    = nlp(tweet)
    tokens = [word.text for sent in doc.sentences for word in sent.words]

    # Stopword Removal
    tokens = [t for t in tokens if t not in stop_words]

    # Stemming
    tokens = [stemmer.stem(t) for t in tokens]

    # Buang token pendek
    tokens = [t for t in tokens if len(t) > 2]

    return " ".join(tokens)


def step_preprocessing(
    csv_path: str,
    root_path: str,
    job_id: str,
    set_status: Callable,
) -> pd.DataFrame:
    set_status(job_id, "Preprocessing: membaca CSV...", 5)

    df = pd.read_csv(csv_path, dtype=str).fillna("")

    # Deteksi kolom teks & label
    text_col = next(
        (c for c in df.columns if "tweet" in c.lower()), df.columns[0]
    )
    sentiment_col = next(
        (c for c in df.columns if "sentiment" in c.lower() or "label" in c.lower()),
        None,
    )
    if not sentiment_col:
        raise ValueError(
            "CSV tidak memiliki kolom sentiment/label. "
            "Pastikan CSV memiliki kolom bernama 'sentiment' atau 'label'."
        )

    set_status(job_id, "Preprocessing: memuat resource NLP...", 8)
    kamus      = _load_kamus(root_path)
    nlp        = _get_nlp(root_path)
    stop_words = _get_stopwords()
    stemmer    = _get_stemmer()

    set_status(job_id, "Preprocessing: membersihkan teks...", 10)
    df["tweet_preprocessed"] = df[text_col].apply(
        lambda t: _preprocess_text(t, kamus, nlp, stop_words, stemmer)
    )

    if sentiment_col != "sentiment":
        df = df.rename(columns={sentiment_col: "sentiment"})
    df["sentiment"] = df["sentiment"].astype(str).str.lower().str.strip()

    # Simpan teks asli untuk analisis & deduplikasi
    df["tweet_original"] = df[text_col]

    # Hapus baris kosong
    before = len(df)
    df = df[df["tweet_preprocessed"].str.strip() != ""].reset_index(drop=True)
    after  = len(df)
    print(f"   Preprocessing: {before} → {after} baris (hapus {before - after} kosong)")

    set_status(job_id, "Preprocessing selesai.", 15)
    return df


# ══════════════════════════════════════════════════════════════
#  STEP 2 — MODELLING
#  Strategi: gabung data baru + data lama -> retrain TF-IDF + SVM
#  Penanganan imbalance: SMOTE (data-level) + class_weight balanced
#  (algorithm-level), sama seperti devModellingML.py Skenario 3
# ══════════════════════════════════════════════════════════════
def _load_historical_data(period: str, root_path: str) -> pd.DataFrame | None:
    """
    Baca data lama dari analisis CSV (jika ada).
    Kolom yang dibutuhkan: tweet_preprocessed + sentiment / sentiment_predict_ml
    """
    analisis_path = Path(root_path) / ANALISIS_FILES[period]
    if not analisis_path.exists():
        print(f"   ℹ️  Tidak ada data historis di {analisis_path.name}, mulai dari nol.")
        return None

    df_old = pd.read_csv(str(analisis_path), dtype=str).fillna("")

    # Tentukan kolom label yang dipakai:
    # Prioritas: kolom 'sentiment' (label asli) > 'sentiment_predict_ml' (prediksi lama)
    label_col = None
    if "sentiment" in df_old.columns:
        label_col = "sentiment"
    elif "sentiment_predict_ml" in df_old.columns:
        label_col = "sentiment_predict_ml"

    if label_col is None or "tweet_preprocessed" not in df_old.columns:
        print("   ⚠️  Data historis tidak memiliki kolom yang dibutuhkan, diabaikan.")
        return None

    df_old = df_old[["tweet_preprocessed", label_col]].copy()
    df_old = df_old.rename(columns={label_col: "sentiment"})
    df_old["sentiment"] = df_old["sentiment"].astype(str).str.lower().str.strip()
    df_old = df_old[df_old["sentiment"].isin(VALID_LABELS)]
    df_old = df_old[df_old["tweet_preprocessed"].str.strip() != ""]

    print(f"   📂 Data historis dimuat: {len(df_old):,} baris dari {analisis_path.name}")
    return df_old


def _smote_oversample_train(X_train, y_train, class_names, random_state):
    """
    Menyeimbangkan data TRAIN (hasil TF-IDF) dengan SMOTE.

    Representasi TF-IDF berupa vektor numerik kontinu, sehingga
    interpolasi linear antar sampel tetangga (prinsip kerja SMOTE)
    valid secara matematis. imblearn.SMOTE mendukung multi-class
    secara native: setiap kelas yang jumlahnya lebih sedikit dari
    kelas dengan sampel terbanyak akan dibuatkan sampel sintetis
    hingga seimbang.

    HANYA diterapkan pada X_train/y_train (setelah TF-IDF fit_transform,
    sebelum training) -- X_test TIDAK ikut di-SMOTE, supaya tetap
    merepresentasikan distribusi data asli dan tidak terjadi data
    leakage.

    Returns
    -------
    tuple(scipy.sparse matrix, np.ndarray, int)
        X_train dan y_train hasil SMOTE, serta k_neighbors yang dipakai.
    """
    unique, counts_before = np.unique(y_train, return_counts=True)
    print(f"\n   SMOTE (data-level) — distribusi train SEBELUM:")
    for cls_idx, cnt in zip(unique, counts_before):
        print(f"      {class_names[cls_idx]:<10}: {cnt:,}")

    # k_neighbors SMOTE tidak boleh >= jumlah sampel kelas minoritas.
    minority_count = counts_before.min()
    k_neighbors_adjusted = min(SMOTE_K_NEIGHBORS, minority_count - 1)
    k_neighbors_adjusted = max(k_neighbors_adjusted, 1)

    if k_neighbors_adjusted != SMOTE_K_NEIGHBORS:
        print(
            f"   Catatan: k_neighbors disesuaikan dari {SMOTE_K_NEIGHBORS} "
            f"menjadi {k_neighbors_adjusted} (kelas minoritas hanya {minority_count} sampel)"
        )

    smote = SMOTE(
        random_state = random_state,
        k_neighbors  = k_neighbors_adjusted,
    )
    X_res, y_res = smote.fit_resample(X_train, y_train)

    unique_after, counts_after = np.unique(y_res, return_counts=True)
    print(f"   SMOTE (data-level) — distribusi train SESUDAH:")
    for cls_idx, cnt in zip(unique_after, counts_after):
        pct = cnt / len(y_res) * 100
        print(f"      {class_names[cls_idx]:<10}: {cnt:,} ({pct:5.1f}%)")

    return X_res, y_res, k_neighbors_adjusted


def step_modelling(
    df_new: pd.DataFrame,
    period: str,
    root_path: str,
    job_id: str,
    set_status: Callable,
) -> tuple[Path, LabelEncoder, dict, float]:
    """
    1. Load data historis (analisis CSV lama)
    2. Gabungkan dengan data baru, buang duplikat
    3. Retrain TF-IDF + LinearSVC dengan data gabungan
       (dengan penanganan imbalance HYBRID: SMOTE + class_weight balanced)
    4. Simpan semua artefak
    """
    set_status(job_id, "Modelling: menyiapkan data...", 18)

    model_dir = Path(root_path) / PERIOD_TO_FOLDER[period]
    model_dir.mkdir(parents=True, exist_ok=True)

    # ── 1. Siapkan data baru ──
    df_new_filtered = df_new[df_new["sentiment"].isin(VALID_LABELS)][
        ["tweet_preprocessed", "sentiment"]
    ].drop_duplicates(subset=["tweet_preprocessed"]).copy()

    print(f"   Data baru (setelah filter label): {len(df_new_filtered):,} baris")

    # ── 2. Load data historis & gabungkan ──
    set_status(job_id, "Modelling: memuat data historis...", 20)
    df_old = _load_historical_data(period, root_path)

    if df_old is not None and len(df_old) > 0:
        df_combined = pd.concat([df_old, df_new_filtered], ignore_index=True)
        # Deduplikasi: data baru menang (keep='last' karena baru ditambah di akhir)
        df_combined = df_combined.drop_duplicates(
            subset=["tweet_preprocessed"], keep="last"
        ).reset_index(drop=True)
        print(f"   Data gabungan (historis + baru, dedup): {len(df_combined):,} baris")
    else:
        df_combined = df_new_filtered.copy()
        print(f"   Hanya data baru: {len(df_combined):,} baris")

    if len(df_combined) == 0:
        raise ValueError("Tidak ada data valid untuk training.")

    # Distribusi label setelah gabung
    dist = df_combined["sentiment"].value_counts()
    print("   Distribusi label gabungan:")
    for label, count in dist.items():
        print(f"     {label}: {count:,} ({count/len(df_combined)*100:.1f}%)")

    # ── 3. Encode label ──
    le = LabelEncoder()
    le.fit(VALID_LABELS)  # urutan tetap: negatif=0, netral=1, positif=2
    y = le.transform(df_combined["sentiment"])
    X = df_combined["tweet_preprocessed"].tolist()
    class_names = list(le.classes_)

    missing_cls = set(VALID_LABELS) - set(df_combined["sentiment"].unique())
    if missing_cls:
        print(f"   ⚠️  Kelas tidak tersedia di data gabungan: {missing_cls}")

    set_status(job_id, "Modelling: split data & TF-IDF...", 22)

    # ── 4. Split 80/20 ──
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=TEST_RATIO, random_state=RANDOM_SEED, stratify=y,
    )
    print(f"   Split: train={len(X_train_raw):,}  test={len(X_test_raw):,}")

    # ── 5. TF-IDF (fit ulang dengan data gabungan) ──
    # PENTING: fit HANYA pada X_train_raw, transform saja untuk X_test_raw,
    # supaya tidak terjadi data leakage dari test set ke vocabulary/IDF.
    tfidf_start = time.time()
    vectorizer  = TfidfVectorizer(**TFIDF_PARAMS)
    X_train     = vectorizer.fit_transform(X_train_raw)
    X_test      = vectorizer.transform(X_test_raw)
    tfidf_rt    = time.time() - tfidf_start
    print(f"   TF-IDF: {X_train.shape[1]:,} fitur  ({tfidf_rt:.2f}s)")

    # ── 5b. PENANGANAN IMBALANCE - DATA LEVEL (SMOTE, multi-class) ──
    # Diterapkan SETELAH TF-IDF, HANYA pada X_train. X_test tidak diubah.
    set_status(job_id, "Modelling: menerapkan SMOTE...", 25)
    smote_start = time.time()

    n_train_before_smote = X_train.shape[0]
    X_train, y_train, k_neighbors_used = _smote_oversample_train(
        X_train, y_train,
        class_names  = class_names,
        random_state = SMOTE_RANDOM_SEED,
    )

    smote_rt = time.time() - smote_start
    print(f"   Train sebelum SMOTE : {n_train_before_smote:,} baris")
    print(f"   Train sesudah SMOTE : {X_train.shape[0]:,} baris")
    print(f"   Runtime SMOTE       : {smote_rt:.2f} detik")

    set_status(job_id, "Modelling: seleksi C terbaik...", 28)

    # ── 6. Seleksi C terbaik (val split ringan, dari data yang sudah di-SMOTE) ──
    train_start = time.time()

    X_sub_tr, X_sub_val, y_sub_tr, y_sub_val = train_test_split(
        X_train, y_train,
        test_size=0.2, random_state=RANDOM_SEED, stratify=y_train,
    )

    best_C     = 1
    best_score = -1.0
    for c in C_CANDIDATES:
        # class_weight="balanced" TETAP dipertahankan sebagai lapisan
        # algorithm-level, meskipun data train sudah diseimbangkan SMOTE.
        # Ini menjadikan penanganan imbalance bersifat HYBRID.
        svm_tmp = LinearSVC(C=c, class_weight="balanced",
                            random_state=RANDOM_SEED, max_iter=2000)
        svm_tmp.fit(X_sub_tr, y_sub_tr)
        score = f1_score(y_sub_val, svm_tmp.predict(X_sub_val),
                         average="macro", zero_division=0)
        print(f"     C={c:<6}  val_f1_macro={score:.4f}")
        if score > best_score:
            best_score = score
            best_C     = c

    print(f"   Best C: {best_C}  (val_f1_macro={best_score:.4f})")
    set_status(job_id, f"Modelling: final training C={best_C}...", 40)

    # ── 7. Final training dengan seluruh X_train (hasil SMOTE) ──
    best_model = LinearSVC(
        C=best_C, class_weight="balanced",
        random_state=RANDOM_SEED, max_iter=2000,
    )
    best_model.fit(X_train, y_train)
    training_rt = time.time() - train_start

    # Evaluasi cepat
    train_acc = accuracy_score(y_train, best_model.predict(X_train))
    test_acc  = accuracy_score(y_test,  best_model.predict(X_test))
    gap       = train_acc - test_acc
    print(f"   Train acc={train_acc:.4f}  Test acc={test_acc:.4f}  Gap={gap:.4f}")
    if gap > 0.10:
        print("   ⚠️  Potensi overfitting — normal untuk LinearSVC dengan data imbalanced")

    # ── 8. Simpan artefak ──
    joblib.dump(best_model, str(model_dir / "svm_model.joblib"))
    joblib.dump(vectorizer, str(model_dir / "tfidf_vectorizer.joblib"))
    joblib.dump(le,         str(model_dir / "label_encoder.joblib"))
    joblib.dump(X_test,     str(model_dir / "X_test.joblib"))
    joblib.dump(y_test,     str(model_dir / "y_test.joblib"))

    # train_info.txt
    old_count = len(df_old) if df_old is not None else 0
    info = (
        f"TRAINING INFO — SVM LinearSVC Update (Hybrid Imbalance Handling)\n"
        f"======================================\n"
        f"Tanggal          : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"Period           : {period}\n"
        f"Data baru        : {len(df_new_filtered):,} baris\n"
        f"Data historis    : {old_count:,} baris\n"
        f"Total gabungan   : {len(df_combined):,} baris\n"
        f"Kelas            : {class_names}\n"
        f"Train (sebelum SMOTE) : {n_train_before_smote:,}\n"
        f"Train (sesudah SMOTE) : {X_train.shape[0]:,}\n"
        f"Test                  : {len(X_test_raw):,}\n"
        f"TF-IDF fitur     : {X_train.shape[1]:,}\n"
        f"\n"
        f"Penanganan Imbalance (HYBRID):\n"
        f"  1. Data-level      : SMOTE (multi-class)\n"
        f"                       k_neighbors  : {k_neighbors_used}\n"
        f"                       random_state : {SMOTE_RANDOM_SEED}\n"
        f"                       Diterapkan setelah TF-IDF, hanya pada data train.\n"
        f"                       Test set tidak diubah.\n"
        f"  2. Algorithm-level : class_weight=\"balanced\" (LinearSVC)\n"
        f"\n"
        f"C candidates     : {C_CANDIDATES}\n"
        f"C terbaik        : {best_C}\n"
        f"Val F1 Macro     : {best_score:.4f}\n"
        f"Train Accuracy   : {train_acc:.4f}\n"
        f"Test  Accuracy   : {test_acc:.4f}\n"
        f"Runtime TF-IDF   : {tfidf_rt:.2f} detik\n"
        f"Runtime SMOTE    : {smote_rt:.2f} detik\n"
        f"Runtime Train    : {training_rt:.2f} detik\n"
    )
    (model_dir / "train_info.txt").write_text(info, encoding="utf-8")

    split_data = {"X_test": X_test, "y_test": y_test, "X_test_raw": X_test_raw}
    set_status(job_id, "Modelling selesai.", 60)
    return model_dir, le, split_data, training_rt


# ══════════════════════════════════════════════════════════════
#  STEP 3 — EVALUASI  (CM + AUC-ROC + metrics CSV)
# ══════════════════════════════════════════════════════════════
def step_evaluasi(
    model_dir: Path,
    le: LabelEncoder,
    split_data: dict,
    job_id: str,
    set_status: Callable,
) -> dict:
    set_status(job_id, "Evaluasi: memuat model terbaik...", 62)

    X_test      = split_data["X_test"]
    y_test      = split_data["y_test"]
    class_names = list(le.classes_)   # ['negatif', 'netral', 'positif']
    n_classes   = len(class_names)

    model = joblib.load(str(model_dir / "svm_model.joblib"))

    set_status(job_id, "Evaluasi: inferensi test set...", 65)
    eval_start = time.time()

    y_pred  = model.predict(X_test)
    y_score = model.decision_function(X_test)  # (n_samples, n_classes)

    eval_rt = time.time() - eval_start

    # Metrik utama (macro)
    acc      = accuracy_score(y_test, y_pred)
    macro_p  = precision_score(y_test, y_pred, average="macro", zero_division=0)
    macro_r  = recall_score(   y_test, y_pred, average="macro", zero_division=0)
    macro_f1 = f1_score(       y_test, y_pred, average="macro", zero_division=0)
    w_f1     = f1_score(       y_test, y_pred, average="weighted", zero_division=0)

    # AUC-ROC One-vs-Rest
    set_status(job_id, "Evaluasi: menghitung AUC-ROC...", 68)
    y_test_bin = label_binarize(y_test, classes=list(range(n_classes)))
    macro_auc  = roc_auc_score(y_test_bin, y_score,
                               average="macro", multi_class="ovr")

    auc_per_class = {}
    for i, cls in enumerate(class_names):
        fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_score[:, i])
        auc_per_class[cls] = auc(fpr, tpr)

    # Confusion Matrix
    set_status(job_id, "Evaluasi: membuat confusion matrix...", 71)
    cm = confusion_matrix(y_test, y_pred, labels=list(range(n_classes)))

    fig, ax = plt.subplots(figsize=(7, 6))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=[c.capitalize() for c in class_names],
        yticklabels=[c.capitalize() for c in class_names],
        linewidths=0.5, ax=ax,
    )
    ax.set_xlabel("Prediksi", fontsize=12, labelpad=10)
    ax.set_ylabel("Aktual",   fontsize=12, labelpad=10)
    ax.set_title(
        f"Confusion Matrix — SVM LinearSVC\nAccuracy: {acc:.4f}",
        fontsize=13, pad=15,
    )
    for i in range(n_classes):
        row_sum = cm[i].sum()
        for j in range(n_classes):
            pct = (cm[i, j] / row_sum * 100) if row_sum > 0 else 0
            ax.text(j + 0.5, i + 0.72, f"({pct:.1f}%)",
                    ha="center", va="center", fontsize=8, color="gray")
    plt.tight_layout()
    plt.savefig(str(model_dir / "confusion_matrix_svm.png"), dpi=150, bbox_inches="tight")
    plt.close()

    # ROC Curve
    set_status(job_id, "Evaluasi: membuat ROC curve...", 74)
    colors = ["#e74c3c", "#3498db", "#2ecc71"]

    fig, ax = plt.subplots(figsize=(7, 6))
    for i, (cls, color) in enumerate(zip(class_names, colors)):
        fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_score[:, i])
        ax.plot(fpr, tpr, color=color, lw=2,
                label=f"{cls.capitalize()} (AUC = {auc_per_class[cls]:.4f})")
    ax.plot([0, 1], [0, 1], "k--", lw=1.5, label="Random Classifier")
    ax.set_title(
        f"ROC Curve — SVM LinearSVC\nMacro AUC = {macro_auc:.4f}", fontsize=13,
    )
    ax.set_xlabel("False Positive Rate (FPR)", fontsize=12)
    ax.set_ylabel("True Positive Rate (TPR)", fontsize=12)
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.legend(loc="lower right", fontsize=10)
    ax.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(str(model_dir / "roc_curve_svm.png"), dpi=150, bbox_inches="tight")
    plt.close()

    # Metrics CSV
    set_status(job_id, "Evaluasi: menyimpan metrics CSV...", 77)
    pd.DataFrame([{
        "accuracy":  acc,
        "precision": macro_p,
        "recall":    macro_r,
        "f1_score":  macro_f1,
        "auc_roc":   macro_auc,
    }]).to_csv(str(model_dir / "evaluation_metrics.csv"), index=False, encoding="utf-8")

    # Classification Report
    report = classification_report(
        y_test, y_pred, target_names=class_names, digits=4, zero_division=0
    )
    report_text = (
        f"EVALUATION REPORT — SVM LinearSVC Update\n"
        f"==========================================\n"
        f"Tanggal      : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"Test set     : {len(y_test):,} baris\n\n"
        f"ACCURACY\n--------\n{acc:.4f}\n\n"
        f"CLASSIFICATION REPORT\n---------------------\n{report}\n"
        f"MACRO METRICS\n-------------\n"
        f"Precision : {macro_p:.4f}\n"
        f"Recall    : {macro_r:.4f}\n"
        f"F1-score  : {macro_f1:.4f}\n\n"
        f"AUC-ROC (One-vs-Rest)\n----------------------\n"
    )
    for cls, score in auc_per_class.items():
        report_text += f"  {cls:<12} : {score:.4f}\n"
    report_text += f"  {'Macro AUC':<12} : {macro_auc:.4f}\n"
    (model_dir / "classification_report_svm.txt").write_text(report_text, encoding="utf-8")

    # Evaluation info
    eval_info = (
        f"EVALUATION INFO — SVM LinearSVC\n"
        f"================================\n"
        f"Tanggal        : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"Test set       : {len(y_test):,} baris\n"
        f"Accuracy       : {acc:.4f}\n"
        f"Precision      : {macro_p:.4f}\n"
        f"Recall         : {macro_r:.4f}\n"
        f"F1-score       : {macro_f1:.4f}\n"
        f"AUC-ROC        : {macro_auc:.4f}\n"
        f"Total runtime  : {eval_rt:.2f} detik\n"
    )
    (model_dir / "evaluation_info.txt").write_text(eval_info, encoding="utf-8")

    set_status(job_id, "Evaluasi selesai.", 80)
    return {
        "accuracy":    acc,
        "precision":   macro_p,
        "recall":      macro_r,
        "f1_score":    macro_f1,
        "f1_weighted": w_f1,
        "f1_macro":    macro_f1,
        "auc_roc":     macro_auc,
        "eval_rt":     eval_rt,
    }


# ══════════════════════════════════════════════════════════════
#  STEP 4 — KOMPARASI
# ══════════════════════════════════════════════════════════════
def step_komparasi(
    period: str,
    metrics: dict,
    training_rt: float,
    root_path: str,
    job_id: str,
    set_status: Callable,
):
    set_status(job_id, "Komparasi: memperbarui tabel...", 83)

    # Skip all_periods dari komparasi
    if period == "all_periods":
        set_status(job_id, "Komparasi: all_periods dilewati.", 87)
        return

    komparasi_path = Path(root_path) / KOMPARASI_CSV
    komparasi_path.parent.mkdir(parents=True, exist_ok=True)

    if komparasi_path.exists():
        df_k = pd.read_csv(str(komparasi_path))
    else:
        df_k = pd.DataFrame(columns=[
            "period", "model", "accuracy", "f1_weighted", "f1_macro",
            "train_rt", "eval_rt", "total_rt", "period_label",
        ])

    total_rt = training_rt + metrics.get("eval_rt", 0)

    new_row = {
        "period":       period,
        "model":        "SMV",
        "accuracy":     round(metrics["accuracy"],    4),
        "f1_weighted":  round(metrics["f1_weighted"], 4),
        "f1_macro":     round(metrics["f1_macro"],    4),
        "train_rt":     round(training_rt,            2),
        "eval_rt":      round(metrics.get("eval_rt", 0), 2),
        "total_rt":     round(total_rt,               2),
        "period_label": PERIOD_LABELS.get(period, period),
    }

    mask = (df_k["period"] == period) & (df_k["model"] == "SVM")
    if mask.any():
        for col, val in new_row.items():
            df_k.loc[mask, col] = val
    else:
        df_k = pd.concat([df_k, pd.DataFrame([new_row])], ignore_index=True)

    df_k.to_csv(str(komparasi_path), index=False, encoding="utf-8-sig")
    set_status(job_id, "Komparasi selesai.", 87)


# ══════════════════════════════════════════════════════════════
#  STEP 5 — ANALISIS SENTIMEN & GABUNG DATA LAMA  (FIXED)
# ══════════════════════════════════════════════════════════════
def step_analisis(
    df_new: pd.DataFrame,
    period: str,
    model_dir: Path,
    le: LabelEncoder,
    root_path: str,
    job_id: str,
    set_status: Callable,
):
    set_status(job_id, "Analisis: prediksi sentimen data baru...", 90)

    model      = joblib.load(str(model_dir / "svm_model.joblib"))
    vectorizer = joblib.load(str(model_dir / "tfidf_vectorizer.joblib"))

    texts   = df_new["tweet_preprocessed"].tolist()
    X_infer = vectorizer.transform(texts)
    y_pred  = model.predict(X_infer)

    df_new = df_new.copy()
    df_new["sentiment_predict_ml"] = le.inverse_transform(y_pred)

    # Bangun df_new_clean dengan kolom standar
    tweet_col = "tweet_original" if "tweet_original" in df_new.columns else next(
        (c for c in df_new.columns
         if "tweet" in c.lower() and c != "tweet_preprocessed"), None
    )
    date_col  = next((c for c in df_new.columns if c in ("date", "tanggal")),  None)
    saham_col = next((c for c in df_new.columns if c in ("saham", "stock", "ticker")), None)

    df_new_clean = pd.DataFrame({
        "date"                : df_new[date_col].values  if date_col  else [""] * len(df_new),
        "tweet"               : df_new[tweet_col].values if tweet_col else [""] * len(df_new),
        # ── PENTING: kolom "sentiment" yang dibaca datasetController harus
        #    berisi hasil prediksi model SVM (bukan label lexicon asli).
        #    SVM mengenal 3 kelas: positif / negatif / netral.
        "sentiment"           : df_new["sentiment_predict_ml"].values,
        "saham"               : df_new[saham_col].values if saham_col else [""] * len(df_new),
        "tweet_preprocessed"  : df_new["tweet_preprocessed"].values,
        "sentiment_predict_ml": df_new["sentiment_predict_ml"].values,
        # simpan juga label asli lexicon sebagai referensi
        "sentiment_label_asli": df_new["sentiment"].values,
    })

    set_status(job_id, "Analisis: menggabungkan dengan data lama...", 94)

    analisis_path = Path(root_path) / ANALISIS_FILES[period]
    analisis_path.parent.mkdir(parents=True, exist_ok=True)

    if analisis_path.exists():
        try:
            df_old = pd.read_csv(str(analisis_path), dtype=str, encoding="utf-8-sig").fillna("")
        except Exception:
            df_old = pd.read_csv(str(analisis_path), dtype=str, encoding="latin-1").fillna("")
        print(f"   OLD DATA : {len(df_old):,} baris  kolom: {list(df_old.columns)}")
    else:
        df_old = pd.DataFrame()
        print("   \u2139\ufe0f  Dataset analisis lama belum ada, mulai dari nol.")

    print(f"   NEW DATA : {len(df_new_clean):,} baris")

    if len(df_old) > 0:
        for col in ["tweet_preprocessed", "sentiment_predict_ml"]:
            if col not in df_old.columns:
                df_old[col] = ""

        if "tweet" in df_old.columns:
            existing = set(df_old["tweet"].str.strip().str.lower())
            mask_new = ~df_new_clean["tweet"].str.strip().str.lower().isin(existing)
            df_truly_new = df_new_clean[mask_new].copy()
        else:
            df_truly_new = df_new_clean.copy()

        print(f"   Tweet baru (belum ada di data lama): {len(df_truly_new):,}")
        df_combined = pd.concat([df_old, df_truly_new], ignore_index=True)
    else:
        df_combined = df_new_clean.copy()

    print(f"   TOTAL AKHIR : {len(df_combined):,} baris")
    df_combined.to_csv(str(analisis_path), index=False, encoding="utf-8-sig")
    print(f"   \u2705 Analisis disimpan: {analisis_path.name} ({len(df_combined):,} baris total)")

    set_status(job_id, "Analisis selesai.", 98)


# ══════════════════════════════════════════════════════════════
#  ENTRY POINT
# ══════════════════════════════════════════════════════════════
def run_full_pipeline(
    job_id: str,
    period: str,
    csv_path: str,
    root_path: str,
    set_status: Callable,
):
    try:
        total_start = time.time()

        # Step 1 — preprocessing data baru
        df = step_preprocessing(csv_path, root_path, job_id, set_status)

        # Step 2 — gabung data lama + baru, retrain (dengan hybrid imbalance handling)
        model_dir, le, split_data, training_rt = step_modelling(
            df, period, root_path, job_id, set_status
        )

        # Step 3 — evaluasi
        metrics = step_evaluasi(model_dir, le, split_data, job_id, set_status)

        # Step 4 — update komparasi
        step_komparasi(period, metrics, training_rt, root_path, job_id, set_status)

        # Step 5 — prediksi & simpan analisis
        step_analisis(df, period, model_dir, le, root_path, job_id, set_status)

        # Hapus file temp
        try:
            os.remove(csv_path)
        except OSError:
            pass

        total_rt = time.time() - total_start
        set_status(
            job_id,
            f"✅ Pipeline selesai dalam {total_rt:.1f} detik.",
            100,
            done=True,
        )

    except Exception as e:
        set_status(job_id, f"Error: {e}", 0, done=True, error=str(e))
        raise