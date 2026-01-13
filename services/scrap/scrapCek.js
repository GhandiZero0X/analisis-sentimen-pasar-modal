const fs = require("fs");

// Daftar file JSON yang mau dicek
const files = [
    "./tweets_bbri.json",
    "./tweets_icbp.json",
    "./tweets_tlkm.json"
];

let grandTotal = 0;

files.forEach((filePath, index) => {
    try {
        const raw = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(raw);

        console.log(`\n==============================`);
        console.log(`FILE ${index + 1}: ${filePath}`);
        console.log("==============================");

        // Hitung jumlah baris
        console.log("Jumlah baris:", data.length);
        grandTotal += data.length;

        // Ambil kolom & tipe datanya
        const sample = data[0];
        const columns = Object.keys(sample);

        console.log("Daftar Kolom & Tipe Data:");
        columns.forEach(col => {
            const value = sample[col];

            let type;
            if (value === null) type = "null";
            else if (Array.isArray(value)) type = "array";
            else type = typeof value;

            console.log(`- ${col}: ${type}`);
        });

    } catch (err) {
        console.error(`Error membaca file ${filePath}:`, err.message);
    }
});

console.log("\n==============================");
console.log("TOTAL SEMUA BARIS:", grandTotal);
console.log("==============================");
