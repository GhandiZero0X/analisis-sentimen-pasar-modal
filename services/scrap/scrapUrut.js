const fs = require("fs");
const path = require("path");

const inputFile = "tweets_bmri_2021.json";
const outputFile = "tweets_bmri_2021.json";

const filePath = path.join(__dirname, inputFile);
const raw = fs.readFileSync(filePath, "utf-8");
let allTweets = JSON.parse(raw);

// fungsi validasi format YYYY-MM-DD
const isValidDateFormat = (dateStr) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};

// clean data
allTweets = allTweets.map((item) => {
    let date = item.date;

    // coba perbaiki typo umum (misal "2g025" → "2025")
    if (date) {
        date = date.replace(/[^0-9-]/g, ""); // hapus karakter aneh
    }

    return {
        ...item,
        date: isValidDateFormat(date) ? date : null
    };
});

// buang data yang tanggalnya rusak
allTweets = allTweets.filter((item) => item.date !== null);

// sorting ascending (2018 → 2025)
allTweets.sort((a, b) => new Date(a.date) - new Date(b.date));

// simpan hasil
const outPath = path.join(__dirname, outputFile);
fs.writeFileSync(outPath, JSON.stringify(allTweets, null, 2), "utf-8");

console.log("✅ Data sudah dibersihkan & diurutkan");
console.log(`📊 Total data valid: ${allTweets.length}`);