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
#  CEK JUMLAH BARIS
# ══════════════════════════════════════════════════════════════
def count_rows(filepath: Path) -> int | str:
    try:
        df = pd.read_csv(filepath, encoding="utf-8")
        return len(df)
    except UnicodeDecodeError:
        try:
            df = pd.read_csv(filepath, encoding="latin-1")
            return len(df)
        except Exception as e:
            return f"ERROR: {e}"
    except FileNotFoundError:
        return "FILE NOT FOUND"
    except Exception as e:
        return f"ERROR: {e}"

# ══════════════════════════════════════════════════════════════
#  DISTRIBUSI SAHAM ALL_PERIODS
# ══════════════════════════════════════════════════════════════
def show_all_periods_distribution():
    path = BASE_DIR / "dev_database/1_raw/tweets_all_periods.csv"

    if not path.exists():
        print("\n❌ File tweets_all_periods.csv tidak ditemukan")
        return

    try:
        df = pd.read_csv(path)

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

    except Exception as e:
        print(f"\n❌ Error membaca distribusi saham: {e}")

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

    print(f"\n{'=' * 70}")
    print(f"  RINGKASAN")
    print(f"{'=' * 70}")
    print(f"  Total file terdaftar : {total_files}")
    print(f"  ✅ Ditemukan         : {found_files}")
    print(f"  ❌ Tidak ditemukan   : {missing_files}")
    print(f"{'=' * 70}\n")


if __name__ == "__main__":
    main()