'use client'

import { useState, useEffect } from 'react'
import {
  Check, Package, Clock, MapPin, Share2, QrCode, ArrowRight,
  ShoppingBag, Truck, ChevronRight, Copy, CreditCard, CircleCheckBig
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface OrderSuccessProps {
  orderNumber: string
  items: { productName: string; quantity: number; price: number; total: number }[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  paymentMethod: string
  deliveryType: string
  estimatedDelivery: string
}

// ─── Confetti particles ────────────────────────────────────────────
const CONFETTI_COLORS = [
  '#10b981', '#34d399', '#f59e0b', '#06b6d4',
  '#f97316', '#84cc16', '#ec4899', '#8b5cf6',
  '#ef4444', '#14b8a6', '#fbbf24', '#a78bfa',
] as const

interface ConfettiPiece {
  id: number
  color: string
  shape: 'circle' | 'square' | 'star' | 'diamond'
  size: number
  angle: number
  velocity: number
  drift: number
  rotation: number
  rotationSpeed: number
}

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    return {
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      shape: Math.random() > 0.5 ? 'circle' : Math.random() > 0.5 ? 'square' : Math.random() > 0.6 ? 'star' : 'diamond',
      size: 6 + Math.random() * 8,
      angle,
      velocity: 120 + Math.random() * 200,
      drift: (Math.random() - 0.5) * 80,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 720,
    }
  })
}

const confettiPieces = generateConfetti(150)

function ConfettiBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {confettiPieces.map((piece) => {
        const tx = Math.cos(piece.angle) * piece.velocity + piece.drift
        const ty = Math.sin(piece.angle) * piece.velocity * -1 + 280 // gravity pull down

        return (
          <motion.div
            key={piece.id}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 1,
              rotate: piece.rotation,
            }}
            animate={{
              x: tx,
              y: ty,
              scale: [0, 1.2, 1, 0],
              opacity: [0, 1, 1, 0],
              rotate: piece.rotation + piece.rotationSpeed,
            }}
            transition={{
              duration: 1.8 + Math.random() * 0.6,
              delay: 0.2 + piece.id * 0.018,
              ease: [0.25, 0.46, 0.45, 0.94] as const,
            }}
          >
            <div
              className={
                piece.shape === 'circle'
                  ? 'rounded-full'
                  : piece.shape === 'star'
                    ? 'r27-sparkle-trail'
                    : piece.shape === 'diamond'
                      ? 'rotate-45 r27-sparkle-trail'
                      : 'rounded-sm'
              }
              style={{
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
              }}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Animated Checkmark SVG ─────────────────────────────────────────
function AnimatedCheckmark() {
  return (
    <motion.div
      animate={{ scale: [1, 1.12, 1], rotate: [0, 2, -2, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
    >
      <svg
        viewBox="0 0 52 52"
        className="w-14 h-14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circle */}
        <motion.circle
          cx="26"
          cy="26"
          r="24"
          stroke="white"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' as const }}
        />
        {/* Check path */}
        <motion.path
          d="M15 27l8 8 14-16"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.65, ease: [0.65, 0, 0.35, 1] as const }}
        />
      </svg>
    </motion.div>
  )
}

// ─── Order Progress Steps ──────────────────────────────────────────
const orderSteps = [
  { label: 'Pedido recebido', icon: CreditCard },
  { label: 'Pagamento confirmado', icon: CircleCheckBig },
  { label: 'Em preparação', icon: Package },
  { label: 'Em transporte', icon: Truck },
  { label: 'Entregue', icon: CircleCheckBig },
]

function OrderProgressSteps() {
  return (
    <div className="flex items-center justify-between w-full px-2">
      {orderSteps.map((step, idx) => {
        const Icon = step.icon
        return (
          <div key={step.label} className="flex flex-col items-center flex-1 relative">
            {/* Connecting line */}
            {idx < orderSteps.length - 1 && (
              <div className="absolute top-3 left-[calc(50%+14px)] right-[calc(-50%+14px)] h-[2px] bg-border -z-0">
                <motion.div
                  className="h-full bg-primary origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 1.5 + idx * 0.3,
                    ease: 'easeOut',
                  }}
                />
              </div>
            )}

            {/* Step dot */}
            <motion.div
              className="relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center"
              initial={{
                scale: 0,
                borderColor: 'var(--border)',
                backgroundColor: 'transparent',
              }}
              animate={{
                scale: 1,
                borderColor: idx === 0 ? 'var(--primary)' : 'var(--border)',
                backgroundColor: idx === 0 ? 'var(--primary)' : 'transparent',
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: 1.3 + idx * 0.3,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: 1.4 + idx * 0.3,
                }}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    idx === 0 ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                />
              </motion.div>
            </motion.div>

            {/* Step label */}
            <motion.p
              className="text-[10px] text-muted-foreground mt-1.5 text-center leading-tight"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1.5 + idx * 0.3 }}
            >
              {step.label}
            </motion.p>
          </div>
        )
      })}
    </div>
  )
}

// ─── Stagger child wrapper ─────────────────────────────────────────
const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 1.4 },
  },
} as const

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
} as const

// ─── Floating celebration particles ───────────────────────────────
function CelebrationParticles() {
  const stars = [
    { x: '10%', y: '15%', delay: 0, color: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
    { x: '85%', y: '20%', delay: 1, color: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
    { x: '20%', y: '75%', delay: 2, color: 'linear-gradient(135deg, #34d399, #10b981)' },
    { x: '78%', y: '70%', delay: 3, color: 'linear-gradient(135deg, #f472b6, #ec4899)' },
    { x: '50%', y: '10%', delay: 4, color: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' },
  ]
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: s.x, top: s.y, width: 8, height: 8 }}
          animate={{
            y: [0, -20, 0],
            x: [0, 8, -6, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.3, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut' as const,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M4 0l1 3h3l-2.5 2 1 3L4 6 1.5 8l1-3L0 3h3z" fill={s.color} />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

function AnimatedOrderNumber({ orderNumber }: { orderNumber: string }) {
  const [displayNumber, setDisplayNumber] = useState('')
  const fullNumber = `#${orderNumber}`

  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      idx++
      setDisplayNumber(fullNumber.slice(0, idx))
      if (idx >= fullNumber.length) clearInterval(interval)
    }, 80)
    return () => clearInterval(interval)
  }, [orderNumber])

  return (
    <motion.span
      className="font-mono text-sm inline-block"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, type: 'spring' as const, stiffness: 300, damping: 20 }}
    >
      {displayNumber}<motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3 }}
        className="inline-block w-[2px] h-[14px] bg-primary align-middle ml-0.5 r27-cursor-blink"
      />
    </motion.span>
  )
}

// ─── Main Component ────────────────────────────────────────────────
export function OrderSuccess({
  orderNumber,
  items,
  subtotal,
  deliveryFee,
  discount,
  total,
  paymentMethod,
  deliveryType,
  estimatedDelivery,
}: OrderSuccessProps) {
  const { navigate } = useAppStore()
  const [showPixQR, setShowPixQR] = useState(false)
  const isPix = paymentMethod === 'pix' || paymentMethod === 'PIX'

  // Estimated delivery countdown timer
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    // Parse estimated delivery text (e.g. '30-45 min' or '2 dias') to calculate countdown
    const match = estimatedDelivery.match(/(\d+)-(\d+)\s*(min|dia|h)/i)
    const estimatedMs = match
      ? (() => {
          const low = parseInt(match[1])
          const unit = match[3].toLowerCase()
          const mult = unit === 'min' ? 60000 : unit === 'h' ? 3600000 : 86400000
          return low * mult
        })()
      : 30 * 60000 // default 30min
    const endTime = Date.now() + estimatedMs

    const tick = () => {
      const diff = Math.max(0, endTime - Date.now())
      setCountdown({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [estimatedDelivery])

  const handleShare = async () => {
    const shareData = {
      title: 'Pedido confirmado!',
      text: `🛒 Pedido #${orderNumber}\n💰 Total: ${formatBRL(total)}\n⏰ Previsão: ${estimatedDelivery}\n\nAcompanhe no DomPlace!`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success('Compartilhando pedido...')
        return
      } catch (err) {
        // User cancelled or not supported, fall through
        if (err instanceof Error && err.name === 'AbortError') return
      }
    }
    // Fallback: WhatsApp
    handleShareWhatsApp()
  }

  const handleShareWhatsApp = () => {
    const message = `🛒 Pedido confirmado no DomPlace!\n\n📦 Pedido #${orderNumber}\n💰 Total: ${formatBRL(total)}\n⏰ Previsão: ${estimatedDelivery}\n\nAcompanhe seu pedido no app!`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
    toast.success('Compartilhando no WhatsApp...')
  }

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber)
    toast.success(`Pedido #${orderNumber} copiado!`)
  }

  const paymentLabels: Record<string, string> = {
    pix: 'Pix',
    PIX: 'Pix',
    credit: 'Cartão de Crédito',
    CREDIT_CARD: 'Cartão de Crédito',
    boleto: 'Boleto',
    cash: 'Dinheiro',
    CASH_ON_DELIVERY: 'Dinheiro',
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-28 md:pb-8 relative">
      {/* Floating celebration particles */}
      <CelebrationParticles />
      {/* ── Success checkmark with confetti & glow ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mt-8 mb-6"
      >
        {/* Confetti burst */}
        <ConfettiBurst />

        {/* Pulsing emerald glow rings */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-3 rounded-full bg-emerald-400/25 blur-md"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.25, 0, 0.25],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="absolute -inset-6 rounded-full bg-emerald-400/15 blur-lg"
        />
        <motion.div
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.12, 0, 0.12],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="absolute -inset-10 rounded-full bg-emerald-400/10 blur-xl"
        />

        {/* Main circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ type: 'spring' as const, stiffness: 260, damping: 12 }}
          className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl r18-checkmark-circle r27-check-ring-expand r36-check-bounce"
        >
          <AnimatedCheckmark />
        </motion.div>
      </motion.div>

      {/* ── Title ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl font-bold text-shadow-sm">Pedido Confirmado! 🎉</h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-1.5"
        >
          <motion.span
            className="font-mono text-sm inline-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, type: 'spring' as const, stiffness: 300, damping: 20 }}
          >
            Pedido #{orderNumber}
          </motion.span>
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.25 }}
          className="mt-2"
        >
          <button
            onClick={handleCopyOrderNumber}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-mono text-sm inline-block">Pedido #{orderNumber}</span>
            <Copy className="h-3 w-3" />
          </button>
        </motion.div>

        {/* Animated typing order number */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35 }}
          className="mt-1"
        >
          <AnimatedOrderNumber orderNumber={orderNumber} />
        </motion.div>
      </motion.div>

      {/* ── Order Progress Steps ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.4 }}
        className="w-full max-w-md mb-5"
      >
        <Card className="border-border/50">
          <CardContent className="p-4 pb-5">
            <h3 className="font-semibold text-xs mb-4 text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ArrowRight className="h-3 w-3" />
              Acompanhamento do Pedido
            </h3>
            <OrderProgressSteps />
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Stagger-revealed order info cards ── */}
      <motion.div
        className="w-full max-w-md space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Estimated delivery */}
        <motion.div variants={staggerItem}>
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border-emerald-200/50 dark:border-emerald-800/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0">
                {deliveryType === 'PICKUP' ? (
                  <MapPin className="h-6 w-6 text-white" />
                ) : (
                  <Truck className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {deliveryType === 'PICKUP' ? 'Pronto para retirada' : 'Previsão de entrega'}
                </p>
                <p className="text-lg font-bold text-primary">{estimatedDelivery}</p>
                {/* Countdown timer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="flex items-center gap-1 mt-0.5"
                >
                  <span className="text-xs font-mono font-bold text-primary tabular-nums r27-countdown-pulse r18-countdown-glow">
                    {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                  </span>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-primary"
                  />
                </motion.div>
                <p className="text-xs text-muted-foreground">
                  {paymentLabels[paymentMethod] || paymentMethod} · {formatBRL(total)}
                </p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Clock className="h-5 w-5 text-primary" />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Summary */}
        <motion.div variants={staggerItem}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Resumo do Pedido
              </h3>
              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{item.quantity}x</span>
                      <span className="text-sm">{item.productName}</span>
                    </div>
                    <span className="font-medium text-sm">{formatBRL(item.total)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Entrega</span>
                  <span>{deliveryFee === 0 ? 'Grátis' : formatBRL(deliveryFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Desconto</span>
                    <span>-{formatBRL(discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <motion.span
                    className="text-primary inline-block"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 18, delay: 2.0 }}
                  >{formatBRL(total)}</motion.span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pix QR Code */}
        {isPix && (
          <motion.div variants={staggerItem}>
            <Card className="border-primary/20 bg-gradient-to-b from-white to-primary/5 dark:from-card dark:to-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm">Pagamento via Pix</h3>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px]">
                    Aguardando pagamento
                  </Badge>
                </div>

                <AnimatePresence mode="wait">
                  {showPixQR ? (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center"
                    >
                      {/* QR Code placeholder */}
                      <div className="w-48 h-48 mx-auto bg-white rounded-xl border-2 border-border/50 flex items-center justify-center mb-3 relative overflow-hidden">
                        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 p-2 gap-[1px]">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div
                              key={i}
                              className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-foreground' : 'bg-transparent'}`}
                            />
                          ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm z-10">
                            <span className="text-primary font-bold text-lg">D</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Escaneie o QR Code ou copie a chave Pix
                      </p>
                      <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                        <code className="text-xs flex-1 truncate font-mono">
                          119998888776@domplace.com
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText('119998888776@domplace.com')
                            toast.success('Chave Pix copiada!')
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs text-muted-foreground"
                        onClick={() => setShowPixQR(false)}
                      >
                        Ocultar QR Code
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowPixQR(true)}
                      className="w-full p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
                    >
                      <QrCode className="h-8 w-8 text-primary/60 mx-auto mb-2 group-hover:text-primary transition-colors" />
                      <p className="text-sm font-medium text-primary">Mostrar QR Code Pix</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Clique para ver o código de pagamento</p>
                    </motion.button>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* ── CTA Buttons with spring entrance ── */}
      <motion.div
        className="w-full max-w-md space-y-3 mt-6"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.15, delayChildren: 2.2 },
          },
        }}
      >
        {/* Acompanhar Pedido */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.9 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: 'spring' as const,
                stiffness: 260,
                damping: 20,
              },
            },
          }}
        >
          <Button
            className="w-full h-12 bg-primary text-primary-foreground font-semibold btn-glow btn-shine gap-2 r18-cta-shimmer r36-cta-shimmer"
            onClick={() => navigate('orders')}
          >
            <Package className="h-4 w-4" />
            Acompanhar Pedido
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {/* Continuar Comprando */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.9 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                },
              },
            }}
          >
            <Button
              variant="outline"
              className="w-full h-11 gap-2 relative overflow-hidden btn-shine r18-cta-shimmer"
              onClick={() => navigate('home')}
            >
              <ShoppingBag className="h-4 w-4" />
              Continuar Comprando
            </Button>
          </motion.div>

          {/* Compartilhar */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.9 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                },
              },
            }}
          >
            <Button
              variant="outline"
              className="w-full h-11 gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/10 relative overflow-hidden btn-shine r18-cta-shimmer"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 r27-icon-rotate" />
              Compartilhar pedido
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
