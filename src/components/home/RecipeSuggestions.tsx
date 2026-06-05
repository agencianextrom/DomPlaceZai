'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChefHat, Flame, ChevronRight, ListChecks, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/useAppStore'
import { cachedFetch } from '@/lib/api-cache'
import type { ProductData } from '@/store/useAppStore'

/* ── Types ── */
type Difficulty = 'Fácil' | 'Médio' | 'Avançado'

interface Recipe {
  id: string
  name: string
  emoji: string
  difficulty: Difficulty
  time: number
  ingredientCount: number
  ingredients: string[]
  availableIngredients: string[]
  gradient: string
  accentColor: string
}

/* ── Difficulty filter type ── */
type DifficultyFilter = 'Todos' | Difficulty

/* ── Mock recipe data referencing real product categories ── */
const RECIPES: Recipe[] = [
  {
    id: 'recipe-1',
    name: 'Açaí Bowl',
    emoji: '🫐',
    difficulty: 'Fácil',
    time: 15,
    ingredientCount: 5,
    ingredients: ['Açaí 500ml', 'Granola', 'Banana', 'Mel', 'Leite Condensado'],
    availableIngredients: ['Açaí 500ml', 'Granola'],
    gradient: 'from-emerald-400 to-teal-500',
    accentColor: 'emerald',
  },
  {
    id: 'recipe-2',
    name: 'Pão com Manteiga',
    emoji: '🍞',
    difficulty: 'Fácil',
    time: 10,
    ingredientCount: 3,
    ingredients: ['Pão Francês', 'Manteiga', 'Geleia'],
    availableIngredients: ['Pão Francês'],
    gradient: 'from-amber-400 to-orange-500',
    accentColor: 'amber',
  },
  {
    id: 'recipe-3',
    name: 'Vitamina de Banana',
    emoji: '🍌',
    difficulty: 'Fácil',
    time: 10,
    ingredientCount: 4,
    ingredients: ['Banana', 'Leite', 'Aveia', 'Mel'],
    availableIngredients: ['Banana'],
    gradient: 'from-yellow-400 to-amber-500',
    accentColor: 'yellow',
  },
  {
    id: 'recipe-4',
    name: 'Feijoada Completa',
    emoji: '🍲',
    difficulty: 'Avançado',
    time: 120,
    ingredientCount: 8,
    ingredients: ['Feijão Carioca', 'Linguiça', 'Costela', 'Bacon', 'Arroz', 'Farofa', 'Couve', 'Laranja'],
    availableIngredients: ['Feijão Carioca', 'Arroz'],
    gradient: 'from-red-400 to-rose-500',
    accentColor: 'red',
  },
  {
    id: 'recipe-5',
    name: 'Salada Tropical',
    emoji: '🥗',
    difficulty: 'Fácil',
    time: 15,
    ingredientCount: 6,
    ingredients: ['Alface', 'Tomate', 'Cenoura', 'Cebola', 'Azeite', 'Limão'],
    availableIngredients: ['Tomate', 'Alface'],
    gradient: 'from-lime-400 to-green-500',
    accentColor: 'lime',
  },
  {
    id: 'recipe-6',
    name: 'Bolo de Chocolate',
    emoji: '🍫',
    difficulty: 'Médio',
    time: 60,
    ingredientCount: 7,
    ingredients: ['Farinha de Trigo', 'Chocolate', 'Ovos', 'Açúcar', 'Leite', 'Fermento', 'Manteiga'],
    availableIngredients: ['Açúcar', 'Leite'],
    gradient: 'from-orange-400 to-amber-600',
    accentColor: 'orange',
  },
]

/* ── Difficulty config ── */
const difficultyConfig: Record<Difficulty, { bg: string; text: string; border: string; badge: string }> = {
  Fácil: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  Médio: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  Avançado: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-500/20',
    badge: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
}

/* ── Animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.92, rotateY: -15 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateY: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 280,
      damping: 20,
    },
  },
}

const flipCardVariants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
}

const pillVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 18,
      delay: 0.15 + i * 0.06,
    },
  }),
}

const clockIconVariants = {
  animate: {
    rotate: [0, 360],
    transition: { duration: 3, repeat: Infinity, ease: 'linear' as const },
  },
}

/* ── Shimmer skeleton ── */
function RecipesSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 overflow-hidden">
          <Skeleton className="h-28 rounded-none" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Format time helper ── */
function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}min` : `${h}h`
}

/* ── Main component ── */
export function RecipeSuggestions() {
  const [activeFilter, setActiveFilter] = useState<DifficultyFilter>('Todos')
  const [flippedCard, setFlippedCard] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const { selectProduct, navigate } = useAppStore()

  // Fetch products to match available ingredients
  useEffect(() => {
    let cancelled = false
    cachedFetch('/api/products?limit=50')
      .then((data) => {
        if (!cancelled) setProducts(data?.products ?? [])
      })
      .catch(() => { /* silent */ })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Build recipes with matched available ingredients from the store
  const recipes = useMemo(() => {
    const productNames = products.map((p) => p.name.toLowerCase())
    return RECIPES.map((recipe) => {
      const availableIngredients = recipe.ingredients.filter((ing) =>
        productNames.some((pn) => pn.includes(ing.toLowerCase().split(' ')[0]))
      )
      return { ...recipe, availableIngredients }
    })
  }, [products])

  const filteredRecipes = useMemo(() => {
    if (activeFilter === 'Todos') return recipes
    return recipes.filter((r) => r.difficulty === activeFilter)
  }, [recipes, activeFilter])

  const filters: DifficultyFilter[] = ['Todos', 'Fácil', 'Médio']

  const handleFlip = (id: string) => {
    setFlippedCard((prev) => (prev === id ? null : id))
  }

  const handleViewIngredients = (recipe: Recipe) => {
    // Navigate to stores with a category filter if food items are available
    navigate('home')
  }

  return (
    <section className="w-full r62-card-lift">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-8 w-8 rounded-lg bg-gradient-to-br from-lime-500 to-emerald-600 flex items-center justify-center"
          >
            <ChefHat className="h-4 w-4 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base sm:text-lg font-bold r62-heading-gradient">Sugestões de Receitas</h2>
            <p className="text-[11px] text-muted-foreground">Inspire-se com produtos locais</p>
          </div>
        </div>
      </div>

      {/* Difficulty filter pills */}
      <div className="flex items-center gap-2 mb-4">
        {filters.map((filter, i) => {
          const isActive = activeFilter === filter
          const isDiff = filter !== 'Todos'
          const diffCfg = isDiff ? difficultyConfig[filter as Difficulty] : null
          return (
            <motion.button
              key={filter}
              custom={i}
              variants={pillVariants}
              initial="hidden"
              animate="visible"
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 min-h-[44px] rounded-full text-xs font-semibold border transition-all ${
                isActive
                  ? isDiff
                    ? `${diffCfg!.bg} ${diffCfg!.text} ${diffCfg!.border}`
                    : 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border/50 hover:border-primary/30'
              } ${isActive ? 'r26-breathing-glow' : ''}`}
            >
              {filter}
            </motion.button>
          )
        })}
        <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground border-0 ml-auto">
          {filteredRecipes.length} receitas
        </Badge>
      </div>

      {/* Loading skeleton */}
      {loading && <RecipesSkeleton />}

      {/* Recipe cards grid */}
      {!loading && filteredRecipes.length > 0 && (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredRecipes.map((recipe) => {
            const diffCfg = difficultyConfig[recipe.difficulty]
            const isFlipped = flippedCard === recipe.id

            return (
              <motion.div
                key={recipe.id}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  boxShadow: '0 16px 40px -10px rgba(0,0,0,0.18)',
                }}
                transition={{ type: 'spring' as const, stiffness: 320, damping: 24 }}
                className="perspective-[1000px] r26-card-lift"
              >
                <div
                  className="relative cursor-pointer"
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => handleFlip(recipe.id)}
                >
                  <AnimatePresence mode="wait">
                    {isFlipped ? (
                      /* ── BACK: Ingredients ── */
                      <motion.div
                        key="back"
                        initial={{ rotateY: -90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: 90, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="rounded-2xl border border-border/50 overflow-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <div className={`bg-gradient-to-br ${recipe.gradient} p-4`}>
                          <div className="flex items-center gap-1.5 mb-3">
                            <ListChecks className="h-3.5 w-3.5 text-white/80" />
                            <span className="text-xs font-bold text-white">
                              Ingredientes ({recipe.ingredientCount})
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {recipe.ingredients.map((ing, idx) => {
                              const isAvailable = recipe.availableIngredients.includes(ing)
                              return (
                                <motion.div
                                  key={ing}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05, type: 'spring' as const, stiffness: 400, damping: 22 }}
                                  className={`flex items-center gap-2 text-[11px] ${
                                    isAvailable ? 'text-white font-semibold' : 'text-white/70'
                                  }`}
                                >
                                  <div
                                    className={`h-4 w-4 rounded flex items-center justify-center text-[9px] ${
                                      isAvailable
                                        ? 'bg-white/25 text-white'
                                        : 'bg-white/10 text-white/50'
                                    }`}
                                  >
                                    {isAvailable ? '✓' : '○'}
                                  </div>
                                  <span className={isAvailable ? '' : 'line-through'}>
                                    {ing}
                                  </span>
                                  {isAvailable && (
                                    <Badge className="text-[8px] bg-white/20 text-white border-0 px-1 py-0">
                                      Disponível
                                    </Badge>
                                  )}
                                </motion.div>
                              )
                            })}
                          </div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-3 pt-2 border-t border-white/20"
                          >
                            <Button
                              size="sm"
                              className="w-full h-8 min-h-[44px] text-[11px] bg-white/20 hover:bg-white/30 text-white border-0 rounded-lg gap-1.5"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewIngredients(recipe)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                              Ver Ingredientes na Loja
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      /* ── FRONT: Recipe card ── */
                      <motion.div
                        key="front"
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="rounded-2xl border border-border/50 overflow-hidden group"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        {/* Top gradient area with emoji */}
                        <div
                          className={`relative bg-gradient-to-br ${recipe.gradient} p-5 pb-3 flex flex-col items-center justify-center min-h-[100px]`}
                        >
                          <motion.span
                            className="text-4xl"
                            initial={{ scale: 0, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: 'spring' as const, stiffness: 400, damping: 12, delay: 0.15 }}
                          >
                            {recipe.emoji}
                          </motion.span>
                          <p className="text-[10px] text-white/70 mt-1.5">Toque para ver ingredientes</p>
                        </div>

                        {/* Bottom info */}
                        <div className="p-3 bg-card">
                          <h3 className="text-sm font-bold mb-2 line-clamp-1 r26-shimmer-text">{recipe.name}</h3>

                          {/* Difficulty badge */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <Badge
                              variant="secondary"
                              className={`text-[9px] font-semibold ${diffCfg.badge}`}
                            >
                              {recipe.difficulty}
                            </Badge>
                            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <motion.div {...clockIconVariants.animate} className="r26-icon-bob">
                                <Clock className="h-2.5 w-2.5" />
                              </motion.div>
                              <span className="font-medium">{formatTime(recipe.time)}</span>
                            </div>
                          </div>

                          {/* Stats row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Flame className="h-2.5 w-2.5 text-orange-400" />
                              <span>{recipe.ingredientCount} ingredientes</span>
                            </div>
                            {recipe.availableIngredients.length > 0 && (
                              <Badge
                                variant="secondary"
                                className="text-[8px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold"
                              >
                                {recipe.availableIngredients.length} disponíveis
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </section>
  )
}
