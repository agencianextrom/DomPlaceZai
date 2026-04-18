'use client'

import { useState } from 'react'
import {
  Star, X, Camera, Check, Package, Truck, MessageSquare, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
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

export function RateOrderModal({ order, isOpen, onClose }: RateOrderModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({})
  const [reviewText, setReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const overallRating = Math.round(
    Object.values(ratings).reduce((sum, r) => sum + r, 0) / (ratingCategories.length) || 0
  ) || 0

  const canSubmit = Object.keys(ratings).length === ratingCategories.length

  const handleSetRating = (category: string, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }))
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1200))
    setIsSubmitting(false)
    setSubmitted(true)
    toast.success(`Obrigado! Avaliação do pedido #${order.orderNumber} registrada.`)
  }

  const handleClose = () => {
    if (!submitted) {
      setRatings({})
      setHoverRatings({})
      setReviewText('')
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
                  Obrigado por avaliar seu pedido #${order.orderNumber}. Sua opinião ajuda a melhorar nossos serviços!
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

                {/* Photo upload placeholder */}
                <div className="mt-4">
                  <label className="font-medium text-sm mb-2 block">Fotos (opcional)</label>
                  <motion.button
                    whileHover={{ borderColor: 'oklch(0.45 0.1 155)' }}
                    className="w-full h-20 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors"
                    onClick={() => toast.info('Upload de fotos em breve!')}
                  >
                    <Camera className="h-5 w-5" />
                    <span className="text-sm">Adicionar fotos</span>
                  </motion.button>
                </div>

                {/* Submit */}
                <Button
                  className="w-full h-12 mt-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold btn-glow gap-2"
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
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
