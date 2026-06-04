'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, PackageX, RotateCcw, TrendingDown, AlertTriangle, HelpCircle, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatBRL } from '@/components/product/ProductCard'
import { Separator } from '@/components/ui/separator'

interface OrderCancelModalProps {
  orderNumber: string
  orderItems: Array<{ name: string; price: number; qty: number }>
  orderTotal: number
  isOpen: boolean
  onClose: () => void
  onCancel: (reason: string) => void
}

// Cancellation reasons
const cancelReasons = [
  { id: 'late', label: 'Demorou muito', desc: 'A entrega está demorando mais que o esperado', icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
  { id: 'wrong', label: 'Produto errado', desc: 'Recebi um produto diferente do que pedi', icon: PackageX, color: 'text-red-600 dark:text-red-400' },
  { id: 'mind', label: 'Mudei de ideia', desc: 'Não quero mais o pedido', icon: RotateCcw, color: 'text-purple-600 dark:text-purple-400' },
  { id: 'cheaper', label: 'Encontrei mais barato', desc: 'Encontrei o mesmo produto por um preço menor', icon: TrendingDown, color: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'damaged', label: 'Produto danificado', desc: 'O produto chegou danificado ou com defeito', icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400' },
  { id: 'other', label: 'Outro', desc: 'Outro motivo não listado', icon: HelpCircle, color: 'text-muted-foreground' },
]

// Confetti particle for success
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{ backgroundColor: color }}
      initial={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, -80 - Math.random() * 60],
        x: [(Math.random() - 0.5) * 120],
        rotate: [0, 360 + Math.random() * 360],
        scale: [1, 0.5],
      }}
      transition={{
        duration: 1.5 + Math.random() * 0.5,
        delay: delay * 0.05,
        ease: 'easeOut',
      }}
    />
  )
}

export function OrderCancelModal({
  orderNumber,
  orderItems,
  orderTotal,
  isOpen,
  onClose,
  onCancel,
}: OrderCancelModalProps) {
  const [step, setStep] = useState(1)
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [otherReasonText, setOtherReasonText] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Reset state when modal closes
  const prevIsOpenRef = useRef(false)
  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      setStep(1)
      setSelectedReason(null)
      setOtherReasonText('')
      setIsSuccess(false)
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen])

  const handleConfirmCancel = useCallback(() => {
    const reasonLabel = cancelReasons.find(r => r.id === selectedReason)?.label || selectedReason
    const finalReason = selectedReason === 'other' ? (otherReasonText || 'Outro') : (reasonLabel || 'Motivo não especificado')

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        const history = JSON.parse(localStorage.getItem('domplace-cancel-history') || '[]')
        history.unshift({
          orderNumber,
          reason: finalReason,
          reasonId: selectedReason,
          cancelledAt: new Date().toISOString(),
          total: orderTotal,
        })
        localStorage.setItem('domplace-cancel-history', JSON.stringify(history.slice(0, 20)))
      } catch { /* ignore */ }
    }

    onCancel(finalReason)
    setIsSuccess(true)

    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 3500)
  }, [selectedReason, otherReasonText, orderNumber, orderTotal, onCancel, onClose])

  const canProceed = selectedReason && (selectedReason !== 'other' || otherReasonText.trim().length > 0)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 r25-modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal content */}
        <motion.div
          className="relative w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border max-h-[85vh] overflow-hidden flex flex-col"
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 40 }}
          transition={{ type: 'spring' as const, stiffness: 350, damping: 30 }}
        >
          {/* Success state */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                className="absolute inset-0 z-50 bg-background flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {/* Confetti particles */}
                {['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'].map((color, i) => (
                  Array.from({ length: 3 }).map((_, j) => (
                    <ConfettiParticle key={`${i}-${j}`} delay={i * 2 + j} color={color} />
                  ))
                )).flat()}

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.2 }}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(16, 185, 129, 0.4)',
                        '0 0 0 16px rgba(16, 185, 129, 0)',
                        '0 0 0 0 rgba(16, 185, 129, 0)',
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </motion.div>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg font-bold mt-4"
                >
                  Pedido Cancelado!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-muted-foreground mt-1 text-center px-8"
                >
                  Seu pedido #{orderNumber} foi cancelado com sucesso
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 bg-emerald-50 dark:bg-emerald-900/15 rounded-xl px-4 py-3 border border-emerald-200/50 dark:border-emerald-800/30"
                >
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    >
                      💰
                    </motion.span>
                    Reembolso em até 7 dias úteis
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                    O valor será creditado na forma de pagamento original
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              {step === 2 && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setStep(1)}
                  className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4" />
                </motion.button>
              )}
              <h2 className="font-bold text-sm">
                {step === 1 ? 'Cancelar Pedido' : 'Confirmar Cancelamento'}
              </h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Progress */}
          <div className="px-4 py-2 shrink-0">
            <div className="flex items-center gap-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <motion.div
                    animate={step >= s ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                      step >= s
                        ? 'bg-red-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s}
                  </motion.div>
                  {s < 2 && (
                    <motion.div
                      className={`h-0.5 flex-1 rounded-full transition-colors ${step >= s ? 'bg-red-500' : 'bg-muted'}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.2 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content - scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs text-muted-foreground mb-3">
                    Selecione o motivo do cancelamento do pedido #{orderNumber}
                  </p>

                  <div className="space-y-2">
                    {cancelReasons.map((reason, idx) => {
                      const isSelected = selectedReason === reason.id
                      const ReasonIcon = reason.icon
                      return (
                        <motion.div
                          key={reason.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setSelectedReason(reason.id)}
                          className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/10 r25-chip-glow'
                              : 'border-border bg-card hover:border-red-300 dark:hover:border-red-800/50'
                          }`}
                          style={
                            isSelected
                              ? { boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.15)' }
                              : undefined
                          }
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              <ReasonIcon className={`h-5 w-5 ${reason.color}`} />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold">{reason.label}</p>
                              <p className="text-[11px] text-muted-foreground">{reason.desc}</p>
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center shrink-0"
                              >
                                <ChevronRight className="h-3 w-3 text-white" />
                              </motion.div>
                            )}
                          </div>

                          {/* Other reason text input */}
                          {isSelected && reason.id === 'other' && (
                            <motion.textarea
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              placeholder="Descreva o motivo do cancelamento..."
                              value={otherReasonText}
                              onChange={(e) => setOtherReasonText(e.target.value)}
                              className="w-full mt-2 p-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
                              rows={2}
                            />
                          )}
                        </motion.div>
                      )
                    })}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4"
                  >
                    <Button
                      className="w-full relative overflow-hidden bg-red-500 hover:bg-red-600 text-white font-bold r25-red-pulse"
                      disabled={!canProceed}
                      onClick={() => setStep(2)}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Continuar
                        <ChevronRight className="h-4 w-4" />
                      </span>
                      {/* Shimmer sweep */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-amber-50 dark:bg-amber-900/15 rounded-xl p-3 border border-amber-200/50 dark:border-amber-800/30 mb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 r25-warning-glow" />
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                        Esta ação não pode ser desfeita
                      </p>
                    </div>
                  </div>

                  {/* Order summary */}
                  <Card className="border-border mb-4">
                    <CardContent className="p-3">
                      <p className="text-xs font-semibold mb-2 text-muted-foreground">
                        Resumo do pedido #{orderNumber}
                      </p>
                      <div className="space-y-1.5">
                        {orderItems.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.qty}x {item.name}</span>
                            <span className="font-medium">{formatBRL(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatBRL(orderTotal)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reason display */}
                  <div className="bg-secondary/50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Motivo do cancelamento:</p>
                    <p className="text-sm font-semibold">
                      {cancelReasons.find(r => r.id === selectedReason)?.label}
                      {selectedReason === 'other' && `: ${otherReasonText}`}
                    </p>
                  </div>

                  {/* Refund info card — slide in from bottom with delay */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: 'spring' as const, stiffness: 300, damping: 25 }}
                  >
                  <div className="bg-emerald-50 dark:bg-emerald-900/15 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-800/30 mb-4">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      💰 Reembolso em até 7 dias úteis
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                      O valor de {formatBRL(orderTotal)} será creditado na forma de pagamento original
                    </p>
                  </div>
                  </motion.div>

                  {/* Buttons */}
                  <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full gap-2 r25-back-shimmer transition-all"
                    onClick={() => setStep(1)}
                  >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </Button>
                    <Button
                      className="w-full relative overflow-hidden bg-red-500 hover:bg-red-600 text-white font-bold gap-2 r25-red-pulse"
                      onClick={handleConfirmCancel}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Confirmar Cancelamento
                      </span>
                      {/* Shimmer sweep */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
