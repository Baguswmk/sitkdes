"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, GeoJSON, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type TKDMapData = {
  id: string;
  nama: string;
  padukuhan: string;
  jenisTanah: string;
  penggunaan: string;
  pemanfaatan: string | null;
  luasHa: number;
  geometry: GeoJSON.Geometry;
};

type Props = {
  data: TKDMapData[];
};

const COLOR_MAP: Record<string, string> = {
  TANAH_KAS: "#c62828",
  PELUNGGUH: "#1e3070",
  PENGAREM_AREM: "#e09f3e",
  LAINNYA: "#546e7a",
};

export default function MapViewer({ data }: Props) {
  const center: [number, number] = [-7.8488, 110.4357];
  const mapRef = useRef<L.Map>(null);

  // Auto-fit bounds when data changes
  useEffect(() => {
    if (data.length > 0 && mapRef.current) {
      const group = new L.FeatureGroup();
      data.forEach((item) => {
        if (item.geometry) {
          const geoJsonLayer = L.geoJSON(item.geometry);
          geoJsonLayer.eachLayer((l) => group.addLayer(l));
        }
      });
      if (group.getLayers().length > 0) {
        mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    }
  }, [data]);

  return (
    <MapContainer ref={mapRef} center={center} zoom={14} style={{ height: "100%", width: "100%", zIndex: 1 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {data.map((item) => (
        <GeoJSON
          key={item.id}
          data={item.geometry}
          style={() => ({
            color: COLOR_MAP[item.jenisTanah] || COLOR_MAP.LAINNYA,
            weight: 2,
            opacity: 1,
            fillColor: COLOR_MAP[item.jenisTanah] || COLOR_MAP.LAINNYA,
            fillOpacity: 0.4,
          })}
        >
          <Popup>
            <div style={{ fontFamily: '"Manrope", sans-serif', fontSize: 13, minWidth: 200 }}>
              <div style={{ fontFamily: '"Cinzel", serif', fontWeight: 700, color: "var(--navy-900)", borderBottom: "1px solid var(--gold-500)", paddingBottom: 6, marginBottom: 6 }}>
                {item.nama}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "4px 0", color: "var(--ink-soft)" }}>Padukuhan</td>
                    <td style={{ padding: "4px 0", fontWeight: 600, textAlign: "right" }}>{item.padukuhan}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 0", color: "var(--ink-soft)" }}>Jenis Tanah</td>
                    <td style={{ padding: "4px 0", fontWeight: 600, textAlign: "right" }}>{item.jenisTanah.replace("_", " ")}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 0", color: "var(--ink-soft)" }}>Luas</td>
                    <td style={{ padding: "4px 0", fontWeight: 600, textAlign: "right" }}>{item.luasHa.toFixed(4)} Ha</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 0", color: "var(--ink-soft)" }}>Penggunaan</td>
                    <td style={{ padding: "4px 0", fontWeight: 600, textAlign: "right" }}>{item.penggunaan}</td>
                  </tr>
                </tbody>
              </table>
              <a
                href={`/admin/tkd/${item.id}`}
                style={{
                  display: "block", textAlign: "center", background: "var(--navy-800)", color: "white",
                  padding: "6px 0", borderRadius: 4, textDecoration: "none", marginTop: 10, fontSize: 12
                }}
              >
                Lihat Detail Lengkap
              </a>
            </div>
          </Popup>
        </GeoJSON>
      ))}
    </MapContainer>
  );
}
