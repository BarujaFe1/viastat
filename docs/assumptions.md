# Premissas do Projeto

## Premissas do Dataset Sintético

1. Os pings são gerados em intervalos pseudo-aleatórios dentro de cada hora
2. A posição de cada veículo ao longo da rota é estimada linearmente
3. As rotas são simplificadas (Linestring com ~20 pontos)
4. Os headways esperados são definidos por rota e variam por horário
5. Anomalias são inseridas deterministicamente com base na seed

## Premissas Analíticas

1. Headway é calculado como diferença entre pings consecutivos do mesmo veículo
2. Janelas são de 1 hora fixa (0-1, 1-2, ..., 23-0)
3. Um gap relevante é definido como >10 minutos sem ping (acima da cadência normal de ~6 min)
4. Velocidade >120 km/h é considerada impossível para ônibus urbano
5. Coordenada (0,0) é considerada inválida

## Limitações Conhecidas

1. Os dados são sintéticos — não representam operação real
2. O recorte de 1 semana não captura sazonalidade
3. Há um `schedule.csv` sintético para comparação exploratória observado vs. esperado; não é GTFS oficial nem programação real de operador
4. As rotas são simplificadas geograficamente
5. Os scores são indicadores exploratórios, não certificações
6. “Headway” neste lab = intervalo entre pings do mesmo veículo (telemetria), não headway de parada
