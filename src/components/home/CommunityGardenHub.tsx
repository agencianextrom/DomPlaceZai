'use client'
/* ─── CommunityGardenHub ─── "Horta Comunitária" ───
   Community garden hub: featured gardens, harvest calendar, quick tips,
   community events, trust badges, and category filters. Green theme. */

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Sprout, Droplets, Sun, Leaf, Heart, MapPin, Calendar, Users,
  Award, Package, Truck, ChevronRight, Star, TreePine, Flower2, Bug,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Garden {
  id: string
  name: string
  location: string
  manager: string
  volunteers: number
  crops: string
  status: 'Ativa' | 'Em Expansão' | 'Nova'
  gradient: string
}

interface HarvestMonth {
  month: string
  crops: { icon: string; name: string }[]
}

interface Tip {
  icon: React.ElementType
  title: string
  description: string
  color: string
}

interface CommunityEvent {
  title: string
  date: string
  time: string
  location: string
  attendees: number
  type: string
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const stats = [
  { label: 'Hortas', value: '85', icon: TreePine, color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
  { label: 'Voluntários', value: '1.2k', icon: Users, color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' },
  { label: 'Colheitas', value: '3.4k', icon: Sprout, color: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30' },
  { label: 'Famílias', value: '560', icon: Heart, color: 'text-lime-600 bg-lime-100 dark:text-lime-400 dark:bg-lime-900/30' },
]

const categories = [
  'Todos', 'Hortaliças 🥬', 'Frutas 🍓', 'Ervas 🌿',
  'Temperos 🌶️', 'Flores 🌻', 'Suculentas 🪴', 'Compostagem ♻️',
]

const gardens: Garden[] = [
  {
    id: '1', name: 'Horta Sementes da Terra', location: 'Centro - Rua das Flores, 42',
    manager: 'Dona Maria', volunteers: 24, crops: 'Alface, Rúcula, Tomate, Cenoura',
    status: 'Ativa', gradient: 'linear-gradient(135deg, #16a34a, #059669)',
  },
  {
    id: '2', name: 'Jardim Comunitário Esperança', location: 'Jardim América - Av. Paz, 118',
    manager: 'Seu João', volunteers: 18, crops: 'Manjericão, Salsinha, Cebolinha, Alecrim',
    status: 'Ativa', gradient: 'linear-gradient(135deg, #059669, #0d9488)',
  },
  {
    id: '3', name: 'Horta Vida Nova', location: 'Vila Verde - Rua Sol, 77',
    manager: 'Ana Costa', volunteers: 32, crops: 'Morango, Uva, Goiaba, Pitaya',
    status: 'Em Expansão', gradient: 'linear-gradient(135deg, #0d9488, #0891b2)',
  },
  {
    id: '4', name: 'Canteiro Urbano Florescer', location: 'Bairro Novo - Praça Central',
    manager: 'Pedro Lima', volunteers: 12, crops: 'Lavanda, Girassol, Hortênsia, Violeta',
    status: 'Nova', gradient: 'linear-gradient(135deg, #16a34a, #059669)',
  },
]

const harvestMonths: HarvestMonth[] = [
  {
    month: 'Janeiro',
    crops: [
      { icon: '🍅', name: 'Tomate' },
      { icon: '🥒', name: 'Pepino' },
      { icon: '🌶️', name: 'Pimentão' },
    ],
  },
  {
    month: 'Fevereiro',
    crops: [
      { icon: '🥬', name: 'Couve' },
      { icon: '🥕', name: 'Cenoura' },
      { icon: '🫑', name: 'Pimentão' },
    ],
  },
  {
    month: 'Março',
    crops: [
      { icon: '🍓', name: 'Morango' },
      { icon: '🥗', name: 'Alface' },
      { icon: '🌱', name: 'Rúcula' },
    ],
  },
]

const tips: Tip[] = [
  {
    icon: Sun, title: 'Plantio por Estação',
    description: 'Descubra as melhores espécies para cada época do ano e maximize sua colheita.',
    color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
  },
  {
    icon: Droplets, title: 'Irrigação Inteligente',
    description: 'Técnicas de economia de água: gotejamento, mulching e captação de chuva.',
    color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  },
  {
    icon: Bug, title: 'Controle Natural de Pragas',
    description: 'Plantas companheiras, óleos essenciais e insetos benéficos para seu jardim.',
    color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  },
  {
    icon: Package, title: 'Compostagem em Casa',
    description: 'Transforme resíduos orgânicos em adubo rico para suas plantas e hortas.',
    color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
  },
]

const communityEvents: CommunityEvent[] = [
  {
    title: 'Workshop de Compostagem',
    date: '15 Jan', time: '09:00', location: 'Horta Sementes da Terra',
    attendees: 34, type: 'Workshop',
  },
  {
    title: 'Festival da Colheita',
    date: '28 Jan', time: '10:00', location: 'Praça Central',
    attendees: 87, type: 'Festival',
  },
]

const trustBadges = [
  { icon: Award, label: 'Certificado Orgânico' },
  { icon: Users, label: 'Comunidade Ativa' },
  { icon: Leaf, label: 'Sem Agrotóxicos' },
  { icon: Star, label: 'Transparência Total' },
]

const statusColor: Record<string, string> = {
  'Ativa': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Em Expansão': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Nova': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

// ─── Constants ──────────────────────────────────────────────────────────────────
const sp = 'spring' as const
const easeOut = 'easeOut' as const

// ─── Component ────────────────────────────────────────────────────────────────
export default function CommunityGardenHub() {
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Todos')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <LoadingSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: sp, stiffness: 260, damping: 24 }}
      className="space-y-5 r102-section-accent"
    >
      {/* ── 1. Header ── */}
      <Section>
        <div
          className="flex items-center gap-3 px-4 py-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #22c55e, #10b981, #14b8a6)',
            boxShadow: '0 4px 16px rgba(34,197,94,0.25)',
          }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
            <Sprout className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white tracking-tight">Horta Comunitária 🌿</h2>
            <p className="text-[11px] text-white/70 font-medium">Cultive, compartilhe e colha juntos</p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
            <TreePine className="h-3.5 w-3.5 text-emerald-200" />
            <span className="text-[11px] font-bold text-emerald-100">85 hortas ativas</span>
          </div>
        </div>
      </Section>

      {/* ── 2. Stats Row ── */}
      <Section>
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: sp, stiffness: 300, damping: 26, delay: i * 0.06 }}
              className="r102-stat-card shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-card border border-border/40 min-w-[100px]"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold leading-none">{stat.value}</span>
              <span className="text-[10px] text-muted-foreground font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── 3. Category Filter ── */}
      <Section>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
          {categories.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: sp, stiffness: 300, damping: 26, delay: i * 0.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`r102-category-pill shrink-0 px-3.5 py-2 rounded-full text-[11px] font-medium border min-h-[44px] transition-colors ${
                activeCategory === cat
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-border bg-card text-muted-foreground hover:border-green-300'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </Section>

      {/* ── 4. Featured Gardens ── */}
      <Section>
        <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3 r62-heading-gradient">
          <Flower2 className="h-4 w-4 text-green-600" />
          Hortas em Destaque
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gardens.map((garden, i) => (
            <GardenCard key={garden.id} garden={garden} index={i} />
          ))}
        </div>
      </Section>

      {/* ── 5. Harvest Calendar ── */}
      <Section>
        <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3 r62-heading-gradient">
          <Calendar className="h-4 w-4 text-emerald-600" />
          Calendário de Colheita
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {harvestMonths.map((month, i) => (
            <HarvestCard key={month.month} month={month} index={i} />
          ))}
        </div>
      </Section>

      {/* ── 6. Quick Tips ── */}
      <Section>
        <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3 r62-heading-gradient">
          <Leaf className="h-4 w-4 text-green-600" />
          Dicas Rápidas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <TipCard key={tip.title} tip={tip} index={i} />
          ))}
        </div>
      </Section>

      {/* ── 7. Community Board ── */}
      <Section>
        <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3 r62-heading-gradient">
          <Users className="h-4 w-4 text-teal-600" />
          Eventos da Comunidade
        </h3>
        <div className="space-y-3">
          {communityEvents.map((event, i) => (
            <EventCard key={event.title} event={event} index={i} />
          ))}
        </div>
      </Section>

      {/* ── 8. Trust Bar ── */}
      <Section>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: sp, stiffness: 300, damping: 26, delay: i * 0.06 }}
              className="r102-trust-badge shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-card border border-border/40"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30">
                <badge.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground text-center leading-tight">
                {badge.label}
              </span>
            </motion.div>
          ))}
        </div>
      </Section>
    </motion.div>
  )
}

// ─── Sub-Components ─────────────────────────────────────────────────────────────

function Section({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ type: sp, stiffness: 260, damping: 24, ease: easeOut }}
    >
      {children}
    </motion.div>
  )
}

function GardenCard({ garden, index }: { garden: Garden; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ type: sp, stiffness: 300, damping: 26, delay: index * 0.07, ease: easeOut }}
      className="r102-garden-card rounded-xl border border-border/40 bg-card overflow-hidden r62-card-lift"
    >
      {/* Gradient header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ background: garden.gradient }}
      >
        <TreePine className="h-4 w-4 text-white/80" />
        <span className="text-sm font-bold text-white">{garden.name}</span>
      </div>

      <div className="p-3.5 space-y-2.5">
        {/* Location & Manager */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{garden.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            👤 {garden.manager}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
            <Users className="h-3 w-3" />
            {garden.volunteers} voluntários
          </span>
        </div>

        {/* Crops */}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Cultivos:</span> {garden.crops}
        </p>

        {/* Status */}
        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${statusColor[garden.status]}`}>
          {garden.status}
        </span>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
            <Button
              size="sm"
              className="w-full min-h-[44px] text-[11px] font-semibold rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #10b981)',
                boxShadow: '0 2px 8px rgba(34,197,94,0.25)',
              }}
            >
              <MapPin className="h-3.5 w-3.5 mr-1" />
              Visitar
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
            <Button
              size="sm"
              variant="outline"
              className="w-full min-h-[44px] text-[11px] font-semibold rounded-lg border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <Heart className="h-3.5 w-3.5 mr-1" />
              Contribuir
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function HarvestCard({ month, index }: { month: HarvestMonth; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ type: sp, stiffness: 300, damping: 26, delay: index * 0.08, ease: easeOut }}
      className="r102-harvest-card rounded-xl border border-border/40 bg-card p-3.5 r62-card-lift"
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <Calendar className="h-4 w-4 text-emerald-600" />
        <span className="text-xs font-bold">{month.month}</span>
      </div>
      <div className="space-y-2">
        {month.crops.map(crop => (
          <div key={crop.name} className="flex items-center gap-2">
            <span className="text-lg">{crop.icon}</span>
            <span className="text-[11px] font-medium text-muted-foreground">{crop.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function TipCard({ tip, index }: { tip: Tip; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const Icon = tip.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ type: sp, stiffness: 300, damping: 26, delay: index * 0.07, ease: easeOut }}
      className="r102-tip-card rounded-xl border border-border/40 bg-card p-3.5 r62-card-lift"
    >
      <div className="flex items-start gap-3">
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${tip.color}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold mb-0.5">{tip.title}</h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{tip.description}</p>
        </div>
      </div>
    </motion.div>
  )
}

function EventCard({ event, index }: { event: CommunityEvent; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
      transition={{ type: sp, stiffness: 300, damping: 26, delay: index * 0.08, ease: easeOut }}
      className="rounded-xl border border-border/40 bg-card p-3.5"
      style={{
        borderLeft: '3px solid rgba(16,185,129,0.4)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
              {event.type}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {event.attendees} participantes
            </span>
          </div>
          <h4 className="text-xs font-bold">{event.title}</h4>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Calendar className="h-3 w-3" />
              {event.date}
            </span>
            <span className="flex items-center gap-0.5">
              <Sun className="h-3 w-3" />
              {event.time}
            </span>
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          </div>
        </div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            size="sm"
            className="min-h-[44px] text-[11px] font-semibold rounded-lg shrink-0"
            style={{
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              boxShadow: '0 2px 8px rgba(20,184,166,0.25)',
            }}
          >
            Participar
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header skeleton */}
      <div className="h-20 rounded-xl bg-muted/50 animate-pulse" />
      {/* Stats skeleton */}
      <div className="flex gap-2.5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 w-24 rounded-xl bg-muted/40 animate-pulse shrink-0" />
        ))}
      </div>
      {/* Category filter skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-[44px] w-20 rounded-full bg-muted/40 animate-pulse shrink-0" />
        ))}
      </div>
      {/* Garden cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl bg-muted/40 animate-pulse overflow-hidden">
            <div className="h-10 bg-muted/50" />
            <div className="p-3.5 space-y-2">
              <div className="h-3 w-3/4 rounded bg-muted/50" />
              <div className="h-3 w-1/2 rounded bg-muted/50" />
              <div className="h-3 w-full rounded bg-muted/50" />
              <div className="flex gap-2 mt-2">
                <div className="h-[44px] flex-1 rounded-lg bg-muted/50" />
                <div className="h-[44px] flex-1 rounded-lg bg-muted/50" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Harvest skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
      {/* Tips skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
