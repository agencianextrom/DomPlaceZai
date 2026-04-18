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
        id: (session.user as any).id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role,
        avatar: (session.user as any).avatar,
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
