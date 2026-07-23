# services/development/visualisasiLabel.py

import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

# ══════════════════════════════════════════════════════════════
#  PATH
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "dev_database" / "plots"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Dipetakan per periode (bukan list biasa) supaya tiap file bisa
# diproses & digambar terpisah, bukan digabung jadi satu chart.
FILES_S1S3 = {
    "Before Covid": "dev_database/2_labelling_S1S3/tweets_before_covid_labellingLexicon.csv",
    "Covid":        "dev_database/2_labelling_S1S3/tweets_covid_labellingLexicon.csv",
    "After Covid":  "dev_database/2_labelling_S1S3/tweets_after_covid_labellingLexicon.csv",
}

FILES_S2 = {
    "Before Covid": "dev_database/2_labelling_S2/tweets_before_covid_labellingLexicon.csv",
    "Covid":        "dev_database/2_labelling_S2/tweets_covid_labellingLexicon.csv",
    "After Covid":  "dev_database/2_labelling_S2/tweets_after_covid_labellingLexicon.csv",
}

# Warna konsisten dipakai di semua grafik pada bagian ini
COLOR_MAP = {
    "positif": "#4CAF50",
    "netral":  "#FFC107",
    "negatif": "#F44336",
}

# Dipakai untuk penamaan file output supaya konsisten & tanpa spasi
SLUG = {
    "Before Covid": "before_covid",
    "Covid":        "covid",
    "After Covid":  "after_covid",
}


# ══════════════════════════════════════════════════════════════
#  HELPER: BACA CSV DENGAN FALLBACK ENCODING
# ══════════════════════════════════════════════════════════════
def _read_csv_safe(filepath: Path):
    try:
        return pd.read_csv(filepath, encoding="utf-8")
    except UnicodeDecodeError:
        try:
            return pd.read_csv(filepath, encoding="latin-1")
        except Exception as e:
            return e
    except FileNotFoundError as e:
        return e
    except Exception as e:
        return e


def _bar_labels(ax):
    """Menambahkan angka di atas tiap bar."""
    for container in ax.containers:
        ax.bar_label(container, fmt="%d", padding=2, fontsize=8)


# ══════════════════════════════════════════════════════════════
#  1. GRAFIK GENERAL — TIGA LABEL (dari Tabel 4.8)
# ══════════════════════════════════════════════════════════════
def plot_general_distribution_3label():
    """
    Bar chart distribusi positif/netral/negatif per periode,
    diambil langsung dari angka yang sudah ada di Tabel 4.8
    (Distribusi Hasil Pelabelan Tiga Label), tanpa perlu baca CSV.
    """
    data = {
        "Before Covid": {"Positif": 5197,  "Netral": 6121,  "Negatif": 2277},
        "Covid":        {"Positif": 25071, "Netral": 28500, "Negatif": 8276},
        "After Covid":  {"Positif": 8185,  "Netral": 26140, "Negatif": 7287},
    }
    df = pd.DataFrame(data).T  # index = periode, kolom = label

    fig, ax = plt.subplots(figsize=(9, 6))
    df.plot(
        kind="bar",
        ax=ax,
        color=[COLOR_MAP["positif"], COLOR_MAP["netral"], COLOR_MAP["negatif"]],
        width=0.7,
    )
    ax.set_title("Distribusi Hasil Pelabelan Tiga Label per Periode")
    ax.set_xlabel("Periode")
    ax.set_ylabel("Jumlah Tweet")
    ax.set_xticklabels(df.index, rotation=0)
    ax.legend(title="Sentimen")
    _bar_labels(ax)
    fig.tight_layout()

    out_path = OUTPUT_DIR / "general_distribusi_3label.png"
    fig.savefig(out_path, dpi=200)
    plt.close(fig)
    print(f"✅ Tersimpan: {out_path}")


# ══════════════════════════════════════════════════════════════
#  2. GRAFIK PER-SAHAM — TIGA LABEL, DIPISAH PER PERIODE
# ══════════════════════════════════════════════════════════════
def plot_per_saham_3label():
    """
    Membuat satu chart TERPISAH untuk setiap periode (before/covid/
    after), masing-masing menampilkan distribusi positif/netral/
    negatif per saham pada periode tersebut. Hasilnya 3 file PNG,
    bukan 1 file gabungan semua periode.
    """
    for periode, rel_path in FILES_S1S3.items():
        full_path = BASE_DIR / rel_path

        if not full_path.exists():
            print(f"⚠️  File tidak ditemukan, dilewati: {full_path.name}")
            continue

        df = _read_csv_safe(full_path)
        if not isinstance(df, pd.DataFrame):
            print(f"⚠️  Gagal membaca {full_path.name}: {df}")
            continue

        for col in ("saham", "sentiment"):
            if col not in df.columns:
                raise KeyError(f"Kolom '{col}' tidak ditemukan pada {full_path.name}")

        df["sentiment"] = df["sentiment"].str.lower()

        pivot = (
            df.groupby(["saham", "sentiment"])
            .size()
            .unstack(fill_value=0)
        )

        # Urutkan kolom: positif, netral, negatif (kalau ada)
        order = [c for c in ["positif", "netral", "negatif"] if c in pivot.columns]
        pivot = pivot[order]

        fig, ax = plt.subplots(figsize=(12, 6))
        pivot.plot(
            kind="bar",
            ax=ax,
            color=[COLOR_MAP[c] for c in order],
            width=0.75,
        )
        ax.set_title(f"Distribusi Sentimen Tiga Label per Saham — {periode}")
        ax.set_xlabel("Saham")
        ax.set_ylabel("Jumlah Tweet")
        ax.set_xticklabels(pivot.index, rotation=0)
        ax.legend(title="Sentimen")
        _bar_labels(ax)
        fig.tight_layout()

        out_path = OUTPUT_DIR / f"persaham_distribusi_3label_{SLUG[periode]}.png"
        fig.savefig(out_path, dpi=200)
        plt.close(fig)
        print(f"✅ Tersimpan: {out_path}")


# ══════════════════════════════════════════════════════════════
#  3. GRAFIK GENERAL — DUA LABEL (dari Tabel 4.10)
# ══════════════════════════════════════════════════════════════
def plot_general_distribution_2label():
    """
    Bar chart distribusi positif/negatif per periode,
    diambil langsung dari angka Tabel 4.10 (Distribusi Hasil
    Pelabelan Dua Label).
    """
    data = {
        "Before Covid": {"Positif": 9778,  "Negatif": 3817},
        "Covid":        {"Positif": 44762, "Negatif": 17085},
        "After Covid":  {"Positif": 30066, "Negatif": 11546},
    }
    df = pd.DataFrame(data).T

    fig, ax = plt.subplots(figsize=(9, 6))
    df.plot(
        kind="bar",
        ax=ax,
        color=[COLOR_MAP["positif"], COLOR_MAP["negatif"]],
        width=0.6,
    )
    ax.set_title("Distribusi Hasil Pelabelan Dua Label per Periode")
    ax.set_xlabel("Periode")
    ax.set_ylabel("Jumlah Tweet")
    ax.set_xticklabels(df.index, rotation=0)
    ax.legend(title="Sentimen")
    _bar_labels(ax)
    fig.tight_layout()

    out_path = OUTPUT_DIR / "general_distribusi_2label.png"
    fig.savefig(out_path, dpi=200)
    plt.close(fig)
    print(f"✅ Tersimpan: {out_path}")


# ══════════════════════════════════════════════════════════════
#  4. GRAFIK PER-SAHAM — DUA LABEL, DIPISAH PER PERIODE
# ══════════════════════════════════════════════════════════════
def plot_per_saham_2label():
    """
    Sama seperti plot_per_saham_3label(), tapi untuk skenario dua
    label (positif/negatif) dari data S2. Menghasilkan 3 file PNG
    terpisah, satu per periode.
    """
    for periode, rel_path in FILES_S2.items():
        full_path = BASE_DIR / rel_path

        if not full_path.exists():
            print(f"⚠️  File tidak ditemukan, dilewati: {full_path.name}")
            continue

        df = _read_csv_safe(full_path)
        if not isinstance(df, pd.DataFrame):
            print(f"⚠️  Gagal membaca {full_path.name}: {df}")
            continue

        for col in ("saham", "sentiment"):
            if col not in df.columns:
                raise KeyError(f"Kolom '{col}' tidak ditemukan pada {full_path.name}")

        df["sentiment"] = df["sentiment"].str.lower()

        pivot = (
            df.groupby(["saham", "sentiment"])
            .size()
            .unstack(fill_value=0)
        )

        order = [c for c in ["positif", "negatif"] if c in pivot.columns]
        pivot = pivot[order]

        fig, ax = plt.subplots(figsize=(12, 6))
        pivot.plot(
            kind="bar",
            ax=ax,
            color=[COLOR_MAP[c] for c in order],
            width=0.6,
        )
        ax.set_title(f"Distribusi Sentimen Dua Label per Saham — {periode}")
        ax.set_xlabel("Saham")
        ax.set_ylabel("Jumlah Tweet")
        ax.set_xticklabels(pivot.index, rotation=0)
        ax.legend(title="Sentimen")
        _bar_labels(ax)
        fig.tight_layout()

        out_path = OUTPUT_DIR / f"persaham_distribusi_2label_{SLUG[periode]}.png"
        fig.savefig(out_path, dpi=200)
        plt.close(fig)
        print(f"✅ Tersimpan: {out_path}")


# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════
def main():
    print("=" * 70)
    print("  GENERATE VISUALISASI DISTRIBUSI LABEL SENTIMEN")
    print("=" * 70)

    print("\n[1/4] Grafik general - tiga label (dari Tabel 4.8)")
    plot_general_distribution_3label()

    print("\n[2/4] Grafik per-saham - tiga label, per periode (dari data S1S3)")
    plot_per_saham_3label()

    print("\n[3/4] Grafik general - dua label (dari Tabel 4.10)")
    plot_general_distribution_2label()

    print("\n[4/4] Grafik per-saham - dua label, per periode (dari data S2)")
    plot_per_saham_2label()

    print(f"\n{'=' * 70}")
    print(f"  Semua grafik tersimpan di: {OUTPUT_DIR}")
    print(f"{'=' * 70}\n")


if __name__ == "__main__":
    main()