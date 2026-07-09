from fastapi import APIRouter

router = APIRouter()

@router.get("/metadata")
async def demo_metadata():
    return {
        "name": "ViaStat Synthetic Dataset",
        "version": "0.1.0",
        "routes": 10,
        "days": 7,
        "seed": 42,
        "description": "Dataset sintético reproduzível para demonstrar a plataforma ViaStat.",
        "anomalies": [
            "duplicatas", "coordenadas inválidas", "gaps de sinal",
            "velocidades impossíveis", "timestamps fora de ordem",
            "headway irregular", "baixa cobertura",
        ],
    }
