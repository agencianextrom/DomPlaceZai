'use client'

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, MapPin, Clock, Users, Bookmark, BookmarkCheck, Share2, Star, Trash2, Flame, ChevronDown, Check } from 'lucide-react'
import { cachedFetch } from '@/lib/cached-fetch'

// ── Types ────────────────────────────────────────────────────────────────────

type EventCategory = 'feira' | 'cultural' | 'esportivo' | 'gastronomico' | 'religioso' | 'educativo' | 'saude'

interface CommunityEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  endTime: string
  location: string
  category: EventCategory
  isFree: boolean
  price: number
  organizer: string
  attendees: number
  emoji: string
  isFeatured: boolean
}

type ViewMode = 'upcoming' | 'featured' | 'saved'

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'r75-my-events'
const MONTHS_SHORT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const WEEKDAYS_SHORT = ['dom','seg','ter','qua','qui','sex','sáb']

const CATEGORY_LABELS: Record<EventCategory, string> = {
  feira: 'Feira', cultural: 'Cultural', esportivo: 'Esportivo',
  gastronomico: 'Gastronômico', religioso: 'Religioso', educativo: 'Educativo', saude: 'Saúde',
}

const CATEGORY_GRADIENTS: Record<EventCategory, string> = {
  feira: 'from-amber-400 to-orange-500', cultural: 'from-purple-400 to-fuchsia-500',
  esportivo: 'from-emerald-400 to-teal-500', gastronomico: 'from-rose-400 to-red-500',
  religioso: 'from-sky-400 to-blue-500', educativo: 'from-cyan-400 to-blue-500',
  saude: 'from-green-400 to-emerald-500',
}

const CATEGORY_TAG_COLORS: Record<EventCategory, string> = {
  feira: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  cultural: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
  esportivo: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  gastronomico: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
  religioso: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
  educativo: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200',
  saude: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
}

const CATEGORY_EMOJIS: Record<string, string> = {
  todos: '📋', feira: '🌾', cultural: '🎭', esportivo: '🏆',
  gastronomico: '🍲', religioso: '⛪', educativo: '📚', saude: '🏥',
}

const ALL_CATEGORIES: ('todos' | EventCategory)[] = ['todos','feira','cultural','esportivo','gastronomico','religioso','educativo','saude']

// ── Date helpers ─────────────────────────────────────────────────────────────

function addDays(base: Date, days: number): Date {
  const d = new Date(base); d.setDate(d.getDate() + days); return d
}
function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function todayStart(): Date { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()) }
function parseDate(dateStr: string): Date { const [y,m,d] = dateStr.split('-').map(Number); return new Date(y, m-1, d) }
function formatDateParts(dateStr: string) {
  const d = parseDate(dateStr)
  return { day: String(d.getDate()).padStart(2,'0'), monthShort: MONTHS_SHORT[d.getMonth()] }
}
function isToday(dateStr: string): boolean {
  const t = todayStart(), e = parseDate(dateStr)
  return e.getFullYear()===t.getFullYear() && e.getMonth()===t.getMonth() && e.getDate()===t.getDate()
}
function isHappeningNow(event: CommunityEvent): boolean {
  if (!isToday(event.date)) return false
  const now = new Date(), [h,m] = event.time.split(':').map(Number), [eh,em] = event.endTime.split(':').map(Number)
  const nowMin = now.getHours()*60+now.getMinutes()
  return nowMin >= h*60+m && nowMin <= eh*60+em
}
function daysUntil(dateStr: string): number {
  return Math.ceil((parseDate(dateStr).getTime() - todayStart().getTime()) / (1000*60*60*24))
}

// ── Fallback Data ────────────────────────────────────────────────────────────

function buildFallbackEvents(): CommunityEvent[] {
  const t = new Date()
  return [
    {
      id: 'evt-1',
      title: 'Feira do Agricultor',
      description:
        'Produtos frescos direto do campo! Frutas, verduras, mel e queijo artesanal. Apoie os produtores locais de Dom Eliseu.',
      date: toISODate(addDays(t, 1)),
      time: '06:00',
      endTime: '11:00',
      location: 'Praça Central',
      category: 'feira',
      isFree: true,
      price: 0,
      organizer: 'Associação dos Agricultores',
      attendees: 45,
      emoji: '🌾',
      isFeatured: true,
    },
    {
      id: 'evt-2',
      title: 'Festival da Mangaba',
      description:
        'Noites de cultura popular com música, dança, artesanato e shows ao vivo. Celebração da rica tradição cultural do Pará.',
      date: toISODate(addDays(t, 3)),
      time: '18:00',
      endTime: '22:00',
      location: 'Centro Cultural',
      category: 'cultural',
      isFree: false,
      price: 15,
      organizer: 'Secretaria de Cultura',
      attendees: 120,
      emoji: '🎭',
      isFeatured: true,
    },
    {
      id: 'evt-3',
      title: 'Corrida Rústica 10K',
      description:
        'Prova de 10 quilômetros por estradas de terra e trilhas da região. Categorias masculina e feminina com premiação.',
      date: toISODate(addDays(t, 5)),
      time: '06:30',
      endTime: '09:00',
      location: 'Parque Municipal',
      category: 'esportivo',
      isFree: false,
      price: 30,
      organizer: 'Clube de Corredores',
      attendees: 78,
      emoji: '🏃',
      isFeatured: false,
    },
    {
      id: 'evt-4',
      title: 'Festival de Culinária Paraense',
      description:
        'Chefs locais preparam pratos típicos como tacacá, maniçoba, pato no tucupi e açaí. Venha provar os sabores da Amazônia!',
      date: toISODate(addDays(t, 7)),
      time: '11:00',
      endTime: '20:00',
      location: 'Ginásio Municipal',
      category: 'gastronomico',
      isFree: false,
      price: 25,
      organizer: 'Associação Gastronômica',
      attendees: 95,
      emoji: '🍲',
      isFeatured: true,
    },
    {
      id: 'evt-5',
      title: 'Novena de Nossa Senhora',
      description:
        'Tradição religiosa com orações, cânticos e celebrações. Momento de fé e união para toda a comunidade dom-eliseuense.',
      date: toISODate(addDays(t, 4)),
      time: '19:00',
      endTime: '21:00',
      location: 'Igreja Matriz',
      category: 'religioso',
      isFree: true,
      price: 0,
      organizer: 'Paróquia São José',
      attendees: 200,
      emoji: '⛪',
      isFeatured: false,
    },
    {
      id: 'evt-6',
      title: 'Workshop de Reciclagem',
      description:
        'Aprenda a transformar materiais recicláveis em peças de arte utilitária. Oficina prática com materiais inclusos.',
      date: toISODate(addDays(t, 6)),
      time: '09:00',
      endTime: '12:00',
      location: 'Escola Municipal',
      category: 'educativo',
      isFree: true,
      price: 0,
      organizer: 'ONG EcoVida',
      attendees: 32,
      emoji: '♻️',
      isFeatured: false,
    },
    {
      id: 'evt-7',
      title: 'Mutirão de Saúde',
      description:
        'Consultas médicas, exames básicos, vacinação e orientação nutricional gratuitos. Traga seu documento de identidade.',
      date: toISODate(addDays(t, 2)),
      time: '08:00',
      endTime: '16:00',
      location: 'UBS Central',
      category: 'saude',
      isFree: true,
      price: 0,
      organizer: 'Secretaria de Saúde',
      attendees: 150,
      emoji: '🏥',
      isFeatured: false,
    },
    {
      id: 'evt-8',
      title: 'Torneio de Futebol Local',
      description:
        'Campeonato entre times de bairros de Dom Eliseu. Partidas emocionantes com premiação para o campeão.',
      date: toISODate(addDays(t, 8)),
      time: '15:00',
      endTime: '18:00',
      location: 'Campo do Clube',
      category: 'esportivo',
      isFree: false,
      price: 5,
      organizer: 'Liga Desportiva Municipal',
      attendees: 65,
      emoji: '⚽',
      isFeatured: false,
    },
    {
      id: 'evt-9',
      title: 'Feira de Artesanato',
      description:
        'Artesãos locais expõem trabalhos em madeira, cerâmica, tecelagem e bijuterias. Venha conhecer e apoiar o talento local!',
      date: toISODate(addDays(t, 10)),
      time: '08:00',
      endTime: '14:00',
      location: 'Calçadão da Avenida Principal',
      category: 'feira',
      isFree: true,
      price: 0,
      organizer: 'Associação dos Artesãos',
      attendees: 88,
      emoji: '🎨',
      isFeatured: false,
    },
    {
      id: 'evt-10',
      title: 'Aula de Dança Gratuita',
      description:
        'Aulas abertas de forró, carimbó e samba. Venha com roupas confortáveis e aproveite a noite com muita dança!',
      date: toISODate(addDays(t, 3)),
      time: '19:00',
      endTime: '20:30',
      location: 'Praça da Juventude',
      category: 'cultural',
      isFree: true,
      price: 0,
      organizer: 'Projeto Dança na Praça',
      attendees: 25,
      emoji: '💃',
      isFeatured: false,
    },
  ]
}
const FALLBACK_EVENTS = buildFallbackEvents()

// ── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 },
  },
  exit: { opacity: 0, scale: 0.92, y: -12, transition: { duration: 0.2 } },
}

const pillVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
  },
}

const pulseGlow = {
  animate: { opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] },
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
}

const happeningPulse = {
  animate: { opacity: [1, 0.5, 1], scale: [1, 1.08, 1] },
  transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
}
const spotlightVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1, x: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

// ── localStorage helpers ────────────────────────────────────────────────────

function getSavedEventIds(): string[] {
  if (typeof window === 'undefined') return []
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function saveEventId(id: string): void {
  const ids = getSavedEventIds()
  if (!ids.includes(id)) { ids.push(id); localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)) }
}
function removeEventId(id: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getSavedEventIds().filter((eid) => eid !== id)))
}
function clearAllSavedEventIds(): void { localStorage.removeItem(STORAGE_KEY) }

// ── Stats helper ────────────────────────────────────────────────────────────

function computeWeeklyStats(events: CommunityEvent[]) {
  const today = todayStart()
  const weekEnd = addDays(today, 7)
  const weekEvents = events.filter((e) => {
    const d = parseDate(e.date)
    return d >= today && d < weekEnd
  })
  const totalFree = weekEvents.filter((e) => e.isFree).length
  const totalAttendees = weekEvents.reduce((sum, e) => sum + e.attendees, 0)
  const uniqueCategories = new Set(weekEvents.map((e) => e.category)).size
  return {
    totalEvents: weekEvents.length,
    freeEvents: totalFree,
    totalAttendees,
    uniqueCategories,
  }
}

// ── Mini Calendar Strip ──────────────────────────────────────────────────────

function MiniCalendarStrip({ selectedDate, onSelectDate, events, prefersReduced }: {
  selectedDate: string | null; onSelectDate: (date: string | null) => void; events: CommunityEvent[]; prefersReduced: boolean
}) {
  const today = todayStart()
  const todayISO = toISODate(today)
  const days = (() => {
    const r: { isoStr: string; weekday: string; dayNum: number }[] = []
    for (let i = 0; i < 7; i++) { const d = addDays(today, i); r.push({ isoStr: toISODate(d), weekday: WEEKDAYS_SHORT[d.getDay()], dayNum: d.getDate() }) }
    return r
  })()
  const eventsByDateMap: Record<string, number> = {}
  events.forEach((e) => { eventsByDateMap[e.date] = (eventsByDateMap[e.date] || 0) + 1 })

  return (
    <div className="r75-calendar-strip flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      <motion.button onClick={() => onSelectDate(null)}
        whileHover={prefersReduced ? {} : { scale: 1.05 }} whileTap={prefersReduced ? {} : { scale: 0.95 }}
        className={`r75-day-cell flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-xl px-3 py-2 shrink-0 transition-colors ${
          selectedDate === null ? 'bg-rose-500 text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
      ><span className="text-[10px] font-semibold uppercase leading-none">Todos</span></motion.button>
      {days.map((day) => {
        const isTodayDate = day.isoStr === todayISO, isSelected = selectedDate === day.isoStr, hasEvents = (eventsByDateMap[day.isoStr] || 0) > 0
        return (
          <motion.button key={day.isoStr} onClick={() => onSelectDate(day.isoStr)}
            whileHover={prefersReduced ? {} : { scale: 1.05 }} whileTap={prefersReduced ? {} : { scale: 0.95 }}
            className={`r75-day-cell flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-xl px-3 py-2 shrink-0 transition-colors ${
              isSelected ? 'bg-rose-500 text-white' : isTodayDate ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
          >
            <span className="text-[10px] font-semibold uppercase leading-none">{day.weekday}</span>
            <span className="text-sm font-bold leading-none mt-1">{day.dayNum}</span>
            {hasEvents && <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />}
          </motion.button>
        )
      })}
    </div>
  )
}

// ── Attendee Avatar Stack ────────────────────────────────────────────────────

function AttendeeAvatarStack({ count, prefersReduced }: { count: number; prefersReduced: boolean }) {
  const names = ['MA','JS','RF','CP','AN','LT','DG']
  const colors = ['bg-rose-400','bg-amber-400','bg-emerald-400','bg-sky-400','bg-purple-400','bg-fuchsia-400','bg-teal-400']
  const shown = Math.min(count, 4)
  return (
    <div className="r75-attendee-stack flex items-center -space-x-2">
      {Array.from({ length: shown }).map((_, i) => (
        <motion.div key={i} initial={prefersReduced ? {} : { opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
          className={`${colors[i % colors.length]} h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white dark:border-gray-900`}
          style={{ transformOrigin: 'center' }}>{names[i % names.length]}</motion.div>
      ))}
      {count > shown && (
        <motion.div initial={prefersReduced ? {} : { opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: shown * 0.08 }}
          className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-900"
          style={{ transformOrigin: 'center' }}>+{count - shown}</motion.div>
      )}
    </div>
  )
}

// ── Featured Event Spotlight ─────────────────────────────────────────────────

function FeaturedEventSpotlight({ event, isBookmarked, onToggleBookmark, onShare, prefersReduced }: {
  event: CommunityEvent; isBookmarked: boolean; onToggleBookmark: () => void; onShare: () => void; prefersReduced: boolean
}) {
  const days = daysUntil(event.date)
  const { day, monthShort } = formatDateParts(event.date)
  const happening = isHappeningNow(event)

  return (
    <motion.div initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
      className="r75-featured-card relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500" />
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="relative z-10 p-5 sm:p-6">
        {/* Label + date */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-white" />
            <span className="text-sm font-bold text-white/90 uppercase tracking-wide">Evento em Destaque</span>
          </div>
          <div className="r75-date-badge flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 min-w-[44px]">
            <span className="text-[10px] font-semibold text-white/70 uppercase leading-none">{monthShort}</span>
            <span className="text-xl font-black text-white leading-none mt-0.5">{day}</span>
          </div>
        </div>
        {/* Emoji + happening */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">{event.emoji}</span>
          {happening && (
            <motion.span className="r75-happening-badge flex items-center gap-1 bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full" {...happeningPulse}>
              <span className="h-2 w-2 rounded-full bg-green-300 inline-block" /> Acontecendo agora!
            </motion.span>
          )}
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">{event.title}</h3>
        <p className="text-sm text-white/80 mb-4 line-clamp-3 leading-relaxed">{event.description}</p>
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/90 mb-4">
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{event.time} – {event.endTime}</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{event.location}</span>
          <span className="flex items-center gap-1.5 text-white/70"><Users className="h-4 w-4" />{event.organizer}</span>
        </div>
        {/* Price + countdown */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`r75-price-badge text-xs font-bold px-3 py-1 rounded-full ${event.isFree ? 'bg-green-400/30 text-white' : 'bg-amber-400/30 text-white'}`}>
            {event.isFree ? '✓ Gratuito' : `R$${event.price}`}
          </span>
          {days > 0 && <span className="text-sm font-semibold text-white/90">Começa em {days} {days === 1 ? 'dia' : 'dias'}</span>}
        </div>
        {/* CTA + avatars + actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <motion.button whileHover={prefersReduced ? {} : { scale: 1.03 }} whileTap={prefersReduced ? {} : { scale: 0.97 }}
            className="flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl bg-white text-rose-600 font-bold text-sm transition-colors hover:bg-white/90">
            <CalendarDays className="h-4 w-4" /> Confirmar presença
          </motion.button>
          <div className="flex items-center gap-3">
            <AttendeeAvatarStack count={event.attendees} prefersReduced={prefersReduced} />
            <motion.button whileHover={prefersReduced ? {} : { scale: 1.1 }} whileTap={prefersReduced ? {} : { scale: 0.9 }}
              onClick={onShare}
              className="r75-action-btn min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label="Compartilhar evento">
              <Share2 className="h-4 w-4 text-white" />
            </motion.button>
            <motion.button whileHover={prefersReduced ? {} : { scale: 1.1 }} whileTap={prefersReduced ? {} : { scale: 0.9 }}
              onClick={onToggleBookmark}
              className="r75-action-btn min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label={isBookmarked ? 'Remover dos salvos' : 'Salvar evento'}>
              {isBookmarked ? <BookmarkCheck className="h-5 w-5 text-white" /> : <Bookmark className="h-5 w-5 text-white" />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event, isBookmarked, onToggleBookmark, onShare, prefersReduced }: {
  event: CommunityEvent; isBookmarked: boolean; onToggleBookmark: () => void; onShare: () => void; prefersReduced: boolean
}) {
  const happening = isHappeningNow(event)
  const { day, monthShort } = formatDateParts(event.date)
  const gradient = CATEGORY_GRADIENTS[event.category]
  const tagColor = CATEGORY_TAG_COLORS[event.category]

  return (
    <motion.div variants={cardVariants} layout
      className="r75-event-card group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-colors hover:border-border"
      whileHover={prefersReduced ? {} : { y: -4, scale: 1.01 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
      style={{ transformOrigin: 'top center' }}>
      {/* Image placeholder */}
      <div className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-5xl opacity-80 group-hover:opacity-100 transition-opacity">{event.emoji}</span>
        <div className="absolute top-3 left-3 r75-date-badge flex flex-col items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-2.5 py-1 min-w-[40px]">
          <span className="text-[10px] font-bold text-rose-500 uppercase leading-none">{monthShort}</span>
          <span className="text-lg font-black text-gray-900 dark:text-white leading-none mt-0.5">{day}</span>
        </div>
        {happening && (
          <motion.span className="r75-happening-badge absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full" {...happeningPulse}>
            <span className="h-1.5 w-1.5 rounded-full bg-white inline-block" /> Agora!
          </motion.span>
        )}
        <div className="absolute bottom-3 right-3">
          <span className={`r75-price-badge text-[10px] font-bold px-2.5 py-1 rounded-full ${event.isFree ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
            {event.isFree ? 'Gratuito' : `R$${event.price}`}
          </span>
        </div>
      </div>
      {/* Body */}
      <div className="p-4">
        <div className="mb-2">
          <span className={`r75-category-tag inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${tagColor}`}>
            {CATEGORY_EMOJIS[event.category] || '📌'} {CATEGORY_LABELS[event.category]}
          </span>
        </div>
        <h4 className="text-sm font-bold text-foreground leading-snug mb-1 line-clamp-1">{event.title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{event.description}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{event.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Clock className="h-3.5 w-3.5 shrink-0" /><span>{event.time} – {event.endTime}</span>
        </div>
        <div className="r75-attendee-count flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>{event.attendees} {event.attendees === 1 ? 'pessoa interessada' : 'pessoas interessadas'}</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={prefersReduced ? {} : { scale: 1.05 }} whileTap={prefersReduced ? {} : { scale: 0.92 }}
            onClick={onToggleBookmark}
            className={`r75-action-btn flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-3 rounded-lg text-xs font-semibold transition-colors ${
              isBookmarked ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                : 'bg-muted/50 text-muted-foreground border border-transparent hover:border-border'}`}
            aria-label={isBookmarked ? 'Remover dos salvos' : 'Marcar interesse'}>
            {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            <span className="hidden sm:inline">{isBookmarked ? 'Salvo' : 'Interesse'}</span>
          </motion.button>
          <motion.button whileHover={prefersReduced ? {} : { scale: 1.05 }} whileTap={prefersReduced ? {} : { scale: 0.92 }}
            onClick={onShare}
            className="r75-action-btn flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-3 rounded-lg text-xs font-semibold bg-muted/50 text-muted-foreground border border-transparent hover:border-border transition-colors"
            aria-label="Compartilhar evento">
            <Share2 className="h-4 w-4" /><span className="hidden sm:inline">Compartilhar</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ── My Events Section ────────────────────────────────────────────────────────

function MyEventsSection({ savedIds, events, onRemove, onClearAll, onShare, prefersReduced }: {
  savedIds: string[]; events: CommunityEvent[]; onRemove: (id: string) => void; onClearAll: () => void; onShare: () => void; prefersReduced: boolean
}) {
  const savedEvents = events.filter((e) => savedIds.includes(e.id))
  if (savedEvents.length === 0) {
    return (
      <motion.div initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center">
        <motion.span className="text-5xl mb-4"
          animate={prefersReduced ? {} : { y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}>📅</motion.span>
        <p className="text-base font-semibold text-muted-foreground">Nenhum evento salvo</p>
        <p className="text-sm text-muted-foreground mt-1">Toque no ícone de interesse em qualquer evento para salvá-lo aqui.</p>
      </motion.div>
    )
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-muted-foreground">{savedEvents.length} {savedEvents.length === 1 ? 'evento salvo' : 'eventos salvos'}</span>
        <motion.button whileHover={prefersReduced ? {} : { scale: 1.05 }} whileTap={prefersReduced ? {} : { scale: 0.95 }}
          onClick={onClearAll}
          className="r75-action-btn flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors">
          <Trash2 className="h-3.5 w-3.5" /> Limpar tudo
        </motion.button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {savedEvents.map((event) => (
            <motion.div key={event.id} layout exit={{ opacity: 0, scale: 0.9 }}>
              <EventCard event={event} isBookmarked={true} onToggleBookmark={() => onRemove(event.id)} onShare={onShare} prefersReduced={prefersReduced} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── View Mode Tabs ───────────────────────────────────────────────────────────

function ViewModeTabs({ active, onChange, savedCount, prefersReduced }: {
  active: ViewMode; onChange: (mode: ViewMode) => void; savedCount: number; prefersReduced: boolean
}) {
  const tabs: { key: ViewMode; label: string; shortLabel: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'upcoming', label: 'Próximos', shortLabel: 'Próx.', icon: <CalendarDays className="h-4 w-4" /> },
    { key: 'featured', label: 'Destaque', shortLabel: 'Dest.', icon: <Star className="h-4 w-4" /> },
    { key: 'saved', label: 'Meus Eventos', shortLabel: 'Meus', icon: <Bookmark className="h-4 w-4" />, badge: savedCount > 0 ? savedCount : undefined },
  ]
  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1" role="tablist">
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <motion.button key={tab.key} role="tab" aria-selected={isActive} onClick={() => onChange(tab.key)}
            whileHover={prefersReduced ? {} : { scale: 1.02 }} whileTap={prefersReduced ? {} : { scale: 0.97 }}
            className={`relative flex items-center gap-1.5 min-h-[44px] px-4 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}>
            {isActive && (
              <motion.div layoutId="view-tab-active" className="absolute inset-0 bg-rose-500 rounded-lg"
                style={{ transformOrigin: 'center' }} transition={{ type: 'spring' as const, stiffness: 350, damping: 30 }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              {tab.badge !== undefined && <span className="ml-1 bg-white/30 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{tab.badge}</span>}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

// ── Category Filter Chips ────────────────────────────────────────────────────

function CategoryFilterChips({ active, onChange, prefersReduced }: {
  active: 'todos' | EventCategory; onChange: (cat: 'todos' | EventCategory) => void; prefersReduced: boolean
}) {
  return (
    <motion.div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }} initial="hidden" animate="visible">
      {ALL_CATEGORIES.map((cat) => (
        <motion.button key={cat} variants={pillVariants}
          whileHover={prefersReduced ? {} : { scale: 1.05 }} whileTap={prefersReduced ? {} : { scale: 0.92 }}
          onClick={() => onChange(cat)}
          className={`flex items-center gap-1.5 shrink-0 min-h-[44px] px-3.5 rounded-full text-xs font-semibold transition-colors ${
            active === cat ? 'bg-rose-500 text-white' : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
          <span>{CATEGORY_EMOJIS[cat]}</span><span>{cat === 'todos' ? 'Todos' : CATEGORY_LABELS[cat]}</span>
        </motion.button>
      ))}
    </motion.div>
  )
}

// ── Weekly Stats Bar ────────────────────────────────────────────────────────

function WeeklyStatsBar({ events, prefersReduced }: { events: CommunityEvent[]; prefersReduced: boolean }) {
  const stats = useMemo(() => computeWeeklyStats(events), [events])
  const items = [
    { label: 'Esta semana', value: stats.totalEvents, sub: `${stats.totalEvents === 1 ? 'evento' : 'eventos'}`, emoji: '📅' },
    { label: 'Gratuitos', value: stats.freeEvents, sub: 'sem custo', emoji: '✅' },
    { label: 'Interessados', value: stats.totalAttendees, sub: 'pessoas', emoji: '👥' },
    { label: 'Categorias', value: stats.uniqueCategories, sub: 'tipos', emoji: '🏷️' },
  ]
  return (
    <motion.div initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
      {items.map((item) => (
        <motion.div key={item.label} whileHover={prefersReduced ? {} : { scale: 1.02 }}
          className="flex items-center gap-3 bg-muted/40 rounded-xl p-3 border border-border/30">
          <span className="text-xl" aria-hidden="true">{item.emoji}</span>
          <div>
            <p className="text-base font-bold text-foreground leading-none">{item.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{item.sub}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ── Today's Events Banner ────────────────────────────────────────────────────

function TodaysEventsBanner({ events, onSelectDate, prefersReduced }: {
  events: CommunityEvent[]; onSelectDate: () => void; prefersReduced: boolean
}) {
  const todayEvents = events.filter((e) => isToday(e.date))
  if (todayEvents.length === 0) return null
  const happeningNow = todayEvents.filter((e) => isHappeningNow(e))
  const upcomingToday = todayEvents.filter((e) => !isHappeningNow(e))
  return (
    <motion.div initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-3 mb-5 cursor-pointer"
      onClick={onSelectDate} role="button" tabIndex={0} aria-label={`${todayEvents.length} eventos hoje`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">📌 {todayEvents.length} {todayEvents.length === 1 ? 'evento' : 'eventos'} hoje</p>
        {happeningNow.length > 0 && <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-0.5">🟢 {happeningNow.length} acontecendo agora</p>}
        {upcomingToday.length > 0 && <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-0.5">⏰ {upcomingToday.length} ainda por vir</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {todayEvents.slice(0, 3).map((e) => <span key={e.id} className="text-lg" title={e.title}>{e.emoji}</span>)}
        {todayEvents.length > 3 && <span className="text-xs font-bold text-rose-500">+{todayEvents.length - 3}</span>}
      </div>
    </motion.div>
  )
}

// ── Share Toast ──────────────────────────────────────────────────────────────

function ShareToast({ visible, prefersReduced }: { visible: boolean; prefersReduced: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-xl text-sm font-semibold">
          <Check className="h-4 w-4 text-green-400" /> Link copiado!
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function CommunityEventsBoard() {
  const prefersReduced = useSyncExternalStore(
    (cb) => { const m = window.matchMedia('(prefers-reduced-motion: reduce)'); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  )

  const [events, setEvents] = useState<CommunityEvent[]>(FALLBACK_EVENTS)
  const [viewMode, setViewMode] = useState<ViewMode>('upcoming')
  const [categoryFilter, setCategoryFilter] = useState<'todos' | EventCategory>('todos')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>(getSavedEventIds)
  const [showCount, setShowCount] = useState(6)
  const [shareToastVisible, setShareToastVisible] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try { const data = await cachedFetch<CommunityEvent[]>('/api/events/community'); if (!cancelled && data?.length) setEvents(data) }
      catch { /* keep fallback */ }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => { setSavedIds(() => getSavedEventIds()) }, [])

  const handleShare = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {})
    }
    setShareToastVisible(true)
    setTimeout(() => setShareToastVisible(false), 2000)
  }, [])

  const toggleBookmark = useCallback((id: string) => {
    setSavedIds((prev) => {
      if (prev.includes(id)) { removeEventId(id); return prev.filter((eid) => eid !== id) }
      saveEventId(id); return [...prev, id]
    })
  }, [])

  const clearAllSaved = useCallback(() => { clearAllSavedEventIds(); setSavedIds([]) }, [])
  const handleShowMore = useCallback(() => { setShowCount((prev) => prev + 6) }, [])

  const featuredEvents = useMemo(() => events.filter((e) => e.isFeatured), [events])

  const filteredEvents = useMemo(() => {
    let result = events
    if (categoryFilter !== 'todos') result = result.filter((e) => e.category === categoryFilter)
    if (selectedDate) result = result.filter((e) => e.date === selectedDate)
    return [...result].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())
  }, [events, categoryFilter, selectedDate])

  const displayedEvents = useMemo(() => filteredEvents.slice(0, showCount), [filteredEvents, showCount])
  const hasMore = showCount < filteredEvents.length
  const hasActiveFilters = selectedDate !== null || categoryFilter !== 'todos'

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6" aria-label="Agenda de Eventos Comunitários">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <motion.div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center" {...pulseGlow}>
            <CalendarDays className="h-5 w-5 text-white" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
            Agenda Comunitária
          </h2>
        </div>
        <p className="text-sm text-muted-foreground ml-12">Eventos, feiras e atividades em Dom Eliseu</p>
      </div>

      {/* View Mode Tabs */}
      <div className="mb-4">
        <ViewModeTabs active={viewMode} onChange={setViewMode} savedCount={savedIds.length} prefersReduced={prefersReduced} />
      </div>

      {viewMode !== 'saved' && (
        <>
          {/* Featured Spotlight */}
          {viewMode === 'featured' && featuredEvents.length > 0 && (
            <div className="space-y-4 mb-6">
              <AnimatePresence mode="wait">
                {featuredEvents.map((event) => (
                  <motion.div key={event.id} variants={spotlightVariants}
                    initial={prefersReduced ? { opacity: 1, x: 0 } : 'hidden'}
                    animate={prefersReduced ? { opacity: 1, x: 0 } : 'visible'} exit="exit">
                    <FeaturedEventSpotlight event={event} isBookmarked={savedIds.includes(event.id)}
                      onToggleBookmark={() => toggleBookmark(event.id)} onShare={handleShare} prefersReduced={prefersReduced} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <WeeklyStatsBar events={events} prefersReduced={prefersReduced} />
          <TodaysEventsBanner events={events} onSelectDate={() => setSelectedDate(toISODate(todayStart()))} prefersReduced={prefersReduced} />

          {/* Mini Calendar Strip */}
          <div className="mb-4">
            <MiniCalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} events={events} prefersReduced={prefersReduced} />
          </div>

          {/* Category Filter Chips */}
          <div className="mb-5">
            <CategoryFilterChips active={categoryFilter} onChange={setCategoryFilter} prefersReduced={prefersReduced} />
          </div>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <motion.div initial={prefersReduced ? { opacity: 1 } : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs text-muted-foreground">Filtros ativos:</span>
              {selectedDate && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full">
                  {formatDateParts(selectedDate).day}/{formatDateParts(selectedDate).monthShort}
                  <button onClick={() => setSelectedDate(null)} className="ml-0.5 hover:text-rose-800 dark:hover:text-rose-300" aria-label="Remover filtro de data">✕</button>
                </span>
              )}
              {categoryFilter !== 'todos' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full">
                  {CATEGORY_LABELS[categoryFilter]}
                  <button onClick={() => setCategoryFilter('todos')} className="ml-0.5 hover:text-rose-800 dark:hover:text-rose-300" aria-label="Remover filtro de categoria">✕</button>
                </span>
              )}
            </motion.div>
          )}

          {/* Events Grid */}
          <AnimatePresence mode="wait">
            {filteredEvents.length > 0 ? (
              <motion.div key={`${categoryFilter}-${selectedDate}`}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
                {displayedEvents.map((event) => (
                  <EventCard key={event.id} event={event} isBookmarked={savedIds.includes(event.id)}
                    onToggleBookmark={() => toggleBookmark(event.id)} onShare={handleShare} prefersReduced={prefersReduced} />
                ))}
              </motion.div>
            ) : (
              <motion.div key="empty"
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                className="flex flex-col items-center justify-center py-16 text-center">
                <motion.span className="text-5xl mb-4"
                  animate={prefersReduced ? {} : { y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}>🔍</motion.span>
                <p className="text-base font-semibold text-muted-foreground">Nenhum evento encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">Tente alterar os filtros ou selecionar outra data.</p>
                <motion.button whileHover={prefersReduced ? {} : { scale: 1.03 }} whileTap={prefersReduced ? {} : { scale: 0.97 }}
                  onClick={() => { setCategoryFilter('todos'); setSelectedDate(null) }}
                  className="mt-4 min-h-[44px] px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold">
                  Limpar filtros
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show more */}
          {hasMore && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-center mt-6">
              <motion.button whileHover={prefersReduced ? {} : { scale: 1.03 }} whileTap={prefersReduced ? {} : { scale: 0.97 }}
                onClick={handleShowMore}
                className="r75-action-btn flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-sm font-semibold text-muted-foreground transition-colors">
                <ChevronDown className="h-4 w-4" /> Ver mais ({filteredEvents.length - showCount} restantes)
              </motion.button>
            </motion.div>
          )}

          {/* Footer */}
          {filteredEvents.length > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-center text-xs text-muted-foreground mt-6">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
              {categoryFilter !== 'todos' ? ` em ${CATEGORY_LABELS[categoryFilter]}` : ''}
              {selectedDate ? ` no dia ${formatDateParts(selectedDate).day}/${formatDateParts(selectedDate).monthShort}` : ''}
              {' '}· Dom Eliseu, PA
            </motion.p>
          )}
        </>
      )}

      {/* My Events */}
      {viewMode === 'saved' && (
        <MyEventsSection savedIds={savedIds} events={events} onRemove={toggleBookmark}
          onClearAll={clearAllSaved} onShare={handleShare} prefersReduced={prefersReduced} />
      )}

      <ShareToast visible={shareToastVisible} prefersReduced={prefersReduced} />
    </section>
  )
}
