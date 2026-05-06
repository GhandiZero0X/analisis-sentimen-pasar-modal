"""
=============================================================
STEP 1: AUTO-LABELING dengan IndoBERTweet Sentiment Model
=============================================================
Model utama : your-anon-cat/indobertweet-sentiment-new
Fallback     : w11wo/indobertweet-base-sentiment-classifier-smsa
Label        : positif, netral, negatif

Input  : dev_database/1_raw/
         ├── tweets_before_covid.csv
         ├── tweets_covid.csv
         ├── tweets_after_covid.csv
         └── tweets_all_periods.csv

Output : dev_database/2_labelling/
         ├── tweets_before_covid_labelling.csv
         ├── tweets_covid_labelling.csv
         ├── tweets_after_covid_labelling.csv
         └── tweets_all_periods_labelling.csv

Catatan:
- Kolom tweet di output = TWEET ASLI (tidak berubah)
- Tweet yang dibersihkan hanya dipakai SEMENTARA untuk prediksi model
- Hanya kolom sentiment yang diisi hasil model
=============================================================
"""

import os
import re
import csv
import json
import torch
import pandas as pd
from pathlib import Path
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification, AutoConfig
from tqdm import tqdm

# ─── Konfigurasi Path ────────────────────────────────────────
INPUT_DIR  = Path("dev_database") / "1_raw"
OUTPUT_DIR = Path("dev_database") / "2_labelling"

# File CSV yang akan diproses
INPUT_FILES = [
    "tweets_before_covid.csv",
    "tweets_all_periods.csv",
    "tweets_covid.csv",
    "tweets_after_covid.csv",
]

# ─── Konfigurasi Model ───────────────────────────────────────
INDOBERTWEET_SENTIMENT_MODELS = [
    "your-anon-cat/indobertweet-sentiment-new",
    "w11wo/indobertweet-base-sentiment-classifier-smsa",
    "Andika/indobertweet-base-p1-finetuned-sentiment-new-id-sa",
]

BATCH_SIZE = 4  # Sesuaikan VRAM RTX 3050 4GB

# ─── Text Cleaning (HANYA untuk inferensi, bukan untuk output) ───
def clean_for_inference(text: str) -> str:
    """
    Bersihkan teks HANYA untuk keperluan prediksi model.
    Teks asli TIDAK akan diubah di output CSV.
    """
    if not isinstance(text, str):
        return ""
    return (
        text
        # NBSP → spasi normal
        .replace("\u00A0", " ")
        # newline → spasi
        .replace("\r\n", " ").replace("\n", " ").replace("\r", " ")
        # hapus URL
        .sub if False else text  # placeholder, lihat regex di bawah
    )

def clean_for_inference(text: str) -> str:
    """
    Bersihkan teks HANYA untuk keperluan prediksi model.
    Hasil cleaning ini TIDAK masuk ke output — hanya dipakai sementara.
    """
    if not isinstance(text, str) or text.strip() == "":
        return ""

    t = text
    t = t.replace("\u00A0", " ")                            # NBSP
    t = re.sub(r"[\r\n]+", " ", t)                         # newline → spasi
    t = re.sub(r'["\'""'']', "", t)                        # kutip
    t = re.sub(r"[…]", "", t)                              # elipsis
    t = re.sub(r"((?:\w+:\/\/|www\.|bit\.ly\/|t\.co\/)\S+)", "", t)  # URL
    t = re.sub(r"\s+", " ", t).strip()                     # spasi ganda
    return t


# ─── Load Model ──────────────────────────────────────────────
def check_model_base(model_name: str):
    try:
        config = AutoConfig.from_pretrained(model_name)
        base   = getattr(config, "_name_or_path", "unknown")
        arch   = getattr(config, "architectures", ["unknown"])[0]
        print(f"   Base model   : {base}")
        print(f"   Architecture : {arch}")
        print(f"   Num labels   : {config.num_labels}")
        if "indobertweet" in base.lower() or "indobertweet" in model_name.lower():
            print(f"   ✅ Confirmed: Berbasis IndoBERTweet")
        else:
            print(f"   ⚠️  Verifikasi manual bahwa ini IndoBERTweet")
    except Exception:
        pass


def load_model_with_fallback():
    device      = 0 if torch.cuda.is_available() else -1
    device_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    print(f"🖥️  Device: {device_name}\n")

    for i, model_name in enumerate(INDOBERTWEET_SENTIMENT_MODELS, 1):
        print(f"⬇️  Mencoba model {i}/{len(INDOBERTWEET_SENTIMENT_MODELS)}: {model_name}")
        try:
            check_model_base(model_name)
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model     = AutoModelForSequenceClassification.from_pretrained(model_name)
            if torch.cuda.is_available():
                model = model.half()  # fp16 hemat VRAM

            clf = pipeline(
                task="sentiment-analysis",
                model=model,
                tokenizer=tokenizer,
                device=device,
                max_length=128,
                truncation=True,
                padding=True,
                batch_size=BATCH_SIZE,
                return_all_scores=True,
            )
            print(f"\n✅ Berhasil load: {model_name}\n")
            return clf, model_name

        except Exception as e:
            print(f"   ❌ Gagal: {str(e)[:80]}\n   → Mencoba model berikutnya...\n")

    raise RuntimeError("Semua model IndoBERTweet gagal di-load.")


# ─── Label Mapping ───────────────────────────────────────────
def normalize_label(label: str) -> str:
    label = label.lower()
    if label in ["positif", "positive", "pos", "label_0"]:
        return "positif"
    elif label in ["negatif", "negative", "neg", "label_2"]:
        return "negatif"
    return "netral"


def detect_label_mapping(clf) -> dict:
    test_pos = clf("saham naik terus bagus sekali mantap")
    test_neg = clf("saham turun parah rugi besar")
    pos_label = max(test_pos[0], key=lambda x: x["score"])["label"]
    neg_label = max(test_neg[0], key=lambda x: x["score"])["label"]

    print(f"🔍 Deteksi label mapping:")
    print(f"   Kalimat positif → label: {pos_label}")
    print(f"   Kalimat negatif → label: {neg_label}")

    all_labels = [l["label"] for l in test_pos[0]]
    neutral_candidates = [l for l in all_labels if l not in [pos_label, neg_label]]
    neutral_label = neutral_candidates[0] if neutral_candidates else None

    mapping = {pos_label: "positif", neg_label: "negatif"}
    if neutral_label:
        mapping[neutral_label] = "netral"

    print(f"   Mapping: {mapping}\n")
    return mapping


# ─── Proses Satu File CSV ────────────────────────────────────
def process_csv(filepath: Path, clf, label_mapping: dict) -> pd.DataFrame:
    """
    1. Baca CSV → simpan tweet asli
    2. Buat versi cleaned hanya untuk inferensi model
    3. Prediksi → isi kolom sentiment
    4. Kembalikan DataFrame dengan tweet ASLI, sentiment BARU
    """
    print(f"\n📂 Membaca: {filepath.name}")
    df = pd.read_csv(filepath, dtype=str).fillna("")

    # Validasi kolom wajib ada
    required = {"date", "tweet", "sentiment", "saham"}
    missing  = required - set(df.columns)
    if missing:
        raise ValueError(f"Kolom tidak ditemukan di {filepath.name}: {missing}")

    print(f"   Total baris   : {len(df):,}")

    # ── Simpan tweet asli sebelum cleaning ──
    original_tweets = df["tweet"].tolist()

    # ── Buat versi cleaned hanya untuk model ──
    cleaned_tweets = [clean_for_inference(t) for t in original_tweets]

    # ── Inferensi batch ──
    print(f"   Menjalankan IndoBERTweet labeling...")
    sentiments = []

    for i in tqdm(range(0, len(cleaned_tweets), BATCH_SIZE),
                  desc=f"   [{filepath.stem}]", ncols=70):

        batch = cleaned_tweets[i : i + BATCH_SIZE]

        # Ganti string kosong dengan placeholder agar model tidak error
        batch_safe = [t if t.strip() else "[kosong]" for t in batch]

        try:
            outputs = clf(batch_safe)
            for scores in outputs:
                best      = max(scores, key=lambda x: x["score"])
                raw_label = best["label"]
                sentiment = label_mapping.get(raw_label, normalize_label(raw_label))
                sentiments.append(sentiment)
        except Exception as e:
            # Jika batch error, isi dengan "netral" sebagai fallback
            print(f"\n   ⚠️  Batch error (baris {i}–{i+BATCH_SIZE}): {e}")
            sentiments.extend(["netral"] * len(batch))

    # ── Susun output: tweet ASLI + sentiment BARU ──
    df_out = pd.DataFrame({
        "date"      : df["date"],
        "tweet"     : original_tweets,   # ← tweet asli, tidak berubah
        "sentiment" : sentiments,         # ← hasil model
        "saham"     : df["saham"],
    })

    # ── Distribusi label ──
    dist = df_out["sentiment"].value_counts()
    print(f"\n   📊 Distribusi sentimen:")
    for label, count in dist.items():
        pct = count / len(df_out) * 100
        bar = "█" * int(pct / 4)
        print(f"      {label:<10} {count:>5} ({pct:5.1f}%)  {bar}")

    return df_out


# ─── Simpan CSV ──────────────────────────────────────────────
def save_csv(df: pd.DataFrame, output_path: Path):
    """
    Simpan DataFrame ke CSV dengan format yang sama persis seperti input.
    Kolom: date, tweet, sentiment, saham
    """
    df.to_csv(output_path, index=False, encoding="utf-8-sig",
                quoting=csv.QUOTE_ALL)  # semua kolom di-quote untuk konsistensi
    size_kb = output_path.stat().st_size / 1024
    print(f"\n   💾 Disimpan → {output_path}  ({size_kb:.1f} KB)")


# ─── Main ────────────────────────────────────────────────────
def main():
    print("=" * 62)
    print("  Auto-Labeling CSV — IndoBERTweet Sentiment Model")
    print("=" * 62)
    print(f"\n📁 Input  : {INPUT_DIR}")
    print(f"📁 Output : {OUTPUT_DIR}\n")

    # Buat folder output jika belum ada
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load model sekali, dipakai untuk semua file
    clf, used_model = load_model_with_fallback()
    label_mapping   = detect_label_mapping(clf)

    print("─" * 62)

    success = 0
    failed  = []

    for filename in INPUT_FILES:
        input_path = INPUT_DIR / filename

        # Nama output: tambahkan _labelling sebelum .csv
        stem        = Path(filename).stem                        # tweets_before_covid
        output_name = f"{stem}_labelling.csv"                   # tweets_before_covid_labelling.csv
        output_path = OUTPUT_DIR / output_name

        if not input_path.exists():
            print(f"\n⚠️  File tidak ditemukan, skip: {filename}")
            failed.append(filename)
            continue

        try:
            df_labeled = process_csv(input_path, clf, label_mapping)
            save_csv(df_labeled, output_path)
            success += 1
        except Exception as e:
            print(f"\n❌ Gagal proses {filename}: {e}")
            failed.append(filename)

    # ── Ringkasan Akhir ──
    print("\n" + "=" * 62)
    print("  RINGKASAN")
    print("=" * 62)
    print(f"  ✅ Berhasil  : {success} file")
    if failed:
        print(f"  ❌ Gagal     : {len(failed)} file → {failed}")
    print(f"  🤖 Model     : {used_model}")
    print(f"  📂 Output    : {OUTPUT_DIR}/")
    print("=" * 62)
    print("\n  Lanjut ke: python 02_train_svm.py")


if __name__ == "__main__":
    main()