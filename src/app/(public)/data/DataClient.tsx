"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Pagination } from "@/components/ui/Pagination";

/* ─── Types ─────────────────────────────────────────── */
interface PadukuhanOption {
  id: string;
  nama: string;
}

// Represents a public-safe TKD row (no sensitive fields)
interface TkdPublicRow {
  id: string;
  nama: string;
  padukuhan: string;
  jenisTanah: "TANAH_KAS" | "PELUNGGUH" | "PENGAREM_AREM" | "LAINNYA";
  penggunaan: string;
  pemanfaatan: string | null;
  luasM2: number;
}

interface Props {
  padukuhanOptions: PadukuhanOption[];
}

const PENGGUNAAN_OPTS = ["Pertanian", "Non-Pertanian"];
const PEMANFAATAN_OPTS = [
  "Balai Dusun",
  "Bank sampah",
  "Gedung Serbaguna",
  "Industri",
  "Irigasi",
  "Jalan",
  "Lapangan",
  "Makam",
  "Masjid",
  "Pariwisata",
  "Pendidikan",
  "Perdagangan",
  "Perkantoran",
  "Perkebunan",
  "Puskesmas",
  "Sawah",
  "Selokan",
  "Sinder Tebu",
  "Tegalan",
];

const BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  TANAH_KAS: { label: "TKD", className: "badge-kas" },
  PELUNGGUH: { label: "Pelungguh", className: "badge-pelungguh" },
  PENGAREM_AREM: { label: "Pengarem-arem", className: "badge-pengarem" },
  LAINNYA: { label: "Lainnya", className: "badge-lainnya" },
};

/* ─── Bar Chart Per Padukuhan ───────────────────────── */
function BarChartPadukuhan({ data }: { data: TkdPublicRow[] }) {
  // Group luas by padukuhan
  const byPadukuhan: Record<string, number> = {};
  data.forEach((r) => {
    byPadukuhan[r.padukuhan] = (byPadukuhan[r.padukuhan] ?? 0) + r.luasM2;
  });
  const entries = Object.entries(byPadukuhan)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14);
  const maxVal = Math.max(...entries.map((e) => e[1]), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {entries.map(([nama, luas]) => {
        const w = (luas / maxVal) * 100;
        return (
          <div
            key={nama}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div
              style={{
                width: 130,
                fontSize: 13,
                fontWeight: 600,
                textAlign: "right",
                color: "var(--navy-800)",
                fontFamily: '"Manrope", sans-serif',
                flexShrink: 0,
              }}
            >
              {nama}
            </div>
            <div
              style={{
                flex: 1,
                height: 14,
                background: "rgba(160,125,47,.2)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${w}%`,
                  background:
                    "linear-gradient(90deg, var(--gold-500), var(--gold-400))",
                  borderRadius: 4,
                  transition: "width .6s ease",
                }}
              />
            </div>
            <div
              style={{
                width: 72,
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 14,
                fontWeight: 700,
                color: "var(--navy-900)",
                textAlign: "right",
              }}
            >
              {luas >= 10000
                ? `${(luas / 10000).toFixed(2)} Ha`
                : `${luas.toLocaleString("id-ID")} m²`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Donut Chart (SVG) ──────────────────────────────── */
function DonutChart({ data }: { data: TkdPublicRow[] }) {
  const total = data.reduce((s, r) => s + r.luasM2, 0) || 1;

  const segments = [
    { key: "TANAH_KAS", color: "#c62828", label: "Tanah Kas" },
    { key: "PELUNGGUH", color: "#3b5bdb", label: "Pelungguh" },
    { key: "PENGAREM_AREM", color: "#e09f3e", label: "Pengarem-arem" },
    { key: "LAINNYA", color: "#546e7a", label: "Lainnya" },
  ].map((s) => ({
    ...s,
    luas: data
      .filter((r) => r.jenisTanah === s.key)
      .reduce((a, r) => a + r.luasM2, 0),
  }));

  // Build SVG pie arcs
  const r = 48,
    cx = 60,
    cy = 60;
  let startAngle = -Math.PI / 2;
  const arcs = segments.map((seg) => {
    const pct = seg.luas / total;
    const sweep = pct * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + sweep);
    const y2 = cy + r * Math.sin(startAngle + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const d =
      pct === 0
        ? ""
        : pct === 1
          ? `M${cx},${cy - r} A${r},${r} 0 1 1 ${cx - 0.001},${cy - r} Z`
          : `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
    startAngle += sweep;
    return { ...seg, d, pct };
  });

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <div style={{ width: 120, height: 120, flexShrink: 0 }}>
        <svg viewBox="0 0 120 120" width="120" height="120">
          {arcs.map((a) => a.d && <path key={a.key} d={a.d} fill={a.color} />)}
          <circle
            cx={cx}
            cy={cy}
            r={22}
            fill="#f3e9cf"
            stroke="#c49a45"
            strokeWidth={1.5}
          />
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 14,
        }}
      >
        <div
          style={{
            fontFamily: '"Cinzel", serif',
            fontSize: 11,
            letterSpacing: "2px",
            color: "var(--navy-800)",
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          JENIS PENGGUNAAN
        </div>
        {arcs.map((a) => (
          <div
            key={a.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--ink-soft)",
            }}
          >
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: a.color,
                display: "inline-block",
                boxShadow:
                  "0 0 0 1.5px var(--cream-50), 0 0 0 2.5px rgba(0,0,0,.15)",
              }}
            />
            {a.label} {a.pct > 0 ? `${Math.round(a.pct * 100)}%` : "0%"}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────── */
const PAGE_SIZE = 10;

/* ─── Main Component ─────────────────────────────────── */
export function DataClient({ padukuhanOptions }: Props) {
  const { data: tkdList, isLoading } = trpc.tkd.listPublic.useQuery({});
  const rawData = tkdList || [];

  const [filterPadukuhan, setFilterPadukuhan] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterPenggunaan, setFilterPenggunaan] = useState("");
  const [filterPemanfaatan, setFilterPemanfaatan] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return rawData.filter((r) => {
      if (
        filterPadukuhan &&
        r.padukuhan.toLowerCase() !== filterPadukuhan.toLowerCase()
      )
        return false;
      if (filterJenis && r.jenisTanah !== filterJenis) return false;
      if (
        filterPenggunaan &&
        r.penggunaan.toLowerCase() !== filterPenggunaan.toLowerCase()
      )
        return false;
      if (
        filterPemanfaatan &&
        r.pemanfaatan?.toLowerCase() !== filterPemanfaatan.toLowerCase()
      )
        return false;
      return true;
    });
  }, [
    rawData,
    filterPadukuhan,
    filterJenis,
    filterPenggunaan,
    filterPemanfaatan,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const totalLuas = filtered.reduce((s, r) => s + r.luasM2, 0);
  const luasByJenis = (jenis: string) =>
    filtered
      .filter((r) => r.jenisTanah === jenis)
      .reduce((s, r) => s + r.luasM2, 0);

  const fmtLuas = (m2: number) =>
    m2 >= 10000
      ? `${(m2 / 10000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} Ha`
      : `${m2.toLocaleString("id-ID")} m²`;

  const handleFilterChange = () => setPage(1);

  // Stat totals from ALL data (not filtered) for the summary section
  const allTotalLuas = rawData.reduce((s, r) => s + r.luasM2, 0);
  const allTotalBidang = rawData.length;
  const allPadukuhan = new Set(rawData.map((r) => r.padukuhan)).size;

  if (isLoading) {
    return (
      <div
        className="animate-fadeUp text-center"
        style={{
          padding: "64px 0",
          color: "var(--navy-800)",
          fontStyle: "italic",
        }}
      >
        Memuat Data Tanah Kas Kalurahan...
      </div>
    );
  }

  return (
    <div className="animate-fadeUp">
      {/* Section Title */}
      <h1 className="section-title-heritage">DATA TANAH KAS DESA</h1>

      {/* ── Statistik Ringkasan ── */}
      <div
        style={{
          display: "grid",
          gap: 24,
          marginBottom: 36,
        }}
        className="grid-cols-[1fr_2fr] max-[768px]:grid-cols-1"
      >
        {/* Left: stat cards + donut */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 3 top-line stats */}
          <div
            style={{ display: "grid", gap: 12 }}
            className="grid-cols-3 max-[480px]:grid-cols-1"
          >
            <div className="stat-card-heritage" style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: 10,
                  letterSpacing: "2px",
                  color: "var(--navy-800)",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                TOTAL LUASAN
              </div>
              <div
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--navy-900)",
                  lineHeight: 1,
                }}
              >
                {allTotalLuas >= 10000
                  ? `${(allTotalLuas / 10000).toFixed(1)} Ha`
                  : `${allTotalLuas.toLocaleString("id-ID")} m²`}
              </div>
            </div>
            <div className="stat-card-heritage" style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: 10,
                  letterSpacing: "2px",
                  color: "var(--navy-800)",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                TOTAL BIDANG
              </div>
              <div
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--navy-900)",
                  lineHeight: 1,
                }}
              >
                {allTotalBidang}
              </div>
            </div>
            <div className="stat-card-heritage" style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: 10,
                  letterSpacing: "2px",
                  color: "var(--navy-800)",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                PADUKUHAN
              </div>
              <div
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--navy-900)",
                  lineHeight: 1,
                }}
              >
                {allPadukuhan}
              </div>
            </div>
          </div>

          {/* Donut chart by jenis */}
          <div className="card-heritage" style={{ padding: 20, flex: 1 }}>
            <div className="label-heritage" style={{ marginBottom: 16 }}>
              DISTRIBUSI JENIS TANAH
            </div>
            <DonutChart data={rawData as TkdPublicRow[]} />
          </div>
        </div>

        {/* Right: bar chart per padukuhan */}
        <div className="card-heritage" style={{ padding: 24 }}>
          <div className="label-heritage" style={{ marginBottom: 16 }}>
            SEBARAN PER PADUKUHAN
          </div>
          <BarChartPadukuhan data={rawData as TkdPublicRow[]} />
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: "1px solid var(--gold-500)",
          marginBottom: 28,
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            right: 0,
            top: -10,
            color: "var(--gold-500)",
            background: "var(--cream-50)",
            padding: "0 8px",
            fontSize: 14,
          }}
        >
          ❦
        </span>
      </div>

      {/* ── Filter Grid ── */}
      <div
        style={{
          display: "grid",
          gap: 20,
          background:
            "linear-gradient(180deg, rgba(255,248,210,.55), rgba(214,196,147,.3))",
          border: "1px solid var(--gold-600)",
          borderRadius: 10,
          padding: 22,
          boxShadow: "var(--shadow-mid)",
          marginBottom: 28,
        }}
        className="grid-cols-4 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1"
      >
        {/* Padukuhan */}
        <div>
          <label className="label-heritage" htmlFor="f-padukuhan">
            Filter Padukuhan
          </label>
          <select
            id="f-padukuhan"
            className="select-heritage"
            value={filterPadukuhan}
            onChange={(e) => {
              setFilterPadukuhan(e.target.value);
              handleFilterChange();
            }}
          >
            <option value="">Semua Padukuhan</option>
            {padukuhanOptions.map((p) => (
              <option key={p.id} value={p.nama}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Jenis */}
        <div>
          <label className="label-heritage" htmlFor="f-jenis">
            Jenis Tanah Kalurahan
          </label>
          <select
            id="f-jenis"
            className="select-heritage"
            value={filterJenis}
            onChange={(e) => {
              setFilterJenis(e.target.value);
              handleFilterChange();
            }}
          >
            <option value="">Jenis Tanah Kalurahan</option>
            <option value="TANAH_KAS">Tanah Kas Desa</option>
            <option value="PELUNGGUH">Pelungguh</option>
            <option value="PENGAREM_AREM">Pengarem-arem</option>
            <option value="LAINNYA">Lainnya</option>
          </select>
        </div>

        {/* Penggunaan */}
        <div>
          <label className="label-heritage" htmlFor="f-penggunaan">
            Penggunaan Tanah
          </label>
          <select
            id="f-penggunaan"
            className="select-heritage"
            value={filterPenggunaan}
            onChange={(e) => {
              setFilterPenggunaan(e.target.value);
              handleFilterChange();
            }}
          >
            <option value="">Penggunaan Tanah</option>
            {PENGGUNAAN_OPTS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Pemanfaatan */}
        <div>
          <label className="label-heritage" htmlFor="f-pemanfaatan">
            Pemanfaatan Tanah
          </label>
          <select
            id="f-pemanfaatan"
            className="select-heritage"
            value={filterPemanfaatan}
            onChange={(e) => {
              setFilterPemanfaatan(e.target.value);
              handleFilterChange();
            }}
          >
            <option value="">Pemanfaatan Tanah</option>
            {PEMANFAATAN_OPTS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div
        style={{
          display: "grid",
          gap: 18,
          marginBottom: 28,
        }}
        className="grid-cols-[1.4fr_1fr_1fr_1.3fr] max-[960px]:grid-cols-2 max-[480px]:grid-cols-1"
      >
        {/* Total – spans 2 rows on desktop */}
        <div
          className="stat-card-heritage"
          style={{
            gridRow: "span 2",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: 11,
              letterSpacing: "2px",
              color: "var(--navy-800)",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            TOTAL TANAH KALURAHAN
          </div>
          <div
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 42,
              fontWeight: 700,
              color: "var(--navy-900)",
              lineHeight: 1,
            }}
          >
            {fmtLuas(totalLuas)}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--ink-soft)",
              fontStyle: "italic",
              marginTop: 6,
            }}
          >
            dari {filtered.length} bidang tanah
          </div>
        </div>

        {/* Double col: Kas + Pengarem */}
        <div
          style={{
            gridRow: "span 2",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div className="stat-card-heritage" style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: '"Cinzel", serif',
                fontSize: 11,
                letterSpacing: "2px",
                color: "var(--navy-800)",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              TANAH KAS KALURAHAN
            </div>
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 28,
                fontWeight: 700,
                color: "var(--navy-900)",
                lineHeight: 1,
              }}
            >
              {fmtLuas(luasByJenis("TANAH_KAS"))}
            </div>
          </div>
          <div className="stat-card-heritage" style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: '"Cinzel", serif',
                fontSize: 11,
                letterSpacing: "2px",
                color: "var(--navy-800)",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              PENGAREM-AREM
            </div>
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 28,
                fontWeight: 700,
                color: "var(--navy-900)",
                lineHeight: 1,
              }}
            >
              {fmtLuas(luasByJenis("PENGAREM_AREM"))}
            </div>
          </div>
        </div>

        {/* Double col: Pelungguh + Lainnya */}
        <div
          style={{
            gridRow: "span 2",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div className="stat-card-heritage" style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: '"Cinzel", serif',
                fontSize: 11,
                letterSpacing: "2px",
                color: "var(--navy-800)",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              PELUNGGUH
            </div>
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 28,
                fontWeight: 700,
                color: "var(--navy-900)",
                lineHeight: 1,
              }}
            >
              {fmtLuas(luasByJenis("PELUNGGUH"))}
            </div>
          </div>
          <div className="stat-card-heritage" style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: '"Cinzel", serif',
                fontSize: 11,
                letterSpacing: "2px",
                color: "var(--navy-800)",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              LAINNYA
            </div>
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 28,
                fontWeight: 700,
                color: "var(--navy-900)",
                lineHeight: 1,
              }}
            >
              {fmtLuas(luasByJenis("LAINNYA"))}
            </div>
          </div>
        </div>

        {/* Donut chart card – spans 2 rows */}
        <div
          className="stat-card-heritage"
          style={{
            gridRow: "span 2",
            display: "flex",
            alignItems: "center",
          }}
        >
          <DonutChart data={filtered as TkdPublicRow[]} />
        </div>
      </div>

      {/* ── Data Table ── */}
      <div
        style={{
          background: "var(--cream-100)",
          border: "1px solid var(--gold-600)",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "var(--shadow-mid)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table className="tbl-heritage" style={{ fontSize: 17 }}>
            <thead>
              <tr>
                <th style={{ width: 52 }}>No.</th>
                <th style={{ textAlign: "left", paddingLeft: 16 }}>
                  Padukuhan
                </th>
                <th style={{ textAlign: "left", paddingLeft: 16 }}>
                  Nama Bidang
                </th>
                <th>Penggunaan</th>
                <th>Pemanfaatan</th>
                <th>Jenis</th>
                <th>Luas (m²)</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "40px 0",
                      textAlign: "center",
                      color: "var(--ink-soft)",
                      fontStyle: "italic",
                    }}
                  >
                    Tidak ada data yang sesuai filter.
                  </td>
                </tr>
              ) : (
                pageData.map((row, i) => {
                  const badge =
                    BADGE_CONFIG[row.jenisTanah] || BADGE_CONFIG.LAINNYA;
                  return (
                    <tr key={row.id}>
                      <td style={{ fontWeight: 600, color: "var(--navy-800)" }}>
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td style={{ textAlign: "left", paddingLeft: 16 }}>
                        {row.padukuhan}
                      </td>
                      <td style={{ textAlign: "left", paddingLeft: 16 }}>
                        {row.nama}
                      </td>
                      <td>{row.penggunaan}</td>
                      <td>{row.pemanfaatan}</td>
                      <td>
                        <span className={`badge-heritage ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td>{row.luasM2.toLocaleString("id-ID")}</td>
                      <td>
                        <Link
                          href={`/admin/tkd/${row.id}`}
                          title="Lihat detail bidang tanah"
                          style={{
                            fontFamily: '"Cinzel", serif',
                            fontSize: 11,
                            letterSpacing: "1.5px",
                            color: "var(--gold-100)",
                            background:
                              "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
                            border: "1px solid var(--gold-600)",
                            padding: "5px 14px",
                            borderRadius: 999,
                            textDecoration: "none",
                            display: "inline-block",
                            transition: "opacity .2s",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={PAGE_SIZE}
          onPageChange={setPage}
          itemName="bidang"
        />
      </div>
    </div>
  );
}
