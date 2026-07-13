# ViaStat — Audit Report (Portfolio Quality Pass)

**Date:** 2026-07-13  
**Branch:** `chore/portfolio-quality-pass`  
**Live Demo:** https://viastat-eight.vercel.app  
**Repo:** https://github.com/BarujaFe1/viastat

## Executive summary

ViaStat is already a strong portfolio lab: clear responsible-analytics story, synthetic reproducible data (seed 42), FastAPI + Next.js 16 + Polars/Parquet, Live Demo on Vercel Services, and solid backend pytest coverage (49 tests). The gaps that hurt a “reviewer-proof” read were: no CI, no frontend tests, network map not colored by reliability, methodology/copy mismatched to real ping cadence (~6 min), silent map failures, weak a11y, unused deps/schemas, and docs that still mentioned temporary tunnels / contradictions about schedule data.

**Current score (pre-pass):** **7.2 / 10**  
**Target after this pass:** **8.5–9.0 / 10**

## Main risks

| Risk | Severity | Notes |
|------|----------|-------|
| Demo depends on tracked synthetic `data/` | Medium | Intentional for Vercel; keep size bounded |
| Public API without auth | Low (lab) | Declared anti-scope; do not add real PII |
| CORS credentials + Vercel regex | Low | Acceptable for public lab |
| Map N+1 geojson fetches | Medium | UX latency on `/network` |
| Headway page N+1 summaries | Medium | Unnecessary API storm |
| Docs/code cadence mismatch | Medium | Misleads technical interviewers |
| No CI | Medium | Regressions can land unnoticed |

## Quick wins

1. Inject `reliability_score` into map GeoJSON features (coloring).
2. Surface map load errors instead of swallowing them.
3. Align methodology/UI copy with ~6 min ping cadence.
4. Add GitHub Actions (pytest + frontend lint/build).
5. Basic a11y: `role="alert"`, `aria-current`, mobile nav.
6. Remove unused `@tanstack/react-table` and `duckdb`.
7. Load demo metadata from `data/raw/metadata.json`.
8. Empty network summary should not hardcode `total_routes: 10`.

## Structural improvements

- Add `/api/headway/summary` from gold `headway_analysis` (kill N+1).
- Document architecture, ADRs, testing, deployment.
- Portfolio README with interview narrative.
- Wire or document Pydantic response models (partial wiring where high-value).
- Gap threshold default aligned to 10 minutes (pipeline contract).

## Bugs found (pre-fix)

1. Network map always styled as score≈50 (no `reliability_score` on features).
2. Map `.catch(() => {})` hides failures.
3. Methodology claims 15–60s pings; generator emits ~10 pings/vehicle/hour.
4. `detect_gaps` default threshold 5.0 vs pipeline/docs 10.0; unused `gap_seconds`.
5. Assumptions said “no scheduled GTFS” while schedule comparison exists.
6. Empty `network/summary` returned hardcoded 10 routes.
7. Demo metadata hardcoded vs `metadata.json`.
8. Zero `aria-*` / `role` in frontend.
9. Dead deps: TanStack Table, duckdb in pyproject.
10. No CI workflows.

## Execution plan

1. Diagnose + write this report  
2. Run pytest / lint / build  
3. Fix bugs + add tests  
4. Architecture/DX/CI/docs  
5. UX polish (nav, errors, homepage storytelling)  
6. README + HANDOFF  
7. Commit + push branch  

## Final checklist

- [x] Project installs / tests green locally (52 pytest)
- [x] Frontend lint + typecheck + build green
- [x] Bugs above fixed in this pass
- [x] CI added
- [x] Docs created/updated
- [x] README portfolio-grade
- [x] `.env.example` present
- [x] `.gitignore` protects secrets
- [x] HANDOFF written
- [ ] Branch pushed

**Post-pass score estimate:** **8.7 / 10**
