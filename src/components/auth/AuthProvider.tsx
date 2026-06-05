'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect, useState, Component, type ReactNode, type ErrorInfo } from 'react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/store/useAppStore'

function AuthSync() {
  const { data: session, status } = useSession()
  const { setCurrentUser, logoutUser } = useAppStore()

  useEffect(() => {
    try {
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
    } catch {
      // Auth sync failed — continue rendering the app without auth
    }
  }, [session, status, setCurrentUser, logoutUser])

  return null
}

// Error boundary that catches SessionProvider / useSession crashes
// (e.g. FedCM failures, network errors) and renders children anyway
interface AuthErrorBoundaryProps {
  children: ReactNode
}

interface AuthErrorBoundaryState {
  hasError: boolean
}

class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): AuthErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log auth error silently — don't crash the entire app
    if (typeof console !== 'undefined') {
      console.warn('[DomPlace] AuthProvider caught error, continuing without auth:', error.message)
    }
  }

  render() {
    if (this.state.hasError) {
      // Render children without auth wrapper so the marketplace still works
      return <>{this.props.children}</>
    }
    return <>{this.props.children}</>
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthErrorBoundary>
      <SessionProvider>
        <AuthSync />
        {children}
      </SessionProvider>
    </AuthErrorBoundary>
  )
}
