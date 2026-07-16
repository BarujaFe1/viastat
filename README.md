<div align="center">
  <img src="./assets/icon.png" alt="ViaStat Logo" width="120" height="120" />

  <h1>ViaStat</h1>

  <p><strong>Mobilidade auditada — regularidade, qualidade e confiabilidade a partir de pings GPS ruidosos.</strong></p>
  <p><strong>Audited mobility — regularity, quality and reliability from noisy public-transit GPS pings.</strong></p>

  <p>
    <a href="#pt-br">PT-BR</a> ·
    <a href="#en">English</a> ·
    <a href="#live-demo">Live Demo</a> ·
    <a href="#stack--tecnologias">Stack</a> ·
    <a href="#arquitetura--architecture">Architecture</a> ·
    <a href="#quick-start--início-rápido">Quick Start</a> ·
    <a href="#autor--author">Author</a>
  </p>

  <p>
    <a href="https://viastat-eight.vercel.app"><img alt="Live Demo" src="https://img.shields.io/badge/Live%20Demo-viastat--eight.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" /></a>
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-React-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img alt="Python" src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" />
    <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-API-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
    <img alt="Leaflet" src="https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
    <img alt="Lab Demo" src="https://img.shields.io/badge/Status-Lab%20demo-2563EB?style=for-the-badge" />
    <img alt="MIT" src="https://img.shields.io/badge/License-MIT-111827?style=for-the-badge" />
  </p>

  <p>
    <a href="https://viastat-eight.vercel.app"><strong>Live Demo</strong></a> ·
    <a href="https://github.com/BarujaFe1/viastat"><strong>Repositório</strong></a> ·
    <a href="https://barujafe.vercel.app/"><strong>Portfólio</strong></a> ·
    <a href="https://www.linkedin.com/in/barujafe/"><strong>LinkedIn</strong></a>
  </p>
</div>

<p align="center">
  <img src="./assets/hero-cover.png" alt="ViaStat overview" width="100%" />
</p>

---

<a id="pt-br"></a>

## PT-BR

## Visão geral

**ViaStat (Mobilidade Auditada)** transforma pings GPS ruidosos de transporte público em métricas auditáveis de regularidade, qualidade e confiabilidade, com incerteza explícita. MVP lab com Live Demo + FastAPI/Next.js.

> **Aviso de lab:** demo de portfólio com dados sintéticos/amostra. Não é produto em produção com SLA, integrações reais de clientes ou garantia operacional.

---

## Problema

GPS de ônibus é ruidoso e incompleto. Sem pipeline auditável, indicadores de regularidade viram números opacos.

---

## Para quem

- Analistas de mobilidade urbana
- Engenheiros de dados de transporte
- Gestores públicos avaliando qualidade de serviço (contexto lab)

---

## Funcionalidades

- Pipeline bronze/silver/gold
- Métricas de regularidade/qualidade/confiabilidade
- Mapa (Leaflet) por confiabilidade
- Brief metodológico
- Dados sintéticos GTFS-like
- Testes pytest + Playwright e2e

---

## Escopo e limites

- **É:** lab analítico com dados sintéticos reproduzíveis.
- **Não é:** operação de cidade real, AVL production, SLA de transporte público.

---

<a id="en"></a>

## English

## Overview

**ViaStat (Audited Mobility)** turns noisy public-transit GPS pings into auditable regularity, quality and reliability metrics with explicit uncertainty. MVP lab with Live Demo + FastAPI/Next.js.

> **Lab notice:** portfolio demo with synthetic/sample data. Not a production product with SLA, real customer integrations, or operational guarantees.

---

## Problem

Bus GPS is noisy and incomplete. Without an auditable pipeline, regularity indicators become opaque numbers.

---

## Who it is for

- Urban mobility analysts
- Transit data engineers
- Public managers exploring service quality (lab context)

---

## Features

- Bronze/silver/gold pipeline
- Regularity/quality/reliability metrics
- Leaflet map by reliability
- Methodological brief
- Synthetic GTFS-like data
- pytest + Playwright e2e

---

## Scope and limits

- **Is:** analytical lab with reproducible synthetic data.
- **Is not:** real-city operations, production AVL, public-transit SLA.

---

<a id="live-demo"></a>

## Live Demo

**URL:** [https://viastat-eight.vercel.app](https://viastat-eight.vercel.app)

Demo hospedada para avaliação de portfólio / Hosted for portfolio review.

> Lab demo — synthetic / sample data unless noted. Not a production SLA product.

---

<a id="stack--tecnologias"></a>

## Stack / Tecnologias

| Tecnologia | Uso no projeto |
|---|---|
| Next.js 16 / React 19 / TypeScript / Tailwind | Frontend |
| Leaflet / react-leaflet / Recharts / Lucide | Mapa e charts |
| FastAPI / Pydantic / Uvicorn | API |
| Polars / NumPy | Processamento |
| Pytest / Playwright | Testes |

---

<a id="arquitetura--architecture"></a>

## Arquitetura / Architecture

ackend/ FastAPI + rontend/ Next.js + camadas data/ + scripts/ de geração sintética e docs de auditoria.

`	xt
viastat/
├── backend/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── frontend/
│   ├── src/
│   └── e2e/
├── data/
│   ├── raw/ bronze/ silver/ gold/
├── scripts/
├── tests/
├── docs/
├── assets/
└── vercel.json
`

---

<a id="quick-start--início-rápido"></a>

## Quick Start / Início rápido

### Pré-requisitos / Requirements

- Node.js 20+
- Python 3.12+
- npm

### Clonar / Clone

`ash
git clone https://github.com/BarujaFe1/viastat.git
cd viastat
`

### Backend

`ash
pip install -r requirements.txt -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
`

### Frontend

`ash
cd frontend
npm ci
npm run dev
`

Abra http://localhost:3000

`ash
# testes
pytest
cd frontend && npm run lint && npm run typecheck
# e2e: API :8000 + Next :3000
cd frontend && npm run test:e2e:install && npm run test:e2e
`


---

## Technical decisions / Decisões técnicas

- **Sintético vs real:** demo segura e reproduzível; não afirma operação de cidade real.
- **Polars** para pipeline tabular eficiente.
- **Incerteza explícita** nas métricas de confiabilidade.
- **Leaflet** para mapa de rede por confiabilidade.

---

## Roadmap

### Implementado
- Pipeline, métricas, mapa, brief, Live Demo Vercel, testes

### Planejado
- Mais indicadores de headway
- Comparativos entre dias
- Empacotamento de dataset gold

---

<a id="autor--author"></a>

## Autor / Author

Developed by **Felipe Alirio Baruja**.

- **Portfolio:** [https://barujafe.vercel.app/](https://barujafe.vercel.app/)
- **GitHub:** [github.com/BarujaFe1](https://github.com/BarujaFe1)
- **LinkedIn:** [linkedin.com/in/barujafe](https://www.linkedin.com/in/barujafe/)
- **Repository:** [github.com/BarujaFe1/viastat](https://github.com/BarujaFe1/viastat)

---

## License / Licença

MIT License.

See [LICENSE](./LICENSE) for details.

---

<div align="center">
  <p><strong>ViaStat</strong></p>
  <p>Mobilidade com métricas auditáveis — lab sintético.</p>
  <p><em>Mobility with auditable metrics — synthetic lab.</em></p>
</div>
