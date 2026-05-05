const fs = require("fs");
const path = require("path");

// ROOT folder database
const ROOT_DIR = "database";

// OUTPUT utama
const OUTPUT_DIR = "data_filter";

// helper ambil tahun
function getYear(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const year = dateStr.split("-")[0];
  return isNaN(year) ? null : year;
}

// proses 1 file
function processFile(filePath, outputBaseDir, stockCode) {
  let rawData, tweets;

  try {
    rawData = fs.readFileSync(filePath, "utf-8");
    tweets = JSON.parse(rawData);
  } catch (err) {
    console.error(`❌ Error file ${filePath}:`, err.message);
    return;
  }

  const grouped = {};
  let skipped = 0;

  for (const item of tweets) {
    const year = getYear(item.date);

    if (!year) {
      skipped++;
      continue;
    }

    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(item);
  }

  // simpan per tahun
  for (const year of Object.keys(grouped)) {
    const data = grouped[year].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const outputFile = path.join(
      outputBaseDir,
      `tweets_${stockCode}_${year}.json` // 🔥 fix di sini
    );

    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), "utf-8");
  }

  console.log(`✅ Selesai: ${filePath} | skipped: ${skipped}`);
}

// main
function processAllFolders() {
  const folders = fs.readdirSync(ROOT_DIR);

  for (const folder of folders) {
    const folderPath = path.join(ROOT_DIR, folder);

    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const stockCode = folder.toLowerCase(); // 🔥 ambil kode saham

    console.log(`\n📂 Processing saham: ${stockCode}`);

    const files = fs.readdirSync(folderPath);

    const outputStockDir = path.join(OUTPUT_DIR, stockCode);
    if (!fs.existsSync(outputStockDir)) {
      fs.mkdirSync(outputStockDir, { recursive: true });
    }

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = path.join(folderPath, file);

      processFile(filePath, outputStockDir, stockCode);
    }
  }

  console.log("\n🚀 Semua folder selesai diproses!");
}

// run
processAllFolders();