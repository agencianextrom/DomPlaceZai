'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  Clock,
  TrendingUp,
  Star,
  Truck,
  Sparkles,
  Tag,
  Gift,
} from 'lucide-react'

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

// Store code to friendly name mapping
const storeNameMap: Record<string, string> = {
  SA: 'Supermercado Araguaia',
  PE: 'Padaria Esperança',
  AC: 'Açaí do Carlos',
  FM: 'Farmácia Municipal',
  DL: 'Distribuidora de Lucro',
  CL: 'Casa das Louças',
  BT: 'Bella Toalha',
  RG: 'Ração & Grãos',
}

function resolveStoreName(raw: string): string {
  const trimmed = raw.trim()
  if (storeNameMap[trimmed]) return storeNameMap[trimmed]
  if (trimmed.length <= 3) return trimmed // Keep short abbreviations as-is if not in map
  return trimmed
}

// Promotional messages shown when no real product data
const promoMessages: {
  id: string
  text: string
  icon: React.ReactNode
  isUrgent?: boolean
}[] = [
  {
    id: 'promo-1',
    text: 'Entrega grátis em compras acima de R$50 🚚',
    icon: <Truck className="h-3 w-3" />,
    isUrgent: true,
  },
  {
    id: 'promo-2',
    text: 'Novas ofertas toda semana no DomPlace',
    icon: <Tag className="h-3 w-3" />,
  },
  {
    id: 'promo-3',
    text: 'Ganhe pontos com o programa de fidelidade',
    icon: <Gift className="h-3 w-3" />,
  },
  {
    id: 'promo-4',
    text: 'Encontre os melhores preços em Dom Eliseu',
    icon: <TrendingUp className="h-3 w-3" />,
  },
  {
    id: 'promo-5',
    text: 'Peça pelo app e receba em casa!',
    icon: <Sparkles className="h-3 w-3" />,
    isUrgent: true,
  },
  {
    id: 'promo-6',
    text: 'Resgate prêmios diários na seção Recompensas',
    icon: <Star className="h-3 w-3" />,
  },
]

type SocialMessage = {
  id: string
  text: string
  icon: React.ReactNode
  avatar?: { initials: string; color: string }
  isUrgent?: boolean
}

// Generate messages from real product data + promo messages
function generateMessages(
  products: { name: string; storeName: string; createdAt: string }[],
): SocialMessage[] {
  const messages: SocialMessage[] = []

  // Real product messages
  for (const product of products) {
    messages.push({
      id: `new-${product.name}`,
      text: `Novo produto: ${product.name} (${resolveStoreName(product.storeName)})`,
      icon: <Sparkles className="h-3 w-3" />,
      avatar: {
        initials: product.storeName.substring(0, 2).toUpperCase(),
        color:
          storeAvatarColors[
            Math.abs(product.name.length) % storeAvatarColors.length
          ],
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

  // Auto-advance messages (drives indicator dots)
  useEffect(() => {
    if (isPaused || messages.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isPaused, messages.length])

  // Up to 3 avatars for the stacked display
  const avatarStack = useMemo(() => {
    return messages.filter((m) => m.avatar).slice(0, 3)
  }, [messages])

  // Duration scales with number of messages (~5 s per message)
  // Note: marquee uses 3x copies (1 visible + 2 hidden) with CSS translateX(-33.3333%)
  const marqueeDuration = messages.length * 5

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Inject keyframes ─────────────────────────────────── */}
      <style>{`
        @keyframes urgency-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        @keyframes urgency-gradient {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
      `}</style>

      {/* ── Main strip ──────────────────────────────────────── */}
      <div className="relative h-10 overflow-hidden rounded-b-sm">
        {/* 6 · Animated gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(270deg, #059669, #0d9488, #047857, #0f766e, #059669)',
            backgroundSize: '400% 100%',
            animation: 'urgency-gradient 10s ease infinite',
          }}
        />

        {/* Subtle dot-pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Content row */}
        <div className="relative flex items-center h-full">
          {/* 4 · Left gradient edge fade */}
          <div
            className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
            style={{
              background:
                'linear-gradient(to right, rgba(5, 150, 105, 1), rgba(5, 150, 105, 0.6), transparent)',
            }}
          />

          {/* 4 · Right gradient edge fade */}
          <div
            className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
            style={{
              background:
                'linear-gradient(to left, rgba(13, 148, 136, 1), rgba(13, 148, 136, 0.6), transparent)',
            }}
          />

          {/* 2 · Avatar stack */}
          {avatarStack.length > 0 && (
            <div className="relative z-20 ml-3 shrink-0 flex items-center">
              <div
                className="relative"
                style={{ width: 24 + (avatarStack.length - 1) * 10 }}
              >
                {/* Render back-to-front so the first avatar sits on top */}
                {[...avatarStack].reverse().map((msg, i) => (
                  <motion.div
                    key={`stack-${msg.id}`}
                    className={`absolute top-0 h-6 w-6 rounded-full bg-gradient-to-br ${msg.avatar!.color} flex items-center justify-center border-2 border-emerald-700/80 shadow-sm`}
                    style={{
                      left: i * 10,
                      zIndex: avatarStack.length - i,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: i * 0.12,
                      type: 'spring',
                      stiffness: 400,
                      damping: 20,
                    }}
                  >
                    <span className="text-[8px] font-bold text-white leading-none select-none">
                      {msg.avatar!.initials}
                    </span>
                  </motion.div>
                ))}

                {/* Pulse ring on the top (first) avatar */}
                <motion.div
                  className="absolute top-0 h-6 w-6 rounded-full border-2 border-white/40 pointer-events-none"
                  style={{
                    left: (avatarStack.length - 1) * 10,
                    zIndex: avatarStack.length + 1,
                  }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </div>
          )}

          {/* 1 & 3 · Smooth marquee ticker (aria-hidden for duplicate copies) */}
          {/* Accessible: first set is visible to screen readers, duplicates are hidden */}
          <div className="flex-1 overflow-hidden mx-3" role="marquee" aria-label="Notícias e promoções">
            <div
              className="flex items-center"
              style={{
                animation: `urgency-marquee ${marqueeDuration}s linear infinite`,
                animationPlayState: isPaused ? 'paused' : 'running',
                willChange: 'transform',
              }}
            >
              {/* First copy: visible to screen readers */}
              {messages.map((msg, i) => (
                <div
                  key={`${msg.id}-m-${i}`}
                  className="flex items-center gap-2.5 px-5 shrink-0"
                >
                  {/* Per-message avatar or icon */}
                  {msg.avatar ? (
                    <div
                      className={`h-5 w-5 rounded-full bg-gradient-to-br ${msg.avatar.color} flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <span className="text-[7px] font-bold text-white leading-none select-none">
                        {msg.avatar.initials}
                      </span>
                    </div>
                  ) : (
                    <span className="text-white/70 shrink-0 flex items-center">
                      {msg.icon}
                    </span>
                  )}

                  <span className="text-white text-xs font-medium whitespace-nowrap drop-shadow-sm">
                    {msg.text}
                  </span>

                  {/* Bullet separator between messages */}
                  <span className="text-white/20 text-[8px] shrink-0 select-none">
                    ●
                  </span>
                </div>
              ))}
              {/* Duplicate copies: hidden from screen readers for accessibility */}
              <div aria-hidden="true">
                {[...messages, ...messages].map((msg, i) => (
                  <div
                    key={`dup-${msg.id}-m-${i}`}
                    className="flex items-center gap-2.5 px-5 shrink-0"
                  >
                    {msg.avatar ? (
                      <div
                        className={`h-5 w-5 rounded-full bg-gradient-to-br ${msg.avatar.color} flex items-center justify-center shrink-0 shadow-sm`}
                      >
                        <span className="text-[7px] font-bold text-white leading-none select-none">
                          {msg.avatar.initials}
                        </span>
                      </div>
                    ) : (
                      <span className="text-white/70 shrink-0 flex items-center">
                        {msg.icon}
                      </span>
                    )}
                    <span className="text-white text-xs font-medium whitespace-nowrap drop-shadow-sm">
                      {msg.text}
                    </span>
                    <span className="text-white/20 text-[8px] shrink-0 select-none">
                      ●
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right accent icons */}
          <div className="flex items-center gap-2 mr-3 shrink-0 z-20">
            <ShoppingBag className="h-3 w-3 text-white/30" />
            <Clock className="h-3 w-3 text-white/30" />
          </div>
        </div>
      </div>

      {/* 5 · Animated indicator dots */}
      <div className="flex items-center justify-center gap-1.5 py-1.5">
        {messages.map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            className="h-1.5 rounded-full"
            animate={{
              width: i === currentIndex ? 20 : 6,
              backgroundColor:
                i === currentIndex
                  ? '#10b981'
                  : 'rgba(16, 185, 129, 0.25)',
            }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  )
}
