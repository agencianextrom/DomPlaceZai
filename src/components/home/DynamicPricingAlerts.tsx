'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, BellOff, TrendingDown, TrendingUp, Zap, Tag, Clock,
  ChevronDown, Sparkles, Eye, Percent, ShoppingCart, Heart,
  Check, RotateCcw, BarChart3
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cachedFetch } from '@/lib/api-cache'
import { formatBRL } from '@/lib/format'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
type AlertType = 'queda' | 'aumento' | 'flash'

interface PriceAlertProduct {
  id: string
  name: string
  oldPrice: number
  newPrice: number
  category: string
  storeName: string
  storeId: string
  rating: number
  reviews: number
  image: string
  description: string
  alertType: AlertType
  changePercent: number
  priceHistory: number[]
  timeAgo: string
}

type FilterTab = 'todos' | 'quedas' | 'aumentos' | 'ofertas'

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: -10,
    transition: { duration: 0.2 },
  },
}

const bellShakeVariants = {
  idle: { rotate: 0 },
  shake: {
    rotate: [0, -12, 12, -8, 8, -4, 4, 0],
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
}

const priceInVariants = {
  hidden: { opacity: 0, scale: 0.7, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 350, damping: 18 },
  },
}

const priceOutVariants = {
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8, y: -8, transition: { duration: 0.25 } },
}

/* ═══════════════════════════════════════════════════════════════
   Mock Data — 12 products with price changes
   ═══════════════════════════════════════════════════════════════ */
function generateMockAlerts(): PriceAlertProduct[] {
  return [
    {
      id: 'pa-1', name: 'Arroz Tio João 5kg', oldPrice: 32.90, newPrice: 24.90,
      category: 'Alimentação', storeName: 'Mercado Feliz', storeId: 's1',
      rating: 4.5, reviews: 320, image: '', description: '',
      alertType: 'queda', changePercent: -24, priceHistory: [32.90, 31.50, 30.20, 29.00, 27.80, 26.50, 24.90], timeAgo: '2h atrás',
    },
    {
      id: 'pa-2', name: 'Feijão Camil 1kg', oldPrice: 9.80, newPrice: 7.35,
      category: 'Alimentação', storeName: 'Super Bom Preço', storeId: 's2',
      rating: 4.3, reviews: 215, image: '', description: '',
      alertType: 'queda', changePercent: -25, priceHistory: [9.80, 9.50, 9.20, 8.80, 8.40, 7.90, 7.35], timeAgo: '3h atrás',
    },
    {
      id: 'pa-3', name: 'Azeite Gallo 500ml', oldPrice: 45.00, newPrice: 42.75,
      category: 'Alimentação', storeName: 'Empório Sabor', storeId: 's3',
      rating: 4.7, reviews: 180, image: '', description: '',
      alertType: 'aumento', changePercent: 5, priceHistory: [38.00, 39.20, 40.10, 41.00, 41.50, 42.00, 42.75], timeAgo: '1h atrás',
    },
    {
      id: 'pa-4', name: 'Café Pilão 500g', oldPrice: 24.90, newPrice: 14.94,
      category: 'Alimentação', storeName: 'Café & Cia', storeId: 's4',
      rating: 4.8, reviews: 540, image: '', description: '',
      alertType: 'flash', changePercent: -40, priceHistory: [24.90, 24.90, 22.00, 20.00, 18.50, 16.80, 14.94], timeAgo: '30min atrás',
    },
    {
      id: 'pa-5', name: 'Leite Integral Parmalat 1L', oldPrice: 6.50, newPrice: 7.15,
      category: 'Alimentação', storeName: 'Laticínios Frescos', storeId: 's5',
      rating: 4.2, reviews: 290, image: '', description: '',
      alertType: 'aumento', changePercent: 10, priceHistory: [5.80, 5.90, 6.00, 6.10, 6.30, 6.50, 7.15], timeAgo: '5h atrás',
    },
    {
      id: 'pa-6', name: 'Açúcar União 1kg', oldPrice: 5.40, newPrice: 4.59,
      category: 'Alimentação', storeName: 'Mercado Pão de Açúcar', storeId: 's6',
      rating: 4.4, reviews: 410, image: '', description: '',
      alertType: 'queda', changePercent: -15, priceHistory: [5.40, 5.30, 5.20, 5.10, 5.00, 4.80, 4.59], timeAgo: '4h atrás',
    },
    {
      id: 'pa-7', name: 'Macarrão Barilla 500g', oldPrice: 8.90, newPrice: 5.34,
      category: 'Alimentação', storeName: 'Italiano Delícia', storeId: 's7',
      rating: 4.6, reviews: 175, image: '', description: '',
      alertType: 'flash', changePercent: -40, priceHistory: [8.90, 8.50, 7.90, 7.20, 6.50, 5.90, 5.34], timeAgo: '15min atrás',
    },
    {
      id: 'pa-8', name: 'Sabão em Pó Omo 1.6kg', oldPrice: 34.90, newPrice: 36.85,
      category: 'Limpeza', storeName: 'Limpeza Total', storeId: 's8',
      rating: 4.1, reviews: 310, image: '', description: '',
      alertType: 'aumento', changePercent: 6, priceHistory: [30.00, 31.20, 32.50, 33.80, 34.20, 34.90, 36.85], timeAgo: '6h atrás',
    },
    {
      id: 'pa-9', name: 'Óleo de Soja Liza 900ml', oldPrice: 9.90, newPrice: 7.92,
      category: 'Alimentação', storeName: 'Super Bom Preço', storeId: 's2',
      rating: 4.3, reviews: 260, image: '', description: '',
      alertType: 'queda', changePercent: -20, priceHistory: [9.90, 9.70, 9.40, 9.10, 8.70, 8.30, 7.92], timeAgo: '3h atrás',
    },
    {
      id: 'pa-10', name: 'Detergente Ypê 500ml', oldPrice: 3.20, newPrice: 3.68,
      category: 'Limpeza', storeName: 'Higiene & Lar', storeId: 's9',
      rating: 4.0, reviews: 145, image: '', description: '',
      alertType: 'aumento', changePercent: 15, priceHistory: [2.80, 2.90, 3.00, 3.05, 3.10, 3.20, 3.68], timeAgo: '8h atrás',
    },
    {
      id: 'pa-11', name: 'Creme Dental Colgate 90g', oldPrice: 7.90, newPrice: 6.71,
      category: 'Higiene', storeName: 'Farmácia Popular', storeId: 's10',
      rating: 4.5, reviews: 380, image: '', description: '',
      alertType: 'queda', changePercent: -15, priceHistory: [7.90, 7.80, 7.60, 7.40, 7.20, 6.95, 6.71], timeAgo: '2h atrás',
    },
    {
      id: 'pa-12', name: 'Papel Higiênico Neve 12un', oldPrice: 22.90, newPrice: 13.74,
      category: 'Higiene', storeName: 'Desconto Max', storeId: 's11',
      rating: 4.4, reviews: 520, image: '', description: '',
      alertType: 'flash', changePercent: -40, priceHistory: [22.90, 20.50, 19.00, 17.80, 16.50, 15.10, 13.74], timeAgo: '45min atrás',
    },
  ]
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
function getAlertColors(type: AlertType) {
  switch (type) {
    case 'queda':
      return {
        accent: '#10b981',
        accentRgb: '16,185,129',
        bg: '#ecfdf5',
        bgDark: 'rgba(16,185,129,0.08)',
        text: '#059669',
        border: '#a7f3d0',
        borderDark: 'rgba(16,185,129,0.25)',
        gradient: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
      }
    case 'aumento':
      return {
        accent: '#ef4444',
        accentRgb: '239,68,68',
        bg: '#fef2f2',
        bgDark: 'rgba(239,68,68,0.08)',
        text: '#dc2626',
        border: '#fecaca',
        borderDark: 'rgba(239,68,68,0.25)',
        gradient: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
      }
    case 'flash':
      return {
        accent: '#f59e0b',
        accentRgb: '245,158,11',
        bg: '#fffbeb',
        bgDark: 'rgba(245,158,11,0.08)',
        text: '#d97706',
        border: '#fde68a',
        borderDark: 'rgba(245,158,11,0.25)',
        gradient: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
      }
  }
}

function getAlertLabel(type: AlertType): string {
  switch (type) {
    case 'queda': return 'Queda de preço'
    case 'aumento': return 'Aumento'
    case 'flash': return 'Oferta relâmpago'
  }
}

/* ── Icon lookup map (declared outside component to avoid static-components issue) ── */
const AlertIconMap: Record<AlertType, React.ElementType> = {
  queda: TrendingDown,
  aumento: TrendingUp,
  flash: Zap,
}

/* ═══════════════════════════════════════════════════════════════
   Sparkline SVG — animated path drawing for 7 price points
   ═══════════════════════════════════════════════════════════════ */
function PriceSparkline({ data, color, isDrop }: { data: number[]; color: string; isDrop: boolean }) {
  const width = 72
  const height = 28
  const padding = 2

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = padding + ((max - val) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  const areaD = `${pathD} L ${padding + (width - padding * 2)},${height} L ${padding},${height} Z`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="flex-shrink-0"
      style={{ overflow: 'visible' }}
    >
      {/* Animated path draw effect */}
      <defs>
        <linearGradient id={`sparkline-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <motion.path
        d={areaD}
        fill={`url(#sparkline-grad-${color.replace('#', '')})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      {/* Line stroke */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
      />
      {/* End dot */}
      <motion.circle
        cx={padding + (width - padding * 2)}
        cy={padding + ((max - data[data.length - 1]) / range) * (height - padding * 2)}
        r="2.5"
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 1.2 }}
      />
      {/* Arrow indicator at end */}
      {isDrop && (
        <motion.text
          x={width - 2}
          y={height - 1}
          fontSize="8"
          fill={color}
          textAnchor="end"
          initial={{ opacity: 0, y: height - 6 }}
          animate={{ opacity: 1, y: height - 1 }}
          transition={{ delay: 1.4, duration: 0.3 }}
        >
          ▼
        </motion.text>
      )}
      {!isDrop && (
        <motion.text
          x={width - 2}
          y={4}
          fontSize="8"
          fill={color}
          textAnchor="end"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 4 }}
          transition={{ delay: 1.4, duration: 0.3 }}
        >
          ▲
        </motion.text>
      )}
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FloatingParticle — discount emoji particles on price drops
   ═══════════════════════════════════════════════════════════════ */
function FloatingParticle({ delay, emoji }: { delay: number; emoji: string }) {
  return (
    <motion.span
      className="absolute pointer-events-none text-sm r38-price-particle"
      style={{ left: `${10 + Math.random() * 80}%`, top: '50%' }}
      initial={{ opacity: 0, y: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -20, -45, -65],
        scale: [0, 1.2, 1, 0.5],
        x: [0, (Math.random() - 0.5) * 30],
      }}
      transition={{
        duration: 2.5,
        delay,
        repeat: Infinity,
        repeatDelay: 3 + Math.random() * 4,
        ease: 'easeOut',
      }}
    >
      {emoji}
    </motion.span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   AnimatedBell — shake on new alerts
   ═══════════════════════════════════════════════════════════════ */
function AnimatedBell({ shaking, alertCount }: { shaking: boolean; alertCount: number }) {
  const [bellOn, setBellOn] = useState(true)
  return (
    <div className="relative">
      <motion.div
        animate={shaking ? 'shake' : 'idle'}
        variants={bellShakeVariants}
        className="relative"
      >
        <motion.div
          className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setBellOn(!bellOn)}
        >
          {bellOn ? (
            <Bell className="h-4 w-4 text-white" />
          ) : (
            <BellOff className="h-4 w-4 text-white" />
          )}
        </motion.div>
        {/* Notification badge */}
        {alertCount > 0 && bellOn && (
          <motion.span
            key={alertCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 12 }}
            className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 min-w-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: '#ef4444' }}
          >
            {alertCount}
          </motion.span>
        )}
      </motion.div>
      {/* Pulse rings */}
      {shaking && (
        <>
          <motion.span
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
            style={{ border: '2px solid rgba(16,185,129,0.3)' }}
          />
          <motion.span
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{ scale: [1, 2], opacity: [0.15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
            style={{ border: '2px solid rgba(16,185,129,0.15)' }}
          />
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ShimmerStat — shimmer overlay for "Maior economia" stat
   ═══════════════════════════════════════════════════════════════ */
function ShimmerStat({
  label, value, icon: Icon, color, shimmer
}: {
  label: string; value: string; icon: React.ElementType; color: string; shimmer: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 20 }}
      className="flex-1 rounded-xl p-3 text-center relative overflow-hidden border"
      style={{
        background: 'rgba(255,255,255,0.7)',
        borderColor: 'rgba(0,0,0,0.06)',
      }}
    >
      {/* Shimmer sweep */}
      {shimmer && (
        <motion.span
          className="absolute inset-0 pointer-events-none r38-price-shimmer-sweep"
          style={{
            background: 'linear-gradient(105deg, transparent 35%, rgba(16,185,129,0.12) 42%, rgba(16,185,129,0.18) 48%, rgba(16,185,129,0.12) 54%, transparent 61%)',
            backgroundSize: '300% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        />
      )}
      <Icon className="h-4 w-4 mx-auto mb-1.5 relative z-10" style={{ color }} />
      <p className="text-[10px] text-muted-foreground relative z-10 font-medium">{label}</p>
      <p className="text-sm font-bold relative z-10 mt-0.5" style={{ color }}>{value}</p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EconomiaBadge — savings badge with pulse glow
   ═══════════════════════════════════════════════════════════════ */
function EconomiaBadge({ savings, type }: { savings: number; type: AlertType }) {
  const colors = getAlertColors(type)
  if (type === 'aumento') return null

  return (
    <motion.div
      initial={{ scale: 0, x: -8 }}
      animate={{ scale: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 420, damping: 16, delay: 0.35 }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold relative overflow-hidden border"
      style={{
        background: `rgba(${colors.accentRgb},0.1)`,
        color: colors.text,
        borderColor: `rgba(${colors.accentRgb},0.3)`,
      }}
    >
      {/* Pulse glow */}
      <motion.span
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          boxShadow: [
            `0 0 0 0 rgba(${colors.accentRgb},0.3)`,
            `0 0 0 6px rgba(${colors.accentRgb},0)`,
            `0 0 0 0 rgba(${colors.accentRgb},0.3)`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Tag className="h-2.5 w-2.5 relative z-10" />
      <span className="relative z-10">Economia {formatBRL(savings)}</span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PercentageBadge — animated percentage badge with scale pulse
   ═══════════════════════════════════════════════════════════════ */
function PercentageBadge({ percent, type }: { percent: number; type: AlertType }) {
  const colors = getAlertColors(type)
  const IconComp = AlertIconMap[type]
  const isNegative = percent < 0

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 500, damping: 14, delay: 0.15 }}
      className="flex flex-col items-center justify-center h-12 w-12 rounded-xl shrink-0 relative border"
      style={{
        background: `rgba(${colors.accentRgb},0.08)`,
        borderColor: `rgba(${colors.accentRgb},0.2)`,
      }}
    >
      {/* Scale pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{
          boxShadow: [
            `0 0 0 0 rgba(${colors.accentRgb},0.2)`,
            `0 0 0 5px rgba(${colors.accentRgb},0)`,
            `0 0 0 0 rgba(${colors.accentRgb},0.2)`,
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Scale pulse on badge itself */}
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center"
      >
        <IconComp className="h-3.5 w-3.5 mb-0.5" style={{ color: colors.accent }} />
        <span
          className="text-[11px] font-extrabold leading-none"
          style={{ color: colors.text }}
        >
          {isNegative ? '' : '+'}{percent}%
        </span>
        <motion.span
          className="text-[8px] font-semibold mt-0.5 leading-none"
          style={{ color: isNegative ? colors.text : colors.text }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {isNegative ? '▼' : '▲'}
        </motion.span>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   AlertToggle — "Ativar alerta" toggle per product with localStorage
   ═══════════════════════════════════════════════════════════════ */
function AlertToggle({
  productId, enabled, onToggle
}: {
  productId: string; enabled: boolean; onToggle: (id: string, state: boolean) => void
}) {
  const [isOn, setIsOn] = useState(enabled)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleToggle = () => {
    const newState = !isOn
    setIsOn(newState)
    onToggle(productId, newState)

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('r38-price-alerts') || '{}')
        stored[productId] = newState
        localStorage.setItem('r38-price-alerts', JSON.stringify(stored))
      } catch { /* ignore */ }
    }

    if (timerRef.current) clearTimeout(timerRef.current)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      onClick={handleToggle}
      className="flex items-center gap-1.5 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-semibold transition-colors border relative overflow-hidden"
      style={{
        background: isOn ? `rgba(16,185,129,0.12)` : 'rgba(0,0,0,0.04)',
        color: isOn ? '#059669' : '#6b7280',
        borderColor: isOn ? 'rgba(16,185,129,0.3)' : 'rgba(0,0,0,0.1)',
      }}
    >
      <AnimatePresence mode="wait">
        {isOn ? (
          <motion.span
            key="on"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            Ativado
          </motion.span>
        ) : (
          <motion.span
            key="off"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1"
          >
            <BellOff className="h-3 w-3" />
            Ativar alerta
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   AlertCard — individual alert card with all features
   ═══════════════════════════════════════════════════════════════ */
function AlertCard({
  product, index, alertEnabled, onToggleAlert
}: {
  product: PriceAlertProduct
  index: number
  alertEnabled: boolean
  onToggleAlert: (id: string, state: boolean) => void
}) {
  const colors = getAlertColors(product.alertType)
  const savings = product.oldPrice - product.newPrice
  const isDrop = product.changePercent < 0

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -4,
        boxShadow: `0 12px 32px rgba(${colors.accentRgb},0.12), 0 4px 12px rgba(0,0,0,0.06)`,
      }}
      className="rounded-xl p-3.5 relative overflow-hidden group cursor-pointer border"
      style={{
        background: 'rgba(255,255,255,0.75)',
        borderColor: `rgba(${colors.accentRgb},0.15)`,
      }}
    >
      {/* Left gradient accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl r38-price-accent-bar"
        style={{ background: colors.gradient }}
      />

      {/* Decorative corner glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(${colors.accentRgb},0.06) 0%, transparent 70%)` }}
      />

      {/* Floating discount particles (only for drops) */}
      {isDrop && (
        <>
          <FloatingParticle delay={index * 0.4} emoji="💰" />
          <FloatingParticle delay={index * 0.4 + 0.8} emoji="🏷️" />
          <FloatingParticle delay={index * 0.4 + 1.6} emoji="✨" />
        </>
      )}

      {/* Card content */}
      <div className="relative z-10 flex gap-3">
        {/* Left: Percentage badge */}
        <PercentageBadge percent={product.changePercent} type={product.alertType} />

        {/* Center: Product info */}
        <div className="flex-1 min-w-0">
          {/* Alert type label */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <motion.span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider"
              style={{
                background: `rgba(${colors.accentRgb},0.1)`,
                color: colors.text,
              }}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.03 }}
            >
              {(() => {
                const Ic = AlertIconMap[product.alertType]
                return Ic ? (
                  <span className="inline-block" style={{ width: 8, height: 8 }}>
                    <Ic className="h-2 w-2" />
                  </span>
                ) : null
              })()}
              {getAlertLabel(product.alertType)}
            </motion.span>
            {/* Flash deal countdown badge */}
            {product.alertType === 'flash' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 450, damping: 14, delay: 0.4 }}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold"
                style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
              >
                <Zap className="h-2 w-2" />
                ⚡ Limitado
              </motion.span>
            )}
          </div>

          {/* Store name */}
          <p className="text-[10px] text-muted-foreground truncate">{product.storeName}</p>

          {/* Product name */}
          <h4 className="text-xs font-semibold line-clamp-1 mt-0.5 group-hover:text-primary transition-colors r38-price-product-name">
            {product.name}
          </h4>

          {/* Price transition: old → new */}
          <div className="flex items-baseline gap-2 mt-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={`old-${product.id}`}
                variants={priceOutVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-[11px] text-muted-foreground line-through"
              >
                {formatBRL(product.oldPrice)}
              </motion.span>
            </AnimatePresence>

            <motion.span
              key={`new-${product.id}`}
              variants={priceInVariants}
              initial="hidden"
              animate="visible"
              className="text-sm font-bold r38-price-new-value"
              style={{ color: isDrop ? colors.text : '#ef4444' }}
            >
              {formatBRL(product.newPrice)}
            </motion.span>
          </div>

          {/* Savings badge */}
          <div className="mt-1">
            <EconomiaBadge savings={savings} type={product.alertType} />
          </div>

          {/* Sparkline + time */}
          <div className="flex items-center justify-between mt-2">
            <PriceSparkline
              data={product.priceHistory}
              color={colors.accent}
              isDrop={isDrop}
            />
            <div className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">{product.timeAgo}</span>
            </div>
          </div>

          {/* Toggle alert */}
          <div className="mt-2">
            <AlertToggle
              productId={product.id}
              enabled={alertEnabled}
              onToggle={onToggleAlert}
            />
          </div>
        </div>

        {/* Right: Category visual indicator */}
        <motion.div
          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
          style={{
            background: `rgba(${colors.accentRgb},0.06)`,
            border: `1px solid rgba(${colors.accentRgb},0.12)`,
          }}
          whileHover={{ scale: 1.08, rotate: 3 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 18 }}
        >
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(135deg, rgba(${colors.accentRgb},0.1), transparent)`,
            }}
          />
          <span className="text-lg relative z-10">
            {product.category === 'Alimentação' ? '🛒' :
             product.category === 'Limpeza' ? '🧹' :
             product.category === 'Higiene' ? '🧴' : '📦'}
          </span>
        </motion.div>
      </div>

      {/* Bottom hover glow line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
        style={{ background: colors.gradient }}
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FilterTabs — Todos, Quedas, Aumentos, Ofertas
   ═══════════════════════════════════════════════════════════════ */
function FilterTabs({
  active, onChange, counts
}: {
  active: FilterTab
  onChange: (tab: FilterTab) => void
  counts: { todos: number; quedas: number; aumentos: number; ofertas: number }
}) {
  const tabs: { key: FilterTab; label: string; icon: React.ElementType; count: number }[] = [
    { key: 'todos', label: 'Todos', icon: BarChart3, count: counts.todos },
    { key: 'quedas', label: 'Quedas', icon: TrendingDown, count: counts.quedas },
    { key: 'aumentos', label: 'Aumentos', icon: TrendingUp, count: counts.aumentos },
    { key: 'ofertas', label: 'Ofertas', icon: Zap, count: counts.ofertas },
  ]

  return (
    <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => onChange(tab.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-full text-[11px] font-semibold whitespace-nowrap transition-all relative overflow-hidden"
            style={{
              background: isActive ? '#10b981' : 'rgba(0,0,0,0.04)',
              color: isActive ? '#ffffff' : '#6b7280',
              border: isActive ? '1px solid #10b981' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {isActive && (
              <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 48%, rgba(255,255,255,0.15) 52%, transparent 60%)',
                  backgroundSize: '300% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
              />
            )}
            <tab.icon className="h-3 w-3 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
            {tab.count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                className="ml-0.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full text-[9px] font-bold relative z-10"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)',
                  color: isActive ? '#ffffff' : '#9ca3af',
                }}
              >
                {tab.count}
              </motion.span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LoadingSkeleton
   ═══════════════════════════════════════════════════════════════ */
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 p-3.5 rounded-xl border"
          style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(0,0,0,0.06)' }}
        >
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-14 rounded-md" />
            </div>
            <Skeleton className="h-3 w-40" />
            <div className="flex gap-2 items-center">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-6 w-24 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — DynamicPricingAlerts
   ═══════════════════════════════════════════════════════════════ */
export function DynamicPricingAlerts() {
  const [alerts, setAlerts] = useState<PriceAlertProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('todos')
  const [bellShaking, setBellShaking] = useState(false)
  const [alertToggles, setAlertToggles] = useState<Record<string, boolean>>({})
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  /* ── Load persisted toggles from localStorage ─────────────── */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('r38-price-alerts') || '{}')
        setAlertToggles(stored)
      } catch { /* ignore */ }
    }
  }, [])

  /* ── IntersectionObserver for lazy loading ──────────────── */
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '100px 0px', threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* ── Fetch mock data (with simulated API call) ───────────── */
  const fetchAlerts = useCallback(async () => {
    setIsLoading(true)
    try {
      // Attempt API call, fallback to mock data
      let products: PriceAlertProduct[] | null = null
      try {
        const data = await cachedFetch<{ products?: any[] }>('/api/products?limit=20')
        const productList = data?.products ?? []
        if (productList.length > 0) {
          // Transform API products into alert format if they have price changes
          products = productList
            .filter((p: any) => p.comparePrice && p.comparePrice !== p.price)
            .slice(0, 12)
            .map((p: any, idx: number) => {
              const diff = p.comparePrice - p.price
              const pct = Math.round((diff / p.comparePrice) * 100)
              const base = p.comparePrice
              const history: number[] = Array.from({ length: 7 }, (_, h) =>
                Math.round((base - (diff * (h / 6))) * 100) / 100
              )
              const hours = [0.5, 1, 2, 3, 4, 6, 8]
              const randomType: AlertType[] = ['queda', 'queda', 'queda', 'aumento', 'aumento', 'flash']
              return {
                id: `pa-api-${p.id}`,
                name: p.name,
                oldPrice: p.comparePrice,
                newPrice: p.price,
                category: p.category,
                storeName: p.storeName,
                storeId: p.storeId,
                rating: p.rating,
                reviews: p.reviews,
                image: p.image,
                description: p.description,
                alertType: randomType[idx % randomType.length],
                changePercent: pct,
                priceHistory: history,
                timeAgo: `${hours[idx % hours.length]}h atrás`,
              }
            })
        }
      } catch {
        // API unavailable, use mock
      }

      if (!products || products.length === 0) {
        products = generateMockAlerts()
      }

      setAlerts(products)

      // Trigger bell shake
      setBellShaking(true)
      setTimeout(() => setBellShaking(false), 1500)
    } catch {
      setAlerts(generateMockAlerts())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isVisible) {
      fetchAlerts()
    }
  }, [isVisible, fetchAlerts])

  /* ── Toggle handler ───────────────────────────────────────── */
  const handleToggleAlert = useCallback((id: string, state: boolean) => {
    setAlertToggles((prev) => ({ ...prev, [id]: state }))
  }, [])

  /* ── Filtered alerts ────────────────────────────────────── */
  const filteredAlerts = useMemo(() => {
    switch (activeTab) {
      case 'quedas':
        return alerts.filter((a) => a.alertType === 'queda')
      case 'aumentos':
        return alerts.filter((a) => a.alertType === 'aumento')
      case 'ofertas':
        return alerts.filter((a) => a.alertType === 'flash')
      default:
        return alerts
    }
  }, [alerts, activeTab])

  /* ── Counts ──────────────────────────────────────────────── */
  const counts = useMemo(() => ({
    todos: alerts.length,
    quedas: alerts.filter((a) => a.alertType === 'queda').length,
    aumentos: alerts.filter((a) => a.alertType === 'aumento').length,
    ofertas: alerts.filter((a) => a.alertType === 'flash').length,
  }), [alerts])

  /* ── Stats ──────────────────────────────────────────────── */
  const totalAlerts = alerts.length
  const biggestSavings = useMemo(() => {
    const drops = alerts.filter((a) => a.alertType !== 'aumento')
    if (drops.length === 0) return 0
    return Math.max(...drops.map((a) => a.oldPrice - a.newPrice))
  }, [alerts])
  const flashCount = counts.ofertas

  /* ── Periodic bell shake (simulate new alerts) ────────────── */
  useEffect(() => {
    const interval = setInterval(() => {
      setBellShaking(true)
      setTimeout(() => setBellShaking(false), 1200)
    }, 25000)
    return () => clearInterval(interval)
  }, [])

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="space-y-4 r38-price-section r62-card-lift"
    >
      {/* ─── Section Header ────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Animated section icon */}
          <motion.div
            className="h-9 w-9 rounded-xl flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="h-4 w-4 text-white" />
            {/* Pulse ring */}
            <motion.span
              className="absolute inset-0 rounded-xl pointer-events-none"
              animate={{ boxShadow: ['0 0 0 0 rgba(245,158,11,0.3)', '0 0 0 6px rgba(245,158,11,0)', '0 0 0 0 rgba(245,158,11,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          <div>
            <h2 className="text-base font-bold flex items-center gap-2 r38-price-title r62-heading-gradient">
              Alertas de Preço
              {totalAlerts > 0 && (
                <motion.span
                  key={totalAlerts}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                >
                  <Badge
                    className="text-[10px] font-bold"
                    style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                  >
                    {totalAlerts} ativos
                  </Badge>
                </motion.span>
              )}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Acompanhe mudanças de preço em tempo real
            </p>
          </div>
        </div>

        {/* Notification bell */}
        <AnimatedBell shaking={bellShaking} alertCount={totalAlerts} />
      </div>

      {/* ─── Stats Header ──────────────────────────────────── */}
      {!isLoading && alerts.length > 0 && (
        <div className="flex gap-2.5">
          <ShimmerStat
            label="Total alertas hoje"
            value={String(totalAlerts)}
            icon={Bell}
            color="#10b981"
            shimmer={false}
          />
          <ShimmerStat
            label="Maior economia"
            value={formatBRL(biggestSavings)}
            icon={Percent}
            color="#f59e0b"
            shimmer={true}
          />
          <ShimmerStat
            label="Produtos em oferta"
            value={String(flashCount)}
            icon={Zap}
            color="#ef4444"
            shimmer={false}
          />
        </div>
      )}

      {/* ─── Filter Tabs ───────────────────────────────────── */}
      {!isLoading && alerts.length > 0 && (
        <FilterTabs active={activeTab} onChange={setActiveTab} counts={counts} />
      )}

      {/* ─── Loading State ─────────────────────────────────── */}
      {isLoading && isVisible && <LoadingSkeleton />}

      {/* ─── Alert Cards Grid ──────────────────────────────── */}
      {!isLoading && alerts.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filteredAlerts.map((product, index) => (
              <AlertCard
                key={product.id}
                product={product}
                index={index}
                alertEnabled={alertToggles[product.id] ?? false}
                onToggleAlert={handleToggleAlert}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── Empty Filter State ────────────────────────────── */}
      {!isLoading && alerts.length > 0 && filteredAlerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-10 text-center"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-14 w-14 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'rgba(16,185,129,0.1)' }}
          >
            <RotateCcw className="h-6 w-6" style={{ color: '#10b981' }} />
          </motion.div>
          <h3 className="text-sm font-bold">Nenhum alerta nesta categoria</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Tente mudar o filtro para ver outros tipos de alertas de preço.
          </p>
        </motion.div>
      )}

      {/* ─── No Data State ──────────────────────────────────── */}
      {!isLoading && alerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center py-14 text-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(245,158,11,0.1)' }}
          >
            <TrendingDown className="h-7 w-7" style={{ color: '#f59e0b' }} />
          </motion.div>
          <h3 className="text-sm font-bold">Nenhum alerta de preço disponível</h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
            Fique atento! Novos alertas de preço aparecerão aqui assim que as lojas alterarem os preços.
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.04 }}
            onClick={fetchAlerts}
            className="mt-4 h-8 min-h-[44px] px-4 rounded-full text-xs font-semibold flex items-center gap-1.5 border"
            style={{
              background: 'rgba(16,185,129,0.08)',
              color: '#059669',
              borderColor: 'rgba(16,185,129,0.25)',
            }}
          >
            <RotateCcw className="h-3 w-3" />
            Verificar alertas
          </motion.button>
        </motion.div>
      )}

      {/* ─── Bottom info bar ────────────────────────────────── */}
      {!isLoading && alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between pt-2"
        >
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-3 w-3" style={{ color: '#f59e0b' }} />
            </motion.div>
            <span>Atualizado em tempo real</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={fetchAlerts}
            className="flex items-center gap-1 text-[10px] font-semibold"
            style={{ color: '#10b981' }}
          >
            <Eye className="h-3 w-3" />
            Atualizar agora
          </motion.button>
        </motion.div>
      )}
    </motion.section>
  )
}
