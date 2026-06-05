'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Star, ChevronLeft, ChevronRight, MapPin, Clock, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore, type StoreData } from '@/store/useAppStore'

interface StoreFavoritesProps {
  /** All available stores to filter favorites from */
  stores: StoreData[]
}

const storeCategoryIcons: Record<string, string> = {
  FOOD: 'UtensilsCrossed',
  AGRICULTURE: 'Sprout',
  HEALTH: 'HeartPulse',
  ELECTRONICS: 'Smartphone',
  ANIMALS: 'PawPrint',
  BEAUTY: 'Scissors',
  FASHION: 'Shirt',
  SERVICES: 'Wrench',
}

const storeCategoryGradients: Record<string, string> = {
  FOOD: 'from-emerald-400 to-green-500',
  AGRICULTURE: 'from-lime-500 to-green-600',
  HEALTH: 'from-teal-400 to-emerald-500',
  ELECTRONICS: 'from-amber-400 to-orange-500',
  ANIMALS: 'from-rose-400 to-pink-500',
  BEAUTY: 'from-fuchsia-400 to-pink-500',
  FASHION: 'from-amber-400 to-rose-500',
  SERVICES: 'from-orange-400 to-red-500',
}

function HeartBurstParticles() {
  const particles = useMemo(() => {
    const count = 7
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (360 / count) * i,
      distance: 20 + Math.random() * 15,
    }))
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute text-xs"
          style={{
            left: '50%',
            top: '50%',
            transformOrigin: 'center',
          }}
          initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          ❤️
        </motion.span>
      ))}
    </div>
  )
}

export function StoreFavorites({ stores }: StoreFavoritesProps) {
  const { favoriteStoreIds, navigate, selectStore, isFavoriteStore, toggleFavoriteStore } = useAppStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [burstKey, setBurstKey] = useState<string | null>(null)

  const favoriteStores = stores.filter((s) => isFavoriteStore(s.id))

  // If no favorites, show top-rated stores as suggestions
  const displayStores = favoriteStores.length > 0
    ? favoriteStores
    : stores.slice(0, 8).sort((a, b) => b.rating - a.rating)

  const isShowingSuggestions = favoriteStores.length === 0

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 5)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [displayStores])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.7
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const handleStoreClick = (store: StoreData) => {
    selectStore(store)
    navigate('store')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFavoriteToggle = (e: React.MouseEvent, storeId: string) => {
    e.stopPropagation()
    toggleFavoriteStore(storeId)
    setBurstKey(`${storeId}-${Date.now()}`)
    setTimeout(() => setBurstKey(null), 700)
  }

  if (displayStores.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="r62-card-lift"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart className="h-5 w-5 text-red-500" />
          </motion.div>
          <div>
            <h2 className="text-base font-bold leading-tight fav-shimmer-header r33-fav-shimmer r62-heading-gradient">
              {isShowingSuggestions ? 'Lojas Recomendadas' : 'Seus Favoritos'}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {isShowingSuggestions
                ? 'Toque no coracao para favoritar'
                : `${displayStores.length} loja${displayStores.length !== 1 ? 's' : ''} salva${displayStores.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-full"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Empty state with animated floating heart */}
      {isShowingSuggestions && (
        <motion.div
          className="flex flex-col items-center py-6 opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className="text-4xl r33-empty-float"
            animate={{
              y: [0, -12, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            💝
          </motion.span>
          <p className="text-xs text-muted-foreground mt-2">
            Toque no ❤️ para salvar lojas favoritas
          </p>
        </motion.div>
      )}

      {/* Carousel */}
      {!isShowingSuggestions && (
        <div className="relative group">
          {/* Left scroll button */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute left-0 top-0 bottom-0 z-10 flex items-center"
              >
                <div className="h-full w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-full shadow-md border-primary/20 bg-background/90 backdrop-blur-sm absolute left-1"
                  onClick={() => scroll('left')}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 scroll-smooth"
          >
            {displayStores.map((store, index) => (
              <motion.button
                key={store.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.35 }}
                whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(16,185,129,0.12), 0 0 0 1px rgba(16,185,129,0.2)', transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleStoreClick(store)}
                className="shrink-0 w-[140px] sm:w-[160px] rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all text-left group cursor-pointer relative r33-store-hover r62-card-lift"
              >
                {/* Store header gradient */}
                <div className={`relative h-16 bg-gradient-to-br ${
                  storeCategoryGradients[store.category] || 'from-emerald-400 to-teal-500'
                }`}>
                  {/* Subtle pattern */}
                  <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '12px 12px',
                  }} />

                  {/* Store initials */}
                  <div className="absolute bottom-2 left-3">
                    <div className="h-10 w-10 rounded-xl bg-white/90 dark:bg-black/30 backdrop-blur-sm flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {store.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Favorite heart button with burst particles */}
                  <div
                    className="absolute top-2 right-2 cursor-pointer z-10"
                    onClick={(e) => handleFavoriteToggle(e, store.id)}
                  >
                    <AnimatePresence>
                      {burstKey && burstKey.startsWith(store.id) && (
                        <HeartBurstParticles />
                      )}
                    </AnimatePresence>
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                      className="r33-heart-pop"
                    >
                      <Heart className={`h-4 w-4 drop-shadow-sm transition-colors ${
                        isFavoriteStore(store.id)
                          ? 'text-red-400 fill-red-400'
                          : 'text-white/60 hover:text-white'
                      }`} />
                    </motion.div>
                  </div>

                  {/* Category label */}
                  <div className="absolute top-2 left-2">
                    <span className="text-[9px] font-semibold text-white/90 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                      {store.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Store info */}
                <div className="p-3">
                  <h3 className="text-xs font-semibold line-clamp-1 leading-tight">
                    {store.name}
                  </h3>

                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="flex items-center gap-0.5 fav-star-glow group-hover:[&_svg]:drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-[11px] font-semibold">{store.rating}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">
                      ({store.totalReviews})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <ShoppingBag className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground">
                      {store.deliveryFee === 0 ? 'Entrega gratis' : `Entrega R$ ${store.deliveryFee.toFixed(2)}`}
                    </span>
                  </div>

                  {store.neighborhood && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground truncate">
                        {store.neighborhood}
                      </span>
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right fade */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          )}
        </div>
      )}
    </motion.section>
  )
}
