'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Flame, Sparkles, Store, ShoppingBag, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

interface HeroBannerProps {
  banners: { id: string; title: string; subtitle: string | null; image: string; gradient: string }[]
  storeCount?: number
  productCount?: number
}

const bannerGradients = [
  'bg-gradient-to-br from-emerald-600 via-green-500 to-teal-400',
  'bg-gradient-to-br from-amber-500 via-orange-500 to-red-400',
  'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-400',
  'bg-gradient-to-br from-lime-500 via-green-500 to-emerald-600',
  'bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-400',
]

// Floating gradient blobs configuration (7 orbs with varied paths, sizes, speeds)
const floatingBlobs = [
  { size: 160, top: '-15%', right: '-8%', color: 'bg-primary/20', animY: [0, 18, -12, 8, 0], animX: [0, -14, 10, -6, 0], duration: 12, delay: 0 },
  { size: 120, top: '55%', right: '15%', color: 'bg-emerald-400/15', animY: [0, -22, 10, -16, 0], animX: [0, 12, -8, 14, 0], duration: 15, delay: -3 },
  { size: 200, top: '20%', right: '40%', color: 'bg-amber-300/10', animY: [0, 14, -18, 6, 0], animX: [0, -10, 16, -12, 0], duration: 18, delay: -7 },
  { size: 90, top: '72%', right: '5%', color: 'bg-cyan-300/12', animY: [0, -16, 12, -8, 0], animX: [0, 8, -12, 10, 0], duration: 14, delay: -5 },
  { size: 70, top: '10%', right: '50%', color: 'bg-rose-400/10', animY: [0, -20, 14, -10, 0], animX: [0, 16, -14, 8, 0], duration: 20, delay: -9 },
  { size: 140, top: '45%', right: '-5%', color: 'bg-violet-400/8', animY: [0, 10, -20, 16, 0], animX: [0, -18, 12, -8, 0], duration: 16, delay: -2 },
  { size: 55, top: '85%', right: '35%', color: 'bg-teal-300/10', animY: [0, -14, 8, -18, 0], animX: [0, 10, -16, 12, 0], duration: 22, delay: -11 },
]

// Floating decorative shapes (pure CSS, positioned absolutely)
const floatingShapes = [
  { size: 14, top: '12%', right: '8%', className: 'hero-float-shape-1', bg: 'bg-white/20' },
  { size: 8, top: '70%', right: '25%', className: 'hero-float-shape-2', bg: 'bg-white/15' },
  { size: 10, top: '40%', right: '60%', className: 'hero-float-shape-3', bg: 'bg-white/18' },
  { size: 6, top: '25%', right: '45%', className: 'hero-float-shape-4', bg: 'bg-white/12' },
]

// Floating product images around the hero
const floatingProducts = [
  { emoji: '🛒', size: 28, top: '8%', right: '15%', anim: 'hero-float-product-1' },
  { emoji: '📦', size: 22, top: '60%', right: '10%', anim: 'hero-float-product-2' },
  { emoji: '🍎', size: 20, top: '20%', right: '70%', anim: 'hero-float-product-3' },
  { emoji: '🥤', size: 18, top: '75%', right: '55%', anim: 'hero-float-product-4' },
  { emoji: '🌿', size: 24, top: '45%', right: '80%', anim: 'hero-float-product-5' },
]

// Particle/sparkle positions for CTA area
const ctaSparkles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 20 + Math.random() * 160,
  y: 40 + Math.random() * 60,
  size: 2 + Math.random() * 4,
  duration: 1.5 + Math.random() * 2,
  delay: Math.random() * 2,
}))

// Floating particles for hero banner (5 circles with varied properties)
const heroParticles = [
  { id: 0, size: 10, top: '8%', right: '12%', color: 'rgba(255,255,255,0.35)', duration: 6, delay: 0, animY: [0, -14, 6, -10, 0], animX: [0, 8, -6, 4, 0] },
  { id: 1, size: 6, top: '65%', right: '28%', color: 'rgba(255,255,255,0.25)', duration: 8, delay: -2, animY: [0, 10, -8, 12, 0], animX: [0, -6, 10, -8, 0] },
  { id: 2, size: 14, top: '35%', right: '55%', color: 'rgba(255,255,255,0.2)', duration: 10, delay: -4, animY: [0, -18, 10, -6, 0], animX: [0, 12, -8, 14, 0] },
  { id: 3, size: 8, top: '78%', right: '65%', color: 'rgba(255,255,255,0.3)', duration: 7, delay: -1, animY: [0, 8, -14, 6, 0], animX: [0, -10, 8, -4, 0] },
  { id: 4, size: 5, top: '18%', right: '82%', color: 'rgba(255,255,255,0.28)', duration: 9, delay: -5, animY: [0, -12, 8, -16, 0], animX: [0, 6, -12, 10, 0] },
]

// r58-hero: Floating price tag / badge decorations (parallax float)
const r58FloatingBadges = [
  { emoji: '🏷️', size: 20, top: '15%', right: '22%', label: '-30%', floatDelay: 0, floatDur: 5 },
  { emoji: '💰', size: 18, top: '65%', right: '38%', label: 'Frete Grátis', floatDelay: -1.5, floatDur: 6 },
  { emoji: '🔥', size: 22, top: '35%', right: '75%', label: 'Hot', floatDelay: -3, floatDur: 7 },
  { emoji: '⭐', size: 16, top: '80%', right: '60%', label: 'Novo', floatDelay: -2, floatDur: 5.5 },
]

// Enhanced particle field (20+ particles for r43-hero)
const r43ParticleField = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  size: 2 + Math.random() * 10,
  top: `${Math.random() * 90}%`,
  right: `${Math.random() * 95}%`,
  opacity: 0.08 + Math.random() * 0.25,
  duration: 5 + Math.random() * 12,
  delay: -Math.random() * 10,
  drift: 6 + Math.random() * 14,
}))

// Floating emoji orbs with parallax (r43-hero)
const r43EmojiOrbs = [
  { emoji: '🛍️', size: 32, top: '5%', right: '10%', layer: 1, speed: 7 },
  { emoji: '💎', size: 26, top: '15%', right: '72%', layer: 2, speed: 9 },
  { emoji: '🎯', size: 22, top: '68%', right: '8%', layer: 1, speed: 11 },
  { emoji: '🏷️', size: 28, top: '55%', right: '68%', layer: 2, speed: 8 },
  { emoji: '🏪', size: 24, top: '80%', right: '42%', layer: 1, speed: 10 },
  { emoji: '✨', size: 18, top: '30%', right: '88%', layer: 3, speed: 6 },
  { emoji: '🎁', size: 20, top: '42%', right: '30%', layer: 2, speed: 12 },
]

// Animated gradient color stops for the morphing gradient overlay
const gradientColors = [
  { from: 'rgba(255,255,255,0.12)', via: 'rgba(255,255,255,0.05)', to: 'rgba(255,255,255,0.0)' },
  { from: 'rgba(255,255,255,0.08)', via: 'rgba(255,255,255,0.15)', to: 'rgba(255,255,255,0.02)' },
  { from: 'rgba(255,255,255,0.0)', via: 'rgba(255,255,255,0.1)', to: 'rgba(255,255,255,0.18)' },
]

// Slide transition variants for banner cycling
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 0.95,
  }),
}

// Stagger container variants for text entrance
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

// Individual text item variants with spring physics
const staggerItem = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
      mass: 0.8,
    },
  },
}

const SLIDE_DURATION = 5000

// Countdown hook - starts at 2h 34m 56s and ticks down
function useCountdown() {
  const [time, setTime] = useState({ hours: 2, minutes: 34, seconds: 56 })

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          hours = 23
          minutes = 59
          seconds = 59
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return time
}

// Skeleton loading state
function HeroBannerSkeleton() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl">
      <div className="w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[400px] bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="absolute inset-0 shimmer" />
      </div>
    </div>
  )
}

export function HeroBanner({ banners, storeCount = 8, productCount = 32 }: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const { navigate, setActiveCategory, setSearchQuery } = useAppStore()
  const countdown = useCountdown()
  const containerRef = useRef<HTMLDivElement>(null)

  // =====================================================
  // 1. PARALLAX DEPTH via useScroll + useTransform
  // =====================================================
  const { scrollY } = useScroll()
  const bgParallaxY = useTransform(scrollY, [0, 500], [0, 80])    // background moves slower
  const textParallaxY = useTransform(scrollY, [0, 500], [0, 30])   // text moves at normal speed
  const dotPatternY = useTransform(scrollY, [0, 500], [0, 25])

  // Simulate loading state on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const enhancedBanners = useMemo(() => {
    return banners.map((b, i) => ({
      ...b,
      gradient: bannerGradients[i % bannerGradients.length],
    }))
  }, [banners])

  // Gradient animation keyframes for heading text
  // NOTE: These hooks MUST be declared before any early returns to avoid Rules of Hooks violation
  const headingGradient = useMotionValue(0)
  useEffect(() => {
    let frame: number
    const animate = () => {
      headingGradient.set(headingGradient.get() >= 360 ? 0 : headingGradient.get() + 0.5)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [headingGradient])

  const headingBg = useTransform(headingGradient, (v) =>
    `linear-gradient(${v}deg, #ffffff, #e0f2fe, #ffffff, #bbf7d0, #ffffff)`
  )

  const goTo = useCallback((index: number) => {
    const diff = index - current
    setDirection(diff > 0 ? 1 : diff < 0 ? -1 : 1)
    setCurrent(index)
    setProgress(0)
  }, [current])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % enhancedBanners.length)
    setProgress(0)
  }, [enhancedBanners.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + enhancedBanners.length) % enhancedBanners.length)
    setProgress(0)
  }, [enhancedBanners.length])

  // Auto-slide with progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setDirection(1)
          setCurrent((c) => (c + 1) % enhancedBanners.length)
          return 0
        }
        return prev + 100 / (SLIDE_DURATION / 50)
      })
    }, 50)
    return () => clearInterval(interval)
  }, [enhancedBanners.length])

  const handleVerOfertas = useCallback(() => {
    setActiveCategory(null)
    setSearchQuery('')
    navigate('search')
  }, [navigate, setActiveCategory, setSearchQuery])

  const handleComprarAgora = useCallback(() => {
    setActiveCategory('offers')
    setSearchQuery('')
    navigate('search')
  }, [navigate, setActiveCategory, setSearchQuery])

  if (!enhancedBanners.length) return null

  // Show skeleton on first load
  if (!isLoaded) return <HeroBannerSkeleton />

  const banner = enhancedBanners[current]
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl" ref={containerRef}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={banner.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 },
          }}
          className={`relative w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[400px] ${banner.gradient} flex items-center overflow-hidden select-none r28-hero-gradient-bg r41-hero-bg-morph r43-hero-enhanced-gradient`}
          draggable={false}
        >
          {/* =====================================================
              2. ANIMATED GRADIENT OVERLAY (morphing gradient)
              ===================================================== */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.0) 100%)',
                'linear-gradient(225deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.02) 100%)',
                'linear-gradient(45deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.18) 100%)',
                'linear-gradient(315deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.14) 100%)',
                'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.0) 100%)',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* r34-hero: CSS-animated gradient morph overlay layer */}
          <div className="absolute inset-0 r34-hero-gradient-morph pointer-events-none" />
          {/* r41-hero: Enhanced multi-color gradient depth layer */}
          <div className="absolute inset-0 r41-hero-depth-gradient pointer-events-none" />

          {/* r58-hero: Animated gradient mesh blobs (moving color orbs) */}
          <div className="r58-hero-mesh-blobs absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="r58-hero-mesh-orb r58-hero-mesh-orb-1" />
            <div className="r58-hero-mesh-orb r58-hero-mesh-orb-2" />
            <div className="r58-hero-mesh-orb r58-hero-mesh-orb-3" />
          </div>

          {/* r58-hero: Subtle noise/grain texture overlay for premium feel */}
          <div className="r58-hero-noise-overlay absolute inset-0 pointer-events-none" aria-hidden="true" />

          {/* r58-hero: Animated rotating conic-gradient border glow */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="r58-hero-border-glow" />
          </div>

          {/* =====================================================
              1. PARALLAX: Dot pattern with scroll-based depth
              ===================================================== */}
          <motion.div
            className="absolute inset-0 dot-pattern opacity-60"
            style={{ y: dotPatternY }}
          />

          {/* PARALLAX: Morph blob decorative elements (deeper layer) */}
          <motion.div
            className="absolute right-0 top-0 w-2/3 h-full opacity-15"
            style={{ y: bgParallaxY }}
          >
            <div className="morph-blob absolute right-10 top-10 w-32 h-32 bg-white/30" />
            <div className="morph-blob absolute right-0 bottom-0 w-48 h-48 bg-white/20" style={{ animationDelay: '-2s' }} />
            <div className="morph-blob absolute right-20 top-1/2 w-16 h-16 bg-white/15" style={{ animationDelay: '-4s' }} />
            <div className="morph-blob absolute -right-8 -top-8 w-24 h-24 bg-white/10" style={{ animationDelay: '-6s' }} />
            <div className="morph-blob absolute right-40 bottom-10 w-12 h-12 bg-white/12" style={{ animationDelay: '-1s' }} />
          </motion.div>
          <motion.div
            className="absolute left-1/3 bottom-0 opacity-10"
            style={{ y: bgParallaxY }}
          >
            <div className="morph-blob w-20 h-20 bg-white/30" style={{ animationDelay: '-3s' }} />
          </motion.div>

          {/* =====================================================
              4. FLOATING DECORATIVE ELEMENTS (pure CSS keyframes)
              ===================================================== */}
          <div className="hidden md:block">{floatingShapes.map((shape, i) => (
            <div
              key={`float-${i}`}
              className={`hero-float-shape ${shape.className} ${shape.bg}`}
              style={{
                width: shape.size,
                height: shape.size,
                top: shape.top,
                right: shape.right,
              }}
            />
          ))}</div>

          {/* =====================================================
              6. TEXT ENTRANCE with stagger + spring physics
              ===================================================== */}
          {/* =====================================================
              7. FLOATING GRADIENT BLOBS (slow multi-axis float) — hidden on mobile
              ===================================================== */}
          <div className="hidden md:block">{floatingBlobs.map((blob, i) => (
            <motion.div
              key={`blob-${i}`}
              className={`absolute rounded-full ${blob.color} blur-3xl pointer-events-none ${i % 2 === 0 ? 'r28-hero-blob-1' : 'r28-hero-blob-2'}`}
              style={{ width: blob.size, height: blob.size, top: blob.top, right: blob.right }}
              animate={{ y: blob.animY, x: blob.animX }}
              transition={{
                duration: blob.duration,
                delay: blob.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}</div>

          <motion.div
            className="relative z-10 max-w-lg p-4 sm:p-6 lg:p-8"
            style={{ y: textParallaxY }}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            key={`text-${banner.id}`}
          >
            {/* Location indicator */}
            <motion.div
              variants={staggerItem}
              className="flex items-center gap-1.5 mb-3 text-white/80 text-xs sm:text-sm"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Entregando em Dom Eliseu, PA</span>
            </motion.div>

            <motion.h2
              variants={staggerItem}
              className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight r28-hero-heading-shimmer r34-hero-title-shimmer r41-hero-title-enhanced r43-hero-heading-mega r58-hero-shimmer-text"
              style={{
                textShadow: '0 2px 12px rgba(0,0,0,0.2)',
                backgroundImage: headingBg,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {banner.title}
            </motion.h2>

            {banner.subtitle && (
              <motion.p
                variants={staggerItem}
                className="text-sm sm:text-base text-white/90 mt-2 drop-shadow-sm max-w-md r41-hero-typewriter-target"
              >
                <span className="r41-hero-typewriter-text">{banner.subtitle}</span>
                <span className="r41-hero-typewriter-cursor" aria-hidden="true">|</span>
              </motion.p>
            )}

            {/* Store + product count badge with counter pulse */}
            <motion.div
              variants={staggerItem}
              className="mt-3 flex items-center gap-3"
            >
              <motion.div
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              >
                <Store className="h-3.5 w-3.5 text-white/90" />
                <span className="text-white text-xs font-medium">
                  <motion.span
                    className="font-bold hero-stat-pulse"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  >{storeCount}</motion.span> lojas
                </span>
              </motion.div>
              <motion.div
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <ShoppingBag className="h-3.5 w-3.5 text-white/90" />
                <span className="text-white text-xs font-medium">
                  <motion.span
                    className="font-bold hero-stat-pulse"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  >{productCount}</motion.span> produtos
                </span>
              </motion.div>
            </motion.div>

            {/* Particle/Sparkle effect behind CTA */}
            <motion.div variants={staggerItem} className="relative mt-4">
              <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
                {ctaSparkles.map((s) => (
                  <motion.span
                    key={s.id}
                    className="absolute rounded-full bg-white/70"
                    style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
                    animate={{
                      opacity: [0, 1, 0.4, 1, 0],
                      scale: [0, 1.2, 0.6, 1, 0],
                      y: [0, -8, 4, -6, 0],
                    }}
                    transition={{
                      duration: s.duration,
                      delay: s.delay,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            <div className="flex items-center gap-2.5">
              <motion.div
                className="relative rounded-lg r34-hero-cta-enhanced"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(16,185,129,0.35)',
                }}
                transition={{ duration: 0.3, type: 'spring' as const, stiffness: 400, damping: 25 }}
              >
                <Button
                  onClick={handleVerOfertas}
                  className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg min-h-11 sm:min-h-12 px-5 sm:px-6 active:scale-95 transition-transform animate-pulse-ring elevated-card press-effect relative overflow-hidden r28-cta-shimmer r41-hero-cta-primary r43-cta-shimmer-multi"
                >
                  <span className="ripple-effect absolute inset-0 rounded-lg" />
                  <span className="r34-hero-cta-sweep absolute inset-0 rounded-lg" />
                  <span className="r41-hero-cta-glow absolute inset-0 rounded-lg" />
                  <span className="relative z-10">Ver Ofertas</span>
                </Button>
              </motion.div>
              <motion.div
                className="relative rounded-lg"
                whileHover={{
                  boxShadow: '0 0 16px rgba(255,255,255,0.35), 0 0 28px rgba(255,255,255,0.15)',
                }}
                transition={{ duration: 0.3, type: 'spring' as const, stiffness: 400, damping: 25 }}
              >
                <Button
                  onClick={handleComprarAgora}
                  className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 font-semibold min-h-11 sm:min-h-12 px-5 sm:px-6 press-effect relative overflow-hidden transition-all duration-300 active:scale-95 r41-hero-cta-secondary r43-cta-secondary-glow"
                >
                  <span className="ripple-effect absolute inset-0 rounded-lg" />
                  <span className="r41-hero-cta-shimmer-sweep absolute inset-0 rounded-lg" />
                  <span className="relative z-10">Comprar Agora</span>
                </Button>
              </motion.div>
            </div>
            </motion.div>

            {/* r41-hero: Search bar with floating label and gradient border */}
            <motion.div
              variants={staggerItem}
              className="mt-4 w-full max-w-md"
            >
              <div className="relative r41-hero-search-wrap r43-hero-search-enhanced">
                <input
                  type="text"
                  placeholder="Buscar produtos, lojas..."
                  className="r41-hero-search-input r43-hero-search-conic"
                  aria-label="Buscar produtos e lojas"
                />
                <span className="r41-hero-search-float-label">Buscar em DomPlace</span>
                <span className="r41-hero-search-icon" aria-hidden="true">&#128269;</span>
                <div className="r41-hero-search-glow-border" />
              </div>
            </motion.div>

            {/* Promotional countdown timer */}
            <motion.div
              variants={staggerItem}
              className="mt-4 inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10"
            >
              <Flame className="h-4 w-4 text-amber-300 flex-shrink-0" />
              <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap">
                Oferta relâmpago termina em
              </span>
              <div className="flex items-center gap-0.5">
                {[
                  { value: pad(countdown.hours), label: 'h' },
                  { value: pad(countdown.minutes), label: 'm' },
                  { value: pad(countdown.seconds), label: 's' },
                ].map((unit, idx) => (
                  <span key={unit.label} className="flex items-center">
                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-md bg-white/20 backdrop-blur-sm font-mono text-white text-sm font-bold tabular-nums">
                      {unit.value}
                    </span>
                    <span className="text-white/60 text-[10px] font-medium ml-0.5 mr-1">{unit.label}</span>
                    {idx < 2 && (
                      <span className="text-white/50 font-bold mx-0.5">:</span>
                    )}
                  </span>
                ))}
              </div>
            </motion.div>
            {/* r41-hero: Trust badges with staggered entrance and icon wiggle */}
            <motion.div
              variants={staggerItem}
              className="mt-3 flex items-center gap-3 flex-wrap"
            >
              {[
                { icon: '🛡️', label: 'Pagamento seguro' },
                { icon: '🚚', label: 'Entrega rápida' },
                { icon: '⭐', label: 'Avaliações reais' },
                { icon: '🔄', label: 'Troca fácil' },
              ].map((badge, idx) => (
                <motion.div
                  key={`trust-${idx}`}
                  className="r41-hero-trust-badge r43-hero-trust-badge"
                  initial={{ opacity: 0, y: 12, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: 'spring' as const,
                    stiffness: 300,
                    damping: 20,
                    delay: 0.8 + idx * 0.12,
                  }}
                  whileHover={{ scale: 1.08 }}
                >
                  <span className="r41-hero-trust-icon r43-hero-trust-icon-wiggle" style={{ animationDelay: `${idx * 0.3}s` }}>{badge.icon}</span>
                  <span className="text-[10px] sm:text-xs text-white/80 font-medium whitespace-nowrap">{badge.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Floating product images — hidden on mobile */}
          <div className="hidden sm:block">{floatingProducts.map((fp, i) => (
            <motion.div
              key={`fp-${i}`}
              className={`absolute ${fp.anim} pointer-events-none select-none`}
              style={{ top: fp.top, right: fp.right, fontSize: fp.size }}
              animate={{ y: [0, -10, 5, -8, 0], rotate: [0, 5, -5, 3, 0] }}
              transition={{
                duration: 4 + i * 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span className="drop-shadow-lg opacity-50" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>{fp.emoji}</span>
            </motion.div>
          ))}</div>

          {/* r58-hero: Floating price tag / badge parallax decorations — hidden on mobile */}
          <div className="hidden md:block">{r58FloatingBadges.map((badge, i) => (
            <motion.div
              key={`r58-badge-${i}`}
              className="absolute pointer-events-none select-none"
              style={{ top: badge.top, right: badge.right }}
              animate={{
                y: [0, -8, 4, -6, 0],
                x: [0, 4, -6, 3, 0],
                rotate: [0, 4, -3, 2, 0],
              }}
              transition={{
                duration: badge.floatDur,
                delay: badge.floatDelay,
                repeat: Infinity,
                ease: 'easeInOut' as const,
              }}
            >
              <span className="r58-hero-float-badge relative drop-shadow-lg" style={{ fontSize: badge.size }}>
                {badge.emoji}
                <span className="r58-hero-badge-label absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-white/70 bg-black/20 rounded-full px-1.5 py-0.5 backdrop-blur-sm">
                  {badge.label}
                </span>
              </span>
            </motion.div>
          ))}</div>

          {/* r43-hero: Enhanced particle field (22 particles) — hidden on mobile for perf */}
          <div className="r43-hero-particle-field absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
            {r43ParticleField.map((p) => (
              <motion.div
                key={`r43-field-${p.id}`}
                className="r43-hero-field-particle absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  top: p.top,
                  right: p.right,
                }}
                animate={{
                  y: [0, -p.drift, p.drift * 0.5, -p.drift * 0.3, 0],
                  x: [0, p.drift * 0.6, -p.drift * 0.4, p.drift * 0.2, 0],
                  opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.6, p.opacity * 1.2, p.opacity],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* r43-hero: Floating emoji orbs — hidden on mobile for perf */}
          <div className="hidden md:block">{r43EmojiOrbs.map((orb, i) => (
            <motion.div
              key={`r43-emoji-orb-${i}`}
              className={`r43-hero-emoji-orb r43-emoji-orb-layer-${orb.layer} absolute pointer-events-none select-none`}
              style={{
                top: orb.top,
                right: orb.right,
                fontSize: orb.size,
              }}
              animate={{
                y: [0, -12, 6, -8, 0],
                x: [0, 6, -10, 4, 0],
                rotate: [0, 8, -6, 4, 0],
                scale: [1, 1.08, 0.95, 1.04, 1],
              }}
              transition={{
                duration: orb.speed,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span className="r43-emoji-orb-inner drop-shadow-lg">{orb.emoji}</span>
            </motion.div>
          ))}</div>

          {/* r34 floating particles — hidden on mobile for perf */}
          <div className="hidden sm:block">{heroParticles.map((p) => (
            <motion.div
              key={`hero-particle-${p.id}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                top: p.top,
                right: p.right,
                background: p.color,
                boxShadow: `0 0 ${p.size * 0.8}px ${p.color}`,
              }}
              animate={{ y: p.animY, x: p.animX, opacity: [0.4, 0.9, 0.5, 0.8, 0.4] }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}</div>

          {/* SVG Wave bottom edge */}
          <svg className="absolute bottom-0 left-0 right-0 z-10" viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 20C240 40 480 0 720 20C960 40 1200 0 1440 20V50H0V20Z" fill="rgba(0,0,0,0.06)" />
            <path d="M0 30C240 10 480 50 720 30C960 10 1200 50 1440 30V50H0V30Z" fill="rgba(0,0,0,0.03)" />
          </svg>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/20 hover:bg-black/40 text-white border-0 rounded-full z-20"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/20 hover:bg-black/40 text-white border-0 rounded-full z-20"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* =====================================================
          5. PROGRESS DOTS INDICATOR with sliding pill + glow + connecting line
          ===================================================== */}
      <div className="absolute bottom-3 left-0 right-0 z-20 flex flex-col items-center gap-1.5">
        <div className="relative flex items-center gap-1.5">
          {/* Connecting line between dots */}
          <div className="absolute top-1/2 -translate-y-1/2 left-[5px] right-[5px] h-px bg-white/15" />
          <AnimatePresence>
            <motion.div
              key={`dot-line-${current}`}
              className="absolute top-1/2 -translate-y-1/2 left-[5px] h-px bg-white/40"
              initial={{ width: 0 }}
              animate={{ width: `${(current / (enhancedBanners.length - 1)) * 100}%` }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </AnimatePresence>
          {enhancedBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative flex items-center justify-center px-0.5"
              aria-label={`Banner ${i + 1}`}
            >
              {/* The actual visible dot */}
              <div
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-1.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.4)]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
              {/* Sliding indicator with active glow (animated via layoutId) */}
              {i === current && (
                <motion.div
                  layoutId="hero-dot-indicator"
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                >
                  <motion.div
                    className="w-6 h-1.5 rounded-full bg-white"
                    animate={{
                      boxShadow: ['0 0 8px rgba(255,255,255,0.5)', '0 0 16px rgba(255,255,255,0.7), 0 0 28px rgba(255,255,255,0.3)', '0 0 8px rgba(255,255,255,0.5)'],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              )}
            </button>
          ))}
        </div>
        {/* Progress bar */}
        <div className="w-20 h-0.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/90 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
          />
        </div>
        {/* Mobile swipe hint */}
        <div className="flex items-center gap-1.5 md:hidden">
          {enhancedBanners.map((_, i) => (
            <div
              key={`swipe-${i}`}
              className={`flex items-center justify-center transition-all duration-300 ${
                i === current
                  ? 'scale-125'
                  : 'opacity-50'
              }`}
            >
              <div
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-2 h-2 bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]'
                    : 'w-1.5 h-1.5 bg-white/70'
                }`}
              />
            </div>
          ))}
          <Sparkles className="h-3 w-3 text-white/40 ml-1" />
        </div>
      </div>
      {/* Scroll-down indicator with bouncing arrow */}
      <motion.div
        className="absolute bottom-3 right-3 z-20 hidden sm:flex flex-col items-center gap-0.5"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Rolar para baixo"
      >
        <span className="text-[8px] text-white/60 font-medium">Explorar</span>
        <ChevronDown className="h-4 w-4 text-white/70" />
      </motion.div>
    </div>
  )
}
