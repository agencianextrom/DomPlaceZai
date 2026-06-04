'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  X,
  Bot,
  User,
  ShoppingCart,
  Trash2,
  Download,
  ExternalLink,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'

// ============================================
// Types
// ============================================

interface ChatProduct {
  id: string
  name: string
  price: number
  emoji: string
  store: string
  rating: number
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  products?: ChatProduct[]
  reactions?: { type: 'up' | 'down'; count: number }
}

interface SuggestionChip {
  label: string
  emoji: string
}

// ============================================
// Constants
// ============================================

const STORAGE_KEY = 'r33-shopping-chat-history'

const SUGGESTION_CHIPS: SuggestionChip[] = [
  { label: 'Melhores ofertas', emoji: '🏷️' },
  { label: 'Produtos frescos', emoji: '🥬' },
  { label: 'Entrega rápida', emoji: '⚡' },
  { label: 'R$20 ou menos', emoji: '💰' },
]

const MOCK_PRODUCTS: ChatProduct[] = [
  { id: 'p1', name: 'Tomate Cereja Orgânico', price: 8.90, emoji: '🍅', store: 'Horta Viva', rating: 4.8 },
  { id: 'p2', name: 'Queijo Minas Fresco', price: 15.50, emoji: '🧀', store: 'Laticínios Bom Sabor', rating: 4.6 },
  { id: 'p3', name: 'Pão de Centeio Integral', price: 9.90, emoji: '🍞', store: 'Padaria Artesanal', rating: 4.9 },
  { id: 'p4', name: 'Azeite Extra Virgem 500ml', price: 32.00, emoji: '🫒', store: 'Empório Gourmet', rating: 4.7 },
  { id: 'p5', name: 'Morango Orgânico 300g', price: 14.90, emoji: '🍓', store: 'Frutas da Terra', rating: 4.5 },
  { id: 'p6', name: 'Leite Fresco 1L', price: 6.50, emoji: '🥛', store: 'Fazenda Feliz', rating: 4.8 },
  { id: 'p7', name: 'Carne Moída Especial', price: 19.90, emoji: '🥩', store: 'Açougue Premium', rating: 4.4 },
  { id: 'p8', name: 'Banana Prata 1kg', price: 5.90, emoji: '🍌', store: 'Frutas da Terra', rating: 4.3 },
  { id: 'p9', name: 'Iogurte Natural 400g', price: 7.50, emoji: '🥛', store: 'Laticínios Bom Sabor', rating: 4.6 },
  { id: 'p10', name: 'Alface Crespa', price: 4.50, emoji: '🥬', store: 'Horta Viva', rating: 4.7 },
]

const MOCK_RESPONSES: Record<string, { text: string; products: ChatProduct[] }> = {
  'Melhores ofertas': {
    text: 'Encontrei as melhores ofertas do dia! 🎉 Esses produtos estão com preços especiais e entrega grátis:',
    products: MOCK_PRODUCTS.slice(0, 3),
  },
  'Produtos frescos': {
    text: 'Aqui estão os produtos mais frescos disponíveis agora, direto dos produtores locais:',
    products: MOCK_PRODUCTS.filter((_, i) => [0, 4, 6, 9].includes(i)),
  },
  'Entrega rápida': {
    text: 'Para entrega expressa (até 30 minutos), esses produtos estão disponíveis nas lojas mais próximas de você:',
    products: MOCK_PRODUCTS.filter((_, i) => [2, 5, 8].includes(i)),
  },
  'R$20 ou menos': {
    text: 'Encontrei ótimos produtos dentro do seu orçamento! Olha só essas oportunidades:',
    products: MOCK_PRODUCTS.filter((p) => p.price <= 20),
  },
}

const GREETING_TEXT =
  'Olá! Sou seu assistente de compras inteligente! 🛒 Posso te ajudar a encontrar os melhores produtos, ofertas e muito mais. Como posso te ajudar hoje?'

const FALLBACK_RESPONSES = [
  {
    text: 'Entendi sua dúvida! Vou te ajudar. Enquanto isso, confira esses produtos que combinam com o que você procura:',
    products: MOCK_PRODUCTS.slice(3, 5),
  },
  {
    text: 'Ótima pergunta! Baseado no seu histórico, esses produtos podem te interessar:',
    products: MOCK_PRODUCTS.slice(5, 8),
  },
  {
    text: 'Vou analisar isso para você! Aqui estão algumas recomendações personalizadas:',
    products: MOCK_PRODUCTS.slice(7, 10),
  },
]

// ============================================
// Helpers
// ============================================

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function loadHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return parsed.map((m: ChatMessage) => ({ ...m, timestamp: new Date(m.timestamp) }))
  } catch {
    return []
  }
}

function saveHistory(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // storage full — ignore
  }
}

function getMockResponse(userText: string): { text: string; products: ChatProduct[] } {
  const normalized = userText.trim().toLowerCase()
  for (const [key, val] of Object.entries(MOCK_RESPONSES)) {
    if (normalized.includes(key.toLowerCase())) return val
  }
  // Check keywords
  if (normalized.includes('oferta') || normalized.includes('desconto') || normalized.includes('promoção')) {
    return MOCK_RESPONSES['Melhores ofertas']
  }
  if (normalized.includes('fresco') || normalized.includes('natural') || normalized.includes('orgânico')) {
    return MOCK_RESPONSES['Produtos frescos']
  }
  if (normalized.includes('entrega') || normalized.includes('rápido') || normalized.includes('veloc')) {
    return MOCK_RESPONSES['Entrega rápida']
  }
  if (normalized.includes('barato') || normalized.includes('barat') || normalized.includes('preço') || normalized.includes('orçamento') || normalized.includes('20') || normalized.includes('menos')) {
    return MOCK_RESPONSES['R$20 ou menos']
  }
  // Fallback random
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
}

function exportChat(messages: ChatMessage[]): void {
  const lines = messages.map((m) => {
    const time = formatTimestamp(m.timestamp)
    const sender = m.role === 'user' ? '👤 Você' : '🤖 Assistente'
    let line = `[${time}] ${sender}: ${m.content}`
    if (m.products && m.products.length > 0) {
      const prodLines = m.products.map((p) => `  • ${p.emoji} ${p.name} — R$${p.price.toFixed(2)} (${p.store})`)
      line += '\n' + prodLines.join('\n')
    }
    return line
  })
  const blob = new Blob(['📋 Conversa DomPlace — Assistente de Compras\n' + '='.repeat(45) + '\n\n' + lines.join('\n\n')], {
    type: 'text/plain;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `conversa-domplace-${new Date().toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// ============================================
// Typing Indicator
// ============================================

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-2.5"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 bg-emerald-400 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// Message Reactions
// ============================================

function MessageReactions({
  reactions,
  onReact,
}: {
  reactions: ChatMessage['reactions']
  onReact: (type: 'up' | 'down') => void
}) {
  if (!reactions) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      className="flex items-center gap-1 mt-1"
    >
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onReact('up')}
        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition-colors ${
          reactions.type === 'up'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-transparent text-muted-foreground hover:bg-muted'
        }`}
      >
        <ThumbsUp className="h-3 w-3" />
        <span>{reactions.count}</span>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onReact('down')}
        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition-colors ${
          reactions.type === 'down'
            ? 'bg-red-100 text-red-700'
            : 'bg-transparent text-muted-foreground hover:bg-muted'
        }`}
      >
        <ThumbsDown className="h-3 w-3" />
        <span>{reactions.count}</span>
      </motion.button>
    </motion.div>
  )
}

// ============================================
// Product Mini Card
// ============================================

function ProductMiniCard({
  product,
  onAddToCart,
}: {
  product: ChatProduct
  onAddToCart: (product: ChatProduct) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22, delay: 0.05 }}
      className="relative bg-card border border-border rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow r33-product-card"
    >
      <div className="flex items-start gap-3">
        {/* Emoji fallback for image */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-border flex items-center justify-center text-2xl shrink-0">
          {product.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{product.store}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-base font-bold text-emerald-600">R${product.price.toFixed(2)}</span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 gap-0.5">
              <Sparkles className="h-2.5 w-2.5" />
              {product.rating}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAddToCart(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Adicionar ao carrinho
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-accent transition-colors"
          aria-label="Ver produto"
        >
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.button>
      </div>
    </motion.div>
  )
}

// ============================================
// Chat Bubble
// ============================================

function ChatBubble({
  message,
  onReact,
  onAddToCart,
}: {
  message: ChatMessage
  onReact: (type: 'up' | 'down') => void
  onAddToCart: (product: ChatProduct) => void
}) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
      className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message text */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-line ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-card border border-border rounded-bl-md'
          }`}
        >
          {message.content}
        </motion.div>

        {/* Timestamp */}
        <p
          className={`text-[10px] text-muted-foreground mt-1 flex items-center gap-1 ${
            isUser ? 'justify-end mr-1' : 'ml-1'
          }`}
        >
          <Clock className="h-2.5 w-2.5" />
          {formatTimestamp(message.timestamp)}
        </p>

        {/* Reactions (assistant messages only) */}
        {!isUser && <MessageReactions reactions={message.reactions} onReact={onReact} />}

        {/* Product cards */}
        {message.products && message.products.length > 0 && (
          <div className="mt-2.5 space-y-2.5">
            {message.products.map((product) => (
              <ProductMiniCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// Floating Action Button
// ============================================

function FloatingActionButton({
  isOpen,
  unreadCount,
  onClick,
}: {
  isOpen: boolean
  unreadCount: number
  onClick: () => void
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring' as const, stiffness: 260, damping: 20 }}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.9 }}
                className="absolute bottom-full right-0 mb-3 bg-card border border-border rounded-lg px-3 py-1.5 shadow-lg"
              >
                <p className="text-xs font-medium whitespace-nowrap">Assistente de compras 🛒</p>
                <div className="absolute right-4 top-full w-2 h-2 bg-card border-r border-b border-border rotate-45 -translate-y-1/2" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button */}
          <motion.button
            onClick={onClick}
            onHoverStart={() => setShowTooltip(true)}
            onHoverEnd={() => setShowTooltip(false)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg flex items-center justify-center group"
            style={{ boxShadow: '0 4px 24px rgba(16, 185, 129, 0.35)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Abrir assistente de compras"
          >
            {/* Pulse glow ring */}
            <motion.span
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(16, 185, 129, 0.5)',
                  '0 0 0 14px rgba(16, 185, 129, 0)',
                  '0 0 0 0 rgba(16, 185, 129, 0.5)',
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(20, 184, 166, 0.3)',
                  '0 0 0 22px rgba(20, 184, 166, 0)',
                  '0 0 0 0 rgba(20, 184, 166, 0.3)',
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            />

            {/* Shimmer overlay */}
            <motion.span
              className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
            />

            {/* Waving robot icon */}
            <motion.div
              animate={{ rotate: [0, 14, -8, 14, -4, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'easeInOut',
              }}
            >
              <Bot className="h-7 w-7 relative z-10" />
            </motion.div>

            {/* Unread badge */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md z-20"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// Main Component
// ============================================

export function SmartShoppingAssistant() {
  // State
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [confettiActive, setConfettiActive] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(() => {
    if (typeof window === 'undefined') return true
    return loadHistory().length === 0
  })

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ---- Initialize from localStorage (lazy state) ----
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = loadHistory()
    if (saved.length > 0) return saved
    return [{
      id: generateId(),
      role: 'assistant' as const,
      content: GREETING_TEXT,
      timestamp: new Date(),
      reactions: { type: 'up' as const, count: 3 },
    }]
  })

  // ---- Auto-scroll on messages change ----
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // ---- Focus input when opening ----
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350)
    }
  }, [isOpen])

  // ---- Reset unread count via event handler pattern ----
  const openChat = useCallback(() => {
    setUnreadCount(0)
    setIsOpen(true)
  }, [])

  // ---- Persist to localStorage ----
  useEffect(() => {
    if (messages.length > 0) {
      saveHistory(messages)
    }
  }, [messages])

  // ---- Handle sending message ----
  const handleSend = useCallback(
    (textOverride?: string) => {
      const text = (textOverride || inputValue).trim()
      if (!text || isTyping) return

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInputValue('')
      setShowSuggestions(false)
      setIsTyping(true)

      // Mock AI response with delay
      const delay = 1200 + Math.random() * 1000
      setTimeout(() => {
        const response = getMockResponse(text)
        const botMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: response.text,
          timestamp: new Date(),
          products: response.products,
          reactions: { type: 'up', count: Math.floor(Math.random() * 5) + 1 },
        }
        setIsTyping(false)
        setMessages((prev) => [...prev, botMsg])

        // Increment unread if chat is closed
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1)
        }
      }, delay)
    },
    [inputValue, isTyping, isOpen]
  )

  // ---- Handle suggestion chip click ----
  const handleSuggestionClick = useCallback(
    (chip: SuggestionChip) => {
      handleSend(chip.label)
    },
    [handleSend]
  )

  // ---- Handle reaction ----
  const handleReact = useCallback((messageId: string, type: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m
        const current = m.reactions || { type: 'up' as const, count: 0 }
        if (current.type === type) {
          return { ...m, reactions: { type, count: Math.max(0, current.count - 1) } }
        }
        return { ...m, reactions: { type, count: current.count + 1 } }
      })
    )
  }, [])

  // ---- Handle add to cart ----
  const handleAddToCart = useCallback((product: ChatProduct) => {
    setConfettiActive(true)
    // Brief timeout to reset confetti
    setTimeout(() => setConfettiActive(false), 1200)
  }, [])

  // ---- Clear conversation ----
  const handleClear = useCallback(() => {
    const greeting: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: GREETING_TEXT,
      timestamp: new Date(),
      reactions: { type: 'up', count: 3 },
    }
    setMessages([greeting])
    setShowSuggestions(true)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // ---- Export conversation ----
  const handleExport = useCallback(() => {
    exportChat(messages)
  }, [messages])

  // ---- Key down handler ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <>
      {/* ---- Floating Action Button ---- */}
      <FloatingActionButton
        isOpen={isOpen}
        unreadCount={unreadCount}
        onClick={openChat}
      />

      {/* ---- Full-Screen Chat Overlay ---- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex flex-col bg-background"
          >
            {/* Header with glassmorphism */}
            <motion.header
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 280, damping: 26 }}
              className="shrink-0 px-4 py-3 flex items-center gap-3 border-b backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.82)',
                borderBottomColor: 'rgba(0, 0, 0, 0.06)',
              }}
            >
              {/* Back button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm shrink-0"
                aria-label="Fechar assistente"
              >
                <X className="h-4 w-4" />
              </motion.button>

              {/* Bot avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </span>
              </div>

              {/* Title & info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-foreground truncate">Assistente de Compras</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Online agora
                  <span className="inline-block w-1 h-1 rounded-full bg-emerald-500" />
                  <span className="ml-1">{messages.length} mensagens</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExport}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Exportar conversa"
                  title="Exportar conversa"
                >
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                  aria-label="Limpar conversa"
                  title="Limpar conversa"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </motion.button>
              </div>
            </motion.header>

            {/* Messages area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 r33-chat-scroll"
              style={{
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    onReact={(type) => handleReact(msg.id, type)}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
            </div>

            {/* Suggestion chips */}
            <AnimatePresence>
              {showSuggestions && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
                  className="shrink-0 px-4 pb-2"
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                    Sugestões rápidas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTION_CHIPS.map((chip, index) => (
                      <motion.button
                        key={chip.label}
                        initial={{ opacity: 0, scale: 0.85, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          type: 'spring' as const,
                          stiffness: 300,
                          damping: 22,
                          delay: index * 0.08,
                        }}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSuggestionClick(chip)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/70 hover:border-emerald-300 transition-colors shadow-sm"
                      >
                        <span className="text-sm">{chip.emoji}</span>
                        {chip.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input area */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 280, damping: 24, delay: 0.1 }}
              className="shrink-0 border-t bg-background p-3 safe-area-bottom"
            >
              <div className="flex items-center gap-2 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pergunte sobre produtos, ofertas..."
                    className="h-11 rounded-full px-4 pr-4 text-sm border-border focus-visible:ring-emerald-500/30"
                    disabled={isTyping}
                  />
                </div>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    size="icon"
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || isTyping}
                    className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shrink-0 disabled:opacity-40"
                    aria-label="Enviar mensagem"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
              <p className="text-center text-[10px] text-muted-foreground mt-2">
                Powered by DomPlace AI • Seus dados estão seguros 🔒
              </p>
            </motion.div>

            {/* Confetti overlay */}
            <div className="fixed inset-0 pointer-events-none z-[200]">
              <ConfettiBurst
                active={confettiActive}
                particleCount={30}
                duration={1000}
                spread={180}
                origin={{ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 200, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
