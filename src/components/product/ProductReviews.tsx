'use client'

import { useState } from 'react'
import { Star, ThumbsUp, Camera, CheckCircle, MessageSquare, ChevronDown, ChevronUp, Send, Shield, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductReviewsProps {
  productId: string
  productRating: number
  totalReviews: number
}

// --- Mock Data ---
const mockReviews = [
  {
    id: 'r1',
    name: 'Maria Silva',
    rating: 5,
    date: '2 dias atrás',
    text: 'Produto excelente! Entrega rápida e chegou bem embalado. Super recomendo a todos!',
    useful: 12,
    verified: true,
  },
  {
    id: 'r2',
    name: 'João Santos',
    rating: 4,
    date: '1 semana atrás',
    text: 'Boa qualidade pelo preço. A entrega demorou um pouco mais que o esperado, mas no geral estou satisfeito com o produto.',
    useful: 8,
    verified: true,
  },
  {
    id: 'r3',
    name: 'Ana Oliveira',
    rating: 5,
    date: '2 semanas atrás',
    text: 'Sempre compro aqui. Produtos frescos e preços justos. A melhor loja de Dom Eliseu! Não troco por nada.',
    useful: 15,
    verified: false,
  },
  {
    id: 'r4',
    name: 'Pedro Costa',
    rating: 3,
    date: '3 semanas atrás',
    text: 'Produto ok, mas esperava um pouco mais. Embalagem poderia ser melhor. Vou comprar novamente para dar outra chance.',
    useful: 3,
    verified: true,
  },
]

const starBreakdown = [
  { stars: 5, percentage: 45 },
  { stars: 4, percentage: 30 },
  { stars: 3, percentage: 15 },
  { stars: 2, percentage: 7 },
  { stars: 1, percentage: 3 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export function ProductReviews({ productId, productRating, totalReviews }: ProductReviewsProps) {
  const [reviews, setReviews] = useState(mockReviews)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedStars, setSelectedStars] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [usefulReviews, setUsefulReviews] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)

  const handleUseful = (reviewId: string) => {
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

  const handleSubmit = () => {
    if (selectedStars < 1 || reviewText.trim().length < 10) return

    const newReview = {
      id: `r-new-${Date.now()}`,
      name: 'Maria Silva',
      rating: selectedStars,
      date: 'Agora mesmo',
      text: reviewText.trim(),
      useful: 0,
      verified: true,
    }

    setReviews([newReview, ...reviews])
    setSelectedStars(0)
    setReviewText('')
    setIsFormOpen(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const isFormValid = selectedStars >= 1 && reviewText.trim().length >= 10

  return (
    <div className="space-y-6">
      {/* -- Reviews Summary -- */}
      <Card className="border-border/50 overflow-hidden relative">
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
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {productRating.toFixed(1)}
              </motion.p>
              <div className="flex items-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= Math.round(productRating)
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-amber-200 dark:text-amber-800'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{totalReviews} avaliações</p>
            </div>

            {/* Star Breakdown */}
            <div className="flex-1 space-y-2">
              {starBreakdown.map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <span className="text-xs font-medium w-8 text-right flex items-center justify-end gap-0.5">
                    {item.stars}
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  </span>
                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8">{item.percentage}%</span>
                </div>
              ))}
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
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
                          className="p-1"
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

                  {/* Photo upload (UI only) */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Fotos (opcional)</p>
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-xs">
                      <Camera className="h-3.5 w-3.5" />
                      Adicionar fotos
                    </Button>
                  </div>

                  {/* Submit */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground gap-2 flex-1"
                      onClick={handleSubmit}
                      disabled={!isFormValid}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Enviar avaliação
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
          <h3 className="font-semibold text-sm">Avaliações ({reviews.length})</h3>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                layout
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
              >
                <Card className="border-border/50 hover:border-primary/15 hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                          {review.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{review.name}</p>
                          {review.verified && (
                            <Badge className="text-[9px] px-1.5 py-0 gap-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30 font-medium">
                              <Shield className="h-2.5 w-2.5" />
                              Compra verificada
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3 w-3 ${
                                  s <= review.rating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-amber-200 dark:text-amber-800'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>

                  {/* Photo gallery thumbnails (decorative) */}
                  {review.verified && review.rating >= 4 && (
                    <div className="flex gap-1.5 mt-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent/10 to-amber-100/50 dark:from-accent/10 dark:to-amber-900/20 border border-border/50 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-50 to-primary/10 border border-border/50 flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                        +2
                      </div>
                    </div>
                  )}

                    {/* Review text */}
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>

                    {/* Useful button */}
                    <div className="flex items-center gap-4 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 gap-1.5 text-xs px-2 ${
                          usefulReviews.has(review.id)
                            ? 'text-primary hover:text-primary'
                            : 'text-muted-foreground hover:text-muted-foreground'
                        }`}
                        onClick={() => handleUseful(review.id)}
                      >
                        <ThumbsUp className={`h-3.5 w-3.5 ${usefulReviews.has(review.id) ? 'fill-primary' : ''}`} />
                        Útil
                        <span className="font-medium">
                          {review.useful + (usefulReviews.has(review.id) ? 1 : 0)}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

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
