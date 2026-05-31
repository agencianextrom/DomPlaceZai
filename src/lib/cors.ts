/**
 * CORS utility for API routes
 * Restricts cross-origin access to protect API endpoints
 */

const ALLOWED_ORIGINS = [
  process.env.NEXTAUTH_URL || 'http://localhost:3000',
  // Add production URL when deploying
  // 'https://domplace.com.br',
  // 'https://www.domplace.com.br',
]

export function corsHeaders(origin?: string | null): HeadersInit {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin)

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin || '*' : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  }
}

export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin')
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    })
  }
  return null
}
