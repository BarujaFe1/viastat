"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { api } from "@/lib/api";

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
  const score = feature?.properties?.reliability_score ?? 50;
  let color = "#22c55e";
  if (score < 20) color = "#ef4444";
  else if (score < 50) color = "#f97316";
  else if (score < 80) color = "#eab308";
  return { color, weight: 3, opacity: 0.8 };
}

export function MapView() {
  const [routesGeoJson, setRoutesGeoJson] = useState<GeoJSON.GeoJSON | null>(null);

  useEffect(() => {
    api.routes()
      .then(async (data) => {
        if (!data.routes?.length) return;
        const results = await Promise.all(
          data.routes.map(async (r) => {
            try {
              const gj = await api.routeGeojson(r.route_id);
              return gj.geojson;
            } catch {
              return null;
            }
          })
        );
        const features = results.filter(
          (r): r is GeoJSON.Feature => r !== null && (r as GeoJSON.Feature).type === "Feature"
        );
        if (features.length > 0) {
          setRoutesGeoJson({ type: "FeatureCollection", features } as unknown as GeoJSON.GeoJSON);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <MapContainer
      center={[-23.55, -46.63]}
      zoom={11}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routesGeoJson && (
        <GeoJSON
          key={JSON.stringify(routesGeoJson)}
          data={routesGeoJson}
          style={routeStyle}
        />
      )}
      <FitMapToData geojson={routesGeoJson} />
    </MapContainer>
  );
}
