'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/store/useAppStore'

function AuthSync() {
  const { data: session, status } = useSession()
  const { setCurrentUser, logoutUser } = useAppStore()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setCurrentUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        avatar: session.user.avatar,
      })
    } else if (status === 'unauthenticated') {
      logoutUser()
    }
  }, [session, status, setCurrentUser, logoutUser])

  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthSync />
      {children}
    </SessionProvider>
  )
}
