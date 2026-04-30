import { createTRPCRouter } from "@/server/trpc";
import { authRouter } from "./auth";
import { statsRouter } from "./stats";
import { padukuhanRouter } from "./padukuhan";
import { tkdRouter } from "./tkd";
import { usersRouter } from "./users";
import { settingsRouter } from "./settings";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  stats: statsRouter,
  padukuhan: padukuhanRouter,
  tkd: tkdRouter,
  users: usersRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
