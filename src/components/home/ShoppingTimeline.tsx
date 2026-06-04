'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Star, ShieldCheck, Award, Trophy, Package,
  Heart, Store, MessageCircle, TrendingUp, Sparkles, Gift,
  ChevronRight, Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/useAppStore'

/* ─── Types ─────────────────────────────────────────────── */
interface Milestone {
  id: string
  title: string
  description: string
  icon: typeof ShoppingCart
  requiredOrders: number
  reward: string
  color: string
  bgGradient: string
  achieved: boolean
  achievedDate?: string
}

interface ShoppingStats {
  totalOrders: number
  totalSpent: number
  storesVisited: number
  reviewsGiven: number
}

interface MilestoneData {
  stats: ShoppingStats
  achievements: Record<string, { achieved: boolean; date?: string }>
  lastUpdated: string
}

/* ─── Milestone definitions ─────────────────────────────── */
const milestones: Milestone[] = [
  {
    id: 'first-purchase',
    title: 'Primeira Compra',
    description: 'Realize sua primeira compra no DomPlace',
    icon: ShoppingCart,
    requiredOrders: 1,
    reward: '10 pontos de bônus',
    color: 'text-emerald-500',
    bgGradient: 'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
    achieved: false,
  },
  {
    id: 'ten-orders',
    title: '10 Pedidos',
    description: 'Complete 10 pedidos para se tornar um cliente regular',
    icon: Package,
    requiredOrders: 10,
    reward: 'Cupom R$10 de desconto',
    color: 'text-blue-500',
    bgGradient: 'from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30',
    achieved: false,
  },
  {
    id: 'verified',
    title: 'Verificado',
    description: 'Complete seu perfil e verifique seu e-mail',
    icon: ShieldCheck,
    requiredOrders: 5,
    reward: 'Selo de verificado + 50 pontos',
    color: 'text-amber-500',
    bgGradient: 'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
    achieved: false,
  },
  {
    id: 'reviewer',
    title: 'Avaliador',
    description: 'Escreva 5 avaliações de produtos ou lojas',
    icon: Star,
    requiredOrders: 15,
    reward: 'Badge de Avaliador + 30 pontos',
    color: 'text-purple-500',
    bgGradient: 'from-purple-100 to-fuchsia-200 dark:from-purple-900/30 dark:to-fuchsia-800/30',
    achieved: false,
  },
  {
    id: 'ambassador',
    title: 'Embaixador',
    description: 'Indique 5 amigos e tenha 30 pedidos',
    icon: Trophy,
    requiredOrders: 30,
    reward: 'Status Embaixador + frete grátis vitalício',
    color: 'text-rose-500',
    bgGradient: 'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
    achieved: false,
  },
]

const motivationalMessages = [
  'Cada compra te aproxima do próximo nível! 🚀',
  'Compre local, apoie sua comunidade 🏘️',
  'Seu próximo pedido pode desbloquear uma recompensa! 🎁',
  'Você está no caminho certo para se tornar um Embaixador! 🏆',
  'Avalie seus produtos favoritos e ganhe pontos extras ⭐',
  'Indique amigos e ganhe recompensas exclusivas 💚',
]

const STORAGE_KEY = 'domplace-shopping-milestones'

/* ─── Gradient Ring SVG ──────────────────────────────────── */
function GradientRing({ progress, size = 80 }: { progress: number; size?: number }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <defs>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.45 0.1 155)" />
          <stop offset="50%" stopColor="oklch(0.60 0.12 160)" />
          <stop offset="100%" stopColor="oklch(0.78 0.16 70)" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="oklch(0.92 0.015 120)" strokeWidth={5} className="dark:stroke-oklch(0.30 0.02 150)" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progress-gradient)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  )
}

/* ─── Confetti ──────────────────────────────────────────── */
const confettiColors = ['#10b981', '#f59e0b', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#8b5cf6']
const confettiShapes = ['●', '■', '▲', '★', '◆']

function TimelineConfetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2
        const distance = 40 + Math.random() * 100
        const tx = Math.cos(angle) * distance
        const ty = Math.sin(angle) * distance - 40
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
            animate={{ x: tx, y: ty, scale: 0, opacity: 0, rotate: (Math.random() - 0.5) * 720 }}
            transition={{ duration: 1.2 + Math.random() * 0.5, delay: 0.1 + i * 0.025, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2"
            style={{ color: confettiColors[i % confettiColors.length], fontSize: `${5 + Math.random() * 7}px`, lineHeight: 1 }}
          >
            {confettiShapes[i % confettiShapes.length]}
          </motion.div>
        )
      })}
    </div>
  )
}

/* ─── Animated Counter ──────────────────────────────────── */
function AnimatedCounter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true
    const duration = 1200
    const steps = 40
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </span>
  )
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, bg, delay }: {
  icon: typeof ShoppingCart
  label: string
  value: string | number
  color: string
  bg: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring' as const, stiffness: 300, damping: 25 }}
      className={`${bg} rounded-xl p-3 border border-border/30`}
    >
      <Icon className={`h-4 w-4 ${color} mb-1.5`} />
      <p className="text-lg font-bold">{typeof value === 'number' ? <AnimatedCounter target={value} /> : value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </motion.div>
  )
}

/* ─── Milestone Node ────────────────────────────────────── */
function MilestoneNode({
  milestone,
  index,
  isLast,
  isNext,
  showConfetti,
}: {
  milestone: Milestone
  index: number
  isLast: boolean
  isNext: boolean
  showConfetti: boolean
}) {
  const Icon = milestone.icon

  return (
    <div className="relative flex items-start gap-4 pb-8 last:pb-0">
      {/* Vertical line + connector */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border/40">
          <motion.div
            initial={{ height: '0%' }}
            animate={{ height: milestone.achieved ? '100%' : isNext ? '40%' : '0%' }}
            transition={{ delay: index * 0.15 + 0.3, duration: 0.6, ease: 'easeOut' }}
            className="w-full bg-gradient-to-b from-primary to-teal-400 rounded-full"
          />
        </div>
      )}

      {/* Icon circle */}
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: index * 0.15, type: 'spring' as const, stiffness: 400, damping: 20 }}
        className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
          milestone.achieved
            ? 'bg-primary text-primary-foreground shadow-[0_0_12px_oklch(0.45_0.1_155/0.3)]'
            : isNext
              ? 'bg-primary/10 border-2 border-primary/30 text-primary'
              : 'bg-muted text-muted-foreground'
        }`}
      >
        {milestone.achieved ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.15 + 0.2, type: 'spring' as const }}>
            <Icon className="h-5 w-5" />
          </motion.div>
        ) : (
          <Icon className="h-5 w-5" />
        )}
        {milestone.achieved && (
          <motion.div
            className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.15 + 0.4, type: 'spring' as const, stiffness: 500 }}
          >
            <span className="text-[8px] text-white font-bold">✓</span>
          </motion.div>
        )}
        {showConfetti && index === milestones.findIndex((m) => m.id === milestone.id) && (
          <TimelineConfetti />
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.15 + 0.1, duration: 0.4 }}
        className={`flex-1 pt-0.5 ${
          isNext ? '' : ''
        }`}
      >
        {isNext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.15 + 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/10 opacity-60 blur-sm" />
            <Card className={`relative border-primary/20 overflow-hidden ${milestone.bgGradient} card-shine`}>
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="text-[9px] bg-primary/15 text-primary border-primary/20 px-1.5 py-0">
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                    Próximo milestone
                  </Badge>
                </div>
                <p className="font-semibold text-sm">{milestone.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{milestone.description}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Gift className="h-3 w-3 text-amber-500" />
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{milestone.reward}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {!isNext && (
          <div className="py-1">
            <p className={`font-semibold text-sm ${milestone.achieved ? 'text-foreground' : 'text-muted-foreground'}`}>{milestone.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{milestone.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <Gift className={`h-3 w-3 ${milestone.achieved ? 'text-emerald-500' : 'text-muted-foreground'}`} />
              <p className={`text-[10px] ${milestone.achieved ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}`}>{milestone.reward}</p>
              {milestone.achieved && milestone.achievedDate && (
                <span className="text-[9px] text-muted-foreground">• {milestone.achievedDate}</span>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

/* ─── Loading Skeleton ───────────────────────────────────── */
function TimelineSkeleton() {
  return (
    <Card className="glass-card rounded-2xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ═══════════════════════════════════════════════════════════
   ShoppingTimeline — Main Component
   ═══════════════════════════════════════════════════════════ */
export function ShoppingTimeline() {
  const { currentUser } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [milestoneData, setMilestoneData] = useState<MilestoneData | null>(null)
  const [messageIdx, setMessageIdx] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiShownRef = useRef<Set<string>>(new Set())

  /* Load milestone data from localStorage */
  useEffect(() => {
    const loadData = () => {
      try {
        if (typeof window === 'undefined') return
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          setMilestoneData(JSON.parse(stored))
        } else {
          // Initialize with demo data for new users
          const initialData: MilestoneData = {
            stats: {
              totalOrders: 3,
              totalSpent: 127.50,
              storesVisited: 2,
              reviewsGiven: 1,
            },
            achievements: {
              'first-purchase': { achieved: true, date: '15/01/2025' },
              'ten-orders': { achieved: false },
              'verified': { achieved: false },
              'reviewer': { achieved: false },
              'ambassador': { achieved: false },
            },
            lastUpdated: new Date().toISOString(),
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData))
          setMilestoneData(initialData)
        }
      } catch {
        // Fallback data
        setMilestoneData({
          stats: { totalOrders: 3, totalSpent: 127.50, storesVisited: 2, reviewsGiven: 1 },
          achievements: {
            'first-purchase': { achieved: true, date: '15/01/2025' },
            'ten-orders': { achieved: false },
            'verified': { achieved: false },
            'reviewer': { achieved: false },
            'ambassador': { achieved: false },
          },
          lastUpdated: new Date().toISOString(),
        })
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  /* Save milestone data to localStorage (outside set) */
  const saveData = useCallback((data: MilestoneData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Silent fail
    }
  }, [])

  /* Rotating motivational messages */
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % motivationalMessages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  /* Compute enriched milestones with achievement state */
  const enrichedMilestones = milestones.map((m) => {
    const achievement = milestoneData?.achievements?.[m.id]
    return {
      ...m,
      achieved: achievement?.achieved || false,
      achievedDate: achievement?.date,
    }
  })

  const achievedCount = enrichedMilestones.filter((m) => m.achieved).length
  const totalMilestones = enrichedMilestones.length
  const progressPercent = Math.round((achievedCount / totalMilestones) * 100)

  /* Find next milestone */
  const nextMilestoneIdx = enrichedMilestones.findIndex((m) => !m.achieved)
  const stats = milestoneData?.stats || { totalOrders: 0, totalSpent: 0, storesVisited: 0, reviewsGiven: 0 }

  /* Simulate milestone achievement for demo */
  const handleSimulateAchievement = () => {
    if (!milestoneData || nextMilestoneIdx === -1) return
    const nextId = enrichedMilestones[nextMilestoneIdx].id
    if (confettiShownRef.current.has(nextId)) return
    confettiShownRef.current.add(nextId)

    const newData: MilestoneData = {
      ...milestoneData,
      stats: {
        ...milestoneData.stats,
        totalOrders: milestoneData.stats.totalOrders + 5,
      },
      achievements: {
        ...milestoneData.achievements,
        [nextId]: { achieved: true, date: new Date().toLocaleDateString('pt-BR') },
      },
      lastUpdated: new Date().toISOString(),
    }
    setMilestoneData(newData)
    saveData(newData)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  if (isLoading) return <TimelineSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card rounded-2xl overflow-hidden">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Sua Jornada de Compras</h3>
                <p className="text-[10px] text-muted-foreground">
                  {achievedCount} de {totalMilestones} conquistas
                </p>
              </div>
            </div>

            {/* Progress ring + percentage */}
            <div className="relative">
              <GradientRing progress={progressPercent} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm font-bold text-primary"><AnimatedCounter target={progressPercent} suffix="%" /></p>
                </div>
              </div>
            </div>
          </div>

          {/* Rotating motivational message */}
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIdx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] text-muted-foreground text-center mb-4 italic"
            >
              <MessageCircle className="h-3 w-3 inline mr-1 text-primary/50" />
              {motivationalMessages[messageIdx]}
            </motion.p>
          </AnimatePresence>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            <StatCard
              icon={Package}
              label="Pedidos"
              value={stats.totalOrders}
              color="text-primary"
              bg="stat-gradient-primary"
              delay={0.1}
            />
            <StatCard
              icon={Heart}
              label="Gasto Total"
              value={`R$${Math.floor(stats.totalSpent)}`}
              color="text-amber-500"
              bg="stat-gradient-amber"
              delay={0.15}
            />
            <StatCard
              icon={Store}
              label="Lojas"
              value={stats.storesVisited}
              color="text-teal-500"
              bg="stat-gradient-teal"
              delay={0.2}
            />
            <StatCard
              icon={Star}
              label="Avaliações"
              value={stats.reviewsGiven}
              color="text-purple-500"
              bg="bg-purple-50 dark:bg-purple-900/10 border-purple-200/50 dark:border-purple-800/30"
              delay={0.25}
            />
          </div>

          {/* Milestones timeline */}
          <div className="relative">
            <AnimatePresence>
              {showConfetti && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 2.5, duration: 0.5 }}
                  className="absolute top-0 left-0 right-0 h-20 z-20 pointer-events-none"
                >
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: -20, opacity: 1, x: Math.random() * 300 }}
                      animate={{ y: 120, opacity: 0, rotate: (Math.random() - 0.5) * 360 }}
                      transition={{ duration: 1.5 + Math.random(), delay: i * 0.05, ease: 'easeOut' }}
                      className="absolute"
                      style={{
                        left: `${Math.random() * 100}%`,
                        color: confettiColors[i % confettiColors.length],
                        fontSize: `${4 + Math.random() * 6}px`,
                      }}
                    >
                      {confettiShapes[i % confettiShapes.length]}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {enrichedMilestones.map((milestone, index) => (
              <MilestoneNode
                key={milestone.id}
                milestone={milestone}
                index={index}
                isLast={index === enrichedMilestones.length - 1}
                isNext={index === nextMilestoneIdx}
                showConfetti={showConfetti}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary via-teal-400 to-emerald-400 rounded-full"
            />
          </div>

          {/* Demo action */}
          {nextMilestoneIdx !== -1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-3 flex justify-center"
            >
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 border-primary/20 hover:bg-primary/5"
                onClick={handleSimulateAchievement}
              >
                <Sparkles className="h-3 w-3 text-primary" />
                Simular próxima conquista
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ShoppingTimeline
