# controller/dashboardController.py
import os
import pandas as pd
from flask import render_template, request, current_app


# ── Helpers ────────────────────────────────────────────────────────────────────

def _data_path(*parts):
    """Build an absolute path relative to the app's data/ directory."""
    return os.path.join(current_app.root_path, "data", *parts)


def _read_csv_safe(path, **kwargs):
    """Read a CSV and return an empty DataFrame on any error."""
    try:
        return pd.read_csv(path, **kwargs)
    except Exception:
        return pd.DataFrame()


def _load_tweets(model: str, period: str) -> pd.DataFrame:
    """
    Load the labelled tweet CSV for the given model and period.
    model  : 'dl' | 'ml'
    period : 'before' | 'covid' | 'after' | 'all'
    """
    name_map = {
        "before": "tweets_before_labelling_analisis",
        "covid":  "tweets_covid_labelling_analisis",
        "after":  "tweets_after_labelling_analisis",
        "all":    "tweets_all_periods_labelling_analisis",
    }
    suffix = "DL" if model == "dl" else "ML"
    filename = f"{name_map[period]}{suffix}.csv"
    return _read_csv_safe(_data_path("csv", model, filename))


def _load_eval(model: str, period: str) -> dict:
    """
    Load evaluation_metrics.csv for the given model + period.
    Returns a dict with keys: accuracy, precision, recall, f1_score  (floats).
    """
    folder_map = {
        "before": "before",
        "covid":  "covid",
        "after":  "after",
        "all":    "all_periods",
    }
    model_dir = "modelDL" if model == "dl" else "modelML"
    path = _data_path(model_dir, folder_map[period], "evaluation_metrics.csv")
    df = _read_csv_safe(path)
    if df.empty:
        return {"accuracy": 0, "precision": 0, "recall": 0, "f1_score": 0}
    row = df.iloc[0]
    return {
        "accuracy":  float(row.get("accuracy",  0)),
        "precision": float(row.get("precision", 0)),
        "recall":    float(row.get("recall",    0)),
        "f1_score":  float(row.get("f1_score",  0)),
    }


# ── Main view ──────────────────────────────────────────────────────────────────

def dashboard_get():
    model  = request.args.get("model", "dl")   # 'dl' | 'ml'
    period = request.args.get("period", "all")  # 'before'|'covid'|'after'|'all'

    # ── 1. Tweet counts per period ─────────────────────────────────────────────
    tweet_counts = {}
    for p in ("before", "covid", "after", "all"):
        df = _load_tweets(model, p)
        tweet_counts[p] = len(df)

    # ── 2. Active period tweets for charts ────────────────────────────────────
    df_active = _load_tweets(model, period)

    # ── 3. Total unique saham ─────────────────────────────────────────────────
    total_saham = 0
    if not df_active.empty and "saham" in df_active.columns:
        # Combine all periods to get all known saham
        all_df = _load_tweets(model, "all")
        if not all_df.empty and "saham" in all_df.columns:
            total_saham = all_df["saham"].nunique()
        else:
            total_saham = df_active["saham"].nunique()

    # ── 4. Sentiment distribution (pie chart) ─────────────────────────────────
    # ML model has 3 classes (positif, negatif, netral); DL has 2 (positif, negatif)
    has_netral   = (model == "ml")
    dist_positif = 0
    dist_negatif = 0
    dist_netral  = 0
    if not df_active.empty and "sentiment" in df_active.columns:
        vc = df_active["sentiment"].str.lower().value_counts()
        dist_positif = int(vc.get("positif",  vc.get("positive", 0)))
        dist_negatif = int(vc.get("negatif",  vc.get("negative", 0)))
        dist_netral  = int(vc.get("netral",   vc.get("neutral",  0)))

    # ── 5. Statistik sentimen time-series (area chart) ────────────────────────
    #   Group by date → count per sentiment per day (up to last 30 days)
    chart_labels    = []
    chart_positif   = []
    chart_negatif   = []
    chart_netral    = []

    if not df_active.empty and "date" in df_active.columns and "sentiment" in df_active.columns:
        df_ts = df_active.copy()
        df_ts["date"] = pd.to_datetime(df_ts["date"], errors="coerce")
        df_ts = df_ts.dropna(subset=["date"])
        df_ts["date_only"] = df_ts["date"].dt.date

        grouped = (
            df_ts.groupby(["date_only", df_ts["sentiment"].str.lower()])
            .size()
            .unstack(fill_value=0)
        )

        def _col(name_id, name_en):
            """Get column values safely, trying Indonesian label first."""
            col = grouped.get(name_id, grouped.get(name_en, pd.Series(0, index=grouped.index)))
            return [int(col.get(d, 0)) for d in grouped.index]

        chart_labels  = [str(d) for d in grouped.index]
        chart_positif = _col("positif", "positive")
        chart_negatif = _col("negatif", "negative")
        chart_netral  = _col("netral",  "neutral")

    # ── 6. Evaluasi model — all 3 periods for radar chart ─────────────────────
    eval_periods = {}
    for p in ("before", "covid", "after"):
        eval_periods[p] = _load_eval(model, p)

    # Best accuracy across all periods for the selected model
    best_accuracy = max(
        _load_eval(model, p)["accuracy"]
        for p in ("before", "covid", "after", "all")
    )

    # ── 7. Admin accounts ─────────────────────────────────────────────────────
    users_df = _read_csv_safe(_data_path("users.csv"))
    accounts = []
    if not users_df.empty:
        for _, row in users_df.iterrows():
            raw_status = str(row.get("status_approval", "")).strip().lower()
            status_map = {"1": "active", "active": "active", "approved": "active",
                          "0": "pending", "pending": "pending"}
            status = status_map.get(raw_status, "pending")
            accounts.append({
                "id":     row.get("id", "-"),
                "name":   row.get("full_name", "-"),
                "email":  row.get("email", "-"),
                "role":   row.get("role", "-"),
                "status": status,
            })

    # ── Render ─────────────────────────────────────────────────────────────────
    return render_template(
        "pages/dashboard.html",
        active_menu="dashboard",
        active_page="dashboard",
        # filter state
        model=model,
        period=period,
        # cards
        total_saham=total_saham,
        total_tweet=tweet_counts.get(period, 0),
        tweet_counts=tweet_counts,
        best_accuracy=round(best_accuracy * 100, 2),
        # charts
        has_netral=has_netral,
        dist_positif=dist_positif,
        dist_negatif=dist_negatif,
        dist_netral=dist_netral,
        chart_labels=chart_labels,
        chart_positif=chart_positif,
        chart_negatif=chart_negatif,
        chart_netral=chart_netral,
        # radar
        eval_periods=eval_periods,
        # accounts
        accounts=accounts,
    )