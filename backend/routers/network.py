from typing import Optional
from fastapi import APIRouter, Query
from backend.services.loader import get_loader
from backend.config import DATA_DIR

router = APIRouter()


@router.get("/summary")
async def network_summary(date: Optional[str] = Query(None), hour: Optional[int] = Query(None)):
    loader = get_loader(DATA_DIR)
    metrics = loader.load_gold("route_metrics")

    if metrics is None or metrics.is_empty():
        return {
            "total_routes": 10,
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
