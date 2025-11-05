const fs = require("fs");
const path = require("path");

const files = [
    "tweets_bbri_2019.json",
    "tweets_bbri_2020.json",
    "tweets_bbri_2021.json",
    "tweets_bbri_2022.json",
    "tweets_bbri_2023.json",
    "tweets_bbri_2024.json",
    // "tweets_bbri_2025.json",
];

const allTweets = [];
const stats = [];

console.log("Mengecek panjang tiap file JSON per tahun sebelum merge...\n");

files.forEach((file) => {
    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File ${file} tidak ditemukan, dilewati`);
        stats.push({ file, year: extractYear(file), count: 0, ok: false });
        return;
    }

    try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(raw);

        let count;
        if (Array.isArray(data)) {
            count = data.length;
            allTweets.push(...data);
        } else if (data && typeof data === "object") {
            count = Object.keys(data).length;
            allTweets.push(data);
        } else {
            count = 0;
        }

        stats.push({ file, year: extractYear(file), count, ok: true });
        console.log(`✅ ${file} (${extractYear(file)}) → ${count} tweet(s)`);
    } catch (err) {
        console.error(`❌ Gagal membaca/mengurai ${file}: ${err.message}`);
        stats.push({ file, year: extractYear(file), count: 0, ok: false });
    }
});

const totalFromStats = stats.reduce((s, it) => s + (it.count || 0), 0);
console.log("\nRingkasan sebelum merge:");
stats.forEach((s) => {
    const status = s.ok ? "OK" : "DILEWATI";
    console.log(`  - ${s.file} [${s.year}]: ${s.count} (${status})`);
});
console.log(`\nTotal menurut pengecekan per-file: ${totalFromStats}`);
console.log(`Total gabungan array allTweets.length: ${allTweets.length}`);

// 🧠 SORTING TWEET BERDASARKAN TANGGAL
console.log("\nMengurutkan tweet berdasarkan tanggal (2019 → 2025)...");

const parseDate = (dateStr) => {
    if (!dateStr) return null;
    // Jika tanggal berupa "YYYY-MM-DD" → aman langsung
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
};

// Urutkan berdasarkan tanggal ascending
allTweets.sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA - dateB;
});

// 🚀 Simpan hasil gabungan ke satu file
try {
    const outPath = path.join(__dirname, "tweets_bbri.json");
    fs.writeFileSync(outPath, JSON.stringify(allTweets, null, 2), "utf-8");
    console.log(`\n🎉 File gabungan & terurut berhasil dibuat: ${outPath}`);
    console.log(`📆 Total tweet: ${allTweets.length}`);
} catch (err) {
    console.error(`❌ Gagal menulis file gabungan: ${err.message}`);
}

// util: ambil tahun dari nama file (mis. tweets_bbri_2020.json -> 2020)
function extractYear(filename) {
    const m = filename.match(/\b(19|20)\d{2}\b/);
    return m ? m[0] : "unknown";
}
