import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { DataClient } from "./DataClient";

export const metadata: Metadata = {
  title: "Data Tanah Kas Desa | SI-TAKAL Sitimulyo",
  description: "Daftar publik informasi Tanah Kas Desa Kalurahan Sitimulyo",
};

export default async function DataPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/data");

  const padukuhanList = await db.padukuhan.findMany({
    where: { isActive: true },
    select: { id: true, nama: true },
    orderBy: { urutan: "asc" },
  });

  return <DataClient padukuhanOptions={padukuhanList} />;
}
