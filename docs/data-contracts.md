# Contratos de Dados

## Camada Raw

### raw_pings.csv
| Campo | Tipo | Descrição |
|-------|------|-----------|
| ping_id | string | Identificador único |
| vehicle_id | string | Identificador do veículo |
| route_id | string | Código da rota |
| timestamp | datetime (ISO 8601) | Momento do ping |
| latitude | float | Latitude (-90 a 90) |
| longitude | float | Longitude (-180 a 180) |
| speed | float | Velocidade em km/h |
| bearing | float | Rumo em graus (0-360) |
| source | string | "synthetic" |

### routes.geojson
FeatureCollection com rotas como LineString.

## Camada Bronze

### pings.parquet
Schema fixo (mesmo do raw) em formato Parquet colunar.

## Camada Silver

### pings_clean.parquet
Adiciona colunas de qualidade:
- is_duplicate (bool)
- has_invalid_coord (bool)
- has_impossible_speed (bool)
- has_out_of_order_ts (bool)
- gap_minutes_after (float)
- quality_flags (string[])

### quality_issues.parquet
Registro de cada problema de qualidade detectado.

## Camada Gold

### route_metrics.parquet
Métricas agregadas por (route_id, date, hour_window).

### headway_analysis.parquet
Resumo por rota dos headways e scores.

### data_quality_summary.parquet
Summary dos problemas de qualidade.
