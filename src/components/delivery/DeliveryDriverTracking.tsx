'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Star,
  Package,
  CheckCircle2,
  Truck,
  Camera,
  Pen,
  Shield,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Navigation,
  Timer,
  BadgeCheck,
  CircleCheckBig,
  Car,
  Route,
  Heart,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/* ─────────────────────────────────────────────
   Types & Constants
   ───────────────────────────────────────────── */

type DeliveryStep = 'confirmed' | 'picking_up' | 'on_the_way' | 'arriving' | 'delivered'

interface DriverInfo {
  name: string
  initial: string
  rating: number
  totalTrips: number
  vehicle: string
  plate: string
  phone: string
  photoUrl?: string
}

interface OrderItem {
  id: string
  name: string
  qty: number
  price: number
}

interface DeliveryData {
  orderId: string
  driver: DriverInfo
  etaSeconds: number
  progress: number
  currentStep: DeliveryStep
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  paymentMethod: string
  instructions: string
  gateCode: string
  apartment: string
}

const MOCK_DRIVER: DriverInfo = {
  name: 'Carlos Silva',
  initial: 'C',
  rating: 4.9,
  totalTrips: 1247,
  vehicle: 'Honda CG 160',
  plate: 'PAZ-4F28',
  phone: '+55 91 99999-1234',
}

const MOCK_ORDER: DeliveryData = {
  orderId: 'DP-20260613-7829',
  driver: MOCK_DRIVER,
  etaSeconds: 7 * 60 + 34,
  progress: 0.62,
  currentStep: 'on_the_way',
  items: [
    { id: 'it1', name: 'Arroz Tio João 5kg', qty: 1, price: 24.90 },
    { id: 'it2', name: 'Feijão Carioca 1kg', qty: 2, price: 8.90 },
    { id: 'it3', name: 'Açaí 500ml Premium', qty: 3, price: 15.00 },
    { id: 'it4', name: 'Óleo de Soja 900ml', qty: 1, price: 7.49 },
  ],
  subtotal: 94.19,
  deliveryFee: 5.00,
  discount: 4.70,
  total: 94.49,
  paymentMethod: 'PIX',
  instructions: 'Deixar na portaria com o zelador. Ligar o interfone 204.',
  gateCode: '204#',
  apartment: 'Bloco B, Apto 302',
}

const STEP_CONFIG: Record<
  DeliveryStep,
  { label: string; desc: string; icon: typeof Package; time: string }
> = {
  confirmed: {
    label: 'Pedido Confirmado',
    desc: 'Seu pedido foi recebido e confirmado pela loja.',
    icon: CircleCheckBig,
    time: '14:22',
  },
  picking_up: {
    label: 'Preparando Retirada',
    desc: 'O entregador está na loja coletando seus itens.',
    icon: Package,
    time: '14:28',
  },
  on_the_way: {
    label: 'A Caminho',
    desc: 'Seu pedido está a caminho do endereço de entrega.',
    icon: Truck,
    time: '14:35',
  },
  arriving: {
    label: 'Chegando',
    desc: 'O entregador está próximo do seu endereço.',
    icon: Navigation,
    time: '14:48',
  },
  delivered: {
    label: 'Entregue',
    desc: 'Pedido entregue com sucesso! Confirme abaixo.',
    icon: BadgeCheck,
    time: '—',
  },
}

const STEP_ORDER: DeliveryStep[] = [
  'confirmed',
  'picking_up',
  'on_the_way',
  'arriving',
  'delivered',
]

const TIP_OPTIONS = [0, 2, 5, 10]

const RATING_CATEGORIES = [
  { key: 'punctuality', label: 'Pontualidade' },
  { key: 'courtesy', label: 'Cortesia' },
  { key: 'care', label: 'Cuidado com o pedido' },
  { key: 'communication', label: 'Comunicação' },
]

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

/* ─────────────────────────────────────────────
   SVG Animated Map Component
   ───────────────────────────────────────────── */

function AnimatedMap({ progress }: { progress: number }) {
  const roadPoints = [
    [60, 320],
    [60, 280],
    [120, 260],
    [180, 240],
    [240, 200],
    [300, 180],
    [360, 150],
    [400, 110],
    [420, 80],
  ]

  const storePos = roadPoints[0]
  const destPos = roadPoints[roadPoints.length - 1]
  const totalLen = roadPoints.length - 1
  const idx = Math.min(Math.floor(progress * totalLen), totalLen - 1)
  const frac = progress * totalLen - idx
  const vehicleX =
    roadPoints[idx][0] + (roadPoints[idx + 1]?.[0] ?? roadPoints[idx][0]) * frac - idx
  const vehicleY =
    roadPoints[idx][1] + (roadPoints[idx + 1]?.[1] ?? roadPoints[idx][1]) * frac - idx

  const roadD = roadPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`)
    .join(' ')

  const dashLen = 800
  const dashOffset = dashLen * (1 - progress)

  return (
    <svg
      viewBox="0 0 480 400"
      className="r43-map-svg w-full h-full"
      aria-label="Mapa animado de entrega"
    >
      {/* Grid background */}
      <defs>
        <pattern id="r43-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="rgba(16,185,129,0.06)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="480" height="400" fill="url(#r43-grid)" className="r43-map-bg-rect" />

      {/* Simulated blocks / buildings */}
      <rect x="80" y="60" width="60" height="40" rx="6" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" />
      <rect x="200" y="100" width="50" height="60" rx="6" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" />
      <rect x="320" y="70" width="70" height="35" rx="6" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" />
      <rect x="140" y="180" width="55" height="45" rx="6" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" />
      <rect x="300" y="220" width="65" height="40" rx="6" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" />
      <rect x="100" y="300" width="45" height="30" rx="6" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" />
      <rect x="350" y="300" width="55" height="35" rx="6" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" />

      {/* Alternate roads */}
      <line x1="140" y1="40" x2="140" y2="360" stroke="rgba(100,116,139,0.12)" strokeWidth="2" />
      <line x1="280" y1="40" x2="280" y2="360" stroke="rgba(100,116,139,0.12)" strokeWidth="2" />
      <line x1="20" y1="200" x2="460" y2="200" stroke="rgba(100,116,139,0.12)" strokeWidth="2" />

      {/* Road background */}
      <path d={roadD} fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />

      {/* Animated route line */}
      <path
        d={roadD}
        fill="none"
        stroke="rgba(16,185,129,0.7)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashLen}
        strokeDashoffset={dashOffset}
        className="r43-route-path"
      />

      {/* Store marker */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      >
        <circle cx={storePos[0]} cy={storePos[1]} r="14" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" />
        <circle cx={storePos[0]} cy={storePos[1]} r="6" fill="rgba(16,185,129,0.9)" />
        <text x={storePos[0]} y={storePos[1] - 22} textAnchor="middle" fill="rgba(16,185,129,0.8)" fontSize="9" fontWeight="600" className="r43-map-label">Loja</text>
      </motion.g>

      {/* Destination marker */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.2 }}
      >
        <circle cx={destPos[0]} cy={destPos[1]} r="14" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.35)" strokeWidth="1.5" />
        <circle cx={destPos[0]} cy={destPos[1]} r="6" fill="rgba(239,68,68,0.8)" />
        <text x={destPos[0]} y={destPos[1] - 22} textAnchor="middle" fill="rgba(239,68,68,0.7)" fontSize="9" fontWeight="600" className="r43-map-label">Você</text>
      </motion.g>

      {/* Vehicle icon moving along route */}
      <motion.g
        animate={{
          x: vehicleX,
          y: vehicleY,
        }}
        transition={{ type: 'spring' as const, stiffness: 60, damping: 18 }}
      >
        <circle r="16" fill="rgba(16,185,129,0.2)" stroke="rgba(16,185,129,0.5)" strokeWidth="1" className="r43-vehicle-ping" />
        <motion.circle
          r="16"
          fill="none"
          stroke="rgba(16,185,129,0.3)"
          strokeWidth="1"
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle r="8" fill="#10B981" />
        <text textAnchor="middle" y="4" fill="white" fontSize="9" fontWeight="700">🛵</text>
      </motion.g>
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Star Rating Component (inline)
   ───────────────────────────────────────────── */

function InlineStars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
        />
      ))}
    </div>
  )
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.button
          key={i}
          type="button"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHover(i + 1)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i + 1)}
          className="p-0.5"
        >
          <Star
            size={28}
            className={
              i < display
                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                : 'text-slate-300 dark:text-slate-600'
            }
          />
        </motion.button>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   ETA Countdown
   ───────────────────────────────────────────── */

function ETACountdown({ initialSeconds }: { initialSeconds: number }) {
  const [remaining, setRemaining] = useState(initialSeconds)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((p) => Math.max(0, p - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="r43-eta-block flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <Timer className="h-5 w-5 text-emerald-500" />
        <span className="r43-eta-label text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Previsão de Chegada
        </span>
      </div>
      <div className="r43-eta-digits flex items-baseline gap-1">
        <motion.span
          key={mins}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
          className="text-4xl font-bold text-foreground tabular-nums"
        >
          {pad(mins)}
        </motion.span>
        <span className="text-3xl font-light text-muted-foreground">:</span>
        <motion.span
          key={secs}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
          className="text-4xl font-bold text-foreground tabular-nums"
        >
          {pad(secs)}
        </motion.span>
        <span className="text-xs text-muted-foreground ml-1">min</span>
      </div>
      {remaining < 120 && remaining > 0 && (
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="r43-arriving-badge flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20"
        >
          <Navigation className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            Chegando agora!
          </span>
        </motion.div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Delivery Progress Steps
   ───────────────────────────────────────────── */

function DeliveryProgressSteps({
  currentStep,
}: {
  currentStep: DeliveryStep
}) {
  const currentIdx = STEP_ORDER.indexOf(currentStep)

  return (
    <div className="r43-steps-container space-y-0">
      {STEP_ORDER.map((step, idx) => {
        const cfg = STEP_CONFIG[step]
        const Icon = cfg.icon
        const isCompleted = idx < currentIdx
        const isCurrent = idx === currentIdx
        const isFuture = idx > currentIdx

        return (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 200, damping: 22 }}
            className="r43-step-row flex gap-3"
          >
            {/* Left rail: icon + connector */}
            <div className="flex flex-col items-center">
              <motion.div
                className={`r43-step-icon-wrap relative flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-emerald-500/15 text-emerald-500 border-2 border-emerald-500'
                    : 'bg-muted text-muted-foreground'
                }`}
                animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                {isCurrent && (
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-emerald-500/40"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              {idx < STEP_ORDER.length - 1 && (
                <div
                  className={`r43-step-connector w-0.5 h-8 transition-colors ${
                    isCompleted ? 'bg-emerald-500' : 'bg-border'
                  }`}
                />
              )}
            </div>

            {/* Right: content */}
            <div className="pt-1.5 pb-4">
              <div className="flex items-center gap-2">
                <p
                  className={`r43-step-label text-sm font-semibold transition-colors ${
                    isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {cfg.label}
                </p>
                {isCompleted && (
                  <Badge className="r43-step-completed-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0">
                    Concluído
                  </Badge>
                )}
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="r43-current-dot inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  </motion.div>
                )}
              </div>
              <p className="r43-step-desc text-xs text-muted-foreground mt-0.5">{cfg.desc}</p>
              {(isCompleted || isCurrent) && cfg.time !== '—' && (
                <p className="r43-step-time text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {cfg.time}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Driver Profile Card
   ───────────────────────────────────────────── */

function DriverProfileCard({ driver }: { driver: DriverInfo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
      className="r43-driver-card rounded-2xl p-4 border border-border/60 bg-card shadow-sm"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <motion.div
          className="r43-driver-avatar relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/20">
            {driver.initial}
          </div>
          <span className="r43-online-dot absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-card" />
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="r43-driver-name text-sm font-bold text-foreground truncate">{driver.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <InlineStars rating={driver.rating} size={12} />
            <span className="r43-driver-rating text-xs font-medium text-muted-foreground">
              {driver.rating}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="r43-driver-trips text-xs text-muted-foreground">
              {driver.totalTrips.toLocaleString('pt-BR')} entregas
            </span>
          </div>
          <div className="r43-driver-vehicle flex items-center gap-1.5 mt-1">
            <Car className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {driver.vehicle} · {driver.plate}
            </span>
          </div>
        </div>
      </div>

      {/* Contact buttons */}
      <div className="r43-contact-buttons flex gap-2 mt-3">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            size="sm"
            className="r43-btn-call flex-1 h-9 gap-1.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
          >
            <Phone className="h-3.5 w-3.5" />
            Ligar
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            size="sm"
            variant="outline"
            className="r43-btn-chat flex-1 min-h-[44px] gap-1.5 text-xs"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Chat
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Delivery Instructions
   ───────────────────────────────────────────── */

function DeliveryInstructions({ instructions, gateCode, apartment }: { instructions: string; gateCode: string; apartment: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="r43-instructions-section">
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        className="r43-instructions-toggle flex items-center justify-between w-full p-3 rounded-xl border border-border/60 bg-card text-sm font-medium text-foreground"
        whileTap={{ scale: 0.99 }}
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-500" />
          Instruções de Entrega
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="r43-instructions-content p-3 mt-1 rounded-xl border border-border/40 bg-muted/30 space-y-2">
              <p className="r43-inst-main text-xs text-foreground leading-relaxed">{instructions}</p>
              <div className="flex gap-2 flex-wrap">
                {gateCode && (
                  <span className="r43-inst-chip inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    <Shield className="h-3 w-3" />
                    Código: {gateCode}
                  </span>
                )}
                {apartment && (
                  <span className="r43-inst-chip inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted border border-border text-[11px] font-medium text-muted-foreground">
                    {apartment}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Photo Proof Upload (mock)
   ───────────────────────────────────────────── */

function PhotoProofUpload() {
  const [photos, setPhotos] = useState<string[]>([])

  const handleMockUpload = () => {
    setPhotos((prev) => [...prev, `photo-${Date.now()}`])
  }

  return (
    <div className="r43-photo-section space-y-2">
      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <Camera className="h-3.5 w-3.5 text-emerald-500" />
        Foto de Entrega
      </p>
      <div className="flex gap-2 flex-wrap">
        {photos.map((id) => (
          <motion.div
            key={id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
            className="r43-photo-thumb relative w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-500/20 flex items-center justify-center"
          >
            <Package className="h-6 w-6 text-emerald-500/60" />
            <motion.button
              type="button"
              onClick={() => setPhotos((p) => p.filter((x) => x !== id))}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center"
              whileTap={{ scale: 0.85 }}
            >
              <X className="h-2.5 w-2.5" />
            </motion.button>
          </motion.div>
        ))}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button
            type="button"
            onClick={handleMockUpload}
            className="r43-photo-add w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-emerald-500/40 transition-colors flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-emerald-500"
          >
            <Camera className="h-5 w-5" />
            <span className="text-[9px]">Adicionar</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Signature Pad (mock SVG drawing)
   ───────────────────────────────────────────── */

function SignaturePad() {
  const [paths, setPaths] = useState<string[][]>([[]])
  const svgRef = useRef<SVGSVGElement>(null)
  const isDrawing = useRef(false)

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const rect = svgRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: Math.round(((clientX - rect.left) / rect.width) * 300),
      y: Math.round(((clientY - rect.top) / rect.height) * 80),
    }
  }, [])

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      isDrawing.current = true
      const pos = getPos(e)
      setPaths((prev) => [...prev, [[pos.x, pos.y].join(',')]])
    },
    [getPos]
  )

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing.current) return
      e.preventDefault()
      const pos = getPos(e)
      setPaths((prev) => {
        const copy = [...prev]
        const last = [...(copy[copy.length - 1] || [])]
        last.push([pos.x, pos.y].join(','))
        copy[copy.length - 1] = last
        return copy
      })
    },
    [getPos]
  )

  const handleEnd = useCallback(() => {
    isDrawing.current = false
  }, [])

  const clearSignature = () => {
    setPaths([[]])
  }

  return (
    <div className="r43-signature-section space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Pen className="h-3.5 w-3.5 text-emerald-500" />
          Assinatura de Recebimento
        </p>
        <motion.div whileTap={{ scale: 0.95 }}>
          <button
            type="button"
            onClick={clearSignature}
            className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
          >
            Limpar
          </button>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 300 80"
          className="r43-signature-svg w-full h-20 rounded-xl border border-border/60 bg-card cursor-crosshair touch-none"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {/* Baseline */}
          <line x1="20" y1="65" x2="280" y2="65" stroke="rgba(100,116,139,0.15)" strokeWidth="1" strokeDasharray="4,3" />
          <text x="20" y="78" fontSize="7" fill="rgba(100,116,139,0.35)" fontFamily="sans-serif">Assine aqui</text>
          {paths.map((seg, i) =>
            seg.length > 1 ? (
              <polyline
                key={i}
                points={seg.join(' ')}
                fill="none"
                stroke="rgba(16,185,129,0.8)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null
          )}
        </svg>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Rate Driver Section
   ───────────────────────────────────────────── */

function RateDriverSection() {
  const [rating, setRating] = useState(0)
  const [catRatings, setCatRatings] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (rating === 0) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        className="r43-rating-thankyou p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
        >
          <Heart className="h-8 w-8 text-emerald-500 mx-auto mb-2" fill="rgba(16,185,129,0.3)" />
        </motion.div>
        <p className="text-sm font-semibold text-foreground">Obrigado pela avaliação!</p>
        <p className="text-xs text-muted-foreground mt-1">Sua opinião ajuda a melhorar nosso serviço.</p>
      </motion.div>
    )
  }

  return (
    <div className="r43-rating-section space-y-3">
      <p className="text-sm font-bold text-foreground">Avalie o Entregador</p>
      <div className="flex flex-col items-center gap-1">
        <InteractiveStars value={rating} onChange={setRating} />
        {rating > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-muted-foreground"
          >
            {rating === 5 ? 'Excelente!' : rating === 4 ? 'Muito bom' : rating === 3 ? 'Regular' : rating === 2 ? 'Ruim' : 'Péssimo'}
          </motion.p>
        )}
      </div>

      {rating > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ type: 'spring' as const, stiffness: 250, damping: 25 }}
          className="space-y-2 overflow-hidden"
        >
          {RATING_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="flex items-center justify-between py-1"
            >
              <span className="text-xs text-muted-foreground">{cat.label}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={() =>
                      setCatRatings((prev) => ({
                        ...prev,
                        [cat.key]: prev[cat.key] === i + 1 ? 0 : i + 1,
                      }))
                    }
                    className="p-0.5"
                  >
                    <Star
                      size={14}
                      className={
                        i < (catRatings[cat.key] || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {rating > 0 && (
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            onClick={handleSubmit}
            className="r43-submit-rating w-full h-9 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Enviar Avaliação
          </Button>
        </motion.div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tip Selector
   ───────────────────────────────────────────── */

function TipSelector() {
  const [selected, setSelected] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  return (
    <div className="r43-tip-section space-y-2">
      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <Heart className="h-3.5 w-3.5 text-rose-400" />
        Gorjeta para o Entregador
      </p>
      <div className="flex gap-2 flex-wrap">
        {TIP_OPTIONS.map((amount) => {
          const isActive = !showCustom && selected === amount
          return (
            <motion.div key={amount} whileTap={{ scale: 0.92 }}>
              <button
                type="button"
                onClick={() => {
                  setSelected(amount)
                  setShowCustom(false)
                  setCustomAmount('')
                }}
                className={`r43-tip-chip relative px-4 py-2 rounded-xl text-sm font-semibold border transition-all overflow-hidden ${
                  isActive
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'bg-card text-muted-foreground border-border hover:border-emerald-500/30'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="r43-tip-highlight"
                    className="absolute inset-0 bg-emerald-500 rounded-xl"
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {amount === 0 ? 'Sem gorjeta' : `R$${amount}`}
                </span>
              </button>
            </motion.div>
          )
        })}
        <motion.div whileTap={{ scale: 0.92 }}>
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className={`r43-tip-custom px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              showCustom
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'bg-card text-muted-foreground border-border hover:border-emerald-500/30'
            }`}
          >
            Personalizado
          </button>
        </motion.div>
      </div>
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm font-medium text-muted-foreground">R$</span>
              <Input
                type="number"
                min="0"
                placeholder="0,00"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="r43-custom-tip-input h-9 w-24 text-center text-sm"
              />
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  className="r43-apply-tip h-9 bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                >
                  Aplicar
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Order Summary
   ───────────────────────────────────────────── */

function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  discount,
  total,
  paymentMethod,
  orderId,
}: {
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  paymentMethod: string
  orderId: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="r43-order-summary space-y-0">
      <motion.button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="r43-summary-toggle flex items-center justify-between w-full p-3 rounded-xl border border-border/60 bg-card text-sm font-medium text-foreground"
        whileTap={{ scale: 0.99 }}
      >
        <span className="flex items-center gap-2">
          <Route className="h-4 w-4 text-emerald-500" />
          Resumo do Pedido
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">{formatBRL(total)}</span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </motion.button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="p-3 mt-1 rounded-xl border border-border/40 bg-muted/20 space-y-2">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {orderId}
              </p>
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">
                    {item.qty}x {item.name}
                  </span>
                  <span className="font-medium text-muted-foreground">
                    {formatBRL(item.price * item.qty)}
                  </span>
                </div>
              ))}
              <Separator className="my-1" />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Taxa de entrega</span>
                <span className="text-foreground">{formatBRL(deliveryFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-500">Desconto</span>
                  <span className="text-emerald-500">-{formatBRL(discount)}</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatBRL(total)}</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-muted-foreground">Pagamento:</span>
                <Badge variant="secondary" className="r43-payment-badge text-[10px] px-1.5 py-0 font-medium">
                  {paymentMethod}
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Emergency Contact
   ───────────────────────────────────────────── */

function EmergencyButton() {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="r43-emergency-section"
    >
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          variant="outline"
          size="sm"
          className="r43-emergency-btn w-full h-10 gap-2 text-xs font-medium border-red-500/20 text-red-500 hover:bg-red-500/8 hover:text-red-600"
          onClick={() => setConfirmed(true)}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Contato de Emergência
        </Button>
      </motion.div>
      <AnimatePresence>
        {confirmed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="r43-emergency-content p-3 mt-2 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                Suporte de Emergência
              </p>
              <p className="text-[11px] text-muted-foreground">
                Se houver qualquer problema com a entrega, entre em contato com nosso suporte imediato.
              </p>
              <div className="flex gap-2">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button size="sm" className="r43-emergency-call h-8 min-h-[44px] text-[11px] gap-1 bg-red-500 hover:bg-red-600 text-white">
                    <Phone className="h-3 w-3" />
                    Ligar 0800
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button size="sm" variant="outline" className="r43-emergency-chat h-8 min-h-[44px] text-[11px] gap-1 border-red-500/20 text-red-500">
                    <MessageCircle className="h-3 w-3" />
                    Chat Suporte
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Pulsing Arriving Indicator
   ───────────────────────────────────────────── */

function ArrivingIndicator({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
          className="r43-arriving-indicator fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30 flex items-center gap-2"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Navigation className="h-4 w-4" />
          </motion.div>
          <span className="text-sm font-bold">Chegando agora!</span>
          <motion.span
            className="r43-arriving-ping absolute inset-0 rounded-full"
            animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.4)', '0 0 0 12px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────────
   Section Divider Title
   ───────────────────────────────────────────── */

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon: typeof MapPin }) {
  return (
    <div className="r43-section-title flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-emerald-500" />
      </div>
      <span className="text-sm font-bold text-foreground">{children}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT EXPORT
   ═══════════════════════════════════════════════ */

export function DeliveryDriverTracking() {
  const [orderData] = useState<DeliveryData>(MOCK_ORDER)
  const [progress, setProgress] = useState(orderData.progress)
  const [etaSeconds, setEtaSeconds] = useState(orderData.etaSeconds)
  const [step, setStep] = useState<DeliveryStep>(orderData.currentStep)
  const [isDelivered, setIsDelivered] = useState(false)

  // Simulate progress advancing over time
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 0.002, 1)
        if (next >= 1 && !isDelivered) {
          setStep('delivered')
          setIsDelivered(true)
          setEtaSeconds(0)
        }
        return next
      })
      setEtaSeconds((e) => Math.max(0, e - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [isDelivered])

  // Determine if arriving indicator should show
  const showArriving = progress > 0.85 && !isDelivered

  return (
    <div className="r43-root min-h-screen bg-background pb-8">
      <ArrivingIndicator visible={showArriving} />

      <div className="r43-container max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* ─── Header ─── */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 250, damping: 22 }}
          className="r43-header"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="r43-title text-lg font-bold text-foreground flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-500" />
                Acompanhar Entrega
              </h1>
              <p className="r43-order-id text-xs text-muted-foreground mt-0.5">
                Pedido {orderData.orderId}
              </p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.3 }}
            >
              <Badge
                className={`r43-status-badge text-[10px] px-2 py-0.5 font-semibold ${
                  isDelivered
                    ? 'bg-emerald-500 text-white'
                    : progress > 0.85
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {isDelivered ? 'Entregue' : progress > 0.85 ? 'Chegando' : 'Em Transito'}
              </Badge>
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="r43-progress-bar-container">
            <Progress
              value={progress * 100}
              className="r43-progress-bar h-2 bg-muted"
            />
            <div className="flex justify-between mt-1">
              <span className="r43-progress-start text-[9px] text-muted-foreground">Loja</span>
              <span className="r43-progress-end text-[9px] text-muted-foreground">Destino</span>
            </div>
          </div>
        </motion.header>

        {/* ─── Animated Map ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 22, delay: 0.1 }}
          className="r43-map-container rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm"
        >
          <AnimatedMap progress={progress} />
        </motion.div>

        {/* ─── ETA Countdown ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 250, damping: 22, delay: 0.15 }}
          className="r43-eta-container p-4 rounded-2xl border border-border/60 bg-card shadow-sm"
        >
          <ETACountdown initialSeconds={etaSeconds} />
        </motion.div>

        {/* ─── Driver Profile Card ─── */}
        <DriverProfileCard driver={orderData.driver} />

        {/* ─── Delivery Progress Steps ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 22, delay: 0.25 }}
          className="r43-progress-steps-section"
        >
          <SectionTitle icon={Route}>Progresso da Entrega</SectionTitle>
          <DeliveryProgressSteps currentStep={step} />
        </motion.div>

        {/* ─── Delivery Instructions ─── */}
        <DeliveryInstructions
          instructions={orderData.instructions}
          gateCode={orderData.gateCode}
          apartment={orderData.apartment}
        />

        {/* ─── Post-Delivery: Proof + Signature + Rate + Tip ─── */}
        <AnimatePresence>
          {isDelivered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
              className="r43-post-delivery space-y-4"
            >
              {/* Delivery confirmation badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                className="r43-delivered-banner p-3 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <BadgeCheck className="h-8 w-8 text-emerald-500 mx-auto" />
                </motion.div>
                <p className="text-sm font-bold text-foreground mt-1">Pedido Entregue!</p>
                <p className="text-xs text-muted-foreground">
                  Confirme a entrega e avalie o serviço.
                </p>
              </motion.div>

              <Separator />

              {/* Photo Proof */}
              <PhotoProofUpload />

              {/* Signature */}
              <SignaturePad />

              <Separator />

              {/* Rate Driver */}
              <RateDriverSection />

              {/* Tip Selector */}
              <TipSelector />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Order Summary ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 22, delay: 0.35 }}
        >
          <OrderSummary
            items={orderData.items}
            subtotal={orderData.subtotal}
            deliveryFee={orderData.deliveryFee}
            discount={orderData.discount}
            total={orderData.total}
            paymentMethod={orderData.paymentMethod}
            orderId={orderData.orderId}
          />
        </motion.div>

        {/* ─── Emergency Contact ─── */}
        <EmergencyButton />

        {/* ─── Spacer for floating indicator ─── */}
        {showArriving && <div className="h-16" />}
      </div>
    </div>
  )
}
