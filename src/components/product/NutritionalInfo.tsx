'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Leaf,
  AlertTriangle,
  Utensils,
  Cookie,
  Milk,
  TreePine,
  Egg,
  Fish,
} from 'lucide-react'
import type { ProductData } from '@/store/useAppStore'

/* ── Types ── */
interface NutrientInfo {
  label: string
  value: number
  unit: string
  dailyPercent: number
  icon: React.ReactNode
}

interface AllergenInfo {
  label: string
  icon: React.ReactNode
  active: boolean
}

interface NutritionalData {
  calories: number
  protein: NutrientInfo
  carbs: NutrientInfo
  fat: NutrientInfo
  fiber: NutrientInfo
  sodium: NutrientInfo
  allergens: AllergenInfo[]
  servingSize: string
}

/* ── Realistic nutritional defaults per category/product ── */
function getDefaultNutritionalData(product?: ProductData): NutritionalData {
  const name = product?.name?.toLowerCase() || ''

  // Rice defaults
  if (name.includes('arroz')) {
    return {
      calories: 360,
      servingSize: '100g (cozido)',
      protein: { label: 'Proteína', value: 7, unit: 'g', dailyPercent: 9, icon: <Dumbbell className="h-4 w-4" /> },
      carbs: { label: 'Carboidratos', value: 79, unit: 'g', dailyPercent: 26, icon: <Wheat className="h-4 w-4" /> },
      fat: { label: 'Gorduras', value: 0.6, unit: 'g', dailyPercent: 1, icon: <Droplets className="h-4 w-4" /> },
      fiber: { label: 'Fibra', value: 1.4, unit: 'g', dailyPercent: 6, icon: <Leaf className="h-4 w-4" /> },
      sodium: { label: 'Sódio', value: 1, unit: 'mg', dailyPercent: 0, icon: <AlertTriangle className="h-4 w-4" /> },
      allergens: [
        { label: 'Glúten', icon: <Wheat className="h-3 w-3" />, active: false },
      ],
    }
  }

  // Açaí defaults
  if (name.includes('aça') || name.includes('acai')) {
    return {
      calories: 210,
      servingSize: '300ml',
      protein: { label: 'Proteína', value: 3.5, unit: 'g', dailyPercent: 5, icon: <Dumbbell className="h-4 w-4" /> },
      carbs: { label: 'Carboidratos', value: 36, unit: 'g', dailyPercent: 12, icon: <Wheat className="h-4 w-4" /> },
      fat: { label: 'Gorduras', value: 7, unit: 'g', dailyPercent: 10, icon: <Droplets className="h-4 w-4" /> },
      fiber: { label: 'Fibra', value: 7, unit: 'g', dailyPercent: 28, icon: <Leaf className="h-4 w-4" /> },
      sodium: { label: 'Sódio', value: 30, unit: 'mg', dailyPercent: 1, icon: <AlertTriangle className="h-4 w-4" /> },
      allergens: [],
    }
  }

  // Beans defaults
  if (name.includes('feij')) {
    return {
      calories: 130,
      servingSize: '100g (cozido)',
      protein: { label: 'Proteína', value: 8.9, unit: 'g', dailyPercent: 12, icon: <Dumbbell className="h-4 w-4" /> },
      carbs: { label: 'Carboidratos', value: 23, unit: 'g', dailyPercent: 8, icon: <Wheat className="h-4 w-4" /> },
      fat: { label: 'Gorduras', value: 0.5, unit: 'g', dailyPercent: 1, icon: <Droplets className="h-4 w-4" /> },
      fiber: { label: 'Fibra', value: 8.4, unit: 'g', dailyPercent: 34, icon: <Leaf className="h-4 w-4" /> },
      sodium: { label: 'Sódio', value: 1.2, unit: 'mg', dailyPercent: 0, icon: <AlertTriangle className="h-4 w-4" /> },
      allergens: [],
    }
  }

  // Bread / bakery
  if (name.includes('pão') || name.includes('pao') || name.includes('bolo')) {
    return {
      calories: 280,
      servingSize: '100g',
      protein: { label: 'Proteína', value: 8, unit: 'g', dailyPercent: 11, icon: <Dumbbell className="h-4 w-4" /> },
      carbs: { label: 'Carboidratos', value: 50, unit: 'g', dailyPercent: 17, icon: <Wheat className="h-4 w-4" /> },
      fat: { label: 'Gorduras', value: 5, unit: 'g', dailyPercent: 7, icon: <Droplets className="h-4 w-4" /> },
      fiber: { label: 'Fibra', value: 2.7, unit: 'g', dailyPercent: 11, icon: <Leaf className="h-4 w-4" /> },
      sodium: { label: 'Sódio', value: 520, unit: 'mg', dailyPercent: 22, icon: <AlertTriangle className="h-4 w-4" /> },
      allergens: [
        { label: 'Glúten', icon: <Wheat className="h-3 w-3" />, active: true },
        { label: 'Ovos', icon: <Egg className="h-3 w-3" />, active: true },
        { label: 'Lactose', icon: <Milk className="h-3 w-3" />, active: true },
      ],
    }
  }

  // Generic food defaults
  return {
    calories: 180,
    servingSize: '100g',
    protein: { label: 'Proteína', value: 6, unit: 'g', dailyPercent: 8, icon: <Dumbbell className="h-4 w-4" /> },
    carbs: { label: 'Carboidratos', value: 30, unit: 'g', dailyPercent: 10, icon: <Wheat className="h-4 w-4" /> },
    fat: { label: 'Gorduras', value: 4, unit: 'g', dailyPercent: 6, icon: <Droplets className="h-4 w-4" /> },
    fiber: { label: 'Fibra', value: 2, unit: 'g', dailyPercent: 8, icon: <Leaf className="h-4 w-4" /> },
    sodium: { label: 'Sódio', value: 200, unit: 'mg', dailyPercent: 9, icon: <AlertTriangle className="h-4 w-4" /> },
    allergens: [
      { label: 'Glúten', icon: <Wheat className="h-3 w-3" />, active: false },
      { label: 'Lactose', icon: <Milk className="h-3 w-3" />, active: false },
      { label: 'Nozes', icon: <TreePine className="h-3 w-3" />, active: false },
    ],
  }
}

/* ── Color coding for daily value percentages ── */
function getProgressColor(percent: number): string {
  if (percent <= 15) return 'bg-emerald-500'
  if (percent <= 30) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getProgressTrackColor(percent: number): string {
  if (percent <= 15) return 'bg-emerald-100'
  if (percent <= 30) return 'bg-yellow-100'
  return 'bg-red-100'
}

/* ── Animated progress bar component ── */
function NutrientBar({ nutrient, delay }: { nutrient: NutrientInfo; delay: number }) {
  const width = Math.min(nutrient.dailyPercent, 100)

  return (
    <div className="flex items-center gap-3">
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 15, delay }}
        className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted/60 text-muted-foreground shrink-0"
      >
        {nutrient.icon}
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">{nutrient.label}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold">{nutrient.value}{nutrient.unit}</span>
            <span className={`text-[10px] font-semibold ${nutrient.dailyPercent <= 15 ? 'text-emerald-600' : nutrient.dailyPercent <= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
              {nutrient.dailyPercent}%VD
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className={`h-2 rounded-full ${getProgressTrackColor(nutrient.dailyPercent)} overflow-hidden`}>
          <motion.div
            className={`h-full rounded-full ${getProgressColor(nutrient.dailyPercent)}`}
            initial={{ width: 0 }}
            animate={{ width: `${width}%` }}
            transition={{ duration: 0.8, delay: delay + 0.2, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Main component ── */
interface NutritionalInfoProps {
  product?: ProductData
}

export function NutritionalInfo({ product }: NutritionalInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const data = getDefaultNutritionalData(product)

  const nutrients: NutrientInfo[] = [
    data.protein,
    data.carbs,
    data.fat,
    data.fiber,
    data.sodium,
  ]

  const activeAllergens = data.allergens.filter((a) => a.active)

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* ── Header (always visible) ── */}
      <motion.button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: isExpanded ? 360 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <Utensils className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-sm font-bold">Informações Nutricionais</span>
          {activeAllergens.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
              className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            >
              ⚠ {activeAllergens.length} alérgeno{activeAllergens.length > 1 ? 's' : ''}
            </motion.span>
          )}
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* ── Expandable content ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Calories highlight */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Flame className="h-6 w-6 text-orange-500" />
                </motion.div>
                <div>
                  <span className="text-xl font-extrabold text-orange-600">{data.calories}</span>
                  <span className="text-sm font-medium text-orange-500 ml-0.5">kcal</span>
                  <p className="text-[10px] text-muted-foreground">por {data.servingSize}</p>
                </div>
              </motion.div>

              {/* Nutrient bars */}
              <div className="space-y-3">
                {nutrients.map((nutrient, idx) => (
                  <NutrientBar key={nutrient.label} nutrient={nutrient} delay={idx * 0.1} />
                ))}
              </div>

              {/* Allergen tags */}
              {data.allergens.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-2 border-t border-border/50"
                >
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Alérgenos e Restrições
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.allergens.map((allergen) => (
                      <motion.span
                        key={allergen.label}
                        whileHover={{ scale: 1.05 }}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full transition-colors ${
                          allergen.active
                            ? 'bg-red-100 text-red-700'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {allergen.icon}
                        {allergen.label}
                        {allergen.active && <AlertTriangle className="h-2.5 w-2.5" />}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-muted-foreground">Baixo</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-[10px] text-muted-foreground">Moderado</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-[10px] text-muted-foreground">Alto</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
