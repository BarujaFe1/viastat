"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface HeadwayDistributionProps {
  headways: number[];
}

export function HeadwayDistribution({ headways }: HeadwayDistributionProps) {
  if (!headways.length) return null;

  // Build histogram bins
  const max = Math.ceil(Math.max(...headways));
  const binSize = Math.max(1, Math.ceil(max / 15));
  const bins: Record<string, number> = {};
  for (let i = 0; i <= max; i += binSize) {
    const label = `${i}-${i + binSize}`;
    bins[label] = 0;
  }
  headways.forEach((h) => {
    const binIdx = Math.min(Math.floor(h / binSize), Math.floor(max / binSize));
    const label = `${binIdx * binSize}-${(binIdx + 1) * binSize}`;
    bins[label] = (bins[label] || 0) + 1;
  });

  const data = Object.entries(bins).map(([range, count]) => ({ range, count }));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Distribuição de Headway</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="range" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
