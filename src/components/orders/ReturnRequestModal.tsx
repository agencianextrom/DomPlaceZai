'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, ArrowLeft, ArrowRight, ChevronRight, CheckCircle2, Upload,
  AlertTriangle, Package, RefreshCw, CreditCard, ShoppingBag,
  Camera, Plus, Minus, CheckCircle, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatBRL } from '@/components/product/ProductCard'
import { Separator } from '@/components/ui/separator'
import { resolveProductImage } from '@/lib/product-images'

interface OrderReturnItem {
  id: string
  name: string
  price: number
  qty: number
  image?: string
}

interface ReturnRequestModalProps {
  orderNumber: string
  orderItems: OrderReturnItem[]
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    items: Array<{ id: string; name: string; qty: number; price: number }>
    reason: string
    refundType: string
    photos: string[]
  }) => void
}

// Return reasons
const returnReasons = [
  { id: 'defect', label: 'Defeito no produto', desc: 'O produto possui defeito de fabricação', icon: AlertTriangle, color: 'text-red-600 dark:text-red-400' },
  { id: 'size', label: 'Tamanho errado', desc: 'O tamanho não serve corretamente', icon: Package, color: 'text-amber-600 dark:text-amber-400' },
  { id: 'mismatch', label: 'Não corresponde à descrição', desc: 'O produto é diferente do que foi anunciado', icon: ShoppingBag, color: 'text-purple-600 dark:text-purple-400' },
  { id: 'damaged', label: 'Produto veio danificado', desc: 'O produto chegou danificado na entrega', icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400' },
  { id: 'dislike', label: 'Não gostei', desc: 'O produto não atendeu minhas expectativas', icon: RefreshCw, color: 'text-muted-foreground' },
]

// Refund options
const refundOptions = [
  { id: 'refund', label: 'Devolução', desc: 'Reembolso total do valor pago', icon: RefreshCw, color: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'exchange', label: 'Troca', desc: 'Trocar por outro tamanho ou produto', icon: Package, color: 'text-amber-600 dark:text-amber-400' },
  { id: 'credit', label: 'Crédito na loja', desc: 'Receber crédito para compras futuras', icon: CreditCard, color: 'text-primary' },
]

// Floating particle
function FloatingParticle({ delay }: { delay: number }) {
  const emojis = ['📦', '📋', '↩️', '💰', '✅']
  const emoji = emojis[Math.floor(delay) % emojis.length]
  return (
    <motion.span
      className="absolute text-base pointer-events-none select-none"
      style={{ top: `${10 + (delay * 17) % 75}%`, left: `${5 + (delay * 21) % 90}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.3, 0],
        scale: [0.5, 1, 0.5],
        y: [0, -15, -30],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatDelay: delay * 0.6,
        ease: 'easeInOut',
      }}
    >
      {emoji}
    </motion.span>
  )
}

// Confetti particle for success
function SuccessConfetti({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-sm"
      style={{ backgroundColor: color }}
      initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, -60 - Math.random() * 40],
        x: [(Math.random() - 0.5) * 100],
        rotate: [0, 270],
      }}
      transition={{ duration: 1.2 + Math.random() * 0.3, delay: delay * 0.04, ease: 'easeOut' }}
    />
  )
}

export function ReturnRequestModal({
  orderNumber,
  orderItems,
  isOpen,
  onClose,
  onSubmit,
}: ReturnRequestModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map())
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [refundType, setRefundType] = useState<string | null>(null)
  const [photoSlots, setPhotoSlots] = useState<string[]>(['', '', '', ''])
  const [isSuccess, setIsSuccess] = useState(false)

  const totalSteps = 5

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setSelectedItems(new Map())
      setSelectedReason(null)
      setRefundType(null)
      setPhotoSlots(['', '', '', ''])
      setIsSuccess(false)
    }
  }, [isOpen])

  // Toggle item selection
  const toggleItem = (item: OrderReturnItem) => {
    const newMap = new Map(selectedItems)
    if (newMap.has(item.id)) {
      newMap.delete(item.id)
    } else {
      newMap.set(item.id, 1)
    }
    setSelectedItems(newMap)
  }

  // Update return qty for an item
  const updateReturnQty = (itemId: string, qty: number) => {
    const newMap = new Map(selectedItems)
    if (qty <= 0) {
      newMap.delete(itemId)
    } else {
      newMap.set(itemId, qty)
    }
    setSelectedItems(newMap)
  }

  // Simulate photo upload
  const handlePhotoUpload = (index: number) => {
    const newSlots = [...photoSlots]
    newSlots[index] = `foto-${Date.now()}-${index}.jpg`
    setPhotoSlots(newSlots)
  }

  // Simulate photo removal
  const handlePhotoRemove = (index: number) => {
    const newSlots = [...photoSlots]
    newSlots[index] = ''
    setPhotoSlots(newSlots)
  }

  // Calculate refund amount
  const refundAmount = useMemo(() => {
    let total = 0
    selectedItems.forEach((qty, itemId) => {
      const item = orderItems.find(i => i.id === itemId)
      if (item) total += item.price * qty
    })
    return total
  }, [selectedItems, orderItems])

  const selectedItemsList = useMemo(() => {
    const list: Array<{ id: string; name: string; qty: number; price: number }> = []
    selectedItems.forEach((qty, itemId) => {
      const item = orderItems.find(i => i.id === itemId)
      if (item) list.push({ id: itemId, name: item.name, qty, price: item.price })
    })
    return list
  }, [selectedItems, orderItems])

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 1: return selectedItems.size > 0
      case 2: return !!selectedReason
      case 3: return !!refundType
      case 4: return true
      default: return true
    }
  }

  const handleSubmit = () => {
    const reasonLabel = returnReasons.find(r => r.id === selectedReason)?.label || ''
    const refundLabel = refundOptions.find(r => r.id === refundType)?.label || ''

    onSubmit({
      items: selectedItemsList,
      reason: reasonLabel,
      refundType: refundLabel,
      photos: photoSlots.filter(Boolean) as string[],
    })

    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 4000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Glassmorphism overlay */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal content */}
        <motion.div
          className="relative w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
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
                {/* Confetti */}
                {['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map((color, i) =>
                  Array.from({ length: 4 }).map((_, j) => (
                    <SuccessConfetti key={`${i}-${j}`} delay={i * 2 + j} color={color} />
                  ))
                ).flat()}

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.2 }}
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
                  Solicitação Enviada!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-muted-foreground mt-1 text-center px-8"
                >
                  Sua solicitação de devolução para o pedido #{orderNumber} foi registrada
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 bg-emerald-50 dark:bg-emerald-900/15 rounded-xl px-4 py-3 border border-emerald-200/50 dark:border-emerald-800/30"
                >
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Resolução estimada: 3-5 dias úteis
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                    Você receberá atualizações sobre o progresso
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating particles background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[0, 1, 2, 3, 4].map(i => (
              <FloatingParticle key={i} delay={i * 0.8} />
            ))}
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentStep(s => s - 1)}
                  className="h-8 w-8 rounded-full min-h-[44px] min-w-[44px] hover:bg-secondary flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4" />
                </motion.button>
              )}
              <h2 className="font-bold text-sm r30-modal-shimmer">Solicitar Devolução</h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="h-8 w-8 rounded-full min-h-[44px] min-w-[44px] hover:bg-secondary flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Progress indicator */}
          <div className="relative z-10 px-4 py-2 shrink-0">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }).map((_, s) => (
                <div key={s} className="flex items-center flex-1">
                  <motion.div
                    animate={currentStep >= s + 1 ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                      currentStep >= s + 1
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === s + 1
                          ? 'bg-primary/20 text-primary border-2 border-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > s + 1 ? <CheckCircle className="h-3 w-3" /> : s + 1}
                  </motion.div>
                  {s < totalSteps - 1 && (
                    <motion.div
                      className={`h-0.5 flex-1 rounded-full transition-colors ${
                        currentStep > s + 1 ? 'bg-primary' : 'bg-muted'
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.1 }}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              Pedido #{orderNumber}
            </p>
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 py-3">
            <AnimatePresence mode="wait">
              {/* Step 1: Select items */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-sm font-semibold mb-1">Selecione os itens para devolução</h3>
                  <p className="text-xs text-muted-foreground mb-3">Escolha quais itens deseja devolver</p>

                  <div className="space-y-2">
                    {orderItems.map((item, idx) => {
                      const isSelected = selectedItems.has(item.id)
                      const returnQty = selectedItems.get(item.id) || 0
                      const imgUrl = resolveProductImage({ category: '' })

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => toggleItem(item)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card hover:border-primary/30'
                          }`}
                          whileHover={{ scale: 1.01 }}
                        >
                          {/* Checkbox */}
                          <motion.div
                            animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                            className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/30'
                            }`}
                          >
                            {isSelected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <CheckCircle className="h-3 w-3 text-white" />
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Item image */}
                          <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          {/* Item details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatBRL(item.price)} · Qtd: {item.qty}
                            </p>
                          </div>

                          {/* Quantity selector */}
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-1.5 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => updateReturnQty(item.id, returnQty - 1)}
                                className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center hover:bg-secondary/80"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-bold w-6 text-center">{returnQty}</span>
                              <button
                                onClick={() => updateReturnQty(item.id, Math.min(returnQty + 1, item.qty))}
                                className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center hover:bg-secondary/80"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Reason */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-sm font-semibold mb-1">Motivo da devolução</h3>
                  <p className="text-xs text-muted-foreground mb-3">Nos conte por que deseja devolver</p>

                  <div className="space-y-2">
                    {returnReasons.map((reason, idx) => {
                      const isSelected = selectedReason === reason.id
                      const Icon = reason.icon
                      return (
                        <motion.div
                          key={reason.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => setSelectedReason(reason.id)}
                          whileHover={{ scale: 1.02 }}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all r30-reason-lift ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card hover:border-primary/30'
                          }`}
                          style={
                            isSelected
                              ? { boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.15)' }
                              : undefined
                          }
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${reason.color}`} />
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{reason.label}</p>
                              <p className="text-[11px] text-muted-foreground">{reason.desc}</p>
                            </div>
                            {isSelected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <CheckCircle className="h-5 w-5 text-primary" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Refund type */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-sm font-semibold mb-1">Opções de reembolso</h3>
                  <p className="text-xs text-muted-foreground mb-3">Escolha como deseja receber o reembolso</p>

                  <div className="space-y-2">
                    {refundOptions.map((option, idx) => {
                      const isSelected = refundType === option.id
                      const Icon = option.icon
                      return (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => setRefundType(option.id)}
                          whileHover={{ scale: 1.02 }}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card hover:border-primary/30'
                          }`}
                          style={
                            isSelected
                              ? { boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.15)' }
                              : undefined
                          }
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${option.color}`} />
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{option.label}</p>
                              <p className="text-[11px] text-muted-foreground">{option.desc}</p>
                            </div>
                            {isSelected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <CheckCircle className="h-5 w-5 text-primary" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Refund amount */}
                  <div className="mt-4 bg-primary/5 rounded-xl p-3 border border-primary/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Valor do reembolso:</span>
                      <span className="font-bold text-primary text-lg">{formatBRL(refundAmount)}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Photos */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-sm font-semibold mb-1">Adicionar fotos</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Fotos ajudam a agilizar a análise (opcional)
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {photoSlots.map((photo, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all r30-photo-pulse ${
                          photo
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/30 hover:border-primary/40'
                        }`}
                        onClick={() => photo ? handlePhotoRemove(index) : handlePhotoUpload(index)}
                      >
                        {photo ? (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-1"
                          >
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                            <span className="text-[10px] text-primary font-semibold">Foto adicionada</span>
                            <span className="text-[9px] text-destructive">Toque para remover</span>
                          </motion.div>
                        ) : (
                          <>
                            <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground">Adicionar foto</span>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Confirmation */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-sm font-semibold mb-1">Resumo da solicitação</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Verifique os dados antes de enviar
                  </p>

                  <Card className="border-border mb-3">
                    <CardContent className="p-3 space-y-3">
                      {/* Items */}
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold mb-1.5">ITENS</p>
                        {selectedItemsList.map(item => (
                          <div key={item.id} className="flex justify-between text-xs py-0.5">
                            <span>{item.qty}x {item.name}</span>
                            <span className="font-medium">{formatBRL(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      {/* Reason */}
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold mb-1">MOTIVO</p>
                        <p className="text-xs font-medium">
                          {returnReasons.find(r => r.id === selectedReason)?.label}
                        </p>
                      </div>
                      <Separator />
                      {/* Refund type */}
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold mb-1">TIPO DE REEMBOLSO</p>
                        <p className="text-xs font-medium">
                          {refundOptions.find(r => r.id === refundType)?.label}
                        </p>
                      </div>
                      <Separator />
                      {/* Total */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold">Total do reembolso</span>
                        <span className="font-bold text-primary">{formatBRL(refundAmount)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Estimated time */}
                  <div className="bg-amber-50 dark:bg-amber-900/15 rounded-xl p-3 border border-amber-200/50 dark:border-amber-800/30">
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Prazo estimado: 3-5 dias úteis
                    </p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                      Após a aprovação, o reembolso será processado
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer with navigation */}
          <div className="relative z-10 px-4 py-3 border-t border-border shrink-0">
            <div className="flex gap-2">
              {currentStep < totalSteps && (
                <Button
                  className="flex-1 relative overflow-hidden bg-primary hover:bg-primary/90 font-bold gap-2"
                  disabled={!canGoNext()}
                  onClick={() => setCurrentStep(s => s + 1)}
                >
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    {currentStep === totalSteps - 1 ? 'Revisar' : 'Próximo'}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                  {canGoNext() && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </Button>
              )}

              {currentStep === totalSteps && (
                <Button
                  className="flex-1 relative overflow-hidden bg-primary hover:bg-primary/90 font-bold gap-2 r30-submit-glow"
                  onClick={handleSubmit}
                >
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <ChevronRight className="h-4 w-4" />
                    Enviar Solicitação
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </Button>
              )}

              {currentStep === 1 && (
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
