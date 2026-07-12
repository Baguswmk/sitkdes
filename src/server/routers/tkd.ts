import { createTRPCRouter, publicProcedure, viewerProcedure, operatorProcedure, adminProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { logActivity, AuditAction } from "@/lib/audit/logger";
import { StatusData, JenisTanah, KategoriPenggunaan, UserRole, Prisma } from "@prisma/client";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const tkdCreateSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi").max(200),
  deskripsi: z.string().max(1000).optional(),
  jenisTanah: z.nativeEnum(JenisTanah),
  kategoriPenggunaan: z.nativeEnum(KategoriPenggunaan),
  penggunaan: z.string().min(1, "Penggunaan wajib diisi").max(100),
  pemanfaatan: z.string().max(100).optional(),
  padukuhanId: z.string().min(1, "Padukuhan wajib dipilih"),
  alamat: z.string().max(300).optional(),
  statusKepemilikan: z.string().max(100).optional(),
  alasHak: z.string().max(200).optional(),
  nomorSertifikat: z.string().max(100).optional(),
  // GeoJSON geometry string — validated server-side
  geometryGeoJson: z.string().min(1, "Polygon wajib digambar di peta"),
});

const tkdUpdateSchema = tkdCreateSchema.partial().extend({
  id: z.string(),
});

const tkdFilterSchema = z.object({
  padukuhanId: z.string().optional(),
  jenisTanah: z.nativeEnum(JenisTanah).optional(),
  status: z.nativeEnum(StatusData).optional(),
  penggunaan: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(999999).default(10),
});

export const tkdRouter = createTRPCRouter({
  /**
   * Public list — only APPROVED, no sensitive fields, returns GeoJSON.
   */
  listPublic: publicProcedure
    .input(
      z.object({
        padukuhanId: z.string().optional(),
        jenisTanah: z.nativeEnum(JenisTanah).optional(),
        penggunaan: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        status: StatusData.APPROVED,
        deletedAt: null as null,
        ...(input.padukuhanId ? { padukuhanId: input.padukuhanId } : {}),
        ...(input.jenisTanah ? { jenisTanah: input.jenisTanah } : {}),
        ...(input.penggunaan ? { penggunaan: input.penggunaan } : {}),
      };

      const rows = await ctx.db.$queryRaw<
        Array<{
          id: string;
          nub: string | null;
          nama: string;
          padukuhan_nama: string;
          jenis_tanah: string;
          penggunaan: string;
          pemanfaatan: string | null;
          luas_m2: number;
          luas_ha: number;
          geojson: string;
        }>
      >`
        SELECT
          t.id,
          t.nub,
          t.nama,
          p.nama as padukuhan_nama,
          t."jenisTanah" as jenis_tanah,
          t.penggunaan,
          t.pemanfaatan,
          t."luasM2" as luas_m2,
          t."luasHa" as luas_ha,
          ST_AsGeoJSON(t.geometry)::text as geojson
        FROM "TanahKasDesa" t
        JOIN "Padukuhan" p ON t."padukuhanId" = p.id
        WHERE t.status = 'APPROVED'
          AND t."deletedAt" IS NULL
          ${input.padukuhanId ? Prisma.sql`AND t."padukuhanId" = ${input.padukuhanId}` : Prisma.empty}
          ${input.jenisTanah ? Prisma.sql`AND t."jenisTanah" = ${input.jenisTanah}::"JenisTanah"` : Prisma.empty}
          ${input.penggunaan ? Prisma.sql`AND t.penggunaan ILIKE ${'%' + input.penggunaan + '%'}` : Prisma.empty}
        ORDER BY t."createdAt" DESC
        LIMIT 500
      `;

      return rows.map((r) => ({
        id: r.id,
        nub: r.nub,
        nama: r.nama,
        padukuhan: r.padukuhan_nama,
        jenisTanah: r.jenis_tanah,
        penggunaan: r.penggunaan,
        pemanfaatan: r.pemanfaatan,
        luasM2: r.luas_m2,
        luasHa: r.luas_ha,
        geometry: JSON.parse(r.geojson) as GeoJSON.Geometry,
      }));
    }),

  /**
   * Admin list spatial — all statuses, returns GeoJSON.
   */
  listSpatialAdmin: viewerProcedure
    .input(
      z.object({
        padukuhanId: z.string().optional(),
        jenisTanah: z.nativeEnum(JenisTanah).optional(),
        penggunaan: z.string().optional(),
        status: z.nativeEnum(StatusData).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const callerRole = (ctx.session.user as { role: UserRole }).role;
      const callerId = ctx.session.user.id;
      
      const inParams = input || {};

      const rows = await ctx.db.$queryRaw<
        Array<{
          id: string;
          nama: string;
          padukuhan_nama: string;
          jenis_tanah: string;
          penggunaan: string;
          pemanfaatan: string | null;
          luas_m2: number;
          luas_ha: number;
          status: string;
          geojson: string;
        }>
      >`
        SELECT
          t.id,
          t.nama,
          p.nama as padukuhan_nama,
          t."jenisTanah" as jenis_tanah,
          t.penggunaan,
          t.pemanfaatan,
          t."luasM2" as luas_m2,
          t."luasHa" as luas_ha,
          t.status::text as status,
          ST_AsGeoJSON(t.geometry)::text as geojson
        FROM "TanahKasDesa" t
        JOIN "Padukuhan" p ON t."padukuhanId" = p.id
        WHERE t."deletedAt" IS NULL
          ${inParams.padukuhanId ? Prisma.sql`AND t."padukuhanId" = ${inParams.padukuhanId}` : Prisma.empty}
          ${inParams.jenisTanah ? Prisma.sql`AND t."jenisTanah" = ${inParams.jenisTanah}::"JenisTanah"` : Prisma.empty}
          ${inParams.penggunaan ? Prisma.sql`AND t.penggunaan ILIKE ${'%' + inParams.penggunaan + '%'}` : Prisma.empty}
          ${inParams.status ? Prisma.sql`AND t.status = ${inParams.status}::"StatusData"` : Prisma.empty}
          ${callerRole === 'OPERATOR' ? Prisma.sql`AND t."createdById" = ${callerId}::uuid` : Prisma.empty}
        ORDER BY t."createdAt" DESC
        LIMIT 500
      `;

      return rows.map((r) => ({
        id: r.id,
        nama: r.nama,
        padukuhan: r.padukuhan_nama,
        jenisTanah: r.jenis_tanah,
        penggunaan: r.penggunaan,
        pemanfaatan: r.pemanfaatan,
        luasM2: r.luas_m2,
        luasHa: r.luas_ha,
        status: r.status,
        geometry: r.geojson ? JSON.parse(r.geojson) as GeoJSON.Geometry : null as any,
      }));
    }),

  /**
   * Admin list with filters, pagination.
   */
  listAdmin: viewerProcedure
    .input(tkdFilterSchema)
    .query(async ({ ctx, input }) => {
      const callerRole = (ctx.session.user as { role: UserRole }).role;
      const callerId = ctx.session.user.id;

      const where = {
        deletedAt: null as null,
        ...(input.padukuhanId ? { padukuhanId: input.padukuhanId } : {}),
        ...(input.jenisTanah ? { jenisTanah: input.jenisTanah } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.penggunaan ? { penggunaan: { contains: input.penggunaan } } : {}),
        ...(input.search
          ? {
              OR: [
                { nama: { contains: input.search, mode: "insensitive" as const } },
                { kode: { contains: input.search, mode: "insensitive" as const } },
                { nub: { contains: input.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
        // OPERATOR can only see own records
        ...(callerRole === UserRole.OPERATOR ? { createdById: callerId } : {}),
      };

      const [total, items] = await Promise.all([
        ctx.db.tanahKasDesa.count({ where }),
        ctx.db.tanahKasDesa.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: (input.page - 1) * input.perPage,
          take: input.perPage,
          select: {
            id: true,
            kode: true,
            nub: true,
            nama: true,
            jenisTanah: true,
            penggunaan: true,
            pemanfaatan: true,
            luasM2: true,
            luasHa: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            padukuhan: { select: { nama: true } },
            createdBy: { select: { name: true } },
          },
        }),
      ]);

      return {
        items,
        total,
        page: input.page,
        perPage: input.perPage,
        totalPages: Math.ceil(total / input.perPage),
      };
    }),

  /**
   * Get single TKD by ID.
   */
  getById: viewerProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const callerRole = (ctx.session.user as { role: UserRole }).role;
      const callerId = ctx.session.user.id;

      const tkd = await ctx.db.tanahKasDesa.findFirst({
        where: {
          id: input.id,
          deletedAt: null,
          ...(callerRole === UserRole.OPERATOR
            ? { createdById: callerId }
            : {}),
        },
        include: {
          padukuhan: true,
          createdBy: { select: { name: true, username: true } },
          updatedBy: { select: { name: true, username: true } },
          approvedBy: { select: { name: true, username: true } },
          attachments: {
            where: callerRole === UserRole.OPERATOR
              ? { isSensitive: false }
              : {},
          },
          history: {
            orderBy: { performedAt: "desc" },
            take: 20,
          },
        },
      });

      if (!tkd) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Data TKD tidak ditemukan" });
      }

      // Get geometry as GeoJSON
      const geoRow = await ctx.db.$queryRaw<[{ geojson: string }]>`
        SELECT ST_AsGeoJSON(geometry)::text as geojson
        FROM "TanahKasDesa" WHERE id = ${input.id}
      `;

      return {
        ...tkd,
        geometry: geoRow[0]
          ? (JSON.parse(geoRow[0].geojson) as GeoJSON.Geometry)
          : null,
        // Mask sensitive fields for OPERATOR
        alasHak: callerRole === UserRole.OPERATOR ? undefined : tkd.alasHak,
        nomorSertifikat: callerRole === UserRole.OPERATOR ? undefined : tkd.nomorSertifikat,
      };
    }),

  /**
   * Create TKD — OPERATOR+.
   */
  create: operatorProcedure
    .input(tkdCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { geometryGeoJson, ...rest } = input;

      // Parse and validate geometry
      let geomParsed: GeoJSON.Geometry;
      try {
        geomParsed = JSON.parse(geometryGeoJson) as GeoJSON.Geometry;
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Format GeoJSON tidak valid" });
      }

      if (!["Polygon", "MultiPolygon"].includes(geomParsed.type)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Geometry harus berupa Polygon atau MultiPolygon",
        });
      }

      // Calculate area via PostGIS
      const areaResult = await ctx.db.$queryRaw<[{ area_m2: number }]>`
        SELECT ST_Area(
          ST_Transform(
            ST_SetSRID(ST_GeomFromGeoJSON(${geometryGeoJson}), 4326),
            32749
          )
        ) as area_m2
      `;
      const luasM2 = areaResult[0]?.area_m2 ?? 0;
      const luasHa = luasM2 / 10000;

      // Generate NUB via PostgreSQL sequence (atomic, never reused)
      const nubResult = await ctx.db.$queryRaw<[{ nub_val: string }]>`
        SELECT LPAD(nextval('nub_seq')::text, 5, '0') AS nub_val
      `;
      const nub = nubResult[0]?.nub_val;
      if (!nub) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Gagal generate NUB" });

      // Insert with geometry
      const result = await ctx.db.$queryRaw<[{ id: string }]>`
        INSERT INTO "TanahKasDesa" (
          id, nub, nama, "deskripsi", "jenisTanah", "kategoriPenggunaan",
          penggunaan, pemanfaatan, "padukuhanId", alamat,
          "statusKepemilikan", "alasHak", "nomorSertifikat",
          geometry, centroid, "luasM2", "luasHa",
          status, "createdById", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text,
          ${nub},
          ${rest.nama},
          ${rest.deskripsi ?? null},
          ${rest.jenisTanah}::"JenisTanah",
          ${rest.kategoriPenggunaan}::"KategoriPenggunaan",
          ${rest.penggunaan},
          ${rest.pemanfaatan ?? null},
          ${rest.padukuhanId},
          ${rest.alamat ?? null},
          ${rest.statusKepemilikan ?? "Tanah Kalurahan"},
          ${rest.alasHak ?? null},
          ${rest.nomorSertifikat ?? null},
          ST_SetSRID(ST_GeomFromGeoJSON(${geometryGeoJson}), 4326),
          ST_Centroid(ST_SetSRID(ST_GeomFromGeoJSON(${geometryGeoJson}), 4326)),
          ${luasM2},
          ${luasHa},
          'DRAFT'::"StatusData",
          ${ctx.session.user.id},
          NOW(), NOW()
        )
        RETURNING id
      `;

      const newId = result[0]?.id;
      if (!newId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Gagal menyimpan data" });

      // Snapshot history
      await ctx.db.tanahKasHistory.create({
        data: {
          tanahKasId: newId,
          action: "CREATE",
          changedFields: {},
          snapshot: { ...rest, nub, luasM2, luasHa, status: "DRAFT" } as never,
          performedById: ctx.session.user.id,
        },
      });

      await logActivity({
        userId: ctx.session.user.id,
        action: AuditAction.TKD_CREATED,
        entityType: "TanahKasDesa",
        entityId: newId,
        description: `TKD "${rest.nama}" (NUB: ${nub}) berhasil dibuat`,
      });

      return { id: newId, nub };
    }),

  /**
   * Update TKD — OPERATOR+ (own record only, unless Admin).
   */
  update: adminProcedure
    .input(tkdUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, geometryGeoJson, ...rest } = input;
      const callerId = ctx.session.user.id;

      const tkd = await ctx.db.tanahKasDesa.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!tkd) throw new TRPCError({ code: "NOT_FOUND", message: "Data TKD tidak ditemukan" });

      // Build update data
      const updateData: Record<string, unknown> = {
        ...rest,
        updatedById: callerId,
        updatedAt: new Date(),
      };

      // If geometry provided, recalculate area via PostGIS
      if (geometryGeoJson) {
        const areaResult = await ctx.db.$queryRaw<[{ area_m2: number }]>`
          SELECT ST_Area(
            ST_Transform(
              ST_SetSRID(ST_GeomFromGeoJSON(${geometryGeoJson}), 4326),
              32749
            )
          ) as area_m2
        `;
        const luasM2 = areaResult[0]?.area_m2 ?? 0;
        const luasHa = luasM2 / 10000;

        await ctx.db.$executeRaw`
          UPDATE "TanahKasDesa" SET
            geometry = ST_SetSRID(ST_GeomFromGeoJSON(${geometryGeoJson}), 4326),
            centroid = ST_Centroid(ST_SetSRID(ST_GeomFromGeoJSON(${geometryGeoJson}), 4326)),
            "luasM2" = ${luasM2},
            "luasHa" = ${luasHa},
            "updatedAt" = NOW()
          WHERE id = ${id}
        `;
        delete updateData.luasM2;
        delete updateData.luasHa;
      }

      // Update non-geometry fields (exclude geometry-related already handled above)
      delete updateData.updatedAt; // handled by raw or prisma
      const { updatedById, ...prismaUpdateRest } = updateData;
      await ctx.db.tanahKasDesa.update({
        where: { id },
        data: {
          ...prismaUpdateRest,
          updatedById: callerId,
          // Reset to DRAFT if previously REJECTED, so it can be re-submitted
          ...(tkd.status === "REJECTED" ? { status: "DRAFT" } : {}),
        } as never,
      });

      await logActivity({
        userId: callerId,
        action: AuditAction.TKD_CREATED, // reuse — no dedicated UPDATE action
        entityType: "TanahKasDesa",
        entityId: id,
        description: `TKD "${tkd.nama}" diperbarui`,
      });

      return { id };
    }),

  /**
   * Submit TKD for review — OPERATOR+.
   */
  submit: operatorProcedure
    .input(z.object({ id: z.string(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const callerId = ctx.session.user.id;
      const callerRole = (ctx.session.user as { role: UserRole }).role;

      const tkd = await ctx.db.tanahKasDesa.findFirst({
        where: {
          id: input.id,
          deletedAt: null,
          ...(callerRole === UserRole.OPERATOR ? { createdById: callerId } : {}),
        },
      });

      if (!tkd) throw new TRPCError({ code: "NOT_FOUND", message: "Data TKD tidak ditemukan" });
      if (tkd.status !== StatusData.DRAFT) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Hanya data berstatus DRAFT yang bisa diajukan" });
      }

      await ctx.db.tanahKasDesa.update({
        where: { id: input.id },
        data: {
          status: StatusData.PENDING_REVIEW,
          submittedAt: new Date(),
          submittedById: callerId,
        },
      });

      await ctx.db.tanahKasHistory.create({
        data: {
          tanahKasId: input.id,
          action: "SUBMIT",
          changedFields: { status: { old: "DRAFT", new: "PENDING_REVIEW" } } as never,
          snapshot: {} as never,
          performedById: callerId,
          notes: input.notes,
        },
      });

      await logActivity({
        userId: callerId,
        action: AuditAction.TKD_SUBMITTED,
        entityType: "TanahKasDesa",
        entityId: input.id,
        description: `TKD "${tkd.nama}" diajukan untuk review`,
      });

      return { success: true };
    }),

  /**
   * Approve TKD — ADMIN_DESA+.
   */
  approve: adminProcedure
    .input(z.object({ id: z.string(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const tkd = await ctx.db.tanahKasDesa.findFirst({
        where: { id: input.id, deletedAt: null },
      });

      if (!tkd) throw new TRPCError({ code: "NOT_FOUND", message: "Data TKD tidak ditemukan" });
      if (tkd.status !== StatusData.PENDING_REVIEW) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Hanya data berstatus Menunggu Review yang bisa disetujui" });
      }

      await ctx.db.tanahKasDesa.update({
        where: { id: input.id },
        data: {
          status: StatusData.APPROVED,
          approvedAt: new Date(),
          approvedById: ctx.session.user.id,
          rejectionReason: null,
        },
      });

      await ctx.db.tanahKasHistory.create({
        data: {
          tanahKasId: input.id,
          action: "APPROVE",
          changedFields: { status: { old: "PENDING_REVIEW", new: "APPROVED" } } as never,
          snapshot: {} as never,
          performedById: ctx.session.user.id,
          notes: input.notes,
        },
      });

      await logActivity({
        userId: ctx.session.user.id,
        action: AuditAction.TKD_APPROVED,
        entityType: "TanahKasDesa",
        entityId: input.id,
        description: `TKD "${tkd.nama}" disetujui`,
      });

      return { success: true };
    }),

  /**
   * Reject TKD — ADMIN_DESA+.
   */
  reject: adminProcedure
    .input(z.object({ id: z.string(), reason: z.string().min(1, "Alasan penolakan wajib diisi") }))
    .mutation(async ({ ctx, input }) => {
      const tkd = await ctx.db.tanahKasDesa.findFirst({
        where: { id: input.id, deletedAt: null },
      });

      if (!tkd) throw new TRPCError({ code: "NOT_FOUND", message: "Data TKD tidak ditemukan" });

      await ctx.db.tanahKasDesa.update({
        where: { id: input.id },
        data: {
          status: StatusData.REJECTED,
          rejectionReason: input.reason,
        },
      });

      await ctx.db.tanahKasHistory.create({
        data: {
          tanahKasId: input.id,
          action: "REJECT",
          changedFields: { status: { old: tkd.status, new: "REJECTED" } } as never,
          snapshot: {} as never,
          performedById: ctx.session.user.id,
          notes: input.reason,
        },
      });

      await logActivity({
        userId: ctx.session.user.id,
        action: AuditAction.TKD_REJECTED,
        entityType: "TanahKasDesa",
        entityId: input.id,
        description: `TKD "${tkd.nama}" ditolak: ${input.reason}`,
      });

      return { success: true };
    }),

  /**
   * Soft delete TKD — ADMIN_DESA+.
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tkd = await ctx.db.tanahKasDesa.findFirst({
        where: { id: input.id, deletedAt: null },
      });
      if (!tkd) throw new TRPCError({ code: "NOT_FOUND", message: "Data TKD tidak ditemukan" });

      await ctx.db.tanahKasDesa.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      await logActivity({
        userId: ctx.session.user.id,
        action: AuditAction.TKD_DELETED,
        entityType: "TanahKasDesa",
        entityId: input.id,
        description: `TKD "${tkd.nama}" dihapus (soft delete)`,
      });

      return { success: true };
    }),
});
