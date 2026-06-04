'use client'

import { Sun, Moon, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState, useCallback } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = useCallback(() => {
    if (!mounted) return
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)

    // Spawn sparkle particles
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const newSparkles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 40,
        y: rect.top + rect.height / 2 + (Math.random() - 0.5) * 40,
      }))
      setSparkles(newSparkles)
      setTimeout(() => setSparkles([]), 700)
    }
  }, [mounted, theme, setTheme])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        aria-label="Alternar tema"
      >
        <div className="h-5 w-5" />
      </Button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <>
      {/* Sparkle particles on theme switch */}
      <AnimatePresence>
        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            className="theme-sparkle fixed z-[100] pointer-events-none"
            style={{ left: s.x, top: s.y }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Sparkles className="h-3 w-3 text-amber-400 dark:text-emerald-400" />
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      >
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon"
          className="theme-ring-pulse relative h-10 w-10 transition-all duration-300 hover-glow"
          onClick={handleToggle}
          aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
          {/* Animated background glow ring */}
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
              className={`theme-toggle-glow absolute inset-0 rounded-full ${
                isDark
                  ? 'bg-amber-400/15'
                  : 'bg-emerald-500/15'
              }`}
            />
          </AnimatePresence>

          {/* Icon with rotation animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 350, damping: 22 }}
            >
              {isDark ? (
                <motion.div
                  className="theme-icon-spin"
                  animate={{
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.1, 1, 1.05, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sun className="h-5 w-5 text-amber-400" />
                </motion.div>
              ) : (
                <motion.div
                  className="theme-icon-spin"
                  animate={{
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.05, 1, 1.1, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Moon className="h-5 w-5" />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Tooltip hint on hover */}
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            whileHover={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-popover text-popover-foreground text-[9px] font-medium whitespace-nowrap shadow-md border border-border pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
          >
            {isDark ? 'Modo claro' : 'Modo escuro'}
          </motion.div>
        </Button>
      </motion.div>
    </>
  )
}
