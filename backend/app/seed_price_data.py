"""
seed_price_data.py
------------------
One-time script to bulk-import all local CSV files into the
price_data table in Supabase.

Usage:
    cd backend/app
    python seed_price_data.py
"""

import os
import sys
from pathlib import Path

import pandas as pd

# ── Supabase credentials (hardcoded) ────────────────────────
os.environ["SUPABASE_URL"] = "https://xrfmeowymskllhplqujq.supabase.co"
os.environ["SUPABASE_KEY"] = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZm1lb3d5bXNrbGxocGxxdWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjk4MzcsImV4cCI6MjA4NzYwNTgzN30"
    ".DufBJbWc8Xla7Rs0sj2jiRp0uEimoUzu1AyoDuSr_9k"
)

# Allow running from backend/app/ directly
sys.path.insert(0, str(Path(__file__).resolve().parent))

from db import upsert_price_rows, upsert_stock  # noqa: E402

# data/ folder is one level up from app/
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CHUNK_SIZE = 500  # rows per upsert batch


def parse_csv(path: Path) -> pd.DataFrame | None:
    """Parse the project's multi-header CSV format."""
    try:
        df = pd.read_csv(path, header=[0, 1], index_col=0)
        df.index = pd.to_datetime(df.index, errors="coerce")
        df = df[df.index.notna()]
        df.columns = [str(c[0]).strip().lower() for c in df.columns]
        df = df[~df.index.astype(str).str.lower().isin(["ticker", "price"])]
        return df
    except Exception as e:
        print(f"  [WARN] Could not parse {path.name}: {e}")
        return None


def rows_from_df(ticker: str, df: pd.DataFrame) -> list[dict]:
    rows = []
    for date, row in df.iterrows():
        try:
            rows.append({
                "ticker": ticker,
                "date":   str(date.date()),
                "open":   float(row["open"])   if pd.notna(row.get("open"))   else None,
                "high":   float(row["high"])   if pd.notna(row.get("high"))   else None,
                "low":    float(row["low"])    if pd.notna(row.get("low"))    else None,
                "close":  float(row["close"]),
                "volume": int(float(row["volume"])) if pd.notna(row.get("volume")) else None,
                "source": "local",
            })
        except Exception:
            continue
    return rows


def seed():
    if not DATA_DIR.exists():
        print(f"ERROR: data folder not found at {DATA_DIR}")
        sys.exit(1)

    csv_files = sorted(DATA_DIR.glob("*.csv"))
    if not csv_files:
        print(f"No CSV files found in {DATA_DIR}")
        return

    print(f"Found {len(csv_files)} CSV files in {DATA_DIR}\n")

    for csv_path in csv_files:
        ticker = csv_path.stem.upper()
        print(f"Processing {ticker} ...", end=" ", flush=True)

        df = parse_csv(csv_path)
        if df is None or df.empty:
            print("skipped (empty/unparseable)")
            continue

        upsert_stock(ticker)

        all_rows = rows_from_df(ticker, df)
        if not all_rows:
            print("skipped (no valid rows)")
            continue

        for i in range(0, len(all_rows), CHUNK_SIZE):
            upsert_price_rows(all_rows[i : i + CHUNK_SIZE])

        print(f"✓  {len(all_rows)} rows imported")

    print("\nDone.")


if __name__ == "__main__":
    seed()