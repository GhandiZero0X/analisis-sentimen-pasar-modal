# services/development/devAnalisisDL.py

import time
from pathlib import Path

import joblib
import pandas as pd
import torch
from transformers import AutoConfig, AutoModelForSequenceClassification, AutoTokenizer

# =========================
# PATH
# =========================
BASE_DIR = Path(__file__).resolve().parent

INPUT_DIR = BASE_DIR / "dev_database" / "3_preprocessing" / "S1S3" / "dl"
MODEL_ROOT = BASE_DIR / "dev_database" / "4_model" / "S1" / "dl"
OUTPUT_DIR = BASE_DIR / "dev_database" / "6_analisis" / "dl"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PERIOD_FILES = {
    "before": "tweets_before_covid_labellingLexicon_preprocessingDL.csv",
    "covid": "tweets_covid_labellingLexicon_preprocessingDL.csv",
    "after": "tweets_after_covid_labellingLexicon_preprocessingDL.csv",
    "all_periods": "tweets_all_periods_labellingLexicon_preprocessingDL.csv",
}

MODEL_PATHS = {
    "before": MODEL_ROOT / "before",
    "covid": MODEL_ROOT / "covid",
    "after": MODEL_ROOT / "after",
    "all_periods": MODEL_ROOT / "all_periods",
}

# =========================
# CONFIG
# =========================
MAX_LENGTH = 128
BATCH_SIZE = 16
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_tokenizer_cache = {}
_model_cache = {}


def find_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    cols_lower = {c.lower(): c for c in df.columns}
    for cand in candidates:
        if cand in cols_lower:
            return cols_lower[cand]
    return None


def find_text_column(df: pd.DataFrame) -> str | None:
    # kolom yang dipakai untuk inferensi
    return find_column(df, [
        "tweet_preprocessed_dl",
        "tweet_preprocessed",
        "tweet",
        "text",
        "teks",
    ])


def find_output_tweet_column(df: pd.DataFrame, text_col: str) -> str:
    # kolom tweet asli yang mau disimpan di output
    return find_column(df, ["tweet"]) or text_col


def find_date_column(df: pd.DataFrame) -> str | None:
    return find_column(df, ["date", "tanggal", "created_at", "datetime"])


def find_saham_column(df: pd.DataFrame) -> str | None:
    return find_column(df, ["saham", "stock", "ticker"])


def get_tokenizer(model_dir: Path):
    key = str(model_dir)
    if key in _tokenizer_cache:
        return _tokenizer_cache[key]

    tokenizer_dir = model_dir / "tokenizer"
    if not tokenizer_dir.exists():
        raise FileNotFoundError(f"Folder tokenizer tidak ditemukan: {tokenizer_dir}")

    tokenizer = AutoTokenizer.from_pretrained(str(tokenizer_dir))
    _tokenizer_cache[key] = tokenizer
    return tokenizer


def get_model_bundle(periode: str):
    if periode in _model_cache:
        return _model_cache[periode]

    model_dir = MODEL_PATHS.get(periode)
    if model_dir is None or not model_dir.exists():
        raise FileNotFoundError(f"Folder model tidak ditemukan: {model_dir}")

    bin_file = model_dir / "best_model.bin"
    if not bin_file.exists():
        raise FileNotFoundError(f"File model tidak ditemukan: {bin_file}")

    le_file = model_dir / "label_encoder.joblib"
    if not le_file.exists():
        raise FileNotFoundError(f"Label encoder tidak ditemukan: {le_file}")

    le = joblib.load(le_file)

    # Model pakai config dari folder hasil training, lalu state_dict dari best_model.bin
    config = AutoConfig.from_pretrained(str(model_dir), num_labels=2)
    model = AutoModelForSequenceClassification.from_config(config)

    state_dict = torch.load(bin_file, map_location=DEVICE)
    model.load_state_dict(state_dict, strict=True)
    model.to(DEVICE)
    model.eval()

    tokenizer = get_tokenizer(model_dir)

    bundle = {"model": model, "tokenizer": tokenizer, "le": le}
    _model_cache[periode] = bundle
    return bundle


def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    return " ".join(text.replace("\u00A0", " ").split()).strip()


@torch.no_grad()
def predict_batch(texts: list[str], periode: str) -> list[str]:
    bundle = get_model_bundle(periode)

    model = bundle["model"]
    tokenizer = bundle["tokenizer"]
    le = bundle["le"]

    results = []
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        batch_safe = [t if str(t).strip() else "tidak ada informasi" for t in batch]

        encoding = tokenizer(
            batch_safe,
            max_length=MAX_LENGTH,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )

        input_ids = encoding["input_ids"].to(DEVICE)
        attention_mask = encoding["attention_mask"].to(DEVICE)

        logits = model(input_ids=input_ids, attention_mask=attention_mask).logits
        preds = torch.argmax(logits, dim=1).cpu().numpy()

        labels = le.inverse_transform(preds)
        results.extend([str(x).lower() for x in labels])

    return results


def process_one_file(periode: str) -> None:
    input_file = INPUT_DIR / PERIOD_FILES[periode]
    if not input_file.exists():
        print(f"⚠️ File tidak ditemukan: {input_file}")
        return

    print(f"\n{'=' * 70}")
    print(f"DL ANALYSIS | {periode.upper()}")
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
        print("⚠️ Data kosong setelah filter teks.")
        return

    texts = [clean_text(t) for t in df[text_col].tolist()]

    start = time.time()
    preds = predict_batch(texts, periode)
    runtime = time.time() - start

    # output final sesuai permintaan:
    # date, tweet, sentiment, saham
    out = pd.DataFrame({
        "date": df[date_col].astype(str).values if date_col else [""] * len(df),
        "tweet": df[tweet_out_col].astype(str).values,
        "sentiment": preds,
        "saham": df[saham_col].astype(str).values if saham_col else [""] * len(df),
    })

    output_file = OUTPUT_DIR / input_file.name.replace(
        "_preprocessingDL.csv", "_analisisDL.csv"
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