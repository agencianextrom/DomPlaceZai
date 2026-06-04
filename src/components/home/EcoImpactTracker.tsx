'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Droplets, Wind, Lock, Trophy, Medal, Flame, Target, ChevronRight, TreePine } from 'lucide-react'

/* ──────────────────────────── Mock Data ──────────────────────────── */

const impactStats = [
  { id: 'co2', label: 'CO₂ Economizado', value: 47.3, unit: 'kg', icon: Wind, color: '#10b981' },
  { id: 'trees', label: 'Árvores Equivalentes', value: 3, unit: '', icon: TreePine, color: '#22c55e' },
  { id: 'plastic', label: 'Sacolas Evitadas', value: 128, unit: '', icon: Leaf, color: '#14b8a6' },
  { id: 'water', label: 'Água Economizada', value: 892, unit: 'L', icon: Droplets, color: '#06b6d4' },
]

const ecoBadges = [
  { id: 1, name: 'Primeiro Passo Verde', description: 'Primeira compra sustentável', icon: '🌱', unlocked: true, threshold: 0 },
  { id: 2, name: 'Comprador Local', description: '5 compras de produtores locais', icon: '🏪', unlocked: true, threshold: 5 },
  { id: 3, name: 'Embaixador ECO', description: 'Indicar 10 amigos ao programa', icon: '🌍', unlocked: true, threshold: 10 },
  { id: 4, name: 'Zero Plástico', description: '50 sacolas plásticas evitadas', icon: '♻️', unlocked: false, threshold: 50 },
  { id: 5, name: 'Herói Sustentável', description: '100 kg de CO₂ economizado', icon: '🦸', unlocked: false, threshold: 100 },
  { id: 6, name: 'Lenda Verde', description: 'Alcançar nível máximo eco', icon: '👑', unlocked: false, threshold: 200 },
]

const weeklyChallenge = {
  title: 'Desafio da semana',
  description: 'Compre ao menos 3 produtos orgânicos de produtores locais esta semana.',
  reward: 'Badge especial + 50 pontos de fidelidade',
  progress: 1,
  total: 3,
}

const leaderboard = [
  { rank: 1, name: 'Maria Oliveira', points: 2450, avatar: '🧑‍🌾' },
  { rank: 2, name: 'João Santos', points: 2180, avatar: '👨‍🔬' },
  { rank: 3, name: 'Ana Costa', points: 1920, avatar: '👩‍🎨' },
  { rank: 4, name: 'Pedro Lima', points: 1640, avatar: '🧑‍💼' },
  { rank: 5, name: 'Você', points: 1250, avatar: '🙋', isCurrentUser: true },
]

const monthlyData = [
  { month: 'Jan', value: 5.2 },
  { month: 'Fev', value: 7.8 },
  { month: 'Mar', value: 6.1 },
  { month: 'Abr', value: 9.4 },
  { month: 'Mai', value: 11.2 },
  { month: 'Jun', value: 47.3 },
]

/* ──────────────── Animated Counter Hook ──────────────── */

function useAnimatedCounter(target: number, duration = 1400) {
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true
    let start = 0
    const isDecimal = target % 1 !== 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(isDecimal ? parseFloat(start.toFixed(1)) : Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return count
}

/* ──────────────── Earth Visualization ──────────────── */

function EarthVisualization() {
  const orbitDots = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: 4 + Math.random() * 4,
      delay: i * 0.8,
      duration: 6 + Math.random() * 4,
      color: ['#10b981', '#22c55e', '#14b8a6', '#06b6d4', '#84cc16', '#34d399'][i],
    })), [])

  const leafParticles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 2,
      size: 10 + Math.random() * 8,
    })), [])

  return (
    <div className="r33-earth-container relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Pulse glow rings */}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full"
          style={{
            width: 120 + ring * 24,
            height: 120 + ring * 24,
            border: '1px solid rgba(16,185,129,0.15)',
            top: '50%',
            left: '50%',
            marginTop: -(60 + ring * 12),
            marginLeft: -(60 + ring * 12),
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.08, 0.3] }}
          transition={{ duration: 3 + ring, repeat: Infinity, ease: 'easeInOut', delay: ring * 0.5 }}
        />
      ))}

      {/* Orbiting eco-action dots */}
      <svg className="absolute inset-0" viewBox="0 0 200 200" fill="none">
        <defs>
          <radialGradient id="earthGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>
        </defs>

        {/* Earth circle */}
        <motion.circle
          cx="100" cy="100" r="50"
          fill="url(#earthGrad)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 120, damping: 12 }}
          stroke="rgba(16,185,129,0.4)"
          strokeWidth="1"
        />

        {/* Continents shapes (decorative) */}
        <ellipse cx="88" cy="90" rx="16" ry="10" fill="rgba(255,255,255,0.15)" />
        <ellipse cx="112" cy="105" rx="12" ry="8" fill="rgba(255,255,255,0.12)" />
        <ellipse cx="95" cy="115" rx="8" ry="5" fill="rgba(255,255,255,0.1)" />

        {/* Orbit paths */}
        <circle cx="100" cy="100" r="72" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="88" stroke="rgba(16,185,129,0.05)" strokeWidth="0.5" strokeDasharray="3 5" />

        {/* Orbiting dots */}
        {orbitDots.map((dot) => (
          <motion.circle
            key={dot.id}
            r={dot.size / 2}
            fill={dot.color}
            animate={{
              cx: [100, 100 + 72, 100, 100 - 72, 100],
              cy: [100 - 72, 100, 100 + 72, 100, 100 - 72],
            }}
            transition={{ duration: dot.duration, repeat: Infinity, ease: 'linear', delay: dot.delay }}
            style={{ opacity: 0.8 }}
          />
        ))}
      </svg>

      {/* Leaf particles floating upward */}
      {leafParticles.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute text-lg pointer-events-none"
          style={{ left: `${leaf.x}%`, bottom: '10%' }}
          animate={{
            y: [0, -160],
            x: [0, Math.random() > 0.5 ? 20 : -20, 0],
            opacity: [0, 1, 1, 0],
            rotate: [0, 180],
            scale: [0.5, 1, 0.6],
          }}
          transition={{ duration: leaf.duration, repeat: Infinity, ease: 'easeOut', delay: leaf.delay }}
        >
          🌿
        </motion.div>
      ))}
    </div>
  )
}

/* ──────────────── Achievement Badge ──────────────── */

function EcoBadge({ badge, index }: { badge: typeof ecoBadges[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: index * 0.08 }}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${
        badge.unlocked
          ? 'r33-badge-unlocked border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30'
          : 'border-border bg-muted/40 opacity-60'
      }`}
    >
      {/* Shimmer overlay for unlocked */}
      {badge.unlocked && (
        <motion.div
          className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
          />
        </motion.div>
      )}

      <div className={`relative text-2xl ${!badge.unlocked ? 'grayscale' : ''}`}>
        {badge.unlocked ? badge.icon : <Lock className="h-6 w-6 text-muted-foreground" />}
      </div>
      <span className={`text-[10px] font-semibold text-center leading-tight ${badge.unlocked ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>
        {badge.name}
      </span>
    </motion.div>
  )
}

/* ──────────────── Confetti Particles ──────────────── */

function ChallengeConfetti({ active }: { active: boolean }) {
  if (!active) return null

  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40,
    color: ['#10b981', '#22c55e', '#14b8a6', '#84cc16', '#fbbf24', '#06b6d4'][i % 6],
    delay: Math.random() * 0.4,
    size: 4 + Math.random() * 5,
    drift: (Math.random() - 0.5) * 60,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.5,
            backgroundColor: p.color,
            left: `${p.x}%`,
            top: '40%',
            borderRadius: 1,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ y: 80, opacity: 0, x: p.drift, rotate: 360, scale: 0.4 }}
          transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

/* ────────────────── Monthly Bar Chart ────────────────── */

function MonthlyImpactChart() {
  const maxVal = Math.max(...monthlyData.map((d) => d.value), 1)
  const currentMonthIndex = monthlyData.length - 1

  return (
    <div className="r33-chart-wrapper">
      <svg viewBox="0 0 320 140" className="w-full" role="img" aria-label="Gráfico mensal de impacto ambiental">
        <defs>
          <linearGradient id="barGreen" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="barGreenHighlight" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((line) => (
          <line
            key={line}
            x1="40" y1={120 - 100 * line}
            x2="310" y2={120 - 100 * line}
            stroke="rgba(148,163,184,0.15)"
            strokeWidth="0.5"
          />
        ))}

        {/* Bars */}
        {monthlyData.map((item, i) => {
          const barH = Math.max(2, (item.value / maxVal) * 100)
          const isCurrent = i === currentMonthIndex
          const barWidth = 32
          const gap = (310 - 40 - barWidth * monthlyData.length) / (monthlyData.length - 1)
          const x = 40 + i * (barWidth + gap)

          return (
            <g key={item.month}>
              {/* Bar */}
              <motion.rect
                x={x}
                y={120}
                width={barWidth}
                height={0}
                rx="4"
                ry="4"
                fill={isCurrent ? 'url(#barGreenHighlight)' : 'url(#barGreen)'}
                animate={{ height: barH, y: 120 - barH }}
                transition={{ type: 'spring' as const, stiffness: 80, damping: 14, delay: 0.15 + i * 0.1 }}
              />
              {/* Glow for current month */}
              {isCurrent && (
                <motion.rect
                  x={x - 2}
                  y={120}
                  width={barWidth + 4}
                  height={0}
                  rx="6"
                  ry="6"
                  fill="none"
                  stroke="rgba(16,185,129,0.5)"
                  strokeWidth="1.5"
                  animate={{ height: barH + 4, y: 122 - barH - 4 }}
                  transition={{ type: 'spring' as const, stiffness: 80, damping: 14, delay: 0.15 + i * 0.1 }}
                />
              )}
              {/* Value label */}
              <motion.text
                x={x + barWidth / 2}
                y={115 - barH}
                textAnchor="middle"
                className="fill-emerald-600 dark:fill-emerald-400"
                fontSize="9"
                fontWeight="600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                {item.value}
              </motion.text>
              {/* Month label */}
              <text
                x={x + barWidth / 2}
                y={134}
                textAnchor="middle"
                className={isCurrent ? 'fill-emerald-600 dark:fill-emerald-400 font-bold' : 'fill-muted-foreground'}
                fontSize="10"
                fontWeight={isCurrent ? '700' : '400'}
              >
                {item.month}
              </text>
            </g>
          )
        })}

        {/* Y axis label */}
        <text x="8" y="72" transform="rotate(-90, 8, 72)" textAnchor="middle" fontSize="8" className="fill-muted-foreground">
          kg CO₂
        </text>
      </svg>
    </div>
  )
}

/* ════════════════════ Main Component ════════════════════ */

export function EcoImpactTracker() {
  const [challengeAccepted, setChallengeAccepted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const co2Count = useAnimatedCounter(impactStats[0].value)
  const treeCount = useAnimatedCounter(impactStats[1].value)
  const plasticCount = useAnimatedCounter(impactStats[2].value)
  const waterCount = useAnimatedCounter(impactStats[3].value)

  const counterValues = [co2Count, treeCount, plasticCount, waterCount]

  const unlockedCount = ecoBadges.filter((b) => b.unlocked).length
  const nextBadge = ecoBadges.find((b) => !b.unlocked)
  const badgeProgress = nextBadge
    ? Math.min((unlockedCount / (ecoBadges.indexOf(nextBadge) + 1)) * 100, 100)
    : 100

  const handleAcceptChallenge = () => {
    setChallengeAccepted(true)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1500)
  }

  const medalColors = ['rgba(255,215,0,0.9)', 'rgba(192,192,192,0.9)', 'rgba(205,127,50,0.9)']

  return (
    <section className="r33-eco-tracker bg-card rounded-2xl border border-border overflow-hidden">
      {/* ─── Header ─── */}
      <motion.div
        className="relative bg-gradient-to-r from-emerald-600 to-teal-600 p-4 sm:p-5 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Leaf className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-base font-bold text-white">Impacto Ambiental</h2>
              <p className="text-[11px] text-white/70">Suas escolhas sustentáveis fazem a diferença</p>
            </div>
          </div>
          <motion.span
            className="text-2xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            🌱
          </motion.span>
        </div>
      </motion.div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* ─── 1. Impact Dashboard ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {impactStats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.id}
                className="r33-stat-card bg-gradient-to-br from-white to-secondary/30 dark:from-secondary/20 dark:to-secondary/10 rounded-xl p-3 border border-border flex flex-col items-center gap-1.5 text-center"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 180, damping: 16, delay: i * 0.08 }}
              >
                <div
                  className="flex items-center justify-center h-9 w-9 rounded-lg"
                  style={{ backgroundColor: `${stat.color}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
                <div>
                  <span className="text-lg font-extrabold" style={{ color: stat.color }}>
                    {counterValues[i]}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground ml-0.5">{stat.unit}</span>
                </div>
                <span className="text-[9px] text-muted-foreground leading-tight">{stat.label}</span>
              </motion.div>
            )
          })}
        </div>

        {/* ─── 2. SVG Earth Visualization ─── */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 100, damping: 14, delay: 0.3 }}
        >
          <EarthVisualization />
        </motion.div>

        {/* ─── 3. Achievement Badges ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />
              Conquistas ECO
            </h3>
            <span className="text-[10px] text-muted-foreground font-medium">
              {unlockedCount}/{ecoBadges.length} desbloqueadas
            </span>
          </div>

          {/* Badge grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            {ecoBadges.map((badge, i) => (
              <EcoBadge key={badge.id} badge={badge} index={i} />
            ))}
          </div>

          {/* Progress to next badge */}
          {nextBadge && (
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Próxima: {nextBadge.name}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(badgeProgress)}%
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: '0%' }}
                  animate={{ width: `${badgeProgress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                />
                <motion.div
                  className="absolute inset-y-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{ width: '50%' }}
                  animate={{ left: ['-50%', '150%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ─── 4. Weekly Eco Challenge ─── */}
        <motion.div
          className="relative overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-800/40"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring' as const, stiffness: 140, damping: 16, delay: 0.4 }}
        >
          {/* Animated gradient border */}
          <div className="r33-challenge-border absolute inset-0 rounded-xl" />

          <div className="relative bg-card rounded-xl p-4">
            <ChallengeConfetti active={showConfetti} />

            <div className="flex items-start gap-3">
              <motion.div
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shrink-0"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Target className="h-5 w-5 text-white" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  {weeklyChallenge.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">{weeklyChallenge.description}</p>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Progresso</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {weeklyChallenge.progress}/{weeklyChallenge.total}
                    </span>
                  </div>
                  <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(weeklyChallenge.progress / weeklyChallenge.total) * 100}%` }}
                      transition={{ type: 'spring' as const, stiffness: 100, damping: 14, delay: 0.6 }}
                    />
                  </div>
                </div>

                {/* Reward */}
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-2 flex items-center gap-1">
                  🎁 {weeklyChallenge.reward}
                </p>

                {/* Accept button */}
                <AnimatePresence mode="wait">
                  {!challengeAccepted ? (
                    <motion.button
                      key="accept"
                      className="mt-3 w-full h-9 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold hover:from-emerald-600 hover:to-teal-600 transition-colors"
                      whileTap={{ scale: 0.96 }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      onClick={handleAcceptChallenge}
                    >
                      Aceitar desafio
                    </motion.button>
                  ) : (
                    <motion.div
                      key="accepted"
                      className="mt-3 w-full h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      ✅ Desafio aceito!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── 5. Leaderboard ─── */}
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <Medal className="h-4 w-4 text-emerald-500" />
            Campeões ECO da Semana
          </h3>

          <div className="space-y-2">
            {leaderboard.map((user, i) => (
              <motion.div
                key={user.rank}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                  user.isCurrentUser
                    ? 'r33-leaderboard-me bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-secondary/20 hover:bg-secondary/40'
                }`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring' as const, stiffness: 160, damping: 18, delay: 0.5 + i * 0.07 }}
              >
                {/* Rank */}
                <div className="flex items-center justify-center h-7 w-7 rounded-lg shrink-0">
                  {user.rank <= 3 ? (
                    <div
                      className="flex items-center justify-center h-7 w-7 rounded-full"
                      style={{ backgroundColor: medalColors[user.rank - 1], boxShadow: `0 2px 8px ${medalColors[user.rank - 1]}` }}
                    >
                      <span className="text-[11px] font-extrabold text-white">{user.rank}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">#{user.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <span className="text-xl">{user.avatar}</span>

                {/* Name and points */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${user.isCurrentUser ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
                    {user.name}
                    {user.isCurrentUser && (
                      <ChevronRight className="inline h-3 w-3 ml-1 text-emerald-500" />
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{user.points.toLocaleString('pt-BR')} pts</p>
                </div>

                {/* Points badge */}
                {user.rank <= 3 && (
                  <motion.span
                    className="text-[10px] font-bold text-amber-600 dark:text-amber-400"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                  >
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── 6. Monthly Impact Chart ─── */}
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <Leaf className="h-4 w-4 text-emerald-500" />
            Impacto Mensal de CO₂
          </h3>

          <motion.div
            className="bg-secondary/20 rounded-xl p-3 sm:p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <MonthlyImpactChart />
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Total de {monthlyData.reduce((a, b) => a + b.value, 0).toFixed(1)} kg CO₂ economizado em 6 meses
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── Custom Styles ─── */}
      <style>{`
        .r33-eco-tracker {
          --r33-green: #10b981;
          --r33-green-light: #34d399;
          --r33-teal: #14b8a6;
        }

        .r33-challenge-border {
          background: linear-gradient(
            90deg,
            rgba(16,185,129,0.4),
            rgba(20,184,166,0.6),
            rgba(16,185,129,0.4)
          );
          background-size: 200% 100%;
          animation: r33-border-shift 3s ease-in-out infinite;
        }

        .r33-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16,185,129,0.12);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .r33-badge-unlocked:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(16,185,129,0.15);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .r33-leaderboard-me {
          box-shadow: 0 0 0 1px rgba(16,185,129,0.2);
        }

        @keyframes r33-border-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  )
}
