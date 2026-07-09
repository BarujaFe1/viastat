"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import type { RouteMetric, QualityIssue } from "@/lib/types";
import { ScoreGauge } from "@/components/charts/score-gauge";
import { InsufficientDataWarning } from "@/components/ui/insufficient-data-warning";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { HeadwayTimeSeries } from "@/components/charts/headway-timeseries";
import type { ScheduleComparisonItem } from "@/lib/types";

const RouteMapView = dynamic(() => import("@/components/map/route-map-view").then((m) => m.RouteMapView), { ssr: false });

export default function RouteDetailPage() {
  const { route_id } = useParams<{ route_id: string }>();
  const [metrics, setMetrics] = useState<RouteMetric[]>([]);
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [scheduleComp, setScheduleComp] = useState<ScheduleComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    if (!route_id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.routeSummary(route_id).then((d) => setMetrics(d.metrics || [])),
      api.routeQuality(route_id).then((d) => setIssues(d.issues || [])),
      api.routeScheduleComparison(route_id).then(setScheduleComp).finally(() => setScheduleLoading(false)),
    ])
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [route_id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const avgMetric = metrics.length > 0
    ? {
        reliability: metrics.reduce((s, m) => s + m.reliability_score, 0) / metrics.length,
        regularity: metrics.reduce((s, m) => s + m.regularity_score, 0) / metrics.length,
        quality: metrics.reduce((s, m) => s + m.data_quality_score, 0) / metrics.length,
        coverage: metrics.reduce((s, m) => s + m.coverage_score, 0) / metrics.length,
      }
    : null;

  // Avoid flashing the warning while the first fetch is still in flight.
  const hasInsufficientData =
    !loading && (!metrics.length || (avgMetric !== null && avgMetric.reliability < 20));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link href="/routes" className="text-sm text-blue-600 hover:text-blue-700">
          ← Voltar para rotas
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Rota {route_id}</h1>
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={fetchData} /></div>}

      <InsufficientDataWarning visible={hasInsufficientData} routeId={route_id} />

      {loading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreGauge label="Confiabilidade" value={avgMetric?.reliability ?? 0} />
          <ScoreGauge label="Regularidade" value={avgMetric?.regularity ?? 0} />
          <ScoreGauge label="Qualidade do Dado" value={avgMetric?.quality ?? 0} />
          <ScoreGauge label="Cobertura" value={avgMetric?.coverage ?? 0} />
        </div>
      )}

      <div className="mb-6 h-[400px] overflow-hidden rounded-lg border border-slate-200">
        <RouteMapView routeId={route_id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Métricas por Janela</h2>
          {loading ? (
            <LoadingSkeleton variant="table" count={6} />
          ) : metrics.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma métrica disponível.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 text-left font-semibold text-slate-700">Hora</th>
                    <th className="px-2 py-1 text-right font-semibold text-slate-700">Pings</th>
                    <th className="px-2 py-1 text-right font-semibold text-slate-700">Headway</th>
                    <th className="px-2 py-1 text-right font-semibold text-slate-700">P90</th>
                    <th className="px-2 py-1 text-right font-semibold text-slate-700">CV</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-2 py-1 text-slate-600">{m.hour_window}h</td>
                      <td className="px-2 py-1 text-right text-slate-600">{m.ping_count}</td>
                      <td className="px-2 py-1 text-right text-slate-600">
                        {m.median_headway?.toFixed(1) ?? "—"}m
                      </td>
                      <td className="px-2 py-1 text-right text-slate-600">
                        {m.p90_headway?.toFixed(1) ?? "—"}m
                      </td>
                      <td className="px-2 py-1 text-right text-slate-600">
                        {m.headway_cv?.toFixed(2) ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Headway por Hora</h2>
          {loading || scheduleLoading ? (
            <LoadingSkeleton variant="text" count={3} />
          ) : metrics.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum dado disponível.</p>
          ) : (
            <HeadwayTimeSeries data={metrics} />
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Comparação com Programado</h2>
          {scheduleLoading ? (
            <LoadingSkeleton variant="table" count={6} />
          ) : scheduleComp.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum comparativo disponível.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 text-left font-semibold text-slate-700">Hora</th>
                    <th className="px-2 py-1 text-right font-semibold text-slate-700">Programado</th>
                    <th className="px-2 py-1 text-right font-semibold text-slate-700">Observado</th>
                    <th className="px-2 py-1 text-right font-semibold text-slate-700">Diferença</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleComp.map((s, i) => {
                    const diff = s.observed_median_headway !== null ? s.observed_median_headway - s.expected_headway : null;
                    return (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-2 py-1 text-slate-600">{s.hour_window}h</td>
                        <td className="px-2 py-1 text-right text-slate-600">{s.expected_headway.toFixed(1)}m</td>
                        <td className="px-2 py-1 text-right text-slate-600">
                          {s.observed_median_headway?.toFixed(1) ?? "—"}m
                        </td>
                        <td className={`px-2 py-1 text-right font-medium ${
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
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Problemas de Qualidade</h2>
          {loading ? (
            <LoadingSkeleton variant="text" count={3} />
          ) : issues.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum problema detectado.</p>
          ) : (
            <ul className="space-y-2">
              {issues.map((issue) => (
                <li key={issue.issue_id} className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      issue.severity === "high"
                        ? "bg-red-100 text-red-700"
                        : issue.severity === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {issue.severity}
                  </span>{" "}
                  <span className="font-medium text-slate-800">{issue.issue_type}</span>
                  <p className="mt-1 text-slate-500">{issue.explanation}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
