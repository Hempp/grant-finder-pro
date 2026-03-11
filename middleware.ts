import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/pricing",
    "/api/auth",
    "/api/stripe/webhook",
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(
    (route) =>
      nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
  );

  // Allow cron endpoints with CRON_SECRET
  const isCronEndpoint = nextUrl.pathname.startsWith("/api/cron");

  // Allow public routes and cron endpoints
  if (isPublicRoute || isCronEndpoint) {
    return NextResponse.next();
  }

  // Protected dashboard routes
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

  // Protected API routes (except auth and webhook)
  const isProtectedApiRoute =
    nextUrl.pathname.startsWith("/api") &&
    !nextUrl.pathname.startsWith("/api/auth") &&
    !nextUrl.pathname.startsWith("/api/stripe/webhook") &&
    !nextUrl.pathname.startsWith("/api/cron");

  // Redirect to login if not authenticated
  if (!isLoggedIn && isDashboardRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Return 401 for protected API routes
  if (!isLoggedIn && isProtectedApiRoute) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and _next
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
