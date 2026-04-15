import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

// Edge-safe auth instance — no Prisma, no Node.js modules
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const method = req.method?.toUpperCase();
  const isMutation = method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE";

  // ═══ CSRF defense ═══
  // SameSite=Lax cookies protect us from cross-site form POSTs that
  // change state, BUT a sibling browser tab on an attacker-controlled
  // origin can still fire fetch() at /api/* with our cookies. For
  // mutation endpoints (POST/PATCH/PUT/DELETE) inside /api/*, require
  // the Origin/Referer to match our own host. Exemptions: NextAuth's
  // own callbacks, the Stripe webhook (external caller, uses signature
  // verification instead), and cron routes (server-to-server with
  // separate CRON_SECRET).
  if (
    isMutation &&
    nextUrl.pathname.startsWith("/api") &&
    !nextUrl.pathname.startsWith("/api/auth") &&
    !nextUrl.pathname.startsWith("/api/stripe/webhook") &&
    !nextUrl.pathname.startsWith("/api/cron")
  ) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const host = req.headers.get("host")?.toLowerCase() || null;

    // Defensive parsing — malformed Origin/Referer headers from broken
    // proxies or hostile clients must not crash the entire middleware.
    const safeParseHost = (value: string | null): string | null => {
      if (!value) return null;
      try {
        return new URL(value).host.toLowerCase();
      } catch {
        return null;
      }
    };

    const originHost = safeParseHost(origin);
    const refererHost = safeParseHost(referer);
    const sameOrigin =
      (originHost && host && originHost === host) ||
      (refererHost && host && refererHost === host) ||
      // If neither Origin nor Referer is set (curl, same-origin fetch
      // that strips them), fall through. Session cookie check still gates
      // these requests on protected routes.
      (!origin && !referer);

    if (!sameOrigin) {
      return NextResponse.json(
        { error: "Cross-origin requests not permitted" },
        { status: 403 }
      );
    }
  }

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

  // Protected dashboard and student routes
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isStudentRoute = nextUrl.pathname.startsWith("/student");

  // Protected API routes (except auth and webhook)
  const isProtectedApiRoute =
    nextUrl.pathname.startsWith("/api") &&
    !nextUrl.pathname.startsWith("/api/auth") &&
    !nextUrl.pathname.startsWith("/api/stripe/webhook") &&
    !nextUrl.pathname.startsWith("/api/cron");

  // Redirect to login if not authenticated
  if (!isLoggedIn && (isDashboardRoute || isStudentRoute)) {
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
