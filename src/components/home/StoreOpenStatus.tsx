'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Store, Search, X, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cachedFetch } from '@/lib/api-cache'
import type { StoreData } from '@/store/useAppStore'

// --- Types ---
interface StoreStatus extends StoreData {
  isOpen: boolean
  closingSoon: boolean
  minutesToClose: number | null
  nextOpenText: string | null
}

type FilterPill = 'all' | 'open' | 'closed'

// --- Mock data ---
const mockStores: StoreData[] = [
  { id: 'ms1', name: 'Mercado do Zé', slug: 'mercado-do-ze', description: 'O melhor mercado de Dom Eliseu.', category: 'FOOD', logo: '/images/grocery.jpg', coverImage: '/images/grocery.jpg', phone: '(91) 99999-0001', whatsapp: '(91) 99999-0001', address: 'Rua Principal, 123', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 5.00, freeDeliveryAbove: 50, rating: 4.7, totalReviews: 128, opensAt: '07:00', closesAt: '21:00', openDays: '1,2,3,4,5,6,7' },
  { id: 'ms2', name: 'Açaí da Boa', slug: 'acai-da-boa', description: 'Açaí autêntico paraense.', category: 'FOOD', logo: '/images/acai.jpg', coverImage: '/images/acai.jpg', phone: '(91) 99999-0002', whatsapp: '(91) 99999-0002', address: 'Av. Brasil, 456', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 3.00, freeDeliveryAbove: 30, rating: 4.9, totalReviews: 256, opensAt: '08:00', closesAt: '22:00', openDays: '1,2,3,4,5,6' },
  { id: 'ms3', name: 'Agropecuária São Paulo', slug: 'agro-sao-paulo', description: 'Ferramentas e sementes.', category: 'AGRICULTURE', logo: '/images/agriculture.jpg', coverImage: '/images/agriculture.jpg', phone: '(91) 99999-0003', whatsapp: '(91) 99999-0003', address: 'Rod. PA-279, Km 5', neighborhood: 'Zona Rural', city: 'Dom Eliseu', state: 'PA', deliveryFee: 8.00, freeDeliveryAbove: 200, rating: 4.5, totalReviews: 67, opensAt: '06:00', closesAt: '18:00', openDays: '1,2,3,4,5,6' },
  { id: 'ms4', name: 'Farmácia Vida', slug: 'farmacia-vida', description: 'Sua saúde em primeiro lugar.', category: 'HEALTH', logo: '/images/pharmacy.jpg', coverImage: '/images/pharmacy.jpg', phone: '(91) 99999-0004', whatsapp: '(91) 99999-0004', address: 'Rua Pará, 789', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 0, freeDeliveryAbove: null, rating: 4.6, totalReviews: 89, opensAt: '07:00', closesAt: '22:00', openDays: '1,2,3,4,5,6,7' },
  { id: 'ms5', name: 'Padaria Pão Quente', slug: 'padaria-pao-quente', description: 'Pão fresquinho todo dia!', category: 'FOOD', logo: '/images/bakery.jpg', coverImage: '/images/bakery.jpg', phone: '(91) 99999-0005', whatsapp: '(91) 99999-0005', address: 'Rua Amazonas, 321', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 3.00, freeDeliveryAbove: 25, rating: 4.8, totalReviews: 198, opensAt: '05:00', closesAt: '20:00', openDays: '1,2,3,4,5,6,7' },
  { id: 'ms6', name: 'Loja do Eletrônico', slug: 'loja-eletronico', description: 'Celulares e acessórios.', category: 'ELECTRONICS', logo: '/images/electronics.jpg', coverImage: '/images/electronics.jpg', phone: '(91) 99999-0006', whatsapp: '(91) 99999-0006', address: 'Rua Tocantins, 654', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 5.00, freeDeliveryAbove: 100, rating: 4.3, totalReviews: 45, opensAt: '08:00', closesAt: '20:00', openDays: '1,2,3,4,5,6' },
  { id: 'ms7', name: 'Pet Shop Amigo Fiel', slug: 'pet-amigo-fiel', description: 'Tudo para seu pet.', category: 'ANIMALS', logo: '/images/pets.jpg', coverImage: '/images/pets.jpg', phone: '(91) 99999-0007', whatsapp: '(91) 99999-0007', address: 'Rua Maranhão, 987', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 4.00, freeDeliveryAbove: 80, rating: 4.7, totalReviews: 112, opensAt: '08:00', closesAt: '19:00', openDays: '1,2,3,4,5,6' },
  { id: 'ms8', name: 'Salão da Bella', slug: 'salao-bella', description: 'Beleza e bem-estar.', category: 'BEAUTY', logo: '/images/beauty.jpg', coverImage: '/images/beauty.jpg', phone: '(91) 99999-0008', whatsapp: '(91) 99999-0008', address: 'Rua Ceará, 147', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 0, freeDeliveryAbove: null, rating: 4.9, totalReviews: 210, opensAt: '09:00', closesAt: '20:00', openDays: '1,2,3,4,5,6' },
]

// --- Helpers ---
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(':').map(Number)
  return { hours: h, minutes: m }
}

function timeToMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes
}

function isStoreOpenNow(store: StoreData): {
  isOpen: boolean
  closingSoon: boolean
  minutesToClose: number | null
  nextOpenText: string | null
} {
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const openDays = store.openDays ? store.openDays.split(',').map(Number) : []

  if (!openDays.includes(dayOfWeek)) {
    return { isOpen: false, closingSoon: false, minutesToClose: null, nextOpenText: 'Fechado hoje' }
  }

  const currentMinutes = timeToMinutes(now.getHours(), now.getMinutes())

  if (!store.opensAt || !store.closesAt) {
    return { isOpen: false, closingSoon: false, minutesToClose: null, nextOpenText: 'Horário indisponível' }
  }

  const open = parseTime(store.opensAt)
  const close = parseTime(store.closesAt)
  const openMins = timeToMinutes(open.hours, open.minutes)
  const closeMins = timeToMinutes(close.hours, close.minutes)

  const isOpen = currentMinutes >= openMins && currentMinutes < closeMins
  const minutesToClose = closeMins - currentMinutes

  if (isOpen) {
    return { isOpen: true, closingSoon: minutesToClose <= 30 && minutesToClose > 0, minutesToClose, nextOpenText: null }
  }

  if (currentMinutes < openMins) {
    return { isOpen: false, closingSoon: false, minutesToClose: null, nextOpenText: `Abre às ${store.opensAt}` }
  }

  return { isOpen: false, closingSoon: false, minutesToClose: null, nextOpenText: 'Abre amanhã' }
}

const categoryEmoji: Record<string, string> = {
  FOOD: '🏪', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱',
  BEAUTY: '💅', ANIMALS: '🐾', FASHION: '👗', SERVICES: '🔧',
}

// --- Skeleton ---
function StoreOpenStatusSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-52" />
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-40 rounded-xl shrink-0" />
        ))}
      </div>
    </div>
  )
}

// --- Main component ---
export function StoreOpenStatus() {
  const [stores, setStores] = useState<StoreData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterPill>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [now, setNow] = useState(Date.now())

  // Fetch stores
  useEffect(() => {
    let cancelled = false
    const fetchStores = async () => {
      try {
        const data = await cachedFetch('/api/stores?limit=20')
        if (!cancelled && data.stores?.length > 0) {
          setStores(data.stores)
        } else if (!cancelled) {
          setStores(mockStores)
        }
      } catch {
        if (!cancelled) setStores(mockStores)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchStores()
    return () => { cancelled = true }
  }, [])

  // Tick every minute to update open/closed status
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Compute store statuses (react to `now`)
  const storeStatuses = useMemo<StoreStatus[]>(() => {
    return stores.map((s) => {
      const status = isStoreOpenNow(s)
      return { ...s, ...status }
    })
  }, [stores, now])

  // Filter & search
  const filtered = useMemo(() => {
    let result = storeStatuses
    if (activeFilter === 'open') result = result.filter((s) => s.isOpen)
    if (activeFilter === 'closed') result = result.filter((s) => !s.isOpen)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((s) => s.name.toLowerCase().includes(q))
    }
    return result
  }, [storeStatuses, activeFilter, searchQuery])

  const openCount = storeStatuses.filter((s) => s.isOpen).length
  const closedCount = storeStatuses.filter((s) => !s.isOpen).length

  const handleFilterClick = useCallback((pill: FilterPill) => {
    setActiveFilter(pill)
  }, [])

  if (isLoading) return <StoreOpenStatusSkeleton />

  return (
    <section className="relative overflow-hidden rounded-2xl">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-2xl"
        animate={{
          background: [
            'linear-gradient(135deg, oklch(0.98 0.01 155 / 0.6), oklch(0.96 0.02 160 / 0.4))',
            'linear-gradient(135deg, oklch(0.97 0.02 70 / 0.6), oklch(0.95 0.03 85 / 0.4))',
            'linear-gradient(135deg, oklch(0.98 0.01 155 / 0.6), oklch(0.96 0.02 160 / 0.4))',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
            >
              <Store className="h-5 w-5 text-primary" />
            </motion.div>
            <h3 className="font-bold text-lg">Lojas Abertas Agora</h3>
            <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30">
              {openCount} abertas
            </Badge>
          </div>
        </div>

        {/* Filter pills + search */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {([
            { key: 'all' as FilterPill, label: 'Todos', count: storeStatuses.length },
            { key: 'open' as FilterPill, label: 'Abertos', count: openCount },
            { key: 'closed' as FilterPill, label: 'Fechados', count: closedCount },
          ]).map((pill) => (
            <motion.button
              key={pill.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterClick(pill.key)}
              className={`relative shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all overflow-hidden ${
                activeFilter === pill.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {activeFilter === pill.key && (
                <motion.span
                  className="absolute inset-0 rounded-full"
                  animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', backgroundSize: '200% 100%' }}
                />
              )}
              <span className="relative z-10">{pill.label} ({pill.count})</span>
            </motion.button>
          ))}

          {/* Search input */}
          <div className="relative ml-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar loja..."
              className="h-8 pl-8 pr-8 text-xs rounded-full bg-card border border-border focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 placeholder:text-muted-foreground w-36 sm:w-48 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Store cards — horizontal scrollable */}
        <div className="overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1">
          <div className="flex gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((store, i) => (
                <motion.div
                  key={store.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04, type: 'spring' as const, stiffness: 300, damping: 25 }}
                  whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                  className="shrink-0 w-40 sm:w-48 bg-card/80 backdrop-blur-sm rounded-xl border border-border/60 p-4 cursor-pointer group card-spotlight"
                >
                  {/* Status dot + store emoji */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{categoryEmoji[store.category] || '📦'}</span>
                    <div className="flex items-center gap-1.5">
                      {store.isOpen ? (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                      ) : (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Store name */}
                  <h4 className="text-sm font-semibold line-clamp-1 mb-0.5">{store.name}</h4>
                  <p className="text-[10px] text-muted-foreground mb-2">{store.neighborhood || store.city}</p>

                  {/* Status indicator */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {store.isOpen ? (
                      store.closingSoon ? (
                        <Badge className="text-[9px] px-1.5 py-0 bg-amber-500 text-white border-0 font-bold">
                          Fechando em breve
                        </Badge>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          Aberto agora · Fecha às {store.closesAt}
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] font-medium text-red-500">
                        {store.nextOpenText}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  {store.rating > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-yellow-500 text-xs">★</span>
                      <span className="text-[10px] text-muted-foreground">{store.rating} ({store.totalReviews})</span>
                    </div>
                  )}

                  {/* Bottom CTA */}
                  <div className="mt-3 flex items-center text-[10px] text-primary font-medium group-hover:gap-1.5 transition-all gap-1">
                    Ver loja
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <Store className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma loja encontrada</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-primary hover:underline mt-1"
              >
                Limpar busca
              </button>
            )}
          </motion.div>
        )}
      </div>
    </section>
  )
}
