# ViaStat — Case Study de Portfólio

## Headline

**ViaStat — Auditoria estatística de regularidade e qualidade de dados em transporte público**

## Resumo

Produto analítico que transforma pings GPS ruidosos em métricas auditáveis de regularidade, cobertura, gaps, headway e confiabilidade por rota. Comunica incerteza e evita conclusões frágeis.

## Problema

Dados de mobilidade urbana têm pings faltantes, duplicatas, coordenadas inválidas e velocidades impossíveis. Dashboards cívicos ignoram a qualidade do dado e comunicam métricas como verdade absoluta.

## Solução

Pipeline analítico com quatro camadas (raw → bronze → silver → gold) que detecta e sinaliza problemas antes de calcular métricas. Score de confiabilidade explicável com flags para dados insuficientes.

## Habilidades Demonstradas

- **Polars + Parquet**: Pipeline completo de dados
- **Dados geoespaciais**: GeoJSON, Leaflet, coordenadas GPS
- **Qualidade de dados**: Pipeline de auditoria com flags
- **Métricas estatísticas**: Headway, CV, p90/p95, bootstrap
- **FastAPI + Pydantic**: Schemas fortes, OpenAPI automático
- **Next.js + React + TypeScript + Tailwind**: Dashboard completo
- **Mapa interativo**: Leaflet com camadas de qualidade
- **UX cívica responsável**: Linguagem, metodologia, antiescopo
- **Documentação técnica**: README + 5 docs complementares
- **Testes**: Testes determinísticos com seed fixa

## Impacto no Portfólio

Este projeto demonstra capacidade de:

- Construir produto analítico do zero
- Trabalhar com dados maiores que CSV pequeno (Parquet)
- Modelar dados geoespaciais
- Comunicar incerteza de forma responsável
- Construir pipeline de qualidade de dados
- Criar dashboard cívico com responsabilidade analítica
