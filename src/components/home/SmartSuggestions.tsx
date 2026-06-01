'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, ChevronRight, ShoppingCart, Star, Store, TrendingUp,
  Heart, MapPin, Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
  'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
  'from-lime-100 to-green-200 dark:from-lime-900/30 dark:to-green-800/30',
  'from-orange-100 to-amber-200 dark:from-orange-900/30 dark:to-amber-800/30',
]

const categoryEmojis: Record<string, string> = {
  FOOD: '🍚', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱',
  BEAUTY: '💅', ANIMALS: '🐾', FASHION: '👗', SERVICES: '🔧',
  HOME_GARDEN: '🏠', EDUCATION: '📚', SPORTS: '⚽', OTHER: '📦',
}

const suggestionTags = [
  'Baseado nas suas compras',
  'Popular na sua região',
  'Loja favorita',
  'Tendência do momento',
  'Recomendado para você',
  'Quem comprou também comprou',
]

const mockSuggestions: ProductData[] = [
  { id: 'ss1', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Açúcar Cristal 1kg', slug: 'acucar-cristal', description: 'Açúcar cristal de alta qualidade para o dia a dia.', price: 5.49, comparePrice: 6.29, images: '[]', stock: 120, rating: 4.2, totalReviews: 18, isFeatured: false, isNew: false, isOffer: true, tags: '["básico"]', variations: null, category: 'FOOD' },
  { id: 'ss2', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: null, name: 'Bolo de Chocolate', slug: 'bolo-chocolate', description: 'Bolo de chocolate fofinho com cobertura de ganache.', price: 28.00, comparePrice: null, images: '[]', stock: 15, rating: 4.9, totalReviews: 67, isFeatured: true, isNew: true, isOffer: false, tags: '["popular","doce"]', variations: null, category: 'FOOD' },
  { id: 'ss3', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Smoothie de Açaí 500ml', slug: 'smoothie-acai', description: 'Smoothie refrescante com açaí, banana e granola.', price: 18.00, comparePrice: 22.00, images: '[]', stock: 40, rating: 4.8, totalReviews: 34, isFeatured: true, isNew: false, isOffer: true, tags: '["refrescante"]', variations: null, category: 'FOOD' },
  { id: 'ss4', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: null, name: 'Protetor Solar FPS 50', slug: 'protetor-solar', description: 'Protetor solar facial com FPS 50, ideal para o clima amazônico.', price: 45.90, comparePrice: null, images: '[]', stock: 80, rating: 4.6, totalReviews: 22, isFeatured: false, isNew: true, isOffer: false, tags: '["saúde","sol"]', variations: null, category: 'HEALTH' },
  { id: 'ss5', storeId: 's3', storeName: 'Agropecuária São Paulo', storeLogo: null, name: 'Semente de Milho 5kg', slug: 'semente-milho', description: 'Sementes de milho híbrido de alta produtividade.', price: 65.00, comparePrice: 78.00, images: '[]', stock: 30, rating: 4.4, totalReviews: 11, isFeatured: false, isNew: false, isOffer: true, tags: '["agricultura"]', variations: null, category: 'AGRICULTURE' },
  { id: 'ss6', storeId: 's7', storeName: 'Pet Shop Amigo Fiel', storeLogo: null, name: 'Ração Premium 15kg', slug: 'racao-premium', description: 'Ração super premium para cães adultos todas as raças.', price: 120.00, comparePrice: null, images: '[]', stock: 25, rating: 4.7, totalReviews: 45, isFeatured: true, isNew: false, isOffer: false, tags: '["premium","pets"]', variations: null, category: 'ANIMALS' },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

export function SmartSuggestions() {
  const { selectProduct, navigate } = useAppStore()

  const handleProductClick = (product: ProductData) => {
    selectProduct(product)
    navigate('product')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="mt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Recomendado para Você</h2>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Sugestões personalizadas baseadas nas suas preferências
            </p>
          </div>
          {/* AI Badge */}
          <Badge className="bg-gradient-to-r from-primary to-emerald-600 text-white text-[9px] px-2 py-0.5 border-0 font-semibold gap-1">
            <Award className="h-2.5 w-2.5" />
            DomPlace AI
          </Badge>
        </div>
      </div>

      {/* Horizontal Scrollable Cards */}
      <motion.div
        className="flex gap-3 overflow-x-auto hide-scrollbar pb-2"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {mockSuggestions.map((product, idx) => {
          const gradient = gradients[idx % gradients.length]
          const emoji = categoryEmojis[product.category] || '📦'
          const tag = suggestionTags[idx % suggestionTags.length]
          const discount = product.comparePrice
            ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
            : 0

          return (
            <motion.div
              key={product.id}
              variants={cardVariants}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="shrink-0 w-[170px] sm:w-[200px]"
            >
              <Card
                className="border-border/50 overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all card-premium-hover h-full"
                onClick={() => handleProductClick(product)}
              >
                {/* Image */}
                <div className={`relative aspect-[4/3] bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <span className="text-4xl">{emoji}</span>

                  {/* Discount badge */}
                  {discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[9px] px-1.5 py-0 font-bold">
                      -{discount}%
                    </Badge>
                  )}

                  {/* New badge */}
                  {product.isNew && (
                    <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground border-0 text-[9px] px-1.5 py-0">
                      Novo
                    </Badge>
                  )}
                </div>

                <CardContent className="p-3">
                  {/* Product name */}
                  <h3 className="text-sm font-semibold line-clamp-2 leading-tight">{product.name}</h3>

                  {/* Store */}
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Store className="h-2.5 w-2.5" />
                    {product.storeName}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-[10px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-medium">{product.rating}</span>
                    <span className="text-[10px] text-muted-foreground">({product.totalReviews})</span>
                  </div>

                  {/* AI Suggestion Tag */}
                  <div className="mt-2 flex items-center gap-1">
                    <div className="h-4 px-1.5 rounded-full bg-gradient-to-r from-primary/10 to-amber-500/10 flex items-center gap-0.5">
                      <TrendingUp className="h-2.5 w-2.5 text-primary" />
                      <span className="text-[9px] font-medium text-primary truncate max-w-[120px]">{tag}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        {/* "Ver mais" button */}
        <motion.div
          variants={cardVariants}
          className="shrink-0 w-[100px] sm:w-[120px] flex items-end"
        >
          <Button
            variant="outline"
            className="w-full h-full min-h-[200px] sm:min-h-[240px] rounded-xl border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 flex flex-col items-center justify-center gap-2"
            onClick={() => { useAppStore.getState().setSearchQuery('recomendados'); useAppStore.getState().openSearch() }}
          >
            <ChevronRight className="h-5 w-5" />
            <span className="text-xs font-semibold">Ver mais</span>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
