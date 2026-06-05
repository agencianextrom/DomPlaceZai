'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Store, ChevronLeft, ChevronRight, Sparkles, Truck, PartyPopper, Heart, Edit3, Share2, Clock, AlertTriangle, Loader2, Check, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'
import { resolveProductImage } from '@/lib/product-images'
import { motion, AnimatePresence, useMotionValue, useTransform, animate as motionAnimate } from 'framer-motion'
import { ProductCard } from '@/components/product/ProductCard'
import { PromoCodeWidget } from '@/components/promotions/PromoCodeWidget'
import { CartSuggestions } from '@/components/cart/CartSuggestions'
import { CartTimer } from '@/components/cart/CartTimer'
import { toast } from 'sonner'
import { getDeliveryEstimate } from '@/lib/delivery-estimate'
import type { ProductData, CartItemData } from '@/store/useAppStore'

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
]

const icons = ['🍎', '🛒', '📦', '🎁', '🌿', '🍞']

const LOW_STOCK_THRESHOLD = 5

// Helper to map API product response to ProductData
function mapApiProduct(p: Record<string, unknown>): ProductData {
  return {
    id: p.id as string,
    storeId: p.storeId as string,
    storeName: p.storeName as string | undefined,
    storeLogo: (p.storeLogo as string | null) ?? null,
    name: p.name as string,
    slug: p.slug as string,
    description: (p.description as string | null) ?? null,
    price: p.price as number,
    comparePrice: (p.comparePrice as number | null) ?? null,
    images: (p.images as string) ?? '[]',
    stock: (p.stock as number) ?? 0,
    rating: (p.rating as number) ?? 0,
    totalReviews: (p.totalReviews as number) ?? 0,
    isFeatured: (p.isFeatured as boolean) ?? false,
    isNew: (p.isNew as boolean) ?? false,
    isOffer: (p.isOffer as boolean) ?? false,
    tags: (p.tags as string) ?? '[]',
    variations: (p.variations as string | null) ?? null,
    category: (p.category as string) ?? 'OTHER',
    freeDeliveryAbove: (p.freeDeliveryAbove as number | null) ?? null,
    storeDeliveryFee: (p.storeDeliveryFee as number) ?? null,
  }
}

function CrossSellSection({ cartItems }: { cartItems: CartItemData[] }) {
  const { addToCart } = useAppStore()
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [addedAll, setAddedAll] = useState(false)
  const [crossSellProducts, setCrossSellProducts] = useState<ProductData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Get unique store IDs from cart
  const cartStoreIds = useMemo(() => [...new Set(cartItems.map(item => item.product.storeId))], [cartItems])

  // Fetch real cross-sell products (offers from cart stores)
  useEffect(() => {
    if (cartStoreIds.length === 0) return
    let cancelled = false
    const fetchCrossSell = async () => {
      setIsLoading(true)
      try {
        const cartProductIds = new Set(cartItems.map(item => item.productId))
        // Fetch offer products from the stores in the cart
        const promises = cartStoreIds.map(storeId =>
          fetch(`/api/products?storeId=${storeId}&isOffer=true&limit=4`).then(r => r.json())
        )
        const results = await Promise.allSettled(promises)
        if (cancelled) return

        let allProducts: ProductData[] = []
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value?.products) {
            const mapped = result.value.products.map(mapApiProduct)
            allProducts = [...allProducts, ...mapped]
          }
        }

        // If not enough offers from cart stores, fetch general offers
        if (allProducts.length < 3) {
          const res = await fetch('/api/products?isOffer=true&limit=6')
          if (res.ok) {
            const data = await res.json()
            if (data.products) {
              const generalOffers = data.products.map(mapApiProduct)
              const existingIds = new Set(allProducts.map(p => p.id))
              const newOffers = generalOffers.filter(p => !existingIds.has(p.id))
              allProducts = [...allProducts, ...newOffers]
            }
          }
        }

        // Filter out products already in cart
        const filtered = allProducts.filter(p => !cartProductIds.has(p.id))
        setCrossSellProducts(filtered.slice(0, 4))
      } catch {
        // Silently fail — cross-sell section just won't show
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchCrossSell()
    return () => { cancelled = true }
  }, [cartStoreIds, cartItems])

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-xl border border-primary/15 p-4 card-shine elevated-card"
      >
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-5 w-5 rounded-lg" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-3 overflow-x-auto">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="shrink-0 w-[140px] h-[170px] rounded-xl" />
          ))}
        </div>
      </motion.div>
    )
  }

  if (crossSellProducts.length === 0) return null

  const handleQuickAdd = (product: ProductData) => {
    addToCart(product, product.storeName || 'Loja', 1)
    setAddedIds(prev => new Set([...prev, product.id]))
    toast.success(`${product.name} adicionado!`)
  }

  const handleAddAll = () => {
    let count = 0
    crossSellProducts.forEach(p => {
      if (!addedIds.has(p.id)) {
        addToCart(p, p.storeName || 'Loja', 1)
        count++
      }
    })
    setAddedIds(new Set(crossSellProducts.map(p => p.id)))
    setAddedAll(true)
    toast.success(`${count} itens adicionados ao carrinho!`)
  }

  const allAdded = crossSellProducts.every(p => addedIds.has(p.id))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-xl border border-primary/15 p-4 card-shine elevated-card"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold">Complete seu pedido</span>
            <p className="text-[10px] text-muted-foreground">Quem comprou itens do seu carrinho também comprou:</p>
          </div>
        </div>
        {!allAdded && (
          <Button
            size="sm"
            className="min-h-[44px] text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground gap-1 rounded-full px-3 active:scale-95 transition-transform"
            onClick={handleAddAll}
          >
            <Plus className="h-3 w-3" />
            Adicionar todos
          </Button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1">
        {crossSellProducts.map((product, index) => {
          const isAdded = addedIds.has(product.id)
          const gradient = gradients[Math.abs(product.name.charCodeAt(0)) % gradients.length]
          const icon = icons[Math.abs(product.name.charCodeAt(0)) % icons.length]
          return (
            <motion.div
              key={product.id}
              className="shrink-0 w-[140px] bg-card rounded-xl border border-border/50 p-2.5 hover:border-primary/20 transition-colors relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
            >
              <div className={`h-16 w-full rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-2 relative`}>
                {icon}
                {product.isOffer && (
                  <Badge className="absolute top-1 right-1 bg-red-500 text-white border-0 text-[8px] px-1 py-0 font-bold">
                    -{Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}%
                  </Badge>
                )}
              </div>
              <p className="text-xs font-semibold line-clamp-2 leading-tight min-h-[2rem]">{product.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{product.storeName}</p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-[9px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleQuickAdd(product)}
                  className={`h-7 w-7 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center transition-colors ${
                    isAdded
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {isAdded ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {allAdded && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center"
        >
          <p className="text-xs text-primary font-medium flex items-center justify-center gap-1">
            <Check className="h-3 w-3" />
            Todos os itens foram adicionados ao carrinho!
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

// Animated counting-up price component
function AnimatedPrice({ value }: { value: number }) {
  const motionVal = useMotionValue(0)
  const display = useTransform(motionVal, (v) => formatBRL(v))
  const [text, setText] = useState(formatBRL(0))

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setText(v))
    motionAnimate(motionVal, value, { duration: 0.6, ease: 'easeOut' })
    return unsubscribe
  }, [value, motionVal, display])

  return <span className="text-primary">{text}</span>
}

export function CartView() {
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    getCartGroupedByStore,
    getCartTotal,
    navigate,
    toggleFavoriteProduct,
    isFavoriteProduct,
    openQuickAdd,
    currentUser,
  } = useAppStore()

  const [suggestionScrollPos, setSuggestionScrollPos] = useState(0)
  const [stockMap, setStockMap] = useState<Record<string, number>>({})
  const [isLoadingStock, setIsLoadingStock] = useState(false)
  const [suggestedProducts, setSuggestedProducts] = useState<ProductData[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  const groups = getCartGroupedByStore()
  const subtotal = getCartTotal()

  // Per-store dynamic delivery fees
  const storeDeliveryFees = groups.map(group => {
    const firstItem = group.items[0]
    const deliveryFee = firstItem?.product?.storeDeliveryFee ?? 5.00
    const freeDeliveryAbove = firstItem?.product?.freeDeliveryAbove ?? null
    const isFreeDelivery = freeDeliveryAbove !== null && freeDeliveryAbove > 0 && group.subtotal >= freeDeliveryAbove
    return {
      storeId: group.storeId,
      storeName: group.storeName,
      fee: isFreeDelivery ? 0 : deliveryFee,
      freeDeliveryAbove,
      subtotalForFree: freeDeliveryAbove,
      isFree: isFreeDelivery,
    }
  })
  const deliveryFees = storeDeliveryFees.reduce((sum, s) => sum + s.fee, 0)
  const total = subtotal + deliveryFees

  // Calculate total savings from compare-at prices
  const totalSavings = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const cp = item.product.comparePrice
      if (cp && cp > item.product.price) {
        return sum + (cp - item.product.price) * item.quantity
      }
      return sum
    }, 0)
  }, [cartItems])
  const hasFreeDelivery = deliveryFees === 0 && storeDeliveryFees.some(s => s.freeDeliveryAbove !== null)
  // Find the lowest freeDeliveryAbove threshold among stores with delivery
  const lowestFreeThreshold = Math.min(
    ...storeDeliveryFees.filter(s => s.freeDeliveryAbove !== null && s.freeDeliveryAbove > 0 && !s.isFree).map(s => s.freeDeliveryAbove!)
  )
  const freeDeliveryThreshold = lowestFreeThreshold === Infinity ? 50 : lowestFreeThreshold
  const freeDeliveryProgress = Math.min((subtotal / freeDeliveryThreshold) * 100, 100)
  const remainingForFree = Math.max(freeDeliveryThreshold - subtotal, 0)

  // Fetch suggested products (featured products from API)
  useEffect(() => {
    let cancelled = false
    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true)
      try {
        const res = await fetch('/api/products?isFeatured=true&limit=5')
        if (res.ok) {
          const data = await res.json()
          if (data.products && !cancelled) {
            setSuggestedProducts(data.products.map(mapApiProduct))
          }
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setIsLoadingSuggestions(false)
      }
    }
    fetchSuggestions()
    return () => { cancelled = true }
  }, [])

  // Fetch real stock from API
  const fetchStock = useCallback(async () => {
    if (cartItems.length === 0) return
    setIsLoadingStock(true)
    try {
      const productIds = [...new Set(cartItems.map(item => item.productId))]
      const idsParam = productIds.join(',')
      const response = await fetch(`/api/products?ids=${idsParam}`)
      if (response.ok) {
        const data = await response.json()
        if (data.products) {
          const map: Record<string, number> = {}
          data.products.forEach((p: any) => {
            map[p.id] = p.stock
          })
          setStockMap(map)
        }
      }
    } catch {
      // Silently fail - use cart data
    } finally {
      setIsLoadingStock(false)
    }
  }, [cartItems])

  useEffect(() => {
    fetchStock()
  }, [fetchStock])

  // Sync cart to DB when user is authenticated
  useEffect(() => {
    if (!currentUser?.id || cartItems.length === 0) return

    const syncCart = async () => {
      try {
        for (const item of cartItems) {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: item.productId,
              quantity: item.quantity,
            }),
          })
        }
      } catch {
        // Silent fail - cart stays in Zustand
      }
    }

    syncCart()
  }, [currentUser?.id, cartItems.length]) // Sync on auth change or item count change

  const getRealStock = (productId: string): number => {
    if (Object.keys(stockMap).length > 0) {
      return stockMap[productId] ?? 0
    }
    // Fallback to product data in cart
    const item = cartItems.find(i => i.productId === productId)
    return item?.product?.stock ?? 0
  }

  const isLowStock = (productId: string): boolean => {
    const stock = getRealStock(productId)
    return stock > 0 && stock <= LOW_STOCK_THRESHOLD
  }

  const isOutOfStock = (productId: string): boolean => {
    return getRealStock(productId) <= 0
  }

  const scrollSuggestions = (direction: 'left' | 'right') => {
    const container = document.getElementById('suggestions-scroll')
    if (!container) return
    const scrollAmount = 220
    const newScroll = direction === 'left'
      ? Math.max(0, suggestionScrollPos - scrollAmount)
      : suggestionScrollPos + scrollAmount
    container.scrollTo({ left: newScroll, behavior: 'smooth' })
    setSuggestionScrollPos(newScroll)
  }

  const handleEditItem = (item: typeof cartItems[0]) => {
    openQuickAdd(item.product)
  }

  const handleMoveToFavorites = (item: typeof cartItems[0]) => {
    toggleFavoriteProduct(item.productId)
    toast.success(`${item.product.name} salvo nos favoritos`)
  }

  const handleShareCart = () => {
    const itemsList = cartItems
      .map(item => `• ${item.quantity}x ${item.product.name} - ${formatBRL(item.product.price * item.quantity)}`)
      .join('\n')
    const message = `🛒 *Meu carrinho DomPlace*\n\n${itemsList}\n\n💰 Total: ${formatBRL(total)}\n\nConfira em DomPlace!`
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
    toast.success('Link do carrinho copiado!')
  }

  const handleCheckout = () => {
    // Validate cart: check for out-of-stock items
    const outOfStockItems = cartItems.filter(item => isOutOfStock(item.productId))
    if (outOfStockItems.length > 0) {
      toast.error(`Alguns itens estão fora de estoque: ${outOfStockItems.map(i => i.product.name).join(', ')}`)
      return
    }

    // Check for quantity exceeding stock
    const overStockItems = cartItems.filter(item => item.quantity > getRealStock(item.productId))
    if (overStockItems.length > 0) {
      const first = overStockItems[0]
      const available = getRealStock(first.productId)
      updateCartQuantity(first.productId, available)
      toast.warning(`"${first.product.name}" ajustado para ${available} unidades (estoque disponível)`)
      return
    }

    navigate('checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-24 relative overflow-hidden r34-cart-empty-gradient-bg">
        {/* CSS keyframes for floating emoji animation */}
        <style>{`
          @keyframes float-up-fade {
            0% { transform: translateY(0) scale(1); opacity: 0.7; }
            50% { opacity: 1; }
            100% { transform: translateY(-60px) scale(0.6); opacity: 0; }
          }
          @keyframes gradient-pulse-cta {
            0%, 100% { background-size: 100% 100%; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
            50% { background-size: 120% 100%; box-shadow: 0 4px 25px rgba(16, 185, 129, 0.5); }
          }
          .cart-float-emoji {
            animation: float-up-fade 3s ease-in-out infinite;
          }
          .cart-cta-gradient-pulse {
            animation: gradient-pulse-cta 2s ease-in-out infinite;
          }
        `}</style>

        {/* Floating emoji elements — 6 items with enhanced organic paths and scale */}
        <motion.span
          animate={{ y: [0, -30, -10, -30, 0], x: [0, 12, 4, -8, 0], rotate: [0, 20, -5, 15, 0], scale: [1, 1.1, 0.95, 1.05, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
          className="absolute top-[12%] left-[8%] text-3xl pointer-events-none select-none"
        >🍎</motion.span>
        <motion.span
          animate={{ y: [0, -25, -5, -25, 0], x: [0, -15, -5, 10, 0], rotate: [0, -18, 5, -10, 0], scale: [1, 1.05, 0.9, 1.1, 1] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
          className="absolute top-[18%] right-[12%] text-2xl pointer-events-none select-none"
        >🛒</motion.span>
        <motion.span
          animate={{ y: [0, -35, -12, -35, 0], x: [0, 8, 2, -6, 0], rotate: [0, 12, -8, 6, 0], scale: [1, 1.12, 0.92, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
          className="absolute bottom-[38%] left-[18%] text-xl pointer-events-none select-none"
        >📦</motion.span>
        <motion.span
          animate={{ y: [0, -20, -8, -20, 0], x: [0, -10, 2, 8, 0], rotate: [0, -15, 10, -5, 0], scale: [1, 1.08, 0.94, 1.06, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2.1 }}
          className="absolute bottom-[42%] right-[8%] text-2xl pointer-events-none select-none"
        >🎁</motion.span>
        <motion.span
          animate={{ y: [0, -28, -6, -28, 0], x: [0, 14, 6, -8, 0], rotate: [0, 22, -12, 10, 0], scale: [1, 1.1, 0.88, 1.12, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-[40%] left-[5%] text-xl pointer-events-none select-none"
        >🌿</motion.span>
        <motion.span
          animate={{ y: [0, -22, -4, -22, 0], x: [0, -12, -3, 9, 0], rotate: [0, -10, 8, -6, 0], scale: [1, 1.15, 0.85, 1.1, 1] }}
          transition={{ duration: 3.3, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
          className="absolute top-[55%] right-[15%] text-lg pointer-events-none select-none"
        >🍞</motion.span>

        {/* Morph blob background decoration */}
        <div className="morph-blob absolute top-1/4 -left-20 w-48 h-48 bg-primary/5" style={{ animationDelay: '-2s' }} />
        <div className="morph-blob absolute bottom-1/4 -right-16 w-36 h-36 bg-accent/5" style={{ animationDelay: '-5s' }} />
        <div className="morph-blob absolute top-1/3 right-1/4 w-24 h-24 bg-emerald-500/5" style={{ animationDelay: '-8s' }} />

        {/* Prominent floating cart emoji with gentle bob */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="r42-cart-empty-float text-6xl mb-6 select-none"
        >
          🛒
        </motion.div>

        {/* Animated illustration with shopping bag */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-8"
        >
          {/* Outer glow ring */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-6 rounded-full bg-gradient-to-br from-primary/8 to-accent/8 blur-xl r42-cart-empty-glow"
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 flex items-center justify-center shadow-inner relative"
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            >
              <ShoppingBag className="h-16 w-16 text-primary/40" />
            </motion.div>
            {/* Bouncing micro-animation on the cart circle */}
            <motion.div
              animate={{ y: [0, -6, -3, -8, 0], rotate: [0, 3, -2, 4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 right-0"
            >
              <span className="text-lg">🛒</span>
            </motion.div>

            {/* Floating emoji accents */}
            <motion.span
              animate={{ y: [0, -8, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -top-2 -left-3 text-xl"
            >🛒</motion.span>
            <motion.span
              animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-1 right-1 text-lg"
            >✨</motion.span>
            <motion.span
              animate={{ y: [0, -7, 0], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute bottom-0 -left-4 text-lg"
            >🎁</motion.span>
          </motion.div>

          {/* Orbiting sparkle decorations */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
            style={{ transformOrigin: 'center center' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
          </motion.div>

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
            style={{ transformOrigin: 'center center' }}
          >
            <div className="absolute bottom-2 right-0">
              <Sparkles className="h-3 w-3 text-primary/50" />
            </div>
          </motion.div>

          <motion.div
            animate={{ rotate: 240 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
            style={{ transformOrigin: 'center center' }}
          >
            <div className="absolute top-4 -left-2">
              <motion.span
                animate={{ scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-base"
              >🌿</motion.span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold mb-2 text-shadow-sm">Seu carrinho está vazio</h2>
          <p className="text-muted-foreground text-center mb-8 text-sm max-w-xs mx-auto leading-relaxed">
            Adicione produtos das lojas locais e aproveite as melhores ofertas de Dom Eliseu
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('home')}
              variant="outline"
              className="h-12 px-6 hover-glow-soft border-primary/30 hover:border-primary/50 hover:bg-primary/5"
            >
              Explorar ofertas
            </Button>
            <Button
              onClick={() => navigate('home')}
              className="h-12 px-6 bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground font-semibold btn-glow btn-shine shadow-lg shadow-primary/20 cart-cta-gradient-pulse r62-touch-ripple"
            >
              Ver lojas
              <Store className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-5">
            <button onClick={() => navigate('home')} className="text-primary hover:underline font-medium">
              Continue comprando
            </button>
            {' '}e descubra mais produtos incríveis!
          </p>
        </motion.div>
      </div>
    )
  }

  // Check if any items are out of stock
  const hasOutOfStock = cartItems.some(item => isOutOfStock(item.productId))
  const hasQuantityIssues = cartItems.some(item => item.quantity > getRealStock(item.productId))

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2 text-shadow-sm r62-heading-gradient">
            Carrinho
            <Badge variant="secondary" className="text-xs">{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</Badge>
          </h1>
          <div className="flex items-center gap-1">
            {isLoadingStock && (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin mr-1" />
            )}
            {/* Share cart button */}
            <motion.div whileTap={{ scale: 0.9 }} className="mr-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-primary active:scale-95 transition-transform"
                onClick={handleShareCart}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </motion.div>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => useAppStore.getState().clearCart()}>
              Limpar
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24 lg:pb-0">
        {/* Stock warning banner */}
        {hasOutOfStock && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30 p-3 flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-400">
              Alguns itens estão fora de estoque. Remova-os antes de finalizar.
            </p>
          </motion.div>
        )}

        {/* Free delivery progress banner */}
        {!hasFreeDelivery ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 rounded-xl border border-primary/15 p-4 card-shine"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Truck className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Frete grátis a partir de <span className="tag-chip ml-1">{formatBRL(freeDeliveryThreshold)}</span></span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${freeDeliveryProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-full r42-cart-shipping-bar"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Falta apenas <span className="font-semibold text-primary">{formatBRL(remainingForFree)}</span> para ganhar frete grátis!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-emerald-500/10 to-primary/10 rounded-xl border border-emerald-500/20 p-3.5 flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
              className="h-9 w-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0"
            >
              <PartyPopper className="h-5 w-5 text-emerald-600" />
            </motion.div>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400"><span className="tag-chip">🎉 Frete grátis!</span></p>
              <p className="text-xs text-muted-foreground">Você ganhou entrega gratuita neste pedido</p>
            </div>
          </motion.div>
        )}

        {/* Suggested products - "Add more items" */}
        <div className="bg-card rounded-xl border border-border p-4 card-shine elevated-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Adicione mais itens</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 min-h-[44px] min-w-[44px] active:scale-95 transition-transform" onClick={() => scrollSuggestions('left')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 min-h-[44px] min-w-[44px] active:scale-95 transition-transform" onClick={() => scrollSuggestions('right')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div id="suggestions-scroll" className="flex gap-3 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1 r62-scroll-snap">
            {isLoadingSuggestions ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="shrink-0 w-[150px] h-[220px] rounded-xl" />
              ))
            ) : (
              suggestedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="shrink-0 w-[150px] r62-card-lift"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Items grouped by store */}
        <AnimatePresence>
          {groups.map((group) => (
            <motion.div
              key={group.storeId}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
              className="bg-card rounded-xl border border-border/60 overflow-hidden card-shine elevated-card"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/30">
                <Store className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm flex-1 truncate">{group.storeName}</span>
                <span className="text-xs text-muted-foreground">{group.items.length} {group.items.length === 1 ? 'item' : 'itens'}</span>
                {/* Delivery time badge — animated countdown appearance */}
                <Badge variant="secondary" className="text-[10px] bg-primary/5 text-primary border-0 ml-1 flex items-center gap-1 r38-cart-delivery-badge">
                  <Clock className="h-2.5 w-2.5" />
                  <motion.span
                    key={group.storeId}
                    initial={{ scale: 0.5, y: -4, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                  >
                    {getDeliveryEstimate(null, group.items[0]?.product?.category)}
                  </motion.span>
                </Badge>
              </div>

              <div className="divide-y divide-border">
                {group.items.map((item, index) => {
                  const gradient = gradients[Math.abs(item.product.name.charCodeAt(0)) % gradients.length]
                  const icon = icons[Math.abs(item.product.name.charCodeAt(0)) % icons.length]
                  const isFav = isFavoriteProduct(item.productId)
                  const outOfStock = isOutOfStock(item.productId)
                  const lowStock = isLowStock(item.productId)
                  const realStock = getRealStock(item.productId)
                  const cartImgUrl = resolveProductImage({ slug: item.product.slug, category: item.product.category, images: item.product.images })

                  return (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -60, transition: { duration: 0.25 } }}
                      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(16,185,129,0.12), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(16,185,129,0.08)' }}
                      transition={{ delay: index * 0.06, type: 'spring' as const, stiffness: 350, damping: 25 }}
                      className={`flex gap-3 p-4 rounded-lg r42-cart-item-hover r38-cart-item-hover r38-cart-swipe-hint r60-card-enter ${outOfStock ? 'opacity-60' : ''}`}
                    >
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shrink-0 relative overflow-hidden r38-cart-img-hover`}>
                        {cartImgUrl ? (
                          <img src={cartImgUrl} alt={item.product.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        ) : null}
                        {!cartImgUrl && icon}
                        {outOfStock && (
                          <div className="absolute inset-0 bg-background/60 rounded-lg flex items-center justify-center">
                            <span className="text-[10px] font-bold text-destructive">Esgotado</span>
                          </div>
                        )}
                      </div>
                      {/* r38: Swipe-to-delete visual hint icon */}
                      <div className="r38-cart-swipe-delete-icon h-8 w-8 rounded-lg bg-red-500/90 flex items-center justify-center shadow-lg">
                        <XCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold truncate">{item.product.name}</h3>
                          {/* Action buttons */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleMoveToFavorites(item)}
                              className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Mover para favoritos"
                              aria-label="Mover para favoritos"
                            >
                              <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleEditItem(item)}
                              className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Editar item"
                              aria-label="Editar item"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </motion.button>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-primary mt-1">{formatBRL(item.product.price)}</p>

                        {/* Stock warning */}
                        {lowStock && !outOfStock && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Apenas {realStock} restante{realStock !== 1 ? 's' : ''}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileTap={{ scale: 0.88 }}
                              onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                              disabled={outOfStock}
                              className="r42-cart-qty-btn qty-control-btn disabled:opacity-40 min-h-11 min-w-11"
                            >
                              <Minus className="h-3 w-3" />
                            </motion.button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              className="w-6 text-center font-semibold text-sm"
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              whileTap={{ scale: 0.88 }}
                              onClick={() => {
                                if (item.quantity >= realStock) {
                                  toast.warning(`Estoque máximo atingido: ${realStock} unidades`)
                                  return
                                }
                                updateCartQuantity(item.productId, item.quantity + 1)
                              }}
                              disabled={outOfStock || item.quantity >= realStock}
                              className="r42-cart-qty-btn qty-control-btn disabled:opacity-40 min-h-11 min-w-11"
                            >
                              <Plus className="h-3 w-3" />
                            </motion.button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{formatBRL(item.product.price * item.quantity)}</span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              whileHover={{ scale: 1.15 }}
                              onClick={() => removeFromCart(item.productId)}
                              className="h-10 w-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors r38-cart-remove-btn active:scale-95 transition-transform"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="px-4 py-3 bg-secondary/20 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Subtotal da loja</span>
                  <span className="flex items-center gap-0.5 text-[11px] text-primary">
                    <Clock className="h-3 w-3" />
                    {getDeliveryEstimate(null, group.items[0]?.product?.category)}
                  </span>
                </div>
                <span className="font-semibold">{formatBRL(group.subtotal)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Promo code widget — r38: coupon input glow on focus */}
        <div className="r42-cart-coupon-glow rounded-xl border border-primary/10">
          <PromoCodeWidget />
        </div>

        {/* Smart Cross-Sell: "Complete seu pedido" */}
        {cartItems.length > 0 && (
          <CrossSellSection cartItems={cartItems} />
        )}

        {/* Order bump - only show if not yet at free delivery */}
        {!hasFreeDelivery && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/20 p-4"
          >
            <p className="text-xs font-semibold text-primary mb-1">🔥 Sugestão para você</p>
            <p className="text-sm">Adicione mais {formatBRL(remainingForFree)} e ganhe frete grátis!</p>
          </motion.div>
        )}

        {/* Cart Suggestions - Frequently bought together */}
        {cartItems.length > 0 && <CartSuggestions />}

        {/* Cart Reservation Timer */}
        {cartItems.length > 0 && <CartTimer />}
      </div>
      <style>{`
        @keyframes checkout-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .checkout-shimmer-btn {
          position: relative;
          overflow: hidden;
        }
        .checkout-shimmer-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: checkout-shimmer 2.5s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 px-4 py-4 pb-20 md:pb-4 r62-bottom-safe" style={{ paddingBottom: 'max(80px, calc(80px + env(safe-area-inset-bottom)))' }}>
        {/* Gradient border wrapper */}
        <div className="max-w-3xl mx-auto relative">
          {/* Gradient border accents */}
          <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
          <div className="absolute -left-px top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/40 via-primary to-primary/40 rounded-full" />
          <div className="absolute -right-px top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/40 via-primary to-primary/40 rounded-full" />
          <div className="r42-cart-summary-glass rounded-xl px-4 py-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Entrega ({groups.length} {groups.length === 1 ? 'loja' : 'lojas'})</span>
              <motion.span
                key={hasFreeDelivery ? 'free' : 'paid'}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={hasFreeDelivery ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}
              >
                {hasFreeDelivery ? 'Grátis 🎉' : formatBRL(deliveryFees)}
              </motion.span>
            </div>
            {/* Per-store delivery breakdown */}
            {storeDeliveryFees.length > 1 && !hasFreeDelivery && (
              <div className="text-[11px] text-muted-foreground">
                {storeDeliveryFees.map(s => (
                  <div key={s.storeId} className="flex justify-between">
                    <span>• {s.storeName}</span>
                    <span>{s.isFree ? 'Grátis' : formatBRL(s.fee)}</span>
                  </div>
                ))}
              </div>
            )}
            <Separator className="my-2" />
            {/* Economizou savings highlight */}
            {totalSavings > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                className="flex items-center justify-between bg-emerald-500/10 dark:bg-emerald-500/8 rounded-lg px-3 py-2 -mx-1"
              >
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Economizou
                </span>
                <motion.span
                  key={totalSavings}
                  initial={{ scale: 1.15, color: '#059669' }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
                  className="text-sm font-bold text-emerald-600 dark:text-emerald-400"
                >
                  <AnimatedPrice value={totalSavings} />
                </motion.span>
              </motion.div>
            )}
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <AnimatedPrice value={total} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {/* Share cart button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0 rounded-xl border-primary/20 hover:bg-primary/5"
                onClick={handleShareCart}
                title="Compartilhar carrinho"
              >
                <Share2 className="h-5 w-5 text-primary" />
              </Button>
            </motion.div>
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary text-base font-semibold btn-glow btn-shine rounded-xl shadow-lg shadow-primary/20 r42-cart-cta-shimmer"
              onClick={handleCheckout}
              disabled={hasOutOfStock}
            >
              <motion.span
                className="flex items-center justify-center gap-2"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
              >
                <span>{hasOutOfStock ? 'Remover itens indisponíveis' : 'Finalizar Compra'}</span>
                {!hasOutOfStock && <ArrowRight className="h-5 w-5" />}
              </motion.span>
            </Button>
          </div>
          <p className="text-center mt-2">
            <button onClick={() => navigate('home')} className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Continue comprando
            </button>
          </p>
          </div>
        </div>
      </div>
      {/* Mobile sticky checkout bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 p-3 flex items-center justify-between lg:hidden r62-bottom-safe" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div>
          <span className="text-xs text-gray-500">{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</span>
          <span className="text-lg font-bold text-gray-900 ml-2">R$ {total.toFixed(2)}</span>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold active:scale-95 transition-transform" onClick={handleCheckout}>
          Finalizar Compra
        </button>
      </div>
    </div>
  )
}
