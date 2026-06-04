'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Flame, Clock, TrendingDown, ShoppingCart, ChevronLeft, ChevronRight, Zap, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { resolveProductImage } from '@/lib/product-images'
import { fireConfettiFromElement } from '@/lib/confetti'
import { cachedFetch } from '@/lib/api-cache'
import { toast } from 'sonner'

const gradients = [
  'from-red-100 to-orange-200 dark:from-red-900/30 dark:to-orange-800/30',
  'from-amber-100 to-yellow-200 dark:from-amber-900/30 dark:to-yellow-800/30',
  'from-orange-100 to-red-200 dark:from-orange-900/30 dark:to-red-800/30',
  'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
  'from-yellow-100 to-amber-200 dark:from-yellow-900/30 dark:to-amber-800/30',
  'from-red-100 to-amber-200 dark:from-red-900/30 dark:to-amber-800/30',
]

const categoryIcons: Record<string, string> = {
  FOOD: '🍚',
  HEALTH: '💊',
  AGRICULTURE: '🌿',
  ANIMALS: '🐾',
  BEAUTY: '💅',
  ELECTRONICS: '📱',
  SERVICES: '🔧',
  FASHION: '👗',
  HOME_GARDEN: '🏡',
  EDUCATION: '📚',
  SPORTS: '⚽',
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/* ───────────────────────────────────────────────────────────────
   1. CIRCULAR PROGRESS COUNTDOWN RING (with gradient badge)
   ─────────────────────────────────────────────────────────────── */

function CountdownRing({
  value,
  max,
  size = 36,
  strokeWidth = 3,
  gradientId,
}: {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  gradientId: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = value / max
  const offset = circumference * (1 - progress)

  return (
    <div className="relative inline-flex flex-col items-center gap-0.5">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-red-100 dark:text-red-900/30"
        />
        {/* Foreground progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
        />
      </svg>
      {/* Center value with pulse on change */}
      <span className="absolute inset-0 flex items-center justify-center rotate-0">
        <motion.span
          key={value}
          className="text-[11px] font-bold text-red-600 dark:text-red-400 tabular-nums r34-flash-sale-digit-pulse"
          initial={{ scale: 1.2, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' as const }}
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </span>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   5. FIRE / SPARK EMOJI FLOATING ANIMATION (ENHANCED)
   ─────────────────────────────────────────────────────────────── */

function FireSparks() {
  const sparkConfigs = [
    { emoji: '🔥', xOff: -2, delay: 0 },
    { emoji: '✨', xOff: 10, delay: 0.7 },
    { emoji: '🔥', xOff: 4, delay: 1.4 },
    { emoji: '💫', xOff: -8, delay: 2.1 },
  ]

  return (
    <span className="relative inline-flex w-5 h-0 ml-0.5">
      {sparkConfigs.map((cfg, i) => (
        <motion.span
          key={i}
          className="absolute text-xs pointer-events-none select-none"
          style={{ left: cfg.xOff, bottom: 0 }}
          initial={{ opacity: 0, y: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [2, -8, -22, -34],
            scale: [0.6, 1, 0.9, 0.4],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: cfg.delay,
            ease: 'easeOut' as const,
            repeatDelay: 0.4,
          }}
        >
          {cfg.emoji}
        </motion.span>
      ))}
    </span>
  )
}

/* ───────────────────────────────────────────────────────────────
   4. URGENCY TAG SHAKING MICRO-ANIMATION
   ─────────────────────────────────────────────────────────────── */

function UrgencyBadge({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{
        x: [0, -1.5, 1.5, -1, 0],
        rotate: [0, -0.8, 0.8, -0.5, 0],
      }}
      transition={{
        duration: 0.45,
        repeat: Infinity,
        repeatDelay: 2.5,
        ease: 'easeInOut' as const,
      }}
    >
      {children}
    </motion.div>
  )
}

/* ───────────────────────────────────────────────────────────────
   HOOKS
   ─────────────────────────────────────────────────────────────── */

function useFlashCountdown() {
  const [time, setTime] = useState(() => {
    const now = new Date()
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    const diff = Math.max(0, end.getTime() - now.getTime())
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return { hours, minutes, seconds }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) { seconds = 59; minutes-- }
        if (minutes < 0) { minutes = 59; hours-- }
        if (hours < 0) return prev
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return time
}

/* ───────────────────────────────────────────────────────────────
   SKELETON
   ─────────────────────────────────────────────────────────────── */

function FlashSaleCardSkeleton() {
  return (
    <div className="shrink-0 w-[155px] sm:w-[175px]">
      <Card className="overflow-hidden h-full">
        <CardContent className="p-0 h-full flex flex-col">
          <Skeleton className="aspect-square w-full" />
          <div className="p-2.5 flex flex-col flex-1">
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-4 w-full mt-0.5" />
            <Skeleton className="h-4 w-3/4 mt-1" />
            <div className="mt-auto pt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-1.5 w-full mt-2 rounded-full" />
              <Skeleton className="h-7 w-full mt-2 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   PRODUCT MAPPER
   ─────────────────────────────────────────────────────────────── */

interface FlashProduct extends ProductData {
  soldPercent: number
}

function mapApiToFlashProduct(p: Record<string, unknown>): FlashProduct {
  const soldCount = (p.soldCount as number) || 0
  const stock = (p.stock as number) || 10
  const estimatedTotal = Math.max(stock + soldCount, stock)
  const soldPercent = Math.min(Math.round((soldCount / estimatedTotal) * 100), 98)

  return {
    id: p.id as string,
    storeId: (p.storeId as string) || '',
    storeName: (p.storeName as string) || 'Loja',
    storeLogo: (p.storeLogo as string) || null,
    name: (p.name as string) || '',
    slug: (p.slug as string) || '',
    description: (p.description as string) || '',
    price: typeof p.price === 'number' ? p.price : 0,
    comparePrice: typeof p.comparePrice === 'number' ? p.comparePrice : null,
    images: (p.images as string) || '[]',
    stock: typeof p.stock === 'number' ? p.stock : 10,
    rating: typeof p.rating === 'number' ? p.rating : 0,
    totalReviews: typeof p.totalReviews === 'number' ? p.totalReviews : 0,
    isFeatured: (p.isFeatured as boolean) || false,
    isNew: (p.isNew as boolean) || false,
    isOffer: (p.isOffer as boolean) || true,
    tags: (p.tags as string) || '[]',
    variations: (p.variations as string) || null,
    category: (p.category as string) || 'OTHER',
    soldPercent,
  }
}

/* ───────────────────────────────────────────────────────────────
   6. PRICE BOUNCE ANIMATION COMPONENT
   ─────────────────────────────────────────────────────────────── */

function AnimatedPrice({ price, hasCompare }: { price: number; hasCompare: boolean }) {
  if (!hasCompare) {
    return (
      <span className="text-sm font-extrabold text-red-600 dark:text-red-400">
        {formatBRL(price)}
      </span>
    )
  }

  return (
    <motion.span
      className="inline-block"
      initial={{ scale: 0.6, color: '#dc2626' }}
      animate={{ scale: 1, color: '#16a34a' }}
      transition={{
        type: 'spring' as const,
        stiffness: 400,
        damping: 14,
        color: { duration: 0.9, delay: 0.15 },
      }}
      style={{ color: '#16a34a' }}
    >
      <span className="text-sm font-extrabold">{formatBRL(price)}</span>
    </motion.span>
  )
}

/* ───────────────────────────────────────────────────────────────
   3. 3D TILT CARD WRAPPER (enhanced)
   ─────────────────────────────────────────────────────────────── */

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateY = (x - 0.5) * 14
    const rotateX = -(y - 0.5) * 10
    setTilt({ rotateX, rotateY })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 })
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: 700 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
        }}
        transition={{
          type: 'spring' as const,
          stiffness: 300,
          damping: 25,
          mass: 0.5,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ─────────────────────────────────────────────────────────────── */

export function FlashSale() {
  const { addToCart, selectProduct, navigate } = useAppStore()
  const countdown = useFlashCountdown()
  const [scrollPos, setScrollPos] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [products, setProducts] = useState<FlashProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { hours, minutes, seconds } = countdown

  // Fetch offer products from API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await cachedFetch('/api/products?isOffer=true&limit=6&sort=popular')
      const flashProducts = (data.products || []).map(mapApiToFlashProduct)
      setProducts(flashProducts)
    } catch {
      setError('Erro ao carregar ofertas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Auto-refresh animation when timer reaches zero
  useEffect(() => {
    if (hours === 0 && minutes === 0 && seconds === 0) {
      const startTimer = setTimeout(() => {
        setRefreshing(true)
        fetchProducts()
      }, 0)
      const endTimer = setTimeout(() => setRefreshing(false), 2000)
      return () => { clearTimeout(startTimer); clearTimeout(endTimer) }
    }
  }, [hours, minutes, seconds, fetchProducts])

  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = document.getElementById('flash-sale-scroll')
    if (!container) return
    const amount = 200
    const newScroll = direction === 'left'
      ? Math.max(0, scrollPos - amount)
      : scrollPos + amount
    container.scrollTo({ left: newScroll, behavior: 'smooth' })
    setScrollPos(newScroll)
  }, [scrollPos])

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => b.soldPercent - a.soldPercent)
  }, [products])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: 'spring' as const, stiffness: 200, damping: 25 }}
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />
      <div className="relative">
        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-900/10 dark:via-orange-900/10 dark:to-amber-900/10 rounded-2xl border border-red-200/50 dark:border-red-800/30 overflow-hidden glass-card-hover r17-flash-glow-border r27-gradient-border">
          {/* ── r39 animated fire/torch effect behind header ── */}
          <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden pointer-events-none r39-fire-torch-effect" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg"
              >
                <Flame className="h-5 w-5 text-white" />
              </motion.div>
              <div className="relative">
                {/* ── r39 enhanced pulsing glow ring around OFERTA badge ── */}
                <motion.div
                  className="absolute -inset-3 rounded-xl pointer-events-none flash-badge-glow"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.15), transparent 70%)' }}
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const }}
                />
                <motion.div
                  className="absolute -inset-1.5 rounded-xl pointer-events-none r39-oferta-glow-outer"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.1), transparent 60%)' }}
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.3 }}
                />
                {/* ── r39 pulsing glow ring ring element ── */}
                <span className="absolute -inset-2 rounded-xl pointer-events-none r39-oferta-pulse-ring" />
                <div className="relative">
                <h2 className="font-bold text-base sm:text-lg flex items-center gap-1.5">
                  <span className="r17-flash-gradient-text r17-flash-shimmer-oferta r27-shimmer-text r34-flash-sale-title-shimmer r42-flash-badge-text">
                    OFERTA RELÂMPAGO
                  </span>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                  >
                    <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                  </motion.div>
                  {/* 5. Fire/spark emoji animation near the title */}
                  <FireSparks />
                  <span className="r42-fire-wiggle">🔥</span>
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Descontos imperdíveis por tempo limitado</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setRefreshing(true)
                  fetchProducts()
                }}
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              {/* ─── 1. Circular progress countdown with r39 gradient badge ─── */}
              <div className="relative flex items-center gap-1.5">
                {/* Floating urgency particles near the timer */}
                <motion.div
                  className="absolute -top-3 -left-1 w-1.5 h-1.5 rounded-full bg-red-400 pointer-events-none"
                  animate={{ y: [0, -8, -16], opacity: [0, 0.8, 0], scale: [0.5, 1, 0.4] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' as const, delay: 0 }}
                />
                <motion.div
                  className="absolute -top-2 left-1/2 w-1 h-1 rounded-full bg-amber-400 pointer-events-none"
                  animate={{ y: [0, -10, -20], opacity: [0, 0.7, 0], scale: [0.6, 0.8, 0.3] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' as const, delay: 0.8 }}
                />
                <motion.div
                  className="absolute -top-2.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-orange-400 pointer-events-none"
                  animate={{ y: [0, -6, -14], opacity: [0, 0.9, 0], scale: [0.4, 1, 0.3] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' as const, delay: 1.6 }}
                />
                <div className="flex items-center gap-1.5 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl px-2.5 py-1.5 border border-red-200/50 dark:border-red-800/30 shadow-sm inner-shadow-accent relative overflow-hidden r27-timer-glow r39-countdown-badge">
                  <div className="absolute inset-0 r17-flash-timer-shimmer pointer-events-none rounded-xl" />
                  {/* r39 gradient shimmer sweep behind countdown */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    <div className="absolute inset-0 r39-countdown-shimmer" />
                  </div>
                  <div className="r42-digit-spring"><CountdownRing value={hours} max={24} size={34} strokeWidth={2.5} gradientId="flash-h" /></div>
                  <div className="r42-digit-spring"><CountdownRing value={minutes} max={60} size={34} strokeWidth={2.5} gradientId="flash-m" /></div>
                  <div className="r42-digit-spring"><CountdownRing value={seconds} max={60} size={34} strokeWidth={2.5} gradientId="flash-s" /></div>
                  <div className="hidden sm:flex flex-col text-[8px] text-muted-foreground font-medium leading-none gap-1.5 ml-0.5">
                    <span>h</span>
                    <span>m</span>
                    <span>s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product scroll */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {refreshing ? (
                <motion.div
                  key="refreshing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-48 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="products"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Error state */}
                  {error && !isLoading && products.length === 0 ? (
                    <div className="px-4 pb-4 flex flex-col items-center justify-center h-48 text-center">
                      <p className="text-sm text-muted-foreground mb-2">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchProducts}
                        className="gap-1.5"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Tentar novamente
                      </Button>
                    </div>
                  ) : (
                    <div id="flash-sale-scroll" className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-4">
                      {/* Loading skeletons */}
                      {isLoading && (
                        <>
                          {Array.from({ length: 4 }).map((_, i) => (
                            <FlashSaleCardSkeleton key={`skeleton-${i}`} />
                          ))}
                        </>
                      )}

                      {/* Real product cards */}
                      {!isLoading && sortedProducts.map((product, index) => {
                        const discount = product.comparePrice
                          ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                          : 0
                        const isLowStock = product.soldPercent >= 85
                        const isCriticallyLow = product.soldPercent >= 70 // <30% remaining → glow
                        const gradient = gradients[index % gradients.length]
                        const imageUrl = resolveProductImage({
                          slug: product.slug,
                          category: product.category,
                          images: product.images,
                        })

                        return (
                          <motion.div
                            key={product.id}
                            className="shrink-0 w-[155px] sm:w-[175px]"
                            /* ── Enhanced stagger animations (increased delay) ── */
                            initial={{ opacity: 0, y: 24, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            whileHover={{ scale: 1.03, y: -4 }}
                            transition={{ delay: index * 0.12, type: 'spring' as const, stiffness: 280, damping: 22 }}
                          >
                            {/* 3. 3D Tilt Card Wrapper (enhanced) */}
                            <TiltCard className="h-full">
                              <Card
                                className="card-spotlight overflow-hidden border-red-200/30 dark:border-red-800/20 h-full cursor-pointer group glass-card-hover flash-sale-card-glow r42-flash-card r27-card-lift r34-flash-sale-card-glow r39-card-3d-hover"
                                onClick={() => { selectProduct(product); navigate('product') }}
                              >
                                <CardContent className="p-0 h-full flex flex-col relative">
                                  {/* r36 shimmer sweep overlay */}
                                  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none z-10">
                                    <div className="absolute inset-0 r36-flash-shimmer" />
                                  </div>
                                  {/* Image */}
                                  <div className={`relative aspect-square flex items-center justify-center bg-gradient-to-br ${gradient} overflow-hidden`}>
                                    {imageUrl ? (
                                      <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="absolute inset-0 w-full h-full object-cover r42-card-image"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                        loading="lazy"
                                      />
                                    ) : null}
                                    {!imageUrl && (
                                      <motion.div
                                        className="h-14 w-14 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform z-10"
                                        animate={isLowStock ? { scale: [1, 1.05, 1] } : {}}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                      >
                                        <span className="text-3xl">{categoryIcons[product.category] || '📦'}</span>
                                      </motion.div>
                                    )}

                                    {/* ── r39 animated discount badge ── */}
                                    <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[10px] px-1.5 py-0 font-bold shadow-sm r27-badge-pulse r39-discount-badge r42-flash-badge-glow">
                                      <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                                      -{discount}%
                                    </Badge>

                                    {/* 4. Urgency tag with shaking micro-animation */}
                                    {isLowStock && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute top-2 right-2"
                                      >
                                        <UrgencyBadge>
                                          <motion.div
                                            animate={{ opacity: [1, 0.6, 1] }}
                                            transition={{ duration: 1.2, repeat: Infinity }}
                                            className="flex items-center gap-0.5 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm badge-floating"
                                          >
                                            <AlertTriangle className="h-2.5 w-2.5" />
                                            Últimas!
                                          </motion.div>
                                        </UrgencyBadge>
                                      </motion.div>
                                    )}

                                    {/* Quase esgotando! for critically low but not "last" */}
                                    {isCriticallyLow && !isLowStock && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute top-2 right-2"
                                      >
                                        <UrgencyBadge>
                                          <div className="flex items-center gap-0.5 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                                            <AlertTriangle className="h-2.5 w-2.5" />
                                            Quase esgotando!
                                          </div>
                                        </UrgencyBadge>
                                      </motion.div>
                                    )}
                                  </div>

                                  {/* Info */}
                                  <div className="p-2.5 flex flex-col flex-1">
                                    <p className="text-[10px] text-muted-foreground">{product.storeName}</p>
                                    <h3 className="text-xs font-semibold mt-0.5 line-clamp-2 leading-tight min-h-[1.75rem]">
                                      {product.name}
                                    </h3>

                                    <div className="mt-auto pt-2">
                                      <div className="flex items-baseline gap-1.5">
                                        {/* 6. Price change animation: scale-bounce + color transition */}
                                        <AnimatedPrice
                                          price={product.price}
                                          hasCompare={!!product.comparePrice}
                                        />
                                        {product.comparePrice && (
                                          <span className="text-[10px] text-muted-foreground line-through-animated">
                                            {formatBRL(product.comparePrice)}
                                          </span>
                                        )}
                                      </div>

                                      {/* 2. Stock bar animation with glow */}
                                      <div className="mt-2">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-[9px] text-muted-foreground">
                                            {product.stock} restantes
                                          </span>
                                          <span className="text-[9px] font-bold text-red-600 dark:text-red-400">
                                            {product.soldPercent}% vendido
                                          </span>
                                        </div>
                                        <div className="relative h-1.5 bg-muted rounded-full overflow-visible">
                                          {/* Pulsing red glow for critically low stock */}
                                          {isCriticallyLow && (
                                            <motion.div
                                              className="absolute top-0 left-0 h-1.5 rounded-full"
                                              animate={{
                                                width: `${product.soldPercent}%`,
                                                boxShadow: '0 0 10px 3px rgba(239,68,68,0.5)',
                                              }}
                                              initial={{ width: 0 }}
                                              transition={{
                                                width: { delay: 0.3 + index * 0.12, duration: 0.8, ease: 'easeOut' as const },
                                                boxShadow: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
                                              }}
                                              style={{ zIndex: 0 }}
                                            />
                                          )}
                                          {/* The actual progress bar with enhanced gradient */}
                                          <motion.div
                                            className={`h-full rounded-full relative ${isLowStock ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500 flash-stock-bar-glow' : 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-400'} ${isCriticallyLow ? 'flash-stock-pulse' : ''} r27-stagger-fill r42-stock-shimmer`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${product.soldPercent}%` }}
                                            transition={{ delay: 0.3 + index * 0.12, duration: 0.8, ease: 'easeOut' as const }}
                                            style={{ zIndex: 1 }}
                                          />
                                        </div>
                                      </div>

                                      {/* ── r39 shimmer sweep on CTA button (wrapped in motion.div, not on Button) ── */}
                                      <motion.div className="mt-2 relative overflow-hidden rounded-md r39-cta-wrap">
                                        <div className="absolute inset-0 r39-cta-shimmer pointer-events-none z-10" />
                                        <Button
                                          size="sm"
                                          className="w-full h-7 text-[10px] bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 gap-1 btn-smooth ripple-effect flash-buy-btn-shimmer relative z-0"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            addToCart(product, product.storeName || 'Loja')
                                            toast.success(`${product.name} adicionado!`)
                                            fireConfettiFromElement(e.currentTarget)
                                          }}
                                        >
                                          <ShoppingCart className="h-3 w-3" />
                                          Comprar
                                        </Button>
                                      </motion.div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </TiltCard>
                          </motion.div>
                        )
                      })}

                      {/* Empty state */}
                      {!isLoading && products.length === 0 && !error && (
                        <div className="flex items-center justify-center w-full h-48">
                          <p className="text-sm text-muted-foreground">Nenhuma oferta disponível no momento</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll buttons */}
            {products.length > 0 && (
              <>
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 dark:bg-card/90 shadow-md border border-border/50 flex items-center justify-center hover:bg-white transition-colors z-10 hidden sm:flex"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 dark:bg-card/90 shadow-md border border-border/50 flex items-center justify-center hover:bg-white transition-colors z-10 hidden sm:flex"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Sale progress bar with gradient animation */}
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 relative overflow-hidden r17-flash-progress-sweep r39-fire-progress-bar">
            <motion.div
              className="absolute inset-0"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
            >
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </motion.div>
          </div>
        </div>
      </div>
      {/* Floating background urgency sparkles — 8 fire/lightning themed particles */}
      <motion.div
        className="absolute top-8 right-6 w-1 h-1 rounded-full bg-amber-400/40 pointer-events-none"
        animate={{ y: [0, -12, -24], opacity: [0, 0.6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' as const, delay: 0.5 }}
      />
      <motion.div
        className="absolute top-12 left-8 w-1.5 h-1.5 rounded-full bg-red-400/30 pointer-events-none"
        animate={{ y: [0, -10, -20], opacity: [0, 0.5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut' as const, delay: 1.2 }}
      />
      <motion.div
        className="absolute top-20 right-12 w-2 h-2 rounded-full bg-orange-400/30 pointer-events-none"
        animate={{ y: [0, -14, -28], opacity: [0, 0.5, 0], scale: [0.5, 1, 0.3] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' as const, delay: 0.2 }}
      />
      <motion.div
        className="absolute top-6 left-1/3 w-1 h-1 rounded-full bg-yellow-400/40 pointer-events-none"
        animate={{ y: [0, -8, -18], opacity: [0, 0.7, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut' as const, delay: 0.8 }}
      />
      <motion.div
        className="absolute top-16 right-1/4 w-1.5 h-1.5 rounded-full bg-amber-500/25 pointer-events-none"
        animate={{ y: [0, -10, -22], opacity: [0, 0.4, 0], scale: [0.6, 0.9, 0.2] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeOut' as const, delay: 1.6 }}
      />
      <motion.div
        className="absolute top-4 left-1/2 w-1 h-1 rounded-full bg-red-500/25 pointer-events-none"
        animate={{ y: [0, -12, -26], opacity: [0, 0.5, 0], scale: [0.4, 0.8, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeOut' as const, delay: 2.0 }}
      />
      {/* Additional fire emoji particles */}
      <motion.div
        className="absolute top-10 right-[30%] w-3 h-3 pointer-events-none text-xs"
        animate={{ y: [0, -16, -30], opacity: [0, 0.6, 0], scale: [0.5, 1, 0.3] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeOut' as const, delay: 1.0 }}
      >🔥</motion.div>
      <motion.div
        className="absolute top-14 left-[20%] w-3 h-3 pointer-events-none text-[10px]"
        animate={{ y: [0, -14, -26], opacity: [0, 0.5, 0], scale: [0.6, 0.9, 0.2] }}
        transition={{ duration: 4.0, repeat: Infinity, ease: 'easeOut' as const, delay: 2.8 }}
      >✨</motion.div>
    </motion.section>
  )
}
