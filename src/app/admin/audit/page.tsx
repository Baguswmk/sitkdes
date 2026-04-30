import { requireRole } from "@/lib/auth/session-helper";
import { db } from "@/lib/db/client";
import { AuditPagination } from "./AuditPagination";

export const dynamic = "force-dynamic";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireRole("ADMIN_DESA");

  const resolvedParams = await searchParams;
  const pageStr = Array.isArray(resolvedParams.page) ? resolvedParams.page[0] : resolvedParams.page;
  const page = parseInt(pageStr || "1", 10);
  const itemsPerPage = 20;
  const skip = (page - 1) * itemsPerPage;

  const [total, logs] = await Promise.all([
    db.activityLog.count(),
    db.activityLog.findMany({
      take: itemsPerPage,
      skip,
      orderBy: { performedAt: "desc" },
      include: {
        user: {
          select: { username: true, name: true, role: true },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  return (
    <div className="animate-fadeUp max-w-6xl mx-auto">
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title-heritage" style={{ margin: 0 }}>
          LOG AUDIT SISTEM
        </h1>
        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic", fontSize: 16, color: "var(--ink-soft)", marginTop: 8 }}>
          Riwayat aktivitas dalam sistem.
        </p>
      </div>

      <div className="card-heritage" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl-heritage" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", width: 150 }}>Waktu</th>
                <th style={{ textAlign: "left" }}>User</th>
                <th style={{ textAlign: "left" }}>Role</th>
                <th style={{ textAlign: "left" }}>Aksi</th>
                <th style={{ textAlign: "left" }}>Entitas</th>
                <th style={{ textAlign: "left" }}>Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 0", fontStyle: "italic", textAlign: "center", color: "var(--ink-soft)" }}>
                    Belum ada log aktivitas.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ textAlign: "left", color: "var(--navy-700)" }}>
                      {new Date(log.performedAt).toLocaleString("id-ID", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td style={{ textAlign: "left", fontWeight: 600, color: "var(--navy-900)" }}>
                      {log.user?.name ?? log.user?.username ?? "—"}
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-[var(--gold-100)] text-[var(--navy-900)]">
                        {log.user?.role ?? "—"}
                      </span>
                    </td>
                    <td style={{ textAlign: "left", fontFamily: "monospace", fontSize: 12, color: "var(--navy-700)" }}>
                      {log.action}
                    </td>
                    <td style={{ textAlign: "left", color: "var(--navy-700)" }}>
                      {log.entityType ?? "—"}
                      {log.entityId ? (
                        <span style={{ color: "var(--navy-500)", fontSize: 12, marginLeft: 4 }}>
                          #{log.entityId.slice(0, 8)}
                        </span>
                      ) : null}
                    </td>
                    <td style={{ textAlign: "left", color: "var(--navy-600)", fontSize: 13, maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={log.description || ""}>
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <AuditPagination totalPages={totalPages} totalItems={total} itemsPerPage={itemsPerPage} />
      </div>
    </div>
  );
}