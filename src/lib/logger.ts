/**
 * Safe logging utility that only logs in development
 * Prevents sensitive data from being exposed in production logs
 */

const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  /**
   * Log debug information (development only)
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log("[DEBUG]", ...args);
    }
  },

  /**
   * Log general information (development only)
   */
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info("[INFO]", ...args);
    }
  },

  /**
   * Log warnings (development only for detailed info)
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn("[WARN]", ...args);
    }
  },

  /**
   * Log errors - sanitized version in production
   */
  error: (message: string, error?: unknown) => {
    if (isDev) {
      console.error("[ERROR]", message, error);
    } else {
      // In production, only log error type, not sensitive details
      const errorType = error instanceof Error ? error.name : "UnknownError";
      console.error(`[ERROR] ${message} (${errorType})`);
    }
  },

  /**
   * Log API errors with request context (sanitized)
   */
  apiError: (endpoint: string, error: unknown) => {
    if (isDev) {
      console.error(`[API ERROR] ${endpoint}:`, error);
    } else {
      const errorType = error instanceof Error ? error.name : "UnknownError";
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      // Sanitize error message to remove potential sensitive info
      const sanitizedMessage = errorMessage
        .replace(/Bearer\s+[^\s]+/gi, "Bearer [REDACTED]")
        .replace(/token[=:]\s*[^\s&]+/gi, "token=[REDACTED]")
        .replace(/password[=:]\s*[^\s&]+/gi, "password=[REDACTED]")
        .replace(/email[=:]\s*[^\s&]+/gi, "email=[REDACTED]");
      console.error(`[API ERROR] ${endpoint}: ${errorType} - ${sanitizedMessage}`);
    }
  },
};
