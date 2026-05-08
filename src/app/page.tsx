import type { Metadata } from "next";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { BerandaClient } from "./BerandaClient";
import { auth } from "@/lib/auth/config";

export const metadata: Metadata = {
  title: "Beranda | SI-TAKAL Sitimulyo",
  description:
    "Sistem Informasi Tanah Kalurahan Sitimulyo — Peta interaktif dan data geospasial tanah kas desa.",
};

export default async function BerandaPage() {
  const session = await auth();

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <PublicNavbar
        isLoggedIn={!!session}
        userName={session?.user?.name ?? null}
        userRole={(session?.user as { role?: string })?.role ?? null}
      />
      <main
        style={{
          flex: 1,
          padding: "44px 48px 64px",
          maxWidth: 1400,
          margin: "0 auto",
          width: "100%",
        }}
        className="max-[960px]:px-5 max-[960px]:py-7"
      >
        <BerandaClient />
      </main>
      <Footer />
    </div>
  );
}
