const fs = require("fs");
const path = require("path");

// ══════════════════════════════════════════════════════════════
//  KONFIGURASI — Edit bagian ini sesuai kebutuhanmu
// ══════════════════════════════════════════════════════════════

// Folder induk tempat semua folder saham berada
// Contoh: jika struktur kamu adalah ./data/bbri/, ./data/icbp/
// ganti BASE_DIR = "./data"  → jika folder saham ada di subfolder
// ganti BASE_DIR = "."       → jika folder saham langsung di sini
const BASE_DIR = "./database";

// Daftar file yang ingin digabung
// Format: { folder: "nama_folder_saham", file: "nama_file.json" }
const FILES_TO_MERGE = [
    // { folder: "bbri", file: "tweets_bbri_2023.json" },
    // { folder: "bbri", file: "tweets_bbri_2024.json" },
    { folder: "bbri", file: "tweets_bbri_2026.json" },

    // { folder: "icbp", file: "tweets_icbp_2023.json" },
    // { folder: "icbp", file: "tweets_icbp_2024.json" },
    { folder: "icbp", file: "tweets_icbp_2026.json" },

    // { folder: "tlkm", file: "tweets_tlkm_2023.json" },
    // { folder: "tlkm", file: "tweets_tlkm_2024.json" },
    { folder: "tlkm", file: "tweets_tlkm_2026.json" },

    // { folder: "bmri", file: "tweets_bmri_2023.json" },
    // { folder: "bmri", file: "tweets_bmri_2024.json" },
    { folder: "bmri", file: "tweets_bmri_2026.json" },

    // { folder: "isat", file: "tweets_isat_2023.json" },
    // { folder: "isat", file: "tweets_isat_2024.json" },
    { folder: "isat", file: "tweets_isat_2026.json" },

    // { folder: "unvr", file: "tweets_unvr_2023.json" },
    // { folder: "unvr", file: "tweets_unvr_2024.json" },
    { folder: "unvr", file: "tweets_unvr_2026.json" },
];

// Nama file output hasil penggabungan
const OUTPUT_FILE = "tweets_after_covid_baru.json";

// ══════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

// Baca satu file JSON, return array of objects
function readJsonFile(filepath) {
    const raw = fs.readFileSync(filepath, "utf-8");
    const data = JSON.parse(raw);

    // Pastikan isinya array, bukan object tunggal
    if (!Array.isArray(data)) {
        throw new Error(`File bukan array JSON: ${filepath}`);
    }
    return data;
}

// Bandingkan dua tanggal "YYYY-MM-DD" secara ascending
function compareByDate(a, b) {
    // localeCompare aman untuk format YYYY-MM-DD
    // karena urutan string = urutan kronologis
    if (!a.date) return 1; // data tanpa tanggal → taruh paling belakang
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
}

// ══════════════════════════════════════════════════════════════
//  MAIN FUNCTION
// ══════════════════════════════════════════════════════════════

function mergeFiles() {
    console.log("🔀 Mulai proses penggabungan...\n");
    console.log("─".repeat(50));

    let allData = []; // tampung semua tweet dari semua file
    let totalFiles = 0;
    let failedFiles = 0;

    for (const { folder, file } of FILES_TO_MERGE) {
        const filepath = path.join(BASE_DIR, folder, file);

        process.stdout.write(`  📄 Membaca: ${path.join(folder, file).padEnd(35)}`);

        // Coba baca file — skip jika tidak ditemukan
        try {
            const data = readJsonFile(filepath);
            allData = allData.concat(data); // gabungkan ke array utama
            console.log(`→ ${data.length.toLocaleString()} tweet ✅`);
            totalFiles++;
        } catch (err) {
            // Tampilkan pesan error tapi lanjut ke file berikutnya
            if (err.code === "ENOENT") {
                console.log(`→ ❌ FILE TIDAK DITEMUKAN`);
            } else {
                console.log(`→ ❌ ERROR: ${err.message}`);
            }
            failedFiles++;
        }
    }

    console.log("─".repeat(50));
    console.log(
        `\n📦 Total sebelum sort : ${allData.length.toLocaleString()} tweet`,
    );

    if (allData.length === 0) {
        console.error(
            "\n❌ Tidak ada data untuk digabung. Periksa path folder & nama file.",
        );
        process.exit(1);
    }

    // ── Urutkan semua data berdasarkan tanggal (ascending) ──
    console.log("⏳ Mengurutkan berdasarkan tanggal...");
    allData.sort(compareByDate);

    // ── Tampilkan rentang tanggal hasil merge ──
    const firstDate = allData[0]?.date ?? "-";
    const lastDate = allData[allData.length - 1]?.date ?? "-";
    console.log(`📅 Rentang tanggal   : ${firstDate}  →  ${lastDate}`);

    // ── Hitung distribusi per saham untuk ringkasan ──
    const perSaham = {};
    for (const item of allData) {
        const saham = item.saham ?? "unknown";
        perSaham[saham] = (perSaham[saham] ?? 0) + 1;
    }

    console.log("\n📊 Distribusi per saham:");
    for (const [saham, count] of Object.entries(perSaham)) {
        console.log(
            `   ${saham.toUpperCase().padEnd(10)} → ${count.toLocaleString()} tweet`,
        );
    }

    // ── Simpan ke file output ──
    console.log(`\n💾 Menyimpan ke: ${OUTPUT_FILE} ...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allData, null, 2), "utf-8");

    // ── Hitung ukuran file output ──
    const fileSizeKB = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1);

    console.log("\n" + "═".repeat(50));
    console.log(`✅ Selesai!`);
    console.log(
        `   File berhasil dibaca : ${totalFiles} dari ${FILES_TO_MERGE.length}`,
    );
    if (failedFiles > 0) {
        console.log(`   File gagal/tidak ada  : ${failedFiles}`);
    }
    console.log(`   Total tweet tergabung : ${allData.length.toLocaleString()}`);
    console.log(`   Ukuran file output    : ${fileSizeKB} KB`);
    console.log(`   Output disimpan di    : ${path.resolve(OUTPUT_FILE)}`);
    console.log("═".repeat(50));
}

// Jalankan
mergeFiles();
