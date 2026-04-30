import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { TkdCreateClient } from "../../create/TkdCreateClient"; // Re-using form component

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

  const padukuhanList = await db.padukuhan.findMany({
    where: { isActive: true },
    select: { id: true, nama: true },
    orderBy: { urutan: "asc" },
  });

  return (
    <div className="animate-fadeUp max-w-4xl mx-auto">
      <div className="section-title-heritage" style={{ marginBottom: 24 }}>EDIT DATA TKD</div>
      <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic", fontSize: 16, color: "var(--ink-soft)", marginBottom: 24 }}>
        Anda sedang mengedit data {tkd.nama}.
      </p>
      
      {/* Reusing TkdCreateClient for Edit by passing initialValues (need to implement in component) */}
      <TkdCreateClient padukuhanOptions={padukuhanList} />
    </div>
  );
}
