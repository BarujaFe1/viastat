# Screenshot capture guide (lab only · no PII)

Canonical assets live under `assets/screenshots/` and `assets/social-preview.png`.

## Required shots

| File | Route | What to show |
|------|-------|--------------|
| `01-home.png` | `/` | Brand + Live Demo CTA + lab banner |
| `02-network.png` | `/network` | KPIs + map colored by reliability + legend |
| `03-routes.png` | `/routes` | Route comparison table |
| `04-route-detail-r07.png` | `/routes/R07` | Map with pings/gaps (noisy route) |
| `05-quality.png` | `/quality` | Issues list |
| `06-brief.png` | `/brief` | Executive brief + limitations |
| `07-case-study.png` | `/case-study` | Methodological visual narrative |

## How to capture

1. Run local stack or open https://viastat-eight.vercel.app
2. Desktop viewport ≥1280px; hide personal browser chrome
3. Confirm no real operator names / personal data (synthetic only)
4. Prefer light theme as shipped
5. After quality-pass deploy, refresh `02-network.png` to show single-request map (legend visible)

## Social preview

`assets/social-preview.png` — use for GitHub repo social image when configuring Open Graph.
