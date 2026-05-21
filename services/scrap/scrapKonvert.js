const fs = require("fs");
const path = require("path");

// ================= PATH =================

// Input: folder database/merge relatif dari lokasi script ini
// Jika script ada di root project, path ini langsung menuju database/merge/
const inputDir  = path.join(__dirname, "database", "merge");

// Output: folder data di root project (sama seperti sebelumnya)
const outputDir = path.join(__dirname, "data_filter");

// Pastikan folder output ada
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// ================= DAFTAR FILE =================
// ✅ Diubah: sesuai 3 file hasil merge periode covid
const files = [
    { label: "before_covid", file: "tweets_before_covid.json" },
    { label: "covid",        file: "tweets_covid.json"        },
    { label: "after_covid",  file: "tweets_after_covid.json"  },
    // { label: "after_covid_baru", file: "tweets_after_covid_baru.json"  }
];

// ================= HELPER =================
function cleanText(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        // NBSP → spasi normal
        .replace(/\u00A0/g, " ")

        // newline → spasi
        .replace(/[\r\n]+/g, " ")

        // hapus tanda kutip
        .replace(/["']/g, "")

        // hapus karakter …
        .replace(/[…]/g, "")

        // 🔥 FIX 1: hapus spasi setelah protocol (http:// , https:// , ftp://)
        .replace(/(\w+:\/\/)\s+/g, "$1")

        // 🔥 FIX 2: gabungkan URL yang kepotong (termasuk yang ada spasi di tengah kata)
        .replace(/((?:\w+:\/\/|www\.)[^\s]+(?:\s+[^\s]+)*)/gi, (url) => {
            return url.replace(/\s+/g, "");
        })

        // rapikan spasi global
        .replace(/\s+/g, " ")
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

console.log("📂 Input dir :", inputDir);
console.log("📂 Output dir:", outputDir);
console.log("─".repeat(55));

files.forEach(({ label, file }) => {
    const inputFile  = path.join(inputDir, file);
    const outputFile = path.join(outputDir, `tweets_${label}.csv`); // ✅ nama CSV ikut label

    if (!fs.existsSync(inputFile)) {
        console.warn(`⚠️  File tidak ditemukan, skip: ${file}`);
        return;
    }

    try {
        const jsonData = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

        // Simpan CSV per periode
        const csv = jsonToCSV(jsonData);
        fs.writeFileSync(outputFile, csv, "utf-8");

        const sizeKB = (fs.statSync(outputFile).size / 1024).toFixed(1);
        console.log(`✅ [${label.padEnd(12)}] ${jsonData.length.toLocaleString().padStart(7)} baris → tweets_${label}.csv (${sizeKB} KB)`);

        // Gabungkan ke dataset besar
        allData = allData.concat(jsonData);

    } catch (err) {
        console.error(`❌ Gagal proses ${file}:`, err.message);
    }
});

// ================= SAVE MERGED DATASET =================
console.log("─".repeat(55));

if (allData.length > 0) {
    // Urutkan gabungan semua periode berdasarkan tanggal (ascending)
    allData.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
    });

    const mergedCSV  = jsonToCSV(allData);
    const mergedFile = path.join(outputDir, "tweets_all_periods.csv");
    fs.writeFileSync(mergedFile, mergedCSV, "utf-8");

    const sizeKB = (fs.statSync(mergedFile).size / 1024).toFixed(1);
    console.log(`🔥 Gabungan semua periode → tweets_all_periods.csv`);
    console.log(`   Total : ${allData.length.toLocaleString()} baris | Ukuran : ${sizeKB} KB`);
} else {
    console.warn("⚠️  Tidak ada data untuk digabungkan. Periksa isi folder database/merge/");
}