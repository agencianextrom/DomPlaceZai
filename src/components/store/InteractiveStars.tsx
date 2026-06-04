'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare } from 'lucide-react'

interface InteractiveStarsProps {
  /** Current average rating (0-5) */
  rating: number
  /** Total number of reviews */
  totalReviews: number
  /** Allow user to rate? Defaults to false (display only) */
  interactive?: boolean
  /** Callback when user selects a rating */
  onRate?: (rating: number) => void
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show total reviews count text */
  showCount?: boolean
  /** Layout mode */
  layout?: 'horizontal' | 'vertical'
}

const sizeMap = {
  sm: { star: 'h-4 w-4', gap: 'gap-0.5', text: 'text-xs', count: 'text-[10px]' },
  md: { star: 'h-6 w-6', gap: 'gap-1', text: 'text-sm', count: 'text-xs' },
  lg: { star: 'h-8 w-8', gap: 'gap-1.5', text: 'text-base', count: 'text-sm' },
}

// Micro-confetti burst particles
function ConfettiBurst({ x, y }: { x: number; y: number }) {
  const colors = ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="fixed z-[100] pointer-events-none rounded-full"
          style={{
            left: x,
            top: y,
            width: 4 + Math.random() * 4,
            height: 4 + Math.random() * 4,
            background: colors[i % colors.length],
          }}
          initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 80,
            y: -30 - Math.random() * 60,
            scale: 0,
            opacity: 0,
            rotate: Math.random() * 720 - 360,
          }}
          transition={{ duration: 0.6 + Math.random() * 0.3, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

// Star component with golden glow effect and fill animation
function StarButton({
  index,
  filled,
  hoverFilled,
  selected,
  size,
  interactive,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  index: number
  filled: boolean
  hoverFilled: boolean
  selected: boolean
  size: string
  interactive: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}) {
  const showFill = hoverFilled || filled
  const isGhostPreview = hoverFilled && !filled
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <motion.button
      type="button"
      disabled={!interactive}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
      whileHover={interactive && !prefersReducedMotion ? { scale: 1.2 } : undefined}
      whileTap={interactive && !prefersReducedMotion ? { scale: 0.85 } : undefined}
      aria-label={`Avaliar ${index + 1} estrela${index > 0 ? 's' : ''}`}
    >
      {/* Base star outline */}
      <Star
        className={`${size} transition-colors duration-200 ${
          showFill
            ? isGhostPreview
              ? 'text-amber-400/40 istar-preview'
              : 'text-amber-400 fill-amber-400 istar-fill'
            : 'text-muted-foreground/30'
        }`}
      />

      {/* Golden glow effect for filled/hovered stars */}
      <AnimatePresence>
        {(showFill && !isGhostPreview) && (
          <motion.div
            key={`glow-${index}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 rounded-full pointer-events-none istar-glow"
            style={{
              boxShadow: '0 0 8px 2px rgba(251, 191, 36, 0.5), 0 0 16px 4px rgba(251, 191, 36, 0.2)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Selection animation (scale + rotate burst) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={`select-${index}`}
            initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
            animate={{ scale: 1.2, rotate: 0, opacity: 1 }}
            exit={{ scale: 1, rotate: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Star className={`${size} text-yellow-200 fill-yellow-200`} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export function InteractiveStars({
  rating,
  totalReviews,
  interactive = false,
  onRate,
  size = 'md',
  showCount = true,
  layout = 'horizontal',
}: InteractiveStarsProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [justSelected, setJustSelected] = useState<number | null>(null)
  const [confettiOrigin, setConfettiOrigin] = useState<{ x: number; y: number } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [displayCount, setDisplayCount] = useState(selectedRating || rating)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Animate counter when displayCount changes
  useEffect(() => {
    const target = interactive && selectedRating > 0 ? selectedRating : rating
    if (Math.abs(target - displayCount) > 0.01) {
      const step = target > displayCount ? 0.1 : -0.1
      const interval = setInterval(() => {
        setDisplayCount((prev) => {
          const next = prev + step
          if ((step > 0 && next >= target) || (step < 0 && next <= target)) {
            clearInterval(interval)
            return Math.round(target * 10) / 10
          }
          return next
        })
      }, 40)
      return () => clearInterval(interval)
    }
  }, [rating, selectedRating, interactive, displayCount])

  // Clear the "just selected" animation after a moment
  useEffect(() => {
    if (justSelected !== null && timerRef.current === null) {
      timerRef.current = setTimeout(() => setJustSelected(null), 800)
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [justSelected])

  const handleRate = useCallback((star: number, event?: React.MouseEvent) => {
    if (!interactive) return
    setSelectedRating(star)
    setJustSelected(star)
    onRate?.(star)

    // Confetti burst at click position
    if (event) {
      setConfettiOrigin({ x: event.clientX, y: event.clientY })
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1000)
    }
  }, [interactive, onRate])

  const handleMouseEnter = useCallback((star: number) => {
    if (interactive) setHoverRating(star)
  }, [interactive])

  const handleMouseLeave = useCallback(() => {
    setHoverRating(0)
  }, [])

  const currentRating = interactive && selectedRating > 0 ? selectedRating : rating
  const sizes = sizeMap[size]

  // Count breakdown (5, 4, 3, 2, 1 stars) - simple distribution estimate
  const starCounts = totalReviews > 0
    ? [5, 4, 3, 2, 1].map((starNum) => {
        const fraction = starNum === Math.round(currentRating) ? 0.45
          : starNum === Math.round(currentRating) - 1 ? 0.25
          : starNum === Math.round(currentRating) + 1 ? 0.2
          : 0.05
        return Math.round(totalReviews * fraction)
      })
    : [0, 0, 0, 0, 0]

  return (
    <div className={`flex flex-col ${layout === 'vertical' ? 'gap-4' : 'gap-1.5'} items-start`}>
      {/* Confetti burst */}
      <AnimatePresence>
        {showConfetti && confettiOrigin && (
          <ConfettiBurst x={confettiOrigin.x} y={confettiOrigin.y} />
        )}
      </AnimatePresence>

      {/* Stars row */}
      <div className="flex items-center gap-2">
        <motion.div
          className={`flex items-center ${sizes.gap}`}
          variants={{
            animate: { transition: { staggerChildren: 0.06 } },
          }}
          initial="animate"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.div
              key={star}
              variants={{
                initial: { opacity: 0, scale: 0.5 },
                animate: { opacity: 1, scale: 1 },
              }}
              initial="initial"
              animate="animate"
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: star * 0.06 }}
            >
              <StarButton
                index={star}
                filled={currentRating >= star}
                hoverFilled={hoverRating >= star}
                selected={justSelected === star}
                size={sizes.star}
                interactive={interactive}
                onMouseEnter={() => handleMouseEnter(star)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleRate(star)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Animated numeric rating counter */}
        <motion.span
          key={`rating-${currentRating}`}
          initial={justSelected !== null ? { scale: 1.4, color: '#fbbf24' } : false}
          animate={{ scale: 1, color: '#f59e0b' }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 15 }}
          className={`${sizes.text} font-bold text-amber-500 istar-counter tabular-nums`}
        >
          {displayCount.toFixed(1)}
        </motion.span>

        {/* Review count */}
        {showCount && totalReviews > 0 && (
          <span className={`${sizes.count} text-muted-foreground`}>
            ({totalReviews.toLocaleString('pt-BR')} {totalReviews === 1 ? 'avaliação' : 'avaliações'})
          </span>
        )}
      </div>

      {/* Rating breakdown bars (only on lg size) */}
      {size === 'lg' && totalReviews > 0 && (
        <div className="w-full max-w-[200px] space-y-1">
          {[5, 4, 3, 2, 1].map((starNum, idx) => {
            const count = starCounts[idx]
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
            return (
              <div key={starNum} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-3 text-right">{starNum}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className={`h-full rounded-full transition-colors ${
                      starNum >= Math.round(currentRating)
                        ? 'bg-amber-400'
                        : 'bg-muted-foreground/20'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-6 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Interactive hint */}
      {interactive && selectedRating === 0 && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          Toque nas estrelas para avaliar
        </p>
      )}

      {/* Selection confirmation */}
      <AnimatePresence>
        {interactive && selectedRating > 0 && justSelected !== null && (
          <motion.p
            key={`feedback-${selectedRating}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="text-[10px] text-primary font-semibold"
          >
            {selectedRating === 5 ? '⭐ Excelente!' :
             selectedRating === 4 ? '👍 Muito bom!' :
             selectedRating === 3 ? '👌 Razoável' :
             selectedRating === 2 ? '😐 Poderia melhorar' :
             '👎 Ruim'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
