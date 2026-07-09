import type {
  NetworkSummary, RouteMetric, QualityIssue, ExecutiveBrief, DemoMetadata,
  Stop, PipelineStatus, QualitySummary, ScheduleComparisonItem,
} from "./types";

// Empty string = same-origin (Vercel Live Demo via rewrites).
// Local default remains the FastAPI port unless NEXT_PUBLIC_API_URL is set.
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:8000");

async function fetchJSON<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = API_BASE
    ? new URL(`${API_BASE}${path}`)
    : new URL(path, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  health: () => fetchJSON<{ status: string }>("/health"),

  demoMetadata: () => fetchJSON<DemoMetadata>("/api/demo/metadata"),

  networkSummary: (params?: { date?: string; hour?: string }) =>
    fetchJSON<NetworkSummary>("/api/network/summary", params),

  routes: (params?: { date?: string; hour?: string }) =>
    fetchJSON<{ routes: RouteItem[] }>("/api/routes/", params),

  routeSummary: (id: string, params?: { date?: string; hour?: string }) =>
    fetchJSON<{ route_id: string; metrics: RouteMetric[] }>(`/api/routes/${id}/summary`, params),

  routeHeadways: (id: string) =>
    fetchJSON<{ route_id: string; headways: number[] }>(`/api/routes/${id}/headways`),

  routeQuality: (id: string) =>
    fetchJSON<{ route_id: string; issues: QualityIssue[] }>(`/api/routes/${id}/quality`),

  routeGeojson: (id: string) =>
    fetchJSON<{ route_id: string; geojson: unknown; pings: unknown[]; gaps: unknown[] }>(`/api/routes/${id}/geojson`),

  routeStops: (id: string) =>
    fetchJSON<{ route_id: string; stops: Stop[] }>(`/api/routes/${id}/stops`),

  routeScheduleComparison: (id: string) =>
    fetchJSON<{ route_id: string; comparisons: ScheduleComparisonItem[] }>(`/api/routes/${id}/schedule-comparison`).then(r => r.comparisons),

  qualityIssues: () => fetchJSON<{ issues: QualityIssue[] }>("/api/quality/issues"),

  qualitySummary: () => fetchJSON<QualitySummary>("/api/quality/summary"),

  pipelineStatus: () => fetchJSON<PipelineStatus>("/api/pipeline/status"),

  brief: () => fetchJSON<ExecutiveBrief>("/api/brief/"),
};

export interface RouteItem {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  reliability_score: number;
  regularity_score: number;
  data_quality_score: number;
  interpretable: boolean;
  expected_headway_minutes?: number;
}
