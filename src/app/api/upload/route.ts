import { NextRequest, NextResponse } from 'next/server'
import { apiError, getErrorMessage } from '@/lib/api-response'
import { requireAuth, isAuthError } from '@/lib/api-auth'
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary com credenciais do servidor (signed upload)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// Rate limiting simples em memória (IP → array de timestamps)
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto
const RATE_LIMIT_MAX = 10 // 10 uploads por minuto por IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []

  // Remover timestamps antigos
  const filtered = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW)

  if (filtered.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, filtered)
    return false // Rate limit excedido
  }

  filtered.push(now)
  rateLimitMap.set(ip, filtered)
  return true // Permitido
}

// Limpeza periódica do mapa de rate limiting (a cada 5 minutos)
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, timestamps] of rateLimitMap.entries()) {
      const filtered = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW)
      if (filtered.length === 0) {
        rateLimitMap.delete(ip)
      } else {
        rateLimitMap.set(ip, filtered)
      }
    }
  }, 5 * 60 * 1000)
}

// POST: Upload image to Cloudinary (authenticated, rate-limited)
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const authResult = await requireAuth(request)
    if (isAuthError(authResult)) {
      return authResult
    }
    const user = authResult

    // 2. Verificar configuração do Cloudinary
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return apiError(
        'Serviço de upload não configurado.',
        503,
        'SERVICE_UNAVAILABLE'
      )
    }

    // 3. Rate limiting por IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(ip)) {
      return apiError(
        'Muitos uploads em um curto período. Aguarde um momento e tente novamente.',
        429,
        'RATE_LIMIT_EXCEEDED'
      )
    }

    // 4. Extrair arquivo do formData
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return apiError('Nenhuma imagem enviada. Use o campo "image".', 400, 'NO_FILE')
    }

    // 5. Validar tipo de arquivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError(
        'Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.',
        400,
        'INVALID_TYPE'
      )
    }

    // 6. Validar tamanho do arquivo
    if (file.size > MAX_SIZE) {
      return apiError(
        `Arquivo muito grande. Tamanho máximo: 5MB. Enviado: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
        400,
        'FILE_TOO_LARGE'
      )
    }

    // 7. Converter para Buffer e fazer upload via Cloudinary SDK (signed)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Gerar public ID único baseado no ID do usuário e timestamp
    const timestamp = Date.now()
    const sanitized = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50)
    const publicId = `domplace/${user.id}/${sanitized}_${timestamp}`

    const uploadResult = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: publicId,
            folder: 'domplace',
            resource_type: 'image',
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
            // Limitar dimensões máximas para evitar abuse
            max_width: 2000,
            max_height: 2000,
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result!)
          }
        )
        .end(buffer)
    })

    // 8. Retornar resposta com dados do upload
    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      size: uploadResult.bytes,
      originalName: file.name,
    })
  } catch (error) {
    console.error('[Upload] Error:', error)
    return apiError(getErrorMessage(error), 500, 'UPLOAD_ERROR')
  }
}

// DELETE: Remover imagem do Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await requireAuth(request)
    if (isAuthError(authResult)) {
      return authResult
    }

    const { publicId } = await request.json()

    if (!publicId) {
      return apiError('publicId é obrigatório para remoção.', 400, 'MISSING_PUBLIC_ID')
    }

    // Verificar se o publicId pertence ao domínio do domplace
    if (!publicId.startsWith('domplace/')) {
      return apiError('Você só pode remover imagens do DomPlace.', 403, 'FORBIDDEN')
    }

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({
        success: true,
        publicId,
        result: result.result,
      })
    }

    return apiError('Erro ao remover imagem do Cloudinary.', 500, 'DELETE_ERROR')
  } catch (error) {
    console.error('[Upload] Delete error:', error)
    return apiError(getErrorMessage(error), 500, 'DELETE_ERROR')
  }
}
