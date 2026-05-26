# controller/algoritmaController.py
import os
import io
import re
import torch
import joblib
import emoji
import pandas as pd
import nltk
from nltk.corpus import stopwords
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from pathlib import Path
from flask import request, jsonify, render_template, current_app

from transformers import AutoConfig, AutoTokenizer, AutoModelForSequenceClassification
from utils.util import (
    load_csv, load_all_csv,
    hitung_distribusi, hitung_tren,
    validasi_csv_upload, clean_tweet_for_inference,
    VALID_SAHAM, VALID_PERIODE, VALID_MODEL,
    PERIODE_LABEL, SAHAM_LABEL,
)

try:
    import stanza as _stanza_lib
    _STANZA_AVAILABLE = True
except ImportError:
    _STANZA_AVAILABLE = False

# ══════════════════════════════════════════════════════════════
#  PATH
# ══════════════════════════════════════════════════════════════
BASE_DIR     = Path(__file__).resolve().parents[1]
MODEL_DIR    = BASE_DIR / "data" / "modelDL"
MODEL_DIR_ML = BASE_DIR / "data" / "modelML"
KAMUS_PATH   = BASE_DIR / "data" / "kamus" / "kamuskatabaku.xlsx"

MODEL_PATHS = {
    "before"     : MODEL_DIR / "before",
    "covid"      : MODEL_DIR / "covid",
    "after"      : MODEL_DIR / "after",
    "all_periods": MODEL_DIR / "all_periods",
}

MODEL_PATHS_ML = {
    "before"     : MODEL_DIR_ML / "before",
    "covid"      : MODEL_DIR_ML / "covid",
    "after"      : MODEL_DIR_ML / "after",
    "all_periods": MODEL_DIR_ML / "all_periods",
}

# ══════════════════════════════════════════════════════════════
#  GLOBAL RESOURCE VARIABLES
# ══════════════════════════════════════════════════════════════
_kamus_dict          : dict = {}
_stop_words          : set  = set()
_stemmer                    = None
_stanza_nlp                 = None
_svm_resources_loaded: bool = False

# ══════════════════════════════════════════════════════════════
#  LOAD KAMUS SLANG (sekali saat startup)
# ══════════════════════════════════════════════════════════════
def _load_kamus() -> dict:
    global _kamus_dict
    if _kamus_dict:
        return _kamus_dict
    try:
        if KAMUS_PATH.exists():
            df_k = pd.read_excel(KAMUS_PATH, dtype=str)
            cols = df_k.columns.tolist()
            if len(cols) >= 2:
                _kamus_dict = dict(zip(
                    df_k[cols[0]].str.lower().fillna(""),
                    df_k[cols[1]].fillna(""),
                ))
            print(f"✅ Kamus slang dimuat: {len(_kamus_dict)} entri")
        else:
            print(f"⚠️  Kamus tidak ditemukan: {KAMUS_PATH}")
    except Exception as e:
        print(f"❌ Gagal load kamus: {e}")
    return _kamus_dict


# ══════════════════════════════════════════════════════════════
#  LOAD RESOURCE SVM (lazy, sekali saja)
# ══════════════════════════════════════════════════════════════
def _load_svm_resources():
    """Load stopwords, stemmer Sastrawi, dan Stanza — hanya sekali."""
    global _stop_words, _stemmer, _stanza_nlp, _svm_resources_loaded
    if _svm_resources_loaded:
        return

    # Stopwords NLTK bahasa Indonesia
    try:
        nltk.download("stopwords", quiet=True)
        _stop_words = set(stopwords.words("indonesian"))
        print(f"✅ Stopwords dimuat: {len(_stop_words)} kata")
    except Exception as e:
        print(f"⚠️  Stopwords gagal: {e}")
        _stop_words = set()

    # Stemmer Sastrawi
    try:
        _stemmer = StemmerFactory().create_stemmer()
        print("✅ Stemmer Sastrawi siap")
    except Exception as e:
        print(f"⚠️  Stemmer gagal: {e}")
        _stemmer = None

    # Stanza (opsional — fallback ke split() jika tidak tersedia)
    if _STANZA_AVAILABLE:
        try:
            _stanza_nlp = _stanza_lib.Pipeline(
                lang="id",
                processors="tokenize",
                tokenize_no_ssplit=True,
                verbose=False,
            )
            print("✅ Stanza pipeline siap")
        except Exception:
            try:
                _stanza_lib.download("id")
                _stanza_nlp = _stanza_lib.Pipeline(
                    lang="id",
                    processors="tokenize",
                    tokenize_no_ssplit=True,
                    verbose=False,
                )
                print("✅ Stanza pipeline siap (setelah download)")
            except Exception as e:
                print(f"⚠️  Stanza gagal: {e} — akan pakai split() biasa")
                _stanza_nlp = None
    else:
        print("⚠️  Stanza tidak terinstall — tokenisasi pakai split()")
        _stanza_nlp = None

    _svm_resources_loaded = True


# ══════════════════════════════════════════════════════════════
#  PREPROCESSING — DL (IndoBERTweet)
# ══════════════════════════════════════════════════════════════
def preprocess_tweet_dl(tweet: str) -> str:
    """
    Preprocessing ringan untuk IndoBERTweet.
    TIDAK di-stem / stopword removal — model transformer sudah
    menangani konteks kata secara internal.

    Urutan:
        casefolding → URL → hashtag → cashtag → mention →
        emoji → emoticon → karakter non-alfanumerik →
        normalisasi tanda berulang → spasi → kamus slang
    """
    kamus_dict = _load_kamus()
    tweet = str(tweet).lower()

    # 1. URL
    tweet = re.sub(r"(https?://|www\.)\S+", " ", tweet)

    # 2. Hashtag → ambil isi kata
    tweet = re.sub(r"#(\w+)", r"\1", tweet)

    # 3. Cashtag
    tweet = re.sub(r"\$", "", tweet)

    # 4. Mention
    tweet = re.sub(r"@\w+", " ", tweet)

    # 5. Emoji
    try:
        tweet = emoji.replace_emoji(tweet, replace=" ")
    except Exception:
        pass

    # 6. Emoticon teks
    tweet = re.sub(r"(:-?\)|:-?\(|;-\)|:-?D|:-?P|<3|xD)", " ", tweet)

    # 7. Karakter non-alfanumerik (soft clean — pertahankan angka)
    tweet = re.sub(r"[^a-z0-9\s.,%!?]", " ", tweet)

    # 8. Normalisasi tanda berulang
    tweet = re.sub(r"\.{2,}", ".", tweet)
    tweet = re.sub(r"!{2,}", "!", tweet)
    tweet = re.sub(r"\?{2,}", "?", tweet)

    # 9. Rapikan spasi
    tweet = re.sub(r"\s+", " ", tweet).strip()

    # 10. Normalisasi slang → kata baku
    if kamus_dict:
        words = tweet.split()
        words = [kamus_dict.get(w, w) for w in words]
        tweet = " ".join(words)

    return tweet


# ══════════════════════════════════════════════════════════════
#  PREPROCESSING — SVM (TF-IDF + Sastrawi + Stanza)
# ══════════════════════════════════════════════════════════════
def preprocess_tweet_svm(tweet: str) -> str:
    """
    Preprocessing lengkap untuk SVM sesuai pipeline skripsi.

    Urutan:
        casefolding → URL → hashtag/cashtag/mention → emoji/emoticon →
        angka → karakter non-alfabet → kamus slang →
        tokenisasi Stanza → stopword removal → stemming Sastrawi →
        filter token pendek
    """
    _load_svm_resources()
    kamus_dict = _load_kamus()

    tweet = str(tweet).lower()

    # 1. Hapus URL
    tweet = re.sub(
        r"(https?://|ftp://|www\.)\S+|bit\.ly/\S+|t\.co/\S+",
        " ", tweet
    )

    # 2. Hapus hashtag, cashtag, mention
    tweet = re.sub(r"#\w+", " ", tweet)
    tweet = re.sub(r"\$\w+", " ", tweet)
    tweet = re.sub(r"@\w+", " ", tweet)

    # 3. Hapus emoji
    try:
        tweet = emoji.replace_emoji(tweet, replace=" ")
    except Exception:
        pass

    # 4. Hapus emotikon teks
    tweet = re.sub(
        r"(:-?\)|:-?\(|;-?\)|:-?D|:-?P|:-?\||:'[(\)]|<3|>:<|xD|:'\))",
        " ", tweet, flags=re.IGNORECASE
    )

    # 5. Hapus angka yang berdiri sendiri
    tweet = re.sub(r"\b\d+\b", " ", tweet)

    # 6. Hapus karakter selain huruf dan spasi
    tweet = re.sub(r"[^a-z\s]", " ", tweet)

    # 7. Rapikan spasi
    tweet = re.sub(r"\s+", " ", tweet).strip()

    # 8. Normalisasi slang → kata baku
    if kamus_dict:
        words = tweet.split()
        words = [kamus_dict.get(w, w) for w in words]
        tweet = " ".join(words)

    # 9. Tokenisasi (Stanza atau fallback split)
    if _stanza_nlp is not None:
        try:
            doc    = _stanza_nlp(tweet)
            tokens = [w.text for sent in doc.sentences for w in sent.words]
        except Exception:
            tokens = tweet.split()
    else:
        tokens = tweet.split()

    # 10. Stopword removal
    if _stop_words:
        tokens = [t for t in tokens if t not in _stop_words]

    # 11. Stemming Sastrawi
    if _stemmer is not None:
        tokens = [_stemmer.stem(t) for t in tokens]

    # 12. Filter token terlalu pendek (≤ 2 karakter)
    tokens = [t for t in tokens if len(t) > 2]

    return " ".join(tokens) if tokens else "tidak ada informasi"


# ── Alias backward compatibility ─────────────────────────────
def preprocess_tweet(tweet: str) -> str:
    """Alias ke preprocess_tweet_dl (default untuk DL/IndoBERTweet)."""
    return preprocess_tweet_dl(tweet)


# ══════════════════════════════════════════════════════════════
#  LOAD MODEL DL (lazy, cached)
# ══════════════════════════════════════════════════════════════
_models_dl = {}
_tokenizer = None

MAX_LENGTH = 128
BATCH_SIZE = 16
DEVICE     = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _get_tokenizer(model_dir: Path):
    global _tokenizer
    if _tokenizer is None:
        tokenizer_dir = model_dir / "tokenizer"
        if tokenizer_dir.exists():
            _tokenizer = AutoTokenizer.from_pretrained(str(tokenizer_dir))
        else:
            _tokenizer = AutoTokenizer.from_pretrained(
                "indolem/indobertweet-base-uncased"
            )
    return _tokenizer


def _get_model_dl(periode: str):
    if periode in _models_dl:
        return _models_dl[periode]

    model_dir = MODEL_PATHS.get(periode)
    if model_dir is None or not model_dir.exists():
        return None

    bin_file = model_dir / "best_model.bin"
    if not bin_file.exists():
        return None

    try:
        le_file = model_dir / "label_encoder.joblib"
        le      = joblib.load(le_file) if le_file.exists() else None

        config     = AutoConfig.from_pretrained(str(model_dir), num_labels=2)
        model      = AutoModelForSequenceClassification.from_config(config)
        state_dict = torch.load(bin_file, map_location=DEVICE)
        model.load_state_dict(state_dict, strict=True)
        model.to(DEVICE)
        model.eval()

        _models_dl[periode] = {"model": model, "le": le}
        print(f"✅ Model DL [{periode}] berhasil dimuat")
        return _models_dl[periode]

    except Exception as e:
        print(f"❌ Gagal load model DL [{periode}]: {e}")
        return None


def _predict_batch_dl(texts: list, periode: str = "all_periods") -> list:
    """Inferensi batch menggunakan model IndoBERTweet."""
    model_bundle = _get_model_dl(periode)
    if model_bundle is None:
        return ["negatif"] * len(texts)

    model     = model_bundle["model"]
    le        = model_bundle["le"]
    tokenizer = _get_tokenizer(MODEL_PATHS[periode])

    results = []
    for i in range(0, len(texts), BATCH_SIZE):
        batch      = texts[i : i + BATCH_SIZE]
        batch_safe = [t if t.strip() else "tidak ada informasi" for t in batch]

        encoding = tokenizer(
            batch_safe,
            max_length     = MAX_LENGTH,
            padding        = "max_length",
            truncation     = True,
            return_tensors = "pt",
        )
        input_ids      = encoding["input_ids"].to(DEVICE)
        attention_mask = encoding["attention_mask"].to(DEVICE)

        with torch.no_grad():
            logits = model(
                input_ids=input_ids,
                attention_mask=attention_mask
            ).logits
            preds = torch.argmax(logits, dim=1).cpu().numpy()

        if le is not None:
            labels = le.inverse_transform(preds)
        else:
            labels = ["positif" if p == 1 else "negatif" for p in preds]

        results.extend(labels)

    return results


# ══════════════════════════════════════════════════════════════
#  LOAD MODEL SVM (lazy, cached)
# ══════════════════════════════════════════════════════════════
_models_svm: dict = {}


def _get_model_svm(periode: str):
    if periode in _models_svm:
        return _models_svm[periode]

    model_dir = MODEL_PATHS_ML.get(periode)
    if model_dir is None or not model_dir.exists():
        print(f"⚠️  Direktori SVM [{periode}] tidak ditemukan: {model_dir}")
        return None

    svm_file   = model_dir / "svm_model.joblib"
    tfidf_file = model_dir / "tfidf_vectorizer.joblib"
    le_file    = model_dir / "label_encoder.joblib"

    if not svm_file.exists() or not tfidf_file.exists():
        print(f"⚠️  File SVM [{periode}] tidak lengkap")
        return None

    try:
        svm_model  = joblib.load(svm_file)
        vectorizer = joblib.load(tfidf_file)
        le         = joblib.load(le_file) if le_file.exists() else None

        _models_svm[periode] = {
            "model"     : svm_model,
            "vectorizer": vectorizer,
            "le"        : le,
        }
        print(f"✅ Model SVM [{periode}] berhasil dimuat")
        return _models_svm[periode]

    except Exception as e:
        print(f"❌ Gagal load model SVM [{periode}]: {e}")
        return None


def _predict_batch_svm(texts: list, periode: str = "all_periods") -> list:
    """Inferensi batch menggunakan model SVM + TF-IDF."""
    bundle = _get_model_svm(periode)
    if bundle is None:
        return ["netral"] * len(texts)

    svm_model  = bundle["model"]
    vectorizer = bundle["vectorizer"]
    le         = bundle["le"]

    safe_texts = [t if t.strip() else "tidak ada informasi" for t in texts]

    try:
        X     = vectorizer.transform(safe_texts)
        preds = svm_model.predict(X)

        if le is not None:
            labels = list(le.inverse_transform(preds))
        else:
            labels = [str(p) for p in preds]

        return labels

    except Exception as e:
        print(f"❌ Error prediksi SVM: {e}")
        return ["netral"] * len(texts)


# ══════════════════════════════════════════════════════════════
#  HELPER UMUM
# ══════════════════════════════════════════════════════════════
def _get_model_param() -> str:
    m = request.args.get("model", "dl").lower()
    return m if m in VALID_MODEL else "dl"


def _build_upload_trend(df: pd.DataFrame, date_col: str | None) -> list:
    if not date_col or date_col not in df.columns:
        return []

    tmp = df[[date_col, "sentiment_hasil"]].copy()
    tmp[date_col] = pd.to_datetime(tmp[date_col], errors="coerce")
    tmp = tmp.dropna(subset=[date_col])

    if tmp.empty:
        return []

    tmp["period_key"] = tmp[date_col].dt.strftime("%Y-%m-%d")

    hasil = []
    for key, grp in tmp.groupby("period_key", sort=True):
        positif = int((grp["sentiment_hasil"].str.lower() == "positif").sum())
        negatif = int((grp["sentiment_hasil"].str.lower() == "negatif").sum())
        netral  = int((grp["sentiment_hasil"].str.lower() == "netral").sum())
        hasil.append({
            "label"  : key,
            "positif": positif,
            "negatif": negatif,
            "netral" : netral,
            "total"  : int(len(grp)),
        })

    return hasil


# ══════════════════════════════════════════════════════════════
#  VIEWS & API HANDLERS
# ══════════════════════════════════════════════════════════════

def index():
    """Render halaman utama dashboard."""
    _load_kamus()  # pre-load kamus saat startup
    return render_template("index.html")


def get_dashboard_data():
    """GET /api/dashboard?periode=all_periods&model=dl"""
    periode = request.args.get("periode", "all_periods")
    model   = _get_model_param()

    if periode not in VALID_PERIODE:
        return jsonify({"error": "periode tidak valid"}), 400

    df = load_csv(periode, model)
    if df is None:
        return jsonify({
            "error": f"Data untuk periode '{periode}' model '{model}' tidak ditemukan"
        }), 404

    distribusi = hitung_distribusi(df, model)

    total_all   = sum(v["total"]         for v in distribusi.values())
    positif_all = sum(v["positif"]       for v in distribusi.values())
    negatif_all = sum(v["negatif"]       for v in distribusi.values())
    netral_all  = sum(v.get("netral", 0) for v in distribusi.values())

    resp = {
        "periode"      : periode,
        "periode_label": PERIODE_LABEL.get(periode, periode),
        "model"        : model,
        "total"        : total_all,
        "positif"      : positif_all,
        "negatif"      : negatif_all,
        "distribusi"   : distribusi,
    }
    if model == "svm":
        resp["netral"] = netral_all

    return jsonify(resp)


def get_trend_data():
    """GET /api/trend?saham=bbri&periode=all_periods&period_type=monthly&model=dl"""
    saham       = request.args.get("saham", "bbri").lower()
    periode     = request.args.get("periode", "all_periods")
    period_type = request.args.get("period_type", "monthly")
    model       = _get_model_param()

    if saham not in VALID_SAHAM:
        return jsonify({"error": "saham tidak valid"}), 400
    if periode not in VALID_PERIODE:
        return jsonify({"error": "periode tidak valid"}), 400
    if period_type not in ("daily", "weekly", "monthly"):
        return jsonify({"error": "period_type tidak valid"}), 400

    df = load_csv(periode, model)
    if df is None:
        return jsonify({"error": "Data tidak ditemukan"}), 404

    tren = hitung_tren(df, saham, period_type, model)

    return jsonify({
        "saham"      : saham,
        "saham_label": SAHAM_LABEL.get(saham, saham.upper()),
        "periode"    : periode,
        "period_type": period_type,
        "model"      : model,
        "data"       : tren,
    })


def get_saham_detail():
    """GET /api/saham?saham=bbri&periode=all_periods&model=dl"""
    saham   = request.args.get("saham", "bbri").lower()
    periode = request.args.get("periode", "all_periods")
    model   = _get_model_param()

    if saham not in VALID_SAHAM:
        return jsonify({"error": "saham tidak valid"}), 400
    if periode not in VALID_PERIODE:
        return jsonify({"error": "periode tidak valid"}), 400

    df = load_csv(periode, model)
    if df is None:
        return jsonify({"error": "Data tidak ditemukan"}), 404

    sub     = df[df["saham"].str.lower() == saham]
    total   = len(sub)
    positif = int((sub["sentiment"].str.lower() == "positif").sum())
    negatif = int((sub["sentiment"].str.lower() == "negatif").sum())
    netral  = int((sub["sentiment"].str.lower() == "netral").sum()) if model == "svm" else 0

    sample = (
        sub[["date", "tweet", "sentiment"]]
        .sort_values("date", ascending=False)
        .head(5)
        .to_dict(orient="records")
    )

    resp = {
        "saham"      : saham,
        "saham_label": SAHAM_LABEL.get(saham, saham.upper()),
        "periode"    : periode,
        "model"      : model,
        "total"      : total,
        "positif"    : positif,
        "negatif"    : negatif,
        "pct_positif": round(positif / total * 100, 1) if total > 0 else 0,
        "pct_negatif": round(negatif / total * 100, 1) if total > 0 else 0,
        "sample"     : sample,
    }
    if model == "svm":
        resp["netral"]     = netral
        resp["pct_netral"] = round(netral / total * 100, 1) if total > 0 else 0

    return jsonify(resp)


def upload_csv():
    """
    POST /api/upload  (multipart/form-data)
    Fields:
        file    — file CSV
        model   — 'dl' | 'svm'
        periode — 'before' | 'covid' | 'after' | 'all_periods'

    Alur:
        1. Baca CSV
        2. Validasi kolom (wajib ada kolom tweet/text/teks)
        3. Preprocessing sesuai model (DL atau SVM)
        4. Inferensi model
        5. Return: summary, preview 10 baris, tren harian, raw_rows, full_data
    """
    if "file" not in request.files:
        return jsonify({"error": "Tidak ada file yang diunggah"}), 400

    file    = request.files["file"]
    periode = request.form.get("periode", "all_periods")
    model   = request.form.get("model", "dl").lower()

    # ── Validasi input ────────────────────────────────────
    if file.filename == "":
        return jsonify({"error": "Nama file kosong"}), 400
    if not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Hanya file .csv yang diizinkan"}), 400
    if periode not in VALID_PERIODE:
        return jsonify({"error": "Periode tidak valid"}), 400
    if model not in VALID_MODEL:
        model = "dl"

    # ── Baca CSV ──────────────────────────────────────────
    try:
        raw = file.stream.read()
        try:
            content = raw.decode("utf-8")
        except UnicodeDecodeError:
            content = raw.decode("latin-1")

        df = pd.read_csv(io.StringIO(content), dtype=str).fillna("")
    except Exception as e:
        return jsonify({"error": f"Gagal membaca CSV: {str(e)}"}), 400

    valid, msg = validasi_csv_upload(df)
    if not valid:
        return jsonify({"error": msg}), 400

    # ── Temukan kolom tweet ───────────────────────────────
    col_map   = {c.lower(): c for c in df.columns}
    tweet_col = col_map.get("tweet") or col_map.get("text") or col_map.get("teks")
    if tweet_col is None:
        return jsonify({
            "error": "Kolom 'tweet', 'text', atau 'teks' tidak ditemukan di CSV"
        }), 400

    date_col = col_map.get("date") or col_map.get("tanggal")

    # ── Preprocessing (berbeda untuk DL dan SVM) ──────────
    raw_texts = df[tweet_col].tolist()
    if model == "svm":
        # SVM: stemming + stopword removal + tokenisasi Stanza
        cleaned_texts = [preprocess_tweet_svm(t) for t in raw_texts]
    else:
        # DL: preprocessing ringan, tidak di-stem
        cleaned_texts = [preprocess_tweet_dl(t) for t in raw_texts]

    # ── Inferensi ─────────────────────────────────────────
    try:
        if model == "svm":
            sentiments = _predict_batch_svm(cleaned_texts, periode)
        else:
            sentiments = _predict_batch_dl(cleaned_texts, periode)
    except Exception as e:
        return jsonify({"error": f"Inferensi model gagal: {str(e)}"}), 500

    df["sentiment_hasil"] = sentiments

    # ── Hitung ringkasan ──────────────────────────────────
    total   = len(df)
    positif = sentiments.count("positif")
    negatif = sentiments.count("negatif")
    netral  = sentiments.count("netral")

    # ── Tren harian (jika ada kolom tanggal) ──────────────
    trend_upload = _build_upload_trend(df, date_col)

    # ── Raw rows untuk tren interaktif di frontend ────────
    saham_col = col_map.get("saham")
    raw_rows  = []

    if date_col:
        for _, row in df.iterrows():
            entry = {
                "date"           : str(row.get(date_col, "")),
                "tweet"          : str(row.get(tweet_col, "")),
                "sentiment_hasil": str(row.get("sentiment_hasil", "")),
            }
            if saham_col:
                entry["saham"] = str(row.get(saham_col, ""))
            raw_rows.append(entry)
    else:
        # Tidak ada kolom date — tetap kirim tweet + sentiment untuk download
        for _, row in df.iterrows():
            entry = {
                "tweet"          : str(row.get(tweet_col, "")),
                "sentiment_hasil": str(row.get("sentiment_hasil", "")),
            }
            if saham_col:
                entry["saham"] = str(row.get(saham_col, ""))
            raw_rows.append(entry)

    # ── Preview 10 baris ──────────────────────────────────
    preview_cols = [tweet_col, "sentiment_hasil"]
    if date_col:
        preview_cols = [date_col] + preview_cols
    preview = df[preview_cols].head(10).to_dict(orient="records")

    # ── Full data untuk download ──────────────────────────
    download_cols = [tweet_col, "sentiment_hasil"]
    if date_col:
        download_cols = [date_col] + download_cols
    if saham_col:
        download_cols = [saham_col] + download_cols
    # Hindari duplikat kolom
    seen          = set()
    download_cols = [c for c in download_cols if not (c in seen or seen.add(c))]
    full_data     = df[download_cols].to_dict(orient="records")

    # ── Label model yang dipakai ──────────────────────────
    model_label = (
        f"IndoBERTweet — {PERIODE_LABEL.get(periode, periode)}"
        if model == "dl"
        else f"SVM — {PERIODE_LABEL.get(periode, periode)}"
    )

    resp = {
        "total"       : total,
        "positif"     : positif,
        "negatif"     : negatif,
        "pct_positif" : round(positif / total * 100, 1) if total > 0 else 0,
        "pct_negatif" : round(negatif / total * 100, 1) if total > 0 else 0,
        "model_used"  : model_label,
        "model"       : model,
        "preview"     : preview,
        "trend_upload": trend_upload,
        "raw_rows"    : raw_rows,
        "full_data"   : full_data,
    }

    # Netral hanya relevan untuk SVM
    if model == "svm":
        resp["netral"]     = netral
        resp["pct_netral"] = round(netral / total * 100, 1) if total > 0 else 0

    return jsonify(resp)