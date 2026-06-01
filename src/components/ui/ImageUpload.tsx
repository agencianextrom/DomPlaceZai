'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { uploadImage, validateImageFile, createPreviewUrl, type UploadProgress } from '@/lib/upload-client'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxFiles?: number
  className?: string
  label?: string
}

interface PendingUpload {
  id: string
  file: File
  previewUrl: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  url?: string
}

export function ImageUpload({
  images,
  onChange,
  maxFiles = 5,
  className,
  label = 'Adicionar imagens',
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isUploading = pendingUploads.some((p) => p.status === 'uploading')

  const addImage = async (file: File) => {
    setPendingUploads((prevPending) => {
      const totalImages = images.length + prevPending.filter((p) => p.status !== 'error').length
      if (totalImages >= maxFiles) {
        return prevPending
      }
      return prevPending
    })

    // Check total using current images + pending
    // Use a snapshot approach to avoid stale state
    const validationError = validateImageFile(file)
    if (validationError) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      setPendingUploads((prev) => [
        ...prev,
        {
          id,
          file,
          previewUrl: createPreviewUrl(file),
          progress: 0,
          status: 'error',
          error: validationError,
        },
      ])
      setTimeout(() => {
        setPendingUploads((prev) => prev.filter((p) => p.id !== id))
      }, 4000)
      return
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const previewUrl = createPreviewUrl(file)

    setPendingUploads((prev) => [
      ...prev,
      { id, file, previewUrl, progress: 0, status: 'uploading' },
    ])

    const result = await uploadImage(file, (progress: UploadProgress) => {
      setPendingUploads((prev) =>
        prev.map((p) => (p.id === id ? { ...p, progress: progress.percent } : p))
      )
    })

    if (result.success) {
      setPendingUploads((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: 'success' as const, progress: 100, url: result.url }
            : p
        )
      )
      onChange([...images, result.url])

      setTimeout(() => {
        setPendingUploads((prev) => prev.filter((p) => p.id !== id))
      }, 1000)
    } else {
      setPendingUploads((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: 'error' as const, error: result.error || 'Erro ao enviar' }
            : p
        )
      )
      setTimeout(() => {
        setPendingUploads((prev) => prev.filter((p) => p.id !== id))
      }, 4000)
    }
  }

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    )

    files.forEach((file) => addImage(file))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => addImage(file))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  const totalImages = images.length + pendingUploads.filter((p) => p.status !== 'error').length
  const canAddMore = totalImages < maxFiles

  return (
    <div className={cn('space-y-3', className)}>
      {/* Área de drag and drop */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-all cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          !canAddMore && 'pointer-events-none opacity-60'
        )}
      >
        {isUploading ? (
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
        )}

        <div className="text-center">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, GIF ou WebP (máx. 5MB)
          </p>
          <p className="text-xs text-muted-foreground">
            {totalImages}/{maxFiles} imagens
          </p>
        </div>

        {isUploading && (
          <p className="text-xs text-primary font-medium animate-pulse">
            Enviando imagens...
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Pré-visualizações de uploads pendentes */}
      {pendingUploads.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {pendingUploads.map((upload) => (
            <div
              key={upload.id}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              {/* Imagem de pré-visualização */}
              <img
                src={upload.previewUrl}
                alt={upload.file.name}
                className="h-full w-full object-cover"
              />

              {/* Overlay de status */}
              <div
                className={cn(
                  'absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity',
                  upload.status === 'uploading' && 'bg-black/40',
                  upload.status === 'success' && 'bg-emerald-500/20',
                  upload.status === 'error' && 'bg-destructive/20'
                )}
              >
                {upload.status === 'uploading' && (
                  <>
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                    <span className="text-[10px] text-white font-medium bg-black/60 px-1.5 py-0.5 rounded">
                      {upload.progress}%
                    </span>
                    <Progress
                      value={upload.progress}
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-none"
                    />
                  </>
                )}
                {upload.status === 'success' && (
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                )}
                {upload.status === 'error' && (
                  <div className="flex flex-col items-center gap-1 px-1">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                    <span className="text-[8px] text-center text-destructive font-medium leading-tight line-clamp-2">
                      {upload.error}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Imagens já enviadas */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <img
                src={url}
                alt={`Imagem ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[10px] font-medium text-center py-0.5">
                  Principal
                </span>
              )}
            </div>
          ))}

          {/* Botão adicionar mais */}
          {canAddMore && (
            <button
              type="button"
              onClick={handleClick}
              disabled={isUploading}
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
