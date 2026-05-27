# controller/modelController.py
import os
import csv
import threading
import uuid
from flask import render_template, request, jsonify, current_app
from werkzeug.utils import secure_filename

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

KOMPARASI_CSV = "data/komparasi/tabel_komparasi.csv"

# Status job per session (in-memory, cukup untuk 1 worker)
_job_status: dict = {}


# ══════════════════════════════════════════════════════════════
#  HELPERS
# ══════════════════════════════════════════════════════════════
def _read_csv(filepath: str) -> list[dict]:
    rows = []
    if os.path.exists(filepath):
        with open(filepath, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)
    return rows


def _fmt_pct(val: str) -> str:
    try:
        f = float(val)
        if f <= 1.0:
            f *= 100
        return f"{f:.2f}%"
    except (ValueError, TypeError):
        return val or "-"


def _get_metrics(period: str) -> dict:
    folder = PERIOD_MAP.get(period, PERIOD_MAP["before"])
    path = os.path.join(current_app.root_path, folder, "evaluation_metrics.csv")
    rows = _read_csv(path)
    if not rows:
        return {k: "-" for k in ["accuracy", "precision", "recall", "f1_score", "best_epoch"]}
    row = rows[0]
    return {
        "accuracy":   _fmt_pct(row.get("accuracy", "")),
        "precision":  _fmt_pct(row.get("precision", "")),
        "recall":     _fmt_pct(row.get("recall", "")),
        "f1_score":   _fmt_pct(row.get("f1_score", "")),
        "best_epoch": row.get("best_epoch", "-"),
    }


def _get_runtime(period: str) -> str:
    path = os.path.join(current_app.root_path, KOMPARASI_CSV)
    rows = _read_csv(path)
    for row in rows:
        if (row.get("period", "").lower() == period.lower() and
                "s1 dl" in row.get("model", "").lower()):
            val = row.get("total_rt", "")
            try:
                return f"{float(val):,.2f} detik"
            except (ValueError, TypeError):
                return val or "-"
    return "-"


def _build_dl_context(period: str) -> dict:
    return {
        "active_menu":   "model",
        "active_page":   "modelDL",
        "periods":       PERIOD_LABELS,
        "active_period": period,
        "period_label":  PERIOD_LABELS.get(period, "Before Covid"),
        "period_folder": PERIOD_MAP.get(period, PERIOD_MAP["before"]).replace("data/", "", 1),
        "metrics":       _get_metrics(period),
        "runtime":       _get_runtime(period),
    }


# ══════════════════════════════════════════════════════════════
#  VIEW FUNCTIONS
# ══════════════════════════════════════════════════════════════
def modelDL_get():
    period = request.args.get("period", "before")
    if period not in PERIOD_MAP:
        period = "before"
    return render_template("pages/modelDL.html", **_build_dl_context(period))


def modelML_get():
    return render_template(
        "pages/modelML.html",
        active_menu="model",
        active_page="modelML",
    )


# ══════════════════════════════════════════════════════════════
#  UPLOAD PREVIEW
# ══════════════════════════════════════════════════════════════
def preview_csv_post():
    """Return 5 baris pertama CSV yang diupload sebagai JSON."""
    file = request.files.get("csv_file")
    if not file or not file.filename.endswith(".csv"):
        return jsonify({"error": "File CSV tidak valid."}), 400

    try:
        import io
        content = file.read().decode("utf-8", errors="replace")
        reader = csv.DictReader(io.StringIO(content))
        rows = []
        for i, row in enumerate(reader):
            if i >= 5:
                break
            rows.append(dict(row))
        return jsonify({"columns": reader.fieldnames or [], "rows": rows})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ══════════════════════════════════════════════════════════════
#  UPDATE MODEL — background job
# ══════════════════════════════════════════════════════════════
def update_model_post():
    """
    Terima CSV + period, jalankan pipeline di background thread,
    kembalikan job_id untuk polling status.
    """
    period = request.form.get("model_target", "before")
    if period not in PERIOD_MAP:
        return jsonify({"error": "Period tidak valid."}), 400

    file = request.files.get("csv_file")
    if not file or not file.filename.endswith(".csv"):
        return jsonify({"error": "File CSV tidak ditemukan atau bukan .csv"}), 400

    # Simpan CSV upload sementara
    root = current_app.root_path
    upload_dir = os.path.join(root, "data", "uploads_temp")
    os.makedirs(upload_dir, exist_ok=True)
    filename = secure_filename(file.filename)
    csv_path = os.path.join(upload_dir, f"{period}_{filename}")
    file.save(csv_path)

    job_id = str(uuid.uuid4())
    _job_status[job_id] = {"step": "Menunggu", "progress": 0, "done": False, "error": None}

    # Jalankan pipeline di thread terpisah agar response tidak block
    thread = threading.Thread(
        target=_run_pipeline,
        args=(job_id, period, csv_path, root),
        daemon=True,
    )
    thread.start()

    return jsonify({"job_id": job_id})


def job_status_get():
    """Polling status pipeline."""
    job_id = request.args.get("job_id", "")
    status = _job_status.get(job_id)
    if not status:
        return jsonify({"error": "Job tidak ditemukan."}), 404
    return jsonify(status)


# ══════════════════════════════════════════════════════════════
#  PIPELINE RUNNER (background)
# ══════════════════════════════════════════════════════════════
def _set_status(job_id: str, step: str, progress: int, done=False, error=None):
    _job_status[job_id] = {
        "step": step,
        "progress": progress,
        "done": done,
        "error": error,
    }


def _run_pipeline(job_id: str, period: str, csv_path: str, root_path: str):
    try:
        from services.updateModelDL import run_full_pipeline
        run_full_pipeline(
            job_id=job_id,
            period=period,
            csv_path=csv_path,
            root_path=root_path,
            set_status=_set_status,
        )
    except Exception as e:
        _set_status(job_id, f"Error: {e}", 0, done=True, error=str(e))