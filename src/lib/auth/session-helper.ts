import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth/config";
import { hasMinRole } from "@/lib/auth/permissions";

/**
 * Session shape after our NextAuth type augmentation.
 * Use this type when passing session data to client components.
 */
export type AppSession = {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: UserRole;
    mustChangePassword: boolean;
    passwordExpired: boolean;
  };
};

/**
 * Get current session in server components.
 * Returns null if not authenticated (does NOT redirect).
 */
export async function getSession(): Promise<AppSession | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session as AppSession;
}

/**
 * Require authenticated session, redirect to login if not.
 * Use this in protected server components — guarantees session is non-null.
 *
 * @example
 * ```tsx
 * export default async function AdminPage() {
 *   const session = await requireSession();
 *   // session.user.role is guaranteed to exist
 * }
 * ```
 */
export async function requireSession(
  redirectTo: string = "/login"
): Promise<AppSession> {
  const session = await getSession();
  if (!session) redirect(redirectTo);
  return session;
}

/**
 * Require specific minimum role, redirect if insufficient.
 * Hierarchy: SUPER_ADMIN > ADMIN_DESA > OPERATOR
 *
 * @example
 * ```tsx
 * const session = await requireRole("ADMIN_DESA");
 * // user is guaranteed to be ADMIN_DESA or SUPER_ADMIN
 * ```
 */
export async function requireRole(
  minRole: UserRole,
  redirectTo: string = "/admin"
): Promise<AppSession> {
  const session = await requireSession();
  if (!hasMinRole(session.user.role, minRole)) {
    redirect(redirectTo);
  }
  return session;
}