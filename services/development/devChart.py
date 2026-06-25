"""
devChart.py
===========
Menghasilkan grafik distribusi dataset dan persebaran labelling.

Output (disimpan di folder `services/development/dev_database/11_chart/`):
  1. chart_distribusi_periode.png       — Distribusi tweet per periode (Tabel 4.5)
  2. chart_distribusi_saham.png         — Distribusi tweet per kode saham (Tabel 4.6)
  3. chart_labelling_3label_periode.png — Persebaran label (Pos/Neg/Netral) per periode
  4. chart_labelling_3label_saham.png   — Persebaran label (Pos/Neg/Netral) per saham
  5. chart_labelling_2label_periode.png — Persebaran label (Pos/Neg) per periode
  6. chart_labelling_2label_saham.png   — Persebaran label (Pos/Neg) per saham
"""

import os
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.ticker as mticker
import numpy as np

# ─── KONFIGURASI PATH ──────────────────────────────────────────────────────────
# Script ini berada di: services/development/devChart.py
# Semua path dihitung relatif terhadap lokasi script

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
OUT_DIR    = os.path.join(BASE_DIR, "dev_database", "11_chart")
os.makedirs(OUT_DIR, exist_ok=True)

RAW_DIR    = os.path.join(BASE_DIR, "dev_database", "1_raw")
LABEL_S1S3 = os.path.join(BASE_DIR, "dev_database", "2_labelling_S1S3")
LABEL_S2   = os.path.join(BASE_DIR, "dev_database", "2_labelling_S2")

# ─── KONSTANTA ─────────────────────────────────────────────────────────────────

PERIODS = {
    "Before Covid\n(2018–2019)": "tweets_before_covid",
    "Covid\n(2020–2022)":        "tweets_covid",
    "After Covid\n(2023–2025)":  "tweets_after_covid",
}

PERIOD_LABELS  = list(PERIODS.keys())
PERIOD_SHORT   = ["Before Covid", "Covid", "After Covid"]   # label singkat untuk axis
PERIOD_COLORS  = ["#4F86C6", "#E05C5C", "#4CAF8A"]

SAHAM_ORDER    = ["BBRI", "TLKM", "BMRI", "UNVR", "ICBP", "ISAT"]
SAHAM_COLORS   = ["#1A3A6B", "#2E6DA4", "#4F86C6", "#7BAFD4", "#A8CDE8", "#C4DCF0"]

LABEL_3_COLORS = {"positif": "#4CAF8A", "negatif": "#E05C5C", "netral": "#F4A540"}
LABEL_2_COLORS = {"positif": "#4CAF8A", "negatif": "#E05C5C"}

FONT_TITLE = {"fontsize": 13, "fontweight": "bold", "color": "#1A3A6B"}
FONT_AXIS  = {"fontsize": 10, "color": "#4A5568"}
FONT_TICK  = {"labelsize": 9,  "labelcolor": "#4A5568"}

# ─── HELPER ────────────────────────────────────────────────────────────────────

def fmt_rb(x, _=None):
    """Format angka ribuan pakai titik (38.616)."""
    return f"{int(x):,}".replace(",", ".")


def load_csv(folder: str, basename: str) -> pd.DataFrame:
    path = os.path.join(folder, f"{basename}.csv")
    if not os.path.exists(path):
        raise FileNotFoundError(f"File tidak ditemukan: {path}")
    df = pd.read_csv(path, encoding="utf-8-sig")
    df.columns = df.columns.str.strip().str.lower()
    if "saham" in df.columns:
        df["saham"] = df["saham"].str.upper().str.strip()
    if "sentiment" in df.columns:
        df["sentiment"] = df["sentiment"].str.lower().str.strip()
    return df


def save_fig(fig: plt.Figure, filename: str):
    path = os.path.join(OUT_DIR, filename)
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"  ✓ Tersimpan: {path}")


def _grouped_bar(ax, groups, categories, data_dict, colors,
                 title, xlabel, ylabel, rotation=0):
    """Grouped bar chart dengan label nilai di atas tiap bar."""
    n_cats = len(categories)
    width  = 0.7 / n_cats
    x      = np.arange(len(groups))

    for i, cat in enumerate(categories):
        vals   = data_dict[cat]
        offset = (i - n_cats / 2 + 0.5) * width
        bars   = ax.bar(x + offset, vals, width=width * 0.90,
                        color=colors[cat], label=cat.capitalize(),
                        edgecolor="white", linewidth=0.8, zorder=3)
        # nilai di atas bar — hitung ylim setelah semua bar tergambar
        for bar in bars:
            h = bar.get_height()
            if h > 0:
                ax.text(bar.get_x() + bar.get_width() / 2, h,
                        f"{int(h):,}".replace(",", "."),
                        ha="center", va="bottom", fontsize=7.5,
                        color=colors[cat], fontweight="bold")

    ax.set_xticks(x)
    ax.set_xticklabels(groups, rotation=rotation, ha="center", **FONT_AXIS)
    ax.set_title(title, pad=12, **FONT_TITLE)
    ax.set_ylabel(ylabel, **FONT_AXIS)
    ax.set_xlabel(xlabel, **FONT_AXIS)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(fmt_rb))
    ax.tick_params(**FONT_TICK)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", linestyle="--", alpha=0.35, zorder=0)
    ax.legend(loc="upper right", framealpha=0.85, fontsize=9)
    # berikan ruang di atas bar tertinggi untuk label
    ax.set_ylim(0, ax.get_ylim()[1] * 1.12)


def _stacked_100(ax, groups, categories, data_dict, colors, title):
    """Stacked 100% bar chart dengan label % di dalam tiap segmen."""
    x      = np.arange(len(groups))
    totals = [sum(data_dict[c][i] for c in categories) for i in range(len(groups))]
    bottom = np.zeros(len(groups))

    for cat in categories:
        vals = np.array(data_dict[cat]) / np.array(totals) * 100
        bars = ax.bar(x, vals, bottom=bottom, color=colors[cat],
                      label=cat.capitalize(), edgecolor="white",
                      linewidth=0.8, width=0.55, zorder=3)
        for bar, val in zip(bars, vals):
            if val > 5:
                ax.text(bar.get_x() + bar.get_width() / 2,
                        bar.get_y() + bar.get_height() / 2,
                        f"{val:.1f}%", ha="center", va="center",
                        fontsize=8.5, fontweight="bold", color="white")
        bottom += vals

    ax.set_xticks(x)
    ax.set_xticklabels(groups, **FONT_AXIS)
    ax.set_title(title, pad=12, **FONT_TITLE)
    ax.set_ylabel("Proporsi (%)", **FONT_AXIS)
    ax.set_ylim(0, 105)
    ax.tick_params(**FONT_TICK)
    ax.spines[["top", "right"]].set_visible(False)
    ax.legend(loc="upper right", framealpha=0.85, fontsize=9)


def _pie_subplots(fig, rect_list, groups, categories, data_dict, colors):
    """
    Tambahkan satu pie chart per grup ke figure menggunakan add_axes.
    rect_list : list of [left, bottom, width, height] dalam figure coords
    groups    : PERIOD_LABELS (list dengan \n)
    """
    for rect, group in zip(rect_list, groups):
        idx  = groups.index(group)
        vals = [data_dict[cat][idx] for cat in categories]
        ax   = fig.add_axes(rect)
        wedges, _, autotexts = ax.pie(
            vals,
            colors=[colors[c] for c in categories],
            autopct=lambda p: f"{p:.1f}%" if p > 4 else "",
            startangle=90,
            pctdistance=0.70,
            wedgeprops={"edgecolor": "white", "linewidth": 1.5},
        )
        for at in autotexts:
            at.set_fontsize(8.5)
            at.set_fontweight("bold")
            at.set_color("white")
        ax.set_title(group.replace("\n", "\n"), fontsize=9,
                     fontweight="bold", color="#1A3A6B", pad=4)

    # legend bersama di bagian bawah figure
    patches = [mpatches.Patch(color=colors[c], label=c.capitalize())
               for c in categories]
    fig.legend(handles=patches, loc="lower center",
               ncol=len(categories), fontsize=10,
               framealpha=0.9, bbox_to_anchor=(0.73, 0.02))


# ─── LOAD DATA ─────────────────────────────────────────────────────────────────

print("Memuat data raw...")
raw_frames = {}
for lbl, base in PERIODS.items():
    raw_frames[lbl] = load_csv(RAW_DIR, base)

print("Memuat data labelling 3 label (S1/S3)...")
label3_frames = {}
for lbl, base in PERIODS.items():
    label3_frames[lbl] = load_csv(LABEL_S1S3, f"{base}_labellingLexicon")

print("Memuat data labelling 2 label (S2)...")
label2_frames = {}
for lbl, base in PERIODS.items():
    label2_frames[lbl] = load_csv(LABEL_S2, f"{base}_labellingLexicon")

print("Data berhasil dimuat.\n")

# ─── 1. DISTRIBUSI PER PERIODE ─────────────────────────────────────────────────

def chart_distribusi_periode():
    counts = [len(raw_frames[p]) for p in PERIOD_LABELS]
    total  = sum(counts)

    fig, ax = plt.subplots(figsize=(9, 5))
    fig.patch.set_facecolor("white")

    bars = ax.bar(PERIOD_SHORT, counts,
                  color=PERIOD_COLORS, width=0.5,
                  edgecolor="white", linewidth=1.5, zorder=3)

    for bar, cnt, color in zip(bars, counts, PERIOD_COLORS):
        pct = cnt / total * 100
        # label jumlah di atas bar
        ax.text(bar.get_x() + bar.get_width() / 2,
                bar.get_height() + total * 0.007,
                f"{cnt:,}".replace(",", "."),
                ha="center", va="bottom", fontsize=10,
                fontweight="bold", color=color)
        # label % di dalam bar
        ax.text(bar.get_x() + bar.get_width() / 2,
                bar.get_height() / 2,
                f"{pct:.1f}%",
                ha="center", va="center", fontsize=12,
                fontweight="bold", color="white")

    ax.set_title("Distribusi Dataset Berdasarkan Periode",
                 pad=14, **FONT_TITLE)
    ax.set_ylabel("Jumlah Tweet", **FONT_AXIS)
    ax.set_ylim(0, max(counts) * 1.18)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(fmt_rb))
    ax.tick_params(**FONT_TICK)
    ax.spines[["top", "right", "left"]].set_visible(False)
    ax.yaxis.set_ticks_position("none")
    ax.grid(axis="y", linestyle="--", alpha=0.4, zorder=0)
    ax.annotate(f"Total: {total:,} tweet".replace(",", "."),
                xy=(0.98, 0.96), xycoords="axes fraction",
                ha="right", va="top", fontsize=9,
                color="#6B7C99", style="italic")

    fig.tight_layout()
    save_fig(fig, "chart_distribusi_periode.png")


# ─── 2. DISTRIBUSI PER SAHAM ───────────────────────────────────────────────────

def chart_distribusi_saham():
    all_raw = pd.concat(raw_frames.values(), ignore_index=True)
    counts  = all_raw["saham"].value_counts().reindex(SAHAM_ORDER, fill_value=0)
    total   = counts.sum()

    fig, ax = plt.subplots(figsize=(9, 5))
    fig.patch.set_facecolor("white")

    y_pos = np.arange(len(SAHAM_ORDER))
    ax.barh(y_pos, counts.values, color=SAHAM_COLORS,
            height=0.55, edgecolor="white", linewidth=1.2, zorder=3)

    for i, (cnt, color) in enumerate(zip(counts.values, SAHAM_COLORS)):
        pct = cnt / total * 100
        ax.text(cnt + total * 0.003, i,
                f"{cnt:,}  ({pct:.1f}%)".replace(",", "."),
                va="center", ha="left", fontsize=9,
                fontweight="bold", color="#2D3748")

    ax.set_yticks(y_pos)
    ax.set_yticklabels(SAHAM_ORDER, fontsize=11,
                       fontweight="bold", color="#1A3A6B")
    ax.set_title("Distribusi Dataset Berdasarkan Kode Saham",
                 pad=14, **FONT_TITLE)
    ax.set_xlabel("Jumlah Tweet", **FONT_AXIS)
    ax.set_xlim(0, counts.max() * 1.25)
    ax.xaxis.set_major_formatter(mticker.FuncFormatter(fmt_rb))
    ax.tick_params(**FONT_TICK)
    ax.spines[["top", "right", "bottom"]].set_visible(False)
    ax.xaxis.set_ticks_position("none")
    ax.grid(axis="x", linestyle="--", alpha=0.4, zorder=0)
    ax.invert_yaxis()
    ax.annotate(f"Total: {total:,} tweet".replace(",", "."),
                xy=(0.98, 0.02), xycoords="axes fraction",
                ha="right", va="bottom", fontsize=9,
                color="#6B7C99", style="italic")

    fig.tight_layout()
    save_fig(fig, "chart_distribusi_saham.png")


# ─── 3. LABELLING 3 LABEL — PER PERIODE ───────────────────────────────────────

def chart_labelling_3label_periode():
    cats = ["positif", "negatif", "netral"]
    data = {c: [] for c in cats}
    for p in PERIOD_LABELS:
        vc = label3_frames[p]["sentiment"].value_counts()
        for c in cats:
            data[c].append(vc.get(c, 0))

    fig = plt.figure(figsize=(14, 5.5))
    fig.patch.set_facecolor("white")
    fig.suptitle(
        "Persebaran Labelling 3 Label (Positif / Negatif / Netral)  —  Berdasarkan Periode",
        fontsize=13, fontweight="bold", color="#1A3A6B", y=1.00,
    )

    # Grouped bar di kiri (60% lebar)
    ax_bar = fig.add_axes([0.05, 0.12, 0.52, 0.76])
    _grouped_bar(ax_bar, PERIOD_SHORT, cats, data, LABEL_3_COLORS,
                 title="Grouped Bar Chart", xlabel="Periode",
                 ylabel="Jumlah Tweet")

    # 3 pie charts di kanan
    pie_rects = [
        [0.60, 0.18, 0.12, 0.62],
        [0.73, 0.18, 0.12, 0.62],
        [0.86, 0.18, 0.12, 0.62],
    ]
    _pie_subplots(fig, pie_rects, PERIOD_LABELS, cats, data, LABEL_3_COLORS)

    save_fig(fig, "chart_labelling_3label_periode.png")


# ─── 4. LABELLING 3 LABEL — PER SAHAM ─────────────────────────────────────────

def chart_labelling_3label_saham():
    cats   = ["positif", "negatif", "netral"]
    all_df = pd.concat(label3_frames.values(), ignore_index=True)
    data   = {c: [] for c in cats}
    for saham in SAHAM_ORDER:
        vc = all_df[all_df["saham"] == saham]["sentiment"].value_counts()
        for c in cats:
            data[c].append(vc.get(c, 0))

    fig, axes = plt.subplots(1, 2, figsize=(15, 5.5))
    fig.patch.set_facecolor("white")
    fig.suptitle(
        "Persebaran Labelling 3 Label (Positif / Negatif / Netral)  —  Berdasarkan Kode Saham",
        fontsize=13, fontweight="bold", color="#1A3A6B", y=1.00,
    )

    _grouped_bar(axes[0], SAHAM_ORDER, cats, data, LABEL_3_COLORS,
                 title="Grouped Bar Chart", xlabel="Kode Saham",
                 ylabel="Jumlah Tweet")
    _stacked_100(axes[1], SAHAM_ORDER, cats, data, LABEL_3_COLORS,
                 title="Stacked 100% Bar")

    fig.tight_layout(rect=[0, 0, 1, 0.97])
    save_fig(fig, "chart_labelling_3label_saham.png")


# ─── 5. LABELLING 2 LABEL — PER PERIODE ───────────────────────────────────────

def chart_labelling_2label_periode():
    cats = ["positif", "negatif"]
    data = {c: [] for c in cats}
    for p in PERIOD_LABELS:
        vc = label2_frames[p]["sentiment"].value_counts()
        for c in cats:
            data[c].append(vc.get(c, 0))

    fig = plt.figure(figsize=(13, 5.5))
    fig.patch.set_facecolor("white")
    fig.suptitle(
        "Persebaran Labelling 2 Label (Positif / Negatif)  —  Berdasarkan Periode",
        fontsize=13, fontweight="bold", color="#1A3A6B", y=1.00,
    )

    ax_bar = fig.add_axes([0.05, 0.12, 0.52, 0.76])
    _grouped_bar(ax_bar, PERIOD_SHORT, cats, data, LABEL_2_COLORS,
                 title="Grouped Bar Chart", xlabel="Periode",
                 ylabel="Jumlah Tweet")

    pie_rects = [
        [0.61, 0.18, 0.12, 0.62],
        [0.74, 0.18, 0.12, 0.62],
        [0.87, 0.18, 0.12, 0.62],
    ]
    _pie_subplots(fig, pie_rects, PERIOD_LABELS, cats, data, LABEL_2_COLORS)

    save_fig(fig, "chart_labelling_2label_periode.png")


# ─── 6. LABELLING 2 LABEL — PER SAHAM ─────────────────────────────────────────

def chart_labelling_2label_saham():
    cats   = ["positif", "negatif"]
    all_df = pd.concat(label2_frames.values(), ignore_index=True)
    data   = {c: [] for c in cats}
    for saham in SAHAM_ORDER:
        vc = all_df[all_df["saham"] == saham]["sentiment"].value_counts()
        for c in cats:
            data[c].append(vc.get(c, 0))

    fig, axes = plt.subplots(1, 2, figsize=(14, 5.5))
    fig.patch.set_facecolor("white")
    fig.suptitle(
        "Persebaran Labelling 2 Label (Positif / Negatif)  —  Berdasarkan Kode Saham",
        fontsize=13, fontweight="bold", color="#1A3A6B", y=1.00,
    )

    _grouped_bar(axes[0], SAHAM_ORDER, cats, data, LABEL_2_COLORS,
                 title="Grouped Bar Chart", xlabel="Kode Saham",
                 ylabel="Jumlah Tweet")
    _stacked_100(axes[1], SAHAM_ORDER, cats, data, LABEL_2_COLORS,
                 title="Stacked 100% Bar")

    fig.tight_layout(rect=[0, 0, 1, 0.97])
    save_fig(fig, "chart_labelling_2label_saham.png")


# ─── MAIN ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== Grafik Distribusi Dataset ===")
    chart_distribusi_periode()
    chart_distribusi_saham()

    print("\n=== Grafik Labelling 3 Label ===")
    chart_labelling_3label_periode()
    chart_labelling_3label_saham()

    print("\n=== Grafik Labelling 2 Label ===")
    chart_labelling_2label_periode()
    chart_labelling_2label_saham()

    print(f"\n✅ Selesai! Semua grafik tersimpan di:\n   {OUT_DIR}")