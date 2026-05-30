import { NextRequest, NextResponse } from 'next/server'
import { apiError, getErrorMessage } from '@/lib/api-response'

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET
const CLOUDINARY_UPLOAD_PRESET = 'domplace_unsigned'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// POST: Upload image to Cloudinary
export async function POST(request: NextRequest) {
  try {
    if (!CLOUDINARY_CLOUD || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return apiError(
        'Serviço de upload não configurado.',
        503,
        'SERVICE_UNAVAILABLE'
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return apiError('Nenhuma imagem enviada. Use o campo "image".', 400, 'NO_FILE')
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError(
        'Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.',
        400,
        'INVALID_TYPE'
      )
    }

    if (file.size > MAX_SIZE) {
      return apiError(
        `Arquivo muito grande. Tamanho máximo: 5MB. Enviado: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
        400,
        'FILE_TOO_LARGE'
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_UPLOAD_PRESET

    const formDataCloudinary = new FormData()
    formDataCloudinary.append('file', new Blob([buffer], { type: file.type }), file.name)
    formDataCloudinary.append('upload_preset', uploadPreset)
    formDataCloudinary.append('folder', 'domplace')

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formDataCloudinary,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const cloudError = errorData?.error?.message || `Cloudinary error: ${response.status}`

      console.warn('[Upload] Cloudinary upload failed:', cloudError)
      console.warn('[Upload] Configure upload preset at: https://console.cloudinary.com → Settings → Upload → Upload Presets → Add Upload Preset → "domplace_unsigned" (unsigned)')

      const placeholderUrl = `https://placehold.co/800x600/059669/ffffff?text=${encodeURIComponent(file.name.replace(/\.[^.]+$/, ''))}`

      return NextResponse.json({
        success: true,
        url: placeholderUrl,
        warning: 'Upload preset não configurado no Cloudinary. Usando placeholder.',
        originalName: file.name,
        size: file.size,
        type: file.type,
      })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      size: data.bytes,
    })
  } catch (error) {
    console.error('[Upload] Error:', error)
    return apiError(getErrorMessage(error), 500, 'UPLOAD_ERROR')
  }
}
