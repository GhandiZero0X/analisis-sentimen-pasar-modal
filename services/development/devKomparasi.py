# services/development/devKomparasi.py
"""
=============================================================
KOMPARASI MODEL: SVM vs IndoBERTweet
=============================================================
Tujuan:
  Menjawab Tujuan Penelitian #2:
  "Mengevaluasi kinerja SVM dan IndoBERTweet dalam
   mengklasifikasikan sentimen publik terhadap saham
   di pasar modal Indonesia."

Cara kerja:
  Membaca semua classification_report dari hasil evaluasi
  lalu merangkumnya menjadi tabel perbandingan dan grafik.

Input  : dev_database/4_model/
         ml/{before,covid,after,all_periods}/classification_report_svm.txt
         dl/{before,covid,after,all_periods}/classification_report_indobertweet.txt

Output : dev_database/5_komparasi/
         tabel_komparasi.csv          ← tabel lengkap semua metrik
         tabel_komparasi.txt          ← tabel siap copy ke skripsi
         grafik_akurasi.png           ← bar chart akurasi per periode
         grafik_f1.png                ← bar chart F1 per periode
         grafik_radar.png             ← radar chart P/R/F1/Acc per model
         ringkasan_komparasi.txt      ← kesimpulan otomatis
=============================================================
"""

import re
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from pathlib import Path
from datetime import datetime

# ══════════════════════════════════════════════════════════════
#  PATH CONFIGURATION
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
MODEL_DIR  = BASE_DIR / "dev_database" / "4_model"
OUTPUT_DIR = BASE_DIR / "dev_database" / "5_komparasi"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Periode yang dibandingkan (urutan tampilan)
PERIODS = ["before", "covid", "after", "all_periods"]
PERIOD_LABELS = {
    "before"     : "Sebelum COVID",
    "covid"      : "Masa COVID",
    "after"      : "Setelah COVID",
    "all_periods": "Semua Periode",
}

# ══════════════════════════════════════════════════════════════
#  PARSER: Baca metrik dari classification_report .txt
# ══════════════════════════════════════════════════════════════
def parse_report(filepath: Path) -> dict:
    """
    Ekstrak Accuracy, Precision, Recall, F1 dari file
    classification_report_*.txt hasil devEvaluasiML/DL.py.
    """
    if not filepath.exists():
        return None

    text = filepath.read_text(encoding="utf-8")

    # Ambil accuracy
    acc_match = re.search(r"ACCURACY\s*[-]+\s*([\d.]+)", text)
    accuracy  = float(acc_match.group(1)) if acc_match else None

    # Ambil weighted avg precision, recall, f1 dari classification_report
    # Format: "weighted avg   0.xxxx   0.xxxx   0.xxxx   N"
    weighted_match = re.search(
        r"weighted\s+avg\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)", text
    )
    if weighted_match:
        precision = float(weighted_match.group(1))
        recall    = float(weighted_match.group(2))
        f1        = float(weighted_match.group(3))
    else:
        precision = recall = f1 = None

    # Ambil AUC jika ada (SVM) atau Binary F1 jika ada (DL)
    auc_match = re.search(r"AUC\s*[:\s]+([\d.]+)", text)
    auc       = float(auc_match.group(1)) if auc_match else None

    return {
        "accuracy" : accuracy,
        "precision": precision,
        "recall"   : recall,
        "f1"       : f1,
        "auc"      : auc,
    }


# ══════════════════════════════════════════════════════════════
#  KUMPULKAN SEMUA METRIK
# ══════════════════════════════════════════════════════════════
print("=" * 62)
print("  KOMPARASI MODEL — SVM vs IndoBERTweet")
print("=" * 62)
print(f"\n📂 Input  : {MODEL_DIR}")
print(f"📂 Output : {OUTPUT_DIR}\n")

rows = []

for period in PERIODS:
    label = PERIOD_LABELS[period]

    # Path report masing-masing model
    svm_report_path = MODEL_DIR / "ml" / period / "classification_report_svm.txt"
    dl_report_path  = MODEL_DIR / "dl" / period / "classification_report_indobertweet.txt"

    svm_metrics = parse_report(svm_report_path)
    dl_metrics  = parse_report(dl_report_path)

    if svm_metrics is None:
        print(f"⚠️  SVM report tidak ditemukan  : {svm_report_path}")
    if dl_metrics is None:
        print(f"⚠️  DL report tidak ditemukan   : {dl_report_path}")

    # SVM row
    if svm_metrics:
        rows.append({
            "periode"   : label,
            "model"     : "SVM",
            "accuracy"  : svm_metrics["accuracy"],
            "precision" : svm_metrics["precision"],
            "recall"    : svm_metrics["recall"],
            "f1"        : svm_metrics["f1"],
            "auc"       : svm_metrics["auc"],
        })

    # IndoBERTweet row
    if dl_metrics:
        rows.append({
            "periode"   : label,
            "model"     : "IndoBERTweet",
            "accuracy"  : dl_metrics["accuracy"],
            "precision" : dl_metrics["precision"],
            "recall"    : dl_metrics["recall"],
            "f1"        : dl_metrics["f1"],
            "auc"       : dl_metrics["auc"],
        })

df = pd.DataFrame(rows)

print("✅ Data terkumpul:\n")
print(df.to_string(index=False))

# ══════════════════════════════════════════════════════════════
#  SIMPAN TABEL CSV
# ══════════════════════════════════════════════════════════════
df.to_csv(OUTPUT_DIR / "tabel_komparasi.csv", index=False, encoding="utf-8-sig")
print(f"\n✅ CSV disimpan : tabel_komparasi.csv")

# ══════════════════════════════════════════════════════════════
#  TABEL TEKS (siap copy ke skripsi)
# ══════════════════════════════════════════════════════════════
txt_lines = [
    "TABEL KOMPARASI KINERJA MODEL",
    "=" * 70,
    f"{'Periode':<20} {'Model':<15} {'Accuracy':>9} {'Precision':>10} "
    f"{'Recall':>8} {'F1':>8}",
    "─" * 70,
]
for _, row in df.iterrows():
    auc_str = f"{row['auc']:.4f}" if pd.notna(row.get("auc")) else "   —   "
    txt_lines.append(
        f"{row['periode']:<20} {row['model']:<15} "
        f"{row['accuracy']:>9.4f} {row['precision']:>10.4f} "
        f"{row['recall']:>8.4f} {row['f1']:>8.4f}"
    )
    # Tambahkan pemisah antar periode
    if row["model"] == "IndoBERTweet":
        txt_lines.append("─" * 70)

(OUTPUT_DIR / "tabel_komparasi.txt").write_text(
    "\n".join(txt_lines), encoding="utf-8"
)
print(f"✅ TXT disimpan : tabel_komparasi.txt")

# ══════════════════════════════════════════════════════════════
#  GRAFIK 1: BAR CHART AKURASI per Periode
# ══════════════════════════════════════════════════════════════
period_labels_list = [PERIOD_LABELS[p] for p in PERIODS]
svm_acc  = df[df["model"] == "SVM"]["accuracy"].tolist()
dl_acc   = df[df["model"] == "IndoBERTweet"]["accuracy"].tolist()

x     = np.arange(len(period_labels_list))
width = 0.35

fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width/2, svm_acc, width,
               label="SVM", color="#3498db", alpha=0.85)
bars2 = ax.bar(x + width/2, dl_acc,  width,
               label="IndoBERTweet", color="#e74c3c", alpha=0.85)

# Tambahkan nilai di atas bar
for bar in bars1:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
            f"{bar.get_height():.4f}", ha="center", va="bottom",
            fontsize=9, color="#2c3e50")
for bar in bars2:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
            f"{bar.get_height():.4f}", ha="center", va="bottom",
            fontsize=9, color="#2c3e50")

ax.set_xlabel("Periode", fontsize=12)
ax.set_ylabel("Accuracy", fontsize=12)
ax.set_title("Perbandingan Accuracy: SVM vs IndoBERTweet", fontsize=13)
ax.set_xticks(x)
ax.set_xticklabels(period_labels_list, rotation=10, ha="right")
ax.set_ylim([0, 1.1])
ax.legend(fontsize=11)
ax.grid(axis="y", alpha=0.3)
ax.yaxis.set_major_locator(mticker.MultipleLocator(0.1))

plt.tight_layout()
plt.savefig(OUTPUT_DIR / "grafik_akurasi.png", dpi=150, bbox_inches="tight")
plt.close()
print(f"✅ Grafik disimpan : grafik_akurasi.png")

# ══════════════════════════════════════════════════════════════
#  GRAFIK 2: BAR CHART F1 per Periode
# ══════════════════════════════════════════════════════════════
svm_f1 = df[df["model"] == "SVM"]["f1"].tolist()
dl_f1  = df[df["model"] == "IndoBERTweet"]["f1"].tolist()

fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width/2, svm_f1, width,
               label="SVM", color="#3498db", alpha=0.85)
bars2 = ax.bar(x + width/2, dl_f1,  width,
               label="IndoBERTweet", color="#e74c3c", alpha=0.85)

for bar in bars1:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
            f"{bar.get_height():.4f}", ha="center", va="bottom",
            fontsize=9, color="#2c3e50")
for bar in bars2:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
            f"{bar.get_height():.4f}", ha="center", va="bottom",
            fontsize=9, color="#2c3e50")

ax.set_xlabel("Periode", fontsize=12)
ax.set_ylabel("F1-Score", fontsize=12)
ax.set_title("Perbandingan F1-Score: SVM vs IndoBERTweet", fontsize=13)
ax.set_xticks(x)
ax.set_xticklabels(period_labels_list, rotation=10, ha="right")
ax.set_ylim([0, 1.1])
ax.legend(fontsize=11)
ax.grid(axis="y", alpha=0.3)
ax.yaxis.set_major_locator(mticker.MultipleLocator(0.1))

plt.tight_layout()
plt.savefig(OUTPUT_DIR / "grafik_f1.png", dpi=150, bbox_inches="tight")
plt.close()
print(f"✅ Grafik disimpan : grafik_f1.png")

# ══════════════════════════════════════════════════════════════
#  GRAFIK 3: RADAR CHART — All Periods (Accuracy/Precision/Recall/F1)
# ══════════════════════════════════════════════════════════════
def radar_chart(svm_vals, dl_vals, categories, title, filepath):
    N      = len(categories)
    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1]   # tutup lingkaran

    svm_vals = svm_vals + svm_vals[:1]
    dl_vals  = dl_vals  + dl_vals[:1]

    fig, ax = plt.subplots(figsize=(7, 7),
                           subplot_kw=dict(polar=True))

    ax.plot(angles, svm_vals, "o-", linewidth=2,
            color="#3498db", label="SVM")
    ax.fill(angles, svm_vals, alpha=0.15, color="#3498db")

    ax.plot(angles, dl_vals, "s-", linewidth=2,
            color="#e74c3c", label="IndoBERTweet")
    ax.fill(angles, dl_vals, alpha=0.15, color="#e74c3c")

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=12)
    ax.set_ylim([0, 1])
    ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
    ax.set_yticklabels(["0.2","0.4","0.6","0.8","1.0"], fontsize=8)
    ax.set_title(title, fontsize=13, pad=20)
    ax.legend(loc="upper right", bbox_to_anchor=(1.3, 1.1), fontsize=11)
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(filepath, dpi=150, bbox_inches="tight")
    plt.close()

# Ambil data all_periods untuk radar
ap_label = PERIOD_LABELS["all_periods"]
svm_ap   = df[(df["model"] == "SVM") & (df["periode"] == ap_label)].iloc[0]
dl_ap    = df[(df["model"] == "IndoBERTweet") & (df["periode"] == ap_label)].iloc[0]

radar_chart(
    svm_vals   = [svm_ap["accuracy"], svm_ap["precision"],
                  svm_ap["recall"],   svm_ap["f1"]],
    dl_vals    = [dl_ap["accuracy"],  dl_ap["precision"],
                  dl_ap["recall"],    dl_ap["f1"]],
    categories = ["Accuracy", "Precision", "Recall", "F1-Score"],
    title      = "Radar Chart: SVM vs IndoBERTweet\n(Semua Periode)",
    filepath   = OUTPUT_DIR / "grafik_radar.png",
)
print(f"✅ Grafik disimpan : grafik_radar.png")

# ══════════════════════════════════════════════════════════════
#  RINGKASAN OTOMATIS (untuk bahan penulisan skripsi)
# ══════════════════════════════════════════════════════════════
summary_lines = [
    "RINGKASAN KOMPARASI — SVM vs IndoBERTweet",
    "=" * 62,
    f"Tanggal   : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    f"Kelas     : Positif & Negatif (binary classification)",
    "",
    "HASIL PER PERIODE:",
    "─" * 62,
]

winner_count = {"SVM": 0, "IndoBERTweet": 0}

for period in PERIODS:
    label   = PERIOD_LABELS[period]
    svm_row = df[(df["model"] == "SVM") & (df["periode"] == label)]
    dl_row  = df[(df["model"] == "IndoBERTweet") & (df["periode"] == label)]

    if svm_row.empty or dl_row.empty:
        continue

    s = svm_row.iloc[0]
    d = dl_row.iloc[0]

    # Tentukan pemenang per periode berdasarkan F1
    winner = "SVM" if s["f1"] >= d["f1"] else "IndoBERTweet"
    winner_count[winner] += 1
    margin = abs(s["f1"] - d["f1"])

    summary_lines += [
        f"\n  [{label}]",
        f"  SVM          → Acc: {s['accuracy']:.4f} | P: {s['precision']:.4f} "
        f"| R: {s['recall']:.4f} | F1: {s['f1']:.4f}",
        f"  IndoBERTweet → Acc: {d['accuracy']:.4f} | P: {d['precision']:.4f} "
        f"| R: {d['recall']:.4f} | F1: {d['f1']:.4f}",
        f"  🏆 Unggul     : {winner} (selisih F1: {margin:.4f})",
    ]

summary_lines += [
    "",
    "─" * 62,
    "KESIMPULAN KESELURUHAN:",
    f"  SVM unggul di          : {winner_count['SVM']} periode",
    f"  IndoBERTweet unggul di : {winner_count['IndoBERTweet']} periode",
]

# Model terbaik secara keseluruhan (berdasarkan all_periods F1)
svm_overall = df[(df["model"] == "SVM") &
                 (df["periode"] == PERIOD_LABELS["all_periods"])]
dl_overall  = df[(df["model"] == "IndoBERTweet") &
                 (df["periode"] == PERIOD_LABELS["all_periods"])]

if not svm_overall.empty and not dl_overall.empty:
    best_overall = "SVM" if svm_overall.iloc[0]["f1"] >= dl_overall.iloc[0]["f1"] \
                   else "IndoBERTweet"
    summary_lines += [
        f"  Model terbaik overall  : {best_overall} "
        f"(berdasarkan F1 semua periode)",
        "",
        "  → Direkomendasikan untuk sistem (Tujuan Penelitian #1):",
        f"    Gunakan model: {best_overall}",
    ]

summary_lines.append("=" * 62)

summary_text = "\n".join(summary_lines)
print("\n" + summary_text)

(OUTPUT_DIR / "ringkasan_komparasi.txt").write_text(
    summary_text, encoding="utf-8"
)

# ══════════════════════════════════════════════════════════════
#  RINGKASAN AKHIR
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*62}")
print(f"  ✅ Komparasi selesai!")
print(f"{'='*62}")
print(f"  📊 tabel_komparasi.csv")
print(f"  📄 tabel_komparasi.txt      ← copy ke skripsi")
print(f"  🖼  grafik_akurasi.png")
print(f"  🖼  grafik_f1.png")
print(f"  🖼  grafik_radar.png")
print(f"  📄 ringkasan_komparasi.txt  ← bahan penulisan bab hasil")
print(f"{'='*62}")
print(f"\n  ✅ Tujuan Penelitian #2 terjawab.")
print(f"  ➡  Lanjut ke: python devPembanding.py (Tujuan #1)")