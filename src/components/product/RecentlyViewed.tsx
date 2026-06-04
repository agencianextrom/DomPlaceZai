'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { resolveProductImage } from '@/lib/product-images'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const AUTO_SCROLL_SPEED = 0.8 // pixels per frame
const AUTO_SCROLL_INTERVAL = 50 // ms between frames
const IDLE_TIMEOUT = 3000 // ms before auto-scroll starts

const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

interface RecentlyViewedProduct {
  id: string
  storeId: string
  storeName?: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  images: string
  category: string
  rating: number
  totalReviews: number
  isNew: boolean
  isOffer: boolean
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, x: 30, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1 },
}

function LoadingSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="shrink-0 w-[160px] sm:w-[190px]">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="mt-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function RecentlyViewed() {
  const { selectProduct, navigate, recentlyViewed, addRecentlyViewed, clearRecentlyViewed } = useAppStore()
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isInteracting = useRef(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const autoScrollRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const [mounted, setMounted] = useState(false)

  // Sync from Zustand store — also fetch full product data if needed
  const fetchProducts = useCallback(async () => {
    if (recentlyViewed.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/products?limit=100')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      const allProducts: RecentlyViewedProduct[] = (data.products || []).filter(
        (p: RecentlyViewedProduct) => recentlyViewed.some(rv => rv.id === p.id)
      )

      // Sort by recency (match store order)
      const ordered = recentlyViewed
        .map(rv => allProducts.find(p => p.id === rv.id))
        .filter((p): p is RecentlyViewedProduct => p !== undefined)
        .slice(0, 10)

      setProducts(ordered)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [recentlyViewed])

  useEffect(() => {
    setMounted(true)
    fetchProducts()
  }, [fetchProducts])

  // Auto-scroll logic
  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) return
    autoScrollRef.current = setInterval(() => {
      if (isInteracting.current || !scrollRef.current) return
      const el = scrollRef.current
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollLeft += AUTO_SCROLL_SPEED
      }
    }, AUTO_SCROLL_INTERVAL)
  }, [])

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current)
      autoScrollRef.current = undefined
    }
  }, [])

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    stopAutoScroll()
    idleTimerRef.current = setTimeout(() => {
      startAutoScroll()
    }, IDLE_TIMEOUT)
  }, [stopAutoScroll, startAutoScroll])

  useEffect(() => {
    if (products.length > 0) {
      idleTimerRef.current = setTimeout(() => {
        startAutoScroll()
      }, IDLE_TIMEOUT)
    }
    return () => {
      stopAutoScroll()
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [products.length, startAutoScroll, stopAutoScroll])

  const handleProductClick = useCallback((product: RecentlyViewedProduct) => {
    const productData: ProductData = {
      id: product.id,
      storeId: product.storeId,
      storeName: product.storeName,
      name: product.name,
      slug: product.slug,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images,
      category: product.category,
      rating: product.rating,
      totalReviews: product.totalReviews,
      isNew: product.isNew,
      isOffer: product.isOffer,
      isFeatured: false,
      stock: 0,
      tags: '',
      variations: null,
      description: null,
    }
    selectProduct(productData)
    navigate('product')
    addRecentlyViewed(productData)
  }, [selectProduct, navigate, addRecentlyViewed])

  const handleInteractionStart = useCallback(() => {
    isInteracting.current = true
    resetIdleTimer()
  }, [resetIdleTimer])

  const handleInteractionEnd = useCallback(() => {
    isInteracting.current = false
  }, [])

  const scrollByAmount = useCallback((direction: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' })
      resetIdleTimer()
    }
  }, [resetIdleTimer])

  const handleClearHistory = () => {
    clearRecentlyViewed()
    toast.success('Histórico limpo!')
  }

  // Don't render on server, and don't render if fewer than 2 items
  if (!mounted) return null
  if (!loading && products.length < 2) return null

  return (
    <section className="mt-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Vistos Recentemente</h2>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Produtos que você visitou
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Clear history button */}
          {!loading && products.length >= 2 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearHistory}
              className="h-7 px-2 rounded-full flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              <span className="hidden sm:inline">Limpar</span>
            </motion.button>
          )}
          {/* Scroll controls */}
          {!loading && products.length > 3 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => scrollByAmount(-1)}
                aria-label="Rolar para esquerda"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => scrollByAmount(1)}
                aria-label="Rolar para direita"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Products Carousel */}
      {!loading && products.length > 0 && (
        <motion.div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 cursor-grab active:cursor-grabbing"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onMouseEnter={handleInteractionStart}
          onMouseLeave={handleInteractionEnd}
          onMouseDown={handleInteractionStart}
          onMouseUp={handleInteractionEnd}
          onTouchStart={handleInteractionStart}
          onTouchEnd={handleInteractionEnd}
        >
          {products.map((product) => {
            const imageUrl = resolveProductImage({
              slug: product.slug,
              category: product.category,
              images: product.images,
            })
            const discount = product.comparePrice && product.comparePrice > product.price
              ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
              : 0

            return (
              <motion.div
                key={product.id}
                variants={cardVariants}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="shrink-0 w-[160px] sm:w-[190px] group"
                onClick={() => handleProductClick(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleProductClick(product) }}
              >
                <motion.div
                  className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all card-premium-hover"
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-4xl">📦</div>
                    )}

                    {/* Discount badge */}
                    {discount > 0 && (
                      <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        -{discount}%
                      </div>
                    )}

                    {/* New badge */}
                    {product.isNew && (
                      <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        Novo
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    {/* Store name */}
                    {product.storeName && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {product.storeName}
                      </p>
                    )}

                    <h3 className="text-xs font-semibold mt-0.5 line-clamp-2 leading-tight min-h-[2rem]">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className="text-sm font-bold text-primary">
                        {priceFormatter.format(product.price)}
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          {priceFormatter.format(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </section>
  )
}
