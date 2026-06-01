/**
 * Shared input validation utilities
 */

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Validate and clamp pagination parameters
 */
export function parsePagination(searchParams: URLSearchParams, defaults = { limit: 20, maxLimit: 100 }) {
  const limit = clamp(parseInt(searchParams.get('limit') || String(defaults.limit)), 1, defaults.maxLimit)
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))
  return { limit, offset }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validate phone format (Brazilian)
 */
export function isValidPhone(phone: string): boolean {
  return /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(phone)
}

/**
 * Sanitize string - remove HTML tags and trim
 */
export function sanitizeString(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}
