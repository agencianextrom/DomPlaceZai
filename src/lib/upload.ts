/**
 * Utilitário de upload de imagens (lado do cliente)
 * Usa a API /api/upload para enviar arquivos
 */

export interface UploadResult {
  success: boolean
  url: string
  error?: string
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, url: '', error: 'Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.' }
  }

  if (file.size > MAX_SIZE) {
    return { success: false, url: '', error: 'Arquivo muito grande. Tamanho máximo: 5MB.' }
  }

  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, url: '', error: data.error || 'Erro ao enviar imagem' }
    }

    return { success: true, url: data.url }
  } catch {
    return { success: false, url: '', error: 'Erro de conexão. Tente novamente.' }
  }
}

export async function uploadMultipleImages(
  files: File[],
  onProgress?: (index: number, total: number, result: UploadResult) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const result = await uploadImage(files[i])
    results.push(result)
    onProgress?.(i + 1, files.length, result)
  }

  return results
}
