'use client'

import { useState, useMemo, useEffect, useCallback, useRef, Fragment } from 'react'
import { motion, AnimatePresence, useMotionValue, animate as motionAnimate } from 'framer-motion'
import { Plus, Minus, Check, Sparkles, TrendingDown, Zap, Crown, Package } from 'lucide-react'
import { formatBRL } from '@/lib/format'

// ── Types ────────────────────────────────────────────────────────────────────

interface BulkBuyCalculatorProps {
  price: number
}

interface PricingTier {
  min: number
  max: number | null
  discount: number
  label: string
  badge?: string
  badgeColor?: string
}

// ── Constants ───────────────────────────────────────────────────────────────

const PRICING_TIERS: PricingTier[] = [
  { min: 1, max: 2, discount: 0, label: '1–2 un.', badge: undefined, badgeColor: undefined },
  { min: 3, max: 5, discount: 0.1, label: '3–5 un.', badge: 'Mais popular', badgeColor: 'from-blue-500 to-indigo-500' },
  { min: 6, max: 10, discount: 0.15, label: '6–10 un.', badge: undefined, badgeColor: undefined },
  { min: 11, max: null, discount: 0.2, label: '11+ un.', badge: 'Melhor valor', badgeColor: 'from-amber-500 to-orange-500' },
]

const MAX_QUANTITY = 99

// ── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
}

const tierCardVariants = {
  inactive: { scale: 1, opacity: 0.6 },
  active: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
}

const checkmarkPopVariants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 20 },
  },
  exit: {
    scale: 0,
    rotate: 180,
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCurrentTier(quantity: number): PricingTier {
  for (let i = PRICING_TIERS.length - 1; i >= 0; i--) {
    const tier = PRICING_TIERS[i]
    if (quantity >= tier.min) return tier
  }
  return PRICING_TIERS[0]
}

function getNextTier(quantity: number): PricingTier | null {
  const current = getCurrentTier(quantity)
  const idx = PRICING_TIERS.indexOf(current)
  return idx < PRICING_TIERS.length - 1 ? PRICING_TIERS[idx + 1] : null
}

function getTierIndex(tier: PricingTier): number {
  return PRICING_TIERS.indexOf(tier)
}

function calculateTotal(price: number, quantity: number, discount: number): number {
  return price * quantity * (1 - discount)
}

function calculateSavings(price: number, quantity: number, discount: number): number {
  return price * quantity * discount
}

function getProgressToNextTier(quantity: number): number {
  const next = getNextTier(quantity)
  if (!next) return 100
  const current = getCurrentTier(quantity)
  const range = next.min - current.min
  const progress = quantity - current.min
  return Math.min((progress / range) * 100, 100)
}

// ── Animated Counter Component ──────────────────────────────────────────────

function AnimatedCounter({ value }: { value: number }) {
  const motionVal = useMotionValue(0)
  const [display, setDisplay] = useState(formatBRL(0))

  useEffect(() => {
    const unsub = motionVal.on('change', (v) => setDisplay(formatBRL(v)))
    motionAnimate(motionVal, value, { duration: 0.5, ease: 'easeOut' })
    return unsub
  }, [value, motionVal])

  return <span>{display}</span>
}

// ── Sub-Components ──────────────────────────────────────────────────────────

function QuantitySelector({
  quantity,
  onQuantityChange,
}: {
  quantity: number
  onQuantityChange: (q: number) => void
}) {
  const canDecrease = quantity > 1
  const canIncrease = quantity < MAX_QUANTITY

  return (
    <div className="flex items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => canDecrease && onQuantityChange(quantity - 1)}
        disabled={!canDecrease}
        className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
          canDecrease
            ? 'bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/30'
            : 'bg-muted text-muted-foreground/30'
        }`}
      >
        <Minus className="h-4 w-4" />
      </motion.button>

      <motion.div
        key={quantity}
        className="w-16 h-10 rounded-xl bg-card border border-border flex items-center justify-center"
        initial={{ scale: 1.15, borderColor: 'rgba(16, 185, 129, 0.5)' }}
        animate={{ scale: 1, borderColor: 'rgba(0,0,0,0.1)' }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={quantity}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
            className="text-lg font-bold"
          >
            {quantity}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => canIncrease && onQuantityChange(quantity + 1)}
        disabled={!canIncrease}
        className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
          canIncrease
            ? 'bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/30'
            : 'bg-muted text-muted-foreground/30'
        }`}
      >
        <Plus className="h-4 w-4" />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onQuantityChange(1)}
        className="ml-2 min-h-[44px] px-3 rounded-lg bg-muted text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      >
        Limpar
      </motion.button>
    </div>
  )
}

function TierRow({
  tier,
  unitPrice,
  quantity,
  isActive,
  tierIndex,
}: {
  tier: PricingTier
  unitPrice: number
  quantity: number
  isActive: boolean
  tierIndex: number
}) {
  const discountedPrice = unitPrice * (1 - tier.discount)
  const isInTier = quantity >= tier.min && (tier.max === null || quantity <= tier.max)
  const BadgeIcon = tier.badge === 'Melhor valor' ? Crown : Zap

  return (
    <motion.div
      className={`relative rounded-xl p-3 transition-all ${
        isActive
          ? 'bg-gradient-to-r from-primary/10 via-emerald-500/5 to-primary/10 border-2 border-primary/40 shadow-lg shadow-primary/10'
          : 'bg-card border border-border/60 hover:border-primary/20'
      }`}
      variants={tierCardVariants}
      animate={isActive ? 'active' : 'inactive'}
    >
      {isActive && (
        <motion.div
          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {tier.discount > 0 ? `${Math.round(tier.discount * 100)}%` : '—'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold">{tier.label}</span>
              {tier.badge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.1 }}
                >
                  <span
                    className={`inline-flex items-center gap-0.5 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md bg-gradient-to-r ${tier.badgeColor}`}
                  >
                    <BadgeIcon className="h-2.5 w-2.5" />
                    {tier.badge}
                  </span>
                </motion.div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {tier.discount > 0
                ? `Desconto de ${Math.round(tier.discount * 100)}%`
                : 'Preço normal'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
            {formatBRL(discountedPrice)}
            <span className="text-[10px] font-normal text-muted-foreground">/un.</span>
          </p>
          {tier.discount > 0 && (
            <p className="text-[10px] text-muted-foreground line-through">
              {formatBRL(unitPrice)}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isInTier && (
          <motion.div
            variants={checkmarkPopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-2 right-2"
          >
            <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PriceBreakdownTable({
  price,
  quantity,
  discount,
}: {
  price: number
  quantity: number
  discount: number
}) {
  const subtotal = price * quantity
  const savingsAmt = subtotal * discount
  const total = subtotal - savingsAmt
  const perUnit = quantity > 0 ? total / quantity : price

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-xl border border-border p-3 space-y-2"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Package className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold">Resumo do pedido</span>
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Preço unitário original</span>
        <span className="font-medium">{formatBRL(price)}</span>
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Quantidade</span>
        <span className="font-medium">{quantity} un.</span>
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatBRL(subtotal)}</span>
      </div>

      {discount > 0 && (
        <Fragment>
          <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Desconto ({Math.round(discount * 100)}%)
            </span>
            <span className="font-bold">-{formatBRL(savingsAmt)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-sm">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-bold text-primary">{formatBRL(total)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Preço por unidade</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatBRL(perUnit)}/un.</span>
          </div>
        </Fragment>
      )}

      {discount === 0 && (
        <div className="border-t border-border pt-2 flex justify-between text-sm">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-bold text-primary">{formatBRL(total)}</span>
        </div>
      )}
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function BulkBuyCalculator({ price }: BulkBuyCalculatorProps) {
  const [quantity, setQuantity] = useState(1)
  const prevTierIndexRef = useRef(0)
  const [showTierAnimation, setShowTierAnimation] = useState(false)

  const currentTier = getCurrentTier(quantity)
  const nextTier = getNextTier(quantity)
  const tierIndex = getTierIndex(currentTier)

  const total = useMemo(() => calculateTotal(price, quantity, currentTier.discount), [price, quantity, currentTier.discount])
  const savings = useMemo(() => calculateSavings(price, quantity, currentTier.discount), [price, quantity, currentTier.discount])
  const progress = useMemo(() => getProgressToNextTier(quantity), [quantity])

  // Tier change animation trigger (detect during rendering, timeout in effect)
  if (tierIndex !== prevTierIndexRef.current && quantity > 1) {
    prevTierIndexRef.current = tierIndex
    setShowTierAnimation(true)
  }

  useEffect(() => {
    if (showTierAnimation) {
      const timeout = setTimeout(() => setShowTierAnimation(false), 1500)
      return () => clearTimeout(timeout)
    }
  }, [showTierAnimation])

  const handleQuantityChange = useCallback((newQty: number) => {
    setQuantity(Math.max(1, Math.min(MAX_QUANTITY, newQty)))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
      className="bg-card rounded-xl border border-border p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <motion.div
          className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-4 w-4 text-white" />
        </motion.div>
        <div>
          <h3 className="text-sm font-bold">Compre mais, pague menos</h3>
          <p className="text-[10px] text-muted-foreground">Descontos progressivos por volume</p>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Quantidade desejada</span>
        <QuantitySelector quantity={quantity} onQuantityChange={handleQuantityChange} />
      </div>

      {/* Savings indicator */}
      {savings > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <TrendingDown className="h-3.5 w-3.5 text-white" />
            </motion.div>
            <div>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Você economiza</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500">
                com desconto de {Math.round(currentTier.discount * 100)}%
              </p>
            </div>
          </div>
          <motion.span
            key={savings}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            className="text-lg font-bold text-emerald-600 dark:text-emerald-400"
          >
            <AnimatedCounter value={savings} />
          </motion.span>
        </motion.div>
      )}

      {/* Progress bar to next tier */}
      {nextTier && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              Próximo desconto: <span className="font-bold text-primary">{nextTier.label}</span>
            </span>
            <span className="font-medium">
              {nextTier.min - quantity > 0
                ? `Faltam ${nextTier.min - quantity} un.`
                : 'Desconto aplicado!'}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 25 }}
            />
          </div>
        </div>
      )}

      {/* Tier change animation overlay */}
      <AnimatePresence>
        {showTierAnimation && currentTier.discount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
            className="flex items-center gap-2 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 rounded-xl border border-primary/20 px-3 py-2"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
              className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <Check className="h-3.5 w-3.5 text-white" />
            </motion.div>
            <div>
              <p className="text-xs font-bold text-primary">Novo desconto aplicado!</p>
              <p className="text-[10px] text-muted-foreground">
                {Math.round(currentTier.discount * 100)}% de desconto — {currentTier.label}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing tiers */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-xs font-semibold">Tabela de preços</span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {PRICING_TIERS.map((tier, idx) => (
            <TierRow
              key={tier.label}
              tier={tier}
              unitPrice={price}
              quantity={quantity}
              isActive={getTierIndex(currentTier) === idx}
              tierIndex={idx}
            />
          ))}
        </motion.div>
      </div>

      {/* Price Breakdown */}
      <PriceBreakdownTable
        price={price}
        quantity={quantity}
        discount={currentTier.discount}
      />
    </motion.div>
  )
}
