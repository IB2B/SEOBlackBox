import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/jwt";

// Routes that don't require authentication
const publicRoutes = ["/login", "/register"];
const publicApiRoutes = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/cron/",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from HttpOnly cookie (primary) or Authorization header (fallback for external API clients)
  const cookieToken = request.cookies.get("auth_token")?.value;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  // Check for API routes
  if (pathname.startsWith("/api/")) {
    // CSRF protection for cookie-based auth on mutating requests in production.
    // Bearer token requests (external API clients) are not vulnerable to CSRF.
    const method = request.method.toUpperCase();
    const isCookieAuth = !!cookieToken && !bearerToken;
    if (isCookieAuth && method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
      if (process.env.NODE_ENV === "production") {
        const origin = request.headers.get("origin");
        const referer = request.headers.get("referer");
        const host = request.headers.get("host");

        if (!origin && !referer) {
          return NextResponse.json(
            { success: false, error: "Forbidden" },
            { status: 403 }
          );
        }

        const checkHost = origin || referer;
        if (checkHost) {
          try {
            const parsedHost = new URL(checkHost).host;
            if (parsedHost !== host) {
              return NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
              );
            }
          } catch {
            return NextResponse.json(
              { success: false, error: "Forbidden" },
              { status: 403 }
            );
          }
        }
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.userId));
    requestHeaders.set("x-user-email", payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Check for dashboard routes (protected pages)
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
