/**
 * Utilitários de upload de imagens — DomPlace
 *
 * Lado do cliente: usa a API /api/upload via fetch/XHR
 * Lado do servidor: funções para uso direto em API routes
 */

// ============================================
// TIPOS
// ============================================

export interface UploadResult {
  success: boolean
  url: string
  publicId?: string
  width?: number
  height?: number
  format?: string
  error?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

// ============================================
// CONSTANTES
// ============================================

export const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
export const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// ============================================
// VALIDAÇÃO (compartilhada cliente/servidor)
// ============================================

/**
 * Valida um arquivo de imagem antes do upload
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.'
  }
  if (file.size > MAX_SIZE) {
    return `Arquivo muito grande. Tamanho máximo: 5MB. Enviado: ${(file.size / 1024 / 1024).toFixed(1)}MB.`
  }
  return null
}

/**
 * Gera URL de pré-visualização local (object URL) para um arquivo
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

// ============================================
// CLIENTE — Upload via API
// ============================================

/**
 * Faz upload de uma única imagem com suporte a progresso
 */
export function uploadImage(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const validationError = validateImageFile(file)
    if (validationError) {
      resolve({ success: false, url: '', error: validationError })
      return
    }

    const formData = new FormData()
    formData.append('image', file)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded / event.total) * 100),
        })
      }
    })

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText)

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            success: true,
            url: data.url,
            publicId: data.publicId,
            width: data.width,
            height: data.height,
            format: data.format,
          })
        } else {
          resolve({
            success: false,
            url: '',
            error: data.error || `Erro ao enviar imagem (${xhr.status})`,
          })
        }
      } catch {
        resolve({
          success: false,
          url: '',
          error: 'Erro ao processar resposta do servidor.',
        })
      }
    })

    xhr.addEventListener('error', () => {
      resolve({
        success: false,
        url: '',
        error: 'Erro de conexão. Tente novamente.',
      })
    })

    xhr.addEventListener('abort', () => {
      resolve({
        success: false,
        url: '',
        error: 'Upload cancelado.',
      })
    })

    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}

/**
 * Faz upload de múltiplas imagens sequencialmente com callback de progresso
 */
export async function uploadMultipleImages(
  files: File[],
  onProgress?: (index: number, total: number, result: UploadResult) => void,
  onFileProgress?: (index: number, progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const result = await uploadImage(files[i], (progress) => {
      onFileProgress?.(i, progress)
    })
    results.push(result)
    onProgress?.(i + 1, files.length, result)
  }

  return results
}

/**
 * Remove uma imagem do Cloudinary via API
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Erro ao remover imagem' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Erro de conexão ao remover imagem.' }
  }
}

// ============================================
// SERVIDOR — Funções diretas com Cloudinary SDK
// ============================================

/**
 * Faz upload de um Buffer para o Cloudinary diretamente (lado do servidor).
 * Retorna a URL segura e o publicId.
 */
export async function uploadImageToCloudinary(
  buffer: Buffer,
  folder: string = 'domplace',
  publicId?: string
): Promise<UploadResult> {
  try {
    // Importação dinâmica — só executa no servidor
    const { v2: cloudinary } = await import('cloudinary')

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder,
            public_id: publicId || undefined,
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

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    }
  } catch (error) {
    console.error('[Cloudinary] Erro no upload:', error)
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Erro ao enviar imagem para Cloudinary.',
    }
  }
}

/**
 * Faz upload em lote de múltiplos Buffers para o Cloudinary
 */
export async function uploadImagesToCloudinary(
  buffers: Buffer[],
  folder: string = 'domplace'
): Promise<UploadResult[]> {
  const results = await Promise.all(
    buffers.map((buffer) => uploadImageToCloudinary(buffer, folder))
  )
  return results
}

/**
 * Remove uma imagem do Cloudinary diretamente (lado do servidor)
 */
export async function deleteImageFromCloudinary(
  publicId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { v2: cloudinary } = await import('cloudinary')

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === 'ok' || result.result === 'not found') {
      return { success: true }
    }

    return { success: false, error: 'Erro ao remover imagem do Cloudinary.' }
  } catch (error) {
    console.error('[Cloudinary] Erro ao remover:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao remover imagem do Cloudinary.',
    }
  }
}
