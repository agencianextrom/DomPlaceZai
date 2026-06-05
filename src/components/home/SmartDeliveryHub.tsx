'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck,
  Package,
  MapPin,
  Clock,
  Star,
  Check,
  Navigation,
  MessageSquare,
  Calendar,
  Route,
  ShieldCheck,
  Bell,
  Timer,
  ChevronRight,
  Zap,
  TrendingUp,
  Heart,
  ThumbsUp,
  Send,
  ToggleLeft,
  ToggleRight,
  Phone,
  CircleDot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

/* ══════════════════════════════════════════════════════
   Mock Data
   ══════════════════════════════════════════════════════ */

interface ActiveDelivery {
  id: string
  trackingNumber: string
  storeName: string
  storeIcon: string
  status: 'Em trânsito' | 'Preparando' | 'Saiu para entrega'
  progress: number
  eta: string
  items: string[]
}

const activeDeliveries: ActiveDelivery[] = [
  {
    id: 'del-1',
    trackingNumber: 'DMP-48291',
    storeName: 'Padaria Pão Dourado',
    storeIcon: '🍞',
    status: 'Saiu para entrega',
    progress: 75,
    eta: '18:45',
    items: ['Pão francês', 'Bolo de chocolate'],
  },
  {
    id: 'del-2',
    trackingNumber: 'DMP-48293',
    storeName: 'Hortifruti Vida Verde',
    storeIcon: '🥬',
    status: 'Em trânsito',
    progress: 50,
    eta: '19:20',
    items: ['Alface', 'Tomate', 'Banana'],
  },
  {
    id: 'del-3',
    trackingNumber: 'DMP-48295',
    storeName: 'Farmácia Saúde+',
    storeIcon: '💊',
    status: 'Preparando',
    progress: 25,
    eta: '20:10',
    items: ['Vitamina C', 'Dorflex'],
  },
]

interface DeliveryHistoryItem {
  id: string
  date: string
  store: string
  storeIcon: string
  duration: string
  rating: number
}

const deliveryHistory: DeliveryHistoryItem[] = [
  { id: 'h1', date: '15 Jan', store: 'Açougue do Zé', storeIcon: '🥩', duration: '28 min', rating: 5 },
  { id: 'h2', date: '13 Jan', store: 'Mercadinho Boa Vista', storeIcon: '🏪', duration: '42 min', rating: 4 },
  { id: 'h3', date: '10 Jan', store: 'Padaria Pão Dourado', storeIcon: '🍞', duration: '31 min', rating: 5 },
  { id: 'h4', date: '08 Jan', store: 'Pet Shop Amigo Fiel', storeIcon: '🐾', duration: '55 min', rating: 3 },
  { id: 'h5', date: '05 Jan', store: 'Lavanderia Clean', storeIcon: '👕', duration: '20 min', rating: 4 },
]

interface FeedbackTag {
  id: string
  label: string
  emoji: string
}

const feedbackTags: FeedbackTag[] = [
  { id: 'f1', label: 'Rápido', emoji: '⚡' },
  { id: 'f2', label: 'Cuidadoso', emoji: '🛡️' },
  { id: 'f3', label: 'Pontual', emoji: '⏰' },
  { id: 'f4', label: 'Educado', emoji: '😊' },
  { id: 'f5', label: 'Bem embalado', emoji: '📦' },
]

interface QuickMessage {
  id: string
  text: string
  icon: React.ReactNode
}

interface DeliveryPreference {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

interface TimeSlot {
  time: string
  label: string
  capacity: number
  available: boolean
}

interface DeliveryZone {
  id: string
  name: string
  color: string
  deliveryTime: string
  x: number
  y: number
  rx: number
  ry: number
}

const scheduleSlots: TimeSlot[] = [
  { time: '08:00', label: 'Manhã', capacity: 85, available: true },
  { time: '10:00', label: 'Manhã', capacity: 60, available: true },
  { time: '12:00', label: 'Almoço', capacity: 95, available: false },
  { time: '14:00', label: 'Tarde', capacity: 40, available: true },
  { time: '16:00', label: 'Tarde', capacity: 25, available: true },
  { time: '18:00', label: 'Noite', capacity: 70, available: true },
  { time: '20:00', label: 'Noite', capacity: 90, available: false },
]

const deliveryZones: DeliveryZone[] = [
  { id: 'z1', name: 'Centro', color: '#22c55e', deliveryTime: '15-25 min', x: 130, y: 80, rx: 55, ry: 45 },
  { id: 'z2', name: 'Vila Nova', color: '#eab308', deliveryTime: '25-35 min', x: 60, y: 140, rx: 40, ry: 50 },
  { id: 'z3', name: 'Zona Rural', color: '#ef4444', deliveryTime: '45-60 min', x: 220, y: 150, rx: 50, ry: 35 },
]

const scheduleDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

/* ══════════════════════════════════════════════════════
   Status Color Helper
   ══════════════════════════════════════════════════════ */

function getStatusColor(status: string) {
  switch (status) {
    case 'Saiu para entrega':
      return { bg: 'rgba(34,197,94,0.1)', text: '#16a34a', border: 'rgba(34,197,94,0.2)' }
    case 'Em trânsito':
      return { bg: 'rgba(59,130,246,0.1)', text: '#2563eb', border: 'rgba(59,130,246,0.2)' }
    case 'Preparando':
      return { bg: 'rgba(245,158,11,0.1)', text: '#d97706', border: 'rgba(245,158,11,0.2)' }
    default:
      return { bg: 'rgba(107,114,128,0.1)', text: '#6b7280', border: 'rgba(107,114,128,0.2)' }
  }
}

/* ══════════════════════════════════════════════════════
   Animated Count Up
   ══════════════════════════════════════════════════════ */

function AnimatedCount({ target, decimals = 0 }: { target: number; decimals?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const steps = 30
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setDisplay(target)
        clearInterval(timer)
      } else {
        setDisplay(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current))
      }
    }, 20)
    return () => clearInterval(timer)
  }, [target, decimals])

  return <span>{decimals > 0 ? display.toFixed(decimals) : display}</span>
}

/* ══════════════════════════════════════════════════════
   Toggle Switch Component
   ══════════════════════════════════════════════════════ */

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="cursor-pointer"
    >
      <motion.div
        animate={{ backgroundColor: enabled ? '#0d9488' : '#d1d5db' }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
        className="relative h-6 w-11 rounded-full"
      >
        <motion.div
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
          className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
        />
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   Star Rating Component
   ══════════════════════════════════════════════════════ */

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange?.(star)}
          className="focus:outline-none"
        >
          <Star
            className={`h-4 w-4 transition-colors ${
              star <= (hovered || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </motion.button>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════ */

export default function SmartDeliveryHub() {
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    'sem-contato': false,
    'portaria': true,
    'ate-20h': false,
  })
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<number>(2)
  const [deliveryRatings, setDeliveryRatings] = useState<Record<string, number>>({
    h1: 5,
    h2: 4,
    h3: 5,
    h4: 3,
    h5: 4,
  })
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({})
  const [showSchedule, setShowSchedule] = useState(false)
  const [mapProgress, setMapProgress] = useState(0)
  const [sentMessage, setSentMessage] = useState<string | null>(null)

  // Animate map route progress
  useEffect(() => {
    const interval = setInterval(() => {
      setMapProgress((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Auto-dismiss sent messages
  useEffect(() => {
    if (sentMessage) {
      const timer = setTimeout(() => setSentMessage(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [sentMessage])

  const preferenceList: DeliveryPreference[] = useMemo(
    () => [
      {
        id: 'sem-contato',
        label: 'Entrega sem contato',
        description: 'Deixar na porta sem interação',
        icon: <ShieldCheck className="h-4 w-4" />,
        enabled: preferences['sem-contato'],
      },
      {
        id: 'portaria',
        label: 'Deixar na portaria',
        description: 'Entregar na portaria do prédio',
        icon: <ToggleLeft className="h-4 w-4" />,
        enabled: preferences['portaria'],
      },
      {
        id: 'ate-20h',
        label: 'Receber apenas até 20h',
        description: 'Preferência de horário limite',
        icon: <Clock className="h-4 w-4" />,
        enabled: preferences['ate-20h'],
      },
    ],
    [preferences],
  )

  const quickMessages: QuickMessage[] = useMemo(
    () => [
      { id: 'q1', text: 'Atrasado?', icon: <Clock className="h-3.5 w-3.5" /> },
      { id: 'q2', text: 'Pode deixar na portaria', icon: <ToggleLeft className="h-3.5 w-3.5" /> },
      { id: 'q3', text: 'Obrigado!', icon: <Heart className="h-3.5 w-3.5" /> },
      { id: 'q4', text: 'Estou a caminho', icon: <Navigation className="h-3.5 w-3.5" /> },
    ],
    [],
  )

  const handleTogglePreference = useCallback((id: string) => {
    setPreferences((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const handleRateDelivery = useCallback((id: string, rating: number) => {
    setDeliveryRatings((prev) => ({ ...prev, [id]: rating }))
  }, [])

  const handleToggleTag = useCallback((historyId: string, tagId: string) => {
    setSelectedTags((prev) => {
      const current = prev[historyId] || []
      const next = current.includes(tagId) ? current.filter((t) => t !== tagId) : [...current, tagId]
      return { ...prev, [historyId]: next }
    })
  }, [])

  const handleSendMessage = useCallback((text: string) => {
    setSentMessage(text)
  }, [])

  const consolidationSavings = 8.0
  const averageDuration = 35

  /* ══════════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════════ */
  return (
    <section className="r47-smart-delivery-hub space-y-5">
      {/* ─── 1. Hero Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 p-5 text-white"
        style={{ boxShadow: '0 8px 32px rgba(13,148,136,0.3)' }}
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' as const }}
          className="absolute top-3 right-16 h-8 w-8 rounded-full border-2 border-dashed border-white/20"
        />

        <div className="flex items-center gap-3">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center"
          >
            <Route className="h-6 w-6" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold">Hub Inteligente de Entregas</h2>
            <p className="text-sm text-white/75 mt-0.5">
              Roteirização, preferências e acompanhamento em tempo real
            </p>
          </div>
        </div>

        {/* Live indicator */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          3 entregas ativas agora
        </motion.div>
      </motion.div>

      {/* ─── 11. Stats Summary ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {[
          { icon: <Package className="h-4 w-4" />, value: 32, suffix: ' entregas', label: 'realizadas', color: 'rgba(13,148,136,0.1)', iconColor: '#0d9488' },
          { icon: <Star className="h-4 w-4" />, value: 4.8, suffix: '★', label: 'nota média', decimals: 1, color: 'rgba(245,158,11,0.1)', iconColor: '#f59e0b' },
          { icon: <Timer className="h-4 w-4" />, value: 33, suffix: 'min', label: 'tempo médio', color: 'rgba(59,130,246,0.1)', iconColor: '#3b82f6' },
        ].map((stat, idx) => (
          <motion.div
            key={`stat-${idx}`}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 + idx * 0.08, type: 'spring' as const, stiffness: 260, damping: 22 }}
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: stat.color, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3, ease: 'easeInOut' as const }}
              className="flex justify-center mb-1.5"
            >
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                <span style={{ color: stat.iconColor }}>{stat.icon}</span>
              </div>
            </motion.div>
            <p className="text-lg font-bold" style={{ color: stat.iconColor }}>
              <AnimatedCount target={stat.value} decimals={stat.decimals || 0} />
              <span className="text-xs font-normal opacity-70">{stat.suffix}</span>
            </p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ─── 1. Active Deliveries ─── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Truck className="h-4 w-4 text-teal-600" />
          <h3 className="font-bold text-sm">Entregas Ativas</h3>
          <Badge className="ml-auto text-[10px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-0 font-semibold">
            {activeDeliveries.length} pacotes
          </Badge>
        </div>

        <div className="space-y-2.5">
          <AnimatePresence>
            {activeDeliveries.map((delivery, idx) => {
              const statusColor = getStatusColor(delivery.status)
              const isSelected = selectedDelivery === delivery.id

              return (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + idx * 0.1, type: 'spring' as const, stiffness: 260, damping: 22 }}
                  onClick={() => setSelectedDelivery(isSelected ? null : delivery.id)}
                  className="r47-delivery-card cursor-pointer rounded-xl border border-border/60 p-3.5 transition-all hover:border-teal-300 dark:hover:border-teal-700"
                  style={{
                    boxShadow: isSelected ? '0 4px 20px rgba(13,148,136,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
                    backgroundColor: isSelected ? 'rgba(13,148,136,0.04)' : 'rgba(255,255,255,1)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Store icon */}
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 flex items-center justify-center text-xl shrink-0">
                      {delivery.storeIcon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate">{delivery.storeName}</p>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 shrink-0"
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.border}`,
                          }}
                        >
                          {delivery.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{delivery.trackingNumber}</p>

                      {/* Items */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {delivery.items.map((item) => (
                          <span
                            key={item}
                            className="text-[10px] bg-muted/60 dark:bg-muted/30 px-1.5 py-0.5 rounded-md"
                          >
                            {item}
                          </span>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Previsão: {delivery.eta}
                          </span>
                          <span className="text-[10px] font-medium" style={{ color: statusColor.text }}>
                            {delivery.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full r47-progress-bar"
                            style={{
                              width: `${delivery.progress}%`,
                              backgroundColor: statusColor.text,
                              transformOrigin: 'left',
                            }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1, delay: 0.3 + idx * 0.15, ease: 'easeOut' as const }}
                          />
                        </div>
                      </div>

                      {/* Progress steps */}
                      <div className="flex items-center justify-between mt-2 px-1">
                        {['Pedido', 'Preparando', 'Trânsito', 'Entregue'].map((step, stepIdx) => {
                          const stepProgress = (stepIdx / 3) * 100
                          const isComplete = delivery.progress >= stepProgress
                          const isCurrent = stepIdx === Math.floor((delivery.progress / 100) * 3) + 1 || (delivery.progress >= 90 && stepIdx === 3)

                          return (
                            <div key={step} className="flex items-center gap-0.5">
                              {stepIdx > 0 && (
                                <div
                                  className="h-px flex-1 min-w-[16px]"
                                  style={{
                                    backgroundColor: isComplete ? statusColor.text : 'rgba(156,163,175,0.3)',
                                  }}
                                />
                              )}
                              <motion.div
                                animate={
                                  isCurrent
                                    ? { scale: [1, 1.15, 1] }
                                    : {}
                                }
                                transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
                                className="flex flex-col items-center gap-0.5"
                              >
                                <div
                                  className="h-4 w-4 rounded-full flex items-center justify-center transition-colors"
                                  style={{
                                    backgroundColor: isComplete ? statusColor.text : 'rgba(156,163,175,0.2)',
                                  }}
                                >
                                  {isComplete ? (
                                    <Check className="h-2.5 w-2.5 text-white" />
                                  ) : (
                                    <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                  )}
                                </div>
                                <span className="text-[8px] text-muted-foreground hidden sm:block">{step}</span>
                              </motion.div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── 2. Delivery Map Preview ─── */}
      <Card className="border-border/60 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="h-4 w-4 text-teal-600" />
            <span className="text-sm font-semibold">Mapa de Rotas</span>
            <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              Ao vivo
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(20,184,166,0.06)' }}>
            <svg viewBox="0 0 300 200" className="w-full h-40">
              {/* Grid lines */}
              {[...Array(6)].map((_, i) => (
                <line
                  key={`gh-${i}`}
                  x1={0}
                  y1={40 * (i + 1)}
                  x2={300}
                  y2={40 * (i + 1)}
                  stroke="rgba(156,163,175,0.12)"
                  strokeWidth={1}
                />
              ))}
              {[...Array(8)].map((_, i) => (
                <line
                  key={`gv-${i}`}
                  x1={37.5 * (i + 1)}
                  y1={0}
                  x2={37.5 * (i + 1)}
                  y2={200}
                  stroke="rgba(156,163,175,0.12)"
                  strokeWidth={1}
                />
              ))}

              {/* Zone overlays */}
              {deliveryZones.map((zone) => (
                <ellipse
                  key={zone.id}
                  cx={zone.x}
                  cy={zone.y}
                  rx={zone.rx}
                  ry={zone.ry}
                  fill={zone.color}
                  opacity={0.12}
                  stroke={zone.color}
                  strokeWidth={1}
                  strokeDasharray="4 3"
                />
              ))}

              {/* Route line (background) */}
              <path
                d="M 40 160 Q 80 100 150 110 Q 200 120 260 60"
                fill="none"
                stroke="rgba(156,163,175,0.25)"
                strokeWidth={3}
                strokeDasharray="6 4"
                strokeLinecap="round"
              />

              {/* Route line (animated) */}
              <motion.path
                d="M 40 160 Q 80 100 150 110 Q 200 120 260 60"
                fill="none"
                stroke="#0d9488"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={`${mapProgress * 4} 500`}
                className="r47-route-line"
              />

              {/* Origin pin */}
              <g>
                <circle cx={40} cy={160} r={8} fill="#0d9488" opacity={0.2} />
                <circle cx={40} cy={160} r={5} fill="#0d9488" />
                <circle cx={40} cy={160} r={2} fill="#ffffff" />
                <text x={40} y={180} textAnchor="middle" fontSize={8} fill="#6b7280" fontWeight="600">
                  Origem
                </text>
              </g>

              {/* Destination pin */}
              <g>
                <motion.circle
                  cx={260}
                  cy={60}
                  r={10}
                  fill="#ef4444"
                  opacity={0.15}
                  animate={{ r: [10, 16, 10], opacity: [0.15, 0.05, 0.15] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                />
                <circle cx={260} cy={60} r={6} fill="#ef4444" />
                <circle cx={260} cy={60} r={2.5} fill="#ffffff" />
                <text x={260} y={48} textAnchor="middle" fontSize={8} fill="#6b7280" fontWeight="600">
                  Destino
                </text>
              </g>

              {/* Delivery vehicle */}
              <motion.g
                animate={{
                  x: [0, 0],
                  y: [0, 0],
                }}
              >
                <motion.circle
                  cx={40 + (mapProgress / 100) * 220}
                  cy={160 - (mapProgress / 100) * 100 + (mapProgress / 100) * (mapProgress / 100) * 60}
                  r={12}
                  fill="#0d9488"
                  opacity={0.15}
                  animate={{ r: [12, 18, 12], opacity: [0.15, 0.05, 0.15] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                />
                <circle
                  cx={40 + (mapProgress / 100) * 220}
                  cy={160 - (mapProgress / 100) * 100 + (mapProgress / 100) * (mapProgress / 100) * 60}
                  r={7}
                  fill="#0d9488"
                />
                <text
                  x={40 + (mapProgress / 100) * 220}
                  y={164 - (mapProgress / 100) * 100 + (mapProgress / 100) * (mapProgress / 100) * 60}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#ffffff"
                >
                  🚗
                </text>
              </motion.g>
            </svg>

            {/* Zone labels overlay */}
            {deliveryZones.map((zone) => (
              <div
                key={`label-${zone.id}`}
                className="absolute text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
                style={{
                  left: `${(zone.x / 300) * 100}%`,
                  top: `${(zone.y / 200) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  color: zone.color,
                  border: `1px solid ${zone.color}40`,
                }}
              >
                {zone.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── 3. ETA Prediction ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring' as const, stiffness: 260, damping: 22 }}
        className="rounded-xl p-3.5 border border-emerald-200 dark:border-emerald-800/50"
        style={{
          backgroundColor: 'rgba(34,197,94,0.05)',
          boxShadow: '0 2px 12px rgba(34,197,94,0.08)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
              className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
            >
              <Clock className="h-4.5 w-4.5 text-emerald-600" />
            </motion.div>
            <div>
              <p className="text-sm font-semibold">Previsão: 18:45</p>
              <p className="text-[11px] text-muted-foreground">Pedido mais próximo do destino</p>
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold"
          >
            <Zap className="h-3 w-3" />
            Adiantado! (-12min)
          </motion.div>
        </div>
      </motion.div>

      {/* ─── 4. Package Consolidation ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, type: 'spring' as const, stiffness: 260, damping: 22 }}
        className="rounded-xl border border-amber-200 dark:border-amber-800/50 overflow-hidden"
        style={{
          backgroundColor: 'rgba(245,158,11,0.04)',
          boxShadow: '0 2px 12px rgba(245,158,11,0.08)',
        }}
      >
        <div className="p-3.5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Package className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Agrupar entregas</p>
              <p className="text-[11px] text-muted-foreground">
                Combine 2 entregas na mesma rota
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Economia: R${consolidationSavings.toFixed(0)}
            </span>
          </div>

          {/* Consolidation visualization */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <span className="text-sm">🍞</span>
              <div className="flex-1">
                <p className="text-[10px] font-medium truncate">Padaria Pão Dourado</p>
                <p className="text-[9px] text-muted-foreground">18:45</p>
              </div>
            </div>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
              className="text-teal-600"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
            <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
              <span className="text-sm">🥬</span>
              <div className="flex-1">
                <p className="text-[10px] font-medium truncate">Hortifruti Vida Verde</p>
                <p className="text-[9px] text-muted-foreground">19:20</p>
              </div>
            </div>
          </div>

          <motion.div
            className="mt-3"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="w-full h-9 rounded-lg bg-gradient-to-r from-amber-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              Consolidar e economizar R${consolidationSavings.toFixed(0)} em frete
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── 5. Delivery Preferences ─── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-teal-600" />
          <h3 className="font-bold text-sm">Preferências de Entrega</h3>
        </div>

        <div className="space-y-2">
          {preferenceList.map((pref, idx) => (
            <motion.div
              key={pref.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.08, type: 'spring' as const, stiffness: 260, damping: 22 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-teal-300 dark:hover:border-teal-700 transition-all"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
            >
              <div className="h-9 w-9 rounded-lg bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center text-teal-600 shrink-0">
                {pref.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{pref.label}</p>
                <p className="text-[11px] text-muted-foreground">{pref.description}</p>
              </div>
              <ToggleSwitch
                enabled={pref.enabled}
                onToggle={() => handleTogglePreference(pref.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── 10. Driver Communication ─── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-teal-600" />
          <h3 className="font-bold text-sm">Comunicar com Entregador</h3>
        </div>

        <AnimatePresence>
          {sentMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              className="mb-2 flex items-center gap-2 p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/50"
            >
              <Check className="h-4 w-4 text-teal-600 shrink-0" />
              <span className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                Mensagem enviada: &quot;{sentMessage}&quot;
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-2">
          {quickMessages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.5 + idx * 0.08,
                type: 'spring' as const,
                stiffness: 260,
                damping: 22,
              }}
              whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(13,148,136,0.12)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSendMessage(msg.text)}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-border/60 cursor-pointer hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
            >
              <div className="h-7 w-7 rounded-lg bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center text-teal-600 shrink-0">
                {msg.icon}
              </div>
              <span className="text-[11px] font-medium">{msg.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Custom message input */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-2 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Escrever mensagem..."
            className="flex-1 h-9 rounded-lg border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="sm" className="h-9 w-9 p-0 bg-teal-600 hover:bg-teal-700 rounded-lg">
              <Send className="h-3.5 w-3.5 text-white" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-lg">
              <Phone className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* ─── 8. Delivery Zones ─── */}
      <Card className="border-border/60 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-teal-600" />
            <span className="text-sm font-semibold">Zonas de Atendimento</span>
          </div>

          <div className="space-y-2">
            {deliveryZones.map((zone, idx) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.08, type: 'spring' as const, stiffness: 260, damping: 22 }}
                className="flex items-center gap-2.5 p-2.5 rounded-lg"
                style={{ backgroundColor: `${zone.color}08` }}
              >
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: zone.color }}
                />
                <div className="flex-1">
                  <p className="text-xs font-medium">{zone.name}</p>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${zone.color}15`,
                    color: zone.color,
                  }}
                >
                  {zone.deliveryTime}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#22c55e' }} />
              <span className="text-[9px] text-muted-foreground">Rápido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#eab308' }} />
              <span className="text-[9px] text-muted-foreground">Médio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#ef4444' }} />
              <span className="text-[9px] text-muted-foreground">Lento</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── 9. Schedule Delivery ─── */}
      <div>
        <motion.div
          className="flex items-center gap-2 mb-3 cursor-pointer"
          onClick={() => setShowSchedule(!showSchedule)}
          whileTap={{ scale: 0.98 }}
        >
          <Calendar className="h-4 w-4 text-teal-600" />
          <h3 className="font-bold text-sm">Agendar Entrega</h3>
          <motion.div
            animate={{ rotate: showSchedule ? 90 : 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {showSchedule && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="overflow-hidden"
            >
              {/* Day selector */}
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {scheduleDays.map((day, idx) => (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDay(idx)}
                    className="flex-1 min-w-[38px] h-10 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: selectedDay === idx ? '#0d9488' : 'rgba(107,114,128,0.08)',
                      color: selectedDay === idx ? '#ffffff' : '#6b7280',
                      boxShadow: selectedDay === idx ? '0 2px 8px rgba(13,148,136,0.25)' : 'none',
                    }}
                  >
                    {day}
                    <br />
                    <span className="text-[10px] opacity-70">{12 + idx}</span>
                  </motion.button>
                ))}
              </div>

              {/* Time slots */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {scheduleSlots.map((slot, idx) => (
                  <motion.div
                    key={slot.time}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05, type: 'spring' as const, stiffness: 260, damping: 22 }}
                    whileHover={slot.available ? { y: -2, boxShadow: '0 4px 12px rgba(13,148,136,0.12)' } : {}}
                    whileTap={slot.available ? { scale: 0.97 } : {}}
                    onClick={() => slot.available && setSelectedSlot(selectedSlot === slot.time ? null : slot.time)}
                    className={`relative rounded-xl p-2.5 border transition-all ${
                      slot.available
                        ? selectedSlot === slot.time
                          ? 'border-teal-400 bg-teal-50 dark:bg-teal-950/20 cursor-pointer'
                          : 'border-border/60 hover:border-teal-300 dark:hover:border-teal-700 cursor-pointer'
                        : 'border-border/30 opacity-50 cursor-not-allowed'
                    }`}
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
                  >
                    <p className="text-xs font-semibold">{slot.time}</p>
                    <p className="text-[9px] text-muted-foreground">{slot.label}</p>

                    {/* Capacity bar */}
                    <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          width: `${slot.capacity}%`,
                          backgroundColor: slot.capacity > 80 ? '#ef4444' : slot.capacity > 50 ? '#eab308' : '#22c55e',
                          transformOrigin: 'left',
                        }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 + idx * 0.05, ease: 'easeOut' as const }}
                      />
                    </div>
                    <p className="text-[8px] text-muted-foreground mt-0.5">
                      {slot.available
                        ? `${100 - slot.capacity}% disponível`
                        : 'Lotado'}
                    </p>

                    {!slot.available && (
                      <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-background/60">
                        <span className="text-[10px] font-medium text-muted-foreground">Lotado</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Schedule CTA */}
              {selectedSlot && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                  className="mt-3"
                >
                  <Button className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    Confirmar agendamento — {scheduleDays[selectedDay]}, {selectedSlot}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 6. Delivery History ─── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-teal-600" />
          <h3 className="font-bold text-sm">Histórico de Entregas</h3>
          <span className="ml-auto text-[10px] text-muted-foreground font-medium">
            Média: {averageDuration}min
          </span>
        </div>

        <div className="space-y-2">
          {deliveryHistory.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + idx * 0.06, type: 'spring' as const, stiffness: 260, damping: 22 }}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-border/40 hover:border-teal-300 dark:hover:border-teal-700 transition-all"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}
            >
              {/* Timeline dot */}
              <div className="relative flex flex-col items-center">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: idx === 0 ? '#0d9488' : 'rgba(156,163,175,0.4)',
                  }}
                />
                {idx < deliveryHistory.length - 1 && (
                  <div className="w-px h-8" style={{ backgroundColor: 'rgba(156,163,175,0.2)' }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium truncate">{item.store}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{item.date}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {item.duration}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-2.5 w-2.5 ${star <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <span className="text-lg shrink-0">{item.storeIcon}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── 7. Rate Delivery ─── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-amber-500" />
          <h3 className="font-bold text-sm">Avaliar Entregas</h3>
        </div>

        <div className="space-y-2.5">
          {deliveryHistory.slice(0, 3).map((item, idx) => (
            <motion.div
              key={`rate-${item.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + idx * 0.08, type: 'spring' as const, stiffness: 260, damping: 22 }}
              className="p-3 rounded-xl border border-border/60"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-lg">{item.storeIcon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{item.store}</p>
                  <p className="text-[10px] text-muted-foreground">{item.date} · {item.duration}</p>
                </div>
                <StarRating
                  rating={deliveryRatings[item.id] || 0}
                  onChange={(r) => handleRateDelivery(item.id, r)}
                />
              </div>

              {/* Feedback tags */}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {feedbackTags.map((tag) => {
                  const isActive = (selectedTags[item.id] || []).includes(tag.id)
                  return (
                    <motion.button
                      key={tag.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleTag(item.id, tag.id)}
                      className="text-[10px] px-2 py-1 rounded-full border transition-all"
                      style={{
                        backgroundColor: isActive ? 'rgba(13,148,136,0.1)' : 'rgba(255,255,255,1)',
                        borderColor: isActive ? 'rgba(13,148,136,0.3)' : 'rgba(156,163,175,0.2)',
                        color: isActive ? '#0d9488' : '#6b7280',
                      }}
                    >
                      {tag.emoji} {tag.label}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Footer CTA ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, type: 'spring' as const, stiffness: 260, damping: 22 }}
      >
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border border-teal-200 dark:border-teal-800/40">
          <Bell className="h-4 w-4 text-teal-600 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold">Notificações de entrega</p>
            <p className="text-[10px] text-muted-foreground">Receba alertas em tempo real sobre suas entregas</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="sm" className="h-8 text-[10px] bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-3">
              Ativar
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
