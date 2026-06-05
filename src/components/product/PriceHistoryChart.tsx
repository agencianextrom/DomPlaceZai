'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingDown,
  TrendingUp,
  Info,
  Calendar,
  ArrowDown,
  Minus,
  Eye,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBRL } from '@/lib/format'

/* ───────────────────────────────────────────────────────────────
   Types & Interfaces
   ─────────────────────────────────────────────────────────────── */

type TimeRange = '7d' | '30d' | '90d'

interface PricePoint {
  date: string
  price: number
}

interface PriceHistoryChartProps {
  currentPrice: number
  productName: string
}

/* ───────────────────────────────────────────────────────────────
   Generate mock price data
   ─────────────────────────────────────────────────────────────── */

function generatePriceHistory(days: number, basePrice: number): PricePoint[] {
  const points: PricePoint[] = []
  const now = new Date()
  let price = basePrice * 1.15 // Start slightly higher for realistic look

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Random walk with slight downward trend
    const change = (Math.random() - 0.52) * basePrice * 0.04
    price = Math.max(basePrice * 0.85, Math.min(basePrice * 1.25, price + change))

    points.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
    })
  }

  // Ensure last point matches currentPrice
  if (points.length > 0) {
    points[points.length - 1].price = basePrice
  }

  return points
}

/* ───────────────────────────────────────────────────────────────
   Format date for display
   ─────────────────────────────────────────────────────────────── */

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ───────────────────────────────────────────────────────────────
   Time range config
   ─────────────────────────────────────────────────────────────── */

const timeRanges: { id: TimeRange; label: string; days: number }[] = [
  { id: '7d', label: '7 dias', days: 7 },
  { id: '30d', label: '30 dias', days: 30 },
  { id: '90d', label: '90 dias', days: 90 },
]

/* ───────────────────────────────────────────────────────────────
   Skeleton loader
   ─────────────────────────────────────────────────────────────── */

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   SVG Line Chart with animated path
   ─────────────────────────────────────────────────────────────── */

function InteractiveChart({
  data,
  currentPrice,
  hoveredIndex,
  onHover,
  onLeave,
  chartWidth,
  chartHeight,
  svgRef,
}: {
  data: PricePoint[]
  currentPrice: number
  hoveredIndex: number | null
  onHover: (index: number | null) => void
  onLeave: () => void
  chartWidth: number
  chartHeight: number
  svgRef: React.RefObject<SVGSVGElement | null>
}) {
  if (data.length < 2) return null

  const padding = { top: 20, right: 16, bottom: 28, left: 50 }
  const plotW = chartWidth - padding.left - padding.right
  const plotH = chartHeight - padding.top - padding.bottom

  const prices = data.map((d) => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  // Y scale
  const yScale = (price: number) => padding.top + plotH - ((price - minPrice) / priceRange) * plotH

  // X scale
  const xScale = (index: number) => padding.left + (index / (data.length - 1)) * plotW

  // Build path
  const linePoints = data.map((d, i) => `${xScale(i)},${yScale(d.price)}`)
  const linePath = `M ${linePoints.join(' L ')}`

  // Area fill path
  const areaPath = `${linePath} L ${xScale(data.length - 1)},${padding.top + plotH} L ${xScale(0)},${padding.top + plotH} Z`

  // Find lowest price point
  const lowestPrice = Math.min(...prices)
  const lowestIndex = prices.indexOf(lowestPrice)

  // Current (last) point
  const lastIndex = data.length - 1
  const lastPrice = prices[lastIndex]

  // Price drops: find significant decreases
  const drops: { from: number; to: number; amount: number }[] = []
  for (let i = 1; i < prices.length; i++) {
    const drop = prices[i - 1] - prices[i]
    if (drop > priceRange * 0.03) {
      drops.push({ from: i - 1, to: i, amount: drop })
    }
  }

  // Y axis labels
  const yTicks = 5
  const yLabels: { price: number; y: number }[] = []
  for (let i = 0; i <= yTicks; i++) {
    const price = minPrice + (priceRange * i) / yTicks
    yLabels.push({ price, y: yScale(price) })
  }

  // X axis labels (show at intervals)
  const xLabelInterval = Math.max(1, Math.floor(data.length / 5))
  const xLabels: { date: string; x: number; index: number }[] = []
  data.forEach((d, i) => {
    if (i % xLabelInterval === 0 || i === data.length - 1) {
      xLabels.push({ date: d.date, x: xScale(i), index: i })
    }
  })

  return (
    <svg
      ref={svgRef}
      width={chartWidth}
      height={chartHeight}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="w-full overflow-visible"
      style={{ maxHeight: '220px' }}
    >
      <defs>
        <linearGradient id="chart-fill-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="80%" stopColor="#10b981" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="chart-line-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="chart-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Grid lines (horizontal) */}
      {yLabels.map((tick, i) => (
        <g key={`grid-${i}`}>
          <line
            x1={padding.left}
            y1={tick.y}
            x2={chartWidth - padding.right}
            y2={tick.y}
            stroke="currentColor"
            strokeOpacity="0.06"
            strokeWidth="1"
          />
          <text
            x={padding.left - 6}
            y={tick.y + 3}
            textAnchor="end"
            className="text-[9px] fill-muted-foreground"
            fontSize="9"
          >
            {formatBRL(tick.price)}
          </text>
        </g>
      ))}

      {/* X axis labels */}
      {xLabels.map((tick, i) => (
        <text
          key={`xlabel-${i}`}
          x={tick.x}
          y={chartHeight - 6}
          textAnchor="middle"
          className="text-[8px] fill-muted-foreground"
          fontSize="8"
        >
          {formatDateShort(tick.date)}
        </text>
      ))}

      {/* Area fill with gradient */}
      <motion.path
        d={areaPath}
        fill="url(#chart-fill-gradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />

      {/* Price line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke="url(#chart-line-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#chart-glow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
      />

      {/* Price drop indicators (red arrows) */}
      {drops.map((drop, i) => {
        if (drop.to >= data.length) return null
        const midX = (xScale(drop.from) + xScale(drop.to)) / 2
        const midY = (yScale(data[drop.from].price) + yScale(data[drop.to].price)) / 2

        return (
          <motion.g
            key={`drop-${i}`}
            initial={{ opacity: 0, y: midY - 8 }}
            animate={{ opacity: 1, y: midY }}
            transition={{ delay: 1.8 + i * 0.15, type: 'spring' as const, stiffness: 300, damping: 20 }}
          >
            <motion.text
              x={midX}
              y={midY - 2}
              textAnchor="middle"
              fontSize="9"
              fill="#ef4444"
              fontWeight="bold"
              animate={{ y: [midY - 2, midY - 4, midY - 2] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ▼
            </motion.text>
          </motion.g>
        )
      })}

      {/* Lowest price marker */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.6, type: 'spring' as const, stiffness: 400, damping: 20 }}
      >
        <circle
          cx={xScale(lowestIndex)}
          cy={yScale(lowestPrice)}
          r="6"
          fill="#10b981"
          opacity="0.15"
        />
        <circle
          cx={xScale(lowestIndex)}
          cy={yScale(lowestPrice)}
          r="4"
          fill="#10b981"
          stroke="white"
          strokeWidth="2"
        />
        <text
          x={xScale(lowestIndex)}
          y={yScale(lowestPrice) - 12}
          textAnchor="middle"
          fontSize="8"
          fill="#10b981"
          fontWeight="bold"
        >
          Menor preço
        </text>
        <text
          x={xScale(lowestIndex)}
          y={yScale(lowestPrice) - 3}
          textAnchor="middle"
          fontSize="7"
          fill="#10b981"
        >
          {formatBRL(lowestPrice)}
        </text>
      </motion.g>

      {/* Current price marker */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.8, type: 'spring' as const, stiffness: 400, damping: 20 }}
      >
        <motion.circle
          cx={xScale(lastIndex)}
          cy={yScale(lastPrice)}
          r="6"
          fill="#0ea5e9"
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <circle
          cx={xScale(lastIndex)}
          cy={yScale(lastPrice)}
          r="4"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2"
        />
        <text
          x={xScale(lastIndex)}
          y={yScale(lastPrice) - 12}
          textAnchor="middle"
          fontSize="8"
          fill="#0ea5e9"
          fontWeight="bold"
        >
          Preço atual
        </text>
        <text
          x={xScale(lastIndex)}
          y={yScale(lastPrice) - 3}
          textAnchor="middle"
          fontSize="7"
          fill="#0ea5e9"
        >
          {formatBRL(lastPrice)}
        </text>
      </motion.g>

      {/* Invisible hover zones */}
      {data.map((d, i) => (
        <rect
          key={`hover-${i}`}
          x={xScale(i) - plotW / data.length / 2}
          y={padding.top}
          width={plotW / data.length}
          height={plotH}
          fill="transparent"
          onMouseEnter={() => onHover(i)}
          className="cursor-crosshair"
        />
      ))}

      {/* Hover crosshair + tooltip */}
      {hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < data.length && (
        <g>
          {/* Vertical line */}
          <motion.line
            x1={xScale(hoveredIndex)}
            y1={padding.top}
            x2={xScale(hoveredIndex)}
            y2={padding.top + plotH}
            stroke="#0ea5e9"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
          />
          {/* Horizontal line */}
          <motion.line
            x1={padding.left}
            y1={yScale(data[hoveredIndex].price)}
            x2={chartWidth - padding.right}
            y2={yScale(data[hoveredIndex].price)}
            stroke="#0ea5e9"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
          />
          {/* Hover dot */}
          <motion.circle
            cx={xScale(hoveredIndex)}
            cy={yScale(data[hoveredIndex].price)}
            r="5"
            fill="white"
            stroke="#0ea5e9"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
          />
        </g>
      )}
    </svg>
  )
}

/* ───────────────────────────────────────────────────────────────
   Hover tooltip (HTML overlay)
   ─────────────────────────────────────────────────────────────── */

function TooltipOverlay({
  data,
  hoveredIndex,
  chartRef,
  chartWidth,
  chartHeight,
}: {
  data: PricePoint[]
  hoveredIndex: number | null
  chartRef: React.RefObject<SVGSVGElement | null>
  chartWidth: number
  chartHeight: number
}) {
  if (hoveredIndex === null || hoveredIndex < 0 || hoveredIndex >= data.length) return null

  const point = data[hoveredIndex]
  const prices = data.map((d) => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  const padding = { top: 20, right: 16, bottom: 28, left: 50 }
  const plotW = chartWidth - padding.left - padding.right

  const pctX = padding.left + (hoveredIndex / (data.length - 1)) * plotW
  const pctY = padding.top + (chartHeight - padding.top - padding.bottom) * (1 - (point.price - minPrice) / priceRange)

  // Calculate price change from previous
  const prevPrice = hoveredIndex > 0 ? data[hoveredIndex - 1].price : null
  const priceChange = prevPrice ? point.price - prevPrice : 0
  const isUp = priceChange > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.15 }}
      className="absolute pointer-events-none z-20"
      style={{
        left: `${pctX}%`,
        top: `${(pctY / chartHeight) * 100}%`,
        transform: 'translate(-50%, -120%)',
      }}
    >
      <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-center min-w-[120px]">
        <p className="text-[10px] text-muted-foreground font-medium">
          {formatDateFull(point.date)}
        </p>
        <p className="text-sm font-bold text-foreground mt-0.5">
          {formatBRL(point.price)}
        </p>
        {prevPrice && (
          <div className={`flex items-center justify-center gap-0.5 text-[10px] font-semibold mt-0.5 ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
            {isUp ? (
              <TrendingUp className="h-2.5 w-2.5" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5" />
            )}
            {isUp ? '+' : ''}{formatBRL(priceChange)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Main component: PriceHistoryChart
   ─────────────────────────────────────────────────────────────── */

export function PriceHistoryChart({ currentPrice, productName }: PriceHistoryChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [chartDimensions, setChartDimensions] = useState({ width: 500, height: 220 })
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Generate price data for the selected range
  const priceData = useMemo(() => {
    const days = timeRanges.find((r) => r.id === selectedRange)?.days || 30
    return generatePriceHistory(days, currentPrice)
  }, [selectedRange, currentPrice])

  // Simulate loading on mount and range change
  const handleRangeChange = useCallback((range: TimeRange) => {
    setIsLoading(true)
    setSelectedRange(range)
    setTimeout(() => {
      setIsLoading(false)
    }, 600)
  }, [])

  // Initial load timer (async setState in callback is acceptable)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  // Responsive chart dimensions
  useEffect(() => {
    const measure = () => {
      if (chartContainerRef.current) {
        const rect = chartContainerRef.current.getBoundingClientRect()
        setChartDimensions({
          width: Math.max(300, Math.floor(rect.width)),
          height: 220,
        })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const handleHover = useCallback((index: number | null) => {
    setHoveredIndex(index)
  }, [])

  const handleLeave = useCallback(() => {
    setHoveredIndex(null)
  }, [])

  // Stats
  const lowestPrice = Math.min(...priceData.map((d) => d.price))
  const highestPrice = Math.max(...priceData.map((d) => d.price))
  const priceDiff = currentPrice - lowestPrice
  const savingsPercent = currentPrice > 0 ? ((currentPrice - lowestPrice) / currentPrice) * 100 : 0

  // ── Loading state ──
  if (isLoading) return <ChartSkeleton />

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="rounded-2xl border border-border/60 bg-card overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 18, delay: 0.1 }}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md"
          >
            <TrendingDown className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-1.5">
              Histórico de Preço
            </h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-none">
              {productName}
            </p>
          </div>
        </div>

        {/* Time range toggle */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-1 bg-muted rounded-lg p-0.5"
        >
          {timeRanges.map((range) => (
            <motion.button
              key={range.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRangeChange(range.id)}
              className={`
                relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200
                ${selectedRange === range.id
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {selectedRange === range.id && (
                <motion.div
                  layoutId="price-range-indicator"
                  className="absolute inset-0 bg-primary rounded-md shadow-sm"
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{range.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* ── Chart container ── */}
      <div ref={chartContainerRef} className="relative px-1 pt-2 pb-1">
        {/* SVG Chart */}
        <div className="w-full overflow-x-auto hide-scrollbar">
          <InteractiveChart
            data={priceData}
            currentPrice={currentPrice}
            hoveredIndex={hoveredIndex}
            onHover={handleHover}
            onLeave={handleLeave}
            chartWidth={chartDimensions.width}
            chartHeight={chartDimensions.height}
            svgRef={svgRef}
          />
        </div>

        {/* Tooltip overlay */}
        <AnimatePresence>
          <TooltipOverlay
            data={priceData}
            hoveredIndex={hoveredIndex}
            chartRef={svgRef}
            chartWidth={chartDimensions.width}
            chartHeight={chartDimensions.height}
          />
        </AnimatePresence>

        {/* Hover hint */}
        {hoveredIndex === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute top-6 right-4 flex items-center gap-1 text-[9px] text-muted-foreground bg-muted/60 rounded-md px-2 py-1"
          >
            <Eye className="h-3 w-3" />
            Passe o mouse para ver detalhes
          </motion.div>
        )}
      </div>

      {/* ── Stats summary ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring' as const, stiffness: 300, damping: 25 }}
        className="px-4 pb-4 pt-2"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 px-3 py-2.5 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-emerald-500 mb-0.5"
            >
              <TrendingDown className="h-4 w-4 mx-auto" />
            </motion.div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Menor preço</p>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
              {formatBRL(lowestPrice)}
            </p>
          </motion.div>

          {/* Current price stat */}
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-xl bg-sky-50 dark:bg-sky-900/10 border border-sky-200/50 dark:border-sky-800/30 px-3 py-2.5 text-center"
          >
            <div className="text-sky-500 mb-0.5">
              <Calendar className="h-4 w-4 mx-auto" />
            </div>
            <p className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">Preço atual</p>
            <p className="text-sm font-bold text-sky-700 dark:text-sky-300 mt-0.5">
              {formatBRL(currentPrice)}
            </p>
          </motion.div>

          {/* Highest price stat */}
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 px-3 py-2.5 text-center"
          >
            <div className="text-amber-500 mb-0.5">
              <TrendingUp className="h-4 w-4 mx-auto" />
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Maior preço</p>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-300 mt-0.5">
              {formatBRL(highestPrice)}
            </p>
          </motion.div>
        </div>

        {/* Savings banner */}
        {savingsPercent > 3 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.6, type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="mt-3 flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-lg border border-emerald-200/40 dark:border-emerald-800/30 px-3 py-2"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Info className="h-4 w-4 text-emerald-500" />
            </motion.div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              <span className="font-semibold">
                Você economizaria {formatBRL(priceDiff)}
              </span>
              {' '}comparado ao menor preço dos últimos{' '}
              {timeRanges.find((r) => r.id === selectedRange)?.label || '30 dias'}
              <span className="text-emerald-500 font-bold ml-1">(-{savingsPercent.toFixed(1)}%)</span>
            </p>
          </motion.div>
        )}

        {/* Price status badges */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">Menor preço</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span className="text-[10px] text-muted-foreground">Preço atual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-red-500">▼</span>
            <span className="text-[10px] text-muted-foreground">Queda de preço</span>
          </div>
        </div>
      </motion.div>

      {/* ── Bottom accent line ── */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full opacity-30 overflow-hidden">
        <motion.div
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '400%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
        />
      </div>
    </motion.section>
  )
}
