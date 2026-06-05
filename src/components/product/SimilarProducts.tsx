'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, ShoppingCart, ArrowRight } from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { formatBRL } from '@/lib/format'
import { resolveProductImage } from '@/lib/product-images'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface SimilarProductsProps {
  currentProductId: string
  category: string
  storeId: string
  currentStoreName: string
}

/* ------------------------------------------------------------------ */
/*  Internal product type (lightweight for cards)                      */
/* ------------------------------------------------------------------ */

interface SimilarProduct {
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

/* ------------------------------------------------------------------ */
/*  Framer-motion variants                                             */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, x: 40, scale: 0.92 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
}

/* ------------------------------------------------------------------ */
/*  Skeleton state (3 cards)                                           */
/* ------------------------------------------------------------------ */

function SimilarProductsSkeleton() {
  return (
    <section className="w-full mt-6">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="h-6 w-1 rounded-full bg-primary" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[170px] sm:w-[200px]">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="mt-2 space-y-2 px-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Star rating tiny component                                          */
/* ------------------------------------------------------------------ */

function MiniStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
      <span className="text-[10px] text-muted-foreground ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Emoji fallback per category                                        */
/* ------------------------------------------------------------------ */

function getProductEmoji(category: string): string {
  if (category.includes('Alimentação') || category.includes('Food')) return '🍽️'
  if (category.includes('Saúde') || category.includes('Health')) return '💊'
  if (category.includes('Beleza') || category.includes('Beauty')) return '💄'
  if (category.includes('Pet') || category.includes('Animal')) return '🐕'
  if (category.includes('Eletrônico') || category.includes('Electronic')) return '📱'
  if (category.includes('Agro')) return '🌾'
  return '📦'
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function SimilarProducts({
  currentProductId,
  category,
  storeId,
  currentStoreName,
}: SimilarProductsProps) {
  const { addToCart, navigate, selectProduct } = useAppStore()
  const [products, setProducts] = useState<SimilarProduct[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  /* ---------- Fetch similar products ---------- */
  useEffect(() => {
    setMounted(true)
    async function fetchSimilar() {
      try {
        const data = await cachedFetch('/api/products?limit=200')
        const allProducts: SimilarProduct[] = data.products || []

        // Filter: same category OR same store, excluding current product
        const similar = allProducts.filter(
          (p) =>
            p.id !== currentProductId &&
            (p.category === category || p.storeId === storeId),
        )

        // Prioritize: same store first, then same category
        const sameStore = similar.filter((p) => p.storeId === storeId)
        const sameCategory = similar.filter(
          (p) => p.storeId !== storeId && p.category === category,
        )
        setProducts([...sameStore, ...sameCategory].slice(0, 12))
      } catch {
        // Silent fail – empty list
      } finally {
        setLoading(false)
      }
    }
    fetchSimilar()
  }, [currentProductId, category, storeId])

  /* ---------- Scroll helpers ---------- */
  const scrollBy = useCallback((dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -280 : 280,
      behavior: 'smooth',
    })
  }, [])

  /* ---------- Handle add to cart ---------- */
  const handleAddToCart = useCallback(
    (e: React.MouseEvent, product: SimilarProduct) => {
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
      addToCart(productData, product.storeName || currentStoreName)
      toast.success(`${product.name} adicionado ao carrinho!`)
    },
    [addToCart, currentStoreName],
  )

  /* ---------- Handle product click ---------- */
  const handleProductClick = useCallback(
    (product: SimilarProduct) => {
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
      selectProduct(productData)
      navigate('product')
    },
    [selectProduct, navigate],
  )

  if (!mounted || loading) return <SimilarProductsSkeleton />
  if (products.length === 0) return null

  return (
    <section className="w-full mt-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-primary" />
          <h2 className="text-lg sm:text-xl font-bold r62-heading-gradient">Produtos Similares</h2>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            ({products.length} itens)
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* "Ver todos" link */}
          <button
            onClick={() => navigate('search')}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors group mr-1"
          >
            <span className="hidden sm:inline">Ver todos</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Scroll buttons */}
          <motion.button
            onClick={() => scrollBy('left')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="min-h-[44px] min-w-[44px] h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-muted/50 transition-colors"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            onClick={() => scrollBy('right')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="min-h-[44px] min-w-[44px] h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-muted/50 transition-colors"
            aria-label="Rolar para direita"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Horizontal scroll product cards */}
      <motion.div
        ref={scrollRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1"
      >
        {products.map((product) => {
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
                ((product.comparePrice! - product.price) /
                  product.comparePrice!) *
                  100,
              )
            : 0

          return (
            <motion.div
              key={product.id}
              variants={cardVariants}
              className="shrink-0 w-[170px] sm:w-[200px] group"
              role="button"
              tabIndex={0}
              onClick={() => handleProductClick(product)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleProductClick(product)
              }}
            >
              <motion.div
                className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer transition-colors hover:border-primary/20 r62-card-lift r99-similar-product"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 12px 32px -8px rgba(0,0,0,0.12)',
                  y: -4,
                }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              >
                {/* Product image / emoji fallback */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-5xl select-none">{emoji}</span>
                  )}

                  {/* Discount badge */}
                  {discountPct > 0 && (
                    <motion.div
                      className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                    >
                      -{discountPct}%
                    </motion.div>
                  )}

                  {/* New badge */}
                  {product.isNew && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      Novo
                    </div>
                  )}

                  {/* Quick-add button appears on hover */}
                  <motion.button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="absolute bottom-2 right-2 h-8 w-8 min-h-[44px] min-w-[44px] rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Adicionar ${product.name} ao carrinho`}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </motion.button>
                </div>

                {/* Product info */}
                <div className="p-2.5">
                  {/* Store name */}
                  {product.storeName && (
                    <p className="text-[10px] text-muted-foreground truncate mb-0.5">
                      {product.storeName}
                    </p>
                  )}

                  {/* Product name */}
                  <h3 className="text-xs font-semibold line-clamp-2 leading-tight min-h-[2rem]">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="mt-1.5">
                    <MiniStars rating={product.rating} />
                  </div>

                  {/* Price row */}
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-bold text-primary">
                      {formatBRL(product.price)}
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-[10px] text-muted-foreground line-through">
                        {formatBRL(product.comparePrice)}
                      </span>
                    )}
                  </div>

                  {/* "Adicionar" button for touch devices */}
                  <motion.button
                    onClick={(e) => handleAddToCart(e, product)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-2 w-full h-8 min-h-[44px] rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-1 hover:bg-primary/15 transition-colors"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    Adicionar
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
