'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, ChevronRight, Flame, ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { formatBRL, CategoryIcon } from '@/components/product/ProductCard'
import { resolveProductImage } from '@/lib/product-images'

const dailyDeals: ProductData[] = [
  { id: 'dd1', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Arroz Tio João 5kg', slug: 'arroz-tio-joao', description: 'Arroz tipo 1 premium para sua família.', price: 24.90, comparePrice: 29.90, images: '[]', stock: 15, rating: 4.5, totalReviews: 23, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["5kg","1kg"]', category: 'FOOD' },
  { id: 'dd2', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí 500ml', slug: 'acai-500ml', description: 'Açaí cremoso feito com frutas frescas do Pará.', price: 15.00, comparePrice: 18.00, images: '[]', stock: 20, rating: 4.9, totalReviews: 89, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["300ml","500ml","700ml"]', category: 'FOOD' },
  { id: 'dd3', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: null, name: 'Vitamina C 500mg', slug: 'vitamina-c', description: 'Pote com 60 cápsulas.', price: 35.00, comparePrice: 42.00, images: '[]', stock: 8, rating: 4.7, totalReviews: 34, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["500mg","1000mg"]', category: 'HEALTH' },
  { id: 'dd4', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: null, name: 'Bolo de Chocolate', slug: 'bolo-chocolate', description: 'Bolo de chocolate com cobertura de ganache.', price: 32.00, comparePrice: 39.90, images: '[]', stock: 5, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'dd5', storeId: 's3', storeName: 'Agropecuária São Paulo', storeLogo: null, name: 'Muda de Cupuaçu', slug: 'muda-cupuacu', description: 'Muda de cupuaçuzeiro pronta para plantio.', price: 25.00, comparePrice: 35.00, images: '[]', stock: 12, rating: 4.8, totalReviews: 5, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'AGRICULTURE' },
  { id: 'dd6', storeId: 's7', storeName: 'Pet Shop Amigo Fiel', storeLogo: null, name: 'Ração Premium 15kg', slug: 'racao-premium', description: 'Ração super premium para cães adultos.', price: 89.90, comparePrice: 109.90, images: '[]', stock: 3, rating: 4.6, totalReviews: 28, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'ANIMALS' },
]

function CountdownTimer({ expiry }: { expiry: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculate = () => {
      const now = new Date()
      const end = new Date(expiry)
      const diff = Math.max(0, end.getTime() - now.getTime())
      
      if (diff <= 0) {
        setTimeLeft('Encerrada')
        return
      }
      
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      
      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
    }
    
    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [expiry])

  return (
    <span className="font-mono text-xs font-bold">{timeLeft}</span>
  )
}

export function DailyDeals() {
  const { navigate, selectProduct, addToCart } = useAppStore()
  const [featuredIndex, setFeaturedIndex] = useState(0)

  // Auto-rotate featured deal every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % dailyDeals.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  // Calculate deal expiry (end of today)
  const dealExpiry = useCallback(() => {
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    return end.toISOString()
  }, [])

  const handleProductClick = (product: ProductData) => {
    selectProduct(product)
    navigate('product')
  }

  const handleQuickAdd = (e: React.MouseEvent, product: ProductData) => {
    e.stopPropagation()
    addToCart(product, product.storeName || 'Loja')
  }

  const featured = dailyDeals[featuredIndex]
  const featuredDiscount = featured.comparePrice 
    ? Math.round(((featured.comparePrice - featured.price) / featured.comparePrice) * 100)
    : 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold">Ofertas do Dia</h2>
            <p className="text-[10px] text-muted-foreground">Preços exclusivos até às 23:59</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            <CountdownTimer expiry={dealExpiry()} />
          </div>
        </div>
      </div>

      {/* Featured deal - large card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={featured.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          onClick={() => handleProductClick(featured)}
          className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 p-4 cursor-pointer overflow-hidden group hover:shadow-lg transition-shadow"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-tr-full" />
          
          {/* Badge */}
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] font-semibold mb-3 flex items-center gap-1">
            <Flame className="h-3 w-3" />
            Oferta exclusiva
          </Badge>

          <div className="relative flex gap-4">
            <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
              {(() => {
                const imgUrl = resolveProductImage({ slug: featured.slug, category: featured.category, images: featured.images })
                return imgUrl ? (
                  <img src={imgUrl} alt={featured.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : null
              })()}
              <CategoryIcon category={featured.category} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium">{featured.storeName}</p>
              <h3 className="font-bold text-sm mt-0.5 line-clamp-2">{featured.name}</h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-lg font-bold text-primary">{formatBRL(featured.price)}</span>
                {featured.comparePrice && (
                  <span className="text-xs text-muted-foreground line-through">{formatBRL(featured.comparePrice)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {featuredDiscount > 0 && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">
                    -{featuredDiscount}%
                  </span>
                )}
                <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {featured.stock <= 5 ? `Apenas ${featured.stock} unidades!` : `${featured.stock} disponíveis`}
                </span>
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {dailyDeals.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === featuredIndex ? 16 : 6,
                  opacity: i === featuredIndex ? 1 : 0.4,
                }}
                className="h-1.5 rounded-full bg-amber-500"
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Deal cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {dailyDeals.map((product, index) => {
          const discount = product.comparePrice
            ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
            : 0
          const imgUrl = resolveProductImage({ slug: product.slug, category: product.category, images: product.images })

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -3 }}
              onClick={() => handleProductClick(product)}
              className="bg-card rounded-xl border border-border p-3 cursor-pointer hover:border-amber-200/50 dark:hover:border-amber-800/30 hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Exclusive badge */}
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[8px] font-bold px-1.5 py-0 z-10 flex items-center gap-0.5">
                <Flame className="h-2 w-2" />
                -{discount}%
              </Badge>

              {/* Image */}
              <div className="h-16 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center mt-1 mb-2 group-hover:scale-105 transition-transform overflow-hidden relative">
                {imgUrl ? (
                  <img src={imgUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : null}
                <CategoryIcon category={product.category} />
              </div>

              {/* Info */}
              <p className="text-[10px] text-muted-foreground truncate">{product.storeName}</p>
              <h4 className="text-xs font-semibold line-clamp-1 mt-0.5">{product.name}</h4>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
                {product.comparePrice && (
                  <span className="text-[9px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
                )}
              </div>

              {/* Stock indicator */}
              {product.stock <= 10 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(product.stock / 20) * 100}%` }}
                      viewport={{ once: true }}
                      className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
                    />
                  </div>
                  <p className="text-[9px] text-red-500 font-medium mt-0.5">Últimas unidades!</p>
                </div>
              )}

              {/* Quick add button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleQuickAdd(e, product)}
                className="w-full mt-2 h-7 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                Adicionar
              </motion.button>
            </motion.div>
          )
        })}
      </div>

      {/* CTA */}
      <motion.div whileTap={{ scale: 0.98 }} className="flex justify-center">
        <Button
          variant="outline"
          className="h-9 text-xs gap-1.5 border-primary/20 hover:bg-primary/5 text-primary"
          onClick={() => useAppStore.getState().openSearch()}
        >
          Ver todas as ofertas
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </motion.div>
    </motion.section>
  )
}
