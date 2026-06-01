import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_KEY
    ? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    : undefined,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_FILE_SIZE_MB = 10

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo não suportado. Use JPG, PNG, GIF ou WebP.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo: 5MB. Enviado: ${(file.size / 1024 / 1024).toFixed(1)}MB.` },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: 'domplace',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        .end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    })
  } catch (error: any) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar imagem. Tente novamente.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: 'publicId é obrigatório.' }, { status: 400 })
    }

    await cloudinary.uploader.destroy(publicId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Upload] Delete error:', error)
    return NextResponse.json(
      { error: 'Erro ao remover imagem.' },
      { status: 500 }
    )
  }
}
