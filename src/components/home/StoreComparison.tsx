'use client'

import { useMemo } from 'react'
import { Star, Truck, Clock, Package, Crown, Eye, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useAppStore, type StoreData } from '@/store/useAppStore'

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
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
  return (ch * 60 + cm) - (oh * 60 + om)
}

const storeGradients = [
  'from-primary to-emerald-600',
  'from-amber-500 to-orange-600',
  'from-teal-500 to-cyan-600',
]

const barColors = [
  'bg-primary',
  'bg-amber-500',
  'bg-teal-500',
]

interface MetricRowProps {
  label: string
  icon: React.ReactNode
  values: number[]
  format: (v: number, store: StoreData) => string
  lowerIsBetter?: boolean
  stores: StoreData[]
  maxValue?: number
}

function MetricRow({ label, icon, values, format, lowerIsBetter = false, stores, maxValue }: MetricRowProps) {
  const bestIdx = useMemo(() => {
    if (values.length === 0) return -1
    return values.reduce(
      (best, v, i) => {
        if (best === -1) return i
        if (lowerIsBetter) return v < values[best] ? i : best
        return v > values[best] ? i : best
      },
      -1
    )
  }, [values, lowerIsBetter])

  const max = maxValue ?? Math.max(...values, 1)

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="space-y-2">
        {stores.map((store, idx) => {
          const pct = values[idx] != null ? Math.round((values[idx] / max) * 100) : 0
          const isBest = idx === bestIdx
          return (
            <div key={store.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold truncate max-w-[100px]">{store.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold">{format(values[idx], store)}</span>
                    {isBest && stores.length > 1 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        <Badge className="h-4 px-1 text-[8px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 gap-0.5">
                          <Crown className="h-2 w-2" />
                          Melhor
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                </div>
                <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${barColors[idx % barColors.length]} ${isBest && stores.length > 1 ? 'opacity-100' : 'opacity-60'}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function StoreComparison({ stores }: { stores: StoreData[] }) {
  const { selectStore, navigate, goBack } = useAppStore()
  const filteredStores = stores.slice(0, 3)

  const ratings = filteredStores.map((s) => s.rating)
  const deliveryFees = filteredStores.map((s) => s.deliveryFee)
  const openHoursMinutes = filteredStores.map((s) => computeOpenHoursMinutes(s))
  const totalReviews = filteredStores.map((s) => s.totalReviews)

  if (filteredStores.length < 2) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                <Eye className="h-4 w-4 text-white" />
              </div>
              Comparar Lojas
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {filteredStores.length} lojas
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {/* Store header cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
            {filteredStores.map((store, idx) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className={`rounded-xl bg-gradient-to-br ${storeGradients[idx % storeGradients.length]} p-3 text-white`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold backdrop-blur-sm">
                      {getInitials(store.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{store.name}</p>
                      <p className="text-[10px] text-white/70">{store.category === 'FOOD' ? 'Alimentacao' : store.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-300 fill-amber-300" />
                      <span className="text-xs font-semibold">{store.rating}</span>
                    </div>
                    <span className="text-[10px] text-white/70">{store.totalReviews} avaliacoes</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Metrics comparison */}
          <div className="bg-muted/30 rounded-xl p-3 sm:p-4">
            <MetricRow
              label="Avaliacao"
              icon={<Star className="h-3.5 w-3.5" />}
              values={ratings}
              format={(v) => v.toFixed(1)}
              maxValue={5}
              stores={filteredStores}
            />
            <MetricRow
              label="Taxa de Entrega"
              icon={<Truck className="h-3.5 w-3.5" />}
              values={deliveryFees}
              format={(v) => v === 0 ? 'Gratis' : formatBRL(v)}
              lowerIsBetter
              stores={filteredStores}
            />
            <MetricRow
              label="Total de Produtos"
              icon={<Package className="h-3.5 w-3.5" />}
              values={totalReviews}
              format={(v) => `${v} produtos`}
              stores={filteredStores}
            />
            <MetricRow
              label="Horario de Funcionamento"
              icon={<Clock className="h-3.5 w-3.5" />}
              values={openHoursMinutes}
              format={(v, store) => getOpenHours(store)}
              stores={filteredStores}
              maxValue={16 * 60}
            />
          </div>

          {/* Ver Loja buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            {filteredStores.map((store, idx) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-9 text-xs gap-1.5 border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all"
                  onClick={() => {
                    selectStore(store)
                    navigate('store')
                  }}
                >
                  <Eye className="h-3 w-3 text-primary" />
                  Ver Loja
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}
