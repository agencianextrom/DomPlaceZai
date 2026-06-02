'use client'

import { useState, useRef } from 'react'
import {
  Star, X, Camera, Check, Package, Truck, MessageSquare, Sparkles,
  Loader2, ImageIcon, Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { uploadImage, validateImageFile, createPreviewUrl, type UploadProgress } from '@/lib/upload-client'
import type { OrderData } from '@/store/useAppStore'

interface RateOrderModalProps {
  order: OrderData
  isOpen: boolean
  onClose: () => void
}

const ratingCategories = [
  { id: 'quality', label: 'Qualidade do Produto', icon: Package },
  { id: 'delivery', label: 'Entrega', icon: Truck },
  { id: 'service', label: 'Atendimento', icon: MessageSquare },
]

const MAX_CHARS = 500
const MAX_PHOTOS = 3

export function RateOrderModal({ order, isOpen, onClose }: RateOrderModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({})
  const [reviewText, setReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Photo upload state
  const [photos, setPhotos] = useState<{ file: File; previewUrl: string; uploadedUrl: string | null; progress: number; uploading: boolean; error: string | null }[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const overallRating = Math.round(
    Object.values(ratings).reduce((sum, r) => sum + r, 0) / (ratingCategories.length) || 0
  ) || 0

  const canSubmit = Object.keys(ratings).length === ratingCategories.length

  const handleSetRating = (category: string, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }))
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) {
      toast.error(`Máximo de ${MAX_PHOTOS} fotos`)
      return
    }

    const filesToAdd: File[] = []
    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i]
      const validationError = validateImageFile(file)
      if (validationError) {
        toast.error(validationError)
        continue
      }
      filesToAdd.push(file)
    }

    if (filesToAdd.length === 0) return

    const newPhotos = filesToAdd.map(file => ({
      file,
      previewUrl: createPreviewUrl(file),
      uploadedUrl: null as string | null,
      progress: 0,
      uploading: false,
      error: null as string | null,
    }))

    setPhotos(prev => [...prev, ...newPhotos])

    // Upload each photo
    newPhotos.forEach((photo, idx) => {
      const photoIndex = photos.length + idx
      uploadSinglePhoto(photoIndex, photo.file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Upload a single photo
  const uploadSinglePhoto = async (index: number, file: File) => {
    // Mark as uploading
    setPhotos(prev => prev.map((p, i) => i === index ? { ...p, uploading: true, progress: 0 } : p))

    try {
      const result = await uploadImage(file, (progress: UploadProgress) => {
        setPhotos(prev => prev.map((p, i) => i === index ? { ...p, progress: progress.percent } : p))
      })

      if (result.success) {
        setPhotos(prev => prev.map((p, i) => i === index ? { ...p, uploading: false, uploadedUrl: result.url, progress: 100 } : p))
      } else {
        setPhotos(prev => prev.map((p, i) => i === index ? { ...p, uploading: false, error: result.error || 'Erro ao enviar' } : p))
        toast.error(result.error || 'Erro ao enviar foto')
      }
    } catch {
      setPhotos(prev => prev.map((p, i) => i === index ? { ...p, uploading: false, error: 'Erro de conexao' } : p))
      toast.error('Erro de conexao ao enviar foto')
    }
  }

  // Remove a photo
  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const photo = prev[index]
      if (photo?.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setUploadingPhotos(true)

    // Wait for any pending uploads
    const allUploaded = photos.every(p => p.uploadedUrl !== null || !p.uploading)
    if (!allUploaded) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    const imageUrls = photos.map(p => p.uploadedUrl).filter(Boolean) as string[]

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          storeId: order.storeId,
          rating: overallRating,
          comment: reviewText.trim() || undefined,
          images: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erro ao enviar avaliação')
      }

      setSubmitted(true)
      toast.success(`Obrigado! Avaliação do pedido #${order.orderNumber} registrada.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar avaliação')
    } finally {
      setIsSubmitting(false)
      setUploadingPhotos(false)
    }
  }

  const handleClose = () => {
    if (!submitted) {
      setRatings({})
      setHoverRatings({})
      setReviewText('')
      // Clean up preview URLs
      photos.forEach(p => URL.revokeObjectURL(p.previewUrl))
      setPhotos([])
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative bg-background rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {submitted ? (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Check className="h-10 w-10 text-white" strokeWidth={3} />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Avaliação Enviada! ⭐</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-2">
                  Obrigado por avaliar seu pedido #{order.orderNumber}. Sua opinião ajuda a melhorar nossos serviços!
                </p>
                {/* Stars display */}
                <div className="flex items-center justify-center gap-1 mt-3 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <motion.div
                      key={s}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + s * 0.1, type: 'spring' }}
                    >
                      <Star
                        className={`h-8 w-8 ${s <= overallRating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
                      />
                    </motion.div>
                  ))}
                </div>
                <Button className="w-full h-11" onClick={handleClose}>
                  Fechar
                </Button>
              </motion.div>
            ) : (
              /* Rating Form */
              <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Avaliar Pedido
                  </h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Order info */}
                <Card className="bg-muted/30 border-border/50 mb-5">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{order.storeName}</p>
                      <p className="text-xs text-muted-foreground">Pedido #{order.orderNumber}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Overall rating display */}
                <div className="text-center mb-6">
                  <motion.p
                    className="text-4xl font-bold text-primary"
                    key={overallRating}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {overallRating || '–'}
                  </motion.p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {overallRating >= 4 ? 'Excelente!' : overallRating >= 3 ? 'Bom' : overallRating > 0 ? 'Regular' : 'Avalie abaixo'}
                  </p>
                </div>

                {/* Category Ratings */}
                <div className="space-y-5">
                  {ratingCategories.map((category, catIdx) => {
                    const currentRating = ratings[category.id] || 0
                    const hoverRating = hoverRatings[category.id] || 0
                    const displayRating = hoverRating || currentRating
                    const Icon = category.icon

                    const ratingLabels = ['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente']

                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: catIdx * 0.1 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <p className="font-medium text-sm flex-1">{category.label}</p>
                          {displayRating > 0 && (
                            <motion.span
                              key={displayRating}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-xs text-muted-foreground"
                            >
                              {ratingLabels[displayRating]}
                            </motion.span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.85 }}
                              onMouseEnter={() => setHoverRatings(prev => ({ ...prev, [category.id]: star }))}
                              onMouseLeave={() => setHoverRatings(prev => ({ ...prev, [category.id]: 0 }))}
                              onClick={() => handleSetRating(category.id, star)}
                              className="focus:outline-none"
                              aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                            >
                              <motion.div
                                animate={{
                                  scale: star <= displayRating ? 1 : 0.85,
                                  opacity: star <= displayRating ? 1 : 0.3,
                                }}
                                transition={{ duration: 0.15 }}
                              >
                                <Star
                                  className={`h-8 w-8 transition-colors ${
                                    star <= displayRating
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              </motion.div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                <Separator className="my-5" />

                {/* Text review */}
                <div>
                  <label className="font-medium text-sm mb-2 block">Comentário (opcional)</label>
                  <Textarea
                    placeholder="Conte como foi a sua experiência com esta loja..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value.slice(0, MAX_CHARS))}
                    rows={3}
                    className="resize-none text-sm"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-muted-foreground">
                      Seu comentário ajuda outros compradores
                    </p>
                    <p className={`text-[10px] ${reviewText.length >= MAX_CHARS ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {reviewText.length}/{MAX_CHARS}
                    </p>
                  </div>
                </div>

                {/* Photo upload */}
                <div className="mt-4">
                  <label className="font-medium text-sm mb-2 block">
                    Fotos (opcional, max {MAX_PHOTOS})
                  </label>

                  {/* Preview photos */}
                  {photos.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      <AnimatePresence>
                        {photos.map((photo, idx) => (
                          <motion.div
                            key={photo.previewUrl}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-border shrink-0"
                          >
                            <img
                              src={photo.previewUrl}
                              alt={`Foto ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                            {/* Upload progress overlay */}
                            {photo.uploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-center">
                                  <Loader2 className="h-5 w-5 text-white animate-spin mx-auto" />
                                  <p className="text-[9px] text-white mt-0.5">{photo.progress}%</p>
                                </div>
                              </div>
                            )}
                            {/* Success check */}
                            {photo.uploadedUrl && (
                              <div className="absolute top-0.5 right-0.5">
                                <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                  <Check className="h-2.5 w-2.5 text-white" />
                                </div>
                              </div>
                            )}
                            {/* Error indicator */}
                            {photo.error && (
                              <div className="absolute top-0.5 right-0.5">
                                <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                                  <X className="h-2.5 w-2.5 text-white" />
                                </div>
                              </div>
                            )}
                            {/* Remove button */}
                            <button
                              onClick={() => removePhoto(idx)}
                              className="absolute bottom-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive/90 flex items-center justify-center hover:bg-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3 text-white" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Add more button */}
                      {photos.length < MAX_PHOTOS && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="h-20 w-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-colors shrink-0"
                        >
                          <Camera className="h-5 w-5 text-muted-foreground" />
                        </motion.button>
                      )}
                    </div>
                  )}

                  {/* Upload button (when no photos yet) */}
                  {photos.length === 0 && (
                    <motion.button
                      whileHover={{ borderColor: 'oklch(0.45 0.1 155)' }}
                      className="w-full h-20 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-sm">Adicionar fotos</span>
                    </motion.button>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Submit */}
                <Button
                  className="w-full h-12 mt-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold btn-glow gap-2"
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting || uploadingPhotos}
                >
                  {isSubmitting || uploadingPhotos ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </div>
                  ) : (
                    <>
                      <Star className="h-4 w-4" />
                      Enviar Avaliação
                    </>
                  )}
                </Button>
                {!canSubmit && (
                  <p className="text-[10px] text-center text-muted-foreground mt-2">
                    Avalie todas as categorias para enviar
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
