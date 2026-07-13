"use client";

import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { api } from "@/lib/api";
import type { Stop } from "@/lib/types";
import { ErrorBanner } from "@/components/ui/error-banner";

function FitView({ geojson }: { geojson: GeoJSON.GeoJSON | null }) {
  const map = useMap();
  useEffect(() => {
    if (geojson) {
      try {
        const layer = L.geoJSON(geojson);
        map.fitBounds(layer.getBounds().pad(0.2));
      } catch {
        map.setView([-23.55, -46.63], 12);
      }
    } else {
      map.setView([-23.55, -46.63], 12);
    }
  }, [map, geojson]);
  return null;
}

interface RouteMapViewProps {
  routeId: string;
}

type PingPoint = { lat: number; lng: number; speed: number | null };
type GapPoint = { lat: number; lng: number };

function toPingPoints(raw: unknown[]): PingPoint[] {
  return raw
    .map((item) => {
      const p = item as Record<string, unknown>;
      const lat = Number(p.lat ?? p.latitude);
      const lng = Number(p.lng ?? p.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      const speedRaw = p.speed;
      const speed = speedRaw === null || speedRaw === undefined ? null : Number(speedRaw);
      return { lat, lng, speed: Number.isFinite(speed as number) ? (speed as number) : null };
    })
    .filter((p): p is PingPoint => p !== null);
}

function toGapPoints(raw: unknown[]): GapPoint[] {
  return raw
    .map((item) => {
      const g = item as Record<string, unknown>;
      const lat = Number(g.lat ?? g.latitude);
      const lng = Number(g.lng ?? g.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return { lat, lng };
    })
    .filter((g): g is GapPoint => g !== null);
}

function isRenderableGeoJson(value: unknown): value is GeoJSON.GeoJSON {
  return (
    !!value &&
    typeof value === "object" &&
    "type" in (value as Record<string, unknown>) &&
    typeof (value as { type?: unknown }).type === "string"
  );
}

export function RouteMapView({ routeId }: RouteMapViewProps) {
  const [geojson, setGeojson] = useState<GeoJSON.GeoJSON | null>(null);
  const [pings, setPings] = useState<PingPoint[]>([]);
  const [gaps, setGaps] = useState<GapPoint[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([api.routeGeojson(routeId), api.routeStops(routeId)])
      .then(([geoData, stopsData]) => {
        setGeojson(isRenderableGeoJson(geoData.geojson) ? geoData.geojson : null);
        setPings(toPingPoints((geoData.pings as unknown[]) || []));
        setGaps(toGapPoints((geoData.gaps as unknown[]) || []));
        setStops(stopsData.stops || []);
      })
      .catch((e: Error) => {
        setError(e.message || "Falha ao carregar o mapa da rota.");
        setGeojson(null);
        setPings([]);
        setGaps([]);
        setStops([]);
      })
      .finally(() => setLoading(false));
  }, [routeId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="relative h-full w-full">
      {error && (
        <div className="absolute inset-x-0 top-0 z-[1000] p-2">
          <ErrorBanner message={error} onRetry={load} />
        </div>
      )}
      {loading && !error && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-slate-50/80 text-sm text-slate-500">
          Carregando mapa da rota…
        </div>
      )}
      <MapContainer
        center={[-23.55, -46.63]}
        zoom={12}
        className="h-full w-full"
        zoomControl={true}
        aria-label={`Mapa da rota ${routeId} com pings, gaps e paradas`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geojson && <GeoJSON data={geojson} style={{ color: "#2563eb", weight: 3 }} />}
        {pings.map((p, i) => (
          <CircleMarker
            key={i}
            center={[p.lat, p.lng]}
            radius={3}
            color={p.speed !== null && p.speed > 80 ? "#ef4444" : "#22c55e"}
            fillOpacity={0.6}
          />
        ))}
        {gaps.map((g, i) => (
          <CircleMarker
            key={`gap-${i}`}
            center={[g.lat, g.lng]}
            radius={6}
            color="#f97316"
            fillColor="#f97316"
            fillOpacity={0.3}
          />
        ))}
        {stops.map((s) => (
          <CircleMarker
            key={s.stop_id}
            center={[s.latitude, s.longitude]}
            radius={8}
            color="#7c3aed"
            fillColor="#7c3aed"
            fillOpacity={0.7}
          >
            <Popup>
              <div className="text-sm">
                <strong>{s.stop_name}</strong>
                <br />
                <span className="text-xs text-slate-500">{s.stop_id}</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        <FitView geojson={geojson} />
      </MapContainer>
    </div>
  );
}
