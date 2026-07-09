"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PipelineStatus } from "@/lib/types";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Database, FileDown, FileSearch, BarChart3, CheckCircle2 } from "lucide-react";

const layerConfig = [
  { key: "raw" as const, icon: FileDown, label: "Raw", color: "text-slate-500", bg: "bg-slate-100", desc: "Entrada original (CSV, GeoJSON, JSON)" },
  { key: "bronze" as const, icon: FileSearch, label: "Bronze", color: "text-amber-600", bg: "bg-amber-100", desc: "Dados padronizados em Parquet" },
  { key: "silver" as const, icon: Database, label: "Silver", color: "text-blue-600", bg: "bg-blue-100", desc: "Dados limpos com flags de qualidade" },
  { key: "gold" as const, icon: BarChart3, label: "Gold", color: "text-green-600", bg: "bg-green-100", desc: "Agregados analíticos prontos para API" },
];

export default function PipelinePage() {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    api.pipelineStatus()
      .then(setStatus)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Pipeline de Dados</h1>
      <p className="mb-8 text-slate-600">
        Do dado bruto ao dashboard auditável — cada etapa do pipeline ViaStat.
      </p>

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={fetchData} /></div>}

      {loading ? (
        <LoadingSkeleton variant="text" count={6} />
      ) : status ? (
        <>
          <div className="relative mb-8">
            {layerConfig.map((layer, i) => {
              const Icon = layer.icon;
              const layerData = status.layers[layer.key];
              const counts = layerData ? Object.entries(layerData).filter(([k]) => k !== "size_bytes") : [];
              const isLast = i === layerConfig.length - 1;

              return (
                <div key={layer.key} className="mb-6 flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${layer.bg}`}>
                      <Icon className={`h-6 w-6 ${layer.color}`} />
                    </div>
                    {!isLast && <div className="mt-1 h-full w-px bg-slate-300" />}
                  </div>
                  <div className={`flex-1 rounded-lg border bg-white p-4 ${isLast ? "border-green-300 bg-green-50" : "border-slate-200"}`}>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${layer.color}`}>{layer.label}</h3>
                      {isLast && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{layer.desc}</p>
                    {counts.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                        {counts.map(([key, val]) => (
                          <span key={key}>
                            <strong>{key.replace(/_/g, " ")}:</strong>{" "}
                            {typeof val === "number" ? val.toLocaleString() : val}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-2 font-semibold text-slate-900">Metadados</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
              <span><strong>Seed:</strong> {status.seed}</span>
              <span><strong>Anomalias:</strong> {status.anomalies.join(", ")}</span>
              <span><strong>Período:</strong> {status.period.start} a {status.period.end}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          Pipeline não executado. Execute os scripts de geração de dados primeiro.
        </div>
      )}
    </div>
  );
}
