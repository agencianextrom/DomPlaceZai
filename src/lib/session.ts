import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  image?: string | null
}

/**
 * Get typed session user. Returns null if not authenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null

    const user = session.user as Record<string, unknown>
    return {
      id: String(user.id || ''),
      email: String(user.email || ''),
      name: String(user.name || ''),
      role: String(user.role || 'USER'),
      image: user.image as string | null | undefined,
    }
  } catch {
    return null
  }
}

/**
 * Require authentication. Returns 401 JSON response if not authenticated.
 */
export async function requireSession(): Promise<SessionUser | Response> {
  const user = await getSessionUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Autenticação necessária', code: 'UNAUTHORIZED' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return user
}

/**
 * Type guard to check if result is an error Response
 */
export function isSessionError(result: SessionUser | Response): result is Response {
  return result instanceof Response
}
