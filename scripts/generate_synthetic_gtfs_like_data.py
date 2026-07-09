"""
ViaStat — Gerador de Dataset Sintético de Pings GPS de Ônibus
Seed fixa para reprodutibilidade. Anomalias controladas por rota.
"""

import csv
import json
import os
from pathlib import Path
from datetime import datetime, timedelta
import random
import math

SEED = 42
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"
random.seed(SEED)

# Simula região de São Paulo (centro expandido)
BASE_LAT, BASE_LON = -23.55, -46.63

ROUTES_CONFIG = [
    {"route_id": "R01", "short": "101", "long": "Terminal A ↔ Centro", "headway": 10, "anomaly": "none"},
    {"route_id": "R02", "short": "202", "long": "Bairro B ↔ Estação", "headway": 12, "anomaly": "duplicates"},
    {"route_id": "R03", "short": "303", "long": "Jardim C ↔ Praça", "headway": 15, "anomaly": "invalid_coords"},
    {"route_id": "R04", "short": "404", "long": "Leste D ↔ Oeste E", "headway": 10, "anomaly": "signal_loss"},
    {"route_id": "R05", "short": "505", "long": "Norte F ↔ Sul G", "headway": 20, "anomaly": "impossible_speed"},
    {"route_id": "R06", "short": "606", "long": "Parque H ↔ Centro", "headway": 15, "anomaly": "irregular_headway"},
    {"route_id": "R07", "short": "707", "long": "Vila I ↔ Terminal", "headway": 30, "anomaly": "low_coverage"},
    {"route_id": "R08", "short": "808", "long": "Industrial J ↔ Comercial", "headway": 10, "anomaly": "out_of_order"},
    {"route_id": "R09", "short": "909", "long": "Residencial K ↔ Centro", "headway": 10, "anomaly": "high_headway"},
    {"route_id": "R10", "short": "010", "long": "Circular L", "headway": 12, "anomaly": "exemplar"},
]

STOPS_PER_ROUTE = {
    "R01": ["A1", "A2", "A3", "A4", "A5"],
    "R02": ["B1", "B2", "B3", "B4", "B5", "B6"],
    "R03": ["C1", "C2", "C3", "C4"],
    "R04": ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
    "R05": ["E1", "E2", "E3", "E4", "E5"],
    "R06": ["F1", "F2", "F3", "F4", "F5", "F6"],
    "R07": ["G1", "G2", "G3"],
    "R08": ["H1", "H2", "H3", "H4", "H5"],
    "R09": ["I1", "I2", "I3", "I4", "I5", "I6"],
    "R10": ["J1", "J2", "J3", "J4", "J5"],
}

VEHICLES_PER_ROUTE = {
    "R01": 6, "R02": 5, "R03": 4, "R04": 8, "R05": 5,
    "R06": 6, "R07": 3, "R08": 5, "R09": 5, "R10": 4,
}

START_DATE = datetime(2026, 6, 1, 0, 0, 0)
END_DATE = datetime(2026, 6, 7, 23, 59, 59)
DAYS = 7


def generate_route_geometry(route_id: str, num_points: int = 20) -> list:
    """Generate a simplified Linestring for a route."""
    # Spread routes in different directions from center
    angle = int(route_id[1:]) * 36  # degrees
    rad = math.radians(angle)
    length = 0.05 + 0.03 * (int(route_id[1:]) % 4)  # ~5-8km

    points = []
    for i in range(num_points):
        t = i / (num_points - 1)
        jitter_lat = random.uniform(-0.003, 0.003)
        jitter_lon = random.uniform(-0.003, 0.003)
        lat = BASE_LAT + t * length * math.cos(rad) + jitter_lat
        lon = BASE_LON + t * length * math.sin(rad) + jitter_lon
        points.append([round(lon, 6), round(lat, 6)])
    return points


def generate_stops(route_id: str, geometry: list) -> list:
    """Generate stops along the route geometry."""
    stop_ids = STOPS_PER_ROUTE[route_id]
    stops = []
    for i, stop_id in enumerate(stop_ids):
        idx = int(i * (len(geometry) - 1) / (len(stop_ids) - 1))
        lon, lat = geometry[idx]
        stops.append({
            "stop_id": stop_id,
            "stop_name": f"Ponto {stop_id}",
            "latitude": lat,
            "longitude": lon,
            "route_id": route_id,
            "sequence": i + 1,
        })
    return stops


def is_peak_hour(hour: int) -> bool:
    return (6 <= hour < 9) or (17 <= hour < 20)


def is_night_hour(hour: int) -> bool:
    return 0 <= hour < 5


def expected_pings_per_hour(route_config: dict, hour: int) -> int:
    """How many pings we expect for this route in this hour."""
    if is_night_hour(hour):
        base_interval = 120  # 2 min at night
    elif is_peak_hour(hour):
        base_interval = 15  # 15s at peak
    else:
        base_interval = 45  # 45s off-peak

    headway = route_config["headway"]
    vehicles = VEHICLES_PER_ROUTE[route_config["route_id"]]
    # Each vehicle sends pings approximately every base_interval seconds
    pings_per_vehicle = 3600 / base_interval
    return int(pings_per_vehicle * vehicles * (10 / headway))


def generate_pings() -> list:
    """Generate synthetic GPS ping records."""
    random.seed(SEED)
    pings = []
    ping_id_counter = 1

    for route_cfg in ROUTES_CONFIG:
        rid = route_cfg["route_id"]
        anomaly = route_cfg["anomaly"]
        vehicles = VEHICLES_PER_ROUTE[rid]
        geometry = generate_route_geometry(rid)
        num_points = len(geometry)

        current = START_DATE
        while current <= END_DATE:
            hour = current.hour
            # Determine base interval for this hour
            if is_night_hour(hour):
                base_interval = 120
            elif is_peak_hour(hour):
                base_interval = 15
            else:
                base_interval = 45

            # Anomaly: low_coverage — fewer vehicles
            active_vehicles = vehicles
            if anomaly == "low_coverage":
                active_vehicles = max(1, vehicles // 2)

            for v in range(1, active_vehicles + 1):
                vehicle_id = f"V{((int(rid[1:]) - 1) * 10 + v):03d}"
                num_segments = 10  # pings per vehicle in this hour
                for seg in range(num_segments):
                    # Calculate time within this hour
                    offset = seg * (3600 / num_segments) + random.uniform(0, 10)
                    ts = current + timedelta(seconds=offset)
                    if ts > current + timedelta(hours=1):
                        break

                    # Position along route
                    progress = (offset / 3600) + (v / (active_vehicles + 1)) * 0.1
                    coord_idx = min(int(progress * (num_points - 1)), num_points - 1)
                    lon, lat = geometry[coord_idx]
                    lat += random.uniform(-0.0005, 0.0005)
                    lon += random.uniform(-0.0005, 0.0005)

                    # Speed
                    speed = round(random.uniform(15, 50), 1)
                    bearing = random.uniform(0, 360)

                    # Apply anomalies
                    is_duplicate = False
                    is_invalid = False
                    is_impossible_speed = False
                    is_out_of_order = False
                    gap_after = None

                    # Duplicates: add extra ping with same timestamp
                    if anomaly == "duplicates" and random.random() < 0.15:
                        is_duplicate = True

                    # Invalid coordinates
                    if anomaly == "invalid_coords" and random.random() < 0.08:
                        lat = 0.0
                        lon = 0.0
                        is_invalid = True

                    # Impossible speed
                    if anomaly == "impossible_speed" and random.random() < 0.10:
                        speed = random.uniform(130, 200)
                        is_impossible_speed = True

                    # Out of order timestamps: emit this ping BEFORE the previous
                    # ping of the same vehicle so the pipeline detects the reversal.
                    if anomaly == "out_of_order" and random.random() < 0.05 and seg > 0:
                        is_out_of_order = True
                        ts = (
                            current
                            + timedelta(seconds=(seg - 1) * 360)
                            - timedelta(seconds=30)
                        )

                    # Signal loss: skip this ping entirely
                    if anomaly == "signal_loss" and random.random() < 0.02:
                        continue

                    # Irregular headway: skip some pings to create large gaps
                    if anomaly == "irregular_headway" and random.random() < 0.12:
                        continue

                    # High headway: fewer pings, higher interval
                    if anomaly == "high_headway" and random.random() < 0.30:
                        continue

                    ping = {
                        "ping_id": f"P{ping_id_counter:08d}",
                        "vehicle_id": vehicle_id,
                        "route_id": rid,
                        "timestamp": ts.isoformat(),
                        "latitude": round(lat, 6),
                        "longitude": round(lon, 6),
                        "speed": round(speed, 1),
                        "bearing": round(bearing, 1),
                        "source": "synthetic",
                    }
                    pings.append(ping)
                    ping_id_counter += 1

                    if is_duplicate:
                        dup = dict(ping)
                        dup["ping_id"] = f"P{ping_id_counter:08d}"
                        dup["source"] = "synthetic_duplicate"
                        pings.append(dup)
                        ping_id_counter += 1

            current += timedelta(hours=1)

    return pings


def generate_routes_geojson() -> dict:
    """Generate GeoJSON FeatureCollection for routes."""
    features = []
    for route_cfg in ROUTES_CONFIG:
        rid = route_cfg["route_id"]
        geometry = generate_route_geometry(rid)
        features.append({
            "type": "Feature",
            "properties": {
                "route_id": rid,
                "route_short_name": route_cfg["short"],
                "route_long_name": route_cfg["long"],
                "expected_headway_minutes": route_cfg["headway"],
                "anomaly": route_cfg["anomaly"],
                "direction": "outbound",
                "active": True,
            },
            "geometry": {
                "type": "LineString",
                "coordinates": geometry,
            },
        })
    return {"type": "FeatureCollection", "features": features}


def generate_schedule() -> list:
    """Generate expected schedule per route."""
    records = []
    for route_cfg in ROUTES_CONFIG:
        rid = route_cfg["route_id"]
        for day_offset in range(DAYS):
            for hour in range(24):
                headway = route_cfg["headway"]
                if is_night_hour(hour):
                    headway *= 3
                elif is_peak_hour(hour):
                    headway = max(5, headway // 2)
                records.append({
                    "route_id": rid,
                    "date": (START_DATE + timedelta(days=day_offset)).strftime("%Y-%m-%d"),
                    "hour": hour,
                    "expected_headway_minutes": headway,
                    "expected_vehicles": VEHICLES_PER_ROUTE[rid],
                })
    return records


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("Generating pings...")
    pings = generate_pings()
    print(f"  {len(pings)} pings generated")

    # Write pings CSV
    csv_path = OUTPUT_DIR / "raw_pings.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "ping_id", "vehicle_id", "route_id", "timestamp",
            "latitude", "longitude", "speed", "bearing", "source",
        ])
        writer.writeheader()
        writer.writerows(pings)
    print(f"  Wrote {csv_path}")

    # Write routes GeoJSON
    geojson = generate_routes_geojson()
    geojson_path = OUTPUT_DIR / "routes.geojson"
    with open(geojson_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2)
    print(f"  Wrote {geojson_path}")

    # Write stops
    stops = []
    for route_cfg in ROUTES_CONFIG:
        rid = route_cfg["route_id"]
        geometry = generate_route_geometry(rid)
        stops.extend(generate_stops(rid, geometry))
    stops_path = OUTPUT_DIR / "stops.csv"
    with open(stops_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "stop_id", "stop_name", "latitude", "longitude",
            "route_id", "sequence",
        ])
        writer.writeheader()
        writer.writerows(stops)
    print(f"  Wrote {stops_path}")

    # Write schedule
    schedule = generate_schedule()
    schedule_path = OUTPUT_DIR / "schedule.csv"
    with open(schedule_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "route_id", "date", "hour", "expected_headway_minutes", "expected_vehicles",
        ])
        writer.writeheader()
        writer.writerows(schedule)
    print(f"  Wrote {schedule_path}")

    # Write metadata
    metadata = {
        "name": "ViaStat Synthetic Dataset",
        "version": "0.1.0",
        "seed": SEED,
        "routes": len(ROUTES_CONFIG),
        "days": DAYS,
        "total_pings": len(pings),
        "start_date": START_DATE.isoformat(),
        "end_date": END_DATE.isoformat(),
        "region": "São Paulo (simulado)",
        "anomalies": [r["anomaly"] for r in ROUTES_CONFIG],
        "description": "Dataset sintético reproduzível para demonstrar a plataforma ViaStat. Inclui anomalias controladas como duplicatas, gaps, coordenadas inválidas e velocidades impossíveis.",
    }
    metadata_path = OUTPUT_DIR / "metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"  Wrote {metadata_path}")

    print("Done!")


if __name__ == "__main__":
    main()
