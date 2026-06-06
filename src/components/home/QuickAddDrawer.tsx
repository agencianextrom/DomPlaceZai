'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  Clock,
  ChevronRight,
  Star,
  Trash2,
  Package,
  Check,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'
import { useAppStore, type ProductData, type CartItemData } from '@/store/useAppStore'
import { resolveProductImage } from '@/lib/product-images'
import { CategoryIcon } from '@/components/product/ProductCard'
import { toast } from 'sonner'

/* ── Helpers ── */
const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

/* ── Animation variants ── */
const drawerVariants = {
  hidden: { x: 300, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 320,
      damping: 34,
      ease: 'easeOut',
    },
  },
  exit: {
    x: 300,
    opacity: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 280,
      damping: 30,
      ease: 'easeIn',
    },
  },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const contentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22, delay: 0.15 },
  },
  exit: { opacity: 0, y: 12, transition: { duration: 0.15 } },
}

const cartItemVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
      delay: 0.08 + i * 0.05,
    },
  }),
  exit: { opacity: 0, scale: 0.85, x: -20, transition: { duration: 0.15 } },
}

const badgePopVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 20 },
  },
  exit: { scale: 0 },
}

const quantityBounceVariants = {
  tap: { scale: 0.88 },
  idle: {
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
}

const addedPulseVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 20 },
  },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.2 } },
}

const counterVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 22, delay: 0.1 },
  },
}

/* ── Gradient backgrounds for product image fallback ── */
const productGradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
  'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
  'from-lime-100 to-green-200 dark:from-lime-900/30 dark:to-green-800/30',
  'from-violet-100 to-purple-200 dark:from-violet-900/30 dark:to-purple-800/30',
]

/* ── Recently Added Item Mini Card ── */
function RecentlyAddedItem({
  item,
  index,
  onRemove,
}: {
  item: CartItemData
  index: number
  onRemove: (productId: string) => void
}) {
  const product = item.product
  const gradient = productGradients[Math.abs(product.name.charCodeAt(0)) % productGradients.length]
  const imgUrl = resolveProductImage({ slug: product.slug, category: product.category, images: product.images })

  return (
    <motion.div
      key={`recent-${item.id}`}
      custom={index}
      variants={cartItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors group"
    >
      <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <CategoryIcon category={product.category} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold line-clamp-1">{product.name}</p>
        <p className="text-[10px] text-muted-foreground">{item.storeName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs font-bold text-primary">{formatBRL(product.price)}</span>
          <span className="text-[10px] text-muted-foreground">× {item.quantity}</span>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onRemove(item.productId)}
        className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-full bg-muted/60 hover:bg-destructive/10 hover:text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="h-3 w-3" />
      </motion.button>
    </motion.div>
  )
}

/* ── Cart Total Animated Counter ── */
function AnimatedCartTotal({ total }: { total: number }) {
  const [displayTotal, setDisplayTotal] = useState(total)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (Math.abs(displayTotal - total) > 0.01) {
      // Use microtask to avoid direct setState in effect
      queueMicrotask(() => setIsAnimating(true))
      const start = displayTotal
      const diff = total - start
      const startTime = Date.now()
      const duration = 500

      const step = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayTotal(Math.round((start + diff * eased) * 100) / 100)
        if (progress < 1) requestAnimationFrame(step)
        else setIsAnimating(false)
      }
      requestAnimationFrame(step)
    }
  }, [total])

  return (
    <motion.span
      key={displayTotal}
      animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      className="text-lg font-extrabold text-primary"
    >
      {formatBRL(displayTotal)}
    </motion.span>
  )
}

/* ── Variation Pill Selector ── */
function VariationSelector({
  variations,
  selected,
  onSelect,
}: {
  variations: string[]
  selected: string | null
  onSelect: (v: string) => void
}) {
  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
        Variações
      </h4>
      <div className="flex flex-wrap gap-2">
        {variations.map((v) => {
          const isSelected = selected === v
          return (
            <motion.button
              key={v}
              whileTap={{ scale: 0.93 }}
              onClick={() => onSelect(v)}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-md'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-foreground'
              }`}
            >
              {v}
              {isSelected && (
                <motion.div
                  layoutId="variation-check-drawer"
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
                >
                  <Check className="h-2.5 w-2.5" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Quantity Stepper ── */
function DrawerQuantityStepper({
  quantity,
  onChange,
  stock,
}: {
  quantity: number
  onChange: (q: number) => void
  stock: number
}) {
  const handleDecrement = () => {
    if (quantity > 1) onChange(quantity - 1)
  }
  const handleIncrement = () => {
    if (quantity < stock) onChange(quantity + 1)
  }

  return (
    <div className="flex items-center gap-1">
      <motion.button
        variants={quantityBounceVariants}
        initial="idle"
        whileTap="tap"
        animate="idle"
        onClick={handleDecrement}
        disabled={quantity <= 1}
        className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors border border-border/50"
      >
        <Minus className="h-4 w-4" />
      </motion.button>

      <motion.div
        key={quantity}
        variants={counterVariants}
        initial="hidden"
        animate="visible"
        className="h-9 w-12 rounded-xl bg-background border border-border/50 flex items-center justify-center font-bold text-sm"
      >
        {quantity}
      </motion.div>

      <motion.button
        variants={quantityBounceVariants}
        initial="idle"
        whileTap="tap"
        animate="idle"
        onClick={handleIncrement}
        disabled={quantity >= stock}
        className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
      >
        <Plus className="h-4 w-4" />
      </motion.button>
    </div>
  )
}

/* ── Empty Cart State ── */
function EmptyCartState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center py-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-3">
          <ShoppingCart className="h-8 w-8 text-primary/40" />
        </div>
      </motion.div>
      <p className="text-sm font-medium text-muted-foreground">Carrinho vazio</p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Adicione produtos para começar
      </p>
    </motion.div>
  )
}

/* ── Added Success Indicator ── */
function AddedSuccessIndicator({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          variants={addedPulseVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute top-3 right-3 z-20"
        >
          <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Check className="h-4 w-4" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT — QuickAddDrawer
   ═══════════════════════════════════════════════════ */
export function QuickAddDrawer() {
  const {
    quickAddProduct,
    isQuickAddOpen,
    closeQuickAdd,
    addToCart,
    cartItems,
    removeFromCart,
    getCartTotal,
    getCartItemCount,
    navigate,
  } = useAppStore()

  const [quantity, setQuantity] = useState(1)
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState<CartItemData[]>([])

  // Reset state when product changes
  useEffect(() => {
    if (quickAddProduct) {
      queueMicrotask(() => {
        setQuantity(1)
        setJustAdded(false)
      })

      const variations = quickAddProduct.variations
        ? JSON.parse(quickAddProduct.variations) as string[]
        : []
      queueMicrotask(() => setSelectedVariation(variations.length > 0 ? variations[0] : null))
    }
  }, [quickAddProduct?.id])

  // Build recently added list from cart (last 5 unique items)
  const recentItems = useMemo(() => {
    return cartItems.slice(-5).reverse()
  }, [cartItems])

  const variations = useMemo(() => {
    if (!quickAddProduct?.variations) return []
    try {
      return JSON.parse(quickAddProduct.variations) as string[]
    } catch {
      return []
    }
  }, [quickAddProduct])

  const cartTotal = getCartTotal()
  const cartItemCount = getCartItemCount()
  const gradient = quickAddProduct
    ? productGradients[Math.abs(quickAddProduct.name.charCodeAt(0)) % productGradients.length]
    : productGradients[0]

  const imgUrl = quickAddProduct
    ? resolveProductImage({
        slug: quickAddProduct.slug,
        category: quickAddProduct.category,
        images: quickAddProduct.images,
      })
    : null

  const handleAddToCart = useCallback(() => {
    if (!quickAddProduct) return

    addToCart(quickAddProduct, quickAddProduct.storeName || 'Loja', quantity)

    // Update recently added
    const newItem: CartItemData = {
      id: `cart-${Date.now()}`,
      productId: quickAddProduct.id,
      product: quickAddProduct,
      storeId: quickAddProduct.storeId,
      storeName: quickAddProduct.storeName || 'Loja',
      quantity,
    }
    setRecentlyAdded((prev) => [newItem, ...prev].slice(0, 5))

    // Show confetti burst
    setShowConfetti(true)
    setJustAdded(true)

    // Toast notification
    toast.success(`${quickAddProduct.name} adicionado ao carrinho!`, {
      description: `Quantidade: ${quantity}${selectedVariation ? ` · ${selectedVariation}` : ''}`,
    })

    // Reset after animation
    setTimeout(() => {
      setShowConfetti(false)
      setJustAdded(false)
    }, 1500)
  }, [quickAddProduct, quantity, selectedVariation, addToCart])

  const handleClose = useCallback(() => {
    closeQuickAdd()
  }, [closeQuickAdd])

  // Close on Escape key
  useEffect(() => {
    if (!isQuickAddOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isQuickAddOpen, handleClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isQuickAddOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isQuickAddOpen])

  return (
    <AnimatePresence>
      {isQuickAddOpen && quickAddProduct && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 z-[61] w-full max-w-[400px] bg-background border-l border-border/50 shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Adicionar produto ao carrinho"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-background/95 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2.5">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                  className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center"
                >
                  <Zap className="h-4 w-4 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-sm font-bold">Adicionar Rápido</h2>
                  <p className="text-[10px] text-muted-foreground">
                    Configure e adicione ao carrinho
                  </p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleClose}
                className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            {/* ── Scrollable Content ── */}
            <ScrollArea className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quickAddProduct.id}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-5 space-y-5"
                >
                  {/* Product Image */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 25, delay: 0.05 }}
                    className="relative aspect-square max-h-[220px] w-full rounded-2xl overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md"
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={quickAddProduct.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <CategoryIcon category={quickAddProduct.category} />
                    )}

                    {/* Discount Badge */}
                    {quickAddProduct.comparePrice && quickAddProduct.comparePrice > quickAddProduct.price && (
                      <motion.div
                        initial={{ scale: 0, x: 20 }}
                        animate={{ scale: 1, x: 0 }}
                        transition={{ type: 'spring' as const, stiffness: 500, damping: 20, delay: 0.2 }}
                        className="absolute top-3 left-3"
                      >
                        <Badge className="bg-red-500 text-white border-0 text-[10px] font-bold px-2 py-0.5">
                          -{Math.round(((quickAddProduct.comparePrice - quickAddProduct.price) / quickAddProduct.comparePrice) * 100)}%
                        </Badge>
                      </motion.div>
                    )}

                    {/* Added indicator */}
                    <AddedSuccessIndicator visible={justAdded} />

                    {/* Confetti burst */}
                    <ConfettiBurst
                      active={showConfetti}
                      origin="center"
                      particleCount={30}
                      duration={800}
                      spread={150}
                      className="inset-0"
                    />
                  </motion.div>

                  {/* Product Info */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold leading-tight">{quickAddProduct.name}</h3>

                    {quickAddProduct.storeName && (
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Package className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">{quickAddProduct.storeName}</span>
                      </div>
                    )}

                    {/* Rating */}
                    {quickAddProduct.rating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.round(quickAddProduct.rating)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {quickAddProduct.rating} ({quickAddProduct.totalReviews} avaliações)
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2.5 pt-1">
                      <span className="text-2xl font-extrabold text-primary">
                        {formatBRL(quickAddProduct.price)}
                      </span>
                      {quickAddProduct.comparePrice && quickAddProduct.comparePrice > quickAddProduct.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatBRL(quickAddProduct.comparePrice)}
                        </span>
                      )}
                    </div>

                    {/* Stock info */}
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={
                          quickAddProduct.stock > 0
                            ? { scale: [1, 1.2, 1] }
                            : {}
                        }
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-2 w-2 rounded-full bg-emerald-500"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {quickAddProduct.stock > 50
                          ? 'Em estoque'
                          : quickAddProduct.stock > 0
                            ? `${quickAddProduct.stock} unidades restantes`
                            : 'Esgotado'}
                      </span>
                      {quickAddProduct.stock > 0 && quickAddProduct.stock <= 10 && (
                        <Badge variant="secondary" className="text-[9px] bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-400 px-1.5">
                          Últimas unidades
                        </Badge>
                      )}
                    </div>

                    {/* Delivery estimate */}
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Entrega estimada: 30-45 min</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Quantity Stepper */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                      Quantidade
                    </h4>
                    <DrawerQuantityStepper
                      quantity={quantity}
                      onChange={setQuantity}
                      stock={quickAddProduct.stock}
                    />

                    {/* Quantity × price preview */}
                    <motion.div
                      key={quantity}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 flex items-center justify-between bg-primary/5 rounded-xl px-3 py-2 border border-primary/10"
                    >
                      <span className="text-[10px] text-muted-foreground">
                        Subtotal ({quantity} {quantity === 1 ? 'unidade' : 'unidades'})
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {formatBRL(quickAddProduct.price * quantity)}
                      </span>
                    </motion.div>
                  </div>

                  {/* Variation Selector */}
                  {variations.length > 0 && (
                    <VariationSelector
                      variations={variations}
                      selected={selectedVariation}
                      onSelect={setSelectedVariation}
                    />
                  )}

                  {/* Add to Cart Button */}
                  <motion.div
                    className="relative"
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      onClick={handleAddToCart}
                      disabled={quickAddProduct.stock <= 0}
                      className={`w-full h-12 text-sm font-bold rounded-xl transition-all btn-glow btn-shine ${
                        justAdded
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-primary hover:bg-primary/90'
                      } text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <AnimatePresence mode="wait">
                        {justAdded ? (
                          <motion.span
                            key="added"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex items-center gap-2"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
                            >
                              <Check className="h-5 w-5" />
                            </motion.div>
                            Adicionado ao Carrinho!
                          </motion.span>
                        ) : (
                          <motion.span
                            key="add"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex items-center gap-2"
                          >
                            <ShoppingCart className="h-5 w-5" />
                            Adicionar ao Carrinho
                            <Sparkles className="h-4 w-4 opacity-60" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>

                    {/* Floating cart count badge */}
                    <AnimatePresence>
                      {cartItemCount > 0 && (
                        <motion.div
                          variants={badgePopVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute -top-2 -right-2 h-6 min-w-[24px] px-1.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-amber-500/30"
                        >
                          {cartItemCount}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <Separator />

                  {/* Cart Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Resumo do Carrinho
                      </h4>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('cart')}
                        className="text-[10px] text-primary font-semibold flex items-center gap-0.5 hover:underline"
                      >
                        Ver carrinho
                        <ChevronRight className="h-3 w-3" />
                      </motion.button>
                    </div>

                    {recentItems.length > 0 ? (
                      <div className="space-y-2">
                        <AnimatePresence>
                          {recentItems.map((item, i) => (
                            <RecentlyAddedItem
                              key={`recent-${item.productId}-${i}`}
                              item={item}
                              index={i}
                              onRemove={removeFromCart}
                            />
                          ))}
                        </AnimatePresence>

                        {/* Total */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center justify-between pt-3 mt-3 border-t border-border/50"
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold">
                              Total ({cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'})
                            </span>
                          </div>
                          <AnimatedCartTotal total={cartTotal} />
                        </motion.div>
                      </div>
                    ) : (
                      <EmptyCartState />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </ScrollArea>

            {/* ── Sticky Footer ── */}
            <div className="shrink-0 px-5 py-3 border-t border-border/50 bg-background/95 backdrop-blur-md">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (quickAddProduct) handleAddToCart()
                  navigate('cart')
                }}
                disabled={cartItemCount === 0}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-primary/30 btn-glow"
              >
                <ShoppingCart className="h-4 w-4" />
                Ir para o Carrinho
                <motion.span
                  key={cartTotal}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold"
                >
                  {formatBRL(cartTotal)}
                </motion.span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
