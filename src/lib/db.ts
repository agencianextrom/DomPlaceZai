import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

/**
 * DomPlace - Conexão com banco de dados Turso (libSQL)
 * Turso é o banco de dados ABSOLUTO — sem fallback para SQLite local.
 * Cliente é inicializado de forma lazy para evitar erros durante build/SSG.
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

// Lazy singleton — only initializes on first access, not at module load time.
// This prevents build-time failures when TURSO_URL is not available.
function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    // Allow typeof/toString checks without initializing
    if (prop === Symbol.toPrimitive || prop === Symbol.toStringTag || prop === 'then') return undefined
    if (prop === typeof Symbol && typeof prop === 'symbol') return undefined
    return Reflect.get(getDb(), prop, receiver)
  },
})

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
    await getDb().$queryRaw`SELECT 1`
    const latency = Date.now() - start
    return { ok: true, latency, engine: 'turso' }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}
