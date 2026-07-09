"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { QualityIssue, QualitySummary } from "@/lib/types";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

const severityOrder = { high: 0, medium: 1, low: 2 };

export default function QualityPage() {
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [summary, setSummary] = useState<QualitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.qualityIssues(),
      api.qualitySummary(),
    ])
      .then(([i, s]) => {
        const sorted = [...(i.issues || [])].sort(
          (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
        );
        setIssues(sorted);
        setSummary(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Centro de Qualidade de Dados</h1>
      <p className="mb-6 text-slate-600">
        Problemas detectados no dataset de pings GPS, organizados por severidade.
      </p>

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={fetchData} /></div>}

      {loading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : summary && summary.total_issues > 0 ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mb-1 h-5 w-5 text-red-600" />
            <p className="text-2xl font-bold text-red-700">{summary.by_severity.high}</p>
            <p className="text-xs text-red-600">Alta severidade</p>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <AlertTriangle className="mb-1 h-5 w-5 text-yellow-600" />
            <p className="text-2xl font-bold text-yellow-700">{summary.by_severity.medium}</p>
            <p className="text-xs text-yellow-600">Média severidade</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <Info className="mb-1 h-5 w-5 text-blue-600" />
            <p className="text-2xl font-bold text-blue-700">{summary.by_severity.low}</p>
            <p className="text-xs text-blue-600">Baixa severidade</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-1 text-xs font-medium text-slate-500">DQ Score Médio</p>
            <p className="text-2xl font-bold text-slate-900">{summary.avg_dq_score.toFixed(1)}</p>
            <p className="text-xs text-slate-500">{summary.total_issues} issues totais</p>
          </div>
        </div>
      ) : null}

      {summary && summary.top_routes.length > 0 && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 font-semibold text-slate-900">Rotas com mais problemas</h2>
          <div className="flex flex-wrap gap-2">
            {summary.top_routes.map((r) => (
              <span
                key={r.route_id}
                className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
              >
                {r.route_id} ({r.issue_count} issues)
              </span>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton variant="text" count={4} />
      ) : issues.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          Nenhum problema de qualidade detectado. Execute o pipeline para auditar os dados.
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.issue_id}
              className={`rounded-lg border bg-white p-4 ${
                issue.severity === "high"
                  ? "border-red-300"
                  : issue.severity === "medium"
                    ? "border-yellow-300"
                    : "border-blue-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
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
                  </span>
                  <span className="ml-2 font-mono text-xs text-slate-400">
                    {issue.issue_id.slice(0, 8)}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{issue.route_id}</span>
              </div>
              <h3 className="mt-2 font-semibold text-slate-900">{issue.issue_type}</h3>
              <p className="mt-1 text-sm text-slate-600">{issue.explanation}</p>
              <div className="mt-2 flex gap-4 text-xs text-slate-500">
                <span>{issue.affected_rows} registros afetados</span>
                <span>Métrica: {issue.affected_metric}</span>
              </div>
              {issue.example_record && Object.keys(issue.example_record).length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">
                    Ver exemplo
                  </summary>
                  <pre className="mt-1 max-h-32 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-600">
                    {JSON.stringify(issue.example_record, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Nota:</strong> As issues são detectadas e sinalizadas sem remover
        os registros originais. Isso permite auditoria completa do pipeline.
      </div>
    </div>
  );
}
