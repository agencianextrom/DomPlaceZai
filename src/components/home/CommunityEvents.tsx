'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, MapPin, Users, ChevronRight, Clock, Filter, Sparkles } from 'lucide-react'
import { FloatingParticles } from '@/components/effects/FloatingParticles'

// ── Types ────────────────────────────────────────────────────────────────────

interface CommunityEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  category: 'feiras' | 'cultura' | 'esportes' | 'festivais' | 'gastronomia'
  icon: string
  description: string
  attendees: number
  featured: boolean
}

interface CategoryFilter {
  key: string
  label: string
  icon: string
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const communityEvents: CommunityEvent[] = [
  {
    id: '1',
    title: 'Feira de Artesanato do Centro',
    date: '2026-06-15',
    time: '08:00',
    location: 'Praça Central',
    category: 'feiras',
    icon: '🎨',
    description: 'Artesãos locais expondo trabalhos em madeira, cerâmica e tecidos. Venha apoiar o talento dom-eliseuense!',
    attendees: 234,
    featured: false,
  },
  {
    id: '2',
    title: 'Festival de Inverno 2026',
    date: '2026-07-20',
    time: '18:00',
    location: 'Ginásio Poliesportivo Municipal',
    category: 'festivais',
    icon: '🎵',
    description: 'Shows ao vivo com artistas locais, comida típica e brincadeiras para toda a família. Edição especial de 10 anos!',
    attendees: 890,
    featured: true,
  },
  {
    id: '3',
    title: 'Torneio de Futebol Amador',
    date: '2026-06-28',
    time: '09:00',
    location: 'Campo do América FC',
    category: 'esportes',
    icon: '⚽',
    description: 'Campeonato entre equipes de bairros de Dom Eliseu. Inscrições abertas para novos times.',
    attendees: 156,
    featured: false,
  },
  {
    id: '4',
    title: 'Exposição de Arte Pará',
    date: '2026-05-10',
    time: '14:00',
    location: 'Centro Cultural Dom Eliseu',
    category: 'cultura',
    icon: '🖼️',
    description: 'Exposição de obras de artistas paraenses com foco na cultura amazônica. Entrada gratuita.',
    attendees: 178,
    featured: false,
  },
  {
    id: '5',
    title: 'Festival Gastronômico Amazônico',
    date: '2026-08-05',
    time: '11:00',
    location: 'Área de Eventos da Praça',
    category: 'gastronomia',
    icon: '🍲',
    description: 'Sabores da Amazônia: tacacá, açaí, maniçoba e muito mais. Chefs locais preparando pratos típicos.',
    attendees: 445,
    featured: false,
  },
  {
    id: '6',
    title: 'Feira Agropecuária Regional',
    date: '2026-06-22',
    time: '07:00',
    location: 'Recinto de Exposições',
    category: 'feiras',
    icon: '🌾',
    description: 'Feira com animais, sementes, adubos e equipamentos rurais. Palestras sobre agricultura sustentável.',
    attendees: 312,
    featured: false,
  },
  {
    id: '7',
    title: 'Maratona Roteiro das Águas',
    date: '2026-09-12',
    time: '06:00',
    location: 'Partida: Praça Central',
    category: 'esportes',
    icon: '🏃',
    description: 'Corrida de 5km e 10km pelas ruas de Dom Eliseu. Premiação para os 3 primeiros colocados.',
    attendees: 89,
    featured: false,
  },
  {
    id: '8',
    title: 'Noite do Sertão',
    date: '2025-12-15',
    time: '20:00',
    location: 'Centro Cultural Dom Eliseu',
    category: 'cultura',
    icon: '🎸',
    description: 'Uma noite de música sertaneja com violeiros locais e viola caipira. Viola de cocho em destaque.',
    attendees: 267,
    featured: false,
  },
]

const categoryFilters: CategoryFilter[] = [
  { key: 'todos', label: 'Todos', icon: '📋' },
  { key: 'feiras', label: 'Feiras', icon: '🌾' },
  { key: 'cultura', label: 'Cultura', icon: '🎨' },
  { key: 'esportes', label: 'Esportes', icon: '⚽' },
  { key: 'festivais', label: 'Festivais', icon: '🎉' },
  { key: 'gastronomia', label: 'Gastronomia', icon: '🍲' },
]

// ── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -20,
    transition: { duration: 0.25 },
  },
}

const filterPillVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 400, damping: 25 } },
}

const shimmerVariants = {
  initial: { backgroundPosition: '-200% center' },
  animate: {
    backgroundPosition: '200% center',
    transition: { duration: 4, repeat: Infinity, ease: 'linear' as const },
  },
}

// ── Helper Functions ────────────────────────────────────────────────────────

const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MONTHS_LONG = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

function parseEventDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatEventDate(dateStr: string): { day: string; monthShort: string; monthLong: string; weekday: string; year: string; isPast: boolean } {
  const date = parseEventDate(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return {
    day: String(date.getDate()).padStart(2, '0'),
    monthShort: MONTHS_SHORT[date.getMonth()],
    monthLong: MONTHS_LONG[date.getMonth()],
    weekday: WEEKDAYS_SHORT[date.getDay()],
    year: String(date.getFullYear()),
    isPast: eventDay < today,
  }
}

function getCountdownText(dateStr: string): string | null {
  const date = parseEventDate(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffMs = eventDay.getTime() - today.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return null
  if (diffDays === 0) return 'Hoje!'
  if (diffDays === 1) return 'Amanhã!'
  if (diffDays <= 7) return `Começa em ${diffDays} dias`
  if (diffDays <= 30) return `Começa em ${Math.ceil(diffDays / 7)} semanas`
  return `Começa em ${diffDays} dias`
}

function getNextEvent(events: CommunityEvent[]): CommunityEvent | null {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const futureEvents = events
    .filter(e => {
      const d = parseEventDate(e.date)
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()) >= today
    })
    .sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime())
  return futureEvents[0] ?? null
}

// ── Sub-Components ──────────────────────────────────────────────────────────

function CalendarDateBadge({ dateStr }: { dateStr: string }) {
  const { day, monthShort, weekday, isPast } = formatEventDate(dateStr)

  return (
    <motion.div
      className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 r29-date-badge ${
        isPast
          ? 'bg-muted/50 border border-border/50'
          : 'bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20'
      }`}
      whileHover={{ scale: 1.08, rotate: -2 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
    >
      <span className="text-[10px] font-medium text-muted-foreground uppercase leading-none">{weekday}</span>
      <span className={`text-lg font-bold leading-none mt-0.5 ${isPast ? 'text-muted-foreground' : 'text-primary'}`}>{day}</span>
      <span className="text-[10px] font-medium text-muted-foreground leading-none mt-0.5">{monthShort}</span>
      {!isPast && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  )
}

function FeaturedGlowBadge({ countdown }: { countdown: string }) {
  return (
    <motion.div
      className="flex items-center gap-1.5 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 rounded-full px-3 py-1"
      animate={{ opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles className="h-3 w-3 text-primary" />
      </motion.div>
      <span className="text-[10px] font-bold text-primary">{countdown}</span>
    </motion.div>
  )
}

function EventCard({
  event,
  isNext,
}: {
  event: CommunityEvent
  isNext: boolean
}) {
  const { isPast } = formatEventDate(event.date)
  const countdown = getCountdownText(event.date)

  return (
    <motion.div
      variants={cardVariants}
      layout
      className="relative group"
    >
      {/* Gradient glow border for next event */}
      {isNext && (
        <motion.div
          className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-emerald-400 to-primary opacity-60 blur-[1px]"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      )}

      {/* Glassmorphism card */}
      <motion.div
        className={`relative overflow-hidden rounded-xl p-4 flex gap-3 r29-card-hover ${
          isPast ? 'opacity-60' : ''
        }`}
        style={{
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: isNext
            ? '1px solid rgba(16, 185, 129, 0.4)'
            : '1px solid rgba(255, 255, 255, 0.15)',
        }}
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
      >
        {/* Glass background layer */}
        <div
          className={`absolute inset-0 -z-10 ${
            isNext
              ? 'bg-gradient-to-br from-primary/8 via-emerald-500/5 to-accent/8 dark:from-primary/12 dark:via-emerald-500/8 dark:to-accent/12'
              : 'bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-white/[0.02]'
          }`}
          aria-hidden="true"
        />

        {/* Subtle animated glow for featured */}
        {isNext && (
          <motion.div
            className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br from-primary/10 to-emerald-400/10 opacity-0 blur-2xl"
            animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        )}

        {/* Calendar Date Badge */}
        <CalendarDateBadge dateStr={event.date} />

        {/* Card Content */}
        <div className="flex-1 min-w-0">
          {/* Category + Next badge */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm" aria-hidden="true">{event.icon}</span>
            <span className="text-[10px] font-medium text-muted-foreground capitalize">{event.category}</span>
            {isNext && countdown && (
              <FeaturedGlowBadge countdown={countdown} />
            )}
            {isPast && (
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                Passou
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-foreground leading-tight truncate">{event.title}</h3>

          {/* Description */}
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{event.description}</p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {event.time}h
            </span>
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="h-2.5 w-2.5" />
              <span className="truncate max-w-[120px]">{event.location}</span>
            </span>
            <span className="flex items-center gap-0.5 ml-auto">
              <Users className="h-2.5 w-2.5" />
              {event.attendees}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CommunityEvents() {
  const [activeFilter, setActiveFilter] = useState('todos')
  const [showCount, setShowCount] = useState(6)

  const nextEvent = useMemo(() => getNextEvent(communityEvents), [])

  const filteredEvents = useMemo(() => {
    let events = communityEvents
    if (activeFilter !== 'todos') {
      events = events.filter(e => e.category === activeFilter)
    }
    return events
  }, [activeFilter])

  const displayedEvents = useMemo(() => filteredEvents.slice(0, showCount), [filteredEvents, showCount])

  const hasMore = showCount < filteredEvents.length

  const handleFilterChange = useCallback((key: string) => {
    setActiveFilter(key)
    setShowCount(6)
  }, [])

  const handleShowMore = useCallback(() => {
    setShowCount(prev => Math.min(prev + 6, filteredEvents.length))
  }, [filteredEvents.length])

  return (
    <section className="mt-6 relative overflow-hidden r62-card-lift r96-community-events-card">
      {/* Floating particles in background */}
      <FloatingParticles
        count={12}
        color="oklch(0.55 0.12 155)"
        maxSize={3}
        minSize={1}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <motion.div
          className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CalendarDays className="h-4 w-4 text-white" />
        </motion.div>
        <div>
          <h2 className="text-base sm:text-lg font-bold r29-event-shimmer r62-heading-gradient">Eventos da Comunidade</h2>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Fique por dentro do que acontece em Dom Eliseu
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <motion.div
        className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1 mb-4 relative z-10"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
        initial="hidden"
        animate="visible"
      >
        {categoryFilters.map(filter => {
          const isActive = activeFilter === filter.key
          return (
            <motion.button
              key={filter.key}
              variants={filterPillVariants}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleFilterChange(filter.key)}
              className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Filter className={`h-3 w-3 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              <span className="text-sm">{filter.icon}</span>
              <span>{filter.label}</span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* "Próximo evento" section */}
      {nextEvent && activeFilter === 'todos' && (
        <motion.div
          className="mb-4 relative z-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 20, delay: 0.1 }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </motion.div>
            <span className="text-xs font-bold text-primary">Próximo evento</span>
          </div>
          <EventCard event={nextEvent} isNext />
        </motion.div>
      )}

      {/* Events Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {displayedEvents
            .filter(e => nextEvent ? e.id !== nextEvent.id : true)
            .map(event => (
              <EventCard key={event.id} event={event} isNext={false} />
            ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {filteredEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center relative z-10"
        >
          <motion.span
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-4xl mb-3"
          >
            📅
          </motion.span>
          <p className="text-sm font-semibold text-muted-foreground">
            Nenhum evento nesta categoria
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tente selecionar outra categoria ou volte mais tarde
          </p>
        </motion.div>
      )}

      {/* "Ver mais" button */}
      {hasMore && (
        <motion.div
          className="flex justify-center mt-4 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={handleShowMore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/70 hover:bg-secondary text-sm font-medium text-foreground transition-colors shadow-sm r29-attend-pulse"
          >
            <span>Ver mais</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-xs text-muted-foreground">
              ({filteredEvents.length - showCount} restantes)
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Shimmer text footer */}
      <motion.div
        className="flex justify-center mt-4 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.span
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="text-[10px] text-muted-foreground font-medium"
          style={{
            backgroundImage: 'linear-gradient(90deg, hsl(var(--muted-foreground)) 0%, hsl(var(--primary)) 50%, hsl(var(--muted-foreground)) 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {communityEvents.length} eventos na comunidade · Dom Eliseu, PA
        </motion.span>
      </motion.div>
    </section>
  )
}
