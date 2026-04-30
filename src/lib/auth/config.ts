import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db/client";
import { verifyPassword } from "@/lib/auth/password";
import { logActivity, AuditAction } from "@/lib/audit/logger";
import { UserStatus } from "@prisma/client";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // 1. Validate input
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        // 2. Find user
        const user = await db.user.findFirst({
          where: {
            OR: [{ username }, { email: username }],
          },
        });

        if (!user) {
          // Don't log failed attempts for non-existent users (privacy)
          return null;
        }

        const ipAddress =
          (req as Request & { headers?: Headers })?.headers
            ?.get?.("x-forwarded-for") ?? undefined;

        // 3. Check account status
        if (user.status === UserStatus.DISABLED) {
          await logActivity({
            userId: user.id,
            action: AuditAction.LOGIN_FAILED,
            description: "Login gagal: akun dinonaktifkan",
            ipAddress: ipAddress ?? undefined,
          });
          return null;
        }

        // 4. Check lockout
        if (
          user.status === UserStatus.LOCKED &&
          user.lockedUntil &&
          user.lockedUntil > new Date()
        ) {
          await logActivity({
            userId: user.id,
            action: AuditAction.LOGIN_FAILED,
            description: "Login gagal: akun terkunci",
            ipAddress: ipAddress ?? undefined,
          });
          return null;
        }

        // 5. Verify password
        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
          const newFailedAttempts = user.failedLoginAttempts + 1;
          const shouldLock = newFailedAttempts >= 5;

          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newFailedAttempts,
              status: shouldLock ? UserStatus.LOCKED : user.status,
              lockedUntil: shouldLock
                ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
                : user.lockedUntil,
            },
          });

          await logActivity({
            userId: user.id,
            action: shouldLock
              ? AuditAction.ACCOUNT_LOCKED
              : AuditAction.LOGIN_FAILED,
            description: shouldLock
              ? `Akun dikunci setelah ${newFailedAttempts} kali gagal login`
              : `Login gagal (percobaan ke-${newFailedAttempts})`,
            ipAddress: ipAddress ?? undefined,
          });

          return null;
        }

        // 6. Successful login — reset failed attempts
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            status: UserStatus.ACTIVE,
            lockedUntil: null,
            lastLoginAt: new Date(),
            lastLoginIp: ipAddress ?? null,
          },
        });

        await logActivity({
          userId: user.id,
          action: AuditAction.LOGIN_SUCCESS,
          description: "Login berhasil",
          ipAddress: ipAddress ?? undefined,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
          passwordExpired: user.passwordExpired,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.username = (user as { username: string }).username;
        token.role = (user as { role: string }).role;
        token.mustChangePassword = (
          user as { mustChangePassword: boolean }
        ).mustChangePassword;
        token.passwordExpired = (
          user as { passwordExpired: boolean }
        ).passwordExpired;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as Record<string, unknown>).username =
          token.username as string;
        (session.user as Record<string, unknown>).role =
          token.role as string;
        (session.user as Record<string, unknown>).mustChangePassword =
          token.mustChangePassword as boolean;
        (session.user as Record<string, unknown>).passwordExpired =
          token.passwordExpired as boolean;
      }
      return session;
    },
  },
});
