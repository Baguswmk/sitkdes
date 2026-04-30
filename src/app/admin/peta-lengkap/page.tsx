import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { PetaLengkapClient } from "./PetaLengkapClient";

export default async function PetaLengkapPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <PetaLengkapClient />;
}
