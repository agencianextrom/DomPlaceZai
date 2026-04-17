'use client'

import { useState } from 'react'
import { ArrowLeft, Star, Heart, ShoppingCart, Share2, Store, Clock, Phone, MapPin, Minus, Plus, MessageCircle, Package, Scale, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { formatBRL, CategoryIcon } from './ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

interface ProductDetailProps {
  product: ProductData
}

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
  'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
  'from-lime-100 to-green-200 dark:from-lime-900/30 dark:to-green-800/30',
]

// Demo reviews
const demoReviews = [
  {
    id: 'r1',
    name: 'Maria Silva',
    avatar: 'M',
    rating: 5,
    date: '2 dias atrás',
    comment: 'Produto excelente! Entrega rápida e chegou bem embalado. Super recomendo!',
  },
  {
    id: 'r2',
    name: 'João Santos',
    avatar: 'J',
    rating: 4,
    date: '1 semana atrás',
    comment: 'Boa qualidade pelo preço. A entrega demorou um pouco mais que o esperado, mas no geral estou satisfeito.',
  },
  {
    id: 'r3',
    name: 'Ana Oliveira',
    avatar: 'A',
    rating: 5,
    date: '2 semanas atrás',
    comment: 'Sempre compro aqui. Produtos frescos e preços justos. A melhor loja de Dom Eliseu!',
  },
]

export function ProductDetail({ product }: ProductDetailProps) {
  const { goBack, navigate, selectStore, addToCart, isFavoriteProduct, toggleFavoriteProduct, selectedProduct } = useAppStore()
  const [quantity, setQuantity] = useState(1)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [shareTooltip, setShareTooltip] = useState(false)
  
  const isFav = isFavoriteProduct(product.id)
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0
  
  const gradient = gradients[Math.abs(product.name.charCodeAt(0)) % gradients.length]
  
  const variations = product.variations ? JSON.parse(product.variations) : []

  // Similar products (mock - pick from same category, different product)
  const similarProducts: ProductData[] = []

  const handleBuyNow = () => {
    addToCart(product, product.storeName || 'Loja', quantity)
    navigate('cart')
  }

  const handleAddToCart = () => {
    addToCart(product, product.storeName || 'Loja', quantity)
  }

  const handleShare = () => {
    setShareTooltip(true)
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Confira ${product.name} por ${formatBRL(product.price)} no DomPlace!`,
        url: window.location.href,
      }).catch(() => {})
    }
    setTimeout(() => setShareTooltip(false), 2000)
  }
  
  return (
    <div className="max-w-3xl mx-auto pb-28 md:pb-24">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-sm font-semibold truncate mx-4 flex-1 text-center">{product.name}</h2>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10"
              onClick={() => toggleFavoriteProduct(product.id)}
            >
              <Heart className={`h-5 w-5 transition-colors ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Large Product Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative aspect-[4/3] sm:aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <motion.div 
          className="relative z-10 h-24 w-24 sm:h-32 sm:w-32 rounded-3xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-md"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="scale-150">
            <CategoryIcon category={product.category} />
          </div>
        </motion.div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <Badge className="bg-red-500 text-white border-0 text-sm px-3 py-1 shadow-lg">
              -{discount}% OFF
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-primary text-primary-foreground border-0 text-sm px-3 py-1 shadow-lg">
              Novo
            </Badge>
          )}
          {product.isOffer && !discount && (
            <Badge className="bg-amber-500 text-white border-0 text-sm px-3 py-1 shadow-lg">
              Oferta
            </Badge>
          )}
        </div>
      </motion.div>
      
      {/* Info */}
      <div className="px-1 mt-4">
        {/* Store link */}
        {product.storeName && (
          <button
            onClick={() => {
              if (product.storeId) {
                selectStore({
                  id: product.storeId,
                  name: product.storeName,
                  slug: product.slug,
                  description: null,
                  category: product.category,
                  logo: product.storeLogo || null,
                  coverImage: null,
                  phone: null,
                  whatsapp: null,
                  address: null,
                  neighborhood: null,
                  city: 'Dom Eliseu',
                  state: 'PA',
                  deliveryFee: 5,
                  freeDeliveryAbove: null,
                  rating: product.rating,
                  totalReviews: product.totalReviews,
                  opensAt: null,
                  closesAt: null,
                  openDays: '1,2,3,4,5,6,7',
                })
                navigate('store')
              }
            }}
            className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            <Store className="h-4 w-4" />
            {product.storeName}
            <ChevronDown className="h-3 w-3" />
          </button>
        )}
        
        <h1 className="text-xl sm:text-2xl font-bold mt-2">{product.name}</h1>
        
        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${s <= Math.round(product.rating) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating.toFixed(1)} ({product.totalReviews} avaliações)
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-baseline gap-3 mt-3">
          <span className="text-2xl sm:text-3xl font-bold text-primary">{formatBRL(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-lg text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
          )}
        </div>

        {/* Product specs */}
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <Package className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">Estoque</p>
              <p className="font-semibold text-xs">{product.stock > 50 ? 'Disponível' : product.stock > 0 ? `${product.stock} un.` : 'Esgotado'}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <Scale className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">Categoria</p>
              <p className="font-semibold text-xs capitalize">{product.category.replace(/_/g, ' ')}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <CheckCircle className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
              <p className="text-[10px] text-muted-foreground">Garantia</p>
              <p className="font-semibold text-xs">Satisfação</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <Store className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">Entrega</p>
              <p className="font-semibold text-xs">A combinar</p>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Description */}
        {product.description && (
          <div>
            <h3 className="font-semibold mb-2">Descrição</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {showFullDescription || product.description.length < 120 
                ? product.description 
                : `${product.description.slice(0, 120)}...`}
            </p>
            {product.description.length > 120 && (
              <button 
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm text-primary hover:underline mt-1 flex items-center gap-1"
              >
                {showFullDescription ? 'Ver menos' : 'Ver mais'}
                {showFullDescription ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        )}
        
        {/* Variations */}
        {variations.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Variações</h3>
            <div className="flex flex-wrap gap-2">
              {variations.map((v: string) => (
                <Badge key={v} variant="outline" className="px-3 py-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {v}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Separator className="my-4" />
        
        {/* Quantity */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Quantidade</h3>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(quantity + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator className="my-4" />
        
        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              Avaliações
            </h3>
            <span className="text-sm text-muted-foreground">{product.totalReviews} avaliações</span>
          </div>
          
          <div className="space-y-4">
            {demoReviews.map((review) => (
              <Card key={review.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {review.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{review.name}</p>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${s <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Similar products */}
        <div>
          <h3 className="font-semibold mb-4">Produtos similares</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {similarProducts.length > 0 ? similarProducts.slice(0, 4).map(p => (
              <motion.div
                key={p.id}
                whileHover={{ y: -2 }}
                className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer"
                onClick={() => {
                  useAppStore.getState().selectProduct(p)
                  navigate('product')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <CategoryIcon category={p.category} />
                </div>
                <div className="p-2">
                  <h4 className="text-xs font-semibold line-clamp-2">{p.name}</h4>
                  <p className="text-sm font-bold text-primary mt-1">{formatBRL(p.price)}</p>
                </div>
              </motion.div>
            )) : (
              <p className="text-sm text-muted-foreground col-span-2 sm:col-span-4 text-center py-4">
                Nenhum produto similar disponível
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Sticky bottom bar - like modern e-commerce */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-primary">{formatBRL(product.price * quantity)}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-12 px-4 border-primary text-primary hidden sm:flex"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
            <Button
              className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              onClick={handleBuyNow}
            >
              <ShoppingCart className="h-4 w-4 mr-2 sm:hidden" />
              Comprar agora
            </Button>
          </div>
        </div>
        {/* iOS safe area */}
        <div className="h-[env(safe-area-inset-bottom)] md:hidden" />
      </div>
    </div>
  )
}
