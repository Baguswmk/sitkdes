import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { StatusData } from "@prisma/client";

export const statsRouter = createTRPCRouter({
  /**
   * Public stats — aggregate data only, no sensitive fields.
   */
  public: publicProcedure.query(async ({ ctx }) => {
    const [totalBidang, padukuhanCount, byJenis] = await Promise.all([
      // Total approved parcels
      ctx.db.tanahKasDesa.aggregate({
        where: { status: StatusData.APPROVED, deletedAt: null },
        _count: { id: true },
        _sum: { luasHa: true, luasM2: true },
      }),
      // Padukuhan count
      ctx.db.padukuhan.count({ where: { isActive: true } }),
      // By jenis tanah
      ctx.db.tanahKasDesa.groupBy({
        by: ["jenisTanah"],
        where: { status: StatusData.APPROVED, deletedAt: null },
        _count: { id: true },
        _sum: { luasHa: true },
      }),
    ]);

    return {
      totalBidang: totalBidang._count.id,
      totalLuasHa: totalBidang._sum.luasHa ?? 0,
      totalLuasM2: totalBidang._sum.luasM2 ?? 0,
      padukuhanCount,
      byJenis: byJenis.map((j) => ({
        jenis: j.jenisTanah,
        count: j._count.id,
        luasHa: j._sum.luasHa ?? 0,
      })),
    };
  }),

  /**
   * Public stats per padukuhan.
   */
  perPadukuhan: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.tanahKasDesa.groupBy({
      by: ["padukuhanId"],
      where: { status: StatusData.APPROVED, deletedAt: null },
      _count: { id: true },
      _sum: { luasHa: true },
    });

    const padukuhanIds = data.map((d) => d.padukuhanId);
    const padukuhanList = await ctx.db.padukuhan.findMany({
      where: { id: { in: padukuhanIds } },
      select: { id: true, nama: true },
    });

    const namaMap = Object.fromEntries(
      padukuhanList.map((p) => [p.id, p.nama])
    );

    return data.map((d) => ({
      padukuhanId: d.padukuhanId,
      namaPadukuhan: namaMap[d.padukuhanId] ?? d.padukuhanId,
      count: d._count.id,
      luasHa: d._sum.luasHa ?? 0,
    }));
  }),
});
