"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import type { UserRole } from "@prisma/client";

type Props = {
  user: {
    id: string;
    username: string;
    email: string | null;
    name: string | null;
    role: UserRole;
    mustChangePassword: boolean;
  };
};

export default function ProfileClient({ user }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok");
      return;
    }
    changePassword.mutate({ currentPassword, newPassword, confirmPassword });
  };

  return (
    <div className="animate-fadeUp max-w-3xl mx-auto">
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title-heritage" style={{ margin: 0 }}>
          PROFIL SAYA
        </h1>
        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic", fontSize: 16, color: "var(--ink-soft)", marginTop: 8 }}>
          Informasi akun dan pengaturan keamanan.
        </p>
      </div>

      {/* Info Akun */}
      <div className="card-heritage" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontFamily: '"Cinzel", serif', fontSize: 18, fontWeight: 700, color: "var(--navy-900)", marginBottom: 20, borderBottom: "1px solid rgba(160,125,47,.2)", paddingBottom: 12 }}>
          Informasi Akun
        </h2>
        <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="max-[600px]:grid-cols-1">
          <div>
            <dt className="label-heritage">USERNAME</dt>
            <dd style={{ fontFamily: '"Manrope", sans-serif', fontSize: 16, fontWeight: 600, color: "var(--navy-900)" }}>
              {user.username}
            </dd>
          </div>
          <div>
            <dt className="label-heritage">NAMA LENGKAP</dt>
            <dd style={{ fontFamily: '"Manrope", sans-serif', fontSize: 16, fontWeight: 600, color: "var(--navy-900)" }}>
              {user.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="label-heritage">EMAIL</dt>
            <dd style={{ fontFamily: '"Manrope", sans-serif', fontSize: 16, fontWeight: 600, color: "var(--navy-900)" }}>
              {user.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="label-heritage">ROLE / PERAN</dt>
            <dd>
              <span style={{ 
                display: "inline-flex", alignItems: "center", padding: "4px 12px", 
                borderRadius: 999, background: "var(--gold-100)", color: "var(--navy-900)", 
                fontFamily: '"Manrope", sans-serif', fontSize: 13, fontWeight: 700 
              }}>
                {user.role.replace("_", " ")}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Ubah Password */}
      <form onSubmit={handleSubmit} className="card-heritage" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontFamily: '"Cinzel", serif', fontSize: 18, fontWeight: 700, color: "var(--navy-900)", marginBottom: 4, borderBottom: "1px solid rgba(160,125,47,.2)", paddingBottom: 12 }}>
          Ubah Password
        </h2>

        <div>
          <label className="label-heritage">PASSWORD LAMA</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="input-heritage"
            placeholder="Masukkan password saat ini"
          />
        </div>

        <div>
          <label className="label-heritage">PASSWORD BARU</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="input-heritage"
            placeholder="Masukkan password baru"
          />
          <p style={{ fontFamily: '"Manrope", sans-serif', fontSize: 12, color: "var(--ink-soft)", marginTop: 6, fontStyle: "italic" }}>
            *Minimal 8 karakter, mengandung huruf besar, kecil, angka, dan simbol.
          </p>
        </div>

        <div>
          <label className="label-heritage">KONFIRMASI PASSWORD BARU</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input-heritage"
            placeholder="Ketik ulang password baru"
          />
        </div>

        <div style={{ borderTop: "1px solid rgba(160,125,47,.2)", paddingTop: 20, marginTop: 4, display: "flex", justifyItems: "flex-start" }}>
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="btn-heritage"
          >
            {changePassword.isPending ? "MEMPROSES..." : "UBAH PASSWORD"}
          </button>
        </div>
      </form>
    </div>
  );
}
