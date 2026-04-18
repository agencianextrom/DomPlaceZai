'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Flame, Clock, TrendingDown, ShoppingCart, ChevronLeft, ChevronRight, Zap, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const flashSaleProducts: (ProductData & { soldPercent: number; originalStock: number })[] = [
  { id: 'fs1', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Arroz Tio João 5kg', slug: 'arroz-tio-joao', description: 'Arroz tipo 1 premium.', price: 24.90, comparePrice: 29.90, images: '[]', stock: 12, rating: 4.5, totalReviews: 23, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["5kg","1kg"]', category: 'FOOD', soldPercent: 76, originalStock: 50 },
  { id: 'fs2', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí 500ml', slug: 'acai-500ml', description: 'Açaí cremoso.', price: 15.00, comparePrice: 18.00, images: '[]', stock: 8, rating: 4.9, totalReviews: 89, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["300ml","500ml"]', category: 'FOOD', soldPercent: 92, originalStock: 100 },
  { id: 'fs3', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: null, name: 'Vitamina C 500mg', slug: 'vitamina-c', description: 'Suplemento de vitamina C.', price: 35.00, comparePrice: 42.00, images: '[]', stock: 15, rating: 4.7, totalReviews: 34, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'HEALTH', soldPercent: 85, originalStock: 100 },
  { id: 'fs4', storeId: 's3', storeName: 'Agropecuária SP', storeLogo: null, name: 'Adubo NPK 20kg', slug: 'adubo-npk', description: 'Adubo NPK.', price: 89.90, comparePrice: 109.90, images: '[]', stock: 5, rating: 4.4, totalReviews: 12, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'AGRICULTURE', soldPercent: 80, originalStock: 25 },
  { id: 'fs5', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: null, name: 'Bolo de Chocolate', slug: 'bolo-chocolate', description: 'Bolo caseiro de chocolate.', price: 22.00, comparePrice: 32.00, images: '[]', stock: 3, rating: 4.8, totalReviews: 67, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD', soldPercent: 88, originalStock: 25 },
  { id: 'fs6', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Óleo de Soja 900ml', slug: 'oleo-soja', description: 'Óleo de soja puro.', price: 7.49, comparePrice: 8.99, images: '[]', stock: 20, rating: 4.1, totalReviews: 8, isFeatured: false, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD', soldPercent: 50, originalStock: 40 },
]

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

export function FlashSale() {
  const { addToCart, selectProduct, navigate } = useAppStore()
  const countdown = useFlashCountdown()
  const [scrollPos, setScrollPos] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const pad = (n: number) => String(n).padStart(2, '0')
  const { hours, minutes, seconds } = countdown

  // Auto-refresh animation when timer reaches zero
  useEffect(() => {
    if (hours === 0 && minutes === 0 && seconds === 0) {
      const startTimer = setTimeout(() => setRefreshing(true), 0)
      const endTimer = setTimeout(() => setRefreshing(false), 2000)
      return () => { clearTimeout(startTimer); clearTimeout(endTimer) }
    }
  }, [hours, minutes, seconds])

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
    return [...flashSaleProducts].sort((a, b) => b.soldPercent - a.soldPercent)
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative"
    >
      <div className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-900/10 dark:via-orange-900/10 dark:to-amber-900/10 rounded-2xl border border-red-200/50 dark:border-red-800/30 overflow-hidden">
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

          {/* Countdown Timer */}
          <div className="flex items-center gap-1 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-red-200/50 dark:border-red-800/30 shadow-sm">
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
                    className="inline-flex items-center justify-center min-w-[26px] h-7 rounded-md bg-gradient-to-b from-red-500 to-red-600 text-white text-sm font-bold tabular-nums shadow-sm"
                  >
                    {unit.value}
                  </motion.span>
                  <span className="text-[9px] font-medium text-muted-foreground ml-0.5 mr-0.5">{unit.label}</span>
                  {idx < 2 && <span className="text-red-400 font-bold mx-0.5">:</span>}
                </span>
              ))}
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
                <div id="flash-sale-scroll" className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-4">
                  {sortedProducts.map((product, index) => {
                    const discount = product.comparePrice
                      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                      : 0
                    const isLowStock = product.soldPercent >= 85
                    const gradient = gradients[index % gradients.length]

                    return (
                      <motion.div
                        key={product.id}
                        className="shrink-0 w-[155px] sm:w-[175px]"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-all border-red-200/30 dark:border-red-800/20 h-full cursor-pointer group">
                          <CardContent className="p-0 h-full flex flex-col">
                            {/* Image */}
                            <div className={`relative aspect-square flex items-center justify-center bg-gradient-to-br ${gradient}`}>
                              <motion.div
                                className="h-14 w-14 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"
                                animate={isLowStock ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <span className="text-3xl">{categoryIcons[product.category] || '📦'}</span>
                              </motion.div>

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
                                    className="flex items-center gap-0.5 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm"
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
                                    <span className="text-[10px] text-muted-foreground line-through">
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
                                    className="w-full h-7 text-[10px] bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 gap-1"
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll buttons */}
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
        </div>

        {/* Bottom fire decoration */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
      </div>
    </motion.section>
  )
}
