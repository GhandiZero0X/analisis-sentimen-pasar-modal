# services/development/devKomparasi.py
"""
=============================================================
KOMPARASI MODEL: SVM vs IndoBERTweet
=============================================================
Tujuan:
  Membandingkan kinerja SVM dan IndoBERTweet pada:
    - Accuracy (dari confusion matrix / classification report)
    - Runtime (training + evaluasi)

Output:
  dev_database/5_komparasi/
    - tabel_komparasi.csv
    - tabel_komparasi.txt
    - grafik_akurasi.png
    - grafik_runtime.png
    - ringkasan_komparasi.txt

Catatan:
  - Chart disederhanakan menjadi 2 saja:
      1) Accuracy
      2) Runtime
  - Detail lengkap (precision, recall, f1, runtime breakdown)
    disimpan di TXT.
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
#  PATH CONFIGURATION
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
MODEL_DIR  = BASE_DIR / "dev_database" / "4_model" 
OUTPUT_DIR = BASE_DIR / "dev_database" / "5_komparasi_2"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PERIODS = ["before", "covid", "after", "all_periods"]
PERIOD_LABELS = {
    "before": "Sebelum COVID",
    "covid": "Masa COVID",
    "after": "Setelah COVID",
    "all_periods": "Semua Periode",
}

MODEL_LABELS = {
    "SVM": "SVM",
    "DL": "IndoBERTweet",
}

# ══════════════════════════════════════════════════════════════
#  HELPER
# ══════════════════════════════════════════════════════════════
def read_text_if_exists(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")

def extract_float(text: str, pattern: str):
    m = re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE)
    return float(m.group(1)) if m else None

def parse_classification_report(filepath: Path) -> dict:
    """
    Ambil metrik dari classification_report_*.txt.
    Mendukung format sklearn classification_report.
    """
    if not filepath.exists():
        return {}

    text = filepath.read_text(encoding="utf-8")

    # accuracy bisa ada dalam format sklearn report atau format custom
    accuracy = extract_float(text, r"(?m)^\s*accuracy\s+([\d.]+)")
    if accuracy is None:
        accuracy = extract_float(text, r"ACCURACY\s*[-]+\s*([\d.]+)")

    # weighted avg dan macro avg
    weighted = re.search(
        r"(?m)^\s*weighted avg\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)",
        text
    )
    macro = re.search(
        r"(?m)^\s*macro avg\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)",
        text
    )

    precision_w = float(weighted.group(1)) if weighted else None
    recall_w    = float(weighted.group(2)) if weighted else None
    f1_w        = float(weighted.group(3)) if weighted else None

    precision_m = float(macro.group(1)) if macro else None
    recall_m    = float(macro.group(2)) if macro else None
    f1_m        = float(macro.group(3)) if macro else None

    return {
        "accuracy": accuracy,
        "precision_weighted": precision_w,
        "recall_weighted": recall_w,
        "f1_weighted": f1_w,
        "precision_macro": precision_m,
        "recall_macro": recall_m,
        "f1_macro": f1_m,
    }

def parse_train_info(filepath: Path) -> dict:
    """
    Ambil runtime training dari train_info.txt.
    """
    text = read_text_if_exists(filepath)
    if not text:
        return {}

    fine_tuning = extract_float(text, r"Fine-tuning\s*:\s*([\d.]+)\s*detik")
    total_rt    = extract_float(text, r"Total runtime\s*:\s*([\d.]+)\s*detik")
    load_model  = extract_float(text, r"Load model\s*:\s*([\d.]+)\s*detik")

    return {
        "train_runtime": fine_tuning,
        "train_total_runtime": total_rt,
        "load_runtime_traininfo": load_model,
    }

def parse_eval_info(filepath: Path) -> dict:
    """
    Ambil runtime evaluasi dari evaluation_info.txt.
    """
    text = read_text_if_exists(filepath)
    if not text:
        return {}

    load_model  = extract_float(text, r"Load model\s*:\s*([\d.]+)\s*detik")
    infer_time  = extract_float(text, r"Inferensi(?: test)?\s*:\s*([\d.]+)\s*detik")
    cm_time     = extract_float(text, r"Plot CM\s*:\s*([\d.]+)\s*detik")
    curve_time  = extract_float(text, r"Plot curve\s*:\s*([\d.]+)\s*detik")
    total_rt    = extract_float(text, r"Total runtime\s*:\s*([\d.]+)\s*detik")

    # fallback untuk variasi penulisan
    if infer_time is None:
        infer_time = extract_float(text, r"Inferensi test\s*:\s*([\d.]+)\s*detik")

    return {
        "load_runtime_eval": load_model,
        "infer_runtime": infer_time,
        "plot_cm_runtime": cm_time,
        "plot_curve_runtime": curve_time,
        "eval_total_runtime": total_rt,
    }

def safe_sum(*values):
    vals = [v for v in values if v is not None]
    return sum(vals) if vals else None

def format_num(v, digits=4):
    if v is None or (isinstance(v, float) and np.isnan(v)):
        return "—"
    return f"{v:.{digits}f}"

# ══════════════════════════════════════════════════════════════
#  KUMPULKAN METRIK
# ══════════════════════════════════════════════════════════════
print("=" * 62)
print("  KOMPARASI MODEL — SVM vs IndoBERTweet")
print("=" * 62)
print(f"\n📂 Input  : {MODEL_DIR}")
print(f"📂 Output : {OUTPUT_DIR}\n")

rows = []

for period in PERIODS:
    period_label = PERIOD_LABELS[period]

    svm_dir = MODEL_DIR / "ml" / period
    dl_dir  = MODEL_DIR / "dl" / period

    svm_report = svm_dir / "classification_report_svm.txt"
    svm_train  = svm_dir / "train_info.txt"
    svm_eval   = svm_dir / "evaluation_info.txt"

    dl_report  = dl_dir / "classification_report_indobertweet.txt"
    dl_train   = dl_dir / "train_info.txt"
    dl_eval    = dl_dir / "evaluation_info.txt"

    svm_metrics = parse_classification_report(svm_report)
    svm_train_i = parse_train_info(svm_train)
    svm_eval_i  = parse_eval_info(svm_eval)

    dl_metrics = parse_classification_report(dl_report)
    dl_train_i = parse_train_info(dl_train)
    dl_eval_i  = parse_eval_info(dl_eval)

    if not svm_metrics:
        print(f"⚠️  SVM report tidak ditemukan: {svm_report}")
    if not dl_metrics:
        print(f"⚠️  DL report tidak ditemukan : {dl_report}")

    def build_row(model_name: str, metrics: dict, train_i: dict, eval_i: dict):
        train_runtime = train_i.get("train_runtime")
        eval_runtime  = eval_i.get("eval_total_runtime")
        end_to_end    = safe_sum(train_runtime, eval_runtime)

        return {
            "periode": period_label,
            "model": model_name,
            "accuracy": metrics.get("accuracy"),
            "precision_weighted": metrics.get("precision_weighted"),
            "recall_weighted": metrics.get("recall_weighted"),
            "f1_weighted": metrics.get("f1_weighted"),
            "precision_macro": metrics.get("precision_macro"),
            "recall_macro": metrics.get("recall_macro"),
            "f1_macro": metrics.get("f1_macro"),
            "train_runtime": train_runtime,
            "eval_runtime": eval_runtime,
            "end_to_end_runtime": end_to_end,
            "load_runtime": eval_i.get("load_runtime_eval") or train_i.get("load_runtime_traininfo"),
            "infer_runtime": eval_i.get("infer_runtime"),
            "plot_cm_runtime": eval_i.get("plot_cm_runtime"),
            "plot_curve_runtime": eval_i.get("plot_curve_runtime"),
        }

    if svm_metrics:
        rows.append(build_row("SVM", svm_metrics, svm_train_i, svm_eval_i))
    if dl_metrics:
        rows.append(build_row("IndoBERTweet", dl_metrics, dl_train_i, dl_eval_i))

df = pd.DataFrame(rows)

if df.empty:
    raise RuntimeError("Tidak ada data komparasi yang berhasil dibaca.")

# urutkan
df["periode"] = pd.Categorical(
    df["periode"],
    categories=[PERIOD_LABELS[p] for p in PERIODS],
    ordered=True,
)
df["model"] = pd.Categorical(
    df["model"],
    categories=["SVM", "IndoBERTweet"],
    ordered=True,
)
df = df.sort_values(["periode", "model"]).reset_index(drop=True)

print("✅ Data terkumpul:\n")
print(df.to_string(index=False))

# ══════════════════════════════════════════════════════════════
#  SIMPAN CSV
# ══════════════════════════════════════════════════════════════
csv_path = OUTPUT_DIR / "tabel_komparasi.csv"
df.to_csv(csv_path, index=False, encoding="utf-8-sig")
print(f"\n✅ CSV disimpan : {csv_path.name}")

# ══════════════════════════════════════════════════════════════
#  SIMPAN TXT LENGKAP
# ══════════════════════════════════════════════════════════════
txt_lines = [
    "TABEL KOMPARASI KINERJA MODEL",
    "=" * 95,
    f"{'Periode':<18} {'Model':<15} {'Acc':>7} {'F1w':>7} {'F1m':>7} "
    f"{'TrainRt':>10} {'EvalRt':>10} {'TotalRt':>10}",
    "─" * 95,
]

for _, row in df.iterrows():
    txt_lines.append(
        f"{row['periode']:<18} {row['model']:<15} "
        f"{format_num(row['accuracy']):>7} "
        f"{format_num(row['f1_weighted']):>7} "
        f"{format_num(row['f1_macro']):>7} "
        f"{format_num(row['train_runtime']):>10} "
        f"{format_num(row['eval_runtime']):>10} "
        f"{format_num(row['end_to_end_runtime']):>10}"
    )

txt_lines += [
    "─" * 95,
    "",
    "Keterangan:",
    "Acc      = accuracy dari confusion matrix / classification report",
    "F1w      = weighted F1",
    "F1m      = macro F1",
    "TrainRt  = runtime training",
    "EvalRt   = runtime evaluasi",
    "TotalRt  = TrainRt + EvalRt",
]

txt_path = OUTPUT_DIR / "tabel_komparasi.txt"
txt_path.write_text("\n".join(txt_lines), encoding="utf-8")
print(f"✅ TXT disimpan : {txt_path.name}")

# ══════════════════════════════════════════════════════════════
#  GRAFIK 1: AKURASI
# ══════════════════════════════════════════════════════════════
period_labels_list = [PERIOD_LABELS[p] for p in PERIODS]
x = np.arange(len(period_labels_list))
width = 0.35

svm_acc = (
    df[df["model"] == "SVM"]
    .sort_values("periode")["accuracy"]
    .tolist()
)
dl_acc = (
    df[df["model"] == "IndoBERTweet"]
    .sort_values("periode")["accuracy"]
    .tolist()
)

fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width / 2, svm_acc, width, label="SVM", alpha=0.85)
bars2 = ax.bar(x + width / 2, dl_acc, width, label="IndoBERTweet", alpha=0.85)

for bar in bars1:
    ax.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 0.005,
        f"{bar.get_height():.4f}",
        ha="center", va="bottom", fontsize=9
    )
for bar in bars2:
    ax.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 0.005,
        f"{bar.get_height():.4f}",
        ha="center", va="bottom", fontsize=9
    )

ax.set_xlabel("Periode")
ax.set_ylabel("Accuracy")
ax.set_title("Perbandingan Accuracy: SVM vs IndoBERTweet")
ax.set_xticks(x)
ax.set_xticklabels(period_labels_list, rotation=10, ha="right")
ax.set_ylim([0, 1.1])
ax.legend()
ax.grid(axis="y", alpha=0.3)
ax.yaxis.set_major_locator(mticker.MultipleLocator(0.1))

plt.tight_layout()
plt.savefig(OUTPUT_DIR / "grafik_akurasi.png", dpi=150, bbox_inches="tight")
plt.close()
print("✅ Grafik disimpan : grafik_akurasi.png")

# ══════════════════════════════════════════════════════════════
#  GRAFIK 2: RUNTIME
#  (dipakai total runtime end-to-end = training + evaluasi)
# ══════════════════════════════════════════════════════════════
svm_rt = (
    df[df["model"] == "SVM"]
    .sort_values("periode")["end_to_end_runtime"]
    .tolist()
)
dl_rt = (
    df[df["model"] == "IndoBERTweet"]
    .sort_values("periode")["end_to_end_runtime"]
    .tolist()
)

fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width / 2, svm_rt, width, label="SVM", alpha=0.85)
bars2 = ax.bar(x + width / 2, dl_rt, width, label="IndoBERTweet", alpha=0.85)

for bar in bars1:
    ax.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 0.02,
        f"{bar.get_height():.2f}",
        ha="center", va="bottom", fontsize=9
    )
for bar in bars2:
    ax.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 0.02,
        f"{bar.get_height():.2f}",
        ha="center", va="bottom", fontsize=9
    )

ax.set_xlabel("Periode")
ax.set_ylabel("Runtime (detik)")
ax.set_title("Perbandingan Runtime End-to-End: SVM vs IndoBERTweet")
ax.set_xticks(x)
ax.set_xticklabels(period_labels_list, rotation=10, ha="right")
ax.legend()
ax.grid(axis="y", alpha=0.3)

plt.tight_layout()
plt.savefig(OUTPUT_DIR / "grafik_runtime.png", dpi=150, bbox_inches="tight")
plt.close()
print("✅ Grafik disimpan : grafik_runtime.png")

# ══════════════════════════════════════════════════════════════
#  RINGKASAN OTOMATIS
# ══════════════════════════════════════════════════════════════
summary_lines = [
    "RINGKASAN KOMPARASI — SVM vs IndoBERTweet",
    "=" * 70,
    f"Tanggal : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    "",
    "PRIORITAS PEMILIHAN MODEL:",
    "1) Accuracy dari confusion matrix",
    "2) Runtime (semakin kecil semakin baik)",
    "",
    "HASIL PER PERIODE:",
    "─" * 70,
]

svm_win = 0
dl_win = 0

for period in PERIODS:
    label = PERIOD_LABELS[period]
    svm_row = df[(df["periode"] == label) & (df["model"] == "SVM")]
    dl_row  = df[(df["periode"] == label) & (df["model"] == "IndoBERTweet")]

    if svm_row.empty or dl_row.empty:
        continue

    s = svm_row.iloc[0]
    d = dl_row.iloc[0]

    # Prioritas: accuracy dulu, runtime sebagai penentu jika sangat dekat
    acc_diff = float(s["accuracy"]) - float(d["accuracy"])
    rt_diff  = float(s["end_to_end_runtime"]) - float(d["end_to_end_runtime"])

    if abs(acc_diff) >= 0.001:
        winner = "SVM" if acc_diff > 0 else "IndoBERTweet"
        reason = f"accuracy lebih tinggi ({abs(acc_diff):.4f})"
    else:
        winner = "SVM" if rt_diff < 0 else "IndoBERTweet"
        reason = f"accuracy hampir sama, runtime lebih cepat ({abs(rt_diff):.2f} detik)"

    if winner == "SVM":
        svm_win += 1
    else:
        dl_win += 1

    summary_lines += [
        f"\n[{label}]",
        f"SVM          → Acc: {s['accuracy']:.4f} | F1m: {s['f1_macro']:.4f} | Runtime: {s['end_to_end_runtime']:.2f} detik",
        f"IndoBERTweet → Acc: {d['accuracy']:.4f} | F1m: {d['f1_macro']:.4f} | Runtime: {d['end_to_end_runtime']:.2f} detik",
        f"Rekomendasi  : {winner} ({reason})",
    ]

summary_lines += [
    "",
    "─" * 70,
    "KESIMPULAN KESELURUHAN:",
    f"SVM unggul di          : {svm_win} periode",
    f"IndoBERTweet unggul di : {dl_win} periode",
]

# overall recommendation from all_periods
overall_svm = df[(df["periode"] == PERIOD_LABELS["all_periods"]) & (df["model"] == "SVM")]
overall_dl  = df[(df["periode"] == PERIOD_LABELS["all_periods"]) & (df["model"] == "IndoBERTweet")]

if not overall_svm.empty and not overall_dl.empty:
    s = overall_svm.iloc[0]
    d = overall_dl.iloc[0]

    acc_diff = float(s["accuracy"]) - float(d["accuracy"])
    rt_diff  = float(s["end_to_end_runtime"]) - float(d["end_to_end_runtime"])

    if abs(acc_diff) >= 0.001:
        overall_best = "SVM" if acc_diff > 0 else "IndoBERTweet"
    else:
        overall_best = "SVM" if rt_diff < 0 else "IndoBERTweet"

    summary_lines += [
        "",
        "MODEL TERBAIK OVERALL:",
        f"{overall_best}",
        "",
        "Alasan ringkas:",
        f"- Accuracy SVM         : {s['accuracy']:.4f}",
        f"- Accuracy IndoBERTweet: {d['accuracy']:.4f}",
        f"- Runtime SVM          : {s['end_to_end_runtime']:.2f} detik",
        f"- Runtime IndoBERTweet : {d['end_to_end_runtime']:.2f} detik",
    ]

summary_lines.append("=" * 70)

summary_text = "\n".join(summary_lines)
summary_path = OUTPUT_DIR / "ringkasan_komparasi.txt"
summary_path.write_text(summary_text, encoding="utf-8")

print("\n" + summary_text)

# ══════════════════════════════════════════════════════════════
#  FINAL
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*70}")
print("  ✅ Komparasi selesai!")
print(f"{'='*70}")
print("  📊 tabel_komparasi.csv")
print("  📄 tabel_komparasi.txt")
print("  🖼  grafik_akurasi.png")
print("  🖼  grafik_runtime.png")
print("  📄 ringkasan_komparasi.txt")
print(f"{'='*70}")