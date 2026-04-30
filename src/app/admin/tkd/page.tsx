import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { TkdListClient } from "./TkdListClient";

export default async function TkdListPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const padukuhanList = await db.padukuhan.findMany({
    where: { isActive: true },
    select: { id: true, nama: true },
    orderBy: { urutan: "asc" },
  });

  return <TkdListClient padukuhanOptions={padukuhanList} />;
}
