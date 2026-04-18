'use client'

import { useState, useEffect } from 'react'
import { MapPin, Phone, MessageCircle, Clock, Truck, Star, Navigation, Store } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// ─── Leaflet dynamically imported (no SSR) ───
const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), { ssr: false })

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

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative w-full h-56 sm:h-64 lg:h-72 rounded-2xl overflow-hidden">
        {/* Leaflet Map */}
        <LeafletMapInner
          storeName={storeName}
          driverProgress={driverProgress}
        />

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute top-3 right-3 bg-emerald-500/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md z-[1000]"
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
          className="absolute bottom-3 left-3 bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-lg border border-border/50 z-[1000]"
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
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-full h-8 w-8 flex items-center justify-center shadow-md border border-border/50 z-[1000]">
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
