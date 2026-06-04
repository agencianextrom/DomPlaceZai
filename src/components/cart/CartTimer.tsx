'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Lock, Clock, AlertTriangle, Timer, RotateCcw, ShoppingCart, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'

/* ───────────────────────────────────────────────────────────────
   Constants
   ─────────────────────────────────────────────────────────────── */

const INITIAL_SECONDS = 15 * 60 // 15 minutes
const EXTEND_SECONDS = 10 * 60 // 10 minutes extension
const STORAGE_KEY = 'domplace-cart-timer-end'
const WARNING_THRESHOLD = 5 * 60 // 5 minutes = red zone
const AMBER_THRESHOLD = 10 * 60 // 10 minutes = amber zone

/* ───────────────────────────────────────────────────────────────
   Timer color helpers
   ─────────────────────────────────────────────────────────────── */

type TimerColor = 'green' | 'amber' | 'red'

function getTimerColor(seconds: number): TimerColor {
  if (seconds <= WARNING_THRESHOLD) return 'red'
  if (seconds <= AMBER_THRESHOLD) return 'amber'
  return 'green'
}

const colorMap: Record<TimerColor, { ring: string; text: string; bg: string; badge: string; glow: string; particle: string }> = {
  green: {
    ring: 'stroke-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'from-emerald-500/10 to-green-500/10 dark:from-emerald-900/20 dark:to-green-900/20',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
    glow: 'rgba(16, 185, 129, 0.2)',
    particle: 'bg-emerald-400',
  },
  amber: {
    ring: 'stroke-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'from-amber-500/10 to-yellow-500/10 dark:from-amber-900/20 dark:to-yellow-900/20',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
    glow: 'rgba(245, 158, 11, 0.2)',
    particle: 'bg-amber-400',
  },
  red: {
    ring: 'stroke-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'from-red-500/10 to-orange-500/10 dark:from-red-900/20 dark:to-orange-900/20',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800/40',
    glow: 'rgba(239, 68, 68, 0.25)',
    particle: 'bg-red-400',
  },
}

/* ───────────────────────────────────────────────────────────────
   Session storage helpers
   ─────────────────────────────────────────────────────────────── */

function loadTimerEnd(): number | null {
  if (typeof window === 'undefined') return null
  try {
    const val = sessionStorage.getItem(STORAGE_KEY)
    return val ? parseInt(val, 10) : null
  } catch {
    return null
  }
}

function saveTimerEnd(endTime: number): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, String(endTime))
  } catch {
    // ignore
  }
}

function clearTimerEnd(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/* ───────────────────────────────────────────────────────────────
   Circular SVG progress ring
   ─────────────────────────────────────────────────────────────── */

function ProgressRing({
  progress,
  color,
  size = 120,
  strokeWidth = 6,
}: {
  progress: number
  color: TimerColor
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)
  const colors = colorMap[color]

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/50"
        />
        {/* Foreground progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          className={colors.ring}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        />
      </svg>
      {/* Glow effect behind the ring */}
      <motion.div
        className="absolute inset-2 rounded-full blur-md pointer-events-none"
        animate={{
          opacity: color === 'red' ? [0.3, 0.6, 0.3] : color === 'amber' ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: color === 'red' ? 1 : 2, repeat: Infinity, ease: 'easeInOut' as const }}
        style={{ backgroundColor: colors.glow }}
      />
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Animated timer digit
   ─────────────────────────────────────────────────────────────── */

function TimerDigit({ value, color, isUrgent }: { value: string; color: TimerColor; isUrgent: boolean }) {
  const colors = colorMap[color]

  return (
    <motion.span
      key={value}
      initial={isUrgent ? { scale: 1.15 } : { scale: 1 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
      className={`text-3xl sm:text-4xl font-bold tabular-nums ${colors.text}`}
    >
      {value}
    </motion.span>
  )
}

/* ───────────────────────────────────────────────────────────────
   Floating particles matching timer color
   ─────────────────────────────────────────────────────────────── */

function TimerParticles({ color }: { color: TimerColor }) {
  const colors = colorMap[color]
  const particles = useMemo(() => [
    { x: '15%', y: '20%', delay: 0, size: 4 },
    { x: '80%', y: '15%', delay: 0.8, size: 3 },
    { x: '70%', y: '75%', delay: 1.6, size: 4 },
    { x: '25%', y: '80%', delay: 2.4, size: 3 },
  ], [])

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${colors.particle} pointer-events-none`}
          style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
          animate={{
            opacity: [0, 0.6, 0.6, 0],
            scale: [0, 1, 0.7, 0],
            y: [0, -10, -20, -30],
          }}
          transition={{
            duration: color === 'red' ? 1.8 : 2.5,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeOut' as const,
            repeatDelay: color === 'red' ? 0.3 : 0.8,
          }}
        />
      ))}
    </>
  )
}

/* ───────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ─────────────────────────────────────────────────────────────── */

export function CartTimer() {
  const { cartItems, getCartItemCount } = useAppStore()
  const cartItemCount = getCartItemCount()

  // Timer end timestamp from sessionStorage
  const [timerEnd, setTimerEnd] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number>(INITIAL_SECONDS)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasExpired, setHasExpired] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastTickRef = useRef<number>(Date.now())

  // Initialize or restore timer
  useEffect(() => {
    if (cartItemCount === 0) {
      setTimerEnd(null)
      clearTimerEnd()
      return
    }

    const stored = loadTimerEnd()
    if (stored && stored > Date.now()) {
      setTimerEnd(stored)
    } else {
      const newEnd = Date.now() + INITIAL_SECONDS * 1000
      setTimerEnd(newEnd)
      saveTimerEnd(newEnd)
    }
  }, [cartItemCount])

  // Countdown tick
  useEffect(() => {
    if (!timerEnd) return

    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.round((timerEnd - now) / 1000))
      setSecondsLeft(remaining)

      if (remaining <= 0 && !hasExpired) {
        setHasExpired(true)
        clearTimerEnd()
        // Auto-collapse after a brief moment
        setTimeout(() => setIsCollapsed(true), 1500)
      }

      lastTickRef.current = now
    }, 1000)

    return () => clearInterval(interval)
  }, [timerEnd, hasExpired])

  // Pause when tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsVisible(false)
        // Freeze timer end — adjust forward by hidden time on return
      } else {
        setIsVisible(true)
        if (timerEnd && secondsLeft > 0) {
          // Adjust timer end by the time hidden
          const adjustment = Date.now() - lastTickRef.current
          setTimerEnd(prev => prev ? prev + adjustment : prev)
          saveTimerEnd(timerEnd + adjustment)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [timerEnd, secondsLeft])

  // Extend timer
  const handleExtend = useCallback(() => {
    const currentRemaining = secondsLeft
    const newEnd = Date.now() + (currentRemaining + EXTEND_SECONDS) * 1000
    setTimerEnd(newEnd)
    saveTimerEnd(newEnd)
    setHasExpired(false)
    setIsCollapsed(false)
  }, [secondsLeft])

  // Don't show if no items
  if (cartItemCount === 0) return null

  const color = getTimerColor(secondsLeft)
  const colors = colorMap[color]
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const progress = secondsLeft / INITIAL_SECONDS
  const isUrgent = color === 'red'

  return (
    <AnimatePresence>
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
          className="mb-4"
        >
          <div
            className={`relative rounded-2xl border overflow-hidden bg-gradient-to-br ${colors.bg} backdrop-blur-md border-border/50`}
          >
            <TimerParticles color={color} />

            <div className="relative z-10 p-4 flex flex-col sm:flex-row items-center gap-4">
              {/* Left: Circular ring with time */}
              <div className="relative flex flex-col items-center shrink-0">
                <ProgressRing progress={progress} color={color} size={100} strokeWidth={5} />

                {/* Time display centered on ring */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-0.5">
                    <TimerDigit value={String(minutes).padStart(2, '0')} color={color} isUrgent={isUrgent} />
                    <span className={`text-xl font-bold ${colors.text} animate-pulse-slow`}>:</span>
                    <TimerDigit value={String(seconds).padStart(2, '0')} color={color} isUrgent={isUrgent} />
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-0.5">restantes</span>
                </div>
              </div>

              {/* Right: Info */}
              <div className="flex-1 text-center sm:text-left">
                {/* Title */}
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <motion.div
                    animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const }}
                    className="h-8 w-8 rounded-xl bg-white/80 dark:bg-card/80 flex items-center justify-center shadow-sm"
                  >
                    <Lock className={`h-4 w-4 ${colors.text}`} />
                  </motion.div>
                  <div>
                    <h3 className={`text-sm font-bold ${colors.text} flex items-center gap-1.5`}>
                      Seu carrinho está reservado
                      <Shield className="h-3.5 w-3.5" />
                    </h3>
                  </div>
                </div>

                {/* Status message */}
                <AnimatePresence mode="wait">
                  {hasExpired ? (
                    <motion.div
                      key="expired"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center justify-center sm:justify-start gap-1.5"
                    >
                      <Badge className={`${colors.badge} text-[10px] font-bold gap-1 border`}>
                        <AlertTriangle className="h-3 w-3" />
                        Sua reserva expirou!
                      </Badge>
                    </motion.div>
                  ) : isUrgent ? (
                    <motion.div
                      key="urgent"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      <motion.p
                        className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center justify-center sm:justify-start gap-1"
                        animate={{ opacity: [1, 0.6, 1] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' as const }}
                      >
                        <Zap className="h-3 w-3" />
                        Compre antes que expire!
                      </motion.p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="safe"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                        <Clock className="h-3 w-3" />
                        Reserve por mais tempo para garantir seus itens
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Items count */}
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'} no carrinho
                </p>

                {/* Extend button */}
                <div className="mt-3">
                  <motion.div whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                    <Button
                      size="sm"
                      className={`h-8 text-[11px] gap-1.5 rounded-lg ${
                        hasExpired
                          ? 'bg-red-500 hover:bg-red-600 text-white border-0'
                          : `${colors.badge} border hover:opacity-80`
                      }`}
                      onClick={handleExtend}
                    >
                      <RotateCcw className="h-3 w-3" />
                      {hasExpired ? 'Reativar reserva' : 'Prolongar por 10 min'}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Bottom progress strip */}
            <div className="h-1 bg-muted/50 relative overflow-hidden">
              <motion.div
                className={`h-full ${
                  color === 'green'
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                    : color === 'amber'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                      : 'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' as const }}
              />
              {/* Sweep shimmer on urgent */}
              {isUrgent && (
                <motion.div
                  className="absolute inset-0"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                  <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
