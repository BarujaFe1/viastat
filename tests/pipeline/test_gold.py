"""Tests for the gold aggregation step of the pipeline."""

import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import polars as pl

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


class TestGoldAggregation:
    def test_headway_analysis_has_expected_headway(self):
        """B2 regression: headway_analysis must carry per-route expected headway."""
        path = DATA_DIR / "gold" / "headway_analysis.parquet"
        assert path.exists(), "Run scripts/build_parquet_dataset.py first"
        df = pl.read_parquet(path)
        assert "expected_headway" in df.columns
        # Matches routes.geojson
        with open(DATA_DIR / "raw" / "routes.geojson", encoding="utf-8") as f:
            gj = json.load(f)
        expected = {
            feat["properties"]["route_id"]: feat["properties"]["expected_headway_minutes"]
            for feat in gj["features"]
        }
        for row in df.to_dicts():
            assert row["expected_headway"] == expected[row["route_id"]]

    def test_calibration_separates_good_and_bad_routes(self):
        """Reliability must discriminate: the exemplar route should score well
        above the low_coverage route (guards the coverage calibration fix)."""
        with open(DATA_DIR / "raw" / "routes.geojson", encoding="utf-8") as f:
            gj = json.load(f)
        anomaly = {
            feat["properties"]["route_id"]: feat["properties"]["anomaly"]
            for feat in gj["features"]
        }
        m = pl.read_parquet(DATA_DIR / "gold" / "route_metrics.parquet")
        agg = m.group_by("route_id").agg(
            pl.mean("reliability_score").alias("rel"),
            pl.mean("coverage_score").alias("cov"),
        )
        rel = {r["route_id"]: r["rel"] for r in agg.to_dicts()}
        cov = {r["route_id"]: r["cov"] for r in agg.to_dicts()}
        exemplar = next(rid for rid, a in anomaly.items() if a == "exemplar")
        low_cov = next(rid for rid, a in anomaly.items() if a == "low_coverage")
        assert rel[exemplar] > 90, f"exemplar route too low: {rel[exemplar]}"
        assert cov[low_cov] < 60, f"low_coverage route not degraded: {cov[low_cov]}"
        assert rel[exemplar] > rel[low_cov]

    def test_route_metrics_schema(self):
        path = DATA_DIR / "gold" / "route_metrics.parquet"
        assert path.exists()
        df = pl.read_parquet(path)
        for col in (
            "route_id", "date", "hour_window", "median_headway",
            "coverage_score", "reliability_score", "interpretable",
        ):
            assert col in df.columns
        # median headway should be null or positive minutes
        med = df["median_headway"].drop_nulls()
        assert (med > 0).all()
