import type { UserRole } from "@prisma/client";
import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

/**
 * Module augmentation for NextAuth.js v5
 * Aligned with our Prisma schema (UserRole enum + passwordExpired + mustChangePassword fields).
 *
 * After this file is in place, `session.user` will have proper types
 * across the entire app — no more `as any` or `as Record<string, unknown>` casts.
 */
declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    username: string;
    role: UserRole;
    mustChangePassword: boolean;
    passwordExpired: boolean;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      name: string;
      role: UserRole;
      mustChangePassword: boolean;
      passwordExpired: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    role: UserRole;
    mustChangePassword: boolean;
    passwordExpired: boolean;
  }
}

export {};