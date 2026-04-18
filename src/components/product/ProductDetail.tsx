'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Heart, ShoppingCart, Store, Clock, Package, Scale, CheckCircle, ChevronDown, ChevronUp, Truck, Tag, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { formatBRL, CategoryIcon } from './ProductCard'
import { StarRating } from '@/components/ui/StarRating'
import { ShareButton } from './ShareButton'
import { ProductReviews } from './ProductReviews'
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



// Mock similar products
const mockSimilarProducts: ProductData[] = [
  { id: 'sp1', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Açúcar Cristal 1kg', slug: 'acucar-cristal', description: 'Açúcar cristal de alta qualidade.', price: 5.49, comparePrice: null, images: '[]', stock: 120, rating: 4.2, totalReviews: 18, isFeatured: false, isNew: false, isOffer: false, tags: '["básico"]', variations: null, category: 'FOOD' },
  { id: 'sp2', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Café Torrado 500g', slug: 'cafe-torrado', description: 'Café premium torrado e moído.', price: 18.90, comparePrice: 22.00, images: '[]', stock: 60, rating: 4.6, totalReviews: 32, isFeatured: true, isNew: false, isOffer: true, tags: '["popular"]', variations: '["250g","500g"]', category: 'FOOD' },
  { id: 'sp3', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Macarrão Espaguete 500g', slug: 'macarrao-espaguete', description: 'Macarrão espaguete tipo italiano.', price: 4.90, comparePrice: null, images: '[]', stock: 90, rating: 4.4, totalReviews: 22, isFeatured: false, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'sp4', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí com Granola 300ml', slug: 'acai-granola', description: 'Açaí cremoso com granola crocante.', price: 12.00, comparePrice: null, images: '[]', stock: 80, rating: 4.7, totalReviews: 56, isFeatured: false, isNew: true, isOffer: false, tags: '["infantil"]', variations: null, category: 'FOOD' },
  { id: 'sp5', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Leite Integral 1L', slug: 'leite-integral', description: 'Leite integral pasteurizado.', price: 6.90, comparePrice: 7.50, images: '[]', stock: 150, rating: 4.3, totalReviews: 41, isFeatured: false, isNew: false, isOffer: true, tags: '["básico","popular"]', variations: null, category: 'FOOD' },
  { id: 'sp6', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Smoothie de Açaí', slug: 'smoothie-acai', description: 'Smoothie refrescante de açaí com frutas.', price: 18.00, comparePrice: null, images: '[]', stock: 40, rating: 4.8, totalReviews: 28, isFeatured: true, isNew: true, isOffer: false, tags: '["novidade"]', variations: null, category: 'FOOD' },
]

export function ProductDetail({ product }: ProductDetailProps) {
  const { goBack, navigate, selectStore, addToCart, isFavoriteProduct, toggleFavoriteProduct } = useAppStore()
  const [quantity, setQuantity] = useState(1)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [similarProducts, setSimilarProducts] = useState<ProductData[]>(mockSimilarProducts)
  
  const isFav = isFavoriteProduct(product.id)
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0
  
  const gradient = gradients[Math.abs(product.name.charCodeAt(0)) % gradients.length]
  
  const variations = product.variations ? JSON.parse(product.variations) : []
  const tags = product.tags ? JSON.parse(product.tags) : []

  // Try to fetch similar products from API
  useEffect(() => {
    let cancelled = false
    const fetchSimilar = async () => {
      try {
        const res = await fetch(`/api/products?limit=8&category=${product.category}`)
        const data = await res.json()
        if (!cancelled && data.products) {
          const filtered = (data.products as ProductData[])
            .filter(p => p.id !== product.id)
            .slice(0, 6)
          if (filtered.length > 0) setSimilarProducts(filtered)
        }
      } catch {
        // use mock data
      }
    }
    fetchSimilar()
    return () => { cancelled = true }
  }, [product.id, product.category])

  const handleBuyNow = () => {
    addToCart(product, product.storeName || 'Loja', quantity)
    navigate('cart')
  }

  const handleAddToCart = () => {
    addToCart(product, product.storeName || 'Loja', quantity)
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
        
        {/* Rating using StarRating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={product.rating} size="sm" showCount count={product.totalReviews} />
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
              <Truck className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-[10px] text-muted-foreground">Entrega</p>
              <p className="font-semibold text-xs">30-45 min</p>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-800/30"
        >
          <div className="flex items-center gap-3 text-sm">
            <Truck className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-xs">Entrega estimada: <span className="text-primary">30-45 min</span></p>
              <p className="text-[10px] text-muted-foreground">Taxa: R$5,00 · Grátis acima de R$50</p>
            </div>
          </div>
        </motion.div>
        
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
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-1 bg-secondary/80 hover:bg-secondary">
                  {tag}
                </Badge>
              ))}
            </div>
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
        <ProductReviews 
          productId={product.id} 
          productRating={product.rating} 
          totalReviews={product.totalReviews} 
        />

        <Separator className="my-4" />

        {/* Similar products */}
        <div>
          <h3 className="font-semibold mb-4">Produtos similares</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {similarProducts.length > 0 ? similarProducts.slice(0, 6).map(p => (
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
              <p className="text-sm text-muted-foreground col-span-2 sm:col-span-3 text-center py-4">
                Nenhum produto similar disponível
              </p>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* About the Store mini-card */}
        {product.storeName && (
          <Card className="border-primary/20 cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
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
          }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
                {product.storeName.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{product.storeName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating rating={product.rating} size="sm" />
                  <span className="text-[10px] text-muted-foreground">· 30-45 min</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">
                Ver loja
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Sticky bottom bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
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
          {/* Share button below buy */}
          <ShareButton productName={product.name} productPrice={product.price} storeName={product.storeName || 'Loja'} />
        </div>
        {/* iOS safe area */}
        <div className="h-[env(safe-area-inset-bottom)] md:hidden" />
      </div>
    </div>
  )
}
