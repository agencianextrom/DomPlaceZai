'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Navigation,
  Package,
  Clock,
  Battery,
  Wind,
  Eye,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Plane,
  ChevronRight,
  Camera,
  Thermometer,
  Gauge,
  Weight,
  Box,
  Radio,
  Zap,
  ArrowDown,
  ArrowUp,
  Play,
  Pause,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

/* ══════════════════════════════════════════════════════
   Types & Interfaces
   ══════════════════════════════════════════════════════ */

type DeliveryPhase = 'picked_up' | 'in_flight' | 'descending' | 'delivered'

interface DroneState {
  progress: number
  altitude: number
  speed: number
  battery: number
  phase: DeliveryPhase
  etaSeconds: number
}

interface NoFlyZone {
  id: string
  label: string
  cx: number
  cy: number
  rx: number
  ry: number
}

interface PackageDetails {
  id: string
  weight: string
  dimensions: string
  contents: string[]
  storeName: string
  storeIcon: string
  trackingNumber: string
}

interface WeatherState {
  windSpeed: number
  windDirection: number
  visibility: number
  temperature: number
  condition: string
}

interface TimelineStep {
  id: DeliveryPhase
  label: string
  description: string
  icon: React.ReactNode
  time: string
}

/* ══════════════════════════════════════════════════════
   Constants & Mock Data
   ══════════════════════════════════════════════════════ */

const INITIAL_ETA_SECONDS = 720 // 12 minutes

const NO_FLY_ZONES: NoFlyZone[] = [
  { id: 'nfz-1', label: 'Aeroporto', cx: 200, cy: 60, rx: 50, ry: 35 },
  { id: 'nfz-2', label: 'Hospital Central', cx: 80, cy: 180, rx: 35, ry: 30 },
  { id: 'nfz-3', label: 'Área Militar', cx: 320, cy: 200, rx: 45, ry: 25 },
]

const PACKAGE_DATA: PackageDetails = {
  id: 'pkg-001',
  weight: '2.4 kg',
  dimensions: '30 × 20 × 15 cm',
  contents: ['Eletrônicos', 'Smartphone', 'Capa protetora', 'Carregador'],
  storeName: 'TechStore Premium',
  storeIcon: '📱',
  trackingNumber: 'DRN-48291-X',
}

const INITIAL_WEATHER: WeatherState = {
  windSpeed: 12,
  windDirection: 45,
  visibility: 8.5,
  temperature: 28,
  condition: 'Parcialmente nublado',
}

const ROUTE_PATH = 'M 50 320 C 80 280, 120 180, 180 160 S 260 100, 320 80 S 380 60, 420 50'

const TIMELINE_STEPS: TimelineStep[] = [
  { id: 'picked_up', label: 'Coletado', description: 'Pacote retirado do centro de distribuição', icon: <Package className="h-3.5 w-3.5" />, time: '14:32' },
  { id: 'in_flight', label: 'Em voo', description: 'Drone em rota de entrega autônoma', icon: <Plane className="h-3.5 w-3.5" />, time: '14:35' },
  { id: 'descending', label: 'Descendo', description: 'Drone iniciando aproximação final', icon: <ArrowDown className="h-3.5 w-3.5" />, time: '' },
  { id: 'delivered', label: 'Entregue', description: 'Pacote entregue com sucesso!', icon: <CheckCircle className="h-3.5 w-3.5" />, time: '' },
]

/* ══════════════════════════════════════════════════════
   Helper Functions
   ══════════════════════════════════════════════════════ */

function getPhaseFromProgress(progress: number): DeliveryPhase {
  if (progress < 5) return 'picked_up'
  if (progress < 85) return 'in_flight'
  if (progress < 98) return 'descending'
  return 'delivered'
}

function getAltitudeFromProgress(progress: number): number {
  if (progress < 5) return 0
  if (progress < 15) return progress * 8
  if (progress < 85) return 120 - Math.sin(((progress - 15) / 70) * Math.PI) * 15
  if (progress < 98) return Math.max(5, 120 * (1 - (progress - 85) / 13))
  return 0
}

function getSpeedFromProgress(progress: number): number {
  if (progress < 5) return 0
  if (progress < 15) return progress * 3.5
  if (progress < 85) return 48 + Math.sin(((progress - 15) / 70) * Math.PI * 2) * 8
  if (progress < 98) return Math.max(8, 48 * (1 - (progress - 85) / 13))
  return 0
}

function getBatteryFromProgress(progress: number): number {
  if (progress >= 98) return Math.max(15, 92 - progress * 0.78)
  return Math.max(18, 92 - progress * 0.78)
}

function getBatteryColor(level: number): string {
  if (level >= 60) return '#22c55e'
  if (level >= 35) return '#eab308'
  return '#ef4444'
}

function getBatteryBgColor(level: number): string {
  if (level >= 60) return 'rgba(34,197,94,0.1)'
  if (level >= 35) return 'rgba(234,179,8,0.1)'
  return 'rgba(239,68,68,0.1)'
}

function getBatteryLabel(level: number): string {
  if (level >= 60) return 'Boa'
  if (level >= 35) return 'Moderada'
  return 'Baixa'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/* ══════════════════════════════════════════════════════
   Animated Counter Hook
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

/* ─── Drone Icon with Propeller Animation ─── */

function DroneIcon({ size = 28, propellerSpeed = 1 }: { size?: number; propellerSpeed?: number }) {
  const half = size / 2
  const armLen = size * 0.38
  const bodyR = size * 0.12

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="r53-drone-icon">
      {/* Arms */}
      <line x1={half} y1={half} x2={half - armLen} y2={half - armLen} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <line x1={half} y1={half} x2={half + armLen} y2={half - armLen} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <line x1={half} y1={half} x2={half - armLen} y2={half + armLen} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <line x1={half} y1={half} x2={half + armLen} y2={half + armLen} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />

      {/* Body */}
      <circle cx={half} cy={half} r={bodyR} fill="currentColor" opacity={0.3} />
      <circle cx={half} cy={half} r={bodyR * 0.5} fill="currentColor" />

      {/* Propeller discs (rotating) */}
      <motion.circle
        cx={half - armLen}
        cy={half - armLen}
        r={size * 0.1}
        fill="currentColor"
        opacity={0.25}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.3 / propellerSpeed, repeat: Infinity, ease: 'linear' as const }}
        style={{ transformOrigin: `${half - armLen}px ${half - armLen}px` }}
      />
      <motion.circle
        cx={half + armLen}
        cy={half - armLen}
        r={size * 0.1}
        fill="currentColor"
        opacity={0.25}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.28 / propellerSpeed, repeat: Infinity, ease: 'linear' as const }}
        style={{ transformOrigin: `${half + armLen}px ${half - armLen}px` }}
      />
      <motion.circle
        cx={half - armLen}
        cy={half + armLen}
        r={size * 0.1}
        fill="currentColor"
        opacity={0.25}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.32 / propellerSpeed, repeat: Infinity, ease: 'linear' as const }}
        style={{ transformOrigin: `${half - armLen}px ${half + armLen}px` }}
      />
      <motion.circle
        cx={half + armLen}
        cy={half + armLen}
        r={size * 0.1}
        fill="currentColor"
        opacity={0.25}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.26 / propellerSpeed, repeat: Infinity, ease: 'linear' as const }}
        style={{ transformOrigin: `${half + armLen}px ${half + armLen}px` }}
      />
    </svg>
  )
}

/* ─── Animated Gauge Component ─── */

function GaugeIndicator({
  label,
  value,
  unit,
  maxVal,
  color,
  icon,
}: {
  label: string
  value: number
  unit: string
  maxVal: number
  color: string
  icon: React.ReactNode
}) {
  const smoothValue = useSmoothValue(value)
  const pct = Math.min((smoothValue / maxVal) * 100, 100)

  return (
    <div className="r53-drone-gauge flex flex-col items-center gap-1">
      <div className="r53-drone-gauge-icon flex items-center justify-center h-6 w-6 rounded-md" style={{ backgroundColor: `${color}15`, color }}>
        {icon}
      </div>
      <svg viewBox="0 0 80 50" className="w-16 h-10 r53-drone-gauge-arc">
        {/* Background arc */}
        <path
          d="M 10 45 A 30 30 0 0 1 70 45"
          fill="none"
          stroke="rgba(148,163,184,0.15)"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <motion.path
          d="M 10 45 A 30 30 0 0 1 70 45"
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${pct * 1.2} 200`}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
        />
      </svg>
      <p className="text-xs font-bold r53-drone-gauge-value" style={{ color }}>
        {Math.round(smoothValue)}{unit}
      </p>
      <p className="text-[9px] text-muted-foreground r53-drone-gauge-label">{label}</p>
    </div>
  )
}

/* ─── Battery Level Indicator ─── */

function BatteryIndicator({ level }: { level: number }) {
  const color = getBatteryColor(level)
  const bgColor = getBatteryBgColor(level)
  const label = getBatteryLabel(level)

  return (
    <div
      className="r53-drone-battery flex items-center gap-2.5 p-3 rounded-xl border"
      style={{
        borderColor: `${color}30`,
        backgroundColor: bgColor,
        boxShadow: `0 2px 8px ${color}15`,
      }}
    >
      <div className="flex items-center justify-center h-8 w-8 rounded-lg" style={{ backgroundColor: bgColor }}>
        <Battery className="h-4 w-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-muted-foreground r53-drone-battery-label">Bateria do drone</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold r53-drone-battery-pct" style={{ color }}>
              {Math.round(level)}%
            </span>
            <span
              className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full r53-drone-battery-status"
              style={{ backgroundColor: bgColor, color }}
            >
              {label}
            </span>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden r53-drone-battery-track">
          <motion.div
            className="h-full rounded-full r53-drone-battery-fill"
            style={{ backgroundColor: color }}
            animate={{ width: `${level}%` }}
            transition={{ duration: 1, ease: 'easeOut' as const }}
          />
        </div>
      </div>
      {/* Battery icon segments */}
      <svg viewBox="0 0 20 36" className="h-7 w-4 shrink-0 r53-drone-battery-segments">
        <rect x="1" y="1" width="16" height="32" rx="3" fill="none" stroke={color} strokeWidth="1.5" opacity={0.4} />
        <rect x="5" y="0" width="8" height="3" rx="1" fill={color} opacity={0.4} />
        <motion.rect
          x="3"
          y="33"
          width="12"
          height={0}
          rx="2"
          fill={color}
          animate={{ y: 3 + (1 - level / 100) * 28, height: Math.max(2, (level / 100) * 28) }}
          transition={{ duration: 1, ease: 'easeOut' as const }}
        />
      </svg>
    </div>
  )
}

/* ─── Delivery Timeline ─── */

function DeliveryTimeline({ currentPhase, onPhaseClick }: { currentPhase: DeliveryPhase; onPhaseClick: (phase: DeliveryPhase) => void }) {
  const phaseOrder: DeliveryPhase[] = ['picked_up', 'in_flight', 'descending', 'delivered']
  const currentIndex = phaseOrder.indexOf(currentPhase)

  return (
    <div className="r53-drone-timeline">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-violet-500" />
          Cronograma de Entrega
        </h4>
        <Badge className="text-[9px] bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-0 font-semibold r53-drone-timeline-badge">
          Etapa {currentIndex + 1}/4
        </Badge>
      </div>

      <div className="space-y-0">
        {TIMELINE_STEPS.map((step, idx) => {
          const isComplete = idx < currentIndex
          const isCurrent = step.id === currentPhase
          const isPending = idx > currentIndex

          return (
            <motion.div
              key={step.id}
              className="relative flex gap-3 r53-drone-timeline-step"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.08, type: 'spring' as const, stiffness: 260, damping: 22 }}
            >
              {/* Line connector */}
              {idx > 0 && (
                <div className="absolute left-[15px] top-0 w-0.5 h-full r53-drone-timeline-line">
                  <motion.div
                    className="w-full"
                    style={{ backgroundColor: isComplete ? '#8b5cf6' : 'rgba(148,163,184,0.2)' }}
                    animate={{ height: isComplete ? '100%' : '0%', transition: { duration: 0.4, ease: 'easeOut' as const } }}
                  />
                </div>
              )}

              {/* Step circle */}
              <motion.div
                className="relative z-10 flex items-center justify-center h-8 w-8 rounded-full shrink-0 r53-drone-timeline-dot"
                style={{
                  backgroundColor: isComplete ? '#8b5cf6' : isCurrent ? 'rgba(139,92,246,0.15)' : 'rgba(148,163,184,0.1)',
                  border: isCurrent ? '2px solid #8b5cf6' : '2px solid transparent',
                }}
                animate={isCurrent ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const }}
                onClick={() => onPhaseClick(step.id)}
              >
                <span style={{ color: isComplete || isCurrent ? isComplete ? '#ffffff' : '#8b5cf6' : '#94a3b8' }}>
                  {step.icon}
                </span>
              </motion.div>

              {/* Step content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-center gap-2">
                  <p
                    className="text-xs font-semibold r53-drone-timeline-step-label"
                    style={{ color: isComplete || isCurrent ? '#8b5cf6' : '#94a3b8' }}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <motion.span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500 text-white r53-drone-timeline-active"
                      animate={{ opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      AO VIVO
                    </motion.span>
                  )}
                  {step.time && (
                    <span className="text-[9px] text-muted-foreground ml-auto r53-drone-timeline-time">{step.time}</span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 r53-drone-timeline-desc">{step.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Camera Feed Simulation ─── */

function CameraFeed({ progress, altitude }: { progress: number; altitude: number }) {
  const [scanLine, setScanLine] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine((prev) => (prev >= 100 ? 0 : prev + 2))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="r53-drone-camera relative overflow-hidden rounded-xl border border-violet-200/40 dark:border-violet-800/30" style={{ height: 160 }}>
      {/* Simulated aerial view background */}
      <div
        className="absolute inset-0 r53-drone-camera-bg"
        style={{
          background: `
            radial-gradient(ellipse at ${30 + progress * 0.4}% ${40 + progress * 0.2}%, rgba(34,197,94,0.3), transparent 50%),
            radial-gradient(ellipse at ${60 - progress * 0.2}% ${70 - progress * 0.3}%, rgba(59,130,246,0.15), transparent 40%),
            linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.08)),
            repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 9px),
            repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 9px)
          `,
        }}
      />

      {/* Moving ground features */}
      <motion.div
        className="absolute r53-drone-camera-features"
        animate={{ y: [0, -30, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        {/* Buildings */}
        <div className="absolute top-4 left-6 h-6 w-4 rounded-sm bg-white/15" />
        <div className="absolute top-3 left-12 h-8 w-3 rounded-sm bg-white/10" />
        <div className="absolute top-5 left-18 h-5 w-5 rounded-sm bg-white/12" />
        {/* Roads */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-white/20" />
        <div className="absolute top-0 bottom-0 left-20 w-1 bg-white/15" />
        {/* Green areas */}
        <div className="absolute top-2 left-24 h-10 w-8 rounded-md bg-green-400/15" />
        <div className="absolute bottom-4 right-4 h-8 w-12 rounded-md bg-green-400/10" />
      </motion.div>

      {/* Scan line overlay */}
      <motion.div
        className="absolute left-0 right-0 h-px r53-drone-camera-scanline"
        style={{
          top: `${scanLine}%`,
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
        }}
      />

      {/* Crosshair overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none r53-drone-camera-crosshair">
        <div className="relative h-12 w-12">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-px bg-violet-400/40" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-3 w-px bg-violet-400/40" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-px bg-violet-400/40" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-px bg-violet-400/40" />
          <motion.div
            className="absolute inset-2 rounded-full border border-violet-400/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          />
        </div>
      </div>

      {/* HUD overlay text */}
      <div className="absolute top-2 left-2 r53-drone-camera-hud">
        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-md px-2 py-1">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' as const }}
          >
            <Camera className="h-3 w-3 text-red-400" />
          </motion.div>
          <span className="text-[9px] text-white font-mono font-semibold">CAM-01 LIVE</span>
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>

      <div className="absolute top-2 right-2 r53-drone-camera-data">
        <div className="bg-black/50 backdrop-blur-sm rounded-md px-2 py-1 space-y-0.5">
          <p className="text-[8px] text-white/60 font-mono">ALT: {Math.round(altitude)}m</p>
          <p className="text-[8px] text-white/60 font-mono">GPS: {(-23.5 - progress * 0.01).toFixed(4)}</p>
          <p className="text-[8px] text-white/60 font-mono">HDG: {(45 + progress * 1.2) % 360}°</p>
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-violet-400/40" />
      <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-violet-400/40" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-violet-400/40" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-violet-400/40" />
    </div>
  )
}

/* ─── Weather Overlay ─── */

function WeatherOverlay({ weather }: { weather: WeatherState }) {
  return (
    <div className="r53-drone-weather flex items-center gap-3 p-3 rounded-xl border border-sky-200/40 dark:border-sky-800/30" style={{ backgroundColor: 'rgba(14,165,233,0.04)' }}>
      <div className="flex items-center justify-center h-8 w-8 rounded-lg" style={{ backgroundColor: 'rgba(14,165,233,0.1)' }}>
        <Thermometer className="h-4 w-4 text-sky-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground r53-drone-weather-label">Condições meteorológicas</p>
        <p className="text-xs font-semibold r53-drone-weather-condition">{weather.condition}</p>
      </div>
      <div className="flex items-center gap-2">
        {/* Wind direction arrow */}
        <div className="relative flex items-center justify-center h-10 w-10">
          <svg viewBox="0 0 40 40" className="r53-drone-wind-compass">
            <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(14,165,233,0.15)" strokeWidth="1" />
            <motion.g
              animate={{ rotate: weather.windDirection }}
              transition={{ duration: 1.5, ease: 'easeOut' as const }}
              style={{ transformOrigin: '20px 20px' }}
            >
              <polygon points="20,4 23,16 20,13 17,16" fill="#0ea5e9" opacity={0.8} />
              <line x1="20" y1="13" x2="20" y2="36" stroke="#0ea5e9" strokeWidth="1.5" opacity={0.3} />
            </motion.g>
            <circle cx="20" cy="20" r="3" fill="#0ea5e9" opacity={0.5} />
          </svg>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Wind className="h-3 w-3 text-sky-500" />
            <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 r53-drone-wind-speed">{weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3 text-sky-500" />
            <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 r53-drone-weather-vis">{weather.visibility} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Thermometer className="h-3 w-3 text-sky-500" />
            <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 r53-drone-weather-temp">{weather.temperature}°C</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── No-Fly Zone Marker ─── */

function NoFlyZoneMarker({ zone }: { zone: NoFlyZone }) {
  const [hovered, setHovered] = useState(false)

  return (
    <g
      className="r53-drone-nfz"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Zone boundary */}
      <motion.ellipse
        cx={zone.cx}
        cy={zone.cy}
        rx={zone.rx}
        ry={zone.ry}
        fill="rgba(239,68,68,0.06)"
        stroke="rgba(239,68,68,0.3)"
        strokeWidth={1.5}
        strokeDasharray="6 4"
        animate={{ opacity: hovered ? 1 : 0.7 }}
        transition={{ duration: 0.3 }}
      />
      {/* Diagonal lines pattern */}
      {[...Array(5)].map((_, i) => (
        <line
          key={`nfz-line-${zone.id}-${i}`}
          x1={zone.cx - zone.rx + i * (zone.rx * 2 / 4)}
          y1={zone.cy - zone.ry}
          x2={zone.cx - zone.rx + i * (zone.rx * 2 / 4) - zone.ry}
          y2={zone.cy + zone.ry}
          stroke="rgba(239,68,68,0.08)"
          strokeWidth={1}
        />
      ))}
      {/* Warning icon */}
      <motion.g
        animate={{ scale: hovered ? 1.1 : 1 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      >
        <circle cx={zone.cx} cy={zone.cy} r="14" fill="rgba(239,68,68,0.9)" />
        <text x={zone.cx} y={zone.cy + 1} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
          !
        </text>
      </motion.g>
      {/* Label */}
      <motion.text
        x={zone.cx}
        y={zone.cy - 20}
        textAnchor="middle"
        fontSize="8"
        fill="rgba(239,68,68,0.8)"
        fontWeight="600"
        animate={{ opacity: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.3 }}
        className="r53-drone-nfz-label"
      >
        {zone.label}
      </motion.text>
    </g>
  )
}

/* ─── Package Details Card ─── */

function PackageDetailsCard({ pkg }: { pkg: PackageDetails }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="r53-drone-package">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold flex items-center gap-1.5">
          <Box className="h-3.5 w-3.5 text-violet-500" />
          Detalhes do Pacote
        </h4>
        <Badge className="text-[9px] font-mono bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-0 font-semibold r53-drone-pkg-tracking">
          {pkg.trackingNumber}
        </Badge>
      </div>

      <motion.div
        className="rounded-xl border border-violet-200/40 dark:border-violet-800/30 overflow-hidden"
        style={{ backgroundColor: 'rgba(139,92,246,0.03)' }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
      >
        {/* Store header */}
        <div className="flex items-center gap-3 p-3 border-b border-violet-200/20 dark:border-violet-800/20 r53-drone-pkg-header">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(139,92,246,0.1)' }}>
            {pkg.storeIcon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate r53-drone-pkg-store">{pkg.storeName}</p>
            <p className="text-[10px] text-muted-foreground r53-drone-pkg-trk">Rastreamento: {pkg.trackingNumber}</p>
          </div>
          <motion.div
            whileTap={{ scale: 0.92 }}
            onClick={() => setExpanded(!expanded)}
            className="h-7 w-7 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: 'rgba(139,92,246,0.08)' }}
          >
            <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="h-3.5 w-3.5 text-violet-500" />
            </motion.div>
          </motion.div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-2 gap-2 p-3 r53-drone-pkg-specs">
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(139,92,246,0.04)' }}>
            <Weight className="h-3 w-3 text-violet-400" />
            <div>
              <p className="text-[9px] text-muted-foreground">Peso</p>
              <p className="text-[10px] font-bold">{pkg.weight}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(139,92,246,0.04)' }}>
            <Box className="h-3 w-3 text-violet-400" />
            <div>
              <p className="text-[9px] text-muted-foreground">Dimensões</p>
              <p className="text-[10px] font-bold">{pkg.dimensions}</p>
            </div>
          </div>
        </div>

        {/* Contents preview */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 border-t border-violet-200/20 dark:border-violet-800/20 pt-2 r53-drone-pkg-contents">
                <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Conteúdo do pacote</p>
                <div className="flex flex-wrap gap-1.5">
                  {pkg.contents.map((item) => (
                    <span
                      key={item}
                      className="text-[9px] font-medium px-2 py-1 rounded-md r53-drone-pkg-item"
                      style={{ backgroundColor: 'rgba(139,92,246,0.08)', color: '#7c3aed' }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

/* ─── Track Live Button with Pulse Ring ─── */

function TrackLiveButton({ isTracking, onClick }: { isTracking: boolean; onClick: () => void }) {
  return (
    <div className="relative r53-drone-track-btn-wrapper">
      {/* Pulse rings */}
      {isTracking && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full r53-drone-pulse-ring-1"
            style={{ border: '2px solid rgba(139,92,246,0.4)' }}
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' as const }}
          />
          <motion.div
            className="absolute inset-0 rounded-full r53-drone-pulse-ring-2"
            style={{ border: '1.5px solid rgba(139,92,246,0.25)' }}
            animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' as const, delay: 0.3 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full r53-drone-pulse-ring-3"
            style={{ border: '1px solid rgba(139,92,246,0.15)' }}
            animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' as const, delay: 0.6 }}
          />
        </>
      )}

      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Button
          onClick={onClick}
          className="r53-drone-track-btn relative h-11 w-full rounded-xl font-bold text-sm transition-all"
          style={{
            background: isTracking
              ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
              : 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
            boxShadow: isTracking
              ? '0 4px 20px rgba(139,92,246,0.4)'
              : '0 2px 12px rgba(139,92,246,0.2)',
            color: '#ffffff',
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isTracking ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' as const }}
                >
                  <Radio className="h-4 w-4" />
                </motion.div>
                Rastreamento Ativo
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Rastrear ao Vivo
              </>
            )}
          </span>
        </Button>
      </motion.div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Main Component: DroneDeliveryTracker
   ══════════════════════════════════════════════════════ */

export function DroneDeliveryTracker() {
  const [droneState, setDroneState] = useState<DroneState>({
    progress: 0,
    altitude: 0,
    speed: 0,
    battery: 92,
    phase: 'picked_up',
    etaSeconds: INITIAL_ETA_SECONDS,
  })
  const [isTracking, setIsTracking] = useState(true)
  const [weather, setWeather] = useState<WeatherState>(INITIAL_WEATHER)
  const [mapHoverPoint, setMapHoverPoint] = useState<{ x: number; y: number } | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef(0)

  // Simulate real-time position updates
  useEffect(() => {
    if (!isTracking) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setDroneState((prev) => {
        if (prev.progress >= 100) return prev

        const increment = 0.15 + Math.random() * 0.1
        const newProgress = Math.min(prev.progress + increment, 100)
        const newPhase = getPhaseFromProgress(newProgress)

        return {
          progress: newProgress,
          altitude: getAltitudeFromProgress(newProgress),
          speed: getSpeedFromProgress(newProgress),
          battery: getBatteryFromProgress(newProgress),
          phase: newPhase,
          etaSeconds: Math.max(0, INITIAL_ETA_SECONDS * (1 - newProgress / 100)),
        }
      })
      tickRef.current += 1
    }, 200)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isTracking])

  // Simulate weather changes
  useEffect(() => {
    const weatherInterval = setInterval(() => {
      setWeather((prev) => ({
        ...prev,
        windSpeed: Math.max(5, Math.min(25, prev.windSpeed + (Math.random() - 0.5) * 2)),
        windDirection: (prev.windDirection + (Math.random() - 0.5) * 10 + 360) % 360,
        temperature: Math.max(20, Math.min(35, prev.temperature + (Math.random() - 0.5) * 0.5)),
        visibility: Math.max(5, Math.min(10, prev.visibility + (Math.random() - 0.5) * 0.3)),
      }))
    }, 5000)

    return () => clearInterval(weatherInterval)
  }, [])

  // ETA countdown
  useEffect(() => {
    if (!isTracking || droneState.progress >= 100) return

    const etaInterval = setInterval(() => {
      setDroneState((prev) => {
        if (prev.etaSeconds <= 0) return prev
        return { ...prev, etaSeconds: prev.etaSeconds - 1 }
      })
    }, 1000)

    return () => clearInterval(etaInterval)
  }, [isTracking, droneState.progress])

  const smoothAltitude = useSmoothValue(droneState.altitude)
  const smoothSpeed = useSmoothValue(droneState.speed)

  const handleTrackToggle = useCallback(() => {
    setIsTracking((prev) => !prev)
  }, [])

  const handlePhaseClick = useCallback((phase: DeliveryPhase) => {
    // Allow jumping to different phases for demo purposes
    const phaseProgressMap: Record<DeliveryPhase, number> = {
      picked_up: 2,
      in_flight: 40,
      descending: 90,
      delivered: 100,
    }
    setDroneState((prev) => {
      const newProgress = phaseProgressMap[phase]
      return {
        ...prev,
        progress: newProgress,
        altitude: getAltitudeFromProgress(newProgress),
        speed: getSpeedFromProgress(newProgress),
        battery: getBatteryFromProgress(newProgress),
        phase,
        etaSeconds: Math.max(0, INITIAL_ETA_SECONDS * (1 - newProgress / 100)),
      }
    })
  }, [])

  // Calculate drone position on SVG path
  const dronePathPoint = useMemo(() => {
    // Approximate position along the cubic bezier path
    const t = droneState.progress / 100
    const pathEl = typeof document !== 'undefined' ? document.querySelector('.r53-drone-route-path-el') as SVGPathElement : null

    if (pathEl) {
      try {
        const totalLength = pathEl.getTotalLength()
        const point = pathEl.getPointAtLength(t * totalLength)
        return { x: point.x, y: point.y }
      } catch {
        // Fallback
      }
    }

    // Fallback interpolation
    return {
      x: lerp(50, 420, t),
      y: lerp(320, 50, t) - Math.sin(t * Math.PI) * 40,
    }
  }, [droneState.progress])

  const progressPercent = Math.round(droneState.progress)

  return (
    <section className="r53-drone-tracker space-y-4">
      {/* ─── Header with Gradient ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
        className="relative overflow-hidden rounded-2xl p-5 text-white r53-drone-header"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9, #5b21b6)',
          boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
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
            <Plane className="h-6 w-6" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold">Rastreador de Drone</h2>
            <p className="text-sm text-white/70 mt-0.5">Entrega aérea autônoma em tempo real</p>
          </div>
        </div>

        {/* Live indicator */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10 mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs r53-drone-live-badge"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          {isTracking ? 'Transmissão ao vivo' : 'Transmissão pausada'}
        </motion.div>
      </motion.div>

      {/* ─── Animated Map with Drone ─── */}
      <Card className="border-border/60 overflow-hidden r53-drone-map-card" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-semibold">Mapa de Rota Aérea</span>
            </div>
            <span className="text-[10px] text-violet-600 dark:text-violet-400 flex items-center gap-1 font-medium r53-drone-map-status">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-violet-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {droneState.phase === 'delivered' ? 'Entregue' : 'Em rota'}
            </span>
          </div>

          <div
            className="relative rounded-xl overflow-hidden r53-drone-map-container"
            style={{ backgroundColor: 'rgba(139,92,246,0.04)' }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setMapHoverPoint({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              })
            }}
            onMouseLeave={() => setMapHoverPoint(null)}
          >
            <svg viewBox="0 0 480 370" className="w-full r53-drone-map-svg" role="img" aria-label="Mapa de rota do drone">
              <defs>
                <linearGradient id="r53-routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
                <linearGradient id="r53-trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <filter id="r53-droneGlow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid lines */}
              {[...Array(8)].map((_, i) => (
                <line
                  key={`gh-${i}`}
                  x1={0}
                  y1={50 * (i + 1)}
                  x2={480}
                  y2={50 * (i + 1)}
                  stroke="rgba(148,163,184,0.08)"
                  strokeWidth={1}
                />
              ))}
              {[...Array(10)].map((_, i) => (
                <line
                  key={`gv-${i}`}
                  x1={48 * (i + 1)}
                  y1={0}
                  x2={48 * (i + 1)}
                  y2={370}
                  stroke="rgba(148,163,184,0.08)"
                  strokeWidth={1}
                />
              ))}

              {/* Terrain features */}
              <rect x="150" y="200" width="60" height="40" rx="4" fill="rgba(34,197,94,0.06)" />
              <rect x="350" y="120" width="80" height="50" rx="4" fill="rgba(34,197,94,0.05)" />
              <rect x="60" y="260" width="45" height="35" rx="4" fill="rgba(34,197,94,0.07)" />

              {/* Roads */}
              <line x1="0" y1="200" x2="480" y2="200" stroke="rgba(148,163,184,0.1)" strokeWidth="2" strokeDasharray="10 5" />
              <line x1="240" y1="0" x2="240" y2="370" stroke="rgba(148,163,184,0.1)" strokeWidth="2" strokeDasharray="10 5" />
              <line x1="0" y1="100" x2="480" y2="280" stroke="rgba(148,163,184,0.06)" strokeWidth="1" strokeDasharray="6 6" />

              {/* No-fly zones */}
              {NO_FLY_ZONES.map((zone) => (
                <NoFlyZoneMarker key={zone.id} zone={zone} />
              ))}

              {/* Route path (background) */}
              <path
                d={ROUTE_PATH}
                fill="none"
                stroke="rgba(148,163,184,0.2)"
                strokeWidth={3}
                strokeDasharray="8 6"
                strokeLinecap="round"
              />

              {/* Route path (traveled) */}
              <motion.path
                d={ROUTE_PATH}
                fill="none"
                stroke="url(#r53-trailGrad)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={`${progressPercent * 5} 1000`}
                className="r53-drone-route-traveled"
                transition={{ duration: 0.5 }}
              />

              {/* Full route path (hidden, for getPointAtLength) */}
              <path d={ROUTE_PATH} fill="none" stroke="transparent" className="r53-drone-route-path-el" />

              {/* Origin pin */}
              <g>
                <motion.circle
                  cx={50} cy={320}
                  r={10}
                  fill="#8b5cf6"
                  opacity={0.2}
                  animate={{ r: [10, 16, 10], opacity: [0.2, 0.05, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                />
                <circle cx={50} cy={320} r={6} fill="#8b5cf6" />
                <circle cx={50} cy={320} r={2.5} fill="#ffffff" />
                <text x={50} y={345} textAnchor="middle" fontSize="9" fill="#7c3aed" fontWeight="600" className="r53-drone-origin-label">
                  Centro Dist.
                </text>
              </g>

              {/* Destination pin */}
              <g>
                <motion.circle
                  cx={420} cy={50}
                  r={12}
                  fill="#22c55e"
                  opacity={0.15}
                  animate={{ r: [12, 20, 12], opacity: [0.15, 0.03, 0.15] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
                />
                <circle cx={420} cy={50} r={7} fill="#22c55e" />
                <circle cx={420} cy={50} r={3} fill="#ffffff" />
                <text x={420} y={38} textAnchor="middle" fontSize="9" fill="#16a34a" fontWeight="600" className="r53-drone-dest-label">
                  Destino
                </text>
              </g>

              {/* Drone marker */}
              <motion.g
                filter="url(#r53-droneGlow)"
                animate={{
                  x: dronePathPoint.x,
                  y: dronePathPoint.y,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' as const }}
              >
                {/* Shadow on ground */}
                <ellipse
                  cx={0}
                  cy={20}
                  rx={12}
                  ry={4}
                  fill="rgba(0,0,0,0.1)"
                />
                {/* Pulse ring */}
                <motion.circle
                  cx={0} cy={0}
                  r={16}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  opacity={0.4}
                  animate={{ r: [16, 28], opacity: [0.4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' as const }}
                />
                {/* Drone body */}
                <circle cx={0} cy={0} r={10} fill="#8b5cf6" />
                <circle cx={0} cy={0} r={6} fill="#a78bfa" />
                <DroneIcon size={14} propellerSpeed={droneState.speed > 0 ? 1 : 0.3} />
              </motion.g>

              {/* Mouse hover crosshair */}
              {mapHoverPoint && (
                <g opacity={0.3}>
                  <line x1={0} y1={mapHoverPoint.y * 3.7} x2={480} y2={mapHoverPoint.y * 3.7} stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1={mapHoverPoint.x * 4.8} y1={0} x2={mapHoverPoint.x * 4.8} y2={370} stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="4 4" />
                </g>
              )}
            </svg>

            {/* Coordinates overlay */}
            {mapHoverPoint && (
              <motion.div
                className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 text-[8px] text-white font-mono r53-drone-coords"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {(mapHoverPoint.x * 0.048 - 23.55).toFixed(4)}°, {(mapHoverPoint.y * 0.037 - 46.63).toFixed(4)}°
              </motion.div>
            )}

            {/* NFZ legend */}
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5 text-[8px] font-medium r53-drone-map-legend">
                <div className="h-2 w-2 rounded-full border border-red-400/50 bg-red-100 dark:bg-red-900/30" />
                Zona Restrita
              </div>
              <div className="flex items-center gap-1 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5 text-[8px] font-medium r53-drone-map-legend-dest">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                Destino
              </div>
            </div>
          </div>

          {/* Delivery Progress Bar with Gradient Fill */}
          <div className="mt-3 r53-drone-progress-section">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Progresso da entrega
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 r53-drone-progress-pct">
                  {progressPercent}%
                </span>
                <motion.span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full r53-drone-eta-countdown"
                  style={{
                    backgroundColor: droneState.etaSeconds < 60 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                    color: droneState.etaSeconds < 60 ? '#ef4444' : '#22c55e',
                  }}
                  animate={droneState.etaSeconds < 60 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ETA: {formatTime(droneState.etaSeconds)}
                </motion.span>
              </div>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden r53-drone-progress-track">
              <motion.div
                className="h-full rounded-full r53-drone-progress-fill"
                style={{
                  background: 'linear-gradient(90deg, #8b5cf6, #7c3aed, #6d28d9)',
                }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' as const }}
              />
              {/* Shimmer effect */}
              <motion.div
                className="absolute top-0 bottom-0 r53-drone-progress-shimmer"
                style={{ width: '30%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
                animate={{ left: ['-30%', '130%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Gauges Row ─── */}
      <div className="grid grid-cols-3 gap-3 r53-drone-gauges-row">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' as const, stiffness: 260, damping: 22 }}
          className="rounded-xl p-3 text-center border border-violet-200/30 dark:border-violet-800/20"
          style={{ backgroundColor: 'rgba(139,92,246,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <GaugeIndicator
            label="Altitude"
            value={smoothAltitude}
            unit="m"
            maxVal={130}
            color="#0ea5e9"
            icon={<ArrowUp className="h-3 w-3" />}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' as const, stiffness: 260, damping: 22 }}
          className="rounded-xl p-3 text-center border border-violet-200/30 dark:border-violet-800/20"
          style={{ backgroundColor: 'rgba(139,92,246,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <GaugeIndicator
            label="Velocidade"
            value={smoothSpeed}
            unit="km/h"
            maxVal={60}
            color="#f59e0b"
            icon={<Gauge className="h-3 w-3" />}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' as const, stiffness: 260, damping: 22 }}
          className="rounded-xl p-3 text-center border border-violet-200/30 dark:border-violet-800/20"
          style={{ backgroundColor: 'rgba(139,92,246,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <GaugeIndicator
            label="Progresso"
            value={droneState.progress}
            unit="%"
            maxVal={100}
            color="#8b5cf6"
            icon={<Navigation className="h-3 w-3" />}
          />
        </motion.div>
      </div>

      {/* ─── Battery Level Indicator ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, type: 'spring' as const, stiffness: 260, damping: 22 }}
      >
        <BatteryIndicator level={droneState.battery} />
      </motion.div>

      {/* ─── Camera Feed Simulation ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring' as const, stiffness: 260, damping: 22 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5 text-violet-500" />
            Câmera do Drone
          </h4>
          <Badge className="text-[8px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 font-semibold r53-drone-cam-badge">
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 mr-1"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            LIVE
          </Badge>
        </div>
        <CameraFeed progress={droneState.progress} altitude={droneState.altitude} />
      </motion.div>

      {/* ─── Weather Conditions Overlay ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, type: 'spring' as const, stiffness: 260, damping: 22 }}
      >
        <WeatherOverlay weather={weather} />
      </motion.div>

      {/* ─── Package Details Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring' as const, stiffness: 260, damping: 22 }}
      >
        <PackageDetailsCard pkg={PACKAGE_DATA} />
      </motion.div>

      {/* ─── Delivery Timeline ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, type: 'spring' as const, stiffness: 260, damping: 22 }}
      >
        <DeliveryTimeline currentPhase={droneState.phase} onPhaseClick={handlePhaseClick} />
      </motion.div>

      {/* ─── Quick Stats ─── */}
      <div className="grid grid-cols-2 gap-3 r53-drone-stats-row">
        {[
          { label: 'Distância percorrida', value: `${(droneState.progress * 0.42).toFixed(1)} km`, icon: <MapPin className="h-3.5 w-3.5" />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
          { label: 'Tempo de voo', value: formatTime(Math.round(INITIAL_ETA_SECONDS * droneState.progress / 100)), icon: <Clock className="h-3.5 w-3.5" />, color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
          { label: 'Eficiência', value: `${Math.min(98, 85 + droneState.progress * 0.13).toFixed(0)}%`, icon: <Zap className="h-3.5 w-3.5" />, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Entregas hoje', value: '24', icon: <Package className="h-3.5 w-3.5" />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6 + idx * 0.08, type: 'spring' as const, stiffness: 260, damping: 22 }}
            className="rounded-xl p-3 flex items-center gap-2.5 border border-border/40 r53-drone-stat-card"
            style={{ backgroundColor: stat.bg, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-lg shrink-0" style={{ backgroundColor: stat.bg }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold r53-drone-stat-value" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[9px] text-muted-foreground r53-drone-stat-label">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Track Live Button with Pulse Ring ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: 'spring' as const, stiffness: 260, damping: 22 }}
      >
        <TrackLiveButton isTracking={isTracking} onClick={handleTrackToggle} />
      </motion.div>

      {/* ─── Delivery Completed Celebration ─── */}
      <AnimatePresence>
        {droneState.phase === 'delivered' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
            className="relative overflow-hidden rounded-2xl p-5 text-center r53-drone-delivered-banner"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              boxShadow: '0 8px 32px rgba(34,197,94,0.3)',
            }}
          >
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />

            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              <CheckCircle className="h-10 w-10 text-white mx-auto mb-2" />
            </motion.div>
            <h3 className="text-lg font-bold text-white">Entrega Concluída!</h3>
            <p className="text-sm text-white/75 mt-1">Seu pacote foi entregue com sucesso pelo drone</p>

            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{INITIAL_ETA_SECONDS / 60} min</p>
                <p className="text-[9px] text-white/60">Tempo total</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <p className="text-lg font-bold text-white">5.8 km</p>
                <p className="text-[9px] text-white/60">Distância</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <p className="text-lg font-bold text-white">{Math.round(droneState.battery)}%</p>
                <p className="text-[9px] text-white/60">Bateria restante</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
