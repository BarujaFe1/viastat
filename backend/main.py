from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import CORS_ORIGINS, CORS_ORIGIN_REGEX
from backend.routers import health, demo, network, routes, quality, brief, pipeline

app = FastAPI(
    title="ViaStat API",
    description="Mobilidade Auditada — API de métricas de regularidade e qualidade de dados de transporte público",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(demo.router, prefix="/api/demo")
app.include_router(network.router, prefix="/api/network")
app.include_router(routes.router, prefix="/api/routes")
app.include_router(quality.router, prefix="/api/quality")
app.include_router(brief.router, prefix="/api/brief")
app.include_router(pipeline.router, prefix="/api/pipeline")
