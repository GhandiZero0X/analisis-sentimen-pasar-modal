# services/development/autoLabelling_lexicon_raw.py
import pandas as pd
import re
from pathlib import Path
from tqdm import tqdm

# =============================
# PATH CONFIG
# =============================
BASE_DIR = Path(__file__).resolve().parent

INPUT_DIR = BASE_DIR / "dev_database" / "1_raw"
OUTPUT_DIR = BASE_DIR / "dev_database" / "2_labellingLexicon"
KAMUS_FILE = BASE_DIR / "kamus" / "kamuskatabaku.xlsx"

FILES = [
    "tweets_before_covid.csv",
    "tweets_covid.csv",
    "tweets_after_covid.csv",
    "tweets_all_periods.csv"
]

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# =============================
# LOAD KAMUS
# =============================
kamus_df = pd.read_excel(KAMUS_FILE)

kamus_dict = dict(zip(
    kamus_df["tidak_baku"].astype(str).str.lower(),
    kamus_df["kata_baku"].astype(str).str.lower()
))

# =============================
# LEXICON (FULL MERGED)
# =============================
positive_lexicon = set([
    "accumulate","agresif","akumulasi","akumulasi beli","all time high","aman","apresiasi","ascending","ath","atraktif",
    "bagger","bagus","bagusnya","bahagia","baik","bangga","bangkit","berhasil","berkah","berkembang",
    "berkontribusi","berlanjut","bermanfaat","berpotensi","bersinar","bertahan","bertumbuh","best","better","bluechip",
    "bottoming","breakout","bull","bullish","buy","buyback","buying","cakep","cantik","capai",
    "caplok","cashflow","cemerlang","cerah","cerdas","ciamik","comeback","cuan","cuci gudang","dca",
    "defensif","defensive","demand","diakumulasi","dibeli","diborong","diburu","didorong","dihargai","diincar",
    "dikoleksi","diminati","diproyeksikan","direstui","diserok","disetujui","ditopang","diuntungkan","dividen","dividend",
    "dongkrak","dominan","dominasi","efektif","efisiensi","ekspansi","ekspor","entry bagus","fokus","fundamental kuat",
    "fundamental sehat","gacor","gain","gas","gass","gampang","gede","gencar","golden","golden cross",
    "good","green","happy","harga menarik","harga terkoreksi","hasil","high","hijau","hoki","hold",
    "holding","imbal","incar","indikator bagus","inovasi","ipo sukses","investasi","investor","juara","jumbo",
    "katalis","keep","kejutan","kemajuan","kenaikan","kencang","kerek","kerjasama","kesempatan","keuntungan",
    "kinerja baik","kinerja ekspor","kolaborasi","komitmen","konsisten","konsistensi","kontribusi","kuat","laba","laba naik",
    "lancar","lanjut","lanjutan","lanjutkan","layak","leaders","likuiditas tinggi","lompat","long","longterm",
    "lumayan","maju","maksimal","mampu","mantap",
    "mantep", "mantul", "masif", "melaju", "melambung", "melesat", "melonjak", "membaik", "membantu", "membeli",
    "memborong", "membukukan", "memilih", "memiliki", "memperluas", "mempertahankan","menabung", "menaikkan", "menang", "menargetkan", "menarik", "menawarkan", "mencapai", "mencatat", "mencetak", "mendominasi",
    "mendorong", "menembus", "mengakumulasi", "menggiurkan", "menghasilkan", "menghijau", "menguntungkan", "menikmati", "meningkat", "meningkatkan",
    "menjaga", "menuju", "menyetujui", "menyumbang", "meraup", "merger akuisisi", "merilis", "meroket", "momen bagus", "momentum",
    "momentum naik", "moon", "mudah", "murah", "naik", "nambah", "nanjak", "net buy", "net buying", "netbuy",
    "ngebut", "ngegas", "nice", "nikmat", "nikmati", "nyerok", "nyicil", "optimal", "optimis", "optimisme",
    "outlook", "outperform", "oversold", "panjang", "pantas", "pasti", "pastinya", "patut", "payout", "pembelian","pemulihan", "pemulihan ekonomi", "pencapaian", "pendapatan",
    "penguatan", "pengumuman positif", "peningkatan", "peningkatan permintaan", "penopang", "percaya", "performa", "performance", "perkasa", "perkembangan",
    "permintaan", "pertahankan", "pertumbuhan", "pesat", "pintar", "populer", "portfolio", "positif", "positif outlook", "potensial",
    "premium", "prioritas", "profit", "profitnya", "prospek", "prospek cerah", "prospektif", "proyeksi", "pulih", "pump",
    "raksasa", "rally", "ramah", "rasio undervalue", "realisasi", "rebound", "recovery", "rejeki", "rekomen", "rekomendasi",
    "rekomendasi beli", "rekor", "rendah", "restu", "rights issue positif", "rights issue", "rightsissue", "rilis", "rotasi", "royal", "saatnya", "sabar",
    "saham bagus", "saham pilihan", "saham unggulan", "sehat", "sejahtera", "semakin", "semoga", "senang", "seneng", "serius", "serok",
    "setuju", "siap", "signifikan", "simpan", "sinergi", "sinyal beli", "sip", "smart", "solusi", "spesial",
    "stabil", "stabilitas", "strategi", "strategis", "strong", "strong buy", "sukses", "super", "support", "support kuat",
    "syukur", "tabung", "tabungan", "tahan", "tambah", "tambahan", "tangguh", "target", "target harga naik", "tembus",
    "terbang", "terbuka", "terbukti", "tercatat", "terbesar", "terdiskon", "terjaga", "terkerek", "tertarik", "tertinggi", "tetap",
    "tinggi", "tingkatkan", "to the moon","top gainers", "topang", "tren", "trend", "trendnya", "tuku","tumbuh",
    "unggul", "untung", "untungnya", "upgrade rekomendasi", "upside", "uptrend", "volume meningkat", "wajar", "worth", "wow",
    "upper","uptrendnya", "waah","wah", "wajar", "watchlist", "yakin",
])

negative_lexicon = set([
    "abang", "amblas", "ambles", "ambrol", "ambruk", "ampas", "amsyong", "ancur", "anjlok", "arb", "auto reject bawah",
    "bad", "bandar", "bangkrut", "bapuk", "bearish", "beban", "berat", "berdarah", "bermasalah", "bleeding",
    "boncos", "breakdown", "brutal", "buang", "bubar", "buruk", "cabut", "capek", "chaos",
    "crash", "cut", "cut loss", "dead", "dibanting", "dihajar", "dihentikan sementara", "dijual", "dilego", "dilepas",
    "dilusi", "dilusi saham", "disedot", "distribusi", "distribusi jual", "ditarik", "ditekan", "ditinggal", "divestasi", "down",
    "down bad", "downgrade", "downgrade rekomendasi", "downtrend", "drastis", "drop", "dump", "exit", "fear", "flat",
    "floating", "gagal", "gejolak pasar", "gelembung pecah", "gorengan", "goyang", "halt", "hancur", "harga longsor", "hilang",
    "hutang", "imbas", "indikator jelek",
    "inflasi tinggi", "issue", "isu", "jangan", "jatoh", "jatuh", "jeblok", "jebol", "jelek", "jual",
    "jual rugi", "kabur", "kacau", "kalah", "kasus", "kebangkrutan", "kecurangan akuntansi", "kehilangan", "kemahalan", "kempes",
    "kena", "kerugian", "khawatir", "kinerja buruk", "koreksi", "korupsi", "krisis", "kujual", "kurang",
    "lagging", "lambat", "laporan keuangan jelek",
    "lelet", "lemah", "lemot", "lepas", "lesu", "likuiditas rendah", "longsor", "loser", "lower", "loyo",
    "macet", "mahal", "mandek", "masalah", "mati", "melemah", "melorot", "menekan", "mentok", "menurun",
    "merah", "merosot", "merugi", "minim", "minus", "miskin", "mundur", "nahan", "nasib", "ndlosor",
    "negatif", "net sell", "netsell", "ngeri", "nggak", "nggak jelas", "nggak kuat", "nggak sanggup",
    "nyangkut", "nyesek", "nyesel", "nyungsep", "outflow", "overbought", "panic", "panic sell", "panik", "parah",
    "pasrah", "patah", "pecah", "pelemahan", "pembatalan dividen", "pengurangan", "penipuan", "penjualan insider", "penundaan", "penundaan proyek",
    "penurunan", "penurunan permintaan", "pesimis",
    "profit warning", "pusing", "puyeng", "rasio overvalue", "red", "reject", "resisten gagal", "rontok", "rugi", "rugi operasional",
    "rungkad", "saham gorengan", "saham jelek", "saham sampah", "sampah", "sangkut", "sanksi regulasi", "sebel", "sedih",
    "sell", "selling", "sentimen buruk", "serem", "sial", "sinyal jual", "skip", 
    "spam", "stagnan", "stress", "stuck", "suku bunga naik", "sulit", "surem", "susah", "suspensi", "target harga turun",
    "terancam", "terdampak", "terdepak", "tergerus", "terjun", "terkoreksi", "terpaksa", "terpengaruh", "terpuruk", "tertekan",
    "top losers", "trading halt", "trauma",
    "turun", "turunnya", "turunnya laba", "utang", "utang menumpuk", "volatilitas", "volume turun", "zonk"
])

# =============================
# SPLIT LEXICON (FIX DOUBLE COUNT)
# =============================
def split_lexicon(lexicon):
    single = set()
    phrases = set()
    for w in lexicon:
        if " " in w:
            phrases.add(w)
        else:
            single.add(w)
    return single, phrases

pos_single, pos_phrases = split_lexicon(positive_lexicon)
neg_single, neg_phrases = split_lexicon(negative_lexicon)

# =============================
# CLEAN TEXT
# =============================
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"@\w+|#\w+", " ", text)
    text = re.sub(r"\d+", " ", text)
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r'(.)\1{2,}', r'\1\1', text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# =============================
# NORMALIZE
# =============================
def normalize_text(text):
    tokens = text.split()
    return [kamus_dict.get(w, w) for w in tokens]

# =============================
# CONFIG NLP
# =============================
NEGATIONS = {"tidak","ga","gak","nggak"}
INTENSIFIERS = {"banget","parah","bgt"}

# =============================
# LEXICON LABELING (FIXED ENGINE)
# =============================
def lexicon_label(text):

    clean = clean_text(text)
    tokens = normalize_text(clean)
    joined = " ".join(tokens)

    pos_score = 0
    neg_score = 0

    # =============================
    # TOKEN MATCH (NEGATION LOCAL)
    # =============================
    for i, word in enumerate(tokens):

        negated = False
        if i > 0 and tokens[i-1] in NEGATIONS:
            negated = True

        if word in pos_single:
            if negated:
                neg_score += 1
            else:
                pos_score += 1

        elif word in neg_single:
            if negated:
                pos_score += 1
            else:
                neg_score += 1

    # =============================
    # PHRASE MATCH (NO DOUBLE COUNT)
    # =============================
    for phrase in pos_phrases:
        if phrase in joined:
            pos_score += 2

    for phrase in neg_phrases:
        if phrase in joined:
            neg_score += 2

    # =============================
    # INTENSIFIER
    # =============================
    if any(w in tokens for w in INTENSIFIERS):
        pos_score *= 1.3
        neg_score *= 1.3

    # =============================
    # NOISE FILTER
    # =============================
    if pos_score == 0 and neg_score == 0:
        return "netral"

    if abs(pos_score - neg_score) < 1:
        return "netral"

    # =============================
    # FINAL
    # =============================
    if pos_score > neg_score:
        return "positif"
    else:
        return "negatif"

# =============================
# PROCESS FILE
# =============================
def process_file(file):

    path = INPUT_DIR / file
    df = pd.read_csv(path, dtype=str).fillna("")

    print(f"\n📂 Processing: {file} | {len(df)} rows")

    tqdm.pandas(desc="🏷️ Lexicon Labeling")

    df["sentiment"] = df["tweet"].progress_apply(lexicon_label)

    output_name = file.replace(".csv", "_labellingLexicon.csv")
    output_path = OUTPUT_DIR / output_name

    df.to_csv(output_path, index=False, encoding="utf-8-sig")

    print(f"✅ Saved: {output_name}")

# =============================
# MAIN
# =============================
if __name__ == "__main__":

    print("🚀 AUTO LABELLING LEXICON (STABLE VERSION)")

    for file in FILES:
        process_file(file)

    print("\n✅ SELESAI SEMUA")