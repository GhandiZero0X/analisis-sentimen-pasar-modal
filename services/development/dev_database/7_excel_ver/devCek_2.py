import pandas as pd

df_lex = pd.read_csv("tweets_after_covid_labellingLexicon.csv", dtype=str).fillna("")
df_exp = pd.read_csv("tweets_after_covid_labellingExpert.csv",  dtype=str).fillna("")

def norm(s):
    return s.astype(str).str.strip().str.replace(r"\s+", " ", regex=True).str.lower()

df_lex["tweet_norm"] = norm(df_lex["tweet"])
df_exp["tweet_norm"] = norm(df_exp["tweet"])

# Cek berapa banyak duplikat tweet di masing-masing file
print(f"Duplikat di expert  : {df_exp.duplicated(subset=['tweet_norm']).sum():,}")
print(f"Duplikat di lexicon : {df_lex.duplicated(subset=['tweet_norm']).sum():,}")