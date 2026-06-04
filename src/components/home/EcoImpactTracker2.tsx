'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf, Lock, Trophy, TreePine, MapPin, Flame, Target,
  ChevronLeft, ChevronRight, Star, Zap, Recycle,
  Lightbulb, Crown, Users, Sparkles, Heart,
} from 'lucide-react'

/* ════════════════════════════ Mock Data ════════════════════════════ */

interface EcoChallenge {
  id: string
  title: string
  completed: number
  total: number
  xp: number
  ecoPoints: number
  category: string
  icon: string
}

const INITIAL_CHALLENGES: EcoChallenge[] = [
  { id: 'ch-1', title: 'Compre produtos locais', completed: 3, total: 5, xp: 150, ecoPoints: 30, category: 'reduz pegada de carbono', icon: '📍' },
  { id: 'ch-2', title: 'Evite sacolas plásticas', completed: 1, total: 3, xp: 100, ecoPoints: 20, category: 'redução de resíduos', icon: '🛍️' },
  { id: 'ch-3', title: 'Escolha entrega sustentável', completed: 0, total: 2, xp: 200, ecoPoints: 40, category: 'entrega verde', icon: '🚲' },
  { id: 'ch-4', title: 'Avalie produtos ecológicos', completed: 2, total: 4, xp: 120, ecoPoints: 25, category: 'conscientização', icon: '⭐' },
]

const GREEN_BADGES = [
  { id: 'b1', name: 'Reciclador', description: 'Reciclou 50 itens', icon: '♻️', unlocked: true },
  { id: 'b2', name: 'Eco Comprador', description: '10 compras sustentáveis', icon: '🛒', unlocked: true },
  { id: 'b3', name: 'Guardião da Água', description: 'Economizou 500L de água', icon: '💧', unlocked: true },
  { id: 'b4', name: 'Embaixador Verde', description: 'Indicou 15 amigos', icon: '🌍', unlocked: true },
  { id: 'b5', name: 'Herói do Carbono', description: 'Reduziu 100kg CO₂', icon: '🦸', unlocked: false },
  { id: 'b6', name: 'Lenda Sustentável', description: 'Completou 50 desafios', icon: '👑', unlocked: false },
]

const ECO_TIPS = [
  { id: 't1', text: 'Dica: Leve sua sacola reutilizável para o mercado. Uma sacola de pano evita até 700 sacolas plásticas por ano!', icon: '🛍️' },
  { id: 't2', text: 'Dica: Prefira produtos a granel. Reduz embalagens e evita desperdício de alimentos.', icon: '🌾' },
  { id: 't3', text: 'Dica: Escolha entregas consolidadas. Pedidos juntos reduzem as emissões de transporte.', icon: '📦' },
  { id: 't4', text: 'Dica: Composte restos de alimentos. 30% do lixo doméstico pode ser compostado!', icon: '🌱' },
]

const LEADERBOARD = [
  { rank: 1, name: 'Maria Oliveira', points: 4820, avatar: '🧑‍🌾', streak: 45 },
  { rank: 2, name: 'João Santos', points: 4150, avatar: '👨‍🔬', streak: 38 },
  { rank: 3, name: 'Ana Costa', points: 3680, avatar: '👩‍🎨', streak: 32 },
  { rank: 4, name: 'Carlos Mendes', points: 2940, avatar: '🧑‍💼', streak: 24 },
  { rank: 5, name: 'Você', points: 2450, avatar: '🙋', streak: 18, isCurrentUser: true },
]

const CO2_MONTHLY = [
  { month: 'Jan', kg: 2.1 },
  { month: 'Fev', kg: 3.4 },
  { month: 'Mar', kg: 4.7 },
  { month: 'Abr', kg: 5.2 },
  { month: 'Mai', kg: 6.8 },
  { month: 'Jun', kg: 8.3 },
]

const IMPACT_MAP_POINTS = [
  { id: 'mp1', type: 'recycling', label: 'Ponto de Reciclagem', x: 25, y: 35, icon: '♻️' },
  { id: 'mp2', type: 'market', label: 'Feira Orgânica', x: 55, y: 25, icon: '🥬' },
  { id: 'mp3', type: 'market', label: 'Mercado Local', x: 72, y: 55, icon: '🏪' },
  { id: 'mp4', type: 'recycling', label: 'Coleta Seletiva', x: 40, y: 65, icon: '🗑️' },
  { id: 'mp5', type: 'delivery', label: 'Hub Entrega Verde', x: 60, y: 75, icon: '🚲' },
  { id: 'mp6', type: 'garden', label: 'Horta Comunitária', x: 15, y: 55, icon: '🌿' },
]

/* ═══════════════════ Animated Counter Hook ═════════════════════════ */

function useAnimatedCounter(target: number, duration = 1500) {
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

/* ═══════════════════ 1. Leaf Particle Celebration ═══════════════════ */

function LeafCelebration({ active }: { active: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        delay: Math.random() * 0.6,
        duration: 1.2 + Math.random() * 0.8,
        drift: (Math.random() - 0.5) * 50,
        size: 14 + Math.random() * 8,
        leaf: ['🍃', '🌿', '🍂', '🌱'][i % 4],
      })),
    [],
  )

  if (!active) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: '20%', fontSize: p.size }}
          initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: 120,
            opacity: 0,
            x: p.drift,
            rotate: [0, 90, 180, 270],
            scale: [1, 1.2, 0.8, 0.4],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
        >
          {p.leaf}
        </motion.div>
      ))}
    </div>
  )
}

/* ═══════════════════ 2. Eco Score Ring ═════════════════════════════ */

function EcoScoreRing() {
  const [animatedScore, setAnimatedScore] = useState(0)
  const hasAnimated = useRef(false)
  const score = 73

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true
    let start = 0
    const step = score / 90
    const timer = setInterval(() => {
      start += step
      if (start >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [score])

  const getGrade = (s: number): string => {
    if (s >= 95) return 'A+'
    if (s >= 85) return 'A'
    if (s >= 70) return 'B'
    return 'C'
  }

  const gradeColor = (s: number): string => {
    if (s >= 95) return '#f59e0b'
    if (s >= 85) return '#10b981'
    if (s >= 70) return '#3b82f6'
    return '#94a3b8'
  }

  const radius = 62
  const circumference = 2 * Math.PI * radius
  const progressOffset = circumference - (animatedScore / 100) * circumference
  const grade = getGrade(score)
  const gColor = gradeColor(score)

  return (
    <motion.div
      className="r46-eco-score flex flex-col items-center gap-3"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 16 }}
    >
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        <svg className="absolute inset-0" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="r46-ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="10" />
          <motion.circle
            cx="80" cy="80" r={radius} fill="none" stroke="url(#r46-ringGrad)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progressOffset }}
            transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
            transform="rotate(-90, 80, 80)"
          />
        </svg>
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Leaf className="h-5 w-5 text-emerald-500 mb-1" />
          </motion.div>
          <span className="text-3xl font-extrabold" style={{ color: gColor }}>
            {animatedScore}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">de 100</span>
          <motion.div
            className="mt-1 flex items-center justify-center h-7 w-7 rounded-full text-xs font-extrabold text-white"
            style={{ backgroundColor: gColor }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 15, delay: 0.9 }}
          >
            {grade}
          </motion.div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
        <Sparkles className="h-3 w-3 text-emerald-500" />
        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
          +{score - 58} pontos este mês
        </span>
      </div>
    </motion.div>
  )
}

/* ═══════════════════ 3. Weekly Eco Challenges ═══════════════════════ */

function WeeklyEcoChallenges({
  challenges,
  onProgress,
}: {
  challenges: EcoChallenge[]
  onProgress: (id: string) => void
}) {
  const totalXP = challenges.reduce((sum, c) => sum + (c.completed >= c.total ? c.xp : 0), 0)
  const totalEco = challenges.reduce((sum, c) => sum + c.completed, 0)
  const [celebratingId, setCelebratingId] = useState<string | null>(null)

  const handleAdvance = (id: string, current: number, total: number) => {
    if (current < total) {
      onProgress(id)
      if (current + 1 >= total) {
        setCelebratingId(id)
        setTimeout(() => setCelebratingId(null), 2000)
      }
    }
  }

  return (
    <div className="r46-eco-challenge space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-orange-500" />
          Desafios Eco da Semana
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
            <Zap className="h-3 w-3" /> {totalXP} XP
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <Leaf className="h-3 w-3" /> {totalEco} pts
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {challenges.map((challenge, i) => {
          const pct = (challenge.completed / challenge.total) * 100
          const isComplete = challenge.completed >= challenge.total
          const isCelebrating = celebratingId === challenge.id

          return (
            <motion.div
              key={challenge.id}
              className="relative overflow-hidden rounded-xl border transition-colors"
              style={{
                borderColor: isComplete ? 'rgba(16,185,129,0.4)' : 'rgba(148,163,184,0.15)',
                backgroundColor: isComplete ? 'rgba(16,185,129,0.05)' : 'rgba(148,163,184,0.04)',
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring' as const, stiffness: 160, damping: 18, delay: i * 0.08 }}
            >
              <LeafCelebration active={isCelebrating} />

              <div className="flex items-center gap-3 p-3">
                <span className="text-xl shrink-0">{challenge.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold truncate ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                      {challenge.title}
                      {isComplete && <Sparkles className="inline h-3 w-3 ml-1 text-emerald-500" />}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground shrink-0 ml-2">
                      {challenge.completed}/{challenge.total}
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: isComplete
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : 'linear-gradient(90deg, #14b8a6, #06b6d4)',
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'spring' as const, stiffness: 100, damping: 14, delay: 0.3 + i * 0.08 }}
                    />
                    {!isComplete && (
                      <motion.div
                        className="absolute inset-y-0"
                        style={{ width: '40%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
                        animate={{ left: ['-40%', '150%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">+{challenge.xp} XP</span>
                    <span className="text-[9px] text-muted-foreground">· {challenge.category}</span>
                  </div>
                </div>

                {!isComplete && (
                  <motion.div whileTap={{ scale: 0.92 }} className="shrink-0">
                    <button
                      className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors"
                      onClick={() => handleAdvance(challenge.id, challenge.completed, challenge.total)}
                    >
                      <ChevronRight className="h-4 w-4 text-white" />
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════ 4. Community Impact ══════════════════════════ */

function CommunityImpact() {
  const treeCount = useAnimatedCounter(127, 2000)

  return (
    <motion.div
      className="r46-community-impact relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-800/30 p-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 140, damping: 16 }}
    >
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-200/30 dark:bg-emerald-800/20" />
      <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-teal-200/20 dark:bg-teal-800/15" />

      <div className="relative z-10 flex items-center gap-4">
        <motion.div
          className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shrink-0"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <TreePine className="h-6 w-6 text-white" />
        </motion.div>
        <div>
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
            A comunidade já plantou{' '}
            <motion.span
              className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.5 }}
            >
              {treeCount}
            </motion.span>{' '}
            árvores 🌳
          </p>
          <p className="text-[10px] text-emerald-700/70 dark:text-emerald-300/70 mt-0.5">
            +23 árvores este mês · Você ajudou a plantar 3!
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════ 5. CO2 Savings Chart ══════════════════════════ */

function CO2SavingsChart() {
  const maxVal = Math.max(...CO2_MONTHLY.map((d) => d.kg), 1)
  const currentIdx = CO2_MONTHLY.length - 1

  return (
    <div className="r46-co2-chart">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
        <Recycle className="h-4 w-4 text-emerald-500" />
        Economia Mensal de CO₂
      </h3>
      <div className="bg-secondary/20 rounded-xl p-3">
        <svg viewBox="0 0 320 130" className="w-full" role="img" aria-label="Economia mensal de CO2">
          <defs>
            <linearGradient id="r46-barGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="r46-barHi" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((line) => (
            <line key={`g${line}`} x1="35" y1={105 - 80 * line} x2="305" y2={105 - 80 * line} stroke="rgba(148,163,184,0.12)" strokeWidth="0.5" />
          ))}

          {CO2_MONTHLY.map((item, i) => {
            const barH = Math.max(2, (item.kg / maxVal) * 80)
            const isCurrent = i === currentIdx
            const barWidth = 30
            const gap = (305 - 35 - barWidth * CO2_MONTHLY.length) / (CO2_MONTHLY.length - 1)
            const x = 35 + i * (barWidth + gap)

            return (
              <g key={item.month}>
                <motion.rect
                  x={x} y={105} width={barWidth} height={0} rx="4" ry="4"
                  fill={isCurrent ? 'url(#r46-barHi)' : 'url(#r46-barGrad)'}
                  animate={{ height: barH, y: 105 - barH }}
                  transition={{ type: 'spring' as const, stiffness: 80, damping: 14, delay: 0.15 + i * 0.09 }}
                />
                {isCurrent && (
                  <motion.rect
                    x={x - 2} y={105} width={barWidth + 4} height={0} rx="6" ry="6"
                    fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5"
                    animate={{ height: barH + 4, y: 107 - barH - 4 }}
                    transition={{ type: 'spring' as const, stiffness: 80, damping: 14, delay: 0.15 + i * 0.09 }}
                  />
                )}
                <motion.text
                  x={x + barWidth / 2} y={100 - barH} textAnchor="middle"
                  fontSize="9" fontWeight="600" fill={isCurrent ? '#059669' : 'rgba(16,185,129,0.8)'}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.09 }}
                >
                  {item.kg}kg
                </motion.text>
                <text x={x + barWidth / 2} y={120} textAnchor="middle" fontSize="10"
                  fontWeight={isCurrent ? '700' : '400'}
                  fill={isCurrent ? '#059669' : 'rgba(100,116,139,0.7)'}
                >
                  {item.month}
                </text>
              </g>
            )
          })}
        </svg>
        <p className="text-[10px] text-center text-muted-foreground mt-1">
          Total: <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {CO2_MONTHLY.reduce((a, b) => a + b.kg, 0).toFixed(1)} kg CO₂
          </span> economizado em 6 meses
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════ 6. Green Badges ══════════════════════════════ */

function GreenBadges() {
  const unlocked = GREEN_BADGES.filter((b) => b.unlocked).length

  return (
    <div className="r46-green-badge">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-amber-500" />
          Medalhas Verdes
        </h3>
        <span className="text-[10px] text-muted-foreground font-medium">{unlocked}/{GREEN_BADGES.length}</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {GREEN_BADGES.map((badge, i) => (
          <motion.div
            key={badge.id}
            className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
              badge.unlocked
                ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30'
                : 'border-border bg-muted/40 opacity-50'
            }`}
            initial={{ opacity: 0, scale: 0.7, y: 14 }}
            animate={{ opacity: badge.unlocked ? 1 : 0.5, scale: 1, y: 0 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: i * 0.07 }}
          >
            {badge.unlocked && (
              <motion.div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                />
              </motion.div>
            )}
            <div className={`relative text-xl ${!badge.unlocked ? 'grayscale' : ''}`}>
              {badge.unlocked ? badge.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
            </div>
            <span className={`text-[9px] font-semibold text-center leading-tight ${
              badge.unlocked ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'
            }`}>
              {badge.name}
            </span>
            {badge.unlocked && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 15, delay: 0.5 + i * 0.07 }}
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center"
              >
                <span className="text-[7px] text-white">✓</span>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════ 7. Eco Tips Carousel ═════════════════════════ */

function EcoTipsCarousel() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }, [current])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % ECO_TIPS.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + ECO_TIPS.length) % ECO_TIPS.length)
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(next, 6000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [next])

  const tip = ECO_TIPS[current]

  return (
    <div className="r46-eco-tips">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Dicas Verdes
        </h3>
        <span className="text-[10px] text-muted-foreground font-medium">{current + 1}/{ECO_TIPS.length}</span>
      </div>

      <div className="relative min-h-[100px] overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-amber-950/20 dark:to-emerald-950/20 border border-amber-200/40 dark:border-amber-800/20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tip.id}
            custom={direction}
            className="absolute inset-0 flex items-center gap-3 p-4"
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 60 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 24 }}
          >
            <motion.span
              className="text-3xl shrink-0"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {tip.icon}
            </motion.span>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-200 leading-relaxed font-medium">
              {tip.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-1.5">
          {ECO_TIPS.map((_, i) => (
            <button
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-emerald-500' : 'w-2 bg-emerald-200 dark:bg-emerald-800/40'
              }`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <motion.div whileTap={{ scale: 0.9 }}>
            <button className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-secondary/40 transition-colors" onClick={prev}>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <button className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-secondary/40 transition-colors" onClick={next}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════ 8. Leaderboard ════════════════════════════════ */

function Leaderboard() {
  const crownColors = ['rgba(255,215,0,0.9)', 'rgba(192,192,192,0.9)', 'rgba(205,127,50,0.9)']

  return (
    <div className="r46-leaderboard">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          <Crown className="h-4 w-4 text-amber-500" />
          Campeões Eco
        </h3>
        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-0.5">
          <Users className="h-3 w-3" /> Top 5
        </span>
      </div>

      <div className="space-y-2">
        {LEADERBOARD.map((user, i) => (
          <motion.div
            key={user.rank}
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
              user.isCurrentUser
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40'
                : 'bg-secondary/20 hover:bg-secondary/40'
            }`}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring' as const, stiffness: 160, damping: 18, delay: i * 0.07 }}
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-lg shrink-0">
              {user.rank <= 3 ? (
                <motion.div
                  className="flex items-center justify-center h-8 w-8 rounded-full"
                  style={{ backgroundColor: crownColors[user.rank - 1], boxShadow: `0 2px 10px ${crownColors[user.rank - 1]}` }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                >
                  <Leaf className="h-3.5 w-3.5 text-white" />
                </motion.div>
              ) : (
                <span className="text-xs font-bold text-muted-foreground">#{user.rank}</span>
              )}
            </div>

            <span className="text-xl shrink-0">{user.avatar}</span>

            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${user.isCurrentUser ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
                {user.name}
                {user.rank === 1 && <Crown className="inline h-3 w-3 ml-1 text-amber-500" />}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-medium">{user.points.toLocaleString('pt-BR')} pts</span>
                <span className="text-[10px] text-orange-500 font-semibold flex items-center gap-0.5">
                  <Flame className="h-2.5 w-2.5" />{user.streak}d
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════ 9. Impact Map ════════════════════════════════ */

function ImpactMap() {
  const [activePoint, setActivePoint] = useState<string | null>(null)

  const hotspotColors: Record<string, string> = {
    recycling: 'rgba(16,185,129,0.8)',
    market: 'rgba(245,158,11,0.8)',
    delivery: 'rgba(59,130,246,0.8)',
    garden: 'rgba(34,197,94,0.8)',
  }

  return (
    <div className="r46-impact-map">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-emerald-500" />
          Mapa Eco do Bairro
        </h3>
        <span className="text-[10px] text-muted-foreground font-medium">{IMPACT_MAP_POINTS.length} pontos</span>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-emerald-200/40 dark:border-emerald-800/30" style={{ height: 180 }}>
        {/* Background map grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 to-teal-100/50 dark:from-emerald-950/30 dark:to-teal-950/20">
          {/* Street grid lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(148,163,184,0.12)" strokeWidth="0.4" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(148,163,184,0.15)" strokeWidth="0.4" />
            <line x1="0" y1="70" x2="100" y2="70" stroke="rgba(148,163,184,0.12)" strokeWidth="0.4" />
            <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(148,163,184,0.12)" strokeWidth="0.4" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(148,163,184,0.15)" strokeWidth="0.4" />
            <line x1="80" y1="0" x2="80" y2="100" stroke="rgba(148,163,184,0.12)" strokeWidth="0.4" />
            {/* Park area */}
            <rect x="5" y="42" width="18" height="18" rx="3" fill="rgba(34,197,94,0.12)" />
            <rect x="60" y="65" width="15" height="12" rx="2" fill="rgba(34,197,94,0.08)" />
          </svg>
        </div>

        {/* Hotspot markers */}
        {IMPACT_MAP_POINTS.map((point, i) => (
          <motion.button
            key={point.id}
            className="absolute flex items-center justify-center z-10"
            style={{ left: `${point.x}%`, top: `${point.y}%`, transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: 0.2 + i * 0.08 }}
            onClick={() => setActivePoint(activePoint === point.id ? null : point.id)}
          >
            {/* Pulse ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 36,
                height: 36,
                border: `1.5px solid ${hotspotColors[point.type] || 'rgba(148,163,184,0.4)'}`,
              }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="relative text-lg">{point.icon}</span>

            {/* Tooltip */}
            <AnimatePresence>
              {activePoint === point.id && (
                <motion.div
                  className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-card border border-border text-[10px] font-semibold shadow-lg"
                  initial={{ opacity: 0, y: 4, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                >
                  {point.label}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-card border-b border-r border-border rotate-45 -mt-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-3 px-2 py-1 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50">
          <span className="flex items-center gap-1 text-[8px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hotspotColors.recycling }} /> Reciclagem
          </span>
          <span className="flex items-center gap-1 text-[8px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hotspotColors.market }} /> Feira
          </span>
          <span className="flex items-center gap-1 text-[8px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hotspotColors.delivery }} /> Entrega
          </span>
          <span className="flex items-center gap-1 text-[8px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hotspotColors.garden }} /> Horta
          </span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════ 10. Monthly Goal ══════════════════════════════ */

function MonthlyGoal() {
  const current = 3.2
  const goal = 5
  const pct = Math.min((current / goal) * 100, 100)
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const [animatedPct, setAnimatedPct] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true
    let start = 0
    const step = pct / 80
    const timer = setInterval(() => {
      start += step
      if (start >= pct) {
        setAnimatedPct(pct)
        clearInterval(timer)
      } else {
        setAnimatedPct(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [pct])

  return (
    <motion.div
      className="r46-monthly-goal flex flex-col items-center gap-3 p-4 rounded-xl border border-emerald-200/40 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 16, delay: 0.4 }}
    >
      <div className="relative flex items-center justify-center" style={{ width: 110, height: 110 }}>
        <svg className="absolute inset-0" viewBox="0 0 110 110">
          <defs>
            <linearGradient id="r46-goalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="8" />
          <motion.circle
            cx="55" cy="55" r={radius} fill="none" stroke="url(#r46-goalGrad)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
            transform="rotate(-90, 55, 55)"
          />
        </svg>
        <div className="relative z-10 flex flex-col items-center">
          <Target className="h-4 w-4 text-amber-500 mb-0.5" />
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{animatedPct}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Meta: Reduzir 5kg CO₂ este mês</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{current}kg</span> de {goal}kg
        </p>
        <p className="text-[9px] text-amber-600 dark:text-amber-400 font-medium mt-1 flex items-center justify-center gap-0.5">
          <Heart className="h-2.5 w-2.5" /> Faltam {(goal - current).toFixed(1)}kg — Você consegue!
        </p>
      </div>
    </motion.div>
  )
}

/* ═════════════════════════ Main Component ══════════════════════════ */

export default function EcoImpactTracker2() {
  const STORAGE_KEY = 'r46-eco-challenges'

  const loadChallenges = (): EcoChallenge[] => {
    if (typeof window === 'undefined') return INITIAL_CHALLENGES
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as EcoChallenge[]
        if (Array.isArray(parsed) && parsed.length === INITIAL_CHALLENGES.length) return parsed
      }
    } catch { /* ignore */ }
    return INITIAL_CHALLENGES
  }

  const [challenges, setChallenges] = useState<EcoChallenge[]>(INITIAL_CHALLENGES)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setChallenges(loadChallenges())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges))
    }
  }, [challenges, mounted])

  const handleProgress = useCallback((id: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id && c.completed < c.total
          ? { ...c, completed: Math.min(c.completed + 1, c.total) }
          : c,
      ),
    )
  }, [])

  const communityTrees = useAnimatedCounter(127, 2000)
  const totalXP = challenges.reduce((s, c) => s + (c.completed >= c.total ? c.xp : 0), 0)
  const totalEcoPts = challenges.reduce((s, c) => s + c.completed * (c.ecoPoints / c.total), 0)

  return (
    <section className="r46-eco-tracker2 bg-card rounded-2xl border border-border overflow-hidden">
      {/* ─── Header ─── */}
      <motion.div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #059669, #0d9488, #059669)' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 140, damping: 18 }}
      >
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-white/5" />

        {/* Floating leaf decorations */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none text-base"
            style={{ left: `${15 + i * 30}%`, top: `${20 + (i % 2) * 30}%` }}
            animate={{
              y: [0, -10, 0],
              x: [0, i % 2 === 0 ? 6 : -6, 0],
              rotate: [0, i % 2 === 0 ? 12 : -12, 0],
              opacity: [0.25, 0.6, 0.25],
            }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
          >
            🍃
          </motion.div>
        ))}

        <div className="relative z-10 px-4 py-4 sm:px-5 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Leaf className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-base font-bold text-white">Desafios Eco & Comunidade</h2>
              <p className="text-[11px] text-white/70">Complete desafios, ganhe XP e ajude o planeta</p>
            </div>
          </div>
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Star className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-[10px] font-semibold text-white/90">{totalXP} XP</span>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Content ─── */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* 1. Eco Score */}
        <EcoScoreRing />

        {/* 2. Weekly Eco Challenges */}
        <WeeklyEcoChallenges challenges={challenges} onProgress={handleProgress} />

        {/* 3. Community Impact */}
        <CommunityImpact />

        {/* 4. CO2 Savings Chart */}
        <CO2SavingsChart />

        {/* 5. Green Badges */}
        <GreenBadges />

        {/* 6. Eco Tips Carousel */}
        <EcoTipsCarousel />

        {/* 7. Leaderboard */}
        <Leaderboard />

        {/* 8. Impact Map */}
        <ImpactMap />

        {/* 9. Monthly Goal */}
        <MonthlyGoal />

        {/* 10. XP & Stats Summary */}
        <motion.div
          className="flex items-center justify-center gap-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/40 dark:border-emerald-800/30"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 120, damping: 16, delay: 0.6 }}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            {totalXP} XP ganho
          </div>
          <div className="h-3 w-px bg-emerald-200 dark:bg-emerald-800/40" />
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Leaf className="h-3.5 w-3.5 text-emerald-500" />
            {Math.round(totalEcoPts)} eco-pontos
          </div>
          <div className="h-3 w-px bg-emerald-200 dark:bg-emerald-800/40" />
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <TreePine className="h-3.5 w-3.5 text-emerald-500" />
            {communityTrees} árvores
          </div>
        </motion.div>
      </div>

      {/* ─── Custom Styles ─── */}
      <style>{`
        .r46-eco-tracker2 {
          --r46-green: #10b981;
          --r46-teal: #14b8a6;
          --r46-amber: #f59e0b;
        }

        .r46-eco-challenge [style*="border-color: rgba(16,185,129"] {
          transition: border-color 0.3s ease, background-color 0.3s ease;
        }

        .r46-green-badge > div:first-of-type:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(16,185,129,0.15);
        }

        .r46-leaderboard > div > div:hover {
          transform: translateX(2px);
        }

        .r46-co2-chart rect:hover {
          filter: brightness(1.1);
        }

        .r46-impact-map button:hover {
          transform: translate(-50%, -50%) scale(1.15);
          transition: transform 0.2s ease;
        }
      `}</style>
    </section>
  )
}
