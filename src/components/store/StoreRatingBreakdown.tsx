'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp, ThumbsUp, Minus, ThumbsDown, BarChart3 } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import { Card, CardContent } from '@/components/ui/card'

interface StoreRatingBreakdownProps {
  rating: number
  totalReviews: number
  storeName?: string
}

// Mock distribution data (in real app, this would come from API)
function generateMockDistribution(rating: number, total: number): { stars: number; count: number; percentage: number }[] {
  const basePercentages: Record<number, number> = {
    5: Math.round(55 + rating * 3),
    4: Math.round(20 + (5 - rating) * 2),
    3: Math.round(8 + (5 - rating) * 3),
    2: Math.round(3 + (5 - rating) * 1.5),
    1: Math.round(2 + (5 - rating) * 2),
  }

  // Normalize to sum to 100
  const rawTotal = Object.values(basePercentages).reduce((a, b) => a + b, 0)
  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const percentage = Math.round((basePercentages[stars] / rawTotal) * 100)
    const count = Math.round((percentage / 100) * total)
    return { stars, count, percentage }
  })

  // Adjust last one to match total
  const currentTotal = distribution.reduce((s, d) => s + d.count, 0)
  distribution[4].count += total - currentTotal

  return distribution
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

export function StoreRatingBreakdown({ rating, totalReviews, storeName }: StoreRatingBreakdownProps) {
  const [animatedIn, setAnimatedIn] = useState(false)
  const distribution = generateMockDistribution(rating, totalReviews)

  // Sentiment analysis mock
  const positive = distribution.filter(d => d.stars >= 4).reduce((s, d) => s + d.percentage, 0)
  const neutral = distribution.filter(d => d.stars === 3).reduce((s, d) => s + d.percentage, 0)
  const negative = distribution.filter(d => d.stars <= 2).reduce((s, d) => s + d.percentage, 0)

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
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative"
                  >
                    <span className="text-5xl font-black bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent">
                      {rating.toFixed(1)}
                    </span>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                      className="absolute -top-1 -right-3"
                    >
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
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

              {/* Right - Bar chart */}
              <div className="flex-1 min-w-0 space-y-2.5">
                {distribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-8 shrink-0">
                      <span className="text-xs font-bold text-foreground">{item.stars}</span>
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: animatedIn ? `${item.percentage}%` : 0 }}
                        transition={{ delay: 0.3 + (5 - item.stars) * 0.12, duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-9 text-right shrink-0 tabular-nums">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sentiment indicators */}
          <div className="px-5 pb-5">
            <div className="flex items-center gap-1.5 mb-3">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Análise de sentimento
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
                  {/* Mini progress bar */}
                  <div className="mt-1.5 h-1 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${sentiment.barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${sentiment.value}%` }}
                      transition={{ delay: 0.8 + idx * 0.1, duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 opacity-30" />
        </CardContent>
      </Card>
    </motion.div>
  )
}
