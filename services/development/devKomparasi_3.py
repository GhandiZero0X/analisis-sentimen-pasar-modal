# services/development/devKomparasi.py
"""
=============================================================
KOMPARASI MODEL: SVM vs IndoBERTweet
=============================================================
Tujuan:
  Membandingkan kinerja SVM dan IndoBERTweet berdasarkan:
    1) Accuracy
    2) Runtime

Cakupan:
  - Semua scenario: S1, S2, S3
  - Semua periode  : before, covid, after, all_periods

Struktur folder input:
  dev_database/4_model/
    S1/
      ml/
        before/
        covid/
        after/
        all_periods/
      dl/
        before/
        covid/
        after/
        all_periods/
    S2/
      ml/
        before/
        covid/
        after/
        all_periods/
      dl/
        before/
        covid/
        after/
        all_periods/
    S3/
      ml/
        before/
        covid/
        after/
        all_periods/
      dl/
        before/
        covid/
        after/
        all_periods/

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
  - Keputusan pemenang memakai:
      1) accuracy lebih tinggi
      2) jika accuracy hampir sama, runtime lebih cepat
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
OUTPUT_DIR = BASE_DIR / "dev_database" / "5_komparasi_3"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SCENARIOS = ["S1", "S2", "S3"]
PERIODS   = ["before", "covid", "after", "all_periods"]
COMPARISON_PERIODS = ["before", "covid", "after"]

SCENARIO_LABELS = {
    "S1": "Scenario 1",
    "S2": "Scenario 2",
    "S3": "Scenario 3",
}

PERIOD_LABELS = {
    "before": "Before",
    "covid": "Covid",
    "after": "After",
    "all_periods": "All Periods",
}

MODEL_NAMES = ["SVM", "IndoBERTweet"]

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

def first_float(text: str, patterns: list[str]):
    for p in patterns:
        v = extract_float(text, p)
        if v is not None:
            return v
    return None

def parse_classification_report(filepath: Path) -> dict:
    if not filepath.exists():
        return {}

    text = filepath.read_text(encoding="utf-8")

    accuracy = extract_float(text, r"(?m)^\s*accuracy\s+([\d.]+)")
    if accuracy is None:
        accuracy = extract_float(text, r"ACCURACY\s*[-]+\s*([\d.]+)")

    weighted = re.search(
        r"(?m)^\s*weighted avg\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)",
        text
    )
    macro = re.search(
        r"(?m)^\s*macro avg\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)",
        text
    )

    return {
        "accuracy": accuracy,
        "precision_weighted": float(weighted.group(1)) if weighted else None,
        "recall_weighted": float(weighted.group(2)) if weighted else None,
        "f1_weighted": float(weighted.group(3)) if weighted else None,
        "precision_macro": float(macro.group(1)) if macro else None,
        "recall_macro": float(macro.group(2)) if macro else None,
        "f1_macro": float(macro.group(3)) if macro else None,
    }

def parse_train_info(filepath: Path) -> dict:
    text = read_text_if_exists(filepath)
    if not text:
        return {}

    fine_tuning = first_float(text, [
        r"Fine-tuning\s*:\s*([\d.]+)\s*detik",
        r"Training SVM\s*:\s*([\d.]+)\s*detik",
        r"Runtime Train\s*:\s*([\d.]+)\s*detik",
        r"Runtime training\s*:\s*([\d.]+)\s*detik",
        r"Runtime\s*:\s*([\d.]+)\s*detik",
    ])

    total_rt = first_float(text, [
        r"Total runtime\s*:\s*([\d.]+)\s*detik",
        r"Total Runtime\s*:\s*([\d.]+)\s*detik",
        r"Total eval\s*:\s*([\d.]+)\s*detik",
    ])

    load_model = first_float(text, [
        r"Load model\s*:\s*([\d.]+)\s*detik",
        r"Runtime loading\s*:\s*([\d.]+)\s*detik",
        r"Runtime load\s*:\s*([\d.]+)\s*detik",
    ])

    return {
        "train_runtime": fine_tuning,
        "train_total_runtime": total_rt,
        "load_runtime_traininfo": load_model,
    }

def parse_eval_info(filepath: Path) -> dict:
    text = read_text_if_exists(filepath)
    if not text:
        return {}

    load_model = first_float(text, [
        r"Load model\s*:\s*([\d.]+)\s*detik",
        r"Runtime load\s*:\s*([\d.]+)\s*detik",
        r"Runtime loading\s*:\s*([\d.]+)\s*detik",
    ])

    infer_time = first_float(text, [
        r"Inferensi(?: test)?\s*:\s*([\d.]+)\s*detik",
        r"Predict\s*:\s*([\d.]+)\s*detik",
        r"Runtime infer\s*:\s*([\d.]+)\s*detik",
        r"Runtime predict\s*:\s*([\d.]+)\s*detik",
    ])

    cm_time = first_float(text, [
        r"Plot CM\s*:\s*([\d.]+)\s*detik",
        r"Runtime cm\s*:\s*([\d.]+)\s*detik",
        r"Runtime CM\s*:\s*([\d.]+)\s*detik",
    ])

    curve_time = first_float(text, [
        r"Plot curve\s*:\s*([\d.]+)\s*detik",
        r"Runtime curve\s*:\s*([\d.]+)\s*detik",
        r"Runtime plot curve\s*:\s*([\d.]+)\s*detik",
    ])

    total_rt = first_float(text, [
        r"Total runtime\s*:\s*([\d.]+)\s*detik",
        r"Total eval\s*:\s*([\d.]+)\s*detik",
        r"Total runtime\s*:\s*([\d.]+)\s*detik",
    ])

    if total_rt is None:
        parts = [v for v in [load_model, infer_time, cm_time, curve_time] if v is not None]
        total_rt = sum(parts) if parts else None

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

def pick_winner(svm_row: pd.Series, dl_row: pd.Series):
    """
    Prioritas:
      1) accuracy lebih tinggi
      2) jika hampir sama, runtime lebih cepat
    """
    acc_diff = float(svm_row["accuracy"]) - float(dl_row["accuracy"])
    rt_diff  = float(svm_row["end_to_end_runtime"]) - float(dl_row["end_to_end_runtime"])

    if abs(acc_diff) >= 0.001:
        winner = "SVM" if acc_diff > 0 else "IndoBERTweet"
        reason = f"accuracy lebih tinggi ({abs(acc_diff):.4f})"
    else:
        winner = "SVM" if rt_diff < 0 else "IndoBERTweet"
        reason = f"accuracy hampir sama, runtime lebih cepat ({abs(rt_diff):.2f} detik)"

    return winner, reason, acc_diff, rt_diff

# ══════════════════════════════════════════════════════════════
#  KUMPULKAN METRIK
# ══════════════════════════════════════════════════════════════
print("=" * 62)
print("  KOMPARASI MODEL — SVM vs IndoBERTweet")
print("=" * 62)
print(f"\n📂 Input  : {MODEL_DIR}")
print(f"📂 Output : {OUTPUT_DIR}\n")

rows = []

for scenario in SCENARIOS:
    for period in PERIODS:
        for model_name in MODEL_NAMES:
            model_subdir = "ml" if model_name == "SVM" else "dl"
            report_name  = "classification_report_svm.txt" if model_name == "SVM" else "classification_report_indobertweet.txt"

            folder = MODEL_DIR / scenario / model_subdir / period

            report_path = folder / report_name
            train_path  = folder / "train_info.txt"
            eval_path   = folder / "evaluation_info.txt"

            metrics = parse_classification_report(report_path)
            train_i = parse_train_info(train_path)
            eval_i  = parse_eval_info(eval_path)

            if not metrics:
                print(f"⚠️  Report tidak ditemukan: {report_path}")
                continue

            train_runtime = train_i.get("train_runtime")
            eval_runtime  = eval_i.get("eval_total_runtime")
            end_to_end    = safe_sum(train_runtime, eval_runtime)

            rows.append({
                "scenario_key": scenario,
                "scenario": SCENARIO_LABELS[scenario],
                "period_key": period,
                "period": PERIOD_LABELS[period],
                "combo": f"{SCENARIO_LABELS[scenario]} | {PERIOD_LABELS[period]}",
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
            })

df = pd.DataFrame(rows)

if df.empty:
    raise RuntimeError("Tidak ada data komparasi yang berhasil dibaca.")

df["scenario_rank"] = df["scenario_key"].map({s: i for i, s in enumerate(SCENARIOS)})
df["period_rank"]   = df["period_key"].map({p: i for i, p in enumerate(PERIODS)})
df["model_rank"]    = df["model"].map({"SVM": 0, "IndoBERTweet": 1})

df = df.sort_values(["scenario_rank", "period_rank", "model_rank"]).reset_index(drop=True)

# Filter untuk comparison (exclude all_periods)
comparison_df = df[df["period_key"].isin(COMPARISON_PERIODS)].reset_index(drop=True)

if comparison_df.empty:
    raise RuntimeError("Tidak ada data untuk periode before/covid/after yang berhasil dibaca.")

print("✅ Data terkumpul:\n")
print(df[[
    "scenario", "period", "model", "accuracy", "f1_weighted", "f1_macro",
    "train_runtime", "eval_runtime", "end_to_end_runtime"
]].to_string(index=False))

# ══════════════════════════════════════════════════════════════
#  WINNER PER COMBO
# ══════════════════════════════════════════════════════════════
combo_results = []
winner_map = {}

for (scenario_key, period_key), grp in comparison_df.groupby(["scenario_key", "period_key"], sort=False):
    if set(grp["model"]) != set(MODEL_NAMES):
        continue

    svm_row = grp[grp["model"] == "SVM"].iloc[0]
    dl_row  = grp[grp["model"] == "IndoBERTweet"].iloc[0]

    winner, reason, acc_diff, rt_diff = pick_winner(svm_row, dl_row)

    winner_map[(scenario_key, period_key)] = winner

    combo_results.append({
        "scenario": SCENARIO_LABELS[scenario_key],
        "period": PERIOD_LABELS[period_key],
        "combo": f"{SCENARIO_LABELS[scenario_key]} | {PERIOD_LABELS[period_key]}",
        "svm_accuracy": float(svm_row["accuracy"]),
        "dl_accuracy": float(dl_row["accuracy"]),
        "svm_runtime": float(svm_row["end_to_end_runtime"]),
        "dl_runtime": float(dl_row["end_to_end_runtime"]),
        "winner": winner,
        "reason": reason,
        "accuracy_diff": acc_diff,
        "runtime_diff": rt_diff,
    })

df["is_winner"] = df.apply(
    lambda r: r["model"] == winner_map.get((r["scenario_key"], r["period_key"])),
    axis=1
)

# Add is_winner column to comparison_df as well
comparison_df["is_winner"] = comparison_df.apply(
    lambda r: r["model"] == winner_map.get((r["scenario_key"], r["period_key"])),
    axis=1
)

combo_df = pd.DataFrame(combo_results)

# ══════════════════════════════════════════════════════════════
#  AGGREGATE PER SCENARIO
# ══════════════════════════════════════════════════════════════
scenario_rows = []

for scenario_key in SCENARIOS:
    s_label = SCENARIO_LABELS[scenario_key]
    grp = comparison_df[comparison_df["scenario_key"] == scenario_key]

    svm_grp = grp[grp["model"] == "SVM"]
    dl_grp  = grp[grp["model"] == "IndoBERTweet"]

    if svm_grp.empty or dl_grp.empty:
        continue

    svm_mean = {
        "accuracy": svm_grp["accuracy"].mean(),
        "f1_weighted": svm_grp["f1_weighted"].mean(),
        "f1_macro": svm_grp["f1_macro"].mean(),
        "runtime": svm_grp["end_to_end_runtime"].mean(),
    }
    dl_mean = {
        "accuracy": dl_grp["accuracy"].mean(),
        "f1_weighted": dl_grp["f1_weighted"].mean(),
        "f1_macro": dl_grp["f1_macro"].mean(),
        "runtime": dl_grp["end_to_end_runtime"].mean(),
    }

    if abs(svm_mean["accuracy"] - dl_mean["accuracy"]) >= 0.001:
        scenario_winner = "SVM" if svm_mean["accuracy"] > dl_mean["accuracy"] else "IndoBERTweet"
        scenario_reason = f"mean accuracy lebih tinggi ({abs(svm_mean['accuracy'] - dl_mean['accuracy']):.4f})"
    else:
        scenario_winner = "SVM" if svm_mean["runtime"] < dl_mean["runtime"] else "IndoBERTweet"
        scenario_reason = f"mean accuracy hampir sama, runtime lebih cepat ({abs(svm_mean['runtime'] - dl_mean['runtime']):.2f} detik)"

    scenario_rows.append({
        "scenario": s_label,
        "svm_mean_accuracy": svm_mean["accuracy"],
        "dl_mean_accuracy": dl_mean["accuracy"],
        "svm_mean_runtime": svm_mean["runtime"],
        "dl_mean_runtime": dl_mean["runtime"],
        "winner": scenario_winner,
        "reason": scenario_reason,
    })

scenario_df = pd.DataFrame(scenario_rows)

# ══════════════════════════════════════════════════════════════
#  AGGREGATE OVERALL MODEL
# ══════════════════════════════════════════════════════════════
overall_model_df = comparison_df.groupby("model", as_index=False).agg(
    mean_accuracy=("accuracy", "mean"),
    mean_precision_weighted=("precision_weighted", "mean"),
    mean_recall_weighted=("recall_weighted", "mean"),
    mean_f1_weighted=("f1_weighted", "mean"),
    mean_precision_macro=("precision_macro", "mean"),
    mean_recall_macro=("recall_macro", "mean"),
    mean_f1_macro=("f1_macro", "mean"),
    mean_train_runtime=("train_runtime", "mean"),
    mean_eval_runtime=("eval_runtime", "mean"),
    mean_total_runtime=("end_to_end_runtime", "mean"),
    win_count=("is_winner", "sum"),
)

overall_model_df = overall_model_df.sort_values(
    by=["mean_accuracy", "mean_total_runtime"],
    ascending=[False, True]
).reset_index(drop=True)

best_model_row = overall_model_df.iloc[0]
best_model = best_model_row["model"]

# best scenario overall = scenario dengan pemenang mean accuracy tertinggi
scenario_best_df = scenario_df.sort_values(
    by=["svm_mean_accuracy", "dl_mean_accuracy"],
    ascending=[False, False]
).reset_index(drop=True)

# Untuk best scenario, ambil scenario yang model pemenangnya memiliki mean accuracy terbesar
scenario_best_candidates = []
for _, row in scenario_df.iterrows():
    best_acc = max(row["svm_mean_accuracy"], row["dl_mean_accuracy"])
    best_rt  = min(row["svm_mean_runtime"], row["dl_mean_runtime"])
    scenario_best_candidates.append({
        "scenario": row["scenario"],
        "winner": row["winner"],
        "best_acc": best_acc,
        "best_rt": best_rt,
        "reason": row["reason"],
    })

scenario_best_candidates_df = pd.DataFrame(scenario_best_candidates).sort_values(
    by=["best_acc", "best_rt"],
    ascending=[False, True]
).reset_index(drop=True)

best_scenario_row = scenario_best_candidates_df.iloc[0]
best_scenario = best_scenario_row["scenario"]

# model terbaik di scenario terbaik
best_scenario_raw = scenario_df[scenario_df["scenario"] == best_scenario].iloc[0]
best_scenario_model = best_scenario_raw["winner"]

# detail row model terbaik di scenario terbaik, ambil mean modelnya
best_scenario_model_stats = overall_model_df[overall_model_df["model"] == best_scenario_model].iloc[0]

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
    "=" * 120,
    f"{'Scenario':<15} {'Period':<12} {'Model':<15} {'Acc':>7} {'F1w':>7} {'F1m':>7} "
    f"{'TrainRt':>10} {'EvalRt':>10} {'TotalRt':>10} {'Winner':>15}",
    "─" * 120,
]

for _, row in df.iterrows():
    winner = winner_map.get((row["scenario_key"], row["period_key"]), "—")
    txt_lines.append(
        f"{row['scenario']:<15} {row['period']:<12} {row['model']:<15} "
        f"{format_num(row['accuracy']):>7} "
        f"{format_num(row['f1_weighted']):>7} "
        f"{format_num(row['f1_macro']):>7} "
        f"{format_num(row['train_runtime']):>10} "
        f"{format_num(row['eval_runtime']):>10} "
        f"{format_num(row['end_to_end_runtime']):>10} "
        f"{winner:>15}"
    )

txt_lines += [
    "─" * 120,
    "",
    "Keterangan:",
    "Acc      = accuracy dari confusion matrix / classification report",
    "F1w      = weighted F1",
    "F1m      = macro F1",
    "TrainRt  = runtime training",
    "EvalRt   = runtime evaluasi",
    "TotalRt  = TrainRt + EvalRt",
    "",
    "Aturan pemenang per kombinasi:",
    "1) accuracy lebih tinggi",
    "2) jika accuracy hampir sama, runtime lebih cepat",
    "",
    "Ringkasan agregat per scenario:",
]
for _, row in scenario_df.iterrows():
    txt_lines.append(
        f"- {row['scenario']}: winner={row['winner']} | "
        f"SVM mean acc={row['svm_mean_accuracy']:.4f} | "
        f"DL mean acc={row['dl_mean_accuracy']:.4f} | "
        f"SVM mean runtime={row['svm_mean_runtime']:.2f} | "
        f"DL mean runtime={row['dl_mean_runtime']:.2f}"
    )

txt_lines += [
    "",
    "Model terbaik overall:",
    f"- {best_model}",
    f"- mean accuracy  : {best_model_row['mean_accuracy']:.4f}",
    f"- mean F1 macro  : {best_model_row['mean_f1_macro']:.4f}",
    f"- mean total rt  : {best_model_row['mean_total_runtime']:.2f} detik",
    f"- win count      : {int(best_model_row['win_count'])}",
    "",
    "Scenario terbaik overall:",
    f"- {best_scenario}",
    f"- model pemenang : {best_scenario_model}",
    f"- best accuracy   : {best_scenario_row['best_acc']:.4f}",
    f"- best runtime    : {best_scenario_row['best_rt']:.2f} detik",
]

txt_path = OUTPUT_DIR / "tabel_komparasi.txt"
txt_path.write_text("\n".join(txt_lines), encoding="utf-8")
print(f"✅ TXT disimpan : {txt_path.name}")

# ══════════════════════════════════════════════════════════════
#  GRAFIK 1: AKURASI (SEMUA SCENARIO x PERIOD)
# ══════════════════════════════════════════════════════════════
combo_order = [(s, p) for s in SCENARIOS for p in COMPARISON_PERIODS]
combo_labels = [f"{SCENARIO_LABELS[s]}\n{PERIOD_LABELS[p]}" for s, p in combo_order]

svm_acc = []
dl_acc  = []

for s, p in combo_order:
    label_s = SCENARIO_LABELS[s]
    label_p = PERIOD_LABELS[p]
    row_s = df[(df["scenario"] == label_s) & (df["period"] == label_p) & (df["model"] == "SVM")]
    row_d = df[(df["scenario"] == label_s) & (df["period"] == label_p) & (df["model"] == "IndoBERTweet")]

    svm_acc.append(float(row_s.iloc[0]["accuracy"]) if not row_s.empty and pd.notna(row_s.iloc[0]["accuracy"]) else np.nan)
    dl_acc.append(float(row_d.iloc[0]["accuracy"]) if not row_d.empty and pd.notna(row_d.iloc[0]["accuracy"]) else np.nan)

x = np.arange(len(combo_labels))
width = 0.35

fig, ax = plt.subplots(figsize=(16, 7))
bars1 = ax.bar(x - width / 2, svm_acc, width, label="SVM", alpha=0.85)
bars2 = ax.bar(x + width / 2, dl_acc, width, label="IndoBERTweet", alpha=0.85)

for bar in bars1:
    h = bar.get_height()
    if not np.isnan(h):
        ax.text(bar.get_x() + bar.get_width()/2, h + 0.005, f"{h:.4f}", ha="center", va="bottom", fontsize=8)
for bar in bars2:
    h = bar.get_height()
    if not np.isnan(h):
        ax.text(bar.get_x() + bar.get_width()/2, h + 0.005, f"{h:.4f}", ha="center", va="bottom", fontsize=8)

ax.set_xlabel("Scenario | Period")
ax.set_ylabel("Accuracy")
ax.set_title("Perbandingan Accuracy: SVM vs IndoBERTweet (Semua Scenario & Period)")
ax.set_xticks(x)
ax.set_xticklabels(combo_labels, rotation=30, ha="right")
ax.set_ylim([0, 1.1])
ax.legend()
ax.grid(axis="y", alpha=0.3)
ax.yaxis.set_major_locator(mticker.MultipleLocator(0.1))

plt.tight_layout()
plt.savefig(OUTPUT_DIR / "grafik_akurasi.png", dpi=150, bbox_inches="tight")
plt.close()
print("✅ Grafik disimpan : grafik_akurasi.png")

# ══════════════════════════════════════════════════════════════
#  GRAFIK 2: RUNTIME (SEMUA SCENARIO x PERIOD)
# ══════════════════════════════════════════════════════════════
svm_rt = []
dl_rt  = []

for s, p in combo_order:
    label_s = SCENARIO_LABELS[s]
    label_p = PERIOD_LABELS[p]
    row_s = df[(df["scenario"] == label_s) & (df["period"] == label_p) & (df["model"] == "SVM")]
    row_d = df[(df["scenario"] == label_s) & (df["period"] == label_p) & (df["model"] == "IndoBERTweet")]

    svm_rt.append(float(row_s.iloc[0]["end_to_end_runtime"]) if not row_s.empty and pd.notna(row_s.iloc[0]["end_to_end_runtime"]) else np.nan)
    dl_rt.append(float(row_d.iloc[0]["end_to_end_runtime"]) if not row_d.empty and pd.notna(row_d.iloc[0]["end_to_end_runtime"]) else np.nan)

fig, ax = plt.subplots(figsize=(16, 7))
bars1 = ax.bar(x - width / 2, svm_rt, width, label="SVM", alpha=0.85)
bars2 = ax.bar(x + width / 2, dl_rt, width, label="IndoBERTweet", alpha=0.85)

for bar in bars1:
    h = bar.get_height()
    if not np.isnan(h):
        ax.text(bar.get_x() + bar.get_width()/2, h + 0.05, f"{h:.2f}", ha="center", va="bottom", fontsize=8)
for bar in bars2:
    h = bar.get_height()
    if not np.isnan(h):
        ax.text(bar.get_x() + bar.get_width()/2, h + 0.05, f"{h:.2f}", ha="center", va="bottom", fontsize=8)

ax.set_xlabel("Scenario | Period")
ax.set_ylabel("Runtime (detik)")
ax.set_title("Perbandingan Runtime End-to-End: SVM vs IndoBERTweet (Semua Scenario & Period)")
ax.set_xticks(x)
ax.set_xticklabels(combo_labels, rotation=30, ha="right")
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
    "=" * 90,
    f"Tanggal : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    "",
    "PRIORITAS PEMILIHAN MODEL:",
    "1) Accuracy dari confusion matrix",
    "2) Runtime (semakin kecil semakin baik)",
    "",
    "HASIL PER KOMBINASI SCENARIO x PERIOD:",
    "─" * 90,
]

for item in combo_results:
    summary_lines += [
        f"\n[{item['combo']}]",
        f"SVM          → Acc: {item['svm_accuracy']:.4f} | Runtime: {item['svm_runtime']:.2f} detik",
        f"IndoBERTweet → Acc: {item['dl_accuracy']:.4f} | Runtime: {item['dl_runtime']:.2f} detik",
        f"Rekomendasi  : {item['winner']} ({item['reason']})",
    ]

summary_lines += [
    "",
    "─" * 90,
    "KESIMPULAN KESELURUHAN:",
    f"SVM unggul di          : {int((df['is_winner'] & (df['model'] == 'SVM')).sum())} kombinasi",
    f"IndoBERTweet unggul di : {int((df['is_winner'] & (df['model'] == 'IndoBERTweet')).sum())} kombinasi",
    "",
    "SCENARIO TERBAIK OVERALL:",
    f"{best_scenario}",
    "",
    "MODEL TERBAIK OVERALL:",
    f"{best_model}",
    "",
    "Alasan ringkas model terbaik overall:",
    f"- mean accuracy : {best_model_row['mean_accuracy']:.4f}",
    f"- mean F1 macro : {best_model_row['mean_f1_macro']:.4f}",
    f"- mean runtime  : {best_model_row['mean_total_runtime']:.2f} detik",
    f"- win count     : {int(best_model_row['win_count'])}",
    "",
    "SCENARIO TERBAIK:",
    f"- {best_scenario}",
    f"- model pemenang : {best_scenario_model}",
    f"- best accuracy   : {best_scenario_row['best_acc']:.4f}",
    f"- best runtime    : {best_scenario_row['best_rt']:.2f} detik",
    "",
    "Detail model terbaik scenario terbaik:",
    f"- Accuracy        : {best_scenario_model_stats['mean_accuracy']:.4f}",
    f"- F1 weighted     : {best_scenario_model_stats['mean_f1_weighted']:.4f}",
    f"- F1 macro        : {best_scenario_model_stats['mean_f1_macro']:.4f}",
    f"- Train runtime   : {best_scenario_model_stats['mean_train_runtime']:.2f} detik",
    f"- Eval runtime    : {best_scenario_model_stats['mean_eval_runtime']:.2f} detik",
    f"- Total runtime   : {best_scenario_model_stats['mean_total_runtime']:.2f} detik",
    "=" * 90
]

summary_text = "\n".join(summary_lines)
summary_path = OUTPUT_DIR / "ringkasan_komparasi.txt"
summary_path.write_text(summary_text, encoding="utf-8")

print("\n" + summary_text)

# ══════════════════════════════════════════════════════════════
#  FINAL
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*90}")
print("  ✅ Komparasi selesai!")
print(f"{'='*90}")
print("  📊 tabel_komparasi.csv")
print("  📄 tabel_komparasi.txt")
print("  🖼  grafik_akurasi.png")
print("  🖼  grafik_runtime.png")
print("  📄 ringkasan_komparasi.txt")
print(f"{'='*90}")