# services/development/devModelling.py
import pandas as pd
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    roc_curve,
    auc
)

import matplotlib.pyplot as plt
import seaborn as sns

# PATH CONFIGURATION
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"

INPUT_FILE = DATA_DIR / "tweets_sahamAll_preprocessed.csv"
RAW_FILE = DATA_DIR / "tweets_sahamAll.csv"

MODEL_FILE = DATA_DIR / "svm_tfidf_model.joblib"
VECTORIZER_FILE = DATA_DIR / "tfidf_vectorizer.joblib"
OUTPUT_CLASSIFIED = DATA_DIR / "tweets_sahamAll_classified.csv"

# 1. LOAD DATASET
df = pd.read_csv(INPUT_FILE)
df_raw = pd.read_csv(RAW_FILE)

print(f"Jumlah data awal (sebelum filtering): {len(df_raw)}")

# Gunakan hanya sentimen positif dan negatif
df = df[df["sentiment_clean"].isin([1, -1])]
print(f"Jumlah data setelah filtering (positif & negatif): {len(df)}")

X = df["tweet_cleaned"]
y = df["sentiment_clean"]

# 2. TF-IDF VECTORIZATION
vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    max_features=10000,
    min_df=5,
    max_df=0.9
)

X_tfidf = vectorizer.fit_transform(X)

print("✅ TF-IDF vectorization selesai")
print("Jumlah fitur:", X_tfidf.shape[1])

# 3. TRAIN-TEST SPLIT (80% TRAIN - 20% TEST)
X_train, X_test, y_train, y_test = train_test_split(
    X_tfidf,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print(f"Jumlah data: train={X_train.shape[0]}, test={X_test.shape[0]}")

# 4. GRID SEARCH + TRAINING SVM LINEAR
param_grid = {
    "C": [0.01, 0.1, 1, 10]
}

svm = LinearSVC(
    class_weight="balanced",
    random_state=42
)

grid_search = GridSearchCV(
    estimator=svm,
    param_grid=param_grid,
    scoring="f1",
    cv=5,
    n_jobs=-1
)

print("🚀 Training SVM dengan Grid Search...")
grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_

print("✅ Grid Search selesai")
print("🔧 Parameter terbaik:", grid_search.best_params_)

# 5. EVALUASI DATA TEST
print("\n📊 [TEST SET EVALUATION]")

y_pred = best_model.predict(X_test)

print(classification_report(
    y_test,
    y_pred,
    target_names=["Negatif", "Positif"]
))

accuracy = accuracy_score(y_test, y_pred)
print("Akurasi Test:", accuracy)

# 6. CONFUSION MATRIX
cm = confusion_matrix(y_test, y_pred, labels=[1, -1])

plt.figure(figsize=(6, 5))
sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=["Positif", "Negatif"],
    yticklabels=["Positif", "Negatif"]
)

plt.xlabel("Prediksi")
plt.ylabel("Aktual")
plt.title("Confusion Matrix - Test Set")
plt.tight_layout()
plt.show()

# 7. AUC - ROC CURVE
# LinearSVC tidak punya predict_proba → gunakan decision_function
y_score = best_model.decision_function(X_test)

fpr, tpr, _ = roc_curve(y_test, y_score, pos_label=1)
roc_auc = auc(fpr, tpr)

plt.figure(figsize=(6, 5))
plt.plot(
    fpr, tpr,
    color="darkorange",
    lw=2,
    label=f"ROC curve (AUC = {roc_auc:.4f})"
)
plt.plot([0, 1], [0, 1], color="navy", lw=2, linestyle="--")
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel("False Positive Rate (FPR)")
plt.ylabel("True Positive Rate (TPR)")
plt.title("ROC Curve - SVM Linear")
plt.legend(loc="lower right")
plt.tight_layout()
plt.show()

print(f"📈 Nilai AUC-ROC: {roc_auc:.4f}")

# 8. SAVE MODEL & VECTORIZER
joblib.dump(best_model, MODEL_FILE)
joblib.dump(vectorizer, VECTORIZER_FILE)

print("💾 Model & vectorizer berhasil disimpan")
print("📦 Model:", MODEL_FILE)
print("📦 Vectorizer:", VECTORIZER_FILE)

# 9. SAVE HASIL KLASIFIKASI (UNTUK DASHBOARD)
df_result = df.copy()
df_result["sentiment"] = best_model.predict(X_tfidf)

df_result.to_csv(OUTPUT_CLASSIFIED, index=False)

print("📁 Dataset hasil klasifikasi disimpan di:")
print("   ", OUTPUT_CLASSIFIED)
