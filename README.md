# ViaStat

**Mobilidade Auditada** — lab analítico que transforma pings GPS ruidosos de transporte público em métricas auditáveis de regularidade, qualidade e confiabilidade, com incerteza explícita.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-viastat--eight.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://viastat-eight.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-BarujaFe1%2Fviastat-181717?style=for-the-badge&logo=github)](https://github.com/BarujaFe1/viastat)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/BarujaFe1/viastat/actions)

<p align="center">
  <img src="./assets/hero-cover.png" alt="ViaStat product overview" width="100%" />
</p>

> **Lab only.** Dataset sintético (seed 42). Não é operação real. Não use para vigilância individual.

---

## Problema real

Dados de AVL/GPS de ônibus chegam com duplicatas, gaps, coordenadas inválidas, velocidades impossíveis e cobertura irregular. Dashboards cívicos frequentemente publicam KPIs como verdade absoluta — sem auditar a qualidade do dado nem marcar janelas não interpretáveis.

## Solução

O **ViaStat** é um MVP lab full-stack que:

1. Gera um dataset sintético reproduzível com anomalias controladas  
2. Processa raw → bronze → silver → gold (Parquet / Polars)  
3. Expõe métricas via **FastAPI**  
4. Visualiza rede, rotas, headway, qualidade e brief executivo em **Next.js**  
5. Comunica limitações e incerteza de forma explícita  

**Live Demo:** https://viastat-eight.vercel.app

---

## Principais funcionalidades

- Visão de rede com KPIs e mapa colorido por confiabilidade  
- Comparativo de rotas e detalhe por rota (pings, gaps, paradas)  
- Análise de headway (proxy de cadência de telemetria por veículo)  
- Painel de qualidade de dados e issues  
- Relatório executivo determinístico (sem linguagem acusatória)  
- Metodologia e pipeline documentados  
- Snapshot demo pronto para Vercel Services  

<p align="center">
  <img src="./assets/screenshots/01-home.png" alt="ViaStat Home" width="100%" />
</p>

---

## Arquitetura

```text
Synthetic GPS (seed 42)
   → scripts/generate + build_parquet_dataset
   → data/raw|bronze|silver|gold
   → FastAPI (Polars)
   → Next.js UI
   → Vercel Services (same-origin /api rewrites)
```

Detalhes: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · decisões: [`docs/TECHNICAL_DECISIONS.md`](docs/TECHNICAL_DECISIONS.md)

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Leaflet, Recharts |
| Backend | FastAPI, Pydantic v2, Uvicorn |
| Dados | Polars, Parquet (medallion) |
| Deploy | Vercel Services |
| Testes | Pytest (+ ESLint / `tsc` / `next build` no CI) |

---

## Demo local

### Pré-requisitos

- Node.js 20+
- Python 3.12+
- Git

### Variáveis de ambiente

Copie [`.env.example`](.env.example). Também existem `backend/.env.example` e `frontend/.env.example`.

| Variável | Uso |
|----------|-----|
| `VIASTAT_DATA_DIR` | Raiz dos dados (default `./data`) |
| `VIASTAT_CORS_ORIGINS` | Origins locais |
| `VIASTAT_SEED` | Seed do gerador |
| `NEXT_PUBLIC_API_URL` | Vazio em produção (same-origin); local opcional `http://localhost:8000` |

### Comandos

```bash
# 1) Backend
python -m venv backend/.venv
backend\.venv\Scripts\activate          # Windows
# source backend/.venv/bin/activate     # Linux/macOS
pip install -r requirements.txt -r backend/requirements.txt

# (opcional) regenerar dados
python scripts/generate_synthetic_gtfs_like_data.py
python scripts/build_parquet_dataset.py

uvicorn backend.main:app --reload --port 8000

# 2) Frontend (outro terminal)
cd frontend
npm ci
npm run dev
```

Abra http://localhost:3000 — API em http://localhost:8000/docs.

---

## Testes

```bash
# backend
python -m pytest -q

# frontend
cd frontend
npm run lint
npm run typecheck
npm run build
```

Guia: [`docs/TESTING.md`](docs/TESTING.md) · CI: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## Decisões técnicas e trade-offs

- **Sintético vs real:** demo segura e reproduzível; não afirma operação de cidade real.  
- **Headway = intervalo entre pings do mesmo veículo:** proxy de telemetria, não headway de parada.  
- **Vercel Services monorepo:** uma URL pública; bundle Python e tamanho de `data/` são limites.  
- **API pública sem auth:** ok para lab; anti-scope para produto real.  
- **Incerteza explícita:** mais UX, menos vanity KPI.  

Mais em [`docs/TECHNICAL_DECISIONS.md`](docs/TECHNICAL_DECISIONS.md).

---

## Roadmap

- [ ] Ingestão opcional de GTFS/GTFS-RT públicos  
- [ ] Agregação geojson de rede em um único endpoint (evitar N+1)  
- [ ] Testes e2e Playwright no smoke do Live Demo  
- [ ] Cobertura de testes frontend para client API  
- [ ] Alias custom de domínio quando disponível  

## Status atual

- **Produção:** https://viastat-eight.vercel.app (time `baruja-fe`)  
- **Repo:** https://github.com/BarujaFe1/viastat  
- **Deploy:** [`docs/deployment.md`](docs/deployment.md)  
- **Auditoria desta pass:** [`docs/AUDIT_REPORT.md`](docs/AUDIT_REPORT.md)

---

## O que este projeto demonstra

- Pipeline de dados com contratos e anomalias controladas  
- API analytics com FastAPI + Polars  
- Dashboard de mobilidade com mapa, charts e brief  
- Comunicação responsável de incerteza  
- DX: `.env.example`, CI, docs de arquitetura/testes/deploy  
- Critério de produto: lab de portfólio, não “fake SaaS”  

---

## Como eu apresentaria em entrevista

1. **Problema:** KPIs de mobilidade sem auditoria de qualidade.  
2. **Tese:** métrica só é útil se a janela for interpretável.  
3. **Demo:** abrir Live Demo → Rede (mapa por confiabilidade) → Qualidade → Brief.  
4. **Trade-off honesto:** headway aqui é cadência de ping, não AVL de parada.  
5. **Engenharia:** medallion Parquet, Services na Vercel, pytest + CI.  
6. **Próximo passo:** dados públicos reais (ex.: OpenBus) sem perder a narrativa de incerteza.

Case study: [`docs/portfolio-case-study.md`](docs/portfolio-case-study.md)

---

## Autor

**Felipe Alirio Baruja** · [GitHub](https://github.com/BarujaFe1)

## Licença

MIT — ver [`LICENSE`](LICENSE).
