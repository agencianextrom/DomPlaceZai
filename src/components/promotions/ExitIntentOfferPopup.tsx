'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Gift,
  Clock,
  Copy,
  Check,
  Percent,
  Truck,
  Star,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'

// ─── Constants ────────────────────────────────────────────────────────────────
const EXIT_INTENT_KEY = 'domplace-exit-intent-dismissed'
const EXIT_INTENT_SESSION_KEY = 'domplace-exit-intent-session'
const EXIT_COUPON_KEY = 'domplace-exit-coupon-claimed'

const OFFERS = [
  {
    id: 'exit-10',
    code: 'FICA10',
    discount: 10,
    description: 'Desconto de 10% na sua próxima compra',
    minOrder: 30,
    badge: '10% OFF',
    badgeColor: 'bg-emerald-500',
    badgeText: 'text-white',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-600',
    emoji: '🎉',
    expires: 24, // hours
    features: [
      { icon: Truck, label: 'Frete grátis acima de R$50' },
      { icon: Star, label: 'Válido para todas as lojas' },
      { icon: Clock, label: `Expira em 24h` },
    ],
  },
  {
    id: 'exit-15',
    code: 'DOMPLACE15',
    discount: 15,
    description: '15% de desconto em compras acima de R$50',
    minOrder: 50,
    badge: '15% OFF',
    badgeColor: 'bg-amber-500',
    badgeText: 'text-white',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-600',
    emoji: '🔥',
    expires: 12,
    features: [
      { icon: Truck, label: 'Entrega expressa grátis' },
      { icon: Star, label: 'Todas as categorias' },
      { icon: Clock, label: 'Expira em 12h' },
    ],
  },
  {
    id: 'exit-frete',
    code: 'FRETEGRATIS',
    discount: 100,
    description: 'Frete grátis em qualquer pedido',
    minOrder: 0,
    badge: 'FRETE GRÁTIS',
    badgeColor: 'bg-rose-500',
    badgeText: 'text-white',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-600',
    emoji: '🚀',
    expires: 6,
    features: [
      { icon: Gift, label: 'Sem valor mínimo' },
      { icon: Star, label: 'Para qualquer bairro' },
      { icon: Clock, label: 'Expira em 6h' },
    ],
  },
]

// ─── Countdown Timer Hook ─────────────────────────────────────────────────────
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, total: 0 })

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      const diff = Math.max(0, targetDate.getTime() - now)
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff,
      })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}

// ─── Animated Background Orbs ─────────────────────────────────────────────────
const bgOrbs = [
  { color: 'rgba(16,185,129,0.2)', size: 100, top: '5%', left: '10%', duration: 14 },
  { color: 'rgba(245,158,11,0.15)', size: 70, top: '60%', left: '85%', duration: 18 },
  { color: 'rgba(20,184,166,0.18)', size: 90, top: '20%', left: '75%', duration: 16 },
  { color: 'rgba(244,63,94,0.12)', size: 60, top: '75%', left: '20%', duration: 20 },
]

// ─── Main Component ────────────────────────────────────────────────────────────
export function ExitIntentOfferPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [couponClaimed, setCouponClaimed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const exitDetected = useRef(false)
  const mouseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasTriggered = useRef(false)

  // Pick a random offer (stable for session)
  const [offer] = useState(() => {
    if (typeof window === 'undefined') return OFFERS[0]
    const sessionIdx = sessionStorage.getItem(EXIT_INTENT_SESSION_KEY)
    if (sessionIdx) return OFFERS[parseInt(sessionIdx, 10) % OFFERS.length]
    const idx = Math.floor(Math.random() * OFFERS.length)
    try { sessionStorage.setItem(EXIT_INTENT_SESSION_KEY, String(idx)) } catch { /* ignore */ }
    return OFFERS[idx]
  })

  const [expiresAt] = useState(() => new Date(Date.now() + offer.expires * 60 * 60 * 1000))
  const countdown = useCountdown(expiresAt)

  // ─── Don't show if already dismissed or claimed ──────────────────────────────
  const [shouldRender, setShouldRender] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const dismissed = localStorage.getItem(EXIT_INTENT_KEY)
      const claimed = localStorage.getItem(EXIT_COUPON_KEY)
      if (dismissed === 'true') return false
      if (claimed === 'true') return false
      return true
    } catch {
      return true
    }
  })

  // ─── Desktop: detect mouse leaving viewport (exit intent) ───────────────────
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 0 && !hasTriggered.current && !exitDetected.current) {
      exitDetected.current = true
      // Small delay to avoid accidental triggers
      mouseTimerRef.current = setTimeout(() => {
        hasTriggered.current = true
        setIsOpen(true)
      }, 200)
    } else {
      // Mouse came back — reset if timer hasn't fired yet
      if (mouseTimerRef.current && !hasTriggered.current) {
        clearTimeout(mouseTimerRef.current)
        exitDetected.current = false
      }
    }
  }, [])

  // ─── Mobile: detect tab visibility change + scroll velocity ────────────────
  const scrollStartY = useRef(0)
  const scrollStartTime = useRef(0)

  const handleScrollStart = useCallback(() => {
    scrollStartY.current = window.scrollY
    scrollStartTime.current = Date.now()
  }, [])

  const handleScrollEnd = useCallback(() => {
    if (hasTriggered.current) return
    const scrollDelta = Math.abs(window.scrollY - scrollStartY.current)
    const timeDelta = (Date.now() - scrollStartTime.current) / 1000
    // Fast scroll up (> 300px in < 0.8s) near the top of page
    const velocity = timeDelta > 0 ? scrollDelta / timeDelta : 0
    if (velocity > 400 && window.scrollY < 200) {
      hasTriggered.current = true
      setIsOpen(true)
    }
  }, [])

  useEffect(() => {
    if (!shouldRender) return

    // Only start listening after 8 seconds of engagement
    const engagementTimer = setTimeout(() => {
      // Desktop: mousemove to detect exit intent
      document.addEventListener('mouseleave', handleMouseLeave)
      // Mobile: fast scroll up detection
      window.addEventListener('touchstart', handleScrollStart, { passive: true })
      window.addEventListener('touchend', handleScrollEnd, { passive: true })
      // Mobile: visibility change (tab switch)
      const handleVisibility = () => {
        if (document.visibilityState === 'hidden' && !hasTriggered.current) {
          hasTriggered.current = true
          setIsOpen(true)
        }
      }
      document.addEventListener('visibilitychange', handleVisibility)
    }, 8000)

    return () => {
      clearTimeout(engagementTimer)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('touchstart', handleScrollStart)
      window.removeEventListener('touchend', handleScrollEnd)
    }
  }, [shouldRender, handleMouseLeave, handleScrollStart, handleScrollEnd])

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleDismiss = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
      try { localStorage.setItem(EXIT_INTENT_KEY, 'true') } catch { /* ignore */ }
    }, 300)
  }, [])

  const handleClaimCoupon = useCallback(() => {
    setCouponClaimed(true)
    try { localStorage.setItem(EXIT_COUPON_KEY, 'true') } catch { /* ignore */ }
  }, [])

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(offer.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback: select a temporary textarea
      const textarea = document.createElement('textarea')
      textarea.value = offer.code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }, [offer.code])

  // ─── Don't render if already handled ────────────────────────────────────────
  if (!shouldRender) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />

          {/* Popup Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40, rotateX: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30, rotateX: -4 }}
            transition={{
              type: 'spring' as const,
              damping: 22,
              stiffness: 300,
            }}
            className="relative w-full max-w-md sm:max-w-lg overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl bg-background border border-border/50"
            style={{ perspective: 1000 }}
          >
            {/* ─── Close button ─────────────────────────────────────────── */}
            <motion.button
              onClick={handleDismiss}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-3 right-3 z-20 flex items-center justify-center w-9 h-9 min-h-[44px] min-w-[44px] rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted/90 transition-colors"
              aria-label="Fechar oferta"
            >
              <X className="h-4 w-4" />
            </motion.button>

            {/* ─── Header gradient ───────────────────────────────────────── */}
            <div className={`relative h-40 sm:h-48 bg-gradient-to-br ${offer.gradient} overflow-hidden`}>
              {/* Floating orbs */}
              {bgOrbs.map((orb, i) => (
                <motion.div
                  key={`orb-${i}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: orb.size,
                    height: orb.size,
                    background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
                    top: orb.top,
                    left: orb.left,
                  }}
                  animate={{
                    x: [0, 20 * (i % 2 === 0 ? 1 : -1), -15, 0],
                    y: [0, -15 * (i % 3 === 0 ? 1 : -1), 10, 0],
                    scale: [1, 1.1, 0.9, 1],
                  }}
                  transition={{
                    duration: orb.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.5,
                  }}
                />
              ))}

              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
              />

              {/* Decorative circles */}
              <motion.div
                className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10"
                animate={{ scale: [1, 1.08, 1], rotate: [0, 4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/10"
                animate={{ scale: [1, 1.12, 1], rotate: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Main content in header */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-white">
                {/* Emoji */}
                <motion.div
                  className="text-4xl sm:text-5xl mb-2"
                  animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {offer.emoji}
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="text-xl sm:text-2xl font-bold text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {isClosing || !isOpen ? 'Até logo!' : couponClaimed ? 'Cupom Resgatado!' : 'Espere! Temos uma oferta para você!'}
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  className="text-white/80 text-sm text-center mt-1 max-w-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {couponClaimed
                    ? 'Use o cupom no checkout e economize!'
                    : 'Antes de sair, garanta seu desconto exclusivo'}
                </motion.p>
              </div>
            </div>

            {/* ─── Content area ──────────────────────────────────────────── */}
            <div className="p-5 sm:p-6 -mt-6 relative z-10">
              {/* Card body */}
              <div className="bg-background rounded-2xl shadow-lg border border-border/50 overflow-hidden">
                {/* Discount badge row */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-muted/30 border-b border-border/30">
                  <Badge className={`${offer.badgeColor} ${offer.badgeText} text-xs font-bold px-3 py-1 rounded-full shadow-sm`}>
                    <Percent className="h-3 w-3 mr-1" />
                    {offer.badge}
                  </Badge>
                  <motion.span
                    className="text-xs text-muted-foreground flex items-center gap-1"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clock className="h-3 w-3" />
                    Oferta por tempo limitado
                  </motion.span>
                </div>

                {/* Description */}
                <div className="px-4 sm:px-5 py-4">
                  <p className="text-sm sm:text-base font-semibold text-foreground mb-1">
                    {offer.description}
                  </p>
                  {offer.minOrder > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Válido para compras acima de R${offer.minOrder},00
                    </p>
                  )}
                </div>

                {/* ─── Coupon code box ────────────────────────────────────── */}
                <div className="px-4 sm:px-5 pb-4">
                  <div className="relative rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      {/* Code display */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${offer.iconBg} shrink-0`}>
                          <Gift className={`h-4 w-4 ${offer.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            Código do cupom
                          </p>
                          <p className={`text-lg sm:text-xl font-bold tracking-widest ${offer.iconColor} font-mono`}>
                            {offer.code}
                          </p>
                        </div>
                      </div>

                      {/* Copy button */}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={handleCopyCode}
                          variant={copied ? 'default' : 'outline'}
                          size="sm"
                          className={`min-h-[44px] min-w-[44px] px-3 sm:px-4 gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                            copied
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-primary/40 hover:bg-primary/10 hover:text-primary hover:border-primary/60'
                          }`}
                          aria-label={copied ? 'Código copiado!' : 'Copiar código'}
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span className="hidden sm:inline">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              <span className="hidden sm:inline">Copiar</span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>

                    {/* Countdown timer */}
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Expira em:</p>
                      <div className="flex gap-1">
                        {[
                          { value: countdown.hours, label: 'h' },
                          { value: countdown.minutes, label: 'm' },
                          { value: countdown.seconds, label: 's' },
                        ].map(({ value, label }) => (
                          <div
                            key={label}
                            className="flex items-center gap-0.5 bg-foreground/10 dark:bg-foreground/5 rounded-md px-1.5 py-0.5 min-w-[32px] justify-center"
                          >
                            <span className="text-xs font-bold tabular-nums text-foreground">
                              {pad(value)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── Features list ──────────────────────────────────────── */}
                <div className="px-4 sm:px-5 pb-4">
                  <div className="grid grid-cols-3 gap-2">
                    {offer.features.map(({ icon: Icon, label }) => (
                      <motion.div
                        key={label}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-secondary/50"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-center w-8 h-8 min-w-[32px] min-h-[32px] rounded-lg bg-primary/10">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight">
                          {label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* ─── Action buttons ─────────────────────────────────────── */}
                <div className="px-4 sm:px-5 pb-5 space-y-2.5">
                  {couponClaimed ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-2.5"
                    >
                      <Button
                        className="w-full min-h-[48px] text-sm sm:text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white rounded-xl gap-2 shadow-lg"
                        onClick={() => {
                          handleDismiss()
                          // Navigate to home (in case user was on another view)
                          const { navigate } = useAppStore.getState()
                          navigate('home')
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                        Aproveitar agora
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full min-h-[44px] text-xs text-muted-foreground hover:text-foreground rounded-xl"
                        onClick={handleDismiss}
                      >
                        Fechar e usar depois
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2.5"
                    >
                      <Button
                        onClick={handleClaimCoupon}
                        className="w-full min-h-[48px] text-sm sm:text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white rounded-xl gap-2 shadow-lg"
                      >
                        <Gift className="h-4 w-4" />
                        Quero meu desconto!
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full min-h-[44px] text-xs text-muted-foreground hover:text-foreground rounded-xl"
                        onClick={handleDismiss}
                      >
                        Não, obrigado
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Trust badges below card */}
              <div className="flex items-center justify-center gap-4 mt-4 text-[10px] sm:text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  4.8/5 de avaliação
                </span>
                <span className="w-px h-3 bg-border" />
                <span>1.200+ cupons usados</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
