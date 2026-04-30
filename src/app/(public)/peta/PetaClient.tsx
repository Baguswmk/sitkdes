"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Layers } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { JenisTanah } from "@prisma/client";

const MapViewer = dynamic(() => import("@/components/map/MapViewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        minHeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--cream-100)",
        borderRadius: 8,
      }}
    >
      Memuat Peta...
    </div>
  ),
});

export function PetaClient({
  padukuhanOptions,
}: {
  padukuhanOptions: { id: string; nama: string }[];
}) {
  const [padukuhanId, setPadukuhanId] = useState("");
  const [jenisTanah, setJenisTanah] = useState<JenisTanah | "">("");

  const { data: tkdList, isLoading } = trpc.tkd.listPublic.useQuery({
    padukuhanId: padukuhanId || undefined,
    jenisTanah: (jenisTanah as JenisTanah) || undefined,
  });

  return (
    <div className="rounded-xl overflow-hidden border-2 border-[var(--gold-500)]/30 bg-white shadow-xl animate-fadeUp h-[600px] sm:h-[700px]" style={{ display: "flex" }}>
      {/* Sidebar Filter */}
      <div
        className="card-heritage"
        style={{
          width: 320,
          flexShrink: 0,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <div
            className="section-title-heritage"
            style={{ fontSize: 16, marginBottom: 16 }}
          >
            FILTER PETA
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label-heritage">PADUKUHAN</label>
            <select
              className="select-heritage"
              value={padukuhanId}
              onChange={(e) => setPadukuhanId(e.target.value)}
            >
              <option value="">Semua Wilayah</option>
              {padukuhanOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-heritage">JENIS TANAH</label>
            <select
              className="select-heritage"
              value={jenisTanah}
              onChange={(e) => setJenisTanah(e.target.value as JenisTanah)}
            >
              <option value="">Semua Jenis</option>
              <option value="TANAH_KAS">Tanah Kas</option>
              <option value="PELUNGGUH">Pelungguh</option>
              <option value="PENGAREM_AREM">Pengarem-arem</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div style={{ marginTop: "auto" }}>
          <div
            className="label-heritage"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Layers size={14} /> LEGENDA PETA
          </div>
          <div
            style={{
              background: "rgba(255,248,210,.4)",
              border: "1px solid rgba(160,125,47,.3)",
              borderRadius: 6,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  background: "rgba(198, 40, 40, 0.4)",
                  border: "2px solid #c62828",
                  borderRadius: 3,
                }}
              ></div>
              <span
                style={{ fontSize: 13, fontFamily: '"Manrope", sans-serif' }}
              >
                Tanah Kas
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  background: "rgba(30, 48, 112, 0.4)",
                  border: "2px solid #1e3070",
                  borderRadius: 3,
                }}
              ></div>
              <span
                style={{ fontSize: 13, fontFamily: '"Manrope", sans-serif' }}
              >
                Pelungguh
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  background: "rgba(224, 159, 62, 0.4)",
                  border: "2px solid #e09f3e",
                  borderRadius: 3,
                }}
              ></div>
              <span
                style={{ fontSize: 13, fontFamily: '"Manrope", sans-serif' }}
              >
                Pengarem-arem
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  background: "rgba(84, 110, 122, 0.4)",
                  border: "2px solid #546e7a",
                  borderRadius: 3,
                }}
              ></div>
              <span
                style={{ fontSize: 13, fontFamily: '"Manrope", sans-serif' }}
              >
                Lainnya
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div
        style={{
          flex: 1,
          position: "relative",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--gold-600)",
          boxShadow: "var(--shadow-mid)",
        }}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(250,243,224,.7)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: "var(--navy-800)",
            }}
          >
            Memuat Data Peta...
          </div>
        )}
        <MapViewer data={tkdList || []} />
      </div>
    </div>
  );
}
