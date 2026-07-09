"""Tests for data quality detection."""

import sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import polars as pl
import numpy as np

from backend.services.quality import (
    detect_duplicates,
    detect_invalid_coordinates,
    detect_impossible_speeds,
    detect_out_of_order,
    detect_gaps,
)


def make_ping_df(vehicle_id="V001", route_id="R01", n=10):
    """Create a simple ping dataframe for testing."""
    base = datetime(2026, 6, 1, 8, 0, 0)
    data = {
        "ping_id": [f"P{i:08d}" for i in range(n)],
        "vehicle_id": [vehicle_id] * n,
        "route_id": [route_id] * n,
        "timestamp": [base.replace(hour=8, minute=i * 5) for i in range(n)],
        "latitude": [-23.55 + i * 0.001 for i in range(n)],
        "longitude": [-46.63 + i * 0.001 for i in range(n)],
        "speed": [30.0 + i * 2.0 for i in range(n)],
        "bearing": [90.0] * n,
        "source": ["synthetic"] * n,
    }
    return pl.DataFrame(data)


class TestQuality:
    def test_detect_duplicates(self):
        df = make_ping_df(n=5)
        # Add an explicit duplicate
        dup = df.head(1).with_columns(pl.lit("DUP").alias("ping_id"))
        df = pl.concat([df, dup])
        result = detect_duplicates(df)
        assert result.filter(pl.col("is_duplicate")).height >= 1

    def test_detect_invalid_coordinates(self):
        df = make_ping_df(n=5)
        df = df.with_columns(
            pl.when(pl.col("ping_id") == df["ping_id"][0])
            .then(pl.lit(0.0))
            .otherwise(pl.col("latitude"))
            .alias("latitude"),
            pl.when(pl.col("ping_id") == df["ping_id"][0])
            .then(pl.lit(0.0))
            .otherwise(pl.col("longitude"))
            .alias("longitude"),
        )
        result = detect_invalid_coordinates(df)
        assert result.filter(pl.col("has_invalid_coord")).height == 1

    def test_detect_impossible_speeds(self):
        df = make_ping_df(n=5)
        df = df.with_columns(
            pl.when(pl.col("ping_id") == df["ping_id"][0])
            .then(pl.lit(150.0))
            .otherwise(pl.col("speed"))
            .alias("speed")
        )
        result = detect_impossible_speeds(df, max_speed=120.0)
        assert result.filter(pl.col("has_impossible_speed")).height == 1

    def test_detect_out_of_order(self):
        df = make_ping_df(n=5)
        # Swap timestamps of first two records
        ts_vals = df["timestamp"].to_list()
        ts_vals[0], ts_vals[1] = ts_vals[1], ts_vals[0]
        df = df.with_columns(pl.Series("timestamp", ts_vals))
        result = detect_out_of_order(df)
        assert result.filter(pl.col("has_out_of_order_ts")).height >= 1

    def test_detect_gaps(self):
        df = make_ping_df(n=5)
        # Gap at position 1: 10 min gap
        ts_vals = df["timestamp"].to_list()
        ts_vals[1] = ts_vals[0].replace(minute=ts_vals[0].minute + 15)
        df = df.with_columns(pl.Series("timestamp", ts_vals))
        result = detect_gaps(df, gap_threshold_minutes=5.0)
        gaps = result.filter(pl.col("gap_minutes_after") > 5.0)
        assert gaps.height >= 1
