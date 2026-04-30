import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { auth } from "@/lib/auth/config";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PublicNavbar
        isLoggedIn={!!session}
        userName={session?.user?.name ?? null}
        userRole={(session?.user as { role?: string })?.role ?? null}
      />
      <main style={{ flex: 1, padding: "44px 48px 64px", maxWidth: 1400, margin: "0 auto", width: "100%" }}
        className="max-[960px]:px-5 max-[960px]:py-7"
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
