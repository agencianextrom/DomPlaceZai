'use client'

import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Star,
  Truck,
  Sparkles,
  Bell,
  BellOff,
  TrendingDown,
  ChevronRight,
  Clock,
  ArrowUpDown,
  Tag,
  History,
  PiggyBank,
  RotateCcw,
  X,
  Store,
  Medal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cachedFetch } from '@/lib/cached-fetch'

// ── Types ──────────────────────────────────────────────────────────
interface StoreOffer {
  storeId: string
  storeName: string
  price: number
  originalPrice: number
  discount: number
  rating: number
  deliveryMinutes: number
  storeInitials: string
}

interface DealProduct {
  id: string
  name: string
  category: string
  emoji: string
  unit: string
  offers: StoreOffer[]
}

interface RecentComparison {
  id: string
  name: string
  emoji: string
  bestPrice: number
  comparedAt: number
}

type SortOption = 'price-asc' | 'discount' | 'rating'

const CATEGORIES = [
  'Todos',
  'Hortifruti',
  'Padaria',
  'Bebidas',
  'Limpeza',
  'Frios',
  'Cereais',
] as const

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'discount', label: 'Maior desconto' },
  { value: 'rating', label: 'Melhor avaliação' },
]

// ── Fallback Data ──────────────────────────────────────────────────
const FALLBACK_DEALS: DealProduct[] = [
  {
    id: 'deal-001',
    name: 'Arroz 5kg',
    category: 'Hortifruti',
    emoji: '🍚',
    unit: 'pacote',
    offers: [
      {
        storeId: 's1',
        storeName: 'Mercado do Zé',
        price: 24.9,
        originalPrice: 29.3,
        discount: 15,
        rating: 4.6,
        deliveryMinutes: 35,
        storeInitials: 'MZ',
      },
      {
        storeId: 's2',
        storeName: 'Supermercado Bom Preço',
        price: 27.9,
        originalPrice: 30.33,
        discount: 8,
        rating: 4.3,
        deliveryMinutes: 45,
        storeInitials: 'BP',
      },
      {
        storeId: 's3',
        storeName: 'Atacadão',
        price: 22.5,
        originalPrice: 28.85,
        discount: 22,
        rating: 4.4,
        deliveryMinutes: 60,
        storeInitials: 'AC',
      },
      {
        storeId: 's4',
        storeName: 'Padaria Nova',
        price: 28.9,
        originalPrice: 30.42,
        discount: 5,
        rating: 4.7,
        deliveryMinutes: 25,
        storeInitials: 'PN',
      },
    ],
  },
  {
    id: 'deal-002',
    name: 'Feijão Carioca 1kg',
    category: 'Cereais',
    emoji: '🫘',
    unit: 'pacote',
    offers: [
      {
        storeId: 's1',
        storeName: 'Mercado do Zé',
        price: 8.9,
        originalPrice: 8.9,
        discount: 0,
        rating: 4.6,
        deliveryMinutes: 35,
        storeInitials: 'MZ',
      },
      {
        storeId: 's3',
        storeName: 'Atacadão',
        price: 7.5,
        originalPrice: 8.93,
        discount: 16,
        rating: 4.4,
        deliveryMinutes: 60,
        storeInitials: 'AC',
      },
      {
        storeId: 's5',
        storeName: 'Mini Box',
        price: 9.9,
        originalPrice: 9.9,
        discount: 0,
        rating: 4.1,
        deliveryMinutes: 20,
        storeInitials: 'MB',
      },
    ],
  },
  {
    id: 'deal-003',
    name: 'Leite Integral 1L',
    category: 'Bebidas',
    emoji: '🥛',
    unit: 'unidade',
    offers: [
      {
        storeId: 's2',
        storeName: 'Supermercado Bom Preço',
        price: 5.9,
        originalPrice: 6.7,
        discount: 12,
        rating: 4.3,
        deliveryMinutes: 45,
        storeInitials: 'BP',
      },
      {
        storeId: 's1',
        storeName: 'Mercado do Zé',
        price: 6.49,
        originalPrice: 6.49,
        discount: 0,
        rating: 4.6,
        deliveryMinutes: 35,
        storeInitials: 'MZ',
      },
      {
        storeId: 's4',
        storeName: 'Padaria Nova',
        price: 5.5,
        originalPrice: 6.71,
        discount: 18,
        rating: 4.7,
        deliveryMinutes: 25,
        storeInitials: 'PN',
      },
    ],
  },
  {
    id: 'deal-004',
    name: 'Frango Inteiro kg',
    category: 'Frios',
    emoji: '🍗',
    unit: 'quilo',
    offers: [
      {
        storeId: 's6',
        storeName: 'Açougue do Seu João',
        price: 16.9,
        originalPrice: 16.9,
        discount: 0,
        rating: 4.8,
        deliveryMinutes: 30,
        storeInitials: 'AJ',
      },
      {
        storeId: 's2',
        storeName: 'Supermercado Bom Preço',
        price: 19.9,
        originalPrice: 23.41,
        discount: 15,
        rating: 4.3,
        deliveryMinutes: 45,
        storeInitials: 'BP',
      },
      {
        storeId: 's3',
        storeName: 'Atacadão',
        price: 17.5,
        originalPrice: 19.89,
        discount: 12,
        rating: 4.4,
        deliveryMinutes: 60,
        storeInitials: 'AC',
      },
    ],
  },
  {
    id: 'deal-005',
    name: 'Detergente 500ml',
    category: 'Limpeza',
    emoji: '🧴',
    unit: 'unidade',
    offers: [
      {
        storeId: 's5',
        storeName: 'Mini Box',
        price: 3.29,
        originalPrice: 4.01,
        discount: 18,
        rating: 4.1,
        deliveryMinutes: 20,
        storeInitials: 'MB',
      },
      {
        storeId: 's2',
        storeName: 'Supermercado Bom Preço',
        price: 3.99,
        originalPrice: 4.43,
        discount: 10,
        rating: 4.3,
        deliveryMinutes: 45,
        storeInitials: 'BP',
      },
      {
        storeId: 's1',
        storeName: 'Mercado do Zé',
        price: 4.29,
        originalPrice: 4.29,
        discount: 0,
        rating: 4.6,
        deliveryMinutes: 35,
        storeInitials: 'MZ',
      },
    ],
  },
  {
    id: 'deal-006',
    name: 'Pão Francês dz',
    category: 'Padaria',
    emoji: '🥖',
    unit: 'dúzia',
    offers: [
      {
        storeId: 's4',
        storeName: 'Padaria Nova',
        price: 8.9,
        originalPrice: 8.9,
        discount: 0,
        rating: 4.7,
        deliveryMinutes: 25,
        storeInitials: 'PN',
      },
      {
        storeId: 's7',
        storeName: 'Padaria do Paulo',
        price: 7.9,
        originalPrice: 8.88,
        discount: 11,
        rating: 4.5,
        deliveryMinutes: 30,
        storeInitials: 'PP',
      },
      {
        storeId: 's1',
        storeName: 'Mercado do Zé',
        price: 9.5,
        originalPrice: 9.5,
        discount: 0,
        rating: 4.6,
        deliveryMinutes: 35,
        storeInitials: 'MZ',
      },
    ],
  },
]

// ── Helpers ────────────────────────────────────────────────────────
function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

function getBestOffer(offers: StoreOffer[]): StoreOffer {
  return offers.reduce((best, o) => (o.price < best.price ? o : best), offers[0])
}

function getHighestPrice(offers: StoreOffer[]): number {
  return Math.max(...offers.map((o) => o.originalPrice))
}

function loadPriceAlerts(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem('r72-price-alerts') === 'true'
  } catch {
    return false
  }
}

function savePriceAlerts(enabled: boolean): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('r72-price-alerts', JSON.stringify(enabled))
  } catch {
    // ignore
  }
}

function loadRecentComparisons(): RecentComparison[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('r72-recent-comparisons')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentComparisons(items: RecentComparison[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('r72-recent-comparisons', JSON.stringify(items.slice(0, 5)))
  } catch {
    // ignore
  }
}

function addRecentComparison(product: DealProduct): void {
  const existing = loadRecentComparisons()
  const best = getBestOffer(product.offers)
  const newItem: RecentComparison = {
    id: product.id,
    name: product.name,
    emoji: product.emoji,
    bestPrice: best.price,
    comparedAt: Date.now(),
  }
  const filtered = existing.filter((e) => e.id !== product.id)
  saveRecentComparisons([newItem, ...filtered])
}

// ── useReducedMotion hook ──────────────────────────────────────────
function useReducedMotion(): boolean {
  const subscribe = useCallback((callback: () => void) => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', callback)
    return () => mq.removeEventListener('change', callback)
  }, [])

  const getSnapshot = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

// ── Rating Stars ───────────────────────────────────────────────────
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="text-[10px] text-muted-foreground ml-1 font-medium">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

// ── Store Avatar ───────────────────────────────────────────────────
function StoreAvatar({ initials }: { initials: string }) {
  const gradients = [
    'from-orange-400 to-red-400',
    'from-emerald-400 to-teal-500',
    'from-violet-400 to-purple-500',
    'from-amber-400 to-yellow-500',
    'from-rose-400 to-pink-500',
    'from-cyan-400 to-sky-500',
  ]
  const idx =
    initials.charCodeAt(0) % gradients.length
  const gradient = gradients[idx]

  return (
    <div
      className={`h-10 w-10 min-h-[44px] min-w-[44px] rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}
    >
      {initials}
    </div>
  )
}

// ── Store Offer Row ────────────────────────────────────────────────
function StoreOfferRow({
  offer,
  isBest,
  index,
  onCompare,
  prefersReduced,
}: {
  offer: StoreOffer
  isBest: boolean
  index: number
  onCompare: () => void
  prefersReduced: boolean
}) {
  const savings = offer.originalPrice - offer.price
  const savingsPercent =
    offer.originalPrice > 0
      ? Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100)
      : 0

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: 'spring' as const,
        stiffness: 260,
        damping: 22,
        delay: index * 0.06,
      }}
      className={`r72-store-row relative flex items-center gap-3 rounded-xl p-3 transition-colors ${
        isBest
          ? 'bg-emerald-500/8 border border-emerald-500/20 border-l-[3px] border-l-emerald-500'
          : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
      }`}
    >
      {/* Best badge overlay */}
      {isBest && (
        <div className="absolute -top-2 -right-1 z-10">
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[9px] px-2 py-0 h-5 font-bold border-0 gap-1 r72-price-badge">
            <Medal className="h-2.5 w-2.5" />
            Melhor oferta
          </Badge>
        </div>
      )}

      {/* Store avatar */}
      <StoreAvatar initials={offer.storeInitials} />

      {/* Store info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{offer.storeName}</p>
        <div className="flex items-center gap-2 mt-1">
          <RatingStars rating={offer.rating} />
          <div className="flex items-center gap-1 text-muted-foreground">
            <Truck className="h-3 w-3" />
            <span className="text-[10px] font-medium">{offer.deliveryMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Price + action */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div className="text-right">
          <p
            className={`text-lg font-bold tabular-nums ${
              isBest ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
            }`}
          >
            {formatBRL(offer.price)}
          </p>
          {offer.discount > 0 && (
            <p className="text-xs text-muted-foreground line-through tabular-nums">
              {formatBRL(offer.originalPrice)}
            </p>
          )}
        </div>

        {savings > 0 && (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0 h-5 font-semibold gap-1 r72-price-badge">
            <TrendingDown className="h-2.5 w-2.5" />
            Economia: {savingsPercent}%
          </Badge>
        )}

        <motion.div
          whileTap={prefersReduced ? undefined : { scale: 0.95 }}
          style={{ transformOrigin: 'center center' }}
        >
          <Button
            variant={isBest ? 'default' : 'outline'}
            size="sm"
            onClick={onCompare}
            className={`min-h-[44px] min-w-[44px] text-xs font-semibold gap-1.5 ${
              isBest
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-md hover:from-emerald-600 hover:to-green-700'
                : 'hover:bg-primary hover:text-primary-foreground'
            }`}
          >
            Ver oferta
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Product Deal Card ──────────────────────────────────────────────
function ProductDealCard({
  product,
  sortOption,
  onCompare,
  prefersReduced,
  index,
}: {
  product: DealProduct
  sortOption: SortOption
  onCompare: (product: DealProduct) => void
  prefersReduced: boolean
  index: number
}) {
  const sortedOffers = useMemo(() => {
    const sorted = [...product.offers]
    switch (sortOption) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price)
      case 'discount':
        return sorted.sort((a, b) => b.discount - a.discount)
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating)
      default:
        return sorted
    }
  }, [product.offers, sortOption])

  const bestOffer = getBestOffer(sortedOffers)
  const highestPrice = getHighestPrice(product.offers)
  const totalSavings = highestPrice - bestOffer.price
  const gradients = [
    'from-amber-300 via-orange-300 to-red-300',
    'from-emerald-300 via-teal-300 to-cyan-300',
    'from-violet-300 via-purple-300 to-fuchsia-300',
    'from-rose-300 via-pink-300 to-red-300',
    'from-sky-300 via-blue-300 to-indigo-300',
    'from-lime-300 via-green-300 to-emerald-300',
  ]
  const gradientIdx =
    product.id.charCodeAt(product.id.length - 1) % gradients.length

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring' as const,
        stiffness: 260,
        damping: 22,
        delay: index * 0.08,
      }}
      style={{ transformOrigin: 'top center' }}
      className="r72-deal-card"
    >
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        {/* Card Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            {/* Product image placeholder */}
            <div
              className={`h-16 w-16 min-h-[44px] min-w-[44px] rounded-xl bg-gradient-to-br ${gradients[gradientIdx]} flex items-center justify-center text-3xl shrink-0 shadow-md`}
            >
              {product.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold truncate">{product.name}</h3>
                <Badge variant="secondary" className="text-[10px] px-2 h-5 font-medium shrink-0">
                  {product.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {product.unit} · {sortedOffers.length} lojas comparadas
              </p>

              {/* Best price highlight */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Melhor preço: {formatBRL(bestOffer.price)}
                  </span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 rounded-full px-2.5 py-1">
                    <PiggyBank className="h-3 w-3 text-orange-600" />
                    <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400">
                      -{formatBRL(totalSavings)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Store offers list */}
        <div className="px-4 pb-4 flex flex-col gap-2">
          {sortedOffers.map((offer, i) => (
            <StoreOfferRow
              key={offer.storeId}
              offer={offer}
              isBest={offer.storeId === bestOffer.storeId}
              index={i}
              onCompare={() => onCompare(product)}
              prefersReduced={prefersReduced}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Savings Summary Card ───────────────────────────────────────────
function SavingsSummaryCard({
  totalSavings,
  productCount,
  prefersReduced,
}: {
  totalSavings: number
  productCount: number
  prefersReduced: boolean
}) {
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      }}
      style={{ transformOrigin: 'center center' }}
      className="r72-savings-card"
    >
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-5 text-white shadow-lg shadow-emerald-500/25">
        <div className="flex items-center gap-2 mb-3">
          <PiggyBank className="h-6 w-6" />
          <h3 className="text-base font-bold">Resumo de Economia</h3>
        </div>
        <p className="text-sm opacity-90 mb-1">
          Comparando <span className="font-bold">{productCount} produto{productCount !== 1 ? 's' : ''}</span>{' '}
          em sua vizinhança
        </p>
        <div className="flex items-baseline gap-1 mt-3">
          <span className="text-3xl font-extrabold tabular-nums">
            {formatBRL(totalSavings)}
          </span>
        </div>
        <p className="text-sm opacity-80 mt-2">
          Você pode economizar {formatBRL(totalSavings)} comparando preços
        </p>
        <div className="flex items-center gap-1.5 mt-3 bg-white/15 rounded-xl px-3 py-2 w-fit">
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium">
            Preços atualizados em tempo real
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ── Price Alert Toggle Section ──────────────────────────────────────
function PriceAlertToggleSection({
  enabled,
  onToggle,
  prefersReduced,
}: {
  enabled: boolean
  onToggle: () => void
  prefersReduced: boolean
}) {
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
      style={{ transformOrigin: 'left center' }}
      className="r72-alert-toggle"
    >
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileTap={prefersReduced ? undefined : { rotate: 15 }}
              style={{ transformOrigin: 'center center' }}
              className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md"
            >
              {enabled ? (
                <Bell className="h-5 w-5 text-white" />
              ) : (
                <BellOff className="h-5 w-5 text-white/70" />
              )}
            </motion.div>
            <div>
              <p className="text-sm font-bold">Ativar alertas de preço</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Receba notificações quando os preços baixarem
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            className="scale-110"
            aria-label="Ativar alertas de preço"
          />
        </div>
        <AnimatePresence>
          {enabled && (
            <motion.p
              initial={prefersReduced ? false : { opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={prefersReduced ? undefined : { opacity: 0, height: 0, marginTop: 0 }}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 rounded-lg px-3 py-2 mt-3 overflow-hidden"
            >
              ✓ Alertas ativados! Você será notificado sobre queda de preços nos seus produtos favoritos.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Recent Comparisons Section ─────────────────────────────────────
function RecentComparisonsSection({
  items,
  onSelect,
  onClear,
  prefersReduced,
}: {
  items: RecentComparison[]
  onSelect: (item: RecentComparison) => void
  onClear: () => void
  prefersReduced: boolean
}) {
  if (items.length === 0) return null

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
      style={{ transformOrigin: 'top center' }}
    >
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-bold">Comparações recentes</h3>
          </div>
          <motion.div whileTap={prefersReduced ? undefined : { scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="min-h-[44px] min-w-[44px] text-xs text-muted-foreground hover:text-destructive gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Limpar
            </Button>
          </motion.div>
        </div>

        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={prefersReduced ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: 'spring' as const,
                stiffness: 300,
                damping: 24,
                delay: i * 0.04,
              }}
              whileTap={prefersReduced ? undefined : { scale: 0.98 }}
              style={{ transformOrigin: 'left center' }}
              className="r72-comparison-item flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSelect(item)}
            >
              <div className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-xl bg-muted flex items-center justify-center text-xl">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.name}</p>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px]">
                    {new Date(item.comparedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatBRL(item.bestPrice)}
                </p>
                <p className="text-[9px] text-muted-foreground">melhor preço</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Component ─────────────────────────────────────────────────
export default function DealComparator() {
  const prefersReduced = useReducedMotion()

  const [deals] = useState<DealProduct[]>(() => FALLBACK_DEALS)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [sortOption, setSortOption] = useState<SortOption>('price-asc')
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(loadPriceAlerts)
  const [recentComparisons, setRecentComparisons] = useState<RecentComparison[]>(
    () => loadRecentComparisons()
  )

  // Fetch deals from API in background (non-blocking)
  useEffect(() => {
    let cancelled = false
    async function fetchDeals() {
      try {
        const data = await cachedFetch<DealProduct[]>('/api/deals/compare')
        if (!cancelled && data && data.length > 0) {
          // silently update in background — FALLBACK_DEALS already shown
        }
      } catch {
        // use fallback, no error state
      }
    }
    fetchDeals()
    return () => {
      cancelled = true
    }
  }, [])

  // Save price alerts to localStorage
  useEffect(() => {
    savePriceAlerts(priceAlertsEnabled)
  }, [priceAlertsEnabled])

  // Refresh recent comparisons periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentComparisons(loadRecentComparisons())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Filtered + sorted deals
  const filteredDeals = useMemo(() => {
    let result = [...deals]

    // Category filter
    if (activeCategory !== 'Todos') {
      result = result.filter((d) => d.category === activeCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.emoji.includes(q)
      )
    }

    // Sort products based on best offer
    result.sort((a, b) => {
      const aBest = getBestOffer(a.offers)
      const bBest = getBestOffer(b.offers)
      switch (sortOption) {
        case 'price-asc':
          return aBest.price - bBest.price
        case 'discount':
          return bBest.discount - aBest.discount
        case 'rating':
          return bBest.rating - aBest.rating
        default:
          return 0
      }
    })

    return result
  }, [deals, activeCategory, searchQuery, sortOption])

  // Total savings calculation
  const totalSavings = useMemo(() => {
    return filteredDeals.reduce((sum, product) => {
      const best = getBestOffer(product.offers)
      const highest = getHighestPrice(product.offers)
      return sum + (highest - best.price)
    }, 0)
  }, [filteredDeals])

  const handleCompare = useCallback((product: DealProduct) => {
    addRecentComparison(product)
    setRecentComparisons(loadRecentComparisons())
  }, [])

  const handleClearRecent = useCallback(() => {
    saveRecentComparisons([])
    setRecentComparisons([])
  }, [])

  const handleRecentSelect = useCallback((item: RecentComparison) => {
    setSearchQuery(item.name)
  }, [])

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-6" aria-label="Comparador de Ofertas">
      {/* ── Header ───────────────────────────────────────── */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
        style={{ transformOrigin: 'top center' }}
        className="text-center mb-6"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
          Comparador de Ofertas
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Encontre o melhor preço nas lojas da sua vizinhança
        </p>
      </motion.div>

      {/* ── Search Bar ───────────────────────────────────── */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 24, delay: 0.05 }}
        className="relative mb-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="r72-search-input w-full h-11 min-h-[44px] rounded-xl border bg-card pl-10 pr-10 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {searchQuery && (
            <motion.button
              initial={prefersReduced ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={prefersReduced ? undefined : { scale: 0, opacity: 0 }}
              whileTap={prefersReduced ? undefined : { scale: 0.9 }}
              style={{ transformOrigin: 'center center' }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── Category Filter Tabs ─────────────────────────── */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 24, delay: 0.1 }}
        className="mb-4"
      >
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category
            return (
              <motion.div
                key={category}
                whileTap={prefersReduced ? undefined : { scale: 0.93 }}
                style={{ transformOrigin: 'center center' }}
              >
                <button
                  onClick={() => setActiveCategory(category)}
                  className={`r72-category-chip whitespace-nowrap min-h-[44px] min-w-[44px] px-4 rounded-full text-sm font-semibold transition-all border ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {category}
                </button>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Sort Controls ────────────────────────────────── */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 24, delay: 0.15 }}
        className="flex items-center gap-2 mb-6"
      >
        <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground shrink-0">Ordenar:</span>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((option) => {
            const isActive = sortOption === option.value
            return (
              <motion.div
                key={option.value}
                whileTap={prefersReduced ? undefined : { scale: 0.93 }}
                style={{ transformOrigin: 'center center' }}
              >
                <button
                  onClick={() => setSortOption(option.value)}
                  className={`r72-sort-btn min-h-[44px] min-w-[44px] px-3 rounded-lg text-xs font-semibold transition-all border ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {option.label}
                </button>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Main Content Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product cards */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDeals.map((product, index) => (
              <ProductDealCard
                key={product.id}
                product={product}
                sortOption={sortOption}
                onCompare={handleCompare}
                prefersReduced={prefersReduced}
                index={index}
              />
            ))}
          </AnimatePresence>

          {filteredDeals.length === 0 && (
            <motion.div
              initial={prefersReduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">
                Nenhuma oferta encontrada
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tente buscar por outro produto ou mudar a categoria
              </p>
              <motion.div
                whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                style={{ transformOrigin: 'center center' }}
                className="mt-4"
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setActiveCategory('Todos')
                  }}
                  className="min-h-[44px] min-w-[44px] gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Limpar filtros
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <SavingsSummaryCard
            totalSavings={totalSavings}
            productCount={filteredDeals.length}
            prefersReduced={prefersReduced}
          />

          <PriceAlertToggleSection
            enabled={priceAlertsEnabled}
            onToggle={() => setPriceAlertsEnabled((prev) => !prev)}
            prefersReduced={prefersReduced}
          />

          <RecentComparisonsSection
            items={recentComparisons}
            onSelect={handleRecentSelect}
            onClear={handleClearRecent}
            prefersReduced={prefersReduced}
          />
        </div>
      </div>
    </section>
  )
}
