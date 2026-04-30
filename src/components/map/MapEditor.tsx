"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Fix Leaflet icons
const iconRetinaUrl = "/leaflet/marker-icon-2x.png";
const iconUrl = "/leaflet/marker-icon.png";
const shadowUrl = "/leaflet/marker-shadow.png";

// @ts-expect-error - overriding leaflet icon defaults
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

type Props = {
  onGeometryChange: (geojson: string | null) => void;
  initialGeoJson?: GeoJSON.Geometry | null;
};

export default function MapEditor({ onGeometryChange, initialGeoJson }: Props) {
  // Center to Sitimulyo
  const center: [number, number] = [-7.8488, 110.4357];

  const handleCreated = (e: any) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON().geometry;
    onGeometryChange(JSON.stringify(geojson));
  };

  const handleEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      const geojson = layer.toGeoJSON().geometry;
      onGeometryChange(JSON.stringify(geojson));
    });
  };

  const handleDeleted = () => {
    onGeometryChange(null);
  };

  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--gold-600)" }}>
      <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%", zIndex: 1 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: {
                allowIntersection: false,
                drawError: { color: "#e1e100", message: "Garis tidak boleh bersilangan!" },
                shapeOptions: { color: "#1e3070" },
              },
            }}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}
