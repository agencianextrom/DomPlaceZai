'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Flame, Star, RefreshCw, Clock, ChevronRight, Crown, Medal, Zap, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ─── Storage helpers ──────────────────────────────────────────────
const STORAGE_KEY = 'domplace-quest-data'

interface QuestProgress {
  daily: { [key: string]: number }
  weekly: { [key: string]: number }
  completedDaily: string[]
  completedWeekly: string[]
  totalXP: number
  streak: number
  lastLoginDate: string
  lastDailyReset: string
  lastWeeklyReset: string
}

const defaultProgress: QuestProgress = {
  daily: {
    'buy-items': 0,
    'review-product': 0,
    'visit-stores': 0,
  },
  weekly: {
    'spend-100': 0,
    'make-5-orders': 0,
  },
  completedDaily: [],
  completedWeekly: [],
  totalXP: 0,
  streak: 0,
  lastLoginDate: '',
  lastDailyReset: '',
  lastWeeklyReset: '',
}

function loadProgress(): QuestProgress {
  if (typeof window === 'undefined') return defaultProgress
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...defaultProgress, ...JSON.parse(stored) } : defaultProgress
  } catch {
    return defaultProgress
  }
}

function saveProgress(data: QuestProgress): void {
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

function getMondayOfCurrentWeek(): string {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

// ─── Level system ────────────────────────────────────────────────
const levelTitles = [
  'Novato',
  'Aprendiz',
  'Iniciante',
  'Explorador',
  'Comprador',
  'Comprador Frequentador',
  'Conhecido',
  'Regular',
  'Experiente',
  'Veterano',
  'Dedicado',
  'Expert',
  'Mestre',
  'Elite',
  'Lendário',
  'Supremo',
  'Mítico',
  'Absoluto',
  'Grandmaster',
  'Mestre Comprador',
]

const xpPerLevel = 200

function getLevelFromXP(xp: number): { level: number; title: string; xpInLevel: number; xpForNext: number; progress: number } {
  const level = Math.min(Math.floor(xp / xpPerLevel) + 1, 20)
  const title = levelTitles[Math.min(level - 1, levelTitles.length - 1)]
  const xpInLevel = xp - (level - 1) * xpPerLevel
  const xpForNext = level < 20 ? xpPerLevel : xpInLevel
  const progress = level < 20 ? (xpInLevel / xpForNext) * 100 : 100
  return { level, title, xpInLevel, xpForNext, progress }
}

// ─── Quest definitions ─────────────────────────────────────────────
interface QuestDef {
  id: string
  title: string
  description: string
  icon: string
  target: number
  xpReward: number
  category: 'daily' | 'weekly' | 'special'
  color: string
  glowColor: string
}

const dailyQuests: QuestDef[] = [
  {
    id: 'buy-items',
    title: 'Compre 2 itens',
    description: 'Compre pelo menos 2 itens em um pedido',
    icon: '🛒',
    target: 2,
    xpReward: 25,
    category: 'daily',
    color: 'from-emerald-500 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.35)',
  },
  {
    id: 'review-product',
    title: 'Avalie 1 produto',
    description: 'Deixe uma avaliação em qualquer produto',
    icon: '⭐',
    target: 1,
    xpReward: 30,
    category: 'daily',
    color: 'from-amber-500 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.35)',
  },
  {
    id: 'visit-stores',
    title: 'Visite 3 lojas',
    description: 'Visite 3 lojas diferentes hoje',
    icon: '🏪',
    target: 3,
    xpReward: 20,
    category: 'daily',
    color: 'from-violet-500 to-purple-600',
    glowColor: 'rgba(139, 92, 246, 0.35)',
  },
]

const weeklyQuests: QuestDef[] = [
  {
    id: 'spend-100',
    title: 'Gaste R$100+',
    description: 'Gaste R$100 ou mais nesta semana',
    icon: '💰',
    target: 100,
    xpReward: 100,
    category: 'weekly',
    color: 'from-rose-500 to-pink-600',
    glowColor: 'rgba(244, 63, 94, 0.35)',
  },
  {
    id: 'make-5-orders',
    title: 'Faça 5 pedidos',
    description: 'Complete 5 pedidos nesta semana',
    icon: '📦',
    target: 5,
    xpReward: 120,
    category: 'weekly',
    color: 'from-cyan-500 to-blue-600',
    glowColor: 'rgba(6, 182, 212, 0.35)',
  },
]

const specialQuest: QuestDef = {
  id: 'mega-challenge',
  title: 'Mega Desafio',
  description: 'Complete todas as quests diárias para ganhar bônus',
  icon: '🏆',
  target: 3,
  xpReward: 500,
  category: 'special',
  color: 'from-yellow-400 via-amber-500 to-orange-500',
  glowColor: 'rgba(251, 191, 36, 0.45)',
}

// ─── Leaderboard data ──────────────────────────────────────────────
const leaderboardData = [
  { rank: 1, name: 'Maria Santos', xp: 4820, avatar: '👩‍🦰', badge: '🥇', badgeColor: 'from-yellow-400 to-amber-500', badgeBorder: 'rgba(251, 191, 36, 0.5)' },
  { rank: 2, name: 'João Silva', xp: 4150, avatar: '👨‍💼', badge: '🥈', badgeColor: 'from-gray-300 to-gray-400', badgeBorder: 'rgba(156, 163, 175, 0.5)' },
  { rank: 3, name: 'Ana Oliveira', xp: 3680, avatar: '👩‍🎤', badge: '🥉', badgeColor: 'from-amber-600 to-orange-600', badgeBorder: 'rgba(217, 119, 6, 0.5)' },
]

// ─── Confetti burst component ─────────────────────────────────────
function QuestConfetti({ active }: { active: boolean }) {
  if (!active) return null

  const particles = useMemo(() =>
    Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      color: ['#fbbf24', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#ef4444'][i % 7],
      size: 3 + Math.random() * 6,
      rotation: Math.random() * 720 - 360,
    })),
    []
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -10, x: `${p.x}%`, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ y: 80, opacity: 0, scale: 0.2, rotate: p.rotation }}
          transition={{ duration: 0.85, delay: p.delay, ease: 'easeOut' }}
          className="absolute rounded-sm"
          style={{
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
          }}
        />
      ))}
    </div>
  )
}

// ─── XP floating popup ────────────────────────────────────────────
function XPPopup({ show, amount }: { show: boolean; amount: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.6 }}
          animate={{ opacity: 1, y: -40, scale: 1 }}
          exit={{ opacity: 0, y: -70, scale: 0.5 }}
          transition={{ duration: 1.2, ease: 'easeOut' as const }}
          className="absolute -top-2 right-4 z-40 pointer-events-none"
        >
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg"
            style={{ boxShadow: '0 4px 16px rgba(251, 191, 36, 0.5)' }}>
            <Zap className="h-3.5 w-3.5 text-white" />
            <span className="text-sm font-extrabold text-white">+{amount} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Animated fire emoji for streak ───────────────────────────────
function StreakFire({ streak }: { streak: number }) {
  if (streak < 1) return null
  return (
    <motion.span
      className="inline-block"
      animate={{
        scale: [1, 1.3, 1],
        rotate: [-8, 8, -8],
        y: [0, -3, 0],
      }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const }}
      style={{ filter: 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.6))' }}
    >
      🔥
    </motion.span>
  )
}

// ─── Refresh spin icon ────────────────────────────────────────────
function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <motion.div
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={spinning ? { duration: 0.6, ease: 'easeInOut' as const } : { duration: 0 }}
    >
      <RefreshCw className="h-3.5 w-3.5" />
    </motion.div>
  )
}

// ─── Quest card component ─────────────────────────────────────────
function QuestCard({
  quest,
  progress,
  completed,
  onComplete,
  index,
}: {
  quest: QuestDef
  progress: number
  completed: boolean
  onComplete: (id: string, xp: number) => void
  index: number
}) {
  const progressPercent = Math.min((progress / quest.target) * 100, 100)
  const isCompleteable = progress >= quest.target && !completed

  const handleSimulate = () => {
    if (!completed) {
      const newProgress = Math.min(progress + 1, quest.target)
      onComplete(quest.id, newProgress)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        type: 'spring' as const,
        stiffness: 260,
        damping: 22,
      }}
      whileHover={{
        y: -4,
        boxShadow: completed
          ? '0 8px 24px rgba(16, 185, 129, 0.15)'
          : `0 8px 24px ${quest.glowColor}`,
      }}
      className={`r45-quest-card relative rounded-xl border overflow-hidden transition-colors ${
        completed
          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
          : 'bg-card border-border'
      }`}
    >
      {/* Active glow border */}
      {!completed && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none r45-glow-badge"
          animate={{
            boxShadow: [
              `0 0 8px ${quest.glowColor}, inset 0 0 8px ${quest.glowColor.replace('0.35', '0.05')}`,
              `0 0 16px ${quest.glowColor}, inset 0 0 12px ${quest.glowColor.replace('0.35', '0.08')}`,
              `0 0 8px ${quest.glowColor}, inset 0 0 8px ${quest.glowColor.replace('0.35', '0.05')}`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
        />
      )}

      {/* Completed overlay shimmer */}
      {completed && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' as const }}
        />
      )}

      <div className="relative p-3.5">
        <div className="flex items-start gap-3">
          {/* Quest icon */}
          <motion.div
            animate={completed ? { scale: [1, 1.15, 1] } : { scale: [1, 1.05, 1] }}
            transition={{ duration: completed ? 0.5 : 2, repeat: completed ? 1 : Infinity, ease: 'easeInOut' as const }}
            className={`h-10 w-10 rounded-lg bg-gradient-to-br ${quest.color} flex items-center justify-center text-lg shrink-0 shadow-md ${
              completed ? 'opacity-70' : ''
            }`}
            style={{ boxShadow: completed ? 'none' : `0 4px 12px ${quest.glowColor}` }}
          >
            {completed ? '✅' : quest.icon}
          </motion.div>

          {/* Quest info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className={`text-xs font-bold truncate ${completed ? 'text-emerald-600 dark:text-emerald-400 line-through' : ''}`}>
                {quest.title}
              </h4>
              <Badge
                variant="secondary"
                className={`text-[9px] h-4 px-1.5 font-semibold bg-gradient-to-r ${quest.color} text-white border-0 shrink-0`}
              >
                +{quest.xpReward} XP
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">{quest.description}</p>

            {/* Progress bar */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${quest.color}`}
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, type: 'spring' as const, stiffness: 200, damping: 20 }}
              />
              {/* Shimmer on progress */}
              {progressPercent > 0 && progressPercent < 100 && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '300%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' as const }}
                  style={{ width: '40%' }}
                />
              )}
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[9px] text-muted-foreground font-medium">
                {progress}/{quest.target}
              </span>

              {/* Simulate button or completed check */}
              {completed ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                  className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
                >
                  <Star className="h-3 w-3 fill-current" />
                  Concluída
                </motion.div>
              ) : (
                <motion.div whileTap={{ scale: 0.93 }}>
                  <Button
                    variant={isCompleteable ? 'default' : 'outline'}
                    size="sm"
                    className={`h-6 text-[10px] px-2.5 rounded-lg gap-1 ${
                      isCompleteable
                        ? 'bg-gradient-to-r ' + quest.color + ' text-white border-0 shadow-sm'
                        : ''
                    }`}
                    onClick={handleSimulate}
                  >
                    <Zap className="h-3 w-3" />
                    {isCompleteable ? 'Reivindicar' : 'Simular'}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────
export default function GamificationQuests() {
  const [progress, setProgress] = useState<QuestProgress>(defaultProgress)
  const [showConfetti, setShowConfetti] = useState(false)
  const [xpPopup, setXpPopup] = useState<{ show: boolean; amount: number }>({ show: false, amount: 0 })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily')
  const [mounted, setMounted] = useState(false)

  // Load persisted data on mount
  useEffect(() => {
    const data = loadProgress()
    const today = getToday()
    const monday = getMondayOfCurrentWeek()

    // Reset daily quests if day changed
    if (data.lastDailyReset !== today) {
      data.daily = { ...defaultProgress.daily }
      data.completedDaily = []
      data.lastDailyReset = today
    }

    // Reset weekly quests if week changed
    if (data.lastWeeklyReset !== monday) {
      data.weekly = { ...defaultProgress.weekly }
      data.completedWeekly = []
      data.lastWeeklyReset = monday
    }

    // Update streak
    if (data.lastLoginDate && data.lastLoginDate !== today) {
      const lastDate = new Date(data.lastLoginDate)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000)
      if (diffDays > 1) {
        data.streak = 0
      } else {
        data.streak = data.streak + 1
      }
      data.lastLoginDate = today
    } else if (!data.lastLoginDate) {
      data.streak = 1
      data.lastLoginDate = today
    }

    setProgress(data)
    saveProgress(data)
    setMounted(true)
  }, [])

  // Calculate time until midnight
  const timeUntilMidnight = useMemo(() => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const diff = midnight.getTime() - now.getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return `${hours}h ${minutes}min`
  }, [])

  // XP level info
  const levelInfo = useMemo(() => getLevelFromXP(progress.totalXP), [progress.totalXP])

  // Special quest progress = number of completed daily quests
  const specialQuestProgress = progress.completedDaily.length
  const specialQuestCompleted = progress.completedDaily.length >= 3

  // Handle quest progress simulation
  const handleQuestProgress = useCallback((questId: string, newProgress: number) => {
    setProgress((prev) => {
      const updated = { ...prev }

      // Find which quest this is
      const dailyQ = dailyQuests.find((q) => q.id === questId)
      const weeklyQ = weeklyQuests.find((q) => q.id === questId)

      if (dailyQ) {
        updated.daily = { ...updated.daily, [questId]: newProgress }

        // Check if quest just completed
        if (newProgress >= dailyQ.target && !prev.completedDaily.includes(questId)) {
          updated.completedDaily = [...prev.completedDaily, questId]
          updated.totalXP = prev.totalXP + dailyQ.xpReward

          // Show confetti and XP popup
          setShowConfetti(true)
          setXpPopup({ show: true, amount: dailyQ.xpReward })
          setTimeout(() => setShowConfetti(false), 1200)
          setTimeout(() => setXpPopup({ show: false, amount: 0 }), 1500)

          // Check if all daily quests completed (special quest)
          const newCompletedDaily = [...prev.completedDaily, questId]
          if (newCompletedDaily.length >= 3 && !prev.completedDaily.includes('mega-challenge')) {
            setTimeout(() => {
              setProgress((p) => {
                const withBonus = { ...p, totalXP: p.totalXP + 500 }
                saveProgress(withBonus)
                return withBonus
              })
              setShowConfetti(true)
              setXpPopup({ show: true, amount: 500 })
              setTimeout(() => setShowConfetti(false), 1500)
              setTimeout(() => setXpPopup({ show: false, amount: 0 }), 1800)
            }, 2000)
          }
        }
      }

      if (weeklyQ) {
        updated.weekly = { ...updated.weekly, [questId]: newProgress }

        if (newProgress >= weeklyQ.target && !prev.completedWeekly.includes(questId)) {
          updated.completedWeekly = [...prev.completedWeekly, questId]
          updated.totalXP = prev.totalXP + weeklyQ.xpReward

          setShowConfetti(true)
          setXpPopup({ show: true, amount: weeklyQ.xpReward })
          setTimeout(() => setShowConfetti(false), 1200)
          setTimeout(() => setXpPopup({ show: false, amount: 0 }), 1500)
        }
      }

      saveProgress(updated)
      return updated
    })
  }, [])

  // Handle daily quest refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => {
      setProgress((prev) => {
        const updated = {
          ...prev,
          daily: { ...defaultProgress.daily },
          completedDaily: [],
          lastDailyReset: getToday(),
        }
        saveProgress(updated)
        return updated
      })
      setIsRefreshing(false)
    }, 800)
  }, [])

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-4" />
        <div className="space-y-3">
          <div className="h-20 bg-muted rounded-lg" />
          <div className="h-20 bg-muted rounded-lg" />
          <div className="h-20 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
        className="rounded-2xl border border-border bg-card overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)' }}
      >
        {/* ─── Header: XP Level System ─────────────────────────── */}
        <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 p-5 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/5" />

          <div className="relative z-10">
            {/* Top row: title + streak */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                  className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center"
                  style={{ boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
                >
                  <Trophy className="h-5 w-5 text-yellow-300" />
                </motion.div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Missões e Conquistas
                    <StreakFire streak={progress.streak} />
                  </h3>
                  <p className="text-[10px] text-white/60">Complete missões para ganhar XP</p>
                </div>
              </div>

              {/* Streak counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' as const, stiffness: 300 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' as const }}
                  className="text-base"
                >
                  🔥
                </motion.span>
                <div>
                  <p className="text-[10px] font-extrabold text-white leading-none">{progress.streak}</p>
                  <p className="text-[8px] text-white/50 leading-none">dias seguidos</p>
                </div>
              </motion.div>
            </div>

            {/* Level info */}
            <div className="flex items-center gap-4">
              {/* Level badge */}
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 flex flex-col items-center justify-center shrink-0"
                style={{ boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)' }}
              >
                <span className="text-lg font-extrabold text-white leading-none">{levelInfo.level}</span>
                <Crown className="h-3 w-3 text-yellow-200 mt-0.5" />
              </motion.div>

              {/* Level details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-xs font-bold text-white">{levelInfo.title}</p>
                    <p className="text-[10px] text-white/50">
                      Nível {levelInfo.level} · {progress.totalXP} XP total
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-white/15 text-white border-0 text-[9px] h-5 px-2"
                  >
                    {levelInfo.xpInLevel}/{levelInfo.xpForNext} XP
                  </Badge>
                </div>

                {/* XP progress bar */}
                <div className="relative h-2.5 bg-white/15 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400"
                    initial={{ width: '0%' }}
                    animate={{ width: `${levelInfo.progress}%` }}
                    transition={{ duration: 1, type: 'spring' as const, stiffness: 180, damping: 20 }}
                  />
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    animate={{ x: ['-100%', '300%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' as const }}
                    style={{ width: '40%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Tab navigation ──────────────────────────────────── */}
        <div className="border-b border-border px-5 pt-4">
          <div className="flex items-center gap-1">
            {[
              { key: 'daily' as const, label: 'Diárias', icon: <Clock className="h-3.5 w-3.5" />, count: dailyQuests.filter((q) => !progress.completedDaily.includes(q.id)).length },
              { key: 'weekly' as const, label: 'Semanais', icon: <Target className="h-3.5 w-3.5" />, count: weeklyQuests.filter((q) => !progress.completedWeekly.includes(q.id)).length },
              { key: 'special' as const, label: 'Especial', icon: <Crown className="h-3.5 w-3.5" />, count: specialQuestCompleted ? 0 : 1 },
            ].map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                  activeTab === tab.key
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`h-4 min-w-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      activeTab === tab.key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="r45-active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Time remaining (daily) or refresh */}
            {activeTab === 'daily' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Reseta em {timeUntilMidnight}
                </span>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleRefresh}
                  >
                    <RefreshIcon spinning={isRefreshing} />
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Quest content ───────────────────────────────────── */}
        <div className="p-5 relative">
          <XPPopup show={xpPopup.show} amount={xpPopup.amount} />
          <QuestConfetti active={showConfetti} />

          <AnimatePresence mode="wait">
            {activeTab === 'daily' && (
              <motion.div
                key="daily"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {dailyQuests.map((quest, index) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    progress={progress.daily[quest.id] || 0}
                    completed={progress.completedDaily.includes(quest.id)}
                    onComplete={handleQuestProgress}
                    index={index}
                  />
                ))}
              </motion.div>
            )}

            {activeTab === 'weekly' && (
              <motion.div
                key="weekly"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    Semana atual · reseta na segunda-feira
                  </span>
                </div>
                {weeklyQuests.map((quest, index) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    progress={progress.weekly[quest.id] || 0}
                    completed={progress.completedWeekly.includes(quest.id)}
                    onComplete={handleQuestProgress}
                    index={index}
                  />
                ))}
              </motion.div>
            )}

            {activeTab === 'special' && (
              <motion.div
                key="special"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Special quest card */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
                  whileHover={{
                    y: -4,
                    boxShadow: specialQuestCompleted
                      ? '0 8px 24px rgba(16, 185, 129, 0.15)'
                      : '0 8px 24px rgba(251, 191, 36, 0.25)',
                  }}
                  className={`r45-quest-card relative rounded-xl border overflow-hidden ${
                    specialQuestCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-yellow-950/10 dark:to-orange-950/20 border-amber-200/60 dark:border-amber-800/30'
                  }`}
                >
                  {!specialQuestCompleted && (
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none r45-glow-badge"
                      animate={{
                        boxShadow: [
                          '0 0 12px rgba(251, 191, 36, 0.2), inset 0 0 12px rgba(251, 191, 36, 0.05)',
                          '0 0 24px rgba(251, 191, 36, 0.4), inset 0 0 16px rgba(251, 191, 36, 0.1)',
                          '0 0 12px rgba(251, 191, 36, 0.2), inset 0 0 12px rgba(251, 191, 36, 0.05)',
                        ],
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
                    />
                  )}

                  <div className="relative p-4">
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                        className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center text-2xl shrink-0"
                        style={{ boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)' }}
                      >
                        {specialQuestCompleted ? '🎉' : specialQuest.icon}
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className={`text-sm font-extrabold ${specialQuestCompleted ? 'text-emerald-600 dark:text-emerald-400 line-through' : 'text-amber-700 dark:text-amber-400'}`}>
                            {specialQuest.title}
                          </h4>
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-[10px] h-5 px-2 font-bold shadow-sm">
                            +{specialQuest.xpReward} XP
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">
                          {specialQuest.description}
                        </p>

                        {/* Progress indicators for daily quest completion */}
                        <div className="flex items-center gap-2 mb-2">
                          {dailyQuests.map((dq) => {
                            const done = progress.completedDaily.includes(dq.id)
                            return (
                              <motion.div
                                key={dq.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                                className={`h-7 w-7 rounded-lg flex items-center justify-center text-sm ${
                                  done
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-muted text-muted-foreground/50'
                                }`}
                                style={done ? { boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' } : {}}
                              >
                                {done ? '✓' : dq.icon}
                              </motion.div>
                            )
                          })}
                        </div>

                        {/* Progress bar */}
                        <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(specialQuestProgress / specialQuest.target) * 100}%` }}
                            transition={{ duration: 0.6, type: 'spring' as const, stiffness: 200, damping: 20 }}
                          />
                        </div>

                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[9px] text-muted-foreground font-medium">
                            {specialQuestProgress}/{specialQuest.target} quests diárias concluídas
                          </span>
                          {specialQuestCompleted && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                              className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
                            >
                              <Medal className="h-3 w-3 fill-current" />
                              Bônus Resgatado!
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Info text */}
                <div className="text-center py-2">
                  <p className="text-[10px] text-muted-foreground">
                    Complete todas as quests diárias para desbloquear o bônus especial de {specialQuest.xpReward} XP!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Leaderboard Preview ──────────────────────────────── */}
        <div className="border-t border-border px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <h4 className="text-xs font-bold">Ranking Semanal</h4>
            </div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-primary gap-1 px-2">
                Ver tudo
                <ChevronRight className="h-3 w-3" />
              </Button>
            </motion.div>
          </div>

          <div className="space-y-2">
            {leaderboardData.map((user, index) => (
              <motion.div
                key={user.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.6 + index * 0.12,
                  type: 'spring' as const,
                  stiffness: 300,
                  damping: 24,
                }}
                whileHover={{ x: 4, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
              >
                {/* Rank badge */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3, ease: 'easeInOut' as const }}
                  className={`h-8 w-8 rounded-full bg-gradient-to-br ${user.badgeColor} flex items-center justify-center text-sm shrink-0`}
                  style={{ boxShadow: `0 2px 8px ${user.badgeBorder}` }}
                >
                  {user.badge}
                </motion.div>

                {/* Avatar */}
                <span className="text-lg">{user.avatar}</span>

                {/* Name and XP */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate">{user.name}</p>
                  <p className="text-[9px] text-muted-foreground">{user.xp.toLocaleString('pt-BR')} XP</p>
                </div>

                {/* Rank position */}
                <span className={`text-xs font-extrabold ${
                  user.rank === 1
                    ? 'text-yellow-500'
                    : user.rank === 2
                      ? 'text-gray-400'
                      : 'text-amber-600'
                }`}>
                  #{user.rank}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Footer ─────────────────────────────────────────── */}
        <div className="border-t border-border px-5 py-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground">
                Total: <span className="font-bold text-foreground">{progress.totalXP} XP</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">
                {progress.completedDaily.length}/{dailyQuests.length} diárias
              </span>
              <span className="text-[10px] text-muted-foreground">
                {progress.completedWeekly.length}/{weeklyQuests.length} semanais
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
