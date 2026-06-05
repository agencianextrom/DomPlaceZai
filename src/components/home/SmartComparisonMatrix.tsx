'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Sparkles,
  Search,
  Plus,
  X,
  ShoppingCart,
  Share2,
  Check,
  ChevronRight,
  Trophy,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
  Brain,
  BarChart3,
  ArrowRightLeft,
  Loader2,
  CircleCheckBig,
  CircleX,
  Star,
  Package,
  GitCompareArrows,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MockProduct {
  id: string
  name: string
  brand: string
  image: string
  price: number
  rating: number
  specs: Record<string, string | number>
  pros: string[]
  cons: string[]
}

interface ComparisonCriterion {
  key: string
  label: string
  icon: string
  higherBetter: boolean
}

interface CellStatus {
  level: 'best' | 'ok' | 'worst'
  rank: number
}

/* ------------------------------------------------------------------ */
/*  Mock Data — 3 Smartphones                                          */
/* ------------------------------------------------------------------ */

const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'phone-a',
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    image: 'https://picsum.photos/seed/galaxys24/200/200',
    price: 6499,
    rating: 4.8,
    specs: {
      screen: '6.8" AMOLED 120Hz',
      battery: 5000,
      camera: 200,
      ram: 12,
      storage: 256,
    },
    pros: ['Tela brilhante', 'Câmera excepcional', 'S Pen incluso', 'Bateria duradoura'],
    cons: ['Preço elevado', 'Peso acima da média'],
  },
  {
    id: 'phone-b',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    image: 'https://picsum.photos/seed/iphone15pm/200/200',
    price: 7999,
    rating: 4.9,
    specs: {
      screen: '6.7" Super Retina XDR 120Hz',
      battery: 4441,
      camera: 48,
      ram: 8,
      storage: 256,
    },
    pros: ['Performance máxima', 'Ecossistema Apple', 'Design premium', 'Vídeo 4K 60fps'],
    cons: ['Bateria menor', 'Sem carregador na caixa', 'Caro demais'],
  },
  {
    id: 'phone-c',
    name: 'Pixel 8 Pro',
    brand: 'Google',
    image: 'https://picsum.photos/seed/pixel8pro/200/200',
    price: 4999,
    rating: 4.6,
    specs: {
      screen: '6.7" LTPO OLED 120Hz',
      battery: 5050,
      camera: 50,
      ram: 12,
      storage: 128,
    },
    pros: ['Inteligência AI nativa', 'Melhor custo-benefício', 'Android puro', 'Bateria grande'],
    cons: ['Menos armazenamento', 'Software menos popular', 'Marca menos reconhecida'],
  },
]

const AUTO_CRITERIA: ComparisonCriterion[] = [
  { key: 'screen', label: 'Tela', icon: '📱', higherBetter: true },
  { key: 'battery', label: 'Bateria (mAh)', icon: '🔋', higherBetter: true },
  { key: 'camera', label: 'Câmera (MP)', icon: '📸', higherBetter: true },
  { key: 'ram', label: 'RAM (GB)', icon: '⚙️', higherBetter: true },
  { key: 'storage', label: 'Armazenamento (GB)', icon: '💾', higherBetter: true },
  { key: 'price', label: 'Preço (R$)', icon: '💰', higherBetter: false },
]

const USER_CHOICE_DATA = [
  { productId: 'phone-a', percentage: 34 },
  { productId: 'phone-b', percentage: 45 },
  { productId: 'phone-c', percentage: 21 },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getCellStatus(value: number, allValues: number[], higherBetter: boolean): CellStatus {
  const sorted = [...allValues].sort((a, b) => (higherBetter ? b - a : a - b))
  const uniqueRanks = [...new Set(sorted)]
  const rank = uniqueRanks.indexOf(value)

  if (uniqueRanks.length <= 2) {
    return { level: rank === 0 ? 'best' : 'worst', rank }
  }
  if (rank === 0) return { level: 'best', rank }
  if (rank === uniqueRanks.length - 1) return { level: 'worst', rank }
  return { level: 'ok', rank }
}

function getCellBg(level: CellStatus['level']): string {
  switch (level) {
    case 'best':
      return 'rgba(34, 197, 94, 0.12)'
    case 'ok':
      return 'rgba(245, 158, 11, 0.10)'
    case 'worst':
      return 'rgba(239, 68, 68, 0.08)'
  }
}

function getCellBorder(level: CellStatus['level']): string {
  switch (level) {
    case 'best':
      return 'rgba(34, 197, 94, 0.3)'
    case 'ok':
      return 'rgba(245, 158, 11, 0.25)'
    case 'worst':
      return 'rgba(239, 68, 68, 0.2)'
  }
}

function getCellText(level: CellStatus['level']): string {
  switch (level) {
    case 'best':
      return 'rgba(22, 163, 74, 1)'
    case 'ok':
      return 'rgba(217, 119, 6, 1)'
    case 'worst':
      return 'rgba(220, 38, 38, 1)'
  }
}

function getBestIndicatorBg(level: CellStatus['level']): string {
  if (level !== 'best') return 'transparent'
  return 'rgba(34, 197, 94, 0.15)'
}

/* ------------------------------------------------------------------ */
/*  Format spec value for display                                      */
/* ------------------------------------------------------------------ */

function formatSpecValue(key: string, value: string | number): string {
  if (key === 'price') return formatBRL(Number(value))
  if (key === 'screen') return String(value)
  if (key === 'battery') return `${value} mAh`
  if (key === 'camera') return `${value} MP`
  if (key === 'ram') return `${value} GB`
  if (key === 'storage') return `${value} GB`
  return String(value)
}

function getNumericSpecValue(key: string, value: string | number): number {
  if (key === 'price') return Number(value)
  if (key === 'screen') return parseFloat(String(value)) || 0
  return Number(value) || 0
}

/* ------------------------------------------------------------------ */
/*  Animated Confidence Ring                                           */
/* ------------------------------------------------------------------ */

function ConfidenceRing({ percentage, delay = 0 }: { percentage: number; delay?: number }) {
  const [displayPct, setDisplayPct] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPct(percentage)
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [percentage, delay])

  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (displayPct / 100) * circumference

  return (
    <div className="r49-ring-container relative h-24 w-24">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
        {/* Background track */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth="6"
        />
        {/* Animated arc */}
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="rgba(16, 185, 129, 0.85)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.8, delay: 0.4 + delay, ease: [0.22, 1, 0.36, 1] as const }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-xl font-black text-emerald-600 dark:text-emerald-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 + delay }}
        >
          {displayPct}%
        </motion.span>
        <span className="text-[9px] text-muted-foreground font-medium">confiança</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' as const, stiffness: 200, damping: 20 }}
    >
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
              <Brain className="h-4 w-4 text-white" />
            </div>
            Comparação Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
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
                <motion.div
                  className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 flex items-center justify-center border border-emerald-500/20"
                  animate={{ x: [0, 8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut' as const,
                    delay: 0.2,
                  }}
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    A
                  </div>
                </motion.div>

                <motion.div
                  className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center"
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear' as const,
                  }}
                >
                  <GitCompareArrows className="h-4 w-4 text-emerald-500/70" />
                </motion.div>

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

              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.3, 0.5],
                  y: [-4, -16],
                }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 0.8 }}
              >
                <Sparkles className="h-5 w-5 text-emerald-400" />
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
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </motion.div>
            </motion.div>

            <h3 className="text-sm font-semibold mb-1.5">Compare produtos com IA</h3>
            <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">
              Selecione 2 a 3 produtos e nossa IA escolhe automaticamente os critérios mais relevantes para você.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function LoadingSkeleton() {
  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product slots skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 h-32 rounded-xl" />
          ))}
        </div>
        {/* Matrix skeleton */}
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Product Slot Card                                                  */
/* ------------------------------------------------------------------ */

function ProductSlotCard({
  product,
  index,
  onRemove,
  onAddToCart,
}: {
  product: MockProduct
  index: number
  onRemove: () => void
  onAddToCart: () => void
}) {
  const gradients = [
    'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
    'from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30',
    'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.15,
        type: 'spring' as const,
        stiffness: 320,
        damping: 22,
      }}
      className="relative"
    >
      <Card
        className="overflow-hidden border-border/50 group hover:shadow-lg transition-shadow duration-300"
      >
        {/* Image */}
        <div
          className={`aspect-square flex items-center justify-center bg-gradient-to-br ${gradients[index % gradients.length]} relative overflow-hidden`}
        >
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg shadow-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1, type: 'spring' as const, stiffness: 300, damping: 20 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <motion.button
            whileTap={{ scale: 0.85 }}
            className="absolute top-1.5 right-1.5 h-6 w-6 min-h-[44px] min-w-[44px] rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors z-10"
            onClick={onRemove}
          >
            <X className="h-3 w-3 text-white" />
          </motion.button>
        </div>

        {/* Info */}
        <CardContent className="p-2.5">
          <p className="text-[10px] text-primary font-medium">{product.brand}</p>
          <p className="text-xs font-semibold line-clamp-1 mt-0.5">{product.name}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-semibold">{product.rating}</span>
          </div>

          {/* Add to cart */}
          <motion.div whileTap={{ scale: 0.95 }} className="mt-2">
            <Button
              size="sm"
              className="w-full h-7 text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
              onClick={onAddToCart}
            >
              <ShoppingCart className="h-3 w-3" />
              Adicionar
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty Product Slot                                                 */
/* ------------------------------------------------------------------ */

function EmptyProductSlot({ index }: { index: number }) {
  const [searching, setSearching] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring' as const, stiffness: 250, damping: 20 }}
    >
      <Card className="border-dashed border-2 border-border/40 overflow-hidden hover:border-primary/40 transition-colors">
        <div className="aspect-square flex items-center justify-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSearching(!searching)}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
              {searching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                >
                  <Loader2 className="h-5 w-5" />
                </motion.div>
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </div>
            <span className="text-[10px] font-medium">Adicionar</span>
          </motion.button>
        </div>
        <div className="p-2.5">
          <Skeleton className="h-3 w-16 mb-1.5" />
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-4 w-14" />
        </div>
      </Card>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Matrix Row                                                         */
/* ------------------------------------------------------------------ */

function MatrixRow({
  criterion,
  products,
  rowIndex,
  isKeyDifference,
}: {
  criterion: ComparisonCriterion
  products: MockProduct[]
  rowIndex: number
  isKeyDifference: boolean
}) {
  const values = products.map((p) => getNumericSpecValue(criterion.key, p.specs[criterion.key]))
  const statuses = values.map((v) => getCellStatus(v, values, criterion.higherBetter))

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.2 + rowIndex * 0.08,
        type: 'spring' as const,
        stiffness: 200,
        damping: 22,
      }}
      className={`grid items-center border-b border-border/40 last:border-b-0 ${
        isKeyDifference ? 'r49-key-row' : ''
      }`}
      style={{
        gridTemplateColumns: `120px repeat(${products.length}, 1fr)`,
      }}
    >
      {/* Label */}
      <div className="p-2.5 text-xs font-medium text-muted-foreground flex items-center gap-1.5 border-r border-border/30">
        <span>{criterion.icon}</span>
        <span>{criterion.label}</span>
        {isKeyDifference && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
          >
            <Zap className="h-3 w-3 text-amber-500" />
          </motion.div>
        )}
      </div>

      {/* Cells */}
      {products.map((product, colIdx) => {
        const status = statuses[colIdx]
        const value = values[colIdx]
        const isBest = status.level === 'best' && products.length > 1

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3 + rowIndex * 0.06 + colIdx * 0.05,
              type: 'spring' as const,
              stiffness: 220,
              damping: 20,
            }}
            className="p-2 text-center border-l border-border/30 relative"
            style={{
              backgroundColor: getCellBg(status.level),
            }}
          >
            {/* Best indicator dot */}
            {isBest && (
              <motion.div
                className="absolute top-1 right-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 500, damping: 15, delay: 0.5 + colIdx * 0.1 }}
              >
                <div
                  className="h-4 w-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getBestIndicatorBg(status.level) }}
                >
                  <Trophy className="h-2.5 w-2.5" style={{ color: 'rgba(34, 197, 94, 1)' }} />
                </div>
              </motion.div>
            )}

            <span
              className="text-xs font-bold"
              style={{ color: getCellText(status.level) }}
            >
              {formatSpecValue(criterion.key, product.specs[criterion.key])}
            </span>

            {/* Border highlight for key differences */}
            {isKeyDifference && (
              <motion.div
                className="absolute inset-0 rounded-sm pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 0 1px ${getCellBorder(status.level)}`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + colIdx * 0.08 }}
              />
            )}
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Pros/Cons for a Product                                            */
/* ------------------------------------------------------------------ */

function ProsCons({ product, index }: { product: MockProduct; index: number }) {
  const accentColors = ['emerald', 'blue', 'amber']
  const color = accentColors[index % accentColors.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.6 + index * 0.12,
        type: 'spring' as const,
        stiffness: 200,
        damping: 22,
      }}
      className="space-y-2"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor:
              color === 'emerald'
                ? 'rgba(16, 185, 129, 1)'
                : color === 'blue'
                  ? 'rgba(59, 130, 246, 1)'
                  : 'rgba(245, 158, 11, 1)',
          }}
        />
        <span className="text-xs font-semibold">{product.name}</span>
      </div>

      {/* Pros */}
      <div className="space-y-1">
        {product.pros.map((pro, i) => (
          <motion.div
            key={pro}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1 + i * 0.05, type: 'spring' as const, stiffness: 250, damping: 20 }}
            className="flex items-center gap-1.5"
          >
            <div
              className="h-5 w-5 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
            >
              <Check className="h-3 w-3" style={{ color: 'rgba(34, 197, 94, 1)' }} />
            </div>
            <span className="text-[11px] text-muted-foreground">{pro}</span>
          </motion.div>
        ))}
      </div>

      {/* Cons */}
      <div className="space-y-1">
        {product.cons.map((con, i) => (
          <motion.div
            key={con}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + index * 0.1 + i * 0.05, type: 'spring' as const, stiffness: 250, damping: 20 }}
            className="flex items-center gap-1.5"
          >
            <div
              className="h-5 w-5 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
            >
              <AlertTriangle className="h-3 w-3" style={{ color: 'rgba(245, 158, 11, 1)' }} />
            </div>
            <span className="text-[11px] text-muted-foreground">{con}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Price-Performance Bar                                              */
/* ------------------------------------------------------------------ */

function PricePerformanceBar({
  product,
  index,
  maxValue,
}: {
  product: MockProduct
  index: number
  maxValue: number
}) {
  const score = Math.round((product.rating / product.price) * 100000)
  const pct = Math.min((score / maxValue) * 100, 100)
  const barColors = [
    'rgba(16, 185, 129, 0.9)',
    'rgba(59, 130, 246, 0.9)',
    'rgba(245, 158, 11, 0.9)',
  ]
  const bgColors = [
    'rgba(16, 185, 129, 0.15)',
    'rgba(59, 130, 246, 0.15)',
    'rgba(245, 158, 11, 0.15)',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.4 + index * 0.1,
        type: 'spring' as const,
        stiffness: 200,
        damping: 22,
      }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold truncate max-w-[100px]">{product.name}</span>
        <span className="text-[11px] font-bold" style={{ color: barColors[index % barColors.length] }}>
          Score: {score}
        </span>
      </div>
      <div
        className="h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: bgColors[index % bgColors.length] }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColors[index % barColors.length] }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 1,
            delay: 0.6 + index * 0.15,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {formatBRL(product.price)} · ⭐ {product.rating}
      </p>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Users Choice Animated Bar                                          */
/* ------------------------------------------------------------------ */

function UsersChoiceBar({ product, percentage, index }: { product: MockProduct; percentage: number; index: number }) {
  const [displayPct, setDisplayPct] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPct(percentage)
    }, 800 + index * 200)
    return () => clearTimeout(timer)
  }, [percentage, index])

  const barColors = [
    'rgba(16, 185, 129, 0.85)',
    'rgba(59, 130, 246, 0.85)',
    'rgba(245, 158, 11, 0.85)',
  ]
  const bgColors = [
    'rgba(16, 185, 129, 0.12)',
    'rgba(59, 130, 246, 0.12)',
    'rgba(245, 158, 11, 0.12)',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.3 + index * 0.12,
        type: 'spring' as const,
        stiffness: 200,
        damping: 22,
      }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold truncate max-w-[120px]">{product.name}</span>
        <motion.span
          className="text-xs font-black"
          style={{ color: barColors[index % barColors.length] }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 + index * 0.15 }}
        >
          {displayPct}%
        </motion.span>
      </div>
      <div
        className="h-2.5 rounded-full overflow-hidden"
        style={{ backgroundColor: bgColors[index % bgColors.length] }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColors[index % barColors.length] }}
          initial={{ width: 0 }}
          animate={{ width: `${displayPct}%` }}
          transition={{
            duration: 1.2,
            delay: 1 + index * 0.15,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        />
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Key Differences Highlight                                          */
/* ------------------------------------------------------------------ */

function KeyDifferences({ products, criteria }: { products: MockProduct[]; criteria: ComparisonCriterion[] }) {
  const diffs = useMemo(() => {
    return criteria
      .map((c) => {
        const values = products.map((p) => getNumericSpecValue(c.key, p.specs[c.key]))
        const max = Math.max(...values)
        const min = Math.min(...values)
        const spread = max - min
        return { criterion: c, spread, values }
      })
      .filter((d) => d.spread > 0)
      .sort((a, b) => b.spread - a.spread)
      .slice(0, 3)
  }, [products, criteria])

  if (diffs.length === 0) return null

  return (
    <div className="space-y-2">
      {diffs.map((diff, i) => {
        const bestIdx = diff.criterion.higherBetter
          ? diff.values.indexOf(Math.max(...diff.values))
          : diff.values.indexOf(Math.min(...diff.values))
        return (
          <motion.div
            key={diff.criterion.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.5 + i * 0.1,
              type: 'spring' as const,
              stiffness: 250,
              damping: 20,
            }}
            className="flex items-center gap-2 text-xs"
          >
            <span>{diff.criterion.icon}</span>
            <span className="font-medium text-muted-foreground">{diff.criterion.label}:</span>
            <span className="font-bold" style={{ color: 'rgba(34, 197, 94, 1)' }}>
              {products[bestIdx].name}
            </span>
            <span className="text-muted-foreground">é melhor</span>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 border-amber-300/40 text-amber-600 dark:border-amber-600/30 dark:text-amber-400"
            >
              <Zap className="h-2.5 w-2.5 mr-0.5" />
              Destaque
            </Badge>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Verdict Card                                                       */
/* ------------------------------------------------------------------ */

function VerdictCard({ products }: { products: MockProduct[] }) {
  const winner = useMemo(() => {
    const scores = products.map((p) => ({
      product: p,
      score: p.rating * (100000 / p.price),
    }))
    return scores.sort((a, b) => b.score - a.score)[0].product
  }, [products])

  const confidence = 82

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: 'spring' as const, stiffness: 200, damping: 22 }}
    >
      <Card
        className="overflow-hidden"
        style={{
          boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.15), 0 4px 16px rgba(0, 0, 0, 0.06)',
        }}
      >
        <div
          className="h-1"
          style={{ background: 'linear-gradient(to right, rgba(16, 185, 129, 0.8), rgba(59, 130, 246, 0.8))' }}
        />
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Ring */}
            <ConfidenceRing percentage={confidence} delay={0.5} />

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                </motion.div>
                <h3 className="text-sm font-bold r49-verdict-shimmer">Recomendação da IA</h3>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                Com base na análise dos critérios selecionados, a IA recomenda o{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{winner.name}</span>{' '}
                como a melhor escolha para a maioria dos usuários.
              </p>

              <div className="flex items-center gap-2">
                <Badge
                  className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-700/30 gap-1"
                >
                  <Trophy className="h-3 w-3" />
                  {winner.name}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Share Button                                                       */
/* ------------------------------------------------------------------ */

function ShareComparisonButton({ products }: { products: MockProduct[] }) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const lines = products.map(
      (p) =>
        `📱 ${p.name}\n   💰 ${formatBRL(p.price)}\n   ⭐ ${p.rating}\n   ${Object.entries(p.specs)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' · ')}`,
    )
    const text = `🧠 Comparação Inteligente DomPlace\n${'═'.repeat(35)}\n\n${lines.join('\n\n')}\n\nPowered by AI`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Comparação Inteligente', text })
        return
      } catch {
        // Fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Comparação copiada!')
    setTimeout(() => setCopied(false), 2000)
  }, [products])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, type: 'spring' as const, stiffness: 200, damping: 20 }}
      className="flex justify-center"
    >
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs r49-share-glow"
          onClick={handleShare}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Copiado!
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" />
              Compartilhar comparação
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function SmartComparisonMatrix() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showResults, setShowResults] = useState(false)

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Auto-populate with all 3 products on first load for demo
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setSelectedIds(['phone-a', 'phone-b', 'phone-c'])
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // Show results when at least 2 products are selected
  useEffect(() => {
    if (selectedIds.length >= 2) {
      const timer = setTimeout(() => setShowResults(true), 400)
      return () => clearTimeout(timer)
    } else {
      setShowResults(false)
    }
  }, [selectedIds])

  const selectedProducts = useMemo(
    () => selectedIds.map((id) => MOCK_PRODUCTS.find((p) => p.id === id)!).filter(Boolean),
    [selectedIds],
  )

  const handleRemove = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((pid) => pid !== id))
    toast.info('Produto removido')
  }, [])

  const handleAddToCart = useCallback((product: MockProduct) => {
    toast.success(`${product.name} adicionado ao carrinho!`)
  }, [])

  const handleAddProduct = useCallback((id: string) => {
    if (selectedIds.length >= 3) {
      toast.warning('Máximo de 3 produtos para comparação inteligente')
      return
    }
    setSelectedIds((prev) => [...prev, id])
    toast.success('Produto adicionado à comparação')
  }, [selectedIds.length])

  // Compute max price-performance score
  const maxPerfScore = useMemo(
    () =>
      Math.max(...MOCK_PRODUCTS.map((p) => Math.round((p.rating / p.price) * 100000))),
    [],
  )

  // Key differences
  const keyDiffCriteria = useMemo(() => {
    if (selectedProducts.length < 2) return []
    return AUTO_CRITERIA
      .map((c) => {
        const values = selectedProducts.map((p) => getNumericSpecValue(c.key, p.specs[c.key]))
        const spread = Math.max(...values) - Math.min(...values)
        return { criterion: c, spread }
      })
      .filter((d) => d.spread > 0)
      .sort((a, b) => b.spread - a.spread)
      .slice(0, 3)
      .map((d) => d.criterion)
  }, [selectedProducts])

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <LoadingSkeleton />
      </motion.section>
    )
  }

  /* ---------- Empty (< 2 products) ---------- */
  if (selectedProducts.length < 2) {
    return <EmptyState />
  }

  /* ---------- Main comparison view ---------- */
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/50 overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center shadow-sm"
                style={{
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 1), rgba(20, 184, 166, 1))',
                }}
              >
                <Brain className="h-4 w-4 text-white" />
              </div>
              Comparação Inteligente
            </CardTitle>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Sparkles className="h-3 w-3" />
                AI-Powered
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {selectedProducts.length} produtos
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4 space-y-4">
          {/* 1. Product Selector Slots */}
          <div className="flex gap-2">
            {selectedProducts.map((product, i) => (
              <div key={product.id} className="flex-1 min-w-0">
                <ProductSlotCard
                  product={product}
                  index={i}
                  onRemove={() => handleRemove(product.id)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              </div>
            ))}
            {/* Empty slots up to 3 */}
            {selectedProducts.length < 3 &&
              Array.from({ length: 3 - selectedProducts.length }).map((_, i) => {
                const availableProducts = MOCK_PRODUCTS.filter(
                  (p) => !selectedIds.includes(p.id),
                )
                return (
                  <div key={`empty-${i}`} className="flex-1 min-w-0">
                    <EmptyProductSlot index={i + selectedProducts.length} />
                    {/* Quick add for available products */}
                    {availableProducts.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {availableProducts.map((p) => (
                          <motion.div
                            key={p.id}
                            whileTap={{ scale: 0.95 }}
                            className="cursor-pointer"
                            onClick={() => handleAddProduct(p.id)}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-7 text-[10px] gap-1 border-dashed"
                            >
                              <Plus className="h-3 w-3" />
                              {p.name}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>

          {/* Animate results in */}
          <AnimatePresence mode="wait">
            {showResults && selectedProducts.length >= 2 && (
              <motion.div
                key={selectedIds.join('-')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* 2 & 3. Auto-selected criteria label + Comparison Matrix */}
                <div className="bg-muted/30 rounded-xl overflow-hidden">
                  <div className="p-2.5 border-b border-border/30 flex items-center gap-2">
                    <Brain className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs font-semibold">
                      6 Critérios Selecionados pela IA
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 border-emerald-300/40 text-emerald-600 dark:border-emerald-600/30 dark:text-emerald-400"
                    >
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                      Smart
                    </Badge>
                  </div>

                  {/* Matrix header */}
                  <div
                    className="grid items-center bg-secondary/50 border-b border-border/40"
                    style={{
                      gridTemplateColumns: `120px repeat(${selectedProducts.length}, 1fr)`,
                    }}
                  >
                    <div className="p-2.5 text-[10px] font-semibold text-muted-foreground">
                      Critério
                    </div>
                    {selectedProducts.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.1 + i * 0.1,
                          type: 'spring' as const,
                          stiffness: 250,
                          damping: 20,
                        }}
                        className="p-2.5 text-[10px] font-semibold text-center border-l border-border/30"
                      >
                        <span className="line-clamp-1">{p.name}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Matrix rows */}
                  {AUTO_CRITERIA.map((criterion, rowIdx) => (
                    <MatrixRow
                      key={criterion.key}
                      criterion={criterion}
                      products={selectedProducts}
                      rowIndex={rowIdx}
                      isKeyDifference={keyDiffCriteria.some((kc) => kc.key === criterion.key)}
                    />
                  ))}
                </div>

                {/* 8. Key Differences */}
                {keyDiffCriteria.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, type: 'spring' as const, stiffness: 200, damping: 22 }}
                  >
                    <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/30 dark:border-amber-800/20 overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                            Principais Diferenças
                          </span>
                        </div>
                        <KeyDifferences products={selectedProducts} criteria={AUTO_CRITERIA} />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* 4. Verdict Card */}
                <VerdictCard products={selectedProducts} />

                {/* 5. Pros/Cons */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: 'spring' as const, stiffness: 200, damping: 22 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-1.5 mb-3">
                        <CircleCheckBig className="h-3.5 w-3.5 text-emerald-500" />
                        <CircleX className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-semibold">Prós e Contras</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedProducts.map((product, i) => (
                          <ProsCons key={product.id} product={product} index={i} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 6. Price-Performance Score */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, type: 'spring' as const, stiffness: 200, damping: 22 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-1.5 mb-3">
                        <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-xs font-semibold">
                          Custo-Benefício (Rating / Preço)
                        </span>
                      </div>
                      <div className="space-y-3">
                        {selectedProducts.map((product, i) => (
                          <PricePerformanceBar
                            key={product.id}
                            product={product}
                            index={i}
                            maxValue={maxPerfScore}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 7. Similar Users Choice */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, type: 'spring' as const, stiffness: 200, damping: 22 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Users className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-xs font-semibold">
                          Escolha de Usuários Similares
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {USER_CHOICE_DATA.filter((uc) =>
                          selectedIds.includes(uc.productId),
                        ).map((uc, i) => {
                          const product = MOCK_PRODUCTS.find((p) => p.id === uc.productId)
                          if (!product) return null
                          const productIndex = selectedIds.indexOf(uc.productId)
                          return (
                            <UsersChoiceBar
                              key={uc.productId}
                              product={product}
                              percentage={uc.percentage}
                              index={productIndex}
                            />
                          )
                        })}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 italic">
                        Baseado em análise de 12.847 comparações de usuários com perfil similar
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 9. Share Comparison */}
                <ShareComparisonButton products={selectedProducts} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer tip */}
          {selectedProducts.length < 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-2"
            >
              <p className="text-[11px] text-muted-foreground">
                Adicione até <span className="font-semibold text-primary">3 produtos</span> para comparação completa
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Embedded styles */}
      <style jsx global>{`
        .r49-key-row {
          background-color: rgba(245, 158, 11, 0.03);
        }
        .r49-verdict-shimmer {
          background: linear-gradient(
            90deg,
            rgba(16, 185, 129, 1) 0%,
            rgba(59, 130, 246, 1) 50%,
            rgba(16, 185, 129, 1) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: r49-shimmer 3s linear infinite;
        }
        @keyframes r49-shimmer {
          to {
            background-position: 200% center;
          }
        }
        .r49-share-glow {
          box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.2);
        }
        .r49-share-glow:hover {
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.3);
        }
        .r49-ring-container svg circle {
          transition: stroke-dashoffset 0.3s ease;
        }
      `}</style>
    </motion.section>
  )
}
