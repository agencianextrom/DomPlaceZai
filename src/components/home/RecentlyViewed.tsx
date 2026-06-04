'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight, Trash2, Eye, ShoppingCart, Star, X, ArrowRight } from 'lucide-react'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { resolveProductImage } from '@/lib/product-images'
import { formatBRL } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

// ── Constants ──────────────────────────────────────────────────────
const MAX_RECENT_ITEMS = 20
const STAGGER_DELAY = 0.08
const AUTO_SCROLL_SPEED = 0.6
const AUTO_SCROLL_INTERVAL = 50
const IDLE_TIMEOUT = 3500

// ── Types ──────────────────────────────────────────────────────────
interface RecentlyViewedProduct {
  id: string
  storeId: string
  storeName?: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  images: string
  category: string
  rating: number
  totalReviews: number
  isNew: boolean
  isOffer: boolean
}

// ── Variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER_DELAY },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, x: 35, scale: 0.92, rotateY: 8 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    rotateY: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 24 },
  },
  exit: {
    opacity: 0,
    x: -40,
    scale: 0.85,
    rotateY: -12,
    transition: { duration: 0.25, ease: 'easeIn' as const },
  },
}

// ── Category Emoji Map ────────────────────────────────────────────
const categoryEmoji: Record<string, string> = {
  FOOD: '🍚', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱',
  BEAUTY: '💅', ANIMALS: '🐾', FASHION: '👗', SERVICES: '🔧',
  HOME_GARDEN: '🏠', EDUCATION: '📚', SPORTS: '⚽', OTHER: '📦',
}

// ── Loading Skeleton ──────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="shrink-0 w-[170px] sm:w-[200px]">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="mt-2.5 space-y-2 px-0.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
          <Eye className="h-8 w-8 text-slate-300 dark:text-slate-600" />
        </div>
        {/* Orbiting dots */}
        <motion.div
          className="absolute -inset-3 rounded-full border border-dashed border-slate-200/60 dark:border-slate-700/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
      <h3 className="text-sm font-bold mt-4">Nenhum produto visualizado ainda</h3>
      <p className="text-[11px] text-muted-foreground mt-1.5 max-w-[220px] leading-relaxed">
        Navegue pelos produtos e eles aparecerão aqui para você encontrar rapidamente
      </p>
    </motion.div>
  )
}

// ── Product Card Component ─────────────────────────────────────────
function RecentProductCard({
  product,
  index,
  onClick,
  onQuickAdd,
}: {
  product: RecentlyViewedProduct
  index: number
  onClick: () => void
  onQuickAdd: (e: React.MouseEvent) => void
}) {
  const imageUrl = resolveProductImage({
    slug: product.slug,
    category: product.category,
    images: product.images,
  })

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <motion.div
      variants={cardVariants}
      className="shrink-0 w-[170px] sm:w-[200px] group"
      style={{ perspective: 800 }}
    >
      <motion.div
        className="relative bg-card rounded-2xl border border-border overflow-hidden cursor-pointer card-premium-hover card-shine"
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 22 }}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
        aria-label={`Ver ${product.name}`}
      >
        {/* Image container */}
        <div className="relative aspect-[4/4] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="text-5xl">{categoryEmoji[product.category] || '📦'}</div>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg shadow-sm"
            >
              -{discount}%
            </motion.div>
          )}

          {/* New badge */}
          {product.isNew && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-[8px] border-0 px-1.5 py-0 h-5">
              Novo
            </Badge>
          )}

          {/* "Ver novamente" hover overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col items-center justify-end pb-3 gap-2"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-1.5 text-white/90 text-xs font-semibold bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5"
            >
              <Eye className="h-3 w-3" />
              Ver novamente
            </motion.div>
          </motion.div>

          {/* Index badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="absolute bottom-1.5 right-1.5 text-[9px] text-white/60 bg-black/30 backdrop-blur-sm rounded-full h-5 w-5 flex items-center justify-center font-medium"
          >
            {index + 1}
          </motion.div>
        </div>

        {/* Product info */}
        <div className="p-3">
          {/* Store name */}
          {product.storeName && (
            <p className="text-[10px] text-muted-foreground truncate">{product.storeName}</p>
          )}

          {/* Product name */}
          <h3 className="text-xs font-bold mt-0.5 line-clamp-2 leading-tight min-h-[2rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-semibold">{product.rating.toFixed(1)}</span>
              {product.totalReviews > 0 && (
                <span className="text-[9px] text-muted-foreground">({product.totalReviews})</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[10px] text-muted-foreground line-through">
                {formatBRL(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1.5 mt-2">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={(e) => { e.stopPropagation(); onQuickAdd(e) }}
              className="flex-1 h-7 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg flex items-center justify-center gap-1 text-[10px] font-semibold transition-colors"
            >
              <ShoppingCart className="h-3 w-3" />
              Carrinho
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={(e) => { e.stopPropagation(); onClick() }}
              className="h-7 px-2.5 bg-secondary/60 hover:bg-secondary text-foreground rounded-lg flex items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors"
            >
              Detalhes
              <ArrowRight className="h-2.5 w-2.5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main RecentlyViewedHome Component ───────────────────────────────
export function RecentlyViewedHome() {
  const { selectProduct, navigate, recentlyViewed, addRecentlyViewed, clearRecentlyViewed, addToCart } = useAppStore()
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [isClearing, setIsClearing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isInteracting = useRef(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const autoScrollRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const [mounted, setMounted] = useState(false)

  // Mount guard
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch and sync product data
  const fetchProducts = useCallback(async () => {
    if (recentlyViewed.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/products?limit=100')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const allProducts: RecentlyViewedProduct[] = (data.products || []).filter(
        (p: RecentlyViewedProduct) => recentlyViewed.some(rv => rv.id === p.id)
      )

      // Sort by Zustand store order (most recent first)
      const ordered = recentlyViewed
        .map(rv => allProducts.find(p => p.id === rv.id))
        .filter((p): p is RecentlyViewedProduct => p !== undefined)
        .slice(0, MAX_RECENT_ITEMS)

      setProducts(ordered)
    } catch {
      // Silent fail — use store data directly as fallback
      const fallback: RecentlyViewedProduct[] = recentlyViewed.slice(0, MAX_RECENT_ITEMS).map(p => ({
        id: p.id,
        storeId: p.storeId,
        storeName: p.storeName,
        name: p.name,
        slug: p.slug,
        price: p.price,
        comparePrice: p.comparePrice,
        images: p.images,
        category: p.category,
        rating: p.rating,
        totalReviews: p.totalReviews,
        isNew: p.isNew,
        isOffer: p.isOffer,
      }))
      setProducts(fallback)
    } finally {
      setLoading(false)
    }
  }, [recentlyViewed])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Auto-scroll logic
  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) return
    autoScrollRef.current = setInterval(() => {
      if (isInteracting.current || !scrollRef.current) return
      const el = scrollRef.current
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollLeft += AUTO_SCROLL_SPEED
      }
    }, AUTO_SCROLL_INTERVAL)
  }, [])

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current)
      autoScrollRef.current = undefined
    }
  }, [])

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    stopAutoScroll()
    idleTimerRef.current = setTimeout(() => {
      startAutoScroll()
    }, IDLE_TIMEOUT)
  }, [stopAutoScroll, startAutoScroll])

  useEffect(() => {
    if (products.length > 3) {
      idleTimerRef.current = setTimeout(() => {
        startAutoScroll()
      }, IDLE_TIMEOUT)
    }
    return () => {
      stopAutoScroll()
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [products.length, startAutoScroll, stopAutoScroll])

  // Product click handler
  const handleProductClick = useCallback((product: RecentlyViewedProduct) => {
    const productData: ProductData = {
      id: product.id,
      storeId: product.storeId,
      storeName: product.storeName,
      name: product.name,
      slug: product.slug,
      description: null,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images,
      stock: 0,
      rating: product.rating,
      totalReviews: product.totalReviews,
      isFeatured: false,
      isNew: product.isNew,
      isOffer: product.isOffer,
      tags: '',
      variations: null,
      category: product.category,
    }
    selectProduct(productData)
    navigate('product')
    addRecentlyViewed(productData)
  }, [selectProduct, navigate, addRecentlyViewed])

  // Quick add to cart
  const handleQuickAdd = useCallback((product: RecentlyViewedProduct, e: React.MouseEvent) => {
    e.stopPropagation()
    const productData: ProductData = {
      id: product.id,
      storeId: product.storeId,
      storeName: product.storeName,
      name: product.name,
      slug: product.slug,
      description: null,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images,
      stock: 99,
      rating: product.rating,
      totalReviews: product.totalReviews,
      isFeatured: false,
      isNew: product.isNew,
      isOffer: product.isOffer,
      tags: '',
      variations: null,
      category: product.category,
    }
    addToCart(productData, product.storeName || 'Loja', 1)
    toast.success(`${product.name} adicionado ao carrinho!`)
  }, [addToCart])

  // Scroll handlers
  const handleInteractionStart = useCallback(() => {
    isInteracting.current = true
    resetIdleTimer()
  }, [resetIdleTimer])

  const handleInteractionEnd = useCallback(() => {
    isInteracting.current = false
  }, [])

  const scrollByAmount = useCallback((direction: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 220, behavior: 'smooth' })
      resetIdleTimer()
    }
  }, [resetIdleTimer])

  // Clear history
  const handleClearHistory = useCallback(() => {
    setIsClearing(true)
    setTimeout(() => {
      clearRecentlyViewed()
      setProducts([])
      setIsClearing(false)
      toast.success('Histórico limpo!', {
        description: 'Todos os produtos vistos foram removidos',
      })
    }, 400)
  }, [clearRecentlyViewed])

  // Don't render on server or when no items
  if (!mounted) return null
  if (!loading && products.length === 0) return <EmptyState />

  return (
    <section className="mt-6">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 flex items-center justify-center shadow-md"
          >
            <Clock className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-1.5">
              Vistos Recentemente
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm"
              >
                👀
              </motion.span>
            </h2>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              {products.length > 0 ? (
                <>
                  Você viu{' '}
                  <motion.span
                    key={products.length}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
                    className="font-bold text-foreground"
                  >
                    {products.length}
                  </motion.span>
                  {' '}produto{products.length !== 1 ? 's' : ''}
                </>
              ) : (
                'Produtos que você visitou'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Clear history button */}
          {!loading && products.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleClearHistory}
              disabled={isClearing}
              className="h-8 px-2.5 rounded-full flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <motion.div
                animate={isClearing ? { rotate: 360 } : {}}
                transition={{ duration: 0.6, repeat: isClearing ? Infinity : 0 }}
              >
                {isClearing ? (
                  <div className="h-3 w-3 rounded-full border-2 border-destructive/30 border-t-destructive animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </motion.div>
              <span className="hidden sm:inline">Limpar</span>
            </motion.button>
          )}

          {/* Scroll controls */}
          {!loading && products.length > 3 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => scrollByAmount(-1)}
                aria-label="Rolar para esquerda"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => scrollByAmount(1)}
                aria-label="Rolar para direita"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Loading skeleton */}
      {loading && <LoadingSkeleton />}

      {/* Products carousel */}
      {!loading && products.length > 0 && (
        <div className="relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none rounded-l-xl" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none rounded-r-xl" />

          <AnimatePresence mode="wait">
            {!isClearing ? (
              <motion.div
                key="products"
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 cursor-grab active:cursor-grabbing"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onMouseEnter={handleInteractionStart}
                onMouseLeave={handleInteractionEnd}
                onMouseDown={handleInteractionStart}
                onMouseUp={handleInteractionEnd}
                onTouchStart={handleInteractionStart}
                onTouchEnd={handleInteractionEnd}
              >
                {products.map((product, index) => (
                  <RecentProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onClick={() => handleProductClick(product)}
                    onQuickAdd={(e) => handleQuickAdd(product, e)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="clearing"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom "Ver Detalhes" section for mobile */}
      {!loading && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center mt-3 sm:hidden"
        >
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span>←</span> Deslize para ver mais produtos <span>→</span>
          </p>
        </motion.div>
      )}
    </section>
  )
}
