'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf, TreePine, Droplets, Zap, Lock, Trophy, Medal, Flame, Target,
  ChevronRight, ChevronLeft, TrendingUp, Users, Award, Sprout, Recycle,
  Lightbulb, ShoppingCart, Star, ArrowRight, Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

/* ══════════════════════════ Mock Data ══════════════════════════ */

const impactSummaryCards = [
  { id: 'co2', label: 'CO₂ Economizado', value: 127.5, unit: 'kg', equivalent: '7 árvores plantadas', icon: TreePine, color: '#10b981', bgColor: 'rgba(16,185,129,0.1)' },
  { id: 'plastic', label: 'Plástico Reduzido', value: 248, unit: 'unidades', equivalent: '496 garrafas evitadas', icon: Recycle, color: '#14b8a6', bgColor: 'rgba(20,184,166,0.1)' },
  { id: 'energy', label: 'Energia Economizada', value: 342, unit: 'kWh', equivalent: '68 lâmpadas LED', icon: Zap, color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
  { id: 'water', label: 'Água Economizada', value: 1856, unit: 'litros', equivalent: '37 banhos poupados', icon: Droplets, color: '#06b6d4', bgColor: 'rgba(6,182,212,0.1)' },
]

const monthlyImpactData = [
  { month: 'Jan', score: 12, co2: 8.2 },
  { month: 'Fev', score: 18, co2: 14.5 },
  { month: 'Mar', score: 24, co2: 19.8 },
  { month: 'Abr', score: 31, co2: 25.3 },
  { month: 'Mai', score: 42, co2: 33.1 },
  { month: 'Jun', score: 58, co2: 47.3 },
]

const ecoScoreData = {
  current: 72,
  previous: 58,
  tiers: [
    { name: 'Iniciante', min: 0, max: 20, color: '#94a3b8', icon: '🌱' },
    { name: 'Aprendiz', min: 21, max: 40, color: '#84cc16', icon: '🌿' },
    { name: 'Consciente', min: 41, max: 60, color: '#22c55e', icon: '🌳' },
    { name: 'Guardião', min: 61, max: 80, color: '#14b8a6', icon: '🛡️' },
    { name: 'Embaixador', min: 81, max: 95, color: '#06b6d4', icon: '🌍' },
    { name: 'Eco Herói', min: 96, max: 100, color: '#f59e0b', icon: '🦸' },
  ],
}

const greenProducts = [
  { id: 1, name: 'Sacolas Ecológicas Reutilizáveis', store: 'EcoStore Brasil', date: '15 Jun 2024', impact: '−2.3 kg CO₂', impactType: 'co2', ecoCertified: true },
  { id: 2, name: 'Detergente Biodegradável 2L', store: 'Limpo Natural', date: '12 Jun 2024', impact: '−1.8 kg CO₂', impactType: 'co2', ecoCertified: true },
  { id: 3, name: 'Caneta de Bambu Reciclado (kit 5)', store: 'Artesão Verde', date: '08 Jun 2024', impact: '−0.9 kg plástico', impactType: 'plastic', ecoCertified: false },
  { id: 4, name: 'Garrafa Térmica Aço Inox 750ml', store: 'Vida Sustentável', date: '05 Jun 2024', impact: '−48 plásticos/ano', impactType: 'plastic', ecoCertified: true },
  { id: 5, name: 'Sabonete Artesanal Natural', store: 'Saboaria Raízes', date: '01 Jun 2024', impact: '−0.4 kg CO₂', impactType: 'co2', ecoCertified: true },
]

const leaderboardData = [
  { rank: 1, name: 'Maria Oliveira', points: 4820, avatar: '🧑‍🌾', streak: 45 },
  { rank: 2, name: 'João Santos', points: 4150, avatar: '👨‍🔬', streak: 38 },
  { rank: 3, name: 'Ana Costa', points: 3680, avatar: '👩‍🎨', streak: 32 },
  { rank: 4, name: 'Pedro Lima', points: 2940, avatar: '🧑‍💼', streak: 24 },
  { rank: 5, name: 'Você', points: 2450, avatar: '🙋', streak: 18, isCurrentUser: true },
]

const ecoAchievements = [
  { id: 1, name: 'Primeiro Passo Verde', description: 'Primeira compra sustentável', icon: '🌱', unlocked: true, progress: 100 },
  { id: 2, name: 'Comprador Local', description: '5 compras de produtores locais', icon: '🏪', unlocked: true, progress: 100 },
  { id: 3, name: 'Embaixador ECO', description: 'Indicar 10 amigos ao programa', icon: '🌍', unlocked: true, progress: 100 },
  { id: 4, name: 'Zero Plástico', description: '50 sacolas plásticas evitadas', icon: '♻️', unlocked: true, progress: 100 },
  { id: 5, name: 'Herói da Água', description: 'Economizar 1000 litros de água', icon: '💧', unlocked: true, progress: 100 },
  { id: 6, name: 'Amigo das Árvores', description: 'Neutralizar 50 kg de CO₂', icon: '🌳', unlocked: false, progress: 72 },
  { id: 7, name: 'Energia Limpa', description: 'Economizar 500 kWh de energia', icon: '⚡', unlocked: false, progress: 68 },
  { id: 8, name: 'Herói Sustentável', description: 'Alcançar 100 kg de CO₂ economizado', icon: '🦸', unlocked: false, progress: 55 },
  { id: 9, name: 'Comunidade Verde', description: 'Participar de 20 desafios comunitários', icon: '🤝', unlocked: false, progress: 40 },
  { id: 10, name: 'Lenda Verde', description: 'Alcançar nível máximo eco', icon: '👑', unlocked: false, progress: 20 },
]

const ecoTips = [
  { id: 1, title: 'Prefira Produtos Locais', description: 'Produtos locais viajam menos, reduzindo emissões de CO₂ no transporte e apoiando a economia da sua região.', icon: '📍' },
  { id: 2, title: 'Evite Embalagens Plásticas', description: 'Opte por produtos com embalagens recicláveis ou compostáveis. Cada pequena escolha faz uma grande diferença.', icon: '📦' },
  { id: 3, title: 'Compre a Granel', description: 'Comprar a granel reduz embalagens desnecessárias e permite comprar apenas o que precisa, evitando desperdícios.', icon: '🛒' },
  { id: 4, title: 'Escolha Produtos Duráveis', description: 'Investir em produtos de qualidade que duram mais tempo é mais sustentável do que comprar barato e descartar.', icon: '🔨' },
  { id: 5, title: 'Aproveite Promoções Sustentáveis', description: 'Fique atento às promoções de produtos eco-friendly no DomPlace. Descontos verdes ajudam você e o planeta!', icon: '💰' },
]

const activeChallenge = {
  title: 'Desafio Eco',
  description: 'Compre 5 produtos sustentáveis este mês e ganhe o badge "Guardião Verde" + 200 pontos de fidelidade.',
  progress: 3,
  total: 5,
  reward: 'Badge Guardião Verde + 200 pts',
  deadline: '30 de Junho, 2024',
}

/* ═══════════════════ Animated Counter Hook ═══════════════════ */

function useAnimatedCounter(target: number, duration = 1600) {
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

/* ═══════════════════ 1. Impact Summary Cards ═══════════════════ */

function ImpactSummaryCards() {
  const counters = [
    useAnimatedCounter(impactSummaryCards[0].value),
    useAnimatedCounter(impactSummaryCards[1].value),
    useAnimatedCounter(impactSummaryCards[2].value),
    useAnimatedCounter(impactSummaryCards[3].value),
  ]

  return (
    <div className="r40-impact-cards grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {impactSummaryCards.map((card, i) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.id}
            className="r40-impact-card group"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 180, damping: 16, delay: i * 0.09 }}
          >
            <Card className="overflow-hidden border border-border/60">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div
                    className="r40-card-icon flex items-center justify-center h-10 w-10 rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: card.bgColor }}
                  >
                    <Icon className="h-5 w-5" style={{ color: card.color }} />
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-extrabold" style={{ color: card.color }}>
                      {counters[i].toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground ml-0.5">{card.unit}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium leading-tight">{card.label}</span>
                  <span className="text-[9px] sm:text-[10px] font-semibold leading-tight" style={{ color: card.color }}>
                    {card.equivalent}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ═══════════════ 2. Monthly Progress Chart (SVG) ═══════════════ */

function MonthlyProgressChart() {
  const maxScore = Math.max(...monthlyImpactData.map((d) => d.score), 1)
  const currentMonthIdx = monthlyImpactData.length - 1
  const barWidth = 36
  const gap = (365 - 45 - barWidth * monthlyImpactData.length) / (monthlyImpactData.length - 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 16, delay: 0.2 }}
    >
      <Card className="overflow-hidden border border-border/60">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Impacto Mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <svg viewBox="0 0 380 180" className="w-full" role="img" aria-label="Gráfico de impacto mensal">
            <defs>
              <linearGradient id="r40-barGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id="r40-barGradHi" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="r40-areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(16,185,129,0.25)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0.02)" />
              </linearGradient>
              <filter id="r40-barGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {[0.25, 0.5, 0.75, 1].map((line) => (
              <line key={`grid-${line}`} x1="45" y1={150 - 120 * line} x2="365" y2={150 - 120 * line} stroke="rgba(148,163,184,0.12)" strokeWidth="0.5" />
            ))}

            {[0, 25, 50, 75].map((val) => (
              <text key={`y-${val}`} x="10" y={150 - (val / 75) * 120 + 3} textAnchor="start" fontSize="8" className="fill-muted-foreground">{val}</text>
            ))}

            {/* Area fill under bars */}
            <motion.path
              d={(() => {
                let path = `M ${45 + barWidth / 2} 150`
                monthlyImpactData.forEach((item, i) => {
                  const x = 45 + i * (barWidth + gap) + barWidth / 2
                  const barH = Math.max(2, (item.score / maxScore) * 120)
                  path += ` L ${x} ${150 - barH}`
                })
                path += ` L ${45 + (monthlyImpactData.length - 1) * (barWidth + gap) + barWidth / 2} 150 Z`
                return path
              })()}
              fill="url(#r40-areaGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
            />

            {monthlyImpactData.map((item, i) => {
              const barH = Math.max(2, (item.score / maxScore) * 120)
              const isCurrent = i === currentMonthIdx
              const x = 45 + i * (barWidth + gap)

              return (
                <g key={item.month}>
                  <motion.rect
                    x={x} y={150} width={barWidth} height={0} rx="5" ry="5"
                    fill={isCurrent ? 'url(#r40-barGradHi)' : 'url(#r40-barGrad)'}
                    animate={{ height: barH, y: 150 - barH }}
                    transition={{ type: 'spring' as const, stiffness: 80, damping: 14, delay: 0.2 + i * 0.08 }}
                  />
                  {isCurrent && (
                    <motion.rect
                      x={x - 3} y={150} width={barWidth + 6} height={0} rx="7" ry="7"
                      fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5"
                      filter="url(#r40-barGlow)"
                      animate={{ height: barH + 6, y: 153 - barH - 6 }}
                      transition={{ type: 'spring' as const, stiffness: 80, damping: 14, delay: 0.2 + i * 0.08 }}
                    />
                  )}
                  <motion.text
                    x={x + barWidth / 2} y={145 - barH} textAnchor="middle"
                    fontSize="9" fontWeight="700"
                    fill={isCurrent ? '#059669' : 'rgba(16,185,129,0.8)'}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  >
                    {item.score}
                  </motion.text>
                  <text
                    x={x + barWidth / 2} y={168} textAnchor="middle"
                    fontSize="10" fontWeight={isCurrent ? '700' : '400'}
                    fill={isCurrent ? '#059669' : 'rgba(100,116,139,0.7)'}
                  >
                    {item.month}
                  </text>
                </g>
              )
            })}

            <text x="4" y="90" transform="rotate(-90, 4, 90)" textAnchor="middle" fontSize="7" fill="rgba(100,116,139,0.6)">Eco Score</text>
          </svg>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Total acumulado: <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {monthlyImpactData.reduce((a, b) => a + b.score, 0)} pontos
            </span> em 6 meses
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ═══════════════════ 3. Eco Score Ring ═══════════════════════ */

function EcoScoreRing() {
  const [animatedScore, setAnimatedScore] = useState(0)
  const hasAnimated = useRef(false)
  const { current, previous, tiers } = ecoScoreData
  const currentTier = tiers.find((t) => current >= t.min && current <= t.max) || tiers[0]
  const nextTier = tiers.find((t) => t.min > current) || null

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true
    let start = 0
    const step = current / 90
    const timer = setInterval(() => {
      start += step
      if (start >= current) { setAnimatedScore(current); clearInterval(timer) }
      else setAnimatedScore(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [current])

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const progressOffset = circumference - (animatedScore / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 16, delay: 0.3 }}
    >
      <Card className="overflow-hidden border border-border/60">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-500" />
              Eco Score
            </h3>

            {/* Score Ring */}
            <div className="r40-score-ring relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
              <svg className="absolute inset-0" viewBox="0 0 180 180">
                <defs>
                  <linearGradient id="r40-ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <filter id="r40-ringGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="10" />
                <motion.circle
                  cx="90" cy="90" r={radius} fill="none" stroke="url(#r40-ringGrad)"
                  strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference}
                  filter="url(#r40-ringGlow)"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: progressOffset }}
                  transition={{ duration: 1.8, ease: 'easeOut', delay: 0.4 }}
                  transform="rotate(-90, 90, 90)"
                />
                {/* Tick marks */}
                {Array.from({ length: 20 }).map((_, i) => {
                  const angle = (i / 20) * 2 * Math.PI - Math.PI / 2
                  const innerR = radius + 8
                  const outerR = radius + (i % 5 === 0 ? 16 : 12)
                  return (
                    <line
                      key={i}
                      x1={90 + innerR * Math.cos(angle)} y1={90 + innerR * Math.sin(angle)}
                      x2={90 + outerR * Math.cos(angle)} y2={90 + outerR * Math.sin(angle)}
                      stroke="rgba(148,163,184,0.2)"
                      strokeWidth={i % 5 === 0 ? 1.5 : 0.75}
                    />
                  )
                })}
              </svg>

              <div className="relative z-10 flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-extrabold" style={{ color: currentTier.color }}>
                  {animatedScore}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">de 100</span>
                <motion.div
                  className="mt-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: currentTier.color }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.8 }}
                >
                  <span>{currentTier.icon}</span>
                  <span>{currentTier.name}</span>
                </motion.div>
              </div>
            </div>

            {/* Improvement indicator */}
            <div className="r40-score-change flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
              <Sparkles className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                +{current - previous} pontos este mês
              </span>
            </div>

            {/* Tier progression */}
            <div className="w-full mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-muted-foreground font-medium">
                  Próximo: {nextTier ? nextTier.name : 'Nível máximo!'}
                </span>
                {nextTier && (
                  <span className="text-[10px] font-bold" style={{ color: nextTier.color }}>
                    {nextTier.icon} {nextTier.min}
                  </span>
                )}
              </div>
              <Progress
                value={nextTier ? ((current - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100}
                className="h-2"
              />
            </div>

            {/* Tier badges */}
            <div className="r40-tier-badges flex flex-wrap items-center justify-center gap-1.5 mt-1">
              {tiers.map((tier, i) => {
                const isCurrent = tier.name === currentTier.name
                const isPast = current > tier.max
                return (
                  <motion.div
                    key={tier.name}
                    className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all"
                    style={{
                      backgroundColor: isCurrent ? `${tier.color}20` : 'rgba(148,163,184,0.08)',
                      color: isPast || isCurrent ? tier.color : 'rgba(148,163,184,0.5)',
                      border: isCurrent ? `1px solid ${tier.color}40` : '1px solid transparent',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: 0.6 + i * 0.06 }}
                  >
                    <span>{tier.icon}</span>
                    <span>{tier.name}</span>
                    {isCurrent && (
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: tier.color }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ═════════════════ 4. Green Product Tracker ═════════════════════ */

function GreenProductTracker() {
  const [expanded, setExpanded] = useState(false)
  const visibleCount = expanded ? greenProducts.length : 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 16, delay: 0.35 }}
    >
      <Card className="overflow-hidden border border-border/60">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-500" />
              Produtos Verdes
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-medium">
              {greenProducts.length} itens
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {greenProducts.slice(0, visibleCount).map((product, i) => (
                <motion.div
                  key={product.id}
                  className="r40-product-item group flex items-center gap-3 p-2.5 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ type: 'spring' as const, stiffness: 200, damping: 22, delay: i * 0.06 }}
                  layout
                >
                  <div className="r40-leaf-badge relative flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
                    <motion.div
                      animate={{ rotate: [0, 6, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                    >
                      <Leaf className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                    {product.ecoCertified && (
                      <div className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Star className="h-2 w-2 text-white" fill="white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground">{product.store} · {product.date}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="r40-impact-badge text-[10px] font-bold shrink-0"
                    style={{
                      color: product.impactType === 'co2' ? '#10b981' : '#14b8a6',
                      backgroundColor: product.impactType === 'co2' ? 'rgba(16,185,129,0.1)' : 'rgba(20,184,166,0.1)',
                    }}
                  >
                    {product.impact}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {greenProducts.length > 3 && (
            <motion.div className="mt-3 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <motion.div whileTap={{ scale: 0.96 }}>
                <Button
                  variant="ghost" size="sm"
                  className="r40-toggle-btn text-xs gap-1 text-emerald-600 dark:text-emerald-400"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <>Ver menos <ChevronLeft className="h-3.5 w-3.5" /></> : <>Ver mais ({greenProducts.length - 3}) <ChevronRight className="h-3.5 w-3.5" /></>}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ═════════════════ 5. Community Leaderboard ════════════════════ */

function CommunityLeaderboard() {
  const medalColors = ['rgba(255,215,0,0.9)', 'rgba(192,192,192,0.9)', 'rgba(205,127,50,0.9)']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 16, delay: 0.4 }}
    >
      <Card className="overflow-hidden border border-border/60">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Medal className="h-4 w-4 text-emerald-500" />
              Classificação
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-medium flex items-center gap-1">
              <Users className="h-3 w-3" /> Comunidade
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-2">
            {leaderboardData.map((user, i) => (
              <motion.div
                key={user.rank}
                className={`r40-leaderboard-item flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                  user.isCurrentUser
                    ? 'r40-leaderboard-me bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-secondary/20 hover:bg-secondary/40'
                }`}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring' as const, stiffness: 160, damping: 18, delay: 0.45 + i * 0.07 }}
              >
                <div className="r40-rank-badge flex items-center justify-center h-8 w-8 rounded-lg shrink-0">
                  {user.rank <= 3 ? (
                    <motion.div
                      className="flex items-center justify-center h-8 w-8 rounded-full"
                      style={{ backgroundColor: medalColors[user.rank - 1], boxShadow: `0 2px 10px ${medalColors[user.rank - 1]}` }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                    >
                      <span className="text-xs font-extrabold text-white">{user.rank}</span>
                    </motion.div>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">#{user.rank}</span>
                  )}
                </div>
                <span className="text-xl shrink-0">{user.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${user.isCurrentUser ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
                    {user.name}
                    {user.isCurrentUser && <ChevronRight className="inline h-3 w-3 ml-0.5 text-emerald-500" />}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-medium">{user.points.toLocaleString('pt-BR')} pts</span>
                    <span className="text-[10px] text-orange-500 font-semibold flex items-center gap-0.5">
                      <Flame className="h-2.5 w-2.5" />{user.streak}d
                    </span>
                  </div>
                </div>
                {user.rank <= 3 && (
                  <motion.span
                    className="text-lg shrink-0"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                  >
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div className="mt-4 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button variant="outline" size="sm" className="r40-see-all-btn text-xs gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40">
                Ver classificação completa <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ═════════════════ 6. Achievement Badges ══════════════════════ */

function AchievementBadges() {
  const unlockedCount = ecoAchievements.filter((a) => a.unlocked).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 16, delay: 0.45 }}
    >
      <Card className="overflow-hidden border border-border/60">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Conquistas
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-medium">
              {unlockedCount}/{ecoAchievements.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="r40-achievements-grid grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {ecoAchievements.map((achievement, i) => (
              <motion.div
                key={achievement.id}
                className={`r40-achievement-item relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
                  achievement.unlocked
                    ? 'r40-achievement-unlocked border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-border bg-muted/30 opacity-50'
                }`}
                initial={{ opacity: 0, scale: 0.7, y: 14 }}
                animate={{ opacity: achievement.unlocked ? 1 : 0.5, scale: 1, y: 0 }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: i * 0.06 }}
              >
                {achievement.unlocked && (
                  <motion.div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                    />
                  </motion.div>
                )}
                <div className={`relative text-2xl ${!achievement.unlocked ? 'grayscale' : ''}`}>
                  {achievement.unlocked ? achievement.icon : <Lock className="h-6 w-6 text-muted-foreground" />}
                </div>
                <span className={`text-[9px] sm:text-[10px] font-semibold text-center leading-tight ${
                  achievement.unlocked ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'
                }`}>
                  {achievement.name}
                </span>
                {!achievement.unlocked && achievement.progress < 100 && (
                  <div className="w-full mt-1">
                    <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-emerald-500/60"
                        initial={{ width: '0%' }}
                        animate={{ width: `${achievement.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + i * 0.05 }}
                      />
                    </div>
                    <span className="text-[8px] text-muted-foreground font-medium mt-0.5 block text-center">{achievement.progress}%</span>
                  </div>
                )}
                {achievement.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 15, delay: 0.5 + i * 0.06 }}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center"
                  >
                    <span className="text-[8px] text-white">✓</span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ═══════════════════ 7. Tips Carousel ═════════════════════════ */

function TipsCarousel() {
  const [currentTip, setCurrentTip] = useState(0)
  const [direction, setDirection] = useState(1)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goToTip = useCallback((index: number) => {
    setDirection(index > currentTip ? 1 : -1)
    setCurrentTip(index)
  }, [currentTip])

  const nextTip = useCallback(() => {
    setDirection(1)
    setCurrentTip((prev) => (prev + 1) % ecoTips.length)
  }, [])

  const prevTip = useCallback(() => {
    setDirection(-1)
    setCurrentTip((prev) => (prev - 1 + ecoTips.length) % ecoTips.length)
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(nextTip, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [nextTip])

  const tip = ecoTips[currentTip]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 16, delay: 0.5 }}
    >
      <Card className="overflow-hidden border border-border/60">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Dicas Verdes
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-medium">
              {currentTip + 1}/{ecoTips.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="r40-tip-carousel relative min-h-[120px] overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-800/30">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={tip.id}
                custom={direction}
                className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-5 text-center gap-2"
                initial={{ opacity: 0, x: direction * 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 80 }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 24 }}
              >
                <motion.span
                  className="text-3xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {tip.icon}
                </motion.span>
                <h4 className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200">{tip.title}</h4>
                <p className="text-[10px] sm:text-xs text-emerald-700/80 dark:text-emerald-300/80 leading-relaxed max-w-md">{tip.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              {ecoTips.map((_, i) => (
                <button
                  key={i}
                  className={`r40-dot-indicator h-2 rounded-full transition-all duration-300 ${
                    i === currentTip ? 'w-6 bg-emerald-500' : 'w-2 bg-emerald-200 dark:bg-emerald-800/40 hover:bg-emerald-300 dark:hover:bg-emerald-700/40'
                  }`}
                  onClick={() => goToTip(i)}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-emerald-600" onClick={prevTip}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-emerald-600" onClick={nextTip}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ════════════════════ 8. Challenge Card ═════════════════════════ */

function ChallengeCard() {
  const [challengeAccepted, setChallengeAccepted] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const progressPercent = (activeChallenge.progress / activeChallenge.total) * 100

  const celebrationParticles = useMemo(
    () => Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40,
      color: ['#10b981', '#22c55e', '#14b8a6', '#84cc16', '#fbbf24', '#06b6d4'][i % 6],
      delay: Math.random() * 0.5,
      size: 4 + Math.random() * 5,
      drift: (Math.random() - 0.5) * 80,
    })),
    []
  )

  const handleAccept = () => {
    setChallengeAccepted(true)
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 1800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 140, damping: 16, delay: 0.55 }}
    >
      <div className="r40-challenge-card relative overflow-hidden rounded-xl">
        <div className="r40-challenge-border-glow absolute inset-0 rounded-xl" />
        <Card className="relative overflow-hidden border-0 shadow-none">
          <CardContent className="p-4 sm:p-5">
            {showCelebration && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {celebrationParticles.map((p) => (
                  <motion.div
                    key={p.id}
                    className="absolute rounded-sm"
                    style={{ width: p.size, height: p.size * 0.5, backgroundColor: p.color, left: `${p.x}%`, top: '35%' }}
                    initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                    animate={{ y: 90, opacity: 0, x: p.drift, rotate: 360, scale: 0.3 }}
                    transition={{ duration: 1.4, delay: p.delay, ease: 'easeOut' }}
                  />
                ))}
              </div>
            )}

            <div className="relative z-10 flex items-start gap-3">
              <motion.div
                className="r40-challenge-icon flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shrink-0"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Target className="h-5 w-5 text-white" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  {activeChallenge.title}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{activeChallenge.description}</p>

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-muted-foreground font-medium">Progresso</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {activeChallenge.progress}/{activeChallenge.total} produtos
                    </span>
                  </div>
                  <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ type: 'spring' as const, stiffness: 100, damping: 14, delay: 0.7 }}
                    />
                    <motion.div
                      className="absolute inset-y-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                      style={{ width: '40%' }}
                      animate={{ left: ['-40%', '150%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </div>

                <div className="mt-2.5 text-[10px]">
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">🎁 {activeChallenge.reward}</span>
                </div>
                <div className="mt-1 text-[9px] text-muted-foreground flex items-center gap-1">
                  <span>⏰</span><span>Prazo: {activeChallenge.deadline}</span>
                </div>

                <AnimatePresence mode="wait">
                  {!challengeAccepted ? (
                    <motion.div key="accept-wrapper" className="mt-3" whileTap={{ scale: 0.97 }}>
                      <Button
                        size="sm"
                        className="r40-accept-btn w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-semibold"
                        onClick={handleAccept}
                      >
                        Aceitar desafio
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="accepted-state"
                      className="mt-3 w-full h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 gap-1.5"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Desafio aceito!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

/* ═════════════════ Main Component ═══════════════════════════════ */

export function EcoImpactDashboard() {
  return (
    <section className="r40-eco-dashboard">
      {/* Header Banner */}
      <motion.div
        className="r40-dashboard-header relative rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 140, damping: 18 }}
      >
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 sm:p-6 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-white/8" />
          <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-white/5" />

          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none text-lg"
              style={{ left: `${20 + i * 30}%`, bottom: '20%' }}
              animate={{
                y: [0, -12, 0],
                x: [0, i % 2 === 0 ? 8 : -8, 0],
                rotate: [0, i % 2 === 0 ? 15 : -15, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
            >
              🌿
            </motion.div>
          ))}

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Leaf className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Impacto Ambiental</h2>
                <p className="text-[11px] sm:text-xs text-white/70 mt-0.5">
                  Suas escolhas sustentáveis fazem a diferença no planeta
                </p>
              </div>
            </div>
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShoppingCart className="h-3.5 w-3.5 text-white/90" />
              <span className="text-[10px] font-semibold text-white/90">{greenProducts.length} compras verdes</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content Sections */}
      <div className="mt-5 space-y-5">
        {/* 1. Impact Summary Cards */}
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" /> Resumo de Impacto
          </h3>
          <ImpactSummaryCards />
        </div>

        {/* 2 & 3: Score Ring + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <EcoScoreRing />
          <MonthlyProgressChart />
        </div>

        {/* 4. Green Products */}
        <GreenProductTracker />

        {/* 5 & 6: Leaderboard + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CommunityLeaderboard />
          <AchievementBadges />
        </div>

        {/* 7. Tips Carousel */}
        <TipsCarousel />

        {/* 8. Challenge Card */}
        <ChallengeCard />
      </div>

      {/* Inline Styles */}
      <style>{`
        .r40-eco-dashboard { font-family: inherit; }
        .r40-impact-card:hover { transform: translateY(-2px); transition: transform 0.25s ease; }
        .r40-impact-card:hover .r40-card-icon { box-shadow: 0 4px 16px rgba(16,185,129,0.15); }
        .r40-score-ring:hover { filter: brightness(1.02); transition: filter 0.3s ease; }
        .r40-product-item:hover { box-shadow: 0 2px 12px rgba(16,185,129,0.08); transition: box-shadow 0.2s ease; }
        .r40-achievement-item.r40-achievement-unlocked:hover {
          transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16,185,129,0.18); transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .r40-leaderboard-me { box-shadow: 0 0 0 1px rgba(16,185,129,0.25); }
        .r40-leaderboard-item:hover { transform: translateX(2px); transition: transform 0.2s ease; }
        .r40-challenge-card { border: 1px solid rgba(16,185,129,0.25); border-radius: 12px; }
        .r40-challenge-border-glow {
          background: linear-gradient(90deg, rgba(16,185,129,0.3), rgba(20,184,166,0.5), rgba(6,182,212,0.3), rgba(16,185,129,0.3));
          background-size: 300% 100%; animation: r40-glow-shift 4s ease-in-out infinite; z-index: 0; border-radius: 12px;
        }
        .r40-challenge-card > * { border-radius: 11px; }
        .r40-challenge-icon { box-shadow: 0 4px 16px rgba(16,185,129,0.3); }
        .r40-accept-btn:hover { box-shadow: 0 4px 20px rgba(16,185,129,0.35); transition: box-shadow 0.25s ease; }
        .r40-dot-indicator { cursor: pointer; border: none; padding: 0; transition: all 0.3s ease; }
        @keyframes r40-glow-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  )
}
