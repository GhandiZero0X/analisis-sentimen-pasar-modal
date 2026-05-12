# dev_database/preprocessing_ml.py
"""
=============================================================
STEP 2: PREPROCESSING TWEET — Machine Learning (SVM)
=============================================================
Urutan sesuai rencana skripsi:
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

Input  : dev_database/2_labellingLexicon/
         tweets_before_covid_labellingLexicon.csv
         tweets_covid_labellingLexicon.csv
         tweets_after_covid_labellingLexicon.csv
         tweets_all_periods_labellingLexicon.csv

Output : dev_database/3_preprocessing/ml/
         tweets_before_covid_labellingLexicon_preprocessingML.csv
         tweets_covid_labellingLexicon_preprocessingML.csv
         tweets_after_covid_labellingLexicon_preprocessingML.csv
         tweets_all_periods_labellingLexicon_preprocessingML.csv
=============================================================
"""

import re
import pandas as pd
import stanza
import nltk
import emoji
from pathlib import Path
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from nltk.corpus import stopwords
from tqdm import tqdm

# ══════════════════════════════════════════════════════════════
# PATH CONFIGURATION
# ══════════════════════════════════════════════════════════════
BASE_DIR = Path(__file__).resolve().parent
INPUT_DIR = BASE_DIR / "dev_database" / "2_labellingLexicon"
OUTPUT_DIR = BASE_DIR / "dev_database" / "3_preprocessing" / "ml"
KAMUS_FILE = BASE_DIR / "kamus" / "kamuskatabaku.xlsx"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILES = [
    "tweets_before_covid_labellingLexicon.csv",
    "tweets_covid_labellingLexicon.csv",
    "tweets_after_covid_labellingLexicon.csv",
    "tweets_all_periods_labellingLexicon.csv",
]

# ══════════════════════════════════════════════════════════════
# SETUP RESOURCE
# ══════════════════════════════════════════════════════════════
print("⚙️  Menyiapkan resource...\n")

nltk.download("stopwords", quiet=True)
stop_words = set(stopwords.words("indonesian"))

stemmer = StemmerFactory().create_stemmer()

try:
    nlp = stanza.Pipeline(
        lang="id",
        processors="tokenize",
        tokenize_no_ssplit=True,
        verbose=False
    )
except Exception:
    print("⬇️  Downloading Stanza model...")
    stanza.download("id")
    nlp = stanza.Pipeline(
        lang="id",
        processors="tokenize",
        tokenize_no_ssplit=True,
        verbose=False
    )

kamus_df = pd.read_excel(KAMUS_FILE)
kamus_dict = dict(zip(
    kamus_df["tidak_baku"].astype(str).str.lower(),
    kamus_df["kata_baku"].astype(str).str.lower()
))

print(f"✅ Kamus dimuat       : {len(kamus_dict):,} entri")
print(f"✅ Stopwords          : {len(stop_words):,} kata")
print(f"✅ NLP pipeline siap\n")

# ══════════════════════════════════════════════════════════════
# PREPROCESSING PIPELINE
# ══════════════════════════════════════════════════════════════
def preprocess_tweet(tweet: str) -> str:
    """
    Pipeline preprocessing sesuai rencana skripsi.
    Mengembalikan string token yang sudah bersih, dipisah spasi.
    """
    tweet = str(tweet).lower()

    # 1. Hapus URL
    tweet = re.sub(
        r"(https?://|ftp://|www\.)\S+|bit\.ly/\S+|t\.co/\S+",
        " ",
        tweet
    )

    # 2. Hapus hashtag, cashtag, mention
    tweet = re.sub(r"#\w+", " ", tweet)
    tweet = re.sub(r"\$\w+", " ", tweet)
    tweet = re.sub(r"@\w+", " ", tweet)

    # 3. Hapus emoji dan emotikon
    tweet = emoji.replace_emoji(tweet, replace=" ")
    tweet = re.sub(
        r"(:-?\)|:-?\(|;-?\)|:-?D|:-?P|:-?\||:'[(\)]|<3|>:<|xD|:'\))",
        " ",
        tweet,
        flags=re.IGNORECASE
    )

    # 4. Hapus angka yang berdiri sendiri
    tweet = re.sub(r"\b\d+\b", " ", tweet)

    # 5. Hapus karakter selain alfabet dan spasi
    tweet = re.sub(r"[^a-z\s]", " ", tweet)

    # Rapikan spasi
    tweet = re.sub(r"\s+", " ", tweet).strip()

    # 6. Normalisasi singkatan & slang → kata baku
    words_normalized = [
        kamus_dict.get(w, w)
        for w in tweet.split()
    ]
    tweet = " ".join(words_normalized)

    # 7. Tokenization (Stanza)
    doc = nlp(tweet)
    tokens = [word.text for sent in doc.sentences for word in sent.words]

    # 8. Stopword Removal
    tokens = [t for t in tokens if t not in stop_words]

    # 9. Stemming
    tokens = [stemmer.stem(t) for t in tokens]

    # Filter token terlalu pendek
    tokens = [t for t in tokens if len(t) > 2]

    return " ".join(tokens)

# ══════════════════════════════════════════════════════════════
# PROSES FILE
# ══════════════════════════════════════════════════════════════
def process_file(filename: str):
    input_path = INPUT_DIR / filename

    stem = Path(filename).stem
    output_name = f"{stem}_preprocessingML.csv"
    output_path = OUTPUT_DIR / output_name

    if not input_path.exists():
        print(f"⚠️  File tidak ditemukan, skip: {filename}")
        return

    print(f"\n{'─' * 60}")
    print(f"📂 Memproses : {filename}")
    print(f"{'─' * 60}")

    df = pd.read_csv(input_path, dtype=str).fillna("")
    print(f"   Total baris : {len(df):,}")

    required = {"date", "tweet", "sentiment", "saham"}
    missing = required - set(df.columns)
    if missing:
        print(f"   ❌ Kolom tidak lengkap: {missing}, skip!")
        return

    tqdm.pandas(desc="   🔄 Preprocessing")
    df["tweet_preprocessed"] = df["tweet"].progress_apply(preprocess_tweet)

    empty_count = (df["tweet_preprocessed"].str.strip() == "").sum()
    if empty_count > 0:
        print(f"\n   ⚠️  {empty_count} tweet menjadi kosong setelah preprocessing")

    # Buang baris kosong
    df_out = df[["date", "tweet", "tweet_preprocessed", "sentiment", "saham"]].copy()
    before_drop = len(df_out)
    df_out = df_out[df_out["tweet_preprocessed"].str.strip() != ""].copy()
    after_drop = len(df_out)

    dropped = before_drop - after_drop
    if dropped > 0:
        print(f"   🧹 Baris kosong dibuang : {dropped}")

    df_out.to_csv(output_path, index=False, encoding="utf-8-sig")

    size_kb = output_path.stat().st_size / 1024
    print(f"\n   ✅ Disimpan  : {output_name}  ({size_kb:.1f} KB)")
    print(f"   📊 Kolom output: date | tweet | tweet_preprocessed | sentiment | saham")

# ══════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════
def main():
    print("=" * 60)
    print("  PREPROCESSING ML (SVM) — SKRIPSI")
    print("=" * 60)
    print(f"  Input  : {INPUT_DIR}")
    print(f"  Output : {OUTPUT_DIR}")
    print("=" * 60)

    for filename in INPUT_FILES:
        process_file(filename)

    print(f"\n{'=' * 60}")
    print("  ✅ Semua file selesai diproses!")
    print(f"  📂 Cek hasil di: {OUTPUT_DIR}")
    print(f"{'=' * 60}")
    print("  Lanjut ke: python 03_train_svm.py")

if __name__ == "__main__":
    main()