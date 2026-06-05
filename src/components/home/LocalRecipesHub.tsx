'use client'
/* ─── LocalRecipesHub ─── "Receitas da Região" ───
   Regional recipe hub: curated Pará/Amazonian recipes, ingredient shopping lists,
   difficulty filters, cooking timers, nutrition info, community ratings, and
   one-tap ingredient ordering from marketplace. */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  ChefHat, Clock, Flame, Users, Heart, Star, ChevronRight,
  ShoppingBag, Filter, Sparkles, Timer, Bookmark, Share2,
  UtensilsCrossed, FlameKindling, Leaf
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Recipe {
  id: string
  name: string
  emoji: string
  description: string
  region: string
  difficulty: 'Fácil' | 'Médio' | 'Avançado'
  time: string
  servings: number
  calories: number
  rating: number
  reviews: number
  author: string
  authorEmoji: string
  ingredients: IngredientItem[]
  steps: string[]
  tags: string[]
  featured: boolean
}

interface IngredientItem {
  name: string
  emoji: string
  amount: string
  available: boolean
  price: number
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const recipes: Recipe[] = [
  {
    id: '1', name: 'Tacacá', emoji: '🍲', description: 'Sopa amazônica com tucupi, jambu e camarão seco',
    region: 'Belém', difficulty: 'Médio', time: '45 min', servings: 4, calories: 280, rating: 4.9, reviews: 342,
    author: 'Dona Nena', authorEmoji: '👩‍🍳',
    ingredients: [
      { name: 'Tucupi', emoji: '🫗', amount: '500ml', available: true, price: 8.90 },
      { name: 'Jambu', emoji: '🌿', amount: '200g', available: true, price: 5.50 },
      { name: 'Camarão Seco', emoji: '🦐', amount: '100g', available: true, price: 12.00 },
      { name: 'Mandioca', emoji: '🥔', amount: '300g', available: true, price: 4.50 },
      { name: 'Alho', emoji: '🧄', amount: '3 dentes', available: true, price: 1.50 },
    ],
    steps: ['Descasque e cozinhe a mandioca até ficar macia', 'Prepare o tucupi temperado com alho e pimenta', 'Cozinhe o jambu rapidamente para manter a propriedade de dormência', 'Monte o tacacá: mandioca, tucupi quente, jambu e camarão', 'Sirva imediatamente em cuia'],
    tags: ['Pará', 'Amazônia', 'Tradicional'], featured: true
  },
  {
    id: '2', name: 'Açaí na Tigela', emoji: '🫐', description: 'Açaí cremoso com granola, banana e mel',
    region: 'Pará', difficulty: 'Fácil', time: '10 min', servings: 2, calories: 350, rating: 4.8, reviews: 518,
    author: 'Seu Raimundo', authorEmoji: '👨‍🍳',
    ingredients: [
      { name: 'Açaí Congelado', emoji: '🫐', amount: '400g', available: true, price: 18.00 },
      { name: 'Banana Nanica', emoji: '🍌', amount: '2 unidades', available: true, price: 3.20 },
      { name: 'Granola', emoji: '🥣', amount: '100g', available: true, price: 7.90 },
      { name: 'Mel', emoji: '🍯', amount: '2 colheres', available: false, price: 12.00 },
    ],
    steps: ['Bata o açaí no liquidificador com um pouco de banana', 'Sirva em tigelas', 'Decore com granola, banana fatiada e mel', 'Conserve gelado até servir'],
    tags: ['Saúde', 'Café da manhã', 'Rápido'], featured: true
  },
  {
    id: '3', name: 'Maniçoba', emoji: '🥘', description: 'Prato à base de folhas de mandioca cozidas por 7 dias',
    region: 'Nordeste do Pará', difficulty: 'Avançado', time: '7 dias', servings: 8, calories: 420, rating: 4.7, reviews: 156,
    author: 'Dona Francisca', authorEmoji: '👵',
    ingredients: [
      { name: 'Folha de Manioca', emoji: '🍃', amount: '1kg', available: false, price: 6.00 },
      { name: 'Carne Salgada', emoji: '🥩', amount: '500g', available: true, price: 22.00 },
      { name: 'Paio', emoji: '🌭', amount: '2 unidades', available: true, price: 15.00 },
      { name: 'Ovos de Codorna', emoji: '🥚', amount: '12 unidades', available: true, price: 8.00 },
      { name: 'Farinha D\'água', emoji: '🌾', amount: '200g', available: true, price: 4.50 },
    ],
    steps: ['Desfiar e lavar bem as folhas de mandioca (7 dias de cozimento!)', 'Cozinhar as carnes e embutidos separadamente', 'Combinar tudo e cozinhar lentamente por horas', 'Ajustar sal e pimenta', 'Servir com arroz branco e farinha d\'água'],
    tags: ['Tradicional', 'Festa', 'Especial'], featured: false
  },
  {
    id: '4', name: 'Pato no Tucupi', emoji: '🦆', description: 'Pato ensopado no tucupi com jambu e arroz',
    region: 'Belém', difficulty: 'Médio', time: '90 min', servings: 6, calories: 480, rating: 4.9, reviews: 287,
    author: 'Chef Carlinhos', authorEmoji: '🧑‍🍳',
    ingredients: [
      { name: 'Pato', emoji: '🦆', amount: '1 inteiro', available: false, price: 45.00 },
      { name: 'Tucupi', emoji: '🫗', amount: '1 litro', available: true, price: 15.00 },
      { name: 'Jambu', emoji: '🌿', amount: '300g', available: true, price: 7.50 },
      { name: 'Arroz', emoji: '🍚', amount: '2 xícaras', available: true, price: 5.00 },
      { name: 'Alho', emoji: '🧄', amount: '4 dentes', available: true, price: 2.00 },
      { name: 'Cebola', emoji: '🧅', amount: '2 unidades', available: true, price: 3.00 },
    ],
    steps: ['Temperar o pato com sal, alho e limão', 'Cozinhar o pato até ficar macio', 'Preparar o tucupi com temperos', 'Cozinhar o jambu rapidamente', 'Desfiar o pato e misturar ao tucupi', 'Servir com arroz branco e jambu por cima'],
    tags: ['Natal', 'Especial', 'Círio'], featured: true
  },
  {
    id: '5', name: 'Cupuaçu Cream', emoji: '🍧', description: 'Creme de cupuaçu com leite condensado e granola',
    region: 'Pará', difficulty: 'Fácil', time: '15 min', servings: 4, calories: 290, rating: 4.6, reviews: 198,
    author: 'Dona Maria', authorEmoji: '👩‍🌾',
    ingredients: [
      { name: 'Polpa de Cupuaçu', emoji: '🍑', amount: '400g', available: true, price: 8.90 },
      { name: 'Leite Condensado', emoji: '🥛', amount: '1 lata', available: true, price: 6.50 },
      { name: 'Creme de Leite', emoji: '🍦', amount: '200ml', available: true, price: 5.00 },
      { name: 'Granola', emoji: '🥣', amount: '80g', available: true, price: 6.00 },
    ],
    steps: ['Bater a polpa de cupuaçu no liquidificador', 'Misturar com leite condensado e creme de leite', 'Levar à geladeira por 2 horas', 'Servir com granola por cima'],
    tags: ['Sobremesa', 'Fácil', 'Fresco'], featured: false
  },
  {
    id: '6', name: 'Vatapá', emoji: '🍛', description: 'Creme de pão com camarão, castanha e dendê',
    region: 'Belém', difficulty: 'Médio', time: '60 min', servings: 6, calories: 380, rating: 4.5, reviews: 134,
    author: 'Sr. Antônio', authorEmoji: '👴',
    ingredients: [
      { name: 'Pão Dormido', emoji: '🍞', amount: '300g', available: true, price: 3.00 },
      { name: 'Camarão Fresco', emoji: '🦐', amount: '300g', available: false, price: 35.00 },
      { name: 'Castanha do Pará', emoji: '🌰', amount: '100g', available: true, price: 22.00 },
      { name: 'Azeite de Dendê', emoji: '🫒', amount: '3 colheres', available: true, price: 9.00 },
      { name: 'Leite de Coco', emoji: '🥥', amount: '200ml', available: true, price: 4.50 },
    ],
    steps: ['Hidratar o pão no leite de coco', 'Refogar camarão com temperos', 'Processar pão com castanha e leite de coco', 'Combinar tudo e cozinhar em fogo baixo', 'Finalizar com azeite de dendê'],
    tags: ['Tradicional', 'Círio', 'Festa'], featured: false
  },
]

const difficulties = ['Todos', 'Fácil', 'Médio', 'Avançado']
const regions = ['Todas', 'Belém', 'Nordeste do Pará', 'Marajó', 'Amazônia']

const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

const sp = 'spring' as const
const totalIngredientCost = (r: Recipe) => r.ingredients.reduce((s, i) => s + i.price, 0)

const difficultyColor: Record<string, string> = {
  'Fácil': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  'Médio': 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
  'Avançado': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LocalRecipesHub() {
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [difficultyFilter, setDifficultyFilter] = useState('Todos')
  const [regionFilter, setRegionFilter] = useState('Todas')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showIngredientsOnly, setShowIngredientsOnly] = useState(false)
  const [stepProgress, setStepProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const toggleFav = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const filteredRecipes = recipes
    .filter(r => difficultyFilter === 'Todos' || r.difficulty === difficultyFilter)
    .filter(r => regionFilter === 'Todas' || r.region === regionFilter)

  if (loading) return <LoadingSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: sp, stiffness: 260, damping: 24 }}
    >
      <Card className="overflow-hidden border-border/40 r91-recipes-card">
        {/* ── Header ── */}
        <CardHeader className="pb-3">
          <div
            className="r91-recipes-header flex items-center gap-3 px-4 py-4 rounded-xl -mx-6 -mt-6 mb-4"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c, #c2410c)',
              boxShadow: '0 4px 16px rgba(249,115,22,0.25)'
            }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-white tracking-tight">Receitas da Região</h2>
              <p className="text-[11px] text-white/70 font-medium">Sabores autênticos do Pará</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              <span className="text-[11px] font-bold text-amber-100">{recipes.length} receitas</span>
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            {difficulties.map(d => (
              <motion.button
                key={d}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDifficultyFilter(d)}
                className={`shrink-0 px-3 py-2 rounded-full text-[11px] font-medium border transition-all min-h-[44px] ${
                  difficultyFilter === d
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-border bg-card text-muted-foreground hover:border-orange-300'
                }`}
              >
                {d}
              </motion.button>
            ))}
            {regions.slice(1).map(r => (
              <motion.button
                key={r}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRegionFilter(regionFilter === r ? 'Todas' : r)}
                className={`shrink-0 px-3 py-2 rounded-full text-[11px] font-medium border transition-all min-h-[44px] ${
                  regionFilter === r
                    ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                    : 'border-border bg-card text-muted-foreground hover:border-orange-300'
                }`}
              >
                {r}
              </motion.button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 space-y-4">
          {/* ── Featured Recipe ── */}
          {filteredRecipes.find(r => r.featured) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="r91-featured-card relative p-4 rounded-xl border-2 border-orange-200 dark:border-orange-800/40 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(234,88,12,0.12))' }}
            >
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-orange-500 text-white text-[9px] font-bold">
                ⭐ Destaque
              </div>
              <div className="flex gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-3xl shrink-0">
                  {filteredRecipes.find(r => r.featured)?.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold">{filteredRecipes.find(r => r.featured)?.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{filteredRecipes.find(r => r.featured)?.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-0.5 text-[10px]"><Clock className="h-3 w-3 text-orange-500" />{filteredRecipes.find(r => r.featured)?.time}</span>
                    <span className="flex items-center gap-0.5 text-[10px]"><Flame className="h-3 w-3 text-red-500" />{filteredRecipes.find(r => r.featured)?.calories} kcal</span>
                    <span className="flex items-center gap-0.5 text-[10px]"><Star className="h-3 w-3 text-amber-500 fill-amber-400" />{filteredRecipes.find(r => r.featured)?.rating}</span>
                  </div>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRecipe(filteredRecipes.find(r => r.featured) || null)}
                className="w-full mt-3 min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 2px 8px rgba(249,115,22,0.25)' }}
              >
                <UtensilsCrossed className="h-3.5 w-3.5" />
                Ver Receita Completa
              </motion.button>
            </motion.div>
          )}

          {/* ── Recipe Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <AnimatePresence mode="popLayout">
              {filteredRecipes.map((recipe, i) => (
                <motion.div
                  key={recipe.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: sp, stiffness: 350, damping: 28, delay: i * 0.03 }}
                  className="r91-recipe-card relative p-3 rounded-xl border border-border/40 bg-card/60 hover:border-orange-200/50 transition-colors"
                >
                  {/* Favorite */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => toggleFav(recipe.id)}
                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Heart className={`h-4 w-4 transition-colors ${favorites.has(recipe.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                  </motion.button>

                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-muted/50 text-3xl shrink-0 r91-recipe-emoji">
                      {recipe.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold">{recipe.name}</h4>
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${difficultyColor[recipe.difficulty]}`}>
                          {recipe.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{recipe.authorEmoji} {recipe.author}</span>
                        <span className="text-[10px] text-muted-foreground">· {recipe.region}</span>
                      </div>
                      <div className="flex items-center gap-2.5 mt-1.5">
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Clock className="h-3 w-3" />{recipe.time}</span>
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Users className="h-3 w-3" />{recipe.servings}</span>
                        <span className="flex items-center gap-0.5 text-[10px]"><Star className="h-3 w-3 text-amber-500 fill-amber-400" />{recipe.rating}</span>
                      </div>
                      {/* Ingredient availability */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${(recipe.ingredients.filter(i => i.available).length / recipe.ingredients.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-semibold text-muted-foreground">
                          {recipe.ingredients.filter(i => i.available).length}/{recipe.ingredients.length} ingredientes
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedRecipe(recipe); setStepProgress(0); }}
                    className="w-full mt-2.5 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors r91-view-recipe-btn"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white', boxShadow: '0 2px 8px rgba(249,115,22,0.2)' }}
                  >
                    <ChefHat className="h-3.5 w-3.5" />
                    Ver Receita
                    <ChevronRight className="h-3.5 w-3.5" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Fun Facts ── */}
          <div className="r91-funfacts p-4 rounded-xl border border-orange-100 dark:border-orange-800/30" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.04), rgba(194,65,12,0.08))' }}>
            <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3">
              <Leaf className="h-4 w-4 text-orange-600" />
              Você sabia?
            </h3>
            <div className="space-y-2">
              {[
                'O Tacacá é servido em cuias de madeira e feito com tucupi fermentado.',
                'O Açaí é considerado superalimento com 18x mais antioxidantes que o mirtilo.',
                'A Maniçoba precisa cozinhar por 7 dias para eliminar toxinas da folha de mandioca.',
                'O Cupuaçu é primo do cacau e é exclusivo da Amazônia brasileira.',
              ].map((fact, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-orange-500 mt-0.5">•</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{fact}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Recipe Detail Modal ── */}
          <AnimatePresence>
            {selectedRecipe && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={() => setSelectedRecipe(null)}
              >
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ type: sp, stiffness: 300, damping: 28 }}
                  className="bg-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 space-y-4"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Modal header */}
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedRecipe.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{selectedRecipe.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedRecipe.authorEmoji} {selectedRecipe.author} · {selectedRecipe.region}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedRecipe(null)}
                      className="p-3 rounded-full bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      ✕
                    </motion.button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: Clock, label: 'Tempo', value: selectedRecipe.time },
                      { icon: Users, label: 'Porções', value: String(selectedRecipe.servings) },
                      { icon: Flame, label: 'Calorias', value: `${selectedRecipe.calories}` },
                      { icon: Star, label: 'Avaliação', value: selectedRecipe.rating.toString() },
                    ].map(stat => (
                      <div key={stat.label} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/40">
                        <stat.icon className="h-4 w-4 text-orange-500" />
                        <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                        <span className="text-xs font-bold">{stat.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ingredients */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold flex items-center gap-1.5">
                        <ShoppingBag className="h-4 w-4 text-orange-500" />
                        Ingredientes
                      </h4>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        Total: {brl(totalIngredientCost(selectedRecipe))}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                          <span className="text-base">{ing.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">{ing.name}</p>
                            <p className="text-[10px] text-muted-foreground">{ing.amount} · {brl(ing.price)}</p>
                          </div>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${ing.available ? 'bg-green-500' : 'bg-red-400'}`} />
                        </div>
                      ))}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-2 min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 2px 8px rgba(249,115,22,0.2)' }}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Comprar Ingredientes ({brl(totalIngredientCost(selectedRecipe))})
                    </motion.button>
                  </div>

                  {/* Steps */}
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-1.5 mb-2">
                      <Timer className="h-4 w-4 text-orange-500" />
                      Modo de Preparo
                    </h4>
                    <div className="space-y-2">
                      {selectedRecipe.steps.map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex gap-3"
                        >
                          <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-xs font-bold ${
                            stepProgress >= i ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'
                          }`}>
                            {stepProgress >= i ? '✓' : i + 1}
                          </div>
                          <p className="text-xs text-foreground leading-relaxed pt-1">{step}</p>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {selectedRecipe.steps.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setStepProgress(i)}
                          className={`flex-1 h-2 rounded-full transition-colors ${stepProgress >= i ? 'bg-orange-500' : 'bg-muted'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRecipe.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-medium dark:bg-orange-900/20 dark:text-orange-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <Card className="overflow-hidden border-border/40">
      <div className="p-4 space-y-4">
        <div className="h-20 rounded-xl bg-muted/50 animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-9 w-16 rounded-full bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="h-28 rounded-xl bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    </Card>
  )
}
