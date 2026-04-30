import type { Metadata } from "next";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { BerandaClient } from "./BerandaClient";
import { auth } from "@/lib/auth/config";

export const metadata: Metadata = {
  title: "Beranda | SI-TKDes Sitimulyo",
  description:
    "Sistem Informasi Tanah Kas Desa Kalurahan Sitimulyo — Peta interaktif dan data geospasial tanah kas desa.",
};

const PADUKUHAN_LIST = [
  "Babadan", "Karanganom", "Karang Tengah", "Mojosari", "Karangploso",
  "Nglengis", "Somokaton", "Mutihan", "Ngampon", "Banyakan I",
  "Banyakan II", "Banyakan III", "Pagergunung I", "Pagergunung II",
];

export default async function BerandaPage() {
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
        <BerandaClient padukuhanList={PADUKUHAN_LIST} />
      </main>
      <Footer />
    </div>
  );
}
