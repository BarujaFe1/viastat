# Portfolio Handoff — ViaStat S-tier pass

**Date:** 2026-07-13  
**Branch:** `chore/portfolio-quality-pass` → merge `main`  
**Canonical Live Demo:** https://viastat-eight.vercel.app  
**Repo:** https://github.com/BarujaFe1/viastat

## Summary

This pass closed the three explicit gaps from the previous quality handoff:

1. **N+1 GeoJSON** eliminated via `GET /api/network/geojson`
2. **Playwright E2E** for home → network map → case study
3. **Merge + production redeploy** so the public demo matches `main`

Plus a methodological visual case study at `/case-study` for interview demos.

## Before / after

| Item | Before | After |
|------|--------|-------|
| Network map fetches | 1× `/api/routes` + N× `/geojson` | 1× `/api/network/geojson` |
| E2E | none | 3 Playwright tests (chromium) |
| Public demo vs branch | Live on older `main` | Redeployed from merged tip |
| Interview narrative | docs only | `/case-study` interactive script |
| Pytest | 52 | 54 (+ geojson contract + perf) |

### Latency evidence (local TestClient)

- Bundled `/api/network/geojson`: **~58 ms** (10 features)
- N+1 (`/api/routes` + 10× `/geojson`): **~288 ms**
- Ratio: ~**5×** faster bundled path (`test_network_geojson_faster_than_n_plus_one`)

## Commands

```bash
python -m pytest -q
cd frontend && npm run lint && npm run typecheck && npm run build
# with API :8000 and Next :3000
cd frontend && npm run test:e2e
npx vercel deploy --prod --yes --scope baruja-fe
```

## Gates

- Pytest: **54 passed**
- ESLint / tsc / next build: **pass**
- Playwright: **3 passed**
- Live smoke after deploy: `/`, `/network`, `/health`, `/api/network/geojson`, `/case-study`

## Limitations

- Lab / synthetic data only (seed 42)
- Headway = inter-ping telemetry, not stop-level AVL
- Public API unauthenticated (intentional)
- Route detail map still loads per-route geojson+pings (acceptable)
- Screenshot `07-case-study.png` may need refresh after deploy (see `docs/SCREENSHOTS.md`)
- Alias `viastat.vercel.app` unavailable; keep `viastat-eight.vercel.app`

## Next steps

1. Keep CI green on `main`
2. Optional: regenerate screenshots including case study
3. Portfolio card integration via supermegaprompt file (outside repo)
4. Future: public GTFS/OpenBus ingestion without losing uncertainty thesis

## Recommendation

**Destaque / selecionado** for analytics engineering + data product + full-stack analytical roles — not “enterprise production platform.”
