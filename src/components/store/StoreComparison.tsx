'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Fragment } from 'react'
import { motion } from 'framer-motion'
import {
  GitCompare,
  Star,
  Clock,
  Truck,
  MessageSquare,
  Crown,
  ExternalLink,
} from 'lucide-react'

interface StoreComparisonData {
  name: string
  initials: string
  rating: number
  avgPrice: number
  deliveryTime: string
  deliveryFee: number
  totalReviews: number
  isOpen: boolean
}

const stores: StoreComparisonData[] = [
  {
    name: 'Açaí da Boa',
    initials: 'AB',
    rating: 4.9,
    avgPrice: 18.5,
    deliveryTime: '25-35 min',
    deliveryFee: 3.0,
    totalReviews: 256,
    isOpen: true,
  },
  {
    name: 'Padaria Pão Quente',
    initials: 'PP',
    rating: 4.8,
    avgPrice: 12.0,
    deliveryTime: '15-25 min',
    deliveryFee: 3.0,
    totalReviews: 198,
    isOpen: true,
  },
  {
    name: 'Mercado do Zé',
    initials: 'MZ',
    rating: 4.7,
    avgPrice: 22.0,
    deliveryTime: '30-45 min',
    deliveryFee: 5.0,
    totalReviews: 128,
    isOpen: false,
  },
]

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`r40-star h-3.5 w-3.5 ${
              i < fullStars
                ? 'text-amber-400 fill-amber-400'
                : i === fullStars && hasHalf
                ? 'text-amber-400 fill-amber-400/50'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-muted-foreground ml-1">{rating}</span>
    </div>
  )
}

function StatusBadge({ isOpen }: { isOpen: boolean }) {
  return isOpen ? (
    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[11px] font-medium gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Aberto
    </Badge>
  ) : (
    <Badge variant="secondary" className="text-[11px] font-medium gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
      Fechado
    </Badge>
  )
}

function VsBadge() {
  return (
    <div className="r40-vs-container">
      <span className="r40-vs-ring r40-vs-ring-1" />
      <span className="r40-vs-ring r40-vs-ring-2" />
      <span className="r40-vs-ring r40-vs-ring-3" />
      <span className="r40-vs-text">VS</span>
    </div>
  )
}

function WinnerCrown() {
  return (
    <div className="r40-crown-container">
      <Crown className="r40-crown-icon" />
      <span className="r40-sparkle r40-sparkle-1" />
      <span className="r40-sparkle r40-sparkle-2" />
      <span className="r40-sparkle r40-sparkle-3" />
      <span className="r40-sparkle r40-sparkle-4" />
    </div>
  )
}

function ComparisonBar({
  value,
  max,
  variant,
  delay,
}: {
  value: number
  max: number
  variant: 'emerald' | 'amber' | 'teal'
  delay: number
}) {
  return (
    <div className="r40-bar-track w-full max-w-[72px] mt-1">
      <motion.div
        className={`r40-bar-fill r40-bar-fill-${variant}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${(value / max) * 100}%` }}
        viewport={{ once: true }}
        transition={{
          duration: 0.8,
          delay,
          type: 'spring' as const,
          stiffness: 100,
          damping: 20,
        }}
      />
    </div>
  )
}

function VerLojaButton({ store }: { store: StoreComparisonData }) {
  return (
    <motion.div
      className="inline-block"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
    >
      <Button
        size="sm"
        className="r40-ver-loja-btn"
        disabled={!store.isOpen}
      >
        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
        Ver Loja
      </Button>
    </motion.div>
  )
}

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.08,
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  }),
}

export function StoreComparison() {
  const bestStore = stores.reduce((best, store) =>
    store.rating > best.rating ? store : best,
    stores[0],
  )
  const maxReviews = Math.max(...stores.map((s) => s.totalReviews))
  const maxPrice = Math.max(...stores.map((s) => s.avgPrice))

  const rows = [
    {
      label: 'Avaliação',
      labelIcon: Star,
      render: (store: StoreComparisonData) => (
        <div className="flex flex-col items-center gap-0.5">
          <StarRating rating={store.rating} />
          <ComparisonBar
            value={store.rating}
            max={5}
            variant="emerald"
            delay={0.3}
          />
        </div>
      ),
    },
    {
      label: 'Preço médio',
      labelIcon: () => <span className="text-xs font-bold">R$</span>,
      render: (store: StoreComparisonData) => (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-semibold">{formatBRL(store.avgPrice)}</span>
          <ComparisonBar
            value={store.avgPrice}
            max={maxPrice}
            variant="amber"
            delay={0.4}
          />
        </div>
      ),
    },
    {
      label: 'Tempo de entrega',
      labelIcon: Clock,
      render: (store: StoreComparisonData) => (
        <span className="text-sm text-muted-foreground">{store.deliveryTime}</span>
      ),
    },
    {
      label: 'Taxa de entrega',
      labelIcon: Truck,
      render: (store: StoreComparisonData) => (
        <span
          className={`text-sm font-semibold ${
            store.deliveryFee === 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : ''
          }`}
        >
          {store.deliveryFee === 0 ? 'Grátis' : formatBRL(store.deliveryFee)}
        </span>
      ),
    },
    {
      label: 'Total de avaliações',
      labelIcon: MessageSquare,
      render: (store: StoreComparisonData) => (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm">{store.totalReviews}</span>
          <ComparisonBar
            value={store.totalReviews}
            max={maxReviews}
            variant="teal"
            delay={0.5}
          />
        </div>
      ),
    },
    {
      label: 'Status',
      labelIcon: () => <span className="h-2 w-2 rounded-full bg-current" />,
      render: (store: StoreComparisonData) => <StatusBadge isOpen={store.isOpen} />,
    },
    {
      label: 'Ação',
      labelIcon: ExternalLink,
      isButtonRow: true,
      render: (store: StoreComparisonData) => <VerLojaButton store={store} />,
    },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
    >
      <Card className="r40-comparison-card border-border/50 overflow-hidden">
        <CardHeader className="r40-header-bg pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="r40-header-icon-wrap h-8 w-8 rounded-lg flex items-center justify-center">
              <GitCompare className="h-4 w-4 text-primary" />
            </div>
            <span className="r40-header-shimmer-text">Comparar Lojas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {/* Mobile: horizontally scrollable table */}
          <div className="block lg:hidden">
            <ScrollArea className="w-full">
              <div className="min-w-[540px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium text-muted-foreground w-[130px]">
                        Característica
                      </TableHead>
                      {stores.map((store, i) => (
                        <Fragment key={store.name}>
                          <TableHead className="text-center">
                            <div className="r40-store-cell flex flex-col items-center gap-1 relative">
                              {store.name === bestStore.name && <WinnerCrown />}
                              <div className="r40-store-avatar r40-store-avatar-sm h-8 w-8 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                                <span className="r40-store-avatar-shimmer" />
                                {store.initials}
                              </div>
                              <span className="text-xs font-semibold whitespace-normal leading-tight">
                                {store.name}
                              </span>
                            </div>
                          </TableHead>
                          {i < stores.length - 1 && (
                            <TableHead className="w-10 px-0">
                              <VsBadge />
                            </TableHead>
                          )}
                        </Fragment>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => (
                      <motion.tr
                        key={row.label}
                        className={`border-b border-border/30 hover:bg-muted/30 transition-colors ${
                          row.isButtonRow ? 'r40-button-row' : ''
                        }`}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <row.labelIcon className="h-3.5 w-3.5" />
                            {row.label}
                          </div>
                        </td>
                        {stores.map((store, si) => (
                          <Fragment key={store.name}>
                            <td className="py-3 px-2 text-center">
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                  duration: 0.4,
                                  delay: si * 0.1 + 0.2,
                                  type: 'spring' as const,
                                  stiffness: 200,
                                  damping: 20,
                                }}
                              >
                                {row.render(store)}
                              </motion.div>
                            </td>
                            {si < stores.length - 1 && (
                              <td className="py-3 px-0 w-10" />
                            )}
                          </Fragment>
                        ))}
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Desktop: full width table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium text-muted-foreground w-[180px]">
                    Característica
                  </TableHead>
                  {stores.map((store, i) => (
                    <Fragment key={store.name}>
                      <TableHead className="text-center">
                        <div className="r40-store-cell flex flex-col items-center gap-1.5 relative">
                          {store.name === bestStore.name && <WinnerCrown />}
                          <div className="r40-store-avatar r40-store-avatar-lg h-10 w-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                            <span className="r40-store-avatar-shimmer" />
                            {store.initials}
                          </div>
                          <span className="text-sm font-semibold">{store.name}</span>
                        </div>
                      </TableHead>
                      {i < stores.length - 1 && (
                        <TableHead className="w-12 px-0">
                          <VsBadge />
                        </TableHead>
                      )}
                    </Fragment>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <motion.tr
                    key={row.label}
                    className={`border-b border-border/30 hover:bg-muted/30 transition-colors ${
                      row.isButtonRow ? 'r40-button-row' : ''
                    }`}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <row.labelIcon className="h-4 w-4" />
                        {row.label}
                      </div>
                    </td>
                    {stores.map((store, si) => (
                      <Fragment key={store.name}>
                        <td className="py-4 px-4 text-center">
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.4,
                              delay: si * 0.1 + 0.2,
                              type: 'spring' as const,
                              stiffness: 200,
                              damping: 20,
                            }}
                          >
                            {row.render(store)}
                          </motion.div>
                        </td>
                        {si < stores.length - 1 && (
                          <td className="py-4 px-0 w-12" />
                        )}
                      </Fragment>
                    ))}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}
