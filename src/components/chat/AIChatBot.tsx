'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/useAppStore'

interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
}

const mockResponses: { keywords: string[]; response: string }[] = [
  {
    keywords: ['entrega', 'frete', 'entreg', 'taxa de entrega'],
    response:
      'A entrega funciona de forma simples! Cobrimos toda a área urbana de Dom Eliseu. A taxa de entrega varia de R$ 0 a R$ 8,00 dependendo da loja. Muitas lojas oferecem frete grátis acima de R$ 30-50 em compras. O tempo médio de entrega é de 20 a 45 minutos! 🛵',
  },
  {
    keywords: ['pagamento', 'pix', 'cartão', 'cartao', 'dinheiro', 'pagar'],
    response:
      'Aceitamos diversos métodos de pagamento:\n\n• PIX (confirmado na hora)\n• Cartão de crédito/débito na entrega\n• Dinheiro (com troco se precisar)\n• Boleto bancário\n\nO PIX é o mais rápido e já garantimos seu pedido! 💳',
  },
  {
    keywords: ['devolução', 'troca', 'reclamação', 'reclam', 'problema', 'defeito'],
    response:
      'Política de devolução e troca:\n\n• Produtos com defeito: troca garantida em até 7 dias\n• Arrependimento: devolução em até 3 dias (produto lacrado)\n• Alimentos perecíveis: não aceitamos devolução por questões de segurança\n\nPara abrir uma reclamação, entre em contato pelo WhatsApp da loja ou pela nossa central de ajuda! 📋',
  },
  {
    keywords: ['horário', 'funcionamento', 'aberto', 'fecha', 'abre', 'hora'],
    response:
      'Nosso marketplace funciona 24h para você fazer pedidos, mas cada loja tem seu horário:\n\n• Padarias: 05h às 20h\n• Mercados: 07h às 21h\n• Farmácias: 07h às 22h\n• Salões: 09h às 20h\n• Demais lojas: 08h às 20h\n\nVocê pode verificar o horário de cada loja no perfil dela! 🕐',
  },
]

const defaultResponse =
  'Posso ajudar com mais alguma coisa? Estou aqui para você! Se precisar, posso te informar sobre entregas, pagamentos, trocas e horários de funcionamento. 😊'

function getMockResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase()
  for (const item of mockResponses) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response
    }
  }
  return defaultResponse
}

function TypingIndicator() {
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

function ChatBubble({ message }: { message: ChatMessage }) {
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

export function AIChatBot() {
  const { isChatOpen, toggleChat } = useAppStore()
  const greetingAdded = useRef(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Add initial greeting on first open
  useEffect(() => {
    if (isChatOpen && !greetingAdded.current) {
      greetingAdded.current = true
      const greetingMsg: ChatMessage = {
        id: 'greeting',
        role: 'bot',
        content: 'Olá! Sou o assistente DomPlace. Como posso ajudar?',
        timestamp: new Date(),
      }
      // Use a microtask to avoid direct setState in effect body
      queueMicrotask(() => {
        setMessages([greetingMsg])
      })
    }
  }, [isChatOpen])

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isChatOpen])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isTyping) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = getMockResponse(trimmed)
    const botMessage: ChatMessage = {
      id: `bot-${Date.now()}`,
      role: 'bot',
      content: response,
      timestamp: new Date(),
    }

    setIsTyping(false)
    setMessages((prev) => [...prev, botMessage])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={toggleChat}
            className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
            aria-label="Abrir chat"
          >
            <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Sheet */}
      <Sheet open={isChatOpen} onOpenChange={(open) => { if (!open) toggleChat() }}>
        <SheetContent
          side="bottom"
          className="h-[85vh] sm:h-[70vh] sm:max-w-md sm:mx-auto sm:bottom-4 sm:rounded-2xl p-0"
        >
          <SheetHeader className="bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground p-4 pb-6 rounded-b-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <SheetTitle className="text-base text-primary-foreground">
                  Assistente DomPlace
                </SheetTitle>
                <SheetDescription className="text-primary-foreground/80 text-xs">
                  Online agora · Resposta instantânea
                </SheetDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300" />
                </span>
              </div>
            </div>
          </SheetHeader>

          {/* Messages area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
          >
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <TypingIndicator />
              </motion.div>
            )}
          </div>

          {/* Quick action chips */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {['Sobre entregas', 'Formas de pagamento', 'Trocas e devoluções', 'Horários'].map(
                  (quick) => (
                    <button
                      key={quick}
                      onClick={() => {
                        setInputValue(quick)
                        setTimeout(() => inputRef.current?.focus(), 100)
                      }}
                      className="px-3 py-1.5 rounded-full text-xs border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                    >
                      {quick}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t bg-background p-3">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="flex-1 h-10 rounded-full px-4"
                disabled={isTyping}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shrink-0"
                aria-label="Enviar"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
