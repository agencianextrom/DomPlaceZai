'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingDown, Bell, Search, Plus, Check, Clock, ArrowUpDown,
  ChevronDown, Zap, ShoppingBag, Heart, ShoppingCart, Sparkles,
  BarChart3, Flame, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cachedFetch } from '@/lib/api-cache'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { formatBRL, CategoryIcon } from '@/components/product/ProductCard'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
interface TrackedAlert {
  id: string
  product: ProductData
  oldPrice: number
  newPrice: number
  savings: number
  percentage: number
  detectedAt: number // timestamp ms
  trend: number[] // last 5 data points for sparkline
  isNew: boolean
}

type FilterTab = 'all' | 'today' | 'week' | 'biggest'
type SortOption = 'savings' | 'percentage' | 'recent'

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'r59-price-alert-tracked'

function getDropColor(pct: number): { text: string; bg: string; border: string; glow: string } {
  if (pct >= 30) return {
    text: '#dc2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.2)',
    glow: 'rgba(220,38,38,0.25)',
  }
  if (pct >= 20) return {
    text: '#ea580c', bg: 'rgba(234,88,12,0.1)', border: 'rgba(234,88,12,0.2)',
    glow: 'rgba(234,88,12,0.2)',
  }
  if (pct >= 10) return {
    text: '#ca8a04', bg: 'rgba(202,138,4,0.1)', border: 'rgba(202,138,4,0.2)',
    glow: 'rgba(202,138,4,0.2)',
  }
  return {
    text: '#16a34a', bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.2)',
    glow: 'rgba(22,163,74,0.2)',
  }
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Detectado há ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Detectado há ${hrs} ${hrs === 1 ? 'hora' : 'horas'}`
  const days = Math.floor(hrs / 24)
  return `Detectado há ${days} ${days === 1 ? 'dia' : 'dias'}`
}

function generateSparkline(oldP: number, newP: number): number[] {
  const points: number[] = []
  const range = oldP - newP
  for (let i = 0; i < 5; i++) {
    const t = i / 4
    const base = oldP - range * t
    const noise = (Math.random() - 0.5) * range * 0.15
    points.push(Math.round((base + noise) * 100) / 100)
  }
  points[4] = newP // ensure last point is current price
  return points
}

function loadTrackedFromStorage(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveTrackedToStorage(ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore
  }
}

/* ═══════════════════════════════════════════════════════════════
   Animation variants
   ═══════════════════════════════════════════════════════════════ */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 },
  },
  exit: { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.2 } },
}

const headerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } },
}

/* ═══════════════════════════════════════════════════════════════
   Sparkline SVG
   ═══════════════════════════════════════════════════════════════ */
function SparklineChart({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 64
  const h = 24
  const step = w / (data.length - 1)

  const pathD = data
    .map((v, i) => {
      const x = (i * step).toFixed(1)
      const y = (h - ((v - min) / range) * (h - 4) - 2).toFixed(1)
      return `${i === 0 ? 'M' : 'L'} ${x},${y}`
    })
    .join(' ')

  const isDown = data[data.length - 1] < data[0]
  const color = isDown ? '#ef4444' : '#22c55e'
  const gradId = `r59-spark-${Math.random().toString(36).slice(2, 6)}`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${pathD} L ${w},${h} L 0,${h} Z`} fill={`url(#${gradId})`} />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Savings Badge — green glow pulse
   ═══════════════════════════════════════════════════════════════ */
function SavingsBadge({ savings }: { savings: number }) {
  return (
    <motion.div
      initial={{ scale: 0, x: -8 }}
      animate={{ scale: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.25 }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border relative overflow-hidden"
      style={{
        backgroundColor: 'rgba(22,163,74,0.12)',
        color: '#16a34a',
        borderColor: 'rgba(22,163,74,0.25)',
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(22,163,74,0)',
            '0 0 8px 2px rgba(22,163,74,0.3)',
            '0 0 0 0 rgba(22,163,74,0)',
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="relative z-10">Economia de {formatBRL(savings)}</span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Percentage Badge
   ═══════════════════════════════════════════════════════════════ */
function PercentageBadge({ percentage }: { percentage: number }) {
  const colors = getDropColor(percentage)
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 500, damping: 12, delay: 0.15 }}
      className="flex items-center justify-center h-9 w-9 rounded-xl shrink-0 relative"
      style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
    >
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{
          boxShadow: [
            `0 0 0 0 ${colors.glow}`,
            `0 0 0 5px transparent`,
            `0 0 0 0 ${colors.glow}`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="text-xs font-extrabold relative z-10" style={{ color: colors.text }}>
        -{percentage}%
      </span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Price Drop Animation
   ═══════════════════════════════════════════════════════════════ */
function PriceDropAnimation({ oldPrice, newPrice }: { oldPrice: number; newPrice: number }) {
  return (
    <div className="flex items-baseline gap-2">
      {/* Old price with strikethrough animation */}
      <motion.span
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="text-xs text-muted-foreground relative"
      >
        {formatBRL(oldPrice)}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.3 }}
          className="absolute left-0 top-1/2 h-[1.5px] w-full origin-left"
          style={{ backgroundColor: 'rgba(239,68,68,0.7)' }}
        />
      </motion.span>
      {/* New price bouncing in */}
      <motion.span
        initial={{ opacity: 0, scale: 0.5, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.2 }}
        className="text-sm font-bold text-primary"
      >
        {formatBRL(newPrice)}
      </motion.span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Tracked Button
   ═══════════════════════════════════════════════════════════════ */
function TrackButton({ productId, isTracked, onTrack }: {
  productId: string
  isTracked: boolean
  onTrack: (id: string) => void
}) {
  const [added, setAdded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = () => {
    onTrack(productId)
    setAdded(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setAdded(false), 1800)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <motion.div whileTap={{ scale: 0.92 }}>
      <button
        onClick={handleClick}
        className="flex items-center gap-1 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-semibold transition-colors relative overflow-hidden"
        style={{
          backgroundColor: isTracked || added
            ? 'rgba(22,163,74,0.12)'
            : 'rgba(0,0,0,0.04)',
          color: isTracked || added ? '#16a34a' : '#6b7280',
          border: isTracked || added
            ? '1px solid rgba(22,163,74,0.25)'
            : '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <AnimatePresence mode="wait">
          {(isTracked || added) ? (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.25 }}
              className="inline-flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              Rastreado
            </motion.span>
          ) : (
            <motion.span
              key="plus"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Rastrear
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Price Drop Card
   ═══════════════════════════════════════════════════════════════ */
function PriceDropCard({ alert, isTracked, onTrack }: {
  alert: TrackedAlert
  isTracked: boolean
  onTrack: (id: string) => void
}) {
  const { toggleFavoriteProduct, isFavoriteProduct, addToCart } = useAppStore()
  const { product, oldPrice, newPrice, savings, percentage, detectedAt, trend, isNew } = alert
  const colors = getDropColor(percentage)
  const isFav = isFavoriteProduct(product.id)

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.08)' }}
      className="relative overflow-hidden rounded-xl cursor-pointer group"
      style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(255,255,255,0.5) 100%)`,
        border: `1px solid ${colors.border}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Decorative gradient overlay */}
      <div
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${colors.glow} 0%, transparent 70%)` }}
      />

      {/* New alert pulse */}
      {isNew && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-2 right-2 z-20"
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colors.text, boxShadow: `0 0 6px ${colors.glow}` }}
          />
        </motion.div>
      )}

      <div className="relative z-10 p-3">
        <div className="flex gap-3">
          {/* Left: percentage badge */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
            <PercentageBadge percentage={percentage} />
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-base"
            >
              📉
            </motion.div>
          </div>

          {/* Center: product info */}
          <div className="flex-1 min-w-0">
            {/* Store */}
            <p className="text-[10px] text-muted-foreground truncate">{product.storeName}</p>
            {/* Name */}
            <h4 className="text-xs font-semibold line-clamp-1 mt-0.5 group-hover:text-primary transition-colors">
              {product.name}
            </h4>

            {/* Price animation */}
            <div className="mt-1.5">
              <PriceDropAnimation oldPrice={oldPrice} newPrice={newPrice} />
            </div>

            {/* Savings badge */}
            <div className="mt-1.5">
              <SavingsBadge savings={savings} />
            </div>

            {/* Time + Sparkline row */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">{formatTimeAgo(detectedAt)}</span>
              </div>
              <SparklineChart data={trend} />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 mt-2">
              <TrackButton productId={product.id} isTracked={isTracked} onTrack={onTrack} />
              <motion.div whileTap={{ scale: 0.92 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavoriteProduct(product.id)
                  }}
                  className="h-7 flex-1 min-h-[44px] rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  style={{
                    backgroundColor: isFav ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.04)',
                    color: isFav ? '#ef4444' : '#6b7280',
                    border: `1px solid ${isFav ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.08)'}`,
                  }}
                >
                  <Heart className={`h-3 w-3 ${isFav ? 'fill-current' : ''}`} />
                  Lista
                </button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.92 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    addToCart(product, product.storeName || 'Loja')
                  }}
                  className="h-7 flex-1 min-h-[44px] rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  style={{
                    backgroundColor: 'rgba(22,163,74,0.08)',
                    color: '#16a34a',
                    border: '1px solid rgba(22,163,74,0.18)',
                  }}
                >
                  <ShoppingCart className="h-3 w-3" />
                  Carrinho
                </button>
              </motion.div>
            </div>
          </div>

          {/* Right: product image */}
          <motion.div
            className="h-14 w-14 rounded-xl shrink-0 flex items-center justify-center overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))' }}
            whileHover={{ scale: 1.05 }}
          >
            <CategoryIcon category={product.category} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Filter Tabs
   ═══════════════════════════════════════════════════════════════ */
function FilterTabs({ active, onChange }: { active: FilterTab; onChange: (t: FilterTab) => void }) {
  const tabs: { key: FilterTab; label: string; icon: typeof Eye }[] = [
    { key: 'all', label: 'Todos', icon: Eye },
    { key: 'today', label: 'Hoje', icon: Zap },
    { key: 'week', label: 'Esta Semana', icon: BarChart3 },
    { key: 'biggest', label: 'Maiores Quedas', icon: Flame },
  ]

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
      {tabs.map((tab) => (
        <motion.button
          key={tab.key}
          whileTap={{ scale: 0.96 }}
          onClick={() => onChange(tab.key)}
          className="relative z-10 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
          style={{ color: active === tab.key ? '#ffffff' : '#6b7280' }}
        >
          {active === tab.key && (
            <motion.div
              layoutId="r59-tab-indicator"
              className="absolute inset-0 rounded-lg"
              style={{
                backgroundColor: '#ef4444',
                boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
              }}
              transition={{ type: 'spring' as const, stiffness: 350, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1">
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </span>
        </motion.button>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Sort Dropdown
   ═══════════════════════════════════════════════════════════════ */
function SortDropdown({ active, onChange }: { active: SortOption; onChange: (o: SortOption) => void }) {
  const [open, setOpen] = useState(false)
  const options: { key: SortOption; label: string }[] = [
    { key: 'savings', label: 'Economia (R$)' },
    { key: 'percentage', label: 'Desconto (%)' },
    { key: 'recent', label: 'Mais Recente' },
  ]

  return (
    <div className="relative">
      <motion.div whileTap={{ scale: 0.95 }}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          style={{ border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <ArrowUpDown className="h-3 w-3" />
          Ordenar
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="absolute right-0 top-full mt-1 z-50 rounded-xl p-1.5 min-w-[150px]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.98)',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            {options.map((opt) => (
              <motion.button
                key={opt.key}
                whileTap={{ scale: 0.97 }}
                onClick={() => { onChange(opt.key); setOpen(false) }}
                className="flex items-center w-full px-2.5 py-2 rounded-lg text-[11px] font-medium transition-colors"
                style={{
                  backgroundColor: active === opt.key ? 'rgba(239,68,68,0.08)' : 'transparent',
                  color: active === opt.key ? '#dc2626' : '#374151',
                }}
              >
                {opt.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════ */
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Empty State with magnifying glass animation
   ═══════════════════════════════════════════════════════════════ */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
      >
        <Search className="h-7 w-7" style={{ color: '#ef4444' }} />
      </motion.div>
      <h3 className="text-sm font-bold text-foreground">Nenhuma queda detectada</h3>
      <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
        Estamos monitorando os preços! Quedas de preço aparecerão aqui automaticamente.
      </p>
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="mt-4"
      >
        <Sparkles className="h-5 w-5" style={{ color: 'rgba(239,68,68,0.4)' }} />
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — PriceDropAlerts2
   ═══════════════════════════════════════════════════════════════ */
export function PriceDropAlerts2() {
  const [alerts, setAlerts] = useState<TrackedAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [sort, setSort] = useState<SortOption>('savings')
  const [trackedIds, setTrackedIds] = useState<string[]>([])

  // Load tracked IDs from localStorage on mount
  useEffect(() => {
    setTrackedIds(loadTrackedFromStorage())
  }, [])

  // Fetch products and simulate price drops
  const fetchAlerts = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await cachedFetch('/api/products?limit=50') as { products?: ProductData[] }
      const products: ProductData[] = data.products || []

      // Filter products with comparePrice > price (actual price drops)
      const drops = products
        .filter((p: ProductData) => p.comparePrice && p.comparePrice > p.price)
        .map((p: ProductData, i: number) => {
          const savings = p.comparePrice! - p.price
          const percentage = Math.round((savings / p.comparePrice!) * 100)
          return {
            id: p.id,
            product: p,
            oldPrice: p.comparePrice!,
            newPrice: p.price,
            savings,
            percentage,
            detectedAt: Date.now() - (i * 180000 + Math.random() * 3600000), // stagger detection times
            trend: generateSparkline(p.comparePrice!, p.price),
            isNew: i < 3, // first 3 are "new"
          }
        })

      // If we have fewer than 8, supplement with simulated drops from regular products
      if (drops.length < 8) {
        const regular = products
          .filter((p: ProductData) => !p.comparePrice || p.comparePrice <= p.price)
          .slice(0, 8 - drops.length)
        regular.forEach((p: ProductData, i: number) => {
          const fakeOld = p.price * (1 + 0.1 + Math.random() * 0.35)
          const savings = fakeOld - p.price
          const percentage = Math.round((savings / fakeOld) * 100)
          drops.push({
            id: `sim-${p.id}`,
            product: p,
            oldPrice: Math.round(fakeOld * 100) / 100,
            newPrice: p.price,
            savings,
            percentage,
            detectedAt: Date.now() - ((drops.length + i) * 300000 + Math.random() * 7200000),
            trend: generateSparkline(Math.round(fakeOld * 100) / 100, p.price),
            isNew: drops.length === 0 && i < 2,
          })
        })
      }

      setAlerts(drops.slice(0, 8))
    } catch {
      console.error('Error fetching price alerts')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Persist tracked IDs to localStorage
  const handleTrack = useCallback((id: string) => {
    setTrackedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      saveTrackedToStorage(next)
      return next
    })
  }, [])

  // Filter logic
  const filteredAlerts = useMemo(() => {
    const now = Date.now()
    const hourMs = 3600000
    const dayMs = 86400000
    const weekMs = 604800000

    let result = [...alerts]

    if (filter === 'today') {
      result = result.filter(a => now - a.detectedAt < dayMs)
    } else if (filter === 'week') {
      result = result.filter(a => now - a.detectedAt < weekMs)
    } else if (filter === 'biggest') {
      result = result.filter(a => a.percentage >= 20)
    }

    // Sort
    if (sort === 'savings') {
      result.sort((a, b) => b.savings - a.savings)
    } else if (sort === 'percentage') {
      result.sort((a, b) => b.percentage - a.percentage)
    } else {
      result.sort((a, b) => b.detectedAt - a.detectedAt)
    }

    return result
  }, [alerts, filter, sort])

  // Stats
  const totalSavings = useMemo(() => alerts.reduce((sum, a) => sum + a.savings, 0), [alerts])
  const avgDrop = useMemo(() => alerts.length > 0 ? Math.round(alerts.reduce((s, a) => s + a.percentage, 0) / alerts.length) : 0, [alerts])
  const biggestDrop = useMemo(() => alerts.length > 0 ? Math.max(...alerts.map(a => a.percentage)) : 0, [alerts])

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-4 r59-price-alert-container r62-card-lift"
    >
      {/* ═══ Header ═══ */}
      <motion.div variants={headerVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.15) 100%)',
              boxShadow: '0 4px 12px rgba(239,68,68,0.12)',
            }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <TrendingDown className="h-4.5 w-4.5" style={{ color: '#ef4444' }} />
          </motion.div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-1.5 r62-heading-gradient">
              Alertas de Preço
              {alerts.length > 0 && (
                <motion.span
                  key={alerts.length}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-[9px] font-bold r59-alert-count-badge"
                    style={{
                      backgroundColor: 'rgba(239,68,68,0.1)',
                      color: '#dc2626',
                      borderColor: 'rgba(239,68,68,0.2)',
                    }}
                  >
                    {alerts.length} alertas
                  </Badge>
                </motion.span>
              )}
            </h2>
            <p className="text-[10px] text-muted-foreground">Monitoramento inteligente de preços</p>
          </div>
        </div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <button
            onClick={fetchAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
            style={{ border: '1px solid rgba(0,0,0,0.08)' }}
          >
            <Search className="h-3.5 w-3.5" />
            Atualizar
          </button>
        </motion.div>
      </motion.div>

      {/* ═══ Stats Row ═══ */}
      {!isLoading && alerts.length > 0 && (
        <motion.div
          variants={headerVariants}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        >
          {[
            { label: 'Economia Total', value: formatBRL(totalSavings), color: '#16a34a', icon: Zap },
            { label: 'Queda Média', value: `-${avgDrop}%`, color: '#ea580c', icon: TrendingDown },
            { label: 'Maior Queda', value: `-${biggestDrop}%`, color: '#dc2626', icon: Flame },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="rounded-xl p-2.5 text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${stat.color}08 0%, transparent 100%)`,
                border: `1px solid ${stat.color}15`,
              }}
            >
              <stat.icon className="h-3.5 w-3.5 mx-auto mb-1 relative z-10" style={{ color: stat.color }} />
              <p className="text-[10px] text-muted-foreground relative z-10">{stat.label}</p>
              <p className="text-xs font-bold relative z-10" style={{ color: stat.color }}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ═══ Filter & Sort ═══ */}
      <div className="flex items-center justify-between gap-3">
        <FilterTabs active={filter} onChange={setFilter} />
        <SortDropdown active={sort} onChange={setSort} />
      </div>

      {/* ═══ Loading ═══ */}
      {isLoading && <LoadingSkeleton />}

      {/* ═══ Empty ═══ */}
      {!isLoading && filteredAlerts.length === 0 && <EmptyState />}

      {/* ═══ Price Drop Cards ═══ */}
      {!isLoading && filteredAlerts.length > 0 && (
        <motion.div
          className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredAlerts.map((alert) => (
              <PriceDropCard
                key={alert.id}
                alert={alert}
                isTracked={trackedIds.includes(alert.id) || trackedIds.includes(alert.product.id)}
                onTrack={handleTrack}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ═══ Tracked count footer ═══ */}
      {trackedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground py-1"
        >
          <Bell className="h-3 w-3" />
          {trackedIds.length} produto{trackedIds.length === 1 ? '' : 's'} rastreado{trackedIds.length === 1 ? '' : 's'}
        </motion.div>
      )}
    </motion.section>
  )
}
