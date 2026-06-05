'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, MapPin, Clock, Users, Star, Heart,
  ChevronRight, BadgeCheck, TrendingUp, Filter,
  Bell, Music, GraduationCap, ShoppingBag, Utensils,
  Palette, Dumbbell, Baby, TreePine
} from 'lucide-react'

interface LocalEvent {
  id: number
  name: string
  emoji: string
  category: string
  date: string
  time: string
  location: string
  distance: string
  price: string
  attendees: number
  maxAttendees: number
  rating: number
  isFree: boolean
  isFeatured: boolean
  organizer: string
  description: string
  tags: string[]
}

const eventCategories = [
  { id: 'all', label: 'Todos', emoji: '🎉' },
  { id: 'music', label: 'Música', emoji: '🎵' },
  { id: 'food', label: 'Gastronomia', emoji: '🍽️' },
  { id: 'art', label: 'Arte & Cultura', emoji: '🎨' },
  { id: 'sports', label: 'Esporte', emoji: '⚽' },
  { id: 'kids', label: 'Infantil', emoji: '👶' },
  { id: 'nature', label: 'Natureza', emoji: '🌿' },
  { id: 'education', label: 'Educação', emoji: '📚' },
  { id: 'shopping', label: 'Feiras', emoji: '🛍️' },
]

const localEvents: LocalEvent[] = [
  { id: 1, name: 'Festival de Açaí 2025', emoji: '🫐', category: 'food', date: 'Sáb, 14 Jun', time: '08:00 - 18:00', location: 'Praça da Matriz', distance: '0.3 km', price: 'Grátis', attendees: 234, maxAttendees: 500, rating: 4.9, isFree: true, isFeatured: true, organizer: 'Prefeitura Municipal', description: 'O maior festival de açaí da região com degustação, concursos e música ao vivo.', tags: ['Comida', 'Cultura', 'Família'] },
  { id: 2, name: 'Feira de Artesanato', emoji: '🏺', category: 'art', date: 'Dom, 15 Jun', time: '09:00 - 15:00', location: 'Centro Cultural', distance: '0.8 km', price: 'R$5,00', attendees: 156, maxAttendees: 300, rating: 4.7, isFree: false, isFeatured: false, organizer: 'Associação dos Artesãos', description: 'Artesanato local com peças únicas em madeira, cerâmica e tecido.', tags: ['Artesanato', 'Local'] },
  { id: 3, name: 'Corrida Matinal 10K', emoji: '🏃', category: 'sports', date: 'Sáb, 21 Jun', time: '06:00 - 09:00', location: 'Parque Municipal', distance: '1.2 km', price: 'R$35,00', attendees: 89, maxAttendees: 200, rating: 4.8, isFree: false, isFeatured: true, organizer: 'Clube de Corredores', description: 'Corrida de 10km no parque com premiação e kit pós-corrida.', tags: ['Corrida', 'Saúde'] },
  { id: 4, name: 'Show de Pará', emoji: '🎸', category: 'music', date: 'Sáb, 28 Jun', time: '20:00 - 23:00', location: 'Ginásio Poliesportivo', distance: '1.5 km', price: 'R$60,00', attendees: 312, maxAttendees: 800, rating: 4.6, isFree: false, isFeatured: false, organizer: 'Produções Eliseu', description: 'Show com artistas paraenses com comida típica e artesanato.', tags: ['Música', 'Show', 'Cultura'] },
  { id: 5, name: 'Oficina de Pintura', emoji: '🖼️', category: 'art', date: 'Ter, 17 Jun', time: '14:00 - 16:00', location: 'Biblioteca Municipal', distance: '0.6 km', price: 'Grátis', attendees: 18, maxAttendees: 25, rating: 4.9, isFree: true, isFeatured: false, organizer: 'Grupo ArtCria', description: 'Oficina gratuita de pintura para iniciantes com materiais inclusos.', tags: ['Arte', 'Grátis', 'Aprender'] },
  { id: 6, name: 'Festival Infantil', emoji: '🎈', category: 'kids', date: 'Dom, 22 Jun', time: '10:00 - 17:00', location: 'Praça do Centro', distance: '0.2 km', price: 'Grátis', attendees: 445, maxAttendees: 1000, rating: 4.5, isFree: true, isFeatured: false, organizer: 'Secretaria de Cultura', description: 'Brinquedos infláveis, pintura facial, teatro de fantoches e guloseimas.', tags: ['Criança', 'Família', 'Diversão'] },
  { id: 7, name: 'Trilha Ecológica', emoji: '🥾', category: 'nature', date: 'Sáb, 21 Jun', time: '07:00 - 12:00', location: 'Reserva Florestal', distance: '5.2 km', price: 'R$15,00', attendees: 34, maxAttendees: 50, rating: 4.8, isFree: false, isFeatured: true, organizer: 'ONG VerdeVida', description: 'Trilha guiada na reserva com observação de aves e painel ambiental.', tags: ['Natureza', 'Eco', 'Aventura'] },
  { id: 8, name: 'Curso de Culinária Regional', emoji: '👨‍🍳', category: 'food', date: 'Qui, 19 Jun', time: '19:00 - 21:30', location: 'Centro de Treinamentos', distance: '0.9 km', price: 'R$40,00', attendees: 22, maxAttendees: 30, rating: 4.7, isFree: false, isFeatured: false, organizer: 'Chef Maria Pará', description: 'Aprenda a fazer tacacá, pato no tucupi e outros pratos regionais.', tags: ['Culinária', 'Aprender', 'Comida'] },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
}

export default function LocalEventsCalendar() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favorites, setFavorites] = useState<number[]>([])
  const [rsvpEvents, setRsvpEvents] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const filteredEvents = selectedCategory === 'all'
    ? localEvents
    : localEvents.filter(e => e.category === selectedCategory)

  const featuredEvents = filteredEvents.filter(e => e.isFeatured)
  const regularEvents = filteredEvents.filter(e => !e.isFeatured)
  const totalFree = filteredEvents.filter(e => e.isFree).length

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const toggleRsvp = (id: number) => {
    setRsvpEvents(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded-lg bg-rose-200/50" />
          <div className="flex gap-3 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-24 shrink-0 rounded-full bg-rose-200/40" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-white/60" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.section
      id="local-events-calendar"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-5 sm:p-6 shadow-sm"
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-md shadow-rose-200/50">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
              Eventos Locais 🎉
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">O que rola em Dom Eliseu</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalFree > 0 && (
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
              {totalFree} grátis
            </span>
          )}
          <button className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-rose-100 px-3 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-200">
            Ver Tudo
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-5 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        <div className="r95-event-stat shrink-0 rounded-xl bg-white p-3 shadow-sm min-w-[130px]">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-rose-500" />
            <span className="text-xs text-gray-500">Este mês</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-800">24</p>
        </div>
        <div className="r95-event-stat shrink-0 rounded-xl bg-white p-3 shadow-sm min-w-[130px]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-pink-500" />
            <span className="text-xs text-gray-500">Participantes</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-800">1.8k</p>
        </div>
        <div className="r95-event-stat shrink-0 rounded-xl bg-white p-3 shadow-sm min-w-[130px]">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-gray-500">Avaliação</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-800">4.7★</p>
        </div>
        <div className="r95-event-stat shrink-0 rounded-xl bg-white p-3 shadow-sm min-w-[130px]">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-fuchsia-500" />
            <span className="text-xs text-gray-500">Novos</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-800">8</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {eventCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`r95-category-pill flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all min-h-[44px] ${
              selectedCategory === cat.id
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-rose-50 border border-gray-200'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <div className="mb-5">
          <h3 className="r95-section-title mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <TrendingUp className="h-4 w-4 text-rose-500" />
            Destaques
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {featuredEvents.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="r95-featured-card shrink-0 w-72 rounded-xl bg-white p-4 shadow-sm border-2 border-rose-200"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{event.emoji}</span>
                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">⭐ Destaque</span>
                    <button
                      onClick={() => toggleFavorite(event.id)}
                      className="flex h-8 w-8 min-h-[44px] min-w-[44px] items-center justify-center rounded-full hover:bg-rose-50"
                    >
                      <Heart className={`h-4 w-4 ${favorites.includes(event.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-300'}`} />
                    </button>
                  </div>
                </div>
                <h4 className="r95-event-name mt-2 text-sm font-bold text-gray-800">{event.name}</h4>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{event.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <Calendar className="h-3 w-3" /> {event.date}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" /> {event.distance}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${event.isFree ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                    {event.price}
                  </span>
                  <span className="text-xs text-gray-400">
                    {event.attendees}/{event.maxAttendees}
                  </span>
                </div>
                <button
                  onClick={() => toggleRsvp(event.id)}
                  className={`r95-rsvp-btn mt-3 w-full rounded-lg py-2.5 text-sm font-semibold transition-all min-h-[44px] ${
                    rsvpEvents.includes(event.id)
                      ? 'bg-green-500 text-white'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                >
                  {rsvpEvents.includes(event.id) ? '✓ Confirmado' : 'Participar'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Events Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {regularEvents.map(event => (
          <motion.div
            key={event.id}
            variants={item}
            layout
            className="r95-event-card relative rounded-xl bg-white p-4 shadow-sm"
          >
            <button
              onClick={() => toggleFavorite(event.id)}
              className="absolute right-2 top-2 z-10 flex h-8 w-8 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all hover:scale-110"
            >
              <Heart className={`h-4 w-4 transition-colors ${favorites.includes(event.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
            </button>

            <div className="flex items-start gap-3">
              <div className="r95-event-emoji flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-2xl">
                {event.emoji}
              </div>
              <div className="min-w-0 flex-1 pr-6">
                <h3 className="r95-event-name text-sm font-bold text-gray-800 line-clamp-1">{event.name}</h3>
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{event.organizer}</p>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-0.5 rounded-md bg-gray-50 px-1.5 py-0.5">
                <Calendar className="h-3 w-3" /> {event.date}
              </span>
              <span className="flex items-center gap-0.5 rounded-md bg-gray-50 px-1.5 py-0.5">
                <Clock className="h-3 w-3" /> {event.time}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" /> {event.location}
              </span>
              <span className="text-gray-300">·</span>
              <span>{event.distance}</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {event.tags.slice(0, 3).map(tag => (
                <span key={tag} className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                event.isFree
                  ? 'bg-green-100 text-green-700'
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {event.isFree ? '🆓 Grátis' : event.price}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{event.rating}</span>
                </div>
                <span className="text-[10px] text-gray-400">{event.attendees} pessoas</span>
              </div>
            </div>

            <button
              onClick={() => toggleRsvp(event.id)}
              className={`r95-rsvp-btn mt-3 w-full rounded-lg py-2.5 text-sm font-semibold transition-all min-h-[44px] ${
                rsvpEvents.includes(event.id)
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-rose-500 text-white hover:bg-rose-600'
              }`}
            >
              {rsvpEvents.includes(event.id) ? '✓ Confirmado' : 'Participar'}
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Notification CTA */}
      <div className="r95-notify-cta mt-5 flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500">
          <Bell className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-gray-800">Nunca perca um evento!</h4>
          <p className="text-xs text-gray-500">Receba notificações dos seus eventos favoritos</p>
        </div>
        <button className="r95-notify-btn shrink-0 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-rose-600 min-h-[44px]">
          Ativar
        </button>
      </div>

      {/* Trust Indicators */}
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { icon: BadgeCheck, label: 'Eventos Verificados' },
          { icon: MapPin, label: 'Na sua região' },
          { icon: Star, label: 'Avaliações Reais' },
        ].map(trust => (
          <div key={trust.label} className="r95-trust-badge flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs text-gray-600 shadow-sm">
            <trust.icon className="h-3.5 w-3.5 text-rose-500" />
            {trust.label}
          </div>
        ))}
      </div>
    </motion.section>
  )
}
