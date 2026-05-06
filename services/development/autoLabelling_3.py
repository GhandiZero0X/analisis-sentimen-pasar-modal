# services/development/autoLabelling_lexicon_raw.py
import pandas as pd
import re
from pathlib import Path
from tqdm import tqdm

# =============================
# PATH CONFIG
# =============================
BASE_DIR = Path(__file__).resolve().parents[2]

INPUT_DIR = BASE_DIR / "dev_database/1_raw"
OUTPUT_DIR = BASE_DIR / "dev_database/2_labellingLexicon"
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
    "abis","accumulate","acuan","advice","agresif","akhir","akhirnya","akra","akses","aksi","akum",
    "akumulasi","akumulasi beli","alhamdulilah","alhamdulillah","all time high","alokasi","aman","ambil",
    "andalan","angkat","apresiasi","ara","arah","asa","ascending","atas","ath","atraktif","auto reject atas","average","avia","ayo","ayok",
    "ayoo","back","badai","bagger","bagus","bagusnya","bahagia", "baik","bandingkan","bangga","bangkit","bangun",
    "beli", "beli di dip", "belikan","berapapun","berencana", "berhasil", "berkah", "berkelanjutan", "berkembang", "berkontribusi", "berlanjut", "bermanfaat", "berperan", "berpotensi", "bersama", "bersinar",
    "bertahan", "bertumbuh", "beruntun", "besar", "best", "better", "betul", "bisa terbang","blue", "bluechip","bottoming", "breakout",
    "bull", "bullish", "buruan", "buy", "buyback", "buying", "cakep", "cantik", "capai", "caplok", "cashflow", "cemerlang", "cenderung", "cepat", "cepet", "cerah", "cerdas",
    "chip", "ciamik", "cicil", "cicilan", "cocok", "comeback", "cuan", "cuci gudang", "cukup", "cutloss",
    "dca","defensif", "defensive", "dekati", "demand","devidennya","diakumulasi", "diatas", "dibeli", "diborong","diburu", "didorong", "digendong",
    "dihargai", "diincar", "dikoleksi", "diminati", "diproyeksikan", "direstui", "diserok", "disetujui", "ditopang", "diuntungkan",
    "dividen", "dividend", "dividennya", "dongkrak", "dominan", "dominasi", "efektif", "efisiensi", "ekspansi", "ekspor",
    "enak", "enaknya", "entry bagus", "favorit", "finally", "fokus", "fundamental kuat", "fundamental sehat",
    "gacor", "gain", "gas", "gass", "gampang", "gede", "gencar", "golden", "golden cross", "good",
    "green", "gurihnya", "happy", "harga menarik", "harga terkoreksi", "hasil", "high", "hijau", "hoki", "hold",
    "holding", "ijo", "ijoo", "imbal", "impian", "incar", "indikator bagus", "inovasi", "ipo sukses", "investasi",
    "investor", "juara", "jumbo", "justru", "katalis", "keep", "kejutan", "kemajuan", "kenaikan", "kencang", "kerek", "kerjasama", "kesempatan", "keuntungan",
    "kinerja baik", "kinerja ekspor", "kolaborasi", "komitmen", "konsisten", "konsistensi", "kontribusi", "kuat", "laba", "laba naik",
    "lancar", "lanjut", "lanjutan", "lanjutkan", "layak", "leaders", "likuiditas tinggi", "lompat", "long", "longterm",
    "love", "lumayan", "luncurkan", "maju", "makmur", "maksimal", "mampu", "mandiri", "manis", "mantap",
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
    "terbang", "terbuka", "terbukti", "tercatat", "terdiskon", "terjaga", "terkerek", "tertarik", "tertinggi", "tetap",
    "tinggi", "tingkatkan", "to the moon","top gainers", "topang", "tren", "trend", "trendnya", "tuku","tumbuh",
    "unggul", "untung", "untungnya", "upgrade rekomendasi", "upside", "uptrend", "volume meningkat", "wajar", "worth", "wow",
    "upper","uptrendnya", "waah","wah", "wajar", "watchlist", "yakin",
])

negative_lexicon = set([
    "abang", "amblas", "ambles", "ambrol", "ambruk", "ampas", "amsyong", "ancur", "anjlok", "arb", "auto reject bawah"
    "bad", "bandar", "bangkrut", "bapuk", "bearish", "beban", "berat", "berdarah", "bermasalah", "bleeding"
    "boncos", "breakdown", "brutal", "buang", "bubar", "buruk", "cabut", "capek", "chaos",
    "crash", "cut", "cut loss", "dead", "dibanting", "dihajar", "dihentikan sementara", "dijual", "dilego", "dilepas"
    "dilusi", "dilusi saham", "disedot", "distribusi", "distribusi jual", "ditarik", "ditekan", "ditinggal", "divestasi", "down"
    "down bad", "downgrade", "downgrade rekomendasi", "downtrend", "drastis", "drop", "dump", "exit", "fear", "flat"
    "floating", "gagal", "gejolak pasar", "gelembung pecah", "gorengan", "goyang", "halt", "hancur", "harga longsor", "hilang"
    "hutang", "imbas", "indikator jelek",
    "inflasi tinggi", "issue", "isu", "jangan", "jatoh", "jatuh", "jeblok", "jebol", "jelek", "jual"
    "jual rugi", "kabur", "kacau", "kalah", "kasus", "kebangkrutan", "kecurangan akuntansi", "kehilangan", "kemahalan", "kempes"
    "kena", "kerugian", "khawatir", "kinerja buruk", "koreksi", "korupsi", "krisis", "kujual", "kurang", "laggard"
    "lagging", "lambat", "laporan keuangan jelek",
    "lelet", "lemah", "lemot", "lepas", "lesu", "likuiditas rendah", "longsor", "loser", "lower", "loyo"
    "macet", "mahal", "mandek", "masalah", "mati", "melemah", "melorot", "menekan", "mentok", "menurun"
    "merah", "merosot", "merugi", "minim", "minus", "miskin", "mundur", "nahan", "nasib", "ndlosor"
    "negatif", "net sell", "netsell", "ngeri", "nggak", "nggak jelas", "nggak kuat", "nggak sanggup",
    "nyangkut", "nyesek", "nyesel", "nyungsep", "outflow", "overbought", "panic", "panic sell", "panik", "parah"
    "pasrah", "patah", "pecah", "pelemahan", "pembatalan dividen", "pengurangan", "penipuan", "penjualan insider", "penundaan", "penundaan proyek"
    "penurunan", "penurunan permintaan", "pesimis"
    "profit warning", "pusing", "puyeng", "rasio overvalue", "red", "reject", "resisten gagal", "rontok", "rugi", "rugi operasional"
    "rungkad", "saham gorengan", "saham jelek", "saham sampah", "sampah", "sangkut", "sanksi regulasi", "sebel", "sedih"
    "sell", "selling", "sentimen buruk", "serem", "sial", "sinyal jual", "skip", 
    "spam", "stagnan", "stress", "stuck", "suku bunga naik", "sulit", "surem", "susah", "suspensi", "target harga turun"
    "terancam", "terdampak", "terdepak", "tergerus", "terjun", "terkoreksi", "terpaksa", "terpengaruh", "terpuruk", "tertekan"
    "top losers", "trading halt", "trauma",
    "turun", "turunnya", "turunnya laba", "utang", "utang menumpuk", "volatilitas", "volume turun", "zonk"
])

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
# PHRASE MATCH
# =============================
def count_phrases(text, lexicon):
    count = 0
    for phrase in lexicon:
        if " " in phrase and phrase in text:
            count += 2  # weight lebih besar
    return count

# =============================
# LEXICON LABELING
# =============================
def lexicon_label(text):

    clean = clean_text(text)
    tokens = normalize_text(clean)
    joined = " ".join(tokens)

    pos_score = 0
    neg_score = 0

    # token match
    for word in tokens:
        if word in positive_lexicon:
            pos_score += 1
        if word in negative_lexicon:
            neg_score += 1

    # phrase match (lebih kuat)
    pos_score += count_phrases(joined, positive_lexicon)
    neg_score += count_phrases(joined, negative_lexicon)

    # negasi
    if any(w in tokens for w in ["tidak","ga","gak","nggak"]):
        pos_score, neg_score = neg_score, pos_score

    # intensifier
    if any(w in tokens for w in ["banget","parah","bgt"]):
        pos_score *= 1.5
        neg_score *= 1.5

    if pos_score > neg_score:
        return "positif"
    elif neg_score > pos_score:
        return "negatif"
    else:
        return "netral"

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

    print("🚀 AUTO LABELLING LEXICON (IMPROVED)")

    for file in FILES:
        process_file(file)

    print("\n✅ SELESAI SEMUA")