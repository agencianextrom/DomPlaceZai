'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Minus, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuantityStepperProps {
  /** Current quantity value */
  value: number
  /** Callback when quantity changes */
  onChange: (value: number) => void
  /** Minimum allowed value (default: 1) */
  min?: number
  /** Maximum allowed value (default: 99) */
  max?: number
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Disable the stepper */
  disabled?: boolean
  /** Show quantity label */
  showLabel?: boolean
  /** Label text */
  label?: string
  /** Whether to enable long-press for rapid increment/decrement */
  enableLongPress?: boolean
  /** Delay before long-press starts (ms) */
  longPressDelay?: number
  /** Interval between long-press increments (ms) */
  longPressInterval?: number
  /** Additional CSS classes */
  className?: string
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
  showLabel = false,
  label = 'Quantidade',
  enableLongPress = true,
  longPressDelay = 500,
  longPressInterval = 80,
  className = '',
}: QuantityStepperProps) {
  const [isAnimating, setIsAnimating] = useState<'up' | 'down' | null>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPressedRef = useRef(false)

  const sizeConfig = {
    sm: {
      container: 'h-9 w-9 min-h-[44px] min-w-[44px]',
      button: 'h-9 w-9 min-h-[44px] min-w-[44px]',
      display: 'min-w-[2rem] h-7 text-xs',
      icon: 'h-3 w-3',
    },
    md: {
      container: 'h-9 w-9',
      button: 'h-9 w-9',
      display: 'min-w-[2.5rem] h-9 text-sm',
      icon: 'h-4 w-4',
    },
    lg: {
      container: 'h-11 w-11',
      button: 'h-11 w-11',
      display: 'min-w-[3rem] h-11 text-base',
      icon: 'h-5 w-5',
    },
  }

  const config = sizeConfig[size]
  const isMin = value <= min
  const isMax = value >= max

  const handleChange = useCallback(
    (newValue: number) => {
      const clamped = Math.max(min, Math.min(max, newValue))
      if (clamped !== value) {
        onChange(clamped)
      }
    },
    [value, onChange, min, max]
  )

  const increment = useCallback(() => {
    if (!isMax && !disabled) {
      setIsAnimating('up')
      handleChange(value + 1)
      setTimeout(() => setIsAnimating(null), 150)
    }
  }, [value, isMax, disabled, handleChange])

  const decrement = useCallback(() => {
    if (!isMin && !disabled) {
      setIsAnimating('down')
      handleChange(value - 1)
      setTimeout(() => setIsAnimating(null), 150)
    }
  }, [value, isMin, disabled, handleChange])

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
      if (!enableLongPress || disabled) return
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
        }, longPressInterval)
      }, longPressDelay)
    },
    [enableLongPress, disabled, longPressDelay, longPressInterval, isMax, isMin, value, handleChange, clearTimers]
  )

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showLabel && (
        <span className="text-xs text-muted-foreground mr-1">{label}</span>
      )}

      <div className="flex items-center rounded-xl border border-border bg-secondary/30 overflow-hidden">
        {/* Decrement button */}
        <motion.button
          whileTap={disabled || isMin ? {} : { scale: 0.85 }}
          onMouseDown={() => startLongPress('decrement')}
          onMouseUp={clearTimers}
          onMouseLeave={clearTimers}
          onTouchStart={() => startLongPress('decrement')}
          onTouchEnd={clearTimers}
          onTouchCancel={clearTimers}
          disabled={disabled || isMin}
          className={`
            ${config.button} flex items-center justify-center transition-colors shrink-0
            ${disabled || isMin
              ? 'text-muted-foreground/30 cursor-not-allowed'
              : 'text-foreground hover:bg-muted active:bg-muted/80 cursor-pointer'
            }
          `}
          aria-label="Diminuir quantidade"
        >
          <Minus className={config.icon} />
        </motion.button>

        {/* Value display */}
        <div className={`
          ${config.display} flex items-center justify-center font-semibold tabular-nums select-none
          border-x border-border bg-background
        `}>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              initial={isAnimating === 'up' ? { y: 10, opacity: 0 } : isAnimating === 'down' ? { y: -10, opacity: 0 } : { opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={isAnimating === 'up' ? { y: -10, opacity: 0 } : { y: 10, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="block"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Increment button */}
        <motion.button
          whileTap={disabled || isMax ? {} : { scale: 0.85 }}
          onMouseDown={() => startLongPress('increment')}
          onMouseUp={clearTimers}
          onMouseLeave={clearTimers}
          onTouchStart={() => startLongPress('increment')}
          onTouchEnd={clearTimers}
          onTouchCancel={clearTimers}
          disabled={disabled || isMax}
          className={`
            ${config.button} flex items-center justify-center transition-colors shrink-0
            ${disabled || isMax
              ? 'text-muted-foreground/30 cursor-not-allowed'
              : 'text-foreground hover:bg-muted active:bg-muted/80 cursor-pointer'
            }
          `}
          aria-label="Aumentar quantidade"
        >
          <Plus className={config.icon} />
        </motion.button>
      </div>

      {value >= max && (
        <motion.span
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[10px] text-muted-foreground"
        >
          Max {max}
        </motion.span>
      )}
    </div>
  )
}
