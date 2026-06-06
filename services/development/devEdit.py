import pandas as pd
from pathlib import Path

# =====================================================
# FILE INPUT
# =====================================================
before_file = r"dev_database\2_labelling_S1S3\tweets_before_covid_labellingLexicon.csv"
covid_file = r"dev_database\2_labelling_S1S3\tweets_covid_labellingLexicon.csv"
after_file = r"dev_database\2_labelling_S1S3\tweets_after_covid_labellingLexicon.csv"

# =====================================================
# BACA FILE CSV
# =====================================================
df_before = pd.read_csv(before_file)
df_covid = pd.read_csv(covid_file)
df_after = pd.read_csv(after_file)

print(f"Before Covid : {len(df_before):,} data")
print(f"Covid        : {len(df_covid):,} data")
print(f"After Covid  : {len(df_after):,} data")

# =====================================================
# GABUNGKAN DATASET
# =====================================================
df_all = pd.concat(
    [df_before, df_covid, df_after],
    ignore_index=True
)

# =====================================================
# URUTKAN BERDASARKAN TANGGAL (OPSIONAL)
# =====================================================
df_all["date"] = pd.to_datetime(df_all["date"])

df_all = (
    df_all
    .sort_values("date")
    .reset_index(drop=True)
)

# Kembalikan format tanggal
df_all["date"] = df_all["date"].dt.strftime("%Y-%m-%d")

# =====================================================
# SIMPAN HASIL
# =====================================================
output_file = r"dev_database\2_labelling_S1S3\tweets_all_periods_labellingLexicon.csv"

df_all.to_csv(
    output_file,
    index=False,
    encoding="utf-8-sig"
)

# =====================================================
# HASIL
# =====================================================
print("\n" + "=" * 60)
print("Penggabungan berhasil!")
print(f"Total data gabungan : {len(df_all):,}")
print(f"File output         : {output_file}")
print("=" * 60)