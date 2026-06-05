'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Search, Heart, ChevronDown, ChevronUp, Flame, Beef,
  Wheat, Droplets, Leaf, Sparkles, Trophy, Scale, X,
  Filter,
} from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ═══════════════════════════════════════════════════════════════
   Interfaces
   ═══════════════════════════════════════════════════════════════ */

interface NutritionProduct {
  id: string
  name: string
  store: string
  emoji: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium: number
  sugar: number
  saturatedFat: number
  score: number
  tags: string[]
}

interface NutritionLensProps {
  className?: string
}

type FilterTab = 'Todos' | 'Alto em Proteína' | 'Baixa Caloria' | 'Sem Glúten'

interface ComparisonPair {
  a: NutritionProduct | null
  b: NutritionProduct | null
}

interface HealthTip {
  icon: string
  text: string
  color: string
}

/* ═══════════════════════════════════════════════════════════════
   Constants & Data
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'r71-nutrition-favorites'
const FILTER_TABS: FilterTab[] = ['Todos', 'Alto em Proteína', 'Baixa Caloria', 'Sem Glúten']

const FALLBACK_PRODUCTS: NutritionProduct[] = [
  {
    id: 'frango-1',
    name: 'Frango Grelhado',
    store: 'Mercado Central',
    emoji: '🍗',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sodium: 74,
    sugar: 0,
    saturatedFat: 1,
    score: 92,
    tags: ['high-protein'],
  },
  {
    id: 'arroz-1',
    name: 'Arroz Integral',
    store: 'Supermercado Bom Preço',
    emoji: '🍚',
    calories: 112,
    protein: 2.6,
    carbs: 24,
    fat: 0.9,
    fiber: 1.8,
    sodium: 5,
    sugar: 0.4,
    saturatedFat: 0.2,
    score: 78,
    tags: ['high-fiber'],
  },
  {
    id: 'feijao-1',
    name: 'Feijão Preto',
    store: 'Atacadão',
    emoji: '🫘',
    calories: 77,
    protein: 4.5,
    carbs: 14,
    fat: 0.5,
    fiber: 6.4,
    sodium: 1,
    sugar: 0.3,
    saturatedFat: 0.1,
    score: 85,
    tags: ['high-protein', 'high-fiber'],
  },
  {
    id: 'brocolis-1',
    name: 'Brócolis',
    store: 'Hortifruti',
    emoji: '🥦',
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    sodium: 33,
    sugar: 1.7,
    saturatedFat: 0,
    score: 95,
    tags: ['low-calorie', 'gluten-free'],
  },
  {
    id: 'acai-1',
    name: 'Açaí na Tigela',
    store: 'Padaria do João',
    emoji: '🫐',
    calories: 210,
    protein: 3,
    carbs: 35,
    fat: 8,
    fiber: 3,
    sodium: 15,
    sugar: 18,
    saturatedFat: 4.5,
    score: 58,
    tags: [],
  },
  {
    id: 'pao-queijo-1',
    name: 'Pão de Queijo',
    store: 'Padaria Pão Dourado',
    emoji: '🧀',
    calories: 280,
    protein: 6,
    carbs: 32,
    fat: 15,
    fiber: 0.5,
    sodium: 420,
    sugar: 4,
    saturatedFat: 8,
    score: 42,
    tags: ['gluten-free'],
  },
  {
    id: 'iogurte-1',
    name: 'Iogurte Natural',
    store: 'Laticínios Belém',
    emoji: '🥛',
    calories: 98,
    protein: 9,
    carbs: 12,
    fat: 2,
    fiber: 0,
    sodium: 46,
    sugar: 12,
    saturatedFat: 1.2,
    score: 88,
    tags: ['high-protein'],
  },
  {
    id: 'banana-1',
    name: 'Banana Prata',
    store: 'Feira Livre',
    emoji: '🍌',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    sodium: 1,
    sugar: 12,
    saturatedFat: 0.1,
    score: 82,
    tags: ['gluten-free', 'low-calorie'],
  },
]

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function loadFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveFavorites(ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 50) return '#eab308'
  return '#ef4444'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente'
  if (score >= 50) return 'Regular'
  return 'Baixo'
}

function matchesFilter(product: NutritionProduct, tab: FilterTab): boolean {
  switch (tab) {
    case 'Alto em Proteína':
      return product.tags.includes('high-protein')
    case 'Baixa Caloria':
      return product.tags.includes('low-calorie')
    case 'Sem Glúten':
      return product.tags.includes('gluten-free')
    default:
      return true
  }
}

function buildHealthTips(product: NutritionProduct): HealthTip[] {
  const tips: HealthTip[] = []
  if (product.protein >= 25) {
    tips.push({ icon: '💪', text: 'Alto em proteína — ótimo para ganho muscular', color: 'text-blue-500' })
  }
  if (product.sugar <= 4) {
    tips.push({ icon: '🌿', text: 'Baixo teor de açúcar — ajuda a controlar a glicemia', color: 'text-emerald-500' })
  }
  if (product.fiber >= 2.5) {
    tips.push({ icon: '🌾', text: 'Boa fonte de fibras — melhora a digestão', color: 'text-amber-500' })
  }
  if (product.fat <= 3) {
    tips.push({ icon: '💧', text: 'Baixo teor de gordura — ideal para dietas restritivas', color: 'text-cyan-500' })
  }
  if (product.calories <= 100) {
    tips.push({ icon: '🔥', text: 'Baixa caloria — perfeito para controle de peso', color: 'text-orange-500' })
  }
  if (product.sodium <= 50) {
    tips.push({ icon: '🧂', text: 'Baixo teor de sódio — bom para hipertensos', color: 'text-purple-500' })
  }
  if (tips.length === 0) {
    tips.push({ icon: '🍽️', text: 'Consuma com moderação como parte de uma dieta equilibrada', color: 'text-gray-500' })
    tips.push({ icon: '💧', text: 'Lembre-se de beber água suficiente durante as refeições', color: 'text-cyan-500' })
    tips.push({ icon: '🥗', text: 'Combine com legumes e verduras para uma refeição completa', color: 'text-emerald-500' })
  }
  return tips.slice(0, 3)
}

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 24 }

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
}

/* ═══════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════ */

/* ── Circular SVG Score Gauge ── */
function ScoreGauge({ score, size = 64 }: { score: number; size?: number }) {
  const prefersReduced = useReducedMotion()
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(Math.max(score, 0), 100)
  const dashOffset = circumference - (pct / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className="r71-score-gauge relative" style={{ width: size, height: size }}>
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
          initial={prefersReduced ? { strokeDashoffset: dashOffset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={
            prefersReduced
              ? { duration: 0 }
              : { type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.2 }
          }
        />
      </svg>
      <div className="r71-score-gauge-inner absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-sm font-black tabular-nums leading-none"
          style={{ color }}
          initial={prefersReduced ? {} : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 18, delay: 0.3 }}
        >
          {score}
        </motion.span>
        <span className="text-[7px] font-semibold text-muted-foreground leading-none mt-0.5">
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  )
}

/* ── Nutrition Score Badge ── */
function CalorieBadge({ calories }: { calories: number }) {
  return (
    <div className="r71-calorie-badge flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/20 px-2 py-0.5">
      <Flame className="h-3 w-3 text-orange-500" />
      <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 tabular-nums">
        {calories} kcal
      </span>
    </div>
  )
}

/* ── Macro Breakdown Mini Chips ── */
function MacroChips({ product }: { product: NutritionProduct }) {
  const macros: { label: string; value: number; unit: string; icon: React.ReactNode; color: string }[] = [
    { label: 'Prot', value: product.protein, unit: 'g', icon: <Beef className="h-2.5 w-2.5" />, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { label: 'Carb', value: product.carbs, unit: 'g', icon: <Wheat className="h-2.5 w-2.5" />, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { label: 'Gord', value: product.fat, unit: 'g', icon: <Droplets className="h-2.5 w-2.5" />, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  ]

  return (
    <div className="r71-macro-chips flex items-center gap-1.5">
      {macros.map((m) => (
        <div
          key={m.label}
          className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 ${m.color}`}
        >
          {m.icon}
          <span className="text-[9px] font-bold tabular-nums">
            {m.value}{m.unit}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Expandable Nutrition Table ── */
function NutritionTable({ product, isOpen, onToggle }: {
  product: NutritionProduct
  isOpen: boolean
  onToggle: () => void
}) {
  const rows: { label: string; value: string; unit: string }[] = [
    { label: 'Calorias', value: String(product.calories), unit: 'kcal' },
    { label: 'Proteína', value: String(product.protein), unit: 'g' },
    { label: 'Carboidratos', value: String(product.carbs), unit: 'g' },
    { label: 'Gorduras totais', value: String(product.fat), unit: 'g' },
    { label: 'Fibra alimentar', value: String(product.fiber), unit: 'g' },
    { label: 'Sódio', value: String(product.sodium), unit: 'mg' },
    { label: 'Açúcar', value: String(product.sugar), unit: 'g' },
    { label: 'Gordura saturada', value: String(product.saturatedFat), unit: 'g' },
  ]

  return (
    <div className="r71-nutrition-table mt-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors"
        style={{ minHeight: 44 }}
        aria-expanded={isOpen}
        aria-label="Tabela Nutricional"
      >
        <span className="text-[11px] font-bold flex items-center gap-1.5">
          <Leaf className="h-3 w-3 text-emerald-500" />
          Tabela Nutricional
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-1">
              {rows.map((row, idx) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, type: 'spring' as const, stiffness: 400, damping: 22 }}
                  className="flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-muted/30 transition-colors"
                >
                  <span className="text-[10px] text-muted-foreground font-medium">{row.label}</span>
                  <span className="text-[10px] font-bold tabular-nums">
                    {row.value} <span className="text-muted-foreground font-normal">{row.unit}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Favorite Toggle ── */
function FavoriteToggle({
  productId,
  isFavorite,
  onToggle,
}: {
  productId: string
  isFavorite: boolean
  onToggle: (id: string) => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.stopPropagation()
        onToggle(productId)
      }}
      className={`r71-fav-toggle flex items-center justify-center rounded-full border transition-colors ${
        isFavorite
          ? 'bg-red-500/10 border-red-500/30 text-red-500'
          : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-red-400'
      }`}
      style={{ width: 44, height: 44 }}
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <motion.div
        animate={isFavorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
      >
        <Heart
          className="h-5 w-5"
          fill={isFavorite ? 'currentColor' : 'none'}
        />
      </motion.div>
    </motion.button>
  )
}

/* ── Product Nutrition Card ── */
function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onCompareSelect,
  isInComparison,
  expandedTable,
  onToggleTable,
}: {
  product: NutritionProduct
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onCompareSelect: (product: NutritionProduct) => void
  isInComparison: boolean
  expandedTable: boolean
  onToggleTable: (id: string) => void
}) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      layout
      variants={itemVariants}
      className={`r62-card-lift r71-product-card rounded-2xl border border-border/50 bg-card overflow-hidden ${
        isInComparison ? 'ring-2 ring-primary/50 shadow-lg' : ''
      }`}
      style={{
        boxShadow: isInComparison
          ? '0 8px 32px rgba(0,0,0,0.12)'
          : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Emoji header */}
      <div className="relative flex items-center justify-center py-5 bg-gradient-to-b from-muted/60 to-transparent">
        <motion.span
          className="text-5xl"
          initial={prefersReduced ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 14, delay: 0.05 }}
        >
          {product.emoji}
        </motion.span>
        <div className="absolute top-2 right-2">
          <FavoriteToggle
            productId={product.id}
            isFavorite={isFavorite}
            onToggle={onToggleFavorite}
          />
        </div>
        {isInComparison && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 18 }}
            className="absolute top-2 left-2"
          >
            <Badge className="text-[8px] font-bold px-1.5 py-0 bg-primary/15 text-primary border-primary/30">
              Comparando
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 pb-3 space-y-2">
        <div className="min-w-0">
          <h3 className="text-xs font-bold leading-tight truncate">{product.name}</h3>
          <p className="text-[9px] text-muted-foreground truncate">{product.store}</p>
        </div>

        {/* Score + Calorie */}
        <div className="flex items-center justify-between">
          <ScoreGauge score={product.score} size={52} />
          <CalorieBadge calories={product.calories} />
        </div>

        {/* Macro chips */}
        <MacroChips product={product} />

        {/* Compare button */}
        <Button
          variant={isInComparison ? 'default' : 'outline'}
          size="sm"
          className="w-full text-[10px] font-bold h-9 r71-compare-btn"
          onClick={() => onCompareSelect(product)}
        >
          <Scale className="h-3 w-3 mr-1" />
          {isInComparison ? 'Selecionado' : 'Comparar'}
        </Button>

        {/* Expandable table */}
        <NutritionTable
          product={product}
          isOpen={expandedTable}
          onToggle={() => onToggleTable(product.id)}
        />
      </div>
    </motion.div>
  )
}

/* ── Comparison Panel ── */
function ComparisonPanel({
  pair,
  onClose,
}: {
  pair: ComparisonPair
  onClose: () => void
}) {
  const productA = pair.a
  const productB = pair.b
  if (!productA || !productB) return null

  const categories: { key: keyof NutritionProduct; label: string; unit: string; maxVal: number }[] = [
    { key: 'protein', label: 'Proteína', unit: 'g', maxVal: 40 },
    { key: 'carbs', label: 'Carboidratos', unit: 'g', maxVal: 40 },
    { key: 'fat', label: 'Gorduras', unit: 'g', maxVal: 20 },
    { key: 'calories', label: 'Calorias', unit: 'kcal', maxVal: 350 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={springTransition}
      className="r71-comparison-panel rounded-2xl border border-border/50 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold">Comparação Nutricional</span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-full p-2 hover:bg-muted/50 transition-colors"
          style={{ minHeight: 44, minWidth: 44 }}
          aria-label="Fechar comparação"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Product names */}
      <div className="grid grid-cols-2 gap-2 px-4 pt-3 pb-2">
        <div className="text-center">
          <span className="text-2xl block mb-1">{productA.emoji}</span>
          <p className="text-xs font-bold truncate">{productA.name}</p>
          <ScoreGauge score={productA.score} size={48} />
        </div>
        <div className="text-center">
          <span className="text-2xl block mb-1">{productB.emoji}</span>
          <p className="text-xs font-bold truncate">{productB.name}</p>
          <ScoreGauge score={productB.score} size={48} />
        </div>
      </div>

      {/* Comparison bars */}
      <div className="px-4 py-3 space-y-3">
        {categories.map((cat) => {
          const valA = productA[cat.key] as number
          const valB = productB[cat.key] as number
          const pctA = Math.min((valA / cat.maxVal) * 100, 100)
          const pctB = Math.min((valB / cat.maxVal) * 100, 100)
          const aWins = valA <= valB && cat.key !== 'protein'
          const bWins = valB <= valA && cat.key !== 'protein'
          const proteinAWins = cat.key === 'protein' && valA >= valB
          const proteinBWins = cat.key === 'protein' && valB >= valA

          return (
            <div key={cat.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tabular-nums">
                  {valA}{cat.unit}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">{cat.label}</span>
                <span className="text-[10px] font-bold tabular-nums">
                  {valB}{cat.unit}
                </span>
              </div>
              <div className="space-y-1">
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pctA}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                    className={`h-full rounded-full ${
                      proteinAWins ? 'bg-emerald-500' : aWins ? 'bg-emerald-500' : 'bg-primary/40'
                    }`}
                  />
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pctB}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
                    className={`h-full rounded-full ${
                      proteinBWins ? 'bg-emerald-500' : bWins ? 'bg-emerald-500' : 'bg-primary/40'
                    }`}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ── Health Tips Section ── */
function HealthTipsSection({ product }: { product: NutritionProduct }) {
  const tips = buildHealthTips(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="r71-health-tips rounded-2xl border border-border/50 bg-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-bold">Dicas de Saúde</span>
        <span className="text-[9px] text-muted-foreground ml-1">— {product.name}</span>
      </div>
      <div className="space-y-2">
        {tips.map((tip, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1, type: 'spring' as const, stiffness: 350, damping: 22 }}
            className="flex items-start gap-2.5 px-3 py-2 rounded-xl bg-muted/30 border border-border/30"
          >
            <span className="text-lg leading-none shrink-0 mt-0.5">{tip.icon}</span>
            <span className={`text-[11px] font-medium leading-relaxed ${tip.color}`}>
              {tip.text}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ── Leaderboard ── */
function HealthLeaderboard({ products }: { products: NutritionProduct[] }) {
  const top5 = useMemo(
    () => [...products].sort((a, b) => b.score - a.score).slice(0, 5),
    [products]
  )

  const medalColors = ['#eab308', '#9ca3af', '#cd7f32', '#6b7280', '#6b7280']
  const medalBg = [
    'rgba(234,179,8,0.1)', 'rgba(156,163,175,0.08)',
    'rgba(205,127,50,0.08)', 'rgba(107,114,128,0.05)', 'rgba(107,114,128,0.05)',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="r71-leaderboard rounded-2xl border border-border/50 bg-card overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border-b border-border/50">
        <Trophy className="h-4 w-4 text-emerald-500" />
        <span className="text-xs font-bold">Alimentos mais saudáveis</span>
      </div>
      <div className="p-2 space-y-1.5">
        {top5.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 300, damping: 22 }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{ background: medalBg[idx] }}
          >
            {/* Rank medal */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: medalColors[idx] }}
            >
              {idx === 0 && (
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute"
                >
                  <Trophy className="h-3 w-3 text-amber-300" />
                </motion.div>
              )}
              <span className="text-[11px] font-black text-white relative z-10">{idx + 1}</span>
            </div>
            <span className="text-xl">{product.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold truncate">{product.name}</p>
              <p className="text-[9px] text-muted-foreground truncate">{product.store}</p>
            </div>
            <Badge
              className="text-[9px] font-bold px-1.5 py-0 border"
              style={{
                backgroundColor: `${getScoreColor(product.score)}15`,
                color: getScoreColor(product.score),
                borderColor: `${getScoreColor(product.score)}30`,
              }}
            >
              {product.score}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ── Filter Tabs ── */
function FilterTabs({
  active,
  onChange,
}: {
  active: FilterTab
  onChange: (tab: FilterTab) => void
}) {
  return (
    <div className="r71-filter-tabs flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {FILTER_TABS.map((tab) => (
        <motion.button
          key={tab}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onChange(tab)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border r71-filter-tab ${
            active === tab
              ? 'bg-primary text-primary-foreground border-primary shadow-md'
              : 'bg-secondary/60 text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary'
          }`}
          style={{ minHeight: 44 }}
        >
          {tab === 'Alto em Proteína' && <Beef className="h-3 w-3" />}
          {tab === 'Baixa Caloria' && <Flame className="h-3 w-3" />}
          {tab === 'Sem Glúten' && <Wheat className="h-3 w-3" />}
          {tab === 'Todos' && <Filter className="h-3 w-3" />}
          {tab}
        </motion.button>
      ))}
    </div>
  )
}

/* ── Loading Skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="r71-skeleton space-y-4">
      {/* Search bar skeleton */}
      <div className="h-12 bg-muted rounded-xl animate-pulse" />
      {/* Filter tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-28 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
      {/* Cards grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 overflow-hidden">
            <div className="flex items-center justify-center py-6 bg-muted/40 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
              </div>
              <div className="h-9 w-full bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Empty State ── */
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springTransition}
      className="r71-empty-state flex flex-col items-center justify-center py-16 text-center"
    >
      <span className="text-5xl mb-4">🔍</span>
      <h3 className="text-sm font-bold mb-1">Nenhum alimento encontrado</h3>
      <p className="text-[11px] text-muted-foreground mb-4 max-w-xs">
        Tente buscar por outro nome ou altere o filtro para encontrar produtos.
      </p>
      <Button variant="outline" size="sm" onClick={onClear} className="r71-clear-btn">
        <X className="h-3 w-3 mr-1" />
        Limpar busca
      </Button>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Component — NutritionLens
   ═══════════════════════════════════════════════════════════════ */

export function NutritionLens({ className }: NutritionLensProps) {
  const prefersReduced = useReducedMotion()

  /* ── State ── */
  const [products, setProducts] = useState<NutritionProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('Todos')
  const [favorites, setFavorites] = useState<string[]>([])
  const [comparison, setComparison] = useState<ComparisonPair>({ a: null, b: null })
  const [selectedProduct, setSelectedProduct] = useState<NutritionProduct | null>(null)
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())

  /* ── Load products with cachedFetch + fallback ── */
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await cachedFetch<NutritionProduct[]>('/api/nutrition/products')
        if (!cancelled) {
          setProducts(data)
        }
      } catch {
        if (!cancelled) {
          setProducts(FALLBACK_PRODUCTS)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  /* ── Load favorites from localStorage ── */
  useEffect(() => {
    setFavorites(loadFavorites())
  }, [])

  /* ── Filtered products ── */
  const filteredProducts = useMemo(() => {
    let result = products

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.store.toLowerCase().includes(q)
      )
    }

    if (activeTab !== 'Todos') {
      result = result.filter((p) => matchesFilter(p, activeTab))
    }

    return result
  }, [products, searchQuery, activeTab])

  /* ── Handlers ── */
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id]
      saveFavorites(next)
      return next
    })
  }, [])

  const handleCompareSelect = useCallback((product: NutritionProduct) => {
    setComparison((prev) => {
      if (prev.a && prev.a.id === product.id) return { a: null, b: prev.b }
      if (prev.b && prev.b.id === product.id) return { a: prev.a, b: null }
      if (!prev.a) return { a: product, b: prev.b }
      if (!prev.b) return { a: prev.a, b: product }
      return { a: product, b: null }
    })
  }, [])

  const clearComparison = useCallback(() => {
    setComparison({ a: null, b: null })
  }, [])

  const toggleTable = useCallback((id: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  /* ── Determine selected product for health tips ── */
  const tipProduct = selectedProduct ?? comparison.a ?? (filteredProducts.length > 0 ? filteredProducts[0] : null)

  /* ── Animation wrapper ── */
  const motionProps = prefersReduced
    ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: springTransition }

  /* ── Loading ── */
  if (loading) {
    return (
      <section className={className}>
        <LoadingSkeleton />
      </section>
    )
  }

  return (
    <motion.section
      {...motionProps}
      className={`r71-nutrition-lens space-y-5 ${className ?? ''}`}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0 r71-header-icon"
          style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}
        >
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold r71-title">NutritionLens</h2>
          <p className="text-[10px] text-muted-foreground hidden sm:block">
            Compare e acompanhe a nutrição dos alimentos do seu mercado
          </p>
        </div>
      </div>

      {/* ── Search Input ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar alimentos ou lojas..."
          className="r71-search-input w-full h-11 pl-10 pr-10 rounded-xl border border-border/60 bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
          aria-label="Buscar alimentos"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full p-1.5 hover:bg-muted/50 transition-colors"
            style={{ minHeight: 44, minWidth: 44 }}
            aria-label="Limpar busca"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* ── Filter Tabs ── */}
      <FilterTabs active={activeTab} onChange={setActiveTab} />

      {/* ── Comparison Panel ── */}
      <AnimatePresence>
        {comparison.a && comparison.b && (
          <ComparisonPanel pair={comparison} onClose={clearComparison} />
        )}
      </AnimatePresence>

      {/* ── Health Tips ── */}
      <AnimatePresence mode="wait">
        {tipProduct && (
          <HealthTipsSection key={tipProduct.id} product={tipProduct} />
        )}
      </AnimatePresence>

      {/* ── Product Grid ── */}
      {filteredProducts.length === 0 ? (
        <EmptyState onClear={clearSearch} />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={toggleFavorite}
              onCompareSelect={(p) => {
                handleCompareSelect(p)
                setSelectedProduct(p)
              }}
              isInComparison={
                (comparison.a?.id === product.id) || (comparison.b?.id === product.id)
              }
              expandedTable={expandedTables.has(product.id)}
              onToggleTable={toggleTable}
            />
          ))}
        </motion.div>
      )}

      {/* ── Leaderboard ── */}
      <HealthLeaderboard products={products} />
    </motion.section>
  )
}
