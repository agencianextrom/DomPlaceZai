'use client'

import { useState, useEffect, useMemo, useCallback, useRef, useSyncExternalStore } from 'react'
const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  HeartCrack,
  TrendingDown,
  TrendingUp,
  Star,
  ChevronRight,
  Share2,
  Trash2,
  ShoppingBag,
  Clock,
  Flame,
  AlertTriangle,
  BarChart3,
  Eye,
  ArrowDown,
  Sparkles,
  Package,
  Zap,
  Gift,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cachedFetch } from '@/lib/api-cache'
import { formatBRL } from '@/lib/format'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
interface WishItem {
  id: string
  name: string
  price: number
  originalPrice: number
  imageEmoji: string
  category: string
  rating: number
  dateAdded: string
  priceHistory: number[]
  inStock: boolean
  trending: boolean
  storeName: string
}

type SortMode = 'date' | 'price' | 'rating'

interface WishlistState {
  items: WishItem[]
  sortBy: SortMode
}

/* ═══════════════════════════════════════════════════════════════
   Constants & localStorage
   ═══════════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'domplace-wishlist-tracker'

const CATEGORIES = [
  { name: 'Alimentação', emoji: '🍎', color: 'from-red-400 to-rose-500' },
  { name: 'Bebidas', emoji: '🥤', color: 'from-amber-400 to-orange-500' },
  { name: 'Limpeza', emoji: '🧹', color: 'from-blue-400 to-cyan-500' },
  { name: 'Higiene', emoji: '🧴', color: 'from-pink-400 to-fuchsia-500' },
  { name: 'Frios', emoji: '🧀', color: 'from-yellow-400 to-amber-500' },
  { name: 'Padaria', emoji: '🥖', color: 'from-orange-400 to-red-400' },
  { name: 'Pet', emoji: '🐾', color: 'from-emerald-400 to-teal-500' },
  { name: 'Hortifruti', emoji: '🥬', color: 'from-green-400 to-emerald-500' },
]

function generateMockItems(): WishItem[] {
  return [
    {
      id: 'wish-1',
      name: 'Queijo Minas Artesanal 500g',
      price: 34.90,
      originalPrice: 42.90,
      imageEmoji: '🧀',
      category: 'Frios',
      rating: 4.8,
      dateAdded: new Date(Date.now() - 2 * 86400000).toISOString(),
      priceHistory: [42.9, 41.5, 40.2, 38.9, 37.5, 36.2, 34.9],
      inStock: true,
      trending: true,
      storeName: 'Queijaria do Seu Joao',
    },
    {
      id: 'wish-2',
      name: 'Azeite Extra Virgem 500ml',
      price: 49.90,
      originalPrice: 62.00,
      imageEmoji: '🫒',
      category: 'Alimentação',
      rating: 4.9,
      dateAdded: new Date(Date.now() - 5 * 86400000).toISOString(),
      priceHistory: [62.0, 60.5, 58.0, 55.0, 53.0, 51.5, 49.9],
      inStock: true,
      trending: false,
      storeName: 'Emporio Sabor da Terra',
    },
    {
      id: 'wish-3',
      name: 'Cerveja Artesanal IPA 6x355ml',
      price: 28.90,
      originalPrice: 34.90,
      imageEmoji: '🍺',
      category: 'Bebidas',
      rating: 4.5,
      dateAdded: new Date(Date.now() - 1 * 86400000).toISOString(),
      priceHistory: [34.9, 33.0, 31.5, 30.9, 29.9, 28.9, 28.9],
      inStock: true,
      trending: true,
      storeName: 'Cervejaria LUPA',
    },
    {
      id: 'wish-4',
      name: 'Geleia de Pimenta Caseira 200g',
      price: 18.50,
      originalPrice: 22.00,
      imageEmoji: '🌶️',
      category: 'Alimentação',
      rating: 4.7,
      dateAdded: new Date(Date.now() - 3 * 86400000).toISOString(),
      priceHistory: [22.0, 21.5, 20.5, 19.9, 19.2, 18.8, 18.5],
      inStock: true,
      trending: false,
      storeName: 'Doces da Vovo',
    },
    {
      id: 'wish-5',
      name: 'Pao de Queijo Congelado 1kg',
      price: 22.90,
      originalPrice: 22.90,
      imageEmoji: '🧀',
      category: 'Padaria',
      rating: 4.3,
      dateAdded: new Date(Date.now() - 7 * 86400000).toISOString(),
      priceHistory: [22.9, 22.9, 22.9, 22.5, 22.5, 22.9, 22.9],
      inStock: false,
      trending: false,
      storeName: 'Padaria Pao Dourado',
    },
    {
      id: 'wish-6',
      name: 'Shampoo Vegano 300ml',
      price: 32.00,
      originalPrice: 39.90,
      imageEmoji: '🧴',
      category: 'Higiene',
      rating: 4.6,
      dateAdded: new Date(Date.now() - 4 * 86400000).toISOString(),
      priceHistory: [39.9, 38.0, 36.5, 35.0, 34.0, 33.0, 32.0],
      inStock: true,
      trending: true,
      storeName: 'Natura Essencial',
    },
    {
      id: 'wish-7',
      name: 'Racao Premium para Caes 8kg',
      price: 89.90,
      originalPrice: 109.90,
      imageEmoji: '🐕',
      category: 'Pet',
      rating: 4.4,
      dateAdded: new Date(Date.now() - 6 * 86400000).toISOString(),
      priceHistory: [109.9, 105.0, 99.9, 96.0, 93.5, 91.0, 89.9],
      inStock: true,
      trending: false,
      storeName: 'Pet Shop Amigo Fiel',
    },
    {
      id: 'wish-8',
      name: 'Detergente Neutro 2L',
      price: 8.90,
      originalPrice: 8.90,
      imageEmoji: '🧹',
      category: 'Limpeza',
      rating: 4.1,
      dateAdded: new Date(Date.now() - 8 * 86400000).toISOString(),
      priceHistory: [8.9, 8.9, 8.5, 8.9, 8.9, 8.9, 8.9],
      inStock: false,
      trending: false,
      storeName: 'Limpeza Total',
    },
    {
      id: 'wish-9',
      name: 'Tomates Grape 500g Orgânicos',
      price: 12.50,
      originalPrice: 15.90,
      imageEmoji: '🍅',
      category: 'Hortifruti',
      rating: 4.2,
      dateAdded: new Date(Date.now() - 10 * 86400000).toISOString(),
      priceHistory: [15.9, 15.0, 14.5, 13.9, 13.2, 12.9, 12.5],
      inStock: true,
      trending: false,
      storeName: 'Horta Vida',
    },
  ]
}

function loadState(): WishlistState {
  if (typeof window === 'undefined') {
    return { items: generateMockItems(), sortBy: 'date' }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  const fresh = { items: generateMockItems(), sortBy: 'date' as SortMode }
  saveState(fresh)
  return fresh
}

function saveState(state: WishlistState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

/* ═══════════════════════════════════════════════════════════════
   Animation variants
   ═══════════════════════════════════════════════════════════════ */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: -10,
    transition: { duration: 0.25 },
  },
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
function daysAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Hoje'
  if (d === 1) return 'Ontem'
  if (d < 7) return `Salvo há ${d} dias`
  return `Salvo há ${Math.floor(d / 7)} semana${Math.floor(d / 7) > 1 ? 's' : ''}`
}

function dropPercent(item: WishItem): number {
  if (item.price >= item.originalPrice) return 0
  return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
}

/* ═══════════════════════════════════════════════════════════════
   MiniSparklineChart — 7-day price sparkline SVG
   ═══════════════════════════════════════════════════════════════ */
function MiniSparklineChart({ data, currentPrice }: { data: number[]; currentPrice: number }) {
  const width = 160
  const height = 48
  const pad = 4
  const maxVal = Math.max(...data)
  const minVal = Math.min(...data)
  const range = maxVal - minVal || 1

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = height - pad - ((v - minVal) / range) * (height - pad * 2)
    return { x, y }
  })

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
  const areaD = `M ${pad},${height - pad} L ${pts.map((p) => `${p.x},${p.y}`).join(' L ')} L ${width - pad},${height - pad} Z`

  const lowestIdx = data.indexOf(Math.min(...data))
  const lowestPt = pts[lowestIdx]
  const lastPt = pts[pts.length - 1]
  const isDropping = data[data.length - 1] < data[0]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
      <defs>
        <linearGradient id="r36-spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDropping ? '#16a34a' : '#dc2626'} stopOpacity="0.2" />
          <stop offset="100%" stopColor={isDropping ? '#16a34a' : '#dc2626'} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area */}
      <motion.path
        d={areaD}
        fill="url(#r36-spark-grad)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      {/* Line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={isDropping ? '#16a34a' : '#dc2626'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* Lowest marker */}
      <motion.circle
        cx={lowestPt.x}
        cy={lowestPt.y}
        r="3"
        fill="#16a34a"
        stroke="#ffffff"
        strokeWidth="1.5"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' as const, stiffness: 400, damping: 15 }}
      />
      {/* Current price dot */}
      <motion.circle
        cx={lastPt.x}
        cy={lastPt.y}
        r="3.5"
        fill={isDropping ? '#16a34a' : '#dc2626'}
        stroke="#ffffff"
        strokeWidth="1.5"
        initial={{ scale: 0 }}
        animate={{ scale: 1, r: 3.5 }}
        transition={{ delay: 0.4, type: 'spring' as const, stiffness: 400, damping: 15 }}
      />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CategoryBarChart — horizontal bars for category distribution
   ═══════════════════════════════════════════════════════════════ */
function CategoryBarChart({ items }: { items: WishItem[] }) {
  const catMap: Record<string, number> = {}
  items.forEach((it) => {
    catMap[it.category] = (catMap[it.category] || 0) + 1
  })
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1])
  const maxCount = sorted[0]?.[1] || 1

  return (
    <div className="space-y-2">
      {sorted.slice(0, 5).map(([cat, count]) => {
        const catInfo = CATEGORIES.find((c) => c.name === cat)
        const pct = (count / maxCount) * 100
        return (
          <div key={cat} className="flex items-center gap-2">
            <span className="text-sm w-5 text-center shrink-0">{catInfo?.emoji || '📦'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-medium truncate">{cat}</span>
                <span className="text-[9px] text-muted-foreground tabular-nums">{count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${catInfo?.color || 'from-gray-400 to-gray-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, type: 'spring' as const, stiffness: 180, damping: 20 }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PriceDropCard — item that has had a price drop
   ═══════════════════════════════════════════════════════════════ */
function PriceDropCard({ item, onBuy }: { item: WishItem; onBuy: () => void }) {
  const pct = dropPercent(item)
  const savings = item.originalPrice - item.price

  return (
    <motion.div
      variants={cardVariants}
      className="r36-wish-card r36-price-drop rounded-xl p-3 border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20"
    >
      <div className="flex items-start gap-3">
        {/* Emoji image */}
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center text-2xl shrink-0">
          {item.imageEmoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground truncate">{item.storeName}</p>
          <h4 className="text-xs font-semibold line-clamp-1">{item.name}</h4>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatBRL(item.price)}</span>
            <span className="text-[10px] text-red-400 line-through">{formatBRL(item.originalPrice)}</span>
          </div>

          {/* Savings percentage badge with glow */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-700/40 mt-1 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
          >
            <ArrowDown className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              -{pct}%
            </span>
          </motion.div>

          {/* Animated downward arrow */}
          <div className="flex items-center gap-2 mt-2">
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
            </motion.div>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Economize {formatBRL(savings)}
            </span>
          </div>
        </div>
      </div>

      {/* Buy now button with shimmer */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        onClick={onBuy}
        className="w-full mt-3 h-8 min-h-[44px] rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 relative overflow-hidden transition-colors"
      >
        <motion.span
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.3) 55%, transparent 60%)',
            backgroundSize: '300% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
        />
        <ShoppingBag className="h-3.5 w-3.5 relative z-10" />
        <span className="relative z-10">Comprar agora</span>
      </motion.button>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   RecentlySavedCard — horizontal scroll card
   ═══════════════════════════════════════════════════════════════ */
function RecentlySavedCard({
  item,
  onRemove,
}: {
  item: WishItem
  onRemove: () => void
}) {
  const [removing, setRemoving] = useState(false)

  const handleRemove = () => {
    setRemoving(true)
    setTimeout(onRemove, 300)
  }

  const pct = dropPercent(item)

  return (
    <motion.div
      variants={cardVariants}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="r36-wish-card shrink-0 w-[155px] sm:w-[170px] rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Emoji image area */}
      <div className="relative h-24 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
        <span className="text-4xl">{item.imageEmoji}</span>
        {/* Price drop badge */}
        {pct > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
            className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-bold"
          >
            <ArrowDown className="h-2 w-2" />
            -{pct}%
          </motion.div>
        )}
        {/* Out of stock badge */}
        {!item.inStock && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
            className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold"
          >
            Esgotado
          </motion.div>
        )}
        {/* Remove button */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation()
            handleRemove()
          }}
          className={`absolute bottom-1.5 right-1.5 h-6 w-6 min-h-[44px] min-w-[44px] rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 ${
            removing ? 'r36-heart-break' : ''
          }`}
        >
          {removing ? (
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 720 }}
              transition={{ duration: 0.3 }}
            >
              <HeartCrack className="h-3 w-3 text-red-500" />
            </motion.div>
          ) : (
            <Heart className="h-3 w-3 text-red-400 fill-red-400" />
          )}
        </motion.button>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h4 className="text-[11px] font-semibold line-clamp-2 leading-tight min-h-[2rem]">{item.name}</h4>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="text-sm font-bold text-primary">{formatBRL(item.price)}</span>
          {pct > 0 && (
            <span className="text-[9px] text-muted-foreground line-through">{formatBRL(item.originalPrice)}</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <Clock className="h-2.5 w-2.5 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">{daysAgo(item.dateAdded)}</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EmptyState
   ═══════════════════════════════════════════════════════════════ */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {/* Floating heart */}
      <motion.div
        className="r36-heart-float"
        animate={{
          y: [0, -14, 0],
          rotate: [0, 8, -8, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 flex items-center justify-center shadow-lg">
          <Heart className="h-10 w-10 text-red-400" />
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-base font-bold mt-5"
      >
        Sua lista de desejos está vazia
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-muted-foreground mt-2 max-w-xs"
      >
        Explore produtos e toque no ❤️ para salvar
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-5"
      >
        <Button className="btn-glow btn-shine bg-primary text-primary-foreground rounded-full px-6 min-h-[44px] text-xs font-semibold gap-2">
          <ShoppingBag className="h-3.5 w-3.5" />
          Explorar Produtos
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — ProductWishTracker
   ═══════════════════════════════════════════════════════════════ */
export function ProductWishTracker() {
  const [state, setState] = useState<WishlistState>(loadState)
  const mounted = useHydrated()
  const [showSortMenu, setShowSortMenu] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sortMenuRef = useRef<HTMLDivElement>(null)

  // Persist on change
  useEffect(() => {
    if (mounted) saveState(state)
  }, [mounted, state])

  // Fetch latest prices from API to detect new price drops
  useEffect(() => {
    if (!mounted) return
    let cancelled = false
    cachedFetch('/api/products?limit=50')
      .then((data: any) => {
        if (cancelled || !data?.products) return
        const apiProducts: any[] = data.products
        setState((prev) => ({
          ...prev,
          items: prev.items.map((item) => {
            const match = apiProducts.find(
              (p: any) => p.name?.toLowerCase().includes(item.name.split(' ').slice(0, 2).join(' ').toLowerCase()),
            )
            if (match && match.price > 0 && match.price !== item.price) {
              const newHistory = [...item.priceHistory.slice(-6), match.price]
              return { ...item, price: match.price, priceHistory: newHistory }
            }
            return item
          }),
        }))
      })
      .catch(() => {
        /* Silently fall back to cached mock data */
      })
    return () => {
      cancelled = true
    }
  }, [mounted])

  // Close sort menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false)
      }
    }
    if (showSortMenu) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [showSortMenu])

  // Remove item
  const removeItem = useCallback((id: string) => {
    setState((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }))
  }, [])

  // Clear all
  const clearAll = useCallback(() => {
    setState((prev) => ({ ...prev, items: [] }))
  }, [])

  // Sort
  const setSort = useCallback((mode: SortMode) => {
    setState((prev) => ({ ...prev, sortBy: mode }))
    setShowSortMenu(false)
  }, [])

  // Share wishlist via Web Share API
  const shareWishlist = useCallback(async () => {
    const items = state.items
    const total = items.reduce((s, i) => s + i.price, 0)
    const text = `Minha lista de desejos DomPlace: ${items.length} itens, total ${formatBRL(total)}`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Minha Lista de Desejos - DomPlace',
          text,
          url: window.location.href,
        })
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard?.writeText(text + '\n' + window.location.href)
    }
  }, [state.items])

  // Computed: sorted items
  const sortedItems = useMemo(() => {
    const arr = [...state.items]
    switch (state.sortBy) {
      case 'price':
        return arr.sort((a, b) => b.price - a.price)
      case 'rating':
        return arr.sort((a, b) => b.rating - a.rating)
      case 'date':
      default:
        return arr.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    }
  }, [state.items, state.sortBy])

  // Recently saved (last 5)
  const recentItems = useMemo(
    () => [...state.items].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 5),
    [state.items],
  )

  // Price drop items (originalPrice > price)
  const priceDropItems = useMemo(
    () => state.items.filter((it) => it.originalPrice > it.price).sort((a, b) => dropPercent(b) - dropPercent(a)),
    [state.items],
  )

  // Out of stock items
  const outOfStockItems = useMemo(() => state.items.filter((it) => !it.inStock), [state.items])

  // Trending items
  const trendingItems = useMemo(() => state.items.filter((it) => it.trending), [state.items])

  // Total value
  const totalValue = useMemo(() => state.items.reduce((s, i) => s + i.price, 0), [state.items])

  // Total potential savings
  const totalSavings = useMemo(
    () => state.items.reduce((s, i) => s + Math.max(0, i.originalPrice - i.price), 0),
    [state.items],
  )

  // Average rating
  const avgRating = useMemo(() => {
    if (state.items.length === 0) return 0
    return state.items.reduce((s, i) => s + i.rating, 0) / state.items.length
  }, [state.items])

  // Has price drops
  const hasPriceDrops = priceDropItems.length > 0

  // Top saved item for sparkline
  const topItem = sortedItems[0] || null

  // Sort labels
  const sortLabels: Record<SortMode, string> = {
    date: 'Data',
    price: 'Preço',
    rating: 'Avaliação',
  }

  if (!mounted) {
    return (
      <section>
        <div className="rounded-2xl p-6 glassmorphism-strong animate-pulse">
          <div className="h-6 w-40 bg-muted rounded mb-4" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-muted rounded-xl" />
            <div className="h-20 bg-muted rounded-xl" />
          </div>
          <div className="h-40 bg-muted rounded-xl mt-4" />
        </div>
      </section>
    )
  }

  // Empty state
  if (state.items.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl glassmorphism-strong overflow-hidden"
      >
        <EmptyState />
      </motion.section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl glassmorphism-strong overflow-hidden r62-card-lift r92-wish-tracker-card"
    >
      <div className="relative z-10">
        {/* ═══ HEADER ═══ */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-2.5">
            {/* Animated pulsing heart icon */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md"
            >
              <Heart className="h-4.5 w-4.5 text-white fill-white" />
            </motion.div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 r62-heading-gradient">
                Itens Salvos
                <motion.span
                  key={state.items.length}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                >
                  <Badge variant="secondary" className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/30 font-bold">
                    {state.items.length}
                  </Badge>
                </motion.span>
              </h2>
              <p className="text-[10px] text-muted-foreground">Acompanhe seus favoritos</p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Sort menu */}
            <div className="relative" ref={sortMenuRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSortMenu((prev) => !prev)}
                className="h-7 px-2 rounded-lg text-[10px] font-semibold bg-card border border-border/60 hover:border-primary/30 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
              >
                <BarChart3 className="h-3 w-3" />
                {sortLabels[state.sortBy]}
              </motion.button>
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 z-30 bg-popover border border-border rounded-xl shadow-lg overflow-hidden min-w-[120px]"
                  >
                    {(Object.entries(sortLabels) as [SortMode, string][]).map(([mode, label]) => (
                      <motion.button
                        key={mode}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSort(mode)}
                        className={`w-full text-left px-3 py-2 text-[11px] font-medium transition-colors ${
                          state.sortBy === mode
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        {label}
                        {state.sortBy === mode && (
                          <span className="ml-1.5 text-primary">✓</span>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Share */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={shareWishlist}
              className="h-7 w-7 rounded-lg bg-card border border-border/60 hover:border-primary/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
            >
              <Share2 className="h-3 w-3" />
            </motion.button>

            {/* Clear all */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={clearAll}
              className="h-7 w-7 rounded-lg bg-card border border-border/60 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors min-h-[44px] min-w-[44px]"
            >
              <Trash2 className="h-3 w-3" />
            </motion.button>
          </div>
        </div>

        {/* ═══ WISHLIST SUMMARY DASHBOARD ═══ */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Total items counter */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-xl bg-primary/5 border border-primary/15 p-2.5 text-center"
            >
              <motion.span
                key={state.items.length}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                className="text-lg font-bold text-primary tabular-nums"
              >
                {state.items.length}
              </motion.span>
              <p className="text-[9px] text-muted-foreground mt-0.5">Itens salvos</p>
            </motion.div>

            {/* Total value */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-2.5 text-center"
            >
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatBRLCompact(totalValue)}
              </span>
              <p className="text-[9px] text-muted-foreground mt-0.5">Valor total</p>
            </motion.div>

            {/* Price drop alert badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`rounded-xl p-2.5 text-center ${
                hasPriceDrops
                  ? 'r36-price-drop-pulse bg-red-500/5 border border-red-500/15'
                  : 'bg-muted/30 border border-border/30'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <TrendingDown className={`h-4 w-4 ${hasPriceDrops ? 'text-red-500' : 'text-muted-foreground'}`} />
                <span className={`text-lg font-bold tabular-nums ${hasPriceDrops ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {priceDropItems.length}
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {hasPriceDrops ? 'Preço caiu!' : 'Sem quedas'}
              </p>
            </motion.div>

            {/* Average rating */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-2.5 text-center"
            >
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">Média</p>
            </motion.div>
          </div>
        </div>

        {/* ═══ PRICE HISTORY MINI CHART ═══ */}
        {topItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="px-4 pb-3"
          >
            <div className="rounded-xl bg-card border border-border/50 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{topItem.imageEmoji}</span>
                  <div>
                    <p className="text-[11px] font-semibold line-clamp-1">{topItem.name}</p>
                    <p className="text-[9px] text-muted-foreground">Histórico de 7 dias</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary">{formatBRL(topItem.price)}</p>
                  {dropPercent(topItem) > 0 && (
                    <p className="text-[9px] text-emerald-500 font-semibold">
                      Menor preço dos 7 dias
                    </p>
                  )}
                </div>
              </div>
              <MiniSparklineChart data={topItem.priceHistory} currentPrice={topItem.price} />
              <div className="flex justify-between mt-1.5 px-0.5">
                {['7d', '6d', '5d', '4d', '3d', '2d', 'Hoje'].map((day) => (
                  <span key={day} className="text-[8px] text-muted-foreground/60">
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ CATEGORY DISTRIBUTION ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="px-4 pb-3"
        >
          <div className="rounded-xl bg-card border border-border/50 p-3">
            <p className="text-[11px] font-semibold mb-2 flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              Categorias mais salvas
            </p>
            <CategoryBarChart items={state.items} />
          </div>
        </motion.div>

        {/* ═══ PRICE DROP ALERTS ═══ */}
        {hasPriceDrops && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="px-4 pb-3"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <TrendingDown className="h-4 w-4 text-emerald-500" />
              </motion.div>
              <p className="text-[11px] font-semibold">Queda de Preço</p>
              <Badge variant="secondary" className="text-[9px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold">
                {priceDropItems.length}
              </Badge>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              <AnimatePresence>
                {priceDropItems.slice(0, 4).map((item) => (
                  <PriceDropCard
                    key={item.id}
                    item={item}
                    onBuy={() => {
                      /* navigate / add to cart action */
                    }}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        {/* ═══ RECENTLY SAVED ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pb-3"
        >
          <div className="flex items-center justify-between px-4 mb-2">
            <p className="text-[11px] font-semibold flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Salvos Recentemente
            </p>
            <motion.button
              whileHover={{ x: 3 }}
              className="flex items-center gap-0.5 text-[10px] text-primary font-semibold"
            >
              Ver Tudo
              <ChevronRight className="h-3 w-3" />
            </motion.button>
          </div>

          {/* Horizontal scroll */}
          <div
            ref={scrollRef}
            className="flex gap-2.5 overflow-x-auto hide-scrollbar px-4 pb-1 scroll-smooth"
          >
            <AnimatePresence>
              {recentItems.map((item) => (
                <RecentlySavedCard
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ═══ WISHLIST INSIGHTS ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="px-4 pb-3"
        >
          <div className="space-y-2">
            {/* Savings comparison card */}
            {totalSavings > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring' as const, stiffness: 250, damping: 20 }}
                className="r36-savings-card rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-3 flex items-center gap-3 relative overflow-hidden"
              >
                {/* Glow effect */}
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 r36-savings-glow rounded-xl pointer-events-none"
                />
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 relative z-10">
                  <Gift className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Você economizaria {formatBRL(totalSavings)} se comprasse agora
                  </p>
                  <p className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                    {priceDropItems.length} {priceDropItems.length === 1 ? 'item' : 'itens'} mais baratos que quando você salvou
                  </p>
                </div>
              </motion.div>
            )}

            {/* Trending items */}
            {trendingItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, type: 'spring' as const, stiffness: 250, damping: 20 }}
                className="r36-wish-card rounded-xl bg-amber-500/5 border border-amber-500/15 p-3"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                  </motion.div>
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    Itens Populares
                  </p>
                  <Badge variant="secondary" className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold">
                    {trendingItems.length}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {trendingItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="text-sm">{item.imageEmoji}</span>
                      <span className="text-[10px] font-medium line-clamp-1 flex-1">{item.name}</span>
                      <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Out of stock */}
            {outOfStockItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, type: 'spring' as const, stiffness: 250, damping: 20 }}
                className="r36-wish-card rounded-xl bg-red-500/5 border border-red-500/15 p-3"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  </motion.div>
                  <p className="text-[11px] font-semibold text-red-700 dark:text-red-300">
                    Sem Estoque
                  </p>
                  <Badge variant="secondary" className="text-[9px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold">
                    {outOfStockItems.length}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {outOfStockItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="text-sm opacity-50">{item.imageEmoji}</span>
                      <span className="text-[10px] font-medium line-clamp-1 flex-1 text-muted-foreground">{item.name}</span>
                      <Package className="h-3 w-3 text-red-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ═══ VER TUDO FOOTER BUTTON ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-4 pb-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-9 rounded-xl bg-card border border-border/60 hover:border-primary/30 text-xs font-semibold flex items-center justify-center gap-1.5 text-foreground transition-colors group"
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            Ver Todos os {state.items.length} Itens Salvos
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Helper (compact format) — used inside the component
   ═══════════════════════════════════════════════════════════════ */
function formatBRLCompact(value: number): string {
  if (value >= 1000) {
    return `R$${(value / 1000).toFixed(1)}k`
  }
  return `R$${Math.round(value)}`
}
