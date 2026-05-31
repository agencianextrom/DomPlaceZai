'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapPin, Phone, MessageCircle, Clock, CheckCircle, Package, Truck, ChefHat, Star, WifiOff, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { useDeliveryTracking } from '@/hooks/useDeliveryTracking'

interface DeliveryTrackerProps {
  orderNumber: string
  storeName: string
  status: string
  estimatedTime: string
  orderId?: string
}

const steps = [
  { id: 'confirmed', label: 'Pedido Confirmado', icon: CheckCircle, desc: 'Seu pedido foi recebido e confirmado pela loja.' },
  { id: 'preparing', label: 'Preparando', icon: ChefHat, desc: 'A loja está preparando seus itens com carinho.' },
  { id: 'delivering', label: 'Saiu para Entrega', icon: Truck, desc: 'O entregador está a caminho do seu endereço.' },
  { id: 'delivered', label: 'Entregue', icon: Package, desc: 'Pedido entregue com sucesso! Bom apetite!' },
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
  name: 'Carlos Entregas',
  initials: 'CE',
  phone: '(91) 99888-7766',
  rating: 4.8,
  totalDeliveries: 1250,
  vehicle: 'Moto',
}

export function DeliveryTracker({ orderNumber, storeName, status, estimatedTime, orderId }: DeliveryTrackerProps) {
  // ── Connect to real tracking service ──
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

  // Use real driver data or fallback
  const driver = tracking
    ? {
        name: tracking.driverName,
        initials: tracking.driverName.split(' ').map((n) => n[0]).join('').slice(0, 2),
        phone: tracking.driverPhone,
        rating: tracking.driverRating,
        totalDeliveries: 1250,
        vehicle: tracking.driverVehicle,
      }
    : fallbackDriver

  // Current step: use real status from tracking when connected, otherwise from prop
  const currentStep = useMemo(() => {
    const realStatus = isConnected && tracking ? orderStatus : status
    return statusToStep[realStatus] ?? 0
  }, [isConnected, tracking, orderStatus, status])

  const effectiveStep = currentStep

  // Elapsed time counter
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

  // Get step timestamp from tracking statusHistory (real data) or fallback
  const getStepTime = (stepId: string, idx: number): string | null => {
    if (tracking && isConnected) {
      // Map step IDs to server status names
      const statusMap: Record<string, string> = {
        confirmed: 'CONFIRMED',
        preparing: 'PREPARING',
        delivering: 'DELIVERING',
        delivered: 'DELIVERED',
      }
      const serverStatus = statusMap[stepId]
      if (serverStatus) {
        const entry = tracking.statusHistory.find((h) => h.status === serverStatus)
        if (entry) return formatTimestamp(entry.timestamp)
      }
    }
    // Fallback times for visual effect
    const fallbackTimes = ['14:32', '14:45', '15:02', '15:20']
    return fallbackTimes[idx] || null
  }

  const effectiveEtaText = isConnected && tracking
    ? (isDelivered ? 'Entregue!' : etaText)
    : estimatedTime

  const progressPercent = isConnected && tracking ? Math.round(progress) : Math.min(95, Math.round((effectiveStep / (steps.length - 1)) * 100))

  return (
    <div className="space-y-4">
      {/* Map placeholder / status header */}
      <div className="relative h-40 sm:h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.1]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />

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

        {/* Store pin */}
        <div className="absolute top-[25%] left-[15%]">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-md border-2 border-white">
            <MapPin className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Destination pin */}
        <div className="absolute bottom-[15%] right-[25%]">
          <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center shadow-md border-2 border-white">
            <MapPin className="h-4 w-4 text-white fill-white" />
          </div>
        </div>

        {/* ETA overlay */}
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 text-white">
          <div className="flex items-center gap-1.5 text-xs opacity-80">
            <Clock className="h-3 w-3" />
            Previsão de entrega
          </div>
          <p className="font-bold text-sm">{effectiveEtaText}</p>
        </div>

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

      {/* Driver info */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                {driver.initials}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                <span className="text-[7px] text-white font-bold">{isConnected ? '🟢' : '⚫'}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm">{driver.name}</p>
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-medium">{driver.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{driver.totalDeliveries} entregas</span>
                <span>•</span>
                <span>{driver.vehicle}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" aria-label="Ligar para entregador">
                <Phone className="h-4 w-4 text-primary" />
              </Button>
              <Button size="icon" className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" aria-label="Chat com entregador">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Acompanhamento em tempo real</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono">
                {formatElapsed(elapsed)}
              </Badge>
              {isConnected && tracking && (
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  {progressPercent}%
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-0">
            {steps.map((step, idx) => {
              const isActive = idx <= effectiveStep
              const isCurrent = idx === effectiveStep
              const StepIcon = step.icon
              const stepTime = getStepTime(step.id, idx)

              return (
                <div key={step.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${step.id}-${isActive}`}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-muted text-muted-foreground'
                        } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                      >
                        {isCurrent ? (
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <StepIcon className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <StepIcon className="h-4 w-4" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                    {idx < steps.length - 1 && (
                      <motion.div
                        className="w-0.5 flex-1 min-h-[24px]"
                        initial={{ backgroundColor: 'var(--color-muted)' }}
                        animate={{ backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-muted)' }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </div>

                  <div className={`pb-4 ${idx === steps.length - 1 ? 'pb-0' : ''}`}>
                    <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-muted-foreground mt-0.5"
                      >
                        {step.desc}
                      </motion.p>
                    )}
                    {isActive && stepTime && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-[10px] text-muted-foreground/70 mt-0.5"
                      >
                        {stepTime}
                      </motion.p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
