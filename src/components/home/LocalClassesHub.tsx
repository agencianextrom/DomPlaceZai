'use client'
/* ─── LocalClassesHub ─── "Aulas e Cursos Locais" ───
   Local classes & courses hub: featured classes, category filters,
   schedule, instructor highlights, quick tips, community events, trust badges.
   Amber/orange/warm theme. */

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  GraduationCap, BookOpen, Music, Globe, ChefHat, Palette,
  Dumbbell, Code2, Star, MapPin, Calendar, Users, Clock,
  Award, ChevronRight, Heart, Shield, Sparkles, Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClassItem {
  id: string
  title: string
  instructor: string
  category: string
  level: 'Iniciante' | 'Intermediário' | 'Avançado'
  rating: number
  students: number
  duration: string
  price: string
  location: string
  gradient: string
  nextClass: string
}

interface Instructor {
  id: string
  name: string
  specialty: string
  rating: number
  students: number
  classes: number
  initials: string
  color: string
}

interface ScheduleSlot {
  day: string
  time: string
  className: string
  spots: number
  instructor: string
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
  { label: 'Aulas', value: '340+', icon: BookOpen, color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30' },
  { label: 'Professores', value: '89', icon: GraduationCap, color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' },
  { label: 'Alunos', value: '2.1k', icon: Users, color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' },
  { label: 'Avaliação', value: '4.8★', icon: Star, color: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30' },
]

const categories = [
  'Todos', 'Música 🎵', 'Idiomas 🌍', 'Culinária 🍳', 'Arte 🎨',
  'Esportes ⚽', 'Tecnologia 💻', 'Dança 💃', 'Crafts 🧶',
]

const classes: ClassItem[] = [
  {
    id: '1', title: 'Violão para Iniciantes', instructor: 'Carlos Mendes',
    category: 'Música', level: 'Iniciante', rating: 4.9, students: 156,
    duration: '1h30', price: 'R$ 45/aula', location: 'Centro - Rua das Artes, 12',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    nextClass: 'Seg, 18:00',
  },
  {
    id: '2', title: 'Inglês Conversação', instructor: 'Ana Silva',
    category: 'Idiomas', level: 'Intermediário', rating: 4.8, students: 210,
    duration: '1h', price: 'R$ 55/aula', location: 'Jardim América - Av. Paz, 45',
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    nextClass: 'Ter, 19:30',
  },
  {
    id: '3', title: 'Culinária Paraense', instructor: 'Dona Maria',
    category: 'Culinária', level: 'Iniciante', rating: 5.0, students: 89,
    duration: '2h', price: 'R$ 60/aula', location: 'Vila Verde - Rua Sol, 23',
    gradient: 'linear-gradient(135deg, #ea580c, #dc2626)',
    nextClass: 'Qua, 15:00',
  },
  {
    id: '4', title: 'Pintura em Tela', instructor: 'Lucia Ferreira',
    category: 'Arte', level: 'Todos os Níveis', rating: 4.7, students: 64,
    duration: '2h', price: 'R$ 50/aula', location: 'Bairro Novo - Praça Cultural',
    gradient: 'linear-gradient(135deg, #f59e0b, #eab308)',
    nextClass: 'Qui, 16:00',
  },
]

const instructors: Instructor[] = [
  {
    id: '1', name: 'Carlos Mendes', specialty: 'Violão & Guitarra',
    rating: 4.9, students: 256, classes: 8, initials: 'CM',
    color: 'bg-amber-500',
  },
  {
    id: '2', name: 'Ana Silva', specialty: 'Inglês & Espanhol',
    rating: 4.8, students: 412, classes: 12, initials: 'AS',
    color: 'bg-orange-500',
  },
  {
    id: '3', name: 'Dona Maria', specialty: 'Culinária Paraense',
    rating: 5.0, students: 189, classes: 6, initials: 'DM',
    color: 'bg-rose-500',
  },
  {
    id: '4', name: 'Pedro Lima', specialty: 'Programação & Web Dev',
    rating: 4.7, students: 98, classes: 4, initials: 'PL',
    color: 'bg-yellow-500',
  },
]

const schedule: ScheduleSlot[] = [
  { day: 'Segunda', time: '18:00 - 19:30', className: 'Violão para Iniciantes', spots: 4, instructor: 'Carlos M.' },
  { day: 'Terça', time: '19:30 - 20:30', className: 'Inglês Conversação', spots: 8, instructor: 'Ana S.' },
  { day: 'Quarta', time: '15:00 - 17:00', className: 'Culinária Paraense', spots: 2, instructor: 'Dona Maria' },
]

const tips: Tip[] = [
  {
    icon: GraduationCap, title: 'Aulas Experimentais',
    description: 'Muitos professores oferecem a primeira aula grátis. Experimente antes de se comprometer!',
    color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
  },
  {
    icon: Clock, title: 'Horários Flexíveis',
    description: 'A maioria das aulas oferece horários de manhã, tarde e noite para sua conveniência.',
    color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
  },
  {
    icon: Users, title: 'Turmas Reduzidas',
    description: 'Turmas de no máximo 8 alunos garantem atenção personalizada do professor.',
    color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
  },
  {
    icon: Trophy, title: 'Certificação Local',
    description: 'Ao completar o curso, receba um certificado reconhecido pela comunidade local.',
    color: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
  },
]

const communityEvents: CommunityEvent[] = [
  {
    title: 'Feira de Talentos Musicais',
    date: '20 Jan', time: '14:00', location: 'Praça Central',
    attendees: 120, type: 'Evento',
  },
  {
    title: 'Workshop de Robótica para Crianças',
    date: '25 Jan', time: '09:00', location: 'Centro Cultural',
    attendees: 45, type: 'Workshop',
  },
]

const trustBadges = [
  { icon: Award, label: 'Professores Verificados' },
  { icon: Shield, label: 'Satisfação Garantida' },
  { icon: Heart, label: 'Comunidade Ativa' },
  { icon: Sparkles, label: 'Primeira Aula Grátis' },
]

const levelColor: Record<string, string> = {
  'Iniciante': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Intermediário': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Avançado': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'Todos os Níveis': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

// ─── Constants ──────────────────────────────────────────────────────────────────
const sp = 'spring' as const
const easeOut = 'easeOut' as const

// ─── Component ────────────────────────────────────────────────────────────────
export default function LocalClassesHub() {
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
      className="space-y-5"
    >
      {/* ── 1. Header ── */}
      <Section>
        <div
          className="flex items-center gap-3 px-4 py-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #f97316, #ef4444)',
            boxShadow: '0 4px 16px rgba(245,158,11,0.25)',
          }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white tracking-tight">Aulas e Cursos Locais 📚</h2>
            <p className="text-[11px] text-white/70 font-medium">Aprenda, ensine e cresça na sua comunidade</p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
            <BookOpen className="h-3.5 w-3.5 text-amber-200" />
            <span className="text-[11px] font-bold text-amber-100">340+ aulas</span>
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
              className="r104-stat-card shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-card border border-border/40 min-w-[100px]"
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
              className={`r104-category-pill shrink-0 px-3.5 py-2 rounded-full text-[11px] font-medium border min-h-[44px] transition-colors ${
                activeCategory === cat
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-border bg-card text-muted-foreground hover:border-amber-300'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </Section>

      {/* ── 4. Featured Classes ── */}
      <Section>
        <h3 className="r62-heading-gradient text-sm font-bold flex items-center gap-1.5 mb-3">
          <BookOpen className="h-4 w-4 text-amber-600" />
          Aulas em Destaque
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {classes.map((cls, i) => (
            <ClassCard key={cls.id} cls={cls} index={i} />
          ))}
        </div>
      </Section>

      {/* ── 5. Top Instructors ── */}
      <Section>
        <h3 className="r62-heading-gradient text-sm font-bold flex items-center gap-1.5 mb-3">
          <GraduationCap className="h-4 w-4 text-orange-600" />
          Professores em Destaque
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        </h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
          {instructors.map((inst, i) => (
            <InstructorCard key={inst.id} instructor={inst} index={i} />
          ))}
        </div>
      </Section>

      {/* ── 6. Weekly Schedule ── */}
      <Section>
        <h3 className="r62-heading-gradient text-sm font-bold flex items-center gap-1.5 mb-3">
          <Calendar className="h-4 w-4 text-amber-600" />
          Agenda da Semana
        </h3>
        <div className="space-y-2.5">
          {schedule.map((slot, i) => (
            <ScheduleCard key={slot.className} slot={slot} index={i} />
          ))}
        </div>
      </Section>

      {/* ── 7. Quick Tips ── */}
      <Section>
        <h3 className="r62-heading-gradient text-sm font-bold flex items-center gap-1.5 mb-3">
          <Sparkles className="h-4 w-4 text-amber-600" />
          Dicas para Alunos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <TipCard key={tip.title} tip={tip} index={i} />
          ))}
        </div>
      </Section>

      {/* ── 8. Community Events ── */}
      <Section>
        <h3 className="r62-heading-gradient text-sm font-bold flex items-center gap-1.5 mb-3">
          <Users className="h-4 w-4 text-orange-600" />
          Eventos da Comunidade
        </h3>
        <div className="space-y-3">
          {communityEvents.map((event, i) => (
            <EventCard key={event.title} event={event} index={i} />
          ))}
        </div>
      </Section>

      {/* ── 9. Trust Bar ── */}
      <Section>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: sp, stiffness: 300, damping: 26, delay: i * 0.06 }}
              className="r104-trust-badge shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-card border border-border/40"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <badge.icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
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

function ClassCard({ cls, index }: { cls: ClassItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ type: sp, stiffness: 300, damping: 26, delay: index * 0.07, ease: easeOut }}
      className="r104-class-card r62-card-lift rounded-xl border border-border/40 bg-card overflow-hidden"
    >
      {/* Gradient header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ background: cls.gradient }}
      >
        <BookOpen className="h-4 w-4 text-white/80" />
        <span className="text-sm font-bold text-white flex-1 truncate">{cls.title}</span>
        <span className="text-[10px] font-bold text-white/80">{cls.price}</span>
      </div>

      <div className="p-3.5 space-y-2.5">
        {/* Instructor & Rating */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            👤 {cls.instructor}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] text-amber-600 font-semibold">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            {cls.rating}
          </span>
        </div>

        {/* Location & Duration */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{cls.location}</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {cls.duration}
          </span>
          <span className="flex items-center gap-0.5">
            <Users className="h-3 w-3" />
            {cls.students} alunos
          </span>
        </div>

        {/* Level & Next class */}
        <div className="flex items-center justify-between">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${levelColor[cls.level] || 'bg-gray-100 text-gray-700'}`}>
            {cls.level}
          </span>
          <span className="text-[10px] text-amber-600 font-semibold">
            📅 {cls.nextClass}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
            <Button
              size="sm"
              className="w-full min-h-[44px] text-[11px] font-semibold rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
              }}
            >
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              Inscrever-se
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
            <Button
              size="sm"
              variant="outline"
              className="w-full min-h-[44px] text-[11px] font-semibold rounded-lg border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              <Heart className="h-3.5 w-3.5 mr-1" />
              Favoritar
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function InstructorCard({ instructor, index }: { instructor: Instructor; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ type: sp, stiffness: 300, damping: 26, delay: index * 0.06 }}
      className="r104-instructor-card r62-card-lift shrink-0 w-32 rounded-xl border border-border/40 bg-card p-3 flex flex-col items-center gap-2 text-center"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div className={`w-12 h-12 rounded-full ${instructor.color} flex items-center justify-center text-white font-bold text-sm`}>
        {instructor.initials}
      </div>
      <div className="min-w-0 w-full">
        <h4 className="text-[11px] font-bold truncate">{instructor.name}</h4>
        <p className="text-[9px] text-muted-foreground truncate">{instructor.specialty}</p>
      </div>
      <div className="flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold">
        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
        {instructor.rating}
      </div>
      <div className="text-[9px] text-muted-foreground">
        {instructor.students} alunos · {instructor.classes} aulas
      </div>
    </motion.div>
  )
}

function ScheduleCard({ slot, index }: { slot: ScheduleSlot; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
      transition={{ type: sp, stiffness: 300, damping: 26, delay: index * 0.06, ease: easeOut }}
      className="r104-schedule-card r62-card-lift rounded-xl border border-border/40 bg-card p-3.5"
      style={{
        borderLeft: '3px solid rgba(245,158,11,0.4)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold">{slot.className}</h4>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Calendar className="h-3 w-3" />
              {slot.day}
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {slot.time}
            </span>
            <span className="flex items-center gap-0.5">
              <GraduationCap className="h-3 w-3" />
              {slot.instructor}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            slot.spots <= 3
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {slot.spots} vagas
          </span>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              size="sm"
              className="min-h-[44px] text-[10px] font-semibold rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
              }}
            >
              Reservar
            </Button>
          </motion.div>
        </div>
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
      className="r104-tip-card r62-card-lift rounded-xl border border-border/40 bg-card p-3.5"
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
        borderLeft: '3px solid rgba(249,115,22,0.4)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
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
              <Clock className="h-3 w-3" />
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
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
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
      {/* Class cards skeleton */}
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
      {/* Schedule skeleton */}
      <div className="space-y-2.5">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
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
