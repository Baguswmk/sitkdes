import { createTRPCRouter, superAdminProcedure, publicProcedure } from "@/server/trpc";
import { z } from "zod";
import { logActivity, AuditAction } from "@/lib/audit/logger";

const updateBulkSchema = z.array(
  z.object({
    id: z.string(),
    key: z.string(),
    value: z.any(), // Will be stored as JSON in DB
  })
);

export const settingsRouter = createTRPCRouter({
  /**
   * List all settings (public/internal use can just fetch from DB, but here we expose it to super admin)
   */
  list: superAdminProcedure.query(async ({ ctx }) => {
    return ctx.db.systemConfig.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });
  }),

  /**
   * Public list for selected settings like app.name if needed
   */
  listPublic: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.systemConfig.findMany({
      where: {
        key: {
          in: ["app.name"],
        },
      },
    });
  }),

  /**
   * Bulk update settings
   */
  updateBulk: superAdminProcedure
    .input(updateBulkSchema)
    .mutation(async ({ ctx, input }) => {
      // Run updates in a transaction
      await ctx.db.$transaction(
        input.map((item) =>
          ctx.db.systemConfig.update({
            where: { id: item.id },
            data: {
              value: item.value,
              updatedById: ctx.session.user.id,
            },
          })
        )
      );

      await logActivity({
        userId: ctx.session.user.id,
        action: AuditAction.SYSTEM_UPDATED || "SYSTEM_UPDATED",
        description: `Berhasil memperbarui ${input.length} konfigurasi sistem`,
      });

      return { success: true };
    }),
});
