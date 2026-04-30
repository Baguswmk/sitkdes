import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { Clock } from "lucide-react";

export default async function AuditLogPage() {
  const session = await auth();
  if (!session) redirect("/login");
  
  const userLevel = session.user && (session.user as any).role === "ADMIN_DESA" || (session.user as any).role === "SUPER_ADMIN";
  if (!userLevel) {
    redirect("/admin");
  }

  const logs = await db.activityLog.findMany({
    orderBy: { performedAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, username: true } } },
  });

  return (
    <div className="animate-fadeUp max-w-6xl mx-auto">
      <div className="section-title-heritage">AUDIT LOG SISTEM</div>
      <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic", fontSize: 16, color: "var(--ink-soft)", marginBottom: 24 }}>
        Menampilkan 100 aktivitas terakhir dalam sistem SI-TKDes.
      </p>

      <div className="card-heritage" style={{ overflowX: "auto" }}>
        <table className="tbl-heritage" style={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th style={{ width: 180, textAlign: "left" }}>Waktu</th>
              <th style={{ textAlign: "left" }}>Pengguna</th>
              <th style={{ textAlign: "left" }}>Aksi</th>
              <th style={{ textAlign: "left" }}>Deskripsi</th>
              <th style={{ textAlign: "left" }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ textAlign: "left", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-soft)" }}>
                    <Clock size={14} />
                    {log.performedAt.toLocaleString("id-ID")}
                  </div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600 }}>{log.user?.name || "System"}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{log.user?.username || "-"}</div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <span style={{ fontFamily: '"Manrope", sans-serif', fontSize: 12, background: "var(--cream-100)", padding: "3px 8px", borderRadius: 4, border: "1px solid var(--gold-400)" }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ textAlign: "left", fontSize: 13 }}>{log.description}</td>
                <td style={{ textAlign: "left", fontSize: 12, color: "var(--ink-soft)" }}>{log.ipAddress || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
