'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, ChevronRight, ShoppingCart, Heart, Clock, Zap } from 'lucide-react'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { resolveProductImage } from '@/lib/product-images'
import { formatBRL } from '@/components/product/ProductCard'

/**
 * FloatingDealAlert — Shows periodic deal alerts/bubbles at the bottom of the screen.
 * Displays recent "activity" (simulated social proof) like "Maria comprou Açaí há 2min"
 * and occasional flash deal notifications.
 */
const socialProofMessages = [
  { name: 'Maria S.', action: 'comprou', product: 'Açaí Premium 700ml', store: 'Açaí da Boa', time: '2 min' },
  { name: 'João P.', action: 'adicionou ao carrinho', product: 'Arroz Tio João 5kg', store: 'Mercado do Zé', time: '5 min' },
  { name: 'Ana L.', action: 'favoritou', product: 'Bolo de Chocolate', store: 'Padaria Pão Quente', time: '8 min' },
  { name: 'Carlos M.', action: 'comprou', product: 'Power Bank 10000mAh', store: 'Loja do Eletrônico', time: '12 min' },
  { name: 'Lucia F.', action: 'avaliou', product: 'Ração Premium Cães 15kg', store: 'Pet Shop Amigo Fiel', time: '15 min' },
  { name: 'Pedro H.', action: 'comprou', product: 'Vitamina C 500mg', store: 'Farmácia Vida', time: '18 min' },
  { name: 'Fernanda R.', action: 'comprou', product: 'Capinha de Celular Premium', store: 'Loja do Eletrônico', time: '22 min' },
  { name: 'Roberto S.', action: 'adicionou ao carrinho', product: 'Sementes de Milho 5kg', store: 'Agropecuária SP', time: '25 min' },
]

const flashDealMessages = [
  { title: 'Oferta Relâmpago!', desc: 'Açaí 500ml por R$15 — Últimas unidades!', emoji: '⚡' },
  { title: 'Frete Grátis', desc: 'Compras acima de R$50 no Mercado do Zé', emoji: '🚚' },
  { title: 'Novo Produto!', desc: 'Mudas de Hortaliças — Perfeito para seu jardim', emoji: '🌱' },
  { title: 'Desconto Exclusivo', desc: '15% OFF em Ferramentas — Kit Básico R$67', emoji: '🔧' },
]

// Confetti particle component for "Ver Oferta" click
function ConfettiBurst() {
  const colors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: (Math.random() - 0.5) * 200,
    y: -(Math.random() * 120 + 40),
    rotation: Math.random() * 360,
    scale: Math.random() * 0.6 + 0.4,
    delay: Math.random() * 0.15,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0.5 }}
          animate={{
            opacity: 0,
            x: p.x,
            y: p.y,
            rotate: p.rotation,
            scale: p.scale,
          }}
          transition={{
            duration: 0.8,
            delay: p.delay,
            ease: 'easeOut',
          }}
          className="absolute left-1/2 top-1/2 w-2 h-2 rounded-sm"
          style={{
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  )
}

export function FloatingDealAlert() {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState<typeof socialProofMessages[0] | typeof flashDealMessages[0] | null>(null)
  const [messageType, setMessageType] = useState<'social' | 'deal'>('social')
  const [isDismissed, setIsDismissed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [progressKey, setProgressKey] = useState(0)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const AUTO_DISMISS_MS = 10000

  const showMessage = useCallback(() => {
    if (isDismissed) return

    const type = Math.random() > 0.6 ? 'deal' : 'social'
    setMessageType(type)

    if (type === 'social') {
      setMessage(socialProofMessages[Math.floor(Math.random() * socialProofMessages.length)])
    } else {
      setMessage(flashDealMessages[Math.floor(Math.random() * flashDealMessages.length)])
    }
    setProgressKey(k => k + 1)
    setIsVisible(true)
  }, [isDismissed])

  // Show first message after 8s, then every 25-40s
  useEffect(() => {
    const firstTimer = setTimeout(showMessage, 8000)
    return () => clearTimeout(firstTimer)
  }, [showMessage])

  useEffect(() => {
    if (isDismissed) return

    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(showMessage, 3000 + Math.random() * 5000)
    }, 25000 + Math.random() * 15000)

    return () => clearInterval(interval)
  }, [showMessage, isDismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
  }

  const handleConfettiClick = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1000)
  }

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (!isVisible) return
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    dismissTimerRef.current = setTimeout(() => setIsVisible(false), AUTO_DISMISS_MS)
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [isVisible, progressKey])

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.85, y: 20 }}
          transition={{ type: 'spring' as const, stiffness: 350, damping: 28 }}
          className="fixed bottom-20 right-3 left-3 sm:left-auto sm:w-80 z-50 fda-slide-in"
        >
          <div className="relative fda-glass backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 border border-white/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/10 r31-deal-glow r62-card-lift">
            {/* Pulsing glow ring */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none fda-ring-pulse" />

            {/* Confetti burst layer */}
            <AnimatePresence>
              {showConfetti && <ConfettiBurst />}
            </AnimatePresence>

            {/* Top gradient bar */}
            <div className={`h-1 ${
              messageType === 'deal'
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500'
                : 'bg-gradient-to-r from-emerald-400 to-teal-500'
            }`} />

            <div className="p-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {messageType === 'deal' ? (
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Clock className="h-3.5 w-3.5 text-emerald-500" />
                    </motion.div>
                  )}
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    {messageType === 'deal' ? 'Oferta do Momento' : 'Atividade Recente'}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={handleDismiss}
                  className="h-5 w-5 rounded-full flex items-center justify-center hover:bg-muted transition-colors r31-dismiss-slide"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Content */}
              {messageType === 'social' ? (
                <div className="flex items-center gap-2.5">
                  {/* Avatar */}
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 border border-primary/10">
                    <span className="text-xs font-bold text-primary">
                      {(message as any).name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">
                      <span className="font-semibold">{(message as any).name}</span>{' '}
                      <span className="text-muted-foreground">{(message as any).action}</span>{' '}
                      <span className="font-semibold text-primary">{(message as any).product}</span>
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[9px] text-muted-foreground">{(message as any).store}</span>
                      <span className="text-border">·</span>
                      <span className="text-[9px] text-muted-foreground">há {(message as any).time}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Deal emoji bounce */}
                  <p className="text-xs font-bold text-foreground flex items-center gap-1 r31-float-shimmer">
                    <motion.span
                      className="fda-emoji-bounce inline-block"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {(message as any).emoji}
                    </motion.span>
                    {(message as any).title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{(message as any).desc}</p>

                  {/* "Ver Oferta" button for deal type */}
                  <motion.div
                    className="mt-2"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <button
                      onClick={handleConfettiClick}
                      className="w-full text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg py-1.5 px-3 transition-colors flex items-center justify-center gap-1"
                    >
                      Ver Oferta
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </motion.div>
                </div>
              )}

              {/* Progress bar (auto-dismiss countdown) */}
              <div className="mt-2.5 h-0.5 bg-muted rounded-full overflow-hidden r31-timer-pulse">
                <motion.div
                  key={progressKey}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
                  className={`h-full rounded-full fda-progress ${
                    messageType === 'deal'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * QuickAddFloatingButton — Floating action button (FAB) for quick add to cart
 * Appears when user scrolls past the product grid
 */
export function QuickAddFloatingButton() {
  const [isVisible, setIsVisible] = useState(false)
  const { cartItems } = useAppStore()
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
          onClick={() => useAppStore.getState().navigate('cart')}
          className="fixed bottom-20 left-3 sm:left-4 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center z-40 group"
        >
          <AnimatePresence mode="wait">
            {cartCount > 0 ? (
              <motion.div
                key="with-count"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                <motion.span
                  key={cartCount}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              </motion.div>
            ) : (
              <motion.div
                key="no-count"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <ShoppingCart className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
