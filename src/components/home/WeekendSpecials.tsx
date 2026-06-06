'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { CalendarDays, Clock, Share2, ShoppingCart, Tag, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { motion, type Variants } from 'framer-motion'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { resolveProductImage } from '@/lib/product-images'
import { fireConfettiFromElement } from '@/lib/confetti'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const weekendProducts: (ProductData & { discount: number })[] = [
  {
    id: 'we1', storeId: 's1', storeName: 'Mercado do Ze', storeLogo: null,
    name: 'Cesta de Frutas Especial', slug: 'cesta-frutas', description: 'Cesta com frutas frescas selecionadas.',
    price: 39.90, comparePrice: 59.90, images: '[]', stock: 30, rating: 4.8, totalReviews: 45,
    isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD', discount: 33,
  },
  {
    id: 'we2', storeId: 's2', storeName: 'Acai da Boa', storeLogo: null,
    name: 'Acai Família 2L', slug: 'acai-familia-2l', description: 'Acai cremoso 2 litros para toda a familia.',
    price: 49.90, comparePrice: 69.90, images: '[]', stock: 20, rating: 4.9, totalReviews: 78,
    isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD', discount: 29,
  },
  {
    id: 'we3', storeId: 's5', storeName: 'Padaria Pao Quente', storeLogo: null,
    name: 'Kit Churrasco para 8', slug: 'kit-churrasco', description: 'Pao, linguica, carvao e muito mais.',
    price: 89.90, comparePrice: 129.90, images: '[]', stock: 15, rating: 4.7, totalReviews: 34,
    isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD', discount: 31,
  },
  {
    id: 'we4', storeId: 's3', storeName: 'Agropecuaria SP', storeLogo: null,
    name: 'Mudas de Hortaliças (12 un)', slug: 'mudas-hortalicas', description: 'Kit com 12 mudas variadas.',
    price: 24.90, comparePrice: 39.90, images: '[]', stock: 40, rating: 4.5, totalReviews: 22,
    isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'AGRICULTURE', discount: 38,
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const categoryColors: Record<string, { dot: string; bg: string; label: string }> = {
  FOOD:         { dot: 'bg-green-500',     bg: 'bg-green-50 dark:bg-green-950/40',     label: 'Alimentação' },
  BEAUTY:       { dot: 'bg-pink-500',      bg: 'bg-pink-50 dark:bg-pink-950/40',       label: 'Beleza' },
  AGRICULTURE:  { dot: 'bg-amber-600',     bg: 'bg-amber-50 dark:bg-amber-950/40',     label: 'Agricultura' },
  CLOTHING:     { dot: 'bg-purple-500',    bg: 'bg-purple-50 dark:bg-purple-950/40',   label: 'Moda' },
  ELECTRONICS:  { dot: 'bg-sky-500',       bg: 'bg-sky-50 dark:bg-sky-950/40',         label: 'Eletrônicos' },
  SERVICES:     { dot: 'bg-teal-500',      bg: 'bg-teal-50 dark:bg-teal-950/40',       label: 'Serviços' },
  HOME:         { dot: 'bg-orange-500',    bg: 'bg-orange-50 dark:bg-orange-950/40',   label: 'Casa' },
}

function getCategoryColor(category: string) {
  return categoryColors[category] ?? { dot: 'bg-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/40', label: category }
}

const productGradients = [
  'from-amber-200/60 to-orange-200/60 dark:from-amber-800/30 dark:to-orange-800/30',
  'from-orange-200/60 to-red-200/60 dark:from-orange-800/30 dark:to-red-800/30',
  'from-yellow-200/60 to-amber-200/60 dark:from-yellow-800/30 dark:to-amber-800/30',
  'from-rose-200/60 to-amber-200/60 dark:from-rose-800/30 dark:to-amber-800/30',
]

// Deterministic claim % per product id (simulated 65-85%)
function getClaimPercent(id: string): number {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return 65 + (hash % 21) // 65..85
}

// ---------------------------------------------------------------------------
// Countdown hook (unchanged)
// ---------------------------------------------------------------------------

function useWeekendCountdown() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isWeekend, setIsWeekend] = useState(false)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const day = now.getDay()
      const isWE = day === 0 || day === 6
      setIsWeekend(isWE)

      let target = new Date(now)
      if (isWE) {
        if (day === 6) target.setDate(target.getDate() + 1)
        target.setHours(23, 59, 59, 999)
      } else {
        const daysUntilSat = 6 - day
        target.setDate(target.getDate() + daysUntilSat)
        target.setHours(0, 0, 0, 0)
      }

      const diff = Math.max(0, target.getTime() - now.getTime())
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return { countdown, isWeekend }
}

// ---------------------------------------------------------------------------
// Sparkle particles (Feature 1)
// ---------------------------------------------------------------------------

interface SparkleParticle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

const sparkleParticles: SparkleParticle[] = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: -50 + Math.random() * 160, // percentage offset from left of title
  y: -30 + Math.random() * 90,  // percentage offset from top
  size: 3 + Math.random() * 5,
  duration: 2 + Math.random() * 3,
  delay: Math.random() * 2,
}))

const sparkleVariants: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: 0 },
  visible: (p: SparkleParticle) => ({
    opacity: [0, 1, 0.5, 1, 0],
    scale: [0, 1, 0.7, 1, 0],
    rotate: [0, 90, 180, 270, 360],
    y: [0, -12, 5, -8, 2],
    transition: {
      duration: p.duration,
      delay: p.delay,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }),
}

function HeaderSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
      {sparkleParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          variants={sparkleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          custom={p}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full text-amber-400 drop-shadow-sm">
            <path
              d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tilt card wrapper (Feature 2)
// ---------------------------------------------------------------------------

function useTilt(maxTilt = 8) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setTilt({
        rotateX: (0.5 - y) * maxTilt,
        rotateY: (x - 0.5) * maxTilt,
      })
    },
    [maxTilt],
  )

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 })
  }, [])

  const style: React.CSSProperties = {
    transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
    transition: 'transform 0.2s ease-out',
    willChange: 'transform',
  }

  return { ref, style, handleMouseMove, handleMouseLeave }
}

// ---------------------------------------------------------------------------
// Animated progress bar (Feature 3)
// ---------------------------------------------------------------------------

const progressBarVariants: Variants = {
  hidden: { width: '0%' },
  visible: (percent: number) => ({
    width: `${percent}%`,
    transition: {
      duration: 1.2,
      delay: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
}

function DealProgressBar({ percent }: { percent: number }) {
  return (
    <div className="mt-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] text-muted-foreground">
          {percent}% reivindicado
        </span>
        <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">
          Quase esgotando!
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden relative">
        {/* Shimmer overlay on progress bar */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute inset-0 progress-bar-shimmer" />
        </div>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 relative z-10 weekend-stock-fill"
          variants={progressBarVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={percent}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Entrance wave variants (Feature 6)
// ---------------------------------------------------------------------------

const cardWaveVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      delay: i * 0.15,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function WeekendSpecials() {
  const { addToCart, selectProduct, navigate } = useAppStore()
  const { countdown, isWeekend } = useWeekendCountdown()
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="r62-card-lift"
    >
      <div className="relative rounded-2xl overflow-hidden">
        {/* Animated gradient background that shifts colors (warm tones) */}
        <div className="absolute inset-0 weekend-animated-bg" />
        <div className="absolute inset-0 border border-amber-300/30 dark:border-amber-700/30 rounded-2xl" />

        <div className="relative bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl p-4 sm:p-5">
          {/* Header with sparkles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5 relative">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"
              >
                <CalendarDays className="h-5 w-5 text-white" />
              </motion.div>
              <div className="relative">
                <HeaderSparkles />
                <h2 className="font-bold text-base sm:text-lg flex items-center gap-1.5 relative r62-heading-gradient">
                  <span className="gradient-text-animated bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent weekend-title-shimmer">
                    Ofertas de Fim de Semana
                  </span>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground relative">
                  {isWeekend
                    ? 'As ofertas estao no ar! Aproveite ate domingo'
                    : 'Promocoes exclusivas que comecam no sabado'}
                </p>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 hidden sm:block" />
              <div className="flex items-center gap-1 bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-amber-200/50 dark:border-amber-800/30 shadow-sm">
                {countdown.days > 0 && (
                  <>
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                        {pad(countdown.days)}
                      </span>
                      <span className="text-[8px] text-muted-foreground">dias</span>
                    </div>
                    <span className="text-amber-400 font-bold mx-0.5">:</span>
                  </>
                )}
                {[
                  { value: pad(countdown.hours), label: 'h' },
                  { value: pad(countdown.minutes), label: 'm' },
                  { value: pad(countdown.seconds), label: 's' },
                ].map((unit, idx) => (
                  <span key={unit.label} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                        {unit.value}
                      </span>
                      <span className="text-[8px] text-muted-foreground">{unit.label}</span>
                    </div>
                    {idx < 2 && <span className="text-amber-400 font-bold mx-0.5">:</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Product cards grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {weekendProducts.map((product, idx) => {
              const claimPct = getClaimPercent(product.id)
              const catColor = getCategoryColor(product.category)
              return <TiltCard key={product.id} product={product} idx={idx} claimPct={claimPct} catColor={catColor} />
            })}
          </div>

          {/* Bottom decorative bar */}
          <div className="h-1 mt-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute inset-0 w-1/2"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
            >
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

// ---------------------------------------------------------------------------
// TiltCard — individual product card with tilt, overlay, category, progress
// ---------------------------------------------------------------------------

interface TiltCardProps {
  product: ProductData & { discount: number }
  idx: number
  claimPct: number
  catColor: { dot: string; bg: string; label: string }
}

function TiltCard({ product, idx, claimPct, catColor }: TiltCardProps) {
  const { addToCart, selectProduct, navigate } = useAppStore()
  const tilt = useTilt(6)

  // Confetti dots positions around the weekend badge
  const confettiDots = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: -20 + Math.random() * 140,
      y: -20 + Math.random() * 60,
      size: 3 + Math.random() * 3,
      color: ['bg-amber-400', 'bg-orange-400', 'bg-red-400', 'bg-yellow-400', 'bg-rose-400', 'bg-pink-400'][i % 6],
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 1.5,
    })),
  [])

  const handleCardClick = () => {
    selectProduct(product)
    navigate('product')
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product, product.storeName || 'Loja')
    toast.success(`${product.name} adicionado!`)
    fireConfettiFromElement(e.currentTarget as HTMLElement)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Confira esta oferta de fim de semana: ${product.name} por ${formatBRL(product.price)} no DomPlace!`,
      })
    } else {
      const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Link copiado!')
      }).catch(() => {
        toast.error('Nao foi possivel copiar o link')
      })
    }
  }

  return (
    <motion.div
      custom={idx}
      variants={cardWaveVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      style={{ ...tilt.style }}
      ref={tilt.ref}
      onMouseMove={tilt.handleMouseMove}
      onMouseLeave={tilt.handleMouseLeave}
    >
      <Card
        className="card-aurora weekend-gradient-border overflow-hidden h-full hover:shadow-2xl weekend-card-hover transition-all border-amber-200/30 dark:border-amber-800/20 group cursor-pointer relative weekend-stock-fill-card"
        style={{ animationDelay: `${idx * 0.15}s` } as React.CSSProperties}
        onClick={handleCardClick}
      >
        {/* Animated gradient overlay */}
        <div className="weekend-card-gradient-overlay" />
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image area */}
          <div className={`relative aspect-[4/3] flex items-center justify-center bg-gradient-to-br ${productGradients[idx % productGradients.length]} overflow-hidden`}>
            {(() => {
              const imgUrl = resolveProductImage({ slug: product.slug, category: product.category, images: product.images })
              return imgUrl ? (
                <img src={imgUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} loading="lazy" />
              ) : null
            })()}
            <motion.div
              className="h-14 w-14 rounded-2xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform z-10"
            >
              <span className="text-3xl">
                {product.category === 'FOOD' ? '\uD83C\uDF4E' : '\uD83C\uDF31'}
              </span>
            </motion.div>

            {/* Weekend badge with confetti dots */}
            <div className="absolute top-2 left-2 z-20">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="relative"
              >
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[9px] px-1.5 py-0 font-bold shadow-sm z-20 relative weekend-badge-pulse weekend-badge-glow" style={{ animationDelay: `${idx * 0.3}s` } as React.CSSProperties}>
                  <CalendarDays className="h-2.5 w-2.5 mr-0.5" />
                  Fim de Semana
                </Badge>
                {/* Animated confetti dots around badge */}
                <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
                  {confettiDots.map((dot) => (
                    <motion.div
                      key={dot.id}
                      className={`absolute rounded-full ${dot.color}`}
                      style={{ left: `${dot.x}%`, top: `${dot.y}%`, width: dot.size, height: dot.size }}
                      animate={{
                        opacity: [0, 1, 0.3, 1, 0],
                        scale: [0, 1.3, 0.5, 1.1, 0],
                        y: [0, -6, 3, -5, 0],
                      }}
                      transition={{
                        duration: dot.duration,
                        delay: dot.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Discount badge */}
            <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0 text-[10px] px-1.5 py-0 font-bold z-20">
              -{product.discount}%
            </Badge>

            {/* Animated gift badge */}
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-2 right-2 z-20 text-lg"
            >
              🎁
            </motion.span>

            {/* ---- Feature 4: Category dot indicator ---- */}
            <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${catColor.dot} ring-2 ring-white/70 dark:ring-black/30`} />
              <span className="text-[8px] font-medium text-white/90 drop-shadow-sm">{catColor.label}</span>
            </div>

            {/* ---- Feature 5: Hover overlay with CTA ---- */}
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/0 group-hover:bg-black/35 transition-all duration-300">
              <motion.div
                className="flex items-center gap-1.5 bg-white/95 dark:bg-black/90 text-amber-700 dark:text-amber-300 px-3.5 py-2 min-h-[44px] rounded-full font-semibold text-xs shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
              >
                <span>Ver Oferta</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.div>
            </div>
          </div>

          {/* Info */}
          <div className="p-2.5 flex flex-col flex-1">
            <p className="text-[10px] text-muted-foreground">{product.storeName}</p>
            <h3 className="text-xs font-semibold mt-0.5 line-clamp-2 leading-tight min-h-[1.75rem]">
              {product.name}
            </h3>

            <div className="mt-auto pt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-extrabold text-amber-700 dark:text-amber-300">{formatBRL(product.price)}</span>
                {product.comparePrice && (
                  <span className="text-[10px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
                )}
              </div>

              {/* ---- Feature 3: Animated progress bar ---- */}
              <DealProgressBar percent={claimPct} />

              <div className="flex gap-1.5 mt-2">
                <Button
                  size="sm"
                  className="flex-1 h-7 min-h-[44px] text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 gap-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-3 w-3" />
                  Comprar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 min-h-[44px] min-w-[44px] p-0 border-amber-300/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 shrink-0"
                  onClick={handleShare}
                >
                  <Share2 className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
