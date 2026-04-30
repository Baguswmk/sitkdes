import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db/client";

const BCRYPT_COST = 12;

/**
 * Hash a plaintext password with bcrypt (cost factor 12).
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ─── Password Policy Schema ────────────────────────────────────────────────────

export const passwordPolicySchema = z
  .string()
  .min(12, "Password minimal 12 karakter")
  .regex(/[A-Z]/, "Password harus mengandung huruf kapital")
  .regex(/[a-z]/, "Password harus mengandung huruf kecil")
  .regex(/[0-9]/, "Password harus mengandung angka")
  .regex(
    /[^A-Za-z0-9]/,
    "Password harus mengandung simbol (contoh: @, #, $, !)"
  );

export type PasswordValidationResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Validate a new password against the configured policy.
 */
export function validatePasswordPolicy(
  plain: string
): PasswordValidationResult {
  const result = passwordPolicySchema.safeParse(plain);
  if (!result.success) {
    return { ok: false, message: result.error.issues[0]?.message ?? "Password tidak valid" };
  }
  return { ok: true };
}

/**
 * Check if the new password was used in the last N passwords.
 * Returns true if it IS in history (not allowed), false if safe to use.
 */
export async function isPasswordInHistory(
  userId: string,
  newPlain: string,
  historyCount = 5
): Promise<boolean> {
  const history = await db.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: historyCount,
  });

  for (const entry of history) {
    const match = await bcrypt.compare(newPlain, entry.passwordHash);
    if (match) return true;
  }
  return false;
}

/**
 * Save a password hash to history.
 */
export async function savePasswordToHistory(
  userId: string,
  hash: string
): Promise<void> {
  await db.passwordHistory.create({
    data: { userId, passwordHash: hash },
  });

  // Keep only the last 10 entries
  const all = await db.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (all.length > 10) {
    const toDelete = all.slice(10).map((h) => h.id);
    await db.passwordHistory.deleteMany({ where: { id: { in: toDelete } } });
  }
}

/**
 * Check if a user's password is expired based on SystemConfig.
 */
export async function isPasswordExpired(
  passwordChangedAt: Date,
  expiryDays = 30
): Promise<boolean> {
  const now = new Date();
  const expiredAt = new Date(passwordChangedAt);
  expiredAt.setDate(expiredAt.getDate() + expiryDays);
  return now > expiredAt;
}

/**
 * Get days remaining until password expiry.
 */
export function getDaysUntilExpiry(
  passwordChangedAt: Date,
  expiryDays = 30
): number {
  const now = new Date();
  const expiredAt = new Date(passwordChangedAt);
  expiredAt.setDate(expiredAt.getDate() + expiryDays);
  const diffMs = expiredAt.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
