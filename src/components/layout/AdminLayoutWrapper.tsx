"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
    username?: string;
  };
};

export function AdminLayoutWrapper({ children, user }: Props) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change in mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }} >
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar with translation */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          userName={user.name ?? "Pengguna"}
          userRole={user.role ?? "OPERATOR"}
          userEmail={user.email ?? ""}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Admin top bar */}
        <div
          className="flex items-center justify-between md:justify-end px-4 py-3 md:px-8 border-b-2 border-[#c49a45] bg-[#fffbf0]"
          style={{
            fontFamily: '"Cinzel", serif',
            fontSize: 11,
            letterSpacing: 2,
            color: "var(--navy-800)",
          }}
        >
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-1 text-[#1a237e]"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <span className="hidden sm:inline">PANEL ADMINISTRASI</span>
            <span
              className="hidden sm:inline"
              style={{ color: "var(--gold-500)" }}
            >
              ❦
            </span>
            <span>SI-TKDes SITIMULYO</span>
          </div>
        </div>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            background: "transparent",
            overflowX: "hidden", // Change to hidden to prevent horizontal scroll at the main level, tables should scroll internally
          }}
          className="p-4 md:p-8 md:!mt-8 !ml-4"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
