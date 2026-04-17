'use client'

import { useState } from 'react'
import { ArrowLeft, Star, Heart, ShoppingCart, Share2, Store, Clock, Phone, MapPin, Minus, Plus, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { formatBRL } from './ProductCard'
import { motion } from 'framer-motion'

interface ProductDetailProps {
  product: ProductData
}

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
  'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
]

const icons = ['🍎', '🛒', '📦', '🎁', '🌿', '🍞', '💊', '🐕', '💇', '⚽', '📱', '👗']

export function ProductDetail({ product }: ProductDetailProps) {
  const { goBack, navigate, selectStore, addToCart } = useAppStore()
  const [quantity, setQuantity] = useState(1)
  const [isFav, setIsFav] = useState(false)
  
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0
  
  const gradient = gradients[Math.abs(product.name.charCodeAt(0)) % gradients.length]
  const icon = icons[Math.abs(product.name.charCodeAt(0)) % icons.length]
  
  const variations = product.variations ? JSON.parse(product.variations) : []
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setIsFav(!isFav)}>
              <Heart className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center rounded-none sm:rounded-2xl overflow-hidden`}
      >
        <span className="text-8xl">{icon}</span>
        {discount > 0 && (
          <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 text-sm px-2">
            -{discount}%
          </Badge>
        )}
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
        
        <Separator className="my-4" />
        
        {/* Description */}
        {product.description && (
          <div>
            <h3 className="font-semibold mb-2">Descrição</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
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
      </div>
      
      {/* Bottom bar */}
      <div className="sticky bottom-16 md:bottom-0 z-40 bg-background border-t border-border -mx-4 px-4 py-3 mt-6">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-12 flex-1 border-primary text-primary"
            onClick={() => addToCart(product, product.storeName || 'Loja', quantity)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Adicionar ao carrinho
          </Button>
          <Button
            className="h-12 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              addToCart(product, product.storeName || 'Loja', quantity)
              navigate('cart')
            }}
          >
            Comprar agora
          </Button>
        </div>
      </div>
    </div>
  )
}
