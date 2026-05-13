from flask import Blueprint, jsonify, request
import pandas as pd
import joblib
import re
import string
from pathlib import Path

# BLUEPRINT
algoritma_bp = Blueprint("algoritma", __name__)

# PATH CONFIGURATION
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"

DATA_FILE = DATA_DIR / "tweets_sahamAll_classified.csv"
MODEL_FILE = DATA_DIR / "svm_tfidf_model.joblib"
VECTORIZER_FILE = DATA_DIR / "tfidf_vectorizer.joblib"

# LOAD RESOURCE (ONCE)
df = pd.read_csv(DATA_FILE, parse_dates=["date"])
model = joblib.load(MODEL_FILE)
vectorizer = joblib.load(VECTORIZER_FILE)

# VALIDATION (CRITICAL)
required_cols = {"date", "sentiment", "saham"}
missing_cols = required_cols - set(df.columns)

if missing_cols:
    raise RuntimeError(
        f"Kolom {missing_cols} tidak ditemukan. "
        "Pastikan data telah melalui proses klasifikasi menggunakan model SVM."
    )

print("✅ Dataset hasil klasifikasi SVM berhasil dimuat")
print("✅ Model & vectorizer siap digunakan")

# HELPER FUNCTION
def sentiment_label(val):
    if val == 1:
        return "positif"
    elif val == -1:
        return "negatif"
    else:
        return "netral"


def simple_preprocess(text: str) -> str:
    """
    Preprocessing ringan untuk inference real-time
    (disesuaikan dengan preprocessing training)
    """
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"@\w+|#\w+", "", text)
    text = re.sub(r"\d+", "", text)
    text = re.sub(rf"[{re.escape(string.punctuation)}]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# USE CASE 1: DASHBOARD DISTRIBUSI SENTIMEN
@algoritma_bp.route("/dashboard", methods=["GET"])
def dashboard_sentimen():
    saham = request.args.get("saham")

    data = df.copy()
    if saham:
        data = data[data["saham"] == saham]

    summary = (
        data["sentiment"]
        .value_counts()
        .rename(index=sentiment_label)
        .to_dict()
    )

    return jsonify({
        "saham": saham if saham else "ALL",
        "total_tweet": int(len(data)),
        "distribusi_sentimen": summary,
        "sumber_data": "hasil_klasifikasi_svm"
    })


# USE CASE 2: FILTER BERDASARKAN PERIODE
@algoritma_bp.route("/filter", methods=["GET"])
def filter_periode():
    periode = request.args.get("periode", "harian")
    saham = request.args.get("saham")

    data = df.copy()
    if saham:
        data = data[data["saham"] == saham]

    if periode == "harian":
        group = data.groupby(data["date"].dt.date)
    elif periode == "mingguan":
        group = data.groupby(data["date"].dt.to_period("W").astype(str))
    elif periode == "bulanan":
        group = data.groupby(data["date"].dt.to_period("M").astype(str))
    else:
        return jsonify({"error": "Periode tidak valid"}), 400

    result = []
    for period, g in group:
        result.append({
            "periode": str(period),
            "positif": int((g["sentiment"] == 1).sum()),
            "negatif": int((g["sentiment"] == -1).sum()),
            "netral": int((g["sentiment"] == 0).sum()),
            "basis": "hasil_model_svm"
        })

    return jsonify(result)


# USE CASE 3: TREN SENTIMEN
@algoritma_bp.route("/trend", methods=["GET"])
def trend_sentimen():
    saham = request.args.get("saham")

    data = df.copy()
    if saham:
        data = data[data["saham"] == saham]

    trend = (
        data.groupby([data["date"].dt.date, "sentiment"])
        .size()
        .unstack(fill_value=0)
        .rename(columns={
            1: "positif",
            -1: "negatif",
            0: "netral"
        })
        .reset_index()
        .rename(columns={"date": "tanggal"})
    )

    trend["sumber"] = "hasil_klasifikasi_svm"

    return jsonify(trend.to_dict(orient="records"))


# USE CASE TAMBAHAN: PREDIKSI TWEET BARU
@algoritma_bp.route("/predict", methods=["POST"])
def predict_tweet():
    text = request.json.get("tweet", "")

    if not text:
        return jsonify({"error": "Tweet tidak boleh kosong"}), 400

    clean_text = simple_preprocess(text)
    X = vectorizer.transform([clean_text])
    pred = model.predict(X)[0]

    return jsonify({
        "tweet": text,
        "sentiment": sentiment_label(pred),
        "sumber": "model_svm"
    })
