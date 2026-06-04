'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Truck,
  ChefHat,
  Star,
  Navigation,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface DeliveryMapTrackerProps {
  orderStatus: string
  storeAddress?: string
  deliveryAddress?: string
  storeName?: string
  eta?: string
  driverName?: string
  driverPhone?: string
  progress?: number
}

// Delivery step definitions
const deliverySteps = [
  { id: 'confirmed', label: 'Pedido confirmado', icon: CheckCircle, color: 'text-emerald-500' },
  { id: 'preparing', label: 'Preparando', icon: ChefHat, color: 'text-amber-500' },
  { id: 'dispatched', label: 'Saiu para entrega', icon: Truck, color: 'text-blue-500' },
  { id: 'arriving', label: 'Chegando', icon: Navigation, color: 'text-violet-500' },
  { id: 'delivered', label: 'Entregue', icon: Package, color: 'text-emerald-600' },
]

// Map order statuses to step index
const statusToStepIndex: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  READY: 3,
  DELIVERING: 3,
  DELIVERED: 4,
  CANCELLED: -1,
}

export function DeliveryMapTracker({
  orderStatus,
  storeAddress = 'Loja — Centro, Dom Eliseu',
  deliveryAddress = 'Casa — Rua das Flores, 123',
  storeName = 'Loja',
  eta = '~25 min',
  driverName,
  progress: progressProp,
}: DeliveryMapTrackerProps) {
  const currentStepIndex = statusToStepIndex[orderStatus] ?? 0
  const progress = progressProp ?? Math.min(100, Math.round((currentStepIndex / (deliverySteps.length - 1)) * 100))
  const isDelivered = orderStatus === 'DELIVERED'
  const isCancelled = orderStatus === 'CANCELLED'

  // Animated dots along route
  const [animatedDotIndex, setAnimatedDotIndex] = useState(0)
  useEffect(() => {
    if (isDelivered || isCancelled) return
    const interval = setInterval(() => {
      setAnimatedDotIndex(prev => (prev + 1) % 5)
    }, 1200)
    return () => clearInterval(interval)
  }, [isDelivered, isCancelled])

  // Simulated ETA countdown
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  useEffect(() => {
    if (isDelivered || isCancelled) return
    const timer = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [isDelivered, isCancelled])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Visual Map */}
      <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Roads */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/15 -translate-y-1/2" />
          <div className="absolute top-0 bottom-0 left-1/4 w-[2px] bg-white/15" />
          <div className="absolute top-0 bottom-0 right-1/3 w-[2px] bg-white/15" />
          <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-white/10" />
          <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-white/10" />
        </div>

        {/* Animated route path - dashed line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 240" preserveAspectRatio="none">
          {/* Background dashed route */}
          <path
            d="M 60 60 Q 150 60 200 120 Q 250 180 340 180"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="3"
            strokeDasharray="8 6"
          />
          {/* Active route */}
          <motion.path
            d="M 60 60 Q 150 60 200 120 Q 250 180 340 180"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="3"
            strokeDasharray="8 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </svg>

        {/* Pickup pin */}
        <div className="absolute top-[20%] left-[12%]">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white relative">
              <MapPin className="h-5 w-5 text-white" />
              <motion.div
                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[9px] bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                {storeName}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Delivery destination pin */}
        <div className="absolute bottom-[18%] right-[14%]">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg border-2 border-white relative">
              <MapPin className="h-5 w-5 text-white fill-white" />
              <motion.div
                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[9px] bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                Destino
              </span>
            </div>
          </motion.div>
        </div>

        {/* Animated delivery vehicle */}
        {!isDelivered && !isCancelled && (
          <motion.div
            className="absolute"
            animate={{
              left: `${15 + (progress / 100) * 60}%`,
              top: `${20 + (progress / 100) * 45}%`,
            }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          >
            <div className="relative">
              <div className="h-11 w-11 rounded-full bg-amber-500 flex items-center justify-center shadow-xl border-2 border-white z-10 relative">
                <Truck className="h-5 w-5 text-white" />
              </div>
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-amber-400"
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-amber-300"
                animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Animated dots along route */}
        {!isDelivered && !isCancelled && (
          <>
            {[15, 35, 55, 75].map((pct, i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full bg-white/40"
                style={{ left: `${pct}%`, top: `${20 + (pct / 100) * 45}%` }}
                animate={{
                  scale: animatedDotIndex === i ? [1, 1.8, 1] : 1,
                  opacity: animatedDotIndex === i ? 0.8 : 0.3,
                }}
                transition={{ duration: 0.6 }}
              />
            ))}
          </>
        )}

        {/* ETA overlay */}
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2.5 text-white">
          <div className="flex items-center gap-1.5 text-[10px] opacity-70">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Clock className="h-3 w-3" />
            </motion.div>
            Previsao de entrega
          </div>
          <motion.p
            className="font-bold text-sm"
            key={isDelivered ? 'delivered' : eta}
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {isDelivered ? 'Entregue!' : isCancelled ? 'Cancelado' : eta}
          </motion.p>
          {/* Mini progress bar */}
          <motion.div className="mt-1.5 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              initial={{ width: 0 }}
            />
          </motion.div>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {isDelivered ? (
            <Badge className="bg-emerald-500/90 text-white border-0 text-[10px] font-semibold">
              <CheckCircle className="h-3 w-3 mr-1" />
              ENTREGUE
            </Badge>
          ) : isCancelled ? (
            <Badge className="bg-red-500/90 text-white border-0 text-[10px] font-semibold">
              CANCELADO
            </Badge>
          ) : (
            <Badge className="bg-amber-500/90 text-white border-0 text-[10px] font-semibold">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-white inline-block mr-1"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              EM TRANSITO
            </Badge>
          )}
        </div>
      </div>

      {/* Address cards with connection line */}
      <div className="relative mx-8">
        {/* Connection line */}
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-border/60" />
        <motion.div
          className="absolute left-5 top-8 w-0.5 bg-gradient-to-b from-primary to-emerald-500"
          initial={{ height: 0 }}
          animate={{ height: `${Math.min(progress, 100) * 0.48}px` }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Pickup address */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-4 relative"
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0 z-10">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium">RETIRADA</p>
            <p className="text-xs font-semibold line-clamp-1">{storeAddress}</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <CheckCircle className="h-4 w-4 text-primary" />
          </motion.div>
        </motion.div>

        {/* Delivery address */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 relative"
        >
          <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
            isDelivered
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-muted/50 border-border/40'
          }`}>
            <MapPin className={`h-4 w-4 ${isDelivered ? 'text-emerald-500 fill-emerald-500' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium">ENTREGA</p>
            <p className="text-xs font-semibold line-clamp-1">{deliveryAddress}</p>
          </div>
          {isDelivered && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Step indicators */}
      <div className="space-y-1 px-4">
        {deliverySteps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isPending = index > currentStepIndex
          const StepIcon = step.icon

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * index, type: 'spring', stiffness: 300, damping: 20 }}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                isCurrent
                  ? 'bg-primary/5 border border-primary/15'
                  : 'border border-transparent'
              }`}
            >
              {/* Icon */}
              <motion.div
                animate={isCurrent ? {
                  scale: [1, 1.15, 1],
                } : {}}
                transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0, ease: 'easeInOut' }}
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : isCurrent
                      ? 'bg-primary/15 text-primary ring-2 ring-primary/30'
                      : 'bg-muted/50 text-muted-foreground/40'
                }`}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </svg>
                  </motion.div>
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}

                {/* Pulse ring for current step */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${
                  isCompleted
                    ? 'text-foreground'
                    : isCurrent
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground/50'
                }`}>
                  {step.label}
                </p>
              </div>

              {/* Status indicator */}
              {isCurrent && !isDelivered && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Badge variant="secondary" className="text-[8px] bg-primary/10 text-primary border-primary/20 px-1.5">
                    AGORA
                  </Badge>
                </motion.div>
              )}
              {isCompleted && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium"
                >
                  Concluido
                </motion.span>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Driver info strip (if delivering) */}
      {!isDelivered && !isCancelled && currentStepIndex >= 3 && driverName && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-2 p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {driverName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold">{driverName}</p>
            <p className="text-[10px] text-muted-foreground">Entregador a caminho</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 rounded-full px-2 py-0.5">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">4.8</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
