import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/client";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    template: "%s | SI-TAKAL Sitimulyo",
    default: "SI-TAKAL — Sistem Informasi Tanah Sitimulyo",
  },
  description:
    "Sistem Informasi Geospasial Tanah Kas Desa Kalurahan Sitimulyo, Kapanewon Piyungan, Kabupaten Bantul",
  keywords: [
    "tanah kas desa",
    "sitimulyo",
    "piyungan",
    "bantul",
    "GIS",
    "pemetaan",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <div className="page-bg" aria-hidden="true" />
        <TRPCProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#101c44",
                color: "#f3e9cf",
                border: "1px solid #a07d2f",
                fontFamily: '"Cinzel", serif',
                fontSize: "13px",
                letterSpacing: "0.5px",
              },
              classNames: {
                success: "border-l-4 border-l-green-500",
                error: "border-l-4 border-l-red-500",
                warning: "border-l-4 border-l-yellow-500",
              },
            }}
          />
        </TRPCProvider>
      </body>
    </html>
  );
}
