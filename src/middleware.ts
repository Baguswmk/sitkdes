import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: Awaited<ReturnType<typeof auth>> }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes — always accessible (no login required)
  const publicRoutes = ["/", "/login", "/tentang"];
  const isPublic =
    publicRoutes.some((r) => pathname === r) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/text") ||
    pathname.startsWith("/favicon");

  // Routes that require login (/admin/*, /peta, /data)
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname === "/peta" ||
    pathname.startsWith("/peta/") ||
    pathname === "/data" ||
    pathname.startsWith("/data/");

  // If not logged in and accessing protected route
  if (!session && isProtected) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in but must change password — force redirect for admin routes
  if (session && pathname.startsWith("/admin")) {
    const user = session.user as {
      mustChangePassword?: boolean;
      passwordExpired?: boolean;
    };
    const forceChangePath = "/admin/profile";
    const isForcePage = pathname === forceChangePath;

    // TODO: Enable this once the Change Password form API is implemented
    // if ((user.mustChangePassword || user.passwordExpired) && !isForcePage) {
    //   return NextResponse.redirect(new URL(forceChangePath, req.url));
    // }
  }

  // If already logged in and visiting login page → go to home
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.PNG|text.PNG).*)",
  ],
};
