'use client'

import { useState, useEffect, useCallback } from 'react'
import { Truck, Clock, MapPin, ChevronRight, Check } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'

interface Neighborhood {
  name: string
  fee: number
  freeAbove: number | null
  time: string
  icon: string
}

const neighborhoods: Neighborhood[] = [
  { name: 'Centro', fee: 3.00, freeAbove: 40, time: '15-25 min', icon: '🏢' },
  { name: 'Vila Nova', fee: 4.00, freeAbove: 50, time: '20-35 min', icon: '🏘️' },
  { name: 'Zona Rural', fee: 8.00, freeAbove: 200, time: '40-60 min', icon: '🌾' },
  { name: 'São Pedro', fee: 5.00, freeAbove: 60, time: '25-40 min', icon: '⛪' },
  { name: 'Jardim América', fee: 4.50, freeAbove: 45, time: '20-30 min', icon: '🌳' },
]

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function CountUp({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  
  useEffect(() => {
    const duration = 600
    const steps = 30
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setDisplay(target)
        clearInterval(timer)
      } else {
        setDisplay(Math.round(current * 100) / 100)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])
  
  return <span>{prefix}{display.toFixed(2).replace('.', ',')}{suffix}</span>
}

export function DeliveryFeeCalculator() {
  const { selectedNeighborhood, openNeighborhoodSelector } = useAppStore()
  const [expanded, setExpanded] = useState(false)
  
  const current = neighborhoods.find(n => n.name === selectedNeighborhood) || neighborhoods[0]

  const handleNeighborhoodClick = useCallback(() => {
    openNeighborhoodSelector()
  }, [openNeighborhoodSelector])

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl border border-primary/10 overflow-hidden"
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-primary/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"
            >
              <Truck className="h-5 w-5 text-primary" />
            </motion.div>
            <div>
              <h3 className="font-bold text-sm">Taxa de Entrega</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-primary" />
                {current.name}
                <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              <CountUp target={current.fee} prefix="R$ " />
            </div>
            {current.freeAbove && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Grátis acima de {formatBRL(current.freeAbove)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              <div className="h-px bg-primary/10" />
              
              <p className="text-xs font-semibold text-muted-foreground mt-2">Bairros atendidos</p>
              
              {neighborhoods.map((neighborhood, index) => {
                const isSelected = neighborhood.name === selectedNeighborhood
                return (
                  <motion.div
                    key={neighborhood.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={handleNeighborhoodClick}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-primary/5'
                    }`}
                  >
                    <span className="text-lg">{neighborhood.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">{neighborhood.name}</span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                          >
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          </motion.div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {neighborhood.time}
                        </span>
                        {neighborhood.freeAbove && (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Grátis ≥{formatBRL(neighborhood.freeAbove)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {formatBRL(neighborhood.fee)}
                    </span>
                  </motion.div>
                )
              })}

              <button
                onClick={handleNeighborhoodClick}
                className="w-full text-center text-xs text-primary hover:underline mt-2 py-1"
              >
                Alterar bairro de entrega
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
