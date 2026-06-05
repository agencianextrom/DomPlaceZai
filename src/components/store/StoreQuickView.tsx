'use client'

import { useState, useEffect } from 'react'
import { X, Star, Clock, MapPin, ChevronRight, ShoppingBag, Phone, Store, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type StoreData, type ProductData } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { formatBRL } from '@/components/product/ProductCard'
import { resolveProductImage } from '@/lib/product-images'

// Category labels
const categoryLabels: Record<string, string> = {
  AGRICULTURE: 'Agricultura',
  FOOD: 'Alimentação',
  SERVICES: 'Serviços',
  FASHION: 'Moda',
  ELECTRONICS: 'Eletrônicos',
  HEALTH: 'Saúde',
  HOME_GARDEN: 'Casa & Jardim',
  ANIMALS: 'Animais',
  EDUCATION: 'Educação',
  BEAUTY: 'Beleza',
  SPORTS: 'Esportes',
  OTHER: 'Outros',
}

// Delivery times per category
const deliveryTimes: Record<string, string> = {
  FOOD: '20-40 min',
  AGRICULTURE: '1-3 dias',
  SERVICES: 'Agendar',
  FASHION: '2-5 dias',
  ELECTRONICS: '3-7 dias',
  HEALTH: '30-60 min',
  HOME_GARDEN: '2-5 dias',
  ANIMALS: '1-3 dias',
  EDUCATION: 'Online',
  BEAUTY: 'Agendar',
  SPORTS: '2-5 dias',
  OTHER: '2-7 dias',
}

// Day names in Portuguese
const dayNames: Record<string, string> = {
  '1': 'Dom',
  '2': 'Seg',
  '3': 'Ter',
  '4': 'Qua',
  '5': 'Qui',
  '6': 'Sex',
  '7': 'Sáb',
}

// Floating particle config
const particles = [
  { top: '8%', left: '12%', size: 6, delay: 0, duration: 6, color: 'from-emerald-400 to-teal-400' },
  { top: '15%', right: '10%', size: 4, delay: 1.5, duration: 7, color: 'from-amber-400 to-orange-400' },
  { bottom: '20%', left: '8%', size: 5, delay: 3, duration: 5.5, color: 'from-primary to-emerald-500' },
  { top: '60%', right: '15%', size: 3, delay: 2, duration: 8, color: 'from-teal-400 to-cyan-400' },
]

// Animated counter component for stats
function AnimatedStatCounter({ target, label, icon: Icon }: { target: number; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / 800, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * target)
      setCount(start)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    requestAnimationFrame(animate)
  }, [target])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: 'spring' as const, stiffness: 300, damping: 20 }}
      className="text-center"
    >
      <div className="flex items-center justify-center gap-1 mb-0.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm font-bold">{count}</span>
      </div>
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </motion.div>
  )
}

export function StoreQuickView() {
  const { quickViewStore, closeStoreQuickView, selectStore, selectProduct, navigate, openStoreQuickView } = useAppStore()
  const [storeProducts, setStoreProducts] = useState<ProductData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isOpen = !!quickViewStore

  // Fetch store products when quick view opens
  useEffect(() => {
    if (!isOpen || !quickViewStore) return
    let cancelled = false

    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/products?storeId=${quickViewStore.id}&limit=4`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setStoreProducts(data.products || [])
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchProducts()
    return () => { cancelled = true }
  }, [isOpen, quickViewStore])

  const handleViewFullStore = () => {
    if (quickViewStore) {
      selectStore(quickViewStore)
      navigate('store')
      closeStoreQuickView()
    }
  }

  const handleProductClick = (product: ProductData) => {
    selectProduct(product)
    navigate('product')
    closeStoreQuickView()
  }

  const handleCallStore = () => {
    if (quickViewStore?.whatsapp || quickViewStore?.phone) {
      const phone = (quickViewStore.whatsapp || quickViewStore.phone || '').replace(/\D/g, '')
      if (phone) {
        window.open(`https://wa.me/55${phone}`, '_blank')
      }
    }
    closeStoreQuickView()
  }

  if (!quickViewStore) return null

  const store = quickViewStore
  const initials = store.name.substring(0, 2).toUpperCase()
  const isOpenNow = (() => {
    if (!store.opensAt || !store.closesAt) return true
    const now = new Date()
    const brasiliaOffset = 3 * 60
    const utcMins = now.getUTCHours() * 60 + now.getUTCMinutes()
    const currentMins = (utcMins - brasiliaOffset + 24 * 60) % (24 * 60)
    const [h, m] = store.opensAt.split(':').map(Number)
    const [eh, em] = store.closesAt.split(':').map(Number)
    const openMins = h * 60 + m
    const closeMins = eh * 60 + em
    if (openMins <= closeMins) {
      return currentMins >= openMins && currentMins < closeMins
    }
    return currentMins >= openMins || currentMins < closeMins
  })()

  const openDays = store.openDays
    ? store.openDays.split(',').map(d => dayNames[d.trim()] || 'Erro')
    : ['Todos os dias']

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop — glassmorphism overlay with animated gradient */}
          <motion.div
            className="absolute inset-0 r25-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeStoreQuickView}
          />

          {/* Panel — spring entrance with scale */}
          <motion.div
            className="relative w-full sm:max-w-lg sm:rounded-2xl backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 border border-white/20 overflow-hidden max-h-[85vh] flex flex-col r25-gradient-border r31-modal-enter p-1"
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring' as const, damping: 30, stiffness: 350 }}
          >
            {/* Floating gradient particles */}
            {particles.map((p, i) => (
              <div
                key={i}
                className={`sqv-particle absolute w-${p.size} h-${p.size} rounded-full bg-gradient-to-br ${p.color} pointer-events-none`}
                style={{
                  top: p.top,
                  left: p.left,
                  right: p.right,
                  bottom: p.bottom,
                  width: p.size * 2,
                  height: p.size * 2,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
              />
            ))}

            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-2 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2 r31-store-glow">
              <div className="flex items-center gap-3 min-w-0">
                {/* Store logo/initials with animated ring */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: 'spring' as const, stiffness: 400, damping: 15 }}
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-lg font-bold text-white shrink-0 shadow-lg shadow-primary/20 r25-ring-rotate"
                >
                  {initials}
                </motion.div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{store.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {categoryLabels[store.category] || store.category}
                    </Badge>
                    <div className="flex items-center gap-0.5">
                      <motion.span
                        animate={{ filter: ['drop-shadow(0 0 2px rgba(245,158,11,0.5))', 'drop-shadow(0 0 6px rgba(245,158,11,0.8))', 'drop-shadow(0 0 2px rgba(245,158,11,0.5))'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500 sqv-star-glow" />
                      </motion.span>
                      <span className="text-xs font-medium">{store.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-muted-foreground">({store.totalReviews})</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px] h-8 w-8 shrink-0"
                onClick={closeStoreQuickView}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {/* Info cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* Delivery info */}
                <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Truck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold text-primary">Entrega</span>
                  </div>
                  <p className="text-xs font-medium">
                    {store.deliveryFee === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">Grátis</span>
                    ) : (
                      <span>{formatBRL(store.deliveryFee)}</span>
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {deliveryTimes[store.category] || '2-7 dias'}
                  </p>
                  {store.freeDeliveryAbove && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Grátis acima de {formatBRL(store.freeDeliveryAbove)}
                    </p>
                  )}
                </div>

                {/* Hours */}
                <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground">Horário</span>
                  </div>
                  <p className="text-xs font-medium">
                    {store.opensAt} - {store.closesAt}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {isOpenNow ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 r31-hours-pulse" />Aberto agora</span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 r31-hours-pulse" />Fechado</span>
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {openDays.join(', ')}
                  </p>
                </div>
              </div>

              {/* Animated stats counters */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-around py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/10 mb-4"
              >
                <AnimatedStatCounter target={store.totalReviews} label="Avaliações" icon={Star} />
                <div className="w-px h-6 bg-border/50" />
                <AnimatedStatCounter target={Math.min(store.totalReviews * 12, 999)} label="Pedidos/mês" icon={ShoppingBag} />
              </motion.div>

              {/* Location */}
              {store.address && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-card rounded-xl border border-border/50">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{store.address}</p>
                    {store.neighborhood && (
                      <p className="text-[10px] text-muted-foreground">
                        {store.neighborhood} · {store.city}, {store.state}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Store products */}
              <div className="mb-4">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  Produtos da loja
                </h4>

                {isLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-xl bg-muted/50 h-40 animate-pulse" />
                    ))}
                  </div>
                ) : storeProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {storeProducts.map((product, index) => {
                      const imgUrl = resolveProductImage({ slug: product.slug, category: product.category, images: product.images })
                      const discount = product.comparePrice && product.comparePrice > product.price
                        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                        : 0

                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.06 }}
                          className="rounded-xl bg-card border border-border/50 overflow-hidden cursor-pointer hover:border-primary/20 hover:shadow-md transition-all group"
                          onClick={() => handleProductClick(product)}
                        >
                          <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                            {imgUrl ? (
                              <motion.img
                                src={imgUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                                whileHover={{ scale: 1.1 }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Store className="h-8 w-8 text-muted-foreground/30" />
                              </div>
                            )}
                            {discount > 0 && (
                              <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                -{discount}%
                              </div>
                            )}
                          </div>
                          <div className="p-2.5">
                            <h5 className="text-xs font-semibold line-clamp-2 leading-tight min-h-[2rem]">{product.name}</h5>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
                              {product.comparePrice && product.comparePrice > product.price && (
                                <span className="text-[10px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    Nenhum produto disponível
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pb-2">
                {/* "Ver Loja" button with shimmer sweep */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 r25-shimmer-sweep r31-nav-btn-lift transition-all"
                    onClick={handleViewFullStore}
                  >
                    Ver Loja Completa
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5 r25-contact-glow-green transition-all"
                    onClick={handleCallStore}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Contato
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive r25-contact-glow-red transition-all"
                    onClick={closeStoreQuickView}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>

            {/* iOS safe area */}
            <div className="h-[env(safe-area-inset-bottom)] sm:hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
