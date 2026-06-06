'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X, ChevronRight, Clock, Truck, ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { formatBRL } from '@/components/product/ProductCard'

const AUTO_DISMISS_MS = 15000
const SHOW_DELAY_MS = 600
const COUNTDOWN_SECONDS = 900 // 15 minutes

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
]
const icons = ['🍎', '🛒', '📦', '🎁', '🌿', '🍞']

const floatingEmojis = [
  { emoji: '🛒', x: '5%', delay: 0, duration: 7 },
  { emoji: '✨', x: '25%', delay: 1.5, duration: 8 },
  { emoji: '🛒', x: '50%', delay: 0.8, duration: 9 },
  { emoji: '✨', x: '75%', delay: 2.5, duration: 7.5 },
  { emoji: '✨', x: '90%', delay: 1.2, duration: 8.5 },
]

export function CartRecoveryBanner() {
  const { cartItems, currentView, navigate, clearCart, getCartTotal } = useAppStore()
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isBannerActive, setIsBannerActive] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = getCartTotal()
  const shouldShow = currentView === 'home' && itemCount > 0 && !hasBeenDismissed

  // Calculate progress towards free delivery
  const freeDeliveryThreshold = 50
  const deliveryProgress = Math.min((cartTotal / freeDeliveryThreshold) * 100, 100)
  const remainingForFree = Math.max(freeDeliveryThreshold - cartTotal, 0)

  // Show first 3 cart items for preview
  const previewItems = cartItems.slice(0, 3)

  // Countdown timer effect
  useEffect(() => {
    if (isBannerActive) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current)
            setIsBannerActive(false)
            setHasBeenDismissed(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => {
        if (countdownRef.current) clearInterval(countdownRef.current)
      }
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [isBannerActive])

  // Format countdown
  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60
  const countdownStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  // Effect only sets up timers
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

  const handleViewCart = useCallback(() => {
    navigate('cart')
    setIsBannerActive(false)
    setHasBeenDismissed(true)
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
  }, [navigate])

  const handleCheckout = useCallback(() => {
    navigate('checkout')
    setIsBannerActive(false)
    setHasBeenDismissed(true)
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
  }, [navigate])

  const handleClear = useCallback(() => {
    clearCart()
    setIsBannerActive(false)
    setHasBeenDismissed(true)
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
  }, [clearCart])

  const handleDismiss = useCallback(() => {
    setIsBannerActive(false)
    setHasBeenDismissed(true)
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
  }, [])

  return (
    <AnimatePresence>
      {isBannerActive && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ type: 'tween' as const, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="overflow-hidden r62-card-lift"
        >
          {/* Animated gradient border wrapper */}
          <div className="cart-recovery-border-glow p-[2px] rounded-xl">
            <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-xl overflow-hidden">
              {/* Floating emoji particles */}
              {floatingEmojis.map((item, i) => (
                <motion.span
                  key={`emoji-${i}`}
                  className="absolute pointer-events-none select-none opacity-20 text-lg"
                  style={{ left: item.x, bottom: '-10%' }}
                  animate={{
                    y: [-20, -120],
                    opacity: [0, 0.4, 0],
                    rotate: [0, 15, -10],
                  }}
                  transition={{
                    duration: item.duration,
                    repeat: Infinity,
                    delay: item.delay,
                    ease: 'easeInOut',
                  }}
                >
                  {item.emoji}
                </motion.span>
              ))}

              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }} />
              </div>

              <div className="relative px-4 py-3 sm:px-6">
                {/* Top section: icon + message + dismiss */}
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  {/* Left: icon + message */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'tween' as const, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.15 }}
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0"
                    >
                      <ShoppingBag className="h-4.5 w-4.5" />
                    </motion.div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        🎯 Você tem <span className="inline-flex items-center justify-center bg-white/25 rounded-full px-1.5 py-0.5 text-xs font-bold mx-0.5">{itemCount}</span> {itemCount === 1 ? 'item' : 'itens'} no carrinho!
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] text-white/75">
                          Total: <span className="font-bold">{formatBRL(cartTotal)}</span>
                        </p>
                        <span className="text-[11px] text-white/50">·</span>
                        <div className="flex items-center gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                            className="h-1.5 w-1.5 rounded-full bg-amber-400"
                          />
                          <span className="text-[11px] text-white/75 font-mono font-semibold">{countdownStr}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDismiss}
                    className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center hover:bg-white/15 transition-colors shrink-0"
                    aria-label="Fechar"
                  >
                    <X className="h-3.5 w-3.5 text-white/70" />
                  </button>
                </div>

                {/* Item preview thumbnails */}
                {previewItems.length > 0 && (
                  <div className="flex items-center gap-2 mb-2.5 overflow-hidden">
                    {previewItems.map((item, i) => {
                      const gradient = gradients[Math.abs(item.product.name.charCodeAt(0)) % gradients.length]
                      const icon = icons[Math.abs(item.product.name.charCodeAt(0)) % icons.length]
                      return (
                        <motion.div
                          key={item.productId}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.08 }}
                          className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 shrink-0"
                        >
                          <div className={`h-6 w-6 rounded bg-gradient-to-br ${gradient} flex items-center justify-center text-xs shrink-0`}>
                            {icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-medium truncate max-w-[80px]">{item.product.name}</p>
                            <p className="text-[9px] text-white/60">{item.quantity}x {formatBRL(item.product.price)}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                    {cartItems.length > 3 && (
                      <span className="text-[10px] text-white/60 shrink-0">+{cartItems.length - 3} mais</span>
                    )}
                  </div>
                )}

                {/* Free delivery progress bar */}
                <div className="mb-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-white/70 flex items-center gap-1">
                      <Truck className="h-2.5 w-2.5" />
                      {remainingForFree > 0
                        ? <>Faltam <span className="font-bold text-amber-300">{formatBRL(remainingForFree)}</span> para frete grátis</>
                        : <span className="font-bold text-amber-300">🎉 Frete grátis!</span>
                      }
                    </span>
                    <span className="text-[10px] text-white/60">{Math.round(deliveryProgress)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${deliveryProgress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="h-8 min-h-[44px] px-3 text-white/70 hover:text-white hover:bg-white/15 text-xs rounded-full"
                    >
                      Limpar
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleViewCart}
                      className="h-8 min-h-[44px] px-3 text-white hover:text-white hover:bg-white/15 text-xs rounded-full gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Voltar para o carrinho
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-auto"
                  >
                    <Button
                      size="sm"
                      onClick={handleCheckout}
                      className="relative h-8 min-h-[44px] px-4 bg-white text-emerald-700 hover:bg-white/90 font-semibold text-xs rounded-full shadow-lg overflow-hidden btn-shine"
                    >
                      Finalizar compra
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
