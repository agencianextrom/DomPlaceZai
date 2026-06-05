'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingDown, Flame, ShoppingCart, ArrowDown, Sparkles, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { cachedFetch } from '@/lib/api-cache'
import { toast } from 'sonner'

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const categoryEmojis: Record<string, string> = {
  FOOD: '🍚', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱',
  BEAUTY: '💅', ANIMALS: '🐾', FASHION: '👗', SERVICES: '🔧',
  HOME_GARDEN: '🏡', SPORTS: '⚽', EDUCATION: '📚',
}

interface TickerItem {
  product: ProductData
  discount: number
  savedAmount: number
}

// Floating down-arrow particles for decoration
function FloatingArrowParticles() {
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  const particles = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: `${15 + i * 18}%`,
      delay: i * 0.8,
      duration: 2.5 + i * 0.3,
      size: 10 + (i % 3) * 4,
    })), []
  )

  if (prefersReducedMotion) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: p.left, top: '-20px' }}
          animate={{
            y: [0, 80, 160],
            opacity: [0, 0.6, 0],
            rotate: [0, 15, -10],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: 'easeOut',
          }}
        >
          <ArrowDown
            className="text-white/40"
            style={{ width: p.size, height: p.size }}
          />
        </motion.div>
      ))}
    </div>
  )
}

export function PriceDropTicker() {
  const [items, setItems] = useState<TickerItem[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [quickAdding, setQuickAdding] = useState<string | null>(null)

  const addToCart = useAppStore((s) => s.addToCart)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let cancelled = false
    const fetchOffers = async () => {
      try {
        const data = await cachedFetch('/api/products?isOffer=true&limit=20') as { products?: ProductData[] }
        const products: ProductData[] = data.products || []
        if (!cancelled) {
          const tickerItems = products
            .filter((p) => p.comparePrice && p.comparePrice > 0 && p.comparePrice > p.price)
            .map((p) => {
              const discount = Math.round(
                ((p.comparePrice! - p.price) / p.comparePrice!) * 100
              )
              const savedAmount = p.comparePrice! - p.price
              return { product: p, discount, savedAmount }
            })
            .filter((t) => t.discount >= 5)
            .slice(0, 15)
          setItems(tickerItems)
        }
      } catch {
        // Silent fail
      }
    }
    fetchOffers()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (items.length > 0) {
      const timer = setTimeout(() => setIsVisible(true), 300)
      return () => clearTimeout(timer)
    }
  }, [items.length])

  const totalSavings = useMemo(
    () => items.reduce((sum, i) => sum + i.savedAmount, 0),
    [items]
  )
  const maxDiscount = useMemo(
    () => items.length > 0 ? Math.max(...items.map((i) => i.discount)) : 0,
    [items]
  )

  const handleQuickAdd = useCallback(
    (item: TickerItem) => {
      setQuickAdding(item.product.id)
      addToCart(item.product, item.product.storeName || 'Loja', 1)
      toast.success(`${item.product.name} adicionado ao carrinho!`)
      setTimeout(() => setQuickAdding(null), 1200)
    },
    [addToCart]
  )

  if (items.length === 0) return null

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Duplicate items for seamless marquee loop
  const duplicatedItems = [...items, ...items]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Gradient red-to-orange background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 opacity-95" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.04)_25%,rgba(255,255,255,0.04)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.04)_75%)] bg-[length:20px_20px]" />

          {/* Shimmer sweep animation */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 z-[5] pointer-events-none"
              animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                backgroundImage:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
                backgroundSize: '50% 100%',
              }}
            />
          )}

          {/* Floating arrow particles */}
          <FloatingArrowParticles />

          <div className="relative z-[6]">
            {/* Header row */}
            <div className="flex items-center justify-between px-3 sm:px-4 pt-2 pb-1">
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={
                    !prefersReducedMotion
                      ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }
                      : {}
                  }
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <TrendingDown className="h-3.5 w-3.5 text-yellow-300" />
                </motion.div>
                <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide uppercase">
                  Queda de Preço
                </span>
                <Badge className="h-5 px-1.5 text-[9px] font-bold bg-yellow-400 text-yellow-900 border-0">
                  <Flame className="h-2.5 w-2.5 mr-0.5" />
                  Até {maxDiscount}% OFF
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-yellow-300" />
                <span className="text-[10px] text-white/80 font-medium">
                  {items.length} ofertas
                </span>
              </div>
            </div>

            {/* Marquee auto-scrolling ticker strip */}
            <div className="relative overflow-hidden group/ticker r62-scroll-snap">
              {/* Left/right fade overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-red-600 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-orange-500 to-transparent z-10 pointer-events-none" />

              {/* Animated marquee container */}
              <motion.div
                className="flex gap-2.5 px-3 sm:px-4 pb-2.5"
                animate={
                  !prefersReducedMotion && !isHovered
                    ? { x: ['0%', '-50%'] }
                    : { x: undefined }
                }
                transition={
                  !prefersReducedMotion && !isHovered
                    ? {
                        x: {
                          duration: items.length * 6,
                          repeat: Infinity,
                          ease: 'linear',
                          repeatType: 'loop',
                        },
                      }
                    : {}
                }
              >
                {duplicatedItems.map((item, idx) => (
                  <motion.div
                    key={`${item.product.id}-${idx}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03, duration: 0.25 }}
                    className="shrink-0 flex items-center gap-2 bg-white/15 backdrop-blur-sm hover:bg-white/25 rounded-xl px-3 py-2 border border-white/10 cursor-pointer transition-colors min-w-0 group/item"
                    onClick={() => {
                      const store = useAppStore.getState()
                      store.selectProduct(item.product)
                      store.navigate('product')
                    }}
                  >
                    {/* Product emoji icon */}
                    <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <span className="text-lg">
                        {categoryEmojis[item.product.category] || '📦'}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <p className="text-[11px] font-semibold text-white line-clamp-1 leading-tight">
                        {item.product.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-bold text-yellow-300">
                          {formatBRL(item.product.price)}
                        </span>
                        <span className="text-[10px] text-white/60 line-through">
                          {formatBRL(item.product.comparePrice!)}
                        </span>
                      </div>
                    </div>

                    {/* Discount badge */}
                    <Badge className="shrink-0 h-6 px-1.5 text-[10px] font-extrabold bg-red-500 text-white border-0 rounded-md shadow-sm r62-badge-glow">
                      -{item.discount}%
                    </Badge>

                    {/* "Preço caiu!" pulse badge */}
                    <motion.div
                      animate={
                        !prefersReducedMotion
                          ? { scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }
                          : {}
                      }
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Badge className="shrink-0 h-5 px-1 text-[8px] font-extrabold bg-red-700 text-white border-0 rounded-full animate-pulse r62-badge-glow">
                        Preço caiu!
                      </Badge>
                    </motion.div>

                    {/* Quick-add button */}
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuickAdd(item)
                      }}
                    >
                      <button
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                          quickAdding === item.product.id
                            ? 'bg-emerald-400 text-white'
                            : 'bg-white/20 hover:bg-white/35 text-white'
                        }`}
                        aria-label="Adicionar ao carrinho"
                      >
                        <motion.div
                          animate={
                            quickAdding === item.product.id
                              ? { scale: [1, 1.4, 1], rotate: [0, 360] }
                              : {}
                          }
                          transition={{ duration: 0.5 }}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                        </motion.div>
                      </button>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Estimated savings footer */}
            <div className="px-3 sm:px-4 pb-2">
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="flex items-center justify-center gap-1.5 text-[11px] text-white/90 font-medium"
              >
                <Sparkles className="h-3 w-3 text-yellow-300" />
                <span>
                  Você pode economizar até{' '}
                  <motion.span
                    key={totalSavings}
                    initial={{ scale: 1.3, color: '#fde047' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    transition={{ duration: 0.6, type: 'spring' as const, stiffness: 300, damping: 20 }}
                    className="font-extrabold text-yellow-300"
                  >
                    {formatBRL(totalSavings)}
                  </motion.span>{' '}
                  hoje!
                </span>
                <Sparkles className="h-3 w-3 text-yellow-300" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
