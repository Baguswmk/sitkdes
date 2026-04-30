import { createTRPCRouter, superAdminProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { logActivity, AuditAction } from "@/lib/audit/logger";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@prisma/client";

const userSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  username: z.string().min(4, "Username minimal 4 karakter").max(50),
  email: z.string().email("Format email tidak valid"),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
});

export const usersRouter = createTRPCRouter({
  /**
   * List all users (excluding superadmin from being deleted easily, but visible).
   */
  list: superAdminProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: { tkdCreated: true },
        },
      },
    });
  }),

  /**
   * Create a new user.
   */
  create: superAdminProcedure
    .input(
      userSchema.extend({
        password: z.string().min(8, "Password minimal 8 karakter"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if username or email exists
      const existing = await ctx.db.user.findFirst({
        where: {
          OR: [{ username: input.username }, { email: input.email }],
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username atau email sudah digunakan",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          username: input.username,
          email: input.email,
          role: input.role,
          status: input.status,
          passwordHash,
          mustChangePassword: true, // Force new users to change password on first login
          createdById: ctx.session.user.id,
        },
      });

      await logActivity({
        userId: ctx.session.user.id,
        action: AuditAction.USER_CREATED || "USER_CREATED",
        entityType: "User",
        entityId: user.id,
        description: `Berhasil membuat akun pengguna "${user.username}"`,
      });

      return { success: true, id: user.id };
    }),

  /**
   * Update an existing user.
   */
  update: superAdminProcedure
    .input(
      z.object({
        id: z.string(),
        data: userSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent editing the current superadmin's own role/status from this general table 
      // (to prevent accidental lockout)
      if (input.id === ctx.session.user.id && (input.data.role !== UserRole.SUPER_ADMIN || input.data.status !== UserStatus.ACTIVE)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Tidak dapat mengubah hak akses atau status akun Anda sendiri melalui fitur ini",
        });
      }

      // Check username/email conflict for other users
      const existing = await ctx.db.user.findFirst({
        where: {
          OR: [{ username: input.data.username }, { email: input.data.email }],
          NOT: { id: input.id },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username atau email sudah digunakan oleh pengguna lain",
        });
      }

      const user = await ctx.db.user.update({
        where: { id: input.id },
        data: input.data,
      });

      await logActivity({
        userId: ctx.session.user.id,
        action: AuditAction.USER_UPDATED || "USER_UPDATED",
        entityType: "User",
        entityId: user.id,
        description: `Berhasil memperbarui data pengguna "${user.username}"`,
      });

      return { success: true };
    }),

  /**
   * Reset a user's password.
   */
  resetPassword: superAdminProcedure
    .input(
      z.object({
        id: z.string(),
        newPassword: z.string().min(8, "Password minimal 8 karakter"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const passwordHash = await bcrypt.hash(input.newPassword, 12);

      const user = await ctx.db.user.update({
        where: { id: input.id },
        data: {
          passwordHash,
          mustChangePassword: true, // Force them to change it again
          failedLoginAttempts: 0,
          lockedUntil: null,
          status: UserStatus.ACTIVE, // unlock the account if it was locked
        },
      });

      await logActivity({
        userId: ctx.session.user.id,
        action: "PASSWORD_RESET",
        entityType: "User",
        entityId: user.id,
        description: `Reset password untuk pengguna "${user.username}"`,
      });

      return { success: true };
    }),

  /**
   * Delete a user.
   */
  delete: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Prevent deleting self
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Anda tidak dapat menghapus akun Anda sendiri",
        });
      }

      // Check if user has created TKD records
      const count = await ctx.db.tanahKasDesa.count({
        where: { createdById: input.id },
      });

      if (count > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Tidak dapat menghapus pengguna yang sudah membuat ${count} data TKD. Silakan nonaktifkan akun ini melalui fitur Edit.`,
        });
      }

      const user = await ctx.db.user.delete({
        where: { id: input.id },
      });

      await logActivity({
        userId: ctx.session.user.id,
        action: AuditAction.USER_DELETED || "USER_DELETED",
        entityType: "User",
        entityId: user.id,
        description: `Menghapus akun pengguna "${user.username}"`,
      });

      return { success: true };
    }),
});
