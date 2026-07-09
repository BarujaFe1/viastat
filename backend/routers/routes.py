import json
from typing import Optional
import polars as pl
from fastapi import APIRouter, Query
from backend.services.loader import get_loader
from backend.config import DATA_DIR, RAW_DIR

router = APIRouter()


def _load_route_names():
    route_names = {}
    geojson_path = RAW_DIR / "routes.geojson"
    if geojson_path.exists():
        with open(geojson_path) as f:
            gj = json.load(f)
        for feat in gj.get("features", []):
            p = feat.get("properties", {})
            route_names[p["route_id"]] = {
                "route_short_name": p.get("route_short_name", ""),
                "route_long_name": p.get("route_long_name", ""),
            }
    return route_names


async def list_routes(date: Optional[str] = Query(None), hour: Optional[int] = Query(None)):
    loader = get_loader(DATA_DIR)
    headway = loader.load_gold("headway_analysis")
    metrics = loader.load_gold("route_metrics")
    route_names = _load_route_names()

    if headway is None or headway.is_empty():
        return {"routes": []}

    # When date/hour filters are present, aggregate from route_metrics so the
    # FilterBar on /routes actually changes the comparison table.
    filtered_metrics = metrics
    if filtered_metrics is not None and not filtered_metrics.is_empty():
        if date:
            filtered_metrics = filtered_metrics.filter(filtered_metrics["date"] == date)
        if hour is not None:
            filtered_metrics = filtered_metrics.filter(filtered_metrics["hour_window"] == hour)

    routes_data = []
    for row in headway.to_dicts():
        rid = row["route_id"]
        names = route_names.get(rid, {})
        reliability = float(row.get("avg_reliability_score", 0))
        regularity = float(row.get("avg_regularity_score", 0))
        data_quality = float(row.get("avg_data_quality_score", 0))
        interpretable = row.get("interpretable_windows", 0) > row.get("total_windows", 1) / 2

        if filtered_metrics is not None and (date or hour is not None):
            route_slice = filtered_metrics.filter(filtered_metrics["route_id"] == rid)
            if route_slice.is_empty():
                continue
            reliability = float(route_slice["reliability_score"].mean())
            regularity = float(route_slice["regularity_score"].mean())
            data_quality = float(route_slice["data_quality_score"].mean())
            interpretable = bool(route_slice["interpretable"].mean() >= 0.5)

        routes_data.append({
            "route_id": rid,
            "route_short_name": names.get("route_short_name", rid),
            "route_long_name": names.get("route_long_name", ""),
            "reliability_score": round(reliability, 1),
            "regularity_score": round(regularity, 1),
            "data_quality_score": round(data_quality, 1),
            "interpretable": interpretable,
            "expected_headway_minutes": row.get("expected_headway", 15),
        })
    return {"routes": routes_data}


router.add_api_route("/", list_routes, methods=["GET"])
router.add_api_route("", list_routes, methods=["GET"])


@router.get("/{route_id}/summary")
async def route_summary(
    route_id: str,
    date: Optional[str] = Query(None),
    hour: Optional[int] = Query(None),
):
    loader = get_loader(DATA_DIR)
    metrics = loader.load_gold("route_metrics")
    if metrics is None or metrics.is_empty():
        return {"route_id": route_id, "metrics": []}

    route_metrics = metrics.filter(metrics["route_id"] == route_id)
    if date:
        route_metrics = route_metrics.filter(route_metrics["date"] == date)
    if hour is not None:
        route_metrics = route_metrics.filter(route_metrics["hour_window"] == hour)

    return {"route_id": route_id, "metrics": route_metrics.to_dicts()}


@router.get("/{route_id}/headways")
async def route_headways(route_id: str):
    loader = get_loader(DATA_DIR)
    metrics = loader.load_gold("route_metrics")
    if metrics is None or metrics.is_empty():
        return {"route_id": route_id, "headways": []}

    route_metrics = metrics.filter(metrics["route_id"] == route_id)
    headways = route_metrics["median_headway"].drop_nulls().to_list()
    return {"route_id": route_id, "headways": headways}


@router.get("/{route_id}/quality")
async def route_quality(route_id: str):
    loader = get_loader(DATA_DIR)
    issues = loader.load_silver("quality_issues")
    if issues is None or issues.is_empty():
        return {"route_id": route_id, "issues": []}

    route_issues = issues.filter(
        (issues["route_id"] == route_id) | (issues["route_id"] == "*")
    )
    return {"route_id": route_id, "issues": route_issues.to_dicts()}


@router.get("/{route_id}/geojson")
async def route_geojson(route_id: str):
    route_geojson_path = RAW_DIR / "routes.geojson"
    if not route_geojson_path.exists():
        return {"route_id": route_id, "geojson": None, "pings": [], "gaps": []}

    with open(route_geojson_path) as f:
        geojson_data = json.load(f)

    features = geojson_data.get("features", [])
    route_feature = None
    for feat in features:
        if feat.get("properties", {}).get("route_id") == route_id:
            route_feature = feat
            break

    if route_feature is None:
        return {"route_id": route_id, "geojson": None, "pings": [], "gaps": []}

    loader = get_loader(DATA_DIR)
    pings = loader.load_silver("pings_clean")
    pings_data = []
    gaps_data = []
    if pings is not None and not pings.is_empty():
        # Keep the map payload compact and aligned with the pipeline gap threshold.
        gap_threshold_minutes = 10.0
        route_pings = pings.filter(pings["route_id"] == route_id).head(500)
        pings_data = [
            {
                "lat": row["latitude"],
                "lng": row["longitude"],
                "speed": row["speed"],
            }
            for row in route_pings.select(["latitude", "longitude", "speed"]).to_dicts()
        ]
        gaps = route_pings.filter(
            route_pings["gap_minutes_after"].is_not_null()
            & (route_pings["gap_minutes_after"] > gap_threshold_minutes)
        ).head(50)
        if gaps.height > 0:
            gaps_data = [
                {"lat": row["latitude"], "lng": row["longitude"]}
                for row in gaps.select(["latitude", "longitude"]).to_dicts()
            ]

    return {
        "route_id": route_id,
        "geojson": route_feature,
        "pings": pings_data,
        "gaps": gaps_data,
    }


@router.get("/{route_id}/stops")
async def route_stops(route_id: str):
    stops_path = RAW_DIR / "stops.csv"
    if not stops_path.exists():
        return {"route_id": route_id, "stops": []}

    stops_df = pl.read_csv(stops_path, try_parse_dates=True)
    route_stops_df = stops_df.filter(stops_df["route_id"] == route_id)
    return {"route_id": route_id, "stops": route_stops_df.to_dicts()}


@router.get("/{route_id}/schedule-comparison")
async def route_schedule_comparison(route_id: str):
    schedule_path = RAW_DIR / "schedule.csv"
    if not schedule_path.exists():
        return {"route_id": route_id, "comparisons": []}

    schedule = pl.read_csv(schedule_path, try_parse_dates=True)
    route_schedule = schedule.filter(schedule["route_id"] == route_id)

    loader = get_loader(DATA_DIR)
    metrics = loader.load_gold("route_metrics")
    comparisons = []

    for row in route_schedule.to_dicts():
        date_str = row["date"]
        hour_val = row["hour"]
        expected = float(row["expected_headway_minutes"])

        observed = None
        if metrics is not None:
            match = metrics.filter(
                (metrics["route_id"] == route_id)
                & (metrics["date"] == date_str)
                & (metrics["hour_window"] == hour_val)
            )
            if match.height > 0:
                observed = float(match["median_headway"].to_list()[0]) if match["median_headway"].to_list()[0] is not None else None

        diff = round(observed - expected, 1) if observed is not None else None

        comparisons.append({
            "date": date_str,
            "hour_window": hour_val,
            "expected_headway": expected,
            "observed_median_headway": observed,
            "diff_minutes": diff,
        })

    return {"route_id": route_id, "comparisons": comparisons}
