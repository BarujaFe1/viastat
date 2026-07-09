"""Tests for the synthetic data generator."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import polars as pl
from scripts.generate_synthetic_gtfs_like_data import (
    generate_pings,
    generate_routes_geojson,
    generate_stops,
    generate_route_geometry,
    ROUTES_CONFIG,
    SEED,
)


class TestGenerator:
    def test_seed_reproducibility(self):
        pings1 = generate_pings()
        pings2 = generate_pings()
        assert len(pings1) == len(pings2)
        assert pings1[0]["ping_id"] == pings2[0]["ping_id"]

    def test_pings_have_expected_schema(self):
        pings = generate_pings()
        required_fields = [
            "ping_id", "vehicle_id", "route_id", "timestamp",
            "latitude", "longitude", "speed", "bearing", "source",
        ]
        for field in required_fields:
            assert field in pings[0], f"Missing field: {field}"

    def test_ten_routes_generated(self):
        assert len(ROUTES_CONFIG) == 10

    def test_routes_geojson_format(self):
        geojson = generate_routes_geojson()
        assert geojson["type"] == "FeatureCollection"
        assert len(geojson["features"]) == 10
        for feat in geojson["features"]:
            assert feat["geometry"]["type"] == "LineString"

    def test_pings_within_bounding_box(self):
        pings = generate_pings()
        for p in pings[:1000]:
            lat, lon = p["latitude"], p["longitude"]
            assert -90 <= lat <= 90, f"Invalid lat: {lat}"
            assert -180 <= lon <= 180, f"Invalid lon: {lon}"

    def test_pings_have_unique_ids(self):
        pings = generate_pings()
        ids = [p["ping_id"] for p in pings]
        # There can be duplicates intentionally (source: synthetic_duplicate)
        # but original IDs should be unique
        original_ids = [p["ping_id"] for p in pings if p["source"] != "synthetic_duplicate"]
        assert len(original_ids) == len(set(original_ids))
