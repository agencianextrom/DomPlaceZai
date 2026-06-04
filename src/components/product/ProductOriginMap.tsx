'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Leaf, Package, Warehouse, Home, Route, Truck, Sprout } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

/* ── Supply chain stops ── */
const supplyStops = [
  {
    id: 'produtor',
    label: 'Produtor',
    icon: Sprout,
    x: 35,
    y: 58,
    color: '#84cc16',
    distance: '0 km',
    time: 'Início',
    description: 'Colheita e produção local',
  },
  {
    id: 'armazem',
    label: 'Armazém',
    icon: Warehouse,
    x: 55,
    y: 42,
    color: '#f59e0b',
    distance: '15 km',
    time: '20 min',
    description: 'Classificação e armazenamento',
  },
  {
    id: 'loja',
    label: 'Loja',
    icon: Package,
    x: 72,
    y: 55,
    color: '#14b8a6',
    distance: '25 km',
    time: '45 min',
    description: 'Exposição e venda',
  },
  {
    id: 'casa',
    label: 'Sua Casa',
    icon: Home,
    x: 88,
    y: 48,
    color: '#10b981',
    distance: '35 km',
    time: '1h',
    description: 'Entrega final',
  },
]

/* ── SVG Brazil map simplified ── */
function BrazilMap() {
  return (
    <svg viewBox="0 0 120 130" className="w-full h-full" fill="none">
      {/* Brazil outline (simplified) */}
      <path
        d="M60 8 C75 5 100 15 108 30 C115 45 110 65 100 80 C90 95 75 110 60 118 C45 110 25 100 18 85 C10 70 8 50 15 35 C22 20 45 10 60 8Z"
        fill="rgba(16,185,129,0.08)"
        stroke="rgba(16,185,129,0.25)"
        strokeWidth="0.8"
        className="r32-brazil-outline"
      />
      {/* Pará state highlight */}
      <path
        d="M48 10 C55 8 68 12 78 20 C85 26 92 35 88 42 C84 48 70 46 60 50 C52 52 42 46 38 38 C34 30 40 14 48 10Z"
        fill="rgba(16,185,129,0.2)"
        stroke="rgba(16,185,129,0.5)"
        strokeWidth="0.8"
        className="r32-para-highlight"
      />
      {/* Dot for Dom Eliseu */}
      <motion.circle
        cx="58"
        cy="34"
        r="2"
        fill="#10b981"
        className="r32-location-dot"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 1.5, 1] }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
      <motion.circle
        cx="58"
        cy="34"
        r="5"
        fill="none"
        stroke="#10b981"
        strokeWidth="0.5"
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: [0, 1, 2], opacity: [0.6, 0.3, 0] }}
        transition={{ duration: 2, delay: 1, repeat: Infinity }}
      />
      {/* Label */}
      <text x="58" y="28" textAnchor="middle" fill="#10b981" fontSize="3" fontWeight="bold" className="select-none">
        Dom Eliseu
      </text>
    </svg>
  )
}

/* ── Sourcing badge component ── */
function SourcingBadge({ distance, label, color }: { distance: number; label: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold`}
      style={{
        borderColor: `${color}33`,
        backgroundColor: `${color}11`,
        color: color,
      }}
    >
      <Leaf className="h-3.5 w-3.5" />
      <span>{label}</span>
      <span className="text-[9px] opacity-70">(&lt;{distance}km)</span>
    </motion.div>
  )
}

/* ── Main component ── */
export function ProductOriginMap() {
  const [pathDrawn, setPathDrawn] = useState(false)
  const [activeStop, setActiveStop] = useState<string | null>(null)
  const [distanceKm] = useState(35)
  const [co2Kg] = useState(2.8)
  const svgRef = useRef<SVGSVGElement>(null)

  // Trigger path drawing animation
  useEffect(() => {
    const timer = setTimeout(() => setPathDrawn(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const getSourcingBadge = (dist: number) => {
    if (dist < 50) return { label: 'Produto Local', color: '#10b981' }
    if (dist < 200) return { label: 'Regional', color: '#f59e0b' }
    return { label: 'Nacional', color: '#6366f1' }
  }

  const sourcingBadge = getSourcingBadge(distanceKm)

  return (
    <div className="r32-origin-map">
      {/* ── Title ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4"
      >
        <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Origem do Produto</h3>
          <p className="text-[10px] text-muted-foreground">Rastreie a jornada do produto até você</p>
        </div>
      </motion.div>

      {/* ── Brazil Map with Pará highlight ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative h-48 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200/30 dark:border-emerald-800/20 overflow-hidden mb-4"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }} />

        <div className="relative p-4">
          <BrazilMap />
        </div>

        {/* Sourcing badge overlay */}
        <div className="absolute bottom-3 right-3">
          <SourcingBadge distance={50} label={sourcingBadge.label} color={sourcingBadge.color} />
        </div>
      </motion.div>

      {/* ── Supply chain visualization ── */}
      <Card className="border-emerald-200/30 dark:border-emerald-800/20 overflow-hidden mb-4">
        <CardContent className="p-4">
          <h4 className="font-semibold text-xs flex items-center gap-1.5 mb-3">
            <Route className="h-3.5 w-3.5 text-primary" />
            Cadeia de suprimento
          </h4>

          {/* Supply chain SVG */}
          <div className="relative">
            <svg ref={svgRef} viewBox="0 0 100 70" className="w-full h-20" fill="none">
              {/* Connecting path */}
              <path
                d={`M${supplyStops[0].x} ${supplyStops[0].y} 
                    C${(supplyStops[0].x + supplyStops[1].x) / 2} ${(supplyStops[0].y + supplyStops[1].y) / 2 - 10},
                     ${(supplyStops[0].x + supplyStops[1].x) / 2 + 5} ${(supplyStops[0].y + supplyStops[1].y) / 2 + 5},
                     ${supplyStops[1].x} ${supplyStops[1].y}
                    C${(supplyStops[1].x + supplyStops[2].x) / 2} ${supplyStops[1].y + 10},
                     ${(supplyStops[1].x + supplyStops[2].x) / 2 - 5} ${supplyStops[2].y - 8},
                     ${supplyStops[2].x} ${supplyStops[2].y}
                    C${(supplyStops[2].x + supplyStops[3].x) / 2} ${supplyStops[2].y - 5},
                     ${(supplyStops[2].x + supplyStops[3].x) / 2} ${supplyStops[3].y + 5},
                     ${supplyStops[3].x} ${supplyStops[3].y}`}
                stroke="rgba(16,185,129,0.15)"
                strokeWidth="1"
                strokeDasharray="3 2"
              />
              {/* Animated path drawing */}
              <motion.path
                d={`M${supplyStops[0].x} ${supplyStops[0].y} 
                    C${(supplyStops[0].x + supplyStops[1].x) / 2} ${(supplyStops[0].y + supplyStops[1].y) / 2 - 10},
                     ${(supplyStops[0].x + supplyStops[1].x) / 2 + 5} ${(supplyStops[0].y + supplyStops[1].y) / 2 + 5},
                     ${supplyStops[1].x} ${supplyStops[1].y}
                    C${(supplyStops[1].x + supplyStops[2].x) / 2} ${supplyStops[1].y + 10},
                     ${(supplyStops[1].x + supplyStops[2].x) / 2 - 5} ${supplyStops[2].y - 8},
                     ${supplyStops[2].x} ${supplyStops[2].y}
                    C${(supplyStops[2].x + supplyStops[3].x) / 2} ${supplyStops[2].y - 5},
                     ${(supplyStops[2].x + supplyStops[3].x) / 2} ${supplyStops[3].y + 5},
                     ${supplyStops[3].x} ${supplyStops[3].y}`}
                stroke="#10b981"
                strokeWidth="1.5"
                fill="none"
                initial={{ strokeDasharray: '1000', strokeDashoffset: 1000 }}
                animate={pathDrawn ? { strokeDashoffset: 0 } : {}}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />

              {/* Stop nodes */}
              {supplyStops.map((stop, stopIdx) => {
                const Icon = stop.icon
                const isActive = activeStop === stop.id
                return (
                  <motion.g
                    key={stop.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + stopIdx * 0.3 }}
                    onClick={() => setActiveStop(isActive ? null : stop.id)}
                    className="cursor-pointer"
                  >
                    {/* Pulse ring */}
                    {isActive && (
                      <motion.circle
                        cx={stop.x}
                        cy={stop.y}
                        r="8"
                        fill="none"
                        stroke={stop.color}
                        strokeWidth="0.5"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}

                    {/* Node circle */}
                    <motion.circle
                      cx={stop.x}
                      cy={stop.y}
                      r={isActive ? 6 : 4.5}
                      fill={stop.color}
                      stroke="white"
                      strokeWidth="1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + stopIdx * 0.3, type: 'spring' as const, stiffness: 400, damping: 20 }}
                      whileHover={{ scale: 1.3 }}
                    />

                    {/* Label */}
                    <text
                      x={stop.x}
                      y={stop.y - 8}
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="3.2"
                      fontWeight="600"
                      className="fill-foreground select-none"
                    >
                      {stop.label}
                    </text>

                    {/* Distance badge */}
                    {stop.distance !== '0 km' && (
                      <text
                        x={stop.x}
                        y={stop.y + 10}
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize="2.5"
                        className="fill-muted-foreground select-none"
                      >
                        {stop.distance}
                      </text>
                    )}
                  </motion.g>
                )
              })}
            </svg>
          </div>

          {/* Active stop details */}
          <AnimatePresence>
            {activeStop && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                {supplyStops.filter((s) => s.id === activeStop).map((stop) => (
                  <div key={stop.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stop.color}22` }}>
                      <stop.icon className="h-4 w-4" style={{ color: stop.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{stop.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Distância: {stop.distance} · Tempo: {stop.time}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ── Journey timeline ── */}
      <div className="mb-4">
        <h4 className="font-semibold text-xs mb-3 flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-primary" />
          Jornada do produto
        </h4>
        <div className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-3 top-1 bottom-1 w-0.5 bg-gradient-to-b from-lime-400 via-amber-400 via-teal-400 to-emerald-500 rounded-full" />

          {supplyStops.map((stop, tlIdx) => {
            const Icon = stop.icon
            return (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + tlIdx * 0.15 }}
                className="relative pb-4 last:pb-0"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-[-18px] top-0.5 h-3 w-3 rounded-full border-2 border-background"
                  style={{ backgroundColor: stop.color }}
                />

                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: stop.color }} />
                  <div>
                    <p className="text-xs font-semibold">{stop.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {stop.distance !== '0 km' ? `${stop.distance} · ` : ''}{stop.time}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <Separator className="my-3" />

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/30 dark:border-emerald-800/20"
        >
          <p className="text-[10px] text-muted-foreground mb-1">Distância percorrida</p>
          <div className="flex items-baseline justify-center gap-1">
            <AnimatedCounter value={distanceKm} duration={1500} delay={500} locale />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">km</span>
          </div>
          <Route className="h-3 w-3 mx-auto mt-1 text-emerald-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="text-center p-3 rounded-xl bg-teal-50 dark:bg-teal-900/10 border border-teal-200/30 dark:border-teal-800/20"
        >
          <p className="text-[10px] text-muted-foreground mb-1">Carbono na viagem</p>
          <div className="flex items-baseline justify-center gap-1">
            <AnimatedCounter value={co2Kg} duration={1500} delay={600} decimals={1} locale />
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">kg CO₂</span>
          </div>
          <Leaf className="h-3 w-3 mx-auto mt-1 text-teal-500" />
        </motion.div>
      </div>

      {/* ── Sourcing badges ── */}
      <div className="mt-4 flex gap-2 flex-wrap">
        <SourcingBadge distance={50} label="Produto Local" color="#10b981" />
        <SourcingBadge distance={200} label="Regional" color="#f59e0b" />
        <SourcingBadge distance={9999} label="Nacional" color="#6366f1" />
      </div>
    </div>
  )
}
