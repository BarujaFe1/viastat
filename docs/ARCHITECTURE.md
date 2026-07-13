# Architecture

## Purpose

ViaStat is an MVP **lab** that turns noisy public-transit GPS pings into auditable regularity, quality and reliability metrics — with explicit uncertainty and non-interpretable windows.

## High-level diagram

```text
Synthetic GPS / GTFS-like inputs (seed 42)
        │
        ▼
 scripts/generate + build_parquet_dataset
        │
        ▼
 data/raw → bronze → silver → gold (Parquet)
        │
        ▼
 FastAPI (backend.main:app)  ←── Polars loaders/services
        │
        ▼
 Next.js App Router UI (frontend/)
        │
        ▼
 Vercel Services (vercel.json rewrites /api → FastAPI)
```

## Layers

| Layer | Responsibility |
|-------|----------------|
| `scripts/` | Deterministic data generation + medallion pipeline |
| `data/` | Demo snapshot for Live Demo (synthetic only) |
| `backend/routers/` | HTTP surface |
| `backend/services/` | Loaders, metrics, quality, executive brief |
| `backend/schemas/` | Pydantic domain models (reference / future response models) |
| `frontend/src/app/` | Product screens |
| `frontend/src/components/` | Maps, charts, shared UI |
| `frontend/src/lib/` | Typed API client + domain types |

## API surface (selected)

- `GET /health`
- `GET /api/demo/metadata`
- `GET /api/network/summary`
- `GET /api/routes[/]` (+ per-route summary/headways/quality/geojson/stops/schedule-comparison)
- `GET /api/headway/summary`
- `GET /api/quality/issues|summary`
- `GET /api/brief[/]`
- `GET /api/pipeline/status`

## Design principles

1. **Lab only** — synthetic data, no individual surveillance framing.
2. **Uncertainty first** — scores can be non-interpretable; UI warns on insufficient data.
3. **Same-origin demo** — production frontend calls empty `NEXT_PUBLIC_API_URL` and relies on Vercel rewrites.
4. **Reproducibility** — seed 42 + tracked demo snapshot.
5. **Explainability** — methodology pages and executive brief limitations are first-class.

## Non-goals

- Real operator GTFS-RT ingestion
- Auth / multi-tenant SaaS
- Stop-level AVL headway certification
- Real-time streaming
