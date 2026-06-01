import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Create Prisma client with Turso libSQL adapter.
 * Falls back to local SQLite if Turso credentials are missing or connection fails.
 */
async function initPrismaWithTurso(): Promise<PrismaClient | null> {
  const tursoUrl = process.env.TURSO_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) return null

  try {
    const { PrismaLibSql } = await import('@prisma/adapter-libsql')
    const adapter = new PrismaLibSql({ url: tursoUrl, authToken: tursoToken })
    console.log('[DB] Using Turso (libSQL) remote database')
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  } catch (error) {
    console.warn('[DB] Failed to initialize Turso adapter, falling back to local SQLite:', error)
    return null
  }
}

// Synchronous fallback — always creates a local SQLite client
function createLocalPrismaClient(): PrismaClient {
  console.log('[DB] Using local SQLite database')
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

// Try to initialize with Turso asynchronously
let _tursoInit: Promise<PrismaClient | null> | null = null
if (process.env.TURSO_URL && process.env.TURSO_AUTH_TOKEN) {
  _tursoInit = initPrismaWithTurso()
}

export const db = globalForPrisma.prisma ?? createLocalPrismaClient()

// If Turso init succeeds, replace the db
if (_tursoInit) {
  _tursoInit.then((tursoClient) => {
    if (tursoClient && !globalForPrisma.prisma) {
      globalForPrisma.prisma = tursoClient
      Object.assign(db, tursoClient)
    }
  }).catch(() => {})
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Health check for database connection
 */
export async function dbHealthCheck(): Promise<{ ok: boolean; latency?: number; error?: string; engine?: string }> {
  try {
    const start = Date.now()
    await db.$queryRaw`SELECT 1`
    const latency = Date.now() - start
    const isTurso = !!(process.env.TURSO_URL && process.env.TURSO_AUTH_TOKEN)
    return { ok: true, latency, engine: isTurso ? 'turso' : 'sqlite' }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}
