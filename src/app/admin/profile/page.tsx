import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { User, Shield, Key } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as any;

  return (
    <div className="animate-fadeUp max-w-4xl mx-auto">
      <div className="section-title-heritage">PROFIL SAYA</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32 }} className="max-[768px]:grid-cols-1">
        {/* Info Card */}
        <div className="card-heritage" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, margin: "0 auto 20px", background: "var(--navy-800)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid var(--gold-500)" }}>
            <User size={40} color="var(--gold-400)" />
          </div>
          <div style={{ fontFamily: '"Cinzel", serif', fontSize: 20, fontWeight: 700, color: "var(--navy-900)" }}>
            {user.name}
          </div>
          <div style={{ fontFamily: '"Manrope", sans-serif', fontSize: 14, color: "var(--ink-soft)", marginTop: 4 }}>
            {user.email || user.username}
          </div>
          
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(214,178,90,.15)", padding: "6px 14px", borderRadius: 999, marginTop: 16, border: "1px solid var(--gold-600)" }}>
            <Shield size={16} color="var(--navy-800)" />
            <span style={{ fontFamily: '"Cinzel", serif', fontSize: 12, fontWeight: 600, color: "var(--navy-900)", letterSpacing: 1 }}>
              {user.role?.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card-heritage" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, borderBottom: "1px solid rgba(160,125,47,.2)", paddingBottom: 16 }}>
            <Key size={20} color="var(--navy-800)" />
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 16, fontWeight: 700, color: "var(--navy-900)" }}>GANTI PASSWORD</div>
          </div>
          
          <form style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label className="label-heritage">Password Saat Ini</label>
              <input type="password" className="input-heritage" placeholder="••••••••" />
            </div>
            <div>
              <label className="label-heritage">Password Baru</label>
              <input type="password" className="input-heritage" placeholder="Minimal 12 karakter" />
              <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 6 }}>Harus mengandung kombinasi huruf besar, kecil, angka, dan simbol.</p>
            </div>
            <div>
              <label className="label-heritage">Konfirmasi Password Baru</label>
              <input type="password" className="input-heritage" placeholder="Ulangi password baru" />
            </div>
            
            <button type="button" className="btn-heritage" style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
              PERBARUI PASSWORD
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
