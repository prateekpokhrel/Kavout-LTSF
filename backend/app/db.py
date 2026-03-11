"""
db.py
-----
Supabase client + all DB helper functions used across the backend.
"""

import os
from datetime import datetime, timezone
from typing import Any

# ── Hardcoded credentials ────────────────────────────────────
os.environ.setdefault("SUPABASE_URL", "https://xrfmeowymskllhplqujq.supabase.co")
os.environ.setdefault("SUPABASE_KEY", (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZm1lb3d5bXNrbGxocGxxdWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjk4MzcsImV4cCI6MjA4NzYwNTgzN30"
    ".DufBJbWc8Xla7Rs0sj2jiRp0uEimoUzu1AyoDuSr_9k"
))

from supabase import Client, create_client

# ---------------------------------------------------------------------------
# Client singleton
# ---------------------------------------------------------------------------

_client: Client | None = None


def get_db() -> Client:
    """Return (and lazily create) the Supabase client."""
    global _client
    if _client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_KEY"]
        _client = create_client(url, key)
    return _client


# ---------------------------------------------------------------------------
# stocks
# ---------------------------------------------------------------------------

def upsert_stock(ticker: str, full_name: str | None = None, exchange: str = "NSE") -> None:
    db = get_db()
    db.table("stocks").upsert(
        {"ticker": ticker, "full_name": full_name, "exchange": exchange},
        on_conflict="ticker",
    ).execute()


def get_all_stocks() -> list[dict]:
    db = get_db()
    res = db.table("stocks").select("*").order("ticker").execute()
    return res.data or []


# ---------------------------------------------------------------------------
# price_data
# ---------------------------------------------------------------------------

def upsert_price_rows(rows: list[dict]) -> None:
    if not rows:
        return
    db = get_db()
    db.table("price_data").upsert(rows, on_conflict="ticker,date").execute()


def get_price_history(ticker: str, limit: int = 500) -> list[dict]:
    db = get_db()
    res = (
        db.table("price_data")
        .select("date, open, high, low, close, volume")
        .eq("ticker", ticker)
        .order("date", desc=True)
        .limit(limit)
        .execute()
    )
    return res.data or []


# ---------------------------------------------------------------------------
# model_artifacts
# ---------------------------------------------------------------------------

def save_model_artifact(train_response: dict) -> int:
    db = get_db()
    row = {
        "ticker":             train_response["ticker"],
        "artifact_path":      train_response["artifact_path"],
        "data_source":        train_response.get("source", "auto"),
        "transform":          train_response.get("transform"),
        "input_len":          train_response["input_len"],
        "pred_len":           train_response["pred_len"],
        "train_samples":      train_response.get("train_samples"),
        "val_samples":        train_response.get("val_samples"),
        "train_loss":         train_response.get("train_loss"),
        "val_loss":           train_response.get("val_loss"),
        "val_rmse":           train_response.get("val_rmse"),
        "direction_accuracy": train_response.get("direction_accuracy"),
        "trained_at_utc":     train_response.get(
            "trained_at_utc",
            datetime.now(timezone.utc).isoformat(),
        ),
    }
    res = db.table("model_artifacts").insert(row).execute()
    return res.data[0]["id"]


def get_latest_model(ticker: str) -> dict | None:
    db = get_db()
    res = (
        db.table("model_artifacts")
        .select("*")
        .eq("ticker", ticker)
        .order("trained_at_utc", desc=True)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def list_models(ticker: str | None = None) -> list[dict]:
    db = get_db()
    q = db.table("model_artifacts").select("*").order("trained_at_utc", desc=True)
    if ticker:
        q = q.eq("ticker", ticker)
    return q.execute().data or []


# ---------------------------------------------------------------------------
# predictions
# ---------------------------------------------------------------------------

def save_predictions(model_id: int, ticker: str, forecast_points: list[dict], horizon_days: int | None = None) -> None:
    if not forecast_points:
        return
    db = get_db()
    rows = [
        {
            "model_id":        model_id,
            "ticker":          ticker,
            "predicted_date":  pt["date"],
            "predicted_close": pt["value"],
            "horizon_days":    horizon_days,
        }
        for pt in forecast_points
    ]
    db.table("predictions").upsert(rows, on_conflict="model_id,predicted_date").execute()


def update_actual_close(ticker: str, date: str, actual_close: float) -> None:
    db = get_db()
    db.table("predictions").update({"actual_close": actual_close}).eq("ticker", ticker).eq("predicted_date", date).execute()


def get_predictions(ticker: str, limit: int = 120) -> list[dict]:
    db = get_db()
    res = (
        db.table("predictions")
        .select("*")
        .eq("ticker", ticker)
        .order("predicted_date", desc=True)
        .limit(limit)
        .execute()
    )
    return res.data or []


# ---------------------------------------------------------------------------
# forecast_results
# ---------------------------------------------------------------------------

def save_forecast_result(forecast_response: dict) -> int:
    db = get_db()
    row = {
        "ticker":               forecast_response["ticker"],
        "horizon":              forecast_response["horizon"],
        "granularity":          forecast_response.get("granularity"),
        "data_source":          forecast_response.get("source", "auto"),
        "last_close":           forecast_response.get("last_close"),
        "projected_close":      forecast_response.get("projected_close"),
        "projected_change_pct": forecast_response.get("projected_change_pct"),
        "stack_weights":        forecast_response.get("stack_weights"),
        "model_mse":            forecast_response.get("model_mse"),
        "forecast_points":      forecast_response.get("forecast"),
        "history_points":       forecast_response.get("history"),
    }
    res = db.table("forecast_results").insert(row).execute()
    return res.data[0]["id"]


def get_latest_forecast(ticker: str, horizon: str) -> dict | None:
    db = get_db()
    res = (
        db.table("forecast_results")
        .select("*")
        .eq("ticker", ticker)
        .eq("horizon", horizon)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


# ---------------------------------------------------------------------------
# train_requests
# ---------------------------------------------------------------------------

def create_train_request(req_dict: dict) -> int:
    db = get_db()
    row = {
        "ticker":        req_dict.get("ticker"),
        "period":        req_dict.get("period"),
        "input_len":     req_dict.get("input_len"),
        "pred_len":      req_dict.get("pred_len"),
        "epochs":        req_dict.get("epochs"),
        "batch_size":    req_dict.get("batch_size"),
        "learning_rate": req_dict.get("learning_rate"),
        "data_source":   req_dict.get("data_source"),
        "status":        "pending",
    }
    res = db.table("train_requests").insert(row).execute()
    return res.data[0]["id"]


def update_train_request(job_id: int, status: str, model_id: int | None = None, error: str | None = None) -> None:
    db = get_db()
    patch: dict[str, Any] = {"status": status}
    if model_id is not None:
        patch["model_id"] = model_id
    if error is not None:
        patch["error_message"] = error
    if status in ("done", "failed"):
        patch["finished_at"] = datetime.now(timezone.utc).isoformat()
    db.table("train_requests").update(patch).eq("id", job_id).execute()


def get_train_requests(ticker: str | None = None, status: str | None = None) -> list[dict]:
    db = get_db()
    q = db.table("train_requests").select("*").order("created_at", desc=True)
    if ticker:
        q = q.eq("ticker", ticker)
    if status:
        q = q.eq("status", status)
    return q.execute().data or []