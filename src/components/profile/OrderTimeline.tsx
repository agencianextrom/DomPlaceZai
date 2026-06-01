'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Package, Timer, Truck as TruckIcon, PackageCheck, Clock } from 'lucide-react'

export interface TimelineStep {
  id: string
  title: string
  description: string
  timestamp: string
  icon: React.ReactNode
  status: 'completed' | 'current' | 'pending'
}

const defaultSteps: TimelineStep[] = [
  {
    id: 'confirmed',
    title: 'Pedido Confirmado',
    description: 'Seu pedido foi recebido e confirmado pela loja.',
    timestamp: 'Hoje, 14:30',
    icon: <PackageCheck className="h-5 w-5" />,
    status: 'completed',
  },
  {
    id: 'preparing',
    title: 'Preparando',
    description: 'A loja esta preparando seus itens com carinho.',
    timestamp: 'Hoje, 14:45',
    icon: <Timer className="h-5 w-5" />,
    status: 'current',
  },
  {
    id: 'delivery',
    title: 'Saiu para Entrega',
    description: 'Seu pedido esta a caminho! O entregador esta proximo.',
    timestamp: '',
    icon: <TruckIcon className="h-5 w-5" />,
    status: 'pending',
  },
  {
    id: 'delivered',
    title: 'Entregue',
    description: 'Pedido entregue com sucesso. Aproveite!',
    timestamp: '',
    icon: <Package className="h-5 w-5" />,
    status: 'pending',
  },
]

export function OrderTimeline({ steps, orderNumber }: { steps?: TimelineStep[]; orderNumber?: string }) {
  const timelineSteps = steps ?? defaultSteps

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Acompanhar Pedido
          </h3>
          {orderNumber && (
            <p className="text-[10px] text-muted-foreground mt-0.5">Pedido #{orderNumber}</p>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {timelineSteps.filter((s) => s.status === 'completed').length}/{timelineSteps.length} etapas
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {timelineSteps.map((step, idx) => {
          const isCompleted = step.status === 'completed'
          const isCurrent = step.status === 'current'
          const isLast = idx === timelineSteps.length - 1
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
                  animate={
                    isCurrent
                      ? {
                          boxShadow: [
                            '0 0 0 0 rgba(16,185,129,0.4)',
                            '0 0 0 8px rgba(16,185,129,0)',
                            '0 0 0 0 rgba(16,185,129,0)',
                          ],
                        }
                      : {}
                  }
                  transition={
                    isCurrent
                      ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                      : {}
                  }
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
                  <div className="w-0.5 flex-1 min-h-[40px] relative overflow-hidden">
                    {/* Background line */}
                    <div className="absolute inset-0 bg-border rounded-full" />
                    {/* Progress fill */}
                    {lineActive && (
                      <motion.div
                        className="absolute inset-0 bg-emerald-500 rounded-full"
                        initial={{ height: '0%' }}
                        animate={{ height: '100%' }}
                        transition={{ duration: 0.6, delay: idx * 0.15 + 0.3, ease: 'easeOut' }}
                      />
                    )}
                    {/* Animated pulse on current step's line */}
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
              <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-sm font-semibold ${
                      isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isCurrent
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                    }`}
                  >
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
                <p
                  className={`text-xs mt-0.5 leading-relaxed ${
                    isCompleted || isCurrent ? 'text-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {step.description}
                </p>
                {step.timestamp && (
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {step.timestamp}
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
