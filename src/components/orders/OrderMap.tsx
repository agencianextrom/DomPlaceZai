'use client'

import { useState, useEffect } from 'react'
import { MapPin, Phone, MessageCircle, Clock, Truck, Star, Navigation, Store } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface OrderMapProps {
  storeName: string
  estimatedMinutes: number
}

const driver = {
  name: 'Carlos Entregas',
  initials: 'CE',
  phone: '919998887766',
  rating: 4.8,
  totalDeliveries: 1250,
  vehicle: 'Moto Honda CG 150',
  plate: 'MCC-1A23',
}

export function OrderMap({ storeName, estimatedMinutes }: OrderMapProps) {
  const [etaMinutes, setEtaMinutes] = useState(estimatedMinutes)
  const [etaSeconds, setEtaSeconds] = useState(0)
  const [driverProgress, setDriverProgress] = useState(0.35)
  const [routePoints] = useState(() => {
    // Generate curved route points
    const points: { x: number; y: number }[] = []
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const x = 15 + t * 70
      const y = 70 - t * 50 + Math.sin(t * Math.PI * 2) * 8
      points.push({ x, y })
    }
    return points
  })

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaSeconds(prev => {
        if (prev > 0) return prev - 1
        setEtaMinutes(m => {
          if (m > 0) {
            setEtaSeconds(59)
            return m - 1
          }
          return 0
        })
        return 0
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Animate driver progress
  useEffect(() => {
    const timer = setInterval(() => {
      setDriverProgress(prev => {
        if (prev >= 0.95) return 0.95
        return prev + 0.003
      })
    }, 500)
    return () => clearInterval(timer)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')
  const progressPercent = Math.round(driverProgress * 100)

  // Calculate driver position on route
  const driverIdx = Math.floor(driverProgress * (routePoints.length - 1))
  const driverPos = routePoints[Math.min(driverIdx, routePoints.length - 1)]

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative w-full h-56 sm:h-64 lg:h-72 rounded-2xl overflow-hidden">
        {/* Map background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-900/40 dark:via-teal-900/30 dark:to-cyan-900/40" />
        
        {/* Street grid pattern */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Grid streets */}
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/15" />
          <line x1="0" y1="60%" x2="100%" y2="60%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/15" />
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/15" />
          <line x1="55%" y1="0" x2="55%" y2="100%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/15" />
          <line x1="80%" y1="0" x2="80%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/8" />
          <line x1="0" y1="45%" x2="100%" y2="45%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/8" />
          <line x1="0" y1="80%" x2="100%" y2="80%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/8" />
          
          {/* Building blocks */}
          {[
            { x: '2%', y: '5%', w: '20%', h: '22%' },
            { x: '28%', y: '5%', w: '24%', h: '22%' },
            { x: '58%', y: '5%', w: '19%', h: '22%' },
            { x: '2%', y: '34%', w: '20%', h: '22%' },
            { x: '58%', y: '34%', w: '19%', h: '22%' },
            { x: '2%', y: '64%', w: '20%', h: '12%' },
            { x: '58%', y: '64%', w: '19%', h: '12%' },
            { x: '28%', y: '64%', w: '24%', h: '12%' },
            { x: '28%', y: '34%', w: '24%', h: '22%' },
          ].map((block, i) => (
            <rect
              key={i}
              x={block.x}
              y={block.y}
              width={block.w}
              height={block.h}
              rx="4"
              fill="currentColor"
              className="text-muted-foreground/8"
            />
          ))}
          
          {/* Route path - dashed animated line */}
          <path
            d={routePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-primary/30"
            strokeDasharray="8 6"
          />
          {/* Completed route portion - solid */}
          <motion.path
            d={routePoints.slice(0, driverIdx + 1).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-primary"
            strokeLinecap="round"
          />
        </svg>

        {/* Store Marker */}
        <div className="absolute" style={{ left: `${routePoints[0].x}%`, top: `${routePoints[0].y}%`, transform: 'translate(-50%, -100%)' }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white z-10 relative">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45 -z-10" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/40"
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[9px] font-bold bg-white dark:bg-card px-1.5 py-0.5 rounded-md shadow-sm border border-border">
              {storeName}
            </span>
          </div>
        </div>

        {/* Destination Marker */}
        <div className="absolute" style={{ left: `${routePoints[routePoints.length - 1].x}%`, top: `${routePoints[routePoints.length - 1].y}%`, transform: 'translate(-50%, -100%)' }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg border-2 border-white z-10 relative">
                <MapPin className="h-5 w-5 text-white fill-white" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45 -z-10" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-400"
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </div>
          </motion.div>
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[9px] font-bold bg-white dark:bg-card px-1.5 py-0.5 rounded-md shadow-sm border border-border">
              Sua casa
            </span>
          </div>
        </div>

        {/* Driver Marker (animated) */}
        <motion.div
          className="absolute z-20"
          style={{
            left: `${driverPos.x}%`,
            top: `${driverPos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            left: `${driverPos.x}%`,
            top: `${driverPos.y}%`,
          }}
          transition={{ duration: 1, ease: 'linear' }}
        >
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative">
              <div className="h-11 w-11 rounded-full bg-amber-500 flex items-center justify-center shadow-xl border-3 border-white">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-full border-2 border-amber-400/50"
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute top-3 right-3 bg-emerald-500/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="text-[10px] font-bold text-white tracking-wide">AO VIVO</span>
        </motion.div>

        {/* ETA Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-3 left-3 bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-lg border border-border/50"
        >
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Navigation className="h-3 w-3 text-primary" />
            <span>Previsão de chegada</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-extrabold text-primary tabular-nums">
              {etaMinutes}:{pad(etaSeconds)}
            </span>
            <span className="text-xs text-muted-foreground">min</span>
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 w-28 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Compass */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-full h-8 w-8 flex items-center justify-center shadow-md border border-border/50">
          <Navigation className="h-4 w-4 text-muted-foreground" style={{ transform: 'rotate(-15deg)' }} />
        </div>
      </div>

      {/* Driver Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-primary/20 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-primary/5 to-emerald-500/5 px-4 py-2 border-b border-border/50">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Truck className="h-3 w-3 text-primary" />
                Entregador a caminho
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                    {driver.initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{driver.name}</p>
                    <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{driver.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{driver.vehicle} • {driver.plate}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                      {driver.totalDeliveries} entregas
                    </Badge>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-0">
                      Online
                    </Badge>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-10 w-10 rounded-xl border-primary/30 hover:bg-primary/10"
                    aria-label="Ligar para entregador"
                    onClick={() => {
                      window.open(`https://wa.me/55${driver.phone}`, '_blank')
                    }}
                  >
                    <Phone className="h-4 w-4 text-primary" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                    aria-label="Chat com entregador"
                    onClick={() => {
                      window.open(`https://wa.me/55${driver.phone}`, '_blank')
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
