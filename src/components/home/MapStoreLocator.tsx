'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Store, Star, Clock, ChevronRight, Maximize2, LocateFixed, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type StoreData } from '@/store/useAppStore'

interface MapStoreLocatorProps {
  /** Stores to display on the map */
  stores: StoreData[]
}

// Simulated store positions on the map (relative coordinates 0-100)
function generateStorePosition(storeId: string): { x: number; y: number } {
  let hash = 0
  for (let i = 0; i < storeId.length; i++) {
    hash = storeId.charCodeAt(i) + ((hash << 5) - hash)
  }
  // Keep stores within 15-85% of the map area for visual clarity
  const x = 15 + (Math.abs(hash) % 70)
  const y = 15 + (Math.abs(hash >> 8) % 70)
  return { x, y }
}

const categoryColors: Record<string, string> = {
  FOOD: 'bg-emerald-500',
  AGRICULTURE: 'bg-lime-500',
  HEALTH: 'bg-teal-500',
  ELECTRONICS: 'bg-amber-500',
  ANIMALS: 'bg-rose-500',
  BEAUTY: 'bg-fuchsia-500',
  FASHION: 'bg-orange-500',
  SERVICES: 'bg-red-500',
}

const openStatusEmojis: Record<string, { text: string; color: string }> = {
  open: { text: 'Aberto agora', color: 'text-emerald-600 dark:text-emerald-400' },
  closed: { text: 'Fechado', color: 'text-red-500' },
}

export function MapStoreLocator({ stores }: MapStoreLocatorProps) {
  const { navigate, selectStore } = useAppStore()
  const [selectedStoreOnMap, setSelectedStoreOnMap] = useState<StoreData | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [userLocation] = useState({ x: 50, y: 50 }) // Center of Dom Eliseu

  // Check if a store is open based on Brasilia timezone
  const isOpen = (store: StoreData): boolean => {
    if (!store.opensAt || !store.closesAt) return true
    const now = new Date()
    const brasiliaOffset = -3
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const brasiliaTime = new Date(utc + brasiliaOffset * 3600000)
    const currentMinutes = brasiliaTime.getHours() * 60 + brasiliaTime.getMinutes()
    const [openH, openM] = store.opensAt.split(':').map(Number)
    const [closeH, closeM] = store.closesAt.split(':').map(Number)
    return currentMinutes >= openH * 60 + openM && currentMinutes < closeH * 60 + closeM
  }

  const storesWithPositions = useMemo(
    () =>
      stores.map((store) => ({
        store,
        position: generateStorePosition(store.id),
        open: isOpen(store),
      })),
    [stores]
  )

  const handleStoreClick = (store: StoreData) => {
    selectStore(store)
    navigate('store')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMapStoreHover = (store: StoreData | null) => {
    setSelectedStoreOnMap(store)
  }

  // Nearby stores (sorted by simulated distance from center)
  const nearbyStores = [...storesWithPositions]
    .map((s) => {
      const dx = s.position.x - userLocation.x
      const dy = s.position.y - userLocation.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return { ...s, distance }
    })
    .sort((a, b) => a.distance - b.distance)

  // Generate connection lines between nearby stores (connecting sequential stores by distance)
  const connectionLines = useMemo(() => {
    if (nearbyStores.length < 2) return []
    const lines: { x1: number; y1: number; x2: number; y2: number; index: number }[] = []
    // Connect each store to the next nearest store
    for (let i = 0; i < nearbyStores.length - 1; i++) {
      lines.push({
        x1: nearbyStores[i].position.x,
        y1: nearbyStores[i].position.y,
        x2: nearbyStores[i + 1].position.x,
        y2: nearbyStores[i + 1].position.y,
        index: i,
      })
    }
    return lines
  }, [nearbyStores])

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">Lojas Proximas</h2>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Navigation className="h-2.5 w-2.5" />
              Dom Eliseu, PA
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Recolher' : 'Expandir'}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Maximize2 className="h-3 w-3" />
          </motion.div>
        </Button>
      </div>

      {/* Glassmorphism search/location input panel */}
      <div className="mb-3">
        <div className="r43-search-panel-blur">
          <div className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Buscar lojas proximas..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              readOnly
            />
            <Badge variant="secondary" className="text-[10px] shrink-0 bg-primary/10 text-primary border-0">
              {stores.length} lojas
            </Badge>
          </div>
        </div>
      </div>

      {/* Map area with animated gradient border */}
      <div className="relative rounded-2xl p-[2px] overflow-hidden">
        {/* Animated rotating gradient border */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'conic-gradient(from var(--gradient-angle, 0deg), hsl(var(--primary)), hsl(160, 84%, 39%), hsl(var(--accent)), hsl(160, 84%, 39%), hsl(var(--primary)))',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' as const }}
        />
        <div
          className={`relative rounded-[14px] overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-amber-950/20 ${
            isExpanded ? 'h-72 sm:h-80' : 'h-48 sm:h-56'
          } transition-all duration-500`}
        >
          {/* Background grid pattern */}
          <div className="r43-map-grid" />

          {/* Simulated road lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="30" x2="100" y2="30" className="r43-map-road-line" />
            <line x1="0" y1="60" x2="100" y2="60" className="r43-map-road-line" />
            <line x1="25" y1="0" x2="25" y2="100" className="r43-map-road-line" />
            <line x1="50" y1="0" x2="50" y2="100" className="r43-map-road-line" />
            <line x1="75" y1="0" x2="75" y2="100" className="r43-map-road-line" />
            {/* Diagonal road */}
            <line x1="10" y1="10" x2="90" y2="90" className="r43-map-road-line" />
          </svg>

          {/* Animated connection lines between stores */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {connectionLines.map((line) => (
              <motion.line
                key={line.index}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="currentColor"
                strokeWidth="0.25"
                className="r43-connection-line text-primary/20"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: { duration: 1.5, delay: line.index * 0.2, ease: 'easeInOut' as const },
                  opacity: { duration: 0.5, delay: line.index * 0.2 },
                }}
              />
            ))}
          </svg>

          {/* City label */}
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-lg px-2.5 py-1.5 shadow-sm border border-white/30 dark:border-white/10">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold">Dom Eliseu</span>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="absolute bottom-12 left-3">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(categoryColors)
                .filter(([key]) => stores.some((s) => s.category === key))
                .slice(0, 5)
                .map(([key, color]) => (
                  <div key={key} className="r43-category-pill">
                    <div className={`h-2 w-2 rounded-full ${color}`} />
                    <span className="text-[8px]">{key.replace(/_/g, ' ').slice(0, 8)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Legend */}
          <div className="absolute top-3 right-3">
            <div className="r43-map-legend">
              {Object.entries(categoryColors)
                .filter(([key]) => stores.some((s) => s.category === key))
                .slice(0, 4)
                .map(([key, color]) => (
                  <div key={key} className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${color}`} />
                    <span className="text-[8px] text-muted-foreground">
                      {key.replace(/_/g, ' ').slice(0, 6)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* User location dot */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' as const }}
            className="absolute z-20"
            style={{ left: `${userLocation.x}%`, top: `${userLocation.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="r43-location-pulse">
              <LocateFixed className="h-2 w-2 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </motion.div>

          {/* Store dots with pulsing animations */}
          {storesWithPositions.map(({ store, position, open }, index) => (
            <motion.button
              key={store.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
              whileHover={{ scale: 1.5, zIndex: 30 }}
              onMouseEnter={() => handleMapStoreHover(store)}
              onMouseLeave={() => handleMapStoreHover(null)}
              onClick={() => handleStoreClick(store)}
              className="absolute z-10 cursor-pointer group"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              aria-label={`Ver ${store.name}`}
            >
              {/* Outer pulsing ring for open stores */}
              {open && (
                <div className="r43-pin-pulse-outer" style={{ color: 'rgba(16, 185, 129, 0.35)' }} />
              )}

              {/* Inner pulsing ring */}
              {open && (
                <div className="r43-pin-pulse-inner" style={{ color: 'rgba(16, 185, 129, 0.25)' }} />
              )}

              {/* Store pin */}
              <div
                className={`r43-store-pin ${categoryColors[store.category] || 'bg-emerald-500'} ${!open ? 'r43-store-pin-closed' : ''}`}
              />

              {/* Glassmorphism hover card with store info */}
              <AnimatePresence>
                {selectedStoreOnMap?.id === store.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.85 }}
                    transition={{
                      type: 'spring' as const,
                      stiffness: 300,
                      damping: 25,
                    }}
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-48 z-50 r43-hover-card-glass ${selectedStoreOnMap?.id === store.id ? 'r43-hover-card-glass-visible' : ''}`}
                  >
                    <div className={`h-1 w-full rounded-full bg-gradient-to-r ${categoryColors[store.category] || 'bg-emerald-500'} mb-2 opacity-60`} />
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Store className="h-3 w-3 text-primary" />
                      <span className="text-xs font-bold line-clamp-1">{store.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-medium">{store.rating}</span>
                        <span className="text-[10px] text-muted-foreground">({store.totalReviews})</span>
                      </div>
                      <span className={`text-[10px] font-medium ${open ? openStatusEmojis.open.color : openStatusEmojis.closed.color}`}>
                        <Clock className="h-2.5 w-2.5 inline mr-0.5" />
                        {open ? 'Aberto' : 'Fechado'}
                      </span>
                    </div>
                    {store.deliveryFee > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Entrega: R$ {store.deliveryFee.toFixed(2)}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}

          {/* Bottom overlay with count */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-white/90 flex items-center justify-center">
                  <Store className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs font-semibold text-white">
                  {storesWithPositions.filter((s) => s.open).length} lojas abertas
                </span>
              </div>
              <Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm">
                {stores.length} lojas no mapa
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby stores list */}
      <div className="mt-3 space-y-2">
        {nearbyStores.slice(0, isExpanded ? 6 : 3).map(({ store, open, distance }, index) => (
          <motion.button
            key={store.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            whileHover={{
              x: 3,
              boxShadow: '0 0 15px rgba(var(--primary-rgb, 0,0,0), 0.15), 0 0 30px rgba(var(--primary-rgb, 0,0,0), 0.05)',
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleStoreClick(store)}
            className="r43-nearby-item"
          >
            {/* Category dot */}
            <div className="relative shrink-0">
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                  categoryColors[store.category] || 'bg-emerald-500'
                } ${!open ? 'opacity-40 grayscale' : ''}`}
              >
                <Store className="h-4 w-4 text-white" />
              </div>
              {open && (
                <div className="r43-open-dot" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {store.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span className="text-[11px] font-medium">{store.rating}</span>
                </div>
                <span className="text-border">|</span>
                <span className={`text-[11px] font-medium ${open ? openStatusEmojis.open.color : openStatusEmojis.closed.color}`}>
                  {open ? 'Aberto agora' : 'Fechado'}
                </span>
                {store.deliveryFee > 0 && (
                  <>
                    <span className="text-border">|</span>
                    <span className="text-[11px] text-muted-foreground">
                      Entrega R$ {store.deliveryFee.toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-muted-foreground font-medium">
                ~{(distance * 0.05).toFixed(1)} km
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.section>
  )
}
