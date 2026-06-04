'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, ChevronLeft, ChevronRight, ZoomIn, Upload, Image as ImageIcon, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ReviewPhoto {
  id: string
  url: string
  caption?: string
}

interface ReviewPhotoGalleryProps {
  photos: ReviewPhoto[]
  onUpload?: (files: File[]) => void
  compact?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
}

export function ReviewPhotoGallery({ photos, onUpload, compact = false }: ReviewPhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [captions, setCaptions] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  const nextPhoto = useCallback(() => {
    setLightboxIndex(prev => (prev + 1) % photos.length)
  }, [photos.length])

  const prevPhoto = useCallback(() => {
    setLightboxIndex(prev => (prev - 1 + photos.length) % photos.length)
  }, [photos.length])

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') nextPhoto()
    if (e.key === 'ArrowLeft') prevPhoto()
  }, [closeLightbox, nextPhoto, prevPhoto])

  // File selection handler (must be declared before handlers that use it)
  const handleFileSelect = useCallback((files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith('image/'))
    if (validFiles.length === 0) return

    // Create preview URLs
    const newPreviews = validFiles.map(f => URL.createObjectURL(f))
    setPreviewImages(prev => [...prev, ...newPreviews])

    if (onUpload) {
      onUpload(validFiles)
    }
  }, [onUpload])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files)
    }
    // Reset input
    e.target.value = ''
  }, [handleFileSelect])

  const removePreview = useCallback((index: number) => {
    setPreviewImages(prev => {
      const newPreviews = [...prev]
      const removed = newPreviews.splice(index, 1)
      // Revoke object URL
      if (removed[0]) URL.revokeObjectURL(removed[0])
      return newPreviews
    })
  }, [])

  const allPhotos: ReviewPhoto[] = [
    ...photos,
    ...previewImages.map((url, i) => ({
      id: `preview-${i}`,
      url,
      caption: captions[`preview-${i}`],
    })),
  ]

  if (photos.length === 0 && previewImages.length === 0 && !onUpload) {
    return null
  }

  // Compact mode: just photo count badge
  if (compact && photos.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Photo count badge */}
      {allPhotos.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] bg-primary/5 text-primary border-primary/15">
            <Camera className="h-3 w-3 mr-1" />
            {allPhotos.length} {allPhotos.length === 1 ? 'foto' : 'fotos'}
          </Badge>
        </div>
      )}

      {/* Photo grid */}
      {allPhotos.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 sm:grid-cols-4 gap-2"
        >
          {allPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative aspect-square rounded-xl overflow-hidden bg-muted/50 cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              <img
                src={photo.url}
                alt={photo.caption || `Foto da avaliação ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <ZoomIn className="h-4 w-4 text-gray-800" />
                </motion.div>
              </div>
              {/* Caption badge */}
              {photo.caption && (
                <div className="absolute bottom-1 left-1 right-1">
                  <span className="text-[8px] bg-black/60 text-white px-1.5 py-0.5 rounded-md truncate block text-center">
                    {photo.caption}
                  </span>
                </div>
              )}
              {/* Remove preview button */}
              {photo.id.startsWith('preview-') && (
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    const previewIdx = previewImages.findIndex(url => url === photo.url)
                    if (previewIdx >= 0) removePreview(previewIdx)
                  }}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Upload zone */}
      {onUpload && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed transition-all duration-300 p-4 text-center ${
              isDragOver
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-border/60 hover:border-primary/30 hover:bg-primary/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {isDragOver ? (
                <motion.div
                  key="dragover"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-2"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Upload className="h-8 w-8 mx-auto text-primary" />
                  </motion.div>
                  <p className="text-sm font-medium text-primary">Solte as fotos aqui!</p>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Camera className="h-6 w-6 text-muted-foreground/40" />
                    <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Arraste fotos aqui ou{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary font-medium hover:underline"
                    >
                      selecione do dispositivo
                    </button>
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    JPG, PNG — ate 5 fotos
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick add button */}
            <motion.div whileTap={{ scale: 0.95 }} className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-primary/20 hover:bg-primary/5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                Adicionar fotos
              </Button>
            </motion.div>
          </div>

          {/* Caption inputs for previews */}
          {previewImages.length > 0 && (
            <div className="mt-3 space-y-2">
              {previewImages.map((url, i) => (
                <div key={`caption-${i}`} className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img src={url} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                  <input
                    type="text"
                    placeholder="Adicionar legenda..."
                    value={captions[`preview-${i}`] || ''}
                    onChange={(e) => setCaptions(prev => ({ ...prev, [`preview-${i}`]: e.target.value }))}
                    className="flex-1 h-8 px-2.5 bg-muted/50 rounded-lg text-xs outline-none border border-transparent focus:border-primary/30 transition-colors placeholder:text-muted-foreground/40"
                    maxLength={100}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    onClick={() => removePreview(i)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Lightbox modal */}
      <AnimatePresence>
        {lightboxOpen && allPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>

            {/* Photo counter */}
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="secondary" className="bg-white/10 backdrop-blur-sm text-white border-0 text-xs">
                {lightboxIndex + 1} / {allPhotos.length}
              </Badge>
            </div>

            {/* Main image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative max-w-lg max-h-[80vh] w-[90vw] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={allPhotos[lightboxIndex].url}
                alt={allPhotos[lightboxIndex].caption || `Foto ${lightboxIndex + 1}`}
                className="w-full h-full object-contain rounded-xl"
              />
              {allPhotos[lightboxIndex].caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-xl">
                  <p className="text-white text-sm text-center">{allPhotos[lightboxIndex].caption}</p>
                </div>
              )}
            </motion.div>

            {/* Navigation arrows */}
            {allPhotos.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); prevPhoto() }}
                  className="absolute left-2 sm:left-4 z-10 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); nextPhoto() }}
                  className="absolute right-2 sm:right-4 z-10 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </>
            )}

            {/* Thumbnail strip */}
            {allPhotos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-[80vw] overflow-x-auto hide-scrollbar px-2">
                {allPhotos.map((photo, idx) => (
                  <motion.button
                    key={photo.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx) }}
                    className={`h-12 w-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      idx === lightboxIndex
                        ? 'border-white shadow-lg shadow-white/20 scale-110'
                        : 'border-white/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.url} alt="Foto da avaliação" className="h-full w-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
