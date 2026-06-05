'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Users,
  Star,
  Share2,
  Clock,
  Gift,
  ChevronRight,
  Sparkles,
  Flame,
  Target,
  Award,
  Crown,
  Medal,
  Copy,
  CheckCircle2,
  Truck,
  Percent,
  PackageOpen,
  Zap,
  Heart,
  TrendingUp,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Challenge {
  id: string
  title: string
  description: string
  type: 'buy_local' | 'rate_earn' | 'refer_friends'
  rewardPoints: number
  targetCount: number
  currentProgress: number
  deadlineHours: number
  icon: string
  color: string
  actionLabel: string
}

interface LeaderboardEntry {
  id: string
  name: string
  initials: string
  points: number
  challengesCompleted: number
  isCurrentUser: boolean
  gradientFrom: string
  gradientTo: string
}

interface RewardPreview {
  id: string
  title: string
  description: string
  icon: typeof Truck
  requiredChallenges: number
  color: string
}

interface ChallengeState {
  progress: Record<string, number>
  completed: Record<string, boolean>
  lastUpdated: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const CHALLENGES: Challenge[] = [
  {
    id: 'buy_local',
    title: 'Compre Local',
    description: 'Compre 3 produtos de lojas locais esta semana para apoiar produtores da nossa região.',
    type: 'buy_local',
    rewardPoints: 150,
    targetCount: 3,
    currentProgress: 0,
    deadlineHours: 168,
    icon: '🏪',
    color: 'emerald',
    actionLabel: 'Ver Lojas Locais',
  },
  {
    id: 'rate_earn',
    title: 'Avalie e Ganhe',
    description: 'Avalie 5 produtos para ganhar pontos bônus. Sua opinião ajuda toda a comunidade!',
    type: 'rate_earn',
    rewardPoints: 200,
    targetCount: 5,
    currentProgress: 0,
    deadlineHours: 72,
    icon: '⭐',
    color: 'amber',
    actionLabel: 'Avaliar Produtos',
  },
  {
    id: 'refer_friends',
    title: 'Indique Amigos',
    description: 'Compartilhe o DomPlace com 2 amigos e ganhe pontos extras para ambos.',
    type: 'refer_friends',
    rewardPoints: 250,
    targetCount: 2,
    currentProgress: 0,
    deadlineHours: 120,
    icon: '👥',
    color: 'violet',
    actionLabel: 'Convidar Amigos',
  },
]

const LEADERBOARD: LeaderboardEntry[] = [
  {
    id: '1',
    name: 'Ana Beatriz Silva',
    initials: 'AB',
    points: 3240,
    challengesCompleted: 42,
    isCurrentUser: false,
    gradientFrom: '#f59e0b',
    gradientTo: '#d97706',
  },
  {
    id: '2',
    name: 'Carlos Eduardo Lima',
    initials: 'CE',
    points: 2980,
    challengesCompleted: 38,
    isCurrentUser: false,
    gradientFrom: '#94a3b8',
    gradientTo: '#64748b',
  },
  {
    id: '3',
    name: 'Mariana Costa Santos',
    initials: 'MC',
    points: 2750,
    challengesCompleted: 35,
    isCurrentUser: false,
    gradientFrom: '#cd7f32',
    gradientTo: '#a0522d',
  },
  {
    id: '4',
    name: 'Pedro Henrique Oliveira',
    initials: 'PH',
    points: 2100,
    challengesCompleted: 28,
    isCurrentUser: false,
    gradientFrom: '#3b82f6',
    gradientTo: '#2563eb',
  },
  {
    id: '5',
    name: 'Juliana Ferreira',
    initials: 'JF',
    points: 1890,
    challengesCompleted: 24,
    isCurrentUser: false,
    gradientFrom: '#8b5cf6',
    gradientTo: '#7c3aed',
  },
  {
    id: '6',
    name: 'Lucas Gabriel Mendes',
    initials: 'LG',
    points: 1650,
    challengesCompleted: 21,
    isCurrentUser: false,
    gradientFrom: '#ec4899',
    gradientTo: '#db2777',
  },
  {
    id: '7',
    name: 'Fernanda Alves',
    initials: 'FA',
    points: 1420,
    challengesCompleted: 18,
    isCurrentUser: false,
    gradientFrom: '#10b981',
    gradientTo: '#059669',
  },
  {
    id: '8',
    name: 'Rafael Souza',
    initials: 'RS',
    points: 1200,
    challengesCompleted: 15,
    isCurrentUser: false,
    gradientFrom: '#f97316',
    gradientTo: '#ea580c',
  },
  {
    id: '9',
    name: 'Camila Rodrigues',
    initials: 'CR',
    points: 980,
    challengesCompleted: 12,
    isCurrentUser: false,
    gradientFrom: '#06b6d4',
    gradientTo: '#0891b2',
  },
  {
    id: 'user',
    name: 'Você',
    initials: 'V',
    points: 450,
    challengesCompleted: 6,
    isCurrentUser: true,
    gradientFrom: '#10b981',
    gradientTo: '#059669',
  },
]

const REWARDS: RewardPreview[] = [
  {
    id: 'discount',
    title: 'Cupom 15% OFF',
    description: 'Desconto em qualquer compra acima de R$50',
    icon: Percent,
    requiredChallenges: 3,
    color: 'emerald',
  },
  {
    id: 'delivery',
    title: 'Frete Grátis',
    description: 'Entrega grátis em até 3 pedidos',
    icon: Truck,
    requiredChallenges: 5,
    color: 'amber',
  },
  {
    id: 'exclusive',
    title: 'Produto Exclusivo',
    description: 'Acesso a produtos premium antes de todos',
    icon: PackageOpen,
    requiredChallenges: 8,
    color: 'violet',
  },
]

const STORAGE_KEY = 'domplace-community-challenge'

const COMMUNITY_STATS = {
  totalParticipants: 2847,
  challengesCompleted: 14230,
  activeThisWeek: 892,
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function loadChallengeState(): ChallengeState {
  if (typeof window === 'undefined') {
    return { progress: {}, completed: {}, lastUpdated: 0 }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return { progress: {}, completed: {}, lastUpdated: 0 }
}

function saveChallengeState(state: ChallengeState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: -16,
    transition: { duration: 0.2 },
  },
}

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24, delay: i * 0.06 },
  }),
}

const shimmerVariants = {
  initial: { backgroundPosition: '-200% center' },
  animate: {
    backgroundPosition: '200% center',
    transition: { duration: 4, repeat: Infinity, ease: 'linear' as const },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatCountdown(hours: number): string {
  if (hours >= 168) {
    const days = Math.floor(hours / 24)
    return `${days}d restantes`
  }
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const hrs = hours % 24
    return `${days}d ${hrs}h`
  }
  return `${hours}h restantes`
}

function getProgressPercent(current: number, target: number): number {
  return Math.min(Math.round((current / target) * 100), 100)
}

function getCommunityCompletion(): number {
  const state = loadChallengeState()
  const completedCount = Object.values(state.completed).filter(Boolean).length
  return Math.round((completedCount / CHALLENGES.length) * 100)
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFETTI BURST
// ═══════════════════════════════════════════════════════════════════════════════

function ConfettiBurst({ show }: { show: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: 30 + Math.random() * 40,
        delay: Math.random() * 0.4,
        color: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'][
          Math.floor(Math.random() * 6)
        ],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
        driftX: (Math.random() - 0.5) * 120,
      })),
    []
  )

  if (!show) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            left: `${p.x}%`,
            top: '10%',
            rotate: p.rotation,
          }}
          initial={{ y: 0, opacity: 1, x: 0, scale: 0 }}
          animate={{
            y: 350,
            opacity: 0,
            x: p.driftX,
            scale: 1,
            rotate: p.rotation + 720,
          }}
          transition={{
            duration: 1.8 + Math.random() * 0.8,
            delay: p.delay,
            ease: 'easeOut' as const,
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SVG PROGRESS RING
// ═══════════════════════════════════════════════════════════════════════════════

function ProgressRing({ percentage, size = 120, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative r35-progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress fill */}
        <motion.circle
          className="r35-progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' as const }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={percentage}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
          className="text-2xl font-black text-emerald-600 dark:text-emerald-400"
        >
          {percentage}%
        </motion.span>
        <span className="text-[9px] text-muted-foreground font-medium">completado</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RANK BADGE
// ═══════════════════════════════════════════════════════════════════════════════

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <motion.div
        className="relative"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <Crown className="h-5 w-5 text-amber-400" />
        <motion.div
          className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    )
  }
  if (rank === 2) {
    return (
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.3 }}
      >
        <Medal className="h-5 w-5 text-slate-400" />
      </motion.div>
    )
  }
  if (rank === 3) {
    return (
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.6 }}
      >
        <Medal className="h-5 w-5" style={{ color: '#cd7f32' }} />
      </motion.div>
    )
  }
  return (
    <span className="flex items-center justify-center h-5 w-5 text-xs font-bold text-muted-foreground">
      {rank}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHALLENGE CARD
// ═══════════════════════════════════════════════════════════════════════════════

function ChallengeCard({
  challenge,
  isActive,
  onAction,
  onIncrement,
}: {
  challenge: Challenge
  isActive: boolean
  onAction: () => void
  onIncrement: () => void
}) {
  const progress = getProgressPercent(challenge.currentProgress, challenge.targetCount)
  const isComplete = challenge.currentProgress >= challenge.targetCount

  const colorMap: Record<string, { bar: string; glow: string; bg: string; badge: string }> = {
    emerald: {
      bar: 'bg-emerald-500',
      glow: 'shadow-emerald-500/25',
      bg: 'from-emerald-500/10 to-emerald-600/5',
      badge: 'border-emerald-500/30 bg-emerald-500/10',
    },
    amber: {
      bar: 'bg-amber-500',
      glow: 'shadow-amber-500/25',
      bg: 'from-amber-500/10 to-amber-600/5',
      badge: 'border-amber-500/30 bg-amber-500/10',
    },
    violet: {
      bar: 'bg-violet-500',
      glow: 'shadow-violet-500/25',
      bg: 'from-violet-500/10 to-violet-600/5',
      badge: 'border-violet-500/30 bg-violet-500/10',
    },
  }

  const colors = colorMap[challenge.color] || colorMap.emerald

  return (
    <motion.div
      variants={cardVariants}
      className="relative group"
    >
      {/* Active glow border */}
      {isActive && !isComplete && (
        <motion.div
          className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${challenge.color === 'emerald' ? 'from-emerald-500 via-teal-400 to-emerald-500' : challenge.color === 'amber' ? 'from-amber-500 via-yellow-400 to-amber-500' : 'from-violet-500 via-purple-400 to-violet-500'} opacity-50 blur-[1px]`}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
          aria-hidden="true"
        />
      )}

      {/* Card */}
      <motion.div
        className={`relative overflow-hidden rounded-xl p-4 r35-challenge-card ${
          isActive ? 'r35-challenge-card-active' : ''
        } ${isComplete ? 'ring-2 ring-emerald-500/50' : ''}`}
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
        style={{
          boxShadow: isActive && !isComplete
            ? `0 8px 32px rgba(0,0,0,0.1)`
            : '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Gradient background */}
        <div
          className={`absolute inset-0 -z-10 bg-gradient-to-br ${colors.bg} ${
            isComplete ? 'from-emerald-500/15 to-emerald-600/10' : ''
          }`}
          aria-hidden="true"
        />

        {/* Challenge icon and type badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.div
              className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl ${
                isComplete
                  ? 'bg-emerald-500/20'
                  : `bg-gradient-to-br ${challenge.color === 'emerald' ? 'from-emerald-500/20 to-emerald-600/10' : challenge.color === 'amber' ? 'from-amber-500/20 to-amber-600/10' : 'from-violet-500/20 to-violet-600/10'}`
              }`}
              animate={isComplete ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.6, repeat: isComplete ? 1 : 0 }}
            >
              {isComplete ? '✅' : challenge.icon}
            </motion.div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{challenge.title}</h3>
              <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{challenge.description}</p>
            </div>
          </div>
          <motion.div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] font-bold r35-reward-badge ${
              isComplete ? 'r35-reward-badge-glow border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : `${colors.badge} text-foreground`
            }`}
            animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Zap className="h-3 w-3" />
            {challenge.rewardPoints}
          </motion.div>
        </div>

        {/* Progress section */}
        {challenge.type === 'rate_earn' && !isComplete ? (
          <div className="mb-3">
            <div className="flex gap-1 mb-2">
              {Array.from({ length: challenge.targetCount }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: i * 0.08 }}
                >
                  <Star
                    className={`h-5 w-5 ${
                      i < challenge.currentProgress
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-muted-foreground/25'
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-muted-foreground">
                {challenge.currentProgress}/{challenge.targetCount} {challenge.type === 'refer_friends' ? 'amigos' : 'produtos'}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary/80 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : colors.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' as const }}
              />
            </div>
          </div>
        )}

        {/* Bottom row: deadline + action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatCountdown(challenge.deadlineHours)}</span>
          </div>
          {isComplete ? (
            <motion.div
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completo!
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAction}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow"
            >
              {challenge.actionLabel}
              <ChevronRight className="h-3 w-3" />
            </motion.button>
          )}
        </div>

        {/* Increment button for demo */}
        {!isComplete && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onIncrement()
            }}
            className="absolute top-2 right-2 h-6 w-6 min-h-[44px] min-w-[44px] rounded-full bg-secondary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Simular progresso"
          >
            <span className="text-[10px] font-bold text-muted-foreground">+1</span>
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD ROW
// ═══════════════════════════════════════════════════════════════════════════════

function LeaderboardRow({ entry, rank, index }: { entry: LeaderboardEntry; rank: number; index: number }) {
  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors r35-leaderboard-row ${
        entry.isCurrentUser
          ? 'r35-leaderboard-highlight bg-primary/10 border border-primary/25'
          : 'hover:bg-secondary/50'
      }`}
    >
      {/* Rank badge */}
      <div className="w-6 shrink-0 flex items-center justify-center">
        <RankBadge rank={rank} />
      </div>

      {/* Avatar with gradient ring */}
      <div className="relative shrink-0">
        <motion.div
          className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${entry.gradientFrom}, ${entry.gradientTo})`,
            boxShadow: `0 0 0 2px rgba(255,255,255,0.2), 0 0 12px ${entry.gradientFrom}40`,
          }}
          whileHover={{ scale: 1.12 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
        >
          {entry.initials}
        </motion.div>
        {entry.isCurrentUser && (
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center border-2 border-background"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-[7px] font-black text-primary-foreground">V</span>
          </motion.div>
        )}
      </div>

      {/* Name and info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold truncate">{entry.name}</span>
          {entry.isCurrentUser && (
            <motion.span
              className="shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Você
            </motion.span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {entry.challengesCompleted} desafios completos
        </span>
      </div>

      {/* Points */}
      <motion.div
        className="shrink-0 text-right"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.06 + 0.2 }}
      >
        <span className="text-xs font-black text-primary">{entry.points.toLocaleString('pt-BR')}</span>
        <div className="flex items-center justify-end gap-0.5">
          <Zap className="h-2.5 w-2.5 text-amber-500" />
          <span className="text-[9px] text-muted-foreground">pts</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// REWARD PREVIEW CARD
// ═══════════════════════════════════════════════════════════════════════════════

function RewardCard({ reward, userCompletedCount }: { reward: RewardPreview; userCompletedCount: number }) {
  const isUnlocked = userCompletedCount >= reward.requiredChallenges
  const IconComp = reward.icon

  const colorMap: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
    emerald: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/20',
    },
    amber: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/20',
    },
    violet: {
      border: 'border-violet-500/30',
      bg: 'bg-violet-500/10',
      text: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-500/20',
    },
  }

  const colors = colorMap[reward.color] || colorMap.emerald

  return (
    <motion.div
      variants={scaleIn}
      className={`relative overflow-hidden rounded-xl p-3 border ${colors.border} ${isUnlocked ? '' : 'opacity-70'}`}
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 22 }}
    >
      {/* Glow for unlocked */}
      {isUnlocked && (
        <motion.div
          className="absolute -top-8 -right-8 h-20 w-20 rounded-full blur-2xl"
          style={{ backgroundColor: reward.color === 'emerald' ? 'rgba(16,185,129,0.15)' : reward.color === 'amber' ? 'rgba(245,158,11,0.15)' : 'rgba(139,92,246,0.15)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          aria-hidden="true"
        />
      )}

      <div className="flex items-start gap-3">
        <motion.div
          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${colors.iconBg}`}
          animate={isUnlocked ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <IconComp className={`h-5 w-5 ${colors.text}`} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-foreground">{reward.title}</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">{reward.description}</p>
          <div className="flex items-center gap-1 mt-1">
            <Target className={`h-3 w-3 ${colors.text}`} />
            <span className="text-[9px] font-medium text-muted-foreground">
              {reward.requiredChallenges} desafios {isUnlocked ? '✓' : 'necessários'}
            </span>
          </div>
        </div>
        {isUnlocked && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Gift className="h-4 w-4 text-emerald-500" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL SHARE
// ═══════════════════════════════════════════════════════════════════════════════

function SocialShareButton({ completedCount, totalChallenges }: { completedCount: number; totalChallenges: number }) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const shareText = `🏆 Estou participando dos Desafios da Comunidade no DomPlace! Já completei ${completedCount}/${totalChallenges} desafios. Venha participar também!`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Desafios da Comunidade - DomPlace',
          text: shareText,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        })
        return
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {
        /* ignore */
      }
    }
  }, [completedCount, totalChallenges])

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 text-xs font-semibold text-primary hover:from-primary/20 hover:to-emerald-500/20 transition-colors"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="copied"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
          </motion.div>
        ) : (
          <motion.div
            key="share"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Compartilhar</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELEBRATION OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════

function CelebrationOverlay({
  challenge,
  onDismiss,
}: {
  challenge: Challenge
  onDismiss: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 r35-celebration-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Confetti burst */}
      <ConfettiBurst show={true} />

      {/* Celebration card */}
      <motion.div
        className="relative z-10 bg-card rounded-2xl p-6 max-w-sm w-full border border-border/50"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
        initial={{ scale: 0.6, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 20, opacity: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
      >
        {/* Glow behind card */}
        <motion.div
          className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl"
          animate={{ scale: [1.3, 1, 1.3], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-hidden="true"
        />

        <div className="relative text-center">
          <motion.div
            className="text-5xl mb-3"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.8, repeat: 2 }}
          >
            🎉
          </motion.div>
          <motion.h3
            className="text-lg font-black text-foreground mb-1"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Desafio Completo!
          </motion.h3>
          <motion.p
            className="text-sm text-muted-foreground mb-4"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Parabéns! Você completou &quot;{challenge.title}&quot;
          </motion.p>

          {/* Reward details */}
          <motion.div
            className="bg-gradient-to-br from-amber-500/15 to-emerald-500/15 rounded-xl p-4 mb-4 border border-amber-500/20"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Trophy className="h-6 w-6 text-amber-500" />
              </motion.div>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                +{challenge.rewardPoints}
              </span>
              <span className="text-xs font-medium text-amber-600/70 dark:text-amber-400/70">pontos</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Seus pontos foram adicionados ao total
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDismiss}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Continuar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATED STAT COUNTER
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedStat({ value, label, icon: Icon }: { value: number; label: string; icon: typeof Users }) {
  const formatted = useMemo(() => value.toLocaleString('pt-BR'), [value])

  return (
    <motion.div
      className="flex items-center gap-2"
      variants={fadeInUp}
    >
      <motion.div
        className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      >
        <Icon className="h-4 w-4 text-primary" />
      </motion.div>
      <div>
        <motion.span
          className="text-sm font-black text-foreground block leading-tight"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {formatted}
        </motion.span>
        <span className="text-[9px] text-muted-foreground font-medium">{label}</span>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

function ChallengeSkeleton() {
  return (
    <div className="rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div>
          <Skeleton className="h-5 w-48 mb-1.5" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-5">
        <Skeleton className="h-12 w-24 rounded-xl" />
        <Skeleton className="h-12 w-24 rounded-xl" />
        <Skeleton className="h-12 w-24 rounded-xl" />
      </div>

      {/* Challenge cards */}
      <div className="space-y-3 mb-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>

      {/* Bottom section */}
      <div className="flex gap-4">
        <div className="w-1/2 space-y-2">
          <Skeleton className="h-8 w-full rounded-xl" />
          <Skeleton className="h-8 w-full rounded-xl" />
          <Skeleton className="h-8 w-full rounded-xl" />
        </div>
        <Skeleton className="w-32 h-32 rounded-full" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function CommunityChallenge() {
  const [isLoading, setIsLoading] = useState(true)
  const [challengeState, setChallengeState] = useState<ChallengeState>(() => loadChallengeState())
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0)
  const [celebratingChallenge, setCelebratingChallenge] = useState<Challenge | null>(null)
  const [deadlineTimers, setDeadlineTimers] = useState<Record<string, number>>({})

  // Loading delay for skeleton
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (challengeState.lastUpdated > 0) {
      saveChallengeState({ ...challengeState, lastUpdated: Date.now() })
    }
  }, [challengeState])

  // Rotate active challenge every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChallengeIndex((prev) => (prev + 1) % CHALLENGES.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Tick down deadlines
  useEffect(() => {
    const interval = setInterval(() => {
      setDeadlineTimers((prev) => {
        const next = { ...prev }
        CHALLENGES.forEach((c) => {
          next[c.id] = (next[c.id] ?? c.deadlineHours) > 0
            ? (next[c.id] ?? c.deadlineHours) - 1
            : 0
        })
        return next
      })
    }, 3600000) // every hour
    return () => clearInterval(interval)
  }, [])

  // Merge challenges with persisted state
  const enrichedChallenges = useMemo(() => {
    return CHALLENGES.map((c) => ({
      ...c,
      currentProgress: challengeState.progress[c.id] ?? c.currentProgress,
      deadlineHours: deadlineTimers[c.id] ?? c.deadlineHours,
    }))
  }, [challengeState.progress, deadlineTimers])

  // Compute community completion percentage
  const communityCompletion = useMemo(() => {
    const completedCount = Object.values(challengeState.completed).filter(Boolean).length
    return Math.round((completedCount / CHALLENGES.length) * 100)
  }, [challengeState.completed])

  const completedChallengesCount = useMemo(
    () => Object.values(challengeState.completed).filter(Boolean).length,
    [challengeState.completed]
  )

  // Handle incrementing progress for a challenge
  const handleIncrementProgress = useCallback((challengeId: string) => {
    setChallengeState((prev) => {
      const challenge = CHALLENGES.find((c) => c.id === challengeId)
      if (!challenge) return prev
      if (prev.completed[challengeId]) return prev

      const currentProgress = prev.progress[challengeId] ?? 0
      if (currentProgress >= challenge.targetCount) return prev

      const newProgress = currentProgress + 1
      const isComplete = newProgress >= challenge.targetCount

      return {
        ...prev,
        progress: { ...prev.progress, [challengeId]: newProgress },
        completed: isComplete ? { ...prev.completed, [challengeId]: true } : prev.completed,
      }
    })
  }, [])

  // Watch for newly completed challenges to trigger celebration
  useEffect(() => {
    const newlyCompleted = enrichedChallenges.find(
      (c) => c.currentProgress >= c.targetCount && challengeState.completed[c.id]
    )
    if (newlyCompleted && !celebratingChallenge) {
      const timer = setTimeout(() => {
        setCelebratingChallenge(newlyCompleted)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [enrichedChallenges, challengeState.completed, celebratingChallenge])

  // Dismiss celebration
  const handleDismissCelebration = useCallback(() => {
    setCelebratingChallenge(null)
  }, [])

  // Handle challenge action
  const handleChallengeAction = useCallback((challengeId: string) => {
    handleIncrementProgress(challengeId)
  }, [handleIncrementProgress])

  // Update leaderboard user points based on completed challenges
  const leaderboardWithUserPoints = useMemo(() => {
    const userPoints = LEADERBOARD.find((e) => e.isCurrentUser)?.points ?? 450
    const bonusPoints = completedChallengesCount * 150
    return LEADERBOARD.map((entry) =>
      entry.isCurrentUser
        ? { ...entry, points: userPoints + bonusPoints, challengesCompleted: 6 + completedChallengesCount }
        : entry
    ).sort((a, b) => b.points - a.points)
  }, [completedChallengesCount])

  if (isLoading) {
    return <ChallengeSkeleton />
  }

  return (
    <section className="mt-6 relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CELEBRATION OVERLAY */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {celebratingChallenge && (
          <CelebrationOverlay
            challenge={celebratingChallenge}
            onDismiss={handleDismissCelebration}
          />
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CHALLENGE HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="flex items-center gap-3 mb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
      >
        {/* Trophy icon with glow */}
        <motion.div
          className="relative r35-challenge-glow"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <motion.div
            className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-amber-400/30 to-amber-600/20 blur-lg"
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            aria-hidden="true"
          />
          <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}
          >
            <Trophy className="h-5 w-5 text-white" />
          </div>
        </motion.div>

        <div className="flex-1 min-w-0">
          <motion.h2
            className="text-base sm:text-lg font-black r62-heading-gradient"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            style={{
              backgroundImage: 'linear-gradient(90deg, #f59e0b 0%, #10b981 25%, #8b5cf6 50%, #ec4899 75%, #f59e0b 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Desafios da Comunidade
          </motion.h2>
          <p className="text-[11px] text-muted-foreground">
            Complete desafios e ganhe pontos exclusivos
          </p>
        </div>

        {/* Social share button */}
        <SocialShareButton
          completedCount={completedChallengesCount}
          totalChallenges={CHALLENGES.length}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* COMMUNITY STATS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="flex items-center gap-3 mb-5 overflow-x-auto hide-scrollbar -mx-1 px-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatedStat value={COMMUNITY_STATS.totalParticipants} label="Participantes" icon={Users} />
        <AnimatedStat value={COMMUNITY_STATS.challengesCompleted} label="Desafios Completos" icon={Target} />
        <AnimatedStat value={COMMUNITY_STATS.activeThisWeek} label="Ativos esta semana" icon={Flame} />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ACTIVE CHALLENGES */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
            <h3 className="text-sm font-bold text-foreground">Desafios Ativos</h3>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">
            {completedChallengesCount}/{CHALLENGES.length} completos
          </span>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {enrichedChallenges.map((challenge, i) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              isActive={activeChallengeIndex === i}
              onAction={() => handleChallengeAction(challenge.id)}
              onIncrement={() => handleIncrementProgress(challenge.id)}
            />
          ))}
        </motion.div>

        {/* Active indicator dots */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {enrichedChallenges.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setActiveChallengeIndex(i)}
              className="relative h-2 rounded-full transition-colors"
              style={{ width: activeChallengeIndex === i ? 24 : 8 }}
              animate={activeChallengeIndex === i ? { backgroundColor: 'rgb(16,185,129)' } : { backgroundColor: 'rgba(148,163,184,0.3)' }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              aria-label={`Desafio ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* LEADERBOARD + PROGRESS RING */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Leaderboard */}
        <motion.div
          className="lg:col-span-2"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">Ranking da Comunidade</h3>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          </div>

          <div className="rounded-xl border border-border/50 bg-card/50 dark:bg-card/30 p-2 space-y-1 max-h-[420px] overflow-y-auto">
            <AnimatePresence>
              {leaderboardWithUserPoints.map((entry, index) => (
                <LeaderboardRow
                  key={entry.id}
                  entry={entry}
                  rank={index + 1}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Progress Ring + Summary */}
        <motion.div
          className="flex flex-col items-center"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-2 mb-4 self-start">
            <Heart className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-bold text-foreground">Seu Progresso</h3>
          </div>

          <ProgressRing percentage={communityCompletion} size={130} strokeWidth={10} />

          <div className="mt-4 w-full space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50">
              <span className="text-[10px] text-muted-foreground">Desafios completos</span>
              <span className="text-xs font-bold text-foreground">{completedChallengesCount}/{CHALLENGES.length}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50">
              <span className="text-[10px] text-muted-foreground">Pontos ganhos</span>
              <span className="text-xs font-bold text-primary">
                {enrichedChallenges
                  .filter((c) => challengeState.completed[c.id])
                  .reduce((sum, c) => sum + c.rewardPoints, 0)
                  .toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50">
              <span className="text-[10px] text-muted-foreground">Sua posição</span>
              <span className="text-xs font-bold text-foreground">
                #{leaderboardWithUserPoints.findIndex((e) => e.isCurrentUser) + 1}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* REWARDS PREVIEW */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Gift className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-bold text-foreground">Prêmios Disponíveis</h3>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {REWARDS.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userCompletedCount={completedChallengesCount}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* BOTTOM SHIMMER FOOTER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.span
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="text-[10px] text-muted-foreground font-medium"
          style={{
            backgroundImage: 'linear-gradient(90deg, hsl(var(--muted-foreground)) 0%, hsl(var(--primary)) 50%, hsl(var(--muted-foreground)) 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {COMMUNITY_STATS.totalParticipants.toLocaleString('pt-BR')} participantes · Dom Eliseu, PA
        </motion.span>
      </motion.div>
    </section>
  )
}
