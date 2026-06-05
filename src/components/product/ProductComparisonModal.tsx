'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Trash2, Package, Store, Tag } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { resolveProductImage } from '@/lib/product-images'
import { formatBRL } from '@/lib/format'

// Fallback product data used to resolve IDs from the store
const FALLBACK_PRODUCTS: ProductData[] = [
  { id: 'p1', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Arroz Tio João 5kg', slug: 'arroz-tio-joao', description: 'Arroz tipo 1 premium.', price: 24.90, comparePrice: 29.90, images: '[]', stock: 50, rating: 4.5, totalReviews: 23, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["5kg","1kg"]', category: 'FOOD' },
  { id: 'p2', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Feijão Carioca 1kg', slug: 'feijao-carioca', description: 'Feijão carioca selecionado.', price: 8.90, comparePrice: null, images: '[]', stock: 80, rating: 4.3, totalReviews: 15, isFeatured: false, isNew: false, isOffer: false, tags: '[]', variations: '["1kg","500g"]', category: 'FOOD' },
  { id: 'p3', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Óleo de Soja 900ml', slug: 'oleo-soja', description: 'Óleo de soja puro.', price: 7.49, comparePrice: 8.99, images: '[]', stock: 40, rating: 4.1, totalReviews: 8, isFeatured: false, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'p5', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí 500ml', slug: 'acai-500ml', description: 'Açaí cremoso feito com frutas frescas.', price: 15.00, comparePrice: 18.00, images: '[]', stock: 100, rating: 4.9, totalReviews: 89, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["300ml","500ml","700ml"]', category: 'FOOD' },
  { id: 'p6', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí Premium 700ml', slug: 'acai-premium-700ml', description: 'Açaí premium com frutas da estação.', price: 22.00, comparePrice: null, images: '[]', stock: 50, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'p9', storeId: 's3', storeName: 'Agropecuária São Paulo', storeLogo: null, name: 'Adubo NPK 20kg', slug: 'adubo-npk', description: 'Adubo NPK para culturas diversas.', price: 89.90, comparePrice: null, images: '[]', stock: 25, rating: 4.4, totalReviews: 12, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'AGRICULTURE' },
  { id: 'p13', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: null, name: 'Vitamina C 500mg', slug: 'vitamina-c', description: 'Suplemento de vitamina C 500mg.', price: 35.00, comparePrice: 42.00, images: '[]', stock: 100, rating: 4.7, totalReviews: 34, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["500mg","1000mg"]', category: 'HEALTH' },
  { id: 'p17', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: null, name: 'Pão Francês (6 un)', slug: 'pao-frances', description: 'Pão francês fresquinho.', price: 6.00, comparePrice: null, images: '[]', stock: 200, rating: 4.9, totalReviews: 120, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
]

function resolveProductsByIds(ids: string[]): ProductData[] {
  return ids.map(id => FALLBACK_PRODUCTS.find(p => p.id === id)).filter(Boolean) as ProductData[]
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
            className={`h-3.5 w-3.5 ${
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

interface ProductComparisonModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProductComparisonModal({ isOpen, onClose }: ProductComparisonModalProps) {
  const compareProductIds = useAppStore(s => s.compareProductIds)
  const clearComparison = useAppStore(s => s.clearComparison)

  const comparingProducts = useMemo(
    () => resolveProductsByIds(compareProductIds),
    [compareProductIds]
  )

  const handleClear = () => {
    clearComparison()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <DialogTitle className="text-lg">
                Comparar Produtos
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {comparingProducts.length} de 3 produtos selecionados
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-destructive h-8 min-h-[44px] text-xs gap-1.5 shrink-0"
            >
              <Trash2 className="h-3 w-3" />
              Limpar comparação
            </Button>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {comparingProducts.length > 0 && (
            <motion.div
              key={compareProductIds.join(',')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Responsive grid: 1 col on mobile, side-by-side on larger screens */}
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(comparingProducts.length, 3)}, minmax(0, 1fr))`,
                }}
              >
                {comparingProducts.map((product, i) => {
                  const imageUrl = resolveProductImage({
                    slug: product.slug,
                    category: product.category,
                    images: product.images,
                  })

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                      className="rounded-xl border border-border overflow-hidden bg-card"
                    >
                      {/* Product image */}
                      <div className="relative aspect-square flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-12 w-12 text-muted-foreground/30" />
                        )}
                      </div>

                      {/* Product info */}
                      <div className="p-3 space-y-2.5">
                        {/* Store name */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Store className="h-3 w-3 shrink-0" />
                          <span className="truncate">{product.storeName}</span>
                        </div>

                        {/* Product name */}
                        <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-bold text-primary">
                            {formatBRL(product.price)}
                          </span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatBRL(product.comparePrice)}
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={product.rating} />
                          <span className="text-xs text-muted-foreground">
                            {product.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({product.totalReviews})
                          </span>
                        </div>

                        {/* Category */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Tag className="h-3 w-3 shrink-0" />
                          <span>{product.category}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {comparingProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum produto para comparar</p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
