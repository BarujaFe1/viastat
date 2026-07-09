"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bus, ArrowRight, Database, ShieldCheck, BarChart3 } from "lucide-react";
import { api } from "@/lib/api";
import type { DemoMetadata } from "@/lib/types";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function HomePage() {
  const [meta, setMeta] = useState<DemoMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    api.demoMetadata()
      .then(setMeta)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <Bus className="mx-auto mb-4 h-12 w-12 text-blue-600" />
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          ViaStat
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Mobilidade Auditada
        </p>
        <p className="mt-4 max-w-2xl mx-auto text-base text-slate-500">
          Plataforma analítica para auditar a regularidade, qualidade e
          confiabilidade de dados de transporte público a partir de pings GPS
          ruidosos.
        </p>
      </div>

      {loading && <LoadingSkeleton variant="text" count={3} />}
      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {meta && (
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Dataset:</span>{" "}
          {meta.description} — {meta.routes} rotas, {meta.days} dias, seed{" "}
          {meta.seed}.
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <ShieldCheck className="mb-2 h-6 w-6 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Qualidade do Dado</h3>
          <p className="mt-1 text-sm text-slate-500">
            Auditoria de pings: duplicatas, gaps, coordenadas inválidas e
            velocidades impossíveis.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <BarChart3 className="mb-2 h-6 w-6 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Regularidade</h3>
          <p className="mt-1 text-sm text-slate-500">
            Headway mediano, p90/p95, CV e score de regularidade por rota e
            janela horária.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <Database className="mb-2 h-6 w-6 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Confiabilidade</h3>
          <p className="mt-1 text-sm text-slate-500">
            Score explicável que combina cobertura, gaps, duplicatas e volume
            de dados.
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Link
          href="/network"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          Ver Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/methodology"
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-slate-700 transition-colors hover:bg-slate-50"
        >
          Metodologia
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>⚠ Dados sintéticos demonstrativos.</strong> As métricas
        apresentadas são baseadas em um dataset gerado artificialmente com
        anomalias controladas. Não representam operação real de transporte
        público.
      </div>
    </div>
  );
}
