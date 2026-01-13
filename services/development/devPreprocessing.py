# services/development/devPreprocessing.py
import pandas as pd
import re
import string
import stanza
import nltk
from bs4 import BeautifulSoup
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from nltk.corpus import stopwords
from tqdm import tqdm
from pathlib import Path

# =============================
# PATH CONFIGURATION (FIXED)
# =============================
BASE_DIR = Path(__file__).resolve().parents[2]   # root project
DATA_DIR = BASE_DIR / "data"

INPUT_FILE = DATA_DIR / "tweets_sahamAll.csv"
OUTPUT_FILE = DATA_DIR / "tweets_sahamAll_preprocessed.csv"
KAMUS_FILE = DATA_DIR / "kamuskatabaku.xlsx"

# =============================
# SETUP RESOURCE (sekali saja)
# =============================
nltk.download("stopwords")
stanza.download("id")

# =============================
# LOAD KAMUS KATA TIDAK BAKU
# =============================
kamus_df = pd.read_excel(KAMUS_FILE)
kamus_dict = dict(zip(kamus_df["tidak_baku"], kamus_df["kata_baku"]))
print("✅ Kamus kata tidak baku dimuat.")

# =============================
# NLP INITIALIZATION
# =============================
stop_words = set(stopwords.words("indonesian"))
stemmer = StemmerFactory().create_stemmer()

nlp = stanza.Pipeline(
    lang="id",
    processors="tokenize",
    tokenize_no_ssplit=True,
    verbose=False
)

print("✅ NLP pipeline siap.")

# =============================
# PREPROCESSING FUNCTION
# =============================
def preprocess_tweet(tweet):
    # 1. CASEFOLDING
    tweet = str(tweet).lower()

    # 2. TEXT CLEANING
    tweet = re.sub(r"https?://\s*\S+|www\.\s*\S+", "", tweet)           # remove URLs
    tweet = BeautifulSoup(tweet, "html.parser").get_text()              # remove HTML tags
    tweet = re.sub(r"@\w+", "", tweet)                                  # remove mentions
    tweet = re.sub(r"#\w+", "", tweet)                                  # remove hashtags
    tweet = re.sub(r"[^\x00-\x7F]+", " ", tweet)                        # remove non-ASCII characters
    tweet = re.sub(r"\d+", "", tweet)                                   # remove digits
    tweet = re.sub(rf"[{re.escape(string.punctuation)}]", "", tweet)    # remove punctuation
    tweet = re.sub(r"\s+", " ", tweet).strip()                          # remove extra whitespace

    # 3. TOKENIZATION + STOPWORD REMOVAL + STEMMING
    doc = nlp(tweet)
    tokens = []

    for sent in doc.sentences:
        for word in sent.words:
            token = word.text
            token = kamus_dict.get(token, token)            # normalisasi kata tidak baku
            token = stemmer.stem(token)                     # stemming
            if token not in stop_words and len(token) > 2:
                tokens.append(token)

    return " ".join(tokens)

# =============================
# LOAD DATASET
# =============================
df = pd.read_csv(INPUT_FILE)
print(f"✅ Dataset dimuat: {len(df)} tweet")

# =============================
# APPLY PREPROCESSING
# =============================
tqdm.pandas(desc="🔄 Preprocessing Tweet")
df["tweet_cleaned"] = df["tweet"].progress_apply(preprocess_tweet)

# =============================
# SAVE RESULT
# =============================
df.to_csv(OUTPUT_FILE, index=False)
print("✅ Preprocessing selesai.")
print(f"📁 File disimpan di: {OUTPUT_FILE}")
