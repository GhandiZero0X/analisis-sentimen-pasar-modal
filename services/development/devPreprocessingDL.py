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

# ══════════════════════════════════════════════════════════════
#  PATH CONFIGURATION
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
INPUT_DIR  = BASE_DIR / "dev_database" / "2_labelling"
OUTPUT_DIR = BASE_DIR / "dev_database" / "3_preprocessing" / "dl"
KAMUS_FILE = BASE_DIR / "kamuskatabaku.xlsx"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILES = [
    "tweets_before_covid_labelling.csv",
    "tweets_covid_labelling.csv",
    "tweets_after_covid_labelling.csv",
    "tweets_all_periods_labelling.csv",
]

# ══════════════════════════════════════════════════════════════
#  LOAD KAMUS (sekali saja)
# ══════════════════════════════════════════════════════════════
print("⚙️  Menyiapkan resource...\n")

kamus_df   = pd.read_excel(KAMUS_FILE)
kamus_dict = dict(zip(
    kamus_df["tidak_baku"].astype(str).str.lower(),
    kamus_df["kata_baku"].astype(str).str.lower()
))
print(f"✅ Kamus dimuat  : {len(kamus_dict):,} entri")
print(f"ℹ️  Tokenisasi   : ditangani AutoTokenizer IndoBERTweet (saat training)")
print(f"ℹ️  Stopword     : tidak dihapus (konteks dibutuhkan model Transformer)")
print(f"ℹ️  Stemming     : tidak dilakukan (subword tokenization menangani morfologi)\n")

# ══════════════════════════════════════════════════════════════
#  PREPROCESSING PIPELINE — DL VERSION
# ══════════════════════════════════════════════════════════════

def preprocess_for_dl(tweet: str) -> str:
    """
    Preprocessing ringan untuk IndoBERTweet.
    Tujuan: bersihkan noise, pertahankan struktur kalimat.

    TIDAK ada: tokenisasi manual, stopword removal, stemming.
    Ketiga hal itu akan merusak representasi kontekstual model.
    """
    tweet = str(tweet)

    # ──────────────────────────────────────────
    # TAHAP 1: CASEFOLDING
    # Lowercase agar konsisten, IndoBERTweet
    # dilatih dengan teks lowercase Twitter
    # ──────────────────────────────────────────
    tweet = tweet.lower()

    # ──────────────────────────────────────────
    # TAHAP 2: TEXT CLEANING
    # ──────────────────────────────────────────

    # i. Hapus URL
    tweet = re.sub(
        r"(https?://|ftp://|www\.)\S+|bit\.ly/\S+|t\.co/\S+",
        " ", tweet
    )

    # ii. Hapus hashtag (#), cashtag ($), mention (@)
    tweet = re.sub(r"#\w+", " ", tweet)    # #ihsg #saham
    tweet = re.sub(r"\$\w+", " ", tweet)   # $BBRI $TLKM
    tweet = re.sub(r"@\w+", " ", tweet)    # @username

    # iii. Hapus emoji Unicode (library emoji lebih akurat dari regex manual)
    tweet = emoji.replace_emoji(tweet, replace=" ")

    # Hapus emotikon ASCII: :) :( xD :'( <3 dll
    tweet = re.sub(
        r"(:-?\)|:-?\(|;-?\)|:-?D|:-?P|:-?\||:'[(\)]|<3|>:<|xD|x\))",
        " ", tweet, flags=re.IGNORECASE
    )

    # iv. Hapus angka yang berdiri sendiri (tidak bermakna kontekstual)
    # Catatan: "covid19" atau "q3" tetap dipertahankan karena bagian dari kata
    tweet = re.sub(r"\b\d+\b", " ", tweet)

    # v. Hapus karakter selain alfabet dan spasi
    # Pertahankan struktur kata, buang simbol sisa
    tweet = re.sub(r"[^a-z\s]", " ", tweet)

    # Rapikan spasi
    tweet = re.sub(r"\s+", " ", tweet).strip()

    # vi. Normalisasi singkatan & slang → kata baku
    # Dilakukan di level kata (split by spasi), BUKAN token Stanza
    # Penting: kamus di-apply SEBELUM diserahkan ke AutoTokenizer
    # agar representasi subword lebih bersih dan konsisten
    words = tweet.split()
    words = [kamus_dict.get(w, w) for w in words]
    tweet = " ".join(words)

    # ── SELESAI ──
    # Tidak ada tokenisasi, stopword removal, atau stemming.
    # Teks ini langsung siap masuk ke:
    #   tokenizer(tweet, max_length=128, truncation=True,
    #             padding="max_length", return_tensors="pt")
    return tweet


# ══════════════════════════════════════════════════════════════
#  PROSES SEMUA FILE
# ══════════════════════════════════════════════════════════════

def process_file(filename: str):
    input_path  = INPUT_DIR / filename

    # Nama output: ganti akhiran .csv → _preprocessingDL.csv
    stem        = Path(filename).stem                           # tweets_before_covid_labelling
    output_name = f"{stem}_preprocessingDL.csv"                # tweets_before_covid_labelling_preprocessingDL.csv
    output_path = OUTPUT_DIR / output_name

    if not input_path.exists():
        print(f"⚠️  File tidak ditemukan, skip: {filename}")
        return

    print(f"\n{'─'*62}")
    print(f"📂 Memproses : {filename}")
    print(f"{'─'*62}")

    # Load
    df = pd.read_csv(input_path, dtype=str).fillna("")
    print(f"   Total baris  : {len(df):,}")

    # Validasi kolom
    required = {"date", "tweet", "sentiment", "saham"}
    missing  = required - set(df.columns)
    if missing:
        print(f"   ❌ Kolom tidak lengkap: {missing}, skip!")
        return

    # Apply preprocessing DL
    tqdm.pandas(desc="   🔄 Preprocessing DL")
    df["tweet_preprocessed_dl"] = df["tweet"].progress_apply(preprocess_for_dl)

    # Statistik
    empty_count = (df["tweet_preprocessed_dl"].str.strip() == "").sum()
    avg_len     = df["tweet_preprocessed_dl"].str.split().apply(len).mean()

    print(f"\n   📊 Rata-rata panjang teks  : {avg_len:.1f} kata")
    if empty_count > 0:
        print(f"   ⚠️  Tweet menjadi kosong   : {empty_count} baris")

    # Simpan — kolom: date | tweet | tweet_preprocessed_dl | sentiment | saham
    df_out = df[["date", "tweet", "tweet_preprocessed_dl", "sentiment", "saham"]]
    df_out.to_csv(output_path, index=False, encoding="utf-8-sig")

    size_kb = output_path.stat().st_size / 1024
    print(f"   ✅ Disimpan  : {output_name}  ({size_kb:.1f} KB)")


# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════
def main():
    print("=" * 62)
    print("  PREPROCESSING DL — IndoBERTweet")
    print("=" * 62)
    print(f"  Input  : {INPUT_DIR}")
    print(f"  Output : {OUTPUT_DIR}")
    print("=" * 62)

    for filename in INPUT_FILES:
        process_file(filename)

    print(f"\n{'='*62}")
    print("  ✅ Semua file selesai diproses!")
    print(f"  📂 Cek hasil di: {OUTPUT_DIR}")
    print(f"{'='*62}")
    print("\n  Perbandingan output preprocessing:")
    print("  SVM → tweet_preprocessed    : token bersih, sudah stem+stopword")
    print("  DL  → tweet_preprocessed_dl : kalimat utuh, siap AutoTokenizer")
    print("\n  Lanjut ke: python 03_train_indobertweet.py")


if __name__ == "__main__":
    main()