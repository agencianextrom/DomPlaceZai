'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  TrendingDown,
  Star,
  Truck,
  Sparkles,
  Bell,
  BellOff,
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
  Clock,
  ThumbsUp,
  BarChart3,
  Filter,
  ArrowUpDown,
  X,
  History,
  Target,
  ShieldCheck,
  BrainCircuit,
  Store,
  Percent,
  BadgePercent,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────────
interface StoreOffer {
  storeId: string
  storeName: string
  storeLogo: string
  price: number
  originalPrice: number
  discount: number
  rating: number
  reviewCount: number
  deliveryHours: number
  deliveryFee: number
  inStock: boolean
  priceHistory: number[]
}

interface ProductEntry {
  productId: string
  productName: string
  category: string
  emoji: string
  offers: StoreOffer[]
}

type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'delivery' | 'discount'
type FilterCategory = 'all' | 'alimentos' | 'eletronicos' | 'beleza' | 'casa' | 'saude'

interface RecentSearch {
  id: string
  term: string
  timestamp: number
}

interface PriceAlert {
  productId: string
  productName: string
  targetPrice: number
  currentBest: number
  active: boolean
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_PRODUCTS: ProductEntry[] = [
  {
    productId: 'prod-001',
    productName: 'Arroz Tio João 5kg',
    category: 'alimentos',
    emoji: '🍚',
    offers: [
      {
        storeId: 's1', storeName: 'Super Mercado São Jorge', storeLogo: '🛒',
        price: 24.90, originalPrice: 29.90, discount: 17, rating: 4.5, reviewCount: 1240,
        deliveryHours: 2, deliveryFee: 0, inStock: true,
        priceHistory: [27.90, 26.50, 25.90, 26.90, 25.50, 24.90, 24.90],
      },
      {
        storeId: 's2', storeName: 'Atacadão do Povo', storeLogo: '🏪',
        price: 22.50, originalPrice: 28.00, discount: 20, rating: 4.2, reviewCount: 890,
        deliveryHours: 4, deliveryFee: 5.90, inStock: true,
        priceHistory: [26.00, 25.00, 24.50, 23.90, 23.50, 22.90, 22.50],
      },
      {
        storeId: 's3', storeName: 'Mercado Fresh', storeLogo: '🥬',
        price: 26.90, originalPrice: 26.90, discount: 0, rating: 4.8, reviewCount: 2100,
        deliveryHours: 1, deliveryFee: 3.50, inStock: true,
        priceHistory: [26.90, 26.90, 26.90, 26.90, 26.90, 26.90, 26.90],
      },
      {
        storeId: 's4', storeName: 'Casa do Sabor', storeLogo: '🏠',
        price: 25.50, originalPrice: 30.00, discount: 15, rating: 4.3, reviewCount: 560,
        deliveryHours: 3, deliveryFee: 0, inStock: true,
        priceHistory: [29.00, 28.00, 27.50, 26.90, 26.00, 25.90, 25.50],
      },
    ],
  },
  {
    productId: 'prod-002',
    productName: 'iPhone 15 128GB',
    category: 'eletronicos',
    emoji: '📱',
    offers: [
      {
        storeId: 's5', storeName: 'TechStore Premium', storeLogo: '💻',
        price: 4299.00, originalPrice: 4999.00, discount: 14, rating: 4.7, reviewCount: 3400,
        deliveryHours: 24, deliveryFee: 0, inStock: true,
        priceHistory: [4799, 4699, 4599, 4499, 4399, 4350, 4299],
      },
      {
        storeId: 's6', storeName: 'Mega Eletrônicos', storeLogo: '⚡',
        price: 4199.00, originalPrice: 4999.00, discount: 16, rating: 4.4, reviewCount: 1800,
        deliveryHours: 48, deliveryFee: 15.00, inStock: true,
        priceHistory: [4650, 4550, 4450, 4399, 4299, 4250, 4199],
      },
      {
        storeId: 's7', storeName: 'Apple Store Oficial', storeLogo: '🍎',
        price: 4999.00, originalPrice: 4999.00, discount: 0, rating: 5.0, reviewCount: 12000,
        deliveryHours: 12, deliveryFee: 0, inStock: true,
        priceHistory: [4999, 4999, 4999, 4999, 4999, 4999, 4999],
      },
      {
        storeId: 's8', storeName: 'Mercado Livre Plus', storeLogo: '📦',
        price: 4150.00, originalPrice: 4999.00, discount: 17, rating: 4.1, reviewCount: 950,
        deliveryHours: 72, deliveryFee: 22.00, inStock: false,
        priceHistory: [4599, 4499, 4350, 4299, 4250, 4199, 4150],
      },
      {
        storeId: 's9', storeName: 'Ponto Eletrônicos', storeLogo: '🔌',
        price: 4349.00, originalPrice: 4899.00, discount: 11, rating: 4.3, reviewCount: 720,
        deliveryHours: 36, deliveryFee: 8.00, inStock: true,
        priceHistory: [4750, 4699, 4599, 4499, 4420, 4390, 4349],
      },
    ],
  },
  {
    productId: 'prod-003',
    productName: 'Shampoo Pantene 400ml',
    category: 'beleza',
    emoji: '💇',
    offers: [
      {
        storeId: 's10', storeName: 'Drogasil', storeLogo: '💊',
        price: 18.90, originalPrice: 24.90, discount: 24, rating: 4.6, reviewCount: 4300,
        deliveryHours: 3, deliveryFee: 0, inStock: true,
        priceHistory: [22.90, 22.50, 21.90, 20.50, 19.90, 19.50, 18.90],
      },
      {
        storeId: 's11', storeName: 'Farmácia Popular', storeLogo: '🧴',
        price: 16.50, originalPrice: 22.00, discount: 25, rating: 4.3, reviewCount: 2800,
        deliveryHours: 5, deliveryFee: 2.90, inStock: true,
        priceHistory: [20.50, 19.90, 19.50, 18.50, 17.90, 17.20, 16.50],
      },
      {
        storeId: 's12', storeName: 'Beleza Pura', storeLogo: '✨',
        price: 19.90, originalPrice: 24.90, discount: 20, rating: 4.8, reviewCount: 1500,
        deliveryHours: 2, deliveryFee: 4.50, inStock: true,
        priceHistory: [23.50, 23.00, 22.50, 21.90, 21.00, 20.50, 19.90],
      },
    ],
  },
  {
    productId: 'prod-004',
    productName: 'Café Pilão 500g',
    category: 'alimentos',
    emoji: '☕',
    offers: [
      {
        storeId: 's1', storeName: 'Super Mercado São Jorge', storeLogo: '🛒',
        price: 19.90, originalPrice: 22.90, discount: 13, rating: 4.5, reviewCount: 980,
        deliveryHours: 2, deliveryFee: 0, inStock: true,
        priceHistory: [21.90, 21.50, 21.00, 20.50, 20.20, 20.00, 19.90],
      },
      {
        storeId: 's2', storeName: 'Atacadão do Povo', storeLogo: '🏪',
        price: 17.50, originalPrice: 22.90, discount: 24, rating: 4.1, reviewCount: 650,
        deliveryHours: 4, deliveryFee: 5.90, inStock: true,
        priceHistory: [21.50, 20.90, 20.00, 19.50, 18.90, 18.20, 17.50],
      },
      {
        storeId: 's4', storeName: 'Casa do Sabor', storeLogo: '🏠',
        price: 21.50, originalPrice: 22.90, discount: 6, rating: 4.4, reviewCount: 420,
        deliveryHours: 3, deliveryFee: 0, inStock: true,
        priceHistory: [22.50, 22.20, 22.00, 21.90, 21.70, 21.60, 21.50],
      },
      {
        storeId: 's13', storeName: 'Empório Café', storeLogo: '🫘',
        price: 23.90, originalPrice: 25.90, discount: 8, rating: 4.9, reviewCount: 3200,
        deliveryHours: 6, deliveryFee: 0, inStock: true,
        priceHistory: [25.50, 25.20, 24.90, 24.50, 24.20, 24.00, 23.90],
      },
    ],
  },
  {
    productId: 'prod-005',
    productName: 'Detergente Ypê 500ml',
    category: 'casa',
    emoji: '🧹',
    offers: [
      {
        storeId: 's14', storeName: 'Atacadão do Povo', storeLogo: '🏪',
        price: 2.49, originalPrice: 3.49, discount: 29, rating: 4.2, reviewCount: 5200,
        deliveryHours: 4, deliveryFee: 5.90, inStock: true,
        priceHistory: [3.29, 3.19, 3.09, 2.99, 2.89, 2.69, 2.49],
      },
      {
        storeId: 's1', storeName: 'Super Mercado São Jorge', storeLogo: '🛒',
        price: 2.99, originalPrice: 3.49, discount: 14, rating: 4.5, reviewCount: 3800,
        deliveryHours: 2, deliveryFee: 0, inStock: true,
        priceHistory: [3.39, 3.29, 3.19, 3.09, 3.05, 3.02, 2.99],
      },
      {
        storeId: 's3', storeName: 'Mercado Fresh', storeLogo: '🥬',
        price: 3.49, originalPrice: 3.49, discount: 0, rating: 4.7, reviewCount: 1600,
        deliveryHours: 1, deliveryFee: 3.50, inStock: true,
        priceHistory: [3.49, 3.49, 3.49, 3.49, 3.49, 3.49, 3.49],
      },
      {
        storeId: 's15', storeName: 'Limpa Tudo', storeLogo: '🧽',
        price: 2.29, originalPrice: 3.29, discount: 30, rating: 3.9, reviewCount: 280,
        deliveryHours: 8, deliveryFee: 7.00, inStock: true,
        priceHistory: [3.09, 2.99, 2.89, 2.79, 2.69, 2.49, 2.29],
      },
    ],
  },
  {
    productId: 'prod-006',
    productName: 'Vitamina C 1000mg 60 cáps',
    category: 'saude',
    emoji: '💊',
    offers: [
      {
        storeId: 's10', storeName: 'Drogasil', storeLogo: '💊',
        price: 34.90, originalPrice: 49.90, discount: 30, rating: 4.6, reviewCount: 5600,
        deliveryHours: 3, deliveryFee: 0, inStock: true,
        priceHistory: [44.90, 43.50, 42.00, 40.50, 38.90, 36.50, 34.90],
      },
      {
        storeId: 's11', storeName: 'Farmácia Popular', storeLogo: '🧴',
        price: 29.90, originalPrice: 45.00, discount: 34, rating: 4.4, reviewCount: 3200,
        deliveryHours: 5, deliveryFee: 2.90, inStock: true,
        priceHistory: [42.00, 40.50, 39.00, 37.50, 35.00, 32.50, 29.90],
      },
      {
        storeId: 's16', storeName: 'Vida Saudável', storeLogo: '🌿',
        price: 38.90, originalPrice: 49.90, discount: 22, rating: 4.8, reviewCount: 2100,
        deliveryHours: 4, deliveryFee: 0, inStock: true,
        priceHistory: [46.90, 45.50, 44.00, 42.50, 41.00, 40.00, 38.90],
      },
      {
        storeId: 's17', storeName: 'Farmácia Araújo', storeLogo: '🏥',
        price: 32.50, originalPrice: 47.90, discount: 32, rating: 4.5, reviewCount: 4100,
        deliveryHours: 6, deliveryFee: 0, inStock: false,
        priceHistory: [44.50, 43.00, 41.00, 39.50, 37.00, 34.90, 32.50],
      },
      {
        storeId: 's18', storeName: 'Pacheco Drogarias', storeLogo: '💊',
        price: 36.90, originalPrice: 49.90, discount: 26, rating: 4.3, reviewCount: 1800,
        deliveryHours: 7, deliveryFee: 3.00, inStock: true,
        priceHistory: [45.90, 44.50, 43.00, 42.00, 40.50, 38.50, 36.90],
      },
    ],
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  alimentos: 'Alimentos',
  eletronicos: 'Eletrônicos',
  beleza: 'Beleza',
  casa: 'Casa',
  saude: 'Saúde',
}

const SEARCH_SUGGESTIONS = MOCK_PRODUCTS.map((p) => ({
  id: p.productId,
  name: p.productName,
  emoji: p.emoji,
  category: p.category,
}))

// ── Helpers ────────────────────────────────────────────────────────
function getBestOffer(offers: StoreOffer[]): StoreOffer {
  return offers.reduce((best, o) => (o.price < best.price ? o : best), offers[0])
}

function getHighestPrice(offers: StoreOffer[]): number {
  return Math.max(...offers.map((o) => o.price))
}

function formatDeliveryHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}min`
  if (hours < 24) return `${hours}h`
  return `${Math.round(hours / 24)}d`
}

function loadRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('domplace-price-comparison-searches')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentSearches(searches: RecentSearch[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('domplace-price-comparison-searches', JSON.stringify(searches))
  } catch {
    // ignore
  }
}

function loadPriceAlerts(): PriceAlert[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('domplace-price-alerts')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function savePriceAlerts(alerts: PriceAlert[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('domplace-price-alerts', JSON.stringify(alerts))
  } catch {
    // ignore
  }
}

// ── SVG Sparkline ─────────────────────────────────────────────────
function SparklineChart({ data, trend }: { data: number[]; trend: 'down' | 'up' | 'stable' }) {
  const width = 64
  const height = 24
  const padding = 2

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((val - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  const color =
    trend === 'down'
      ? '#16a34a'
      : trend === 'up'
        ? '#dc2626'
        : '#6b7280'

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="r41-sparkline-svg"
      fill="none"
    >
      <path d={pathD} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)}
        cy={height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2)}
        r={2}
        fill={color}
      />
    </svg>
  )
}

function getTrend(history: number[]): 'down' | 'up' | 'stable' {
  if (history.length < 2) return 'stable'
  const diff = history[history.length - 1] - history[0]
  if (diff < -0.5) return 'down'
  if (diff > 0.5) return 'up'
  return 'stable'
}

// ── Animated Counter ──────────────────────────────────────────────
function AnimatedSavingsCounter({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1200
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = value * eased
      setDisplayed(start)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [value])

  return (
    <motion.span
      key={Math.round(value)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      className="r41-savings-counter tabular-nums"
    >
      R$ {displayed.toFixed(2).replace('.', ',')}
    </motion.span>
  )
}

// ── Best Price Badge with Sparkle ──────────────────────────────────
function BestPriceBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring' as const, stiffness: 500, damping: 18 }}
      className="relative r41-best-badge"
    >
      <div className="relative flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
        <Sparkles className="h-3 w-3" />
        <span>Menor Preço</span>
        {/* Sparkle particles */}
        <motion.div
          className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-300"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="absolute -top-0.5 right-2 h-1.5 w-1.5 rounded-full bg-white"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute -bottom-1 -left-0.5 h-1.5 w-1.5 rounded-full bg-yellow-200"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        />
      </div>
    </motion.div>
  )
}

// ── Price Alert Toggle ────────────────────────────────────────────
function PriceAlertToggle({
  product,
  bestPrice,
  isActive,
  onToggle,
}: {
  product: ProductEntry
  bestPrice: number
  isActive: boolean
  onToggle: () => void
}) {
  return (
    <motion.div whileTap={{ scale: 0.95 }} className="r41-alert-toggle-wrapper">
      <motion.div
        whileHover={{ scale: 1.04 }}
        className="r41-alert-toggle-hover"
      >
        <Button
          variant={isActive ? 'default' : 'outline'}
          size="sm"
          onClick={onToggle}
          className={`gap-1.5 text-[11px] font-semibold transition-colors r41-alert-btn ${
            isActive
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0'
              : ''
          }`}
        >
          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.span
                key="bell-on"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              >
                <Bell className="h-3.5 w-3.5" />
              </motion.span>
            ) : (
              <motion.span
                key="bell-off"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              >
                <BellOff className="h-3.5 w-3.5" />
              </motion.span>
            )}
          </AnimatePresence>
          <span>{isActive ? 'Alerta Ativo' : 'Alerta de Preço'}</span>
        </Button>
      </motion.div>
      {isActive && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-[9px] text-amber-600 dark:text-amber-400 mt-1 text-center"
        >
          Notificar quando &lt; R$ {((bestPrice * 0.95) / 1).toFixed(2).replace('.', ',')}
        </motion.p>
      )}
    </motion.div>
  )
}

// ── Recommendation Card ────────────────────────────────────────────
function RecommendationCard({
  type,
  title,
  icon,
  productName,
  storeName,
  price,
  reasoning,
  color,
  delay,
}: {
  type: string
  title: string
  icon: React.ReactNode
  productName: string
  storeName: string
  price: number
  reasoning: string
  color: string
  delay: number
}) {
  const bgColorMap: Record<string, string> = {
    green: 'from-emerald-500/10 to-green-500/5 border-emerald-500/20',
    blue: 'from-blue-500/10 to-sky-500/5 border-blue-500/20',
    amber: 'from-amber-500/10 to-yellow-500/5 border-amber-500/20',
  }

  const textColorMap: Record<string, string> = {
    green: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
  }

  const iconBgMap: Record<string, string> = {
    green: 'bg-emerald-500/15',
    blue: 'bg-blue-500/15',
    amber: 'bg-amber-500/15',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 20, delay }}
      className={`r41-rec-card bg-gradient-to-br ${bgColorMap[color]} border rounded-xl p-3.5`}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`h-8 w-8 rounded-lg ${iconBgMap[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold leading-tight">{title}</p>
          <p className={`text-[9px] font-semibold ${textColorMap[color]}`}>
            {type}
          </p>
        </div>
        <BrainCircuit className={`h-4 w-4 ml-auto ${textColorMap[color]} opacity-60`} />
      </div>

      <div className="bg-background/50 rounded-lg p-2.5 mb-2">
        <p className="text-[11px] font-bold truncate">{productName}</p>
        <p className="text-[10px] text-muted-foreground">{storeName}</p>
        <p className="text-sm font-bold text-primary mt-1">
          R$ {price.toFixed(2).replace('.', ',')}
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed italic flex items-start gap-1">
        <span className="shrink-0 mt-px">💡</span>
        {reasoning}
      </p>
    </motion.div>
  )
}

// ── Filter Pills ───────────────────────────────────────────────────
function FilterPills({
  categories,
  activeCategory,
  onCategoryChange,
  sortOption,
  onSortChange,
}: {
  categories: { value: FilterCategory; label: string }[]
  activeCategory: FilterCategory
  onCategoryChange: (cat: FilterCategory) => void
  sortOption: SortOption
  onSortChange: (sort: SortOption) => void
}) {
  const [showSort, setShowSort] = useState(false)

  const sortLabels: Record<SortOption, string> = {
    'price-asc': 'Menor Preço',
    'price-desc': 'Maior Preço',
    rating: 'Melhor Avaliação',
    delivery: 'Entrega Rápida',
    discount: 'Maior Desconto',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
      className="r41-filter-bar flex flex-wrap items-center gap-2"
    >
      <div className="flex items-center gap-1.5 mr-1">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold text-muted-foreground">Filtros:</span>
      </div>

      <AnimatePresence>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.value
          return (
            <motion.div
              key={cat.value}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 22 }}
            >
              <motion.div whileTap={{ scale: 0.93 }}>
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onCategoryChange(cat.value)}
                  className={`text-[11px] px-3 py-1 h-7 rounded-full font-semibold transition-all r41-filter-pill ${
                    isActive ? '' : 'hover:bg-primary/10'
                  }`}
                >
                  {cat.label}
                </Button>
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <div className="ml-auto relative">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSort(!showSort)}
            className="text-[11px] gap-1.5 h-7 rounded-full r41-sort-toggle"
          >
            <ArrowUpDown className="h-3 w-3" />
            <span className="hidden sm:inline">{sortLabels[sortOption]}</span>
            <span className="sm:hidden">Ordenar</span>
            <motion.div
              animate={{ rotate: showSort ? 180 : 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            >
              <ChevronDown className="h-3 w-3" />
            </motion.div>
          </Button>
        </motion.div>

        <AnimatePresence>
          {showSort && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setShowSort(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ type: 'spring' as const, stiffness: 350, damping: 22 }}
                className="absolute right-0 top-full mt-1 z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[160px] r41-sort-dropdown"
              >
                {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSortChange(key)
                      setShowSort(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-accent r41-sort-option ${
                      sortOption === key ? 'bg-accent text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {sortLabels[key]}
                  </motion.button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Store Row in Comparison Table ────────────────────────────────
function StoreOfferRow({
  offer,
  isBest,
  rank,
}: {
  offer: StoreOffer
  isBest: boolean
  rank: number
}) {
  const trend = getTrend(offer.priceHistory)

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 24, delay: rank * 0.05 }}
      className={`r41-offer-row border-b last:border-b-0 transition-colors ${
        isBest ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : 'hover:bg-muted/50'
      }`}
    >
      {/* Rank */}
      <td className="px-3 py-2.5 text-center">
        <span className={`text-xs font-bold ${rank === 1 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
          #{rank}
        </span>
      </td>

      {/* Store */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">{offer.storeLogo}</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate max-w-[120px] sm:max-w-[180px]">{offer.storeName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-medium">{offer.rating.toFixed(1)}</span>
              <span className="text-[9px] text-muted-foreground">({offer.reviewCount})</span>
            </div>
          </div>
        </div>
      </td>

      {/* Trend */}
      <td className="px-3 py-2.5 hidden sm:table-cell">
        <SparklineChart data={offer.priceHistory} trend={trend} />
        <p className={`text-[9px] font-medium mt-0.5 ${
          trend === 'down' ? 'text-emerald-600' : trend === 'up' ? 'text-red-500' : 'text-muted-foreground'
        }`}>
          {trend === 'down' ? '↓ Queda' : trend === 'up' ? '↑ Alta' : '→ Estável'}
        </p>
      </td>

      {/* Discount */}
      <td className="px-3 py-2.5 text-center">
        {offer.discount > 0 ? (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] px-1.5 py-0 h-5 font-bold r41-discount-badge">
            <Percent className="h-2.5 w-2.5 mr-0.5" />
            -{offer.discount}%
          </Badge>
        ) : (
          <span className="text-[10px] text-muted-foreground">—</span>
        )}
      </td>

      {/* Price */}
      <td className="px-3 py-2.5 text-right">
        <div className="flex flex-col items-end">
          <span className={`text-sm font-bold ${isBest ? 'text-emerald-600' : ''} r41-price-value`}>
            R$ {offer.price.toFixed(2).replace('.', ',')}
          </span>
          {offer.originalPrice > offer.price && (
            <span className="text-[10px] text-muted-foreground line-through">
              R$ {offer.originalPrice.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
      </td>

      {/* Delivery */}
      <td className="px-3 py-2.5 text-center hidden sm:table-cell">
        <div className="flex items-center justify-center gap-1">
          <Truck className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-medium">{formatDeliveryHours(offer.deliveryHours)}</span>
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5">
          {offer.deliveryFee === 0 ? (
            <span className="text-emerald-600 font-medium">Grátis</span>
          ) : (
            <span>R$ {offer.deliveryFee.toFixed(2).replace('.', ',')}</span>
          )}
        </p>
      </td>

      {/* Best Badge */}
      <td className="px-3 py-2.5 text-center w-[80px]">
        {isBest && <BestPriceBadge />}
      </td>
    </motion.tr>
  )
}

// ── Product Comparison Card ──────────────────────────────────────
function ProductComparisonCard({
  product,
  sortedOffers,
  bestOffer,
  priceAlerts,
  onToggleAlert,
}: {
  product: ProductEntry
  sortedOffers: StoreOffer[]
  bestOffer: StoreOffer
  priceAlerts: PriceAlert[]
  onToggleAlert: (productId: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const highestPrice = getHighestPrice(product.offers)
  const savings = highestPrice - bestOffer.price
  const isAlertActive = priceAlerts.some((a) => a.productId === product.productId && a.active)
  const trend = getTrend(bestOffer.priceHistory)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="r41-product-card"
    >
      <Card className="overflow-hidden border-border/50">
        {/* Product Header */}
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
              >
                {product.emoji}
              </motion.span>
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold truncate r41-product-title">{product.productName}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-5 font-medium r41-category-badge">
                    {CATEGORY_LABELS[product.category] || product.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {sortedOffers.length} lojas
                  </span>
                  <div className="flex items-center gap-0.5">
                    {trend === 'down' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                      >
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] px-1.5 py-0 h-5 font-bold gap-0.5">
                          <TrendingDown className="h-2.5 w-2.5" />
                          Preço caindo
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              <PriceAlertToggle
                product={product}
                bestPrice={bestOffer.price}
                isActive={isAlertActive}
                onToggle={() => onToggleAlert(product.productId)}
              />
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="h-7 w-7 p-0 r41-expand-btn"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={expanded ? 'up' : 'down'}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                    >
                      {expanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Savings Summary */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <motion.div
              className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            >
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                Economia:
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 r41-savings-value">
                <AnimatedSavingsCounter value={savings} />
              </span>
            </motion.div>

            <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5">
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium">
                Melhor: R$ {bestOffer.price.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5">
              <Target className="h-3 w-3 text-blue-600" />
              <span className="text-[10px] text-blue-600 font-medium">
                {sortedOffers.filter((o) => o.inStock).length}/{sortedOffers.length} em estoque
              </span>
            </div>
          </div>
        </CardHeader>

        {/* Comparison Table */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
              className="overflow-hidden"
            >
              <CardContent className="px-0 py-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-muted/30 r41-table-header">
                        <th className="px-3 py-2 text-[10px] font-semibold text-muted-foreground text-center w-10">#</th>
                        <th className="px-3 py-2 text-[10px] font-semibold text-muted-foreground">Loja</th>
                        <th className="px-3 py-2 text-[10px] font-semibold text-muted-foreground hidden sm:table-cell">Tendência</th>
                        <th className="px-3 py-2 text-[10px] font-semibold text-muted-foreground text-center">Desconto</th>
                        <th className="px-3 py-2 text-[10px] font-semibold text-muted-foreground text-right">Preço</th>
                        <th className="px-3 py-2 text-[10px] font-semibold text-muted-foreground text-center hidden sm:table-cell">Entrega</th>
                        <th className="px-3 py-2 text-[10px] font-semibold text-muted-foreground text-center w-[80px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedOffers.map((offer, i) => (
                        <StoreOfferRow
                          key={offer.storeId}
                          offer={offer}
                          isBest={offer.storeId === bestOffer.storeId}
                          rank={i + 1}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Out of stock notice */}
                {sortedOffers.some((o) => !o.inStock) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-2 border-t bg-amber-500/5"
                  >
                    <p className="text-[10px] text-amber-600 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Algumas lojas estão sem estoque no momento
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export function PriceComparisonBot() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all')
  const [sortOption, setSortOption] = useState<SortOption>('price-asc')
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([])
  const [showRecommendations, setShowRecommendations] = useState(true)
  const searchRef = useRef<HTMLDivElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Mount check
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load persisted data
  useEffect(() => {
    if (!mounted) return
    setRecentSearches(loadRecentSearches())
    setPriceAlerts(loadPriceAlerts())
  }, [mounted])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Filter suggestions
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return SEARCH_SUGGESTIONS.slice(0, 5)
    const q = searchQuery.toLowerCase()
    return SEARCH_SUGGESTIONS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.includes(q)
    ).slice(0, 5)
  }, [searchQuery])

  // Filter products
  const filteredProducts = useMemo(() => {
    let products = [...MOCK_PRODUCTS]

    // Category filter
    if (activeCategory !== 'all') {
      products = products.filter((p) => p.category === activeCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      products = products.filter(
        (p) => p.productName.toLowerCase().includes(q) || p.category.includes(q)
      )
    }

    return products
  }, [searchQuery, activeCategory])

  // Sort products by their best offer
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const aBest = getBestOffer(a.offers)
      const bBest = getBestOffer(b.offers)
      switch (sortOption) {
        case 'price-asc':
          return aBest.price - bBest.price
        case 'price-desc':
          return bBest.price - aBest.price
        case 'rating':
          return bBest.rating - aBest.rating
        case 'delivery':
          return aBest.deliveryHours - bBest.deliveryHours
        case 'discount':
          return bBest.discount - aBest.discount
        default:
          return 0
      }
    })
  }, [filteredProducts, sortOption])

  // Sort offers within each product
  const getSortedOffers = useCallback(
    (product: ProductEntry): StoreOffer[] => {
      const offers = [...product.offers]
      return offers.sort((a, b) => {
        switch (sortOption) {
          case 'price-asc':
            return a.price - b.price
          case 'price-desc':
            return b.price - a.price
          case 'rating':
            return b.rating - a.rating
          case 'delivery':
            return a.deliveryHours - b.deliveryHours
          case 'discount':
            return b.discount - a.discount
          default:
            return a.price - b.price
        }
      })
    },
    [sortOption]
  )

  // Handle search
  const handleSearch = useCallback(
    (term?: string) => {
      const query = term || searchQuery
      if (!query.trim()) return
      setSearchQuery(query)
      setShowSuggestions(false)

      const newSearch: RecentSearch = {
        id: `${Date.now()}`,
        term: query,
        timestamp: Date.now(),
      }
      const updated = [newSearch, ...recentSearches.filter((s) => s.term !== query)].slice(0, 8)
      setRecentSearches(updated)
      saveRecentSearches(updated)
    },
    [searchQuery, recentSearches]
  )

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (name: string) => {
      setSearchQuery(name)
      handleSearch(name)
    },
    [handleSearch]
  )

  // Handle recent search click
  const handleRecentClick = useCallback(
    (term: string) => {
      setSearchQuery(term)
      handleSearch(term)
    },
    [handleSearch]
  )

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setShowSuggestions(false)
  }, [])

  // Toggle price alert
  const handleToggleAlert = useCallback(
    (productId: string) => {
      const product = MOCK_PRODUCTS.find((p) => p.productId === productId)
      if (!product) return

      const best = getBestOffer(product.offers)
      const existing = priceAlerts.find((a) => a.productId === productId)

      let updated: PriceAlert[]
      if (existing) {
        updated = priceAlerts.map((a) =>
          a.productId === productId ? { ...a, active: !a.active } : a
        )
      } else {
        updated = [
          ...priceAlerts,
          {
            productId,
            productName: product.productName,
            targetPrice: Math.round(best.price * 0.95 * 100) / 100,
            currentBest: best.price,
            active: true,
          },
        ]
      }

      setPriceAlerts(updated)
      savePriceAlerts(updated)

      const isActive = existing ? !existing.active : true
      toast.success(
        isActive
          ? `Alerta de preço ativado para ${product.productName}`
          : `Alerta de preço desativado para ${product.productName}`
      )
    },
    [priceAlerts]
  )

  // Clear a recent search
  const clearRecentSearch = useCallback((id: string) => {
    const current = loadRecentSearches()
    const updated = current.filter((s) => s.id !== id)
    setRecentSearches(updated)
    saveRecentSearches(updated)
  }, [])

  // Generate AI recommendations
  const recommendations = useMemo(() => {
    const allOffers = MOCK_PRODUCTS.flatMap((p) =>
      p.offers.map((o) => ({ ...o, product: p }))
    )

    // Melhor Custo-Benefício: best price/rating ratio
    const bestValue = allOffers
      .filter((o) => o.inStock)
      .sort((a, b) => {
        const aScore = a.price / a.rating
        const bScore = b.price / b.rating
        return aScore - bScore
      })[0]

    // Entrega Mais Rápida
    const fastest = allOffers
      .filter((o) => o.inStock)
      .sort((a, b) => a.deliveryHours - b.deliveryHours)[0]

    // Mais Bem Avaliada
    const bestRated = allOffers
      .filter((o) => o.inStock)
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)[0]

    return [
      bestValue && {
        type: 'Melhor Custo-Benefício',
        title: 'Preço perfeito vs qualidade',
        icon: <Award className="h-4 w-4 text-emerald-600" />,
        productName: bestValue.product.productName,
        storeName: bestValue.storeName,
        price: bestValue.price,
        reasoning: `Por R$ ${bestValue.price.toFixed(2).replace('.', ',')} com nota ${bestValue.rating.toFixed(1)}, esta loja oferece o melhor equilíbrio entre preço e satisfação dos clientes.`,
        color: 'green' as const,
      },
      fastest && {
        type: 'Entrega Mais Rápida',
        title: 'Receba o mais cedo possível',
        icon: <Clock className="h-4 w-4 text-blue-600" />,
        productName: fastest.product.productName,
        storeName: fastest.storeName,
        price: fastest.price,
        reasoning: `Chega em ${formatDeliveryHours(fastest.deliveryHours)} com frete ${fastest.deliveryFee === 0 ? 'grátis' : `de R$ ${fastest.deliveryFee.toFixed(2).replace('.', ',')}`}. Ideal se você precisa com urgência!`,
        color: 'blue' as const,
      },
      bestRated && {
        type: 'Mais Bem Avaliada',
        title: 'Aprovada pelos clientes',
        icon: <ThumbsUp className="h-4 w-4 text-amber-600" />,
        productName: bestRated.product.productName,
        storeName: bestRated.storeName,
        price: bestRated.price,
        reasoning: `Com ${bestRated.rating.toFixed(1)} estrelas e ${bestRated.reviewCount} avaliações, é a opção mais confiável. Vale cada centavo!`,
        color: 'amber' as const,
      },
    ].filter(Boolean)
  }, [])

  // Category filter options
  const categories: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'alimentos', label: '🍚 Alimentos' },
    { value: 'eletronicos', label: '📱 Eletrônicos' },
    { value: 'beleza', label: '💇 Beleza' },
    { value: 'casa', label: '🧹 Casa' },
    { value: 'saude', label: '💊 Saúde' },
  ]

  // Total potential savings
  const totalSavings = useMemo(() => {
    return sortedProducts.reduce((acc, p) => {
      const best = getBestOffer(p.offers)
      const highest = getHighestPrice(p.offers)
      return acc + (highest - best.price)
    }, 0)
  }, [sortedProducts])

  if (!mounted) return null

  return (
    <section className="mt-6">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
        className="flex items-center justify-between mb-4 r41-section-header"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(16, 185, 129, 0)',
                '0 0 20px 4px rgba(16, 185, 129, 0.2)',
                '0 0 0 0 rgba(16, 185, 129, 0)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 flex items-center justify-center shadow-md"
          >
            <BadgePercent className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-1.5">
              Comparador de Preços
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 3 }}
              >
                🤖
              </motion.span>
            </h2>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Encontre o menor preço com inteligência artificial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalSavings > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            >
              <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold r41-total-savings-badge">
                <Zap className="h-3 w-3 mr-1" />
                Economia total: R$ {totalSavings.toFixed(2).replace('.', ',')}
              </Badge>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 24, delay: 0.1 }}
        className="mb-4 r41-search-wrapper"
        ref={searchRef}
      >
        <div className="relative">
          <motion.div
            className="absolute left-3 top-1/2 -translate-y-1/2"
            animate={searchQuery ? { scale: 1.1, color: '#16a34a' } : { scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </motion.div>
          <Input
            placeholder="Buscar produto para comparar preços..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
            className="pl-10 pr-10 h-11 text-sm rounded-xl border-primary/20 focus:border-primary r41-search-input bg-card"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0 rounded-full r41-clear-btn"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && (filteredSuggestions.length > 0 || recentSearches.length > 0) && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: 'spring' as const, stiffness: 350, damping: 24 }}
              className="absolute z-50 w-full mt-1 bg-popover border rounded-xl shadow-lg overflow-hidden r41-suggestions-dropdown"
            >
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="border-b">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                      <History className="h-3 w-3" />
                      Buscas recentes
                    </span>
                  </div>
                  {recentSearches.slice(0, 4).map((rs) => (
                    <motion.button
                      key={rs.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRecentClick(rs.term)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-accent transition-colors text-left r41-recent-item"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <History className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{rs.term}</span>
                      </div>
                      <motion.div
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          clearRecentSearch(rs.id)
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground shrink-0" />
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Product suggestions */}
              <div className="px-1 py-1">
                {filteredSuggestions.map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 22, delay: i * 0.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestionClick(s.name)}
                    className="w-full flex items-center gap-2.5 px-2 py-2 text-xs rounded-lg hover:bg-accent transition-colors text-left r41-suggestion-item"
                  >
                    <span className="text-base">{s.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[s.category] || s.category}</p>
                    </div>
                    <Store className="h-3 w-3 text-muted-foreground shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Filter Pills */}
      <div className="mb-4">
        <FilterPills
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />
      </div>

      {/* AI Recommendations */}
      <AnimatePresence>
        {showRecommendations && sortedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ type: 'spring' as const, stiffness: 260, damping: 22, delay: 0.15 }}
            className="mb-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <BrainCircuit className="h-4 w-4 text-primary" />
                </motion.div>
                <h3 className="text-sm font-bold">Recomendações da IA</h3>
              </div>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRecommendations(false)}
                  className="text-[10px] text-muted-foreground h-7 r41-hide-rec-btn"
                >
                  Ocultar
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommendations.map((rec, i) => (
                <RecommendationCard
                  key={rec.type}
                  type={rec.type}
                  title={rec.title}
                  icon={rec.icon}
                  productName={rec.productName}
                  storeName={rec.storeName}
                  price={rec.price}
                  reasoning={rec.reasoning}
                  color={rec.color}
                  delay={i * 0.1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show recommendations toggle */}
      <AnimatePresence>
        {!showRecommendations && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mb-4 flex justify-center"
          >
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecommendations(true)}
                className="text-[11px] gap-1.5 r41-show-rec-btn"
              >
                <BrainCircuit className="h-3.5 w-3.5" />
                Ver recomendações da IA
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Comparison Cards */}
      <div className="space-y-4 r41-comparison-list">
        <AnimatePresence mode="popLayout">
          {sortedProducts.map((product) => {
            const sorted = getSortedOffers(product)
            const best = getBestOffer(sorted)
            return (
              <ProductComparisonCard
                key={product.productId}
                product={product}
                sortedOffers={sorted}
                bestOffer={best}
                priceAlerts={priceAlerts}
                onToggleAlert={handleToggleAlert}
              />
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      <AnimatePresence>
        {sortedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-center justify-center py-16 text-center r41-empty-state"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl mb-4"
            >
              🔍
            </motion.div>
            <h3 className="text-base font-bold">Nenhum produto encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
              Tente buscar por outro termo ou altere os filtros para ver comparações de preços.
            </p>
            <motion.div whileTap={{ scale: 0.95 }} className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSearch}
                className="gap-1.5 r41-clear-search-btn"
              >
                <X className="h-3.5 w-3.5" />
                Limpar busca
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Alerts Summary */}
      <AnimatePresence>
        {priceAlerts.filter((a) => a.active).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
            className="mt-5 r41-alerts-summary"
          >
            <Card className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    Alertas de Preço Ativos ({priceAlerts.filter((a) => a.active).length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {priceAlerts
                    .filter((a) => a.active)
                    .map((alert) => (
                      <motion.div
                        key={alert.productId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-1.5"
                      >
                        <span className="text-[11px] font-medium truncate mr-2">{alert.productName}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground">
                            Alvo: R$ {alert.targetPrice.toFixed(2).replace('.', ',')}
                          </span>
                          <Badge className="text-[9px] px-1.5 py-0 h-5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                            R$ {alert.currentBest.toFixed(2).replace('.', ',')}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton placeholder (for initial feel) */}
      {false && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
