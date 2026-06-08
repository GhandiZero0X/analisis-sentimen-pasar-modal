# services/development/devDatakomparasi.py
"""
=============================================================
KOMPARASI AUTO LABELLING vs EXPERT LABELLING
=============================================================
Input  :
  - dev_database/7_excel_ver/tweets_after_covid_labellingLexicon.csv
  - dev_database/7_excel_ver/tweets_after_covid_labellingExpert.csv

Output :
  - dev_database/8_komparasi/komparasi_summary.txt
  - dev_database/8_komparasi/komparasi_detail.csv
  - dev_database/8_komparasi/confusion_matrix.png
  - dev_database/8_komparasi/grafik_distribusi.png
  - dev_database/8_komparasi/classification_report.txt

Analisis :
  - Akurasi / agreement rate keseluruhan
  - Cohen's Kappa (inter-rater agreement)
  - Confusion matrix
  - Classification report (precision, recall, f1 per kelas)
  - Distribusi perbedaan label per kelas
  - Contoh tweet yang berbeda labelnya
=============================================================
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
from pathlib import Path
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)

# ══════════════════════════════════════════════════════════════
#  PATH CONFIG
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
INPUT_DIR  = BASE_DIR / "dev_database" / "7_excel_ver"
OUTPUT_DIR = BASE_DIR / "dev_database" / "8_data_komparasi"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

FILE_LEXICON = INPUT_DIR / "tweets_after_covid_labellingLexicon.csv"
FILE_EXPERT  = INPUT_DIR / "tweets_after_covid_labellingExpert.csv"

# ══════════════════════════════════════════════════════════════
#  LOAD DATA
# ══════════════════════════════════════════════════════════════
def load_data():
    print("📂 Membaca file lexicon  :", FILE_LEXICON)
    print("📂 Membaca file expert   :", FILE_EXPERT)

    df_lex = pd.read_csv(FILE_LEXICON, dtype=str).fillna("")
    df_exp = pd.read_csv(FILE_EXPERT,  dtype=str).fillna("")

    df_lex["sentiment"] = df_lex["sentiment"].str.strip().str.lower()
    df_exp["sentiment"] = df_exp["sentiment"].str.strip().str.lower()

    print(f"\n   Jumlah baris lexicon : {len(df_lex):,}")
    print(f"   Jumlah baris expert  : {len(df_exp):,}")

    return df_lex, df_exp

# ══════════════════════════════════════════════════════════════
#  BUILD KOMPARASI DATAFRAME
# ══════════════════════════════════════════════════════════════
def build_komparasi(df_lex, df_exp):

    def normalize_tweet(series):
        return (
            series.astype(str)
            .str.strip()
            .str.lower()
            .str.replace(r"\s+", " ", regex=True)
        )

    df_lex = df_lex.copy()
    df_exp = df_exp.copy()

    df_lex["tweet_norm"] = normalize_tweet(df_lex["tweet"])
    df_exp["tweet_norm"] = normalize_tweet(df_exp["tweet"])

    # sort agar konsisten
    sort_cols = ["tweet_norm"]

    if "saham" in df_lex.columns:
        sort_cols.append("saham")

    df_lex = df_lex.sort_values(sort_cols).reset_index(drop=True)
    df_exp = df_exp.sort_values(sort_cols).reset_index(drop=True)

    # nomor kemunculan tweet
    df_lex["occ"] = (
        df_lex.groupby("tweet_norm")
        .cumcount()
    )

    df_exp["occ"] = (
        df_exp.groupby("tweet_norm")
        .cumcount()
    )

    merged = pd.merge(
        df_exp,
        df_lex,
        on=["tweet_norm", "occ"],
        how="inner",
        suffixes=("_expert", "_lexicon")
    )

    print("\n📊 HASIL MATCHING")
    print(f"   Expert  : {len(df_exp):,}")
    print(f"   Lexicon : {len(df_lex):,}")
    print(f"   Matched : {len(merged):,}")

    
    if len(merged) != len(df_exp):

        print(
            f"⚠️ Ada {len(df_exp)-len(merged):,} tweet expert "
            f"yang tidak menemukan pasangan"
        )

        expert_key = set(
            zip(df_exp["tweet_norm"], df_exp["occ"])
        )

        lex_key = set(
            zip(df_lex["tweet_norm"], df_lex["occ"])
        )

        missing_expert = expert_key - lex_key
        missing_lex = lex_key - expert_key

        print("\n" + "=" * 80)
        print("DETAIL DATA TIDAK MATCH")
        print("=" * 80)

        if missing_expert:
            print("\n🟥 ADA DI EXPERT TAPI TIDAK ADA DI LEXICON\n")

            for tweet_norm, occ in missing_expert:

                row = df_exp[
                    (df_exp["tweet_norm"] == tweet_norm)
                    & (df_exp["occ"] == occ)
                ].iloc[0]

                print("Tanggal :", row.get("date", ""))
                print("Saham   :", row.get("saham", ""))
                print("Label   :", row.get("sentiment", ""))
                print("Occ     :", occ)
                print("Tweet   :", row.get("tweet", ""))
                print("-" * 80)

        if missing_lex:
            print("\n🟦 ADA DI LEXICON TAPI TIDAK ADA DI EXPERT\n")

            for tweet_norm, occ in missing_lex:

                row = df_lex[
                    (df_lex["tweet_norm"] == tweet_norm)
                    & (df_lex["occ"] == occ)
                ].iloc[0]

                print("Tanggal :", row.get("date", ""))
                print("Saham   :", row.get("saham", ""))
                print("Label   :", row.get("sentiment", ""))
                print("Occ     :", occ)
                print("Tweet   :", row.get("tweet", ""))
                print("-" * 80)

        print("=" * 80)

    df = pd.DataFrame()

    df["tweet"] = merged["tweet_expert"]

    df["date"] = merged.get("date_expert", "")
    df["saham"] = merged.get("saham_expert", "")

    df["label_expert"] = (
        merged["sentiment_expert"]
        .astype(str)
        .str.lower()
        .str.strip()
    )

    df["label_lexicon"] = (
        merged["sentiment_lexicon"]
        .astype(str)
        .str.lower()
        .str.strip()
    )

    df["is_sama"] = (
        df["label_expert"] ==
        df["label_lexicon"]
    )

    df["status"] = np.where(
        df["is_sama"],
        "SAMA",
        "BEDA"
    )

    return df

# ══════════════════════════════════════════════════════════════
#  HITUNG METRIK
# ══════════════════════════════════════════════════════════════
def hitung_metrik(df):
    y_true = df["label_expert"]
    y_pred = df["label_lexicon"]
    labels = sorted(y_true.unique().tolist())

    acc    = accuracy_score(y_true, y_pred)
    cm     = confusion_matrix(y_true, y_pred, labels=labels)
    report = classification_report(y_true, y_pred, labels=labels, digits=4)

    return acc, cm, report, labels

# ══════════════════════════════════════════════════════════════
#  DISTRIBUSI PERBEDAAN PER KELAS
# ══════════════════════════════════════════════════════════════
def distribusi_perbedaan(df):
    result = {}
    for label in sorted(df["label_expert"].unique()):
        subset  = df[df["label_expert"] == label]
        n_total = len(subset)
        n_sama  = subset["is_sama"].sum()
        n_beda  = n_total - n_sama
        result[label] = {
            "total"   : n_total,
            "sama"    : n_sama,
            "beda"    : n_beda,
            "pct_sama": round(n_sama / n_total * 100, 2) if n_total > 0 else 0
        }
    return result

# ══════════════════════════════════════════════════════════════
#  CONFUSION MATRIX PLOT
# ══════════════════════════════════════════════════════════════
def plot_confusion_matrix(cm, labels, output_path):
    fig, ax = plt.subplots(figsize=(7, 5))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=labels, yticklabels=labels,
        linewidths=0.5, ax=ax
    )
    ax.set_title("Confusion Matrix\nAuto Labelling (Lexicon) vs Expert", fontsize=13, pad=12)
    ax.set_xlabel("Prediksi (Lexicon)", fontsize=11)
    ax.set_ylabel("Aktual (Expert)",    fontsize=11)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"   ✅ Confusion matrix disimpan: {output_path.name}")

# ══════════════════════════════════════════════════════════════
#  GRAFIK DISTRIBUSI
# ══════════════════════════════════════════════════════════════
def plot_distribusi(df, output_path):
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))

    labels_lex = df["label_lexicon"].value_counts().sort_index()
    labels_exp = df["label_expert"].value_counts().sort_index()
    all_labels = sorted(set(labels_lex.index) | set(labels_exp.index))
    x = np.arange(len(all_labels))
    w = 0.35

    bars1 = axes[0].bar(x - w/2, [labels_lex.get(l, 0) for l in all_labels], w,
                        label="Lexicon", color="#4C72B0")
    bars2 = axes[0].bar(x + w/2, [labels_exp.get(l, 0) for l in all_labels], w,
                        label="Expert",  color="#DD8452")

    axes[0].set_title("Distribusi Label: Lexicon vs Expert", fontsize=12)
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(all_labels)
    axes[0].set_ylabel("Jumlah Tweet")
    axes[0].legend()
    axes[0].yaxis.set_major_formatter(
        mticker.FuncFormatter(lambda v, _: f"{int(v):,}")
    )
    for bar in list(bars1) + list(bars2):
        axes[0].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 30,
            f"{int(bar.get_height()):,}",
            ha="center", va="bottom", fontsize=8
        )

    dist       = distribusi_perbedaan(df)
    kelas_list = sorted(dist.keys())
    pct_sama   = [dist[k]["pct_sama"]       for k in kelas_list]
    pct_beda   = [100 - dist[k]["pct_sama"] for k in kelas_list]
    x2 = np.arange(len(kelas_list))

    axes[1].bar(x2, pct_sama, label="Sama", color="#55A868")
    axes[1].bar(x2, pct_beda, bottom=pct_sama, label="Beda", color="#C44E52")
    axes[1].set_title("Tingkat Kecocokan Label per Kelas (Expert)", fontsize=12)
    axes[1].set_xticks(x2)
    axes[1].set_xticklabels(kelas_list)
    axes[1].set_ylabel("Persentase (%)")
    axes[1].set_ylim(0, 115)
    axes[1].legend()

    for i, (ps, pb) in enumerate(zip(pct_sama, pct_beda)):
        if ps > 5:
            axes[1].text(i, ps / 2, f"{ps:.1f}%",
                         ha="center", va="center", fontsize=9,
                         color="white", fontweight="bold")
        if pb > 5:
            axes[1].text(i, ps + pb / 2, f"{pb:.1f}%",
                         ha="center", va="center", fontsize=9,
                         color="white", fontweight="bold")

    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"   ✅ Grafik distribusi disimpan: {output_path.name}")

# ══════════════════════════════════════════════════════════════
#  CONTOH TWEET YANG BERBEDA LABEL
# ══════════════════════════════════════════════════════════════
def contoh_beda(df, n=5):
    beda = df[df["is_sama"] == False].copy()
    if len(beda) == 0:
        return "\nTidak ada perbedaan label antara lexicon dan expert."

    lines = []
    lines.append(f"\n{'─'*70}")
    lines.append(f"CONTOH TWEET YANG BERBEDA LABEL (maks {n} per kombinasi)")
    lines.append(f"{'─'*70}")

    for (exp_label, lex_label), group in beda.groupby(["label_expert", "label_lexicon"]):
        lines.append(f"\n  Expert [{exp_label.upper()}] → Lexicon [{lex_label.upper()}]")
        lines.append(f"  Jumlah : {len(group):,} tweet")
        lines.append(f"  Contoh :")
        for _, row in group.head(n).iterrows():
            preview = str(row["tweet"])[:120].replace("\n", " ")
            date    = str(row.get("date", ""))[:10]
            saham   = str(row.get("saham", ""))
            lines.append(f"    [{date}][{saham}] {preview}...")

    return "\n".join(lines)

# ══════════════════════════════════════════════════════════════
#  SIMPAN SUMMARY
# ══════════════════════════════════════════════════════════════
def simpan_summary(acc, report, dist, df, output_path):
    total  = len(df)
    n_sama = int(df["is_sama"].sum())
    n_beda = total - n_sama

    lines = []
    lines.append("=" * 70)
    lines.append("  KOMPARASI AUTO LABELLING (LEXICON) vs EXPERT LABELLING")
    lines.append("=" * 70)
    lines.append(f"\n  Dataset        : After COVID (Post-COVID)")
    lines.append(f"  Total Tweet    : {total:,}")
    lines.append(f"  Label Sama     : {n_sama:,}  ({n_sama/total*100:.2f}%)")
    lines.append(f"  Label Berbeda  : {n_beda:,}  ({n_beda/total*100:.2f}%)")
    lines.append(f"\n  Akurasi (Agreement Rate) : {acc:.4f}  ({acc*100:.2f}%)")

    lines.append(f"\n{'─'*70}")
    lines.append("  DISTRIBUSI KECOCOKAN PER KELAS (berdasarkan label Expert)")
    lines.append(f"{'─'*70}")
    lines.append(f"  {'Kelas':<12} {'Total':>8} {'Sama':>8} {'Beda':>8} {'% Sama':>10}")
    lines.append(f"  {'─'*12} {'─'*8} {'─'*8} {'─'*8} {'─'*10}")
    for label, v in sorted(dist.items()):
        lines.append(
            f"  {label:<12} {v['total']:>8,} {v['sama']:>8,} "
            f"{v['beda']:>8,} {v['pct_sama']:>9.2f}%"
        )

    lines.append(f"\n{'─'*70}")
    lines.append("  CLASSIFICATION REPORT")
    lines.append(f"{'─'*70}")
    lines.append(report)
    lines.append(contoh_beda(df))
    lines.append("\n" + "=" * 70)

    text = "\n".join(lines)
    print(text)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"\n   ✅ Summary disimpan: {output_path.name}")

# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════
def main():
    print("=" * 70)
    print("  KOMPARASI AUTO LABELLING vs EXPERT LABELLING")
    print("=" * 70)

    # 1. Load data
    df_lex, df_exp = load_data()

    # 2. Bangun dataframe komparasi
    df = build_komparasi(df_lex, df_exp)

    print("\n📊 DISTRIBUSI LABEL EXPERT")
    print(df["label_expert"].value_counts())

    print("\n📊 DISTRIBUSI LABEL LEXICON")
    print(df["label_lexicon"].value_counts())

    # 3. Simpan detail CSV
    detail_path = OUTPUT_DIR / "komparasi_detail.csv"
    df.to_csv(detail_path, index=False, encoding="utf-8-sig")
    print(f"\n   ✅ Detail CSV disimpan: {detail_path.name}")

    # 4. Hitung metrik evaluasi
    acc, cm, report, labels = hitung_metrik(df)

    # 5. Distribusi perbedaan per kelas
    dist = distribusi_perbedaan(df)

    # 6. Plot confusion matrix
    plot_confusion_matrix(cm, labels, OUTPUT_DIR / "confusion_matrix.png")

    # 7. Plot grafik distribusi
    plot_distribusi(df, OUTPUT_DIR / "grafik_distribusi.png")

    # 8. Simpan summary lengkap
    simpan_summary(acc, report, dist, df, OUTPUT_DIR / "komparasi_summary.txt")

    # 9. Simpan classification report terpisah
    cr_path = OUTPUT_DIR / "classification_report.txt"
    with open(cr_path, "w", encoding="utf-8") as f:
        f.write("CLASSIFICATION REPORT\n")
        f.write("Auto Labelling (Lexicon) vs Expert — After COVID\n")
        f.write("=" * 60 + "\n\n")
        f.write(report)
    print(f"   ✅ Classification report disimpan: {cr_path.name}")

    print("\n" + "=" * 70)
    print("  ✅ SELESAI — output tersimpan di dev_database/8_komparasi/")
    print("=" * 70)


if __name__ == "__main__":
    main()