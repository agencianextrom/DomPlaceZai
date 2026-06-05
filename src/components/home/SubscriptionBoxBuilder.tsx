'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Star, Sparkles, Gift, Calendar, Clock, Pause, SkipForward,
  XCircle, ChevronRight, ChevronLeft, Heart, TrendingDown, Eye,
  Shuffle, Check, Plus, Minus, RotateCcw, ArrowRight, Crown,
  Box, ShoppingCart, Zap, Trophy, Share2, Users, Lock, Unlock,
  CalendarDays, CreditCard, Truck, MessageSquare, StarOff
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

interface SubTier {
  id: string
  name: string
  emoji: string
  items: number
  monthlyPrice: number
  originalPrice: number
  savings: number
  color: string
  gradient: string
  borderAccent: string
  perks: string[]
  popular?: boolean
}

interface SubItem {
  id: string
  name: string
  emoji: string
  category: ItemCategory
  price: number
  description: string
}

type ItemCategory = 'snacks' | 'beauty' | 'home' | 'tech' | 'wellness' | 'kids' | 'pets'

interface DeliveryDate {
  date: number
  day: string
  month: string
  available: boolean
  selected?: boolean
}

interface PastBox {
  id: string
  month: string
  items: string[]
  rating: number
  saved: number
  emoji: string
}

/* ═══════════════════════════════════════════════════════════════
   Constants & Mock Data
   ═══════════════════════════════════════════════════════════════ */

const SUBSCRIPTION_TIERS: SubTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    emoji: '📦',
    items: 3,
    monthlyPrice: 29.90,
    originalPrice: 55.00,
    savings: 46,
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
    borderAccent: 'border-emerald-400',
    perks: ['3 items/month', 'Free shipping', 'Cancel anytime'],
  },
  {
    id: 'standard',
    name: 'Standard',
    emoji: '🎁',
    items: 5,
    monthlyPrice: 49.90,
    originalPrice: 95.00,
    savings: 47,
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
    borderAccent: 'border-amber-400',
    perks: ['5 items/month', 'Free shipping', 'Priority support', 'Skip months'],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    emoji: '👑',
    items: 8,
    monthlyPrice: 79.90,
    originalPrice: 160.00,
    savings: 50,
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-500',
    borderAccent: 'border-violet-400',
    perks: ['8 items/month', 'Free express shipping', 'VIP support', 'Exclusive items', 'Early access'],
  },
  {
    id: 'luxury',
    name: 'Luxury',
    emoji: '💎',
    items: 12,
    monthlyPrice: 119.90,
    originalPrice: 260.00,
    savings: 54,
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-500',
    borderAccent: 'border-pink-400',
    perks: ['12 items/month', 'Free express shipping', 'Dedicated manager', 'Exclusive items', 'Custom wrapping', 'Gift notes'],
  },
]

const CATEGORIES: { id: ItemCategory; name: string; emoji: string }[] = [
  { id: 'snacks', name: 'Snacks', emoji: '🍿' },
  { id: 'beauty', name: 'Beauty', emoji: '💄' },
  { id: 'home', name: 'Home', emoji: '🏡' },
  { id: 'tech', name: 'Tech', emoji: '📱' },
  { id: 'wellness', name: 'Wellness', emoji: '🧘' },
  { id: 'kids', name: 'Kids', emoji: '🧸' },
  { id: 'pets', name: 'Pets', emoji: '🐾' },
]

const AVAILABLE_ITEMS: SubItem[] = [
  { id: 's1', name: 'Assorted Chips Mix', emoji: '🥔', category: 'snacks', price: 12.90, description: 'Curated snack variety pack' },
  { id: 's2', name: 'Organic Granola Bars', emoji: '🥣', category: 'snacks', price: 15.50, description: 'Healthy granola selection' },
  { id: 's3', name: 'Artisan Chocolate Box', emoji: '🍫', category: 'snacks', price: 22.90, description: 'Handcrafted chocolates' },
  { id: 's4', name: 'Exotic Dried Fruits', emoji: '🥭', category: 'snacks', price: 18.90, description: 'Tropical dried fruit mix' },
  { id: 's5', name: 'Gourmet Popcorn Set', emoji: '🍿', category: 'snacks', price: 14.50, description: 'Movie-night popcorn trio' },
  { id: 'b1', name: 'Sheet Mask Collection', emoji: '🧖', category: 'beauty', price: 19.90, description: 'Hydrating face masks' },
  { id: 'b2', name: 'Lip Balm Set', emoji: '💋', category: 'beauty', price: 16.50, description: 'Nourishing lip care' },
  { id: 'b3', name: 'Bath Bomb Trio', emoji: '🛁', category: 'beauty', price: 24.90, description: 'Aromatherapy bath bombs' },
  { id: 'b4', name: 'Hand Cream Deluxe', emoji: '🤲', category: 'beauty', price: 17.90, description: 'Moisturizing hand cream' },
  { id: 'b5', name: 'Nail Polish Mini Set', emoji: '💅', category: 'beauty', price: 21.90, description: 'Trendy nail colors' },
  { id: 'h1', name: 'Scented Candle Set', emoji: '🕯️', category: 'home', price: 25.90, description: 'Ambient soy candles' },
  { id: 'h2', name: 'Plant Propagation Kit', emoji: '🌿', category: 'home', price: 18.50, description: 'Mini indoor garden' },
  { id: 'h3', name: 'Coaster Collection', emoji: '🏗️', category: 'home', price: 14.90, description: 'Artisan ceramic coasters' },
  { id: 'h4', name: 'Aromatherapy Diffuser', emoji: '💨', category: 'home', price: 29.90, description: 'Essential oil diffuser' },
  { id: 't1', name: 'Phone Grip Holder', emoji: '📱', category: 'tech', price: 12.90, description: 'Trendy phone stand' },
  { id: 't2', name: 'Cable Organizer Set', emoji: '🔌', category: 'tech', price: 11.50, description: 'Neat cable management' },
  { id: 't3', name: 'LED Desk Lamp Mini', emoji: '💡', category: 'tech', price: 24.90, description: 'Compact USB lamp' },
  { id: 't4', name: 'Wireless Charger Pad', emoji: '🔋', category: 'tech', price: 28.90, description: 'Fast Qi charger' },
  { id: 'w1', name: 'Herbal Tea Sampler', emoji: '🍵', category: 'wellness', price: 16.90, description: 'Calming tea blends' },
  { id: 'w2', name: 'Yoga Strap Set', emoji: '🧘', category: 'wellness', price: 19.50, description: 'Exercise bands & strap' },
  { id: 'w3', name: 'Aromatherapy Roller', emoji: '🪷', category: 'wellness', price: 14.90, description: 'Essential oil rollers' },
  { id: 'w4', name: 'Sleep Mask Premium', emoji: '😴', category: 'wellness', price: 17.90, description: 'Silk sleep mask' },
  { id: 'k1', name: 'Sticker Book Mega', emoji: '🌟', category: 'kids', price: 11.90, description: '1000+ stickers collection' },
  { id: 'k2', name: 'Coloring Kit Deluxe', emoji: '🎨', category: 'kids', price: 15.90, description: 'Art supplies set' },
  { id: 'k3', name: 'Building Blocks Mini', emoji: '🧱', category: 'kids', price: 22.90, description: 'Creative building kit' },
  { id: 'p1', name: 'Pet Treat Variety', emoji: '🦴', category: 'pets', price: 13.90, description: 'Gourmet pet snacks' },
  { id: 'p2', name: 'Chew Toy Pack', emoji: '🎾', category: 'pets', price: 16.50, description: 'Durable pet toys' },
  { id: 'p3', name: 'Pet Grooming Kit', emoji: '🐾', category: 'pets', price: 19.90, description: 'Brush & cleaning set' },
]

const PAST_BOXES: PastBox[] = [
  { id: 'pb1', month: 'Dez 2024', items: ['Choco Box', 'Candle Set', 'Tea Sampler', 'Sticker Book', 'Pet Treats'], rating: 5, saved: 32.50, emoji: '🎄' },
  { id: 'pb2', month: 'Nov 2024', items: ['Granola Bars', 'Bath Bombs', 'Phone Grip', 'Yoga Strap', 'Chew Toy'], rating: 4, saved: 28.90, emoji: '🍂' },
  { id: 'pb3', month: 'Out 2024', items: ['Dried Fruits', 'Lip Balm', 'Plant Kit', 'LED Lamp'], rating: 5, saved: 24.50, emoji: '🎃' },
]

const DELIVERY_DATES: DeliveryDate[] = (() => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const now = new Date()
  const result: DeliveryDate[] = []
  for (let i = 1; i <= 21; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    result.push({
      date: d.getDate(),
      day: days[d.getDay()],
      month: months[d.getMonth()],
      available: d.getDay() !== 0,
    })
  }
  return result
})()

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
} as const

const tierCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
} as const

const boxLidVariants = {
  closed: { rotateX: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
  open: { rotateX: -110, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
} as const

const floatItemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1,
    y: -20 - Math.random() * 60,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
      delay: i * 0.12,
    },
  }),
  exit: { opacity: 0, y: 20, scale: 0.3, transition: { duration: 0.15 } },
} as const

const confettiParticle = {
  hidden: { opacity: 1, scale: 0 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    x: (Math.random() - 0.5) * 200,
    y: -60 - Math.random() * 120,
    rotate: Math.random() * 720,
    transition: { type: 'spring' as const, stiffness: 100, damping: 12, delay: i * 0.02 },
  }),
  exit: { opacity: 0, scale: 0, transition: { duration: 0.3 } },
} as const

const giftWrapVariants = {
  hidden: { opacity: 0, scale: 0.8, rotateY: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 360,
    transition: { type: 'spring' as const, stiffness: 150, damping: 18, duration: 1 },
  },
} as const

const savingsVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 20 },
  },
} as const

const compareHighlightVariants = {
  hidden: { opacity: 0, width: 0 },
  visible: {
    opacity: 1,
    width: '100%',
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
} as const

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 180, damping: 22 },
  },
} as const

const starVariants = {
  filled: { scale: 1.2, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } },
  empty: { scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

function getRingProgress(current: number, max: number): number {
  const circumference = 2 * Math.PI * 40
  const filled = (current / max) * circumference
  return circumference - filled
}

const CONFETTI_COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ef4444', '#84cc16']

/* ═══════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════ */

/* ── Progress Ring ── */
function ProgressRing({ current, max, color }: { current: number; max: number; color: string }) {
  const circumference = 2 * Math.PI * 40
  const progress = Math.min(current / max, 1)
  const strokeDashoffset = circumference - progress * circumference
  const percentage = Math.round(progress * 100)

  return (
    <div className="relative r54-subbox-progress-ring" style={{ width: 96, height: 96 }}>
      <svg viewBox="0 0 96 96" className="r54-subbox-svg-ring">
        <circle
          cx="48" cy="48" r="40"
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="6"
          className="r54-subbox-ring-bg"
        />
        <motion.circle
          cx="48" cy="48" r="40"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: 'spring' as const, stiffness: 120, damping: 20 }}
          className="r54-subbox-ring-fill"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center r54-subbox-ring-label">
        <motion.span
          key={current}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
          className="text-xl font-bold"
          style={{ color }}
        >
          {current}
        </motion.span>
        <span className="text-[10px] text-muted-foreground font-medium">/ {max}</span>
      </div>
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: percentage >= 100 ? [0, 0.3, 0] : 0 }}
        transition={{ duration: 1.5, repeat: percentage >= 100 ? Infinity : 0 }}
        style={{ borderRadius: '50%', boxShadow: `0 0 20px ${color}40` }}
      />
    </div>
  )
}

/* ── 3D Box Visual ── */
function Box3DVisual({ selectedItems, maxItems, isOpen, onToggleOpen }: {
  selectedItems: SubItem[]
  maxItems: number
  isOpen: boolean
  onToggleOpen: () => void
}) {
  const fillLevel = Math.min(selectedItems.length / maxItems, 1)

  return (
    <div className="relative r54-subbox-3d-container" style={{ perspective: '600px' }}>
      <div className="r54-subbox-3d-wrapper" style={{ perspective: '600px' }}>
        {/* Box body */}
        <div
          className="relative r54-subbox-3d-body"
          style={{
            width: 180,
            height: 140,
            background: `linear-gradient(135deg, #10b981${Math.round(fillLevel * 60 + 40).toString(16).padStart(2, '0')}, #059669)`,
            borderRadius: '12px',
            boxShadow: '0 12px 40px rgba(16,185,129,0.2), inset 0 2px 0 rgba(255,255,255,0.15)',
          }}
        >
          {/* Fill indicator */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 r54-subbox-fill-indicator"
            animate={{ height: `${fillLevel * 100}%` }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 25 }}
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03))',
              borderRadius: '0 0 12px 12px',
            }}
          />

          {/* Items inside box */}
          <div className="absolute inset-0 flex flex-wrap gap-1 p-3 items-center justify-center content-center">
            <AnimatePresence>
              {selectedItems.map((item, i) => (
                <motion.span
                  key={item.id}
                  custom={i}
                  variants={floatItemVariants}
                  initial="hidden"
                  animate={isOpen ? 'visible' : 'hidden'}
                  exit="exit"
                  className="text-2xl r54-subbox-box-item"
                  style={{ zIndex: 10 }}
                >
                  {item.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
            {selectedItems.length === 0 && (
              <motion.span
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl r54-subbox-empty-icon"
              >
                📦
              </motion.span>
            )}
          </div>

          {/* Box label */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <span className="text-[10px] font-bold text-white/80 r54-subbox-box-label">
              {selectedItems.length}/{maxItems} items
            </span>
          </div>
        </div>

        {/* Lid */}
        <motion.div
          variants={boxLidVariants}
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          className="absolute -top-1 left-1/2 r54-subbox-3d-lid"
          style={{
            width: 186,
            marginLeft: -93,
            height: 24,
            background: 'linear-gradient(135deg, #34d399, #10b981)',
            borderRadius: '10px 10px 4px 4px',
            boxShadow: '0 -2px 12px rgba(16,185,129,0.15)',
            transformOrigin: '50% 100%',
            zIndex: 20,
            cursor: 'pointer',
          }}
          onClick={onToggleOpen}
        >
          <div className="flex items-center justify-center h-full">
            <span className="text-[10px] font-bold text-white/70">
              {isOpen ? '▼ TAP TO CLOSE' : '▲ TAP TO OPEN'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Shadow */}
      <div
        className="r54-subbox-3d-shadow"
        style={{
          width: 140,
          height: 12,
          margin: '8px auto 0',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.12), transparent)',
        }}
      />
    </div>
  )
}

/* ── Confetti Burst ── */
function ConfettiBurst({ isActive }: { isActive: boolean }) {
  if (!isActive) return null
  return (
    <div className="absolute inset-0 pointer-events-none z-50 r54-subbox-confetti-container">
      {Array.from({ length: 35 }).map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={confettiParticle}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute r54-subbox-confetti-piece"
          style={{
            width: 6 + Math.random() * 6,
            height: 6 + Math.random() * 6,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            left: '50%',
            top: '50%',
          }}
        />
      ))}
    </div>
  )
}

/* ── Gift Wrap Animation ── */
function GiftWrapEffect({ isActive, children }: { isActive: boolean; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden r54-subbox-gift-wrap-container">
      <AnimatePresence>
        {isActive && (
          <motion.div
            variants={giftWrapVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 z-30 r54-subbox-gift-wrap-overlay"
          >
            <div className="absolute inset-0" style={{ background: 'rgba(236,72,153,0.15)' }} />
            <div className="absolute top-0 bottom-0 left-1/2 w-1" style={{ background: 'rgba(236,72,153,0.3)', transform: 'translateX(-50%)' }} />
            <div className="absolute left-0 right-0 top-1/2 h-1" style={{ background: 'rgba(236,72,153,0.3)', transform: 'translateY(-50%)' }} />
            <div className="absolute top-3 right-3">
              <Gift className="h-8 w-8 text-pink-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Component: SubscriptionBoxBuilder
   ═══════════════════════════════════════════════════════════════ */

export function SubscriptionBoxBuilder() {
  /* ── State ── */
  const [selectedTier, setSelectedTier] = useState<SubTier>(SUBSCRIPTION_TIERS[1])
  const [selectedItems, setSelectedItems] = useState<SubItem[]>([])
  const [activeCategory, setActiveCategory] = useState<ItemCategory | null>(null)
  const [isBoxOpen, setIsBoxOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<number | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'paused' | 'skipping' | 'cancelling'>('active')
  const [pastBoxRatings, setPastBoxRatings] = useState<Record<string, number>>(
    Object.fromEntries(PAST_BOXES.map((b) => [b.id, b.rating]))
  )
  const [isGiftMode, setIsGiftMode] = useState(false)
  const [giftAnimating, setGiftAnimating] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [animatedPrice, setAnimatedPrice] = useState(0)
  const [activeTab, setActiveTab] = useState<'build' | 'history' | 'compare'>('build')
  const surpriseBtnRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  /* ── Derived ── */
  const filteredItems = useMemo(() => {
    if (!activeCategory) return AVAILABLE_ITEMS
    return AVAILABLE_ITEMS.filter((item) => item.category === activeCategory)
  }, [activeCategory])

  const totalIndividualPrice = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price, 0),
    [selectedItems]
  )

  const totalSaved = useMemo(
    () => Math.max(0, totalIndividualPrice - selectedTier.monthlyPrice),
    [totalIndividualPrice, selectedTier.monthlyPrice]
  )

  const lifetimeSavings = useMemo(() => {
    return PAST_BOXES.reduce((acc, box) => acc + box.saved, 0) + totalSaved
  }, [totalSaved])

  /* ── Effects ── */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedItems([])
    setIsBoxOpen(false)
    setSelectedDeliveryDate(null)
  }, [selectedTier.id])

  useEffect(() => {
    let start = animatedPrice
    const end = selectedTier.monthlyPrice
    if (Math.abs(start - end) < 0.5) return
    const duration = 600
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedPrice(start + (end - start) * eased)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [selectedTier.monthlyPrice])

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  /* ── Handlers ── */
  const toggleItem = useCallback((item: SubItem) => {
    setSelectedItems((prev) => {
      const exists = prev.find((si) => si.id === item.id)
      if (exists) return prev.filter((si) => si.id !== item.id)
      if (prev.length >= selectedTier.items) return prev
      return [...prev, item]
    })
  }, [selectedTier.items])

  const handleSurpriseMe = useCallback(() => {
    const maxItems = selectedTier.items
    const shuffled = [...AVAILABLE_ITEMS].sort(() => Math.random() - 0.5)
    const surpriseItems = shuffled.slice(0, maxItems)
    setSelectedItems(surpriseItems)
    setShowConfetti(true)
    setIsBoxOpen(true)
  }, [selectedTier.items])

  const handleResetBox = useCallback(() => {
    setSelectedItems([])
    setIsBoxOpen(false)
  }, [])

  const handleRateBox = useCallback((boxId: string, rating: number) => {
    setPastBoxRatings((prev) => ({ ...prev, [boxId]: rating }))
  }, [])

  const handleGiftToggle = useCallback(() => {
    setIsGiftMode((prev) => !prev)
    setGiftAnimating(true)
    setTimeout(() => setGiftAnimating(false), 1200)
  }, [])

  const handlePause = useCallback(() => {
    setSubscriptionStatus((prev) => prev === 'paused' ? 'active' : 'paused')
  }, [])

  const handleSkip = useCallback(() => {
    setSubscriptionStatus('skipping')
    setTimeout(() => setSubscriptionStatus('active'), 2000)
  }, [])

  const handleCancelConfirm = useCallback(() => {
    setSubscriptionStatus('cancelling')
    setTimeout(() => setSubscriptionStatus('active'), 3000)
  }, [])

  /* ── Render ── */
  return (
    <section className="w-full r54-subbox-section" ref={containerRef}>
      <div className="bg-gradient-to-br from-emerald-50/40 via-background to-violet-50/30 rounded-2xl p-4 sm:p-6 r54-subbox-inner r62-card-lift">

        {/* ═══ Header ═══ */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
              className="r54-subbox-header-icon"
            >
              <Box className="h-5 w-5 text-emerald-500" />
            </motion.div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold r54-subbox-title r62-heading-gradient">Subscription Box</h2>
              <p className="text-xs text-muted-foreground">Build your perfect monthly box</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileTap={{ scale: 0.95 }} className="r54-subbox-savings-badge">
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <TrendingDown className="h-3 w-3" />
                Save {selectedTier.savings}%
              </div>
            </motion.div>
          </div>
        </div>

        {/* ═══ Tab Navigation ═══ */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl bg-muted/50 r54-subbox-tabs">
          {(['build', 'history', 'compare'] as const).map((tab) => (
            <motion.div
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className="relative flex-1 r54-subbox-tab"
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="r54-tab-indicator"
                  className="absolute inset-0 rounded-lg bg-card shadow-sm r54-subbox-tab-active"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground'}`}>
                {tab === 'build' && <ShoppingCart className="h-3.5 w-3.5" />}
                {tab === 'history' && <Clock className="h-3.5 w-3.5" />}
                {tab === 'compare' && <ArrowRight className="h-3.5 w-3.5" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════════════════════
              TAB: BUILD
              ═══════════════════════════════════════════════ */}
          {activeTab === 'build' && (
            <motion.div
              key="build"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* ── Tier Cards ── */}
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5 r54-subbox-section-title">
                  <Crown className="h-4 w-4 text-amber-500" />
                  Choose Your Plan
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {SUBSCRIPTION_TIERS.map((tier) => {
                    const isSelected = selectedTier.id === tier.id
                    return (
                      <motion.div
                        key={tier.id}
                        variants={tierCardVariants}
                        whileHover={{ y: -3, boxShadow: `0 8px 24px ${tier.color}25` }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedTier(tier)}
                        className={`relative cursor-pointer rounded-xl p-3 border-2 transition-all r54-subbox-tier-card ${
                          isSelected
                            ? `bg-card ${tier.borderAccent} shadow-lg`
                            : 'bg-card/50 border-border hover:border-border/80'
                        }`}
                        style={isSelected ? { boxShadow: `0 4px 16px ${tier.color}20` } : undefined}
                      >
                        {/* Popular badge */}
                        {tier.popular && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2.5 left-1/2 -translate-x-1/2 r54-subbox-popular-badge"
                          >
                            <div
                              className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white flex items-center gap-0.5"
                              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                            >
                              <Zap className="h-2.5 w-2.5" />
                              POPULAR
                            </div>
                          </motion.div>
                        )}

                        <div className="text-center">
                          <span className="text-2xl">{tier.emoji}</span>
                          <h4 className="text-sm font-bold mt-1">{tier.name}</h4>
                          <div className="mt-1">
                            <span className="text-lg font-extrabold" style={{ color: tier.color }}>
                              {formatCurrency(tier.monthlyPrice)}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">/month</span>
                          </div>
                          <div className="mt-1.5 flex items-center justify-center gap-1">
                            <span className="text-[10px] line-through text-muted-foreground">
                              {formatCurrency(tier.originalPrice)}
                            </span>
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: `${tier.color}18`, color: tier.color }}
                            >
                              -{tier.savings}%
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-col items-center gap-0.5">
                            <span className="text-[10px] font-semibold" style={{ color: tier.color }}>
                              {tier.items} items
                            </span>
                          </div>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                                className="mt-2"
                              >
                                <Check className="h-4 w-4 mx-auto" style={{ color: tier.color }} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* ── Box Builder + Item Selector ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                {/* Left: Box Preview */}
                <div className="lg:col-span-1">
                  <GiftWrapEffect isActive={giftAnimating}>
                    <div className="bg-card rounded-xl border border-border p-4 r54-subbox-preview-card">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-violet-500" />
                        Box Preview
                      </h4>
                      <div className="flex justify-center mb-4">
                        <Box3DVisual
                          selectedItems={selectedItems}
                          maxItems={selectedTier.items}
                          isOpen={isBoxOpen}
                          onToggleOpen={() => setIsBoxOpen((p) => !p)}
                        />
                      </div>
                      {/* Progress Ring */}
                      <div className="flex justify-center mb-3">
                        <ProgressRing
                          current={selectedItems.length}
                          max={selectedTier.items}
                          color={selectedTier.color}
                        />
                      </div>
                      {/* Animated price */}
                      <div className="text-center mb-3">
                        <span className="text-[10px] text-muted-foreground">Monthly price</span>
                        <motion.div
                          key={selectedTier.id}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-extrabold"
                          style={{ color: selectedTier.color }}
                        >
                          {formatCurrency(animatedPrice)}
                        </motion.div>
                      </div>
                      {/* Surprise Me + Reset buttons */}
                      <div className="flex gap-2">
                        <motion.div whileTap={{ scale: 0.93 }} className="flex-1">
                          <button
                            ref={surpriseBtnRef}
                            onClick={handleSurpriseMe}
                            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:from-violet-600 hover:to-purple-600 transition-colors r54-subbox-surprise-btn"
                          >
                            <Shuffle className="h-3.5 w-3.5" />
                            Surprise Me
                          </button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.93 }}>
                          <button
                            onClick={handleResetBox}
                            className="px-3 py-2.5 rounded-lg bg-muted text-xs font-medium hover:bg-muted/80 transition-colors flex items-center gap-1 r54-subbox-reset-btn"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      </div>
                      {/* Gift Toggle */}
                      <div className="mt-3">
                        <motion.div whileTap={{ scale: 0.97 }}>
                          <button
                            onClick={handleGiftToggle}
                            className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all r54-subbox-gift-btn ${
                              isGiftMode
                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            <Gift className="h-3.5 w-3.5" />
                            {isGiftMode ? 'Gift Mode ON' : 'Send as Gift'}
                          </button>
                        </motion.div>
                      </div>
                    </div>
                  </GiftWrapEffect>
                  {/* Confetti burst overlay */}
                  <ConfettiBurst isActive={showConfetti} />
                </div>

                {/* Right: Item Selector */}
                <div className="lg:col-span-2">
                  <div className="bg-card rounded-xl border border-border p-4 r54-subbox-selector-card">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-emerald-500" />
                      Select Your Items
                      <span className="text-[10px] font-medium text-muted-foreground ml-auto">
                        {selectedItems.length}/{selectedTier.items} selected
                      </span>
                    </h4>

                    {/* Category filters */}
                    <div className="flex gap-1.5 overflow-x-auto hide-scrollbar mb-4 -mx-1 px-1 r54-subbox-categories">
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setActiveCategory(null)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border r54-subbox-cat-btn ${
                          !activeCategory
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                        }`}
                      >
                        All
                      </motion.button>
                      {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.id
                        return (
                          <motion.button
                            key={cat.id}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => setActiveCategory(isActive ? null : cat.id)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border flex items-center gap-1 r54-subbox-cat-btn ${
                              isActive
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                            }`}
                          >
                            <span>{cat.emoji}</span>
                            {cat.name}
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* Items Grid */}
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 r54-subbox-items-grid"
                    >
                      {filteredItems.map((item) => {
                        const isSelected = selectedItems.some((si) => si.id === item.id)
                        const isFull = selectedItems.length >= selectedTier.items
                        const catData = CATEGORIES.find((c) => c.id === item.category)

                        return (
                          <motion.div
                            key={item.id}
                            variants={itemVariants}
                            layout
                            whileHover={!isFull || isSelected ? { y: -2 } : undefined}
                            whileTap={(!isFull || isSelected) ? { scale: 0.95 } : undefined}
                            onClick={() => toggleItem(item)}
                            className={`relative rounded-xl p-2.5 border-2 cursor-pointer transition-all overflow-hidden group r54-subbox-item-card ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-50/50'
                                : isFull
                                  ? 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                                  : 'border-border bg-card hover:border-primary/30'
                            }`}
                            style={isSelected ? { boxShadow: '0 2px 12px rgba(16,185,129,0.15)' } : undefined}
                          >
                            {/* Category tag */}
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-0.5">
                                {catData?.emoji} {catData?.name}
                              </span>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                                >
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                </motion.div>
                              )}
                            </div>

                            {/* Emoji + name */}
                            <div className="text-center">
                              <motion.span
                                animate={isSelected ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                className="text-3xl block mb-1"
                              >
                                {item.emoji}
                              </motion.span>
                              <h5 className="text-[11px] font-semibold line-clamp-2 leading-tight">
                                {item.name}
                              </h5>
                              <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                              <span className="text-[11px] font-bold text-primary mt-1 block">
                                {formatCurrency(item.price)}
                              </span>
                            </div>

                            {/* Add/Remove overlay */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 rounded-xl"
                                >
                                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                                    <Minus className="h-3.5 w-3.5" />
                                  </div>
                                </motion.div>
                              )}
                              {!isSelected && !isFull && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 0 }}
                                  whileHover={{ opacity: 1 }}
                                  className="absolute inset-0 flex items-center justify-center bg-primary/5 rounded-xl"
                                >
                                  <div className="w-7 h-7 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-md">
                                    <Plus className="h-3.5 w-3.5" />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })}
                    </motion.div>

                    {/* Selected items summary */}
                    <AnimatePresence>
                      {selectedItems.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="mt-4 p-3 rounded-xl border border-border bg-muted/30 r54-subbox-selected-summary"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold flex items-center gap-1">
                              <ShoppingCart className="h-3.5 w-3.5" />
                              Selected ({selectedItems.length})
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Individual total: {formatCurrency(totalIndividualPrice)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <AnimatePresence>
                              {selectedItems.map((item) => (
                                <motion.span
                                  key={item.id}
                                  variants={itemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  layout
                                  onClick={() => toggleItem(item)}
                                  className="flex items-center gap-1 px-2 py-1 min-h-[44px] rounded-full text-[10px] font-medium bg-card border border-border cursor-pointer hover:border-red-300 transition-colors r54-subbox-selected-chip"
                                >
                                  {item.emoji} {item.name}
                                  <XCircle className="h-2.5 w-2.5 text-muted-foreground" />
                                </motion.span>
                              ))}
                            </AnimatePresence>
                          </div>
                          {/* Savings callout */}
                          {totalSaved > 0 && (
                            <motion.div
                              variants={savingsVariants}
                              initial="hidden"
                              animate="visible"
                              className="mt-2 flex items-center gap-1.5 text-emerald-600"
                            >
                              <TrendingDown className="h-3.5 w-3.5" />
                              <span className="text-xs font-bold">
                                You save {formatCurrency(totalSaved)} vs individual purchases!
                              </span>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* ── Delivery Calendar ── */}
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5 r54-subbox-section-title">
                  <CalendarDays className="h-4 w-4 text-blue-500" />
                  Delivery Schedule
                </h3>
                <div className="bg-card rounded-xl border border-border p-4 r54-subbox-calendar-card">
                  <div className="flex gap-1.5 overflow-x-auto hide-scrollbar -mx-2 px-2 pb-2 r54-subbox-calendar-scroll">
                    {DELIVERY_DATES.map((day, idx) => (
                      <motion.button
                        key={idx}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => day.available && setSelectedDeliveryDate(day.date)}
                        disabled={!day.available}
                        className={`shrink-0 w-14 py-2 rounded-xl text-center transition-all border r54-subbox-calendar-day ${
                          selectedDeliveryDate === day.date
                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                            : day.available
                              ? 'bg-card border-border hover:border-primary/30'
                              : 'bg-muted/30 border-border/50 opacity-40 cursor-not-allowed'
                        }`}
                        style={selectedDeliveryDate === day.date ? { boxShadow: '0 2px 8px rgba(16,185,129,0.3)' } : undefined}
                      >
                        <span className="block text-[9px] font-medium">{day.day}</span>
                        <span className={`block text-lg font-bold ${selectedDeliveryDate === day.date ? '' : ''}`}>
                          {day.date}
                        </span>
                        <span className="block text-[9px] font-medium">{day.month}</span>
                      </motion.button>
                    ))}
                  </div>
                  {selectedDeliveryDate && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs text-center text-primary font-medium flex items-center justify-center gap-1"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      Delivery scheduled for the {selectedDeliveryDate}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* ── Subscription Controls ── */}
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5 r54-subbox-section-title">
                  <CreditCard className="h-4 w-4 text-violet-500" />
                  Manage Subscription
                </h3>
                <div className="bg-card rounded-xl border border-border p-4 r54-subbox-controls-card">
                  {/* Status indicator */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2.5 h-2.5 rounded-full r54-subbox-status-dot ${
                      subscriptionStatus === 'active'
                        ? 'bg-emerald-500'
                        : subscriptionStatus === 'paused'
                          ? 'bg-amber-500'
                          : subscriptionStatus === 'skipping'
                            ? 'bg-blue-500'
                            : 'bg-red-500'
                    }`}
                      style={subscriptionStatus === 'active' ? { boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' } : undefined}
                    />
                    <span className="text-xs font-semibold capitalize">
                      {subscriptionStatus === 'cancelling' ? 'Cancellation in progress...' : subscriptionStatus}
                    </span>
                    {subscriptionStatus === 'active' && (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[9px] text-emerald-600 font-medium"
                      >
                        Next box ships soon
                      </motion.span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Pause/Resume */}
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <button
                        onClick={handlePause}
                        className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border r54-subbox-ctrl-btn ${
                          subscriptionStatus === 'paused'
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-card text-muted-foreground border-border hover:border-amber-300'
                        }`}
                      >
                        {subscriptionStatus === 'paused' ? (
                          <Unlock className="h-3.5 w-3.5" />
                        ) : (
                          <Pause className="h-3.5 w-3.5" />
                        )}
                        {subscriptionStatus === 'paused' ? 'Resume' : 'Pause'}
                      </button>
                    </motion.div>

                    {/* Skip */}
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <button
                        onClick={handleSkip}
                        disabled={subscriptionStatus !== 'active'}
                        className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border r54-subbox-ctrl-btn ${
                          subscriptionStatus === 'skipping'
                            ? 'bg-blue-500 text-white border-blue-500'
                            : subscriptionStatus === 'active'
                              ? 'bg-card text-muted-foreground border-border hover:border-blue-300'
                              : 'bg-muted/30 border-border/50 text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        <SkipForward className="h-3.5 w-3.5" />
                        {subscriptionStatus === 'skipping' ? 'Skipping...' : 'Skip Month'}
                      </button>
                    </motion.div>

                    {/* Cancel */}
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <button
                        onClick={handleCancelConfirm}
                        disabled={subscriptionStatus !== 'active'}
                        className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border r54-subbox-ctrl-btn ${
                          subscriptionStatus === 'cancelling'
                            ? 'bg-red-500 text-white border-red-500'
                            : subscriptionStatus === 'active'
                              ? 'bg-card text-muted-foreground border-border hover:border-red-300'
                              : 'bg-muted/30 border-border/50 text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {subscriptionStatus === 'cancelling' ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </motion.div>
                  </div>

                  {/* Gift mode banner */}
                  <AnimatePresence>
                    {isGiftMode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="p-3 rounded-lg border border-pink-200 bg-pink-50/50 r54-subbox-gift-banner">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-pink-500" />
                            <span className="text-xs font-bold text-pink-700">Gift Subscription Active</span>
                          </div>
                          <p className="text-[10px] text-pink-600/80 mt-1">
                            This box will be beautifully wrapped and sent with a personalized note. Perfect for birthdays & special occasions!
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Recipient's name..."
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/80 border border-pink-200 text-xs placeholder:text-pink-300 focus:outline-none focus:border-pink-400 r54-subbox-gift-input"
                            />
                            <input
                              type="text"
                              placeholder="Add a message..."
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/80 border border-pink-200 text-xs placeholder:text-pink-300 focus:outline-none focus:border-pink-400 r54-subbox-gift-input"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Savings Tracker ── */}
              <div>
                <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5 r54-subbox-section-title">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Savings Tracker
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Lifetime savings */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-card rounded-xl border border-border p-4 r54-subbox-savings-card"
                    style={{ boxShadow: '0 2px 8px rgba(16,185,129,0.06)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                      >
                        <TrendingDown className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">Lifetime Savings</span>
                    </div>
                    <motion.span
                      key={lifetimeSavings}
                      initial={{ scale: 1.15 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-extrabold text-emerald-600"
                    >
                      {formatCurrency(lifetimeSavings)}
                    </motion.span>
                    <p className="text-[10px] text-muted-foreground mt-1">vs buying individually</p>
                  </motion.div>

                  {/* Current month savings */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-card rounded-xl border border-border p-4 r54-subbox-savings-card"
                    style={{ boxShadow: '0 2px 8px rgba(245,158,11,0.06)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                      >
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">This Month</span>
                    </div>
                    <span className="text-2xl font-extrabold text-amber-600">
                      {formatCurrency(totalSaved)}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {totalIndividualPrice > 0 ? `${Math.round((totalSaved / totalIndividualPrice) * 100)}% off` : 'Add items to see savings'}
                    </p>
                  </motion.div>

                  {/* Boxes received */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-card rounded-xl border border-border p-4 r54-subbox-savings-card"
                    style={{ boxShadow: '0 2px 8px rgba(139,92,246,0.06)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                      >
                        <Package className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">Boxes Received</span>
                    </div>
                    <span className="text-2xl font-extrabold text-violet-600">{PAST_BOXES.length}</span>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Average rating: {(PAST_BOXES.reduce((a, b) => a + b.rating, 0) / PAST_BOXES.length).toFixed(1)} ★
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════
              TAB: HISTORY
              ═══════════════════════════════════════════════ */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5 r54-subbox-section-title">
                <Clock className="h-4 w-4 text-blue-500" />
                Past Boxes
              </h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {PAST_BOXES.map((box, idx) => (
                    <motion.div
                      key={box.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 25, delay: idx * 0.08 }}
                      className="bg-card rounded-xl border border-border p-4 r54-subbox-history-card"
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Box emoji */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))' }}
                        >
                          {box.emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header row */}
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-bold">{box.month}</h4>
                            <div
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}
                            >
                              Saved {formatCurrency(box.saved)}
                            </div>
                          </div>

                          {/* Items list */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {box.items.map((item, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                              >
                                {item}
                              </span>
                            ))}
                          </div>

                          {/* Star rating */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-muted-foreground">Rate this box:</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const isFilled = star <= (pastBoxRatings[box.id] || 0)
                                return (
                                  <motion.button
                                    key={star}
                                    variants={starVariants}
                                    animate={isFilled ? 'filled' : 'empty'}
                                    whileTap={{ scale: 0.8 }}
                                    onClick={() => handleRateBox(box.id, star)}
                                    className="r54-subbox-star-btn"
                                  >
                                    {isFilled ? (
                                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                    ) : (
                                      <StarOff className="h-4 w-4 text-muted-foreground/40" />
                                    )}
                                  </motion.button>
                                )
                              })}
                            </div>
                            {(pastBoxRatings[box.id] || 0) > 0 && (
                              <span className="text-[10px] font-bold text-amber-600">
                                {pastBoxRatings[box.id]}.0
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════
              TAB: COMPARE
              ═══════════════════════════════════════════════ */}
          {activeTab === 'compare' && (
            <motion.div
              key="compare"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5 r54-subbox-section-title">
                <ArrowRight className="h-4 w-4 text-violet-500" />
                Compare Plans
              </h3>
              <div className="overflow-x-auto -mx-4 px-4 r54-subbox-compare-scroll">
                <table className="w-full min-w-[500px] r54-subbox-compare-table">
                  <thead>
                    <tr className="r54-subbox-compare-header">
                      <th className="text-left text-[10px] font-bold text-muted-foreground pb-3 pr-3">Feature</th>
                      {SUBSCRIPTION_TIERS.map((tier) => (
                        <th key={tier.id} className="text-center pb-3 px-2">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`inline-flex flex-col items-center gap-0.5 p-2 rounded-xl ${
                              selectedTier.id === tier.id ? 'bg-card shadow-md' : ''
                            }`}
                            style={selectedTier.id === tier.id ? { boxShadow: `0 2px 12px ${tier.color}20` } : undefined}
                          >
                            <span className="text-xl">{tier.emoji}</span>
                            <span className="text-[11px] font-bold" style={{ color: tier.color }}>{tier.name}</span>
                            <span className="text-sm font-extrabold">{formatCurrency(tier.monthlyPrice)}</span>
                          </motion.div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Items row */}
                    <tr className="border-t border-border/50">
                      <td className="text-[11px] font-medium py-2.5 pr-3 text-muted-foreground">Items / month</td>
                      {SUBSCRIPTION_TIERS.map((tier) => (
                        <td key={tier.id} className="text-center py-2.5 px-2">
                          <motion.div
                            variants={compareHighlightVariants}
                            initial="hidden"
                            animate="visible"
                            className="inline-block"
                          >
                            <span className="text-sm font-bold" style={{ color: tier.color }}>{tier.items}</span>
                          </motion.div>
                        </td>
                      ))}
                    </tr>

                    {/* Savings row */}
                    <tr className="border-t border-border/50">
                      <td className="text-[11px] font-medium py-2.5 pr-3 text-muted-foreground">Savings</td>
                      {SUBSCRIPTION_TIERS.map((tier) => (
                        <td key={tier.id} className="text-center py-2.5 px-2">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${tier.color}15`, color: tier.color }}
                          >
                            {tier.savings}% off
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Perks rows */}
                    {['Free shipping', 'Priority support', 'Exclusive items', 'Custom wrapping', 'Dedicated manager', 'Early access'].map((feature, idx) => (
                      <tr key={feature} className={`border-t border-border/50 ${idx % 2 === 0 ? 'bg-muted/20' : ''}`}>
                        <td className="text-[11px] font-medium py-2 pr-3 text-muted-foreground">{feature}</td>
                        {SUBSCRIPTION_TIERS.map((tier) => {
                          const hasFeature = tier.perks.some((p) => p.toLowerCase().includes(feature.toLowerCase()))
                          return (
                            <td key={tier.id} className="text-center py-2 px-2">
                              {hasFeature ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                                >
                                  <Check className="h-4 w-4 mx-auto" style={{ color: tier.color }} />
                                </motion.div>
                              ) : (
                                <span className="text-muted-foreground/30 text-xs">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}

                    {/* Cancel anytime */}
                    <tr className="border-t border-border/50">
                      <td className="text-[11px] font-medium py-2.5 pr-3 text-muted-foreground">Cancel anytime</td>
                      {SUBSCRIPTION_TIERS.map((tier) => (
                        <td key={tier.id} className="text-center py-2.5 px-2">
                          <Check className="h-4 w-4 mx-auto text-emerald-500" />
                        </td>
                      ))}
                    </tr>

                    {/* CTA row */}
                    <tr className="border-t border-border/50">
                      <td className="py-3 pr-3" />
                      {SUBSCRIPTION_TIERS.map((tier) => (
                        <td key={tier.id} className="text-center py-3 px-2">
                          <motion.div whileTap={{ scale: 0.95 }}>
                            <button
                              onClick={() => { setSelectedTier(tier); setActiveTab('build') }}
                              className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all r54-subbox-compare-cta ${
                                selectedTier.id === tier.id
                                  ? 'text-white shadow-md'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                              style={selectedTier.id === tier.id ? {
                                background: `linear-gradient(135deg, ${tier.color}, ${tier.color}dd)`,
                                boxShadow: `0 2px 8px ${tier.color}30`
                              } : undefined}
                            >
                              {selectedTier.id === tier.id ? '✓ Selected' : 'Select'}
                            </button>
                          </motion.div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Floating action: Subscribe CTA ── */}
        <div className="mt-6">
          <motion.div
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(16,185,129,0.25)' }}
            whileTap={{ scale: 0.97 }}
            className="relative overflow-hidden"
          >
            <button
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-all r54-subbox-cta-btn"
            >
              <ShoppingCart className="h-4 w-4" />
              {isGiftMode ? 'Subscribe & Gift' : 'Subscribe Now'}
              <span className="text-xs font-medium opacity-80">— {formatCurrency(selectedTier.monthlyPrice)}/mo</span>
            </button>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 r54-subbox-cta-shimmer" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
