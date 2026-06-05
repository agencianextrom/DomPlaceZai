'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Truck, Star, PartyPopper, Sparkles, ArrowRight, Gift, Clock, Zap, Copy, Check, Timer, Percent, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/* ------------------------------------------------------------------ */
/*  Promo Data — enriched campaigns with promo codes, badges, expiry   */
/* ------------------------------------------------------------------ */
const promoCampaigns = [
  {
    id: 1,
    icon: Truck,
    title: 'Frete Grátis em Tudo',
    subtitle: 'Pedidos acima de R$50 — aproveite a entrega sem custo',
    badge: 'Frete Grátis',
    badgeType: 'free-shipping' as const,
    promoCode: 'FRETE50',
    expiry: (() => { const d = new Date(); d.setDate(d.getDate() + 3); d.setHours(23, 59, 59); return d.toISOString() })(),
    image: '/images/grocery.jpg',
    gradient: 'from-emerald-700/90 via-emerald-600/85 to-teal-600/90',
    darkGradient: 'dark:from-emerald-950/95 dark:via-emerald-900/90 dark:to-teal-950/95',
    kenBurnsClass: 'ken-burns-zoom-in',
    cta: 'Aproveitar',
    headline: 'Entrega sem custo adicional',
    discountLabel: 'Frete Grátis',
  },
  {
    id: 2,
    icon: Star,
    title: 'Cupom BEMVINDO10',
    subtitle: 'Ganhe 10% de desconto na sua primeira compra',
    badge: '10% OFF',
    badgeType: 'discount' as const,
    promoCode: 'BEMVINDO10',
    expiry: (() => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(23, 59, 59); return d.toISOString() })(),
    image: '/images/beauty.jpg',
    gradient: 'from-amber-600/90 via-orange-500/85 to-red-500/90',
    darkGradient: 'dark:from-amber-950/95 dark:via-orange-950/90 dark:to-red-950/95',
    kenBurnsClass: 'ken-burns-pan-left',
    cta: 'Usar Cupom',
    headline: '10% de desconto na primeira compra',
    discountLabel: '% de desconto',
  },
  {
    id: 3,
    icon: PartyPopper,
    title: 'Novas Lojas Chegaram',
    subtitle: 'Confira as novidades cadastradas esta semana na sua região',
    badge: 'NOVIDADE',
    badgeType: 'new' as const,
    promoCode: 'NOVIDADE2024',
    expiry: (() => { const d = new Date(); d.setDate(d.getDate() + 5); d.setHours(23, 59, 59); return d.toISOString() })(),
    image: '/images/bakery.jpg',
    gradient: 'from-rose-600/90 via-pink-500/85 to-fuchsia-500/90',
    darkGradient: 'dark:from-rose-950/95 dark:via-pink-950/90 dark:to-fuchsia-950/95',
    kenBurnsClass: 'ken-burns-pan-right',
    cta: 'Explorar',
    headline: 'Descubra as novidades da região',
    discountLabel: 'Novidades',
  },
  {
    id: 4,
    icon: Gift,
    title: 'Compre 3 Ganhe 1',
    subtitle: 'Até 40% de desconto em produtos selecionados — por tempo limitado',
    badge: 'COMPRE X GANHE Y',
    badgeType: 'bogo' as const,
    promoCode: 'GANHE1',
    expiry: (() => { const d = new Date(); d.setDate(d.getDate() + 2); d.setHours(23, 59, 59); return d.toISOString() })(),
    image: '/images/acai.jpg',
    gradient: 'from-violet-600/90 via-purple-500/85 to-fuchsia-500/90',
    darkGradient: 'dark:from-violet-950/95 dark:via-purple-950/90 dark:to-fuchsia-950/95',
    kenBurnsClass: 'ken-burns-zoom-out',
    cta: 'Ver Ofertas',
    headline: 'Compre 3 e ganhe 1 grátis',
    discountLabel: 'Compre X Ganhe Y',
  },
]

const STORAGE_KEY = 'domplace-promo-banner-dismissed'

/* ------------------------------------------------------------------ */
/*  Shared easing                                                       */
/* ------------------------------------------------------------------ */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
const EASE_SPRING_OUT = [0.34, 1.56, 0.64, 1] as const
const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as const

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getIsDismissed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ */
/*  Badge icon mapper                                                  */
/* ------------------------------------------------------------------ */
function BadgeIcon({ type }: { type: string }) {
  switch (type) {
    case 'free-shipping':
      return <Truck className="h-2.5 w-2.5" />
    case 'discount':
      return <Percent className="h-2.5 w-2.5" />
    case 'bogo':
      return <ShoppingBag className="h-2.5 w-2.5" />
    default:
      return <Sparkles className="h-2.5 w-2.5" />
  }
}

/* ------------------------------------------------------------------ */
/*  HeroCountdownTimer — countdown to promo expiry                      */
/* ------------------------------------------------------------------ */
function HeroCountdownTimer({ expiry }: { expiry: string }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const end = new Date(expiry)
      const diff = Math.max(0, end.getTime() - now.getTime())
      if (diff <= 0) { setExpired(true); return }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const timer = setInterval(calc, 1000)
    return () => clearInterval(timer)
  }, [expiry])

  if (expired) return <span className="text-xs text-red-300 font-medium">Expirado</span>

  const units = [
    { value: timeLeft.d, label: 'd' },
    { value: timeLeft.h, label: 'h' },
    { value: timeLeft.m, label: 'm' },
    { value: timeLeft.s, label: 's' },
  ]

  return (
    <div className="flex items-center gap-1">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-1">
          <motion.div
            className="flex items-center gap-0.5 bg-white/15 backdrop-blur-sm rounded-md px-1.5 py-0.5 border border-white/10"
            animate={{ borderColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <span className="font-mono text-white text-sm font-bold tabular-nums">
              {String(u.value).padStart(2, '0')}
            </span>
          </motion.div>
          <span className="text-white/60 text-[10px] font-medium">{u.label}</span>
          {i < units.length - 1 && (
            <span className="text-white/40 mx-0.5">:</span>
          )}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  CouponCopier — "Copiar Cupom" with clipboard + checkmark feedback   */
/* ------------------------------------------------------------------ */
function CouponCopier({ promoCode }: { promoCode: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promoCode)
      setCopied(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      if (typeof window !== 'undefined') {
        const el = document.createElement('textarea')
        el.value = promoCode
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        setCopied(true)
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setCopied(false), 2000)
      }
    }
  }, [promoCode])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <motion.button
      onClick={handleCopy}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[11px] font-semibold hover:bg-white/25 transition-colors"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="copied"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center gap-1 text-emerald-300"
          >
            <Check className="h-3.5 w-3.5" />
            Copiado!
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="inline-flex items-center gap-1"
          >
            <Copy className="h-3.5 w-3.5" />
            Copiar Cupom
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/*  PromoCodeCard — glassmorphism card displaying promo code           */
/* ------------------------------------------------------------------ */
function PromoCodeCard({ promoCode }: { promoCode: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-3"
    >
      <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
        {/* Dashed left border accent */}
        <div className="flex items-center">
          <div className="w-0.5 h-8 border-l-2 border-dashed border-white/40 rounded-l" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-white/60 uppercase tracking-wider font-medium">Cupom de desconto</span>
          <span className="font-mono text-white text-sm font-bold tracking-widest">{promoCode}</span>
        </div>
        <CouponCopier promoCode={promoCode} />
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Confetti Sparkle Component                                         */
/* ------------------------------------------------------------------ */
const sparkleColors = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#c084fc', '#fb923c']

function ConfettiSparkle() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2
        const distance = 18 + Math.random() * 14
        const size = 3 + Math.random() * 3
        const color = sparkleColors[i % sparkleColors.length]
        const delay = i * 0.04
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{ width: size, height: size, backgroundColor: color, top: '50%', left: '50%' }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0.6],
            }}
            transition={{ duration: 0.7, delay, ease: EASE_SMOOTH }}
          />
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  PromoConfetti — 12 particle burst on CTA click                      */
/* ------------------------------------------------------------------ */
function PromoConfetti({ x, y }: { x: number; y: number }) {
  const colors = ['#10b981', '#f59e0b', '#f43f5e', '#14b8a6', '#84cc16', '#fbbf24', '#f472b6', '#60a5fa', '#c084fc', '#fb923c', '#34d399', '#ef4444']
  return (
    <div className="fixed pointer-events-none z-[9999]" style={{ left: x, top: y }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const distance = 25 + i * 8
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              width: 4 + (i % 4),
              height: 4 + (i % 4),
              backgroundColor: colors[i],
              left: 0,
              top: 0,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance - 20,
              opacity: [1, 1, 0],
              scale: [0, 1.3, 0.3],
              rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
            }}
            transition={{ duration: 0.8, delay: i * 0.03, ease: 'easeOut' as const }}
          />
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  HeroPromoSlide — full-width hero banner with crossfade              */
/* ------------------------------------------------------------------ */
function HeroPromoSlide({
  promo,
  onCTAClick,
}: {
  promo: (typeof promoCampaigns)[number]
  onCTAClick: (e: React.MouseEvent) => void
}) {
  const Icon = promo.icon

  return (
    <motion.div
      key={promo.id}
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      className="relative w-full min-h-[220px] sm:min-h-[260px] rounded-2xl overflow-hidden cursor-pointer group"
    >
      {/* Background image with Ken Burns */}
      <div
        className={`absolute inset-0 bg-cover bg-center ${promo.kenBurnsClass}`}
        style={{ backgroundImage: `url(${promo.image})` }}
      />

      {/* Animated gradient overlay with background gradient shift */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${promo.gradient} ${promo.darkGradient}`}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' as const }}
        style={{ backgroundSize: '200% 200%' }}
      />

      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 r35-promo-shimmer"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)',
          backgroundSize: '250% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
      />

      {/* Floating confetti-themed particles */}
      {Array.from({ length: 5 }).map((_, i) => {
        const confettiColors = ['rgba(251,191,36,0.5)', 'rgba(244,114,182,0.4)', 'rgba(52,211,153,0.4)', 'rgba(96,165,250,0.4)', 'rgba(192,132,252,0.4)']
        const startX = 15 + i * 18
        return (
          <motion.span
            key={`confetti-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{ width: 3 + (i % 3), height: 3 + (i % 3), backgroundColor: confettiColors[i], left: `${startX}%`, top: '50%' }}
            animate={{
              y: [0, -20 - i * 8, -40 - i * 6],
              x: [(i % 2 === 0 ? 5 : -5) * (i + 1), (i % 2 === 0 ? -3 : 3) * (i + 1), 0],
              opacity: [0, 0.8, 0],
              scale: [0.3, 1, 0.4],
              rotate: [0, 180 * (i + 1), 360 * (i + 1)],
            }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' as const }}
          />
        )
      })}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-5 sm:p-8 min-h-[220px] sm:min-h-[260px]">
        {/* Top: Badge + icon */}
        <div className="flex items-start justify-between">
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: EASE_SPRING_OUT }}
          >
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/15 text-[11px] font-bold tracking-wider text-white uppercase r17-promo-badge-pulse r35-promo-badge r62-badge-glow">
              <BadgeIcon type={promo.badgeType} />
              <Zap className="h-3 w-3" />
              {promo.badge}
            </span>
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ConfettiSparkle />
            </motion.div>
          </motion.div>

          <motion.div
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 flex items-center justify-center"
            animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-white" />
          </motion.div>
        </div>

        {/* Bottom: Headline, subtitle, countdown, CTA, promo code */}
        <div className="mt-4 sm:mt-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight r17-promo-shimmer-title">
            {promo.headline}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-white/80 leading-relaxed line-clamp-2">
            {promo.subtitle}
          </p>

          {/* Countdown timer */}
          <div className="mt-3 flex items-center gap-2">
            <Timer className="h-3.5 w-3.5 text-white/60" />
            <HeroCountdownTimer expiry={promo.expiry} />
          </div>

          {/* Promo code glassmorphism card */}
          <PromoCodeCard promoCode={promo.promoCode} />

          {/* CTA + copy */}
          <div className="mt-3 flex items-center gap-3">
            <motion.button
              className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-gray-900 text-xs sm:text-sm font-semibold transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 r17-promo-btn-glow r34-promo-btn-shimmer overflow-hidden"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  '0 0 0px rgba(255,255,255,0.4)',
                  '0 0 16px rgba(255,255,255,0.6)',
                  '0 0 0px rgba(255,255,255,0.4)',
                ],
              }}
              transition={{
                boxShadow: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 0.15 },
              }}
              onClick={onCTAClick}
            >
              <span className="r34-promo-shimmer-bar" />
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {promo.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </motion.button>

            {/* Discount label badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-[10px] font-semibold text-white/90">
              <Clock className="h-2.5 w-2.5" />
              {promo.discountLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-white/0 via-white/40 to-white/0"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: EASE_SMOOTH }}
        style={{ transformOrigin: 'center' }}
      />
      {/* Floating emoji particles */}
      {['🚀', '✨', '🎁', '⭐', '🔥'].map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute pointer-events-none text-base sm:text-lg select-none"
          style={{ left: `${12 + i * 18}%`, top: '50%' }}
          animate={{
            y: [0, -30 - i * 10, -60 - i * 8],
            x: [(i % 2 === 0 ? 6 : -6) * (i + 1), (i % 2 === 0 ? -4 : 4) * (i + 1), 0],
            opacity: [0, 0.7, 0],
            scale: [0.4, 1, 0.3],
            rotate: [0, 180 * (i + 1), 360 * (i + 1)],
          }}
          transition={{ duration: 3.5 + i * 0.6, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' as const }}
        >
          {emoji}
        </motion.span>
      ))}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Navigation Dots — animated dots with swipe indicators               */
/* ------------------------------------------------------------------ */
function NavigationDots({
  total,
  current,
  onSelect,
}: {
  total: number
  current: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {Array.from({ length: total }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => onSelect(i)}
          className="relative rounded-full focus:outline-none"
          aria-label={`Campanha ${i + 1}`}
        >
          <motion.span
            animate={{
              width: i === current ? 28 : 8,
              height: 8,
              opacity: i === current ? 1 : 0.35,
              backgroundColor: i === current ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
            }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="block rounded-full"
          />
          {i === current && (
            <motion.span
              layoutId="promo-nav-dot"
              className="absolute rounded-full bg-primary/30"
              style={{ width: 28, height: 8, top: 0, left: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  PromoCard — smaller promo card for grid below hero                  */
/* ------------------------------------------------------------------ */
function PromoCard({
  promo,
  index,
  onCTAClick,
}: {
  promo: (typeof promoCampaigns)[number]
  index: number
  onCTAClick: (e: React.MouseEvent) => void
}) {
  const [hovered, setHovered] = useState(false)
  const Icon = promo.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02, y: -3, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: EASE_OUT_EXPO }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group cursor-pointer r35-promo-card r62-card-lift"
    >
      <motion.div
        animate={{
          y: hovered ? -4 : 0,
          boxShadow: hovered
            ? '0 20px 40px -8px rgba(0,0,0,0.18), 0 8px 16px -4px rgba(0,0,0,0.1)'
            : '0 4px 16px -2px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
        }}
        transition={{ duration: 0.3, ease: EASE_SMOOTH }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Background image */}
        <div
          className={`absolute inset-0 bg-cover bg-center ${promo.kenBurnsClass}`}
          style={{ backgroundImage: `url(${promo.image})` }}
        />
        {/* Gradient overlay */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${promo.gradient} ${promo.darkGradient}`}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' as const }}
          style={{ backgroundSize: '200% 200%' }}
        />

        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-0 r35-promo-shimmer"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)',
            backgroundSize: '250% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-5 sm:p-6 min-h-[180px] sm:min-h-[200px]">
          <div className="flex items-start justify-between">
            <motion.div className="relative" initial={{ scale: 0, rotate: -12 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.15 + 0.3, ease: EASE_SPRING_OUT }}>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/15 text-[11px] font-bold tracking-wider text-white uppercase r17-promo-badge-pulse r35-promo-badge r62-badge-glow">
                <BadgeIcon type={promo.badgeType} />
                {promo.badge}
              </span>
              <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.15 + 0.4 }}>
                <ConfettiSparkle />
              </motion.div>
            </motion.div>
            <motion.div
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 flex items-center justify-center"
              animate={{ rotate: hovered ? [0, -8, 8, 0] : 0, scale: hovered ? 1.1 : 1 }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-white" />
            </motion.div>
          </div>

          <div className="mt-4 sm:mt-6">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-tight r17-promo-shimmer-title">
              {promo.title}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-white/80 leading-relaxed line-clamp-2">
              {promo.subtitle}
            </p>

            {/* Countdown */}
            <div className="mt-2 flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-white/60" />
              <HeroCountdownTimer expiry={promo.expiry} />
            </div>

            {/* Promo code card */}
            <PromoCodeCard promoCode={promo.promoCode} />

            {/* CTA */}
            <div className="mt-3 flex items-center gap-2">
              <motion.button
                className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-gray-900 text-xs sm:text-sm font-semibold transition-colors hover:bg-white/95 r17-promo-btn-glow r34-promo-btn-shimmer overflow-hidden"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ['0 0 0px rgba(255,255,255,0.4)', '0 0 16px rgba(255,255,255,0.6)', '0 0 0px rgba(255,255,255,0.4)'] }}
                transition={{ boxShadow: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.15 } }}
                onClick={onCTAClick}
              >
                <span className="r34-promo-shimmer-bar" />
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  {promo.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </motion.button>

              <AnimatePresence>
                {hovered && (
                  <motion.button
                    initial={{ opacity: 0, x: -8, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -8, filter: 'blur(4px)' }}
                    transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-white/90 hover:text-white transition-colors"
                  >
                    Saiba mais
                    <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>→</motion.span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-white/0 via-white/40 to-white/0"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: index * 0.15 + 0.5, ease: EASE_SMOOTH }}
          style={{ transformOrigin: 'center' }}
        />
        {/* Floating emoji particles */}
        {['✨', '🔥', '🎁', '⭐', '🚀'].map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute pointer-events-none text-sm select-none"
            style={{ left: `${10 + i * 20}%`, top: '50%' }}
            animate={{
              y: [0, -20 - i * 8, -50 - i * 6],
              x: [(i % 2 === 0 ? 5 : -5) * (i + 1), (i % 2 === 0 ? -3 : 3) * (i + 1), 0],
              opacity: [0, 0.6, 0],
              scale: [0.3, 1, 0.2],
            }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 1.5, ease: 'easeOut' as const }}
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Ticker messages                                                     */
/* ------------------------------------------------------------------ */
const tickerMessages = [
  { id: 't1', text: '🚚 Frete grátis em pedidos acima de R$50 — Aproveite!' },
  { id: 't2', text: '⭐ Use o cupom BEMVINDO10 e ganhe 10% de desconto' },
  { id: 't3', text: '🎉 Novas lojas cadastradas esta semana! Confira' },
  { id: 't4', text: '⚡ Ofertas relâmpago — até 40% de desconto hoje' },
]

function TickerMessages() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setIdx((prev) => (prev + 1) % tickerMessages.length), 4000)
    return () => clearInterval(interval)
  }, [])
  const current = tickerMessages[idx]
  return (
    <motion.div
      key={current.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 text-white text-xs sm:text-sm font-medium whitespace-nowrap"
    >
      <span>{current.text}</span>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main PromoBanner (exported)                                         */
/* ------------------------------------------------------------------ */
export function PromoBanner() {
  const [dismissed, setDismissed] = useState(getIsDismissed)
  const [tickerVisible, setTickerVisible] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const [heroIndex, setHeroIndex] = useState(0)
  const [confettiPos, setConfettiPos] = useState<{ x: number; y: number; key: number } | null>(null)

  // Auto-rotate hero promo every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % promoCampaigns.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  // Smooth ticker entrance
  useEffect(() => {
    if (dismissed) return
    const timer = setTimeout(() => setTickerVisible(true), 300)
    return () => clearTimeout(timer)
  }, [dismissed])

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handler = () => setDismissed(getIsDismissed())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const handleDismiss = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Silently fail
    }
    setDismissing(true)
    setTimeout(() => setDismissed(true), 400)
  }, [])

  const handleCTAClick = useCallback((e: React.MouseEvent) => {
    // Fire confetti particles from CTA position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setConfettiPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, key: Date.now() })
    setTimeout(() => setConfettiPos(null), 1000)
  }, [])

  if (dismissed) return null

  return (
    <div className="space-y-4 relative">
      {/* Floating gradient particles for visual depth */}
      <motion.div
        className="absolute -top-16 -left-8 w-40 h-40 rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)' }}
        animate={{ y: [0, -20, 0], x: [0, 10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
      />
      <motion.div
        className="absolute top-1/3 -right-12 w-32 h-32 rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.2) 0%, transparent 70%)' }}
        animate={{ y: [0, 15, 0], x: [0, -8, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }}
      />
      <motion.div
        className="absolute -bottom-10 left-1/3 w-36 h-36 rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.2) 0%, transparent 70%)' }}
        animate={{ y: [0, -12, 0], x: [0, 12, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 }}
      />
      {/* Confetti burst overlay */}
      {confettiPos && <PromoConfetti key={confettiPos.key} x={confettiPos.x} y={confettiPos.y} />}

      {/* ---- Ticker bar ---- */}
      <AnimatePresence>
        {tickerVisible && !dismissing && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: 0 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-600">
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 75%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['-200% 0', '200% 0'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              />
              <div className="relative flex items-center justify-center px-4 py-2">
                <AnimatePresence mode="wait">
                  <TickerMessages />
                </AnimatePresence>
                <div className="absolute right-10 flex items-center gap-1.5">
                  {promoCampaigns.map((_, i) => (
                    <span key={i} className="contents">
                      <div
                        className={`rounded-full transition-all duration-300 ${
                          i === heroIndex
                            ? 'w-1.5 h-1.5 bg-white shadow-[0_0_4px_rgba(255,255,255,0.6)]'
                            : 'w-1 h-1 bg-white/50'
                        }`}
                      />
                      {i < promoCampaigns.length - 1 && (
                        <div className="w-0.5 h-0.5 rounded-full bg-white/30" />
                      )}
                    </span>
                  ))}
                </div>
                <button
                  onClick={handleDismiss}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Fechar banner promocional"
                >
                  <X className="h-3 w-3 text-white/80" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Hero rotating banner (full-width) ---- */}
      <section className="relative">
        <AnimatePresence mode="wait">
          <HeroPromoSlide
            key={promoCampaigns[heroIndex].id}
            promo={promoCampaigns[heroIndex]}
            onCTAClick={handleCTAClick}
          />
        </AnimatePresence>
        {/* Navigation dots */}
        <NavigationDots
          total={promoCampaigns.length}
          current={heroIndex}
          onSelect={setHeroIndex}
        />
      </section>

      {/* ---- Promo cards grid ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {promoCampaigns.map((promo, i) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: i * 0.1, type: 'spring' as const, stiffness: 200, damping: 20 }}
          >
            <PromoCard promo={promo} index={i} onCTAClick={handleCTAClick} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
