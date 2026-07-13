"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bus, ArrowRight, Database, ShieldCheck, BarChart3, FlaskConical } from "lucide-react";
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
    api
      .demoMetadata()
      .then(setMeta)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10 text-center">
        <Bus className="mx-auto mb-4 h-12 w-12 text-blue-700" aria-hidden />
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
          <FlaskConical className="h-3.5 w-3.5" aria-hidden />
          MVP Lab · dados sintéticos · seed 42
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          ViaStat
        </h1>
        <p className="mt-2 text-lg text-slate-600">Mobilidade Auditada</p>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
          Transforma pings GPS ruidosos de transporte público em métricas auditáveis de
          regularidade, qualidade e confiabilidade — com incerteza explícita e janelas
          não interpretáveis.
        </p>
      </div>

      {loading && <LoadingSkeleton variant="text" count={3} />}
      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {meta && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
          <span className="font-medium text-slate-800">Dataset demo:</span> {meta.description} —{" "}
          {meta.routes} rotas, {meta.days} dias, seed {meta.seed}
          {meta.total_pings != null ? ` · ${meta.total_pings.toLocaleString()} pings` : ""}.
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <ShieldCheck className="mb-2 h-6 w-6 text-blue-700" aria-hidden />
          <h3 className="font-semibold text-slate-900">Qualidade do Dado</h3>
          <p className="mt-1 text-sm text-slate-500">
            Auditoria de pings: duplicatas, gaps, coordenadas inválidas e velocidades
            impossíveis.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <BarChart3 className="mb-2 h-6 w-6 text-blue-700" aria-hidden />
          <h3 className="font-semibold text-slate-900">Regularidade</h3>
          <p className="mt-1 text-sm text-slate-500">
            Headway mediano, p90/p95, CV e score de regularidade por rota e janela horária.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <Database className="mb-2 h-6 w-6 text-blue-700" aria-hidden />
          <h3 className="font-semibold text-slate-900">Confiabilidade</h3>
          <p className="mt-1 text-sm text-slate-500">
            Score explicável que combina cobertura, gaps, duplicatas e volume de dados.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/network"
          className="flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-white transition-colors hover:bg-blue-800"
        >
          Abrir Live Demo <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/brief"
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-slate-700 transition-colors hover:bg-slate-50"
        >
          Relatório Executivo
        </Link>
        <Link
          href="/case-study"
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-slate-700 transition-colors hover:bg-slate-50"
        >
          Case study (3–5 min)
        </Link>
        <Link
          href="/methodology"
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-slate-700 transition-colors hover:bg-slate-50"
        >
          Metodologia
        </Link>
      </div>

      <div
        className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        role="note"
      >
        <strong>Lab only · dados sintéticos.</strong> Métricas demonstrativas com anomalias
        controladas. Não representam operação real e não devem ser usadas para vigilância
        individual.
      </div>
    </div>
  );
}
