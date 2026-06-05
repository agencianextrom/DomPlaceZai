'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  Share2,
  X,
  Flame,
  Sparkles,
  Tag,
  Rocket,
  Wine,
  Star,
  Gift,
  UserPlus,
  UserCheck,
  Eye,
} from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'

// ── Types ────────────────────────────────────────────────────────────────────

type EventType = 'promo' | 'workshop' | 'launch' | 'tasting' | 'special'

interface Attendee {
  id: string
  name: string
  avatar: string
}

interface StoreEvent {
  id: string
  title: string
  store: string
  storeLogo: string
  date: string
  time: string
  endTime: string
  eventType: EventType
  description: string
  location: string
  attendees: Attendee[]
  maxAttendees: number
}

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS_LONG = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const EVENT_TYPE_CONFIG: Record<EventType, {
  label: string
  color: string
  bg: string
  icon: React.ReactNode
  dotColor: string
  gradient: string
}> = {
  promo: {
    label: 'Promoção',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    icon: <Tag className="h-3 w-3" />,
    dotColor: '#3b82f6',
    gradient: 'from-blue-500 to-blue-600',
  },
  workshop: {
    label: 'Workshop',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/40',
    icon: <Sparkles className="h-3 w-3" />,
    dotColor: '#22c55e',
    gradient: 'from-green-500 to-emerald-600',
  },
  launch: {
    label: 'Lançamento',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    icon: <Rocket className="h-3 w-3" />,
    dotColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
  },
  tasting: {
    label: 'Degustação',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    icon: <Wine className="h-3 w-3" />,
    dotColor: '#a855f7',
    gradient: 'from-purple-500 to-violet-600',
  },
  special: {
    label: 'Evento Especial',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    icon: <Gift className="h-3 w-3" />,
    dotColor: '#f43f5e',
    gradient: 'from-rose-500 to-pink-600',
  },
}

// ── Mock Data ────────────────────────────────────────────────────────────────

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

function makeAttendees(count: number): Attendee[] {
  const names = [
    'Ana Silva', 'Carlos Souza', 'Maria Oliveira', 'João Santos',
    'Fernanda Lima', 'Rafael Costa', 'Julia Pereira', 'Pedro Almeida',
    'Camila Rodrigues', 'Lucas Martins', 'Bianca Ferreira', 'Diego Nunes',
  ]
  const colors = [
    '#10b981', '#f59e0b', '#3b82f6', '#a855f7', '#f43f5e',
    '#14b8a6', '#84cc16', '#ec4899', '#06b6d4', '#8b5cf6',
    '#ef4444', '#22d3ee',
  ]
  return Array.from({ length: count }, (_, i) => ({
    id: `att-${i}-${Date.now()}`,
    name: names[i % names.length],
    avatar: colors[i % colors.length],
  }))
}

const STORE_LOGOS: Record<string, string> = {
  'Mercadinho do Zé': '🛒',
  'Padaria Sabor': '🥖',
  'Açaí da Boa': '🍇',
  'Farmácia Vida': '💊',
  'Pet Shop Amigo': '🐾',
  'EletroDom': '🔌',
  'Moda Bela': '👗',
  'Quitanda da Dona': '🌽',
  'Café Artesanal': '☕',
  'Doce Encanto': '🍰',
  'Cervejaria Pará': '🍺',
  'Jardim Urbano': '🌿',
}

const mockEvents: StoreEvent[] = [
  {
    id: 'ev-1', title: 'Semana de Descontos — Produtos de Limpeza',
    store: 'Mercadinho do Zé', storeLogo: STORE_LOGOS['Mercadinho do Zé'],
    date: d(Math.max(1, now.getDate() - 2)), time: '08:00', endTime: '18:00',
    eventType: 'promo',
    description: 'Desconto de até 30% em toda a linha de produtos de limpeza. Venha aproveitar ofertas exclusivas em detergentes, sabão em pó e desinfetantes.',
    location: 'Rua das Flores, 123 - Centro', attendees: makeAttendees(18), maxAttendees: 50,
  },
  {
    id: 'ev-2', title: 'Workshop de Confeitaria Artesanal',
    store: 'Doce Encanto', storeLogo: STORE_LOGOS['Doce Encanto'],
    date: d(Math.min(28, now.getDate() + 1)), time: '14:00', endTime: '17:00',
    eventType: 'workshop',
    description: 'Aprenda a fazer bolos decorados e doces finos com a confeiteira Maria. Todos os materiais incluídos. Vagas limitadas!',
    location: 'Av. Brasil, 456 - Loja 12', attendees: makeAttendees(24), maxAttendees: 30,
  },
  {
    id: 'ev-3', title: 'Lançamento do Bolo de Cenoura Especial',
    store: 'Padaria Sabor', storeLogo: STORE_LOGOS['Padaria Sabor'],
    date: d(Math.min(28, now.getDate() + 3)), time: '10:00', endTime: '14:00',
    eventType: 'launch',
    description: 'Novo bolo artesanal de cenoura com cobertura de chocolate belga. Primeiros clientes ganham café grátis!',
    location: 'Rua Principal, 789', attendees: makeAttendees(32), maxAttendees: 60,
  },
  {
    id: 'ev-4', title: 'Degustação de Cafés Especiais',
    store: 'Café Artesanal', storeLogo: STORE_LOGOS['Café Artesanal'],
    date: d(Math.min(28, now.getDate() + 2)), time: '16:00', endTime: '19:00',
    eventType: 'tasting',
    description: 'Prove blends exclusivos de cafés brasileiros. Barista premiado apresentando grãos do Cerrado e da Bahia.',
    location: 'Rua da Cultura, 321 - Sala 5', attendees: makeAttendees(15), maxAttendees: 25,
  },
  {
    id: 'ev-5', title: 'Festa de Aniversário da Loja',
    store: 'Açaí da Boa', storeLogo: STORE_LOGOS['Açaí da Boa'],
    date: d(Math.min(28, now.getDate() + 5)), time: '11:00', endTime: '22:00',
    eventType: 'special',
    description: 'Comemoramos 5 anos com açaí à vontade, brindes, música ao vivo e sorteios. Traga a família!',
    location: 'Praça Central, S/N', attendees: makeAttendees(45), maxAttendees: 100,
  },
  {
    id: 'ev-6', title: 'Promoção de Fim de Mês — Hortifruti',
    store: 'Mercadinho do Zé', storeLogo: STORE_LOGOS['Mercadinho do Zé'],
    date: d(Math.min(28, now.getDate() + 7)), time: '06:00', endTime: '20:00',
    eventType: 'promo',
    description: 'Frutas, legumes e verduras frescos com 25% de desconto durante todo o dia. Produtos direto do produtor!',
    location: 'Rua das Flores, 123 - Centro', attendees: makeAttendees(22), maxAttendees: 80,
  },
  {
    id: 'ev-7', title: 'Lançamento da Coleção Primavera',
    store: 'Moda Bela', storeLogo: STORE_LOGOS['Moda Bela'],
    date: d(Math.min(28, now.getDate() + 10), 1), time: '10:00', endTime: '20:00',
    eventType: 'launch',
    description: 'Nova coleção de roupas femininas com tecidos leves. Desconto de 20% nos primeiros 3 dias de lançamento.',
    location: 'Shopping Central, Loja 34', attendees: makeAttendees(38), maxAttendees: 70,
  },
  {
    id: 'ev-8', title: 'Workshop de Plantio Urbano',
    store: 'Jardim Urbano', storeLogo: STORE_LOGOS['Jardim Urbano'],
    date: d(Math.min(28, now.getDate() + 4), 1), time: '09:00', endTime: '12:00',
    eventType: 'workshop',
    description: 'Aprenda a criar seu jardim em espaços pequenos. Mudas e vasos inclusos no valor da inscrição.',
    location: 'Rua Verde, 567 - Ao lado do Parque', attendees: makeAttendees(12), maxAttendees: 20,
  },
  {
    id: 'ev-9', title: 'Degustação de Cervejas Artesanais',
    store: 'Cervejaria Pará', storeLogo: STORE_LOGOS['Cervejaria Pará'],
    date: d(Math.min(28, now.getDate() + 8), 1), time: '18:00', endTime: '23:00',
    eventType: 'tasting',
    description: '12 rótulos artesanais para provar. Harmonização com petiscos regionais. Somente para maiores de 18 anos.',
    location: 'Ladeira da Cerveja, 89', attendees: makeAttendees(28), maxAttendees: 40,
  },
  {
    id: 'ev-10', title: 'Noite de Desconto EletroDom',
    store: 'EletroDom', storeLogo: STORE_LOGOS['EletroDom'],
    date: d(Math.min(28, now.getDate() + 12), 1), time: '19:00', endTime: '23:00',
    eventType: 'promo',
    description: 'Até 40% de desconto em eletrônicos. Promoção válida apenas no período noturno. Parcele em até 12x!',
    location: 'Av. Tecnologia, 1500', attendees: makeAttendees(35), maxAttendees: 90,
  },
  {
    id: 'ev-11', title: 'Evento Especial — Dia do Cliente',
    store: 'Farmácia Vida', storeLogo: STORE_LOGOS['Farmácia Vida'],
    date: d(Math.min(28, now.getDate() + 15), 1), time: '08:00', endTime: '18:00',
    eventType: 'special',
    description: 'Aferição de pressão grátis, orientação nutricional e sorteio de cestas de vitaminas. Evento aberto ao público.',
    location: 'Rua da Saúde, 222 - Centro', attendees: makeAttendees(20), maxAttendees: 60,
  },
  {
    id: 'ev-12', title: 'Workshop de Petiscos para Churrasco',
    store: 'Quitanda da Dona', storeLogo: STORE_LOGOS['Quitanda da Dona'],
    date: d(Math.min(28, now.getDate() + 18), 1), time: '15:00', endTime: '18:00',
    eventType: 'workshop',
    description: 'Aprenda a preparar pães de alho, queijo coalho e linguiça artesanal. Degustação ao final da aula.',
    location: 'Feira Livre, Barraca 7', attendees: makeAttendees(16), maxAttendees: 25,
  },
  {
    id: 'ev-13', title: 'Lançamento — Açaí Premium com Toppings',
    store: 'Açaí da Boa', storeLogo: STORE_LOGOS['Açaí da Boa'],
    date: d(Math.min(28, now.getDate() + 20), 1), time: '13:00', endTime: '21:00',
    eventType: 'launch',
    description: 'Novo cardápio de açaí com 15 opções de toppings exclusivos. Promoção de lançamento: segundo açaí pela metade do preço.',
    location: 'Praça Central, S/N', attendees: makeAttendees(41), maxAttendees: 80,
  },
  {
    id: 'ev-14', title: 'Degustação de Bolos e Tortas',
    store: 'Doce Encanto', storeLogo: STORE_LOGOS['Doce Encanto'],
    date: d(Math.min(28, now.getDate() + 22), 1), time: '15:00', endTime: '19:00',
    eventType: 'tasting',
    description: 'Amostras de 8 sabores de bolos e tortas. Encomende com desconto no dia do evento.',
    location: 'Av. Brasil, 456 - Loja 12', attendees: makeAttendees(19), maxAttendees: 35,
  },
  {
    id: 'ev-15', title: 'Festival de Verão — Descontos em Roupas',
    store: 'Moda Bela', storeLogo: STORE_LOGOS['Moda Bela'],
    date: d(Math.min(28, now.getDate() + 25), 1), time: '09:00', endTime: '21:00',
    eventType: 'special',
    description: 'Festival com descontos de até 50% em toda a loja. DJ convidado, bebidas e photobooth grátis.',
    location: 'Shopping Central, Loja 34', attendees: makeAttendees(55), maxAttendees: 120,
  },
]

// ── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.2 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

const pulseDot = {
  animate: {
    scale: [1, 1.4, 1],
    opacity: [0.8, 0.4, 0.8],
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const },
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

function loadRSVPs(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem('r38-event-rsvps')
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function saveRSVPs(rsvps: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('r38-event-rsvps', JSON.stringify(Array.from(rsvps)))
  } catch {
    // ignore write errors
  }
}

function getCountdown(dateStr: string): { days: number; label: string } {
  const target = parseDate(dateStr)
  const nowMs = Date.now()
  const diff = Math.max(0, Math.ceil((target.getTime() - nowMs) / (1000 * 60 * 60 * 24)))
  return { days: diff, label: diff === 0 ? 'Hoje' : `Em ${diff}d` }
}

// ── Confetti Micro-Burst ─────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#a855f7', '#14b8a6']

interface ConfettiParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  opacity: number
}

function ConfettiMicroBurst({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([])

  useEffect(() => {
    if (!active) return
    const created = performance.now()
    const initial = Array.from({ length: 20 }, (_, i) => ({
      id: i, x: 0, y: 0,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 6 - 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 3 + Math.random() * 5,
      rotation: Math.random() * 360,
      opacity: 1,
    }))

    let raf: number
    function tick(now: number) {
      const progress = Math.min((now - created) / 800, 1)
      setParticles(prev => {
        if (prev.length === 0) return initial
        if (progress >= 1) return []
        return prev.map(p => ({
          ...p,
          x: p.x + p.vx * 0.96,
          y: p.y + p.vy + 0.15,
          vy: p.vy + 0.15,
          rotation: p.rotation + 8,
          opacity: Math.max(0, 1 - progress),
        }))
      })
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  if (particles.length === 0) return null
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  )
}

// ── Sub-Components ──────────────────────────────────────────────────────────

function EventTypeBadge({ type }: { type: EventType }) {
  const config = EVENT_TYPE_CONFIG[type]
  return (
    <span className={`r38-event-type-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.color} ${config.bg}`}>
      {config.icon}
      {config.label}
    </span>
  )
}

function AttendeeStack({ attendees, maxVisible = 5 }: { attendees: Attendee[]; maxVisible?: number }) {
  const visible = attendees.slice(0, maxVisible)
  const overflow = attendees.length - maxVisible

  return (
    <div className="flex items-center r38-event-attendee-stack">
      {visible.map((att, i) => (
        <motion.div
          key={att.id}
          className="relative -ml-2 first:ml-0"
          style={{ zIndex: visible.length - i }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 25, delay: i * 0.04 }}
        >
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-card"
            style={{
              background: `linear-gradient(135deg, ${att.avatar}, ${att.avatar}dd)`,
              boxShadow: `0 0 0 2px ${att.avatar}40`,
            }}
            title={att.name}
          >
            {att.name.charAt(0)}
          </div>
        </motion.div>
      ))}
      {overflow > 0 && (
        <motion.div
          className="-ml-2 h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold bg-muted text-muted-foreground border-2 border-card"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 25, delay: maxVisible * 0.04 }}
        >
          +{overflow}
        </motion.div>
      )}
    </div>
  )
}

function ParticiparButton({ eventId, attendeeCount, maxAttendees }: {
  eventId: string
  attendeeCount: number
  maxAttendees: number
}) {
  const [isParticipating, setIsParticipating] = useState(() => loadRSVPs().has(eventId))
  const [showConfetti, setShowConfetti] = useState(false)
  const [rsvpCount, setRSVPCount] = useState(attendeeCount)

  const handleToggle = useCallback(() => {
    const next = !isParticipating
    const rsvps = loadRSVPs()
    if (next) {
      rsvps.add(eventId)
      setRSVPCount(prev => prev + 1)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 900)
    } else {
      rsvps.delete(eventId)
      setRSVPCount(prev => Math.max(0, prev - 1))
    }
    saveRSVPs(rsvps)
    setIsParticipating(next)
  }, [isParticipating, eventId])

  const isFull = rsvpCount >= maxAttendees

  return (
    <div className="relative inline-block">
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 22 }}
        onClick={handleToggle}
        disabled={isFull && !isParticipating}
        className={`r38-event-participar-btn relative overflow-hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
          isParticipating ? 'text-white'
            : isFull ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'text-white hover:opacity-90'
        }`}
        style={{
          background: isParticipating
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : isFull ? undefined
            : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          boxShadow: isParticipating
            ? '0 2px 12px rgba(16,185,129,0.3)'
            : '0 2px 12px rgba(59,130,246,0.3)',
        }}
      >
        {/* Shimmer sweep effect */}
        <span className="absolute inset-0 overflow-hidden pointer-events-none">
          <span
            className="absolute inset-0 r38-event-btn-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'r38-event-shimmer-sweep 2.5s ease-in-out infinite',
            }}
          />
        </span>

        <AnimatePresence mode="wait">
          {isParticipating ? (
            <motion.span
              key="joined"
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 20, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              className="relative z-10"
            >
              <UserCheck className="h-3.5 w-3.5" />
            </motion.span>
          ) : (
            <motion.span
              key="join"
              initial={{ rotate: 20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -20, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              className="relative z-10"
            >
              <UserPlus className="h-3.5 w-3.5" />
            </motion.span>
          )}
        </AnimatePresence>
        <span className="relative z-10">
          {isParticipating ? 'Participando' : isFull ? 'Lotado' : 'Participar'}
        </span>
        <span className="relative z-10 text-[10px] opacity-80">
          ({rsvpCount}/{maxAttendees})
        </span>
      </motion.button>
      {showConfetti && <ConfettiMicroBurst active={showConfetti} />}
    </div>
  )
}

// ── Event Detail Modal ──────────────────────────────────────────────────────

function EventDetailModal({ event, onClose }: { event: StoreEvent; onClose: () => void }) {
  const config = EVENT_TYPE_CONFIG[event.eventType]
  const [rsvpSet] = useState(() => loadRSVPs())
  const isParticipating = rsvpSet.has(event.id)

  const handleShare = useCallback(() => {
    const text = `${event.title} — ${event.store} em ${event.date} às ${event.time}`
    if (navigator.share) {
      navigator.share({ title: event.title, text, url: window.location.href })
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href)
    }
  }, [event])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="r38-event-modal relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
      >
        {/* Modal header gradient */}
        <div className={`bg-gradient-to-br ${config.gradient} p-5 relative`}>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }} />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative z-10">
            <EventTypeBadge type={event.eventType} />
            <motion.h3
              className="text-xl font-bold text-white mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {event.title}
            </motion.h3>
            <div className="flex items-center gap-2 mt-2 text-white/90 text-sm">
              <span>{event.storeLogo}</span>
              <span className="font-medium">{event.store}</span>
            </div>
          </div>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Date, time, location */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{parseDate(event.date).getDate()} de {MONTHS_LONG[parseDate(event.date).getMonth()]}</p>
                <p className="text-xs text-muted-foreground">{event.time} — {event.endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <p className="font-semibold">{event.location}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Sobre o evento
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
          </div>

          {/* Map placeholder */}
          <div>
            <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Localização
            </h4>
            <div className="r38-event-map-placeholder rounded-xl bg-muted/50 border border-border/50 h-40 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Mapa indisponível</p>
                <p className="text-[10px] text-muted-foreground/60">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Participantes ({event.attendees.length})
            </h4>
            <div className="space-y-2">
              {event.attendees.slice(0, 8).map(att => (
                <div key={att.id} className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: att.avatar }}
                  >
                    {att.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{att.name}</span>
                  {isParticipating && att === event.attendees[0] && (
                    <span className="ml-auto text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">Você</span>
                  )}
                </div>
              ))}
              {event.attendees.length > 8 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{event.attendees.length - 8} outros participantes
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="border-t border-border/50 p-4 flex items-center gap-3">
          <ParticiparButton eventId={event.id} attendeeCount={event.attendees.length} maxAttendees={event.maxAttendees} />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleShare}
            className="h-10 w-10 rounded-xl border border-border/50 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event, onOpen }: { event: StoreEvent; onOpen: (e: StoreEvent) => void }) {
  const config = EVENT_TYPE_CONFIG[event.eventType]
  const dateObj = parseDate(event.date)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const isPast = dateObj < todayStart

  return (
    <motion.div variants={itemVariants} layout className="relative group r38-event-card">
      <motion.div
        className="relative overflow-hidden rounded-xl border bg-card p-4 flex flex-col gap-2.5"
        style={{
          borderColor: isPast ? undefined : `${config.dotColor}30`,
          boxShadow: isPast ? undefined : `0 2px 16px ${config.dotColor}10`,
        }}
        whileHover={{ y: -3, boxShadow: isPast ? undefined : `0 8px 24px ${config.dotColor}18` }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
      >
        {/* Subtle glow */}
        {!isPast && (
          <motion.div
            className="absolute -top-6 -right-6 h-16 w-16 rounded-full blur-2xl"
            style={{ backgroundColor: config.dotColor }}
            animate={{ opacity: [0, 0.1, 0], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        )}

        {/* Top row */}
        <div className="flex items-center gap-2 flex-wrap">
          <EventTypeBadge type={event.eventType} />
          {isPast && (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              Encerrado
            </span>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground font-medium">
            {dateObj.getDate()} de {MONTHS_LONG[dateObj.getMonth()]}
          </span>
        </div>

        {/* Store */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{event.storeLogo}</span>
          <span className="text-[11px] text-muted-foreground font-medium truncate">{event.store}</span>
        </div>

        {/* Title */}
        <h3 className={`text-sm font-bold leading-tight line-clamp-2 ${isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
          {event.title}
        </h3>

        {/* Time */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{event.time} — {event.endTime}</span>
        </div>

        {/* Attendees + Participar */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <AttendeeStack attendees={event.attendees} />
          <div className="flex items-center gap-2">
            <ParticiparButton eventId={event.id} attendeeCount={event.attendees.length} maxAttendees={event.maxAttendees} />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onOpen(event)}
              className="h-8 w-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Calendar Grid ────────────────────────────────────────────────────────────

function CalendarGrid({
  currentMonth,
  currentYear,
  events,
  selectedDay,
  onMonthChange,
  onDaySelect,
}: {
  currentMonth: number
  currentYear: number
  events: StoreEvent[]
  selectedDay: number | null
  onMonthChange: (month: number, year: number) => void
  onDaySelect: (day: number) => void
}) {
  const today = new Date()
  const mobileStripRef = useRef<HTMLDivElement>(null)

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    const days: Array<{
      day: number
      isCurrentMonth: boolean
      isToday: boolean
      hasEvents: boolean
      events: StoreEvent[]
    }> = []

    // Previous month fill
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isToday: false, hasEvents: false, events: [] })
    }

    // Current month days
    for (let dd = 1; dd <= daysInMonth; dd++) {
      const dateObj = new Date(currentYear, currentMonth, dd)
      const dayEvents = events.filter(e => isSameDay(parseDate(e.date), dateObj))
      days.push({
        day: dd,
        isCurrentMonth: true,
        isToday: isSameDay(dateObj, today),
        hasEvents: dayEvents.length > 0,
        events: dayEvents,
      })
    }

    // Next month fill to complete 35 cells (7x5 grid)
    const remaining = 35 - days.length
    for (let dd = 1; dd <= remaining; dd++) {
      days.push({ day: dd, isCurrentMonth: false, isToday: false, hasEvents: false, events: [] })
    }

    return days
  }, [currentMonth, currentYear, events])

  // Auto-scroll mobile day strip to selected day or today
  useEffect(() => {
    const container = mobileStripRef.current
    if (!container) return
    const targetDay = selectedDay ?? (calendarDays.find(d => d.isToday)?.day ?? null)
    if (targetDay === null) return
    const btn = container.querySelector(`[data-day="${targetDay}"]`) as HTMLElement | null
    if (btn) {
      const scrollLeft = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [selectedDay, calendarDays])

  const handlePrev = useCallback(() => {
    const m = currentMonth === 0 ? 11 : currentMonth - 1
    const y = currentMonth === 0 ? currentYear - 1 : currentYear
    onMonthChange(m, y)
  }, [currentMonth, currentYear, onMonthChange])

  const handleNext = useCallback(() => {
    const m = currentMonth === 11 ? 0 : currentMonth + 1
    const y = currentMonth === 11 ? currentYear + 1 : currentYear
    onMonthChange(m, y)
  }, [currentMonth, currentYear, onMonthChange])

  return (
    <motion.div
      className="r38-event-calendar rounded-2xl border bg-card overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      {/* Calendar header gradient */}
      <div className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 px-4 py-3 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }} />
        <div className="flex items-center justify-between relative z-10">
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={handlePrev}
            className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors r38-event-nav-arrow"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>

          <motion.h4
            key={`${currentMonth}-${currentYear}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
            className="text-sm font-bold text-white"
          >
            {MONTHS_LONG[currentMonth]} {currentYear}
          </motion.h4>

          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={handleNext}
            className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors r38-event-nav-arrow"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Mobile day strip */}
      <div className="md:hidden px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-foreground">
            {MONTHS_LONG[currentMonth]} {currentYear}
          </span>
        </div>
        <div
          ref={mobileStripRef}
          className="flex gap-2 overflow-x-auto r62-scroll-snap hide-scrollbar pb-1"
        >
          {calendarDays.filter(d => d.isCurrentMonth).map((dayObj, idx) => (
            <motion.button
              key={idx}
              data-day={dayObj.day}
              whileTap={dayObj.hasEvents ? { scale: 0.92 } : undefined}
              onClick={() => dayObj.hasEvents && onDaySelect(dayObj.day)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] w-12 h-14 rounded-lg text-sm font-medium transition-colors shrink-0 scroll-snap-align-center ${
                dayObj.isToday
                  ? 'bg-primary text-primary-foreground'
                  : selectedDay === dayObj.day
                    ? 'bg-primary/10 text-primary ring-2 ring-primary/30'
                    : dayObj.hasEvents
                      ? 'bg-card border border-border/50 text-foreground'
                      : 'bg-muted/30 text-muted-foreground'
              }`}
            >
              <span>{dayObj.day}</span>
              {dayObj.hasEvents && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
              )}
            </motion.button>
          ))}
        </div>

        {/* Mobile selected-day event preview */}
        <AnimatePresence mode="wait">
          {selectedDay !== null && (() => {
            const dayData = calendarDays.find(d => d.isCurrentMonth && d.day === selectedDay)
            if (!dayData) return null
            return (
              <motion.div
                key={`mobile-preview-${selectedDay}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                className="overflow-hidden mt-2 space-y-2"
              >
                {dayData.events.length > 0 ? dayData.events.map(ev => {
                  const cfg = EVENT_TYPE_CONFIG[ev.eventType]
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40 border border-border/30"
                    >
                      <div className={`h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{ev.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {ev.storeLogo} {ev.store} · {ev.time}–{ev.endTime}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{ev.attendees.length}/{ev.maxAttendees}</span>
                    </div>
                  )
                }) : (
                  <p className="text-[11px] text-muted-foreground/50 italic text-center py-2">
                    Nenhum evento para este dia
                  </p>
                )}
              </motion.div>
            )
          })()}
        </AnimatePresence>
      </div>

      {/* Desktop: Weekday headers */}
      <div className="hidden md:grid md:grid-cols-7 px-3 pt-3 bg-muted/20">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-[10px] font-semibold text-muted-foreground py-1.5">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="hidden md:grid md:grid-cols-7 px-3 pb-3 gap-1">
        {calendarDays.map((dayObj, idx) => (
          <motion.button
            key={idx}
            whileHover={dayObj.isCurrentMonth ? { scale: 1.12 } : undefined}
            whileTap={dayObj.isCurrentMonth ? { scale: 0.92 } : undefined}
            onClick={() => dayObj.isCurrentMonth && dayObj.hasEvents && onDaySelect(dayObj.day)}
            className={`r38-event-day-cell relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-colors ${
              dayObj.isCurrentMonth
                ? dayObj.isToday
                  ? 'bg-primary text-primary-foreground font-bold'
                  : selectedDay === dayObj.day
                  ? 'bg-primary/15 text-primary font-bold ring-1 ring-primary/30'
                  : dayObj.hasEvents
                  ? 'text-foreground hover:bg-accent cursor-pointer'
                  : 'text-foreground/70'
                : 'text-muted-foreground/25'
            }`}
          >
            <span className="leading-none">{dayObj.day}</span>

            {/* Event dots with pulse glow */}
            {dayObj.hasEvents && dayObj.isCurrentMonth && (
              <div className="flex gap-0.5 mt-0.5">
                {dayObj.events.slice(0, 3).map((ev, evIdx) => (
                  <motion.span
                    key={ev.id}
                    className="r38-event-dot h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: EVENT_TYPE_CONFIG[ev.eventType].dotColor,
                      boxShadow: `0 0 4px ${EVENT_TYPE_CONFIG[ev.eventType].dotColor}80`,
                    }}
                    variants={pulseDot}
                    animate="animate"
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut' as const,
                      delay: evIdx * 0.35,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Empty day state hint */}
      {selectedDay === null && (
        <div className="px-4 pb-3 text-center">
          <p className="text-[11px] text-muted-foreground/50 italic r38-event-empty-hint">
            Nenhum evento
          </p>
        </div>
      )}
    </motion.div>
  )
}

// ── Upcoming Events Strip ───────────────────────────────────────────────────

function UpcomingStrip({ events, onSelect }: { events: StoreEvent[]; onSelect: (e: StoreEvent) => void }) {
  const upcoming = useMemo(() => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    return events
      .filter(e => parseDate(e.date) >= todayStart)
      .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())
      .slice(0, 5)
  }, [events])

  if (upcoming.length === 0) return null

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <Flame className="h-4 w-4 text-amber-500" />
        Próximos Eventos
      </h3>
      <div className="r38-event-strip flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1">
        {upcoming.map((event, i) => {
          const config = EVENT_TYPE_CONFIG[event.eventType]
          const dateObj = parseDate(event.date)
          const { days: diffDays, label: countdownLabel } = getCountdown(event.date)

          return (
            <motion.button
              key={event.id}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(event)}
              className="r38-event-strip-card shrink-0 w-52 rounded-xl border bg-card p-3 text-left transition-colors"
              style={{ borderColor: `${config.dotColor}30` }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, type: 'spring' as const, stiffness: 300, damping: 25 }}
            >
              <div className={`h-1 w-10 rounded-full mb-2 bg-gradient-to-r ${config.gradient}`} />
              <p className="text-[11px] font-bold leading-tight line-clamp-2">{event.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                {event.storeLogo} {event.store}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">
                  {dateObj.getDate()}/{pad(dateObj.getMonth() + 1)}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  diffDays === 0 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                  diffDays <= 3 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {countdownLabel}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Stats Section ───────────────────────────────────────────────────────────

function StatsSection({ events, rsvpSet }: { events: StoreEvent[]; rsvpSet: Set<string> }) {
  const thisMonthEvents = useMemo(() => {
    const todayStart = new Date()
    return events.filter(e => {
      const ed = parseDate(e.date)
      return ed.getMonth() === todayStart.getMonth() && ed.getFullYear() === todayStart.getFullYear()
    })
  }, [events])

  const participations = useMemo(() => events.filter(e => rsvpSet.has(e.id)).length, [events, rsvpSet])
  const workshops = useMemo(() => thisMonthEvents.filter(e => e.eventType === 'workshop').length, [thisMonthEvents])

  const stats = [
    { label: 'Eventos este mês', value: thisMonthEvents.length, icon: CalendarDays, gradient: 'from-blue-500 to-blue-600', shadowColor: 'rgba(59,130,246,0.2)' },
    { label: 'Participações', value: participations, icon: Star, gradient: 'from-emerald-500 to-teal-600', shadowColor: 'rgba(16,185,129,0.2)' },
    { label: 'Workshops', value: workshops, icon: Sparkles, gradient: 'from-amber-500 to-orange-500', shadowColor: 'rgba(245,158,11,0.2)' },
  ]

  return (
    <motion.div className="grid grid-cols-3 gap-3" variants={containerVariants} initial="hidden" animate="visible">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={itemVariants}
          className="r38-event-stat-card rounded-xl border border-border/50 bg-card p-3 text-center"
          whileHover={{ y: -2 }}
        >
          <div
            className={`h-9 w-9 mx-auto rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2`}
            style={{ boxShadow: `0 4px 12px ${stat.shadowColor}` }}
          >
            <stat.icon className="h-4 w-4 text-white" />
          </div>
          <p className="text-lg font-bold">{stat.value}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export function StoreEventCalendar() {
  const [events, setEvents] = useState<StoreEvent[]>(mockEvents)
  const [calMonth, setCalMonth] = useState(M)
  const [calYear, setCalYear] = useState(Y)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [detailEvent, setDetailEvent] = useState<StoreEvent | null>(null)
  const [rsvpSet, setRSVPSet] = useState<Set<string>>(() => loadRSVPs())

  // Attempt to fetch real events via cachedFetch, fall back to mock data
  useEffect(() => {
    let cancelled = false
    async function fetchEvents() {
      try {
        const data = await cachedFetch('/api/stores/events')
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setEvents(data)
        }
      } catch {
        // Silently fall back to mock events
      }
    }
    fetchEvents()
    return () => { cancelled = true }
  }, [])

  // Calendar month events
  const calendarEvents = useMemo(() => {
    return events.filter(e => {
      const ed = parseDate(e.date)
      return ed.getMonth() === calMonth && ed.getFullYear() === calYear
    })
  }, [calMonth, calYear, events])

  // Selected day events
  const selectedDayEvents = useMemo(() => {
    if (selectedDay === null) return []
    return calendarEvents.filter(e => parseDate(e.date).getDate() === selectedDay)
  }, [selectedDay, calendarEvents])

  // All current month upcoming events for the strip
  const monthEvents = useMemo(() => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    return events.filter(e => {
      const ed = parseDate(e.date)
      return ed.getMonth() === M && ed.getFullYear() === Y && ed >= todayStart
    })
  }, [events])

  const handleMonthChange = useCallback((m: number, y: number) => {
    setCalMonth(m)
    setCalYear(y)
    setSelectedDay(null)
  }, [])

  const handleDaySelect = useCallback((day: number) => {
    setSelectedDay(prev => prev === day ? null : day)
  }, [])

  const handleOpenDetail = useCallback((event: StoreEvent) => {
    setDetailEvent(event)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setDetailEvent(null)
  }, [])

  return (
    <section className="space-y-5" aria-label="Eventos das Lojas">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <motion.div
          className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center"
          style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CalendarDays className="h-5 w-5 text-white" />
        </motion.div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground r62-heading-gradient">Eventos das Lojas</h2>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Participe de promoções, workshops e eventos exclusivos
          </p>
        </div>
        <motion.div
          className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flame className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-bold text-primary">{events.length} eventos</span>
        </motion.div>
      </div>

      {/* Stats */}
      <StatsSection events={events} rsvpSet={rsvpSet} />

      {/* Upcoming events strip */}
      <UpcomingStrip events={monthEvents} onSelect={handleOpenDetail} />

      {/* Calendar */}
      <CalendarGrid
        currentMonth={calMonth}
        currentYear={calYear}
        events={calendarEvents}
        selectedDay={selectedDay}
        onMonthChange={handleMonthChange}
        onDaySelect={handleDaySelect}
      />

      {/* Selected day event list */}
      <AnimatePresence mode="wait">
        {selectedDay !== null && selectedDayEvents.length > 0 && (
          <motion.div
            key={`day-${selectedDay}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-bold">
                {selectedDay} de {MONTHS_LONG[calMonth]} — {selectedDayEvents.length} evento{selectedDayEvents.length > 1 ? 's' : ''}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar seleção
              </button>
            </div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {selectedDayEvents.map(event => (
                <EventCard key={event.id} event={event} onOpen={handleOpenDetail} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No events hint when selecting empty day */}
      <AnimatePresence>
        {selectedDay !== null && selectedDayEvents.length === 0 && (
          <motion.div
            key={`empty-${selectedDay}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center py-6"
          >
            <p className="text-sm text-muted-foreground/50 italic r38-event-empty-day">
              Nenhum evento para este dia
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All events for the month */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Todos os eventos — {MONTHS_LONG[calMonth]}
        </h3>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {calendarEvents.map(event => (
            <EventCard key={event.id} event={event} onOpen={handleOpenDetail} />
          ))}
        </motion.div>

        {calendarEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10"
          >
            <CalendarDays className="h-10 w-10 mx-auto mb-2 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground/50 italic">
              Nenhum evento agendado para {MONTHS_LONG[calMonth]}
            </p>
          </motion.div>
        )}
      </div>

      {/* Event detail modal */}
      <AnimatePresence>
        {detailEvent && (
          <EventDetailModal event={detailEvent} onClose={handleCloseDetail} />
        )}
      </AnimatePresence>
    </section>
  )
}
