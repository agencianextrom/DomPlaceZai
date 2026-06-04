'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface SocialProofBadgesProps {
  rating?: number
  totalReviews?: number
  soldCount?: number
  productName?: string
  productId?: string
  variant?: 'card' | 'detail'
  product?: { stock?: number; totalReviews?: number; name?: string }
}

// Generate a deterministic but varied "last purchase" time (1-15 min)
function getLastPurchaseTime(seed?: string): number {
  const s = seed ? seed.charCodeAt(0) + seed.length : Date.now()
  return (s % 15) + 1
}

// Generate deterministic "currently viewing" count (3-25)
function getViewingCount(seed?: string): number {
  const s = seed ? seed.charCodeAt(0) * 5 + seed.length * 11 : Date.now()
  return (s % 23) + 3
}

export function SocialProofBadges({
  rating,
  totalReviews: totalReviewsProp,
  soldCount: soldCountProp,
  productName,
  productId,
  variant = 'card',
  product,
}: SocialProofBadgesProps) {
  const [visibleIndex, setVisibleIndex] = useState(0)

  // Merge props for backward compat
  const totalReviews = totalReviewsProp ?? product?.totalReviews ?? 0
  const soldCount = soldCountProp ?? Math.max(totalReviews, 5)
  const name = productName ?? product?.name ?? ''
  const seed = productId ?? name

  const lastPurchaseMin = useMemo(() => getLastPurchaseTime(seed), [seed])
  const viewingCount = useMemo(() => getViewingCount(seed), [seed])

  const badges = useMemo(() => {
    const list: { id: string; text: string; color: string; bg: string }[] = [
      {
        id: 'last-purchase',
        text: `Última compra: há ${lastPurchaseMin} min`,
        color: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200/60 dark:border-emerald-700/40',
      },
      {
        id: 'bought',
        text: `${soldCount >= 5 ? soldCount : 5} pessoas compraram`,
        color: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200/60 dark:border-amber-700/40',
      },
      {
        id: 'viewing',
        text: `🔥 ${viewingCount} visualizando`,
        color: 'text-orange-700 dark:text-orange-300',
        bg: 'bg-orange-100 dark:bg-orange-900/30 border-orange-200/60 dark:border-orange-700/40',
      },
    ]

    if (totalReviews > 10) {
      list.push({
        id: 'recommend',
        text: '98% recomendam',
        color: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200/60 dark:border-emerald-700/40',
      })
    }

    return list
  }, [lastPurchaseMin, soldCount, viewingCount, totalReviews])

  // Cycle through badges in card mode
  useEffect(() => {
    if (variant !== 'card') return
    const interval = setInterval(() => {
      setVisibleIndex(prev => (prev + 1) % badges.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [variant, badges.length])

  if (variant === 'card') {
    // Single badge cycling for card view
    const badge = badges[visibleIndex]
    return (
      <div className="mt-1.5 h-[18px] overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={badge.id}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`absolute inset-x-0 top-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${badge.color} ${badge.bg}`}
          >
            <span className="truncate">{badge.text}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // Detail view — show all badges with staggered entrance
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap gap-2 mt-3"
    >
      {badges.map((badge, i) => {
        const isBoughtBadge = badge.id === 'bought'
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={isBoughtBadge
              ? { opacity: 1, scale: [1, 1.04, 1], y: 0 }
              : { opacity: 1, scale: 1, y: 0 }
            }
            transition={{
              delay: 0.2 + i * 0.08,
              type: 'spring',
              stiffness: 400,
              damping: 25,
              ...(isBoughtBadge ? { scale: { duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' } } : {}),
            }}
            whileHover={{ scale: 1.05, y: -1 }}
          >
            <Badge
              variant="outline"
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badge.color} ${badge.bg} cursor-default transition-shadow hover:shadow-sm ${isBoughtBadge ? 'ring-1 ring-amber-300/40 dark:ring-amber-700/40' : ''}`}
            >
              {isBoughtBadge && (
                <motion.span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 mr-1"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              {badge.text}
            </Badge>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
