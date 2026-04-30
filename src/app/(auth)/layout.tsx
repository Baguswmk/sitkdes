import Image from "next/image";
import { Footer } from "@/components/layout/Footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Mini header */}
      <header
        style={{
          background: "linear-gradient(180deg, var(--navy-900) 0%, var(--navy-800) 55%, var(--navy-900) 100%)",
          borderBottom: "3px solid var(--gold-500)",
          boxShadow: "0 6px 24px rgba(0,0,0,.25)",
          position: "relative",
          padding: "16px 32px",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute", left: 0, right: 0, bottom: -3, height: 3,
            background: "linear-gradient(90deg, transparent, var(--gold-400) 20%, var(--gold-100) 50%, var(--gold-400) 80%, transparent)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 1400, margin: "0 auto" }}>
          <Image src="/icon.PNG" alt="Lambang Bantul" width={48} height={64} priority />
          <div>
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 20, fontWeight: 800, color: "#fff9e3", letterSpacing: 1 }}>
              SI-TKDes
            </div>
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 9, letterSpacing: 3, color: "var(--gold-400)" }}>
              SISTEM INFORMASI TANAH KAS DESA
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
