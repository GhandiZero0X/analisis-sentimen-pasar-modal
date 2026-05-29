from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent

input_file = (
    BASE_DIR
    / "dev_database"
    / "2_labelling_S1S3"
    / "tweets_after_covid_labellingLexicon.csv"
)

output_dir = (
    BASE_DIR
    / "dev_database"
    / "7_excel_ver"
)

output_dir.mkdir(parents=True, exist_ok=True)

output_file = output_dir / f"{input_file.stem}.xlsx"

print("=" * 60)
print("Konversi CSV ke Excel")
print("=" * 60)

print(f"Input : {input_file}")

if not input_file.exists():
    raise FileNotFoundError(
        f"File tidak ditemukan:\n{input_file}"
    )

df = pd.read_csv(input_file)

df.to_excel(
    output_file,
    index=False,
    engine="openpyxl"
)

print(f"✅ Berhasil dikonversi")
print(f"📄 Output : {output_file}")
print(f"📈 Total baris : {len(df):,}")
print("=" * 60)