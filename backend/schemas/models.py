from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class Route(BaseModel):
    route_id: str
    route_short_name: str
    route_long_name: str
    direction: str
    expected_headway_minutes: float
    active: bool = True


class VehiclePing(BaseModel):
    ping_id: str
    vehicle_id: str
    route_id: str
    timestamp: datetime
    latitude: float
    longitude: float
    speed: Optional[float] = None
    bearing: Optional[float] = None
    source: str = "synthetic"


class RouteTimeWindowMetric(BaseModel):
    route_id: str
    date: str
    hour_window: int
    ping_count: int
    active_vehicle_count: int
    median_headway: Optional[float] = None
    p90_headway: Optional[float] = None
    p95_headway: Optional[float] = None
    headway_cv: Optional[float] = None
    missing_ping_rate: Optional[float] = None
    coverage_score: float = 0.0
    regularity_score: float = 0.0
    data_quality_score: float = 0.0
    reliability_score: float = 0.0
    interpretable: bool = False


class QualityIssue(BaseModel):
    issue_id: str
    batch_id: str
    route_id: str
    issue_type: str
    severity: str
    affected_rows: int
    affected_metric: str
    example_record: dict
    explanation: str


class NetworkSummary(BaseModel):
    total_routes: int
    total_pings: int
    total_vehicles: int
    avg_reliability_score: float
    avg_data_quality_score: float
    avg_coverage_score: float
    period: dict


class DemoMetadata(BaseModel):
    name: str
    version: str
    routes: int
    days: int
    seed: int
    description: str
    anomalies: list[str] = Field(default_factory=list)
    total_pings: Optional[int] = None
    region: Optional[str] = None


class HeadwayRouteSummary(BaseModel):
    route_id: str
    route_short_name: str
    route_long_name: str = ""
    expected_headway: float
    median_headway: Optional[float] = None
    p90_headway: Optional[float] = None
    p95_headway: Optional[float] = None
    headway_cv: Optional[float] = None


class HeadwaySummaryResponse(BaseModel):
    routes: list[HeadwayRouteSummary]
