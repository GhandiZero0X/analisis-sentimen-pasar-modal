# controller/datasetController.py
import os
import math
import pandas as pd
from flask import render_template, request, current_app

# ── Konstanta ──────────────────────────────────────────────────────────────────
PER_PAGE = 50

CSV_PATHS = {
    "dl": {
        "before":  os.path.join("data", "csv", "dl", "tweets_before_labelling_analisisDL.csv"),
        "covid":   os.path.join("data", "csv", "dl", "tweets_covid_labelling_analisisDL.csv"),
        "after":   os.path.join("data", "csv", "dl", "tweets_after_labelling_analisisDL.csv"),
        "all":     os.path.join("data", "csv", "dl", "tweets_all_periods_labelling_analisisDL.csv"),
    },
    "ml": {
        "before":  os.path.join("data", "csv", "ml", "tweets_before_labelling_analisisML.csv"),
        "covid":   os.path.join("data", "csv", "ml", "tweets_covid_labelling_analisisML.csv"),
        "after":   os.path.join("data", "csv", "ml", "tweets_after_labelling_analisisML.csv"),
        "all":     os.path.join("data", "csv", "ml", "tweets_all_periods_labelling_analisisML.csv"),
    },
}

# Mapping nama kolom CSV → nama standar internal
# Sesuaikan key kiri jika nama kolom CSV-mu berbeda
COLUMN_MAP = {
    "date":      ["date", "tanggal", "created_at", "Tanggal", "Date"],
    "tweet":     ["tweet", "text", "content", "Tweet", "Text"],
    "sentiment": ["sentiment", "label", "sentimen", "Sentiment", "Label"],
    "saham":     ["saham", "stock", "ticker", "Saham", "Stock"],
}

# def before_get():
#     return render_template("pages/before-covid.html", active_menu="dataset", active_page="before-covid")

# def covid_get():
#     return render_template("pages/covid.html", active_menu="dataset", active_page="covid")

# def after_get():
#     return render_template("pages/after-covid.html", active_menu="dataset", active_page="after-covid")

# def all_period_get():
#     return render_template("pages/all-periods.html", active_menu="dataset", active_page="all-periods")

# ── View functions ─────────────────────────────────────────────────────────────
def before_get():
    return _render_dataset("before", "pages/before-covid.html", "before-covid")

def covid_get():
    return _render_dataset("covid", "pages/covid.html", "covid")

def after_get():
    return _render_dataset("after", "pages/after-covid.html", "after-covid")

def all_period_get():
    return _render_dataset("all", "pages/all-periods.html", "all-periods")

def _resolve_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    """Kembalikan nama kolom pertama yang ada di DataFrame."""
    for c in candidates:
        if c in df.columns:
            return c
    return None


def _load_dataset(period: str, model: str) -> dict:
    """
    Muat CSV, normalkan kolom, hitung statistik, kembalikan dict siap render.
    """
    base_dir = current_app.root_path
    path = os.path.join(base_dir, CSV_PATHS[model][period])

    try:
        df = pd.read_csv(path, encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(path, encoding="latin-1")

    # ── Normalkan nama kolom ───────────────────────────────────────────────────
    rename = {}
    for std_name, candidates in COLUMN_MAP.items():
        col = _resolve_column(df, candidates)
        if col and col != std_name:
            rename[col] = std_name
    df.rename(columns=rename, inplace=True)

    # Pastikan kolom ada (fallback kosong)
    for col in ["date", "tweet", "sentiment", "saham"]:
        if col not in df.columns:
            df[col] = ""

    # ── Normalkan label sentimen ───────────────────────────────────────────────
    df["sentiment"] = df["sentiment"].astype(str).str.strip().str.lower()

    # ── Statistik keseluruhan ──────────────────────────────────────────────────
    total      = len(df)
    positif    = int((df["sentiment"] == "positif").sum())
    negatif    = int((df["sentiment"] == "negatif").sum())
    netral     = int((df["sentiment"] == "netral").sum())

    # ── Distribusi per saham ───────────────────────────────────────────────────
    saham_list = sorted(df["saham"].dropna().unique().tolist())
    distribusi = []
    for kode in saham_list:
        sub    = df[df["saham"] == kode]
        tot    = len(sub)
        if tot == 0:
            continue
        pos    = int((sub["sentiment"] == "positif").sum())
        neg    = int((sub["sentiment"] == "negatif").sum())
        net    = int((sub["sentiment"] == "netral").sum())
        pct_p  = round(pos / tot * 100, 1)
        pct_n  = round(neg / tot * 100, 1)
        pct_nt = round(net / tot * 100, 1)
        distribusi.append({
            "kode":    kode,
            "total":   tot,
            "positif": pos, "pct_positif": pct_p,
            "negatif": neg, "pct_negatif": pct_n,
            "netral":  net, "pct_netral":  pct_nt,
        })

    return {
        "df":         df,
        "total":      total,
        "positif":    positif,
        "negatif":    negatif,
        "netral":     netral,
        "distribusi": distribusi,
        "saham_list": saham_list,
        "model":      model,
    }


def _render_dataset(period: str, template: str, active_page: str):
    """Controller generik untuk semua halaman dataset."""
    model      = request.args.get("model", "dl").lower()
    if model not in ("dl", "ml"):
        model = "dl"

    page       = int(request.args.get("page", 1))
    filter_saham = request.args.get("saham", "all").upper()

    data = _load_dataset(period, model)
    df   = data["df"]

    # ── Filter saham ──────────────────────────────────────────────────────────
    if filter_saham != "ALL":
        df_filtered = df[df["saham"].str.upper() == filter_saham]
    else:
        df_filtered = df

    total_filtered = len(df_filtered)
    total_pages    = max(1, math.ceil(total_filtered / PER_PAGE))
    page           = max(1, min(page, total_pages))

    start = (page - 1) * PER_PAGE
    end   = start + PER_PAGE
    rows  = df_filtered.iloc[start:end][["date", "tweet", "sentiment", "saham"]].to_dict(orient="records")

    # Nomor urut baris
    for i, row in enumerate(rows, start=start + 1):
        row["no"] = i

    return render_template(
        template,
        active_menu  = "dataset",
        active_page  = active_page,
        # statistik
        total        = data["total"],
        positif      = data["positif"],
        negatif      = data["negatif"],
        netral       = data["netral"],
        distribusi   = data["distribusi"],
        saham_list   = data["saham_list"],
        # tabel + paginasi
        rows         = rows,
        page         = page,
        total_pages  = total_pages,
        total_filtered = total_filtered,
        start_row    = start + 1,
        end_row      = min(end, total_filtered),
        filter_saham = filter_saham,
        model        = model,
    )