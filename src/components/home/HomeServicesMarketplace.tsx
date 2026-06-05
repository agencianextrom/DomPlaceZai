'use client'
/* ─── HomeServicesMarketplace ─── "Serviços para o Lar" ───
   Comprehensive home services booking widget for Brazilian Portuguese users.
   Browse categories, book professionals, find urgent help. */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  Hammer, Star, MapPin, Clock, Search, BadgeCheck,
  Heart, Shield, Flame, CheckCircle2, Zap
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ServiceItem {
  id: string
  emoji: string
  name: string
  provider: string
  rating: number
  reviews: number
  distance: string
  priceMin: number
  priceMax: number
  tags: string[]
  verified: boolean
  available: boolean
  nextSlot: string
}

interface UrgentItem {
  id: string
  emoji: string
  name: string
  provider: string
  responseTime: string
  priceMin: number
  priceMax: number
  description: string
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const categories = [
  { id: 'Todos', emoji: '🏠' },
  { id: 'Limpeza', emoji: '🧹' },
  { id: 'Reparos', emoji: '🔧' },
  { id: 'Pintura', emoji: '🎨' },
  { id: 'Jardinagem', emoji: '🌿' },
  { id: 'Eletricista', emoji: '⚡' },
  { id: 'Encanador', emoji: '🔧' },
  { id: 'Montagem', emoji: '🔨' },
]

const services: ServiceItem[] = [
  {
    id: '1', emoji: '🧹', name: 'Limpeza Residencial',
    provider: 'Dona Cleusa', rating: 4.9, reviews: 156,
    distance: '0.8 km', priceMin: 120, priceMax: 250,
    tags: ['Faxina Completa', 'Pós-obra'], verified: true,
    available: true, nextSlot: 'Hoje 10:00'
  },
  {
    id: '2', emoji: '🔧', name: 'Reparos Gerais',
    provider: 'Carlos Manutenção', rating: 4.7, reviews: 89,
    distance: '1.8 km', priceMin: 80, priceMax: 180,
    tags: ['Gesso', 'Paredes'], verified: false,
    available: true, nextSlot: 'Hoje 14:00'
  },
  {
    id: '3', emoji: '🎨', name: 'Pintura Interna/Externa',
    provider: 'Marcos Pintor', rating: 4.8, reviews: 63,
    distance: '3.5 km', priceMin: 500, priceMax: 2000,
    tags: ['Textura', 'Acabamento'], verified: true,
    available: false, nextSlot: 'Seg 09:00'
  },
  {
    id: '4', emoji: '🌿', name: 'Jardinagem & Paisagismo',
    provider: 'Seu Waldemir', rating: 4.9, reviews: 72,
    distance: '4.2 km', priceMin: 100, priceMax: 300,
    tags: ['Poda', 'Irrigação'], verified: true,
    available: true, nextSlot: 'Amanhã 07:00'
  },
  {
    id: '5', emoji: '⚡', name: 'Instalação Elétrica',
    provider: 'José Eletricista', rating: 4.8, reviews: 112,
    distance: '1.2 km', priceMin: 90, priceMax: 220,
    tags: ['Residencial', 'Tomadas'], verified: true,
    available: true, nextSlot: 'Hoje 16:00'
  },
  {
    id: '6', emoji: '🔨', name: 'Montagem de Móveis',
    provider: 'Pedro Montador', rating: 4.6, reviews: 45,
    distance: '2.4 km', priceMin: 70, priceMax: 150,
    tags: ['IKEA', 'Sob Medida'], verified: true,
    available: true, nextSlot: 'Amanhã 08:00'
  },
]

const urgentServices: UrgentItem[] = [
  {
    id: 'u1', emoji: '💧', name: 'Vazamento de Emergência',
    provider: 'Pedro Encanador', responseTime: '15 min',
    priceMin: 150, priceMax: 350,
    description: 'Atendimento emergencial para vazamentos, entupimentos e problemas hidráulicos.'
  },
  {
    id: 'u2', emoji: '🔌', name: 'Curto-circuito / Sem Luz',
    provider: 'José Eletricista', responseTime: '20 min',
    priceMin: 180, priceMax: 400,
    description: 'Reparo elétrico urgente. Disponível 24h para emergências residenciais.'
  },
]

const brl = (v: number) =>
  v >= 1000
    ? `R$${v.toLocaleString('pt-BR')}`
    : `R$${v}`

const sp = 'spring' as const

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const staggerGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: sp, stiffness: 300, damping: 26 } },
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeServicesMarketplace() {
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = services.filter(s => {
    const matchCat = activeCategory === 'Todos' || categories.find(c => c.id === activeCategory)?.id === 'Todos' || s.name.includes(activeCategory) || s.tags.some(t => t.toLowerCase().includes(activeCategory.toLowerCase()))
    const matchSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCat && matchSearch
  })

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="h-28 animate-pulse" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)' }} />
        <div className="p-4 space-y-4">
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 w-28 shrink-0 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
          <div className="h-11 rounded-xl bg-gray-100 animate-pulse" />
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-11 w-24 shrink-0 rounded-full bg-gray-100 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-56 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <LayoutGroup>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: sp, stiffness: 280, damping: 24 }}
        className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      >
        {/* ── 1. Header ── */}
        <div
          className="relative px-5 py-5"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm">
              <Hammer className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white tracking-tight">Serviços para o Lar</h2>
              <p className="text-xs text-white/70">Profissionais verificados perto de você</p>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              <Shield className="h-3.5 w-3.5 text-violet-200" />
              <span className="text-xs font-bold text-white">156+ disponíveis</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* ── 2. Stats Row ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex gap-3 overflow-x-auto pb-1"
          >
            {[
              { emoji: '👨‍🔧', label: 'Profissionais', value: '156+' },
              { emoji: '⭐', label: 'Avaliação', value: '4.8★' },
              { emoji: '📋', label: 'Serviços', value: '12k' },
              { emoji: '😊', label: 'Satisfação', value: '98%' },
            ].map(stat => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-50 min-h-[44px]"
              >
                <span className="text-lg">{stat.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── 7. Search Bar ── */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar serviço..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-colors"
            />
          </div>

          {/* ── 3. Category Filters ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex gap-2 overflow-x-auto pb-1"
          >
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                variants={fadeUp}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 rounded-full text-xs font-semibold border transition-all min-h-[44px] ${
                  activeCategory === cat.id
                    ? 'border-violet-500 bg-violet-500 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:bg-violet-50'
                }`}
              >
                <span className="text-sm">{cat.emoji}</span>
                {cat.id}
              </motion.button>
            ))}
          </motion.div>

          {/* ── 4. Service Cards Grid ── */}
          <motion.div
            variants={staggerGrid}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map(service => (
                <motion.div
                  key={service.id}
                  layout
                  variants={fadeUp}
                  whileHover={{ scale: 1.02, transition: { type: sp, stiffness: 400, damping: 25 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-violet-200"
                  style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
                >
                  {/* Favorite toggle */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleFav(service.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white border border-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        favorites.has(service.id)
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </motion.button>

                  {/* Emoji + name */}
                  <div className="flex items-start gap-3">
                    <div
                      className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 text-2xl"
                      style={{ background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)' }}
                    >
                      {service.emoji}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{service.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-500">{service.provider}</span>
                        {service.verified && (
                          <BadgeCheck className="h-3.5 w-3.5 text-violet-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating + reviews */}
                  <div className="flex items-center gap-2 mt-2.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < Math.round(service.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{service.rating}</span>
                    <span className="text-[11px] text-gray-400">({service.reviews} avaliações)</span>
                  </div>

                  {/* Distance badge */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-[11px] text-gray-500 font-medium">{service.distance}</span>
                  </div>

                  {/* Price range */}
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-lg font-extrabold text-gray-900">{brl(service.priceMin)}</span>
                    <span className="text-xs text-gray-400">–</span>
                    <span className="text-lg font-extrabold text-gray-900">{brl(service.priceMax)}</span>
                  </div>

                  {/* Specialty tags */}
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {service.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-violet-700 bg-violet-50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Next available slot */}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-[11px] text-gray-500">Próximo: {service.nextSlot}</span>
                  </div>

                  {/* Agendar button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className={`w-full mt-3 min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition-colors ${
                      service.available
                        ? 'text-white'
                        : 'text-amber-700 bg-amber-50 border border-amber-200'
                    }`}
                    style={
                      service.available
                        ? {
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            boxShadow: '0 2px 10px rgba(34,197,94,0.25)',
                          }
                        : undefined
                    }
                  >
                    {service.available ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Agendar
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4" />
                        Agendar — {service.nextSlot}
                      </>
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* ── 5. Urgent Services ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-bold text-gray-900">Serviços Urgentes</h3>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-orange-700 bg-orange-100"
              >
                ⚡ Expresso
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {urgentServices.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: sp, stiffness: 300, damping: 26, delay: 0.3 + i * 0.08 }}
                  className="relative rounded-xl border border-orange-200 p-4"
                  style={{
                    background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
                    boxShadow: '0 2px 12px rgba(251,146,60,0.12)',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xl">{u.emoji}</span>
                    <h4 className="text-sm font-bold text-gray-900">{u.name}</h4>
                  </div>
                  <p className="text-[11px] text-gray-600 mb-3">{u.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-orange-700">{brl(u.priceMin)}</span>
                      <span className="text-xs text-gray-400">–</span>
                      <span className="text-base font-extrabold text-orange-700">{brl(u.priceMax)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-orange-600 font-semibold">
                      <Zap className="h-3 w-3 fill-orange-500 text-orange-500" />
                      {u.responseTime}
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="w-full mt-3 min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      boxShadow: '0 2px 10px rgba(249,115,22,0.25)',
                    }}
                  >
                    <Flame className="h-4 w-4" />
                    Chamar Agora — Urgente
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── 6. Trust Indicators ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="rounded-xl border border-gray-100 p-4"
            style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-bold text-gray-700">Por que confiar no DomPlace?</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { icon: BadgeCheck, label: 'Profissionais Verificados' },
                { icon: Shield, label: 'Garantia 30 dias' },
                { icon: Star, label: 'Avaliações Reais' },
                { icon: Zap, label: 'Atendimento 24h' },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <item.icon className="h-5 w-5 text-violet-500" />
                  <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </LayoutGroup>
  )
}
