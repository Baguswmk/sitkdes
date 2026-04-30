"use client";

import dynamic from "next/dynamic";

const MapViewer = dynamic(() => import("@/components/map/MapViewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--cream-100)",
        fontStyle: "italic",
        color: "var(--ink-soft)",
        fontSize: 14,
      }}
    >
      Memuat Peta...
    </div>
  ),
});

type Props = {
  tkdId: string;
  nama: string;
  padukuhan: string;
  jenisTanah: string;
  penggunaan: string;
  pemanfaatan: string | null;
  luasHa: number;
  geometry: GeoJSON.Geometry;
};

export function TkdDetailMap({ tkdId, nama, padukuhan, jenisTanah, penggunaan, pemanfaatan, luasHa, geometry }: Props) {
  return (
    <div style={{ height: 300, borderRadius: 6, overflow: "hidden" }}>
      <MapViewer
        data={[{ id: tkdId, nama, padukuhan, jenisTanah, penggunaan, pemanfaatan, luasHa, geometry }]}
      />
    </div>
  );
}
