# Deploy (Vercel Lab)

ViaStat is deployed as a **Vercel Services** project:

- `frontend/` → Next.js 16
- `backend.main:app` → FastAPI
- `data/` → synthetic demo snapshot (seed 42)

Public routing:

- `/api/*`, `/health`, `/docs`, `/openapi.json` → backend
- everything else → frontend

Local parity:

```bash
# backend
uvicorn backend.main:app --reload --port 8000

# frontend
cd frontend
npm run dev
```

Production frontend uses same-origin API calls (`NEXT_PUBLIC_API_URL` empty), so browser requests hit the Vercel rewrites.
