import { scoreColor, scoreBgColor } from "@/lib/utils";

interface ScoreGaugeProps {
  label: string;
  value: number;
}

export function ScoreGauge({ label, value }: ScoreGaugeProps) {
  const color = scoreColor(value);
  const bg = scoreBgColor(value);

  return (
    <div className={`rounded-lg border-2 p-4 ${bg}`}>
      <p className="mb-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-3xl font-bold ${color}`}>{value.toFixed(0)}</p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${
            value >= 80 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : value >= 20 ? "bg-orange-500" : "bg-red-500"
          }`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {value >= 80 ? "Confiável" : value >= 50 ? "Moderado" : value >= 20 ? "Reduzido" : "Insuficiente"}
      </p>
    </div>
  );
}
