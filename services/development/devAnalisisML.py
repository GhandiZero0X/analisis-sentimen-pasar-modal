# services/development/devAnalisisML.py

import time
from pathlib import Path

import joblib
import pandas as pd

# =========================
# PATH
# =========================
BASE_DIR = Path(__file__).resolve().parent

INPUT_DIR = BASE_DIR / "dev_database" / "3_preprocessing" / "S1S3" / "ml"
MODEL_ROOT = BASE_DIR / "dev_database" / "4_model" / "S3" / "ml"
OUTPUT_DIR = BASE_DIR / "dev_database" / "6_analisis" / "ml"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PERIOD_FILES = {
    "before": "tweets_before_covid_labellingLexicon_preprocessingML.csv",
    "covid": "tweets_covid_labellingLexicon_preprocessingML.csv",
    "after": "tweets_after_covid_labellingLexicon_preprocessingML.csv",
    "all_periods": "tweets_all_periods_labellingLexicon_preprocessingML.csv",
}

MODEL_PATHS = {
    "before": MODEL_ROOT / "before",
    "covid": MODEL_ROOT / "covid",
    "after": MODEL_ROOT / "after",
    "all_periods": MODEL_ROOT / "all_periods",
}

# =========================
# CACHE
# =========================
_model_cache = {}


def find_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    cols_lower = {c.lower(): c for c in df.columns}
    for cand in candidates:
        if cand in cols_lower:
            return cols_lower[cand]
    return None


def find_text_column(df: pd.DataFrame) -> str | None:
    return find_column(df, [
        "tweet_preprocessed",
        "tweet_preprocessed_ml",
        "tweet",
        "text",
        "teks",
    ])


def find_date_column(df: pd.DataFrame) -> str | None:
    return find_column(df, ["date", "tanggal", "created_at", "datetime"])


def find_saham_column(df: pd.DataFrame) -> str | None:
    return find_column(df, ["saham", "stock", "ticker"])


def find_output_tweet_column(df: pd.DataFrame, text_col: str) -> str:
    return find_column(df, ["tweet"]) or text_col


def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    return " ".join(text.replace("\u00A0", " ").split()).strip()


def get_model_bundle(periode: str):
    if periode in _model_cache:
        return _model_cache[periode]

    model_dir = MODEL_PATHS.get(periode)
    if model_dir is None or not model_dir.exists():
        raise FileNotFoundError(f"Folder model tidak ditemukan: {model_dir}")

    model_file = model_dir / "svm_model.joblib"
    vectorizer_file = model_dir / "tfidf_vectorizer.joblib"
    encoder_file = model_dir / "label_encoder.joblib"

    if not model_file.exists():
        raise FileNotFoundError(f"Model tidak ditemukan: {model_file}")
    if not vectorizer_file.exists():
        raise FileNotFoundError(f"Vectorizer tidak ditemukan: {vectorizer_file}")
    if not encoder_file.exists():
        raise FileNotFoundError(f"Label encoder tidak ditemukan: {encoder_file}")

    model = joblib.load(model_file)
    vectorizer = joblib.load(vectorizer_file)
    le = joblib.load(encoder_file)

    bundle = {
        "model": model,
        "vectorizer": vectorizer,
        "le": le,
    }
    _model_cache[periode] = bundle
    return bundle


def predict_texts(texts: list[str], periode: str) -> list[str]:
    bundle = get_model_bundle(periode)
    model = bundle["model"]
    vectorizer = bundle["vectorizer"]
    le = bundle["le"]

    X = vectorizer.transform(texts)
    preds = model.predict(X)

    # Output label asli (negatif/netral/positif)
    if le is not None:
        labels = le.inverse_transform(preds)
    else:
        labels = preds

    return [str(x).lower() for x in labels]


def process_one_file(periode: str) -> None:
    input_file = INPUT_DIR / PERIOD_FILES[periode]
    if not input_file.exists():
        print(f"⚠️  File tidak ditemukan: {input_file}")
        return

    print(f"\n{'=' * 70}")
    print(f"ML ANALYSIS | {periode.upper()}")
    print(f"Input : {input_file}")
    print(f"Model : {MODEL_PATHS[periode]}")
    print(f"{'=' * 70}")

    df = pd.read_csv(input_file, dtype=str).fillna("")

    text_col = find_text_column(df)
    if text_col is None:
        print("❌ Kolom preprocessing tidak ditemukan.")
        return

    date_col = find_date_column(df)
    saham_col = find_saham_column(df)
    tweet_out_col = find_output_tweet_column(df, text_col)

    df = df[df[text_col].astype(str).str.strip() != ""].copy()
    if df.empty:
        print("⚠️  Data kosong setelah filter teks.")
        return

    texts = [clean_text(t) for t in df[text_col].tolist()]

    start = time.time()
    preds = predict_texts(texts, periode)
    runtime = time.time() - start

    # Output final sesuai permintaan:
    # date, tweet, sentiment, saham
    out = pd.DataFrame({
        "date": df[date_col].astype(str).values if date_col else [""] * len(df),
        "tweet": df[tweet_out_col].astype(str).values,
        "sentiment": preds,
        "saham": df[saham_col].astype(str).values if saham_col else [""] * len(df),
    })

    output_file = OUTPUT_DIR / input_file.name.replace(
        "_preprocessingML.csv", "_analisisML.csv"
    )
    out.to_csv(output_file, index=False, encoding="utf-8-sig")

    print(f"✅ Output disimpan: {output_file}")
    print(f"⏱ Runtime inferensi: {runtime:.2f} detik")
    print(f"📦 Total baris      : {len(out):,}")


def main():
    for periode in ["before", "covid", "after", "all_periods"]:
        process_one_file(periode)


if __name__ == "__main__":
    main()