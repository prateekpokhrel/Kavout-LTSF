import os
import sys

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# Fix imports for both script mode and package mode
if __name__ == "__main__":
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from .data import list_available_symbols
    from .db import (
        create_train_request,
        get_latest_forecast,
        get_latest_model,
        save_forecast_result,
        save_model_artifact,
        save_predictions,
        update_train_request,
        upsert_stock,
    )
    from .forecasting import run_stacked_forecast
    from .inference import get_history_for_ticker, predict_with_saved_model
    from .schemas import (
        DataSource,
        ForecastRequest,
        ForecastResponse,
        HistoryResponse,
        PredictRequest,
        PredictResponse,
        SymbolsResponse,
        TrainRequest,
        TrainResponse,
    )
    from .trainer import train_and_save_model

except ImportError:
    from data import list_available_symbols
    from db import (
        create_train_request,
        get_latest_forecast,
        get_latest_model,
        save_forecast_result,
        save_model_artifact,
        save_predictions,
        update_train_request,
        upsert_stock,
    )
    from forecasting import run_stacked_forecast
    from inference import get_history_for_ticker, predict_with_saved_model
    from schemas import (
        DataSource,
        ForecastRequest,
        ForecastResponse,
        HistoryResponse,
        PredictRequest,
        PredictResponse,
        SymbolsResponse,
        TrainRequest,
        TrainResponse,
    )
    from trainer import train_and_save_model


app = FastAPI(
    title="Indian Stock DLinear API",
    version="3.0.0",
    description="Stacked forecasting API for 1d/15d/30d horizons with 5-model multivariate ensemble.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── helpers ─────────────────────────────────────────────────────────────────

def _db_available() -> bool:
    """Return True only when Supabase env vars are configured."""
    return bool(os.environ.get("SUPABASE_URL") and os.environ.get("SUPABASE_KEY"))


# ── routes ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "db": "connected" if _db_available() else "not configured"}


@app.get("/api/symbols", response_model=SymbolsResponse)
def symbols_endpoint(
    data_source: DataSource = Query(default="auto"),
    local_data_dir: str | None = Query(default=None),
) -> SymbolsResponse:

    if data_source == "yfinance":
        return SymbolsResponse(source="yfinance", symbols=[])

    symbols = list_available_symbols(local_data_dir=local_data_dir)
    return SymbolsResponse(source="local", symbols=symbols)


@app.get("/api/history", response_model=HistoryResponse)
def history_endpoint(
    ticker: str = Query(...),
    history_points: int = Query(default=120, ge=20, le=500),
    period: str = Query(default="5y"),
    data_source: DataSource = Query(default="auto"),
    local_data_dir: str | None = Query(default=None),
) -> HistoryResponse:

    try:
        result = get_history_for_ticker(
            raw_ticker=ticker,
            history_points=history_points,
            data_source=data_source,
            local_data_dir=local_data_dir,
            period=period,
        )
        return HistoryResponse(**result)

    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"History failed: {exc}")


@app.post("/api/forecast", response_model=ForecastResponse)
def forecast_endpoint(req: ForecastRequest) -> ForecastResponse:

    try:
        result = run_stacked_forecast(
            raw_ticker=req.ticker,
            horizon=req.horizon,
            data_source=req.data_source,
            local_data_dir=req.local_data_dir,
        )

        # ── Persist to Supabase ──────────────────────────────
        if _db_available():
            try:
                upsert_stock(result["ticker"])
                save_forecast_result(result)
            except Exception as db_err:
                print(f"[DB] forecast save failed: {db_err}")
        # ────────────────────────────────────────────────────

        return ForecastResponse(**result)

    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Forecast failed: {exc}")


@app.post("/api/train", response_model=TrainResponse)
def train_endpoint(req: TrainRequest) -> TrainResponse:

    job_id: int | None = None

    # ── Log job start ────────────────────────────────────────
    if _db_available():
        try:
            upsert_stock(req.ticker)
            job_id = create_train_request(req.model_dump())
            update_train_request(job_id, "running")
        except Exception as db_err:
            print(f"[DB] train request log failed: {db_err}")
    # ────────────────────────────────────────────────────────

    try:
        result = train_and_save_model(req)

        # ── Persist model metadata ───────────────────────────
        if _db_available():
            try:
                model_id = save_model_artifact(result)
                if job_id is not None:
                    update_train_request(job_id, "done", model_id=model_id)
            except Exception as db_err:
                print(f"[DB] model artifact save failed: {db_err}")
        # ────────────────────────────────────────────────────

        return TrainResponse(**result)

    except FileNotFoundError as exc:
        if _db_available() and job_id:
            try:
                update_train_request(job_id, "failed", error=str(exc))
            except Exception:
                pass
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        if _db_available() and job_id:
            try:
                update_train_request(job_id, "failed", error=str(exc))
            except Exception:
                pass
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        if _db_available() and job_id:
            try:
                update_train_request(job_id, "failed", error=str(exc))
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=f"Training failed: {exc}")


@app.post("/api/predict", response_model=PredictResponse)
def predict_endpoint(req: PredictRequest) -> PredictResponse:

    try:
        result = predict_with_saved_model(
            raw_ticker=req.ticker,
            horizon=req.horizon,
            history_points=req.history_points,
            data_source=req.data_source,
            local_data_dir=req.local_data_dir,
        )

        # ── Persist predictions ──────────────────────────────
        if _db_available():
            try:
                upsert_stock(result["ticker"])
                latest_model = get_latest_model(result["ticker"])
                if latest_model:
                    save_predictions(
                        model_id=latest_model["id"],
                        ticker=result["ticker"],
                        forecast_points=result.get("forecast", []),
                        horizon_days=req.horizon,
                    )
            except Exception as db_err:
                print(f"[DB] prediction save failed: {db_err}")
        # ────────────────────────────────────────────────────

        return PredictResponse(**result)

    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)