'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  MapPin,
  ChevronDown,
  Leaf,
  Sprout,
  Factory,
  Truck,
  Warehouse,
  Home,
  Thermometer,
  ShieldCheck,
  Award,
  Star,
  ExternalLink,
  CheckCircle2,
  Handshake,
  CloudSun,
} from 'lucide-react'

/* ── Mock supply chain data ── */

const supplyChainSteps = [
  {
    id: 'producao',
    label: 'Produção',
    icon: Sprout,
    date: '15 Jan 2025',
    location: 'Fazenda São Francisco, Pará',
    status: 'completed' as const,
    details: 'Colheita e seleção manual dos produtos',
  },
  {
    id: 'processamento',
    label: 'Processamento',
    icon: Factory,
    date: '17 Jan 2025',
    location: 'Agroindústria Belém, PA',
    status: 'completed' as const,
    details: 'Beneficiamento e controle de qualidade',
    qualityBadge: true,
  },
  {
    id: 'transporte',
    label: 'Transporte',
    icon: Truck,
    date: '18 Jan 2025',
    location: 'Rod. PA-150 → Dom Eliseu',
    status: 'completed' as const,
    details: 'Transporte refrigerado 847 km',
    carrier: 'TransFrio Express',
    duration: '14h',
    distance: '847 km',
  },
  {
    id: 'armazenamento',
    label: 'Armazenamento',
    icon: Warehouse,
    date: '19 Jan 2025',
    location: 'Armazém Central, Dom Eliseu',
    status: 'completed' as const,
    details: 'Armazenamento em câmara fria',
    tempBadge: true,
  },
  {
    id: 'entrega',
    label: 'Entrega',
    icon: Home,
    date: '20 Jan 2025',
    location: 'Residência do cliente',
    status: 'active' as const,
    details: 'Entrega prevista para hoje',
    eta: 'Hoje, 14:00 – 18:00',
  },
]

const ecoBadges = [
  { id: 'organico', label: 'Orgânico', icon: Leaf, verified: true, description: 'Certificação orgânica IBD' },
  { id: 'comercio_justo', label: 'Comércio Justo', icon: Handshake, verified: true, description: 'Comércio justo FLO-CERT' },
  { id: 'baixa_pegada', label: 'Baixa Pegada', icon: CloudSun, verified: true, description: '2.4 kg CO₂e na jornada' },
  { id: 'local', label: 'Local', icon: MapPin, verified: true, description: 'Produzido no Pará' },
]

const certifications = [
  { id: 'sif', label: 'SIF', fullLabel: 'Serviço de Inspeção Federal', code: 'SIF 4231' },
  { id: 'inmetro', label: 'INMETRO', fullLabel: 'Instituto Nacional de Metrologia', code: 'Cert. 9876' },
  { id: 'haccp', label: 'HACCP', fullLabel: 'Análise de Perigos e Ponto Crítico', code: 'HACCP-2024' },
]

const producerInfo = {
  name: 'Seu José Ribeiro',
  avatar: '🧑‍🌾',
  city: 'Dom Eliseu',
  state: 'PA',
  sinceYear: 2018,
  rating: 4.8,
  totalReviews: 127,
  productsCount: 12,
}

const routeWaypoints = [
  { x: 62, y: 30, label: 'Fazenda' },
  { x: 55, y: 38, label: 'PA-150' },
  { x: 48, y: 48, label: 'Belém' },
  { x: 42, y: 58, label: 'PA-279' },
  { x: 38, y: 66, label: 'Destino' },
]

const temperatureLog = [
  { hour: '00h', temp: 4.2 },
  { hour: '02h', temp: 3.8 },
  { hour: '04h', temp: 4.0 },
  { hour: '06h', temp: 5.1 },
  { hour: '08h', temp: 5.8 },
  { hour: '10h', temp: 4.5 },
  { hour: '12h', temp: 3.2 },
  { hour: '14h', temp: 2.8 },
  { hour: '16h', temp: 3.5 },
  { hour: '18h', temp: 4.8 },
]

const TEMP_MIN = 2
const TEMP_MAX = 8
const CHART_HEIGHT = 80
const CHART_WIDTH = 260
const CHART_PADDING = 24

function tempToY(temp: number): number {
  const clamped = Math.max(TEMP_MIN, Math.min(TEMP_MAX, temp))
  const range = TEMP_MAX - TEMP_MIN
  const ratio = 1 - (clamped - TEMP_MIN) / range
  return CHART_PADDING + ratio * (CHART_HEIGHT - CHART_PADDING * 2)
}

function getTempColor(temp: number): string {
  if (temp >= TEMP_MIN && temp <= TEMP_MAX) return 'rgba(16,185,129,1)'
  if (temp < TEMP_MIN - 2 || temp > TEMP_MAX + 2) return 'rgba(239,68,68,1)'
  return 'rgba(245,158,11,1)'
}

function getStepStatusColor(status: 'completed' | 'active' | 'pending'): string {
  if (status === 'completed') return 'rgba(16,185,129,1)'
  if (status === 'active') return 'rgba(59,130,246,1)'
  return 'rgba(148,163,184,1)'
}

function getStepStatusTailwind(status: 'completed' | 'active' | 'pending'): string {
  if (status === 'completed') return 'text-emerald-600 dark:text-emerald-400'
  if (status === 'active') return 'text-blue-600 dark:text-blue-400'
  return 'text-slate-400 dark:text-slate-500'
}

function getStepStatusBg(status: 'completed' | 'active' | 'pending'): string {
  if (status === 'completed') return 'bg-emerald-100 dark:bg-emerald-900/30'
  if (status === 'active') return 'bg-blue-100 dark:bg-blue-900/30'
  return 'bg-slate-100 dark:bg-slate-800/30'
}

/* ── Sub-components ── */

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const iconClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${iconClass} ${
            star <= Math.floor(rating)
              ? 'text-amber-400 fill-amber-400'
              : star - 0.5 <= rating
                ? 'text-amber-400 fill-amber-400/50'
                : 'text-slate-300 dark:text-slate-600'
          }`}
        />
      ))}
    </div>
  )
}

function BrazilRouteMap({ isVisible }: { isVisible: boolean }) {
  const routePath = 'M62 30 Q55 35 52 40 Q48 48 42 58 Q40 62 38 66'
  const waypoints = routeWaypoints

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/30 dark:border-emerald-800/20">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(16,185,129,1) 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      />

      <svg viewBox="0 0 100 85" className="w-full h-auto" fill="none">
        {/* Brazil outline simplified */}
        <path
          d="M60 8 C75 5 100 15 108 30 C115 45 110 65 100 80 C90 95 75 110 60 118 C45 110 25 100 18 85 C10 70 8 50 15 35 C22 20 45 10 60 8Z"
          fill="rgba(16,185,129,0.06)"
          stroke="rgba(16,185,129,0.2)"
          strokeWidth="0.6"
        />
        {/* Pará state highlighted */}
        <path
          d="M48 10 C55 8 68 12 78 20 C85 26 92 35 88 42 C84 48 70 46 60 50 C52 52 42 46 38 38 C34 30 40 14 48 10Z"
          fill="rgba(16,185,129,0.15)"
          stroke="rgba(16,185,129,0.4)"
          strokeWidth="0.6"
        />
        {/* Pará label */}
        <text x="60" y="22" textAnchor="middle" fill="rgba(16,185,129,0.6)" fontSize="3" fontWeight="bold" className="select-none">
          PARÁ
        </text>

        {/* Static route path (background) */}
        <path
          d={routePath}
          stroke="rgba(16,185,129,0.12)"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
        />

        {/* Animated route path */}
        <motion.path
          d={routePath}
          stroke="rgba(16,185,129,1)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ strokeDasharray: '300', strokeDashoffset: 300 }}
          animate={isVisible ? { strokeDashoffset: 0 } : {}}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />

        {/* Waypoint dots */}
        {waypoints.map((wp, idx) => (
          <motion.g key={wp.label}>
            <motion.circle
              cx={wp.x}
              cy={wp.y}
              r={idx === 0 || idx === waypoints.length - 1 ? 2.5 : 1.5}
              fill={idx === 0 || idx === waypoints.length - 1 ? 'rgba(16,185,129,1)' : 'rgba(16,185,129,0.7)'}
              initial={{ scale: 0, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : {}}
              transition={{
                delay: 0.5 + idx * 0.4,
                type: 'spring' as const,
                stiffness: 400,
                damping: 20,
              }}
              className="r37-route-dot"
            />
            {/* Animated dot traveling the route */}
            {idx < waypoints.length - 1 && (
              <motion.circle
                r="1"
                fill="rgba(16,185,129,1)"
                initial={{ cx: wp.x, cy: wp.y, opacity: 0 }}
                animate={
                  isVisible
                    ? {
                        cx: [wp.x, waypoints[idx + 1].x],
                        cy: [wp.y, waypoints[idx + 1].y],
                        opacity: [0, 1, 1, 0],
                      }
                    : {}
                }
                transition={{
                  delay: 1 + idx * 0.5,
                  duration: 1.2,
                  ease: 'easeInOut',
                }}
                className="r37-route-animated"
              />
            )}
          </motion.g>
        ))}

        {/* Origin pin */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={isVisible ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.3, type: 'spring' as const, stiffness: 300, damping: 20 }}
        >
          <text x={waypoints[0].x} y={waypoints[0].y - 5} textAnchor="middle" fontSize="6" className="select-none">
            🌱
          </text>
        </motion.g>

        {/* Destination pin */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={isVisible ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 2.5, type: 'spring' as const, stiffness: 300, damping: 20 }}
        >
          <text
            x={waypoints[waypoints.length - 1].x}
            y={waypoints[waypoints.length - 1].y - 5}
            textAnchor="middle"
            fontSize="6"
            className="select-none"
          >
            🏠
          </text>
        </motion.g>

        {/* Dom Eliseu label */}
        <motion.text
          x={waypoints[waypoints.length - 1].x + 5}
          y={waypoints[waypoints.length - 1].y + 3}
          fill="rgba(16,185,129,1)"
          fontSize="2.5"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 2.8 }}
          className="select-none"
        >
          Dom Eliseu
        </motion.text>

        {/* Origin label */}
        <motion.text
          x={waypoints[0].x - 6}
          y={waypoints[0].y + 4}
          fill="rgba(16,185,129,0.8)"
          fontSize="2.5"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="select-none"
        >
          Fazenda
        </motion.text>
      </svg>

      {/* Distance badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 8 }}
        animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ delay: 3, type: 'spring' as const, stiffness: 350, damping: 22 }}
        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-emerald-200/40 dark:border-emerald-700/30 shadow-sm"
      >
        <Globe className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">847 km percorridos</span>
      </motion.div>
    </div>
  )
}

function SupplyChainTimeline({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="relative pl-7">
      {/* Animated timeline line */}
      <svg className="absolute left-[11px] top-2 bottom-2 w-1 h-full" preserveAspectRatio="none" viewBox="0 0 4 200">
        <defs>
          <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(16,185,129,1)" />
            <stop offset="60%" stopColor="rgba(16,185,129,0.6)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.4)" />
          </linearGradient>
        </defs>
        <motion.line
          x1="2"
          y1="0"
          x2="2"
          y2="200"
          stroke="url(#timelineGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isVisible ? { pathLength: 1 } : {}}
          transition={{ duration: 2, ease: 'easeInOut', delay: 0.5 }}
          className="r37-timeline-line"
        />
      </svg>

      {supplyChainSteps.map((step, idx) => {
        const Icon = step.icon
        const statusColor = getStepStatusColor(step.status)
        const statusTailwind = getStepStatusTailwind(step.status)
        const statusBg = getStepStatusBg(step.status)

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -16 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{
              delay: 0.8 + idx * 0.2,
              type: 'spring' as const,
              stiffness: 280,
              damping: 24,
            }}
            className="relative pb-5 last:pb-0 r37-timeline-step"
          >
            {/* Timeline node */}
            <motion.div
              className="absolute left-[-20px] top-0.5"
              initial={{ scale: 0 }}
              animate={isVisible ? { scale: 1 } : {}}
              transition={{
                delay: 0.8 + idx * 0.2,
                type: 'spring' as const,
                stiffness: 400,
                damping: 18,
              }}
            >
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 ${statusBg}`}
                style={{ boxShadow: '0 0 0 3px ' + statusColor.replace(',1)', ',0.2)') }}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                ) : step.status === 'active' ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </motion.div>
                ) : (
                  <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                )}
              </div>
            </motion.div>

            {/* Step content */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-700/30">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${statusBg}`}>
                <Icon className={`h-4 w-4 ${statusTailwind}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-bold ${statusTailwind}`}>
                    {step.label}
                  </span>
                  {/* Quality badge for processing */}
                  {step.qualityBadge && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 1.4, type: 'spring' as const, stiffness: 350, damping: 20 }}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    >
                      <ShieldCheck className="h-2.5 w-2.5" />
                      QC OK
                    </motion.span>
                  )}
                  {/* Temperature badge for storage */}
                  {step.tempBadge && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 1.8, type: 'spring' as const, stiffness: 350, damping: 20 }}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                    >
                      <Thermometer className="h-2.5 w-2.5" />
                      2-8°C
                    </motion.span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">{step.details}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                  <span>{step.date}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>{step.location}</span>
                </div>
                {/* Transport details */}
                {step.carrier && (
                  <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                    <span className="text-muted-foreground">
                      🚚 {step.carrier}
                    </span>
                    <span className="text-muted-foreground">
                      📏 {step.distance}
                    </span>
                    <span className="text-muted-foreground">
                      ⏱️ {step.duration}
                    </span>
                  </div>
                )}
                {/* ETA for delivery */}
                {step.eta && (
                  <motion.p
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-1"
                  >
                    ⏰ {step.eta}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function EcoBadgeCard({ badge, isVisible, delay }: { badge: typeof ecoBadges[number]; isVisible: boolean; delay: number }) {
  const Icon = badge.icon
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ delay, type: 'spring' as const, stiffness: 320, damping: 22 }}
      whileHover={{ scale: 1.04, boxShadow: '0 4px 16px rgba(16,185,129,0.15)' }}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors cursor-default ${
        badge.verified
          ? 'r37-eco-badge r37-eco-badge-verified bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/40 dark:border-emerald-800/30'
          : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200/40 dark:border-slate-700/30'
      }`}
    >
      {badge.verified && (
        <motion.div
          className="absolute -top-1.5 -right-1.5"
          initial={{ scale: 0 }}
          animate={isVisible ? { scale: 1 } : {}}
          transition={{ delay: delay + 0.3, type: 'spring' as const, stiffness: 400, damping: 18 }}
        >
          <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-3 w-3 text-white" />
          </div>
        </motion.div>
      )}
      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <span className="text-[10px] font-bold text-center leading-tight">{badge.label}</span>
      <span className="text-[8px] text-muted-foreground text-center leading-tight">{badge.description}</span>
    </motion.div>
  )
}

function CertificationStamp({ cert, isVisible, delay }: { cert: typeof certifications[number]; isVisible: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -15, scale: 0.5 }}
      animate={isVisible ? { opacity: 1, rotate: 0, scale: 1 } : {}}
      transition={{ delay, type: 'spring' as const, stiffness: 250, damping: 18 }}
      whileHover={{ rotate: 2, scale: 1.08 }}
      className="r37-cert-stamp relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-dashed border-amber-300/60 dark:border-amber-700/40 bg-amber-50/60 dark:bg-amber-950/15"
    >
      <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 tracking-wider">{cert.label}</span>
      <span className="text-[8px] text-muted-foreground text-center leading-tight">{cert.fullLabel}</span>
      <span className="text-[8px] font-mono text-amber-600/70 dark:text-amber-400/60">{cert.code}</span>
    </motion.div>
  )
}

function TemperatureChart({ isVisible }: { isVisible: boolean }) {
  const points = temperatureLog.map((entry, idx) => {
    const x = (idx / (temperatureLog.length - 1)) * (CHART_WIDTH - CHART_PADDING * 2) + CHART_PADDING
    const y = tempToY(entry.temp)
    return { ...entry, x, y, color: getTempColor(entry.temp) }
  })

  const pathD = points
    .map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`))
    .join(' ')

  const areaD = `${pathD} L${points[points.length - 1].x} ${CHART_HEIGHT - CHART_PADDING} L${points[0].x} ${CHART_HEIGHT - CHART_PADDING} Z`

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-700/30 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Thermometer className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
          Log de Temperatura — Transporte
        </span>
      </div>

      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full h-auto r37-temp-chart">
        {/* Safe zone (green background) */}
        <rect
          x={CHART_PADDING}
          y={tempToY(TEMP_MAX)}
          width={CHART_WIDTH - CHART_PADDING * 2}
          height={tempToY(TEMP_MIN) - tempToY(TEMP_MAX)}
          fill="rgba(16,185,129,0.08)"
          rx="3"
        />
        {/* Alert zone lines */}
        <line
          x1={CHART_PADDING}
          y1={tempToY(TEMP_MIN)}
          x2={CHART_WIDTH - CHART_PADDING}
          y2={tempToY(TEMP_MIN)}
          stroke="rgba(59,130,246,0.25)"
          strokeWidth="0.5"
          strokeDasharray="3 2"
        />
        <line
          x1={CHART_PADDING}
          y1={tempToY(TEMP_MAX)}
          x2={CHART_WIDTH - CHART_PADDING}
          y2={tempToY(TEMP_MAX)}
          stroke="rgba(239,68,68,0.25)"
          strokeWidth="0.5"
          strokeDasharray="3 2"
        />

        {/* Zone labels */}
        <text x={CHART_PADDING + 2} y={tempToY(TEMP_MIN) - 2} fill="rgba(59,130,246,0.6)" fontSize="4" className="select-none">
          {TEMP_MIN}°C min
        </text>
        <text x={CHART_PADDING + 2} y={tempToY(TEMP_MAX) + 6} fill="rgba(239,68,68,0.6)" fontSize="4" className="select-none">
          {TEMP_MAX}°C max
        </text>

        {/* Area fill */}
        <motion.path
          d={areaD}
          fill="rgba(16,185,129,0.1)"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        {/* Temperature line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="rgba(16,185,129,1)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={isVisible ? { pathLength: 1 } : {}}
          transition={{ duration: 2, ease: 'easeInOut', delay: 0.3 }}
        />

        {/* Data points */}
        {points.map((p, idx) => (
          <motion.circle
            key={p.hour}
            cx={p.x}
            cy={p.y}
            r="2"
            fill={p.color}
            stroke="white"
            strokeWidth="1"
            initial={{ scale: 0 }}
            animate={isVisible ? { scale: 1 } : {}}
            transition={{
              delay: 0.5 + idx * 0.15,
              type: 'spring' as const,
              stiffness: 400,
              damping: 20,
            }}
          />
        ))}

        {/* Hour labels */}
        {points.map((p) => (
          <text
            key={`lbl-${p.hour}`}
            x={p.x}
            y={CHART_HEIGHT - 4}
            textAnchor="middle"
            fill="rgba(148,163,184,0.8)"
            fontSize="3.5"
            className="select-none"
          >
            {p.hour}
          </text>
        ))}
      </svg>

      {/* Temperature badge */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 2.5, type: 'spring' as const, stiffness: 300, damping: 22 }}
        className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/30 border border-emerald-200/40 dark:border-emerald-800/30"
      >
        <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
          Temperatura mantida: 2–8°C
        </span>
      </motion.div>
    </div>
  )
}

function ProducerCard({ isVisible }: { isVisible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.5, type: 'spring' as const, stiffness: 280, damping: 24 }}
      whileHover={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
      className="rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-950/15 dark:to-orange-950/10 border border-amber-200/40 dark:border-amber-800/25 p-4"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <motion.div
          className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl shrink-0"
          initial={{ scale: 0 }}
          animate={isVisible ? { scale: 1 } : {}}
          transition={{ delay: 0.7, type: 'spring' as const, stiffness: 350, damping: 18 }}
        >
          {producerInfo.avatar}
        </motion.div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">{producerInfo.name}</h4>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] text-muted-foreground">
              {producerInfo.city}, {producerInfo.state}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={producerInfo.rating} />
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
              {producerInfo.rating}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({producerInfo.totalReviews} avaliações)
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            <span>🌱 Produtor desde {producerInfo.sinceYear}</span>
            <span>📦 {producerInfo.productsCount} produtos</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white text-[10px] font-bold transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Ver Produtor
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main Component ── */

export function ProductOriginTracker() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="r37-origin-card bg-card rounded-2xl border border-border overflow-hidden">
      {/* ── Header ── */}
      <motion.button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 cursor-pointer"
        whileHover={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={isVisible ? { scale: 1 } : {}}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
          >
            <Globe className="h-5 w-5 text-white" />
          </motion.div>
          <div className="text-left">
            <h3 className="font-bold text-sm">Rastreio de Origem</h3>
            <p className="text-[10px] text-muted-foreground">Transparência do produto</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* ── Expandable Content ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 28 }}
            className="overflow-hidden r37-origin-card-expand"
          >
            <div className="px-4 pb-4 space-y-5">
              {/* ── 1. Origin Map ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring' as const, stiffness: 280, damping: 22 }}
              >
                <h4 className="text-xs font-bold mb-2.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  Mapa de Rota — Pará → Dom Eliseu
                </h4>
                <BrazilRouteMap isVisible={isVisible} />
              </motion.div>

              {/* ── 2. Supply Chain Timeline ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring' as const, stiffness: 280, damping: 22 }}
              >
                <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Truck className="h-3.5 w-3.5 text-emerald-500" />
                  Cadeia de Suprimento
                </h4>
                <SupplyChainTimeline isVisible={isVisible} />
              </motion.div>

              {/* ── 3. Sustainability Badges ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring' as const, stiffness: 280, damping: 22 }}
              >
                <h4 className="text-xs font-bold mb-2.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                  Sustentabilidade
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ecoBadges.map((badge, idx) => (
                    <EcoBadgeCard key={badge.id} badge={badge} isVisible={isVisible} delay={0.5 + idx * 0.12} />
                  ))}
                </div>
              </motion.div>

              {/* ── 4. Producer Info ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: 'spring' as const, stiffness: 280, damping: 22 }}
              >
                <h4 className="text-xs font-bold mb-2.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Sprout className="h-3.5 w-3.5 text-emerald-500" />
                  Produtor
                </h4>
                <ProducerCard isVisible={isVisible} />
              </motion.div>

              {/* ── 5. Quality Certifications ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, type: 'spring' as const, stiffness: 280, damping: 22 }}
              >
                <h4 className="text-xs font-bold mb-2.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                  Certificações de Qualidade
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {certifications.map((cert, idx) => (
                    <CertificationStamp key={cert.id} cert={cert} isVisible={isVisible} delay={0.8 + idx * 0.15} />
                  ))}
                </div>
              </motion.div>

              {/* ── 6. Temperature Log ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, type: 'spring' as const, stiffness: 280, damping: 22 }}
              >
                <h4 className="text-xs font-bold mb-2.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Thermometer className="h-3.5 w-3.5 text-blue-500" />
                  Controle de Temperatura
                </h4>
                <TemperatureChart isVisible={isVisible} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
