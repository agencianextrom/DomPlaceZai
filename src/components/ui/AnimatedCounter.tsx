'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface AnimatedCounterProps {
  /** Target value to count to */
  value: number
  /** Animation duration in ms (default: 1200) */
  duration?: number
  /** Number of decimal places (default: 0) */
  decimals?: number
  /** Text prefix (e.g. "R$") */
  prefix?: string
  /** Text suffix (e.g. "%") */
  suffix?: string
  /** Delay before starting (ms, default: 0) */
  delay?: number
  /** Easing function name (default: 'easeOutCubic') */
  easing?: 'linear' | 'easeOut' | 'easeOutCubic' | 'easeInOutQuart'
  /** Whether to format with locale (default: false) */
  locale?: boolean
  /** Additional CSS class names */
  className?: string
  /** Enable animation (default: true, set false to show final value instantly) */
  animate?: boolean
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 2)
}

const easingMap = {
  linear: (t: number) => t,
  easeOut,
  easeOutCubic,
  easeInOutQuart,
}

export function AnimatedCounter({
  value,
  duration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  delay = 0,
  easing = 'easeOutCubic',
  locale = false,
  className = '',
  animate = true,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  const easingFn = easingMap[easing]

  const animateValue = useCallback(() => {
    const delayTimeout = setTimeout(() => {
      startRef.current = performance.now()

      function frame(now: number) {
        if (startRef.current === null) return
        const elapsed = now - startRef.current
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easingFn(progress)

        const current = easedProgress * value
        setDisplayValue(current)

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(frame)
        } else {
          setDisplayValue(value)
        }
      }

      rafRef.current = requestAnimationFrame(frame)
    }, delay)

    return () => clearTimeout(delayTimeout)
  }, [value, duration, delay, easingFn])

  useEffect(() => {
    if (!animate) {
      return undefined
    }

    const cleanup = animateValue()

    return () => {
      cleanup()
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [animate, animateValue])

  // When animate is false, derive display from value directly
  const resolvedValue = animate ? displayValue : value

  const formatted = locale
    ? resolvedValue.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : resolvedValue.toFixed(decimals)

  return (
    <span className={className} aria-label={`${prefix}${value}${suffix}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
