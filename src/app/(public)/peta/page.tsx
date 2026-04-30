import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { PetaClient } from "./PetaClient";

export const metadata: Metadata = {
  title: "Peta Digital | SI-TKDes Sitimulyo",
  description: "Peta interaktif persebaran Tanah Kas Desa Kalurahan Sitimulyo",
};

export default async function PetaPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/peta");

  const padukuhanList = await db.padukuhan.findMany({
    where: { isActive: true },
    select: { id: true, nama: true },
    orderBy: { urutan: "asc" },
  });

  return <PetaClient padukuhanOptions={padukuhanList} />;
}
