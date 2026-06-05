'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Flame,
  Clock,
  Star,
  ShoppingCart,
  ChevronRight,
  Zap,
  UtensilsCrossed,
  TrendingUp,
  Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cachedFetch } from '@/lib/api-cache'
import { formatBRL } from '@/lib/format'
import { useAppStore, type ProductData } from '@/store/useAppStore'

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

type MoodFilter = 'faminto' | 'rapido' | 'saudavel' | 'doces'

interface MealItem {
  product: ProductData
  deliveryMin: number
  popularity: number
  timeCategory: string
}

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const MOOD_FILTERS: { key: MoodFilter; label: string; emoji: string; color: string; gradient: string }[] = [
  {
    key: 'faminto',
    label: 'Faminto',
    emoji: '🔥',
    color: 'text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    key: 'rapido',
    label: 'Lanche Rápido',
    emoji: '⚡',
    color: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    key: 'saudavel',
    label: 'Saudável',
    emoji: '🥗',
    color: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    key: 'doces',
    label: 'Doces/Sobremesas',
    emoji: '🍰',
    color: 'text-pink-600 dark:text-pink-400',
    gradient: 'from-pink-500 to-rose-500',
  },
]

const TIME_EMOJIS: Record<string, string> = {
  'café da manhã': '☕',
  almoço: '🍽️',
  jantar: '🌙',
  lanche: '🥤',
}

const FOOD_EMOJIS: Record<string, string> = {
  'hambúrguer': '🍔', 'pizza': '🍕', 'hot dog': '🌭', 'coxinha': '🍗',
  'pão de queijo': '🧀', 'açaí': '🫐', 'acai': '🫐', 'bolo': '🎂',
  'torta': '🥧', 'brownie': '🍫', 'sorvete': '🍦', 'churrasco': '🥩',
  'pastel': '🥟', 'esfiha': '🥧', 'salada': '🥗', 'sushi': '🍣',
  'acarajé': '🌶️', 'tapioca': '🫓', 'wrap': '🌯', 'sanduíche': '🥪',
  'beirute': '🥙', 'crepe': '🥞', 'macarrão': '🍝', 'massa': '🍝',
  'frango': '🍗', 'carne': '🥩', 'peixe': '🐟', 'arroz': '🍚',
  'feijoada': '🥘', 'empada': '🥟', 'risole': '🥟', 'brigadeiro': '🍫',
  'beijinho': '🍬', 'pudim': '🍮', 'doce': '🍬', 'suco': '🧃',
  'smoothie': '🥤', 'vitamina': '🥤', 'iogurte': '🥛',
}

function getEmojiForProduct(name: string): string {
  const lower = name.toLowerCase()
  for (const [keyword, emoji] of Object.entries(FOOD_EMOJIS)) {
    if (lower.includes(keyword)) return emoji
  }
  return '🍽️'
}

function getTimeOfDayLabel(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'café da manhã'
  if (h >= 11 && h < 15) return 'almoço'
  if (h >= 15 && h < 18) return 'lanche'
  return 'jantar'
}

function getDeliveryGradient(mins: number): string {
  if (mins <= 15) return 'from-emerald-400 to-green-500'
  if (mins <= 30) return 'from-amber-400 to-orange-500'
  return 'from-red-400 to-rose-500'
}

function getDeliveryLabel(mins: number): string {
  if (mins <= 15) return 'Super rápido'
  if (mins <= 30) return 'Rápido'
  return 'Normal'
}

/* ═══════════════════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════════════════ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
}

const filterPillVariants = {
  inactive: { scale: 1, y: 0 },
  active: {
    scale: 1.08,
    y: -2,
    transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
  },
}

const firePulseVariants = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.8, 1, 0.8],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 24 },
  },
}

const cartPopVariants = {
  initial: { scale: 1 },
  added: {
    scale: [1, 0.85, 1.1, 0.95, 1],
    transition: { duration: 0.5, ease: 'easeInOut' as const },
  },
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Delivery Progress Bar ── */
function DeliveryProgress({ mins }: { mins: number }) {
  const progress = Math.max(0, Math.min(100, ((45 - mins) / 45) * 100))

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold text-muted-foreground flex items-center gap-0.5">
          <Timer className="h-2.5 w-2.5" />
          {getDeliveryLabel(mins)}
        </span>
        <span className="text-[9px] font-bold tabular-nums">{mins} min</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${getDeliveryGradient(mins)}`}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' as const }}
        />
      </div>
    </div>
  )
}

/* ── Fire Heat Indicator ── */
function FireIndicator({ popularity }: { popularity: number }) {
  const fireCount = Math.min(3, Math.ceil(popularity / 40))
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fireCount }).map((_, i) => (
        <motion.div
          key={i}
          variants={firePulseVariants}
          animate="animate"
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const, delay: i * 0.15 }}
        >
          <Flame className="h-3 w-3 text-orange-500" fill="currentColor" />
        </motion.div>
      ))}
    </div>
  )
}

/* ── "Pronto em X min" Badge ── */
function ReadyBadge({ mins }: { mins: number }) {
  const [remaining, setRemaining] = useState(mins)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (remaining <= 0) return
    timerRef.current = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1))
    }, 60000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [remaining <= 0])

  return (
    <motion.div
      className="r58-meal-ready-badge flex items-center gap-1 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5"
      animate={{ scale: remaining <= 0 ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 0.6, ease: 'easeInOut' as const, repeat: remaining <= 0 ? Infinity : 0 }}
    >
      <Clock className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
      <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
        {remaining <= 0 ? 'Pronto!' : `Pronto em ${remaining} min`}
      </span>
    </motion.div>
  )
}

/* ── Star Rating ── */
function MiniStarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.3
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-2.5 w-2.5 ${
            i < full
              ? 'text-amber-400 fill-amber-400'
              : i === full && hasHalf
                ? 'text-amber-400 fill-amber-400/50'
                : 'text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="text-[9px] font-semibold text-muted-foreground ml-0.5">{rating.toFixed(1)}</span>
    </div>
  )
}

/* ── Meal Card ── */
function MealCard({
  item,
  index,
  onAddToCart,
}: {
  item: MealItem
  index: number
  onAddToCart: (product: ProductData) => void
}) {
  const [added, setAdded] = useState(false)
  const emoji = getEmojiForProduct(item.product.name)
  const activeMood = MOOD_FILTERS[0] // Default gradient from faminto
  const { product } = item

  const handleAdd = () => {
    setAdded(true)
    onAddToCart(product)
    setTimeout(() => setAdded(false), 600)
  }

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -4,
        boxShadow: '0 8px 24px rgba(16,185,129,0.12), 0 2px 6px rgba(0,0,0,0.06)',
      }}
      className="r58-meal-card flex-shrink-0 w-44 bg-card rounded-xl border border-border overflow-hidden group cursor-pointer snap-start"
    >
      {/* Gradient Header */}
      <div className={`relative h-28 bg-gradient-to-br ${activeMood.gradient} flex items-center justify-center overflow-hidden`}>
        <motion.span
          className="text-4xl relative z-10"
          initial={{ scale: 0.6, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring' as const, stiffness: 350, damping: 14, delay: index * 0.05 }}
        >
          {emoji}
        </motion.span>

        {/* Shimmer overlay */}
        <div className="r58-meal-card-shimmer absolute inset-0 pointer-events-none" />

        {/* Fire indicator */}
        {item.popularity > 40 && (
          <div className="absolute top-2 left-2">
            <FireIndicator popularity={item.popularity} />
          </div>
        )}

        {/* Ready badge */}
        <div className="absolute top-2 right-2">
          <ReadyBadge mins={item.deliveryMin} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-2.5 space-y-1.5">
        {/* Store name */}
        <span className="text-[9px] text-muted-foreground font-medium truncate block">
          {product.storeName}
        </span>

        {/* Name */}
        <h4 className="text-[11px] font-bold leading-tight line-clamp-2">{product.name}</h4>

        {/* Rating */}
        <MiniStarRating rating={product.rating} />

        {/* Delivery Progress */}
        <DeliveryProgress mins={item.deliveryMin} />

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-[9px] text-muted-foreground line-through">
              {formatBRL(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Pedir Agora button */}
        <motion.div
          variants={cartPopVariants}
          initial="initial"
          animate={added ? 'added' : 'initial'}
        >
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              className="w-full h-7 text-[10px] font-semibold flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-sm"
              onClick={(e) => {
                e.stopPropagation()
                handleAdd()
              }}
            >
              {added ? (
                <>
                  <span className="text-white">✓</span>
                  Adicionado
                </>
              ) : (
                <>
                  <ShoppingCart className="h-2.5 w-2.5" />
                  Pedir Agora
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ── Skeleton Card ── */
function MealCardSkeleton() {
  return (
    <div className="r58-meal-skeleton flex-shrink-0 w-44 bg-card rounded-xl border border-border overflow-hidden">
      <div className="h-28 loading-skeleton" />
      <div className="p-2.5 space-y-2">
        <div className="h-2.5 loading-skeleton rounded w-3/4" />
        <div className="h-3 loading-skeleton rounded w-full" />
        <div className="h-3 loading-skeleton rounded w-2/3" />
        <div className="h-1.5 loading-skeleton rounded" />
        <div className="h-4 loading-skeleton rounded w-1/2" />
        <div className="h-7 loading-skeleton rounded" />
      </div>
    </div>
  )
}

/* ── Empty State ── */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="r58-meal-empty flex flex-col items-center justify-center py-10 px-4"
    >
      <motion.span
        className="text-5xl mb-3"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        😋
      </motion.span>
      <h3 className="text-sm font-bold text-muted-foreground mb-1">Nenhum item encontrado</h3>
      <p className="text-[10px] text-muted-foreground text-center max-w-xs">
        Tente outro filtro ou volte mais tarde para mais opções deliciosas!
      </p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export function QuickMealFinder() {
  const [products, setProducts] = useState<ProductData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<MoodFilter>('faminto')
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

  const addToCart = useAppStore((s) => s.addToCart)

  const timeOfDay = useMemo(() => getTimeOfDayLabel(), [])
  const timeEmoji = TIME_EMOJIS[timeOfDay] || '🍽️'

  /* ── Fetch products ── */
  useEffect(() => {
    let cancelled = false

    cachedFetch('/api/products?category=FOOD&limit=24&sort=popular')
      .then((data) => {
        if (cancelled) return
        setProducts(data?.products ?? [])
        setIsLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setProducts([])
        setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  /* ── Filter + sort logic ── */
  const mealItems: MealItem[] = useMemo(() => {
    const timeLabel = timeOfDay

    return products
      .map((p) => {
        const deliveryMin = 10 + Math.floor(Math.abs(hashCode(p.id)) % 35)
        const popularity = Math.round((p.rating / 5) * 100) + (p.totalReviews % 30)
        return {
          product: p,
          deliveryMin,
          popularity,
          timeCategory: timeLabel,
        } as MealItem
      })
      .filter((item) => {
        const name = item.product.name.toLowerCase()
        switch (activeFilter) {
          case 'faminto':
            return true
          case 'rapido':
            return (
              item.deliveryMin <= 25 ||
              name.includes('lanche') ||
              name.includes('hambúrguer') ||
              name.includes('hot dog') ||
              name.includes('sanduíche') ||
              name.includes('beirute') ||
              name.includes('coxinha') ||
              name.includes('pastel') ||
              name.includes('pão de queijo') ||
              name.includes('wrap') ||
              name.includes('crepe') ||
              name.includes('esfiha') ||
              name.includes('acarajé') ||
              name.includes('tapioca')
            )
          case 'saudavel':
            return (
              name.includes('salada') ||
              name.includes('saudável') ||
              name.includes('natural') ||
              name.includes('integral') ||
              name.includes('suco') ||
              name.includes('vitamina') ||
              name.includes('smoothie') ||
              name.includes('iogurte') ||
              name.includes('açaí') ||
              name.includes('acai') ||
              name.includes('fruta') ||
              name.includes('green') ||
              name.includes('grão') ||
              name.includes('cebolinha')
            )
          case 'doces':
            return (
              name.includes('bolo') ||
              name.includes('torta') ||
              name.includes('brownie') ||
              name.includes('sorvete') ||
              name.includes('brigadeiro') ||
              name.includes('beijinho') ||
              name.includes('pudim') ||
              name.includes('doce') ||
              name.includes('sobremesa') ||
              name.includes('chocolate') ||
              name.includes('cookie') ||
              name.includes('mousse')
            )
          default:
            return true
        }
      })
      .sort((a, b) => {
        if (activeFilter === 'rapido') return a.deliveryMin - b.deliveryMin
        if (activeFilter === 'faminto') return b.popularity - a.popularity
        return b.product.rating - a.product.rating
      })
  }, [products, activeFilter, timeOfDay])

  const handleAddToCart = useCallback(
    (product: ProductData) => {
      addToCart(product, product.storeName || 'Restaurante')
      setAddedIds((prev) => new Set(prev).add(product.id))
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev)
          next.delete(product.id)
          return next
        })
      }, 600)
    },
    [addToCart]
  )

  const activeFilterConfig = MOOD_FILTERS.find((f) => f.key === activeFilter)!

  return (
    <section className="r58-meal-finder w-full" aria-label="Quick Meal Finder">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2.5">
          <div className={`r58-meal-header-icon h-9 w-9 rounded-xl bg-gradient-to-br ${activeFilterConfig.gradient} flex items-center justify-center shadow-md`}>
            <UtensilsCrossed className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">Comida Rápida</h2>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              {timeEmoji} Recomendado agora: <span className="font-semibold capitalize">{timeOfDay}</span>
            </p>
          </div>
        </div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="sm" className="text-[10px] font-semibold text-muted-foreground gap-0.5 h-7 min-h-[44px] px-2">
            Ver tudo
            <ChevronRight className="h-3 w-3" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Mood Filter Pills */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-2"
      >
        {MOOD_FILTERS.map((filter) => (
          <motion.button
            key={filter.key}
            variants={filterPillVariants}
            animate={activeFilter === filter.key ? 'active' : 'inactive'}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(filter.key)}
            className={`r58-meal-pill shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
              activeFilter === filter.key
                ? `bg-gradient-to-r ${filter.gradient} text-white border-transparent shadow-md`
                : 'bg-card text-muted-foreground border-border hover:border-primary/30'
            }`}
          >
            <span className="text-sm">{filter.emoji}</span>
            <span>{filter.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Time Recommendation Banner */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className={`r58-meal-time-banner mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${
          activeFilterConfig.gradient
        } bg-opacity-10`}
        style={{
          background: `linear-gradient(135deg, rgba(16,185,129,0.06), rgba(245,158,11,0.06))`,
        }}
      >
        <span className="text-lg">{timeEmoji}</span>
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-foreground">
            Perfeito para {timeOfDay}
          </p>
          <p className="text-[9px] text-muted-foreground">
            Sugestões baseadas no horário atual
          </p>
        </div>
        <TrendingUp className="h-4 w-4 text-primary" />
      </motion.div>

      {/* Meal Cards Horizontal Scroll */}
      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory">
          {Array.from({ length: 6 }).map((_, i) => (
            <MealCardSkeleton key={i} />
          ))}
        </div>
      ) : mealItems.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          ref={scrollRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory"
        >
          {mealItems.map((item, idx) => (
            <MealCard
              key={item.product.id}
              item={item}
              index={idx}
              onAddToCart={handleAddToCart}
            />
          ))}
        </motion.div>
      )}
    </section>
  )
}

/* ── Simple hash helper ── */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return hash
}
