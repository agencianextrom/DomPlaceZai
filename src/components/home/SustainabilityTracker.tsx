'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Leaf,
  TreePine,
  TrendingUp,
  Award,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Star,
  Zap,
  Droplets,
  Globe,
  Recycle,
  ShoppingCart,
  Lightbulb,
  Trophy,
  Target,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface EcoScoreData {
  score: number
  lastUpdated: string
}

interface CarbonData {
  monthlyKg: number
  weeklyData: number[]
}

interface AchievementBadge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedDate: string | null
  progress: number
  maxProgress: number
  category: string
}

interface GreenPurchase {
  id: string
  productName: string
  store: string
  co2Saved: number
  category: string
  date: string
  ecoLabel: string
}

interface EcoChallenge {
  id: string
  title: string
  description: string
  progress: number
  target: number
  reward: string
  expiresAt: string
}

interface CategoryBreakdown {
  category: string
  ecoScore: number
  totalItems: number
  icon: string
  color: string
  barColor: string
}

interface StoreEcoRating {
  storeName: string
  ecoRating: number
  totalEcoProducts: number
  logo: string
}

interface GreenAlternative {
  originalItem: string
  ecoAlternative: string
  co2Savings: string
  ecoStore: string
  rating: number
}

interface SustainabilityTip {
  id: string
  emoji: string
  title: string
  text: string
}

interface EcoLevel {
  name: string
  icon: string
  minScore: number
  maxScore: number
  color: string
  glowColor: string
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS & MOCK DATA
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'domplace-sustainability-tracker'

const ECO_LEVELS: EcoLevel[] = [
  { name: 'Seedling', icon: '🌱', minScore: 0, maxScore: 20, color: '#86efac', glowColor: 'rgba(134,239,172,0.3)' },
  { name: 'Sprout', icon: '🌿', minScore: 20, maxScore: 40, color: '#4ade80', glowColor: 'rgba(74,222,128,0.3)' },
  { name: 'Tree', icon: '🌳', minScore: 40, maxScore: 60, color: '#22c55e', glowColor: 'rgba(34,197,94,0.35)' },
  { name: 'Forest', icon: '🌲', minScore: 60, maxScore: 80, color: '#16a34a', glowColor: 'rgba(22,163,74,0.4)' },
  { name: 'Ecosystem', icon: '🌍', minScore: 80, maxScore: 100, color: '#15803d', glowColor: 'rgba(21,128,61,0.45)' },
]

const MOCK_CARBON_DATA: CarbonData = {
  monthlyKg: 23.7,
  weeklyData: [3.2, 5.1, 4.8, 6.3, 5.9, 4.2, 6.1],
}

const MOCK_ACHIEVEMENTS: AchievementBadge[] = [
  { id: 'first-green', name: 'First Green Purchase', description: 'Complete your first eco-friendly purchase', icon: '🍃', unlocked: true, unlockedDate: '2025-04-12', progress: 1, maxProgress: 1, category: 'milestone' },
  { id: 'ten-eco', name: '10 Eco Items', description: 'Buy 10 eco-friendly products', icon: '♻️', unlocked: true, unlockedDate: '2025-05-08', progress: 10, maxProgress: 10, category: 'shopping' },
  { id: 'carbon-neutral', name: 'Carbon Neutral Month', description: 'Save 50kg CO2 in a single month', icon: '🌍', unlocked: false, unlockedDate: null, progress: 23, maxProgress: 50, category: 'carbon' },
  { id: 'zero-waste', name: 'Zero Waste Week', description: '7 days of zero-waste shopping', icon: '📦', unlocked: false, unlockedDate: null, progress: 3, maxProgress: 7, category: 'waste' },
  { id: 'local-hero', name: 'Local Hero', description: 'Buy 20 products from local producers', icon: '🏪', unlocked: false, unlockedDate: null, progress: 12, maxProgress: 20, category: 'local' },
]

const MOCK_PURCHASES: GreenPurchase[] = [
  { id: 'p1', productName: 'Organic Avocados (6 pack)', store: 'Green Valley Farm', co2Saved: 1.8, category: 'Groceries', date: '2025-06-20', ecoLabel: 'Organic Certified' },
  { id: 'p2', productName: 'Bamboo Toothbrush Set', store: 'EcoLife Store', co2Saved: 0.4, category: 'Personal Care', date: '2025-06-18', ecoLabel: 'Zero Plastic' },
  { id: 'p3', productName: 'Refillable Cleaning Spray', store: 'Clean Planet', co2Saved: 0.9, category: 'Household', date: '2025-06-15', ecoLabel: 'Refillable' },
  { id: 'p4', productName: 'Local Honey 500g', store: 'BeeKind Farm', co2Saved: 1.2, category: 'Groceries', date: '2025-06-12', ecoLabel: 'Local (<50km)' },
  { id: 'p5', productName: 'Recycled Toilet Paper (12pk)', store: 'EcoLife Store', co2Saved: 2.1, category: 'Household', date: '2025-06-10', ecoLabel: '100% Recycled' },
  { id: 'p6', productName: 'Natural Shampoo Bar', store: 'Bare Necessities', co2Saved: 0.6, category: 'Personal Care', date: '2025-06-08', ecoLabel: 'Plastic-Free' },
]

const MOCK_CHALLENGES: EcoChallenge[] = [
  { id: 'c1', title: 'Buy 3 Local Products', description: 'Support local farmers by purchasing at least 3 locally-sourced items this week.', progress: 1, target: 3, reward: '+30 eco points', expiresAt: '2025-06-28' },
  { id: 'c2', title: 'Zero Plastic Week', description: 'Avoid all single-use plastic packaging for 7 consecutive days.', progress: 3, target: 7, reward: 'Zero Waste badge', expiresAt: '2025-07-05' },
  { id: 'c3', title: 'Plant-Based Meals', description: 'Choose plant-based alternatives for at least 5 meals this week.', progress: 2, target: 5, reward: '+20 eco points', expiresAt: '2025-06-28' },
]

const MOCK_CATEGORIES: CategoryBreakdown[] = [
  { category: 'Groceries', ecoScore: 78, totalItems: 24, icon: '🥬', color: '#22c55e', barColor: 'from-green-400 to-green-500' },
  { category: 'Household', ecoScore: 62, totalItems: 15, icon: '🧹', color: '#14b8a6', barColor: 'from-teal-400 to-teal-500' },
  { category: 'Personal Care', ecoScore: 85, totalItems: 12, icon: '🧴', color: '#06b6d4', barColor: 'from-cyan-400 to-cyan-500' },
  { category: 'Beverages', ecoScore: 45, totalItems: 8, icon: '🍵', color: '#f59e0b', barColor: 'from-amber-400 to-amber-500' },
]

const MOCK_STORE_RATINGS: StoreEcoRating[] = [
  { storeName: 'Green Valley Farm', ecoRating: 96, totalEcoProducts: 145, logo: '🌿' },
  { storeName: 'EcoLife Store', ecoRating: 91, totalEcoProducts: 230, logo: '♻️' },
  { storeName: 'BeeKind Farm', ecoRating: 88, totalEcoProducts: 67, logo: '🐝' },
  { storeName: 'Clean Planet', ecoRating: 82, totalEcoProducts: 98, logo: '🧹' },
  { storeName: 'Bare Necessities', ecoRating: 79, totalEcoProducts: 56, logo: '🍃' },
]

const MOCK_ALTERNATIVES: GreenAlternative[] = [
  { originalItem: 'Regular Shampoo Bottle', ecoAlternative: 'Solid Shampoo Bar', co2Savings: '-0.8kg', ecoStore: 'Bare Necessities', rating: 4.8 },
  { originalItem: 'Plastic Sponges (3pk)', ecoAlternative: 'Loofah Sponge Set', co2Savings: '-0.3kg', ecoStore: 'EcoLife Store', rating: 4.6 },
  { originalItem: 'Paper Towels (6 rolls)', ecoAlternative: 'Reusable Bamboo Towels', co2Savings: '-1.2kg', ecoStore: 'Clean Planet', rating: 4.7 },
  { originalItem: 'Bottled Water (12pk)', ecoAlternative: 'Tap Filter + Glass Bottle', co2Savings: '-2.5kg', ecoStore: 'EcoLife Store', rating: 4.9 },
]

const MOCK_TIPS: SustainabilityTip[] = [
  { id: 't1', emoji: '🛒', title: 'Shop Local', text: 'Buying from local producers within 50km can reduce food transport emissions by up to 65%.' },
  { id: 't2', emoji: '📦', title: 'Bulk Buying', text: 'Purchasing in bulk reduces packaging waste by an average of 40% per product.' },
  { id: 't3', emoji: '🌱', title: 'Seasonal Eating', text: 'Seasonal produce requires fewer greenhouse interventions, saving up to 30% energy.' },
  { id: 't4', emoji: '♻️', title: 'Refill Stations', text: 'Refilling containers instead of buying new ones can save 1.5kg CO2 per trip.' },
  { id: 't5', emoji: '🚲', title: 'Pickup Over Delivery', text: 'Walking or cycling to pick up orders saves an average of 2.3kg CO2 vs delivery.' },
  { id: 't6', emoji: '🏷️', title: 'Read Eco Labels', text: 'Certified organic products reduce pesticide use by 95% compared to conventional farming.' },
]

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function getScoreColor(score: number): string {
  if (score < 33) return '#ef4444'
  if (score < 66) return '#f59e0b'
  return '#22c55e'
}

function getScoreGradient(score: number): string {
  if (score < 33) return 'from-red-500 to-red-400'
  if (score < 66) return 'from-amber-500 to-amber-400'
  return 'from-green-500 to-green-400'
}

function getEcoLevel(score: number): EcoLevel {
  return ECO_LEVELS.reduce<EcoLevel>((acc, level) => {
    return score >= level.minScore ? level : acc
  }, ECO_LEVELS[0])
}

function getTreesFromCO2(kg: number): number {
  return Math.round(kg / 21.77 * 10) / 10
}

function getKmFromCO2(kg: number): number {
  return Math.round(kg / 0.21 * 10) / 10
}

function getHoursFromCO2(kg: number): number {
  return Math.round(kg / 0.1 * 10) / 10
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER HOOK
   ═══════════════════════════════════════════════════════════════ */

function useAnimatedCounter(target: number, duration = 1400, enabled = true): number {
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!enabled || hasAnimated.current) return
    hasAnimated.current = true
    let start = 0
    const isDecimal = target % 1 !== 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(isDecimal ? parseFloat(start.toFixed(1)) : Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, enabled])

  return count
}

/* ═══════════════════════════════════════════════════════════════
   LOCAL STORAGE PERSISTENCE
   ═══════════════════════════════════════════════════════════════ */

interface TrackerState {
  ecoScore: EcoScoreData
  carbonData: CarbonData
  achievements: AchievementBadge[]
  tipsSeen: string[]
  completedChallenges: string[]
  mounted: boolean
}

function loadState(): TrackerState {
  if (typeof window === 'undefined') {
    return {
      ecoScore: { score: 62, lastUpdated: new Date().toISOString() },
      carbonData: MOCK_CARBON_DATA,
      achievements: MOCK_ACHIEVEMENTS,
      tipsSeen: [],
      completedChallenges: [],
      mounted: false,
    }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<TrackerState>
      return {
        ecoScore: parsed.ecoScore || { score: 62, lastUpdated: new Date().toISOString() },
        carbonData: parsed.carbonData || MOCK_CARBON_DATA,
        achievements: parsed.achievements || MOCK_ACHIEVEMENTS,
        tipsSeen: parsed.tipsSeen || [],
        completedChallenges: parsed.completedChallenges || [],
        mounted: false,
      }
    }
  } catch {
    // ignore parse errors
  }
  return {
    ecoScore: { score: 62, lastUpdated: new Date().toISOString() },
    carbonData: MOCK_CARBON_DATA,
    achievements: MOCK_ACHIEVEMENTS,
    tipsSeen: [],
    completedChallenges: [],
    mounted: false,
  }
}

function saveState(state: TrackerState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

/* ═══════════════════════════════════════════════════════════════
   VARIANTS (full objects, no as const on variant objects)
   ═══════════════════════════════════════════════════════════════ */

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

const badgeUnlockVariants: Variants = {
  hidden: { opacity: 0, scale: 0.4, rotate: -30 },
  visible: { opacity: 1, scale: 1, rotate: 0 },
}

const fadeSlideVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

const pulseGlowVariants: Variants = {
  resting: { boxShadow: '0 0 0 0 rgba(34,197,94,0)' },
  glowing: { boxShadow: '0 0 24px 4px rgba(34,197,94,0.35)' },
}

const confettiParticleVariants: Variants = {
  hidden: { opacity: 1, y: 0, scale: 1, rotate: 0 },
  visible: {
    opacity: 0,
    y: [0, -60, 80],
    scale: [1, 1.3, 0.3],
    rotate: [0, 180, 720],
  },
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ─── Eco Score Circular Gauge ─── */
function EcoScoreGauge({ score }: { score: number }) {
  const animatedScore = useAnimatedCounter(score, 1800)
  const level = getEcoLevel(score)
  const size = 180
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const scoreColor = getScoreColor(score)

  return (
    <div className="r57-gauge-wrapper flex flex-col items-center gap-3">
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 120, damping: 14 }}
      >
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.15)"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring' as const, stiffness: 80, damping: 14, delay: 0.3 }}
          />
          {/* Glow effect */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth + 4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference, opacity: 0.3 }}
            animate={{ strokeDashoffset, opacity: [0.15, 0.3, 0.15] }}
            transition={{
              strokeDashoffset: { type: 'spring' as const, stiffness: 80, damping: 14, delay: 0.3 },
              opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ filter: `drop-shadow(0 0 8px ${scoreColor})` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={Math.round(animatedScore)}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 18 }}
            className="text-3xl font-extrabold tabular-nums"
            style={{ color: scoreColor }}
          >
            {animatedScore}
          </motion.span>
          <span className="text-[9px] font-semibold text-muted-foreground">Eco Score</span>
        </div>
      </motion.div>

      {/* Level badge */}
      <motion.div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
        style={{
          borderColor: `${level.color}40`,
          backgroundColor: `${level.color}15`,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-base">{level.icon}</span>
        <span className="text-xs font-bold" style={{ color: level.color }}>
          {level.name}
        </span>
      </motion.div>
    </div>
  )
}

/* ─── Equivalent Visual Comparisons ─── */
function EquivalentComparisons({ kg }: { kg: number }) {
  const trees = useAnimatedCounter(getTreesFromCO2(kg), 1200)
  const km = useAnimatedCounter(getKmFromCO2(kg), 1200)
  const hours = useAnimatedCounter(getHoursFromCO2(kg), 1200)

  const comparisons = [
    { emoji: '🌳', value: trees, unit: '', label: 'trees planted', color: '#22c55e' },
    { emoji: '🚗', value: km, unit: 'km', label: 'not driven', color: '#3b82f6' },
    { emoji: '💡', value: hours, unit: 'h', label: 'of light', color: '#f59e0b' },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {comparisons.map((item, i) => (
        <motion.div
          key={item.label}
          className="r57-comparison-card flex flex-col items-center gap-1 p-2.5 rounded-xl border border-border bg-secondary/20"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: 0.2 + i * 0.08 }}
        >
          <span className="text-xl">{item.emoji}</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-lg font-extrabold tabular-nums" style={{ color: item.color }}>
              {item.value}
            </span>
            <span className="text-[9px] font-medium text-muted-foreground">{item.unit}</span>
          </div>
          <span className="text-[8px] text-muted-foreground text-center leading-tight">{item.label}</span>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── Green Purchase Timeline ─── */
function GreenPurchaseTimeline({ purchases }: { purchases: GreenPurchase[] }) {
  return (
    <div className="space-y-2">
      {purchases.map((purchase, i) => (
        <motion.div
          key={purchase.id}
          className="r57-timeline-item flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-secondary/20 transition-colors"
          variants={fadeSlideVariants}
          initial="hidden"
          animate="visible"
          transition={{ type: 'spring' as const, stiffness: 160, damping: 18, delay: i * 0.06 }}
        >
          {/* Leaf icon with green dot */}
          <div className="flex flex-col items-center gap-0.5 mt-0.5">
            <motion.div
              className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500/10 border border-green-500/20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            >
              <Leaf className="h-4 w-4 text-green-500" />
            </motion.div>
            {i < purchases.length - 1 && (
              <div className="w-px h-6 bg-border" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold line-clamp-1">{purchase.productName}</p>
              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                -{purchase.co2Saved}kg
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-muted-foreground">{purchase.store}</span>
              <span className="text-[9px] text-muted-foreground">·</span>
              <span className="text-[9px] text-muted-foreground">{purchase.date}</span>
            </div>
            <span className="inline-block mt-1 px-1.5 py-0.5 text-[8px] font-bold rounded-md bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/15">
              {purchase.ecoLabel}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── Achievement Badge Card ─── */
function AchievementBadgeCard({ badge, index }: { badge: AchievementBadge; index: number }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiTriggered = useRef(false)

  useEffect(() => {
    if (badge.unlocked && !confettiTriggered.current) {
      confettiTriggered.current = true
      const timer = setTimeout(() => setShowConfetti(true), index * 200 + 400)
      return () => clearTimeout(timer)
    }
  }, [badge.unlocked, index])

  const confettiParticles = useMemo(() => {
    if (!showConfetti) return []
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40,
      color: ['#fbbf24', '#f59e0b', '#22c55e', '#14b8a6', '#06b6d4', '#ec4899'][i % 6],
      delay: Math.random() * 0.3,
      size: 3 + Math.random() * 4,
      drift: (Math.random() - 0.5) * 50,
    }))
  }, [showConfetti])

  return (
    <motion.div
      className="r57-badge-card relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors overflow-hidden"
      style={{
        borderColor: badge.unlocked ? 'rgba(34,197,94,0.25)' : undefined,
        backgroundColor: badge.unlocked ? 'rgba(34,197,94,0.06)' : undefined,
      }}
      variants={badgeUnlockVariants}
      initial="hidden"
      animate="visible"
      transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: 0.1 + index * 0.1 }}
    >
      {/* Confetti on unlock */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {confettiParticles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-sm"
                style={{
                  width: p.size,
                  height: p.size * 0.6,
                  backgroundColor: p.color,
                  left: `${p.x}%`,
                  top: '35%',
                }}
                variants={confettiParticleVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, delay: p.delay, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Golden glow for unlocked */}
      {badge.unlocked && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={showConfetti ? 'glowing' : 'resting'}
          variants={pulseGlowVariants}
          transition={{ duration: 0.8 }}
        />
      )}

      {/* Shimmer overlay */}
      {badge.unlocked && (
        <motion.div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
          />
        </motion.div>
      )}

      <div className={`relative text-2xl ${!badge.unlocked ? 'grayscale opacity-50' : ''}`}>
        {badge.unlocked ? badge.icon : <Lock className="h-6 w-6 text-muted-foreground" />}
      </div>
      <span className={`relative text-[9px] font-bold text-center leading-tight ${
        badge.unlocked ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'
      }`}>
        {badge.name}
      </span>

      {/* Progress bar for locked badges */}
      {!badge.unlocked && badge.progress > 0 && (
        <div className="relative w-full h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-amber-500/60"
            initial={{ width: '0%' }}
            animate={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
          />
        </div>
      )}
    </motion.div>
  )
}

/* ─── Weekly Bar Chart ─── */
function WeeklyBarChart({ data }: { data: number[] }) {
  const maxVal = Math.max(...data, 1)

  return (
    <div className="r57-bar-chart">
      <svg viewBox="0 0 320 160" className="w-full" role="img" aria-label="Weekly CO2 savings chart">
        <defs>
          <linearGradient id="r57-barGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="r57-barHighlight" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((line) => (
          <line
            key={line}
            x1="36" y1={130 - 100 * line}
            x2="308" y2={130 - 100 * line}
            stroke="rgba(148,163,184,0.12)"
            strokeWidth="0.5"
          />
        ))}

        {/* Bars */}
        {data.map((val, i) => {
          const barH = Math.max(3, (val / maxVal) * 100)
          const isToday = i === data.length - 1
          const barWidth = 28
          const gap = (308 - 36 - barWidth * data.length) / (data.length - 1)
          const x = 36 + i * (barWidth + gap)

          return (
            <g key={i}>
              <motion.rect
                x={x}
                y={130}
                width={barWidth}
                height={0}
                rx="4"
                ry="4"
                fill={isToday ? 'url(#r57-barHighlight)' : 'url(#r57-barGrad)'}
                animate={{ height: barH, y: 130 - barH }}
                transition={{ type: 'spring' as const, stiffness: 80, damping: 14, delay: 0.2 + i * 0.08 }}
              />
              {isToday && (
                <motion.rect
                  x={x - 2}
                  y={130}
                  width={barWidth + 4}
                  height={0}
                  rx="6"
                  ry="6"
                  fill="none"
                  stroke="rgba(34,197,94,0.4)"
                  strokeWidth="1.5"
                  animate={{ height: barH + 4, y: 132 - barH - 4 }}
                  transition={{ type: 'spring' as const, stiffness: 80, damping: 14, delay: 0.2 + i * 0.08 }}
                />
              )}
              <motion.text
                x={x + barWidth / 2}
                y={124 - barH}
                textAnchor="middle"
                fill="rgba(34,197,94,0.8)"
                fontSize="9"
                fontWeight="600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                {val}kg
              </motion.text>
              <text
                x={x + barWidth / 2}
                y={146}
                textAnchor="middle"
                fill={isToday ? 'rgba(34,197,94,0.9)' : 'rgba(148,163,184,0.6)'}
                fontSize="10"
                fontWeight={isToday ? '700' : '400'}
              >
                {WEEK_DAYS[i]}
              </text>
            </g>
          )
        ))}

        {/* Y axis label */}
        <text x="10" y="85" transform="rotate(-90, 10, 85)" textAnchor="middle" fontSize="8" fill="rgba(148,163,184,0.5)">
          kg CO2
        </text>
      </svg>
    </div>
  )
}

/* ─── Category Breakdown ─── */
function CategoryBreakdownSection({ categories }: { categories: CategoryBreakdown[] }) {
  return (
    <div className="space-y-3">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.category}
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25, delay: i * 0.06 }}
        >
          <span className="text-lg w-6 text-center shrink-0">{cat.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium">{cat.category}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-muted-foreground">{cat.totalItems} items</span>
                <span className="text-[10px] font-bold tabular-nums" style={{ color: cat.color }}>
                  {cat.ecoScore}%
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${cat.barColor}`}
                initial={{ width: '0%' }}
                animate={{ width: `${cat.ecoScore}%` }}
                transition={{ duration: 0.8, type: 'spring' as const, stiffness: 180, damping: 20, delay: 0.2 + i * 0.06 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── Eco Challenges Section ─── */
function EcoChallengesSection({
  challenges,
  onComplete,
}: {
  challenges: EcoChallenge[]
  onComplete: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      {challenges.map((challenge, i) => {
        const pct = (challenge.progress / challenge.target) * 100
        const isComplete = challenge.progress >= challenge.target

        return (
          <motion.div
            key={challenge.id}
            className="r57-challenge-card relative overflow-hidden rounded-xl border border-border"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring' as const, stiffness: 180, damping: 18, delay: i * 0.08 }}
          >
            <div className="p-3">
              <div className="flex items-start gap-2.5">
                <motion.div
                  className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shrink-0"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                >
                  <Target className="h-4 w-4 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold">{challenge.title}</h4>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      {challenge.progress}/{challenge.target}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{challenge.description}</p>

                  <div className="mt-2">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ type: 'spring' as const, stiffness: 100, damping: 14, delay: 0.4 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {challenge.reward}
                    </span>

                    {!isComplete && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[9px] px-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400"
                          onClick={() => onComplete(challenge.id)}
                        >
                          +1 Progress
                        </Button>
                      </motion.div>
                    )}
                    {isComplete && (
                      <motion.div
                        className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 300, damping: 15 }}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Complete!
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ─── Store Eco Ratings ─── */
function StoreEcoRatingsSection({ stores }: { stores: StoreEcoRating[] }) {
  return (
    <div className="space-y-2.5">
      {stores.map((store, i) => {
        const ratingColor = store.ecoRating >= 90 ? '#22c55e' : store.ecoRating >= 80 ? '#14b8a6' : '#f59e0b'
        return (
          <motion.div
            key={store.storeName}
            className="r57-store-rating flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-secondary/10 hover:bg-secondary/20 transition-colors"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring' as const, stiffness: 160, damping: 18, delay: i * 0.06 }}
          >
            <span className="text-xl">{store.logo}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold truncate">{store.storeName}</p>
                <span className="text-[10px] font-extrabold tabular-nums" style={{ color: ratingColor }}>
                  {store.ecoRating}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: ratingColor }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${store.ecoRating}%` }}
                  transition={{ duration: 0.8, type: 'spring' as const, stiffness: 200, damping: 20, delay: 0.2 + i * 0.06 }}
                />
              </div>
              <span className="text-[8px] text-muted-foreground mt-0.5 block">
                {store.totalEcoProducts} eco products
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ─── Green Alternatives ─── */
function GreenAlternativesSection({ alternatives }: { alternatives: GreenAlternative[] }) {
  return (
    <div className="space-y-2">
      {alternatives.map((alt, i) => (
        <motion.div
          key={i}
          className="r57-alternative-card flex items-start gap-2.5 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/20"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 180, damping: 18, delay: i * 0.06 }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[9px] text-muted-foreground line-through">{alt.originalItem}</span>
              <ArrowRight className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">{alt.ecoAlternative}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-green-600 dark:text-green-400">{alt.co2Savings} CO2</span>
              <span className="text-[8px] text-muted-foreground">at</span>
              <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">{alt.ecoStore}</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{alt.rating}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── Tips Carousel ─── */
function TipsCarousel({ tips }: { tips: SustainabilityTip[] }) {
  const [currentTip, setCurrentTip] = useState(0)
  const [direction, setDirection] = useState(0)

  const navigateTip = useCallback((dir: number) => {
    setDirection(dir)
    setCurrentTip((prev) => {
      const next = prev + dir
      if (next < 0) return tips.length - 1
      if (next >= tips.length) return 0
      return next
    })
  }, [tips.length])

  const tip = tips[currentTip]

  return (
    <div className="r57-tips-carousel relative overflow-hidden rounded-xl border border-border">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={tip.id}
          className="p-4"
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">{tip.emoji}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                {tip.title}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{tip.text}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between px-3 pb-2">
        <button
          onClick={() => navigateTip(-1)}
          className="flex items-center justify-center h-7 w-7 rounded-full bg-secondary/60 hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-1">
          {tips.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > currentTip ? 1 : -1); setCurrentTip(i) }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentTip ? 'w-4 bg-emerald-500' : 'w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => navigateTip(1)}
          className="flex items-center justify-center h-7 w-7 rounded-full bg-secondary/60 hover:bg-secondary transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}

/* ─── Level Progression Bar ─── */
function LevelProgression({ score }: { score: number }) {
  const currentLevel = getEcoLevel(score)
  const currentIdx = ECO_LEVELS.indexOf(currentLevel)
  const nextLevel = ECO_LEVELS[currentIdx + 1]
  const progressInLevel = nextLevel
    ? ((score - currentLevel.minScore) / (currentLevel.maxScore - currentLevel.minScore)) * 100
    : 100

  return (
    <div className="r57-level-progression">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-muted-foreground">Level Progress</span>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          {Math.round(progressInLevel)}% to next
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {ECO_LEVELS.map((level, i) => (
          <div key={level.name} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className="flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors"
              style={{
                borderColor: i <= currentIdx ? level.color : 'rgba(148,163,184,0.2)',
                backgroundColor: i <= currentIdx ? `${level.color}20` : 'transparent',
              }}
              animate={i === currentIdx ? { scale: [1, 1.12, 1] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className={`text-sm ${i > currentIdx ? 'opacity-30' : ''}`}>{level.icon}</span>
            </motion.div>
            <span className={`text-[7px] font-medium ${i <= currentIdx ? 'text-foreground' : 'text-muted-foreground/40'}`}>
              {level.name}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {nextLevel && (
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min(progressInLevel, 100)}%` }}
            transition={{ duration: 1.2, type: 'spring' as const, stiffness: 120, damping: 16 }}
          />
        </div>
      )}
    </div>
  )
}

/* ─── Share Impact Dialog ─── */
function ShareImpactButton({ data }: { data: CarbonData }) {
  const [shared, setShared] = useState(false)

  const handleShare = useCallback(async () => {
    const summary = `🌱 My Sustainability Impact!\n\n` +
      `📦 ${data.monthlyKg}kg CO₂ saved this month\n` +
      `🌳 Equivalent to ${getTreesFromCO2(data.monthlyKg)} trees planted\n` +
      `🚗 ${getKmFromCO2(data.monthlyKg)}km not driven\n` +
      `💡 ${getHoursFromCO2(data.monthlyKg)} hours of light saved\n\n` +
      `Join me in making greener choices! 🌍`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'My Eco Impact', text: summary })
      } catch {
        setShared(true)
      }
    } else {
      await navigator.clipboard.writeText(summary)
      setShared(true)
    }

    setTimeout(() => setShared(false), 3000)
  }, [data])

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        onClick={handleShare}
        className="w-full h-10 text-xs font-bold rounded-xl gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
      >
        {shared ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Copied to clipboard!
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Share Your Impact
          </>
        )}
      </Button>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function SustainabilityTracker() {
  const [state, setState] = useState<TrackerState>(loadState)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  // Hydration guard
  useEffect(() => {
    setMounted(true)
  }, [])

  // Persist state changes
  useEffect(() => {
    if (mounted) {
      saveState(state)
    }
  }, [mounted, state])

  // Computed values
  const ecoScore = state.ecoScore.score
  const monthlyKg = state.carbonData.monthlyKg
  const animatedKg = useAnimatedCounter(monthlyKg, 1600, mounted)
  const unlockedCount = state.achievements.filter(a => a.unlocked).length

  // Challenge progress handler
  const handleChallengeProgress = useCallback((challengeId: string) => {
    setState(prev => {
      const challenges = MOCK_CHALLENGES
      const challenge = challenges.find(c => c.id === challengeId)
      if (!challenge || challenge.progress >= challenge.target) return prev
      if (prev.completedChallenges.includes(challengeId)) return prev

      const newCompleted = [...prev.completedChallenges]
      if (challenge.progress + 1 >= challenge.target) {
        newCompleted.push(challengeId)
      }
      return { ...prev, completedChallenges: newCompleted }
    })
  }, [])

  // Tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'achievements', label: 'Badges', icon: Trophy },
    { id: 'challenges', label: 'Challenges', icon: Zap },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
  ]

  if (!mounted) {
    return (
      <div className="r57-sustainability-tracker">
        <div className="rounded-2xl p-6 glassmorphism-strong animate-pulse">
          <div className="h-6 w-48 bg-muted rounded mb-4" />
          <div className="h-44 w-44 bg-muted rounded-full mx-auto mb-4" />
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <section className="r57-sustainability-tracker">
      <div className="rounded-2xl overflow-hidden glassmorphism-strong relative">
        {/* Background mesh */}
        <div className="absolute inset-0 gradient-mesh-2 opacity-20 pointer-events-none" />

        <div className="relative z-10">
          {/* ─── Header ─── */}
          <motion.div
            className="relative bg-gradient-to-r from-green-600 to-teal-600 p-4 sm:p-5 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-white/5" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Recycle className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-base font-bold text-white">Sustainability Tracker</h2>
                  <p className="text-[11px] text-white/70">Track your eco-friendly shopping impact</p>
                </div>
              </div>
              <motion.span
                className="text-2xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                🌍
              </motion.span>
            </div>
          </motion.div>

          {/* ─── Tab Navigation ─── */}
          <div className="px-4 pt-3 pb-0">
            <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-1">
              {tabs.map((tab, i) => {
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all r57-tab ${
                      activeTab === i
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
                    }`}
                    style={{
                      boxShadow: activeTab === i ? '0 4px 12px rgba(34,197,94,0.25)' : undefined,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* ─── Tab Content ─── */}
          <div className="p-4 sm:p-5">
            <AnimatePresence mode="wait">
              {/* ═══════ TAB 0: Overview ═══════ */}
              {activeTab === 0 && (
                <motion.div
                  key="overview"
                  className="space-y-5"
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ type: 'spring' as const, stiffness: 160, damping: 18 }}
                >
                  {/* Eco Score Gauge + Carbon Stats */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <EcoScoreGauge score={ecoScore} />

                    <div className="flex-1 w-full space-y-3">
                      {/* Carbon counter */}
                      <div className="r57-carbon-counter flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border">
                        <motion.div
                          className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500/10 shrink-0"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        >
                          <Globe className="h-5 w-5 text-green-500" />
                        </motion.div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">CO₂ Saved This Month</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-green-600 dark:text-green-400 tabular-nums">
                              {animatedKg}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground">kg</span>
                          </div>
                        </div>
                        <motion.div
                          className="ml-auto flex items-center gap-0.5 px-2 py-1 rounded-lg bg-green-500/10"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-[9px] font-bold text-green-600 dark:text-green-400">+12%</span>
                        </motion.div>
                      </div>

                      {/* Equivalent comparisons */}
                      <EquivalentComparisons kg={monthlyKg} />
                    </div>
                  </div>

                  {/* Level Progression */}
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Level Progression
                    </h3>
                    <div className="bg-secondary/20 rounded-xl p-4 border border-border">
                      <LevelProgression score={ecoScore} />
                    </div>
                  </div>

                  {/* Weekly CO2 Chart */}
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                      <Leaf className="h-4 w-4 text-emerald-500" />
                      Weekly CO₂ Savings
                    </h3>
                    <div className="bg-secondary/20 rounded-xl p-3 sm:p-4 border border-border">
                      <WeeklyBarChart data={state.carbonData.weeklyData} />
                      <p className="text-[10px] text-center text-muted-foreground mt-2">
                        Total: {state.carbonData.weeklyData.reduce((a, b) => a + b, 0).toFixed(1)}kg CO₂ saved this week
                      </p>
                    </div>
                  </div>

                  {/* Green Purchase Timeline */}
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                      <ShoppingCart className="h-4 w-4 text-teal-500" />
                      Recent Green Purchases
                    </h3>
                    <GreenPurchaseTimeline purchases={MOCK_PURCHASES} />
                  </div>

                  {/* Share Impact */}
                  <ShareImpactButton data={state.carbonData} />
                </motion.div>
              )}

              {/* ═══════ TAB 1: Achievements ═══════ */}
              {activeTab === 1 && (
                <motion.div
                  key="achievements"
                  className="space-y-5"
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ type: 'spring' as const, stiffness: 160, damping: 18 }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-amber-500" />
                      Green Achievements
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {unlockedCount}/{state.achievements.length} unlocked
                    </span>
                  </div>

                  {/* Badge grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {state.achievements.map((badge, i) => (
                      <AchievementBadgeCard key={badge.id} badge={badge} index={i} />
                    ))}
                  </div>

                  {/* Next badge progress */}
                  {(() => {
                    const nextLocked = state.achievements.find(a => !a.unlocked && a.progress > 0)
                    if (!nextLocked) return null
                    return (
                      <div className="bg-secondary/40 rounded-xl p-3 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            Next: {nextLocked.icon} {nextLocked.name}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {nextLocked.progress}/{nextLocked.maxProgress}
                          </span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(nextLocked.progress / nextLocked.maxProgress) * 100}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                          />
                          <motion.div
                            className="absolute inset-y-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            style={{ width: '50%' }}
                            animate={{ left: ['-50%', '150%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1.5">{nextLocked.description}</p>
                      </div>
                    )
                  })()}
                </motion.div>
              )}

              {/* ═══════ TAB 2: Challenges ═══════ */}
              {activeTab === 2 && (
                <motion.div
                  key="challenges"
                  className="space-y-5"
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ type: 'spring' as const, stiffness: 160, damping: 18 }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Eco Challenges
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {state.completedChallenges.length}/{MOCK_CHALLENGES.length} done
                    </span>
                  </div>

                  <EcoChallengesSection
                    challenges={MOCK_CHALLENGES.map(c => ({
                      ...c,
                      progress: state.completedChallenges.includes(c.id) ? c.target : c.progress,
                    }))}
                    onComplete={handleChallengeProgress}
                  />

                  {/* Category breakdown */}
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                      <Recycle className="h-4 w-4 text-teal-500" />
                      Category Eco-Score
                    </h3>
                    <div className="bg-secondary/20 rounded-xl p-4 border border-border">
                      <CategoryBreakdownSection categories={MOCK_CATEGORIES} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══════ TAB 3: Insights ═══════ */}
              {activeTab === 3 && (
                <motion.div
                  key="insights"
                  className="space-y-5"
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ type: 'spring' as const, stiffness: 160, damping: 18 }}
                >
                  {/* Tips Carousel */}
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Sustainability Tips
                    </h3>
                    <TipsCarousel tips={MOCK_TIPS} />
                  </div>

                  {/* Store eco-ratings */}
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-emerald-500" />
                      Store Eco-Ratings
                    </h3>
                    <StoreEcoRatingsSection stores={MOCK_STORE_RATINGS} />
                  </div>

                  {/* Green Alternatives */}
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                      <Leaf className="h-4 w-4 text-green-500" />
                      Green Alternatives
                    </h3>
                    <p className="text-[10px] text-muted-foreground mb-2">
                      Sustainable swaps for recently viewed items
                    </p>
                    <GreenAlternativesSection alternatives={MOCK_ALTERNATIVES} />
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <motion.div
                      className="r57-stat-card flex flex-col items-center gap-1 p-3 rounded-xl border border-border bg-secondary/20"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: 0.1 }}
                    >
                      <Droplets className="h-5 w-5 text-cyan-500" />
                      <span className="text-lg font-extrabold text-cyan-600 dark:text-cyan-400">128</span>
                      <span className="text-[8px] text-muted-foreground">Plastic bags avoided</span>
                    </motion.div>
                    <motion.div
                      className="r57-stat-card flex flex-col items-center gap-1 p-3 rounded-xl border border-border bg-secondary/20"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: 0.15 }}
                    >
                      <TreePine className="h-5 w-5 text-green-500" />
                      <span className="text-lg font-extrabold text-green-600 dark:text-green-400">
                        {getTreesFromCO2(monthlyKg)}
                      </span>
                      <span className="text-[8px] text-muted-foreground">Trees equivalent</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Footer ─── */}
          <div className="px-4 py-3 border-t border-border/30">
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                <Recycle className="h-3 w-3" />
              </motion.div>
              <span>Tracking eco-impact since your first green purchase</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SustainabilityTracker
