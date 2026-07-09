"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, RouteItem } from "@/lib/api";
import { scoreColor } from "@/lib/utils";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { RouteComparisonChart } from "@/components/charts/route-comparison-chart";
import { FilterBar, type FilterValue } from "@/components/ui/filter-bar";

const DATASET_DATES = [
  "2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04",
  "2026-06-05", "2026-06-06", "2026-06-07",
];

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>({});

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.routes({ date: filter.date, hour: filter.hour })
      .then((data) => setRoutes(data.routes || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter.date, filter.hour]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Comparação de Rotas</h1>

      <FilterBar dates={DATASET_DATES} onChange={setFilter} />

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={fetchData} /></div>}

      {loading ? (
        <LoadingSkeleton variant="table" count={8} />
      ) : routes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          Nenhuma rota disponível. Execute o pipeline de dados para gerar as métricas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Rota</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nome</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Confiabilidade</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Regularidade</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Qualidade do Dado</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {routes.map((r) => (
                <tr key={r.route_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm font-medium text-slate-900">
                    <Link href={`/routes/${r.route_id}`} className="text-blue-600 hover:text-blue-700">
                      {r.route_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.route_short_name}</td>
                  <td className={`px-4 py-3 text-center text-sm font-bold ${scoreColor(r.reliability_score)}`}>
                    {r.reliability_score.toFixed(1)}
                  </td>
                  <td className={`px-4 py-3 text-center text-sm font-bold ${scoreColor(r.regularity_score)}`}>
                    {r.regularity_score.toFixed(1)}
                  </td>
                  <td className={`px-4 py-3 text-center text-sm font-bold ${scoreColor(r.data_quality_score)}`}>
                    {r.data_quality_score.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {r.interpretable ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Interpretável
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Dados insuficientes
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {routes.length > 0 && (
        <div className="mt-6">
          <RouteComparisonChart routes={routes} />
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Scores em escala 0–100. Consulte a{" "}
        <Link href="/methodology" className="text-blue-600 hover:text-blue-700">
          metodologia
        </Link>{" "}
        para detalhes de cálculo.
      </p>
    </div>
  );
}
