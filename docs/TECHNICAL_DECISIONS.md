# Technical decisions

## ADR-001 — Synthetic dataset instead of live AVL

**Decision:** Ship a seeded synthetic GTFS-like GPS dataset.  
**Why:** Reproducible demos, no PII, controlled anomalies for quality storytelling.  
**Trade-off:** Not a claim about a real city/operator; interviewers must hear that clearly.

## ADR-002 — Medallion Parquet (raw/bronze/silver/gold) with Polars

**Decision:** Use Polars + Parquet layers rather than a warehouse.  
**Why:** Fast local analytics, portable for Vercel Python service, clear data contracts.  
**Trade-off:** No interactive SQL warehouse; DuckDB was considered and removed as unused.

## ADR-003 — “Headway” = inter-ping interval per vehicle

**Decision:** Define headway as consecutive GPS ping delta for the same vehicle.  
**Why:** Matches available synthetic telemetry without inventing stop-arrival events.  
**Trade-off:** Transit practitioners may expect stop-level headway; UI/docs must label this as a telemetry cadence proxy.

## ADR-004 — Vercel Services monorepo (Next + FastAPI)

**Decision:** One project with rewrites for `/api/*`, `/health`, `/docs`.  
**Why:** Single Live Demo URL, same-origin browser calls, portfolio friction low.  
**Trade-off:** Python bundle size constraints; demo `data/` must stay bounded.

## ADR-005 — Explicit non-interpretable windows

**Decision:** Metrics can be marked non-interpretable; brief separates confident vs uncertain routes.  
**Why:** Core product thesis — responsible analytics over vanity dashboards.  
**Trade-off:** More UX complexity than a single green/red KPI.

## ADR-006 — Public lab API without auth

**Decision:** No authentication on the demo API.  
**Why:** Zero-friction Live Demo.  
**Trade-off:** Unacceptable for real AVL; documented anti-scope.

## ADR-007 — Gap threshold = 10 minutes

**Decision:** Align service default and pipeline classification around 10 minutes (above ~6 min cadence).  
**Why:** Avoid footguns from a 5-minute default that contradicted docs/pipeline.
