'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, Clock, Calendar, MapPin, ChevronLeft, ChevronRight,
  CheckCircle, Package, Navigation, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'

interface DeliveryTimeCalculatorProps {
  storeName?: string
  deliveryFee?: number
  freeDeliveryAbove?: number | null
  /** Delivery address string for distance estimation */
  deliveryAddress?: string | null
  /** Store address string for distance estimation */
  storeAddress?: string | null
  /** Whether we have active delivery tracking data */
  isTracking?: boolean
  /** Current tracking step index (0-3: confirmed, preparing, transit, delivered) */
  trackingStep?: number
}

// Generate delivery schedule for next 7 days
function generateSchedule() {
  const days: { date: Date; label: string; available: boolean; slots: string[] }[] = []
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const dayOfWeek = date.getDay()
    const available = dayOfWeek !== 0 // Closed on Sundays
    const slots = available ? generateTimeSlots(dayOfWeek) : []

    let label = dayNames[dayOfWeek]
    if (i === 0) label = 'Hoje'
    else if (i === 1) label = 'Amanhã'

    days.push({
      date,
      label,
      available,
      slots,
    })
  }
  return days
}

function generateTimeSlots(dayOfWeek: number): string[] {
  const slots: string[] = []
  // Different schedules per day
  const startHour = [8, 7, 7, 7, 7, 8, 8][dayOfWeek] || 8
  const endHour = [18, 21, 21, 21, 21, 20, 14][dayOfWeek] || 18

  for (let h = startHour; h <= endHour; h++) {
    if (h % 2 === 0) {
      slots.push(`${h.toString().padStart(2, '0')}:00 - ${(h + 1).toString().padStart(2, '0')}:00`)
    }
  }
  return slots
}

// Delivery steps
const deliverySteps = [
  { id: 'confirmed', label: 'Confirmando', icon: Clock, color: 'text-teal-500' },
  { id: 'preparing', label: 'Preparando', icon: Package, color: 'text-orange-500' },
  { id: 'transit', label: 'Em trânsito', icon: Truck, color: 'text-primary' },
  { id: 'delivered', label: 'Entregue', icon: CheckCircle, color: 'text-emerald-500' },
]

/**
 * Estimate a rough distance between delivery address and store.
 * Returns distance in km, or a generic estimate for Dom Eliseu if no real data.
 */
function estimateDistance(deliveryAddress?: string | null, storeAddress?: string | null): number {
  // If both addresses are provided and different, assume a within-town distance
  if (deliveryAddress && storeAddress && deliveryAddress !== storeAddress) {
    // Simple heuristic: different addresses in a small town ≈ 2-5 km
    return 2.5 + Math.random() * 2
  }
  // If only one address or same address, assume a short distance (Dom Eliseu is a small town)
  if (deliveryAddress || storeAddress) {
    return 1.5
  }
  // No address data — generic estimate for Dom Eliseu
  return 3.0
}

export function DeliveryTimeCalculator({
  storeName,
  deliveryFee,
  freeDeliveryAbove,
  deliveryAddress,
  storeAddress,
  isTracking,
  trackingStep,
}: DeliveryTimeCalculatorProps) {
  const trackingData = useAppStore(s => s.trackingData)
  const [schedule] = useState(() => generateSchedule())
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)

  // Calculate distance from addresses
  const distance = estimateDistance(deliveryAddress, storeAddress)

  // Calculate estimated delivery time (derived from distance)
  const baseTime = 15 // minutes base
  const perKm = 4 // minutes per km
  const estimatedMinutes = baseTime + Math.round(distance * perKm)

  // Determine if we have active tracking data
  const hasTracking = isTracking || !!trackingData
  const activeStep = trackingData?.progress != null
    ? Math.min(Math.floor(trackingData.progress / 25), 3)
    : (trackingStep ?? 0)

  const todaySchedule = schedule[0]
  const activeDay = schedule[selectedDay]
  const fee = deliveryFee ?? 5
  const freeAbove = freeDeliveryAbove ?? 50

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      <Card className="border-primary/20 overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/5 to-emerald-500/5 px-4 py-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Previsão de Entrega</h3>
                  <p className="text-[10px] text-muted-foreground">{deliveryAddress || storeAddress ? 'Baseado no seu endereço' : 'Dom Eliseu e região'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{estimatedMinutes > 0 ? `${estimatedMinutes}-${estimatedMinutes + 15}` : '30-45'} min</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end">
                  <MapPin className="h-2.5 w-2.5" />
                  {distance.toFixed(1)} km
                </p>
              </div>
            </div>
          </div>

          {/* Delivery progress steps — shown when tracking is active */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {hasTracking ? 'Status do pedido' : 'Etapas da entrega'}
              </span>
              <motion.div
                key={hasTracking ? activeStep : 'idle'}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary border-0">
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  {hasTracking ? deliverySteps[activeStep].label : 'Aguardando pedido'}
                </Badge>
              </motion.div>
            </div>

            {/* Visual progress bar with steps */}
            <div className="relative">
              {/* Progress track */}
              <div className="flex items-center gap-0">
                {deliverySteps.map((step, idx) => {
                  const StepIcon = step.icon
                  const isActive = hasTracking ? idx <= activeStep : false
                  const isCurrent = hasTracking ? idx === activeStep : false

                  return (
                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                      {/* Step circle */}
                      <motion.div
                        animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className={`relative z-10 h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-muted text-muted-foreground'
                        } ${isCurrent ? 'ring-[3px] ring-primary/20' : ''}`}
                      >
                        {isActive && idx < activeStep ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <StepIcon className="h-4 w-4" />
                        )}
                      </motion.div>

                      {/* Connector line */}
                      {idx < deliverySteps.length - 1 && (
                        <div className="flex-1 h-1 bg-muted rounded-full mx-1 overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: '0%' }}
                            animate={{
                              width: hasTracking ? (idx < activeStep ? '100%' : isCurrent ? '50%' : '0%') : '0%'
                            }}
                            transition={{ delay: 0.2, duration: 0.8, ease: 'easeInOut' }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Step labels */}
              <div className="flex items-center justify-between mt-2 px-0.5">
                {deliverySteps.map((step) => (
                  <span key={step.id} className="text-[9px] text-muted-foreground text-center flex-1">
                    {step.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-px bg-border/50 my-4" />

            {/* Delivery fee info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taxa de entrega</span>
              <span className="font-semibold">{fee === 0 ? 'Grátis' : `R$ ${fee.toFixed(2).replace('.', ',')}`}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5 text-muted-foreground">
              <span>Frete grátis acima de</span>
              <span className="text-primary font-medium">R$ {freeAbove.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="h-px bg-border/50 my-4" />

            {/* Schedule toggle */}
            <Button
              variant="outline"
              className="w-full h-10 gap-2 text-sm border-primary/30 hover:bg-primary/5 hover:border-primary/50"
              onClick={() => setShowSchedule(!showSchedule)}
            >
              <Calendar className="h-4 w-4 text-primary" />
              Agendar entrega
              <motion.div
                animate={{ rotate: showSchedule ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>

          {/* Calendar / Schedule Selector */}
          <AnimatePresence>
            {showSchedule && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-border/50">
                  {/* Day selector */}
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar py-3">
                    {schedule.map((day, idx) => (
                      <motion.button
                        key={idx}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (day.available) {
                            setSelectedDay(idx)
                            setSelectedSlot(null)
                          }
                        }}
                        className={`shrink-0 w-16 py-2.5 rounded-xl text-center transition-all border-2 ${
                          selectedDay === idx && day.available
                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                            : day.available
                            ? 'bg-card border-border hover:border-primary/30'
                            : 'bg-muted/50 border-transparent opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <p className="text-[10px] font-medium">
                          {day.label}
                        </p>
                        <p className="text-sm font-bold mt-0.5">
                          {day.date.getDate()}/{day.date.getMonth() + 1}
                        </p>
                        {!day.available && (
                          <p className="text-[8px] mt-0.5 opacity-70">Fechado</p>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Time slots */}
                  {activeDay.available && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Horários disponíveis
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {activeDay.slots.map((slot, idx) => {
                          const isSelected = selectedSlot === slot
                          return (
                            <motion.button
                              key={slot}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.03 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedSlot(slot)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border-2 transition-all ${
                                isSelected
                                  ? 'bg-primary/10 border-primary text-primary'
                                  : 'bg-card border-border hover:border-primary/30 text-foreground'
                              }`}
                            >
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              {slot}
                            </motion.button>
                          )
                        })}
                      </div>

                      {selectedSlot && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3"
                        >
                          <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-800/30">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <div>
                                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                  Entrega agendada
                                </p>
                                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">
                                  {activeDay.label}, {activeDay.date.getDate()}/{activeDay.date.getMonth() + 1} · {selectedSlot}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
