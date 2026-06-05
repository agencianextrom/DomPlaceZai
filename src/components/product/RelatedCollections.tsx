'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Sparkles, TrendingUp,
  ShoppingBag, Star, Flame, Clock, Package,
  ArrowRight, Loader2, Grid3X3,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { cachedFetch } from '@/lib/api-cache'
import { resolveProductImage } from '@/lib/product-images'
import { formatBRL, CategoryIcon } from './ProductCard'

/* ─── Types ─────────────────────────────────────────────── */
interface CollectionProduct {
  id: string
  name: string
  price: number
  comparePrice: number | null
  category: string
  slug: string
  images: string | null
  rating: number
  isOffer: boolean
  storeName?: string
}

interface Collection {
  id: string
  title: string
  description: string
  icon: typeof Sparkles
  gradient: string
  borderColor: string
  textColor: string
  badgeColor: string
  products: CollectionProduct[]
  totalProducts: number
}

/* ─── Collection templates ──────────────────────────────── */
const collectionTemplates = [
  {
    id: 'essentials',
    title: 'Essenciais',
    description: 'Produtos que você sempre precisa',
    icon: ShoppingBag,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    borderColor: 'border-emerald-200/50 dark:border-emerald-800/30',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  {
    id: 'bestsellers',
    title: 'Mais Vendidos',
    description: 'Os favoritos da comunidade',
    icon: TrendingUp,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    borderColor: 'border-amber-200/50 dark:border-amber-800/30',
    textColor: 'text-amber-700 dark:text-amber-300',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  {
    id: 'new-arrivals',
    title: 'Novidades',
    description: 'Acabaram de chegar',
    icon: Clock,
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    borderColor: 'border-blue-200/50 dark:border-blue-800/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  {
    id: 'deals',
    title: 'Ofertas Imperdíveis',
    description: 'Preços com desconto imperdível',
    icon: Flame,
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    borderColor: 'border-rose-200/50 dark:border-rose-800/30',
    textColor: 'text-rose-700 dark:text-rose-300',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  },
  {
    id: 'daily',
    title: 'Para o Dia a Dia',
    description: 'Itens essenciais do cotidiano',
    icon: Package,
    gradient: 'from-lime-500 via-green-500 to-emerald-500',
    borderColor: 'border-lime-200/50 dark:border-lime-800/30',
    textColor: 'text-lime-700 dark:text-lime-300',
    badgeColor: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
  },
  {
    id: 'top-rated',
    title: 'Mais Bem Avaliados',
    description: 'Avaliações 4.5+ estrelas',
    icon: Star,
    gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
    borderColor: 'border-purple-200/50 dark:border-purple-800/30',
    textColor: 'text-purple-700 dark:text-purple-300',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
]

/* ─── Skeleton ────────────────────────────────────────────── */
function CollectionCardSkeleton() {
  return (
    <div className="min-w-[280px] sm:min-w-[320px] snap-start">
      <Card className="overflow-hidden">
        <Skeleton className="h-8 w-full" />
        <CardContent className="p-3">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-3 w-48 mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Mini product tile inside collection ───────────────── */
function MiniProductTile({ product }: { product: CollectionProduct }) {
  const { selectProduct, navigate } = useAppStore()
  const imgUrl = resolveProductImage({ slug: product.slug, category: product.category, images: product.images ?? undefined })

  const handleClick = () => {
    // Fetch full product and navigate
    fetch(`/api/products/${product.id}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.id) {
          const fullProduct: ProductData = {
            id: data.id,
            storeId: data.storeId,
            storeName: data.store?.name || product.storeName || '',
            storeLogo: data.store?.logo || null,
            name: data.name,
            slug: data.slug,
            description: data.description,
            price: data.price,
            comparePrice: data.comparePrice,
            images: data.images || '[]',
            stock: data.stock || 0,
            rating: data.rating || 0,
            totalReviews: data.totalReviews || 0,
            isFeatured: data.isFeatured || false,
            isNew: data.isNew || false,
            isOffer: data.isOffer || false,
            tags: data.tags || '[]',
            variations: data.variations || null,
            category: data.category || product.category,
            freeDeliveryAbove: null,
            storeDeliveryFee: 0,
          }
          selectProduct(fullProduct)
          navigate('product')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      })
      .catch(() => { /* silent */ })
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="cursor-pointer group"
      onClick={handleClick}
    >
      <div className="aspect-square rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden relative mb-1.5">
        {imgUrl ? (
          <motion.img
            src={imgUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <CategoryIcon category={product.category} />
        )}
        {product.isOffer && product.comparePrice && product.comparePrice > product.price && (
          <Badge className="absolute top-1 left-1 bg-red-500 text-white border-0 text-[8px] px-1 py-0 font-bold leading-none">
            -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
          </Badge>
        )}
      </div>
      <p className="text-[10px] font-medium line-clamp-1 group-hover:text-primary transition-colors">{product.name}</p>
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-bold text-primary">{formatBRL(product.price)}</span>
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="text-[9px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Collection Card ────────────────────────────────────── */
function CollectionCard({ collection, index }: { collection: Collection; index: number }) {
  const { navigate } = useAppStore()
  const TemplateIcon = collection.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="min-w-[280px] sm:min-w-[320px] snap-start"
    >
      <motion.div
        whileHover={{
          y: -6,
          boxShadow: '0 12px 32px oklch(0.18 0.02 150 / 0.1), 0 0 0 1px oklch(0.45 0.1 155 / 0.1)',
        }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
      >
        <Card className={`overflow-hidden border ${collection.borderColor} card-spotlight`}>
          {/* Gradient header */}
          <div className={`h-2 bg-gradient-to-r ${collection.gradient}`} />

          <CardContent className="p-4">
            {/* Title row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${collection.gradient} flex items-center justify-center`}>
                  <TemplateIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{collection.title}</h4>
                  <p className="text-[10px] text-muted-foreground">{collection.description}</p>
                </div>
              </div>
              <Badge className={`text-[9px] px-1.5 py-0 font-bold ${collection.badgeColor} border-0`}>
                {collection.totalProducts} itens
              </Badge>
            </div>

            {/* Mini product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
              {collection.products.slice(0, 3).map((product) => (
                <MiniProductTile key={product.id} product={product} />
              ))}
            </div>

            {/* View collection button */}
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="relative overflow-hidden"
            >
              <Button
                variant="outline"
                className={`w-full h-9 text-xs gap-1.5 border-primary/20 hover:bg-primary/5 btn-shine ${collection.textColor}`}
                onClick={() => navigate('home')}
              >
                Ver Coleção
                <ArrowRight className="h-3 w-3" />
              </Button>
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                  backgroundSize: '200% 100%',
                }}
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

/* ─── Explore All CTA ───────────────────────────────────── */
function ExploreAllCTA() {
  const { navigate } = useAppStore()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="min-w-[200px] snap-start flex items-center justify-center"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => navigate('home')}
          className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-teal-500 text-white btn-glow gap-2 shadow-lg"
        >
          <Grid3X3 className="h-4 w-4" />
          Explorar Todas as Coleções
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   RelatedCollections — Main Component
   ═══════════════════════════════════════════════════════════ */
export function RelatedCollections({ category, price, tags }: {
  category: string
  price: number
  tags?: string
}) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  /* Fetch products and build collections */
  useEffect(() => {
    let cancelled = false

    const fetchAndBuildCollections = async () => {
      setIsLoading(true)
      try {
        const data = await cachedFetch(`/api/products?limit=50&category=${category}`)
        const products: ProductData[] = data.products || []

        if (cancelled) return

        /* Parse tags */
        const parsedTags: string[] = tags ? JSON.parse(tags) : []

        /* Build collections from the products */
        const allProducts: CollectionProduct[] = products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          comparePrice: p.comparePrice,
          category: p.category,
          slug: p.slug,
          images: p.images,
          rating: p.rating,
          isOffer: p.isOffer,
          storeName: p.storeName,
        }))

        /* Also fetch more products from other categories for broader collections */
        let extraProducts: CollectionProduct[] = []
        try {
          const extraData = await cachedFetch('/api/products?limit=30')
          const extra: ProductData[] = extraData.products || []
          extraProducts = extra
            .filter((p) => p.category !== category)
            .map((p) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              comparePrice: p.comparePrice,
              category: p.category,
              slug: p.slug,
              images: p.images,
              rating: p.rating,
              isOffer: p.isOffer,
              storeName: p.storeName,
            }))
        } catch { /* ignore */ }

        const fullList = [...allProducts, ...extraProducts]

        /* Build each collection */
        const built: Collection[] = collectionTemplates.map((template) => {
          let filtered: CollectionProduct[] = []

          switch (template.id) {
            case 'essentials':
              filtered = fullList.slice(0, 9).sort(() => Math.random() - 0.5)
              break
            case 'bestsellers':
              filtered = [...fullList].sort((a, b) => b.rating - a.rating).slice(0, 9)
              break
            case 'new-arrivals':
              filtered = fullList.filter((p) => parsedTags.some((t) => t.toLowerCase().includes('novo')))
              if (filtered.length < 3) filtered = [...fullList].reverse().slice(0, 9)
              break
            case 'deals':
              filtered = fullList.filter((p) => p.isOffer && p.comparePrice && p.comparePrice > p.price)
              if (filtered.length < 3) filtered = [...fullList].filter((p) => p.price < price * 1.2).slice(0, 9)
              break
            case 'daily':
              filtered = fullList.filter((p) => p.price <= price * 1.5 && p.price > 0)
              if (filtered.length < 3) filtered = [...fullList].sort(() => Math.random() - 0.5).slice(0, 9)
              break
            case 'top-rated':
              filtered = [...fullList].filter((p) => p.rating >= 4.0).sort((a, b) => b.rating - a.rating).slice(0, 9)
              if (filtered.length < 3) filtered = [...fullList].sort((a, b) => b.rating - a.rating).slice(0, 9)
              break
          }

          return {
            ...template,
            products: filtered.slice(0, 9),
            totalProducts: filtered.length,
          }
        })

        /* Only keep collections that have at least 3 products */
        const validCollections = built.filter((c) => c.products.length >= 3)
        setCollections(validCollections)
      } catch {
        // Build fallback collections from template data
        const fallbackCollections = collectionTemplates.slice(0, 3).map((template) => ({
          ...template,
          products: [],
          totalProducts: 0,
        }))
        setCollections(fallbackCollections)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchAndBuildCollections()
    return () => { cancelled = true }
  }, [category, price, tags])

  /* Scroll detection for navigation arrows */
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    // Initial check
    handleScroll()
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollBy = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const distance = 320
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    })
  }

  if (collections.length === 0 && !isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Coleções Relacionadas</h3>
            <p className="text-[10px] text-muted-foreground">
              Descubra produtos selecionados para você
            </p>
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => scrollBy('left')}
            disabled={!canScrollLeft}
            className={`min-h-[44px] min-w-[44px] h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
              canScrollLeft
                ? 'border-primary/20 bg-card hover:bg-primary/5 text-primary'
                : 'border-border bg-muted text-muted-foreground/30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => scrollBy('right')}
            disabled={!canScrollRight}
            className={`min-h-[44px] min-w-[44px] h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
              canScrollRight
                ? 'border-primary/20 bg-card hover:bg-primary/5 text-primary'
                : 'border-border bg-muted text-muted-foreground/30 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        /* Horizontal scroll carousel with snap */
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 scroll-smooth snap-x snap-mandatory"
        >
          {collections.map((collection, index) => (
            <CollectionCard key={collection.id} collection={collection} index={index} />
          ))}
          <ExploreAllCTA />
        </div>
      )}
    </motion.div>
  )
}

export default RelatedCollections
