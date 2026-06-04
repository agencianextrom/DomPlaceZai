'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Link2,
  Plus,
  ShoppingCart,
  Check,
  ChevronDown,
  Info,
  Grid3X3,
  List,
  Sparkles,
  Tag,
  Loader2,
  Gift,
  TrendingUp,
} from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { formatBRL } from '@/lib/format'
import { resolveProductImage } from '@/lib/product-images'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CrossProduct {
  id: string
  storeId: string
  storeName: string
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

interface BundleVariant {
  key: string
  label: string
  itemCount: number
  discountPct: number
}

interface CategoryPairRule {
  from: string
  to: string
  label: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_PAIR_RULES: CategoryPairRule[] = [
  { from: 'FOOD', to: 'FOOD', label: 'Itens para sua cozinha' },
  { from: 'FOOD', to: 'BEVERAGES', label: 'Bebidas combinam com alimentos' },
  { from: 'FOOD', to: 'HEALTH', label: 'Comida saudável + suplementos' },
  { from: 'CLEANING', to: 'HOME_GARDEN', label: 'Produtos de limpeza + casa' },
  { from: 'CLEANING', to: 'BEAUTY', label: 'Higiene pessoal + beleza' },
  { from: 'ANIMALS', to: 'ANIMALS', label: 'Tudo para seu pet' },
  { from: 'ANIMALS', to: 'FOOD', label: 'Pet + mantimentos' },
  { from: 'HEALTH', to: 'BEAUTY', label: 'Saúde + beleza' },
  { from: 'HEALTH', to: 'FOOD', label: 'Suplementos + alimentação saudável' },
  { from: 'BEAUTY', to: 'HEALTH', label: 'Beleza + saúde' },
  { from: 'BEAUTY', to: 'FASHION', label: 'Beleza + moda' },
  { from: 'ELECTRONICS', to: 'ELECTRONICS', label: 'Acessórios para seu device' },
  { from: 'AGRICULTURE', to: 'HOME_GARDEN', label: 'Agro + jardim' },
  { from: 'AGRICULTURE', to: 'AGRICULTURE', label: 'Suprimentos agrícolas' },
  { from: 'HOME_GARDEN', to: 'CLEANING', label: 'Casa + limpeza' },
  { from: 'HOME_GARDEN', to: 'FOOD', label: 'Cozinha + produtos domésticos' },
  { from: 'FASHION', to: 'BEAUTY', label: 'Moda + beleza' },
  { from: 'FASHION', to: 'FASHION', label: 'Complete seu look' },
  { from: 'CONSTRUCTION', to: 'HOME_GARDEN', label: 'Reforma + casa' },
  { from: 'AUTOMOTIVE', to: 'ELECTRONICS', label: 'Carro + tech' },
]

const BUNDLE_VARIANTS: BundleVariant[] = [
  { key: 'basic', label: 'Kit Básico', itemCount: 2, discountPct: 5 },
  { key: 'complete', label: 'Kit Completo', itemCount: 3, discountPct: 10 },
  { key: 'premium', label: 'Kit Premium', itemCount: 4, discountPct: 15 },
]

/* ------------------------------------------------------------------ */
/*  Framer-motion variants                                             */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -12,
    transition: { duration: 0.2 },
  },
}

const connectorVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 15,
      delay: 0.3,
    },
  },
}

const priceAnimate = {
  scale: [1, 1.08, 1],
  transition: { duration: 0.4, ease: 'easeInOut' as const },
}

const shimmerKeyframes = {
  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getProductEmoji(category: string): string {
  if (category.includes('Alimentação') || category === 'FOOD' || category.includes('Food'))
    return '🍽️'
  if (category.includes('Saúde') || category === 'HEALTH' || category.includes('Health'))
    return '💊'
  if (category.includes('Beleza') || category === 'BEAUTY' || category.includes('Beauty'))
    return '💄'
  if (category.includes('Pet') || category === 'ANIMALS' || category.includes('Animal'))
    return '🐕'
  if (
    category.includes('Eletrônico') ||
    category === 'ELECTRONICS' ||
    category.includes('Electronic')
  )
    return '📱'
  if (
    category.includes('Agro') ||
    category === 'AGRICULTURE' ||
    category.includes('Agriculture')
  )
    return '🌾'
  if (
    category.includes('Limpeza') ||
    category === 'CLEANING' ||
    category.includes('Cleaning')
  )
    return '🧹'
  if (
    category.includes('Casa') ||
    category === 'HOME_GARDEN' ||
    category.includes('Home')
  )
    return '🏠'
  if (category.includes('Moda') || category === 'FASHION' || category.includes('Fashion'))
    return '👗'
  if (
    category.includes('Construção') ||
    category === 'CONSTRUCTION' ||
    category.includes('Construction')
  )
    return '🏗️'
  if (
    category.includes('Automotivo') ||
    category === 'AUTOMOTIVE' ||
    category.includes('Automotive')
  )
    return '🚗'
  return '📦'
}

function findPairLabel(fromCategory: string, toCategory: string): string | null {
  const rule = CATEGORY_PAIR_RULES.find(
    (r) =>
      (r.from === fromCategory && r.to === toCategory) ||
      (r.from === toCategory && r.to === fromCategory),
  )
  return rule ? rule.label : null
}

function getCategoryKeyword(category: string): string {
  const mapping: Record<string, string> = {
    FOOD: 'Alimentação',
    BEVERAGES: 'Bebida',
    HEALTH: 'Saúde',
    BEAUTY: 'Beleza',
    ANIMALS: 'Pet',
    ELECTRONICS: 'Eletrônico',
    AGRICULTURE: 'Agro',
    CLEANING: 'Limpeza',
    HOME_GARDEN: 'Casa',
    FASHION: 'Moda',
    CONSTRUCTION: 'Construção',
    AUTOMOTIVE: 'Automotivo',
    SERVICES: 'Serviço',
    SPORTS: 'Esporte',
    EDUCATION: 'Educação',
    OTHER: 'Outros',
  }
  return mapping[category] || category
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function CrossSellSkeleton() {
  return (
    <section className="w-full mt-8">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
        <div className="h-6 w-64 rounded-md bg-muted animate-pulse" />
        <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Bundle cards skeleton */}
      <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="shrink-0 w-[140px] sm:w-[160px]">
              <div className="h-24 rounded-xl bg-muted animate-pulse" />
              <div className="mt-2 space-y-1.5 px-1">
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                <div className="h-3.5 w-full rounded bg-muted animate-pulse" />
                <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              </div>
            </div>
            {i < 3 && (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Bundle total skeleton */}
      <div className="mt-4 p-4 rounded-xl bg-muted/30 animate-pulse h-16" />

      {/* Kit pills skeleton */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Animated Savings Counter                                           */
/* ------------------------------------------------------------------ */

function AnimatedSavings({ savings }: { savings: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = savings
    const duration = 600
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(eased * end)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [savings])

  return (
    <span className="font-bold tabular-nums">
      {formatBRL(displayValue)}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Shimmer Button                                                     */
/* ------------------------------------------------------------------ */

function ShimmerButton({
  onClick,
  loading,
  children,
  className,
}: {
  onClick: () => void
  loading: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Shimmer sweep overlay */}
      {loading && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </span>
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/*  Tooltip                                                            */
/* ------------------------------------------------------------------ */

function PairTooltip({ text }: { text: string | null }) {
  const [open, setOpen] = useState(false)

  if (!text) return null

  return (
    <div className="relative inline-flex">
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
        aria-label="Por que recomendamos?"
      >
        <Info className="h-3 w-3" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 px-3 py-2 rounded-lg bg-popover text-popover-foreground text-xs shadow-lg border border-border z-50"
          >
            <p className="font-semibold mb-1 text-emerald-600 dark:text-emerald-400">
              Por que recomendamos?
            </p>
            <p className="text-muted-foreground leading-relaxed">{text}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-r border-b border-border rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function CrossSellEngine() {
  const { addToCart } = useAppStore()

  /* ---------- State ---------- */
  const [products, setProducts] = useState<CrossProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [activeVariant, setActiveVariant] = useState<string>('complete')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [buyingBundle, setBuyingBundle] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [pairLabel, setPairLabel] = useState<string | null>(null)

  /* ---------- Fetch products ---------- */
  useEffect(() => {
    async function fetchCrossProducts() {
      try {
        const data = await cachedFetch('/api/products?limit=200')
        const allProducts: CrossProduct[] = data.products || []

        if (allProducts.length === 0) {
          setLoading(false)
          return
        }

        // Pick a "seed" product — the first product with a well-known category
        const seedProduct = allProducts.find((p) => p.category && p.category.length > 0) || allProducts[0]
        const seedCategory = seedProduct.category

        // Build category keyword mapping for fuzzy matching
        const catKeyword = getCategoryKeyword(seedCategory)

        // Find complementary products
        const complementary = allProducts
          .filter((p) => p.id !== seedProduct.id)
          .map((p) => {
            let score = 0
            // Same store bonus
            if (p.storeId === seedProduct.storeId) score += 3
            // Complementary category bonus
            const label = findPairLabel(seedCategory, p.category)
            if (label) score += 5
            // Fuzzy category match (subcategory overlap)
            else if (
              p.category.toLowerCase().includes(catKeyword.toLowerCase()) ||
              catKeyword.toLowerCase().includes(p.category.toLowerCase())
            ) {
              score += 3
            }
            // Same category fallback
            else if (p.category === seedCategory) {
              score += 2
            }
            // High rating bonus
            if (p.rating >= 4.5) score += 2
            if (p.rating >= 4.0) score += 1

            return { product: p, score, pairLabel: label }
          })
          .sort((a, b) => b.score - a.score)

        // Set pair label from top match
        if (complementary.length > 0 && complementary[0].pairLabel) {
          setPairLabel(complementary[0].pairLabel)
        }

        // Pick top products + seed
        const selected = complementary.slice(0, 3).map((c) => c.product)
        const bundleProducts = [seedProduct, ...selected].slice(0, 4)

        setProducts(bundleProducts)
        // Default check all
        setCheckedIds(new Set(bundleProducts.map((p) => p.id)))
      } catch {
        // Silent fail — return empty
      } finally {
        setLoading(false)
      }
    }
    fetchCrossProducts()
  }, [])

  /* ---------- Current variant config ---------- */
  const currentVariant = useMemo(
    () => BUNDLE_VARIANTS.find((v) => v.key === activeVariant) || BUNDLE_VARIANTS[1],
    [activeVariant],
  )

  /* ---------- Active bundle products (respects variant count) ---------- */
  const bundleProducts = useMemo(() => {
    return products.slice(0, currentVariant.itemCount)
  }, [products, currentVariant])

  /* ---------- Update checked IDs when variant changes ---------- */
  useEffect(() => {
    const newChecked = new Set(checkedIds)
    bundleProducts.forEach((p) => newChecked.add(p.id))
    // Remove checked that are not in the bundle
    const bundleSet = new Set(bundleProducts.map((p) => p.id))
    for (const id of newChecked) {
      if (!bundleSet.has(id)) newChecked.delete(id)
    }
    setCheckedIds(newChecked)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVariant.key])

  /* ---------- Price calculations ---------- */
  const priceData = useMemo(() => {
    const checkedProducts = bundleProducts.filter((p) => checkedIds.has(p.id))
    const individualTotal = checkedProducts.reduce((sum, p) => sum + p.price, 0)
    const compareTotal = checkedProducts.reduce(
      (sum, p) => sum + (p.comparePrice || p.price),
      0,
    )
    const discountPct = currentVariant.discountPct
    const bundleTotal = individualTotal * (1 - discountPct / 100)
    const savings = compareTotal - bundleTotal
    return { individualTotal, bundleTotal, savings, discountPct, checkedProducts }
  }, [bundleProducts, checkedIds, currentVariant])

  /* ---------- Handlers ---------- */
  const toggleCheck = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBuyBundle = useCallback(async () => {
    if (priceData.checkedProducts.length === 0) return
    setBuyingBundle(true)

    // Simulate brief delay for UX
    await new Promise((r) => setTimeout(r, 600))

    priceData.checkedProducts.forEach((p) => {
      const productData: ProductData = {
        id: p.id,
        storeId: p.storeId,
        storeName: p.storeName,
        name: p.name,
        slug: p.slug,
        price: p.price,
        comparePrice: p.comparePrice,
        images: p.images,
        category: p.category,
        rating: p.rating,
        totalReviews: p.totalReviews,
        isNew: p.isNew,
        isOffer: p.isOffer,
        isFeatured: false,
        stock: 10,
        tags: '',
        variations: null,
        description: null,
      }
      addToCart(productData, p.storeName)
    })

    // Mark as added
    setAddedIds(new Set(priceData.checkedProducts.map((p) => p.id)))

    toast.success(
      `Kit ${currentVariant.label} adicionado ao carrinho! ${formatBRL(priceData.bundleTotal)}`,
      {
        description: `${priceData.checkedProducts.length} itens com ${priceData.discountPct}% de desconto`,
      },
    )
    setBuyingBundle(false)

    // Clear added state after 2s
    setTimeout(() => setAddedIds(new Set()), 2000)
  }, [priceData, addToCart, currentVariant])

  const handleAddSingle = useCallback(
    (e: React.MouseEvent, product: CrossProduct) => {
      e.stopPropagation()
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
        stock: 10,
        tags: '',
        variations: null,
        description: null,
      }
      addToCart(productData, product.storeName)
      setAddedIds((prev) => new Set([...prev, product.id]))
      toast.success(`${product.name} adicionado ao carrinho!`)

      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev)
          next.delete(product.id)
          return next
        })
      }, 2000)
    },
    [addToCart],
  )

  /* ---------- Render ---------- */
  if (loading) return <CrossSellSkeleton />
  if (products.length === 0) return null

  const isGrid = viewMode === 'grid'

  return (
    <section className="w-full mt-8">
      {/* ============================== */}
      {/* Header                         */}
      {/* ============================== */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-3">
          {/* Animated package icon */}
          <motion.div
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-400/10 dark:to-orange-400/10 flex items-center justify-center"
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </motion.div>

          {/* Shimmer title */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]">
                Frequentemente comprados juntos
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Montei o combo perfeito para você
            </p>
          </div>
        </div>

        {/* Chain link icon */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Link2 className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </div>

      {/* ============================== */}
      {/* View toggle + Pair tooltip     */}
      {/* ============================== */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <PairTooltip text={pairLabel} />
          {pairLabel && (
            <span className="text-xs text-muted-foreground">{pairLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('grid')}
            className={`h-7 w-7 rounded-md flex items-center justify-center transition-colors ${
              isGrid
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Visualização em grade"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('list')}
            className={`h-7 w-7 rounded-md flex items-center justify-center transition-colors ${
              !isGrid
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Visualização em lista"
          >
            <List className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>

      {/* ============================== */}
      {/* Bundle Variant Pills           */}
      {/* ============================== */}
      <div className="flex items-center gap-2 mb-4 px-1 overflow-x-auto hide-scrollbar">
        {BUNDLE_VARIANTS.map((variant) => {
          const isActive = variant.key === activeVariant
          return (
            <motion.button
              key={variant.key}
              onClick={() => setActiveVariant(variant.key)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`r35-kit-pill relative shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? 'r35-kit-pill-active bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {variant.label}
                <span className="text-[10px] font-bold opacity-80">-{variant.discountPct}%</span>
              </span>
              {/* Active indicator (layoutId) */}
              {isActive && (
                <motion.span
                  layoutId="r35-kit-pill-indicator"
                  className="absolute inset-0 rounded-full bg-primary"
                  style={{ zIndex: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 350, damping: 25 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* ============================== */}
      {/* Bundle Display                  */}
      {/* ============================== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${activeVariant}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={isGrid ? 'flex items-start gap-2 sm:gap-3 overflow-x-auto hide-scrollbar pb-2' : 'space-y-3'}
        >
          {bundleProducts.map((product, index) => {
            const isChecked = checkedIds.has(product.id)
            const isAdded = addedIds.has(product.id)
            const imageUrl = resolveProductImage({
              slug: product.slug,
              category: product.category,
              images: product.images,
            })
            const emoji = getProductEmoji(product.category)
            const hasDiscount =
              product.comparePrice && product.comparePrice > product.price
            const discountPct = hasDiscount
              ? Math.round(
                  ((product.comparePrice! - product.price) / product.comparePrice!) * 100,
                )
              : 0

            return (
              <div key={product.id} className="flex items-center">
                {/* Product Card */}
                <motion.div
                  variants={cardVariants}
                  className={`r35-bundle-card shrink-0 ${
                    isGrid ? 'w-[140px] sm:w-[160px]' : 'w-full'
                  } ${
                    isChecked ? 'r35-bundle-card-checked' : ''
                  } bg-card rounded-xl border overflow-hidden transition-colors ${
                    isChecked
                      ? 'border-primary/40 shadow-md'
                      : 'border-border opacity-60'
                  }`}
                  whileHover={{
                    y: -3,
                    boxShadow: isChecked
                      ? '0 8px 24px -4px rgba(0,0,0,0.12)'
                      : '0 4px 12px -2px rgba(0,0,0,0.08)',
                  }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 28 }}
                >
                  {/* Image / Emoji */}
                  <div
                    className={`relative ${
                      isGrid ? 'aspect-square' : 'h-20 sm:h-24'
                    } bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
                          isGrid ? 'group-hover:scale-110' : ''
                        }`}
                        loading="lazy"
                      />
                    ) : (
                      <motion.span
                        className="text-4xl sm:text-5xl select-none"
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {emoji}
                      </motion.span>
                    )}

                    {/* Checkbox */}
                    <motion.button
                      onClick={() => toggleCheck(product.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`absolute top-2 left-2 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background/80 border-gray-300 dark:border-gray-600'
                      }`}
                      aria-label={
                        isChecked
                          ? `Remover ${product.name} do kit`
                          : `Adicionar ${product.name} ao kit`
                      }
                    >
                      <AnimatePresence mode="wait">
                        {isChecked && (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* Discount badge on card */}
                    {discountPct > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        -{discountPct}%
                      </div>
                    )}
                  </div>

                  {/* Card info */}
                  <div className="p-2.5">
                    {/* Product name */}
                    <h3
                      className={`font-semibold leading-tight text-muted-foreground ${
                        isGrid ? 'text-xs line-clamp-2 min-h-[2rem]' : 'text-sm line-clamp-1'
                      } ${isChecked ? 'text-foreground' : ''}`}
                    >
                      {product.name}
                    </h3>

                    {/* Price row */}
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className={`font-bold text-primary ${isGrid ? 'text-sm' : 'text-base'}`}>
                        {formatBRL(product.price)}
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          {formatBRL(product.comparePrice)}
                        </span>
                      )}
                    </div>

                    {/* Individual add button */}
                    <motion.button
                      onClick={(e) => handleAddSingle(e, product)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`mt-2 w-full h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        isAdded
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-primary/10 text-primary hover:bg-primary/15'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3 w-3" />
                          Adicionado
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-3 w-3" />
                          Adicionar
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>

                {/* "+" Connector between cards (grid mode only) */}
                {isGrid && index < bundleProducts.length - 1 && (
                  <motion.div
                    variants={connectorVariants}
                    className="r35-connector-plus r35-connector-animated shrink-0 flex items-center justify-center h-24 mt-8 sm:mt-12"
                  >
                    <motion.div
                      className="h-9 w-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20"
                      animate={{
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.2,
                      }}
                    >
                      <Plus className="h-4 w-4 text-primary" />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {/* ============================== */}
      {/* Bundle Price Summary            */}
      {/* ============================== */}
      {priceData.checkedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="r35-bundle-glow mt-5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/[0.02] to-primary/5 dark:from-primary/10 dark:via-primary/[0.04] dark:to-primary/10 p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: breakdown */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>
                  {priceData.checkedProducts.length} item{priceData.checkedProducts.length > 1 ? 's' : ''} selecionado
                  {priceData.checkedProducts.length > 1 ? 's' : ''}
                </span>
                <span className="text-xs">({currentVariant.discountPct}% desconto no kit)</span>
              </div>

              {/* Price breakdown */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Individual:</span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatBRL(priceData.individualTotal)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.div
                    animate={priceAnimate}
                    className="r35-bundle-total text-lg sm:text-xl font-bold text-primary"
                  >
                    {formatBRL(priceData.bundleTotal)}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Right: savings badge + buy button */}
            <div className="flex flex-col items-start sm:items-end gap-2">
              {/* Savings badge */}
              {priceData.savings > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="r35-savings-badge flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20"
                >
                  <motion.span
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(16,185,129,0)',
                        '0 0 0 4px rgba(16,185,129,0.15)',
                        '0 0 0 8px rgba(16,185,129,0)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex items-center gap-1.5"
                  >
                    <Gift className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Economize{' '}
                      <AnimatedSavings savings={priceData.savings} />
                    </span>
                  </motion.span>
                </motion.div>
              )}

              {/* Buy bundle button */}
              <ShimmerButton
                onClick={handleBuyBundle}
                loading={buyingBundle}
                className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-shadow"
              >
                <ShoppingCart className="h-4 w-4" />
                <Sparkles className="h-4 w-4" />
                Comprar Kit Completo
              </ShimmerButton>
            </div>
          </div>

          {/* Savings progress bar */}
          <div className="mt-3 h-1 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${currentVariant.discountPct * 100 / 15}%` }}
              transition={{ type: 'spring' as const, stiffness: 100, damping: 15, delay: 0.2 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">Kit Básico (5%)</span>
            <span className="text-[10px] text-muted-foreground">Kit Premium (15%)</span>
          </div>
        </motion.div>
      )}

      {/* ============================== */}
      {/* Bundle items detail             */}
      {/* ============================== */}
      <AnimatePresence>
        {checkedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <motion.button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
              onClick={() => {
                const el = document.getElementById('r35-bundle-detail')
                el?.classList.toggle('hidden')
              }}
              whileHover={{ x: 2 }}
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Ver resumo do kit
            </motion.button>

            <div id="r35-bundle-detail" className="hidden mt-2 space-y-1.5 px-1">
              {bundleProducts
                .filter((p) => checkedIds.has(p.id))
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">
                        {getProductEmoji(p.category)}
                      </span>
                      <span className="text-xs truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {p.comparePrice && p.comparePrice > p.price && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          {formatBRL(p.comparePrice)}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-primary">
                        {formatBRL(p.price)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================== */}
      {/* Recommendation insight footer   */}
      {/* ============================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-5 flex items-center gap-2 px-1"
      >
        <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Recomendações baseadas em padrões de compra da nossa comunidade.
          Os descontos de kit são aplicados automaticamente ao adicionar ao carrinho.
        </p>
      </motion.div>
    </section>
  )
}
