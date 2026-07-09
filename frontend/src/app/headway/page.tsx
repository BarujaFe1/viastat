"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { HeadwayDistribution } from "@/components/charts/headway-distribution";

interface RouteHeadway {
  route_id: string;
  route_short_name: string;
  median_headway: number | null;
  p90_headway: number | null;
  p95_headway: number | null;
  headway_cv: number | null;
  expected_headway: number;
}

export default function HeadwayPage() {
  const [headways, setHeadways] = useState<RouteHeadway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    api.routes().then(async (data) => {
      const routeList = data.routes;
      const results = await Promise.all(
        routeList.map(async (r) => {
          try {
            const s = await api.routeSummary(r.route_id);
            const m = (s.metrics as unknown as { median_headway: number | null; p90_headway: number | null; p95_headway: number | null; headway_cv: number | null }[]) || [];
            const avg = (arr: (number | null)[]) => {
              const valid = arr.filter((x): x is number => x !== null && x !== undefined);
              return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
            };
            return {
              route_id: r.route_id,
              route_short_name: r.route_short_name,
              median_headway: avg(m.map((x) => x.median_headway)),
              p90_headway: avg(m.map((x) => x.p90_headway)),
              p95_headway: avg(m.map((x) => x.p95_headway)),
              headway_cv: avg(m.map((x) => x.headway_cv)),
              expected_headway: r.expected_headway_minutes ?? 15,
            };
          } catch {
            return {
              route_id: r.route_id,
              route_short_name: r.route_short_name,
              median_headway: null,
              p90_headway: null,
              p95_headway: null,
              headway_cv: null,
              expected_headway: 15,
            };
          }
        })
      );
      setHeadways(results);
    })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Análise de Headway</h1>
      <p className="mb-6 text-slate-600">
        Distribuição e comparativo de headways observados por rota.
      </p>

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={fetchData} /></div>}

      {loading ? (
        <LoadingSkeleton variant="table" count={8} />
      ) : headways.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          Nenhum dado disponível. Execute o pipeline para gerar métricas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Rota</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Headway Mediano</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">P90</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">P95</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">CV</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Esperado</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Diferença</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {headways.map((h) => {
                const diff = h.median_headway !== null ? h.median_headway - h.expected_headway : null;
                return (
                  <tr key={h.route_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-slate-900">
                      {h.route_id}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      {h.median_headway?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      {h.p90_headway?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      {h.p95_headway?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      {h.headway_cv?.toFixed(2) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      {h.expected_headway}m
                    </td>
                    <td className={`px-4 py-3 text-center text-sm font-medium ${
                      diff !== null && diff > 5
                        ? "text-red-600"
                        : diff !== null && diff > 2
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}>
                      {diff !== null ? `${diff > 0 ? "+" : ""}${diff.toFixed(1)}m` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {headways.length > 0 && (
        <div className="mt-6">
          <HeadwayDistribution headways={headways.filter(h => h.median_headway !== null).map(h => h.median_headway as number)} />
        </div>
      )}

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        <strong>Headway esperado:</strong> Valor programado para cada rota (definido no dataset
        sintético). Diferenças positivas indicam headway observado maior que o esperado.
      </div>
    </div>
  );
}
