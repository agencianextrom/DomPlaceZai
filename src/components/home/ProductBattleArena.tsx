'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Swords, Clock, Star, ChevronDown, ChevronUp,
  Crown, Share2, Zap, Flame, RefreshCw, Filter,
  Medal, Target, TrendingUp, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface ProductEntry {
  id: string
  name: string
  emoji: string
  price: number
  priceOld?: number
  rating: number
  specs: string[]
  votes: number
  category: string
}

interface BattleData {
  id: string
  productA: ProductEntry
  productB: ProductEntry
  category: string
  endDate: string
  votesA: number
  votesB: number
  isActive: boolean
}

interface BattleHistoryEntry {
  id: string
  productA: ProductEntry
  productB: ProductEntry
  winnerA: boolean
  totalVotes: number
  votesA: number
  votesB: number
}

type CategoryFilter = 'Todas' | 'Eletrônicos' | 'Alimentos' | 'Moda' | 'Casa'

// ═══════════════════════════════════════════════════════════════
// Mock Data — 3 battles
// ═══════════════════════════════════════════════════════════════

const MOCK_BATTLES: BattleData[] = [
  {
    id: 'battle-1',
    category: 'Eletrônicos',
    endDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    isActive: true,
    votesA: 127,
    votesB: 89,
    productA: {
      id: 'p1',
      name: 'AirPods Pro 3',
      emoji: '🎧',
      price: 1899.9,
      priceOld: 2299.0,
      rating: 4.8,
      specs: ['Noise Canceling Ativo', 'Bateria 6h', 'Resistência IPX4'],
      votes: 127,
      category: 'Eletrônicos',
    },
    productB: {
      id: 'p2',
      name: 'Galaxy Buds3 Pro',
      emoji: '🎵',
      price: 1599.9,
      priceOld: 1999.0,
      rating: 4.6,
      specs: ['Áudio 360°', 'Bateria 8h', 'Bluetooth 5.4'],
      votes: 89,
      category: 'Eletrônicos',
    },
  },
  {
    id: 'battle-2',
    category: 'Alimentos',
    endDate: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    isActive: true,
    votesA: 204,
    votesB: 178,
    productA: {
      id: 'p3',
      name: 'Café Especial Cerrado',
      emoji: '☕',
      price: 42.9,
      priceOld: 59.9,
      rating: 4.9,
      specs: ['100% Arábica', 'Torra Média', '500g Premium'],
      votes: 204,
      category: 'Alimentos',
    },
    productB: {
      id: 'p4',
      name: 'Azeite Extra Virgem',
      emoji: '🫒',
      price: 68.9,
      priceOld: 89.9,
      rating: 4.7,
      specs: ['Importado da Espanha', 'Acidez 0.3%', '500ml First Cold'],
      votes: 178,
      category: 'Alimentos',
    },
  },
  {
    id: 'battle-3',
    category: 'Moda',
    endDate: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    isActive: true,
    votesA: 156,
    votesB: 134,
    productA: {
      id: 'p5',
      name: 'Tênis Running Ultra',
      emoji: '👟',
      price: 599.9,
      priceOld: 899.9,
      rating: 4.5,
      specs: ['Espuma Reativa', 'Ultra Leve 280g', 'Traseleção Anti Impacto'],
      votes: 156,
      category: 'Moda',
    },
    productB: {
      id: 'p6',
      name: 'Jaqueta Urban Tech',
      emoji: '🧥',
      price: 349.9,
      priceOld: 549.9,
      rating: 4.4,
      specs: ['Impermeável', 'Bolsos Ocultos', 'Tecnologia Térmica'],
      votes: 134,
      category: 'Moda',
    },
  },
]

const MOCK_HISTORY: BattleHistoryEntry[] = [
  {
    id: 'hist-1',
    productA: {
      id: 'hp1', name: 'Kindle Paperwhite', emoji: '📖', price: 649.9,
      rating: 4.7, specs: ['Tela 6.8"', 'Bateria 10 semanas', 'IPX8'], votes: 189, category: 'Eletrônicos',
    },
    productB: {
      id: 'hp2', name: 'Kobo Clara HD', emoji: '📚', price: 499.9,
      rating: 4.3, specs: ['Tela 6"', 'Bateria 8 semanas', 'ComfortLight'], votes: 112, category: 'Eletrônicos',
    },
    winnerA: true, totalVotes: 301, votesA: 189, votesB: 112,
  },
  {
    id: 'hist-2',
    productA: {
      id: 'hp3', name: 'Chocolate Belga 85%', emoji: '🍫', price: 32.9,
      rating: 4.8, specs: ['Cacau Premium', 'Sem Açúcar', '100g'], votes: 145, category: 'Alimentos',
    },
    productB: {
      id: 'hp4', name: 'Geleia Artesanal', emoji: '🍓', price: 28.9,
      rating: 4.6, specs: ['Natural 100%', 'Zero Conservantes', '340g'], votes: 132, category: 'Alimentos',
    },
    winnerA: false, totalVotes: 277, votesA: 132, votesB: 145,
  },
  {
    id: 'hist-3',
    productA: {
      id: 'hp5', name: 'Relógio Minimalista', emoji: '⌚', price: 299.9,
      rating: 4.5, specs: ['Aço Inox', 'Movimento Quartz', '40m Waterproof'], votes: 198, category: 'Moda',
    },
    productB: {
      id: 'hp6', name: 'Óculos Polarizado', emoji: '🕶️', price: 259.9,
      rating: 4.4, specs: ['UV400', 'Lente Polarizada', 'Titanium Flex'], votes: 167, category: 'Moda',
    },
    winnerA: true, totalVotes: 365, votesA: 198, votesB: 167,
  },
]

const CATEGORY_FILTERS: CategoryFilter[] = ['Todas', 'Eletrônicos', 'Alimentos', 'Moda', 'Casa']

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function getCategoryEmoji(cat: CategoryFilter): string {
  switch (cat) {
    case 'Eletrônicos': return '📱'
    case 'Alimentos': return '🍎'
    case 'Moda': return '👗'
    case 'Casa': return '🏠'
    default: return '🎯'
  }
}

function padZero(n: number): string {
  return String(n).padStart(2, '0')
}

// ═══════════════════════════════════════════════════════════════
// Confetti Burst (lightweight, inline)
// ═══════════════════════════════════════════════════════════════

function MiniConfetti({ side }: { side: 'left' | 'right' }) {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: side === 'left' ? 10 + Math.random() * 40 : 50 + Math.random() * 40,
      delay: Math.random() * 0.5,
      color: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
      size: 4 + Math.random() * 6,
    })), [side])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            left: `${p.x}%`,
            top: '20%',
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: 120, opacity: 0, rotate: 360 }}
          transition={{ duration: 1.2 + Math.random() * 0.8, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Star Rating Display
// ═══════════════════════════════════════════════════════════════

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'md' ? 'h-4 w-4' : 'h-3 w-3'
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className={`${starSize} fill-amber-400 text-amber-400`} />
      ))}
      {hasHalf && (
        <div className="relative" style={{ width: size === 'md' ? 16 : 12, height: size === 'md' ? 16 : 12 }}>
          <Star className={`${starSize} absolute inset-0 text-muted-foreground`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`${starSize} fill-amber-400 text-amber-400`} />
          </div>
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className={`${starSize} text-muted-foreground`} />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Animated Count Up
// ═══════════════════════════════════════════════════════════════

function AnimatedCountUp({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    const start = prevRef.current
    const end = value
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
    prevRef.current = value
  }, [value, duration])

  return <span className="tabular-nums">{display}</span>
}

// ═══════════════════════════════════════════════════════════════
// Battle Timer — 24h countdown
// ═══════════════════════════════════════════════════════════════

function BattleTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculate = () => {
      const now = Date.now()
      const end = new Date(endDate).getTime()
      const diff = Math.max(0, end - now)
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [endDate])

  const isUrgent = timeLeft.hours < 3

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <Clock className={`h-3.5 w-3.5 ${isUrgent ? 'text-red-500' : ''}`} />
      </motion.div>
      <span className="font-mono font-bold text-foreground">
        {padZero(timeLeft.hours)}
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          :
        </motion.span>
        {padZero(timeLeft.minutes)}
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
        >
          :
        </motion.span>
        <span className={isUrgent ? 'text-red-500' : ''}>{padZero(timeLeft.seconds)}</span>
      </span>
      {isUrgent && (
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="text-[9px] text-red-500 font-bold"
        >
          ⚡ Encerrando!
        </motion.span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VS Badge — center pulsing glow
// ═══════════════════════════════════════════════════════════════

function VsBadge() {
  return (
    <div className="relative z-20 flex items-center justify-center">
      <motion.div
        className="absolute h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-dashed border-amber-400/30 r46-vs-ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          boxShadow: [
            '0 0 0 0 rgba(245, 158, 11, 0)',
            '0 0 20px 6px rgba(245, 158, 11, 0.35)',
            '0 0 0 0 rgba(245, 158, 11, 0)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center r46-vs-glow"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 18 }}
          className="text-lg sm:text-xl font-black text-white tracking-tight"
        >
          VS
        </motion.span>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Product Display Card (one side of the battle)
// ═══════════════════════════════════════════════════════════════

function ProductSideCard({
  product,
  side,
  isWinner,
  hasVoted,
  percentage,
  confettiActive,
}: {
  product: ProductEntry
  side: 'left' | 'right'
  isWinner: boolean
  hasVoted: boolean
  percentage: number
  confettiActive: boolean
}) {
  const isLeft = side === 'left'
  const borderColor = isWinner ? (isLeft ? 'rgba(59,130,246,0.6)' : 'rgba(239,68,68,0.6)') : 'rgba(128,128,128,0.2)'

  return (
    <motion.div
      className={`flex-1 min-w-0 relative ${isWinner ? 'z-10' : ''}`}
      initial={isLeft
        ? { opacity: 0, x: -80, scale: 0.9 }
        : { opacity: 0, x: 80, scale: 0.9 }
      }
      animate={isWinner
        ? { opacity: 1, x: 0, scale: 1.03, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }
        : { opacity: hasVoted && !isWinner ? 0.7 : 1, x: 0, scale: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
      }
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
    >
      {/* Confetti */}
      <AnimatePresence>
        {confettiActive && <MiniConfetti side={side} />}
      </AnimatePresence>

      {/* Winner crown */}
      <AnimatePresence>
        {isWinner && hasVoted && (
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 18 }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 z-30"
          >
            <div className="text-3xl drop-shadow-lg">👑</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`relative rounded-2xl overflow-hidden r46-battle-card ${
          isWinner ? 'ring-2' : ''
        }`}
        style={{
          borderColor: borderColor,
          background: isWinner
            ? (isLeft ? 'rgba(59,130,246,0.04)' : 'rgba(239,68,68,0.04)')
            : 'rgba(128,128,128,0.02)',
        }}
      >
        {/* Product image area */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center overflow-hidden">
          <motion.span
            className="text-5xl sm:text-6xl"
            animate={isWinner ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {product.emoji}
          </motion.span>

          {/* Winner badge overlay */}
          <AnimatePresence>
            {isWinner && hasVoted && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                className="absolute top-2 right-2"
              >
                <Badge className="text-[9px] font-bold px-2 py-0.5">
                  <Trophy className="h-3 w-3 mr-1" />
                  Vencedor
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Price discount badge */}
          {product.priceOld && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
              className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg"
            >
              -{Math.round(((product.priceOld - product.price) / product.priceOld) * 100)}%
            </motion.div>
          )}
        </div>

        {/* Product info */}
        <div className="p-3 sm:p-4">
          {/* Name */}
          <h3 className="text-sm sm:text-base font-bold leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <StarRating rating={product.rating} />
            <span className="text-[11px] font-semibold text-foreground">{product.rating.toFixed(1)}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-base sm:text-lg font-bold text-primary">{formatBRL(product.price)}</span>
            {product.priceOld && (
              <span className="text-[10px] text-muted-foreground line-through">{formatBRL(product.priceOld)}</span>
            )}
          </div>

          {/* Specs */}
          <ul className="mt-2.5 space-y-1">
            {product.specs.map((spec, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.08, type: 'spring' as const, stiffness: 300, damping: 20 }}
                className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
              >
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span>{spec}</span>
              </motion.li>
            ))}
          </ul>

          {/* Vote percentage bar */}
          {hasVoted && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-muted-foreground">
                  {Math.round(percentage)}% dos votos
                </span>
                <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                  {side === 'left' ? 'PRODUTO A' : 'PRODUTO B'}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.0, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: isLeft
                      ? 'linear-gradient(to right, rgba(59,130,246,0.9), rgba(96,165,250,0.9))'
                      : 'linear-gradient(to right, rgba(239,68,68,0.9), rgba(248,113,113,0.9))',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Vote Progress Bar — full width
// ═══════════════════════════════════════════════════════════════

function VoteProgressBar({
  votesA,
  votesB,
  hasVoted,
}: {
  votesA: number
  votesB: number
  hasVoted: boolean
}) {
  const total = votesA + votesB
  const pctA = total > 0 ? Math.round((votesA / total) * 100) : 50
  const pctB = total > 0 ? 100 - pctA : 50

  return (
    <div className="mt-4 space-y-2">
      {/* Blue vs Red bar */}
      <div className="h-3 bg-muted rounded-full overflow-hidden flex">
        <motion.div
          initial={{ width: hasVoted ? '0%' : `${pctA}%` }}
          animate={{ width: `${pctA}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full"
          style={{ background: 'linear-gradient(to right, rgba(59,130,246,1), rgba(96,165,250,1))' }}
        />
        <div className="w-1 bg-background z-10 shrink-0" />
        <motion.div
          initial={{ width: hasVoted ? '0%' : `${pctB}%` }}
          animate={{ width: `${pctB}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full"
          style={{ background: 'linear-gradient(to right, rgba(248,113,113,1), rgba(239,68,68,1))' }}
        />
      </div>
      {/* Labels */}
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-blue-500">🔵 {pctA}%</span>
        <span className="text-muted-foreground tabular-nums">
          {total} votos totais
        </span>
        <span className="text-red-500">🔴 {pctB}%</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Total Votes Counter — animated count-up
// ═══════════════════════════════════════════════════════════════

function TotalVotesCounter({ total }: { total: number }) {
  return (
    <motion.div
      className="flex items-center justify-center gap-2 mt-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center gap-1.5 bg-secondary/50 rounded-full px-3 py-1.5"
      >
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        <span className="text-[11px] font-semibold">
          Total: <AnimatedCountUp value={total} />
        </span>
        <span className="text-[10px] text-muted-foreground">participações</span>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Battle History Item
// ═══════════════════════════════════════════════════════════════

function BattleHistoryItem({ battle }: { battle: BattleHistoryEntry }) {
  const [expanded, setExpanded] = useState(false)
  const winnerProduct = battle.winnerA ? battle.productA : battle.productB
  const loserProduct = battle.winnerA ? battle.productB : battle.productA
  const winPct = Math.round((battle.winnerA ? battle.votesA : battle.votesB) / battle.totalVotes * 100)
  const losePct = 100 - winPct

  return (
    <motion.div
      className="r46-history-item bg-card border border-border rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{winnerProduct.emoji}</span>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">{winnerProduct.name}</p>
            <p className="text-[10px] text-muted-foreground">venceu com {winPct}% dos votos</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="secondary" className="text-[9px]">
            {battle.totalVotes} votos
          </Badge>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
              {/* Winner */}
              <div className="flex items-center gap-2">
                <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate">{winnerProduct.name}</p>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${winPct}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 tabular-nums shrink-0">{winPct}%</span>
              </div>
              {/* Loser */}
              <div className="flex items-center gap-2">
                <Medal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground truncate">{loserProduct.name}</p>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${losePct}%` }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="h-full rounded-full bg-gray-400"
                    />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground tabular-nums shrink-0">{losePct}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Leaderboard
// ═══════════════════════════════════════════════════════════════

function Leaderboard({ battles }: { battles: BattleData[] }) {
  const allProducts = useMemo(() => {
    const productVotes: Record<string, { product: ProductEntry; totalVotes: number }> = {}
    for (const battle of battles) {
      const entryA = productVotes[battle.productA.id]
      const entryB = productVotes[battle.productB.id]
      productVotes[battle.productA.id] = {
        product: battle.productA,
        totalVotes: (entryA?.totalVotes || 0) + battle.votesA,
      }
      productVotes[battle.productB.id] = {
        product: battle.productB,
        totalVotes: (entryB?.totalVotes || 0) + battle.votesB,
      }
    }
    return Object.values(productVotes)
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .slice(0, 5)
  }, [battles])

  const rankColors = ['#f59e0b', '#9ca3af', '#cd7f32', '#6b7280', '#6b7280']
  const rankBgs = [
    'rgba(245,158,11,0.1)', 'rgba(156,163,175,0.08)',
    'rgba(205,127,50,0.08)', 'rgba(107,114,128,0.05)', 'rgba(107,114,128,0.05)',
  ]

  return (
    <div className="r46-leaderboard space-y-1.5">
      {allProducts.map((entry, idx) => (
        <motion.div
          key={entry.product.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 300, damping: 22 }}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
          style={{ background: rankBgs[idx] }}
        >
          {/* Rank */}
          <div className="relative w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: rankColors[idx] }}
          >
            {idx === 0 && (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-1 -right-1"
              >
                <Crown className="h-3 w-3 text-amber-400" />
              </motion.div>
            )}
            <span className="text-[11px] font-black text-white">{idx + 1}</span>
          </div>

          {/* Emoji */}
          <span className="text-xl">{entry.product.emoji}</span>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{entry.product.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <StarRating rating={entry.product.rating} size="sm" />
            </div>
          </div>

          {/* Votes */}
          <div className="text-right shrink-0">
            <p className="text-xs font-bold text-primary tabular-nums">
              {entry.totalVotes}
            </p>
            <p className="text-[9px] text-muted-foreground">votos</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Category Filter Bar
// ═══════════════════════════════════════════════════════════════

function CategoryBar({
  active,
  onChange,
}: {
  active: CategoryFilter
  onChange: (cat: CategoryFilter) => void
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {CATEGORY_FILTERS.map(cat => (
        <motion.div key={cat} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <button
            onClick={() => onChange(cat)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all r46-category-btn ${
              active === cat
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat !== 'Todas' && <span className="text-xs">{getCategoryEmoji(cat)}</span>}
            {cat}
          </button>
        </motion.div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT — ProductBattleArena
// ═══════════════════════════════════════════════════════════════

export default function ProductBattleArena() {
  const [battles] = useState<BattleData[]>(MOCK_BATTLES)
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('Todas')
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0)
  const [votesA, setVotesA] = useState<number | null>(null)
  const [votesB, setVotesB] = useState<number | null>(null)
  const [userVote, setUserVote] = useState<'A' | 'B' | null>(null)
  const [confettiSide, setConfettiSide] = useState<'left' | 'right' | null>(null)
  const [mounted, setMounted] = useState(false)

  // Filtered battles by category
  const filteredBattles = useMemo(() => {
    if (activeCategory === 'Todas') return battles
    return battles.filter(b => b.category === activeCategory)
  }, [battles, activeCategory])

  // Current active battle
  const currentBattle = filteredBattles[currentBattleIndex % filteredBattles.length] || filteredBattles[0]

  // Resolve vote counts
  const resolvedVotesA = votesA !== null ? votesA : (currentBattle?.votesA || 0)
  const resolvedVotesB = votesB !== null ? votesB : (currentBattle?.votesB || 0)
  const totalVotes = resolvedVotesA + resolvedVotesB
  const pctA = totalVotes > 0 ? (resolvedVotesA / totalVotes) * 100 : 50
  const pctB = totalVotes > 0 ? (resolvedVotesB / totalVotes) * 100 : 50

  // Mark mounted
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  // Reset votes when battle changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVotesA(null)
    setVotesB(null)
    setUserVote(null)
    setConfettiSide(null)
  }, [currentBattleIndex, activeCategory])

  // Handle voting
  const handleVote = useCallback((side: 'A' | 'B') => {
    if (userVote || !currentBattle) return
    setUserVote(side)
    setConfettiSide(side === 'A' ? 'left' : 'right')

    if (side === 'A') {
      setVotesA(prev => (prev ?? currentBattle.votesA) + 1)
      setVotesB(prev => prev ?? currentBattle.votesB)
    } else {
      setVotesA(prev => prev ?? currentBattle.votesA)
      setVotesB(prev => (prev ?? currentBattle.votesB) + 1)
    }

    // Clear confetti after 1.5s
    setTimeout(() => setConfettiSide(null), 1500)
  }, [userVote, currentBattle])

  // Handle new random battle
  const handleNewBattle = useCallback(() => {
    setCurrentBattleIndex(prev => (prev + 1) % filteredBattles.length)
  }, [filteredBattles.length])

  // Share battle via Web Share API
  const handleShare = useCallback(async () => {
    if (!currentBattle) return
    const shareData = {
      title: 'Batalha de Produtos — DomPlace',
      text: `🥊 ${currentBattle.productA.name} VS ${currentBattle.productB.name} — Vote agora!`,
      url: window.location.href,
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled or share failed — ignore
      }
    }
  }, [currentBattle])

  if (!mounted || !currentBattle) return null

  const hasVoted = userVote !== null
  const winnerSide = hasVoted
    ? (resolvedVotesA >= resolvedVotesB ? 'left' : 'right')
    : null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 25 }}
      className="relative overflow-hidden r62-card-lift r96-battle-arena-card"
    >
      {/* Background decoration */}
      <div className="absolute -inset-4 rounded-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle at 30% 20%, rgba(59,130,246,0.04), transparent 60%)' }}
      />
      <div className="absolute -inset-4 rounded-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle at 70% 80%, rgba(239,68,68,0.04), transparent 60%)' }}
      />

      <div className="relative">
        {/* ── Section Header ── */}
        <motion.div
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg r46-header-icon"
            >
              <Trophy className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 r62-heading-gradient">
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent r46-battle-title">
                  Batalha de Produtos
                </span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
                  className="text-lg"
                >
                  ⚔️
                </motion.span>
              </h2>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                Vote no seu favorito e descubra o campeão!
              </p>
            </div>
          </div>

          {/* Share button */}
          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs r46-share-btn"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* ── Category Filter ── */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <CategoryBar active={activeCategory} onChange={setActiveCategory} />
        </motion.div>

        {/* ── Battle Arena Card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBattle.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="relative bg-card border border-border rounded-2xl overflow-hidden r46-arena-card"
          >
            {/* Top accent gradient */}
            <div className="h-1.5 relative overflow-hidden"
              style={{
                background: 'linear-gradient(to right, rgba(59,130,246,1), rgba(168,85,247,1), rgba(239,68,68,1))',
              }}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
              >
                <div className="w-1/3 h-full" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.35), transparent)' }} />
              </motion.div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Battle header row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                    <Swords className="h-3 w-3 mr-1" />
                    {currentBattle.category}
                  </Badge>
                </div>
                <BattleTimer endDate={currentBattle.endDate} />
              </div>

              {/* VS Battle Card — two products side by side */}
              <div className="relative flex items-start gap-2 sm:gap-3">
                {/* Product A */}
                <ProductSideCard
                  product={currentBattle.productA}
                  side="left"
                  isWinner={winnerSide === 'left'}
                  hasVoted={hasVoted}
                  percentage={pctA}
                  confettiActive={confettiSide === 'left'}
                />

                {/* VS Badge center */}
                <div className="flex items-center self-center -mx-2 sm:-mx-4 shrink-0">
                  <VsBadge />
                </div>

                {/* Product B */}
                <ProductSideCard
                  product={currentBattle.productB}
                  side="right"
                  isWinner={winnerSide === 'right'}
                  hasVoted={hasVoted}
                  percentage={pctB}
                  confettiActive={confettiSide === 'right'}
                />
              </div>

              {/* ── Vote Buttons ── */}
              <AnimatePresence>
                {!hasVoted && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 mt-5"
                  >
                    {/* Vote for A */}
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                      <Button
                        onClick={() => handleVote('A')}
                        className="w-full font-bold text-sm py-3 border-0 r46-vote-btn-a"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59,130,246,1), rgba(96,165,250,1))',
                          color: '#ffffff',
                          boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                        }}
                      >
                        <Zap className="h-4 w-4 mr-1.5" />
                        Votar no Produto A
                      </Button>
                    </motion.div>

                    {/* Vote for B */}
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                      <Button
                        onClick={() => handleVote('B')}
                        className="w-full font-bold text-sm py-3 border-0 r46-vote-btn-b"
                        style={{
                          background: 'linear-gradient(135deg, rgba(239,68,68,1), rgba(248,113,113,1))',
                          color: '#ffffff',
                          boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
                        }}
                      >
                        <Zap className="h-4 w-4 mr-1.5" />
                        Votar no Produto B
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── After vote: progress bar + results ── */}
              {hasVoted && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: 'spring' as const, stiffness: 250, damping: 20 }}
                >
                  {/* Vote progress bar */}
                  <VoteProgressBar votesA={resolvedVotesA} votesB={resolvedVotesB} hasVoted={hasVoted} />

                  {/* Total votes counter */}
                  <TotalVotesCounter total={totalVotes} />

                  {/* New Battle button */}
                  <div className="flex justify-center mt-4">
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      <Button
                        onClick={handleNewBattle}
                        className="font-bold text-sm gap-2 px-6 border-0 r46-new-battle-btn"
                        style={{
                          background: 'linear-gradient(135deg, rgba(168,85,247,1), rgba(139,92,246,1))',
                          color: '#ffffff',
                          boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Criar nova batalha
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ── Timer + Total (before vote) ── */}
              {!hasVoted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-3 mt-4"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <AnimatedCountUp value={totalVotes} /> participantes
                  </div>
                </motion.div>
              )}
            </div>

            {/* Bottom accent bar */}
            <div className="h-1 relative overflow-hidden"
              style={{
                background: 'linear-gradient(to right, rgba(59,130,246,1), rgba(168,85,247,1), rgba(239,68,68,1))',
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Battle History ── */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring' as const, stiffness: 200, damping: 25 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold">Histórico de Batalhas</h3>
            <Badge variant="secondary" className="text-[9px]">3 recentes</Badge>
          </div>
          <div className="space-y-2">
            {MOCK_HISTORY.map(battle => (
              <BattleHistoryItem key={battle.id} battle={battle} />
            ))}
          </div>
        </motion.div>

        {/* ── Leaderboard ── */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: 'spring' as const, stiffness: 200, damping: 25 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold">Ranking dos Produtos</h3>
            <Badge variant="secondary" className="text-[9px]">
              <Crown className="h-3 w-3 mr-0.5 text-amber-500" />
              Top 5
            </Badge>
          </div>
          <Leaderboard battles={battles} />
        </motion.div>

        {/* ── Battle Navigation Dots ── */}
        {filteredBattles.length > 1 && (
          <motion.div
            className="flex items-center justify-center gap-2 mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {filteredBattles.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentBattleIndex(idx)}
                className={`h-2 rounded-full transition-all r46-nav-dot ${
                  idx === (currentBattleIndex % filteredBattles.length)
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Floating particles decoration */}
      <motion.div
        className="absolute top-10 right-6 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(59,130,246,0.25)' }}
        animate={{ y: [0, -14, -28], opacity: [0, 0.5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
      />
      <motion.div
        className="absolute top-20 left-8 w-1 h-1 rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(239,68,68,0.25)' }}
        animate={{ y: [0, -10, -22], opacity: [0, 0.4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut', delay: 1.1 }}
      />
      <motion.div
        className="absolute bottom-20 right-1/4 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(168,85,247,0.2)' }}
        animate={{ y: [0, 10, 24], opacity: [0, 0.4, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeOut', delay: 1.7 }}
      />
      <motion.div
        className="absolute bottom-10 left-16 w-1 h-1 rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(245,158,11,0.25)' }}
        animate={{ y: [0, -8, -16], opacity: [0, 0.5, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
      />
    </motion.section>
  )
}
