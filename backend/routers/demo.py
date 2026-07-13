from fastapi import APIRouter
from backend.config import RAW_DIR
from backend.schemas.models import DemoMetadata
import json

router = APIRouter()


@router.get("/metadata", response_model=DemoMetadata)
async def demo_metadata():
    meta_path = RAW_DIR / "metadata.json"
    if meta_path.exists():
        with open(meta_path, encoding="utf-8") as f:
            data = json.load(f)
        return {
            "name": data.get("name", "ViaStat Synthetic Dataset"),
            "version": data.get("version", "0.1.0"),
            "routes": data.get("routes", 10),
            "days": data.get("days", 7),
            "seed": data.get("seed", 42),
            "description": data.get(
                "description",
                "Dataset sintético reproduzível para demonstrar a plataforma ViaStat.",
            ),
            "anomalies": data.get("anomalies", []),
            "total_pings": data.get("total_pings"),
            "region": data.get("region"),
        }

    return {
        "name": "ViaStat Synthetic Dataset",
        "version": "0.1.0",
        "routes": 10,
        "days": 7,
        "seed": 42,
        "description": "Dataset sintético reproduzível para demonstrar a plataforma ViaStat.",
        "anomalies": [
            "duplicatas",
            "coordenadas inválidas",
            "gaps de sinal",
            "velocidades impossíveis",
            "timestamps fora de ordem",
            "headway irregular",
            "baixa cobertura",
        ],
    }
