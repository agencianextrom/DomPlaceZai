'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Clock, MessageSquare, Sparkles, ArrowRight } from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { getStoreImageUrl } from '@/lib/product-images'
import { useAppStore, type StoreData } from '@/store/useAppStore'
import { Skeleton } from '@/components/ui/skeleton'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FeaturedStore {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  coverImage: string | null
  category: string
  neighborhood: string | null
  rating: number
  totalReviews: number
  deliveryFee: number
  freeDeliveryAbove: number | null
  totalProducts?: number
  deliveryTime?: string
}

/* ------------------------------------------------------------------ */
/*  Mock fallback stores                                               */
/* ------------------------------------------------------------------ */

const MOCK_STORES: FeaturedStore[] = [
  {
    id: 'mock-1',
    name: 'Mercado do Zé',
    slug: 'mercado-do-ze',
    description: 'Os melhores produtos frescos e hortifruti direto do campo para sua mesa. Variedade com preços justos e entrega rápida no seu bairro.',
    logo: null,
    coverImage: null,
    category: 'Alimentação',
    neighborhood: 'Centro',
    rating: 4.8,
    totalReviews: 324,
    deliveryFee: 3.99,
    freeDeliveryAbove: 50,
    totalProducts: 156,
    deliveryTime: '25-40 min',
  },
  {
    id: 'mock-2',
    name: 'Açaí da Boa',
    slug: 'acai-da-boa',
    description: 'Açaí artesanal feito com frutas selecionadas da Amazônia. Tigelas cremosas, smoothies refrescantes e combos irresistíveis para o seu dia.',
    logo: null,
    coverImage: null,
    category: 'Alimentação',
    neighborhood: 'Jardim América',
    rating: 4.9,
    totalReviews: 512,
    deliveryFee: 0,
    freeDeliveryAbove: null,
    totalProducts: 24,
    deliveryTime: '15-25 min',
  },
  {
    id: 'mock-3',
    name: 'Farmácia Vida',
    slug: 'farmacia-vida',
    description: 'Medicamentos, suplementos e produtos de saúde com os melhores preços. Entrega rápida e atendimento personalizado para você e sua família.',
    logo: null,
    coverImage: null,
    category: 'Saúde',
    neighborhood: 'Vila Industrial',
    rating: 4.7,
    totalReviews: 198,
    deliveryFee: 2.99,
    freeDeliveryAbove: 80,
    totalProducts: 342,
    deliveryTime: '20-35 min',
  },
  {
    id: 'mock-4',
    name: 'Padaria Pão Quente',
    slug: 'padaria-pao-quente',
    description: 'Pães artesanais assados diariamente, bolos caseiros e salgados fresquinhos. O sabor tradicional que sua família merece no café da manhã.',
    logo: null,
    coverImage: null,
    category: 'Alimentação',
    neighborhood: 'São José',
    rating: 4.6,
    totalReviews: 267,
    deliveryFee: 1.99,
    freeDeliveryAbove: 30,
    totalProducts: 68,
    deliveryTime: '20-30 min',
  },
]

/* ------------------------------------------------------------------ */
/*  Framer-motion variants                                             */
/* ------------------------------------------------------------------ */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
}

const badgeVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
  },
}

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: { duration: 1.8, repeat: Infinity, ease: 'linear' as const, repeatDelay: 0.5 },
  },
}

const badgeShimmerOverlay = {
  initial: { x: '-200%' },
  animate: {
    x: '200%',
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1 },
  },
}

const statPulseVariants = {
  animate: (i: number) => ({
    scale: [1, 1.08, 1],
    transition: {
      delay: 0.5 + i * 0.15,
      duration: 1.8,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  }),
}

const dotGlowVariants = {
  active: {
    boxShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 16px rgba(255,255,255,0.3)',
    scale: [1, 1.3, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const statVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.08, type: 'spring' as const, stiffness: 300, damping: 20 },
  }),
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                  */
/* ------------------------------------------------------------------ */

function LoadingSkeleton() {
  return (
    <section className="w-full rounded-2xl overflow-hidden">
      <Skeleton className="w-full h-[300px] sm:h-[380px] md:h-[420px] rounded-2xl" />
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Store emoji fallback based on category                            */
/* ------------------------------------------------------------------ */

function getStoreEmoji(category: string): string {
  if (category.includes('Alimentação') || category.includes('Food')) return '🏪'
  if (category.includes('Saúde') || category.includes('Health')) return '💊'
  if (category.includes('Beleza') || category.includes('Beauty')) return '💅'
  if (category.includes('Pet') || category.includes('Animal')) return '🐾'
  if (category.includes('Eletrônico') || category.includes('Electronic')) return '📱'
  if (category.includes('Agro')) return '🌱'
  return '🏪'
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function BrandSpotlight() {
  const { navigate, selectStore } = useAppStore()
  const [stores, setStores] = useState<FeaturedStore[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  /* ---------- Fetch stores ---------- */
  useEffect(() => {
    setMounted(true)
    async function fetchStores() {
      try {
        const data = await cachedFetch('/api/stores?limit=20')
        const apiStores = (data.stores || []) as FeaturedStore[]
        if (apiStores.length > 0) {
          setStores(apiStores)
        } else {
          setStores(MOCK_STORES)
        }
      } catch {
        setStores(MOCK_STORES)
      } finally {
        setLoading(false)
      }
    }
    fetchStores()
  }, [])

  /* ---------- Auto-rotate ---------- */
  useEffect(() => {
    if (loading || stores.length <= 1) return
    function tick() {
      if (!isPaused) {
        setDirection(1)
        setCurrentIndex(prev => (prev + 1) % stores.length)
      }
    }
    intervalRef.current = setInterval(tick, 8000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [loading, stores.length, isPaused])

  /* ---------- Navigation ---------- */
  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > currentIndex ? 1 : -1)
      setCurrentIndex(idx)
    },
    [currentIndex],
  )

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex(prev => (prev - 1 + stores.length) % stores.length)
  }, [stores.length])

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex(prev => (prev + 1) % stores.length)
  }, [stores.length])

  const handleViewStore = useCallback(
    (store: FeaturedStore) => {
      const storeData: StoreData = {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        category: store.category,
        logo: store.logo,
        coverImage: store.coverImage,
        phone: null,
        whatsapp: null,
        address: null,
        neighborhood: store.neighborhood,
        city: 'São Paulo',
        state: 'SP',
        deliveryFee: store.deliveryFee,
        freeDeliveryAbove: store.freeDeliveryAbove,
        rating: store.rating,
        totalReviews: store.totalReviews,
        opensAt: null,
        closesAt: null,
        openDays: '',
      }
      selectStore(storeData)
      navigate('store')
    },
    [navigate, selectStore],
  )

  if (!mounted || loading) return <LoadingSkeleton />
  if (stores.length === 0) return null

  const currentStore = stores[currentIndex]
  const coverUrl = currentStore.coverImage || getStoreImageUrl(currentStore.slug)
  const emoji = getStoreEmoji(currentStore.category)
  const deliveryLabel =
    currentStore.deliveryFee === 0
      ? 'Entrega grátis'
      : `R$ ${currentStore.deliveryFee.toFixed(2)}`

  return (
    <section className="w-full relative rounded-2xl overflow-hidden">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg sm:text-xl font-bold">Lojas em Destaque</h2>
      </div>

      {/* Main carousel with 3D tilt + animated gradient border */}
      <div
        className="brand-spotlight-carousel relative w-full h-[300px] sm:h-[380px] md:h-[420px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentStore.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring' as const, stiffness: 260, damping: 30 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* Background image / gradient fallback */}
            {coverUrl ? (
              <motion.img
                src={coverUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1.15, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 0.25 }}
                transition={{ duration: 1.2, ease: 'easeOut' as const }}
              />
            ) : (
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-[120px] sm:text-[160px] opacity-10 select-none"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1 }}
              >
                {emoji}
              </motion.div>
            )}

            {/* Gradient overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-5 sm:p-8 md:p-10">
              <div className="max-w-2xl">
                {/* "Loja Destaque" animated badge with shimmer */}
                <motion.div variants={badgeVariants} initial="initial" animate="animate">
                  <span className="brand-spotlight-badge relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-lg overflow-hidden">
                    <Star className="h-3 w-3" />
                    <span className="relative z-10">Loja Destaque</span>
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      variants={badgeShimmerOverlay}
                      initial="initial"
                      animate="animate"
                    />
                  </span>
                </motion.div>

                {/* Store name */}
                <motion.h3
                  className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, type: 'spring' as const, stiffness: 300, damping: 25 }}
                >
                  {currentStore.name}
                </motion.h3>

                {/* Neighborhood + Category */}
                <motion.p
                  className="mt-1 text-sm text-white/70 font-medium"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, type: 'spring' as const, stiffness: 300, damping: 25 }}
                >
                  {currentStore.neighborhood && (
                    <span className="mr-2">📍 {currentStore.neighborhood}</span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3" />
                    {currentStore.category}
                  </span>
                </motion.p>

                {/* Description */}
                <motion.p
                  className="mt-2 text-sm text-white/60 line-clamp-2 max-w-xl hidden sm:block"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: 'spring' as const, stiffness: 300, damping: 25 }}
                >
                  {currentStore.description}
                </motion.p>

                {/* Stats row */}
                <motion.div
                  className="flex flex-wrap items-center gap-4 mt-4"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.07 } },
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Rating with pulse */}
                  <motion.div
                    className="flex items-center gap-1 brand-stat-pulse"
                    custom={0}
                    variants={statVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.span custom={0} variants={statPulseVariants} animate="animate">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </motion.span>
                    <span className="text-sm font-bold text-white">{currentStore.rating.toFixed(1)}</span>
                    <span className="text-xs text-white/50">({currentStore.totalReviews})</span>
                  </motion.div>

                  {/* Products count with pulse */}
                  <motion.div
                    className="flex items-center gap-1 brand-stat-pulse"
                    custom={1}
                    variants={statVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <ShoppingBag className="h-4 w-4 text-white/60" />
                    <span className="text-xs text-white/70">
                      {currentStore.totalProducts ?? '150'} produtos
                    </span>
                  </motion.div>

                  {/* Delivery time with pulse */}
                  <motion.div
                    className="flex items-center gap-1 brand-stat-pulse"
                    custom={2}
                    variants={statVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Clock className="h-4 w-4 text-white/60" />
                    <span className="text-xs text-white/70">
                      {currentStore.deliveryTime ?? '20-40 min'}
                    </span>
                  </motion.div>

                  {/* Delivery fee with pulse */}
                  <motion.div
                    className="flex items-center gap-1 brand-stat-pulse"
                    custom={3}
                    variants={statVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <span className="text-xs text-white/70">🛵 {deliveryLabel}</span>
                  </motion.div>

                  {/* Reviews count with pulse */}
                  <motion.div
                    className="flex items-center gap-1 brand-stat-pulse"
                    custom={4}
                    variants={statVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <MessageSquare className="h-4 w-4 text-white/60" />
                    <span className="text-xs text-white/70">{currentStore.totalReviews} avaliações</span>
                  </motion.div>
                </motion.div>

                {/* CTA button with shimmer */}
                <motion.div
                  className="mt-5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: 'spring' as const, stiffness: 300, damping: 25 }}
                >
                  <motion.button
                    onClick={() => handleViewStore(currentStore)}
                    whileHover={{ scale: 1.05, boxShadow: '0 8px 30px -4px rgba(0,0,0,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                    className="relative overflow-hidden inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-primary/80 shadow-lg"
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      variants={shimmerVariants}
                      initial="initial"
                      animate="animate"
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      Ver Loja
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Left arrow button with hover glow */}
        <motion.button
          onClick={goPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
          whileHover={{
            scale: 1.1,
            boxShadow: '0 0 20px rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
          whileTap={{ scale: 0.9 }}
          aria-label="Loja anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        {/* Right arrow button with hover glow */}
        <motion.button
          onClick={goNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
          whileHover={{
            scale: 1.1,
            boxShadow: '0 0 20px rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
          whileTap={{ scale: 0.9 }}
          aria-label="Próxima loja"
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>

        {/* Navigation dots with animated active indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {stores.map((store, idx) => (
            <button
              key={store.id}
              onClick={() => goTo(idx)}
              className="relative h-2.5 w-2.5 rounded-full transition-colors"
              aria-label={`Ir para ${store.name}`}
              aria-current={idx === currentIndex ? 'true' : undefined}
            >
              {idx === currentIndex ? (
                <motion.span
                  layoutId="brand-spotlight-dot"
                  className="absolute inset-0 rounded-full bg-white brand-nav-dot-glow"
                  variants={dotGlowVariants}
                  animate="active"
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
                />
              ) : (
                <span className="absolute inset-0 rounded-full bg-white/40 hover:bg-white/60 transition-colors" />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
