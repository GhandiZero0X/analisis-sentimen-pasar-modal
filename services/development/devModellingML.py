# services/development/devModellingML.py
import pandas as pd
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, roc_curve, auc

import matplotlib.pyplot as plt
import seaborn as sns

# PATH
BASE_DIR = Path(__file__).resolve().parents[2]

INPUT_DIR = BASE_DIR / "dev_database/3_preprocessing/ml"
OUTPUT_DIR = BASE_DIR / "dev_database/4_model/ml"

FILES = [
    "tweets_before_covid_labelling_preprocessingML.csv",
    "tweets_covid_labelling_preprocessingML.csv",
    "tweets_after_covid_labelling_preprocessingML.csv",
    "tweets_all_periods_labelling_preprocessingML.csv"
]

MODEL_FILE = OUTPUT_DIR / "svm_tfidf_model.joblib"
VECTORIZER_FILE = OUTPUT_DIR / "tfidf_vectorizer.joblib"

# ─────────────────────────────────────────────

# 1. LOAD & GABUNG DATA
dfs = []

for file in FILES:
    path = INPUT_DIR / file
    df = pd.read_csv(path)
    dfs.append(df)

df = pd.concat(dfs, ignore_index=True)

print("Total data:", len(df))

# 🔥 filter hanya positif & negatif
df = df[df["sentiment"].isin(["positif", "negatif"])]

# encode label
df["label"] = df["sentiment"].map({
    "positif": 1,
    "negatif": -1
})

X = df["tweet_preprocessed"]
y = df["label"]

# ─────────────────────────────────────────────
# 2. TF-IDF
vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    max_features=10000,
    min_df=5,
    max_df=0.9
)

X_tfidf = vectorizer.fit_transform(X)

# ─────────────────────────────────────────────
# 3. SPLIT
X_train, X_test, y_train, y_test = train_test_split(
    X_tfidf,
    y,
    test_size=0.2,
    random_state=0,
    stratify=y
)

# ─────────────────────────────────────────────
# 4. MODELING + GRID SEARCH
param_grid = {"C": [0.01, 0.1, 1, 10]}

svm = LinearSVC(
    class_weight="balanced",
    random_state=0
)

grid = GridSearchCV(
    svm,
    param_grid,
    scoring="f1",
    cv=5,
    n_jobs=-1
)

print("🚀 Training...")
grid.fit(X_train, y_train)

model = grid.best_estimator_

print("Best param:", grid.best_params_)

# ─────────────────────────────────────────────
# 5. EVALUATION
y_pred = model.predict(X_test)

print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))

accuracy = accuracy_score(y_test, y_pred)
print("Accuracy:", accuracy)

# CONFUSION MATRIX
cm = confusion_matrix(y_test, y_pred, labels=[1, -1])

sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
plt.title("Confusion Matrix")
plt.show()

# ROC
y_score = model.decision_function(X_test)

fpr, tpr, _ = roc_curve(y_test, y_score, pos_label=1)
roc_auc = auc(fpr, tpr)

plt.plot(fpr, tpr, label=f"AUC={roc_auc:.4f}")
plt.legend()
plt.title("ROC Curve")
plt.show()

print("AUC:", roc_auc)

# ─────────────────────────────────────────────
# 6. SAVE MODEL
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

joblib.dump(model, MODEL_FILE)
joblib.dump(vectorizer, VECTORIZER_FILE)

print("Model saved!")
