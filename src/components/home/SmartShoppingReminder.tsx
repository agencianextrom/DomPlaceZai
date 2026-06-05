'use client'
/* ─── SmartShoppingReminder ─── "Lembretes Inteligentes" ───
   Smart shopping reminders: recurring items, expiring deals, 
   price drop alerts, seasonal suggestions, restock reminders.
   Teal/cyan theme with emerald accents. */

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Bell, Clock, TrendingDown, Package, Leaf, Star,
  ChevronRight, Check, X, RefreshCw, ShoppingCart,
  AlertTriangle, Sparkles, Zap, Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Reminder {
  id: string
  title: string
  subtitle: string
  type: 'recurring' | 'expiring' | 'price_drop' | 'restock' | 'seasonal'
  icon: React.ElementType
  urgency: 'low' | 'medium' | 'high'
  action: string
  time: string
  color: string
  completed: boolean
}

interface ShoppingPattern {
  label: string
  value: string
  icon: React.ElementType
  color: string
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const reminders: Reminder[] = [
  {
    id: '1', title: 'Pão Integral', subtitle: 'Você costuma comprar toda segunda',
    type: 'recurring', icon: RefreshCw, urgency: 'medium', action: 'Adicionar',
    time: 'Hoje', color: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30',
    completed: false,
  },
  {
    id: '2', title: 'Desconto no Arroz', subtitle: '-15% — termina em 2h',
    type: 'expiring', icon: Flame, urgency: 'high', action: 'Ver Oferta',
    time: '2h restantes', color: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
    completed: false,
  },
  {
    id: '3', title: 'Leite em Pó', subtitle: 'Preço caiu R$ 3,50 (12%)',
    type: 'price_drop', icon: TrendingDown, urgency: 'medium', action: 'Ver Preço',
    time: 'Ontem', color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
    completed: false,
  },
  {
    id: '4', title: 'Detergente Líquido', subtitle: 'De volta no estoque!',
    type: 'restock', icon: Package, urgency: 'low', action: 'Comprar',
    time: 'Agora', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    completed: false,
  },
  {
    id: '5', title: 'Frutas da Estação', subtitle: 'Manga espada, cupuaçu, açaí',
    type: 'seasonal', icon: Leaf, urgency: 'low', action: 'Explorar',
    time: 'Temporada', color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
    completed: false,
  },
]

const patterns: ShoppingPattern[] = [
  { label: 'Compras/mês', value: '18', icon: ShoppingCart, color: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30' },
  { label: 'Economia', value: 'R$ 127', icon: TrendingDown, color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' },
  { label: 'Frequência', value: '2x/semana', icon: Clock, color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' },
  { label: 'Itens recorrentes', value: '12', icon: Star, color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30' },
]

const tips = [
  { icon: Zap, title: 'Compre à noite', desc: 'Muitas lojas atualizam preços entre 22h e 6h', color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' },
  { icon: Sparkles, title: 'Hábitos inteligentes', desc: 'Listas recorrentes economizam até 25% por mês', color: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30' },
]

const urgencyBg: Record<string, string> = {
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const urgencyLabel: Record<string, string> = {
  high: 'Urgente',
  medium: 'Atenção',
  low: 'Normal',
}

// ─── Constants ──────────────────────────────────────────────────────────────────
const sp = 'spring' as const
const easeOut = 'easeOut' as const

// ─── Component ────────────────────────────────────────────────────────────────
export default function SmartShoppingReminder() {
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const filters = ['Todos', 'Recorrentes', 'Ofertas', 'Preço', 'Estoque', 'Saison']

  const filteredReminders = reminders.filter((r) => {
    if (activeFilter === 'Todos') return true
    if (activeFilter === 'Recorrentes') return r.type === 'recurring'
    if (activeFilter === 'Ofertas') return r.type === 'expiring'
    if (activeFilter === 'Preço') return r.type === 'price_drop'
    if (activeFilter === 'Estoque') return r.type === 'restock'
    if (activeFilter === 'Saison') return r.type === 'seasonal'
    return true
  })

  const handleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const activeReminders = filteredReminders.filter((r) => !completedIds.has(r.id))
  const completedReminders = filteredReminders.filter((r) => completedIds.has(r.id))

  if (loading) return <LoadingSkeleton />

  return (
    <motion.div
      ref={ref}
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
            background: 'linear-gradient(135deg, #0d9488, #14b8a6, #2dd4bf)',
            boxShadow: '0 4px 16px rgba(13,148,136,0.25)',
          }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white tracking-tight">Lembretes Inteligentes 🔔</h2>
            <p className="text-[11px] text-white/70 font-medium">Nunca esqueça suas compras favoritas</p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
            <AlertTriangle className="h-3.5 w-3.5 text-teal-200" />
            <span className="text-[11px] font-bold text-teal-100">{activeReminders.length} ativos</span>
          </div>
        </div>
      </Section>

      {/* ── 2. Stats Row ── */}
      <Section>
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
          {patterns.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: sp, stiffness: 300, damping: 26, delay: i * 0.06 }}
              className="r62-card-lift shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-card border border-border/40 min-w-[90px]"
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

      {/* ── 3. Filter Tabs ── */}
      <Section>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
          {filters.map((filter, i) => (
            <motion.button
              key={filter}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: sp, stiffness: 300, damping: 26, delay: i * 0.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-[11px] font-medium border min-h-[44px] transition-colors ${
                activeFilter === filter
                  ? 'border-teal-500 bg-teal-500 text-white'
                  : 'border-border bg-card text-muted-foreground hover:border-teal-300'
              }`}
            >
              {filter}
            </motion.button>
          ))}
        </div>
      </Section>

      {/* ── 4. Active Reminders ── */}
      <Section>
        <h3 className="r62-heading-gradient text-sm font-bold flex items-center gap-1.5 mb-3">
          <Bell className="h-4 w-4 text-teal-600" />
          Lembretes Ativos
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        </h3>
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {activeReminders.map((reminder, i) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                index={i}
                onComplete={handleComplete}
              />
            ))}
          </AnimatePresence>
          {activeReminders.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 text-[12px] text-muted-foreground"
            >
              <Check className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              Todos os lembretes concluídos! 🎉
            </motion.div>
          )}
        </div>
      </Section>

      {/* ── 5. Completed ── */}
      {completedReminders.length > 0 && (
        <Section>
          <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3 text-muted-foreground">
            <Check className="h-4 w-4 text-emerald-500" />
            Concluídos ({completedReminders.length})
          </h3>
          <div className="space-y-2">
            {completedReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                index={0}
                onComplete={handleComplete}
                completed
              />
            ))}
          </div>
        </Section>
      )}

      {/* ── 6. Quick Tips ── */}
      <Section>
        <h3 className="r62-heading-gradient text-sm font-bold flex items-center gap-1.5 mb-3">
          <Sparkles className="h-4 w-4 text-teal-600" />
          Dicas de Compras
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <TipCard key={tip.title} tip={tip} index={i} />
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

function ReminderCard({
  reminder,
  index,
  onComplete,
  completed = false,
}: {
  reminder: Reminder
  index: number
  onComplete: (id: string) => void
  completed?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const Icon = reminder.icon

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
      exit={{ opacity: 0, x: 12, scale: 0.95 }}
      transition={{ type: sp, stiffness: 300, damping: 26, delay: index * 0.06, ease: easeOut }}
      className={`r62-card-lift rounded-xl border border-border/40 bg-card p-3.5 ${completed ? 'opacity-60' : ''}`}
      style={{
        borderLeft: `3px solid ${
          reminder.urgency === 'high'
            ? 'rgba(239,68,68,0.4)'
            : reminder.urgency === 'medium'
              ? 'rgba(245,158,11,0.4)'
              : 'rgba(13,148,136,0.4)'
        }`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${reminder.color}`}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4 className="text-xs font-bold truncate">{reminder.title}</h4>
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${urgencyBg[reminder.urgency]}`}>
              {urgencyLabel[reminder.urgency]}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{reminder.subtitle}</p>
          <div className="flex items-center gap-1 mt-1 text-[9px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            {reminder.time}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!completed && (
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                size="sm"
                className="min-h-[44px] min-w-[44px] text-[10px] font-semibold rounded-lg px-3"
                style={{
                  background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                  boxShadow: '0 2px 8px rgba(13,148,136,0.25)',
                }}
              >
                {reminder.action}
              </Button>
            </motion.div>
          )}
          <motion.div whileTap={{ scale: 0.9 }}>
            <button
              onClick={() => onComplete(reminder.id)}
              className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors min-h-[44px] min-w-[44px] ${
                completed
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 text-emerald-600'
                  : 'border-border bg-card hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              }`}
            >
              {completed ? (
                <X className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function TipCard({ tip, index }: { tip: typeof tips[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const Icon = tip.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ type: sp, stiffness: 300, damping: 26, delay: index * 0.07, ease: easeOut }}
      className="r62-card-lift rounded-xl border border-border/40 bg-card p-3.5"
    >
      <div className="flex items-start gap-3">
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${tip.color}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold mb-0.5">{tip.title}</h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{tip.desc}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-20 rounded-xl bg-muted/50 animate-pulse" />
      <div className="flex gap-2.5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 w-[90px] rounded-xl bg-muted/40 animate-pulse shrink-0" />
        ))}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-[44px] w-20 rounded-full bg-muted/40 animate-pulse shrink-0" />
        ))}
      </div>
      <div className="space-y-2.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2].map(i => (
          <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
