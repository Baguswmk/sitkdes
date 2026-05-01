import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { logActivity } from "@/lib/audit/logger";
import { UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Verify CRON_SECRET
    const url = new URL(req.url);
    const secretParams = url.searchParams.get("secret");
    const authHeader = req.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { error: "Server misconfiguration: CRON_SECRET is not set." },
        { status: 500 }
      );
    }

    const isAuthorized =
      secretParams === expectedSecret ||
      authHeader === `Bearer ${expectedSecret}`;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users except SUPER_ADMIN
    const targetUsers = await db.user.findMany({
      where: {
        role: {
          not: UserRole.SUPER_ADMIN,
        },
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (targetUsers.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No target users found." });
    }

    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const date = new Date();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    let updateCount = 0;

    // Process each user
    for (const user of targetUsers) {
      // Create new password format: [username]@[Bulan][Tahun]!
      // Example: budi@Mei2026!
      const sanitizedUsername = user.username.replace(/\s+/g, "").toLowerCase();
      const newPassword = `${sanitizedUsername}@${monthName}${year}!`;

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await db.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          mustChangePassword: true,
          failedLoginAttempts: 0,
          lockedUntil: null,
          status: UserStatus.ACTIVE,
        },
      });

      updateCount++;
    }

    await logActivity({
      action: "CRON_MONTHLY_PASSWORD_RESET",
      entityType: "System",
      description: `Sistem secara otomatis me-reset password untuk ${updateCount} pengguna.`,
    });

    return NextResponse.json({
      success: true,
      count: updateCount,
      message: `Successfully reset passwords for ${updateCount} users.`,
    });
  } catch (error: any) {
    console.error("[CRON_MONTHLY_RESET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
