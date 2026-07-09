from typing import Optional
import polars as pl


def generate_brief(metrics: Optional[pl.DataFrame], quality: Optional[pl.DataFrame]) -> dict:
    if metrics is None or metrics.is_empty():
        return {
            "title": "Relatório Executivo — ViaStat",
            "summary": "Dados não processados. Execute o pipeline para gerar o relatório.",
            "confident_routes": [],
            "uncertain_routes": [],
            "insufficient_data_routes": [],
            "alerts": [],
            "limitations": [],
            "next_steps": ["Executar pipeline de dados", "Gerar dataset sintético"],
        }

    routes_with_scores = metrics.group_by("route_id").agg(
        pl.mean("reliability_score").alias("avg_reliability"),
        pl.mean("regularity_score").alias("avg_regularity"),
        pl.mean("coverage_score").alias("avg_coverage"),
        pl.mean("data_quality_score").alias("avg_dq"),
        pl.sum("ping_count").alias("total_pings"),
    )

    confident = routes_with_scores.filter(pl.col("avg_reliability") >= 70)
    uncertain = routes_with_scores.filter(
        (pl.col("avg_reliability") >= 20) & (pl.col("avg_reliability") < 70)
    )
    insufficient = routes_with_scores.filter(pl.col("avg_reliability") < 20)

    alerts = []
    if quality is not None and not quality.is_empty():
        high_severity = quality.filter(pl.col("severity") == "high")
        if high_severity.height > 0:
            alerts.append(
                f"{high_severity.height} issues de alta severidade detectadas."
            )

    avg_reliability = float(routes_with_scores.select(pl.mean("avg_reliability")).item())

    if avg_reliability >= 70:
        summary = (
            "Os dados indicam que é possível analisar regularidade com confiança "
            "moderada na maior parte das rotas."
        )
    elif avg_reliability >= 40:
        summary = (
            "Parte das rotas apresenta dados suficientes para análise, "
            "mas algumas têm confiabilidade reduzida."
        )
    else:
        summary = (
            "Os dados disponíveis não permitem conclusões robustas sobre "
            "regularidade na maior parte das rotas."
        )

    return {
        "title": "Relatório Executivo — ViaStat",
        "summary": summary,
        "confident_routes": [r["route_id"] for r in confident.to_dicts()],
        "uncertain_routes": [r["route_id"] for r in uncertain.to_dicts()],
        "insufficient_data_routes": [r["route_id"] for r in insufficient.to_dicts()],
        "alerts": alerts,
        "limitations": [
            "Dataset sintético com anomalias controladas; não representa operação real.",
            "Métricas baseadas em recorte de 1 semana.",
            "Reliability score é indicador exploratório, não certificação.",
            "Headway observado pode diferir do headway programado real.",
        ],
        "next_steps": [
            "Validar com dados públicos reais (ex: OpenBus SP).",
            "Expandir análise para múltiplas semanas.",
            "Comparar headway observado com GTFS programado.",
        ],
    }
