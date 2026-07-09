from fastapi import APIRouter
from backend.services.loader import get_loader
from backend.services.brief import generate_brief
from backend.config import DATA_DIR

router = APIRouter()


async def executive_brief():
    loader = get_loader(DATA_DIR)
    metrics = loader.load_gold("route_metrics")
    quality = loader.load_silver("quality_issues")
    return generate_brief(metrics, quality)


router.add_api_route("/", executive_brief, methods=["GET"])
router.add_api_route("", executive_brief, methods=["GET"])
