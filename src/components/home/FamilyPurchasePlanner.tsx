'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UtensilsCrossed,
  CalendarDays,
  Sparkles,
  ShoppingCart,
  Wallet,
  Users,
  Flame,
  ChefHat,
  Share2,
  RotateCcw,
  Check,
  Plus,
  ChevronRight,
  Clock,
  Leaf,
  WheatOff,
  Heart,
  Loader2,
  X,
  Star,
  Timer,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

/* ── Types ── */

type MealType = 'cafe' | 'almoco' | 'jantar'

interface MealOption {
  id: string
  name: string
  emoji: string
  calories: number
  protein: number
  carbs: number
  cost: number
  isVegetarian: boolean
  isGlutenFree: boolean
  ingredients: string[]
  store: string
  category: string
}

interface MealSlot {
  day: number
  meal: MealType
  option: MealOption | null
}

interface FamilyMember {
  id: string
  name: string
  avatar: string
  color: string
  servings: number
  isVegetarian: boolean
  isGlutenFree: boolean
}

interface ShoppingItem {
  id: string
  name: string
  emoji: string
  quantity: number
  unit: string
  estimatedCost: number
  checked: boolean
  store: string
  category: string
}

interface SavedWeek {
  id: string
  label: string
  date: string
  meals: MealSlot[]
  totalCost: number
}

interface RecipeSuggestion {
  id: string
  name: string
  emoji: string
  difficulty: 'Fácil' | 'Médio' | 'Difícil'
  time: string
  calories: number
  ingredients: string[]
  matchedMeals: string[]
}

interface NutritionRingData {
  label: string
  value: number
  max: number
  color: string
  unit: string
}

interface PlannerState {
  meals: MealSlot[]
  budget: number
  shoppingChecked: Record<string, boolean>
  savedWeeks: SavedWeek[]
}

/* ── Constants ── */

const STORAGE_KEY = 'domplace-family-purchase-planner'

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const
const FULL_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const
const MEAL_LABELS: Record<MealType, { label: string; emoji: string }> = {
  cafe: { label: 'Café', emoji: '☕' },
  almoco: { label: 'Almoço', emoji: '🍽️' },
  jantar: { label: 'Jantar', emoji: '🌙' },
}

const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'fm1', name: 'Mãe (Ana)', avatar: '', color: 'bg-rose-500', servings: 2, isVegetarian: false, isGlutenFree: false },
  { id: 'fm2', name: 'Pai (Carlos)', avatar: '', color: 'bg-sky-500', servings: 2, isVegetarian: false, isGlutenFree: false },
  { id: 'fm3', name: 'Filha (Maria)', avatar: '', color: 'bg-violet-500', servings: 1, isVegetarian: true, isGlutenFree: false },
  { id: 'fm4', name: 'Filho (João)', avatar: '', color: 'bg-amber-500', servings: 1, isVegetarian: false, isGlutenFree: true },
]

const ALL_MEAL_OPTIONS: MealOption[] = [
  // Café da manhã
  { id: 'c1', name: 'Pão com Queijo', emoji: '🧀🥖', calories: 320, protein: 12, carbs: 45, cost: 8, isVegetarian: true, isGlutenFree: false, ingredients: ['Pão francês', 'Queijo mussarela', 'Manteiga'], store: 'Padaria', category: 'Padaria' },
  { id: 'c2', name: 'Tapioca com Coco', emoji: '🫓🥥', calories: 280, protein: 6, carbs: 42, cost: 10, isVegetarian: true, isGlutenFree: true, ingredients: ['Tapioca', 'Coco ralado', 'Leite de coco'], store: 'Mercado', category: 'Cereais' },
  { id: 'c3', name: 'Aveia com Frutas', emoji: '🥣🍓', calories: 250, protein: 8, carbs: 38, cost: 12, isVegetarian: true, isGlutenFree: true, ingredients: ['Aveia', 'Morango', 'Banana', 'Mel'], store: 'Mercado', category: 'Cereais' },
  { id: 'c4', name: 'Café com Bolo', emoji: '☕🍰', calories: 350, protein: 5, carbs: 50, cost: 9, isVegetarian: true, isGlutenFree: false, ingredients: ['Café', 'Bolo de milho', 'Açúcar'], store: 'Padaria', category: 'Padaria' },
  { id: 'c5', name: 'Vitamina de Banana', emoji: '🍌🥛', calories: 220, protein: 7, carbs: 35, cost: 7, isVegetarian: true, isGlutenFree: true, ingredients: ['Banana', 'Leite', 'Aveia', 'Cacau'], store: 'Mercado', category: 'Bebidas' },
  { id: 'c6', name: 'Omelete com Pão', emoji: '🍳🥖', calories: 380, protein: 18, carbs: 30, cost: 11, isVegetarian: true, isGlutenFree: false, ingredients: ['Ovos', 'Queijo', 'Tomate', 'Pão'], store: 'Mercado', category: 'Ovos' },
  { id: 'c7', name: 'Iogurte com Granola', emoji: '🥛🥣', calories: 260, protein: 10, carbs: 40, cost: 14, isVegetarian: true, isGlutenFree: false, ingredients: ['Iogurte natural', 'Granola', 'Mel'], store: 'Mercado', category: 'Laticínios' },
  // Almoço
  { id: 'a1', name: 'Arroz, Feijão e Frango', emoji: '🍗🍚', calories: 650, protein: 35, carbs: 75, cost: 22, isVegetarian: false, isGlutenFree: true, ingredients: ['Arroz', 'Feijão', 'Peito de frango', 'Salada'], store: 'Mercado', category: 'Carnes' },
  { id: 'a2', name: 'Macarrão ao Pesto', emoji: '🍝🌿', calories: 580, protein: 16, carbs: 70, cost: 18, isVegetarian: true, isGlutenFree: false, ingredients: ['Macarrão', 'Manjericão', 'Queijo parmesão', 'Alho'], store: 'Mercado', category: 'Massas' },
  { id: 'a3', name: 'Moqueca de Peixe', emoji: '🐟🍅', calories: 520, protein: 32, carbs: 40, cost: 28, isVegetarian: false, isGlutenFree: true, ingredients: ['Peixe', 'Tomate', 'Pimentão', 'Leite de coco'], store: 'Peixaria', category: 'Peixes' },
  { id: 'a4', name: 'Strogonoff', emoji: '🥘🥩', calories: 620, protein: 30, carbs: 55, cost: 25, isVegetarian: false, isGlutenFree: true, ingredients: ['Carne', 'Creme de leite', 'Molho de tomate', 'Batata palha'], store: 'Mercado', category: 'Carnes' },
  { id: 'a5', name: 'Salada Caesar', emoji: '🥗🥬', calories: 350, protein: 18, carbs: 25, cost: 16, isVegetarian: true, isGlutenFree: true, ingredients: ['Alface', 'Peito de frango', 'Queijo parmesão', 'Crouton'], store: 'Hortifruti', category: 'Saladas' },
  { id: 'a6', name: 'Baião de Dois', emoji: '🍲🧀', calories: 600, protein: 28, carbs: 65, cost: 20, isVegetarian: false, isGlutenFree: true, ingredients: ['Arroz', 'Feijão', 'Queijo coalho', 'Carne seca'], store: 'Mercado', category: 'Cereais' },
  { id: 'a7', name: 'Risoto de Cogumelos', emoji: '🍄🍚', calories: 480, protein: 14, carbs: 60, cost: 24, isVegetarian: true, isGlutenFree: true, ingredients: ['Arroz arbóreo', 'Cogumelos', 'Queijo', 'Cebola'], store: 'Mercado', category: 'Cereais' },
  // Jantar
  { id: 'j1', name: 'Sopa de Legumes', emoji: '🥣🥕', calories: 280, protein: 10, carbs: 40, cost: 12, isVegetarian: true, isGlutenFree: true, ingredients: ['Cenoura', 'Batata', 'Mandioca', 'Abóbora', 'Couve'], store: 'Hortifruti', category: ' sopas' },
  { id: 'j2', name: 'Wrap de Frango', emoji: '🌯🍗', calories: 420, protein: 25, carbs: 35, cost: 15, isVegetarian: false, isGlutenFree: false, ingredients: ['Tortilha', 'Peito de frango', 'Alface', 'Tomate', 'Creme'], store: 'Mercado', category: 'Lanches' },
  { id: 'j3', name: 'Lasanha Vegetariana', emoji: '🥘🥬', calories: 450, protein: 18, carbs: 50, cost: 20, isVegetarian: true, isGlutenFree: false, ingredients: ['Massa', 'Berinjela', 'Espinafre', 'Queijo', 'Molho'], store: 'Mercado', category: 'Massas' },
  { id: 'j4', name: 'Peixe Grelhado', emoji: '🐟🥦', calories: 380, protein: 30, carbs: 20, cost: 26, isVegetarian: false, isGlutenFree: true, ingredients: ['Filé de peixe', 'Brócolis', 'Limão', 'Azeite'], store: 'Peixaria', category: 'Peixes' },
  { id: 'j5', name: 'Tacos', emoji: '🌮🥩', calories: 400, protein: 22, carbs: 38, cost: 18, isVegetarian: false, isGlutenFree: true, ingredients: ['Carne moída', 'Tortilha de milho', 'Guacamole', 'Tomate'], store: 'Mercado', category: 'Carnes' },
  { id: 'j6', name: 'Omelete Completa', emoji: '🍳🥬', calories: 350, protein: 20, carbs: 15, cost: 14, isVegetarian: true, isGlutenFree: true, ingredients: ['Ovos', 'Queijo', 'Tomate', 'Cebola', 'Pimentão'], store: 'Mercado', category: 'Ovos' },
  { id: 'j7', name: 'Caldo Verde', emoji: '🍲🥬', calories: 300, protein: 12, carbs: 35, cost: 10, isVegetarian: false, isGlutenFree: true, ingredients: ['Batata', 'Couve', 'Linguiça calabresa', 'Alho'], store: 'Mercado', category: 'Sopas' },
]

const PREVIOUS_WEEKS: SavedWeek[] = [
  {
    id: 'sw1',
    label: 'Semana passada',
    date: '24 Jun – 30 Jun',
    meals: [
      { day: 0, meal: 'cafe', option: ALL_MEAL_OPTIONS[0] },
      { day: 0, meal: 'almoco', option: ALL_MEAL_OPTIONS[7] },
      { day: 0, meal: 'jantar', option: ALL_MEAL_OPTIONS[14] },
      { day: 1, meal: 'cafe', option: ALL_MEAL_OPTIONS[2] },
      { day: 1, meal: 'almoco', option: ALL_MEAL_OPTIONS[8] },
      { day: 1, meal: 'jantar', option: ALL_MEAL_OPTIONS[15] },
      { day: 2, meal: 'cafe', option: ALL_MEAL_OPTIONS[4] },
      { day: 2, meal: 'almoco', option: ALL_MEAL_OPTIONS[9] },
      { day: 2, meal: 'jantar', option: ALL_MEAL_OPTIONS[16] },
      { day: 3, meal: 'cafe', option: ALL_MEAL_OPTIONS[1] },
      { day: 3, meal: 'almoco', option: ALL_MEAL_OPTIONS[10] },
      { day: 3, meal: 'jantar', option: ALL_MEAL_OPTIONS[17] },
      { day: 4, meal: 'cafe', option: ALL_MEAL_OPTIONS[3] },
      { day: 4, meal: 'almoco', option: ALL_MEAL_OPTIONS[7] },
      { day: 4, meal: 'jantar', option: ALL_MEAL_OPTIONS[14] },
      { day: 5, meal: 'cafe', option: ALL_MEAL_OPTIONS[5] },
      { day: 5, meal: 'almoco', option: ALL_MEAL_OPTIONS[11] },
      { day: 5, meal: 'jantar', option: ALL_MEAL_OPTIONS[18] },
      { day: 6, meal: 'cafe', option: ALL_MEAL_OPTIONS[6] },
      { day: 6, meal: 'almoco', option: ALL_MEAL_OPTIONS[12] },
      { day: 6, meal: 'jantar', option: ALL_MEAL_OPTIONS[19] },
    ],
    totalCost: 345,
  },
  {
    id: 'sw2',
    label: '2 semanas atrás',
    date: '17 Jun – 23 Jun',
    meals: [
      { day: 0, meal: 'cafe', option: ALL_MEAL_OPTIONS[3] },
      { day: 0, meal: 'almoco', option: ALL_MEAL_OPTIONS[9] },
      { day: 0, meal: 'jantar', option: ALL_MEAL_OPTIONS[16] },
      { day: 1, meal: 'cafe', option: ALL_MEAL_OPTIONS[0] },
      { day: 1, meal: 'almoco', option: ALL_MEAL_OPTIONS[7] },
      { day: 1, meal: 'jantar', option: ALL_MEAL_OPTIONS[14] },
      { day: 2, meal: 'cafe', option: ALL_MEAL_OPTIONS[5] },
      { day: 2, meal: 'almoco', option: ALL_MEAL_OPTIONS[10] },
      { day: 2, meal: 'jantar', option: ALL_MEAL_OPTIONS[17] },
      { day: 3, meal: 'cafe', option: ALL_MEAL_OPTIONS[2] },
      { day: 3, meal: 'almoco', option: ALL_MEAL_OPTIONS[8] },
      { day: 3, meal: 'jantar', option: ALL_MEAL_OPTIONS[15] },
      { day: 4, meal: 'cafe', option: ALL_MEAL_OPTIONS[6] },
      { day: 4, meal: 'almoco', option: ALL_MEAL_OPTIONS[11] },
      { day: 4, meal: 'jantar', option: ALL_MEAL_OPTIONS[18] },
      { day: 5, meal: 'cafe', option: ALL_MEAL_OPTIONS[4] },
      { day: 5, meal: 'almoco', option: ALL_MEAL_OPTIONS[12] },
      { day: 5, meal: 'jantar', option: ALL_MEAL_OPTIONS[19] },
      { day: 6, meal: 'cafe', option: ALL_MEAL_OPTIONS[1] },
      { day: 6, meal: 'almoco', option: ALL_MEAL_OPTIONS[13] },
      { day: 6, meal: 'jantar', option: ALL_MEAL_OPTIONS[17] },
    ],
    totalCost: 378,
  },
]

const RECIPE_SUGGESTIONS: RecipeSuggestion[] = [
  { id: 'r1', name: 'Bolo de Cenoura Fit', emoji: '🥕🍰', difficulty: 'Fácil', time: '40 min', calories: 180, ingredients: ['Cenoura', 'Ovos', 'Aveia', 'Cacau'], matchedMeals: ['Café com Bolo', 'Aveia com Frutas'] },
  { id: 'r2', name: 'Frango desfiado na Crockpot', emoji: '🍗⏰', difficulty: 'Fácil', time: '4h', calories: 280, ingredients: ['Peito de frango', 'Cebola', 'Alho', 'Especiarias'], matchedMeals: ['Arroz, Feijão e Frango', 'Wrap de Frango'] },
  { id: 'r3', name: 'Pão de Queijo Zero Glúten', emoji: '🧀🥖', difficulty: 'Médio', time: '50 min', calories: 220, ingredients: ['Polvilho doce', 'Queijo', 'Ovos', 'Leite'], matchedMeals: ['Pão com Queijo', 'Tapioca com Coco'] },
]

/* ── Animation Variants ── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
    },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 24,
    },
  },
}

const cardEntrance = {
  hidden: { opacity: 0, scale: 0.8, rotateX: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 320,
      damping: 20,
    },
  },
}

const progressFill = {
  hidden: { scaleX: 0 },
  visible: (width: number) => ({
    scaleX: Math.min(width, 1),
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 18,
      delay: 0.2,
    },
  }),
}

/* ── Helpers ── */

function createEmptyMeals(): MealSlot[] {
  const meals: MealSlot[] = []
  for (let d = 0; d < 7; d++) {
    for (const meal of ['cafe', 'almoco', 'jantar'] as const) {
      meals.push({ day: d, meal, option: null })
    }
  }
  return meals
}

function getMealOptionsForType(mealType: MealType): MealOption[] {
  return ALL_MEAL_OPTIONS.filter((o) => {
    if (mealType === 'cafe') return ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'].includes(o.id)
    if (mealType === 'almoco') return ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'].includes(o.id)
    return ['j1', 'j2', 'j3', 'j4', 'j5', 'j6', 'j7'].includes(o.id)
  })
}

function generateRandomPlan(): MealSlot[] {
  const meals = createEmptyMeals()
  const cafeOptions = getMealOptionsForType('cafe')
  const almocoOptions = getMealOptionsForType('almoco')
  const jantarOptions = getMealOptionsForType('jantar')

  return meals.map((slot) => {
    const pool = slot.meal === 'cafe'
      ? cafeOptions
      : slot.meal === 'almoco'
        ? almocoOptions
        : jantarOptions
    const random = pool[Math.floor(Math.random() * pool.length)]
    return { ...slot, option: random }
  })
}

function buildShoppingList(meals: MealSlot[]): ShoppingItem[] {
  const ingredientMap: Record<string, { emoji: string; qty: number; store: string; category: string; unitCost: number }> = {}
  let itemIndex = 0

  meals.forEach((slot) => {
    if (!slot.option) return
    slot.option.ingredients.forEach((ing) => {
      const key = ing.toLowerCase()
      if (!ingredientMap[key]) {
        ingredientMap[key] = {
          emoji: getIngredientEmoji(ing),
          qty: 0,
          store: slot.option!.store,
          category: slot.option!.category,
          unitCost: +(slot.option!.cost / slot.option!.ingredients.length).toFixed(2),
        }
      }
      ingredientMap[key].qty += 1
    })
  })

  return Object.entries(ingredientMap).map(([name, data]) => ({
    id: `si-${itemIndex++}-${name.slice(0, 8)}`,
    name,
    emoji: data.emoji,
    quantity: data.qty,
    unit: data.qty > 1 ? 'un' : 'un',
    estimatedCost: +(data.unitCost * data.qty).toFixed(2),
    checked: false,
    store: data.store,
    category: data.category,
  }))
}

function getIngredientEmoji(ingredient: string): string {
  const lower = ingredient.toLowerCase()
  if (lower.includes('arroz')) return '🍚'
  if (lower.includes('feijão') || lower.includes('feijao')) return '🫘'
  if (lower.includes('frango')) return '🍗'
  if (lower.includes('carne') || lower.includes('boi')) return '🥩'
  if (lower.includes('peixe')) return '🐟'
  if (lower.includes('ovo')) return '🥚'
  if (lower.includes('queijo')) return '🧀'
  if (lower.includes('leite')) return '🥛'
  if (lower.includes('pão') || lower.includes('pao') || lower.includes('tortilha')) return '🥖'
  if (lower.includes('macarr') || lower.includes('massa')) return '🍝'
  if (lower.includes('tomate')) return '🍅'
  if (lower.includes('cebola')) return '🧅'
  if (lower.includes('alho')) return '🧄'
  if (lower.includes('batata')) return '🥔'
  if (lower.includes('cenoura')) return '🥕'
  if (lower.includes('alface') || lower.includes('couve') || lower.includes('espinafre') || lower.includes('berinjela') || lower.includes('brócolis')) return '🥬'
  if (lower.includes('banana')) return '🍌'
  if (lower.includes('morango')) return '🍓'
  if (lower.includes('coco')) return '🥥'
  if (lower.includes('aveia') || lower.includes('granola')) return '🥣'
  if (lower.includes('mel')) return '🍯'
  if (lower.includes('café') || lower.includes('cafe') || lower.includes('cacau')) return '☕'
  if (lower.includes('azeite')) return '🫒'
  if (lower.includes('limão') || lower.includes('limao')) return '🍋'
  if (lower.includes('piment')) return '🌶️'
  if (lower.includes('iogurte')) return '🥛'
  if (lower.includes('cogumel')) return '🍄'
  if (lower.includes('abóbora') || lower.includes('mandioca')) return '🎃'
  if (lower.includes('molho')) return '🥫'
  return '🛒'
}

function getDifficultyColor(d: string): string {
  if (d === 'Fácil') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  if (d === 'Médio') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
}

function getDifficultyStars(d: string): number {
  if (d === 'Fácil') return 1
  if (d === 'Médio') return 2
  return 3
}

/* ── localStorage persistence ── */

function loadPlannerState(): PlannerState {
  if (typeof window === 'undefined') {
    return { meals: createEmptyMeals(), budget: 400, shoppingChecked: {}, savedWeeks: PREVIOUS_WEEKS }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    void 0
  }
  return { meals: createEmptyMeals(), budget: 400, shoppingChecked: {}, savedWeeks: PREVIOUS_WEEKS }
}

function savePlannerState(state: PlannerState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    void 0
  }
}

/* ── Sub-components ── */

function CircularProgressRing({ percentage, color, size = 64, strokeWidth = 5 }: { percentage: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedPct = Math.min(Math.max(percentage, 0), 100)
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(128,128,128,0.15)"
          strokeWidth={strokeWidth}
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
          animate={{ strokeDashoffset }}
          transition={{ type: 'spring' as const, stiffness: 120, damping: 18 }}
        />
      </svg>
    </div>
  )
}

function NutritionSummaryRing({ data }: { data: NutritionRingData }) {
  return (
    <div className="r49-nutrition-ring flex flex-col items-center gap-1.5">
      <CircularProgressRing percentage={(data.value / data.max) * 100} color={data.color} size={60} strokeWidth={5} />
      <div className="absolute flex flex-col items-center justify-center" style={{ width: 60, height: 60 }}>
        <span className="text-sm font-extrabold tabular-nums">{data.value}</span>
        <span className="text-[8px] text-muted-foreground">{data.unit}</span>
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground">{data.label}</span>
    </div>
  )
}

/* ── Main Component ── */

export default function FamilyPurchasePlanner() {
  const [state, setState] = useState<PlannerState>(loadPlannerState)
  const [selectedDay, setSelectedDay] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('planner')
  const [mounted, setMounted] = useState(false)
  const [generationKey, setGenerationKey] = useState(0)

  /* ── Hydration guard ── */
  useEffect(() => {
    setMounted(true)
    const loaded = loadPlannerState()
    setState(loaded)
  }, [])

  /* ── Persist state ── */
  useEffect(() => {
    if (mounted) savePlannerState(state)
  }, [mounted, state])

  /* ── Computed values ── */
  const filledSlots = useMemo(() => state.meals.filter((m) => m.option !== null).length, [state.meals])

  const totalWeeklyCost = useMemo(() => {
    const totalServings = FAMILY_MEMBERS.reduce((sum, m) => sum + m.servings, 0)
    return Math.round(state.meals.reduce((sum, m) => sum + (m.option?.cost ?? 0), 0) * (totalServings / 4))
  }, [state.meals])

  const budgetPercent = useMemo(
    () => (state.budget > 0 ? (totalWeeklyCost / state.budget) * 100 : 0),
    [totalWeeklyCost, state.budget]
  )

  const budgetRemaining = useMemo(() => Math.max(state.budget - totalWeeklyCost, 0), [state.budget, totalWeeklyCost])

  const shoppingItems = useMemo(() => buildShoppingList(state.meals), [state.meals])

  const shoppingTotal = useMemo(
    () => shoppingItems.reduce((sum, item) => sum + item.estimatedCost, 0),
    [shoppingItems]
  )

  const shoppingCheckedItems = useMemo(
    () => shoppingItems.filter((item) => state.shoppingChecked[item.id]).length,
    [shoppingItems, state.shoppingChecked]
  )

  const groupedShopping = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {}
    shoppingItems.forEach((item) => {
      const key = `${item.store}|${item.category}`
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    return groups
  }, [shoppingItems])

  const totalCalories = useMemo(
    () => state.meals.reduce((sum, m) => sum + (m.option?.calories ?? 0), 0),
    [state.meals]
  )

  const totalProtein = useMemo(
    () => state.meals.reduce((sum, m) => sum + (m.option?.protein ?? 0), 0),
    [state.meals]
  )

  const totalCarbs = useMemo(
    () => state.meals.reduce((sum, m) => sum + (m.option?.carbs ?? 0), 0),
    [state.meals]
  )

  const nutritionRings: NutritionRingData[] = useMemo(() => [
    { label: 'Calorias', value: totalCalories, max: 14000, color: '#f97316', unit: 'kcal' },
    { label: 'Proteína', value: totalProtein, max: 500, color: '#22c55e', unit: 'g' },
    { label: 'Carboidratos', value: totalCarbs, max: 1800, color: '#3b82f6', unit: 'g' },
  ], [totalCalories, totalProtein, totalCarbs])

  const matchedRecipes = useMemo(() => {
    const usedNames = new Set(state.meals.filter((m) => m.option).map((m) => m.option!.name))
    return RECIPE_SUGGESTIONS
      .filter((r) => r.matchedMeals.some((m) => usedNames.has(m)))
      .slice(0, 3)
  }, [state.meals])

  const todayIndex = useMemo(() => {
    const d = new Date().getDay()
    return d
  }, [])

  /* ── Handlers ── */
  const handleSelectMeal = useCallback((day: number, meal: MealType, option: MealOption | null) => {
    setState((prev) => ({
      ...prev,
      meals: prev.meals.map((m) =>
        m.day === day && m.meal === meal ? { ...m, option } : m
      ),
    }))
  }, [])

  const handleAutoGenerate = useCallback(() => {
    setIsGenerating(true)
    setTimeout(() => {
      const newPlan = generateRandomPlan()
      setState((prev) => ({ ...prev, meals: newPlan }))
      setGenerationKey((k) => k + 1)
      setIsGenerating(false)
    }, 1200)
  }, [])

  const handleReuseWeek = useCallback((week: SavedWeek) => {
    setState((prev) => ({ ...prev, meals: [...week.meals] }))
    setGenerationKey((k) => k + 1)
  }, [])

  const handleToggleShoppingItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      shoppingChecked: {
        ...prev.shoppingChecked,
        [id]: !prev.shoppingChecked[id],
      },
    }))
  }, [])

  const handleSetBudget = useCallback((val: number) => {
    setState((prev) => ({ ...prev, budget: val }))
  }, [])

  const handleSharePlan = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.share) return
    const filledCount = state.meals.filter((m) => m.option).length
    const text = `📋 Cardápio Familiar Semanal\n\nTotal: ${filledCount}/21 refeições planejadas\nGasto estimado: R$ ${totalWeeklyCost}\nOrçamento: R$ ${state.budget}\n\nVia DomPlace 🛒`

    try {
      await navigator.share({ title: 'Cardápio Familiar - DomPlace', text, url: window.location.href })
    } catch {
      void 0
    }
  }, [state.meals, totalWeeklyCost, state.budget])

  /* ── Don't render until mounted ── */
  if (!mounted) {
    return (
      <div className="r49-family-planner">
        <div className="rounded-2xl p-6 glassmorphism-strong animate-pulse">
          <div className="h-6 w-52 bg-muted rounded mb-4" />
          <div className="h-4 w-32 bg-muted rounded mb-2" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    )
  }

  /* ── Tabs Config ── */
  const sectionTabs = [
    { key: 'planner', label: 'Cardápio', icon: UtensilsCrossed },
    { key: 'shopping', label: 'Compras', icon: ShoppingCart },
    { key: 'nutrition', label: 'Nutrição', icon: Flame },
    { key: 'recipes', label: 'Receitas', icon: ChefHat },
  ] as const

  /* ── Render ── */
  return (
    <div className="r49-family-planner">
      <div className="rounded-2xl overflow-hidden glassmorphism-strong relative r62-card-lift">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-mesh opacity-10 pointer-events-none" />

        <div className="relative z-10">
          {/* ═══════ Header ═══════ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-between p-4 pb-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-md">
                <UtensilsCrossed className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold r62-heading-gradient">Planejador de Refeições</h3>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Planejamento familiar semanal
                </p>
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                className="text-[10px] gap-1 rounded-lg h-8 px-2.5 min-h-[44px]"
                onClick={handleSharePlan}
              >
                <Share2 className="h-3 w-3" />
                Compartilhar
              </Button>
            </motion.div>
          </motion.div>

          {/* ═══════ Budget Tracker ═══════ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-4 pb-3"
          >
            <motion.div variants={itemVariants} className="rounded-xl bg-background/40 border border-border/30 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold">Orçamento Semanal</span>
                </div>
                <div className="flex items-center gap-1.5 bg-background/60 border border-border/50 rounded-lg px-2.5 py-1">
                  <span className="text-[10px] font-semibold text-muted-foreground">R$</span>
                  <input
                    type="number"
                    value={state.budget}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      if (!isNaN(val) && val > 0) handleSetBudget(val)
                    }}
                    className="w-14 bg-transparent text-xs font-bold outline-none tabular-nums"
                    min={0}
                    step={50}
                  />
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  custom={budgetPercent / 100}
                  variants={progressFill}
                  initial="hidden"
                  animate="visible"
                  style={{ transformOrigin: 'left' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold ${budgetPercent > 90 ? 'text-red-500' : budgetPercent > 70 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  Gasto: R$ {totalWeeklyCost}
                </span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  R$ {budgetRemaining} restante
                </span>
                <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                  / R$ {state.budget}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* ═══════ Week Calendar ═══════ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-4 pb-3"
          >
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {DAYS_OF_WEEK.map((dayLabel, idx) => {
                const isToday = idx === todayIndex
                const isSelected = idx === selectedDay
                const dayHasMeals = state.meals.some((m) => m.day === idx && m.option !== null)
                const filledForDay = state.meals.filter((m) => m.day === idx && m.option !== null).length

                return (
                  <motion.button
                    key={dayLabel}
                    variants={cardEntrance}
                    custom={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDay(idx)}
                    className={`r49-day-card flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl min-w-[48px] border transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : isToday
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-card border-border/50 text-muted-foreground hover:border-primary/20'
                    }`}
                    style={{ boxShadow: isSelected ? '0 2px 8px rgba(249,115,22,0.25)' : '0 1px 2px rgba(0,0,0,0.04)' }}
                  >
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-primary-foreground' : ''}`}>
                      {dayLabel}
                    </span>
                    {dayHasMeals && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 400, damping: 18 }}
                        className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-emerald-500'}`}
                      />
                    )}
                    <span className={`text-[9px] font-semibold ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {filledForDay}/3
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* ═══════ Section Tabs ═══════ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="px-4 pb-3"
          >
            <div className="flex items-center gap-1 bg-background/60 border border-border/50 rounded-lg p-1">
              {sectionTabs.map((tab) => (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveSection(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 min-h-[44px] rounded-md text-[10px] font-semibold transition-all ${
                    activeSection === tab.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* ═══════ Auto-Generate Button ═══════ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="px-4 pb-3"
          >
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleAutoGenerate}
                disabled={isGenerating}
                className="w-full h-10 text-xs font-bold rounded-xl gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-500/90 hover:to-rose-500/90 text-white shadow-md"
                style={{ boxShadow: '0 4px 14px rgba(249,115,22,0.3)' }}
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {isGenerating ? 'Gerando cardápio...' : 'Sugerir cardápio'}
              </Button>
            </motion.div>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <Badge variant="secondary" className="text-[9px] font-bold">
                {filledSlots}/21 refeições
              </Badge>
              <Badge variant="secondary" className="text-[9px] font-bold">
                ~R$ {totalWeeklyCost} estimado
              </Badge>
            </div>
          </motion.div>

          {/* ═══════ Animated Divider ═══════ */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 25, delay: 0.15 }}
            className="h-px bg-border/50 mx-4 mb-3"
            style={{ transformOrigin: 'left' }}
          />

          <AnimatePresence mode="wait">
            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION: Meal Planner Grid                         */}
            {/* ═══════════════════════════════════════════════════ */}
            {activeSection === 'planner' && (
              <motion.div
                key="planner"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
                className="px-4 pb-4"
              >
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  {/* Selected day label */}
                  <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <h4 className="text-xs font-bold">{FULL_DAYS[selectedDay]}</h4>
                    <span className="text-[10px] text-muted-foreground">
                      {state.meals.filter((m) => m.day === selectedDay && m.option).length}/3 planejadas
                    </span>
                  </motion.div>

                  {/* Meal slots for selected day */}
                  <div className="space-y-3">
                    {(['cafe', 'almoco', 'jantar'] as const).map((mealType) => {
                      const slot = state.meals.find((m) => m.day === selectedDay && m.meal === mealType)
                      const mealInfo = MEAL_LABELS[mealType]
                      const options = getMealOptionsForType(mealType)

                      return (
                        <motion.div
                          key={`${selectedDay}-${mealType}`}
                          variants={cardEntrance}
                          className="r49-meal-slot rounded-xl border border-border/50 bg-card overflow-hidden"
                          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                        >
                          {/* Meal type header */}
                          <div className="flex items-center gap-2 px-3 py-2 bg-muted/30">
                            <span className="text-base">{mealInfo.emoji}</span>
                            <span className="text-xs font-bold">{mealInfo.label}</span>
                            {slot?.option && (
                              <Badge variant="secondary" className="text-[8px] ml-auto">
                                {slot.option.calories} kcal
                              </Badge>
                            )}
                          </div>

                          {/* Selected meal or empty state */}
                          <div className="p-3">
                            {slot?.option ? (
                              <motion.div
                                key={`${generationKey}-${selectedDay}-${mealType}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
                                className="flex items-center gap-3"
                              >
                                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <span className="text-xl">{slot.option.emoji}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">{slot.option.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] text-muted-foreground tabular-nums">R$ {slot.option.cost}</span>
                                    <span className="text-[9px] text-muted-foreground">·</span>
                                    <span className="text-[9px] text-muted-foreground">{slot.option.protein}g prot</span>
                                    {slot.option.isVegetarian && (
                                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                        <Leaf className="h-2.5 w-2.5" /> Veg
                                      </span>
                                    )}
                                    {slot.option.isGlutenFree && (
                                      <span className="text-[9px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                        <WheatOff className="h-2.5 w-2.5" /> SG
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <motion.button
                                  whileTap={{ scale: 0.85 }}
                                  onClick={() => handleSelectMeal(selectedDay, mealType, null)}
                                  className="h-7 w-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors min-h-[44px] min-w-[44px]"
                                >
                                  <X className="h-3 w-3" />
                                </motion.button>
                              </motion.div>
                            ) : (
                              <div className="text-center py-2">
                                <p className="text-[10px] text-muted-foreground">Nenhuma refeição selecionada</p>
                              </div>
                            )}

                            {/* Meal options picker */}
                            {!slot?.option && (
                              <div className="mt-2 grid grid-cols-2 gap-1.5">
                                {options.slice(0, 4).map((opt) => (
                                  <motion.button
                                    key={opt.id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleSelectMeal(selectedDay, mealType, opt)}
                                    className="r49-meal-option flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border/30 bg-background/40 hover:bg-primary/5 hover:border-primary/20 transition-colors text-left"
                                  >
                                    <span className="text-sm">{opt.emoji}</span>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] font-semibold truncate">{opt.name}</p>
                                      <p className="text-[8px] text-muted-foreground tabular-nums">R$ {opt.cost}</p>
                                    </div>
                                  </motion.button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Family Members */}
                  <motion.div variants={itemVariants} className="mt-5">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Users className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-bold">Membros da Família</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {FAMILY_MEMBERS.map((member) => (
                        <motion.div
                          key={member.id}
                          variants={cardEntrance}
                          className="r49-family-member flex items-center gap-2.5 rounded-xl border border-border/50 bg-card p-2.5"
                          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`${member.color} text-white font-bold text-[10px]`}>
                              {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold truncate">{member.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[8px] text-muted-foreground">{member.servings} porções</span>
                              {member.isVegetarian && (
                                <Leaf className="h-2.5 w-2.5 text-emerald-500" />
                              )}
                              {member.isGlutenFree && (
                                <WheatOff className="h-2.5 w-2.5 text-amber-500" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Previous Weeks */}
                  <motion.div variants={itemVariants} className="mt-5">
                    <div className="flex items-center gap-2 mb-2.5">
                      <RotateCcw className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-bold">Semanas Anteriores</h4>
                    </div>
                    <div className="space-y-2">
                      {PREVIOUS_WEEKS.map((week) => (
                        <motion.div
                          key={week.id}
                          variants={itemVariants}
                          className="r49-saved-week flex items-center justify-between rounded-xl border border-border/50 bg-card p-3"
                          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold">{week.label}</p>
                            <p className="text-[9px] text-muted-foreground">{week.date}</p>
                            <p className="text-[10px] font-semibold tabular-nums mt-0.5 text-emerald-600 dark:text-emerald-400">
                              Custo: R$ {week.totalCost}
                            </p>
                          </div>
                          <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[10px] gap-1 rounded-lg h-7 px-2.5"
                              onClick={() => handleReuseWeek(week)}
                            >
                              <RotateCcw className="h-3 w-3" />
                              Reutilizar
                            </Button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION: Shopping List                              */}
            {/* ═══════════════════════════════════════════════════ */}
            {activeSection === 'shopping' && (
              <motion.div
                key="shopping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
                className="px-4 pb-4"
              >
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  {/* Shopping summary */}
                  <motion.div variants={itemVariants} className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-bold">Lista de Compras</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[9px] font-bold">
                        {shoppingCheckedItems}/{shoppingItems.length}
                      </Badge>
                      <span className="text-xs font-bold tabular-nums text-primary">
                        ~R$ {Math.round(shoppingTotal)}
                      </span>
                    </div>
                  </motion.div>

                  {/* Progress */}
                  <motion.div variants={itemVariants} className="mb-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                        initial={{ width: 0 }}
                        animate={{
                          width: shoppingItems.length > 0
                            ? `${(shoppingCheckedItems / shoppingItems.length) * 100}%`
                            : '0%',
                        }}
                        transition={{ type: 'spring' as const, stiffness: 150, damping: 20 }}
                      />
                    </div>
                  </motion.div>

                  {shoppingItems.length === 0 ? (
                    <motion.div variants={itemVariants} className="text-center py-10">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground font-medium">Lista vazia</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Adicione refeições ao cardápio para gerar a lista
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                      {Object.entries(groupedShopping).map(([groupKey, items]) => {
                        const [store, category] = groupKey.split('|')
                        const groupChecked = items.filter((i) => state.shoppingChecked[i.id]).length
                        const groupTotal = items.reduce((s, i) => s + i.estimatedCost, 0)

                        return (
                          <motion.div
                            key={groupKey}
                            variants={itemVariants}
                            className="r49-shopping-group rounded-xl border border-border/50 bg-card overflow-hidden"
                            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                          >
                            <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold">{category}</span>
                                <Badge variant="outline" className="text-[8px] py-0 px-1.5">
                                  {store}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-muted-foreground tabular-nums">
                                  {groupChecked}/{items.length}
                                </span>
                                <span className="text-[10px] font-bold tabular-nums">
                                  R$ {Math.round(groupTotal)}
                                </span>
                              </div>
                            </div>
                            <div className="divide-y divide-border/30">
                              {items.map((item) => (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
                                  className={`flex items-center gap-2.5 px-3 py-2 transition-colors ${
                                    state.shoppingChecked[item.id] ? 'opacity-50' : ''
                                  }`}
                                >
                                  <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => handleToggleShoppingItem(item.id)}
                                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                                      state.shoppingChecked[item.id]
                                        ? 'bg-primary border-primary'
                                        : 'border-border/60 hover:border-primary/40'
                                    }`}
                                  >
                                    {state.shoppingChecked[item.id] && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                                      >
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                      </motion.div>
                                    )}
                                  </motion.button>
                                  <span className="text-sm shrink-0">{item.emoji}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-[10px] font-semibold truncate ${state.shoppingChecked[item.id] ? 'line-through' : ''}`}>
                                      {item.name}
                                    </p>
                                    <p className="text-[8px] text-muted-foreground">
                                      {item.quantity}x · {item.store}
                                    </p>
                                  </div>
                                  <span className="text-[10px] font-bold tabular-nums shrink-0">
                                    R$ {item.estimatedCost}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION: Nutrition Summary                          */}
            {/* ═══════════════════════════════════════════════════ */}
            {activeSection === 'nutrition' && (
              <motion.div
                key="nutrition"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
                className="px-4 pb-4"
              >
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <h4 className="text-xs font-bold">Resumo Nutricional Semanal</h4>
                  </motion.div>

                  {/* Nutrition Rings */}
                  <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 mb-5">
                    {nutritionRings.map((ring) => (
                      <div key={ring.label} className="relative">
                        <CircularProgressRing
                          percentage={ring.max > 0 ? (ring.value / ring.max) * 100 : 0}
                          color={ring.color}
                          size={72}
                          strokeWidth={6}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <motion.span
                            key={ring.value}
                            initial={{ scale: 1.15 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                            className="text-sm font-extrabold tabular-nums"
                          >
                            {ring.value}
                          </motion.span>
                          <span className="text-[7px] text-muted-foreground font-medium">{ring.unit}</span>
                        </div>
                        <span className="text-[9px] font-semibold text-muted-foreground text-center mt-1 block">
                          {ring.label}
                        </span>
                      </div>
                    ))}
                  </motion.div>

                  {/* Per day breakdown */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Média por dia</p>
                    {nutritionRings.map((ring) => {
                      const dailyAvg = Math.round(ring.value / 7)
                      const dailyPct = ring.max > 0 ? (dailyAvg / (ring.max / 7)) * 100 : 0
                      return (
                        <div key={`avg-${ring.label}`} className="flex items-center gap-2.5">
                          <span className="text-[10px] font-semibold text-muted-foreground w-20 shrink-0">
                            {ring.label}
                          </span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: ring.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(dailyPct, 100)}%` }}
                              transition={{ type: 'spring' as const, stiffness: 150, damping: 18 }}
                            />
                          </div>
                          <span className="text-[10px] font-bold tabular-nums w-16 text-right">
                            {dailyAvg} {ring.unit}/dia
                          </span>
                        </div>
                      )
                    })}
                  </motion.div>

                  {/* Healthy tips */}
                  <motion.div variants={itemVariants} className="mt-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Dicas de Nutrição</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] text-muted-foreground flex items-start gap-1.5">
                        <Zap className="h-2.5 w-2.5 text-emerald-500 mt-0.5 shrink-0" />
                        Proteínas estão {totalProtein > 350 ? 'acima' : 'abaixo'} da meta semanal de 350g
                      </p>
                      <p className="text-[9px] text-muted-foreground flex items-start gap-1.5">
                        <Zap className="h-2.5 w-2.5 text-emerald-500 mt-0.5 shrink-0" />
                        Tente incluir mais vegetais no {totalCarbs > 1200 ? 'jantar' : 'almoço'} para equilibrar
                      </p>
                      <p className="text-[9px] text-muted-foreground flex items-start gap-1.5">
                        <Zap className="h-2.5 w-2.5 text-emerald-500 mt-0.5 shrink-0" />
                        Maria prefere opções vegetarianas — adapte quando possível
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION: Recipe Suggestions                         */}
            {/* ═══════════════════════════════════════════════════ */}
            {activeSection === 'recipes' && (
              <motion.div
                key="recipes"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
                className="px-4 pb-4"
              >
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3">
                    <ChefHat className="h-4 w-4 text-amber-500" />
                    <h4 className="text-xs font-bold">Sugestões de Receitas</h4>
                  </motion.div>

                  {matchedRecipes.length === 0 ? (
                    <motion.div variants={itemVariants} className="text-center py-10">
                      <ChefHat className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground font-medium">Sem sugestões</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Adicione refeições ao cardápio para ver receitas
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {matchedRecipes.map((recipe, idx) => (
                        <motion.div
                          key={recipe.id}
                          variants={cardEntrance}
                          custom={idx}
                          className="r49-recipe-card rounded-xl border border-border/50 bg-card overflow-hidden"
                          style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
                        >
                          <div className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0">
                                <span className="text-2xl">{recipe.emoji}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{recipe.name}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge className={`text-[8px] py-0 px-1.5 border ${getDifficultyColor(recipe.difficulty)}`}>
                                    {Array.from({ length: 3 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-2 w-2 inline-block ${i < getDifficultyStars(recipe.difficulty) ? 'fill-current' : 'opacity-30'}`}
                                      />
                                    ))}
                                    {' '}{recipe.difficulty}
                                  </Badge>
                                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" />
                                    {recipe.time}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                    <Flame className="h-2.5 w-2.5" />
                                    {recipe.calories} kcal
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Matched meals */}
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[8px] font-semibold text-muted-foreground">Combina com:</span>
                              {recipe.matchedMeals.map((mealName) => (
                                <Badge key={mealName} variant="secondary" className="text-[8px] py-0 px-1.5">
                                  {mealName}
                                </Badge>
                              ))}
                            </div>

                            {/* Ingredients */}
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              {recipe.ingredients.map((ing) => (
                                <span
                                  key={ing}
                                  className="text-[8px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground font-medium"
                                >
                                  {getIngredientEmoji(ing)} {ing}
                                </span>
                              ))}
                            </div>

                            {/* Action button */}
                            <motion.div className="mt-2.5" whileTap={{ scale: 0.97 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-7 text-[10px] font-semibold rounded-lg gap-1"
                              >
                                <Timer className="h-3 w-3" />
                                Ver receita completa
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Extra recipe always shown */}
                  <motion.div
                    variants={itemVariants}
                    className="mt-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 text-center"
                  >
                    <Sparkles className="h-5 w-5 text-primary mx-auto mb-1.5" />
                    <p className="text-[10px] font-bold text-primary">Quer mais receitas?</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      O assistente IA pode sugerir receitas baseadas no seu cardápio
                    </p>
                    <motion.div className="mt-2" whileTap={{ scale: 0.97 }}>
                      <Button
                        size="sm"
                        className="text-[10px] font-bold rounded-lg h-7 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Sparkles className="h-3 w-3" />
                        Perguntar à IA
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════ Footer ═══════ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="px-4 py-2.5 border-t border-border/30 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground"
          >
            <UtensilsCrossed className="h-3 w-3" />
            <span>Planejador familiar · {FAMILY_MEMBERS.length} membros · {filledSlots} refeições</span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
