'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Calendar, Receipt, Tag, ChevronDown, ChevronUp,
  PiggyBank, Lightbulb, ShoppingBag, Wallet, BarChart3, Sparkles,
} from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { Badge } from '@/components/ui/badge'

// ─── Interfaces ──────────────────────────────────────────────────────────

interface SpendingCategory {
  name: string
  emoji: string
  amount: number
  percentage: number
  color: string
}

interface TopPurchase {
  id: string
  name: string
  store: string
  price: number
  date: string
  categoryEmoji: string
}

interface SpendingData {
  totalSpent: number
  previousTotal: number
  budget: number
  savings: number
  categories: SpendingCategory[]
  dailySpending: { day: string; amount: number }[]
  topPurchases: TopPurchase[]
}

interface SpendingInsightsProps {
  className?: string
}

interface EconomyTip {
  emoji: string
  title: string
  description: string
}

// ─── Constants & Config ────────────────────────────────────────────────

const STORAGE_KEY = 'r70-spending-period'
const API_ENDPOINT = '/api/spending/insights'

const PERIODS = [
  { key: 'week', label: 'Esta semana' },
  { key: 'month', label: 'Este mês' },
  { key: 'year', label: 'Este ano' },
]

const ECONOMY_TIPS: EconomyTip[] = [
  {
    emoji: '🛒',
    title: 'Compare preços antes de comprar',
    description:
      'Use a funcionalidade de comparação para encontrar o menor preço. Produtos de marcas próprias podem economizar até 30% sem perder qualidade.',
  },
  {
    emoji: '📅',
    title: 'Aproveite promoções sazonais',
    description:
      'As melhores ofertas aparecem no meio da semana. Planeje suas compras para terça e quarta-feira, quando os supermercados oferecem descontos maiores.',
  },
  {
    emoji: '📋',
    title: 'Faça uma lista e mantenha-se nela',
    description:
      'Compras por impulso representam em média 25% do total do carrinho. Com uma lista organizada, você pode economizar mais de R$200 por mês.',
  },
]

const FALLBACK_DATA: SpendingData = {
  totalSpent: 847.3,
  previousTotal: 932.5,
  budget: 1200,
  savings: 123.45,
  categories: [
    { name: 'Alimentos', emoji: '🍎', amount: 320, percentage: 38, color: '#059669' },
    { name: 'Bebidas', emoji: '🥤', amount: 145, percentage: 17, color: '#2563eb' },
    { name: 'Limpeza', emoji: '🧹', amount: 89, percentage: 11, color: '#7c3aed' },
    { name: 'Higiene', emoji: '🧴', amount: 67, percentage: 8, color: '#db2777' },
    { name: 'Padaria', emoji: '🍞', amount: 98, percentage: 12, color: '#d97706' },
    { name: 'Outros', emoji: '📦', amount: 128, percentage: 15, color: '#64748b' },
  ],
  dailySpending: [
    { day: 'Seg', amount: 85 },
    { day: 'Ter', amount: 120 },
    { day: 'Qua', amount: 95 },
    { day: 'Qui', amount: 140 },
    { day: 'Sex', amount: 180 },
    { day: 'Sáb', amount: 150 },
    { day: 'Dom', amount: 78 },
  ],
  topPurchases: [
    { id: 'tp-1', name: 'Arroz Tio João 5kg', store: 'Mercado Central', price: 24.9, date: '2025-01-13', categoryEmoji: '🍎' },
    { id: 'tp-2', name: 'Coca-Cola 2L', store: 'Supermercado Bom Preço', price: 8.99, date: '2025-01-12', categoryEmoji: '🥤' },
    { id: 'tp-3', name: 'Detergente Ypê 500ml', store: 'Atacadão', price: 5.49, date: '2025-01-11', categoryEmoji: '🧹' },
    { id: 'tp-4', name: 'Pão Francês 6un', store: 'Padaria do João', price: 4.5, date: '2025-01-14', categoryEmoji: '🍞' },
    { id: 'tp-5', name: 'Frango Inteiro kg', store: 'Açougue São Paulo', price: 32.9, date: '2025-01-10', categoryEmoji: '🍎' },
  ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

function loadPeriodPref(): string {
  if (typeof window === 'undefined') return 'month'
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s && PERIODS.some((p) => p.key === s)) return JSON.parse(s) as string
  } catch { /* noop */ }
  return 'month'
}

function savePeriodPref(period: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(period)) } catch { /* noop */ }
}

function usePrefersReducedMotion(): boolean {
  const [pref, set] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    set(mq.matches)
    const h = (e: MediaQueryListEvent) => set(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return pref
}

const reduced = (p: boolean, initial: { opacity?: number; scale?: number; y?: number; x?: number; height?: number | string; width?: string; strokeDashoffset?: number }) =>
  p ? { opacity: 1 } : initial

const SPRING = { type: 'spring' as const, stiffness: 120, damping: 20 }
const SPRING_G = { type: 'spring' as const, stiffness: 80, damping: 18 }
const SPRING_B = { type: 'spring' as const, stiffness: 200, damping: 16 }

// ─── Animated Counter ───────────────────────────────────────────────────

function AnimatedCounter({ target, prefix = 'R$ ', duration = 1200 }: { target: number; prefix?: string; duration?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<number | null>(null)
  const t0 = useRef(0)
  const noMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (noMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVal(target); return
    }
    t0.current = Date.now()
    const step = () => {
      const p = Math.min((Date.now() - t0.current) / duration, 1)
      setVal((1 - Math.pow(1 - p, 3)) * target)
      if (p < 1) ref.current = requestAnimationFrame(step)
    }
    ref.current = requestAnimationFrame(step)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [target, duration, noMotion])

  return <span className="r70-counter-value tabular-nums">{prefix}{val.toFixed(2).replace('.', ',')}</span>
}

// ─── Loading Skeleton ──────────────────────────────────────────────────

function LoadingSkeleton() {
  const bars = [0, 1, 2, 3, 4, 5, 6]
  return (
    <section className="r70-spending-insights" aria-label="Carregando insights">
      <div className="flex gap-2 mb-4">{[0, 1, 2].map((i) => <div key={i} className="h-11 flex-1 rounded-full bg-muted animate-pulse" />)}</div>
      <div className="rounded-2xl p-5 bg-muted/50 animate-pulse mb-4">
        <div className="h-4 w-32 bg-muted rounded mb-3" />
        <div className="h-8 w-48 bg-muted rounded mb-2" />
        <div className="h-3 w-24 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl p-4 bg-muted/50 animate-pulse">
            <div className="h-3 w-20 bg-muted rounded mb-2" />
            <div className="h-5 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-5 bg-muted/50 animate-pulse mb-4">
        <div className="h-4 w-40 bg-muted rounded mb-4" />
        <div className="flex items-center justify-center gap-3">
          <div className="w-28 h-28 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-3 bg-muted rounded" style={{ width: `${70 - i * 15}%` }} />)}</div>
        </div>
      </div>
      <div className="rounded-2xl p-5 bg-muted/50 animate-pulse mb-4">
        <div className="h-4 w-48 bg-muted rounded mb-4" />
        <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
          {bars.map((i) => <div key={i} className="flex-1 bg-muted rounded-t-md" style={{ height: `${30 + ((i * 13 + 5) % 70)}%` }} />)}
        </div>
      </div>
      <div className="rounded-2xl p-5 bg-muted/50 animate-pulse mb-4">
        <div className="h-4 w-36 bg-muted rounded mb-3" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-muted" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-muted rounded" style={{ width: `${60 + (i * 7) % 30}%` }} />
              <div className="h-2 bg-muted rounded w-1/3" />
            </div>
            <div className="h-4 w-14 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-5 bg-muted/50 animate-pulse mb-4">
        <div className="h-4 w-40 bg-muted rounded mb-3" />
        <div className="h-4 w-full bg-muted rounded-full" />
      </div>
      <div className="rounded-2xl p-5 bg-muted/50 animate-pulse">
        <div className="h-4 w-36 bg-muted rounded mb-3" />
        {[0, 1, 2].map((i) => <div key={i} className="h-10 bg-muted rounded mb-2" />)}
      </div>
    </section>
  )
}

// ─── Period Selector ───────────────────────────────────────────────────

function PeriodSelector({ selected, onSelect }: { selected: string; onSelect: (k: string) => void }) {
  const noMotion = usePrefersReducedMotion()
  return (
    <div className="r70-period-selector flex gap-2 mb-4" role="tablist" aria-label="Seletor de período">
      {PERIODS.map((p) => {
        const active = p.key === selected
        return (
          <motion.button
            key={p.key} role="tab" aria-selected={active}
            onClick={() => onSelect(p.key)}
            className={`r70-period-tab h-11 min-h-[44px] flex-1 px-4 rounded-full text-sm font-semibold transition-colors flex items-center justify-center ${
              active ? 'r70-period-tab-active bg-primary text-primary-foreground' : 'r70-period-tab-inactive bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
            whileHover={noMotion ? {} : { scale: 1.03 }}
            whileTap={noMotion ? {} : { scale: 0.97 }}
            transition={SPRING_B}
          >
            <Calendar className="w-4 h-4 mr-1.5 opacity-70" />
            {p.label}
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── Spending Summary Card ──────────────────────────────────────────────

function SpendingSummaryCard({ data }: { data: SpendingData }) {
  const noMotion = usePrefersReducedMotion()
  return (
    <motion.div
      className="r70-summary-card r62-card-lift rounded-2xl p-5 relative overflow-hidden mb-4"
      initial={reduced(noMotion, { opacity: 0, scale: 0.96 })} animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING, delay: 0.1 }}
    >
      <div className="r70-summary-bg absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)' }} />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-muted-foreground">Total gasto este mês</span>
        </div>
        <div className="flex items-baseline gap-1">
          <AnimatedCounter target={data.totalSpent} />
          <motion.span className="text-lg text-muted-foreground font-light"
            initial={reduced(noMotion, { opacity: 0 })} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            / {formatBRL(data.budget)}
          </motion.span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            <Receipt className="w-3 h-3 mr-1" />
            {data.dailySpending.length} dias com compras
          </Badge>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Comparison Metrics ────────────────────────────────────────────────

function ComparisonMetrics({ data }: { data: SpendingData }) {
  const noMotion = usePrefersReducedMotion()
  const metrics = useMemo(() => [
    { label: 'vs semana passada', prev: data.previousTotal * 0.28 },
    { label: 'vs mês passado', prev: data.previousTotal },
    { label: 'vs mesmo período', prev: data.previousTotal * 1.12 },
  ], [data])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
      {metrics.map((m, i) => {
        const diff = data.totalSpent - m.prev
        const pct = m.prev > 0 ? (diff / m.prev) * 100 : 0
        const up = diff > 0
        return (
          <motion.div key={m.label}
            className="r70-comparison-card r62-card-lift rounded-xl p-4 bg-card/50 border border-border/50"
            initial={reduced(noMotion, { opacity: 0, y: 15 })} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.2 + i * 0.08 }}
          >
            <p className="text-[10px] font-medium text-muted-foreground mb-1.5">{m.label}</p>
            <div className="flex items-center gap-1">
              {up ? <TrendingUp className="w-3.5 h-3.5 text-red-500" /> : <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />}
              <span className={`text-sm font-bold ${up ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                {up ? '+' : ''}{pct.toFixed(1)}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{fmt(Math.abs(diff))}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Donut Chart (Pure SVG) ────────────────────────────────────────────

function DonutChart({ categories, total }: { categories: SpendingCategory[]; total: number }) {
  const noMotion = usePrefersReducedMotion()
  const size = 140, sw = 24
  const r = (size - sw) / 2
  const C = 2 * Math.PI * r

  const segments = categories.map((cat, idx) => {
    const cumOff = categories.slice(0, idx).reduce((s, c) => s + (c.percentage / 100) * C, 0)
    const len = (cat.percentage / 100) * C
    return { cat, da: `${len} ${C - len}`, off: -(cumOff) }
  })

  return (
    <motion.div
      className="r70-donut-chart r62-card-lift rounded-2xl p-5 bg-card/50 border border-border/50 mb-4"
      initial={reduced(noMotion, { opacity: 0, y: 15 })} animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.35 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Gastos por categoria</h3>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="r70-donut-svg-wrapper relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(100,116,139,0.12)" strokeWidth={sw} />
            <defs>
              {segments.map((s) => (
                <linearGradient key={`g-${s.cat.name}`} id={`dg-${s.cat.name}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={s.cat.color} stopOpacity="1" />
                  <stop offset="100%" stopColor={s.cat.color} stopOpacity="0.7" />
                </linearGradient>
              ))}
            </defs>
            {segments.map((s, idx) => (
              <motion.circle key={s.cat.name}
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={`url(#dg-${s.cat.name})`} strokeWidth={sw} strokeLinecap="butt"
                strokeDasharray={s.da}
                initial={noMotion ? { strokeDashoffset: s.off } : { strokeDashoffset: C }}
                animate={{ strokeDashoffset: s.off }}
                transition={{ ...SPRING_G, delay: 0.5 + idx * 0.1 }}
              />
            ))}
          </svg>
          <div className="r70-donut-center absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium">Total</span>
            <span className="text-sm font-bold tabular-nums">{fmt(total)}</span>
          </div>
        </div>
        <div className="r70-donut-legend flex-1 w-full sm:w-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {categories.map((c, i) => (
              <motion.div key={c.name} className="r70-legend-item flex items-center gap-2 min-h-[28px]"
                initial={reduced(noMotion, { opacity: 0, x: -10 })} animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.6 + i * 0.06 }}
              >
                <span className="r70-legend-dot w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <div className="min-w-0">
                  <span className="text-[11px] font-medium block truncate">{c.emoji} {c.name}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{c.percentage}% · {fmt(c.amount)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Bar Chart (Gastos por dia da semana) ───────────────────────────────

function DailyBarChart({ dailyData }: { dailyData: { day: string; amount: number }[] }) {
  const noMotion = usePrefersReducedMotion()
  const maxAmt = Math.max(...dailyData.map((d) => d.amount), 1)
  const H = 130, bw = 32
  const totalW = dailyData.length * 52

  const highIdx = useMemo(
    () => dailyData.reduce((b, _, i) => (dailyData[i].amount > dailyData[b].amount ? i : b), 0),
    [dailyData]
  )

  return (
    <motion.div
      className="r70-bar-chart r62-card-lift rounded-2xl p-5 bg-card/50 border border-border/50 mb-4"
      initial={reduced(noMotion, { opacity: 0, y: 15 })} animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.45 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Gastos por dia da semana</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          <ShoppingBag className="w-3 h-3 mr-1" />
          {fmt(dailyData.reduce((s, d) => s + d.amount, 0))}
        </Badge>
      </div>
      <div className="r70-bar-chart-wrapper overflow-x-auto">
        <svg width="100%" viewBox={`0 0 ${totalW} ${H + 30}`} className="r70-bar-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="r70-bar-glow-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
            </linearGradient>
            <filter id="r70-bar-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = H - ratio * H
            return (
              <line key={`g${ratio}`} x1="0" y1={y} x2={totalW} y2={y}
                stroke="rgba(100,116,139,0.15)" strokeWidth="1" strokeDasharray="4 4" />
            )
          })}
          {dailyData.map((item, i) => {
            const bh = (item.amount / maxAmt) * H
            const x = i * 52 + (52 - bw) / 2
            const y = H - bh
            const isHigh = i === highIdx
            return (
              <g key={item.day}>
                <motion.text x={x + bw / 2} y={y - 6} textAnchor="middle" className="text-[9px] fill-muted-foreground"
                  initial={reduced(noMotion, { opacity: 0 })} animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.06 }} fontSize="9">{fmt(item.amount)}</motion.text>
                <motion.rect x={x} y={H} width={bw} rx="6" ry="6"
                  fill={isHigh ? 'url(#r70-bar-glow-gradient)' : 'rgba(5,150,105,0.6)'}
                  filter={isHigh ? 'url(#r70-bar-glow)' : undefined}
                  initial={noMotion ? { height: bh, y } : { height: 0, y: H }}
                  animate={{ height: bh, y }}
                  transition={{ ...SPRING_G, delay: 0.6 + i * 0.08 }} />
                <text x={x + bw / 2} y={H + 16} textAnchor="middle"
                  className="text-[10px] fill-muted-foreground font-medium" fontSize="10">{item.day}</text>
              </g>
            )
          })}
        </svg>
      </div>
    </motion.div>
  )
}

// ─── Top 5 Purchases ───────────────────────────────────────────────────

function TopPurchasesList({ purchases }: { purchases: TopPurchase[] }) {
  const noMotion = usePrefersReducedMotion()
  return (
    <motion.div
      className="r70-purchases-card r62-card-lift rounded-2xl p-5 bg-card/50 border border-border/50 mb-4"
      initial={reduced(noMotion, { opacity: 0, y: 15 })} animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Top 5 compras</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">{purchases.length} itens</Badge>
      </div>
      <div className="r70-purchases-list space-y-2">
        {purchases.map((p, i) => (
          <motion.div key={p.id}
            className="r70-purchase-item flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/30 hover:bg-background/60 transition-colors min-h-[44px]"
            initial={reduced(noMotion, { opacity: 0, x: -12 })} animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.6 + i * 0.07 }}
          >
            <span className="r70-purchase-rank w-6 h-6 rounded-lg bg-muted/80 flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
              {i + 1}
            </span>
            <span className="text-xl flex-shrink-0" role="img" aria-label={p.categoryEmoji}>{p.categoryEmoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{p.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {p.store} · {new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </p>
            </div>
            <span className="text-xs font-bold tabular-nums flex-shrink-0 text-emerald-600 dark:text-emerald-400">
              {fmt(p.price)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Savings Tracker ────────────────────────────────────────────────────

function SavingsTracker({ savings }: { savings: number }) {
  const noMotion = usePrefersReducedMotion()
  return (
    <motion.div
      className="r70-savings-card r62-card-lift rounded-2xl p-5 mb-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(37,99,235,0.06) 100%)', border: '1px solid rgba(5,150,105,0.2)' }}
      initial={reduced(noMotion, { opacity: 0, scale: 0.96 })} animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING, delay: 0.55 }}
    >
      <div className="flex items-center gap-3">
        <div className="r70-savings-icon w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <PiggyBank className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Você economizou</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            <AnimatedCounter target={savings} duration={1500} />
          </p>
        </div>
        <div className="flex-shrink-0">
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]">
            <Tag className="w-3 h-3 mr-1" />Cupons e promoções
          </Badge>
        </div>
      </div>
      <div className="absolute top-2 right-2 pointer-events-none">
        <motion.span className="text-xs"
          initial={reduced(noMotion, { opacity: 0, scale: 0 })} animate={{ opacity: 0.4, scale: 1 }}
          transition={{ ...SPRING_B, delay: 1 }}>✨</motion.span>
      </div>
    </motion.div>
  )
}

// ─── Budget Progress Bar ────────────────────────────────────────────────

function BudgetProgressBar({ spent, budget }: { spent: number; budget: number }) {
  const noMotion = usePrefersReducedMotion()
  const pct = budget > 0 ? (spent / budget) * 100 : 0
  const rem = Math.max(budget - spent, 0)

  const cfg = useMemo(() => {
    if (pct >= 90) return { color: '#dc2626', bg: 'rgba(220,38,38,0.12)', label: 'Acima de 90%' }
    if (pct >= 70) return { color: '#d97706', bg: 'rgba(217,119,6,0.12)', label: 'Acima de 70%' }
    return { color: '#059669', bg: 'rgba(5,150,105,0.12)', label: 'Normal' }
  }, [pct])

  return (
    <motion.div
      className="r70-budget-bar-card r62-card-lift rounded-2xl p-5 bg-card/50 border border-border/50 mb-4"
      initial={reduced(noMotion, { opacity: 0, y: 15 })} animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Orçamento mensal</h3>
        </div>
        <Badge className="text-[10px] border-0" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</Badge>
      </div>
      <div className="r70-budget-track h-3 rounded-full bg-muted overflow-hidden mb-2">
        <motion.div className="r70-budget-fill h-full rounded-full" style={{ backgroundColor: cfg.color }}
          initial={noMotion ? { width: `${pct}%` } : { width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ ...SPRING_G, delay: 0.7 }} />
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Gasto: {fmt(spent)} ({pct.toFixed(0)}%)</span>
        <span>Restante: {fmt(rem)}</span>
      </div>
    </motion.div>
  )
}

// ─── Economy Tips (Expandable) ───────────────────────────────────────────

function EconomyTips() {
  const [open, setOpen] = useState(false)
  const noMotion = usePrefersReducedMotion()

  return (
    <motion.div
      className="r70-tips-card r62-card-lift rounded-2xl p-5 bg-card/50 border border-border/50 mb-4"
      initial={reduced(noMotion, { opacity: 0, y: 15 })} animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.65 }}
    >
      <button type="button"
        className="r70-tips-toggle w-full flex items-center justify-between min-h-[44px] py-1"
        onClick={() => setOpen((p) => !p)} aria-expanded={open} aria-controls="r70-tips-content"
      >
        <div className="flex items-center gap-2">
          <div className="r70-tips-icon w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold">Dicas de economia</h3>
            <p className="text-[10px] text-muted-foreground">3 dicas geradas por IA</p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ ...SPRING_G }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div id="r70-tips-content" className="overflow-hidden"
            initial={noMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ ...SPRING_G }}
          >
            <div className="r70-tips-content mt-3 space-y-2">
              {ECONOMY_TIPS.map((tip, i) => (
                <motion.div key={tip.title}
                  className="r70-tip-item flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-border/30"
                  initial={reduced(noMotion, { opacity: 0, y: 10 })} animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING, delay: i * 0.08 }}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5" role="img" aria-hidden="true">{tip.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold mb-0.5">{tip.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{tip.description}</p>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400/50 flex-shrink-0 mt-0.5" />
                </motion.div>
              ))}
            </div>
            <button type="button"
              className="r70-tips-collapse w-full flex items-center justify-center gap-1.5 mt-3 py-2 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
              onClick={() => setOpen(false)}
            >
              <ChevronUp className="w-3.5 h-3.5" /> Recolher dicas
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────

export function SpendingInsights({ className }: SpendingInsightsProps) {
  const [data, setData] = useState<SpendingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<string>(loadPeriodPref)
  const [fetchError, setFetchError] = useState(false)
  const didFetch = useRef(false)

  useEffect(() => {
    if (didFetch.current) return
    didFetch.current = true
    const fetch = async () => {
      setIsLoading(true)
      setFetchError(false)
      try {
        const result = await cachedFetch<SpendingData>(`${API_ENDPOINT}?period=${selectedPeriod}`)
        setData(result)
      } catch {
        setFetchError(true)
        setData(FALLBACK_DATA)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [selectedPeriod])

  const handlePeriodChange = useCallback((period: string) => {
    setSelectedPeriod(period)
    savePeriodPref(period)
    didFetch.current = false
  }, [])

  if (isLoading || !data) {
    return <section className={`r70-spending-insights ${className ?? ''}`}><LoadingSkeleton /></section>
  }

  return (
    <section className={`r70-spending-insights r62-card-lift ${className ?? ''}`} aria-label="Insights de gastos">
      {/* Header */}
      <motion.div className="r70-header flex items-center justify-between mb-4"
        initial={reduced(false, { opacity: 0, y: -10 })} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING }}
      >
        <div className="flex items-center gap-2.5">
          <div className="r70-header-icon w-10 h-10 min-h-[40px] rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center"
            style={{ boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}>
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="r70-title text-base font-bold r62-heading-gradient">Insights de Gastos</h2>
            <p className="r70-subtitle text-[10px] text-muted-foreground">Acompanhe seus hábitos de compra</p>
          </div>
        </div>
        {fetchError && (
          <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400">
            Dados offline
          </Badge>
        )}
      </motion.div>

      <PeriodSelector selected={selectedPeriod} onSelect={handlePeriodChange} />
      <SpendingSummaryCard data={data} />
      <ComparisonMetrics data={data} />
      <DonutChart categories={data.categories} total={data.totalSpent} />
      <DailyBarChart dailyData={data.dailySpending} />
      <TopPurchasesList purchases={data.topPurchases} />
      <SavingsTracker savings={data.savings} />
      <BudgetProgressBar spent={data.totalSpent} budget={data.budget} />
      <EconomyTips />

      <motion.p className="r70-footer text-center text-[9px] text-muted-foreground mt-4 mb-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        Dados atualizados com base nas suas compras recentes
      </motion.p>
    </section>
  )
}
