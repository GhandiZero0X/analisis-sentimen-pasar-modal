# controller/algoritmaController.py
import os
import io
import torch
import joblib
import pandas as pd
from pathlib import Path
from flask import request, jsonify, render_template, current_app

from transformers import AutoConfig, AutoTokenizer, AutoModelForSequenceClassification
from utils.util import (
    load_csv, load_all_csv,
    hitung_distribusi, hitung_tren,
    validasi_csv_upload, clean_tweet_for_inference,
    VALID_SAHAM, VALID_PERIODE, PERIODE_LABEL, SAHAM_LABEL,
)

# ══════════════════════════════════════════════════════════════
#  PATH MODEL
# ══════════════════════════════════════════════════════════════
BASE_DIR  = Path(__file__).resolve().parents[1]
MODEL_DIR = BASE_DIR / "data" / "modelDL"

# Mapping periode → folder model
MODEL_PATHS = {
    "before"     : MODEL_DIR / "before",
    "covid"      : MODEL_DIR / "covid",
    "after"      : MODEL_DIR / "after",
    "all_periods": MODEL_DIR / "all_periods",
}

# ══════════════════════════════════════════════════════════════
#  LOAD MODEL (lazy, disimpan di app context)
# ══════════════════════════════════════════════════════════════
_models    = {}   # cache model per periode
_tokenizer = None # tokenizer sama untuk semua (IndoBERTweet)

MAX_LENGTH = 128
BATCH_SIZE = 16
DEVICE     = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _get_tokenizer(model_dir: Path):
    """Load tokenizer dari folder model (cached)."""
    global _tokenizer
    if _tokenizer is None:
        tokenizer_dir = model_dir / "tokenizer"
        if tokenizer_dir.exists():
            _tokenizer = AutoTokenizer.from_pretrained(str(tokenizer_dir))
        else:
            # Fallback: download dari HuggingFace
            _tokenizer = AutoTokenizer.from_pretrained(
                "indolem/indobertweet-base-uncased"
            )
    return _tokenizer


def _get_model(periode: str):
    """Load model untuk periode tertentu (cached)."""
    if periode in _models:
        return _models[periode]

    model_dir = MODEL_PATHS.get(periode)
    if model_dir is None or not model_dir.exists():
        return None

    bin_file = model_dir / "best_model.bin"
    if not bin_file.exists():
        return None

    try:
        # Load label encoder
        le_file = model_dir / "label_encoder.joblib"
        le      = joblib.load(le_file) if le_file.exists() else None

        # Load arsitektur dari config.json
        config = AutoConfig.from_pretrained(
            str(model_dir),
            num_labels = 2,   # positif & negatif
        )
        model = AutoModelForSequenceClassification.from_config(config)
        state_dict = torch.load(bin_file, map_location=DEVICE)
        model.load_state_dict(state_dict, strict=True)
        model.to(DEVICE)
        model.eval()

        _models[periode] = {"model": model, "le": le}
        print(f"✅ Model [{periode}] berhasil dimuat")
        return _models[periode]

    except Exception as e:
        print(f"❌ Gagal load model [{periode}]: {e}")
        return None


def _predict_batch(texts: list, periode: str = "all_periods") -> list:
    """
    Prediksi sentimen untuk list teks.
    Return: list string 'positif' / 'negatif'
    """
    model_bundle = _get_model(periode)
    if model_bundle is None:
        return ["netral"] * len(texts)

    model     = model_bundle["model"]
    le        = model_bundle["le"]
    tokenizer = _get_tokenizer(MODEL_PATHS[periode])

    results = []
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i: i + BATCH_SIZE]
        batch_safe = [t if t.strip() else "tidak ada informasi" for t in batch]

        encoding = tokenizer(
            batch_safe,
            max_length  = MAX_LENGTH,
            padding     = "max_length",
            truncation  = True,
            return_tensors = "pt",
        )
        input_ids      = encoding["input_ids"].to(DEVICE)
        attention_mask = encoding["attention_mask"].to(DEVICE)

        with torch.no_grad():
            logits = model(input_ids=input_ids,
                           attention_mask=attention_mask).logits
            preds  = torch.argmax(logits, dim=1).cpu().numpy()

        if le is not None:
            labels = le.inverse_transform(preds)
        else:
            # Fallback: 0=negatif, 1=positif
            labels = ["positif" if p == 1 else "negatif" for p in preds]

        results.extend(labels)

    return results


# ══════════════════════════════════════════════════════════════
#  VIEWS & API HANDLERS
# ══════════════════════════════════════════════════════════════

def index():
    """Render halaman utama dashboard."""
    return render_template("index.html")


def get_dashboard_data():
    """
    GET /api/dashboard?periode=all_periods
    Return ringkasan distribusi sentimen semua saham untuk periode tertentu.
    """
    periode = request.args.get("periode", "all_periods")
    if periode not in VALID_PERIODE:
        return jsonify({"error": "periode tidak valid"}), 400

    df = load_csv(periode)
    if df is None:
        return jsonify({"error": f"Data untuk periode '{periode}' tidak ditemukan"}), 404

    distribusi = hitung_distribusi(df)

    # Ringkasan total semua saham
    total_all   = sum(v["total"]   for v in distribusi.values())
    positif_all = sum(v["positif"] for v in distribusi.values())
    negatif_all = sum(v["negatif"] for v in distribusi.values())

    return jsonify({
        "periode"       : periode,
        "periode_label" : PERIODE_LABEL.get(periode, periode),
        "total"         : total_all,
        "positif"       : positif_all,
        "negatif"       : negatif_all,
        "distribusi"    : distribusi,
    })


def get_trend_data():
    """
    GET /api/trend?saham=bbri&periode=all_periods&period_type=monthly
    Return data tren sentimen untuk grafik garis.
    """
    saham       = request.args.get("saham", "bbri").lower()
    periode     = request.args.get("periode", "all_periods")
    period_type = request.args.get("period_type", "monthly")

    if saham not in VALID_SAHAM:
        return jsonify({"error": "saham tidak valid"}), 400
    if periode not in VALID_PERIODE:
        return jsonify({"error": "periode tidak valid"}), 400
    if period_type not in ("daily", "weekly", "monthly"):
        return jsonify({"error": "period_type tidak valid"}), 400

    df = load_csv(periode)
    if df is None:
        return jsonify({"error": "Data tidak ditemukan"}), 404

    tren = hitung_tren(df, saham, period_type)

    return jsonify({
        "saham"      : saham,
        "saham_label": SAHAM_LABEL.get(saham, saham.upper()),
        "periode"    : periode,
        "period_type": period_type,
        "data"       : tren,
    })


def get_saham_detail():
    """
    GET /api/saham?saham=bbri&periode=all_periods
    Return distribusi sentimen detail untuk satu saham.
    """
    saham   = request.args.get("saham", "bbri").lower()
    periode = request.args.get("periode", "all_periods")

    if saham not in VALID_SAHAM:
        return jsonify({"error": "saham tidak valid"}), 400
    if periode not in VALID_PERIODE:
        return jsonify({"error": "periode tidak valid"}), 400

    df = load_csv(periode)
    if df is None:
        return jsonify({"error": "Data tidak ditemukan"}), 404

    sub = df[df["saham"].str.lower() == saham]
    total   = len(sub)
    positif = int((sub["sentiment"].str.lower() == "positif").sum())
    negatif = int((sub["sentiment"].str.lower() == "negatif").sum())

    # Sample tweet terbaru (maks 5)
    sample = (
        sub[["date", "tweet", "sentiment"]]
        .sort_values("date", ascending=False)
        .head(5)
        .to_dict(orient="records")
    )

    return jsonify({
        "saham"      : saham,
        "saham_label": SAHAM_LABEL.get(saham, saham.upper()),
        "periode"    : periode,
        "total"      : total,
        "positif"    : positif,
        "negatif"    : negatif,
        "pct_positif": round(positif / total * 100, 1) if total > 0 else 0,
        "pct_negatif": round(negatif / total * 100, 1) if total > 0 else 0,
        "sample"     : sample,
    })

def _build_upload_trend(df: pd.DataFrame, date_col: str | None) -> list:
    """
    Build tren sentimen dari hasil labeling upload.
    Output: [{label, positif, negatif, total}, ...]
    """
    if not date_col or date_col not in df.columns:
        return []

    tmp = df[[date_col, "sentiment_hasil"]].copy()
    tmp[date_col] = pd.to_datetime(tmp[date_col], errors="coerce")
    tmp = tmp.dropna(subset=[date_col])

    if tmp.empty:
        return []

    # Default: harian
    tmp["period_key"] = tmp[date_col].dt.strftime("%Y-%m-%d")

    hasil = []
    for key, grp in tmp.groupby("period_key", sort=True):
        positif = int((grp["sentiment_hasil"].str.lower() == "positif").sum())
        negatif = int((grp["sentiment_hasil"].str.lower() == "negatif").sum())
        hasil.append({
            "label": key,
            "positif": positif,
            "negatif": negatif,
            "total": int(len(grp)),
        })

    return hasil

def upload_csv():
    """
    POST /api/upload
    Terima file CSV, jalankan inferensi model, return hasil sentimen.
    Form data: file (CSV), periode (model yang dipakai)
    """
    if "file" not in request.files:
        return jsonify({"error": "Tidak ada file yang diunggah"}), 400

    file    = request.files["file"]
    periode = request.form.get("periode", "all_periods")

    if file.filename == "":
        return jsonify({"error": "Nama file kosong"}), 400
    if not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Hanya file .csv yang diizinkan"}), 400
    if periode not in VALID_PERIODE:
        return jsonify({"error": "periode tidak valid"}), 400

    try:
        df = pd.read_csv(io.StringIO(file.stream.read().decode("utf-8")),
                         dtype=str).fillna("")
    except Exception as e:
        return jsonify({"error": f"Gagal membaca CSV: {str(e)}"}), 400

    valid, msg = validasi_csv_upload(df)
    if not valid:
        return jsonify({"error": msg}), 400

    # Cari kolom tweet
    col_map  = {c.lower(): c for c in df.columns}
    tweet_col = col_map.get("tweet") or col_map.get("text") or col_map.get("teks")
    if tweet_col is None:
        return jsonify({"error": "Kolom 'tweet' tidak ditemukan di CSV"}), 400

    # Bersihkan dan prediksi
    texts      = [clean_tweet_for_inference(t) for t in df[tweet_col].tolist()]
    sentiments = _predict_batch(texts, periode)

    df["sentiment_hasil"] = sentiments
    
    date_col = col_map.get("date")
    trend_upload = _build_upload_trend(df, date_col)

    # Hitung distribusi hasil
    total   = len(df)
    positif = sentiments.count("positif")
    negatif = sentiments.count("negatif")

    # Preview 10 baris pertama
    preview_cols = [tweet_col, "sentiment_hasil"]
    if "date" in col_map:
        preview_cols = [col_map["date"]] + preview_cols
    preview = df[preview_cols].head(10).to_dict(orient="records")

    return jsonify({
        "total": total,
        "positif": positif,
        "negatif": negatif,
        "pct_positif": round(positif / total * 100, 1) if total > 0 else 0,
        "pct_negatif": round(negatif / total * 100, 1) if total > 0 else 0,
        "model_used": f"IndoBERTweet ({PERIODE_LABEL.get(periode, periode)})",
        "preview": preview,
        "trend_upload": trend_upload,
    })