'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  role?: string
  turnstileToken?: string
}

interface AuthUser {
  id?: string
  email?: string | null
  name?: string | null
  role?: string
  avatar?: string | null
  phone?: string | null
}

export function useAuth() {
  const { data: session, status } = useSession()
  const { setCurrentUser, logoutUser } = useAppStore()

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        avatar: session.user.avatar,
        phone: session.user.phone,
      }
    : null

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          toast.error('E-mail ou senha incorretos')
          return false
        }

        // Update Zustand store with user data
        if (result?.ok && session?.user) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role,
            avatar: session.user.avatar,
          })
        }

        toast.success('Login realizado com sucesso!')
        return true
      } catch (error) {
        console.error('Erro no login:', error)
        toast.error('Erro ao fazer login. Tente novamente.')
        return false
      }
    },
    [session, setCurrentUser]
  )

  const register = useCallback(
    async (data: RegisterData): Promise<boolean> => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          toast.error(result.error || 'Erro ao criar conta')
          return false
        }

        // Auto-login after successful registration
        const loginResult = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (loginResult?.ok) {
          toast.success('Conta criada com sucesso! Bem-vindo ao DomPlace.')
          return true
        }

        // If auto-login fails, still show success but ask to login manually
        toast.success('Conta criada! Faça login para continuar.')
        return true
      } catch (error) {
        console.error('Erro no cadastro:', error)
        toast.error('Erro ao criar conta. Tente novamente.')
        return false
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false })
      logoutUser()
      toast.success('Você saiu da sua conta')
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }, [logoutUser])

  const role = user?.role || null
  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

  return {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    isLoading,
    role,
    // Role check helpers
    isAdmin: role === 'ADMIN',
    isStoreOwner: role === 'STORE_OWNER',
    isDeliveryDriver: role === 'DELIVERY_DRIVER',
    isAffiliate: role === 'AFFILIATE',
    isUser: role === 'USER' || role === null,
  }
}
