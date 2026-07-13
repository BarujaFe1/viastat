"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    title: "1. Problema",
    body: "AVL/GPS chega com duplicatas, gaps, coordenadas inválidas e cobertura irregular. Publicar KPI sem auditar qualidade cria falsa certeza.",
  },
  {
    title: "2. Pipeline",
    body: "Raw → bronze → silver → gold (Parquet/Polars). Anomalias controladas com seed 42 tornam o lab reproduzível e discutível em entrevista.",
  },
  {
    title: "3. Qualidade primeiro",
    body: "Issues explícitos (duplicatas, gaps >10 min, velocidade impossível). Janelas com poucos pings ficam não interpretáveis.",
  },
  {
    title: "4. Métricas honestas",
    body: "Headway neste lab = intervalo entre pings do mesmo veículo (proxy de telemetria), não headway de parada. Scores combinam cobertura + qualidade.",
  },
  {
    title: "5. Comunicação",
    body: "Brief executivo separa rotas confiáveis vs incertas, lista limitações e evita linguagem acusatória sobre pessoas.",
  },
];

export default function CaseStudyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10" data-testid="case-study-page">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
        Case study metodológico
      </p>
      <h1 className="font-display mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
        De GPS ruidoso a KPI interpretável
      </h1>
      <p className="mb-8 text-slate-600">
        Roteiro visual de 3–5 minutos para entrevistas de analytics engineering / dados /
        full-stack analítico. Lab only · dados sintéticos.
      </p>

      <ol className="space-y-4">
        {STEPS.map((step) => (
          <li
            key={step.title}
            className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm"
          >
            <h2 className="font-semibold text-slate-900">{step.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-800">Demo guiada sugerida</p>
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li>
            Abrir <Link className="text-blue-700 underline" href="/network">Rede</Link> — mapa
            colorido por confiabilidade (1 request GeoJSON).
          </li>
          <li>
            Abrir <Link className="text-blue-700 underline" href="/quality">Qualidade</Link> —
            mostrar issues antes de confiar no KPI.
          </li>
          <li>
            Abrir <Link className="text-blue-700 underline" href="/brief">Relatório</Link> —
            limitações e rotas incertas.
          </li>
          <li>
            Abrir <Link className="text-blue-700 underline" href="/methodology">Metodologia</Link>{" "}
            — trade-off do headway como telemetria.
          </li>
        </ol>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/network"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Ir para a demo <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/methodology"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Metodologia completa
        </Link>
      </div>
    </div>
  );
}
