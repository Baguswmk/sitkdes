import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import type { Session } from "next-auth";

export type Context = {
  session: Session | null;
  db: typeof db;
  headers: Headers;
};

export async function createContext(opts: {
  headers: Headers;
}): Promise<Context> {
  const session = await auth();
  return {
    session,
    db,
    headers: opts.headers,
  };
}
