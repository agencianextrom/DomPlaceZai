'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SCROLL_THRESHOLD = 500

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollPct, setScrollPct] = useState(0)
  const [ticking, setTicking] = useState(false)

  const handleScroll = useCallback(() => {
    if (ticking) return

    setTicking(true)
    requestAnimationFrame(() => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0

      setIsVisible(scrollY > SCROLL_THRESHOLD)
      setScrollPct(pct)
      setTicking(false)
    })
  }, [ticking])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // SVG circle progress ring parameters
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - scrollPct)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 40 }}
          transition={{ type: 'spring' as const, stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-20 md:bottom-6 right-4 z-50 h-11 w-11 rounded-full shadow-lg flex items-center justify-center transition-colors btt-shimmer group"
          aria-label="Voltar ao topo"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        >
          {/* Progress ring */}
          <svg
            className="absolute inset-0 -rotate-90"
            width="44"
            height="44"
            viewBox="0 0 44 44"
          >
            {/* Background ring */}
            <circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-primary-foreground/15"
            />
            {/* Progress ring */}
            <motion.circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-white"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          </svg>
          {/* Arrow with bounce animation */}
          <ArrowUp className="h-4 w-4 relative z-10 btt-arrow-bounce text-primary-foreground" />

          {/* Ring pulse effect on hover */}
          <span className="absolute inset-0 rounded-full btt-ring-pulse opacity-0 group-hover:opacity-100 pointer-events-none" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
