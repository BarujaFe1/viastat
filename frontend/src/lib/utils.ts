export function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  if (score >= 20) return "text-orange-600";
  return "text-red-600";
}

export function scoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-100 border-green-500";
  if (score >= 50) return "bg-yellow-100 border-yellow-500";
  if (score >= 20) return "bg-orange-100 border-orange-500";
  return "bg-red-100 border-red-500";
}

export function formatHeadway(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return "—";
  return `${minutes.toFixed(1)} min`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
