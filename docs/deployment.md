# Deployment

Canonical production URL: **https://viastat-eight.vercel.app**  
Vercel team/project: **`baruja-fe/viastat`**  
GitHub: https://github.com/BarujaFe1/viastat

## Architecture on Vercel

Configured by root `vercel.json` as **Services**:

- Frontend: Next.js in `frontend/`
- Backend: FastAPI `backend.main:app`
- Demo data: tracked synthetic snapshot in `data/`

Rewrites:

- `/api/*`, `/health`, `/docs`, `/openapi.json` → backend
- everything else → frontend

Production frontend uses **same-origin** API calls (`NEXT_PUBLIC_API_URL` empty).

## Redeploy

```bash
npx vercel link --yes --scope baruja-fe --project viastat
npx vercel deploy --prod --yes --scope baruja-fe
```

## Local parity

```bash
# backend
uvicorn backend.main:app --reload --port 8000

# frontend
cd frontend
# optional: NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

## Environment

See root `.env.example`, `backend/.env.example`, `frontend/.env.example`.

Never commit `.env`, `.env.local`, or Vercel OIDC tokens.

## Notes

- Alias `viastat.vercel.app` may already be taken on another account; current canonical host is `viastat-eight.vercel.app`.
- Free-plan daily deployment quotas can block deploys; switch scope/team if needed.
