'use client'

import { 
  Eye, Heart, Share2, ShoppingCart, Star, Utensils, Sprout, HeartPulse, Smartphone, PawPrint, 
  Scissors, Shirt, Wrench, Home, BookOpen, Dumbbell, Package, Truck, GitCompareArrows,
  Zap, Check, Leaf
} from 'lucide-react'
import { PriceDropAlert } from './PriceDropAlert'
import { SocialProofBadges } from './SocialProofBadges'
import { StockUrgency } from './StockUrgency'
import { fireConfettiFromElement } from '@/lib/confetti'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { resolveProductImage } from '@/lib/product-images'
import { useState, useCallback, useRef, useEffect } from 'react'

interface ProductCardProps {
  product: ProductData
  index?: number
}

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
  'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
  'from-lime-100 to-green-200 dark:from-lime-900/30 dark:to-green-800/30',
]

/* ─── CSS Keyframes injected once ─── */
const CARD_ANIM_STYLES = `
@keyframes shadow-cascade-layer1 {
  0%   { box-shadow: 0 1px 2px oklch(0.18 0.02 150 / 0.03); }
  100% { box-shadow: 0 24px 48px oklch(0.18 0.02 150 / 0.14); }
}
@keyframes shadow-cascade-layer2 {
  0%   { box-shadow: 0 1px 2px oklch(0.18 0.02 150 / 0.02); }
  100% { box-shadow: 0 12px 24px oklch(0.18 0.02 150 / 0.09); }
}
@keyframes shadow-cascade-layer3 {
  0%   { box-shadow: 0 1px 1px oklch(0.18 0.02 150 / 0.02); }
  100% { box-shadow: 0 4px 10px oklch(0.18 0.02 150 / 0.06); }
}
.card-shadow-cascade {
  box-shadow: 0 1px 2px oklch(0.18 0.02 150 / 0.03),
              0 1px 2px oklch(0.18 0.02 150 / 0.02),
              0 1px 1px oklch(0.18 0.02 150 / 0.02);
  transition: box-shadow 0s;
}
.card-shadow-cascade:hover {
  animation:
    shadow-cascade-layer1 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards,
    shadow-cascade-layer2 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards,
    shadow-cascade-layer3 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes star-shimmer {
  0%   { transform: translateX(-150%); }
  100% { transform: translateX(250%); }
}
.star-shimmer-wrap {
  position: relative;
  overflow: hidden;
}
.star-shimmer-wrap::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    oklch(0.85 0.08 85 / 0.35) 45%,
    oklch(0.85 0.08 85 / 0.5) 50%,
    oklch(0.85 0.08 85 / 0.35) 55%,
    transparent 100%
  );
  animation: star-shimmer 2.8s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}
@keyframes discount-badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
.discount-badge-pulse {
  animation: discount-badge-pulse 2s ease-in-out infinite;
}
@keyframes card-shimmer-sweep {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}
.card-shimmer-overlay {
  pointer-events: none;
  z-index: 5;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.group:hover .card-shimmer-overlay {
  opacity: 1;
  animation: card-shimmer-sweep 0.8s ease-in-out;
}
`

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
    <div className="flex items-center gap-px star-shimmer-wrap r41-stars-glow">
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
      transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
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
                transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
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

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { navigate, selectProduct, addToCart, isFavoriteProduct, toggleFavoriteProduct, isComparing, toggleCompareProduct, setQuickViewProduct, openQuickView } = useAppStore()
  const [showCartBtn, setShowCartBtn] = useState(false)
  const [cartAnimating, setCartAnimating] = useState(false)
  const [showMiniCart, setShowMiniCart] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showCheckmark, setShowCheckmark] = useState(false)
  const [shareClicked, setShareClicked] = useState(false)
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 })

  // Resolve the best product image URL
  const imageUrl = !imgError ? resolveProductImage({
    slug: product.slug,
    category: product.category,
    images: product.images,
  }) : null

  const isFav = isFavoriteProduct(product.id)
  const isCompared = isComparing(product.id)
  
  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) 
    : 0
  
  const isEco = product.tags?.toLowerCase().includes('eco') || product.tags?.toLowerCase().includes('sustentável') || product.tags?.toLowerCase().includes('orgânico')
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
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
    // Magnetic offset for action bar
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const dx = (e.clientX - rect.left - centerX) / rect.width
    const dy = (e.clientY - rect.top - centerY) / rect.height
    setMagneticOffset({ x: dx * 6, y: dy * 4 })
  }, [])

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product, product.storeName || 'Loja')
    setCartAnimating(true)
    setShowCheckmark(true)
    fireConfettiFromElement(e.currentTarget as HTMLElement)
    setTimeout(() => setCartAnimating(false), 400)
    setTimeout(() => setShowCheckmark(false), 600)
  }, [product, addToCart])

  const handleQuickAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMiniCart(true)
  }, [])

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setQuickViewProduct(product)
    openQuickView()
  }, [product, setQuickViewProduct, openQuickView])

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShareClicked(true)
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${product.name} - ${formatBRL(product.price)}`)
    }
    setTimeout(() => setShareClicked(false), 800)
  }, [product])

  return (
    <>
      {/* Inject keyframe animations */}
      <style dangerouslySetInnerHTML={{ __html: CARD_ANIM_STYLES }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: Math.min(index * 0.06, 0.5), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -5, scale: 1.02, boxShadow: '0 0 20px rgba(16,185,129,0.15), 0 0 40px rgba(16,185,129,0.08), 0 8px 24px rgba(0,0,0,0.08)' }}
        className="bg-card rounded-xl border border-border overflow-hidden group cursor-pointer h-full flex flex-col gradient-border relative hover-gradient-overlay shadow-sm card-shadow-cascade card-spotlight card-shine card-glow-border hover:shadow-xl transition-shadow duration-300 r41-card-3d"
        onClick={handleCardClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowCartBtn(true)}
        onMouseLeave={() => { setShowCartBtn(false); setShowMiniCart(false); setIsHovered(false) }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick() }}
      >
        {/* Diagonal shimmer sweep overlay on hover */}
        <div
          className="card-shimmer-overlay absolute inset-0 rounded-xl overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.25) 55%, transparent 60%)',
            }}
          />
        </div>

        {/* Image area */}
        <div
          className="relative aspect-square flex items-center justify-center bg-gradient-to-br overflow-hidden img-hover-overlay r41-img-area"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover z-0 will-change-transform r41-img-zoom"
                style={{
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onError={() => setImgError(true)}
                loading="lazy"
              />
              {/* Gradient overlay on image for better badge readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-[1]" />
              {/* CSS-animated "Ver Detalhes" label */}
              <span className="r41-detalhes-label">Ver Detalhes</span>
              {/* Animated "Ver Produto" overlay on hover */}
              <motion.div
                className="absolute inset-0 z-[2] flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <motion.span
                  className="relative z-10 text-white text-xs font-bold tracking-wide px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 r41-ver-detalhes"
                  initial={{ y: 12, opacity: 0, scale: 0.9 }}
                  animate={{ y: isHovered ? 0 : 12, opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.9 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 25, delay: 0.08 }}
                >
                  <Eye className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                  Ver Produto
                </motion.span>
              </motion.div>

              {/* Quick action icons floating over image — staggered entrance */}
              <AnimatePresence>
                {showCartBtn && !showMiniCart && (
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 z-[3] flex flex-col gap-2">
                    <motion.button
                      initial={{ opacity: 0, x: 12, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 12, scale: 0.8 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 25, delay: 0 }}
                      onClick={handleFavoriteClick}
                      className="h-8 w-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/50 hover:bg-white dark:hover:bg-black/80 transition-colors"
                      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: 12, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 12, scale: 0.8 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 25, delay: 0.1 }}
                      onClick={handleAddToCart}
                      className="h-8 w-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/50 hover:bg-white dark:hover:bg-black/80 transition-colors"
                      aria-label="Adicionar ao carrinho"
                    >
                      <ShoppingCart className="h-4 w-4 text-gray-600" />
                    </motion.button>
                  </div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              <div className={`${gradient} absolute inset-0`} />
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />
              <motion.div 
                className="relative z-10 h-16 w-16 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm"
                whileHover={{ scale: 1.12, rotate: 3 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              >
                <CategoryIcon category={product.category} />
              </motion.div>
            </>
          )}
          
          {/* Ribbon discount badge — with pulse animation */}
          {discount > 0 && (
            <motion.div
              className="ribbon-badge discount-badge-pulse"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
            >
              -{discount}%
            </motion.div>
          )}

          {/* "Oferta" badge — red/orange gradient when isOffer — bouncing pulse + shimmer */}
          {product.isOffer && discount === 0 && (
            <div className="absolute top-2 left-2 z-10">
              <motion.div
                animate={{ scale: [1, 1.08, 0.96, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 text-[10px] font-bold px-2 py-0.5 shadow-md shadow-red-500/20 offer-badge-glow relative overflow-hidden r41-badge-oferta">
                  <Zap className="h-2.5 w-2.5 mr-0.5 fill-white relative z-[1]" />
                  <span className="relative z-[1]">Oferta</span>
                  <span className="r33-product-card-oferta-shimmer" />
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
                transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
              >
                <Badge className="bg-primary text-primary-foreground border-0 text-[10px] px-1.5 py-0 shadow-sm relative overflow-hidden r41-badge-novo">
                  <span className="badge-shimmer">Novo</span>
                </Badge>
              </motion.div>
            </div>
          )}

          {/* Eco badge */}
          {isEco && (
            <div className="absolute top-2 left-2 z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
              >
                <Badge className="bg-emerald-600 text-white border-0 text-[10px] font-bold px-1.5 py-0 shadow-sm flex items-center gap-0.5 r41-badge-eco">
                  <Leaf className="h-2.5 w-2.5" />
                  Eco
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
            className={`absolute z-10 h-7 w-7 rounded-full bg-white/80 dark:bg-black/40 flex items-center justify-center hover:bg-white dark:hover:bg-black/60 transition-colors heart-tap ${
              showFreeShipping && !product.isOffer && discount === 0 ? 'top-12 left-2' : 'top-2 right-2'
            }`}
            aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <motion.div
              whileTap={{ scale: 0.6 }}
              animate={isFav 
                ? { scale: [1, 1.5, 0.8, 1.2, 1], rotate: [0, -15, 10, -5, 0] } 
                : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <Heart className={`h-3.5 w-3.5 transition-colors duration-200 ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground group-hover:text-red-400'}`} />
            </motion.div>
            {/* Heart burst particles on favorite */}
            <AnimatePresence>
              {isFav && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-red-400"
                      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                      animate={{
                        x: Math.cos((i * 60) * Math.PI / 180) * 16,
                        y: Math.sin((i * 60) * Math.PI / 180) * 16,
                        scale: 0,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* ─── Quick-action overlay on hover (floating action bar) ─── */}
          <AnimatePresence>
            {showCartBtn && !showMiniCart && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
                className="absolute bottom-0 left-0 right-0 z-10"
                style={{ transform: `translate(${magneticOffset.x}px, ${magneticOffset.y}px)` }}
              >
                {/* Floating action pill bar */}
                <div className="flex justify-center mb-1.5">
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-1.5 py-1 shadow-lg r41-quick-bar">
                    {/* Favorite */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleFavoriteClick}
                      className="h-7 w-7 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors r41-quick-item"
                      style={{ transitionDelay: '0ms' }}
                      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-red-400 text-red-400' : ''}`} />
                    </motion.button>

                    {/* Quick View */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleQuickView}
                      className="h-7 w-7 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors r41-quick-item"
                      style={{ transitionDelay: '60ms' }}
                      aria-label="Visualização rápida"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </motion.button>

                    {/* Share */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className="h-7 w-7 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors relative r41-quick-item"
                      style={{ transitionDelay: '120ms' }}
                      aria-label="Compartilhar produto"
                    >
                      <AnimatePresence mode="wait">
                        {shareClicked ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-300" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="share"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>

                {/* Quick add to cart button */}
                <div className="px-2 pb-2">
                  <motion.div className="r41-btn-shimmer">
                    <Button
                      size="sm"
                      className={`w-full h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-lg transition-transform btn-glow r41-btn-pulse ${
                        cartAnimating ? 'scale-95' : 'scale-100'
                      }`}
                      onClick={handleAddToCart}
                    >
                      <motion.div
                        animate={cartAnimating ? { scale: [1, 1.4, 1], rotate: [0, -15, 0] } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        <AnimatePresence mode="wait">
                          {showCheckmark ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-center justify-center r41-check-pop"
                            >
                              <Check className="h-3 w-3 mr-1" strokeWidth={3} />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="cart"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      {showCheckmark ? 'Adicionado!' : 'Adicionar'}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compare button — only on hover */}
          <AnimatePresence>
            {showCartBtn && !showMiniCart && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCompareProduct(product.id)
                }}
                className={`absolute top-2 left-2 z-10 h-6 w-6 rounded-md flex items-center justify-center transition-colors ${
                  discount === 0 && !product.isOffer && !product.isNew
                    ? 'left-auto right-12'
                    : 'bottom-14 left-2 top-auto'
                } ${isCompared
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60'
                }`}
                aria-label={isCompared ? 'Remover da comparação' : 'Adicionar à comparação'}
              >
                <GitCompareArrows className={`h-3 w-3 ${isCompared ? '' : 'text-muted-foreground'}`} />
              </motion.button>
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
            {/* Large, bold price — with spring bounce animation on mount + shimmer */}
            <div className={`flex items-baseline gap-1.5 relative overflow-hidden rounded${product.comparePrice && product.comparePrice > product.price ? ' r33-product-card-price-flash' : ''}`}>
              <motion.span
                className="text-base font-extrabold text-primary leading-none relative r41-price-gradient" 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 15, delay: Math.min(index * 0.05 + 0.3, 0.7) }}
              >
                <span className="price-shimmer-text">{formatBRL(product.price)}</span>
              </motion.span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-[10px] text-muted-foreground line-through r41-price-strike">
                  {formatBRL(product.comparePrice)}
                </span>
              )}
            </div>
            
            {/* Rating stars + review count — with shimmer */}
            {product.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <StarRating rating={product.rating} />
                <span className="text-[10px] text-muted-foreground ml-0.5">
                  ({product.totalReviews})
                </span>
              </div>
            )}

            {/* Stock urgency text for very low stock — enhanced pulse */}
            {product.stock > 0 && product.stock < 5 && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                className="mt-1"
              >
                <span className="text-[9px] font-bold text-red-500 flex items-center gap-0.5 stock-pulse-badge">
                  <motion.span
                    animate={{ scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
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

          {/* ─── Persistent mini action bar (always visible, all screen sizes) ─── */}
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleFavoriteClick}
              className="h-7 w-7 rounded-lg flex items-center justify-center bg-muted/60 hover:bg-muted transition-colors"
              aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart className={`h-3.5 w-3.5 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleQuickView}
              className="h-7 w-7 rounded-lg flex items-center justify-center bg-muted/60 hover:bg-muted transition-colors"
              aria-label="Visualização rápida"
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleAddToCart}
              className="h-7 w-7 rounded-lg flex items-center justify-center bg-muted/60 hover:bg-muted transition-colors"
              aria-label="Adicionar ao carrinho"
            >
              <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.button>
          </div>
        </div>

      </motion.div>
    </>
  )
}

export { formatBRL, CategoryIcon }
