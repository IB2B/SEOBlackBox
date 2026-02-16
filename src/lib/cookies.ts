/**
 * Secure cookie utilities for server-side cookie management
 */

interface CookieOptions {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
}

const DEFAULT_OPTIONS: CookieOptions = {
  maxAge: 7 * 24 * 60 * 60, // 7 days
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

/**
 * Generate a Set-Cookie header value
 */
export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const parts: string[] = [`${name}=${encodeURIComponent(value)}`];

  if (opts.maxAge !== undefined) {
    parts.push(`Max-Age=${opts.maxAge}`);
  }

  if (opts.path) {
    parts.push(`Path=${opts.path}`);
  }

  if (opts.httpOnly) {
    parts.push("HttpOnly");
  }

  if (opts.secure) {
    parts.push("Secure");
  }

  if (opts.sameSite) {
    parts.push(`SameSite=${opts.sameSite.charAt(0).toUpperCase()}${opts.sameSite.slice(1)}`);
  }

  return parts.join("; ");
}

/**
 * Generate a cookie deletion header
 */
export function deleteCookie(name: string): string {
  return `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict`;
}

/**
 * Create auth token cookie header
 */
export function createAuthCookie(token: string): string {
  return serializeCookie("auth_token", token, {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}

/**
 * Create auth token deletion header
 */
export function deleteAuthCookie(): string {
  return deleteCookie("auth_token");
}
