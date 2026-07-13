"use client";

import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { api } from "@/lib/api";
import { ErrorBanner } from "@/components/ui/error-banner";

function FitMapToData({ geojson }: { geojson: GeoJSON.GeoJSON | null }) {
  const map = useMap();
  useEffect(() => {
    if (geojson) {
      try {
        const layer = L.geoJSON(geojson);
        map.fitBounds(layer.getBounds().pad(0.1));
      } catch {
        map.setView([-23.55, -46.63], 11);
      }
    } else {
      map.setView([-23.55, -46.63], 11);
    }
  }, [map, geojson]);
  return null;
}

function routeStyle(feature: GeoJSON.Feature | undefined) {
  const score = Number(feature?.properties?.reliability_score ?? 50);
  let color = "#22c55e";
  if (score < 20) color = "#ef4444";
  else if (score < 50) color = "#f97316";
  else if (score < 80) color = "#eab308";
  return { color, weight: 3, opacity: 0.85 };
}

export function MapView() {
  const [routesGeoJson, setRoutesGeoJson] = useState<GeoJSON.GeoJSON | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .networkGeojson()
      .then((fc) => {
        if (!fc.features?.length) {
          setError("Não foi possível carregar o traçado das rotas no mapa.");
          setRoutesGeoJson(null);
          return;
        }
        setRoutesGeoJson({
          type: "FeatureCollection",
          features: fc.features,
        });
      })
      .catch((e: Error) => {
        setError(e.message || "Falha ao carregar o mapa da rede.");
        setRoutesGeoJson(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="relative h-full w-full" data-testid="network-map">
      {error && (
        <div className="absolute inset-x-0 top-0 z-[1000] p-2">
          <ErrorBanner message={error} onRetry={load} />
        </div>
      )}
      {loading && !error && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-slate-50/80 text-sm text-slate-500">
          Carregando mapa…
        </div>
      )}
      <MapContainer
        center={[-23.55, -46.63]}
        zoom={11}
        className="h-full w-full"
        zoomControl={true}
        aria-label="Mapa da rede de rotas colorido por confiabilidade"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routesGeoJson && (
          <GeoJSON
            key={`network-${(routesGeoJson as GeoJSON.FeatureCollection).features.length}`}
            data={routesGeoJson}
            style={routeStyle}
          />
        )}
        <FitMapToData geojson={routesGeoJson} />
      </MapContainer>
      <div className="pointer-events-none absolute bottom-3 right-3 z-[1000] rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-sm">
        Cor = confiabilidade · vermelho &lt;20 · laranja &lt;50 · amarelo &lt;80 · verde ≥80
      </div>
    </div>
  );
}
