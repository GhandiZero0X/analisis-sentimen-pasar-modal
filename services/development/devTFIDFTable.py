"""
=============================================================
GENERATE TABEL FEATURE EXTRACTION TF-IDF — PER PERIODE v3
=============================================================
Perubahan dari v2:
    - TOP_N = 20 (dari 10)
    - Tweet ditampilkan FULL (tidak dipotong)
    - SAMPLE_TWEET = 10
    - SAMPLE_FITUR = TOP_N (kolom fitur matriks = jumlah top fitur)
=============================================================
"""

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# ══════════════════════════════════════════════════════════════
#  PATH — SESUAIKAN DENGAN STRUKTUR FOLDER KAMU
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "dev_database" / "9_tabel_feature_extraction"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PERIODE_FILES = {
    "Pre-COVID"  : "tweets_before_covid_labellingLexicon_preprocessingML.csv",
    "COVID"      : "tweets_covid_labellingLexicon_preprocessingML.csv",
    "Post-COVID" : "tweets_after_covid_labellingLexicon_preprocessingML.csv",
}

PERIODE_SLUG = {
    "Pre-COVID"  : "before",
    "COVID"      : "covid",
    "Post-COVID" : "after",
}

INPUT_DIR = {
    "S1": BASE_DIR / "dev_database" / "3_preprocessing" / "S1S3" / "ml",
    "S2": BASE_DIR / "dev_database" / "3_preprocessing" / "S2"   / "ml",
    "S3": BASE_DIR / "dev_database" / "3_preprocessing" / "S1S3" / "ml",
}

LABELS = {
    "S1": ["positif", "negatif"],
    "S2": ["positif", "negatif"],
    "S3": ["positif", "negatif", "netral"],
}

TFIDF_PARAMS = dict(
    ngram_range  = (1, 2),
    max_features = 10000,
    min_df       = 5,
    max_df       = 0.9,
    sublinear_tf = True,
)

TOP_N        = 50   # jumlah top fitur
SAMPLE_TWEET = 50   # jumlah tweet sampel di matriks
SAMPLE_FITUR = TOP_N  # kolom fitur di matriks = sama dengan TOP_N


# ══════════════════════════════════════════════════════════════
#  LOAD DATA
# ══════════════════════════════════════════════════════════════
def load_data(filepath: Path, labels: list) -> pd.DataFrame:
    if not filepath.exists():
        print(f"   ⚠️  File tidak ditemukan: {filepath.name}")
        return pd.DataFrame()
    df = pd.read_csv(filepath, dtype=str).fillna("")
    df = df[df["tweet_preprocessed"].str.strip() != ""].copy()
    df["sentiment"] = df["sentiment"].str.lower().str.strip()
    df = df[df["sentiment"].isin(labels)].reset_index(drop=True)
    return df


# ══════════════════════════════════════════════════════════════
#  TOP FITUR
# ══════════════════════════════════════════════════════════════
def generate_top_fitur(vectorizer, X, top_n=20):

    feature_names = vectorizer.get_feature_names_out()

    max_tfidf = np.asarray(
        X.max(axis=0).toarray()
    ).flatten()

    mean_tfidf = np.asarray(
        X.mean(axis=0)
    ).flatten()

    df_fitur = pd.DataFrame({
        "Fitur (Token)" : feature_names,
        "Max TF-IDF"    : max_tfidf,
        "Mean TF-IDF"   : mean_tfidf
    })

    df_fitur = (
        df_fitur
        .sort_values(
            by=["Max TF-IDF","Mean TF-IDF"],
            ascending=False
        )
        .head(top_n)
        .reset_index(drop=True)
    )

    df_fitur.insert(
        0,
        "No",
        range(1, len(df_fitur)+1)
    )

    df_fitur["Max TF-IDF"] = (
        df_fitur["Max TF-IDF"]
        .round(4)
    )

    df_fitur["Mean TF-IDF"] = (
        df_fitur["Mean TF-IDF"]
        .round(4)
    )

    return df_fitur


# ══════════════════════════════════════════════════════════════
#  SAMPEL MATRIKS — tweet FULL, tidak dipotong
# ══════════════════════════════════════════════════════════════
def generate_sampel_matriks(
    vectorizer,
    X,
    df_raw,
    n_tweet=10,
    n_fitur=20
):
    """
    Menampilkan tweet yang paling representatif
    berdasarkan total bobot TF-IDF.
    """

    feature_names = vectorizer.get_feature_names_out()

    mean_tfidf = np.asarray(X.mean(axis=0)).flatten()

    top_idx = np.argsort(mean_tfidf)[::-1][:n_fitur]

    top_features = feature_names[top_idx]

    # =====================================================
    # Cari tweet paling representatif
    # =====================================================

    X_top = X[:, top_idx]

    total_score = np.asarray(
        X_top.sum(axis=1)
    ).flatten()

    best_rows = np.argsort(total_score)[::-1][:n_tweet]

    X_dense = (
        X[best_rows][:, top_idx]
        .toarray()
        .round(4)
    )

    df_matriks = pd.DataFrame(
        X_dense,
        columns=top_features
    )

    df_matriks.insert(
        0,
        "Sentimen",
        df_raw.iloc[best_rows]["sentiment"].values
    )

    df_matriks.insert(
        0,
        "Tweet Preprocessed",
        df_raw.iloc[best_rows]["tweet_preprocessed"].values
    )

    return df_matriks


# ══════════════════════════════════════════════════════════════
#  PROSES UTAMA
# ══════════════════════════════════════════════════════════════
def main():
    print("=" * 65)
    print("  GENERATE TABEL TF-IDF v3 — PER SKENARIO PER PERIODE")
    print(f"  TOP_N={TOP_N} | SAMPLE_TWEET={SAMPLE_TWEET} | SAMPLE_FITUR={SAMPLE_FITUR}")
    print("=" * 65)

    ringkasan_rows = []

    for skenario in ["S1", "S2", "S3"]:
        labels    = LABELS[skenario]
        input_dir = INPUT_DIR[skenario]

        print(f"\n{'─'*65}")
        print(f"  SKENARIO {skenario}  |  Label: {labels}")
        print(f"{'─'*65}")

        for periode, filename in PERIODE_FILES.items():
            slug     = PERIODE_SLUG[periode]
            filepath = input_dir / filename

            print(f"\n  [{skenario}] {periode}")

            df = load_data(filepath, labels)
            if df.empty:
                print(f"  ⚠️  Skip")
                continue

            total_data = len(df)
            print(f"  ✅ Data: {total_data:,} baris")
            for lbl, cnt in df["sentiment"].value_counts().items():
                print(f"     {lbl:<12}: {cnt:,} ({cnt/total_data*100:.1f}%)")

            # Split 80/20
            le = LabelEncoder()
            y  = le.fit_transform(df["sentiment"])
            X_train_raw, X_test_raw, _, _ = train_test_split(
                df["tweet_preprocessed"], y,
                test_size=0.2, random_state=0, stratify=y
            )
            n_train = len(X_train_raw)
            n_test  = len(X_test_raw)

            # TF-IDF
            vectorizer = TfidfVectorizer(**TFIDF_PARAMS)
            X_train    = vectorizer.fit_transform(X_train_raw)
            X_all      = vectorizer.transform(df["tweet_preprocessed"])

            n_fitur = X_train.shape[1]
            print(f"  ✅ Fitur: {n_fitur:,} | Train: {n_train:,} | Test: {n_test:,}")

            # Top Fitur
            df_top = generate_top_fitur(vectorizer, X_train, TOP_N)
            out_top = OUTPUT_DIR / f"top_fitur_{skenario}_{slug}.csv"
            df_top.to_csv(out_top, index=False, encoding="utf-8-sig")
            print(f"  💾 {out_top.name}")

            # Sampel Matriks
            df_matriks = generate_sampel_matriks(
                vectorizer, X_all, df, SAMPLE_TWEET, SAMPLE_FITUR
            )
            out_matriks = OUTPUT_DIR / f"sampel_matriks_{skenario}_{slug}.csv"
            df_matriks.to_csv(out_matriks, encoding="utf-8-sig")
            print(f"  💾 {out_matriks.name}")

            ringkasan_rows.append({
                "Skenario"        : skenario,
                "Periode"         : periode,
                "Total Data"      : total_data,
                "Data Latih (80%)": n_train,
                "Data Uji (20%)"  : n_test,
                "Jumlah Fitur"    : n_fitur,
            })

    # Ringkasan
    df_ringkasan = pd.DataFrame(ringkasan_rows)
    out_ringkasan = OUTPUT_DIR / "ringkasan_split_data.csv"
    df_ringkasan.to_csv(out_ringkasan, index=False, encoding="utf-8-sig")

    print(f"\n{'='*65}")
    print("  RINGKASAN SPLIT DATA")
    print(f"{'='*65}")
    print(df_ringkasan.to_string(index=False))
    print(f"\n✅ Output: {OUTPUT_DIR}")
    print(f"{'='*65}")


if __name__ == "__main__":
    main()