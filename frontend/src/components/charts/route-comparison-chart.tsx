"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface RouteComparisonChartProps {
  routes: {
    route_id: string;
    route_short_name: string;
    reliability_score: number;
    regularity_score: number;
    data_quality_score: number;
  }[];
}

export function RouteComparisonChart({ routes }: RouteComparisonChartProps) {
  if (!routes.length) return null;

  const data = routes.map((r) => ({
    name: r.route_short_name || r.route_id,
    Confiabilidade: r.reliability_score,
    Regularidade: r.regularity_score,
    "Qualidade do Dado": r.data_quality_score,
  }));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Comparação de Scores por Rota</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Confiabilidade" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Regularidade" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Qualidade do Dado" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
