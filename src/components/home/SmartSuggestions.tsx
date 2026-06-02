'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, ChevronRight, Star, Store, TrendingUp,
  RefreshCw, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'
import { resolveProductImage } from '@/lib/product-images'

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
  'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
  'from-lime-100 to-green-200 dark:from-lime-900/30 dark:to-green-800/30',
  'from-orange-100 to-amber-200 dark:from-orange-900/30 dark:to-orange-800/30',
]

const categoryEmojis: Record<string, string> = {
  FOOD: '🍚', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱',
  BEAUTY: '💅', ANIMALS: '🐾', FASHION: '👗', SERVICES: '🔧',
  HOME_GARDEN: '🏠', EDUCATION: '📚', SPORTS: '⚽', OTHER: '📦',
}

const suggestionTags = [
  'Baseado nas suas compras',
  'Popular na sua região',
  'Loja favorita',
  'Tendência do momento',
  'Recomendado para você',
  'Quem comprou também comprou',
]

// API product response shape (what /api/products returns)
interface ApiProduct {
  id: string
  storeId: string
  storeName: string
  storeLogo: string | null
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  images: string
  stock: number
  rating: number
  totalReviews: number
  isFeatured: boolean
  isNew: boolean
  isOffer: boolean
  tags: string
  variations: string | null
  category: string
}

// Map API product to store ProductData shape
function mapApiToProduct(p: ApiProduct): ProductData {
  return {
    id: p.id,
    storeId: p.storeId,
    storeName: p.storeName,
    storeLogo: p.storeLogo,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    comparePrice: p.comparePrice,
    images: p.images,
    stock: p.stock,
    rating: p.rating,
    totalReviews: p.totalReviews,
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    isOffer: p.isOffer,
    tags: p.tags,
    variations: p.variations,
    category: p.category,
  }
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

// Loading skeleton for suggestion cards
function SuggestionsSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="shrink-0 w-[170px] sm:w-[200px]">
          <Card className="border-border/50 overflow-hidden h-full">
            <Skeleton className="aspect-[4/3]" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}

export function SmartSuggestions() {
  const { selectProduct, navigate } = useAppStore()
  const [products, setProducts] = useState<ProductData[]>([])
  const [dealProducts, setDealProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [featuredRes, dealsRes] = await Promise.all([
        fetch('/api/products?isFeatured=true&limit=8'),
        fetch('/api/products?isOffer=true&limit=4'),
      ])

      if (!featuredRes.ok || !dealsRes.ok) {
        throw new Error('Failed to fetch products')
      }

      const featuredData = await featuredRes.json()
      const dealsData = await dealsRes.json()

      // Deduplicate: if product appears in both, prefer featured list
      const featuredProducts = (featuredData.products || []).map(mapApiToProduct)
      const dealsOnly = (dealsData.products || [])
        .filter((p: ApiProduct) => !featuredProducts.some(fp => fp.id === p.id))
        .slice(0, 4 - Math.min(featuredProducts.length, 4))
        .map(mapApiToProduct)

      // Combine: featured first, then remaining deals
      const combined = [...featuredProducts.slice(0, 8 - dealsOnly.length), ...dealsOnly].slice(0, 8)
      setProducts(combined)
      setDealProducts(dealsData.products ? dealsData.products.map(mapApiToProduct) : [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleProductClick = (product: ProductData) => {
    selectProduct(product)
    navigate('product')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRetry = () => {
    fetchData()
  }

  // Error state
  if (error && !loading) {
    return (
      <section className="mt-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Sugestões para Você</h2>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Produtos selecionados especialmente para você
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">Não foi possível carregar as sugestões</p>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleRetry}>
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </Button>
        </div>
      </section>
    )
  }

  // Empty state (no products)
  if (!loading && products.length === 0 && dealProducts.length === 0) {
    return (
      <section className="mt-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Sugestões para Você</h2>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Nenhuma sugestão disponível no momento</p>
        </div>
      </section>
    )
  }

  // Build display list: featured products first, pad with deals
  const displayProducts = products.length > 0 ? products : dealProducts.slice(0, 4)

  return (
    <section className="mt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Sugestões para Você</h2>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Produtos selecionados especialmente para você
            </p>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && <SuggestionsSkeleton />}

      {/* Horizontal Scrollable Cards */}
      {!loading && (
        <motion.div
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {displayProducts.map((product, idx) => {
            const gradient = gradients[idx % gradients.length]
            const emoji = categoryEmojis[product.category] || '📦'
            const tag = suggestionTags[idx % suggestionTags.length]
            const discount = product.comparePrice
              ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
              : 0
            const imgUrl = resolveProductImage({ slug: product.slug, category: product.category, images: product.images })

            return (
              <motion.div
                key={product.id}
                variants={cardVariants}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="shrink-0 w-[170px] sm:w-[200px]"
              >
                <Card
                  className="border-border/50 overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all card-premium-hover h-full"
                  onClick={() => handleProductClick(product)}
                >
                  {/* Image */}
                  <div className={`relative aspect-[4/3] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                    {imgUrl ? (
                      <img src={imgUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} loading="lazy" />
                    ) : null}
                    {!imgUrl && <span className="text-4xl z-10">{emoji}</span>}

                    {/* Discount badge */}
                    {discount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[9px] px-1.5 py-0 font-bold">
                        -{discount}%
                      </Badge>
                    )}

                    {/* New badge */}
                    {product.isNew && (
                      <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground border-0 text-[9px] px-1.5 py-0">
                        Novo
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-3">
                    {/* Product name */}
                    <h3 className="text-sm font-semibold line-clamp-2 leading-tight">{product.name}</h3>

                    {/* Store */}
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Store className="h-2.5 w-2.5" />
                      {product.storeName}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-[10px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-[11px] font-medium">{product.rating}</span>
                      <span className="text-[10px] text-muted-foreground">({product.totalReviews})</span>
                    </div>

                    {/* Suggestion Tag */}
                    <div className="mt-2 flex items-center gap-1">
                      <div className="h-4 px-1.5 rounded-full bg-gradient-to-r from-primary/10 to-amber-500/10 flex items-center gap-0.5">
                        <TrendingUp className="h-2.5 w-2.5 text-primary" />
                        <span className="text-[9px] font-medium text-primary truncate max-w-[120px]">{tag}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}

          {/* "Ver mais" button */}
          <motion.div
            variants={cardVariants}
            className="shrink-0 w-[100px] sm:w-[120px] flex items-end"
          >
            <Button
              variant="outline"
              className="w-full h-full min-h-[200px] sm:min-h-[240px] rounded-xl border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 flex flex-col items-center justify-center gap-2"
              onClick={() => { useAppStore.getState().setSearchQuery('recomendados'); useAppStore.getState().openSearch() }}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="text-xs font-semibold">Ver mais</span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
