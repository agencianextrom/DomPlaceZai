'use client'

import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Store, UtensilsCrossed, Wrench, Sprout, Shirt, Smartphone, HeartPulse, Home, PawPrint, BookOpen, Scissors, Dumbbell, Package, Hammer } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'

interface CategoryItem {
  id: string
  label: string
  icon: LucideIcon
  emoji: string
  color: string
  gradientColor: string
}

const categories: CategoryItem[] = [
  { id: 'TODOS', label: 'Todos', icon: Store, emoji: '🏪', color: 'from-primary to-emerald-500', gradientColor: 'from-primary/80 to-emerald-500/80' },
  { id: 'FOOD', label: 'Alimentação', icon: UtensilsCrossed, emoji: '🍛', color: 'from-orange-400 to-orange-500', gradientColor: 'from-orange-400/80 to-orange-500/80' },
  { id: 'SERVICES', label: 'Serviços', icon: Wrench, emoji: '🔧', color: 'from-emerald-400 to-emerald-500', gradientColor: 'from-emerald-400/80 to-emerald-500/80' },
  { id: 'AGRICULTURE', label: 'Agricultura', icon: Sprout, emoji: '🌿', color: 'from-yellow-400 to-yellow-600', gradientColor: 'from-yellow-400/80 to-yellow-600/80' },
  { id: 'FASHION', label: 'Moda', icon: Shirt, emoji: '👗', color: 'from-pink-400 to-pink-500', gradientColor: 'from-pink-400/80 to-pink-500/80' },
  { id: 'ELECTRONICS', label: 'Eletrônicos', icon: Smartphone, emoji: '📱', color: 'from-slate-400 to-slate-600', gradientColor: 'from-slate-400/80 to-slate-600/80' },
  { id: 'HEALTH', label: 'Saúde', icon: HeartPulse, emoji: '💊', color: 'from-red-400 to-red-500', gradientColor: 'from-red-400/80 to-red-500/80' },
  { id: 'HOME_GARDEN', label: 'Casa & Jardim', icon: Home, emoji: '🏠', color: 'from-green-400 to-green-600', gradientColor: 'from-green-400/80 to-green-600/80' },
  { id: 'ANIMALS', label: 'Animais', icon: PawPrint, emoji: '🐾', color: 'from-amber-400 to-amber-600', gradientColor: 'from-amber-400/80 to-amber-600/80' },
  { id: 'EDUCATION', label: 'Educação', icon: BookOpen, emoji: '📚', color: 'from-cyan-400 to-cyan-500', gradientColor: 'from-cyan-400/80 to-cyan-500/80' },
  { id: 'BEAUTY', label: 'Beleza', icon: Scissors, emoji: '💇', color: 'from-rose-400 to-rose-500', gradientColor: 'from-rose-400/80 to-rose-500/80' },
  { id: 'SPORTS', label: 'Esportes', icon: Dumbbell, emoji: '⚽', color: 'from-lime-400 to-lime-600', gradientColor: 'from-lime-400/80 to-lime-600/80' },
  { id: 'OTHER', label: 'Outros', icon: Package, emoji: '📦', color: 'from-gray-400 to-gray-500', gradientColor: 'from-gray-400/80 to-gray-500/80' },
]

/** Stagger delay per icon (seconds) — creates a wave-like idle float */
const floatDelays = [0, 0.35, 0.7, 0.2, 0.55, 0.1, 0.45, 0.8, 0.25, 0.6, 0.15, 0.5, 0.3]

export function CategoryBar() {
  const { activeCategory, setActiveCategory } = useAppStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [scrollProgress, setScrollProgress] = useState(0)

  // ── Ripple cleanup ──
  useEffect(() => {
    if (ripples.length === 0) return
    const timer = setTimeout(() => setRipples([]), 650)
    return () => clearTimeout(timer)
  }, [ripples])

  // ── Scroll progress tracking ──
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = scrollWidth - clientWidth
    setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // ── Ripple handler ──
  const handleCategoryClick = useCallback(
    (catId: string, isActive: boolean, e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      setRipples((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: e.clientX - rect.left - rect.width / 2,
          y: e.clientY - rect.top - rect.height / 2,
        },
      ])
      setActiveCategory(isActive ? null : catId)
    },
    [setActiveCategory],
  )

  return (
    <div className="w-full" ref={containerRef}>
      <div className="w-full overflow-x-auto hide-scrollbar -mx-4 px-4">
        <div ref={scrollRef} className="flex gap-3 py-2 min-w-max relative">
          {/* Subtle gradient background behind the bar */}
          <div className="absolute inset-x-0 -top-1 bottom-1 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-lg pointer-events-none" />

          {categories.map((cat, index) => {
            const isActive = activeCategory === cat.id
            const IconComponent = cat.icon
            const floatDelay = floatDelays[index % floatDelays.length]

            return (
              <motion.button
                key={cat.id}
                /* ── 4. Slide-in from bottom on mount with stagger ── */
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.04,
                  type: 'spring' as const,
                  stiffness: 260,
                  damping: 24,
                }}
                whileHover={{ y: -2 }}
                onClick={(e) => handleCategoryClick(cat.id, isActive, e)}
                onMouseEnter={() => setHoveredId(cat.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="flex flex-col items-center gap-1 min-w-[68px] group relative"
              >
                {/* ── 3. Tooltip on hover with AnimatePresence ── */}
                <AnimatePresence>
                  {hoveredId === cat.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.9 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute -top-11 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-medium px-2.5 py-1 rounded-md pointer-events-none whitespace-nowrap z-30 shadow-lg"
                    >
                      {cat.label}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── 2. Active state pulse ring (expanding ring) ── */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="category-active-ring"
                      className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                {/* ── 2b. Pulse ring layers (CSS animated expanding rings) ── */}
                <AnimatePresence>
                  {isActive && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                      >
                        <span className="absolute inset-0 rounded-2xl border-2 border-primary/30 category-pulse-ring" />
                        <span
                          className="absolute inset-0 rounded-2xl border-2 border-primary/20 category-pulse-ring"
                          style={{ animationDelay: '0.5s' }}
                        />
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${
                    isActive ? cat.gradientColor : 'from-muted to-muted/80'
                  } flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300 ${
                    isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg' : ''
                  }`}
                >
                  {/* ── 1. Floating emoji icon with staggered entrance + active bounce ── */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: isActive ? [1, 1.15, 1] : 1,
                    }}
                    transition={{
                      delay: index * 0.04 + 0.12,
                      scale: isActive
                        ? { duration: 0.8, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }
                        : { duration: 0.35, type: 'spring' as const, stiffness: 350, damping: 20 },
                    }}
                  >
                    <span
                      className="text-lg leading-none category-icon-float"
                      style={{ animationDelay: `${floatDelay}s` }}
                    >
                      {cat.emoji}
                    </span>
                  </motion.div>

                  {/* Bounce animation on select */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.3, 1] }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-sm"
                      >
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── 5. Ripple effect on click ── */}
                  <AnimatePresence>
                    {ripples.map((ripple) => (
                      <span
                        key={ripple.id}
                        className="category-tap-ripple"
                        style={{
                          left: '50%',
                          top: '50%',
                          marginLeft: ripple.x - 20,
                          marginTop: ripple.y - 20,
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>

                <span
                  className={`text-[11px] font-medium transition-colors text-center leading-tight ${
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </span>

                {/* ── Animated gradient shimmer line under active/hovered ── */}
                <AnimatePresence>
                  {(isActive || hoveredId === cat.id) && (
                    <motion.div
                      initial={{ width: '0%', opacity: 0 }}
                      animate={{ width: '70%', opacity: 1 }}
                      exit={{ width: '0%', opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="h-[2px] rounded-full mx-auto mt-0.5 category-shimmer-line"
                    />
                  )}
                </AnimatePresence>

              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── 6. Scrolling category indicator bar ── */}
      <div className="relative h-1 mx-4 mt-0.5">
        {/* Gradient track */}
        <div className="absolute inset-x-0 h-full rounded-full overflow-hidden bg-muted/40">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10" />
        </div>

        {/* Glowing indicator dot */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-1 w-6 rounded-full bg-primary scroll-indicator-glow"
          animate={{ left: `${scrollProgress * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ marginLeft: '-12px' }}
        />
      </div>
    </div>
  )
}
