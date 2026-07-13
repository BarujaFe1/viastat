from typing import Optional
import json
from fastapi import APIRouter, Query
from backend.services.loader import get_loader
from backend.config import DATA_DIR, RAW_DIR
from backend.schemas.models import NetworkSummary

router = APIRouter()


@router.get("/summary", response_model=NetworkSummary)
async def network_summary(date: Optional[str] = Query(None), hour: Optional[int] = Query(None)):
    loader = get_loader(DATA_DIR)
    metrics = loader.load_gold("route_metrics")

    if metrics is None or metrics.is_empty():
        return {
            "total_routes": 0,
            "total_pings": 0,
            "total_vehicles": 0,
            "avg_reliability_score": 0.0,
            "avg_data_quality_score": 0.0,
            "avg_coverage_score": 0.0,
            "period": {"start": "", "end": ""},
        }

    filtered = metrics
    if date:
        filtered = filtered.filter(filtered["date"] == date)
    if hour is not None:
        filtered = filtered.filter(filtered["hour_window"] == hour)

    bronze = loader.load_bronze("pings")
    bronze_filtered = bronze
    if bronze is not None:
        if date:
            bronze_filtered = bronze_filtered.filter(
                bronze_filtered["timestamp"].dt.strftime("%Y-%m-%d") == date
            )
        if hour is not None:
            bronze_filtered = bronze_filtered.filter(
                bronze_filtered["timestamp"].dt.hour() == hour
            )

    return {
        "total_routes": filtered["route_id"].n_unique(),
        "total_pings": bronze_filtered.height if bronze_filtered is not None else 0,
        "total_vehicles": bronze_filtered["vehicle_id"].n_unique() if bronze_filtered is not None else 0,
        "avg_reliability_score": round(float(filtered["reliability_score"].mean()), 1),
        "avg_data_quality_score": round(float(filtered["data_quality_score"].mean()), 1),
        "avg_coverage_score": round(float(filtered["coverage_score"].mean()), 1),
        "period": {
            "start": metrics["date"].min() if not metrics.is_empty() else "",
            "end": metrics["date"].max() if not metrics.is_empty() else "",
        },
    }


@router.get("/geojson")
async def network_geojson():
    """Single FeatureCollection for the network map (avoids per-route N+1 fetches).

    Properties include reliability/regularity/data_quality scores from gold
    headway_analysis. Intentional omission of pings/gaps keeps the payload light.
    """
    geojson_path = RAW_DIR / "routes.geojson"
    if not geojson_path.exists():
        return {"type": "FeatureCollection", "features": [], "route_count": 0}

    with open(geojson_path, encoding="utf-8") as f:
        geojson_data = json.load(f)

    loader = get_loader(DATA_DIR)
    headway = loader.load_gold("headway_analysis")
    scores: dict[str, dict] = {}
    if headway is not None and not headway.is_empty():
        for row in headway.to_dicts():
            scores[row["route_id"]] = {
                "reliability_score": round(float(row.get("avg_reliability_score") or 0), 1),
                "regularity_score": round(float(row.get("avg_regularity_score") or 0), 1),
                "data_quality_score": round(float(row.get("avg_data_quality_score") or 0), 1),
            }

    features = []
    for feat in geojson_data.get("features", []):
        props = dict(feat.get("properties") or {})
        rid = props.get("route_id")
        if not rid:
            continue
        score = scores.get(rid, {})
        props.update(
            {
                "reliability_score": score.get("reliability_score", 50.0),
                "regularity_score": score.get("regularity_score", 50.0),
                "data_quality_score": score.get("data_quality_score", 50.0),
            }
        )
        features.append({**feat, "properties": props})

    return {
        "type": "FeatureCollection",
        "features": features,
        "route_count": len(features),
    }
