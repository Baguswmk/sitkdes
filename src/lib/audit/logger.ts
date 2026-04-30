import type { ActivityLog } from "@prisma/client";
import { db } from "@/lib/db/client";

type LogActivityParams = {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

/**
 * Log an activity to the ActivityLog table.
 * NEVER include sensitive data (passwords, tokens) in metadata.
 */
export async function logActivity(
  params: LogActivityParams
): Promise<ActivityLog> {
  return db.activityLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      description: params.description,
      metadata: params.metadata as never,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      performedAt: new Date(),
    },
  });
}

/**
 * Common action constants to avoid magic strings.
 */
export const AuditAction = {
  // Auth
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILED: "login_failed",
  LOGOUT: "logout",
  PASSWORD_CHANGED: "password_changed",
  PASSWORD_RESET_REQUESTED: "password_reset_requested",
  ACCOUNT_LOCKED: "account_locked",

  // TKD
  TKD_CREATED: "tkd_created",
  TKD_UPDATED: "tkd_updated",
  TKD_DELETED: "tkd_deleted",
  TKD_SUBMITTED: "tkd_submitted",
  TKD_APPROVED: "tkd_approved",
  TKD_REJECTED: "tkd_rejected",

  // User
  USER_CREATED: "user_created",
  USER_UPDATED: "user_updated",
  USER_DISABLED: "user_disabled",
  USER_ENABLED: "user_enabled",

  // Padukuhan
  PADUKUHAN_CREATED: "padukuhan_created",
  PADUKUHAN_UPDATED: "padukuhan_updated",
  PADUKUHAN_DELETED: "padukuhan_deleted",

  // System
  SYSTEM_UPDATED: "system_updated",
} as const;
