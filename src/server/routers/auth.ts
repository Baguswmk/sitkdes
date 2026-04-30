import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { hashPassword, verifyPassword, validatePasswordPolicy, isPasswordInHistory, savePasswordToHistory } from "@/lib/auth/password";
import { logActivity, AuditAction } from "@/lib/audit/logger";
import { TRPCError } from "@trpc/server";
import { UserRole } from "@prisma/client";

export const authRouter = createTRPCRouter({
  /**
   * Change password — authenticated user changes their own password.
   */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Password lama wajib diisi"),
        newPassword: z.string(),
        confirmPassword: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.newPassword !== input.confirmPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password baru dan konfirmasi password tidak cocok",
        });
      }

      // Validate policy
      const policyResult = validatePasswordPolicy(input.newPassword);
      if (!policyResult.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: policyResult.message,
        });
      }

      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { id: userId },
      });

      // Verify current password
      const isValid = await verifyPassword(
        input.currentPassword,
        user.passwordHash
      );
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password lama tidak benar",
        });
      }

      // Check password history
      const inHistory = await isPasswordInHistory(userId, input.newPassword);
      if (inHistory) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password baru tidak boleh sama dengan 5 password terakhir",
        });
      }

      const newHash = await hashPassword(input.newPassword);

      // Save to history and update user
      await savePasswordToHistory(userId, user.passwordHash);
      await ctx.db.user.update({
        where: { id: userId },
        data: {
          passwordHash: newHash,
          passwordChangedAt: new Date(),
          passwordExpired: false,
          mustChangePassword: false,
        },
      });

      await logActivity({
        userId,
        action: AuditAction.PASSWORD_CHANGED,
        description: "Password berhasil diubah",
        ipAddress:
          ctx.headers.get("x-forwarded-for") ??
          ctx.headers.get("x-real-ip") ??
          undefined,
      });

      return { success: true, message: "Password berhasil diubah" };
    }),

  /**
   * Get current user profile.
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        status: true,
        passwordChangedAt: true,
        passwordExpired: true,
        mustChangePassword: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
      },
    });
    return user;
  }),

  /**
   * Admin: Reset another user's password (SUPER_ADMIN only).
   */
  adminResetPassword: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string(),
        newPassword: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const callerRole = (ctx.session.user as { role: UserRole }).role;
      if (callerRole !== UserRole.SUPER_ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Hanya Super Admin yang dapat mereset password pengguna lain",
        });
      }

      const policyResult = validatePasswordPolicy(input.newPassword);
      if (!policyResult.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: policyResult.message,
        });
      }

      const newHash = await hashPassword(input.newPassword);
      await ctx.db.user.update({
        where: { id: input.targetUserId },
        data: {
          passwordHash: newHash,
          passwordChangedAt: new Date(),
          passwordExpired: false,
          mustChangePassword: true, // Force change on next login
          failedLoginAttempts: 0,
        },
      });

      await logActivity({
        userId: ctx.session.user.id,
        action: AuditAction.PASSWORD_CHANGED,
        entityType: "User",
        entityId: input.targetUserId,
        description: `Super Admin mereset password untuk user ID: ${input.targetUserId}`,
      });

      return { success: true };
    }),
});
