import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { createHash } from 'crypto'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const account = await db.account.findUnique({
            where: { email: credentials.email },
          })

          if (!account) {
            return null
          }

          // Check account status
          if (account.status !== 'ACTIVE') {
            return null
          }

          // Hash the provided password and compare
          const hashedPassword = hashPassword(credentials.password)
          if (hashedPassword !== account.password) {
            return null
          }

          return {
            id: account.id,
            email: account.email,
            name: account.name,
            role: account.role,
            avatar: account.avatar,
            phone: account.phone,
          }
        } catch (error) {
          console.error('Erro na autenticação:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.avatar = (user as any).avatar || null
        token.phone = (user as any).phone || null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).role = token.role
        (session.user as any).avatar = token.avatar
        (session.user as any).phone = token.phone
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
