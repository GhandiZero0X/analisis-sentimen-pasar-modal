# services/development/devLabelling.py
import pandas as pd
from pathlib import Path
from tqdm import tqdm

# =============================
# PATH CONFIG
# =============================
BASE_DIR = Path(__file__).resolve().parents[2]   # root project
DATA_DIR = BASE_DIR / "data"

INPUT_FILE = DATA_DIR / "tweets_sahamAll_preprocessed.csv"
OUTPUT_FILE = DATA_DIR / "tweets_sahamAll_lexicon_labeled.csv"

# =============================
# LEXICON SAHAM (CUSTOM)
# =============================
positive_lexicon = set([
    "bullish", "naik", "cuan", "untung", "positif", "akumulasi", "rebound", "support", "dividen",
    "bagus", "bertumbuh", "laba", "penguatan", "optimal", "berhasil", "profit", "kinerja", "buyback",
    "golden", "momentum", "rekomendasi", "positif outlook", "pemulihan", "oversold", "terbang",
    "bullish", "net buying","naik", "cuan", "untung", "positif", "akumulasi beli", "target harga naik", "rebound",
    "support kuat", "breakout", "dividen", "bagus", "bertumbuh", "laba naik", "penguatan", "rekor",
    "optimal", "berhasil", "berkembang", "meningkat", "profit", "kinerja baik", "rekomendasi beli",
    "all time high", "auto reject atas", "ara", "prospek cerah", "bagger", "fundamental kuat",
    "saham pilihan", "saham unggulan", "saham bagus", "melesat", "melambung", "top gainers",
    "volume meningkat", "momen bagus", "golden cross", "momentum naik", "indikator bagus",
    "buyback", "harga menarik", "positif outlook", "bisa terbang", "sinyal beli", "pemulihan", "oversold", 
    "peningkatan permintaan", "likuiditas tinggi", "rights issue positif", "upgrade rekomendasi", 
    "kinerja ekspor", "pengumuman positif", "merger akuisisi", "pemulihan ekonomi", "harga terkoreksi", 
    "beli di dip", "cuci gudang", "ipo sukses", "fundamental sehat", "rasio undervalue"
])

negative_lexicon = set([
    "bearish", "turun", "rugi", "negatif", "distribusi", "breakdown", "koreksi", "drop", "jelek",
    "masalah", "cut", "nyangkut", "panic", "overbought", "sinyal jual", "sampah", "krisis",
    "harga longsor", "bangkrut", "penipuan", "rugi operasional", "inflasi", "suku bunga", "dilusi",
    "bearish", "turun", "rugi", "negatif", "distribusi jual", "target harga turun", "breakdown",
    "resisten gagal", "koreksi", "drop", "tergerus", "jelek", "bermasalah", "turunnya laba",
    "kinerja buruk", "pengurangan", "menurun", "masalah", "net sell", "auto reject bawah", "arb",
    "cut loss", "saham gorengan", "saham jelek", "nyangkut", "volume turun", "profit warning",
    "divestasi", "sentimen buruk", "panic sell", "overbought", "sinyal jual", "indikator jelek",
    "dihentikan sementara", "laporan keuangan jelek", "saham sampah", "trading halt", "krisis",
    "jual rugi", "harga longsor", "top losers", "kebangkrutan", "suspensi", "penipuan",
    "penurunan permintaan", "likuiditas rendah", "downgrade rekomendasi", "utang menumpuk",
    "rugi operasional", "pembatalan dividen", "penundaan proyek", "sanksi regulasi",
    "kecurangan akuntansi", "penjualan insider", "gejolak pasar", "inflasi tinggi",
    "suku bunga naik", "macet", "dilusi saham", "gelembung pecah", "rasio overvalue"
])

# =============================
# LEXICON LABELING FUNCTION
# =============================
def lexicon_label(text):
    tokens = set(str(text).split())

    pos_score = len(tokens & positive_lexicon)
    neg_score = len(tokens & negative_lexicon)

    if pos_score > neg_score:
        return 1
    elif neg_score > pos_score:
        return -1
    else:
        return 0

# =============================
# LOAD DATASET
# =============================
df = pd.read_csv(INPUT_FILE)
print(f"✅ Dataset dimuat: {len(df)} tweet")

# =============================
# APPLY LABELING
# =============================
tqdm.pandas(desc="🏷️ Lexicon Labeling")
df["sentiment_lexicon"] = df["tweet_cleaned"].progress_apply(lexicon_label)

# =============================
# SAVE RESULT
# =============================
df.to_csv(OUTPUT_FILE, index=False)
print("✅ Lexicon-based labeling selesai.")
print(f"📁 File disimpan di: {OUTPUT_FILE}")
