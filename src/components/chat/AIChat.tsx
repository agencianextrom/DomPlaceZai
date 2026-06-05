'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, X, Bot, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const quickQuestions = [
  'Esse produto tem garantia?',
  'Qual o prazo de entrega?',
  'Posso trocar se não gostar?',
  'Tem em estoque?',
]

export function AIChat() {
  const { goBack } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou o assistente virtual do DomPlace. Posso ajudar com dúvidas sobre produtos, entregas, trocas e muito mais. Como posso ajudar?',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Esse produto tem garantia de 30 dias contra defeitos de fabricação. Se tiver qualquer problema, é só entrar em contato com a loja!',
        'O prazo de entrega é de 1 a 3 dias úteis para Dom Eliseu e região. Entregas são feitas de segunda a sábado.',
        'Sim! Você pode solicitar a troca em até 7 dias após o recebimento, desde que o produto esteja em sua embalagem original.',
        'Posso verificar isso para você! O produto geralmente está disponível, mas recomendo confirmar com a loja antes de finalizar.',
        'Para mais detalhes sobre esse produto, recomendo falar diretamente com a loja. Posso te ajudar com mais alguma coisa?',
      ]
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }
  
  return (
    <div className="flex flex-col h-[500px] border border-border rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">Assistente DomPlace</p>
            <p className="text-[10px] text-primary-foreground/70">Online • IA</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] text-primary-foreground hover:bg-primary-foreground/20" onClick={goBack}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-foreground'
              }`}>
                {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-md'
                  : 'bg-secondary rounded-tl-md'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.1s]" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick questions */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-secondary text-xs hover:bg-secondary/80 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      
      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida..."
            className="flex-1 h-10"
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          />
          <Button
            size="icon"
            className="h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
