'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UtensilsCrossed,
  CalendarDays,
  Sparkles,
  Plus,
  RotateCcw,
  Flame,
  Trash2,
  Leaf,
  ShoppingCart,
} from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { formatBRL } from '@/components/product/ProductCard'
import { resolveProductImage } from '@/lib/product-images'

/* ═══════════════════════════════════════════════════════════════
   Types & Interfaces
   ═══════════════════════════════════════════════════════════════ */

interface Product {
  id: string
  name: string
  store: string
  price: number
  image: string
  calories: number
}

type DayKey = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'
type MealType = 'cafe' | 'almoco' | 'lanche' | 'jantar'

interface MealSlot {
  id: string
  mealType: MealType
  product: Product | null
}

interface DayPlan {
  day: DayKey
  meals: MealSlot[]
}

interface WeeklySummary {
  totalMeals: number
  totalCost: number
  nutritionScore: number
}

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const DAY_CONFIG: { key: DayKey; label: string }[] = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' },
]

const MEAL_TYPES: { type: MealType; label: string; emoji: string }[] = [
  { type: 'cafe', label: 'Café da Manhã', emoji: '☀️' },
  { type: 'almoco', label: 'Almoço', emoji: '🍽️' },
  { type: 'lanche', label: 'Lanche', emoji: '🥪' },
  { type: 'jantar', label: 'Jantar', emoji: '🌙' },
]

const FALLBACK_PRODUCTS: Record<MealType, Product[]> = {
  cafe: [
    { id: 'fc1', name: 'Pão Francês com Manteiga', store: 'Padaria do Zé', price: 4.50, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop', calories: 220 },
    { id: 'fc2', name: 'Café Coado Carioca', store: 'Café Premium', price: 6.90, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop', calories: 85 },
    { id: 'fc3', name: 'Tapioca com Queijo', store: 'Tapioca da Vovó', price: 12.00, image: 'https://images.unsplash.com/photo-1621768807785-27852d2e8b8f?w=400&h=400&fit=crop', calories: 310 },
    { id: 'fc4', name: 'Vitamina de Banana', store: 'Suco Natural', price: 9.90, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop', calories: 195 },
  ],
  almoco: [
    { id: 'fa1', name: 'Feijoada Completa', store: 'Restaurante Sabor Mineiro', price: 32.90, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop', calories: 650 },
    { id: 'fa2', name: 'Frango Grelhado com Arroz', store: 'Grill & Co', price: 28.50, image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop', calories: 520 },
    { id: 'fa3', name: 'Moqueca Baiana', store: 'Sabores da Bahia', price: 35.00, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop', calories: 580 },
    { id: 'fa4', name: 'Prato Feito do Dia', store: 'Lanchonete do Povo', price: 22.00, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', calories: 480 },
  ],
  lanche: [
    { id: 'fl1', name: 'Coxinha Cremosa', store: 'Coxinha Express', price: 7.50, image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&h=400&fit=crop', calories: 180 },
    { id: 'fl2', name: 'Pão de Queijo (6 un)', store: 'Mineiro Lanches', price: 9.90, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop', calories: 290 },
    { id: 'fl3', name: 'Açaí 500ml', store: 'Açaí do Parque', price: 18.00, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop', calories: 340 },
    { id: 'fl4', name: 'Misto Quente', store: 'Padaria Pão Dourado', price: 8.00, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop', calories: 260 },
  ],
  jantar: [
    { id: 'fj1', name: 'Lasanha Bolonhesa', store: 'Trattoria Bella', price: 38.90, image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop', calories: 620 },
    { id: 'fj2', name: 'Sopa de Legumes', store: 'Sopão da Vovó', price: 16.50, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop', calories: 280 },
    { id: 'fj3', name: 'Peixe Grelhado', store: 'Peixaria do Porto', price: 42.00, image: 'https://images.unsplash.com/photo-1535140728325-a4d3707eee61?w=400&h=400&fit=crop', calories: 390 },
    { id: 'fj4', name: 'Strogonoff de Frango', store: 'Sabor Caseiro', price: 29.90, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop', calories: 510 },
  ],
}

const STORAGE_PREFIX = 'r67-meal-plan-'

function getStorageKey(day: DayKey): string {
  return `${STORAGE_PREFIX}${day}`
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function resolveMealImage(imageHint: string | undefined, _productName: string, _width: number, _height: number): string {
  // Try to build a valid image URL; fall back to Unsplash category default or placeholder
  if (!imageHint) return '/images/placeholder-product.svg'

  // If imageHint is already a full URL (http/https or starts with /), use it directly
  if (imageHint.startsWith('http') || imageHint.startsWith('/')) {
    return imageHint
  }

  // For legacy Cloudinary-style public IDs (e.g. 'breakfast/bread-butter'),
  // fall back to Unsplash food image via the generic FOOD category default
  return '/images/placeholder-product.svg'
}

function createEmptyDayPlan(day: DayKey): DayPlan {
  return {
    day,
    meals: MEAL_TYPES.map((mt) => ({
      id: `${day}-${mt.type}`,
      mealType: mt.type,
      product: null,
    })),
  }
}

function loadDayPlan(day: DayKey): DayPlan {
  if (typeof window === 'undefined') return createEmptyDayPlan(day)
  try {
    const raw = localStorage.getItem(getStorageKey(day))
    if (raw) {
      const parsed = JSON.parse(raw)
      return { day, meals: Array.isArray(parsed.meals) ? parsed.meals : createEmptyDayPlan(day).meals }
    }
  } catch {
    /* ignore corrupted data */
  }
  return createEmptyDayPlan(day)
}

function saveDayPlan(plan: DayPlan): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getStorageKey(plan.day), JSON.stringify({ meals: plan.meals }))
  } catch {
    /* storage full */
  }
}

function getTodayKey(): DayKey {
  const jsDay = new Date().getDay()
  const mapped: DayKey[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
  return mapped[jsDay]
}

function calculateSummary(weekPlan: Record<DayKey, DayPlan>): WeeklySummary {
  let totalMeals = 0
  let totalCost = 0
  let totalCalories = 0

  for (const dayKey of DAY_CONFIG.map((d) => d.key)) {
    const plan = weekPlan[dayKey]
    if (!plan) continue
    for (const meal of plan.meals) {
      if (meal.product) {
        totalMeals++
        totalCost += meal.product.price
        totalCalories += meal.product.calories
      }
    }
  }

  const maxCalories = 7 * 4 * 600
  const nutritionScore = maxCalories > 0 ? Math.min(100, Math.round((totalCalories / maxCalories) * 100)) : 0

  return { totalMeals, totalCost, nutritionScore }
}

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 24 },
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
}

const tabPillVariants = {
  inactive: { scale: 1 },
  active: {
    scale: 1.04,
    transition: { type: 'spring' as const, stiffness: 400, damping: 18 },
  },
}

const summaryPop = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 20 },
  },
}

/* ═══════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════ */

/* ── Skeleton Loader ── */
function PlannerSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl loading-skeleton" />
        <div className="flex-1">
          <div className="h-4 w-40 loading-skeleton rounded mb-1.5" />
          <div className="h-3 w-56 loading-skeleton rounded" />
        </div>
      </div>
      {/* Day tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-10 w-14 loading-skeleton rounded-xl" />
        ))}
      </div>
      {/* Summary bar skeleton */}
      <div className="h-20 loading-skeleton rounded-2xl" />
      {/* Meal sections skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-5 w-32 loading-skeleton rounded" />
          <div className="h-28 loading-skeleton rounded-xl" />
        </div>
      ))}
    </div>
  )
}

/* ── Weekly Summary Bar ── */
function SummaryBar({ summary }: { summary: WeeklySummary }) {
  return (
    <motion.div
      variants={summaryPop}
      initial="hidden"
      animate="visible"
      className="r67-summary-bar flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-card overflow-x-auto hide-scrollbar"
    >
      <div className="flex items-center gap-2 min-w-[90px]">
        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
          <UtensilsCrossed className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground leading-none">Refeições</p>
          <p className="text-sm font-bold tabular-nums">{summary.totalMeals}</p>
        </div>
      </div>

      <div className="w-px h-10 bg-border/50 shrink-0" />

      <div className="flex items-center gap-2 min-w-[110px]">
        <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
          <ShoppingCart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground leading-none">Custo total</p>
          <p className="text-sm font-bold tabular-nums">{formatBRL(summary.totalCost)}</p>
        </div>
      </div>

      <div className="w-px h-10 bg-border/50 shrink-0" />

      <div className="flex items-center gap-2 min-w-[90px]">
        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <Leaf className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground leading-none">Nutrição</p>
          <div className="flex items-center gap-1">
            <p className="text-sm font-bold tabular-nums">{summary.nutritionScore}</p>
            <span className="text-[9px] text-muted-foreground">/100</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Empty State ── */
function EmptyState({ mealLabel }: { mealLabel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
      className="r67-empty-state flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-border/60 bg-muted/20"
    >
      <motion.span
        className="text-4xl mb-2"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        🍽️
      </motion.span>
      <p className="text-xs font-semibold text-muted-foreground text-center">
        Nenhuma refeição planejada
      </p>
      <p className="text-[10px] text-muted-foreground/70 text-center mt-0.5">
        Adicione opções para {mealLabel}
      </p>
    </motion.div>
  )
}

/* ── Product Suggestion Card ── */
function ProductCard({
  product,
  onAdd,
  onDismiss,
}: {
  product: Product
  onAdd: () => void
  onDismiss: () => void
}) {
  const [imgSrc] = useState(() => resolveMealImage(product.image, product.name, 120, 120))
  const [added, setAdded] = useState(false)

  const handleAdd = useCallback(() => {
    setAdded(true)
    onAdd()
    setTimeout(() => setAdded(false), 1200)
  }, [onAdd])

  return (
    <motion.div
      variants={cardVariants}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 200, transition: { duration: 0.25 } }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80) onDismiss()
      }}
      className="r67-meal-card r62-card-lift relative flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-card group"
    >
      {/* Swipe indicator */}
      <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <Trash2 className="h-4 w-4 text-red-400" />
      </div>

      {/* Product Image */}
      <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0 bg-muted">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-2xl">
            🍲
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold truncate leading-tight">{product.name}</p>
        <p className="text-[9px] text-muted-foreground truncate mt-0.5">{product.store}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-bold text-primary tabular-nums">
            {formatBRL(product.price)}
          </span>
          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
            <Flame className="h-2.5 w-2.5 text-orange-400" />
            {product.calories} kcal
          </span>
        </div>
      </div>

      {/* Add Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={handleAdd}
        className={`min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95 transition-transform ${
          added
            ? 'bg-emerald-500 text-white'
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        }`}
      >
        {added ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
          >
            ✓
          </motion.span>
        ) : (
          <Plus className="h-5 w-5" />
        )}
      </motion.button>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export function WeeklyMealPlanner() {
  const [selectedDay, setSelectedDay] = useState<DayKey>(getTodayKey)
  const [weekPlan, setWeekPlan] = useState<Record<DayKey, DayPlan>>(() => {
    const initial: Record<DayKey, DayPlan> = {} as Record<DayKey, DayPlan>
    for (const { key } of DAY_CONFIG) {
      initial[key] = createEmptyDayPlan(key)
    }
    return initial
  })
  const [isLoading, setIsLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<Record<MealType, Product[]>>(FALLBACK_PRODUCTS)
  const tabsScrollRef = useRef<HTMLDivElement>(null)

  const todayKey = getTodayKey()

  /* ── Load saved plans from localStorage ── */
  useEffect(() => {
    let cancelled = false

    const timer = setTimeout(() => {
      if (cancelled) return
      const loaded: Record<DayKey, DayPlan> = {} as Record<DayKey, DayPlan>
      for (const { key } of DAY_CONFIG) {
        loaded[key] = loadDayPlan(key)
      }
      setWeekPlan(loaded)
      setIsLoading(false)
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  /* ── Fetch suggestions from API (fallback to hardcoded) ── */
  useEffect(() => {
    let cancelled = false

    cachedFetch<{ products: Product[] }>('/api/products?category=FOOD&limit=16&sort=popular')
      .then((data) => {
        if (cancelled || !data?.products?.length) return

        const products = data.products
        const mapped: Record<MealType, Product[]> = {
          cafe: products.slice(0, 4).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
            store: (p.storeName as string) || '',
            price: Number(p.price) || 0,
            image: resolveProductImage({ slug: p.slug as string, category: p.category as string, images: p.images as string }) || '',
            calories: Math.round((Number(p.price) || 10) * 18),
          })),
          almoco: products.slice(4, 8).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
            store: (p.storeName as string) || '',
            price: Number(p.price) || 0,
            image: resolveProductImage({ slug: p.slug as string, category: p.category as string, images: p.images as string }) || '',
            calories: Math.round((Number(p.price) || 10) * 18),
          })),
          lanche: products.slice(8, 12).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
            store: (p.storeName as string) || '',
            price: Number(p.price) || 0,
            image: resolveProductImage({ slug: p.slug as string, category: p.category as string, images: p.images as string }) || '',
            calories: Math.round((Number(p.price) || 10) * 18),
          })),
          jantar: products.slice(12, 16).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
            store: (p.storeName as string) || '',
            price: Number(p.price) || 0,
            image: resolveProductImage({ slug: p.slug as string, category: p.category as string, images: p.images as string }) || '',
            calories: Math.round((Number(p.price) || 10) * 18),
          })),
        }

        setSuggestions(mapped)
      })
      .catch(() => {
        /* keep fallback products */
      })

    return () => { cancelled = true }
  }, [])

  /* ── Persist day plan ── */
  useEffect(() => {
    if (isLoading) return
    saveDayPlan(weekPlan[selectedDay])
  }, [weekPlan, selectedDay, isLoading])

  /* ── Scroll active tab into view ── */
  useEffect(() => {
    const idx = DAY_CONFIG.findIndex((d) => d.key === selectedDay)
    const container = tabsScrollRef.current
    if (!container) return
    const tabEl = container.children[idx] as HTMLElement | undefined
    tabEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedDay])

  /* ── Derived state ── */
  const currentDayPlan = weekPlan[selectedDay]
  const summary = useMemo(() => calculateSummary(weekPlan), [weekPlan])

  /* ── Handlers ── */
  const addMeal = useCallback(
    (mealType: MealType, product: Product) => {
      setWeekPlan((prev) => {
        const updated = { ...prev }
        const dayCopy = { ...updated[selectedDay], meals: [...updated[selectedDay].meals] }
        const slotIdx = dayCopy.meals.findIndex((m) => m.mealType === mealType)
        if (slotIdx >= 0) {
          dayCopy.meals[slotIdx] = { ...dayCopy.meals[slotIdx], product }
        }
        updated[selectedDay] = dayCopy
        return updated
      })
    },
    [selectedDay]
  )

  const removeMeal = useCallback(
    (mealType: MealType) => {
      setWeekPlan((prev) => {
        const updated = { ...prev }
        const dayCopy = { ...updated[selectedDay], meals: [...updated[selectedDay].meals] }
        const slotIdx = dayCopy.meals.findIndex((m) => m.mealType === mealType)
        if (slotIdx >= 0) {
          dayCopy.meals[slotIdx] = { ...dayCopy.meals[slotIdx], product: null }
        }
        updated[selectedDay] = dayCopy
        return updated
      })
    },
    [selectedDay]
  )

  const autoFillDay = useCallback(() => {
    setWeekPlan((prev) => {
      const updated = { ...prev }
      const dayCopy = { ...updated[selectedDay], meals: [...updated[selectedDay].meals] }
      for (const meal of dayCopy.meals) {
        if (!meal.product) {
          const pool = suggestions[meal.mealType]
          if (pool.length > 0) {
            const pick = pool[Math.floor(Math.random() * pool.length)]
            meal.product = { ...pick }
          }
        }
      }
      updated[selectedDay] = dayCopy
      return updated
    })
  }, [selectedDay, suggestions])

  const clearDay = useCallback(() => {
    setWeekPlan((prev) => {
      const updated = { ...prev }
      updated[selectedDay] = createEmptyDayPlan(selectedDay)
      return updated
    })
  }, [selectedDay])

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <section className="w-full" aria-label="Planejador de Refeições Semanal">
        <PlannerSkeleton />
      </section>
    )
  }

  return (
    <section className="w-full" aria-label="Planejador de Refeições Semanal">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
            <CalendarDays className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight r62-heading-gradient">
              Planejador Semanal
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Organize suas refeições da semana
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={autoFillDay}
          className="min-h-[44px] min-w-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-95 transition-transform"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-[11px] font-semibold hidden sm:inline">Sugestão IA</span>
        </motion.button>
      </motion.div>

      {/* Day Tabs */}
      <motion.div
        ref={tabsScrollRef}
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="r62-scroll-snap flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-3"
      >
        {DAY_CONFIG.map(({ key, label }) => {
          const isActive = key === selectedDay
          const isToday = key === todayKey
          const dayPlan = weekPlan[key]
          const mealCount = dayPlan?.meals.filter((m) => m.product).length ?? 0

          return (
            <motion.button
              key={key}
              type="button"
              variants={tabPillVariants}
              animate={isActive ? 'active' : 'inactive'}
              whileTap={{ scale: 0.92 }}
              onClick={() => setSelectedDay(key)}
              className={`r67-meal-tab shrink-0 flex flex-col items-center gap-0.5 min-h-[44px] min-w-[52px] px-3 py-2 rounded-xl border transition-all active:scale-95 transition-transform cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              <span className="text-[11px] font-bold leading-none">{label}</span>
              {isToday && (
                <span className="text-[7px] font-bold uppercase leading-none opacity-80">
                  Hoje
                </span>
              )}
              {mealCount > 0 && (
                <span
                  className={`text-[8px] font-bold leading-none ${
                    isActive ? 'text-primary-foreground/80' : 'text-primary'
                  }`}
                >
                  {mealCount}/4
                </span>
              )}
            </motion.button>
          )
        })}
      </motion.div>

      {/* Weekly Summary Bar */}
      <SummaryBar summary={summary} />

      {/* Meal Sections */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5 mt-4"
      >
        {MEAL_TYPES.map(({ type, label, emoji }) => {
          const slot = currentDayPlan?.meals.find((m) => m.mealType === type)
          const hasProduct = slot?.product !== null && slot?.product !== undefined
          const availableProducts = suggestions[type] ?? []

          return (
            <motion.div key={type} variants={fadeInUp}>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{emoji}</span>
                  <h3 className="text-sm font-bold">{label}</h3>
                  {hasProduct && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                      className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full"
                    >
                      ✓ Planejado
                    </motion.span>
                  )}
                </div>
                {hasProduct && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeMeal(type)}
                    className="min-h-[44px] min-w-[44px] h-8 flex items-center gap-1 px-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors active:scale-95 transition-transform"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold">Trocar</span>
                  </motion.button>
                )}
              </div>

              {/* Planned Product or Empty / Suggestions */}
              <AnimatePresence mode="wait">
                {hasProduct && slot!.product ? (
                  <ProductCard
                    key={`planned-${slot!.product.id}`}
                    product={slot!.product}
                    onAdd={() => {}}
                    onDismiss={() => removeMeal(type)}
                  />
                ) : (
                  <motion.div key={`suggestions-${type}`}>
                    <EmptyState mealLabel={label} />

                    {/* Suggestion cards */}
                    <div className="space-y-2 mt-2">
                      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 px-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        Sugestões para você
                      </p>
                      <AnimatePresence>
                        {availableProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onAdd={() => addMeal(type, product)}
                            onDismiss={() => {}}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Clear Day Button */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="mt-6 flex justify-center"
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={clearDay}
          className="min-h-[44px] min-w-[44px] flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 text-muted-foreground hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all active:scale-95 transition-transform"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="text-[11px] font-semibold">Limpar dia {DAY_CONFIG.find((d) => d.key === selectedDay)?.label}</span>
        </motion.button>
      </motion.div>
    </section>
  )
}
