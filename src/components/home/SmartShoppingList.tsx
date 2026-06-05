'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Check,
  Plus,
  Sparkles,
  TrendingDown,
  CalendarDays,
  Loader2,
  PackageOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cachedFetch } from '@/lib/api-cache'
import { useAppStore, type ProductData } from '@/store/useAppStore'

// ─── currency formatter ────────────────────────────────────────
const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

// ─── shopping list item ────────────────────────────────────────
interface ShoppingListItem {
  id: string
  name: string
  emoji: string
  estimatedPrice: number
  weeklyQty: number
  monthlyQty: number
  productId?: string
  product?: ProductData
  storeName?: string
}

// ─── category definition ──────────────────────────────────────
interface ShoppingCategory {
  id: string
  name: string
  emoji: string
  borderColor: string
  bgColor: string
  textColor: string
  items: ShoppingListItem[]
}

// ─── fallback items (used when API returns nothing) ────────────
const fallbackCategories: ShoppingCategory[] = [
  {
    id: 'hortifruti',
    name: 'Hortifruti',
    emoji: '🥬',
    borderColor: 'border-l-emerald-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    items: [
      { id: 'fi-1', name: 'Banana (kg)', emoji: '🍌', estimatedPrice: 5.90, weeklyQty: 2, monthlyQty: 8 },
      { id: 'fi-2', name: 'Tomate (kg)', emoji: '🍅', estimatedPrice: 8.49, weeklyQty: 1, monthlyQty: 4 },
      { id: 'fi-3', name: 'Alface', emoji: '🥬', estimatedPrice: 3.50, weeklyQty: 2, monthlyQty: 8 },
    ],
  },
  {
    id: 'laticinios',
    name: 'Laticínios',
    emoji: '🧀',
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600 dark:text-blue-400',
    items: [
      { id: 'la-1', name: 'Leite Integral 1L', emoji: '🥛', estimatedPrice: 5.99, weeklyQty: 3, monthlyQty: 12 },
      { id: 'la-2', name: 'Queijo Mussarela 400g', emoji: '🧀', estimatedPrice: 19.90, weeklyQty: 1, monthlyQty: 4 },
    ],
  },
  {
    id: 'padaria',
    name: 'Padaria',
    emoji: '🍞',
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
    items: [
      { id: 'pa-1', name: 'Pão Francês (kg)', emoji: '🥖', estimatedPrice: 14.90, weeklyQty: 2, monthlyQty: 8 },
      { id: 'pa-2', name: 'Bolo de Chocolate', emoji: '🍰', estimatedPrice: 22.00, weeklyQty: 1, monthlyQty: 2 },
    ],
  },
  {
    id: 'carnes',
    name: 'Carnes',
    emoji: '🥩',
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-600 dark:text-red-400',
    items: [
      { id: 'ca-1', name: 'Peito de Frango (kg)', emoji: '🍗', estimatedPrice: 16.90, weeklyQty: 1, monthlyQty: 4 },
      { id: 'ca-2', name: 'Carne Moída 500g', emoji: '🥩', estimatedPrice: 22.50, weeklyQty: 1, monthlyQty: 4 },
      { id: 'ca-3', name: 'Linguiça (kg)', emoji: '🌭', estimatedPrice: 19.90, weeklyQty: 1, monthlyQty: 2 },
    ],
  },
  {
    id: 'limpeza',
    name: 'Limpeza',
    emoji: '🧹',
    borderColor: 'border-l-cyan-500',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    items: [
      { id: 'li-1', name: 'Detergente 500ml', emoji: '🧴', estimatedPrice: 3.49, weeklyQty: 1, monthlyQty: 4 },
      { id: 'li-2', name: 'Sabão em Pó 1kg', emoji: '🫧', estimatedPrice: 12.90, weeklyQty: 0, monthlyQty: 1 },
    ],
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    emoji: '🥤',
    borderColor: 'border-l-purple-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-600 dark:text-purple-400',
    items: [
      { id: 'be-1', name: 'Café 500g', emoji: '☕', estimatedPrice: 18.90, weeklyQty: 1, monthlyQty: 4 },
      { id: 'be-2', name: 'Suco de Laranja 1L', emoji: '🧃', estimatedPrice: 8.50, weeklyQty: 2, monthlyQty: 8 },
      { id: 'be-3', name: 'Água Mineral 1.5L', emoji: '💧', estimatedPrice: 3.00, weeklyQty: 3, monthlyQty: 12 },
    ],
  },
]

// ─── keyword→category mapping ──────────────────────────────────
const categoryKeywords: Record<string, string[]> = {
  hortifruti: ['banana', 'tomate', 'alface', 'maçã', 'laranja', 'cebola', 'batata', 'cenoura', 'fruta', 'verdura', 'legume', 'limão', 'mamão', 'abacaxi', 'morango', 'uva', 'manga'],
  laticinios: ['leite', 'queijo', 'manteiga', 'iogurte', 'requeijão', 'creme', 'nata', 'coalhada', 'ricota', 'muçarela', 'mussarela', 'provolone', 'prato'],
  padaria: ['pão', 'bolacha', 'biscoito', 'bolo', 'torrada', 'croissant', 'rosca', 'broa', 'beiju', 'tapioca'],
  carnes: ['frango', 'boi', 'carne', 'peixe', 'camarão', 'linguiça', 'salsicha', 'bacon', 'peru', 'porco', 'costela', 'picanha', 'moída', 'file'],
  limpeza: ['detergente', 'sabão', 'desinfetante', 'amaciante', 'esponja', 'papel', 'rodo', 'vassoura', 'balde', 'limpeza', 'cloro', 'multiuso'],
  bebidas: ['café', 'suco', 'água', 'refrigerante', 'cerveja', 'vinho', 'chá', 'néctar', 'soda', 'guaraná', 'coca', 'mate'],
}

function matchCategory(productName: string): string {
  const lower = productName.toLowerCase()
  for (const [catId, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) return catId
  }
  return 'hortifruti'
}

// ─── build categories from real products ───────────────────────
function buildCategoriesFromProducts(products: ProductData[]): ShoppingCategory[] {
  const base = fallbackCategories.map((cat) => ({
    ...cat,
    items: cat.items.map((item) => ({ ...item })),
  }))

  // Try to match real products to fallback items
  for (const cat of base) {
    for (const item of cat.items) {
      const keyword = item.name.toLowerCase().split(' ')[0]
      const match = products.find((p) => p.name.toLowerCase().includes(keyword))
      if (match) {
        item.productId = match.id
        item.product = match
        item.storeName = match.storeName ?? ''
        item.estimatedPrice = match.price
      }
    }
  }

  return base
}

// ─── all visible items helper ─────────────────────────────────
function getAllVisibleItems(categories: ShoppingCategory[], isWeekly: boolean): ShoppingListItem[] {
  return categories.flatMap((cat) =>
    cat.items.filter((item) => {
      const qty = isWeekly ? item.weeklyQty : item.monthlyQty
      return qty > 0
    })
  )
}

// ─── skeleton loader ───────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="r39-smart-list-container">
      <div className="rounded-2xl overflow-hidden glassmorphism-strong">
        {/* Header skeleton */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl loading-skeleton" />
            <div className="flex-1">
              <div className="h-4 w-40 loading-skeleton mb-1.5" />
              <div className="h-3 w-28 loading-skeleton" />
            </div>
          </div>
        </div>

        {/* Toggle skeleton */}
        <div className="px-4 pb-3">
          <div className="h-8 w-48 loading-skeleton rounded-lg" />
        </div>

        {/* Category skeletons */}
        <div className="px-4 pb-4 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl p-3 loading-skeleton" style={{ height: 80 + (i % 2) * 28 }} />
          ))}
        </div>

        {/* Footer skeleton */}
        <div className="p-4 border-t border-border/30">
          <div className="h-10 loading-skeleton rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ─── empty state ───────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="r39-smart-list-container">
      <div className="rounded-2xl overflow-hidden glassmorphism-strong">
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="r39-empty-cart-icon"
          >
            <PackageOpen className="h-16 w-16 text-muted-foreground/40" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-4"
          >
            <p className="text-sm font-semibold text-muted-foreground">
              Nenhum produto disponível
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              A lista inteligente aparecerá quando houver produtos
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ─── main component ─────────────────────────────────────────────
export function SmartShoppingList() {
  const [isWeekly, setIsWeekly] = useState(true)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<ShoppingCategory[]>([])
  const [products, setProducts] = useState<ProductData[]>([])

  const cartItems = useAppStore((s) => s.cartItems)
  const addToCart = useAppStore((s) => s.addToCart)

  // fetch products
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await cachedFetch('/api/products?limit=100')
        if (cancelled) return
        const list: ProductData[] = data?.products ?? []
        setProducts(list)
        setCategories(buildCategoriesFromProducts(list))
      } catch {
        // use fallback categories
        setCategories(fallbackCategories)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // flat list of visible items
  const visibleItems = useMemo(
    () => getAllVisibleItems(categories, isWeekly),
    [categories, isWeekly]
  )

  // total estimated cost
  const estimatedTotal = useMemo(
    () =>
      visibleItems.reduce((sum, item) => {
        const qty = isWeekly ? item.weeklyQty : item.monthlyQty
        return sum + item.estimatedPrice * qty
      }, 0),
    [visibleItems, isWeekly]
  )

  // cart savings (if item has comparePrice)
  const cartSavings = useMemo(() => {
    return cartItems.reduce((sum, ci) => {
      const cp = ci.product.comparePrice
      if (cp && cp > ci.product.price) {
        return sum + (cp - ci.product.price) * ci.quantity
      }
      return sum
    }, 0)
  }, [cartItems])

  // progress: how many visible items are in cart
  const cartProductIds = useMemo(
    () => new Set(cartItems.map((ci) => ci.productId)),
    [cartItems]
  )

  const addedCount = useMemo(
    () => visibleItems.filter((item) => item.productId && cartProductIds.has(item.productId)).length,
    [visibleItems, cartProductIds]
  )

  const progressPct = visibleItems.length > 0 ? (addedCount / visibleItems.length) * 100 : 0

  // handle add single item
  const handleAddItem = useCallback(
    (item: ShoppingListItem) => {
      if (item.product && item.storeName) {
        const qty = isWeekly ? item.weeklyQty : item.monthlyQty
        addToCart(item.product, item.storeName, qty)
      }
    },
    [addToCart, isWeekly]
  )

  // handle add all items
  const handleAddAll = useCallback(() => {
    for (const item of visibleItems) {
      if (item.product && item.storeName) {
        const qty = isWeekly ? item.weeklyQty : item.monthlyQty
        addToCart(item.product, item.storeName, qty)
      }
    }
  }, [visibleItems, addToCart, isWeekly])

  // check if item is in cart
  const isInCart = useCallback(
    (item: ShoppingListItem) => !!(item.productId && cartProductIds.has(item.productId)),
    [cartProductIds]
  )

  // ─── render ──────────────────────────────────────────────────
  if (loading) return <LoadingSkeleton />
  if (categories.length === 0) return <EmptyState />

  return (
    <div className="r39-smart-list-container">
      <div className="rounded-2xl overflow-hidden glassmorphism-strong relative">
        {/* background mesh */}
        <div className="absolute inset-0 gradient-mesh opacity-15 pointer-events-none" />

        <div className="relative z-10">
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-md">
                <ShoppingCart className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold shimmer-text r62-heading-gradient">Lista Inteligente</h3>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Sugestões baseadas no seu perfil
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[9px] font-bold r39-badge-float">
              {visibleItems.length} itens
            </Badge>
          </div>

          {/* ─── Toggle Semanal / Mensal ─── */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-1.5 bg-background/60 border border-border/50 rounded-lg p-1">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsWeekly(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-md text-[11px] font-semibold transition-all ${
                  isWeekly
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CalendarDays className="h-3 w-3" />
                Semanal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsWeekly(false)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-md text-[11px] font-semibold transition-all ${
                  !isWeekly
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CalendarDays className="h-3 w-3" />
                Mensal
              </motion.button>
            </div>
          </div>

          {/* ─── Progress bar ─── */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground">
                Progresso da lista
              </span>
              <span className="text-[10px] font-bold tabular-nums text-primary">
                {addedCount}/{visibleItems.length}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 r39-progress-bar-glow"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 25 }}
              />
            </div>
          </div>

          {/* ─── Category cards ─── */}
          <div className="px-4 pb-4 space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {categories.map((cat, catIdx) => {
                const catItems = cat.items.filter((item) => {
                  const qty = isWeekly ? item.weeklyQty : item.monthlyQty
                  return qty > 0
                })

                if (catItems.length === 0) return null

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      delay: catIdx * 0.07,
                      type: 'spring' as const,
                      stiffness: 300,
                      damping: 28,
                    }}
                    className={`rounded-xl p-3 border-l-4 ${cat.borderColor} r39-category-card glass-card-hover r62-card-lift`}
                  >
                    {/* category header */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-lg">{cat.emoji}</span>
                      <span className={`text-[11px] font-bold ${cat.textColor}`}>{cat.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${cat.bgColor} ${cat.textColor}`}>
                        {catItems.length}
                      </span>
                    </div>

                    {/* items */}
                    <div className="space-y-2">
                      {catItems.map((item, itemIdx) => {
                        const qty = isWeekly ? item.weeklyQty : item.monthlyQty
                        const added = isInCart(item)

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: catIdx * 0.07 + itemIdx * 0.04,
                              type: 'spring' as const,
                              stiffness: 350,
                              damping: 25,
                            }}
                            className={`flex items-center gap-2.5 r39-item-row ${
                              added ? 'r39-item-added' : ''
                            }`}
                          >
                            {/* emoji */}
                            <span className="text-base w-6 text-center shrink-0">{item.emoji}</span>

                            {/* info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium truncate">{item.name}</p>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold tabular-nums text-foreground">
                                  {formatBRL(item.estimatedPrice * qty)}
                                </span>
                                <span className="text-[9px] text-muted-foreground">
                                  {qty}x {formatBRL(item.estimatedPrice)}
                                </span>
                              </div>
                            </div>

                            {/* add button */}
                            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                              {added ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                                  className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center"
                                >
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                </motion.div>
                              ) : (
                                <button
                                  onClick={() => handleAddItem(item)}
                                  className="h-7 w-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                                  aria-label={`Adicionar ${item.name} à lista`}
                                >
                                  <Plus className="h-3.5 w-3.5 text-primary" />
                                </button>
                              )}
                            </motion.div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* ─── Estimated total + savings ─── */}
          <div className="px-4 pb-3">
            <div className="bg-background/40 rounded-xl p-3 border border-border/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Total estimado ({isWeekly ? 'semana' : 'mês'})
                </span>
                <span className="text-sm font-bold tabular-nums">
                  {formatBRL(estimatedTotal)}
                </span>
              </div>

              <AnimatePresence>
                {cartSavings > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5"
                  >
                    <TrendingDown className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Economizando {formatBRL(cartSavings)} no carrinho!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── Comprar lista completa button ─── */}
          <div className="px-4 pb-4">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleAddAll}
                className="w-full h-10 text-xs font-bold rounded-xl gap-2 btn-glow btn-shine bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Comprar lista completa
                {addedCount === visibleItems.length && visibleItems.length > 0 && (
                  <Badge className="ml-1 text-[8px] bg-white/20 text-white border-0 hover:bg-white/30">
                    ✓ Completo
                  </Badge>
                )}
              </Button>
            </motion.div>
          </div>

          {/* ─── Footer ─── */}
          <div className="px-4 py-2.5 border-t border-border/30 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Lista gerada pela IA com base em padrões de compra</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartShoppingList
