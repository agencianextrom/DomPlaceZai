import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

/**
 * DomPlace - Conexão com banco de dados Turso (libSQL)
 * Turso é o banco de dados ABSOLUTO — sem fallback para SQLite local.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    throw new Error('[DB] TURSO_URL é obrigatória no .env')
  }
  if (!authToken) {
    throw new Error('[DB] TURSO_AUTH_TOKEN é obrigatório no .env')
  }

  console.log(`[DB] Conectando ao Turso: ${url.substring(0, 40)}...`)

  try {
    // PrismaLibSQL is a factory — pass connection config, not a pre-created client
    const adapter = new PrismaLibSQL({ url, authToken })

    console.log('[DB] Conectado ao Turso (libSQL) — banco de dados remoto')

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
    })
  } catch (error) {
    console.error('[DB] Falha ao inicializar cliente Turso:', error)
    throw error
  }
}

// Singleton para desenvolvimento (evita recriação em hot-reload)
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

/**
 * Verificação de saúde da conexão com o banco de dados
 */
export async function dbHealthCheck(): Promise<{
  ok: boolean
  latency?: number
  error?: string
  engine?: string
}> {
  try {
    const start = Date.now()
    await db.$queryRaw`SELECT 1`
    const latency = Date.now() - start
    return { ok: true, latency, engine: 'turso' }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}
