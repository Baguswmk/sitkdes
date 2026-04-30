import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as {
    name?: string | null;
    email?: string | null;
    role?: string;
    username?: string;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar
        userName={user.name ?? "Pengguna"}
        userRole={user.role ?? "OPERATOR"}
        userEmail={user.email ?? ""}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Admin top bar */}
        <div
          style={{
            background: "var(--cream-50)",
            borderBottom: "2px solid var(--gold-600)",
            padding: "12px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 16,
            fontFamily: '"Cinzel", serif',
            fontSize: 11,
            letterSpacing: 2,
            color: "var(--navy-800)",
          }}
        >
          <span>PANEL ADMINISTRASI</span>
          <span style={{ color: "var(--gold-500)" }}>❦</span>
          <span>SI-TKDes SITIMULYO</span>
        </div>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            padding: "32px 36px",
            background: "transparent",
            overflowX: "auto",
          }}
          className="max-[768px]:px-4 max-[768px]:py-5"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
