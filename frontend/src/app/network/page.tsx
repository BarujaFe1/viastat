"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import type { NetworkSummary } from "@/lib/types";
import { scoreColor } from "@/lib/utils";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { FilterBar, type FilterValue } from "@/components/ui/filter-bar";
import { Bus, Activity, ShieldCheck, BarChart3 } from "lucide-react";

const MapView = dynamic(() => import("@/components/map/map-view").then((m) => m.MapView), { ssr: false });

const DATASET_DATES = [
  "2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04",
  "2026-06-05", "2026-06-06", "2026-06-07",
];

export default function NetworkPage() {
  const [summary, setSummary] = useState<NetworkSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>({});

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.networkSummary({ date: filter.date, hour: filter.hour })
      .then(setSummary)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter.date, filter.hour]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Visão Geral da Rede</h1>

      <FilterBar dates={DATASET_DATES} onChange={setFilter} />

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={fetchData} /></div>}

      {loading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Bus className="mb-2 h-5 w-5 text-blue-600" />
            <p className="text-2xl font-bold text-slate-900">
              {summary?.total_routes ?? "—"}
            </p>
            <p className="text-sm text-slate-500">Rotas monitoradas</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Activity className="mb-2 h-5 w-5 text-blue-600" />
            <p className="text-2xl font-bold text-slate-900">
              {summary?.total_pings?.toLocaleString() ?? "—"}
            </p>
            <p className="text-sm text-slate-500">Total de pings</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <ShieldCheck className="mb-2 h-5 w-5 text-blue-600" />
            <p className={`text-2xl font-bold ${scoreColor(summary?.avg_data_quality_score ?? 0)}`}>
              {summary?.avg_data_quality_score?.toFixed(1) ?? "—"}
            </p>
            <p className="text-sm text-slate-500">Qualidade do dado (média)</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <BarChart3 className="mb-2 h-5 w-5 text-blue-600" />
            <p className={`text-2xl font-bold ${scoreColor(summary?.avg_reliability_score ?? 0)}`}>
              {summary?.avg_reliability_score?.toFixed(1) ?? "—"}
            </p>
            <p className="text-sm text-slate-500">Confiabilidade (média)</p>
          </div>
        </div>
      )}

      <div className="mb-6 h-[400px] overflow-hidden rounded-lg border border-slate-200">
        <MapView />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        {summary ? (
          <p>
            Período analisado: {summary.period.start} a {summary.period.end} ·{" "}
            {summary.total_vehicles} veículos simulados
          </p>
        ) : (
          <p>Carregando dados da rede...</p>
        )}
      </div>

      <div className="mt-4">
        <Link
          href="/routes"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Ver comparação detalhada de rotas →
        </Link>
      </div>
    </div>
  );
}
