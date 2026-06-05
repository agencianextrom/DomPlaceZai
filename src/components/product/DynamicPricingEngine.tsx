'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingDown, TrendingUp, Clock, ThermometerSun, Package,
  Store, Bell, BellOff, Target, Calculator, ChevronDown,
  ArrowDownRight, ArrowUpRight, Zap, BarChart3, AlertTriangle,
  Check, Sparkles, Timer, Percent, Minus, Info
} from 'lucide-react'
import { formatBRL } from '@/lib/format'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
type DemandTier = 'low' | 'medium' | 'high' | 'peak'

interface DemandFactor {
  id: string
  label: string
  icon: React.ElementType
  value: number // 0–100
  description: string
  impact: 'positive' | 'negative' | 'neutral'
}

interface PricePoint {
  time: string
  price: number
}

interface PriceAlertConfig {
  targetPrice: number
  active: boolean
}

interface DynamicPricingEngineProps {
  currentPrice: number
  basePrice: number
  productName?: string
  stockLevel?: number // 0–100
}

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 340, damping: 22 },
  },
}

const arrowDownVariants = {
  idle: { y: 0 },
  bounce: {
    y: [0, 6, 0],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const arrowUpVariants = {
  idle: { y: 0 },
  bounce: {
    y: [0, -6, 0],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const pulseGlowVariants = {
  idle: { opacity: 0.4 },
  pulse: {
    opacity: [0.4, 1, 0.4],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
function getDemandColor(tier: DemandTier): string {
  switch (tier) {
    case 'low': return '#10b981'
    case 'medium': return '#f59e0b'
    case 'high': return '#f97316'
    case 'peak': return '#ef4444'
  }
}

function getDemandColorRgb(tier: DemandTier): string {
  switch (tier) {
    case 'low': return '16,185,129'
    case 'medium': return '245,158,11'
    case 'high': return '249,115,22'
    case 'peak': return '239,68,68'
  }
}

function getDemandLabel(tier: DemandTier): string {
  switch (tier) {
    case 'low': return 'Baixa'
    case 'medium': return 'Média'
    case 'high': return 'Alta'
    case 'peak': return 'Pico'
  }
}

function getDemandEmoji(tier: DemandTier): string {
  switch (tier) {
    case 'low': return '🟢'
    case 'medium': return '🟡'
    case 'high': return '🟠'
    case 'peak': return '🔴'
  }
}

function getDemandAdvice(tier: DemandTier): string {
  switch (tier) {
    case 'low': return 'Ótimo momento para comprar!'
    case 'medium': return 'Preço razoável, pode comprar'
    case 'high': return 'Considere aguardar uma queda'
    case 'peak': return 'Evite comprar agora, preços elevados'
  }
}

function getGradientForDemand(tier: DemandTier): string {
  switch (tier) {
    case 'low':
      return 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0.02) 50%, rgba(5,150,105,0.04) 100%)'
    case 'medium':
      return 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 50%, rgba(217,119,6,0.04) 100%)'
    case 'high':
      return 'linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(249,115,22,0.02) 50%, rgba(234,88,12,0.04) 100%)'
    case 'peak':
      return 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 50%, rgba(220,38,38,0.04) 100%)'
  }
}

function generateMockPriceHistory(basePrice: number): PricePoint[] {
  const points: PricePoint[] = []
  let price = basePrice * 1.05
  const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00']

  for (let i = 0; i < hours.length; i++) {
    const hourNum = parseInt(hours[i].split(':')[0], 10)
    // Higher demand at midday and evening
    const demandMult = 1 + 0.08 * Math.sin(((hourNum - 6) / 24) * Math.PI)
    const noise = (Math.random() - 0.5) * basePrice * 0.03
    price = basePrice * demandMult + noise
    price = Math.max(basePrice * 0.9, Math.min(basePrice * 1.2, price))
    points.push({ time: hours[i], price: Math.round(price * 100) / 100 })
  }
  return points
}

function generateDemandFactors(stockLevel: number): DemandFactor[] {
  const hour = new Date().getHours()
  const timeValue = hour >= 8 && hour <= 11 ? 72
    : hour >= 18 && hour <= 21 ? 85
    : hour >= 12 && hour <= 14 ? 60
    : 25

  return [
    {
      id: 'time',
      label: 'Horário',
      icon: Clock,
      value: timeValue,
      description: timeValue > 60 ? 'Horário de pico de compras' : 'Horário com menos movimentação',
      impact: timeValue > 60 ? 'positive' as const : 'negative' as const,
    },
    {
      id: 'weather',
      label: 'Clima',
      icon: ThermometerSun,
      value: 40 + Math.round(Math.random() * 30),
      description: 'Condições climáticas influenciam a demanda',
      impact: 'neutral' as const,
    },
    {
      id: 'stock',
      label: 'Estoque',
      icon: Package,
      value: 100 - stockLevel,
      description: stockLevel < 20 ? 'Estoque baixo → preços podem subir' : stockLevel > 60 ? 'Boa disponibilidade → preços competitivos' : 'Estoque moderado',
      impact: stockLevel < 20 ? 'positive' as const : stockLevel > 60 ? 'negative' as const : 'neutral' as const,
    },
    {
      id: 'competitor',
      label: 'Concorrente',
      icon: Store,
      value: 30 + Math.round(Math.random() * 40),
      description: 'Preços de concorrentes neste momento',
      impact: 'neutral' as const,
    },
  ]
}

function computeDemandTier(factors: DemandFactor[]): DemandTier {
  const avg = factors.reduce((s, f) => s + f.value, 0) / factors.length
  if (avg < 30) return 'low' as const
  if (avg < 55) return 'medium' as const
  if (avg < 75) return 'high' as const
  return 'peak' as const
}

function computeBestBuyTime(): { time: string; minutesUntil: number } {
  const hour = new Date().getHours()
  // Best time is typically early morning (6–8) or late night (22–23)
  if (hour < 6) return { time: '06:00', minutesUntil: (6 - hour) * 60 }
  if (hour < 8) return { time: '06:00 (amanhã)', minutesUntil: (30 - hour) * 60 }
  if (hour < 22) return { time: '22:00', minutesUntil: (22 - hour) * 60 }
  return { time: '06:00 (amanhã)', minutesUntil: (30 - hour) * 60 }
}

/* ═══════════════════════════════════════════════════════════════
   Sub-component: Animated Demand Gauge
   ═══════════════════════════════════════════════════════════════ */
function DemandGauge({ tier, score }: { tier: DemandTier; score: number }) {
  const color = getDemandColor(tier)
  const colorRgb = getDemandColorRgb(tier)

  return (
    <div className="r49-price-gauge relative w-full">
      {/* Gauge background track */}
      <div className="r49-price-gauge-track h-4 w-full rounded-full overflow-hidden relative" style={{ background: 'rgba(0,0,0,0.06)' }}>
        {/* Animated fill */}
        <motion.div
          className="r49-price-gauge-fill h-full rounded-full relative"
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min(100, score)}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' as const, delay: 0.3 }}
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          }}
        >
          {/* Shimmer on gauge */}
          <motion.div
            className="r49-price-gauge-shimmer absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 42%, rgba(255,255,255,0.25) 48%, transparent 55%)',
              backgroundSize: '300% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' as const, repeatDelay: 1.5 }}
          />
        </motion.div>
      </div>
      {/* Gauge segments markers */}
      <div className="r49-price-gauge-labels flex justify-between mt-1.5 px-0.5">
        {(['Baixa', 'Média', 'Alta', 'Pico'] as const).map((lbl) => {
          const matchTier = lbl === 'Baixa' ? 'low' : lbl === 'Média' ? 'medium' : lbl === 'Alta' ? 'high' : 'peak'
          const isActive = tier === matchTier
          return (
            <motion.span
              key={lbl}
              className={`r49-price-gauge-label text-[9px] font-semibold transition-colors duration-300 ${isActive ? '' : 'text-muted-foreground'}`}
              style={{ color: isActive ? color : undefined }}
              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              {lbl}
            </motion.span>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Sub-component: Price Sparkline (animated drawing)
   ═══════════════════════════════════════════════════════════════ */
function PriceSparkline({ data, color }: { data: PricePoint[]; color: string }) {
  const width = 200
  const height = 56
  const padding = 4

  const prices = data.map(d => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = padding + ((max - d.price) / range) * (height - padding * 2)
    return { x, y, price: d.price, time: d.time }
  })

  const linePath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
  const areaPath = `${linePath} L ${width - padding},${height} L ${padding},${height} Z`

  return (
    <div className="r49-price-sparkline relative">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="r49-sparkline-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Area */}
        <motion.path
          d={areaPath}
          fill="url(#r49-sparkline-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeOut' as const, delay: 0.3 }}
        />
        {/* End dot */}
        <motion.circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3"
          fill={color}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 2 }}
        />
      </svg>
      {/* Time labels */}
      <div className="r49-price-sparkline-labels flex justify-between mt-0.5 px-1">
        <span className="text-[8px] text-muted-foreground">{data[0]?.time}</span>
        <span className="text-[8px] text-muted-foreground">{data[data.length - 1]?.time}</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Sub-component: Demand Factor Card
   ═══════════════════════════════════════════════════════════════ */
function DemandFactorCard({ factor, index }: { factor: DemandFactor; index: number }) {
  const impactColor = factor.impact === 'positive' ? '#ef4444'
    : factor.impact === 'negative' ? '#10b981'
    : '#f59e0b'

  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.2 + index * 0.1 }}
      className="r49-price-factor-card rounded-xl p-3 border relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.7)',
        borderColor: 'rgba(0,0,0,0.06)',
      }}
    >
      <div className="r49-price-factor-header flex items-center gap-2 mb-2">
        <div
          className="r49-price-factor-icon h-7 w-7 rounded-lg flex items-center justify-center"
          style={{ background: `${impactColor}18`, color: impactColor }}
        >
          <factor.icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="r49-price-factor-label text-[11px] font-semibold text-foreground">{factor.label}</p>
          <p className="r49-price-factor-desc text-[9px] text-muted-foreground truncate">{factor.description}</p>
        </div>
        <span
          className="r49-price-factor-value text-xs font-bold"
          style={{ color: impactColor }}
        >
          {factor.value}%
        </span>
      </div>
      {/* Mini bar */}
      <div className="r49-price-factor-bar h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <motion.div
          className="r49-price-factor-bar-fill h-full rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${factor.value}%` }}
          transition={{ duration: 1, ease: 'easeOut' as const, delay: 0.4 + index * 0.1 }}
          style={{ background: impactColor }}
        />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Sub-component: Best Time to Buy with Countdown
   ═══════════════════════════════════════════════════════════════ */
function BestTimeToBuy({ time, initialMinutes }: { time: string; initialMinutes: number }) {
  const [minutesLeft, setMinutesLeft] = useState(initialMinutes)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === 0) {
          setMinutesLeft(m => {
            if (m <= 0) return 0
            return m - 1
          })
          return 59
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const totalMinutes = minutesLeft
  const displayHours = Math.floor(totalMinutes / 60)
  const displayMinutes = totalMinutes % 60

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.5 }}
      className="r49-price-best-time rounded-xl p-3.5 border relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.04) 100%)',
        borderColor: 'rgba(16,185,129,0.2)',
      }}
    >
      <div className="r49-price-best-time-decor absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)' }} />
      <div className="r49-price-best-time-content relative z-10 flex items-center gap-3">
        <motion.div
          className="r49-price-best-time-icon h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <Timer className="h-5 w-5 text-white" />
        </motion.div>
        <div className="r49-price-best-time-info flex-1 min-w-0">
          <p className="r49-price-best-time-title text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            Melhor horário para comprar
          </p>
          <p className="r49-price-best-time-value text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
            {time}
          </p>
        </div>
        <div className="r49-price-best-time-countdown text-right shrink-0">
          <p className="r49-price-best-time-label text-[9px] text-muted-foreground font-medium">Faltam</p>
          <p className="r49-price-best-time-digits text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {displayHours > 0 && `${displayHours}h `}{String(displayMinutes).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Sub-component: Price Alert Threshold Setter
   ═══════════════════════════════════════════════════════════════ */
function PriceAlertSetter({
  currentPrice,
  initialAlert,
  onSetAlert
}: {
  currentPrice: number
  initialAlert: PriceAlertConfig
  onSetAlert: (config: PriceAlertConfig) => void
}) {
  const [targetPrice, setTargetPrice] = useState(initialAlert.targetPrice)
  const [isActive, setIsActive] = useState(initialAlert.active)
  const [inputValue, setInputValue] = useState(initialAlert.targetPrice > 0 ? initialAlert.targetPrice.toFixed(2) : '')

  const handleSetTarget = useCallback(() => {
    const val = parseFloat(inputValue.replace(',', '.'))
    if (isNaN(val) || val <= 0 || val >= currentPrice) return
    setTargetPrice(val)
    setIsActive(true)
    onSetAlert({ targetPrice: val, active: true })
  }, [inputValue, currentPrice, onSetAlert])

  const handleDisable = useCallback(() => {
    setIsActive(false)
    onSetAlert({ targetPrice, active: false })
  }, [targetPrice, onSetAlert])

  const difference = currentPrice - targetPrice
  const percentDiff = targetPrice > 0 ? Math.round((difference / currentPrice) * 100) : 0

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.6 }}
      className="r49-price-alert-setter rounded-xl p-3.5 border relative overflow-hidden"
      style={{
        background: isActive ? 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.04) 100%)' : 'rgba(255,255,255,0.7)',
        borderColor: isActive ? 'rgba(59,130,246,0.25)' : 'rgba(0,0,0,0.06)',
      }}
    >
      <div className="r49-price-alert-header flex items-center gap-2 mb-2.5">
        <motion.div
          className="r49-price-alert-icon h-7 w-7 rounded-lg flex items-center justify-center"
          style={{ background: isActive ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.06)', color: isActive ? '#3b82f6' : '#9ca3af' }}
          animate={isActive ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          {isActive ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
        </motion.div>
        <p className="r49-price-alert-title text-[11px] font-bold text-foreground">Alerta de Preço</p>
        {isActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
            className="r49-price-alert-badge ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
            style={{ background: '#3b82f6' }}
          >
            Ativo
          </motion.span>
        )}
      </div>

      <div className="r49-price-alert-body flex items-center gap-2 mb-2">
        <div className="r49-price-alert-input-wrap flex-1 relative">
          <span className="r49-price-alert-input-prefix absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">R$</span>
          <input
            type="text"
            className="r49-price-alert-input w-full h-9 pl-9 pr-3 rounded-lg text-xs font-medium border outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.8)',
              borderColor: isActive ? 'rgba(59,130,246,0.3)' : 'rgba(0,0,0,0.1)',
              color: isActive ? '#3b82f6' : '#374151',
            }}
            placeholder="Preço desejado"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <motion.div whileTap={{ scale: 0.95 }} className="r49-price-alert-btn-wrap">
          <motion.button
            type="button"
            onClick={handleSetTarget}
            className="r49-price-alert-btn h-9 px-3 rounded-lg text-[11px] font-bold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
          >
            Definir
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isActive && targetPrice > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="r49-price-alert-detail overflow-hidden"
          >
            <div className="r49-price-alert-detail-inner flex items-center justify-between py-1.5">
              <div className="r49-price-alert-detail-info flex items-center gap-1.5">
                <Target className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] text-muted-foreground">Alvo: <span className="font-bold text-blue-600 dark:text-blue-400">{formatBRL(targetPrice)}</span></span>
              </div>
              <span className="r49-price-alert-detail-potential text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Economia: {formatBRL(difference)} (-{percentDiff}%)
              </span>
            </div>
            <motion.button
              type="button"
              onClick={handleDisable}
              whileTap={{ scale: 0.95 }}
              className="r49-price-alert-disable w-full h-7 min-h-[44px] rounded-md text-[10px] font-medium text-red-500 border transition-colors mt-1"
              style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}
            >
              Desativar alerta
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Sub-component: Price Direction Indicator
   ═══════════════════════════════════════════════════════════════ */
function PriceDirectionIndicator({ priceChange }: { priceChange: number }) {
  const isDrop = priceChange < 0
  const isUp = priceChange > 0
  const absPct = Math.abs(Math.round(priceChange * 100) / 100)

  if (Math.abs(priceChange) < 0.01) {
    return (
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="r49-price-direction r49-price-direction-flat flex items-center gap-1.5">
        <div className="r49-price-direction-flat-icon h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(156,163,175,0.12)' }}>
          <Minus className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-medium">Sem mudança</p>
          <p className="text-[9px] text-muted-foreground">Preço estável</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible" className={`r49-price-direction ${isDrop ? 'r49-price-direction-down' : 'r49-price-direction-up'} flex items-center gap-2`}>
      <motion.div
        className={`r49-price-direction-arrow h-8 w-8 rounded-lg flex items-center justify-center ${isDrop ? '' : ''}`}
        style={{
          background: isDrop ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
        }}
        animate={isDrop ? 'bounce' : 'bounce'}
        variants={isDrop ? arrowDownVariants : arrowUpVariants}
      >
        {isDrop ? (
          <ArrowDownRight className="h-4 w-4 text-emerald-500" />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-red-500" />
        )}
      </motion.div>
      <div>
        <p className={`text-xs font-bold ${isDrop ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {isDrop ? '-' : '+'}{absPct}%
        </p>
        <p className="text-[9px] text-muted-foreground">
          {isDrop ? 'Preço caindo' : 'Preço subindo'}
        </p>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Sub-component: Comparison Bar Chart
   ═══════════════════════════════════════════════════════════════ */
function ComparisonBarChart({ current, avg, lowest, highest }: { current: number; avg: number; lowest: number; highest: number }) {
  const maxVal = Math.max(current, avg, lowest, highest) * 1.1

  const bars: { label: string; value: number; color: string; highlight: boolean }[] = [
    { label: 'Atual', value: current, color: '#3b82f6', highlight: true },
    { label: 'Média', value: avg, color: '#8b5cf6', highlight: false },
    { label: 'Menor', value: lowest, color: '#10b981', highlight: false },
    { label: 'Maior', value: highest, color: '#ef4444', highlight: false },
  ]

  return (
    <div className="r49-price-comparison space-y-3">
      {bars.map((bar, i) => (
        <motion.div
          key={bar.label}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.1, type: 'spring' as const, stiffness: 300, damping: 22 }}
          className="r49-price-comparison-row flex items-center gap-3"
        >
          <span className="r49-price-comparison-label text-[10px] font-semibold text-muted-foreground w-12 shrink-0 text-right">
            {bar.label}
          </span>
          <div className="r49-price-comparison-bar-track flex-1 h-5 rounded-md overflow-hidden relative" style={{ background: 'rgba(0,0,0,0.04)' }}>
            <motion.div
              className="r49-price-comparison-bar-fill h-full rounded-md relative"
              initial={{ width: '0%' }}
              animate={{ width: `${(bar.value / maxVal) * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' as const, delay: 0.5 + i * 0.15 }}
              style={{ background: bar.color }}
            >
              {bar.highlight && (
                <motion.div
                  className="r49-price-comparison-shimmer absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 42%, rgba(255,255,255,0.2) 48%, transparent 55%)',
                    backgroundSize: '300% 100%',
                  }}
                  animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' as const, repeatDelay: 1.5 }}
                />
              )}
            </motion.div>
          </div>
          <span className="r49-price-comparison-value text-[11px] font-bold w-20 text-right shrink-0" style={{ color: bar.color }}>
            {formatBRL(bar.value)}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Sub-component: Savings Calculator
   ═══════════════════════════════════════════════════════════════ */
function SavingsCalculator({
  currentPrice,
  lowestPrice,
  demandTier
}: {
  currentPrice: number
  lowestPrice: number
  demandTier: DemandTier
}) {
  const [waitHours, setWaitHours] = useState(24)
  const potentialSaving = Math.max(0, currentPrice - lowestPrice)
  const estimatedSaving = Math.min(potentialSaving, potentialSaving * (waitHours / 48))
  const percentSavings = currentPrice > 0 ? Math.round((estimatedSaving / currentPrice) * 100) : 0
  const isWorthWaiting = demandTier === 'high' || demandTier === 'peak'

  const hourOptions = [6, 12, 24, 48, 72]

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.7 }}
      className="r49-price-savings rounded-xl p-3.5 border relative overflow-hidden"
      style={{
        background: isWorthWaiting
          ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.04) 100%)'
          : 'rgba(255,255,255,0.7)',
        borderColor: isWorthWaiting ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0.06)',
      }}
    >
      <div className="r49-price-savings-header flex items-center gap-2 mb-2.5">
        <motion.div
          className="r49-price-savings-icon h-7 w-7 rounded-lg flex items-center justify-center"
          style={{ background: isWorthWaiting ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: isWorthWaiting ? '#10b981' : '#f59e0b' }}
        >
          <Calculator className="h-3.5 w-3.5" />
        </motion.div>
        <p className="r49-price-savings-title text-[11px] font-bold text-foreground">Calculadora de Economia</p>
      </div>

      {/* Hour selector */}
      <div className="r49-price-savings-hours flex gap-1.5 mb-3">
        {hourOptions.map((h) => (
          <motion.button
            key={h}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setWaitHours(h)}
            className={`r49-price-savings-hour-btn flex-1 h-7 rounded-md text-[10px] font-semibold transition-all ${waitHours === h ? 'text-white' : ''}`}
            style={{
              background: waitHours === h ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(0,0,0,0.04)',
              color: waitHours === h ? '#ffffff' : '#6b7280',
              border: waitHours === h ? '1px solid #10b981' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {h}h
          </motion.button>
        ))}
      </div>

      {/* Estimated savings display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={waitHours}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="r49-price-savings-result rounded-lg p-2.5 border"
          style={{
            background: 'rgba(255,255,255,0.6)',
            borderColor: 'rgba(0,0,0,0.05)',
          }}
        >
          <div className="r49-price-savings-result-row flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Economia estimada</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatBRL(estimatedSaving)}
            </span>
          </div>
          <div className="r49-price-savings-result-row flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">Desconto aproximado</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Percent className="h-3 w-3" />
              {percentSavings}%
            </span>
          </div>
          <div className="r49-price-savings-result-row flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">Preço alvo</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {formatBRL(currentPrice - estimatedSaving)}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Recommendation */}
      <motion.div
        className="r49-price-savings-advice mt-2.5 flex items-start gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}>
          {isWorthWaiting ? (
            <Sparkles className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          )}
        </motion.div>
        <p className={`text-[10px] font-medium ${isWorthWaiting ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}`}>
          {isWorthWaiting
            ? 'Vale a pena esperar! A demanda deve diminuir em breve.'
            : 'Preço já está favorável. Considere comprar agora.'}
        </p>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — DynamicPricingEngine
   ═══════════════════════════════════════════════════════════════ */
export function DynamicPricingEngine({
  currentPrice,
  basePrice,
  productName = 'Produto',
  stockLevel = 50,
}: DynamicPricingEngineProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [demandFactors, setDemandFactors] = useState<DemandFactor[]>([])
  const [demandTier, setDemandTier] = useState<DemandTier>('low')
  const [demandScore, setDemandScore] = useState(0)
  const [priceAlertConfig, setPriceAlertConfig] = useState<PriceAlertConfig>({ targetPrice: 0, active: false })
  const [priceChangePercent, setPriceChangePercent] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  // Compute price stats
  const priceStats = useMemo(() => {
    const prices = priceHistory.map(p => p.price)
    if (prices.length === 0) {
      return { avg: currentPrice, lowest: currentPrice * 0.92, highest: currentPrice * 1.12 }
    }
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length
    const lowest = Math.min(...prices)
    const highest = Math.max(...prices)
    return { avg: Math.round(avg * 100) / 100, lowest, highest }
  }, [priceHistory, currentPrice])

  // Best time to buy
  const bestBuy = useMemo(() => computeBestBuyTime(), [])

  // Load data on mount
  useEffect(() => {
    const history = generateMockPriceHistory(basePrice)
    setPriceHistory(history)

    const factors = generateDemandFactors(stockLevel)
    setDemandFactors(factors)

    const tier = computeDemandTier(factors)
    setDemandTier(tier)

    const score = Math.round(factors.reduce((s, f) => s + f.value, 0) / factors.length)
    setDemandScore(score)

    // Simulate a slight price change
    const changePct = (Math.random() - 0.45) * 8
    setPriceChangePercent(Math.round(changePct * 100) / 100)

    // Load saved alert from localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('r49-price-alert')
        if (saved) {
          const parsed = JSON.parse(saved)
          setPriceAlertConfig(parsed)
        }
      } catch { /* ignore */ }
    }

    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [basePrice, stockLevel])

  // Persist alert config
  const handleSetAlert = useCallback((config: PriceAlertConfig) => {
    setPriceAlertConfig(config)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('r49-price-alert', JSON.stringify(config))
      } catch { /* ignore */ }
    }
  }, [])

  // Periodically update demand factors (simulated live update)
  useEffect(() => {
    const interval = setInterval(() => {
      setDemandFactors(prev => prev.map(f => {
        const drift = (Math.random() - 0.5) * 8
        return { ...f, value: Math.max(5, Math.min(95, Math.round(f.value + drift))) }
      }))
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Recompute demand tier when factors change
  useEffect(() => {
    if (demandFactors.length > 0) {
      const tier = computeDemandTier(demandFactors)
      setDemandTier(tier)
      const score = Math.round(demandFactors.reduce((s, f) => s + f.value, 0) / demandFactors.length)
      setDemandScore(score)
    }
  }, [demandFactors])

  const demandColor = getDemandColor(demandTier)
  const demandColorRgb = getDemandColorRgb(demandTier)
  const demandLabel = getDemandLabel(demandTier)
  const demandEmoji = getDemandEmoji(demandTier)
  const demandAdvice = getDemandAdvice(demandTier)
  const demandGradient = getGradientForDemand(demandTier)

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="r49-price-engine r49-price-engine-loading rounded-2xl border p-4 space-y-4" style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.5)' }}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl" style={{ background: 'rgba(0,0,0,0.08)' }} />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded-md" style={{ background: 'rgba(0,0,0,0.06)' }} />
            <div className="h-3 w-32 rounded-md" style={{ background: 'rgba(0,0,0,0.04)' }} />
          </div>
        </div>
        <div className="h-4 w-full rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }} />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }} />
          <div className="h-24 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }} />
        </div>
        <div className="h-40 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }} />
      </div>
    )
  }

  return (
    <motion.section
      ref={containerRef}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="r49-price-engine rounded-2xl border overflow-hidden relative"
      style={{
        borderColor: `rgba(${demandColorRgb},0.15)`,
        background: 'rgba(255,255,255,0.85)',
      }}
    >
      {/* ── Animated demand gradient background ── */}
      <motion.div
        className="r49-price-bg-gradient absolute inset-0 pointer-events-none"
        style={{ background: demandGradient }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
      />
      {/* Animated floating orbs */}
      <motion.div
        className="r49-price-bg-orb r49-price-bg-orb-1 absolute -top-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(${demandColorRgb},0.06) 0%, transparent 70%)` }}
        animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
      />
      <motion.div
        className="r49-price-bg-orb r49-price-bg-orb-2 absolute -bottom-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(${demandColorRgb},0.04) 0%, transparent 70%)` }}
        animate={{ x: [0, -15, 0], y: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 }}
      />

      {/* ── Header ── */}
      <div className="r49-price-header relative z-10 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="r49-price-header-left flex items-center gap-3">
            <motion.div
              className="r49-price-header-icon h-10 w-10 rounded-xl flex items-center justify-center relative"
              style={{ background: `linear-gradient(135deg, ${demandColor}, ${demandColor}cc)` }}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' as const, stiffness: 350, damping: 18, delay: 0.1 }}
            >
              <Zap className="h-5 w-5 text-white" />
              {/* Pulsing ring */}
              <motion.span
                className="r49-price-header-pulse absolute inset-0 rounded-xl pointer-events-none"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
                }}
                style={{
                  boxShadow: `0 0 0 3px rgba(${demandColorRgb},0.25)`,
                }}
              />
            </motion.div>
            <div>
              <h2 className="r49-price-header-title text-sm font-bold text-foreground flex items-center gap-1.5">
                Preço Dinâmico
                <motion.span
                  className="r49-price-live-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white"
                  style={{ background: '#ef4444' }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                  <span className="r49-price-live-dot h-1.5 w-1.5 rounded-full bg-white inline-block" />
                  AO VIVO
                </motion.span>
              </h2>
              <p className="r49-price-header-subtitle text-[10px] text-muted-foreground mt-0.5">
                {productName}
              </p>
            </div>
          </div>

          {/* Current demand badge */}
          <motion.div
            className="r49-price-demand-badge flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border"
            style={{
              background: `rgba(${demandColorRgb},0.08)`,
              borderColor: `rgba(${demandColorRgb},0.25)`,
              color: demandColor,
            }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}>
              <BarChart3 className="h-3.5 w-3.5" />
            </motion.div>
            <div className="text-right">
              <p className="r49-price-demand-badge-label text-[8px] font-medium opacity-70">Demanda</p>
              <p className="r49-price-demand-badge-value text-[11px] font-bold">{demandEmoji} {demandLabel}</p>
            </div>
          </motion.div>
        </div>

        {/* Current price display */}
        <div className="r49-price-current mt-3 flex items-baseline gap-3">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentPrice}
              className="r49-price-current-value text-2xl font-extrabold"
              style={{ color: demandColor }}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            >
              {formatBRL(currentPrice)}
            </motion.p>
          </AnimatePresence>

          <div className="r49-price-current-meta flex items-center gap-2">
            <PriceDirectionIndicator priceChange={priceChangePercent} />
            {basePrice !== currentPrice && (
              <span className="r49-price-current-base text-[11px] text-muted-foreground line-through">
                {formatBRL(basePrice)}
              </span>
            )}
          </div>
        </div>

        {/* Demand advice strip */}
        <motion.div
          className="r49-price-advice mt-2.5 flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{
            background: `rgba(${demandColorRgb},0.06)`,
            border: `1px solid rgba(${demandColorRgb},0.15)`,
          }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.3 }}
        >
          <motion.div animate={demandTier === 'peak' || demandTier === 'high' ? 'pulse' : 'idle'} variants={pulseGlowVariants}>
            {demandTier === 'peak' || demandTier === 'high' ? (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: demandColor }} />
            ) : (
              <Check className="h-3.5 w-3.5 shrink-0" style={{ color: demandColor }} />
            )}
          </motion.div>
          <p className="r49-price-advice-text text-[10px] font-medium" style={{ color: demandColor }}>
            {demandAdvice}
          </p>
        </motion.div>
      </div>

      {/* ── Expand/Collapse Toggle ── */}
      <div className="r49-price-toggle relative z-10 px-4">
        <motion.button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="r49-price-toggle-btn w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors"
          style={{ background: 'rgba(0,0,0,0.03)', color: '#6b7280' }}
          whileTap={{ scale: 0.98 }}
        >
          <span>{isExpanded ? 'Recolher detalhes' : 'Ver detalhes'}</span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.div>
        </motion.button>
      </div>

      {/* ── Expandable Content ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="r49-price-content relative z-10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' as const }}
          >
            <div className="px-4 pt-3 pb-4 space-y-4 overflow-hidden">

              {/* ── Demand Gauge ── */}
              <div className="r49-price-gauge-section">
                <div className="flex items-center justify-between mb-2">
                  <p className="r49-price-gauge-section-title text-[11px] font-bold text-foreground">Nível de Demanda</p>
                  <motion.span
                    className="r49-price-gauge-score px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ background: demandColor }}
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                  >
                    {demandScore}%
                  </motion.span>
                </div>
                <DemandGauge tier={demandTier} score={demandScore} />
              </div>

              {/* ── Price History Sparkline ── */}
              <div className="r49-price-sparkline-section rounded-xl p-3 border" style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.05)' }}>
                <p className="r49-price-sparkline-title text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                  Histórico de Preço (Hoje)
                </p>
                <PriceSparkline data={priceHistory} color={demandColor} />
              </div>

              {/* ── Demand Factors Grid ── */}
              <div className="r49-price-factors-section">
                <p className="r49-price-factors-title text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <ThermometerSun className="h-3.5 w-3.5 text-amber-500" />
                  Fatores de Demanda
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demandFactors.map((factor, i) => (
                    <DemandFactorCard key={factor.id} factor={factor} index={i} />
                  ))}
                </div>
              </div>

              {/* ── Best Time to Buy ── */}
              <BestTimeToBuy time={bestBuy.time} initialMinutes={bestBuy.minutesUntil} />

              {/* ── Price Alert Setter ── */}
              <PriceAlertSetter
                currentPrice={currentPrice}
                initialAlert={priceAlertConfig}
                onSetAlert={handleSetAlert}
              />

              {/* ── Comparison Bar Chart ── */}
              <div className="r49-price-comparison-section rounded-xl p-3.5 border" style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.05)' }}>
                <p className="r49-price-comparison-title text-[11px] font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-purple-500" />
                  Comparação de Preços
                </p>
                <ComparisonBarChart
                  current={currentPrice}
                  avg={priceStats.avg}
                  lowest={priceStats.lowest}
                  highest={priceStats.highest}
                />
                {/* Legend */}
                <div className="r49-price-comparison-legend flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  {[
                    { label: 'Preço Atual', color: '#3b82f6' },
                    { label: 'Preço Médio', color: '#8b5cf6' },
                    { label: 'Menor Preço', color: '#10b981' },
                    { label: 'Maior Preço', color: '#ef4444' },
                  ].map((item) => (
                    <div key={item.label} className="r49-price-legend-item flex items-center gap-1.5">
                      <span className="r49-price-legend-dot h-2 w-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-[9px] text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Savings Calculator ── */}
              <SavingsCalculator
                currentPrice={currentPrice}
                lowestPrice={priceStats.lowest}
                demandTier={demandTier}
              />

              {/* ── Quick stats row ── */}
              <div className="r49-price-stats grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Variação 24h', value: `${priceChangePercent > 0 ? '+' : ''}${priceChangePercent.toFixed(1)}%`, color: priceChangePercent > 0 ? '#ef4444' : priceChangePercent < 0 ? '#10b981' : '#6b7280' },
                  { label: 'Potencial de queda', value: `${Math.round(((currentPrice - priceStats.lowest) / currentPrice) * 100)}%`, color: '#f59e0b' },
                  { label: 'Estoque disponível', value: `${stockLevel}%`, color: stockLevel > 50 ? '#10b981' : stockLevel > 20 ? '#f59e0b' : '#ef4444' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1, type: 'spring' as const, stiffness: 300, damping: 22 }}
                    className="r49-price-stat-card rounded-xl p-2.5 text-center border"
                    style={{
                      background: 'rgba(255,255,255,0.7)',
                      borderColor: 'rgba(0,0,0,0.06)',
                    }}
                  >
                    <p className="r49-price-stat-label text-[8px] text-muted-foreground font-medium">{stat.label}</p>
                    <p className="r49-price-stat-value text-xs font-bold mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom accent line ── */}
      <div className="r49-price-accent-bar h-1 w-full overflow-hidden">
        <motion.div
          className="r49-price-accent-bar-fill h-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${demandColor}, transparent)`,
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' as const }}
        />
      </div>
    </motion.section>
  )
}
