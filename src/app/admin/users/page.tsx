import { Metadata } from "next";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { appRouter } from "@/server/routers/_app";
import { createCallerFactory } from "@/server/trpc";
import { db } from "@/lib/db/client";
import { UsersClient } from "./UsersClient";

export const metadata: Metadata = {
  title: "Kelola User - Admin SI-TAKAL",
  description: "Manajemen pengguna aplikasi SI-TAKAL",
};

export default async function UsersPage() {
  const session = await auth();

  // Hanya super admin yang boleh masuk
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  // Siapkan caller tRPC untuk SSR
  const createCaller = createCallerFactory(appRouter);
  const caller = createCaller({ session, db, headers: new Headers() });

  // Fetch initial data
  const initialData = await caller.users.list();

  return (
    <UsersClient initialData={initialData} currentUserId={session.user.id} />
  );
}
