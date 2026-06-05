'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, Package, Timer, Truck, PackageCheck,
  Clock, Phone, MessageCircle, Star, MapPin, ChevronDown,
  ShoppingCart, Utensils, Flame, User, ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'

interface TimelineStep {
  id: string
  title: string
  description: string
  timestamp: string
  status: 'completed' | 'current' | 'pending'
  icon: React.ReactNode
  detail?: string
}

interface OrderTimelineProps {
  orderNumber?: string
  status?: string
  estimatedMinutes?: number
  driverName?: string
  driverPhone?: string
  driverRating?: number
  driverVehicle?: string
  storeName?: string
  createdAt?: string
}

const stepIcons: Record<string, React.ReactNode> = {
  placed: <ShoppingCart className="h-5 w-5" />,
  confirmed: <CheckCircle2 className="h-5 w-5" />,
  preparing: <Utensils className="h-5 w-5" />,
  ready: <Flame className="h-5 w-5" />,
  delivering: <Truck className="h-5 w-5" />,
  delivered: <PackageCheck className="h-5 w-5" />,
}

const allSteps = [
  { id: 'placed', title: 'Pedido Realizado', description: 'Seu pedido foi enviado com sucesso!', detail: 'Recebemos seu pedido' },
  { id: 'confirmed', title: 'Confirmado', description: 'A loja confirmou seu pedido.', detail: 'Pagamento aprovado' },
  { id: 'preparing', title: 'Preparando', description: 'A loja está preparando seus itens com carinho.', detail: 'Montagem do pedido' },
  { id: 'ready', title: 'Pronto para Entrega', description: 'Pedido pronto! Aguardando entregador.', detail: 'Saiu da cozinha' },
  { id: 'delivering', title: 'A Caminho', description: 'Seu pedido está a caminho!', detail: 'Entregador em rota' },
  { id: 'delivered', title: 'Entregue', description: 'Pedido entregue com sucesso. Aproveite!', detail: 'Entrega concluída' },
]

const statusToStepIndex: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  READY: 3,
  DELIVERING: 4,
  DELIVERED: 5,
  CANCELLED: -1,
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Agora mesmo'
  if (mins < 60) return `Há ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Há ${hours}h`
  return `Há ${Math.floor(hours / 24)} dias`
}

function generateTimestamps(createdAt: string, currentStepIdx: number): string[] {
  const base = new Date(createdAt).getTime()
  return allSteps.map((_, i) => {
    if (i <= currentStepIdx) {
      const stepTime = new Date(base + i * 8 * 60000) // 8 min per step
      return stepTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
    return ''
  })
}

// Countdown timer component
function CountdownTimer({ minutes }: { minutes: number }) {
  const [remaining, setRemaining] = useState(minutes)

  useEffect(() => {
    if (remaining <= 0) return
    const interval = setInterval(() => {
      setRemaining(prev => Math.max(0, prev - 1))
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [remaining])

  const displayMin = remaining >= 60 ? `${Math.floor(remaining / 60)}h ${remaining % 60}min` : `${remaining} min`

  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <Timer className="h-4 w-4 text-primary" />
      </motion.div>
      <div>
        <p className="text-xs font-bold text-primary">{displayMin}</p>
        <p className="text-[9px] text-muted-foreground">estimativa restante</p>
      </div>
    </div>
  )
}

// Simulated real-time update dot
function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="h-2 w-2 rounded-full bg-emerald-500"
      />
      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Ao vivo</span>
    </div>
  )
}

export function OrderTimeline({
  orderNumber,
  status = 'CONFIRMED',
  estimatedMinutes = 30,
  driverName,
  driverPhone,
  driverRating = 4.8,
  driverVehicle = 'Moto',
  storeName = 'Loja',
  createdAt = new Date().toISOString(),
}: OrderTimelineProps) {
  const [showDriverCard, setShowDriverCard] = useState(true)
  const { trackingData } = useAppStore()

  const currentStepIdx = useMemo(() => statusToStepIndex[status] ?? 0, [status])

  // Simulated real-time progress animation
  const [simProgress, setSimProgress] = useState(0)
  useEffect(() => {
    if (status === 'DELIVERED' || status === 'CANCELLED') return
    const interval = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 100) return 0
        return prev + 0.5
      })
    }, 100)
    return () => clearInterval(interval)
  }, [status])

  const timestamps = useMemo(() => generateTimestamps(createdAt, currentStepIdx), [createdAt, currentStepIdx])

  const steps: TimelineStep[] = useMemo(() => {
    return allSteps.map((step, i) => ({
      ...step,
      timestamp: timestamps[i] || '',
      status: i < currentStepIdx ? 'completed' : i === currentStepIdx ? 'current' : 'pending',
      icon: stepIcons[step.id],
    }))
  }, [currentStepIdx, timestamps])

  // Use real tracking data if available
  const eta = trackingData?.eta ?? estimatedMinutes
  const realDriverName = trackingData?.driverName || driverName
  const realDriverVehicle = trackingData?.driverVehicle || driverVehicle

  if (status === 'CANCELLED') {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <Circle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Pedido Cancelado</p>
            <p className="text-xs text-muted-foreground">Este pedido foi cancelado</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main timeline card */}
      <Card className="overflow-hidden border-primary/20 r62-card-lift">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold flex items-center gap-2 r62-heading-gradient">
                <Clock className="h-4 w-4 text-primary" />
                Acompanhar Pedido
              </h3>
              {orderNumber && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  #{orderNumber}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              {status !== 'DELIVERED' && <LiveIndicator />}
              {status !== 'DELIVERED' && <CountdownTimer minutes={eta} />}
            </div>
          </div>

          {/* Animated progress bar */}
          <div className="mb-4">
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-emerald-500 to-emerald-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStepIdx / (allSteps.length - 1)) * 100}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              {/* Shimmer effect on progress */}
              {status !== 'DELIVERED' && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{ width: '30%' }}
                  animate={{ left: ['-30%', '130%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted-foreground">Pedido feito</span>
              <span className="text-[9px] text-muted-foreground">Entrega</span>
            </div>
          </div>

          {/* Timeline steps */}
          <div className="relative">
            {steps.map((step, idx) => {
              const isCompleted = step.status === 'completed'
              const isCurrent = step.status === 'current'
              const isLast = idx === steps.length - 1
              const lineActive = isCompleted || isCurrent

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.12, duration: 0.4 }}
                  className="flex gap-3"
                >
                  {/* Icon + connector line */}
                  <div className="flex flex-col items-center">
                    {/* Step icon */}
                    <motion.div
                      className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                          : isCurrent
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-muted text-muted-foreground'
                      }`}
                      animate={isCurrent ? {
                        boxShadow: [
                          '0 0 0 0 rgba(16,185,129,0.4)',
                          '0 0 0 8px rgba(16,185,129,0)',
                          '0 0 0 0 rgba(16,185,129,0)',
                        ],
                      } : {}}
                      transition={isCurrent ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
                    >
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        step.icon
                      )}
                    </motion.div>

                    {/* Connector line */}
                    {!isLast && (
                      <div className="w-0.5 flex-1 min-h-[36px] relative overflow-hidden">
                        <div className="absolute inset-0 bg-border rounded-full" />
                        {lineActive && (
                          <motion.div
                            className="absolute inset-0 bg-emerald-500 rounded-full"
                            initial={{ height: '0%' }}
                            animate={{ height: '100%' }}
                            transition={{ duration: 0.6, delay: idx * 0.15 + 0.3, ease: 'easeOut' }}
                          />
                        )}
                        {/* Pulse on current step */}
                        {isCurrent && (
                          <motion.div
                            className="absolute left-0 right-0 h-3 bg-gradient-to-b from-emerald-400/50 to-transparent rounded-full"
                            animate={{ y: [0, 30, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-semibold ${
                        isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isCurrent
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </h4>
                      {isCurrent && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full"
                        >
                          Agora
                        </motion.span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 leading-relaxed ${
                      isCompleted || isCurrent ? 'text-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {step.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {step.timestamp && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {step.timestamp}
                        </p>
                      )}
                      {step.detail && (isCompleted || isCurrent) && (
                        <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4">
                          {step.detail}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Driver info card - shown for delivering/preparing orders */}
      <AnimatePresence>
        {showDriverCard && (status === 'DELIVERING' || status === 'PREPARING') && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Card className="border-primary/20 overflow-hidden r62-card-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold">Entregador</h3>
                  {status === 'DELIVERING' && <LiveIndicator />}
                </div>

                <div className="flex items-center gap-3">
                  {/* Driver photo placeholder */}
                  <motion.div
                    animate={status === 'DELIVERING' ? { boxShadow: ['0 0 0 0 rgba(16,185,129,0.3)', '0 0 0 6px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0.3)'] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center shrink-0 border-2 border-primary/20"
                  >
                    <span className="text-lg font-bold text-primary">
                      {(realDriverName || 'E').charAt(0)}
                    </span>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{realDriverName || 'Aguardando entregador'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-medium">{driverRating.toFixed(1)}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{realDriverVehicle}</span>
                    </div>

                    {/* Contact buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        className="h-7 min-h-[44px] text-[10px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={!realDriverName}
                      >
                        <Phone className="h-3 w-3" />
                        Ligar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 min-h-[44px] text-[10px] gap-1 border-primary/30"
                        disabled={!realDriverName}
                      >
                        <MessageCircle className="h-3 w-3" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Estimated arrival info */}
                {status === 'DELIVERING' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-border/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs font-semibold">Entrega estimada</p>
                          <p className="text-[10px] text-muted-foreground">{eta} minutos restantes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowDown className="h-3 w-3 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Aproximando</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
