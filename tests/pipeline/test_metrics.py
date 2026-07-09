"""Tests for metric calculations."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import polars as pl
import numpy as np

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


class TestMetrics:
    def test_median_headway_known_values(self):
        series = pl.Series("headway", [60.0, 120.0, 180.0, 240.0, 300.0]) * 60
        result = median_headway(series)
        assert result is not None
        assert abs(result - 10800) < 1  # 180 min in seconds

    def test_p90_p95_known_values(self):
        values = list(range(10, 110, 10))  # 10..100
        series = pl.Series("headway", [float(v) for v in values]) * 60
        p90 = p90_headway(series)
        p95 = p95_headway(series)
        assert p90 is not None
        assert p95 is not None
        assert p90 <= p95

    def test_headway_cv_uniform(self):
        values = [60.0] * 5
        series = pl.Series("headway", values)
        cv = headway_cv(series)
        assert cv is not None
        assert abs(cv) < 0.001

    def test_headway_cv_variable(self):
        values = [30.0, 60.0, 90.0, 120.0, 150.0]
        series = pl.Series("headway", values)
        cv = headway_cv(series)
        assert cv is not None
        assert cv > 0.1

    def test_regularity_score_perfect(self):
        assert regularity_score(0.0) == 100.0

    def test_regularity_score_zero(self):
        score = regularity_score(2.0)
        assert score == 0.0

    def test_coverage_score_full(self):
        assert coverage_score(100, 100) == 100.0

    def test_coverage_score_zero(self):
        assert coverage_score(0, 100) == 0.0

    def test_data_quality_score_perfect(self):
        assert data_quality_score(0, 0, 0, 0, 0) == 100.0

    def test_data_quality_score_reduced(self):
        score = data_quality_score(0.5, 0.0, 0.0, 0.0, 0.0)
        assert score < 100.0
        assert score > 0.0

    def test_reliability_score_low_pings(self):
        score = reliability_score(ping_count=5, coverage=50.0)
        # Should be very low due to <10 pings
        assert score < 30.0

    def test_reliability_score_sufficient(self):
        score = reliability_score(
            coverage=80.0, gap_rate=0.05, duplicate_rate=0.02,
            ping_volume=200, max_expected=360, dq_score=85.0, ping_count=50
        )
        assert score > 30.0

    def test_interpretable_true(self):
        assert is_interpretable(50, 80.0, 0.02) is True

    def test_interpretable_false_low_pings(self):
        assert is_interpretable(5, 80.0, 0.02) is False

    def test_interpretable_false_low_coverage(self):
        assert is_interpretable(50, 20.0, 0.02) is False

    def test_interpretable_false_high_duplicates(self):
        assert is_interpretable(50, 80.0, 0.6) is False

    def test_empty_series(self):
        series = pl.Series("headway", [])
        assert median_headway(series) is None
        assert p90_headway(series) is None
        assert headway_cv(series) is None
