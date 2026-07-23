# services/development/devCek.py

import pandas as pd
from pathlib import Path

# ══════════════════════════════════════════════════════════════
#  PATH
# ══════════════════════════════════════════════════════════════
BASE_DIR = Path(__file__).resolve().parent

FILES = {
    # ── 1_raw ──────────────────────────────────────────────────
    "1_raw": [
        "dev_database/1_raw/tweets_after_covid_baru.csv",
        "dev_database/1_raw/tweets_after_covid.csv",
        "dev_database/1_raw/tweets_all_periods.csv",
        "dev_database/1_raw/tweets_before_covid.csv",
        "dev_database/1_raw/tweets_covid.csv",
    ],

    # ── 2_labelling_S1S3 ───────────────────────────────────────
    "2_labelling_S1S3": [
        "dev_database/2_labelling_S1S3/tweets_after_covid_baru_labellingLexicon.csv",
        "dev_database/2_labelling_S1S3/tweets_after_covid_labellingLexicon.csv",
        "dev_database/2_labelling_S1S3/tweets_all_periods_labellingLexicon.csv",
        "dev_database/2_labelling_S1S3/tweets_before_covid_labellingLexicon.csv",
        "dev_database/2_labelling_S1S3/tweets_covid_labellingLexicon.csv",
    ],

    # ── 2_labelling_S2 ─────────────────────────────────────────
    "2_labelling_S2": [
        "dev_database/2_labelling_S2/tweets_after_covid_labellingLexicon.csv",
        "dev_database/2_labelling_S2/tweets_all_periods_labellingLexicon.csv",
        "dev_database/2_labelling_S2/tweets_before_covid_labellingLexicon.csv",
        "dev_database/2_labelling_S2/tweets_covid_labellingLexicon.csv",
    ],

    # ── 3_preprocessing / S1S3 / dl ───────────────────────────
    "3_preprocessing/S1S3/dl": [
        "dev_database/3_preprocessing/S1S3/dl/tweets_after_covid_labellingLexicon_preprocessingDL.csv",
        "dev_database/3_preprocessing/S1S3/dl/tweets_before_covid_labellingLexicon_preprocessingDL.csv",
        "dev_database/3_preprocessing/S1S3/dl/tweets_covid_labellingLexicon_preprocessingDL.csv",
        "dev_database/3_preprocessing/S1S3/dl/tweets_all_periods_labellingLexicon_preprocessingDL.csv",
    ],

    # ── 3_preprocessing / S1S3 / ml ───────────────────────────
    "3_preprocessing/S1S3/ml": [
        "dev_database/3_preprocessing/S1S3/ml/tweets_after_covid_labellingLexicon_preprocessingML.csv",
        "dev_database/3_preprocessing/S1S3/ml/tweets_before_covid_labellingLexicon_preprocessingML.csv",
        "dev_database/3_preprocessing/S1S3/ml/tweets_covid_labellingLexicon_preprocessingML.csv",
        "dev_database/3_preprocessing/S1S3/ml/tweets_all_periods_labellingLexicon_preprocessingML.csv",
    ],

    # ── 3_preprocessing / S2 / dl ─────────────────────────────
    "3_preprocessing/S2/dl": [
        "dev_database/3_preprocessing/S2/dl/tweets_after_covid_labellingLexicon_preprocessingDL.csv",
        "dev_database/3_preprocessing/S2/dl/tweets_before_covid_labellingLexicon_preprocessingDL.csv",
        "dev_database/3_preprocessing/S2/dl/tweets_covid_labellingLexicon_preprocessingDL.csv",
        "dev_database/3_preprocessing/S2/dl/tweets_all_periods_labellingLexicon_preprocessingDL.csv",
    ],

    # ── 3_preprocessing / S2 / ml ─────────────────────────────
    "3_preprocessing/S2/ml": [
        "dev_database/3_preprocessing/S2/ml/tweets_after_covid_labellingLexicon_preprocessingML.csv",
        "dev_database/3_preprocessing/S2/ml/tweets_before_covid_labellingLexicon_preprocessingML.csv",
        "dev_database/3_preprocessing/S2/ml/tweets_covid_labellingLexicon_preprocessingML.csv",
        "dev_database/3_preprocessing/S2/ml/tweets_all_periods_labellingLexicon_preprocessingML.csv",
    ],
}


# ══════════════════════════════════════════════════════════════
#  HELPER: BACA CSV DENGAN FALLBACK ENCODING
# ══════════════════════════════════════════════════════════════
def _read_csv_safe(filepath: Path):
    """
    Membaca CSV dengan fallback encoding utf-8 -> latin-1.

    Dipisah jadi helper sendiri (bukan ditulis ulang di setiap fungsi)
    supaya logic pembacaan file konsisten di semua fungsi cek —
    kalau suatu saat perlu tambah encoding lain, cukup ubah di satu
    tempat ini saja (prinsip DRY / single source of truth).

    Returns
    -------
    pd.DataFrame jika berhasil dibaca.
    Exception jika gagal (dikembalikan sebagai object, BUKAN di-raise),
    supaya fungsi pemanggil bisa memutuskan sendiri cara menampilkan
    pesan error tanpa perlu try-except berulang di banyak tempat.
    """
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


# ══════════════════════════════════════════════════════════════
#  CEK JUMLAH BARIS
# ══════════════════════════════════════════════════════════════
def count_rows(filepath: Path) -> int | str:
    if not filepath.exists():
        return "FILE NOT FOUND"

    result = _read_csv_safe(filepath)

    if isinstance(result, pd.DataFrame):
        return len(result)
    return f"ERROR: {result}"


# ══════════════════════════════════════════════════════════════
#  DISTRIBUSI SAHAM ALL_PERIODS
# ══════════════════════════════════════════════════════════════
def show_all_periods_distribution():
    path = BASE_DIR / "dev_database/1_raw/tweets_all_periods.csv"

    if not path.exists():
        print("\n❌ File tweets_all_periods.csv tidak ditemukan")
        return

    df = _read_csv_safe(path)
    if not isinstance(df, pd.DataFrame):
        print(f"\n❌ Error membaca distribusi saham: {df}")
        return

    if "saham" not in df.columns:
        print("\n❌ Kolom 'saham' tidak ditemukan")
        return

    total = len(df)

    print("\n" + "=" * 70)
    print("  DISTRIBUSI TWEET PER SAHAM (ALL_PERIODS)")
    print("=" * 70)
    print(f"{'Saham':<15} {'Jumlah Tweet':>15} {'Persentase':>15}")
    print("-" * 70)

    dist = df["saham"].value_counts().sort_values(ascending=False)

    for saham, jumlah in dist.items():
        persen = jumlah / total * 100
        print(
            f"{saham:<15} "
            f"{jumlah:>15,} "
            f"{persen:>14.2f}%"
        )

    print("-" * 70)
    print(f"{'TOTAL':<15} {total:>15,} {100:>14.2f}%")
    print("=" * 70)


# ══════════════════════════════════════════════════════════════
#  CEK DISTRIBUSI LABEL SENTIMEN (BARU)
# ══════════════════════════════════════════════════════════════
def show_label_distribution(group_name: str, paths: list[str]):
    """
    Menampilkan distribusi label sentimen (positif/negatif/netral,
    tergantung skenario) untuk setiap file CSV dalam satu grup.

    Dipakai untuk memvalidasi hasil auto labelling S1 (tiga label)
    maupun S2 (dua label) sebelum angkanya dipindahkan ke tabel
    skripsi (Tabel 4.X "Distribusi Hasil Pelabelan").

    Parameters
    ----------
    group_name : str
        Nama grup yang ditampilkan di header (contoh: "Skenario 1
        - Tiga Label").
    paths : list[str]
        Daftar path relatif file CSV yang punya kolom 'sentiment'.
        Biasanya diambil langsung dari dict FILES, contoh:
        FILES["2_labelling_S1S3"].

    Catatan penting:
    - Fungsi ini TIDAK menggabungkan file 'all_periods' dengan file
      per-periode (before/covid/after), karena all_periods biasanya
      SUPERSET dari ketiganya. Kalau digabung, angka distribusi bisa
      dobel/salah. Jadi hasilnya ditampilkan per file apa adanya.
    """
    print("\n" + "=" * 70)
    print(f"  DISTRIBUSI LABEL SENTIMEN — {group_name}")
    print("=" * 70)

    for rel_path in paths:
        full_path = BASE_DIR / rel_path
        filename  = full_path.name

        if not full_path.exists():
            print(f"\n  📄 {filename}")
            print(f"     ❌ FILE NOT FOUND")
            continue

        df = _read_csv_safe(full_path)
        if not isinstance(df, pd.DataFrame):
            print(f"\n  📄 {filename}")
            print(f"     ❌ ERROR: {df}")
            continue

        if "sentiment" not in df.columns:
            print(f"\n  📄 {filename}")
            print(f"     ❌ Kolom 'sentiment' tidak ditemukan")
            continue

        total = len(df)
        # dropna supaya baris yang belum dilabeli (kosong) tidak
        # ikut dianggap sebagai satu kategori label tersendiri
        dist = df["sentiment"].value_counts(dropna=True)
        kosong = df["sentiment"].isna().sum()

        print(f"\n  📄 {filename}  (total baris: {total:,})")
        print(f"  {'-' * 52}")
        print(f"  {'Sentiment':<15}{'Jumlah':>15}{'Persentase':>20}")
        print(f"  {'-' * 52}")

        for label, jumlah in dist.items():
            persen = jumlah / total * 100
            print(f"  {label:<15}{jumlah:>15,}{persen:>19.2f}%")

        if kosong > 0:
            persen_kosong = kosong / total * 100
            print(f"  {'(kosong/NaN)':<15}{kosong:>15,}{persen_kosong:>19.2f}%")

        print(f"  {'-' * 52}")
        print(f"  {'TOTAL':<15}{total:>15,}{100:>19.2f}%")


# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════
def main():
    print("=" * 70)
    print("  CEK JUMLAH BARIS DATA CSV")
    print("=" * 70)

    total_files   = 0
    found_files   = 0
    missing_files = 0

    for group, paths in FILES.items():
        print(f"\n  📂 {group}")
        print(f"  {'─' * 66}")
        print(f"  {'File':<52} {'Rows':>10}")
        print(f"  {'─' * 66}")

        for rel_path in paths:
            full_path = BASE_DIR / rel_path
            filename  = full_path.name
            result    = count_rows(full_path)

            total_files += 1
            if isinstance(result, int):
                found_files += 1
                print(f"  {filename:<52} {result:>10,}")
            else:
                missing_files += 1
                print(f"  {filename:<52} {result:>10}")

        print(f"  {'─' * 66}")

    show_all_periods_distribution()

    # ── Distribusi label per skenario labelling ──
    show_label_distribution(
        "Skenario 1 - Tiga Label (S1S3)",
        FILES["2_labelling_S1S3"],
    )
    show_label_distribution(
        "Skenario 2 - Dua Label (S2)",
        FILES["2_labelling_S2"],
    )

    print(f"\n{'=' * 70}")
    print(f"  RINGKASAN")
    print(f"{'=' * 70}")
    print(f"  Total file terdaftar : {total_files}")
    print(f"  ✅ Ditemukan         : {found_files}")
    print(f"  ❌ Tidak ditemukan   : {missing_files}")
    print(f"{'=' * 70}\n")


if __name__ == "__main__":
    main()