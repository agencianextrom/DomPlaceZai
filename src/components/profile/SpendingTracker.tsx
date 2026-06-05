'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, PiggyBank, ShoppingBag, Award, ChevronUp, ChevronDown, Download } from 'lucide-react'
import { formatBRL } from '@/lib/format'
import { Button } from '@/components/ui/button'

/* ── Category labels matching existing categoryLabels ── */
const categoryLabels: Record<string, string> = {
  FOOD: 'Alimentação',
  HEALTH: 'Saúde',
  AGRICULTURE: 'Agricultura',
  ELECTRONICS: 'Eletrônicos',
  BEAUTY: 'Beleza',
  ANIMALS: 'Animais',
  HOME_GARDEN: 'Casa & Jardim',
}

const categoryIcons: Record<string, string> = {
  FOOD: '🍽️',
  HEALTH: '💊',
  AGRICULTURE: '🌿',
  ELECTRONICS: '📱',
  BEAUTY: '💅',
  ANIMALS: '🐾',
  HOME_GARDEN: '🏡',
}

const categoryColors: Record<string, string> = {
  FOOD: 'from-orange-400 to-red-400',
  HEALTH: 'from-emerald-400 to-green-500',
  AGRICULTURE: 'from-lime-400 to-green-400',
  ELECTRONICS: 'from-sky-400 to-blue-500',
  BEAUTY: 'from-pink-400 to-rose-500',
  ANIMALS: 'from-violet-400 to-purple-500',
  HOME_GARDEN: 'from-amber-400 to-yellow-500',
}

/* ── Mock spending data ── */
interface MonthlyCategory {
  category: string
  amount: number
  color: string
}

interface WeeklyData {
  week: string
  amount: number
}

interface TopStore {
  name: string
  amount: number
  orders: number
}

interface SpendingData {
  totalThisMonth: number
  totalLastMonth: number
  changePercent: number
  savings: number
  budget: number
  categories: MonthlyCategory[]
  weekly: WeeklyData[]
  topStores: TopStore[]
}

const MOCK_SPENDING: SpendingData = {
  totalThisMonth: 847.50,
  totalLastMonth: 923.80,
  changePercent: -8.3,
  savings: 132.40,
  budget: 1200,
  categories: [
    { category: 'FOOD', amount: 312.80, color: 'from-orange-400 to-red-400' },
    { category: 'HEALTH', amount: 156.40, color: 'from-emerald-400 to-green-500' },
    { category: 'ANIMALS', amount: 128.30, color: 'from-violet-400 to-purple-500' },
    { category: 'BEAUTY', amount: 98.00, color: 'from-pink-400 to-rose-500' },
    { category: 'ELECTRONICS', amount: 72.00, color: 'from-sky-400 to-blue-500' },
    { category: 'HOME_GARDEN', amount: 52.00, color: 'from-amber-400 to-yellow-500' },
    { category: 'AGRICULTURE', amount: 28.00, color: 'from-lime-400 to-green-400' },
  ],
  weekly: [
    { week: 'Sem 1', amount: 245.60 },
    { week: 'Sem 2', amount: 198.30 },
    { week: 'Sem 3', amount: 212.10 },
    { week: 'Sem 4', amount: 191.50 },
  ],
  topStores: [
    { name: 'Mercado do Zé', amount: 187.40, orders: 12 },
    { name: 'Farmácia Vida', amount: 98.50, orders: 5 },
    { name: 'Pet Shop Amigo Fiel', amount: 85.20, orders: 4 },
  ],
}

/* ── Animated number counter hook ── */
function useAnimatedCounter(target: number, duration = 1200): number {
  const [count, setCount] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    startRef.current = null
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const progress = Math.min((timestamp - startRef.current) / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(eased * target)
      if (progress < 1) requestAnimationFrame(step)
    }
    const id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [target, duration])

  return count
}

/* ── Animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 280,
      damping: 22,
    },
  },
}

const barVariants = {
  hidden: { scaleX: 0 },
  visible: (width: number) => ({
    scaleX: width,
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 18,
      delay: 0.2,
    },
  }),
}

/* ── Progress Ring component ── */
function ProgressRing({ percentage, size = 80, strokeWidth = 6 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Foreground circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#budgetGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
        <defs>
          <linearGradient id="budgetGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-lg font-extrabold"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          {Math.round(percentage)}%
        </motion.span>
        <span className="text-[9px] text-muted-foreground font-medium">do orçamento</span>
      </div>
    </div>
  )
}

/* ── Mini line chart ── */
function MiniLineChart({ data }: { data: WeeklyData[] }) {
  const maxVal = Math.max(...data.map((d) => d.amount))
  const padding = 4
  const chartWidth = 200
  const chartHeight = 60

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (chartWidth - padding * 2)
    const y = chartHeight - padding - (d.amount / maxVal) * (chartHeight - padding * 2)
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  const areaD = `${pathD} L ${chartWidth - padding},${chartHeight - padding} L ${padding},${chartHeight - padding} Z`

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="none">
      {/* Area fill */}
      <motion.path
        d={areaD}
        fill="url(#lineGradient)"
        opacity={0.15}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
      {/* Line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
      />
      {/* Dots */}
      {data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * (chartWidth - padding * 2)
        const y = chartHeight - padding - (d.amount / maxVal) * (chartHeight - padding * 2)
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={3.5}
            fill="white"
            stroke="#10b981"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1, type: 'spring' as const, stiffness: 300, damping: 18 }}
          />
        )
      })}
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function SpendingTracker() {
  const data = useMemo(() => MOCK_SPENDING, [])
  const animatedTotal = useAnimatedCounter(data.totalThisMonth)
  const animatedSavings = useAnimatedCounter(data.savings)

  const budgetPercentage = Math.round((data.totalThisMonth / data.budget) * 100)
  const maxCategoryAmount = Math.max(...data.categories.map((c) => c.amount))

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 r62-card-lift r95-spending-card"
    >
      {/* ── Header with total + comparison ── */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl p-4 border border-border/50">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">Gastos este mês</p>
            <motion.span
              className="text-2xl sm:text-3xl font-extrabold text-foreground"
            >
              {formatBRL(animatedTotal)}
            </motion.span>
          </div>

          {/* Comparison to last month */}
          <motion.div
            variants={itemVariants}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold ${
              data.changePercent < 0
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            {data.changePercent < 0 ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5" />
            )}
            {Math.abs(data.changePercent)}% vs mês anterior
          </motion.div>
        </div>

        {/* Savings highlight */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring' as const, stiffness: 300, damping: 20 }}
          className="mt-3 flex items-center gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl p-2.5 border border-emerald-500/10"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0"
          >
            <PiggyBank className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <div>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              Você economizou {formatBRL(animatedSavings)} este mês! 🎉
            </p>
            <p className="text-[10px] text-muted-foreground">Aproveitando comparePrice e ofertas</p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Budget ring + category bars side by side ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Budget progress ring */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl p-4 border border-border/50 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3 self-start">
            <Award className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold">Orçamento</h3>
          </div>
          <ProgressRing percentage={budgetPercentage} />
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">
              {formatBRL(data.totalThisMonth)} de {formatBRL(data.budget)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Restam {formatBRL(Math.max(0, data.budget - data.totalThisMonth))}
            </p>
          </div>
        </motion.div>

        {/* Category spending bars */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold">Por Categoria</h3>
          </div>
          <div className="space-y-2.5">
            {data.categories.map((cat, idx) => {
              const widthPct = maxCategoryAmount > 0 ? cat.amount / maxCategoryAmount : 0
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{categoryIcons[cat.category] || '📦'}</span>
                      <span className="text-[11px] font-medium">{categoryLabels[cat.category] || cat.category}</span>
                    </div>
                    <span className="text-[11px] font-bold">{formatBRL(cat.amount)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${categoryColors[cat.category] || 'from-gray-400 to-gray-500'}`}
                      custom={widthPct}
                      variants={barVariants}
                      initial="hidden"
                      animate="visible"
                      style={{ transformOrigin: 'left' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Weekly spending mini chart ── */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl p-4 border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold">Gastos Semanais</h3>
          </div>
          <div className="flex items-center gap-1">
            {data.weekly.map((w, i) => (
              <span key={i} className="text-[9px] text-muted-foreground font-medium px-1">
                {w.week}
              </span>
            ))}
          </div>
        </div>
        <MiniLineChart data={data.weekly} />
        <div className="flex items-center justify-between mt-2">
          {data.weekly.map((w, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[10px] font-semibold">{formatBRL(w.amount)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Top 3 stores ── */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl p-4 border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold">Lojas Mais Compradas</h3>
        </div>
        <div className="space-y-2">
          {data.topStores.map((store, idx) => (
            <motion.div
              key={store.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1, type: 'spring' as const, stiffness: 300, damping: 20 }}
              className="flex items-center gap-3 p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                idx === 0 ? 'bg-amber-500/10 text-amber-600' : idx === 1 ? 'bg-slate-500/10 text-slate-600' : 'bg-orange-500/10 text-orange-600'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{store.name}</p>
                <p className="text-[10px] text-muted-foreground">{store.orders} pedidos</p>
              </div>
              <span className="text-xs font-bold text-primary">{formatBRL(store.amount)}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Export button ── */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 border-border/50 hover:bg-muted"
          onClick={() => {
            // Placeholder for future export functionality
          }}
        >
          <Download className="h-3.5 w-3.5" />
          Exportar Relatório
        </Button>
      </motion.div>
    </motion.div>
  )
}
