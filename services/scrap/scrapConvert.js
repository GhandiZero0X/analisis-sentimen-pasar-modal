const fs = require("fs");
const path = require("path");

// ================= PATH =================
const inputDir = __dirname; // services/scrap
const outputDir = path.join(__dirname, "..", "..", "data");

// pastikan folder data ada
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// daftar file saham
const files = [
    { saham: "bbri", file: "tweets_bbri.json" },
    { saham: "icbp", file: "tweets_icbp.json" },
    { saham: "tlkm", file: "tweets_tlkm.json" },
];

// ================= HELPER =================
function cleanText(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/\u00A0/g, " ")        // NBSP → spasi
        .replace(/\r?\n|\r/g, " ")      // 🔥 hapus newline
        .replace(/\s+/g, " ")           // rapikan spasi
        .trim();
}

function escapeCSV(value) {
    if (value === null || value === undefined) return "";
    const cleaned = String(value).replace(/"/g, '""');
    return `"${cleaned}"`;
}

function jsonToCSV(data) {
    let csv = "date,tweet,sentiment,saham\n";
    data.forEach(item => {
        csv += [
            escapeCSV(cleanText(item.date)),
            escapeCSV(cleanText(item.tweet)),
            escapeCSV(cleanText(item.sentiment)),
            escapeCSV(cleanText(item.saham))
        ].join(",") + "\n";
    });
    return csv;
}

// ================= MAIN =================
let allData = [];

files.forEach(({ saham, file }) => {
    const inputFile = path.join(inputDir, file);
    const outputFile = path.join(outputDir, `tweets_${saham}.csv`);

    if (!fs.existsSync(inputFile)) {
        console.warn(`⚠️ File tidak ditemukan, skip: ${file}`);
        return;
    }

    try {
        const jsonData = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

        // simpan per saham
        const csv = jsonToCSV(jsonData);
        fs.writeFileSync(outputFile, csv, "utf-8");
        console.log(`✅ CSV ${saham} berhasil dibuat → ${outputFile}`);

        // gabungkan ke dataset besar
        allData = allData.concat(jsonData);

    } catch (err) {
        console.error(`❌ Gagal proses ${file}:`, err.message);
    }
});

// ================= SAVE MERGED DATASET =================
if (allData.length > 0) {
    const mergedCSV = jsonToCSV(allData);
    const mergedFile = path.join(outputDir, "tweets_sahamAll.csv");
    fs.writeFileSync(mergedFile, mergedCSV, "utf-8");
    console.log("🔥 Dataset gabungan berhasil dibuat →", mergedFile);
} else {
    console.warn("⚠️ Tidak ada data untuk digabungkan");
}
