from fastapi import APIRouter
from backend.services.loader import get_loader
from backend.services.brief import generate_brief
from backend.config import DATA_DIR

router = APIRouter()


@router.get("/")
async def executive_brief():
    loader = get_loader(DATA_DIR)
    metrics = loader.load_gold("route_metrics")
    quality = loader.load_silver("quality_issues")
    return generate_brief(metrics, quality)
