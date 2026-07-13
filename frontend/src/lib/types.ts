export interface Route {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  direction: string;
  expected_headway_minutes: number;
}

export interface NetworkSummary {
  total_routes: number;
  total_pings: number;
  total_vehicles: number;
  avg_reliability_score: number;
  avg_data_quality_score: number;
  avg_coverage_score: number;
  period: { start: string; end: string };
}

export interface RouteMetric {
  route_id: string;
  date: string;
  hour_window: number;
  ping_count: number;
  active_vehicle_count: number;
  median_headway: number | null;
  p90_headway: number | null;
  p95_headway: number | null;
  headway_cv: number | null;
  missing_ping_rate: number | null;
  coverage_score: number;
  regularity_score: number;
  data_quality_score: number;
  reliability_score: number;
  interpretable: boolean;
}

export interface QualityIssue {
  issue_id: string;
  batch_id: string;
  route_id: string;
  issue_type: string;
  severity: "low" | "medium" | "high";
  affected_rows: number;
  affected_metric: string;
  example_record: Record<string, unknown>;
  explanation: string;
}

export interface ExecutiveBrief {
  title: string;
  summary: string;
  confident_routes: string[];
  uncertain_routes: string[];
  insufficient_data_routes: string[];
  alerts: string[];
  limitations: string[];
  next_steps: string[];
}

export interface DemoMetadata {
  name: string;
  version: string;
  routes: number;
  days: number;
  seed: number;
  description: string;
  anomalies: string[];
  total_pings?: number | null;
  region?: string | null;
}

export interface Stop {
  stop_id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
  route_id: string;
  sequence: number;
}

export interface LayerStatus {
  pings?: number;
  routes?: number;
  stops?: number;
  schedule_records?: number;
  pings_clean?: number;
  quality_issues?: number;
  route_metrics?: number;
  headway_analysis?: number;
  size_bytes?: number;
}

export interface PipelineStatus {
  batch_id: string | null;
  generated_at: string | null;
  layers: {
    raw?: LayerStatus;
    bronze?: LayerStatus;
    silver?: LayerStatus;
    gold?: LayerStatus;
  };
  anomalies: string[];
  seed: number;
  period: { start: string; end: string };
}

export interface QualitySummary {
  total_issues: number;
  by_severity: { high: number; medium: number; low: number };
  by_type: Record<string, number>;
  top_routes: { route_id: string; issue_count: number }[];
  avg_dq_score: number;
}

export interface ScheduleComparison {
  route_id: string;
  comparisons: ScheduleComparisonItem[];
}

export interface ScheduleComparisonItem {
  date: string;
  hour_window: number;
  expected_headway: number;
  observed_median_headway: number | null;
  diff_minutes: number | null;
}
