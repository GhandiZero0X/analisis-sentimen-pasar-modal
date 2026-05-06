# services/development/autoLabelling_1.py
"""
=============================================================
STEP 1: AUTO-LABELING dengan IndoBERTweet Sentiment Model
=============================================================
Model utama : indolem/indobertweet-base-uncased
Label        : positif, netral, negatif

Input  : dev_database/1_raw/
        ├── tweets_before_covid.csv
        ├── tweets_covid.csv
        ├── tweets_after_covid.csv
        └── tweets_all_periods.csv

Output : dev_database/2_labelling/
        ├── tweets_before_covid_labelling.csv
        ├── tweets_covid_labelling.csv
        ├── tweets_after_covid_labelling.csv
        └── tweets_all_periods_labelling.csv

Catatan:
- Kolom tweet di output = TWEET ASLI (tidak berubah)
- Tweet yang dibersihkan hanya dipakai SEMENTARA untuk prediksi model
- Hanya kolom sentiment yang diisi hasil model
=============================================================
"""

import re
import csv
import torch
import pandas as pd
from pathlib import Path
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from tqdm import tqdm

# =============================
# PATH CONFIG
# =============================
BASE_DIR = Path(__file__).resolve().parent

INPUT_DIR  = BASE_DIR / "dev_database" / "1_raw"
OUTPUT_DIR = BASE_DIR / "dev_database" / "2_labelling"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILES = [
    "tweets_before_covid.csv",
    "tweets_all_periods.csv",
    "tweets_covid.csv",
    "tweets_after_covid.csv",
]

# =============================
# MODEL (VALID & PUBLIC)
# =============================
MODEL_NAME = "Aardiiiiy/indobertweet-base-Indonesian-sentiment-analysis"

BATCH_SIZE = 4  # aman buat RTX 3050

# =============================
# CLEAN TEXT (FOR INFERENCE ONLY)
# =============================
def clean_for_inference(text: str) -> str:
    if not isinstance(text, str) or text.strip() == "":
        return ""

    t = text.lower()
    t = t.replace("\u00A0", " ")
    t = re.sub(r"[\r\n]+", " ", t)
    t = re.sub(r"http\S+|www\S+", "", t)
    t = re.sub(r"@\w+|#\w+", "", t)
    t = re.sub(r"[^\w\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()

    return t

# =============================
# LOAD MODEL
# =============================
def load_model():
    device = 0 if torch.cuda.is_available() else -1
    device_name = torch.cuda.get_device_name(0) if device == 0 else "CPU"

    print(f"🖥️ Device: {device_name}")
    print(f"⬇️ Loading model: {MODEL_NAME}")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

    clf = pipeline(
        "sentiment-analysis",
        model=model,
        tokenizer=tokenizer,
        device=device,
        return_all_scores=True
    )

    print("✅ Model loaded successfully\n")
    return clf

# =============================
# DETECT LABEL MAPPING
# =============================
def detect_label_mapping(clf):
    pos_test = clf("saham naik terus bagus sekali mantap")[0]
    neg_test = clf("saham turun parah rugi besar")[0]

    pos_label = max(pos_test, key=lambda x: x["score"])["label"]
    neg_label = max(neg_test, key=lambda x: x["score"])["label"]

    all_labels = [x["label"] for x in pos_test]
    neutral_label = [l for l in all_labels if l not in [pos_label, neg_label]]

    mapping = {
        pos_label: "positif",
        neg_label: "negatif",
    }

    if neutral_label:
        mapping[neutral_label[0]] = "netral"

    print("🔍 Label mapping:", mapping, "\n")
    return mapping

# =============================
# PROCESS CSV
# =============================
def process_csv(filepath, clf, label_mapping):
    print(f"\n📂 Processing: {filepath.name}")

    df = pd.read_csv(filepath, dtype=str).fillna("")

    original_tweets = df["tweet"].tolist()
    cleaned_tweets = [clean_for_inference(t) for t in original_tweets]

    sentiments = []

    for i in tqdm(range(0, len(cleaned_tweets), BATCH_SIZE), desc="🤖 Labeling"):
        batch = cleaned_tweets[i:i+BATCH_SIZE]
        batch = [t if t else "[kosong]" for t in batch]

        try:
            outputs = clf(batch)

            for scores in outputs:
                best = max(scores, key=lambda x: x["score"])
                sentiments.append(label_mapping.get(best["label"], "netral"))

        except:
            sentiments.extend(["netral"] * len(batch))

    df_out = pd.DataFrame({
        "date": df["date"],
        "tweet": original_tweets,
        "sentiment": sentiments,
        "saham": df["saham"]
    })

    return df_out

# =============================
# SAVE CSV
# =============================
def save_csv(df, output_path):
    df.to_csv(output_path, index=False, encoding="utf-8-sig", quoting=csv.QUOTE_ALL)
    print(f"💾 Saved: {output_path}")

# =============================
# MAIN
# =============================
def main():
    print("="*60)
    print("AUTO LABELING — INDOBERTWEET (FIXED)")
    print("="*60)

    clf = load_model()
    label_mapping = detect_label_mapping(clf)

    for file in INPUT_FILES:
        input_path = INPUT_DIR / file

        if not input_path.exists():
            print(f"⚠️ File not found: {file}")
            continue

        output_name = file.replace(".csv", "_labelling.csv")
        output_path = OUTPUT_DIR / output_name

        df_out = process_csv(input_path, clf, label_mapping)
        save_csv(df_out, output_path)

    print("\n✅ SELESAI SEMUA")

if __name__ == "__main__":
    main()