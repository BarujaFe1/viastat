# Metodologia

## Dados Utilizados

O ViaStat utiliza um dataset sintético reproduzível gerado com seed fixa (42). O conjunto contém:

- 10 rotas simuladas na região de São Paulo
- 7 dias de operação (1 a 7 de junho de 2026)
- Pings GPS a cada 15-60 segundos com variação controlada
- Horários de pico (6-9h, 17-20h) com mais veículos
- Horário noturno (0-5h) com menos veículos
- Anomalias controladas por rota

## Pipeline

1. **Raw** — Entrada original (CSV, GeoJSON, JSON)
2. **Bronze** — Dados padronizados em Parquet com schema fixo
3. **Silver** — Dados limpos com flags de qualidade
4. **Gold** — Agregados analíticos prontos para API

## Métricas

### Headway

Intervalo entre pings consecutivos de um mesmo veículo.

### Coverage Score (0-100)

Razão entre pings observados e pings esperados na janela: `100 × min(1, ping_count / expected_pings)`. O volume esperado é estimado por rota/hora (mais intenso em horário de pico, mais raso à noite).

### Regularity Score (0-100)

Baseado no coeficiente de variação (CV) do headway. Quanto menor o CV, mais regular o serviço.

### Data Quality Score (0-100)

Composição de:
- Duplicatas (30%)
- Coordenadas inválidas (20%)
- Velocidades impossíveis (20%)
- Timestamps fora de ordem (15%)
- Gaps (15%)

### Reliability Score (0-100)

Composição de:
- Cobertura (30%)
- Gaps (20%)
- Duplicatas (15%)
- Volume de pings (15%)
- Consistência temporal (10%)
- Data Quality Score (10%)

## Quando não interpretar

Uma janela é marcada como não interpretável quando:
- Menos de 10 pings na janela
- Coverage Score abaixo de 30%
- Taxa de duplicatas acima de 50%
