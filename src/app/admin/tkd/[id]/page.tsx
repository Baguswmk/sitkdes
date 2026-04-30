import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import Link from "next/link";
import { ArrowLeft, Map as MapIcon, Edit } from "lucide-react";
import { TkdActionButtons } from "./TkdActionButtons";
import { TkdDetailMap } from "./TkdDetailMap";
import { TkdSubmitButton } from "./TkdSubmitButton";

export default async function TkdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const resolvedParams = await params;

  const tkd = await db.tanahKasDesa.findUnique({
    where: { id: resolvedParams.id, deletedAt: null },
    include: { padukuhan: true }
  });

  if (!tkd) {
    return <div className="p-8 text-center">Data TKD tidak ditemukan.</div>;
  }

  // Fetch geometry as GeoJSON (PostGIS field — not available via normal Prisma select)
  const geoRow = await db.$queryRaw<[{ geojson: string }]>`
    SELECT ST_AsGeoJSON(geometry)::text as geojson
    FROM "TanahKasDesa" WHERE id = ${resolvedParams.id}
  `;
  const geometry = geoRow[0]?.geojson ? JSON.parse(geoRow[0].geojson) as GeoJSON.Geometry : null;

  const userRole = (session.user as any)?.role || "OPERATOR";
  const userId = (session.user as any)?.id;
  const isAdmin = userRole === "ADMIN_DESA" || userRole === "SUPER_ADMIN";
  const isOwner = (tkd as any).createdById === userId;

  return (
    <div className="animate-fadeUp max-w-5xl mx-auto">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Link href="/admin/tkd" style={{ color: "var(--navy-600)" }} title="Kembali">
          <ArrowLeft size={24} />
        </Link>
        <div className="section-title-heritage" style={{ margin: 0 }}>DETAIL DATA TKD</div>
        
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          {tkd.status !== "APPROVED" && (
            <Link href={`/admin/tkd/${tkd.id}/edit`} className="btn-heritage" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}>
              <Edit size={16} /> Edit Data
            </Link>
          )}
          {/* Operator: tombol ajukan review jika masih DRAFT dan milik sendiri */}
          {tkd.status === "DRAFT" && (isOwner || isAdmin) && (
            <TkdSubmitButton tkdId={tkd.id} />
          )}
          {/* Admin: tombol approve/reject jika PENDING_REVIEW */}
          {isAdmin && tkd.status === "PENDING_REVIEW" && (
            <TkdActionButtons tkdId={tkd.id} />
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }} className="max-[960px]:grid-cols-1">
        {/* Info Card */}
        <div className="card-heritage" style={{ padding: 32 }}>
          <div style={{ fontFamily: '"Cinzel", serif', fontSize: 24, fontWeight: 700, color: "var(--navy-900)", borderBottom: "2px solid var(--gold-500)", paddingBottom: 12, marginBottom: 20 }}>
            {tkd.nama}
          </div>
          
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: '"Manrope", sans-serif', fontSize: 14 }}>
            <tbody>
              <tr><td style={{ padding: "10px 0", color: "var(--ink-soft)", width: 180 }}>Status Approval</td><td style={{ fontWeight: 600 }}>{tkd.status.replace("_", " ")}</td></tr>
              <tr style={{ borderTop: "1px solid rgba(160,125,47,.2)" }}><td style={{ padding: "10px 0", color: "var(--ink-soft)" }}>Padukuhan</td><td style={{ fontWeight: 600 }}>{tkd.padukuhan.nama}</td></tr>
              <tr style={{ borderTop: "1px solid rgba(160,125,47,.2)" }}><td style={{ padding: "10px 0", color: "var(--ink-soft)" }}>Jenis Tanah</td><td style={{ fontWeight: 600 }}>{tkd.jenisTanah.replace("_", " ")}</td></tr>
              <tr style={{ borderTop: "1px solid rgba(160,125,47,.2)" }}><td style={{ padding: "10px 0", color: "var(--ink-soft)" }}>Kategori Penggunaan</td><td style={{ fontWeight: 600 }}>{tkd.kategoriPenggunaan.replace("_", " ")}</td></tr>
              <tr style={{ borderTop: "1px solid rgba(160,125,47,.2)" }}><td style={{ padding: "10px 0", color: "var(--ink-soft)" }}>Penggunaan</td><td style={{ fontWeight: 600 }}>{tkd.penggunaan}</td></tr>
              <tr style={{ borderTop: "1px solid rgba(160,125,47,.2)" }}><td style={{ padding: "10px 0", color: "var(--ink-soft)" }}>Pemanfaatan</td><td style={{ fontWeight: 600 }}>{tkd.pemanfaatan || "-"}</td></tr>
              <tr style={{ borderTop: "1px solid rgba(160,125,47,.2)" }}><td style={{ padding: "10px 0", color: "var(--ink-soft)" }}>Luas Lahan</td><td style={{ fontWeight: 600, color: "var(--navy-700)" }}>{tkd.luasHa.toFixed(4)} Hektar</td></tr>
            </tbody>
          </table>

          <div style={{ marginTop: 32 }}>
            <div className="label-heritage" style={{ borderBottom: "1px solid var(--gold-400)", paddingBottom: 8, marginBottom: 12 }}>INFORMASI LEGAL / ALAS HAK</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: '"Manrope", sans-serif', fontSize: 14 }}>
              <tbody>
                <tr><td style={{ padding: "8px 0", color: "var(--ink-soft)", width: 180 }}>Status Kepemilikan</td><td style={{ fontWeight: 600 }}>{tkd.statusKepemilikan || "-"}</td></tr>
                <tr><td style={{ padding: "8px 0", color: "var(--ink-soft)" }}>Alas Hak</td><td style={{ fontWeight: 600 }}>{tkd.alasHak || "-"}</td></tr>
                <tr><td style={{ padding: "8px 0", color: "var(--ink-soft)" }}>Nomor Sertifikat</td><td style={{ fontWeight: 600 }}>{tkd.nomorSertifikat || "-"}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Map & Meta Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="card-heritage" style={{ padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: '"Cinzel", serif', fontWeight: 600, color: "var(--navy-900)", marginBottom: 12, padding: "0 8px" }}>
              <MapIcon size={18} /> PETA LOKASI
            </div>
            {geometry ? (
              <TkdDetailMap
                tkdId={tkd.id}
                nama={tkd.nama}
                padukuhan={tkd.padukuhan.nama}
                jenisTanah={tkd.jenisTanah}
                penggunaan={tkd.penggunaan}
                pemanfaatan={tkd.pemanfaatan}
                luasHa={Number(tkd.luasHa)}
                geometry={geometry}
              />
            ) : (
              <div style={{ height: 300, background: "var(--cream-100)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>Data geometri tidak tersedia</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
