'use client'

import { useState } from 'react'
import { Plus, Minus, ShoppingCart, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { CategoryIcon, formatBRL } from './ProductCard'

function QuickAddContent({ product }: { product: ProductData }) {
  const { closeQuickAdd, addToCart, toggleFavoriteProduct } = useAppStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  const variations = product.variations ? JSON.parse(product.variations) as string[] : []

  // Set initial variation
  if (selectedVariation === null && variations.length > 0) {
    setSelectedVariation(variations[0])
  }

  const handleAddToCart = () => {
    addToCart(product, product.storeName || 'Loja', quantity)
    setAdded(true)
    toast.success(`${product.name} adicionado ao carrinho!`, {
      description: `${quantity}x ${selectedVariation ? `(${selectedVariation})` : ''} - ${formatBRL(product.price * quantity)}`,
      icon: <Check className="h-4 w-4 text-emerald-600" />,
    })
    setTimeout(() => {
      setAdded(false)
      closeQuickAdd()
    }, 800)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavoriteProduct(product.id)
    const isFav = useAppStore.getState().isFavoriteProduct(product.id)
    toast.success(isFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos')
  }

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div className="px-4 pb-6">
      {/* Drag indicator */}
      <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />

      {/* Product header */}
      <div className="flex gap-3 mb-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30 flex items-center justify-center shrink-0"
        >
          <CategoryIcon category={product.category} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{product.storeName}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-bold text-primary">{formatBRL(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
            )}
            {discount > 0 && (
              <Badge className="bg-red-500 text-white border-0 text-[10px] px-1.5 py-0">-{discount}%</Badge>
            )}
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleFavorite}
          className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center self-start shrink-0"
        >
          <Sparkles className="h-4 w-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Variations */}
      {variations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <p className="text-xs font-semibold text-muted-foreground mb-2">Variação</p>
          <div className="flex flex-wrap gap-2">
            {variations.map((v: string) => (
              <motion.button
                key={v}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedVariation(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedVariation === v
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                }`}
              >
                {v}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quantity selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <p className="text-xs font-semibold text-muted-foreground mb-2">Quantidade</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-1">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="h-10 w-10 rounded-lg bg-background flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </motion.button>
            <motion.span
              key={quantity}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="w-8 text-center font-bold text-lg"
            >
              {quantity}
            </motion.span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
              className="h-10 w-10 rounded-lg bg-background flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </motion.button>
          </div>
          <span className="text-xs text-muted-foreground">
            {product.stock} disponíveis
          </span>
        </div>
      </motion.div>

      {/* Total */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-4 p-3 bg-primary/5 rounded-xl"
      >
        <span className="text-sm text-muted-foreground">Subtotal</span>
        <span className="font-bold text-primary text-lg">{formatBRL(product.price * quantity)}</span>
      </motion.div>

      {/* Add to cart button */}
      <AnimatePresence mode="wait">
        <motion.div
          key={added ? 'added' : 'add'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {added ? (
            <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-semibold gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Check className="h-5 w-5" />
              </motion.div>
              Adicionado!
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              className="w-full h-12 bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground hover:from-primary/90 hover:to-emerald-600/90 rounded-xl text-base font-semibold btn-glow gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Adicionar ao Carrinho
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

interface ProductQuickAddProps {
  editMode?: boolean
  initialQuantity?: number
}

export function ProductQuickAdd({ editMode = false, initialQuantity = 1 }: ProductQuickAddProps) {
  const { quickAddProduct, isQuickAddOpen, closeQuickAdd } = useAppStore()
  const product = quickAddProduct

  return (
    <Drawer open={isQuickAddOpen} onOpenChange={(open) => { if (!open) closeQuickAdd() }}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Adicionar {product?.name}</DrawerTitle>
          <DrawerDescription>Selecione quantidade e variações</DrawerDescription>
        </DrawerHeader>

        {product && (
          <QuickAddContent key={product.id} product={product} />
        )}
      </DrawerContent>
    </Drawer>
  )
}
