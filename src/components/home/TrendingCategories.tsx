'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cachedFetch } from '@/lib/api-cache'

/* ───────────────────────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────────────────────── */

interface TrendingCategory {
  id: string
  name: string
  emoji: string
  productCount: number
  growthPercent: number
  isTrending: boolean
  sparklineData: number[]
  gradientFrom: string
  gradientTo: string
  iconBg: string
}

/* ───────────────────────────────────────────────────────────────
   Sparkline SVG component
   ─────────────────────────────────────────────────────────────── */

const sparklineEndPulse = {
  animate: {
    r: [2.5, 4, 2.5],
    opacity: [1, 0.5, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.4 },
  },
}

function SparklineChart({ data, color = '#10b981', width = 80, height = 32 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 2
  const usableH = height - padding * 2
  const usableW = width - padding * 2

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * usableW
    const y = padding + usableH - ((val - min) / range) * usableH
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  // Area fill path (close at bottom)
  const areaD = `${pathD} L ${padding + usableW},${height - padding} L ${padding},${height - padding} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <motion.path
        d={areaD}
        fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
      {/* Line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
      />
      {/* End dot with pulse */}
      <motion.circle
        cx={padding + usableW}
        cy={padding + usableH - ((data[data.length - 1] - min) / range) * usableH}
        r="2.5"
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        variants={sparklineEndPulse}
        transition={{ delay: 1.2, type: 'spring' as const, stiffness: 400, damping: 20 }}
      />
    </svg>
  )
}

/* ───────────────────────────────────────────────────────────────
   Fire animation component
   ─────────────────────────────────────────────────────────────── */

function FireBadge() {
  return (
    <motion.div
      animate={{
        y: [0, -2, 0],
        scale: [1, 1.05, 1],
        rotate: [-2, 2, -1, 1, -2],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Badge className="fire-badge-wobble bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-[8px] px-1.5 py-0 font-bold gap-0.5 shadow-sm">
        <Flame className="h-2.5 w-2.5" />
        Em alta
      </Badge>
    </motion.div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Shimmer text effect
   ─────────────────────────────────────────────────────────────── */

function ShimmerText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block ${className || ''}`}>
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
      />
    </span>
  )
}

/* ───────────────────────────────────────────────────────────────
   Category card animation variants
   ─────────────────────────────────────────────────────────────── */

const categoryCardVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      delay: i * 0.07,
      type: 'spring' as const,
      stiffness: 280,
      damping: 22,
    },
  }),
}

/* ───────────────────────────────────────────────────────────────
   Mock categories fallback
   ─────────────────────────────────────────────────────────────── */

const mockCategories: TrendingCategory[] = [
  {
    id: 'alimentacao',
    name: 'Alimentação',
    emoji: '🍚',
    productCount: 2847,
    growthPercent: 12.5,
    isTrending: true,
    sparklineData: [30, 35, 28, 42, 50, 48, 55, 62, 58, 70, 68, 75],
    gradientFrom: 'from-orange-400',
    gradientTo: 'to-red-500',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    id: 'beleza',
    name: 'Beleza',
    emoji: '💅',
    productCount: 1563,
    growthPercent: 23.8,
    isTrending: true,
    sparklineData: [20, 25, 30, 28, 38, 45, 52, 60, 58, 72, 80, 88],
    gradientFrom: 'from-pink-400',
    gradientTo: 'to-rose-500',
    iconBg: 'bg-pink-100 dark:bg-pink-900/30',
  },
  {
    id: 'eletronicos',
    name: 'Eletrônicos',
    emoji: '📱',
    productCount: 982,
    growthPercent: 8.2,
    isTrending: false,
    sparklineData: [40, 42, 38, 45, 43, 48, 46, 50, 52, 49, 54, 56],
    gradientFrom: 'from-cyan-400',
    gradientTo: 'to-teal-500',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  {
    id: 'saude',
    name: 'Saúde',
    emoji: '💊',
    productCount: 745,
    growthPercent: 31.4,
    isTrending: true,
    sparklineData: [15, 20, 25, 30, 28, 40, 55, 65, 72, 80, 90, 98],
    gradientFrom: 'from-emerald-400',
    gradientTo: 'to-green-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    id: 'agricultura',
    name: 'Agricultura',
    emoji: '🌿',
    productCount: 523,
    growthPercent: 5.6,
    isTrending: false,
    sparklineData: [50, 52, 55, 53, 56, 58, 60, 57, 62, 63, 65, 66],
    gradientFrom: 'from-lime-400',
    gradientTo: 'to-green-600',
    iconBg: 'bg-lime-100 dark:bg-lime-900/30',
  },
  {
    id: 'pet',
    name: 'Pet',
    emoji: '🐾',
    productCount: 412,
    growthPercent: 18.9,
    isTrending: true,
    sparklineData: [25, 28, 32, 38, 42, 48, 55, 60, 65, 70, 78, 85],
    gradientFrom: 'from-amber-400',
    gradientTo: 'to-yellow-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    id: 'moda',
    name: 'Moda',
    emoji: '👗',
    productCount: 1890,
    growthPercent: 14.3,
    isTrending: false,
    sparklineData: [45, 48, 50, 52, 55, 58, 56, 60, 62, 65, 68, 72],
    gradientFrom: 'from-violet-400',
    gradientTo: 'to-purple-500',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
  },
  {
    id: 'servicos',
    name: 'Serviços',
    emoji: '🔧',
    productCount: 320,
    growthPercent: 9.7,
    isTrending: false,
    sparklineData: [30, 32, 35, 33, 38, 40, 42, 45, 44, 48, 50, 52],
    gradientFrom: 'from-slate-400',
    gradientTo: 'to-gray-500',
    iconBg: 'bg-slate-100 dark:bg-slate-900/30',
  },
]

/* ───────────────────────────────────────────────────────────────
   Skeleton loader
   ─────────────────────────────────────────────────────────────── */

function TrendingSkeleton() {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[150px] rounded-xl border p-3 space-y-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-6 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Main component: TrendingCategories
   ─────────────────────────────────────────────────────────────── */

export function TrendingCategories() {
  const [categories, setCategories] = useState<TrendingCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Fetch categories from API and aggregate, fallback to mock
  const fetchCategories = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setIsLoading(true)
    setError(null)

    try {
      const data = await cachedFetch('/api/products?limit=100')
      const products = data.products || data || []

      if (Array.isArray(products) && products.length > 0) {
        // Aggregate by category
        const categoryMap = new Map<string, { count: number; names: Set<string> }>()
        products.forEach((p: Record<string, unknown>) => {
          const cat = (p.category as string) || 'OUTRO'
          const current = categoryMap.get(cat) || { count: 0, names: new Set<string>() }
          current.count++
          if (p.name) current.names.add(p.name as string)
          categoryMap.set(cat, current)
        })

        // Build trending categories from aggregated data
        const aggregated: TrendingCategory[] = mockCategories.map((mock) => {
          const found = categoryMap.get(mock.id.toUpperCase())
          const count = found ? found.count : mock.productCount
          return {
            ...mock,
            productCount: count,
          }
        })

        setCategories(aggregated)
      } else {
        setCategories(mockCategories)
      }
    } catch {
      setCategories(mockCategories)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Scroll detection
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 5)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    handleScroll()
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll, categories])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = 200
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return count.toString()
  }

  // ── Loading state ──
  if (isLoading) return <TrendingSkeleton />

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="relative"
    >
      {/* ── Section header ── */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 18, delay: 0.1 }}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md"
          >
            <TrendingUp className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
              <ShimmerText className="trending-shimmer-header bg-gradient-to-r from-orange-600 via-red-500 to-amber-500 bg-clip-text text-transparent font-bold">
                Tendências
              </ShimmerText>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
              </motion.div>
            </h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Categorias em destaque no momento
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => fetchCategories(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* ── Error state ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 pb-4 text-center"
        >
          <p className="text-xs text-muted-foreground">{error}</p>
        </motion.div>
      )}

      {/* ── Horizontal scroll container ── */}
      <div className="relative group">
        {/* Left scroll button */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scroll('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 min-h-[44px] min-w-[44px] rounded-full bg-white/90 dark:bg-card/90 shadow-lg border border-border/50 flex items-center justify-center hover:bg-white transition-colors hidden sm:flex scroll-chevron-anim"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right scroll button */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scroll('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 min-h-[44px] min-w-[44px] rounded-full bg-white/90 dark:bg-card/90 shadow-lg border border-border/50 flex items-center justify-center hover:bg-white transition-colors hidden sm:flex scroll-chevron-anim"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Cards ── */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2"
        >
          <AnimatePresence>
            {categories.map((category, index) => {
              const sparklineColor = category.growthPercent > 15 ? '#f97316' : category.growthPercent > 10 ? '#10b981' : '#6b7280'

              return (
                <motion.div
                  key={category.id}
                  custom={index}
                  variants={categoryCardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 30px oklch(0.45 0.1 155/0.12)',
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="trending-card-glow shrink-0 w-[150px] sm:w-[165px] rounded-xl border border-border/60 bg-card overflow-hidden cursor-pointer group/card"
                >
                  {/* Gradient top area */}
                  <div className={`relative bg-gradient-to-br ${category.gradientFrom} ${category.gradientTo} px-3 pt-3 pb-5`}>
                    {/* Emoji icon */}
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                      className="h-11 w-11 rounded-xl bg-white/80 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center shadow-sm mb-2"
                    >
                      <span className="text-2xl">{category.emoji}</span>
                    </motion.div>

                    {/* Trending badge */}
                    {category.isTrending && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="absolute top-2.5 right-2.5"
                      >
                        <FireBadge />
                      </motion.div>
                    )}
                  </div>

                  {/* Content area overlapping gradient */}
                  <div className="relative -mt-3 bg-card rounded-t-xl px-3 pt-3 pb-3">
                    {/* Category name */}
                    <h3 className="font-bold text-sm truncate">{category.name}</h3>

                    {/* Product count */}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatCount(category.productCount)} produtos
                    </p>

                    {/* Growth percentage */}
                    <motion.div
                      className="flex items-center gap-1 mt-1.5"
                      animate={
                        category.growthPercent > 20
                          ? { scale: [1, 1.04, 1] }
                          : {}
                      }
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ArrowUpRight
                        className={`h-3 w-3 ${
                          category.growthPercent > 15
                            ? 'text-orange-500'
                            : category.growthPercent > 10
                              ? 'text-emerald-500'
                              : 'text-gray-400'
                        }`}
                      />
                      <span
                        className={`text-xs font-bold ${
                          category.growthPercent > 15
                            ? 'text-orange-600 dark:text-orange-400'
                            : category.growthPercent > 10
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-muted-foreground'
                        }`}
                      >
                        +{category.growthPercent}%
                      </span>
                      <span className="text-[9px] text-muted-foreground">este mês</span>
                    </motion.div>

                    {/* Sparkline chart */}
                    <div className="mt-2 flex justify-end">
                      <SparklineChart
                        data={category.sparklineData}
                        color={sparklineColor}
                        width={80}
                        height={32}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom gradient line ── */}
      <div className="mx-4 h-1 bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 rounded-full opacity-40 overflow-hidden">
        <motion.div
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ['-100%', '400%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
        />
      </div>
    </motion.section>
  )
}
