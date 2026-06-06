# services/development/devKomparasi.py
"""
=============================================================
KOMPARASI MODEL: S1 DL vs S3 ML
=============================================================
Tujuan:
  - Membandingkan hanya 2 model:
      1) S1 DL
      2) S3 ML
  - Periode:
      before, covid, after
  - Menyimpan CSV dengan kolom:
      period, model, accuracy, f1_weighted, f1_macro,
      train_rt, eval_rt, total_rt, period_label

Output:
  dev_database/5_komparasi_s1dl_s3ml/
      tabel_komparasi.csv
      tabel_komparasi.txt
      grafik_akurasi.png
      grafik_runtime.png
      ringkasan_komparasi.txt
=============================================================
"""

import re
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

# ══════════════════════════════════════════════════════════════
#  PATH & KONSTANTA
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
MODEL_DIR  = BASE_DIR / "dev_database" / "4_model"
OUTPUT_DIR = BASE_DIR / "dev_database" / "5_komparasi_2"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PERIODS = ["before", "covid", "after"]

PERIOD_LABELS = {
    "before"     : "Sebelum COVID",
    "covid"      : "Masa COVID",
    "after"      : "Setelah COVID",
}

# Hanya 2 model yang dibandingkan
MODEL_CONFIGS = [
    {
        "model": "S1 DL",
        "folder": ("S1", "dl"),
        "report_file": "classification_report_indobertweet.txt",
    },
    {
        "model": "S3 ML",
        "folder": ("S3", "ml"),
        "report_file": "classification_report_svm.txt",
    },
]

# Threshold akurasi "hampir sama"
ACC_THRESHOLD = 0.001

# ══════════════════════════════════════════════════════════════
#  HELPER
# ══════════════════════════════════════════════════════════════
def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""

def extract_float(text: str, patterns):
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE | re.MULTILINE)
        if m:
            return float(m.group(1))
    return None

def parse_report(path: Path) -> dict:
    text = read_text(path)
    if not text:
        return {}

    acc = extract_float(text, [
        r"(?m)^\s*accuracy\s+([\d.]+)",
        r"ACCURACY\s*[-]+\s*([\d.]+)",
    ])

    wm = re.search(r"(?m)^\s*weighted avg\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)", text)
    mm = re.search(r"(?m)^\s*macro avg\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)", text)

    return {
        "accuracy": acc,
        "f1_weighted": float(wm.group(3)) if wm else None,
        "f1_macro": float(mm.group(3)) if mm else None,
    }

def parse_runtimes(train_path: Path, eval_path: Path) -> dict:
    train_text = read_text(train_path)
    eval_text  = read_text(eval_path)

    train_rt = extract_float(train_text, [
        r"Fine-tuning\s*:\s*([\d.]+)\s*detik",
        r"Training SVM\s*:\s*([\d.]+)\s*detik",
        r"Runtime Train\s*:\s*([\d.]+)\s*detik",
        r"(?m)^Runtime\s*:\s*([\d.]+)\s*detik",
    ])

    eval_rt = extract_float(eval_text, [
        r"Total runtime\s*:\s*([\d.]+)\s*detik",
        r"Total eval\s*:\s*([\d.]+)\s*detik",
    ])

    # Beberapa file evaluasi menyebut runtime inferensi saja
    infer_rt = extract_float(eval_text, [
        r"Inferensi(?:\s+test)?\s*:\s*([\d.]+)\s*detik",
        r"Predict\s*:\s*([\d.]+)\s*detik",
        r"Runtime infer\s*:\s*([\d.]+)\s*detik",
    ])

    total_parts = [v for v in [train_rt, eval_rt] if v is not None]
    total_rt = sum(total_parts) if total_parts else None

    return {
        "train_rt": train_rt,
        "eval_rt": eval_rt if eval_rt is not None else infer_rt,
        "total_rt": total_rt if total_rt is not None else infer_rt,
    }

def fmt(v, d=4):
    if v is None or (isinstance(v, float) and np.isnan(v)):
        return "—"
    return f"{v:.{d}f}"

def pick_winner(a_acc, a_rt, b_acc, b_rt, a_label, b_label):
    """
    Pilih pemenang antara 2 model:
    1) accuracy lebih tinggi
    2) jika hampir sama, runtime lebih cepat
    """
    if a_acc is None and b_acc is None:
        return None, "tidak ada data accuracy"
    if a_acc is None:
        return b_label, f"{a_label} tidak punya data"
    if b_acc is None:
        return a_label, f"{b_label} tidak punya data"

    diff_acc = a_acc - b_acc

    if abs(diff_acc) >= ACC_THRESHOLD:
        winner = a_label if diff_acc > 0 else b_label
        reason = (
            f"accuracy lebih tinggi "
            f"({a_label}:{a_acc:.4f} vs {b_label}:{b_acc:.4f}, "
            f"selisih {abs(diff_acc):.4f})"
        )
    else:
        if a_rt is not None and b_rt is not None:
            winner = a_label if a_rt < b_rt else b_label
            reason = (
                f"accuracy hampir sama (selisih {abs(diff_acc):.4f} < {ACC_THRESHOLD}), "
                f"runtime lebih cepat ({a_label}:{a_rt:.2f}s vs {b_label}:{b_rt:.2f}s)"
            )
        else:
            winner = a_label if a_acc >= b_acc else b_label
            reason = "accuracy hampir sama, runtime tidak tersedia — fallback ke accuracy"

    return winner, reason

# ══════════════════════════════════════════════════════════════
#  KUMPULKAN SEMUA METRIK
# ══════════════════════════════════════════════════════════════
print("=" * 70)
print("  KOMPARASI MODEL — S1 DL vs S3 ML")
print("  Periode: before, covid, after")
print("=" * 70)

rows = []
missing = []

for period in PERIODS:
    for cfg in MODEL_CONFIGS:
        scenario, subdir = cfg["folder"]
        model_name = cfg["model"]
        report_file = cfg["report_file"]

        folder = MODEL_DIR / scenario / subdir / period
        report_path = folder / report_file
        train_info_path = folder / "train_info.txt"
        eval_info_path = folder / "evaluation_info.txt"

        metrics = parse_report(report_path)
        rts = parse_runtimes(train_info_path, eval_info_path)

        if not metrics or metrics.get("accuracy") is None:
            missing.append(str(report_path))
            continue

        rows.append({
            "period": period,
            "model": model_name,
            **metrics,
            **rts,
            "period_label": PERIOD_LABELS[period],
        })

if missing:
    print(f"\n⚠️  {len(missing)} file tidak ditemukan / tidak terbaca:")
    for m in missing:
        print(f"   - {m}")
    print()

if not rows:
    raise RuntimeError("Tidak ada data yang berhasil dibaca. Jalankan evaluasi model terlebih dahulu.")

df = pd.DataFrame(rows)

# Urutkan agar rapi
df["period"] = pd.Categorical(df["period"], categories=PERIODS, ordered=True)
df["model"] = pd.Categorical(df["model"], categories=[c["model"] for c in MODEL_CONFIGS], ordered=True)
df = df.sort_values(["period", "model"]).reset_index(drop=True)

print(f"✅ Total entri : {len(df)}\n")

# ══════════════════════════════════════════════════════════════
#  SIMPAN CSV — SESUAI FORMAT YANG DIMINTA
# ══════════════════════════════════════════════════════════════
csv_cols = [
    "period",
    "model",
    "accuracy",
    "f1_weighted",
    "f1_macro",
    "train_rt",
    "eval_rt",
    "total_rt",
    "period_label",
]

df_out = df[csv_cols].copy()
csv_path = OUTPUT_DIR / "tabel_komparasi.csv"
df_out.to_csv(csv_path, index=False, encoding="utf-8-sig")
print(f"✅ CSV disimpan : {csv_path.name}")

# ══════════════════════════════════════════════════════════════
#  ANALISIS PER PERIODE
# ══════════════════════════════════════════════════════════════
print("─" * 70)
print("  HASIL PERBANDINGAN PER PERIODE")
print("─" * 70)

period_winners = []

for period in PERIODS:
    sub = df[df["period"] == period].copy()
    if sub.empty:
        print(f"⚠️  {PERIOD_LABELS[period]}: data kosong")
        continue

    s1 = sub[sub["model"] == "S1 DL"]
    s3 = sub[sub["model"] == "S3 ML"]

    if s1.empty or s3.empty:
        print(f"⚠️  {PERIOD_LABELS[period]}: data S1 DL / S3 ML tidak lengkap")
        continue

    s1_row = s1.iloc[0]
    s3_row = s3.iloc[0]

    winner, reason = pick_winner(
        s1_row["accuracy"], s1_row["total_rt"],
        s3_row["accuracy"], s3_row["total_rt"],
        "S1 DL", "S3 ML"
    )

    period_winners.append({
        "period": period,
        "period_label": PERIOD_LABELS[period],
        "winner": winner,
        "reason": reason,
        "s1_acc": s1_row["accuracy"],
        "s3_acc": s3_row["accuracy"],
        "s1_rt": s1_row["total_rt"],
        "s3_rt": s3_row["total_rt"],
    })

    print(f"\n  [{PERIOD_LABELS[period]}]")
    print(f"   S1 DL : acc={s1_row['accuracy']:.4f} | f1w={s1_row['f1_weighted']:.4f} | f1m={s1_row['f1_macro']:.4f} | rt={fmt(s1_row['total_rt'], 2)}s")
    print(f"   S3 ML : acc={s3_row['accuracy']:.4f} | f1w={s3_row['f1_weighted']:.4f} | f1m={s3_row['f1_macro']:.4f} | rt={fmt(s3_row['total_rt'], 2)}s")
    print(f"   🏆 Pemenang: {winner}")
    print(f"   Alasan    : {reason}")

# ══════════════════════════════════════════════════════════════
#  TABEL TEKS
# ══════════════════════════════════════════════════════════════
txt_lines = []
txt_lines.append("TABEL KOMPARASI KINERJA MODEL — S1 DL vs S3 ML")
txt_lines.append("=" * 95)
txt_lines.append(
    f"{'Period':<16} {'Model':<10} {'Accuracy':>9} {'F1_w':>8} {'F1_m':>8} "
    f"{'TrainRt':>10} {'EvalRt':>10} {'TotalRt':>10}"
)
txt_lines.append("─" * 95)

for period in PERIODS:
    sub = df[df["period"] == period]
    for model_name in ["S1 DL", "S3 ML"]:
        r = sub[sub["model"] == model_name]
        if r.empty:
            continue
        r = r.iloc[0]
        txt_lines.append(
            f"{PERIOD_LABELS[period]:<16} {model_name:<10} "
            f"{fmt(r['accuracy']):>9} {fmt(r['f1_weighted']):>8} {fmt(r['f1_macro']):>8} "
            f"{fmt(r['train_rt'], 2):>10} {fmt(r['eval_rt'], 2):>10} {fmt(r['total_rt'], 2):>10}"
        )

txt_lines.append("─" * 95)
txt_lines.append("")
txt_lines.append("HASIL PEMENANG PER PERIODE")
txt_lines.append("─" * 95)

for item in period_winners:
    txt_lines.append(
        f"{item['period_label']}: {item['winner']} "
        f"(S1 Acc={item['s1_acc']:.4f}, S3 Acc={item['s3_acc']:.4f})"
    )

txt_lines.append("─" * 95)

txt_path = OUTPUT_DIR / "tabel_komparasi.txt"
txt_path.write_text("\n".join(txt_lines), encoding="utf-8")
print(f"✅ TXT disimpan : {txt_path.name}")

# ══════════════════════════════════════════════════════════════
#  GRAFIK AKURASI
# ══════════════════════════════════════════════════════════════
combo_labels = [PERIOD_LABELS[p] for p in PERIODS]
x = np.arange(len(PERIODS))
w = 0.35

def get_metric_values(metric):
    s1_vals, s3_vals = [], []
    for p in PERIODS:
        s1 = df[(df["period"] == p) & (df["model"] == "S1 DL")]
        s3 = df[(df["period"] == p) & (df["model"] == "S3 ML")]
        s1_vals.append(float(s1.iloc[0][metric]) if not s1.empty and pd.notna(s1.iloc[0][metric]) else np.nan)
        s3_vals.append(float(s3.iloc[0][metric]) if not s3.empty and pd.notna(s3.iloc[0][metric]) else np.nan)
    return s1_vals, s3_vals

def annotate_bars(ax, bars, suffix=""):
    for bar in bars:
        h = bar.get_height()
        if not np.isnan(h) and h > 0:
            ax.text(
                bar.get_x() + bar.get_width() / 2,
                h + (0.003 if suffix == "" else 0.15),
                f"{h:.4f}{suffix}",
                ha="center",
                va="bottom",
                fontsize=8,
                rotation=90 if suffix == "" else 0
            )

# Accuracy chart
s1_acc, s3_acc = get_metric_values("accuracy")
fig, ax = plt.subplots(figsize=(14, 6))
b1 = ax.bar(x - w/2, s1_acc, w, label="S1 DL", color="#3498db", alpha=0.85)
b2 = ax.bar(x + w/2, s3_acc, w, label="S3 ML", color="#e74c3c", alpha=0.85)
annotate_bars(ax, b1)
annotate_bars(ax, b2)
ax.set_xlabel("Periode")
ax.set_ylabel("Accuracy")
ax.set_title("Perbandingan Accuracy — S1 DL vs S3 ML")
ax.set_xticks(x)
ax.set_xticklabels(combo_labels, rotation=20, ha="right")
ax.set_ylim([0, 1.1])
ax.yaxis.set_major_locator(mticker.MultipleLocator(0.1))
ax.legend()
ax.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "grafik_akurasi.png", dpi=150, bbox_inches="tight")
plt.close()
print("✅ Grafik disimpan : grafik_akurasi.png")

# Runtime chart
s1_rt, s3_rt = get_metric_values("total_rt")
fig, ax = plt.subplots(figsize=(14, 6))
b1 = ax.bar(x - w/2, s1_rt, w, label="S1 DL", color="#3498db", alpha=0.85)
b2 = ax.bar(x + w/2, s3_rt, w, label="S3 ML", color="#e74c3c", alpha=0.85)
for bar in b1:
    h = bar.get_height()
    if not np.isnan(h) and h > 0:
        ax.text(bar.get_x() + bar.get_width()/2, h + 0.15, f"{h:.2f}s", ha="center", va="bottom", fontsize=8)
for bar in b2:
    h = bar.get_height()
    if not np.isnan(h) and h > 0:
        ax.text(bar.get_x() + bar.get_width()/2, h + 0.15, f"{h:.2f}s", ha="center", va="bottom", fontsize=8)
ax.set_xlabel("Periode")
ax.set_ylabel("Total Runtime (detik)")
ax.set_title("Perbandingan Runtime — S1 DL vs S3 ML")
ax.set_xticks(x)
ax.set_xticklabels(combo_labels, rotation=20, ha="right")
ax.legend()
ax.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "grafik_runtime.png", dpi=150, bbox_inches="tight")
plt.close()
print("✅ Grafik disimpan : grafik_runtime.png")

# ══════════════════════════════════════════════════════════════
#  RINGKASAN TEKS
# ══════════════════════════════════════════════════════════════
sep = "=" * 70
summary_lines = [
    "RINGKASAN KOMPARASI MODEL — S1 DL vs S3 ML",
    sep,
    f"Tanggal    : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    "",
    "Kolom CSV yang disimpan:",
    "period, model, accuracy, f1_weighted, f1_macro, train_rt, eval_rt, total_rt, period_label",
    "",
    "HASIL PER PERIODE:",
]

for item in period_winners:
    summary_lines.append(
        f"- {item['period_label']}: {item['winner']} "
        f"({item['reason']})"
    )

summary_lines += [
    "",
    "DATA YANG DISIMPAN:",
    sep,
]

for _, r in df_out.iterrows():
    summary_lines.append(
        f"{r['period_label']:<16} | {r['model']:<6} | "
        f"acc={fmt(r['accuracy'])} | "
        f"f1w={fmt(r['f1_weighted'])} | "
        f"f1m={fmt(r['f1_macro'])} | "
        f"train_rt={fmt(r['train_rt'], 2)} | "
        f"eval_rt={fmt(r['eval_rt'], 2)} | "
        f"total_rt={fmt(r['total_rt'], 2)}"
    )

summary_text = "\n".join(summary_lines)
(OUTPUT_DIR / "ringkasan_komparasi.txt").write_text(summary_text, encoding="utf-8")
print("✅ Ringkasan disimpan : ringkasan_komparasi.txt")

# ══════════════════════════════════════════════════════════════
#  TERMINAL SUMMARY
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*70}")
print("  ✅ Komparasi selesai!")
print(f"{'='*70}")
print(f"  📊 tabel_komparasi.csv")
print(f"  📄 tabel_komparasi.txt")
print(f"  🖼  grafik_akurasi.png")
print(f"  🖼  grafik_runtime.png")
print(f"  📄 ringkasan_komparasi.txt")
print(f"{'='*70}")

print("\n  Pemenang per periode:")
for item in period_winners:
    print(f"   {item['period_label']:<16} → {item['winner']}")

print(f"\n  ➡  Lanjut ke: output CSV di folder {OUTPUT_DIR}")