'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Sparkles, ShoppingCart, Package, ChevronDown } from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { resolveProductImage } from '@/lib/product-images'
import { formatBRL } from '@/lib/format'
import { fireConfettiFromElement } from '@/lib/confetti'
import type { ProductData } from '@/store/useAppStore'

/* ── Types ── */
interface Occasion {
  id: string
  label: string
  emoji: string
  description: string
  gradient: string
  keywords: string[]
}

interface BudgetRange {
  id: string
  label: string
  min: number
  max: number | null
}

/* ── Data ── */
const occasions: Occasion[] = [
  {
    id: 'aniversario',
    label: 'Aniversário',
    emoji: '🎂',
    description: 'Presentes especiais para quem você ama',
    gradient: 'from-rose-500 to-pink-500',
    keywords: ['bolo', 'doce', 'chocolate', 'presente', 'bolo-chocolate', 'acai', 'tigela'],
  },
  {
    id: 'aniversario-casamento',
    label: 'Aniversário de Casamento',
    emoji: '💑',
    description: 'Celebre o amor com presentes incríveis',
    gradient: 'from-red-500 to-rose-500',
    keywords: ['chocolate', 'cafe', 'presente', 'bolo', 'vinho'],
  },
  {
    id: 'agradecimento',
    label: 'Obrigado / Agradecimento',
    emoji: '🎁',
    description: 'Mostre sua gratidão com carinho',
    gradient: 'from-emerald-500 to-teal-500',
    keywords: ['cafe', 'bolo', 'doce', 'acai', 'tapioca', 'pao'],
  },
  {
    id: 'parabens',
    label: 'Parabéns',
    emoji: '🎉',
    description: 'Celebre conquistas e momentos felizes',
    gradient: 'from-amber-500 to-orange-500',
    keywords: ['cafe', 'chocolate', 'bolo', 'presente', 'premium', 'tigela', 'smoothie'],
  },
]

const budgetRanges: BudgetRange[] = [
  { id: 'under30', label: 'Até R$30', min: 0, max: 30 },
  { id: '30to60', label: 'R$30 - R$60', min: 30, max: 60 },
  { id: '60to100', label: 'R$60 - R$100', min: 60, max: 100 },
  { id: 'over100', label: 'Acima de R$100', min: 100, max: null },
]

/* ── Emoji fallback map ── */
const categoryEmojis: Record<string, string> = {
  FOOD: '🍽️', HEALTH: '💊', AGRICULTURE: '🌱', ELECTRONICS: '📱',
  ANIMALS: '🐾', BEAUTY: '✂️', FASHION: '👕', SERVICES: '🔧',
  HOME_GARDEN: '🏡', SPORTS: '🏋️',
}

/* ── Ribbon + sparkle + budget CSS ── */
const RIBBON_STYLE = `
@keyframes ribbon-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
.ribbon-badge-gift {
  animation: ribbon-pulse 2s ease-in-out infinite;
}
@keyframes sparkle-spin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}
.sparkle-icon {
  animation: sparkle-spin 3s ease-in-out infinite;
}
@keyframes gift-ideal-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(244,63,94,0.3); }
  50% { transform: scale(1.05); box-shadow: 0 2px 16px rgba(244,63,94,0.5), 0 0 12px rgba(244,63,94,0.2); }
}
.gift-ideal-pulse {
  animation: gift-ideal-pulse 2.5s ease-in-out infinite;
}
@keyframes budget-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.budget-pill-shimmer {
  background-size: 200% 100%;
  animation: budget-shimmer 3s linear infinite;
}
@keyframes occasion-pill-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(244,63,94,0.2), 0 0 16px rgba(244,63,94,0.1); }
  50% { box-shadow: 0 0 12px rgba(244,63,94,0.4), 0 0 24px rgba(244,63,94,0.2); }
}
.occasion-pill-glow {
  animation: occasion-pill-glow 2.5s ease-in-out infinite;
}
@keyframes gift-card-3d-hover {
  0% { transform: perspective(600px) rotateY(0deg); }
  50% { transform: perspective(600px) rotateY(3deg); }
  100% { transform: perspective(600px) rotateY(0deg); }
}
@keyframes sparkle-badge-float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  25% { transform: translateY(-3px) rotate(10deg) scale(1.1); }
  50% { transform: translateY(-1px) rotate(-5deg) scale(1.05); }
  75% { transform: translateY(-4px) rotate(8deg) scale(1.1); }
}
.sparkle-badge-anim {
  animation: sparkle-badge-float 2.5s ease-in-out infinite;
}
`

/* ── Animation variants ── */
const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const gridCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 280,
      damping: 22,
    },
  },
}

/* ── Main component ── */
export function GiftGuide() {
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>(occasions[0])
  const [selectedBudget, setSelectedBudget] = useState<BudgetRange | null>(null)
  const giftBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useEffect(() => {
    let cancelled = false
    cachedFetch<{ products?: ProductData[] }>('/api/products?limit=50&sort=popular')
      .then((data) => {
        if (cancelled) return
        const all = (data?.products ?? []) as ProductData[]
        setProducts(all)
      })
      .catch(() => { /* silent */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Filter products based on occasion keywords and budget
  const filteredProducts = products.filter((p) => {
    // Budget filter
    if (selectedBudget) {
      if (selectedBudget.max !== null && p.price > selectedBudget.max) return false
      if (p.price < selectedBudget.min) return false
    }

    // Occasion keyword match
    const nameLower = p.name.toLowerCase()
    const tagsLower = (p.tags || '').toLowerCase()
    const combined = `${nameLower} ${tagsLower}`
    return selectedOccasion.keywords.some((kw) => combined.includes(kw))
  }).slice(0, 8)

  const handleGiftClick = useCallback((productId: string, e: React.MouseEvent) => {
    const btn = giftBtnRefs.current.get(productId)
    if (btn) {
      fireConfettiFromElement(btn)
    }
  }, [])

  return (
    <style dangerouslySetInnerHTML={{ __html: RIBBON_STYLE }}>
      <section className="w-full bg-gradient-to-br from-rose-50/30 via-background to-amber-50/20 rounded-2xl p-4 sm:p-5 r61-gift-border">
        {/* ── Header ── */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <Gift className="h-5 w-5 text-rose-500" />
          </motion.div>
          <h2 className="text-lg sm:text-xl font-bold">Guia de Presentes</h2>
        </div>

        {/* ── Occasion selector pills ── */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-3 mb-3 snap-x snap-mandatory">
          {occasions.map((occasion) => {
            const isActive = selectedOccasion.id === occasion.id
            return (
              <motion.button
                key={occasion.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedOccasion(occasion)}
                className={`snap-start shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-all border r61-pill-shimmer ${
                  isActive
                    ? 'text-white border-transparent shadow-lg occasion-pill-glow r34-gift-guide-pill-border'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                }`}
                style={
                  isActive
                    ? { boxShadow: '0 4px 20px rgba(244, 63, 94, 0.3)' }
                    : undefined
                }
              >
                {isActive ? (
                  <motion.span
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${occasion.gradient}`}
                    layoutId="occasion-bg"
                    style={{ position: 'absolute', inset: 0, borderRadius: '9999px', zIndex: 0 }}
                  />
                ) : null}
                <span className="relative z-10" style={isActive ? { background: `linear-gradient(135deg, var(--color-rose-500), var(--color-pink-500))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : undefined}>
                  <span>{occasion.emoji}</span>
                  <span className="ml-1">{occasion.label}</span>
                </span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                    className="relative z-10"
                  >
                    <Sparkles className="h-3 w-3 text-white" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* ── Budget filter ── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">Faixa de preço</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedBudget(null)}
              className={`budget-pill-shimmer px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                !selectedBudget
                  ? 'bg-gradient-to-r from-primary via-primary/80 to-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30'
              }`}
            >
              Todos
            </button>
            {budgetRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setSelectedBudget(selectedBudget?.id === range.id ? null : range)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedBudget?.id === range.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Occasion description ── */}
        <motion.p
          key={selectedOccasion.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm text-muted-foreground mb-4 px-1"
        >
          {selectedOccasion.emoji} {selectedOccasion.description}
        </motion.p>

        {/* ── Loading state ── */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-xl aspect-square" />
            ))}
          </div>
        )}

        {/* ── Product grid ── */}
        {!loading && (
          <AnimatePresence mode="wait">
            {filteredProducts.length > 0 ? (
              <motion.div
                key={`${selectedOccasion.id}-${selectedBudget?.id || 'all'}`}
                variants={gridContainerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
              >
                {filteredProducts.map((product) => {
                  const imageUrl = resolveProductImage({
                    slug: product.slug,
                    category: product.category,
                    images: product.images,
                  })
                  const emoji = categoryEmojis[product.category] || '📦'

                  return (
                    <motion.div
                      key={product.id}
                      variants={gridCardVariants}
                      whileHover={{
                        scale: 1.04,
                        rotateY: 3,
                        boxShadow: '0 16px 48px -8px rgba(244, 63, 94, 0.2), 0 6px 20px -4px rgba(0,0,0,0.1)',
                      }}
                      transition={{ type: 'spring' as const, stiffness: 280, damping: 20 }}
                      className="gift-card-3d relative bg-card rounded-xl border border-border overflow-hidden group r34-gift-guide-tilt"
                      style={{ perspective: '600px' }}
                    >
                      {/* "Presente ideal" badge with sparkle */}
                      <motion.div
                        className="absolute top-2 left-2 z-20 ribbon-badge-gift gift-ideal-pulse bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md sparkle-badge-anim r34-gift-guide-badge-shimmer"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 500, damping: 15, delay: 0.3 }}
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        Presente ideal
                      </motion.div>

                      {/* Image area with wrapping effect */}
                      <div className="relative aspect-square bg-gradient-to-br from-rose-50 to-pink-50 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl">{emoji}</span>
                          </div>
                        )}

                        {/* Gift wrap overlay on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-rose-400/30" />
                          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-rose-400/30" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-2.5">
                        {product.storeName && (
                          <p className="text-[10px] font-medium text-primary truncate">
                            {product.storeName}
                          </p>
                        )}
                        <h3 className="text-xs font-semibold line-clamp-2 leading-tight mt-0.5">
                          {product.name}
                        </h3>
                        <div className="mt-1.5 flex items-baseline gap-1">
                          <span className="text-sm font-extrabold text-primary">
                            {formatBRL(product.price)}
                          </span>
                        </div>

                        {/* "Comprar como presente" button */}
                        <motion.button
                          ref={(el) => {
                            if (el) giftBtnRefs.current.set(product.id, el)
                          }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleGiftClick(product.id, e)}
                          className="mt-2 w-full h-8 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 hover:from-rose-600 hover:to-pink-600 transition-all"
                        >
                          <Gift className="h-3 w-3" />
                          Comprar como presente
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              /* ── Empty state ── */
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                  className="text-6xl mb-4"
                >
                  🎁
                </motion.div>
                <h3 className="text-sm font-bold text-muted-foreground mb-1">
                  Nenhum presente encontrado
                </h3>
                <p className="text-xs text-muted-foreground/70 max-w-[200px]">
                  Tente ajustar a faixa de preço ou escolher outra ocasião
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedBudget(null)
                    setSelectedOccasion(occasions[0])
                  }}
                  className="mt-3 px-4 py-1.5 rounded-full bg-muted text-xs font-medium hover:bg-muted/80 transition-colors"
                >
                  Limpar filtros
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>
    </style>
  )
}
