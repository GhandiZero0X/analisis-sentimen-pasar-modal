# services/development/autoLabelling_indobertweet_finetuned.py

import re
import csv
import torch
import pandas as pd
from pathlib import Path
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from tqdm import tqdm

# =============================
# CONFIG
# =============================
BASE_DIR = Path(__file__).resolve().parent

INPUT_DIR  = BASE_DIR / "dev_database" / "1_raw"
OUTPUT_DIR = BASE_DIR / "dev_database" / "2_labelling_indobertweet"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILES = [
    "tweets_before_covid.csv",
    "tweets_all_periods.csv",
    "tweets_covid.csv",
    "tweets_after_covid.csv",
]

MODEL_NAME = "rikidharmawan/finetuning-sentiment-model-indobertweet-v2"

BATCH_SIZE = 16   # RTX 3050 aman
MAX_LEN = 128

# =============================
# CLEAN TEXT
# =============================
def clean_text(text):
    if not isinstance(text, str):
        return ""

    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"@\w+|#\w+", "", text)
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text

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
        "text-classification",
        model=model,
        tokenizer=tokenizer,
        device=device,
        batch_size=BATCH_SIZE,
        truncation=True,
        max_length=MAX_LEN,
        return_all_scores=True
    )

    print("✅ Model ready (FINETUNED)\n")
    return clf

# =============================
# DETECT LABEL MAPPING
# =============================
def detect_label_mapping(clf):
    test_pos = clf("saham naik bagus sekali mantap")[0]
    test_neg = clf("saham turun parah rugi besar")[0]

    pos_label = max(test_pos, key=lambda x: x["score"])["label"]
    neg_label = max(test_neg, key=lambda x: x["score"])["label"]

    all_labels = [l["label"] for l in test_pos]
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

    df = pd.read_csv(filepath, dtype=str, engine="python").fillna("")
    print("Total data:", len(df))

    original_tweets = df["tweet"].tolist()
    cleaned = [clean_text(t) for t in original_tweets]

    sentiments = []

    for i in tqdm(range(0, len(cleaned), BATCH_SIZE), desc="🤖 Labeling"):
        batch = cleaned[i:i+BATCH_SIZE]
        batch = [t if t else "[kosong]" for t in batch]

        try:
            outputs = clf(batch)

            for scores in outputs:
                best = max(scores, key=lambda x: x["score"])
                sentiments.append(label_mapping.get(best["label"], "netral"))

        except Exception as e:
            print(f"\n⚠️ Batch error: {e}")
            sentiments.extend(["netral"] * len(batch))

    df["sentiment"] = sentiments
    return df

# =============================
# SAVE CSV
# =============================
def save_csv(df, path):
    df.to_csv(path, index=False, encoding="utf-8-sig", quoting=csv.QUOTE_ALL)
    print(f"💾 Saved: {path}")

# =============================
# MAIN
# =============================
def main():
    print("="*60)
    print("AUTO LABELING — INDOBERTWEET FINETUNED")
    print("="*60)

    clf = load_model()
    label_mapping = detect_label_mapping(clf)

    for file in INPUT_FILES:
        input_path = INPUT_DIR / file

        if not input_path.exists():
            print(f"⚠️ File not found: {file}")
            continue

        output_path = OUTPUT_DIR / file.replace(".csv", "_labelling.csv")

        df_out = process_csv(input_path, clf, label_mapping)
        save_csv(df_out, output_path)

    print("\n✅ SELESAI — AUTO LABELING BERHASIL")

if __name__ == "__main__":
    main()