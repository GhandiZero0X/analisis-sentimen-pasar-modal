# controller/modelController.py
import os
import csv
from flask import render_template, current_app


PERIOD_MAP = {
    "before":      "data/modelDL/before",
    "covid":       "data/modelDL/covid",
    "after":       "data/modelDL/after",
    "all_periods": "data/modelDL/all_periods",
}

PERIOD_LABELS = {
    "before":      "Before Covid",
    "covid":       "Covid",
    "after":       "After Covid",
    "all_periods": "All Periods",
}

# Kolom total_rt di tabel_komparasi.csv dipetakan per period & model
KOMPARASI_CSV = "data/komparasi/tabel_komparasi.csv"


def _read_csv(filepath: str) -> list[dict]:
    """Baca CSV dan kembalikan list of dict."""
    rows = []
    if os.path.exists(filepath):
        with open(filepath, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)
    return rows


def _get_metrics(period: str) -> dict:
    """Baca evaluation_metrics.csv untuk period tertentu."""
    folder = PERIOD_MAP.get(period, PERIOD_MAP["before"])
    path = os.path.join(current_app.root_path, folder, "evaluation_metrics.csv")
    rows = _read_csv(path)
    if not rows:
        return {}
    row = rows[0]  # ambil baris pertama
    return {
        "accuracy":   _fmt_pct(row.get("accuracy", "")),
        "precision":  _fmt_pct(row.get("precision", "")),
        "recall":     _fmt_pct(row.get("recall", "")),
        "f1_score":   _fmt_pct(row.get("f1_score", "")),
        "best_epoch": row.get("best_epoch", "-"),
    }


def _get_runtime(period: str) -> str:
    """Baca total_rt dari tabel_komparasi.csv untuk period & model IndoBERTweet."""
    path = os.path.join(current_app.root_path, KOMPARASI_CSV)
    rows = _read_csv(path)
    for row in rows:
        # Sesuaikan filter: period cocok & model mengandung 'indobertweet' (case-insensitive)
        if (row.get("period", "").lower() == period.lower() and
                "indobertweet" in row.get("model", "").lower()):
            val = row.get("total_rt", "")
            try:
                return f"{float(val):,.2f} detik"
            except (ValueError, TypeError):
                return val or "-"
    return "-"


def _fmt_pct(val: str) -> str:
    """Ubah nilai float (0–1 atau 0–100) menjadi string persentase."""
    try:
        f = float(val)
        if f <= 1.0:
            f *= 100
        return f"{f:.2f}%"
    except (ValueError, TypeError):
        return val or "-"


def _build_dl_context(period: str) -> dict:
    metrics = _get_metrics(period)
    runtime = _get_runtime(period)
    return {
        "active_menu":    "model",
        "active_page":    "modelDL",
        "periods":        PERIOD_LABELS,
        "active_period":  period,
        "period_label":   PERIOD_LABELS.get(period, "Before Covid"),
        "period_folder":  PERIOD_MAP.get(period, PERIOD_MAP["before"]),
        "metrics":        metrics,
        "runtime":        runtime,
    }


def modelDL_get():
    from flask import request
    period = request.args.get("period", "before")
    if period not in PERIOD_MAP:
        period = "before"
    ctx = _build_dl_context(period)
    return render_template("pages/modelDL.html", **ctx)


def modelML_get():
    return render_template(
        "pages/modelML.html",
        active_menu="model",
        active_page="modelML",
    )