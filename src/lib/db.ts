import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const TURSO_URL = 'libsql://domplace-agencianextrom.aws-us-east-1.turso.io'
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODAxNTkyNjEsImlkIjoiMDE5ZDllZTAtMTAwMS03ZDU2LThhOGUtZmM5ZmJiNmQ1Yzg2IiwicmlkIjoiMDVhNTg3YzctZGI1Mi00ZDVmLTg0YzEtODJhM2UzOTEwM2Q3In0.pnUWz4l0ye6-M9dEqtn9Pg_IYrEu7e_soMTiuyMZ59RHPHSJ8-Bc-5UxwCWBUPxvwljtQYN7YBtVFEhZRTvRCg'

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: TURSO_URL, authToken: TURSO_TOKEN })
  return new PrismaClient({
    adapter,
    log: ['error'],
  })
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
