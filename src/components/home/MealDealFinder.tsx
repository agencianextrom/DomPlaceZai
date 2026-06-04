'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UtensilsCrossed,
  Flame,
  Clock,
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  Sparkles,
  Filter,
  Zap,
  TrendingUp,
  Award,
  Timer,
  Leaf,
  WheatOff,
  Beef,
  Droplets,
  Search,
  ArrowRight,
  Trash2,
  Combine,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ═══════════════════════════════════════════════════════════════════════════
   Types & Interfaces
   ═══════════════════════════════════════════════════════════════════════════ */

type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack'
type DietaryTag = 'all' | 'vegetarian' | 'vegan' | 'gluten-free' | 'keto' | 'low-carb' | 'halal'

interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

interface MealDealItem {
  id: string
  name: string
  emoji: string
  gradient: string
  restaurant: string
  restaurantEmoji: string
  originalPrice: number
  dealPrice: number
  savingsPercent: number
  rating: number
  reviewCount: number
  distance: string
  category: MealCategory
  dietaryTags: DietaryTag[]
  nutrition: Nutrition
  isTopPick: boolean
  expiresAt: string
}

interface MealCombo {
  id: string
  name: string
  items: MealDealItem[]
  originalTotal: number
  comboPrice: number
  savingsPercent: number
}

/* ═══════════════════════════════════════════════════════════════════════════
   Constants & Mock Data
   ═══════════════════════════════════════════════════════════════════════════ */

const MEAL_CATEGORY_CONFIG: Record<MealCategory, { label: string; emoji: string; color: string }> = {
  breakfast: { label: 'Breakfast', emoji: '☕', color: 'text-amber-600 dark:text-amber-400' },
  lunch: { label: 'Lunch', emoji: '🍽️', color: 'text-emerald-600 dark:text-emerald-400' },
  dinner: { label: 'Dinner', emoji: '🌙', color: 'text-indigo-600 dark:text-indigo-400' },
  snack: { label: 'Snacks', emoji: '🥤', color: 'text-pink-600 dark:text-pink-400' },
}

const DIETARY_FILTERS: { key: DietaryTag; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '🍽️' },
  { key: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { key: 'vegan', label: 'Vegan', icon: '🌱' },
  { key: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { key: 'keto', label: 'Keto', icon: '🥑' },
  { key: 'low-carb', label: 'Low-Carb', icon: '🥦' },
  { key: 'halal', label: 'Halal', icon: '☪️' },
]

const MEAL_DEALS: MealDealItem[] = [
  {
    id: 'md-1',
    name: 'Avocado Toast Supreme',
    emoji: '🥑',
    gradient: 'from-green-400 to-emerald-500',
    restaurant: 'Green Kitchen',
    restaurantEmoji: '🌿',
    originalPrice: 14.99,
    dealPrice: 9.99,
    savingsPercent: 33,
    rating: 4.8,
    reviewCount: 234,
    distance: '500m',
    category: 'breakfast',
    dietaryTags: ['vegetarian', 'vegan'],
    nutrition: { calories: 350, protein: 12, carbs: 28, fat: 22, fiber: 9 },
    isTopPick: true,
    expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(),
  },
  {
    id: 'md-2',
    name: 'Grilled Chicken Bowl',
    emoji: '🍗',
    gradient: 'from-amber-400 to-orange-500',
    restaurant: 'Protein Palace',
    restaurantEmoji: '💪',
    originalPrice: 18.99,
    dealPrice: 12.99,
    savingsPercent: 32,
    rating: 4.9,
    reviewCount: 567,
    distance: '1.2km',
    category: 'lunch',
    dietaryTags: ['gluten-free', 'keto'],
    nutrition: { calories: 480, protein: 42, carbs: 18, fat: 26, fiber: 4 },
    isTopPick: true,
    expiresAt: new Date(Date.now() + 6 * 3600000).toISOString(),
  },
  {
    id: 'md-3',
    name: 'Salmon Sushi Platter',
    emoji: '🍣',
    gradient: 'from-rose-400 to-pink-500',
    restaurant: 'Ocean Fresh',
    restaurantEmoji: '🐟',
    originalPrice: 24.99,
    dealPrice: 16.99,
    savingsPercent: 32,
    rating: 4.7,
    reviewCount: 189,
    distance: '800m',
    category: 'dinner',
    dietaryTags: ['low-carb'],
    nutrition: { calories: 520, protein: 35, carbs: 42, fat: 20, fiber: 2 },
    isTopPick: true,
    expiresAt: new Date(Date.now() + 7 * 3600000).toISOString(),
  },
  {
    id: 'md-4',
    name: 'Acai Power Bowl',
    emoji: '🫐',
    gradient: 'from-purple-400 to-violet-500',
    restaurant: 'Berry Bliss',
    restaurantEmoji: '🫐',
    originalPrice: 12.99,
    dealPrice: 7.99,
    savingsPercent: 38,
    rating: 4.6,
    reviewCount: 312,
    distance: '300m',
    category: 'snack',
    dietaryTags: ['vegetarian', 'vegan', 'gluten-free'],
    nutrition: { calories: 280, protein: 8, carbs: 52, fat: 10, fiber: 11 },
    isTopPick: false,
    expiresAt: new Date(Date.now() + 5 * 3600000).toISOString(),
  },
  {
    id: 'md-5',
    name: 'Falafel Wrap Deluxe',
    emoji: '🧆',
    gradient: 'from-yellow-400 to-amber-500',
    restaurant: 'Spice Route',
    restaurantEmoji: '🌶️',
    originalPrice: 11.99,
    dealPrice: 8.49,
    savingsPercent: 29,
    rating: 4.5,
    reviewCount: 156,
    distance: '600m',
    category: 'lunch',
    dietaryTags: ['vegetarian', 'halal'],
    nutrition: { calories: 420, protein: 18, carbs: 48, fat: 16, fiber: 8 },
    isTopPick: false,
    expiresAt: new Date(Date.now() + 9 * 3600000).toISOString(),
  },
  {
    id: 'md-6',
    name: 'Keto Burger Lettuce Wrap',
    emoji: '🍔',
    gradient: 'from-red-400 to-rose-500',
    restaurant: 'Low Carb Lab',
    restaurantEmoji: '🔬',
    originalPrice: 16.99,
    dealPrice: 11.99,
    savingsPercent: 29,
    rating: 4.8,
    reviewCount: 298,
    distance: '1.5km',
    category: 'dinner',
    dietaryTags: ['keto', 'low-carb', 'gluten-free'],
    nutrition: { calories: 380, protein: 32, carbs: 6, fat: 28, fiber: 2 },
    isTopPick: false,
    expiresAt: new Date(Date.now() + 10 * 3600000).toISOString(),
  },
  {
    id: 'md-7',
    name: 'Overnight Oats Jar',
    emoji: '🥣',
    gradient: 'from-cyan-400 to-teal-500',
    restaurant: 'Morning Ritual',
    restaurantEmoji: '☀️',
    originalPrice: 8.99,
    dealPrice: 5.99,
    savingsPercent: 33,
    rating: 4.4,
    reviewCount: 421,
    distance: '200m',
    category: 'breakfast',
    dietaryTags: ['vegetarian', 'vegan'],
    nutrition: { calories: 310, protein: 14, carbs: 44, fat: 8, fiber: 7 },
    isTopPick: false,
    expiresAt: new Date(Date.now() + 12 * 3600000).toISOString(),
  },
  {
    id: 'md-8',
    name: 'Protein Smoothie',
    emoji: '🥤',
    gradient: 'from-fuchsia-400 to-pink-500',
    restaurant: 'Blend Bar',
    restaurantEmoji: '🏋️',
    originalPrice: 9.99,
    dealPrice: 6.49,
    savingsPercent: 35,
    rating: 4.3,
    reviewCount: 178,
    distance: '400m',
    category: 'snack',
    dietaryTags: ['vegan', 'gluten-free', 'keto'],
    nutrition: { calories: 220, protein: 28, carbs: 12, fat: 8, fiber: 3 },
    isTopPick: true,
    expiresAt: new Date(Date.now() + 4 * 3600000).toISOString(),
  },
  {
    id: 'md-9',
    name: 'Mediterranean Pasta',
    emoji: '🍝',
    gradient: 'from-orange-400 to-red-500',
    restaurant: 'Nonna\'s Kitchen',
    restaurantEmoji: '👩‍🍳',
    originalPrice: 15.99,
    dealPrice: 10.99,
    savingsPercent: 31,
    rating: 4.7,
    reviewCount: 345,
    distance: '900m',
    category: 'dinner',
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 560, protein: 16, carbs: 68, fat: 22, fiber: 5 },
    isTopPick: false,
    expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(),
  },
  {
    id: 'md-10',
    name: 'Veggie Breakfast Burrito',
    emoji: '🌯',
    gradient: 'from-lime-400 to-green-500',
    restaurant: 'Casa Verde',
    restaurantEmoji: '🏠',
    originalPrice: 10.99,
    dealPrice: 7.49,
    savingsPercent: 32,
    rating: 4.6,
    reviewCount: 267,
    distance: '350m',
    category: 'breakfast',
    dietaryTags: ['vegetarian', 'halal'],
    nutrition: { calories: 390, protein: 16, carbs: 42, fat: 18, fiber: 10 },
    isTopPick: false,
    expiresAt: new Date(Date.now() + 11 * 3600000).toISOString(),
  },
  {
    id: 'md-11',
    name: 'Thai Green Curry',
    emoji: '🥘',
    gradient: 'from-emerald-400 to-teal-500',
    restaurant: 'Bangkok Street',
    restaurantEmoji: '🛕',
    originalPrice: 19.99,
    dealPrice: 13.49,
    savingsPercent: 33,
    rating: 4.8,
    reviewCount: 412,
    distance: '1.1km',
    category: 'dinner',
    dietaryTags: ['gluten-free', 'halal'],
    nutrition: { calories: 440, protein: 24, carbs: 32, fat: 26, fiber: 4 },
    isTopPick: true,
    expiresAt: new Date(Date.now() + 7 * 3600000).toISOString(),
  },
  {
    id: 'md-12',
    name: 'Trail Mix Energy Bites',
    emoji: '🥜',
    gradient: 'from-amber-300 to-yellow-500',
    restaurant: 'Nature Bites',
    restaurantEmoji: '🌲',
    originalPrice: 7.99,
    dealPrice: 4.99,
    savingsPercent: 38,
    rating: 4.5,
    reviewCount: 198,
    distance: '250m',
    category: 'snack',
    dietaryTags: ['vegan', 'gluten-free', 'keto', 'low-carb'],
    nutrition: { calories: 180, protein: 8, carbs: 10, fat: 14, fiber: 3 },
    isTopPick: false,
    expiresAt: new Date(Date.now() + 15 * 3600000).toISOString(),
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════════════════ */

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const gridItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
}

const carouselCardVariants = {
  hidden: { opacity: 0, scale: 0.9, x: 60 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.9, x: -60 },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 24 },
  },
}

const comboPulse = {
  animate: {
    scale: [1, 1.03, 1],
    boxShadow: [
      '0 0 0 0 rgba(16,185,129,0)',
      '0 0 0 6px rgba(16,185,129,0.15)',
      '0 0 0 0 rgba(16,185,129,0)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const heartBurst = {
  animate: {
    scale: [1, 1.3, 0.9, 1.1, 1],
    transition: { duration: 0.5, ease: 'easeInOut' as const },
  },
}

const cartBounce = {
  animate: {
    y: [0, -8, 0],
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.5, ease: 'easeInOut' as const },
  },
}

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

function formatBRL(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
}

function getDealExpiry(): string {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  return end.toISOString()
}

function getTimeRemaining(expiry: string): string {
  const now = new Date()
  const end = new Date(expiry)
  const diff = Math.max(0, end.getTime() - now.getTime())
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Deal Countdown Timer ── */
function DealCountdownTimer({ expiry }: { expiry: string }) {
  const [timeStr, setTimeStr] = useState('00:00:00')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const tick = () => setTimeStr(getTimeRemaining(expiry))
    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [expiry])

  if (timeStr === 'Expired') {
    return (
      <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
        Expired
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1 bg-black/60 dark:bg-black/70 backdrop-blur-sm text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
      <Timer className="h-2.5 w-2.5 text-amber-400" />
      <motion.span
        key={timeStr}
        initial={{ scale: 1.1, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {timeStr}
      </motion.span>
    </div>
  )
}

/* ── Star Rating with Golden Shimmer ── */
function StarRatingShimmer({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.3

  return (
    <div className="r55-star-rating flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, type: 'spring' as const, stiffness: 500, damping: 15 }}
          className="relative"
        >
          <Star
            className={`h-3 w-3 ${
              i < fullStars
                ? 'text-amber-400 fill-amber-400'
                : i === fullStars && hasHalf
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-muted-foreground/40'
            }`}
          />
          {i < fullStars && (
            <motion.div
              className="absolute inset-0 r55-star-shimmer"
              animate={{ opacity: [0, 1, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' as const }}
            />
          )}
        </motion.div>
      ))}
      <span className="text-[10px] font-semibold text-muted-foreground ml-1">{rating}</span>
    </div>
  )
}

/* ── Proximity Badge ── */
function ProximityBadge({ distance }: { distance: string }) {
  const isClose = distance === '200m' || distance === '250m' || distance === '300m' || distance === '350m' || distance === '400m' || distance === '500m'

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-0.5 text-[9px] font-semibold rounded-full px-1.5 py-0.5 ${
        isClose
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
      }`}
    >
      <MapPin className="h-2 w-2" />
      {distance}
    </motion.div>
  )
}

/* ── Nutritional Info Overlay ── */
function NutritionalOverlay({
  item,
  onClose,
}: {
  item: MealDealItem
  onClose: () => void
}) {
  const maxCal = 800
  const maxMac = 60

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        className="relative bg-card rounded-2xl border border-border shadow-2xl max-w-sm w-full overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header */}
        <div className={`bg-gradient-to-br ${item.gradient} p-4`}>
          <div className="flex items-center gap-3">
            <motion.span
              className="text-3xl"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 12 }}
            >
              {item.emoji}
            </motion.span>
            <div>
              <h3 className="text-sm font-bold text-white">{item.name}</h3>
              <p className="text-[10px] text-white/70">{item.restaurant}</p>
            </div>
          </div>
        </div>

        {/* Nutrition Details */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold">Nutritional Information</span>
          </div>

          {/* Calorie Highlight */}
          <div className="r55-calorie-highlight bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl p-3 flex items-center justify-between border border-orange-500/20">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-[10px] font-semibold text-muted-foreground">Calories</span>
            </div>
            <motion.span
              key={item.nutrition.calories}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
              className="text-lg font-bold text-orange-600 dark:text-orange-400"
            >
              {item.nutrition.calories}
            </motion.span>
          </div>

          {/* Macro Bars */}
          {[
            { label: 'Protein', value: item.nutrition.protein, max: maxMac, color: '#3b82f6', unit: 'g' },
            { label: 'Carbs', value: item.nutrition.carbs, max: maxMac, color: '#eab308', unit: 'g' },
            { label: 'Fat', value: item.nutrition.fat, max: maxMac, color: '#ef4444', unit: 'g' },
            { label: 'Fiber', value: item.nutrition.fiber, max: 20, color: '#22c55e', unit: 'g' },
          ].map((macro) => {
            const pct = Math.min((macro.value / macro.max) * 100, 100)
            return (
              <div key={macro.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground">{macro.label}</span>
                  <span className="text-[10px] font-bold tabular-nums">
                    {macro.value}{macro.unit} / {macro.max}{macro.unit}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: macro.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' as const }}
                  />
                </div>
              </div>
            )
          })}

          {/* Dietary Tags */}
          <div className="flex flex-wrap gap-1 pt-1">
            {item.dietaryTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[8px] font-semibold capitalize bg-primary/5 text-primary border-primary/10"
              >
                {tag.replace('-', ' ')}
              </Badge>
            ))}
          </div>

          {/* Close Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full h-8 bg-muted rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Deal Card ── */
function DealCard({
  deal,
  onToggleFavorite,
  isFavorite,
  onAddToCombo,
  onShowNutrition,
}: {
  deal: MealDealItem
  onToggleFavorite: (id: string) => void
  isFavorite: boolean
  onAddToCombo: (item: MealDealItem) => void
  onShowNutrition: (item: MealDealItem) => void
}) {
  return (
    <motion.div
      variants={gridItemVariants}
      whileHover={{
        y: -4,
        boxShadow: '0 8px 24px rgba(16,185,129,0.15), 0 2px 6px rgba(0,0,0,0.08)',
      }}
      className="r55-deal-card bg-card rounded-xl border border-border overflow-hidden group cursor-pointer relative"
    >
      {/* Gradient Image Placeholder */}
      <div className={`relative h-28 bg-gradient-to-br ${deal.gradient} flex items-center justify-center overflow-hidden`}>
        <motion.span
          className="text-4xl"
          initial={{ scale: 0.8 }}
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 15 }}
        >
          {deal.emoji}
        </motion.span>

        {/* Savings Badge */}
        <div className="absolute top-2 left-2">
          <motion.div
            initial={{ scale: 0, x: -10 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
          >
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-white/90 dark:bg-black/70 text-red-500 shadow-sm">
              <Zap className="h-2 w-2" />
              -{deal.savingsPercent}%
            </span>
          </motion.div>
        </div>

        {/* Favorite Button */}
        <motion.div
          className="absolute top-2 right-2 z-10"
          whileTap={{ scale: 0.85 }}
        >
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(deal.id)
            }}
            className={`h-7 w-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
              isFavorite
                ? 'bg-red-500/90 text-white'
                : 'bg-white/70 dark:bg-black/50 text-white hover:bg-red-500/90'
            }`}
          >
            <motion.div {...(isFavorite ? heartBurst.animate : {})}>
              <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-white' : ''}`} />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Countdown */}
        <div className="absolute bottom-2 right-2">
          <DealCountdownTimer expiry={deal.expiresAt} />
        </div>

        {/* Top Pick Badge */}
        {deal.isTopPick && (
          <motion.div
            className="absolute bottom-2 left-2"
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 12, delay: 0.15 }}
          >
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-amber-500/90 text-white shadow-sm">
              <Award className="h-2 w-2" />
              Top Pick
            </span>
          </motion.div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3 space-y-2">
        {/* Restaurant + Distance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs">{deal.restaurantEmoji}</span>
            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[80px]">
              {deal.restaurant}
            </span>
          </div>
          <ProximityBadge distance={deal.distance} />
        </div>

        {/* Name */}
        <h4 className="text-xs font-bold leading-tight line-clamp-2">{deal.name}</h4>

        {/* Rating */}
        <StarRatingShimmer rating={deal.rating} />
        <span className="text-[9px] text-muted-foreground">({deal.reviewCount} reviews)</span>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-primary">{formatBRL(deal.dealPrice)}</span>
          <span className="text-[10px] text-muted-foreground line-through">{formatBRL(deal.originalPrice)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 pt-1">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant="default"
              className="h-7 px-2.5 text-[10px] font-semibold flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation()
                onAddToCombo(deal)
              }}
            >
              <Plus className="h-2.5 w-2.5" />
              Combo
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-[10px] font-semibold flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation()
                onShowNutrition(deal)
              }}
            >
              <Info className="h-2.5 w-2.5" />
              Nutrition
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Today's Top Picks Carousel Card ── */
function TopPickCarouselCard({
  item,
  index,
  onToggleFavorite,
  isFavorite,
}: {
  item: MealDealItem
  index: number
  onToggleFavorite: (id: string) => void
  isFavorite: boolean
}) {
  return (
    <motion.div
      variants={carouselCardVariants}
      whileHover={{
        y: -6,
        boxShadow: '0 12px 32px rgba(16,185,129,0.2), 0 4px 8px rgba(0,0,0,0.1)',
      }}
      className="r55-carousel-card flex-shrink-0 w-64 bg-card rounded-2xl border border-border overflow-hidden relative"
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10 r55-carousel-shimmer"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)',
          backgroundSize: '250% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' as const, repeatDelay: 1.5, delay: index * 0.4 }}
      />

      <div className={`relative h-36 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
        <motion.span
          className="text-5xl"
          initial={{ scale: 0, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 350, damping: 12, delay: 0.1 + index * 0.1 }}
        >
          {item.emoji}
        </motion.span>

        {/* Rank badge */}
        <motion.div
          className="absolute top-3 left-3"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 14, delay: 0.2 + index * 0.1 }}
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-500 text-white shadow-lg">
            <TrendingUp className="h-2.5 w-2.5" />
            #{index + 1} Pick
          </span>
        </motion.div>

        {/* Favorite */}
        <motion.button
          className="absolute top-3 right-3 h-7 w-7 rounded-full flex items-center justify-center bg-white/80 dark:bg-black/50 backdrop-blur-sm"
          whileTap={{ scale: 0.85 }}
          onClick={() => onToggleFavorite(item.id)}
        >
          <motion.div {...(isFavorite ? heartBurst.animate : {})}>
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
          </motion.div>
        </motion.button>
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-1">
          <span className="text-xs">{item.restaurantEmoji}</span>
          <span className="text-[10px] text-muted-foreground truncate">{item.restaurant}</span>
          <span className="ml-auto"><ProximityBadge distance={item.distance} /></span>
        </div>
        <h4 className="text-sm font-bold">{item.name}</h4>
        <StarRatingShimmer rating={item.rating} />
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-base font-bold text-primary">{formatBRL(item.dealPrice)}</span>
          <span className="text-[10px] text-muted-foreground line-through">{formatBRL(item.originalPrice)}</span>
          <span className="text-[10px] font-bold text-red-500 ml-auto">-{item.savingsPercent}%</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Combo Builder Panel ── */
function ComboBuilderPanel({
  comboItems,
  onRemoveItem,
  onClearCombo,
  onAddComboToCart,
}: {
  comboItems: MealDealItem[]
  onRemoveItem: (id: string) => void
  onClearCombo: () => void
  onAddComboToCart: () => void
}) {
  const originalTotal = comboItems.reduce((sum, i) => sum + i.originalPrice, 0)
  const comboDiscount = 0.8
  const comboPrice = Number((originalTotal * comboDiscount).toFixed(2))
  const savingsPercent = Math.round((1 - comboDiscount) * 100)
  const [cartBouncing, setCartBouncing] = useState(false)

  const handleAddToCart = () => {
    setCartBouncing(true)
    onAddComboToCart()
    setTimeout(() => setCartBouncing(false), 600)
  }

  if (comboItems.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 22 }}
      className="r55-combo-panel bg-card rounded-2xl border border-emerald-500/30 overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Combine className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Your Meal Combo</span>
            <Badge className="text-[9px] font-bold bg-white/20 text-white border-0">
              {comboItems.length} items
            </Badge>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClearCombo}
            className="h-7 px-2 rounded-md bg-white/20 text-white text-[10px] font-semibold flex items-center gap-1 hover:bg-white/30 transition-colors"
          >
            <Trash2 className="h-2.5 w-2.5" />
            Clear
          </motion.button>
        </div>
      </div>

      {/* Items List */}
      <div className="p-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        {comboItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ delay: idx * 0.05, type: 'spring' as const, stiffness: 400, damping: 22 }}
            className="flex items-center gap-2 bg-muted/50 rounded-lg p-2"
          >
            <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0`}>
              <span className="text-sm">{item.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold truncate">{item.name}</p>
              <p className="text-[9px] text-muted-foreground">{item.restaurant}</p>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">{formatBRL(item.dealPrice)}</span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => onRemoveItem(item.id)}
              className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <X className="h-3 w-3" />
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Price Comparison + CTA */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Individual total</span>
            <span className="text-[10px] text-muted-foreground line-through">{formatBRL(originalTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Combo price (-{savingsPercent}%)</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatBRL(comboPrice)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">You save</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{formatBRL(originalTotal - comboPrice)}</span>
          </div>
        </div>

        <motion.div
          {...comboPulse.animate}
          className="rounded-xl overflow-hidden"
        >
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              className="w-full h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
              onClick={handleAddToCart}
            >
              <motion.div {...(cartBouncing ? cartBounce.animate : {})}>
                <ShoppingCart className="h-4 w-4" />
              </motion.div>
              Add Combo to Cart — {formatBRL(comboPrice)}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ── Calorie Range Slider ── */
function CalorieRangeSlider({
  minCal,
  maxCal,
  onRangeChange,
}: {
  minCal: number
  maxCal: number
  onRangeChange: (min: number, max: number) => void
}) {
  return (
    <div className="r55-calorie-slider space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
          <Flame className="h-3 w-3 text-orange-400" />
          Calorie Range
        </span>
        <span className="text-[10px] font-bold tabular-nums">
          {minCal}–{maxCal} cal
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        {/* Background track */}
        <div className="absolute inset-x-0 h-2 rounded-full bg-muted" />
        {/* Active range */}
        <div
          className="absolute h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
          style={{
            left: `${((minCal - 200) / 1800) * 100}%`,
            right: `${100 - ((maxCal - 200) / 1800) * 100}%`,
          }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={200}
          max={2000}
          step={50}
          value={minCal}
          onChange={(e) => onRangeChange(Number(e.target.value), maxCal)}
          className="r55-calorie-thumb absolute inset-x-0 w-full h-2 appearance-none bg-transparent pointer-events-none z-10"
          style={{ pointerEvents: 'auto' }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={200}
          max={2000}
          step={50}
          value={maxCal}
          onChange={(e) => onRangeChange(minCal, Number(e.target.value))}
          className="r55-calorie-thumb absolute inset-x-0 w-full h-2 appearance-none bg-transparent pointer-events-none z-10"
          style={{ pointerEvents: 'auto' }}
        />
      </div>
    </div>
  )
}

/* ── Empty State ── */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="r55-empty-state flex flex-col items-center justify-center py-12 px-4"
    >
      <motion.span
        className="text-5xl mb-4"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        🍽️
      </motion.span>
      <h3 className="text-sm font-bold text-muted-foreground mb-1">No deals match your filters</h3>
      <p className="text-[10px] text-muted-foreground text-center mb-4 max-w-xs">
        Try adjusting your dietary preferences or calorie range to find more meal deals.
      </p>
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="sm"
          className="text-[10px] font-semibold"
          onClick={onReset}
        >
          <ArrowRight className="h-3 w-3 mr-1" />
          Reset Filters
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* ── Dietary Filter Chips ── */
function DietaryFilterChips({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: DietaryTag
  onFilterChange: (tag: DietaryTag) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      {DIETARY_FILTERS.map((filter) => (
        <motion.button
          key={filter.key}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange(filter.key)}
          className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold border transition-all relative overflow-hidden ${
            activeFilter === filter.key
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:border-primary/40'
          }`}
        >
          <span className="relative z-10 flex items-center gap-1">
            <span>{filter.icon}</span>
            {filter.label}
          </span>
          {activeFilter === filter.key && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' as const }}
            />
          )}
        </motion.button>
      ))}
    </div>
  )
}

/* ── Meal Category Tabs ── */
function MealCategoryTabs({
  activeCategory,
  onCategoryChange,
  counts,
}: {
  activeCategory: MealCategory | 'all'
  onCategoryChange: (cat: MealCategory | 'all') => void
  counts: Record<string, number>
}) {
  const allCats: { key: MealCategory | 'all'; label: string; emoji: string }[] = [
    { key: 'all', label: 'All Deals', emoji: '🔥' },
    { key: 'breakfast', label: 'Breakfast', emoji: '☕' },
    { key: 'lunch', label: 'Lunch', emoji: '🍽️' },
    { key: 'dinner', label: 'Dinner', emoji: '🌙' },
    { key: 'snack', label: 'Snacks', emoji: '🥤' },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      {allCats.map((cat) => (
        <motion.button
          key={cat.key}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(cat.key)}
          className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold border transition-all ${
            activeCategory === cat.key
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-card text-muted-foreground border-border hover:border-emerald-300'
          }`}
        >
          <span>{cat.emoji}</span>
          {cat.label}
          <span className={`text-[9px] ${activeCategory === cat.key ? 'text-white/70' : 'text-muted-foreground/60'}`}>
            ({counts[cat.key] ?? 0})
          </span>
        </motion.button>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component: MealDealFinder
   ═══════════════════════════════════════════════════════════════════════════ */

export function MealDealFinder() {
  /* ── State ── */
  const [activeDietary, setActiveDietary] = useState<DietaryTag>('all')
  const [activeCategory, setActiveCategory] = useState<MealCategory | 'all'>('all')
  const [calMin, setCalMin] = useState(200)
  const [calMax, setCalMax] = useState(2000)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [comboItems, setComboItems] = useState<MealDealItem[]>([])
  const [nutritionItem, setNutritionItem] = useState<MealDealItem | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  /* ── Top Picks ── */
  const topPicks = useMemo(() => MEAL_DEALS.filter((d) => d.isTopPick), [])

  /* ── Category Counts ── */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MEAL_DEALS.length }
    for (const deal of MEAL_DEALS) {
      counts[deal.category] = (counts[deal.category] || 0) + 1
    }
    return counts
  }, [])

  /* ── Filtered Deals ── */
  const filteredDeals = useMemo(() => {
    return MEAL_DEALS.filter((deal) => {
      if (activeCategory !== 'all' && deal.category !== activeCategory) return false
      if (activeDietary !== 'all' && !deal.dietaryTags.includes(activeDietary)) return false
      if (deal.nutrition.calories < calMin || deal.nutrition.calories > calMax) return false
      return true
    })
  }, [activeCategory, activeDietary, calMin, calMax])

  /* ── Handlers ── */
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const addToCombo = useCallback((item: MealDealItem) => {
    setComboItems((prev) => {
      if (prev.length >= 5) return prev
      if (prev.find((i) => i.id === item.id)) return prev
      return [...prev, item]
    })
  }, [])

  const removeFromCombo = useCallback((id: string) => {
    setComboItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const clearCombo = useCallback(() => {
    setComboItems([])
  }, [])

  const handleAddComboToCart = useCallback(() => {
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
      setComboItems([])
    }, 2000)
  }, [])

  const handleCalorieChange = useCallback((min: number, max: number) => {
    setCalMin(Math.min(min, max))
    setCalMax(Math.max(min, max))
  }, [])

  const resetFilters = useCallback(() => {
    setActiveDietary('all')
    setActiveCategory('all')
    setCalMin(200)
    setCalMax(2000)
  }, [])

  /* ── Carousel Navigation ── */
  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    setCarouselIndex((prev) => {
      const maxIdx = topPicks.length - 1
      if (direction === 'left') return Math.max(0, prev - 1)
      return Math.min(maxIdx, prev + 1)
    })
  }, [topPicks.length])

  /* ── Auto-rotate carousel ── */
  useEffect(() => {
    if (topPicks.length <= 1) return
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % topPicks.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [topPicks.length])

  /* ── Main Countdown ── */
  const dealExpiry = getDealExpiry()
  const [mainTime, setMainTime] = useState(getTimeRemaining(dealExpiry))

  useEffect(() => {
    const tick = () => setMainTime(getTimeRemaining(dealExpiry))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [dealExpiry])

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="space-y-5"
    >
      {/* ═══════ Section Header ═══════ */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold r55-shimmer-title">Meal Deal Finder</h2>
            <p className="text-[10px] text-muted-foreground">
              Affordable meal combos from nearby stores
            </p>
          </div>
        </div>

        {/* Main Countdown */}
        <div className="hidden sm:flex items-center gap-2 bg-amber-500/10 dark:bg-amber-500/15 px-3 py-1.5 rounded-full border border-amber-500/20">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
            {mainTime}
          </span>
          <span className="text-[9px] text-muted-foreground">left today</span>
        </div>
      </motion.div>

      {/* ═══════ Today's Top Picks Carousel ═══════ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold">Today&apos;s Top Picks</h3>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scrollCarousel('left')}
              disabled={carouselIndex === 0}
              className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 disabled:opacity-30 transition-opacity"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scrollCarousel('right')}
              disabled={carouselIndex === topPicks.length - 1}
              className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 disabled:opacity-30 transition-opacity"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>

        <div ref={carouselRef} className="overflow-x-auto hide-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={carouselIndex}
              variants={carouselCardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex gap-3 px-1"
            >
              {topPicks.map((item, idx) => (
                <TopPickCarouselCard
                  key={item.id}
                  item={item}
                  index={idx}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.has(item.id)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-1.5">
          {topPicks.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === carouselIndex ? 20 : 6,
                opacity: i === carouselIndex ? 1 : 0.3,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' as const }}
              className="h-1.5 rounded-full bg-emerald-500"
            />
          ))}
        </div>
      </div>

      {/* ═══════ Filters Section ═══════ */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-3"
      >
        {/* Filter Toggle + Dietary Chips */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters((prev) => !prev)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold border transition-all ${
              showFilters
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40'
            }`}
          >
            <Filter className="h-3 w-3" />
            Filters
          </motion.button>
          <DietaryFilterChips activeFilter={activeDietary} onFilterChange={setActiveDietary} />
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' as const }}
              className="overflow-hidden"
            >
              <div className="bg-card rounded-xl border border-border p-3 space-y-3">
                <CalorieRangeSlider
                  minCal={calMin}
                  maxCal={calMax}
                  onRangeChange={handleCalorieChange}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={resetFilters}
                  className="text-[10px] text-primary font-semibold underline underline-offset-2"
                >
                  Reset all filters
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══════ Meal Category Tabs ═══════ */}
      <MealCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        counts={categoryCounts}
      />

      {/* ═══════ Combo Builder (sticky) ═══════ */}
      <AnimatePresence>
        {comboItems.length > 0 && (
          <div className="sticky top-16 z-30">
            <ComboBuilderPanel
              comboItems={comboItems}
              onRemoveItem={removeFromCombo}
              onClearCombo={clearCombo}
              onAddComboToCart={handleAddComboToCart}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ═══════ Added to Cart Toast ═══════ */}
      <AnimatePresence>
        {addedToCart && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            <span className="text-xs font-bold">Combo added to cart!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ Deal Grid ═══════ */}
      {filteredDeals.length > 0 ? (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
        >
          {filteredDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onToggleFavorite={toggleFavorite}
              isFavorite={favorites.has(deal.id)}
              onAddToCombo={addToCombo}
              onShowNutrition={setNutritionItem}
            />
          ))}
        </motion.div>
      ) : (
        <EmptyState onReset={resetFilters} />
      )}

      {/* ═══════ Nutrition Overlay ═══════ */}
      <AnimatePresence>
        {nutritionItem && (
          <NutritionalOverlay
            item={nutritionItem}
            onClose={() => setNutritionItem(null)}
          />
        )}
      </AnimatePresence>

      {/* ═══════ Quick Stats Footer ═══════ */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="r55-quick-stats grid grid-cols-3 gap-2"
      >
        {[
          { icon: Zap, label: 'Deals Today', value: MEAL_DEALS.length.toString(), color: 'text-amber-500' },
          { icon: Flame, label: 'Avg Savings', value: `${Math.round(MEAL_DEALS.reduce((s, d) => s + d.savingsPercent, 0) / MEAL_DEALS.length)}%`, color: 'text-red-500' },
          { icon: MapPin, label: 'Nearby Stores', value: `${new Set(MEAL_DEALS.map((d) => d.restaurant)).size}`, color: 'text-emerald-500' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border p-3 flex items-center gap-2"
          >
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
            <div>
              <p className="text-[9px] text-muted-foreground">{stat.label}</p>
              <p className="text-xs font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ═══════ Dietary Legend ═══════ */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex items-center justify-center gap-3 flex-wrap"
      >
        {[
          { icon: Leaf, label: 'Vegan', color: 'text-green-500' },
          { icon: WheatOff, label: 'GF', color: 'text-amber-500' },
          { icon: Beef, label: 'Keto', color: 'text-red-500' },
          { icon: Droplets, label: 'Low-Carb', color: 'text-blue-500' },
        ].map((legend) => (
          <div key={legend.label} className="flex items-center gap-1">
            <legend.icon className={`h-3 w-3 ${legend.color}`} />
            <span className="text-[9px] text-muted-foreground font-medium">{legend.label}</span>
          </div>
        ))}
      </motion.div>
    </motion.section>
  )
}
