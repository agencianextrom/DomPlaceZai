'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadImage, type UploadResult } from '@/lib/upload'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxFiles?: number
  className?: string
  label?: string
}

export function ImageUpload({
  images,
  onChange,
  maxFiles = 5,
  className,
  label = 'Adicionar imagens',
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addImage = useCallback(
    async (file: File) => {
      if (images.length >= maxFiles) {
        setUploadProgress(`Máximo de ${maxFiles} imagens atingido`)
        setTimeout(() => setUploadProgress(''), 2000)
        return
      }

      setUploading(true)
      setUploadProgress('Enviando...')

      const result = await uploadImage(file)

      if (result.success) {
        onChange([...images, result.url])
        setUploadProgress('')
      } else {
        setUploadProgress(result.error || 'Erro ao enviar')
        setTimeout(() => setUploadProgress(''), 3000)
      }

      setUploading(false)
    },
    [images, maxFiles, onChange]
  )

  const removeImage = useCallback(
    (index: number) => {
      const updated = images.filter((_, i) => i !== index)
      onChange(updated)
    },
    [images, onChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      )

      files.forEach((file) => addImage(file))
    },
    [addImage]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      files.forEach((file) => addImage(file))
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [addImage]
  )

  const handleClick = useCallback(() => {
    if (!uploading && images.length < maxFiles) {
      fileInputRef.current?.click()
    }
  }, [uploading, images.length, maxFiles])

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
          (uploading || images.length >= maxFiles) && 'pointer-events-none opacity-60'
        )}
      >
        {uploading ? (
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
            {images.length}/{maxFiles} imagens
          </p>
        </div>

        {uploadProgress && (
          <p className="text-xs text-primary font-medium animate-pulse">
            {uploadProgress}
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

      {/* Pré-visualizações */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((url, index) => (
            <div
              key={index}
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
          {images.length < maxFiles && (
            <button
              type="button"
              onClick={handleClick}
              disabled={uploading}
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
