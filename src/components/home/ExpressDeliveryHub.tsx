'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, Zap, Clock, MapPin, Star, Bike, Navigation, Package, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/* ── Mock data ── */
const expressOptions = [
  {
    id: 'expresso-1h',
    name: 'Expresso 1h',
    description: 'Entrega ultra-rápida em até 1 hora',
    time: '30-60 min',
    price: 9.90,
    icon: Zap,
    gradient: 'from-red-500 to-orange-500',
    badge: 'Mais rápido',
  },
  {
    id: 'super-rapido-2h',
    name: 'Super Rápido 2h',
    description: 'Entrega rápida em até 2 horas',
    time: '1-2h',
    price: 6.90,
    icon: Truck,
    gradient: 'from-amber-500 to-yellow-500',
    badge: 'Popular',
  },
  {
    id: 'agendado',
    name: 'Agendado',
    description: 'Escolha o melhor horário para receber',
    time: 'Mesmo dia',
    price: 3.90,
    icon: Clock,
    gradient: 'from-blue-500 to-cyan-500',
    badge: null,
  },
  {
    id: 'retirada',
    name: 'Retirada',
    description: 'Retire na loja quando quiser',
    time: 'Imediato',
    price: 0,
    icon: MapPin,
    gradient: 'from-emerald-500 to-teal-500',
    badge: 'Grátis',
  },
]

const mockDrivers = [
  {
    id: 'd1',
    name: 'Carlos Silva',
    avatar: 'CS',
    rating: 4.9,
    deliveries: 1250,
    vehicle: 'Moto',
    distance: '0.8 km',
    online: true,
  },
  {
    id: 'd2',
    name: 'Ana Costa',
    avatar: 'AC',
    rating: 4.8,
    deliveries: 890,
    vehicle: 'Bicicleta',
    distance: '1.2 km',
    online: true,
  },
  {
    id: 'd3',
    name: 'Pedro Santos',
    avatar: 'PS',
    rating: 4.7,
    deliveries: 2100,
    vehicle: 'Carro',
    distance: '2.1 km',
    online: false,
  },
]

const trackingStops = [
  { id: 'loja', label: 'Loja', x: 10, y: 50 },
  { id: 'rota1', label: '', x: 30, y: 35 },
  { id: 'rota2', label: '', x: 55, y: 55 },
  { id: 'rota3', label: '', x: 75, y: 40 },
  { id: 'casa', label: 'Sua Casa', x: 92, y: 50 },
]

/* ── Loading skeleton ── */
function ExpressSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  )
}

/* ── Main component ── */
export function ExpressDeliveryHub() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [trackingProgress, setTrackingProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Simulate tracking animation
  useEffect(() => {
    if (selectedOption) {
      intervalRef.current = setInterval(() => {
        setTrackingProgress((prev) => {
          if (prev >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            return 100
          }
          return prev + 2
        })
      }, 80)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [selectedOption])

  // Reset progress when selection changes
  useEffect(() => {
    setTrackingProgress(0)
  }, [selectedOption])

  const handleSelect = useCallback((id: string) => {
    setSelectedOption((prev) => (prev === id ? null : id))
  }, [])

  const handlePedirAgora = useCallback(() => {
    if (!selectedOption) return
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)
  }, [selectedOption])

  const formatPrice = (price: number) => {
    return price === 0 ? 'Grátis' : `R$${price.toFixed(2).replace('.', ',')}`
  }

  if (isLoading) {
    return <ExpressSkeleton />
  }

  return (
    <div className="r32-express-hub">
      {/* ── Hero section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white"
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute top-4 right-20 h-12 w-12 rounded-full bg-white/[0.04]" />

        {/* Animated delivery truck */}
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-5xl mb-3"
        >
          🚚
        </motion.div>

        <h2 className="text-2xl font-bold">Entrega Expressa</h2>
        <p className="text-sm text-white/80 mt-1">
          Receba seus pedidos mais rápido em Dom Eliseu
        </p>

        {/* Live status badge */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs"
        >
          <span className="h-2 w-2 rounded-full bg-green-400 r32-pulse-dot" />
          <span>3 entregadores ativos agora</span>
        </motion.div>
      </motion.div>

      {/* ── Express options ── */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {expressOptions.map((option, optIdx) => {
          const isSelected = selectedOption === option.id
          const Icon = option.icon

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + optIdx * 0.08, type: 'spring' as const, stiffness: 260, damping: 22 }}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(option.id)}
              className={`relative cursor-pointer rounded-xl border-2 transition-all overflow-hidden r37-express-card ${
                isSelected
                  ? 'border-primary shadow-lg'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {/* Glow ring when selected */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-xl r32-glow-ring"
                  />
                )}
              </AnimatePresence>

              {/* Checkmark badge */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                    className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative p-3">
                {/* Icon */}
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-2 shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>

                {/* Info */}
                <p className="font-bold text-sm">{option.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{option.description}</p>

                {/* Time + Price */}
                <div className="flex items-center justify-between mt-2">
                  <motion.span
                    className="text-xs font-semibold text-primary r37-timer-glow inline-flex items-center"
                    animate={{ filter: ['drop-shadow(0 0 2px rgba(59,130,246,0.2))', 'drop-shadow(0 0 8px rgba(59,130,246,0.5))', 'drop-shadow(0 0 2px rgba(59,130,246,0.2))'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                  >
                    {option.time}
                  </motion.span>
                  <span className={`text-xs font-bold ${option.price === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                    {formatPrice(option.price)}
                  </span>
                </div>

                {/* Badge */}
                {option.badge && (
                  <motion.div
                    animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                    style={{ boxShadow: '0 0 10px rgba(245,158,11,0.25)' }}
                  >
                    <Badge className="absolute top-2 left-2 text-[9px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 font-bold">
                      {option.badge}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Live tracking simulation ── */}
      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <Card className="border-primary/20 overflow-hidden r62-card-lift r90-express-delivery">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Acompanhamento ao vivo</span>
                  <Badge variant="secondary" className="text-[9px] ml-auto bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-0">
                    {trackingProgress < 100 ? 'A caminho' : 'Entregue!'}
                  </Badge>
                </div>

                {/* Route visualization */}
                <div className="relative h-16 r32-tracking-route r37-map-grid">
                  {/* Animated grid pattern overlay */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none opacity-[0.08]"
                    animate={{ backgroundPosition: ['0 0', '20px 20px'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' as const }}
                    style={{
                      backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  {/* Route line */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                    <path
                      d="M10 30 Q 25 15 40 35 Q 55 50 70 30 Q 80 20 90 30"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      className="text-muted-foreground/30"
                      strokeDasharray="4 3"
                    />
                    <path
                      d="M10 30 Q 25 15 40 35 Q 55 50 70 30 Q 80 20 90 30"
                      stroke="rgba(16,185,129,0.6)"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${trackingProgress * 1.2} 200`}
                      className="r32-route-animated"
                    />
                  </svg>

                  {/* Progress dots */}
                  {trackingStops.map((stop, stopIdx) => {
                    const isPassed = (trackingProgress / 100) * (trackingStops.length - 1) >= stopIdx
                    return (
                      <motion.div
                        key={stop.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: stopIdx * 0.1, type: 'spring' as const }}
                        className="absolute"
                        style={{ left: `${stop.x}%`, top: `${stop.y}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        {isPassed && stopIdx < trackingStops.length - 1 ? (
                          <div className="h-3 w-3 rounded-full bg-emerald-500 r32-pulse-dot" />
                        ) : stopIdx === trackingStops.length - 1 && trackingProgress >= 100 ? (
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.6 }}
                            className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 text-white" />
                          </motion.div>
                        ) : (
                          <div className="h-3 w-3 rounded-full bg-muted-foreground/30 border border-border" />
                        )}
                        {stop.label && (
                          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap">
                            {stop.label}
                          </span>
                        )}
                      </motion.div>
                    )
                  })}

                  {/* Animated moving dot */}
                  {trackingProgress > 0 && trackingProgress < 100 && (
                    <motion.div
                      animate={{ left: `${10 + (trackingProgress / 100) * 80}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="absolute top-[50%] -translate-y-1/2"
                    >
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-lg r32-moving-dot">
                        <Bike className="h-3 w-3 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full r32-progress-fill"
                    style={{ width: `${trackingProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 text-right">
                  {trackingProgress >= 100 ? 'Pedido entregue com sucesso!' : `${Math.round(trackingProgress)}% do trajeto`}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nearby drivers ── */}
      <div className="mt-5">
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-primary" />
          Entregadores próximos
        </h3>
        <div className="space-y-2">
          {mockDrivers.map((driver, drvIdx) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + drvIdx * 0.1 }}
              whileHover={{ x: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all cursor-pointer"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {driver.avatar}
                </div>
                {driver.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background r32-pulse-dot" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs">{driver.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                    <Star className="h-3 w-3 fill-current" />
                    {driver.rating}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {driver.vehicle} · {driver.distance}
                  </span>
                </div>
              </div>

              {/* Status */}
              <Badge
                variant="secondary"
                className={`text-[9px] px-2 py-0.5 border-0 ${
                  driver.online
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {driver.online ? 'Online' : 'Offline'}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Pedir agora CTA ── */}
      <motion.div
        ref={confettiRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-5"
      >
        <Button
          onClick={handlePedirAgora}
          disabled={!selectedOption}
          className="w-full h-12 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white font-bold text-sm rounded-xl gap-2 btn-glow disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        >
          {selectedOption ? (
            <>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Zap className="h-4 w-4" />
              </motion.div>
              Pedir agora — {formatPrice(expressOptions.find((o) => o.id === selectedOption)?.price ?? 0)}
            </>
          ) : (
            <>
              <Truck className="h-4 w-4" />
              Selecione uma opção de entrega
            </>
          )}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>

        {/* Confetti burst */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              {[...Array(12)].map((_, ci) => (
                <motion.div
                  key={ci}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 1,
                    opacity: 1,
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 120 - 40,
                    scale: 0,
                    opacity: 0,
                    rotate: Math.random() * 360,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor: ['#10b981', '#f59e0b', '#f43f5e', '#14b8a6', '#84cc16', '#6366f1'][ci % 6],
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
