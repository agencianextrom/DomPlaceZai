'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Clock,
  Flame,
  TrendingUp,
  Target,
  Gift,
  Zap,
  Star,
  Filter,
  CheckCircle2,
  ChevronRight,
  PartyPopper,
  Trophy,
  Lock,
  Unlock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ==================== TYPES ====================

type DealFilter = 'all' | 'trending' | 'ending-soon' | 'most-funded'

interface BackerEntry {
  id: string
  name: string
  avatar: string
  amount: number
  timestamp: number
  isYou?: boolean
}

interface DealTier {
  threshold: number
  label: string
  reward: string
  unlocked: boolean
}

interface CrowdDeal {
  id: string
  title: string
  description: string
  emoji: string
  category: string
  goalAmount: number
  currentAmount: number
  backers: BackerEntry[]
  backersCount: number
  deadline: number // unix timestamp in seconds
  isFeatured: boolean
  isTrending: boolean
  tags: string[]
  tiers: DealTier[]
  isUnlocked: boolean
}

interface TierUnlockNotification {
  id: string
  dealId: string
  dealTitle: string
  tierLabel: string
  reward: string
  timestamp: number
}

// ==================== FILTER LABELS ====================

const FILTER_OPTIONS: { value: DealFilter; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '🎯' },
  { value: 'trending', label: 'Trending', icon: '🔥' },
  { value: 'ending-soon', label: 'Ending Soon', icon: '⏰' },
  { value: 'most-funded', label: 'Most Funded', icon: '💰' },
]

// ==================== AVATAR COLORS ====================

const AVATAR_COLORS = [
  '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
]

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

// ==================== HELPER FUNCTIONS ====================

function formatBRL(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompact(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value}`
}

function getFundingPercentage(deal: CrowdDeal): number {
  return Math.min(100, Math.max(0, (deal.currentAmount / deal.goalAmount) * 100))
}

function getTimeRemaining(deadline: number): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  isExpired: boolean
} {
  const now = Math.floor(Date.now() / 1000)
  const diff = Math.max(0, deadline - now)
  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
    total: diff,
    isExpired: diff <= 0,
  }
}

function getGradientForFunding(pct: number): {
  bg: string
  border: string
  barFrom: string
  barTo: string
  glow: string
} {
  if (pct >= 100) {
    return {
      bg: 'rgba(16, 185, 129, 0.06)',
      border: 'rgba(16, 185, 129, 0.35)',
      barFrom: '#10b981',
      barTo: '#34d399',
      glow: 'rgba(16, 185, 129, 0.25)',
    }
  }
  if (pct >= 75) {
    return {
      bg: 'rgba(59, 130, 246, 0.06)',
      border: 'rgba(59, 130, 246, 0.3)',
      barFrom: '#3b82f6',
      barTo: '#60a5fa',
      glow: 'rgba(59, 130, 246, 0.2)',
    }
  }
  if (pct >= 50) {
    return {
      bg: 'rgba(139, 92, 246, 0.06)',
      border: 'rgba(139, 92, 246, 0.3)',
      barFrom: '#8b5cf6',
      barTo: '#a78bfa',
      glow: 'rgba(139, 92, 246, 0.2)',
    }
  }
  if (pct >= 25) {
    return {
      bg: 'rgba(245, 158, 11, 0.06)',
      border: 'rgba(245, 158, 11, 0.3)',
      barFrom: '#f59e0b',
      barTo: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.2)',
    }
  }
  return {
    bg: 'rgba(107, 114, 128, 0.04)',
    border: 'rgba(107, 114, 128, 0.2)',
    barFrom: '#6b7280',
    barTo: '#9ca3af',
    glow: 'rgba(107, 114, 128, 0.1)',
  }
}

// ==================== MOCK DATA ====================

function createInitialDeals(): CrowdDeal[] {
  const now = Math.floor(Date.now() / 1000)

  const tiers: DealTier[] = [
    { threshold: 25, label: 'Bronze', reward: 'Free shipping coupon', unlocked: false },
    { threshold: 50, label: 'Silver', reward: '10% extra discount', unlocked: false },
    { threshold: 75, label: 'Gold', reward: 'Exclusive accessory bundle', unlocked: false },
    { threshold: 100, label: 'Platinum', reward: 'VIP early access + gift box', unlocked: false },
  ]

  return [
    {
      id: 'cf1',
      title: 'Smart Garden Kit',
      description: 'AI-powered indoor garden with automated watering and LED grow lights.',
      emoji: '🌱',
      category: 'Home & Garden',
      goalAmount: 50000,
      currentAmount: 47250,
      backersCount: 384,
      deadline: now + 2 * 86400 + 5 * 3600 + 42 * 60,
      isFeatured: true,
      isTrending: true,
      tags: ['Smart Home', 'Eco-Friendly'],
      tiers: tiers.map(t => ({ ...t, unlocked: t.threshold <= 94 })),
      isUnlocked: false,
      backers: [
        { id: 'b1', name: 'Sarah M.', avatar: 'S', amount: 150, timestamp: now - 120, isYou: false },
        { id: 'b2', name: 'James K.', avatar: 'J', amount: 200, timestamp: now - 450, isYou: false },
        { id: 'b3', name: 'Ana R.', avatar: 'A', amount: 100, timestamp: now - 900, isYou: false },
        { id: 'b4', name: 'David L.', avatar: 'D', amount: 250, timestamp: now - 1800, isYou: false },
        { id: 'b5', name: 'Mia T.', avatar: 'M', amount: 75, timestamp: now - 3600, isYou: false },
      ],
    },
    {
      id: 'cf2',
      title: 'Solar Power Bank 30K',
      description: 'Ultra-high capacity solar-charged power bank for outdoor adventures.',
      emoji: '☀️',
      category: 'Electronics',
      goalAmount: 30000,
      currentAmount: 19500,
      backersCount: 215,
      deadline: now + 7 * 86400 + 3 * 3600,
      isFeatured: false,
      isTrending: true,
      tags: ['Solar', 'Outdoor'],
      tiers: tiers.map(t => ({ ...t, unlocked: t.threshold <= 65 })),
      isUnlocked: false,
      backers: [
        { id: 'b6', name: 'Tom H.', avatar: 'T', amount: 120, timestamp: now - 200, isYou: false },
        { id: 'b7', name: 'Lisa P.', avatar: 'L', amount: 80, timestamp: now - 600, isYou: false },
        { id: 'b8', name: 'Carlos G.', avatar: 'C', amount: 200, timestamp: now - 1200, isYou: false },
        { id: 'b9', name: 'Emily W.', avatar: 'E', amount: 95, timestamp: now - 2400, isYou: false },
      ],
    },
    {
      id: 'cf3',
      title: 'Artisan Coffee Maker',
      description: 'Hand-crafted pour-over coffee maker with temperature control and grinder.',
      emoji: '☕',
      category: 'Kitchen',
      goalAmount: 25000,
      currentAmount: 25200,
      backersCount: 312,
      deadline: now + 4 * 86400 + 12 * 3600,
      isFeatured: true,
      isTrending: false,
      tags: ['Kitchen', 'Artisan'],
      tiers: tiers.map(t => ({ ...t, unlocked: t.threshold <= 100 })),
      isUnlocked: true,
      backers: [
        { id: 'b10', name: 'Olivia B.', avatar: 'O', amount: 180, timestamp: now - 60, isYou: false },
        { id: 'b11', name: 'Noah S.', avatar: 'N', amount: 110, timestamp: now - 300, isYou: false },
        { id: 'b12', name: 'You', avatar: 'Y', amount: 150, timestamp: now - 800, isYou: true },
        { id: 'b13', name: 'Ava J.', avatar: 'A', amount: 90, timestamp: now - 1500, isYou: false },
        { id: 'b14', name: 'Ethan D.', avatar: 'E', amount: 200, timestamp: now - 2700, isYou: false },
      ],
    },
    {
      id: 'cf4',
      title: 'Bamboo Bike Frame',
      description: 'Sustainable bamboo bicycle frame, lightweight and incredibly durable.',
      emoji: '🚲',
      category: 'Sports',
      goalAmount: 80000,
      currentAmount: 12800,
      backersCount: 67,
      deadline: now + 12 * 86400 + 8 * 3600,
      isFeatured: false,
      isTrending: false,
      tags: ['Eco-Friendly', 'Sports'],
      tiers: tiers.map(t => ({ ...t, unlocked: false })),
      isUnlocked: false,
      backers: [
        { id: 'b15', name: 'Liam R.', avatar: 'L', amount: 500, timestamp: now - 1800, isYou: false },
        { id: 'b16', name: 'Sophia F.', avatar: 'S', amount: 300, timestamp: now - 5400, isYou: false },
        { id: 'b17', name: 'Mason C.', avatar: 'M', amount: 450, timestamp: now - 10800, isYou: false },
      ],
    },
    {
      id: 'cf5',
      title: 'Wireless Earbuds Pro',
      description: 'Premium noise-canceling earbuds with spatial audio and 40hr battery.',
      emoji: '🎧',
      category: 'Electronics',
      goalAmount: 40000,
      currentAmount: 36800,
      backersCount: 428,
      deadline: now + 1 * 86400 + 2 * 3600 + 18 * 60,
      isFeatured: false,
      isTrending: true,
      tags: ['Audio', 'Wireless'],
      tiers: tiers.map(t => ({ ...t, unlocked: t.threshold <= 92 })),
      isUnlocked: false,
      backers: [
        { id: 'b18', name: 'Zara K.', avatar: 'Z', amount: 65, timestamp: now - 90, isYou: false },
        { id: 'b19', name: 'Ben W.', avatar: 'B', amount: 130, timestamp: now - 350, isYou: false },
        { id: 'b20', name: 'Chloe L.', avatar: 'C', amount: 85, timestamp: now - 720, isYou: false },
        { id: 'b21', name: 'Ryan M.', avatar: 'R', amount: 100, timestamp: now - 1400, isYou: false },
        { id: 'b22', name: 'Grace T.', avatar: 'G', amount: 55, timestamp: now - 2800, isYou: false },
      ],
    },
    {
      id: 'cf6',
      title: 'Zero-Waste Starter Kit',
      description: 'Complete kit with reusable containers, beeswax wraps, bamboo utensils & more.',
      emoji: '🌍',
      category: 'Eco-Friendly',
      goalAmount: 15000,
      currentAmount: 15100,
      backersCount: 198,
      deadline: now + 5 * 86400 + 16 * 3600 + 30 * 60,
      isFeatured: true,
      isTrending: false,
      tags: ['Sustainability', 'Home'],
      tiers: tiers.map(t => ({ ...t, unlocked: t.threshold <= 100 })),
      isUnlocked: true,
      backers: [
        { id: 'b23', name: 'Ivy N.', avatar: 'I', amount: 50, timestamp: now - 150, isYou: false },
        { id: 'b24', name: 'Jack P.', avatar: 'J', amount: 75, timestamp: now - 500, isYou: false },
        { id: 'b25', name: 'You', avatar: 'Y', amount: 60, timestamp: now - 1000, isYou: true },
        { id: 'b26', name: 'Luna G.', avatar: 'L', amount: 40, timestamp: now - 2000, isYou: false },
      ],
    },
  ]
}

const BACKER_NAMES = [
  'Alex T.', 'Nina S.', 'Oscar R.', 'Emma H.', 'Finn D.',
  'Lily W.', 'Leo M.', 'Aria B.', 'Max C.', 'Ruby K.',
  'Kai V.', 'Ella J.', 'Jude P.', 'Iris L.', 'Sam F.',
]

// ==================== CONFETTI PARTICLES ====================

function DealConfetti() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'][Math.floor(Math.random() * 7)],
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            left: `${p.x}%`,
          }}
          initial={{ y: -20, opacity: 1, rotate: p.rotation }}
          animate={{ y: 500, opacity: 0, rotate: p.rotation + 720 }}
          transition={{ duration: 2.5 + Math.random() * 1, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ==================== ANIMATED COUNTER ====================

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)
  const prevTargetRef = useRef(target)

  useEffect(() => {
    const start = displayed
    const end = target
    const startTime = performance.now()

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
    }

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)
      setDisplayed(Math.round(start + (end - start) * easedProgress))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    prevTargetRef.current = end

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, displayed])

  return <span>{displayed.toLocaleString()}</span>
}

// ==================== COUNTDOWN TIMER ====================

function CountdownTimer({ deadline, isUrgent }: { deadline: number; isUrgent: boolean }) {
  const [time, setTime] = useState(getTimeRemaining(deadline))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(deadline))
    }, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  const pad = (n: number) => String(n).padStart(2, '0')

  if (time.isExpired) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-red-500">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Ended
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Clock className={`h-3.5 w-3.5 shrink-0 ${isUrgent ? 'text-red-500' : 'text-muted-foreground'}`} />
      <div
        className={`flex items-center gap-0.5 font-mono text-xs font-bold tabular-nums ${
          isUrgent ? 'text-red-600 dark:text-red-400' : 'text-foreground'
        }`}
      >
        {time.days > 0 && (
          <>
            <span className="r50-crowd-timer-digit bg-muted/60 dark:bg-muted/30 rounded px-1 py-0.5">
              <motion.span
                key={time.days}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
              >
                {pad(time.days)}
              </motion.span>
            </span>
            <span className="text-muted-foreground">:</span>
          </>
        )}
        <span className="r50-crowd-timer-digit bg-muted/60 dark:bg-muted/30 rounded px-1 py-0.5">
          <motion.span
            key={time.hours}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
          >
            {pad(time.hours)}
          </motion.span>
        </span>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          :
        </motion.span>
        <span className="r50-crowd-timer-digit bg-muted/60 dark:bg-muted/30 rounded px-1 py-0.5">
          <motion.span
            key={time.minutes}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
          >
            {pad(time.minutes)}
          </motion.span>
        </span>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          :
        </motion.span>
        <span
          className={`r50-crowd-timer-digit bg-muted/60 dark:bg-muted/30 rounded px-1 py-0.5 ${
            isUrgent ? 'bg-red-100 dark:bg-red-900/30' : ''
          }`}
        >
          <motion.span
            key={time.seconds}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
          >
            {pad(time.seconds)}
          </motion.span>
        </span>
      </div>
    </div>
  )
}

// ==================== BACKERS AVATARS ====================

function BackersAvatars({ backers, totalCount }: { backers: BackerEntry[]; totalCount: number }) {
  const visibleAvatars = backers.slice(0, 5)

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-2">
        <AnimatePresence>
          {visibleAvatars.map((backer, i) => (
            <motion.div
              key={backer.id}
              className="r50-crowd-avatar relative flex items-center justify-center rounded-full text-white font-bold border-2 border-background"
              style={{
                width: 24,
                height: 24,
                fontSize: 10,
                backgroundColor: getAvatarColor(i),
              }}
              initial={{ opacity: 0, scale: 0, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                type: 'spring' as const,
                stiffness: 400,
                damping: 25,
                delay: i * 0.08,
              }}
              title={backer.name}
            >
              {backer.isYou ? (
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {backer.avatar}
                </motion.span>
              ) : (
                backer.avatar
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">
        +{Math.max(0, totalCount - 5)} more
      </span>
    </div>
  )
}

// ==================== PROGRESS BAR ====================

function FundingProgressBar({
  percentage,
  barFrom,
  barTo,
  glow,
  isUnlocked,
}: {
  percentage: number
  barFrom: string
  barTo: string
  glow: string
  isUnlocked: boolean
}) {
  return (
    <div className="relative w-full h-3 bg-muted/60 dark:bg-muted/30 rounded-full overflow-hidden r50-crowd-progress-track">
      {/* Shimmer layer behind */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isUnlocked ? `0 0 16px 4px ${glow}` : '0 0 0px 0px transparent',
        }}
        transition={{
          duration: 1.5,
          repeat: isUnlocked ? Infinity : 0,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
      {/* Animated gradient fill */}
      <motion.div
        className="relative h-full rounded-full overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: 'spring' as const, stiffness: 120, damping: 20, delay: 0.2 }}
        style={{
          background: `linear-gradient(90deg, ${barFrom}, ${barTo})`,
        }}
      >
        {/* Shimmer sweep effect */}
        <motion.div
          className="absolute inset-0"
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
        >
          <div
            className="w-1/3 h-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
          />
        </motion.div>
      </motion.div>
      {/* Percentage text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-[9px] font-extrabold text-foreground drop-shadow-sm r50-crowd-pct-label">
          {Math.round(percentage)}%
        </span>
      </motion.div>
    </div>
  )
}

// ==================== TIER BADGES ====================

function TierBadges({ tiers }: { tiers: DealTier[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {tiers.map((tier, i) => (
        <motion.div
          key={tier.label}
          className="r50-crowd-tier-badge flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold border transition-colors"
          style={{
            backgroundColor: tier.unlocked
              ? `${getTierColor(tier.label)}15`
              : 'rgba(107, 114, 128, 0.05)',
            borderColor: tier.unlocked
              ? `${getTierColor(tier.label)}40`
              : 'rgba(107, 114, 128, 0.15)',
            color: tier.unlocked ? getTierColor(tier.label) : '#9ca3af',
          }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring' as const,
            stiffness: 350,
            damping: 25,
            delay: i * 0.06,
          }}
          title={`${tier.label}: ${tier.reward}`}
        >
          {tier.unlocked ? (
            <Unlock className="h-2.5 w-2.5" />
          ) : (
            <Lock className="h-2.5 w-2.5" />
          )}
          {tier.threshold}%
        </motion.div>
      ))}
    </div>
  )
}

function getTierColor(label: string): string {
  switch (label) {
    case 'Bronze': return '#d97706'
    case 'Silver': return '#6b7280'
    case 'Gold': return '#eab308'
    case 'Platinum': return '#10b981'
    default: return '#6b7280'
  }
}

// ==================== FEATURED BADGE ====================

function FeaturedBadge() {
  return (
    <motion.div
      className="r50-crowd-featured-badge relative flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md"
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ boxShadow: '0 0 8px 2px rgba(245, 158, 11, 0.4)' }}
    >
      <Star className="h-3 w-3 fill-white" />
      Featured
    </motion.div>
  )
}

// ==================== SUCCESS OVERLAY ====================

function SuccessOverlay({ dealTitle, onDismiss }: { dealTitle: string; onDismiss: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <DealConfetti />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        className="relative z-10 text-center px-6 py-8"
        initial={{ scale: 0.4, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 18 }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
          className="text-6xl mb-3"
        >
          <Trophy className="h-16 w-16 mx-auto text-amber-400" />
        </motion.div>
        <h3 className="text-2xl font-extrabold text-white mb-1">Deal Unlocked!</h3>
        <p className="text-sm text-gray-200 mb-1">Congratulations! The deal for</p>
        <p className="text-lg font-bold text-amber-400 mb-4">{dealTitle}</p>
        <p className="text-sm text-gray-300 mb-5">has reached 100% funding!</p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onDismiss}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 font-bold r50-crowd-success-btn"
          >
            <PartyPopper className="h-4 w-4 mr-1.5" />
            Amazing!
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ==================== TIER UNLOCK NOTIFICATION ====================

function TierUnlockNotification({
  notification,
  onDismiss,
}: {
  notification: TierUnlockNotification
  onDismiss: () => void
}) {
  return (
    <motion.div
      className="r50-crowd-unlock-notification fixed top-20 right-4 z-50 max-w-xs"
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
    >
      <div
        className="rounded-xl border p-3 shadow-xl flex items-start gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))',
          borderColor: 'rgba(139,92,246,0.3)',
          boxShadow: '0 8px 32px rgba(139,92,246,0.2)',
        }}
      >
        <motion.div
          className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1, repeat: 2 }}
          style={{ transformOrigin: 'center' }}
        >
          <Gift className="h-5 w-5 text-white" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground flex items-center gap-1">
            <Unlock className="h-3 w-3 text-violet-500" />
            Tier Unlocked!
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
            <span className="font-semibold text-violet-600 dark:text-violet-400">{notification.tierLabel}</span>
            {' '}for {notification.dealTitle}
          </p>
          <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-0.5">
            Reward: {notification.reward}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground text-xs shrink-0 mt-0.5"
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}

// ==================== DEAL CARD ====================

function DealCard({
  deal,
  onJoin,
  index,
}: {
  deal: CrowdDeal
  onJoin: (dealId: string) => void
  index: number
}) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasJoined, setHasJoined] = useState(
    deal.backers.some(b => b.isYou)
  )
  const pct = getFundingPercentage(deal)
  const gradient = getGradientForFunding(pct)
  const time = getTimeRemaining(deal.deadline)
  const isUrgent = !time.isExpired && time.total < 86400
  const isEndingVerySoon = !time.isExpired && time.total < 3600

  const handleJoin = useCallback(() => {
    if (hasJoined) return
    onJoin(deal.id)
    setHasJoined(true)
  }, [deal.id, hasJoined, onJoin])

  useEffect(() => {
    if (deal.isUnlocked && pct >= 100) {
      const timer = setTimeout(() => setShowSuccess(true), 600)
      return () => clearTimeout(timer)
    }
  }, [deal.isUnlocked, pct])

  return (
    <motion.div
      className="r50-crowd-deal-card relative"
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        type: 'spring' as const,
        stiffness: 240,
        damping: 22,
      }}
      layout
    >
      <div
        className="relative rounded-xl border overflow-hidden h-full flex flex-col r62-card-lift"
        style={{
          borderColor: gradient.border,
          background: gradient.bg,
          boxShadow: isEndingVerySoon
            ? '0 0 16px 4px rgba(239, 68, 68, 0.12), 0 2px 8px rgba(0,0,0,0.06)'
            : '0 2px 12px rgba(0,0,0,0.05)',
        }}
      >
        {/* Gradient accent top bar */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${gradient.barFrom}, ${gradient.barTo})`,
          }}
        />

        <div className="p-3 sm:p-4 flex flex-col gap-3 flex-1">
          {/* Header row: emoji, title, badges */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <motion.div
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 r50-crowd-deal-emoji"
                style={{
                  background: `linear-gradient(135deg, ${gradient.barFrom}20, ${gradient.barTo}20)`,
                }}
                animate={deal.isTrending ? { rotate: [0, 3, -3, 0] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-2xl sm:text-3xl">{deal.emoji}</span>
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold leading-tight line-clamp-1">{deal.title}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{deal.description}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {deal.isTrending && (
                    <Badge
                      className="text-[8px] px-1.5 py-0 h-4 border-0 font-bold r62-badge-glow"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}
                    >
                      <Flame className="h-2.5 w-2.5 mr-0.5" />
                      Trending
                    </Badge>
                  )}
                  <Badge
                    className="text-[8px] px-1.5 py-0 h-4 border-0 font-medium"
                    style={{ backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#9ca3af' }}
                  >
                    {deal.category}
                  </Badge>
                </div>
              </div>
            </div>
            {deal.isFeatured && <FeaturedBadge />}
          </div>

          {/* Funding progress section */}
          <div className="r50-crowd-funding-section space-y-2">
            {/* Goal & current amounts */}
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-primary" />
                <motion.span
                  className="text-lg sm:text-xl font-extrabold text-primary"
                  key={deal.currentAmount}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                >
                  {formatCompact(deal.currentAmount)}
                </motion.span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                of {formatCompact(deal.goalAmount)} goal
              </span>
            </div>

            {/* Animated goal counter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">
                Goal:
              </span>
              <motion.span
                className="text-xs font-bold text-foreground"
                key={deal.goalAmount}
              >
                <AnimatedCounter target={deal.goalAmount} duration={1500} />
              </motion.span>
              <span className="text-[10px] text-muted-foreground">raised</span>
            </div>

            {/* Progress bar */}
            <FundingProgressBar
              percentage={pct}
              barFrom={gradient.barFrom}
              barTo={gradient.barTo}
              glow={gradient.glow}
              isUnlocked={deal.isUnlocked}
            />
          </div>

          {/* Tiers */}
          <div className="r50-crowd-tiers">
            <TierBadges tiers={deal.tiers} />
          </div>

          {/* Backers & countdown */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                <motion.span
                  className="text-xs font-bold text-foreground"
                  key={deal.backersCount}
                  initial={{ y: -4, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
                >
                  <AnimatedCounter target={deal.backersCount} duration={800} />
                </motion.span>
                <span className="text-[10px] text-muted-foreground">backers</span>
              </div>
              <BackersAvatars backers={deal.backers} totalCount={deal.backersCount} />
            </div>
            <CountdownTimer deadline={deal.deadline} isUrgent={isUrgent} />
          </div>

          {/* Urgency indicator */}
          {isEndingVerySoon && !time.isExpired && (
            <motion.div
              className="flex items-center justify-center gap-1 text-[9px] text-red-600 dark:text-red-400 font-bold"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Zap className="h-3 w-3" />
              Almost over — join now!
            </motion.div>
          )}

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {deal.tags.map(tag => (
              <span
                key={tag}
                className="text-[8px] px-1.5 py-0.5 rounded-full bg-muted/50 dark:bg-muted/30 text-muted-foreground font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Join button */}
          <div className="mt-auto pt-2">
            {time.isExpired ? (
              <div className="r50-crowd-ended flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                {deal.isUnlocked ? (
                  <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Deal unlocked!
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Funding ended
                  </span>
                )}
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleJoin}
                  disabled={hasJoined}
                  className={`r50-crowd-join-btn w-full h-9 text-xs font-bold gap-1.5 border-0 transition-all ${
                    hasJoined
                      ? 'bg-green-500/15 text-green-600 dark:text-green-400 cursor-default'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white'
                  }`}
                >
                  {hasJoined ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      You&apos;re a backer!
                    </>
                  ) : (
                    <>
                      <Users className="h-3.5 w-3.5" />
                      Join this deal
                      <ChevronRight className="h-3 w-3 ml-auto" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Success overlay */}
        <AnimatePresence>
          {showSuccess && (
            <SuccessOverlay
              dealTitle={deal.title}
              onDismiss={() => setShowSuccess(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ==================== FILTER BAR ====================

function FilterBar({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: DealFilter
  onFilterChange: (f: DealFilter) => void
}) {
  return (
    <div className="r50-crowd-filter-bar flex items-center bg-secondary/50 dark:bg-secondary/30 rounded-xl p-1 gap-0.5 overflow-x-auto">
      {FILTER_OPTIONS.map(filter => (
        <motion.button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`relative z-10 flex items-center gap-1 px-3 py-1.5 min-h-[44px] text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeFilter === filter.value
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="text-xs">{filter.icon}</span>
          {filter.label}
        </motion.button>
      ))}
      <motion.div
        layoutId="r50-crowd-filter-indicator"
        className="absolute top-1 bottom-1 bg-primary rounded-lg"
        style={{
          width: `${100 / FILTER_OPTIONS.length}%`,
          left: `${(FILTER_OPTIONS.findIndex(f => f.value === activeFilter) / FILTER_OPTIONS.length) * 100}%`,
        }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
      />
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export function CrowdFundedDeals() {
  const [deals, setDeals] = useState<CrowdDeal[]>(createInitialDeals)
  const [activeFilter, setActiveFilter] = useState<DealFilter>('all')
  const [notifications, setNotifications] = useState<TierUnlockNotification[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const notificationIdRef = useRef(0)

  // Simulate gradual funding increases
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setDeals(prev =>
        prev.map(deal => {
          const time = getTimeRemaining(deal.deadline)
          if (time.isExpired) return deal

          // Random small funding boost
          const boost = Math.random() < 0.15 ? Math.floor(Math.random() * 200) + 50 : 0
          const newAmount = Math.min(deal.goalAmount, deal.currentAmount + boost)

          // Check for new tier unlocks
          const newTiers = deal.tiers.map(tier => {
            const newPct = (newAmount / deal.goalAmount) * 100
            const shouldUnlock = newPct >= tier.threshold && !tier.unlocked
            return { ...tier, unlocked: tier.unlocked || newPct >= tier.threshold }
          })

          // Detect newly unlocked tiers
          const justUnlocked = newTiers.filter(
            (tier, idx) => tier.unlocked && !deal.tiers[idx].unlocked
          )

          // Create notifications for newly unlocked tiers
          justUnlocked.forEach(tier => {
            notificationIdRef.current += 1
            setNotifications(prev => [
              {
                id: `notif-${notificationIdRef.current}`,
                dealId: deal.id,
                dealTitle: deal.title,
                tierLabel: tier.label,
                reward: tier.reward,
                timestamp: Date.now(),
              },
              ...prev.slice(0, 2),
            ])
          })

          const newIsUnlocked = newAmount >= deal.goalAmount

          return {
            ...deal,
            currentAmount: newAmount,
            tiers: newTiers,
            isUnlocked: newIsUnlocked,
          }
        }),
      )
    }, 3000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setNotifications(prev =>
        prev.filter(n => now - n.timestamp < 5000)
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Handle user joining a deal
  const handleJoinDeal = useCallback((dealId: string) => {
    const backerName = 'You'
    const backerAvatar = 'Y'
    const amount = 50 + Math.floor(Math.random() * 200)

    setDeals(prev =>
      prev.map(deal => {
        if (deal.id !== dealId) return deal
        if (deal.backers.some(b => b.isYou)) return deal

        const newBacker: BackerEntry = {
          id: `backer-${Date.now()}`,
          name: backerName,
          avatar: backerAvatar,
          amount,
          timestamp: Math.floor(Date.now() / 1000),
          isYou: true,
        }

        const newBackers = [newBacker, ...deal.backers].slice(0, 5)
        const newAmount = Math.min(deal.goalAmount, deal.currentAmount + amount)
        const newPct = (newAmount / deal.goalAmount) * 100

        const newTiers = deal.tiers.map(tier => ({
          ...tier,
          unlocked: tier.unlocked || newPct >= tier.threshold,
        }))

        // Check newly unlocked tiers from this action
        const justUnlocked = newTiers.filter(
          (tier, idx) => tier.unlocked && !deal.tiers[idx].unlocked
        )

        justUnlocked.forEach(tier => {
          notificationIdRef.current += 1
          setNotifications(prev => [
            {
              id: `notif-${notificationIdRef.current}`,
              dealId: deal.id,
              dealTitle: deal.title,
              tierLabel: tier.label,
              reward: tier.reward,
              timestamp: Date.now(),
            },
            ...prev.slice(0, 2),
          ])
        })

        return {
          ...deal,
          backers: newBackers,
          backersCount: deal.backersCount + 1,
          currentAmount: newAmount,
          tiers: newTiers,
          isUnlocked: newAmount >= deal.goalAmount,
        }
      }),
    )
  }, [])

  // Dismiss a notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Filter deals
  const filteredDeals = (() => {
    switch (activeFilter) {
      case 'trending':
        return [...deals].filter(d => d.isTrending)
      case 'ending-soon': {
        const now = Math.floor(Date.now() / 1000)
        return [...deals]
          .filter(d => d.deadline - now > 0 && d.deadline - now < 3 * 86400)
          .sort((a, b) => a.deadline - b.deadline)
      }
      case 'most-funded':
        return [...deals].sort(
          (a, b) =>
            b.currentAmount / b.goalAmount - a.currentAmount / a.goalAmount
        )
      default:
        return deals
    }
  })()

  // Stats
  const totalBackers = deals.reduce((sum, d) => sum + d.backersCount, 0)
  const totalFunded = deals.reduce((sum, d) => sum + d.currentAmount, 0)
  const unlockedCount = deals.filter(d => d.isUnlocked).length

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: 'spring' as const, stiffness: 200, damping: 25 }}
      className="relative overflow-hidden r62-card-lift"
    >
      {/* Tier unlock notifications */}
      <AnimatePresence>
        {notifications.map(notification => (
          <TierUnlockNotification
            key={notification.id}
            notification={notification}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))}
      </AnimatePresence>

      <div className="relative bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 dark:from-violet-950/10 dark:via-indigo-950/10 dark:to-blue-950/10 rounded-2xl border border-violet-200/40 dark:border-violet-800/20 overflow-hidden r50-crowd-section">
        {/* Decorative background glows */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.04), transparent 70%)' }}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, -8, 8, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg r50-crowd-header-icon"
            >
              <TrendingUp className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-2 r62-heading-gradient">
                <span className="r50-crowd-header-gradient bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Crowd-Funded Deals
                </span>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[10px] font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full"
                >
                  Live
                </motion.span>
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Back exciting deals & unlock exclusive rewards together
              </p>
            </div>
          </div>

          {/* Filter bar */}
          <div className="w-full sm:w-auto relative">
            <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>
        </div>

        {/* Stats row */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              {
                label: 'Total Backers',
                value: totalBackers,
                icon: Users,
                color: '#3b82f6',
                bg: 'rgba(59, 130, 246, 0.08)',
              },
              {
                label: 'Total Funded',
                value: totalFunded,
                icon: Target,
                color: '#10b981',
                bg: 'rgba(16, 185, 129, 0.08)',
                isCompact: true,
              },
              {
                label: 'Deals Unlocked',
                value: unlockedCount,
                icon: Trophy,
                color: '#f59e0b',
                bg: 'rgba(245, 158, 11, 0.08)',
              },
            ].map(stat => (
              <motion.div
                key={stat.label}
                className="r50-crowd-stat-card rounded-xl border border-border/40 p-2.5 text-center"
                style={{ backgroundColor: stat.bg }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <stat.icon className="h-4 w-4 mx-auto mb-1" style={{ color: stat.color }} />
                <p className="text-sm sm:text-base font-extrabold text-foreground">
                  <AnimatedCounter target={stat.value} />
                </p>
                <p className="text-[8px] sm:text-[9px] text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Deal grid */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 r50-crowd-grid">
            <AnimatePresence mode="popLayout">
              {filteredDeals.map((deal, index) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onJoin={handleJoinDeal}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {filteredDeals.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Filter className="h-10 w-10 text-muted-foreground/40" />
              </motion.div>
              <p className="text-sm text-muted-foreground mt-3">No deals match this filter</p>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                  className="mt-2 r50-crowd-show-all-btn"
                >
                  View all deals
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* How it works section */}
        <div className="px-4 pb-4">
          <div className="r50-crowd-how-it-works rounded-xl border border-border/30 bg-background/60 dark:bg-background/30 p-3 sm:p-4">
            <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-violet-500" />
              How Crowd-Funded Deals Work
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  step: '1',
                  title: 'Browse Deals',
                  desc: 'Find products you love',
                  emoji: '🔍',
                },
                {
                  step: '2',
                  title: 'Join & Back',
                  desc: 'Pledge your support',
                  emoji: '🤝',
                },
                {
                  step: '3',
                  title: 'Unlock Tiers',
                  desc: 'Hit milestones for rewards',
                  emoji: '🎁',
                },
                {
                  step: '4',
                  title: 'Deal Unlocked',
                  desc: 'Everyone gets the deal!',
                  emoji: '🎉',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  className="r50-crowd-step flex flex-col items-center text-center gap-1 p-2 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="text-2xl">{item.emoji}</div>
                  <span className="text-[10px] font-bold text-foreground">{item.title}</span>
                  <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient bar with shimmer */}
        <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 relative overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          >
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* Floating decorative particles */}
      <motion.div
        className="absolute top-8 right-6 w-1.5 h-1.5 rounded-full bg-violet-400/30 pointer-events-none"
        animate={{ y: [0, -12, -24], opacity: [0, 0.6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' as const, delay: 0.5 }}
      />
      <motion.div
        className="absolute top-16 left-8 w-1 h-1 rounded-full bg-indigo-400/25 pointer-events-none"
        animate={{ y: [0, -10, -20], opacity: [0, 0.5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut' as const, delay: 1.2 }}
      />
      <motion.div
        className="absolute top-4 left-1/3 w-1 h-1 rounded-full bg-blue-400/30 pointer-events-none"
        animate={{ y: [0, -8, -18], opacity: [0, 0.7, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut' as const, delay: 0.8 }}
      />
      <motion.div
        className="absolute bottom-12 right-1/4 w-1.5 h-1.5 rounded-full bg-purple-400/25 pointer-events-none"
        animate={{ y: [0, 10, 22], opacity: [0, 0.4, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeOut' as const, delay: 1.6 }}
      />
      <motion.div
        className="absolute top-24 right-1/3 w-1 h-1 rounded-full bg-pink-400/20 pointer-events-none"
        animate={{ y: [0, -14, -26], opacity: [0, 0.5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' as const, delay: 2.1 }}
      />
    </motion.section>
  )
}
