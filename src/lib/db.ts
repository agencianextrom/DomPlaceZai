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

  const adapter = new PrismaLibSql({ url, authToken })
  return new PrismaClient({
    adapter,
    log: ['error'],
  })
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
