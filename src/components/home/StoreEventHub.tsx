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
  Search,
  LayoutGrid,
  LayoutList,
  TrendingUp,
  Share2,
  X,
  MapPin,
  Eye,
  CalendarCheck,
  Heart,
  Check,
  Radio,
  Wine,
  Wrench,
  PartyPopper,
  GraduationCap,
  TreePine,
  Calendar,
} from 'lucide-react'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'

// ── Types ────────────────────────────────────────────────────────────────────

type EventCategory =
  | 'flash-sale'
  | 'live-stream'
  | 'tasting'
  | 'workshop'
  | 'grand-opening'
  | 'seasonal'

type ViewMode = 'grid' | 'list'

interface StoreEventHubEvent {
  id: string
  title: string
  store: string
  storeLogo: string
  date: string
  time: string
  endTime: string
  location: string
  category: EventCategory
  description: string
  fullDescription: string
  attendees: number
  maxAttendees: number | null
  isLive: boolean
  isTrending: boolean
  discount: number | null
  gradient: string
  attendeeAvatars: string[]
}

interface CalendarDayData {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  hasEvents: boolean
  events: StoreEventHubEvent[]
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
  'Vinho & Cia': '🍷',
  'Casa & Decor': '🏡',
}

const AVATAR_COLORS = [
  '#10b981', '#f59e0b', '#f43f5e', '#14b8a6', '#84cc16',
  '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1', '#d946ef',
]

const mockEvents: StoreEventHubEvent[] = [
  {
    id: 'eh-1',
    title: 'Flash Sale — Produtos de Limpeza 50% OFF',
    store: 'Supermercado Econômico',
    storeLogo: STORE_LOGOS['Supermercado Econômico'],
    date: d(Math.max(1, now.getDate())),
    time: '08:00',
    endTime: '10:00',
    location: 'Av. Dom Eliseu, 123',
    category: 'flash-sale',
    description: 'Desconto de 50% em toda a linha de produtos de limpeza. Apenas 2 horas!',
    fullDescription: 'Aproveite descontos imperdíveis em produtos de limpeza das melhores marcas. Detergentes, sabão em pó, desinfetantes e muito mais com até 50% de desconto. A promoção dura apenas 2 horas, garanta os seus produtos! Aceitamos PIX e cartão.',
    attendees: 87,
    maxAttendees: null,
    isLive: true,
    isTrending: true,
    discount: 50,
    gradient: 'from-rose-500 via-pink-500 to-red-400',
    attendeeAvatars: AVATAR_COLORS.slice(0, 5),
  },
  {
    id: 'eh-2',
    title: 'Live: Degustação de Açaí Premium',
    store: 'Açaí da Boa',
    storeLogo: STORE_LOGOS['Açaí da Boa'],
    date: d(Math.max(1, now.getDate())),
    time: '14:00',
    endTime: '16:00',
    location: 'Loja Açaí da Boa - Centro',
    category: 'live-stream',
    description: 'Degustação ao vivo de açaí premium com acompanhamentos exclusivos.',
    fullDescription: 'Participe da nossa degustação ao vivo do novo açaí premium com granola artesanal, banana caramelizada, leite condensado e mel. O chef vai preparar ao vivo e mostrar todas as combinações possíveis. Interaja pelo chat e concorra a cupons de desconto!',
    attendees: 234,
    maxAttendees: null,
    isLive: true,
    isTrending: true,
    discount: null,
    gradient: 'from-purple-500 via-violet-500 to-fuchsia-400',
    attendeeAvatars: AVATAR_COLORS.slice(2, 7),
  },
  {
    id: 'eh-3',
    title: 'Degustação de Queijos Artesanais',
    store: 'Quitanda da Dona',
    storeLogo: STORE_LOGOS['Quitanda da Dona'],
    date: d(Math.min(28, now.getDate() + 2)),
    time: '10:00',
    endTime: '12:00',
    location: 'Quitanda da Dona - Rua das Flores, 45',
    category: 'tasting',
    description: 'Prove os melhores queijos artesanais da região com pão caseiro.',
    fullDescription: 'Uma experiência gastronômica única com queijos artesanais produzidos por produtores locais. Queijo coalho, mussarela de búfala, queijo minas frescal e muito mais. Acompanha pão caseiro recém-saído do forno, geleias artesanais e vinho selections.',
    attendees: 56,
    maxAttendees: 80,
    isLive: false,
    isTrending: true,
    discount: null,
    gradient: 'from-amber-500 via-orange-400 to-yellow-400',
    attendeeAvatars: AVATAR_COLORS.slice(1, 4),
  },
  {
    id: 'eh-4',
    title: 'Workshop: Arranjos Florais com Dona Maria',
    store: 'Casa & Decor',
    storeLogo: '🏡',
    date: d(Math.min(28, now.getDate() + 4)),
    time: '15:00',
    endTime: '17:00',
    location: 'Casa & Decor - Shopping Center',
    category: 'workshop',
    description: 'Aprenda a fazer arranjos florais com a renomada florista Dona Maria.',
    fullDescription: 'Workshop prático de arranjos florais para iniciantes e intermediários. Materiais inclusos: flores frescas, vaso decorativo, ferramentas. Certificado de participação incluso. Vagas limitadas!',
    attendees: 18,
    maxAttendees: 30,
    isLive: false,
    isTrending: false,
    discount: 20,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-400',
    attendeeAvatars: AVATAR_COLORS.slice(3, 6),
  },
  {
    id: 'eh-5',
    title: 'Grande Inauguração — Nova Loja EletroDom',
    store: 'EletroDom',
    storeLogo: STORE_LOGOS['EletroDom'],
    date: d(Math.min(28, now.getDate() + 6)),
    time: '09:00',
    endTime: '18:00',
    location: 'Av. Brasil, 890 - Nova Loja',
    category: 'grand-opening',
    description: 'Inauguração da mega loja com brindes e descontos exclusivos no primeiro dia.',
    fullDescription: 'A EletroDom abre sua nova mega loja com espaço triplicado! No primeiro dia: primeiros 50 clientes ganham brindes exclusivos, sortéio de um eletrodoméstico a cada hora, café e bolo gratis, e descontos de até 40% em toda a loja. Não perca!',
    attendees: 445,
    maxAttendees: null,
    isLive: false,
    isTrending: true,
    discount: 40,
    gradient: 'from-blue-500 via-indigo-500 to-sky-400',
    attendeeAvatars: AVATAR_COLORS.slice(0, 8),
  },
  {
    id: 'eh-6',
    title: 'Festa Natalina — Mercado de Natal',
    store: 'Mercadinho do Zé',
    storeLogo: STORE_LOGOS['Mercadinho do Zé'],
    date: d(Math.min(28, now.getDate() + 14), 1),
    time: '16:00',
    endTime: '21:00',
    location: 'Praça Central - Centro',
    category: 'seasonal',
    description: 'Mercado de Natal com decoração, comidas típicas e presentinhos.',
    fullDescription: 'O Mercadinho do Zé transforma a Praça Central em um verdadeiro Mercado de Natal! Decoração temática, comidas típicas (rabanada, panetone, chocotone, vinho quente), presentinhos surpresa para as crianças, coral ao vivo e Papai Noel!',
    attendees: 678,
    maxAttendees: null,
    isLive: false,
    isTrending: true,
    discount: null,
    gradient: 'from-red-500 via-rose-500 to-pink-400',
    attendeeAvatars: AVATAR_COLORS.slice(4, 9),
  },
  {
    id: 'eh-7',
    title: 'Live: Novidades Moda Primavera Verão',
    store: 'Moda Bela',
    storeLogo: STORE_LOGOS['Moda Bela'],
    date: d(Math.min(28, now.getDate() + 1)),
    time: '19:00',
    endTime: '20:30',
    location: 'Instagram @modabela_oficial',
    category: 'live-stream',
    description: 'Lançamento ao vivo da nova coleção Primavera Verão 2026.',
    fullDescription: 'Assista ao lançamento da nova coleção Primavera Verão 2026 da Moda Bela! Vestidos, biquínis, acessórios e muito mais. Descontos exclusivos durante o live para quem assistir. Tire dúvidas sobre tamanhos e tecidos com a stylist.',
    attendees: 312,
    maxAttendees: null,
    isLive: false,
    isTrending: false,
    discount: 15,
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-400',
    attendeeAvatars: AVATAR_COLORS.slice(5, 8),
  },
  {
    id: 'eh-8',
    title: 'Flash Sale — Eletrônicos até 60% OFF',
    store: 'EletroDom',
    storeLogo: STORE_LOGOS['EletroDom'],
    date: d(Math.min(28, now.getDate() + 3)),
    time: '07:00',
    endTime: '09:00',
    location: 'EletroDom - Av. Brasil, 890',
    category: 'flash-sale',
    description: 'Oferta relâmpago em eletrônicos selecionados. Apenas 2 horas!',
    fullDescription: 'Flash sale matinal com os melhores preços em eletrônicos: fones de ouvido, carregadores, capinhas, cabos e acessórios para celular. Descontos que começam em 30% e vão até 60%! Chegue cedo para garantir os melhores produtos.',
    attendees: 156,
    maxAttendees: null,
    isLive: false,
    isTrending: false,
    discount: 60,
    gradient: 'from-orange-500 via-red-500 to-amber-400',
    attendeeAvatars: AVATAR_COLORS.slice(0, 6),
  },
  {
    id: 'eh-9',
    title: 'Degustação de Vinhos Importados',
    store: 'Vinho & Cia',
    storeLogo: STORE_LOGOS['Vinho & Cia'],
    date: d(Math.min(28, now.getDate() + 8)),
    time: '18:00',
    endTime: '21:00',
    location: 'Vinho & Cia - Rua do Comércio, 22',
    category: 'tasting',
    description: 'Degustação de vinhos selecionados da França, Chile e Argentina.',
    fullDescription: 'Uma noite especial de degustação com vinhos premium importados. Sommelier profissional apresentando 6 rótulos selecionados: 2 brancos, 3 tintos e 1 espumante. Acompanha tábua de queijos e charcutaria artesanal. Vagas muito limitadas!',
    attendees: 22,
    maxAttendees: 25,
    isLive: false,
    isTrending: false,
    discount: null,
    gradient: 'from-red-700 via-red-600 to-amber-600',
    attendeeAvatars: AVATAR_COLORS.slice(2, 5),
  },
  {
    id: 'eh-10',
    title: 'Workshop: Conserto de Bikes Básico',
    store: 'Loja do Ciclista',
    storeLogo: STORE_LOGOS['Loja do Ciclista'],
    date: d(Math.min(28, now.getDate() + 10)),
    time: '10:00',
    endTime: '12:00',
    location: 'Loja do Ciclista - Av. Dom Eliseu, 567',
    category: 'workshop',
    description: 'Aprenda a fazer consertos básicos na sua bicicleta.',
    fullDescription: 'Workshop prático para ciclistas de todos os níveis. Aprenda a trocar pneu, ajustar freios, lubrificar corrente e fazer regulagens básicas. Traga sua bike! Ferramentas e materiais inclusos. Certificado de participação.',
    attendees: 12,
    maxAttendees: 20,
    isLive: false,
    isTrending: false,
    discount: null,
    gradient: 'from-teal-500 via-emerald-500 to-green-400',
    attendeeAvatars: AVATAR_COLORS.slice(6, 9),
  },
  {
    id: 'eh-11',
    title: 'Grande Abertura — Padaria Nova Sabor',
    store: 'Padaria Sabor',
    storeLogo: STORE_LOGOS['Padaria Sabor'],
    date: d(Math.min(28, now.getDate() + 18), 1),
    time: '06:00',
    endTime: '20:00',
    location: 'Padaria Sabor - Nova Unidade Centro',
    category: 'grand-opening',
    description: 'Inauguração da nova unidade com pão fresquinho e promoções.',
    fullDescription: 'A Padaria Sabor abre sua segunda unidade no Centro de Dom Eliseu! Oferta especial: primeiro pão de cada cliente é grátis, café com leite a R$1 até as 9h, sortéio de cestas de Natal. Venha celebrar conosco!',
    attendees: 189,
    maxAttendees: null,
    isLive: false,
    isTrending: false,
    discount: 25,
    gradient: 'from-amber-500 via-yellow-500 to-orange-400',
    attendeeAvatars: AVATAR_COLORS.slice(1, 7),
  },
  {
    id: 'eh-12',
    title: 'Festa Junina do Pet Shop Amigo',
    store: 'Pet Shop Amigo',
    storeLogo: STORE_LOGOS['Pet Shop Amigo'],
    date: d(Math.min(28, now.getDate() + 20), 1),
    time: '09:00',
    endTime: '17:00',
    location: 'Pet Shop Amigo - Rua dos Bichos, 33',
    category: 'seasonal',
    description: 'Arraial com concurso de pet fantasia e brindes para os pets.',
    fullDescription: 'O Pet Shop Amigo realiza uma Festa Junina especial para os pets! Concurso de fantasia com prêmios, pula-pula para pets, banho com perfume especial, fotos profissionais com adereços juninos e muito mais. Venha com seu melhor amigo!',
    attendees: 93,
    maxAttendees: null,
    isLive: false,
    isTrending: false,
    discount: null,
    gradient: 'from-lime-500 via-green-500 to-emerald-400',
    attendeeAvatars: AVATAR_COLORS.slice(0, 4),
  },
  {
    id: 'eh-13',
    title: 'Live: Treino em Casa com Personal',
    store: 'Loja do Ciclista',
    storeLogo: STORE_LOGOS['Loja do Ciclista'],
    date: d(Math.min(28, now.getDate() + 5)),
    time: '07:00',
    endTime: '08:00',
    location: 'YouTube Loja do Ciclista',
    category: 'live-stream',
    description: 'Aula ao vivo de treino funcional com equipamentos acessíveis.',
    fullDescription: 'Personal trainer convidado mostra exercícios funcionais que você pode fazer em casa com equipamentos simples. Elásticos, halteres leves e acessórios de ciclismo. Tire dúvidas ao vivo e receba um plano de treino personalizado.',
    attendees: 178,
    maxAttendees: null,
    isLive: false,
    isTrending: false,
    discount: null,
    gradient: 'from-sky-500 via-blue-500 to-indigo-400',
    attendeeAvatars: AVATAR_COLORS.slice(7, 10),
  },
  {
    id: 'eh-14',
    title: 'Flash Sale — Farmácia Vida 30% OFF',
    store: 'Farmácia Vida',
    storeLogo: STORE_LOGOS['Farmácia Vida'],
    date: d(Math.min(28, now.getDate() + 7)),
    time: '12:00',
    endTime: '14:00',
    location: 'Farmácia Vida - Centro',
    category: 'flash-sale',
    description: 'Vitaminas e suplementos com 30% de desconto por 2 horas.',
    fullDescription: 'Flash sale especial na Farmácia Vida com 30% de desconto em vitaminas, suplementos alimentares e produtos de bem-estar. Aproveite para comprar seus essenciais com preços imperdíveis. Consiga o cupom exclusivo no app.',
    attendees: 64,
    maxAttendees: null,
    isLive: false,
    isTrending: false,
    discount: 30,
    gradient: 'from-cyan-500 via-teal-500 to-emerald-400',
    attendeeAvatars: AVATAR_COLORS.slice(3, 7),
  },
]

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS_LONG = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const CATEGORY_CONFIG: Record<EventCategory | 'all', {
  label: string
  icon: React.ReactNode
  color: string
  dotColor: string
}> = {
  all: { label: 'Todos', icon: <CalendarDays className="h-3.5 w-3.5" />, color: 'text-foreground', dotColor: '#10b981' },
  'flash-sale': { label: 'Flash Sales', icon: <Zap className="h-3.5 w-3.5" />, color: 'text-rose-600', dotColor: '#f43f5e' },
  'live-stream': { label: 'Lives', icon: <Radio className="h-3.5 w-3.5" />, color: 'text-purple-600', dotColor: '#8b5cf6' },
  tasting: { label: 'Degustações', icon: <Wine className="h-3.5 w-3.5" />, color: 'text-amber-600', dotColor: '#f59e0b' },
  workshop: { label: 'Workshops', icon: <Wrench className="h-3.5 w-3.5" />, color: 'text-emerald-600', dotColor: '#10b981' },
  'grand-opening': { label: 'Inaugurações', icon: <PartyPopper className="h-3.5 w-3.5" />, color: 'text-blue-600', dotColor: '#3b82f6' },
  seasonal: { label: 'Temporadas', icon: <TreePine className="h-3.5 w-3.5" />, color: 'text-green-600', dotColor: '#22c55e' },
}

const FILTER_OPTIONS: Array<{ key: EventCategory | 'all'; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'flash-sale', label: 'Flash Sales' },
  { key: 'live-stream', label: 'Lives' },
  { key: 'tasting', label: 'Degustações' },
  { key: 'workshop', label: 'Workshops' },
  { key: 'grand-opening', label: 'Inaugurações' },
  { key: 'seasonal', label: 'Temporadas' },
]

// ── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.2 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

const slideIn = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
}

const pulseVariant = {
  animate: {
    scale: [1, 1.35, 1],
    opacity: [1, 0.5, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const shimmerVariant = {
  initial: { backgroundPosition: '-200% center' },
  animate: {
    backgroundPosition: '200% center',
    transition: { duration: 4, repeat: Infinity, ease: 'linear' as const },
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

function isToday(dateStr: string): boolean {
  return isSameDay(parseDate(dateStr), new Date())
}

function getReminderKey(eventId: string): string {
  return `r56-event-hub-reminder-${eventId}`
}

function getRsvpKey(eventId: string): string {
  return `r56-event-hub-rsvp-${eventId}`
}

function formatAttendeesCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

// ── Countdown Hook ──────────────────────────────────────────────────────────

function useEventCountdown(targetDate: string, targetTime: string) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false })

  useEffect(() => {
    function tick() {
      const target = parseDate(targetDate)
      const [h, m] = targetTime.split(':').map(Number)
      target.setHours(h, m, 0, 0)

      const diff = target.getTime() - Date.now()

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
  }, [targetDate, targetTime])

  return countdown
}

// ── Skeleton Loading ────────────────────────────────────────────────────────

function StoreEventHubSkeleton() {
  return (
    <section className="mt-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-52 rounded-md bg-muted animate-pulse" />
          <div className="h-3 w-72 rounded-md bg-muted animate-pulse" />
        </div>
      </div>
      <div className="w-full h-44 rounded-2xl bg-muted animate-pulse" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-muted animate-pulse shrink-0" />
        ))}
      </div>
      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </section>
  )
}

// ── Sub-Components ──────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: EventCategory }) {
  const config = CATEGORY_CONFIG[category]
  return (
    <span className={`r56-category-badge r56-cat-${category} inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold`}>
      {config.icon}
      {config.label}
    </span>
  )
}

function LiveNowBadge() {
  return (
    <motion.span
      className="r56-live-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
      style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)' }}
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.span
        className="h-2 w-2 rounded-full bg-white"
        variants={pulseVariant}
        animate="animate"
      />
      AO VIVO
    </motion.span>
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
      <Tag className="h-2.5 w-2.5" />
      {discount}% OFF
    </motion.span>
  )
}

function CountdownTimer({ targetDate, targetTime, compact = false }: { targetDate: string; targetTime: string; compact?: boolean }) {
  const cd = useEventCountdown(targetDate, targetTime)
  if (cd.isPast) return null

  const units = [
    { value: cd.days, label: 'd' },
    { value: cd.hours, label: 'h' },
    { value: cd.minutes, label: 'm' },
    { value: cd.seconds, label: 's' },
  ]

  if (compact) {
    return (
      <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
        <Clock className="h-3 w-3 mr-0.5" />
        {cd.days > 0 && <span>{cd.days}d </span>}
        <span>{pad(cd.hours)}:{pad(cd.minutes)}:{pad(cd.seconds)}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {units.map((u, i) => (
        <span key={u.label} className="flex items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={u.value}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: 0.2, type: 'spring' as const, stiffness: 500, damping: 30 }}
              className="r56-countdown-digit inline-flex items-center justify-center min-w-[28px] h-7 rounded-md text-white text-xs font-mono font-bold tabular-nums"
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

function StoreParticipatingBadge({ store, logo }: { store: string; logo: string }) {
  return (
    <div className="r56-store-badge inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 border border-white/15">
      <span className="text-xs">{logo}</span>
      <Store className="h-3 w-3 text-white/70" />
      <span className="text-[10px] font-medium text-white/80 truncate max-w-[120px]">{store}</span>
    </div>
  )
}

function ReminderToggle({ eventId }: { eventId: string }) {
  const [isSet, setIsSet] = useState(() => {
    try { return localStorage.getItem(getReminderKey(eventId)) === 'true' }
    catch { return false }
  })

  const handleToggle = useCallback(() => {
    const next = !isSet
    setIsSet(next)
    try {
      if (next) localStorage.setItem(getReminderKey(eventId), 'true')
      else localStorage.removeItem(getReminderKey(eventId))
    } catch { /* ignore */ }
  }, [isSet, eventId])

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleToggle}
      className={`r56-reminder-btn relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
        isSet
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-muted/60 text-muted-foreground hover:bg-muted'
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
            <BellRing className="h-3 w-3" />
          </motion.span>
        ) : (
          <motion.span
            key="bell"
            initial={{ rotate: 15, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -15, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
          >
            <Bell className="h-3 w-3" />
          </motion.span>
        )}
      </AnimatePresence>
      <span>{isSet ? 'Lembrete ativo' : 'Lembrar'}</span>
    </motion.button>
  )
}

function RsvpButton({ eventId, attendeeCount }: { eventId: string; attendeeCount: number }) {
  const [isRsvpd, setIsRsvpd] = useState(() => {
    try { return localStorage.getItem(getRsvpKey(eventId)) === 'true' }
    catch { return false }
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleRsvp = useCallback(() => {
    const next = !isRsvpd
    setIsRsvpd(next)
    try {
      if (next) {
        localStorage.setItem(getRsvpKey(eventId), 'true')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 1500)
      } else {
        localStorage.removeItem(getRsvpKey(eventId))
      }
    } catch { /* ignore */ }
  }, [isRsvpd, eventId])

  return (
    <div className="relative">
      <motion.div
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="inline-block"
      >
        <button
          ref={buttonRef}
          onClick={handleRsvp}
          className={`r56-rsvp-btn flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            isRsvpd
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
          }`}
          style={isRsvpd ? { boxShadow: '0 4px 14px rgba(16,185,129,0.35)' } : undefined}
        >
          <AnimatePresence mode="wait">
            {isRsvpd ? (
              <motion.span
                key="going"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                className="flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Indo ✓</span>
              </motion.span>
            ) : (
              <motion.span
                key="rsvp"
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -90 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                className="flex items-center gap-1.5"
              >
                <CalendarCheck className="h-3.5 w-3.5" />
                <span>RSVP</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.div>
      {!isRsvpd && (
        <span className="r56-attendee-count text-[9px] text-white/60 ml-2">
          {formatAttendeesCount(attendeeCount)} indo
        </span>
      )}
      <ConfettiBurst active={showConfetti} particleCount={35} spread={140} duration={1200} />
    </div>
  )
}

function ShareEventButton({ eventTitle }: { eventTitle: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleShare = useCallback(async (platform: string) => {
    const text = `Confira: ${eventTitle} no DomPlace!`
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (platform === 'copy') {
      try { await navigator.clipboard.writeText(`${text} ${url}`) } catch { /* ignore */ }
    } else {
      const shareUrl = platform === 'whatsapp'
        ? `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
        : `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      window.open(shareUrl, '_blank', 'noopener')
    }
    setIsOpen(false)
  }, [eventTitle])

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(prev => !prev)}
        className="r56-share-btn p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <Share2 className="h-3.5 w-3.5 text-white/80" />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
            className="r56-share-modal absolute top-full right-0 mt-2 bg-card border rounded-xl shadow-xl p-2 z-50 min-w-[140px]"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
          >
            <button
              onClick={() => handleShare('whatsapp')}
              className="r56-share-option w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-accent transition-colors text-foreground"
            >
              <span>📱</span> WhatsApp
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="r56-share-option w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-accent transition-colors text-foreground"
            >
              <span>🐦</span> Twitter
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="r56-share-option w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-accent transition-colors text-foreground"
            >
              <span>🔗</span> Copiar link
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TrendingEventCard({ event, onOpenDetail }: { event: StoreEventHubEvent; onOpenDetail: (e: StoreEventHubEvent) => void }) {
  return (
    <motion.div
      variants={slideIn}
      whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.1)' }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
      className="r56-trending-card relative overflow-hidden rounded-xl border bg-card cursor-pointer group"
      onClick={() => onOpenDetail(event)}
    >
      <div className={`relative w-full h-32 bg-gradient-to-br ${event.gradient} p-4`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Flame className="h-5 w-5 text-white" />
            </motion.div>
            {event.discount && <DiscountBadge discount={event.discount} />}
          </div>
          <h4 className="text-sm font-bold text-white leading-tight line-clamp-2">{event.title}</h4>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="text-sm">{event.storeLogo}</span>
          <span className="font-medium truncate">{event.store}</span>
          <span className="ml-auto flex items-center gap-0.5">
            <Users className="h-3 w-3" />
            {formatAttendeesCount(event.attendees)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ── Calendar View ─────────────────────────────────────────────────────────────

function CalendarView({
  currentMonth,
  currentYear,
  events,
  onMonthChange,
  onDayClick,
}: {
  currentMonth: number
  currentYear: number
  events: StoreEventHubEvent[]
  onMonthChange: (month: number, year: number) => void
  onDayClick: (day: number) => void
}) {
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()
    const today = new Date()
    const days: CalendarDayData[] = []

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isToday: false, hasEvents: false, events: [] })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day)
      const dayEvents = events.filter(e => isSameDay(parseDate(e.date), dateObj))
      days.push({
        day,
        isCurrentMonth: true,
        isToday: isSameDay(dateObj, today),
        hasEvents: dayEvents.length > 0,
        events: dayEvents,
      })
    }
    const remaining = 42 - days.length
    for (let day = 1; day <= remaining; day++) {
      days.push({ day, isCurrentMonth: false, isToday: false, hasEvents: false, events: [] })
    }
    return days
  }, [currentMonth, currentYear, events])

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
      className="r56-calendar-container rounded-xl border bg-card shadow-sm overflow-hidden"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <motion.button whileTap={{ scale: 0.85 }} onClick={handlePrev}
          className="r56-cal-nav h-8 w-8 rounded-lg bg-background border hover:bg-accent flex items-center justify-center transition-colors"
          aria-label="Mês anterior">
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
        <motion.button whileTap={{ scale: 0.85 }} onClick={handleNext}
          className="r56-cal-nav h-8 w-8 rounded-lg bg-background border hover:bg-accent flex items-center justify-center transition-colors"
          aria-label="Próximo mês">
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
      <div className="grid grid-cols-7 px-2 pt-2">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 px-2 pb-2 gap-0.5">
        {calendarDays.map((dayObj, idx) => (
          <motion.button
            key={idx}
            whileHover={dayObj.isCurrentMonth && dayObj.hasEvents ? { scale: 1.12 } : undefined}
            whileTap={dayObj.isCurrentMonth ? { scale: 0.92 } : undefined}
            onClick={() => dayObj.isCurrentMonth && dayObj.hasEvents ? onDayClick(dayObj.day) : undefined}
            className={`r56-cal-day relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-colors ${
              dayObj.isCurrentMonth
                ? dayObj.isToday
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'text-foreground hover:bg-accent'
                : 'text-muted-foreground/30'
            } ${dayObj.hasEvents && dayObj.isCurrentMonth && !dayObj.isToday ? 'cursor-pointer' : ''}`}
          >
            <span className="leading-none">{dayObj.day}</span>
            {dayObj.hasEvents && dayObj.isCurrentMonth && (
              <div className="flex gap-0.5 mt-0.5">
                {dayObj.events.slice(0, 3).map((ev, evIdx) => (
                  <motion.span
                    key={ev.id}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_CONFIG[ev.category]?.dotColor ?? '#10b981' }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.5, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: evIdx * 0.3 }}
                  />
                ))}
                {dayObj.events.length > 3 && (
                  <span className="text-[7px] text-muted-foreground leading-none ml-0.5">+{dayObj.events.length - 3}</span>
                )}
              </div>
            )}
            {dayObj.isToday && (
              <motion.span className="absolute inset-0 rounded-lg border-2 border-primary/40" variants={pulseVariant} animate="animate" />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ── Event Detail Modal ───────────────────────────────────────────────────────

function EventDetailModal({
  event,
  isOpen,
  onClose,
}: {
  event: StoreEventHubEvent
  isOpen: boolean
  onClose: () => void
}) {
  const cd = useEventCountdown(event.date, event.time)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="r56-detail-modal fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-50 bg-card rounded-2xl border shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            {/* Header image */}
            <div className={`relative h-40 bg-gradient-to-br ${event.gradient} p-5 shrink-0`}>
              <motion.div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={event.category} />
                    {event.isLive && <LiveNowBadge />}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={onClose}
                    className="h-8 w-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">{event.title}</h3>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
              {/* Store + location */}
              <div className="flex items-center gap-2">
                <span className="text-xl">{event.storeLogo}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{event.store}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </p>
                </div>
              </div>

              {/* Date / Time */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {parseDate(event.date).getDate()} de {MONTHS_LONG[parseDate(event.date).getMonth()]}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {event.time} — {event.endTime}
                </span>
              </div>

              {/* Countdown */}
              {!cd.isPast && (
                <div className="flex items-center justify-center py-3 rounded-xl bg-muted/50">
                  <CountdownTimer targetDate={event.date} targetTime={event.time} />
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">Sobre o evento</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{event.fullDescription}</p>
              </div>

              {/* Attendees */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Participantes ({event.attendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''})
                </h4>
                <div className="flex items-center gap-1">
                  {event.attendeeAvatars.map((color, i) => (
                    <motion.div
                      key={i}
                      className="r56-avatar h-8 w-8 rounded-full border-2 border-card"
                      style={{ backgroundColor: color }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05, type: 'spring' as const, stiffness: 400, damping: 20 }}
                    />
                  ))}
                  {event.attendees > event.attendeeAvatars.length && (
                    <div className="r56-avatar-more h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      +{event.attendees - event.attendeeAvatars.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Map placeholder */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">Localização</h4>
                <div className="r56-map-placeholder w-full h-32 rounded-xl bg-muted/50 border flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span className="text-xs">{event.location}</span>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="r56-detail-footer flex items-center gap-3 p-4 border-t bg-muted/20 shrink-0">
              <div className="flex-1">
                <RsvpButton eventId={event.id} attendeeCount={event.attendees} />
              </div>
              <ReminderToggle eventId={event.id} />
              <ShareEventButton eventTitle={event.title} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Event Card (Grid) ────────────────────────────────────────────────────────

function EventCardGrid({ event, onOpenDetail }: { event: StoreEventHubEvent; onOpenDetail: (e: StoreEventHubEvent) => void }) {
  const cd = useEventCountdown(event.date, event.time)

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="relative group"
    >
      <motion.div
        className={`r56-event-card-grid relative overflow-hidden rounded-xl cursor-pointer ${
          event.isLive ? 'ring-2 ring-red-500/50' : 'border border-border'
        }`}
        whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
        onClick={() => onOpenDetail(event)}
      >
        {/* Image placeholder gradient */}
        <div className={`relative w-full h-36 bg-gradient-to-br ${event.gradient}`}>
          <div className="absolute inset-0 bg-black/10" />

          {/* Badges row */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
            <div className="flex items-center gap-1.5">
              <CategoryBadge category={event.category} />
              {event.discount && <DiscountBadge discount={event.discount} />}
            </div>
            {event.isLive ? (
              <LiveNowBadge />
            ) : (
              <ShareEventButton eventTitle={event.title} />
            )}
          </div>

          {/* Countdown on image */}
          {!cd.isPast && !event.isLive && (
            <div className="absolute bottom-3 right-3 z-10">
              <CountdownTimer targetDate={event.date} targetTime={event.time} compact />
            </div>
          )}

          {/* Store participating badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <StoreParticipatingBadge store={event.store} logo={event.storeLogo} />
          </div>
        </div>

        {/* Content area */}
        <div className="p-3 space-y-2 bg-card">
          <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2">{event.title}</h3>

          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>

          {/* Meta row */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {event.time}h
            </span>
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {event.location.split(' - ')[0]}
            </span>
            <span className="ml-auto flex items-center gap-0.5">
              <Users className="h-3 w-3" />
              {formatAttendeesCount(event.attendees)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1 border-t border-border/50">
            <RsvpButton eventId={event.id} attendeeCount={event.attendees} />
            <div className="ml-auto">
              <ReminderToggle eventId={event.id} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Event Card (List) ────────────────────────────────────────────────────────

function EventCardList({ event, onOpenDetail }: { event: StoreEventHubEvent; onOpenDetail: (e: StoreEventHubEvent) => void }) {
  return (
    <motion.div
      variants={itemVariants}
      layout
      className="relative group"
    >
      <motion.div
        className={`r56-event-card-list relative overflow-hidden rounded-xl cursor-pointer border border-border bg-card p-3 flex gap-3 items-center ${
          event.isLive ? 'ring-2 ring-red-500/30' : ''
        }`}
        whileHover={{ x: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
        onClick={() => onOpenDetail(event)}
      >
        {/* Small gradient square */}
        <div className={`r56-list-thumb w-16 h-16 shrink-0 rounded-lg bg-gradient-to-br ${event.gradient} flex items-center justify-center`}>
          <span className="text-2xl">{event.storeLogo}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <CategoryBadge category={event.category} />
            {event.isLive && <LiveNowBadge />}
            {event.discount && <DiscountBadge discount={event.discount} />}
          </div>
          <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-1">{event.title}</h3>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{event.description}</p>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {event.time}h · {parseDate(event.date).getDate()}/{MONTHS_SHORT[parseDate(event.date).getMonth()]}
            </span>
            <span className="flex items-center gap-0.5">
              <Users className="h-3 w-3" />
              {formatAttendeesCount(event.attendees)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <CountdownTimer targetDate={event.date} targetTime={event.time} compact />
          <RsvpButton eventId={event.id} attendeeCount={event.attendees} />
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── My Events Section ───────────────────────────────────────────────────────

function MyEventsSection({
  events,
  onOpenDetail,
  onRemoveRsvp,
}: {
  events: StoreEventHubEvent[]
  onOpenDetail: (e: StoreEventHubEvent) => void
  onRemoveRsvp: (id: string) => void
}) {
  if (events.length === 0) return null

  return (
    <motion.div
      className="r56-my-events space-y-3 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
    >
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-rose-500" />
        <h3 className="text-sm font-bold text-foreground">Meus Eventos ({events.length})</h3>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {events.map(event => (
            <motion.div
              key={event.id}
              variants={slideIn}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -40, transition: { duration: 0.3 } }}
              className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${event.gradient} flex items-center justify-center shrink-0`}>
                <span className="text-lg">{event.storeLogo}</span>
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenDetail(event)}>
                <p className="text-xs font-semibold text-foreground line-clamp-1">{event.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {parseDate(event.date).getDate()} de {MONTHS_LONG[parseDate(event.date).getMonth()]} · {event.time}h
                </p>
              </div>
              <span className="r56-rsvp-status text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                ✓ Indo
              </span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => onRemoveRsvp(event.id)}
                className="p-1 rounded-full hover:bg-destructive/10 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function StoreEventHub() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<EventCategory | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [calMonth, setCalMonth] = useState(M)
  const [calYear, setCalYear] = useState(Y)
  const [detailEvent, setDetailEvent] = useState<StoreEventHubEvent | null>(null)
  const [showMyEvents, setShowMyEvents] = useState(false)
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

  // Get RSVP'd events
  const rsvpdEvents = useMemo(() => {
    return mockEvents.filter(e => {
      try { return localStorage.getItem(getRsvpKey(e.id)) === 'true' }
      catch { return false }
    })
  }, [])

  // Toggle RSVP from My Events
  const handleRemoveRsvp = useCallback((eventId: string) => {
    try { localStorage.removeItem(getRsvpKey(eventId)) } catch { /* ignore */ }
  }, [])

  // Filtered events
  const filteredEvents = useMemo(() => {
    let events = mockEvents
    if (activeFilter !== 'all') events = events.filter(e => e.category === activeFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.store.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      )
    }
    return events
  }, [activeFilter, searchQuery])

  // Calendar events
  const calendarEvents = useMemo(() => {
    return mockEvents.filter(e => {
      const ed = parseDate(e.date)
      return ed.getMonth() === calMonth && ed.getFullYear() === calYear
    })
  }, [calMonth, calYear])

  // Trending events
  const trendingEvents = useMemo(() => {
    return mockEvents.filter(e => e.isTrending).slice(0, 4)
  }, [])

  const displayedEvents = useMemo(() => {
    if (showMyEvents) return rsvpdEvents
    return filteredEvents
  }, [filteredEvents, showMyEvents, rsvpdEvents])

  const handleMonthChange = useCallback((m: number, y: number) => {
    setCalMonth(m)
    setCalYear(y)
  }, [])

  const handleFilterChange = useCallback((key: EventCategory | 'all') => {
    setActiveFilter(key)
  }, [])

  const handleDayClick = useCallback((day: number) => {
    const dateStr = d(day)
    const dayEvents = mockEvents.filter(e => e.date === dateStr)
    if (dayEvents.length === 1) {
      setDetailEvent(dayEvents[0])
    }
  }, [])

  const handleOpenDetail = useCallback((event: StoreEventHubEvent) => {
    setDetailEvent(event)
  }, [])

  if (isLoading) return <StoreEventHubSkeleton />

  return (
    <section className="mt-6 relative" aria-label="Store Event Hub">
      <ConfettiBurst active={welcomeConfetti} particleCount={25} spread={300} duration={1500} />

      {/* ── Section Header ── */}
      <div className="flex items-center gap-3 mb-5">
        <motion.div
          className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg"
          style={{ boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CalendarDays className="h-5 w-5 text-white" />
        </motion.div>
        <div className="flex-1">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Event Hub</h2>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Promoções, flash sales, lives e eventos das lojas locais
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowMyEvents(prev => !prev)}
          className={`r56-my-events-toggle flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            showMyEvents
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${showMyEvents ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
          <span className="hidden sm:inline">Meus Eventos</span>
          {rsvpdEvents.length > 0 && (
            <motion.span
              className="ml-0.5 text-[10px] font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
            >
              {rsvpdEvents.length}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* ── My Events Section ── */}
      {showMyEvents && (
        <MyEventsSection events={rsvpdEvents} onOpenDetail={handleOpenDetail} onRemoveRsvp={handleRemoveRsvp} />
      )}

      {/* ── Search + View Toggle ── */}
      <div className="flex items-center gap-2 mb-4">
        <div className="r56-search-wrapper relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar eventos, lojas, locais..."
            className="r56-search-input w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/60 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted hover:bg-muted-foreground/10 flex items-center justify-center"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </motion.button>
          )}
        </div>
        <div className="flex items-center bg-muted/60 rounded-lg border border-border overflow-hidden">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setViewMode('grid')}
            className={`r56-view-btn p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setViewMode('list')}
            className={`r56-view-btn p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutList className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* ── Trending Events ── */}
      {activeFilter === 'all' && !searchQuery && !showMyEvents && (
        <motion.div className="mb-5" variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-3">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </motion.div>
            <h3 className="text-sm font-bold text-foreground">Em Alta</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-2">
            {trendingEvents.map(event => (
              <div key={event.id} className="w-48 shrink-0">
                <TrendingEventCard event={event} onOpenDetail={handleOpenDetail} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Calendar View ── */}
      <div className="mb-5">
        <CalendarView
          currentMonth={calMonth}
          currentYear={calYear}
          events={calendarEvents}
          onMonthChange={handleMonthChange}
          onDayClick={handleDayClick}
        />
      </div>

      {/* ── Filter Tabs ── */}
      <div className="relative mb-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1">
          {FILTER_OPTIONS.map(opt => {
            const isActive = activeFilter === opt.key
            const count = opt.key === 'all' ? mockEvents.length : mockEvents.filter(e => e.category === opt.key).length
            return (
              <motion.button
                key={opt.key}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.04 }}
                onClick={() => handleFilterChange(opt.key)}
                className={`r56-filter-pill relative shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${
                  isActive ? 'text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="r56-filter-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    style={{ boxShadow: '0 2px 12px rgba(16,185,129,0.3)' }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {opt.key !== 'all' && <span className="text-sm">{CATEGORY_CONFIG[opt.key as EventCategory]?.icon}</span>}
                  {opt.label}
                  <span className="text-[10px] opacity-70">({count})</span>
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Events Grid / List ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeFilter}-${viewMode}-${showMyEvents}`}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
              : 'flex flex-col gap-2'
          }
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {displayedEvents.map(event =>
            viewMode === 'grid' ? (
              <EventCardGrid key={event.id} event={event} onOpenDetail={handleOpenDetail} />
            ) : (
              <EventCardList key={event.id} event={event} onOpenDetail={handleOpenDetail} />
            )
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Empty State ── */}
      {displayedEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="r56-empty-state flex flex-col items-center justify-center py-16 text-center"
        >
          <motion.span
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-4xl mb-3"
          >
            📅
          </motion.span>
          <p className="text-sm font-semibold text-muted-foreground">
            {showMyEvents ? 'Nenhum evento confirmado' : 'Nenhum evento encontrado'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {showMyEvents
              ? 'Confirme sua presença em algum evento para vê-lo aqui'
              : searchQuery
                ? 'Tente buscar por outro termo'
                : 'Tente selecionar outra categoria'
            }
          </p>
          {showMyEvents && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMyEvents(false)}
              className="mt-4 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
            >
              Ver todos os eventos
            </motion.button>
          )}
        </motion.div>
      )}

      {/* ── Stats Footer ── */}
      <motion.div
        className="flex justify-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.span
          variants={shimmerVariant}
          initial="initial"
          animate="animate"
          className="r56-shimmer-footer text-[10px] text-muted-foreground font-medium"
          style={{
            backgroundImage: 'linear-gradient(90deg, rgba(100,116,139,1) 0%, rgba(16,185,129,1) 50%, rgba(100,116,139,1) 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {mockEvents.length} eventos · {mockEvents.filter(e => e.isLive).length} ao vivo · {rsvpdEvents.length} confirmados
        </motion.span>
      </motion.div>

      {/* ── Event Detail Modal ── */}
      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          isOpen={!!detailEvent}
          onClose={() => setDetailEvent(null)}
        />
      )}
    </section>
  )
}
