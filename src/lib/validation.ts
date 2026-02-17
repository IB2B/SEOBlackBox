/**
 * Input validation utilities for blog fields and user input
 */

// Maximum lengths for blog fields
const FIELD_MAX_LENGTHS: Record<string, number> = {
  TITLE: 300,
  Permalink: 255,
  "META DESC": 300,
  INTRODUCTION: 10000,
  "TL;DR": 5000,
  CONCLUSION: 10000,
  FAQ: 10000,
  BODY: 100000,
  "Section 1": 10000,
  "Section 2": 10000,
  "Section 3": 10000,
  "Section 4": 10000,
  "Section 5": 10000,
  "Section 6": 10000,
  "Section 7": 10000,
  "images URL": 2000,
  "image 1": 2000,
  "image 2": 2000,
  "image 3": 2000,
  "image 4": 2000,
  Keywords: 500,
  Location: 255,
};

/**
 * Validate a URL string using the URL constructor for correctness.
 * Only allows http and https protocols.
 */
function isValidUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate a blog field value
 */
export function validateBlogField(field: string, value: unknown): { valid: boolean; error?: string } {
  // Check if value is string
  if (value !== undefined && value !== null && typeof value !== "string" && typeof value !== "boolean") {
    return { valid: false, error: `${field} must be a string` };
  }

  // Boolean fields
  if (field === "Needs Approval?") {
    if (typeof value !== "boolean") {
      return { valid: false, error: `${field} must be a boolean` };
    }
    return { valid: true };
  }

  // String validation
  if (typeof value === "string") {
    const maxLength = FIELD_MAX_LENGTHS[field] || 10000;

    if (value.length > maxLength) {
      return { valid: false, error: `${field} exceeds maximum length of ${maxLength} characters` };
    }

    // URL fields - only validate fields that explicitly have "url" in the name
    // Skip image fields - they can contain any value
    if (field.toLowerCase().includes("url") && !field.toLowerCase().includes("image")) {
      const trimmedValue = value.trim();
      if (trimmedValue && !isValidUrl(trimmedValue)) {
        return { valid: false, error: `${field} must be a valid URL` };
      }
    }

    // Permalink validation - no spaces, special chars only dashes
    if (field === "Permalink" && value) {
      if (!/^[a-z0-9-]+$/.test(value)) {
        return { valid: false, error: "Permalink must only contain lowercase letters, numbers, and dashes" };
      }
    }
  }

  return { valid: true };
}

/**
 * Validate multiple blog fields
 */
export function validateBlogFields(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [field, value] of Object.entries(data)) {
    const result = validateBlogField(field, value);
    if (!result.valid && result.error) {
      errors.push(result.error);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || !EMAIL_REGEX.test(email)) {
    return { valid: false, error: "Invalid email address" };
  }
  if (email.length > 255) {
    return { valid: false, error: "Email address is too long" };
  }
  return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  if (password.length > 128) {
    return { valid: false, error: "Password is too long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }
  // Check for common weak passwords
  const weakPasswords = ["password", "12345678", "qwerty", "admin123"];
  if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
    return { valid: false, error: "Password is too common, please choose a stronger password" };
  }
  return { valid: true };
}

/**
 * Validate name
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }
  if (name.length > 100) {
    return { valid: false, error: "Name is too long" };
  }
  return { valid: true };
}
