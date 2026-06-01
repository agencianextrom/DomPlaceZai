'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Flame, Sparkles, Store, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
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

const floatingDots = [
  { size: 6, top: '15%', right: '12%', delay: 0, duration: 4 },
  { size: 4, top: '60%', right: '30%', delay: 0.8, duration: 3.5 },
  { size: 5, top: '35%', right: '55%', delay: 1.5, duration: 4.5 },
  { size: 3, top: '75%', right: '18%', delay: 2, duration: 3 },
  { size: 7, top: '25%', right: '70%', delay: 0.5, duration: 5 },
  { size: 4, top: '80%', right: '60%', delay: 1.2, duration: 3.8 },
  { size: 3, top: '10%', right: '45%', delay: 2.5, duration: 4.2 },
]

// Sparkle particle positions
const sparkleParticles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  top: `${Math.random() * 80 + 5}%`,
  left: `${Math.random() * 50 + 5}%`,
  delay: Math.random() * 3,
  duration: Math.random() * 2 + 2,
  scaleRange: [0.5, 1.2] as [number, number],
}))

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
  const [scrollY, setScrollY] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchDiffX, setTouchDiffX] = useState(0)
  const { navigate, setActiveCategory } = useAppStore()
  const countdown = useCountdown()
  const dragX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Simulate loading state on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 600)
    return () => clearTimeout(timer)
  }, [])

  // Track scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const enhancedBanners = useMemo(() => {
    return banners.map((b, i) => ({
      ...b,
      gradient: bannerGradients[i % bannerGradients.length],
    }))
  }, [banners])

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % enhancedBanners.length)
    setProgress(0)
  }, [enhancedBanners.length])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + enhancedBanners.length) % enhancedBanners.length)
    setProgress(0)
  }, [enhancedBanners.length])

  // Auto-slide with progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          next()
          return 0
        }
        return prev + 100 / (SLIDE_DURATION / 50)
      })
    }, 50)
    return () => clearInterval(interval)
  }, [next])

  const handleVerOfertas = useCallback(() => {
    setActiveCategory(null)
    navigate('search')
  }, [navigate, setActiveCategory])

  const handleComprarAgora = useCallback(() => {
    setActiveCategory(null)
    navigate('search')
  }, [navigate, setActiveCategory])

  // Touch swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    dragX.current = 0
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX === null) return
    const diff = e.touches[0].clientX - touchStartX
    dragX.current = diff
    setTouchDiffX(diff)
  }, [touchStartX])

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(dragX.current) > 50) {
      if (dragX.current < 0) next()
      else prev()
    }
    setTouchStartX(null)
    setTouchDiffX(0)
  }, [next, prev])

  if (!enhancedBanners.length) return null

  // Show skeleton on first load
  if (!isLoaded) return <HeroBannerSkeleton />

  const banner = enhancedBanners[current]

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl" ref={containerRef}>
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, x: touchDiffX > 0 ? 60 : -60 }}
          animate={{ opacity: 1, x: touchDiffX }}
          exit={{ opacity: 0, x: touchDiffX > 0 ? -60 : 60 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[400px] ${banner.gradient} flex items-center overflow-hidden select-none`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable={false}
        >
          {/* Dot pattern texture overlay with parallax */}
          <div className="absolute inset-0 dot-pattern opacity-60" style={{ transform: `translateY(${scrollY * 0.15}px)` }} />

          {/* Morph blob decorative elements with parallax depth */}
          <div className="absolute right-0 top-0 w-2/3 h-full opacity-15" style={{ transform: `translateY(${scrollY * 0.08}px)` }}>
            <div className="morph-blob absolute right-10 top-10 w-32 h-32 bg-white/30" />
            <div className="morph-blob absolute right-0 bottom-0 w-48 h-48 bg-white/20" style={{ animationDelay: '-2s' }} />
            <div className="morph-blob absolute right-20 top-1/2 w-16 h-16 bg-white/15" style={{ animationDelay: '-4s' }} />
            <div className="morph-blob absolute -right-8 -top-8 w-24 h-24 bg-white/10" style={{ animationDelay: '-6s' }} />
            <div className="morph-blob absolute right-40 bottom-10 w-12 h-12 bg-white/12" style={{ animationDelay: '-1s' }} />
          </div>
          <div className="absolute left-1/3 bottom-0 opacity-10" style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
            <div className="morph-blob w-20 h-20 bg-white/30" style={{ animationDelay: '-3s' }} />
          </div>

          {/* Sparkle / particle effects behind hero text */}
          {sparkleParticles.map((particle) => (
            <motion.div
              key={`sparkle-${particle.id}`}
              className="absolute rounded-full bg-white"
              style={{
                width: particle.size,
                height: particle.size,
                top: particle.top,
                left: particle.left,
              }}
              animate={{
                scale: particle.scaleRange,
                opacity: [0.2, 0.9, 0.2],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Floating animated dots */}
          {floatingDots.map((dot, i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute rounded-full bg-white/20"
              style={{
                width: dot.size,
                height: dot.size,
                top: dot.top,
                right: dot.right,
              }}
              animate={{
                y: [-4, 4, -4],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: dot.duration,
                delay: dot.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 p-5 sm:p-8 max-w-lg">
            {/* Location indicator */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-1.5 mb-3 text-white/80 text-xs sm:text-sm"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Entregando em Dom Eliseu, PA</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
            >
              {banner.title}
            </motion.h2>

            {banner.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm sm:text-base text-white/90 mt-2 drop-shadow-sm max-w-md"
              >
                {banner.subtitle}
              </motion.p>
            )}

            {/* Store + product count badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 flex items-center gap-3"
            >
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
                <Store className="h-3.5 w-3.5 text-white/90" />
                <span className="text-white text-xs font-medium">
                  <span className="font-bold">{storeCount}</span> lojas
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
                <ShoppingBag className="h-3.5 w-3.5 text-white/90" />
                <span className="text-white text-xs font-medium">
                  <span className="font-bold">{productCount}</span> produtos
                </span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 flex items-center gap-2.5"
            >
              <Button
                onClick={handleVerOfertas}
                className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg h-10 sm:h-11 px-5 sm:px-6 animate-pulse-ring elevated-card press-effect relative overflow-hidden"
              >
                <span className="ripple-effect absolute inset-0 rounded-lg" />
                <span className="relative z-10">Ver Ofertas</span>
              </Button>
              <Button
                onClick={handleComprarAgora}
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 font-semibold h-10 sm:h-11 px-5 sm:px-6 press-effect relative overflow-hidden transition-all duration-300"
              >
                <span className="ripple-effect absolute inset-0 rounded-lg" />
                <span className="relative z-10">Comprar Agora</span>
              </Button>
            </motion.div>

            {/* Promotional countdown timer */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
          </div>

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

      {/* Dots + Progress bar */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex flex-col items-center gap-2">
        <div className="flex gap-1.5">
          {enhancedBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i)
                setProgress(0)
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
        {/* Progress bar */}
        <div className="w-24 h-0.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Mobile swipe indicator dots */}
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
    </div>
  )
}
