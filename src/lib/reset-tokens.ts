/**
 * In-memory store for password reset tokens.
 *
 * LIMITATION: Tokens are lost on server restart. This is acceptable for MVP.
 * TODO: Persist tokens to DB (e.g., ActivityLog with action 'PASSWORD_RESET')
 *       for production reliability.
 *
 * Each entry maps a token string → { email, expiresAt }.
 */
const resetTokens = new Map<
  string,
  { email: string; expiresAt: Date; createdAt: Date }
>()

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

export function storeResetToken(
  email: string,
  token: string,
  ttlMs = TOKEN_TTL_MS
): void {
  resetTokens.set(token, {
    email,
    expiresAt: new Date(Date.now() + ttlMs),
    createdAt: new Date(),
  })
}

export function consumeResetToken(token: string): {
  email: string
} | null {
  const entry = resetTokens.get(token)
  if (!entry) return null

  // Check expiry
  if (Date.now() > entry.expiresAt.getTime()) {
    resetTokens.delete(token)
    return null
  }

  // Remove token (one-time use)
  resetTokens.delete(token)
  return { email: entry.email }
}

/**
 * Cleanup expired tokens (call periodically)
 */
export function cleanupExpiredTokens(): number {
  let removed = 0
  for (const [token, entry] of resetTokens) {
    if (Date.now() > entry.expiresAt.getTime()) {
      resetTokens.delete(token)
      removed++
    }
  }
  return removed
}
