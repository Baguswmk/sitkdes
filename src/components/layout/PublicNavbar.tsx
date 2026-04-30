"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, LayoutDashboard, User, LogOut, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/peta", label: "Peta Digital" },
  { href: "/data", label: "Data TKD" },
];

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN_DESA: "Admin Desa",
  OPERATOR: "Operator",
  PUBLIC: "Publik",
};

interface PublicNavbarProps {
  isLoggedIn?: boolean;
  /** Display name of the logged-in user */
  userName?: string | null;
  /** Role of the logged-in user */
  userRole?: string | null;
}

/* ─── Profile Chip (shows when logged in) ─────────── */
function ProfileChip({
  name,
  role,
}: {
  name: string;
  role: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = name.charAt(0).toUpperCase();
  const roleLabel = ROLE_LABEL[role] ?? role;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Chip button */}
      <button
        id="profile-chip-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
          border: "1.5px solid var(--gold-500)",
          borderRadius: 999,
          padding: "6px 14px 6px 6px",
          cursor: "pointer",
          transition: "box-shadow .2s, transform .2s",
          boxShadow: "var(--shadow-mid), var(--shadow-inset)",
          color: "var(--cream-100)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 24px rgba(0,0,0,.35), var(--shadow-inset)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-mid), var(--shadow-inset)";
        }}
      >
        {/* Avatar circle */}
        <span
          aria-hidden="true"
          style={{
            width: 30, height: 30,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
            display: "grid", placeItems: "center",
            fontFamily: '"Cinzel", serif',
            fontWeight: 700,
            fontSize: 13,
            color: "#fff9e3",
            flexShrink: 0,
            boxShadow: "0 0 0 2px rgba(214,178,90,.35)",
          }}
        >
          {initial}
        </span>

        {/* Name + role */}
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
          <span style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 600, fontSize: 13, color: "var(--cream-100)", whiteSpace: "nowrap" }}>
            {name}
          </span>
          <span style={{ fontFamily: '"Cinzel", serif', fontSize: 9, letterSpacing: "1.5px", color: "var(--gold-400)", whiteSpace: "nowrap" }}>
            {roleLabel.toUpperCase()}
          </span>
        </span>

        <ChevronDown
          size={14}
          style={{
            color: "var(--gold-400)",
            transform: open ? "rotate(180deg)" : "",
            transition: "transform .2s",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            minWidth: 200,
            background: "linear-gradient(180deg, var(--navy-800), var(--navy-900))",
            border: "1px solid var(--gold-600)",
            borderRadius: 10,
            boxShadow: "var(--shadow-deep)",
            overflow: "hidden",
            zIndex: 200,
            animation: "fadeUp .18s ease both",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "12px 16px",
            borderBottom: "1px solid rgba(160,125,47,.3)",
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: "italic",
            fontSize: 13,
            color: "var(--cream-200)",
          }}>
            Masuk sebagai <strong style={{ color: "var(--gold-400)", fontStyle: "normal" }}>{name}</strong>
          </div>

          {/* Menu items */}
          <Link
            href="/admin"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 16px",
              fontFamily: '"Cinzel", serif',
              fontSize: 11,
              letterSpacing: "1.5px",
              color: "var(--cream-100)",
              textDecoration: "none",
              transition: "background .15s, color .15s",
              borderBottom: "1px solid rgba(160,125,47,.15)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(214,178,90,.12)";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--gold-100)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--cream-100)";
            }}
          >
            <LayoutDashboard size={14} style={{ color: "var(--gold-400)", flexShrink: 0 }} />
            DASHBOARD
          </Link>

          <Link
            href="/admin/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 16px",
              fontFamily: '"Cinzel", serif',
              fontSize: 11,
              letterSpacing: "1.5px",
              color: "var(--cream-100)",
              textDecoration: "none",
              transition: "background .15s, color .15s",
              borderBottom: "1px solid rgba(160,125,47,.15)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(214,178,90,.12)";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--gold-100)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--cream-100)";
            }}
          >
            <User size={14} style={{ color: "var(--gold-400)", flexShrink: 0 }} />
            PROFIL SAYA
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            role="menuitem"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "11px 16px",
              fontFamily: '"Cinzel", serif',
              fontSize: 11,
              letterSpacing: "1.5px",
              color: "#ef9a9a",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,154,154,.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "";
            }}
          >
            <LogOut size={14} style={{ color: "#ef9a9a", flexShrink: 0 }} />
            KELUAR
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Public Navbar ───────────────────────────────── */
export function PublicNavbar({
  isLoggedIn = false,
  userName,
  userRole,
}: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        background: "linear-gradient(180deg, var(--navy-900) 0%, var(--navy-800) 55%, var(--navy-900) 100%)",
        borderBottom: "3px solid var(--gold-500)",
        boxShadow: "0 6px 24px rgba(0,0,0,.25)",
        position: "relative",
        color: "var(--cream-100)",
      }}
    >
      {/* Gold shimmer on bottom border */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", left: 0, right: 0, bottom: -3, height: 3,
          background: "linear-gradient(90deg, transparent, var(--gold-400) 20%, var(--gold-100) 50%, var(--gold-400) 80%, transparent)",
          boxShadow: "0 1px 0 rgba(0,0,0,.3)",
        }}
      />
      {/* Gold glow overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(600px 120px at 10% 0%, rgba(214,178,90,.15), transparent 60%), radial-gradient(600px 120px at 90% 100%, rgba(214,178,90,.1), transparent 60%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 28,
          alignItems: "center",
          maxWidth: 1400,
          margin: "0 auto",
          padding: "18px 48px 22px",
        }}
        className="max-[960px]:grid-cols-1 max-[960px]:text-center max-[960px]:px-5"
      >
        {/* Brand / Logo */}
        <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
          <Image src="/icon.PNG" alt="Lambang Bantul" width={72} height={96} priority />
          <Image
            src="/text.PNG"
            alt="Kalurahan Sitimulyo"
            width={120}
            height={40}
            style={{ filter: "invert(1)", marginTop: 4 }}
          />
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", padding: "0 20px" }}>
          <div
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: 42,
              fontWeight: 800,
              color: "#fff9e3",
              letterSpacing: 1,
              textShadow: "0 2px 0 rgba(0,0,0,.4), 0 0 24px rgba(214,178,90,.15)",
              lineHeight: 1,
            }}
          >
            SI-TKDes
          </div>
          <div
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 4,
              color: "var(--gold-400)",
              marginTop: 6,
            }}
          >
            SISTEM INFORMASI TANAH KAS DESA
          </div>
          <div
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--cream-200)",
              opacity: 0.85,
              marginTop: 8,
              letterSpacing: 1,
            }}
          >
            ꦱꦶꦱ꧀ꦠꦺꦩ꧀ ꦆꦤ꧀ꦥꦺꦴꦂꦩꦱꦶ ꦠꦤꦃ ꦏꦱ꧀ ꦢꦺꦱ
          </div>
        </div>

        {/* Nav + Auth */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}
          className="max-[960px]:items-center"
        >
          {/* Logged-in: profile chip, logged-out: login link */}
          {isLoggedIn && userName ? (
            <ProfileChip name={userName} role={userRole ?? "PUBLIC"} />
          ) : (
            <Link
              href="/login"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: "italic",
                fontSize: 18,
                color: "var(--cream-100)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "color .25s",
              }}
              className="hover:text-[var(--gold-400)] group"
            >
              Log in{" "}
              <span style={{ transition: "transform .25s" }} className="group-hover:translate-x-1 inline-block">
                →
              </span>
            </Link>
          )}

          {/* Desktop nav */}
          <nav style={{ display: "flex", gap: 14 }} className="max-[600px]:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "1.5px",
                  color: pathname === link.href ? "var(--gold-100)" : "var(--cream-100)",
                  background: "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
                  border: "1px solid var(--gold-600)",
                  padding: "10px 20px",
                  borderRadius: 40,
                  textDecoration: "none",
                  position: "relative",
                  boxShadow: "var(--shadow-mid), var(--shadow-inset)",
                  transition: "transform .2s, box-shadow .2s, color .2s",
                  display: "inline-block",
                  whiteSpace: "nowrap",
                }}
              >
                {link.label}
                {pathname === link.href && (
                  <span
                    style={{
                      position: "absolute",
                      left: 20, right: 20, bottom: 6,
                      height: 1.5,
                      background: "linear-gradient(90deg, transparent, var(--gold-400), transparent)",
                      display: "block",
                    }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile burger */}
          <button
            className="hidden max-[600px]:block"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "none", border: "none", color: "var(--cream-100)", cursor: "pointer" }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            background: "var(--navy-900)",
            borderTop: "1px solid var(--gold-600)",
            padding: "12px 20px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: '"Cinzel", serif',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "1.5px",
                color: "var(--cream-100)",
                padding: "10px 16px",
                borderRadius: 8,
                textDecoration: "none",
                border: "1px solid var(--gold-600)",
                background: "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile auth row */}
          {isLoggedIn ? (
            <>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "1.5px",
                  color: "var(--gold-100)",
                  padding: "10px 16px",
                  borderRadius: 8,
                  textDecoration: "none",
                  border: "1.5px solid var(--gold-500)",
                  background: "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <LayoutDashboard size={14} />
                DASHBOARD
              </Link>
              <Link
                href="/admin/profile"
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "1.5px",
                  color: "var(--cream-100)",
                  padding: "10px 16px",
                  borderRadius: 8,
                  textDecoration: "none",
                  border: "1px solid var(--gold-600)",
                  background: "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <User size={14} />
                PROFIL SAYA
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: '"Cinzel", serif',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "1.5px",
                color: "var(--gold-100)",
                padding: "10px 16px",
                borderRadius: 8,
                textDecoration: "none",
                border: "1.5px solid var(--gold-500)",
                background: "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
              }}
            >
              LOG IN →
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
