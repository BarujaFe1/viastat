"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ExecutiveBrief } from "@/lib/types";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function BriefPage() {
  const [brief, setBrief] = useState<ExecutiveBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    api.brief()
      .then(setBrief)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <LoadingSkeleton variant="text" count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorBanner message={error} onRetry={fetchData} />
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          Execute o pipeline para gerar o relatório executivo.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">{brief.title}</h1>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Resumo</h2>
        <p className="text-slate-600">{brief.summary}</p>
      </div>

      {brief.alerts.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-2 font-semibold text-amber-800">Alertas</h3>
          <ul className="list-inside list-disc text-sm text-amber-700">
            {brief.alerts.map((alert, i) => (
              <li key={i}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="font-semibold text-green-800">Rotas Confiáveis</h3>
          {brief.confident_routes.length > 0 ? (
            <ul className="mt-1 list-inside list-disc text-sm text-green-700">
              {brief.confident_routes.map((r) => <li key={r}>{r}</li>)}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-green-600">Nenhuma</p>
          )}
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="font-semibold text-yellow-800">Incerteza Moderada</h3>
          {brief.uncertain_routes.length > 0 ? (
            <ul className="mt-1 list-inside list-disc text-sm text-yellow-700">
              {brief.uncertain_routes.map((r) => <li key={r}>{r}</li>)}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-yellow-600">Nenhuma</p>
          )}
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="font-semibold text-red-800">Dados Insuficientes</h3>
          {brief.insufficient_data_routes.length > 0 ? (
            <ul className="mt-1 list-inside list-disc text-sm text-red-700">
              {brief.insufficient_data_routes.map((r) => <li key={r}>{r}</li>)}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-red-600">Nenhuma</p>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Limitações desta análise</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
          {brief.limitations.map((lim, i) => (
            <li key={i}>{lim}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Próximas investigações sugeridas</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
          {brief.next_steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>⚠ Responsabilidade analítica:</strong> Este relatório é baseado em
        dados sintéticos demonstrativos. As métricas são indicadores exploratórios,
        não certificações. Não é possível concluir sobre a operação real de
        transporte público a partir deste recorte.
      </div>
    </div>
  );
}
