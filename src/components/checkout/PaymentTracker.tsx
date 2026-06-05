'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode, CreditCard, Banknote, Copy, Check, Clock,
  ChevronDown, ChevronUp, Coins, Wallet, Shield, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

/* ─── Constants ─────────────────────────────────────────── */
const PIX_EXPIRY_SECONDS = 15 * 60 // 15 minutes

type PaymentTab = 'pix' | 'card' | 'cash'

type PixStatus = 'aguardando' | 'processando' | 'confirmado'

interface InstallmentOption {
  count: number
  label: string
  multiplier: number
  hasInterest: boolean
}

const installmentOptions: InstallmentOption[] = [
  { count: 1, label: '1x', multiplier: 1, hasInterest: false },
  { count: 2, label: '2x', multiplier: 1, hasInterest: false },
  { count: 3, label: '3x', multiplier: 1, hasInterest: false },
  { count: 6, label: '6x', multiplier: 1.0381, hasInterest: true },
  { count: 12, label: '12x', multiplier: 1.0858, hasInterest: true },
]

const pixStatusConfig: Record<PixStatus, { label: string; color: string; icon: typeof QrCode }> = {
  aguardando: { label: 'Aguardando Pagamento', color: 'text-amber-500', icon: Clock },
  processando: { label: 'Processando', color: 'text-blue-500', icon: Sparkles },
  confirmado: { label: 'Pagamento Confirmado', color: 'text-emerald-500', icon: Check },
}

const motivationalMessages = [
  'Pagamento rápido e seguro 💚',
  'Quase lá! Finalize para receber seu pedido',
  'Aproveite: entrega grátis acima de R$50',
]

/* ─── Payment Tabs ──────────────────────────────────────── */
const paymentTabs: { id: PaymentTab; label: string; icon: typeof QrCode; desc: string }[] = [
  { id: 'pix', label: 'PIX', icon: QrCode, desc: 'Instantâneo' },
  { id: 'card', label: 'Cartão', icon: CreditCard, desc: 'Crédito' },
  { id: 'cash', label: 'Dinheiro', icon: Banknote, desc: 'Troco' },
]

/* ─── SVG circular progress ─────────────────────────────── */
function CircularProgress({ progress, size = 120, strokeWidth = 6 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="oklch(0.92 0.015 120)" strokeWidth={strokeWidth} className="dark:stroke-oklch(0.30 0.02 150)" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="oklch(0.45 0.1 155)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  )
}

/* ─── PIX QR Placeholder with Scan Line ─────────────────── */
function PixQRPlaceholder() {
  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* QR-like grid */}
      <div className="absolute inset-0 rounded-xl bg-white border border-border overflow-hidden">
        <div className="grid grid-cols-8 grid-rows-8 gap-0.5 p-3">
          {Array.from({ length: 64 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: Math.random() > 0.35 ? 1 : 0.15 }}
              transition={{ delay: i * 0.015, duration: 0.3 }}
              className="rounded-[1px]"
              style={{
                backgroundColor: Math.random() > 0.35 ? '#18181b' : 'transparent',
              }}
            />
          ))}
        </div>
        {/* Pulsing scan line */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent"
          animate={{ top: ['8%', '92%', '8%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'drop-shadow(0 0 6px oklch(0.45 0.1 155 / 0.5))' }}
        />
        {/* Corner decorations */}
        <div className="absolute top-1 left-1 w-5 h-5 border-l-2 border-t-2 border-teal-500 rounded-tl-md" />
        <div className="absolute top-1 right-1 w-5 h-5 border-r-2 border-t-2 border-teal-500 rounded-tr-md" />
        <div className="absolute bottom-1 left-1 w-5 h-5 border-l-2 border-b-2 border-teal-500 rounded-bl-md" />
        <div className="absolute bottom-1 right-1 w-5 h-5 border-r-2 border-b-2 border-teal-500 rounded-br-md" />
      </div>
    </div>
  )
}

/* ─── Animated Checkmark ────────────────────────────────── */
function AnimatedCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 15 }}
      className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto shadow-[0_0_24px_oklch(0.45_0.1_155/0.35)]"
    >
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25, type: 'spring' as const, stiffness: 300 }}>
        <Check className="h-12 w-12 text-white" strokeWidth={3} />
      </motion.div>
    </motion.div>
  )
}

/* ─── Card Payment Form ─────────────────────────────────── */
function CardPaymentForm({ total }: { total: number }) {
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [selectedInstallment, setSelectedInstallment] = useState(1)

  const maskCardNumber = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }, [])

  const maskExpiry = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }, [])

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(maskCardNumber(e.target.value))
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardExpiry(maskExpiry(e.target.value))
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
  }

  const selected = installmentOptions.find((o) => o.count === selectedInstallment)!
  const installmentValue = Math.round((total * selected.multiplier) / selected.count * 100) / 100

  return (
    <div className="space-y-4">
      <div className="glassmorphism-strong rounded-xl p-4 space-y-3">
        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5" />
          Dados do Cartão
        </p>
        <Input
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={handleCardNumberChange}
          className="font-mono text-sm tracking-wider"
          maxLength={19}
        />
        <Input
          placeholder="Nome no cartão"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          className="text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="MM/AA"
            value={cardExpiry}
            onChange={handleExpiryChange}
            className="font-mono text-sm"
            maxLength={5}
          />
          <Input
            placeholder="CVV"
            value={cardCvv}
            onChange={handleCvvChange}
            className="font-mono text-sm"
            type="password"
            maxLength={4}
          />
        </div>
      </div>

      {/* Installment selector */}
      <div className="glassmorphism-strong rounded-xl p-4">
        <p className="text-xs text-muted-foreground font-medium mb-3">Parcelamento</p>
        <div className="space-y-1.5">
          {installmentOptions.map((opt) => {
            const val = Math.round((total * opt.multiplier) / opt.count * 100) / 100
            const isSelected = selectedInstallment === opt.count
            return (
              <motion.button
                key={opt.count}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedInstallment(opt.count)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary/10 border border-primary/25 text-primary'
                    : 'bg-background border border-border hover:border-primary/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{opt.label}</span>
                  {opt.hasInterest && (
                    <Badge variant="secondary" className="text-[9px] bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30 px-1.5 py-0">
                      c/ juros
                    </Badge>
                  )}
                  {!opt.hasInterest && opt.count > 1 && (
                    <Badge variant="secondary" className="text-[9px] bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30 px-1.5 py-0">
                      s/ juros
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">{installmentValue === val ? `${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : `${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
                  {opt.count > 1 && (
                    <p className="text-[10px] text-muted-foreground">
                      Total: {(total * opt.multiplier).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                    className="ml-2"
                  >
                    <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
        {selectedInstallment > 1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-primary font-semibold mt-3 text-center pt-2 border-t border-border/50"
          >
            {selectedInstallment}x de {installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </motion.p>
        )}
      </div>
    </div>
  )
}

/* ─── Cash Payment – Change Calculator ──────────────────── */
function CashPayment({ total }: { total: number }) {
  const [cashGiven, setCashGiven] = useState('')

  const cashAmount = parseFloat(cashGiven) || 0
  const change = Math.max(0, cashAmount - total)
  const hasEnough = cashAmount >= total

  const quickAmounts = [10, 20, 50, 100, 200]
  const coins = [0.01, 0.05, 0.10, 0.25, 0.50, 1, 2, 5, 10, 20, 50, 100]

  return (
    <div className="space-y-4">
      <div className="glassmorphism-strong rounded-xl p-4 space-y-3">
        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <Banknote className="h-3.5 w-3.5" />
          Pagamento na Entrega
        </p>
        <p className="text-sm">Total: <span className="font-bold text-primary">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Valor entregue ao entregador</p>
          <Input
            type="number"
            placeholder="R$ 0,00"
            value={cashGiven}
            onChange={(e) => setCashGiven(e.target.value)}
            className="text-sm font-mono"
            min={0}
            step={0.01}
          />
        </div>

        {/* Quick amount buttons */}
        <div className="flex flex-wrap gap-1.5">
          {quickAmounts.map((amount) => (
            <motion.button
              key={amount}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCashGiven(String(amount))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                parseFloat(cashGiven) === amount
                  ? 'bg-primary/10 border-primary/25 text-primary'
                  : 'bg-background border-border hover:border-primary/15'
              }`}
            >
              R${amount}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Change display with animated coins */}
      {cashAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism-strong rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-4 w-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground">Troco</p>
          </div>
          {hasEnough ? (
            <>
              <motion.p
                key={change}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                className="text-2xl font-bold text-primary mb-3"
              >
                {change.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </motion.p>
              {/* Coin animation breakdown */}
              <div className="flex flex-wrap gap-1">
                {coins
                  .filter((coin) => coin <= change)
                  .reverse()
                  .slice(0, 8)
                  .map((coin, idx) => {
                    const count = Math.floor(change / coin)
                    if (count === 0 || coin > change) return null
                    return (
                      <motion.div
                        key={`${coin}-${idx}`}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 500, damping: 20 }}
                        className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 dark:from-amber-600 dark:to-amber-800 flex items-center justify-center shadow-sm"
                      >
                        <Coins className="h-3.5 w-3.5 text-amber-700 dark:text-amber-200" />
                      </motion.div>
                    )
                  })}
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                Valor insuficiente
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Faltam {(total - cashAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

/* ─── Confetti Particles ────────────────────────────────── */
const confettiColors = ['#10b981', '#f59e0b', '#06b6d4', '#f97316', '#84cc16', '#ec4899']
const confettiShapes = ['●', '■', '▲', '★']

function MiniConfetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2
        const distance = 50 + Math.random() * 70
        const tx = Math.cos(angle) * distance
        const ty = Math.sin(angle) * distance - 25
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
            animate={{ x: tx, y: ty, scale: 0, opacity: 0, rotate: (Math.random() - 0.5) * 720 }}
            transition={{ duration: 1 + Math.random() * 0.5, delay: 0.15 + i * 0.03, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2"
            style={{ color: confettiColors[i % confettiColors.length], fontSize: `${6 + Math.random() * 6}px`, lineHeight: 1 }}
          >
            {confettiShapes[i % confettiShapes.length]}
          </motion.div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PaymentTracker — Main Component
   ═══════════════════════════════════════════════════════════ */
export function PaymentTracker({ amount, onStatusChange }: { amount: number; onStatusChange?: (status: string) => void }) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('pix')
  const [pixStatus, setPixStatus] = useState<PixStatus>('aguardando')
  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState(PIX_EXPIRY_SECONDS)
  const [messageIdx, setMessageIdx] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pixCode = `00020126580014br.gov.bcb.pix0136${Buffer.from('domplace-pix').toString('hex').slice(0, 36)}5204000053039865802BR5925DOMPLACE TECNOLOGIA LTDA6009SAO PAULO62070503***63041D3D`

  /* Countdown timer */
  useEffect(() => {
    if (activeTab !== 'pix' || pixStatus !== 'aguardando') return

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          toast.error('Código PIX expirado! Gere um novo pagamento.')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [activeTab, pixStatus])

  /* Rotating motivational messages */
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % motivationalMessages.length)
    }, 4000)
    return () => clearInterval(msgInterval)
  }, [])

  /* Simulate pix status transitions for demo */
  const handleCopyPixCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      toast.success('Código PIX copiado com sucesso!')
      setTimeout(() => setCopied(false), 2500)

      // Simulate processing after copy
      if (pixStatus === 'aguardando') {
        setTimeout(() => {
          setPixStatus('processando')
          onStatusChange?.('processando')
        }, 3000)
        setTimeout(() => {
          setPixStatus('confirmado')
          onStatusChange?.('confirmado')
        }, 6000)
      }
    } catch {
      toast.error('Erro ao copiar. Tente novamente.')
    }
  }, [pixStatus, onStatusChange, pixCode])

  /* Timer formatting */
  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60
  const countdownPercent = (countdown / PIX_EXPIRY_SECONDS) * 100

  const statusConfig = pixStatusConfig[pixStatus]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
    >
      {/* Glassmorphism card */}
      <Card className="glassmorphism-strong rounded-2xl overflow-hidden border-0 r62-card-lift r91-payment-tracker">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">Acompanhar Pagamento</p>
                <p className="text-[10px] text-muted-foreground">
                  {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
            {/* Rotating message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] text-muted-foreground text-right max-w-[140px]"
              >
                {motivationalMessages[messageIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Payment method tabs */}
          <div className="relative flex bg-secondary/50 rounded-xl p-1 mb-5">
            {paymentTabs.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setActiveTab(tab.id); if (tab.id === 'pix') { setPixStatus('aguardando'); setCountdown(PIX_EXPIRY_SECONDS) } }}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all z-10 ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  <span className="hidden sm:inline text-[10px]">({tab.desc})</span>
                </motion.button>
              )
            })}
            {/* Animated indicator */}
            <motion.div
              layout
              transition={{ type: 'spring' as const, stiffness: 350, damping: 30 }}
              className="absolute top-1 bottom-1 rounded-lg bg-primary shadow-[0_2px_8px_oklch(0.45_0.1_155/0.3)]"
              style={{
                left: activeTab === 'pix' ? '4px' : activeTab === 'card' ? 'calc(33.333% + 2px)' : 'calc(66.666% + 0px)',
                width: 'calc(33.333% - 4px)',
              }}
            />
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'pix' && (
              <motion.div
                key="pix"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PixTab
                  pixStatus={pixStatus}
                  statusConfig={statusConfig}
                  countdown={countdown}
                  minutes={minutes}
                  seconds={seconds}
                  countdownPercent={countdownPercent}
                  copied={copied}
                  pixCode={pixCode}
                  onCopy={handleCopyPixCode}
                />
              </motion.div>
            )}

            {activeTab === 'card' && (
              <motion.div
                key="card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardPaymentForm total={amount} />
              </motion.div>
            )}

            {activeTab === 'cash' && (
              <motion.div
                key="cash"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CashPayment total={amount} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── PIX Tab Content ────────────────────────────────────── */
function PixTab({
  pixStatus,
  statusConfig,
  countdown,
  minutes,
  seconds,
  countdownPercent,
  copied,
  pixCode,
  onCopy,
}: {
  pixStatus: PixStatus
  statusConfig: { label: string; color: string; icon: typeof QrCode }
  countdown: number
  minutes: number
  seconds: number
  countdownPercent: number
  copied: boolean
  pixCode: string
  onCopy: () => void
}) {
  const StatusIcon = statusConfig.icon

  if (pixStatus === 'confirmado') {
    return (
      <div className="text-center py-6 relative">
        <MiniConfetti />
        <AnimatedCheckmark />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-4"
        >
          Pagamento Confirmado!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-muted-foreground mt-1"
        >
          Seu pedido será processado em instantes
        </motion.p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status badge */}
      <motion.div
        animate={{ boxShadow: pixStatus === 'processando' ? '0 0 12px oklch(0.55 0.12 240 / 0.15)' : '0 0 0px transparent' }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border ${
          pixStatus === 'processando'
            ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30'
            : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30'
        }`}
      >
        <motion.div
          animate={pixStatus === 'processando' ? { rotate: 360 } : { scale: [1, 1.1, 1] }}
          transition={pixStatus === 'processando' ? { duration: 1.5, repeat: Infinity, ease: 'linear' } : { duration: 1.5, repeat: Infinity }}
        >
          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
        </motion.div>
        <span className={`text-sm font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
      </motion.div>

      {/* QR Code or processing */}
      {pixStatus === 'aguardando' ? (
        <div className="flex flex-col items-center">
          <PixQRPlaceholder />
          <p className="text-[10px] text-muted-foreground mt-2">
            Escaneie o QR Code ou copie o código abaixo
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-500 dark:border-blue-800 dark:border-t-blue-400"
          />
          <p className="text-sm text-blue-500 font-medium mt-3">Processando pagamento...</p>
        </motion.div>
      )}

      {/* Copy button */}
      {pixStatus === 'aguardando' && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground text-center font-mono truncate px-4">
            {pixCode}
          </p>
          <motion.div whileTap={{ scale: 0.97 }} className="flex justify-center">
            <Button
              onClick={onCopy}
              className={`gap-2 rounded-xl btn-glow ${
                copied
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring' as const }}>
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring' as const }}>
                    <Copy className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
              {copied ? 'Código Copiado!' : 'Copiar código PIX'}
            </Button>
          </motion.div>
        </div>
      )}

      {/* Countdown timer */}
      {pixStatus === 'aguardando' && countdown > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-2 pt-2"
        >
          <div className="relative">
            <CircularProgress progress={countdownPercent} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
                <p className="text-[9px] text-muted-foreground">restantes</p>
              </div>
            </div>
          </div>
          {countdown < 120 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-500 font-medium"
            >
              ⚠️ PIX expirando em breve!
            </motion.p>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default PaymentTracker
