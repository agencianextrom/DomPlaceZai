'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  Search,
  ShoppingCart,
  Package,
  MapPin,
  Tag,
  Wallet,
  Globe,
  Settings,
  X,
  RotateCcw,
  Volume2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Bot,
  User,
  Zap,
  Sliders,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ── Types ──────────────────────────────────────────────────────────
type VoiceState = 'idle' | 'listening' | 'processing' | 'responding' | 'error'
type Language = 'pt-br' | 'en'
type ResponseSpeed = 'fast' | 'normal' | 'slow'
type FeedbackType = 'product-found' | 'added-to-cart' | 'order-status' | 'nearby-stores' | 'promotions' | 'balance'

interface VoiceCommand {
  id: string
  text: string
  timestamp: number
}

interface ConversationEntry {
  id: string
  role: 'user' | 'ai'
  text: string
  feedbackType?: FeedbackType
  feedbackData?: FeedbackData
}

interface FeedbackData {
  product?: string
  price?: number
  store?: string
  status?: string
  balance?: number
  discount?: number
  delivery?: string
}

// ── Constants ──────────────────────────────────────────────────────
const QUICK_COMMANDS: VoiceCommand[] = [
  { id: 'qc-1', text: 'Buscar produto', timestamp: 0 },
  { id: 'qc-2', text: 'Adicionar ao carrinho', timestamp: 0 },
  { id: 'qc-3', text: 'Status do pedido', timestamp: 0 },
  { id: 'qc-4', text: 'Lojas próximas', timestamp: 0 },
  { id: 'qc-5', text: 'Promoções do dia', timestamp: 0 },
  { id: 'qc-6', text: 'Meu saldo', timestamp: 0 },
]

const QUICK_COMMAND_ICONS = [Search, ShoppingCart, Package, MapPin, Tag, Wallet]

const MOCK_RESPONSES: Record<string, { text: string; type: FeedbackType; data: FeedbackData }> = {
  'Buscar produto': {
    text: "Encontrei 5 resultados para 'Arroz Tio João 5kg'. O melhor preço é R$ 22,50 no Atacadão do Povo.",
    type: 'product-found',
    data: { product: 'Arroz Tio João 5kg', price: 22.5, store: 'Atacadão do Povo', discount: 20 },
  },
  'Adicionar ao carrinho': {
    text: 'Adicionei Arroz Tio João 5kg ao seu carrinho. Total do carrinho: R$ 47,40.',
    type: 'added-to-cart',
    data: { product: 'Arroz Tio João 5kg', price: 22.5, store: 'Atacadão do Povo' },
  },
  'Status do pedido': {
    text: 'Seu pedido #4821 está em rota de entrega. Previsão: 15 min. Entregador: Carlos M.',
    type: 'order-status',
    data: { status: 'Em rota de entrega', delivery: '15 min' },
  },
  'Lojas próximas': {
    text: 'Encontrei 3 lojas abertas próximas a você: Mercado Fresh (1.2km), Drogasil (0.8km), Padaria Sol (0.3km).',
    type: 'nearby-stores',
    data: { store: '3 lojas encontradas', delivery: '0.3km - 1.2km' },
  },
  'Promoções do dia': {
    text: '🔥 Hoje: Café Pilão 30% off, Shampoo Pantene 2x R$ 35,90. Economia total de R$ 28,50.',
    type: 'promotions',
    data: { discount: 30, product: 'Café Pilão 500g', price: 16.9 },
  },
  'Meu saldo': {
    text: 'Seu saldo DomPlace Cash é R$ 150,00. Você ganhará mais R$ 12,50 de cashback na próxima compra.',
    type: 'balance',
    data: { balance: 150.0 },
  },
}

const PROCESSING_MESSAGES: Record<Language, Record<string, string[]>> = {
  'pt-br': {
    search: ['Buscando por', 'Procurando resultados de', 'Analisando', 'Localizando'],
    cart: ['Adicionando ao carrinho', 'Inserindo no carrinho', 'Processando'],
    status: ['Verificando seu pedido', 'Consultando status de', 'Rastreando'],
    stores: ['Encontrando lojas próximas', 'Mapeando', 'Localizando comércios'],
    promos: ['Buscando promoções', 'Carregando ofertas', 'Analisando descontos'],
    balance: ['Consultando saldo', 'Verificando DomPlace Cash', 'Calculando'],
  },
  en: {
    search: ['Searching for', 'Looking up results for', 'Analyzing', 'Locating'],
    cart: ['Adding to cart', 'Inserting into cart', 'Processing'],
    status: ['Checking your order', 'Consulting status of', 'Tracking'],
    stores: ['Finding nearby stores', 'Mapping', 'Locating shops'],
    promos: ['Searching promotions', 'Loading deals', 'Analyzing discounts'],
    balance: ['Checking balance', 'Verifying DomPlace Cash', 'Calculating'],
  },
}

const ERROR_MESSAGES: Record<Language, string> = {
  'pt-br': 'Não entendi o que você disse. Pode repetir?',
  en: "I didn't understand that. Can you repeat?",
}

const LISTENING_TEXT: Record<Language, string> = {
  'pt-br': 'Ouvindo...',
  en: 'Listening...',
}

// ── Helpers ────────────────────────────────────────────────────────
function generateId(): string {
  return `vc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getCategoryForCommand(command: string): string {
  const mapping: Record<string, string> = {
    'Buscar produto': 'search',
    'Adicionar ao carrinho': 'cart',
    'Status do pedido': 'status',
    'Lojas próximas': 'stores',
    'Promoções do dia': 'promos',
    'Meu saldo': 'balance',
  }
  return mapping[command] || 'search'
}

function formatCurrency(value: number, lang: Language): string {
  return lang === 'pt-br'
    ? `R$ ${value.toFixed(2).replace('.', ',')}`
    : `$ ${value.toFixed(2)}`
}

// ── Waveform Visualizer ────────────────────────────────────────────
function WaveformVisualizer({ isActive }: { isActive: boolean }) {
  const [bars, setBars] = useState<number[]>(new Array(12).fill(8))

  useEffect(() => {
    if (!isActive) {
      setBars(new Array(12).fill(8))
      return
    }

    const interval = setInterval(() => {
      setBars(
        Array.from({ length: 12 }, () =>
          Math.max(4, Math.floor(Math.random() * 40) + 8)
        )
      )
    }, 120)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="r48-waveform-container flex items-end justify-center gap-[3px] h-12">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="r48-waveform-bar rounded-full"
          style={{
            width: 4,
            backgroundColor: isActive
              ? `rgba(139, 92, 246, ${0.5 + (height / 48) * 0.5})`
              : 'rgba(139, 92, 246, 0.25)',
            boxShadow: isActive
              ? `0 0 6px rgba(139, 92, 246, 0.4)`
              : 'none',
          }}
          animate={{ height: isActive ? height : 8 }}
          transition={
            isActive
              ? { type: 'spring' as const, stiffness: 500, damping: 18, duration: 0.15 }
              : { type: 'spring' as const, stiffness: 300, damping: 25 }
          }
        />
      ))}
    </div>
  )
}

// ── Voice Feedback Card ────────────────────────────────────────────
function VoiceFeedbackCard({ type, data, lang }: { type: FeedbackType; data: FeedbackData; lang: Language }) {
  const config: Record<FeedbackType, {
    gradient: string
    border: string
    icon: React.ReactNode
    label: string
    color: string
  }> = {
    'product-found': {
      gradient: 'from-violet-500/10 to-purple-500/5',
      border: 'border-violet-500/20',
      icon: <Search className="h-5 w-5 text-violet-500" />,
      label: lang === 'pt-br' ? 'Produto Encontrado' : 'Product Found',
      color: 'text-violet-600 dark:text-violet-400',
    },
    'added-to-cart': {
      gradient: 'from-emerald-500/10 to-green-500/5',
      border: 'border-emerald-500/20',
      icon: <ShoppingCart className="h-5 w-5 text-emerald-500" />,
      label: lang === 'pt-br' ? 'Adicionado ao Carrinho' : 'Added to Cart',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    'order-status': {
      gradient: 'from-blue-500/10 to-sky-500/5',
      border: 'border-blue-500/20',
      icon: <Package className="h-5 w-5 text-blue-500" />,
      label: lang === 'pt-br' ? 'Status do Pedido' : 'Order Status',
      color: 'text-blue-600 dark:text-blue-400',
    },
    'nearby-stores': {
      gradient: 'from-amber-500/10 to-orange-500/5',
      border: 'border-amber-500/20',
      icon: <MapPin className="h-5 w-5 text-amber-500" />,
      label: lang === 'pt-br' ? 'Lojas Próximas' : 'Nearby Stores',
      color: 'text-amber-600 dark:text-amber-400',
    },
    'promotions': {
      gradient: 'from-rose-500/10 to-pink-500/5',
      border: 'border-rose-500/20',
      icon: <Tag className="h-5 w-5 text-rose-500" />,
      label: lang === 'pt-br' ? 'Promoções do Dia' : "Today's Promos",
      color: 'text-rose-600 dark:text-rose-400',
    },
    'balance': {
      gradient: 'from-cyan-500/10 to-teal-500/5',
      border: 'border-cyan-500/20',
      icon: <Wallet className="h-5 w-5 text-cyan-500" />,
      label: lang === 'pt-br' ? 'Meu Saldo' : 'My Balance',
      color: 'text-cyan-600 dark:text-cyan-400',
    },
  }

  const c = config[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 22 }}
      className={`r48-feedback-card bg-gradient-to-br ${c.gradient} border ${c.border} rounded-xl p-3.5`}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="r48-feedback-icon-wrap h-9 w-9 rounded-lg bg-background/60 flex items-center justify-center">
          {c.icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold">{c.label}</p>
          <p className={`text-[10px] font-medium ${c.color}`}>
            <CheckCircle2 className="inline h-3 w-3 mr-0.5" />
            {lang === 'pt-br' ? 'Concluído' : 'Done'}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {data.product && (
          <div className="flex justify-between items-center bg-background/40 rounded-lg px-2.5 py-2">
            <span className="text-[11px] font-medium truncate mr-2">{data.product}</span>
            {data.price != null && (
              <Badge className="r48-price-badge bg-violet-500/15 text-violet-700 dark:text-violet-300 border-0 text-[10px] font-bold shrink-0">
                {formatCurrency(data.price, lang)}
              </Badge>
            )}
          </div>
        )}
        {data.store && type !== 'product-found' && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {data.store}
          </p>
        )}
        {data.status && (
          <div className="flex items-center gap-2 bg-background/40 rounded-lg px-2.5 py-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-semibold">{data.status}</span>
            {data.delivery && (
              <Badge className="r48-delivery-badge bg-blue-500/15 text-blue-700 dark:text-blue-300 border-0 text-[10px] font-semibold ml-auto shrink-0">
                <Clock className="h-3 w-3 mr-0.5" />
                {data.delivery}
              </Badge>
            )}
          </div>
        )}
        {data.balance != null && (
          <div className="bg-background/40 rounded-lg px-2.5 py-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">{lang === 'pt-br' ? 'Saldo disponível' : 'Available balance'}</p>
            <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
              {formatCurrency(data.balance, lang)}
            </p>
          </div>
        )}
        {data.discount != null && (
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
              -{data.discount}% {lang === 'pt-br' ? 'de desconto' : 'discount'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Pulse Rings (3 layers) ────────────────────────────────────────
function PulseRings({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="r48-pulse-ring absolute rounded-full border-2 border-violet-400/40"
          style={{ width: 56 + i * 16, height: 56 + i * 16 }}
          animate={
            active
              ? {
                  scale: [1, 1.8 + i * 0.3],
                  opacity: [0.6, 0],
                }
              : { scale: 1, opacity: 0 }
          }
          transition={
            active
              ? {
                  duration: 1.6 + i * 0.2,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * 0.3,
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  )
}

// ── Listening State Dots ──────────────────────────────────────────
function ListeningDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-violet-400"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ── Error Card with Shake ─────────────────────────────────────────
function ErrorCard({ lang, onRetry }: { lang: Language; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
    >
      <motion.div
        animate={{ x: [0, -6, 6, -4, 4, -2, 2, 0] }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="r48-error-card bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 rounded-xl p-3.5"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-9 w-9 rounded-lg bg-red-500/15 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-xs font-bold text-red-600 dark:text-red-400">
            {ERROR_MESSAGES[lang]}
          </p>
        </div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="r48-retry-btn w-full gap-1.5 text-[11px] font-semibold border-red-500/20 hover:bg-red-500/10 text-red-600 dark:text-red-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {lang === 'pt-br' ? 'Tentar novamente' : 'Try again'}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ── Conversation Bubble ──────────────────────────────────────────
function ConversationBubble({
  entry,
  index,
  lang,
}: {
  entry: ConversationEntry
  index: number
  lang: Language
}) {
  const isUser = entry.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 24, delay: index * 0.08 }}
      className={`r48-conversation-bubble flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-violet-500 to-purple-600'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600'
        }`}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-white" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-white" />
        )}
      </div>
      <div
        className={`max-w-[75%] rounded-xl px-3 py-2.5 ${
          isUser
            ? 'bg-violet-500 text-white rounded-tr-sm'
            : 'bg-muted rounded-tl-sm'
        }`}
      >
        <p className={`text-[11px] leading-relaxed ${isUser ? 'font-medium' : 'font-medium'}`}>
          {entry.text}
        </p>
        {entry.feedbackType && entry.feedbackData && !isUser && (
          <div className="mt-2">
            <VoiceFeedbackCard
              type={entry.feedbackType}
              data={entry.feedbackData}
              lang={lang}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function VoiceShoppingAssistant() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [language, setLanguage] = useState<Language>('pt-br')
  const [conversations, setConversations] = useState<ConversationEntry[]>([])
  const [processingText, setProcessingText] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sensitivity, setSensitivity] = useState(70)
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false)
  const [responseSpeed, setResponseSpeed] = useState<ResponseSpeed>('normal')
  const [hasError, setHasError] = useState(false)
  const [floatingBtnVisible, setFloatingBtnVisible] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setFloatingBtnVisible(true), 400)
    return () => clearTimeout(timer)
  }, [])

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false)
      }
    }
    if (panelOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [panelOpen])

  const speedDelay = useCallback((): number => {
    switch (responseSpeed) {
      case 'fast': return 800
      case 'slow': return 2400
      default: return 1500
    }
  }, [responseSpeed])

  const simulateCommand = useCallback(
    (commandText: string) => {
      setHasError(false)
      const userEntry: ConversationEntry = {
        id: generateId(),
        role: 'user',
        text: commandText,
      }

      setConversations((prev) => [...prev.slice(-4), userEntry])
      setVoiceState('processing')

      const category = getCategoryForCommand(commandText)
      const messages = PROCESSING_MESSAGES[language][category]
      const randomMsg = messages[Math.floor(Math.random() * messages.length)]
      setProcessingText(randomMsg)

      // Simulate sometimes triggering an error (10% chance)
      const isError = Math.random() < 0.1

      const delay = speedDelay()

      setTimeout(() => {
        if (isError) {
          setVoiceState('error')
          setHasError(true)
          setProcessingText('')
          return
        }

        const response = MOCK_RESPONSES[commandText]
        if (!response) {
          setVoiceState('error')
          setHasError(true)
          setProcessingText('')
          return
        }

        setVoiceState('responding')
        setProcessingText('')

        const aiEntry: ConversationEntry = {
          id: generateId(),
          role: 'ai',
          text: response.text,
          feedbackType: response.type,
          feedbackData: response.data,
        }

        setConversations((prev) => [...prev, aiEntry])

        setTimeout(() => {
          setVoiceState('idle')
        }, 600)
      }, delay)
    },
    [language, speedDelay]
  )

  const handleMicClick = useCallback(() => {
    if (voiceState === 'idle' || voiceState === 'error') {
      setPanelOpen(true)
      setHasError(false)
      setVoiceState('listening')

      // Simulate receiving a command after 2 seconds of "listening"
      const randomCommand = QUICK_COMMANDS[Math.floor(Math.random() * QUICK_COMMANDS.length)]
      setTimeout(() => {
        setVoiceState('processing')
        simulateCommand(randomCommand.text)
      }, 2000)
    } else if (voiceState === 'listening') {
      setVoiceState('idle')
    }
  }, [voiceState, simulateCommand])

  const handleRetry = useCallback(() => {
    setHasError(false)
    setVoiceState('listening')
    const randomCommand = QUICK_COMMANDS[Math.floor(Math.random() * QUICK_COMMANDS.length)]
    setTimeout(() => {
      setVoiceState('processing')
      simulateCommand(randomCommand.text)
    }, 2000)
  }, [simulateCommand])

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'pt-br' ? 'en' : 'pt-br'))
  }, [])

  const speedLabels: Record<Language, Record<ResponseSpeed, string>> = {
    'pt-br': { fast: 'Rápida', normal: 'Normal', slow: 'Lenta' },
    en: { fast: 'Fast', normal: 'Normal', slow: 'Slow' },
  }

  return (
    <div className="r48-voice-assistant relative">
      {/* ── Floating Mic Button ─────────────────────────────── */}
      <AnimatePresence>
        {floatingBtnVisible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
            className="r48-floating-btn fixed bottom-6 right-6 z-50"
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <button
                onClick={handleMicClick}
                className="relative h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg cursor-pointer"
                style={{
                  boxShadow: voiceState === 'listening'
                    ? '0 0 24px rgba(139, 92, 246, 0.5), 0 4px 16px rgba(139, 92, 246, 0.3)'
                    : '0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(139, 92, 246, 0.2)',
                }}
                aria-label={voiceState === 'idle' ? (language === 'pt-br' ? 'Iniciar assistente de voz' : 'Start voice assistant') : LISTENING_TEXT[language]}
              >
                <PulseRings active={voiceState === 'listening'} />
                <AnimatePresence mode="wait">
                  {voiceState === 'listening' ? (
                    <motion.div
                      key="mic-on"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 18 }}
                    >
                      <Mic className="h-7 w-7 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mic-off"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 18 }}
                    >
                      <MicOff className="h-6 w-6 text-white/80" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>

            {/* Voice state badge */}
            <AnimatePresence>
              {voiceState !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.8 }}
                  transition={{ type: 'spring' as const, stiffness: 350, damping: 22 }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2"
                >
                  <Badge
                    className={`r48-state-badge text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md ${
                      voiceState === 'listening'
                        ? 'bg-violet-500 text-white'
                        : voiceState === 'processing'
                        ? 'bg-amber-500 text-white'
                        : voiceState === 'responding'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {voiceState === 'listening' && (
                      <span className="flex items-center gap-1">
                        <ListeningDots />
                        {LISTENING_TEXT[language]}
                      </span>
                    )}
                    {voiceState === 'processing' && (
                      <span className="flex items-center gap-1">
                        <Volume2 className="h-3 w-3 animate-pulse" />
                        {language === 'pt-br' ? 'Processando...' : 'Processing...'}
                      </span>
                    )}
                    {voiceState === 'responding' && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {language === 'pt-br' ? 'Respondendo' : 'Responding'}
                      </span>
                    )}
                    {voiceState === 'error' && (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {language === 'pt-br' ? 'Erro' : 'Error'}
                      </span>
                    )}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expanded Panel ──────────────────────────────────── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.9 }}
            transition={{ type: 'spring' as const, stiffness: 280, damping: 26 }}
            className="r48-panel fixed bottom-24 right-4 left-4 sm:left-auto sm:w-[420px] z-50"
          >
            <Card className="overflow-hidden shadow-xl border-border/60" style={{ boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15), 0 2px 12px rgba(139, 92, 246, 0.1)' }}>
              <CardContent className="p-0">
                {/* ── Panel Header ────────────────────────── */}
                <div className="r48-panel-header bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <motion.div
                      animate={voiceState === 'listening' ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center"
                    >
                      <Sparkles className="h-5 w-5 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {language === 'pt-br' ? 'Assistente de Voz' : 'Voice Assistant'}
                      </p>
                      <p className="text-[10px] text-white/70">
                        DomPlace AI
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Language Toggle */}
                    <motion.div whileTap={{ scale: 0.92 }}>
                      <button
                        onClick={toggleLanguage}
                        className="r48-lang-toggle h-7 px-2.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Globe className="h-3.5 w-3.5 text-white" />
                        <span className="text-[10px] font-bold text-white">
                          {language.toUpperCase()}
                        </span>
                      </button>
                    </motion.div>

                    {/* Settings Toggle */}
                    <motion.div whileTap={{ scale: 0.92 }}>
                      <button
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        className={`r48-settings-toggle h-7 w-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          settingsOpen ? 'bg-white/30' : 'bg-white/20 hover:bg-white/30'
                        }`}
                      >
                        <Settings className={`h-4 w-4 text-white transition-transform ${settingsOpen ? 'rotate-90' : ''}`} />
                      </button>
                    </motion.div>

                    {/* Close */}
                    <motion.div whileTap={{ scale: 0.92 }}>
                      <button
                        onClick={() => setPanelOpen(false)}
                        className="r48-close-btn h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </motion.div>
                  </div>
                </div>

                {/* ── Listening State Banner ───────────────── */}
                <AnimatePresence>
                  {voiceState === 'listening' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="r48-listening-banner px-4 py-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.15))',
                        }}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <ListeningDots />
                          <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                            {LISTENING_TEXT[language]}
                          </span>
                          <ListeningDots />
                        </div>
                        <div className="flex justify-center mt-2">
                          <WaveformVisualizer isActive={voiceState === 'listening'} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Processing Banner ─────────────────────── */}
                <AnimatePresence>
                  {voiceState === 'processing' && processingText && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
                      className="overflow-hidden"
                    >
                      <div className="r48-processing-banner px-4 py-3 bg-amber-500/5">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          >
                            <Volume2 className="h-4 w-4 text-amber-500" />
                          </motion.div>
                          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                            {processingText}...
                          </p>
                        </div>
                        <div className="flex justify-center mt-2">
                          <WaveformVisualizer isActive={voiceState === 'processing'} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Settings Panel ───────────────────────── */}
                <AnimatePresence>
                  {settingsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
                      className="overflow-hidden"
                    >
                      <div className="r48-settings-panel border-b px-4 py-3 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Sliders className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-bold">
                            {language === 'pt-br' ? 'Configurações' : 'Settings'}
                          </span>
                        </div>

                        {/* Sensitivity Slider */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {language === 'pt-br' ? 'Sensibilidade do microfone' : 'Mic sensitivity'}
                            </span>
                            <Badge variant="secondary" className="text-[9px] h-5 px-1.5">
                              {sensitivity}%
                            </Badge>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={100}
                            value={sensitivity}
                            onChange={(e) => setSensitivity(Number(e.target.value))}
                            className="r48-sensitivity-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, rgba(139, 92, 246, 0.8) ${sensitivity}%, rgba(139, 92, 246, 0.15) ${sensitivity}%)`,
                            }}
                          />
                        </div>

                        {/* Wake Word Toggle */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {language === 'pt-br' ? 'Palavra de despertar' : 'Wake word'}{' '}
                            <span className="text-violet-500 font-bold">"DomPlace"</span>
                          </span>
                          <button
                            onClick={() => setWakeWordEnabled(!wakeWordEnabled)}
                            className={`r48-wake-toggle relative h-5 w-9 rounded-full transition-colors cursor-pointer ${
                              wakeWordEnabled
                                ? 'bg-violet-500'
                                : 'bg-muted'
                            }`}
                          >
                            <motion.div
                              className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                              animate={{ left: wakeWordEnabled ? 18 : 2 }}
                              transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                            />
                          </button>
                        </div>

                        {/* Response Speed */}
                        <div>
                          <span className="text-[10px] font-medium text-muted-foreground block mb-1.5">
                            {language === 'pt-br' ? 'Velocidade de resposta' : 'Response speed'}
                          </span>
                          <div className="flex gap-1.5">
                            {(['fast', 'normal', 'slow'] as ResponseSpeed[]).map((speed) => (
                              <motion.div key={speed} whileTap={{ scale: 0.95 }}>
                                <button
                                  onClick={() => setResponseSpeed(speed)}
                                  className={`r48-speed-btn text-[10px] px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                                    responseSpeed === speed
                                      ? 'bg-violet-500 text-white'
                                      : 'bg-muted text-muted-foreground hover:bg-violet-500/10'
                                  }`}
                                >
                                  {speedLabels[language][speed]}
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Conversation History ──────────────────── */}
                <div className="r48-conversation-area px-4 py-3 max-h-[280px] overflow-y-auto space-y-3">
                  {conversations.length === 0 && !hasError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      </motion.div>
                      <p className="text-xs font-medium text-muted-foreground/60">
                        {language === 'pt-br'
                          ? 'Clique no microfone ou escolha um comando'
                          : 'Tap the mic or choose a command'}
                      </p>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {conversations.map((entry, i) => (
                      <ConversationBubble
                        key={entry.id}
                        entry={entry}
                        index={i}
                        lang={language}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Error Card */}
                  <AnimatePresence>
                    {hasError && (
                      <ErrorCard lang={language} onRetry={handleRetry} />
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Quick Commands ───────────────────────── */}
                <div className="r48-quick-commands border-t px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {language === 'pt-br' ? 'Comandos rápidos' : 'Quick commands'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_COMMANDS.map((cmd, i) => {
                      const Icon = QUICK_COMMAND_ICONS[i]
                      return (
                        <motion.div
                          key={cmd.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring' as const, stiffness: 400, damping: 22, delay: i * 0.05 }}
                          whileTap={{ scale: 0.93 }}
                        >
                          <button
                            onClick={() => simulateCommand(cmd.text)}
                            disabled={voiceState !== 'idle'}
                            className={`r48-quick-cmd flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                              voiceState !== 'idle'
                                ? 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                                : 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/30'
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            {cmd.text}
                          </button>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* ── Bottom Mic Bar ────────────────────────── */}
                <div className="r48-bottom-bar border-t px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          voiceState === 'idle'
                            ? 'bg-muted-foreground/40'
                            : voiceState === 'listening'
                            ? 'bg-violet-500 animate-pulse'
                            : voiceState === 'processing'
                            ? 'bg-amber-500 animate-pulse'
                            : voiceState === 'responding'
                            ? 'bg-emerald-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {language === 'pt-br'
                          ? `Sensibilidade: ${sensitivity}%`
                          : `Sensitivity: ${sensitivity}%`}
                      </span>
                    </div>

                    <motion.div whileTap={{ scale: 0.9 }}>
                      <button
                        onClick={handleMicClick}
                        disabled={voiceState === 'processing'}
                        className={`r48-mic-btn h-10 w-10 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed ${
                          voiceState === 'listening'
                            ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                            : voiceState === 'error'
                            ? 'bg-gradient-to-br from-red-500 to-orange-500'
                            : 'bg-muted hover:bg-violet-500/20'
                        }`}
                        style={{
                          boxShadow: voiceState === 'listening'
                            ? '0 0 16px rgba(139, 92, 246, 0.4)'
                            : 'none',
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {voiceState === 'listening' ? (
                            <motion.div
                              key="mic-active"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
                            >
                              <Mic className="h-5 w-5 text-white" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="mic-inactive"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
                            >
                              <MicOff className="h-5 w-5 text-muted-foreground" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </motion.div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        {language === 'pt-br' ? 'Histórico' : 'History'}:
                      </span>
                      <Badge variant="secondary" className="text-[9px] h-5 px-1.5">
                        {conversations.length}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
