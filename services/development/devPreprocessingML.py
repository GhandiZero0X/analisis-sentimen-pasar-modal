# dev_database/preprocessing.py
"""
=============================================================
STEP 2: PREPROCESSING TWEET
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

Input  : dev_database/2_labelling/
         tweets_before_covid_labelling.csv
         tweets_covid_labelling.csv
         tweets_after_covid_labelling.csv
         tweets_all_periods_labelling.csv

Output : dev_database/3_preprocessing/
         tweets_before_covid_labelling_preprocessing.csv
         tweets_covid_labelling_preprocessing.csv
         tweets_after_covid_labelling_preprocessing.csv
         tweets_all_periods_labelling_preprocessing.csv
=============================================================
"""

import re
import string
import pandas as pd
import stanza
import nltk
import emoji
from bs4 import BeautifulSoup
from pathlib import Path
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from nltk.corpus import stopwords
from tqdm import tqdm

# ══════════════════════════════════════════════════════════════
#  PATH CONFIGURATION
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent          # lokasi script ini
INPUT_DIR  = BASE_DIR / "dev_database" / "2_labelling"
OUTPUT_DIR = BASE_DIR / "dev_database" / "3_preprocessing"
KAMUS_FILE = BASE_DIR / "kamuskatabaku.xlsx"          # sesuaikan path jika perlu

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# File yang diproses (urutan bebas)
INPUT_FILES = [
    "tweets_before_covid_labelling.csv",
    "tweets_covid_labelling.csv",
    "tweets_after_covid_labelling.csv",
    "tweets_all_periods_labelling.csv",
]

# ══════════════════════════════════════════════════════════════
#  SETUP RESOURCE (dijalankan sekali)
# ══════════════════════════════════════════════════════════════
print("⚙️  Menyiapkan resource...\n")

# NLTK stopwords
nltk.download("stopwords", quiet=True)
stop_words = set(stopwords.words("indonesian"))

# Sastrawi stemmer
stemmer = StemmerFactory().create_stemmer()

# Stanza tokenizer Bahasa Indonesia
stanza.download("id", quiet=True)
nlp = stanza.Pipeline(
    lang="id",
    processors="tokenize",
    tokenize_no_ssplit=True,  # satu tweet = satu kalimat, tidak dipecah per kalimat
    verbose=False,
)

# Kamus kata tidak baku → baku
kamus_df   = pd.read_excel(KAMUS_FILE)
kamus_dict = dict(zip(
    kamus_df["tidak_baku"].astype(str).str.lower(),   # key lowercase
    kamus_df["kata_baku"].astype(str).str.lower()     # value lowercase
))
print(f"✅ Kamus dimuat       : {len(kamus_dict):,} entri")
print(f"✅ Stopwords          : {len(stop_words):,} kata")
print(f"✅ NLP pipeline siap\n")

# ══════════════════════════════════════════════════════════════
#  PREPROCESSING PIPELINE
# ══════════════════════════════════════════════════════════════

def preprocess_tweet(tweet: str) -> str:
    """
    Pipeline preprocessing sesuai rencana skripsi.
    Mengembalikan string token yang sudah bersih, dipisah spasi.
    """
    tweet = str(tweet)

    # ──────────────────────────────────────────
    # TAHAP 1: CASEFOLDING
    # Ubah semua huruf menjadi huruf kecil
    # ──────────────────────────────────────────
    tweet = tweet.lower()

    # ──────────────────────────────────────────
    # TAHAP 2: TEXT CLEANING
    # ──────────────────────────────────────────

    # i. Hapus URL
    # Menangkap: http://, https://, www., bit.ly, t.co, ftp://
    tweet = re.sub(
        r"(https?://|ftp://|www\.)\S+|bit\.ly/\S+|t\.co/\S+",
        " ", tweet
    )

    # ii. Hapus hashtag (#topik), cashtag ($BBRI), mention (@user)
    tweet = re.sub(r"#\w+", " ", tweet)   # hashtag
    tweet = re.sub(r"\$\w+", " ", tweet)  # cashtag  ← BARU (tidak ada di kode lama)
    tweet = re.sub(r"@\w+", " ", tweet)   # mention

    # iii. Hapus emoji dan emotikon
    # Pakai library `emoji` untuk strip semua karakter emoji Unicode
    # Lebih akurat dari [^\x00-\x7F] karena tidak ikut hapus huruf aksen, dll.
    tweet = emoji.replace_emoji(tweet, replace=" ")  # ← BARU

    # Hapus juga emotikon teks ASCII yang umum: :) :( xD :'( dll
    tweet = re.sub(
        r"(:-?\)|:-?\(|;-?\)|:-?D|:-?P|:-?\||:'[(\)]|<3|>:<|xD|:'\))",
        " ", tweet, flags=re.IGNORECASE
    )

    # iv. Hapus angka yang tidak memiliki makna kontekstual
    # Hapus angka yang berdiri sendiri (bukan bagian kata seperti "covid19")
    tweet = re.sub(r"\b\d+\b", " ", tweet)

    # v. Hapus karakter selain alfabet dan spasi
    # Pertahankan hanya a-z dan spasi (sudah lowercase dari tahap 1)
    tweet = re.sub(r"[^a-z\s]", " ", tweet)

    # Rapikan spasi ganda setelah semua cleaning
    tweet = re.sub(r"\s+", " ", tweet).strip()

    # vi. Normalisasi singkatan & slang → kata baku
    # Dilakukan di level KATA sebelum tokenisasi agar konteks kamus tepat
    # Contoh: "yg" → "yang", "ga" → "tidak", "gw" → "saya"
    words_normalized = [
        kamus_dict.get(w, w)    # cari di kamus, jika tidak ada pakai aslinya
        for w in tweet.split()
    ]
    tweet = " ".join(words_normalized)

    # ──────────────────────────────────────────
    # TAHAP 3: TOKENIZATION (Stanza)
    # ──────────────────────────────────────────
    doc    = nlp(tweet)
    tokens = [word.text for sent in doc.sentences for word in sent.words]

    # ──────────────────────────────────────────
    # TAHAP 4: STOPWORD REMOVAL (NLTK)
    # ──────────────────────────────────────────
    tokens = [t for t in tokens if t not in stop_words]

    # ──────────────────────────────────────────
    # TAHAP 5: STEMMING (Sastrawi)
    # ──────────────────────────────────────────
    tokens = [stemmer.stem(t) for t in tokens]

    # Filter akhir: buang token terlalu pendek (≤ 2 karakter)
    tokens = [t for t in tokens if len(t) > 2]

    return " ".join(tokens)


# ══════════════════════════════════════════════════════════════
#  PROSES SEMUA FILE
# ══════════════════════════════════════════════════════════════

def process_file(filename: str):
    input_path  = INPUT_DIR / filename

    # Nama output: tambahkan _preprocessing sebelum .csv
    stem        = Path(filename).stem                              # tweets_before_covid_labelling
    output_name = f"{stem}_preprocessing.csv"                     # tweets_before_covid_labelling_preprocessing.csv
    output_path = OUTPUT_DIR / output_name

    if not input_path.exists():
        print(f"⚠️  File tidak ditemukan, skip: {filename}")
        return

    print(f"\n{'─'*60}")
    print(f"📂 Memproses : {filename}")
    print(f"{'─'*60}")

    # Load CSV
    df = pd.read_csv(input_path, dtype=str).fillna("")
    print(f"   Total baris : {len(df):,}")

    # Validasi kolom
    required = {"date", "tweet", "sentiment", "saham"}
    missing  = required - set(df.columns)
    if missing:
        print(f"   ❌ Kolom tidak lengkap: {missing}, skip!")
        return

    # Preprocessing — hasil masuk ke kolom baru `tweet_preprocessed`
    tqdm.pandas(desc="   🔄 Preprocessing")
    df["tweet_preprocessed"] = df["tweet"].progress_apply(preprocess_tweet)

    # Hitung tweet yang jadi kosong setelah preprocessing
    empty_count = (df["tweet_preprocessed"].str.strip() == "").sum()
    if empty_count > 0:
        print(f"\n   ⚠️  {empty_count} tweet menjadi kosong setelah preprocessing")
        print(f"      (tetap disimpan agar jumlah baris konsisten dengan data lain)")

    # Simpan dengan urutan kolom yang rapi
    df_out = df[["date", "tweet", "tweet_preprocessed", "sentiment", "saham"]]
    df_out.to_csv(output_path, index=False, encoding="utf-8-sig")

    size_kb = output_path.stat().st_size / 1024
    print(f"\n   ✅ Disimpan  : {output_name}  ({size_kb:.1f} KB)")
    print(f"   📊 Kolom output: date | tweet | tweet_preprocessed | sentiment | saham")


# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════
def main():
    print("=" * 60)
    print("  PREPROCESSING PIPELINE — SKRIPSI")
    print("=" * 60)
    print(f"  Input  : {INPUT_DIR}")
    print(f"  Output : {OUTPUT_DIR}")
    print("=" * 60)

    for filename in INPUT_FILES:
        process_file(filename)

    print(f"\n{'='*60}")
    print("  ✅ Semua file selesai diproses!")
    print(f"  📂 Cek hasil di: {OUTPUT_DIR}")
    print(f"{'='*60}")
    print("  Lanjut ke: python 03_train_svm.py")


if __name__ == "__main__":
    main()