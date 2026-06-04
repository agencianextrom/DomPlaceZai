'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, ChevronLeft, ChevronRight, Tag, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────
interface BundleItem {
  emoji: string
  name: string
}

interface Bundle {
  id: string
  name: string
  emoji: string
  items: BundleItem[]
  totalPrice: number
  bundlePrice: number
  savings: number
  gradient: string
  bgGradient: string
}

// ─── Mock Bundles ──────────────────────────────────────────────────────────
const bundles: Bundle[] = [
  {
    id: 'b1',
    name: 'Café Completo',
    emoji: '☕',
    items: [
      { emoji: '☕', name: 'Café 500g' },
      { emoji: '🥛', name: 'Leite 1L' },
      { emoji: '🍞', name: 'Pão Francês (6un)' },
    ],
    totalPrice: 34.70,
    bundlePrice: 24.90,
    savings: 9.80,
    gradient: 'from-amber-400 to-orange-500',
    bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
  },
  {
    id: 'b2',
    name: 'Lanche da Tarde',
    emoji: '🧁',
    items: [
      { emoji: '🥐', name: 'Pão de Queijo (10un)' },
      { emoji: '☕', name: 'Cappuccino' },
      { emoji: '🧁', name: 'Bolo de Fubá' },
      { emoji: '🥤', name: 'Suco Natural 500ml' },
    ],
    totalPrice: 32.50,
    bundlePrice: 19.90,
    savings: 12.60,
    gradient: 'from-rose-400 to-pink-500',
    bgGradient: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20',
  },
  {
    id: 'b3',
    name: 'Kit Churrasco',
    emoji: '🔥',
    items: [
      { emoji: '🥩', name: 'Picanha 800g' },
      { emoji: '🧂', name: 'Carvão 3kg' },
      { emoji: '🍋', name: 'Limão (6un)' },
      { emoji: '🥗', name: 'Farofa 200g' },
      { emoji: '🥤', name: 'Refrigerante 2L' },
    ],
    totalPrice: 78.40,
    bundlePrice: 49.90,
    savings: 28.50,
    gradient: 'from-red-400 to-rose-500',
    bgGradient: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
  },
  {
    id: 'b4',
    name: 'Cesta Básica',
    emoji: '🛒',
    items: [
      { emoji: '🍚', name: 'Arroz 5kg' },
      { emoji: '🫘', name: 'Feijão 1kg' },
      { emoji: '🛢️', name: 'Óleo de Soja 900ml' },
      { emoji: '🍝', name: 'Macarrão 500g' },
      { emoji: '🧂', name: 'Sal 1kg' },
      { emoji: '🍬', name: 'Açúcar 1kg' },
    ],
    totalPrice: 61.80,
    bundlePrice: 39.90,
    savings: 21.90,
    gradient: 'from-emerald-400 to-green-500',
    bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
  },
]

// ─── Component ─────────────────────────────────────────────────────────────
export function ProductBundlesSlider() {
  const { addToCart } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const maxIndex = bundles.length - 1

  const goTo = useCallback((index: number) => {
    setCurrentIndex((i) => {
      const next = Math.max(0, Math.min(maxIndex, index))
      if (scrollRef.current) {
        const cardWidth = scrollRef.current.clientWidth * 0.85
        scrollRef.current.scrollTo({ left: next * cardWidth, behavior: 'smooth' })
      }
      return next
    })
  }, [maxIndex])

  const goNext = useCallback(() => goTo(currentIndex + 1 > maxIndex ? 0 : currentIndex + 1), [currentIndex, maxIndex, goTo])
  const goPrev = useCallback(() => goTo(currentIndex - 1 < 0 ? maxIndex : currentIndex - 1), [currentIndex, maxIndex, goTo])

  // Auto-rotate
  useEffect(() => {
    autoRotateRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1 > maxIndex ? 0 : prev + 1))
    }, 6000)
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current)
    }
  }, [maxIndex])

  // Sync scroll with index
  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth * 0.85
      scrollRef.current.scrollTo({ left: currentIndex * cardWidth, behavior: 'smooth' })
    }
  }, [currentIndex])

  const totalSavings = useMemo(() => bundles.reduce((sum, b) => sum + b.savings, 0), [])

  const handleAddBundle = useCallback((bundle: Bundle) => {
    bundle.items.forEach((item) => {
      const fakeProduct: ProductData = {
        id: `bundle-${bundle.id}-${item.name}`,
        storeId: 's1',
        storeName: 'DomPlace Combos',
        name: item.name,
        slug: item.name.toLowerCase().replace(/\s+/g, '-'),
        description: null,
        price: bundle.bundlePrice / bundle.items.length,
        comparePrice: null,
        images: '[]',
        stock: 99,
        rating: 0,
        totalReviews: 0,
        isFeatured: false,
        isNew: false,
        isOffer: true,
        tags: '[]',
        variations: null,
        category: 'FOOD',
      }
      addToCart(fakeProduct, 'DomPlace Combos', 1)
    })
    setAddedBundleId(bundle.id)
    toast.success(`${bundle.emoji} ${bundle.name} adicionado ao carrinho!`, {
      description: `Economize ${formatBRL(bundle.savings)} neste combo`,
    })
    setTimeout(() => setAddedBundleId(null), 2500)
  }, [addToCart])

  return (
    <section className="r33-bundles-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Combos Imperdíveis
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monte sua compra e economize muito
          </p>
        </div>
        <Badge className="text-xs px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30 font-bold">
          <Tag className="h-3 w-3 mr-0.5" />
          Até 37% OFF
        </Badge>
      </div>

      {/* Savings counter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/15 dark:to-teal-900/15 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-800/30 r33-savings-bar">
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Você economiza até
            <motion.span
              key={totalSavings}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              className="text-base font-bold text-emerald-800 dark:text-emerald-300"
            >
              R$ {totalSavings.toFixed(2).replace('.', ',')}
            </motion.span>
            nos nossos combos
          </p>
        </div>
      </motion.div>

      {/* Carousel */}
      <div className="relative">
        {/* Prev arrow */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center r33-nav-arrow r33-nav-left"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>

        {/* Next arrow */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center r33-nav-arrow r33-nav-right"
          aria-label="Próximo"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-10 r33-carousel-track"
        >
          {bundles.map((bundle, idx) => {
            const isCurrent = idx === currentIndex
            const isAdded = addedBundleId === bundle.id
            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: isCurrent ? 1 : 0.94 }}
                transition={{ delay: idx * 0.1, type: 'spring' as const, stiffness: 260, damping: 22 }}
                className="snap-center shrink-0 w-[80%] sm:w-[55%] lg:w-[35%]"
              >
                <div className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden bg-gradient-to-br ${bundle.bgGradient} r33-bundle-card ${
                  isCurrent ? 'border-primary/40 shadow-lg' : 'border-border/50 shadow-sm'
                }`}>
                  {/* Top gradient */}
                  <div className={`h-2 w-full bg-gradient-to-r ${bundle.gradient}`} />

                  <div className="p-4">
                    {/* Bundle header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{bundle.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">{bundle.name}</h3>
                        <p className="text-[10px] text-muted-foreground">{bundle.items.length} itens inclusos</p>
                      </div>
                      {/* Savings badge */}
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                      >
                        -{Math.round((bundle.savings / bundle.totalPrice) * 100)}%
                      </motion.div>
                    </div>

                    {/* Items list */}
                    <div className="space-y-1.5 mb-4">
                      {bundle.items.map((item, itemIdx) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 + itemIdx * 0.05 }}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="text-base">{item.emoji}</span>
                          <span className="flex-1 truncate text-muted-foreground">{item.name}</span>
                          {isAdded && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring' as const }}
                            >
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-bold text-primary">
                        R$ {bundle.bundlePrice.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        R$ {bundle.totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Savings text */}
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mb-3 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Economize R$ {bundle.savings.toFixed(2).replace('.', ',')}
                    </p>

                    {/* CTA */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isAdded ? 'added' : 'add'}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        {isAdded ? (
                          <Button
                            size="sm"
                            className="w-full h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5"
                          >
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' as const }}>
                              <Check className="h-3.5 w-3.5" />
                            </motion.div>
                            Combo Adicionado!
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddBundle(bundle)}
                            className={`w-full h-9 text-xs text-white rounded-xl gap-1.5 bg-gradient-to-r ${bundle.gradient} r33-btn-shine`}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Adicionar Combo
                          </Button>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Shine overlay on current card */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none r33-card-shine"
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {bundles.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-2 rounded-full transition-all duration-300 r33-dot-indicator ${
                idx === currentIndex
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              whileTap={{ scale: 0.85 }}
              aria-label={`Ir para combo ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Helper for BRL formatting
function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
