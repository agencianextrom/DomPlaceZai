'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanLine,
  Heart,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Cookie,
  Leaf,
  Pill,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
  Plus,
  X,
  UtensilsCrossed,
  Sun,
  Moon,
  Coffee,
  Apple,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Brain,
  CheckCircle2,
  CircleDot,
  ScanBarcode,
  Search,
  RefreshCw,
  Scale,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/* ═══════════════════════════════════════════════════════════════
   Types & Interfaces
   ═══════════════════════════════════════════════════════════════ */

interface NutrientDetail {
  label: string
  value: number
  unit: string
  dailyValue: number
  maxDaily: number
  color: string
  icon: string
}

interface AllergenItem {
  id: string
  name: string
  icon: string
  severity: 'high' | 'medium'
  type: 'contains' | 'may_contain'
  keywords: string[]
}

interface DietaryLabel {
  id: string
  name: string
  icon: string
  color: string
  active: boolean
}

interface IngredientEntry {
  name: string
  isAllergen: boolean
  allergenId?: string
}

interface ProductNutrition {
  id: string
  name: string
  brand: string
  image: string
  healthScore: number
  calories: number
  servingSize: string
  nutrients: NutrientDetail[]
  allergens: AllergenItem[]
  dietaryLabels: DietaryLabel[]
  ingredients: IngredientEntry[]
}

interface MealEntry {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  time: string
}

interface DailyIntake {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  water: number
}

interface DailyTarget {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  water: number
}

interface WeeklyTrend {
  day: string
  shortDay: string
  calories: number
}

interface SmartSuggestion {
  id: string
  title: string
  description: string
  icon: string
  severity: 'info' | 'warning' | 'success'
  nutrient?: string
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

/* ═══════════════════════════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════════════════════════ */

const MOCK_PRODUCTS: ProductNutrition[] = [
  {
    id: 'prod-1',
    name: 'Granola Integral Premium',
    brand: 'NaturVida',
    image: '🥣',
    healthScore: 82,
    calories: 210,
    servingSize: '40g (1 porção)',
    nutrients: [
      { label: 'Protein', value: 6, unit: 'g', dailyValue: 12, maxDaily: 50, color: '#3b82f6', icon: 'protein' },
      { label: 'Carbs', value: 34, unit: 'g', dailyValue: 11, maxDaily: 300, color: '#eab308', icon: 'carbs' },
      { label: 'Fat', value: 5, unit: 'g', dailyValue: 8, maxDaily: 65, color: '#ef4444', icon: 'fat' },
      { label: 'Fiber', value: 7, unit: 'g', dailyValue: 28, maxDaily: 25, color: '#22c55e', icon: 'fiber' },
      { label: 'Sugar', value: 8, unit: 'g', dailyValue: 16, maxDaily: 50, color: '#f97316', icon: 'sugar' },
      { label: 'Sodium', value: 85, unit: 'mg', dailyValue: 4, maxDaily: 2300, color: '#a855f7', icon: 'sodium' },
      { label: 'Calories', value: 210, unit: 'kcal', dailyValue: 11, maxDaily: 2000, color: '#f97316', icon: 'calories' },
    ],
    allergens: [
      { id: 'gluten', name: 'Gluten', icon: 'wheat', severity: 'high', type: 'contains', keywords: ['gluten', 'wheat', 'trigo'] },
      { id: 'nuts', name: 'Tree Nuts', icon: 'nut', severity: 'high', type: 'may_contain', keywords: ['almonds', 'amêndoas', 'nuts', 'castanhas'] },
      { id: 'soy', name: 'Soy', icon: 'soy', severity: 'medium', type: 'may_contain', keywords: ['soy', 'soja'] },
    ],
    dietaryLabels: [
      { id: 'organic', name: 'Organic', icon: 'leaf', color: '#22c55e', active: true },
      { id: 'high-fiber', name: 'High-Fiber', icon: 'fiber', color: '#3b82f6', active: true },
      { id: 'non-gmo', name: 'Non-GMO', icon: 'shield', color: '#06b6d4', active: true },
      { id: 'vegan', name: 'Vegan', icon: 'vegan', color: '#16a34a', active: false },
    ],
    ingredients: [
      { name: 'Whole grain oats', isAllergen: true, allergenId: 'gluten' },
      { name: 'Honey', isAllergen: false },
      { name: 'Almonds', isAllergen: true, allergenId: 'nuts' },
      { name: 'Dried cranberries', isAllergen: false },
      { name: 'Flax seeds', isAllergen: false },
      { name: 'Sunflower seeds', isAllergen: false },
      { name: 'Coconut oil', isAllergen: false },
      { name: 'Cinnamon', isAllergen: false },
      { name: 'Vanilla extract', isAllergen: false },
    ],
  },
  {
    id: 'prod-2',
    name: 'Greek Yogurt Protein',
    brand: 'ProFit',
    image: '🥛',
    healthScore: 91,
    calories: 150,
    servingSize: '170g (1 cup)',
    nutrients: [
      { label: 'Protein', value: 20, unit: 'g', dailyValue: 40, maxDaily: 50, color: '#3b82f6', icon: 'protein' },
      { label: 'Carbs', value: 8, unit: 'g', dailyValue: 3, maxDaily: 300, color: '#eab308', icon: 'carbs' },
      { label: 'Fat', value: 2, unit: 'g', dailyValue: 3, maxDaily: 65, color: '#ef4444', icon: 'fat' },
      { label: 'Fiber', value: 0, unit: 'g', dailyValue: 0, maxDaily: 25, color: '#22c55e', icon: 'fiber' },
      { label: 'Sugar', value: 6, unit: 'g', dailyValue: 12, maxDaily: 50, color: '#f97316', icon: 'sugar' },
      { label: 'Sodium', value: 60, unit: 'mg', dailyValue: 3, maxDaily: 2300, color: '#a855f7', icon: 'sodium' },
      { label: 'Calories', value: 150, unit: 'kcal', dailyValue: 8, maxDaily: 2000, color: '#f97316', icon: 'calories' },
    ],
    allergens: [
      { id: 'dairy', name: 'Dairy', icon: 'milk', severity: 'high', type: 'contains', keywords: ['dairy', 'milk', 'lactose', 'leite'] },
      { id: 'eggs', name: 'Eggs', icon: 'egg', severity: 'high', type: 'may_contain', keywords: ['eggs', 'ovos'] },
    ],
    dietaryLabels: [
      { id: 'high-protein', name: 'High-Protein', icon: 'dumbbell', color: '#3b82f6', active: true },
      { id: 'low-fat', name: 'Low-Fat', icon: 'droplet', color: '#06b6d4', active: true },
      { id: 'sugar-free', name: 'Sugar-Free', icon: 'x', color: '#ef4444', active: false },
      { id: 'organic', name: 'Organic', icon: 'leaf', color: '#22c55e', active: false },
    ],
    ingredients: [
      { name: 'Greek yogurt (milk)', isAllergen: true, allergenId: 'dairy' },
      { name: 'Whey protein concentrate', isAllergen: true, allergenId: 'dairy' },
      { name: 'Live active cultures', isAllergen: false },
      { name: 'Natural vanilla flavor', isAllergen: false },
      { name: 'Stevia', isAllergen: false },
    ],
  },
  {
    id: 'prod-3',
    name: 'Organic Almond Butter',
    brand: 'PureEarth',
    image: '🥜',
    healthScore: 74,
    calories: 190,
    servingSize: '32g (2 tbsp)',
    nutrients: [
      { label: 'Protein', value: 7, unit: 'g', dailyValue: 14, maxDaily: 50, color: '#3b82f6', icon: 'protein' },
      { label: 'Carbs', value: 6, unit: 'g', dailyValue: 2, maxDaily: 300, color: '#eab308', icon: 'carbs' },
      { label: 'Fat', value: 16, unit: 'g', dailyValue: 25, maxDaily: 65, color: '#ef4444', icon: 'fat' },
      { label: 'Fiber', value: 3, unit: 'g', dailyValue: 12, maxDaily: 25, color: '#22c55e', icon: 'fiber' },
      { label: 'Sugar', value: 2, unit: 'g', dailyValue: 4, maxDaily: 50, color: '#f97316', icon: 'sugar' },
      { label: 'Sodium', value: 45, unit: 'mg', dailyValue: 2, maxDaily: 2300, color: '#a855f7', icon: 'sodium' },
      { label: 'Calories', value: 190, unit: 'kcal', dailyValue: 10, maxDaily: 2000, color: '#f97316', icon: 'calories' },
    ],
    allergens: [
      { id: 'nuts', name: 'Tree Nuts', icon: 'nut', severity: 'high', type: 'contains', keywords: ['almonds', 'amêndoas'] },
      { id: 'dairy', name: 'Dairy', icon: 'milk', severity: 'medium', type: 'may_contain', keywords: ['milk', 'leite'] },
      { id: 'soy', name: 'Soy', icon: 'soy', severity: 'medium', type: 'may_contain', keywords: ['soy', 'soja'] },
    ],
    dietaryLabels: [
      { id: 'organic', name: 'Organic', icon: 'leaf', color: '#22c55e', active: true },
      { id: 'vegan', name: 'Vegan', icon: 'vegan', color: '#16a34a', active: true },
      { id: 'non-gmo', name: 'Non-GMO', icon: 'shield', color: '#06b6d4', active: true },
      { id: 'sugar-free', name: 'Sugar-Free', icon: 'x', color: '#ef4444', active: true },
    ],
    ingredients: [
      { name: 'Roasted almonds', isAllergen: true, allergenId: 'nuts' },
      { name: 'Organic palm oil', isAllergen: false },
      { name: 'Sea salt', isAllergen: false },
    ],
  },
  {
    id: 'prod-4',
    name: 'Whole Wheat Pasta',
    brand: 'GranoMax',
    image: '🍝',
    healthScore: 68,
    calories: 350,
    servingSize: '100g (dry)',
    nutrients: [
      { label: 'Protein', value: 14, unit: 'g', dailyValue: 28, maxDaily: 50, color: '#3b82f6', icon: 'protein' },
      { label: 'Carbs', value: 68, unit: 'g', dailyValue: 23, maxDaily: 300, color: '#eab308', icon: 'carbs' },
      { label: 'Fat', value: 2, unit: 'g', dailyValue: 3, maxDaily: 65, color: '#ef4444', icon: 'fat' },
      { label: 'Fiber', value: 8, unit: 'g', dailyValue: 32, maxDaily: 25, color: '#22c55e', icon: 'fiber' },
      { label: 'Sugar', value: 3, unit: 'g', dailyValue: 6, maxDaily: 50, color: '#f97316', icon: 'sugar' },
      { label: 'Sodium', value: 5, unit: 'mg', dailyValue: 0, maxDaily: 2300, color: '#a855f7', icon: 'sodium' },
      { label: 'Calories', value: 350, unit: 'kcal', dailyValue: 18, maxDaily: 2000, color: '#f97316', icon: 'calories' },
    ],
    allergens: [
      { id: 'gluten', name: 'Gluten', icon: 'wheat', severity: 'high', type: 'contains', keywords: ['gluten', 'wheat', 'trigo'] },
      { id: 'eggs', name: 'Eggs', icon: 'egg', severity: 'medium', type: 'contains', keywords: ['eggs', 'ovos'] },
    ],
    dietaryLabels: [
      { id: 'high-fiber', name: 'High-Fiber', icon: 'fiber', color: '#3b82f6', active: true },
      { id: 'non-gmo', name: 'Non-GMO', icon: 'shield', color: '#06b6d4', active: true },
      { id: 'vegan', name: 'Vegan', icon: 'vegan', color: '#16a34a', active: false },
      { id: 'organic', name: 'Organic', icon: 'leaf', color: '#22c55e', active: false },
    ],
    ingredients: [
      { name: 'Whole wheat flour', isAllergen: true, allergenId: 'gluten' },
      { name: 'Durum wheat semolina', isAllergen: true, allergenId: 'gluten' },
      { name: 'Eggs', isAllergen: true, allergenId: 'eggs' },
      { name: 'Niacin (iron)', isAllergen: false },
      { name: 'Riboflavin', isAllergen: false },
    ],
  },
]

const MOCK_WEEKLY_TRENDS: WeeklyTrend[] = [
  { day: 'Monday', shortDay: 'Mon', calories: 1850 },
  { day: 'Tuesday', shortDay: 'Tue', calories: 2100 },
  { day: 'Wednesday', shortDay: 'Wed', calories: 1920 },
  { day: 'Thursday', shortDay: 'Thu', calories: 2050 },
  { day: 'Friday', shortDay: 'Fri', calories: 2200 },
  { day: 'Saturday', shortDay: 'Sat', calories: 1780 },
  { day: 'Sunday', shortDay: 'Sun', calories: 1650 },
]

const MOCK_DAILY_TARGETS: DailyTarget = {
  calories: 2000,
  protein: 50,
  carbs: 300,
  fat: 65,
  fiber: 25,
  sugar: 50,
  sodium: 2300,
  water: 8,
}

const MOCK_MEAL_ITEMS: MealEntry[] = [
  { id: 'm1', name: 'Oatmeal with berries', calories: 320, protein: 12, carbs: 52, fat: 8, fiber: 8, sugar: 12, sodium: 80, time: '07:30' },
  { id: 'm2', name: 'Greek yogurt bowl', calories: 250, protein: 18, carbs: 22, fat: 10, fiber: 2, sugar: 8, sodium: 60, time: '08:15' },
  { id: 'm3', name: 'Grilled chicken salad', calories: 450, protein: 38, carbs: 18, fat: 22, fiber: 6, sugar: 5, sodium: 420, time: '12:30' },
  { id: 'm4', name: 'Brown rice & beans', calories: 380, protein: 16, carbs: 62, fat: 8, fiber: 12, sugar: 3, sodium: 380, time: '13:00' },
  { id: 'm5', name: 'Apple & almond butter', calories: 200, protein: 5, carbs: 24, fat: 11, fiber: 4, sugar: 14, sodium: 50, time: '15:30' },
  { id: 'm6', name: 'Salmon with vegetables', calories: 520, protein: 42, carbs: 16, fat: 28, fiber: 5, sugar: 4, sodium: 320, time: '19:00' },
]

const ALLERGEN_KEYWORD_MAP: Record<string, string[]> = {
  gluten: ['gluten', 'wheat', 'trigo', 'flour', 'farinha', 'barley', 'cevada', 'rye', 'centeio'],
  dairy: ['milk', 'leite', 'dairy', 'cheese', 'queijo', 'cream', 'creme', 'butter', 'manteiga', 'yogurt', 'iogurte', 'lactose', 'whey'],
  nuts: ['almonds', 'amêndoas', 'nuts', 'nozes', 'cashew', 'castanha', 'walnut', 'pecan', 'hazelnut', 'avelã', 'pistachio', 'pistache', 'macadamia'],
  soy: ['soy', 'soja', 'tofu', 'edamame', 'tempeh', 'soy sauce', 'shoyu'],
  eggs: ['eggs', 'ovos', 'egg', 'ovo', 'mayonnaise', 'maionese'],
  shellfish: ['shrimp', 'camarão', 'crab', 'caranguejo', 'lobster', 'lagosta', 'shellfish', 'clams', 'oysters'],
}

const MEAL_CONFIG: Record<MealType, { label: string; icon: string; color: string }> = {
  breakfast: { label: 'Breakfast', icon: 'sunrise', color: '#f97316' },
  lunch: { label: 'Lunch', icon: 'sun', color: '#eab308' },
  dinner: { label: 'Dinner', icon: 'moon', color: '#6366f1' },
  snack: { label: 'Snack', icon: 'coffee', color: '#a855f7' },
}

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */

const r57ContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

const r57ItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

const r57CardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 },
  },
}

const r57FadeSlideUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 26 },
  },
}

const r57ScaleIn = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function getHealthScoreColor(score: number): string {
  if (score < 40) return '#ef4444'
  if (score <= 70) return '#f59e0b'
  return '#22c55e'
}

function getHealthScoreLabel(score: number): string {
  if (score < 40) return 'Poor'
  if (score < 60) return 'Fair'
  if (score <= 70) return 'Good'
  if (score <= 85) return 'Very Good'
  return 'Excellent'
}

function getHealthScoreBg(score: number): string {
  if (score < 40) return 'rgba(239, 68, 68, 0.08)'
  if (score <= 70) return 'rgba(245, 158, 11, 0.08)'
  return 'rgba(34, 197, 94, 0.08)'
}

function getNutrientIcon(icon: string) {
  switch (icon) {
    case 'protein': return <Beef className="h-3.5 w-3.5" />
    case 'carbs': return <Wheat className="h-3.5 w-3.5" />
    case 'fat': return <Droplets className="h-3.5 w-3.5" />
    case 'fiber': return <Leaf className="h-3.5 w-3.5" />
    case 'sugar': return <Cookie className="h-3.5 w-3.5" />
    case 'sodium': return <Pill className="h-3.5 w-3.5" />
    case 'calories': return <Flame className="h-3.5 w-3.5" />
    default: return <CircleDot className="h-3.5 w-3.5" />
  }
}

function getAllergenIcon(icon: string) {
  switch (icon) {
    case 'wheat': return <Wheat className="h-4 w-4" />
    case 'milk': return <Droplets className="h-4 w-4" />
    case 'nut': return <ShieldAlert className="h-4 w-4" />
    case 'soy': return <Leaf className="h-4 w-4" />
    case 'egg': return <Scale className="h-4 w-4" />
    case 'shellfish': return <AlertTriangle className="h-4 w-4" />
    default: return <AlertTriangle className="h-4 w-4" />
  }
}

function getDietaryIcon(icon: string) {
  switch (icon) {
    case 'leaf': return <Leaf className="h-3 w-3" />
    case 'vegan': return <Leaf className="h-3 w-3" />
    case 'shield': return <ShieldCheck className="h-3 w-3" />
    case 'dumbbell': return <Beef className="h-3 w-3" />
    case 'droplet': return <Droplets className="h-3 w-3" />
    case 'fiber': return <Leaf className="h-3 w-3" />
    case 'x': return <X className="h-3 w-3" />
    default: return <CheckCircle2 className="h-3 w-3" />
  }
}

function getMealIcon(mealType: MealType) {
  switch (mealType) {
    case 'breakfast': return <Sun className="h-4 w-4" />
    case 'lunch': return <Coffee className="h-4 w-4" />
    case 'dinner': return <Moon className="h-4 w-4" />
    case 'snack': return <Apple className="h-4 w-4" />
  }
}

function clampPercent(value: number, max: number): number {
  return max > 0 ? Math.min((value / max) * 100, 100) : 0
}

/* ═══════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════ */

/* ── Animated Circular Health Score Ring ── */
function HealthScoreRing({ score, size = 120, animate = true }: { score: number; size?: number; animate?: boolean }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = clampPercent(score, 100)
  const dashOffset = circumference - (pct / 100) * circumference
  const color = getHealthScoreColor(score)
  const label = getHealthScoreLabel(score)

  return (
    <div className="r57-health-ring-wrap flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
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
          {/* Animated progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: dashOffset }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ type: 'spring' as const, stiffness: 80, damping: 15, delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={score}
            initial={animate ? { scale: 1.4, opacity: 0 } : undefined}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 18, delay: 0.5 }}
            className="text-2xl font-extrabold tabular-nums"
            style={{ color }}
          >
            {score}
          </motion.span>
          <span className="text-[9px] text-muted-foreground font-medium">/ 100</span>
        </div>
      </div>
      <Badge
        className="r57-health-label-badge text-[10px] font-semibold px-2.5 py-0.5 border-0"
        style={{ backgroundColor: getHealthScoreBg(score), color }}
      >
        {label}
      </Badge>
    </div>
  )
}

/* ── Nutrient Progress Bar ── */
function NutrientProgressBar({
  nutrient,
  delay,
  showDailyRing,
}: {
  nutrient: NutrientDetail
  delay: number
  showDailyRing?: boolean
}) {
  const pct = clampPercent(nutrient.value, nutrient.maxDaily) || clampPercent(nutrient.dailyValue, 100)
  const icon = getNutrientIcon(nutrient.icon)

  if (showDailyRing) {
    return (
      <div className="r57-nutrient-ring-item flex flex-col items-center gap-1">
        <DailyValueRing
          percentage={Math.min(nutrient.dailyValue, 150)}
          color={nutrient.color}
          size={52}
          delay={delay}
        />
        <span className="text-[9px] text-muted-foreground font-medium text-center leading-tight">
          {nutrient.label}
        </span>
        <span className="text-[10px] font-bold tabular-nums" style={{ color: nutrient.color }}>
          {nutrient.value}{nutrient.unit}
        </span>
      </div>
    )
  }

  return (
    <motion.div
      variants={r57ItemVariants}
      className="r57-nutrient-bar-row flex items-center gap-3"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 15, delay }}
        className="flex items-center justify-center h-8 w-8 rounded-lg shrink-0"
        style={{ backgroundColor: `${nutrient.color}15`, color: nutrient.color }}
      >
        {icon}
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">{nutrient.label}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tabular-nums" style={{ color: nutrient.color }}>
              {nutrient.value}{nutrient.unit}
            </span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: delay + 0.2 }}
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${nutrient.color}15`, color: nutrient.color }}
            >
              {nutrient.dailyValue}% DV
            </motion.span>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${nutrient.color}12` }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: nutrient.color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 0.8, delay: delay + 0.15, ease: 'easeOut' as const }}
          />
        </div>
      </div>
    </motion.div>
  )
}

/* ── Daily Value Percentage Ring ── */
function DailyValueRing({
  percentage,
  color,
  size = 52,
  delay = 0,
}: {
  percentage: number
  color: string
  size?: number
  delay?: number
}) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedPct = Math.min(percentage, 100)
  const dashOffset = circumference - (clampedPct / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
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
          transition={{ type: 'spring' as const, stiffness: 100, damping: 14, delay }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
          className="text-[9px] font-bold tabular-nums"
          style={{ color }}
        >
          {Math.round(percentage)}%
        </motion.span>
      </div>
    </div>
  )
}

/* ── Allergen Alert Badge ── */
function AllergenBadge({ allergen, delay }: { allergen: AllergenItem; delay: number }) {
  const isContains = allergen.type === 'contains'
  const icon = getAllergenIcon(allergen.icon)

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 350, damping: 22, delay }}
      className={`r57-allergen-badge flex items-center gap-2 px-3 py-2 rounded-lg border ${
        isContains
          ? 'r57-allergen-contains bg-red-500/8 border-red-500/25'
          : 'r57-allergen-may-contain bg-amber-500/8 border-amber-500/25'
      }`}
    >
      <div className={`flex items-center justify-center h-7 w-7 rounded-full shrink-0 ${
        isContains ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-500'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold">{allergen.name}</p>
        <p className={`text-[9px] font-medium ${isContains ? 'text-red-500/70' : 'text-amber-500/70'}`}>
          {isContains ? 'Contains' : 'May contain'}
        </p>
      </div>
      <motion.div
        animate={allergen.severity === 'high' ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <AlertTriangle className={`h-3.5 w-3.5 ${isContains ? 'text-red-400' : 'text-amber-400'}`} />
      </motion.div>
    </motion.div>
  )
}

/* ── Allergen Section: Contains vs May Contain ── */
function AllergenSection({ allergens }: { allergens: AllergenItem[] }) {
  const contains = allergens.filter((a) => a.type === 'contains')
  const mayContain = allergens.filter((a) => a.type === 'may_contain')

  if (allergens.length === 0) return null

  return (
    <motion.div variants={r57FadeSlideUp} className="r57-allergen-section space-y-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-red-500" />
        <span className="text-xs font-bold">Allergen Alerts</span>
        <Badge variant="destructive" className="text-[9px] px-1.5">
          {allergens.length}
        </Badge>
      </div>

      {/* Contains section */}
      {contains.length > 0 && (
        <div className="r57-allergen-contains-section space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <ShieldAlert className="h-3 w-3 text-red-500" />
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Contains</span>
          </div>
          <div className="space-y-1.5">
            {contains.map((a, i) => (
              <AllergenBadge key={a.id} allergen={a} delay={i * 0.08} />
            ))}
          </div>
        </div>
      )}

      {/* May contain section */}
      {mayContain.length > 0 && (
        <div className="r57-allergen-may-section space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">May contain</span>
          </div>
          <div className="space-y-1.5">
            {mayContain.map((a, i) => (
              <AllergenBadge key={a.id} allergen={a} delay={0.2 + i * 0.08} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

/* ── Dietary Label Badge ── */
function DietaryLabelBadge({ label, delay }: { label: DietaryLabel; delay: number }) {
  if (!label.active) return null
  const icon = getDietaryIcon(label.icon)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 18, delay }}
      className="r57-dietary-badge flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold"
      style={{ borderColor: `${label.color}30`, backgroundColor: `${label.color}10`, color: label.color }}
    >
      {icon}
      {label.name}
    </motion.div>
  )
}

/* ── Ingredient List with highlightable allergen keywords ── */
function IngredientList({ ingredients }: { ingredients: IngredientEntry[] }) {
  const [highlightedAllergen, setHighlightedAllergen] = useState<string | null>(null)

  const toggleHighlight = useCallback((allergenId: string | undefined) => {
    setHighlightedAllergen((prev) => (prev === allergenId ? null : allergenId || null))
  }, [])

  return (
    <motion.div variants={r57FadeSlideUp} className="r57-ingredient-section space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold">Ingredients</span>
        </div>
        {highlightedAllergen && (
          <motion.div layout className="flex items-center gap-1">
            <Badge className="text-[9px] bg-red-500/15 text-red-600 border-red-500/25">
              Highlighted
            </Badge>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setHighlightedAllergen(null)}
              className="h-5 w-5 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </motion.button>
          </motion.div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ingredients.map((ing, idx) => (
          <motion.button
            key={`${ing.name}-${idx}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 20, delay: idx * 0.04 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleHighlight(ing.allergenId)}
            className={`r57-ingredient-chip px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all cursor-pointer ${
              ing.isAllergen && highlightedAllergen === ing.allergenId
                ? 'r57-ingredient-highlighted bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-400'
                : ing.isAllergen && !highlightedAllergen
                  ? 'r57-ingredient-allergen bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                  : highlightedAllergen && !ing.isAllergen
                    ? 'r57-ingredient-dimmed bg-muted/30 border-border/20 text-muted-foreground/40'
                    : 'bg-muted/50 border-border/30 text-foreground'
            }`}
          >
            {ing.isAllergen && !highlightedAllergen && (
              <AlertTriangle className="inline h-2.5 w-2.5 mr-1 text-amber-500" />
            )}
            {ing.name}
          </motion.button>
        ))}
      </div>
      {highlightedAllergen && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[9px] text-red-500/70 italic px-1"
        >
          Tap any ingredient to highlight its allergen group. Tap again to clear.
        </motion.p>
      )}
    </motion.div>
  )
}

/* ── Compare Nutrition Side-by-Side ── */
function CompareNutrition({ products }: { products: ProductNutrition[] }) {
  const [selectedA, setSelectedA] = useState(0)
  const [selectedB, setSelectedB] = useState(1)
  const [showCompare, setShowCompare] = useState(false)

  const productA = products[selectedA]
  const productB = products[selectedB]

  if (products.length < 2) return null

  return (
    <motion.div variants={r57CardVariants} className="r57-compare-section space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold">Compare Nutrition</span>
        </div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompare(!showCompare)}
            className="r57-compare-toggle text-[10px] h-7"
          >
            {showCompare ? 'Hide' : 'Compare'}
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCompare && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' as const }}
            className="overflow-hidden"
          >
            <div className="r57-compare-grid grid grid-cols-2 gap-3">
              {/* Product A */}
              <div className="r57-compare-card-a rounded-xl border border-border/50 p-3 bg-card space-y-2">
                <select
                  value={selectedA}
                  onChange={(e) => setSelectedA(Number(e.target.value))}
                  className="r57-compare-select w-full text-[10px] font-semibold bg-muted/50 rounded-md px-2 py-1 border border-border/50"
                >
                  {products.map((p, i) => (
                    <option key={p.id} value={i}>{p.image} {p.name}</option>
                  ))}
                </select>
                <div className="flex items-center justify-center">
                  <HealthScoreRing score={productA.healthScore} size={72} animate={false} />
                </div>
                <div className="space-y-1.5">
                  {productA.nutrients.slice(0, 5).map((n) => (
                    <div key={n.label} className="flex items-center justify-between text-[9px]">
                      <span className="text-muted-foreground">{n.label}</span>
                      <span className="font-bold tabular-nums" style={{ color: n.color }}>
                        {n.value}{n.unit}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[10px] font-bold" style={{ color: getHealthScoreColor(productA.healthScore) }}>
                  {productA.calories} kcal
                </p>
              </div>

              {/* VS Divider */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden">
                <div className="r57-vs-badge h-8 w-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-extrabold text-primary-foreground">
                  VS
                </div>
              </div>

              {/* Product B */}
              <div className="r57-compare-card-b rounded-xl border border-border/50 p-3 bg-card space-y-2">
                <select
                  value={selectedB}
                  onChange={(e) => setSelectedB(Number(e.target.value))}
                  className="r57-compare-select w-full text-[10px] font-semibold bg-muted/50 rounded-md px-2 py-1 border border-border/50"
                >
                  {products.map((p, i) => (
                    <option key={p.id} value={i}>{p.image} {p.name}</option>
                  ))}
                </select>
                <div className="flex items-center justify-center">
                  <HealthScoreRing score={productB.healthScore} size={72} animate={false} />
                </div>
                <div className="space-y-1.5">
                  {productB.nutrients.slice(0, 5).map((n) => (
                    <div key={n.label} className="flex items-center justify-between text-[9px]">
                      <span className="text-muted-foreground">{n.label}</span>
                      <span className="font-bold tabular-nums" style={{ color: n.color }}>
                        {n.value}{n.unit}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[10px] font-bold" style={{ color: getHealthScoreColor(productB.healthScore) }}>
                  {productB.calories} kcal
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Daily Intake Tracker ── */
function DailyIntakeTracker({
  intake,
  targets,
}: {
  intake: DailyIntake
  targets: DailyTarget
}) {
  const intakeItems = [
    { label: 'Calories', value: intake.calories, max: targets.calories, unit: 'kcal', color: '#f97316', icon: <Flame className="h-3 w-3" /> },
    { label: 'Protein', value: intake.protein, max: targets.protein, unit: 'g', color: '#3b82f6', icon: <Beef className="h-3 w-3" /> },
    { label: 'Carbs', value: intake.carbs, max: targets.carbs, unit: 'g', color: '#eab308', icon: <Wheat className="h-3 w-3" /> },
    { label: 'Fat', value: intake.fat, max: targets.fat, unit: 'g', color: '#ef4444', icon: <Droplets className="h-3 w-3" /> },
    { label: 'Fiber', value: intake.fiber, max: targets.fiber, unit: 'g', color: '#22c55e', icon: <Leaf className="h-3 w-3" /> },
    { label: 'Sugar', value: intake.sugar, max: targets.sugar, unit: 'g', color: '#f97316', icon: <Cookie className="h-3 w-3" /> },
    { label: 'Sodium', value: intake.sodium, max: targets.sodium, unit: 'mg', color: '#a855f7', icon: <Pill className="h-3 w-3" /> },
  ]

  const totalPct = clampPercent(intake.calories, targets.calories)
  const overLimit = totalPct > 100

  return (
    <motion.div variants={r57CardVariants} className="r57-intake-section space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold">Daily Intake</span>
        </div>
        <motion.span
          key={Math.round(totalPct)}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 18 }}
          className={`text-[10px] font-bold tabular-nums ${overLimit ? 'text-red-500' : 'text-emerald-500'}`}
        >
          {Math.round(totalPct)}%
        </motion.span>
      </div>

      {/* Calorie overview bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>{intake.calories} / {targets.calories} kcal</span>
          <span>{overLimit ? 'Over limit!' : 'On track'}</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden bg-muted/50">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: overLimit
                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                : 'linear-gradient(90deg, #22c55e, #16a34a)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(totalPct, 100)}%` }}
            transition={{ type: 'spring' as const, stiffness: 120, damping: 18 }}
          />
        </div>
      </div>

      {/* Nutrient bars */}
      <div className="space-y-2.5">
        {intakeItems.map((item, idx) => {
          const pct = clampPercent(item.value, item.max)
          const isOver = pct > 100
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded flex items-center justify-center" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
                <span className={`text-[10px] font-bold tabular-nums ${isOver ? 'text-red-500' : ''}`} style={!isOver ? { color: item.color } : undefined}>
                  {item.value}{item.unit}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-muted/40">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: isOver ? '#ef4444' : item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ type: 'spring' as const, stiffness: 140, damping: 18, delay: idx * 0.05 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ── Meal Logger ── */
function MealLogger({
  meals,
  onAddMeal,
}: {
  meals: Record<MealType, MealEntry[]>
  onAddMeal: (type: MealType) => void
}) {
  const [activeTab, setActiveTab] = useState<MealType>('breakfast')

  return (
    <motion.div variants={r57CardVariants} className="r57-meal-logger space-y-3">
      <div className="flex items-center gap-2">
        <UtensilsCrossed className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold">Meal Log</span>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MealType)} className="r57-meal-tabs w-full">
        <TabsList className="r57-meal-tabs-list h-8 w-full grid grid-cols-4 gap-1 bg-muted/30 p-0.5 rounded-lg">
          {(Object.keys(MEAL_CONFIG) as MealType[]).map((type) => {
            const cfg = MEAL_CONFIG[type]
            return (
              <TabsTrigger
                key={type}
                value={type}
                className="r57-meal-tab-trigger flex flex-col items-center gap-0.5 text-[8px] font-medium py-1 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <span style={{ color: cfg.color }}>{getMealIcon(type)}</span>
                <span>{cfg.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {(Object.keys(MEAL_CONFIG) as MealType[]).map((type) => (
          <TabsContent key={type} value={type} className="mt-2">
            <div className="space-y-2 max-h-48 overflow-y-auto r57-meal-log-list">
              {meals[type].length === 0 ? (
                <div className="flex flex-col items-center py-4 text-muted-foreground">
                  <UtensilsCrossed className="h-6 w-6 mb-1 opacity-40" />
                  <span className="text-[10px]">No meals logged yet</span>
                </div>
              ) : (
                meals[type].map((meal, idx) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 350, damping: 22, delay: idx * 0.05 }}
                    className="r57-meal-entry flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 border border-border/20"
                  >
                    <Flame className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium truncate">{meal.name}</p>
                      <p className="text-[9px] text-muted-foreground">{meal.time}</p>
                    </div>
                    <span className="text-[10px] font-bold tabular-nums text-orange-500">{meal.calories} kcal</span>
                  </motion.div>
                ))
              )}
            </div>

            <motion.div whileTap={{ scale: 0.97 }} className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddMeal(type)}
                className="r57-add-meal-btn w-full h-8 text-[10px] gap-1.5"
              >
                <Plus className="h-3 w-3" />
                Add {MEAL_CONFIG[type].label} Item
              </Button>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  )
}

/* ── Weekly Trends Mini Chart (7-day bar chart) ── */
function WeeklyTrendsChart({ trends }: { trends: WeeklyTrend[] }) {
  const maxCal = Math.max(...trends.map((t) => t.calories), 1)
  const avgCal = trends.reduce((sum, t) => sum + t.calories, 0) / trends.length
  const targetCal = 2000

  return (
    <motion.div variants={r57CardVariants} className="r57-trends-section space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold">Weekly Trends</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-muted-foreground">Avg:</span>
          <span className="text-[10px] font-bold tabular-nums">{Math.round(avgCal)} kcal</span>
        </div>
      </div>

      {/* Target line label */}
      <div className="flex items-center gap-2 mb-1">
        <div className="h-px flex-1 bg-muted/30 border-dashed border-t border-primary/40" />
        <span className="text-[8px] text-primary/60 font-medium">Target: {targetCal}</span>
        <div className="h-px flex-1 bg-muted/30 border-dashed border-t border-primary/40" />
      </div>

      {/* Bar chart */}
      <div className="r57-trends-chart flex items-end justify-between gap-2 h-32 px-1">
        {trends.map((trend, idx) => {
          const pct = (trend.calories / maxCal) * 100
          const isOver = trend.calories > targetCal
          const barColor = isOver ? '#ef4444' : trend.calories > targetCal * 0.9 ? '#f59e0b' : '#22c55e'

          return (
            <div key={trend.day} className="flex flex-col items-center gap-1 flex-1">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.06 }}
                className="text-[8px] font-bold tabular-nums"
                style={{ color: barColor }}
              >
                {trend.calories}
              </motion.span>
              <div className="w-full flex justify-center" style={{ height: '80px' }}>
                <motion.div
                  className="r57-trend-bar w-full max-w-[28px] rounded-t-md"
                  style={{ backgroundColor: barColor }}
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ type: 'spring' as const, stiffness: 180, damping: 20, delay: 0.2 + idx * 0.06 }}
                />
              </div>
              <span className="text-[8px] text-muted-foreground font-medium">{trend.shortDay}</span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-emerald-500" />
          <span className="text-[8px] text-muted-foreground">Under target</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-amber-500" />
          <span className="text-[8px] text-muted-foreground">Near target</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-red-500" />
          <span className="text-[8px] text-muted-foreground">Over target</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Smart Suggestions ── */
function SmartSuggestions({ intake, targets }: { intake: DailyIntake; targets: DailyTarget }) {
  const suggestions = useMemo<SmartSuggestion[]>(() => {
    const result: SmartSuggestion[] = []

    if (intake.protein < targets.protein * 0.6) {
      result.push({
        id: 's1',
        title: 'Increase Protein Intake',
        description: `You're at ${Math.round(clampPercent(intake.protein, targets.protein))}% of your daily protein goal. Try adding lean meat, eggs, or legumes.`,
        icon: 'protein',
        severity: 'warning',
        nutrient: 'Protein',
      })
    }

    if (intake.fiber < targets.fiber * 0.5) {
      result.push({
        id: 's2',
        title: 'Add More Fiber',
        description: `Only ${intake.fiber}g of ${targets.fiber}g daily fiber target. Whole grains, fruits, and vegetables can help.`,
        icon: 'fiber',
        severity: 'warning',
        nutrient: 'Fiber',
      })
    }

    if (intake.sodium > targets.sodium * 0.8) {
      result.push({
        id: 's3',
        title: 'Watch Your Sodium',
        description: `Sodium intake is high at ${intake.sodium}mg. Consider reducing processed foods and adding fresh options.`,
        icon: 'sodium',
        severity: 'warning',
        nutrient: 'Sodium',
      })
    }

    if (intake.sugar > targets.sugar * 0.7) {
      result.push({
        id: 's4',
        title: 'Reduce Sugar',
        description: `${intake.sugar}g of sugar consumed. Try swapping sugary snacks for fresh fruit.`,
        icon: 'sugar',
        severity: 'info',
        nutrient: 'Sugar',
      })
    }

    if (intake.calories <= targets.calories && intake.calories >= targets.calories * 0.8) {
      result.push({
        id: 's5',
        title: 'Great Calorie Balance!',
        description: `You're within a healthy range at ${intake.calories} kcal. Keep up the balanced eating!`,
        icon: 'sparkles',
        severity: 'success',
      })
    }

    if (intake.water < 6) {
      result.push({
        id: 's6',
        title: 'Stay Hydrated',
        description: `Only ${intake.water} glasses of water today. Aim for at least 8 to stay properly hydrated.`,
        icon: 'water',
        severity: 'info',
      })
    }

    return result
  }, [intake, targets])

  if (suggestions.length === 0) return null

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'warning': return { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', icon: '#f59e0b' }
      case 'success': return { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.2)', icon: '#22c55e' }
      default: return { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', icon: '#3b82f6' }
    }
  }

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'protein': return <Beef className="h-4 w-4" />
      case 'fiber': return <Leaf className="h-4 w-4" />
      case 'sodium': return <Pill className="h-4 w-4" />
      case 'sugar': return <Cookie className="h-4 w-4" />
      case 'water': return <Droplets className="h-4 w-4" />
      case 'sparkles': return <Sparkles className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  return (
    <motion.div variants={r57CardVariants} className="r57-suggestions-section space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold">Smart Suggestions</span>
        <Badge variant="secondary" className="text-[9px] px-1.5">
          AI
        </Badge>
      </div>

      <div className="space-y-2">
        {suggestions.map((s, idx) => {
          const style = getSeverityStyle(s.severity)
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring' as const, stiffness: 350, damping: 22, delay: idx * 0.08 }}
              className="r57-suggestion-card flex gap-2.5 p-3 rounded-lg border"
              style={{ backgroundColor: style.bg, borderColor: style.border }}
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg shrink-0" style={{ color: style.icon, backgroundColor: `${style.icon}15` }}>
                {getIcon(s.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-semibold">{s.title}</p>
                  {s.severity === 'success' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                </div>
                <p className="text-[9px] text-muted-foreground leading-relaxed mt-0.5">{s.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ── Animated Scanner Effect ── */
function ScannerEffect({
  isScanning,
  onComplete,
}: {
  isScanning: boolean
  onComplete: () => void
}) {
  const scanRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isScanning) return
    const timer = setTimeout(() => {
      onComplete()
    }, 2800)
    return () => clearTimeout(timer)
  }, [isScanning, onComplete])

  return (
    <motion.div
      variants={r57CardVariants}
      className="r57-scanner-section rounded-xl border border-border/50 overflow-hidden"
    >
      {/* Scanner viewport */}
      <div className="r57-scanner-viewport relative h-48 bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col items-center justify-center overflow-hidden">
        {/* Barcode lines decoration */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="h-full bg-white mx-px"
              style={{
                width: Math.random() > 0.5 ? '2px' : '1px',
                opacity: 0.3 + Math.random() * 0.7,
              }}
            />
          ))}
        </div>

        {/* Corner brackets */}
        <div className="r57-scanner-corner r57-scanner-corner-tl absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
        <div className="r57-scanner-corner r57-scanner-corner-tr absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
        <div className="r57-scanner-corner r57-scanner-corner-bl absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
        <div className="r57-scanner-corner r57-scanner-corner-br absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-emerald-400 rounded-br" />

        {/* Scan text */}
        <motion.div
          animate={isScanning ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.4 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
          className="relative z-10 flex items-center gap-2 mb-3"
        >
          <ScanBarcode className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400">
            {isScanning ? 'Scanning...' : 'Tap to scan'}
          </span>
        </motion.div>

        <p className="relative z-10 text-[9px] text-emerald-400/50 font-medium">
          Point at a product barcode
        </p>

        {/* Animated scan line */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              ref={scanRef}
              className="absolute left-2 right-2 h-0.5 z-20"
              style={{
                background: 'linear-gradient(90deg, transparent, #22c55e, transparent)',
                boxShadow: '0 0 12px rgba(34, 197, 94, 0.6)',
              }}
              initial={{ top: '10%' }}
              animate={{ top: ['10%', '85%', '10%'] }}
              transition={{ duration: 2.5, ease: 'easeInOut' as const }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Success flash */}
        <AnimatePresence>
          {!isScanning && (
            <motion.div
              className="absolute inset-0 bg-emerald-500/20 z-30"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Scan button */}
      <div className="p-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Product Scanner</span>
        </div>
        <motion.div whileTap={{ scale: 0.93 }}>
          <Button
            size="sm"
            onClick={isScanning ? undefined : onComplete}
            className="r57-scan-btn h-7 text-[10px] gap-1.5"
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                >
                  <RefreshCw className="h-3 w-3" />
                </motion.div>
                Scanning
              </>
            ) : (
              <>
                <ScanLine className="h-3 w-3" />
                Scan Now
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ── Product Nutrition Card ── */
function ProductNutritionCard({
  product,
  index,
}: {
  product: ProductNutrition
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const [showDailyRings, setShowDailyRings] = useState(false)
  const mainNutrients = product.nutrients.filter((n) => n.icon !== 'calories')

  return (
    <motion.div
      variants={r57CardVariants}
      custom={index}
      className="r57-product-card rounded-2xl border border-border/50 overflow-hidden bg-card"
    >
      {/* Header with health score */}
      <div className="r57-product-header flex items-start gap-4 p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: index * 0.1 }}
          className="text-4xl"
        >
          {product.image}
        </motion.div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold truncate">{product.name}</h3>
          <p className="text-[10px] text-muted-foreground">{product.brand}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[9px] text-muted-foreground">{product.servingSize}</span>
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-bold text-orange-500 tabular-nums">{product.calories}</span>
              <span className="text-[9px] text-orange-400">kcal</span>
            </div>
          </div>
        </div>

        <HealthScoreRing score={product.healthScore} size={68} animate />
      </div>

      {/* Dietary labels */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {product.dietaryLabels.map((label, idx) => (
            <DietaryLabelBadge key={label.id} label={label} delay={0.2 + idx * 0.06} />
          ))}
        </div>
      </div>

      {/* Toggle expand */}
      <div className="px-4 pb-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-[10px] text-primary font-medium hover:underline"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? 'Show less' : 'Show full breakdown'}
        </motion.button>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' as const }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Toggle view mode */}
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDailyRings(false)}
                  className={`r57-view-toggle text-[9px] font-medium px-2.5 py-1 rounded-md transition-colors ${
                    !showDailyRings ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  Bars
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDailyRings(true)}
                  className={`r57-view-toggle text-[9px] font-medium px-2.5 py-1 rounded-md transition-colors ${
                    showDailyRings ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  Rings
                </motion.button>
              </div>

              {/* Nutrient breakdown */}
              {showDailyRings ? (
                <div className="flex items-start justify-around gap-2 flex-wrap">
                  {mainNutrients.map((nutrient, idx) => (
                    <NutrientProgressBar
                      key={nutrient.label}
                      nutrient={nutrient}
                      delay={idx * 0.06}
                      showDailyRing
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {mainNutrients.map((nutrient, idx) => (
                    <NutrientProgressBar
                      key={nutrient.label}
                      nutrient={nutrient}
                      delay={idx * 0.06}
                    />
                  ))}
                </div>
              )}

              {/* Allergens */}
              <div className="border-t border-border/30 pt-3">
                <AllergenSection allergens={product.allergens} />
              </div>

              {/* Ingredients */}
              <div className="border-t border-border/30 pt-3">
                <IngredientList ingredients={product.ingredients} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export function NutritionLens() {
  const [isScanning, setIsScanning] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [activeView, setActiveView] = useState<'scanner' | 'tracker' | 'compare'>('scanner')

  const [dailyIntake, setDailyIntake] = useState<DailyIntake>({
    calories: 1350,
    protein: 38,
    carbs: 145,
    fat: 42,
    fiber: 12,
    sugar: 28,
    sodium: 680,
    water: 5,
  })

  const [meals, setMeals] = useState<Record<MealType, MealEntry[]>>({
    breakfast: MOCK_MEAL_ITEMS.filter((m) => ['m1', 'm2'].includes(m.id)),
    lunch: MOCK_MEAL_ITEMS.filter((m) => ['m3', 'm4'].includes(m.id)),
    dinner: MOCK_MEAL_ITEMS.filter((m) => m.id === 'm6'),
    snack: MOCK_MEAL_ITEMS.filter((m) => m.id === 'm5'),
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentProduct = MOCK_PRODUCTS[selectedProduct]

  const handleScanComplete = useCallback(() => {
    setIsScanning(false)
    setSelectedProduct((prev) => (prev + 1) % MOCK_PRODUCTS.length)
  }, [])

  const handleAddMeal = useCallback((type: MealType) => {
    const randomCalories = 150 + Math.floor(Math.random() * 300)
    const newMeal: MealEntry = {
      id: `meal-${Date.now()}`,
      name: `Custom ${type} item`,
      calories: randomCalories,
      protein: Math.floor(randomCalories * 0.15),
      carbs: Math.floor(randomCalories * 0.5),
      fat: Math.floor(randomCalories * 0.2),
      fiber: Math.floor(Math.random() * 5),
      sugar: Math.floor(Math.random() * 10),
      sodium: Math.floor(Math.random() * 300),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMeals((prev) => ({
      ...prev,
      [type]: [...prev[type], newMeal],
    }))
    setDailyIntake((prev) => ({
      ...prev,
      calories: prev.calories + randomCalories,
      protein: prev.protein + newMeal.protein,
      carbs: prev.carbs + newMeal.carbs,
      fat: prev.fat + newMeal.fat,
      fiber: prev.fiber + newMeal.fiber,
      sugar: prev.sugar + newMeal.sugar,
      sodium: prev.sodium + newMeal.sodium,
    }))
  }, [])

  const handleStartScan = useCallback(() => {
    setIsScanning(true)
  }, [])

  if (!mounted) {
    return (
      <div className="r57-skeleton-loader rounded-2xl border border-border/50 overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="px-4 pb-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded-lg animate-pulse" style={{ opacity: 0.5 + i * 0.1 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="r57-nutrition-lens space-y-6 max-w-lg mx-auto">
      {/* Section header */}
      <motion.div
        variants={r57ContainerVariants}
        initial="hidden"
        animate="visible"
        className="r57-header flex items-center gap-3 mb-2"
      >
        <motion.div
          variants={r57ScaleIn}
          className="r57-header-icon flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"
          style={{ boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)' }}
        >
          <Heart className="h-5 w-5 text-white" />
        </motion.div>
        <div>
          <h2 className="text-lg font-extrabold">NutritionLens</h2>
          <p className="text-[10px] text-muted-foreground">Scan, track & optimize your nutrition</p>
        </div>
      </motion.div>

      {/* Main view tabs */}
      <motion.div variants={r57FadeSlideUp} initial="hidden" animate="visible">
        <div className="r57-view-tabs flex items-center gap-1 p-1 bg-muted/30 rounded-xl">
          {(['scanner', 'tracker', 'compare'] as const).map((view) => (
            <motion.button
              key={view}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveView(view)}
              className={`r57-view-tab flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-[10px] font-semibold transition-all ${
                activeView === view
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {view === 'scanner' && <ScanLine className="h-3 w-3" />}
              {view === 'tracker' && <Scale className="h-3 w-3" />}
              {view === 'compare' && <ArrowLeftRight className="h-3 w-3" />}
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={r57ContainerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Scanner View */}
        {activeView === 'scanner' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring' as const, stiffness: 280, damping: 22 }}
            className="space-y-4"
          >
            {/* Scanner Effect */}
            <ScannerEffect
              isScanning={isScanning}
              onComplete={handleScanComplete}
            />

            {/* Product Selector */}
            <div className="r57-product-selector flex items-center gap-2 overflow-x-auto pb-1">
              {MOCK_PRODUCTS.map((prod, idx) => (
                <motion.div
                  key={prod.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedProduct(idx); setIsScanning(false) }}
                  className={`r57-product-thumb flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                    selectedProduct === idx
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-card border-border/30 text-muted-foreground hover:border-primary/20'
                  }`}
                >
                  <span className="text-sm">{prod.image}</span>
                  <span className="text-[10px] font-medium">{prod.name}</span>
                </motion.div>
              ))}
            </div>

            {/* Current product nutrition card */}
            <ProductNutritionCard product={currentProduct} index={0} />

            {/* Show all products toggle */}
            <motion.div whileTap={{ scale: 0.97 }} className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllProducts(!showAllProducts)}
                className="r57-show-all-btn text-[10px] gap-1"
              >
                {showAllProducts ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showAllProducts ? 'Hide all products' : 'View all products'}
              </Button>
            </motion.div>

            <AnimatePresence>
              {showAllProducts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' as const }}
                  className="overflow-hidden space-y-4"
                >
                  {MOCK_PRODUCTS.filter((p) => p.id !== currentProduct.id).map((product, idx) => (
                    <ProductNutritionCard key={product.id} product={product} index={idx + 1} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Tracker View */}
        {activeView === 'tracker' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring' as const, stiffness: 280, damping: 22 }}
            className="space-y-4"
          >
            {/* Daily intake tracker */}
            <div className="r57-tracker-card rounded-2xl border border-border/50 p-4 bg-card">
              <DailyIntakeTracker intake={dailyIntake} targets={MOCK_DAILY_TARGETS} />
            </div>

            {/* Meal logger */}
            <div className="r57-meal-card rounded-2xl border border-border/50 p-4 bg-card">
              <MealLogger meals={meals} onAddMeal={handleAddMeal} />
            </div>

            {/* Weekly trends */}
            <div className="r57-weekly-card rounded-2xl border border-border/50 p-4 bg-card">
              <WeeklyTrendsChart trends={MOCK_WEEKLY_TRENDS} />
            </div>
          </motion.div>
        )}

        {/* Compare View */}
        {activeView === 'compare' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring' as const, stiffness: 280, damping: 22 }}
            className="space-y-4"
          >
            <div className="r57-compare-card rounded-2xl border border-border/50 p-4 bg-card">
              <CompareNutrition products={MOCK_PRODUCTS} />
            </div>

            {/* Smart suggestions */}
            <div className="r57-suggestions-card rounded-2xl border border-border/50 p-4 bg-card">
              <SmartSuggestions intake={dailyIntake} targets={MOCK_DAILY_TARGETS} />
            </div>
          </motion.div>
        )}

        {/* Smart Suggestions - always visible at bottom */}
        {activeView !== 'compare' && (
          <div className="r57-bottom-suggestions rounded-2xl border border-border/50 p-4 bg-card">
            <SmartSuggestions intake={dailyIntake} targets={MOCK_DAILY_TARGETS} />
          </div>
        )}
      </motion.div>
    </div>
  )
}
