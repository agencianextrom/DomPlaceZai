/**
 * API Authentication Helper
 * Provides utilities for protecting API routes with session-based auth
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

/**
 * Get the current authenticated user from the session
 * Returns null if not authenticated
 */
export async function getAuthUser(request?: NextRequest): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null

    const token = session.user as Record<string, unknown>
    return {
      id: (token.id as string) || '',
      email: (token.email as string) || '',
      name: (token.name as string) || '',
      role: (token.role as string) || 'USER',
    }
  } catch {
    return null
  }
}

/**
 * Require authentication for an API route
 * Returns 401 if not authenticated
 */
export async function requireAuth(request?: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Autenticação necessária', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }
  return user
}

/**
 * Require specific role for an API route
 * Returns 403 if user doesn't have the required role
 */
export async function requireRole(
  roles: string | string[],
  request?: NextRequest
): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Autenticação necessária', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Acesso negado', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  return user
}

/**
 * Check if result is an error response (from requireAuth/requireRole)
 */
export function isAuthError(result: AuthUser | NextResponse): result is NextResponse {
  return result instanceof NextResponse
}
