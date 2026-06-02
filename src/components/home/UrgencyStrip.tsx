'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Clock, TrendingUp, Star, Truck, Sparkles, Tag, Gift } from 'lucide-react'

// Store color pairs for avatars
const storeAvatarColors = [
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-blue-500',
  'from-lime-400 to-green-500',
  'from-fuchsia-400 to-pink-500',
  'from-red-400 to-rose-500',
]

// Promotional messages shown when no real product data
const promoMessages: { id: string; text: string; icon: React.ReactNode; isUrgent?: boolean }[] = [
  { id: 'promo-1', text: 'Entrega grátis em compras acima de R$50 🚚', icon: <Truck className="h-3 w-3" />, isUrgent: true },
  { id: 'promo-2', text: 'Novas ofertas toda semana no DomPlace', icon: <Tag className="h-3 w-3" /> },
  { id: 'promo-3', text: 'Ganhe pontos com o programa de fidelidade', icon: <Gift className="h-3 w-3" /> },
  { id: 'promo-4', text: 'Encontre os melhores preços em Dom Eliseu', icon: <TrendingUp className="h-3 w-3" /> },
  { id: 'promo-5', text: 'Peça pelo app e receba em casa!', icon: <Sparkles className="h-3 w-3" />, isUrgent: true },
  { id: 'promo-6', text: 'Resgate prêmios diários na seção Recompensas', icon: <Star className="h-3 w-3" /> },
]

type SocialMessage = {
  id: string
  text: string
  icon: React.ReactNode
  avatar?: { initials: string; color: string }
  isUrgent?: boolean
}

// Generate messages from real product data + promo messages
function generateMessages(products: { name: string; storeName: string; createdAt: string }[]): SocialMessage[] {
  const messages: SocialMessage[] = []

  // Real product messages
  for (const product of products) {
    messages.push({
      id: `new-${product.name}`,
      text: `Novo produto: ${product.name}`,
      icon: <Sparkles className="h-3 w-3" />,
      avatar: {
        initials: product.storeName.substring(0, 2).toUpperCase(),
        color: storeAvatarColors[Math.abs(product.name.length) % storeAvatarColors.length],
      },
    })
  }

  // Always include promo messages for variety
  messages.push(...promoMessages)

  // Shuffle deterministically based on current minute for variety
  const minute = new Date().getMinutes()
  for (let i = messages.length - 1; i > 0; i--) {
    const j = (i + minute) % (i + 1)
    ;[messages[i], messages[j]] = [messages[j], messages[i]]
  }

  return messages
}

export function UrgencyStrip() {
  const [messages, setMessages] = useState<SocialMessage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const hasFetched = useRef(false)

  // Fetch real products on mount
  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    async function fetchData() {
      try {
        const res = await fetch('/api/products?limit=5&sort=newest')
        if (res.ok) {
          const data = await res.json()
          const products = data.products || []
          setMessages(generateMessages(products))
          return
        }
      } catch {
        // Network error — use promo messages only
      }
      // Fallback: promo messages only
      setMessages(generateMessages([]))
    }
    fetchData()
  }, [])

  // Auto-advance messages
  useEffect(() => {
    if (isPaused || messages.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % messages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isPaused, messages.length])

  const currentMessage = messages[currentIndex]

  if (!currentMessage) return null

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Emerald gradient background */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 relative h-9">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Main content */}
        <div className="relative flex items-center justify-center h-full px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex items-center gap-2.5 absolute"
            >
              {/* Avatar or icon */}
              {currentMessage.avatar ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className={`h-5 w-5 rounded-full bg-gradient-to-br ${currentMessage.avatar.color} flex items-center justify-center shrink-0`}
                >
                  <span className="text-[7px] font-bold text-white leading-none">
                    {currentMessage.avatar.initials}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  animate={currentMessage.isUrgent ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="shrink-0"
                >
                  <span className="text-sm">{currentMessage.icon}</span>
                </motion.div>
              )}

              <span className="text-white text-xs font-medium text-shadow-sm whitespace-nowrap">
                {currentMessage.text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Left accent */}
        <div className="absolute top-0 left-0 bottom-0 w-10 bg-gradient-to-r from-emerald-700 to-transparent pointer-events-none flex items-center justify-start pl-2.5">
          <ShoppingBag className="h-3 w-3 text-white/40" />
        </div>

        {/* Right accent */}
        <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-teal-700 to-transparent pointer-events-none flex items-center justify-end pr-2.5">
          <Clock className="h-3 w-3 text-white/40" />
        </div>

        {/* Pulse indicator dot when urgent */}
        {currentMessage.isUrgent && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-12 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-amber-400"
          />
        )}
      </div>
    </div>
  )
}
