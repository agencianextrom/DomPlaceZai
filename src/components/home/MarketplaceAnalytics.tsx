'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Store, ShoppingCart, DollarSign, TrendingUp,
  ArrowUpRight, ArrowDownRight, Download, Share2, BarChart3, Users,
  Clock, Activity, Star, Flame, Trophy, Zap, Eye,
  Calendar, Layers, ShoppingBag,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Period = 'week' | 'month' | 'year'

interface MetricData {
  id: string; label: string; value: number; previousValue: number
  prefix: string; suffix: string; icon: React.ElementType
  gradientFrom: string; gradientTo: string; accentColor: string
}

interface OrderTrendPoint { day: string; orders: number; revenue: number }

interface CategorySales {
  id: string; name: string; emoji: string; sales: number
  percentage: number; color: string
}

interface StoreLeader {
  rank: number; name: string; emoji: string; orders: number
  revenue: number; rating: number; growth: number
}

interface HeatmapCell { day: number; hour: number; value: number }

interface ActivityItem {
  id: string; type: 'order' | 'store' | 'product' | 'review' | 'milestone'
  text: string; time: string; emoji: string
}

/* ─── Mock Data ─── */

const METRICS_BY_PERIOD: Record<Period, MetricData[]> = {
  week: [
    { id: 'products', label: 'Total Products', value: 12847, previousValue: 11420, prefix: '', suffix: '', icon: Package, gradientFrom: '#3b82f6', gradientTo: '#6366f1', accentColor: '#4f46e5' },
    { id: 'stores', label: 'Active Stores', value: 843, previousValue: 798, prefix: '', suffix: '', icon: Store, gradientFrom: '#10b981', gradientTo: '#06b6d4', accentColor: '#059669' },
    { id: 'orders', label: 'Orders Today', value: 2341, previousValue: 1987, prefix: '', suffix: '', icon: ShoppingCart, gradientFrom: '#f59e0b', gradientTo: '#ef4444', accentColor: '#d97706' },
    { id: 'revenue', label: 'Revenue', value: 187420, previousValue: 156890, prefix: 'R$', suffix: '', icon: DollarSign, gradientFrom: '#ec4899', gradientTo: '#8b5cf6', accentColor: '#db2777' },
  ],
  month: [
    { id: 'products', label: 'Total Products', value: 28340, previousValue: 24560, prefix: '', suffix: '', icon: Package, gradientFrom: '#3b82f6', gradientTo: '#6366f1', accentColor: '#4f46e5' },
    { id: 'stores', label: 'Active Stores', value: 1024, previousValue: 912, prefix: '', suffix: '', icon: Store, gradientFrom: '#10b981', gradientTo: '#06b6d4', accentColor: '#059669' },
    { id: 'orders', label: 'Orders Today', value: 5680, previousValue: 4820, prefix: '', suffix: '', icon: ShoppingCart, gradientFrom: '#f59e0b', gradientTo: '#ef4444', accentColor: '#d97706' },
    { id: 'revenue', label: 'Revenue', value: 485600, previousValue: 412300, prefix: 'R$', suffix: '', icon: DollarSign, gradientFrom: '#ec4899', gradientTo: '#8b5cf6', accentColor: '#db2777' },
  ],
  year: [
    { id: 'products', label: 'Total Products', value: 156820, previousValue: 98430, prefix: '', suffix: '', icon: Package, gradientFrom: '#3b82f6', gradientTo: '#6366f1', accentColor: '#4f46e5' },
    { id: 'stores', label: 'Active Stores', value: 4521, previousValue: 2890, prefix: '', suffix: '', icon: Store, gradientFrom: '#10b981', gradientTo: '#06b6d4', accentColor: '#059669' },
    { id: 'orders', label: 'Orders Today', value: 28450, previousValue: 18920, prefix: '', suffix: '', icon: ShoppingCart, gradientFrom: '#f59e0b', gradientTo: '#ef4444', accentColor: '#d97706' },
    { id: 'revenue', label: 'Revenue', value: 4256000, previousValue: 2890000, prefix: 'R$', suffix: '', icon: DollarSign, gradientFrom: '#ec4899', gradientTo: '#8b5cf6', accentColor: '#db2777' },
  ],
}
const ORDERS_TREND: Record<Period, OrderTrendPoint[]> = {
  week: [
    { day: 'Mon', orders: 320, revenue: 24800 }, { day: 'Tue', orders: 415, revenue: 32100 },
    { day: 'Wed', orders: 380, revenue: 29500 }, { day: 'Thu', orders: 510, revenue: 39800 },
    { day: 'Fri', orders: 620, revenue: 48200 }, { day: 'Sat', orders: 780, revenue: 61000 },
    { day: 'Sun', orders: 490, revenue: 38500 },
  ],
  month: [
    { day: 'Wk1', orders: 1480, revenue: 115000 }, { day: 'Wk2', orders: 1720, revenue: 134000 },
    { day: 'Wk3', orders: 1950, revenue: 152000 }, { day: 'Wk4', orders: 2100, revenue: 164000 },
    { day: 'Wk5', orders: 2380, revenue: 186000 }, { day: 'Wk6', orders: 2050, revenue: 160000 },
    { day: 'Wk7', orders: 2280, revenue: 178000 },
  ],
  year: [
    { day: 'Jan', orders: 1820, revenue: 142000 }, { day: 'Feb', orders: 1640, revenue: 128000 },
    { day: 'Mar', orders: 2100, revenue: 164000 }, { day: 'Apr', orders: 2380, revenue: 186000 },
    { day: 'May', orders: 2650, revenue: 207000 }, { day: 'Jun', orders: 2900, revenue: 226000 },
    { day: 'Jul', orders: 3120, revenue: 243000 },
  ],
}

const TOP_CATEGORIES: CategorySales[] = [
  { id: 'c1', name: 'Groceries', emoji: '🛒', sales: 3420, percentage: 28, color: '#10b981' },
  { id: 'c2', name: 'Electronics', emoji: '📱', sales: 2180, percentage: 18, color: '#3b82f6' },
  { id: 'c3', name: 'Fashion', emoji: '👗', sales: 1860, percentage: 15, color: '#ec4899' },
  { id: 'c4', name: 'Beauty', emoji: '💄', sales: 1420, percentage: 12, color: '#f59e0b' },
  { id: 'c5', name: 'Home & Garden', emoji: '🏡', sales: 1100, percentage: 9, color: '#8b5cf6' },
  { id: 'c6', name: 'Pets', emoji: '🐾', sales: 860, percentage: 7, color: '#06b6d4' },
]

const STORE_LEADERS: StoreLeader[] = [
  { rank: 1, name: 'Pao de Acucar', emoji: '🏪', orders: 1240, revenue: 98200, rating: 4.9, growth: 18.2 },
  { rank: 2, name: 'Extra Supermercados', emoji: '🛍️', orders: 1080, revenue: 85600, rating: 4.8, growth: 14.5 },
  { rank: 3, name: 'Farmacia Drogasil', emoji: '💊', orders: 920, revenue: 72400, rating: 4.7, growth: 12.1 },
  { rank: 4, name: 'Loja do Mecanico', emoji: '🔧', orders: 780, revenue: 61200, rating: 4.6, growth: 8.7 },
  { rank: 5, name: 'Pet Shop Amigo Fiel', emoji: '🐾', orders: 650, revenue: 48900, rating: 4.8, growth: 22.3 },
]

function generateHeatmapData(): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      let base = 0.15
      if (hour >= 10 && hour <= 13) base += 0.35
      else if (hour >= 18 && hour <= 21) base += 0.3
      else if (hour >= 7 && hour <= 9) base += 0.15
      else if (hour >= 0 && hour <= 5) base -= 0.1
      if (day >= 5) base += 0.1
      const noise = (Math.sin(day * 3.7 + hour * 1.3) * 0.5 + 0.5) * 0.15
      cells.push({ day, hour, value: Math.max(0.02, Math.min(1, base + noise - 0.1 + Math.random() * 0.08)) })
    }
  }
  return cells
}
const HEATMAP_DATA = generateHeatmapData()

const SATISFACTION_SCORE = 92

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'order', text: 'New bulk order placed at Pao de Acucar', time: '2 min ago', emoji: '📦' },
  { id: 'a2', type: 'store', text: 'TechWorld opened a new storefront', time: '5 min ago', emoji: '🏪' },
  { id: 'a3', type: 'milestone', text: 'Marketplace hit 15,000 products!', time: '12 min ago', emoji: '🎉' },
  { id: 'a4', type: 'review', text: '500 reviews received this week', time: '18 min ago', emoji: '⭐' },
  { id: 'a5', type: 'product', text: 'Flash sale trending with 1.2k views', time: '25 min ago', emoji: '🔥' },
  { id: 'a6', type: 'order', text: 'Same-day delivery completed for 42 orders', time: '32 min ago', emoji: '🚚' },
]

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const PERIOD_LABELS: Record<Period, string> = {
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
}

/* ─── Animated Counter Hook ─── */

function useAnimatedValue(target: number, duration = 1400, delayMs = 0) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    delayRef.current = setTimeout(() => {
      startRef.current = performance.now()
      function frame(now: number) {
        if (startRef.current === null) return
        const elapsed = now - startRef.current
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(eased * target)
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(frame)
        } else {
          setValue(target)
        }
      }
      rafRef.current = requestAnimationFrame(frame)
    }, delayMs)

    return () => {
      if (delayRef.current) clearTimeout(delayRef.current)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, delayMs])

  return value
}

/* ─── 1. Key Metrics Row ─── */

function MetricCard({ metric, index }: { metric: MetricData; index: number }) {
  const animatedValue = useAnimatedValue(metric.value, 1600, index * 120)
  const changePercent = metric.previousValue > 0
    ? ((metric.value - metric.previousValue) / metric.previousValue) * 100
    : 0
  const isPositive = changePercent >= 0

  const formatValue = (v: number) => {
    if (metric.id === 'revenue') {
      if (v >= 1000000) return `${metric.prefix}${(v / 1000000).toFixed(1)}M`
      if (v >= 1000) return `${metric.prefix}${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`
      return `${metric.prefix}${v.toFixed(0)}`
    }
    if (v >= 10000) return `${(v / 1000).toFixed(1)}k`
    return Math.floor(v).toLocaleString('en-US')
  }

  return (
    <motion.div
      key={metric.id}
      className="r52-analytics-metric-card"
      initial={{ opacity: 0, y: 28, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 160, damping: 18, delay: index * 0.1 }}
    >
      <div className="r52-analytics-metric-inner relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-white/10">
        {/* Animated gradient background */}
        <motion.div
          className="r52-analytics-metric-gradient absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${metric.gradientFrom}, ${metric.gradientTo})`,
          }}
          animate={{ opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
        />

        <div className="relative z-10">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="r52-analytics-metric-icon flex items-center justify-center h-10 w-10 rounded-xl"
              style={{ backgroundColor: `rgba(255,255,255,0.15)` }}
            >
              <metric.icon className="h-5 w-5" style={{ color: metric.accentColor }} />
            </div>
            <motion.div
              className="r52-analytics-growth-indicator flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: isPositive ? '#10b981' : '#ef4444',
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 16, delay: 0.5 + index * 0.1 }}
            >
              {isPositive ? (
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ArrowUpRight className="h-3 w-3" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ArrowDownRight className="h-3 w-3" />
                </motion.div>
              )}
              <span>{isPositive ? '+' : ''}{changePercent.toFixed(1)}%</span>
            </motion.div>
          </div>

          {/* Value */}
          <div className="r52-analytics-metric-value">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: metric.accentColor }}>
              {formatValue(animatedValue)}
            </span>
            {metric.suffix && (
              <span className="text-sm font-medium text-muted-foreground ml-1">{metric.suffix}</span>
            )}
          </div>

          {/* Label */}
          <p className="r52-analytics-metric-label mt-1 text-xs font-medium text-muted-foreground">
            {metric.label}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function KeyMetricsRow({ period }: { period: Period }) {
  const metrics = METRICS_BY_PERIOD[period]
  return (
    <div className="r52-analytics-metrics-grid grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((metric, i) => (
        <MetricCard key={metric.id} metric={metric} index={i} />
      ))}
    </div>
  )
}

/* ─── 2. Orders Trend Chart ─── */

function OrdersTrendChart({ period }: { period: Period }) {
  const trendData = ORDERS_TREND[period]
  const maxOrders = Math.max(...trendData.map((d) => d.orders), 1)
  const width = 380
  const height = 200
  const padX = 48
  const padY = 20
  const chartW = width - padX - 16
  const chartH = height - padY - 36
  const stepX = chartW / (trendData.length - 1)

  const points = trendData.map((d, i) => ({
    x: padX + i * stepX,
    y: padY + chartH - (d.orders / maxOrders) * chartH,
    ...d,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.25 }}
    >
      <Card className="r52-analytics-trend-card overflow-hidden border border-border/60">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Orders Trend
            </CardTitle>
            <Badge variant="secondary" className="r52-analytics-trend-badge text-[10px] font-medium">
              {trendData.length} data points
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <svg viewBox={`0 0 ${width} ${height}`} className="r52-analytics-trend-svg w-full" role="img" aria-label="Orders trend chart">
            <defs>
              <linearGradient id="r52-lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="r52-areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(99,102,241,0.3)" />
                <stop offset="100%" stopColor="rgba(99,102,241,0.02)" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={`grid-${ratio}`}
                x1={padX} y1={padY + chartH - chartH * ratio}
                x2={width - 16} y2={padY + chartH - chartH * ratio}
                stroke="rgba(148,163,184,0.1)" strokeWidth="0.5"
              />
            ))}

            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const val = Math.round(maxOrders * ratio)
              return (
                <text
                  key={`ylabel-${ratio}`}
                  x={padX - 8} y={padY + chartH - chartH * ratio + 3}
                  textAnchor="end" fontSize="8" className="fill-muted-foreground"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                </text>
              )
            })}

            {/* Area fill */}
            <motion.path
              d={areaPath}
              fill="url(#r52-areaGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
            />

            {/* Line */}
            <motion.path
              d={linePath}
              fill="none"
              stroke="url(#r52-lineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            />

            {/* Data points */}
            {points.map((p, i) => (
              <g key={p.day}>
                <motion.circle
                  cx={p.x} cy={p.y} r="0"
                  fill="white"
                  stroke="#6366f1"
                  strokeWidth="2"
                  animate={{ r: 4 }}
                  transition={{ type: 'spring' as const, stiffness: 200, damping: 14, delay: 0.5 + i * 0.08 }}
                />
                <motion.text
                  x={p.x} y={p.y - 10}
                  textAnchor="middle" fontSize="8" fontWeight="700"
                  fill="#6366f1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                >
                  {p.orders >= 1000 ? `${(p.orders / 1000).toFixed(1)}k` : p.orders}
                </motion.text>
                <text x={p.x} y={padY + chartH + 16} textAnchor="middle" fontSize="10" className="fill-muted-foreground">
                  {p.day}
                </text>
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── 3. Top Selling Categories ─── */

function TopCategories() {
  const maxSales = Math.max(...TOP_CATEGORIES.map((c) => c.sales), 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.3 }}
    >
      <Card className="r52-analytics-categories-card overflow-hidden border border-border/60">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-pink-500" />
              Top Selling Categories
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-medium">
              {TOP_CATEGORIES.length} categories
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="r52-analytics-category-list space-y-3">
            {TOP_CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                className="r52-analytics-category-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring' as const, stiffness: 140, damping: 20, delay: 0.35 + i * 0.06 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.emoji}</span>
                    <span className="text-xs font-semibold">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: cat.color }}>
                      {cat.sales.toLocaleString('en-US')} sales
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">{cat.percentage}%</span>
                  </div>
                </div>
                {/* Bar background */}
                <div className="r52-analytics-category-bar-bg relative h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: `${cat.color}15` }}>
                  <motion.div
                    className="r52-analytics-category-bar-fill h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.sales / maxSales) * 100}%` }}
                    transition={{ type: 'spring' as const, stiffness: 80, damping: 14, delay: 0.4 + i * 0.06 }}
                  />
                  {/* Shimmer on bar */}
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.06 }}
                  >
                    <motion.div
                      className="absolute inset-y-0 left-0 w-1/3 rounded-full"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
                      animate={{ x: ['-100%', '400%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut', delay: i * 0.2 }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── 4. Store Leaderboard ─── */

const MEDAL_STYLES: Record<number, { bg: string; text: string; border: string; glow: string }> = {
  1: { bg: 'rgba(255,215,0,0.18)', text: '#d4a017', border: 'rgba(255,215,0,0.4)', glow: '0 0 12px rgba(255,215,0,0.3)' },
  2: { bg: 'rgba(192,192,192,0.18)', text: '#a0a0a0', border: 'rgba(192,192,192,0.4)', glow: '0 0 10px rgba(192,192,192,0.25)' },
  3: { bg: 'rgba(205,127,50,0.18)', text: '#cd7f32', border: 'rgba(205,127,50,0.4)', glow: '0 0 10px rgba(205,127,50,0.25)' },
}

function StoreLeaderboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.35 }}
    >
      <Card className="r52-analytics-leaderboard-card overflow-hidden border border-border/60">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Store Leaderboard
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-medium flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="r52-analytics-leaderboard-list space-y-2">
            {STORE_LEADERS.map((store, i) => {
              const medal = MEDAL_STYLES[store.rank]
              const hasMedal = store.rank <= 3
              const isPositive = store.growth >= 0

              return (
                <motion.div
                  key={store.rank}
                  className="r52-analytics-leader-item flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{
                    backgroundColor: hasMedal ? medal.bg : 'rgba(148,163,184,0.06)',
                    border: hasMedal ? `1px solid ${medal.border}` : '1px solid transparent',
                  }}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 160, damping: 18, delay: 0.4 + i * 0.08 }}
                >
                  {/* Rank badge */}
                  <div className="r52-analytics-rank-badge flex items-center justify-center h-9 w-9 rounded-lg shrink-0">
                    {hasMedal ? (
                      <motion.div
                        className="flex items-center justify-center h-9 w-9 rounded-full"
                        style={{
                          backgroundColor: `${medal.text}`,
                          boxShadow: medal.glow,
                        }}
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                      >
                        <span className="text-xs font-extrabold text-white">#{store.rank}</span>
                      </motion.div>
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">#{store.rank}</span>
                    )}
                  </div>

                  {/* Store info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base shrink-0">{store.emoji}</span>
                      <p className="text-xs font-semibold truncate">{store.name}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {store.orders.toLocaleString('en-US')} orders
                      </span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        R$ {(store.revenue / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>

                  {/* Right side: rating + growth */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-amber-400" fill="rgba(251,191,36,0.8)" />
                      <span className="text-[10px] font-bold">{store.rating}</span>
                    </div>
                    <motion.div
                      className="flex items-center gap-0.5 text-[10px] font-bold"
                      style={{ color: isPositive ? '#10b981' : '#ef4444' }}
                      animate={isPositive ? { y: [0, -2, 0] } : { y: [0, 2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                    >
                      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      <span>{isPositive ? '+' : ''}{store.growth}%</span>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── 5. Peak Hours Heatmap ─── */

function PeakHoursHeatmap() {
  const hourLabels = useMemo(() => {
    const labels: string[] = []
    for (let h = 0; h < 24; h++) {
      labels.push(h % 4 === 0 ? `${h}h` : '')
    }
    return labels
  }, [])

  const getHeatColor = (value: number): string => {
    if (value < 0.1) return 'rgba(99,102,241,0.06)'
    if (value < 0.25) return 'rgba(99,102,241,0.15)'
    if (value < 0.4) return 'rgba(99,102,241,0.3)'
    if (value < 0.55) return 'rgba(99,102,241,0.45)'
    if (value < 0.7) return 'rgba(99,102,241,0.6)'
    if (value < 0.85) return 'rgba(236,72,153,0.6)'
    return 'rgba(236,72,153,0.8)'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.4 }}
    >
      <Card className="r52-analytics-heatmap-card overflow-hidden border border-border/60">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              Peak Hours Heatmap
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-medium">
              Order density
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="r52-analytics-heatmap-container overflow-x-auto">
            {/* Hour labels */}
            <div className="r52-analytics-heatmap-grid flex gap-px" style={{ minWidth: 540 }}>
              {/* Empty corner for labels alignment */}
              <div className="flex-none" style={{ width: 32 }}>
                <span className="text-[8px] text-muted-foreground" />
              </div>
              {Array.from({ length: 24 }, (_, h) => (
                <div key={`hour-label-${h}`} className="flex-none" style={{ width: 22 }}>
                  <span className="text-[7px] text-muted-foreground font-medium">{hourLabels[h]}</span>
                </div>
              ))}
            </div>

            {/* Grid rows */}
            <div className="r52-analytics-heatmap-rows flex flex-col gap-px mt-0.5">
              {DAY_LABELS.map((dayLabel, day) => (
                <div key={dayLabel} className="r52-analytics-heatmap-row flex items-center gap-px">
                  <div className="flex-none" style={{ width: 32 }}>
                    <span className="text-[8px] text-muted-foreground font-medium">{dayLabel}</span>
                  </div>
                  {HEATMAP_DATA.filter((c) => c.day === day).sort((a, b) => a.hour - b.hour).map((cell) => (
                    <motion.div
                      key={`cell-${day}-${cell.hour}`}
                      className="r52-analytics-heatmap-cell flex-none rounded-sm cursor-default"
                      style={{
                        width: 22,
                        height: 16,
                        backgroundColor: getHeatColor(cell.value),
                      }}
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: 'spring' as const,
                        stiffness: 200,
                        damping: 20,
                        delay: 0.5 + (day * 24 + cell.hour) * 0.003,
                      }}
                      title={`${dayLabel} ${cell.hour}:00h — ${Math.round(cell.value * 100)}% density`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="r52-analytics-heatmap-legend flex items-center justify-between mt-3">
              <span className="text-[9px] text-muted-foreground font-medium">Low activity</span>
              <div className="flex items-center gap-1">
                {[0.05, 0.15, 0.3, 0.5, 0.65, 0.8, 0.95].map((val) => (
                  <div
                    key={`legend-${val}`}
                    className="rounded-sm"
                    style={{ width: 16, height: 10, backgroundColor: getHeatColor(val) }}
                  />
                ))}
              </div>
              <span className="text-[9px] text-muted-foreground font-medium">Peak</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── 6. Customer Satisfaction Gauge ─── */

function SatisfactionGauge() {
  const [animatedScore, setAnimatedScore] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    const target = SATISFACTION_SCORE
    const duration = 1800
    startRef.current = performance.now()

    function frame(now: number) {
      if (startRef.current === null) return
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(eased * target)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        setAnimatedScore(target)
      }
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const size = 180
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = Math.PI * radius
  const progressOffset = circumference - (animatedScore / 100) * circumference

  const getColorForScore = (score: number) => {
    if (score >= 90) return '#10b981'
    if (score >= 70) return '#f59e0b'
    return '#ef4444'
  }

  const scoreColor = getColorForScore(SATISFACTION_SCORE)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.45 }}
    >
      <Card className="r52-analytics-gauge-card overflow-hidden border border-border/60">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Customer Satisfaction
            </h3>

            <div className="r52-analytics-gauge-wrapper relative flex items-center justify-center" style={{ width: size, height: size / 2 + 20 }}>
              <svg viewBox={`0 0 ${size} ${size / 2 + 20}`} className="absolute inset-0" style={{ width: size, height: size / 2 + 20 }}>
                <defs>
                  <linearGradient id="r52-gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="40%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <filter id="r52-gaugeGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Background arc */}
                <path
                  d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                  fill="none"
                  stroke="rgba(148,163,184,0.12)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
                {/* Animated arc */}
                <motion.path
                  d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                  fill="none"
                  stroke="url(#r52-gaugeGrad)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  filter="url(#r52-gaugeGlow)"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: progressOffset }}
                  transition={{ duration: 1.8, ease: 'easeOut', delay: 0.5 }}
                />
                {/* Tick marks */}
                {Array.from({ length: 10 }, (_, i) => {
                  const angle = Math.PI + (i / 9) * Math.PI
                  const innerR = radius + strokeWidth / 2 + 4
                  const outerR = innerR + (i % 2 === 0 ? 8 : 5)
                  return (
                    <line
                      key={`tick-${i}`}
                      x1={size / 2 + innerR * Math.cos(angle)}
                      y1={(size / 2 + 10) + innerR * Math.sin(angle) - 10}
                      x2={size / 2 + outerR * Math.cos(angle)}
                      y2={(size / 2 + 10) + outerR * Math.sin(angle) - 10}
                      stroke="rgba(148,163,184,0.25)"
                      strokeWidth={i % 2 === 0 ? 1.5 : 0.75}
                    />
                  )
                })}
              </svg>

              {/* Center value */}
              <div className="relative z-10 flex flex-col items-center" style={{ marginTop: 10 }}>
                <span className="text-3xl font-extrabold" style={{ color: scoreColor }}>
                  {Math.round(animatedScore)}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">out of 100</span>
              </div>
            </div>

            {/* Labels */}
            <div className="flex items-center justify-between w-full px-4 mt-2">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                  <span className="text-[9px] font-bold" style={{ color: '#10b981' }}>4.8 / 5.0</span>
                </div>
                <span className="text-[9px] text-muted-foreground">Avg. Rating</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(99,102,241,0.1)' }}>
                  <span className="text-[9px] font-bold" style={{ color: '#6366f1' }}>94%</span>
                </div>
                <span className="text-[9px] text-muted-foreground">Would recommend</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}>
                  <span className="text-[9px] font-bold" style={{ color: '#f59e0b' }}>2.4%</span>
                </div>
                <span className="text-[9px] text-muted-foreground">Return rate</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── 7. Growth Indicators ─── */

interface GrowthIndicator { label: string; value: number; previousValue: number; icon: React.ElementType }

const GROWTH_DATA: GrowthIndicator[] = [
  { label: 'New Customers', value: 1840, previousValue: 1520, icon: Users },
  { label: 'Repeat Purchases', value: 67, previousValue: 62, icon: ShoppingBag },
  { label: 'Avg. Order Value', value: 82.4, previousValue: 76.1, icon: DollarSign },
  { label: 'Conversion Rate', value: 4.2, previousValue: 3.8, icon: Zap },
]

function GrowthIndicators() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.5 }}
    >
      <Card className="r52-analytics-growth-card overflow-hidden border border-border/60">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Growth Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="r52-analytics-growth-grid grid grid-cols-2 gap-3">
            {GROWTH_DATA.map((item, i) => {
              const change = item.previousValue > 0
                ? ((item.value - item.previousValue) / item.previousValue) * 100
                : 0
              const isPositive = change >= 0

              return (
                <motion.div
                  key={item.label}
                  className="r52-analytics-growth-item flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    backgroundColor: isPositive ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                  }}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 180, damping: 18, delay: 0.55 + i * 0.08 }}
                >
                  <div
                    className="r52-analytics-growth-icon flex items-center justify-center h-8 w-8 rounded-lg shrink-0"
                    style={{
                      backgroundColor: isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    }}
                  >
                    <item.icon className="h-4 w-4" style={{ color: isPositive ? '#10b981' : '#ef4444' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold">
                        {item.value >= 1000
                          ? `${(item.value / 1000).toFixed(1)}k`
                          : item.value % 1 !== 0 ? item.value.toFixed(1) : item.value}
                        {item.label === 'Repeat Purchases' || item.label === 'Conversion Rate' ? '%' : ''}
                        {item.label === 'Avg. Order Value' ? '' : ''}
                        {item.label === 'Avg. Order Value' ? '' : ''}
                      </span>
                      {item.label === 'Avg. Order Value' && (
                        <span className="text-[10px] text-muted-foreground">R$</span>
                      )}
                    </div>
                  </div>
                  <motion.div
                    className="flex items-center gap-0.5 text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded-full"
                    style={{
                      color: isPositive ? '#10b981' : '#ef4444',
                      backgroundColor: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    }}
                    animate={isPositive ? { y: [0, -2, 0] } : { y: [0, 2, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                  >
                    {isPositive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                    <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── 8. Recent Activity Feed ─── */

function RecentActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.55 }}
    >
      <Card className="r52-analytics-activity-card overflow-hidden border border-border/60">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-violet-500" />
              Recent Activity
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-medium flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Live feed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="r52-analytics-activity-list space-y-2">
            {RECENT_ACTIVITY.map((item, i) => (
              <motion.div
                key={item.id}
                className="r52-analytics-activity-item flex items-center gap-3 p-2.5 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors"
                initial={{ opacity: 0, x: -16, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  type: 'spring' as const,
                  stiffness: 180,
                  damping: 20,
                  delay: 0.6 + i * 0.07,
                }}
              >
                <div className="r52-analytics-activity-emoji flex items-center justify-center h-9 w-9 rounded-lg bg-secondary/50 shrink-0">
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                  >
                    {item.emoji}
                  </motion.span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.text}</p>
                  <p className="text-[10px] text-muted-foreground">{item.time}</p>
                </div>
                <motion.div
                  className="r52-analytics-activity-dot h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: '#10b981' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 14, delay: 0.8 + i * 0.07 }}
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── 9. Period Toggle ─── */

function PeriodToggle({ active, onChange }: { active: Period; onChange: (p: Period) => void }) {
  const periods: { key: Period; label: string; icon: React.ElementType }[] = [
    { key: 'week', label: 'This Week', icon: Calendar },
    { key: 'month', label: 'This Month', icon: Calendar },
    { key: 'year', label: 'This Year', icon: Calendar },
  ]

  return (
    <div className="r52-analytics-period-toggle flex items-center rounded-xl p-1" style={{ backgroundColor: 'rgba(148,163,184,0.1)' }}>
      {periods.map((p) => {
        const isActive = p.key === active
        return (
          <motion.div key={p.key} whileTap={{ scale: 0.97 }}>
            <button
              className="r52-analytics-period-btn relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors"
              style={{
                color: isActive ? '#ffffff' : 'rgba(148,163,184,0.7)',
              }}
              onClick={() => onChange(p.key)}
            >
              {isActive && (
                <motion.div
                  className="r52-analytics-period-active-bg absolute inset-0 rounded-lg"
                  style={{ backgroundColor: '#6366f1', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}
                  layoutId="r52-period-indicator"
                  transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <p.icon className="h-3.5 w-3.5" />
                {p.label}
              </span>
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ─── 10. Export / Share Button ─── */

function ExportShareButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = useCallback(() => {
    setIsExporting(true)
    setTimeout(() => setIsExporting(false), 2000)
  }, [])

  return (
    <div className="r52-analytics-export-section flex items-center gap-2">
      {/* Export button */}
      <motion.div whileTap={{ scale: 0.96 }}>
        <Button
          variant="outline"
          size="sm"
          className="r52-analytics-export-btn relative overflow-hidden text-xs gap-1.5"
          onClick={handleExport}
          disabled={isExporting}
        >
          {/* Shimmer effect */}
          <motion.div
            className="r52-analytics-shimmer absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)',
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
            />
          </motion.div>
          <span className="relative z-10 flex items-center gap-1.5">
            {isExporting ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Activity className="h-3.5 w-3.5" />
              </motion.span>
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {isExporting ? 'Exporting...' : 'Export Data'}
          </span>
        </Button>
      </motion.div>

      {/* Share button */}
      <motion.div whileTap={{ scale: 0.96 }}>
        <Button
          variant="outline"
          size="sm"
          className="r52-analytics-share-btn relative overflow-hidden text-xs gap-1.5"
        >
          <motion.div
            className="r52-analytics-share-shimmer absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.12), transparent)',
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
            />
          </motion.div>
          <span className="relative z-10 flex items-center gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            Share Report
          </span>
        </Button>
      </motion.div>
    </div>
  )
}

/* ─── 11. Quick Stats Bar ─── */

function QuickStatsBar({ period }: { period: Period }) {
  const metrics = METRICS_BY_PERIOD[period]

  const totalOrders = metrics.find((m) => m.id === 'orders')?.value ?? 0
  const totalRevenue = metrics.find((m) => m.id === 'revenue')?.value ?? 0
  const activeStores = metrics.find((m) => m.id === 'stores')?.value ?? 0
  const totalProducts = metrics.find((m) => m.id === 'products')?.value ?? 0

  const stats = [
    { label: 'Avg. daily orders', value: totalOrders >= 7 ? Math.round(totalOrders / 7) : totalOrders },
    { label: 'Revenue per store', value: activeStores > 0 ? Math.round(totalRevenue / activeStores) : 0 },
    { label: 'Products per store', value: activeStores > 0 ? Math.round(totalProducts / activeStores) : 0 },
    { label: 'Order value', value: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.15 }}
    >
      <div className="r52-analytics-quick-stats flex items-center gap-4 overflow-x-auto pb-2">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="r52-analytics-quick-stat flex items-center gap-2 px-3 py-2 rounded-xl shrink-0"
            style={{
              backgroundColor: 'rgba(148,163,184,0.06)',
              border: '1px solid rgba(148,163,184,0.1)',
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 180, damping: 18, delay: 0.2 + i * 0.06 }}
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground font-medium">{stat.label}</span>
              <span className="text-xs font-bold text-foreground">
                {stat.value >= 1000 ? `${(stat.value / 1000).toFixed(1)}k` : stat.value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Main Component ─── */

export function MarketplaceAnalytics() {
  const [period, setPeriod] = useState<Period>('week')

  return (
    <section className="r52-analytics-container space-y-5 sm:space-y-6 r62-card-lift" aria-label="Marketplace Analytics Dashboard">
      {/* ── Header with period toggle & export ── */}
      <motion.div
        className="r52-analytics-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 140, damping: 20 }}
      >
        <div className="flex items-center gap-3">
          <div className="r52-analytics-logo flex items-center justify-center h-10 w-10 rounded-xl" style={{ backgroundColor: 'rgba(99,102,241,0.12)' }}>
            <BarChart3 className="h-5 w-5" style={{ color: '#6366f1' }} />
          </div>
          <div>
            <h2 className="r52-analytics-title text-lg font-bold tracking-tight r62-heading-gradient">Marketplace Analytics</h2>
            <p className="r52-analytics-subtitle text-xs text-muted-foreground font-medium">
              Real-time insights & trends · {PERIOD_LABELS[period]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PeriodToggle active={period} onChange={setPeriod} />
          <ExportShareButton />
        </div>
      </motion.div>

      {/* ── Quick Stats Bar ── */}
      <QuickStatsBar period={period} />

      {/* ── Key Metrics Row ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={period}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: 'spring' as const, stiffness: 160, damping: 22 }}
        >
          <KeyMetricsRow period={period} />
        </motion.div>
      </AnimatePresence>

      {/* ── Two-column layout: Trend + Gauge ── */}
      <div className="r52-analytics-row-top grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={`trend-${period}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OrdersTrendChart period={period} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="lg:col-span-2">
          <SatisfactionGauge />
        </div>
      </div>

      {/* ── Two-column: Categories + Growth ── */}
      <div className="r52-analytics-row-mid grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <TopCategories />
        <GrowthIndicators />
      </div>

      {/* ── Two-column: Leaderboard + Heatmap ── */}
      <div className="r52-analytics-row-bottom grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <StoreLeaderboard />
        <PeakHoursHeatmap />
      </div>

      {/* ── Recent Activity Feed ── */}
      <RecentActivityFeed />

      {/* ── Footer ── */}
      <motion.div
        className="r52-analytics-footer flex items-center justify-center py-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live data · Last updated just now · Powered by DomPlace
        </p>
      </motion.div>
    </section>
  )
}
