'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Flame, Clock, TrendingDown, ShoppingCart, ChevronLeft, ChevronRight, Zap, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { resolveProductImage } from '@/lib/product-images'
import { toast } from 'sonner'

const gradients = [
  'from-red-100 to-orange-200 dark:from-red-900/30 dark:to-orange-800/30',
  'from-amber-100 to-yellow-200 dark:from-amber-900/30 dark:to-yellow-800/30',
  'from-orange-100 to-red-200 dark:from-orange-900/30 dark:to-red-800/30',
  'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
  'from-yellow-100 to-amber-200 dark:from-yellow-900/30 dark:to-amber-800/30',
  'from-red-100 to-amber-200 dark:from-red-900/30 dark:to-amber-800/30',
]

const categoryIcons: Record<string, string> = {
  FOOD: '🍚',
  HEALTH: '💊',
  AGRICULTURE: '🌿',
  ANIMALS: '🐾',
  BEAUTY: '💅',
  ELECTRONICS: '📱',
  SERVICES: '🔧',
  FASHION: '👗',
  HOME_GARDEN: '🏡',
  EDUCATION: '📚',
  SPORTS: '⚽',
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function useFlashCountdown() {
  const [time, setTime] = useState(() => {
    // Set to end of day (23:59:59)
    const now = new Date()
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    const diff = Math.max(0, end.getTime() - now.getTime())
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return { hours, minutes, seconds }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) return prev
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return time
}

// Loading skeleton for flash sale cards
function FlashSaleCardSkeleton() {
  return (
    <div className="shrink-0 w-[155px] sm:w-[175px]">
      <Card className="overflow-hidden h-full">
        <CardContent className="p-0 h-full flex flex-col">
          <Skeleton className="aspect-square w-full" />
          <div className="p-2.5 flex flex-col flex-1">
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-4 w-full mt-0.5" />
            <Skeleton className="h-4 w-3/4 mt-1" />
            <div className="mt-auto pt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-1.5 w-full mt-2 rounded-full" />
              <Skeleton className="h-7 w-full mt-2 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Map API product to the display format
interface FlashProduct extends ProductData {
  soldPercent: number
}

function mapApiToFlashProduct(p: Record<string, unknown>): FlashProduct {
  const soldCount = (p.soldCount as number) || 0
  const stock = (p.stock as number) || 10
  const estimatedTotal = Math.max(stock + soldCount, stock)
  const soldPercent = Math.min(Math.round((soldCount / estimatedTotal) * 100), 98)

  return {
    id: p.id as string,
    storeId: (p.storeId as string) || '',
    storeName: (p.storeName as string) || 'Loja',
    storeLogo: (p.storeLogo as string) || null,
    name: (p.name as string) || '',
    slug: (p.slug as string) || '',
    description: (p.description as string) || '',
    price: typeof p.price === 'number' ? p.price : 0,
    comparePrice: typeof p.comparePrice === 'number' ? p.comparePrice : null,
    images: (p.images as string) || '[]',
    stock: typeof p.stock === 'number' ? p.stock : 10,
    rating: typeof p.rating === 'number' ? p.rating : 0,
    totalReviews: typeof p.totalReviews === 'number' ? p.totalReviews : 0,
    isFeatured: (p.isFeatured as boolean) || false,
    isNew: (p.isNew as boolean) || false,
    isOffer: (p.isOffer as boolean) || true,
    tags: (p.tags as string) || '[]',
    variations: (p.variations as string) || null,
    category: (p.category as string) || 'OTHER',
    soldPercent,
  }
}

export function FlashSale() {
  const { addToCart, selectProduct, navigate } = useAppStore()
  const countdown = useFlashCountdown()
  const [scrollPos, setScrollPos] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [products, setProducts] = useState<FlashProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pad = (n: number) => String(n).padStart(2, '0')
  const { hours, minutes, seconds } = countdown

  // Fetch offer products from API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/products?isOffer=true&limit=6&sort=popular')
      if (!res.ok) throw new Error('Erro ao carregar ofertas')
      const data = await res.json()
      const flashProducts = (data.products || []).map(mapApiToFlashProduct)
      setProducts(flashProducts)
    } catch {
      setError('Erro ao carregar ofertas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Auto-refresh animation when timer reaches zero
  useEffect(() => {
    if (hours === 0 && minutes === 0 && seconds === 0) {
      const startTimer = setTimeout(() => {
        setRefreshing(true)
        fetchProducts()
      }, 0)
      const endTimer = setTimeout(() => setRefreshing(false), 2000)
      return () => { clearTimeout(startTimer); clearTimeout(endTimer) }
    }
  }, [hours, minutes, seconds, fetchProducts])

  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = document.getElementById('flash-sale-scroll')
    if (!container) return
    const amount = 200
    const newScroll = direction === 'left'
      ? Math.max(0, scrollPos - amount)
      : scrollPos + amount
    container.scrollTo({ left: newScroll, behavior: 'smooth' })
    setScrollPos(newScroll)
  }, [scrollPos])

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => b.soldPercent - a.soldPercent)
  }, [products])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative"
    >
      <div className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-900/10 dark:via-orange-900/10 dark:to-amber-900/10 rounded-2xl border border-red-200/50 dark:border-red-800/30 overflow-hidden glass-card-hover">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg"
            >
              <Flame className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  Oferta Relâmpago
                </span>
                <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Descontos imperdíveis por tempo limitado</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setRefreshing(true)
                fetchProducts()
              }}
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>

            {/* Countdown Timer */}
            <div className="flex items-center gap-1 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-red-200/50 dark:border-red-800/30 shadow-sm inner-shadow-accent">
              <Clock className="h-3.5 w-3.5 text-red-500 mr-1 hidden sm:block" />
              <div className="flex items-center gap-0.5">
                {[
                  { value: pad(hours), label: 'h' },
                  { value: pad(minutes), label: 'm' },
                  { value: pad(seconds), label: 's' },
                ].map((unit, idx) => (
                  <span key={unit.label} className="flex items-center">
                    <motion.span
                      key={unit.value}
                      initial={{ y: -4, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="inline-flex items-center justify-center min-w-[28px] h-8 rounded-lg bg-gradient-to-b from-red-500 to-red-600 text-white text-sm font-bold tabular-nums shadow-sm"
                    >
                      {unit.value}
                    </motion.span>
                    <span className="text-[9px] font-medium text-muted-foreground ml-0.5 mr-0.5">{unit.label}</span>
                    {idx < 2 && <span className="text-red-400 font-bold mx-0.5 animate-pulse-soft">:</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product scroll */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {refreshing ? (
              <motion.div
                key="refreshing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-48 flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
                />
              </motion.div>
            ) : (
              <motion.div
                key="products"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Error state */}
                {error && !isLoading && products.length === 0 ? (
                  <div className="px-4 pb-4 flex flex-col items-center justify-center h-48 text-center">
                    <p className="text-sm text-muted-foreground mb-2">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchProducts}
                      className="gap-1.5"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Tentar novamente
                    </Button>
                  </div>
                ) : (
                  <div id="flash-sale-scroll" className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-4">
                    {/* Loading skeletons */}
                    {isLoading && (
                      <>
                        {Array.from({ length: 4 }).map((_, i) => (
                          <FlashSaleCardSkeleton key={`skeleton-${i}`} />
                        ))}
                      </>
                    )}

                    {/* Real products */}
                    {!isLoading && sortedProducts.map((product, index) => {
                      const discount = product.comparePrice
                        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                        : 0
                      const isLowStock = product.soldPercent >= 85
                      const gradient = gradients[index % gradients.length]
                      const imageUrl = resolveProductImage({
                        slug: product.slug,
                        category: product.category,
                        images: product.images,
                      })

                      return (
                        <motion.div
                          key={product.id}
                          className="shrink-0 w-[155px] sm:w-[175px]"
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08, duration: 0.4 }}
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-all border-red-200/30 dark:border-red-800/20 h-full cursor-pointer group glass-card-hover" onClick={() => { selectProduct(product); navigate('product') }}>
                            <CardContent className="p-0 h-full flex flex-col">
                              {/* Image */}
                              <div className={`relative aspect-square flex items-center justify-center bg-gradient-to-br ${gradient} overflow-hidden`}>
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                    loading="lazy"
                                  />
                                ) : null}
                                {!imageUrl && (
                                  <motion.div
                                    className="h-14 w-14 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform z-10"
                                    animate={isLowStock ? { scale: [1, 1.05, 1] } : {}}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    <span className="text-3xl">{categoryIcons[product.category] || '📦'}</span>
                                  </motion.div>
                                )}

                                {/* Discount badge */}
                                <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[10px] px-1.5 py-0 font-bold shadow-sm">
                                  <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                                  -{discount}%
                                </Badge>

                                {/* Low stock pulsing indicator */}
                                {isLowStock && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute top-2 right-2"
                                  >
                                    <motion.div
                                      animate={{ opacity: [1, 0.6, 1] }}
                                      transition={{ duration: 1.2, repeat: Infinity }}
                                      className="flex items-center gap-0.5 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm badge-floating"
                                    >
                                      <AlertTriangle className="h-2.5 w-2.5" />
                                      Últimas!
                                    </motion.div>
                                  </motion.div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="p-2.5 flex flex-col flex-1">
                                <p className="text-[10px] text-muted-foreground">{product.storeName}</p>
                                <h3 className="text-xs font-semibold mt-0.5 line-clamp-2 leading-tight min-h-[1.75rem]">
                                  {product.name}
                                </h3>

                                <div className="mt-auto pt-2">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-sm font-extrabold text-red-600 dark:text-red-400">{formatBRL(product.price)}</span>
                                    {product.comparePrice && (
                                      <span className="text-[10px] text-muted-foreground line-through-animated">
                                        {formatBRL(product.comparePrice)}
                                      </span>
                                    )}
                                  </div>

                                  {/* Stock progress */}
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[9px] text-muted-foreground">
                                        {product.stock} restantes
                                      </span>
                                      <span className="text-[9px] font-bold text-red-600 dark:text-red-400">
                                        {product.soldPercent}% vendido
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                      <motion.div
                                        className={`h-full rounded-full ${isLowStock ? 'bg-red-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${product.soldPercent}%` }}
                                        transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                                      />
                                    </div>
                                  </div>

                                  {/* Add to cart button */}
                                  <motion.div className="mt-2">
                                    <Button
                                      size="sm"
                                      className="w-full h-7 text-[10px] bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 gap-1 btn-smooth ripple-effect"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        addToCart(product, product.storeName || 'Loja')
                                        toast.success(`${product.name} adicionado!`)
                                      }}
                                    >
                                      <ShoppingCart className="h-3 w-3" />
                                      Comprar
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}

                    {/* Empty state */}
                    {!isLoading && products.length === 0 && !error && (
                      <div className="flex items-center justify-center w-full h-48">
                        <p className="text-sm text-muted-foreground">Nenhuma oferta disponível no momento</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll buttons */}
          {products.length > 0 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 dark:bg-card/90 shadow-md border border-border/50 flex items-center justify-center hover:bg-white transition-colors z-10 hidden sm:flex"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 dark:bg-card/90 shadow-md border border-border/50 flex items-center justify-center hover:bg-white transition-colors z-10 hidden sm:flex"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Bottom fire decoration with shimmer */}
        <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 relative overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          >
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
