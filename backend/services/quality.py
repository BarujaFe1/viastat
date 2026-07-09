from typing import Optional
import polars as pl


def detect_duplicates(pings: pl.DataFrame) -> pl.DataFrame:
    return pings.with_columns(
        pl.struct(["vehicle_id", "timestamp"])
        .is_duplicated()
        .alias("is_duplicate")
    )


def detect_invalid_coordinates(pings: pl.DataFrame) -> pl.DataFrame:
    return pings.with_columns(
        ((pl.col("latitude") == 0.0) & (pl.col("longitude") == 0.0))
        .alias("has_invalid_coord")
    )


def detect_impossible_speeds(pings: pl.DataFrame, max_speed: float = 120.0) -> pl.DataFrame:
    return pings.with_columns(
        (pl.col("speed") > max_speed).fill_null(False).alias("has_impossible_speed")
    )


def detect_out_of_order(pings: pl.DataFrame) -> pl.DataFrame:
    # Detect out-of-order BEFORE sorting: mark rows where ts < previous row ts by vehicle
    pings = pings.sort(["vehicle_id"])  # sort by vehicle only, preserve input order
    return pings.with_columns(
        (pl.col("timestamp").diff().dt.total_seconds() < 0)
        .fill_null(False)
        .alias("has_out_of_order_ts")
        .over("vehicle_id")
    )


def detect_gaps(pings: pl.DataFrame, gap_threshold_minutes: float = 5.0) -> pl.DataFrame:
    pings = pings.sort(["vehicle_id", "timestamp"])
    gap_seconds = gap_threshold_minutes * 60.0
    return pings.with_columns(
        (pl.col("timestamp").diff().dt.total_seconds() / 60.0)
        .alias("gap_minutes_after")
        .over("vehicle_id")
    )
