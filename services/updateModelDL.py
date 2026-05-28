# services/updateModelDL.py
"""
Pipeline Update Model IndoBERTweet (production):
  1. Preprocessing   → case folding, cleaning, normalisasi slang, buang baris kosong
  2. Modelling       → load model .bin yang ada, fine-tune dengan data baru, simpan
  3. Evaluasi        → confusion matrix, metrics CSV, training curve, classification report
  4. Komparasi       → update tabel_komparasi.csv
  5. Analisis        → prediksi sentimen data baru, gabung dengan data lama
"""

from __future__ import annotations

import csv
import io
import joblib
import os
import re
import time
import warnings
from datetime import datetime
from pathlib import Path
from typing import Callable

import emoji
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import pandas as pd
import seaborn as sns
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from tqdm import tqdm

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from transformers import (
    AutoConfig,
    AutoModelForSequenceClassification,
    AutoTokenizer,
    get_linear_schedule_with_warmup,
)

warnings.filterwarnings("ignore")

PERIOD_TO_FOLDER = {
    "before":      "data/modelDL/before",
    "covid":       "data/modelDL/covid",
    "after":       "data/modelDL/after",
    "all_periods": "data/modelDL/all_periods",
}

PERIOD_LABELS = {
    "before":      "Sebelum COVID",
    "covid":       "Masa COVID",
    "after":       "Setelah COVID",
    "all_periods": "Semua Periode",
}

ANALISIS_FILES = {
    "before":      "data/csv/dl/tweets_before_labelling_analisisDL.csv",
    "covid":       "data/csv/dl/tweets_covid_labelling_analisisDL.csv",
    "after":       "data/csv/dl/tweets_after_labelling_analisisDL.csv",
    "all_periods": "data/csv/dl/tweets_all_periods_labelling_analisisDL.csv",
}

KOMPARASI_CSV = "data/komparasi/tabel_komparasi.csv"
KAMUS_FILE    = "data/kamus/kamuskatabaku.xlsx"
MODEL_NAME    = "indolem/indobertweet-base-uncased"

MAX_LENGTH    = 128
BATCH_SIZE    = 16
EPOCHS        = 5
LEARNING_RATE = 2e-5
WARMUP_RATIO  = 0.1
WEIGHT_DECAY  = 0.01
RANDOM_SEED   = 0
TRAIN_RATIO   = 0.80
VAL_RATIO     = 0.10
TEST_RATIO    = 0.10

torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(RANDOM_SEED)


class TweetDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length):
        self.texts      = texts
        self.labels     = labels
        self.tokenizer  = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        enc = self.tokenizer(
            self.texts[idx],
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )
        return {
            "input_ids":      enc["input_ids"].squeeze(0),
            "attention_mask": enc["attention_mask"].squeeze(0),
            "label":          torch.tensor(self.labels[idx], dtype=torch.long),
        }


class InferDataset(Dataset):
    def __init__(self, texts, tokenizer, max_length):
        self.texts      = texts
        self.tokenizer  = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        enc = self.tokenizer(
            self.texts[idx],
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )
        return {
            "input_ids":      enc["input_ids"].squeeze(0),
            "attention_mask": enc["attention_mask"].squeeze(0),
        }


def _load_kamus(root_path: str) -> dict:
    kamus_path = os.path.join(root_path, KAMUS_FILE)
    if not os.path.exists(kamus_path):
        return {}
    df = pd.read_excel(kamus_path)
    return dict(zip(
        df["tidak_baku"].astype(str).str.lower(),
        df["kata_baku"].astype(str).str.lower(),
    ))


def _preprocess_text(tweet: str, kamus: dict) -> str:
    tweet = str(tweet).lower()
    tweet = re.sub(r"(https?://|www\.)\S+", " ", tweet)
    tweet = re.sub(r"#(\w+)", r"\1", tweet)
    tweet = re.sub(r"\$", "", tweet)
    tweet = re.sub(r"@\w+", " ", tweet)
    tweet = emoji.replace_emoji(tweet, replace=" ")
    tweet = re.sub(r"(:-?\)|:-?\(|;-\)|:-?D|:-?P|<3|xD)", " ", tweet, flags=re.IGNORECASE)
    tweet = re.sub(r"[^a-z0-9\s.,%!?]", " ", tweet)
    tweet = re.sub(r"\.{2,}", ".", tweet)
    tweet = re.sub(r"!{2,}", "!", tweet)
    tweet = re.sub(r"\?{2,}", "?", tweet)
    tweet = re.sub(r"\s+", " ", tweet).strip()
    words = [kamus.get(w, w) for w in tweet.split()]
    return " ".join(words)


def step_preprocessing(
    csv_path: str,
    root_path: str,
    job_id: str,
    set_status: Callable,
) -> pd.DataFrame:
    set_status(job_id, "Preprocessing: membaca CSV...", 5)
    df = pd.read_csv(csv_path, dtype=str).fillna("")

    text_col = next(
        (c for c in df.columns if "tweet" in c.lower()), df.columns[0],
    )
    sentiment_col = next(
        (c for c in df.columns if "sentiment" in c.lower() or "label" in c.lower()),
        None,
    )

    set_status(job_id, "Preprocessing: memuat kamus slang...", 8)
    kamus = _load_kamus(root_path)

    set_status(job_id, "Preprocessing: membersihkan teks...", 10)
    df["tweet_preprocessed_dl"] = df[text_col].apply(
        lambda t: _preprocess_text(t, kamus)
    )

    before = len(df)
    df = df[df["tweet_preprocessed_dl"].str.strip() != ""].reset_index(drop=True)
    after = len(df)
    print(f"   Preprocessing: {before} → {after} baris (hapus {before - after} kosong)")

    if sentiment_col and sentiment_col != "sentiment":
        df = df.rename(columns={sentiment_col: "sentiment"})
    elif not sentiment_col:
        raise ValueError(
            "CSV tidak memiliki kolom sentiment/label. "
            "Pastikan CSV memiliki kolom bernama 'sentiment' atau 'label'."
        )

    df["tweet_original"] = df[text_col]
    set_status(job_id, "Preprocessing selesai.", 15)
    return df


def _train_one_epoch(model, loader, optimizer, scheduler, device):
    model.train()
    total_loss, total_correct, total_n = 0.0, 0, 0
    for batch in loader:
        ids   = batch["input_ids"].to(device)
        mask  = batch["attention_mask"].to(device)
        lbls  = batch["label"].to(device)
        optimizer.zero_grad()
        out   = model(input_ids=ids, attention_mask=mask, labels=lbls)
        out.loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        scheduler.step()
        preds          = torch.argmax(out.logits, dim=1)
        total_correct += (preds == lbls).sum().item()
        total_loss    += out.loss.item() * len(lbls)
        total_n       += len(lbls)
    return total_loss / total_n, total_correct / total_n


def _eval_one_epoch(model, loader, device, pos_label):
    model.eval()
    total_loss, total_correct, total_n = 0.0, 0, 0
    all_preds, all_labels = [], []
    with torch.no_grad():
        for batch in loader:
            ids   = batch["input_ids"].to(device)
            mask  = batch["attention_mask"].to(device)
            lbls  = batch["label"].to(device)
            out   = model(input_ids=ids, attention_mask=mask, labels=lbls)
            preds = torch.argmax(out.logits, dim=1)
            total_correct  += (preds == lbls).sum().item()
            total_loss     += out.loss.item() * len(lbls)
            total_n        += len(lbls)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(lbls.cpu().numpy())
    avg_loss = total_loss / total_n
    accuracy = total_correct / total_n
    f1 = f1_score(all_labels, all_preds, average="binary", pos_label=pos_label, zero_division=0)
    return avg_loss, accuracy, f1


def step_modelling(
    df: pd.DataFrame,
    period: str,
    root_path: str,
    job_id: str,
    set_status: Callable,
) -> tuple[Path, LabelEncoder, dict]:
    set_status(job_id, "Modelling: menyiapkan data...", 18)

    model_dir = Path(root_path) / PERIOD_TO_FOLDER[period]
    model_dir.mkdir(parents=True, exist_ok=True)

    df_train = df[df["sentiment"].isin(["positif", "negatif"])].reset_index(drop=True)
    if len(df_train) == 0:
        raise ValueError("Tidak ada data berlabel 'positif' atau 'negatif' di CSV.")

    le = LabelEncoder()
    y  = le.fit_transform(df_train["sentiment"])
    X  = df_train["tweet_preprocessed_dl"].tolist()
    pos_label = list(le.classes_).index("positif")

    X_tv, X_test, y_tv, y_test = train_test_split(
        X, y, test_size=TEST_RATIO, random_state=RANDOM_SEED, stratify=y
    )
    val_adj = VAL_RATIO / (TRAIN_RATIO + VAL_RATIO)
    X_train, X_val, y_train, y_val = train_test_split(
        X_tv, y_tv, test_size=val_adj, random_state=RANDOM_SEED, stratify=y_tv
    )

    set_status(job_id, "Modelling: memuat tokenizer...", 22)
    tokenizer_dir = model_dir / "tokenizer"
    if tokenizer_dir.exists():
        tokenizer = AutoTokenizer.from_pretrained(str(tokenizer_dir))
    else:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer.save_pretrained(str(tokenizer_dir))

    set_status(job_id, "Modelling: memuat model...", 26)
    device   = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    bin_file = model_dir / "best_model.bin"

    if bin_file.exists():
        config = AutoConfig.from_pretrained(str(model_dir), num_labels=len(le.classes_))
        model  = AutoModelForSequenceClassification.from_config(config)
        state  = torch.load(str(bin_file), map_location=device)
        model.load_state_dict(state, strict=False)
        print(f"   ✅ Checkpoint dimuat dari {bin_file.name}")
    else:
        model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_NAME, num_labels=len(le.classes_)
        )
        print(f"   ✅ Model baru dari {MODEL_NAME}")

    model.to(device)

    train_ds = TweetDataset(X_train, y_train, tokenizer, MAX_LENGTH)
    val_ds   = TweetDataset(X_val,   y_val,   tokenizer, MAX_LENGTH)
    train_dl = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0)
    val_dl   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    optimizer    = AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)
    total_steps  = len(train_dl) * EPOCHS
    warmup_steps = int(total_steps * WARMUP_RATIO)
    scheduler    = get_linear_schedule_with_warmup(optimizer, warmup_steps, total_steps)

    set_status(job_id, "Modelling: fine-tuning...", 30)

    best_val_loss  = float("inf")
    best_epoch     = 0
    train_log      = []
    training_start = time.time()

    for epoch in range(1, EPOCHS + 1):
        pct = 30 + int((epoch / EPOCHS) * 30)
        set_status(job_id, f"Modelling: epoch {epoch}/{EPOCHS}...", pct)
        ep_start = time.time()

        t_loss, t_acc           = _train_one_epoch(model, train_dl, optimizer, scheduler, device)
        v_loss, v_acc, v_f1     = _eval_one_epoch(model, val_dl, device, pos_label)

        ep_rt = time.time() - ep_start
        train_log.append({
            "epoch":       epoch,
            "train_loss":  round(t_loss, 5),
            "train_acc":   round(t_acc,  4),
            "val_loss":    round(v_loss,  5),
            "val_acc":     round(v_acc,   4),
            "val_f1":      round(v_f1,    4),
            "runtime_sec": round(ep_rt,   2),
        })

        if v_loss < best_val_loss:
            best_val_loss = v_loss
            best_epoch    = epoch
            torch.save(model.state_dict(), str(model_dir / "best_model.bin"))
            model.config.save_pretrained(str(model_dir))

    training_rt = time.time() - training_start

    pd.DataFrame(train_log).to_csv(str(model_dir / "train_log.csv"), index=False)
    joblib.dump(le, str(model_dir / "label_encoder.joblib"))
    split_data = {"X_test": X_test, "y_test": y_test}
    joblib.dump(split_data, str(model_dir / "split_indices.joblib"))

    device_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    info = (
        f"TRAINING INFO — IndoBERTweet Update\n"
        f"=====================================\n"
        f"Tanggal         : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"Period          : {period}\n"
        f"Total data      : {len(df_train):,}\n"
        f"Kelas           : {list(le.classes_)}\n"
        f"Best epoch      : {best_epoch}\n"
        f"Best val_loss   : {best_val_loss:.5f}\n"
        f"Fine-tuning     : {training_rt:.2f} detik\n"
        f"Device          : {device_name}\n"
    )
    (model_dir / "train_info.txt").write_text(info, encoding="utf-8")

    set_status(job_id, "Modelling selesai.", 60)
    return model_dir, le, split_data, training_rt


def step_evaluasi(
    model_dir: Path,
    le: LabelEncoder,
    split_data: dict,
    job_id: str,
    set_status: Callable,
) -> dict:
    set_status(job_id, "Evaluasi: memuat model terbaik...", 62)

    X_test      = split_data["X_test"]
    y_test      = split_data["y_test"]
    class_names = list(le.classes_)
    pos_label   = class_names.index("positif")

    device    = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tokenizer = AutoTokenizer.from_pretrained(str(model_dir / "tokenizer"))
    config    = AutoConfig.from_pretrained(str(model_dir), num_labels=len(class_names))
    model     = AutoModelForSequenceClassification.from_config(config)
    state     = torch.load(str(model_dir / "best_model.bin"), map_location=device)
    model.load_state_dict(state, strict=True)
    model.to(device)
    model.eval()

    set_status(job_id, "Evaluasi: inferensi test set...", 65)
    eval_start = time.time()
    test_ds    = TweetDataset(X_test, y_test, tokenizer, MAX_LENGTH)
    test_dl    = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    all_preds, all_labels = [], []
    with torch.no_grad():
        for batch in test_dl:
            ids  = batch["input_ids"].to(device)
            mask = batch["attention_mask"].to(device)
            lbls = batch["label"].to(device)
            out  = model(input_ids=ids, attention_mask=mask)
            preds = torch.argmax(out.logits, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(lbls.cpu().numpy())

    eval_rt    = time.time() - eval_start
    all_preds  = np.array(all_preds)
    all_labels = np.array(all_labels)

    acc              = accuracy_score(all_labels, all_preds)
    binary_precision = precision_score(all_labels, all_preds, average="binary", pos_label=pos_label, zero_division=0)
    binary_recall    = recall_score(   all_labels, all_preds, average="binary", pos_label=pos_label, zero_division=0)
    binary_f1        = f1_score(       all_labels, all_preds, average="binary", pos_label=pos_label, zero_division=0)
    f1_weighted      = f1_score(       all_labels, all_preds, average="weighted", zero_division=0)
    f1_macro         = f1_score(       all_labels, all_preds, average="macro",    zero_division=0)

    precision_recall_fscore_support(
        all_labels, all_preds, average=None,
        labels=list(range(len(class_names))), zero_division=0
    )

    set_status(job_id, "Evaluasi: membuat confusion matrix...", 70)
    cm = confusion_matrix(all_labels, all_preds, labels=list(range(len(class_names))))
    fig, ax = plt.subplots(figsize=(6, 5))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=[c.capitalize() for c in class_names],
        yticklabels=[c.capitalize() for c in class_names],
        linewidths=0.5, ax=ax,
    )
    ax.set_xlabel("Prediksi", fontsize=12, labelpad=10)
    ax.set_ylabel("Aktual",   fontsize=12, labelpad=10)
    ax.set_title(f"Confusion Matrix — IndoBERTweet\nAccuracy: {acc:.4f}", fontsize=13, pad=15)
    for i in range(len(class_names)):
        row_sum = cm[i].sum()
        for j in range(len(class_names)):
            pct = (cm[i, j] / row_sum * 100) if row_sum > 0 else 0
            ax.text(j + 0.5, i + 0.72, f"({pct:.1f}%)", ha="center", va="center", fontsize=8, color="gray")
    plt.tight_layout()
    plt.savefig(str(model_dir / "confusion_matrix_indobertweet.png"), dpi=150, bbox_inches="tight")
    plt.close()

    set_status(job_id, "Evaluasi: menyimpan metrics CSV...", 73)
    best_epoch     = None
    train_log_path = model_dir / "train_log.csv"
    if train_log_path.exists():
        tl         = pd.read_csv(str(train_log_path))
        best_epoch = int(tl.loc[tl["val_f1"].idxmax(), "epoch"])

    pd.DataFrame([{
        "accuracy":   acc,
        "precision":  binary_precision,
        "recall":     binary_recall,
        "f1_score":   binary_f1,
        "best_epoch": best_epoch,
    }]).to_csv(str(model_dir / "evaluation_metrics.csv"), index=False, encoding="utf-8")

    set_status(job_id, "Evaluasi: membuat training curve...", 76)
    if train_log_path.exists():
        log_df = pd.read_csv(str(train_log_path))
        fig, axes = plt.subplots(1, 2, figsize=(12, 5))
        fig.suptitle("Training Curve — IndoBERTweet Update", fontsize=13)
        axes[0].plot(log_df["epoch"], log_df["train_loss"], "o-",  label="Train Loss", linewidth=2)
        axes[0].plot(log_df["epoch"], log_df["val_loss"],   "s--", label="Val Loss",   linewidth=2)
        axes[0].set_xlabel("Epoch"); axes[0].set_ylabel("Loss")
        axes[0].set_title("Loss per Epoch"); axes[0].legend(); axes[0].grid(alpha=0.3)
        axes[0].xaxis.set_major_locator(mticker.MaxNLocator(integer=True))
        axes[1].plot(log_df["epoch"], log_df["train_acc"], "o-",  label="Train Acc",    linewidth=2)
        axes[1].plot(log_df["epoch"], log_df["val_acc"],   "s--", label="Val Acc",      linewidth=2)
        axes[1].plot(log_df["epoch"], log_df["val_f1"],    "^:",  label="Val F1-binary", linewidth=2)
        axes[1].set_xlabel("Epoch"); axes[1].set_ylabel("Score")
        axes[1].set_title("Accuracy & F1 per Epoch")
        axes[1].set_ylim([0, 1.05]); axes[1].legend(); axes[1].grid(alpha=0.3)
        axes[1].xaxis.set_major_locator(mticker.MaxNLocator(integer=True))
        plt.tight_layout()
        plt.savefig(str(model_dir / "training_curve_indobertweet.png"), dpi=150, bbox_inches="tight")
        plt.close()

    report = classification_report(all_labels, all_preds, target_names=class_names, digits=4, zero_division=0)
    report_text = (
        f"EVALUATION REPORT — IndoBERTweet Update\n"
        f"=========================================\n"
        f"Tanggal      : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"Test set     : {len(X_test):,} baris\n\n"
        f"ACCURACY\n--------\n{acc:.4f}\n\n"
        f"CLASSIFICATION REPORT\n---------------------\n{report}\n"
        f"OVERALL BINARY METRICS\n----------------------\n"
        f"Accuracy  : {acc:.4f}\n"
        f"Precision : {binary_precision:.4f}\n"
        f"Recall    : {binary_recall:.4f}\n"
        f"F1-score  : {binary_f1:.4f}\n\n"
        f"weighted avg : {f1_weighted:.4f}\n"
        f"macro avg    : {f1_macro:.4f}\n"
    )
    (model_dir / "classification_report_indobertweet.txt").write_text(report_text, encoding="utf-8")

    eval_info = (
        f"EVALUATION INFO — IndoBERTweet\n"
        f"==============================\n"
        f"Tanggal        : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"Test set       : {len(X_test):,} baris\n"
        f"Accuracy       : {acc:.4f}\n"
        f"Precision      : {binary_precision:.4f}\n"
        f"Recall         : {binary_recall:.4f}\n"
        f"F1-score       : {binary_f1:.4f}\n"
        f"Total runtime  : {eval_rt:.2f} detik\n"
    )
    (model_dir / "evaluation_info.txt").write_text(eval_info, encoding="utf-8")

    set_status(job_id, "Evaluasi selesai.", 80)
    return {
        "accuracy":    acc,
        "precision":   binary_precision,
        "recall":      binary_recall,
        "f1_score":    binary_f1,
        "f1_weighted": f1_weighted,
        "f1_macro":    f1_macro,
        "eval_rt":     eval_rt,
        "best_epoch":  best_epoch,
    }


def step_komparasi(
    period: str,
    metrics: dict,
    training_rt: float,
    root_path: str,
    job_id: str,
    set_status: Callable,
):
    set_status(job_id, "Komparasi: memperbarui tabel...", 83)

    komparasi_path = Path(root_path) / KOMPARASI_CSV
    komparasi_path.parent.mkdir(parents=True, exist_ok=True)

    if komparasi_path.exists():
        df_k = pd.read_csv(str(komparasi_path))
    else:
        df_k = pd.DataFrame(columns=[
            "period", "model", "accuracy", "f1_weighted", "f1_macro",
            "train_rt", "eval_rt", "total_rt", "period_label"
        ])

    total_rt = training_rt + metrics.get("eval_rt", 0)

    new_row = {
        "period":       period,
        "model":        "S1 DL",
        "accuracy":     round(metrics["accuracy"],    4),
        "f1_weighted":  round(metrics["f1_weighted"], 4),
        "f1_macro":     round(metrics["f1_macro"],    4),
        "train_rt":     round(training_rt,            2),
        "eval_rt":      round(metrics.get("eval_rt", 0), 2),
        "total_rt":     round(total_rt,               2),
        "period_label": PERIOD_LABELS.get(period, period),
    }

    mask = (df_k["period"] == period) & (df_k["model"] == "S1 DL")
    if mask.any():
        for col, val in new_row.items():
            df_k.loc[mask, col] = val
    else:
        df_k = pd.concat([df_k, pd.DataFrame([new_row])], ignore_index=True)

    df_k.to_csv(str(komparasi_path), index=False, encoding="utf-8-sig")
    set_status(job_id, "Komparasi selesai.", 87)


# ══════════════════════════════════════════════════════════════
#  STEP 5 — ANALISIS SENTIMEN & GABUNG DATA LAMA  (FIXED)
# ══════════════════════════════════════════════════════════════
def step_analisis(
    df_new: pd.DataFrame,
    period: str,
    model_dir: Path,
    le: LabelEncoder,
    root_path: str,
    job_id: str,
    set_status: Callable,
):
    set_status(job_id, "Analisis: prediksi sentimen data baru...", 90)

    # ── Load model & inferensi ────────────────────────────────
    device    = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tokenizer = AutoTokenizer.from_pretrained(str(model_dir / "tokenizer"))
    config    = AutoConfig.from_pretrained(str(model_dir), num_labels=len(le.classes_))
    model     = AutoModelForSequenceClassification.from_config(config)
    state     = torch.load(str(model_dir / "best_model.bin"), map_location=device)
    model.load_state_dict(state, strict=True)
    model.to(device)
    model.eval()

    texts    = df_new["tweet_preprocessed_dl"].tolist()
    infer_ds = InferDataset(texts, tokenizer, MAX_LENGTH)
    infer_dl = DataLoader(infer_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    all_preds = []
    with torch.no_grad():
        for batch in infer_dl:
            ids  = batch["input_ids"].to(device)
            mask = batch["attention_mask"].to(device)
            out  = model(input_ids=ids, attention_mask=mask)
            preds = torch.argmax(out.logits, dim=1)
            all_preds.extend(preds.cpu().numpy())

    df_new = df_new.copy()
    df_new["sentiment_predict_dl"] = le.inverse_transform(all_preds)

    # ── Bangun df_new_clean dengan kolom standar ──────────────
    # Kolom standar yang dibaca datasetController:
    #   date, tweet, sentiment, saham
    # Kolom ekstra yang disimpan: tweet_preprocessed_dl, sentiment_predict_dl

    # Deteksi kolom asli di df_new
    tweet_col = "tweet_original" if "tweet_original" in df_new.columns else next(
        (c for c in df_new.columns
         if "tweet" in c.lower() and c != "tweet_preprocessed_dl"), None
    )
    date_col  = next((c for c in df_new.columns if c in ("date", "tanggal")),  None)
    saham_col = next((c for c in df_new.columns if c in ("saham", "stock", "ticker")), None)

    df_new_clean = pd.DataFrame({
        "date"                  : df_new[date_col].values  if date_col  else [""] * len(df_new),
        "tweet"                 : df_new[tweet_col].values if tweet_col else [""] * len(df_new),
        # ── PENTING: kolom "sentiment" yang dibaca datasetController harus
        #    berisi hasil prediksi model DL (bukan label lexicon asli).
        #    DL hanya mengenal 2 kelas: positif / negatif.
        "sentiment"             : df_new["sentiment_predict_dl"].values,
        "saham"                 : df_new[saham_col].values if saham_col else [""] * len(df_new),
        "tweet_preprocessed_dl" : df_new["tweet_preprocessed_dl"].values,
        "sentiment_predict_dl"  : df_new["sentiment_predict_dl"].values,
        # simpan juga label asli lexicon sebagai referensi
        "sentiment_label_asli"  : df_new["sentiment"].values,
    })

    set_status(job_id, "Analisis: menggabungkan data lama + baru...", 94)

    # ── Load dataset lama ─────────────────────────────────────
    analisis_path = Path(root_path) / ANALISIS_FILES[period]
    analisis_path.parent.mkdir(parents=True, exist_ok=True)

    if analisis_path.exists():
        try:
            df_old = pd.read_csv(str(analisis_path), dtype=str, encoding="utf-8-sig").fillna("")
        except Exception:
            df_old = pd.read_csv(str(analisis_path), dtype=str, encoding="latin-1").fillna("")
        print(f"   OLD DATA : {len(df_old):,} baris  kolom: {list(df_old.columns)}")
    else:
        df_old = pd.DataFrame()
        print("   ℹ️  Dataset analisis lama belum ada, mulai dari nol.")

    print(f"   NEW DATA : {len(df_new_clean):,} baris")

    # ── Gabung: tambahkan HANYA tweet yang belum ada di data lama ──
    if len(df_old) > 0:
        # Pastikan df_old punya kolom tweet_preprocessed_dl dan sentiment_predict_dl
        for col in ["tweet_preprocessed_dl", "sentiment_predict_dl"]:
            if col not in df_old.columns:
                df_old[col] = ""

        # Deduplikasi berdasarkan kolom 'tweet' (teks asli)
        # Data lama DIPERTAHANKAN, data baru hanya ditambah jika belum ada
        if "tweet" in df_old.columns:
            existing = set(df_old["tweet"].str.strip().str.lower())
            mask_new = ~df_new_clean["tweet"].str.strip().str.lower().isin(existing)
            df_truly_new = df_new_clean[mask_new].copy()
        else:
            # Fallback: tidak bisa deduplikasi, tambahkan semua
            df_truly_new = df_new_clean.copy()

        print(f"   Tweet baru (belum ada di data lama): {len(df_truly_new):,}")
        df_combined = pd.concat([df_old, df_truly_new], ignore_index=True)
    else:
        df_combined = df_new_clean.copy()

    print(f"   TOTAL AKHIR : {len(df_combined):,} baris")

    df_combined.to_csv(str(analisis_path), index=False, encoding="utf-8-sig")
    print(f"   ✅ Analisis disimpan: {analisis_path.name} ({len(df_combined):,} baris total)")

    set_status(job_id, "Analisis selesai.", 98)


def run_full_pipeline(
    job_id: str,
    period: str,
    csv_path: str,
    root_path: str,
    set_status: Callable,
):
    try:
        total_start = time.time()

        df = step_preprocessing(csv_path, root_path, job_id, set_status)

        model_dir, le, split_data, training_rt = step_modelling(
            df, period, root_path, job_id, set_status
        )

        metrics = step_evaluasi(model_dir, le, split_data, job_id, set_status)

        step_komparasi(period, metrics, training_rt, root_path, job_id, set_status)

        step_analisis(df, period, model_dir, le, root_path, job_id, set_status)

        try:
            os.remove(csv_path)
        except OSError:
            pass

        total_rt = time.time() - total_start
        set_status(
            job_id,
            f"✅ Pipeline selesai dalam {total_rt:.1f} detik.",
            100,
            done=True,
        )

    except Exception as e:
        set_status(job_id, f"Error: {e}", 0, done=True, error=str(e))
        raise