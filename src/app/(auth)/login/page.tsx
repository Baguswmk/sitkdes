"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn } from "lucide-react";
import type { Metadata } from "next";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            textAlign: "center",
            padding: 40,
            fontFamily: "var(--font-cormorant)",
            fontSize: 18,
            fontStyle: "italic",
            color: "var(--ink-soft)",
          }}
        >
          Memuat form login...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Username dan password wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(
          "Username atau password salah. Periksa kembali kredensial Anda.",
        );
      } else {
        toast.success("Login berhasil! Mengalihkan...");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
      }}
    >
      {/* Card */}
      <div
        className="card-heritage"
        style={{ padding: "40px 36px", position: "relative" }}
      >
        {/* Ornament top */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: 22,
              fontWeight: 800,
              color: "var(--navy-900)",
              letterSpacing: 2,
            }}
          >
            MASUK SISTEM
          </div>
          <div
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: 16,
              color: "var(--ink-soft)",
              marginTop: 6,
            }}
          >
            SI-TAKAL Kalurahan Sitimulyo
          </div>
          <div
            style={{
              margin: "16px auto 0",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, var(--gold-500) 20%, var(--gold-400) 50%, var(--gold-500) 80%, transparent)",
              maxWidth: 280,
            }}
          />
          <div
            style={{ color: "var(--gold-500)", fontSize: 16, marginTop: -8 }}
          >
            ❦
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* Username */}
          <div>
            <label htmlFor="username" className="label-heritage">
              USERNAME / EMAIL
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username atau email"
              className="input-heritage"
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="label-heritage">
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="input-heritage"
                style={{ paddingRight: 44 }}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--ink-soft)",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={
                  showPass ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-heritage"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "14px 0",
              fontSize: 14,
              letterSpacing: 2,
              marginTop: 8,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,.3)",
                    borderTopColor: "var(--gold-400)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
                MEMPROSES...
              </>
            ) : (
              <>
                <LogIn size={16} />
                MASUK
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <p
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: "italic",
            fontSize: 14,
            color: "var(--ink-soft)",
            textAlign: "center",
            marginTop: 24,
            lineHeight: 1.6,
          }}
        >
          Lupa password? Hubungi Admin Desa atau Super Admin
          <br />
          untuk melakukan reset password.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
