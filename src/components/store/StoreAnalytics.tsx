'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Star,
  Store,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Flame,
  Trophy,
  Medal,
  Award,
  RefreshCw,
  Sun,
  Moon,
  CloudSun,
  Zap,
} from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '90d'

interface RevenueDataPoint {
  label: string
  value: number
  previous?: number
}

interface TopStore {
  rank: number
  name: string
  emoji: string
  revenue: number
  percentage: number
}

interface CategoryData {
  name: string
  value: number
  color: string
  products: number
}

interface HeatmapCell {
  day: string
  slot: string
  count: number
}

interface OverviewCardData {
  icon: React.ReactNode
  value: number
  formattedValue: string
  label: string
  trend: number
  trendLabel: string
  sparkline: number[]
  color: string
}

// ─── Mock Data Generators ─────────────────────────────────────────────────────

function generateRevenueData(period: Period): RevenueDataPoint[] {
  if (period === '7d') {
    return [
      { label: 'Seg', value: 4820, previous: 4350 },
      { label: 'Ter', value: 5340, previous: 5100 },
      { label: 'Qua', value: 3970, previous: 4500 },
      { label: 'Qui', value: 6210, previous: 5800 },
      { label: 'Sex', value: 7890, previous: 7200 },
      { label: 'Sáb', value: 8540, previous: 7900 },
      { label: 'Dom', value: 4120, previous: 3800 },
    ]
  }
  if (period === '30d') {
    return [
      { label: 'Sem 1', value: 32400, previous: 29800 },
      { label: 'Sem 2', value: 35800, previous: 33100 },
      { label: 'Sem 3', value: 41200, previous: 38500 },
      { label: 'Sem 4', value: 38900, previous: 36200 },
    ]
  }
  return [
    { label: 'Mês 1', value: 142000, previous: 128000 },
    { label: 'Mês 2', value: 156000, previous: 139000 },
    { label: 'Mês 3', value: 168000, previous: 151000 },
  ]
}

function generateTopStores(): TopStore[] {
  return [
    { rank: 1, name: 'Mercado Bom Preço', emoji: '🛒', revenue: 12840, percentage: 100 },
    { rank: 2, name: 'Farmácia Vida Saudável', emoji: '💊', revenue: 10250, percentage: 80 },
    { rank: 3, name: 'Açaí do Pará', emoji: '🫐', revenue: 8930, percentage: 70 },
    { rank: 4, name: 'Padaria Pão Quente', emoji: '🥖', revenue: 7650, percentage: 60 },
    { rank: 5, name: 'Pet Shop Amigo Fiel', emoji: '🐾', revenue: 5420, percentage: 42 },
  ]
}

function generateCategoryData(): CategoryData[] {
  return [
    { name: 'Alimentação', value: 35, color: '#22c55e', products: 1240 },
    { name: 'Bebidas', value: 20, color: '#3b82f6', products: 830 },
    { name: 'Limpeza', value: 15, color: '#f59e0b', products: 520 },
    { name: 'Saúde', value: 12, color: '#ef4444', products: 410 },
    { name: 'Pets', value: 10, color: '#a855f7', products: 290 },
    { name: 'Beleza', value: 8, color: '#ec4899', products: 210 },
  ]
}

function generateHeatmapData(): HeatmapCell[] {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  const slots = ['Manhã', 'Tarde', 'Noite', 'Madrugada']
  const baseCounts = [
    [45, 62, 38, 12],
    [52, 58, 42, 15],
    [48, 70, 35, 10],
    [55, 65, 50, 18],
    [60, 78, 55, 22],
    [72, 85, 60, 8],
    [40, 55, 48, 6],
  ]
  const cells: HeatmapCell[] = []
  days.forEach((day, di) => {
    slots.forEach((slot, si) => {
      cells.push({
        day,
        slot,
        count: baseCounts[di][si] + Math.floor(Math.random() * 10 - 5),
      })
    })
  })
  return cells
}

function generateOverviewCards(): OverviewCardData[] {
  return [
    {
      icon: <DollarSign className="h-4 w-4" />,
      value: 40890,
      formattedValue: 'R$ 40.890',
      label: 'Receita Total',
      trend: 12.5,
      trendLabel: 'vs. período anterior',
      sparkline: [32, 38, 35, 42, 48, 45, 51],
      color: '#22c55e',
    },
    {
      icon: <ShoppingCart className="h-4 w-4" />,
      value: 1847,
      formattedValue: '1.847',
      label: 'Total de Pedidos',
      trend: 8.3,
      trendLabel: 'taxa de conclusão 94%',
      sparkline: [140, 155, 148, 170, 185, 178, 195],
      color: '#3b82f6',
    },
    {
      icon: <Star className="h-4 w-4" />,
      value: 4.7,
      formattedValue: '4,7',
      label: 'Avaliação Média',
      trend: 2.1,
      trendLabel: 'vs. mês passado',
      sparkline: [4.4, 4.5, 4.6, 4.5, 4.7, 4.6, 4.7],
      color: '#f59e0b',
    },
    {
      icon: <Store className="h-4 w-4" />,
      value: 68,
      formattedValue: '68',
      label: 'Lojas Ativas',
      trend: 5.9,
      trendLabel: 'novas este mês: 4',
      sparkline: [58, 60, 62, 63, 65, 66, 68],
      color: '#a855f7',
    },
  ]
}

// ─── Format Helpers ───────────────────────────────────────────────────────────

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatCompact = (value: number) =>
  new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(value)

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

// ─── Period Config ─────────────────────────────────────────────────────────────

const periods: { value: Period; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
]

// ─── Heatmap Slot Icons ────────────────────────────────────────────────────────

const slotIcons: Record<string, React.ReactNode> = {
  Manhã: <Sun className="h-3 w-3" />,
  Tarde: <CloudSun className="h-3 w-3" />,
  Noite: <Moon className="h-3 w-3" />,
  Madrugada: <Zap className="h-3 w-3" />,
}

const rankBadges = [Trophy, Medal, Award]

// ─── Mini Sparkline Component ─────────────────────────────────────────────────

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 60
  const h = 24
  const step = w / (data.length - 1)

  const points = data
    .map((v, i) => {
      const x = i * step
      const y = h - ((v - min) / range) * (h - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

// ─── Animated Counter Hook ────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = target * eased
      setCount(Number.isInteger(target) ? Math.round(start) : parseFloat(start.toFixed(1)))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return count
}

// ─── Animated Overview Card (extracted to call useAnimatedCounter at top level) ────

function AnimatedOverviewCard({ card, idx }: { card: OverviewCardData; idx: number }) {
  const animatedValue = useAnimatedCounter(card.value, 1400 + idx * 200)
  const isPositive = card.trend >= 0

  return (
    <motion.div
      key={card.label}
      variants={itemVariants}
      whileHover={{
        y: -3,
        boxShadow: '0 8px 30px -8px rgba(0,0,0,0.12)',
      }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
      className="r36-analytics-card r36-analytics-card-hover relative bg-card rounded-xl border border-border/50 p-4 cursor-default overflow-hidden"
    >
      {/* Accent glow */}
      <div
        className="absolute -top-10 -right-10 h-20 w-20 rounded-full blur-2xl opacity-20"
        style={{ backgroundColor: card.color }}
      />

      {/* Icon */}
      <div
        className="relative h-8 w-8 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: `${card.color}15`, color: card.color }}
      >
        {card.icon}
      </div>

      {/* Value */}
      <motion.div className="relative">
        <p className="text-xl font-bold tracking-tight">
          {card.label === 'Receita Total'
            ? formatBRL(animatedValue)
            : card.label === 'Avaliação Média'
              ? animatedValue.toFixed(1).replace('.', ',')
              : animatedValue.toLocaleString('pt-BR')}
        </p>
      </motion.div>

      {/* Label */}
      <p className="text-xs text-muted-foreground mt-0.5 mb-2">{card.label}</p>

      {/* Trend */}
      <div className="flex items-center gap-1 mb-2">
        {isPositive ? (
          <ArrowUpRight className="h-3 w-3 text-emerald-500" />
        ) : (
          <ArrowDownRight className="h-3 w-3 text-red-500" />
        )}
        <span
          className={`text-xs font-semibold ${
            isPositive ? 'text-emerald-500' : 'text-red-500'
          }`}
        >
          {isPositive ? '+' : ''}
          {card.trend}%
        </span>
        <span className="text-[10px] text-muted-foreground ml-1">{card.trendLabel}</span>
      </div>

      {/* Mini Sparkline */}
      <MiniSparkline data={card.sparkline} color={card.color} />
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function StoreAnalytics() {
  const [activePeriod, setActivePeriod] = useState<Period>('7d')
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [hoveredHeatCell, setHoveredHeatCell] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Fetch analytics data (with cache)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        await cachedFetch('/api/stores')
        if (!cancelled) {
          setIsLoading(false)
          const now = new Date()
          setLastUpdated(
            now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          )
        }
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Derived data
  const revenueData = useMemo(() => generateRevenueData(activePeriod), [activePeriod])
  const topStores = useMemo(() => generateTopStores(), [])
  const categoryData = useMemo(() => generateCategoryData(), [])
  const heatmapData = useMemo(() => generateHeatmapData(), [])
  const overviewCards = useMemo(() => generateOverviewCards(), [])

  const revenueAvg = useMemo(
    () => revenueData.reduce((s, d) => s + d.value, 0) / revenueData.length,
    [revenueData]
  )

  const maxRevenue = useMemo(
    () => Math.max(...revenueData.map(d => d.value)),
    [revenueData]
  )

  const totalCategoryProducts = useMemo(
    () => categoryData.reduce((s, c) => s + c.products, 0),
    [categoryData]
  )

  const heatMax = useMemo(() => Math.max(...heatmapData.map(c => c.count)), [heatmapData])

  // Donut chart calculations
  const donutRadius = 58
  const donutCircumference = 2 * Math.PI * donutRadius

  const donutSegments = useMemo(() => {
    let offset = 0
    return categoryData.map(cat => {
      const segment = (cat.value / 100) * donutCircumference
      const result = { ...cat, dashArray: segment, dashOffset: offset }
      offset += segment
      return result
    })
  }, [categoryData])

  // Period change handler
  const handlePeriodChange = useCallback((period: Period) => {
    setActivePeriod(period)
  }, [])

  // ─── Loading State ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6 p-1">
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.15 }}
            className="h-32 rounded-xl bg-muted/40 animate-pulse"
          />
        ))}
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* ── 1. Header ─────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, 15, 0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <BarChart3 className="h-5 w-5 text-primary" />
          </motion.div>
          <h2 className="text-lg font-bold">Analytics das Lojas</h2>
        </div>

        {/* Period selector pills */}
        <div className="flex items-center gap-1.5 bg-muted/50 rounded-full p-1">
          {periods.map(p => (
            <motion.button
              key={p.value}
              whileTap={{ scale: 0.93 }}
              onClick={() => handlePeriodChange(p.value)}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activePeriod === p.value
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {activePeriod === p.value && (
                <motion.div
                  layoutId="r36-period-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  style={{ zIndex: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{p.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Live Indicator ────────────────────────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        className="flex items-center gap-2"
      >
        <span className="relative flex h-2.5 w-2.5">
          <motion.span
            animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0.2, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
          />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-xs text-muted-foreground">
          Dados atualizados agora · {lastUpdated}
        </span>
      </motion.div>

      {/* ── 2. Overview Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {overviewCards.map((card, idx) => (
          <AnimatedOverviewCard key={card.label} card={card} idx={idx} />
        ))}
      </div>

      {/* ── 3. Revenue Chart ──────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="r36-analytics-card bg-card rounded-xl border border-border/50 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Receita por {activePeriod === '7d' ? 'Dia' : 'Período'}</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            Média: {formatBRL(revenueAvg)}
          </span>
        </div>

        {/* SVG Bar Chart */}
        <div className="relative">
          <svg
            viewBox="0 0 500 200"
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Y-axis grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(fraction => {
              const y = 180 - fraction * 160
              return (
                <g key={fraction}>
                  <line
                    x1="40"
                    y1={y}
                    x2="490"
                    y2={y}
                    stroke="rgba(0,0,0,0.06)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="36"
                    y={y + 4}
                    textAnchor="end"
                    className="fill-muted-foreground text-[8px]"
                    fontSize="9"
                  >
                    {formatCompact(Math.round(maxRevenue * fraction))}
                  </text>
                </g>
              )
            })}

            {/* Bars */}
            {revenueData.map((d, i) => {
              const barWidth = Math.max(20, (440 / revenueData.length) - 8)
              const gap = (440 - barWidth * revenueData.length) / (revenueData.length - 1)
              const x = 42 + i * (barWidth + gap)
              const barHeight = (d.value / maxRevenue) * 160
              const y = 180 - barHeight
              const isPositive = d.previous ? d.value >= d.previous : true

              return (
                <g key={d.label}>
                  {/* Bar */}
                  <motion.rect
                    x={x}
                    y={180}
                    width={barWidth}
                    initial={{ height: 0 }}
                    animate={{ y, height: barHeight }}
                    transition={{
                      type: 'spring' as const,
                      stiffness: 120,
                      damping: 18,
                      delay: i * 0.08,
                    }}
                    rx="4"
                    className="r36-revenue-bar r36-revenue-bar-grow cursor-pointer"
                    fill={isPositive ? 'url(#r36-bar-gradient-green)' : 'url(#r36-bar-gradient-red)'}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />

                  {/* X-axis label */}
                  <text
                    x={x + barWidth / 2}
                    y="196"
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize="10"
                  >
                    {d.label}
                  </text>
                </g>
              )
            })}

            {/* Average line */}
            <motion.line
              x1="40"
              y1={180 - (revenueAvg / maxRevenue) * 160}
              x2="490"
              y2={180 - (revenueAvg / maxRevenue) * 160}
              stroke="rgba(168,85,247,0.6)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.6 }}
            />

            {/* Gradient definitions */}
            <defs>
              <linearGradient id="r36-bar-gradient-green" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient id="r36-bar-gradient-red" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>

          {/* Tooltip on hover */}
          <AnimatePresence>
            {hoveredBar !== null && revenueData[hoveredBar] && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
                className="absolute top-2 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border border-border/60 rounded-lg px-3 py-2 shadow-lg text-xs z-10"
                style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.15)' }}
              >
                <p className="font-semibold">{revenueData[hoveredBar].label}</p>
                <p className="text-primary font-bold">{formatBRL(revenueData[hoveredBar].value)}</p>
                {revenueData[hoveredBar].previous && (
                  <p className="text-muted-foreground text-[10px] mt-0.5">
                    Anterior: {formatBRL(revenueData[hoveredBar].previous!)}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── 4. Top Stores Ranking ──────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="r36-analytics-card bg-card rounded-xl border border-border/50 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-semibold">Top 5 Lojas por Receita</h3>
        </div>

        <div className="space-y-3">
          {topStores.map((store, idx) => {
            const BadgeIcon = idx < 3 ? rankBadges[idx] : null
            const badgeColors = ['#fbbf24', '#94a3b8', '#d97706']

            return (
              <motion.div
                key={store.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: 'spring' as const,
                  stiffness: 300,
                  damping: 22,
                  delay: idx * 0.1,
                }}
                className="flex items-center gap-3"
              >
                {/* Rank badge */}
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 r36-ranking-badge ${
                    idx < 3 ? 'text-white font-bold text-xs' : 'bg-muted text-muted-foreground text-xs font-semibold'
                  }`}
                  style={
                    idx < 3
                      ? { backgroundColor: badgeColors[idx] }
                      : undefined
                  }
                >
                  {BadgeIcon ? <BadgeIcon className="h-3.5 w-3.5" /> : store.rank}
                </div>

                {/* Store info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{store.emoji}</span>
                    <span className="text-xs font-medium truncate">{store.name}</span>
                  </div>

                  {/* Bar background */}
                  <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full r36-ranking-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${store.percentage}%` }}
                      transition={{
                        type: 'spring' as const,
                        stiffness: 100,
                        damping: 15,
                        delay: 0.3 + idx * 0.1,
                      }}
                      style={{
                        background: `linear-gradient(90deg, #22c55e, #16a34a)`,
                      }}
                    />
                  </div>
                </div>

                {/* Revenue value */}
                <span className="text-xs font-bold text-foreground shrink-0">
                  {formatBRL(store.revenue)}
                </span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ── 5. Category Performance (Donut Chart) ────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="r36-analytics-card bg-card rounded-xl border border-border/50 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Performance por Categoria</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut SVG */}
          <div className="relative shrink-0">
            <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
              {/* Background track */}
              <circle
                cx="80"
                cy="80"
                r={donutRadius}
                fill="none"
                stroke="rgba(0,0,0,0.04)"
                strokeWidth="16"
              />

              {/* Segments */}
              {donutSegments.map((seg, idx) => (
                <motion.circle
                  key={seg.name}
                  cx="80"
                  cy="80"
                  r={donutRadius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="16"
                  strokeLinecap="round"
                  className="r36-donut-segment"
                  strokeDasharray={`${seg.dashArray} ${donutCircumference - seg.dashArray}`}
                  strokeDashoffset={-seg.dashOffset}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    type: 'spring' as const,
                    stiffness: 200,
                    damping: 20,
                    delay: 0.2 + idx * 0.1,
                  }}
                />
              ))}
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center r36-donut-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                className="text-lg font-bold"
              >
                {totalCategoryProducts.toLocaleString('pt-BR')}
              </motion.span>
              <span className="text-[10px] text-muted-foreground">produtos</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2.5 w-full">
            {categoryData.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.06 }}
                className="flex items-center gap-2"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate">{cat.name}</span>
                    <span className="text-xs font-bold ml-1">{cat.value}%</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {cat.products} produtos
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── 6. Orders Heatmap ─────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="r36-analytics-card bg-card rounded-xl border border-border/50 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Mapa de Calor — Pedidos</h3>
        </div>

        {/* Column headers (time slots) */}
        <div className="grid gap-1" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
          {/* Empty corner */}
          <div />

          {/* Day headers */}
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="text-center text-[10px] font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Rows */}
          {['Manhã', 'Tarde', 'Noite', 'Madrugada'].map(slot => {
            const slotIcon = slotIcons[slot]
            return (
              <motion.div
                key={slot}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="contents">
                  {/* Slot label */}
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pr-2">
                    {slotIcon}
                    <span className="hidden sm:inline">{slot}</span>
                  </div>

                  {/* Cells */}
                  {heatmapData
                    .filter(c => c.slot === slot)
                    .map(cell => {
                      const intensity = cell.count / heatMax
                      const cellKey = `${cell.day}-${cell.slot}`
                      const isHot = intensity > 0.7

                      return (
                        <motion.div
                          key={cellKey}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            type: 'spring' as const,
                            stiffness: 400,
                            damping: 25,
                            delay: 0.05 + Math.random() * 0.15,
                          }}
                          className="relative"
                          onMouseEnter={() => setHoveredHeatCell(cellKey)}
                          onMouseLeave={() => setHoveredHeatCell(null)}
                        >
                          <div
                            className={`r36-heatmap-cell ${isHot ? 'r36-heatmap-hot' : ''} h-9 rounded-md cursor-default transition-transform hover:scale-110 flex items-center justify-center`}
                            style={{
                              backgroundColor:
                                intensity > 0.8
                                  ? 'rgba(239,68,68,0.85)'
                                  : intensity > 0.6
                                    ? 'rgba(249,115,22,0.7)'
                                    : intensity > 0.4
                                      ? 'rgba(234,179,8,0.5)'
                                      : intensity > 0.2
                                        ? 'rgba(34,197,94,0.35)'
                                        : 'rgba(34,197,94,0.12)',
                            }}
                          >
                            <span className="text-[9px] font-semibold text-white/90">
                              {cell.count}
                            </span>
                          </div>

                          {/* Heatmap tooltip */}
                          <AnimatePresence>
                            {hoveredHeatCell === cellKey && (
                              <motion.div
                                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
                                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border border-border/60 rounded-md px-2 py-1 text-[10px] whitespace-nowrap z-10"
                                style={{ boxShadow: '0 4px 12px -2px rgba(0,0,0,0.12)' }}
                              >
                                {cell.day} · {cell.slot}: <strong>{cell.count} pedidos</strong>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Heatmap legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[10px] text-muted-foreground">Menos</span>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map(level => (
            <div
              key={level}
              className="h-3 w-3 rounded-sm"
              style={{
                backgroundColor:
                  level > 0.8
                    ? 'rgba(239,68,68,0.85)'
                    : level > 0.6
                      ? 'rgba(249,115,22,0.7)'
                      : level > 0.4
                        ? 'rgba(234,179,8,0.5)'
                        : level > 0.2
                          ? 'rgba(34,197,94,0.35)'
                          : 'rgba(34,197,94,0.12)',
              }}
            />
          ))}
          <span className="text-[10px] text-muted-foreground">Mais</span>
        </div>
      </motion.div>

      {/* ── 7. Performance Alerts ─────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="r36-analytics-card bg-card rounded-xl border border-border/50 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Alertas de Performance</h3>
        </div>

        <div className="space-y-2.5">
          {/* Positive alert */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 22, delay: 0.1 }}
            className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800/40 px-4 py-3"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
              className="h-8 w-8 rounded-full bg-emerald-500/15 flex items-center justify-center"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Vendas acima da média!
              </p>
              <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/60 mt-0.5">
                A receita está 12,5% acima da média do período anterior. Excelente desempenho!
              </p>
            </div>
          </motion.div>

          {/* Warning alert */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 22, delay: 0.2 }}
            className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/40 px-4 py-3"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}
              className="h-8 w-8 rounded-full bg-amber-500/15 flex items-center justify-center"
            >
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </motion.div>
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Atenção: queda nas vendas
              </p>
              <p className="text-[10px] text-amber-600/70 dark:text-amber-500/60 mt-0.5">
                Queda de 11,8% na quarta-feira. Considere ativar promoções nesse dia.
              </p>
            </div>
          </motion.div>

          {/* Info alert */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 22, delay: 0.3 }}
            className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800/40 px-4 py-3"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }}
              className="h-8 w-8 rounded-full bg-blue-500/15 flex items-center justify-center"
            >
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <div>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                4 novas lojas cadastradas
              </p>
              <p className="text-[10px] text-blue-600/70 dark:text-blue-500/60 mt-0.5">
                Crescimento contínuo na plataforma com novas adesões este mês.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Footer refresh ───────────────────────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        className="flex items-center justify-center gap-2 py-2"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsLoading(true)
            cachedFetch('/api/stores').then(() => setIsLoading(false)).catch(() => setIsLoading(false))
          }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border/40 hover:border-border/60"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' as const }}
          >
            <RefreshCw className="h-3 w-3" />
          </motion.div>
          Atualizar dados
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
