'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, ShoppingCart, Tag, Sparkles, Package, Check, Percent } from 'lucide-react'
import { formatBRL } from '@/lib/format'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────────
interface BulkDiscountTier {
  minQty: number
  discount: number // e.g. 0.05 = 5%
  label: string
  emoji: string
  color: string
  borderColor: string
  bgColor: string
}

interface QuantityStepperEnhancedProps {
  product: ProductData
  value: number
  onChange: (value: number) => void
  onAddToCart?: () => void
}

// ── Constants ──────────────────────────────────────────────────────
const DISCOUNT_TIERS: BulkDiscountTier[] = [
  { minQty: 1, discount: 0, label: '1 un.', emoji: '🛒', color: 'text-muted-foreground', borderColor: 'border-border', bgColor: 'bg-secondary/30' },
  { minQty: 3, discount: 0.05, label: '3 un.', emoji: '🏷️', color: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-300/50 dark:border-emerald-700/30', bgColor: 'bg-emerald-50 dark:bg-emerald-900/15' },
  { minQty: 5, discount: 0.10, label: '5 un.', emoji: '💰', color: 'text-amber-600 dark:text-amber-400', borderColor: 'border-amber-300/50 dark:border-amber-700/30', bgColor: 'bg-amber-50 dark:bg-amber-900/15' },
  { minQty: 10, discount: 0.15, label: '10 un.', emoji: '🔥', color: 'text-orange-600 dark:text-orange-400', borderColor: 'border-orange-300/50 dark:border-orange-700/30', bgColor: 'bg-orange-50 dark:bg-orange-900/15' },
  { minQty: 20, discount: 0.20, label: '20 un.', emoji: '⭐', color: 'text-rose-600 dark:text-rose-400', borderColor: 'border-rose-300/50 dark:border-rose-700/30', bgColor: 'bg-rose-50 dark:bg-rose-900/15' },
]

const MIN_QTY = 1
const MAX_QTY = 99

// ── Animated Counter ───────────────────────────────────────────────
function AnimatedCounter({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size]

  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ y: 10, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -10, opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
        className={`inline-block tabular-nums font-bold ${sizeClass}`}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}

// ── Savings Badge ──────────────────────────────────────────────────
function SavingsBadge({ savings }: { savings: number }) {
  if (savings <= 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.7, y: 6 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
        className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200/50 dark:border-emerald-800/30 rounded-full px-3 py-1.5 mt-3"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <Tag className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          Economia de {formatBRL(savings)}
        </span>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-3 w-3 text-emerald-500" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Discount Progress Bar ──────────────────────────────────────────
function DiscountProgressBar({
  currentQty,
  activeTier,
  nextTier,
  progressPercent,
}: {
  currentQty: number
  activeTier: BulkDiscountTier
  nextTier: BulkDiscountTier | null
  progressPercent: number
}) {
  return (
    <div className="mt-3">
      {/* Active tier label */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">
            {activeTier.discount > 0 ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {activeTier.emoji} {Math.round(activeTier.discount * 100)}% de desconto ativo
              </span>
            ) : (
              <span className="text-muted-foreground">Adicione mais para desconto</span>
            )}
          </span>
        </div>
        {nextTier && (
          <span className="text-[10px] text-muted-foreground">
            Próximo: {nextTier.emoji} {Math.round(nextTier.discount * 100)}% em {nextTier.minQty} un.
          </span>
        )}
      </div>

      {/* Bar */}
      <div className="h-2.5 bg-secondary/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-emerald-500 to-amber-500 relative overflow-hidden"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25, duration: 0.5 }}
        >
          {/* Shimmer effect on bar */}
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%', '0% 0%'],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
              backgroundSize: '200% 100%',
            }}
          />
        </motion.div>
      </div>

      {/* Tier markers */}
      <div className="flex items-center gap-1 mt-1.5">
        {DISCOUNT_TIERS.filter(t => t.discount > 0).map((tier) => {
          const isActive = currentQty >= tier.minQty
          const isNext = nextTier && nextTier.minQty === tier.minQty
          return (
            <motion.div
              key={tier.minQty}
              animate={isActive
                ? { scale: [1, 1.15, 1], boxShadow: '0 0 8px oklch(0.45 0.1 155 / 0.3)' }
                : isNext
                  ? { scale: [1, 1.08, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.6, repeat: isActive || isNext ? Infinity : 0, repeatDelay: 1.5 }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold border transition-colors ${
                isActive
                  ? `${tier.bgColor} ${tier.borderColor} ${tier.color}`
                  : 'bg-transparent border-border text-muted-foreground/50'
              }`}
            >
              <span>{tier.emoji}</span>
              <span>{Math.round(tier.discount * 100)}%</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Bulk Price Calculator ──────────────────────────────────────────
function BulkPriceDisplay({
  product,
  quantity,
  activeTier,
  totalPrice,
  savings,
}: {
  product: ProductData
  quantity: number
  activeTier: BulkDiscountTier
  totalPrice: number
  savings: number
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={quantity}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        className="bg-gradient-to-r from-primary/5 via-emerald-500/5 to-amber-500/5 rounded-xl p-3 border border-primary/10 mt-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              Total ({quantity} {quantity === 1 ? 'un.' : 'un.'})
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            {savings > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-muted-foreground line-through"
              >
                {formatBRL(product.price * quantity)}
              </motion.span>
            )}
            <motion.span
              key={totalPrice}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              className="text-base font-bold text-primary"
            >
              {formatBRL(totalPrice)}
            </motion.span>
          </div>
        </div>

        {/* Per-unit price breakdown */}
        <AnimatePresence>
          {activeTier.discount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-border/50"
            >
              <span className="text-[10px] text-muted-foreground">Preço unitário:</span>
              <span className="text-[10px] text-muted-foreground line-through">
                {formatBRL(product.price)}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {formatBRL(totalPrice / quantity)} (-{Math.round(activeTier.discount * 100)}%)
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main QuantityStepper Component ──────────────────────────────────
export function QuantityStepperEnhanced({
  product,
  value,
  onChange,
  onAddToCart,
}: QuantityStepperEnhancedProps) {
  const addToCart = useAppStore((s) => s.addToCart)
  const [isPulsing, setIsPulsing] = useState<'up' | 'down' | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPressedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Compute active discount tier
  const activeTier = DISCOUNT_TIERS.reduce((best, tier) => {
    return value >= tier.minQty ? tier : best
  }, DISCOUNT_TIERS[0])

  const nextTier = DISCOUNT_TIERS.find((tier) => tier.minQty > value && tier.discount > activeTier.discount) || null

  // Calculate progress toward next tier
  const progressPercent = (() => {
    if (!nextTier) return 100
    const prevTierMin = activeTier.minQty
    const range = nextTier.minQty - prevTierMin
    const progress = value - prevTierMin
    return Math.min(100, (progress / range) * 100)
  })()

  // Calculate total price and savings
  const totalPrice = Math.round(product.price * value * (1 - activeTier.discount) * 100) / 100
  const savings = Math.round((product.price * value * activeTier.discount) * 100) / 100

  const isMin = value <= MIN_QTY
  const isMax = value >= Math.min(MAX_QTY, product.stock || MAX_QTY)
  const effectiveMax = Math.min(MAX_QTY, product.stock || MAX_QTY)

  // Handle quantity change with pulse animation
  const handleChange = useCallback(
    (newValue: number) => {
      const clamped = Math.max(MIN_QTY, Math.min(effectiveMax, newValue))
      if (clamped !== value) {
        setIsPulsing(clamped > value ? 'up' : 'down')
        onChange(clamped)
        setTimeout(() => setIsPulsing(null), 200)
      }
    },
    [value, onChange, effectiveMax]
  )

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault()
        handleChange(value + 1)
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault()
        handleChange(value - 1)
      }
    },
    [handleChange, value]
  )

  // Long press for rapid increment/decrement
  const clearTimers = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    isPressedRef.current = false
  }, [])

  const startLongPress = useCallback(
    (action: 'increment' | 'decrement') => {
      isPressedRef.current = true
      longPressTimerRef.current = setTimeout(() => {
        if (!isPressedRef.current) return
        intervalRef.current = setInterval(() => {
          if (!isPressedRef.current) {
            clearTimers()
            return
          }
          if (action === 'increment' && !isMax) {
            handleChange(value + 1)
          } else if (action === 'decrement' && !isMin) {
            handleChange(value - 1)
          }
        }, 80)
      }, 400)
    },
    [isMax, isMin, value, handleChange, clearTimers]
  )

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  // Add to cart handler
  const handleAddToCart = useCallback(() => {
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error('Produto esgotado!')
      return
    }
    addToCart(product, product.storeName || 'Loja', value)
    setJustAdded(true)
    toast.success(`${product.name} × ${value} adicionado ao carrinho!`, {
      description: savings > 0 ? `Economia de ${formatBRL(savings)} aplicada` : undefined,
    })
    onAddToCart?.()
    setTimeout(() => setJustAdded(false), 1500)
  }, [addToCart, product, value, savings, onAddToCart])

  return (
    <div ref={containerRef} className="space-y-1" onKeyDown={handleKeyDown} tabIndex={0} role="group" aria-label="Seletor de quantidade">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold flex items-center gap-1.5">
          <span className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Package className="h-3.5 w-3.5 text-primary" />
          </span>
          Quantidade
        </label>
        {product.stock > 0 && product.stock <= 5 && (
          <motion.div
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400 font-medium"
          >
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              ⚡
            </motion.span>
            Apenas {product.stock} em estoque
          </motion.div>
        )}
      </div>

      {/* Stepper + Quantity Display */}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border-2 border-border overflow-hidden bg-card shadow-sm r30-glow-border">
          {/* Minus button */}
          <motion.button
            whileTap={isMin ? {} : { scale: 0.85 }}
            onMouseDown={() => startLongPress('decrement')}
            onMouseUp={clearTimers}
            onMouseLeave={clearTimers}
            onTouchStart={() => startLongPress('decrement')}
            onTouchEnd={clearTimers}
            onTouchCancel={clearTimers}
            disabled={isMin}
            className={`
              h-12 w-12 flex items-center justify-center transition-colors shrink-0 r30-btn-press
              ${isMin
                ? 'text-muted-foreground/25 cursor-not-allowed'
                : 'text-foreground hover:bg-muted active:bg-muted/80 cursor-pointer'
              }
            `}
            aria-label="Diminuir quantidade"
          >
            <Minus className="h-5 w-5" />
          </motion.button>

          {/* Quantity display */}
          <div className={`
            relative min-w-[56px] h-12 flex items-center justify-center tabular-nums select-none
            border-x-2 border-border bg-background
          `}>
            {/* Pulse animation wrapper */}
            <motion.div
              animate={isPulsing === 'up'
                ? { scale: [1, 1.12, 1], backgroundColor: ['transparent', 'oklch(0.55 0.12 155 / 0.1)', 'transparent'] }
                : isPulsing === 'down'
                  ? { scale: [1, 0.92, 1] }
                  : { scale: 1, backgroundColor: 'transparent' }
              }
              transition={{ duration: 0.2 }}
              className="rounded-md px-1 r30-counter-pop"
            >
              <AnimatedCounter value={value} size="lg" />
            </motion.div>
          </div>

          {/* Plus button */}
          <motion.button
            whileTap={isMax ? {} : { scale: 0.85 }}
            onMouseDown={() => startLongPress('increment')}
            onMouseUp={clearTimers}
            onMouseLeave={clearTimers}
            onTouchStart={() => startLongPress('increment')}
            onTouchEnd={clearTimers}
            onTouchCancel={clearTimers}
            disabled={isMax}
            className={`
              h-12 w-12 flex items-center justify-center transition-colors shrink-0 r30-btn-press
              ${isMax
                ? 'text-muted-foreground/25 cursor-not-allowed'
                : 'text-foreground hover:bg-muted active:bg-muted/80 cursor-pointer'
              }
            `}
            aria-label="Aumentar quantidade"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Stock indicator */}
        <div className="flex-1 min-w-0">
          {product.stock > 0 ? (
            <p className="text-[10px] text-muted-foreground">
              Estoque: {product.stock > 50 ? `${product.stock}+` : product.stock} unid.
            </p>
          ) : (
            <p className="text-[10px] text-red-500 font-medium">Produto esgotado</p>
          )}

          {/* Min/max indicator */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className={`h-1 flex-1 rounded-full bg-secondary overflow-hidden`}>
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: `${(value / effectiveMax) * 100}%` }}
                animate={{ width: `${(value / effectiveMax) * 100}%` }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground tabular-nums">
              {value}/{effectiveMax}
            </span>
          </div>
        </div>
      </div>

      {/* Quick quantity shortcuts */}
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] text-muted-foreground mr-1">Rápido:</span>
        {[1, 3, 5, 10].map((qty) => {
          const tier = DISCOUNT_TIERS.find(t => t.minQty === qty)
          const isActive = value >= qty
          return (
            <motion.button
              key={qty}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleChange(qty)}
              className={`
                relative px-2.5 py-2 rounded-lg text-[11px] font-semibold border transition-all overflow-hidden min-h-[44px]
                ${isActive
                  ? `${tier?.bgColor || 'bg-secondary'} ${tier?.borderColor || 'border-border'} ${tier?.color || 'text-foreground'}`
                  : 'bg-card border-border text-muted-foreground hover:border-primary/30'
                }
              `}
            >
              {isActive && tier && tier.discount > 0 && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                    backgroundSize: '200% 100%',
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-0.5">
                {(tier?.discount ?? 0) > 0 ? (
                  <>
                    <Percent className="h-2.5 w-2.5" />
                    {qty}
                  </>
                ) : (
                  qty
                )}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Discount progress bar */}
      <DiscountProgressBar
        currentQty={value}
        activeTier={activeTier}
        nextTier={nextTier}
        progressPercent={progressPercent}
      />

      {/* Bulk price display */}
      <BulkPriceDisplay
        product={product}
        quantity={value}
        activeTier={activeTier}
        totalPrice={totalPrice}
        savings={savings}
      />

      {/* Savings badge */}
      <SavingsBadge savings={savings} />

      {/* Add to cart button */}
      <motion.div
        className="mt-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AnimatePresence mode="wait">
          {justAdded ? (
            <motion.div
              key="added"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Button
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 text-sm font-semibold shadow-md"
                disabled
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                >
                  <Check className="h-5 w-5" />
                </motion.div>
                Adicionado ao Carrinho!
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Button
                onClick={handleAddToCart}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 text-sm font-semibold shadow-md btn-glow btn-shine"
                disabled={product.stock !== undefined && product.stock <= 0}
              >
                <motion.div
                  animate={showQuickAdd ? { rotate: 360 } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <ShoppingCart className="h-5 w-5" />
                </motion.div>
                Adicionar ao Carrinho
                <span className="text-primary-foreground/70">
                  · {formatBRL(totalPrice)}
                </span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Keyboard hint */}
      <p className="text-center text-[9px] text-muted-foreground/50 mt-2 flex items-center justify-center gap-1">
        ⌨️ Use as setas ← → para ajustar quantidade
      </p>
    </div>
  )
}
