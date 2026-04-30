"use client";

import Link from "next/link";
import { ClipboardList, Map, Plus, Clock, AlertCircle } from "lucide-react";

type Log = {
  action: string;
  description: string;
  performedAt: string;
  entityType?: string;
};

type Props = {
  totalBidang: number;
  pending: number;
  userRole: string;
  recentLogs: Log[];
};

const ACTION_ICON: Record<string, string> = {
  tkd_created: "🟢",
  tkd_updated: "🔵",
  tkd_submitted: "🟡",
  tkd_approved: "✅",
  tkd_rejected: "🔴",
  login_success: "🔓",
  password_changed: "🔑",
};

export function AdminDashboardClient({ totalBidang, pending, userRole, recentLogs }: Props) {
  return (
    <div className="animate-fadeUp">
      {/* Page title */}
      <div className="section-title-heritage">DASHBOARD</div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 36 }}
        className="max-[768px]:grid-cols-1"
      >
        <div className="stat-card-heritage">
          <div className="stat-label">TOTAL DATA TKD</div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, fontWeight: 700, color: "var(--navy-900)", lineHeight: 1, marginTop: 8 }}>
            {totalBidang}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic", marginTop: 4 }}>bidang terdaftar</div>
        </div>

        <div className="stat-card-heritage" style={{ borderLeftColor: pending > 0 ? "#e09f3e" : undefined }}>
          <div className="stat-label">MENUNGGU REVIEW</div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, fontWeight: 700, color: pending > 0 ? "#e09f3e" : "var(--navy-900)", lineHeight: 1, marginTop: 8 }}>
            {pending}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic", marginTop: 4 }}>
            {pending > 0 ? "⚠ Perlu ditindaklanjuti" : "Semua bersih"}
          </div>
        </div>

        <div className="stat-card-heritage">
          <div className="stat-label">ROLE ANDA</div>
          <div style={{ fontFamily: '"Cinzel", serif', fontSize: 20, fontWeight: 700, color: "var(--navy-900)", lineHeight: 1, marginTop: 8 }}>
            {userRole === "SUPER_ADMIN" ? "Super Admin" : userRole === "ADMIN_DESA" ? "Admin Desa" : "Operator"}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic", marginTop: 4 }}>hak akses sistem</div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: 36 }}>
        <div className="section-title-heritage">AKSI CEPAT</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/admin/tkd/create" className="btn-heritage"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", padding: "12px 24px" }}
          >
            <Plus size={15} /> Tambah Data TKD
          </Link>
          <Link href="/admin/tkd" className="btn-heritage"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", padding: "12px 24px" }}
          >
            <ClipboardList size={15} /> Kelola TKD
          </Link>
          <Link href="/admin/peta-lengkap" className="btn-heritage"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", padding: "12px 24px" }}
          >
            <Map size={15} /> Peta Lengkap
          </Link>
        </div>
      </div>

      {/* Pending alert */}
      {pending > 0 && (
        <div
          style={{
            background: "rgba(224,159,62,.12)",
            border: "1px solid rgba(224,159,62,.5)",
            borderRadius: 8,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 36,
            fontFamily: '"Manrope", sans-serif',
            fontSize: 13,
            color: "var(--ink)",
          }}
        >
          <AlertCircle size={18} color="#e09f3e" />
          Terdapat <strong>{pending} data TKD</strong> yang menunggu review.{" "}
          {userRole !== "OPERATOR" && (
            <Link href="/admin/tkd?status=PENDING_REVIEW" style={{ color: "var(--navy-700)", fontWeight: 600 }}>
              Tinjau sekarang →
            </Link>
          )}
        </div>
      )}

      {/* Recent activity */}
      <div>
        <div className="section-title-heritage">AKTIVITAS TERAKHIR</div>
        {recentLogs.length === 0 ? (
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic", color: "var(--ink-soft)", fontSize: 17 }}>
            Belum ada aktivitas tercatat.
          </p>
        ) : (
          <div className="card-heritage" style={{ overflow: "hidden" }}>
            {recentLogs.map((log, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < recentLogs.length - 1 ? "1px solid rgba(160,125,47,.15)" : "none",
                  background: i % 2 === 0 ? "rgba(255,248,210,.2)" : "transparent",
                }}
              >
                <span style={{ fontSize: 18, marginTop: 1 }}>
                  {ACTION_ICON[log.action] ?? "📋"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: '"Manrope", sans-serif', fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>
                    {log.description}
                  </div>
                  <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 14, color: "var(--ink-soft)", marginTop: 2, fontStyle: "italic" }}>
                    <Clock size={11} style={{ display: "inline", marginRight: 4 }} />
                    {new Date(log.performedAt).toLocaleString("id-ID", {
                      dateStyle: "medium", timeStyle: "short",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
