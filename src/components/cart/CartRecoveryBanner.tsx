'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'

const AUTO_DISMISS_MS = 8000
const SHOW_DELAY_MS = 600

export function CartRecoveryBanner() {
  const { cartItems, currentView, navigate, clearCart } = useAppStore()
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isBannerActive, setIsBannerActive] = useState(false)

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const shouldShow = currentView === 'home' && itemCount > 0 && !hasBeenDismissed

  // Effect only sets up timers (setState only in async callbacks - allowed)
  useEffect(() => {
    if (shouldShow) {
      showTimerRef.current = setTimeout(() => {
        setIsBannerActive(true)

        autoTimerRef.current = setTimeout(() => {
          setIsBannerActive(false)
          setHasBeenDismissed(true)
        }, AUTO_DISMISS_MS)
      }, SHOW_DELAY_MS)

      return () => {
        if (showTimerRef.current) clearTimeout(showTimerRef.current)
        if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
      }
    }
  }, [shouldShow])

  // Clean up timers and mark as dismissed when user navigates away from home while visible
  const handleViewCart = () => {
    navigate('cart')
    setIsBannerActive(false)
    setHasBeenDismissed(true)
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
  }

  const handleClear = () => {
    clearCart()
    setIsBannerActive(false)
    setHasBeenDismissed(true)
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
  }

  const handleDismiss = () => {
    setIsBannerActive(false)
    setHasBeenDismissed(true)
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
  }

  return (
    <AnimatePresence>
      {isBannerActive && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white px-4 py-3 sm:px-6">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />
            </div>

            <div className="relative flex items-center justify-between gap-3">
              {/* Left: icon + message */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.15 }}
                  className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                </motion.div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    🎯 Você tem <span className="inline-flex items-center justify-center bg-white/25 rounded-full px-1.5 py-0.5 text-xs font-bold mx-0.5">{itemCount}</span> {itemCount === 1 ? 'item' : 'itens'} no carrinho!
                  </p>
                  <p className="text-[11px] text-white/75 hidden sm:block">
                    Seu carrinho foi salvo automaticamente
                  </p>
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-8 px-3 text-white/70 hover:text-white hover:bg-white/15 text-xs rounded-full"
                  >
                    Limpar
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="sm"
                    onClick={handleViewCart}
                    className="h-8 px-4 bg-white text-emerald-700 hover:bg-white/90 font-semibold text-xs rounded-full shadow-sm gap-1"
                  >
                    Ver carrinho
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
                <button
                  onClick={handleDismiss}
                  className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors ml-0.5"
                  aria-label="Fechar"
                >
                  <X className="h-3.5 w-3.5 text-white/70" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
