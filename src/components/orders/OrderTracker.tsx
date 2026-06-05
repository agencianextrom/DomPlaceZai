'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, Clock, Package, Truck, MapPin, Phone, MessageCircle,
  ChevronRight, Navigation, User, Bike
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface OrderTrackerProps {
  orderNumber?: string
  storeName?: string
}

const steps = [
  {
    id: 'confirmed',
    label: 'Pedido Confirmado',
    description: 'Seu pedido foi recebido pela loja',
    icon: CheckCircle,
    time: '14:32',
    detail: null,
  },
  {
    id: 'preparing',
    label: 'Preparando',
    description: 'A loja está preparando seu pedido',
    icon: Package,
    time: '14:45',
    detail: null,
  },
  {
    id: 'delivering',
    label: 'Saiu para Entrega',
    description: 'Seu pedido está a caminho',
    icon: Truck,
    time: '15:10',
    detail: { driver: 'Carlos Silva', vehicle: 'Moto Honda CG 160', phone: '(91) 99999-0123' },
  },
  {
    id: 'nearby',
    label: 'Próximo',
    description: 'Entregador próximo ao seu endereço',
    icon: Navigation,
    time: null,
    detail: null,
  },
  {
    id: 'delivered',
    label: 'Entregue',
    description: 'Pedido entregue com sucesso!',
    icon: CheckCircle,
    time: null,
    detail: null,
  },
]

export function OrderTracker({ orderNumber = 'DP000003', storeName = 'Mercado do Zé' }: OrderTrackerProps) {
  const [currentStep, setCurrentStep] = useState(2) // Start at "delivering"
  const eta = currentStep >= steps.length - 1 ? 0 : 8

  // Auto-advance for demo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(timer)
          return prev
        }
        return prev + 1
      })
    }, 20000)
    return () => clearInterval(timer)
  }, [])

  const getStepStatus = useCallback((stepIndex: number): 'completed' | 'current' | 'pending' => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'current'
    return 'pending'
  }, [currentStep])

  const formatETA = (minutes: number) => {
    if (minutes <= 0) return 'Chegou!'
    if (minutes < 60) return `${minutes} min`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}min`
  }

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardContent className="p-0">
        {/* Map Placeholder */}
        <div className="relative h-36 bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:via-emerald-900/10 dark:to-teal-900/20 overflow-hidden">
          {/* Animated route dots */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 150" fill="none">
            {/* Route line */}
            <motion.path
              d="M 40 120 Q 100 80 150 90 T 260 60 T 360 40"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="8 4"
              className="text-primary/30"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
            {/* Animated moving dot */}
            <motion.circle
              r="6"
              fill="currentColor"
              className="text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 0.8, 1] }}
            >
              <animateMotion
                dur="4s"
                repeatCount="indefinite"
                path="M 40 120 Q 100 80 150 90 T 260 60 T 360 40"
              />
            </motion.circle>
            {/* Store marker */}
            <g transform="translate(40, 120)">
              <circle r="14" className="fill-primary" />
              <text x="0" y="1" textAnchor="middle" className="fill-white text-[8px] font-bold" dominantBaseline="middle">M</text>
            </g>
            {/* Destination marker */}
            <g transform="translate(360, 40)">
              <circle r="14" className="fill-amber-500" />
              <text x="0" y="1" textAnchor="middle" className="fill-white text-[8px] font-bold" dominantBaseline="middle">C</text>
            </g>
          </svg>

          {/* ETA overlay */}
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm">
            <p className="text-[10px] text-muted-foreground">Previsão de entrega</p>
            <p className="text-lg font-bold text-primary">{formatETA(eta)}</p>
          </div>

          {/* Route labels */}
          <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
            <p className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5 text-primary" />
              {storeName}
            </p>
          </div>
          <div className="absolute bottom-3 right-3 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
            <p className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5 text-amber-500" />
              Sua casa
            </p>
          </div>
        </div>

        {/* Driver Info Card (shown when delivering) */}
        {currentStep >= 2 && currentStep < steps.length - 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  CS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Carlos Silva</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Bike className="h-2.5 w-2.5" />
                    Moto Honda CG 160 · Branca
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="icon" className="h-9 w-9 min-h-[44px] min-w-[44px] bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shrink-0 active:scale-95 transition-transform">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-9 w-9 min-h-[44px] min-w-[44px] border-primary/30 text-primary hover:bg-primary/5 rounded-full shrink-0 active:scale-95 transition-transform">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        <div className="px-4 py-5">
          <div className="relative">
            {steps.map((step, idx) => {
              const status = getStepStatus(idx)
              const Icon = step.icon
              const isCurrent = status === 'current'
              const isCompleted = status === 'completed'
              const isLast = idx === steps.length - 1

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  {/* Connecting line */}
                  {!isLast && (
                    <div className="absolute left-[18px] top-[38px] w-0.5 z-0">
                      <motion.div
                        className={`w-full rounded-full ${
                          isCompleted ? 'bg-primary' : 'bg-border'
                        }`}
                        initial={{ height: 0 }}
                        animate={{ height: isCompleted ? '100%' : '0%' }}
                        transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                        style={{ height: isCompleted ? undefined : 0 }}
                      />
                      {/* Static background line */}
                      <div className="absolute inset-0 bg-border -z-10" />
                    </div>
                  )}

                  <div className="flex gap-3 pb-5 relative z-10">
                    {/* Step icon */}
                    <div className="shrink-0 relative">
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary/20"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center transition-all relative ${
                          isCompleted
                            ? 'bg-primary text-primary-foreground'
                            : isCurrent
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ring-2 ring-amber-300 dark:ring-amber-700'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            <CheckCircle className="h-4 w-4 absolute inset-0 m-auto" />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`flex-1 min-w-0 ${isCurrent ? '' : ''}`}>
                      <div
                        className={`rounded-xl p-3 transition-all ${
                          isCurrent
                            ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 shadow-sm'
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-semibold ${isCurrent ? 'text-amber-700 dark:text-amber-400' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          {step.time && (
                            <span className="text-[10px] text-muted-foreground">{step.time}</span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${isCurrent ? 'text-amber-600/80 dark:text-amber-500/80' : 'text-muted-foreground'}`}>
                          {step.description}
                        </p>

                        {/* Expanded detail for current step */}
                        {isCurrent && step.detail && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/30"
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-amber-600" />
                              <span className="text-xs font-medium">{step.detail.driver}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Bike className="h-3.5 w-3.5 text-amber-600" />
                              <span className="text-xs text-muted-foreground">{step.detail.vehicle}</span>
                            </div>
                          </motion.div>
                        )}

                        {/* Action buttons for current delivering step */}
                        {isCurrent && step.id === 'delivering' && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="h-8 min-h-[44px] text-xs bg-primary text-primary-foreground gap-1 flex-1">
                              <Phone className="h-3 w-3" />
                              Ligar
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 min-h-[44px] text-xs border-primary/30 text-primary gap-1 flex-1">
                              <MessageCircle className="h-3 w-3" />
                              Chat
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Order info footer */}
        <div className="px-4 py-3 bg-secondary/30 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Pedido</p>
              <p className="text-xs font-bold">{orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Loja</p>
              <p className="text-xs font-bold">{storeName}</p>
            </div>
            <Badge
              className={`text-[10px] ${
                currentStep >= steps.length - 1
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0'
              }`}
            >
              {currentStep >= steps.length - 1 ? 'Entregue' : 'Em andamento'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
