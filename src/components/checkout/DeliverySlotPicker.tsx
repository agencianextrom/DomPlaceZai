'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Check,
  Truck,
  CalendarDays,
  Shield,
  Star,
  AlertTriangle,
  Timer,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

/* ───────────────────────────────────────────────────────────────
   Types & Interfaces
   ─────────────────────────────────────────────────────────────── */

type SlotStatus = 'available' | 'limited' | 'full'
type WeatherType = 'sol' | 'nublado' | 'chuva'

interface DeliverySlot {
  id: string
  label: string
  timeRange: string
  period: 'manhã' | 'tarde' | 'noite' | 'expresso'
  fee: number
  estimatedMinutes: number
  capacity: number
  maxCapacity: number
  status: SlotStatus
  weather: WeatherType
  isPopular: boolean
  isExpress: boolean
}

interface DeliverySlotPickerProps {
  selectedSlot: string | null
  onSlotSelect: (slotId: string) => void
  storeName: string
  storeDeliveryFee: number
}

/* ───────────────────────────────────────────────────────────────
   Helper: format currency
   ─────────────────────────────────────────────────────────────── */

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/* ───────────────────────────────────────────────────────────────
   Weather icon mapper
   ─────────────────────────────────────────────────────────────── */

function WeatherIcon({ type, size = 14 }: { type: WeatherType; size?: number }) {
  switch (type) {
    case 'sol':
      return <Sun className={`text-amber-500 r26-weather-bob`} style={{ width: size, height: size }} />
    case 'nublado':
      return <Cloud className="text-slate-400 r26-weather-bob" style={{ width: size, height: size, animationDelay: '0.3s' }} />
    case 'chuva':
      return <CloudRain className="text-cyan-500 r26-weather-bob" style={{ width: size, height: size, animationDelay: '0.6s' }} />
  }
}

function WeatherLabel({ type }: { type: WeatherType }) {
  const labels: Record<WeatherType, string> = {
    sol: 'Ensolarado',
    nublado: 'Nublado',
    chuva: 'Chovendo',
  }
  return <span className="text-[10px] text-muted-foreground">{labels[type]}</span>
}

/* ───────────────────────────────────────────────────────────────
   Status color mappings
   ─────────────────────────────────────────────────────────────── */

function getStatusColor(status: SlotStatus) {
  switch (status) {
    case 'available':
      return {
        border: 'border-emerald-200 dark:border-emerald-700/40',
        bg: 'bg-emerald-50 dark:bg-emerald-900/10',
        barColor: 'bg-emerald-500',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        hoverShadow: 'hover:shadow-[0_4px_20px_oklch(0.55_0.15_155/0.15)]',
      }
    case 'limited':
      return {
        border: 'border-amber-200 dark:border-amber-700/40',
        bg: 'bg-amber-50 dark:bg-amber-900/10',
        barColor: 'bg-amber-500',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
        badgeText: 'text-amber-700 dark:text-amber-300',
        hoverShadow: 'hover:shadow-[0_4px_20px_oklch(0.75_0.18_85/0.15)]',
      }
    case 'full':
      return {
        border: 'border-red-200 dark:border-red-700/40',
        bg: 'bg-red-50 dark:bg-red-900/10',
        barColor: 'bg-red-400',
        badgeBg: 'bg-red-100 dark:bg-red-900/30',
        badgeText: 'text-red-700 dark:text-red-300',
        hoverShadow: '',
      }
  }
}

function getStatusLabel(status: SlotStatus) {
  switch (status) {
    case 'available':
      return 'Disponível'
    case 'limited':
      return 'Vagas limitadas'
    case 'full':
      return 'Lotado'
  }
}

/* ───────────────────────────────────────────────────────────────
   Period icon
   ─────────────────────────────────────────────────────────────── */

function PeriodIcon({ period, size = 18 }: { period: string; size?: number }) {
  switch (period) {
    case 'manhã':
      return <Sun className="text-amber-500" style={{ width: size, height: size }} />
    case 'tarde':
      return <Cloud className="text-orange-400" style={{ width: size, height: size }} />
    case 'noite':
      return <Clock className="text-indigo-400" style={{ width: size, height: size }} />
    case 'expresso':
      return <Zap className="text-yellow-500" style={{ width: size, height: size }} />
    default:
      return <Clock className="text-muted-foreground" style={{ width: size, height: size }} />
  }
}

/* ───────────────────────────────────────────────────────────────
   Capacity bar component
   ─────────────────────────────────────────────────────────────── */

function CapacityBar({ capacity, maxCapacity, barColor }: { capacity: number; maxCapacity: number; barColor: string }) {
  const pct = Math.min((capacity / maxCapacity) * 100, 100)

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground">
          {maxCapacity - capacity} vagas restantes
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor} r26-capacity-shimmer relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Slot card variants
   ─────────────────────────────────────────────────────────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  }),
}

const checkmarkVariants = {
  hidden: { scale: 0, rotate: -90 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 500, damping: 20 },
  },
}

const pulseVariants = {
  animate: {
    scale: [1, 1.08, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const badgePulseVariants = {
  animate: {
    opacity: [1, 0.6, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

/* ───────────────────────────────────────────────────────────────
   Mock data: delivery slots
   ─────────────────────────────────────────────────────────────── */

function generateSlots(storeDeliveryFee: number): DeliverySlot[] {
  return [
    {
      id: 'expresso-30',
      label: 'Expresso',
      timeRange: '30-45 min',
      period: 'expresso',
      fee: storeDeliveryFee + 5.00,
      estimatedMinutes: 35,
      capacity: 3,
      maxCapacity: 8,
      status: 'limited',
      weather: 'sol',
      isPopular: false,
      isExpress: true,
    },
    {
      id: 'manha-09-12',
      label: 'Manhã',
      timeRange: '09:00 - 12:00',
      period: 'manhã',
      fee: storeDeliveryFee,
      estimatedMinutes: 120,
      capacity: 5,
      maxCapacity: 15,
      status: 'available',
      weather: 'sol',
      isPopular: true,
      isExpress: false,
    },
    {
      id: 'tarde-12-16',
      label: 'Tarde',
      timeRange: '12:00 - 16:00',
      period: 'tarde',
      fee: storeDeliveryFee,
      estimatedMinutes: 180,
      capacity: 9,
      maxCapacity: 12,
      status: 'limited',
      weather: 'nublado',
      isPopular: false,
      isExpress: false,
    },
    {
      id: 'noite-18-21',
      label: 'Noite',
      timeRange: '18:00 - 21:00',
      period: 'noite',
      fee: storeDeliveryFee + 2.00,
      estimatedMinutes: 240,
      capacity: 12,
      maxCapacity: 12,
      status: 'full',
      weather: 'chuva',
      isPopular: false,
      isExpress: false,
    },
    {
      id: 'manha-07-09',
      label: 'Cedo',
      timeRange: '07:00 - 09:00',
      period: 'manhã',
      fee: storeDeliveryFee,
      estimatedMinutes: 90,
      capacity: 2,
      maxCapacity: 10,
      status: 'available',
      weather: 'sol',
      isPopular: false,
      isExpress: false,
    },
    {
      id: 'tarde-16-18',
      label: 'Fim de tarde',
      timeRange: '16:00 - 18:00',
      period: 'tarde',
      fee: storeDeliveryFee + 1.00,
      estimatedMinutes: 210,
      capacity: 7,
      maxCapacity: 14,
      status: 'available',
      weather: 'nublado',
      isPopular: false,
      isExpress: false,
    },
  ]
}

/* ───────────────────────────────────────────────────────────────
   Skeleton loader
   ─────────────────────────────────────────────────────────────── */

function DeliverySlotSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Main component: DeliverySlotPicker
   ─────────────────────────────────────────────────────────────── */

export function DeliverySlotPicker({
  selectedSlot,
  onSlotSelect,
  storeName,
  storeDeliveryFee,
}: DeliverySlotPickerProps) {
  const [slots, setSlots] = useState<DeliverySlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Simulate loading + generate slot data
  useEffect(() => {
    const timer = setTimeout(() => {
      setSlots(generateSlots(storeDeliveryFee))
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [storeDeliveryFee])

  // Update current time for "agora" display
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const handleSelect = (slot: DeliverySlot) => {
    if (slot.status === 'full') return
    onSlotSelect(slot.id)
  }

  const selectedSlotData = slots.find((s) => s.id === selectedSlot)

  // ── Loading state ──
  if (isLoading) {
    return <DeliverySlotSkeleton />
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="rounded-2xl border border-border/60 bg-card overflow-hidden r26-gradient-border"
    >
      {/* ── Section header ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring' as const, stiffness: 350, damping: 20, delay: 0.1 }}
          className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md"
        >
          <Truck className="h-5 w-5 text-white" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm sm:text-base text-foreground">
            Escolha o horário de entrega
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {storeName} · {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · Frete base {formatBRL(storeDeliveryFee)}
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted rounded-lg px-2 py-1"
        >
          <Shield className="h-3 w-3 text-emerald-500" />
          Garantia
        </motion.div>
      </div>

      {/* ── Slot grid ── */}
      <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {slots.map((slot, index) => {
            const isSelected = selectedSlot === slot.id
            const isFull = slot.status === 'full'
            const colors = getStatusColor(slot.status)

            return (
              <motion.button
                key={slot.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={isFull ? {} : { y: -4, boxShadow: '0 8px 30px rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.5)' }}
                whileTap={isFull ? {} : { scale: 0.97 }}
                onClick={() => handleSelect(slot)}
                disabled={isFull}
                className={`
                  relative rounded-xl border-2 p-4 text-left transition-all duration-200 overflow-hidden
                  ${isSelected ? `border-primary ${colors.bg} shadow-[0_2px_16px_oklch(0.55_0.15_155/0.15)]` : `${colors.border} ${colors.hoverShadow}`}
                  ${isFull ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* ── Animated selection checkmark ── */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      variants={checkmarkVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="absolute top-2.5 right-2.5 z-10 r26-check-ring"
                    >
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── "Rápido" badge for express ── */}
                {slot.isExpress && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="absolute top-2.5 left-2.5"
                  >
                    <motion.div variants={pulseVariants} animate="animate">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 text-[9px] px-1.5 py-0 font-bold shadow-sm gap-0.5 r26-badge-wobble">
                        <Zap className="h-2.5 w-2.5" />
                        Rápido
                      </Badge>
                    </motion.div>
                  </motion.div>
                )}

                {/* ── "Popular" badge with pulse ── */}
                {slot.isPopular && !isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05, type: 'spring' as const, stiffness: 400, damping: 20 }}
                    className="absolute top-2.5 right-2.5"
                  >
                    <motion.div variants={badgePulseVariants} animate="animate">
                      <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 text-[9px] px-1.5 py-0 font-bold shadow-sm gap-0.5 r26-popular-wobble">
                        <Star className="h-2.5 w-2.5" />
                        Popular
                      </Badge>
                    </motion.div>
                  </motion.div>
                )}

                {/* ── Card content ── */}
                <div className="flex items-start gap-3 mt-1">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                    className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 r26-icon-bob ${
                      isSelected
                        ? 'bg-primary/15'
                        : 'bg-muted'
                    }`}
                  >
                    <PeriodIcon period={slot.period} size={20} />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    {/* Period label + time range */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{slot.label}</span>
                      <span className="text-xs text-muted-foreground">{slot.timeRange}</span>
                    </div>

                    {/* Estimated delivery */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <Timer className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        ~{slot.estimatedMinutes} min
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <WeatherIcon type={slot.weather} size={12} />
                      <WeatherLabel type={slot.weather} />
                    </div>
                  </div>
                </div>

                {/* ── Fee display ── */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 ${colors.badgeBg} ${colors.badgeText} border-transparent`}>
                      {slot.fee === 0 ? 'Grátis' : formatBRL(slot.fee)}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${colors.badgeBg} ${colors.badgeText} border-transparent`}>
                      {getStatusLabel(slot.status)}
                    </Badge>
                  </div>
                </div>

                {/* ── Capacity bar ── */}
                <CapacityBar
                  capacity={slot.capacity}
                  maxCapacity={slot.maxCapacity}
                  barColor={colors.barColor}
                />

                {/* ── Full slot overlay ── */}
                {isFull && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center rounded-xl"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-200/60 dark:border-red-800/40">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Horário lotado
                    </div>
                  </motion.div>
                )}

                {/* ── Selected glow ring ── */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-xl pointer-events-none"
                    >
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 0 0 oklch(0.55 0.15 155/0.2)',
                            '0 0 0 4px oklch(0.55 0.15 155/0)',
                          ],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-xl"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {/* ── Selected slot summary ── */}
      <AnimatePresence>
        {selectedSlotData && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 10 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="border-t border-border/60 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <CalendarDays className="h-4 w-4 text-primary" />
                </motion.div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Horário selecionado: {selectedSlotData.label} ({selectedSlotData.timeRange})
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Taxa: {selectedSlotData.fee === 0 ? 'Grátis' : formatBRL(selectedSlotData.fee)} · Estimativa: ~{selectedSlotData.estimatedMinutes} min
                  </p>
                </div>
              </div>
              <motion.div
                key={selectedSlot}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                className="h-5 w-5 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="h-3 w-3 text-primary-foreground" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
