'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, Star, Clock, Heart, Store, Filter } from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { useAppStore, type StoreData } from '@/store/useAppStore'
import { StoreContact } from '@/components/store/StoreContact'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// ── Interfaces ────────────────────────────────────────────────────────────────

interface NearbyStore {
  id: string
  name: string
  category: string
  distance: number
  isOpen: boolean
  rating: number
  reviewCount: number
  deliveryTime: string
  deliveryFee: number
  isFavorite: boolean
  image: string
}

interface NearbyStoresMapProps {
  className?: string
}

type DistanceFilter = 'all' | 'near' | 'medium'

interface FallbackStoreData {
  stores: NearbyStore[]
}

// ── Constants ────────────────────────────────────────────────────────────────

const FAVORITES_KEY = 'r66-nearby-favorites'

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: 'Alimentação',
  HEALTH: 'Saúde',
  BEAUTY: 'Beleza',
  ANIMALS: 'Animais',
  GROCERY: 'Mercado',
  DRINKS: 'Bebidas',
}

const CATEGORY_ICONS: Record<string, string> = {
  Alimentação: '🍞',
  Saúde: '💊',
  Beleza: '💅',
  Animais: '🐾',
  Mercado: '🥬',
  Bebidas: '🥤',
}

const FALLBACK_STORES: NearbyStore[] = [
  {
    id: 'ns1',
    name: 'Padaria Sol',
    category: 'Alimentação',
    distance: 0.5,
    isOpen: true,
    rating: 4.8,
    reviewCount: 142,
    deliveryTime: '20-35min',
    deliveryFee: 3.0,
    isFavorite: false,
    image: '/images/bakery.jpg',
  },
  {
    id: 'ns2',
    name: 'Açaí da Terra',
    category: 'Bebidas',
    distance: 0.8,
    isOpen: true,
    rating: 4.9,
    reviewCount: 256,
    deliveryTime: '15-25min',
    deliveryFee: 2.5,
    isFavorite: false,
    image: '/images/acai.jpg',
  },
  {
    id: 'ns3',
    name: 'Farmácia Vida',
    category: 'Saúde',
    distance: 1.2,
    isOpen: true,
    rating: 4.6,
    reviewCount: 89,
    deliveryTime: '30-45min',
    deliveryFee: 0,
    isFavorite: false,
    image: '/images/pharmacy.jpg',
  },
  {
    id: 'ns4',
    name: 'Pet Shop Amigo',
    category: 'Animais',
    distance: 2.0,
    isOpen: false,
    rating: 4.7,
    reviewCount: 112,
    deliveryTime: '40-60min',
    deliveryFee: 5.0,
    isFavorite: false,
    image: '/images/pets.jpg',
  },
  {
    id: 'ns5',
    name: 'Beleza Pura',
    category: 'Beleza',
    distance: 2.8,
    isOpen: true,
    rating: 4.5,
    reviewCount: 67,
    deliveryTime: '35-50min',
    deliveryFee: 4.0,
    isFavorite: false,
    image: '/images/beauty.jpg',
  },
  {
    id: 'ns6',
    name: 'Horti Fruti',
    category: 'Mercado',
    distance: 4.2,
    isOpen: true,
    rating: 4.4,
    reviewCount: 53,
    deliveryTime: '45-70min',
    deliveryFee: 6.0,
    isFavorite: false,
    image: '/images/grocery.jpg',
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDistanceClass(distance: number): 'near' | 'medium' | 'far' {
  if (distance < 1) return 'near'
  if (distance < 3) return 'medium'
  return 'far'
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

function getMapDotPositions(stores: NearbyStore[]): Array<{ x: number; y: number; isOpen: boolean }> {
  const positions: Array<{ x: number; y: number; isOpen: boolean }> = [
    { x: 20, y: 30, isOpen: true },
    { x: 45, y: 55, isOpen: true },
    { x: 70, y: 25, isOpen: true },
    { x: 35, y: 75, isOpen: false },
    { x: 60, y: 65, isOpen: true },
    { x: 82, y: 50, isOpen: true },
  ]
  return positions.slice(0, stores.length)
}

function loadFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveFavorites(favs: Set<string>): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favs)))
  } catch {
    // Ignore storage errors
  }
}

// ── Sub-components ───────────────────────────────────────────────────────────

function MapPlaceholder({ stores }: { stores: NearbyStore[] }) {
  const dots = getMapDotPositions(stores)

  return (
    <div className="r66-map-bg rounded-2xl h-48 sm:h-56 relative flex items-center justify-center overflow-hidden">
      {/* SVG neighborhood illustration */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Roads */}
        <path d="M0 125 L400 125" stroke="rgba(148,163,184,0.3)" strokeWidth="8" strokeLinecap="round" />
        <path d="M200 0 L200 250" stroke="rgba(148,163,184,0.25)" strokeWidth="6" strokeLinecap="round" />
        <path d="M80 50 L320 200" stroke="rgba(148,163,184,0.15)" strokeWidth="4" strokeLinecap="round" />
        {/* Buildings/blocks */}
        <rect x="40" y="40" width="60" height="40" rx="6" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
        <rect x="150" y="60" width="80" height="50" rx="6" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
        <rect x="280" y="30" width="70" height="55" rx="6" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
        <rect x="50" y="150" width="55" height="45" rx="6" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
        <rect x="230" y="140" width="75" height="50" rx="6" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
        <rect x="310" y="160" width="65" height="40" rx="6" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
        {/* Parks/green areas */}
        <circle cx="140" cy="170" r="20" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.12)" strokeWidth="1" />
        <circle cx="350" cy="90" r="15" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.12)" strokeWidth="1" />
        {/* "Você está aqui" marker */}
        <circle cx="200" cy="125" r="16" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.4)" strokeWidth="2" />
        <circle cx="200" cy="125" r="6" fill="rgba(99,102,241,0.6)" />
      </svg>

      {/* Store location dots */}
      {dots.map((dot, i) => (
        <motion.div
          key={`dot-${i}`}
          className={`r66-map-dot ${dot.isOpen ? 'open' : 'closed'} absolute`}
          style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1, type: 'spring' as const, stiffness: 400, damping: 20 }}
        />
      ))}

      {/* Center label */}
      <div className="relative z-10 flex flex-col items-center gap-1 pointer-events-none">
        <MapPin className="h-5 w-5 text-primary/50" />
        <span className="text-xs text-muted-foreground font-medium bg-background/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
          Dom Eliseu, PA
        </span>
      </div>
    </div>
  )
}

function SummaryBar({ stores }: { stores: NearbyStore[] }) {
  const openCount = stores.filter((s) => s.isOpen).length
  const deliveryCount = stores.filter((s) => s.isOpen && s.deliveryFee > 0).length

  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
      >
        <div className="r66-status-online" />
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {openCount} loja{openCount !== 1 ? 's' : ''} aberta{openCount !== 1 ? 's' : ''}
        </span>
      </motion.div>
      <motion.div
        className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25, delay: 0.05 }}
      >
        <Clock className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
          {deliveryCount} com entrega
        </span>
      </motion.div>
    </div>
  )
}

function StoreCardSkeleton() {
  return (
    <div className="r66-map-card bg-card rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-2 mt-3">
        <Skeleton className="h-11 flex-1 rounded-lg" />
        <Skeleton className="h-11 flex-1 rounded-lg" />
        <Skeleton className="h-11 w-11 rounded-lg" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-5xl mb-4"
      >
        📍
      </motion.div>
      <h3 className="text-base font-bold text-foreground mb-1">Nenhuma loja encontrada</h3>
      <p className="text-sm text-muted-foreground max-w-[240px]">
        Tente ajustar os filtros ou buscar por outro nome
      </p>
    </motion.div>
  )
}

function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" aria-label={`${rating} estrelas`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={`star-${i}`}
            className={`h-3 w-3 ${
              i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">
        {rating} ({reviewCount})
      </span>
    </div>
  )
}

function StoreCard({
  store,
  onToggleFavorite,
}: {
  store: NearbyStore
  onToggleFavorite: (id: string) => void
}) {
  const distClass = getDistanceClass(store.distance)
  const catIcon = CATEGORY_ICONS[store.category] || '🏪'

  return (
    <motion.div
      className={`r66-map-card ${distClass} bg-card rounded-xl p-4`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
      whileHover={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 text-xl">
          {catIcon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold truncate">{store.name}</h3>
            <div
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                store.isOpen ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
              aria-label={store.isOpen ? 'Loja aberta' : 'Loja fechada'}
            />
          </div>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 mt-0.5 font-medium">
            {store.category}
          </Badge>
        </div>
        <div
          className={`r66-distance-badge ${distClass} flex items-center justify-center px-2.5 py-1 rounded-full text-xs`}
        >
          {formatDistance(store.distance)}
        </div>
      </div>

      {/* Rating + delivery info */}
      <div className="flex items-center gap-3 mt-2.5">
        <RatingStars rating={store.rating} reviewCount={store.reviewCount} />
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {store.deliveryTime}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {store.deliveryFee === 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Grátis</span>
          ) : (
            `R$ ${store.deliveryFee.toFixed(2)}`
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          className="r66-store-action flex-1 min-h-[44px] h-11 rounded-lg text-xs font-semibold"
          asChild
        >
          <motion.button whileTap={{ scale: 0.95 }} className="w-full">
            Ver loja
          </motion.button>
        </Button>
        <Button
          size="sm"
          className="r66-store-action flex-1 min-h-[44px] h-11 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90"
          disabled={!store.isOpen}
          asChild
        >
          <motion.button whileTap={{ scale: 0.95 }} className="w-full">
            Pedir agora
          </motion.button>
        </Button>
        <motion.button
          className={`r66-fav-btn flex items-center justify-center w-11 h-11 rounded-lg border border-border hover:bg-muted/50 ${store.isFavorite ? 'favorited' : ''}`}
          onClick={() => onToggleFavorite(store.id)}
          whileTap={{ scale: 0.85 }}
          aria-label={store.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            className={`h-4 w-4 ${store.isFavorite ? 'fill-current' : ''}`}
          />
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export function NearbyStoresMap({ className }: NearbyStoresMapProps) {
  const [stores, setStores] = useState<NearbyStore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Load stores from API or fallback
  useEffect(() => {
    let cancelled = false

    async function loadStores(): Promise<void> {
      setIsLoading(true)
      try {
        const data = await cachedFetch<FallbackStoreData>('/api/stores')
        if (cancelled) return

        const apiStores: NearbyStore[] = (data.stores ?? []).slice(0, 6).map(
          (s: NearbyStore) => ({
            ...s,
            distance: Math.round((0.3 + Math.random() * 4.7) * 10) / 10,
            isFavorite: false,
          }),
        )

        setStores(apiStores.length > 0 ? apiStores : FALLBACK_STORES)
      } catch {
        if (!cancelled) {
          setStores(FALLBACK_STORES)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadStores()
    return () => {
      cancelled = true
    }
  }, [])

  // Load favorites from localStorage
  useEffect(() => {
    const stored = loadFavorites()
    setFavorites(stored)
  }, [])

  const toggleFavorite = useCallback((storeId: string): void => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(storeId)) {
        next.delete(storeId)
      } else {
        next.add(storeId)
      }
      saveFavorites(next)
      return next
    })
  }, [])

  // Filter stores
  const filteredStores = useMemo(() => {
    let result = stores.map((s) => ({
      ...s,
      isFavorite: favorites.has(s.id),
    }))

    // Distance filter
    if (distanceFilter === 'near') {
      result = result.filter((s) => s.distance < 1)
    } else if (distanceFilter === 'medium') {
      result = result.filter((s) => s.distance < 3)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query),
      )
    }

    return result
  }, [stores, favorites, distanceFilter, searchQuery])

  const distanceTabs: Array<{ key: DistanceFilter; label: string }> = [
    { key: 'all', label: 'Todos' },
    { key: 'near', label: 'Menos de 1km' },
    { key: 'medium', label: 'Menos de 3km' },
  ]

  return (
    <section className={className}>
      {/* Section header */}
      <motion.div
        className="flex items-center gap-2 mb-4"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
      >
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Store className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-lg font-bold r62-heading-gradient">Lojas próximas</h2>
        <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
          {filteredStores.length}
        </Badge>
      </motion.div>

      {/* Map placeholder */}
      <MapPlaceholder stores={stores} />

      {/* Search input */}
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar lojas por nome..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 pl-9 pr-4 rounded-xl text-sm bg-card border-border/60 focus:border-primary/40"
          aria-label="Buscar lojas por nome"
        />
      </div>

      {/* Distance filter tabs */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto hide-scrollbar pb-1">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        {distanceTabs.map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setDistanceFilter(tab.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[44px] flex items-center ${
              distanceFilter === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card text-muted-foreground border border-border/60 hover:border-primary/30'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Summary bar */}
      <div className="mt-3">
        <SummaryBar stores={stores} />
      </div>

      {/* Store list */}
      <div className="mt-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <StoreCardSkeleton />
              </motion.div>
            ))
          ) : filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onToggleFavorite={toggleFavorite}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </AnimatePresence>
      </div>

      {/* Store contact for the first open store */}
      {!isLoading && stores.length > 0 && (() => {
        const firstStore = stores.find(s => s.isOpen) || stores[0]
        const storeData: StoreData = {
          id: firstStore.id,
          name: firstStore.name,
          slug: firstStore.name.toLowerCase().replace(/\s+/g, '-'),
          description: null,
          category: firstStore.category === 'Alimentação' ? 'FOOD'
            : firstStore.category === 'Saúde' ? 'HEALTH'
            : firstStore.category === 'Beleza' ? 'BEAUTY'
            : firstStore.category === 'Animais' ? 'ANIMALS'
            : firstStore.category === 'Mercado' ? 'FOOD'
            : firstStore.category === 'Bebidas' ? 'FOOD'
            : 'FOOD',
          logo: null,
          coverImage: null,
          phone: null,
          whatsapp: null,
          address: null,
          neighborhood: null,
          city: 'Dom Eliseu',
          state: 'PA',
          deliveryFee: firstStore.deliveryFee,
          freeDeliveryAbove: null,
          rating: firstStore.rating,
          totalReviews: firstStore.reviewCount,
          opensAt: null,
          closesAt: null,
          openDays: '1,2,3,4,5,6,7',
        }
        return <StoreContact store={storeData} />
      })()}
    </section>
  )
}
