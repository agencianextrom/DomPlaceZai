'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UtensilsCrossed,
  Brain,
  ShoppingCart,
  Printer,
  Save,
  RotateCcw,
  Clock,
  Flame,
  ArrowRightLeft,
  Plus,
  Minus,
  Check,
  Sparkles,
  Users,
  ChefHat,
  Eye,
  Zap,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ═══════════════════════════════════════════════════════════════
   Types & Interfaces
   ═══════════════════════════════════════════════════════════════ */

type Difficulty = 'Fácil' | 'Médio' | 'Avançado'
type MealSlot = 'cafe' | 'almoco' | 'jantar' | 'lanche'

interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface SmartSwap {
  ingredient: string
  original: string
  originalPrice: number
  swap: string
  swapPrice: number
  savingsPercent: number
}

interface Ingredient {
  name: string
  qty: string
  aisle: string
  pricePerUnit: number
}

interface MealRecipe {
  id: string
  name: string
  emoji: string
  difficulty: Difficulty
  prepTime: number
  cookTime: number
  servings: number
  nutritionPerServing: Nutrition
  ingredients: Ingredient[]
  steps: string[]
  gradient: string
  smartSwaps: SmartSwap[]
}

interface MealSlotData {
  slot: MealSlot
  mealId: string | null
  servings: number
}

type DayKey = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'

interface WeeklyPlan {
  days: Record<DayKey, MealSlotData[]>
}

interface GroceryItem {
  name: string
  qty: string
  aisle: string
  price: number
  checked: boolean
}

interface GroceryAisle {
  id: string
  name: string
  emoji: string
  color: string
  items: GroceryItem[]
}

/* ═══════════════════════════════════════════════════════════════
   Constants & Data
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'domplace-smart-meal-prep'

const SLOT_LABELS: Record<MealSlot, string> = {
  cafe: 'Café',
  almoco: 'Almoço',
  jantar: 'Jantar',
  lanche: 'Lanche',
}

const SLOT_EMOJIS: Record<MealSlot, string> = {
  cafe: '☕',
  almoco: '🍽️',
  jantar: '🌙',
  lanche: '🥤',
}

const DAY_LABELS: Record<DayKey, string> = {
  seg: 'Seg',
  ter: 'Ter',
  qua: 'Qua',
  qui: 'Qui',
  sex: 'Sex',
  sab: 'Sáb',
  dom: 'Dom',
}

const DAY_KEYS: DayKey[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
const SLOT_KEYS: MealSlot[] = ['cafe', 'almoco', 'jantar', 'lanche']

const AISLE_ORDER: Record<string, { name: string; emoji: string; color: string }> = {
  hortifruti: { name: 'Hortifruti', emoji: '🥬', color: 'text-emerald-600 dark:text-emerald-400' },
  laticinios: { name: 'Laticínios', emoji: '🧀', color: 'text-blue-600 dark:text-blue-400' },
  padaria: { name: 'Padaria', emoji: '🍞', color: 'text-amber-600 dark:text-amber-400' },
  carnes: { name: 'Carnes', emoji: '🥩', color: 'text-red-600 dark:text-red-400' },
  graos: { name: 'Grãos & Cereais', emoji: '🌾', color: 'text-yellow-600 dark:text-yellow-400' },
  temperos: { name: 'Temperos', emoji: '🌶️', color: 'text-orange-600 dark:text-orange-400' },
  bebidas: { name: 'Bebidas', emoji: '🥤', color: 'text-purple-600 dark:text-purple-400' },
  congelados: { name: 'Congelados', emoji: '🧊', color: 'text-cyan-600 dark:text-cyan-400' },
  limpeza: { name: 'Limpeza', emoji: '🧹', color: 'text-teal-600 dark:text-teal-400' },
}

const DIFFICULTY_CONFIG: Record<Difficulty, { bg: string; text: string; badge: string }> = {
  Fácil: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  Médio: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  Avançado: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
}

/* ── Mock Meal Recipes ── */
const MEAL_RECIPES: MealRecipe[] = [
  {
    id: 'mr-1',
    name: 'Açaí na Tigela',
    emoji: '🫐',
    difficulty: 'Fácil',
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    nutritionPerServing: { calories: 320, protein: 8, carbs: 52, fat: 10 },
    ingredients: [
      { name: 'Polpa de Açaí 500ml', qty: '1 un', aisle: 'congelados', pricePerUnit: 14.90 },
      { name: 'Granola', qty: '150g', aisle: 'padaria', pricePerUnit: 8.50 },
      { name: 'Banana', qty: '2 un', aisle: 'hortifruti', pricePerUnit: 1.20 },
      { name: 'Mel', qty: '2 colheres', aisle: 'temperos', pricePerUnit: 12.00 },
      { name: 'Leite Condensado', qty: '50g', aisle: 'laticinios', pricePerUnit: 7.90 },
    ],
    steps: ['Bata a polpa de açaí no liquidificador', 'Coloque na tigela', 'Decore com granola, banana fatiada, mel e leite condensado'],
    gradient: 'from-purple-500 to-indigo-600',
    smartSwaps: [
      { ingredient: 'Granola', original: 'Granola Premium', originalPrice: 14.50, swap: 'Granola Econômica', swapPrice: 7.80, savingsPercent: 46 },
    ],
  },
  {
    id: 'mr-2',
    name: 'Omelete Completo',
    emoji: '🍳',
    difficulty: 'Fácil',
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    nutritionPerServing: { calories: 280, protein: 22, carbs: 6, fat: 18 },
    ingredients: [
      { name: 'Ovos', qty: '6 un', aisle: 'laticinios', pricePerUnit: 0.60 },
      { name: 'Queijo Mussarela', qty: '100g', aisle: 'laticinios', pricePerUnit: 22.00 },
      { name: 'Tomate', qty: '1 un', aisle: 'hortifruti', pricePerUnit: 3.50 },
      { name: 'Cebola', qty: '1 un', aisle: 'hortifruti', pricePerUnit: 2.00 },
      { name: 'Cebolinha', qty: 'a gosto', aisle: 'hortifruti', pricePerUnit: 1.50 },
      { name: 'Azeite', qty: '1 colher', aisle: 'temperos', pricePerUnit: 18.00 },
    ],
    steps: ['Bata os ovos com sal e pimenta', 'Aqueça o azeite na frigideira', 'Adicione tomate, cebola e queijo', 'Despeje os ovos e cozinhe em fogo médio', 'Dobre ao meio e sirva'],
    gradient: 'from-yellow-400 to-orange-500',
    smartSwaps: [
      { ingredient: 'Queijo Mussarela', original: 'Mussarela Bola', originalPrice: 38.00, swap: 'Mussarela Ralada Pote', swapPrice: 19.90, savingsPercent: 48 },
    ],
  },
  {
    id: 'mr-3',
    name: 'Arroz com Feijão e Bife',
    emoji: '🍖',
    difficulty: 'Médio',
    prepTime: 15,
    cookTime: 40,
    servings: 4,
    nutritionPerServing: { calories: 520, protein: 32, carbs: 58, fat: 16 },
    ingredients: [
      { name: 'Arroz', qty: '2 xícaras', aisle: 'graos', pricePerUnit: 6.50 },
      { name: 'Feijão Carioca', qty: '500g', aisle: 'graos', pricePerUnit: 9.90 },
      { name: 'Bife de Alcatra', qty: '4 unidades', aisle: 'carnes', pricePerUnit: 18.00 },
      { name: 'Alho', qty: '4 dentes', aisle: 'hortifruti', pricePerUnit: 0.50 },
      { name: 'Cebola', qty: '2 un', aisle: 'hortifruti', pricePerUnit: 2.00 },
      { name: 'Sal', qty: 'a gosto', aisle: 'temperos', pricePerUnit: 3.00 },
      { name: 'Óleo de Soja', qty: '3 colheres', aisle: 'temperos', pricePerUnit: 8.50 },
      { name: 'Farofa Pronta', qty: '100g', aisle: 'padaria', pricePerUnit: 5.90 },
    ],
    steps: ['Cozinhe o feijão com alho e sal', 'Faça o arroz na mesma panela ou separado', 'Tempere os bifes com sal e alho', 'Grelhe os bifes na frigideira', 'Sirva com farofa e salada'],
    gradient: 'from-red-500 to-rose-600',
    smartSwaps: [
      { ingredient: 'Bife de Alcatra', original: 'Alcatra Nobre', originalPrice: 45.00, swap: 'Fraldinha', swapPrice: 28.00, savingsPercent: 38 },
      { ingredient: 'Arroz', original: 'Arroz Agulhinha', originalPrice: 12.00, swap: 'Arroz Tipo 1', swapPrice: 7.50, savingsPercent: 38 },
    ],
  },
  {
    id: 'mr-4',
    name: 'Frango Xadrez',
    emoji: '🍗',
    difficulty: 'Avançado',
    prepTime: 20,
    cookTime: 25,
    servings: 4,
    nutritionPerServing: { calories: 420, protein: 38, carbs: 24, fat: 18 },
    ingredients: [
      { name: 'Peito de Frango', qty: '600g', aisle: 'carnes', pricePerUnit: 16.90 },
      { name: 'Pimentão Verde', qty: '1 un', aisle: 'hortifruti', pricePerUnit: 4.50 },
      { name: 'Pimentão Vermelho', qty: '1 un', aisle: 'hortifruti', pricePerUnit: 4.50 },
      { name: 'Cenoura', qty: '2 un', aisle: 'hortifruti', pricePerUnit: 2.80 },
      { name: 'Milho Verde', qty: '1 lata', aisle: 'congelados', pricePerUnit: 5.50 },
      { name: 'Shoyu', qty: '3 colheres', aisle: 'temperos', pricePerUnit: 8.00 },
      { name: 'Amido de Milho', qty: '1 colher', aisle: 'graos', pricePerUnit: 6.00 },
      { name: 'Arroz', qty: '2 xícaras', aisle: 'graos', pricePerUnit: 6.50 },
    ],
    steps: ['Corte o frango em cubos e tempere com shoyu', 'Pique os pimentões e cenoura em cubos', 'Refogue o frango até dourar', 'Adicione os legumes e o milho', 'Engrosse com amido diluído', 'Sirva sobre arroz branco'],
    gradient: 'from-amber-500 to-orange-600',
    smartSwaps: [
      { ingredient: 'Peito de Frango', original: 'Filé de Peito', originalPrice: 22.90, swap: 'Peito Desfiado', swapPrice: 15.90, savingsPercent: 31 },
    ],
  },
  {
    id: 'mr-5',
    name: 'Salada Caesar',
    emoji: '🥗',
    difficulty: 'Fácil',
    prepTime: 15,
    cookTime: 0,
    servings: 2,
    nutritionPerServing: { calories: 180, protein: 12, carbs: 10, fat: 12 },
    ingredients: [
      { name: 'Alface Romana', qty: '1 un', aisle: 'hortifruti', pricePerUnit: 4.50 },
      { name: 'Croutons', qty: '80g', aisle: 'padaria', pricePerUnit: 6.00 },
      { name: 'Queijo Parmesão', qty: '30g', aisle: 'laticinios', pricePerUnit: 42.00 },
      { name: 'Peito de Frango Grelhado', qty: '200g', aisle: 'carnes', pricePerUnit: 16.90 },
      { name: 'Molho Caesar', qty: '3 colheres', aisle: 'temperos', pricePerUnit: 14.00 },
    ],
    steps: ['Lave e seque as folhas de alface', 'Grelhe o frango temperado e corte em fatias', 'Monte a salada com alface, frango e croutons', 'Regue com molho Caesar e polvilhe parmesão'],
    gradient: 'from-lime-500 to-green-600',
    smartSwaps: [
      { ingredient: 'Queijo Parmesão', original: 'Parmesão Importado', originalPrice: 68.00, swap: 'Parmesão Nacional Ralado', swapPrice: 28.00, savingsPercent: 59 },
    ],
  },
  {
    id: 'mr-6',
    name: 'Macarrão ao Sugo',
    emoji: '🍝',
    difficulty: 'Fácil',
    prepTime: 5,
    cookTime: 20,
    servings: 4,
    nutritionPerServing: { calories: 380, protein: 14, carbs: 56, fat: 12 },
    ingredients: [
      { name: 'Macarrão Espaguete', qty: '500g', aisle: 'graos', pricePerUnit: 5.50 },
      { name: 'Molho de Tomate', qty: '500ml', aisle: 'temperos', pricePerUnit: 4.90 },
      { name: 'Alho', qty: '3 dentes', aisle: 'hortifruti', pricePerUnit: 0.50 },
      { name: 'Cebola', qty: '1 un', aisle: 'hortifruti', pricePerUnit: 2.00 },
      { name: 'Carne Moída', qty: '300g', aisle: 'carnes', pricePerUnit: 22.50 },
      { name: 'Orégano', qty: '1 colher', aisle: 'temperos', pricePerUnit: 5.00 },
      { name: 'Queijo Ralado', qty: '80g', aisle: 'laticinios', pricePerUnit: 16.00 },
    ],
    steps: ['Cozinhe o macarrão al dente', 'Refogue alho e cebola', 'Adicione a carne moída e doure', 'Coloque o molho de tomate e orégano', 'Misture ao macarrão e sirva com queijo'],
    gradient: 'from-red-400 to-orange-500',
    smartSwaps: [
      { ingredient: 'Carne Moída', original: 'Moída Patinho', originalPrice: 35.00, swap: 'Moída Segunda', swapPrice: 22.00, savingsPercent: 37 },
    ],
  },
  {
    id: 'mr-7',
    name: 'Vitamina de Banana',
    emoji: '🍌',
    difficulty: 'Fácil',
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    nutritionPerServing: { calories: 210, protein: 6, carbs: 38, fat: 4 },
    ingredients: [
      { name: 'Banana', qty: '4 un', aisle: 'hortifruti', pricePerUnit: 1.20 },
      { name: 'Leite Integral', qty: '500ml', aisle: 'laticinios', pricePerUnit: 5.99 },
      { name: 'Aveia', qty: '4 colheres', aisle: 'graos', pricePerUnit: 9.50 },
      { name: 'Mel', qty: '2 colheres', aisle: 'temperos', pricePerUnit: 12.00 },
    ],
    steps: ['Descasque as bananas', 'Coloque todos os ingredientes no liquidificador', 'Bata por 1 minuto até ficar homogêneo', 'Sirva gelado'],
    gradient: 'from-yellow-400 to-amber-500',
    smartSwaps: [
      { ingredient: 'Leite Integral', original: 'Leite Integral Marca A', originalPrice: 7.50, swap: 'Leite Integral Econômico', swapPrice: 5.49, savingsPercent: 27 },
    ],
  },
  {
    id: 'mr-8',
    name: 'Bolo de Chocolate',
    emoji: '🍫',
    difficulty: 'Médio',
    prepTime: 20,
    cookTime: 35,
    servings: 8,
    nutritionPerServing: { calories: 340, protein: 6, carbs: 44, fat: 16 },
    ingredients: [
      { name: 'Farinha de Trigo', qty: '2 xícaras', aisle: 'graos', pricePerUnit: 5.50 },
      { name: 'Chocolate em Pó', qty: '1 xícara', aisle: 'padaria', pricePerUnit: 9.90 },
      { name: 'Açúcar', qty: '1.5 xícara', aisle: 'temperos', pricePerUnit: 5.00 },
      { name: 'Ovos', qty: '4 un', aisle: 'laticinios', pricePerUnit: 0.60 },
      { name: 'Leite', qty: '1 xícara', aisle: 'laticinios', pricePerUnit: 5.99 },
      { name: 'Óleo de Soja', qty: '0.5 xícara', aisle: 'temperos', pricePerUnit: 8.50 },
      { name: 'Fermento', qty: '1 colher', aisle: 'graos', pricePerUnit: 7.00 },
    ],
    steps: ['Pré-aqueça o forno a 180°C', 'Misture os ingredientes secos', 'Adicione ovos, leite e óleo', 'Bata bem até ficar homogêneo', 'Acrescente o fermento', 'Asse por 35 minutos', 'Deixe esfriar antes de desenformar'],
    gradient: 'from-amber-700 to-yellow-900',
    smartSwaps: [
      { ingredient: 'Chocolate em Pó', original: 'Cacau Belga', originalPrice: 28.00, swap: 'Chocolate em Pó Nacional', swapPrice: 8.90, savingsPercent: 68 },
    ],
  },
]

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}min` : `${h}h`
}

function createEmptyPlan(): WeeklyPlan {
  const days: Record<DayKey, MealSlotData[]> = {} as Record<DayKey, MealSlotData[]>
  for (const dk of DAY_KEYS) {
    days[dk] = SLOT_KEYS.map((sk) => ({ slot: sk, mealId: null, servings: 2 }))
  }
  return { days }
}

function loadPlan(): WeeklyPlan {
  if (typeof window === 'undefined') return createEmptyPlan()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return createEmptyPlan()
}

function savePlan(plan: WeeklyPlan): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)) } catch { /* ignore */ }
}

function getRecipeById(id: string | null): MealRecipe | undefined {
  if (!id) return undefined
  return MEAL_RECIPES.find((r) => r.id === id)
}

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const cellVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 22 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 20 },
  },
}

const fadeSlideUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

const timerSpin = {
  animate: {
    rotate: [0, 360],
    transition: { duration: 4, repeat: Infinity, ease: 'linear' as const },
  },
}

/* ═══════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════ */

/* ── Nutrition Progress Ring ── */
function NutritionRing({
  value,
  max,
  label,
  color,
  size = 56,
}: {
  value: number
  max: number
  label: string
  color: string
  size?: number
}) {
  const strokeWidth = 5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const dashOffset = circumference - (pct / 100) * circumference

  return (
    <div className="r50-meal-ring-wrap flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
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
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={Math.round(value)}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 18 }}
            className="text-[10px] font-bold tabular-nums"
          >
            {Math.round(value)}
          </motion.span>
        </div>
      </div>
      <span className="text-[8px] text-muted-foreground font-medium">{label}</span>
    </div>
  )
}

/* ── Weekly Nutrition Summary ── */
function WeeklyNutritionSummary({ nutrition }: { nutrition: Nutrition }) {
  const dailyCalTarget = 2000
  const dailyProteinTarget = 80
  const dailyCarbTarget = 250
  const dailyFatTarget = 65

  return (
    <div className="r50-meal-weekly-nutrition bg-background/40 rounded-xl p-4 border border-border/30">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-bold">Resumo Nutricional Semanal</span>
      </div>
      <div className="flex items-center justify-around">
        <NutritionRing
          value={nutrition.calories}
          max={dailyCalTarget * 7}
          label="Kcal"
          color="#f97316"
          size={64}
        />
        <NutritionRing
          value={nutrition.protein}
          max={dailyProteinTarget * 7}
          label="Prot."
          color="#3b82f6"
          size={64}
        />
        <NutritionRing
          value={nutrition.carbs}
          max={dailyCarbTarget * 7}
          label="Carb."
          color="#eab308"
          size={64}
        />
        <NutritionRing
          value={nutrition.fat}
          max={dailyFatTarget * 7}
          label="Gord."
          color="#ef4444"
          size={64}
        />
      </div>
    </div>
  )
}

/* ── Budget Tracker Bar ── */
function BudgetTracker({
  spent,
  budget,
}: {
  spent: number
  budget: number
}) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const overBudget = pct > 90

  return (
    <div className="r50-meal-budget-tracker bg-background/40 rounded-xl p-3 border border-border/30">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
          <Target className="h-3 w-3" />
          Orçamento Semanal
        </span>
        <span className="text-[10px] font-bold tabular-nums">
          {formatBRL(spent)} / {formatBRL(budget)}
        </span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full r50-meal-budget-bar"
          style={{
            background: overBudget
              ? 'linear-gradient(to right, #ef4444, #dc2626)'
              : 'linear-gradient(to right, #22c55e, #16a34a)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring' as const, stiffness: 180, damping: 22 }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-muted-foreground">0%</span>
        <span className={`text-[9px] font-bold ${overBudget ? 'text-red-500' : 'text-emerald-500'}`}>
          {Math.round(pct)}% utilizado
        </span>
      </div>
    </div>
  )
}

/* ── Difficulty Badge ── */
function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const cfg = DIFFICULTY_CONFIG[difficulty]
  return (
    <Badge variant="secondary" className={`text-[9px] font-semibold border ${cfg.badge}`}>
      {difficulty}
    </Badge>
  )
}

/* ── Prep Timer Icon ── */
function PrepTimerIcon({ prepTime, cookTime }: { prepTime: number; cookTime: number }) {
  const totalTime = prepTime + cookTime
  return (
    <div className="r50-meal-timer-icon flex items-center gap-1 text-[10px] text-muted-foreground">
      <motion.div {...timerSpin.animate}>
        <Clock className="h-3 w-3" />
      </motion.div>
      <span className="font-medium tabular-nums">{formatTime(totalTime)}</span>
      {prepTime > 0 && cookTime > 0 && (
        <span className="text-[8px] text-muted-foreground/60">
          ({formatTime(prepTime)} + {formatTime(cookTime)})
        </span>
      )}
    </div>
  )
}

/* ── Serving Size Adjuster ── */
function ServingAdjuster({
  servings,
  onChange,
}: {
  servings: number
  onChange: (n: number) => void
}) {
  return (
    <div className="r50-meal-serving-adj flex items-center gap-2">
      <Users className="h-3 w-3 text-muted-foreground" />
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.max(1, servings - 1))}
        className="min-h-[44px] min-w-[44px] h-6 w-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
      >
        <Minus className="h-3 w-3" />
      </motion.button>
      <motion.span
        key={servings}
        initial={{ scale: 1.4, color: 'rgba(34,197,94,1)' }}
        animate={{ scale: 1, color: 'rgba(255,255,255,1)' }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
        className="text-xs font-bold tabular-nums w-6 text-center"
      >
        {servings}
      </motion.span>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.min(8, servings + 1))}
        className="min-h-[44px] min-w-[44px] h-6 w-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
      >
        <Plus className="h-3 w-3" />
      </motion.button>
    </div>
  )
}

/* ── Smart Swap Card ── */
function SmartSwapCard({ swap }: { swap: SmartSwap }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 350, damping: 22 }}
      className="r50-meal-swap-card flex items-center gap-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5"
    >
      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
        <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold truncate">{swap.ingredient}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] text-muted-foreground line-through">
            {formatBRL(swap.originalPrice)}
          </span>
          <ArrowRightLeft className="h-2 w-2 text-emerald-500" />
          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
            {formatBRL(swap.swapPrice)}
          </span>
        </div>
      </div>
      <Badge className="text-[8px] font-bold bg-emerald-500/15 text-emerald-600 border-emerald-500/20 shrink-0">
        -{swap.savingsPercent}%
      </Badge>
    </motion.div>
  )
}

/* ── Recipe Flip Card ── */
function RecipeFlipCard({
  recipe,
  isFlipped,
  onFlip,
  servings,
  onServingsChange,
}: {
  recipe: MealRecipe
  isFlipped: boolean
  onFlip: () => void
  servings: number
  onServingsChange: (n: number) => void
}) {
  const scaledNutrition = useMemo(() => {
    const ratio = servings / recipe.servings
    return {
      calories: Math.round(recipe.nutritionPerServing.calories * ratio),
      protein: Math.round(recipe.nutritionPerServing.protein * ratio),
      carbs: Math.round(recipe.nutritionPerServing.carbs * ratio),
      fat: Math.round(recipe.nutritionPerServing.fat * ratio),
    }
  }, [recipe.nutritionPerServing, servings])

  return (
    <div className="r50-meal-flip-card" style={{ perspective: '1000px' }}>
      <div
        className="relative cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        onClick={onFlip}
      >
        <AnimatePresence mode="wait">
          {isFlipped ? (
            /* ── BACK: Ingredients & Steps ── */
            <motion.div
              key="back"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="rounded-xl border border-border/50 overflow-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className={`bg-gradient-to-br ${recipe.gradient} p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <ChefHat className="h-3 w-3" />
                    Ingredientes & Modo de Preparo
                  </span>
                  <span className="text-[9px] text-white/70">Toque para voltar</span>
                </div>

                {/* Ingredients list */}
                <div className="space-y-1 mb-3">
                  {recipe.ingredients.map((ing, idx) => (
                    <motion.div
                      key={ing.name}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, type: 'spring' as const, stiffness: 400, damping: 22 }}
                      className="flex items-center gap-2 text-[10px] text-white"
                    >
                      <div className="h-4 w-4 rounded bg-white/20 flex items-center justify-center text-[8px] font-bold">
                        {idx + 1}
                      </div>
                      <span className="flex-1">{ing.name}</span>
                      <span className="text-white/70 text-[9px]">{ing.qty}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Steps */}
                <div className="border-t border-white/20 pt-2 space-y-1">
                  <span className="text-[10px] font-bold text-white">Modo de Preparo:</span>
                  {recipe.steps.map((step, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + idx * 0.08 }}
                      className="text-[9px] text-white/80 leading-relaxed"
                    >
                      {idx + 1}. {step}
                    </motion.p>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ── FRONT: Meal Overview ── */
            <motion.div
              key="front"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="rounded-xl border border-border/50 overflow-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Top gradient area */}
              <div className={`bg-gradient-to-br ${recipe.gradient} p-4 pb-3 flex flex-col items-center`}>
                <motion.span
                  className="text-3xl mb-1"
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 12, delay: 0.1 }}
                >
                  {recipe.emoji}
                </motion.span>
                <h4 className="text-xs font-bold text-white text-center">{recipe.name}</h4>
                <p className="text-[9px] text-white/60 mt-0.5">Toque para ver receita</p>
              </div>

              {/* Info section */}
              <div className="p-2.5 bg-card space-y-2">
                {/* Difficulty + Time */}
                <div className="flex items-center justify-between">
                  <DifficultyBadge difficulty={recipe.difficulty} />
                  <PrepTimerIcon prepTime={recipe.prepTime} cookTime={recipe.cookTime} />
                </div>

                {/* Nutrition rings row */}
                <div className="flex items-center justify-around">
                  <NutritionRing value={scaledNutrition.calories} max={800} label="Kcal" color="#f97316" size={44} />
                  <NutritionRing value={scaledNutrition.protein} max={60} label="Prot." color="#3b82f6" size={44} />
                  <NutritionRing value={scaledNutrition.carbs} max={80} label="Carb." color="#eab308" size={44} />
                </div>

                {/* Servings */}
                <ServingAdjuster servings={servings} onChange={onServingsChange} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Grocery List grouped by Aisle ── */
function GroceryListView({
  aisles,
  totalCost,
  savings,
  printMode,
}: {
  aisles: GroceryAisle[]
  totalCost: number
  savings: number
  printMode: boolean
}) {
  return (
    <div className={`r50-meal-grocery-list ${printMode ? 'r50-meal-print-mode' : ''}`}>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="h-4 w-4 text-white" />
            <h3 className="text-sm font-bold text-white">Lista de Compras</h3>
          </div>
          <p className="text-[10px] text-white/70">Organizado por corredor para compras mais rápidas</p>
        </div>

        <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {aisles.map((aisle) => (
            <motion.div
              key={aisle.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="rounded-lg border border-border/30 overflow-hidden"
            >
              <div className={`flex items-center gap-2 px-3 py-2 bg-muted/50 ${aisle.color}`}>
                <span className="text-base">{aisle.emoji}</span>
                <span className="text-[11px] font-bold">{aisle.name}</span>
                <Badge variant="secondary" className="text-[8px] ml-auto">
                  {aisle.items.length} itens
                </Badge>
              </div>
              <div className="divide-y divide-border/20">
                {aisle.items.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, type: 'spring' as const, stiffness: 400, damping: 22 }}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-muted/30 transition-colors"
                  >
                    <div className="h-4 w-4 rounded border border-border/50 flex items-center justify-center shrink-0">
                      {item.checked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                        >
                          <Check className="h-2.5 w-2.5 text-emerald-500" />
                        </motion.div>
                      )}
                    </div>
                    <span className="flex-1 text-[11px] font-medium">{item.name}</span>
                    <span className="text-[9px] text-muted-foreground">{item.qty}</span>
                    <span className="text-[10px] font-bold tabular-nums">{formatBRL(item.price)}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Totals */}
        <div className="p-3 border-t border-border/30 bg-card">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-muted-foreground">Total estimado</span>
            <span className="text-sm font-bold tabular-nums">{formatBRL(totalCost)}</span>
          </div>
          {savings > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5"
            >
              <Zap className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Economize até {formatBRL(savings)} com Smart Swaps!
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── AI Suggestion Panel ── */
function AISuggestionPanel({
  onSelect,
  slot,
  currentMealId,
}: {
  onSelect: (mealId: string) => void
  slot: MealSlot
  currentMealId: string | null
}) {
  const suggestions = useMemo(() => {
    const slotPreferences: Record<MealSlot, MealRecipe[]> = {
      cafe: MEAL_RECIPES.filter((r) => ['mr-1', 'mr-2', 'mr-7'].includes(r.id)),
      almoco: MEAL_RECIPES.filter((r) => ['mr-3', 'mr-4', 'mr-6'].includes(r.id)),
      jantar: MEAL_RECIPES.filter((r) => ['mr-5', 'mr-3', 'mr-4'].includes(r.id)),
      lanche: MEAL_RECIPES.filter((r) => ['mr-1', 'mr-7', 'mr-8'].includes(r.id)),
    }
    return slotPreferences[slot] ?? MEAL_RECIPES.slice(0, 4)
  }, [slot])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="r50-meal-ai-panel rounded-xl border border-primary/20 bg-primary/5 p-3"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Brain className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-bold text-primary">
          Sugestões IA para {SLOT_LABELS[slot]}
        </span>
      </div>
      <div className="space-y-1.5">
        {suggestions.map((recipe) => {
          const isSelected = recipe.id === currentMealId
          return (
            <motion.div
              key={recipe.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(recipe.id)}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-primary/15 border border-primary/30'
                  : 'bg-background/60 border border-transparent hover:border-primary/20'
              }`}
            >
              <span className="text-lg">{recipe.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold truncate">{recipe.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <DifficultyBadge difficulty={recipe.difficulty} />
                  <span className="text-[9px] text-muted-foreground tabular-nums">
                    {formatTime(recipe.prepTime + recipe.cookTime)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="h-2.5 w-2.5 text-orange-400" />
                <span className="text-[9px] font-bold tabular-nums">
                  {recipe.nutritionPerServing.calories} kcal
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ── Skeleton Loader ── */
function MealSkeleton() {
  return (
    <div className="r50-meal-skeleton rounded-2xl border border-border/50 overflow-hidden">
      <div className="flex items-center gap-2.5 p-4 pb-3">
        <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-48 bg-muted rounded animate-pulse mb-1.5" />
          <div className="h-3 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="px-4 pb-4 space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" style={{ opacity: 0.5 + i * 0.07 }} />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export function SmartMealPrep() {
  const [plan, setPlan] = useState<WeeklyPlan>(createEmptyPlan)
  const [mounted, setMounted] = useState(false)
  const [flippedCard, setFlippedCard] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'planner' | 'grocery' | 'swaps'>('planner')
  const [showAI, setShowAI] = useState<{ day: DayKey; slot: MealSlot } | null>(null)
  const [budget, setBudget] = useState(350)
  const [printMode, setPrintMode] = useState(false)
  const [servingsOverrides, setServingsOverrides] = useState<Record<string, number>>({})
  const printRef = useRef<HTMLDivElement>(null)

  // Hydration guard — load plan from localStorage
  useEffect(() => {
    setMounted(true)
    setPlan(loadPlan())
    try {
      const storedBudget = localStorage.getItem('domplace-meal-budget')
      if (storedBudget) setBudget(Number(storedBudget))
    } catch { /* ignore */ }
  }, [])

  // Save plan to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      savePlan(plan)
      try { localStorage.setItem('domplace-meal-budget', String(budget)) } catch { /* ignore */ }
    }
  }, [mounted, plan, budget])

  // ── Meal CRUD ──
  const setMealForSlot = useCallback((day: DayKey, slotIdx: number, mealId: string | null) => {
    setPlan((prev) => {
      const newDays = { ...prev.days }
      newDays[day] = [...newDays[day]]
      newDays[day][slotIdx] = { ...newDays[day][slotIdx], mealId }
      return { ...prev, days: newDays }
    })
    setShowAI(null)
  }, [])

  const setServingsForSlot = useCallback((day: DayKey, slotIdx: number, servings: number) => {
    const key = `${day}-${slotIdx}`
    setServingsOverrides((prev) => ({ ...prev, [key]: servings }))
    setPlan((prev) => {
      const newDays = { ...prev.days }
      newDays[day] = [...newDays[day]]
      newDays[day][slotIdx] = { ...newDays[day][slotIdx], servings }
      return { ...prev, days: newDays }
    })
  }, [])

  const getSlotServings = useCallback((day: DayKey, slotIdx: number): number => {
    return servingsOverrides[`${day}-${slotIdx}`] ?? 2
  }, [servingsOverrides])

  const clearPlan = useCallback(() => {
    setPlan(createEmptyPlan())
    setServingsOverrides({})
  }, [])

  // ── Weekly nutrition calculation ──
  const weeklyNutrition = useMemo(() => {
    const totals: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    for (const dk of DAY_KEYS) {
      for (const slotData of plan.days[dk]) {
        const recipe = getRecipeById(slotData.mealId)
        if (!recipe) continue
        const ratio = slotData.servings / recipe.servings
        totals.calories += Math.round(recipe.nutritionPerServing.calories * ratio)
        totals.protein += Math.round(recipe.nutritionPerServing.protein * ratio)
        totals.carbs += Math.round(recipe.nutritionPerServing.carbs * ratio)
        totals.fat += Math.round(recipe.nutritionPerServing.fat * ratio)
      }
    }
    return totals
  }, [plan])

  // ── Grocery list generation ──
  const groceryAisles = useMemo(() => {
    const aisleMap: Record<string, GroceryItem[]> = {}
    for (const dk of DAY_KEYS) {
      for (const slotData of plan.days[dk]) {
        const recipe = getRecipeById(slotData.mealId)
        if (!recipe) continue
        const ratio = slotData.servings / recipe.servings
        for (const ing of recipe.ingredients) {
          const existing = aisleMap[ing.aisle]?.find((i) => i.name === ing.name)
          if (existing) {
            existing.price += ing.pricePerUnit * ratio
          } else {
            if (!aisleMap[ing.aisle]) aisleMap[ing.aisle] = []
            aisleMap[ing.aisle].push({
              name: ing.name,
              qty: ing.qty,
              aisle: ing.aisle,
              price: Math.round(ing.pricePerUnit * ratio * 100) / 100,
              checked: false,
            })
          }
        }
      }
    }
    const result: GroceryAisle[] = []
    for (const [aisleId, items] of Object.entries(aisleMap)) {
      const aisleDef = AISLE_ORDER[aisleId]
      result.push({
        id: aisleId,
        name: aisleDef?.name ?? aisleId,
        emoji: aisleDef?.emoji ?? '📦',
        color: aisleDef?.color ?? 'text-muted-foreground',
        items,
      })
    }
    return result
  }, [plan])

  const groceryTotalCost = useMemo(
    () => groceryAisles.reduce((sum, a) => sum + a.items.reduce((s, i) => s + i.price, 0), 0),
    [groceryAisles],
  )

  // ── Smart Swaps aggregation ──
  const allSmartSwaps = useMemo(() => {
    const usedMealIds = new Set<string>()
    for (const dk of DAY_KEYS) {
      for (const slotData of plan.days[dk]) {
        if (slotData.mealId) usedMealIds.add(slotData.mealId)
      }
    }
    const swaps: SmartSwap[] = []
    for (const mealId of usedMealIds) {
      const recipe = getRecipeById(mealId)
      if (recipe) swaps.push(...recipe.smartSwaps)
    }
    return swaps
  }, [plan])

  const totalSmartSavings = useMemo(
    () => allSmartSwaps.reduce((sum, s) => sum + (s.originalPrice - s.swapPrice), 0),
    [allSmartSwaps],
  )

  // ── Count filled slots ──
  const filledSlots = useMemo(() => {
    let count = 0
    for (const dk of DAY_KEYS) {
      for (const slotData of plan.days[dk]) {
        if (slotData.mealId) count++
      }
    }
    return count
  }, [plan])

  // ── AI fill suggestion ──
  const handleAIFillAll = useCallback(() => {
    const mealIds = MEAL_RECIPES.map((r) => r.id)
    const newPlan = createEmptyPlan()
    for (const dk of DAY_KEYS) {
      for (let si = 0; si < SLOT_KEYS.length; si++) {
        const slot = SLOT_KEYS[si]
        const preferences: Record<MealSlot, string[]> = {
          cafe: ['mr-1', 'mr-2', 'mr-7', 'mr-5'],
          almoco: ['mr-3', 'mr-4', 'mr-6', 'mr-5'],
          jantar: ['mr-5', 'mr-3', 'mr-4', 'mr-6'],
          lanche: ['mr-1', 'mr-7', 'mr-8', 'mr-5'],
        }
        const pool = preferences[slot].filter((id) => mealIds.includes(id))
        const pick = pool[Math.floor(Math.random() * pool.length)]
        newPlan.days[dk][si].mealId = pick
      }
    }
    setPlan(newPlan)
  }, [])

  // ── Print handler ──
  const handlePrint = useCallback(() => {
    setPrintMode(true)
    setTimeout(() => {
      window.print()
      setTimeout(() => setPrintMode(false), 500)
    }, 300)
  }, [])

  // ── Save handler (explicit save, auto-save is also on) ──
  const handleSave = useCallback(() => {
    savePlan(plan)
    try { localStorage.setItem('domplace-meal-budget', String(budget)) } catch { /* ignore */ }
  }, [plan, budget])

  // ── Reset handler ──
  const handleReset = useCallback(() => {
    if (confirm('Limpar todo o plano semanal?')) {
      clearPlan()
    }
  }, [clearPlan])

  // ── Early return if not mounted ──
  if (!mounted) return <MealSkeleton />

  return (
    <div className="r50-meal-prep-container">
      <div className="rounded-2xl overflow-hidden glassmorphism-strong relative r62-card-lift">
        {/* Background mesh */}
        <div className="absolute inset-0 gradient-mesh opacity-10 pointer-events-none" />

        <div className="relative z-10" ref={printRef}>
          {/* ═══ Header ═══ */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md"
              >
                <UtensilsCrossed className="h-4.5 w-4.5 text-white" />
              </motion.div>
              <div>
                <h3 className="text-sm font-bold r50-meal-shimmer-text r62-heading-gradient">Smart Meal Prep</h3>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Planejamento inteligente de refeições
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[9px] font-bold">
                {filledSlots}/28 refeições
              </Badge>
            </div>
          </div>

          {/* ═══ Action Buttons Row ═══ */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="sm"
                  onClick={handleAIFillAll}
                  className="h-8 text-[10px] font-bold bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 text-white gap-1 rounded-lg"
                >
                  <Brain className="h-3 w-3" />
                  Preencher com IA
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  className="h-8 text-[10px] font-semibold gap-1 rounded-lg"
                >
                  <Save className="h-3 w-3" />
                  Salvar
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="h-8 text-[10px] font-semibold gap-1 rounded-lg"
                >
                  <RotateCcw className="h-3 w-3" />
                  Limpar
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrint}
                  className="h-8 text-[10px] font-semibold gap-1 rounded-lg print:hidden"
                >
                  <Printer className="h-3 w-3" />
                  Imprimir
                </Button>
              </motion.div>
            </div>
          </div>

          {/* ═══ Tab Switcher ═══ */}
          <div className="px-4 pb-3 print:hidden">
            <div className="flex items-center gap-1.5 bg-background/60 border border-border/50 rounded-lg p-1">
              {(['planner', 'grocery', 'swaps'] as const).map((tab) => {
                const labels: Record<string, string> = {
                  planner: '📅 Planejador',
                  grocery: '🛒 Lista de Compras',
                  swaps: '🔄 Smart Swaps',
                }
                const isActive = activeTab === tab
                return (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {labels[tab]}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* ═══ Planner Tab ═══ */}
          <AnimatePresence mode="wait">
            {activeTab === 'planner' && (
              <motion.div
                key="planner"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              >
                <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                {/* Day headers */}
                <div className="px-4 mb-2">
                  <div className="grid grid-cols-8 gap-1">
                    <div className="text-[8px] font-bold text-muted-foreground flex items-center justify-center">
                      Refeição
                    </div>
                    {DAY_KEYS.map((dk) => (
                      <div
                        key={dk}
                        className="text-[9px] font-bold text-center text-muted-foreground r50-meal-day-header"
                      >
                        {DAY_LABELS[dk]}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grid rows per slot type */}
                <div className="px-4 space-y-1.5">
                  {SLOT_KEYS.map((slot, slotIdx) => (
                    <motion.div
                      key={slot}
                      variants={fadeSlideUp}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: slotIdx * 0.08 }}
                    >
                      <div className="grid grid-cols-8 gap-1">
                        {/* Slot label */}
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{SLOT_EMOJIS[slot]}</span>
                          <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap">
                            {SLOT_LABELS[slot]}
                          </span>
                        </div>

                        {/* Day cells */}
                        {DAY_KEYS.map((dk) => {
                          const cellIdx = SLOT_KEYS.indexOf(slot)
                          const slotData = plan.days[dk][cellIdx]
                          const recipe = getRecipeById(slotData.mealId)
                          const isAI = showAI?.day === dk && showAI?.slot === slot
                          const servings = getSlotServings(dk, cellIdx)

                          return (
                            <motion.div
                              key={`${dk}-${slot}`}
                              variants={cellVariants}
                              className="r50-meal-cell"
                            >
                              {recipe ? (
                                /* ── Filled slot ── */
                                <RecipeFlipCard
                                  recipe={recipe}
                                  isFlipped={flippedCard === `${dk}-${slot}`}
                                  onFlip={() =>
                                    setFlippedCard((prev) =>
                                      prev === `${dk}-${slot}` ? null : `${dk}-${slot}`,
                                    )
                                  }
                                  servings={servings}
                                  onServingsChange={(n) => setServingsForSlot(dk, cellIdx, n)}
                                />
                              ) : (
                                /* ── Empty slot ── */
                                <motion.button
                                  whileHover={{
                                    scale: 1.04,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                  }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    setShowAI((prev) =>
                                      prev?.day === dk && prev?.slot === slot
                                        ? null
                                        : { day: dk, slot },
                                    )
                                  }
                                  className="r50-meal-empty-slot w-full aspect-square rounded-lg border border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center gap-0.5 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                                >
                                  <Plus className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-[7px] text-muted-foreground font-medium">
                                    Adicionar
                                  </span>
                                </motion.button>
                              )}

                              {/* AI suggestion popover */}
                              <AnimatePresence>
                                {isAI && !recipe && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                    className="absolute z-50 mt-1 w-56 shadow-lg"
                                    style={{ transformOrigin: 'top center' }}
                                  >
                                    <div className="r50-meal-ai-popover rounded-xl border border-primary/20 bg-popover p-2 shadow-xl">
                                      <AISuggestionPanel
                                        slot={slot}
                                        currentMealId={null}
                                        onSelect={(mealId) =>
                                          setMealForSlot(dk, cellIdx, mealId)
                                        }
                                      />
                                      {recipe && (
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          className="mt-2"
                                        >
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setMealForSlot(dk, cellIdx, null)}
                                            className="w-full min-h-[44px] h-7 text-[9px] text-red-500 hover:text-red-600"
                                          >
                                            Remover refeição
                                          </Button>
                                        </motion.div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
                </div>{/* end r59-mob: overflow-x-auto */}
                </div>{/* end r59-mob: min-w-[600px] */}

                {/* Weekly Nutrition Summary */}
                <div className="px-4 mt-4">
                  <WeeklyNutritionSummary nutrition={weeklyNutrition} />
                </div>

                {/* Budget Tracker */}
                <div className="px-4 mt-3">
                  <BudgetTracker spent={groceryTotalCost} budget={budget} />
                </div>
              </motion.div>
            )}

            {/* ═══ Grocery Tab ═══ */}
            {activeTab === 'grocery' && (
              <motion.div
                key="grocery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                className="px-4 pb-4"
              >
                <GroceryListView
                  aisles={groceryAisles}
                  totalCost={groceryTotalCost}
                  savings={totalSmartSavings}
                  printMode={printMode}
                />
              </motion.div>
            )}

            {/* ═══ Smart Swaps Tab ═══ */}
            {activeTab === 'swaps' && (
              <motion.div
                key="swaps"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                className="px-4 pb-4"
              >
                <div className="r50-meal-swaps-panel rounded-xl border border-border/50 overflow-hidden">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="h-4 w-4 text-white" />
                      <h3 className="text-sm font-bold text-white">Smart Swaps</h3>
                    </div>
                    <p className="text-[10px] text-white/70 mt-0.5">
                      Substituições inteligentes para economizar
                    </p>
                  </div>

                  <div className="p-3">
                    {allSmartSwaps.length > 0 ? (
                      <div className="space-y-2">
                        {allSmartSwaps.map((swap, idx) => (
                          <SmartSwapCard key={`swap-${idx}`} swap={swap} />
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8"
                      >
                        <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground font-medium">
                          Adicione refeições ao plano para ver sugestões de troca
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          Economize até 59% em alguns ingredientes!
                        </p>
                      </motion.div>
                    )}

                    {/* Total savings banner */}
                    {totalSmartSavings > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
                        className="mt-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3 text-center"
                      >
                        <p className="text-white text-xs font-bold">Economia Total com Swaps</p>
                        <motion.span
                          key={totalSmartSavings}
                          initial={{ scale: 1.4 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                          className="text-lg font-bold text-white block mt-1"
                        >
                          {formatBRL(totalSmartSavings)}
                        </motion.span>
                        <p className="text-[10px] text-white/70 mt-0.5">por semana</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ Footer ═══ */}
          <div className="px-4 py-3 border-t border-border/30 flex items-center justify-center gap-2 text-[9px] text-muted-foreground print:hidden">
            <Sparkles className="h-3 w-3" />
            <span>Planejamento otimizado por IA</span>
            <span className="text-muted-foreground/40">•</span>
            <span>Salvo automaticamente</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartMealPrep
