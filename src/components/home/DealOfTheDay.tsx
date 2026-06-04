'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Heart, Share2, ShoppingCart, Clock, Zap, TrendingDown, Eye, Users, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { cachedFetch } from '@/lib/api-cache'
import { resolveProductImage } from '@/lib/product-images'
import { toast } from 'sonner'

// ---- BRL formatter ----
const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

// ---- Helpers ----
function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---- Circular countdown SVG ----
function CountdownCircle({ timeLeft, label, size = 64, strokeWidth = 4 }: { timeLeft: number; label: string; size?: number; strokeWidth?: number }) {
  const maxVal = label === 'H' ? 24 : 60
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (maxVal - timeLeft) / maxVal
  const offset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#ecfdf5"
            strokeWidth={strokeWidth}
            className="dark:stroke-[#1a3a2a]"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#059669"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring' as const, stiffness: 80, damping: 20 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold tabular-nums">{String(timeLeft).padStart(2, '0')}</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
        {label === 'H' ? 'Horas' : label === 'M' ? 'Min' : 'Seg'}
      </span>
    </div>
  )
}

// ---- Skeleton ----
function DealOfTheDaySkeleton() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <Skeleton className="h-48 sm:h-64 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-4 justify-center">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-16 rounded-full" />)}
        </div>
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}

// ---- Main component ----
export function DealOfTheDay() {
  const { addToCart, navigate, selectProduct, isFavoriteProduct, toggleFavoriteProduct } = useAppStore()
  const [products, setProducts] = useState<ProductData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [socialCount, setSocialCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const socialTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Time left until midnight
  const now = useMemo(() => new Date(), [])
  const midnight = useMemo(() => {
    const m = new Date(now)
    m.setHours(24, 0, 0, 0)
    return m
  }, [now])

  const [timeLeft, setTimeLeft] = useState({
    h: Math.floor((midnight.getTime() - Date.now()) / 3600000),
    m: Math.floor(((midnight.getTime() - Date.now()) % 3600000) / 60000),
    s: Math.floor(((midnight.getTime() - Date.now()) % 60000) / 1000),
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = midnight.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0 })
        clearInterval(timer)
        return
      }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [midnight])

  // Fetch products
  useEffect(() => {
    let cancelled = false
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const data = await cachedFetch('/api/products?limit=100') as { products?: ProductData[] }
        if (!cancelled) {
          const prods: ProductData[] = data.products || []
          setProducts(prods)
        }
      } catch {
        setProducts([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchProducts()
    return () => { cancelled = true }
  }, [])

  // Select deal based on dayOfYear (highest discount)
  const { deal, upcomingDeals } = useMemo(() => {
    const dayIndex = getDayOfYear()
    const withDiscount = products.filter(p => p.comparePrice && p.comparePrice > p.price)
      .sort((a, b) => {
        const discA = ((b.comparePrice! - b.price) / b.comparePrice!) - ((a.comparePrice! - a.price) / a.comparePrice!)
        return discA
      })
    const allDeals = withDiscount.length > 0 ? withDiscount : products.filter(p => p.isOffer)
    const fallback = allDeals.length > 0 ? allDeals : products

    const shuffled = seededShuffle(fallback, dayIndex * 7919)
    const mainDeal = shuffled[0]
    const upcoming = shuffled.slice(1, 4)
    return { deal: mainDeal || null, upcomingDeals: upcoming }
  }, [products])

  // Wishlist sync
  useEffect(() => {
    if (deal) setIsWishlisted(isFavoriteProduct(deal.id))
  }, [deal, isFavoriteProduct])

  // Social count animation
  useEffect(() => {
    if (!deal) return
    const baseCount = Math.floor(Math.abs(parseInt(deal.id.replace(/[^0-9]/g, ''), 10) || 47)) % 200 + 12
    setSocialCount(baseCount)
    setMounted(true)
    socialTimerRef.current = setInterval(() => {
      setSocialCount(prev => prev + (Math.random() > 0.6 ? 1 : 0))
    }, 5000 + Math.random() * 8000)
    return () => { if (socialTimerRef.current) clearInterval(socialTimerRef.current) }
  }, [deal])

  const discount = deal?.comparePrice
    ? Math.round(((deal.comparePrice - deal.price) / deal.comparePrice) * 100)
    : 0

  const savings = deal?.comparePrice ? deal.comparePrice - deal.price : 0

  const stockRemaining = deal ? Math.min(deal.stock, 20) : 0
  const stockPercent = deal ? Math.round((stockRemaining / Math.max(deal.stock, 1)) * 100) : 0

  const isHot = discount >= 30
  const imgUrl = deal ? resolveProductImage({ slug: deal.slug, category: deal.category, images: deal.images ?? undefined }) : null

  const handleBuyNow = useCallback(() => {
    if (!deal) return
    addToCart(deal, deal.storeName || 'Loja', 1)
    navigate('cart')
  }, [deal, addToCart, navigate])

  const handleWishlist = useCallback(() => {
    if (!deal) return
    toggleFavoriteProduct(deal.id)
    setIsWishlisted(prev => !prev)
    toast.success(isWishlisted ? 'Removido da lista de desejos' : 'Adicionado à lista de desejos!', {
      description: deal.name,
    })
  }, [deal, toggleFavoriteProduct, isWishlisted])

  const handleShare = useCallback(() => {
    if (!deal) return
    const text = `${deal.name} por apenas ${formatBRL(deal.price)}! Oferta do dia no DomPlace 🔥`
    if (navigator.share) {
      navigator.share({ title: 'Oferta do Dia - DomPlace', text, url: window.location.href })
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Link copiado!', { description: 'Compartilhe com seus amigos' })
    }
  }, [deal])

  const handleViewDeal = useCallback(() => {
    if (!deal) return
    selectProduct(deal)
    navigate('product')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [deal, selectProduct, navigate])

  const handleViewUpcoming = useCallback((p: ProductData) => {
    selectProduct(p)
    navigate('product')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectProduct, navigate])

  // Stagger children variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
    },
  }

  if (isLoading) return <DealOfTheDaySkeleton />

  if (!deal) return null

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-amber-500" />
          <h2 className="text-base sm:text-lg font-bold">Oferta do Dia</h2>
        </div>
        <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30 font-bold r26-glow-pulse-badge">
          <Sparkles className="h-2.5 w-2.5 mr-0.5" />
          Exclusiva
        </Badge>
        {/* r58 Oferta Especial badge with rotating border */}
        <div className="r58-deal-rotating-badge">
          <span className="relative z-10 text-[9px] font-bold text-red-600 dark:text-red-400 px-2 py-0.5 bg-white dark:bg-card rounded-full">
            Oferta Especial
          </span>
        </div>
      </motion.div>

      {/* Main Deal Card — Glassmorphism */}
      <motion.div variants={itemVariants} className="relative rounded-2xl overflow-hidden glassmorphism-strong r44-comparison-glass r58-deal-spotlight">
        {/* Animated gradient border via CSS — r42 conic rotation */}
        <div className="absolute inset-0 rounded-2xl r26-deal-gradient-border r42-conic-border pointer-events-none" />

        <div className="relative z-10">
          {/* Product Image Section */}
          <motion.div
            variants={itemVariants}
            className="relative bg-gradient-to-br from-primary/5 via-amber-500/5 to-primary/10 dark:from-primary/10 dark:via-amber-500/10 dark:to-primary/15"
            onClick={handleViewDeal}
          >
            {/* Image */}
            <div className="relative h-48 sm:h-64 flex items-center justify-center overflow-hidden cursor-pointer r44-deal-image-reveal">
              {imgUrl ? (
                <motion.img
                  src={imgUrl}
                  alt={deal.name}
                  className="h-full w-full object-cover"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className={`h-full w-full flex items-center justify-center bg-gradient-to-br ${
                  deal.category === 'FOOD' ? 'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30' :
                  deal.category === 'HEALTH' ? 'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30' :
                  deal.category === 'AGRICULTURE' ? 'from-lime-100 to-green-200 dark:from-lime-900/30 dark:to-green-800/30' :
                  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30'
                }`}>
                  <span className="text-6xl">
                    {{ FOOD: '🍚', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱', BEAUTY: '💅', ANIMALS: '🐾', FASHION: '👗' }[deal.category] || '📦'}
                  </span>
                </div>
              )}

              {/* "OFERTA" shimmer badge */}
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25, delay: 0.3 }}
                className="absolute top-3 left-3"
              >
                <div className="r26-offerta-badge px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-xs tracking-wider shadow-lg">
                  <span className="relative z-10 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" />
                    OFERTA
                  </span>
                </div>
              </motion.div>

              {/* Savings percentage badge */}
              {discount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.4 }}
                  className="absolute top-3 right-3"
                >
                  <div className="r26-savings-badge px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-md r42-discount-pulse r58-deal-sparkle-container">
                    -{discount}%
                  </div>
                  {/* r58 floating sparkle particles */}
                  <span className="absolute -top-1 -right-1 r58-deal-sparkle" style={{ animationDelay: '0s' }} />
                  <span className="absolute -top-2 right-2 r58-deal-sparkle" style={{ animationDelay: '0.5s' }} />
                  <span className="absolute -top-1 right-6 r58-deal-sparkle" style={{ animationDelay: '1s' }} />
                  <span className="absolute top-2 -right-2 r58-deal-sparkle" style={{ animationDelay: '1.5s' }} />
                  <span className="absolute -bottom-1 right-3 r58-deal-sparkle" style={{ animationDelay: '0.8s' }} />
                </motion.div>
              )}

              {/* Share button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); handleShare() }}
                className="absolute top-3 right-16 h-8 w-8 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white dark:hover:bg-black/60 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
              </motion.button>
            </div>
          </motion.div>

          {/* Content Section */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* Product name + store */}
            <motion.div variants={itemVariants}>
              <h3
                className="text-lg sm:text-xl font-bold cursor-pointer hover:text-primary transition-colors"
                onClick={handleViewDeal}
              >
                {deal.name}
              </h3>
              {deal.storeName && (
                <p className="text-xs text-muted-foreground mt-0.5">{deal.storeName}</p>
              )}
            </motion.div>

            {/* Countdown Timer */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5 mb-4">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground">Acaba em:</span>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 sm:gap-4 -mt-3">
              <div className="r42-ring-glow r44-timer-glow r58-deal-digit-box"><CountdownCircle timeLeft={timeLeft.h} label="H" size={56} strokeWidth={3.5} /></div>
              <span className="text-xl font-bold text-primary mt-[-18px] r58-deal-digit-sep">:</span>
              <div className="r42-ring-glow r44-timer-glow r58-deal-digit-box"><CountdownCircle timeLeft={timeLeft.m} label="M" size={56} strokeWidth={3.5} /></div>
              <span className="text-xl font-bold text-primary mt-[-18px] r58-deal-digit-sep">:</span>
              <div className="r42-ring-glow r44-timer-glow r58-deal-digit-box"><CountdownCircle timeLeft={timeLeft.s} label="S" size={56} strokeWidth={3.5} /></div>
            </motion.div>

            {/* Price Section */}
            <motion.div variants={itemVariants} className="text-center space-y-1.5 pt-1">
              {deal.comparePrice && deal.comparePrice > deal.price && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground line-through r26-animated-strikethrough r42-strikethrough-anim">
                    {formatBRL(deal.comparePrice)}
                  </span>
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                </div>
              )}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: 0.35 }}
                className="flex items-baseline justify-center gap-2"
              >
                <span className="text-2xl sm:text-3xl font-extrabold text-primary r44-price-shimmer">
                  {formatBRL(deal.price)}
                </span>
              </motion.div>
              {savings > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1"
                >
                  <Zap className="h-3 w-3" />
                  Economize {formatBRL(savings)}
                </motion.p>
              )}
            </motion.div>

            {/* Stock Progress Bar */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Restam apenas <strong className="text-red-500">{stockRemaining}</strong> unidades!
                </span>
                <span className="text-[10px] text-muted-foreground">{stockPercent}% disponível</span>
              </div>
              <div className="h-2.5 bg-secondary/80 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stockPercent}%` }}
                  transition={{ type: 'spring' as const, stiffness: 60, damping: 20, delay: 0.4 }}
                  className={`h-full rounded-full relative ${
                    stockPercent > 50
                      ? 'bg-gradient-to-r from-emerald-400 to-primary'
                      : stockPercent > 20
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                        : 'bg-gradient-to-r from-red-400 to-red-600'
                  } r26-stock-bar-fill r58-deal-progress-shimmer`}
                />
              </div>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  <strong className="font-semibold r44-social-count-animate">{socialCount}</strong> pessoas compraram
                </span>
              </div>
              {isHot && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Badge className="text-[9px] bg-red-500 text-white border-0 px-1.5 py-0 font-bold gap-0.5">
                    🔥 Super Quente
                  </Badge>
                </motion.div>
              )}
            </motion.div>

            {/* Last chance urgency indicator */}
            {timeLeft.h === 0 && timeLeft.m < 30 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                className="flex items-center justify-center mb-2"
              >
                <span className="r42-urgency-pulse r42-urgency-pulse-text inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-300/40 dark:border-red-700/30">
                  <AlertTriangle className="h-3 w-3" />
                  Última chance! Acaba em breve!
                </span>
              </motion.div>
            )}
            <motion.div variants={itemVariants} className="flex gap-2 pt-1">
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  onClick={handleBuyNow}
                  className="w-full h-11 text-sm font-bold rounded-xl r26-buy-cta-gradient btn-shine gap-2 r42-cta-shimmer r42-cta-glow r44-cta-glow"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Comprar Agora
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 px-3 rounded-xl border-primary/30 hover:bg-primary/5"
                  onClick={handleWishlist}
                >
                  <motion.div
                    animate={isWishlisted ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                  >
                    <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>

            {/* Upcoming Deals Strip */}
            {upcomingDeals.length > 0 && (
              <motion.div variants={itemVariants} className="pt-3 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground mb-2.5 flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" />
                  Próximas ofertas
                </p>
                <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
                  {upcomingDeals.map((upDeal, i) => {
                    const upImg = resolveProductImage({ slug: upDeal.slug, category: upDeal.category, images: upDeal.images ?? undefined })
                    const upDisc = upDeal.comparePrice
                      ? Math.round(((upDeal.comparePrice - upDeal.price) / upDeal.comparePrice) * 100)
                      : 0
                    return (
                      <motion.button
                        key={upDeal.id}
                        whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(16,185,129,0.12)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleViewUpcoming(upDeal)}
                        className="shrink-0 w-24 rounded-xl bg-card border border-border overflow-hidden group cursor-pointer r44-upcoming-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1, type: 'spring' as const, stiffness: 200, damping: 20 }}
                      >
                        <div className="relative h-20 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                          {upImg ? (
                            <img src={upImg} alt={upDeal.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          ) : (
                            <span className="text-2xl">
                              {{ FOOD: '🍚', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱', BEAUTY: '💅', ANIMALS: '🐾' }[upDeal.category] || '📦'}
                            </span>
                          )}
                          {/* "Em breve" badge */}
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                            <Badge className="text-[8px] bg-white/90 dark:bg-black/70 text-foreground border-0 px-1.5 py-0 font-bold backdrop-blur-sm">
                              Em breve
                            </Badge>
                          </div>
                          {upDisc > 0 && (
                            <div className="absolute top-1 right-1">
                              <Badge className="text-[8px] bg-red-500 text-white border-0 px-1 py-0 font-bold">
                                -{upDisc}%
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-1.5 text-center">
                          <p className="text-[10px] font-semibold line-clamp-1">{upDeal.name}</p>
                          <p className="text-[11px] font-bold text-primary">{formatBRL(upDeal.price)}</p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
