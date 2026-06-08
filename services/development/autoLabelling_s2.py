# services/development/autoLabelling_2.py
"""
=============================================================
RELABELLING NETRAL → POSITIF/NEGATIF (Skenario 2)
=============================================================
Input  : dev_database/2_labelling_S1S3/
         tweets_*_labellingLexicon.csv  (3 label: pos/neg/netral)

Proses :
  - Baris yang sudah positif/negatif → TIDAK diubah
  - Baris NETRAL → skor ulang pakai leksikon Skenario 2
    (pos > neg → positif | neg >= pos → negatif | 0,0 → negatif)

Output : dev_database/2_labelling_S2/
         tweets_*_labellingLexicon.csv  (2 label: pos/neg saja)
=============================================================
"""

import re
import pandas as pd
from pathlib import Path
from tqdm import tqdm

# ══════════════════════════════════════════════════════════════
#  PATH CONFIG
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
INPUT_DIR  = BASE_DIR / "dev_database" / "2_labelling_S1S3"
OUTPUT_DIR = BASE_DIR / "dev_database" / "2_labelling_S2"
KAMUS_FILE = BASE_DIR / "kamus" / "kamuskatabaku.xlsx"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

FILES = [
    "tweets_after_covid_labellingLexicon.csv",
    "tweets_before_covid_labellingLexicon.csv",
    "tweets_covid_labellingLexicon.csv",
]

# ══════════════════════════════════════════════════════════════
#  LOAD KAMUS
# ══════════════════════════════════════════════════════════════
kamus_df   = pd.read_excel(KAMUS_FILE)
kamus_dict = dict(zip(
    kamus_df["tidak_baku"].astype(str).str.lower(),
    kamus_df["kata_baku"].astype(str).str.lower()
))

# ══════════════════════════════════════════════════════════════
#  LEKSIKON (salin persis dari autoLabelling_3_scenario2.py)
# ══════════════════════════════════════════════════════════════
positive_lexicon = set([
    "accumulate","agresif","akumulasi","akumulasi beli","all time high","aman","apresiasi","ascending","ath","atraktif",
    "bagger","bagus","bagusnya","bahagia","baik","bangga","bangkit","berhasil","berkah","berkembang",
    "berkontribusi","berlanjut","bermanfaat","berpotensi","bersinar","bertahan","bertumbuh","beli", "best","better","bluechip",
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
    "mantep","mantul","masif","melaju","melambung","melesat","melonjak","membaik","membantu","membeli",
    "memborong","membukukan","memilih","memiliki","memperluas","mempertahankan","menabung","menaikkan","menang","menargetkan",
    "menarik","menawarkan","mencapai","mencatat","mencetak","mendominasi",
    "mendorong","menembus","mengakumulasi","menggiurkan","menghasilkan","menghijau","menguntungkan","menikmati","meningkat","meningkatkan",
    "menjaga","menuju","menyetujui","menyumbang","meraup","merger akuisisi","merilis","meroket","momen bagus","momentum",
    "momentum naik","moon","mudah","murah","naik","nambah","nanjak","net buy","net buying","netbuy",
    "ngebut","ngegas","nice","nikmat","nikmati","nyerok","nyicil","optimal","optimis","optimisme",
    "outlook","outperform","oversold","panjang","pantas","pasti","pastinya","patut","payout","pembelian",
    "pemulihan","pemulihan ekonomi","pencapaian","pendapatan",
    "penguatan","pengumuman positif","peningkatan","peningkatan permintaan","penopang","percaya","performa","performance","perkasa","perkembangan",
    "permintaan","pertahankan","pertumbuhan","pesat","pintar","populer","portfolio","positif","positif outlook","potensial",
    "premium","prioritas","profit","profitnya","prospek","prospek cerah","prospektif","proyeksi","pulih","pump",
    "raksasa","rally","ramah","rasio undervalue","realisasi","rebound","recovery","rejeki","rekomen","rekomendasi",
    "rekomendasi beli","rekor","rendah","restu","rights issue positif","rights issue","rightsissue","rilis","rotasi","royal",
    "saatnya","sabar","saham bagus","saham pilihan","saham unggulan","sehat","sejahtera","semakin","semoga","senang",
    "seneng","serius","serok","setuju","siap","signifikan","simpan","sinergi","sinyal beli","sip",
    "smart","solusi","spesial","stabil","stabilitas","strategi","strategis","strong","strong buy","sukses",
    "super","support","support kuat","syukur","tabung","tabungan","tahan","tambah","tambahan","tangguh",
    "target","target harga naik","tembus","terbang","terbuka","terbukti","tercatat","terbesar","terdiskon","terjaga",
    "terkerek","tertarik","tertinggi","tetap","tinggi","tingkatkan","to the moon","top gainers","topang","tren",
    "trend","trendnya","tuku","tumbuh","unggul","untung","untungnya","upgrade rekomendasi","upside","uptrend",
    "volume meningkat","wajar","worth","wow","upper","uptrendnya","waah","wah","watchlist","yakin",
    
    # kamus tambahan skenario 2 positif
    "brilian","business","miliki","terbitkan","stok","perkiraan","serap","special","shopeepay","social",
    "meluncurkan","bergabung","series","istimewa","penghasilan","online","penawaran","berkualitas","akses","sale",
    "budget","dinamika","konstruksi","mitratel","perdana","memproduksi","rebutan","favorit","pemegang","bukti",
    "umkm","deposito","live","bagi","internasional","siapkan","digitalisasi","fitur","bergerak","alhamdulillah",
    "pajak","adro","perusahaan","selengkapnya","terstruktur","kemampuan","alokasi","referral","peringkat","investing",
    "pangsa","fresh","wujudkan","berbagi","menghadirkan","kemudahan","ekosistem","historis","sahamology","pilar",
    "aspek","sambut","kemasan","skala","brivolution","discount","asa","waran","skrining","cagr",
    "dplk","mempunyai","penghasilan","strateginya","analisis","daya","power","voucher","inklusi","skenario",
    "pembangunan","ceria","division","persero","energi","indofood","manfaatkan","manfaat","highlight","keuangannya",
    "berbasis","fintek","alternatif","riset","ideal","produktif","likuid","bina","memperoleh","nabung",
    "memulai","cloud","tips","upaya","brimerchant","bidik","produsen","produksi","akum","makmur",
    "melanjutkan","penting","aamiin","listing","setara","mencari","divisi","mobil","manfaatin","devidennya",
    "dapetin","dapat","penjualan","adaro","bobot","rekening","value","update","hadirkan","membangun",
    "nasional","menguasai","merchant","rekomendasinya","berencana","lembaga","flash","festival","menegaskan","transportasi",
    "pelaksanaan","lengkapi","produktif","commerce","likuid","bina","memperoleh","manfaatkan","nabung","perluas",
    "keuangannya","highlight","dijamin","jasa","diperdagangkan","berbasis","fintek","alternatif","mengakses","riset",
    "fibonacci","ideal","energy","rapor","trafik","advice","menunjuk","bisnisnya","bertambah","oke",
    "bangsa","jalur","strategis","inovasi","pengembangan","ekspansi","stabil","prospek","unggulan","efisiensi",
    "optimal","berkembang","terpercaya","potensi","penguatan","pertumbuhan","peluang","kemitraan","investasi","solusi",
    "terintegrasi","modern","kemajuan","unggul","transformasi","digital","adaptif","kolaborasi","berdaya","berhasil",
    "valuation","ajukan","pembangunan","ceria","inklusi","prinsip","persero","gaji","energi","analisis",
    "power","daya","strateginya","voucher","eps","pusat","acara","mayora","kontrak","setor",
    "raup","bisnis","international","evaluasi","direktur","andalan","transaksi","saldo","perbankan","triliun",
    "modal","data","inklusif","iphone","share","mindset","apply","meraih","penempatan","menyediakan",
    "emisi","tiket","source","tutorial","rumus","forbes","terbarukan","linkaja","screener","recording",
    "menyajikan","kompetitor","distribution","mitra","shopping","infrastruktur","terbit","terjangkau","profitable","pertanian",
    "mengejutkan","lifestyle","memenuhi","terpilih","tagihan","pengawasan","keberlanjutan","terdongkrak","dibagikan","activity",
    "production","pertimbangkan","mencerminkan","bisnisnya","prospek","pertumbuhan","investasi","ekspansi","penguatan","stabil",
    "unggulan","inovasi","digitalisasi","pengembangan","kolaborasi","adaptasi","transformasi","berkembang","efisiensi","produktivitas",
    "kemajuan","berpotensi","berhasil","optimal","solutif","terintegrasi","modern","kompetitif","bernilai","strategis",
    "aktivitas","kelebihan","accum","kawasan","singapura","moving","membahas","disalurkan","dipegang","kalbe",
    "lead","persetujuan","gebrakan","swasembada","forecast","running","deposit","pembalikan","financials","menjalin",
    "kenali","serbu","papan","moodys","trik","medis","groceries","perlahan","cross","beragam",
    "pemberdayaan","melimpah","konsumer","penyelamat","warisan","minimum","sales","bergizi","mapan","melantai",
    "developer","standar","impairment","solar","daftar","bayar","angka","mulai","ramalan","kesehatan",
    "tunjukkan","kerja","kinerja","idx","bersama","besar","aksi","level","opsi","ide",
    "luas","beruntung","bloomberg","kejar","sepakat","bris","punya","arah","langkah","msci",
    "minyak","pln","agenda","mencatatkan","stockbit","mengelola","emiten","fundamentalnya","dividennya","kuartal",
    "trading","analysis","money","berita","sektor","dana","consumer","gabung","payment","rups",
    "tingkat","menanti","financial","platform","omset","halal","google","pelaku","yieldnya","kepemilikan",
    "asii","masyarakat","pasar","bei","pengalaman","usahanya","periode","rencana","nilai","bangun",
    "operasional","sunarso","gajian","sumber","likuiditas","obat","pemimpin","rebalancing","eksklusif","dayamitra",
    "emitennya","smartfren","breaking","ungkap","pengusaha","pendidikan","tenaga","pencadangan","dibayar","efek",
    "menentukan","kupon","bbni","indf","mandiri","menjadi","usd","segera","teknikal","laporan",
    "icbp","exdate","real","pembukaan","asia","bantu","limit","sorotan","enrg","ambil",
    "menteri","peduli","bursa","hrum","ssia","ptba","sistem","konglomerat","asumsi","dibahas",
    "closing","korporasi","reguler","bunga","indihome","bbtn","ipo","inco","keuangan","valuasi",
    "sahamnya","price","perdagangan","telkomsel","kualitas","sosial","dihitung","float","berdiri","management",
    "bid","pemodal","perubahan","jaringan","cocok","trailing","pertambangan","edukasi","mtdl","satelit",
    "public","institusi","sahamku","berlangsung","menilai","perhatian","tech","ilmu","melewati","divergence",
    "farmasi","mendekati","bca","continuation","pangkas","memprediksi","bersaing","sinyal","transfer","profil",
    "traders","buktikan","flow","menetapkan","berdampak","tlkm","analisa","nasabah","negara","membentuk",
    "thread","macd","terlihat","penyaluran","ikuti","crypto","efisien","regional","industri","aset",
    "investasinya","fundamental","inflasi","posisi","sinarmas","menariknya","jalin","menyelenggarakan","prospek","pertumbuhan",
    "luck","komoditas","diskusi","kompak","melandai","arus","kesimpulan","berburu","service","overall",
    "earnings","berperan","catatan","fmcg","bonds","arahan","dewan","ulas","tujuan","btn",
    "penetapan","headline","opening","stonks","vaksin","bandarmology","resources","didominasi","dnet","mengalami",
    "berjalan","pbv","terkait","plan","selamat","join","geopolitik","gelar","kelola","channel",
    "deal","entitas","valuasinya","belajar","grafik","liquid","farma","pengaruh","pergerakan","finance",
    "order","pembiayaan","konsumen","perbandingan","trade","cash","stochastic","emtk","weekly","mencoba",
    "pola","ammn","investment","operator","revenue","asset","kebijakan","tkim","zona","news",
    "capital","himbara","eksekusi","penerimaan","profesional","dipublikasikan","economic","interest","disiplin","result",
    "luncurkan","road","street","aktif","pengelolaan","setoran","mendapat","komoditi","prospek","pertumbuhan",
    "investasi","pengembangan","strategi","analisis","fundamental","teknikal","dividen","emiten","trading","likuiditas",
    "liquidity","loan","keputusan","dirilis","catat","kombinasi","teknologi","risk","product","diinvestasikan",
    "marketing","nasdaq","dipengaruhi","nvda","frekuensi","roe","administrasi","keamanan","metode","deadline",
    "banking","pabrik","direksi","lokal","candle","indeks","dyor","mengakuisisi","ekonomi","persen",
    "manajemen","fasilitas","corona","core","sentimen","internet","growth","nominal","publik","otomotif",
    "pemain","aturan","axiata","siklus","cpo","kapitalisasi","segmen","sector","leader","open",
    "mayoritas","average","komprehensif","legal","akurat","individu","divestasi","holdings","agreement","transisi",
    "meluncur","mengangkat","sektoral","keseluruhan","expect","teknikalnya","kesepakatan","berisiko","komisaris","antisipasi",
    "depresiasi","broadband","leverage","event","internal","koperasi","supply","mengalir","menyentuh","dipangkas",
    "histogram","klien","rangkum","istilah","finally","dampak","tarif","trader","prospek","fundamental",
    "analisis","investasi","trading","likuiditas","pengembangan","pertumbuhan","strategi","emiten","keuangan","dividen",
    "current","viral","mengumumkan","hasilnya","bni","rupiah","jabatan","posting","issi","project",
    "coin","bigbank","tercapai","gojek","asetnya","waspada","dinilai","tax","diumumkan","fibo",
    "menemukan","switch","retest","trilyun","berusaha","digit","gerakan","convergence","salut","mempertimbangkan",
    "afiliasi","utama","estimasi","invest","rti","studi","situasi","kripto","equity","dipicu",
    "ngacir","bumn","central","banks","tantangan","artikel","etf","window","kondisi","miliar",
    "bitcoin","company","reksa","labanya","china","asing","mikro","auto","gerak","pemerintah",
    "sejarah","perolehan","fair","dinamis","dibutuhkan","lonjakan","bergejolak","margin","quality","tower",
    "call","perbaikan","diatribusikan","polanya","disusul","eth","emerging","riil","trending","tersenyum",
    "scalping","valid","negosiasi","spekulasi","membawa","fundamental","analisis","investasi","keuangan","trading",
    "prospek","pertumbuhan","likuiditas","strategi","pengembangan","teknikal","kapitalisasi","dividen","emiten","ekspansi", "spekulasi",
    "wajarnya","terutama","game","impor","kuatnya","umumkan","lapkeu","normal",
    "memegang","dianggap","volatilitas","broker","dolar","aliran","ahli","nyaman","dibandingkan","lolos",
    "summary","dialihkan","melepas","capaian","prospeknya","menjual","pandemi","tekanan","distribusi","rupslb",
    "properti","prediksi","avg","swasta","fund","taiwan","fundamental","analisis","investasi","keuangan",
    "trading","prospek","pertumbuhan","likuiditas","strategi","pengembangan","teknikal","kapitalisasi","dividen","emiten",
    "ekspansi","pasar","ekonomi","asset","manajemen","institusi","perbankan","saham","holding","kapital",
    "sentimen","valuasi","transaksi","indeks","perdagangan","korporasi","bisnis","perusahaan","teknologi","digital",
    "stabil","penguatan","peningkatan","optimal","produktif","efisien","berkembang","modern","terintegrasi","kompetitif",
    "unggulan","pengaruh","revenue","growth","market","sektor","consumer","global","nasdaq","equity",
    "kapasitas","pengelolaan","peluang","komoditas","infrastruktur","operator","listing","institusional","ekuitas","profitabilitas",
])

negative_lexicon = set([
    "abang","amblas","ambles","ambrol","ambruk","ampas","amsyong","ancur","anjlok","arb","auto reject bawah",
    "bad","bandar","bangkrut","bapuk","bearish","beban","berat","berdarah","bermasalah","bleeding",
    "boncos","breakdown","brutal","buang","bubar","buruk","cabut","capek","chaos",
    "crash","cut","cut loss","dead","dibanting","dihajar","dihentikan sementara","dijual","dilego","dilepas",
    "dilusi","dilusi saham","disedot","distribusi","distribusi jual","ditarik","ditekan","ditinggal","divestasi","down",
    "down bad","downgrade","downgrade rekomendasi","downtrend","drastis","drop","dump","exit","fear","flat",
    "floating","gagal","gejolak pasar","gws","gelembung pecah","gorengan","goyang","halt","hancur","harga longsor","hilang",
    "hutang","imbas","indikator jelek",
    "inflasi tinggi","issue","isu","jangan","jatoh","jatuh","jeblok","jebol","jelek","jual",
    "jual rugi","kabur","kacau","kalah","kasus","kebangkrutan","kecurangan akuntansi","kehilangan","kemahalan","kempes",
    "kena","kerugian","khawatir","kinerja buruk","koreksi","korupsi","krisis","kujual","kurang",
    "lagging","lambat","laporan keuangan jelek",
    "lelet","lemah","lemot","lepas","lesu","likuiditas rendah","longsor","loser","lower","loyo",
    "macet","mahal","mandek","masalah","mati","melemah","melorot","menekan","mentok","menurun",
    "merah","merosot","merugi","minim","minus","miskin","mundur","nahan","nasib","ndlosor",
    "negatif","net sell","netsell","ngeri","nggak","nggak jelas","nggak kuat","nggak sanggup",
    "nyangkut","nyesek","nyesel","nyungsep","outflow","overbought","panic","panic sell","panik","parah",
    "pasrah","patah","pecah","pelemahan","pembatalan dividen","pengurangan","penipuan","penjualan insider","penundaan","penundaan proyek",
    "penurunan","penurunan permintaan","pesimis",
    "profit warning","pusing","puyeng","rasio overvalue","red","reject","resisten gagal","rontok","rugi","rugi operasional",
    "rungkad","saham gorengan","saham jelek","saham sampah","sampah","sangkut","sanksi regulasi","sebel","sedih",
    "sell","selling","sentimen buruk","serem","sial","sinyal jual","skip",
    "spam","stagnan","stress","stuck","suku bunga naik","sulit","surem","susah","suspensi","target harga turun",
    "terancam","terdampak","terdepak","tergerus","terjun","terkoreksi","terpaksa","terpengaruh","terpuruk","tertekan",
    "top losers","trading halt","trauma",
    "turun","turunnya","turunnya laba","utang","utang menumpuk","volatilitas","volume turun","zonk",
    
    # kamus tambahan skenario 2 negatif
    "unrealized","tenggelam","downtrendnya","gabisa","digoreng","melemahnya","tersangka","nyaris","shock","terkena",
    "emosi","drawdown","kebakaran","rusia","skema","darah","penyebab","berkurang","kasian","tolol",
    "kejaksaan","rejection","ditunda","masalahnya","ukraina","dugaan","sialan","gangguan","terbongkar","kpk",
    "mental","buzzer","pinjol","terseok","kapok","ambyar","terendahnya","busuk","menangis","downtren",
    "rusak","tergelincir","gelap","tekan","losers","serangan","korban","judol","disebabkan","minusnya",
    "akibat","gila","bandarnya","nyangkuters","melemah","cutloss","panic","bearish","dump","scam",
    "bangkrut","collapse","fraud","manipulasi","kerugian","penurunan","pelemahan","volatile","volatilitas","ancaman",
    "resiko","tertekan","koreksi","jeblok","nyangkut","loss","minus","minusnya","turun","anjlok","crash",
    "bodoh","goblok","anjing","kontol","tai","kampret","monyet","bangke","maki","babi",
    "gila","bandarmologi","minoritas","berhenti","ritel","penjual","merangkak","israel","cost","kenyataan",
    "dibuang","phk","npl","kenapa","gara","porto","padahal","nangis","malu","indikasi",
    "malah","mengurangi","batubara","ketat","batal","fiktif","dihold","menghadapi","kekhawatiran","dendam",
    "disorot","ekspektasi","kurs","credit","fenomena","ribut","deras","pembeli","boom","feeling",
    "loss","minus","turun","anjlok","crash","cutloss","panic","bearish","dump","scam",
    "bangkrut","collapse","fraud","manipulasi","kerugian","penurunan","pelemahan","volatile","volatilitas","ancaman",
    "resiko","tertekan","koreksi","jeblok","nyangkut","melemah","tergelincir","gangguan","korban","judol",
    "busuk","rusak","ambyar","terseok","rejection","drawdown","downtrend","downtren","kapok","kasian",
    "tolol","bodoh","goblok","anjing","kontol","tai","kampret","monyet","bangke","maki",
    "laggard","meledak","fake","minor","hindari","bolak","malas","pompom","gamau","merahnya",
    "mendadak","terlalu","retail","error","politik","sakit","gapunya","kontra","trap","pelemahan",
    "loss","minus","turun","anjlok","crash","cutloss","panic","bearish","dump","scam",
    "bangkrut","collapse","fraud","manipulasi","kerugian","penurunan","volatile","volatilitas","ancaman","resiko",
    "tertekan","koreksi","jeblok","nyangkut","melemah","tergelincir","gangguan","korban","judol","busuk",
    "rusak","ambyar","terseok","rejection","drawdown","downtrend","downtren","kapok","kasian","tolol",
    "bodoh","goblok","anjing","kontol","tai","kampret","monyet","bangke","maki","dendam",
    "kekhawatiran","batal","fiktif","dibuang","phk","npl","gara","nangis","malu","indikasi",
    "mengurangi","ketat","disorot","ekspektasi","kurs","fenomena","ribut","gainer","supportnya",
    "concern","menurunkan","bongkar","melambat","resesi","banting","blokir","banjir","reversal","manuver",
    "putus","sayangnya","judi","prediksi","tekanan","pandemi","menjual","diguyur","bahaya","ancaman",
    "dolar","tumbal","melepas","dialihkan","telat","loss","minus","turun","anjlok","crash",
    "cutloss","panic","bearish","dump","scam","bangkrut","collapse","fraud","manipulasi","kerugian",
    "penurunan","pelemahan","volatile","volatilitas","resiko","tertekan","koreksi","jeblok","nyangkut","melemah",
    "tergelincir","gangguan","korban","busuk","rusak","ambyar","terseok","rejection","drawdown","downtrend",
    "downtren","kapok","kasian","tolol","bodoh","goblok","anjing","kontol","tai","kampret",
    "monyet","bangke","maki","dendam","kekhawatiran","batal","fiktif","dibuang","phk","npl",
    "gara","nangis","malu","indikasi","mengurangi","ketat","disorot","ekspektasi","kurs","fenomena",
    "males","revisi","drama","bergejolak","dibully","tantangan","dipicu","ditahan","situasi",
    "kuatir","repot","waspada","diganti","kecuali","kaget","dampak","diblokir","wabah","kosong",
    "dipangkas","leverage","loss","minus","turun","anjlok","crash","cutloss","panic","bearish",
    "dump","scam","bangkrut","collapse","fraud","manipulasi","kerugian","penurunan","pelemahan","volatile",
    "volatilitas","resiko","tertekan","koreksi","jeblok","nyangkut","melemah","tergelincir","gangguan","korban",
    "busuk","rusak","ambyar","terseok","rejection","drawdown","downtrend","downtren","kapok","kasian",
    "tolol","bodoh","goblok","anjing","kontol","tai","kampret","monyet","bangke","maki",
    "dendam","kekhawatiran","batal","fiktif","dibuang","phk","npl","gara","nangis","malu",
    "indikasi","mengurangi","ketat","disorot","ekspektasi","kurs","fenomena","ancaman","tekanan","pandemi"
    "awas","ngutang","depresiasi","antisipasi","menyebabkan","menentu","kesalahan","berisiko","kekurangan","perang",
    "aneh","tertahan","menahan","volatil","loss","minus","turun","anjlok","crash","cutloss",
    "panic","bearish","dump","scam","bangkrut","collapse","fraud","manipulasi","kerugian","penurunan",
    "pelemahan","volatile","volatilitas","resiko","tertekan","koreksi","jeblok","nyangkut","melemah","tergelincir",
    "gangguan","korban","busuk","rusak","ambyar","terseok","rejection","drawdown","downtrend","downtren",
    "kapok","kasian","tolol","bodoh","goblok","anjing","kontol","tai","kampret","monyet",
    "bangke","maki","dendam","kekhawatiran","batal","fiktif","dibuang","phk","npl","gara",
    "nangis","malu","indikasi","mengurangi","ketat","disorot","ekspektasi","kurs","fenomena","ancaman",
    "tekanan","pandemi","menjual","bahaya","melepas","terendah","hiks","dibully","bear","downside" ,
    "boikot","badai","corona","tajam","cutloss","takut","volatile","oversold","menyesal",
    "risk","keputusan","loan","reaksi","kebanting","bego","picu","loss","minus","turun",
    "anjlok","crash","panic","bearish","dump","scam","bangkrut","collapse","fraud","manipulasi",
    "kerugian","penurunan","pelemahan","volatilitas","resiko","tertekan","koreksi","jeblok","nyangkut","melemah",
    "tergelincir","gangguan","korban","busuk","rusak","ambyar","terseok","rejection","drawdown","downtrend",
    "downtren","kapok","kasian","tolol","bodoh","goblok","anjing","kontol","tai","kampret",
    "monyet","bangke","maki","dendam","kekhawatiran","batal","fiktif","dibuang","phk","npl",
    "gara","nangis","malu","indikasi","mengurangi","ketat","disorot","ekspektasi","kurs","fenomena",
    "ancaman","tekanan","pandemi","menjual","bahaya","melepas","terendah","hiks","dibully","fomo",
    "bingung","loss","ngamuk","rentan","utank","inflasi","under","bandarmology","resist","crash",
    "cutloss","panic","bearish","dump","scam","bangkrut","collapse","fraud","manipulasi","kerugian",
    "penurunan","pelemahan","volatile","volatilitas","resiko","tertekan","koreksi","jeblok","nyangkut","melemah",
    "tergelincir","gangguan","korban","busuk","rusak","ambyar","terseok","rejection","drawdown","downtrend",
    "downtren","kapok","kasian","tolol","bodoh","goblok","anjing","kontol","tai","kampret",
    "monyet","bangke","maki","dendam","kekhawatiran","batal","fiktif","dibuang","phk","npl",
    "gara","nangis","malu","indikasi","mengurangi","ketat","disorot","ekspektasi","kurs","fenomena",
    "ancaman","tekanan","pandemi","menjual","bahaya","melepas","terendah","hiks","dibully","fomo",
    "oversold","risk","geopolitik","melandai","inflasi","crypto","bear","downside","likuidasi","ketidakpastian",
    "pangkas","gejolak","loss","crash","cutloss","panic","bearish","dump","scam","bangkrut",
    "collapse","fraud","manipulasi","kerugian","penurunan","pelemahan","volatile","volatilitas","resiko","tertekan",
    "koreksi","jeblok","nyangkut","melemah","tergelincir","gangguan","korban","busuk","rusak","ambyar",
    "terseok","rejection","drawdown","downtrend","downtren","kapok","kasian","tolol","bodoh","goblok",
    "anjing","kontol","tai","kampret","monyet","bangke","maki","dendam","kekhawatiran","batal",
    "fiktif","dibuang","phk","npl","gara","nangis","malu","indikasi","mengurangi","ketat",
    "disorot","ekspektasi","kurs","fenomena","ancaman","tekanan","pandemi","menjual","bahaya","melepas",
    "terendah","hiks","dibully","fomo","oversold","risk","bear","downside","likuidasi","ketidakpastian",
    "rada","caplok","defensif","asumsi","konglomerat","ditunggu","sorotan","volatilemarket","panicbuy","selloff",
    "sideways","darurat","greedy","galau","ketidakpastian","rebound","perlawanan","recovery","bull","loss",
    "crash","cutloss","panic","bearish","dump","scam","bangkrut","collapse","fraud","manipulasi",
    "kerugian","penurunan","pelemahan","volatile","volatilitas","resiko","tertekan","koreksi","jeblok","nyangkut",
    "melemah","tergelincir","gangguan","korban","busuk","rusak","ambyar","terseok","rejection","drawdown",
    "downtrend","downtren","kapok","kasian","tolol","bodoh","goblok","anjing","kontol","tai",
    "kampret","monyet","bangke","maki","dendam","kekhawatiran","batal","fiktif","dibuang","phk",
    "npl","gara","nangis","malu","indikasi","mengurangi","ketat","disorot","ekspektasi","kurs",
    "fenomena","ancaman","tekanan","pandemi","menjual","bahaya","melepas","terendah","hiks","dibully",
    "fomo","oversold","risk","bear","downside","likuidasi","panicbuy","selloff","volatilmarket","tertekan",
    "resiko","stop","bullish","ragu","rawan","goreng","impairment","berlebihan","loss","crash",
    "cutloss","panic","bearish","dump","scam","bangkrut","collapse","fraud","manipulasi","kerugian",
    "penurunan","pelemahan","volatile","volatilitas","tertekan","koreksi","jeblok","nyangkut","melemah","tergelincir",
    "gangguan","korban","busuk","rusak","ambyar","terseok","rejection","drawdown","downtrend","downtren",
    "kapok","kasian","tolol","bodoh","goblok","anjing","kontol","tai","kampret","monyet",
    "bangke","maki","dendam","kekhawatiran","batal","fiktif","dibuang","phk","npl","gara",
    "nangis","malu","indikasi","mengurangi","ketat","disorot","ekspektasi","kurs","fenomena","ancaman",
    "tekanan","pandemi","menjual","bahaya","melepas","terendah","hiks","dibully","fomo","oversold",
    "risk","bear","downside","likuidasi","selloff","panicbuy","marketcrash","terpuruk","anjloknya","drop",
    "ganas","reshuffle","antre","pembalikan","loss","crash","cutloss","panic","bearish","dump",
    "scam","bangkrut","collapse","fraud","manipulasi","kerugian","penurunan","pelemahan","volatile","volatilitas",
    "resiko","tertekan","koreksi","jeblok","nyangkut","melemah","tergelincir","gangguan","korban","busuk",
    "rusak","ambyar","terseok","rejection","drawdown","downtrend","downtren","kapok","kasian","tolol",
    "bodoh","goblok","anjing","kontol","tai","kampret","monyet","bangke","maki","dendam",
    "kekhawatiran","batal","fiktif","dibuang","phk","npl","gara","nangis","malu","indikasi",
    "mengurangi","ketat","disorot","ekspektasi","kurs","fenomena","ancaman","tekanan","pandemi","menjual",
    "bahaya","melepas","terendah","hiks","dibully","fomo","oversold","risk","bear","downside",
    "likuidasi","selloff","panicbuy","marketcrash","drop","terpuruk","anjlok","kejatuhan","terlilit","bangkrutnya",
])

# ══════════════════════════════════════════════════════════════
#  HELPER: SPLIT PHRASE vs SINGLE
# ══════════════════════════════════════════════════════════════
def split_lexicon(lexicon):
    single, phrases = set(), set()
    for w in lexicon:
        (phrases if " " in w else single).add(w)
    return single, phrases

pos_single, pos_phrases = split_lexicon(positive_lexicon)
neg_single, neg_phrases = split_lexicon(negative_lexicon)

NEGATIONS    = {"tidak", "ga", "gak", "nggak"}
INTENSIFIERS = {"banget", "parah", "bgt"}

# ══════════════════════════════════════════════════════════════
#  TEXT PROCESSING
# ══════════════════════════════════════════════════════════════
def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"@\w+|#\w+", " ", text)
    text = re.sub(r"\d+", " ", text)
    text = re.sub(r"[^\w\s.%]", " ", text)
    text = re.sub(r'(.)\1{2,}', r'\1\1', text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def normalize_text(text: str) -> list:
    return [kamus_dict.get(w, w) for w in text.split()]

# ══════════════════════════════════════════════════════════════
#  SCORING: hanya untuk baris NETRAL
#  Aturan Skenario 2 — tanpa kelas netral:
#    pos > neg  → positif
#    neg >= pos → negatif
#    0, 0       → negatif (default konservatif)
# ══════════════════════════════════════════════════════════════
def relabel_netral(text: str) -> str:
    clean  = clean_text(text)
    tokens = normalize_text(clean)
    joined = " ".join(tokens)

    pos_score = 0
    neg_score = 0

    for i, word in enumerate(tokens):
        negated = (i > 0 and tokens[i - 1] in NEGATIONS)
        if word in pos_single:
            neg_score += 1 if negated else 0
            pos_score += 0 if negated else 1
        elif word in neg_single:
            pos_score += 1 if negated else 0
            neg_score += 0 if negated else 1

    for phrase in pos_phrases:
        if phrase in joined:
            pos_score += 2
    for phrase in neg_phrases:
        if phrase in joined:
            neg_score += 2

    if any(w in tokens for w in INTENSIFIERS):
        pos_score *= 1.3
        neg_score *= 1.3

    # Tidak ada netral: pos > neg → positif, sisanya → negatif
    return "positif" if pos_score > neg_score else "negatif"

# ══════════════════════════════════════════════════════════════
#  PROSES PER FILE
# ══════════════════════════════════════════════════════════════
def process_file(filename: str):
    path = INPUT_DIR / filename
    if not path.exists():
        print(f"⚠️  File tidak ditemukan, skip: {filename}")
        return

    df = pd.read_csv(path, dtype=str).fillna("")
    total = len(df)

    # Pastikan kolom sentiment ada
    if "sentiment" not in df.columns:
        print(f"⚠️  Kolom 'sentiment' tidak ditemukan di {filename}, skip.")
        return

    # Normalisasi nilai (lowercase, strip spasi)
    df["sentiment"] = df["sentiment"].str.strip().str.lower()

    # Identifikasi baris netral
    mask_netral = df["sentiment"] == "netral"
    n_netral    = mask_netral.sum()
    n_tetap     = total - n_netral

    print(f"\n📂 {filename}")
    print(f"   Total baris : {total:,}")
    print(f"   Tetap (pos/neg) : {n_tetap:,}")
    print(f"   Netral (akan direlabel) : {n_netral:,}")

    if n_netral == 0:
        print("   ℹ️  Tidak ada baris netral, file disalin langsung.")
        df.to_csv(OUTPUT_DIR / filename, index=False, encoding="utf-8-sig")
        return

    # Relabel hanya baris netral
    tqdm.pandas(desc="   🔄 Relabelling netral")
    df.loc[mask_netral, "sentiment"] = (
        df.loc[mask_netral, "tweet"]
        .progress_apply(relabel_netral)
    )

    # Verifikasi: tidak boleh ada 'netral' tersisa
    sisa_netral = (df["sentiment"] == "netral").sum()
    assert sisa_netral == 0, f"Masih ada {sisa_netral} baris netral!"

    # Distribusi hasil
    dist = df["sentiment"].value_counts()
    print("   Distribusi setelah relabelling:")
    for label, count in dist.items():
        pct = count / total * 100
        bar = "█" * int(pct / 3)
        print(f"     {label:<12} {count:>6,} ({pct:5.1f}%)  {bar}")

    # Simpan
    out_path = OUTPUT_DIR / filename
    df.to_csv(out_path, index=False, encoding="utf-8-sig")
    print(f"   ✅ Disimpan: {out_path}")


# ══════════════════════════════════════════════════════════════
#  GABUNGKAN SEMUA PERIODE MENJADI ALL_PERIODS
# ══════════════════════════════════════════════════════════════
def create_all_periods():
    print("\n📦 Menggabungkan seluruh periode...")

    all_data = []

    for filename in FILES:
        file_path = OUTPUT_DIR / filename

        if not file_path.exists():
            print(f"⚠️  File tidak ditemukan: {file_path}")
            continue

        df = pd.read_csv(file_path)

        # Tambahkan informasi periode
        if "before_covid" in filename:
            df["period"] = "before_covid"

        elif "after_covid" in filename:
            df["period"] = "after_covid"

        elif "covid" in filename:
            df["period"] = "covid"

        all_data.append(df)

    if len(all_data) == 0:
        print("❌ Tidak ada file yang dapat digabung.")
        return

    df_all = pd.concat(all_data, ignore_index=True)

    output_file = OUTPUT_DIR / "tweets_all_periods_labellingLexicon.csv"
    df_all.to_csv(output_file, index=False, encoding="utf-8-sig")

    print("\n📊 DISTRIBUSI ALL_PERIODS")
    print("-" * 50)

    sentiment_dist = df_all["sentiment"].value_counts()

    for label, count in sentiment_dist.items():
        pct = count / len(df_all) * 100
        bar = "█" * int(pct / 3)
        print(f"{label:<12} {count:>8,} ({pct:5.1f}%) {bar}")

    print("-" * 50)
    print(f"Total Data : {len(df_all):,}")

    print("\n📊 DISTRIBUSI PER PERIODE")
    print("-" * 50)

    for period in ["before_covid", "covid", "after_covid"]:
        n = (df_all["period"] == period).sum()
        print(f"{period:<15} {n:>8,}")

    print("-" * 50)

    print(f"\n✅ File gabungan disimpan:")
    print(f"   {output_file}")

# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("=" * 60)
    print("  RELABELLING NETRAL → POSITIF/NEGATIF (Skenario 2)")
    print("=" * 60)
    print(f"  Input  : {INPUT_DIR}")
    print(f"  Output : {OUTPUT_DIR}")
    print("  Aturan : pos > neg → positif | neg >= pos → negatif")
    print("           tanpa sinyal (0,0) → negatif (default)")
    print("=" * 60)

    for f in FILES:
        process_file(f)

    create_all_periods()

    print("\n" + "=" * 60)
    print("  ✅ SELESAI — semua file tersimpan di 2_labelling_S2/")
    print("=" * 60)