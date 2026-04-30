import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { StatusData } from "@prisma/client";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = (session?.user as { role?: string })?.role ?? "OPERATOR";

  const [totalBidang, pending, recentLogs] = await Promise.all([
    db.tanahKasDesa.count({ where: { deletedAt: null } }),
    db.tanahKasDesa.count({ where: { status: StatusData.PENDING_REVIEW, deletedAt: null } }),
    db.activityLog.findMany({
      where: { userId: userId ?? undefined },
      orderBy: { performedAt: "desc" },
      take: 5,
      select: { action: true, description: true, performedAt: true, entityType: true },
    }),
  ]);

  return (
    <AdminDashboardClient
      totalBidang={totalBidang}
      pending={pending}
      recentLogs={recentLogs.map((l) => ({
        action: l.action,
        description: l.description,
        performedAt: l.performedAt.toISOString(),
        entityType: l.entityType ?? undefined,
      }))}
      userRole={userRole}
    />
  );
}
