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
        // Phase 1 & 2 API integrations
        '/api/cep',
        '/api/weather',
        '/api/turnstile',
        '/api/payments',
        '/api/notifications',
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
    '/api/((?!auth|products|stores|banners|seed|route|upload|cart|orders|reviews|favorites|cep|weather|turnstile|payments|notifications).*)',
  ],
}
