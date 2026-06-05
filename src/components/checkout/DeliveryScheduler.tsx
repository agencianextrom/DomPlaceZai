'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  Star,
  Truck,
  Package,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Bike,
  Car,
  X,
  Calendar,
  RotateCcw,
  AlertTriangle,
  Home,
  Building2,
  DoorOpen,
  Fence,
  Dog,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

type SlotStatus = 'available' | 'limited' | 'full'

interface TimeSlot {
  id: string
  range: string
  label: string
  status: SlotStatus
  capacity: number
  maxCapacity: number
  fee: number
}

interface DriverInfo {
  name: string
  rating: number
  trips: number
  vehicle: 'moto' | 'carro' | 'bicicleta'
  phone: string
}

type DeliveryStep = 'received' | 'preparing' | 'out_delivery' | 'arriving' | 'delivered'

interface DateOption {
  date: Date
  day: number
  weekday: string
  month: string
  isToday: boolean
  isUnavailable: boolean
  id: string
}

/* ═══════════════════════════════════════════════════════════════════
   Constants & Mock Data
   ═══════════════════════════════════════════════════════════════════ */

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const MOCK_SLOTS: TimeSlot[] = [
  { id: 's08-10', range: '08:00 - 10:00', label: 'Manhã cedo', status: 'available', capacity: 3, maxCapacity: 10, fee: 0 },
  { id: 's10-12', range: '10:00 - 12:00', label: 'Manhã', status: 'available', capacity: 7, maxCapacity: 12, fee: 0 },
  { id: 's12-14', range: '12:00 - 14:00', label: 'Almoço', status: 'limited', capacity: 10, maxCapacity: 12, fee: 3.5 },
  { id: 's14-16', range: '14:00 - 16:00', label: 'Tarde', status: 'available', capacity: 4, maxCapacity: 10, fee: 0 },
  { id: 's16-18', range: '16:00 - 18:00', label: 'Fim de tarde', status: 'limited', capacity: 8, maxCapacity: 10, fee: 2.0 },
  { id: 's18-20', range: '18:00 - 20:00', label: 'Noite', status: 'full', capacity: 15, maxCapacity: 15, fee: 5.0 },
]

const MOCK_DRIVER: DriverInfo = {
  name: 'Carlos Silva',
  rating: 4.9,
  trips: 1247,
  vehicle: 'moto',
  phone: '(91) 99876-5432',
}

const DELIVERY_STEPS: { key: DeliveryStep; label: string; icon: React.ReactNode }[] = [
  { key: 'received', label: 'Pedido recebido', icon: <Package className="h-4 w-4" /> },
  { key: 'preparing', label: 'Preparando', icon: <Truck className="h-4 w-4" /> },
  { key: 'out_delivery', label: 'Saiu para entrega', icon: <MapPin className="h-4 w-4" /> },
  { key: 'arriving', label: 'Chegando', icon: <Bike className="h-4 w-4" /> },
  { key: 'delivered', label: 'Entregue', icon: <CheckCircle2 className="h-4 w-4" /> },
]

const QUICK_INSTRUCTIONS = [
  { id: 'apartment', label: 'Apartamento', icon: Building2 },
  { id: 'gate', label: 'Código do portão', icon: DoorOpen },
  { id: 'fence', label: 'Cerca / Alambrado', icon: Fence },
  { id: 'dog', label: 'Cuidado com o cachorro', icon: Dog },
  { id: 'home', label: 'Casa sem portão', icon: Home },
  { id: 'office', label: 'Entregar na recepção', icon: Building2 },
]

function formatBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

/* ═══════════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, type: 'spring' as const, stiffness: 300, damping: 25 },
  }),
}

const checkPop = {
  hidden: { scale: 0, rotate: -90 },
  visible: { scale: 1, rotate: 0, transition: { type: 'spring' as const, stiffness: 500, damping: 20 } },
}

const slideUp = {
  hidden: { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: '100%', transition: { duration: 0.2 } },
}

/* ═══════════════════════════════════════════════════════════════════
   Helper: Status colours (hex/rgba only)
   ═══════════════════════════════════════════════════════════════════ */

function slotStatusColor(status: SlotStatus) {
  switch (status) {
    case 'available':
      return {
        border: 'border-emerald-200 dark:border-emerald-700/40',
        bg: 'bg-emerald-50 dark:bg-emerald-900/10',
        bar: 'bg-emerald-500',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        hoverShadow: '0 8px 24px rgba(16,185,129,0.15)',
      }
    case 'limited':
      return {
        border: 'border-amber-200 dark:border-amber-700/40',
        bg: 'bg-amber-50 dark:bg-amber-900/10',
        bar: 'bg-amber-500',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
        badgeText: 'text-amber-700 dark:text-amber-300',
        hoverShadow: '0 8px 24px rgba(245,158,11,0.15)',
      }
    case 'full':
      return {
        border: 'border-red-200 dark:border-red-700/40',
        bg: 'bg-red-50 dark:bg-red-900/10',
        bar: 'bg-red-400',
        badgeBg: 'bg-red-100 dark:bg-red-900/30',
        badgeText: 'text-red-700 dark:text-red-300',
        hoverShadow: '0 8px 24px rgba(239,68,68,0.15)',
      }
  }
}

function slotStatusLabel(status: SlotStatus) {
  switch (status) {
    case 'available': return 'Disponível'
    case 'limited': return 'Poucas vagas'
    case 'full': return 'Lotado'
  }
}

function vehicleLabel(v: string) {
  switch (v) {
    case 'moto': return 'Moto'
    case 'carro': return 'Carro'
    case 'bicicleta': return 'Bicicleta'
    default: return v
  }
}

function VehicleIcon({ type }: { type: string }) {
  switch (type) {
    case 'moto': return <Bike className="h-4 w-4" />
    case 'carro': return <Car className="h-4 w-4" />
    default: return <Bike className="h-4 w-4" />
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Generate date options (next 7 days)
   ═══════════════════════════════════════════════════════════════════ */

function generateDates(): DateOption[] {
  const today = new Date()
  const dates: DateOption[] = []
  // Make day 3 (index 3) unavailable as mock
  const unavailableDays = new Set([3])

  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    dates.push({
      date: d,
      day: d.getDate(),
      weekday: WEEKDAYS[d.getDay()],
      month: MONTHS[d.getMonth()],
      isToday: i === 0,
      isUnavailable: unavailableDays.has(i),
      id: d.toISOString().slice(0, 10),
    })
  }
  return dates
}

/* ═══════════════════════════════════════════════════════════════════
   Skeleton loader
   ═══════════════════════════════════════════════════════════════════ */

function SchedulerSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-4 w-40" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-16 rounded-xl shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-24 rounded-xl" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Delivery Route SVG (pickup → transit → delivery)
   ═══════════════════════════════════════════════════════════════════ */

function DeliveryRouteSVG({ currentStep }: { currentStep: DeliveryStep }) {
  const progress = DELIVERY_STEPS.findIndex(s => s.key === currentStep)
  const routeProgress = Math.min((progress + 0.5) / (DELIVERY_STEPS.length - 1), 1)

  return (
    <svg viewBox="0 0 320 60" className="w-full h-16 r34-route-svg" fill="none">
      {/* Dashed background path */}
      <path d="M 20 30 Q 80 10 160 30 T 300 30" stroke="rgba(148,163,184,0.3)" strokeWidth="2" strokeDasharray="6 4" />
      {/* Animated progress path */}
      <motion.path
        d="M 20 30 Q 80 10 160 30 T 300 30"
        stroke="rgba(16,185,129,0.7)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: routeProgress }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      {/* Pickup dot */}
      <circle cx="20" cy="30" r="6" fill="rgba(16,185,129,0.9)" />
      <text x="20" y="50" textAnchor="middle" fontSize="8" fill="rgba(100,116,139,0.9)" fontWeight="600">Retirada</text>
      {/* Delivery dot */}
      <circle cx="300" cy="30" r="6" fill="rgba(16,185,129,0.25)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" />
      <text x="300" y="50" textAnchor="middle" fontSize="8" fill="rgba(100,116,139,0.9)" fontWeight="600">Entrega</text>
      {/* Animated moving dot */}
      <motion.circle
        cx="0" cy="0" r="4"
        fill="#10b981"
        filter="url(#glow)"
        animate={{
          offsetDistance: `${routeProgress * 100}%`,
        }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        style={{ offsetPath: 'path("M 20 30 Q 80 10 160 30 T 300 30")', offsetRotate: 'auto' }}
      />
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Real-time Status Steps
   ═══════════════════════════════════════════════════════════════════ */

function StatusSteps({ current }: { current: DeliveryStep }) {
  const idx = DELIVERY_STEPS.findIndex(s => s.key === current)
  return (
    <div className="flex items-center gap-0 overflow-x-auto hide-scrollbar py-2 r34-status-steps">
      {DELIVERY_STEPS.map((step, i) => {
        const done = i < idx
        const active = i === idx
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center min-w-[60px]">
              <motion.div
                animate={active ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs transition-colors duration-300 ${
                  done ? 'bg-emerald-500' : active ? 'bg-primary r34-step-pulse' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
              </motion.div>
              <span className={`text-[9px] mt-1 font-medium text-center leading-tight whitespace-nowrap ${
                done ? 'text-emerald-600 dark:text-emerald-400' : active ? 'text-foreground font-bold' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
            {i < DELIVERY_STEPS.length - 1 && (
              <div className="h-0.5 w-6 sm:w-10 mx-0.5 rounded-full bg-muted relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full r34-progress-shimmer"
                  initial={{ width: 0 }}
                  animate={{ width: done ? '100%' : '0%' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Driver Card
   ═══════════════════════════════════════════════════════════════════ */

function DriverCard({ driver }: { driver: DriverInfo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
      className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card r34-driver-card"
    >
      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
        {driver.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{driver.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 text-amber-400" fill="rgba(251,191,36,0.9)" />
            <span className="text-[11px] font-semibold">{driver.rating}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground">{driver.trips} entregas</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <div className="flex items-center gap-0.5 text-muted-foreground">
            <VehicleIcon type={driver.vehicle} />
            <span className="text-[10px]">{vehicleLabel(driver.vehicle)}</span>
          </div>
        </div>
      </div>
      <motion.div className="flex items-center gap-1.5">
        <motion.button whileTap={{ scale: 0.9 }} className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
          <Phone className="h-4 w-4" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <MessageSquare className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Reschedule Modal
   ═══════════════════════════════════════════════════════════════════ */

function RescheduleModal({
  open,
  onClose,
  dates,
  slots,
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  dates: DateOption[]
  slots: TimeSlot[]
  selectedDate: string | null
  selectedSlot: string | null
  onSelectDate: (id: string) => void
  onSelectSlot: (id: string) => void
  onConfirm: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-2xl bg-card border-t border-border/60 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <RotateCcw className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-bold text-base">Reagendar entrega</h3>
              </div>
              <button onClick={onClose} className="min-h-[44px] min-w-[44px] h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Nova data</p>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {dates.filter(d => !d.isUnavailable && !d.isToday).map((d) => (
                    <motion.button
                      key={d.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSelectDate(d.id)}
                      className={`shrink-0 w-14 h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                        selectedDate === d.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span className="text-[10px] text-muted-foreground">{d.weekday}</span>
                      <span className={`text-lg font-bold ${selectedDate === d.id ? 'text-primary' : ''}`}>{d.day}</span>
                      <span className="text-[9px] text-muted-foreground">{d.month}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Horário</p>
                <div className="grid grid-cols-2 gap-2">
                  {slots.filter(s => s.status !== 'full').map((s) => {
                    const col = slotStatusColor(s.status)
                    return (
                      <motion.button
                        key={s.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onSelectSlot(s.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-colors ${selectedSlot === s.id ? 'border-primary bg-primary/5' : `${col.border} ${col.bg}`}`}
                      >
                        <p className="font-semibold text-xs">{s.label}</p>
                        <p className="text-[10px] text-muted-foreground">{s.range}</p>
                        <p className="text-[10px] mt-1 font-semibold">{s.fee === 0 ? 'Grátis' : formatBRL(s.fee)}</p>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border/40">
              <Button
                onClick={onConfirm}
                disabled={!selectedDate || !selectedSlot}
                className="w-full bg-gradient-to-r from-primary to-emerald-600 text-white font-semibold rounded-xl h-11"
              >
                Confirmar reagendamento
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════ */

export function DeliveryScheduler() {
  const [isLoading, setIsLoading] = useState(true)
  const [dates] = useState<DateOption[]>(generateDates)
  const [slots] = useState<TimeSlot[]>(MOCK_SLOTS)
  const [driver] = useState<DriverInfo>(MOCK_DRIVER)
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const d = generateDates()
    const today = d.find(x => x.isToday)
    return today?.id ?? null
  })
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [instructions, setInstructions] = useState('')
  const [activeQuickTags, setActiveQuickTags] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<DeliveryStep>('preparing')
  const [showReschedule, setShowReschedule] = useState(false)
  const [reschedDate, setReschedDate] = useState<string | null>(null)
  const [reschedSlot, setReschedSlot] = useState<string | null>(null)

  // Simulate loading
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  // Auto-advance delivery step demo
  useEffect(() => {
    const order: DeliveryStep[] = ['received', 'preparing', 'out_delivery', 'arriving', 'delivered']
    let i = order.indexOf(currentStep)
    const timer = setInterval(() => {
      i = Math.min(i + 1, order.length - 1)
      setCurrentStep(order[i])
      if (i >= order.length - 1) clearInterval(timer)
    }, 5000)
    return () => clearInterval(timer)
  }, [])



  const toggleQuickTag = useCallback((id: string) => {
    setActiveQuickTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }, [])

  const handleConfirmReschedule = () => {
    if (reschedDate && reschedSlot) {
      setSelectedDate(reschedDate)
      setSelectedSlot(reschedSlot)
      setShowReschedule(false)
      setReschedDate(null)
      setReschedSlot(null)
    }
  }

  const selectedDateObj = dates.find(d => d.id === selectedDate)
  const selectedSlotObj = slots.find(s => s.id === selectedSlot)

  if (isLoading) return <SchedulerSkeleton />

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="rounded-2xl border border-border/60 bg-card overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring' as const, stiffness: 350, damping: 20, delay: 0.1 }}
          className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-md"
        >
          <CalendarDays className="h-5 w-5 text-white" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm sm:text-base">Agendar entrega</h2>
          <p className="text-xs text-muted-foreground truncate">Escolha data, horário e instruções</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowReschedule(true)}
          className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 rounded-lg px-2.5 py-1.5 font-semibold"
        >
          <RotateCcw className="h-3 w-3" />
          Reagendar
        </motion.button>
      </div>

      {/* ── 1. Date Picker ── */}
      <div className="px-4 pb-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> Data da entrega
        </p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <AnimatePresence>
            {dates.map((d, i) => (
              <motion.button
                key={d.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileTap={{ scale: 0.93 }}
                onClick={() => !d.isUnavailable && setSelectedDate(d.id)}
                disabled={d.isUnavailable}
                className={`relative shrink-0 w-[60px] h-[72px] rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 overflow-hidden ${
                  d.isUnavailable
                    ? 'border-border/40 opacity-40 cursor-not-allowed bg-muted/30'
                    : selectedDate === d.id
                      ? 'border-primary bg-primary/10 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]'
                      : 'border-border hover:border-primary/30'
                } ${d.isToday && !d.isUnavailable ? 'ring-2 ring-primary/30' : ''}`}
              >
                {d.isToday && (
                  <span className="absolute top-1 right-1 text-[8px] font-bold text-primary bg-primary/15 rounded px-1">Hoje</span>
                )}
                {d.isUnavailable && <AlertTriangle className="absolute top-1 right-1 h-3 w-3 text-amber-400" />}
                <span className="text-[10px] text-muted-foreground">{d.weekday}</span>
                <span className={`text-xl font-bold ${selectedDate === d.id ? 'text-primary' : ''}`}>{d.day}</span>
                <span className="text-[9px] text-muted-foreground">{d.month}</span>
                {/* Animated selection ring */}
                <AnimatePresence>
                  {selectedDate === d.id && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-primary"
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── 2. Time Slot Grid ── */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Horário de entrega
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <AnimatePresence>
            {slots.map((slot, i) => {
              const col = slotStatusColor(slot.status)
              const isSelected = selectedSlot === slot.id
              const isFull = slot.status === 'full'
              const pct = Math.min((slot.capacity / slot.maxCapacity) * 100, 100)
              return (
                <motion.button
                  key={slot.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={isFull ? {} : { y: -3, boxShadow: col.hoverShadow }}
                  whileTap={isFull ? {} : { scale: 0.97 }}
                  onClick={() => !isFull && setSelectedSlot(slot.id)}
                  disabled={isFull}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 overflow-hidden ${
                    isSelected ? `border-primary ${col.bg} shadow-[0_2px_16px_rgba(16,185,129,0.15)]` : `${col.border}`
                  } ${isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {/* Check mark */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div variants={checkPop} initial="hidden" animate="visible" exit="hidden" className="absolute top-2 right-2">
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="font-bold text-xs">{slot.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{slot.range}</p>
                  {/* Capacity bar */}
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${col.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 + i * 0.05 }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <Badge variant="outline" className={`text-[9px] font-semibold px-1.5 py-0 ${col.badgeBg} ${col.badgeText} border-transparent`}>
                      {slotStatusLabel(slot.status)}
                    </Badge>
                    <span className="text-[10px] font-bold">{slot.fee === 0 ? 'Grátis' : formatBRL(slot.fee)}</span>
                  </div>
                  {/* Full overlay */}
                  {isFull && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-xl">
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg">Lotado</span>
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── 3. Driver Assignment ── */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" /> Entregador atribuído
        </p>
        <DriverCard driver={driver} />
      </div>

      {/* ── 4. Delivery Route Visualization ── */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> Rota de entrega
        </p>
        <div className="p-3 rounded-xl border border-border/60 bg-gradient-to-r from-emerald-50/40 to-teal-50/40 dark:from-emerald-900/5 dark:to-teal-900/5">
          <DeliveryRouteSVG currentStep={currentStep} />
        </div>
      </div>

      {/* ── 5. Real-time Status ── */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5" /> Status do pedido
        </p>
        <div className="p-3 rounded-xl border border-border/60 bg-card">
          <StatusSteps current={currentStep} />
        </div>
      </div>

      {/* ── 6. Delivery Instructions ── */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" /> Instruções de entrega
        </p>
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Ex: Apartamento 42, torre B, interfone 1042..."
            className="w-full p-3 text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/60 min-h-[60px]"
            rows={2}
          />
          <div className="px-3 pb-3 flex flex-wrap gap-1.5">
            {QUICK_INSTRUCTIONS.map((tag) => {
              const Icon = tag.icon
              const active = activeQuickTags.includes(tag.id)
              return (
                <motion.button
                  key={tag.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => toggleQuickTag(tag.id)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {tag.label}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Selected summary ── */}
      <AnimatePresence>
        {selectedDateObj && selectedSlotObj && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="border-t border-border/60 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <CalendarDays className="h-4 w-4 text-primary" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">
                  Entrega: {selectedDateObj.weekday}, {selectedDateObj.day} {selectedDateObj.month} · {selectedSlotObj.range}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {selectedSlotObj.label} · Taxa: {selectedSlotObj.fee === 0 ? 'Grátis' : formatBRL(selectedSlotObj.fee)}
                  {activeQuickTags.length > 0 && ` · ${activeQuickTags.length} instrução(ões)`}
                </p>
              </div>
              <motion.div
                key={(selectedDate ?? '') + (selectedSlot ?? '')}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                className="h-6 w-6 rounded-full bg-primary flex items-center justify-center"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 7. Reschedule Modal ── */}
      <RescheduleModal
        open={showReschedule}
        onClose={() => { setShowReschedule(false); setReschedDate(null); setReschedSlot(null) }}
        dates={dates}
        slots={slots}
        selectedDate={reschedDate}
        selectedSlot={reschedSlot}
        onSelectDate={setReschedDate}
        onSelectSlot={setReschedSlot}
        onConfirm={handleConfirmReschedule}
      />
    </motion.section>
  )
}
