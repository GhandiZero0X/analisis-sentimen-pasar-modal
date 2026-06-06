import pandas as pd

# Path file Excel
excel_file = r"dev_database\7_excel_ver\Master file_sentimen analysis saham.xlsx"

# Baca sheet VERIFIED
df = pd.read_excel(
    excel_file,
    sheet_name="VERIFIED"
)

# Ambil kolom yang dibutuhkan
df_final = df[[
    "Date",
    "Tweet",
    "Sentiment",
    "Emiten"
]].copy()

# Rename kolom
df_final.rename(columns={
    "Date": "date",
    "Tweet": "tweet",
    "Sentiment": "sentiment",
    "Emiten": "saham"
}, inplace=True)

# Simpan ke CSV
output_file = r"dev_database\7_excel_ver\tweets_after_covid_labellingLexicon.csv"

df_final.to_csv(
    output_file,
    index=False,
    encoding="utf-8-sig"
)

print("=" * 50)
print("Konversi berhasil!")
print(f"Total data : {len(df_final):,}")
print(f"Output     : {output_file}")
print("=" * 50)