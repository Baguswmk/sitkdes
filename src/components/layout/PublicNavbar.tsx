"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
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
  userName?: string | null;
  userRole?: string | null;
}

/* ─── Profile Chip ─────────────────────────────────── */
function ProfileChip({
  name,
  role,
  compact = false,
}: {
  name: string;
  role: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const initial = name.charAt(0).toUpperCase();
  const roleLabel = ROLE_LABEL[role] ?? role;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={compact ? `Menu profil: ${name}` : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: compact ? 0 : 10,
          background:
            "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
          border: "1.5px solid var(--gold-500)",
          borderRadius: 999,
          padding: compact ? 4 : "6px 14px 6px 6px",
          cursor: "pointer",
          transition: "box-shadow .2s, transform .2s",
          boxShadow: "var(--shadow-mid), var(--shadow-inset)",
          color: "var(--cream-100)",
          maxWidth: compact ? undefined : 240,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: compact ? 34 : 30,
            height: compact ? 34 : 30,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
            display: "grid",
            placeItems: "center",
            fontFamily: '"Cinzel", serif',
            fontWeight: 700,
            fontSize: compact ? 15 : 13,
            color: "#fff9e3",
            flexShrink: 0,
            boxShadow: "0 0 0 2px rgba(214,178,90,.35)",
          }}
        >
          {initial}
        </span>

        {!compact && (
          <>
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                lineHeight: 1.2,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  color: "var(--cream-100)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 140,
                }}
              >
                {name}
              </span>
              <span
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: 9,
                  letterSpacing: "1.5px",
                  color: "var(--gold-400)",
                  whiteSpace: "nowrap",
                }}
              >
                {roleLabel.toUpperCase()}
              </span>
            </span>

            <ChevronDown
              size={14}
              style={{
                color: "var(--gold-400)",
                transform: open ? "rotate(180deg)" : "",
                transition: "transform .2s",
                flexShrink: 0,
              }}
            />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            minWidth: 220,
            background:
              "linear-gradient(180deg, var(--navy-800), var(--navy-900))",
            border: "1px solid var(--gold-600)",
            borderRadius: 10,
            boxShadow: "var(--shadow-deep)",
            overflow: "hidden",
            zIndex: 200,
            animation: "fadeUp .18s ease both",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(160,125,47,.3)",
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: 13,
              color: "var(--cream-200)",
            }}
          >
            Masuk sebagai
            <strong
              style={{
                color: "var(--gold-400)",
                fontStyle: "normal",
                display: "block",
                marginTop: 2,
                fontFamily: '"Manrope", sans-serif',
                fontSize: 14,
                wordBreak: "break-word",
              }}
            >
              {name}
            </strong>
            <span
              style={{
                display: "block",
                marginTop: 4,
                fontFamily: '"Cinzel", serif',
                fontSize: 9,
                letterSpacing: "1.5px",
                color: "var(--gold-400)",
                fontStyle: "normal",
              }}
            >
              {roleLabel.toUpperCase()}
            </span>
          </div>

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
              borderBottom: "1px solid rgba(160,125,47,.15)",
            }}
          >
            <LayoutDashboard size={14} style={{ color: "var(--gold-400)" }} />
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
              borderBottom: "1px solid rgba(160,125,47,.15)",
            }}
          >
            <User size={14} style={{ color: "var(--gold-400)" }} />
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
            }}
          >
            <LogOut size={14} style={{ color: "#ef9a9a" }} />
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

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    function handler(e: MediaQueryListEvent) {
      if (e.matches) setMobileOpen(false);
    }
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  return (
    <header
      style={{
        position: "relative",
        background:
          "linear-gradient(180deg, var(--navy-900) 0%, var(--navy-800) 55%, var(--navy-900) 100%)",
        color: "#f3e9cf",
        borderBottom: "3px solid var(--gold-500)",
        boxShadow: "0 6px 24px rgba(0,0,0,.25)",
      }}
    >
      {/* Gold shimmer (HTML ref: .topbar::before) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -3,
          height: 3,
          background:
            "linear-gradient(90deg, transparent, var(--gold-400) 20%, var(--gold-100) 50%, var(--gold-400) 80%, transparent)",
          boxShadow: "0 1px 0 rgba(0,0,0,.3)",
        }}
      />
      {/* Gold glow (HTML ref: .topbar::after) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(600px 120px at 10% 0%, rgba(214,178,90,.15), transparent 60%), radial-gradient(600px 120px at 90% 100%, rgba(214,178,90,.1), transparent 60%)",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-4 lg:pt-[18px] lg:pb-[22px] flex items-center justify-between gap-3 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-7">
        {/* ─── Brand (.brand) ─────────────────────────
            Desktop: column (icon + wordmark stacked)
            Mobile:  row (icon + text label) */}
        <Link
          href="/"
          className="flex items-center lg:flex-col lg:items-center gap-2 sm:gap-3 lg:gap-0 min-w-0 shrink-0"
          style={{ textDecoration: "none" }}
        >
          <Image
            src="/icon.PNG"
            alt="Lambang Bantul"
            width={90}
            height={120}
            priority
            className="w-[40px] h-auto sm:w-[48px] lg:w-[90px] lg:h-[120px] shrink-0 "
          />

          {/* Desktop wordmark (.brand .text) — exact ref sizing */}
          <Image
            src="/text.PNG"
            alt="Kalurahan Sitimulyo"
            width={150}
            height={50}
            style={{ filter: "invert(1)" }}
            className="hidden lg:block lg:w-[150px] lg:h-[50px] lg:mt-1"
          />

          {/* Mobile/tablet wordmark text */}
          <div className="block lg:hidden text-left min-w-0">
            <div
              style={{
                fontFamily: '"Cinzel", serif',
                fontWeight: 800,
                color: "#fff9e3",
                lineHeight: 1,
                letterSpacing: 0.5,
              }}
              className="text-lg sm:text-xl truncate"
            >
              SI-TKDes
            </div>
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: "italic",
                color: "var(--gold-400)",
                marginTop: 3,
              }}
              className="text-[11px] sm:text-xs truncate"
            >
              Kalurahan Sitimulyo
            </div>
          </div>
        </Link>

        {/* ─── Center title (.title-block) — desktop only ─── */}
        <div
          style={{ textAlign: "center", padding: "0 20px" }}
          className="hidden lg:block"
        >
          <div
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: 42,
              fontWeight: 800,
              color: "#fff9e3",
              letterSpacing: 1,
              textShadow:
                "0 2px 0 rgba(0,0,0,.4), 0 0 24px rgba(214,178,90,.15)",
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

        {/* ─── Right column (.nav-wrap) ──────────────
            Desktop: column, end-aligned, gap 14
              row 1: login link OR profile chip
              row 2: nav buttons (.nav)
            Mobile: row (compact chip + burger) */}
<div className="flex items-center gap-2 sm:gap-3 lg:flex-col lg:items-end lg:gap-[14px] shrink-0">

          {/* Desktop top row */}
          <div className="hidden lg:block">
            {isLoggedIn && userName ? (
              <ProfileChip name={userName} role={userRole ?? "PUBLIC"} />
            ) : (
              <Link
                href="/login"
                className="group"
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
              >
                <span className="group-hover:text-[var(--gold-400)] transition-colors">
                  Log in
                </span>
                <span
                  className="group-hover:translate-x-1 inline-block"
                  style={{ transition: "transform .25s" }}
                >
                  →
                </span>
              </Link>
            )}
          </div>

          {/* Desktop nav buttons (.nav) — gap:14, padding:10px 26px */}
          <nav className="hidden lg:flex" style={{ gap: 14 }}>
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: '"Cinzel", serif',
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: "1.5px",
                    color: active ? "var(--gold-100)" : "var(--cream-100)",
                    background:
                      "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
                    border: "1px solid var(--gold-600)",
                    padding: "10px 26px",
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
                  {active && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: 26,
                        right: 26,
                        bottom: 6,
                        height: 1.5,
                        background:
                          "linear-gradient(90deg, transparent, var(--gold-400), transparent)",
                        display: "block",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile/tablet auth (compact) */}
          <div className="lg:hidden">
            {isLoggedIn && userName ? (
              <ProfileChip
                name={userName}
                role={userRole ?? "PUBLIC"}
                compact
              />
            ) : (
              <Link
                href="/login"
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontStyle: "italic",
                  color: "var(--cream-100)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}
                className="text-sm sm:text-base"
              >
                Log in
                <span>→</span>
              </Link>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="block lg:hidden text-[var(--cream-100)] cursor-pointer bg-transparent border-none p-1.5 sm:p-2 rounded-md"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ─── Mobile menu ───────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden"
          style={{
            background: "var(--navy-900)",
            borderTop: "1px solid var(--gold-600)",
            padding: "14px 16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxHeight: "calc(100vh - 70px)",
            overflowY: "auto",
          }}
        >
          {isLoggedIn && userName && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                marginBottom: 4,
                borderRadius: 10,
                border: "1px solid var(--gold-600)",
                background:
                  "linear-gradient(180deg, var(--navy-800), var(--navy-900))",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#fff9e3",
                  flexShrink: 0,
                  boxShadow: "0 0 0 2px rgba(214,178,90,.35)",
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 600,
                    fontSize: 14,
                    color: "var(--cream-100)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userName}
                </div>
                <div
                  style={{
                    fontFamily: '"Cinzel", serif',
                    fontSize: 9,
                    letterSpacing: "1.5px",
                    color: "var(--gold-400)",
                    marginTop: 2,
                  }}
                >
                  {(ROLE_LABEL[userRole ?? "PUBLIC"] ?? "Publik").toUpperCase()}
                </div>
              </div>
            </div>
          )}

          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "1.5px",
                  color: active ? "var(--gold-100)" : "var(--cream-100)",
                  padding: "12px 26px",
                  borderRadius: 40,
                  textDecoration: "none",
                  border: active
                    ? "1.5px solid var(--gold-500)"
                    : "1px solid var(--gold-600)",
                  background:
                    "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
                  boxShadow: "var(--shadow-mid), var(--shadow-inset)",
                  textAlign: "center",
                }}
              >
                {link.label}
              </Link>
            );
          })}

          <div
            aria-hidden="true"
            style={{
              height: 1,
              margin: "8px 0 4px",
              background:
                "linear-gradient(90deg, transparent, rgba(214,178,90,.4), transparent)",
            }}
          />

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
                  padding: "12px 16px",
                  borderRadius: 8,
                  textDecoration: "none",
                  border: "1.5px solid var(--gold-500)",
                  background:
                    "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
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
                  padding: "12px 16px",
                  borderRadius: 8,
                  textDecoration: "none",
                  border: "1px solid var(--gold-600)",
                  background:
                    "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <User size={14} />
                PROFIL SAYA
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "1.5px",
                  color: "#ef9a9a",
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(239, 154, 154, 0.4)",
                  background:
                    "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <LogOut size={14} />
                KELUAR
              </button>
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
                padding: "12px 16px",
                borderRadius: 8,
                textDecoration: "none",
                border: "1.5px solid var(--gold-500)",
                background:
                  "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
                textAlign: "center",
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
