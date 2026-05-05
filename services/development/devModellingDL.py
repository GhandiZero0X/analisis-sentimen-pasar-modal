# services/development/devModellingDL.py

import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
    EarlyStoppingCallback
)

import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

import torch
torch.backends.cudnn.benchmark = True

# PATH
BASE_DIR = Path(__file__).resolve().parents[2]

INPUT_DIR = BASE_DIR / "dev_database/3_preprocessing/dl"
OUTPUT_DIR = BASE_DIR / "dev_database/4_model/dl"

FILES = [
    "tweets_before_covid_labelling_preprocessingDL.csv",
    "tweets_covid_labelling_preprocessingDL.csv",
    "tweets_after_covid_labelling_preprocessingDL.csv",
    "tweets_all_periods_labelling_preprocessingDL.csv"
]

MODEL_NAME = "w11wo/indobertweet-base-sentiment-classifier-smsa"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# LOAD DATA
dfs = [pd.read_csv(INPUT_DIR / f) for f in FILES]
df = pd.concat(dfs, ignore_index=True)

df = df[df["sentiment"].isin(["positif", "negatif"])]

df["label"] = df["sentiment"].map({
    "negatif": 0,
    "positif": 1
})

texts = df["tweet_preprocessed_dl"].tolist()
labels = df["label"].tolist()

# SPLIT
X_train, X_temp, y_train, y_temp = train_test_split(
    texts, labels, test_size=0.2, stratify=labels, random_state=42
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42
)

print(f"Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")

# TOKENIZER
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

def tokenize(texts):
    return tokenizer(
        texts,
        padding=True,
        truncation=True,
        max_length=64   # 🔥 lebih ringan
    )

train_enc = tokenize(X_train)
val_enc   = tokenize(X_val)
test_enc  = tokenize(X_test)

# DATASET
class Dataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {k: torch.tensor(v[idx]) for k, v in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

train_dataset = Dataset(train_enc, y_train)
val_dataset   = Dataset(val_enc, y_val)
test_dataset  = Dataset(test_enc, y_test)

# MODEL
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=2
)

# METRICS
def compute_metrics(pred):
    logits, labels = pred
    preds = np.argmax(logits, axis=1)

    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average="binary"
    )
    acc = accuracy_score(labels, preds)

    return {
        "accuracy": acc,
        "f1": f1,
        "precision": precision,
        "recall": recall
    }

# TRAINING ARGS (OPTIMIZED)
training_args = TrainingArguments(
    output_dir=str(OUTPUT_DIR / "checkpoint"),
    learning_rate=2e-5,
    per_device_train_batch_size=4,  # 🔥 penting
    per_device_eval_batch_size=4,
    gradient_accumulation_steps=2,  # 🔥 simulate batch 8
    num_train_epochs=3,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    logging_dir=str(OUTPUT_DIR / "logs"),
    load_best_model_at_end=True,
    fp16=True,  # 🔥 wajib untuk RTX 3050
    save_total_limit=2
)

# TRAINER
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    tokenizer=tokenizer,
    compute_metrics=compute_metrics,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=2)]
)

print("🚀 Training IndoBERTweet (optimized)...")
trainer.train()

# EVALUATION
print("\n📊 TEST EVALUATION")
metrics = trainer.evaluate(test_dataset)
print(metrics)

# SAVE MODEL
model.save_pretrained(OUTPUT_DIR / "indobertweet_model")
tokenizer.save_pretrained(OUTPUT_DIR / "indobertweet_model")

print("💾 Model saved!")