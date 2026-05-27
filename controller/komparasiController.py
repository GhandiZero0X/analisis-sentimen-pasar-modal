# controller/komparasiController.py
import os
import pandas as pd
from flask import render_template, current_app


def _data_path(*parts):
    return os.path.join(current_app.root_path, "data", *parts)


def _read_csv_safe(path, **kwargs):
    try:
        return pd.read_csv(path, **kwargs)
    except Exception:
        return pd.DataFrame()


def komparasi_get():
    df = _read_csv_safe(_data_path("komparasi", "tabel_komparasi.csv"))

    rows       = []
    chart_data = {
        "labels":   [],          # periode unik
        "dl_acc":   [],
        "ml_acc":   [],
        "dl_rt":    [],
        "ml_rt":    [],
    }

    # Peta model string → label tampilan & kategori
    MODEL_LABEL = {"S1 DL": "IndoBERTweet", "S3 ML": "SVM"}
    MODEL_TYPE  = {"S1 DL": "dl",           "S3 ML": "ml"}

    # Urutan periode yang diinginkan
    PERIOD_ORDER = ["before", "covid", "after", "all_periods"]

    if not df.empty:
        # Pastikan kolom numerik
        num_cols = ["accuracy", "f1_weighted", "f1_macro", "train_rt", "eval_rt", "total_rt"]
        for col in num_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        # Urutkan sesuai PERIOD_ORDER
        df["_order"] = df["period"].map(
            {p: i for i, p in enumerate(PERIOD_ORDER)}
        ).fillna(99)
        df = df.sort_values(["_order", "model"]).reset_index(drop=True)

        # Baris tabel
        for _, r in df.iterrows():
            rows.append({
                "period_label": r.get("period_label", r.get("period", "-")),
                "model_raw":    r.get("model", "-"),
                "model_label":  MODEL_LABEL.get(r.get("model", ""), r.get("model", "-")),
                "model_type":   MODEL_TYPE.get(r.get("model", ""), "dl"),
                "accuracy":     round(float(r["accuracy"])  * 100, 2),
                "f1_weighted":  round(float(r["f1_weighted"]) * 100, 2),
                "f1_macro":     round(float(r["f1_macro"])  * 100, 2),
                "train_rt":     round(float(r["train_rt"]), 2),
                "eval_rt":      round(float(r["eval_rt"]),  2),
                "total_rt":     round(float(r["total_rt"]), 2),
            })

        # Data grafik — kumpulkan per periode unik
        seen_labels = []
        dl_acc, ml_acc, dl_rt, ml_rt = [], [], [], []

        for period in PERIOD_ORDER:
            sub = df[df["period"] == period]
            if sub.empty:
                continue

            label = sub.iloc[0].get("period_label", period)
            seen_labels.append(label)

            dl_row = sub[sub["model"] == "S1 DL"]
            ml_row = sub[sub["model"] == "S3 ML"]

            dl_acc.append(round(float(dl_row["accuracy"].values[0]) * 100, 2) if not dl_row.empty else 0)
            ml_acc.append(round(float(ml_row["accuracy"].values[0]) * 100, 2) if not ml_row.empty else 0)
            dl_rt.append( round(float(dl_row["total_rt"].values[0]),  2)      if not dl_row.empty else 0)
            ml_rt.append( round(float(ml_row["total_rt"].values[0]),  2)      if not ml_row.empty else 0)

        chart_data = {
            "labels": seen_labels,
            "dl_acc": dl_acc,
            "ml_acc": ml_acc,
            "dl_rt":  dl_rt,
            "ml_rt":  ml_rt,
        }

    # ── Summary cards ──────────────────────────────────────────────────────────
    # Model paling akurat (rata-rata accuracy terbaik)
    best_acc_model  = "-"
    best_acc_value  = 0.0
    fastest_model   = "-"
    fastest_rt      = 0.0

    if rows:
        from collections import defaultdict
        acc_sums  = defaultdict(list)
        rt_sums   = defaultdict(list)
        for r in rows:
            acc_sums[r["model_label"]].append(r["accuracy"])
            rt_sums [r["model_label"]].append(r["total_rt"])

        avg_acc = {m: sum(v) / len(v) for m, v in acc_sums.items()}
        avg_rt  = {m: sum(v) / len(v) for m, v in rt_sums.items()}

        best_acc_model = max(avg_acc, key=avg_acc.get)
        best_acc_value = round(avg_acc[best_acc_model], 2)
        fastest_model  = min(avg_rt,  key=avg_rt.get)
        fastest_rt     = round(avg_rt[fastest_model], 2)

    return render_template(
        "pages/comparison-model.html",
        active_menu="komparasi",
        active_page="komparasi",
        rows=rows,
        chart_data=chart_data,
        best_acc_model=best_acc_model,
        best_acc_value=best_acc_value,
        fastest_model=fastest_model,
        fastest_rt=fastest_rt,
    )