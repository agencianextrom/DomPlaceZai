'use client'

import { Fragment, useMemo, useState } from 'react'
import {
  Star,
  Truck,
  Clock,
  Package,
  Eye,
  ArrowRightLeft,
  Trophy,
  GitCompareArrows,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type StoreData } from '@/store/useAppStore'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getOpenHours(store: StoreData): string {
  if (!store.opensAt || !store.closesAt) return 'N/A'
  return `${store.opensAt} - ${store.closesAt}`
}

function computeOpenHoursMinutes(store: StoreData): number {
  if (!store.opensAt || !store.closesAt) return 0
  const [oh, om] = store.opensAt.split(':').map(Number)
  const [ch, cm] = store.closesAt.split(':').map(Number)
  return ch * 60 + cm - (oh * 60 + om)
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const storeGradients = [
  'from-primary to-emerald-600',
  'from-amber-500 to-orange-600',
  'from-teal-500 to-cyan-600',
]

const barColors = ['bg-primary', 'bg-amber-500', 'bg-teal-500']

/* ------------------------------------------------------------------ */
/*  Animated Gradient Border Wrapper                                   */
/* ------------------------------------------------------------------ */

function AnimatedGradientBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-xl p-[2px] overflow-hidden">
      {/* Animated rotating gradient border */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'conic-gradient(from var(--gradient-angle, 0deg), hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary) / 0.5), hsl(var(--accent)), hsl(var(--primary)))',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' as const }}
      />
      {/* Inner content sits on top */}
      <div className="relative rounded-[10px] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Shimmer Button Wrapper                                             */
/* ------------------------------------------------------------------ */

function ShimmerButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.div
      className="relative rounded-lg overflow-hidden"
      whileHover={{
        boxShadow: '0 0 20px rgba(var(--primary-rgb, 0,0,0), 0.25), 0 0 40px rgba(var(--primary-rgb, 0,0,0), 0.1)',
      }}
      transition={{
        type: 'spring' as const,
        stiffness: 300,
        damping: 25,
      }}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)',
          backgroundSize: '250% 100%',
        }}
        animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' as const, repeatDelay: 1.5 }}
      />
      <Button
        variant="outline"
        className="w-full h-9 text-xs gap-1.5 border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all relative z-0"
        onClick={onClick}
      >
        <Eye className="h-3 w-3 text-primary" />
        Ver Loja
      </Button>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  VS Badge — pulsing glow + rotate                                   */
/* ------------------------------------------------------------------ */

function VsBadge() {
  return (
    <motion.div
      className="relative flex items-center justify-center z-10 flex-shrink-0"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring' as const,
        stiffness: 300,
        damping: 15,
      }}
    >
      {/* Outer pulsing glow ring */}
      <motion.div
        className="absolute inset-[-6px] rounded-full bg-primary/15 blur-lg"
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }}
      />

      {/* Pulsing glow ring */}
      <motion.div
        className="absolute inset-[-4px] rounded-full bg-primary/20 blur-md"
        animate={{
          scale: [1, 1.6, 1],
          opacity: [0.4, 0.75, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }}
      />

      {/* Inner glow */}
      <motion.div
        className="absolute inset-[-2px] rounded-full bg-primary/10 blur-sm"
        animate={{
          scale: [1, 1.35, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: 0.3,
        }}
      />

      {/* Badge circle */}
      <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30 border border-primary-foreground/10">
        <motion.span
          className="text-[11px] font-black text-primary-foreground tracking-widest select-none"
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
        >
          VS
        </motion.span>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Winner Badge — trophy with bounce                                  */
/* ------------------------------------------------------------------ */

function WinnerBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring' as const,
        stiffness: 500,
        damping: 12,
        delay: 0.7,
      }}
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: 1.2,
        }}
      >
        <Badge className="h-5 px-1.5 text-[9px] bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/40 dark:to-yellow-900/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/30 gap-0.5 shadow-sm">
          <Trophy className="h-2.5 w-2.5 text-amber-500" />
          Melhor
        </Badge>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Metric Row — animated comparison bars                              */
/* ------------------------------------------------------------------ */

interface MetricRowProps {
  label: string
  icon: React.ReactNode
  values: number[]
  format: (v: number, store: StoreData) => string
  lowerIsBetter?: boolean
  stores: StoreData[]
  maxValue?: number
  rowIndex: number
}

function MetricRow({
  label,
  icon,
  values,
  format,
  lowerIsBetter = false,
  stores,
  maxValue,
  rowIndex,
}: MetricRowProps) {
  const bestIdx = useMemo(() => {
    if (values.length === 0) return -1
    return values.reduce(
      (best, v, i) => {
        if (best === -1) return i
        if (lowerIsBetter) return v < values[best] ? i : best
        return v > values[best] ? i : best
      },
      -1,
    )
  }, [values, lowerIsBetter])

  const max = maxValue ?? Math.max(...values, 1)

  return (
    <motion.div
      className="mb-4 last:mb-0"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: 0.25 + rowIndex * 0.12,
        duration: 0.45,
        ease: [0.25, 0.1, 0.25, 1] as const,
      }}
    >
      {/* Label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>

      {/* Bars */}
      <div className="space-y-2.5">
        {stores.map((store, idx) => {
          const pct =
            values[idx] != null ? Math.round((values[idx] / max) * 100) : 0
          const isBest = idx === bestIdx

          return (
            <div key={store.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                {/* Name + value + winner badge */}
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold truncate max-w-[100px]">
                    {store.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold">
                      {format(values[idx], store)}
                    </span>
                    {isBest && stores.length > 1 && <WinnerBadge />}
                  </div>
                </div>

                {/* Animated progress bar */}
                <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${barColors[idx % barColors.length]} ${isBest && stores.length > 1 ? 'opacity-100 shadow-sm' : 'opacity-60'}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: 0.35 + rowIndex * 0.1 + idx * 0.15,
                      ease: [0.22, 1, 0.36, 1] as const,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty State — animated illustration                                */
/* ------------------------------------------------------------------ */

function EmptyComparisonState() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <GitCompareArrows className="h-4 w-4 text-white" />
            </div>
            Comparar Lojas
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            {/* Floating illustration */}
            <motion.div
              className="relative mb-5"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut' as const,
              }}
            >
              <div className="flex items-center gap-4">
                {/* Left card */}
                <motion.div
                  className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/15 to-emerald-500/15 flex items-center justify-center border border-primary/20"
                  animate={{ x: [0, 8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut' as const,
                    delay: 0.2,
                  }}
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    A
                  </div>
                </motion.div>

                {/* Spinner icon */}
                <motion.div
                  className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear' as const,
                  }}
                >
                  <ArrowRightLeft className="h-4 w-4 text-primary/70" />
                </motion.div>

                {/* Right card */}
                <motion.div
                  className="h-16 w-16 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center border border-amber-500/20"
                  animate={{ x: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut' as const,
                    delay: 0.2,
                  }}
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    B
                  </div>
                </motion.div>
              </div>

              {/* Sparkle accents */}
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.3, 0.5],
                  y: [-4, -16],
                }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 0.8 }}
              >
                <Sparkles className="h-5 w-5 text-amber-400" />
              </motion.div>

              <motion.div
                className="absolute -bottom-2 right-4"
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0.6, 1.1, 0.6],
                  y: [0, -10],
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 1.6 }}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary/60" />
              </motion.div>

              <motion.div
                className="absolute -bottom-1 left-2"
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [0.4, 1, 0.4],
                  y: [0, -8],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 2.2 }}
              >
                <Star className="h-3 w-3 text-amber-300" />
              </motion.div>
            </motion.div>

            <h3 className="text-sm font-semibold mb-1.5">
              Compare lojas lado a lado
            </h3>
            <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">
              Selecione ao menos duas lojas para ver uma comparacao detalhada
              de precos, avaliacoes e tempo de entrega.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}

/* ------------------------------------------------------------------ */
/*  Slide direction helper for store cards                            */
/* ------------------------------------------------------------------ */

function getSlideX(idx: number, total: number): number {
  if (total === 2) return idx === 0 ? -60 : 60
  if (idx === 0) return -60
  if (idx === total - 1) return 60
  return 0
}

/* ------------------------------------------------------------------ */
/*  Main StoreComparison component                                    */
/* ------------------------------------------------------------------ */

export function StoreComparison({ stores }: { stores: StoreData[] }) {
  const { selectStore, navigate } = useAppStore()
  const [isSwapped, setIsSwapped] = useState(false)
  const filteredStores = stores.slice(0, 3)

  /* ---------- Empty state (< 2 stores) ---------- */
  if (filteredStores.length < 2) {
    return <EmptyComparisonState />
  }

  /* ---------- Swap first two stores ---------- */
  const displayStores = isSwapped
    ? [filteredStores[1], filteredStores[0], ...filteredStores.slice(2)]
    : filteredStores

  /* ---------- Metric values ---------- */
  const ratings = displayStores.map((s) => s.rating)
  const deliveryFees = displayStores.map((s) => s.deliveryFee)
  const openHoursMinutes = displayStores.map((s) => computeOpenHoursMinutes(s))
  const totalReviews = displayStores.map((s) => s.totalReviews)

  const metrics = [
    {
      label: 'Avaliacao',
      icon: <Star className="h-3.5 w-3.5" />,
      values: ratings,
      format: (v: number) => v.toFixed(1),
      maxValue: 5,
    },
    {
      label: 'Taxa de Entrega',
      icon: <Truck className="h-3.5 w-3.5" />,
      values: deliveryFees,
      format: (v: number) => (v === 0 ? 'Gratis' : formatBRL(v)),
      lowerIsBetter: true,
    },
    {
      label: 'Total de Produtos',
      icon: <Package className="h-3.5 w-3.5" />,
      values: totalReviews,
      format: (v: number) => `${v} produtos`,
    },
    {
      label: 'Horario de Funcionamento',
      icon: <Clock className="h-3.5 w-3.5" />,
      values: openHoursMinutes,
      format: (_v: number, store: StoreData) => getOpenHours(store),
      maxValue: 16 * 60,
    },
  ]

  /* ---------- Render ---------- */
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated gradient border wrapping the card */}
      <AnimatedGradientBorder>
        <Card className="border-border/50 overflow-hidden">
          {/* ---------- Header ---------- */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                Comparar Lojas
              </CardTitle>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {filteredStores.length} lojas
                </Badge>

                {/* Swap button */}
                {filteredStores.length >= 2 && (
                  <motion.div whileTap={{ scale: 0.92 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-[10px] gap-1"
                      onClick={() => setIsSwapped((prev) => !prev)}
                    >
                      <motion.div
                        animate={{ rotate: isSwapped ? 180 : 0 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1] as const,
                        }}
                      >
                        <ArrowRightLeft className="h-3 w-3" />
                      </motion.div>
                      Trocar
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </CardHeader>

          {/* ---------- Body ---------- */}
          <CardContent className="pb-4">
            {/* Store cards — slide-in from sides + VS badges with hover glow */}
            <AnimatePresence mode="popLayout">
              <div className="flex items-center gap-2 mb-5">
                {displayStores.map((store, idx) => {
                  const slideX = getSlideX(idx, displayStores.length)
                  const isMiddle = idx === 1 && displayStores.length === 3

                  return (
                    <Fragment key={store.id}>
                      <motion.div
                        layout
                        className="flex-1 min-w-0"
                        initial={{ opacity: 0, x: slideX, y: isMiddle ? -30 : 0 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{
                          type: 'spring' as const,
                          stiffness: 300,
                          damping: 25,
                          delay: idx * 0.12,
                        }}
                        whileHover={{
                          scale: 1.05,
                          filter: 'drop-shadow(0 0 12px rgba(0, 0, 0, 0.15))',
                        }}
                      >
                        <div
                          className={`rounded-xl bg-gradient-to-br ${storeGradients[idx % storeGradients.length]} p-3 text-white transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/10`}
                        >
                          {/* Hover glow overlay */}
                          <motion.div
                            className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                            style={{
                              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)',
                            }}
                          />
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold backdrop-blur-sm">
                              {getInitials(store.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">
                                {store.name}
                              </p>
                              <p className="text-[10px] text-white/70">
                                {store.category === 'FOOD'
                                  ? 'Alimentacao'
                                  : store.category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-300 fill-amber-300" />
                              <span className="text-xs font-semibold">
                                {store.rating}
                              </span>
                            </div>
                            <span className="text-[10px] text-white/70">
                              {store.totalReviews} avaliacoes
                            </span>
                          </div>
                        </div>
                      </motion.div>

                    {/* VS badge between each pair */}
                    {idx < displayStores.length - 1 && <VsBadge />}
                  </Fragment>
                )
              })}
            </div>
          </AnimatePresence>

          {/* Metrics comparison */}
            <div className="bg-muted/30 rounded-xl p-3 sm:p-4">
              {metrics.map((metric, rowIndex) => (
                <MetricRow
                  key={metric.label}
                  label={metric.label}
                  icon={metric.icon}
                  values={metric.values}
                  format={metric.format}
                  lowerIsBetter={metric.lowerIsBetter}
                  stores={displayStores}
                  maxValue={metric.maxValue}
                  rowIndex={rowIndex}
                />
              ))}
            </div>

            {/* Ver Loja buttons with shimmer effect */}
            <AnimatePresence mode="popLayout">
              <div className="flex items-center gap-2 mt-4">
                {displayStores.map((store, idx) => (
                  <motion.div
                    key={store.id}
                    layout
                    className="flex-1 min-w-0"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <ShimmerButton
                      onClick={() => {
                        selectStore(store)
                        navigate('store')
                      }}
                    >
                      Ver Loja
                    </ShimmerButton>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </AnimatedGradientBorder>
    </motion.section>
  )
}
