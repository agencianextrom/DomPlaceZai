'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { ProductData } from '@/store/useAppStore'

interface StockUrgencyProps {
  stock?: number
  maxStock?: number
  product?: ProductData
  variant?: 'card' | 'detail'
}

/* r27 animated stock counter */
function useStockCountdown(stock: number) {
  const [displayed, setDisplayed] = useState(stock)
  useEffect(() => {
    const start = Date.now()
    const duration = 800
    const step = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * stock))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [stock])
  return displayed
}

export function StockUrgency({
  stock: stockProp,
  maxStock = 50,
  product,
  variant = 'card',
}: StockUrgencyProps) {
  // Merge props: accept either direct stock or product.stock
  const stock = stockProp ?? product?.stock ?? 50
  const resolvedMaxStock = maxStock

  const percentage = Math.min((stock / resolvedMaxStock) * 100, 100)
  const isVeryLow = stock <= 5
  const isLow = stock <= 15
  const stockDisplay = useStockCountdown(stock)

  // Don't show for very high stock in card mode
  if (variant === 'card' && stock > 100) return null

  // -- Card variant (compact) ------------------------------
  if (variant === 'card') {
    if (stock > 50) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1"
        >
          <div className="flex items-center gap-1">
            <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-emerald-400/60 progress-animated"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[8px] text-emerald-500/70 font-medium shrink-0">Em estoque</span>
          </div>
        </motion.div>
      )
    }

    if (isVeryLow) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
          className={`mt-1.5 flex items-center gap-1.5 urgency-pulse r27-critical-warning`}
        >
          <div className="h-1.5 flex-1 rounded-full bg-red-100 dark:bg-red-900/30 overflow-hidden r27-stock-shimmer">
            <motion.div
              className="h-full rounded-full bg-red-500 progress-animated r27-stock-shimmer"
              style={{ width: `${percentage}%` }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </div>
          <span className="text-[9px] font-bold text-red-500 shrink-0 r27-stock-pulse-red">
            <span className="r27-flame-bounce">🔥</span> {stockDisplay} restantes!
          </span>
        </motion.div>
      )
    }

    if (isLow) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
          className="mt-1.5 flex items-center gap-1.5"
        >
          <div className="h-1.5 flex-1 rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden r27-stock-shimmer">
            <motion.div
              className="h-full rounded-full bg-amber-500 progress-animated r27-stock-shimmer"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 shrink-0 r27-stock-pulse-amber">
            ⚡ Poucas unidades!
          </span>
        </motion.div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-1.5 flex items-center gap-1.5"
      >
        <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-emerald-400/60 progress-animated r27-stock-shimmer"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-[8px] text-emerald-500/70 font-medium shrink-0">✓ Em estoque</span>
      </motion.div>
    )
  }

  // -- Detail variant (full featured) ----------------------
  if (isVeryLow) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.25 }}
        whileHover={{ scale: 1.01 }}
        className="flex items-center gap-3 mt-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200/60 dark:border-red-800/40 urgency-pulse r27-critical-warning"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
          className="text-lg r27-flame-bounce"
        >
          🔥
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-red-600 dark:text-red-400 r27-stock-pulse-red">
            Apenas {stockDisplay} {stock === 1 ? 'restante!' : 'restantes!'}
          </p>
          <div className="h-2 rounded-full bg-red-200/60 dark:bg-red-800/40 overflow-hidden mt-1.5 r27-stock-shimmer">
            <motion.div
              className="h-full rounded-full bg-red-500 progress-animated r27-stock-shimmer"
              style={{ width: `${percentage}%` }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </div>
        </div>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
          className="text-[9px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-md shrink-0 r27-badge-pulse"
        >
          URGENTE
        </motion.span>
      </motion.div>
    )
  }

  if (isLow) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex items-center gap-3 mt-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200/50 dark:border-amber-800/30"
      >
        <span className="text-lg">⚡</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400 r27-stock-pulse-amber">
            Poucas unidades!
          </p>
          <div className="h-2 rounded-full bg-amber-200/60 dark:bg-amber-800/40 overflow-hidden mt-1.5 r27-stock-shimmer">
            <motion.div
              className="h-full rounded-full bg-amber-500 progress-animated r27-stock-shimmer"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <Badge variant="outline" className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-amber-200/60 dark:border-amber-700/40 shrink-0">
          {stock} restantes
        </Badge>
      </motion.div>
    )
  }

  // Good stock
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 22, delay: 0.25 }}
      className="flex items-center gap-3 mt-3 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200/50 dark:border-emerald-800/30"
    >
      <span className="text-sm">✓</span>
      <div className="flex-1">
        <div className="h-2 rounded-full bg-emerald-200/60 dark:bg-emerald-800/40 overflow-hidden r27-stock-shimmer">
          <motion.div
            className="h-full rounded-full bg-emerald-500 progress-animated r27-stock-shimmer"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        Em estoque
      </span>
    </motion.div>
  )
}
