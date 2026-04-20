import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const { pathname } = req.nextUrl

      // Public routes that don't require authentication
      const publicPaths = [
        '/',
        '/api/auth',
        '/api/products',
        '/api/stores',
        '/api/banners',
        '/api/seed',
        '/api/route',
        '/api/upload',
        '/api/cart',
        '/api/orders',
        '/api/reviews',
        '/api/favorites',
        '/api/cep',
        '/api/weather',
        '/api/turnstile',
        '/api/payments',
        '/api/notifications',
        '/api/affiliate/track',
        '/_next',
        '/favicon.ico',
        '/public',
      ]

      // Check if path is public
      const isPublic = publicPaths.some(
        (path) => pathname === path || pathname.startsWith(path + '/')
      )

      if (isPublic) {
        return true
      }

      // Protected API routes require authentication
      if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
        // Admin API routes require ADMIN role
        if (pathname.startsWith('/api/admin/')) {
          const role = (token as Record<string, unknown>)?.role as string | undefined
          return role === 'ADMIN'
        }
        // Driver API routes require DELIVERY_DRIVER role
        if (pathname.startsWith('/api/driver/')) {
          const role = (token as Record<string, unknown>)?.role as string | undefined
          return role === 'DELIVERY_DRIVER' || role === 'ADMIN'
        }
        // Store dashboard API routes require STORE_OWNER role
        if (pathname.startsWith('/api/store-dashboard/')) {
          const role = (token as Record<string, unknown>)?.role as string | undefined
          return role === 'STORE_OWNER' || role === 'ADMIN'
        }
        // Affiliate API routes require AFFILIATE role (except public track)
        if (pathname.startsWith('/api/affiliate/') && !pathname.startsWith('/api/affiliate/track')) {
          const role = (token as Record<string, unknown>)?.role as string | undefined
          return role === 'AFFILIATE' || role === 'ADMIN'
        }
        // Profile API routes require any authenticated user
        if (pathname.startsWith('/api/profile/')) {
          return !!token
        }
        // Loyalty API routes require any authenticated user
        if (pathname.startsWith('/api/loyalty')) {
          return !!token
        }
        // Address API routes require any authenticated user
        if (pathname.startsWith('/api/addresses')) {
          return !!token
        }
        return !!token
      }

      // All other routes are public (SPA handles routing)
      return true
    },
  },
  pages: {
    signIn: '/',
  },
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
