'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Clock, TrendingDown, Bell, BellOff, ChevronDown, Eye, ArrowDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cachedFetch } from '@/lib/api-cache'

// ── Interfaces ─────────────────────────────────────────────────────────────

interface PriceDropItem {
  id: string
  productName: string
  storeName: string
  originalPrice: number
  newPrice: number
  discountPercent: number
  productImage: string
  category: string
  droppedAt: string
}

interface PriceDropAlertsWidgetProps {
  className?: string
}

type SortOption = 'discount' | 'recent' | 'price'
type CategoryFilter = 'todos' | 'alimentos' | 'bebidas' | 'limpeza' | 'higiene'

interface FetchedProduct {
  id: string
  name: string
  storeName: string
  price: number
  comparePrice: number | null
  images: string
  category: string
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'alimentos', label: 'Alimentos' },
  { key: 'bebidas', label: 'Bebidas' },
  { key: 'limpeza', label: 'Limpeza' },
  { key: 'higiene', label: 'Higiene' },
]

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'discount', label: 'Maior desconto' },
  { key: 'recent', label: 'Mais recentes' },
  { key: 'price', label: 'Menor preço' },
]

const GRADIENT_FALLBACKS: string[] = [
  'linear-gradient(135deg, #059669, #10b981)',
  'linear-gradient(135deg, #d97706, #f59e0b)',
  'linear-gradient(135deg, #dc2626, #ef4444)',
  'linear-gradient(135deg, #7c3aed, #a78bfa)',
  'linear-gradient(135deg, #0891b2, #06b6d4)',
  'linear-gradient(135deg, #ea580c, #f97316)',
]

const CATEGORY_EMOJIS: Record<string, string> = {
  alimentos: '🍎',
  bebidas: '🥤',
  limpeza: '🧹',
  higiene: '🧴',
}

const STORAGE_KEY_ALERTS = 'r64-price-alerts-enabled'
const STORAGE_KEY_WATCHED = 'r64-watched-items'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatTimeAgo(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}min atrás`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h atrás`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`
  return `${Math.floor(diffDays / 7)}sem atrás`
}

function resolveProductImage(images: string, index: number): string {
  if (!images) return ''
  try {
    const parsed: string[] = JSON.parse(images)
    if (parsed.length > 0 && parsed[0]) return parsed[0]
  } catch {
    // ignore parse errors
  }
  return ''
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function generateFallbackDrops(): PriceDropItem[] {
  const products: Array<{
    name: string
    store: string
    orig: number
    cat: string
    hoursAgo: number
  }> = [
    { name: 'Arroz Tio João 5kg', store: 'Mercado do Zé', orig: 29.90, cat: 'alimentos', hoursAgo: 2 },
    { name: 'Açaí Premium 700ml', store: 'Açaí da Boa', orig: 28.00, cat: 'alimentos', hoursAgo: 5 },
    { name: 'Detergente Ypê 500ml', store: 'Mercado do Zé', orig: 4.49, cat: 'limpeza', hoursAgo: 1 },
    { name: 'Vitamina C 500mg', store: 'Farmácia Vida', orig: 42.00, cat: 'higiene', hoursAgo: 3 },
    { name: 'Refrigerante Cola 2L', store: 'Padaria Pão Quente', orig: 9.90, cat: 'bebidas', hoursAgo: 8 },
    { name: 'Sabonete Dove 90g', store: 'Salão da Bella', orig: 7.90, cat: 'higiene', hoursAgo: 12 },
  ]

  return products.map((p, i) => {
    const discount = Math.round(5 + seededRandom(i * 7 + 3) * 35)
    const newPrice = +(p.orig * (1 - discount / 100)).toFixed(2)
    const droppedAt = new Date(Date.now() - p.hoursAgo * 3600000).toISOString()
    return {
      id: `r64-drop-${i + 1}`,
      productName: p.name,
      storeName: p.store,
      originalPrice: p.orig,
      newPrice,
      discountPercent: discount,
      productImage: '',
      category: p.cat,
      droppedAt,
    }
  })
}

function mapProductsToDrops(products: FetchedProduct[]): PriceDropItem[] {
  return products.slice(0, 12).map((p, i) => {
    const discount = Math.round(5 + seededRandom(i * 13 + 7) * 35)
    const basePrice = p.comparePrice && p.comparePrice > p.price ? p.comparePrice : p.price
    const newPrice = +(basePrice * (1 - discount / 100)).toFixed(2)
    const hoursAgo = Math.round(seededRandom(i * 17 + 5) * 48)
    return {
      id: `r64-drop-${p.id}`,
      productName: p.name,
      storeName: p.storeName,
      originalPrice: basePrice,
      newPrice,
      discountPercent: discount,
      productImage: resolveProductImage(p.images, i),
      category: 'alimentos',
      droppedAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    }
  })
}

// ── Sub-components ─────────────────────────────────────────────────────────

function PriceDropCard({
  item,
  isBest,
  index,
}: {
  item: PriceDropItem
  isBest: boolean
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.07,
        type: 'spring' as const,
        stiffness: 300,
        damping: 26,
      }}
      className={`r64-price-card relative rounded-xl overflow-hidden bg-card border border-border/50 ${isBest ? 'r64-price-best' : ''}`}
    >
      {/* Product image area */}
      <div className="relative h-28 bg-muted/40 flex items-center justify-center overflow-hidden">
        {item.productImage ? (
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: GRADIENT_FALLBACKS[index % GRADIENT_FALLBACKS.length] }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl opacity-70">
                {CATEGORY_EMOJIS[item.category] || '📦'}
              </span>
            </div>
          </div>
        )}

        {/* Discount badge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.07 + 0.2, type: 'spring' as const, stiffness: 400, damping: 20 }}
          className="absolute top-2 right-2 r64-price-badge rounded-full px-2 py-0.5 text-[11px] font-bold leading-tight"
        >
          -{item.discountPercent}%
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm font-semibold leading-tight line-clamp-1">{item.productName}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.storeName}</p>

        <div className="flex items-end gap-2 mt-2">
          <span className="r64-price-old text-sm">{formatBRL(item.originalPrice)}</span>
          <motion.span
            key={item.newPrice}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 22 }}
            className="r64-price-new text-base"
          >
            {formatBRL(item.newPrice)}
          </motion.span>
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(item.droppedAt)}</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="active:scale-95 transition-transform flex items-center gap-1 text-xs font-semibold text-primary hover:underline min-h-[44px] min-w-[44px] justify-center"
            aria-label={`Ver produto: ${item.productName}`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Ver produto</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Summary skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="r64-price-stat rounded-xl p-3">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-border/50">
            <Skeleton className="h-28 w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 250, damping: 25 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-5xl mb-4"
      >
        🏷️
      </motion.div>
      <h3 className="text-lg font-bold">Nenhum desconto encontrado</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
        Não encontramos quedas de preço no momento. Volte em breve para conferir novas ofertas!
      </p>
    </motion.div>
  )
}

function AlertToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onToggle}
        className={`r64-price-alert-toggle ${enabled ? 'on' : 'off'}`}
        role="switch"
        aria-checked={enabled}
        aria-label="Ativar alertas de desconto"
        aria-roledescription="interruptor"
      >
        <span className="indicator" />
      </button>
      <span className="text-sm font-medium">
        {enabled ? (
          <span className="flex items-center gap-1.5 text-emerald-600">
            <Bell className="h-4 w-4" />
            Alertas ativados
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <BellOff className="h-4 w-4" />
            Ativar alertas
          </span>
        )}
      </span>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export function PriceDropAlertsWidget({ className = '' }: PriceDropAlertsWidgetProps) {
  const [drops, setDrops] = useState<PriceDropItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('todos')
  const [sortBy, setSortBy] = useState<SortOption>('discount')
  const [alertsEnabled, setAlertsEnabled] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  // Load alerts preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALERTS)
      if (stored === 'true') setAlertsEnabled(true)
    } catch {
      // ignore
    }
  }, [])

  const toggleAlerts = useCallback(() => {
    setAlertsEnabled((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY_ALERTS, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  // Fetch products and generate price drops
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await cachedFetch<FetchedProduct[]>('/api/products')
        if (!cancelled) {
          const mapped = mapProductsToDrops(data)
          setDrops(mapped.length > 0 ? mapped : generateFallbackDrops())
        }
      } catch {
        if (!cancelled) {
          setDrops(generateFallbackDrops())
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  // Filtered and sorted drops
  const processedDrops = useMemo(() => {
    let result = drops

    if (activeCategory !== 'todos') {
      result = result.filter((d) => d.category === activeCategory)
    }

    switch (sortBy) {
      case 'discount':
        result = [...result].sort((a, b) => b.discountPercent - a.discountPercent)
        break
      case 'recent':
        result = [...result].sort((a, b) => new Date(b.droppedAt).getTime() - new Date(a.droppedAt).getTime())
        break
      case 'price':
        result = [...result].sort((a, b) => a.newPrice - b.newPrice)
        break
    }

    return result
  }, [drops, activeCategory, sortBy])

  // Summary stats
  const stats = useMemo(() => {
    if (drops.length === 0) return { count: 0, avgDiscount: 0, maxDiscount: 0 }
    const avg = Math.round(drops.reduce((sum, d) => sum + d.discountPercent, 0) / drops.length)
    const max = Math.max(...drops.map((d) => d.discountPercent))
    return { count: drops.length, avgDiscount: avg, maxDiscount: max }
  }, [drops])

  const bestDiscountId = useMemo(() => {
    if (processedDrops.length === 0) return ''
    return processedDrops.reduce((best, cur) => (cur.discountPercent > best.discountPercent ? cur : best)).id
  }, [processedDrops])

  const activeSortLabel = SORT_OPTIONS.find((o) => o.key === sortBy)?.label ?? 'Ordenar'

  return (
    <section className={`w-full ${className}`} aria-label="Quedas de preço">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
          >
            <Tag className="h-5 w-5 text-emerald-500" />
          </motion.div>
          <h2 className="text-lg font-bold">Quedas de Preço</h2>
          <motion.span
            key={drops.length}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold dark:bg-emerald-900/30 dark:text-emerald-400"
          >
            {drops.length}
          </motion.span>
        </div>

        <AlertToggle enabled={alertsEnabled} onToggle={toggleAlerts} />
      </div>

      {/* Summary bar */}
      {!isLoading && drops.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 280, damping: 24 }}
          className="grid grid-cols-3 gap-3 mb-4"
        >
          <div className="r64-price-stat rounded-xl p-3 text-center">
            <p className="text-[11px] text-muted-foreground font-medium">Com desconto</p>
            <p className="text-lg font-extrabold">{stats.count}</p>
          </div>
          <div className="r64-price-stat rounded-xl p-3 text-center">
            <p className="text-[11px] text-muted-foreground font-medium">Média off</p>
            <p className="text-lg font-extrabold text-emerald-600">{stats.avgDiscount}%</p>
          </div>
          <div className="r64-price-stat rounded-xl p-3 text-center">
            <p className="text-[11px] text-muted-foreground font-medium">Maior off</p>
            <p className="text-lg font-extrabold text-rose-600">{stats.maxDiscount}%</p>
          </div>
        </motion.div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-1">
          {CATEGORY_FILTERS.map((cat, i) => (
            <motion.button
              key={cat.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.key)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, type: 'spring' as const, stiffness: 300, damping: 24 }}
              className={`r64-price-tab active:scale-95 transition-transform shrink-0 px-4 rounded-full text-xs font-semibold border ${
                activeCategory === cat.key
                  ? 'active border-transparent'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
              aria-pressed={activeCategory === cat.key}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSortOpen((prev) => !prev)}
            className="active:scale-95 transition-transform flex items-center gap-1 min-h-[44px] px-3 rounded-full text-xs font-medium border border-border bg-card hover:border-primary/30"
            aria-label="Ordenar quedas de preço"
            aria-expanded={sortOpen}
          >
            <ArrowDown className="h-3 w-3" />
            <span className="hidden sm:inline max-w-[100px] truncate">{activeSortLabel}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ type: 'spring' as const, stiffness: 350, damping: 25 }}
                className="absolute right-0 top-full mt-1 z-20 min-w-[160px] rounded-xl border border-border bg-card shadow-lg overflow-hidden"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSortBy(opt.key)
                      setSortOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-muted/50 transition-colors min-h-[44px] flex items-center ${
                      sortBy === opt.key ? 'text-primary bg-primary/5' : 'text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : processedDrops.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {processedDrops.slice(0, 6).map((item, i) => (
            <PriceDropCard
              key={item.id}
              item={item}
              isBest={item.id === bestDiscountId}
              index={i}
            />
          ))}
        </div>
      )}

      {/* TrendingDown decorative icon */}
      {!isLoading && processedDrops.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          className="hidden lg:block pointer-events-none absolute bottom-0 right-0"
        >
          <TrendingDown className="h-48 w-48 text-emerald-500 rotate-[-15deg]" />
        </motion.div>
      )}
    </section>
  )
}
