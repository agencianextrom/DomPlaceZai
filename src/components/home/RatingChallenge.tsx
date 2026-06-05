'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Clock,
  ChevronRight,
  Flame,
  Trophy,
  Award,
  Gift,
  Truck,
  Tag,
  Zap,
  TrendingUp,
  Crown,
  Medal,
  BarChart3,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/useAppStore'
import { cachedFetch } from '@/lib/api-cache'
import { fireConfettiFromElement } from '@/lib/confetti'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ReviewerEntry {
  name: string
  initials: string
  ratingCount: number
  medalColor: string
  gradientFrom: string
  gradientTo: string
}

interface Milestone {
  target: number
  label: string
  reward: string
  icon: typeof Gift
  color: string
}

interface CategoryBreakdown {
  category: string
  count: number
  color: string
}

interface RatingChallengeState {
  userRatings: number
  streak: number
  milestonesReached: number[]
  categoryBreakdown: CategoryBreakdown[]
  lastUpdated: number
  weekStart: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'domplace-rating-challenge'
const WEEKLY_GOAL = 100

const TOP_REVIEWERS: ReviewerEntry[] = [
  { name: 'Ana Beatriz Silva', initials: 'AB', ratingCount: 24, medalColor: '#f59e0b', gradientFrom: '#f59e0b', gradientTo: '#d97706' },
  { name: 'Carlos Eduardo Lima', initials: 'CE', ratingCount: 19, medalColor: '#94a3b8', gradientFrom: '#94a3b8', gradientTo: '#64748b' },
  { name: 'Mariana Costa Santos', initials: 'MC', ratingCount: 14, medalColor: '#cd7f32', gradientFrom: '#cd7f32', gradientTo: '#a0522d' },
]

const MILESTONES: Milestone[] = [
  { target: 5, label: '5 avaliações', reward: 'Cupom R$2', icon: Tag, color: '#10b981' },
  { target: 10, label: '10 avaliações', reward: 'Cupom R$5', icon: Gift, color: '#f59e0b' },
  { target: 20, label: '20 avaliações', reward: 'Frete Grátis', icon: Truck, color: '#06b6d4' },
  { target: 50, label: '50 avaliações', reward: 'Cupom R$15', icon: Trophy, color: '#ef4444' },
]

const DEFAULT_CATEGORIES: CategoryBreakdown[] = [
  { category: 'Alimentação', count: 0, color: '#10b981' },
  { category: 'Saúde', count: 0, color: '#ef4444' },
  { category: 'Eletrônicos', count: 0, color: '#3b82f6' },
  { category: 'Bebidas', count: 0, color: '#f59e0b' },
  { category: 'Padaria', count: 0, color: '#8b5cf6' },
  { category: 'Beleza', count: 0, color: '#ec4899' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

function loadState(): RatingChallengeState {
  if (typeof window === 'undefined') {
    return { userRatings: 0, streak: 0, milestonesReached: [], categoryBreakdown: DEFAULT_CATEGORIES, lastUpdated: 0, weekStart: getWeekStart() }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as RatingChallengeState
      if (parsed.weekStart !== getWeekStart()) {
        return { userRatings: 0, streak: parsed.streak, milestonesReached: [], categoryBreakdown: DEFAULT_CATEGORIES, lastUpdated: Date.now(), weekStart: getWeekStart() }
      }
      return parsed
    }
  } catch { /* ignore */ }
  return { userRatings: 0, streak: 0, milestonesReached: [], categoryBreakdown: DEFAULT_CATEGORIES, lastUpdated: 0, weekStart: getWeekStart() }
}

function saveState(state: RatingChallengeState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24, delay: i * 0.06 },
  }),
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
}

const milestoneVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22, delay: i * 0.1 },
  }),
  unlocked: {
    scale: [1, 1.15, 1],
    transition: { duration: 0.5 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function getTimeRemaining(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date()
  const endOfWeek = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  endOfWeek.setDate(now.getDate() + daysUntilSunday)
  endOfWeek.setHours(23, 59, 59, 999)
  const diff = endOfWeek.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

function padZero(n: number): string {
  return n.toString().padStart(2, '0')
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON LOADING
// ═══════════════════════════════════════════════════════════════════════════════

function RatingChallengeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-32" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="h-16 rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAR AVATAR BADGE
// ═══════════════════════════════════════════════════════════════════════════════

function StarRatingAvatar({ rating }: { rating: number }) {
  return (
    <div className="relative">
      {rating === 24 && (
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <Crown className="h-4 w-4 text-amber-400" />
        </motion.div>
      )}
      {rating === 19 && (
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.3 }}
        >
          <Medal className="h-4 w-4 text-slate-400" />
        </motion.div>
      )}
      {rating === 14 && (
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.6 }}
        >
          <Medal className="h-4 w-4" style={{ color: '#cd7f32' }} />
        </motion.div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function RatingChallenge() {
  const navigate = useAppStore((s) => s.navigate)
  const [isLoading, setIsLoading] = useState(true)
  const [state, setState] = useState<RatingChallengeState>({
    userRatings: 0, streak: 0, milestonesReached: [], categoryBreakdown: DEFAULT_CATEGORIES, lastUpdated: 0, weekStart: getWeekStart(),
  })
  const [communityProgress, setCommunityProgress] = useState(67)
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining())
  const [newlyUnlocked, setNewlyUnlocked] = useState<number | null>(null)
  const milestoneRefs = useRef<(HTMLDivElement | null)[]>([])
  const ctaRef = useRef<HTMLDivElement>(null)

  // Load persisted state
  useEffect(() => {
    const loaded = loadState()
    // Use microtask to avoid direct setState in effect
    queueMicrotask(() => {
      setState(loaded)
      setIsLoading(false)
    })
  }, [])

  // Fetch orders data using cachedFetch
  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        await cachedFetch('/api/orders')
        if (!cancelled) {
          // Simulate community progress based on random data
          setCommunityProgress(Math.floor(50 + Math.random() * 45))
        }
      } catch {
        // Use default if fetch fails
        if (!cancelled) setCommunityProgress(67)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Check for new milestone unlocks and trigger confetti
  useEffect(() => {
    if (state.userRatings <= 0) return
    let found = false
    for (const ms of MILESTONES) {
      if (!found && state.userRatings >= ms.target && !state.milestonesReached.includes(ms.target)) {
        found = true
        // Use timeout to avoid direct setState in effect body
        setTimeout(() => {
          setNewlyUnlocked(ms.target)
          const newReached = [...state.milestonesReached, ms.target]
          const newState = { ...state, milestonesReached: newReached, lastUpdated: Date.now() }
          saveState(newState)
          setState(newState)
          // Fire confetti on milestone element
          const idx = MILESTONES.indexOf(ms)
          const el = milestoneRefs.current[idx]
          if (el) fireConfettiFromElement(el)
          setTimeout(() => setNewlyUnlocked(null), 2000)
        }, 50)
        break
      }
    }
  }, [state.userRatings])

  // Demo: simulate rating count from loaded orders
  useEffect(() => {
    if (!isLoading && state.userRatings === 0) {
      const timer = setTimeout(() => {
        const demoRatings = 7
        const demoCategories: CategoryBreakdown[] = [
          { category: 'Alimentação', count: 3, color: '#10b981' },
          { category: 'Saúde', count: 1, color: '#ef4444' },
          { category: 'Eletrônicos', count: 2, color: '#3b82f6' },
          { category: 'Bebidas', count: 1, color: '#f59e0b' },
          { category: 'Padaria', count: 0, color: '#8b5cf6' },
          { category: 'Beleza', count: 0, color: '#ec4899' },
        ]
        const newState: RatingChallengeState = {
          userRatings: demoRatings,
          streak: 3,
          milestonesReached: [5],
          categoryBreakdown: demoCategories,
          lastUpdated: Date.now(),
          weekStart: getWeekStart(),
        }
        saveState(newState)
        setState(newState)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isLoading, state.userRatings])

  const handleRateNow = useCallback(() => {
    navigate('orders')
  }, [navigate])

  const maxCategory = useMemo(() => {
    return Math.max(...state.categoryBreakdown.map((c) => c.count), 1)
  }, [state.categoryBreakdown])

  if (isLoading) {
    return (
      <section className="px-4 py-6">
        <div className="max-w-lg mx-auto">
          <RatingChallengeSkeleton />
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-6">
      <motion.div
        className="max-w-lg mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ═══════ HEADER ═══════ */}
        <motion.div variants={cardVariants} className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <motion.div
              className="h-10 w-10 rounded-xl flex items-center justify-center r59-rating-icon-bg"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            </motion.div>
            <div>
              <h2 className="text-base font-bold text-foreground">Desafio de Avaliações</h2>
              <p className="text-[11px] text-muted-foreground">Avalie produtos e ganhe recompensas</p>
            </div>
          </div>
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full r59-rating-streak-badge"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
              {state.streak} semanas
            </span>
          </motion.div>
        </motion.div>

        {/* ═══════ GLASSMORPHISM CARD ═══════ */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden rounded-2xl p-5 r59-rating-card"
        >
          {/* Background gradient mesh */}
          <div className="absolute inset-0 -z-10 r59-rating-mesh" aria-hidden="true" />

          {/* ═══ WEEKLY COMMUNITY GOAL ═══ */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-semibold text-foreground">Meta da Semana</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {communityProgress}/{WEEKLY_GOAL}
              </span>
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground">Progresso da comunidade</span>
              <span className="text-[11px] font-semibold text-muted-foreground">{communityProgress}%</span>
            </div>
            <div className="h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full r59-rating-progress-bar"
                initial={{ width: '0%' }}
                animate={{ width: `${communityProgress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' as const }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Faltam {WEEKLY_GOAL - communityProgress} avaliações para atingir a meta!
            </p>
          </div>

          {/* ═══ YOUR PERSONAL CONTRIBUTION ═══ */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">Sua Contribuição</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <motion.span
                key={state.userRatings}
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                className="text-3xl font-black text-foreground"
              >
                {state.userRatings}
              </motion.span>
              <span className="text-sm text-muted-foreground">produtos avaliados esta semana</span>
            </div>
          </div>

          {/* ═══ TOP 3 REVIEWERS LEADERBOARD ═══ */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">Top Avaliadores</span>
            </div>
            <div className="space-y-2">
              {TOP_REVIEWERS.map((reviewer, i) => (
                <motion.div
                  key={reviewer.name}
                  custom={i}
                  variants={itemVariants}
                  className="flex items-center gap-3 p-2.5 rounded-xl r59-rating-reviewer-row"
                >
                  <div className="w-5 shrink-0 flex items-center justify-center">
                    <StarRatingAvatar rating={reviewer.ratingCount} />
                  </div>
                  <motion.div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${reviewer.gradientFrom}, ${reviewer.gradientTo})`,
                      boxShadow: `0 0 0 2px rgba(255,255,255,0.15), 0 0 8px ${reviewer.gradientFrom}30`,
                    }}
                    whileHover={{ scale: 1.12 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                  >
                    {reviewer.initials}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold truncate block">{reviewer.name}</span>
                    <span className="text-[10px] text-muted-foreground">Avaliações</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black text-foreground">{reviewer.ratingCount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ═══ STREAK TRACKING ═══ */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <motion.span
                className="text-lg"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
              >
                🔥
              </motion.span>
              <span className="text-sm font-semibold text-foreground">Sequência</span>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-bold text-orange-600 dark:text-orange-400">{state.streak} semanas consecutivas</span>{' '}
              avaliando produtos!
            </p>
            {state.streak >= 3 && (
              <motion.div
                className="mt-1.5 flex items-center gap-1"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 18 }}
              >
                <Zap className="h-3 w-3 text-orange-500" />
                <span className="text-[10px] font-medium text-orange-500">Sequência ativa! Continue avaliando</span>
              </motion.div>
            )}
          </div>

          {/* ═══ REWARD MILESTONES ═══ */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-4 w-4 text-rose-500" />
              <span className="text-sm font-semibold text-foreground">Recompensas</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MILESTONES.map((ms, i) => {
                const isReached = state.userRatings >= ms.target || state.milestonesReached.includes(ms.target)
                const isNew = newlyUnlocked === ms.target
                const IconComp = ms.icon
                return (
                  <motion.div
                    key={ms.target}
                    ref={(el) => { milestoneRefs.current[i] = el }}
                    custom={i}
                    variants={milestoneVariants}
                    animate={isNew ? 'unlocked' : 'visible'}
                    className={`relative flex flex-col items-center p-2.5 rounded-xl r59-rating-milestone ${
                      isReached ? 'r59-rating-milestone-reached' : 'r59-rating-milestone-locked'
                    }`}
                    style={{
                      borderColor: isReached ? `${ms.color}40` : undefined,
                    }}
                  >
                    {isNew && (
                      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                        {[...Array(12)].map((_, p) => (
                          <motion.div
                            key={p}
                            className="absolute rounded-full"
                            style={{
                              width: 4 + Math.random() * 4,
                              height: 4 + Math.random() * 4,
                              backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'][Math.floor(Math.random() * 5)],
                              left: `${Math.random() * 100}%`,
                              top: '50%',
                            }}
                            initial={{ y: 0, opacity: 1, x: 0 }}
                            animate={{ y: -40, opacity: 0, x: (Math.random() - 0.5) * 30 }}
                            transition={{ duration: 0.8 + Math.random() * 0.4, delay: p * 0.05 }}
                          />
                        ))}
                      </div>
                    )}
                    <motion.div
                      className="h-7 w-7 rounded-lg flex items-center justify-center mb-1.5"
                      style={{
                        backgroundColor: isReached ? `${ms.color}25` : 'rgba(0,0,0,0.05)',
                      }}
                      animate={isReached ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {isReached ? (
                        <IconComp className="h-4 w-4" style={{ color: ms.color }} />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                    </motion.div>
                    <span className="text-[10px] font-bold text-center leading-tight text-foreground">{ms.target}</span>
                    <span className="text-[8px] text-muted-foreground text-center leading-tight mt-0.5">{ms.reward}</span>
                    {isReached && (
                      <motion.div
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: ms.color }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* ═══ CATEGORY BREAKDOWN MINI BAR CHART ═══ */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold text-foreground">Categorias Avaliadas</span>
            </div>
            <div className="space-y-2">
              {state.categoryBreakdown.map((cat, i) => (
                <motion.div
                  key={cat.category}
                  custom={i}
                  variants={itemVariants}
                  className="flex items-center gap-2"
                >
                  <span className="text-[10px] font-medium text-muted-foreground w-20 text-right shrink-0">
                    {cat.category}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-black/8 dark:bg-white/8 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                      initial={{ width: '0%' }}
                      animate={{ width: maxCategory > 0 ? `${(cat.count / maxCategory) * 100}%` : '0%' }}
                      transition={{ duration: 0.8, ease: 'easeOut' as const, delay: i * 0.05 }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-foreground w-5 shrink-0">{cat.count}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ═══ TIME REMAINING ═══ */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Tempo Restante</span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { value: timeLeft.days, label: 'dias' },
                { value: timeLeft.hours, label: 'h' },
                { value: timeLeft.minutes, label: 'm' },
                { value: timeLeft.seconds, label: 's' },
              ].map((unit, i) => (
                <motion.div
                  key={unit.label}
                  className="flex items-center gap-0.5"
                  animate={unit.label === 's' ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="h-10 w-10 rounded-lg r59-rating-timer-box flex items-center justify-center">
                    <span className="text-base font-black text-foreground tabular-nums">
                      {padZero(unit.value)}
                    </span>
                  </div>
                  {i < 3 && (
                    <span className="text-xs font-bold text-muted-foreground mx-0.5">:</span>
                  )}
                </motion.div>
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">até o fim da semana</span>
            </div>
          </div>

          {/* ═══ CTA BUTTON ═══ */}
          <motion.div
            ref={ctaRef}
            variants={fadeInUp}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            >
              <Button
                onClick={handleRateNow}
                className="w-full py-5 rounded-xl text-sm font-bold r59-rating-cta-btn"
                size="lg"
              >
                <Star className="h-4 w-4 mr-2 text-amber-300" />
                Avaliar Agora
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
