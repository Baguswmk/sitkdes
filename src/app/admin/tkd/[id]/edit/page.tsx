import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { TkdCreateClient } from "../../create/TkdCreateClient";

export default async function TkdEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const resolvedParams = await params;

  const tkd = await db.tanahKasDesa.findUnique({
    where: { id: resolvedParams.id, deletedAt: null },
  });

  if (!tkd) {
    return <div className="p-8 text-center">Data TKD tidak ditemukan.</div>;
  }

  // Fetch geometry as GeoJSON string for pre-filling the MapEditor
  const geoRow = await db.$queryRaw<[{ geojson: string }]>`
    SELECT ST_AsGeoJSON(geometry)::text as geojson
    FROM "TanahKasDesa" WHERE id = ${resolvedParams.id}
  `;
  const geometryGeoJson = geoRow[0]?.geojson ?? undefined;

  const padukuhanList = await db.padukuhan.findMany({
    where: { isActive: true },
    select: { id: true, nama: true },
    orderBy: { urutan: "asc" },
  });

  return (
    <TkdCreateClient
      padukuhanOptions={padukuhanList}
      tkdId={tkd.id}
      initialData={{
        nama: tkd.nama,
        deskripsi: tkd.deskripsi ?? undefined,
        jenisTanah: tkd.jenisTanah,
        kategoriPenggunaan: tkd.kategoriPenggunaan,
        penggunaan: tkd.penggunaan,
        pemanfaatan: tkd.pemanfaatan ?? undefined,
        padukuhanId: tkd.padukuhanId,
        alamat: tkd.alamat ?? undefined,
        statusKepemilikan: tkd.statusKepemilikan ?? undefined,
        alasHak: tkd.alasHak ?? undefined,
        nomorSertifikat: tkd.nomorSertifikat ?? undefined,
        geometryGeoJson,
      }}
    />
  );
}
