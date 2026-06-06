'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, Star, MapPin, Trophy, ShoppingBag, ArrowRight, Eye, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence, type MotionValue } from 'framer-motion'
import { useAppStore, type StoreData } from '@/store/useAppStore'
import { StoreCardSkeletonCarousel } from '@/components/home/StoreCardSkeleton'
import { StoreStatusBadge } from '@/components/store/StoreStatusBadge'

const gradients = [
  'from-emerald-500 to-green-600',
  'from-amber-500 to-orange-600',
  'from-teal-500 to-cyan-600',
  'from-rose-500 to-pink-600',
  'from-lime-500 to-green-600',
  'from-orange-500 to-red-500',
  'from-emerald-600 to-teal-600',
  'from-amber-600 to-yellow-500',
]

const logoColors: Record<string, string> = {
  AGRICULTURE: 'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300',
  FOOD: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  SERVICES: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
  FASHION: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  ELECTRONICS: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  HEALTH: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  HOME_GARDEN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  ANIMALS: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  EDUCATION: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  BEAUTY: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  SPORTS: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300',
}

const categoryLabels: Record<string, string> = {
  AGRICULTURE: 'Agricultura',
  FOOD: 'Alimentação',
  SERVICES: 'Serviços',
  FASHION: 'Moda',
  ELECTRONICS: 'Eletrônicos',
  HEALTH: 'Saúde',
  HOME_GARDEN: 'Casa & Jardim',
  ANIMALS: 'Animais',
  EDUCATION: 'Educação',
  BEAUTY: 'Beleza',
  SPORTS: 'Esportes',
  OTHER: 'Outros',
}

const deliveryTimes: Record<string, string> = {
  FOOD: '20-40 min',
  AGRICULTURE: '1-3 dias',
  SERVICES: 'Agendar',
  FASHION: '2-5 dias',
  ELECTRONICS: '3-7 dias',
  HEALTH: '30-60 min',
  HOME_GARDEN: '2-5 dias',
  ANIMALS: '1-3 dias',
  EDUCATION: 'Online',
  BEAUTY: 'Agendar',
  SPORTS: '2-5 dias',
  OTHER: '2-7 dias',
}

const storeEmojis: Record<string, string> = {
  AGRICULTURE: '🌿',
  FOOD: '🍕',
  SERVICES: '🔧',
  FASHION: '👗',
  ELECTRONICS: '📱',
  HEALTH: '💊',
  HOME_GARDEN: '🏡',
  ANIMALS: '🐾',
  EDUCATION: '📚',
  BEAUTY: '💅',
  SPORTS: '⚽',
  OTHER: '📦',
}

/* ═══════════════════════════════════════════
   Animated Stars — sequential reveal + sparkle on view
   ═══════════════════════════════════════════ */
function AnimatedStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const [revealed, setRevealed] = useState(false)
  const [sparkleKey, setSparkleKey] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          const interval = setInterval(() => setSparkleKey(k => k + 1), 5000)
          obs.disconnect()
          return () => clearInterval(interval)
        }
      },
      { threshold: 0.3 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const filledStars = Math.round(rating)

  return (
    <span ref={ref} className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.3, y: 6 }}
          animate={revealed ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.3, y: 6 }}
          transition={{
            delay: i * 0.07,
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1] as const,
          }}
          className="inline-flex"
        >
          <Star
            className={`h-3 w-3 ${
              i < filledStars
                ? 'text-amber-500 fill-amber-500 star-glow-pulse'
                : 'text-muted-foreground/25'
            }`}
          />
        </motion.span>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.4, duration: 0.2 }}
        className="ml-0.5 text-xs text-muted-foreground"
      >
        {rating.toFixed(1)}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.4, duration: 0.2 }}
        className="text-[10px] text-muted-foreground"
      >
        ({reviewCount})
      </motion.span>
      {revealed && rating >= 4.5 && (
        <motion.div
          key={`sparkle-${sparkleKey}`}
          className="absolute -top-1 -right-1 pointer-events-none"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 1.5, 2], opacity: [1, 0.8, 0] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" className="text-amber-400">
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="currentColor" />
          </svg>
        </motion.div>
      )}
    </span>
  )
}

/* ═══════════════════════════════════════════
   Shimmer Header — "Lojas Populares" animated text
   ═══════════════════════════════════════════ */
function ShimmerHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 px-1">
      <div className="flex items-center gap-2">
        <motion.span
          className="w-1 h-7 rounded-full bg-primary"
          animate={{ scaleY: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h2 className="text-lg sm:text-xl font-bold r62-heading-gradient">
          <span className="r25-shimmer-text">{title}</span>
        </h2>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   FavoriteHeart — animated heart toggle
   ═══════════════════════════════════════════ */
function FavoriteHeart({ storeId }: { storeId: string }) {
  const { toggleFavoriteStore, isFavoriteStore } = useAppStore()
  const isFav = isFavoriteStore(storeId)

  return (
    <motion.button
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.stopPropagation()
        toggleFavoriteStore(storeId)
      }}
      className="absolute top-2 left-1/2 -translate-x-1/2 z-20 h-7 w-7 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md"
      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <motion.div
        key={isFav ? 'filled' : 'empty'}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
      >
        <Heart
          className={`h-3.5 w-3.5 transition-colors ${
            isFav ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
          }`}
        />
      </motion.div>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════
   Stagger animation variants
   ═══════════════════════════════════════════ */
const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const staggerCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  },
}

const desktopContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
}

const desktopCardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const as const,
    },
  },
}

/* ═══════════════════════════════════════════
   StoreCardInner — full card content with favorite + shimmer CTA
   ═══════════════════════════════════════════ */
interface StoreCardInnerProps {
  store: StoreData
  gradient: string
  logoColor: string
  deliveryTime: string
  rank: number | null
  open: boolean
  productCount?: number
  onClick: () => void
  onQuickView?: () => void
  isDesktop?: boolean
}

function StoreCardInner({
  store,
  gradient,
  logoColor,
  deliveryTime,
  rank,
  open,
  productCount,
  onClick,
  onQuickView,
  isDesktop,
}: StoreCardInnerProps) {
  const initials = store.name.substring(0, 2).toUpperCase()
  const [logoError, setLogoError] = useState(false)
  const hasLogo = store.logo && !logoError
  const emoji = storeEmojis[store.category] || '🏪'

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }, [onClick])

  return (
    <motion.div
      data-card
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      whileHover={{ y: -4, scale: 1.02, boxShadow: '0 16px 40px oklch(0.45 0.1 155 / 0.15), 0 0 24px oklch(0.45 0.1 155 / 0.1)' }}
      className={`h-full bg-card rounded-xl border overflow-hidden text-left transition-all duration-300 group cursor-pointer hover:shadow-xl hover:shadow-emerald-500/10 ring-2 ring-transparent hover:ring-emerald-400/50 r25-card-lift r62-card-lift ${open ? 'card-aurora store-card-glow-border' : 'border-border hover:border-primary/30'}`}
    >
      {/* Gradient header with pattern overlay */}
      <div className={`h-24 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 dot-pattern opacity-40" />

        {/* Favorite heart toggle — positioned over the gradient edge */}
        <FavoriteHeart storeId={store.id} />

        {/* Top ranking badge */}
        {rank && rank <= 3 && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/90 dark:bg-black/50 rounded-md px-2 py-0.5">
            <Trophy
              className={`h-3 w-3 ${
                rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : 'text-amber-700'
              }`}
            />
            <span className="text-[10px] font-bold text-foreground">Top #{rank}</span>
          </div>
        )}

        {/* Delivery badge — lower left when no rank */}
        {!rank && (
          <div className="absolute bottom-2 left-2 z-10">
            {store.deliveryFee > 0 ? (
              <Badge className="bg-white/90 text-foreground border-0 text-[10px]">
                Entrega R${store.deliveryFee.toFixed(2)}
              </Badge>
            ) : (
              <Badge className="bg-emerald-500 text-white border-0 text-[10px]">Frete Grátis</Badge>
            )}
          </div>
        )}

        {/* Center emoji fallback for cover */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-3xl opacity-20"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {emoji}
          </motion.span>
        </div>

        {/* Decorative circles */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute right-8 top-2 w-10 h-10 rounded-full bg-white/10" />
      </div>

      <div className="p-3 flex gap-3">
        {/* Store logo */}
        <div
          className={`w-10 h-10 rounded-full ${
            hasLogo
              ? 'ring-2 ring-white dark:ring-card overflow-hidden bg-white'
              : `${logoColor} flex items-center justify-center text-sm font-bold`
          } shrink-0 shadow-sm ring-2 ring-white dark:ring-card`}
        >
          {hasLogo ? (
            <motion.img
              src={store.logo || ''}
              alt={store.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              onError={() => setLogoError(true)}
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {store.name}
          </h3>
          <Badge variant="secondary" className="text-[10px] mt-0.5">
            {categoryLabels[store.category] || store.category}
          </Badge>

          {/* Animated star rating */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <AnimatedStars rating={store.rating} reviewCount={store.totalReviews} />
            {store.rating >= 4.5 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 font-bold leading-none">
                ⭐ {store.rating.toFixed(1)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-1.5">
            <StoreStatusBadge isOpen={open} closingTime={store.closesAt || undefined} />
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {deliveryTime}
            </span>
          </div>
          {store.address && (
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5 truncate">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              {store.address}
            </p>
          )}
          {/* Product count */}
          {productCount !== undefined && productCount > 0 && (
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
              <ShoppingBag className="h-2.5 w-2.5" />
              {productCount} {productCount === 1 ? 'produto' : 'produtos'}
            </p>
          )}
        </div>
      </div>

      {/* Ver Loja button + Quick view + shimmer sweep */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-1.5">
          <motion.button
            onClick={(e) => { e.stopPropagation(); onClick() }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/5 text-primary text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200 relative overflow-hidden r25-shimmer-sweep"
          >
            {/* Shimmer sweep animation on CTA */}
            <motion.span
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.12) 55%, transparent 60%)',
                backgroundSize: '250% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
            />
            <ShoppingBag className="h-3 w-3 relative z-10" />
            <span className="relative z-10">Ver Loja</span>
          </motion.button>
          {onQuickView && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onQuickView() }}
              className="h-8 w-8 rounded-lg flex items-center justify-center bg-secondary/80 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Visualização rápida"
            >
              <Eye className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   DotIndicators — animated dot navigation with layoutId
   ═══════════════════════════════════════════ */
function DotIndicators({
  total,
  current,
  onSelect,
}: {
  total: number
  current: number
  onSelect: (index: number) => void
}) {
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-3">
      {Array.from({ length: total }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => onSelect(i)}
          className="relative rounded-full focus:outline-none"
          aria-label={`Ir para loja ${i + 1}`}
        >
          {/* Background dot (always visible) */}
          <motion.span
            animate={{
              width: i === current ? 24 : 8,
              height: i === current ? 8 : 8,
              opacity: i === current ? 1 : 0.35,
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
            className="block rounded-full bg-primary"
          />
          {/* Active dot glow */}
          {i === current && (
            <motion.span
              layoutId="store-carousel-dot"
              className="absolute inset-0 rounded-full bg-primary/30"
              style={{ width: 24, height: 8 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════
   StoreCarousel — main exported component (full-featured)
   ═══════════════════════════════════════════ */
interface StoreCarouselProps {
  title: string
  stores: StoreData[]
  isLoading?: boolean
}

export function StoreCarousel({ title, stores, isLoading }: StoreCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const carouselWrapperRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const { navigate, selectStore, openStoreQuickView } = useAppStore()

  // Measure container width
  useEffect(() => {
    const el = carouselWrapperRef.current
    if (!el) return
    const update = () => setContainerWidth(el.offsetWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (stores.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % stores.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [stores.length])

  // Sync scroll position to active index
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget
      const scrollLeft = container.scrollLeft
      // Estimate active index based on scroll position
      const cardWidth = 280 + 12 // card width + gap
      const newIndex = Math.round(scrollLeft / cardWidth)
      if (newIndex >= 0 && newIndex < stores.length) {
        setActiveIndex(newIndex)
      }
    },
    [stores.length],
  )

  // Scroll to specific index with smooth animation
  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return
    const cardWidth = 280 + 12
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    })
    setActiveIndex(index)
  }, [])

  // Scroll by direction
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const cardEl = scrollRef.current.querySelector('[data-card]') as HTMLElement | null
    const cardWidth = cardEl ? cardEl.offsetWidth + 12 : 300
    const newLeft = direction === 'left'
      ? scrollRef.current.scrollLeft - cardWidth
      : scrollRef.current.scrollLeft + cardWidth
    scrollRef.current.scrollTo({ left: newLeft, behavior: 'smooth' })
  }

  if (!stores.length && !isLoading) return null

  // Skeleton state
  if (isLoading) {
    return (
      <section className="w-full">
        <ShimmerHeader title={title} />
        <StoreCardSkeletonCarousel count={3} />
      </section>
    )
  }

  // Sort stores by rating to determine ranking
  const rankedStores = [...stores].sort((a, b) => b.rating - a.rating)

  const isOpen = (store: StoreData) => {
    if (!store.opensAt || !store.closesAt) return true
    const now = new Date()
    const brasiliaOffset = 3 * 60
    const utcMins = now.getUTCHours() * 60 + now.getUTCMinutes()
    const currentMins = (utcMins - brasiliaOffset + 24 * 60) % (24 * 60)
    const [h, m] = store.opensAt.split(':').map(Number)
    const [eh, em] = store.closesAt.split(':').map(Number)
    const openMins = h * 60 + m
    const closeMins = eh * 60 + em
    if (openMins <= closeMins) {
      return currentMins >= openMins && currentMins < closeMins
    }
    return currentMins >= openMins || currentMins < closeMins
  }

  const getRank = (storeId: string) => {
    const idx = rankedStores.findIndex((s) => s.id === storeId)
    return idx >= 0 ? idx + 1 : null
  }

  // Simulated product count per store
  const getProductCount = (storeId: string) => {
    const hash = storeId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return 10 + (hash % 45)
  }

  const handleStoreClick = (store: StoreData) => {
    selectStore(store)
    navigate('store')
  }

  return (
    <section className="w-full r25-gradient-border p-1 rounded-2xl r62-card-lift">
      <div className="flex items-center justify-between mb-1 px-1">
        <ShimmerHeader title={title} />
        <div className="flex items-center gap-1">
          {/* "Ver todas as lojas" link */}
          <button
            onClick={() => navigate('search')}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors group mr-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          {/* Arrow navigation with hover glow */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 lg:hidden r25-nav-glow"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 lg:hidden r25-nav-glow"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Mobile: horizontal carousel with stagger + auto-rotate ── */}
      <div ref={carouselWrapperRef} className="relative lg:hidden">
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 50px 0px 0px' }}
        >
          <AnimatePresence mode="wait">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-2 r62-scroll-snap"
            >
              {stores.map((store, index) => (
                <motion.div
                  key={store.id}
                  variants={staggerCardVariants}
                  className="snap-center shrink-0 w-[260px] sm:w-[280px]"
                >
                  <StoreCardInner
                    store={store}
                    gradient={gradients[index % gradients.length]}
                    logoColor={logoColors[store.category] || logoColors.OTHER}
                    deliveryTime={deliveryTimes[store.category] || '2-7 dias'}
                    rank={getRank(store.id)}
                    open={isOpen(store)}
                    productCount={getProductCount(store.id)}
                    onClick={() => handleStoreClick(store)}
                    onQuickView={() => openStoreQuickView(store)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </motion.div>

        {/* Dot indicators for mobile */}
        <DotIndicators
          total={Math.min(stores.length, 8)}
          current={Math.min(activeIndex, Math.min(stores.length, 8) - 1)}
          onSelect={scrollToIndex}
        />

        {/* Gradient edge fades */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-12 w-12 z-10"
          style={{ background: 'linear-gradient(to right, var(--color-background), transparent)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-12 w-12 z-10"
          style={{ background: 'linear-gradient(to left, var(--color-background), transparent)' }}
          aria-hidden
        />
      </div>

      {/* ── Desktop: responsive 3-column grid ── */}
      <motion.div
        className="hidden lg:grid lg:grid-cols-3 gap-3 pb-2"
        variants={desktopContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {stores.slice(0, 6).map((store, index) => (
          <motion.div key={store.id} variants={desktopCardVariants} className="h-full">
            <StoreCardInner
              store={store}
              gradient={gradients[index % gradients.length]}
              logoColor={logoColors[store.category] || logoColors.OTHER}
              deliveryTime={deliveryTimes[store.category] || '2-7 dias'}
              rank={getRank(store.id)}
              open={isOpen(store)}
              productCount={getProductCount(store.id)}
              onClick={() => handleStoreClick(store)}
              onQuickView={() => openStoreQuickView(store)}
              isDesktop
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Desktop dot indicators */}
      <div className="hidden lg:block">
        <DotIndicators
          total={Math.min(stores.length, 6)}
          current={Math.min(activeIndex, Math.min(stores.length, 6) - 1)}
          onSelect={scrollToIndex}
        />
      </div>
    </section>
  )
}
