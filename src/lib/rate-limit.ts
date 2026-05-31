/**
 * Simple in-memory rate limiter for API routes
 * Uses a sliding window counter approach
 */

interface RateLimitEntry {
  timestamps: number[]
  count: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  for (const [key, entry] of rateLimitMap.entries()) {
    // Remove entries older than window
    entry.timestamps = entry.timestamps.filter(t => now - t < (entry.count === 0 ? 0 : 60000))
    if (entry.timestamps.length === 0) {
      rateLimitMap.delete(key)
    }
  }
}

export interface RateLimitConfig {
  /** Number of requests allowed in the window */
  limit: number
  /** Time window in milliseconds */
  windowMs: number
  /** Custom identifier (defaults to IP) */
  key?: string
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
  limit: number
}

/**
 * Check rate limit for a given identifier
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 100, windowMs: 60000 }
): RateLimitResult {
  cleanup()

  const now = Date.now()
  const key = config.key || identifier
  const windowStart = now - config.windowMs

  const entry = rateLimitMap.get(key) || { timestamps: [], count: 0 }

  // Filter timestamps within the window
  const validTimestamps = entry.timestamps.filter(t => t > windowStart)
  validTimestamps.push(now)

  entry.timestamps = validTimestamps
  entry.count = validTimestamps.length

  rateLimitMap.set(key, entry)

  const success = entry.count <= config.limit
  const remaining = Math.max(0, config.limit - entry.count)
  const resetAt = entry.timestamps[0] + config.windowMs

  return { success, remaining, resetAt, limit: config.limit }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const headers = new Headers(request.headers)

  // Check common proxy headers
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = headers.get('x-real-ip')
  if (realIP) return realIP

  const cfIP = headers.get('cf-connecting-ip')
  if (cfIP) return cfIP

  return 'unknown'
}

/**
 * Create a rate-limited API handler wrapper
 * Usage: export const GET = withRateLimit(handler, { limit: 10, windowMs: 60000 })
 */
export function withRateLimit(
  handler: (...args: unknown[]) => Promise<Response>,
  config?: RateLimitConfig
) {
  return async (request: Request, ...args: unknown[]) => {
    const ip = getClientIP(request)
    const result = rateLimit(ip, config)

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Muitas requisições. Tente novamente em instantes.',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    return handler(request, ...args)
  }
}
