'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Award } from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { resolveProductImage } from '@/lib/product-images'
import { formatBRL } from '@/lib/format'
import type { ProductData } from '@/store/useAppStore'

/* ── shimmer keyframes injected once ── */
const SHIMMER_STYLE = `
@keyframes badge-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.top-rated-badge {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 25%, #fef3c7 50%, #fbbf24 75%, #f59e0b 100%);
  background-size: 200% 100%;
  animation: badge-shimmer 2.5s ease-in-out infinite;
}
@keyframes golden-glow {
  0%, 100% { filter: drop-shadow(0 0 2px rgba(245, 158, 11, 0.4)); }
  50% { filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.7)); }
}
.golden-glow {
  animation: golden-glow 2s ease-in-out infinite;
}
`

/* ── Emoji fallback map by category ── */
const categoryEmojis: Record<string, string> = {
  FOOD: '🍽️',
  HEALTH: '💊',
  AGRICULTURE: '🌱',
  ELECTRONICS: '📱',
  ANIMALS: '🐾',
  BEAUTY: '✂️',
  FASHION: '👕',
  SERVICES: '🔧',
  HOME_GARDEN: '🏡',
  SPORTS: '🏋️',
  EDUCATION: '📖',
}

/* ── Container animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
    },
  },
}

export function TopRatedPicks() {
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    cachedFetch('/api/products?limit=50&sort=rating')
      .then((data) => {
        if (cancelled) return
        const all = (data?.products ?? []) as ProductData[]
        // Filter top-rated (>= 4.5) and sort by rating desc
        const topRated = all
          .filter((p) => p.rating >= 4.5)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 12)
        setProducts(topRated)
      })
      .catch(() => { /* silent fail */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 260
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  if (!loading && products.length === 0) return null

  return (
    <style dangerouslySetInnerHTML={{ __html: SHIMMER_STYLE }}>
      <section className="w-full bg-gradient-to-br from-amber-50/40 via-background to-background rounded-2xl p-4 sm:p-5 r62-card-lift">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 r62-heading-gradient">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              <Award className="h-5 w-5 text-amber-500" />
            </motion.div>
            <span>Mais Bem Avaliados</span>
          </h2>

          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Rolar para esquerda"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Rolar para direita"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[180px] sm:w-[210px]">
                <div className="bg-muted animate-pulse rounded-xl aspect-square" />
                <div className="mt-2 space-y-2">
                  <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Cards carousel ── */}
        {!loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2 snap-x snap-mandatory scroll-smooth"
            >
              {products.map((product, idx) => {
                const imageUrl = resolveProductImage({
                  slug: product.slug,
                  category: product.category,
                  images: product.images,
                })
                const emoji = categoryEmojis[product.category] || '📦'

                return (
                  <motion.div
                    key={product.id}
                    variants={cardVariants}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 12px 40px -8px rgba(245, 158, 11, 0.25), 0 4px 16px -4px rgba(0,0,0,0.1)',
                    }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
                    className="snap-start shrink-0 w-[180px] sm:w-[210px]"
                  >
                    <div className="relative bg-card rounded-xl border border-border overflow-hidden group cursor-pointer h-full flex flex-col">
                      {/* ── Top Rated badge with shimmer ── */}
                      <div className="absolute top-2 left-2 z-20 top-rated-badge text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="h-2.5 w-2.5 fill-amber-900" />
                        Top Rated
                      </div>

                      {/* ── Image area ── */}
                      <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl">{emoji}</span>
                          </div>
                        )}
                      </div>

                      {/* ── Info area ── */}
                      <div className="p-2.5 flex flex-col flex-1 min-h-0">
                        {/* Store name */}
                        {product.storeName && (
                          <p className="text-[10px] font-medium text-primary truncate mb-0.5">
                            {product.storeName}
                          </p>
                        )}

                        {/* Product name */}
                        <h3 className="text-xs font-semibold line-clamp-2 leading-tight min-h-[1.75rem]">
                          {product.name}
                        </h3>

                        {/* Star rating with golden glow */}
                        <div className="flex items-center gap-1 mt-1.5 golden-glow">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const filled = product.rating >= star
                            const half = !filled && product.rating >= star - 0.5
                            return (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  filled
                                    ? 'text-amber-500 fill-amber-500'
                                    : half
                                      ? 'text-amber-500 fill-amber-500/50'
                                      : 'text-muted-foreground/30'
                                }`}
                              />
                            )
                          })}
                          <span className="text-[10px] font-semibold text-amber-600 ml-0.5">
                            {product.rating.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({product.totalReviews})
                          </span>
                        </div>

                        {/* Price with hover highlight */}
                        <div className="mt-auto pt-1.5">
                          <motion.span
                            className="text-sm font-extrabold text-primary inline-block"
                            whileHover={{ scale: 1.1, color: '#d97706' }}
                            transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                          >
                            {formatBRL(product.price)}
                          </motion.span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-[10px] text-muted-foreground line-through ml-1">
                              {formatBRL(product.comparePrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Left/right gradient fade */}
            <div className="absolute top-0 left-0 bottom-2 w-6 bg-gradient-to-r from-amber-50/80 to-transparent pointer-events-none z-10 -ml-4" />
            <div className="absolute top-0 right-0 bottom-2 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 -mr-4" />
          </motion.div>
        )}
      </section>
    </style>
  )
}
