'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Clock, TrendingUp } from 'lucide-react'

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

// Generate deterministic "purchase count today" based on hour
function getPurchaseCount(): number {
  const hour = new Date().getHours()
  // Base count: 80 at 6am, peaks around 250 at lunch/dinner
  const base = Math.floor(80 + Math.sin((hour - 6) * Math.PI / 12) * 120 + Math.random() * 20)
  return Math.max(base, 42)
}

// Generate a list of urgency messages
function generateMessages(): { id: string; text: string; icon: string }[] {
  const messages: { id: string; text: string; icon: string }[] = []
  
  // Generate 8 different "purchase" messages
  for (let i = 0; i < 8; i++) {
    const name = names[i % names.length]
    const store = stores[i % stores.length]
    const product = products[i % products.length]
    const timeAgo = timeAgoLabels[i % timeAgoLabels.length]
    messages.push({
      id: `purchase-${i}`,
      text: `${name} acabou de comprar ${product} em ${store} • ${timeAgo}`,
      icon: '🛒',
    })
  }

  // Add "delivery" messages
  messages.push({
    id: 'delivery-1',
    text: `12 pedidos sendo entregues agora em Dom Eliseu`,
    icon: '🚀',
  })
  messages.push({
    id: 'delivery-2',
    text: `Mercado do Zé: entrega em 15 min para o Centro`,
    icon: '⚡',
  })

  // Add "rating" messages
  messages.push({
    id: 'rating-1',
    text: `Açaí da Boa: 4.9 estrelas • 256 avaliações positivas`,
    icon: '⭐',
  })

  return messages
}

export function UrgencyStrip() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const purchaseCount = useMemo(() => getPurchaseCount(), [])
  const messages = useMemo(() => generateMessages(), [])

  // Inject purchase count message at position 3
  const allMessages = useMemo(() => {
    const countMsg = {
      id: 'purchase-count',
      text: `${purchaseCount} pedidos hoje em Dom Eliseu 🎉`,
      icon: '📊',
    }
    const result = [...messages]
    result.splice(3, 0, countMsg)
    return result
  }, [messages, purchaseCount])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % allMessages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isPaused, allMessages.length])

  const currentMessage = allMessages[currentIndex]

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Emerald gradient background */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 relative h-8">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Main content */}
        <div className="relative flex items-center justify-center h-full px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex items-center gap-2 absolute"
            >
              <span className="text-sm">{currentMessage.icon}</span>
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
      </div>
    </div>
  )
}
