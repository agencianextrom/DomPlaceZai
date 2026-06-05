'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Star, Trophy, Sparkles, ChevronRight, TrendingUp, Check, Flame, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'

interface LoyaltyWidgetProps {
  className?: string
}

// Loyalty tier configuration
const tiers = [
  { name: 'Bronze', minPoints: 0, maxPoints: 499, color: 'from-amber-600 to-amber-700', textColor: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/10', borderColor: 'border-amber-200 dark:border-amber-800/30', icon: '🥉' },
  { name: 'Prata', minPoints: 500, maxPoints: 1999, color: 'from-gray-400 to-gray-500', textColor: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-900/10', borderColor: 'border-gray-200 dark:border-gray-800/30', icon: '🥈' },
  { name: 'Ouro', minPoints: 2000, maxPoints: 4999, color: 'from-yellow-500 to-amber-500', textColor: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/10', borderColor: 'border-amber-200 dark:border-amber-800/30', icon: '🥇' },
  { name: 'Diamante', minPoints: 5000, maxPoints: 9999, color: 'from-cyan-400 to-sky-500', textColor: 'text-cyan-500', bgColor: 'bg-cyan-50 dark:bg-cyan-900/10', borderColor: 'border-cyan-200 dark:border-cyan-800/30', icon: '💎' },
]

// Possible rewards for next tier
const nextRewards = [
  { points: 500, label: 'Frete grátis', icon: '🚚' },
  { points: 1500, label: '10% desconto', icon: '🏷️' },
  { points: 3000, label: 'Produto grátis', icon: '🎁' },
  { points: 5000, label: 'Entrega prioritária', icon: '⚡' },
  { points: 8000, label: 'Cashback 5%', icon: '💰' },
]

// Mini chart data (points earned last 7 days)
const mockWeeklyPoints = [45, 120, 80, 200, 55, 160, 95]

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return <span>{count.toLocaleString('pt-BR')}</span>
}

// Mini SVG chart component — enhanced with gradient fills, stagger, hover tooltip
function PointsMiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const width = 200
  const height = 50
  const barWidth = (width - (data.length - 1) * 4) / data.length

  const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

  return (
    <div className="flex items-end gap-0.5">
      {data.map((value, i) => {
        const barHeight = Math.max(2, (value / max) * height)
        const isHighest = value === max
        return (
          <motion.div
            key={i}
            className="r41-chart-bar-wrap flex flex-col items-center gap-0.5 relative group"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.09, type: 'spring' as const, stiffness: 260, damping: 22 }}
          >
            {/* Hover tooltip */}
            <motion.div
              className="r41-chart-tooltip absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md bg-card border border-border shadow-sm text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10"
              initial={false}
            >
              +{value} pts
            </motion.div>
            <div
              className={`r41-chart-bar rounded-t-sm ${isHighest ? 'r41-chart-bar-peak' : 'r41-chart-bar-normal'}`}
              style={{
                width: barWidth,
                height: barHeight,
              }}
            />
            <span className="text-[7px] text-muted-foreground">{days[i]}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

// Celebration confetti effect — enhanced with 24 particles
function CelebrationParticles({ active }: { active: boolean }) {
  if (!active) return null

  const particles = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.35,
    color: ['#fbbf24', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6', '#f97316'][i % 7],
    size: 3 + Math.random() * 5,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -10, x: `${p.x}%`, opacity: 1, scale: 1 }}
          animate={{ y: 70, opacity: 0, scale: 0.3, rotate: 360 }}
          transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
          className="absolute rounded-full"
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

// Sparkle particles around the current tier badge
function TierBadgeSparkles({ active }: { active: boolean }) {
  if (!active) return null

  const sparkles = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    angle: (i / 6) * 360,
    delay: i * 0.2,
    size: 3,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparkles.map(s => (
        <motion.div
          key={s.id}
          className="absolute left-1/2 top-1/2"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{
            x: Math.cos((s.angle * Math.PI) / 180) * 14,
            y: Math.sin((s.angle * Math.PI) / 180) * 10,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 1.4,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'easeInOut',
          }}
          style={{ width: s.size, height: s.size, marginLeft: -1.5, marginTop: -1.5 }}
        >
          <div className="r41-sparkle-dot rounded-full" />
        </motion.div>
      ))}
    </div>
  )
}

export function LoyaltyWidget({ className = '' }: LoyaltyWidgetProps) {
  const { currentUser } = useAppStore()
  const [points] = useState(() => {
    if (typeof window === 'undefined') return 750
    try {
      const stored = localStorage.getItem('domplace-loyalty-points')
      return stored ? JSON.parse(stored) : 750
    } catch {
      return 750
    }
  })
  const [showCelebration, setShowCelebration] = useState(false)
  const [checkedInToday, setCheckedInToday] = useState(() => {
    if (typeof window === 'undefined') return false
    const today = new Date().toDateString()
    return localStorage.getItem('domplace-daily-checkin') === today
  })
  const [showRewardPreview, setShowRewardPreview] = useState(false)
  const [pointsPulse, setPointsPulse] = useState(false)

  // Find current tier and next tier
  const currentTier = tiers.findLast(t => points >= t.minPoints) || tiers[0]
  const nextTier = tiers[tiers.indexOf(currentTier) + 1]
  const tierProgress = nextTier
    ? ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100

  // Find next reward
  const nextReward = nextRewards.findLast(r => points < r.points) || nextRewards[0]
  const rewardProgress = nextReward
    ? Math.min((points / nextReward.points) * 100, 100)
    : 100

  // Milestone check — pulse on every 500 points
  const isMilestone = points > 0 && points % 500 < 25

  const handleCheckIn = useCallback(() => {
    if (checkedInToday) return

    const bonus = 25 + Math.floor(Math.random() * 26) // 25-50 bonus points
    const newPoints = points + bonus

    setPointsPulse(true)
    setShowCelebration(true)
    setCheckedInToday(true)
    localStorage.setItem('domplace-daily-checkin', new Date().toDateString())
    localStorage.setItem('domplace-loyalty-points', JSON.stringify(newPoints))

    setTimeout(() => setPointsPulse(false), 600)
    setTimeout(() => setShowCelebration(false), 1500)
  }, [checkedInToday, points])

  return (
    <div className={`r33-loyalty-border-wrap ${className}`}>
      {/* Rotating conic-gradient border layer */}
      <div className="r33-loyalty-border-glow" />

      <div className="bg-card rounded-2xl border border-border overflow-hidden relative">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${currentTier.color} p-4 relative overflow-hidden`}>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Crown className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 r62-heading-gradient">
                  Programa de Fidelidade
                  {/* Enhanced tier badge with rotating gradient border + sparkle particles */}
                  <motion.span
                    className={`relative text-[10px] px-1.5 py-0.5 rounded-full inline-flex items-center r33-loyalty-badge-shimmer r41-tier-badge-border ${
                      points >= 2000
                        ? 'bg-white/25 text-white'
                        : 'bg-white/20 text-white/90'
                    }`}
                    animate={{
                      boxShadow: points >= 2000
                        ? [
                            '0 0 4px rgba(255,255,255,0.1)',
                            '0 0 12px rgba(255,255,255,0.3), 0 0 4px rgba(255,215,0,0.2)',
                            '0 0 4px rgba(255,255,255,0.1)',
                          ]
                        : '0 0 0px rgba(255,255,255,0)',
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {currentTier.icon}
                    {/* r41-tier-badge-border provides rotating gradient via CSS */}
                    {/* Shimmer sweep pseudo-element via CSS */}
                  </motion.span>
                  {/* Sparkle particles on current tier (Ouro+) */}
                  <TierBadgeSparkles active={points >= 2000} />
                </h3>
                <p className="text-[10px] text-white/70">Nível {currentTier.name}</p>
              </div>
            </div>
            {/* Points counter with enhanced gradient text + scale pulse on milestone */}
            <div className="text-right relative">
              {/* Glow behind the number */}
              <div
                className="absolute -inset-3 -z-10 rounded-full blur-xl transition-opacity duration-500"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.35)',
                  opacity: pointsPulse ? 0.5 : 0,
                }}
              />
              <motion.div
                className="text-xl font-extrabold text-white relative"
                animate={pointsPulse || isMilestone ? { scale: [1, 1.18, 1] } : {}}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15, duration: 0.6 }}
              >
                <span className="r41-points-gradient">
                  <AnimatedCounter target={points} />
                </span>
              </motion.div>
              <p className="text-[10px] text-white/70">pontos acumulados</p>
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Tier progress bar with enhanced gradient fill + shimmer overlay + glow trail indicator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold">{currentTier.icon} {currentTier.name}</span>
                {nextTier && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                )}
                {nextTier && (
                  <span className="text-[10px] font-semibold">{nextTier.icon} {nextTier.name}</span>
                )}
              </div>
              {nextTier && (
                <span className="text-[10px] font-medium text-primary">
                  {nextTier.minPoints - points} pts restantes
                </span>
              )}
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              {/* Animated gradient progress */}
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${currentTier.color}`}
                initial={{ width: '0%' }}
                animate={{ width: `${tierProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              {/* Shimmer sweep overlay on the progress fill */}
              <div className="r33-loyalty-progress-shimmer" />
              {/* Enhanced shimmer overlay */}
              <div className="r41-progress-shimmer-overlay" />
              {/* Animated indicator dot with glow trail */}
              <motion.div
                className="absolute top-1/2 h-5 w-5 rounded-full bg-background border-2 border-primary shadow-sm flex items-center justify-center z-10"
                initial={{ left: '0%' }}
                animate={{ left: `${Math.max(0, Math.min(tierProgress, 97))}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <Sparkles className="h-2.5 w-2.5 text-primary" />
              </motion.div>
              {/* Glow trail behind the indicator */}
              <motion.div
                className="absolute top-1/2 h-5 rounded-full r41-indicator-glow-trail"
                initial={{ left: '0%' }}
                animate={{ left: `${Math.max(0, Math.min(tierProgress, 97))}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ transform: 'translate(-50%, -50%)', width: 32 }}
              />
            </div>
          </div>

          {/* Daily check-in button — wrapped in motion.div, no whileHover on Button */}
          <div className="relative">
            <motion.div
              whileTap={{ scale: checkedInToday ? 1 : 0.95 }}
              className="r41-checkin-btn-glow"
              animate={checkedInToday ? {} : {
                boxShadow: [
                  '0 4px 14px rgba(16, 185, 129, 0.2)',
                  '0 4px 20px rgba(16, 185, 129, 0.4), 0 0 8px rgba(16, 185, 129, 0.15)',
                  '0 4px 14px rgba(16, 185, 129, 0.2)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Button
                className={`w-full h-11 rounded-xl font-semibold text-sm gap-2 transition-all ${
                  checkedInToday
                    ? 'bg-muted text-muted-foreground cursor-default'
                    : 'bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white shadow-lg r33-loyalty-btn-shimmer r33-loyalty-btn-ripple r41-btn-shimmer-enhanced'
                }`}
                onClick={handleCheckIn}
                disabled={checkedInToday}
                style={checkedInToday ? {} : {
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                }}
              >
                {checkedInToday ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    Check-in feito hoje!
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Gift className="h-4 w-4" />
                    </motion.div>
                    Check-in Diário
                    <Badge className="bg-white/20 text-white border-0 text-[10px] h-5 px-1.5">
                      +25~50 pts
                    </Badge>
                  </>
                )}
              </Button>
            </motion.div>
            {/* Enhanced celebration particles (24 burst) */}
            <CelebrationParticles active={showCelebration} />
          </div>

          {/* Next reward preview — enhanced glow pulse + shine sweep */}
          {nextReward && points < nextReward.points && (
            <motion.div
              className="relative"
              onMouseEnter={() => setShowRewardPreview(true)}
              onMouseLeave={() => setShowRewardPreview(false)}
            >
              <motion.div
                animate={{
                  boxShadow: showRewardPreview
                    ? '0 0 0 0 rgba(16,185,129,0.2), 0 0 0 8px rgba(16,185,129,0), 0 0 0 0 rgba(16,185,129,0.2)'
                    : '0 0 0 0 rgba(16,185,129,0), 0 0 0 0 rgba(16,185,129,0), 0 0 0 0 rgba(16,185,129,0)',
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-xl p-3 border border-primary/10 cursor-pointer r41-reward-card-shine"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-2xl"
                  >
                    {nextReward.icon}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">Próxima recompensa</p>
                    <p className="text-[10px] text-muted-foreground">{nextReward.label}</p>
                    <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-emerald-400"
                        initial={{ width: '0%' }}
                        animate={{ width: `${rewardProgress}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {nextReward.points - points} pts para desbloquear
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </motion.div>

              {/* Reward preview popup */}
              <AnimatePresence>
                {showRewardPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute left-0 right-0 -top-2 z-20 -translate-y-full"
                  >
                    <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
                      <p className="text-xs font-bold mb-1.5 flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        Próximas Recompensas
                      </p>
                      <div className="space-y-1.5">
                        {nextRewards.map(reward => {
                          const earned = points >= reward.points
                          return (
                            <div key={reward.points} className="flex items-center gap-2 text-[10px]">
                              <span className="text-base">{reward.icon}</span>
                              <span className={`flex-1 ${earned ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'}`}>
                                {reward.label}
                              </span>
                              <span className={`text-[9px] ${earned ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                {reward.points} pts
                              </span>
                              {earned && <Check className="h-3 w-3 text-emerald-500" />}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Points history mini chart — enhanced with stagger, gradient fills, hover tooltip */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Últimos 7 dias
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                +{mockWeeklyPoints.reduce((a, b) => a + b, 0)} pts
              </p>
            </div>
            <PointsMiniChart data={mockWeeklyPoints} />
          </div>

          {/* Quick stats row — enhanced with animated counter entrance, icon bounce, gradient hover */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { icon: <Star className="h-3.5 w-3.5 text-amber-500" />, label: 'Mês atual', value: `${Math.floor(points / 3)} pts`, color: 'text-amber-600 dark:text-amber-400' },
              { icon: <Flame className="h-3.5 w-3.5 text-orange-500" />, label: 'Sequência', value: '5 dias', color: 'text-orange-600 dark:text-orange-400' },
              { icon: <Gift className="h-3.5 w-3.5 text-primary" />, label: 'Resgates', value: '2', color: 'text-primary' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="text-center bg-secondary/30 rounded-lg p-2 r41-stat-card r62-card-lift"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1, type: 'spring' as const, stiffness: 280, damping: 24 }}
              >
                <motion.div
                  className="flex justify-center mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1, type: 'spring' as const, stiffness: 350, damping: 18 }}
                >
                  {stat.icon}
                </motion.div>
                <p className={`text-xs font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[8px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </div>
    </div>
  )
}
