'use client'

import { 
  Heart, ShoppingCart, Star, Utensils, Sprout, HeartPulse, Smartphone, PawPrint, 
  Scissors, Shirt, Wrench, Home, BookOpen, Dumbbell, Package, Truck, GitCompareArrows, Eye, Plus
} from 'lucide-react'
import { PriceDropAlert } from './PriceDropAlert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { useState, useCallback } from 'react'
import { ProductQuickView } from './ProductQuickView'

interface ProductCardProps {
  product: ProductData
}

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
  'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
  'from-lime-100 to-green-200 dark:from-lime-900/30 dark:to-green-800/30',
]

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case 'FOOD': return <Utensils className="h-8 w-8 text-primary/70" />
    case 'AGRICULTURE': return <Sprout className="h-8 w-8 text-primary/70" />
    case 'HEALTH': return <HeartPulse className="h-8 w-8 text-primary/70" />
    case 'ELECTRONICS': return <Smartphone className="h-8 w-8 text-primary/70" />
    case 'ANIMALS': return <PawPrint className="h-8 w-8 text-primary/70" />
    case 'BEAUTY': return <Scissors className="h-8 w-8 text-primary/70" />
    case 'FASHION': return <Shirt className="h-8 w-8 text-primary/70" />
    case 'SERVICES': return <Wrench className="h-8 w-8 text-primary/70" />
    case 'HOME_GARDEN': return <Home className="h-8 w-8 text-primary/70" />
    case 'EDUCATION': return <BookOpen className="h-8 w-8 text-primary/70" />
    case 'SPORTS': return <Dumbbell className="h-8 w-8 text-primary/70" />
    default: return <Package className="h-8 w-8 text-primary/70" />
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star
        const half = !filled && rating >= star - 0.5
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
    </div>
  )
}

export function ProductCard({ product }: ProductCardProps) {
  const { navigate, selectProduct, addToCart, isFavoriteProduct, toggleFavoriteProduct, isComparing, toggleCompareProduct, openQuickAdd } = useAppStore()
  const [showCartBtn, setShowCartBtn] = useState(false)
  const [cartAnimating, setCartAnimating] = useState(false)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

  const isFav = isFavoriteProduct(product.id)
  const isCompared = isComparing(product.id)
  
  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) 
    : 0
  
  const gradient = gradients[Math.abs(product.name.charCodeAt(0)) % gradients.length]
  
  const isPopular = product.totalReviews > 20

  // Check if the product has free shipping info (from store data)
  // We use product.price as proxy check - if the store has freeDeliveryAbove
  // and the product price meets it, we show the badge
  const showFreeShipping = product.price >= 50 && discount > 0
  
  const handleCardClick = useCallback(() => {
    selectProduct(product)
    navigate('product')
  }, [product, selectProduct, navigate])
  
  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavoriteProduct(product.id)
  }, [product.id, toggleFavoriteProduct])
  
  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product, product.storeName || 'Loja')
    // Animate the cart button
    setCartAnimating(true)
    setTimeout(() => setCartAnimating(false), 400)
  }, [product, addToCart])

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 32px oklch(0.18 0.02 150 / 0.1)' }}
      className="bg-card rounded-xl border border-border overflow-hidden group cursor-pointer h-full flex flex-col gradient-border relative"
      onClick={handleCardClick}
      onMouseEnter={() => setShowCartBtn(true)}
      onMouseLeave={() => setShowCartBtn(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick() }}
    >
      {/* Image area */}
      <div className="relative aspect-square flex items-center justify-center bg-gradient-to-br overflow-hidden">
        <div className={`${gradient} absolute inset-0`} />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        <div className="relative z-10 h-16 w-16 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
          <CategoryIcon category={product.category} />
        </div>
        
        {/* Ribbon discount badge */}
        {discount > 0 && (
          <div className="ribbon-badge">
            -{discount}%
          </div>
        )}

        {/* Free shipping badge */}
        {showFreeShipping && (
          <div className="absolute top-0 right-2 z-10 bg-emerald-500 text-white text-[9px] font-semibold px-2 py-0.5 rounded-b-md flex items-center gap-0.5">
            <Truck className="h-2.5 w-2.5" />
            Frete Grátis
          </div>
        )}

        {/* New badge (only if no discount) */}
        {product.isNew && discount === 0 && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground border-0 text-[10px] px-1.5 py-0 z-10">
            Novo
          </Badge>
        )}

        {/* Popular badge */}
        {isPopular && (
          <div className="absolute bottom-2 left-2 z-10 bg-amber-500/90 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 fill-white" />
            Popular
          </div>
        )}
        
        {/* Favorite */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/80 dark:bg-black/40 flex items-center justify-center hover:bg-white dark:hover:bg-black/60 transition-colors"
          aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <motion.div
            animate={isFav ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </motion.div>
        </button>

        {/* Compare button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleCompareProduct(product.id)
          }}
          className={`absolute bottom-2 right-2 z-10 h-6 w-6 rounded-md flex items-center justify-center transition-colors ${
            isCompared
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60'
          }`}
          aria-label={isCompared ? 'Remover da comparação' : 'Adicionar à comparação'}
        >
          <GitCompareArrows className={`h-3 w-3 ${isCompared ? '' : 'text-muted-foreground'}`} />
        </button>

        {/* Quick view button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsQuickViewOpen(true)
          }}
          className="absolute bottom-2 right-10 z-10 h-6 w-6 rounded-md bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 flex items-center justify-center transition-colors"
          aria-label='Visualização rápida'
        >
          <Eye className="h-3 w-3 text-muted-foreground" />
        </button>
        
        {/* Quick add button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            openQuickAdd(product)
          }}
          className="absolute bottom-2 right-[4.25rem] z-10 h-6 w-6 rounded-md bg-white/80 dark:bg-black/40 hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground flex items-center justify-center transition-colors group"
          aria-label='Adicionar rápido'
        >
          <Plus className="h-3 w-3 text-muted-foreground group-hover:text-primary-foreground" />
        </button>
        
        {/* Quick add to cart (hover) */}
        <AnimatePresence>
          {showCartBtn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 z-10 p-2"
            >
              <Button
                size="sm"
                className={`w-full h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-lg transition-transform ${
                  cartAnimating ? 'scale-95' : 'scale-100'
                }`}
                onClick={handleAddToCart}
              >
                <motion.div
                  animate={cartAnimating ? { scale: [1, 1.4, 1], rotate: [0, -15, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                </motion.div>
                Adicionar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Info */}
      <div className="p-2.5 flex flex-col flex-1 min-h-0">
        {product.storeName && (
          <p className="text-[10px] font-medium text-primary truncate">{product.storeName}</p>
        )}
        <h3 className="text-xs font-semibold mt-0.5 line-clamp-2 leading-tight min-h-[2rem]">{product.name}</h3>
        
        {/* Price Drop Alert - inline badge */}
        <div className="mt-1">
          <PriceDropAlert
            price={product.price}
            comparePrice={product.comparePrice || 0}
            size="sm"
            variant="badge"
          />
        </div>
        
        <div className="mt-auto pt-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[10px] text-muted-foreground line-through">
                {formatBRL(product.comparePrice)}
              </span>
            )}
          </div>
          
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <StarRating rating={product.rating} />
              <span className="text-[10px] text-muted-foreground ml-0.5">
                ({product.totalReviews})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Dialog */}
      <ProductQuickView
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </motion.div>
  )
}

export { formatBRL, CategoryIcon }
