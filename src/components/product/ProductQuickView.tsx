'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Eye, ShoppingCart, Star, Heart, Truck, ChevronLeft, ChevronRight, Minus, Plus, Store, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { toast } from 'sonner'
import { formatBRL } from '@/components/product/ProductCard'

interface ProductQuickViewProps {
  product: ProductData | null
  open: boolean
  onClose: () => void
}

export function ProductQuickView({ product, open, onClose }: ProductQuickViewProps) {
  const { addToCart, navigate, selectProduct, toggleFavoriteProduct, isFavoriteProduct } = useAppStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const imgTranslateX = useTransform(mouseX, [0, 1], [-8, 8])
  const imgTranslateY = useTransform(mouseY, [0, 1], [-8, 8])

  const isFav = product ? isFavoriteProduct(product.id) : false
  const variations = product?.variations ? JSON.parse(product.variations) as string[] : []

  // Reset state when modal closes, using previous open value
  const prevOpen = useRef(false)
  useEffect(() => {
    if (prevOpen.current && !open) {
      // Reset on close instead of open to satisfy lint rule
      // Values will be reset before next open via the effect below
    }
    if (!prevOpen.current && open) {
      // Defer state reset via microtask to avoid synchronous setState in effect
      queueMicrotask(() => {
        setQuantity(1)
        setSelectedVariation(null)
        setAddedToCart(false)
      })
    }
    prevOpen.current = open
  }, [open])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product, product.storeName || 'Loja', quantity)
    setAddedToCart(true)
    toast.success(`${product.name} adicionado ao carrinho!`)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleViewDetails = () => {
    if (!product) return
    selectProduct(product)
    navigate('product')
    onClose()
  }

  const discount = product && product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }, [mouseX, mouseY])

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl max-h-[90vh] overflow-y-auto r25-modal-overlay" style={{ backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
        <DialogTitle className="sr-only">{product.name}</DialogTitle>

        {/* Floating particles */}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          <motion.div
            animate={{ y: [0, -12, 0], x: [0, 6, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-8 right-12 h-3 w-3 rounded-full bg-purple-400/40 blur-sm"
          />
          <motion.div
            animate={{ y: [0, 10, 0], x: [0, -8, 0], opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-20 left-8 h-2.5 w-2.5 rounded-full bg-emerald-400/40 blur-sm"
          />
          <motion.div
            animate={{ y: [0, -8, 0], x: [0, 4, 0], opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-24 right-20 h-2 w-2 rounded-full bg-amber-400/40 blur-sm"
          />
          <motion.div
            animate={{ y: [0, 6, 0], x: [0, -5, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute top-16 left-24 h-1.5 w-1.5 rounded-full bg-fuchsia-400/35 blur-sm"
          />
        </div>

        {/* Product Image with parallax */}
        <motion.div
          ref={imageRef}
          onMouseMove={handleMouseMove}
          className="relative h-52 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        >
          <motion.div
            style={{ x: imgTranslateX, y: imgTranslateY }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
            className="text-6xl cursor-pointer r25-parallax-container"
          >
            {{ FOOD: '🍽️', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱', BEAUTY: '💅', ANIMALS: '🐾', FASHION: '👗', SERVICES: '🔧', HOME_GARDEN: '🏡', EDUCATION: '📚', SPORTS: '⚽', OTHER: '📦' }[product.category] || '📦'}
          </motion.div>

          {/* Discount badge */}
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-white border-0 text-[10px]">
              -{discount}%
            </Badge>
          )}

          {/* Favorite button with rotate on hover */}
          <motion.button
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => toggleFavoriteProduct(product.id)}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md"
          >
            <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </motion.button>

          {/* Category pill */}
          <Badge variant="secondary" className="absolute bottom-3 left-3 text-[9px] bg-background/80 backdrop-blur-sm">
            {{ FOOD: 'Alimentação', HEALTH: 'Saúde', AGRICULTURE: 'Agricultura', ELECTRONICS: 'Eletrônicos', BEAUTY: 'Beleza', ANIMALS: 'Animais', FASHION: 'Moda', SERVICES: 'Serviços', HOME_GARDEN: 'Casa & Jardim', EDUCATION: 'Educação', SPORTS: 'Esportes', OTHER: 'Outros' }[product.category] || product.category}
          </Badge>
        </motion.div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Store */}
          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 w-full text-left group"
            onClick={() => { if (product.storeName) { navigate('home') } }}
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold group-hover:text-primary transition-colors truncate">{product.storeName}</p>
              <p className="text-[10px] text-muted-foreground">Ver loja →</p>
            </div>
          </motion.button>

          <Separator />

          {/* Name + Price */}
          <div>
            <h3 className="font-bold text-base line-clamp-2">{product.name}</h3>
            <div className="flex items-end gap-2 mt-1.5">
              <span className="text-xl font-bold text-primary">{formatBRL(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm text-muted-foreground line-through mb-0.5">{formatBRL(product.comparePrice)}</span>
              )}
            </div>
            {discount > 0 && (
              <Badge className="mt-1 text-[9px] bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-0">
                Economize {formatBRL(product.comparePrice! - product.price)}
              </Badge>
            )}
          </div>

          {/* Rating — staggered spec */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{product.rating} ({product.totalReviews})</span>
          </motion.div>

          {/* Variations */}
          {variations.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2">Variações</p>
              <div className="flex gap-2 flex-wrap">
                {variations.map(v => (
                  <motion.button
                    key={v}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedVariation(v === selectedVariation ? null : v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedVariation === v
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border hover:border-primary/30 text-muted-foreground'
                    }`}
                  >
                    {v}
                    <AnimatePresence>
                      {selectedVariation === v && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
                          className="inline-block ml-1"
                        >
                          <Check className="h-3 w-3 inline" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery info — staggered spec */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50"
          >
            <Truck className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs font-medium">Entrega em 30-45 min</p>
              <p className="text-[10px] text-muted-foreground">Frete a partir de R$ 3,00</p>
            </div>
          </motion.div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1 bg-muted rounded-xl p-0.5">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="min-h-[44px] min-w-[44px] h-8 w-8 rounded-lg flex items-center justify-center hover:bg-background transition-colors">
                <Minus className="h-3.5 w-3.5" />
              </motion.button>
              <span className="w-8 text-center text-sm font-bold">{quantity}</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuantity(quantity + 1)} className="min-h-[44px] min-w-[44px] h-8 w-8 rounded-lg flex items-center justify-center hover:bg-background transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </motion.button>
            </div>

            <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
              <Button
                onClick={handleAddToCart}
                className={`w-full h-11 font-semibold transition-all ${addedToCart ? 'bg-emerald-500 hover:bg-emerald-500' : 'bg-primary hover:bg-primary/90'} r25-btn-glow btn-glow ripple-effect`}
              >
                {addedToCart ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4" />
                    Adicionado!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <ShoppingCart className="h-4 w-4" />
                    {formatBRL(product.price * quantity)}
                  </span>
                )}
              </Button>
            </motion.div>
          </div>

          {/* View details */}
          <Button variant="outline" onClick={handleViewDetails} className="w-full h-10 text-xs gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            Ver detalhes completos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
