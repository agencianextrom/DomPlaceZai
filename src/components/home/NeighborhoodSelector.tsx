'use client'

import { useState } from 'react'
import { MapPin, Clock, Truck, Check, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
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

export function NeighborhoodSelector() {
  const { neighborhoodSelectorOpen, closeNeighborhoodSelector, selectedNeighborhood, setSelectedNeighborhood } = useAppStore()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

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

        <div className="px-4 pb-6">
          {/* Drag indicator */}
          <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base">Selecione seu bairro</h3>
              <p className="text-xs text-muted-foreground">Escolha para ver taxas e tempos de entrega</p>
            </div>
          </div>

          {/* Current selection */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 rounded-xl p-3 mb-4 flex items-center gap-2"
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm">Entregando em</span>
            <Badge className="bg-primary text-primary-foreground border-0 text-[10px] font-semibold">
              {selectedNeighborhood}
            </Badge>
          </motion.div>

          {/* Neighborhood list */}
          <div className="space-y-2">
            {neighborhoods.map((neighborhood, index) => {
              const isSelected = neighborhood.name === selectedNeighborhood
              const isHovered = hoveredItem === neighborhood.name
              
              return (
                <motion.div
                  key={neighborhood.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.07, duration: 0.3 }}
                  onMouseEnter={() => setHoveredItem(neighborhood.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleSelect(neighborhood.name)}
                  className={`relative p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary/5 border-primary/30 shadow-sm'
                      : isHovered
                        ? 'bg-secondary/50 border-border'
                        : 'bg-card border-border hover:border-primary/15'
                  }`}
                >
                  {/* Content */}
                  <div className="flex items-center gap-3">
                    <motion.span 
                      className="text-2xl" 
                      animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
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
                            <Badge className="bg-primary text-primary-foreground border-0 text-[9px] px-1.5 py-0">
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
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3 text-amber-500" />
                          {neighborhood.time}
                        </span>
                        {neighborhood.freeAbove && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Grátis ≥{formatBRL(neighborhood.freeAbove)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isSelected ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-7 w-7 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </motion.div>
                      ) : (
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
                      )}
                    </div>
                  </div>

                  {/* Animated selection indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="neighborhood-selection"
                      className="absolute inset-0 rounded-xl border-2 border-primary/20 pointer-events-none"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Footer info */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-muted-foreground">
              A taxa e o tempo de entrega podem variar por loja
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
