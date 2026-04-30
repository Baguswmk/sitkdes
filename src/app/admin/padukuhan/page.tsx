import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { PadukuhanClient } from "./PadukuhanClient";

export default async function PadukuhanPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const padukuhanList = await db.padukuhan.findMany({
    orderBy: { urutan: "asc" },
    include: {
      _count: {
        select: { tanahKas: { where: { deletedAt: null } } },
      },
    },
  });

  return <PadukuhanClient initialData={padukuhanList} />;
}
