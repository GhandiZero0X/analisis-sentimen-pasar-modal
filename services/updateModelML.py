# services/updateModelML.py
"""
Pipeline Update Model SVM (production):
  1. Preprocessing   →
       1. Casefolding
       2. Text Cleaning:
           i.   Hapus URL
           ii.  Hapus hashtag (#), cashtag ($), mention (@)
           iii. Hapus emoji dan emotikon
           iv.  Hapus angka yang tidak memiliki makna kontekstual
           v.   Hapus karakter selain alfabet
           vi.  Normalisasi singkatan & slang → kata baku (kamus)
       3. Tokenization  (Stanza)
       4. Stopword Removal (NLTK)
       5. Stemming (Sastrawi)
  2. Modelling       → load model .joblib yang ada, retrain dengan data baru,
                       label NEGATIF, NETRAL, POSITIF semuanya dipakai
  3. Evaluasi        → confusion matrix, ROC curve, metrics CSV,
                       classification report, AUC-ROC (OvR)
  4. Komparasi       → update tabel_komparasi.csv
  5. Analisis        → prediksi sentimen data baru, gabung dengan data lama
"""

from __future__ import annotations

import csv
import io
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
matplotlib.use("Agg")  # non-interactive backend
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import nltk
import stanza

from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from nltk.corpus import stopwords

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
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

ANALISIS_FILES = {
    "before":      "data/csv/ml/tweets_before_labelling_analisisML.csv",
    "covid":       "data/csv/ml/tweets_covid_labelling_analisisML.csv",
    "after":       "data/csv/ml/tweets_after_labelling_analisisML.csv",
    "all_periods": "data/csv/ml/tweets_all_periods_labelling_analisisML.csv",
}

KOMPARASI_CSV = "data/komparasi/tabel_komparasi.csv"
KAMUS_FILE    = "data/kamus/kamuskatabaku.xlsx"

VALID_LABELS  = ["negatif", "netral", "positif"]
RANDOM_SEED   = 0
TEST_RATIO    = 0.20

# TF-IDF hyperparameter
TFIDF_PARAMS = {
    "ngram_range":  (1, 2),
    "max_features": 10_000,
    "min_df":       5,
    "max_df":       0.9,
    "sublinear_tf": True,
}

# GridSearch C candidates (ringan, tanpa GridSearchCV agar tidak block)
C_CANDIDATES = [0.01, 0.1, 1, 10, 100]


# ══════════════════════════════════════════════════════════════
#  LAZY-LOAD NLP RESOURCES  (inisialisasi sekali per proses)
# ══════════════════════════════════════════════════════════════
_nlp_stanza   = None
_stop_words   = None
_stemmer      = None


def _get_nlp(root_path: str):
    """Inisialisasi Stanza pipeline (lazy)."""
    global _nlp_stanza
    if _nlp_stanza is None:
        # Coba gunakan model yang sudah ter-download; jika belum, download
        try:
            _nlp_stanza = stanza.Pipeline(
                lang="id",
                processors="tokenize",
                tokenize_no_ssplit=True,
                verbose=False,
            )
        except Exception:
            stanza.download("id", verbose=False)
            _nlp_stanza = stanza.Pipeline(
                lang="id",
                processors="tokenize",
                tokenize_no_ssplit=True,
                verbose=False,
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
    """
    Pipeline preprocessing SVM:
    1. Casefolding
    2. Text Cleaning (URL, hashtag, cashtag, mention, emoji,
       emotikon, angka standalone, karakter non-alfabet)
    3. Normalisasi slang via kamus
    4. Tokenization (Stanza)
    5. Stopword Removal
    6. Stemming (Sastrawi)
    """
    # 1. Casefolding
    tweet = str(tweet).lower()

    # 2. Text Cleaning
    tweet = re.sub(r"(https?://|ftp://|www\.)\S+|bit\.ly/\S+|t\.co/\S+", " ", tweet)
    tweet = re.sub(r"#\w+", " ", tweet)
    tweet = re.sub(r"\$\w+", " ", tweet)
    tweet = re.sub(r"@\w+", " ", tweet)
    tweet = emoji.replace_emoji(tweet, replace=" ")
    tweet = re.sub(
        r"(:-?\)|:-?\(|;-?\)|:-?D|:-?P|:-?\||:'[(\)]|<3|>:<|xD|:'\))",
        " ", tweet, flags=re.IGNORECASE,
    )
    tweet = re.sub(r"\b\d+\b", " ", tweet)        # angka standalone
    tweet = re.sub(r"[^a-z\s]", " ", tweet)       # non-alfabet
    tweet = re.sub(r"\s+", " ", tweet).strip()

    # 3. Normalisasi slang
    words = [kamus.get(w, w) for w in tweet.split()]
    tweet = " ".join(words)

    # 4. Tokenization (Stanza)
    doc    = nlp(tweet)
    tokens = [word.text for sent in doc.sentences for word in sent.words]

    # 5. Stopword Removal
    tokens = [t for t in tokens if t not in stop_words]

    # 6. Stemming
    tokens = [stemmer.stem(t) for t in tokens]

    # Buang token terlalu pendek
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

    # Deteksi kolom teks
    text_col = next(
        (c for c in df.columns if "tweet" in c.lower()),
        df.columns[0],
    )
    # Deteksi kolom label
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

    # Normalkan nama kolom sentimen
    if sentiment_col != "sentiment":
        df = df.rename(columns={sentiment_col: "sentiment"})

    df["sentiment"] = df["sentiment"].astype(str).str.lower().str.strip()

    # Simpan teks asli untuk analisis
    df["tweet_original"] = df[text_col]

    # Hapus baris kosong setelah preprocessing
    before = len(df)
    df = df[df["tweet_preprocessed"].str.strip() != ""].reset_index(drop=True)
    after  = len(df)
    print(f"   Preprocessing: {before} → {after} baris (hapus {before - after} kosong)")

    set_status(job_id, "Preprocessing selesai.", 15)
    return df


# ══════════════════════════════════════════════════════════════
#  STEP 2 — MODELLING (TF-IDF + LinearSVC)
# ══════════════════════════════════════════════════════════════
def step_modelling(
    df: pd.DataFrame,
    period: str,
    root_path: str,
    job_id: str,
    set_status: Callable,
) -> tuple[Path, LabelEncoder, dict, float]:
    """
    - Filter label NEGATIF, NETRAL, POSITIF
    - Split 80/20
    - TF-IDF vectorization
    - LinearSVC: coba beberapa C, pilih C terbaik (manual cross-val ringan)
    - Simpan artefak (.joblib)
    Return: (model_dir, label_encoder, split_data, training_rt)
    """
    set_status(job_id, "Modelling: menyiapkan data...", 18)

    model_dir = Path(root_path) / PERIOD_TO_FOLDER[period]
    model_dir.mkdir(parents=True, exist_ok=True)

    # Filter label valid
    df_train = df[df["sentiment"].isin(VALID_LABELS)].reset_index(drop=True)
    if len(df_train) == 0:
        raise ValueError(
            f"Tidak ada data dengan label {VALID_LABELS} di CSV."
        )

    # Distribusi label
    dist = df_train["sentiment"].value_counts()
    print(f"   Distribusi label:")
    for label, count in dist.items():
        print(f"     {label}: {count:,} ({count/len(df_train)*100:.1f}%)")

    le = LabelEncoder()
    le.fit(VALID_LABELS)           # paksa urutan tetap: negatif=0, netral=1, positif=2
    y  = le.transform(df_train["sentiment"])
    X  = df_train["tweet_preprocessed"].tolist()

    # Validasi semua kelas tersedia
    unique_classes = set(df_train["sentiment"].unique())
    missing_cls    = set(VALID_LABELS) - unique_classes
    if missing_cls:
        print(f"   ⚠️  Kelas tidak tersedia di data: {missing_cls}")

    set_status(job_id, "Modelling: split data & TF-IDF...", 22)

    # Split 80/20
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y,
        test_size=TEST_RATIO,
        random_state=RANDOM_SEED,
        stratify=y,
    )
    print(f"   Split: train={len(X_train_raw):,}  test={len(X_test_raw):,}")

    # ── TF-IDF ──
    tfidf_start = time.time()

    # Cek apakah vectorizer lama tersedia; jika ada, fit ulang dengan data baru
    vectorizer_path = model_dir / "tfidf_vectorizer.joblib"
    vectorizer = TfidfVectorizer(**TFIDF_PARAMS)
    X_train = vectorizer.fit_transform(X_train_raw)
    X_test  = vectorizer.transform(X_test_raw)

    tfidf_rt = time.time() - tfidf_start
    print(f"   TF-IDF: {X_train.shape[1]:,} fitur  ({tfidf_rt:.2f}s)")

    set_status(job_id, "Modelling: melatih LinearSVC...", 28)

    # ── Pilih C terbaik dengan split sederhana (80% subtrain / 20% val) ──
    # Menghindari GridSearchCV agar tidak memblokir terlalu lama
    train_start = time.time()

    X_sub_tr, X_sub_val, y_sub_tr, y_sub_val = train_test_split(
        X_train, y_train,
        test_size=0.2,
        random_state=RANDOM_SEED,
        stratify=y_train,
    )

    best_C     = 1
    best_score = -1.0
    for c in C_CANDIDATES:
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

    # Latih ulang dengan SELURUH X_train menggunakan best_C
    best_model = LinearSVC(
        C=best_C,
        class_weight="balanced",
        random_state=RANDOM_SEED,
        max_iter=2000,
    )
    best_model.fit(X_train, y_train)

    training_rt = time.time() - train_start

    # ── Evaluasi cepat train vs test ──
    train_acc = accuracy_score(y_train, best_model.predict(X_train))
    test_acc  = accuracy_score(y_test,  best_model.predict(X_test))
    print(f"   Train acc={train_acc:.4f}  Test acc={test_acc:.4f}")
    if train_acc - test_acc > 0.10:
        print("   ⚠️  Potensi overfitting")

    # ── Simpan artefak ──
    joblib.dump(best_model,  str(model_dir / "svm_model.joblib"))
    joblib.dump(vectorizer,  str(model_dir / "tfidf_vectorizer.joblib"))
    joblib.dump(le,          str(model_dir / "label_encoder.joblib"))
    joblib.dump(X_test,      str(model_dir / "X_test.joblib"))
    joblib.dump(y_test,      str(model_dir / "y_test.joblib"))

    # train_info.txt
    info = (
        f"TRAINING INFO — SVM LinearSVC Update\n"
        f"======================================\n"
        f"Tanggal          : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"Period           : {period}\n"
        f"Total data       : {len(df_train):,}\n"
        f"Kelas            : {list(le.classes_)}\n"
        f"Train / Test     : {len(X_train_raw):,} / {len(X_test_raw):,}\n"
        f"TF-IDF fitur     : {X_train.shape[1]:,}\n"
        f"C candidates     : {C_CANDIDATES}\n"
        f"C terbaik        : {best_C}\n"
        f"Val F1 Macro     : {best_score:.4f}\n"
        f"Train Accuracy   : {train_acc:.4f}\n"
        f"Test  Accuracy   : {test_acc:.4f}\n"
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

    X_test     = split_data["X_test"]
    y_test     = split_data["y_test"]
    class_names = list(le.classes_)          # ['negatif', 'netral', 'positif']
    n_classes   = len(class_names)

    model = joblib.load(str(model_dir / "svm_model.joblib"))

    set_status(job_id, "Evaluasi: inferensi test set...", 65)
    eval_start = time.time()

    y_pred  = model.predict(X_test)
    y_score = model.decision_function(X_test)   # shape: (n_samples, n_classes)

    eval_rt = time.time() - eval_start

    # ── Metrik utama (macro untuk multiclass) ──
    acc       = accuracy_score(y_test, y_pred)
    macro_p   = precision_score(y_test, y_pred, average="macro", zero_division=0)
    macro_r   = recall_score(   y_test, y_pred, average="macro", zero_division=0)
    macro_f1  = f1_score(       y_test, y_pred, average="macro", zero_division=0)
    w_f1      = f1_score(       y_test, y_pred, average="weighted", zero_division=0)

    # ── AUC-ROC One-vs-Rest ──
    set_status(job_id, "Evaluasi: menghitung AUC-ROC...", 68)
    y_test_bin = label_binarize(y_test, classes=list(range(n_classes)))
    macro_auc  = roc_auc_score(y_test_bin, y_score,
                               average="macro", multi_class="ovr")

    auc_per_class = {}
    for i, cls in enumerate(class_names):
        fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_score[:, i])
        auc_per_class[cls] = auc(fpr, tpr)

    # ── Confusion Matrix ──
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

    # ── ROC Curve ──
    set_status(job_id, "Evaluasi: membuat ROC curve...", 74)
    colors = ["#e74c3c", "#3498db", "#2ecc71"]

    fig, ax = plt.subplots(figsize=(7, 6))
    for i, (cls, color) in enumerate(zip(class_names, colors)):
        fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_score[:, i])
        ax.plot(fpr, tpr, color=color, lw=2,
                label=f"{cls.capitalize()} (AUC = {auc_per_class[cls]:.4f})")

    ax.plot([0, 1], [0, 1], "k--", lw=1.5, label="Random Classifier")
    ax.set_title(
        f"ROC Curve — SVM LinearSVC\nMacro AUC = {macro_auc:.4f}",
        fontsize=13,
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

    # ── Metrics CSV ──
    set_status(job_id, "Evaluasi: menyimpan metrics CSV...", 77)
    pd.DataFrame([{
        "accuracy":  acc,
        "precision": macro_p,
        "recall":    macro_r,
        "f1_score":  macro_f1,
        "auc_roc":   macro_auc,
    }]).to_csv(str(model_dir / "evaluation_metrics.csv"), index=False, encoding="utf-8")

    # ── Classification Report ──
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

    # ── Evaluation info ──
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
#  STEP 4 — KOMPARASI (update tabel_komparasi.csv)
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
        "model":        "S2 ML",            # sesuai label di komparasi
        "accuracy":     round(metrics["accuracy"],    4),
        "f1_weighted":  round(metrics["f1_weighted"], 4),
        "f1_macro":     round(metrics["f1_macro"],    4),
        "train_rt":     round(training_rt,            2),
        "eval_rt":      round(metrics.get("eval_rt", 0), 2),
        "total_rt":     round(total_rt,               2),
        "period_label": PERIOD_LABELS.get(period, period),
    }

    mask = (df_k["period"] == period) & (df_k["model"] == "S2 ML")
    if mask.any():
        for col, val in new_row.items():
            df_k.loc[mask, col] = val
    else:
        df_k = pd.concat([df_k, pd.DataFrame([new_row])], ignore_index=True)

    df_k.to_csv(str(komparasi_path), index=False, encoding="utf-8-sig")
    set_status(job_id, "Komparasi selesai.", 87)


# ══════════════════════════════════════════════════════════════
#  STEP 5 — ANALISIS SENTIMEN & GABUNG DATA LAMA
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

    set_status(job_id, "Analisis: menggabungkan dengan data lama...", 94)

    analisis_path = Path(root_path) / ANALISIS_FILES[period]
    analisis_path.parent.mkdir(parents=True, exist_ok=True)

    if analisis_path.exists():
        df_old      = pd.read_csv(str(analisis_path), dtype=str).fillna("")
        df_combined = pd.concat([df_old, df_new], ignore_index=True)
        if "tweet_original" in df_combined.columns:
            df_combined = df_combined.drop_duplicates(
                subset=["tweet_original"]
            ).reset_index(drop=True)
    else:
        df_combined = df_new

    df_combined.to_csv(str(analisis_path), index=False, encoding="utf-8-sig")
    print(f"   ✅ Analisis disimpan: {analisis_path.name} ({len(df_combined):,} baris total)")

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

        # Step 1
        df = step_preprocessing(csv_path, root_path, job_id, set_status)

        # Step 2
        model_dir, le, split_data, training_rt = step_modelling(
            df, period, root_path, job_id, set_status
        )

        # Step 3
        metrics = step_evaluasi(model_dir, le, split_data, job_id, set_status)

        # Step 4
        step_komparasi(period, metrics, training_rt, root_path, job_id, set_status)

        # Step 5
        step_analisis(df, period, model_dir, le, root_path, job_id, set_status)

        # Hapus file upload temp
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