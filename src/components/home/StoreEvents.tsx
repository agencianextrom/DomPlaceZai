'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Sparkles,
  Tag,
  Zap,
  Users,
  Bell,
  BellRing,
  Store,
  Percent,
  Rocket,
  PartyPopper,
} from 'lucide-react'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'

// ── Types ────────────────────────────────────────────────────────────────────

type EventType = 'promo' | 'launch' | 'flash' | 'community'

interface StoreEvent {
  id: string
  title: string
  store: string
  storeLogo: string
  date: string
  time: string
  discount: number | null
  eventType: EventType
  description: string
}

interface CalendarDay {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  hasEvents: boolean
  events: StoreEvent[]
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const now = new Date()
const Y = now.getFullYear()
const M = now.getMonth()

function d(day: number, monthOffset: number = 0): string {
  const m = new Date(Y, M + monthOffset, day)
  const yy = m.getFullYear()
  const mm = String(m.getMonth() + 1).padStart(2, '0')
  const dd = String(m.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

const STORE_LOGOS: Record<string, string> = {
  'Mercadinho do Zé': '🛒',
  'Padaria Sabor': '🥖',
  'Açaí da Boa': '🍇',
  'Farmácia Vida': '💊',
  'Pet Shop Amigo': '🐾',
  'Loja do Ciclista': '🚲',
  'Quitanda da Dona': '🌽',
  'Supermercado Econômico': '🏪',
  'EletroDom': '🔌',
  'Moda Bela': '👗',
}

const mockEvents: StoreEvent[] = [
  {
    id: 'se-1',
    title: 'Semana de Descontos — Produtos de Limpeza',
    store: 'Supermercado Econômico',
    storeLogo: STORE_LOGOS['Supermercado Econômico'],
    date: d(Math.max(1, now.getDate() - 2)),
    time: '08:00',
    discount: 30,
    eventType: 'promo',
    description: 'Desconto em toda a linha de produtos de limpeza. Não perca!',
  },
  {
    id: 'se-2',
    title: 'Lançamento do Bolo de Cenoura Especial',
    store: 'Padaria Sabor',
    storeLogo: STORE_LOGOS['Padaria Sabor'],
    date: d(Math.min(28, now.getDate() + 1)),
    time: '10:00',
    discount: 15,
    eventType: 'launch',
    description: 'Novo bolo artesanal de cenoura com cobertura de chocolate belga.',
  },
  {
    id: 'se-3',
    title: 'Flash Sale — Açaí 500ml por metade do preço',
    store: 'Açaí da Boa',
    storeLogo: STORE_LOGOS['Açaí da Boa'],
    date: d(Math.min(28, now.getDate() + 3)),
    time: '14:00',
    discount: 50,
    eventType: 'flash',
    description: 'Por apenas 2 horas, açaí 500ml com acompanhamentos por 50% de desconto.',
  },
  {
    id: 'se-4',
    title: 'Dia de Brindes para Crianças',
    store: 'Pet Shop Amigo',
    storeLogo: STORE_LOGOS['Pet Shop Amigo'],
    date: d(Math.min(28, now.getDate() + 5)),
    time: '09:00',
    discount: null,
    eventType: 'community',
    description: 'Brindes e amostras grátis para pets com banho e tosa agendados.',
  },
  {
    id: 'se-5',
    title: 'Queima de Estoque — Eletrônicos',
    store: 'EletroDom',
    storeLogo: STORE_LOGOS['EletroDom'],
    date: d(Math.min(28, now.getDate() + 7)),
    time: '07:00',
    discount: 40,
    eventType: 'flash',
    description: 'Últimas unidades com até 40% de desconto em eletrônicos selecionados.',
  },
  {
    id: 'se-6',
    title: 'Promoção de Fim de Mês — Hortifruti',
    store: 'Mercadinho do Zé',
    storeLogo: STORE_LOGOS['Mercadinho do Zé'],
    date: d(Math.min(28, now.getDate() + 10)),
    time: '06:00',
    discount: 25,
    eventType: 'promo',
    description: 'Frutas, legumes e verduras frescos com 25% de desconto durante todo o dia.',
  },
  {
    id: 'se-7',
    title: 'Lançamento da Coleção Primavera',
    store: 'Moda Bela',
    storeLogo: STORE_LOGOS['Moda Bela'],
    date: d(Math.min(28, now.getDate() + 12), 1),
    time: '11:00',
    discount: 20,
    eventType: 'launch',
    description: 'Nova coleção de roupas femininas com tecidos leves para o clima amazônico.',
  },
  {
    id: 'se-8',
    title: 'Feira de Produtos Orgânicos',
    store: 'Quitanda da Dona',
    storeLogo: STORE_LOGOS['Quitanda da Dona'],
    date: d(Math.min(28, now.getDate() + 15), 1),
    time: '08:00',
    discount: null,
    eventType: 'community',
    description: 'Produtores locais com feira de orgânicos, oficinas de compostagem e degustação.',
  },
  {
    id: 'se-9',
    title: 'Mega Promoção — Vitaminas e Suplementos',
    store: 'Farmácia Vida',
    storeLogo: STORE_LOGOS['Farmácia Vida'],
    date: d(Math.min(28, now.getDate() + 18), 1),
    time: '08:00',
    discount: 35,
    eventType: 'promo',
    description: 'Desconto em vitaminas, suplementos e produtos de bem-estar.',
  },
  {
    id: 'se-10',
    title: 'Inauguração da Nova Seção de Bikes',
    store: 'Loja do Ciclista',
    storeLogo: STORE_LOGOS['Loja do Ciclista'],
    date: d(Math.min(28, now.getDate() + 22), 1),
    time: '10:00',
    discount: 10,
    eventType: 'launch',
    description: 'Nova seção com bikes, acessórios e equipamentos para ciclistas de Dom Eliseu.',
  },
]

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS_LONG = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  promo: {
    label: 'Promoção',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    icon: <Tag className="h-3 w-3" />,
  },
  launch: {
    label: 'Lançamento',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    icon: <Rocket className="h-3 w-3" />,
  },
  flash: {
    label: 'Flash Sale',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    icon: <Zap className="h-3 w-3" />,
  },
  community: {
    label: 'Comunidade',
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    icon: <Users className="h-3 w-3" />,
  },
}

const FILTER_OPTIONS: Array<{ key: EventType | 'all'; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'promo', label: 'Promoções' },
  { key: 'launch', label: 'Lançamentos' },
  { key: 'flash', label: 'Flash Sale' },
  { key: 'community', label: 'Comunidade' },
]

// ── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.2 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

const pulseVariant = {
  animate: {
    scale: [1, 1.35, 1],
    opacity: [1, 0.5, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(dateStr: string): Date {
  const [y, m, day] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, day)
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getEventColorDot(type: EventType): string {
  switch (type) {
    case 'promo': return '#f59e0b'
    case 'launch': return '#10b981'
    case 'flash': return '#f43f5e'
    case 'community': return '#8b5cf6'
  }
}

function getReminderKey(eventId: string): string {
  return `r34-store-events-reminder-${eventId}`
}

// ── Countdown Hook ──────────────────────────────────────────────────────────

function useEventCountdown(targetDate: string) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false })

  useEffect(() => {
    function tick() {
      const target = parseDate(targetDate)
      const nowMs = Date.now()
      const targetMs = target.getTime()
      const diff = targetMs - nowMs

      if (diff <= 0) {
        setCountdown(prev => ({ ...prev, isPast: true }))
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown({ days, hours, minutes, seconds, isPast: false })
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return countdown
}

// ── Skeleton Loading ────────────────────────────────────────────────────────

function StoreEventsSkeleton() {
  return (
    <section className="mt-6 space-y-5">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-48 rounded-md bg-muted animate-pulse" />
          <div className="h-3 w-64 rounded-md bg-muted animate-pulse" />
        </div>
      </div>

      {/* Featured banner skeleton */}
      <div className="w-full h-40 sm:h-48 rounded-2xl bg-muted animate-pulse" />

      {/* Calendar skeleton */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 rounded-md bg-muted animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Filter pills skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-muted animate-pulse" />
        ))}
      </div>

      {/* Event cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </section>
  )
}

// ── Sub-Components ──────────────────────────────────────────────────────────

function EventTypeBadge({ type }: { type: EventType }) {
  const config = EVENT_TYPE_CONFIG[type]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.color} ${config.bg}`}>
      {config.icon}
      {config.label}
    </span>
  )
}

function DiscountBadge({ discount }: { discount: number }) {
  return (
    <motion.span
      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
      style={{ backgroundColor: 'rgba(244, 63, 94, 0.9)' }}
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Percent className="h-2.5 w-2.5" />
      {discount}% OFF
    </motion.span>
  )
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const cd = useEventCountdown(targetDate)
  if (cd.isPast) return null

  const units = [
    { value: cd.days, label: 'd' },
    { value: cd.hours, label: 'h' },
    { value: cd.minutes, label: 'm' },
    { value: cd.seconds, label: 's' },
  ]

  return (
    <div className="flex items-center gap-1">
      {units.map((u, i) => (
        <span key={u.label} className="flex items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={u.value}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.25, type: 'spring' as const, stiffness: 500, damping: 30 }}
              className="inline-flex items-center justify-center min-w-[26px] h-7 rounded-md text-white text-xs font-mono font-bold tabular-nums"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              {pad(u.value)}
            </motion.span>
          </AnimatePresence>
          <span className="text-white/50 text-[9px] font-semibold ml-0.5 mr-1">{u.label}</span>
          {i < 3 && <span className="text-white/40 font-bold text-xs mr-0.5">:</span>}
        </span>
      ))}
    </div>
  )
}

function StoreBadge({ store, logo }: { store: string; logo: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 border border-white/15">
      <span className="text-xs">{logo}</span>
      <span className="text-[10px] font-medium text-white/80 truncate max-w-[100px]">{store}</span>
    </div>
  )
}

function ReminderButton({ eventId }: { eventId: string }) {
  const [isSet, setIsSet] = useState(() => {
    try {
      return localStorage.getItem(getReminderKey(eventId)) === 'true'
    } catch { return false }
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleToggle = useCallback(() => {
    const next = !isSet
    setIsSet(next)
    try {
      if (next) {
        localStorage.setItem(getReminderKey(eventId), 'true')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 1200)
      } else {
        localStorage.removeItem(getReminderKey(eventId))
      }
    } catch { /* ignore */ }
  }, [isSet, eventId])

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleToggle}
        className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
          isSet
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-white/15 text-white/80 hover:bg-white/25'
        }`}
      >
        <AnimatePresence mode="wait">
          {isSet ? (
            <motion.span
              key="ring"
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 30, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            >
              <BellRing className="h-3.5 w-3.5" />
            </motion.span>
          ) : (
            <motion.span
              key="bell"
              initial={{ rotate: 15, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -15, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            >
              <Bell className="h-3.5 w-3.5" />
            </motion.span>
          )}
        </AnimatePresence>
        <span>{isSet ? 'Lembrete ativo' : 'Lembrar-me'}</span>
      </motion.button>
      <ConfettiBurst active={showConfetti} particleCount={30} spread={120} />
    </div>
  )
}

function FeaturedBanner({ event }: { event: StoreEvent }) {
  const config = EVENT_TYPE_CONFIG[event.eventType]

  const gradientMap: Record<EventType, string> = {
    promo: 'from-amber-500 via-orange-500 to-yellow-400',
    launch: 'from-emerald-500 via-teal-500 to-cyan-400',
    flash: 'from-rose-500 via-pink-500 to-red-400',
    community: 'from-violet-500 via-purple-500 to-fuchsia-400',
  }

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 20, delay: 0.1 }}
    >
      <div className={`relative w-full bg-gradient-to-br ${gradientMap[event.eventType]} p-5 sm:p-6`}>
        {/* Animated background overlay */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.0) 100%)',
              'linear-gradient(225deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.02) 100%)',
              'linear-gradient(45deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.15) 100%)',
              'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.0) 100%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating decorative dots */}
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={`deco-${i}`}
            className="absolute rounded-full bg-white/15"
            style={{
              width: 6 + i * 4,
              height: 6 + i * 4,
              top: `${10 + i * 14}%`,
              right: `${5 + (i % 3) * 15}%`,
            }}
            animate={{ y: [0, -12, 4, -8, 0], scale: [1, 1.15, 0.95, 1.1, 1] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10">
          {/* Badge row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <EventTypeBadge type={event.eventType} />
            {event.discount !== null && <DiscountBadge discount={event.discount} />}
            <motion.span
              className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-3 w-3" />
              Próximo Evento
            </motion.span>
          </div>

          {/* Title */}
          <motion.h3
            className="text-lg sm:text-xl md:text-2xl font-extrabold text-white leading-tight mb-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200, damping: 20 }}
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
          >
            {event.title}
          </motion.h3>

          {/* Description */}
          <p className="text-white/80 text-xs sm:text-sm mb-3 line-clamp-2">{event.description}</p>

          {/* Store + Date + Countdown row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
            <StoreBadge store={event.store} logo={event.storeLogo} />

            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>{event.time}h</span>
              <span>·</span>
              <span>
                {parseDate(event.date).getDate()} de {MONTHS_LONG[parseDate(event.date).getMonth()]}
              </span>
            </div>

            <div className="sm:ml-auto">
              <CountdownTimer targetDate={event.date} />
            </div>
          </div>

          {/* Reminder button */}
          <div className="mt-3">
            <ReminderButton eventId={event.id} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CalendarView({
  currentMonth,
  currentYear,
  events,
  onMonthChange,
}: {
  currentMonth: number
  currentYear: number
  events: StoreEvent[]
  onMonthChange: (month: number, year: number) => void
}) {
  const today = new Date()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    const days: CalendarDay[] = []

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      days.push({ day, isCurrentMonth: false, isToday: false, hasEvents: false, events: [] })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth, d)
      const dayEvents = events.filter(e => isSameDay(parseDate(e.date), dateObj))
      days.push({
        day: d,
        isCurrentMonth: true,
        isToday: isSameDay(dateObj, today),
        hasEvents: dayEvents.length > 0,
        events: dayEvents,
      })
    }

    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, isCurrentMonth: false, isToday: false, hasEvents: false, events: [] })
    }

    return days
  }, [currentMonth, currentYear, events])

  const handlePrev = useCallback(() => {
    const m = currentMonth === 0 ? 11 : currentMonth - 1
    const y = currentMonth === 0 ? currentYear - 1 : currentYear
    onMonthChange(m, y)
  }, [currentMonth, currentYear, onMonthChange])

  const handleNext = useCallback(() => {
    const m = currentMonth === 11 ? 11 : currentMonth + 1
    const y = currentMonth === 11 ? currentYear + 1 : currentYear
    onMonthChange(m, y)
  }, [currentMonth, currentYear, onMonthChange])

  return (
    <motion.div
      className="rounded-xl border bg-card shadow-sm overflow-hidden"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      {/* Calendar header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handlePrev}
          className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-lg bg-background border hover:bg-accent flex items-center justify-center transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>

        <motion.h4
          key={`${currentMonth}-${currentYear}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
          className="text-sm font-bold text-foreground"
        >
          {MONTHS_LONG[currentMonth]} {currentYear}
        </motion.h4>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleNext}
          className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-lg bg-background border hover:bg-accent flex items-center justify-center transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 px-2 pb-2 gap-0.5">
        {calendarDays.map((dayObj, idx) => (
          <motion.button
            key={idx}
            whileHover={dayObj.isCurrentMonth ? { scale: 1.12 } : undefined}
            whileTap={dayObj.isCurrentMonth ? { scale: 0.92 } : undefined}
            className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-colors ${
              dayObj.isCurrentMonth
                ? dayObj.isToday
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'text-foreground hover:bg-accent'
                : 'text-muted-foreground/30'
            } ${dayObj.hasEvents && dayObj.isCurrentMonth && !dayObj.isToday ? 'r34-calendar-dot-day' : ''}`}
          >
            <span className="leading-none">{dayObj.day}</span>

            {/* Event dots with pulse animation */}
            {dayObj.hasEvents && dayObj.isCurrentMonth && (
              <div className="flex gap-0.5 mt-0.5">
                {dayObj.events.slice(0, 3).map((ev, evIdx) => (
                  <motion.span
                    key={ev.id}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: getEventColorDot(ev.eventType) }}
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.8, 0.4, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: evIdx * 0.3,
                    }}
                  />
                ))}
                {dayObj.events.length > 3 && (
                  <span className="text-[7px] text-muted-foreground leading-none ml-0.5">
                    +{dayObj.events.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Today pulse ring */}
            {dayObj.isToday && (
              <motion.span
                className="absolute inset-0 rounded-lg border-2 border-primary/40"
                variants={pulseVariant}
                animate="animate"
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

function EventCard({ event, isUpcoming }: { event: StoreEvent; isUpcoming: boolean }) {
  const dateObj = parseDate(event.date)
  const isPast = dateObj < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  const config = EVENT_TYPE_CONFIG[event.eventType]

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="relative group"
    >
      {/* Glow border for upcoming */}
      {isUpcoming && (
        <motion.div
          className="absolute -inset-[1px] rounded-xl opacity-50 blur-[1px]"
          style={{ background: `linear-gradient(135deg, ${getEventColorDot(event.eventType)}, transparent)` }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      )}

      <motion.div
        className={`relative overflow-hidden rounded-xl border bg-card p-4 flex flex-col gap-2 ${
          isUpcoming ? 'border-primary/30' : 'border-border'
        }`}
        whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
      >
        {/* Subtle glow behind card for upcoming */}
        {isUpcoming && (
          <motion.div
            className="absolute -top-8 -right-8 h-20 w-20 rounded-full blur-2xl"
            style={{ backgroundColor: getEventColorDot(event.eventType) }}
            animate={{ opacity: [0, 0.12, 0], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        )}

        {/* Top row: type badge + discount + date */}
        <div className="flex items-center gap-2 flex-wrap">
          <EventTypeBadge type={event.eventType} />
          {event.discount !== null && <DiscountBadge discount={event.discount} />}
          {isPast && (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              Encerrado
            </span>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground font-medium">
            {dateObj.getDate()} de {MONTHS_LONG[dateObj.getMonth()]}
          </span>
        </div>

        {/* Store badge */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{event.storeLogo}</span>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Store className="h-3 w-3" />
            <span className="font-medium truncate">{event.store}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-sm font-bold leading-tight line-clamp-2 ${isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>

        {/* Bottom row: time + countdown + reminder */}
        <div className="flex items-center gap-2 flex-wrap mt-auto pt-1 border-t border-border/50">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{event.time}h</span>
          </div>

          {!isPast && (
            <div className="flex-1 flex justify-end">
              <CountdownTimer targetDate={event.date} />
            </div>
          )}

          {!isPast && (
            <ReminderButton eventId={event.id} />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export function StoreEvents() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<EventType | 'all'>('all')
  const [calMonth, setCalMonth] = useState(M)
  const [calYear, setCalYear] = useState(Y)
  const [showCount, setShowCount] = useState(6)
  const confettiShown = useRef(false)
  const [welcomeConfetti, setWelcomeConfetti] = useState(false)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      if (!confettiShown.current) {
        confettiShown.current = true
        setWelcomeConfetti(true)
        setTimeout(() => setWelcomeConfetti(false), 1500)
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Find the next upcoming event for the featured banner
  const nextEvent = useMemo(() => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const future = mockEvents
      .filter(e => {
        if (activeFilter !== 'all' && e.eventType !== activeFilter) return false
        return parseDate(e.date) >= todayStart
      })
      .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())
    return future[0] ?? null
  }, [activeFilter])

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return mockEvents
    return mockEvents.filter(e => e.eventType === activeFilter)
  }, [activeFilter])

  // Events for calendar (all months visible)
  const calendarEvents = useMemo(() => {
    return mockEvents.filter(e => {
      const ed = parseDate(e.date)
      return ed.getMonth() === calMonth && ed.getFullYear() === calYear
    })
  }, [calMonth, calYear])

  const displayedEvents = useMemo(() => filteredEvents.slice(0, showCount), [filteredEvents, showCount])
  const hasMore = showCount < filteredEvents.length

  const handleMonthChange = useCallback((m: number, y: number) => {
    setCalMonth(m)
    setCalYear(y)
  }, [])

  const handleFilterChange = useCallback((key: EventType | 'all') => {
    setActiveFilter(key)
    setShowCount(6)
  }, [])

  const handleShowMore = useCallback(() => {
    setShowCount(prev => Math.min(prev + 4, filteredEvents.length))
  }, [filteredEvents.length])

  if (isLoading) return <StoreEventsSkeleton />

  return (
    <section className="mt-6 relative r62-card-lift r92-store-event-card" aria-label="Eventos e Promoções das Lojas">
      {/* Welcome confetti */}
      <ConfettiBurst active={welcomeConfetti} particleCount={25} spread={300} duration={1500} />

      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <motion.div
          className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg"
          style={{ boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CalendarDays className="h-4.5 w-4.5 text-white" />
        </motion.div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground r62-heading-gradient">Eventos e Promoções</h2>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Acompanhe promoções, lançamentos e eventos das lojas locais
          </p>
        </div>

        {/* Event count badge */}
        <motion.div
          className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flame className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-bold text-primary">{mockEvents.length} eventos</span>
        </motion.div>
      </div>

      {/* Featured event banner */}
      {nextEvent && (
        <div className="mb-5">
          <FeaturedBanner event={nextEvent} />
        </div>
      )}

      {/* Calendar view */}
      <div className="mb-5">
        <CalendarView
          currentMonth={calMonth}
          currentYear={calYear}
          events={calendarEvents}
          onMonthChange={handleMonthChange}
        />
      </div>

      {/* Filter pills with animated indicator */}
      <div className="relative mb-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1">
          {FILTER_OPTIONS.map(opt => {
            const isActive = activeFilter === opt.key
            return (
              <motion.button
                key={opt.key}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.04 }}
                onClick={() => handleFilterChange(opt.key)}
                className={`relative shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? 'text-primary-foreground'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {/* Animated background indicator */}
                {isActive && (
                  <motion.div
                    layoutId="r34-filter-pill"
                    className="absolute inset-0 rounded-full bg-primary shadow-md"
                    style={{ boxShadow: '0 2px 12px rgba(16,185,129,0.3)' }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {opt.key !== 'all' && (
                    <span className="text-sm">{EVENT_TYPE_CONFIG[opt.key as EventType].icon}</span>
                  )}
                  {opt.label}
                  {opt.key !== 'all' && (
                    <span className="text-[10px] opacity-70">
                      ({mockEvents.filter(e => e.eventType === opt.key).length})
                    </span>
                  )}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Event cards grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {displayedEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isUpcoming={!!nextEvent && event.id === nextEvent.id}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {filteredEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <motion.span
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-4xl mb-3"
          >
            <PartyPopper className="h-10 w-10 text-muted-foreground/40" />
          </motion.span>
          <p className="text-sm font-semibold text-muted-foreground">Nenhum evento encontrado</p>
          <p className="text-xs text-muted-foreground mt-1">Tente selecionar outro filtro</p>
        </motion.div>
      )}

      {/* Show more button */}
      {hasMore && (
        <motion.div
          className="flex justify-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={handleShowMore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted/70 hover:bg-muted text-sm font-medium text-foreground transition-colors shadow-sm"
          >
            <span>Ver mais eventos</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-xs text-muted-foreground">
              ({filteredEvents.length - showCount} restantes)
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Shimmer footer text */}
      <motion.div
        className="flex justify-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.span
          className="text-[10px] text-muted-foreground font-medium"
          animate={{
            backgroundImage: [
              'linear-gradient(90deg, rgba(100,116,139,1) 0%, rgba(16,185,129,1) 50%, rgba(100,116,139,1) 100%)',
              'linear-gradient(90deg, rgba(100,116,139,1) 0%, rgba(16,185,129,1) 50%, rgba(100,116,139,1) 100%)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage: 'linear-gradient(90deg, rgba(100,116,139,1) 0%, rgba(16,185,129,1) 50%, rgba(100,116,139,1) 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'r34-shimmer 3s linear infinite',
          }}
        >
          {mockEvents.length} eventos ativos · Lojas de Dom Eliseu, PA
        </motion.span>
      </motion.div>

      {/* Inline style tag for shimmer animation */}
      <style jsx>{`
        @keyframes r34-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </section>
  )
}
