# services/development/devKomparasi.py
"""
=============================================================
KOMPARASI MODEL: SVM vs IndoBERTweet (S1, S2, S3)
=============================================================
Alur 2 Tahap:

  TAHAP 1 — Per skenario (S1, S2, S3):
    → Bandingkan SVM vs IndoBERTweet di setiap periode
       (before, covid, after, all_periods)
    → Hitung mean accuracy & mean runtime per model per skenario
    → Pilih 1 pemenang per skenario:
       prioritas 1: mean accuracy lebih tinggi
       prioritas 2: jika hampir sama, mean runtime lebih cepat

  TAHAP 2 — Komparasi final 3 pemenang (S1 winner, S2 winner, S3 winner):
    → Bandingkan accuracy & runtime ketiga pemenang
    → Pilih 1 model terbaik untuk sistem

Kriteria "hampir sama" = selisih accuracy < 0.001

Output : dev_database/5_komparasi/
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
OUTPUT_DIR = BASE_DIR / "dev_database" / "5_komparasi_3"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SCENARIOS = ["S1", "S2", "S3"]
PERIODS   = ["before", "covid", "after", "all_periods"]

SCENARIO_LABELS = {
    "S1": "Scenario 1 (Lexicon, 2 kls)",
    "S2": "Scenario 2 (Lexicon, 2 kls)",
    "S3": "Scenario 3 (Lexicon, 3 kls)",
}
PERIOD_LABELS = {
    "before"     : "Sebelum COVID",
    "covid"      : "Masa COVID",
    "after"      : "Setelah COVID",
    "all_periods": "Semua Periode",
}
MODEL_NAMES = ["SVM", "IndoBERTweet"]

# Threshold akurasi "hampir sama"
ACC_THRESHOLD = 0.001

# ══════════════════════════════════════════════════════════════
#  HELPER
# ══════════════════════════════════════════════════════════════
def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""

def extract_float(text: str, patterns: list[str]):
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE | re.MULTILINE)
        if m:
            return float(m.group(1))
    return None

def parse_report(path: Path) -> dict:
    text = read_text(path)
    if not text:
        return {}

    # Accuracy
    acc = extract_float(text, [
        r"(?m)^\s*accuracy\s+([\d.]+)",
        r"ACCURACY\s*[-]+\s*([\d.]+)",
    ])
    # Weighted avg
    wm = re.search(r"(?m)^\s*weighted avg\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)", text)
    # Macro avg
    mm = re.search(r"(?m)^\s*macro avg\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)", text)

    return {
        "accuracy"   : acc,
        "f1_weighted": float(wm.group(3)) if wm else None,
        "f1_macro"   : float(mm.group(3)) if mm else None,
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
    infer_rt = extract_float(eval_text, [
        r"Inferensi(?:\s+test)?\s*:\s*([\d.]+)\s*detik",
        r"Predict\s*:\s*([\d.]+)\s*detik",
        r"Runtime infer\s*:\s*([\d.]+)\s*detik",
    ])

    total = (train_rt or 0) + (eval_rt or 0)
    return {
        "train_rt" : train_rt,
        "eval_rt"  : eval_rt,
        "infer_rt" : infer_rt,
        "total_rt" : total if total > 0 else None,
    }

def fmt(v, d=4):
    if v is None or (isinstance(v, float) and np.isnan(v)):
        return "—"
    return f"{v:.{d}f}"

def pick_winner_2(a_acc, a_rt, b_acc, b_rt, a_label, b_label):
    """
    Bandingkan 2 model: pilih berdasarkan accuracy dulu,
    jika hampir sama pakai runtime.
    Return: (winner_label, reason)
    """
    diff_acc = a_acc - b_acc if (a_acc and b_acc) else None

    if diff_acc is None:
        return (a_label if a_acc else b_label), "hanya satu model memiliki data"

    if abs(diff_acc) >= ACC_THRESHOLD:
        winner = a_label if diff_acc > 0 else b_label
        reason = (f"accuracy lebih tinggi "
                  f"({a_label}:{a_acc:.4f} vs {b_label}:{b_acc:.4f}, "
                  f"selisih {abs(diff_acc):.4f})")
    else:
        # Hampir sama → pakai runtime
        if a_rt and b_rt:
            winner = a_label if a_rt < b_rt else b_label
            reason = (f"accuracy hampir sama (selisih {abs(diff_acc):.4f} < {ACC_THRESHOLD}), "
                      f"runtime lebih cepat ({a_label}:{a_rt:.2f}s vs {b_label}:{b_rt:.2f}s)")
        else:
            winner = a_label if a_acc >= b_acc else b_label
            reason = "accuracy hampir sama, runtime tidak tersedia — fallback ke accuracy"

    return winner, reason

# ══════════════════════════════════════════════════════════════
#  KUMPULKAN SEMUA METRIK
# ══════════════════════════════════════════════════════════════
print("=" * 65)
print("  KOMPARASI MODEL — SVM vs IndoBERTweet (S1, S2, S3)")
print("  Alur 2 Tahap: per skenario → final")
print("=" * 65)

rows = []
missing = []

for scenario in SCENARIOS:
    for period in PERIODS:
        for model_name in MODEL_NAMES:
            mk      = "ml" if model_name == "SVM" else "dl"
            rname   = ("classification_report_svm.txt"
                       if model_name == "SVM"
                       else "classification_report_indobertweet.txt")
            folder  = MODEL_DIR / scenario / mk / period
            metrics = parse_report(folder / rname)
            rts     = parse_runtimes(folder / "train_info.txt",
                                     folder / "evaluation_info.txt")

            if not metrics or metrics.get("accuracy") is None:
                missing.append(f"{scenario}/{mk}/{period}/{rname}")
                continue

            rows.append({
                "scenario"  : scenario,
                "period"    : period,
                "model"     : model_name,
                **metrics,
                **rts,
            })

if missing:
    print(f"\n⚠️  {len(missing)} file tidak ditemukan:")
    for m in missing:
        print(f"   - {m}")
    print()

if not rows:
    raise RuntimeError("Tidak ada data. Jalankan semua evaluasi terlebih dahulu.")

df = pd.DataFrame(rows)
print(f"✅ Total entri : {len(df)}\n")

# ══════════════════════════════════════════════════════════════
#  TAHAP 1: PILIH PEMENANG PER SKENARIO
#  Hitung mean metrik tiap model per skenario (semua periode)
#  Bandingkan SVM vs IndoBERTweet → 1 pemenang per skenario
# ══════════════════════════════════════════════════════════════
print("─" * 65)
print("  TAHAP 1: Pemilihan pemenang per skenario")
print("─" * 65)

stage1_results = []    # detail per skenario
stage1_winners = {}    # scenario → {"model", "mean_acc", "mean_rt", "reason"}

for scenario in SCENARIOS:
    sub = df[df["scenario"] == scenario]
    label = SCENARIO_LABELS[scenario]

    svm_rows = sub[sub["model"] == "SVM"]
    dl_rows  = sub[sub["model"] == "IndoBERTweet"]

    if svm_rows.empty or dl_rows.empty:
        print(f"⚠️  {label}: data tidak lengkap, skip")
        continue

    # Mean metrik dari semua periode yang tersedia
    svm_acc = svm_rows["accuracy"].mean()
    dl_acc  = dl_rows["accuracy"].mean()
    svm_rt  = svm_rows["total_rt"].mean()
    dl_rt   = dl_rows["total_rt"].mean()
    svm_f1  = svm_rows["f1_macro"].mean()
    dl_f1   = dl_rows["f1_macro"].mean()

    winner, reason = pick_winner_2(svm_acc, svm_rt, dl_acc, dl_rt, "SVM", "IndoBERTweet")

    stage1_winners[scenario] = {
        "model"       : winner,
        "mean_acc"    : svm_acc if winner == "SVM" else dl_acc,
        "mean_rt"     : svm_rt  if winner == "SVM" else dl_rt,
        "mean_f1"     : svm_f1  if winner == "SVM" else dl_f1,
        "reason"      : reason,
        "svm_acc"     : svm_acc, "dl_acc"  : dl_acc,
        "svm_rt"      : svm_rt,  "dl_rt"   : dl_rt,
        "svm_f1"      : svm_f1,  "dl_f1"   : dl_f1,
    }

    stage1_results.append({
        "scenario" : label,
        "winner"   : winner,
        "svm_acc"  : svm_acc, "dl_acc"  : dl_acc,
        "svm_rt"   : svm_rt,  "dl_rt"   : dl_rt,
        "reason"   : reason,
    })

    print(f"\n  [{label}]")
    print(f"   SVM          : acc={svm_acc:.4f} | f1={svm_f1:.4f} | rt={svm_rt:.2f}s")
    print(f"   IndoBERTweet : acc={dl_acc:.4f} | f1={dl_f1:.4f} | rt={dl_rt:.2f}s")
    print(f"   🏆 Pemenang  : {winner}")
    print(f"   Alasan       : {reason}")

# ══════════════════════════════════════════════════════════════
#  TAHAP 2: KOMPARASI FINAL 3 PEMENANG
#  Bandingkan pemenang S1 vs S2 vs S3 → pilih 1 terbaik
# ══════════════════════════════════════════════════════════════
print(f"\n{'─'*65}")
print("  TAHAP 2: Komparasi final 3 pemenang skenario")
print("─" * 65)

finalists = []
for scenario, info in stage1_winners.items():
    finalists.append({
        "scenario"  : scenario,
        "label"     : SCENARIO_LABELS[scenario],
        "model"     : info["model"],
        "mean_acc"  : info["mean_acc"],
        "mean_rt"   : info["mean_rt"],
        "mean_f1"   : info["mean_f1"],
        "reason_s1" : info["reason"],
    })

finalists_df = pd.DataFrame(finalists)

# Sort: accuracy desc → runtime asc → f1 desc
finalists_df = finalists_df.sort_values(
    by    = ["mean_acc", "mean_rt", "mean_f1"],
    ascending = [False, True, False]
).reset_index(drop=True)

final_winner_row = finalists_df.iloc[0]
final_winner_label = f"{final_winner_row['model']} ({final_winner_row['label']})"

print(f"\n  Finalis (3 pemenang skenario):")
print(f"  {'No':<3} {'Skenario':<32} {'Model':<15} {'MeanAcc':>9} {'MeanF1':>8} {'MeanRT(s)':>10}")
print(f"  {'─'*75}")
for i, row in finalists_df.iterrows():
    marker = " 🏆" if i == 0 else ""
    print(
        f"  {i+1:<3} {row['label']:<32} {row['model']:<15} "
        f"{row['mean_acc']:>9.4f} {row['mean_f1']:>8.4f} "
        f"{row['mean_rt']:>10.2f}{marker}"
    )

print(f"\n  🏆 MODEL TERBAIK FINAL : {final_winner_label}")
print(f"     Mean Accuracy       : {final_winner_row['mean_acc']:.4f}")
print(f"     Mean F1 macro       : {final_winner_row['mean_f1']:.4f}")
print(f"     Mean Runtime        : {final_winner_row['mean_rt']:.2f} detik")

# ══════════════════════════════════════════════════════════════
#  SIMPAN CSV
# ══════════════════════════════════════════════════════════════
df_out = df.copy()
df_out["scenario_label"] = df_out["scenario"].map(SCENARIO_LABELS)
df_out["period_label"]   = df_out["period"].map(PERIOD_LABELS)
df_out.to_csv(OUTPUT_DIR / "tabel_komparasi.csv", index=False, encoding="utf-8-sig")
print(f"\n✅ CSV disimpan : tabel_komparasi.csv")

# ══════════════════════════════════════════════════════════════
#  TABEL TEKS
# ══════════════════════════════════════════════════════════════
col_w = 120
txt = [
    "TABEL KOMPARASI KINERJA MODEL",
    "=" * col_w,
    f"{'Scenario':<32} {'Period':<16} {'Model':<15} {'Accuracy':>9} "
    f"{'F1_w':>7} {'F1_m':>7} {'TrainRt':>9} {'EvalRt':>9} {'TotalRt':>9}",
    "─" * col_w,
]
for scenario in SCENARIOS:
    txt.append(f"[ {SCENARIO_LABELS[scenario]} ]")
    for period in PERIODS:
        for model in MODEL_NAMES:
            sub = df[
                (df["scenario"] == scenario) &
                (df["period"]   == period)   &
                (df["model"]    == model)
            ]
            if sub.empty:
                continue
            r = sub.iloc[0]
            txt.append(
                f"  {'':30} {PERIOD_LABELS[period]:<16} {model:<15} "
                f"{fmt(r['accuracy']):>9} {fmt(r['f1_weighted']):>7} "
                f"{fmt(r['f1_macro']):>7} {fmt(r['train_rt'],2):>9} "
                f"{fmt(r['eval_rt'],2):>9} {fmt(r['total_rt'],2):>9}"
            )
    txt.append("─" * col_w)

(OUTPUT_DIR / "tabel_komparasi.txt").write_text("\n".join(txt), encoding="utf-8")
print(f"✅ TXT disimpan : tabel_komparasi.txt")

# ══════════════════════════════════════════════════════════════
#  GRAFIK — kombinasi skenario x periode
# ══════════════════════════════════════════════════════════════
combo_order  = [(s, p) for s in SCENARIOS for p in PERIODS]
combo_labels = [f"{SCENARIO_LABELS[s]}\n{PERIOD_LABELS[p]}" for s, p in combo_order]
x = np.arange(len(combo_labels))
w = 0.35

def get_vals(metric):
    svm_v, dl_v = [], []
    for s, p in combo_order:
        r_svm = df[(df["scenario"]==s)&(df["period"]==p)&(df["model"]=="SVM")]
        r_dl  = df[(df["scenario"]==s)&(df["period"]==p)&(df["model"]=="IndoBERTweet")]
        svm_v.append(float(r_svm.iloc[0][metric]) if not r_svm.empty and pd.notna(r_svm.iloc[0][metric]) else np.nan)
        dl_v.append(float(r_dl.iloc[0][metric])   if not r_dl.empty  and pd.notna(r_dl.iloc[0][metric])  else np.nan)
    return svm_v, dl_v

def annotate_bars(ax, bars, fmt_str="{:.4f}"):
    for bar in bars:
        h = bar.get_height()
        if not np.isnan(h) and h > 0:
            ax.text(bar.get_x() + bar.get_width()/2, h + 0.003,
                    fmt_str.format(h), ha="center", va="bottom", fontsize=7, rotation=90)

# Grafik 1: Accuracy
svm_acc, dl_acc = get_vals("accuracy")
fig, ax = plt.subplots(figsize=(20, 7))
b1 = ax.bar(x - w/2, svm_acc, w, label="SVM",          color="#3498db", alpha=0.85)
b2 = ax.bar(x + w/2, dl_acc,  w, label="IndoBERTweet", color="#e74c3c", alpha=0.85)
annotate_bars(ax, b1)
annotate_bars(ax, b2)
ax.set_xlabel("Scenario | Periode", fontsize=11)
ax.set_ylabel("Accuracy", fontsize=11)
ax.set_title("Perbandingan Accuracy: SVM vs IndoBERTweet\n(Semua Skenario & Periode)", fontsize=13)
ax.set_xticks(x)
ax.set_xticklabels(combo_labels, rotation=30, ha="right", fontsize=8)
ax.set_ylim([0, 1.2])
ax.yaxis.set_major_locator(mticker.MultipleLocator(0.1))
ax.legend(fontsize=10)
ax.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "grafik_akurasi.png", dpi=150, bbox_inches="tight")
plt.close()
print(f"✅ Grafik disimpan : grafik_akurasi.png")

# Grafik 2: Runtime
svm_rt, dl_rt = get_vals("total_rt")
fig, ax = plt.subplots(figsize=(20, 7))
b1 = ax.bar(x - w/2, svm_rt, w, label="SVM",          color="#3498db", alpha=0.85)
b2 = ax.bar(x + w/2, dl_rt,  w, label="IndoBERTweet", color="#e74c3c", alpha=0.85)
annotate_bars(ax, b1, "{:.1f}s")
annotate_bars(ax, b2, "{:.1f}s")
ax.set_xlabel("Scenario | Periode", fontsize=11)
ax.set_ylabel("Total Runtime (detik)", fontsize=11)
ax.set_title("Perbandingan Runtime: SVM vs IndoBERTweet\n(Semua Skenario & Periode)", fontsize=13)
ax.set_xticks(x)
ax.set_xticklabels(combo_labels, rotation=30, ha="right", fontsize=8)
ax.legend(fontsize=10)
ax.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "grafik_runtime.png", dpi=150, bbox_inches="tight")
plt.close()
print(f"✅ Grafik disimpan : grafik_runtime.png")

# ══════════════════════════════════════════════════════════════
#  RINGKASAN TEKS
# ══════════════════════════════════════════════════════════════
sep  = "=" * 70
sep2 = "─" * 70

lines = [
    "RINGKASAN KOMPARASI MODEL — 2 TAHAP",
    sep,
    f"Tanggal    : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    "",
    "ALUR PEMILIHAN:",
    "  Tahap 1: Pilih pemenang per skenario",
    "           → bandingkan SVM vs IndoBERTweet",
    "           → pertimbangkan mean accuracy + mean runtime",
    "           → 1 pemenang per skenario (3 pemenang total)",
    "",
    "  Tahap 2: Komparasi final 3 pemenang",
    "           → pilih 1 model terbaik berdasarkan accuracy + runtime",
    "",
    f"  Threshold 'hampir sama' : selisih accuracy < {ACC_THRESHOLD}",
    "",
    sep2,
    "TAHAP 1 — HASIL PER SKENARIO:",
    sep2,
]

for scenario, info in stage1_winners.items():
    lines += [
        f"\n  [{SCENARIO_LABELS[scenario]}]",
        f"  {'Model':<15} {'Mean Acc':>9} {'Mean F1':>8} {'Mean RT':>9}",
        f"  {'─'*44}",
        f"  {'SVM':<15} {info['svm_acc']:>9.4f} {info['svm_f1']:>8.4f} {info['svm_rt']:>8.2f}s",
        f"  {'IndoBERTweet':<15} {info['dl_acc']:>9.4f} {info['dl_f1']:>8.4f} {info['dl_rt']:>8.2f}s",
        f"  {'─'*44}",
        f"  🏆 Pemenang : {info['model']}",
        f"  Alasan     : {info['reason']}",
    ]

lines += [
    "",
    sep2,
    "TAHAP 1 — DETAIL PER PERIODE:",
    sep2,
]

for scenario in SCENARIOS:
    lines.append(f"\n  [{SCENARIO_LABELS[scenario]}]")
    lines.append(
        f"  {'Periode':<20} {'SVM Acc':>9} {'IBT Acc':>9} "
        f"{'SVM RT':>9} {'IBT RT':>9} {'Pemenang':>15}"
    )
    lines.append(f"  {'─'*76}")
    for period in PERIODS:
        r_svm = df[(df["scenario"]==scenario)&(df["period"]==period)&(df["model"]=="SVM")]
        r_dl  = df[(df["scenario"]==scenario)&(df["period"]==period)&(df["model"]=="IndoBERTweet")]
        if r_svm.empty or r_dl.empty:
            continue
        svm_a = r_svm.iloc[0]["accuracy"]
        dl_a  = r_dl.iloc[0]["accuracy"]
        svm_r = r_svm.iloc[0]["total_rt"]
        dl_r  = r_dl.iloc[0]["total_rt"]
        w_p, _ = pick_winner_2(svm_a, svm_r, dl_a, dl_r, "SVM", "IndoBERTweet")
        lines.append(
            f"  {PERIOD_LABELS[period]:<20} {fmt(svm_a):>9} {fmt(dl_a):>9} "
            f"{fmt(svm_r,2):>9} {fmt(dl_r,2):>9} {w_p:>15}"
        )

lines += [
    "",
    sep2,
    "TAHAP 2 — KOMPARASI FINAL (3 PEMENANG SKENARIO):",
    sep2,
    f"  {'No':<3} {'Skenario':<32} {'Model':<15} {'MeanAcc':>9} {'MeanF1':>8} {'MeanRT':>8}",
    f"  {'─'*75}",
]
for i, row in finalists_df.iterrows():
    marker = " ← 🏆 TERBAIK" if i == 0 else ""
    lines.append(
        f"  {i+1:<3} {row['label']:<32} {row['model']:<15} "
        f"{row['mean_acc']:>9.4f} {row['mean_f1']:>8.4f} "
        f"{row['mean_rt']:>8.2f}s{marker}"
    )

lines += [
    "",
    sep,
    "KESIMPULAN FINAL:",
    sep,
    f"  Model terbaik   : {final_winner_label}",
    f"  Mean Accuracy   : {final_winner_row['mean_acc']:.4f}",
    f"  Mean F1 macro   : {final_winner_row['mean_f1']:.4f}",
    f"  Mean Runtime    : {final_winner_row['mean_rt']:.2f} detik",
    "",
    "  → Direkomendasikan untuk sistem (Tujuan Penelitian #1)",
    sep,
    "",
    sep2,
    "TABEL LENGKAP SEMUA METRIK:",
    f"  {'Skn':<4} {'Model':<15} {'Periode':<18} {'Acc':>8} "
    f"{'F1w':>7} {'F1m':>7} {'TrRt':>8} {'EvRt':>8} {'TotRt':>8}",
    sep2,
]
for scenario in SCENARIOS:
    lines.append(f"  [{SCENARIO_LABELS[scenario]}]")
    for period in PERIODS:
        for model in MODEL_NAMES:
            sub = df[(df["scenario"]==scenario)&(df["period"]==period)&(df["model"]==model)]
            if sub.empty:
                continue
            r = sub.iloc[0]
            lines.append(
                f"  {scenario:<4} {model:<15} {PERIOD_LABELS[period]:<18} "
                f"{fmt(r['accuracy']):>8} {fmt(r['f1_weighted']):>7} "
                f"{fmt(r['f1_macro']):>7} {fmt(r['train_rt'],2):>8} "
                f"{fmt(r['eval_rt'],2):>8} {fmt(r['total_rt'],2):>8}"
            )
    lines.append(sep2)

lines.append(sep)
summary_text = "\n".join(lines)
print("\n" + summary_text)

(OUTPUT_DIR / "ringkasan_komparasi.txt").write_text(summary_text, encoding="utf-8")
print(f"\n✅ Disimpan : ringkasan_komparasi.txt")

# ══════════════════════════════════════════════════════════════
#  TERMINAL SUMMARY
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*65}")
print(f"  ✅ Komparasi selesai!")
print(f"{'='*65}")
print(f"  📊 tabel_komparasi.csv")
print(f"  📄 tabel_komparasi.txt")
print(f"  🖼  grafik_akurasi.png")
print(f"  🖼  grafik_runtime.png")
print(f"  📄 ringkasan_komparasi.txt")
print(f"{'='*65}")
print(f"\n  Tahap 1 — Pemenang per skenario:")
for scenario, info in stage1_winners.items():
    print(f"   {SCENARIO_LABELS[scenario]:<32} → {info['model']}")
print(f"\n  🏆 Model Terbaik Final : {final_winner_label}")
print(f"     Mean Accuracy       : {final_winner_row['mean_acc']:.4f}")
print(f"     Mean Runtime        : {final_winner_row['mean_rt']:.2f} detik")
print(f"\n  ➡  Lanjut ke: python devPembanding.py")