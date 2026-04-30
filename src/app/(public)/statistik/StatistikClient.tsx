"use client";

import { trpc } from "@/lib/trpc/client";

const COLOR_MAP: Record<string, string> = {
  TANAH_KAS: "#c62828",
  PELUNGGUH: "#1e3070",
  PENGAREM_AREM: "#e09f3e",
  LAINNYA: "#546e7a",
};

const JENIS_LABEL: Record<string, string> = {
  TANAH_KAS: "Tanah Kas",
  PELUNGGUH: "Pelungguh",
  PENGAREM_AREM: "Pengarem-arem",
  LAINNYA: "Lainnya",
};

export function StatistikClient() {
  const { data: stats, isLoading: loadingStats } = trpc.stats.public.useQuery();
  const { data: statsPadukuhan, isLoading: loadingPadukuhan } = trpc.stats.perPadukuhan.useQuery();

  if (loadingStats || loadingPadukuhan) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "var(--navy-800)" }}>
        Memuat data statistik...
      </div>
    );
  }

  if (!stats || !statsPadukuhan) return null;

  // Calculate SVG stroke dashes for Donut Chart
  let currentOffset = 0;
  const totalCircle = 100; // circumference
  
  const donutSegments = stats.byJenis.map((j) => {
    const percentage = stats.totalLuasHa > 0 ? (j.luasHa / stats.totalLuasHa) * 100 : 0;
    const strokeDasharray = `${percentage} ${100 - percentage}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += percentage;
    return { ...j, strokeDasharray, strokeDashoffset, color: COLOR_MAP[j.jenis] || COLOR_MAP.LAINNYA };
  });

  return (
    <div className="animate-fadeUp max-w-5xl mx-auto">
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1 className="section-title-heritage" style={{ display: "inline-block" }}>STATISTIK SEBARAN TKD</h1>
        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic", fontSize: 18, color: "var(--ink-soft)", marginTop: 8 }}>
          Rekapitulasi data luasan Tanah Kas Desa per padukuhan
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 36 }}
        className="max-[768px]:grid-cols-1"
      >
        <div className="stat-card-heritage">
          <div className="stat-label">TOTAL LUASAN</div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 700, color: "var(--navy-900)" }}>
            {stats.totalLuasHa.toFixed(2)} Ha
          </div>
        </div>
        <div className="stat-card-heritage">
          <div className="stat-label">TOTAL BIDANG</div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 700, color: "var(--navy-900)" }}>
            {stats.totalBidang} Bidang
          </div>
        </div>
        <div className="stat-card-heritage">
          <div className="stat-label">JUMLAH PADUKUHAN</div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 700, color: "var(--navy-900)" }}>
            {stats.padukuhanCount}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 36 }} className="max-[768px]:grid-cols-1">
        {/* Donut Chart */}
        <div className="card-heritage" style={{ padding: 24, textAlign: "center" }}>
          <div className="label-heritage" style={{ marginBottom: 20 }}>Berdasarkan Jenis Tanah</div>
          <svg viewBox="0 0 42 42" style={{ width: "80%", maxWidth: 250, margin: "0 auto", display: "block" }}>
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--cream-100)" strokeWidth="6" />
            {donutSegments.map((seg, i) => (
              <circle
                key={i}
                cx="21" cy="21" r="15.91549430918954" fill="transparent"
                stroke={seg.color} strokeWidth="6"
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                style={{ transition: "stroke-dasharray 1s ease-out" }}
              />
            ))}
          </svg>
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            {stats.byJenis.map((j) => (
              <div key={j.jenis} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 12, height: 12, background: COLOR_MAP[j.jenis], borderRadius: 2 }}></div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{JENIS_LABEL[j.jenis]}</span>
                </div>
                <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16, fontWeight: 700 }}>
                  {j.luasHa.toFixed(2)} Ha
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card-heritage" style={{ padding: 24 }}>
          <div className="label-heritage" style={{ marginBottom: 20 }}>Distribusi Per Padukuhan</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {statsPadukuhan.map((p) => {
              const maxVal = Math.max(...statsPadukuhan.map(x => x.luasHa));
              const width = maxVal > 0 ? (p.luasHa / maxVal) * 100 : 0;
              return (
                <div key={p.padukuhanId} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 120, fontSize: 13, fontWeight: 600, textAlign: "right" }}>{p.namaPadukuhan}</div>
                  <div style={{ flex: 1, height: 16, background: "var(--cream-100)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${width}%`, background: "var(--gold-500)", borderRadius: 4 }}></div>
                  </div>
                  <div style={{ width: 60, fontFamily: '"Cormorant Garamond", serif', fontSize: 14, fontWeight: 700 }}>
                    {p.luasHa.toFixed(1)} Ha
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
