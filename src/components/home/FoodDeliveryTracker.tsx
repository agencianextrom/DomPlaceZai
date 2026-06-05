'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck,
  Package,
  MapPin,
  Clock,
  Star,
  Check,
  ChevronDown,
  ChevronRight,
  Phone,
  MessageCircle,
  Store,
  Thermometer,
  Snowflake,
  Flame,
  AlertTriangle,
  UtensilsCrossed,
  CircleDot,
  Timer,
  Navigation,
  CreditCard,
  Receipt,
  Bike,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

/* ══════════════════════════════════════════════════════
   Types & Interfaces
   ══════════════════════════════════════════════════════ */

type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  tempType: 'hot' | 'cold' | 'neutral'
}

interface DriverInfo {
  name: string
  initial: string
  rating: number
  totalDeliveries: number
  vehicleType: string
  phone: string
}

interface TipOption {
  value: number
  label: string
  isSelected: boolean
}

interface CostRow {
  id: string
  label: string
  value: string
}

/* ══════════════════════════════════════════════════════
   Constants & Mock Data
   ══════════════════════════════════════════════════════ */

const STATUS_STEPS: { id: OrderStatus; label: string; icon: React.ReactNode; timeLabel: string }[] = [
  { id: 'placed', label: 'Pedido Feito', icon: <CircleDot className="h-3.5 w-3.5" />, timeLabel: '14:30' },
  { id: 'confirmed', label: 'Confirmado', icon: <Check className="h-3.5 w-3.5" />, timeLabel: '14:31' },
  { id: 'preparing', label: 'Preparando', icon: <UtensilsCrossed className="h-3.5 w-3.5" />, timeLabel: '14:33' },
  { id: 'ready', label: 'Pronto', icon: <Package className="h-3.5 w-3.5" />, timeLabel: '14:48' },
  { id: 'out_for_delivery', label: 'Saiu p/ Entrega', icon: <Bike className="h-3.5 w-3.5" />, timeLabel: '14:52' },
  { id: 'delivered', label: 'Entregue', icon: <Check className="h-3.5 w-3.5" />, timeLabel: '' },
]

const MOCK_DRIVER: DriverInfo = {
  name: 'Carlos Silva',
  initial: 'CS',
  rating: 4.9,
  totalDeliveries: 1847,
  vehicleType: 'Bicicleta',
  phone: '(11) 98765-4321',
}

const MOCK_ITEMS: OrderItem[] = [
  { id: 'item-1', name: 'X-Bacon Especial', quantity: 2, price: 24.9, tempType: 'hot' },
  { id: 'item-2', name: 'Batata Frita Grande', quantity: 1, price: 16.0, tempType: 'hot' },
  { id: 'item-3', name: 'Suco de Laranja Natural', quantity: 2, price: 9.5, tempType: 'cold' },
  { id: 'item-4', name: 'Pudim de Leite', quantity: 1, price: 12.0, tempType: 'neutral' },
]

const TIP_OPTIONS_INIT: TipOption[] = [
  { value: 2, label: 'R$2', isSelected: false },
  { value: 5, label: 'R$5', isSelected: false },
  { value: 10, label: 'R$10', isSelected: false },
  { value: -1, label: 'Custom', isSelected: false },
]

const COST_ROWS_INIT: CostRow[] = [
  { id: 'subtotal', label: 'Subtotal', value: 'R$96,80' },
  { id: 'delivery', label: 'Taxa de entrega', value: 'R$5,90' },
  { id: 'service', label: 'Taxa de serviço', value: 'R$3,00' },
  { id: 'discount', label: 'Desconto (10%)', value: '-R$9,68' },
  { id: 'tip', label: 'Gorjeta', value: 'R$0,00' },
]

const ROUTE_SVG_PATH = 'M 40 180 C 80 160, 100 120, 140 110 S 200 80, 240 90 S 280 130, 320 100 S 360 70, 400 50'

const INITIAL_ETA_SECONDS = 780 // 13 min

const DELIVERY_INSTRUCTIONS =
  'Apartamento 42, bloco B. Toque o interfone e aguarde. Deixar na portaria se não atender. Cachorro na área — por favor, não abrir o portão.'

const STORE_NAME = 'Lanchonete do Zé'
const STORE_PHONE = '(11) 91234-5678'

/* ══════════════════════════════════════════════════════
   Helper Functions
   ══════════════════════════════════════════════════════ */

function getStatusIndex(status: OrderStatus): number {
  return STATUS_STEPS.findIndex((s) => s.id === status)
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function getPointOnPath(pathEl: SVGPathElement, t: number): { x: number; y: number } {
  try {
    const totalLength = pathEl.getTotalLength()
    const point = pathEl.getPointAtLength(t * totalLength)
    return { x: point.x, y: point.y }
  } catch {
    return { x: lerp(40, 400, t), y: lerp(180, 50, t) }
  }
}

function getTempColor(type: string): { bg: string; text: string; icon: React.ReactNode } {
  switch (type) {
    case 'hot':
      return { bg: 'rgba(239,68,68,0.1)', text: '#dc2626', icon: <Flame className="h-3 w-3" /> }
    case 'cold':
      return { bg: 'rgba(59,130,246,0.1)', text: '#2563eb', icon: <Snowflake className="h-3 w-3" /> }
    default:
      return { bg: 'rgba(107,114,128,0.08)', text: '#6b7280', icon: <Thermometer className="h-3 w-3" /> }
  }
}

/* ══════════════════════════════════════════════════════
   Custom Hook: Smooth animated value
   ══════════════════════════════════════════════════════ */

function useSmoothValue(target: number, speed = 0.08) {
  const [current, setCurrent] = useState(target)

  useEffect(() => {
    const frame = requestAnimationFrame(function tick() {
      setCurrent((prev) => {
        const diff = target - prev
        if (Math.abs(diff) < 0.3) return target
        return prev + diff * speed
      })
      requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [target, speed])

  return current
}

/* ══════════════════════════════════════════════════════
   Sub-Components
   ══════════════════════════════════════════════════════ */

/* ─── Animated Route Map ─── */

function RouteMap({ progress }: { progress: number }) {
  const pathRef = useRef<SVGPathElement>(null)
  const [dotPos, setDotPos] = useState({ x: 40, y: 180 })

  useEffect(() => {
    if (!pathRef.current) return
    const point = getPointOnPath(pathRef.current, progress / 100)
    setDotPos(point)
  }, [progress])

  return (
    <div className="r56-map-wrapper relative rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(34,197,94,0.04)' }}>
      <svg viewBox="0 0 440 230" className="r56-map-svg w-full" style={{ height: '180px' }}>
        {/* Grid background */}
        {[...Array(6)].map((_, i) => (
          <line
            key={`gh-${i}`}
            x1={0}
            y1={38.3 * (i + 1)}
            x2={440}
            y2={38.3 * (i + 1)}
            stroke="rgba(148,163,184,0.1)"
            strokeWidth={1}
          />
        ))}
        {[...Array(9)].map((_, i) => (
          <line
            key={`gv-${i}`}
            x1={44 * (i + 1)}
            y1={0}
            x2={44 * (i + 1)}
            y2={230}
            stroke="rgba(148,163,184,0.1)"
            strokeWidth={1}
          />
        ))}

        {/* Simulated streets */}
        <line x1={0} y1={100} x2={440} y2={100} stroke="rgba(148,163,184,0.18)" strokeWidth={3} strokeLinecap="round" />
        <line x1={0} y1={170} x2={440} y2={170} stroke="rgba(148,163,184,0.12)" strokeWidth={2} strokeLinecap="round" />
        <line x1={150} y1={0} x2={150} y2={230} stroke="rgba(148,163,184,0.12)" strokeWidth={2} strokeLinecap="round" />
        <line x1={300} y1={0} x2={300} y2={230} stroke="rgba(148,163,184,0.15)" strokeWidth={2} strokeLinecap="round" />

        {/* Route background (dashed) */}
        <path
          d={ROUTE_SVG_PATH}
          fill="none"
          stroke="rgba(148,163,184,0.25)"
          strokeWidth={3}
          strokeDasharray="6 4"
          strokeLinecap="round"
        />

        {/* Route progress (solid animated) */}
        <motion.path
          ref={pathRef}
          d={ROUTE_SVG_PATH}
          fill="none"
          stroke="#16a34a"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${progress * 5} 600`}
          className="r56-route-path-el"
          style={{ filter: 'drop-shadow(0 0 4px rgba(22,163,74,0.3))' }}
        />

        {/* Store origin pin */}
        <g>
          <circle cx={40} cy={180} r={10} fill="#16a34a" opacity={0.15} />
          <circle cx={40} cy={180} r={7} fill="#16a34a" />
          <circle cx={40} cy={180} r={3} fill="#ffffff" />
          <text x={40} y={200} textAnchor="middle" fontSize="9" fill="#16a34a" fontWeight="700" className="r56-map-label-store">
            Loja
          </text>
        </g>

        {/* Destination pin */}
        <g>
          <motion.circle
            cx={400}
            cy={50}
            r={12}
            fill="#ef4444"
            opacity={0.12}
            animate={{ r: [12, 18, 12], opacity: [0.12, 0.04, 0.12] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          />
          <circle cx={400} cy={50} r={7} fill="#ef4444" />
          <circle cx={400} cy={50} r={3} fill="#ffffff" />
          <text x={400} y={38} textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="700" className="r56-map-label-dest">
            Você
          </text>
        </g>

        {/* Animated driver dot */}
        <g>
          <motion.circle
            cx={dotPos.x}
            cy={dotPos.y}
            r={14}
            fill="#16a34a"
            opacity={0.12}
            animate={{ r: [14, 20, 14], opacity: [0.12, 0.04, 0.12] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
          />
          <motion.circle
            cx={dotPos.x}
            cy={dotPos.y}
            fill="#16a34a"
            r={8}
            animate={{ cx: dotPos.x, cy: dotPos.y }}
            transition={{ duration: 0.8, ease: 'easeOut' as const }}
          />
          <motion.circle
            cx={dotPos.x}
            cy={dotPos.y}
            fill="#ffffff"
            r={3.5}
            animate={{ cx: dotPos.x, cy: dotPos.y }}
            transition={{ duration: 0.8, ease: 'easeOut' as const }}
          />
        </g>
      </svg>

      {/* Live badge */}
      <div className="r56-map-live-badge absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
        <span className="text-[9px] font-bold text-white">AO VIVO</span>
      </div>
    </div>
  )
}

/* ─── Driver Card ─── */

function DriverCard({ driver }: { driver: DriverInfo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="r56-driver-card rounded-xl border border-green-200/40 dark:border-green-800/30 overflow-hidden"
      style={{ backgroundColor: 'rgba(34,197,94,0.03)', boxShadow: '0 2px 12px rgba(34,197,94,0.08)' }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Avatar with initial letter */}
          <motion.div
            className="relative shrink-0"
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
          >
            <div
              className="r56-driver-avatar h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
              }}
            >
              {driver.initial}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
              <motion.span
                className="h-2 w-2 rounded-full bg-white"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold truncate">{driver.name}</p>
              <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-full px-1.5 py-0.5">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{driver.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              <span>{driver.totalDeliveries} entregas</span>
              <span className="text-border">•</span>
              <span>{driver.vehicleType}</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{driver.phone}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Status Timeline ─── */

function StatusTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
  const currentIndex = getStatusIndex(currentStatus)

  return (
    <div className="r56-timeline">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          Cronograma do Pedido
        </h4>
        <Badge className="text-[9px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 font-semibold r56-timeline-badge">
          Etapa {currentIndex + 1}/6
        </Badge>
      </div>

      <div className="relative">
        {/* Progress background line */}
        <div className="absolute top-[15px] left-[15px] right-[15px] h-[2px] bg-muted rounded-full" />

        {/* Animated progress line */}
        <motion.div
          className="absolute top-[15px] left-[15px] h-[2px] rounded-full r56-timeline-progress-line"
          style={{ background: 'linear-gradient(90deg, #16a34a, #22c55e)' }}
          animate={{ width: `${((currentIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' as const }}
          initial={{ width: '0%' }}
        />

        {/* Steps */}
        <div className="flex items-start justify-between relative">
          {STATUS_STEPS.map((step, idx) => {
            const isComplete = idx < currentIndex
            const isCurrent = idx === currentIndex
            const isPending = idx > currentIndex

            return (
              <motion.div
                key={step.id}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.08, type: 'spring' as const, stiffness: 260, damping: 22 }}
              >
                {/* Step dot */}
                <div className="relative">
                  <motion.div
                    className="r56-timeline-dot flex items-center justify-center h-[30px] w-[30px] rounded-full z-10 relative"
                    style={{
                      backgroundColor: isComplete
                        ? '#16a34a'
                        : isCurrent
                          ? 'rgba(22,163,74,0.12)'
                          : 'rgba(148,163,184,0.1)',
                      border: isCurrent ? '2px solid #16a34a' : '2px solid transparent',
                    }}
                    animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const }}
                  >
                    <span
                      style={{
                        color: isComplete ? '#ffffff' : isCurrent ? '#16a34a' : '#94a3b8',
                      }}
                    >
                      {step.icon}
                    </span>
                  </motion.div>

                  {/* Pulse glow for current step */}
                  {isCurrent && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ border: '2px solid rgba(22,163,74,0.3)' }}
                        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' as const }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ border: '1.5px solid rgba(22,163,74,0.15)' }}
                        animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' as const, delay: 0.3 }}
                      />
                    </>
                  )}
                </div>

                {/* Step label */}
                <p
                  className="text-[9px] font-semibold mt-1.5 text-center whitespace-nowrap r56-timeline-step-label"
                  style={{
                    color: isComplete || isCurrent ? '#16a34a' : '#94a3b8',
                  }}
                >
                  {step.label}
                </p>

                {/* Time label */}
                {(isComplete || isCurrent) && step.timeLabel && (
                  <motion.p
                    className="text-[8px] text-muted-foreground mt-0.5 font-mono r56-timeline-step-time"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {step.timeLabel}
                  </motion.p>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Countdown Timer ─── */

function CountdownTimer({ etaSeconds }: { etaSeconds: number }) {
  const minutes = Math.floor(etaSeconds / 60)
  const seconds = etaSeconds % 60

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="r56-countdown rounded-xl border border-green-200/40 dark:border-green-800/30 p-4"
      style={{ backgroundColor: 'rgba(34,197,94,0.04)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="r56-countdown-icon h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
            <Timer className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium">Previsão de entrega</p>
            <p className="text-xs font-semibold">Aproximadamente</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Minutes digit */}
          <motion.div
            className="r56-countdown-digit h-10 w-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(34,197,94,0.08)',
              boxShadow: '0 2px 8px rgba(22,163,74,0.1)',
            }}
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={minutes}
                className="text-xl font-bold text-green-600 dark:text-green-400 r56-countdown-value"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {minutes.toString().padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          <span className="r56-countdown-sep text-xl font-bold text-green-600 dark:text-green-400 mx-0.5 animate-pulse">:</span>

          {/* Seconds digit */}
          <motion.div
            className="r56-countdown-digit h-10 w-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(34,197,94,0.08)',
              boxShadow: '0 2px 8px rgba(22,163,74,0.1)',
            }}
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={seconds}
                className="text-xl font-bold text-green-600 dark:text-green-400 r56-countdown-value"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {seconds.toString().padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Contact Buttons ─── */

function ContactButtons() {
  return (
    <div className="r56-contact-buttons grid grid-cols-2 gap-2.5">
      <motion.div
        whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(22,163,74,0.25)' }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      >
        <div
          className="r56-contact-btn flex items-center justify-center gap-2 h-11 rounded-xl cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            boxShadow: '0 2px 12px rgba(22,163,74,0.25)',
          }}
        >
          <Phone className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white">Contatar Entregador</span>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(59,130,246,0.25)' }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      >
        <div
          className="r56-contact-btn flex items-center justify-center gap-2 h-11 rounded-xl cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            boxShadow: '0 2px 12px rgba(37,99,235,0.25)',
          }}
        >
          <Store className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white">Contatar Loja</span>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Order Items List ─── */

function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <div className="r56-items-list">
      <div className="flex items-center gap-2 mb-3">
        <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
        <h4 className="text-sm font-bold">Itens do Pedido</h4>
        <Badge className="ml-auto text-[9px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 font-semibold">
          {items.length} itens
        </Badge>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {items.map((item, idx) => {
            const temp = getTempColor(item.tempType)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.08, type: 'spring' as const, stiffness: 260, damping: 22 }}
                className="r56-item-card flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:border-green-300 dark:hover:border-green-700 transition-colors"
              >
                {/* Temp indicator */}
                <div
                  className="r56-temp-badge h-7 w-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: temp.bg, color: temp.text }}
                >
                  {temp.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">Qtd: {item.quantity}x</p>
                </div>

                <span className="text-xs font-bold text-green-600 dark:text-green-400 shrink-0">
                  R${(item.price * item.quantity).toFixed(2).replace('.', ',')}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Delivery Instructions ─── */

function DeliveryInstructions() {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="r56-instructions rounded-xl border border-amber-200/40 dark:border-amber-800/30 overflow-hidden"
      style={{ backgroundColor: 'rgba(245,158,11,0.03)' }}
    >
      <div
        className="flex items-center gap-3 p-3.5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="r56-instructions-icon h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}>
          <Navigation className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold">Instruções de Entrega</p>
          <p className="text-[10px] text-muted-foreground">
            {expanded ? DELIVERY_INSTRUCTIONS : 'Tap para ver instruções...'}
          </p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 border-t border-amber-200/20 dark:border-amber-800/20 pt-3">
              <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(245,158,11,0.04)' }}>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  {DELIVERY_INSTRUCTIONS}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] text-muted-foreground">Endereço: Rua das Flores, 123 — Centro</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Progress Mini Bar (inline stats) ─── */

function ProgressStats({ routeProgress, etaSeconds, isDelivered }: { routeProgress: number; etaSeconds: number; isDelivered: boolean }) {
  return (
    <div className="r56-progress-stats grid grid-cols-3 gap-2">
      {[
        {
          icon: <Navigation className="h-3.5 w-3.5" />,
          value: `${Math.round(routeProgress)}%`,
          label: 'da rota',
          color: '#16a34a',
          bg: 'rgba(22,163,74,0.08)',
        },
        {
          icon: <Clock className="h-3.5 w-3.5" />,
          value: isDelivered ? '0s' : formatCountdown(etaSeconds),
          label: 'restante',
          color: '#2563eb',
          bg: 'rgba(37,99,235,0.08)',
        },
        {
          icon: <Truck className="h-3.5 w-3.5" />,
          value: '2.4km',
          label: 'distância',
          color: '#d97706',
          bg: 'rgba(217,119,6,0.08)',
        },
      ].map((stat, idx) => (
        <motion.div
          key={`stat-${idx}`}
          initial={{ opacity: 0, y: 14, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1 + idx * 0.08, type: 'spring' as const, stiffness: 260, damping: 22 }}
          className="r56-stat-card rounded-xl p-3 text-center"
          style={{ backgroundColor: stat.bg, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
        >
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3, ease: 'easeInOut' as const }}
            className="flex justify-center mb-1.5"
          >
            <div className="h-7 w-7 rounded-md flex items-center justify-center" style={{ color: stat.color }}>
              {stat.icon}
            </div>
          </motion.div>
          <p className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</p>
          <p className="text-[9px] text-muted-foreground">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── Tip Selector ─── */

function TipSelector({ selectedTip, onTipChange }: { selectedTip: number; onTipChange: (val: number) => void }) {
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleCustomSubmit = useCallback(() => {
    const val = parseFloat(customInput)
    if (!isNaN(val) && val > 0) {
      onTipChange(val)
    }
  }, [customInput, onTipChange])

  return (
    <div className="r56-tip-selector">
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-amber-500" />
        <h4 className="text-sm font-bold">Gorjeta para o Entregador</h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TIP_OPTIONS_INIT.map((opt, idx) => {
          const isSelected = opt.value === -1 ? showCustom : selectedTip === opt.value

          return (
            <motion.div
              key={`tip-${idx}`}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              className="r56-tip-btn relative"
              onClick={() => {
                if (opt.value === -1) {
                  setShowCustom(true)
                  onTipChange(-1)
                } else {
                  setShowCustom(false)
                  setCustomInput('')
                  onTipChange(opt.value)
                }
              }}
            >
              {/* Animated ring on selection */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ border: '2px solid #16a34a' }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                />
              )}
              <motion.div
                className={`relative flex items-center justify-center h-10 rounded-xl cursor-pointer text-xs font-bold transition-colors ${isSelected ? 'r56-tip-btn-selected' : ''}`}
                style={{
                  backgroundColor: isSelected ? 'rgba(22,163,74,0.1)' : 'rgba(148,163,184,0.06)',
                  color: isSelected ? '#16a34a' : '#6b7280',
                  border: isSelected ? '1.5px solid rgba(22,163,74,0.3)' : '1.5px solid rgba(148,163,184,0.15)',
                }}
              >
                {opt.label}
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Custom input */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mt-2"
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="R$ 0,00"
                className="r56-tip-custom-input flex-1 h-9 rounded-lg border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  className="r56-tip-custom-btn h-9 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-bold text-white"
                  onClick={handleCustomSubmit}
                >
                  OK
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Order Total Breakdown ─── */

function OrderBreakdown({ tipValue }: { tipValue: number }) {
  const rows: CostRow[] = useMemo(() => {
    return COST_ROWS_INIT.map((row) => {
      if (row.id === 'tip') {
        return { ...row, value: tipValue > 0 ? `R$${tipValue.toFixed(2).replace('.', ',')}` : 'R$0,00' }
      }
      return row
    })
  }, [tipValue])

  const subtotal = 96.8
  const deliveryFee = 5.9
  const serviceFee = 3.0
  const discount = 9.68
  const tip = tipValue
  const total = subtotal + deliveryFee + serviceFee - discount + tip

  return (
    <div className="r56-breakdown">
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="h-4 w-4 text-green-600 dark:text-green-400" />
        <h4 className="text-sm font-bold">Resumo do Pedido</h4>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {rows.map((row, idx) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.06, type: 'spring' as const, stiffness: 260, damping: 22 }}
              className="r56-breakdown-row flex items-center justify-between py-1"
            >
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className={`text-xs font-semibold ${row.id === 'discount' ? 'text-green-600 dark:text-green-400' : ''}`}>
                {row.value}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Divider */}
        <div className="border-t border-border/60 my-1" />

        {/* Total */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' as const, stiffness: 260, damping: 22 }}
          className="r56-breakdown-total flex items-center justify-between py-2 rounded-lg"
          style={{ backgroundColor: 'rgba(22,163,74,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-bold">Total</span>
          </div>
          <motion.span
            key={total.toFixed(2)}
            className="text-lg font-bold text-green-600 dark:text-green-400 r56-total-value"
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
          >
            R${total.toFixed(2).replace('.', ',')}
          </motion.span>
        </motion.div>
      </div>
    </div>
  )
}

/* ─── Delay Alert Badge ─── */

function DelayAlert({ isDelayed }: { isDelayed: boolean }) {
  if (!isDelayed) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      className="r56-delay-alert flex items-center gap-2 p-3 rounded-xl border border-amber-300/60 dark:border-amber-700/40"
      style={{ backgroundColor: 'rgba(245,158,11,0.08)' }}
    >
      <motion.div
        className="r56-delay-pulse-icon h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'rgba(245,158,11,0.15)' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Atraso Detectado</p>
        <p className="text-[10px] text-amber-600/80 dark:text-amber-500/80">
          Estimativa atualizada: +8 min
        </p>
      </div>
      <motion.div
        className="r56-delay-badge-pulse h-2 w-2 rounded-full bg-amber-500 shrink-0"
        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
    </motion.div>
  )
}

/* ─── Rate Delivery Stars ─── */

function RateDelivery({ show, rating, onRate }: { show: boolean; rating: number; onRate: (r: number) => void }) {
  const [hovered, setHovered] = useState(0)

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="r56-rating-card rounded-xl border border-green-200/40 dark:border-green-800/30 p-4 text-center"
      style={{ backgroundColor: 'rgba(34,197,94,0.04)', boxShadow: '0 4px 20px rgba(22,163,74,0.1)' }}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        <p className="text-sm font-bold">Pedido Entregue!</p>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3">Avalie a entrega</p>

      <div className="flex items-center justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onRate(star)}
            className="focus:outline-none r56-star-btn"
          >
            <motion.div
              animate={rating >= star ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Star
                className="h-7 w-7 transition-colors"
                style={{
                  color: star <= (hovered || rating) ? '#f59e0b' : '#d1d5db',
                  fill: star <= (hovered || rating) ? '#f59e0b' : 'none',
                }}
              />
            </motion.div>
          </motion.button>
        ))}
      </div>

      {rating > 0 && (
        <motion.p
          className="text-[10px] text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Obrigado pela avaliação! {rating}/5
        </motion.p>
      )}
    </motion.div>
  )
}

/* ─── Temperature Indicator ─── */

function TemperatureIndicator({ items }: { items: OrderItem[] }) {
  const hasHot = items.some((i) => i.tempType === 'hot')
  const hasCold = items.some((i) => i.tempType === 'cold')
  if (!hasHot && !hasCold) return null

  const hotItems = items.filter((i) => i.tempType === 'hot')
  const coldItems = items.filter((i) => i.tempType === 'cold')

  return (
    <div className="r56-temp-indicator">
      <div className="flex items-center gap-2 mb-2">
        <Thermometer className="h-4 w-4 text-amber-500" />
        <h4 className="text-sm font-bold">Temperatura</h4>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {hasHot && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: 'spring' as const, stiffness: 260, damping: 22 }}
            className="r56-temp-hot flex items-center gap-2 p-2.5 rounded-lg"
            style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const }}
              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}
            >
              <Flame className="h-4 w-4 text-red-500" />
            </motion.div>
            <div>
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400">Quente</p>
              <p className="text-[9px] text-muted-foreground">{hotItems.map((i) => i.name).join(', ')}</p>
            </div>

            {/* Animated thermometer bar */}
            <div className="ml-auto flex flex-col items-center gap-0.5">
              <div className="r56-thermometer-track h-10 w-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
                <motion.div
                  className="r56-thermometer-fill w-full rounded-full"
                  style={{ backgroundColor: '#ef4444' }}
                  animate={{ height: ['60%', '75%', '60%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {hasCold && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, type: 'spring' as const, stiffness: 260, damping: 22 }}
            className="r56-temp-cold flex items-center gap-2 p-2.5 rounded-lg"
            style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}
              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}
            >
              <Snowflake className="h-4 w-4 text-blue-500" />
            </motion.div>
            <div>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Gelado</p>
              <p className="text-[9px] text-muted-foreground">{coldItems.map((i) => i.name).join(', ')}</p>
            </div>

            {/* Animated thermometer bar */}
            <div className="ml-auto flex flex-col items-center gap-0.5">
              <div className="r56-thermometer-track h-10 w-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
                <motion.div
                  className="r56-thermometer-fill w-full rounded-full"
                  style={{ backgroundColor: '#3b82f6' }}
                  animate={{ height: ['70%', '55%', '70%'] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

/* ─── MessageSquare quick contact ─── */

function QuickMessageBtn() {
  const [sent, setSent] = useState(false)

  const handleClick = useCallback(() => {
    setSent(true)
    setTimeout(() => setSent(false), 2000)
  }, [])

  return (
    <motion.div whileTap={{ scale: 0.95 }} transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}>
      <div
        className="r56-msg-btn flex items-center justify-center gap-2 h-11 rounded-xl cursor-pointer"
        style={{
          backgroundColor: 'rgba(22,163,74,0.08)',
          border: '1.5px solid rgba(22,163,74,0.2)',
        }}
        onClick={handleClick}
      >
        <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="text-xs font-bold text-green-600 dark:text-green-400">
          {sent ? 'Mensagem enviada!' : 'Enviar mensagem rápida'}
        </span>
        {sent && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
          >
            <Check className="h-3.5 w-3.5 text-green-600" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   Main Component: FoodDeliveryTracker
   ══════════════════════════════════════════════════════ */

export function FoodDeliveryTracker() {
  // Order status simulation
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('out_for_delivery')
  const [isDelayed, setIsDelayed] = useState(true)
  const [routeProgress, setRouteProgress] = useState(35)
  const [etaSeconds, setEtaSeconds] = useState(INITIAL_ETA_SECONDS)
  const [selectedTip, setSelectedTip] = useState(0)
  const [deliveryRating, setDeliveryRating] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const etaRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Simulate live location updates every 2 seconds
  useEffect(() => {
    if (currentStatus === 'delivered') return

    intervalRef.current = setInterval(() => {
      setRouteProgress((prev) => {
        const next = prev + 0.4 + Math.random() * 0.3
        if (next >= 100) {
          // Mark as delivered when route is complete
          setCurrentStatus('delivered')
          return 100
        }
        return next
      })
    }, 2000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [currentStatus])

  // Countdown timer
  useEffect(() => {
    if (currentStatus === 'delivered') {
      if (etaRef.current) clearInterval(etaRef.current)
      return
    }

    etaRef.current = setInterval(() => {
      setEtaSeconds((prev) => {
        if (prev <= 0) return 0
        return prev - 1
      })
    }, 1000)

    return () => {
      if (etaRef.current) clearInterval(etaRef.current)
    }
  }, [currentStatus])

  // Auto-dismiss delay alert after 10 seconds
  useEffect(() => {
    if (isDelayed) {
      const timer = setTimeout(() => setIsDelayed(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [isDelayed])

  const handleTipChange = useCallback((val: number) => {
    setSelectedTip(val)
  }, [])

  const handleRateDelivery = useCallback((r: number) => {
    setDeliveryRating(r)
  }, [])

  // Demo: simulate next status step
  const handleNextStatus = useCallback(() => {
    setCurrentStatus((prev) => {
      const idx = getStatusIndex(prev)
      const nextIdx = Math.min(idx + 1, STATUS_STEPS.length - 1)
      return STATUS_STEPS[nextIdx].id
    })
  }, [])

  const isDelivered = currentStatus === 'delivered'

  return (
    <section className="r56-food-delivery-tracker space-y-4">
      {/* ─── Hero Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
        className="relative overflow-hidden rounded-2xl p-5 text-white r56-header"
        style={{
          background: 'linear-gradient(135deg, #16a34a, #15803d, #166534)',
          boxShadow: '0 8px 32px rgba(22,163,74,0.3)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' as const }}
          className="absolute top-4 right-16 h-10 w-10 rounded-full border-2 border-dashed border-white/15"
        />

        <div className="relative z-10 flex items-center gap-3">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
            className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center"
          >
            <Truck className="h-6 w-6" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold">Rastreador de Delivery</h2>
            <p className="text-sm text-white/70 mt-0.5">Acompanhe seu pedido em tempo real</p>
          </div>
        </div>

        {/* Live indicator */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10 mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs r56-live-badge"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          {isDelivered ? 'Entrega concluída' : 'Transmissão ao vivo'}
        </motion.div>

        {/* Store name */}
        <p className="relative z-10 mt-2 text-sm text-white/60 flex items-center gap-1.5">
          <Store className="h-3.5 w-3.5" />
          {STORE_NAME} — Pedido #FD-48291
        </p>
      </motion.div>

      {/* ─── Delay Alert ─── */}
      <DelayAlert isDelayed={isDelayed && !isDelivered} />

      {/* ─── Animated Route Map ─── */}
      <Card className="r56-map-card border-border/60 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold">Rota de Entrega</span>
            <span className="ml-auto text-[10px] text-green-600 dark:text-green-400 font-semibold">
              {Math.round(routeProgress)}% concluído
            </span>
          </div>
          <RouteMap progress={routeProgress} />
        </CardContent>
      </Card>

      {/* ─── Progress Stats ─── */}
      <ProgressStats routeProgress={routeProgress} etaSeconds={etaSeconds} isDelivered={isDelivered} />

      {/* ─── Countdown Timer ─── */}
      {!isDelivered && <CountdownTimer etaSeconds={etaSeconds} />}

      {/* ─── Demo: Simulate Next Step ─── */}
      <motion.div whileTap={{ scale: 0.97 }} className="flex justify-center">
        <div
          className="r56-demo-btn flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[10px] font-semibold text-muted-foreground"
          style={{ backgroundColor: 'rgba(148,163,184,0.08)', border: '1px dashed rgba(148,163,184,0.25)' }}
          onClick={handleNextStatus}
        >
          <ChevronRight className="h-3 w-3" />
          Simular próxima etapa
        </div>
      </motion.div>

      {/* ─── Driver Card ─── */}
      <DriverCard driver={MOCK_DRIVER} />

      {/* ─── Status Timeline ─── */}
      <Card className="r56-timeline-card border-border/60 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <CardContent className="p-4">
          <StatusTimeline currentStatus={currentStatus} />
        </CardContent>
      </Card>

      {/* ─── Contact Buttons ─── */}
      {!isDelivered && (
        <>
          <ContactButtons />
          <QuickMessageBtn />
        </>
      )}

      {/* ─── Order Items List ─── */}
      <Card className="r56-items-card border-border/60 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <CardContent className="p-4">
          <OrderItemsList items={MOCK_ITEMS} />
        </CardContent>
      </Card>

      {/* ─── Temperature Indicator ─── */}
      <Card className="r56-temp-card border-border/60 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <CardContent className="p-4">
          <TemperatureIndicator items={MOCK_ITEMS} />
        </CardContent>
      </Card>

      {/* ─── Delivery Instructions ─── */}
      <DeliveryInstructions />

      {/* ─── Tip Selector ─── */}
      {!isDelivered && (
        <Card className="r56-tip-card border-border/60 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <CardContent className="p-4">
            <TipSelector selectedTip={selectedTip} onTipChange={handleTipChange} />
          </CardContent>
        </Card>
      )}

      {/* ─── Order Breakdown ─── */}
      <Card className="r56-breakdown-card border-border/60 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <CardContent className="p-4">
          <OrderBreakdown tipValue={selectedTip > 0 ? selectedTip : 0} />
        </CardContent>
      </Card>

      {/* ─── Rate Delivery (shows after delivery) ─── */}
      <RateDelivery show={isDelivered} rating={deliveryRating} onRate={handleRateDelivery} />

      {/* ─── Footer info ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="r56-footer text-center py-2"
      >
        <p className="text-[10px] text-muted-foreground">
          Pedido realizado via DomPlace • Atualizações automáticas a cada 2s
        </p>
      </motion.div>
    </section>
  )
}
