"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Map,
  MapPin,
  ClipboardList,
  Users,
  Settings,
  FileText,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  minRole?: "VIEWER" | "OPERATOR" | "ADMIN_DESA" | "SUPER_ADMIN";
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />, minRole: "OPERATOR" },
  { href: "/admin/tkd", label: "Kelola TKD", icon: <ClipboardList size={18} /> },
  { href: "/admin/peta-lengkap", label: "Peta Lengkap", icon: <Map size={18} /> },
  { href: "/admin/padukuhan", label: "Kelola Padukuhan", icon: <MapPin size={18} />, minRole: "ADMIN_DESA" },
  { href: "/admin/audit", label: "Audit Log", icon: <FileText size={18} />, minRole: "ADMIN_DESA" },
  { href: "/admin/users", label: "Kelola User", icon: <Users size={18} />, minRole: "SUPER_ADMIN" },
  { href: "/admin/settings", label: "Pengaturan", icon: <Settings size={18} />, minRole: "SUPER_ADMIN" },
];

const ROLE_LEVEL: Record<string, number> = {
  SUPER_ADMIN: 3, ADMIN_DESA: 2, OPERATOR: 1, VIEWER: 0,
};

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "#c62828" },
  ADMIN_DESA:  { label: "Admin Desa",  color: "#1e3070" },
  OPERATOR:    { label: "Operator",    color: "#546e7a" },
  VIEWER:      { label: "Masyarakat",  color: "#6a1b9a" },
};

type Props = {
  userName: string;
  userRole: string;
  userEmail: string;
};

export function AdminSidebar({ userName, userRole, userEmail }: Props) {
  const pathname = usePathname();
  const userLevel = ROLE_LEVEL[userRole] ?? 1;
  const roleBadge = ROLE_BADGE[userRole] ?? ROLE_BADGE.OPERATOR;

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.minRole) return true;
    return userLevel >= (ROLE_LEVEL[item.minRole] ?? 1);
  });

  return (
    <aside
      style={{
        width: 260,
        minHeight: "100vh",
        background: "linear-gradient(180deg, var(--navy-900) 0%, var(--navy-950) 100%)",
        borderRight: "2px solid var(--gold-600)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(196,154,69,.3)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Image src="/icon.PNG" alt="Logo" width={40} height={54} />
        <div>
          <div style={{ fontFamily: '"Cinzel", serif', fontSize: 15, fontWeight: 800, color: "#fff9e3", letterSpacing: 1 }}>
            SI-TAKAL
          </div>
          <div style={{ fontFamily: '"Cinzel", serif', fontSize: 7.5, letterSpacing: 2, color: "var(--gold-400)", marginTop: 1 }}>
            ADMIN PANEL
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <div style={{ fontFamily: '"Cinzel", serif', fontSize: 9, letterSpacing: 3, color: "var(--gold-600)", padding: "0 8px", marginBottom: 10 }}>
          NAVIGASI
        </div>
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 8,
                textDecoration: "none",
                marginBottom: 2,
                background: isActive
                  ? "linear-gradient(90deg, rgba(214,178,90,.15), rgba(214,178,90,.05))"
                  : "transparent",
                borderLeft: isActive ? "3px solid var(--gold-400)" : "3px solid transparent",
                color: isActive ? "var(--gold-100)" : "var(--cream-200)",
                fontFamily: '"Manrope", sans-serif',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                transition: "all .2s",
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
              {isActive && (
                <ChevronRight size={14} style={{ marginLeft: "auto", color: "var(--gold-400)" }} />
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(196,154,69,.2)", margin: "16px 8px" }} />

        {/* Profile */}
        <Link
          href="/admin/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 8,
            textDecoration: "none",
            color: "var(--cream-200)",
            fontFamily: '"Manrope", sans-serif',
            fontSize: 13,
            transition: "all .2s",
          }}
        >
          <User size={18} style={{ opacity: 0.7 }} />
          Profil Saya
        </Link>

        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 8,
            textDecoration: "none",
            color: "var(--cream-200)",
            fontFamily: '"Manrope", sans-serif',
            fontSize: 13,
            transition: "all .2s",
          }}
        >
          <MapPin size={18} style={{ opacity: 0.7 }} />
          Lihat Halaman Publik
        </Link>
      </nav>

      {/* User info + logout */}
      <div
        style={{
          padding: "16px 16px 20px",
          borderTop: "1px solid rgba(196,154,69,.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 36, height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--navy-700), var(--navy-600))",
              border: "2px solid var(--gold-600)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <User size={16} color="var(--gold-400)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: '"Manrope", sans-serif', fontSize: 13, fontWeight: 600, color: "var(--cream-100)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName}
            </div>
            <span
              style={{
                fontFamily: '"Cinzel", serif',
                fontSize: 9,
                letterSpacing: 1.5,
                color: "white",
                background: roleBadge.color,
                padding: "2px 7px",
                borderRadius: 999,
                display: "inline-block",
                marginTop: 2,
              }}
            >
              {roleBadge.label}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "9px 0",
            background: "rgba(214,178,90,.1)",
            border: "1px solid rgba(214,178,90,.3)",
            borderRadius: 8,
            color: "var(--cream-200)",
            fontFamily: '"Manrope", sans-serif',
            fontSize: 12,
            cursor: "pointer",
            transition: "all .2s",
          }}
        >
          <LogOut size={14} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
