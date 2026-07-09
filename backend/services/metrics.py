import numpy as np
import polars as pl
from typing import Optional


def calculate_headways(pings: pl.DataFrame) -> pl.DataFrame:
    if pings.is_empty():
        return pings
    pings = pings.sort(["vehicle_id", "timestamp"])
    pings = pings.with_columns(
        pl.col("timestamp").diff().dt.total_seconds().alias("headway_seconds").over("vehicle_id")
    )
    return pings


def median_headway(headway_seconds: pl.Series) -> Optional[float]:
    clean = headway_seconds.drop_nulls()
    if clean.len() < 2:
        return None
    return float(clean.median())


def p90_headway(headway_seconds: pl.Series) -> Optional[float]:
    clean = headway_seconds.drop_nulls()
    if clean.len() < 2:
        return None
    return float(clean.quantile(0.90))


def p95_headway(headway_seconds: pl.Series) -> Optional[float]:
    clean = headway_seconds.drop_nulls()
    if clean.len() < 2:
        return None
    return float(clean.quantile(0.95))


def headway_cv(headway_seconds: pl.Series) -> Optional[float]:
    clean = headway_seconds.drop_nulls()
    if clean.len() < 2:
        return None
    mean = float(clean.mean())
    if mean == 0:
        return None
    return float(clean.std()) / mean


def regularity_score(cv: Optional[float]) -> float:
    if cv is None:
        return 0.0
    return round(100.0 * (1.0 - min(1.0, cv / 1.5)), 1)


def coverage_score(ping_count: int, expected_pings: int) -> float:
    if expected_pings == 0:
        return 0.0
    return round(min(100.0, (ping_count / expected_pings) * 100.0), 1)


def data_quality_score(
    duplicate_rate: float = 0.0,
    invalid_coord_rate: float = 0.0,
    impossible_speed_rate: float = 0.0,
    out_of_order_rate: float = 0.0,
    gap_rate: float = 0.0,
) -> float:
    score = 100.0 * (
        0.30 * (1.0 - duplicate_rate)
        + 0.20 * (1.0 - invalid_coord_rate)
        + 0.20 * (1.0 - impossible_speed_rate)
        + 0.15 * (1.0 - out_of_order_rate)
        + 0.15 * (1.0 - gap_rate)
    )
    return round(max(0.0, min(100.0, score)), 1)


def reliability_score(
    coverage: float = 0.0,
    gap_rate: float = 0.0,
    duplicate_rate: float = 0.0,
    ping_volume: int = 0,
    max_expected: int = 360,
    dq_score: float = 0.0,
    ping_count: int = 0,
) -> float:
    if ping_count < 10:
        return round(10.0 + (ping_count / 10.0) * 10.0, 1)

    temporal_consistency = max(0.0, 1.0 - gap_rate * 2.0)

    score = 100.0 * (
        0.30 * (coverage / 100.0)
        + 0.20 * (1.0 - gap_rate)
        + 0.15 * (1.0 - duplicate_rate)
        + 0.15 * min(1.0, ping_volume / max_expected)
        + 0.10 * temporal_consistency
        + 0.10 * (dq_score / 100.0)
    )
    return round(max(0.0, min(100.0, score)), 1)


def is_interpretable(ping_count: int, coverage: float, duplicate_rate: float) -> bool:
    return ping_count >= 10 and coverage >= 30.0 and duplicate_rate < 0.5
