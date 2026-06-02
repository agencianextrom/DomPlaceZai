/**
 * Utilitários de upload de imagens — LADO DO CLIENTE — DomPlace
 * Usa a API /api/upload via fetch/XHR (sem dependência do Cloudinary SDK)
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
// VALIDAÇÃO
// ============================================

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.'
  }
  if (file.size > MAX_SIZE) {
    return `Arquivo muito grande. Tamanho máximo: 5MB. Enviado: ${(file.size / 1024 / 1024).toFixed(1)}MB.`
  }
  return null
}

export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

// ============================================
// UPLOAD VIA API (client-side)
// ============================================

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
