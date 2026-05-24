# utils/util.py
import os
import re
import pandas as pd
from pathlib import Path

# ── Konstanta ──────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parents[1]
CSV_DIR    = BASE_DIR / "data" / "csv" / "dl"

VALID_SAHAM   = ["bbri", "bmri", "tlkm", "isat", "icbp", "unvr"]
VALID_PERIODE = ["before", "covid", "after", "all_periods"]

PERIODE_LABEL = {
    "before"     : "Sebelum COVID",
    "covid"      : "Masa COVID",
    "after"      : "Setelah COVID",
    "all_periods": "Semua Periode",
}

SAHAM_LABEL = {
    "bbri": "Bank BRI",
    "bmri": "Bank Mandiri",
    "tlkm": "Telkom",
    "isat": "Indosat",
    "icbp": "Indofood CBP",
    "unvr": "Unilever",
}

# ── Load CSV ───────────────────────────────────────────────
def load_csv(periode: str) -> pd.DataFrame | None:
    """
    Muat file CSV hasil labelling untuk periode tertentu.
    File diasumsikan ada di:  data/csv/tweets_{periode}_labelling.csv
    atau                      data/csv/tweets_{periode}.csv
    """
    kandidat = [
        CSV_DIR / f"tweets_{periode}_labelling.csv",
        CSV_DIR / f"tweets_{periode}.csv",
    ]
    for path in kandidat:
        if path.exists():
            df = pd.read_csv(path, dtype=str).fillna("")
            # Pastikan kolom wajib ada
            required = {"date", "tweet", "sentiment", "saham"}
            if required.issubset(set(df.columns)):
                return df
    return None


def load_all_csv() -> pd.DataFrame:
    """Gabungkan semua periode ke satu DataFrame."""
    frames = []
    for periode in VALID_PERIODE:
        df = load_csv(periode)
        if df is not None:
            df["periode"] = periode
            frames.append(df)
    if not frames:
        return pd.DataFrame(columns=["date","tweet","sentiment","saham","periode"])
    return pd.concat(frames, ignore_index=True)


# ── Statistik sentimen ─────────────────────────────────────
def hitung_distribusi(df: pd.DataFrame) -> dict:
    """
    Hitung jumlah & persentase positif / negatif per saham.
    Return: {saham: {positif: N, negatif: N, total: N, pct_positif: F}}
    """
    result = {}
    for saham in VALID_SAHAM:
        sub = df[df["saham"].str.lower() == saham]
        total    = len(sub)
        positif  = (sub["sentiment"].str.lower() == "positif").sum()
        negatif  = (sub["sentiment"].str.lower() == "negatif").sum()
        result[saham] = {
            "label"      : SAHAM_LABEL.get(saham, saham.upper()),
            "total"      : int(total),
            "positif"    : int(positif),
            "negatif"    : int(negatif),
            "pct_positif": round(positif / total * 100, 1) if total > 0 else 0,
            "pct_negatif": round(negatif / total * 100, 1) if total > 0 else 0,
        }
    return result


def hitung_tren(df: pd.DataFrame, saham: str, period_type: str = "monthly") -> list:
    """
    Hitung tren sentimen per periode waktu untuk satu saham.
    period_type: 'daily' | 'weekly' | 'monthly'
    Return: list of {label, positif, negatif, total}
    """
    sub = df[df["saham"].str.lower() == saham].copy()
    if sub.empty:
        return []

    # Parse tanggal
    sub["date"] = pd.to_datetime(sub["date"], errors="coerce")
    sub = sub.dropna(subset=["date"])

    if period_type == "daily":
        sub["period_key"] = sub["date"].dt.strftime("%Y-%m-%d")
    elif period_type == "weekly":
        sub["period_key"] = sub["date"].dt.strftime("%Y-W%W")
    else:  # monthly (default)
        sub["period_key"] = sub["date"].dt.strftime("%Y-%m")

    hasil = []
    for key, grp in sub.groupby("period_key", sort=True):
        total   = len(grp)
        positif = (grp["sentiment"].str.lower() == "positif").sum()
        negatif = (grp["sentiment"].str.lower() == "negatif").sum()
        hasil.append({
            "label"  : key,
            "positif": int(positif),
            "negatif": int(negatif),
            "total"  : int(total),
        })

    return hasil


# ── Validasi & bersihkan CSV upload ───────────────────────
def validasi_csv_upload(df: pd.DataFrame) -> tuple[bool, str]:
    """
    Pastikan CSV yang diupload memiliki kolom minimum.
    Return: (valid: bool, pesan: str)
    """
    required = {"tweet"}
    cols = set(df.columns.str.lower())
    missing = required - cols
    if missing:
        return False, f"Kolom wajib tidak ditemukan: {missing}"
    if len(df) == 0:
        return False, "File CSV kosong."
    if len(df) > 10_000:
        return False, "Maksimal 10.000 baris per upload."
    return True, "OK"


def clean_tweet_for_inference(text: str) -> str:
    """Bersihkan teks untuk inferensi model (sama dengan preprocessing DL)."""
    if not isinstance(text, str) or text.strip() == "":
        return ""
    t = text
    t = t.replace("\u00A0", " ")
    t = re.sub(r"[\r\n]+", " ", t)
    t = re.sub(r'["\']', "", t)
    t = re.sub(r"[…]", "", t)
    t = re.sub(r"((?:\w+://|www\.|bit\.ly/|t\.co/)\S+)", "", t)
    t = re.sub(r"[@#\$]\w+", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t