'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, ExternalLink, Sparkles, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { cachedFetch } from '@/lib/api-cache'
import { resolveProductImage } from '@/lib/product-images'
import { toast } from 'sonner'

// Module-level currency formatter
const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

// Category emoji map
const categoryEmoji: Record<string, string> = {
  FOOD: '🍚',
  HEALTH: '💊',
  ELECTRONICS: '📱',
  BEAUTY: '💅',
  ANIMALS: '🐾',
  AGRICULTURE: '🌿',
  FASHION: '👗',
  HOME_GARDEN: '🏡',
  SPORTS: '⚽',
  SERVICES: '🔧',
  OTHER: '📦',
}

// Type badge configs
const typeBadgeConfig: Record<string, { label: string; bg: string; text: string }> = {
  NOVO: { label: 'NOVO', bg: 'bg-blue-500', text: 'text-white' },
  OFERTA: { label: 'OFERTA', bg: 'bg-red-500', text: 'text-white' },
  LIMITADO: { label: 'LIMITADO', bg: 'bg-amber-500', text: 'text-white' },
}

interface DropProduct {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  category: string
  images: string | null
  storeName: string | undefined
  isNew: boolean
  isOffer: boolean
  storeId: string
}

// Shimmer skeleton for loading state
function DropCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
      <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}

// Animated pulsing red dot for live indicator
function LivePulseDot() {
  return (
    <span className="relative flex h-3 w-3 r33-pulse-ring">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"
        animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
    </span>
  )
}

// Single product drop card
function DropCard({
  drop,
  onBuy,
  onDismiss,
}: {
  drop: DropProduct
  onBuy: (drop: DropProduct) => void
  onDismiss: (id: string) => void
}) {
  const imgUrl = drop.images
    ? resolveProductImage({ slug: drop.slug, category: drop.category, images: drop.images })
    : null

  // Determine badge type
  const badgeType = drop.isNew ? 'NOVO' : drop.isOffer ? 'OFERTA' : Math.random() > 0.7 ? 'LIMITADO' : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all relative overflow-hidden group r33-card-hover"
    >
      {/* Subtle shimmer overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
      </div>

      {/* Product image or emoji */}
      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shrink-0 relative overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={drop.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
            }}
          />
        ) : null}
        <span className="relative z-10 text-2xl">
          {categoryEmoji[drop.category] || '📦'}
        </span>
        {/* "Acabei de chegar!" badge */}
        <motion.div
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: -12 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.2 }}
          className="absolute -top-1.5 -right-1.5 z-20"
        >
          <Badge className="text-[8px] px-1.5 py-0 bg-emerald-500 text-white border-0 leading-tight font-bold">
            🆕 Chegou!
          </Badge>
        </motion.div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-xs font-semibold line-clamp-1">{drop.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{drop.storeName || 'Loja local'}</p>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-sm font-bold text-primary">{formatBRL(drop.price)}</span>
          {drop.comparePrice && drop.comparePrice > drop.price && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatBRL(drop.comparePrice)}
            </span>
          )}
        </div>

        {/* Type badge row */}
        <div className="flex items-center gap-1.5 mt-1">
          {badgeType && typeBadgeConfig[badgeType] && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' as const, stiffness: 400, damping: 20 }}
            >
              <Badge
                className={`text-[9px] px-1.5 py-0 border-0 font-bold leading-tight ${typeBadgeConfig[badgeType].bg} ${typeBadgeConfig[badgeType].text}`}
              >
                {typeBadgeConfig[badgeType].label}
              </Badge>
            </motion.span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-1.5 shrink-0 relative z-10">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            onClick={() => onBuy(drop)}
            className="h-8 px-3 text-[10px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg btn-glow gap-1"
          >
            <ShoppingCart className="h-3 w-3" />
            Comprar
          </Button>
        </motion.div>
        <button
          onClick={() => onDismiss(drop.id)}
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  )
}

// Animated counter component for drop count
function AnimatedCounter({ count }: { count: number }) {
  return (
    <motion.span
      key={count}
      initial={{ scale: 1.4, color: 'var(--primary)' }}
      animate={{ scale: 1, color: 'inherit' }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      className="font-bold text-primary inline-block"
    >
      {count}
    </motion.span>
  )
}

export function LiveDropAlert() {
  const [drops, setDrops] = useState<DropProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalDropCount, setTotalDropCount] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const dismissTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const mountedRef = useRef(true)

  // Map API product data to DropProduct
  const mapToDrop = useCallback((p: ProductData): DropProduct => {
    const images = p.images ?? undefined
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      comparePrice: p.comparePrice,
      category: p.category,
      images: images || null,
      storeName: p.storeName,
      isNew: p.isNew,
      isOffer: p.isOffer,
      storeId: p.storeId,
    }
  }, [])

  // Auto-dismiss after 8 seconds
  const scheduleDismiss = useCallback((id: string) => {
    const existing = dismissTimers.current.get(id)
    if (existing) clearTimeout(existing)
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setDrops((prev) => prev.filter((d) => d.id !== id))
        dismissTimers.current.delete(id)
      }
    }, 8000)
    dismissTimers.current.set(id, timer)
  }, [])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      dismissTimers.current.forEach((timer) => clearTimeout(timer))
      dismissTimers.current.clear()
    }
  }, [])

  // Fetch products and set up auto-refresh
  useEffect(() => {
    let cancelled = false

    const fetchDrops = async () => {
      try {
        const data = await cachedFetch('/api/products?limit=50') as { products?: ProductData[] }
        if (cancelled || !data.products) return

        const products: ProductData[] = data.products
        // Filter for new or offer products as "drops"
        const activeDrops = products
          .filter((p: ProductData) => p.isNew || p.isOffer || p.isFeatured)
          .slice(0, 8)
          .map(mapToDrop)

        if (cancelled) return

        setDrops(activeDrops)
        setTotalDropCount(products.filter((p: ProductData) => p.isNew).length + Math.floor(Math.random() * 5) + 3)
        setIsLoading(false)
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchDrops()

    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchDrops, 15000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [mapToDrop])

  // Schedule dismiss for each drop when they change
  useEffect(() => {
    drops.forEach((drop) => {
      scheduleDismiss(drop.id)
    })
  }, [drops, scheduleDismiss])

  // Elapsed time counter for live badge
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Handle buy action
  const handleBuy = useCallback(
    (drop: DropProduct) => {
      const { addToCart } = useAppStore.getState()
      const fakeProduct: ProductData = {
        id: drop.id,
        storeId: drop.storeId,
        storeName: drop.storeName,
        name: drop.name,
        slug: drop.slug,
        description: null,
        price: drop.price,
        comparePrice: drop.comparePrice,
        images: drop.images || '[]',
        stock: 50,
        rating: 4.5,
        totalReviews: 10,
        isFeatured: false,
        isNew: drop.isNew,
        isOffer: drop.isOffer,
        tags: '[]',
        variations: null,
        category: drop.category,
      }
      addToCart(fakeProduct, drop.storeName || 'Loja', 1)
      toast.success('Adicionado ao carrinho!', {
        description: `${drop.name} — ${formatBRL(drop.price)}`,
      })

      // Remove from drops after buying
      setDrops((prev) => prev.filter((d) => d.id !== drop.id))
      const timer = dismissTimers.current.get(drop.id)
      if (timer) {
        clearTimeout(timer)
        dismissTimers.current.delete(drop.id)
      }
    },
    []
  )

  // Handle dismiss
  const handleDismiss = useCallback((id: string) => {
    setDrops((prev) => prev.filter((d) => d.id !== id))
    const timer = dismissTimers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      dismissTimers.current.delete(id)
    }
  }, [])

  // Format elapsed time
  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="r28-live-drop-panel">
      {/* Glassmorphism floating panel */}
      <div className="relative rounded-2xl overflow-hidden glassmorphism-strong r62-card-lift">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-2.5">
              {/* Live indicator */}
              <div className="flex items-center gap-2 bg-red-500/10 rounded-full px-2.5 py-1 border border-red-500/20">
                <LivePulseDot />
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Ao Vivo</span>
              </div>

              <div className="h-4 w-px bg-border" />

              {/* Title */}
              <div className="flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold r33-live-shimmer r62-heading-gradient">Novos Produtos</h3>
              </div>
            </div>

            {/* Drop count & timer */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground font-mono">
                {formatElapsed(elapsedSeconds)}
              </div>
              <div className="flex items-center gap-1">
                <AnimatedCounter count={totalDropCount} />
                <span className="text-xs text-muted-foreground">novos hoje</span>
              </div>
            </div>
          </div>

          {/* Drop count animated bar */}
          <div className="px-4 pb-2">
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary via-emerald-500 to-teal-400"
                animate={{ width: `${Math.min(totalDropCount * 8, 100)}%` }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
              />
            </div>
          </div>

          {/* Drop cards feed */}
          <div className="px-4 pb-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="space-y-2">
                  <DropCardSkeleton />
                  <DropCardSkeleton />
                  <DropCardSkeleton />
                </div>
              ) : drops.length > 0 ? (
                <div className="space-y-2">
                  {drops.map((drop) => (
                    <DropCard
                      key={drop.id}
                      drop={drop}
                      onBuy={handleBuy}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Nenhum drop ativo no momento</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Novos drops em breve...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA Footer */}
          <div className="p-4 pt-2 border-t border-border/30">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                variant="outline"
                className="w-full h-9 text-xs font-semibold border-primary/30 hover:bg-primary/5 hover:border-primary/50 rounded-xl gap-1.5 r33-cta-glow"
              >
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                Ver Todos os Lançamentos
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveDropAlert
