"use client";

import dynamic from "next/dynamic";
import { trpc } from "@/lib/trpc/client";

const MapViewer = dynamic(() => import("@/components/map/MapViewer"), {
  ssr: false,
  loading: () => <div style={{ height: 600, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream-100)" }}>Memuat Peta...</div>,
});

export function PetaLengkapClient() {
  const { data: spatialData, isLoading } = trpc.tkd.listSpatialAdmin.useQuery({});

  return (
    <div className="animate-fadeUp">
      <div className="section-title-heritage">PETA LENGKAP TKD</div>
      <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic", fontSize: 16, color: "var(--ink-soft)", marginBottom: 24 }}>
        Menampilkan semua data spasial TKD terlepas dari status approval.
      </p>

      <div style={{ height: "calc(100vh - 220px)", minHeight: 600, borderRadius: 8, overflow: "hidden", border: "2px solid var(--gold-600)", boxShadow: "var(--shadow-mid)", position: "relative" }}>
        {isLoading && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(255,251,240,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: '"Cinzel", serif', fontWeight: 600, color: "var(--navy-800)" }}>Memuat Peta...</div>
          </div>
        )}
        <MapViewer data={spatialData || []} />
      </div>
    </div>
  );
}
