'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronLeft, ChevronRight, Plus, Check, ShoppingBag, Star, Loader2, TrendingUp } from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { useAppStore } from '@/store/useAppStore'
import { resolveProductImage } from '@/lib/product-images'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBRL } from '@/lib/format'
import type { ProductData } from '@/store/useAppStore'

// ── Types ────────────────────────────────────────────────────────────────────

interface SuggestionItem {
  product: ProductData
  reason: string
}

// ── Constants ───────────────────────────────────────────────────────────────

const PRODUCT_EMOJI_FALLBACKS = ['🍎', '🛒', '📦', '🎁', '🌿', '🍞', '🧴', '💊', '🐾', '💄']
const GRADIENT_BG = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  'from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30',
  'from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-800/30',
  'from-rose-100 to-red-200 dark:from-rose-900/30 dark:to-red-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
]

const SUGGESTION_REASONS = [
  'Combina com seus itens',
  'Popular na sua região',
  'Frequentemente comprados juntos',
  'Quem comprou também levou',
  'Oferta do dia',
]

// ── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, x: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
  exit: { opacity: 0, x: -30, scale: 0.9, transition: { duration: 0.2 } },
}

const shimmerTextVariants = {
  initial: { backgroundPosition: '-200% center' },
  animate: {
    backgroundPosition: '200% center',
    transition: { duration: 3, repeat: Infinity, ease: 'linear' as const },
  },
}

const headerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
}

// ── Helper: Map API product to ProductData ─────────────────────────────────

function mapApiProduct(p: Record<string, unknown>): ProductData {
  return {
    id: p.id as string,
    storeId: p.storeId as string,
    storeName: (p.storeName as string) ?? undefined,
    storeLogo: (p.storeLogo as string) ?? null,
    name: p.name as string,
    slug: p.slug as string,
    description: (p.description as string) ?? null,
    price: (p.price as number) ?? 0,
    comparePrice: (p.comparePrice as number) ?? null,
    images: (p.images as string) ?? '[]',
    stock: (p.stock as number) ?? 0,
    rating: (p.rating as number) ?? 0,
    totalReviews: (p.totalReviews as number) ?? 0,
    isFeatured: (p.isFeatured as boolean) ?? false,
    isNew: (p.isNew as boolean) ?? false,
    isOffer: (p.isOffer as boolean) ?? false,
    tags: (p.tags as string) ?? '[]',
    variations: (p.variations as string) ?? null,
    category: (p.category as string) ?? 'OTHER',
    freeDeliveryAbove: (p.freeDeliveryAbove as number) ?? null,
    storeDeliveryFee: (p.storeDeliveryFee as number) ?? null,
  }
}

function getReasonForProduct(product: ProductData, index: number): string {
  if (product.isOffer) return 'Oferta do dia'
  if (product.isFeatured) return 'Popular na sua região'
  return SUGGESTION_REASONS[index % SUGGESTION_REASONS.length]
}

function getEmojiForProduct(product: ProductData): string {
  const code = product.name.charCodeAt(0) + (product.name.charCodeAt(product.name.length - 1) ?? 0)
  return PRODUCT_EMOJI_FALLBACKS[Math.abs(code) % PRODUCT_EMOJI_FALLBACKS.length]
}

function getGradientForProduct(product: ProductData): string {
  const code = product.name.charCodeAt(0)
  return GRADIENT_BG[Math.abs(code) % GRADIENT_BG.length]
}

// ── Sub-Components ──────────────────────────────────────────────────────────

function ShimmerHeader() {
  return (
    <motion.div className="flex items-center gap-2 mb-3" variants={headerVariants} initial="hidden" animate="visible">
      <motion.div
        className="r40-header-sparkle h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 8, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </motion.div>
      <div>
        <motion.h3
          variants={shimmerTextVariants}
          initial="initial"
          animate="animate"
          className="r40-header-title text-sm font-bold r62-heading-gradient"
          style={{
            backgroundImage: 'linear-gradient(90deg, hsl(var(--foreground)) 0%, hsl(var(--primary)) 50%, hsl(var(--foreground)) 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Frequentemente comprados juntos
        </motion.h3>
        <p className="text-[10px] text-muted-foreground">Complete seu pedido com sugestões especiais</p>
      </div>
    </motion.div>
  )
}

function SuggestionCard({
  item,
  reason,
  index,
  isAdded,
  onAdd,
}: {
  item: ProductData
  reason: string
  index: number
  isAdded: boolean
  onAdd: () => void
}) {
  const emoji = getEmojiForProduct(item)
  const gradient = getGradientForProduct(item)
  const imageUrl = resolveProductImage({ slug: item.slug, category: item.category, images: item.images })
  const discount = item.comparePrice && item.comparePrice > item.price
    ? Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)
    : 0

  return (
    <motion.div
      variants={cardVariants}
      className="r40-card-shimmer shrink-0 w-[150px] bg-card rounded-xl border border-border/50 overflow-hidden relative"
      whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
    >
      {/* Product image area */}
      <div className={`h-24 w-full bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl relative`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
          >
            {emoji}
          </motion.span>
        )}
        {discount > 0 && (
          <motion.div
            className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 20, delay: 0.1 }}
          >
            -{discount}%
          </motion.div>
        )}
        {item.isNew && (
          <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-md">
            NOVO
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-2.5">
        {/* Product name */}
        <h4 className="text-xs font-semibold line-clamp-2 leading-tight min-h-[2rem]">{item.name}</h4>

        {/* Reason badge – "Por que recomendamos?" */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + index * 0.05, type: 'spring' as const, stiffness: 400, damping: 25 }}
          className="r40-reason-badge mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-semibold"
        >
          <TrendingUp className="h-2 w-2" />
          <span>{reason}</span>
        </motion.div>

        {/* Price + Add button */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-primary">{formatBRL(item.price)}</span>
            {item.comparePrice && item.comparePrice > item.price && (
              <span className="text-[9px] text-muted-foreground line-through">
                {formatBRL(item.comparePrice)}
              </span>
            )}
          </div>

          {/* Add button with success animation */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.85 }}
          >
            <button
              onClick={onAdd}
              className={`r40-add-btn h-7 w-7 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center transition-all duration-300 ${
                isAdded
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                    className="flex items-center justify-center"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="plus"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center justify-center"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        </div>

        {/* Success pulse animation overlay */}
        <AnimatePresence>
          {isAdded && (
            <motion.div
              className="r40-success-pulse absolute inset-0 border-2 border-emerald-500/40 rounded-xl pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.95, 1.02, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-7 w-7 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-4 w-48 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="shrink-0 w-[150px] h-[195px] rounded-xl" />
        ))}
      </div>
    </motion.div>
  )
}

const EMPTY_PARTICLES = [
  { id: 'a', size: 6, x: -20, delay: 0, dur: 3.2 },
  { id: 'b', size: 4, x: 18, delay: 0.6, dur: 2.8 },
  { id: 'c', size: 5, x: -30, delay: 1.2, dur: 3.5 },
  { id: 'd', size: 3, x: 25, delay: 0.3, dur: 3.0 },
  { id: 'e', size: 4, x: -12, delay: 0.9, dur: 2.6 },
]

function EmptyCartState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
      className="bg-card rounded-xl border border-border p-6 flex flex-col items-center text-center relative overflow-hidden"
    >
      {/* Floating particles */}
      {EMPTY_PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="r40-empty-particle absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: '50%',
            bottom: '30%',
          }}
          animate={{
            y: [0, -40, -80, -40, 0],
            x: [0, p.x * 0.5, p.x, p.x * 0.5, 0],
            opacity: [0, 0.7, 1, 0.7, 0],
            scale: [0.5, 1, 0.8, 1, 0.5],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: 'easeInOut' as const,
            delay: p.delay,
          }}
        />
      ))}

      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 6, -6, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const }}
        className="text-4xl mb-2 relative z-10"
      >
        🛒
      </motion.div>
      <p className="text-sm font-semibold text-muted-foreground relative z-10">Carrinho vazio</p>
      <p className="text-xs text-muted-foreground mt-1 relative z-10">
        Adicione produtos para ver sugestões personalizadas
      </p>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CartSuggestions() {
  const { cartItems, addToCart } = useAppStore()
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const cartProductIds = useMemo(
    () => new Set(cartItems.map(item => item.productId)),
    [cartItems]
  )

  // Fetch suggestions from API
  useEffect(() => {
    let cancelled = false

    const fetchSuggestions = async () => {
      setIsLoading(true)
      try {
        const data = await cachedFetch('/api/products?limit=12&isFeatured=true') as { products?: any[] }
        if (cancelled) return

        const products: ProductData[] = (data.products ?? []).map(mapApiProduct)

        // Filter out products already in cart
        const filtered = products.filter(p => !cartProductIds.has(p.id))

        // Take up to 6 suggestions
        const items: SuggestionItem[] = filtered.slice(0, 6).map((product, idx) => ({
          product,
          reason: getReasonForProduct(product, idx),
        }))

        setSuggestions(items)
      } catch {
        // Silently fail — no suggestions shown
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchSuggestions()
    return () => { cancelled = true }
  }, [cartProductIds])

  // Scroll state tracking
  const updateScrollState = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    setCanScrollLeft(container.scrollLeft > 5)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 5)
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    updateScrollState()
    container.addEventListener('scroll', updateScrollState, { passive: true })
    return () => container.removeEventListener('scroll', updateScrollState)
  }, [updateScrollState, suggestions])

  const handleScroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollRef.current
    if (!container) return
    const scrollAmount = 180
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }, [])

  const handleAddToCart = useCallback((product: ProductData) => {
    addToCart(product, product.storeName ?? 'Loja', 1)
    setAddedIds(prev => new Set([...prev, product.id]))
  }, [addToCart])

  // Empty cart
  if (cartItems.length === 0) {
    return <EmptyCartState />
  }

  // Loading
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // No suggestions
  if (suggestions.length === 0) {
    return null
  }

  const allAdded = suggestions.every(s => addedIds.has(s.product.id))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
      className="bg-card rounded-xl border border-border p-4 r62-card-lift"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <ShimmerHeader />

        {/* Scroll navigation */}
        <div className="flex items-center gap-1 ml-auto">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`h-7 w-7 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center transition-all ${
              canScrollLeft
                ? 'bg-secondary text-foreground hover:bg-secondary/80'
                : 'bg-muted text-muted-foreground/30'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`h-7 w-7 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center transition-all ${
              canScrollRight
                ? 'bg-secondary text-foreground hover:bg-secondary/80'
                : 'bg-muted text-muted-foreground/30'
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Horizontal scrollable cards */}
      <div
        ref={scrollRef}
        className="r40-scroll-container flex gap-3 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1"
      >
        <AnimatePresence>
          {suggestions.map((item, index) => {
            const isAdded = addedIds.has(item.product.id)
            return (
              <SuggestionCard
                key={item.product.id}
                item={item.product}
                reason={item.reason}
                index={index}
                isAdded={isAdded}
                onAdd={() => handleAddToCart(item.product)}
              />
            )
          })}
        </AnimatePresence>
      </div>

      {/* All added confirmation */}
      <AnimatePresence>
        {allAdded && (
          <motion.div
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="mt-3 text-center overflow-hidden"
          >
            <motion.div
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 rounded-full px-3 py-1.5"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
            >
              <Check className="h-3 w-3" />
              Todas as sugestões foram adicionadas ao carrinho!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer info */}
      <motion.div
        className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Star className="h-2.5 w-2.5 text-amber-400" />
        <span>Sugestões baseadas nos seus itens e popularidade regional</span>
      </motion.div>
    </motion.div>
  )
}
