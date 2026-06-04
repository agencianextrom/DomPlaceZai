'use client'

import { motion } from 'framer-motion'

interface StoreStatusBadgeProps {
  isOpen: boolean
  closingTime?: string
}

/**
 * Determine if store is closing soon (within 30 minutes).
 * "Fechando em breve" state for gradient border.
 */
function isClosingSoon(closingTime?: string): boolean {
  if (!closingTime) return false
  const now = new Date()
  const brasiliaOffset = 3 * 60
  const utcMins = now.getUTCHours() * 60 + now.getUTCMinutes()
  const currentMins = (utcMins - brasiliaOffset + 24 * 60) % (24 * 60)
  const [h, m] = closingTime.split(':').map(Number)
  const closeMins = h * 60 + m
  const diff = closeMins - currentMins
  return diff > 0 && diff <= 30
}

export function StoreStatusBadge({ isOpen, closingTime }: StoreStatusBadgeProps) {
  const closingSoon = isClosingSoon(closingTime)

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      whileHover={{
        scale: 1.08,
        boxShadow: isOpen
          ? '0 0 12px rgba(16, 185, 129, 0.4), 0 2px 8px rgba(16, 185, 129, 0.2)'
          : '0 0 8px rgba(100, 100, 100, 0.2)',
      }}
      className={`
        relative inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full
        ssb-badge-glow
        ${closingSoon && isOpen
          ? 'ssb-closing-border bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
          : isOpen
            ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-muted text-muted-foreground'
        }
      `}
    >
      {/* Animated pulse dot */}
      <span className="relative flex h-2 w-2">
        {isOpen && (
          <motion.span
            className={`absolute inline-flex h-full w-full rounded-full ssb-dot-pulse ${
              closingSoon
                ? 'bg-amber-500 opacity-75'
                : 'bg-emerald-500 opacity-75'
            }`}
            animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {!isOpen && (
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full bg-red-500/60"
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            closingSoon
              ? 'bg-amber-500'
              : isOpen
                ? 'bg-emerald-500'
                : 'bg-muted-foreground/50'
          }`}
        />
      </span>

      {/* Status text with shimmer for open state */}
      {closingSoon && isOpen ? (
        <span className="ssb-text-shimmer">
          Fechando em breve
        </span>
      ) : isOpen ? (
        <span className="ssb-text-shimmer">
          Aberto{closingTime ? ` · fecha às ${closingTime}` : ''}
        </span>
      ) : (
        <span>Fechado</span>
      )}
    </motion.span>
  )
}
