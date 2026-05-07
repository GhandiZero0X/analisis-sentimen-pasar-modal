# dev_database/preprocessing_dl.py
"""
=============================================================
STEP 2b: PREPROCESSING TWEET — IndoBERTweet (Deep Learning)
=============================================================
Perbedaan utama vs preprocessing SVM:
  ✅ Casefolding          → sama
  ✅ Text Cleaning        → sama
  ✅ Normalisasi slang    → sama
  ❌ Tokenization Stanza  → TIDAK dilakukan
  ❌ Stopword Removal     → TIDAK dilakukan
  ❌ Stemming Sastrawi    → TIDAK dilakukan

Alasan:
  IndoBERTweet menggunakan subword tokenization (WordPiece)
  via AutoTokenizer dari library Transformers. Model ini
  membutuhkan kalimat yang UTUH dan NATURAL agar attention
  mechanism bisa menangkap konteks antar kata dengan benar.

  Stemming & stopword removal justru MERUSAK konteks kalimat
  dan menurunkan performa model berbasis Transformer.

  Tokenisasi dilakukan otomatis saat training/inferensi:
    tokenizer = AutoTokenizer.from_pretrained("indobertweet")
    encoded = tokenizer(text, max_length=128, truncation=True,
                        padding="max_length", return_tensors="pt")

Input  : dev_database/2_labelling/
         tweets_before_covid_labelling.csv
         tweets_covid_labelling.csv
         tweets_after_covid_labelling.csv
         tweets_all_periods_labelling.csv

Output : dev_database/3_preprocessing/dl/
         tweets_before_covid_labelling_preprocessingDL.csv
         tweets_covid_labelling_preprocessingDL.csv
         tweets_after_covid_labelling_preprocessingDL.csv
         tweets_all_periods_labelling_preprocessingDL.csv

Kolom output:
  date | tweet | tweet_preprocessed_dl | sentiment | saham
=============================================================
"""

import re
import pandas as pd
import emoji
from pathlib import Path
from tqdm import tqdm

# =============================
# PATH CONFIG
# =============================
BASE_DIR = Path(__file__).resolve().parent
INPUT_DIR = BASE_DIR / "dev_database" / "2_labellingLexicon"
OUTPUT_DIR = BASE_DIR / "dev_database" / "3_preprocessing" / "dl"
KAMUS_FILE = BASE_DIR / "kamus" / "kamuskatabaku.xlsx"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILES = [
    "tweets_before_covid_labellingLexicon.csv",
    "tweets_covid_labellingLexicon.csv",
    "tweets_after_covid_labellingLexicon.csv",
    "tweets_all_periods_labellingLexicon.csv",
]

# =============================
# LOAD KAMUS
# =============================
print("⚙️  Menyiapkan resource...\n")

kamus_df = pd.read_excel(KAMUS_FILE)

kamus_dict = dict(zip(
    kamus_df["tidak_baku"].astype(str).str.lower(),
    kamus_df["kata_baku"].astype(str).str.lower()
))

print(f"✅ Kamus dimuat: {len(kamus_dict):,} kata\n")

# =============================
# PREPROCESS FUNCTION
# =============================
def preprocess_for_dl(tweet: str) -> str:
    tweet = str(tweet).lower()

    # 1. URL
    tweet = re.sub(r"(https?://|www\.)\S+", " ", tweet)

    # 2. Hashtag → ambil isi
    tweet = re.sub(r"#(\w+)", r"\1", tweet)

    # 3. Cashtag → ambil isi
    tweet = re.sub(r"\$", "", tweet)

    # 4. Mention
    tweet = re.sub(r"@\w+", " ", tweet)

    # 5. Emoji
    tweet = emoji.replace_emoji(tweet, replace=" ")

    # 6. Emoticon
    tweet = re.sub(r"(:-?\)|:-?\(|;-\)|:-?D|:-?P|<3|xD)", " ", tweet)

    # 7. Karakter (soft cleaning)
    tweet = re.sub(r"[^a-z0-9\s.,%!?]", " ", tweet)

    # Normalisasi titik berulang
    tweet = re.sub(r"\.{2,}", ".", tweet)

    # 8. Normalisasi tanda berlebih
    tweet = re.sub(r"!{2,}", "!", tweet)
    tweet = re.sub(r"\?{2,}", "?", tweet)

    # 9. Rapihin spasi
    tweet = re.sub(r"\s+", " ", tweet).strip()

    # 10. Normalisasi slang → baku
    words = tweet.split()
    words = [kamus_dict.get(w, w) for w in words]

    return " ".join(words)

# =============================
# PROCESS FILE
# =============================
def process_file(filename: str):
    input_path = INPUT_DIR / filename
    output_name = filename.replace(".csv", "_preprocessingDL.csv")
    output_path = OUTPUT_DIR / output_name

    if not input_path.exists():
        print(f"⚠️  File tidak ditemukan: {filename}")
        return

    print(f"\n{'─' * 62}")
    print(f"📂 Processing: {filename}")
    print(f"{'─' * 62}")

    df = pd.read_csv(input_path, dtype=str).fillna("")

    # Validasi kolom
    required = {"date", "tweet", "sentiment", "saham"}
    if not required.issubset(df.columns):
        print(f"❌ Kolom tidak lengkap di {filename}")
        return

    tqdm.pandas(desc="🔄 Preprocessing DL")
    df["tweet_preprocessed_dl"] = df["tweet"].progress_apply(preprocess_for_dl)

    # Statistik
    empty_count = (df["tweet_preprocessed_dl"].str.strip() == "").sum()
    avg_len = df["tweet_preprocessed_dl"].str.split().apply(len).mean()

    print(f"📊 Avg length : {avg_len:.1f} kata")
    print(f"⚠️ Empty data : {empty_count}")

    # Buang baris kosong hasil preprocessing
    df_out = df[["date", "tweet", "tweet_preprocessed_dl", "sentiment", "saham"]].copy()
    before_drop = len(df_out)
    df_out = df_out[df_out["tweet_preprocessed_dl"].str.strip() != ""].copy()
    after_drop = len(df_out)

    dropped = before_drop - after_drop
    if dropped > 0:
        print(f"🧹 Baris kosong dibuang : {dropped}")

    # Simpan
    df_out.to_csv(output_path, index=False, encoding="utf-8-sig")

    size_kb = output_path.stat().st_size / 1024
    print(f"✅ Saved: {output_name} ({size_kb:.1f} KB)")

# =============================
# MAIN
# =============================
def main():
    print("=" * 60)
    print("PREPROCESSING DL — INDOBERTWEET")
    print("=" * 60)
    print(f"  Input  : {INPUT_DIR}")
    print(f"  Output : {OUTPUT_DIR}")
    print("=" * 60)

    for file in INPUT_FILES:
        process_file(file)

    print("\n✅ DONE ALL FILES")

if __name__ == "__main__":
    main()