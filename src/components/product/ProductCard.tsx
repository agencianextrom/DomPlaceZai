'use client'

import { 
  Heart, ShoppingCart, Star, Utensils, Sprout, HeartPulse, Smartphone, PawPrint, 
  Scissors, Shirt, Wrench, Home, BookOpen, Dumbbell, Package, Truck, GitCompareArrows,
  Zap, Check
} from 'lucide-react'
import { PriceDropAlert } from './PriceDropAlert'
import { SocialProofBadges } from './SocialProofBadges'
import { StockUrgency } from './StockUrgency'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { getProductRealImages } from '@/lib/product-real-images'

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

// Store initials helper
function getStoreInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

// Mini cart popup component
function MiniCartPopup({ product, onClose }: { product: ProductData; onClose: () => void }) {
  const { addToCart, navigate } = useAppStore()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  const handleAdd = useCallback(() => {
    addToCart(product, product.storeName || 'Loja', qty)
    setAdded(true)
    setTimeout(() => {
      onClose()
    }, 1200)
  }, [product, qty, addToCart, onClose])

  const handleGoToCart = useCallback(() => {
    onClose()
    navigate('cart')
  }, [onClose, navigate])

  // Close on mouse leave after 1.5s
  useEffect(() => {
    if (!isHovering && !added) {
      const timer = setTimeout(onClose, 1500)
      return () => clearTimeout(timer)
    }
  }, [isHovering, added, onClose])

  return (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
      style={{ boxShadow: '0 8px 32px oklch(0.18 0.02 150 / 0.15)' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Product info header */}
      <div className="px-3 pt-3 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradients[Math.abs(product.name.charCodeAt(0)) % gradients.length]} flex items-center justify-center shrink-0`}>
            <CategoryIcon category={product.category} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold line-clamp-1">{product.name}</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-[10px] text-muted-foreground line-through">
                  {formatBRL(product.comparePrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quantity + Actions */}
      <div className="p-3">
        {!added ? (
          <>
            <div className="flex items-center gap-3 mb-2.5">
              <span className="text-xs text-muted-foreground">Qtd:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-sm hover:bg-muted transition-colors"
                >
                  -
                </button>
                <span className="h-7 w-8 flex items-center justify-center text-sm font-bold">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                  className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-sm hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
              <span className="ml-auto text-sm font-bold text-primary">
                {formatBRL(product.price * qty)}
              </span>
            </div>
            <Button
              size="sm"
              className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 btn-glow"
              onClick={handleAdd}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Adicionar ao Carrinho
            </Button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-1"
          >
            <div className="flex items-center justify-center gap-1.5 text-primary font-semibold text-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <Check className="h-4 w-4" />
              </motion.div>
              Adicionado com sucesso!
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 mt-2 text-xs border-primary/30 hover:bg-primary/5"
              onClick={handleGoToCart}
            >
              Ver Carrinho ({qty})
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export function ProductCard({ product }: ProductCardProps) {
  const { navigate, selectProduct, addToCart, isFavoriteProduct, toggleFavoriteProduct, isComparing, toggleCompareProduct } = useAppStore()
  const [showCartBtn, setShowCartBtn] = useState(false)
  const [cartAnimating, setCartAnimating] = useState(false)
  const [showMiniCart, setShowMiniCart] = useState(false)

  // Resolve product image URL from slug or stored images
  const imageUrl = useMemo(() => {
    // Try parsing stored images JSON first
    try {
      const stored = JSON.parse(product.images)
      if (Array.isArray(stored) && stored.length > 0 && stored[0]) return stored[0]
    } catch { /* ignore */ }
    // Fallback: look up by slug
    const real = getProductRealImages(product.slug)
    if (real.length > 0) return real[0]
    return ''
  }, [product.images, product.slug])

  const isFav = isFavoriteProduct(product.id)
  const isCompared = isComparing(product.id)
  
  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) 
    : 0
  
  const gradient = gradients[Math.abs(product.name.charCodeAt(0)) % gradients.length]
  
  const isPopular = product.totalReviews > 20

  // Check if the product qualifies for free shipping based on store settings
  const showFreeShipping = product.freeDeliveryAbove !== null 
    ? product.price >= (product.freeDeliveryAbove || 0) 
    : product.storeDeliveryFee === 0
  
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
    setCartAnimating(true)
    setTimeout(() => setCartAnimating(false), 400)
  }, [product, addToCart])

  const handleQuickAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMiniCart(true)
  }, [])

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 16px 40px oklch(0.18 0.02 150 / 0.12)' }}
      className="bg-card rounded-xl border border-border overflow-hidden group cursor-pointer h-full flex flex-col gradient-border relative hover-gradient-overlay shadow-sm hover:shadow-xl transition-all duration-300"
      onClick={handleCardClick}
      onMouseEnter={() => setShowCartBtn(true)}
      onMouseLeave={() => { setShowCartBtn(false); setShowMiniCart(false) }}
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
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="relative z-10 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <motion.div 
            className="relative z-10 h-16 w-16 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm"
            whileHover={{ scale: 1.12, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <CategoryIcon category={product.category} />
          </motion.div>
        )}
        
        {/* Ribbon discount badge */}
        {discount > 0 && (
          <div className="ribbon-badge">
            -{discount}%
          </div>
        )}

        {/* "Oferta" badge — red/orange gradient when isOffer */}
        {product.isOffer && discount === 0 && (
          <div className="absolute top-2 left-2 z-10">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 text-[10px] font-bold px-2 py-0.5 shadow-md shadow-red-500/20">
                <Zap className="h-2.5 w-2.5 mr-0.5 fill-white" />
                Oferta
              </Badge>
            </motion.div>
          </div>
        )}

        {/* Free shipping badge */}
        {showFreeShipping && (
          <div className={`absolute z-10 bg-emerald-500 text-white text-[9px] font-semibold px-2 py-0.5 rounded-b-md flex items-center gap-0.5 ${
            discount > 0 ? 'top-10 right-2' : 'top-0 right-2'
          }`}>
            <Truck className="h-2.5 w-2.5" />
            Frete Grátis
          </div>
        )}

        {/* "Novo" badge (only if no discount and not offer) */}
        {product.isNew && !product.isOffer && discount === 0 && (
          <div className="absolute top-2 left-2 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Badge className="bg-primary text-primary-foreground border-0 text-[10px] px-1.5 py-0 shadow-sm">
                Novo
              </Badge>
            </motion.div>
          </div>
        )}

        {/* Popular badge */}
        {isPopular && (
          <div className="absolute bottom-2 left-2 z-10 bg-amber-500/90 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
            <Star className="h-2.5 w-2.5 fill-white" />
            Popular
          </div>
        )}
        
        {/* Favorite button — top right, always visible */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute z-10 h-7 w-7 rounded-full bg-white/80 dark:bg-black/40 flex items-center justify-center hover:bg-white dark:hover:bg-black/60 transition-colors ${
            showFreeShipping && !product.isOffer && discount === 0 ? 'top-12 left-2' : 'top-2 right-2'
          }`}
          aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <motion.div
            animate={isFav ? { scale: [1, 1.4, 0.85, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Heart className={`h-3.5 w-3.5 transition-colors duration-200 ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground group-hover:text-red-400'}`} />
          </motion.div>
        </button>

        {/* Compare button — only on hover */}
        <AnimatePresence>
          {showCartBtn && !showMiniCart && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
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
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Quick add to cart (hover) */}
        <AnimatePresence>
          {showCartBtn && !showMiniCart && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute bottom-0 left-0 right-0 z-10 p-2"
            >
              <Button
                size="sm"
                className={`w-full h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-lg transition-transform btn-glow ${
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

        {/* Mini Cart Popup */}
        <AnimatePresence>
          {showMiniCart && (
            <div className="absolute bottom-full left-0 right-0 z-50 flex justify-center pointer-events-auto">
              <MiniCartPopup product={product} onClose={() => setShowMiniCart(false)} />
            </div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Info */}
      <div className="p-2.5 flex flex-col flex-1 min-h-0">
        {/* Store name with logo + Quick add button */}
        <div className="flex items-center gap-1.5 mt-0">
          {product.storeName && (
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <div className="h-4 w-4 rounded bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center shrink-0">
                <span className="text-[7px] font-bold text-primary leading-none">
                  {getStoreInitials(product.storeName)}
                </span>
              </div>
              <p className="text-[10px] font-medium text-primary truncate">{product.storeName}</p>
            </div>
          )}
          {/* Quick add (eye icon for mini cart popup) */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: showCartBtn ? 1 : 0 }}
            onClick={handleQuickAdd}
            className="h-5 w-5 rounded flex items-center justify-center bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Adicionar rapidamente"
          >
            <Zap className="h-2.5 w-2.5" />
          </motion.button>
        </div>

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
          {/* Large, bold price */}
          <div className="flex items-baseline gap-1.5">
            <motion.span 
              className="text-base font-extrabold text-primary leading-none" 
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
            >{formatBRL(product.price)}</motion.span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[10px] text-muted-foreground line-through">
                {formatBRL(product.comparePrice)}
              </span>
            )}
          </div>
          
          {/* Rating stars + review count */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <StarRating rating={product.rating} />
              <span className="text-[10px] text-muted-foreground ml-0.5">
                ({product.totalReviews})
              </span>
            </div>
          )}

          {/* Stock urgency text for very low stock */}
          {product.stock > 0 && product.stock < 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1"
            >
              <span className="text-[9px] font-bold text-red-500 flex items-center gap-0.5">
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >🔥</motion.span>
                Últimas {product.stock} unidades!
              </span>
            </motion.div>
          )}
        </div>
        
        {/* Social Proof — cycling badge */}
        <SocialProofBadges
          productId={product.id}
          productName={product.name}
          variant="card"
          totalReviews={product.totalReviews}
        />
        
        {/* Stock Urgency Bar */}
        <StockUrgency product={product} variant="card" />
      </div>

    </motion.div>
  )
}

export { formatBRL, CategoryIcon }
