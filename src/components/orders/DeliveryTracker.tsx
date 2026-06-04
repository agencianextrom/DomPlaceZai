'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapPin, Phone, MessageCircle, Clock, CheckCircle, Package, Truck, ChefHat, Star, WifiOff, Loader2, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { useDeliveryTracking } from '@/hooks/useDeliveryTracking'
import { OrderStatusTimeline } from './OrderStatusTimeline'
import { DeliveryMapTracker } from './DeliveryMapTracker'

interface DeliveryTrackerProps {
  orderNumber: string
  storeName: string
  status: string
  estimatedTime: string
  orderId?: string
}

// -- Types for real order data --
interface OrderDriverInfo {
  name?: string
  phone?: string
  vehicle?: string
  rating?: number
  totalDeliveries?: number
}

interface StatusHistoryEntry {
  status: string
  timestamp: string
  note?: string
}

const steps = [
  { id: 'confirmed', label: 'Pedido Confirmado', icon: CheckCircle, desc: 'Seu pedido foi recebido e confirmado pela loja.', estLabel: '~2 min' },
  { id: 'preparing', label: 'Preparando', icon: ChefHat, desc: 'A loja está preparando seus itens com carinho.', estLabel: '~15 min' },
  { id: 'delivering', label: 'Saiu para Entrega', icon: Truck, desc: 'O entregador está a caminho do seu endereço.', estLabel: '~20 min' },
  { id: 'delivered', label: 'Entregue', icon: Package, desc: 'Pedido entregue com sucesso! Bom apetite!', estLabel: '' },
]

// Map server statuses to step indices
const statusToStep: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 1,
  READY: 2,
  DELIVERING: 2,
  DELIVERED: 3,
}

// Fallback driver when no tracking data is available
const fallbackDriver = {
  name: 'Aguardando entregador',
  initials: '--',
  phone: '',
  rating: 0,
  totalDeliveries: 0,
  vehicle: '',
}

export function DeliveryTracker({ orderNumber, storeName, status, estimatedTime, orderId }: DeliveryTrackerProps) {
  // -- Connect to real tracking service --
  const {
    tracking,
    isConnected,
    isConnecting,
    isDelivered,
    orderStatus,
    orderStatusLabel,
    etaText,
    progress,
  } = useDeliveryTracking({
    orderId: orderId || '',
    autoStart: !!orderId,
  })

  // -- Fetch real order detail for driver info and statusHistory --
  const [orderDetail, setOrderDetail] = useState<{
    driver?: OrderDriverInfo
    statusHistory?: StatusHistoryEntry[]
  } | null>(null)

  useEffect(() => {
    if (!orderId) return
    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (res.ok) {
          const data = await res.json()
          setOrderDetail({
            driver: data.driver ? {
              name: data.driver.name,
              phone: data.driver.phone,
              vehicle: data.driver.vehicle,
              rating: data.driver.rating,
              totalDeliveries: data.driver.totalDeliveries,
            } : undefined,
            statusHistory: data.statusHistory,
          })
        }
      } catch {
        // Silently fail
      }
    }
    fetchOrderDetail()
  }, [orderId])

  // Build driver data from real tracking > order detail > fallback
  const driver = useMemo(() => {
    // Prefer real-time tracking data
    if (isConnected && tracking) {
      return {
        name: tracking.driverName,
        initials: tracking.driverName.split(' ').map((n: string) => n[0]).join('').slice(0, 2),
        phone: tracking.driverPhone,
        rating: tracking.driverRating,
        totalDeliveries: 1250,
        vehicle: tracking.driverVehicle,
      }
    }
    // Then use order detail data
    if (orderDetail?.driver?.name) {
      return {
        name: orderDetail.driver.name,
        initials: orderDetail.driver.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2),
        phone: orderDetail.driver.phone,
        rating: orderDetail.driver.rating || 0,
        totalDeliveries: orderDetail.driver.totalDeliveries || 0,
        vehicle: orderDetail.driver.vehicle || '',
      }
    }
    return fallbackDriver
  }, [isConnected, tracking, orderDetail])

  // Current step: use real status from tracking when connected, otherwise from prop
  const currentStep = useMemo(() => {
    const realStatus = isConnected && tracking ? orderStatus : status
    return statusToStep[realStatus] ?? 0
  }, [isConnected, tracking, orderStatus, status])

  const effectiveStep = currentStep

  // Elapsed time counter
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Format timestamp from statusHistory
  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts)
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  // Get step timestamp from tracking statusHistory or order detail (real data), or fallback
  const getStepTime = (stepId: string, idx: number): string | null => {
    // Map step IDs to server status names
    const statusMap: Record<string, string> = {
      confirmed: 'CONFIRMED',
      preparing: 'PREPARING',
      delivering: 'DELIVERING',
      delivered: 'DELIVERED',
    }
    const serverStatus = statusMap[stepId]
    if (!serverStatus) return null

    // Try tracking statusHistory first (real-time)
    if (tracking && isConnected) {
      const entry = tracking.statusHistory.find((h: StatusHistoryEntry) => h.status === serverStatus)
      if (entry) return formatTimestamp(entry.timestamp)
    }

    // Try order detail statusHistory (fetched from API)
    if (orderDetail?.statusHistory) {
      const entry = orderDetail.statusHistory.find((h: StatusHistoryEntry) => h.status === serverStatus)
      if (entry) return formatTimestamp(entry.timestamp)
    }

    // No real data available — don't show fake times
    return null
  }

  const effectiveEtaText = isConnected && tracking
    ? (isDelivered ? 'Entregue!' : etaText)
    : estimatedTime

  const progressPercent = isConnected && tracking ? Math.round(progress) : Math.min(95, Math.round((effectiveStep / (steps.length - 1)) * 100))

  const hasDriver = driver.name && driver.name !== fallbackDriver.name

  return (
    <div className="space-y-4">
      {/* Map placeholder / status header */}
      <div className="relative h-40 sm:h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
        {/* R39: Enhanced animated grid pattern overlay */}
        <div className="absolute inset-0 r39-map-grid" />

        {/* Roads */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/20 transform -translate-y-1/2" />
          <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-white/20" />
          <div className="absolute top-0 bottom-0 right-1/4 w-1 bg-white/15" />
          <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white/10 transform -translate-y-1/2" />
        </div>

        {/* Animated delivery pin - moves based on progress */}
        <motion.div
          className="absolute"
          animate={isConnected && tracking
            ? { top: `${100 - progressPercent * 0.6}%`, left: `${20 + progressPercent * 0.4}%` }
            : {
                top: ['30%', '45%', '55%', '65%'],
                left: ['20%', '35%', '45%', '60%'],
              }
          }
          transition={isConnected && tracking
            ? { duration: 1, ease: 'easeInOut' }
            : { duration: 8, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg border-2 border-white">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <motion.div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-500 rotate-45"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-amber-400"
              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Store pin — R39: pulsing location dot */}
        <div className="absolute top-[25%] left-[15%]">
          <div className="relative r39-location-pulse r39-location-ripple">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-md border-2 border-white">
              <MapPin className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Destination pin — R39: pulsing location dot */}
        <div className="absolute bottom-[15%] right-[25%]">
          <div className="relative r39-location-pulse r39-location-ripple">
            <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center shadow-md border-2 border-white">
              <MapPin className="h-4 w-4 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* ETA overlay with countdown animation */}
        <motion.div
          className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 text-white"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="flex items-center gap-1.5 text-xs opacity-80">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Clock className="h-3 w-3" />
            </motion.div>
            Previsão de entrega
          </div>
          {/* R39: ETA with gradient text + scale pulse */}
          <motion.p
            className="font-bold text-sm r39-eta-gradient"
            key={effectiveEtaText}
            initial={{ y: 8, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
          >
            {effectiveEtaText}
          </motion.p>
          {/* R39: Animated gradient progress fill bar */}
          <motion.div
            className="mt-1 h-1.5 bg-white/20 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full r39-progress-gradient rounded-full"
              animate={{ width: isDelivered ? '100%' : `${progressPercent}%` }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              initial={{ width: '0%' }}
            />
          </motion.div>
        </motion.div>

        {/* Connection status indicator */}
        <div className="absolute top-3 right-3 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
          {isConnecting ? (
            <div className="bg-amber-500/90 flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 text-white animate-spin" />
              <span className="text-[10px] font-semibold text-white">CONECTANDO</span>
            </div>
          ) : isConnected ? (
            <div className="bg-emerald-500/90 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-semibold text-white">AO VIVO</span>
            </div>
          ) : (
            <div className="bg-gray-500/90 flex items-center gap-1.5">
              <WifiOff className="h-3 w-3 text-white" />
              <span className="text-[10px] font-semibold text-white">OFFLINE</span>
            </div>
          )}
        </div>
      </div>

      {/* Animated route line — gradient dashed line that draws as steps complete */}
      <div className="relative mx-4 -mt-1">
        <svg width="100%" height="40" viewBox="0 0 400 40" preserveAspectRatio="none" className="overflow-visible">
          {/* Background dashed track */}
          <line x1="40" y1="20" x2="360" y2="20" strokeDasharray="8 6" strokeWidth="2" className="stroke-border/60" />
          {/* Store dot */}
          <circle cx="40" cy="20" r="6" className="fill-primary" />
          <circle cx="40" cy="20" r="3" className="fill-white" />
          {/* Destination dot */}
          <circle cx="360" cy="20" r="6" className="fill-red-500" />
          <circle cx="360" cy="20" r="3" className="fill-white" />
          {/* Animated progress dashed line */}
          <motion.line
            x1="40" y1="20"
            x2="40"
            y2="20"
            strokeDasharray="8 6"
            strokeWidth="2.5"
            className="stroke-emerald-500"
            animate={{
              x2: 40 + (320 * progressPercent / 100),
            }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
          {/* Animated vehicle marker */}
          <motion.g
            animate={{
              cx: 40 + (320 * progressPercent / 100),
            }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          >
            <motion.circle
              cx="40" cy="20" r="10"
              className="fill-amber-500"
              animate={{ cx: 40 + (320 * progressPercent / 100) }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="40" cy="20" r="6"
              className="fill-amber-400"
              animate={{ cx: 40 + (320 * progressPercent / 100) }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </motion.g>
        </svg>
      </div>

      {/* Map Tracker — visual delivery map with animated route */}
      <DeliveryMapTracker
        orderStatus={isConnected && tracking ? orderStatus : status}
        storeAddress={storeName}
        deliveryAddress="Casa — Rua das Flores, 123"
        storeName={storeName}
        eta={effectiveEtaText}
        driverName={hasDriver ? driver.name : undefined}
        progress={progressPercent}
      />

      {/* Driver info — R39: glassmorphism card with animated avatar ring + hover lift */}
      <motion.div
        className="relative rounded-xl p-[1px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/60 via-emerald-500/40 to-cyan-500/60 animate-[spin_6s_linear_infinite] blur-[1px]" style={{ margin: -1 }} />
        <Card className="border-0 rounded-[10px] overflow-hidden r39-driver-glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* R39: Avatar with animated gradient ring */}
              <motion.div
                className="relative r39-avatar-ring"
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              >
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-primary/30 z-10 relative">
                  {driver.initials}
                </div>
                {/* Online status indicator with pulse rings */}
                <div className={`absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full border-2 border-background/80 flex items-center justify-center ${hasDriver ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                  {hasDriver && (
                    <>
                      <motion.span
                        className="h-2 w-2 rounded-full bg-white"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <motion.span
                        className="absolute inset-0 rounded-full border-2 border-emerald-400"
                        animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                    </>
                  )}
                </div>
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm">{driver.name}</p>
                  {driver.rating > 0 && (
                    <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-full px-1.5 py-0.5">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{driver.rating}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {driver.totalDeliveries > 0 && <span>{driver.totalDeliveries} entregas</span>}
                  {driver.vehicle && (
                    <>
                      <span className="text-border">•</span>
                      <span>{driver.vehicle}</span>
                    </>
                  )}
                  {!hasDriver && <span className="italic">Aguardando atribuicao de entregador</span>}
                </div>
              </div>
              {/* R39: Contact buttons with hover scale, glow shadow, shimmer sweep */}
              <div className="flex gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}>
                  <Button size="icon" variant="outline" className="h-10 w-10 rounded-full border-primary/20 hover:border-primary/40 r39-contact-btn" aria-label="Ligar para entregador" disabled={!hasDriver}>
                    <Phone className="h-4 w-4 text-primary" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}>
                  <Button size="icon" className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 r39-contact-btn" aria-label="Chat com entregador" disabled={!hasDriver}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Timeline — R39: enhanced with animated pulse on current step + glow */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="r39-step-glow">
          <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Acompanhamento em tempo real</h3>
            <div className="flex items-center gap-2">
              {/* R39: Elapsed timer badge with pulse */}
              <Badge variant="outline" className="text-[10px] font-mono r39-step-glow">
                {formatElapsed(elapsed)}
              </Badge>
              {isConnected && tracking && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                    {progressPercent}%
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>

          {/* Gradient progress line */}
          <motion.div
            className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-primary/40 via-emerald-400/60 to-primary/40"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: effectiveStep / (steps.length - 1) }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />

          <OrderStatusTimeline
            steps={steps.map((step, idx) => ({
              label: step.label,
              desc: step.desc,
              estLabel: step.estLabel,
              status: idx < effectiveStep ? 'completed' as const : idx === effectiveStep ? 'current' as const : 'pending' as const,
              timestamp: getStepTime(step.id, idx) || undefined,
              icon: step.id,
            }))}
          />
        </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
