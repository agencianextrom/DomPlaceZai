'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ThumbsUp, Camera, CheckCircle, MessageSquare, ChevronDown, ChevronUp, Send, Shield, Loader2, X, ZoomIn } from 'lucide-react'
import { ReviewPhotoGallery } from '@/components/product/ReviewPhotoGallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface ProductReviewsProps {
  productId: string
  productRating: number
  totalReviews: number
}

// --- Types ---
interface ReviewData {
  id: string
  accountName: string | null
  accountAvatar: string | null
  rating: number
  comment: string | null
  images: string | null
  reply: string | null
  isVerified: boolean
  createdAt: string
}

interface RatingDistributionItem {
  rating: number
  count: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 22 } },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays} dias atrás`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''} atrás`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) > 1 ? 'es' : ''} atrás`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function ProductReviews({ productId, productRating, totalReviews }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistributionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedStars, setSelectedStars] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [usefulReviews, setUsefulReviews] = useState<Set<string>>(new Set())
  const [usefulBounce, setUsefulBounce] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      const data = await res.json()
      if (res.ok) {
        setReviews(data.reviews || [])
        setRatingDistribution(data.ratingDistribution || [])
      }
    } catch {
      // Silently fail — will show empty state
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Compute star breakdown percentages from API distribution
  const starBreakdown = ratingDistribution.length > 0
    ? [5, 4, 3, 2, 1].map((star) => {
        const item = ratingDistribution.find((d) => d.rating === star)
        const count = item?.count || 0
        const totalCount = ratingDistribution.reduce((s, d) => s + d.count, 0)
        const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
        return { stars: star, percentage, count }
      })
    : []

  const handleUseful = (reviewId: string) => {
    setUsefulBounce(reviewId)
    setTimeout(() => setUsefulBounce(null), 400)
    setUsefulReviews((prev) => {
      const next = new Set(prev)
      if (next.has(reviewId)) {
        next.delete(reviewId)
      } else {
        next.add(reviewId)
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (selectedStars < 1 || reviewText.trim().length < 10) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: selectedStars,
          comment: reviewText.trim(),
        }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setSelectedStars(0)
        setReviewText('')
        setIsFormOpen(false)
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3000)
        toast.success('Avaliação enviada com sucesso! 🎉')
        // Refetch reviews to show the new one
        fetchReviews()
      } else {
        toast.error(data.error || 'Erro ao enviar avaliação')
      }
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoUpload = () => {
    toast.info('Upload de fotos em breve! 📸')
  }

  const isFormValid = selectedStars >= 1 && reviewText.trim().length >= 10

  return (
    <div className="space-y-6">
      {/* -- Reviews Summary -- */}
      <Card className="border-border/50 overflow-hidden relative r62-card-lift r91-reviews-card">
        {/* Subtle gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/40 via-primary to-accent/40" />
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Big Rating */}
            <div className="flex flex-col items-center justify-center sm:min-w-[120px]">
              <motion.p
                className="text-5xl sm:text-6xl font-bold text-primary"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
              >
                {productRating.toFixed(1)}
              </motion.p>
              <div className="flex items-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <motion.span
                    key={s}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring' as const,
                      stiffness: 400,
                      damping: 15,
                      delay: s * 0.08,
                    }}
                  >
                    <Star
                      className={`h-4 w-4 transition-colors ${
                        s <= Math.round(productRating)
                          ? 'text-amber-500 fill-amber-500 reviews-star-fill r18-star-fill-glow'
                          : 'text-amber-200 dark:text-amber-800'
                      }`}
                    />
                  </motion.span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{totalReviews} avaliações</p>
            </div>

            {/* Star Breakdown */}
            <div className="flex-1 space-y-2">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-2.5 flex-1 rounded-full" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))
              ) : starBreakdown.length > 0 ? (
                starBreakdown.map((item, barIdx) => (
                  <div key={item.stars} className="flex items-center gap-2">
                    <span className="text-xs font-medium w-8 text-right flex items-center justify-end gap-0.5">
                      {item.stars}
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    </span>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden relative">
                      {/* Shimmer overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ duration: 1.5, delay: 0.5 + barIdx * 0.1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
                      />
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full relative reviews-rating-bar"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        style={{ width: `${item.percentage}%`, transformOrigin: 'left' }}
                        transition={{ type: 'spring' as const, delay: 0.2 + barIdx * 0.08, stiffness: 100, damping: 15 }}
                      />
                    </div>
                    <motion.span
                      className="text-[10px] text-muted-foreground w-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + barIdx * 0.08 }}
                    >
                      {item.percentage}%
                    </motion.span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nenhuma avaliação ainda
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* -- Write Review Button / Form -- */}
      <div>
        {!isFormOpen ? (
          <Button
            variant="outline"
            className="w-full h-12 border-dashed border-2 border-border gap-2 text-sm font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
            onClick={() => setIsFormOpen(true)}
          >
            <MessageSquare className="h-4 w-4" />
            Escreva sua avaliação
            <ChevronDown className="h-4 w-4 ml-auto" />
          </Button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
            >
              <Card className="border-primary/30 overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  {/* Form header */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Escreva sua avaliação
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsFormOpen(false)}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Star rating selector */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Sua nota</p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <motion.button
                          key={s}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedStars(s)}
                          onMouseEnter={() => setHoveredStar(s)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="p-2"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              s <= (hoveredStar || selectedStars)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-amber-200 dark:text-amber-800'
                            }`}
                          />
                        </motion.button>
                      ))}
                      {selectedStars > 0 && (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-xs text-muted-foreground self-center ml-2"
                        >
                          {selectedStars === 1 && 'Péssimo'}
                          {selectedStars === 2 && 'Ruim'}
                          {selectedStars === 3 && 'Regular'}
                          {selectedStars === 4 && 'Bom'}
                          {selectedStars === 5 && 'Excelente'}
                        </motion.span>
                      )}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Sua avaliação</p>
                    <Textarea
                      placeholder="Conte sua experiência com o produto..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="min-h-[80px] resize-none text-sm"
                    />
                    <p className={`text-[10px] mt-1 ${reviewText.trim().length < 10 ? 'text-muted-foreground' : 'text-emerald-600'}`}>
                      {reviewText.trim().length}/10 caracteres mínimos
                    </p>
                  </div>

                  {/* Photo upload with drag-and-drop gallery */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Fotos (opcional)</p>
                    <ReviewPhotoGallery photos={[]} onUpload={(files) => {
                      toast.info(`${files.length} ${files.length === 1 ? 'foto selecionada' : 'fotos selecionadas'}! Upload em breve.`, { description: 'Funcionalidade de envio de fotos sera disponivel em breve.' })
                    }} />
                  </div>

                  {/* Submit */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground gap-2 flex-1"
                      onClick={handleSubmit}
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      {isSubmitting ? 'Enviando...' : 'Enviar avaliação'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFormOpen(false)}
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* -- Reviews List -- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm reviews-title-shimmer inline-block">Avaliações ({reviews.length})</h3>
          {reviews.length > 3 && (
            <motion.button
              whileHover={{ x: 3 }}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:text-primary/80 transition-colors group"
              aria-label="Ver mais avaliações"
            >
              <span>Ver mais</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                whileHover={{ x: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
              >
                <ChevronDown className="h-3.5 w-3.5 group-hover:text-primary/80 transition-colors" />
              </motion.span>
            </motion.button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {reviews.length > 0 ? reviews.map((review) => (
                <motion.div
                  key={review.id}
                  variants={itemVariants}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                >
                  <Card className="border-border/50 review-card-hover hover:shadow-md transition-all relative overflow-hidden group/review r18-review-card-shimmer">
                    <CardContent className="p-4">
                      {/* Shimmer border glow */}
                      <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover/review:opacity-100 transition-opacity duration-500" style={{ boxShadow: 'inset 0 0 20px oklch(0.45 0.1 155 / 0.04)' }} />
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {(review.accountName || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{review.accountName || 'Usuário'}</p>
                            {review.isVerified && (
                              <Badge className="text-[9px] px-1.5 py-0 gap-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30 font-medium r18-featured-badge-glow">
                                <Shield className="h-2.5 w-2.5" />
                                Compra verificada
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <motion.span
                                  key={s}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: 'spring' as const,
                                    stiffness: 350,
                                    damping: 12,
                                    delay: s * 0.06,
                                  }}
                                >
                                  <Star
                                    className={`h-3 w-3 ${
                                      s <= review.rating
                                        ? 'text-amber-500 fill-amber-500'
                                        : 'text-amber-200 dark:text-amber-800'
                                    }`}
                                  />
                                </motion.span>
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{formatDate(review.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Review text */}
                      {review.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                      )}

                      {/* Review photos with lightbox gallery + photo count badge */}
                      {review.images && review.images !== '[]' && (() => {
                        const images: string[] = JSON.parse(review.images)
                        if (images.length > 0) return (
                          <div className="mt-2 relative">
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring' as const, stiffness: 500, damping: 15, delay: 0.2 }}
                              className="absolute -top-1.5 -left-1 z-10 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold r18-photo-badge-glow"
                            >
                              <Camera className="h-2.5 w-2.5" />
                              {images.length}
                            </motion.span>
                            <ReviewPhotoGallery
                              photos={images.map((img, imgIdx) => ({
                                id: `${review.id}-photo-${imgIdx}`,
                                url: img,
                              }))}
                              compact
                            />
                          </div>
                        )
                        return null
                      })()}

                      {/* Helpful button with animated heart/thumbs up bounce */}
                      <div className="flex items-center gap-4 mt-3">
                        <motion.div
                          animate={usefulBounce === review.id ? { scale: [1, 1.35, 0.85, 1.1, 1] } : { scale: 1 }}
                          whileTap={{ scale: 0.85 }}
                          transition={{ type: 'spring' as const, stiffness: 400, damping: 10 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 gap-1.5 text-xs px-2 transition-colors r18-helpful-btn-glow {
                              usefulReviews.has(review.id)
                                ? 'text-primary hover:text-primary'
                                : 'text-muted-foreground hover:text-muted-foreground'
                            }`}
                            onClick={() => handleUseful(review.id)}
                          >
                            <motion.span
                              animate={usefulReviews.has(review.id) ? { scale: [1, 1.3, 0.95, 1] } : { scale: 1 }}
                              transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                            >
                              <ThumbsUp className={`h-3.5 w-3.5 ${usefulReviews.has(review.id) ? 'fill-primary' : ''}`} />
                            </motion.span>
                            Útil
                            {usefulReviews.has(review.id) && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                                className="font-medium"
                              >
                                1
                              </motion.span>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda</p>
                  <p className="text-xs text-muted-foreground mt-1">Seja o primeiro a avaliar este produto!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* -- Photo Lightbox -- */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="relative max-w-lg max-h-[80vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage}
                alt="Foto em tamanho ampliado"
                className="w-full h-full object-contain rounded-xl"
              />
              <Button
                size="icon"
                className="absolute top-2 right-2 min-h-[44px] min-w-[44px] h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={() => setLightboxImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -- Success Toast -- */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="bg-emerald-600 text-white border-0 shadow-lg">
              <CardContent className="p-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Avaliação enviada com sucesso!</span>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
