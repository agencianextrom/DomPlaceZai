'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Radio,
  Eye,
  Clock,
  Heart,
  Share2,
  Maximize2,
  ChevronRight,
  Bell,
  BellOff,
  Play,
  MessageCircle,
  Send,
  Users,
  ShoppingBag,
  Star,
  CalendarClock,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

interface ChatMessage {
  id: string
  name: string
  avatar: string
  message: string
  timestamp: string
}

interface StreamProduct {
  name: string
  price: number
  originalPrice?: number
  emoji: string
}

interface StreamData {
  id: string
  storeName: string
  storeEmoji: string
  streamerName: string
  streamerAvatar: string
  title: string
  viewers: number
  isLive: boolean
  category: string
  categoryLabel: string
  gradient: string
  products: StreamProduct[]
  startTime: number
}

interface ScheduleSlot {
  time: string
  label: string
  storeName: string
  storeEmoji: string
  title: string
  isActive: boolean
}

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════ */

const featuredStream: StreamData = {
  id: 'feat-1',
  storeName: 'Mercadinho do Zé',
  storeEmoji: '🏪',
  streamerName: 'Zé Maria',
  streamerAvatar: '👨‍🍳',
  title: 'Grandes Ofertas de Fim de Semana',
  viewers: 847,
  isLive: true,
  category: 'promo',
  categoryLabel: 'Promoção',
  gradient: 'from-red-600 via-pink-600 to-orange-500',
  products: [
    { name: 'Cesta de Frutas Premium', price: 29.90, originalPrice: 49.90, emoji: '🍎' },
    { name: 'Queijo Artesanal 500g', price: 34.90, originalPrice: 44.90, emoji: '🧀' },
    { name: 'Azeite Extra Virgem 500ml', price: 24.90, originalPrice: 39.90, emoji: '🫒' },
  ],
  startTime: Date.now() - 37 * 60 * 1000,
}

const upcomingStreams: StreamData[] = [
  {
    id: 'up-1',
    storeName: 'Padaria Pão Dourado',
    storeEmoji: '🍞',
    streamerName: 'Dona Clara',
    streamerAvatar: '👩‍🍳',
    title: 'Novos Sabores de Pão',
    viewers: 234,
    isLive: true,
    category: 'lancamento',
    categoryLabel: 'Lançamento',
    gradient: 'from-amber-500 to-yellow-600',
    products: [],
    startTime: Date.now() - 12 * 60 * 1000,
  },
  {
    id: 'up-2',
    storeName: 'Açougue Boi Bravo',
    storeEmoji: '🥩',
    streamerName: 'Seu Tomás',
    streamerAvatar: '👨',
    title: 'Carnes Selecionadas com Desconto',
    viewers: 0,
    isLive: false,
    category: 'promocao',
    categoryLabel: 'Promoção',
    gradient: 'from-red-500 to-rose-600',
    products: [],
    startTime: Date.now() + 45 * 60 * 1000,
  },
  {
    id: 'up-3',
    storeName: 'Horta Vida Verde',
    storeEmoji: '🥬',
    streamerName: 'Ana Paula',
    streamerAvatar: '👩‍🌾',
    title: 'Como Montar sua Horta',
    viewers: 0,
    isLive: false,
    category: 'tutorial',
    categoryLabel: 'Tutorial',
    gradient: 'from-emerald-500 to-green-600',
    products: [],
    startTime: Date.now() + 120 * 60 * 1000,
  },
  {
    id: 'up-4',
    storeName: 'Pet Shop Amigo Fiel',
    storeEmoji: '🐾',
    streamerName: 'Dr. Ricardo',
    streamerAvatar: '🧑‍⚕️',
    title: 'Lançamento Ração Premium',
    viewers: 0,
    isLive: false,
    category: 'lancamento',
    categoryLabel: 'Lançamento',
    gradient: 'from-blue-500 to-cyan-600',
    products: [],
    startTime: Date.now() + 210 * 60 * 1000,
  },
]

const initialChatMessages: ChatMessage[] = [
  { id: 'c1', name: 'Maria S.', avatar: '👩', message: 'Adorei a cesta de frutas! Vou comprar agora!', timestamp: '14:23' },
  { id: 'c2', name: 'João P.', avatar: '👨', message: 'Esse azeite é muito bom, recomendo!', timestamp: '14:24' },
  { id: 'c3', name: 'Ana L.', avatar: '👩‍🦰', message: 'Preço incrível para o queijo artesanal 🧀', timestamp: '14:25' },
  { id: 'c4', name: 'Carlos R.', avatar: '🧔', message: 'Tem entrega pra zona sul?', timestamp: '14:26' },
  { id: 'c5', name: 'Fernanda M.', avatar: '👩‍🦱', message: 'Esse stream tá muito bom, parabéns Zé! 🔥', timestamp: '14:27' },
]

const scheduleSlots: ScheduleSlot[] = [
  { time: 'Agora', label: '', storeName: 'Mercadinho do Zé', storeEmoji: '🏪', title: 'Grandes Ofertas de Fim de Semana', isActive: true },
  { time: '14:00', label: '', storeName: 'Padaria Pão Dourado', storeEmoji: '🍞', title: 'Novos Sabores de Pão', isActive: false },
  { time: '16:00', label: '', storeName: 'Horta Vida Verde', storeEmoji: '🥬', title: 'Como Montar sua Horta', isActive: false },
  { time: '19:00', label: '', storeName: 'Açougue Boi Bravo', storeEmoji: '🥩', title: 'Carnes Selecionadas', isActive: false },
]

const autoChatMessages = [
  { name: 'Luciana F.', avatar: '👱‍♀️', message: 'Quero dois queijos!' },
  { name: 'Pedro H.', avatar: '🧑', message: 'Vocês entregam no sábado?' },
  { name: 'Roberto S.', avatar: '👴', message: 'Que desconto bom! 👏' },
  { name: 'Camila D.', avatar: '👩‍🦳', message: 'Comprei a cesta, entrega rápida!' },
  { name: 'Thiago M.', avatar: '🧑‍🦱', message: 'Tem como parcelar?' },
  { name: 'Beatriz A.', avatar: '👧', message: 'O azeite vale muito a pena' },
  { name: 'Marcos V.', avatar: '🧔', message: 'Zé, qual o prazo de entrega?' },
  { name: 'Isabela C.', avatar: '👩‍🦲', message: 'Adoro as lives dessa loja ❤️' },
]

const categoryColorMap: Record<string, string> = {
  lancamento: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25',
  promocao: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25',
  tutorial: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25',
}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'AGORA'
  const totalMin = Math.ceil(ms / 60000)
  if (totalMin < 60) return `Em ${totalMin} min`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `Em ${h}h ${m}min`
}

/* ═══════════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════════ */

function useStreamTimer(startTime: number) {
  const [elapsed, setElapsed] = useState(() => Math.max(0, Math.floor((Date.now() - startTime) / 1000)))

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return elapsed
}

function useAutoChat(initial: ChatMessage[]) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial)
  const chatIndexRef = useRef(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const autoMsg = autoChatMessages[chatIndexRef.current % autoChatMessages.length]
      chatIndexRef.current++
      const now = new Date()
      const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      setMessages((prev) => {
        const updated = [...prev, { ...autoMsg, id: `auto-${Date.now()}`, timestamp: ts }]
        return updated.slice(-20)
      })
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return { messages, chatEndRef }
}

function useReminder(streamId: string) {
  const storageKey = `r37-reminder-${streamId}`

  const [isSet, setIsSet] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(storageKey) === 'true'
  })

  const toggle = useCallback(() => {
    setIsSet((prev) => {
      const next = !prev
      localStorage.setItem(storageKey, next ? 'true' : 'false')
      return next
    })
  }, [storageKey])

  return { isSet, toggle }
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Pulsing Red Dot ─── */
function LivePulseDot() {
  return (
    <span className="relative flex h-3 w-3 r37-live-pulse">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"
        animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
      />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
    </span>
  )
}

/* ─── LIVE Badge with glow ─── */
function LiveBadge() {
  return (
    <motion.div
      className="relative inline-flex items-center gap-1.5"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
    >
      <motion.div
        className="absolute -inset-2 rounded-lg pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <div className="w-full h-full rounded-lg bg-red-500 blur-md" />
      </motion.div>
      <div className="relative flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md r37-live-badge">
        <LivePulseDot />
        LIVE
      </div>
    </motion.div>
  )
}

/* ─── Floating Hearts Animation ─── */
function FloatingHearts({ active }: { active: boolean }) {
  const hearts = useMemo(
    () => [
      { id: 'h1', x: -8, delay: 0, emoji: '❤️' },
      { id: 'h2', x: 6, delay: 0.15, emoji: '💖' },
      { id: 'h3', x: -2, delay: 0.3, emoji: '❤️' },
    ],
    []
  )

  return (
    <AnimatePresence>
      {active && (
        <>
          {hearts.map((heart) => (
            <motion.span
              key={`${heart.id}-${Date.now()}`}
              className="absolute text-lg pointer-events-none select-none r37-float-heart"
              initial={{ opacity: 1, y: 0, x: heart.x, scale: 0.6 }}
              animate={{ opacity: [1, 1, 0], y: [0, -50, -90], scale: [0.6, 1.1, 0.6], x: heart.x + (heart.delay > 0.2 ? 5 : -5) }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, delay: heart.delay, ease: 'easeOut' as const }}
            >
              {heart.emoji}
            </motion.span>
          ))}
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── Chat Bubble ─── */
function ChatBubble({ msg, index }: { msg: ChatMessage; index: number }) {
  return (
    <motion.div
      key={msg.id}
      className="flex items-start gap-2 py-1.5 r37-chat-bubble r37-chat-enter"
      initial={{ opacity: 0, x: -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        delay: index * 0.06,
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      }}
    >
      <span className="shrink-0 text-base mt-0.5">{msg.avatar}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-semibold text-foreground truncate">{msg.name}</span>
          <span className="text-[9px] text-muted-foreground shrink-0">{msg.timestamp}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">{msg.message}</p>
      </div>
    </motion.div>
  )
}

/* ─── Animated Viewer Count ─── */
function AnimatedViewerCount({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <Eye className="h-3.5 w-3.5" />
      <AnimatedCounter value={count} duration={1800} locale className="text-xs font-semibold" />
    </div>
  )
}

/* ─── Upcoming Stream Card (extracted to call useReminder at top level) ─── */
function UpcomingStreamCard({ stream, index }: { stream: StreamData; index: number }) {
  const timeUntilStart = stream.startTime - Date.now()
  const isLive = stream.isLive
  const countdown = isLive ? 'AGORA' : formatCountdown(timeUntilStart)
  const reminder = useReminder(stream.id)
  const catKey = stream.category === 'lancamento' ? 'lancamento' : stream.category === 'tutorial' ? 'tutorial' : 'promocao'
  const colorClass = categoryColorMap[catKey] || categoryColorMap.promocao

  return (
    <motion.div
      key={stream.id}
      className="relative rounded-xl overflow-hidden border border-border/40 hover:border-primary/25 transition-all cursor-pointer group r37-stream-card r37-stream-card-hover"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { type: 'spring' as const, stiffness: 300, damping: 22 } }}
      transition={{
        delay: 0.2 + index * 0.08,
        type: 'spring' as const,
        stiffness: 260,
        damping: 22,
      }}
    >
      {/* Thumbnail */}
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${stream.gradient} flex items-center justify-center overflow-hidden`}>
        <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
          {stream.storeEmoji}
        </span>

        {/* Live / countdown badge */}
        {isLive ? (
          <motion.div
            className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <LivePulseDot />
            AGORA
          </motion.div>
        ) : (
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/50 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
            <Clock className="h-2.5 w-2.5" />
            {countdown}
          </div>
        )}

        {/* Category tag */}
        <div className="absolute top-1.5 right-1.5">
          <Badge className={`text-[8px] px-1.5 py-0 font-bold leading-tight border-0 rounded-md ${colorClass}`}>
            {stream.categoryLabel}
          </Badge>
        </div>

        {/* Viewer count for live streams */}
        {isLive && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/50 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
            <Eye className="h-2.5 w-2.5" />
            {stream.viewers}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 bg-card">
        <div className="flex items-center gap-1">
          <span className="text-sm">{stream.streamerAvatar}</span>
          <p className="text-[10px] text-muted-foreground font-medium truncate">{stream.storeName}</p>
        </div>
        <p className="text-xs font-semibold line-clamp-2 leading-tight mt-1">{stream.title}</p>

        {/* Reminder toggle */}
        <motion.div whileTap={{ scale: 0.95 }} className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              reminder.toggle()
            }}
            className={`w-full h-7 min-h-[44px] text-[10px] gap-1 ${reminder.isSet ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {reminder.isSet ? <BellOff className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
            {reminder.isSet ? 'Lembrete definido' : 'Lembrete'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ─── Floating Product Card ─── */
function FloatingProductCard({ product, index }: { product: StreamProduct; index: number }) {
  return (
    <motion.div
      className="absolute bottom-4 right-4 z-20 bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-xl p-2.5 border border-border/50 max-w-[160px] hidden sm:block"
      style={{ bottom: index === 0 ? 16 : index === 1 ? 76 : undefined }}
      initial={{ opacity: 0, x: 30, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        delay: 0.5 + index * 0.2,
        type: 'spring' as const,
        stiffness: 260,
        damping: 22,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{product.emoji}</span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold leading-tight line-clamp-1">{product.name}</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-bold text-red-600 dark:text-red-400">{formatBRL(product.price)}</span>
            {product.originalPrice && (
              <span className="text-[9px] text-muted-foreground line-through">{formatBRL(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Schedule Slot ─── */
function ScheduleSlotCard({ slot, onReminder, isSet }: { slot: ScheduleSlot; onReminder: () => void; isSet: boolean }) {
  return (
    <motion.div
      className="relative flex items-start gap-3 pb-4 r37-schedule-slot"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 24 }}
    >
      {/* Timeline dot */}
      <div className="relative flex flex-col items-center shrink-0">
        <motion.div
          className={`w-3 h-3 rounded-full mt-1 ${slot.isActive ? 'bg-red-500' : 'bg-muted-foreground/30'}`}
          animate={slot.isActive ? { scale: [1, 1.2, 1], boxShadow: '0 0 8px rgba(239,68,68,0.5)' } : {}}
          transition={slot.isActive ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const } : {}}
        />
        {/* Timeline line */}
        <div className="w-px flex-1 bg-border/50 mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className={`text-[11px] font-bold ${slot.isActive ? 'text-red-500' : 'text-muted-foreground'}`}>
          {slot.time}
        </span>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="text-sm">{slot.storeEmoji}</span>
          <p className="text-xs font-semibold line-clamp-1">{slot.title}</p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{slot.storeName}</p>
        <motion.div whileTap={{ scale: 0.95 }} className="mt-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReminder}
            className={`h-7 min-h-[44px] px-2.5 text-[10px] gap-1 ${isSet ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {isSet ? <BellOff className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
            {isSet ? 'Lembrete definido' : 'Lembrete'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export function LiveStreamingWidget() {
  /* ── State ── */
  const [currentViewers, setCurrentViewers] = useState(featuredStream.viewers)
  const [heartsActive, setHeartsActive] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const { messages, chatEndRef } = useAutoChat(initialChatMessages)

  /* ── Featured stream timer ── */
  const elapsed = useStreamTimer(featuredStream.startTime)

  /* ── Reminders for schedule slots ── */
  const slotReminders = useMemo(() => {
    return scheduleSlots.map((slot) => ({
      key: `schedule-${slot.time}`,
      useReminder: useReminder,
    }))
  }, [])

  // Individual reminders
  const reminder0 = useReminder(`schedule-${scheduleSlots[0].time}`)
  const reminder1 = useReminder(`schedule-${scheduleSlots[1].time}`)
  const reminder2 = useReminder(`schedule-${scheduleSlots[2].time}`)
  const reminder3 = useReminder(`schedule-${scheduleSlots[3].time}`)
  const slotReminderStates = [reminder0, reminder1, reminder2, reminder3]

  /* ── Simulate viewer count fluctuation ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentViewers((prev) => {
        const delta = Math.floor(Math.random() * 11) - 4
        return Math.max(500, prev + delta)
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  /* ── Heart button handler ── */
  const handleHeart = useCallback(() => {
    setHeartsActive(true)
    setTimeout(() => setHeartsActive(false), 1500)
  }, [])

  /* ── Share handler ── */
  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: featuredStream.title,
          text: `Assista agora: ${featuredStream.title} — ${featuredStream.storeName}`,
          url: window.location.href,
        })
      } catch {
        // User cancelled or not supported
      }
    }
  }, [])

  /* ── Fullscreen toggle ── */
  const handleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  /* ── Stats data ── */
  const stats = useMemo(
    () => [
      { label: 'Streams Hoje', value: 8, suffix: '', icon: Radio },
      { label: 'Total Viewers', value: 2.4, suffix: 'k', icon: Users, decimals: 1 },
      { label: 'Produtos Vendidos', value: 156, suffix: '', icon: ShoppingBag },
      { label: 'Avaliações', value: 4.8, suffix: '★', icon: Star, decimals: 1 },
    ],
    []
  )

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden"
    >
      <div className="relative rounded-2xl border border-red-200/40 dark:border-red-800/30 overflow-hidden glassmorphism-strong r62-card-lift">
        {/* ───────────────────────────────────────────────────────────
            1. HEADER
            ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center"
            >
              <Radio className="h-5 w-5 text-white" />
            </motion.div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg r62-heading-gradient">Ao Vivo</h2>
                <LiveBadge />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Compre junto com suas lojas favoritas em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Viewer count */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-red-200/40 dark:border-red-800/25">
              <AnimatedViewerCount count={currentViewers} />
            </div>

            {/* Ver Todos */}
            <Button variant="ghost" size="sm" className="text-xs font-semibold gap-1 text-red-500 hover:text-red-600">
              Ver Todos
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────
            2. FEATURED STREAM HERO
            ─────────────────────────────────────────────────────────── */}
        <div className="px-4 pb-4">
          <motion.div
            className="relative rounded-xl overflow-hidden r37-stream-hero"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 20, delay: 0.15 }}
          >
            {/* Thumbnail gradient placeholder */}
            <div className={`relative aspect-video bg-gradient-to-br ${featuredStream.gradient} flex items-center justify-center`}>
              <motion.span
                className="text-6xl sm:text-7xl"
                animate={{ scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
              >
                {featuredStream.storeEmoji}
              </motion.span>

              {/* Overlay gradient at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/20 to-transparent r37-stream-hero-overlay" />

              {/* AO VIVO badge top-left */}
              <div className="absolute top-3 left-3 z-20">
                <motion.div
                  className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                  <LivePulseDot />
                  AO VIVO
                </motion.div>
              </div>

              {/* Store name + streamer — bottom left */}
              <div className="absolute bottom-3 left-3 z-20 max-w-[60%]">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{featuredStream.streamerAvatar}</span>
                  <div>
                    <p className="text-[10px] text-white/70 font-medium">{featuredStream.storeName}</p>
                    <p className="text-xs font-bold text-white leading-tight">{featuredStream.streamerName}</p>
                  </div>
                </div>
              </div>

              {/* Viewer count + duration — bottom left below streamer */}
              <div className="absolute bottom-3 left-3 z-20 mt-10 flex items-center gap-3">
                <div className="flex items-center gap-1 text-white/90">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold">{currentViewers}</span>
                </div>
                <div className="flex items-center gap-1 text-white/90">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-mono font-semibold">{formatDuration(elapsed)}</span>
                </div>
              </div>

              {/* Product being showcased overlay */}
              {featuredStream.products.length > 0 && (
                <motion.div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white/95 dark:bg-card/95 backdrop-blur-sm rounded-xl px-3 py-2 border border-border/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: 'spring' as const, stiffness: 300, damping: 24 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{featuredStream.products[0].emoji}</span>
                    <div>
                      <p className="text-[10px] font-semibold leading-tight max-w-[140px] line-clamp-1">
                        {featuredStream.products[0].name}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">
                          {formatBRL(featuredStream.products[0].price)}
                        </span>
                        {featuredStream.products[0].originalPrice && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            {formatBRL(featuredStream.products[0].originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Assistir CTA button */}
              <motion.div
                className="absolute top-3 right-3 z-20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="min-h-[44px] px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white gap-1.5 rounded-lg relative overflow-hidden">
                  <Play className="h-3.5 w-3.5 fill-white" />
                  Assistir
                  {/* Shimmer sweep */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1 }}
                  >
                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  </motion.div>
                </Button>
              </motion.div>

              {/* Floating product cards (2-3) pinned to stream */}
              {featuredStream.products.slice(0, 2).map((product, i) => (
                <FloatingProductCard key={`fp-${i}`} product={product} index={i} />
              ))}

              {/* Interaction buttons — top right below CTA */}
              <div className="absolute top-14 right-3 z-20 flex flex-col gap-2">
                {/* Heart button */}
                <motion.div className="relative" whileTap={{ scale: 0.85 }}>
                  <button
                    onClick={handleHeart}
                    className="h-9 w-9 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm flex items-center justify-center border border-border/40 hover:border-red-300/50 transition-colors"
                    aria-label="Curtir"
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  </button>
                  <FloatingHearts active={heartsActive} />
                </motion.div>

                {/* Share button */}
                <motion.div whileTap={{ scale: 0.85 }}>
                  <button
                    onClick={handleShare}
                    className="h-9 w-9 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm flex items-center justify-center border border-border/40 hover:border-primary/30 transition-colors"
                    aria-label="Compartilhar"
                  >
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </motion.div>

                {/* Fullscreen toggle */}
                <motion.div whileTap={{ scale: 0.85 }}>
                  <button
                    onClick={handleFullscreen}
                    className="h-9 w-9 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm flex items-center justify-center border border-border/40 hover:border-primary/30 transition-colors"
                    aria-label="Tela cheia"
                  >
                    <Maximize2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ───────────────────────────────────────────────────────────
            3. STREAM STATS ROW
            ─────────────────────────────────────────────────────────── */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  className="flex items-center gap-2.5 bg-muted/40 dark:bg-muted/20 rounded-xl px-3 py-2.5 border border-border/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.08, type: 'spring' as const, stiffness: 280, damping: 24 }}
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      decimals={stat.decimals ?? 0}
                      duration={1600}
                      delay={400 + idx * 100}
                      className="text-sm font-bold block"
                    />
                    <p className="text-[10px] text-muted-foreground leading-tight truncate">{stat.label}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────
            4. STREAM GRID (4 cards)
            ─────────────────────────────────────────────────────────── */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold">Próximas Transmissões</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">4 streams hoje</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {upcomingStreams.map((stream, index) => (
              <UpcomingStreamCard key={stream.id} stream={stream} index={index} />
            ))}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────
            5. LIVE CHAT PREVIEW + SCHEDULE (side by side on desktop)
            ─────────────────────────────────────────────────────────── */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ── Chat Preview ── */}
            <motion.div
              className="relative rounded-xl border border-border/40 overflow-hidden bg-card"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, type: 'spring' as const, stiffness: 260, damping: 24 }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold">Chat ao Vivo</span>
                </div>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-semibold">
                  {messages.length} mensagens
                </Badge>
              </div>

              {/* Chat messages */}
              <div className="h-[180px] overflow-y-auto custom-scrollbar px-3 py-1.5">
                <AnimatePresence mode="popLayout">
                  {messages.slice(-8).map((msg, i) => (
                    <ChatBubble key={msg.id} msg={msg} index={i} />
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>

              {/* Chat input (display only) */}
              <div className="px-3 py-2 border-t border-border/30">
                <div className="flex items-center gap-2 bg-muted/50 dark:bg-muted/30 rounded-lg px-2.5 py-1.5 border border-border/30">
                  <input
                    type="text"
                    placeholder="Enviar mensagem..."
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/50"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    readOnly
                  />
                  <button className="text-muted-foreground/40 hover:text-primary transition-colors" aria-label="Enviar">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ── Stream Schedule ── */}
            <motion.div
              className="relative rounded-xl border border-border/40 overflow-hidden bg-card"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, type: 'spring' as const, stiffness: 260, damping: 24 }}
            >
              {/* Schedule Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
                <div className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold">Agenda de Hoje</span>
                </div>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-semibold">
                  {scheduleSlots.length} streams
                </Badge>
              </div>

              {/* Timeline */}
              <div className="px-3 pt-3 pb-2">
                <AnimatePresence>
                  {scheduleSlots.map((slot, idx) => (
                    <ScheduleSlotCard
                      key={slot.time}
                      slot={slot}
                      onReminder={slotReminderStates[idx].toggle}
                      isSet={slotReminderStates[idx].isSet}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────
            6. ANIMATED PROGRESS BAR (stream activity indicator)
            ─────────────────────────────────────────────────────────── */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 relative overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1 }}
          >
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
