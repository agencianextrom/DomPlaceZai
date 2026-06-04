'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Bot, User, Store, ArrowLeft, Clock, WifiOff, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/useAppStore'
import { useChat, useChatConnection, type ChatMessage } from '@/hooks/useChat'

// ============================================
// Types
// ============================================

interface AIChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
}

type ChatTab = 'ai' | 'orders'

interface OrderRoom {
  id: string
  orderNumber: string
  storeName: string
  status: string
}

// ============================================
// Helpers
// ============================================

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Pronto',
    delivering: 'A caminho',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  }
  return map[status] || status
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    preparing: 'bg-orange-100 text-orange-700 border-orange-200',
    ready: 'bg-purple-100 text-purple-700 border-purple-200',
    delivering: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    delivered: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  }
  return map[status] || 'bg-gray-100 text-gray-700 border-gray-200'
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ============================================
// Typing Indicator (bot)
// ============================================

function BotTypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 bg-muted-foreground/40 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// User Typing Indicator (real-time from socket)
// ============================================

function UserTypingIndicator({ names }: { names: string[] }) {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <User className="h-4 w-4 text-emerald-600" />
      </div>
      <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-2.5">
        <span className="text-xs text-muted-foreground">
          {names.length === 1
            ? `${names[0]} está digitando...`
            : `${names.length} pessoas digitando...`}
        </span>
      </div>
    </div>
  )
}

// ============================================
// AI Chat Bubble
// ============================================

function AIChatBubble({ message }: { message: AIChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-secondary rounded-bl-md'
        }`}
      >
        {message.content}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
          <User className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// Real-time Chat Bubble (order chat)
// ============================================

function RealtimeChatBubble({ message, currentUserId }: { message: ChatMessage; currentUserId: string }) {
  const isOwn = message.senderId === currentUserId

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-emerald-600" />
        </div>
      )}
      <div className="max-w-[80%]">
        {!isOwn && (
          <span className="text-[10px] text-muted-foreground ml-9 mb-0.5 block">
            {message.senderName}
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-secondary rounded-bl-md'
          }`}
        >
          {message.message}
        </div>
        <span
          className={`text-[10px] text-muted-foreground mt-0.5 block ${isOwn ? 'text-right mr-2' : 'ml-9'}`}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
      {isOwn && (
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
          <User className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// Connection status bar
// ============================================

function ConnectionStatusBar({ connected }: { connected: boolean }) {
  if (connected) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive text-xs rounded-b-lg">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>Desconectado. Tentando reconectar...</span>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function AIChatBot() {
  const { isChatOpen, toggleChat } = useAppStore()
  const currentUser = useAppStore((s) => s.currentUser)
  const isChatConnected = useAppStore((s) => s.isChatConnected)
  const selectedOrder = useAppStore((s) => s.selectedOrder)

  // Global socket connection (keep alive while logged in)
  useChatConnection(currentUser?.id, currentUser?.name || 'Usuário', currentUser?.role || 'customer')

  // UI state
  const greetingAdded = useRef(false)
  const [activeTab, setActiveTab] = useState<ChatTab>('ai')
  const [selectedRoom, setSelectedRoom] = useState<OrderRoom | null>(null)

  // AI chat state
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([])
  const [aiInputValue, setAiInputValue] = useState('')
  const [isBotTyping, setIsBotTyping] = useState(false)

  // Order chat state
  const [rtInputValue, setRtInputValue] = useState('')

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null)
  const aiInputRef = useRef<HTMLInputElement>(null)
  const rtInputRef = useRef<HTMLInputElement>(null)

  // Mock active orders for demo (in production, fetched from API)
  const activeOrders: OrderRoom[] = selectedOrder
    ? [
        {
          id: selectedOrder.id,
          orderNumber: selectedOrder.orderNumber,
          storeName: selectedOrder.storeName || 'Loja',
          status: selectedOrder.status,
        },
      ]
    : [
        { id: 'order-1', orderNumber: '#DP-1234', storeName: 'Mercado do Zé', status: 'delivering' },
        { id: 'order-2', orderNumber: '#DP-1235', storeName: 'Padaria Pão Quente', status: 'preparing' },
      ]

  // Real-time chat hook for selected room
  const currentAccountId = currentUser?.id || 'anonymous'
  const currentAccountName = currentUser?.name || 'Usuário'
  const {
    messages: rtMessages,
    sendMessage: sendRtMessage,
    sendTyping,
    isTyping: isUserTyping,
    typingUsers,
    isConnected: rtConnected,
  } = useChat({
    orderId: selectedRoom?.id || '__none__',
    accountId: currentAccountId,
    accountName: currentAccountName,
    autoConnect: !!selectedRoom,
  })

  // Add initial AI greeting on first open
  useEffect(() => {
    if (isChatOpen && !greetingAdded.current) {
      greetingAdded.current = true
      const greetingMsg: AIChatMessage = {
        id: 'greeting',
        role: 'bot',
        content: 'Olá! Sou o assistente DomPlace. Como posso ajudar?',
        timestamp: new Date(),
      }
      queueMicrotask(() => {
        setAiMessages([greetingMsg])
      })
    }
  }, [isChatOpen])

  // Focus input when chat opens or tab changes
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => {
        if (activeTab === 'ai') aiInputRef.current?.focus()
        else rtInputRef.current?.focus()
      }, 300)
    }
  }, [isChatOpen, activeTab, selectedRoom])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [aiMessages, rtMessages, isBotTyping, isUserTyping, typingUsers])

  // Switch back to AI tab if no room selected
  useEffect(() => {
    if (activeTab === 'orders' && !selectedRoom && activeOrders.length === 0) {
      setActiveTab('ai')
    }
  }, [activeTab, selectedRoom, activeOrders.length])

  // ---- AI send handler ----
  const handleAISend = useCallback(async () => {
    const trimmed = aiInputValue.trim()
    if (!trimmed || isBotTyping) return

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setAiMessages((prev) => [...prev, userMessage])
    setAiInputValue('')
    setIsBotTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: aiMessages }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)

      const data = await res.json()
      const reply = data.reply || 'Estou com dificuldades técnicas, tente novamente em instantes...'

      setIsBotTyping(false)
      setAiMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, role: 'bot', content: reply, timestamp: new Date() },
      ])
    } catch {
      setIsBotTyping(false)
      setAiMessages((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          role: 'bot',
          content: 'Estou com dificuldades técnicas, tente novamente em instantes... 😔',
          timestamp: new Date(),
        },
      ])
    }
  }, [aiInputValue, isBotTyping, aiMessages])

  // ---- Real-time send handler ----
  const handleRtSend = useCallback(() => {
    const trimmed = rtInputValue.trim()
    if (!trimmed || !selectedRoom) return
    sendRtMessage(trimmed)
    setRtInputValue('')
  }, [rtInputValue, selectedRoom, sendRtMessage])

  // ---- Typing handler for order chat ----
  const handleRtInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRtInputValue(e.target.value)
      if (e.target.value.trim()) {
        sendTyping(true)
      }
    },
    [sendTyping],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, handler: () => void) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handler()
      }
    },
    [],
  )

  // ---- AI quick actions ----
  const quickActions = ['Sobre entregas', 'Formas de pagamento', 'Trocas e devoluções', 'Horários']

  const handleQuickAction = useCallback((text: string) => {
    setAiInputValue(text)
    setTimeout(() => aiInputRef.current?.focus(), 100)
  }, [])

  return (
    <>
      {/* Floating Action Button — enhanced with glow rings and tooltip */}
      <AnimatePresence>
        {!isChatOpen && (
          <>
            {/* Tooltip on hover */}
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              transition={{ delay: 0.3 }}
              className="fixed bottom-28 sm:bottom-[4.5rem] right-4 sm:right-8 z-40 bg-card border border-border rounded-lg px-3 py-1.5 shadow-lg pointer-events-none hidden sm:block"
              style={{ transform: 'translateX(calc(-100% - 2.5rem))' }}
            >
              <p className="text-xs font-medium whitespace-nowrap">Precisa de ajuda? 💬</p>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-card border-r border-b border-border rotate-[-45deg]" />
            </motion.div>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 260, damping: 20 }}
              onClick={toggleChat}
              className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center group relative overflow-hidden"
              aria-label="Abrir chat"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Animated gradient border ring */}
              <motion.span
                className="absolute inset-0 rounded-full"
                animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.4)', '0 0 0 12px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0.4)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.span
                className="absolute inset-0 rounded-full"
                animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.2)', '0 0 0 20px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0.2)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
              {/* Shimmer overlay */}
              <motion.span
                className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
              />
              <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform relative z-10" />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Chat Sheet */}
      <Sheet open={isChatOpen} onOpenChange={(open) => { if (!open) toggleChat() }}>
        <SheetContent
          side="bottom"
          className="h-[85vh] sm:h-[70vh] sm:max-w-md sm:mx-auto sm:bottom-4 sm:rounded-2xl p-0 flex flex-col"
        >
          {/* Header */}
          <SheetHeader className="bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground p-4 pb-4 rounded-b-2xl shrink-0">
            {/* Sub-header with connection status */}
            <ConnectionStatusBar connected={isChatConnected} />

            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                {activeTab === 'orders' && selectedRoom ? (
                  <motion.button
                    key="back"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={() => setSelectedRoom(null)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0"
                    aria-label="Voltar para pedidos"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <motion.div
                    key="icon"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0"
                  >
                    {activeTab === 'ai' ? (
                      <Bot className="h-5 w-5" />
                    ) : (
                      <Store className="h-5 w-5" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 text-left min-w-0">
                <SheetTitle className="text-base text-primary-foreground truncate">
                  {activeTab === 'ai'
                    ? 'Assistente DomPlace'
                    : selectedRoom
                      ? `Chat - ${selectedRoom.orderNumber}`
                      : 'Chats de Pedidos'}
                </SheetTitle>
                <SheetDescription className="text-primary-foreground/80 text-xs truncate">
                  {activeTab === 'ai'
                    ? isChatConnected
                      ? 'Online agora · Resposta instantânea'
                      : 'Conectando...'
                    : selectedRoom
                      ? `${selectedRoom.storeName} · ${getStatusLabel(selectedRoom.status)}`
                      : `${activeOrders.length} pedido(s) ativo(s)`}
                </SheetDescription>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeTab === 'ai' && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300" />
                  </span>
                )}
                {activeTab === 'orders' && rtConnected && (
                  <span className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300" />
                  </span>
                )}
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 mt-3 bg-white/15 rounded-lg p-1">
              <button
                onClick={() => { setActiveTab('ai'); setSelectedRoom(null) }}
                className={`flex-1 text-xs py-1.5 rounded-md transition-all font-medium ${
                  activeTab === 'ai'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-primary-foreground/70 hover:text-primary-foreground'
                }`}
              >
                <Bot className="h-3.5 w-3.5 inline mr-1" />
                Assistente
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 text-xs py-1.5 rounded-md transition-all font-medium relative ${
                  activeTab === 'orders'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-primary-foreground/70 hover:text-primary-foreground'
                }`}
              >
                <MessageCircle className="h-3.5 w-3.5 inline mr-1" />
                Pedidos
                {activeOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[9px] text-white flex items-center justify-center font-bold">
                    {activeOrders.length}
                  </span>
                )}
              </button>
            </div>
          </SheetHeader>

          {/* Content area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* AI Tab */}
            {activeTab === 'ai' && (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {aiMessages.map((msg) => (
                      <AIChatBubble key={msg.id} message={msg} />
                    ))}
                  </AnimatePresence>

                  {isBotTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <BotTypingIndicator />
                    </motion.div>
                  )}
                </div>

                {/* Quick action chips */}
                {aiMessages.length <= 1 && (
                  <div className="px-4 pb-2">
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((quick) => (
                        <button
                          key={quick}
                          onClick={() => handleQuickAction(quick)}
                          className="px-3 py-1.5 rounded-full text-xs border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                        >
                          {quick}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Input */}
                <div className="border-t bg-background p-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={aiInputRef}
                      value={aiInputValue}
                      onChange={(e) => setAiInputValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, handleAISend)}
                      placeholder="Pergunte sobre pedidos, lojas..."
                      className="flex-1 h-10 rounded-full px-4"
                      disabled={isBotTyping}
                    />
                    <Button
                      size="icon"
                      onClick={handleAISend}
                      disabled={!aiInputValue.trim() || isBotTyping}
                      className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shrink-0"
                      aria-label="Enviar"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <>
                {selectedRoom ? (
                  <>
                    {/* Real-time messages for selected room */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {/* Order info banner */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                        <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{selectedRoom.storeName}</p>
                          <p className="text-[10px] text-muted-foreground">{selectedRoom.orderNumber}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 border ${getStatusColor(selectedRoom.status)}`}>
                          {getStatusLabel(selectedRoom.status)}
                        </Badge>
                      </div>

                      <Separator className="my-2" />

                      {rtMessages.length === 0 && (
                        <div className="text-center py-8">
                          <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Nenhuma mensagem ainda.
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Envie a primeira mensagem sobre este pedido.
                          </p>
                        </div>
                      )}

                      <AnimatePresence mode="popLayout">
                        {rtMessages.map((msg) => (
                          <RealtimeChatBubble
                            key={msg.id}
                            message={msg}
                            currentUserId={currentAccountId}
                          />
                        ))}
                      </AnimatePresence>

                      {/* Typing indicator */}
                      {isUserTyping && typingUsers.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <UserTypingIndicator names={typingUsers} />
                        </motion.div>
                      )}

                      {rtMessages.length === 0 && !isUserTyping && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {[
                            'Qual o status do meu pedido?',
                            'Está a caminho?',
                            'Preciso de ajuda com este pedido',
                          ].map((quick) => (
                            <button
                              key={quick}
                              onClick={() => {
                                setRtInputValue(quick)
                                setTimeout(() => rtInputRef.current?.focus(), 100)
                              }}
                              className="px-3 py-1.5 rounded-full text-xs border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                            >
                              {quick}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Real-time input */}
                    <div className="border-t bg-background p-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <Input
                          ref={rtInputRef}
                          value={rtInputValue}
                          onChange={handleRtInput}
                          onKeyDown={(e) => handleKeyDown(e, handleRtSend)}
                          placeholder="Mensagem sobre o pedido..."
                          className="flex-1 h-10 rounded-full px-4"
                          disabled={!rtConnected}
                        />
                        <Button
                          size="icon"
                          onClick={handleRtSend}
                          disabled={!rtInputValue.trim() || !rtConnected}
                          className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shrink-0"
                          aria-label="Enviar mensagem"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      {!rtConnected && (
                        <p className="text-[10px] text-destructive mt-1 text-center">
                          Aguardando conexão...
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  /* Order room list */
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <p className="text-xs text-muted-foreground mb-3">
                      Selecione um pedido para conversar com a loja ou entregador.
                    </p>
                    <div className="space-y-2">
                      {activeOrders.map((order) => (
                        <motion.button
                          key={order.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedRoom(order)}
                          className="w-full flex items-center gap-3 p-3 bg-card border rounded-xl hover:border-primary/40 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Store className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{order.storeName}</p>
                            <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0 border shrink-0 ${getStatusColor(order.status)}`}
                          >
                            {getStatusLabel(order.status)}
                          </Badge>
                          <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                        </motion.button>
                      ))}
                    </div>

                    {activeOrders.length === 0 && (
                      <div className="text-center py-12">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Nenhum pedido ativo
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Seus pedidos aparecerão aqui para conversar com a loja.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
