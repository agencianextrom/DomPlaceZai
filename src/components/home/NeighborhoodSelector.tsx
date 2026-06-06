'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Clock, Truck, Check, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { toast } from 'sonner'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface NeighborhoodData {
  name: string
  fee: number
  freeAbove: number | null
  time: string
  icon: string
  description: string
}

const neighborhoods: NeighborhoodData[] = [
  { name: 'Centro', fee: 3.00, freeAbove: 40, time: '15-25 min', icon: '🏢', description: 'Centro da cidade, comércio e serviços' },
  { name: 'Vila Nova', fee: 4.00, freeAbove: 50, time: '20-35 min', icon: '🏘️', description: 'Bairro residencial com crescente comércio local' },
  { name: 'Zona Rural', fee: 8.00, freeAbove: 200, time: '40-60 min', icon: '🌾', description: 'Área rural e fazendas da região' },
  { name: 'São Pedro', fee: 5.00, freeAbove: 60, time: '25-40 min', icon: '⛪', description: 'Bairro com acesso fácil pela rodovia' },
  { name: 'Jardim América', fee: 4.50, freeAbove: 45, time: '20-30 min', icon: '🌳', description: 'Bairro residencial arborizado e familiar' },
]

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/** Parse the lower bound of a delivery time range string like "15-25 min" */
function parseDeliveryMin(time: string): number {
  const match = time.match(/(\d+)-\d+/)
  return match ? parseInt(match[1], 10) : 0
}

/** Animated counter badge that counts up to the target value */
function DeliveryBadge({ time }: { time: string }) {
  const target = parseDeliveryMin(time)
  const [display, setDisplay] = useState(0)
  const currentRef = useRef(0)

  useEffect(() => {
    if (target === 0) return
    currentRef.current = 0
    const duration = 800 // ms total
    const steps = target
    const interval = Math.max(duration / steps, 30)
    const timer = setInterval(() => {
      currentRef.current += 1
      setDisplay(currentRef.current)
      if (currentRef.current >= target) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [target])

  return (
    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
      <Clock className="h-3 w-3 text-amber-500" />
      <span className="font-mono tabular-nums">{display}-{target * 2} min</span>
    </span>
  )
}

/** A few subtle floating particles for visual interest */
function FloatingParticles() {
  const particles = [
    { size: 4, x: '15%', y: '20%', delay: 0, duration: 6 },
    { size: 3, x: '75%', y: '35%', delay: 1.5, duration: 7 },
    { size: 5, x: '45%', y: '70%', delay: 3, duration: 8 },
    { size: 3, x: '85%', y: '60%', delay: 2, duration: 5.5 },
    { size: 4, x: '30%', y: '85%', delay: 4, duration: 7.5 },
    { size: 3, x: '60%', y: '15%', delay: 0.8, duration: 6.5 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-emerald-400/20 dark:bg-emerald-400/10"
          style={{ width: p.size, height: p.size, left: p.x, top: p.y }}
          animate={{
            y: [0, -18, 0, 12, 0],
            x: [0, 8, -6, 4, 0],
            opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/** Floating location-themed emoji particles */
function LocationEmojiParticle({ emoji, delay, x, y }: { emoji: string; delay: number; x: string; y: string }) {
  return (
    <motion.span
      className="absolute text-base pointer-events-none z-10 select-none"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -12, 0],
        x: [0, 5, -3, 0],
        opacity: [0, 0.6, 0.6, 0],
        scale: [0.5, 1, 1, 0.5],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
      aria-hidden="true"
    >
      {emoji}
    </motion.span>
  )
}

export function NeighborhoodSelector() {
  const { neighborhoodSelectorOpen, closeNeighborhoodSelector, selectedNeighborhood, setSelectedNeighborhood } = useAppStore()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })

  const handleSelect = (name: string) => {
    setSelectedNeighborhood(name)
    toast.success(`Bairro alterado para ${name}`, {
      description: 'As taxas de entrega foram atualizadas',
      icon: <Check className="h-4 w-4 text-emerald-600" />,
    })
  }

  return (
    <Drawer open={neighborhoodSelectorOpen} onOpenChange={(open) => { if (!open) closeNeighborhoodSelector() }}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Selecionar Bairro</DrawerTitle>
          <DrawerDescription>Escolha seu bairro para calcular a taxa de entrega</DrawerDescription>
        </DrawerHeader>

        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="px-4 pb-6 relative glassmorphism-strong rounded-t-2xl r25-gradient-border r62-card-lift r97-neighborhood-selector" style={{ padding: '16px 16px 24px' }}
        >
          {/* Subtle floating particles */}
          <FloatingParticles />
          {/* Floating location-themed emoji particles */}
          <LocationEmojiParticle emoji="📍" delay={0} x="12%" y="25%" />
          <LocationEmojiParticle emoji="🗺️" delay={1.5} x="70%" y="50%" />
          <LocationEmojiParticle emoji="🏠" delay={3} x="40%" y="75%" />
          <LocationEmojiParticle emoji="✨" delay={4.5} x="85%" y="18%" />

          {/* Drag indicator */}
          <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <motion.div
              className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.1 }}
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <MapPin className="h-5 w-5 text-primary" />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <h3 className="font-bold text-base r62-heading-gradient">Selecione seu bairro</h3>
              <p className="text-xs text-muted-foreground">Escolha para ver taxas e tempos de entrega</p>
            </motion.div>
          </div>

          {/* Current selection */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-primary/5 rounded-xl p-3 mb-4 flex items-center gap-2"
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm r25-shimmer-text">Entregando em</span>
            <Badge className="bg-primary text-primary-foreground border-0 text-[10px] font-semibold">
              {selectedNeighborhood}
            </Badge>
          </motion.div>

          {/* Neighborhood list */}
          <div className="space-y-2 relative">
            {neighborhoods.map((neighborhood, index) => {
              const isSelected = neighborhood.name === selectedNeighborhood
              const isHovered = hoveredItem === neighborhood.name

              return (
                <motion.div
                  key={neighborhood.name}
                  /* 1. Spring entrance animation with stagger */
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 25,
                    delay: 0.25 + index * 0.07,
                  }}
                  /* 2. Hover lift effect with emerald glow shadow */
                  whileHover={{
                    y: -4,
                    scale: 1.02,
                    transition: { type: 'spring' as const, stiffness: 500, damping: 30 },
                  }}
                  onMouseEnter={() => setHoveredItem(neighborhood.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleSelect(neighborhood.name)}
                      className={`relative p-3.5 rounded-xl border cursor-pointer transition-all r25-card-lift ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400/60 shadow-[0_0_16px_rgba(16,185,129,0.25)] dark:shadow-[0_0_16px_rgba(16,185,129,0.15)]'
                      : isHovered
                        ? 'bg-secondary/50 border-border shadow-[0_4px_20px_rgba(16,185,129,0.12)] dark:shadow-[0_4px_20px_rgba(16,185,129,0.08)]'
                        : 'bg-card border-border hover:border-emerald-300/30 hover:shadow-[0_2px_12px_rgba(16,185,129,0.08)]'
                  }`}
                >
                  {/* Content */}
                  <div className="flex items-center gap-3">
                    <motion.span
                      className="text-2xl"
                      animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.4, type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      {neighborhood.icon}
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{neighborhood.name}</span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            <Badge className="bg-emerald-600 text-white border-0 text-[9px] px-1.5 py-0">
                              Atual
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{neighborhood.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Truck className="h-3 w-3 text-primary" />
                          {formatBRL(neighborhood.fee)}
                        </span>
                        {/* 4. Animated delivery estimate badge that counts up */}
                        <DeliveryBadge time={neighborhood.time} />
                        {neighborhood.freeAbove && (
                          <motion.span
                            className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                            transition={{ delay: 0.6 + index * 0.05 }}
                          >
                            Grátis ≥{formatBRL(neighborhood.freeAbove)}
                          </motion.span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {/* 3. Active neighborhood indicator — animated emerald border with checkmark */}
                      {isSelected ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                          className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.4)] r25-checkmark-glow"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>
                      ) : (
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
                      )}
                    </div>
                  </div>

                  {/* Animated emerald border indicator for selected item */}
                  {isSelected && (
                    <motion.div
                      layoutId="neighborhood-selection"
                      className="absolute inset-0 rounded-xl border-2 border-emerald-400/40 pointer-events-none"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      {/* Animated pulse ring */}
                      <motion.div
                        className="absolute inset-0 rounded-xl border border-emerald-400/20"
                        animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Footer info */}
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-[10px] text-muted-foreground">
              A taxa e o tempo de entrega podem variar por loja
            </p>
          </motion.div>
        </motion.div>
      </DrawerContent>
    </Drawer>
  )
}
