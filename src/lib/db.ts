import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = process.env.TURSO_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url || !authToken) {
    throw new Error(
      '[DB] TURSO_URL and TURSO_AUTH_TOKEN environment variables are required. ' +
      'Please check your .env file.'
    )
  }

  const adapter = new PrismaLibSql({
    url,
    authToken,
    // Connection pooling hints for Turso
    // The PrismaLibSql adapter handles connection reuse internally
  })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Health check for database connection
 */
export async function dbHealthCheck(): Promise<{ ok: boolean; latency?: number; error?: string }> {
  try {
    const start = Date.now()
    await db.$queryRaw`SELECT 1`
    const latency = Date.now() - start
    return { ok: true, latency }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}
