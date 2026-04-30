import { requireSession } from "@/lib/auth/session-helper";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();

  // Pass plain serializable data to client component
  return (
    <ProfileClient
      user={{
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        mustChangePassword: session.user.mustChangePassword,
      }}
    />
  );
}