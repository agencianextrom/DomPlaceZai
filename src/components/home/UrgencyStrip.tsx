'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Clock, TrendingUp, Star, Truck, Eye } from 'lucide-react'

// Realistic names of Dom Eliseu residents
const names = [
  'Maria', 'João', 'Ana', 'Carlos', 'Fernanda', 'Pedro', 'Lucia', 'José',
  'Camila', 'Marcos', 'Patrícia', 'Diego', 'Juliana', 'Rafael', 'Vanessa',
  'Thiago', 'Aline', 'Bruno', 'Beatriz', 'Gabriel', 'Daniela', 'Lucas',
  'Renata', 'Felipe', 'Sandra', 'André', 'Solange', 'Rodrigo', 'Elaine', 'Victor',
]

// Stores from Dom Eliseu
const stores = [
  'Açaí da Boa',
  'Mercado do Zé',
  'Padaria Pão Quente',
  'Farmácia Vida',
  'Pet Shop Amigo Fiel',
  'Salão da Bella',
  'Loja do Eletrônico',
  'Agropecuária São Paulo',
]

// Products from Dom Eliseu
const products = [
  'Açaí 500ml',
  'Arroz Tio João 5kg',
  'Pão Francês',
  'Vitamina C 500mg',
  'Ração para Cachorro',
  'Hidratante Capilar',
  'Capa de Celular',
  'Adubo NPK 20kg',
]

// Time ago labels
const timeAgoLabels = [
  '1 min atrás',
  '2 min atrás',
  '3 min atrás',
  '5 min atrás',
  '7 min atrás',
  '10 min atrás',
  '12 min atrás',
  '15 min atrás',
]

// Review quotes
const reviewQuotes = [
  '"Melhor da cidade!"',
  '"Muito bom, recomendo!"',
  '"Entrega rápida e saboroso!"',
  '"Sempre peço aqui!"',
  '"Qualidade excelente!"',
  '"Preço justo e bom produto!"',
  '"Atendimento nota 10!"',
]

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

// Generate deterministic "purchase count today" based on hour
function getPurchaseCount(): number {
  const hour = new Date().getHours()
  const base = Math.floor(80 + Math.sin((hour - 6) * Math.PI / 12) * 120 + Math.random() * 20)
  return Math.max(base, 42)
}

// Generate delivery count
function getActiveDeliveries(): number {
  const hour = new Date().getHours()
  if (hour < 7 || hour > 22) return Math.floor(Math.random() * 3) + 1
  return Math.floor(Math.random() * 10) + 5
}

// Generate viewer count
function getViewerCount(): number {
  return Math.floor(Math.random() * 8) + 2
}

type SocialMessage = {
  id: string
  text: string
  icon: React.ReactNode
  avatar?: { initials: string; color: string }
  isUrgent?: boolean
}

// Generate rich social proof messages
function generateMessages(): SocialMessage[] {
  const messages: SocialMessage[] = []
  const now = new Date()

  // Purchase messages with avatars
  for (let i = 0; i < 6; i++) {
    const name = names[(now.getMinutes() + i * 3) % names.length]
    const store = stores[(now.getMinutes() + i * 2) % stores.length]
    const product = products[(now.getMinutes() + i) % products.length]
    const timeAgo = timeAgoLabels[i % timeAgoLabels.length]
    const colorIdx = (now.getMinutes() + i) % storeAvatarColors.length
    messages.push({
      id: `purchase-${i}`,
      text: `${name} comprou ${product} há ${timeAgo}`,
      icon: <ShoppingBag className="h-3 w-3" />,
      avatar: { initials: name.slice(0, 2).toUpperCase(), color: storeAvatarColors[colorIdx] },
    })
  }

  // Active deliveries
  const deliveryCount = getActiveDeliveries()
  messages.push({
    id: 'delivery-1',
    text: `🚚 ${deliveryCount} entregas acontecendo agora em Dom Eliseu`,
    icon: <Truck className="h-3 w-3" />,
    isUrgent: true,
  })
  messages.push({
    id: 'delivery-2',
    text: `⚡ Mercado do Zé: entrega em 15 min para o Centro`,
    icon: <Clock className="h-3 w-3" />,
  })

  // Review messages with avatar
  const quote = reviewQuotes[now.getSeconds() % reviewQuotes.length]
  const reviewer = names[now.getSeconds() % names.length]
  const colorIdx2 = now.getSeconds() % storeAvatarColors.length
  messages.push({
    id: 'rating-1',
    text: `⭐ ${reviewer} avaliou Açaí da Boa: ${quote}`,
    icon: <Star className="h-3 w-3" />,
    avatar: { initials: reviewer.slice(0, 2).toUpperCase(), color: storeAvatarColors[colorIdx2] },
  })

  // Viewer count
  const viewerCount = getViewerCount()
  messages.push({
    id: 'viewer-1',
    text: `🔥 ${viewerCount} pessoas estão vendo este produto agora`,
    icon: <Eye className="h-3 w-3" />,
    isUrgent: true,
  })

  // Trending
  messages.push({
    id: 'trending-1',
    text: `📈 Pão Francês é o mais vendido hoje em Dom Eliseu`,
    icon: <TrendingUp className="h-3 w-3" />,
  })

  return messages
}

export function UrgencyStrip() {
  const [messages, setMessages] = useState<SocialMessage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const purchaseCount = useMemo(() => getPurchaseCount(), [])
  const allMessages = useMemo(() => {
    const countMsg: SocialMessage = {
      id: 'purchase-count',
      text: `${purchaseCount} pedidos hoje em Dom Eliseu 🎉`,
      icon: <TrendingUp className="h-3 w-3" />,
      isUrgent: true,
    }
    const msgs = generateMessages()
    msgs.splice(3, 0, countMsg)
    return msgs
  }, [purchaseCount])

  // Regenerate messages periodically
  useEffect(() => {
    setMessages(allMessages)
  }, [allMessages])

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
