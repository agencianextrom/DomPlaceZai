'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Flame, Star, Truck, Zap, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const STORAGE_KEY = 'domplace-daily-streak'

interface StreakData {
  currentStreak: number
  lastClaimDate: string
  totalPoints: number
  claimedDays: number[]
}

const defaultStreak: StreakData = {
  currentStreak: 0,
  lastClaimDate: '',
  totalPoints: 0,
  claimedDays: [],
}

function loadStreak(): StreakData {
  if (typeof window === 'undefined') return defaultStreak
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : defaultStreak
  } catch {
    return defaultStreak
  }
}

function saveStreak(data: StreakData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

// Reward tiers
const rewardTiers = [
  { day: 1, label: 'R$2', desc: 'R$2 de desconto', icon: Zap, color: 'from-emerald-400 to-teal-500' },
  { day: 3, label: 'R$5', desc: 'R$5 de desconto', icon: Star, color: 'from-amber-400 to-orange-500' },
  { day: 5, label: 'Frete', desc: 'Frete Grátis', icon: Truck, color: 'from-violet-400 to-purple-500' },
  { day: 7, label: 'R$10', desc: 'R$10 de desconto', icon: Gift, color: 'from-rose-400 to-pink-500' },
]

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function isSameDay(date1: string, date2: string): boolean {
  if (!date1 || !date2) return false
  return date1.split('T')[0] === date2.split('T')[0]
}

// Enhanced ConfettiBurst with varied shapes and trails
function ConfettiBurst({ show }: { show: boolean }) {
  if (!show) return null

  const particles = Array.from({ length: 32 }).map((_, i) => {
    const colors = ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#fbbf24', '#a78bfa']
    const color = colors[i % colors.length]
    const angle = (i / 32) * 360
    const distance = 70 + Math.random() * 100
    const x = Math.cos((angle * Math.PI) / 180) * distance
    const y = Math.sin((angle * Math.PI) / 180) * distance - 40
    const size = 5 + Math.random() * 8
    const duration = 0.7 + Math.random() * 0.5
    const isStar = Math.random() > 0.6
    const rotation = Math.random() * 720

    return (
      <motion.div
        key={i}
        initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
        animate={{ opacity: [1, 1, 0], x, y, scale: [0, 1.3, 0], rotate: rotation }}
        transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        className="absolute r43-confetti-particle"
        style={{
          backgroundColor: isStar ? color : 'transparent',
          border: isStar ? 'none' : `2px solid ${color}`,
          borderRadius: isStar ? '2px' : '50%',
          width: isStar ? size : size * 0.5,
          height: isStar ? size * 0.5 : size,
          left: '50%',
          top: '50%',
          boxShadow: `0 0 ${size}px ${color}60, 0 0 ${size * 2}px ${color}20`,
        }}
      />
    )
  })

  // Extra sparkle trail particles
  const sparkles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * 360 + 15
    const distance = 40 + Math.random() * 60
    const x = Math.cos((angle * Math.PI) / 180) * distance
    const y = Math.sin((angle * Math.PI) / 180) * distance - 20

    return (
      <motion.div
        key={`sparkle-${i}`}
        initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
        animate={{
          opacity: [0, 1, 0],
          x,
          y,
          scale: [0, 0.6, 0],
        }}
        transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' as const }}
        className="absolute r43-confetti-sparkle"
        style={{
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(251,191,36,0.4) 60%, transparent 100%)',
          left: '50%',
          top: '50%',
        }}
      />
    )
  })

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden r43-confetti-container">
      {particles}
      {sparkles}
    </div>
  )
}

// Animated SVG checkmark
function CheckMarkSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="r43-checkmark-svg">
      <motion.path
        d="M2.5 7L5.5 10L11.5 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
        className="r43-checkmark-path"
      />
    </svg>
  )
}

function getInitialStreak(): StreakData {
  if (typeof window === 'undefined') return defaultStreak
  const data = loadStreak()
  const today = getToday()
  const last = data.lastClaimDate
  if (last && last !== today) {
    const lastDate = new Date(last)
    const todayDate = new Date(today)
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000)
    if (diffDays > 1) {
      const resetData = { ...defaultStreak, totalPoints: data.totalPoints }
      saveStreak(resetData)
      return resetData
    }
  }
  return data
}

export function DailyRewards() {
  const [streak, setStreak] = useState<StreakData>(getInitialStreak)
  const [showConfetti, setShowConfetti] = useState(false)
  const [justClaimed, setJustClaimed] = useState(false)
  const [animatedPoints, setAnimatedPoints] = useState(getInitialStreak().totalPoints)

  const canClaimToday = !isSameDay(streak.lastClaimDate, getToday())
  const currentDay = Math.min(streak.currentStreak + 1, 7)
  const streakFire = streak.currentStreak >= 3

  // Get current reward
  const currentReward = rewardTiers.find(r => r.day === currentDay)
  const nextReward = rewardTiers.find(r => r.day > currentDay)

  const handleClaimReward = useCallback(() => {
    if (!canClaimToday) return

    const today = getToday()
    const isConsecutive = isSameDay(
      new Date(new Date(streak.lastClaimDate).getTime() + 86400000).toISOString(),
      today
    ) || streak.lastClaimDate === ''

    const newStreak = isConsecutive || streak.lastClaimDate === ''
      ? streak.currentStreak + 1
      : 1

    // Points earned today
    const pointsEarned = 10 + newStreak * 5

    const updatedData: StreakData = {
      currentStreak: newStreak,
      lastClaimDate: today,
      totalPoints: streak.totalPoints + pointsEarned,
      claimedDays: [...streak.claimedDays, newStreak],
    }

    setStreak(updatedData)
    saveStreak(updatedData)
    setJustClaimed(true)
    setShowConfetti(true)

    // Show reward toast
    if (currentReward) {
      toast.success(`Prêmio resgatado: ${currentReward.desc}! 🎉`, {
        description: `Você ganhou ${pointsEarned} pontos. Streak: ${newStreak} dias`,
      })
    }

    setTimeout(() => {
      setShowConfetti(false)
    }, 1200)

    setTimeout(() => {
      setJustClaimed(false)
    }, 3000)
  }, [canClaimToday, streak, currentReward])

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Gradient background */}
      <div className="bg-gradient-to-br from-emerald-50 via-card to-amber-50 dark:from-emerald-900/20 dark:via-card dark:to-amber-900/20 rounded-xl border border-primary/15 p-4 r43-daily-card">
        <ConfettiBurst show={showConfetti} />

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-sm r43-header-icon">
              <Gift className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                Recompensas Diárias
                {streakFire && (
                  <motion.span
                    className="r43-streak-fire"
                    animate={{ scale: [1, 1.35, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, type: 'spring' as const, stiffness: 400, damping: 8 }}
                  >
                    🔥
                  </motion.span>
                )}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {streak.currentStreak > 0
                  ? `${streak.currentStreak} dias consecutivos · ${animatedPoints} pts`
                  : 'Faça login todo dia para ganhar prêmios!'
                }
              </p>
            </div>
          </div>

          {/* Points badge */}
          <motion.div
            animate={justClaimed ? { scale: [1, 1.3, 1] } : {}}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm r43-points-badge"
          >
            <span className="text-xs font-bold text-white">{animatedPoints}</span>
          </motion.div>
        </div>

        {/* 7-day streak tracker */}
        <div className="flex items-center justify-between gap-1 mb-3 px-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const day = i + 1
            const isCompleted = streak.claimedDays.includes(day)
            const isCurrent = day === currentDay && canClaimToday
            const isPast = day < currentDay
            const isRewardDay = rewardTiers.some(r => r.day === day)

            return (
              <div key={day} className="flex flex-col items-center gap-1 flex-1">
                {/* Day circle */}
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0, ease: 'easeInOut' as const }}
                  className={`h-8 w-8 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 r43-day-card r43-day-card-${isCompleted ? 'completed' : isCurrent ? 'current' : isPast ? 'past' : 'locked'} ${
                    isRewardDay && !isCompleted ? 'r43-day-card-reward' : ''
                  } ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'bg-primary/20 text-primary ring-2 ring-primary/50'
                        : isPast
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-secondary/50 text-muted-foreground/50'
                  }`}
                >
                  {isCompleted ? (
                    <CheckMarkSVG />
                  ) : (
                    day
                  )}
                </motion.div>

                {/* Reward label */}
                <span className={`text-[8px] font-medium ${
                  isCompleted ? 'text-primary r43-reward-label-claimed' : 'text-muted-foreground/60'
                }`}>
                  {rewardTiers.find(r => r.day === day)?.label || '—'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress line with shimmer */}
        <div className="relative h-2 bg-muted rounded-full mb-3 overflow-hidden r43-progress-track">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(Math.min(streak.currentStreak, 7) / 7) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' as const }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-amber-500 rounded-full r43-progress-fill"
          />
          {/* Shimmer overlay on progress */}
          <div className="absolute inset-y-0 left-0 r43-progress-shimmer" style={{
            width: `${(Math.min(streak.currentStreak, 7) / 7) * 100}%`,
            borderRadius: '9999px',
            overflow: 'hidden',
          }}>
            <div className="r43-progress-shimmer-inner" />
          </div>
        </div>

        {/* Claim button */}
        <AnimatePresence mode="wait">
          {canClaimToday ? (
            <motion.div
              key="claim"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              <Button
                onClick={handleClaimReward}
                className="w-full h-11 bg-gradient-to-r from-primary via-emerald-600 to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-white font-semibold rounded-xl btn-glow text-sm r43-claim-button"
              >
                {currentReward && (
                  <currentReward.icon className="h-4 w-4 mr-2" />
                )}
                Resgate seu prêmio diário!
                {currentReward && (
                  <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {currentReward.desc}
                  </span>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="claimed"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="w-full h-11 bg-primary/10 text-primary font-semibold rounded-xl flex items-center justify-center text-sm r43-claimed-bar"
            >
              ✅ Prêmio resgatado hoje!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next reward preview */}
        {nextReward && streak.currentStreak < 7 && (
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <ChevronRight className="h-3 w-3 text-muted-foreground rotate-180" />
            <p className="text-[10px] text-muted-foreground">
              Amanhã (dia {nextReward.day}):{' '}
              <span className="font-semibold text-primary">{nextReward.desc}</span>
            </p>
          </div>
        )}

        {/* All rewards legend with tier badge glow */}
        <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
          {rewardTiers.map(tier => (
            <div key={tier.day} className="flex items-center gap-1 r43-tier-badge-wrapper">
              <div className={`h-4 w-4 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center r43-tier-badge`}>
                <tier.icon className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-[9px] text-muted-foreground">
                Dia {tier.day}: {tier.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
