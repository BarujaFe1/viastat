# Deploy (Vercel Lab)

ViaStat is deployed as a **Vercel Services** project on team **`baruja-fe`**:

- `frontend/` → Next.js 16
- `backend.main:app` → FastAPI
- `data/` → synthetic demo snapshot (seed 42)

Public routing:

- `/api/*`, `/health`, `/docs`, `/openapi.json` → backend
- everything else → frontend

## Live Demo

- **Production:** https://viastat-eight.vercel.app
- **Inspect:** https://vercel.com/baruja-fe/viastat
- **GitHub:** https://github.com/BarujaFe1/viastat

Production frontend uses same-origin API calls (`NEXT_PUBLIC_API_URL` empty), so browser requests hit the Vercel rewrites.

## Local parity

```bash
# backend
uvicorn backend.main:app --reload --port 8000

# frontend
cd frontend
npm run dev
```

## Redeploy

```bash
npx vercel deploy --prod --yes --scope baruja-fe
```

Project link (already set in `.vercel/project.json`):

```bash
npx vercel link --yes --scope baruja-fe --project viastat
```
