'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  TrendingUp,
  ChevronRight,
  Crown,
  MessageSquare,
  Award,
  Store,
  Sparkles,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cachedFetch } from '@/lib/api-cache'
import { useAppStore, type StoreData } from '@/store/useAppStore'

/* ── Types ── */
interface StoreWithRating extends StoreData {
  ratingDistribution?: number[] // [5star, 4star, 3star, 2star, 1star] counts
}

/* ── Fallback data ── */
const FALLBACK_STORES: StoreWithRating[] = [
  {
    id: 's1', name: 'Mercado do Zé', slug: 'mercado-do-ze', description: 'O melhor mercado de Dom Eliseu com produtos frescos e preços justos.',
    category: 'FOOD', logo: '/images/grocery.jpg', coverImage: '/images/grocery.jpg', phone: '(91) 99999-0001',
    whatsapp: '(91) 99999-0001', address: 'Rua Principal, 123', neighborhood: 'Centro', city: 'Dom Eliseu',
    state: 'PA', deliveryFee: 5.00, freeDeliveryAbove: 50, rating: 4.7, totalReviews: 128,
    opensAt: '07:00', closesAt: '21:00', openDays: '1,2,3,4,5,6,7',
    ratingDistribution: [68, 35, 15, 7, 3],
  },
  {
    id: 's2', name: 'Açaí da Boa', slug: 'acai-da-boa', description: 'O mais autêntico açaí paraense, feito com frutas selecionadas da região.',
    category: 'FOOD', logo: '/images/acai.jpg', coverImage: '/images/acai.jpg', phone: '(91) 99999-0002',
    whatsapp: '(91) 99999-0002', address: 'Av. Brasil, 456', neighborhood: 'Centro', city: 'Dom Eliseu',
    state: 'PA', deliveryFee: 3.00, freeDeliveryAbove: 30, rating: 4.9, totalReviews: 256,
    opensAt: '08:00', closesAt: '22:00', openDays: '1,2,3,4,5,6',
    ratingDistribution: [180, 45, 18, 8, 5],
  },
  {
    id: 's3', name: 'Agropecuária São Paulo', slug: 'agropecuaria-sao-paulo', description: 'Tudo para o campo e para a cidade.',
    category: 'AGRICULTURE', logo: '/images/agriculture.jpg', coverImage: '/images/agriculture.jpg',
    phone: '(91) 99999-0003', whatsapp: '(91) 99999-0003', address: 'Rod. PA-279, Km 5',
    neighborhood: 'Zona Rural', city: 'Dom Eliseu', state: 'PA', deliveryFee: 8.00, freeDeliveryAbove: 200,
    rating: 4.5, totalReviews: 67, opensAt: '06:00', closesAt: '18:00', openDays: '1,2,3,4,5,6',
    ratingDistribution: [28, 22, 10, 5, 2],
  },
  {
    id: 's4', name: 'Farmácia Vida', slug: 'farmacia-vida', description: 'Sua saúde em primeiro lugar.',
    category: 'HEALTH', logo: '/images/pharmacy.jpg', coverImage: '/images/pharmacy.jpg',
    phone: '(91) 99999-0004', whatsapp: '(91) 99999-0004', address: 'Rua Pará, 789',
    neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 0, freeDeliveryAbove: null,
    rating: 4.6, totalReviews: 89, opensAt: '07:00', closesAt: '22:00', openDays: '1,2,3,4,5,6,7',
    ratingDistribution: [40, 28, 12, 6, 3],
  },
  {
    id: 's5', name: 'Padaria Pão Quente', slug: 'padaria-pao-quente', description: 'Pão fresquinho todo dia!',
    category: 'FOOD', logo: '/images/bakery.jpg', coverImage: '/images/bakery.jpg',
    phone: '(91) 99999-0005', whatsapp: '(91) 99999-0005', address: 'Rua Amazonas, 321',
    neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 3.00, freeDeliveryAbove: 25,
    rating: 4.8, totalReviews: 198, opensAt: '05:00', closesAt: '20:00', openDays: '1,2,3,4,5,6,7',
    ratingDistribution: [120, 48, 18, 8, 4],
  },
  {
    id: 's7', name: 'Pet Shop Amigo Fiel', slug: 'pet-shop-amigo-fiel', description: 'Tudo para seu melhor amigo.',
    category: 'ANIMALS', logo: '/images/pets.jpg', coverImage: '/images/pets.jpg',
    phone: '(91) 99999-0007', whatsapp: '(91) 99999-0007', address: 'Rua Maranhão, 987',
    neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 4.00, freeDeliveryAbove: 80,
    rating: 4.7, totalReviews: 112, opensAt: '08:00', closesAt: '19:00', openDays: '1,2,3,4,5,6',
    ratingDistribution: [62, 30, 12, 5, 3],
  },
  {
    id: 's8', name: 'Salão da Bella', slug: 'salao-da-bella', description: 'Beleza e bem-estar.',
    category: 'BEAUTY', logo: '/images/beauty.jpg', coverImage: '/images/beauty.jpg',
    phone: '(91) 99999-0008', whatsapp: '(91) 99999-0008', address: 'Rua Ceará, 147',
    neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 0, freeDeliveryAbove: null,
    rating: 4.9, totalReviews: 210, opensAt: '09:00', closesAt: '20:00', openDays: '1,2,3,4,5,6',
    ratingDistribution: [155, 35, 12, 5, 3],
  },
  {
    id: 's6', name: 'Loja do Eletrônico', slug: 'loja-do-eletronico', description: 'Celulares, acessórios e eletrônicos.',
    category: 'ELECTRONICS', logo: '/images/electronics.jpg', coverImage: '/images/electronics.jpg',
    phone: '(91) 99999-0006', whatsapp: '(91) 99999-0006', address: 'Rua Tocantins, 654',
    neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 5.00, freeDeliveryAbove: 100,
    rating: 4.3, totalReviews: 45, opensAt: '08:00', closesAt: '20:00', openDays: '1,2,3,4,5,6',
    ratingDistribution: [15, 14, 9, 5, 2],
  },
]

/* ── Animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 280,
      damping: 22,
    },
  },
}

const starCounterVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (rating: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 18,
      delay: 0.2,
    },
  }),
}

/* r27 counter animation hook */
function useCounterUp(target: number, duration = 1200) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const step = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return displayed
}

const barFillVariants = {
  hidden: { scaleX: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 140,
      damping: 18,
      delay: 0.3 + i * 0.06,
    },
  }),
}

const badgePulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0 0 rgba(245, 158, 11, 0)',
      '0 0 0 4px rgba(245, 158, 11, 0.2)',
      '0 0 0 0 rgba(245, 158, 11, 0)',
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const numberPopVariants = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 20,
      delay: 0.25 + i * 0.04,
    },
  }),
}

/* ── Category labels ── */
const categoryLabels: Record<string, string> = {
  FOOD: 'Alimentação',
  HEALTH: 'Saúde',
  AGRICULTURE: 'Agricultura',
  ELECTRONICS: 'Eletrônicos',
  BEAUTY: 'Beleza',
  ANIMALS: 'Animais',
  FASHION: 'Moda',
  SERVICES: 'Serviços',
}

/* ── Category colors for cards ── */
const categoryColors: Record<string, string> = {
  FOOD: 'from-emerald-500 to-green-600',
  HEALTH: 'from-teal-500 to-cyan-600',
  AGRICULTURE: 'from-lime-500 to-green-600',
  ELECTRONICS: 'from-slate-500 to-gray-600',
  BEAUTY: 'from-rose-500 to-pink-600',
  ANIMALS: 'from-amber-500 to-orange-600',
  FASHION: 'from-violet-500 to-purple-600',
  SERVICES: 'from-sky-500 to-blue-600',
}

/* ── Animated Star Counter ── */
function AnimatedStarCounter({ rating }: { rating: number }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    let start = 0
    const startTime = Date.now()
    const duration = 1200
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * rating * 10) / 10
      setDisplayed(start)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [rating])

  return (
    <motion.div
      custom={rating}
      variants={starCounterVariants}
      initial="hidden"
      animate="visible"
      className="text-2xl font-extrabold text-amber-500"
    >
      {displayed.toFixed(1)}
    </motion.div>
  )
}

/* ── Rating Distribution Bar Chart ── */
function RatingDistribution({ distribution }: { distribution: number[] }) {
  const total = distribution.reduce((sum, c) => sum + c, 0) || 1
  const maxCount = Math.max(...distribution) || 1

  return (
    <div className="space-y-1.5 mt-2">
      {[5, 4, 3, 2, 1].map((stars, idx) => {
        const count = distribution[5 - stars]
        const percentage = Math.round((count / total) * 100)
        const barWidth = Math.max((count / maxCount) * 100, 4) // min 4% width

        return (
          <div key={stars} className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground w-2.5 text-right tabular-nums">
              {stars}
            </span>
            <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400 shrink-0" />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                custom={idx}
                variants={barFillVariants}
                initial="hidden"
                animate="visible"
                className={`h-full rounded-full ${
                  stars >= 4
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                    : stars === 3
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-400'
                      : 'bg-gradient-to-r from-orange-400 to-red-400'
                } r27-stagger-fill`}
                style={{ width: `${barWidth}%`, transformOrigin: 'left' }}
              />
            </div>
            <motion.span
              custom={idx}
              variants={numberPopVariants}
              initial="hidden"
              animate="visible"
              className="text-[9px] text-muted-foreground w-5 text-right tabular-nums"
            >
              {count}
            </motion.span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Top Rated Badge ── */
function TopRatedBadge() {
  return (
    <motion.div
      variants={badgePulseVariants}
      animate="animate"
      className="absolute top-2.5 right-2.5 r27-trophy-wobble"
    >
      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-2 py-0.5 rounded-full shadow-md shadow-amber-400/20 r27-gold-glow">
        <Crown className="h-3 w-3" />
        <span className="text-[9px] font-bold uppercase tracking-wide">Top</span>
      </div>
    </motion.div>
  )
}

/* ── Stars display ── */
function StarsDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.div
          key={star}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring' as const,
            stiffness: 400,
            damping: 18,
            delay: 0.4 + star * 0.1,
          }}
          className="r27-star-fill"
        >
          <Star
            className={`${iconSize} ${
              star <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-muted-foreground/25'
            }`}
          />
        </motion.div>
      ))}
    </div>
  )
}

/* ── Store Rating Card ── */
function StoreRatingCard({
  store,
  index,
  onViewReviews,
}: {
  store: StoreWithRating
  index: number
  onViewReviews: (store: StoreWithRating) => void
}) {
  const isTopRated = store.rating >= 4.5
  const gradient = categoryColors[store.category] || 'from-primary to-emerald-600'
  const initials = store.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const distribution = store.ratingDistribution || [0, 0, 0, 0, 0]

  return (
    <motion.div
      variants={cardVariants}
      custom={index}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 12px 32px -8px rgba(0,0,0,0.12)',
      }}
      transition={{ type: 'spring' as const, stiffness: 320, damping: 24 }}
      className="relative"
    >
      <Card className="border-border/50 overflow-hidden group hover:border-primary/20 transition-colors h-full r27-card-lift">
        <CardContent className="p-4">
          {/* Top rated badge */}
          {isTopRated && <TopRatedBadge />}

          {/* Store header */}
          <div className="flex items-start gap-3">
            {/* Store avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative shrink-0"
            >
              <div
                className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
              >
                {initials}
              </div>
              {/* Online indicator */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background r27-online-ring"
              />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">
                {store.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1.5 py-0 bg-secondary/80 font-medium"
                >
                  {categoryLabels[store.category] || store.category}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {store.neighborhood || store.city}
                </span>
              </div>
            </div>
          </div>

          {/* Rating summary */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex flex-col items-center">
              <AnimatedStarCounter rating={store.rating} />
              <StarsDisplay rating={store.rating} size="md" />
            </div>

            {/* Mini bar chart */}
            <div className="flex-1">
              <RatingDistribution distribution={distribution} />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium">
                {store.totalReviews} avaliações
              </span>
            </div>

            {isTopRated && (
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  Excelente
                </span>
              </div>
            )}

            {store.deliveryFee === 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Entrega grátis
                </span>
              </div>
            )}
          </div>

          {/* View reviews link */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onViewReviews(store)}
            className="w-full mt-3 flex items-center justify-center gap-1.5 text-[11px] text-primary font-semibold hover:underline py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
          >
            Ver Avaliações
            <ArrowUpRight className="h-3 w-3" />
          </motion.button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ── Skeleton Loading ── */
function RatingsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <Skeleton className="h-2 w-2" />
                <Skeleton className="h-2 flex-1" />
                <Skeleton className="h-2 w-4" />
              </div>
            ))}
          </div>
          <Skeleton className="h-7 w-full mt-3 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

/* ── Summary Stats Bar ── */
function SummaryStatsBar({ stores }: { stores: StoreWithRating[] }) {
  const avgRating = useMemo(() => {
    if (stores.length === 0) return 0
    return Math.round(
      (stores.reduce((s, st) => s + st.rating, 0) / stores.length) * 10
    ) / 10
  }, [stores])

  const totalReviews = useMemo(
    () => stores.reduce((s, st) => s + st.totalReviews, 0),
    [stores]
  )

  const topRatedCount = useMemo(
    () => stores.filter((st) => st.rating >= 4.5).length,
    [stores]
  )

  /* r27 counter animation */
  const avgRatingDisplay = useCounterUp(Math.round(avgRating * 10), 1000)
  const totalReviewsDisplay = useCounterUp(totalReviews, 1200)
  const topRatedDisplay = useCounterUp(topRatedCount, 800)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22, delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5"
    >
      {[
        {
          icon: Star,
          label: 'Média Geral',
          value: avgRating.toFixed(1),
          color: 'text-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200/50 dark:border-amber-800/30',
        },
        {
          icon: MessageSquare,
          label: 'Total Avaliações',
          value: totalReviews.toLocaleString('pt-BR'),
          color: 'text-primary',
          bg: 'bg-primary/5',
          border: 'border-primary/10',
        },
        {
          icon: Crown,
          label: 'Lojas Top',
          value: topRatedCount.toString(),
          color: 'text-emerald-500',
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          border: 'border-emerald-200/50 dark:border-emerald-800/30',
        },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring' as const,
            stiffness: 300,
            damping: 22,
            delay: 0.15 + i * 0.06,
          }}
          className={`flex flex-col items-center p-3 rounded-xl ${stat.bg} border ${stat.border}`}
        >
          <stat.icon className={`h-4 w-4 ${stat.color} mb-1`} />
          <span className={`text-lg font-extrabold ${stat.color} r27-counter-animate`}>{i === 0 ? (avgRatingDisplay / 10).toFixed(1) : i === 1 ? totalReviewsDisplay.toLocaleString('pt-BR') : topRatedDisplay.toString()}</span>
          <span className="text-[10px] text-muted-foreground">{stat.label}</span>
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT — StoreRatingsOverview
   ═══════════════════════════════════════════════════ */
export function StoreRatingsOverview() {
  const [stores, setStores] = useState<StoreWithRating[]>([])
  const [loading, setLoading] = useState(true)
  const { navigate, selectStore } = useAppStore()

  useEffect(() => {
    let cancelled = false
    const fetchStores = async () => {
      setLoading(true)
      try {
        const data = await cachedFetch('/api/stores?limit=20')
        if (!cancelled && data?.stores) {
          const enriched = (data.stores as StoreData[]).map((store) => {
            // Generate synthetic distribution based on rating
            const total = store.totalReviews || 50
            const baseRating = store.rating || 4.0
            const dist = generateDistribution(baseRating, total)
            return { ...store, ratingDistribution: dist }
          })
          setStores(enriched)
        } else if (!cancelled) {
          setStores(FALLBACK_STORES)
        }
      } catch {
        if (!cancelled) setStores(FALLBACK_STORES)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStores()
    return () => { cancelled = true }
  }, [])

  // Sort stores by rating (highest first)
  const sortedStores = useMemo(
    () => [...stores].sort((a, b) => b.rating - a.rating),
    [stores]
  )

  const handleViewReviews = (store: StoreWithRating) => {
    selectStore(store)
    navigate('store')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="w-full r62-card-lift">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-400/20"
          >
            <BarChart3 className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-1.5 r62-heading-gradient">
              <span className="r27-shimmer-text">Avaliações das Lojas</span>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
              </motion.div>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Veja como os clientes avaliam cada loja
            </p>
          </div>
        </div>

        <motion.div whileTap={{ scale: 0.93 }}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-primary"
            onClick={() => navigate('stores')}
          >
            Ver todas
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </div>

      {/* Summary stats */}
      {!loading && stores.length > 0 && (
        <SummaryStatsBar stores={sortedStores} />
      )}

      {/* Loading skeleton */}
      {loading && <RatingsSkeleton />}

      {/* Store cards grid */}
      {!loading && sortedStores.length > 0 && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedStores.map((store, index) => (
            <StoreRatingCard
              key={store.id}
              store={store}
              index={index}
              onViewReviews={handleViewReviews}
            />
          ))}
        </motion.div>
      )}
    </section>
  )
}

/* ── Helper: generate synthetic rating distribution ── */
function generateDistribution(rating: number, total: number): number[] {
  const distribution = [0, 0, 0, 0, 0] // [5, 4, 3, 2, 1]

  for (let i = 0; i < total; i++) {
    // Generate rating based on store's average with some randomness
    const random = Math.random()
    const diff = rating - 3 // How far above average
    const threshold5 = 0.5 + diff * 0.15
    const threshold4 = threshold5 + 0.25 + diff * 0.1
    const threshold3 = threshold4 + 0.15
    const threshold2 = threshold3 + 0.06

    if (random < threshold5) distribution[0]++
    else if (random < threshold4) distribution[1]++
    else if (random < threshold3) distribution[2]++
    else if (random < threshold2) distribution[3]++
    else distribution[4]++
  }

  return distribution
}
