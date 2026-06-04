'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Trophy, Flame, Crown, RotateCcw, Star, ShoppingCart, Zap, TrendingUp, ChevronRight, Sparkles, Eye } from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { resolveProductImage } from '@/lib/product-images'
import { formatBRL } from '@/lib/format'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────────
interface VoteRecord {
  winnerId: string
  loserId: string
  votedHigherRated: boolean
  timestamp: number
}

interface BattleStats {
  totalVotes: number
  currentStreak: number
  bestStreak: number
  higherRatedStreak: number
}

// ── Helpers ────────────────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function loadBattleHistory(): VoteRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('domplace-battle-history')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveBattleHistory(history: VoteRecord[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('domplace-battle-history', JSON.stringify(history))
  } catch {
    // ignore
  }
}

function loadBattleStats(): BattleStats {
  if (typeof window === 'undefined') return { totalVotes: 0, currentStreak: 0, bestStreak: 0, higherRatedStreak: 0 }
  try {
    const stored = localStorage.getItem('domplace-battle-stats')
    return stored ? JSON.parse(stored) : { totalVotes: 0, currentStreak: 0, bestStreak: 0, higherRatedStreak: 0 }
  } catch {
    return { totalVotes: 0, currentStreak: 0, bestStreak: 0, higherRatedStreak: 0 }
  }
}

function saveBattleStats(stats: BattleStats): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('domplace-battle-stats', JSON.stringify(stats))
  } catch {
    // ignore
  }
}

// ── Animated Counter Component ─────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ y: -12, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 12, opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
        className="inline-block tabular-nums"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}

// ── VS Badge Component ──────────────────────────────────────────────
function VsBadge() {
  return (
    <div className="relative z-20 flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          boxShadow: [
            '0 0 0 0 oklch(0.78 0.16 70 / 0)',
            '0 0 24px 4px oklch(0.78 0.16 70 / 0.35)',
            '0 0 0 0 oklch(0.78 0.16 70 / 0)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg r32-vs-pulse"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
          className="text-lg sm:text-xl font-black text-white tracking-tight"
        >
          VS
        </motion.span>
      </motion.div>
      {/* Outer ring pulse */}
      <motion.div
        className="absolute h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-dashed border-amber-400/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// ── Product Battle Card ─────────────────────────────────────────────
function BattleCard({
  product,
  side,
  isWinner,
  hasVoted,
  onVote,
  onViewProduct,
  votePercentage,
}: {
  product: ProductData
  side: 'left' | 'right'
  isWinner: boolean | 'left' | 'right' | null
  hasVoted: boolean
  onVote: () => void
  onViewProduct: () => void
  votePercentage: number
}) {
  const imageUrl = resolveProductImage({
    slug: product.slug,
    category: product.category,
    images: product.images,
  })

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const categoryEmoji: Record<string, string> = {
    FOOD: '🍚', HEALTH: '💊', AGRICULTURE: '🌿', ELECTRONICS: '📱',
    BEAUTY: '💅', ANIMALS: '🐾', FASHION: '👗', SERVICES: '🔧',
    HOME_GARDEN: '🏠', EDUCATION: '📚', SPORTS: '⚽', OTHER: '📦',
  }

  const isLeft = side === 'left'

  return (
    <motion.div
      className={`flex-1 min-w-0 relative ${isWinner === side ? 'z-10' : ''}`}
      initial={isLeft
        ? { opacity: 0, x: -60, scale: 0.9, rotateY: -8 }
        : { opacity: 0, x: 60, scale: 0.9, rotateY: 8 }
      }
      animate={
        isWinner === side
          ? { opacity: 1, x: 0, scale: 1.05, rotateY: 0, boxShadow: '0 12px 40px oklch(0.45 0.1 155 / 0.25)' }
          : (isWinner !== null)
            ? { opacity: 0.5, x: 0, scale: 0.95, rotateY: 0 }
            : { opacity: 1, x: 0, scale: 1, rotateY: 0 }
      }
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
    >
      {/* Winner crown */}
      <AnimatePresence>
        {isWinner === side && (
          <motion.div
            initial={{ y: -30, opacity: 0, scale: 0 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 z-30"
          >
            <div className="text-3xl drop-shadow-lg">👑</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card */}
      <motion.div
        className={`relative bg-card rounded-2xl border-2 overflow-hidden cursor-pointer transition-colors r32-card-glow ${
          isWinner === side
            ? 'border-primary shadow-lg'
            : (isWinner !== null)
              ? 'border-border opacity-70'
              : 'border-border hover:border-primary/40'
        }`}
        whileHover={!hasVoted ? { y: -4, boxShadow: '0 10px 30px oklch(0 0 0 / 0.1)' } : {}}
        whileTap={!hasVoted ? { scale: 0.97 } : {}}
        onClick={hasVoted ? onViewProduct : onVote}
      >
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="text-5xl">
              {categoryEmoji[product.category] || '📦'}
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm"
            >
              -{discount}%
            </motion.div>
          )}

          {/* New badge */}
          {product.isNew && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-[9px] border-0 px-1.5 py-0">
              Novo
            </Badge>
          )}

          {/* Vote overlay */}
          <AnimatePresence>
            {!hasVoted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-center pb-4"
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-white/90 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1"
                >
                  <Zap className="h-3 w-3" />
                  Toque para votar
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Winner overlay */}
          <AnimatePresence>
            {isWinner === side && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-primary/10 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                  className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-bold shadow-lg flex items-center gap-1.5 r32-result-reveal"
                >
                  <Trophy className="h-4 w-4" />
                  Vencedor!
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vote percentage bar */}
          <AnimatePresence>
            {hasVoted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: '4px' }}
                exit={{ opacity: 0, height: 0 }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden"
              >
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${votePercentage}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full ${isWinner ? 'bg-primary' : 'bg-amber-500'}`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4">
          {/* Store name */}
          {product.storeName && (
            <p className="text-[10px] text-muted-foreground truncate mb-0.5">{product.storeName}</p>
          )}

          {/* Product name */}
          <h3 className="text-sm font-bold line-clamp-2 leading-tight min-h-[2.5rem]">{product.name}</h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground">({product.totalReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-base sm:text-lg font-bold text-primary">{formatBRL(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[10px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
            )}
          </div>

          {/* View product button after vote */}
          <AnimatePresence>
            {hasVoted && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onViewProduct() }}
                  className="mt-2 w-full text-xs text-primary font-medium flex items-center justify-center gap-1 hover:underline"
                >
                  Ver Detalhes
                  <ChevronRight className="h-3 w-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Stats Bar Component ─────────────────────────────────────────────
function StatsBar({ stats }: { stats: BattleStats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap"
    >
      <div className="flex items-center gap-1.5 bg-secondary/50 rounded-full px-3 py-1.5">
        <Swords className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-semibold">Votos: <AnimatedNumber value={stats.totalVotes} /></span>
      </div>

      <div className="flex items-center gap-1.5 bg-secondary/50 rounded-full px-3 py-1.5">
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        <span className="text-[11px] font-semibold">Sequência: <AnimatedNumber value={stats.currentStreak} /></span>
      </div>

      {stats.bestStreak > 0 && (
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full px-3 py-1.5 border border-amber-200/50 dark:border-amber-800/30">
          <Trophy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Recorde: {stats.bestStreak}</span>
        </div>
      )}

      {stats.higherRatedStreak >= 3 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
          className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full px-3 py-1.5 border border-emerald-200/50 dark:border-emerald-800/30"
        >
          <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            +<AnimatedNumber value={stats.higherRatedStreak} /> bons olhos!
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Empty State ────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-5xl mb-4"
      >
        🤼
      </motion.div>
      <h3 className="text-lg font-bold">Sem produtos suficientes</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
        Precisamos de pelo menos 2 produtos para iniciar um duelo. Volte mais tarde!
      </p>
    </motion.div>
  )
}

// ── Main ProductBattle Component ─────────────────────────────────────
export function ProductBattle() {
  const { selectProduct, navigate, addToCart } = useAppStore()
  const [allProducts, setAllProducts] = useState<ProductData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [leftProduct, setLeftProduct] = useState<ProductData | null>(null)
  const [rightProduct, setRightProduct] = useState<ProductData | null>(null)
  const [winner, setWinner] = useState<'left' | 'right' | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [battleStats, setBattleStats] = useState<BattleStats>({
    totalVotes: 0, currentStreak: 0, bestStreak: 0, higherRatedStreak: 0,
  })
  const [voteHistory, setVoteHistory] = useState<VoteRecord[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mounted, setMounted] = useState(false)
  const battleRef = useRef<HTMLDivElement>(null)

  // Load stats and history on mount
  useEffect(() => {
    setMounted(true)
    setBattleStats(loadBattleStats())
    setVoteHistory(loadBattleHistory())
  }, [])

  // Fetch products
  useEffect(() => {
    let cancelled = false
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const data = await cachedFetch('/api/products?limit=100')
        if (!cancelled && data.products) {
          setAllProducts(data.products)
        }
      } catch {
        // Silent fail
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchProducts()
    return () => { cancelled = true }
  }, [])

  // Pick random pair when products load
  const pickNewPair = useCallback(() => {
    if (allProducts.length < 2) return
    const shuffled = shuffleArray(allProducts)
    setLeftProduct(shuffled[0])
    setRightProduct(shuffled[1])
    setWinner(null)
    setHasVoted(false)
    setIsTransitioning(false)
  }, [allProducts])

  useEffect(() => {
    if (allProducts.length >= 2 && mounted) {
      pickNewPair()
    }
  }, [allProducts.length >= 2, mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle vote
  const handleVote = useCallback((side: 'left' | 'right') => {
    if (hasVoted || !leftProduct || !rightProduct) return

    setWinner(side)
    setHasVoted(true)

    const votedProduct = side === 'left' ? leftProduct : rightProduct
    const otherProduct = side === 'left' ? rightProduct : leftProduct

    // Track vote
    const votedHigherRated = votedProduct.rating >= otherProduct.rating
    const newRecord: VoteRecord = {
      winnerId: votedProduct.id,
      loserId: otherProduct.id,
      votedHigherRated,
      timestamp: Date.now(),
    }

    const newHistory = [newRecord, ...voteHistory].slice(0, 50)
    setVoteHistory(newHistory)
    saveBattleHistory(newHistory)

    // Update stats
    const newStats: BattleStats = {
      totalVotes: battleStats.totalVotes + 1,
      currentStreak: battleStats.currentStreak + 1,
      bestStreak: Math.max(battleStats.bestStreak, battleStats.currentStreak + 1),
      higherRatedStreak: votedHigherRated ? battleStats.higherRatedStreak + 1 : 0,
    }
    setBattleStats(newStats)
    saveBattleStats(newStats)

    // Confetti for higher-rated picks
    if (votedHigherRated) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1200)
    }
  }, [hasVoted, leftProduct, rightProduct, voteHistory, battleStats])

  // Next duel
  const handleNextDuel = useCallback(() => {
    setIsTransitioning(true)
    setTimeout(() => {
      pickNewPair()
    }, 300)
  }, [pickNewPair])

  // View product
  const handleViewProduct = useCallback((product: ProductData) => {
    selectProduct(product)
    navigate('product')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectProduct, navigate])

  // Add to cart shortcut
  const handleQuickAdd = useCallback((product: ProductData, e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product, product.storeName || 'Loja', 1)
    toast.success(`${product.name} adicionado ao carrinho!`)
  }, [addToCart])

  // Vote percentages (simulated — show 100/0 or 70/30 etc.)
  const votePercentages = useMemo(() => {
    if (!hasVoted || !winner) return { left: 50, right: 50 }
    if (winner === 'left') {
      return { left: 65 + Math.random() * 25, right: 10 + Math.random() * 20 }
    }
    return { left: 10 + Math.random() * 20, right: 65 + Math.random() * 25 }
  }, [hasVoted, winner])

  if (!mounted) return null
  if (isLoading) {
    return (
      <section className="mt-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse" />
            <div>
              <div className="h-5 w-40 bg-muted rounded-lg animate-pulse" />
              <div className="h-3 w-28 bg-muted rounded mt-1 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 aspect-square bg-muted rounded-2xl animate-pulse" />
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 aspect-square bg-muted rounded-2xl animate-pulse" />
          </div>
        </div>
      </section>
    )
  }

  if (allProducts.length < 2) return <EmptyState />

  return (
    <section className="mt-6">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-md"
          >
            <Swords className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-1.5 r32-battle-shimmer">
              Qual é o Melhor?
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
              >
                ⚔️
              </motion.span>
            </h2>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Vote no melhor produto e descubra o favorito
            </p>
          </div>
        </div>

        {battleStats.totalVotes > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
          >
            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold">
              <Sparkles className="h-3 w-3 mr-1" />
              Rodada #{battleStats.totalVotes}
            </Badge>
          </motion.div>
        )}
      </motion.div>

      {/* Stats bar */}
      {battleStats.totalVotes > 0 && <StatsBar stats={battleStats} />}

      {/* Battle Arena */}
      <div ref={battleRef} className="relative max-w-3xl mx-auto mt-4">
        {/* Background decorations */}
        <div className="absolute -inset-4 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-red-500/5 rounded-3xl pointer-events-none" />
        <div className="absolute -inset-2 border-2 border-dashed border-amber-500/15 rounded-2xl pointer-events-none" />

        {/* Confetti */}
        <ConfettiBurst active={showConfetti} particleCount={50} spread={250} />

        <AnimatePresence mode="wait">
          {!isTransitioning && leftProduct && rightProduct ? (
            <motion.div
              key={`${leftProduct.id}-${rightProduct.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative flex items-start gap-3 sm:gap-4 px-1"
            >
              {/* Left product */}
              <BattleCard
                product={leftProduct}
                side="left"
                isWinner={winner}
                hasVoted={hasVoted}
                onVote={() => handleVote('left')}
                onViewProduct={() => handleViewProduct(leftProduct)}
                votePercentage={votePercentages.left}
              />

              {/* VS Badge — positioned in center */}
              <div className="flex items-center self-center -mx-3 sm:-mx-5 shrink-0">
                <VsBadge />
              </div>

              {/* Right product */}
              <BattleCard
                product={rightProduct}
                side="right"
                isWinner={winner}
                hasVoted={hasVoted}
                onVote={() => handleVote('right')}
                onViewProduct={() => handleViewProduct(rightProduct)}
                votePercentage={votePercentages.right}
              />
            </motion.div>
          ) : (
            <motion.div
              key="transitioning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick action buttons under each card */}
        <AnimatePresence>
          {hasVoted && leftProduct && rightProduct && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 sm:gap-4 mt-4"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5 text-xs"
                  onClick={(e) => handleQuickAdd(leftProduct, e)}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Adicionar {leftProduct.name.split(' ').slice(0, 2).join(' ')}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5 text-xs"
                  onClick={(e) => handleQuickAdd(rightProduct, e)}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Adicionar {rightProduct.name.split(' ').slice(0, 2).join(' ')}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next duel button */}
        <AnimatePresence>
          {hasVoted && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center mt-5"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  onClick={handleNextDuel}
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg gap-2 px-6 btn-glow"
                >
                  <RotateCcw className="h-4 w-4" />
                  Próximo Duelo
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tip text */}
        <AnimatePresence>
          {!hasVoted && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-[11px] text-muted-foreground mt-4 flex items-center justify-center gap-1"
            >
              <Eye className="h-3 w-3" />
              Dica: votar no produto mais bem avaliado aumenta sua sequência!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Historical stats summary at bottom */}
      {battleStats.totalVotes >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mt-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Suas Estatísticas de Duelo</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-primary">
                <AnimatedNumber value={battleStats.totalVotes} />
              </p>
              <p className="text-[10px] text-muted-foreground">Duelos concluídos</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                <AnimatedNumber value={battleStats.bestStreak} />
              </p>
              <p className="text-[10px] text-muted-foreground">Melhor sequência</p>
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                <AnimatedNumber value={battleStats.higherRatedStreak} />
              </p>
              <p className="text-[10px] text-muted-foreground">Acertos seguidos</p>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  )
}
