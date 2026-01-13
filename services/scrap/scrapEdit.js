const fs = require("fs");

// baca file JSON
const rawData = fs.readFileSync("tweets_tlkm.json", "utf-8");
const data = JSON.parse(rawData);

// tambahkan kolom saham
const updatedData = data.map(item => ({
    ...item,
    saham: "tlkm"
}));

// simpan kembali ke file baru (lebih aman)
fs.writeFileSync(
    "tweets_tlkm.json",
    JSON.stringify(updatedData, null, 2)
);

console.log("Kolom 'saham' berhasil ditambahkan 🚀");
