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
    "aamiin", "abis", "accumulate", "aces", "acuan", "adapun", "adaro", "admedika", "admf", "adro",
    "advice", "afrika", "agen", "agenbrilink", "agenda", "agii", "agresif", "agustus", "air", "aisa",
    "ajalah", "aje", "aka", "akbar", "akhir", "akhirnya", "akra", "akses", "aksi", "akum",
    "akumulasi", "akumulasi beli", "alam", "alasan", "alasannya", "alat", "alhamdulilah", "alhamdulillah", "all", "all time high",
    "allah", "alokasi", "aman", "ambil", "amrt", "anak", "anaknya", "analisa", "analisanya", "analisis",
    "analysis", "anda", "andai", "andalan", "ane", "angin", "angka", "angkat", "angpao", "anomali",
    "another", "antam", "antara", "anthoni", "anthony", "antm", "antri", "apapun", "aplikasi", "apps",
    "apr", "apresiasi", "april", "ara", "arah", "arko", "artis", "arto", "asa", "asal",
    "ascending", "aset", "asgr", "asia", "asii", "asik", "assa", "asset", "astra", "asumsi",
    "atas", "ath", "atm", "ato", "atraktif", "auto reject atas", "average", "avia", "ayo", "ayok",
    "ayoo", "back", "badai", "bagger", "bagi", "bagian", "bagus", "bagusnya", "bahagia", "bahana",
    "bahwa", "baik", "bakal", "bakalan", "baku", "bandingkan", "bangga", "bangkit", "bangsa", "bangun",
    "bantu", "bantuan", "bara", "barang", "barangnya", "bareng", "baru", "barusan", "bau", "bawa",
    "bawah", "bayar", "bbkp", "bbni", "bbrp", "bbtn", "bbyb", "bca", "bdmn", "beberapa",
    "beginian", "bei", "belajar", "belanja", "beli", "beli di dip", "beliau", "belikan", "below", "bentuk",
    "berada", "beragam", "berakhir", "berani", "berapapun", "berbagai", "berbeda", "berdampak", "berdasarkan", "berdiri",
    "berencana", "bergerak", "berhasil", "beri", "berikan", "berikut", "berikutnya", "berisiko", "berita", "berjalan",
    "berkah", "berkelanjutan", "berkembang", "berkontribusi", "berlanjut", "bermanfaat", "berperan", "berpotensi", "bersama", "bersinar",
    "bertahan", "bertumbuh", "beruntun", "besar", "besaran", "beserta", "besok", "best", "better", "betul",
    "bfin", "biar", "biasa", "biasanya", "biaya", "bibit", "bid", "big", "bilang", "bina",
    "bird", "bisa terbang", "bisaa", "bisalah", "bisnis", "bisnisnya", "bksl", "bles", "blom", "bloomberg",
    "blue", "bluechip", "bmtr", "bnli", "bobo", "bogasari", "boleh", "bonus", "bot", "bottom",
    "bottoming", "bps", "brand", "brarti", "breakout", "bren", "brilian", "brilink", "bris", "brivolution",
    "bro", "brpt", "bsk", "btc", "btw", "buah", "buat", "buffett", "bukan", "bukti",
    "buktikan", "buku", "bulanan", "bull", "bullish", "bumi", "bunga", "bursa", "buruan", "but",
    "buy", "buyback", "buying", "bwpt", "byan", "cabang", "cakep", "cantik", "capai", "capital",
    "caplok", "caps", "cara", "cari", "cash", "cashback", "cashflow", "catat", "catatan", "cbp",
    "cdia", "ceban", "cek", "cemerlang", "cenderung", "cepat", "cepet", "cerah", "cerdas", "cfin",
    "channel", "chart", "chartnya", "chip", "chitato", "ciamik", "cicil", "cicilan", "clean", "cleo",
    "closing", "cmnp", "cnbc", "coba", "cocok", "colek", "comeback", "comment", "commerce", "consumer",
    "cont", "continuation", "contoh", "contohnya", "convergence", "core", "corner", "corona", "corporate", "cowl",
    "cpin", "cross", "cuan", "cuci gudang", "cukup", "cuman", "cumdate", "cup", "cut", "cutloss",
    "daerah", "daftar", "daily", "dalam", "dampaknya", "dana", "dananya", "dapat", "dapet", "darurat",
    "data", "date", "dateng", "daun", "day", "daya", "dayamitra", "dca", "dcf", "dcii",
    "deal", "debit", "defensif", "defensive", "definisi", "dekati", "demand", "demen", "demi", "depan",
    "depannya", "deposito", "deretan", "des", "desa", "desember", "detail", "dev", "devidennya", "dewa",
    "diakumulasi", "diatas", "dibaca", "dibagi", "dibagikan", "dibayarkan", "dibeli", "diberikan", "dibikin", "diborong",
    "dibuka", "diburu", "didorong", "diem", "diemin", "digendong", "digit", "digitalisasi", "digunakan", "diharga",
    "dihargai", "diincar", "diinvestasikan", "dikasih", "dikenal", "dikoleksi", "dikuasai", "dilakukan", "dilihat", "dimana",
    "dimiliki", "diminati", "dinamika", "dingin", "dinilai", "dipakai", "dipangkas", "dipantau", "dipegang", "diperhatikan",
    "diperkirakan", "dipertimbangkan", "dipicu", "diproyeksikan", "diramal", "direstui", "dirut", "disaat", "disc", "discl",
    "disebut", "diserok", "disetujui", "disini", "diskonan", "ditandai", "ditopang", "ditunggu", "diuntungkan", "div",
    "divergence", "divestasi", "dividen", "dividend", "dividennya", "divisi", "dll", "dlm", "dmas", "dmmx",
    "doa", "doain", "dobel", "domestik", "dominan", "dominasi", "dongg", "dongkrak", "dooh", "download",
    "doyan", "dpr", "dpt", "dri", "dsb", "dsng", "dssa", "dua", "duid", "duit",
    "duitnya", "duluan", "dunia", "duo", "dvla", "early", "earnings", "economic", "efek", "efektif",
    "effect", "efisiensi", "ekonomi", "ekosistem", "eksekusi", "ekspansi", "ekspor", "elliott", "emas", "emiten",
    "empat", "emtk", "enak", "enaknya", "energi", "energy", "enggak", "enrg", "entah", "entitas",
    "entry bagus", "eps", "equity", "eraa", "essa", "euy", "evaluasi", "excl", "exdate", "expect",
    "fans", "far", "farma", "farmasi", "favorit", "februari", "fed", "fee", "fiber", "film",
    "finally", "finance", "financial", "first", "fishing", "fixed", "flow", "fluktuatif", "fokus", "fomo",
    "food", "for", "forbes", "frame", "fren", "from", "full", "fundamental", "fundamental kuat", "fundamental sehat",
    "fundamentalnya", "future", "gaa", "gabung", "gabungan", "gacor", "gada", "gae", "gain", "gais",
    "gaji", "gajian", "gambar", "gampang", "gan", "gapapa", "gas", "gass", "gatel", "gede",
    "gejolak", "gelombang", "gencar", "geopolitik", "ggrm", "giaa", "gibran", "gigi", "giliran", "gjtl",
    "gmtd", "gojek", "golden", "golden cross", "goldman", "good", "goods", "goodwill", "goreng", "gpp",
    "grade", "grafik", "green", "group", "grup", "gurihnya", "guys", "habis", "hadiah", "hahaha",
    "haka", "halal", "halimin", "handle", "happy", "harga menarik", "harga terkoreksi", "harian", "harusnya", "hasil",
    "hbs", "head", "heal", "heboh", "hehehe", "hello", "heran", "hidup", "high", "hihi",
    "hihihi", "hijau", "himbara", "hingga", "histogram", "hitung", "hitungan", "hmsp", "hoki", "hold",
    "holding", "home", "hotel", "hrum", "hujan", "ibarat", "ibu", "icbp", "ide", "idr",
    "idulfitri", "idx", "ifl", "ijo", "ijoo", "iklan", "ikn", "ikut", "ikutan", "ikutin",
    "ilmu", "imbal", "imjs", "imo", "impian", "inaf", "incar", "inco", "indeks", "indf",
    "indihome", "indikator", "indikator bagus", "indo", "indofood", "indomi", "indomie", "indonesia", "indosat", "indosurya",
    "inds", "induk", "industri", "indy", "inflasi", "info", "informasi", "infrastructures", "infrastruktur", "ingat",
    "inii", "inilah", "inklusi", "inkp", "inovasi", "insight", "instan", "instant", "institusi", "interest",
    "internal", "internasional", "international", "inti", "intinya", "intip", "intp", "intraday", "investasi", "investasinya",
    "investing", "investment", "investor", "ipcm", "iphone", "ipim", "ipo sukses", "ipot", "isat", "iseng",
    "isinya", "itmg", "its", "iyaa", "izin", "jadwal", "jajaran", "jakarta", "jalan", "jaringan",
    "jasa", "jawabannya", "jaya", "jelang", "jga", "join", "jpfa", "jpmorgan", "jsmr", "juara",
    "juli", "july", "jumat", "jumbo", "jumlah", "juni", "just", "justru", "juta", "jutaan",
    "kabel", "kado", "kak", "kala", "kaleng", "kali", "kami", "kamis", "kanan", "kapitalisasi",
    "karna", "karya", "kas", "kasih", "katalis", "kategori", "kau", "kaya", "kcuali", "kdsi",
    "keatas", "kebanting", "kebeli", "kebetulan", "kebutuhan", "kecipratan", "kedepan", "kedepannya", "kedua", "keduanya",
    "keep", "kejar", "kejutan", "keliatan", "keluarga", "kemajuan", "kembali", "kemudian", "kenaikan", "kenal",
    "kencang", "kenceng", "kepada", "kepemilikan", "kepikiran", "kerek", "kerja", "kerjaan", "kerjasama", "kesehatan",
    "kesempatan", "kesimpulan", "ketahanan", "ketidakpastian", "ketiga", "ketimbang", "ketinggalan", "keuangan", "keuangannya", "keuntungan",
    "khususnya", "kian", "kija", "kinerja", "kinerja baik", "kinerja ekspor", "king", "kini", "kira", "kisaran",
    "klbf", "klo", "kmaren", "know", "kolaborasi", "koleksi", "kolom", "komen", "komitmen", "komoditas",
    "kompak", "konglo", "konglomerat", "konsisten", "konsistensi", "konsolidasi", "konstruksi", "konsumer", "kontan", "konten",
    "kontrak", "kontribusi", "koordinasi", "koperasi", "kopi", "koreksi", "korporasi", "kos", "kosan", "kota",
    "kpd", "kpr", "kras", "kredit", "kripto", "krisis", "kualitas", "kuartal", "kuat", "kudu",
    "kuncinya", "kuning", "kupon", "kur", "laba", "laba naik", "lage", "lagii", "lahh", "lainnya",
    "lakukan", "lancar", "langkah", "langsung", "lanjut", "lanjutan", "lanjutkan", "lantai", "lapangan", "laper",
    "laporan", "lari", "last", "lawan", "layak", "layanan", "lbr", "leaders", "least", "lebaran",
    "lebi", "lebih", "lembar", "lempar", "lengkap", "lengkapnya", "lets", "level", "lewat", "lgi",
    "lha", "lho", "liburan", "lihat", "likuiditas", "likuiditas tinggi", "lima", "limit", "line", "lini",
    "link", "lipat", "liquid", "listing", "live", "lkh", "lmbr", "loh", "lohh", "lompat",
    "long", "longterm", "loss", "love", "lppf", "luar", "luas", "lumayan", "luncurkan", "lupa",
    "luv", "macam", "macd", "mah", "mahar", "main", "mainnya", "maju", "maka", "makan",
    "makasih", "make", "makmur", "maksimal", "maksudnya", "malam", "malem", "mampu", "mandiri", "manggung",
    "manis", "mantap", "mantep", "mantul", "manusia", "mapa", "mapi", "marah", "maret", "mari",
    "mark", "marubozu", "masa", "masak", "masif", "masuk", "masukin", "masyarakat", "mata", "maupun",
    "may", "mayan", "mayora", "mbak", "mbma", "mcopeets", "mdka", "mdln", "medc", "media",
    "meeting", "mega", "mei", "melaju", "melakukan", "melalui", "melambung", "melandai", "melanjutkan", "melesat",
    "melewati", "melihat", "melonjak", "meluncurkan", "memang", "membaik", "membantu", "membeli", "membentuk", "memberi",
    "memberikan", "membludak", "memborong", "membuat", "membukukan", "memilih", "memiliki", "memperluas", "mempertahankan", "mempertimbangkan",
    "memprediksi", "memulai", "menabung", "menaikkan", "menang", "menanti", "menargetkan", "menarik", "menawarkan", "mencapai",
    "mencari", "mencatat", "mencatatkan", "mencerminkan", "mencetak", "mendatang", "mendekati", "mending", "mendominasi", "mendorong",
    "mendunia", "menegaskan", "menembus", "menengah", "menerima", "menetapkan", "mengakhiri", "mengakumulasi", "mengalami", "menggelar",
    "menggiurkan", "menggunakan", "menghadirkan", "menghasilkan", "menghijau", "mengikuti", "mengingat", "menguntungkan", "menikmati", "menilai",
    "meningkat", "meningkatkan", "menjadi", "menjaga", "menjelang", "menkeu", "mentah", "menuju", "menunggu", "menunjukan",
    "menunjukkan", "menurut", "menurutku", "menyesal", "menyetujui", "menyumbang", "menyusul", "meraup", "merek", "merger akuisisi",
    "merilis", "merk", "meroket", "merupakan", "meski", "mestinya", "mid", "midi", "mie", "mika",
    "mikir", "milih", "milik", "milyar", "mimi", "min", "minimal", "minimalnya", "minum", "minuman",
    "minyak", "mirae", "misal", "mitra", "mjb", "mlpl", "mmg", "mncers", "mncn", "mncsek",
    "mobil", "modal", "modus", "moga", "momen", "momen bagus", "momentum", "momentum naik", "money", "monggo",
    "moodys", "moon", "motor", "msci", "msih", "msky", "mtdl", "muatan", "mudah", "mulai",
    "mumpung", "murah", "musim", "myrx", "nabung", "naek", "naga", "naik", "naikk", "naikkan",
    "nama", "namanya", "nambah", "nambahin", "nanggung", "nanjak", "nanti", "napa", "nasabah", "nasi",
    "nasional", "nawar", "ndar", "nder", "neckline", "negeri", "neh", "nek", "net buy", "net buying",
    "netbuy", "neutradc", "new", "ngadi", "ngajak", "ngamuk", "nganggur", "ngapain", "ngasih", "nge",
    "ngebut", "ngecek", "ngegas", "ngeliat", "ngeluarin", "ngikut", "ngitung", "nice", "nihh", "nikmat",
    "nikmati", "nikmatin", "nilai", "non", "not", "note", "november", "now", "npm", "ntar",
    "nusantara", "nyangka", "nyari", "nyata", "nyenyak", "nyerok", "nyicil", "nyoba", "obat", "obligasi",
    "off", "ohh", "oke", "okt", "oktober", "olahan", "oleh", "omset", "opening", "operasional",
    "opo", "opsi", "optimal", "optimis", "optimisme", "ori", "otomotif", "outlook", "outperform", "oversold",
    "pajak", "pake", "paket", "pandangan", "pangan", "pangkas", "pani", "panjang", "pantas", "parkir",
    "paruh", "pas", "pasar", "passive", "pasti", "pastinya", "patut", "payout", "pbrx", "pbv",
    "peduli", "pekan", "pelaku", "pelan", "pelosok", "pembahasan", "pembalikan", "pembangunan", "pembayaran", "pembelian",
    "pembiayaan", "pembukaan", "pemegang", "pemimpin", "pemodal", "pemulihan", "pemulihan ekonomi", "pencapaian", "pendapat", "pendapatan",
    "pendidikan", "pengembangan", "pengen", "penghasilan", "penguatan", "pengumuman", "pengumuman positif", "pengurus", "pengusaha", "peningkatan",
    "peningkatan permintaan", "penjualan", "penopang", "pensiun", "penting", "penuh", "penutupan", "penyaluran", "per", "perbankan",
    "percaya", "perdagangan", "perdana", "perekonomian", "performa", "performance", "pergerakan", "perhatian", "perhatikan", "perhitungan",
    "peringkat", "periode", "perkasa", "perkembangan", "perkiraan", "perlawanan", "perlu", "permintaan", "persen", "persero",
    "perseroan", "pertahankan", "pertama", "pertambangan", "pertimbangkan", "pertumbuhan", "perusahaan", "perusahaannya", "pesat", "pesta",
    "pfs", "pgas", "pgeo", "phintraco", "pick", "pilih", "pimpin", "pintar", "plan", "platform",
    "play", "plus", "pnlf", "poin", "pokoknya", "pola", "pop", "populer", "porsi", "portfolio",
    "posisi", "positif", "positif outlook", "post", "posting", "postingan", "potensial", "power", "pra", "prabowo",
    "pre", "premium", "price", "prinsip", "prioritas", "produk", "produknya", "produsen", "profit", "profitnya",
    "promo", "proses", "prospek", "prospek cerah", "prospektif", "proyeksi", "ptba", "ptpp", "pulih", "pullback",
    "puluhan", "pump", "punya", "purbaya", "pusat", "putih", "pwon", "rabu", "radar", "ragu",
    "raja", "raksasa", "rakyat", "rally", "ramadan", "ramah", "ramalan", "range", "rapat", "rapor",
    "rasanya", "rasio undervalue", "rata", "rate", "ratio", "ratusan", "raup", "rawan", "raya", "rdn",
    "rdpu", "real", "realisasi", "rebound", "rebutan", "recovery", "regional", "reguler", "rejeki", "rek",
    "rekening", "rekomen", "rekomendasi", "rekomendasi beli", "rekomendasinya", "rekor", "reksadana", "rencana", "rendah", "rentan",
    "resiko", "resist", "resistance", "resmi", "restu", "ret", "ribet", "ribu", "ribuan", "rights issue positif",
    "rilis", "ringan", "riset", "risiko", "risk", "rokok", "rotasi", "royal", "royo", "rumah",
    "rups", "rupst", "saat", "saatnya", "sabar", "sabi", "sachs", "sadar", "sage", "sah",
    "saham bagus", "saham pilihan", "saham unggulan", "sahamku", "sahamnya", "sahamology", "salah", "sales", "salim", "saling",
    "salut", "sampai", "samuel", "sang", "sangat", "santai", "santuy", "saran", "saranin", "satu",
    "satunya", "sbg", "sblmnya", "scma", "screener", "sdh", "sebab", "sebagai", "sebanyak", "sebelumnya",
    "sebesar", "sebulan", "sebut", "sector", "sedikit", "see", "segar", "segera", "segini", "seh",
    "sehari", "sehat", "sehingga", "seiring", "sejahtera", "sejumlah", "sejuta", "sekadar", "sekalian", "sekaligus",
    "seksi", "sektor", "sektoral", "sektornya", "selain", "selalu", "selama", "selamat", "selanjutnya", "selasa",
    "selengkapnya", "selesainya", "selot", "seluruh", "semakin", "semangat", "sembako", "semester", "semingguan", "semoga",
    "sempat", "semuanya", "senang", "sender", "sendiri", "seneng", "senilai", "senin", "sentimen", "sentuh",
    "senyum", "seorang", "sepakat", "sepanjang", "sepekan", "seperti", "sepertinya", "september", "serius", "serok",
    "service", "sesuatu", "setara", "setelah", "setia", "setidaknya", "setoran", "setuju", "share", "sia",
    "siang", "siap", "siapa", "siapkan", "sibuk", "sideways", "signifikan", "siklus", "silo", "simak",
    "simpan", "sinergi", "sing", "single", "sini", "sinyal", "sinyal beli", "sip", "sisa", "sisanya",
    "sisi", "sistem", "skenario", "skrining", "sma", "smart", "smbr", "smcb", "smdr", "smgr",
    "smma", "smoga", "smra", "smsm", "smua", "soalnya", "sobat", "solo", "solusi", "soon",
    "sore", "sorotan", "sos", "sosial", "source", "souvenir", "speculative", "spesial", "sril", "srtg",
    "ssia", "ssms", "stabil", "stabilitas", "standar", "stochastic", "stockbit", "stocks", "stok", "stonks",
    "stop", "strategi", "strateginya", "strategis", "strong", "strong buy", "struktur", "suka", "sukses", "suku",
    "sumber", "sunarso", "sungguh", "super", "support", "support kuat", "swing", "switch", "sya", "syariah",
    "syukur", "tabung", "tabungan", "tahan", "tahu", "tahunan", "tahunnya", "tajam", "takut", "tambah",
    "tambahan", "tampak", "tanah", "tanda", "tanggal", "tangguh", "tapg", "target", "target harga naik", "targetkan",
    "tarif", "tarik", "taruh", "taun", "tbig", "tbk", "tbla", "tcpi", "tdk", "tebal",
    "tebar", "tech", "teknikal", "teknikalnya", "telah", "telco", "telekom", "telkom", "teman", "tembus",
    "tempat", "tengah", "tenggara", "tepat", "tepung", "terakhir", "teratas", "terbang", "terbanyak", "terbaru",
    "terbatas", "terbesar", "terbesarnya", "terbuka", "terbukti", "tercatat", "terdekat", "terdiskon", "tergantung", "terhadap",
    "terigu", "terima", "terimbas", "terjaga", "terkerek", "terlihat", "tersebar", "tersebut", "tertahan", "tertarik",
    "tertinggi", "tes", "tetap", "tetiba", "tgl", "thank", "thanks", "the", "thinking", "thr",
    "thx", "tiap", "tidur", "tier", "tiga", "tiket", "tim", "time", "timur", "tinggal",
    "tinggi", "tingkat", "tingkatkan", "tins", "tipe", "titik", "tkim", "tlkm", "tmpo", "to the moon",
    "today", "tok", "tol", "top gainers", "topang", "total", "towr", "tpi", "tpia", "track",
    "trade", "traders", "trading", "tradingview", "trafik", "trailing", "tram", "transaksi", "transfer", "tren",
    "trend", "trendnya", "triangle", "triliun", "triliunan", "triwulan", "trump", "tspc", "tuesday", "tujuan",
    "tujuannya", "tuku", "tulis", "tumbuh", "tunggu", "tunjukkan", "turut", "tutup", "tweet", "uang",
    "uangnya", "uji", "ulasan", "ultah", "ultra", "umat", "umkm", "umroh", "umum", "under",
    "unggul", "ungkap", "unilever", "untr", "untung", "untungnya", "unvr", "update", "upgrade rekomendasi", "upper",
    "upside", "uptrend", "uptrendnya", "usahanya", "usai", "usd", "utank", "utk", "vaksin", "valuasi",
    "valuasinya", "value", "varian", "video", "vol", "volatil", "volatile", "volume", "volume meningkat", "waah",
    "wah", "wajar", "wajib", "waktu", "waktunya", "walau", "wanita", "warisan", "watchlist", "wave",
    "week", "weekly", "wege", "welcome", "when", "white", "wiim", "wijaya", "wilayah", "will",
    "with", "wkwkwkwkwk", "womf", "wong", "wood", "worth", "wow", "woww", "wsbp", "wskt",
    "wton", "wujudkan", "yaitu", "yakin", "yakni", "yaudah", "ych", "year", "yieldnya", "yok",
    "yokk", "you", "youtube", "ytd", "yugen", "zona"
])

negative_lexicon = set([
    "adanya", "aduh", "afiliasi", "again", "agak", "agar", "ahh", "ahli", "ajaa", "ajah",
    "ajakan", "akal", "akibat", "aktif", "akuisisi", "akusisi", "ama", "amat", "amblas", "ambles",
    "ambrol", "ambruk", "amerika", "amin", "ammn", "ampas", "ampun", "amsyong", "ancur", "aneh",
    "anj", "anjayy", "anjeng", "anjing", "anjirr", "anjlok", "any", "apa", "apaa", "apalagi",
    "apestor", "app", "arb", "arpu", "artikel", "asalnya", "aseng", "asingnya", "asli", "aslinya",
    "astaga", "asu", "asuransi", "aturan", "auto", "auto reject bawah", "avd", "avg", "awalnya", "awasi",
    "aza", "bad", "balik", "balikin", "bandar", "bandarmologi", "bandarnya", "bang", "bangett", "bangke",
    "bangkrut", "banjir", "banks", "bapak", "bapuk", "batal", "batas", "batu", "batubara", "bayangin",
    "bearish", "beban", "bebas", "beda", "begini", "begitu", "belasan", "belinya", "belom", "benar",
    "bener", "bep", "berarti", "berasa", "berat", "berbalik", "berdarah", "berdoa", "beredar", "berharap",
    "berhenti", "berkapitalisasi", "berkurang", "berlangsung", "bermasalah", "bersabar", "bersyukur", "bertahun", "berubah", "berusaha",
    "bet", "bgst", "bgt", "bgtt", "biarin", "bigbank", "bikin", "bingung", "bio", "bitcoin",
    "bjir", "bkn", "bkrky", "blanja", "bleeding", "blm", "bni", "bnr", "bnyk", "bola",
    "boncos", "book", "bounce", "boy", "brapa", "breakdown", "breaking", "brics", "broker", "brp",
    "brutal", "bsa", "bsd", "btps", "buang", "bubar", "buka", "bukannya", "bukukan", "bumbu",
    "bumn", "buru", "buruk", "buset", "busuk", "butuh", "buzzer", "bye", "byk", "cabut",
    "call", "can", "cape", "capek", "caranya", "case", "cat", "cbdk", "central", "cerita",
    "changes", "chaos", "cheetos", "chips", "ciri", "cita", "ckpn", "close", "cokk", "com",
    "company", "concern", "corpora", "cost", "covid", "crash", "ctak", "cukai", "cus", "customer",
    "cut", "cut loss", "dagang", "dah", "dalamnya", "dalem", "danantara", "darah", "daripada", "dasar",
    "dead", "dear", "deg", "demikian", "dendam", "denger", "der", "deras", "dianggap", "diangkat",
    "diantara", "dibahas", "dibanting", "dibawa", "dibawah", "dibawahnya", "dibilang", "dibutuhkan", "dihajar", "dihentikan sementara",
    "dihold", "dijual", "dikasi", "dikeluarkan", "dilego", "dilepas", "diliat", "dilusi", "dilusi saham", "diminggu",
    "dimulai", "dipake", "dipercaya", "dipimpin", "dipublikasikan", "direksi", "diri", "disebabkan", "disedot", "disertai",
    "disiplin", "disitu", "disorot", "distribusi", "distribusi jual", "disuruh", "ditahan", "ditambah", "ditanya", "ditarik",
    "ditekan", "diterima", "ditinggal", "divestasi", "dkk", "doang", "doi", "dolar", "dollar", "doritos",
    "dotop", "double", "down", "down bad", "downgrade", "downgrade rekomendasi", "downtren", "downtrend", "downtrendnya", "drama",
    "drastis", "drop", "drpd", "dugaan", "duh", "dulu", "dump", "ebitda", "edc", "ehh",
    "eido", "ekspektasi", "emg", "entar", "estimasi", "etf", "eth", "even", "exit", "fakta",
    "faktor", "fase", "fasilitas", "fca", "fear", "feb", "feeling", "fiktif", "finansial", "fix",
    "flat", "floating", "follow", "foreign", "foto", "foya", "free", "ftse", "fund", "fyi",
    "gaada", "gabakal", "gabisa", "gaga", "gagal", "gainnya", "gajadi", "gamau", "game", "gandum",
    "gangguan", "ganti", "gantian", "gapunya", "gara", "gatau", "gcg", "gegara", "gejolak pasar", "gelap",
    "gelembung pecah", "gemes", "gendut", "gerak", "gerakan", "ges", "ghz", "gila", "gilak", "gini",
    "gmn", "gocap", "gorengan", "goyang", "grgr", "gtu", "gula", "guru", "gws", "haji",
    "hal", "halo", "halt", "hampir", "hancur", "hantu", "harap", "harapan", "harga longsor", "harganya",
    "harta", "hati", "hebat", "hilang", "hit", "hitam", "hmm", "holder", "hrga", "hrs",
    "huhu", "hutang", "iep", "ikan", "ilang", "imbas", "index", "indikasi", "indikator jelek", "inflasi",
    "inflasi tinggi", "influencer", "infra", "inget", "int", "investornya", "ipo", "irra", "islamic", "issi",
    "issue", "isu", "itupun", "jadinya", "jagoan", "jam", "jaman", "jan", "jangan", "jari",
    "jatoh", "jatuh", "jawab", "jawaban", "jeblok", "jebol", "jejaknya", "jelasin", "jelek", "jgn",
    "jir", "jokowi", "jual", "jual rugi", "jualan", "jualin", "judi", "judol", "jujur", "kabar",
    "kabeh", "kabur", "kacau", "kadang", "kagak", "kah", "kaka", "kakak", "kalah", "kalian",
    "kalimat", "kalua", "kampret", "kang", "kantor", "kapan", "kartu", "karyawan", "kasian", "kasus",
    "kata", "katanya", "kayanya", "kebakaran", "kebangkrutan", "kebanyakan", "kebawah", "kebayang", "kecil", "kecurangan akuntansi",
    "kehilangan", "keinget", "kejadian", "kek", "keknya", "kelas", "keliatannya", "kemahalan", "kemana", "kemaren",
    "kempes", "kena", "kenapa", "kenyataan", "kepala", "keras", "kerugian", "kesabaran", "keseluruhan", "ketat",
    "ketolong", "keu", "khan", "khawatir", "kinerja buruk", "kinerjanya", "kino", "kirain", "kmren", "kmrin",
    "kmrn", "knp", "kocak", "koh", "kok", "komisaris", "komisi", "komunikasi", "kondisi", "konfirmasi",
    "konsumen", "kontol", "korban", "koreksi", "korupsi", "kotak", "kpk", "krisis", "kuatir", "kujual",
    "kuota", "kurang", "kurs", "kyknya", "laa", "laggard", "lagging", "lagian", "lake", "lama",
    "lambat", "lampu", "langit", "lapkeu", "laporan keuangan jelek", "laptop", "laut", "lays", "lbh", "leading",
    "lek", "lelang", "lelet", "lemah", "lemot", "lepas", "lesu", "let", "lgsg", "liat",
    "liatin", "liatnya", "life", "likuiditas rendah", "limited", "listrik", "logika", "lokal", "longsor", "lord",
    "loser", "lots", "lower", "loyo", "lucu", "maaf", "maap", "macem", "macet", "mahal",
    "major", "makanya", "maker", "maki", "maklum", "malah", "males", "malu", "mana", "mandek",
    "mantengin", "manuver", "masalah", "masalahnya", "masuknya", "material", "mati", "maunya", "mayoritas", "mba",
    "meanwhile", "megang", "meledak", "melemah", "melemahnya", "melepas", "melorot", "memanfaatkan", "membaca", "membara",
    "membawa", "memegang", "mempengaruhi", "memublikasikan", "menangis", "mendadak", "mendingan", "menekan", "menemukan", "mengakuisisi",
    "mengenai", "menghadapi", "mengurangi", "menit", "menjual", "mental", "mentok", "menurun", "menyala", "menyalaa",
    "merah", "merahnya", "merangkak", "merasa", "merger", "merona", "merosot", "merugi", "mesin", "meskipun",
    "mesti", "mgc", "mikro", "mimpi", "mines", "minim", "minoritas", "minus", "minusnya", "misalnya",
    "miskin", "mkpi", "model", "mohon", "mom", "moment", "monthly", "monyet", "movers", "mtg",
    "mudik", "mules", "mulu", "mundur", "munggah", "nah", "nahan", "naikin", "nampung", "nanem",
    "nangis", "nanya", "narik", "naro", "nasib", "ndlosor", "negatif", "negosiasi", "nemu", "net",
    "net sell", "netral", "news", "next", "ngambil", "ngaruh", "ngefek", "ngeh", "ngeri", "ngerti",
    "ngikutin", "ngomong", "ngomongin", "ngurus", "ngurusin", "niat", "niatnya", "nim", "nisp", "nitip",
    "njir", "nnti", "nomer", "nomor", "nonton", "normal", "npl", "nungguin", "nunjukin", "nyampe",
    "nyangkut", "nyangkuters", "nyaris", "nyentuh", "nyesek", "nyesel", "nyimpen", "nyungsep", "nyusul", "ojk",
    "okelah", "one", "only", "operator", "ora", "org", "otomatis", "otoritas", "otw", "out",
    "outflow", "over", "overbought", "owner", "ownernya", "pacific", "padahal", "pagi", "paham", "pakai",
    "panic", "panic sell", "panik", "pantengin", "pantes", "pantesan", "para", "parah", "part", "pasang",
    "pasrah", "pastikan", "pasukan", "patah", "payung", "pdhal", "pdhl", "pecah", "pek", "pekerja",
    "pelajaran", "pelajari", "pelanggan", "pelantikan", "pelemahan", "peluncuran", "pemain", "pemasukan", "pembatalan dividen", "pemberat",
    "pemerintah", "pengadaan", "pengalaman", "pengguna", "pengurangan", "penipuan", "penjelasan", "penjual", "penjualan insider", "penundaan",
    "penundaan proyek", "penurunan", "penurunan permintaan", "penyebab", "penyebabnya", "pepsi", "pepsico", "perasaan", "perbaikan", "pergerakannya",
    "periksa", "pernah", "perolehan", "persentase", "pertamina", "pertanyaan", "pesimis", "peta", "pihak", "pikir",
    "pindah", "pindahin", "pinehill", "pinjaman", "pinter", "please", "plg", "pling", "plis", "pliss",
    "pls", "pokok", "pol", "politik", "poll", "pompom", "pondasi", "porto", "prajogo", "prediksi",
    "prefer", "presiden", "pribadi", "pricing", "prof", "profit", "profit warning", "project", "provider", "provisi",
    "proyek", "pssi", "puasa", "publik", "pucuk", "pula", "pulang", "pulsa", "pusing", "puyeng",
    "qoq", "quarter", "queen", "rasio overvalue", "ratu", "rdtx", "rebu", "red", "reject", "rejection",
    "rekan", "reksa", "rela", "repot", "resisten gagal", "respect", "retail", "return", "revisi", "right",
    "ritel", "roa", "roic", "rombak", "rontok", "rugi", "rugi operasional", "rungkad", "rupslb", "rusak",
    "rusia", "sabun", "saham gorengan", "saham jelek", "saham sampah", "sakit", "salam", "saldo", "sambil", "sampah",
    "sampe", "sana", "sanggup", "sangkut", "sanksi regulasi", "sarankan", "saudara", "sawit", "sayang", "sayangnya",
    "seandainya", "sebaiknya", "sebaliknya", "sebel", "sebelah", "sebenarnya", "sebenernya", "sebentar", "seberapa", "secepat",
    "sedangkan", "sedap", "sedih", "segi", "seharga", "seharusnya", "sejak", "sejauh", "sekalipun", "sekarang",
    "sekolah", "selisih", "sell", "selling", "semenjak", "senen", "sengaja", "sentimen buruk", "serangan", "serem",
    "set", "setahun", "setaun", "setengah", "seumur", "shareholder", "shm", "sial", "sialan", "side",
    "signal", "sii", "silam", "sinyal jual", "situ", "skema", "skip", "skrg", "small", "smpe",
    "soal", "sodara", "soto", "spam", "stagnan", "state", "stay", "steele", "stelah", "stress",
    "sttp", "stuck", "suatu", "suku bunga", "suku bunga naik", "sulit", "supply", "supportnya", "surem", "suruh",
    "susah", "suspensi", "swasta", "syarat", "tadinya", "tai", "taiwan", "tak", "take", "taking",
    "tampaknya", "tandanya", "tangan", "tangga", "tantangan", "tanya", "target harga turun", "taunya", "tax", "technical",
    "teknologi", "telko", "telpon", "temen", "tempo", "tentang", "tentu", "terancam", "terang", "terbongkar",
    "terdalam", "terdampak", "terdepak", "terendahnya", "tergerus", "terjun", "terkait", "terkenal", "terkoreksi", "terlalu",
    "ternyata", "terpaksa", "terpantau", "terpengaruh", "terpopuler", "terpuruk", "tertekan", "tertingginya", "terungkap", "tetapi",
    "tetep", "that", "this", "thn", "tiba", "timing", "toh", "tokopedia", "tolol", "tolong",
    "top losers", "trader", "trading halt", "trauma", "trending", "trio", "tsb", "tsel", "ttp", "tugu",
    "tumben", "tunda", "turun", "turunnya", "turunnya laba", "twit", "uda", "udah", "ujan", "ujung",
    "ukraina", "umumnya", "umur", "undervalue", "uninstall", "urusan", "urutan", "utang", "utang menumpuk", "via",
    "view", "viral", "volatilitas", "volume turun", "voter", "wacana", "waduh", "wahai", "wajarnya", "walopun",
    "warga", "warna", "was", "weekend", "wew", "what", "why", "wib", "witel", "wkkw",
    "wkwkkw", "wkwkwk", "wkwkwkw", "wkwkwkwk", "woy", "yaah", "yaallah", "yaampun", "yaelah", "yah",
    "yahh", "yes", "your", "yoy", "zat", "zonk"
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