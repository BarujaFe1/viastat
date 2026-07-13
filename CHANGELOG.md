# Changelog — Portfolio S-tier pass (2026-07-13)

## Added

- `GET /api/network/geojson` — FeatureCollection with reliability scores (kills network map N+1)
- Playwright E2E critical path (`frontend/e2e/demo-path.spec.ts`)
- `/case-study` methodological visual narrative (3–5 min interview script)
- CI job for Playwright with local API + Next
- `docs/SCREENSHOTS.md`, `docs/PORTFOLIO_HANDOFF.md`

## Changed

- Network `MapView` uses single geojson request
- Homepage CTA includes Case study
- Navbar includes Case

## Fixed / verified

- Regression tests for network geojson + N+1 performance comparison
- Live Demo redeployed from merged `main` after this pass (see PORTFOLIO_HANDOFF for SHA/URL)
