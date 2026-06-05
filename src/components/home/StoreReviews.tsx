'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare, ChevronRight, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cachedFetch } from '@/lib/api-cache'
import { useAppStore } from '@/store/useAppStore'
import { InteractiveStars } from '@/components/store/InteractiveStars'

/* ── Review types ── */
interface ReviewData {
  id: string
  userName: string
  userInitial: string
  storeName: string
  rating: number
  text: string
  timeAgo: string
  isHighRated: boolean
}

interface RatingBreakdown {
  stars: number
  count: number
  percentage: number
}

/* ── Fallback mock reviews ── */
const FALLBACK_REVIEWS: ReviewData[] = [
  {
    id: 'r1',
    userName: 'Maria Silva',
    userInitial: 'M',
    storeName: 'Açaí da Boa',
    rating: 5,
    text: 'Melhor açaí da cidade! Sempre fresquinho e com muitas frutas. Entrega super rápida.',
    timeAgo: '2h atrás',
    isHighRated: true,
  },
  {
    id: 'r2',
    userName: 'João Santos',
    userInitial: 'J',
    storeName: 'Padaria Pão Quente',
    rating: 4.8,
    text: 'Pão sempre quentinho saindo do forno. Os doces são maravilhosos, especialmente o bolo de cenoura!',
    timeAgo: '5h atrás',
    isHighRated: true,
  },
  {
    id: 'r3',
    userName: 'Ana Costa',
    userInitial: 'A',
    storeName: 'Mercado do Zé',
    rating: 4.5,
    text: 'Boa variedade de produtos e preços justos. Entrega no horário. Recomendo para compras do mês.',
    timeAgo: '1 dia',
    isHighRated: true,
  },
  {
    id: 'r4',
    userName: 'Carlos Oliveira',
    userInitial: 'C',
    storeName: 'Salão da Bella',
    rating: 4.9,
    text: 'Atendimento impecável e resultado maravilhoso. Melhor salão de Dom Eliseu sem dúvida!',
    timeAgo: '1 dia',
    isHighRated: true,
  },
  {
    id: 'r5',
    userName: 'Fernanda Lima',
    userInitial: 'F',
    storeName: 'Pet Shop Amigo Fiel',
    rating: 4.7,
    text: 'Meu dog amou o banho e tosa! Equipe muito carinhosa. Voltarei sempre.',
    timeAgo: '2 dias',
    isHighRated: true,
  },
  {
    id: 'r6',
    userName: 'Ricardo Mendes',
    userInitial: 'R',
    storeName: 'Farmácia Vida',
    rating: 4.6,
    text: 'Entrega rápida e produtos com ótimo preço. Achei tudo que precisava sem sair de casa.',
    timeAgo: '3 dias',
    isHighRated: true,
  },
]

/* ── Gradient rings for avatars ── */
const avatarGradients = [
  'from-pink-500 to-rose-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-cyan-500 to-sky-500',
  'from-lime-500 to-green-500',
]

/* ── Animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

const starFillVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 20,
      delay: 0.3 + i * 0.06,
    },
  }),
}

const ratingBarVariants = {
  hidden: { scaleX: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 18,
      delay: 0.4 + i * 0.08,
    },
  }),
}

/* ── Animated star component ── */
function AnimatedStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating)
        return (
          <motion.div
            key={star}
            custom={star}
            variants={starFillVariants}
            initial="hidden"
            animate="visible"
          >
            <Star
              className={`h-3.5 w-3.5 ${
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

/* ── Shimmer skeleton ── */
function ReviewsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-full max-w-[280px]" />
              <Skeleton className="h-3 w-3/4 max-w-[200px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Rating breakdown mini bar chart ── */
function RatingBreakdownChart({ reviews }: { reviews: ReviewData[] }) {
  const breakdown: RatingBreakdown[] = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    reviews.forEach((r) => {
      const starIdx = Math.min(Math.round(r.rating) - 1, 4)
      if (starIdx >= 0) counts[starIdx]++
    })
    const total = reviews.length || 1
    return [5, 4, 3, 2, 1].map((stars, idx) => ({
      stars,
      count: counts[4 - idx],
      percentage: Math.round((counts[4 - idx] / total) * 100),
    }))
  }, [reviews])

  return (
    <div className="space-y-1.5">
      {breakdown.map((item, idx) => (
        <div key={item.stars} className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground w-3 text-right">
            {item.stars}
          </span>
          <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              custom={idx}
              variants={ratingBarVariants}
              initial="hidden"
              animate="visible"
              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
              style={{ width: `${item.percentage}%`, transformOrigin: 'left' }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground w-5 text-right">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Animated counter hook ── */
function useAnimatedCounter(target: number, duration = 1200): number {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let start = 0
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * target * 10) / 10
      setCount(start)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return count
}

/* ── Main component ── */
export function StoreReviews() {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const { navigate } = useAppStore()

  useEffect(() => {
    let cancelled = false
    cachedFetch('/api/reviews?limit=6')
      .then((data) => {
        if (cancelled) return
        const apiReviews = data?.reviews || []
        if (apiReviews.length > 0) {
          setReviews(
            apiReviews.map((r: Record<string, unknown>, i: number) => ({
              id: (r.id as string) || `r-${i}`,
              userName: (r.userName as string) || 'Cliente',
              userInitial: ((r.userName as string) || 'C')[0].toUpperCase(),
              storeName: (r.storeName as string) || 'Loja',
              rating: (r.rating as number) || 4.5,
              text: (r.text as string) || 'Ótimo atendimento e produtos!',
              timeAgo: (r.timeAgo as string) || 'Hoje',
              isHighRated: ((r.rating as number) || 4.5) >= 4.5,
            }))
          )
        } else {
          setReviews(FALLBACK_REVIEWS)
        }
      })
      .catch(() => {
        if (!cancelled) setReviews(FALLBACK_REVIEWS)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const averageRating = useMemo(
    () =>
      reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : 0,
    [reviews]
  )

  const totalReviews = reviews.length
  const animatedRating = useAnimatedCounter(averageRating, 1400)

  const displayReviews = reviews.slice(0, 6)

  return (
    <section className="w-full r62-card-lift">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
          >
            <Star className="h-4 w-4 text-white fill-white" />
          </motion.div>
          <div>
            <h2 className="text-base sm:text-lg font-bold r62-heading-gradient">Avaliações de Lojas</h2>
            <p className="text-[11px] text-muted-foreground">O que os clientes dizem</p>
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

      {/* Overall rating summary */}
      <AnimatePresence>
        {!loading && reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200, damping: 20 }}
            className="mb-4 p-4 rounded-2xl border border-border/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20"
          >
            <div className="flex items-center gap-6">
              {/* Average rating with InteractiveStars */}
              <div className="flex flex-col items-center">
                <motion.span
                  key={animatedRating}
                  className="text-3xl font-extrabold text-amber-500"
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                >
                  {animatedRating.toFixed(1)}
                </motion.span>
                <InteractiveStars
                  rating={averageRating}
                  totalReviews={totalReviews}
                  interactive={false}
                  size="sm"
                  showCount={false}
                />
                <span className="text-[10px] text-muted-foreground mt-1">
                  {totalReviews} avaliações
                </span>
              </div>

              {/* Rating breakdown */}
              <div className="flex-1 max-w-[180px]">
                <RatingBreakdownChart reviews={reviews} />
              </div>

              {/* Quick stats */}
              <div className="hidden sm:flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600">
                    {reviews.filter((r) => r.isHighRated).length} avaliações 4.5+
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary/60" />
                  <span className="text-[10px] text-muted-foreground">
                    {totalReviews} comentários
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {loading && <ReviewsSkeleton />}

      {/* Review cards */}
      {!loading && displayReviews.length > 0 && (
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayReviews.map((review, index) => {
            const gradientRing = avatarGradients[index % avatarGradients.length]
            return (
              <motion.div
                key={review.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: '0 12px 32px -8px rgba(0,0,0,0.12)',
                }}
                transition={{ type: 'spring' as const, stiffness: 320, damping: 24 }}
              >
                <Card
                  className={`border-border/50 overflow-hidden transition-colors group ${
                    review.isHighRated
                      ? 'hover:border-amber-400/30'
                      : 'hover:border-primary/20'
                  }`}
                >
                  <CardContent className="p-4 relative">
                    {/* Gradient accent for high-rated */}
                    {review.isHighRated && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500 rounded-r" />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Avatar with gradient ring */}
                      <div className="relative shrink-0">
                        <div
                          className={`absolute -inset-[2px] rounded-full bg-gradient-to-br ${gradientRing} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        />
                        <div
                          className={`relative h-10 w-10 rounded-full bg-gradient-to-br ${gradientRing} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
                        >
                          {review.userInitial}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name and store */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">{review.userName}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            sobre{' '}
                            <span className="text-primary font-semibold">
                              {review.storeName}
                            </span>
                          </span>
                        </div>

                        {/* Stars and time */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <AnimatedStars rating={review.rating} />
                          <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" />
                            {review.timeAgo}
                          </div>
                        </div>

                        {/* Review text */}
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {review.text}
                        </p>

                        {/* High-rated badge */}
                        {review.isHighRated && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.5 + index * 0.05,
                              type: 'spring' as const,
                              stiffness: 300,
                              damping: 18,
                            }}
                            className="mt-2 inline-flex"
                          >
                            <Badge
                              variant="secondary"
                              className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold gap-0.5"
                            >
                              <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                              Avaliação destacada
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </section>
  )
}
