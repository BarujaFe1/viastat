from pathlib import Path
import json
from fastapi import APIRouter
from backend.config import DATA_DIR, SEED, RAW_DIR
from backend.services.loader import get_loader

router = APIRouter()


@router.get("/status")
async def pipeline_status():
    loader = get_loader(DATA_DIR)
    meta_path = RAW_DIR / "metadata.json"

    metadata = {}
    if meta_path.exists():
        with open(meta_path) as f:
            metadata = json.load(f)

    bronze = loader.load_bronze("pings")
    silver_pings = loader.load_silver("pings_clean")
    silver_issues = loader.load_silver("quality_issues")
    gold_metrics = loader.load_gold("route_metrics")
    gold_headway = loader.load_gold("headway_analysis")

    layers = {}

    # Raw
    raw_pings_path = RAW_DIR / "raw_pings.csv"
    routes_path = RAW_DIR / "routes.geojson"
    stops_path = RAW_DIR / "stops.csv"
    schedule_path = RAW_DIR / "schedule.csv"

    layers["raw"] = {
        "pings": count_csv_rows(raw_pings_path),
        "routes": count_geojson_features(routes_path),
        "stops": count_csv_rows(stops_path),
        "schedule_records": count_csv_rows(schedule_path),
    }

    # Bronze
    if bronze is not None:
        layers["bronze"] = {
            "pings": bronze.height,
        }

    # Silver
    if silver_pings is not None:
        layers["silver"] = {
            "pings_clean": silver_pings.height,
            "quality_issues": silver_issues.height if silver_issues is not None else 0,
        }

    # Gold
    if gold_metrics is not None:
        layers["gold"] = {
            "route_metrics": gold_metrics.height,
            "headway_analysis": gold_headway.height if gold_headway is not None else 0,
        }

    return {
        "batch_id": metadata.get("version", None),
        "generated_at": None,
        "layers": layers,
        "anomalies": metadata.get("anomalies", []),
        "seed": metadata.get("seed", SEED),
        "period": {
            "start": metadata.get("start_date", ""),
            "end": metadata.get("end_date", ""),
        },
    }


def count_csv_rows(path: Path) -> int:
    if not path.exists():
        return 0
    with open(path, encoding="utf-8") as f:
        return sum(1 for _ in f) - 1  # exclude header


def count_geojson_features(path: Path) -> int:
    if not path.exists():
        return 0
    with open(path, encoding="utf-8") as f:
        return len(json.load(f).get("features", []))
