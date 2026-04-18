import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import { db } from '@/lib/db'
import { createHash } from 'crypto'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

// Criar account no banco se não existe (para OAuth)
async function ensureAccountExists(
  email: string,
  name: string,
  provider: string,
  avatar?: string | null
) {
  try {
    const existing = await db.account.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existing) {
      // Atualizar avatar se veio do provider
      if (avatar && !existing.avatar) {
        await db.account.update({
          where: { id: existing.id },
          data: { avatar },
        })
      }
      return existing
    }

    // Criar nova conta via OAuth
    const account = await db.account.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashPassword(`oauth-${provider}-${Date.now()}-${Math.random().toString(36)}`),
        name: (name || email.split('@')[0]).trim(),
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: new Date(),
        avatar: avatar || null,
      },
    })

    // Criar registro de usuário com bônus de boas-vindas
    await db.user.create({
      data: {
        accountId: account.id,
        loyaltyBalance: 500, // Bônus de boas-vindas
      },
    })

    // Registrar pontos de fidelidade
    await db.loyaltyPoint.create({
      data: {
        accountId: account.id,
        points: 500,
        source: 'BÔNUS_CADASTRO',
      },
    })

    console.log(`[Auth] Nova conta criada via ${provider}: ${email} (500 pontos de boas-vindas)`)

    return account
  } catch (error) {
    console.error(`[Auth] Erro ao criar conta via ${provider}:`, error)
    return null
  }
}

// Construir providers de forma síncrona com condicionais
const providers: NextAuthOptions['providers'] = [
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
]

// Adicionar Google OAuth condicionalmente
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          scope: 'openid email profile',
        },
      },
    })
  )
}

// Adicionar Facebook OAuth condicionalmente
if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  )
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async signIn({ user, account: oauthAccount }) {
      // Se o login veio de OAuth provider
      if (oauthAccount?.provider === 'google' || oauthAccount?.provider === 'facebook') {
        if (!user.email) return false

        const existingAccount = await ensureAccountExists(
          user.email,
          user.name || '',
          oauthAccount.provider,
          user.image
        )

        if (!existingAccount) return false

        // Verificar se a conta está ativa
        if (existingAccount.status !== 'ACTIVE') return false

        // Injetar dados extras do banco no user
        user.id = existingAccount.id
        user.role = existingAccount.role as string
        ;(user as Record<string, unknown>).avatar = existingAccount.avatar
        ;(user as Record<string, unknown>).phone = existingAccount.phone
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as Record<string, unknown>).role || user.role
        token.avatar = (user as Record<string, unknown>).avatar || null
        token.phone = (user as Record<string, unknown>).phone || null
      }

      // Se for uma sessão existente, buscar dados atualizados do banco
      if (trigger === 'update' && token.email) {
        try {
          const account = await db.account.findUnique({
            where: { email: token.email as string },
          })
          if (account) {
            token.role = account.role
            token.name = account.name
            token.avatar = account.avatar
            token.phone = account.phone
          }
        } catch {
          // Silencioso
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id
        (session.user as Record<string, unknown>).role = token.role
        (session.user as Record<string, unknown>).avatar = token.avatar
        (session.user as Record<string, unknown>).phone = token.phone
      }
      return session
    },
  },
  events: {
    async signIn({ user, account: oauthAccount }) {
      // Criar conta para OAuth no evento (backup do callback)
      if (
        oauthAccount?.provider === 'google' || oauthAccount?.provider === 'facebook'
      ) {
        if (user.email) {
          await ensureAccountExists(
            user.email,
            user.name || '',
            oauthAccount.provider,
            user.image
          )
        }
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
