import { UserRole } from "@prisma/client";

// ─── Role Hierarchy ────────────────────────────────────────────────────────────
// Higher number = more permissions
const ROLE_LEVEL: Record<UserRole, number> = {
  SUPER_ADMIN: 3,
  ADMIN_DESA: 2,
  OPERATOR: 1,
};

/**
 * Check if role A has at least the level of role B.
 */
export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[minRole];
}

/**
 * Check if a role is exactly the given role.
 */
export function isRole(userRole: UserRole, role: UserRole): boolean {
  return userRole === role;
}

// ─── Permission Matrix ─────────────────────────────────────────────────────────

type Action =
  | "tkd:create"
  | "tkd:edit"
  | "tkd:delete"
  | "tkd:submit"
  | "tkd:approve"
  | "tkd:reject"
  | "tkd:view_sensitive"
  | "padukuhan:manage"
  | "audit:view"
  | "user:manage"
  | "settings:manage"
  | "report:export";

const PERMISSIONS: Record<Action, UserRole[]> = {
  "tkd:create":         ["OPERATOR", "ADMIN_DESA", "SUPER_ADMIN"],
  "tkd:edit":           ["ADMIN_DESA", "SUPER_ADMIN"],
  "tkd:delete":         ["ADMIN_DESA", "SUPER_ADMIN"],
  "tkd:submit":         ["OPERATOR", "ADMIN_DESA", "SUPER_ADMIN"],
  "tkd:approve":        ["ADMIN_DESA", "SUPER_ADMIN"],
  "tkd:reject":         ["ADMIN_DESA", "SUPER_ADMIN"],
  "tkd:view_sensitive": ["OPERATOR", "ADMIN_DESA", "SUPER_ADMIN"],
  "padukuhan:manage":   ["ADMIN_DESA", "SUPER_ADMIN"],
  "audit:view":         ["ADMIN_DESA", "SUPER_ADMIN"],
  "user:manage":        ["SUPER_ADMIN"],
  "settings:manage":    ["SUPER_ADMIN"],
  "report:export":      ["ADMIN_DESA", "SUPER_ADMIN"],
};

/**
 * Check if a user role has permission for an action.
 */
export function can(userRole: UserRole, action: Action): boolean {
  return PERMISSIONS[action].includes(userRole);
}

/**
 * Throw an error if the user doesn't have minimum role.
 * Used in tRPC procedures.
 */
export function requireMinRole(
  userRole: UserRole,
  minRole: UserRole,
  message = "Anda tidak memiliki akses untuk melakukan tindakan ini"
): void {
  if (!hasMinRole(userRole, minRole)) {
    throw new Error(message);
  }
}

/**
 * Throw an error if the user doesn't have permission for an action.
 */
export function requirePermission(
  userRole: UserRole,
  action: Action,
  message = "Anda tidak memiliki izin untuk tindakan ini"
): void {
  if (!can(userRole, action)) {
    throw new Error(message);
  }
}

export type { Action };
