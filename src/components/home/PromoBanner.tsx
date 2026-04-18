'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Truck, Star, PartyPopper } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const promoMessages = [
  {
    id: 1,
    icon: Truck,
    text: '🚚 Frete grátis em pedidos acima de R$50 — Aproveite!',
  },
  {
    id: 2,
    icon: Star,
    text: '⭐ Use o cupom BEMVINDO10 e ganhe 10% de desconto',
  },
  {
    id: 3,
    icon: PartyPopper,
    text: '🎉 Novas lojas cadastradas esta semana! Confira',
  },
]

const STORAGE_KEY = 'domplace-promo-banner-dismissed'
const SCROLL_INTERVAL = 4000

function getIsDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function PromoBanner() {
  const [dismissed, setDismissed] = useState(getIsDismissed)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Smooth entrance animation
  useEffect(() => {
    if (dismissed) return
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [dismissed])

  // Auto-rotate messages
  useEffect(() => {
    if (dismissed) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promoMessages.length)
    }, SCROLL_INTERVAL)

    return () => clearInterval(interval)
  }, [dismissed])

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handler = () => setDismissed(getIsDismissed())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Silently fail if localStorage not available
    }
    setIsVisible(false)
    setTimeout(() => setDismissed(true), 300)
  }, [])

  if (dismissed) return null

  const currentPromo = promoMessages[currentIndex]
  const Icon = currentPromo.icon

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-600">
            {/* Animated background shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            />

            <div className="relative flex items-center justify-center px-4 py-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPromo.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 text-white text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{currentPromo.text}</span>
                </motion.div>
              </AnimatePresence>

              {/* Dot indicators */}
              <div className="absolute right-10 flex items-center gap-1">
                {promoMessages.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'w-1.5 h-1.5 bg-white'
                        : 'w-1 h-1 bg-white/50'
                    }`}
                  />
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Fechar banner promocional"
              >
                <X className="h-3 w-3 text-white/80" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
