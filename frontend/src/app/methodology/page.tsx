"use client";

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Metodologia e Limites</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Dados Utilizados</h2>
        <p className="mb-2 text-sm text-slate-600">
          O ViaStat utiliza um <strong>dataset sintético reproduzível</strong> gerado
          com seed fixa (42). O conjunto contém:
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>10 rotas simuladas na região de São Paulo</li>
          <li>7 dias de operação</li>
          <li>Pings GPS a cada 15–60 segundos com variação controlada</li>
          <li>Horários de pico (6–9h, 17–20h) com mais veículos</li>
          <li>Anomalias controladas por rota (duplicatas, gaps, etc.)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Pipeline</h2>
        <ol className="list-inside list-decimal space-y-1 text-sm text-slate-600">
          <li><strong>Raw:</strong> Entrada original (CSV, GeoJSON, JSON)</li>
          <li><strong>Bronze:</strong> Dados padronizados em Parquet com schema fixo</li>
          <li><strong>Silver:</strong> Dados limpos com flags de qualidade</li>
          <li><strong>Gold:</strong> Agregados analíticos prontos para API</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Métricas</h2>

        <div className="mb-4">
          <h3 className="font-semibold text-slate-800">Headway</h3>
          <p className="text-sm text-slate-600">
            Intervalo entre pings consecutivos de um mesmo veículo.
            <code className="ml-1 rounded bg-slate-100 px-1 py-0.5 text-xs">
              headway_i = timestamp_i - timestamp_{`{i-1}`}
            </code>
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-slate-800">Coverage Score (0–100)</h3>
          <p className="text-sm text-slate-600">
            Razão entre pings observados e pings esperados na janela:
            <code className="ml-1 rounded bg-slate-100 px-1 py-0.5 text-xs">
              100 × min(1, ping_count / expected_pings)
            </code>
            . O esperado é estimado por rota/hora (mais intenso em horário de pico).
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-slate-800">Regularity Score (0–100)</h3>
          <p className="text-sm text-slate-600">
            Baseado no coeficiente de variação (CV) do headway:
            <code className="ml-1 rounded bg-slate-100 px-1 py-0.5 text-xs">
              100 × (1 − min(1, CV / 1.5))
            </code>
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-slate-800">Data Quality Score (0–100)</h3>
          <p className="text-sm text-slate-600">
            Ponderação de duplicatas (30%), coordenadas inválidas (20%), velocidades
            impossíveis (20%), timestamps fora de ordem (15%) e gaps (15%).
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-slate-800">Reliability Score (0–100)</h3>
          <p className="text-sm text-slate-600">
            Ponderação de cobertura (30%), gaps (20%), duplicatas (15%), volume de pings
            (15%), consistência temporal (10%) e Data Quality Score (10%).
            <strong className="ml-1">Abaixo de 10 pings por janela, o score é automaticamente rebaixado.</strong>
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Quando não interpretar</h2>
        <p className="mb-2 text-sm text-slate-600">
          Uma janela é marcada como <strong>não interpretável</strong> quando:
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>Menos de 10 pings na janela</li>
          <li>Coverage Score abaixo de 30%</li>
          <li>Taxa de duplicatas acima de 50%</li>
        </ul>
        <p className="mt-2 text-sm text-slate-600">
          Nestes casos, as métricas de regularidade são exibidas com aviso de
          confiabilidade reduzida.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Limites do Projeto</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>Dados sintéticos: não representam operação real</li>
          <li>1 semana de recorte: não permite análise de sazonalidade</li>
          <li>10 rotas: não cobre uma cidade inteira</li>
          <li>Scores são indicadores exploratórios, não certificações</li>
          <li>Não há vigilância individual de motoristas</li>
          <li>Não há claims acusatórios contra operadores</li>
          <li>Não há previsão de chegada ou recomendação operacional</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Antiescopo</h2>
        <p className="text-sm text-slate-600">
          O ViaStat <strong>não</strong> é uma ferramenta de:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>Detecção de fraude ou incompetência</li>
          <li>Vigilância individual de condutores</li>
          <li>Ranking de desempenho de motoristas</li>
          <li>Denúncia de órgãos públicos</li>
          <li>Substituto de sistemas de tempo real</li>
        </ul>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>⚠ Responsabilidade analítica:</strong> O objetivo do ViaStat é
        auditar a qualidade do dado antes de gerar conclusões. Métricas e scores
        são instrumentos de investigação exploratória, não verdades absolutas.
        Decisões operacionais ou regulatórias não devem ser baseadas
        exclusivamente neste dashboard.
      </section>
    </div>
  );
}
