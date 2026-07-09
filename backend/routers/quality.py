import polars as pl
from fastapi import APIRouter
from backend.services.loader import get_loader
from backend.config import DATA_DIR

router = APIRouter()


@router.get("/issues")
async def quality_issues():
    loader = get_loader(DATA_DIR)
    issues = loader.load_silver("quality_issues")
    if issues is None or issues.is_empty():
        return {"issues": []}
    return {"issues": issues.to_dicts()}


@router.get("/summary")
async def quality_summary():
    loader = get_loader(DATA_DIR)
    issues = loader.load_silver("quality_issues")
    metrics = loader.load_gold("route_metrics")

    if (issues is None or issues.is_empty()) and (metrics is None or metrics.is_empty()):
        return {
            "total_issues": 0,
            "by_severity": {"high": 0, "medium": 0, "low": 0},
            "by_type": {},
            "top_routes": [],
            "avg_dq_score": 0.0,
        }

    result = {
        "total_issues": 0,
        "by_severity": {"high": 0, "medium": 0, "low": 0},
        "by_type": {},
        "top_routes": [],
        "avg_dq_score": 0.0,
    }

    if issues is not None and not issues.is_empty():
        result["total_issues"] = issues.height
        for row in issues.to_dicts():
            sev = row.get("severity", "low")
            if sev in result["by_severity"]:
                result["by_severity"][sev] += 1

            itype = row.get("issue_type", "unknown")
            result["by_type"][itype] = result["by_type"].get(itype, 0) + 1

        # Count issues per route
        route_counts = issues.group_by("route_id").agg(
            pl.len().alias("issue_count")
        ).sort("issue_count", descending=True).head(5)
        result["top_routes"] = [
            {"route_id": r["route_id"], "issue_count": r["issue_count"]}
            for r in route_counts.to_dicts()
        ]

    if metrics is not None and not metrics.is_empty():
        result["avg_dq_score"] = round(float(metrics["data_quality_score"].mean()), 1)

    return result
