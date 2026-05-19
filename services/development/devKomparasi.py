# services/development/devKomparasi.py
"""
=============================================================
KOMPARASI MODEL: SVM vs IndoBERTweet (S1, S2, S3)
=============================================================
Tujuan:
  Menjawab Tujuan Penelitian #2:
  "Mengevaluasi kinerja SVM dan IndoBERTweet dalam
   mengklasifikasikan sentimen publik terhadap saham
   di pasar modal Indonesia."

  Pemilihan model terbaik mempertimbangkan (saran dosen):
  1. Accuracy — dari confusion matrix
  2. Runtime  — efisiensi waktu inferensi

Skenario:
  S1 = labelling IndoBERTweet (3 kelas: negatif · netral · positif)
  S2 = labelling Lexicon, netral→negatif (2 kelas: negatif · positif)
  S3 = labelling Lexicon (3 kelas: negatif · netral · positif)

Input  : dev_database/4_model/{S1,S2,S3}/{ml,dl}/{periode}/evaluation_info.txt

Output : dev_database/5_komparasi/
         tabel_komparasi.csv
         tabel_komparasi.txt       ← siap copy ke skripsi
         grafik_akurasi.png        ← bar chart accuracy
         grafik_runtime.png        ← bar chart runtime inferensi
         ringkasan_komparasi.txt   ← semua info + rekomendasi model terbaik
=============================================================
"""

import re
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from pathlib import Path
from datetime import datetime

# ══════════════════════════════════════════════════════════════
#  PATH
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
MODEL_DIR  = BASE_DIR / "dev_database" / "4_model"
OUTPUT_DIR = BASE_DIR / "dev_database" / "5_komparasi"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SKENARIOS = ["S1", "S2", "S3"]
SKENARIO_LABEL = {
    "S1": "S1 (IBT label, 3 kelas)",
    "S2": "S2 (Lexicon, 2 kelas)",
    "S3": "S3 (Lexicon, 3 kelas)",
}
SKENARIO_KELAS = {"S1": "3", "S2": "2", "S3": "3"}

PERIODS = ["before", "covid", "after", "all_periods"]
PERIOD_LABEL = {
    "before"     : "Sebelum COVID",
    "covid"      : "Masa COVID",
    "after"      : "Setelah COVID",
    "all_periods": "Semua Periode",
}

MODEL_KEY_LABEL = {"ml": "SVM", "dl": "IndoBERTweet"}

# Warna per kombinasi
COLOR_MAP = {
    ("SVM",          "S1"): "#58a6ff",
    ("SVM",          "S2"): "#3fb950",
    ("SVM",          "S3"): "#e3b341",
    ("IndoBERTweet", "S1"): "#f85149",
    ("IndoBERTweet", "S2"): "#bc8cff",
    ("IndoBERTweet", "S3"): "#ff7b72",
}

# ══════════════════════════════════════════════════════════════
#  PARSER evaluation_info.txt
# ══════════════════════════════════════════════════════════════
def parse_eval_info(filepath: Path) -> dict | None:
    if not filepath.exists():
        return None

    text = filepath.read_text(encoding="utf-8")

    def extract(pattern):
        m = re.search(pattern, text, re.IGNORECASE)
        return float(m.group(1)) if m else None

    accuracy  = extract(r"accuracy\s*[:\s]+([\d.]+)")
    binary_f1 = extract(r"binary\s*f1\s*[:\s]+([\d.]+)")
    macro_f1  = extract(r"macro\s*f1\s*[:\s]+([\d.]+)")
    auc       = extract(r"(?:macro\s*)?auc(?:[\s\-roc]*)[:\s]+([\d.]+)")
    infer     = extract(r"(?:predict|inferensi)[^\d\n]*([\d.]+)\s*detik")
    total     = extract(r"total\s*runtime[^\d\n]*([\d.]+)\s*detik")

    return {
        "accuracy"  : accuracy,
        "f1"        : binary_f1 if binary_f1 is not None else macro_f1,
        "auc"       : auc,
        "infer_time": infer,
        "total_time": total,
    }

# ══════════════════════════════════════════════════════════════
#  KUMPULKAN SEMUA METRIK
# ══════════════════════════════════════════════════════════════
print("=" * 65)
print("  KOMPARASI — SVM vs IndoBERTweet (S1, S2, S3)")
print("=" * 65)

rows         = []
missing_list = []

for skenario in SKENARIOS:
    for model_key, model_name in MODEL_KEY_LABEL.items():
        for period in PERIODS:
            path    = MODEL_DIR / skenario / model_key / period / "evaluation_info.txt"
            metrics = parse_eval_info(path)

            if metrics is None:
                missing_list.append(f"{skenario}/{model_key}/{period}")
                continue

            rows.append({
                "skenario"     : skenario,
                "skenario_label": SKENARIO_LABEL[skenario],
                "n_kelas"      : SKENARIO_KELAS[skenario],
                "model"        : model_name,
                "model_key"    : model_key,
                "periode"      : period,
                "periode_label": PERIOD_LABEL[period],
                **metrics,
            })

if missing_list:
    print(f"\n⚠️  {len(missing_list)} kombinasi tidak ditemukan:")
    for m in missing_list:
        print(f"   - {m}/evaluation_info.txt")
    print()

if not rows:
    raise RuntimeError(
        "Tidak ada data yang berhasil dibaca.\n"
        "Pastikan semua devEvaluasiML/DL.py sudah dijalankan untuk S1, S2, S3."
    )

df = pd.DataFrame(rows)
print(f"✅ Total entri : {len(df)}\n")
print(df[["skenario","model","periode_label","accuracy","f1","infer_time"]].to_string(index=False))
print()

# Simpan CSV
df.to_csv(OUTPUT_DIR / "tabel_komparasi.csv", index=False, encoding="utf-8-sig")
print(f"✅ CSV disimpan : tabel_komparasi.csv")

# ══════════════════════════════════════════════════════════════
#  TABEL TEKS
# ══════════════════════════════════════════════════════════════
txt_lines = [
    "TABEL KOMPARASI KINERJA MODEL",
    "=" * 80,
    f"{'Skenario':<26} {'Model':<15} {'Periode':<18} {'Kelas':>5} "
    f"{'Accuracy':>9} {'F1':>8} {'Infer(s)':>9}",
    "─" * 80,
]
for skenario in SKENARIOS:
    sub = df[df["skenario"] == skenario]
    txt_lines.append(f"[ {SKENARIO_LABEL[skenario]} ]")
    for _, row in sub.iterrows():
        acc_s   = f"{row['accuracy']:.4f}"   if pd.notna(row.get("accuracy"))   else "—"
        f1_s    = f"{row['f1']:.4f}"         if pd.notna(row.get("f1"))         else "—"
        infer_s = f"{row['infer_time']:.2f}" if pd.notna(row.get("infer_time")) else "—"
        txt_lines.append(
            f"  {'':24} {row['model']:<15} {row['periode_label']:<18} "
            f"{row['n_kelas']:>5} {acc_s:>9} {f1_s:>8} {infer_s:>9}"
        )
    txt_lines.append("─" * 80)

(OUTPUT_DIR / "tabel_komparasi.txt").write_text("\n".join(txt_lines), encoding="utf-8")
print(f"✅ TXT disimpan : tabel_komparasi.txt")

# ══════════════════════════════════════════════════════════════
#  SETUP MATPLOTLIB DARK THEME
# ══════════════════════════════════════════════════════════════
plt.rcParams.update({
    "figure.facecolor": "#0d1117", "axes.facecolor": "#161b22",
    "axes.edgecolor"  : "#30363d", "axes.labelcolor": "#8b949e",
    "xtick.color"     : "#8b949e", "ytick.color"    : "#8b949e",
    "text.color"      : "#e6edf3", "grid.color"     : "#21262d",
    "legend.facecolor": "#1c2128", "legend.edgecolor": "#30363d",
})

GROUP_KEYS   = [("SVM","S1"),("SVM","S2"),("SVM","S3"),
                ("IndoBERTweet","S1"),("IndoBERTweet","S2"),("IndoBERTweet","S3")]
GROUP_LABELS = [f"{m} {s}" for m, s in GROUP_KEYS]

n_periods  = len(PERIODS)
n_groups   = len(GROUP_KEYS)
bar_width  = 0.12
x          = np.arange(n_periods)
offsets    = np.linspace(-(n_groups-1)/2*bar_width,
                          (n_groups-1)/2*bar_width, n_groups)
period_labels = [PERIOD_LABEL[p] for p in PERIODS]

def draw_grouped_bar(metric_col, ylabel, title, filename, rotate_val=True):
    fig, ax = plt.subplots(figsize=(15, 6))
    fig.patch.set_facecolor("#0d1117")

    for gi, (model_name, skenario) in enumerate(GROUP_KEYS):
        vals = []
        for period in PERIODS:
            sub = df[
                (df["model"] == model_name) &
                (df["skenario"] == skenario) &
                (df["periode"] == period)
            ]
            v = sub[metric_col].values[0] if len(sub) > 0 else None
            vals.append(v if (v is not None and pd.notna(v)) else 0)

        bars = ax.bar(
            x + offsets[gi], vals, bar_width,
            label  = GROUP_LABELS[gi],
            color  = COLOR_MAP[(model_name, skenario)],
            alpha  = 0.85, zorder=3,
        )
        for bar, val in zip(bars, vals):
            if val and val > 0:
                fmt = f"{val:.3f}" if metric_col == "accuracy" else f"{val:.1f}s"
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    bar.get_height() + (0.003 if metric_col == "accuracy" else 0.01),
                    fmt,
                    ha="center", va="bottom",
                    fontsize=6.5, color="#e6edf3",
                    rotation=90 if rotate_val else 0,
                )

    ax.set_xlabel("Periode", fontsize=11, labelpad=8)
    ax.set_ylabel(ylabel, fontsize=11)
    ax.set_title(title, fontsize=13, pad=40, color="#e6edf3")
    ax.set_xticks(x)
    ax.set_xticklabels(period_labels, rotation=10, ha="right")
    if metric_col == "accuracy":
        ax.set_ylim([0, 1.25])
        ax.yaxis.set_major_locator(mticker.MultipleLocator(0.1))
    ax.grid(axis="y", alpha=0.4, zorder=0)
    ax.legend(
        ncol=3, fontsize=8.5,
        loc="upper center", bbox_to_anchor=(0.5, 1.18),
        framealpha=0.3,
    )
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / filename, dpi=150, bbox_inches="tight",
                facecolor="#0d1117")
    plt.close()
    print(f"✅ Grafik disimpan : {filename}")

# Grafik 1: Accuracy
draw_grouped_bar(
    metric_col = "accuracy",
    ylabel     = "Accuracy",
    title      = "Perbandingan Accuracy: SVM vs IndoBERTweet (S1, S2, S3)",
    filename   = "grafik_akurasi.png",
    rotate_val = True,
)

# Grafik 2: Runtime Inferensi
draw_grouped_bar(
    metric_col = "infer_time",
    ylabel     = "Runtime Inferensi (detik)",
    title      = "Perbandingan Runtime Inferensi: SVM vs IndoBERTweet (S1, S2, S3)",
    filename   = "grafik_runtime.png",
    rotate_val = True,
)

# ══════════════════════════════════════════════════════════════
#  PEMILIHAN MODEL TERBAIK
#  Metode rank: rank_accuracy (desc) + rank_infer_time (asc)
#  → Total rank terendah = model terbaik (accuracy tinggi + cepat)
# ══════════════════════════════════════════════════════════════
df_all = df[df["periode"] == "all_periods"].copy()
df_all = df_all.dropna(subset=["accuracy", "infer_time"])

if len(df_all) > 0:
    df_all["rank_acc"]    = df_all["accuracy"].rank(ascending=False, method="min")
    df_all["rank_rt"]     = df_all["infer_time"].rank(ascending=True,  method="min")
    df_all["rank_total"]  = df_all["rank_acc"] + df_all["rank_rt"]
    df_all = df_all.sort_values("rank_total").reset_index(drop=True)
    best   = df_all.iloc[0]
    best_label = f"{best['model']} {best['skenario']}"

# ══════════════════════════════════════════════════════════════
#  RINGKASAN TEKS — semua informasi dalam 1 file
# ══════════════════════════════════════════════════════════════
lines = [
    "RINGKASAN KOMPARASI MODEL",
    "=" * 65,
    f"Tanggal    : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    f"Metode     : Rank Accuracy + Rank Runtime (saran dosen)",
    "",
    "SKENARIO:",
    "  S1 = Labelling IndoBERTweet → 3 kelas (negatif · netral · positif)",
    "  S2 = Labelling Lexicon      → 2 kelas (negatif · positif)",
    "  S3 = Labelling Lexicon      → 3 kelas (negatif · netral · positif)",
    "",
    "METODOLOGI PEMILIHAN:",
    "  Rank Accuracy  : model dengan accuracy tertinggi = rank 1",
    "  Rank Runtime   : model dengan inferensi tercepat = rank 1",
    "  Total Rank     : Rank Accuracy + Rank Runtime",
    "  Keputusan      : Total Rank TERENDAH = model terbaik",
    "",
    "─" * 65,
]

if len(df_all) > 0:
    lines += [
        "RANKING (all_periods):",
        f"  {'No':<3} {'Model':<15} {'Skn':<4} {'Kelas':>5} {'Accuracy':>9} "
        f"{'F1':>8} {'Infer(s)':>9} {'Rk Acc':>7} {'Rk RT':>6} {'Total':>6}",
        "─" * 65,
    ]
    for i, row in df_all.iterrows():
        acc_s   = f"{row['accuracy']:.4f}"   if pd.notna(row['accuracy'])   else "—"
        f1_s    = f"{row['f1']:.4f}"         if pd.notna(row['f1'])         else "—"
        infer_s = f"{row['infer_time']:.2f}" if pd.notna(row['infer_time']) else "—"
        marker  = " ← 🏆" if i == 0 else ""
        lines.append(
            f"  {i+1:<3} {row['model']:<15} {row['skenario']:<4} "
            f"{row['n_kelas']:>5} {acc_s:>9} {f1_s:>8} {infer_s:>9} "
            f"{int(row['rank_acc']):>7} {int(row['rank_rt']):>6} "
            f"{int(row['rank_total']):>6}{marker}"
        )
    lines.append("─" * 65)

    lines += [
        "",
        "KESIMPULAN:",
        f"  Model terbaik   : {best_label}",
        f"  Accuracy        : {best['accuracy']:.4f}",
        f"  F1              : {best['f1']:.4f}" if pd.notna(best.get("f1")) else "",
        f"  Runtime infer   : {best['infer_time']:.2f} detik",
        f"  Total rank      : {int(best['rank_total'])}",
        "",
        "  → Direkomendasikan untuk sistem (Tujuan Penelitian #1)",
        "",
        "─" * 65,
    ]

# Tabel lengkap semua periode
lines += [
    "TABEL LENGKAP SEMUA PERIODE:",
    f"  {'Skn':<4} {'Model':<15} {'Periode':<18} {'Kelas':>5} "
    f"{'Accuracy':>9} {'F1':>8} {'Infer(s)':>9} {'Total(s)':>9}",
    "─" * 65,
]
for skenario in SKENARIOS:
    lines.append(f"  [{SKENARIO_LABEL[skenario]}]")
    for model_name in ["SVM", "IndoBERTweet"]:
        for period in PERIODS:
            sub = df[
                (df["model"] == model_name) &
                (df["skenario"] == skenario) &
                (df["periode"] == period)
            ]
            if len(sub) == 0:
                continue
            row     = sub.iloc[0]
            acc_s   = f"{row['accuracy']:.4f}"   if pd.notna(row.get("accuracy"))   else "—"
            f1_s    = f"{row['f1']:.4f}"         if pd.notna(row.get("f1"))         else "—"
            infer_s = f"{row['infer_time']:.2f}" if pd.notna(row.get("infer_time")) else "—"
            total_s = f"{row['total_time']:.2f}" if pd.notna(row.get("total_time")) else "—"
            lines.append(
                f"  {skenario:<4} {model_name:<15} {PERIOD_LABEL[period]:<18} "
                f"{row['n_kelas']:>5} {acc_s:>9} {f1_s:>8} {infer_s:>9} {total_s:>9}"
            )
    lines.append("─" * 65)

lines.append("=" * 65)

summary_text = "\n".join(lines)
print("\n" + summary_text)
(OUTPUT_DIR / "ringkasan_komparasi.txt").write_text(summary_text, encoding="utf-8")
print(f"\n✅ Disimpan : ringkasan_komparasi.txt")

# ══════════════════════════════════════════════════════════════
#  RINGKASAN TERMINAL
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*65}")
print(f"  ✅ Komparasi selesai!")
print(f"{'='*65}")
print(f"  📊 tabel_komparasi.csv")
print(f"  📄 tabel_komparasi.txt       ← copy ke skripsi")
print(f"  🖼  grafik_akurasi.png")
print(f"  🖼  grafik_runtime.png")
print(f"  📄 ringkasan_komparasi.txt   ← semua info + rekomendasi")
print(f"{'='*65}")
if len(df_all) > 0:
    print(f"\n  🏆 Model terbaik : {best_label}")
    print(f"     Accuracy      : {best['accuracy']:.4f}")
    print(f"     Runtime infer : {best['infer_time']:.2f} detik")
print(f"\n  ➡  Lanjut ke: python devPembanding.py")