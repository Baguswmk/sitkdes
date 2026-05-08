"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { trpc } from "@/lib/trpc/client";

const MapViewer = dynamic(() => import("@/components/map/MapViewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--cream-100)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--navy-800)",
        fontStyle: "italic",
        fontSize: 14,
      }}
    >
      Memuat Peta...
    </div>
  ),
});

const JENIS_LABEL: Record<string, string> = {
  TANAH_KAS: "Tanah Kas",
  PELUNGGUH: "Pelungguh",
  PENGAREM_AREM: "Pengarem-arem",
  LAINNYA: "Lainnya",
};

export function BerandaClient({ padukuhanList }: { padukuhanList: string[] }) {
  const { data: stats } = trpc.stats.public.useQuery();
  const { data: tkdList, isLoading: loadingMap } = trpc.tkd.listPublic.useQuery(
    {},
  );

  return (
    <div className="animate-fadeUp">
      {/* ─── Hero ─── */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1
          style={{
            fontFamily: '"Cinzel", serif',
            fontSize: 48,
            fontWeight: 800,
            color: "var(--navy-900)",
            letterSpacing: 2,
            textShadow: "0 2px 0 rgba(0,0,0,.08)",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          SI-TAKAL
        </h1>
        <p
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: "italic",
            fontSize: 20,
            color: "var(--ink-soft)",
          }}
        >
          Sistem Informasi Tanah Kalurahan Sitimulyo
        </p>
      </div>

      {/* ─── Dual Buttons ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          maxWidth: 900,
          margin: "0 auto 34px",
        }}
        className="max-[600px]:grid-cols-1 max-[600px]:gap-4"
      >
        <Link
          href="/peta"
          className="btn-heritage-pill"
          style={{
            display: "block",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          LIHAT PETA
        </Link>
        <Link
          href="/login"
          className="btn-heritage-pill"
          style={{
            display: "block",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          LIHAT DATA
        </Link>
      </div>

      {/* ─── Stats Bar ─── */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
            marginBottom: 36,
            maxWidth: 800,
            margin: "0 auto 36px",
          }}
          className="max-[600px]:grid-cols-1"
        >
          {[
            {
              label: "Total Luas",
              value: `${stats.totalLuasHa.toFixed(1)} Ha`,
            },
            { label: "Jumlah Bidang", value: `${stats.totalBidang} Bidang` },
            { label: "Padukuhan", value: `${stats.padukuhanCount} Wilayah` },
          ].map((s) => (
            <div
              key={s.label}
              className="stat-card-heritage"
              style={{ textAlign: "center" }}
            >
              <div className="stat-label">{s.label}</div>
              <div
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--navy-900)",
                  lineHeight: 1,
                  marginTop: 6,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Two-column panels ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 54,
          maxWidth: 1200,
          margin: "0 auto",
        }}
        className="max-[960px]:grid-cols-1 max-[960px]:gap-7"
      >
        {/* Map preview */}
        <div className="card-heritage" style={{ padding: 10 }}>
          <div
            style={{
              width: "100%",
              aspectRatio: "4/3",
              borderRadius: 6,
              position: "relative",
              overflow: "hidden",
              border: "1px solid var(--gold-600)",
            }}
          >
            {loadingMap && (
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
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Link
              href="/peta"
              style={{
                fontFamily: '"Cinzel", serif',
                fontSize: 12,
                letterSpacing: 1.5,
                color: "var(--navy-900)",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              BUKA PETA DIGITAL PENUH →
            </Link>
          </div>
        </div>

        {/* Padukuhan table */}
        <div className="card-heritage" style={{ overflow: "hidden" }}>
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            <table className="tbl-heritage">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>No.</th>
                  <th style={{ textAlign: "left" }}>Padukuhan</th>
                </tr>
              </thead>
              <tbody>
                {padukuhanList.map((nama, i) => (
                  <tr key={nama}>
                    <td>{i + 1}</td>
                    <td style={{ textAlign: "left", paddingLeft: 18 }}>
                      {nama}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Jenis breakdown ─── */}
      {stats && stats.byJenis.length > 0 && (
        <div style={{ marginTop: 44, maxWidth: 900, margin: "44px auto 0" }}>
          <div className="section-title-heritage">SEBARAN JENIS TANAH</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18,
            }}
            className="max-[600px]:grid-cols-2"
          >
            {stats.byJenis.map((j) => (
              <div key={j.jenis} className="stat-card-heritage">
                <div className="stat-label">
                  {JENIS_LABEL[j.jenis] ?? j.jenis}
                </div>
                <div
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: 26,
                    fontWeight: 700,
                    color: "var(--navy-900)",
                  }}
                >
                  {j.luasHa.toFixed(1)}{" "}
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--ink-soft)",
                      fontStyle: "italic",
                    }}
                  >
                    Ha
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ink-soft)",
                    fontStyle: "italic",
                  }}
                >
                  {j.count} bidang
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
