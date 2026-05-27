# services/updateModelML.py
"""
Pipeline Update Model IndoBERTweet (production):
  1. Preprocessing   → 
     1. Casefolding
     2. Text Cleaning:
         i.   Hapus URL
         ii.  Hapus hashtag (#), cashtag ($), mention (@)
         iii. Hapus emoji dan emotikon
         iv.  Hapus angka yang tidak memiliki makna kontekstual
         v.   Hapus karakter selain alfabet
         vi.  Normalisasi singkatan & slang → kata baku (kamus)
     3. Tokenization  (Stanza)
     4. Stopword Removal (NLTK)
     5. Stemming (Sastrawi)
  2. Modelling       → load model .joblib yang ada, fine-tune dengan data baru, simpan degan Label NEGATIF, NETRAL, POSITIF semuanya dipakai
  3. Evaluasi        → confusion matrix, metrics CSV, training curve, classification report
  4. Komparasi       → update tabel_komparasi.csv
  5. Analisis        → prediksi sentimen data baru, gabung dengan data lama
"""