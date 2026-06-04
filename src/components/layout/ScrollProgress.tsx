'use client'
import { motion, useScroll, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })
  const [nearEnd, setNearEnd] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [progressPct, setProgressPct] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setNearEnd(latest > 0.9)
    setProgressPct(Math.round(latest * 100))
  })

  // Compute color based on scroll progress
  const barColor = progressPct < 50
    ? 'oklch(0.55 0.12 155)'    // emerald
    : progressPct < 85
      ? 'oklch(0.78 0.16 70)'   // amber
      : 'oklch(0.577 0.245 27)' // red

  const handleBarEnter = useCallback(() => setShowTooltip(true), [])
  const handleBarLeave = useCallback(() => setShowTooltip(false), [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      {/* Enhanced glow effect beneath the progress bar */}
      <motion.div
        className="h-2 -mt-0.5 origin-left scroll-bar-glow"
        style={{
          scaleX,
          filter: 'blur(8px)',
        }}
      />

      {/* Animated gradient progress bar with shimmer overlay */}
      <motion.div
        className={`h-[3px] origin-left scroll-progress-animated scroll-shimmer ${nearEnd ? 'scroll-progress-pulse' : ''}`}
        style={{
          scaleX,
        }}
        onMouseEnter={handleBarEnter}
        onMouseLeave={handleBarLeave}
      />

      {/* Progress percentage tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ duration: 0.15, ease: 'easeOut' as const }}
            className="scroll-tooltip fixed z-[101] pointer-events-none"
            style={{
              left: `${progressPct < 5 ? 24 : Math.max(24, (progressPct / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1000))}px`,
              top: '12px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg">
              {progressPct}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
