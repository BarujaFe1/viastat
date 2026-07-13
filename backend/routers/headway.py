from fastapi import APIRouter
from backend.services.loader import get_loader
from backend.config import DATA_DIR, RAW_DIR
from backend.schemas.models import HeadwaySummaryResponse
import json

router = APIRouter()


@router.get("/summary", response_model=HeadwaySummaryResponse)
async def headway_summary():
    """Aggregated headway stats per route from gold headway_analysis (single round-trip)."""
    loader = get_loader(DATA_DIR)
    headway = loader.load_gold("headway_analysis")
    if headway is None or headway.is_empty():
        return {"routes": []}

    route_names = {}
    geojson_path = RAW_DIR / "routes.geojson"
    if geojson_path.exists():
        with open(geojson_path, encoding="utf-8") as f:
            gj = json.load(f)
        for feat in gj.get("features", []):
            p = feat.get("properties", {})
            route_names[p["route_id"]] = {
                "route_short_name": p.get("route_short_name", ""),
                "route_long_name": p.get("route_long_name", ""),
            }

    routes = []
    for row in headway.to_dicts():
        rid = row["route_id"]
        names = route_names.get(rid, {})
        routes.append(
            {
                "route_id": rid,
                "route_short_name": names.get("route_short_name", rid),
                "route_long_name": names.get("route_long_name", ""),
                "expected_headway": float(row.get("expected_headway") or 15),
                "median_headway": (
                    None
                    if row.get("median_headway") is None
                    else round(float(row["median_headway"]), 2)
                ),
                "p90_headway": (
                    None if row.get("p90_headway") is None else round(float(row["p90_headway"]), 2)
                ),
                "p95_headway": (
                    None if row.get("p95_headway") is None else round(float(row["p95_headway"]), 2)
                ),
                "headway_cv": (
                    None
                    if row.get("avg_headway_cv") is None
                    else round(float(row["avg_headway_cv"]), 3)
                ),
            }
        )
    return {"routes": routes}
