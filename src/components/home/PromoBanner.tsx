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

  const [dismissing, setDismissing] = useState(false)

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Silently fail if localStorage not available
    }
    setDismissing(true)
    setTimeout(() => setDismissed(true), 400)
  }, [])

  if (dismissed) return null

  const currentPromo = promoMessages[currentIndex]
  const Icon = currentPromo.icon

  return (
    <AnimatePresence>
      {isVisible && !dismissing && (
        <motion.div
          initial={{ height: 0, opacity: 0, y: 0 }}
          animate={{ height: 'auto', opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-600">
            {/* Shimmering gradient animation on ticker bar */}
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

              {/* Dot indicators with gradient dot separators */}
              <div className="absolute right-10 flex items-center gap-1.5">
                {promoMessages.map((_, i) => (
                  <span key={i} className="contents">
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        i === currentIndex
                          ? 'w-1.5 h-1.5 bg-white shadow-[0_0_4px_rgba(255,255,255,0.6)]'
                          : 'w-1 h-1 bg-white/50'
                      }`}
                    />
                    {i < promoMessages.length - 1 && (
                      <div className="w-0.5 h-0.5 rounded-full bg-white/30" />
                    )}
                  </span>
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
