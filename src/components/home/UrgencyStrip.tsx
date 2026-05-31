'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface UrgencyMessage {
  id: string
  text: string
}

const urgencyMessages: UrgencyMessage[] = [
  { id: '1', text: '🎉 Maria comprou Açaí 500ml — há 3 min' },
  { id: '2', text: '📦 João fez pedido no Mercado do Zé — há 5 min' },
  { id: '3', text: '⚡ 12 pedidos sendo entregues agora em Dom Eliseu' },
  { id: '4', text: '🆕 Padaria Pão Quente acabou de sair do forno!' },
  { id: '5', text: '⭐ Açaí da Boa: 4.9 estrelas — 256 avaliações' },
  { id: '6', text: '🔥 Oferta relâmpago: 30% desconto hoje!' },
]

export function UrgencyStrip() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % urgencyMessages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isPaused])

  const currentMessage = urgencyMessages[currentIndex]

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Emerald gradient background */}
      <div className="bg-gradient-to-r from-primary to-emerald-600 relative h-8">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Main content */}
        <div className="relative flex items-center justify-center h-full px-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessage.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex items-center gap-2"
            >
              <span className="text-white text-xs font-medium text-shadow-sm whitespace-nowrap">
                {currentMessage.text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Fade edges */}
        <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-primary to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-emerald-600 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
