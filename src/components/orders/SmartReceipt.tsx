'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store,
  Clock,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Star,
  Package,
  CheckCircle2,
  Receipt,
  Truck,
  Download,
  Share2,
  RotateCcw,
  Leaf,
  Rocket,
  Tag,
  BarChart3,
  TrendingDown,
  Sparkles,
  Copy,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// ─── BRL Formatter ─────────────────────────────────────────────────────
const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

// ─── Mock Data ────────────────────────────────────────────────────────
const MOCK_ORDER = {
  orderNumber: 'DP-20250612-7391',
  createdAt: '2025-06-12T16:48:00.000Z',
  status: 'DELIVERED' as const,
  storeName: 'Mercadinho do Zé',
  storeLogo: '🛒',
  items: [
    { id: '1', name: 'Arroz Tio João 5kg', emoji: '🍚', quantity: 2, unitPrice: 24.90, category: 'Alimentos' },
    { id: '2', name: 'Feijão Carioca 1kg', emoji: '🫘', quantity: 3, unitPrice: 8.50, category: 'Alimentos' },
    { id: '3', name: 'Leite Integral 1L', emoji: '🥛', quantity: 4, unitPrice: 5.90, category: 'Laticínios' },
    { id: '4', name: 'Banana Prata 1kg', emoji: '🍌', quantity: 1, unitPrice: 6.99, category: 'Frutas' },
  ],
  subtotal: 119.57,
  discount: 12.00,
  deliveryFee: 5.99,
  total: 113.56,
  savings: 12.00,
  delivery: {
    actualMinutes: 32,
    estimatedMinutes: 45,
  },
  payment: {
    method: 'CREDIT_CARD' as const,
    brand: 'Mastercard',
    lastFour: '3847',
    status: 'APPROVED' as const,
  },
  carbonFootprint: {
    co2Kg: 1.2,
    treesEquivalent: 0.05,
  },
  comparison: {
    vsLastOrderPercent: -12,
    insight: '12% mais barato que a média',
  },
  taxes: {
    icms: { label: 'ICMS', rate: 18, amount: 11.56 },
    pis: { label: 'PIS', rate: 1.65, amount: 1.06 },
    cofins: { label: 'COFINS', rate: 7.6, amount: 4.88 },
  },
}

// ─── Category Colors for Pie Chart ────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Alimentos: '#f59e0b',
  'Laticínios': '#3b82f6',
  Frutas: '#22c55e',
  Bebidas: '#8b5cf6',
  Limpeza: '#ec4899',
}

// ─── Confetti Particle ────────────────────────────────────────────────
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -40 + Math.random() * 30, x: (Math.random() - 0.5) * 60, scale: 0, rotate: 180 }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      className="absolute rounded-full pointer-events-none"
      style={{ width: 6, height: 6, backgroundColor: color, top: '50%', left: '50%' }}
    />
  )
}

// ─── Confetti Micro-Burst ────────────────────────────────────────────
function ConfettiMicroBurst({ active }: { active: boolean }) {
  const colors = ['#22c55e', '#16a34a', '#4ade80', '#86efac', '#bbf7d0']
  return (
    <div className="relative w-full h-12 flex items-center justify-center">
      {active && colors.map((color, i) => (
        <ConfettiParticle key={i} delay={i * 0.06} color={color} />
      ))}
    </div>
  )
}

// ─── Animated Counter Hook ────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1200, delay = 800) {
  const [current, setCurrent] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => { startedRef.current = true }, delay)
    return () => clearTimeout(t)
  }, [delay])

  useEffect(() => {
    if (!startedRef.current) return
    const startTime = performance.now()
    let raf: number
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(eased * target)
      if (progress < 1) { raf = requestAnimationFrame(tick) }
      else { setCurrent(target) }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return current
}

// ─── Animated Progress Bar ────────────────────────────────────────────
function AnimatedTaxBar({ label, rate, amount, delay }: { label: string; rate: number; amount: number; delay: number }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth(rate), delay)
    return () => clearTimeout(t)
  }, [rate, delay])

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label} <span className="text-[10px] opacity-60">({rate}%)</span></span>
        <span className="font-semibold tabular-nums text-foreground">{formatBRL(amount)}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ delay: delay / 1000, duration: 0.8, type: 'spring' as const, stiffness: 100, damping: 20 }}
          className="h-full rounded-full"
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.7)' }}
        />
      </div>
    </div>
  )
}

// ─── SVG Pie Chart ───────────────────────────────────────────────────
function PieChart({ data, animate }: { data: { label: string; value: number; color: string }[]; animate: boolean }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  const slices = data.map((d, i) => {
    const cumulative = data.slice(0, i).reduce((s, item) => s + item.value, 0)
    const startAngle = (cumulative / total) * 360
    const sweepAngle = (d.value / total) * 360
    return { ...d, startAngle, sweepAngle }
  })

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle - 90)
    const end = polarToCartesian(cx, cy, r, startAngle - 90)
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`
  }

  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28">
      {slices.map((slice, i) => (
        <motion.path
          key={slice.label}
          d={describeArc(50, 50, 44, slice.startAngle, slice.startAngle + slice.sweepAngle)}
          fill={slice.color}
          initial={animate ? { opacity: 0, scale: 0.6 } : undefined}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 * i, duration: 0.5, type: 'spring' as const, stiffness: 200, damping: 18 }}
          style={{ transformOrigin: '50px 50px' }}
        />
      ))}
      <circle cx="50" cy="50" r="24" fill="white" />
      <text x="50" y="48" textAnchor="middle" className="text-[7px] fill-foreground font-bold">Gastos</text>
      <text x="50" y="56" textAnchor="middle" className="text-[6px] fill-muted-foreground">por tipo</text>
    </svg>
  )
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// ─── Main Component ───────────────────────────────────────────────────
export default function SmartReceipt() {
  const [itemsExpanded, setItemsExpanded] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [taxExpanded, setTaxExpanded] = useState(false)
  const [checkAnimated, setCheckAnimated] = useState(false)

  const order = MOCK_ORDER

  // Animated values
  const animSubtotal = useAnimatedCounter(order.subtotal, 1000, 600)
  const animDiscount = useAnimatedCounter(order.discount, 800, 900)
  const animDelivery = useAnimatedCounter(order.deliveryFee, 600, 1000)
  const animTotal = useAnimatedCounter(order.total, 1400, 800)

  // Fire confetti on mount
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(true), 1200)
    const t2 = setTimeout(() => setShowConfetti(false), 2800)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [])

  // Payment check animation
  useEffect(() => {
    const t = setTimeout(() => setCheckAnimated(true), 1000)
    return () => clearTimeout(t)
  }, [])

  // ─── Formatted date/time ─────────────────────────────────────────
  const formattedDate = useMemo(() => {
    try {
      return new Date(order.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    } catch { return '12/06/2025' }
  }, [order.createdAt])

  const formattedTime = useMemo(() => {
    try {
      return new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch { return '16:48' }
  }, [order.createdAt])

  // ─── Category data for pie chart ──────────────────────────────────
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {}
    order.items.forEach((item) => {
      catMap[item.category] = (catMap[item.category] || 0) + item.unitPrice * item.quantity
    })
    return Object.entries(catMap).map(([label, value]) => ({
      label,
      value,
      color: CATEGORY_COLORS[label] || '#94a3b8',
    }))
  }, [])

  const topCategory = useMemo(() => {
    const catMap: Record<string, number> = {}
    order.items.forEach((item) => {
      catMap[item.category] = (catMap[item.category] || 0) + item.unitPrice * item.quantity
    })
    const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || '—'
  }, [])

  // ─── Handlers ────────────────────────────────────────────────────
  const handleReorder = useCallback(() => {
    toast.success('Pedido repetido!', { description: 'Todos os itens foram adicionados ao carrinho.' })
  }, [])

  const handleRefund = useCallback(() => {
    toast.info('Solicitação de reembolso', {
      description: 'Entre em contato com o suporte para solicitar o reembolso.',
    })
  }, [])

  const handleShare = useCallback(async () => {
    const text = `🛒 Pedido ${order.orderNumber}\nLoja: ${order.storeName}\nTotal: ${formatBRL(order.total)}\n\nPedidos pelo DomPlace!`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`

    try {
      if (navigator.share) {
        await navigator.share({ title: `Pedido ${order.orderNumber}`, text })
      } else {
        window.open(whatsappUrl, '_blank')
      }
    } catch {
      try {
        window.open(whatsappUrl, '_blank')
      } catch {
        await navigator.clipboard.writeText(text)
        toast.success('Copiado!', { description: 'Cole e compartilhe onde quiser' })
      }
    }
  }, [order])

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    try {
      await new Promise((r) => setTimeout(r, 1200))
      window.print()
      toast.success('Recibo pronto para impressão!')
    } catch {
      toast.error('Erro ao gerar recibo')
    } finally {
      setIsDownloading(false)
    }
  }, [])

  const handleRate = useCallback((star: number) => {
    setRating(star)
    toast.success(`Avaliação registrada: ${star} estrela${star > 1 ? 's' : ''}!`, {
      description: 'Obrigado pelo feedback.',
    })
  }, [])

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <>
      <style jsx global>{`
        @media print {
          .r45-no-print { display: none !important; }
          .r45-receipt-card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
          body { background: white !important; }
        }
      `}</style>

      {/* ── Slide-up entrance ── */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 100, damping: 16 }}
        className="r45-receipt-card max-w-md mx-auto text-foreground r62-card-lift r94-smart-receipt-card"
      >
        <div
          className="relative bg-white dark:bg-card rounded-2xl overflow-hidden border border-border"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
        >
          {/* Paper texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0zM3 0h1v1H3zM0 3h1v1H0zM3 3h1v1H3z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* ── 1. Receipt Header ── */}
          <div className="relative bg-gradient-to-r from-emerald-50 via-white to-transparent dark:from-emerald-900/20 dark:via-card px-5 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl">
                  {order.storeLogo}
                </div>
                <div>
                  <h2 className="font-bold text-base leading-tight r62-heading-gradient">{order.storeName}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">{formattedDate}</span>
                    <span className="text-[11px] text-muted-foreground">•</span>
                    <span className="text-[11px] text-muted-foreground">{formattedTime}</span>
                  </div>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px] font-semibold shrink-0">
                Entregue
              </Badge>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-mono font-semibold text-muted-foreground">{order.orderNumber}</span>
            </div>
          </div>

          {/* Dashed separator */}
          <div className="mx-5 border-t border-dashed border-border" />

          {/* ── 2. Items Summary (Collapsible) ── */}
          <div className="px-5 py-4">
            <button
              onClick={() => setItemsExpanded(!itemsExpanded)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Itens do Pedido ({order.items.length})
              </h3>
              <motion.div animate={{ rotate: itemsExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                {itemsExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </motion.div>
            </button>

            <AnimatePresence>
              {itemsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-1">
                    {order.items.map((item, idx) => {
                      const subtotal = item.unitPrice * item.quantity
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 * idx, type: 'spring' as const, stiffness: 300, damping: 24 }}
                          className="r45-receipt-item flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-secondary/40 transition-colors"
                        >
                          <div className="h-9 w-9 rounded-lg bg-secondary/60 flex items-center justify-center text-base shrink-0">
                            {item.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.quantity}x {formatBRL(item.unitPrice)}
                            </p>
                          </div>
                          <span className="text-sm font-semibold tabular-nums shrink-0">{formatBRL(subtotal)}</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dashed separator */}
          <div className="mx-5 border-t border-dashed border-border" />

          {/* ── 3. Price Breakdown (animated counting) ── */}
          <div className="px-5 py-4 space-y-2.5">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Resumo do Valor
            </h3>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{formatBRL(animSubtotal)}</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring' as const, stiffness: 300, damping: 24 }}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Desconto
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                -{formatBRL(animDiscount)}
              </span>
            </motion.div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" />
                Taxa de entrega
              </span>
              <span className="font-medium tabular-nums">{formatBRL(animDelivery)}</span>
            </div>

            <div className="border-t border-dashed border-border" />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, type: 'spring' as const, stiffness: 400, damping: 20 }}
              className="flex items-center justify-between py-1"
            >
              <span className="text-base font-bold">Total</span>
              <span className="text-xl font-extrabold text-primary tabular-nums">{formatBRL(animTotal)}</span>
            </motion.div>
          </div>

          {/* ── 4. Savings Highlight ── */}
          {order.savings > 0 && (
            <div className="px-5 pb-4">
              <ConfettiMicroBurst active={showConfetti} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: 'spring' as const, stiffness: 300, damping: 20 }}
                className="r45-savings-badge flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full px-4 py-2.5 border border-emerald-200 dark:border-emerald-800/40 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)' }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                />
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 relative z-10" />
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 relative z-10">
                  Você economizou {formatBRL(order.savings)}!
                </span>
              </motion.div>
            </div>
          )}

          <div className="mx-5 border-t border-dashed border-border" />

          {/* ── 5. Spending Analytics Mini ── */}
          <div className="px-5 py-4">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </h3>

            <div className="r45-analytics-card bg-secondary/20 rounded-xl p-3 space-y-3">
              {/* Pie chart + legend row */}
              <div className="flex items-center gap-3">
                <PieChart data={categoryData} animate={true} />
                <div className="flex-1 space-y-1.5">
                  {categoryData.map((cat, i) => (
                    <motion.div
                      key={cat.label}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, type: 'spring' as const, stiffness: 250, damping: 22 }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-muted-foreground truncate">{cat.label}</span>
                      <span className="ml-auto font-medium tabular-nums">{formatBRL(cat.value)}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Insight card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, type: 'spring' as const, stiffness: 250, damping: 22 }}
                className="bg-primary/5 dark:bg-primary/10 rounded-lg px-3 py-2 flex items-center gap-2"
              >
                <Tag className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-medium">
                  Você comprou mais em: <strong className="text-primary">{topCategory}</strong>
                </span>
              </motion.div>

              {/* Comparison card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, type: 'spring' as const, stiffness: 250, damping: 22 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2 flex items-center gap-2"
              >
                <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {order.comparison.insight}
                </span>
              </motion.div>
            </div>
          </div>

          <div className="mx-5 border-t border-dashed border-border" />

          {/* ── 6. Carbon Footprint ── */}
          <div className="px-5 py-4">
            <div className="r45-carbon-card bg-green-50 dark:bg-green-900/10 rounded-xl p-3 flex items-center gap-3">
              <motion.div
                initial={{ rotate: -20, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' as const, stiffness: 200, damping: 15 }}
                className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0"
              >
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                </motion.div>
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                  {order.carbonFootprint.co2Kg} kg CO₂ estimado
                </p>
                <p className="text-[11px] text-green-600 dark:text-green-500 mt-0.5">
                  Equivalente a {order.carbonFootprint.treesEquivalent} árvores plantadas
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-[9px] font-semibold shrink-0">
                🌱 Eco-friendly
              </Badge>
            </div>
          </div>

          <div className="mx-5 border-t border-dashed border-border" />

          {/* ── 7. Delivery Stats ── */}
          <div className="px-5 py-4">
            <div className="r45-delivery-stats flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Rocket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  Entregue em {order.delivery.actualMinutes}min
                  <span className="text-muted-foreground font-normal"> (estimativa: {order.delivery.estimatedMinutes}min)</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {order.delivery.estimatedMinutes - order.delivery.actualMinutes}min mais rápido que o previsto
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-[9px] font-semibold shrink-0">
                🚀 Entrega rápida!
              </Badge>
            </div>
          </div>

          <div className="mx-5 border-t border-dashed border-border" />

          {/* ── 8. Payment Method ── */}
          <div className="px-5 py-4">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Pagamento
            </h3>

            <div className="bg-secondary/30 dark:bg-secondary/10 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                    <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{order.payment.brand}</p>
                    <p className="text-[11px] text-muted-foreground">•••• {order.payment.lastFour}</p>
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={checkAnimated ? { scale: 1, opacity: 1 } : {}}
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 18 }}
                  className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={checkAnimated ? { scale: 1 } : {}}
                    transition={{ type: 'spring' as const, stiffness: 600, damping: 12, delay: 0.2 }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </motion.div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Pagamento aprovado
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="mx-5 border-t border-dashed border-border" />

          {/* ── 9. Rating Prompt ── */}
          <div className="px-5 py-4">
            <div className="r45-rating-prompt text-center">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Avalie este pedido</p>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-1"
                  >
                    <motion.div animate={rating >= star ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                      <Star
                        className={`h-7 w-7 transition-colors duration-150 ${
                          (hoveredStar || rating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </motion.div>
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium"
                >
                  {rating === 5 ? 'Excelente! 😊' : rating >= 4 ? 'Muito bom! 👍' : rating >= 3 ? 'Obrigado pelo feedback!' : 'Sentimos que não foi ideal. Faremos melhor!'}
                </motion.p>
              )}
            </div>
          </div>

          <div className="mx-5 border-t border-dashed border-border" />

          {/* ── 13. Tax Breakdown (Collapsible) ── */}
          <div className="px-5 py-4">
            <button
              onClick={() => setTaxExpanded(!taxExpanded)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5" />
                Impostos
              </h3>
              <motion.div animate={{ rotate: taxExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                {taxExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </motion.div>
            </button>

            <AnimatePresence>
              {taxExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2.5">
                    <AnimatedTaxBar label={order.taxes.icms.label} rate={order.taxes.icms.rate} amount={order.taxes.icms.amount} delay={400} />
                    <AnimatedTaxBar label={order.taxes.pis.label} rate={order.taxes.pis.rate} amount={order.taxes.pis.amount} delay={600} />
                    <AnimatedTaxBar label={order.taxes.cofins.label} rate={order.taxes.cofins.rate} amount={order.taxes.cofins.amount} delay={800} />
                    <div className="pt-1 border-t border-dashed border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Total impostos</span>
                        <span className="font-bold tabular-nums">
                          {formatBRL(order.taxes.icms.amount + order.taxes.pis.amount + order.taxes.cofins.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Footer branding ── */}
          <div className="px-5 py-4 text-center border-t border-dashed border-border">
            <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
              DomPlace · Compra protegida
            </p>
          </div>
        </div>

        {/* ── 10. Actions Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, type: 'spring' as const, stiffness: 200, damping: 20 }}
          className="mt-4 space-y-2 r45-no-print"
        >
          {/* Primary: Repetir + Baixar */}
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="flex-1">
              <Button
                onClick={handleReorder}
                className="r45-action-btn w-full h-10 text-xs font-semibold gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Repetir pedido
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="flex-1">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                variant="outline"
                className="r45-action-btn w-full h-10 text-xs font-semibold gap-2"
              >
                {isDownloading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Download className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isDownloading ? 'Baixando...' : 'Baixar nota'}
              </Button>
            </motion.div>
          </div>

          {/* Secondary: Reembolso + Compartilhar */}
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="flex-1">
              <Button
                variant="outline"
                onClick={handleRefund}
                className="r45-action-btn w-full h-9 text-[11px] font-medium gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-900/10"
              >
                <Copy className="h-3.5 w-3.5" />
                Pedir reembolso
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="flex-1">
              <Button
                variant="outline"
                onClick={handleShare}
                className="r45-action-btn w-full h-9 text-[11px] font-medium gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800/40 dark:text-emerald-400 dark:hover:bg-emerald-900/10"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Compartilhar
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}
