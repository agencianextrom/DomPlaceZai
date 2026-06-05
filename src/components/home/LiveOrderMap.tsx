'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Clock, Package, Truck, Bike, User, RefreshCw, X, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface DeliveryStatus {
  id: string
  orderNumber: string
  status: 'picking_up' | 'in_transit' | 'almost_there'
  driverName: string
  itemCount: number
  eta: string
  pickupX: number
  pickupY: number
  destX: number
  destY: number
  progress: number
}

type FilterTab = 'all' | 'in_transit' | 'delivering' | 'almost'

const statusLabels: Record<DeliveryStatus['status'], string> = {
  picking_up: 'Retirando',
  in_transit: 'A caminho',
  almost_there: 'Quase lá',
}

const statusColors: Record<DeliveryStatus['status'], string> = {
  picking_up: 'bg-amber-500',
  in_transit: 'bg-blue-500',
  almost_there: 'bg-emerald-500',
}

const statusTextColors: Record<DeliveryStatus['status'], string> = {
  picking_up: 'text-amber-600 dark:text-amber-400',
  in_transit: 'text-blue-600 dark:text-blue-400',
  almost_there: 'text-emerald-600 dark:text-emerald-400',
}

const vehicleIcons: Record<DeliveryStatus['status'], string> = {
  picking_up: '🛒',
  in_transit: '🛵',
  almost_there: '🚴',
}

const initialDeliveries: DeliveryStatus[] = [
  { id: 'd1', orderNumber: '#PED-4821', status: 'in_transit', driverName: 'Carlos Silva', itemCount: 4, eta: '12 min', pickupX: 20, pickupY: 30, destX: 70, destY: 65, progress: 0.45 },
  { id: 'd2', orderNumber: '#PED-4822', status: 'picking_up', driverName: 'Maria Santos', itemCount: 2, eta: '25 min', pickupX: 80, pickupY: 20, destX: 35, destY: 70, progress: 0.1 },
  { id: 'd3', orderNumber: '#PED-4823', status: 'almost_there', driverName: 'João Oliveira', itemCount: 6, eta: '3 min', pickupX: 15, pickupY: 75, destX: 55, destY: 40, progress: 0.88 },
  { id: 'd4', orderNumber: '#PED-4824', status: 'in_transit', driverName: 'Ana Costa', itemCount: 1, eta: '18 min', pickupX: 60, pickupY: 80, destX: 25, destY: 25, progress: 0.35 },
  { id: 'd5', orderNumber: '#PED-4825', status: 'almost_there', driverName: 'Pedro Lima', itemCount: 3, eta: '5 min', pickupX: 45, pickupY: 15, destX: 75, destY: 55, progress: 0.82 },
  { id: 'd6', orderNumber: '#PED-4826', status: 'picking_up', driverName: 'Lucia Ferreira', itemCount: 5, eta: '30 min', pickupX: 10, pickupY: 55, destX: 85, destY: 35, progress: 0.05 },
]

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function LiveOrderMapSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="w-full h-72 rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
  )
}

export function LiveOrderMap() {
  const [isLoading, setIsLoading] = useState(true)
  const [deliveries, setDeliveries] = useState<DeliveryStatus[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryStatus | null>(null)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [refreshKey, setRefreshKey] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setDeliveries(initialDeliveries)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isLoading) return
    const interval = setInterval(() => {
      setTick(prev => prev + 1)
      setDeliveries(prev => prev.map(d => ({
        ...d,
        progress: Math.min(0.95, d.progress + (Math.random() * 0.03)),
        eta: d.progress > 0.85
          ? `${Math.max(1, Math.floor((1 - d.progress) * 40))} min`
          : `${Math.max(1, Math.floor((1 - d.progress) * 30))} min`,
      })))
    }, 10000)
    return () => clearInterval(interval)
  }, [isLoading])

  const filteredDeliveries = deliveries.filter(d => {
    if (filter === 'all') return true
    if (filter === 'in_transit') return d.status === 'in_transit' || d.status === 'picking_up'
    if (filter === 'delivering') return d.status === 'in_transit'
    if (filter === 'almost') return d.status === 'almost_there'
    return true
  })

  const activeCount = deliveries.length
  const transitCount = deliveries.filter(d => d.status === 'in_transit' || d.status === 'picking_up').length
  const deliveredToday = 47

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
    setDeliveries(initialDeliveries.map(d => ({
      ...d,
      progress: Math.random() * 0.9,
      eta: `${Math.floor(Math.random() * 25 + 3)} min`,
    })))
  }, [])

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'in_transit', label: 'A caminho' },
    { key: 'delivering', label: 'Entregando' },
    { key: 'almost', label: 'Quase lá' },
  ]

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
            <Navigation className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              Acompanhe ao Vivo
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-2.5 w-2.5 rounded-full bg-red-500"
              />
            </h3>
            <p className="text-xs text-muted-foreground">Entregas em andamento na sua região</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center"
          aria-label="Atualizar mapa"
        >
          <motion.div
            key={refreshKey}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.button>
      </div>

      {isLoading ? (
        <div className="px-4 pb-4">
          <LiveOrderMapSkeleton />
        </div>
      ) : (
        <>
          {/* Stats Bar */}
          <div className="px-4 pb-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { value: activeCount, label: 'entregas ativas', color: 'from-blue-500/10 to-cyan-500/10', textColor: 'text-blue-600 dark:text-blue-400', icon: Package },
                { value: transitCount, label: 'a caminho', color: 'from-amber-500/10 to-orange-500/10', textColor: 'text-amber-600 dark:text-amber-400', icon: Truck },
                { value: deliveredToday, label: 'entregas hoje', color: 'from-emerald-500/10 to-green-500/10', textColor: 'text-emerald-600 dark:text-emerald-400', icon: Bike },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gradient-to-br ${stat.color} rounded-xl p-2.5 text-center border border-border/50`}
                >
                  <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.textColor}`} />
                  <p className={`text-lg font-bold ${stat.textColor}`}>{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(tab.key)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    filter === tab.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/30'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'all' && (
                    <span className="ml-1 text-[10px]">({deliveries.length})</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Map Area */}
          <div className="px-4 pb-3">
            <div className="relative bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 dark:from-blue-950/20 dark:via-green-950/20 dark:to-cyan-950/20 rounded-2xl overflow-hidden" style={{ height: 280 }}>
              {/* Grid lines for map feel */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.06]" aria-hidden="true">
                <defs>
                  <pattern id="r30-map-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#000000" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#r30-map-grid)" />
              </svg>

              {/* Roads */}
              <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(0,0,0,0.07)" strokeWidth="2" strokeDasharray="8 4" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(0,0,0,0.07)" strokeWidth="2" strokeDasharray="8 4" />
                <line x1="20%" y1="0" x2="80%" y2="100%" stroke="rgba(0,0,0,0.04)" strokeWidth="1" strokeDasharray="4 6" />
                <line x1="10%" y1="60%" x2="90%" y2="30%" stroke="rgba(0,0,0,0.04)" strokeWidth="1" strokeDasharray="4 6" />
              </svg>

              {/* Delivery Routes and Vehicles */}
              {filteredDeliveries.map((delivery, idx) => {
                const vehicleX = lerp(delivery.pickupX, delivery.destX, delivery.progress)
                const vehicleY = lerp(delivery.pickupY, delivery.destY, delivery.progress)
                return (
                  <g key={`${delivery.id}-${tick}`}>
                    {/* Route path */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                      <motion.line
                        x1={`${delivery.pickupX}%`}
                        y1={`${delivery.pickupY}%`}
                        x2={`${delivery.destX}%`}
                        y2={`${delivery.destY}%`}
                        stroke={
                          delivery.status === 'almost_there' ? 'rgba(16,185,129,0.35)' :
                          delivery.status === 'in_transit' ? 'rgba(59,130,246,0.35)' :
                          'rgba(245,158,11,0.35)'
                        }
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, delay: idx * 0.15 }}
                      />
                    </svg>

                    {/* Pickup dot */}
                    <motion.div
                      className="absolute"
                      style={{ left: `${delivery.pickupX}%`, top: `${delivery.pickupY}%`, transform: 'translate(-50%, -50%)' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 + 0.3, type: 'spring' as const, stiffness: 400, damping: 20 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                        className="absolute inset-0 rounded-full bg-amber-400"
                        style={{ width: 24, height: 24, left: -6, top: -6 }}
                      />
                      <div className="h-4 w-4 rounded-full bg-amber-400 border-2 border-white shadow-md flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                      </div>
                    </motion.div>

                    {/* Destination dot */}
                    <motion.div
                      className="absolute"
                      style={{ left: `${delivery.destX}%`, top: `${delivery.destY}%`, transform: 'translate(-50%, -50%)' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 + 0.5, type: 'spring' as const, stiffness: 400, damping: 20 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 + 0.5 }}
                        className="absolute rounded-full bg-emerald-400"
                        style={{ width: 28, height: 28, left: -8, top: -8 }}
                      />
                      <div className="h-5 w-5 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center">
                        <MapPin className="h-2.5 w-2.5 text-white" />
                      </div>
                    </motion.div>

                    {/* Vehicle icon */}
                    <motion.button
                      className="absolute z-10 cursor-pointer"
                      style={{ left: `${vehicleX}%`, top: `${vehicleY}%`, transform: 'translate(-50%, -50%)' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 + 0.4, type: 'spring' as const, stiffness: 350, damping: 20 }}
                      whileHover={{ scale: 1.3 }}
                      onClick={() => setSelectedDelivery(selectedDelivery?.id === delivery.id ? null : delivery)}
                      aria-label={`Ver pedido ${delivery.orderNumber}`}
                    >
                      <motion.div
                        animate={{
                          x: [0, 1, 0, -1, 0],
                          y: [0, -0.5, 0, 0.5, 0],
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-8 w-8 rounded-full bg-white shadow-lg border-2 flex items-center justify-center text-base"
                        style={{
                          borderColor:
                            delivery.status === 'almost_there' ? 'rgba(16,185,129,0.8)' :
                            delivery.status === 'in_transit' ? 'rgba(59,130,246,0.8)' :
                            'rgba(245,158,11,0.8)',
                        }}
                      >
                        {vehicleIcons[delivery.status]}
                      </motion.div>
                    </motion.button>
                  </g>
                )
              })}

              {/* Legend */}
              <div className="absolute bottom-2 left-2 flex gap-2 opacity-70">
                <div className="flex items-center gap-1 bg-white/80 dark:bg-black/40 rounded-full px-2 py-0.5 text-[9px]">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  Retirada
                </div>
                <div className="flex items-center gap-1 bg-white/80 dark:bg-black/40 rounded-full px-2 py-0.5 text-[9px]">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  Destino
                </div>
              </div>

              {/* Location label */}
              <div className="absolute top-2 right-2 bg-white/80 dark:bg-black/40 rounded-lg px-2 py-1 text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" />
                Dom Eliseu, PA
              </div>
            </div>
          </div>

          {/* Selected Delivery Popup */}
          <AnimatePresence>
            {selectedDelivery && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                className="px-4 pb-4"
              >
                <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 rounded-xl p-3 border border-primary/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{vehicleIcons[selectedDelivery.status]}</span>
                      <div>
                        <p className="font-bold text-sm">{selectedDelivery.orderNumber}</p>
                        <Badge className={`text-[10px] ${statusColors[selectedDelivery.status]} text-white border-0`}>
                          {statusLabels[selectedDelivery.status]}
                        </Badge>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedDelivery(null)}
                      className="h-6 w-6 min-h-[44px] min-w-[44px] rounded-full bg-secondary flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                    {[
                      { icon: Package, label: 'Itens', value: selectedDelivery.itemCount.toString() },
                      { icon: Clock, label: 'ETA', value: selectedDelivery.eta },
                      { icon: User, label: 'Entregador', value: selectedDelivery.driverName.split(' ')[0] },
                    ].map((item) => (
                      <div key={item.label} className="bg-background/60 rounded-lg p-2">
                        <item.icon className="h-3.5 w-3.5 mx-auto text-primary mb-0.5" />
                        <p className="text-xs font-bold">{item.value}</p>
                        <p className="text-[9px] text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Progresso</span>
                      <span>{Math.round(selectedDelivery.progress * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: selectedDelivery.status === 'almost_there'
                            ? 'linear-gradient(90deg, rgba(16,185,129,0.7), rgba(16,185,129,1))'
                            : selectedDelivery.status === 'in_transit'
                            ? 'linear-gradient(90deg, rgba(59,130,246,0.7), rgba(59,130,246,1))'
                            : 'linear-gradient(90deg, rgba(245,158,11,0.7), rgba(245,158,11,1))',
                        }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${selectedDelivery.progress * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delivery List */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground">Pedidos ativos</p>
              <p className="text-xs text-primary font-medium">{filteredDeliveries.length} entregas</p>
            </div>
            <div className="space-y-2">
              {filteredDeliveries.map((delivery, idx) => (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06, type: 'spring' as const, stiffness: 300, damping: 25 }}
                  whileHover={{ x: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                  onClick={() => setSelectedDelivery(selectedDelivery?.id === delivery.id ? null : delivery)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/50 cursor-pointer hover:border-primary/20 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-white dark:bg-black/30 border flex items-center justify-center text-lg shadow-sm">
                    {vehicleIcons[delivery.status]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">{delivery.orderNumber}</p>
                      <Badge className={`text-[9px] px-1.5 py-0 ${statusTextColors[delivery.status]} bg-secondary border-0`}>
                        {statusLabels[delivery.status]}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{delivery.driverName} · {delivery.itemCount} itens</p>
                    <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden w-full">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor:
                            delivery.status === 'almost_there' ? 'rgba(16,185,129,1)' :
                            delivery.status === 'in_transit' ? 'rgba(59,130,246,1)' :
                            'rgba(245,158,11,1)',
                        }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${delivery.progress * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.08 }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-0.5 text-primary">
                      <Clock className="h-3 w-3" />
                      <p className="text-xs font-bold">{delivery.eta}</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
