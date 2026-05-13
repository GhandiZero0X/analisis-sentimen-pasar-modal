import pandas as pd
import re
from pathlib import Path
from collections import Counter
import json
import math

# =============================
# CONFIG
# =============================
BASE_DIR = Path(__file__).resolve().parents[2]

INPUT_FILE = BASE_DIR / "services/development/dev_database/1_raw/tweets_all_periods.csv"
OUTPUT_DIR = BASE_DIR / "services/development/kamus/lexicon_kamus_s2"

POS_LEXICON_FILE = OUTPUT_DIR / "positive_lexicon.csv"
NEG_LEXICON_FILE = OUTPUT_DIR / "negative_lexicon.csv"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TOP_K_POS = 3000
TOP_K_NEG = 3000
MIN_FREQ = 5

POS_THRESHOLD = 0.5
NEG_THRESHOLD = -0.2

POS_DOMINANCE = 0.65
NEG_DOMINANCE = 0.5

MAX_GLOBAL_RATIO = 0.9

# =============================
# STOPWORDS
# =============================
STOPWORDS = set([
    "yang","dan","di","ke","dari","untuk","pada","ini","itu","dengan",
    "karena","atau","juga","sudah","belum","akan","lagi","bisa","jadi",
    "saja","masih","harus",
    "aja","nih","sih","dong","lah","kan","nya","ya","gitu",
    "kalo","kalau","ga","gak","nggak","tidak","iya",
    "wkwk","haha","hehe","lol","anjir","anjay",
    "gue","aku","saya","kita","kamu","dia",
    "saham","bbri","bbca","bmri","bank","ihsg","lot","rp",
    "market","harga","hari","tahun","bulan","minggu"
])

# =============================
# CLEAN TEXT
# =============================
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'(https?:\/\/\s+)', 'https://', text)
    text = re.sub(
        r'((?:https?:\/\/|www\.|bit\.ly\/|t\.co\/)[^\s]+(?:\s+[^\s]+)*)',
        lambda m: m.group(0).replace(" ", ""),
        text
    )
    text = re.sub(r'https?:\/\/\S+|www\.\S+', ' ', text)
    text = re.sub(r'@\w+|#\w+', ' ', text)
    text = re.sub(r'\d+', ' ', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'(.)\1{2,}', r'\1\1', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# =============================
# VALID WORD FILTER
# =============================
def is_valid_word(word):
    return len(word) >= 3 and word.isalpha()

# =============================
# TOKENIZE
# =============================
def tokenize(text):
    return [
        w for w in text.split()
        if w not in STOPWORDS and is_valid_word(w)
    ]

# =============================
# LOAD LEXICON
# =============================
pos_lexicon = set()
neg_lexicon = set()

if POS_LEXICON_FILE.exists():
    pos_lexicon = set(
        pd.read_csv(POS_LEXICON_FILE)["word"]
        .dropna()
        .astype(str)
        .str.lower()
        .str.strip()
    )

if NEG_LEXICON_FILE.exists():
    neg_lexicon = set(
        pd.read_csv(NEG_LEXICON_FILE)["word"]
        .dropna()
        .astype(str)
        .str.lower()
        .str.strip()
    )

print(f"📘 Positive lexicon loaded: {len(pos_lexicon)}")
print(f"📕 Negative lexicon loaded: {len(neg_lexicon)}")

# =============================
# RELABEL NETRAL
# =============================
def relabel_neutral_by_lexicon(tweet, tie_break="positif"):
    tokens = tokenize(clean_text(tweet))

    pos_score = sum(1 for t in tokens if t in pos_lexicon)
    neg_score = sum(1 for t in tokens if t in neg_lexicon)

    if pos_score > neg_score:
        return "positif"
    elif neg_score > pos_score:
        return "negatif"
    else:
        return tie_break

# =============================
# LOAD DATA
# =============================
df = pd.read_csv(INPUT_FILE)

df["sentiment"] = df["sentiment"].astype(str).str.lower().str.strip()

# Scenario 2:
# - positif tetap positif
# - negatif tetap negatif
# - netral direlabel jadi positif/negatif
df.loc[df["sentiment"] == "netral", "sentiment"] = (
    df.loc[df["sentiment"] == "netral", "tweet"]
      .apply(relabel_neutral_by_lexicon)
)

# ambil hanya 2 kelas final
df = df[df["sentiment"].isin(["positif", "negatif"])]

print(f"📊 Total data valid setelah relabel netral: {len(df)}")

# =============================
# COUNT WORDS
# =============================
pos_counter = Counter()
neg_counter = Counter()

for _, row in df.iterrows():
    text = clean_text(row["tweet"])
    tokens = tokenize(text)

    if row["sentiment"] == "positif":
        pos_counter.update(tokens)
    else:
        neg_counter.update(tokens)

print("✅ Counting selesai")

# =============================
# LOG RATIO
# =============================
vocab = set(pos_counter.keys()).union(set(neg_counter.keys()))
lexicon_scores = []

for word in vocab:
    pos_freq = pos_counter[word]
    neg_freq = neg_counter[word]

    if (pos_freq + neg_freq) < MIN_FREQ:
        continue

    pos_freq += 1
    neg_freq += 1

    score = math.log(pos_freq / neg_freq)
    lexicon_scores.append((word, score, pos_freq, neg_freq))

# =============================
# REMOVE COMMON WORDS
# =============================
filtered_scores = []

for word, score, pos_f, neg_f in lexicon_scores:
    total = pos_f + neg_f
    if max(pos_f, neg_f) / total > MAX_GLOBAL_RATIO:
        continue
    filtered_scores.append((word, score, pos_f, neg_f))

lexicon_scores = filtered_scores

# =============================
# SORT
# =============================
lexicon_scores.sort(key=lambda x: x[1], reverse=True)

# =============================
# MAIN FILTER
# =============================
positive_words = []
negative_words = []

for word, score, pos_f, neg_f in lexicon_scores:
    total = pos_f + neg_f
    pos_ratio = pos_f / total
    neg_ratio = neg_f / total

    if score > POS_THRESHOLD and pos_ratio > POS_DOMINANCE:
        positive_words.append(word)
    elif score < NEG_THRESHOLD and neg_ratio > NEG_DOMINANCE:
        negative_words.append(word)

# =============================
# FALLBACK NEGATIVE
# =============================
if len(negative_words) < TOP_K_NEG:
    print(f"⚠️ Negative kurang ({len(negative_words)}), auto extend...")
    extra_neg = [
        w for w, s, _, _ in reversed(lexicon_scores)
        if w not in negative_words
    ]
    negative_words.extend(extra_neg[:TOP_K_NEG - len(negative_words)])

# =============================
# CLEAN FINAL WORD
# =============================
def is_good_word(word):
    return len(word) >= 3 and not word.isnumeric()

positive_words = [w for w in positive_words if is_good_word(w)]
negative_words = [w for w in negative_words if is_good_word(w)]

positive_words = positive_words[:TOP_K_POS]
negative_words = negative_words[:TOP_K_NEG]

print(f"✅ Final Positive: {len(positive_words)}")
print(f"✅ Final Negative: {len(negative_words)}")

# =============================
# SAVE
# =============================
pd.DataFrame(positive_words, columns=["word"]).to_csv(
    OUTPUT_DIR / "positive_lexicon.csv", index=False
)

pd.DataFrame(negative_words, columns=["word"]).to_csv(
    OUTPUT_DIR / "negative_lexicon.csv", index=False
)

with open(OUTPUT_DIR / "lexicon.json", "w", encoding="utf-8") as f:
    json.dump(
        {"positive": positive_words, "negative": negative_words},
        f, ensure_ascii=False, indent=2
    )

pd.DataFrame(
    lexicon_scores,
    columns=["word", "score", "pos_freq", "neg_freq"]
).to_csv(OUTPUT_DIR / "lexicon_full_scores.csv", index=False)

print("\n🎯 DONE: Scenario 2 lexicon relabeling finished!")