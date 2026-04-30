"use client";

import dynamic from "next/dynamic";

const MapViewer = dynamic(() => import("@/components/map/MapViewer"), {
  ssr: false,
  loading: () => <div style={{ height: 600, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream-100)" }}>Memuat Peta...</div>,
});

export function PetaLengkapClient() {
  return (
    <div className="animate-fadeUp">
      <div className="section-title-heritage">PETA LENGKAP TKD</div>
      <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic", fontSize: 16, color: "var(--ink-soft)", marginBottom: 24 }}>
        Menampilkan semua data spasial TKD terlepas dari status approval.
      </p>

      <div style={{ height: "calc(100vh - 220px)", minHeight: 600, borderRadius: 8, overflow: "hidden", border: "2px solid var(--gold-600)", boxShadow: "var(--shadow-mid)" }}>
        {/* We would pass the actual fetched data here via tRPC */}
        <MapViewer data={[]} />
      </div>
    </div>
  );
}
