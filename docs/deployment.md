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

## Current status

- GitHub: https://github.com/BarujaFe1/viastat
- Vercel project linked: `barujafe1s-projects/viastat`
- Production deploy blocked once by free-plan daily deployment quota
- Temporary public Live Demo (Cloudflare quick tunnel over local proxy):
  - https://representation-mpg-reflect-stylus.trycloudflare.com

### Temporary tunnel (lab fallback)

```bash
# terminals
uvicorn backend.main:app --host 127.0.0.1 --port 8123
cd frontend && set NEXT_PUBLIC_API_URL= && npx next dev --port 3010
node scripts/demo-proxy.js
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:3080
```

### Resume Vercel production

```bash
npx vercel deploy --prod --yes --scope barujafe1s-projects
```
