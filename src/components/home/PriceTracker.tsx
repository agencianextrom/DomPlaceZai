'use client'

import { useState, useEffect, useCallback, useSyncExternalStore, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingDown,
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
  Plus,
  Bell,
  BellOff,
  Search,
  Store,
  Tag,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react'
import { cachedFetch } from '@/lib/cached-fetch'

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface TrackedItem {
  id: string
  productName: string
  storeName: string
  currentPrice: number
  targetPrice: number
  lowestPrice: number
  highestPrice: number
  priceHistory: number[]
  lastUpdated: string
}

interface MonthlyPrice {
  month: string
  price: number
}

// ──────────────────────────────────────────────────────────
// Fallback data
// ──────────────────────────────────────────────────────────

const FALLBACK_TRACKED_ITEMS: TrackedItem[] = [
  {
    id: 'item-1',
    productName: 'Arroz 5kg',
    storeName: 'Supermercado Bom Preço',
    currentPrice: 24.9,
    targetPrice: 22.0,
    lowestPrice: 21.5,
    highestPrice: 28.9,
    priceHistory: [28.9, 27.5, 26.9, 25.9, 24.9, 24.5, 24.9],
    lastUpdated: '2025-01-15T10:30:00',
  },
  {
    id: 'item-2',
    productName: 'Feijão Preto 1kg',
    storeName: 'Mercado do Zé',
    currentPrice: 7.9,
    targetPrice: 6.5,
    lowestPrice: 6.9,
    highestPrice: 9.9,
    priceHistory: [9.9, 9.5, 8.9, 8.5, 8.2, 7.9, 7.9],
    lastUpdated: '2025-01-15T09:15:00',
  },
  {
    id: 'item-3',
    productName: 'Leite 1L',
    storeName: 'Padaria Nova',
    currentPrice: 5.5,
    targetPrice: 4.9,
    lowestPrice: 4.9,
    highestPrice: 6.49,
    priceHistory: [6.49, 6.2, 5.99, 5.8, 5.6, 5.5, 5.5],
    lastUpdated: '2025-01-15T11:00:00',
  },
  {
    id: 'item-4',
    productName: 'Frango kg',
    storeName: 'Açougue Seu João',
    currentPrice: 16.9,
    targetPrice: 14.0,
    lowestPrice: 15.9,
    highestPrice: 22.9,
    priceHistory: [22.9, 20.5, 19.9, 18.5, 17.9, 17.2, 16.9],
    lastUpdated: '2025-01-14T16:45:00',
  },
  {
    id: 'item-5',
    productName: 'Detergente 500ml',
    storeName: 'Mini Box',
    currentPrice: 3.29,
    targetPrice: 2.5,
    lowestPrice: 2.99,
    highestPrice: 4.5,
    priceHistory: [4.5, 4.2, 3.99, 3.79, 3.49, 3.29, 3.29],
    lastUpdated: '2025-01-15T08:20:00',
  },
  {
    id: 'item-6',
    productName: 'Café 500g',
    storeName: 'Atacadão',
    currentPrice: 18.9,
    targetPrice: 15.0,
    lowestPrice: 16.9,
    highestPrice: 24.9,
    priceHistory: [24.9, 23.5, 22.9, 21.5, 20.5, 19.5, 18.9],
    lastUpdated: '2025-01-13T14:30:00',
  },
]

// ──────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────

const STORAGE_KEY_ITEMS = 'r76-tracked-items'
const STORAGE_KEY_NOTIFICATIONS = 'r76-notifications-enabled'
const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function calcPriceChangePercent(history: number[]): number {
  if (history.length < 2) return 0
  const oldest = history[0]
  const newest = history[history.length - 1]
  if (oldest === 0) return 0
  return ((newest - oldest) / oldest) * 100
}

function getStatusLabel(current: number, target: number): {
  label: string
  color: string
} {
  if (current <= target) return { label: 'Na meta!', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' }
  const ratio = current / target
  if (ratio <= 1.1) return { label: 'Quase lá', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' }
  return { label: 'Aguardando', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
}

function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function generateMonthlyHistory(current: number, lowest: number, highest: number): MonthlyPrice[] {
  const now = new Date()
  const months: MonthlyPrice[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = MONTHS_PT[d.getMonth()]
    const spread = highest - lowest
    const noise = spread > 0 ? Math.random() * spread : 0
    const price = lowest + noise
    months.push({ month: label, price: Math.round(price * 100) / 100 })
  }
  months[months.length - 1].price = current
  return months
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch { /* ignore */ }
  return fallback
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* ignore */ }
}

// ──────────────────────────────────────────────────────────
// SVG Sparkline sub-component
// ──────────────────────────────────────────────────────────

function SparklineChart({ data, isDrop }: { data: number[]; isDrop: boolean }) {
  const width = 120
  const height = 36
  const padding = 2

  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((val - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const strokeColor = isDrop ? '#10b981' : '#ef4444'
  const fillColor = isDrop ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'
  const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)
  const lastY = height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2)

  const areaPoints = points.join(' ') + ` L${lastX},${height} L${padding},${height} Z`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="r76-sparkline"
      aria-label="Gráfico de tendência de preço"
      role="img"
    >
      <path d={areaPoints} fill={fillColor} />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={3} fill={strokeColor} />
    </svg>
  )
}

// ──────────────────────────────────────────────────────────
// SVG Bar Chart sub-component
// ──────────────────────────────────────────────────────────

function PriceHistoryBarChart({ item }: { item: TrackedItem }) {
  const monthlyData = generateMonthlyHistory(item.currentPrice, item.lowestPrice, item.highestPrice)
  const avgPrice = monthlyData.reduce((s, m) => s + m.price, 0) / monthlyData.length

  const chartWidth = 600
  const chartHeight = 280
  const padLeft = 60
  const padRight = 20
  const padTop = 20
  const padBottom = 40
  const innerWidth = chartWidth - padLeft - padRight
  const innerHeight = chartHeight - padTop - padBottom

  const maxVal = Math.max(...monthlyData.map((m) => m.price)) * 1.1
  const minVal = Math.min(...monthlyData.map((m) => m.price)) * 0.9
  const valRange = maxVal - minVal || 1

  const barWidth = innerWidth / monthlyData.length * 0.6
  const gap = innerWidth / monthlyData.length

  const avgY = padTop + innerHeight - ((avgPrice - minVal) / valRange) * innerHeight

  return (
    <div className="r76-chart w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full min-w-[400px]"
        role="img"
        aria-label="Histórico de preços em gráfico de barras"
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines & labels */}
        {Array.from({ length: 5 }).map((_, i) => {
          const yVal = minVal + (valRange * (4 - i)) / 4
          const y = padTop + innerHeight - ((yVal - minVal) / valRange) * innerHeight
          return (
            <g key={`grid-${i}`}>
              <line
                x1={padLeft}
                y1={y}
                x2={chartWidth - padRight}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-gray-500"
                fontSize={11}
              >
                {formatBRL(yVal)}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {monthlyData.map((d, i) => {
          const x = padLeft + i * gap + (gap - barWidth) / 2
          const barH = ((d.price - minVal) / valRange) * innerHeight
          const y = padTop + innerHeight - barH
          return (
            <g key={`bar-${i}`}>
              <rect x={x} y={y} width={barWidth} height={barH} rx={4} fill="url(#barGradient)" />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-gray-700"
                fontSize={10}
                fontWeight={600}
              >
                {formatBRL(d.price)}
              </text>
              <text
                x={x + barWidth / 2}
                y={padTop + innerHeight + 20}
                textAnchor="middle"
                className="fill-gray-600"
                fontSize={12}
              >
                {d.month}
              </text>
            </g>
          )
        })}

        {/* Average line (dashed) */}
        <line
          x1={padLeft}
          y1={avgY}
          x2={chartWidth - padRight}
          y2={avgY}
          stroke="#8b5cf6"
          strokeWidth={2}
          strokeDasharray="8 4"
        />
        <text
          x={chartWidth - padRight - 4}
          y={avgY - 6}
          textAnchor="end"
          className="fill-violet-600"
          fontSize={11}
          fontWeight={600}
        >
          Média: {formatBRL(avgPrice)}
        </text>

        {/* Target line */}
        {(() => {
          const targetY = padTop + innerHeight - ((item.targetPrice - minVal) / valRange) * innerHeight
          if (targetY < padTop || targetY > padTop + innerHeight) return null
          return (
            <g>
              <line
                x1={padLeft}
                y1={targetY}
                x2={chartWidth - padRight}
                y2={targetY}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="6 3"
              />
              <text
                x={padLeft + 4}
                y={targetY - 6}
                className="fill-emerald-600"
                fontSize={11}
                fontWeight={600}
              >
                Meta: {formatBRL(item.targetPrice)}
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// StatCard sub-component
// ──────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  emoji,
}: {
  icon: React.ReactNode
  label: string
  value: string
  emoji: string
}) {
  return (
    <div className="r76-stat-card rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex items-center gap-3">
      <span className="text-2xl shrink-0" aria-hidden="true">{emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{value}</p>
      </div>
      <div className="shrink-0">{icon}</div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────

export default function PriceTracker() {
  // Reduced motion
  const prefersReduced = useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia('(prefers-reduced-motion: reduce)')
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  )

  // Animation helper
  const fadeIn = prefersReduced ? undefined : { opacity: 0, y: 20 }
  const fadeInActive = prefersReduced ? {} : { opacity: 1, y: 0 }
  const springTransition = prefersReduced ? undefined : { type: 'spring' as const, stiffness: 260, damping: 24 }

  const cardInitial = prefersReduced ? {} : { opacity: 0, y: 16 }
  const cardAnimate = prefersReduced ? {} : { opacity: 1, y: 0 }
  const cardExit = prefersReduced ? {} : { opacity: 0, scale: 0.95 }
  const cardTransition = prefersReduced ? undefined : { type: 'spring' as const, stiffness: 280, damping: 22 }

  const staggerContainer = prefersReduced
    ? undefined
    : { animate: { transition: { staggerChildren: 0.07 } } }

  // ── State ────────────────────────────────────────────────

  const [items, setItems] = useState<TrackedItem[]>(() =>
    loadFromStorage<TrackedItem[]>(STORAGE_KEY_ITEMS, FALLBACK_TRACKED_ITEMS)
  )

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() =>
    loadFromStorage<boolean>(STORAGE_KEY_NOTIFICATIONS, false)
  )

  const [formData, setFormData] = useState({
    productName: '',
    storeName: '',
    currentPrice: '',
    targetPrice: '',
  })

  // ── Persistence ──────────────────────────────────────────

  useEffect(() => {
    saveToStorage(STORAGE_KEY_ITEMS, items)
  }, [items])

  useEffect(() => {
    saveToStorage(STORAGE_KEY_NOTIFICATIONS, notificationsEnabled)
  }, [notificationsEnabled])

  // ── Simulate price fetch ─────────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return
    const interval = setInterval(() => {
      cachedFetch<TrackedItem[]>('/api/products?XTransformPort=3000', {}).catch(() => null)
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  // ── Derived data ─────────────────────────────────────────

  const trackedCount = items.length

  const biggestDrop = items.reduce((best, item) => {
    const pct = calcPriceChangePercent(item.priceHistory)
    return pct < best ? pct : best
  }, 0)

  const targetReachedCount = items.filter((i) => i.currentPrice <= i.targetPrice).length

  const totalSavings = items.reduce((sum, item) => {
    const savings = item.highestPrice - item.currentPrice
    return sum + Math.max(0, savings)
  }, 0)

  const selectedItem = items.find((i) => i.id === selectedItemId) ?? null

  const alertItems = items.filter((item) => {
    const diff = (item.currentPrice - item.targetPrice) / item.targetPrice
    return diff <= 0.15 && item.currentPrice > item.targetPrice
  })

  // ── Handlers ─────────────────────────────────────────────

  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    if (selectedItemId === id) setSelectedItemId(null)
  }, [selectedItemId])

  const handleUpdateTarget = useCallback((id: string, newTarget: string) => {
    const val = parseFloat(newTarget)
    if (isNaN(val) || val <= 0) return
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, targetPrice: val } : i))
    )
  }, [])

  const handleToggleNotifications = useCallback(() => {
    setNotificationsEnabled((prev) => !prev)
  }, [])

  const handleFormChange = useCallback((field: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }, [])

  const handleAddItem = useCallback(() => {
    const price = parseFloat(formData.currentPrice)
    const target = parseFloat(formData.targetPrice)
    if (!formData.productName.trim() || isNaN(price) || price <= 0 || isNaN(target) || target <= 0) return

    const newItem: TrackedItem = {
      id: generateId(),
      productName: formData.productName.trim(),
      storeName: formData.storeName.trim() || 'Loja não informada',
      currentPrice: price,
      targetPrice: target,
      lowestPrice: price,
      highestPrice: price,
      priceHistory: [price, price, price, price, price, price, price],
      lastUpdated: new Date().toISOString(),
    }

    setItems((prev) => [newItem, ...prev])
    setFormData({ productName: '', storeName: '', currentPrice: '', targetPrice: '' })
    setShowAddForm(false)
  }, [formData])

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItemId((prev) => (prev === id ? null : id))
  }, [])

  // ──────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────

  return (
    <section className="r62-card-lift w-full max-w-5xl mx-auto px-4 py-6 space-y-8" aria-label="Rastreador de Preços">

      {/* ── 1. Header ──────────────────────────────────────── */}
      <motion.div
        initial={fadeIn}
        animate={fadeInActive}
        transition={springTransition}
        style={{ transformOrigin: 'top center' }}
      >
        <h1 className="r62-heading-gradient text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
          Rastreador de Preços
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Monitore preços e economize nas suas compras
        </p>
      </motion.div>

      {/* ── 2. Stats Bar ──────────────────────────────────── */}
      <motion.div
        initial={fadeIn}
        animate={fadeInActive}
        transition={springTransition}
        style={{ transformOrigin: 'top center' }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
      >
        <StatCard
          icon={<BarChart3 className="w-5 h-5 text-amber-600" />}
          label="Itens rastreados"
          value={String(trackedCount)}
          emoji="📊"
        />
        <StatCard
          icon={<TrendingDown className="w-5 h-5 text-emerald-600" />}
          label="Maior queda"
          value={`${biggestDrop.toFixed(1)}%`}
          emoji="📉"
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-orange-600" />}
          label="Meta atingida"
          value={String(targetReachedCount)}
          emoji="🎯"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-violet-600" />}
          label="Economia total"
          value={formatBRL(totalSavings)}
          emoji="💰"
        />
      </motion.div>

      {/* ── 3. Add Item Button + Expandable Form ──────────── */}
      <div className="r76-add-form space-y-3">
        <motion.div
          initial={fadeIn}
          animate={fadeInActive}
          transition={springTransition}
          style={{ transformOrigin: 'top center' }}
        >
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors w-full sm:w-auto justify-center"
            aria-expanded={showAddForm}
            aria-controls="add-item-form"
          >
            <Plus className="w-5 h-5" />
            Adicionar Produto
            {showAddForm
              ? <ChevronUp className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />}
          </button>
        </motion.div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              id="add-item-form"
              initial={cardInitial}
              animate={cardAnimate}
              exit={cardExit}
              transition={cardTransition}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-6 space-y-4"
              style={{ transformOrigin: 'top center' }}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Novo Rastreamento</h3>

              {/* Product name */}
              <div className="flex items-center gap-2 min-h-[44px]">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Nome do produto"
                  value={formData.productName}
                  onChange={handleFormChange('productName')}
                  className="flex-1 min-h-[44px] px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Store name */}
              <div className="flex items-center gap-2 min-h-[44px]">
                <Store className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Nome da loja"
                  value={formData.storeName}
                  onChange={handleFormChange('storeName')}
                  className="flex-1 min-h-[44px] px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Price inputs row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 min-h-[44px]">
                  <Tag className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Preço atual"
                    value={formData.currentPrice}
                    onChange={handleFormChange('currentPrice')}
                    className="flex-1 min-h-[44px] px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex items-center gap-2 min-h-[44px]">
                  <Target className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Preço meta"
                    value={formData.targetPrice}
                    onChange={handleFormChange('targetPrice')}
                    className="flex-1 min-h-[44px] px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-2 min-h-[44px]">
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={
                    !formData.productName.trim() ||
                    isNaN(parseFloat(formData.currentPrice)) ||
                    isNaN(parseFloat(formData.targetPrice))
                  }
                  className="min-h-[44px] min-w-[44px] px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                >
                  Rastrear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 4. Tracked Items Grid ─────────────────────────── */}
      <div>
        <motion.h2
          initial={fadeIn}
          animate={fadeInActive}
          transition={springTransition}
          style={{ transformOrigin: 'top center' }}
          className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4"
        >
          Produtos Rastreados
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          initial={fadeIn}
          animate={fadeInActive}
          transition={springTransition}
          style={{ transformOrigin: 'top center' }}
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const pctChange = calcPriceChangePercent(item.priceHistory)
              const isDrop = pctChange < 0
              const status = getStatusLabel(item.currentPrice, item.targetPrice)
              const progressPct = Math.min(
                100,
                Math.max(0, ((item.highestPrice - item.currentPrice) / (item.highestPrice - item.targetPrice || 1)) * 100)
              )
              const isSelected = selectedItemId === item.id

              return (
                <motion.article
                  key={item.id}
                  initial={cardInitial}
                  animate={cardAnimate}
                  exit={cardExit}
                  transition={cardTransition}
                  layout={!prefersReduced}
                  className={`r76-tracked-card rounded-xl border p-4 sm:p-5 space-y-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-200 dark:ring-amber-800 bg-amber-50 dark:bg-gray-800'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleSelectItem(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSelectItem(item.id) }}
                  aria-label={`Rastrear ${item.productName}`}
                >
                  {/* Product name + store */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate text-base">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {item.storeName}
                      </p>
                    </div>
                    <Eye className="w-5 h-5 text-gray-400 shrink-0" />
                  </div>

                  {/* Current + lowest price */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                        {formatBRL(item.currentPrice)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Menor já: {formatBRL(item.lowestPrice)}
                      </p>
                    </div>

                    {/* Price change indicator */}
                    <div className={`r76-price-change flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold ${
                      isDrop
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                        : 'text-red-600 bg-red-50 dark:bg-red-950'
                    }`}>
                      {isDrop
                        ? <TrendingDown className="w-4 h-4" />
                        : <TrendingUp className="w-4 h-4" />}
                      <span>{isDrop ? '' : '+'}{pctChange.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="flex justify-center">
                    <SparklineChart data={item.priceHistory} isDrop={isDrop} />
                  </div>

                  {/* Target price input */}
                  <div className="flex items-center gap-2 min-h-[44px]">
                    <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Meta: R$
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.targetPrice}
                      onChange={(e) => handleUpdateTarget(item.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="flex-1 min-h-[44px] px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      aria-label={`Preço meta para ${item.productName}`}
                    />
                  </div>

                  {/* Progress bar */}
                  <div className="r76-target-progress space-y-1">
                    <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: item.currentPrice <= item.targetPrice ? '#10b981' : '#f59e0b',
                          transformOrigin: 'left center',
                        }}
                        initial={!prefersReduced ? { width: 0 } : undefined}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                      {progressPct.toFixed(0)}% do caminho
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center justify-between">
                    <span className={`r76-status-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${status.color}`}>
                      {status.label}
                    </span>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveItem(item.id)
                      }}
                      className="r76-remove-btn flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      aria-label={`Remover ${item.productName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Last updated */}
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Atualizado: {new Date(item.lastUpdated).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── 5. Price History Chart ────────────────────────── */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={fadeIn}
            animate={fadeInActive}
            exit={cardExit}
            transition={springTransition}
            className="space-y-4"
            style={{ transformOrigin: 'top center' }}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Histórico de Preços
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                — {selectedItem.productName}
              </span>
            </div>

            <div className="r76-chart rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-6">
              <PriceHistoryBarChart item={selectedItem} />

              {/* Chart legend */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-b from-amber-400 to-orange-600" />
                  Preço mensal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 border-t-2 border-dashed border-violet-500" />
                  Preço médio
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 border-t-2 border-dashed border-emerald-500" />
                  Meta
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 6. Alerts Section ─────────────────────────────── */}
      <div className="space-y-4">
        <motion.div
          initial={fadeIn}
          animate={fadeInActive}
          transition={springTransition}
          style={{ transformOrigin: 'top center' }}
          className="flex items-center justify-between"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Alertas Ativos
          </h2>
          <button
            type="button"
            onClick={handleToggleNotifications}
            className={`flex items-center gap-2 min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              notificationsEnabled
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
            aria-label={notificationsEnabled ? 'Desativar notificações' : 'Ativar notificação'}
          >
            {notificationsEnabled
              ? <Bell className="w-4 h-4" />
              : <BellOff className="w-4 h-4" />}
            {notificationsEnabled ? 'Notificado' : 'Ativar notificação'}
          </button>
        </motion.div>

        {alertItems.length === 0 ? (
          <motion.div
            initial={fadeIn}
            animate={fadeInActive}
            transition={springTransition}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 text-center"
            style={{ transformOrigin: 'top center' }}
          >
            <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Nenhum alerta ativo no momento. Os alertas aparecem quando os preços estão próximos da meta.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={fadeIn}
            animate={fadeInActive}
            transition={springTransition}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            style={{ transformOrigin: 'top center' }}
          >
            <AnimatePresence mode="popLayout">
              {alertItems.map((item) => {
                const diffFromTarget = item.currentPrice - item.targetPrice
                const pctFromTarget = ((item.currentPrice - item.targetPrice) / item.targetPrice) * 100
                const isClose = pctFromTarget <= 5

                return (
                  <motion.div
                    key={item.id}
                    initial={cardInitial}
                    animate={cardAnimate}
                    exit={cardExit}
                    transition={cardTransition}
                    layout={!prefersReduced}
                    className={`r76-alert-card rounded-xl border p-4 space-y-2 ${
                      isClose
                        ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950'
                        : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
                        {item.productName}
                      </h4>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isClose
                          ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200'
                          : 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200'
                      }`}>
                        {pctFromTarget.toFixed(1)}% da meta
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Atual: </span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {formatBRL(item.currentPrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Meta: </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatBRL(item.targetPrice)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Faltam <strong>{formatBRL(Math.max(0, diffFromTarget))}</strong> para atingir a meta
                    </p>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {!notificationsEnabled && alertItems.length > 0 && (
          <motion.p
            initial={fadeIn}
            animate={fadeInActive}
            transition={springTransition}
            className="text-xs text-amber-600 dark:text-amber-400 text-center"
            style={{ transformOrigin: 'top center' }}
          >
            Ative as notificações para receber alertas quando os preços atingirem suas metas.
          </motion.p>
        )}
      </div>
    </section>
  )
}
