"""
ViaStat — Pipeline de Dados: Raw → Bronze → Silver → Gold
Processa CSV/GeoJSON sintéticos em camadas Parquet analíticas.
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime

import polars as pl
import numpy as np

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.services.metrics import (
    calculate_headways,
    median_headway,
    p90_headway,
    p95_headway,
    headway_cv,
    regularity_score,
    coverage_score,
    data_quality_score,
    reliability_score,
    is_interpretable,
)
from backend.services.quality import (
    detect_duplicates,
    detect_invalid_coordinates,
    detect_impossible_speeds,
    detect_out_of_order,
    detect_gaps,
)

RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"
BRONZE_DIR = Path(__file__).resolve().parent.parent / "data" / "bronze"
SILVER_DIR = Path(__file__).resolve().parent.parent / "data" / "silver"
GOLD_DIR = Path(__file__).resolve().parent.parent / "data" / "gold"
SEED = 42
# Pings emitted per vehicle per hour by the synthetic generator.
SEGMENTS_PER_VEHICLE = 10
# A normal ping is emitted every 360s (6 min). A gap is a silence longer than
# that — 10 min catches genuine drops (signal loss / skipped pings) without
# flagging the routine 6-min cadence.
GAP_THRESHOLD_MINUTES = 10.0
BATCH_ID = datetime.now().strftime("BATCH_%Y%m%d_%H%M%S")


def step_raw_to_bronze():
    """Raw CSV → Bronze Parquet (padronizado)."""
    print("[Bronze] Loading raw CSV...")
    csv_path = RAW_DIR / "raw_pings.csv"
    if not csv_path.exists():
        print(f"  ERROR: {csv_path} not found. Run generate script first.")
        return False

    df = pl.read_csv(csv_path, try_parse_dates=True)

    expected_schema = {
        "ping_id": pl.Utf8,
        "vehicle_id": pl.Utf8,
        "route_id": pl.Utf8,
        "timestamp": pl.Datetime,
        "latitude": pl.Float64,
        "longitude": pl.Float64,
        "speed": pl.Float64,
        "bearing": pl.Float64,
        "source": pl.Utf8,
    }

    for col, dtype in expected_schema.items():
        if col not in df.columns:
            print(f"  Missing column: {col}")
            return False
        if df[col].dtype != dtype:
            if col == "timestamp":
                df = df.with_columns(pl.col("timestamp").str.strptime(pl.Datetime, "%Y-%m-%dT%H:%M:%S"))
            elif col in ("speed", "bearing"):
                df = df.with_columns(pl.col(col).cast(pl.Float64))
            elif col in ("latitude", "longitude"):
                df = df.with_columns(pl.col(col).cast(pl.Float64))

    os.makedirs(BRONZE_DIR, exist_ok=True)
    out_path = BRONZE_DIR / "pings.parquet"
    df.write_parquet(out_path)
    print(f"  Wrote {out_path} ({df.height} rows)")
    return True


def step_bronze_to_silver():
    """Bronze Parquet → Silver Parquet (qualidade)."""
    print("[Silver] Loading bronze...")
    bronze_path = BRONZE_DIR / "pings.parquet"
    if not bronze_path.exists():
        print(f"  ERROR: {bronze_path} not found.")
        return False

    df = pl.read_parquet(bronze_path)

    # Run out-of-order detection BEFORE sorting (so we can detect actual order issues)
    df = detect_out_of_order(df)

    # Sort by vehicle and timestamp for all other checks
    df = df.sort(["vehicle_id", "timestamp"])

    # Quality checks
    df = detect_duplicates(df)
    df = detect_invalid_coordinates(df)
    df = detect_impossible_speeds(df, max_speed=120.0)
    df = detect_gaps(df, gap_threshold_minutes=GAP_THRESHOLD_MINUTES)

    # Build quality flags
    flag_cols = ["is_duplicate", "has_invalid_coord", "has_impossible_speed", "has_out_of_order_ts"]
    df = df.with_columns(
        pl.concat_list(
            [pl.when(pl.col(c)).then(pl.lit(c)) for c in flag_cols]
        ).list.drop_nulls().alias("quality_flags")
    )

    os.makedirs(SILVER_DIR, exist_ok=True)
    out_path = SILVER_DIR / "pings_clean.parquet"
    df.write_parquet(out_path)
    print(f"  Wrote {out_path} ({df.height} rows)")

    # Generate quality issues summary
    issues = []
    total = df.height

    dup_count = df.filter(pl.col("is_duplicate")).height
    if dup_count > 0:
        issues.append({
            "issue_id": f"ISSUE_{BATCH_ID}_DUP",
            "batch_id": BATCH_ID,
            "route_id": "*",
            "issue_type": "duplicate_ping",
            "severity": "medium",
            "affected_rows": dup_count,
            "affected_metric": "data_quality_score",
            "example_record": df.filter(pl.col("is_duplicate")).head(1).to_dicts()[0] if dup_count > 0 else {},
            "explanation": f"{dup_count} pings duplicados detectados ({100*dup_count/total:.1f}% do total). Duplicatas podem inflar métricas de cobertura e headway.",
        })

    inv_count = df.filter(pl.col("has_invalid_coord")).height
    if inv_count > 0:
        issues.append({
            "issue_id": f"ISSUE_{BATCH_ID}_INV",
            "batch_id": BATCH_ID,
            "route_id": "*",
            "issue_type": "invalid_coordinate",
            "severity": "high",
            "affected_rows": inv_count,
            "affected_metric": "data_quality_score",
            "example_record": df.filter(pl.col("has_invalid_coord")).head(1).to_dicts()[0] if inv_count > 0 else {},
            "explanation": f"{inv_count} coordenadas inválidas (0,0) detectadas. Estes registros não podem ser usados para análise geoespacial.",
        })

    speed_count = df.filter(pl.col("has_impossible_speed")).height
    if speed_count > 0:
        issues.append({
            "issue_id": f"ISSUE_{BATCH_ID}_SPD",
            "batch_id": BATCH_ID,
            "route_id": "*",
            "issue_type": "impossible_speed",
            "severity": "high",
            "affected_rows": speed_count,
            "affected_metric": "data_quality_score, headway calculation",
            "example_record": df.filter(pl.col("has_impossible_speed")).head(1).to_dicts()[0] if speed_count > 0 else {},
            "explanation": f"{speed_count} velocidades acima de 120 km/h detectadas. Provável ruído no sensor GPS.",
        })

    ooo_count = df.filter(pl.col("has_out_of_order_ts")).height
    if ooo_count > 0:
        issues.append({
            "issue_id": f"ISSUE_{BATCH_ID}_OOO",
            "batch_id": BATCH_ID,
            "route_id": "*",
            "issue_type": "timestamp_out_of_order",
            "severity": "low",
            "affected_rows": ooo_count,
            "affected_metric": "headway calculation",
            "example_record": df.filter(pl.col("has_out_of_order_ts")).head(1).to_dicts()[0] if ooo_count > 0 else {},
            "explanation": f"{ooo_count} timestamps fora de ordem detectados. Podem distorcer o cálculo de headway.",
        })

    gap_count = df.filter(pl.col("gap_minutes_after") > GAP_THRESHOLD_MINUTES).height
    if gap_count > 0:
        issues.append({
            "issue_id": f"ISSUE_{BATCH_ID}_GAP",
            "batch_id": BATCH_ID,
            "route_id": "*",
            "issue_type": "large_gap",
            "severity": "medium",
            "affected_rows": gap_count,
            "affected_metric": "coverage_score, reliability_score",
            "example_record": df.filter(pl.col("gap_minutes_after") > GAP_THRESHOLD_MINUTES).head(1).to_dicts()[0] if gap_count > 0 else {},
            "explanation": f"{gap_count} gaps acima de 5 minutos detectados. Reduz a cobertura temporal dos dados.",
        })

    issues_df = pl.DataFrame(issues)
    issues_path = SILVER_DIR / "quality_issues.parquet"
    issues_df.write_parquet(issues_path)
    print(f"  Wrote {issues_path} ({issues_df.height} issues)")
    return True


def step_silver_to_gold():
    """Silver Parquet → Gold Parquet (agregados analíticos)."""
    print("[Gold] Loading silver...")
    silver_path = SILVER_DIR / "pings_clean.parquet"
    if not silver_path.exists():
        print(f"  ERROR: {silver_path} not found.")
        return False

    df = pl.read_parquet(silver_path)

    # Add hour window column
    df = df.with_columns(
        pl.col("timestamp").dt.strftime("%Y-%m-%d").alias("date"),
        pl.col("timestamp").dt.hour().alias("hour_window"),
    )

    # Load routes config for expected headway
    routes_path = RAW_DIR / "routes.geojson"
    route_headways = {}
    if routes_path.exists():
        with open(routes_path) as f:
            geojson = json.load(f)
        for feat in geojson["features"]:
            rid = feat["properties"]["route_id"]
            route_headways[rid] = feat["properties"]["expected_headway_minutes"]

    # Load scheduled vehicle counts per route so coverage reflects vehicles that
    # SHOULD be running (not just the ones observed). This lets the low_coverage
    # anomaly surface as reduced coverage instead of being normalised away.
    schedule_path = RAW_DIR / "schedule.csv"
    route_expected_vehicles = {}
    if schedule_path.exists():
        sched = pl.read_csv(schedule_path)
        for r in sched.group_by("route_id").agg(pl.max("expected_vehicles")).to_dicts():
            route_expected_vehicles[r["route_id"]] = int(r["expected_vehicles"])

    # Compute metrics per route/hour
    metrics_records = []
    for (rid, date, hour), group in df.group_by(["route_id", "date", "hour_window"]):
        group = group.sort("timestamp")
        ping_count = group.height
        active_vehicles = group["vehicle_id"].n_unique()

        # Expected pings for this window = nominal emission rate (segments per
        # vehicle per hour) x SCHEDULED vehicles. Using scheduled (not observed)
        # vehicles means dropped pings and missing vehicles both reduce coverage.
        scheduled_vehicles = route_expected_vehicles.get(rid, max(active_vehicles, 1))
        expected = SEGMENTS_PER_VEHICLE * max(scheduled_vehicles, 1)

        dup_rate = group.filter(pl.col("is_duplicate")).height / max(ping_count, 1)
        inv_rate = group.filter(pl.col("has_invalid_coord")).height / max(ping_count, 1)
        speed_rate = group.filter(pl.col("has_impossible_speed")).height / max(ping_count, 1)
        ooo_rate = group.filter(pl.col("has_out_of_order_ts")).height / max(ping_count, 1)
        gap_rate = group.filter(pl.col("gap_minutes_after") > GAP_THRESHOLD_MINUTES).height / max(ping_count, 1)

        headway_series = group["gap_minutes_after"].drop_nulls() * 60  # convert to seconds
        # Filter negative values (from out-of-order)
        headway_series = headway_series.filter(headway_series > 0)

        med_hw = median_headway(headway_series)
        p90_hw = p90_headway(headway_series)
        p95_hw = p95_headway(headway_series)
        cv = headway_cv(headway_series)

        cov_score = coverage_score(ping_count, expected)
        reg_score = regularity_score(cv)
        dq_score = data_quality_score(dup_rate, inv_rate, speed_rate, ooo_rate, gap_rate)
        rel_score = reliability_score(cov_score, gap_rate, dup_rate, ping_count, expected, dq_score, ping_count)
        interp = is_interpretable(ping_count, cov_score, dup_rate)

        # Convert headway back to minutes for output
        med_hw_min = round(med_hw / 60, 2) if med_hw is not None else None
        p90_hw_min = round(p90_hw / 60, 2) if p90_hw is not None else None
        p95_hw_min = round(p95_hw / 60, 2) if p95_hw is not None else None

        metrics_records.append({
            "route_id": rid,
            "date": date,
            "hour_window": hour,
            "ping_count": ping_count,
            "active_vehicle_count": active_vehicles,
            "median_headway": med_hw_min,
            "p90_headway": p90_hw_min,
            "p95_headway": p95_hw_min,
            "headway_cv": round(cv, 4) if cv is not None else None,
            "missing_ping_rate": round(gap_rate, 4),
            "coverage_score": cov_score,
            "regularity_score": reg_score,
            "data_quality_score": dq_score,
            "reliability_score": rel_score,
            "interpretable": interp,
        })

    metrics_df = pl.DataFrame(metrics_records)
    os.makedirs(GOLD_DIR, exist_ok=True)

    metrics_path = GOLD_DIR / "route_metrics.parquet"
    metrics_df.write_parquet(metrics_path)
    print(f"  Wrote {metrics_path} ({metrics_df.height} records)")

    # Headway analysis per route
    headway_records = []
    for rid in metrics_df["route_id"].unique():
        route_metrics = metrics_df.filter(pl.col("route_id") == rid)
        headway_records.append({
            "route_id": rid,
            "expected_headway": route_headways.get(rid, 15),
            "median_headway": route_metrics["median_headway"].drop_nulls().median(),
            "p90_headway": route_metrics["p90_headway"].drop_nulls().quantile(0.90),
            "p95_headway": route_metrics["p95_headway"].drop_nulls().quantile(0.95),
            "avg_headway_cv": route_metrics["headway_cv"].drop_nulls().mean(),
            "avg_reliability_score": route_metrics["reliability_score"].mean(),
            "avg_regularity_score": route_metrics["regularity_score"].mean(),
            "avg_data_quality_score": route_metrics["data_quality_score"].mean(),
            "avg_coverage_score": route_metrics["coverage_score"].mean(),
            "interpretable_windows": route_metrics.filter(pl.col("interpretable")).height,
            "total_windows": route_metrics.height,
        })

    headway_df = pl.DataFrame(headway_records)
    headway_path = GOLD_DIR / "headway_analysis.parquet"
    headway_df.write_parquet(headway_path)
    print(f"  Wrote {headway_path} ({headway_df.height} records)")

    # Data quality summary
    silver_issues = SILVER_DIR / "quality_issues.parquet"
    if silver_issues.exists():
        issues_df = pl.read_parquet(silver_issues)
        dq_summary_path = GOLD_DIR / "data_quality_summary.parquet"
        issues_df.write_parquet(dq_summary_path)
        print(f"  Wrote {dq_summary_path}")

    return True


def main():
    print(f"=== ViaStat Pipeline === Batch: {BATCH_ID}")
    print()

    if not step_raw_to_bronze():
        print("Aborting.")
        return

    print()
    if not step_bronze_to_silver():
        print("Aborting.")
        return

    print()
    if not step_silver_to_gold():
        print("Aborting.")
        return

    print()
    print("=== Pipeline Complete ===")


if __name__ == "__main__":
    main()
