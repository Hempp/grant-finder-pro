import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/dashboard"];
const publicAuthRoutes = ["/login", "/signup"];
const publicApiRoutes = ["/api/auth", "/api/grants", "/api/test-db"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if it's a protected or public auth route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicAuthRoute = publicAuthRoutes.some(route => path.startsWith(route));
  const isApiRoute = path.startsWith("/api");
  const isPublicApiRoute = publicApiRoutes.some(route => path.startsWith(route));

  // Allow public API routes to pass through
  if (isPublicApiRoute) {
    return NextResponse.next();
  }

  // Get the JWT token (works in Edge runtime)
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });
  const isLoggedIn = !!token;

  // Redirect logged-in users away from login/signup pages
  if (isPublicAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // Protect API routes (except auth routes)
  if (isApiRoute && !isPublicApiRoute && !isLoggedIn) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
