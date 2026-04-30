import { createTRPCRouter } from "@/server/trpc";
import { authRouter } from "./auth";
import { statsRouter } from "./stats";
import { padukuhanRouter } from "./padukuhan";
import { tkdRouter } from "./tkd";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  stats: statsRouter,
  padukuhan: padukuhanRouter,
  tkd: tkdRouter,
});

export type AppRouter = typeof appRouter;
