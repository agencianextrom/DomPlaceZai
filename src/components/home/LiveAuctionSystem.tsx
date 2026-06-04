'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gavel, Clock, Users, TrendingUp, Eye, Trophy, Filter, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// ==================== TYPES ====================

type AuctionStatus = 'ativo' | 'encerrando' | 'encerrado'

interface BidEntry {
  id: string
  user: string
  avatar: string
  amount: number
  timestamp: Date
  isYou?: boolean
}

interface AuctionItem {
  id: string
  name: string
  emoji: string
  category: string
  startPrice: number
  currentBid: number
  bidCount: number
  reservePrice: number
  timeRemaining: number // seconds
  status: AuctionStatus
  bids: BidEntry[]
  lastBidUser: string
}

type CategoryFilter = 'Todos' | 'Eletrônicos' | 'Casa' | 'Moda'

// ==================== MOCK DATA ====================

const INITIAL_AUCTIONS: AuctionItem[] = [
  {
    id: 'a1',
    name: 'iPhone 15 Pro Max',
    emoji: '📱',
    category: 'Eletrônicos',
    startPrice: 3500,
    currentBid: 4250,
    bidCount: 18,
    reservePrice: 4000,
    timeRemaining: 3420,
    status: 'ativo',
    bids: [
      { id: 'b1', user: 'Carlos M.', avatar: 'C', amount: 4250, timestamp: new Date(Date.now() - 15000), isYou: false },
      { id: 'b2', user: 'Ana S.', avatar: 'A', amount: 4240, timestamp: new Date(Date.now() - 45000) },
      { id: 'b3', user: 'Pedro L.', avatar: 'P', amount: 4220, timestamp: new Date(Date.now() - 90000) },
      { id: 'b4', user: 'Maria R.', avatar: 'M', amount: 4200, timestamp: new Date(Date.now() - 180000) },
      { id: 'b5', user: 'João F.', avatar: 'J', amount: 4180, timestamp: new Date(Date.now() - 300000) },
    ],
    lastBidUser: 'Carlos M.',
  },
  {
    id: 'a2',
    name: 'Dyson Airwrap Complete',
    emoji: '💇‍♀️',
    category: 'Casa',
    startPrice: 1800,
    currentBid: 2100,
    bidCount: 12,
    reservePrice: 2200,
    timeRemaining: 180,
    status: 'encerrando',
    bids: [
      { id: 'b6', user: 'Lucia T.', avatar: 'L', amount: 2100, timestamp: new Date(Date.now() - 10000) },
      { id: 'b7', user: 'Rafael N.', avatar: 'R', amount: 2090, timestamp: new Date(Date.now() - 35000) },
      { id: 'b8', user: 'Beatriz C.', avatar: 'B', amount: 2070, timestamp: new Date(Date.now() - 72000) },
      { id: 'b9', user: 'Você', avatar: 'V', amount: 2050, timestamp: new Date(Date.now() - 120000), isYou: true },
      { id: 'b10', user: 'Diego A.', avatar: 'D', amount: 2030, timestamp: new Date(Date.now() - 200000) },
    ],
    lastBidUser: 'Lucia T.',
  },
  {
    id: 'a3',
    name: 'Tênis Nike Air Jordan 1',
    emoji: '👟',
    category: 'Moda',
    startPrice: 600,
    currentBid: 890,
    bidCount: 24,
    reservePrice: 700,
    timeRemaining: 5400,
    status: 'ativo',
    bids: [
      { id: 'b11', user: 'Você', avatar: 'V', amount: 890, timestamp: new Date(Date.now() - 5000), isYou: true },
      { id: 'b12', user: 'Gabriel P.', avatar: 'G', amount: 880, timestamp: new Date(Date.now() - 25000) },
      { id: 'b13', user: 'Fernanda K.', avatar: 'F', amount: 870, timestamp: new Date(Date.now() - 60000) },
      { id: 'b14', user: 'Thiago M.', avatar: 'T', amount: 860, timestamp: new Date(Date.now() - 110000) },
      { id: 'b15', user: 'Camila D.', avatar: 'C', amount: 850, timestamp: new Date(Date.now() - 170000) },
    ],
    lastBidUser: 'Você',
  },
  {
    id: 'a4',
    name: 'MacBook Air M3',
    emoji: '💻',
    category: 'Eletrônicos',
    startPrice: 5500,
    currentBid: 6200,
    bidCount: 31,
    reservePrice: 6000,
    timeRemaining: 0,
    status: 'encerrado',
    bids: [
      { id: 'b16', user: 'Você', avatar: 'V', amount: 6200, timestamp: new Date(Date.now() - 5000), isYou: true },
      { id: 'b17', user: 'Renato B.', avatar: 'R', amount: 6190, timestamp: new Date(Date.now() - 30000) },
      { id: 'b18', user: 'Isabela S.', avatar: 'I', amount: 6170, timestamp: new Date(Date.now() - 70000) },
      { id: 'b19', user: 'Marcos V.', avatar: 'M', amount: 6150, timestamp: new Date(Date.now() - 130000) },
      { id: 'b20', user: 'Juliana A.', avatar: 'J', amount: 6130, timestamp: new Date(Date.now() - 210000) },
    ],
    lastBidUser: 'Você',
  },
]

const COMPETITOR_NAMES = [
  'Carlos M.', 'Ana S.', 'Pedro L.', 'Maria R.', 'João F.',
  'Lucia T.', 'Rafael N.', 'Beatriz C.', 'Diego A.', 'Gabriel P.',
  'Fernanda K.', 'Thiago M.', 'Camila D.', 'Renato B.', 'Isabela S.',
]

const CATEGORY_FILTERS: CategoryFilter[] = ['Todos', 'Eletrônicos', 'Casa', 'Moda']

const QUICK_BID_AMOUNTS = [5, 10, 50, 100] as const

// ==================== HELPERS ====================

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatTime(totalSeconds: number): { hours: number; minutes: number; seconds: number } {
  const clamped = Math.max(0, totalSeconds)
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const seconds = clamped % 60
  return { hours, minutes, seconds }
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'agora'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}min`
  return `${Math.floor(diffSec / 3600)}h`
}

function getStatusColors(status: AuctionStatus): {
  bg: string
  border: string
  text: string
  dot: string
  glow: string
} {
  switch (status) {
    case 'ativo':
      return {
        bg: 'rgba(16, 185, 129, 0.08)',
        border: 'rgba(16, 185, 129, 0.3)',
        text: '#10b981',
        dot: '#34d399',
        glow: 'rgba(16, 185, 129, 0.2)',
      }
    case 'encerrando':
      return {
        bg: 'rgba(245, 158, 11, 0.08)',
        border: 'rgba(245, 158, 11, 0.3)',
        text: '#f59e0b',
        dot: '#fbbf24',
        glow: 'rgba(245, 158, 11, 0.2)',
      }
    case 'encerrado':
      return {
        bg: 'rgba(107, 114, 128, 0.08)',
        border: 'rgba(107, 114, 128, 0.3)',
        text: '#6b7280',
        dot: '#9ca3af',
        glow: 'rgba(107, 114, 128, 0.1)',
      }
  }
}

function getStatusLabel(status: AuctionStatus): string {
  switch (status) {
    case 'ativo': return 'Ativo'
    case 'encerrando': return 'Encerrando'
    case 'encerrado': return 'Encerrado'
  }
}

// ==================== CONFETTI PARTICLES ====================

function ConfettiParticles() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    color: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
    size: 4 + Math.random() * 8,
  }))

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
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: 500, opacity: 0, rotate: 720 }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ==================== AO VIVO BADGE ====================

function LiveBadge({ status }: { status: AuctionStatus }) {
  if (status === 'encerrado') return null

  return (
    <motion.div
      className="r45-live-badge flex items-center gap-1.5 bg-red-500 text-white px-2.5 py-1 rounded-full"
      animate={{ opacity: status === 'encerrando' ? [1, 0.7, 1] : 1 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.span
        className="w-2 h-2 rounded-full bg-white"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="text-[10px] font-bold tracking-wider">AO VIVO</span>
    </motion.div>
  )
}

// ==================== COUNTDOWN TIMER ====================

function CountdownTimer({
  timeRemaining,
  isUrgent,
}: {
  timeRemaining: number
  isUrgent: boolean
}) {
  const { hours, minutes, seconds } = formatTime(timeRemaining)

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-1">
      {isUrgent && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none r45-countdown-glow"
          animate={{
            boxShadow: '0 0 12px 4px rgba(239, 68, 68, 0.4), 0 0 24px 8px rgba(239, 68, 68, 0.15)',
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ borderRadius: 8 }}
        />
      )}
      <Clock className={`h-3.5 w-3.5 shrink-0 ${isUrgent ? 'text-red-500' : 'text-muted-foreground'}`} />
      <div className={`flex items-center gap-0.5 font-mono text-sm font-bold tabular-nums relative ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
        <span className="r45-timer-digit bg-muted/60 dark:bg-muted/30 rounded px-1 py-0.5">
          <motion.span
            key={hours}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
          >
            {pad(hours)}
          </motion.span>
        </span>
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          :
        </motion.span>
        <span className="r45-timer-digit bg-muted/60 dark:bg-muted/30 rounded px-1 py-0.5">
          <motion.span
            key={minutes}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
          >
            {pad(minutes)}
          </motion.span>
        </span>
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          :
        </motion.span>
        <span className={`r45-timer-digit bg-muted/60 dark:bg-muted/30 rounded px-1 py-0.5 ${isUrgent ? 'bg-red-100 dark:bg-red-900/30' : ''}`}>
          <motion.span
            key={seconds}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
          >
            {pad(seconds)}
          </motion.span>
        </span>
      </div>
    </div>
  )
}

// ==================== BID HISTORY ====================

function BidHistory({ bids }: { bids: BidEntry[] }) {
  const visibleBids = bids.slice(0, 5)

  return (
    <div className="r45-bid-history mt-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
        <Users className="h-3 w-3" />
        Últimos lances
      </div>
      <div className="space-y-1">
        <AnimatePresence>
          {visibleBids.map((bid, i) => (
            <motion.div
              key={bid.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 30, delay: i * 0.04 }}
              className="flex items-center gap-2 py-1"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${
                  bid.isYou
                    ? 'bg-primary'
                    : i === 0
                    ? 'bg-amber-500'
                    : 'bg-gray-400 dark:bg-gray-500'
                }`}
              >
                {bid.avatar}
              </div>
              <span className="flex-1 text-[10px] truncate">
                <span className={bid.isYou ? 'font-bold text-primary' : 'font-medium'}>
                  {bid.user}
                </span>
              </span>
              <span className="text-[10px] font-bold text-foreground">{formatBRL(bid.amount)}</span>
              <span className="text-[9px] text-muted-foreground shrink-0">{formatTimeAgo(bid.timestamp)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ==================== WINNER OVERLAY ====================

function WinnerOverlay({ auctionName, bidAmount, onClose }: { auctionName: string; bidAmount: number; onClose: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ConfettiParticles />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        className="relative z-10 text-center px-6 py-8"
        initial={{ scale: 0.5, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
          className="text-6xl mb-4"
        >
          🏆
        </motion.div>
        <h3 className="text-2xl font-extrabold text-white mb-2">Parabéns!</h3>
        <p className="text-sm text-gray-200 mb-1">Você venceu o leilão de</p>
        <p className="text-lg font-bold text-amber-400 mb-1">{auctionName}</p>
        <p className="text-2xl font-extrabold text-green-400 mb-4">{formatBRL(bidAmount)}</p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 font-bold r45-close-winner-btn"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Incrível!
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ==================== QUICK BID BUTTONS ====================

function QuickBidButtons({
  currentBid,
  onBid,
  isEncerrado,
}: {
  currentBid: number
  onBid: (amount: number) => void
  isEncerrado: boolean
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {QUICK_BID_AMOUNTS.map(amount => (
        <motion.div key={amount} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
          <button
            onClick={() => onBid(currentBid + amount)}
            disabled={isEncerrado}
            className="r45-quick-bid-btn text-[10px] font-bold px-2.5 py-1 rounded-lg bg-secondary/80 dark:bg-secondary/50 border border-border/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            +R${amount}
          </button>
        </motion.div>
      ))}
    </div>
  )
}

// ==================== AUCTION CARD ====================

function AuctionCard({
  auction,
  onBid,
  index,
  isWinner,
  onDismissWinner,
}: {
  auction: AuctionItem
  onBid: (auctionId: string, amount: number) => void
  index: number
  isWinner: boolean
  onDismissWinner: () => void
}) {
  const [bidInput, setBidInput] = useState('')
  const isEncerrado = auction.status === 'encerrado'
  const isEncerrando = auction.status === 'encerrando'
  const isUrgent = auction.timeRemaining > 0 && auction.timeRemaining < 300
  const reserveMet = auction.currentBid >= auction.reservePrice
  const colors = getStatusColors(auction.status)

  const handlePlaceBid = useCallback(() => {
    const val = parseFloat(bidInput)
    if (isNaN(val) || val <= auction.currentBid || val - auction.currentBid < 5) return
    onBid(auction.id, val)
    setBidInput('')
  }, [bidInput, auction.currentBid, auction.id, onBid])

  const handleCustomBidChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBidInput(e.target.value)
  }, [])

  return (
    <motion.div
      className="r45-auction-card relative"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.12,
        type: 'spring' as const,
        stiffness: 260,
        damping: 22,
      }}
      layout
    >
      <Card
        className="overflow-hidden h-full"
        style={{
          borderColor: colors.border,
          background: colors.bg,
          boxShadow: isUrgent
            ? '0 0 16px 4px rgba(239, 68, 68, 0.15), 0 2px 8px rgba(0,0,0,0.08)'
            : '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <CardContent className="p-3 sm:p-4 flex flex-col gap-3">
          {/* Top row: emoji, status badge, live badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center"
                animate={auction.status === 'ativo' ? { rotate: [0, 3, -3, 0] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-2xl sm:text-3xl">{auction.emoji}</span>
              </motion.div>
              <div>
                <h3 className="text-sm font-bold leading-tight line-clamp-1">{auction.name}</h3>
                <Badge
                  className="text-[9px] px-1.5 py-0 h-5 mt-0.5"
                  style={{
                    backgroundColor: colors.dot,
                    color: isEncerrado ? '#ffffff' : '#ffffff',
                    border: 'none',
                  }}
                >
                  {getStatusLabel(auction.status)}
                </Badge>
              </div>
            </div>
            <LiveBadge status={auction.status} />
          </div>

          {/* Price section */}
          <div className="r45-price-section">
            <div className="flex items-baseline gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground">Lance atual</span>
            </div>
            <motion.p
              key={auction.currentBid}
              className="text-xl sm:text-2xl font-extrabold text-primary mt-0.5"
              initial={{ scale: 0.85, color: '#ef4444' }}
              animate={{ scale: 1, color: '#10b981' }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            >
              {formatBRL(auction.currentBid)}
            </motion.p>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Gavel className="h-3 w-3" />
                {auction.bidCount} lances
              </span>
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {Math.floor(auction.bidCount * 4.2 + 12)} assistindo
              </span>
            </div>
          </div>

          {/* Reserve price indicator */}
          <div className="r45-reserve-indicator">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${reserveMet ? 'bg-green-500' : 'bg-amber-500'}`} />
              <span className={`text-[10px] font-medium ${reserveMet ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                Preço reserva {reserveMet ? 'atingido ✓' : `: ${formatBRL(auction.reservePrice)}`}
              </span>
            </div>
            <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${reserveMet ? 'bg-green-500' : 'bg-amber-400'}`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, Math.max(0, ((auction.currentBid - auction.startPrice) / (auction.reservePrice - auction.startPrice)) * 100))}%`,
                }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
              />
            </div>
          </div>

          {/* Countdown */}
          {auction.status !== 'encerrado' && (
            <div className="r45-countdown relative">
              <CountdownTimer timeRemaining={auction.timeRemaining} isUrgent={isUrgent} />
            </div>
          )}

          {/* Bid History */}
          <BidHistory bids={auction.bids} />

          {/* Bid controls */}
          {!isEncerrado ? (
            <div className="r45-bid-controls mt-3 space-y-2">
              {/* Quick bid buttons */}
              <QuickBidButtons
                currentBid={auction.currentBid}
                onBid={(amount) => onBid(auction.id, amount)}
                isEncerrado={isEncerrado}
              />

              {/* Custom bid input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground">R$</span>
                  <input
                    type="number"
                    value={bidInput}
                    onChange={handleCustomBidChange}
                    placeholder={formatBRL(auction.currentBid + 5)}
                    min={auction.currentBid + 5}
                    step={5}
                    className="r45-bid-input w-full h-8 rounded-lg border border-border/50 bg-background pl-8 pr-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                  />
                </div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    onClick={handlePlaceBid}
                    disabled={
                      isEncerrado ||
                      !bidInput ||
                      parseFloat(bidInput) <= auction.currentBid ||
                      parseFloat(bidInput) - auction.currentBid < 5
                    }
                    className="r45-bid-btn h-8 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 font-bold text-xs gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Gavel className="h-3.5 w-3.5" />
                    Dar Lance
                  </Button>
                </motion.div>
              </div>

              {/* Bid button pulse animation indicator */}
              {isEncerrando && (
                <motion.div
                  className="flex items-center justify-center gap-1 text-[9px] text-amber-600 dark:text-amber-400 font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Encerrando em breve — dê seu último lance!
                </motion.div>
              )}
            </div>
          ) : (
            <div className="r45-ended-indicator mt-3 text-center py-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                Leilão encerrado
              </p>
              {auction.lastBidUser === 'Você' && (
                <motion.p
                  className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-0.5"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🎉 Você venceu!
                </motion.p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Winner overlay */}
      <AnimatePresence>
        {isWinner && (
          <WinnerOverlay
            auctionName={auction.name}
            bidAmount={auction.currentBid}
            onClose={onDismissWinner}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ==================== CATEGORY FILTER ====================

function CategoryFilter({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: CategoryFilter
  onFilterChange: (filter: CategoryFilter) => void
}) {
  return (
    <div className="r45-category-filter relative flex items-center bg-secondary/50 dark:bg-secondary/30 rounded-xl p-1 gap-0.5">
      {CATEGORY_FILTERS.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`relative z-10 flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeFilter === filter
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {filter !== 'Todos' && (
            <span className="text-xs">{filter === 'Eletrônicos' ? '📱' : filter === 'Casa' ? '🏠' : '👗'}</span>
          )}
          {filter}
        </button>
      ))}
      <motion.div
        layoutId="r45-category-indicator"
        className="absolute top-1 bottom-1 bg-primary rounded-lg r45-filter-indicator"
        style={{
          width: `${100 / CATEGORY_FILTERS.length}%`,
          left: `${(CATEGORY_FILTERS.indexOf(activeFilter) / CATEGORY_FILTERS.length) * 100}%`,
        }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
      />
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export default function LiveAuctionSystem() {
  const [auctions, setAuctions] = useState<AuctionItem[]>(INITIAL_AUCTIONS)
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('Todos')
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [showWinner, setShowWinner] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown timer tick
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setAuctions(prev =>
        prev.map(auction => {
          if (auction.status === 'encerrado') return auction

          const newTime = auction.timeRemaining - 1

          // Check if auction should end
          if (newTime <= 0) {
            const isUserWinner = auction.lastBidUser === 'Você'
            return { ...auction, timeRemaining: 0, status: 'encerrado' as const }
          }

          // Transition to "encerrando" when under 5 minutes
          let newStatus = auction.status
          if (newTime < 300 && newStatus === 'ativo') {
            newStatus = 'encerrando'
          }

          return { ...auction, timeRemaining: newTime, status: newStatus }
        }),
      )
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Check for user winners on status change
  useEffect(() => {
    const userWon = auctions.find(
      a => a.status === 'encerrado' && a.lastBidUser === 'Você' && a.id !== winnerId
    )
    if (userWon && !showWinner) {
      setWinnerId(userWon.id)
      setShowWinner(true)
    }
  }, [auctions, winnerId, showWinner])

  // Auto-refresh: simulated competitor bids every 8-12 seconds
  useEffect(() => {
    const scheduleNextBid = () => {
      const delay = 8000 + Math.random() * 4000
      return setTimeout(() => {
        setAuctions(prev =>
          prev.map(auction => {
            if (auction.status === 'encerrado') return auction

            // 50% chance of a competitor bid per active auction
            if (Math.random() < 0.5) {
              const randomName = COMPETITOR_NAMES[Math.floor(Math.random() * COMPETITOR_NAMES.length)]
              const increment = [5, 10, 15, 20, 25, 50][Math.floor(Math.random() * 6)]
              const newBidAmount = auction.currentBid + increment

              const newBid: BidEntry = {
                id: `auto-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                user: randomName,
                avatar: randomName.charAt(0),
                amount: newBidAmount,
                timestamp: new Date(),
                isYou: false,
              }

              const updatedBids = [newBid, ...auction.bids].slice(0, 5)

              return {
                ...auction,
                currentBid: newBidAmount,
                bidCount: auction.bidCount + 1,
                bids: updatedBids,
                lastBidUser: randomName,
              }
            }
            return auction
          }),
        )
        scheduleNextBid()
      }, delay)
    }

    const timeoutId = scheduleNextBid()
    return () => clearTimeout(timeoutId)
  }, [])

  // Handle user bid
  const handleBid = useCallback((auctionId: string, amount: number) => {
    setAuctions(prev =>
      prev.map(auction => {
        if (auction.id !== auctionId || auction.status === 'encerrado') return auction
        if (amount <= auction.currentBid) return auction
        if (amount - auction.currentBid < 5) return auction

        const newBid: BidEntry = {
          id: `user-${Date.now()}`,
          user: 'Você',
          avatar: 'V',
          amount,
          timestamp: new Date(),
          isYou: true,
        }

        const updatedBids = [newBid, ...auction.bids].slice(0, 5)

        return {
          ...auction,
          currentBid: amount,
          bidCount: auction.bidCount + 1,
          bids: updatedBids,
          lastBidUser: 'Você',
        }
      }),
    )
  }, [])

  const dismissWinner = useCallback(() => {
    setShowWinner(false)
  }, [])

  // Filter auctions
  const filteredAuctions = activeFilter === 'Todos'
    ? auctions
    : auctions.filter(a => a.category === activeFilter)

  const activeCount = auctions.filter(a => a.status !== 'encerrado').length

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: 'spring' as const, stiffness: 200, damping: 25 }}
      className="relative overflow-hidden"
    >
      <div className="relative bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/10 dark:via-indigo-950/10 dark:to-blue-950/10 rounded-2xl border border-purple-200/40 dark:border-purple-800/20 overflow-hidden r45-auction-section">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)' }} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, -8, 8, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg r45-header-icon"
            >
              <Gavel className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span className="r45-header-gradient-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Leilões ao Vivo
                </span>
                {activeCount > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full"
                  >
                    {activeCount} ativo{activeCount !== 1 ? 's' : ''}
                  </motion.span>
                )}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Dê lances em tempo real e conquiste produtos exclusivos
              </p>
            </div>
          </div>

          {/* Category filter */}
          <div className="w-full sm:w-auto">
            <CategoryFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>
        </div>

        {/* Auction grid: 2 cols mobile, 3 cols desktop */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 r45-auction-grid">
            <AnimatePresence mode="popLayout">
              {filteredAuctions.map((auction, index) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  onBid={handleBid}
                  index={index}
                  isWinner={showWinner && winnerId === auction.id}
                  onDismissWinner={dismissWinner}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state for filtered view */}
          {filteredAuctions.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Filter className="h-10 w-10 text-muted-foreground/40" />
              </motion.div>
              <p className="text-sm text-muted-foreground mt-3">Nenhum leilão nesta categoria</p>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveFilter('Todos')}
                  className="mt-2 r45-show-all-btn"
                >
                  Ver todos os leilões
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Bottom progress bar with shimmer */}
        <div className="h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 relative overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          >
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* Floating decorative particles */}
      <motion.div
        className="absolute top-8 right-6 w-1.5 h-1.5 rounded-full bg-purple-400/30 pointer-events-none"
        animate={{ y: [0, -12, -24], opacity: [0, 0.6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' as const, delay: 0.5 }}
      />
      <motion.div
        className="absolute top-16 left-8 w-1 h-1 rounded-full bg-indigo-400/25 pointer-events-none"
        animate={{ y: [0, -10, -20], opacity: [0, 0.5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut' as const, delay: 1.2 }}
      />
      <motion.div
        className="absolute top-4 left-1/3 w-1 h-1 rounded-full bg-blue-400/30 pointer-events-none"
        animate={{ y: [0, -8, -18], opacity: [0, 0.7, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut' as const, delay: 0.8 }}
      />
      <motion.div
        className="absolute bottom-12 right-1/4 w-1.5 h-1.5 rounded-full bg-violet-400/25 pointer-events-none"
        animate={{ y: [0, 10, 22], opacity: [0, 0.4, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeOut' as const, delay: 1.6 }}
      />
    </motion.section>
  )
}
