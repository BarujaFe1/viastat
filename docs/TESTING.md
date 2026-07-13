# Testing

## Backend (pytest)

```bash
# from repo root, with venv activated
pip install -r requirements.txt -r backend/requirements.txt
python -m pytest -q
```

Coverage focus:

- API contracts (`tests/backend/test_api.py`)
- Services / brief language (`tests/backend/test_services.py`)
- Pipeline metrics/quality/gold/generator (`tests/pipeline/`)

Notes:

- Tests expect the demo snapshot under `data/` (tracked for Live Demo).
- Prefer TestClient against `backend.main:app` for HTTP contracts.

## Frontend

```bash
cd frontend
npm ci
npm run lint
npm run typecheck
npm run build
```

There is no Jest/Vitest suite yet; regressions are caught by TypeScript + ESLint + production build in CI.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs:

1. Python 3.12 + pytest  
2. Node 20 + lint + typecheck + build  

## Manual smoke (Live Demo / local)

1. `GET /` homepage  
2. `GET /network` map + KPIs  
3. `GET /health`  
4. `GET /api/routes/` and `/api/headway/summary`  
5. Route detail map (`/routes/R01`)
