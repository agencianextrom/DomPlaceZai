'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { TrendingDown, Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PriceDropAlertProps {
  /** Current price */
  price: number
  /** Original price before drop */
  comparePrice: number
  /** Days since the price dropped (for display) */
  dropDaysAgo?: number
  /** Whether this is the lowest historical price */
  isLowest?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show inline or badge style */
  variant?: 'badge' | 'inline' | 'card'
}

export function PriceDropAlert({
  price,
  comparePrice,
  dropDaysAgo = 1,
  isLowest = false,
  size = 'sm',
  variant = 'badge',
}: PriceDropAlertProps) {
  if (!comparePrice || comparePrice <= price) return null

  const percentage = Math.round(((comparePrice - price) / comparePrice) * 100)
  const savedAmount = comparePrice - price

  if (percentage < 5) return null // Don't show for tiny drops

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2.5 py-1 gap-1',
    lg: 'text-sm px-3 py-1.5 gap-1.5',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-1.5"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full px-2 py-0.5"
        >
          <TrendingDown className={iconSizes[size]} />
          <span className="font-bold">-{percentage}%</span>
        </motion.div>
        <span className="text-muted-foreground line-through text-xs">
          R$ {comparePrice.toFixed(2).replace('.', ',')}
        </span>
      </motion.div>
    )
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-900/20 dark:via-orange-900/15 dark:to-amber-900/20 border border-red-200/50 dark:border-red-800/30 p-3"
      >
        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-bl from-red-200/30 to-transparent -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20"
          >
            <TrendingDown className="h-5 w-5 text-white" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                Queda de {percentage}%
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame className="h-3.5 w-3.5 text-orange-500" />
              </motion.div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Economia de <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ {savedAmount.toFixed(2).replace('.', ',')}</span>
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-primary">
              R$ {price.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-muted-foreground line-through">
              R$ {comparePrice.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {isLowest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 flex items-center gap-1.5"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-semibold">
                Menor preco!
              </Badge>
            </motion.div>
            <span className="text-[10px] text-muted-foreground">
              Preco mais baixo dos ultimos 30 dias
            </span>
          </motion.div>
        )}

        {dropDaysAgo <= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-2 right-2"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-red-500"
            />
          </motion.div>
        )}
      </motion.div>
    )
  }

  // Default badge variant
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex items-center"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full font-semibold shadow-md shadow-red-500/20 ${sizeClasses[size]}`}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <TrendingDown className={iconSizes[size]} />
          </motion.div>
          <span>-{percentage}%</span>
        </motion.div>

        {isLowest && size !== 'sm' && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="bg-emerald-500 text-white border-0 text-[9px] font-semibold ml-1 px-1.5 py-0">
              Menor preco!
            </Badge>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
