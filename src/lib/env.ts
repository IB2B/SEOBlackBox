/**
 * Environment variable validation
 * Ensures required environment variables are set
 */

interface EnvConfig {
  BASEROW_API_URL: string;
  BASEROW_API_TOKEN: string;
  BASEROW_USERS_TABLE_ID: string;
  BASEROW_BLOGS_TABLE_ID: string;
  JWT_SECRET: string;
}

let cachedEnv: EnvConfig | null = null;

/**
 * Get and validate required environment variables
 */
export function getEnv(): EnvConfig {
  if (cachedEnv) return cachedEnv;

  const env: Partial<EnvConfig> = {
    BASEROW_API_URL: process.env.BASEROW_API_URL,
    BASEROW_API_TOKEN: process.env.BASEROW_API_TOKEN,
    BASEROW_USERS_TABLE_ID: process.env.BASEROW_USERS_TABLE_ID,
    BASEROW_BLOGS_TABLE_ID: process.env.BASEROW_BLOGS_TABLE_ID,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  const missing: string[] = [];
  const isProduction = process.env.NODE_ENV === "production";

  // Validate required variables
  if (!env.BASEROW_API_TOKEN) {
    missing.push("BASEROW_API_TOKEN");
  }
  if (!env.BASEROW_BLOGS_TABLE_ID) {
    missing.push("BASEROW_BLOGS_TABLE_ID");
  }
  if (isProduction && !env.JWT_SECRET) {
    missing.push("JWT_SECRET");
  }

  if (missing.length > 0 && isProduction) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  // Provide defaults for development
  cachedEnv = {
    BASEROW_API_URL: env.BASEROW_API_URL || "https://dayta.intelligentb2b.com",
    BASEROW_API_TOKEN: env.BASEROW_API_TOKEN || "",
    BASEROW_USERS_TABLE_ID: env.BASEROW_USERS_TABLE_ID || "",
    BASEROW_BLOGS_TABLE_ID: env.BASEROW_BLOGS_TABLE_ID || "1346",
    JWT_SECRET: env.JWT_SECRET || "dev-only-secret-key-min-32-characters-long",
  };

  // Log warnings in development for missing optional variables
  if (!isProduction && missing.length > 0) {
    console.warn(`WARNING: Missing environment variables: ${missing.join(", ")}`);
  }

  return cachedEnv;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== "production";
}
