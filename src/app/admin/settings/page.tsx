import { Metadata } from "next";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { appRouter } from "@/server/routers/_app";
import { createCallerFactory } from "@/server/trpc";
import { db } from "@/lib/db/client";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "Pengaturan Sistem - Admin SI-TKDes",
  description: "Konfigurasi sistem SI-TKDes",
};

export default async function SettingsPage() {
  const session = await auth();

  // Hanya super admin yang boleh masuk
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  // Siapkan caller tRPC untuk SSR
  const createCaller = createCallerFactory(appRouter);
  const caller = createCaller({ session, db, headers: new Headers() });

  // Fetch initial data
  const initialData = await caller.settings.list();

  return <SettingsClient initialData={initialData} />;
}
