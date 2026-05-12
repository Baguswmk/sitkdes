import { createTRPCRouter, publicProcedure, adminProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { logActivity, AuditAction } from "@/lib/audit/logger";

const padukuhanInputSchema = z.object({
  nama: z.string().min(1, "Nama padukuhan wajib diisi").max(100),
  kode: z.string().max(20).optional(),
  deskripsi: z.string().max(500).optional(),
  urutan: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const padukuhanRouter = createTRPCRouter({
  /**
   * List all active padukuhan — public.
   */
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.padukuhan.findMany({
      where: { isActive: true },
      orderBy: [{ urutan: "asc" }, { nama: "asc" }],
      select: {
        id: true,
        nama: true,
        kode: true,
        deskripsi: true,
        urutan: true,
        _count: {
          select: {
            tanahKas: { where: { deletedAt: null } },
          },
        },
      },
    });
  }),

  /**
   * List all padukuhan (including inactive) — admin.
   */
  listAdmin: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.padukuhan.findMany({
      orderBy: [{ urutan: "asc" }, { nama: "asc" }],
      include: {
        _count: {
          select: { tanahKas: { where: { deletedAt: null } } },
        },
      },
    });
  }),

  /**
   * Create padukuhan — admin.
   */
  create: adminProcedure
    .input(padukuhanInputSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.padukuhan.findFirst({
        where: { nama: input.nama },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Padukuhan dengan nama tersebut sudah ada",
        });
      }

      const padukuhan = await ctx.db.padukuhan.create({ data: input });

      await logActivity({
        userId: ctx.session.user.id,
        action: AuditAction.PADUKUHAN_CREATED,
        entityType: "Padukuhan",
        entityId: padukuhan.id,
        description: `Padukuhan "${padukuhan.nama}" berhasil ditambahkan`,
      });

      return padukuhan;
    }),

  /**
   * Update padukuhan — admin.
   */
  update: adminProcedure
    .input(z.object({ id: z.string(), data: padukuhanInputSchema.partial() }))
    .mutation(async ({ ctx, input }) => {
      const padukuhan = await ctx.db.padukuhan.update({
        where: { id: input.id },
        data: input.data,
      });

      await logActivity({
        userId: ctx.session.user.id,
        action: AuditAction.PADUKUHAN_UPDATED,
        entityType: "Padukuhan",
        entityId: padukuhan.id,
        description: `Padukuhan "${padukuhan.nama}" berhasil diperbarui`,
      });

      return padukuhan;
    }),

  /**
   * Delete padukuhan — admin.
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.db.tanahKasDesa.count({
        where: { padukuhanId: input.id },
      });
      if (count > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Tidak dapat menghapus padukuhan yang memiliki ${count} data TKD (termasuk riwayat terhapus). Silakan gunakan opsi Nonaktifkan (Edit -> Nonaktifkan) untuk menyembunyikan padukuhan ini.`,
        });
      }

      const padukuhan = await ctx.db.padukuhan.delete({
        where: { id: input.id },
      });

      await logActivity({
        userId: ctx.session.user.id,
        action: AuditAction.PADUKUHAN_DELETED,
        entityType: "Padukuhan",
        entityId: input.id,
        description: `Padukuhan "${padukuhan.nama}" dihapus`,
      });

      return { success: true };
    }),
});
