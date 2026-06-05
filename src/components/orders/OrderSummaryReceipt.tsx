'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store,
  Clock,
  CreditCard,
  QrCode,
  MapPin,
  Truck,
  Download,
  Share2,
  RotateCcw,
  Star,
  Package,
  CheckCircle2,
  Receipt,
  ChevronDown,
  ChevronUp,
  QrCodeIcon,
  Smartphone,
  Plus,
  ImageIcon,
  ShieldCheck,
  Navigation,
  User,
  Zap,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// ─── BRL Formatter ─────────────────────────────────────────────────────
const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

// ─── Mock Order Data ────────────────────────────────────────────────────
const MOCK_ORDER = {
  orderNumber: 'DP-20250115-4827',
  createdAt: '2025-01-15T14:32:00.000Z',
  status: 'DELIVERED' as const,
  storeName: 'Açai do Parque',
  storeSlug: 'acai-do-parque',
  items: [
    {
      id: '1',
      name: 'Açaí 500ml Completo',
      emoji: '🫐',
      quantity: 2,
      unitPrice: 24.9,
    },
    {
      id: '2',
      name: 'Açaí 700ml com Banana',
      emoji: '🍌',
      quantity: 1,
      unitPrice: 32.5,
    },
    {
      id: '3',
      name: 'Smoothie de Morango',
      emoji: '🍓',
      quantity: 1,
      unitPrice: 18.9,
    },
    {
      id: '4',
      name: 'Granola Especial 200g',
      emoji: '🥣',
      quantity: 2,
      unitPrice: 12.0,
    },
    {
      id: '5',
      name: 'Copo de Água de Coco',
      emoji: '🥥',
      quantity: 3,
      unitPrice: 6.5,
    },
  ],
  subtotal: 148.6,
  deliveryFee: 5.99,
  serviceFee: 2.5,
  discount: 15.0,
  couponCode: 'DOMPLACE10',
  taxes: 0.0,
  total: 141.09,
  savings: 15.0,
  payment: {
    method: 'CREDIT_CARD',
    lastFour: '4829',
    status: 'APPROVED',
    installments: 3,
    brand: 'Visa',
  },
  delivery: {
    address: 'Rua das Palmeiras, 325 - Apt 42',
    neighborhood: 'Jardim América',
    city: 'São Paulo',
    zip: '01423-001',
    scheduledTime: '15:30 - 16:00',
    scheduledDate: '15/01/2025',
    driverName: 'Carlos Silva',
    driverAvatar: null,
  },
}

// ─── Status Config ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: 'Confirmado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  PREPARING: { label: 'Preparando', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  DELIVERED: { label: 'Entregue', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  DELIVERING: { label: 'Em entrega', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  PENDING: { label: 'Pendente', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

// ─── Payment method icon map ───────────────────────────────────────────
function PaymentIcon({ method }: { method: string }) {
  if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD') {
    return <CreditCard className="h-4 w-4" />
  }
  if (method === 'PIX') {
    return <QrCodeIcon className="h-4 w-4" />
  }
  return <Smartphone className="h-4 w-4" />
}

// ─── Typewriter text hook (inline) ─────────────────────────────────────
function useTypewriterText(text: string, speed = 80, delay = 600) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let idx = 0
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        idx++
        if (idx <= text.length) {
          setDisplayed(text.slice(0, idx))
        } else {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
  }, [text, speed, delay])

  return { displayed, done }
}

// ─── Animated Counter Hook ──────────────────────────────────────────────
function useAnimatedPrice(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!started) return
    const startTime = performance.now()
    let raf: number
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(2, -10 * progress)
      setCurrent(eased * target)
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setCurrent(target)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, started, duration])

  return current
}

// ─── Torn Edge SVG ─────────────────────────────────────────────────────
function TornEdge() {
  return (
    <svg
      className="r35-receipt-torn-edge w-full block"
      viewBox="0 0 400 20"
      preserveAspectRatio="none"
      style={{ height: 20 }}
    >
      <path
        d="M0 0 L0 5 Q10 0 20 5 Q30 10 40 5 Q50 0 60 5 Q70 10 80 5 Q90 0 100 5 Q110 10 120 5 Q130 0 140 5 Q150 10 160 5 Q170 0 180 5 Q190 10 200 5 Q210 0 220 5 Q230 10 240 5 Q250 0 260 5 Q270 10 280 5 Q290 0 300 5 Q310 10 320 5 Q330 0 340 5 Q350 10 360 5 Q370 0 380 5 Q390 10 400 5 L400 20 L0 20 Z"
        fill="currentColor"
      />
    </svg>
  )
}

// ─── QR Code Placeholder ───────────────────────────────────────────────
function QRPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div className="h-20 w-20 rounded-lg bg-white border-2 border-dashed border-gray-300 flex items-center justify-center">
        <QrCode className="h-10 w-10 text-gray-400" />
      </div>
      <span className="text-[9px] text-muted-foreground tracking-wide uppercase">DomPlace</span>
    </motion.div>
  )
}

// ─── Shimmer Bar ───────────────────────────────────────────────────────
function ShimmerBar() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden rounded-full pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.4 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────
export function OrderSummaryReceipt() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())

  const order = MOCK_ORDER
  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
  const { displayed: typedOrderNum, done: typewriterDone } = useTypewriterText(order.orderNumber, 70, 400)
  const animatedTotal = useAnimatedPrice(order.total, 1400)

  // ─── Date / time formatting ─────────────────────────────────────────
  const formattedDate = useMemo(() => {
    try {
      return new Date(order.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return '15/01/2025'
    }
  }, [order.createdAt])

  const formattedTime = useMemo(() => {
    try {
      return new Date(order.createdAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '14:32'
    }
  }, [order.createdAt])

  // ─── Actions ──────────────────────────────────────────────────────
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

  const handleShare = useCallback(async () => {
    const text = `Pedido ${order.orderNumber} - DomPlace\nTotal: ${formatBRL(order.total)}\nLoja: ${order.storeName}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `Pedido ${order.orderNumber}`, text })
      } else {
        await navigator.clipboard.writeText(text)
        toast.success('Dados copiados!', { description: 'Cole e compartilhe onde quiser' })
      }
    } catch {
      // user cancelled
    }
  }, [order])

  const handleRefund = useCallback(() => {
    toast.info('Solicitação de reembolso', {
      description: 'Entre em contato com o suporte para solicitar o reembolso.',
    })
  }, [])

  const handleRate = useCallback(() => {
    toast.success('Obrigado pela avaliação!', {
      description: 'Sua opinião ajuda a melhorar nosso serviço.',
    })
  }, [])

  const handleQuickAdd = useCallback((itemName: string) => {
    setAddedItems((prev) => {
      const next = new Set(prev)
      next.add(itemName)
      return next
    })
    toast.success(`"${itemName}" adicionado ao carrinho!`)
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev)
        next.delete(itemName)
        return next
      })
    }, 2000)
  }, [])

  const handleTrack = useCallback(() => {
    toast.info('Rastreamento do pedido', {
      description: `Pedido ${order.orderNumber} entregue com sucesso.`,
    })
  }, [order.orderNumber])

  return (
    <>
      <style jsx global>{`
        @media print {
          .r35-no-print { display: none !important; }
          .r35-receipt-card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
          .r35-receipt-torn-edge { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 120, damping: 16 }}
        className="r35-receipt-card max-w-md mx-auto text-foreground r62-card-lift r95-receipt-card"
      >
        {/* ── Receipt Card ── */}
        <div
          className="relative bg-white dark:bg-card rounded-2xl overflow-hidden border border-border"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        >
          {/* Paper texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0zM3 0h1v1H3zM0 3h1v1H0zM3 3h1v1H3z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* ── Header with store branding ── */}
          <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-base leading-tight r62-heading-gradient">{order.storeName}</h2>
                  <a
                    href="#"
                    className="text-[11px] text-primary hover:underline mt-0.5 inline-block"
                    onClick={(e) => e.preventDefault()}
                  >
                    Ver loja
                  </a>
                </div>
              </div>
              <Badge className={`${statusCfg.color} border-0 text-[10px] font-semibold shrink-0`}>
                {statusCfg.label}
              </Badge>
            </div>
          </div>

          {/* Top torn edge */}
          <div className="text-white dark:text-card relative -mt-[1px]">
            <TornEdge />
          </div>

          {/* ── Order Header ── */}
          <div className="px-5 py-4 bg-gray-50/80 dark:bg-secondary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                  Pedido
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-[11px]">
                  {formattedDate} às {formattedTime}
                </span>
              </div>
            </div>

            {/* Order number with typewriter effect */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-foreground tracking-tight font-mono">
                #{typedOrderNum}
                {!typewriterDone && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                    className="inline-block w-[2px] h-5 bg-primary ml-0.5 align-middle"
                  />
                )}
              </span>
            </div>
          </div>

          {/* Dashed separator */}
          <div className="r35-receipt-separator mx-5 border-t border-dashed border-border" />

          {/* ── Itemized List ── */}
          <div className="px-5 py-4">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Itens do Pedido ({order.items.length})
            </h3>

            <div className="space-y-1">
              {order.items.map((item, idx) => {
                const subtotal = item.unitPrice * item.quantity
                const isAdded = addedItems.has(item.name)
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.3 + idx * 0.08,
                      type: 'spring' as const,
                      stiffness: 300,
                      damping: 24,
                    }}
                    className="r35-receipt-item r35-receipt-item-enter group"
                  >
                    <div className="flex items-center gap-3 py-2.5 rounded-lg px-2 -mx-2 hover:bg-secondary/40 transition-colors">
                      {/* Thumbnail / Emoji */}
                      <div className="h-10 w-10 rounded-lg bg-secondary/60 flex items-center justify-center text-lg shrink-0">
                        {item.emoji || <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                      </div>

                      {/* Name + details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {item.quantity}x {formatBRL(item.unitPrice)}
                        </p>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right shrink-0">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + idx * 0.08 }}
                          className="text-sm font-semibold tabular-nums"
                        >
                          {formatBRL(subtotal)}
                        </motion.p>
                      </div>
                    </div>

                    {/* Quick add button */}
                    <div className="flex justify-end -mt-0.5 mb-1 mr-2 r35-no-print">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleQuickAdd(item.name)}
                        className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full transition-all duration-200 ${
                          isAdded
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        <Plus className="h-2.5 w-2.5" />
                        {isAdded ? 'Adicionado!' : 'Adicionar novamente'}
                      </motion.button>
                    </div>

                    {/* Dashed separator between items */}
                    {idx < order.items.length - 1 && (
                      <div className="r35-receipt-separator border-t border-dashed border-border/50" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Dashed separator */}
          <div className="r35-receipt-separator mx-5 border-t border-dashed border-border" />

          {/* ── Price Breakdown ── */}
          <div className="px-5 py-4 space-y-2.5">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5" />
              Resumo do Valor
            </h3>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{formatBRL(order.subtotal)}</span>
            </div>

            {/* Delivery fee */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: 'spring' as const, stiffness: 300, damping: 24 }}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" />
                Taxa de entrega
              </span>
              <span className="font-medium tabular-nums">{formatBRL(order.deliveryFee)}</span>
            </motion.div>

            {/* Service fee */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, type: 'spring' as const, stiffness: 300, damping: 24 }}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Taxa de serviço
              </span>
              <span className="font-medium tabular-nums">{formatBRL(order.serviceFee)}</span>
            </motion.div>

            {/* Taxes */}
            {order.taxes > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Impostos</span>
                <span className="font-medium tabular-nums">{formatBRL(order.taxes)}</span>
              </div>
            )}

            {/* Discount / Coupon */}
            {order.discount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, type: 'spring' as const, stiffness: 300, damping: 24 }}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Cupom {order.couponCode}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  -{formatBRL(order.discount)}
                </span>
              </motion.div>
            )}

            {/* Dashed separator before total */}
            <div className="r35-receipt-separator border-t border-dashed border-border" />

            {/* Total */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.9,
                type: 'spring' as const,
                stiffness: 400,
                damping: 20,
              }}
              className="r35-receipt-total flex items-center justify-between py-1"
            >
              <span className="text-base font-bold">Total</span>
              <motion.span
                key="total-value"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 0.8, delay: 1.2, ease: 'easeInOut' }}
                className="text-xl font-extrabold text-primary tabular-nums"
              >
                {formatBRL(animatedTotal)}
              </motion.span>
            </motion.div>

            {/* Savings callout */}
            {order.savings > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, type: 'spring' as const, stiffness: 300, damping: 24 }}
                className="r35-receipt-savings relative flex items-center justify-center gap-2 mt-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full px-4 py-2 border border-emerald-200 dark:border-emerald-800/40"
              >
                <ShimmerBar />
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Você economizou {formatBRL(order.savings)}!
                </span>
              </motion.div>
            )}
          </div>

          {/* Dashed separator */}
          <div className="r35-receipt-separator mx-5 border-t border-dashed border-border" />

          {/* ── Payment Information ── */}
          <div className="px-5 py-4">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Pagamento
            </h3>

            <div className="bg-secondary/30 dark:bg-secondary/10 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PaymentIcon method={order.payment.method} />
                  <div>
                    <p className="text-sm font-medium">
                      {order.payment.method === 'CREDIT_CARD'
                        ? 'Cartão de Crédito'
                        : order.payment.method === 'PIX'
                        ? 'Pix'
                        : 'Dinheiro'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {order.payment.brand} •••• {order.payment.lastFour}
                    </p>
                  </div>
                </div>

                {/* Payment status badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 18, delay: 0.8 }}
                  className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Aprovado
                  </span>
                </motion.div>
              </div>

              {/* Installments */}
              {order.payment.installments > 1 && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span>
                    {order.payment.installments}x de{' '}
                    <span className="font-medium text-foreground tabular-nums">
                      {formatBRL(order.total / order.payment.installments)}
                    </span>{' '}
                    sem juros
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dashed separator */}
          <div className="r35-receipt-separator mx-5 border-t border-dashed border-border" />

          {/* ── Delivery Information ── */}
          <div className="px-5 py-4">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              Entrega
            </h3>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.5, type: 'spring' as const, stiffness: 200, damping: 25 }}
              className="space-y-3"
            >
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{order.delivery.address}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {order.delivery.neighborhood} — {order.delivery.city} {order.delivery.zip}
                  </p>
                </div>
              </div>

              {/* Scheduled time */}
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Agendado</p>
                  <p className="text-[11px] text-muted-foreground">
                    {order.delivery.scheduledDate} · {order.delivery.scheduledTime}
                  </p>
                </div>
              </div>

              {/* Driver */}
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{order.delivery.driverName}</p>
                  <p className="text-[11px] text-muted-foreground">Entregador</p>
                </div>
              </div>

              {/* Track button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleTrack}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors r35-no-print"
              >
                <Navigation className="h-4 w-4" />
                Rastrear pedido
              </motion.button>
            </motion.div>
          </div>

          {/* Dashed separator */}
          <div className="r35-receipt-separator mx-5 border-t border-dashed border-border" />

          {/* ── Footer / Branding ── */}
          <div className="px-5 py-5 flex flex-col items-center gap-3">
            <QRPlaceholder />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground tracking-wide uppercase">
                  Compra protegida
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                DomPlace · Qualidade garantida
              </p>
            </div>
          </div>

          {/* Bottom torn edge */}
          <div className="text-white dark:text-card relative -mt-[1px]">
            <TornEdge />
          </div>
        </div>

        {/* ── Actions Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, type: 'spring' as const, stiffness: 200, damping: 20 }}
          className="mt-4 space-y-3 r35-no-print"
        >
          {/* Primary actions */}
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="flex-1">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="r35-receipt-action-btn w-full h-10 text-xs font-semibold gap-2"
              >
                {isDownloading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Download className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isDownloading ? 'Baixando...' : 'Baixar Recibo'}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="flex-1">
              <Button
                variant="outline"
                onClick={handleShare}
                className="r35-receipt-action-btn w-full h-10 text-xs font-semibold gap-2"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </motion.div>
          </div>

          {/* Secondary actions */}
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="flex-1">
              <Button
                variant="outline"
                onClick={handleRefund}
                className="r35-receipt-action-btn w-full h-9 text-[11px] font-medium gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-900/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reembolso
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="flex-1">
              <Button
                variant="outline"
                onClick={handleRate}
                className="r35-receipt-action-btn w-full h-9 text-[11px] font-medium gap-1.5 border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800/40 dark:text-amber-400 dark:hover:bg-amber-900/10"
              >
                <Star className="h-3.5 w-3.5" />
                Avaliar Pedido
              </Button>
            </motion.div>
          </div>

          {/* Expandable help / details */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            <span>Dúvidas sobre este pedido?</span>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="space-y-2.5 text-xs text-muted-foreground leading-relaxed pb-2">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-foreground">Compra segura:</strong> Todas as transações são protegidas pelo DomPlace.
                      Em caso de problemas, entre em contato conosco.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <RotateCcw className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-foreground">Reembolso:</strong> Você tem até 7 dias após a entrega para
                      solicitar o reembolso de qualquer item.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Receipt className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-foreground">Nota fiscal:</strong> A NF-e é emitida automaticamente pela loja
                      e pode ser consultada no portal da Receita Federal.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  )
}
