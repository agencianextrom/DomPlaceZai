'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingDown, Heart, ShoppingCart, Clock, RefreshCw, Tag, Flame, Eye, Sparkles, Plus, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { cachedFetch } from '@/lib/api-cache'
import { resolveProductImage } from '@/lib/product-images'
import { formatBRL, CategoryIcon } from '@/components/product/ProductCard'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
interface PriceDropItem {
  product: ProductData
  savings: number
  percentage: number
  dropColor: string
  dropBgColor: string
  dropBorderColor: string
}

/* ═══════════════════════════════════════════════════════════════
   Animation variants
   ═══════════════════════════════════════════════════════════════ */
const feedContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const feedItemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.95,
    transition: { duration: 0.25 },
  },
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
function getDropColor(percentage: number): { color: string; bg: string; border: string } {
  if (percentage >= 30) {
    return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200/60 dark:border-red-800/40' }
  }
  if (percentage >= 15) {
    return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200/60 dark:border-amber-800/40' }
  }
  return { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200/60 dark:border-emerald-800/40' }
}

function getTimeAgo(): string {
  const hours = [1, 2, 3, 5, 8, 12, 24, 48]
  const h = hours[Math.floor(Math.random() * hours.length)]
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

/* ═══════════════════════════════════════════════════════════════
   AnimatedDownArrow — pulsing down arrow with glow
   ═══════════════════════════════════════════════════════════════ */
function AnimatedDownArrow({ percentage }: { percentage: number }) {
  const { color } = getDropColor(percentage)
  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={{ y: [0, 4, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const }}
    >
      {/* Glow ring behind arrow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
        style={{
          background: percentage >= 30
            ? 'radial-gradient(circle, rgba(239,68,68,0.35) 0%, transparent 70%)'
            : percentage >= 15
              ? 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
        }}
      />
      <motion.span
        className={`relative text-lg font-bold ${color}`}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        ▼
      </motion.span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SavingsBadge — shimmer "Economize R$X" badge
   ═══════════════════════════════════════════════════════════════ */
function SavingsBadge({ savings, percentage }: { savings: number; percentage: number }) {
  const { color, bg, border } = getDropColor(percentage)
  return (
    <motion.div
      initial={{ scale: 0, x: -10 }}
      animate={{ scale: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.2 }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${bg} ${color} ${border} border relative overflow-hidden`}
    >
      {/* Shimmer sweep */}
      <motion.span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.35) 55%, transparent 60%)',
          backgroundSize: '300% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' as const, repeatDelay: 1.5 }}
      />
      <Tag className="h-2.5 w-2.5 relative z-10" />
      <span className="relative z-10">Economize {formatBRL(savings)}</span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PercentageIndicator — color-coded drop % badge
   ═══════════════════════════════════════════════════════════════ */
function PercentageIndicator({ percentage }: { percentage: number }) {
  const { color, bg, border } = getDropColor(percentage)
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 500, damping: 12, delay: 0.15 }}
      className={`flex items-center justify-center h-10 w-10 rounded-xl ${bg} ${border} border shrink-0 relative`}
    >
      <motion.div
        animate={percentage >= 30
          ? { boxShadow: ['0 0 0 0 rgba(239,68,68,0.3)', '0 0 0 6px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0)'] }
          : percentage >= 15
            ? { boxShadow: ['0 0 0 0 rgba(245,158,11,0.3)', '0 0 0 6px rgba(245,158,11,0)', '0 0 0 0 rgba(245,158,11,0)'] }
            : { boxShadow: ['0 0 0 0 rgba(16,185,129,0.3)', '0 0 0 6px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0)'] }
        }
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
        className="absolute inset-0 rounded-xl"
      />
      <span className={`text-sm font-extrabold ${color} relative z-10 r30-price-drop`}>
        -{percentage}%
      </span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   AddToListButton — "Adicionar à Lista" with animated states
   ═══════════════════════════════════════════════════════════════ */
function AddToListButton({ product, index }: { product: ProductData; index: number }) {
  const { toggleFavoriteProduct, isFavoriteProduct, addToCart } = useAppStore()
  const [added, setAdded] = useState(false)
  const [listMode, setListMode] = useState<'wishlist' | 'cart'>('wishlist')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const isFav = isFavoriteProduct(product.id)

  const handleAddWishlist = () => {
    toggleFavoriteProduct(product.id)
    setListMode('wishlist')
    setAdded(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setAdded(false), 1800)
  }

  const handleAddCart = () => {
    addToCart(product, product.storeName || 'Loja')
    setListMode('cart')
    setAdded(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setAdded(false), 1800)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <div className="flex gap-1.5 mt-2">
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        onClick={handleAddWishlist}
        className={`flex-1 h-7 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors relative overflow-hidden ${
          isFav
            ? 'bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-200/60 dark:border-red-800/40'
            : 'bg-secondary/60 hover:bg-secondary text-foreground border border-border/50'
        }`}
      >
        <AnimatePresence mode="wait">
          {added && listMode === 'wishlist' ? (
            <motion.span
              key="check-w"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.25 }}
              className="inline-flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              Salvo!
            </motion.span>
          ) : (
            <motion.span
              key="heart-w"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1"
            >
              <Heart className={`h-3 w-3 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
              Lista
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        onClick={handleAddCart}
        className="flex-1 h-7 rounded-lg text-[10px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center justify-center gap-1 transition-colors relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {added && listMode === 'cart' ? (
            <motion.span
              key="check-c"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.25 }}
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold"
            >
              <Check className="h-3 w-3" />
              Adicionado!
            </motion.span>
          ) : (
            <motion.span
              key="cart-c"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1"
            >
              <ShoppingCart className="h-3 w-3" />
              Carrinho
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PriceDropCard — individual price drop feed item
   ═══════════════════════════════════════════════════════════════ */
function PriceDropCard({ item, index }: { item: PriceDropItem; index: number }) {
  const { navigate, selectProduct } = useAppStore()
  const { product, savings, percentage } = item
  const { bg, border } = getDropColor(percentage)
  const imgUrl = resolveProductImage({ slug: product.slug, category: product.category, images: product.images })
  const timeAgoRef = useRef(getTimeAgo())

  const handleClick = () => {
    selectProduct(product)
    navigate('product')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <motion.div
      variants={feedItemVariants}
      whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.08)' }}
      onClick={handleClick}
      className={`${bg} ${border} border rounded-xl p-3 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group r30-card-glow`}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />

      <div className="relative z-10 flex gap-3">
        {/* Left: Percentage indicator with animated arrow */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <PercentageIndicator percentage={percentage} />
          <AnimatedDownArrow percentage={percentage} />
        </div>

        {/* Center: Product info */}
        <div className="flex-1 min-w-0">
          {/* Store name */}
          <p className="text-[10px] text-muted-foreground truncate">{product.storeName}</p>

          {/* Product name */}
          <h4 className="text-xs font-semibold line-clamp-1 mt-0.5 group-hover:text-primary transition-colors">
            {product.name}
          </h4>

          {/* Prices */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
            {product.comparePrice && (
              <span className="text-[10px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
            )}
          </div>

          {/* Savings badge */}
          <SavingsBadge savings={savings} percentage={percentage} />

          {/* Time ago */}
          <div className="flex items-center gap-1 mt-1.5">
            <Clock className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">{timeAgoRef.current}</span>
          </div>

          {/* Action buttons */}
          <AddToListButton product={product} index={index} />
        </div>

        {/* Right: Product image */}
        <motion.div
          className="h-16 w-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative"
          whileHover={{ scale: 1.05 }}
        >
          {imgUrl ? (
            <img src={imgUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ) : null}
          <CategoryIcon category={product.category} />
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ShimmerSkeleton — loading state with shimmer effect
   ═══════════════════════════════════════════════════════════════ */
function ShimmerSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-xl bg-card border border-border">
          <div className="h-10 w-10 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-7 w-full mt-1" />
          </div>
          <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Empty State
   ═══════════════════════════════════════════════════════════════ */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
        className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center mb-4"
      >
        <TrendingDown className="h-7 w-7 text-emerald-400" />
      </motion.div>
      <h3 className="text-sm font-bold text-foreground">Nenhuma queda de preço no momento</h3>
      <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
        Fique de olho! Novas quedas de preço aparecem aqui assim que as lojas reduzem os preços.
      </p>
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' as const }}
        className="mt-4"
      >
        <Sparkles className="h-5 w-5 text-amber-400/50" />
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   RefreshIndicator — auto-refresh countdown
   ═══════════════════════════════════════════════════════════════ */
function RefreshIndicator({ refreshing, countdown }: { refreshing: boolean; countdown: number }) {
  return (
    <motion.div
      className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
      animate={{ opacity: refreshing ? [1, 0.4, 1] : 1 }}
      transition={refreshing ? { duration: 0.8, repeat: Infinity } : {}}
    >
      <motion.div
        animate={refreshing ? { rotate: 360 } : {}}
        transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' as const } : {}}
      >
        <RefreshCw className="h-3 w-3" />
      </motion.div>
      <span>{refreshing ? 'Atualizando...' : `Atualiza em ${countdown}s`}</span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   StatsBar — total stats at the top
   ═══════════════════════════════════════════════════════════════ */
function StatsBar({ totalDrops, biggestDrop, totalSavings }: { totalDrops: number; biggestDrop: number; totalSavings: number }) {
  return (
    <div className="flex gap-3 mb-3">
      {[
        { label: 'Quedas', value: totalDrops, icon: TrendingDown, color: 'text-red-500' },
        { label: 'Maior queda', value: `-${biggestDrop}%`, icon: Flame, color: 'text-amber-500' },
        { label: 'Economia total', value: formatBRL(totalSavings), icon: Tag, color: 'text-emerald-500' },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.08 }}
          className="flex-1 bg-card border border-border rounded-lg p-2.5 text-center relative overflow-hidden"
        >
          <motion.span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)',
              backgroundSize: '300% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' as const, repeatDelay: 2, delay: i * 0.5 }}
          />
          <stat.icon className={`h-3.5 w-3.5 ${stat.color} mx-auto mb-1 relative z-10`} />
          <p className="text-[10px] text-muted-foreground relative z-10">{stat.label}</p>
          <p className="text-xs font-bold relative z-10">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — PriceDropAlerts
   ═══════════════════════════════════════════════════════════════ */
export function PriceDropAlerts() {
  const [priceDrops, setPriceDrops] = useState<PriceDropItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [viewCount, setViewCount] = useState(6)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch price drop products
  const fetchPriceDrops = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setIsLoading(true)

    try {
      const data = await cachedFetch('/api/products?limit=50')
      const products: ProductData[] = data.products || []

      // Filter products with comparePrice > price (price drops)
      const drops: PriceDropItem[] = products
        .filter((p: ProductData) => p.comparePrice && p.comparePrice > p.price)
        .map((p: ProductData) => {
          const savings = p.comparePrice! - p.price
          const percentage = Math.round((savings / p.comparePrice!) * 100)
          const colors = getDropColor(percentage)
          return {
            product: p,
            savings,
            percentage,
            dropColor: colors.color,
            dropBgColor: colors.bg,
            dropBorderColor: colors.border,
          }
        })
        .sort((a, b) => b.percentage - a.percentage)

      setPriceDrops(drops)
    } catch {
      console.error('Error fetching price drops')
    } finally {
      if (isRefresh) setRefreshing(false)
      else setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchPriceDrops()
  }, [fetchPriceDrops])

  // Auto-refresh countdown
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchPriceDrops(true)
          return 30
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [fetchPriceDrops])

  // Computed stats
  const totalDrops = priceDrops.length
  const biggestDrop = priceDrops.length > 0 ? priceDrops[0].percentage : 0
  const totalSavings = priceDrops.reduce((sum, d) => sum + d.savings, 0)

  // Show limited items with "Ver mais" button
  const visibleDrops = priceDrops.slice(0, viewCount)
  const hasMore = viewCount < priceDrops.length

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="space-y-4"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <TrendingDown className="h-4 w-4 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5 r30-alert-shimmer">
              Queda de Preço
              {totalDrops > 0 && (
                <motion.span
                  key={totalDrops}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                >
                  <Badge variant="secondary" className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/30 font-bold">
                    {totalDrops} {totalDrops === 1 ? 'produto' : 'produtos'}
                  </Badge>
                </motion.span>
              )}
            </h2>
            <p className="text-[10px] text-muted-foreground">Acompanhe os produtos que baixaram de preço</p>
          </div>
        </div>
        <RefreshIndicator refreshing={refreshing} countdown={countdown} />
      </div>

      {/* Stats bar */}
      {!isLoading && priceDrops.length > 0 && (
        <StatsBar totalDrops={totalDrops} biggestDrop={biggestDrop} totalSavings={totalSavings} />
      )}

      {/* Loading skeleton */}
      {isLoading && <ShimmerSkeleton />}

      {/* Empty state */}
      {!isLoading && priceDrops.length === 0 && <EmptyState />}

      {/* Price drop feed */}
      {!isLoading && priceDrops.length > 0 && (
        <motion.div
          className="space-y-3"
          variants={feedContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <AnimatePresence>
            {visibleDrops.map((item, index) => (
              <PriceDropCard key={item.product.id} item={item} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Load more button */}
      {!isLoading && hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => setViewCount((prev) => prev + 6)}
            className="h-9 px-5 rounded-full text-xs font-semibold bg-card border border-border hover:border-primary/30 hover:bg-primary/5 text-foreground flex items-center gap-2 transition-colors r30-cta-pulse"
          >
            <Eye className="h-3.5 w-3.5" />
            Ver mais quedas de preço
            <Badge variant="secondary" className="text-[9px] ml-1">
              +{priceDrops.length - viewCount}
            </Badge>
          </motion.button>
        </motion.div>
      )}
    </motion.section>
  )
}
