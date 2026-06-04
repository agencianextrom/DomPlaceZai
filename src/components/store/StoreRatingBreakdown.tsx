'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, ThumbsUp, Minus, ThumbsDown, BarChart3 } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface RatingDistributionItem {
  rating: number
  count: number
}

interface StoreRatingBreakdownProps {
  rating: number
  totalReviews: number
  storeName?: string
  ratingDistribution?: RatingDistributionItem[]
}

// Stagger container for bars
const barStaggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

// Individual bar entrance variant
const barEntranceVariant = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
    },
  },
}

function AnimatedCounter({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    let start = 0
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * target)
      setCount(start)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(target)
        setIsDone(true)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return (
    <motion.span
      animate={isDone ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {count}
    </motion.span>
  )
}

export function StoreRatingBreakdown({ rating, totalReviews, storeName, ratingDistribution }: StoreRatingBreakdownProps) {
  const [animatedIn, setAnimatedIn] = useState(false)

  // Build distribution from real API data or generate from totalReviews as fallback
  const distribution = ratingDistribution && ratingDistribution.length > 0
    ? [5, 4, 3, 2, 1].map((star) => {
        const item = ratingDistribution.find((d) => d.rating === star)
        const count = item?.count || 0
        const totalCount = ratingDistribution.reduce((s, d) => s + d.count, 0)
        const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
        return { stars: star, count, percentage }
      })
    : totalReviews > 0
      ? generateFallbackDistribution(rating, totalReviews)
      : []

  // Simple sentiment from real star distribution
  const total = distribution.reduce((s, d) => s + d.count, 0)
  const positive = total > 0 ? distribution.filter(d => d.stars >= 4).reduce((s, d) => s + d.percentage, 0) : 0
  const neutral = total > 0 ? distribution.filter(d => d.stars === 3).reduce((s, d) => s + d.percentage, 0) : 0
  const negative = total > 0 ? distribution.filter(d => d.stars <= 2).reduce((s, d) => s + d.percentage, 0) : 0

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedIn(true), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200/50 dark:border-amber-800/30 overflow-hidden">
        <CardContent className="p-0">
          {/* Header with overall rating */}
          <div className="p-5 pb-4">
            <div className="flex items-start gap-5">
              {/* Left - Big rating number */}
              <div className="text-center shrink-0">
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' as const, stiffness: 300, damping: 20 }}
                    className="relative"
                  >
                    <span className="text-5xl font-black bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent">
                      {rating.toFixed(1)}
                    </span>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring' as const }}
                      className="absolute -top-1 -right-3"
                    >
                      {/* Star with glow animation */}
                      <motion.span
                        className="srb-star-glow inline-block"
                        animate={{
                          filter: [
                            'drop-shadow(0 0 2px rgba(245,158,11,0.4))',
                            'drop-shadow(0 0 8px rgba(245,158,11,0.8))',
                            'drop-shadow(0 0 2px rgba(245,158,11,0.4))',
                          ],
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      </motion.span>
                    </motion.div>
                  </motion.div>
                </div>
                <div className="mt-2">
                  <StarRating rating={rating} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  <AnimatedCounter target={totalReviews} /> avaliações
                </p>
              </div>

              {/* Right - Bar chart with staggered entrance */}
              <div className="flex-1 min-w-0 space-y-2.5">
                {distribution.length > 0 ? (
                  <motion.div
                    className="space-y-2.5"
                    variants={barStaggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {distribution.map((item) => (
                      <motion.div
                        key={item.stars}
                        variants={barEntranceVariant}
                        className="flex items-center gap-2 group/row relative"
                      >
                        <div className="flex items-center gap-1 w-8 shrink-0">
                          <span className="text-xs font-bold text-foreground">{item.stars}</span>
                          <motion.span
                            className="srb-star-glow inline-block"
                            animate={{
                              filter: [
                                'drop-shadow(0 0 1px rgba(245,158,11,0.3))',
                                'drop-shadow(0 0 4px rgba(245,158,11,0.6))',
                                'drop-shadow(0 0 1px rgba(245,158,11,0.3))',
                              ],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: (5 - item.stars) * 0.3 }}
                          >
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          </motion.span>
                        </div>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 srb-bar-fill relative overflow-hidden"
                            initial={{ width: 0 }}
                            animate={{ width: animatedIn ? `${item.percentage}%` : 0 }}
                            transition={{ delay: 0.3 + (5 - item.stars) * 0.1, duration: 0.7, ease: 'easeOut' }}
                          >
                            {/* Shimmer overlay on the fill bar */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent srb-bar-entrance" />
                          </motion.div>
                        </div>
                        <span className="text-[10px] text-muted-foreground w-9 text-right shrink-0 tabular-nums">
                          {item.percentage}%
                        </span>

                        {/* Tooltip on hover showing exact count */}
                        <motion.div
                          className="srb-tooltip absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-semibold px-2 py-0.5 rounded-md opacity-0 group-hover/row:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
                          initial={{ y: 4, opacity: 0 }}
                          whileHover={{ y: 0, opacity: 1 }}
                        >
                          {item.count} avaliações
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Nenhuma avaliação ainda
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sentiment indicators (based on real star distribution) */}
          {total > 0 && (
            <div className="px-5 pb-5">
              <div className="flex items-center gap-1.5 mb-3">
                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Distribuição de notas
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: 'Positivo',
                    value: positive,
                    icon: ThumbsUp,
                    color: 'text-emerald-600 dark:text-emerald-400',
                    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                    barColor: 'from-emerald-400 to-emerald-500',
                    borderColor: 'border-emerald-200/50 dark:border-emerald-800/30',
                  },
                  {
                    label: 'Neutro',
                    value: neutral,
                    icon: Minus,
                    color: 'text-amber-600 dark:text-amber-400',
                    bg: 'bg-amber-50 dark:bg-amber-900/20',
                    barColor: 'from-amber-400 to-amber-500',
                    borderColor: 'border-amber-200/50 dark:border-amber-800/30',
                  },
                  {
                    label: 'Negativo',
                    value: negative,
                    icon: ThumbsDown,
                    color: 'text-red-600 dark:text-red-400',
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    barColor: 'from-red-400 to-red-500',
                    borderColor: 'border-red-200/50 dark:border-red-800/30',
                  },
                ].map((sentiment, idx) => (
                  <motion.div
                    key={sentiment.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className={`rounded-xl p-3 text-center ${sentiment.bg} border ${sentiment.borderColor}`}
                  >
                    <sentiment.icon className={`h-4 w-4 mx-auto mb-1 ${sentiment.color}`} />
                    <p className="text-lg font-bold">{sentiment.value}%</p>
                    <p className="text-[9px] text-muted-foreground">{sentiment.label}</p>
                    {/* Mini progress bar with shimmer */}
                    <div className="mt-1.5 h-1 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${sentiment.barColor} srb-bar-fill relative overflow-hidden`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(sentiment.value, 100)}%` }}
                        transition={{ delay: 0.8 + idx * 0.1, duration: 0.8, ease: 'easeOut' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent srb-bar-entrance" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom accent */}
          <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 opacity-30" />
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Simple fallback distribution when no API data is available
function generateFallbackDistribution(rating: number, total: number): { stars: number; count: number; percentage: number }[] {
  if (total === 0) return []

  const raw: Record<number, number> = {
    5: Math.round(55 + rating * 3),
    4: Math.round(20 + (5 - rating) * 2),
    3: Math.round(8 + (5 - rating) * 3),
    2: Math.round(3 + (5 - rating) * 1.5),
    1: Math.round(2 + (5 - rating) * 2),
  }

  const rawTotal = Object.values(raw).reduce((a, b) => a + b, 0)
  return [5, 4, 3, 2, 1].map(stars => {
    const percentage = Math.round((raw[stars] / rawTotal) * 100)
    const count = Math.round((percentage / 100) * total)
    return { stars, count, percentage }
  })
}
