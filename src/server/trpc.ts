import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Context } from "./context";
import { hasMinRole } from "@/lib/auth/permissions";
import { UserRole } from "@prisma/client";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// ─── Middleware ────────────────────────────────────────────────────────────────

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Anda harus login untuk mengakses fitur ini",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: {
        ...ctx.session,
        user: ctx.session.user,
      },
    },
  });
});

const enforceOperator = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Belum login" });
  }
  const role = (ctx.session.user as { role: UserRole }).role;
  if (!hasMinRole(role, UserRole.OPERATOR)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Akses ditolak: minimal role Operator",
    });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

const enforceAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Belum login" });
  }
  const role = (ctx.session.user as { role: UserRole }).role;
  if (!hasMinRole(role, UserRole.ADMIN_DESA)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Akses ditolak: minimal role Admin Desa",
    });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

const enforceSuperAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Belum login" });
  }
  const role = (ctx.session.user as { role: UserRole }).role;
  if (role !== UserRole.SUPER_ADMIN) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Akses ditolak: hanya Super Admin",
    });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

// ─── Procedures ───────────────────────────────────────────────────────────────

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceAuth);
export const operatorProcedure = t.procedure.use(enforceOperator);
export const adminProcedure = t.procedure.use(enforceAdmin);
export const superAdminProcedure = t.procedure.use(enforceSuperAdmin);
