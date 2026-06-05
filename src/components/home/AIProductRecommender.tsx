'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import {
  Sparkles,
  BrainCircuit,
  TrendingUp,
  RefreshCw,
  X,
  ChevronRight,
  Star,
  Store,
  Eye,
  Users,
  Lightbulb,
  Package,
  Heart,
  Clock,
  Zap,
  ShieldCheck,
  ArrowRight,
  ThumbsDown,
  ThumbsUp,
  Info,
  ToggleLeft,
  ToggleRight,
  MousePointerClick,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────
interface RecommendedProduct {
  id: string
  name: string
  storeName: string
  price: number
  comparePrice: number | null
  image: string | null
  emoji: string
  category: string
  rating: number
  reviewCount: number
  confidence: number
  reasoning: string
  similarTasteCount: number
  categoryKey: RecommendationCategory
}

type RecommendationCategory =
  | 'viewed'
  | 'trending'
  | 'bought-together'
  | 'top-picks'

interface CategoryTab {
  key: RecommendationCategory
  label: string
  icon: React.ReactNode
  description: string
}

// ── Constants ───────────────────────────────────────────────────
const CATEGORY_TABS: CategoryTab[] = [
  {
    key: 'viewed',
    label: 'Porque você viu',
    icon: <Eye className="h-3.5 w-3.5" />,
    description: 'Based on products you recently viewed',
  },
  {
    key: 'trending',
    label: 'Em alta perto de você',
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    description: 'Popular products trending in your neighborhood',
  },
  {
    key: 'bought-together',
    label: 'Comprados juntos',
    icon: <Package className="h-3.5 w-3.5" />,
    description: 'Frequently purchased with your recent items',
  },
  {
    key: 'top-picks',
    label: 'Escolhas para você',
    icon: <Sparkles className="h-3.5 w-3.5" />,
    description: 'Top picks curated by our AI for your taste',
  },
]

const EMOJI_MAP: Record<string, string> = {
  FOOD: '🍚',
  HEALTH: '💊',
  AGRICULTURE: '🌿',
  ELECTRONICS: '📱',
  BEAUTY: '💅',
  ANIMALS: '🐾',
  FASHION: '👗',
  SERVICES: '🔧',
  HOME_GARDEN: '🏠',
  EDUCATION: '📚',
  SPORTS: '⚽',
  OTHER: '📦',
}

const GRADIENTS = [
  'from-violet-100 to-purple-200 dark:from-violet-900/30 dark:to-purple-800/30',
  'from-cyan-100 to-blue-200 dark:from-cyan-900/30 dark:to-blue-800/30',
  'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-yellow-200 dark:from-amber-900/30 dark:to-yellow-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
]

const AI_REASONS: Record<RecommendationCategory, string[]> = {
  viewed: [
    'Similar style to products you recently browsed',
    'Matches your interest in this category',
    'Customers who viewed the same items also loved this',
    'Popular among shoppers with similar browsing patterns',
    'Frequently favorited alongside your viewed products',
  ],
  trending: [
    'Rising fast in your neighborhood this week',
    'Top seller within 5km of your location',
    'Viral product in your area — 40% more orders today',
    'High demand right now with great delivery times',
    'Local favorite with excellent recent reviews',
  ],
  'bought-together': [
    '87% of buyers also purchased this item',
    'Perfect complement to your recent purchases',
    'Often bought together for a complete set',
    'Bundle deal: get both for a better price',
    'Recommended pairing based on purchase patterns',
  ],
  'top-picks': [
    'Our AI detected a match with your taste profile',
    'Highly rated product in your preferred categories',
    'Aligned with your seasonal shopping patterns',
    'Award-winning product matching your preferences',
    'Personalized pick based on 50+ shopping signals',
  ],
}

// ── Mock Data Generator ────────────────────────────────────────
function generateMockProducts(): RecommendedProduct[] {
  const products: RecommendedProduct[] = [
    {
      id: 'rec-001',
      name: 'Açaí Orgânico Premium 500ml',
      storeName: 'Açaí da Terra',
      price: 24.90,
      comparePrice: 32.90,
      image: null,
      emoji: '🫐',
      category: 'FOOD',
      rating: 4.8,
      reviewCount: 2340,
      confidence: 94,
      reasoning: AI_REASONS.viewed[0],
      similarTasteCount: 1847,
      categoryKey: 'viewed',
    },
    {
      id: 'rec-002',
      name: 'Fone Bluetooth JBL Tune 720BT',
      storeName: 'TechWorld',
      price: 349.90,
      comparePrice: 499.90,
      image: null,
      emoji: '🎧',
      category: 'ELECTRONICS',
      rating: 4.6,
      reviewCount: 5670,
      confidence: 88,
      reasoning: AI_REASONS.viewed[1],
      similarTasteCount: 3210,
      categoryKey: 'viewed',
    },
    {
      id: 'rec-003',
      name: 'Hidratante Nivea Soft 200ml',
      storeName: 'Beleza Pura',
      price: 29.90,
      comparePrice: 39.90,
      image: null,
      emoji: '🧴',
      category: 'BEAUTY',
      rating: 4.5,
      reviewCount: 8900,
      confidence: 91,
      reasoning: AI_REASONS.trending[0],
      similarTasteCount: 4520,
      categoryKey: 'trending',
    },
    {
      id: 'rec-004',
      name: 'Pizza Congelada Margherita',
      storeName: 'Padaria Nova Esperança',
      price: 18.90,
      comparePrice: null,
      image: null,
      emoji: '🍕',
      category: 'FOOD',
      rating: 4.3,
      reviewCount: 1230,
      confidence: 82,
      reasoning: AI_REASONS.trending[1],
      similarTasteCount: 890,
      categoryKey: 'trending',
    },
    {
      id: 'rec-005',
      name: 'Ração Premium Cães Adultos 15kg',
      storeName: 'Petshop Amigo',
      price: 89.90,
      comparePrice: 109.90,
      image: null,
      emoji: '🐕',
      category: 'ANIMALS',
      rating: 4.7,
      reviewCount: 3450,
      confidence: 87,
      reasoning: AI_REASONS['bought-together'][0],
      similarTasteCount: 2100,
      categoryKey: 'bought-together',
    },
    {
      id: 'rec-006',
      name: 'Detergente Líquido 500ml 3un',
      storeName: 'Mercado São Jorge',
      price: 12.90,
      comparePrice: 17.90,
      image: null,
      emoji: '🧹',
      category: 'HOME_GARDEN',
      rating: 4.4,
      reviewCount: 6780,
      confidence: 85,
      reasoning: AI_REASONS['bought-together'][1],
      similarTasteCount: 5670,
      categoryKey: 'bought-together',
    },
    {
      id: 'rec-007',
      name: 'Vitamina C 1000mg 60 cáps',
      storeName: 'Farmácia Popular',
      price: 34.90,
      comparePrice: 49.90,
      image: null,
      emoji: '💊',
      category: 'HEALTH',
      rating: 4.8,
      reviewCount: 9200,
      confidence: 96,
      reasoning: AI_REASONS['top-picks'][0],
      similarTasteCount: 7800,
      categoryKey: 'top-picks',
    },
    {
      id: 'rec-008',
      name: 'Camiseta Básica Algodão Premium',
      storeName: 'Moda Urbana',
      price: 49.90,
      comparePrice: 79.90,
      image: null,
      emoji: '👕',
      category: 'FASHION',
      rating: 4.5,
      reviewCount: 4560,
      confidence: 90,
      reasoning: AI_REASONS['top-picks'][1],
      similarTasteCount: 3400,
      categoryKey: 'top-picks',
    },
    {
      id: 'rec-009',
      name: 'Café Especial Torrado 250g',
      storeName: 'Empório Café',
      price: 38.90,
      comparePrice: null,
      image: null,
      emoji: '☕',
      category: 'FOOD',
      rating: 4.9,
      reviewCount: 1560,
      confidence: 93,
      reasoning: AI_REASONS['top-picks'][2],
      similarTasteCount: 1200,
      categoryKey: 'top-picks',
    },
    {
      id: 'rec-010',
      name: 'Pelúcia Coelho Grande',
      storeName: 'Brinquedos & Cia',
      price: 59.90,
      comparePrice: 79.90,
      image: null,
      emoji: '🐰',
      category: 'OTHER',
      rating: 4.6,
      reviewCount: 2340,
      confidence: 79,
      reasoning: AI_REASONS['bought-together'][2],
      similarTasteCount: 980,
      categoryKey: 'bought-together',
    },
    {
      id: 'rec-011',
      name: 'Muda de Tomate Cereja',
      storeName: 'Horta Viva',
      price: 8.90,
      comparePrice: null,
      image: null,
      emoji: '🍅',
      category: 'AGRICULTURE',
      rating: 4.2,
      reviewCount: 890,
      confidence: 76,
      reasoning: AI_REASONS.trending[2],
      similarTasteCount: 650,
      categoryKey: 'trending',
    },
    {
      id: 'rec-012',
      name: 'Bola de Futebol Profissional',
      storeName: 'Esporte Total',
      price: 129.90,
      comparePrice: 169.90,
      image: null,
      emoji: '⚽',
      category: 'SPORTS',
      rating: 4.7,
      reviewCount: 3210,
      confidence: 84,
      reasoning: AI_REASONS.viewed[3],
      similarTasteCount: 1560,
      categoryKey: 'viewed',
    },
  ]
  return products
}

// ── Confidence Ring ─────────────────────────────────────────────
function ConfidenceRing({ score, size = 36 }: { score: number; size?: number }) {
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 90 ? '#10b981' : score >= 80 ? '#3b82f6' : score >= 70 ? '#f59e0b' : '#ef4444'

  return (
    <div className="r51-recommend-confidence-ring relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="r51-recommend-confidence-svg -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(128,128,128,0.2)"
          strokeWidth={strokeWidth}
          className="r51-recommend-confidence-bg"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' as const, delay: 0.3 }}
          className="r51-recommend-confidence-fill"
        />
      </svg>
      <div className="r51-recommend-confidence-text absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-bold" style={{ color }}>
          {score}%
        </span>
      </div>
    </div>
  )
}

// ── AI Pick Badge with Shimmer ─────────────────────────────────
function AIPickBadge() {
  return (
    <div className="r51-recommend-ai-badge relative overflow-hidden">
      <div className="absolute inset-0 r51-recommend-ai-badge-shimmer" />
      <Badge className="relative bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 text-[9px] px-2 py-0.5 font-bold gap-1">
        <BrainCircuit className="h-3 w-3" />
        AI Pick
      </Badge>
    </div>
  )
}

// ── Why This Tooltip ───────────────────────────────────────────
function WhyThisButton({ reasoning }: { reasoning: string }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowTooltip(false)
      }
    }
    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTooltip])

  return (
    <div className="r51-recommend-why-wrapper relative" ref={tooltipRef}>
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="sm"
          className="r51-recommend-why-btn h-7 gap-1 text-[10px] text-muted-foreground hover:text-primary px-2"
          onClick={() => setShowTooltip(!showTooltip)}
        >
          <Lightbulb className="h-3 w-3" />
          Why this?
        </Button>
      </motion.div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
            className="r51-recommend-why-tooltip absolute bottom-full left-1/2 z-50 w-56"
            style={{ transform: 'translateX(-50%)' }}
          >
            <div className="bg-popover border rounded-lg shadow-lg p-3 mb-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <BrainCircuit className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  AI Reasoning
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {reasoning}
              </p>
            </div>
            <motion.div
              className="r51-recommend-why-arrow absolute left-1/2 -bottom-1"
              style={{ transform: 'translateX(-50%)' }}
            >
              <div className="w-2.5 h-2.5 bg-popover border-r border-b rotate-45" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Similar Taste Counter ──────────────────────────────────────
function SimilarTasteCounter({ count }: { count: number }) {
  const formatted = new Intl.NumberFormat('pt-BR').format(count)

  return (
    <div className="r51-recommend-taste-counter flex items-center gap-1 mt-1.5">
      <Users className="h-3 w-3 text-muted-foreground" />
      <span className="text-[9px] text-muted-foreground">
        <span className="font-semibold text-foreground">{formatted}</span>{' '}
        pessoas com gosto similar compraram
      </span>
    </div>
  )
}

// ── Animated Switch Toggle ─────────────────────────────────────
function AnimatedToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className="r51-recommend-toggle-wrapper cursor-pointer"
      onClick={onToggle}
    >
      <div
        className={`r51-recommend-toggle relative w-11 h-6 rounded-full transition-colors duration-300 ${
          enabled
            ? 'bg-gradient-to-r from-violet-500 to-purple-500'
            : 'bg-muted'
        }`}
      >
        <motion.div
          className="r51-recommend-toggle-knob absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
          animate={{ left: enabled ? 22 : 2 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
        >
          {enabled ? (
            <Sparkles className="h-2.5 w-2.5 text-violet-500" />
          ) : (
            <span className="text-[7px] text-muted-foreground font-bold">AI</span>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Swipe Dismiss Card ─────────────────────────────────────────
function SwipeDismissCard({
  product,
  onDismiss,
  index,
}: {
  product: RecommendedProduct
  onDismiss: (id: string) => void
  index: number
}) {
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-200, -100, 0], [0, 0.6, 1])
  const rotateZ = useTransform(x, [-200, 0], [-8, 0])
  const dismissBgOpacity = useTransform(x, [-200, -100], [1, 0])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -120) {
      onDismiss(product.id)
    }
  }

  const gradient = GRADIENTS[index % GRADIENTS.length]
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -300, rotateZ: -12 }}
      transition={{
        type: 'spring' as const,
        stiffness: 280,
        damping: 22,
        delay: index * 0.08,
      }}
      className="r51-recommend-card-wrapper"
    >
      <div className="relative">
        {/* Dismiss background indicator */}
        <motion.div
          className="r51-recommend-dismiss-bg absolute inset-0 rounded-xl bg-red-500 flex items-center justify-center gap-2 px-4"
          style={{ opacity: dismissBgOpacity }}
        >
          <ThumbsDown className="h-5 w-5 text-white" />
          <span className="text-sm font-bold text-white">Dismiss</span>
        </motion.div>

        <motion.div
          style={{ x, opacity, rotateZ }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
          className="r51-recommend-card relative cursor-grab active:cursor-grabbing"
        >
          <Card className="overflow-hidden border-border/50 r51-recommend-card-inner">
            {/* Card Header */}
            <div className="flex items-start justify-between p-3 pb-0">
              <div className="flex items-center gap-2">
                <AIPickBadge />
                <ConfidenceRing score={product.confidence} size={32} />
              </div>
              <WhyThisButton reasoning={product.reasoning} />
            </div>

            <CardContent className="p-3">
              {/* Product Image Area */}
              <div
                className={`r51-recommend-image-area relative aspect-[16/9] rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden mb-3`}
              >
                <motion.span
                  className="text-5xl z-10"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut' as const,
                    delay: index * 0.3,
                  }}
                >
                  {product.emoji}
                </motion.span>

                {/* Discount badge */}
                {discount > 0 && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[10px] px-1.5 py-0 font-bold">
                    -{discount}%
                  </Badge>
                )}

                {/* Rating badge */}
                <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-bold">{product.rating}</span>
                </div>
              </div>

              {/* Product Info */}
              <h3 className="text-sm font-bold line-clamp-2 leading-tight">
                {product.name}
              </h3>

              <div className="flex items-center gap-1 mt-1">
                <Store className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  {product.storeName}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-base font-bold text-primary">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-[10px] text-muted-foreground line-through">
                    R$ {product.comparePrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>

              {/* Similar Taste Counter */}
              <SimilarTasteCounter count={product.similarTasteCount} />

              {/* Bottom Actions */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="r51-recommend-fav-btn h-8 gap-1 text-[10px] text-muted-foreground hover:text-rose-500 px-2"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    Salvar
                  </Button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    className="r51-recommend-cta-btn h-8 gap-1 text-[11px] font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 px-3"
                  >
                    Ver produto
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Loading Skeleton ───────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="r51-recommend-skeleton space-y-4">
      {/* Tabs skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-full">
            <Skeleton className="h-full w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-3 pb-0 flex justify-between">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <CardContent className="p-3">
              <Skeleton className="aspect-[16/9] rounded-lg mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-3 w-40 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────
function EmptyState({ onEnableAI }: { onEnableAI: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="r51-recommend-empty py-12"
    >
      <Card className="border-border/30 overflow-hidden">
        <CardContent className="p-8 text-center">
          {/* Fun Illustration */}
          <div className="r51-recommend-empty-illustration relative w-48 h-48 mx-auto mb-6">
            {/* Brain / AI illustration */}
            <motion.div
              className="r51-recommend-empty-brain absolute inset-0 flex items-center justify-center"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              <div className="relative">
                <motion.div
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-200 to-purple-200 dark:from-violet-800/40 dark:to-purple-800/40 flex items-center justify-center"
                  style={{
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)',
                  }}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                  <BrainCircuit className="h-12 w-12 text-violet-500" />
                </motion.div>

                {/* Orbiting dots */}
                <motion.div
                  className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-amber-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-cyan-400"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div
                  className="absolute top-1/2 -right-6 w-3 h-3 rounded-full bg-pink-400"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}
                />
              </div>
            </motion.div>

            {/* Floating elements */}
            <motion.div
              className="absolute top-2 left-4 text-2xl"
              animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.3 }}
            >
              🛒
            </motion.div>
            <motion.div
              className="absolute top-8 right-4 text-2xl"
              animate={{ y: [0, -6, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.8 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute bottom-4 left-8 text-2xl"
              animate={{ y: [0, -10, 0], rotate: [0, 12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.2 }}
            >
              🎯
            </motion.div>
            <motion.div
              className="absolute bottom-6 right-10 text-2xl"
              animate={{ y: [0, -7, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}
            >
              💡
            </motion.div>
          </div>

          <h3 className="text-lg font-bold mb-2 r51-recommend-empty-title">
            AI ainda está aprendendo sobre você
          </h3>
          <p className="text-sm text-muted-foreground mb-1 max-w-xs mx-auto">
            Ative as recomendações personalizadas para receber sugestões
            baseadas no seu perfil de compra.
          </p>
          <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
            Quanto mais você navega, melhores ficam as recomendações! 🚀
          </p>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onEnableAI}
              className="r51-recommend-enable-btn gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 px-6"
            >
              <Sparkles className="h-4 w-4" />
              Ativar Recomendações AI
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Category Tab Bar ───────────────────────────────────────────
function CategoryTabBar({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: CategoryTab[]
  activeTab: RecommendationCategory
  onTabChange: (key: RecommendationCategory) => void
}) {
  const tabBarRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    if (!tabBarRef.current) return
    const activeIdx = tabs.findIndex((t) => t.key === activeTab)
    if (activeIdx < 0) return

    const buttons = tabBarRef.current.querySelectorAll(
      '.r51-recommend-tab-btn'
    ) as NodeListOf<HTMLElement>
    if (!buttons[activeIdx]) return

    const btn = buttons[activeIdx]
    setIndicatorStyle({
      left: btn.offsetLeft,
      width: btn.offsetWidth,
    })
  }, [activeTab, tabs])

  return (
    <div className="r51-recommend-tab-bar relative">
      <div
        ref={tabBarRef}
        className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 r51-recommend-tab-scroll"
      >
        {tabs.map((tab) => (
          <motion.div key={tab.key} whileTap={{ scale: 0.95 }}>
            <Button
              variant={activeTab === tab.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTabChange(tab.key)}
              className={`r51-recommend-tab-btn shrink-0 h-9 gap-1.5 text-[11px] font-semibold rounded-full transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 shadow-md'
                  : 'hover:bg-violet-500/10 hover:border-violet-500/30'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ').slice(0, 2).join(' ')}</span>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Animated indicator for mobile where buttons might scroll */}
      <AnimatePresence>
        {indicatorStyle.width > 0 && (
          <motion.div
            className="r51-recommend-tab-indicator absolute bottom-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
            initial={{ opacity: 0 }}
            animate={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: 1,
            }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Stats Banner ───────────────────────────────────────────────
function StatsBanner({ totalProducts, avgConfidence }: { totalProducts: number; avgConfidence: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 24, delay: 0.15 }}
      className="r51-recommend-stats flex flex-wrap items-center gap-3"
    >
      <div className="r51-recommend-stat-chip flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1.5">
        <BrainCircuit className="h-3.5 w-3.5 text-violet-500" />
        <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
          {totalProducts} recomendações
        </span>
      </div>
      <div className="r51-recommend-stat-chip flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          {avgConfidence}% confiança média
        </span>
      </div>
      <div className="r51-recommend-stat-chip flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5">
        <Zap className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
          Atualizadas em tempo real
        </span>
      </div>
    </motion.div>
  )
}

// ── Main Component ─────────────────────────────────────────────
export function AIProductRecommender() {
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [activeTab, setActiveTab] = useState<RecommendationCategory>('viewed')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now())

  // Simulate loading
  const loadProducts = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      const mock = generateMockProducts()
      setProducts(mock)
      setIsLoading(false)
    }, 1200)
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Filter products by active tab and dismissed
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) => p.categoryKey === activeTab && !dismissedIds.has(p.id)
    )
  }, [products, activeTab, dismissedIds])

  // Stats
  const allVisible = useMemo(() => {
    return products.filter((p) => !dismissedIds.has(p.id))
  }, [products, dismissedIds])

  const avgConfidence = useMemo(() => {
    if (allVisible.length === 0) return 0
    const sum = allVisible.reduce((acc, p) => acc + p.confidence, 0)
    return Math.round(sum / allVisible.length)
  }, [allVisible])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setDismissedIds(new Set())

    setTimeout(() => {
      const mock = generateMockProducts()
      setProducts(mock)
      setLastRefreshed(Date.now())
      setIsRefreshing(false)
      toast.success('Recomendações atualizadas!', {
        description: 'Novos produtos selecionados pela IA.',
        icon: <Sparkles className="h-4 w-4 text-violet-500" />,
      })
    }, 1000)
  }, [])

  // Handle dismiss
  const handleDismiss = useCallback((id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id))
    toast('Recomendação removida', {
      description: 'Você pode restaurar atualizando as recomendações.',
      icon: <ThumbsDown className="h-4 w-4 text-muted-foreground" />,
    })
  }, [])

  // Handle enable AI
  const handleEnableAI = useCallback(() => {
    setAiEnabled(true)
    toast.success('IA ativada!', {
      description: 'As recomendações vão melhorar com o tempo.',
    })
  }, [])

  // Time since refresh
  const timeSinceRefresh = useMemo(() => {
    const diff = Math.floor((Date.now() - lastRefreshed) / 1000)
    if (diff < 60) return 'agora'
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
    return `${Math.floor(diff / 3600)}h atrás`
  }, [lastRefreshed])

  // Show empty state when AI is disabled
  if (!aiEnabled) {
    return <EmptyState onEnableAI={handleEnableAI} />
  }

  return (
    <section className="r51-recommend-section mt-6 relative overflow-hidden r62-card-lift">
      {/* Background Effects */}
      <motion.div
        className="r51-recommend-bg-orb absolute top-0 left-[10%] w-40 h-40 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        }}
        animate={{ y: [0, -20, 0], x: [0, 15, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
        aria-hidden="true"
      />
      <motion.div
        className="r51-recommend-bg-orb absolute bottom-4 right-[5%] w-32 h-32 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
        }}
        animate={{ y: [0, 15, 0], x: [0, -12, 0], scale: [1, 1.15, 1] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: 3,
        }}
        aria-hidden="true"
      />

      {/* Sparkle particles */}
      <motion.div
        className="r51-recommend-particle absolute top-4 right-8 w-1.5 h-1.5 rounded-full bg-violet-400/30 pointer-events-none"
        animate={{ y: [0, -12, -24], opacity: [0, 0.5, 0], scale: [0.4, 1, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' as const }}
        aria-hidden="true"
      />
      <motion.div
        className="r51-recommend-particle absolute top-8 left-1/4 w-1 h-1 rounded-full bg-purple-400/25 pointer-events-none"
        animate={{ y: [0, -14, -28], opacity: [0, 0.4, 0] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeOut' as const,
          delay: 0.8,
        }}
        aria-hidden="true"
      />
      <motion.div
        className="r51-recommend-particle absolute top-2 left-1/2 w-2 h-2 rounded-full bg-cyan-400/20 pointer-events-none"
        animate={{ y: [0, -10, -20], opacity: [0, 0.3, 0], scale: [0.5, 0.8, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeOut' as const,
          delay: 1.6,
        }}
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="r51-recommend-header flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="r51-recommend-header-icon h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <BrainCircuit className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 r62-heading-gradient">
              <span>Para Você</span>
              <motion.div
                className="r51-recommend-header-sparkle"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' as const }}
              >
                <Sparkles className="h-4 w-4 text-violet-500" />
              </motion.div>
            </h2>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Recomendações personalizadas pela IA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground hidden sm:block">
              IA Ativa
            </span>
            <AnimatedToggle
              enabled={aiEnabled}
              onToggle={() => {
                if (aiEnabled) {
                  setAiEnabled(false)
                  toast('IA desativada', {
                    description: 'Ative novamente para ver recomendações.',
                  })
                } else {
                  handleEnableAI()
                }
              }}
            />
          </div>

          {/* Refresh Button */}
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="r51-recommend-refresh-btn h-9 w-9 p-0 rounded-full"
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  isRefreshing
                    ? { duration: 0.8, repeat: Infinity, ease: 'linear' as const }
                    : { duration: 0.3 }
                }
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? 'text-violet-500' : 'text-muted-foreground'}`}
                />
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="r51-recommend-tabs mb-4">
        <CategoryTabBar
          tabs={CATEGORY_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Tab Description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activeTab}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          className="r51-recommend-tab-desc text-[10px] text-muted-foreground mb-3 italic flex items-center gap-1"
        >
          <Info className="h-3 w-3" />
          {CATEGORY_TABS.find((t) => t.key === activeTab)?.description}
        </motion.p>
      </AnimatePresence>

      {/* Stats Banner */}
      {!isLoading && allVisible.length > 0 && (
        <div className="r51-recommend-stats-bar mb-4">
          <StatsBanner
            totalProducts={filteredProducts.length}
            avgConfidence={avgConfidence}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && <LoadingSkeleton />}

      {/* Product Grid */}
      {!isLoading && (
        <AnimatePresence mode="popLayout">
          {filteredProducts.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="r51-recommend-no-results text-center py-10"
            >
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                <MousePointerClick className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">
                Nenhuma recomendação nesta categoria
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Tente outra categoria ou atualize as recomendações
              </p>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="r51-recommend-no-results-btn gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Atualizar recomendações
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="r51-recommend-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredProducts.map((product, idx) => (
                <SwipeDismissCard
                  key={product.id}
                  product={product}
                  onDismiss={handleDismiss}
                  index={idx}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Last Updated */}
      {!isLoading && allVisible.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="r51-recommend-footer mt-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Atualizado {timeSinceRefresh}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <ThumbsUp className="h-3 w-3 text-emerald-500" />
            <span>
              {dismissedIds.size > 0 && (
                <span className="text-amber-500">
                  {dismissedIds.size} descartada{dismissedIds.size !== 1 ? 's' : ''} •{' '}
                </span>
              )}
              Melhore navegando mais!
            </span>
          </div>
        </motion.div>
      )}

      {/* Inline styles for shimmer effect */}
      <style jsx global>{`
        .r51-recommend-ai-badge-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          animation: r51-shimmer-slide 2s ease-in-out infinite;
        }
        @keyframes r51-shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .r51-recommend-skeleton .r51-recommend-skeleton-pulse {
          animation: r51-skeleton-pulse 1.5s ease-in-out infinite;
        }
        @keyframes r51-skeleton-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .r51-recommend-cta-btn:hover {
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
        }
        .r51-recommend-card-inner:hover {
          box-shadow: 0 4px 24px rgba(139, 92, 246, 0.08);
        }
      `}</style>
    </section>
  )
}
