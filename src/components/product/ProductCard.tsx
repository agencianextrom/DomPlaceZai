'use client'

import { 
  Heart, ShoppingCart, Star, Utensils, Sprout, HeartPulse, Smartphone, PawPrint, 
  Scissors, Shirt, Wrench, Home, BookOpen, Dumbbell, Package
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { useState, useCallback } from 'react'

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

export function ProductCard({ product }: ProductCardProps) {
  const { navigate, selectProduct, addToCart, isFavoriteProduct, toggleFavoriteProduct } = useAppStore()
  const [showCartBtn, setShowCartBtn] = useState(false)
  
  const isFav = isFavoriteProduct(product.id)
  
  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) 
    : 0
  
  const gradient = gradients[Math.abs(product.name.charCodeAt(0)) % gradients.length]
  
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
  }, [product, addToCart])
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-card rounded-xl border border-border overflow-hidden group cursor-pointer h-full flex flex-col"
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
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <Badge className="bg-red-500 text-white border-0 text-[10px] px-1.5 py-0">
              -{discount}%
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-primary text-primary-foreground border-0 text-[10px] px-1.5 py-0">
              Novo
            </Badge>
          )}
        </div>
        
        {/* Favorite */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/80 dark:bg-black/40 flex items-center justify-center hover:bg-white dark:hover:bg-black/60 transition-colors"
          aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </button>
        
        {/* Quick add to cart (hover) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showCartBtn ? 1 : 0, y: showCartBtn ? 0 : 10 }}
          className="absolute bottom-0 left-0 right-0 z-10 p-2"
        >
          <Button
            size="sm"
            className="w-full h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-lg"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Adicionar
          </Button>
        </motion.div>
      </div>
      
      {/* Info - no separate onClick, handled by parent */}
      <div className="p-2.5 flex flex-col flex-1 min-h-0">
        {product.storeName && (
          <p className="text-[10px] font-medium text-primary truncate">{product.storeName}</p>
        )}
        <h3 className="text-xs font-semibold mt-0.5 line-clamp-2 leading-tight min-h-[2rem]">{product.name}</h3>
        
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
            <div className="flex items-center gap-0.5 mt-1">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] text-muted-foreground">
                {product.rating.toFixed(1)} ({product.totalReviews})
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export { formatBRL, CategoryIcon }
