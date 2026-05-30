/**
 * DomPlace - Centralized password hashing utility
 * Uses PBKDF2-SHA512 (100k iterations) with random 16-byte salt
 *
 * Format: <salt_hex>:<hash_hex>
 * Backward compatible with legacy SHA-256 hashes (no colon)
 */

import { pbkdf2Sync, randomBytes, createHash } from 'crypto'

const PBKDF2_ITERATIONS = 100_000
const PBKDF2_KEY_LENGTH = 64
const PBKDF2_ALGORITHM = 'sha512'

/**
 * Hash a password using PBKDF2-SHA512 with a random salt
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_LENGTH,
    PBKDF2_ALGORITHM
  ).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verify a password against a stored hash
 * Supports both PBKDF2 format (salt:hash) and legacy SHA-256 (plain hex)
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false

  // Modern PBKDF2 format: contains colon separator
  if (storedHash.includes(':')) {
    const colonIndex = storedHash.indexOf(':')
    const salt = storedHash.slice(0, colonIndex)
    const expectedHash = storedHash.slice(colonIndex + 1)

    if (!salt || !expectedHash) return false

    const computedHash = pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      PBKDF2_KEY_LENGTH,
      PBKDF2_ALGORITHM
    ).toString('hex')

    return computedHash === expectedHash
  }

  // Legacy SHA-256 format: plain hex hash (backward compatibility)
  const legacyHash = createHash('sha256').update(password).digest('hex')
  return legacyHash === storedHash
}

/**
 * Generate a secure random token
 */
export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex')
}
