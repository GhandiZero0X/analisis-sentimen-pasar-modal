# utils/util.py
import os
import re
import pandas as pd
from pathlib import Path

# ── Konstanta ──────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parents[1]
CSV_DIR    = BASE_DIR / "data" / "csv" / "dl"
CSV_DIR_ML = BASE_DIR / "data" / "csv" / "ml"

VALID_SAHAM   = ["bbri", "bmri", "tlkm", "isat", "icbp", "unvr"]
VALID_PERIODE = ["before", "covid", "after", "all_periods"]
VALID_MODEL   = ["dl", "svm"]

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
def load_csv(periode: str, model: str = "dl") -> pd.DataFrame | None:
    """
    Muat file CSV hasil labelling untuk periode dan model tertentu.
    model: 'dl' | 'svm'
    """
    if model == "svm":
        # Mapping periode ke nama file ML
        name_map = {
            "before"     : "tweets_before_labelling_analisisML.csv",
            "covid"      : "tweets_covid_labelling_analisisML.csv",
            "after"      : "tweets_after_labelling_analisisML.csv",
            "all_periods": "tweets_all_periods_labelling_analisisML.csv",
        }
        filename = name_map.get(periode)
        if not filename:
            return None
        path = CSV_DIR_ML / filename
        if path.exists():
            df = pd.read_csv(path, dtype=str).fillna("")
            required = {"date", "tweet", "sentiment", "saham"}
            if required.issubset(set(df.columns)):
                return df
        return None
    else:
        # DL — path lama
        kandidat = [
            CSV_DIR / f"tweets_{periode}_labelling_analisisDL.csv",
            CSV_DIR / f"tweets_{periode}.csv",
        ]
        for path in kandidat:
            if path.exists():
                df = pd.read_csv(path, dtype=str).fillna("")
                required = {"date", "tweet", "sentiment", "saham"}
                if required.issubset(set(df.columns)):
                    return df
        return None


def load_all_csv(model: str = "dl") -> pd.DataFrame:
    """Gabungkan semua periode ke satu DataFrame."""
    frames = []
    for periode in VALID_PERIODE:
        df = load_csv(periode, model)
        if df is not None:
            df["periode"] = periode
            frames.append(df)
    if not frames:
        return pd.DataFrame(columns=["date","tweet","sentiment","saham","periode"])
    return pd.concat(frames, ignore_index=True)


# ── Statistik sentimen ─────────────────────────────────────
def hitung_distribusi(df: pd.DataFrame, model: str = "dl") -> dict:
    """
    Hitung jumlah & persentase positif / negatif (+ netral untuk SVM) per saham.
    Return: {saham: {positif: N, negatif: N, netral: N, total: N, pct_*: F}}
    """
    result = {}
    for saham in VALID_SAHAM:
        sub = df[df["saham"].str.lower() == saham]
        total   = len(sub)
        positif = int((sub["sentiment"].str.lower() == "positif").sum())
        negatif = int((sub["sentiment"].str.lower() == "negatif").sum())
        netral  = int((sub["sentiment"].str.lower() == "netral").sum()) if model == "svm" else 0

        entry = {
            "label"      : SAHAM_LABEL.get(saham, saham.upper()),
            "total"      : total,
            "positif"    : positif,
            "negatif"    : negatif,
            "pct_positif": round(positif / total * 100, 1) if total > 0 else 0,
            "pct_negatif": round(negatif / total * 100, 1) if total > 0 else 0,
        }
        if model == "svm":
            entry["netral"]     = netral
            entry["pct_netral"] = round(netral / total * 100, 1) if total > 0 else 0

        result[saham] = entry
    return result


def hitung_tren(df: pd.DataFrame, saham: str, period_type: str = "monthly", model: str = "dl") -> list:
    """
    Hitung tren sentimen per periode waktu untuk satu saham.
    period_type: 'daily' | 'weekly' | 'monthly'
    Return: list of {label, positif, negatif, netral (SVM only), total}
    """
    sub = df[df["saham"].str.lower() == saham].copy()
    if sub.empty:
        return []

    sub["date"] = pd.to_datetime(sub["date"], errors="coerce")
    sub = sub.dropna(subset=["date"])

    if period_type == "daily":
        sub["period_key"] = sub["date"].dt.strftime("%Y-%m-%d")
    elif period_type == "weekly":
        sub["period_key"] = sub["date"].dt.strftime("%Y-W%W")
    else:
        sub["period_key"] = sub["date"].dt.strftime("%Y-%m")

    hasil = []
    for key, grp in sub.groupby("period_key", sort=True):
        total   = len(grp)
        positif = int((grp["sentiment"].str.lower() == "positif").sum())
        negatif = int((grp["sentiment"].str.lower() == "negatif").sum())
        entry = {
            "label"  : key,
            "positif": positif,
            "negatif": negatif,
            "total"  : total,
        }
        if model == "svm":
            entry["netral"] = int((grp["sentiment"].str.lower() == "netral").sum())
        hasil.append(entry)

    return hasil

def hitung_tren_all(df: pd.DataFrame, period_type: str = "monthly", model: str = "dl") -> list:
    """
    Hitung tren sentimen per periode waktu untuk SEMUA saham digabung.
    """
    sub = df.copy()
    if sub.empty:
        return []

    sub["date"] = pd.to_datetime(sub["date"], errors="coerce")
    sub = sub.dropna(subset=["date"])

    if period_type == "daily":
        sub["period_key"] = sub["date"].dt.strftime("%Y-%m-%d")
    elif period_type == "weekly":
        sub["period_key"] = sub["date"].dt.strftime("%Y-W%W")
    else:
        sub["period_key"] = sub["date"].dt.strftime("%Y-%m")

    hasil = []
    for key, grp in sub.groupby("period_key", sort=True):
        total   = len(grp)
        positif = int((grp["sentiment"].str.lower() == "positif").sum())
        negatif = int((grp["sentiment"].str.lower() == "negatif").sum())
        entry = {
            "label"  : key,
            "positif": positif,
            "negatif": negatif,
            "total"  : total,
        }
        if model == "svm":
            entry["netral"] = int((grp["sentiment"].str.lower() == "netral").sum())
        hasil.append(entry)

    return hasil


# ── Validasi & bersihkan CSV upload ───────────────────────
def validasi_csv_upload(df: pd.DataFrame) -> tuple[bool, str]:
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
    """Bersihkan teks untuk inferensi model."""
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