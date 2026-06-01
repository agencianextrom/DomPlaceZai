import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configuração do Cloudinary (assinada — lado do servidor)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Valida um arquivo recebido
 */
function validateFile(file: File): string | null {
  if (!file) return 'Nenhuma imagem enviada.'
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Tipo não suportado. Use JPG, PNG, GIF ou WebP.'
  }
  if (file.size > MAX_SIZE) {
    return `Arquivo muito grande. Máximo: 5MB. Enviado: ${(file.size / 1024 / 1024).toFixed(1)}MB.`
  }
  return null
}

/**
 * Faz upload de um Buffer para o Cloudinary via upload_stream
 */
async function uploadBuffer(
  buffer: Buffer,
  folder: string
): Promise<{ secure_url: string; public_id: string; width: number; height: number; format: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'image',
          folder,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result as any)
        }
      )
      .end(buffer)
  })
}

// ============================================
// POST: Upload de uma ou múltiplas imagens
// ============================================

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const folder = (formData.get('folder') as string) || 'domplace'

    // Verificar se é múltiplos arquivos (campo "images")
    const imageFiles = formData.getAll('images') as File[]
    // Ou arquivo único (campo "image" — compatibilidade retroativa)
    const singleFile = formData.get('image') as File | null

    // Priorizar campo "images" (batch), senão "image" (single)
    const files = imageFiles.length > 0 ? imageFiles : singleFile ? [singleFile] : []

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma imagem enviada. Envie via campo "image" (única) ou "images" (múltiplas).' },
        { status: 400 }
      )
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Máximo de 10 imagens por requisição.' },
        { status: 400 }
      )
    }

    // Validar todos os arquivos
    for (const file of files) {
      const validationError = validateFile(file)
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 })
      }
    }

    // Processar uploads em paralelo
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      return uploadBuffer(buffer, folder)
    })

    const results = await Promise.all(uploadPromises)

    // Retorno compatível: arquivo único → objeto, múltiplos → array
    if (files.length === 1 && !imageFiles.length) {
      // Compatibilidade: campo "image" retorna objeto único
      return NextResponse.json({
        success: true,
        url: results[0].secure_url,
        publicId: results[0].public_id,
        width: results[0].width,
        height: results[0].height,
        format: results[0].format,
      })
    }

    // Campo "images" retorna array
    return NextResponse.json({
      success: true,
      count: results.length,
      uploads: results.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
        format: r.format,
      })),
    })
  } catch (error: any) {
    console.error('[Upload] Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro ao processar imagem. Tente novamente.' },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE: Remover imagem do Cloudinary
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { publicId, publicIds } = body as {
      publicId?: string
      publicIds?: string[]
    }

    // Remoção em lote
    if (publicIds && publicIds.length > 0) {
      if (publicIds.length > 20) {
        return NextResponse.json(
          { error: 'Máximo de 20 imagens por remoção.' },
          { status: 400 }
        )
      }

      const results = await Promise.all(
        publicIds.map((id) => cloudinary.uploader.destroy(id))
      )

      const successCount = results.filter((r) => r.result === 'ok' || r.result === 'not found').length

      return NextResponse.json({
        success: true,
        deleted: successCount,
        total: publicIds.length,
      })
    }

    // Remoção única
    if (!publicId) {
      return NextResponse.json(
        { error: 'publicId ou publicIds é obrigatório.' },
        { status: 400 }
      )
    }

    await cloudinary.uploader.destroy(publicId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Upload] Erro ao remover:', error)
    return NextResponse.json(
      { error: 'Erro ao remover imagem.' },
      { status: 500 }
    )
  }
}
