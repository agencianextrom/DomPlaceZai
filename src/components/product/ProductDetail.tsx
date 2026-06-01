'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { ArrowLeft, Heart, ShoppingCart, Store, Package, Scale, CheckCircle, ChevronDown, ChevronUp, Truck, Tag, ShieldCheck, Zap, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { formatBRL, CategoryIcon } from './ProductCard'
import { StarRating } from '@/components/ui/StarRating'
import { ShareButton } from './ShareButton'
import { ProductReviews } from './ProductReviews'
import { ProductGallery } from './ProductGallery'
import { DeliveryTimeCalculator } from './DeliveryTimeCalculator'
import { PriceDropAlert } from './PriceDropAlert'
import { SocialProofBadges } from './SocialProofBadges'
import { StockUrgency } from './StockUrgency'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

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


// Trust badges
const trustBadges = [
  { icon: ShieldCheck, label: 'Garantia de satisfação', desc: 'Devolução fácil em até 7 dias', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { icon: Truck, label: 'Entrega rápida', desc: 'Receba em 30-45 minutos', color: 'text-primary', bg: 'bg-primary/5' },
  { icon: Zap, label: 'Pagamento seguro', desc: 'Pix, cartão e dinheiro', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
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

// "Frequently bought together" mock data
const frequentlyBoughtTogether: ProductData[] = [
  { id: 'fbt1', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Açúcar Cristal 1kg', slug: 'acucar-cristal', description: 'Açúcar cristal premium.', price: 5.49, comparePrice: null, images: '[]', stock: 120, rating: 4.2, totalReviews: 18, isFeatured: false, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'fbt2', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Café Torrado 500g', slug: 'cafe-torrado', description: 'Café premium.', price: 18.90, comparePrice: 22.00, images: '[]', stock: 60, rating: 4.6, totalReviews: 32, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD' },
]

export function ProductDetail({ product }: ProductDetailProps) {
  const { goBack, navigate, selectStore, addToCart, isFavoriteProduct, toggleFavoriteProduct } = useAppStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [similarProducts, setSimilarProducts] = useState<ProductData[]>(mockSimilarProducts)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [bundleAdded, setBundleAdded] = useState(false)
  const buySectionRef = useRef<HTMLDivElement>(null)
  
  const isFav = isFavoriteProduct(product.id)
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0
  
  const gradient = gradients[Math.abs(product.name.charCodeAt(0)) % gradients.length]
  
  const variations = product.variations ? JSON.parse(product.variations) : []
  const tags = product.tags ? JSON.parse(product.tags) : []

  useEffect(() => {
    // Set default variation
    if (variations.length > 0 && !selectedVariation) {
      setSelectedVariation(variations[0])
    }
  }, [variations, selectedVariation])

  // Show sticky bar when scrolled past the buy section
  useEffect(() => {
    const handleScroll = () => {
      if (!buySectionRef.current) return
      const rect = buySectionRef.current.getBoundingClientRect()
      setShowStickyBar(rect.bottom < 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  // Calculate "frequently bought together" total
  const fbtTotal = product.price + frequentlyBoughtTogether.reduce((sum, p) => sum + p.price, 0)
  const fbtSavings = frequentlyBoughtTogether.reduce((sum, p) => sum + ((p.comparePrice || p.price) - p.price), 0)
  // Bundle discount: 10% off the combined price
  const bundleDiscount = Math.round(fbtTotal * 0.10 * 100) / 100
  const bundleTotal = Math.round((fbtTotal - bundleDiscount) * 100) / 100

  const handleAddBundle = () => {
    // Add main product
    addToCart(product, product.storeName || 'Loja', quantity)
    // Add bundle items
    frequentlyBoughtTogether.forEach(p => {
      addToCart(p, p.storeName || 'Loja', 1)
    })
    setBundleAdded(true)
    toast.success('Kit completo adicionado ao carrinho!', {
      description: `Economize ${formatBRL(bundleDiscount)} comprando juntos`,
    })
    setTimeout(() => setBundleAdded(false), 3000)
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
              <motion.div whileTap={{ scale: 1.3 }}>
                <Heart className={`h-5 w-5 transition-colors ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
              </motion.div>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Large Product Image — ProductGallery component */}
      <ProductGallery
        images={product.images && product.images !== '[]' ? JSON.parse(product.images) : undefined}
        productName={product.name}
        category={product.category}
        count={5}
      />
      
      {/* Info */}
      <div className="px-1 mt-4">
        {/* Store link */}
        {product.storeName && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            onClick={() => {
              if (product.storeId) {
                selectStore({
                  id: product.storeId,
                  name: product.storeName || '',
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
          </motion.button>
        )}
        
        <h1 className="text-xl sm:text-2xl font-bold mt-2">{product.name}</h1>
        
        {/* Rating using StarRating */}
        {product.rating > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2 mt-2"
          >
            <StarRating rating={product.rating} size="sm" showCount count={product.totalReviews} />
          </motion.div>
        )}
        
        {/* Price Drop Alert Card */}
        {product.comparePrice && product.comparePrice > product.price && discount >= 5 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3"
          >
            <PriceDropAlert
              price={product.price}
              comparePrice={product.comparePrice}
              dropDaysAgo={1}
              isLowest={product.isOffer}
              size="lg"
              variant="card"
            />
          </motion.div>
        )}

        {/* Price */}
        {!product.comparePrice && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-baseline gap-3 mt-3"
          >
            <span className="text-2xl sm:text-3xl font-bold text-primary">{formatBRL(product.price)}</span>
          </motion.div>
        )}

        {/* Product specs */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-4"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { icon: Package, label: 'Estoque', value: product.stock > 50 ? 'Disponível' : product.stock > 0 ? `${product.stock} un.` : 'Esgotado', iconColor: 'text-muted-foreground' },
              { icon: Scale, label: 'Categoria', value: product.category.replace(/_/g, ' '), iconColor: 'text-muted-foreground' },
              { icon: CheckCircle, label: 'Garantia', value: 'Satisfação', iconColor: 'text-emerald-500' },
              { icon: Truck, label: 'Entrega', value: '30-45 min', iconColor: 'text-primary' },
            ].map((spec, i) => (
              <motion.div 
                key={spec.label}
                className="bg-secondary/50 rounded-lg p-3 text-center card-spotlight"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
              >
                <spec.icon className={`h-4 w-4 mx-auto mb-1 ${spec.iconColor}`} />
                <p className="text-[10px] text-muted-foreground">{spec.label}</p>
                <p className="font-semibold text-xs">{spec.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Proof - full badges below main image */}
        <SocialProofBadges
          productId={product.id}
          productName={product.name}
          variant="detail"
          totalReviews={product.totalReviews}
        />

        <StockUrgency product={product} variant="detail" />

        {/* Trust badges section */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-4 grid grid-cols-3 gap-2"
        >
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${badge.bg} border border-border/50 hover-glow-soft cursor-default`}
            >
              <badge.icon className={`h-5 w-5 ${badge.color}`} />
              <span className="text-[10px] font-semibold text-center leading-tight">{badge.label}</span>
              <span className="text-[9px] text-muted-foreground text-center leading-tight">{badge.desc}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Delivery info */}
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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

        {/* Delivery Time Calculator */}
        <DeliveryTimeCalculator
          storeName={product.storeName || undefined}
          deliveryFee={5}
          freeDeliveryAbove={50}
        />

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

        {/* Variations — improved pill styling */}
        {variations.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">
              Variações
              {selectedVariation && <span className="text-primary ml-1 text-sm font-normal">· {selectedVariation}</span>}
            </h3>
            <div className="flex flex-wrap gap-2">
              {variations.map((v: string) => {
                const isSelected = selectedVariation === v
                return (
                  <motion.button
                    key={v}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedVariation(v)}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-md'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-foreground'
                    }`}
                  >
                    {v}
                    {isSelected && (
                      <motion.div
                        layoutId="variation-check"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}
        
        <Separator className="my-4" />
        
        {/* Quantity - using QuantityStepper component */}
        <div ref={buySectionRef}>
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={product.stock}
            size="md"
            showLabel
            label="Quantidade"
          />
        </div>

        <Separator className="my-4" />
        
        {/* Reviews */}
        <ProductReviews 
          productId={product.id} 
          productRating={product.rating} 
          totalReviews={product.totalReviews} 
        />

        <Separator className="my-4" />

        {/* Frequently bought together */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-2"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            Compre junto
            <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30">
              Economize {formatBRL(bundleDiscount)}
            </Badge>
          </h3>
          <Card className="border-primary/20 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Main product */}
                <motion.div
                  className="flex items-center gap-3 flex-1 min-w-0"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm relative`}>
                    <CategoryIcon category={product.category} />
                    <motion.div
                      animate={bundleAdded ? { scale: [0, 1] } : {}}
                      className={`absolute inset-0 rounded-xl bg-primary/80 flex items-center justify-center ${bundleAdded ? '' : 'hidden'}`}
                    >
                      <Check className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold line-clamp-2">{product.name}</p>
                    <p className="text-sm font-bold text-primary">{formatBRL(product.price)}</p>
                  </div>
                </motion.div>
                
                {/* Plus signs */}
                {frequentlyBoughtTogether.map((fbt, fbtIdx) => (
                  <Fragment key={fbt.id}>
                    <div className="hidden sm:flex h-8 w-8 rounded-full bg-muted items-center justify-center shrink-0">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="sm:hidden flex h-6 w-6 rounded-full bg-muted items-center justify-center shrink-0">
                      <Plus className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <motion.div
                      className="flex items-center gap-3 flex-1 min-w-0"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30 flex items-center justify-center shrink-0 shadow-sm relative">
                        <CategoryIcon category={fbt.category} />
                        <motion.div
                          animate={bundleAdded ? { scale: [0, 1] } : {}}
                          transition={{ delay: 0.1 + fbtIdx * 0.1 }}
                          className={`absolute inset-0 rounded-xl bg-primary/80 flex items-center justify-center ${bundleAdded ? '' : 'hidden'}`}
                        >
                          <Check className="h-6 w-6 text-white" />
                        </motion.div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold line-clamp-2">{fbt.name}</p>
                        <p className="text-sm font-bold text-primary">{formatBRL(fbt.price)}</p>
                      </div>
                    </motion.div>
                  </Fragment>
                ))}

                {/* Total */}
                <div className="w-full sm:w-auto pt-3 sm:pt-0 sm:ml-2">
                  <div className="bg-gradient-to-r from-primary/5 to-amber-500/5 rounded-xl p-3 border border-primary/10 text-center sm:text-left sm:min-w-[130px]">
                    <p className="text-[10px] text-muted-foreground">Kit completo</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg font-bold text-primary">{formatBRL(bundleTotal)}</p>
                      <span className="text-xs text-muted-foreground line-through">{formatBRL(fbtTotal)}</span>
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                      <Tag className="h-3 w-3" />
                      Economize {formatBRL(bundleDiscount)} comprando juntos
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={bundleAdded ? 'added' : 'add'}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        {bundleAdded ? (
                          <Button size="sm" className="w-full mt-2 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                              <Check className="h-3.5 w-3.5" />
                            </motion.div>
                            Adicionados!
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={handleAddBundle}
                            className="w-full mt-2 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg btn-glow gap-1"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Adicionar todos ao carrinho
                          </Button>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-4" />

        {/* Similar products */}
        <div>
          <h3 className="font-semibold mb-4">Produtos similares</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {similarProducts.length > 0 ? similarProducts.slice(0, 6).map((p, i) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -3 }}
                className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer card-spotlight hover:shadow-lg transition-shadow"
                onClick={() => {
                  useAppStore.getState().selectProduct(p)
                  navigate('product')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
                  <CategoryIcon category={p.category} />
                  {p.isOffer && p.comparePrice && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[9px] px-1.5 py-0 font-bold">
                      -{Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)}%
                    </Badge>
                  )}
                </div>
                <div className="p-2.5">
                  <h4 className="text-xs font-semibold line-clamp-2">{p.name}</h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <p className="text-sm font-bold text-primary">{formatBRL(p.price)}</p>
                    {p.comparePrice && p.comparePrice > p.price && (
                      <span className="text-[10px] text-muted-foreground line-through-animated">{formatBRL(p.comparePrice)}</span>
                    )}
                  </div>
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
          <Card className="border-primary/20 cursor-pointer hover:shadow-md transition-shadow card-spotlight" onClick={() => {
            if (product.storeId) {
              selectStore({
                id: product.storeId,
                name: product.storeName || '',
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
              <Badge variant="outline" className="text-[10px] shrink-0 hover:bg-primary/5">
                Ver loja
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Sticky bottom bar — appears when scrolling past buy section */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] glow-edge-bottom"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{product.name}</p>
                  <p className="text-lg font-bold text-primary text-gradient-primary">{formatBRL(product.price * quantity)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="h-11 px-4 border-primary text-primary hidden sm:flex hover-glow-soft"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                  <Button
                    className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold btn-glow btn-shine"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible bottom buy section (shown when sticky is hidden) */}
      <AnimatePresence>
        {!showStickyBar && (
          <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 glow-edge-bottom">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-primary text-gradient-primary">{formatBRL(product.price * quantity)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="h-12 px-4 border-primary text-primary hidden sm:flex hover-glow-soft"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                  <Button
                    className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold btn-glow btn-shine"
                    onClick={handleBuyNow}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2 sm:hidden" />
                    Comprar agora
                  </Button>
                </div>
              </div>
              <ShareButton productName={product.name} productPrice={product.price} storeName={product.storeName || 'Loja'} />
              {/* iOS safe area */}
              <div className="h-[env(safe-area-inset-bottom)] md:hidden" />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}


