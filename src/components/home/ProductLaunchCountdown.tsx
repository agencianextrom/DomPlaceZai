'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Rocket, Bell, BellOff, Sparkles, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

/* ───────────────────────────────────────────────────────────────
   Static data: upcoming products with launch dates
   ─────────────────────────────────────────────────────────────── */

interface LaunchProduct {
  id: string
  name: string
  category: string
  categoryLabel: string
  emoji: string
  launchDate: Date
  gradient: string
  priceHint: string
}

function generateLaunchProducts(): LaunchProduct[] {
  const now = new Date()
  const categories: LaunchProduct[] = [
    {
      id: 'lp-1',
      name: 'Fone Bluetooth Pro',
      category: 'electronics',
      categoryLabel: 'Eletrônicos',
      emoji: '🎧',
      launchDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      gradient: 'from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30',
      priceHint: 'R$ 299,90',
    },
    {
      id: 'lp-2',
      name: 'Vestido Floral Primavera',
      category: 'fashion',
      categoryLabel: 'Moda',
      emoji: '👗',
      launchDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
      gradient: 'from-pink-100 to-rose-200 dark:from-pink-900/30 dark:to-rose-800/30',
      priceHint: 'R$ 189,90',
    },
    {
      id: 'lp-3',
      name: 'Luminária LED Inteligente',
      category: 'home',
      categoryLabel: 'Casa',
      emoji: '💡',
      launchDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      gradient: 'from-amber-100 to-yellow-200 dark:from-amber-900/30 dark:to-yellow-800/30',
      priceHint: 'R$ 149,90',
    },
    {
      id: 'lp-4',
      name: 'Tênis Running Ultralight',
      category: 'sports',
      categoryLabel: 'Esportes',
      emoji: '👟',
      launchDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      gradient: 'from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30',
      priceHint: 'R$ 459,90',
    },
    {
      id: 'lp-5',
      name: 'Kit Skincare Natural',
      category: 'beauty',
      categoryLabel: 'Beleza',
      emoji: '🧴',
      launchDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      gradient: 'from-purple-100 to-fuchsia-200 dark:from-purple-900/30 dark:to-fuchsia-800/30',
      priceHint: 'R$ 129,90',
    },
    {
      id: 'lp-6',
      name: 'Robô Programável Edu',
      category: 'toys',
      categoryLabel: 'Brinquedos',
      emoji: '🤖',
      launchDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
      gradient: 'from-cyan-100 to-teal-200 dark:from-cyan-900/30 dark:to-teal-800/30',
      priceHint: 'R$ 349,90',
    },
  ]
  return categories
}

/* ───────────────────────────────────────────────────────────────
   Countdown timer hook
   ─────────────────────────────────────────────────────────────── */

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
  progress: number
}

function useCountdown(targetDate: Date): CountdownTime {
  const [time, setTime] = useState<CountdownTime>(() => calcTime(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calcTime(targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return time
}

function calcTime(targetDate: Date): CountdownTime {
  const now = new Date()
  const diff = Math.max(0, targetDate.getTime() - now.getTime())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  // Progress: assume 30 days total launch window
  const totalWindow = 30 * 24 * 60 * 60 * 1000
  const progress = Math.min(100, Math.max(0, ((totalWindow - diff) / totalWindow) * 100))

  return { days, hours, minutes, seconds, totalMs: diff, progress }
}

/* ───────────────────────────────────────────────────────────────
   Animated digit component
   ─────────────────────────────────────────────────────────────── */

function AnimatedDigit({ value, label }: { value: number; label: string }) {
  const prevValue = useRef(value)

  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
        className="relative bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-amber-200/50 dark:border-amber-700/30 shadow-sm"
      >
        <span className="text-base sm:text-lg font-bold text-amber-700 dark:text-amber-400 tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
        {/* Pulse ring on change */}
        {value !== prevValue.current && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-amber-400/40"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            onAnimationComplete={() => { prevValue.current = value }}
          />
        )}
      </motion.div>
      <span className="text-[9px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{label}</span>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Shimmer badge component
   ─────────────────────────────────────────────────────────────── */

function ShimmerBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-full">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 dark:from-amber-600 dark:via-yellow-500 dark:to-amber-600" />
      <motion.div
        className="absolute inset-0"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 0.8 }}
      >
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg]" />
      </motion.div>
      <div className="relative px-2 py-0.5 flex items-center gap-1">
        {children}
      </div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Floating sparkles per card
   ─────────────────────────────────────────────────────────────── */

function CardSparkles() {
  const sparkConfigs = useMemo(() => [
    { x: '10%', y: '15%', delay: 0, size: 3 },
    { x: '85%', y: '10%', delay: 0.6, size: 4 },
    { x: '75%', y: '70%', delay: 1.2, size: 3 },
    { x: '20%', y: '75%', delay: 1.8, size: 4 },
    { x: '50%', y: '5%', delay: 2.4, size: 3 },
  ], [])

  return (
    <>
      {sparkConfigs.map((cfg, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-amber-300/60 dark:bg-amber-500/40 pointer-events-none"
          style={{ left: cfg.x, top: cfg.y, width: cfg.size, height: cfg.size }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 0.8, 0],
            y: [0, -8, -16, -24],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: cfg.delay,
            ease: 'easeOut' as const,
            repeatDelay: 0.6,
          }}
        />
      ))}
    </>
  )
}

/* ───────────────────────────────────────────────────────────────
   Progress bar component
   ─────────────────────────────────────────────────────────────── */

function LaunchProgressBar({ progress }: { progress: number }) {
  return (
    <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' as const }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1.2 }}
      >
        <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </motion.div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Notification bell toggle
   ─────────────────────────────────────────────────────────────── */

function useNotifyToggle(productId: string) {
  const storageKey = `domplace-launch-notify-${productId}`
  const [notified, setNotified] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(storageKey) === 'true'
    } catch {
      return false
    }
  })

  const toggle = useCallback(() => {
    setNotified(prev => {
      const next = !prev
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, String(next))
        } catch {
          // ignore
        }
      }
      return next
    })
  }, [storageKey])

  return { notified, toggle }
}

/* ───────────────────────────────────────────────────────────────
   Single launch card
   ─────────────────────────────────────────────────────────────── */

function LaunchCard({ product, index }: { product: LaunchProduct; index: number }) {
  const countdown = useCountdown(product.launchDate)
  const { notified, toggle } = useNotifyToggle(product.id)
  const isExpired = countdown.totalMs <= 0

  return (
    <motion.div
      className="shrink-0 w-[200px] sm:w-[220px]"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: Math.min(index * 0.1, 0.6),
        duration: 0.5,
        type: 'spring' as const,
        stiffness: 200,
        damping: 25,
      }}
    >
      <motion.div
        className="h-full"
        animate={{ y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
      >
        <Card className="overflow-hidden h-full border-amber-200/40 dark:border-amber-800/30 bg-gradient-to-b from-white to-amber-50/30 dark:from-card dark:to-amber-950/10 group cursor-pointer hover:shadow-lg hover:shadow-amber-200/30 dark:hover:shadow-amber-900/20 hover:-translate-y-1 transition-all duration-300 relative r62-card-lift r90-countdown-card">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Image area */}
            <div className={`relative aspect-[4/3] flex items-center justify-center bg-gradient-to-br ${product.gradient} overflow-hidden`}>
              <CardSparkles />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                className="text-5xl drop-shadow-md z-10"
              >
                {product.emoji}
              </motion.div>

              {/* Category badge */}
              <Badge className="absolute top-2 left-2 bg-white/90 dark:bg-card/90 text-[10px] font-medium border-0 backdrop-blur-sm z-20">
                {product.categoryLabel}
              </Badge>

              {/* Lançamento golden badge with shimmer */}
              <div className="absolute top-2 right-2 z-20">
                <ShimmerBadge>
                  <Sparkles className="h-2.5 w-2.5 text-amber-900 dark:text-amber-100" />
                  <span className="text-[9px] font-bold text-amber-900 dark:text-amber-100">Lançamento</span>
                </ShimmerBadge>
              </div>

              {/* Price hint */}
              <div className="absolute bottom-2 left-2 z-20">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-md px-2 py-0.5">
                  {product.priceHint}
                </span>
              </div>
            </div>

            {/* Info area */}
            <div className="p-3 flex flex-col flex-1">
              <h3 className="text-sm font-semibold line-clamp-2 leading-tight min-h-[2.25rem]">
                {product.name}
              </h3>

              {/* Countdown */}
              {!isExpired ? (
                <div className="mt-2">
                  <div className="flex items-center gap-1.5 justify-center">
                    <AnimatedDigit value={countdown.days} label="Dias" />
                    <span className="text-amber-400 font-bold mt-[-14px]">:</span>
                    <AnimatedDigit value={countdown.hours} label="Horas" />
                    <span className="text-amber-400 font-bold mt-[-14px]">:</span>
                    <AnimatedDigit value={countdown.minutes} label="Min" />
                    <span className="text-amber-400 font-bold mt-[-14px]">:</span>
                    <AnimatedDigit value={countdown.seconds} label="Seg" />
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-center">
                  <Badge className="bg-emerald-500 text-white border-0 text-[10px]">
                    🎉 Disponível!
                  </Badge>
                </div>
              )}

              {/* Progress bar */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-muted-foreground">Progresso</span>
                  <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                    {Math.round(countdown.progress)}%
                  </span>
                </div>
                <LaunchProgressBar progress={countdown.progress} />
              </div>

              {/* Notify button */}
              <div className="mt-auto pt-2">
                <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                  <Button
                    variant={notified ? 'secondary' : 'outline'}
                    size="sm"
                    className={`w-full h-8 min-h-[44px] text-[11px] gap-1.5 rounded-lg transition-colors ${
                      notified
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-700/30'
                        : 'border-amber-300/50 dark:border-amber-600/30 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                    }`}
                    onClick={toggle}
                  >
                    {notified ? (
                      <>
                        <Bell className="h-3 w-3" />
                        Notificação ativada
                      </>
                    ) : (
                      <>
                        <BellOff className="h-3 w-3" />
                        Notifique-me
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

/* ───────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ─────────────────────────────────────────────────────────────── */

export function ProductLaunchCountdown() {
  const products = useMemo(() => generateLaunchProducts(), [])
  const [scrollPos, setScrollPos] = useState(0)

  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = document.getElementById('launch-countdown-scroll')
    if (!container) return
    const amount = 230
    const newScroll = direction === 'left'
      ? Math.max(0, scrollPos - amount)
      : scrollPos + amount
    container.scrollTo({ left: newScroll, behavior: 'smooth' })
    setScrollPos(newScroll)
  }, [scrollPos])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="relative overflow-hidden"
    >
      <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/10 dark:via-yellow-900/10 dark:to-orange-900/10 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
            >
              <Rocket className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                  Lançamentos em Breve
                </span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                  className="text-lg"
                >
                  🚀
                </motion.span>
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Produtos que estão chegando — seja o primeiro a saber!
              </p>
            </div>
          </div>

          {/* Scroll buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-full bg-white/90 dark:bg-card/90 shadow-md border border-border/50 flex items-center justify-center hover:bg-white transition-colors hidden sm:flex"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-full bg-white/90 dark:bg-card/90 shadow-md border border-border/50 flex items-center justify-center hover:bg-white transition-colors hidden sm:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Product cards scroll */}
        <div id="launch-countdown-scroll" className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-4">
          {products.map((product, index) => (
            <LaunchCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* CTA button */}
        <div className="px-4 pb-4">
          <motion.div whileTap={{ scale: 0.97 }} className="w-full">
            <Button
              variant="outline"
              className="w-full h-10 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border-amber-300/50 dark:border-amber-700/30 text-amber-700 dark:text-amber-300 text-sm font-medium gap-2 rounded-xl"
            >
              <Clock className="h-4 w-4" />
              Ver todos os lançamentos
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Bottom shimmer bar */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 relative overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1 }}
          >
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* Background floating particles */}
      <motion.div
        className="absolute top-6 left-6 w-1.5 h-1.5 rounded-full bg-amber-300/40 pointer-events-none"
        animate={{ y: [0, -12, -24], opacity: [0, 0.6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut' as const, delay: 0.3 }}
      />
      <motion.div
        className="absolute top-12 right-10 w-2 h-2 rounded-full bg-yellow-400/30 pointer-events-none"
        animate={{ y: [0, -10, -20], opacity: [0, 0.5, 0], scale: [0.5, 1, 0.3] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' as const, delay: 1.1 }}
      />
      <motion.div
        className="absolute bottom-4 left-1/3 w-1 h-1 rounded-full bg-orange-400/40 pointer-events-none"
        animate={{ y: [0, -8, -18], opacity: [0, 0.7, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut' as const, delay: 0.7 }}
      />
    </motion.section>
  )
}
