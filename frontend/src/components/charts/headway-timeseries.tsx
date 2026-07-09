"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface HeadwayTimeSeriesProps {
  data: { hour_window: number; median_headway: number | null }[];
}

export function HeadwayTimeSeries({ data }: HeadwayTimeSeriesProps) {
  if (!data.length) return null;

  const chartData = Array.from({ length: 24 }, (_, i) => {
    const match = data.find((d) => d.hour_window === i);
    return {
      hour: `${i}h`,
      headway: match?.median_headway ?? null,
    };
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Headway por Hora do Dia</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="headway"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            connectNulls
            name="Headway Mediano (min)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
