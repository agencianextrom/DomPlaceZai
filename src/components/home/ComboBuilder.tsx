'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Zap, TrendingDown, Sparkles } from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { formatBRL } from '@/lib/format'
import { useAppStore } from '@/store/useAppStore'
import type { ProductData } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ── Combo type definitions ── */
interface ComboItem {
  product: ProductData
  emoji: string
}

interface Combo {
  id: string
  name: string
  emoji: string
  description: string
  discountPercent: number
  gradient: string
  accentColor: string
  categories: string[]
  productIds: string[]
  items: ComboItem[]
  originalTotal: number
  comboPrice: number
  savings: number
}

/* ── Category emoji map ── */
const categoryEmojis: Record<string, string> = {
  FOOD: '🍽️',
  HEALTH: '💊',
  AGRICULTURE: '🌱',
  ELECTRONICS: '📱',
  ANIMALS: '🐾',
  BEAUTY: '💅',
  FASHION: '👕',
  SERVICES: '🔧',
  HOME_GARDEN: '🏡',
  SPORTS: '🏋️',
  EDUCATION: '📖',
}

/* ── Shimmer + glow CSS for discount badges and progress bar ── */
const SHIMMER_STYLE = `
@keyframes combo-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.combo-shimmer-badge {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 25%, #fecaca 50%, #f87171 75%, #ef4444 100%);
  background-size: 200% 100%;
  animation: combo-shimmer 2s ease-in-out infinite;
}
@keyframes combo-progress-fill {
  from { width: 0%; }
  to { width: var(--target-width); }
}
@keyframes combo-btn-glow-sweep {
  0% { left: -100%; }
  100% { left: 200%; }
}
.combo-btn-glow {
  position: relative;
  overflow: hidden;
}
.combo-btn-glow::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 60%, transparent 100%);
  transform: skewX(-20deg);
  pointer-events: none;
  z-index: 1;
}
.combo-btn-glow:hover::after {
  animation: combo-btn-glow-sweep 0.7s ease-out;
}
@keyframes combo-card-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.combo-card-bg-anim {
  background-size: 200% 200%;
  animation: combo-card-gradient 6s ease-in-out infinite;
}
@keyframes combo-progress-shimmer {
  0% { left: -100%; }
  100% { left: 200%; }
}
.combo-progress-shimmer {
  position: relative;
  overflow: hidden;
}
.combo-progress-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
  animation: combo-progress-shimmer 1.5s ease-in-out infinite;
}
@keyframes combo-count-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
.combo-count-badge-pulse {
  animation: combo-count-pulse 1.5s ease-in-out infinite;
}
`

/* ── Animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
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

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 15,
    },
  },
}

const progressVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 18,
      delay: 0.3,
    },
  },
}

const comboCardEntrance = {
  hidden: { opacity: 0, y: 40, rotateX: 8, scale: 0.88 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      delay: i * 0.15,
      type: 'spring' as const,
      stiffness: 240,
      damping: 22,
    },
  }),
}

const discountPulse = {
  animate: {
    scale: [1, 1.06, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const countBadgePulse = {
  animate: {
    scale: [1, 1.15, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.3 },
  },
}

/* ── Combo template definitions ── */
interface ComboTemplate {
  id: string
  name: string
  emoji: string
  description: string
  discountPercent: number
  gradient: string
  accentColor: string
  categories: string[]
  minProducts: number
  selectByCategory?: boolean
  categoryEmoji?: string
}

const COMBO_TEMPLATES: ComboTemplate[] = [
  {
    id: 'cafe-manha',
    name: 'Café da Manhã',
    emoji: '☕',
    description: 'Comece o dia com tudo que precisa!',
    discountPercent: 25,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    accentColor: 'amber',
    categories: ['FOOD'],
    minProducts: 3,
    categoryEmoji: '🍞',
  },
  {
    id: 'kit-limpeza',
    name: 'Kit Limpeza',
    emoji: '🧹',
    description: 'Tudo limpo por menos!',
    discountPercent: 20,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    accentColor: 'emerald',
    categories: ['FOOD', 'HOME_GARDEN'],
    minProducts: 3,
    categoryEmoji: '🧼',
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    emoji: '🐾',
    description: 'Seu pet merece o melhor',
    discountPercent: 22,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    accentColor: 'violet',
    categories: ['ANIMALS'],
    minProducts: 3,
    categoryEmoji: '🐕',
  },
  {
    id: 'saude-bem-estar',
    name: 'Saúde & Bem-Estar',
    emoji: '💚',
    description: 'Cuide da sua saúde',
    discountPercent: 28,
    gradient: 'from-lime-500 via-green-500 to-emerald-600',
    accentColor: 'lime',
    categories: ['HEALTH'],
    minProducts: 3,
    categoryEmoji: '💊',
  },
]

/* ── Helper: build combos from available products ── */
function buildCombos(products: ProductData[]): Combo[] {
  const grouped = new Map<string, ProductData[]>()
  for (const p of products) {
    const cat = p.category || 'OTHER'
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(p)
  }

  return COMBO_TEMPLATES.map((tmpl) => {
    // Find matching products across categories
    const pool: ProductData[] = []
    for (const cat of tmpl.categories) {
      const catProducts = grouped.get(cat) || []
      pool.push(...catProducts)
    }

    // Select up to 3 products for the combo
    const selected = pool
      .sort((a, b) => b.rating - a.rating)
      .slice(0, tmpl.minProducts)

    const items: ComboItem[] = selected.map((p) => ({
      product: p,
      emoji: categoryEmojis[p.category] || '📦',
    }))

    // Fill missing slots with generic items
    while (items.length < tmpl.minProducts) {
      items.push({
        product: {
          id: `mock-${tmpl.id}-${items.length}`,
          storeId: '',
          name: ['Pão Fresco', 'Sabão Líquido', 'Ração Premium', 'Vitamina C'][items.length] || 'Produto',
          slug: '',
          description: null,
          price: 15.9 + items.length * 5,
          comparePrice: 19.9 + items.length * 5,
          images: '[]',
          stock: 50,
          rating: 4.5,
          totalReviews: 20,
          isFeatured: false,
          isNew: false,
          isOffer: true,
          tags: '[]',
          variations: null,
          category: tmpl.categories[0],
        },
        emoji: tmpl.categoryEmoji || '📦',
      })
    }

    const originalTotal = items.reduce((s, i) => s + i.product.price, 0)
    const comboPrice = Math.round(originalTotal * (1 - tmpl.discountPercent / 100) * 100) / 100
    const savings = Math.round((originalTotal - comboPrice) * 100) / 100

    return {
      id: tmpl.id,
      name: tmpl.name,
      emoji: tmpl.emoji,
      description: tmpl.description,
      discountPercent: tmpl.discountPercent,
      gradient: tmpl.gradient,
      accentColor: tmpl.accentColor,
      categories: tmpl.categories,
      productIds: items.map((i) => i.product.id),
      items,
      originalTotal,
      comboPrice,
      savings,
    }
  }).filter((c) => c.items.length >= 2)
}

export function ComboBuilder() {
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasedCombos, setPurchasedCombos] = useState<Set<string>>(new Set())
  const addToCart = useAppStore((s) => s.addToCart)

  useEffect(() => {
    let cancelled = false
    cachedFetch('/api/products?limit=50')
      .then((data) => {
        if (cancelled) return
        setProducts(data?.products ?? [])
      })
      .catch(() => { /* silent fail */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const combos = useMemo(() => (products.length > 0 ? buildCombos(products) : buildCombos([])), [products])

  const totalCombos = combos.length
  const purchasedCount = purchasedCombos.size

  const handleBuyCombo = (combo: Combo) => {
    for (const item of combo.items) {
      if (!item.product.id.startsWith('mock-')) {
        addToCart(item.product, item.product.storeName || 'Loja', 1)
      }
    }
    setPurchasedCombos((prev) => new Set(prev).add(combo.id))
  }

  if (!loading && combos.length === 0) return null

  return (
    <style dangerouslySetInnerHTML={{ __html: SHIMMER_STYLE }}>
      <section className="w-full">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              <Zap className="h-5 w-5 text-amber-500" />
            </motion.div>
            <span>Combos Especiais</span>
            <motion.div
              animate={countBadgePulse.animate}
              className="combo-count-badge-pulse"
            >
              <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">
                Economize até 30%
              </Badge>
            </motion.div>
          </h2>
        </div>

        {/* ── Purchased combos progress ── */}
        {purchasedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-muted/50 rounded-xl p-3 border border-border/50"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Combos comprados hoje
              </span>
              <span className="text-xs font-bold text-primary">
                {purchasedCount}/{totalCombos}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden combo-progress-shimmer">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                variants={progressVariants}
                initial="hidden"
                animate="visible"
                style={{ width: `${(purchasedCount / totalCombos) * 100}%`, transformOrigin: 'left' }}
              />
            </div>
            {purchasedCount === totalCombos && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[10px] font-semibold text-emerald-600 mt-1.5 flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                Todos os combos desbloqueados! 🎉
              </motion.p>
            )}
          </motion.div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-2xl h-52" />
            ))}
          </div>
        )}

        {/* ── Combo cards ── */}
        {!loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {combos.map((combo, index) => {
              const isPurchased = purchasedCombos.has(combo.id)
              const gradientBorder = `bg-gradient-to-br ${combo.gradient}`

              return (
                <motion.div
                  key={combo.id}
                  variants={comboCardEntrance}
                  custom={index}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: '0 12px 40px -8px rgba(0,0,0,0.15), 0 4px 16px -4px rgba(0,0,0,0.08)',
                  }}
                  transition={{ type: 'spring' as const, stiffness: 320, damping: 24 }}
                  className="relative"
                >
                  <div className={`combo-card-bg-anim relative rounded-2xl overflow-hidden border border-border/50`}>
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${combo.gradient} opacity-[0.07]`} />

                    <div className="relative p-4">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <motion.span
                            className="text-3xl"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, delay: Math.random() * 0.5 }}
                          >
                            {combo.emoji}
                          </motion.span>
                          <div>
                            <h3 className="text-sm font-bold">{combo.name}</h3>
                            <p className="text-[11px] text-muted-foreground">{combo.description}</p>
                          </div>
                        </div>

                        {/* Discount badge with shimmer + pulse */}
                        <motion.div variants={badgeVariants} className="relative">
                          <motion.span
                            className="combo-shimmer-badge text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"
                            animate={discountPulse.animate}
                          >
                            <TrendingDown className="h-3 w-3" />
                            -{combo.discountPercent}%
                          </motion.span>
                        </motion.div>
                      </div>

                      {/* Product items row */}
                      <div className="flex items-center gap-2 mb-3">
                        {combo.items.map((item, idx) => (
                          <motion.div
                            key={`${combo.id}-${idx}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 300, damping: 18 }}
                            className="flex-1 bg-card/80 backdrop-blur-sm rounded-xl p-2 text-center border border-border/30"
                          >
                            <span className="text-xl block mb-0.5">{item.emoji}</span>
                            <p className="text-[10px] font-medium line-clamp-2 leading-tight">{item.product.name}</p>
                            <p className="text-[10px] text-muted-foreground line-through mt-0.5">
                              {formatBRL(item.product.price)}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Price row + CTA */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-extrabold text-primary">
                            {formatBRL(combo.comboPrice)}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            {formatBRL(combo.originalTotal)}
                          </span>
                        </div>

                        <motion.div whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            onClick={() => handleBuyCombo(combo)}
                            disabled={isPurchased}
                            className={`h-9 text-xs font-semibold gap-1.5 rounded-full combo-btn-glow ${
                              isPurchased
                                ? 'bg-emerald-500 hover:bg-emerald-500 text-white'
                                : `bg-gradient-to-r ${combo.gradient} hover:opacity-90 text-white`
                            }`}
                          >
                            {isPurchased ? (
                              <>
                                <span className="text-sm">✓</span> Adicionado
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Comprar Combo
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>

                      {/* Savings highlight */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-2 flex items-center gap-1"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Economia de {formatBRL(combo.savings)}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </section>
    </style>
  )
}
