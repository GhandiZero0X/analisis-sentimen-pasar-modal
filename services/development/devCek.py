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

    print(f"\n{'=' * 70}")
    print(f"  RINGKASAN")
    print(f"{'=' * 70}")
    print(f"  Total file terdaftar : {total_files}")
    print(f"  ✅ Ditemukan         : {found_files}")
    print(f"  ❌ Tidak ditemukan   : {missing_files}")
    print(f"{'=' * 70}\n")


if __name__ == "__main__":
    main()