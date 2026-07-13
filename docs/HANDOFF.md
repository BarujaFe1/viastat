# Handoff — Portfolio Quality Pass

**Branch:** `chore/portfolio-quality-pass`  
**Date:** 2026-07-13  
**Repo:** BarujaFe1/viastat  
**Live Demo (canonical):** https://viastat-eight.vercel.app

## What was found

- Strong lab already: FastAPI + Next.js 16 + Polars/Parquet, synthetic seed 42, good pytest base, Vercel Services demo.
- Gaps: no CI; network map not colored by reliability; silent map errors; methodology claimed 15–60s pings vs ~6 min reality; assumptions contradicted schedule feature; headway page N+1; unused TanStack Table / duckdb; weak a11y; stock frontend README; system fonts.

## What was fixed / improved

| Area | Change |
|------|--------|
| Map | Inject `reliability_score` into GeoJSON features; legend; loading/error UX |
| Route map | Error banner + retry instead of swallowed failures |
| Headway | New `GET /api/headway/summary` + UI single fetch |
| Demo metadata | Reads `data/raw/metadata.json` |
| Network empty | `total_routes: 0` (no fake 10) |
| Gaps | Default threshold aligned to 10 minutes |
| Docs | Cadence + headway definition + schedule assumption corrected |
| A11y | `role="alert"`, `aria-current`, mobile nav menu, table scopes |
| UX | Homepage/typography (Source Sans/Serif), filter note on network map |
| DX | Root `.env.example`, `npm run typecheck`, removed dead deps |
| API typing | Pydantic `response_model` on network/demo/headway |
| CI | `.github/workflows/ci.yml` |
| Docs | AUDIT, ARCHITECTURE, TECHNICAL_DECISIONS, TESTING, DEPLOYMENT, README rewrite |

## Commands run

```bash
python -m pytest -q                 # 52 passed
cd frontend && npm run lint         # clean after hook fix
cd frontend && npm run typecheck
cd frontend && npm run build
```

## Tests executed

- Backend: 52 pytest (added headway summary + demo metadata + network contract smoke)
- Frontend: ESLint, `tsc --noEmit`, `next build`

## Still missing / residual risks

- Map still N+1 fetches geojson per route (latency on `/network`)
- No Playwright e2e / frontend unit tests
- Production deploy of this branch not done in this pass (docs/code only until merged + redeploy)
- Public unauthenticated API (intentional lab anti-scope)
- GeoJSON sample caps (500 pings / 50 gaps) not yet disclosed in UI
- `viastat.vercel.app` alias unavailable; keep `viastat-eight.vercel.app`

## Next steps

1. Open PR from `chore/portfolio-quality-pass` → `main`
2. Confirm CI green on GitHub Actions
3. Merge + `npx vercel deploy --prod --scope baruja-fe`
4. Optional: single network geojson endpoint; Playwright smoke
5. Portfolio card update (separate prompt / repo)

## Portfolio suggestions

- Lead with Live Demo + “uncertainty first” thesis in interviews
- Call out headway-as-telemetry trade-off unprompted (shows maturity)
- Point reviewers at `docs/TECHNICAL_DECISIONS.md` and Brief page

## Suggested commit message

```text
chore: improve portfolio quality, docs, tests and stability
```
