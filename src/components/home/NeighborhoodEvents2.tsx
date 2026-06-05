'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, MapPin, Users, Clock, ChevronRight, ChevronLeft,
  ThumbsUp, Eye, X, Share2, CalendarPlus, Plus, Sun, Cloud,
  CloudRain, Wind, Thermometer, Star, Heart, ExternalLink,
  Map, Grid3X3, List, Camera, Image as ImageIcon, Music,
  Trophy, Palette, UtensilsCrossed, Laptop, Activity, Filter,
  CheckCircle2, HandMetal, CircleX, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// ── Types ────────────────────────────────────────────────────────────────────

type EventCategory = 'feira' | 'musica' | 'esporte' | 'gastronomia' | 'arte' | 'tecnologia' | 'saude'
type ReactionType = 'going' | 'interested' | 'not_going'
type ViewMode = 'list' | 'calendar' | 'map'

interface NeighborhoodEvent {
  id: string
  title: string
  date: string
  time: string
  endTime: string
  location: string
  coordinates: { x: number; y: number }
  category: EventCategory
  icon: string
  description: string
  fullDescription: string
  coverImage: string | null
  organizer: { name: string; avatar: string; verified: boolean }
  attendees: number
  goingCount: number
  interestedCount: number
  notGoingCount: number
  featured: boolean
  isOutdoor: boolean
  weather?: { temp: string; condition: 'sunny' | 'cloudy' | 'rainy'; wind: string; humidity: string }
  pastPhotos: string[]
  tags: string[]
}

interface CategoryConfig {
  key: EventCategory | 'all'
  label: string
  icon: React.ReactNode
  emoji: string
}

// ── Animation Variants ───────────────────────────────────────────────────────

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 24 }
const springSoft = { type: 'spring' as const, stiffness: 200, damping: 20 }

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.92, y: -16, transition: { duration: 0.2 } },
}

const filterVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 400, damping: 22 } },
}

const spotlightVariants = {
  enter: { opacity: 0, scale: 0.92 },
  center: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 1.08, transition: { duration: 0.4 } },
}

// ── Mock Data: 12 events with varied categories ─────────────────────────────

const mockEvents: NeighborhoodEvent[] = [
  {
    id: 'ev-1', title: 'Feira de Artesanato do Bairro', date: '2025-08-15',
    time: '08:00', endTime: '17:00', location: 'Praça Central',
    coordinates: { x: 45, y: 30 }, category: 'feira', icon: '🎨',
    description: 'Artesãos locais com peças exclusivas em madeira, cerâmica e tecido.',
    fullDescription: 'A tradicional Feira de Artesanato do Bairro reúne mais de 50 artesãos locais que apresentam trabalhos únicos em madeira, cerâmica, tecido e muito mais. Venha descobrir talentos da região e levar peças exclusivas para casa. Evento gratuito com estacionamento disponível.',
    coverImage: null, organizer: { name: 'Maria Santos', avatar: '👩‍🎨', verified: true },
    attendees: 234, goingCount: 89, interestedCount: 112, notGoingCount: 12,
    featured: true, isOutdoor: true,
    weather: { temp: '28°C', condition: 'sunny', wind: '12 km/h', humidity: '65%' },
    pastPhotos: ['🎨', '🏺', '🧵'],
    tags: ['artesanato', 'cultura', 'gratuito'],
  },
  {
    id: 'ev-2', title: 'Sarau Musical Noturno', date: '2025-08-22',
    time: '20:00', endTime: '23:00', location: 'Centro Cultural Dom Eliseu',
    coordinates: { x: 60, y: 55 }, category: 'musica', icon: '🎵',
    description: 'Noite de MPB, forró e viola caipira com artistas da região.',
    fullDescription: 'Um sarau especial reunindo músicos locais para uma noite inesquecível de MPB, forró e viola caipira. Bar com drinks e petiscos típicos. Ingressos a R$ 15 antecipado.',
    coverImage: null, organizer: { name: 'João Silva', avatar: '🎸', verified: true },
    attendees: 178, goingCount: 56, interestedCount: 98, notGoingCount: 8,
    featured: false, isOutdoor: false, pastPhotos: ['🎵', '🎶', '🎸'],
    tags: ['música', 'sarau', 'cultura'],
  },
  {
    id: 'ev-3', title: 'Torneio de Futebol Amador', date: '2025-09-06',
    time: '09:00', endTime: '16:00', location: 'Campo do América FC',
    coordinates: { x: 25, y: 70 }, category: 'esporte', icon: '⚽',
    description: 'Campeonato entre equipes dos bairros de Dom Eliseu.',
    fullDescription: 'O tradicional torneio amador retorna com 8 equipes de diferentes bairros. Inscrições abertas até o dia 01/09. Premiação para os 3 primeiros colocados com troféus e cestas básicas.',
    coverImage: null, organizer: { name: 'Pedro Lima', avatar: '🏆', verified: false },
    attendees: 312, goingCount: 145, interestedCount: 78, notGoingCount: 5,
    featured: false, isOutdoor: true,
    weather: { temp: '31°C', condition: 'sunny', wind: '8 km/h', humidity: '55%' },
    pastPhotos: ['⚽', '🏆', '🏃'],
    tags: ['futebol', 'esporte', 'campeonato'],
  },
  {
    id: 'ev-4', title: 'Festival Gastronômico Amazônico', date: '2025-09-14',
    time: '11:00', endTime: '21:00', location: 'Área de Eventos da Praça',
    coordinates: { x: 50, y: 35 }, category: 'gastronomia', icon: '🍲',
    description: 'Sabores da Amazônia: tacacá, açaí, maniçoba e pratos típicos.',
    fullDescription: 'Chefs locais preparam pratos tradicionais da culinária amazônica. Degustações gratuitas, oficinas de cozinha e concursos de pratos. Estão previstos também barracas de açaí, tacacá, cupuaçu e muito mais.',
    coverImage: null, organizer: { name: 'Chef Ana', avatar: '👩‍🍳', verified: true },
    attendees: 445, goingCount: 198, interestedCount: 167, notGoingCount: 22,
    featured: true, isOutdoor: true,
    weather: { temp: '30°C', condition: 'cloudy', wind: '15 km/h', humidity: '78%' },
    pastPhotos: ['🍲', '🥘', '🧑‍🍳'],
    tags: ['gastronomia', 'amazônia', 'comida'],
  },
  {
    id: 'ev-5', title: 'Exposição de Arte Pará', date: '2025-10-05',
    time: '14:00', endTime: '20:00', location: 'Galeria Municipal',
    coordinates: { x: 70, y: 45 }, category: 'arte', icon: '🖼️',
    description: 'Obras de artistas paraenses com foco na cultura amazônica.',
    fullDescription: 'Exposição coletiva com 30 obras de 12 artistas paraenses. Pinturas, esculturas e instalações que celebram a rica cultura amazônica. Entrada gratuita.',
    coverImage: null, organizer: { name: 'Casa da Cultura', avatar: '🏛️', verified: true },
    attendees: 189, goingCount: 67, interestedCount: 88, notGoingCount: 15,
    featured: false, isOutdoor: false, pastPhotos: ['🖼️', '🎨', '🎭'],
    tags: ['arte', 'exposição', 'cultura'],
  },
  {
    id: 'ev-6', title: 'Workshop de Tecnologia Livre', date: '2025-08-30',
    time: '10:00', endTime: '16:00', location: 'Biblioteca Municipal',
    coordinates: { x: 35, y: 50 }, category: 'tecnologia', icon: '💻',
    description: 'Linux, programação e internet segura para a comunidade.',
    fullDescription: 'Workshop gratuito sobre software livre, introdução à programação e boas práticas de segurança digital. Vagas limitadas a 40 participantes. Traga seu notebook!',
    coverImage: null, organizer: { name: 'Grupo Linux DE', avatar: '🤓', verified: false },
    attendees: 78, goingCount: 34, interestedCount: 29, notGoingCount: 3,
    featured: false, isOutdoor: false, pastPhotos: ['💻', '🖥️', '⌨️'],
    tags: ['tecnologia', 'educação', 'gratuito'],
  },
  {
    id: 'ev-7', title: 'Mutirão de Saúde da Família', date: '2025-09-20',
    time: '07:00', endTime: '15:00', location: 'Posto de Saúde Central',
    coordinates: { x: 55, y: 60 }, category: 'saude', icon: '🏥',
    description: 'Consultas gratuitas, vacinação e exames preventivos.',
    fullDescription: 'Mutirão de saúde com consultas médicas, vacinação, aferição de pressão e exames preventivos. Documentação necessária: RG e CPF. Atendimento por ordem de chegada.',
    coverImage: null, organizer: { name: 'Secretaria de Saúde', avatar: '⚕️', verified: true },
    attendees: 256, goingCount: 120, interestedCount: 95, notGoingCount: 8,
    featured: false, isOutdoor: false, pastPhotos: ['🏥', '💊', '🩺'],
    tags: ['saúde', 'gratuito', 'prevenção'],
  },
  {
    id: 'ev-8', title: 'Feira Agropecuária Regional', date: '2025-10-12',
    time: '07:00', endTime: '18:00', location: 'Recinto de Exposições',
    coordinates: { x: 20, y: 40 }, category: 'feira', icon: '🌾',
    description: 'Animais, sementes, adubos e palestras sobre agricultura.',
    fullDescription: 'A maior feira agropecuária da região com exposição de animais, venda de sementes e implementos, palestras sobre agricultura sustentável e demonstrações de técnicas modernas.',
    coverImage: null, organizer: { name: 'Sindicato Rural', avatar: '🚜', verified: true },
    attendees: 312, goingCount: 134, interestedCount: 105, notGoingCount: 18,
    featured: false, isOutdoor: true,
    weather: { temp: '29°C', condition: 'cloudy', wind: '18 km/h', humidity: '70%' },
    pastPhotos: ['🌾', '🐄', '🌻'],
    tags: ['agricultura', 'feira', 'sustentabilidade'],
  },
  {
    id: 'ev-9', title: 'Corrida Roteiro das Águas', date: '2025-11-08',
    time: '06:00', endTime: '10:00', location: 'Partida: Praça Central',
    coordinates: { x: 45, y: 30 }, category: 'esporte', icon: '🏃',
    description: 'Corrida de 5km e 10km pelas ruas de Dom Eliseu.',
    fullDescription: 'Maratona com percursos de 5km e 10km. Kit com camiseta e medalha para todos os participantes. Premiação em dinheiro para os 3 primeiros de cada categoria.',
    coverImage: null, organizer: { name: 'Sport Club DE', avatar: '🏃‍♂️', verified: true },
    attendees: 156, goingCount: 89, interestedCount: 45, notGoingCount: 7,
    featured: false, isOutdoor: true,
    weather: { temp: '25°C', condition: 'rainy', wind: '22 km/h', humidity: '85%' },
    pastPhotos: ['🏃', '🏅', '📸'],
    tags: ['corrida', 'esporte', 'maratona'],
  },
  {
    id: 'ev-10', title: 'Noite do Jazz & Bossa Nova', date: '2025-08-28',
    time: '21:00', endTime: '00:00', location: 'Bar do Zé',
    coordinates: { x: 80, y: 38 }, category: 'musica', icon: '🎷',
    description: 'Jazz ao vivo com trio local e clássicos da bossa nova.',
    fullDescription: 'Uma noite sofisticada com o Trio Pará tocando clássicos do jazz e da bossa nova. Ambientação intimista, drinks autorais e menu especial. Reservas pelo WhatsApp.',
    coverImage: null, organizer: { name: 'Bar do Zé', avatar: '🍸', verified: true },
    attendees: 65, goingCount: 28, interestedCount: 32, notGoingCount: 4,
    featured: false, isOutdoor: false, pastPhotos: ['🎷', '🎶', '🎤'],
    tags: ['jazz', 'bossa nova', 'noite'],
  },
  {
    id: 'ev-11', title: 'Hackathon Dom Eliseu', date: '2025-09-27',
    time: '08:00', endTime: '20:00', location: 'Escola Técnica Municipal',
    coordinates: { x: 30, y: 55 }, category: 'tecnologia', icon: '🚀',
    description: 'Maratona de programação de 12 horas com prêmios.',
    fullDescription: 'Competição de desenvolvimento de software em equipes de 3-5 pessoas. Tema surpresa no dia! Prêmios: 1º lugar R$1000, 2º R$500, 3º R$250. Inscrições gratuitas.',
    coverImage: null, organizer: { name: 'CodePA', avatar: '👨‍💻', verified: false },
    attendees: 45, goingCount: 32, interestedCount: 18, notGoingCount: 2,
    featured: true, isOutdoor: false, pastPhotos: ['💻', '🎯', '🥇'],
    tags: ['hackathon', 'programação', 'tecnologia'],
  },
  {
    id: 'ev-12', title: 'Aula de Yoga ao Ar Livre', date: '2025-08-17',
    time: '07:00', endTime: '08:30', location: 'Parque Municipal',
    coordinates: { x: 65, y: 72 }, category: 'saude', icon: '🧘',
    description: 'Sessão gratuita de yoga matinal no parque para todos.',
    fullDescription: 'Aula de yoga ao ar livre conduzida pela instrutora Dra. Carla Mendes. Todos os níveis são bem-vindos! Traga seu tapete e garrafa de água. Evento semanal aos domingos.',
    coverImage: null, organizer: { name: 'Dra. Carla', avatar: '🧘‍♀️', verified: true },
    attendees: 89, goingCount: 45, interestedCount: 28, notGoingCount: 6,
    featured: false, isOutdoor: true,
    weather: { temp: '26°C', condition: 'sunny', wind: '6 km/h', humidity: '72%' },
    pastPhotos: ['🧘', '🌳', '☀️'],
    tags: ['yoga', 'bem-estar', 'gratuito'],
  },
]

const categories: CategoryConfig[] = [
  { key: 'all', label: 'Todos', icon: <Filter className="h-3 w-3" />, emoji: '📋' },
  { key: 'feira', label: 'Feira', icon: <Star className="h-3 w-3" />, emoji: '🌾' },
  { key: 'musica', label: 'Música', icon: <Music className="h-3 w-3" />, emoji: '🎵' },
  { key: 'esporte', label: 'Esporte', icon: <Trophy className="h-3 w-3" />, emoji: '⚽' },
  { key: 'gastronomia', label: 'Gastronomia', icon: <UtensilsCrossed className="h-3 w-3" />, emoji: '🍲' },
  { key: 'arte', label: 'Arte', icon: <Palette className="h-3 w-3" />, emoji: '🎨' },
  { key: 'tecnologia', label: 'Tecnologia', icon: <Laptop className="h-3 w-3" />, emoji: '💻' },
  { key: 'saude', label: 'Saúde', icon: <Activity className="h-3 w-3" />, emoji: '🏥' },
]

// ── Helper Functions ──────────────────────────────────────────────────────────

const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MONTHS_LONG = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDateParts(dateStr: string) {
  const d = parseDate(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return {
    day: String(d.getDate()).padStart(2, '0'),
    monthShort: MONTHS_SHORT[d.getMonth()],
    monthLong: MONTHS_LONG[d.getMonth()],
    weekday: WEEKDAYS[d.getDay()],
    year: d.getFullYear(),
    isPast: eventDay < today,
    isToday: eventDay.getTime() === today.getTime(),
  }
}

function getCountdown(dateStr: string, timeStr: string) {
  const d = parseDate(dateStr)
  const [h, m] = timeStr.split(':').map(Number)
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return { text: 'Evento em andamento', isLive: true, days: 0, hours: 0, minutes: 0 }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 30) return { text: `${days} dias`, isLive: false, days, hours, minutes }
  if (days > 0) return { text: `${days}d ${hours}h`, isLive: false, days, hours, minutes }
  if (hours > 0) return { text: `${hours}h ${minutes}m`, isLive: false, days, hours, minutes }
  return { text: `${minutes}min`, isLive: false, days, hours, minutes }
}

function getWeatherIcon(condition: string) {
  switch (condition) {
    case 'sunny': return <Sun className="h-4 w-4" />
    case 'cloudy': return <Cloud className="h-4 w-4" />
    case 'rainy': return <CloudRain className="h-4 w-4" />
    default: return <Sun className="h-4 w-4" />
  }
}

function getWeatherColor(condition: string): string {
  switch (condition) {
    case 'sunny': return '#f59e0b'
    case 'cloudy': return '#6b7280'
    case 'rainy': return '#3b82f6'
    default: return '#f59e0b'
  }
}

// ── Sub-Components ───────────────────────────────────────────────────────────

function DateBadge({ dateStr }: { dateStr: string }) {
  const { day, monthShort, weekday, isPast, isToday } = formatDateParts(dateStr)
  return (
    <motion.div
      className={`r44-date-badge relative flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 ${
        isToday
          ? 'r44-date-today'
          : isPast
            ? 'bg-muted/50 border border-border/50'
            : 'bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20'
      }`}
      whileHover={{ scale: 1.06, rotate: -2 }}
      transition={springTransition}
    >
      <span className="text-[10px] font-medium text-muted-foreground uppercase leading-none">{weekday}</span>
      <span className={`text-lg font-bold leading-none mt-0.5 ${isPast ? 'text-muted-foreground' : isToday ? 'text-white' : 'text-primary'}`}>{day}</span>
      <span className="text-[10px] font-medium text-muted-foreground leading-none mt-0.5">{monthShort}</span>
      {isToday && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
        />
      )}
    </motion.div>
  )
}

function CountdownDisplay({ dateStr, timeStr }: { dateStr: string; timeStr: string }) {
  const { days, hours, minutes, isLive } = getCountdown(dateStr, timeStr)
  if (isLive) {
    return (
      <motion.div
        className="r44-countdown-live flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <Zap className="h-3 w-3 text-red-500" />
        <span className="text-[10px] font-bold text-red-500">AO VIVO</span>
      </motion.div>
    )
  }
  if (days === 0 && hours === 0 && minutes === 0) return null
  return (
    <motion.div
      className="r44-countdown flex items-center gap-1"
      key={`${days}-${hours}-${minutes}`}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springSoft}
    >
      <Clock className="h-3 w-3 text-primary" />
      <span className="text-[10px] font-semibold text-primary">
        {days > 0 && <>{days}d </>}
        {hours > 0 && <>{hours}h </>}
        {minutes > 0 && <>{minutes}m</>}
      </span>
    </motion.div>
  )
}

function ReactionButtons({ event }: { event: NeighborhoodEvent }) {
  const [reaction, setReaction] = useState<ReactionType | null>(null)
  const [counts, setCounts] = useState({ going: event.goingCount, interested: event.interestedCount, notGoing: event.notGoingCount })

  const handleReaction = useCallback((type: ReactionType) => {
    if (reaction === type) {
      setCounts(prev => ({ ...prev, [type]: prev[type] - 1 }))
      setReaction(null)
    } else {
      if (reaction) {
        setCounts(prev => ({ ...prev, [reaction]: prev[reaction] - 1 }))
      }
      setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }))
      setReaction(type)
    }
  }, [reaction])

  const reactionConfig: { type: ReactionType; icon: React.ReactNode; label: string; color: string }[] = [
    { type: 'going', icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Vou', color: '#10b981' },
    { type: 'interested', icon: <Star className="h-3.5 w-3.5" />, label: 'Interesse', color: '#f59e0b' },
    { type: 'not_going', icon: <CircleX className="h-3.5 w-3.5" />, label: 'Não vou', color: '#6b7280' },
  ]

  return (
    <div className="r44-reactions flex items-center gap-1.5 mt-2">
      {reactionConfig.map(({ type, icon, label, color }) => {
        const isActive = reaction === type
        return (
          <motion.button
            key={type}
            onClick={() => handleReaction(type)}
            className={`r44-reaction-btn flex items-center gap-1 px-2 py-1 min-h-[44px] rounded-full text-[10px] font-medium border transition-colors ${
              isActive ? 'border-current' : 'border-border/50 bg-secondary/50 text-muted-foreground hover:border-border'
            }`}
            style={isActive ? { color, backgroundColor: `${color}18`, borderColor: `${color}40` } : undefined}
            whileTap={{ scale: 0.92 }}
            transition={springTransition}
          >
            {icon}
            <span>{label}</span>
            <motion.span
              key={counts[type]}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={springTransition}
              className="font-bold"
            >
              {counts[type]}
            </motion.span>
          </motion.button>
        )
      })}
    </div>
  )
}

function RSVPButton({ eventId }: { eventId: string }) {
  const [rsvpd, setRsvpd] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const handleRSVP = () => {
    if (rsvpd) { setRsvpd(false); return }
    setConfirming(true)
    setTimeout(() => { setConfirming(false); setRsvpd(true) }, 800)
  }

  return (
    <motion.div whileTap={{ scale: 0.95 }} className="r44-rsvp-btn">
      <AnimatePresence mode="wait">
        {rsvpd ? (
          <motion.div
            key="confirmed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={springTransition}
          >
            <Button size="sm" variant="outline" className="h-8 min-h-[44px] text-xs gap-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/5" onClick={handleRSVP}>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Confirmado
            </Button>
          </motion.div>
        ) : confirming ? (
          <motion.div
            key="confirming"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={springTransition}
          >
            <Button size="sm" className="h-8 min-h-[44px] text-xs gap-1.5 bg-primary text-primary-foreground" disabled>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
              >
                <Star className="h-3.5 w-3.5" />
              </motion.div>
              Confirmando...
            </Button>
          </motion.div>
        ) : (
          <motion.div key="rsvp" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={springTransition}>
            <Button size="sm" className="h-8 min-h-[44px] text-xs gap-1.5 bg-primary text-primary-foreground btn-glow" onClick={handleRSVP}>
              <HandMetal className="h-3.5 w-3.5" />
              Confirmar presença
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function WeatherChip({ weather }: { weather: NeighborhoodEvent['weather'] }) {
  if (!weather) return null
  const color = getWeatherColor(weather.condition)
  return (
    <motion.div
      className="r44-weather-chip flex items-center gap-1.5 px-2 py-1 rounded-full border border-border/50 bg-secondary/40"
      whileHover={{ scale: 1.04 }}
      transition={springSoft}
    >
      <span style={{ color }}>{getWeatherIcon(weather.condition)}</span>
      <span className="text-[10px] font-medium text-muted-foreground">{weather.temp}</span>
      <Wind className="h-3 w-3 text-muted-foreground/60" />
      <span className="text-[10px] text-muted-foreground/60">{weather.wind}</span>
      <Thermometer className="h-3 w-3 text-muted-foreground/60" />
      <span className="text-[10px] text-muted-foreground/60">{weather.humidity}</span>
    </motion.div>
  )
}

function ShareButtons({ event }: { event: NeighborhoodEvent }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: event.description, url: '#' })
      } catch { /* user cancelled */ }
    }
  }

  const generateICS = () => {
    const d = parseDate(event.date)
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    const content = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:${dateStr}T${event.time.replace(':', '')}00\nSUMMARY:${event.title}\nLOCATION:${event.location}\nEND:VEVENT\nEND:VCALENDAR`
    const blob = new Blob([content], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${event.id}.ics`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="r44-share-btns flex items-center gap-1">
      <motion.div whileTap={{ scale: 0.92 }}>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 min-h-[44px] min-w-[44px] active:scale-95 transition-transform text-muted-foreground hover:text-primary" onClick={handleShare}>
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </motion.div>
      <motion.div whileTap={{ scale: 0.92 }}>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 min-h-[44px] min-w-[44px] active:scale-95 transition-transform text-muted-foreground hover:text-primary" onClick={generateICS}>
          <CalendarPlus className="h-3.5 w-3.5" />
        </Button>
      </motion.div>
    </div>
  )
}

// Event card with cover image + emoji fallback
function EventCard({ event, index }: { event: NeighborhoodEvent; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const { isPast } = formatDateParts(event.date)
  const countdown = getCountdown(event.date, event.time)
  const [selectedEvent, setSelectedEvent] = useState<NeighborhoodEvent | null>(null)

  return (
    <>
      <motion.div variants={cardVariants} layout className="r44-event-card relative group">
        <motion.div
          className={`relative overflow-hidden rounded-xl border r44-card-glass ${isPast ? 'opacity-55' : ''}`}
          style={{
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
          whileHover={{ y: -3, scale: 1.01 }}
          transition={springTransition}
          onClick={() => setSelectedEvent(event)}
          role="button"
          tabIndex={0}
          aria-label={`Ver detalhes: ${event.title}`}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 -z-10 ${isPast ? 'bg-muted/20' : 'bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-white/[0.02]'}`} />

          {/* Cover image / emoji fallback */}
          <div className="r44-cover-image relative h-32 rounded-t-xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5">
            {event.coverImage ? (
              <img src={event.coverImage} alt="Imagem do evento" className="w-full h-full object-cover" />
            ) : (
              <div className="r44-emoji-fallback w-full h-full flex items-center justify-center">
                <motion.span
                  className="text-5xl"
                  animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const, delay: index * 0.3 }}
                >
                  {event.icon}
                </motion.span>
              </div>
            )}
            {/* Date badge overlay */}
            <div className="absolute top-2 left-2">
              <DateBadge dateStr={event.date} />
            </div>
            {/* Category badge */}
            <div className="absolute top-2 right-2">
              <span className="r44-cat-badge text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/30 text-white backdrop-blur-sm">
                {categories.find(c => c.key === event.category)?.emoji} {categories.find(c => c.key === event.category)?.label}
              </span>
            </div>
          </div>

          {/* Card content */}
          <div className="p-3">
            <h3 className="text-sm font-bold text-foreground leading-tight truncate">{event.title}</h3>
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{event.description}</p>

            {/* Meta row */}
            <div className="r44-meta flex items-center gap-2.5 mt-2 text-[10px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{event.time}h - {event.endTime}h</span>
              <span className="flex items-center gap-0.5 truncate max-w-[140px]"><MapPin className="h-2.5 w-2.5" />{event.location}</span>
            </div>

            {/* Weather chip for outdoor events */}
            {event.isOutdoor && event.weather && <div className="mt-2"><WeatherChip weather={event.weather} /></div>}

            {/* Countdown */}
            {!isPast && (
              <div className="mt-2">
                <CountdownDisplay dateStr={event.date} timeStr={event.time} />
              </div>
            )}

            {/* Reaction buttons */}
            <ReactionButtons event={event} />

            {/* RSVP + share row */}
            <div className="r44-actions flex items-center justify-between mt-2">
              <RSVPButton eventId={event.id} />
              <ShareButtons event={event} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Detail dialog */}
      <EventDetailDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  )
}

// Event detail dialog with description, organizer, attendees, photos
function EventDetailDialog({ event, onClose }: { event: NeighborhoodEvent | null; onClose: () => void }) {
  if (!event) return null
  const { isPast, monthLong, year: yr } = formatDateParts(event.date)
  const attendeeAvatars = ['👤', '👩', '👨', '👧', '🧑', '👩‍🦰', '👨‍🦱', '👩‍🦳']

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="r44-detail-dialog max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">{event.icon}</span>
            {event.title}
          </DialogTitle>
        </DialogHeader>

        {/* Organizer */}
        <div className="r44-organizer flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
          <span className="text-3xl">{event.organizer.avatar}</span>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold">{event.organizer.name}</span>
              {event.organizer.verified && <span className="text-primary text-xs">✓</span>}
            </div>
            <span className="text-[11px] text-muted-foreground">Organizador</span>
          </div>
          <RSVPButton eventId={event.id} />
        </div>

        {/* Full description */}
        <div className="r44-desc">
          <p className="text-sm text-foreground/90 leading-relaxed">{event.fullDescription}</p>
        </div>

        {/* Info grid */}
        <div className="r44-info-grid grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <CalendarDays className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-semibold">{formatDateParts(event.date).day} de {monthLong}, {yr}</p>
              <p className="text-[10px] text-muted-foreground">{event.time}h - {event.endTime}h</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <MapPin className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold truncate">{event.location}</p>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <Users className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold">{event.attendees} pessoas interessadas</p>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <Heart className="h-4 w-4 text-primary" />
            <ReactionButtons event={event} />
          </div>
        </div>

        {/* Weather for outdoor */}
        {event.isOutdoor && event.weather && (
          <div className="r44-weather-detail flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
            <span className="text-3xl">{event.weather.condition === 'sunny' ? '☀️' : event.weather.condition === 'cloudy' ? '⛅' : '🌧️'}</span>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="text-center">
                <Thermometer className="h-3 w-3 text-muted-foreground mx-auto" />
                <p className="text-xs font-bold">{event.weather.temp}</p>
              </div>
              <div className="text-center">
                <Wind className="h-3 w-3 text-muted-foreground mx-auto" />
                <p className="text-xs font-bold">{event.weather.wind}</p>
              </div>
              <div className="text-center">
                <span className="text-xs">💧</span>
                <p className="text-xs font-bold">{event.weather.humidity}</p>
              </div>
            </div>
          </div>
        )}

        {/* Attendee avatars */}
        <div className="r44-attendees">
          <p className="text-xs font-semibold mb-2">Participantes</p>
          <div className="flex items-center gap-1 flex-wrap">
            {attendeeAvatars.slice(0, Math.min(event.goingCount, 8)).map((avatar, i) => (
              <motion.div
                key={i}
                className="h-8 w-8 rounded-full bg-secondary/60 flex items-center justify-center border-2 border-background"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, ...springTransition }}
              >
                <span className="text-sm">{avatar}</span>
              </motion.div>
            ))}
            {event.goingCount > 8 && (
              <motion.div
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, ...springTransition }}
              >
                <span className="text-[10px] font-bold text-primary">+{event.goingCount - 8}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Past photos gallery */}
        {event.pastPhotos.length > 0 && (
          <div className="r44-photos-gallery">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1">
              <Camera className="h-3.5 w-3.5" /> Fotos
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {event.pastPhotos.map((photo, i) => (
                <motion.div
                  key={i}
                  className="r44-photo-thumb h-20 rounded-lg bg-gradient-to-br from-primary/8 to-accent/8 border border-border/30 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  transition={springSoft}
                >
                  <span className="text-3xl">{photo}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="r44-tags flex items-center gap-1.5 flex-wrap">
          {event.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0 bg-secondary/50">{tag}</Badge>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
          <ShareButtons event={event} />
          <div className="flex-1" />
          <Badge variant="outline" className="text-[10px] gap-1">
            <ExternalLink className="h-3 w-3" /> Evento #{event.id}
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Featured event spotlight with auto-rotate
function FeaturedSpotlight({ events }: { events: NeighborhoodEvent[] }) {
  const [current, setCurrent] = useState(0)
  const featured = events.filter(e => e.featured && !formatDateParts(e.date).isPast)

  useEffect(() => {
    if (featured.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % featured.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [featured.length])

  if (featured.length === 0) return null

  const event = featured[current]
  const countdown = getCountdown(event.date, event.time)

  return (
    <div className="r44-spotlight relative mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}>
          <Zap className="h-3.5 w-3.5 text-primary" />
        </motion.div>
        <span className="text-xs font-bold text-primary">Destaque</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={event.id}
          variants={spotlightVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="r44-hero-card relative overflow-hidden rounded-2xl"
        >
          {/* Hero background */}
          <div className="r44-hero-bg relative h-48 sm:h-56 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                className="text-8xl sm:text-9xl opacity-30"
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
              >
                {event.icon}
              </motion.span>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="r44-hero-content relative px-4 pb-4 -mt-12 z-10">
            <div className="flex items-start gap-3">
              <DateBadge dateStr={event.date} />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">{event.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{event.location}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{event.time}h</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{event.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <CountdownDisplay dateStr={event.date} timeStr={event.time} />
              {event.isOutdoor && event.weather && <WeatherChip weather={event.weather} />}
              <div className="flex-1" />
              <RSVPButton eventId={event.id} />
              <ShareButtons event={event} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Mini calendar grid view
function MiniCalendarView({ events }: { events: NeighborhoodEvent[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = now.getDate()

  const eventDates = useMemo(() => {
    const map = {} as Record<string, NeighborhoodEvent[]>
    events.forEach(e => {
      const d = parseDate(e.date)
      if (d.getMonth() === month && d.getFullYear() === year) {
        const key = String(d.getDate())
        const arr = map[key] || []
        arr.push(e)
        map[key] = arr
      }
    })
    return map
  }, [events, month, year])

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1
    return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null
  })

  const selectedEvents = selectedDate ? (eventDates[selectedDate] || []) : events.filter(e => !formatDateParts(e.date).isPast)

  return (
    <div className="r44-calendar">
      {/* Calendar header */}
      <div className="r44-cal-header flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold">{MONTHS_LONG[month]} {year}</h4>
        <Badge variant="outline" className="text-[10px]">{Object.keys(eventDates).length} dias com eventos</Badge>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="h-10" />
          const hasEvents = String(day) in eventDates
          const isToday = day === today
          const isSelected = selectedDate === String(day)
          return (
            <motion.button
              key={day}
              onClick={() => setSelectedDate(prev => prev === String(day) ? null : String(day))}
              className={`r44-cal-day relative h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : isToday
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : hasEvents
                      ? 'bg-secondary/50 text-foreground hover:bg-secondary'
                      : 'text-muted-foreground/40'
              }`}
              whileTap={{ scale: 0.9 }}
              transition={springSoft}
            >
              {day}
              {hasEvents && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Events for selected date */}
      <div className="mt-3">
        <p className="text-[11px] font-semibold text-muted-foreground mb-2">
          {selectedDate ? `${selectedDate} de ${MONTHS_SHORT[month]}` : 'Próximos eventos'} ({selectedEvents.length})
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {selectedEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: i * 0.04, ...springSoft }}
                className="r44-cal-event flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border/20"
              >
                <span className="text-xl">{event.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{event.title}</p>
                  <p className="text-[10px] text-muted-foreground">{event.time}h · {event.location}</p>
                </div>
                <CountdownDisplay dateStr={event.date} timeStr={event.time} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Neighborhood map view (mock SVG)
function NeighborhoodMapView({ events }: { events: NeighborhoodEvent[] }) {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null)
  const visibleEvents = events.filter(e => !formatDateParts(e.date).isPast)

  return (
    <div className="r44-map relative">
      <div className="flex items-center gap-1.5 mb-3">
        <Map className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold">Mapa do Bairro</span>
        <Badge variant="secondary" className="text-[10px]">{visibleEvents.length} eventos</Badge>
      </div>

      <div className="r44-map-container relative rounded-xl overflow-hidden border border-border/30 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10" style={{ height: 280 }}>
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Streets */}
          <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
          <line x1="20" y1="20" x2="80" y2="80" stroke="rgba(0,0,0,0.05)" strokeWidth="1.5" />
          <line x1="20" y1="80" x2="80" y2="20" stroke="rgba(0,0,0,0.05)" strokeWidth="1.5" />

          {/* Blocks */}
          <rect x="25" y="25" width="20" height="20" rx="3" fill="rgba(0,0,0,0.03)" />
          <rect x="55" y="25" width="20" height="20" rx="3" fill="rgba(0,0,0,0.03)" />
          <rect x="25" y="55" width="20" height="20" rx="3" fill="rgba(0,0,0,0.03)" />
          <rect x="55" y="55" width="20" height="20" rx="3" fill="rgba(0,0,0,0.03)" />

          {/* Park area */}
          <rect x="60" y="62" width="25" height="25" rx="6" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
          <text x="72" y="76" textAnchor="middle" fontSize="3.5" fill="rgba(16,185,129,0.5)">🌳 Parque</text>

          {/* Plaza */}
          <circle cx="45" cy="35" r="8" fill="rgba(245,158,11,0.06)" stroke="rgba(245,158,11,0.12)" strokeWidth="0.5" />
          <text x="45" y="37" textAnchor="middle" fontSize="3" fill="rgba(245,158,11,0.5)">Praça</text>

          {/* Event pins */}
          {visibleEvents.map((event, i) => (
            <g key={event.id}>
              {/* Pulse ring */}
              <circle
                cx={event.coordinates.x} cy={event.coordinates.y} r="4"
                fill="rgba(16,185,129,0.1)"
                className="r44-map-pulse"
              >
                <animate attributeName="r" values="4;7;4" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
              </circle>
              {/* Pin */}
              <motion.circle
                cx={event.coordinates.x} cy={event.coordinates.y}
                r={hoveredPin === event.id ? 3.5 : 2.5}
                fill={hoveredPin === event.id ? '#10b981' : 'rgba(16,185,129,0.8)'}
                stroke="#fff"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredPin(event.id)}
                onMouseLeave={() => setHoveredPin(null)}
                className="cursor-pointer"
              />
              <text
                x={event.coordinates.x} y={event.coordinates.y - 1.5}
                textAnchor="middle" fontSize="5"
                className="pointer-events-none select-none"
              >
                {event.icon}
              </text>
            </g>
          ))}
        </svg>

        {/* Tooltip for hovered pin */}
        <AnimatePresence>
          {hoveredPin && (() => {
            const ev = visibleEvents.find(e => e.id === hoveredPin)
            if (!ev) return null
            return (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.9 }}
                transition={springSoft}
                className="absolute bottom-2 left-2 right-2 r44-map-tooltip p-2 rounded-lg bg-background/95 backdrop-blur-md border border-border/40 shadow-lg"
                style={{ left: `${ev.coordinates.x}%`, bottom: `${100 - ev.coordinates.y + 5}%` }}
              >
                <p className="text-[11px] font-bold truncate">{ev.icon} {ev.title}</p>
                <p className="text-[10px] text-muted-foreground">{ev.time}h · {ev.location}</p>
              </motion.div>
            )
          })()}
        </AnimatePresence>
      </div>

      {/* Map legend */}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Eventos ativos</span>
        <span className="flex items-center gap-1">🌿 Parque</span>
        <span className="flex items-center gap-1">🏛️ Praça</span>
      </div>
    </div>
  )
}

// Past events section with photo gallery
function PastEventsSection({ events }: { events: NeighborhoodEvent[] }) {
  const pastEvents = events.filter(e => formatDateParts(e.date).isPast)
  if (pastEvents.length === 0) return null

  return (
    <div className="r44-past-events mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Camera className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-bold">Eventos Passados</span>
        <Badge variant="secondary" className="text-[10px]">{pastEvents.length} eventos</Badge>
      </div>

      {/* Photo gallery grid */}
      <div className="r44-past-gallery grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <AnimatePresence>
          {pastEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, ...springTransition }}
              whileHover={{ scale: 1.08, zIndex: 10 }}
              className="r44-past-thumb relative aspect-square rounded-xl bg-gradient-to-br from-primary/8 via-accent/5 to-muted/30 border border-border/20 flex flex-col items-center justify-center overflow-hidden cursor-pointer group"
            >
              {/* Event emoji */}
              <motion.span
                className="text-3xl"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={springSoft}
              >
                {event.icon}
              </motion.span>
              {/* Photo count */}
              <div className="absolute top-1 right-1 bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                <ImageIcon className="h-2.5 w-2.5 text-white" />
                <span className="text-[9px] text-white font-medium">{event.pastPhotos.length}</span>
              </div>
              {/* Title on hover */}
              <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] text-white font-medium truncate">{event.title}</p>
              </div>
              {/* Mini photo thumbs inside */}
              <div className="absolute bottom-0 inset-x-0 h-6 overflow-hidden flex gap-0.5 p-0.5">
                {event.pastPhotos.slice(0, 3).map((photo, j) => (
                  <div key={j} className="flex-1 h-full rounded bg-muted/50 flex items-center justify-center">
                    <span className="text-[10px]">{photo}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Create event button (mock)
function CreateEventButton() {
  const [clicked, setClicked] = useState(false)
  return (
    <motion.div whileTap={{ scale: 0.95 }} className="mt-4">
      <motion.div whileHover={{ scale: 1.02 }} transition={springSoft}>
        <Button
          className="w-full bg-gradient-to-r from-primary to-emerald-600 text-white btn-glow btn-shine"
          onClick={() => setClicked(true)}
        >
          <AnimatePresence mode="wait">
            {clicked ? (
              <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Em breve!
              </motion.span>
            ) : (
              <motion.span key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Criar Evento
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </motion.div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function NeighborhoodEvents2() {
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const filteredEvents = useMemo(() => {
    if (activeCategory === 'all') return mockEvents
    return mockEvents.filter(e => e.category === activeCategory)
  }, [activeCategory])

  const featuredEvents = useMemo(() => mockEvents.filter(e => e.featured && !formatDateParts(e.date).isPast), [])

  return (
    <section className="r44-container mt-6 relative overflow-hidden r62-card-lift">
      {/* Section header */}
      <div className="r44-header flex items-center gap-2 mb-4">
        <motion.div
          className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg"
          style={{ boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <CalendarDays className="h-4 w-4 text-white" />
        </motion.div>
        <div className="flex-1">
          <h2 className="text-base sm:text-lg font-bold r62-heading-gradient">Eventos do Bairro</h2>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Descubra o que acontece na sua comunidade
          </p>
        </div>
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <CalendarDays className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <MapPin className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category filters */}
      <motion.div
        className="r44-filters flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1 mb-4"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
        initial="hidden"
        animate="visible"
      >
        {categories.map(cat => {
          const isActive = activeCategory === cat.key
          return (
            <motion.button
              key={cat.key}
              variants={filterVariants}
              whileTap={{ scale: 0.92 }}
              onClick={() => setActiveCategory(cat.key)}
              className={`r44-filter-chip flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              style={isActive ? { boxShadow: '0 4px 12px rgba(16,185,129,0.25)' } : undefined}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span>{cat.label}</span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Featured spotlight (list view only) */}
      {viewMode === 'list' && featuredEvents.length > 0 && activeCategory === 'all' && (
        <FeaturedSpotlight events={featuredEvents} />
      )}

      {/* View modes */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={springSoft}
          >
            <motion.div
              key={activeCategory}
              className="r44-events-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredEvents.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </motion.div>
          </motion.div>
        )}

        {viewMode === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={springSoft}
          >
            <MiniCalendarView events={filteredEvents} />
          </motion.div>
        )}

        {viewMode === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={springSoft}
          >
            <NeighborhoodMapView events={filteredEvents} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past events gallery */}
      <PastEventsSection events={mockEvents} />

      {/* Create event button */}
      <CreateEventButton />

      {/* Footer shimmer text */}
      <motion.div
        className="r44-footer flex justify-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-[10px] text-muted-foreground font-medium">
          {mockEvents.length} eventos na comunidade · Dom Eliseu, PA
        </span>
      </motion.div>
    </section>
  )
}
