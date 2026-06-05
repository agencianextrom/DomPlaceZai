'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompareArrows, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { resolveProductImage } from '@/lib/product-images'

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

export function ProductComparisonBar() {
  const compareProductIds = useAppStore(s => s.compareProductIds)
  const clearComparison = useAppStore(s => s.clearComparison)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const comparingProducts = useMemo(
    () => resolveProductsByIds(compareProductIds),
    [compareProductIds]
  )

  if (comparingProducts.length === 0) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/20 shadow-2xl"
          style={{
            background: 'rgba(15, 15, 25, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Product thumbnails */}
          <div className="flex items-center -space-x-2">
            {comparingProducts.map((product) => {
              const imageUrl = resolveProductImage({
                slug: product.slug,
                category: product.category,
                images: product.images,
              })
              return (
                <motion.div
                  key={product.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="relative h-10 w-10 rounded-full border-2 border-white/30 overflow-hidden shrink-0"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center">
                      <GitCompareArrows className="h-4 w-4 text-white/60" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10" />

          {/* Compare button */}
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 bg-white/10 hover:bg-white/20 text-white border-0 text-xs font-semibold h-9 min-h-[44px]"
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
            Comparar ({comparingProducts.length})
          </Button>

          {/* Clear button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={clearComparison}
            className="h-9 w-9 min-h-[44px] min-w-[44px] text-white/60 hover:text-white hover:bg-white/10 shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          {/* Hidden - modal is opened via state but rendered elsewhere */}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
