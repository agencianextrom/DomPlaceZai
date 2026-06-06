'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Flame, Star, Truck, Zap, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const STORAGE_KEY = 'domplace-daily-checkin'

interface CheckinData {
  currentStreak: number
  lastCheckinDate: string
  totalPoints: number
  checkedDays: number[]
  multiplier: number
}

const defaultData: CheckinData = {
  currentStreak: 0,
  lastCheckinDate: '',
  totalPoints: 0,
  checkedDays: [],
  multiplier: 1,
}

function loadData(): CheckinData {
  if (typeof window === 'undefined') return defaultData
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : defaultData
  } catch {
    return defaultData
  }
}

function saveData(data: CheckinData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function isSameDay(a: string, b: string): boolean {
  if (!a || !b) return false
  return a.split('T')[0] === b.split('T')[0]
}

// Reward tiers
const rewardTiers = [
  { day: 1, label: 'R$2', desc: 'R$2 de desconto', icon: Zap, color: 'from-emerald-400 to-teal-500' },
  { day: 3, label: 'R$5', desc: 'R$5 de desconto', icon: Star, color: 'from-amber-400 to-orange-500' },
  { day: 5, label: 'Frete', desc: 'Frete Grátis', icon: Truck, color: 'from-violet-400 to-purple-500' },
  { day: 7, label: 'R$10', desc: 'R$10 de desconto', icon: Gift, color: 'from-rose-400 to-pink-500' },
]

// Floating particles
function FloatingParticle({ delay, color, size, x, y }: { delay: number; color: string; size: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ backgroundColor: color, width: size, height: size, left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        opacity: [0.2, 0.6, 0.2],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

// Floating reward-themed emoji particles
function RewardEmojiParticle({ emoji, delay, x, y }: { emoji: string; delay: number; x: number; y: number }) {
  return (
    <motion.span
      className="absolute text-lg pointer-events-none z-10 select-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -14, 0],
        x: [0, 6, -4, 0],
        opacity: [0, 0.7, 0.7, 0],
        scale: [0.6, 1.1, 1, 0.6],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
      aria-hidden="true"
    >
      {emoji}
    </motion.span>
  )
}

// Confetti burst
function ConfettiBurst({ show }: { show: boolean }) {
  if (!show) return null

  const particles = Array.from({ length: 30 }).map((_, i) => {
    const colors = ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#f97316']
    const color = colors[i % colors.length]
    const angle = (i / 30) * 360
    const distance = 80 + Math.random() * 120
    const x = Math.cos((angle * Math.PI) / 180) * distance
    const y = Math.sin((angle * Math.PI) / 180) * distance - 40
    const size = 3 + Math.random() * 7
    const duration = 0.6 + Math.random() * 0.5

    return (
      <motion.div
        key={i}
        initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
        animate={{ opacity: 0, x, y, scale: 0, rotate: Math.random() * 1080 }}
        transition={{ duration, ease: 'easeOut' }}
        className="absolute rounded-sm"
        style={{
          backgroundColor: color,
          width: size,
          height: size,
          left: '50%',
          top: '50%',
        }}
      />
    )
  })

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles}
    </div>
  )
}

// Animated check mark with glow
function AnimatedCheck({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.svg
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
          className="h-4 w-4 text-white"
          style={{ filter: 'drop-shadow(0 0 4px rgba(52, 211, 153, 0.7)) drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))' }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  )
}

function getInitialData(): CheckinData {
  if (typeof window === 'undefined') return defaultData
  const data = loadData()
  const today = getToday()
  const last = data.lastCheckinDate

  if (last && last !== today) {
    const lastDate = new Date(last)
    const todayDate = new Date(today)
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000)
    if (diffDays > 1) {
      // Reset streak but keep total points
      const resetData: CheckinData = {
        ...defaultData,
        totalPoints: data.totalPoints,
        multiplier: 1,
      }
      saveData(resetData)
      return resetData
    }
  }
  return data
}

export function DailyRewards() {
  const [data, setData] = useState<CheckinData>(getInitialData)
  const [showConfetti, setShowConfetti] = useState(false)
  const [justClaimed, setJustClaimed] = useState(false)
  const [animatingDay, setAnimatingDay] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const canClaimToday = !isSameDay(data.lastCheckinDate, getToday())
  const currentDay = Math.min(data.currentStreak + 1, 7)
  const streakFire = data.currentStreak >= 3

  // Calculate multiplier based on streak
  const currentMultiplier = Math.min(1 + Math.floor(data.currentStreak / 3), 3)

  const currentReward = rewardTiers.find(r => r.day === currentDay)
  const nextReward = rewardTiers.find(r => r.day > currentDay)

  // Animated points counter
  const [displayPoints, setDisplayPoints] = useState(0)
  useEffect(() => {
    const target = data.totalPoints
    if (displayPoints < target) {
      const timer = setTimeout(() => {
        setDisplayPoints(prev => Math.min(prev + Math.ceil((target - prev) / 10), target))
      }, 30)
      return () => clearTimeout(timer)
    }
  }, [data.totalPoints, displayPoints])

  const handleCheckIn = useCallback(() => {
    if (!canClaimToday) return

    const today = getToday()
    const isConsecutive = isSameDay(
      new Date(new Date(data.lastCheckinDate).getTime() + 86400000).toISOString(),
      today
    ) || data.lastCheckinDate === ''

    const newStreak = isConsecutive || data.lastCheckinDate === '' ? data.currentStreak + 1 : 1
    const pointsEarned = 10 + newStreak * 5
    const newMultiplier = Math.min(1 + Math.floor(newStreak / 3), 3)

    const updatedData: CheckinData = {
      currentStreak: newStreak,
      lastCheckinDate: today,
      totalPoints: data.totalPoints + pointsEarned * newMultiplier,
      checkedDays: [...data.checkedDays, newStreak],
      multiplier: newMultiplier,
    }

    setData(updatedData)
    saveData(updatedData)
    setJustClaimed(true)
    setShowConfetti(true)
    setAnimatingDay(newStreak)

    if (currentReward) {
      toast.success(`Prêmio resgatado: ${currentReward.desc}! 🎉`, {
        description: `+${pointsEarned * newMultiplier} pontos (${newMultiplier}x multiplicador)`,
      })
    }

    setTimeout(() => setShowConfetti(false), 1200)
    setTimeout(() => setAnimatingDay(null), 2000)
    setTimeout(() => setJustClaimed(false), 3000)
  }, [canClaimToday, data, currentReward])

  return (
    <div className="relative" ref={containerRef}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 200 }}
        className="relative rounded-2xl overflow-hidden r62-card-lift"
        whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(16, 185, 129, 0.15), 0 4px 12px rgba(16, 185, 129, 0.08)' }}
      >
        {/* Gradient background with pattern */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-[1px]">
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{
              boxShadow: [
                '0 0 20px rgba(16, 185, 129, 0.15)',
                '0 0 30px rgba(20, 184, 166, 0.25)',
                '0 0 20px rgba(6, 182, 212, 0.15)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative bg-gradient-to-br from-emerald-50 via-card to-amber-50 dark:from-emerald-950/30 dark:via-card dark:to-amber-950/20 rounded-2xl p-5">
            <ConfettiBurst show={showConfetti} />

            {/* Floating particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <FloatingParticle
                key={i}
                delay={i * 0.5}
                color={['#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i % 4]}
                size={3 + (i % 3) * 2}
                x={10 + (i * 12) % 80}
                y={10 + (i * 15) % 60}
              />
            ))}

            {/* Floating reward-themed emoji particles */}
            <RewardEmojiParticle emoji="⭐" delay={0} x={8} y={15} />
            <RewardEmojiParticle emoji="💰" delay={2} x={75} y={55} />
            <RewardEmojiParticle emoji="❤️" delay={4} x={50} y={80} />
            <RewardEmojiParticle emoji="🎁" delay={1} x={90} y={12} />
            <RewardEmojiParticle emoji="🏆" delay={3} x={15} y={70} />
            <RewardEmojiParticle emoji="💎" delay={5} x={60} y={5} />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: 'spring' }}
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20"
                >
                  <Gift className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 r62-heading-gradient">
                    Recompensas Diárias
                    {streakFire && (
                      <motion.span
                        animate={{ scale: [1, 1.4, 1], rotate: [-8, 8, -8], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="inline-block r18-streak-fire-enhanced"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.6))' }}
                      >
                        🔥
                      </motion.span>
                    )}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {data.currentStreak > 0
                      ? `${data.currentStreak} dias consecutivos`
                      : 'Faça check-in todo dia para ganhar prêmios!'}
                  </p>
                </div>
              </div>

              {/* Points badge */}
              <motion.div
                animate={justClaimed ? { scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                className="text-center"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex flex-col items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-[10px] font-bold text-white leading-none">{displayPoints}</span>
                  <span className="text-[7px] text-amber-100 leading-none">pontos</span>
                </div>
              </motion.div>
            </div>

            {/* Multiplier badge */}
            {data.currentStreak >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 mb-3"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 border border-amber-300/50"
                >
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                    {currentMultiplier}x Multiplicador
                  </span>
                  <Sparkles className="h-3 w-3 text-amber-600" />
                </motion.div>
              </motion.div>
            )}

            {/* 7-day weekly calendar */}
            <div className="relative z-10 mb-4">
              <div className="flex items-center justify-between gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => {
                  const day = i + 1
                  const isCompleted = data.checkedDays.includes(day)
                  const isCurrent = day === currentDay && canClaimToday
                  const isPast = day < currentDay
                  const isLocked = day > currentDay + 1
                  const tierReward = rewardTiers.find(r => r.day === day)
                  const isAnimating = animatingDay === day

                  return (
                    <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                      {/* Day circle with animated glow ring for completed days */}
                      <motion.div
                        animate={
                          isCurrent
                            ? { scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(16,185,129,0.3)', '0 0 0 8px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0.3)'] }
                            : isAnimating
                              ? { scale: [1, 1.3, 1] }
                              : isCompleted
                                ? { boxShadow: ['0 0 0 0 rgba(16,185,129,0.15)', '0 0 8px 2px rgba(16,185,129,0.08)', '0 0 0 0 rgba(16,185,129,0.15)'] }
                                : {}
                        }
                        transition={{
                          duration: isCurrent ? 2 : isCompleted ? 3 : 0.5,
                          repeat: isCurrent || isCompleted ? Infinity : 0,
                          ease: 'easeInOut',
                          type: 'spring' as const,
                          stiffness: isAnimating ? 500 : undefined,
                        }}
                        className={`h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 relative ${
                          isCompleted
                            ? `bg-gradient-to-br ${tierReward?.color || 'from-primary to-emerald-600'} text-white shadow-md r18-calendar-dot-glow`
                            : isCurrent
                              ? 'bg-primary/20 text-primary ring-2 ring-primary/40 shadow-sm'
                              : isPast
                                ? 'bg-muted text-muted-foreground'
                                : isLocked
                                  ? 'bg-secondary/30 text-muted-foreground/40'
                                  : 'bg-secondary/50 text-muted-foreground/60'
                        }`}
                      >
                        {isCompleted ? (
                          <AnimatedCheck show={isCompleted} />
                        ) : isLocked ? (
                          <span className="text-[8px]">🔒</span>
                        ) : (
                          day
                        )}
                      </motion.div>

                      {/* Reward label with shimmer */}
                      <span className={`text-[8px] font-semibold text-center leading-tight relative ${
                        isCompleted ? 'r18-reward-shimmer text-primary' : isLocked ? 'text-muted-foreground/30' : 'text-muted-foreground/60'
                      }`}>
                        {tierReward?.label || '—'}
                      </span>

                      {/* Day name */}
                      <span className="text-[7px] text-muted-foreground/40 font-medium">
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Progress line connecting days with enhanced shimmer gradient */}
              <div className="relative h-1.5 bg-muted/50 rounded-full mt-2 overflow-hidden mx-1 r18-progress-shimmer">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(Math.min(data.currentStreak, 7) / 7) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-emerald-500 to-amber-500 rounded-full"
                />
                {/* Enhanced shimmer sweep */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/40 to-transparent r18-progress-shimmer-sweep"
                  animate={{ x: ['-100%', '300%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                />
              </div>
            </div>

            {/* Check-in button */}
            <AnimatePresence mode="wait">
              {canClaimToday ? (
                <motion.div
                  key="checkin"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="relative z-10"
                >
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleCheckIn}
                      className="w-full h-12 bg-gradient-to-r from-primary via-emerald-600 to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-white font-semibold rounded-xl text-sm shadow-lg shadow-primary/25 relative overflow-hidden r18-checkin-glow"
                    >
                      {/* Enhanced glow ring on button */}
                      <motion.div
                        className="absolute inset-0 rounded-xl r18-checkin-btn-glow"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      {/* Shimmer on button */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        {currentReward && <currentReward.icon className="h-4 w-4" />}
                        Check-in Diario!
                        {currentReward && (
                          <motion.span
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full"
                          >
                            {currentReward.desc}
                          </motion.span>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="claimed"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="w-full h-12 bg-primary/10 text-primary font-semibold rounded-xl flex items-center justify-center text-sm relative z-10"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                    className="mr-2"
                  >
                    ✅
                  </motion.span>
                  Check-in feito hoje!
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ml-2"
                  >
                    🎉
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next reward preview */}
            {nextReward && data.currentStreak < 7 && (
              <div className="flex items-center justify-center gap-1.5 mt-3 relative z-10">
                <ChevronRight className="h-3 w-3 text-muted-foreground rotate-180" />
                <p className="text-[10px] text-muted-foreground">
                  Proximo premio (dia {nextReward.day}):{' '}
                  <span className="font-semibold text-primary">{nextReward.desc}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
