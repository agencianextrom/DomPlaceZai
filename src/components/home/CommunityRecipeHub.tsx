'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Search,
  Clock,
  Star,
  Heart,
  ShoppingCart,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flame,
  ChefHat,
  Check,
  X,
  BookOpen,
  UtensilsCrossed,
  TrendingUp,
  AlertCircle,
  Users,
} from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'

/* ═══════════════════════════════════════════════════════════════
   Interfaces
   ═══════════════════════════════════════════════════════════════ */

interface Recipe {
  id: string
  name: string
  category: 'cafe' | 'almoco' | 'sobremesa'
  emoji: string
  difficulty: 'facil' | 'medio' | 'avancado'
  prepTime: number
  ingredientCount: number
  rating: number
  reviewCount: number
  ingredients: string[]
  steps: string[]
  calories: number
  isFeatured?: boolean
}

interface CategoryTab {
  key: 'todos' | 'cafe' | 'almoco' | 'sobremesa'
  label: string
  emoji: string
}

interface CommunityRecipeHubProps {
  className?: string
}

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const FAVORITES_KEY = 'r69-recipe-favorites'

const CATEGORY_TABS: CategoryTab[] = [
  { key: 'todos', label: 'Todos', emoji: '🍽️' },
  { key: 'cafe', label: 'Café da Manhã', emoji: '☕' },
  { key: 'almoco', label: 'Almoço/Jantar', emoji: '🍴' },
  { key: 'sobremesa', label: 'Sobremesas', emoji: '🍰' },
]

const DIFFICULTY_CONFIG: Record<Recipe['difficulty'], { label: string; bgClass: string; textClass: string }> = {
  facil: { label: 'Fácil', bgClass: 'r69-diff-facil-bg', textClass: 'r69-diff-facil-text' },
  medio: { label: 'Médio', bgClass: 'r69-diff-medio-bg', textClass: 'r69-diff-medio-text' },
  avancado: { label: 'Avançado', bgClass: 'r69-diff-avancado-bg', textClass: 'r69-diff-avancado-text' },
}

const FALLBACK_RECIPES: Recipe[] = [
  {
    id: 'brigadeiro-gourmet',
    name: 'Brigadeiro Gourmet',
    category: 'sobremesa',
    emoji: '🍫',
    difficulty: 'facil',
    prepTime: 20,
    ingredientCount: 5,
    rating: 4.9,
    reviewCount: 342,
    ingredients: ['Chocolate em pó', 'Leite condensado', 'Creme de leite', 'Manteiga', 'Granulado'],
    steps: [
      'Misture o leite condensado, o chocolate em pó e a manteiga em panela antiaderente.',
      'Leve ao fogo médio, mexendo sem parar por cerca de 10 minutos.',
      'Quando a mistura desgrudar do fundo da panela, desligue o fogo.',
      'Acrescente o creme de leite e misture bem até ficar homogêneo.',
      'Deixe esfriar, enrole e passe no granulado. Sirva!',
    ],
    calories: 180,
    isFeatured: true,
  },
  {
    id: 'feijoada-completa',
    name: 'Feijoada Completa',
    category: 'almoco',
    emoji: '🍲',
    difficulty: 'avancado',
    prepTime: 180,
    ingredientCount: 15,
    rating: 4.7,
    reviewCount: 258,
    ingredients: [
      'Feijão preto', 'Costela suína', 'Linguiça calabresa', 'Paio', 'Bacon',
      'Cebola', 'Alho', 'Folhas de louro', 'Couve', 'Farofa', 'Arroz branco',
      'Laranja', 'Pimenta malagueta', 'Sal', 'Óleo',
    ],
    steps: [
      'Deixe o feijão de molho na noite anterior por pelo menos 8 horas.',
      'Cozinhe o feijão com água fresca, louro e alho na pressão por 40 minutos.',
      'Em outra panela, doure a costela, linguiça, paio e bacon.',
      'Adicione cebola e alho refogados ao feijão junto com as carnes.',
      'Retire parte do feijão, amasse e devolva para engrossar o caldo.',
      'Ajuste o sal e cozinhe por mais 30 minutos em fogo baixo.',
      'Sirva com arroz branco, farofa, couve refogada e fatias de laranja.',
    ],
    calories: 520,
  },
  {
    id: 'acai-na-tigela',
    name: 'Açaí na Tigela',
    category: 'cafe',
    emoji: '🫐',
    difficulty: 'facil',
    prepTime: 10,
    ingredientCount: 8,
    rating: 4.8,
    reviewCount: 412,
    ingredients: [
      'Polpa de açaí congelada', 'Banana madura', 'Granola', 'Mel',
      'Leite em pó', 'Morango', 'Coco ralado', 'Leite condensado',
    ],
    steps: [
      'Bata a polpa de açaí com banana e leite em pó no liquidificador até ficar cremoso.',
      'A consistência deve ser espessa, tipo sorvete. Adicione gelo se necessário.',
      'Transfira para uma tigela grande.',
      'Decore com granola, morangos fatiados, coco ralado e mel a gosto.',
      'Sirva imediatamente para manter a textura cremosa.',
    ],
    calories: 280,
  },
  {
    id: 'moqueca-baiana',
    name: 'Moqueca Baiana',
    category: 'almoco',
    emoji: '🐟',
    difficulty: 'medio',
    prepTime: 60,
    ingredientCount: 12,
    rating: 4.6,
    reviewCount: 189,
    ingredients: [
      'Filé de peixe', 'Leite de coco', 'Tomate', 'Cebola', 'Pimentão',
      'Cebolinha', 'Coentro', 'Dendê', 'Limão', 'Alho', 'Sal', 'Pimenta',
    ],
    steps: [
      'Tempere os filés de peixe com limão, sal e alho. Deixe marinar 20 minutos.',
      'Em uma panela de barro, aqueça o azeite de dendê.',
      'Refogue cebola, pimentão e tomate picados até murcharem.',
      'Adicione os filés de peixe e cozinhe por 5 minutos de cada lado.',
      'Despeje o leite de coco e cozinhe em fogo baixo por mais 10 minutos.',
      'Finalize com cebolinha e coentro fresco. Sirva com arroz branco.',
    ],
    calories: 380,
  },
  {
    id: 'pao-de-queijo',
    name: 'Pão de Queijo',
    category: 'cafe',
    emoji: '🧀',
    difficulty: 'facil',
    prepTime: 30,
    ingredientCount: 6,
    rating: 4.8,
    reviewCount: 521,
    ingredients: [
      'Polvilho doce', 'Polvilho azedo', 'Queijo meia-cura', 'Ovos',
      'Leite', 'Óleo de soja',
    ],
    steps: [
      'Misture o polvilho doce e azedo em uma tigela grande.',
      'Ferva o leite com óleo e sal, depois despeje sobre os polvilhos.',
      'Mexa vigorosamente até formar uma massa escaldada e homogênea.',
      'Deixe esfriar um pouco e adicione os ovos um a um, misturando bem.',
      'Acrescente o queijo ralado e sove a massa até desgrudar das mãos.',
      'Enrole bolinhas e asse em forno pré-aquecido a 200°C por 20-25 minutos.',
    ],
    calories: 150,
  },
  {
    id: 'bolo-de-cenoura',
    name: 'Bolo de Cenoura',
    category: 'sobremesa',
    emoji: '🥕',
    difficulty: 'medio',
    prepTime: 45,
    ingredientCount: 7,
    rating: 4.5,
    reviewCount: 287,
    ingredients: [
      'Cenouras', 'Ovos', 'Óleo de girassol', 'Farinha de trigo', 'Açúcar',
      'Fermento em pó', 'Chocolate em pó para cobertura',
    ],
    steps: [
      'Pré-aqueça o forno a 180°C e unte uma forma com buraco no meio.',
      'Bata no liquidificador as cenouras, ovos e óleo até obter um creme liso.',
      'Em uma tigela, misture a farinha e o açúcar, depois despeje o creme de cenoura.',
      'Por último, adicione o fermento e incorpore delicadamente com espátula.',
      'Asse por 35-40 minutos ou até passar no teste do palito.',
      'Prepare a cobertura derretendo chocolate com leite e despeje sobre o bolo ainda quente.',
    ],
    calories: 320,
  },
]

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const springTransition = () =>
  prefersReducedMotion()
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 300, damping: 24 }

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springTransition() },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion() ? 0 : 0.07,
      delayChildren: 0.05,
    },
  },
}

const heartBurst: Variants = {
  idle: { scale: 1 },
  active: {
    scale: [1, 1.45, 0.85, 1.2, 1],
    transition: prefersReducedMotion()
      ? { duration: 0 }
      : { type: 'spring' as const, stiffness: 400, damping: 10 },
  },
}

const tabIndicator: Variants = {
  idle: { scaleX: 0.9, opacity: 0.6 },
  active: {
    scaleX: 1,
    opacity: 1,
    transition: prefersReducedMotion()
      ? { duration: 0 }
      : { type: 'spring' as const, stiffness: 500, damping: 25 },
  },
}

const cardHover = {
  y: prefersReducedMotion() ? 0 : -4,
  boxShadow: prefersReducedMotion()
    ? '0 1px 3px rgba(0,0,0,0.08)'
    : '0 12px 28px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06)',
}

const expandPanel: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: prefersReducedMotion()
      ? { duration: 0 }
      : { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
}

const skeletonPulse: Variants = {
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
  },
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function formatPrepTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function loadFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set<string>()
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return new Set<string>()
    const parsed: string[] = JSON.parse(raw)
    return new Set<string>(parsed)
  } catch {
    return new Set<string>()
  }
}

function saveFavorites(favorites: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)))
  } catch {
    // storage full or unavailable
  }
}

/* ═══════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════ */

/* ── Loading Skeleton ── */
function SkeletonGrid() {
  return (
    <div className="r69-skeleton-grid grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="r69-skeleton-card rounded-2xl border border-border/40 bg-card overflow-hidden">
          <motion.div
            variants={skeletonPulse}
            animate="animate"
            className="r69-skeleton-img h-32 bg-muted"
          />
          <div className="r69-skeleton-body p-3 space-y-2">
            <motion.div variants={skeletonPulse} animate="animate" className="h-4 w-3/4 rounded bg-muted" />
            <motion.div variants={skeletonPulse} animate="animate" className="h-3 w-1/2 rounded bg-muted" />
            <motion.div variants={skeletonPulse} animate="animate" className="h-3 w-full rounded bg-muted" />
            <motion.div variants={skeletonPulse} animate="animate" className="h-8 w-full rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Empty State ── */
function EmptyState({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="r69-empty-state flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="r69-empty-icon text-5xl mb-4">🔍</div>
      <h3 className="r69-empty-title text-base font-semibold text-foreground mb-2">
        Nenhuma receita encontrada
      </h3>
      <p className="r69-empty-desc text-sm text-muted-foreground max-w-xs">
        Não encontramos receitas para &quot;{query}&quot;. Tente buscar por outro ingrediente ou nome.
      </p>
    </motion.div>
  )
}

/* ── Star Rating ── */
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="r69-rating flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`r69-star h-3 w-3 ${
            i < Math.floor(rating) ? 'r69-star-filled fill-amber-400 text-amber-400' : 'r69-star-empty text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="r69-rating-value ml-1 text-xs font-bold text-foreground">{rating.toFixed(1)}</span>
      <span className="r69-rating-count text-[10px] text-muted-foreground">({count})</span>
    </div>
  )
}

/* ── Difficulty Badge ── */
function DifficultyBadge({ difficulty }: { difficulty: Recipe['difficulty'] }) {
  const cfg = DIFFICULTY_CONFIG[difficulty]
  return (
    <span
      className={`r69-diff-badge inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.bgClass} ${cfg.textClass}`}
    >
      {difficulty === 'facil' && <Sparkles className="r69-diff-icon h-2.5 w-2.5" />}
      {difficulty === 'medio' && <Flame className="r69-diff-icon h-2.5 w-2.5" />}
      {difficulty === 'avancado' && <AlertCircle className="r69-diff-icon h-2.5 w-2.5" />}
      {cfg.label}
    </span>
  )
}

/* ── Community Stats Bar ── */
function CommunityStatsBar({ recipes, favoriteCount }: { recipes: Recipe[]; favoriteCount: number }) {
  const totalIngredients = recipes.reduce((sum, r) => sum + r.ingredientCount, 0)

  const stats = [
    { icon: <ChefHat className="r69-stat-icon h-4 w-4" />, value: recipes.length, label: 'receitas' },
    { icon: <Heart className="r69-stat-icon h-4 w-4" />, value: favoriteCount, label: 'favoritas' },
    { icon: <UtensilsCrossed className="r69-stat-icon h-4 w-4" />, value: totalIngredients, label: 'ingredientes disponíveis' },
  ]

  return (
    <div className="r69-stats-bar grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-5">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={fadeInUp}
          className="r69-stat-card flex flex-col items-center gap-1 rounded-xl bg-muted/50 border border-border/40 py-3 px-2"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <div className="r69-stat-icon-wrap text-primary">{stat.icon}</div>
          <span className="r69-stat-value text-lg font-bold text-foreground">{stat.value}</span>
          <span className="r69-stat-label text-[10px] sm:text-xs text-muted-foreground font-medium text-center leading-tight">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

/* ── Featured Recipe Card ── */
function FeaturedCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  onShare,
  onExpand,
}: {
  recipe: Recipe
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onShare: (id: string) => void
  onExpand: (id: string) => void
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="r69-featured-card relative rounded-2xl overflow-hidden bg-card"
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
    >
      {/* Animated gradient border at top */}
      <div className="r69-featured-border h-1 w-full" style={{
        background: 'linear-gradient(90deg, #22c55e, #f59e0b, #ec4899, #22c55e)',
        backgroundSize: '200% 100%',
        animation: prefersReducedMotion() ? 'none' : 'r69-gradient-shift 3s linear infinite',
      }} />

      <div className="r69-featured-inner flex items-center gap-4 p-4 sm:p-5">
        <motion.div
          className="r69-featured-emoji text-5xl sm:text-6xl flex-shrink-0"
          animate={prefersReducedMotion() ? {} : { y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          {recipe.emoji}
        </motion.div>

        <div className="r69-featured-info flex-1 min-w-0">
          <div className="r69-featured-label flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="r69-featured-sparkle h-3 w-3" />
            Sugestão da semana
          </div>
          <h3 className="r69-featured-title text-lg sm:text-xl font-bold text-foreground truncate">
            {recipe.name}
          </h3>
          <div className="r69-featured-meta flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="r69-featured-time flex items-center gap-1">
              <Clock className="h-3 w-3" />{formatPrepTime(recipe.prepTime)}
            </span>
            <DifficultyBadge difficulty={recipe.difficulty} />
            <span className="r69-featured-cal">{recipe.calories} kcal</span>
          </div>
          <StarRating rating={recipe.rating} count={recipe.reviewCount} />
        </div>

        <div className="r69-featured-actions flex flex-col gap-2 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleFavorite(recipe.id)}
            className="r69-fav-btn h-11 w-11 rounded-full bg-muted/60 border border-border/40 flex items-center justify-center"
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <motion.div
              variants={heartBurst}
              initial="idle"
              animate={isFavorite ? 'active' : 'idle'}
            >
              <Heart className={`r69-heart h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </motion.div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onShare(recipe.id)}
            className="r69-share-btn h-11 w-11 rounded-full bg-muted/60 border border-border/40 flex items-center justify-center"
            aria-label="Compartilhar receita"
          >
            <Share2 className="r69-share-icon h-5 w-5 text-muted-foreground" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onExpand(recipe.id)}
            className="r69-view-btn h-11 w-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
            aria-label="Ver detalhes da receita"
          >
            <BookOpen className="r69-view-icon h-5 w-5 text-primary" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Recipe Card ── */
function RecipeCard({
  recipe,
  index,
  isFavorite,
  onToggleFavorite,
  onShare,
  onExpand,
  onAddToCart,
}: {
  recipe: Recipe
  index: number
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onShare: (id: string) => void
  onExpand: (id: string) => void
  onAddToCart: (id: string) => void
}) {
  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover={prefersReducedMotion() ? {} : cardHover}
      className="r69-recipe-card group relative rounded-2xl border border-border/50 bg-card overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'box-shadow 0.3s ease' }}
    >
      {/* Emoji illustration area */}
      <div className="r69-card-emoji-area relative h-28 sm:h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
        <motion.span
          className="r69-card-emoji text-4xl sm:text-5xl"
          whileHover={prefersReducedMotion() ? {} : { scale: 1.15, rotate: [0, -5, 5, 0] }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
        >
          {recipe.emoji}
        </motion.span>

        {/* Favorite toggle — 44px touch target */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => onToggleFavorite(recipe.id)}
          className="r69-card-fav-btn absolute top-2 right-2 h-11 w-11 rounded-full bg-card/80 backdrop-blur-sm border border-border/40 flex items-center justify-center"
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <motion.div
            variants={heartBurst}
            initial="idle"
            animate={isFavorite ? 'active' : 'idle'}
          >
            <Heart className={`r69-card-heart h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </motion.div>
        </motion.button>

        {/* Share button — 44px touch target */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => onShare(recipe.id)}
          className="r69-card-share-btn absolute top-2 left-2 h-11 w-11 rounded-full bg-card/80 backdrop-blur-sm border border-border/40 flex items-center justify-center"
          aria-label="Compartilhar receita"
        >
          <Share2 className="r69-card-share-icon h-4 w-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Card content */}
      <div className="r69-card-body p-3 sm:p-4 space-y-2">
        <h3 className="r69-card-title text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {recipe.name}
        </h3>

        <div className="r69-card-meta flex items-center gap-2 text-[11px] text-muted-foreground">
          <DifficultyBadge difficulty={recipe.difficulty} />
          <span className="r69-card-time flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {formatPrepTime(recipe.prepTime)}
          </span>
        </div>

        <div className="r69-card-extras flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="r69-card-ingredients-count flex items-center gap-0.5">
            <UtensilsCrossed className="h-3 w-3" />
            {recipe.ingredientCount} ingredientes
          </span>
          <span className="r69-card-cal">{recipe.calories} kcal</span>
        </div>

        <StarRating rating={recipe.rating} count={recipe.reviewCount} />

        {/* Action buttons — 44px touch targets */}
        <div className="r69-card-actions flex gap-2 pt-1">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onExpand(recipe.id)}
            className="r69-expand-btn flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Ver receita
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddToCart(recipe.id)}
            className="r69-cart-btn h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingCart className="r69-cart-icon h-4 w-4 text-primary" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Expandable Recipe Detail Panel ── */
function RecipeDetailPanel({
  recipe,
  isOpen,
  onClose,
}: {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!recipe) return null

  const difficultyCfg = DIFFICULTY_CONFIG[recipe.difficulty]
  const nutritionMax = 800

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={prefersReducedMotion() ? { duration: 0 } : { type: 'spring' as const, stiffness: 200, damping: 20 }}
          className="r69-detail-panel overflow-hidden"
        >
          <div className="r69-detail-inner rounded-2xl border border-border/50 bg-card mt-4 overflow-hidden"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
          >
            {/* Header */}
            <div className="r69-detail-header flex items-center justify-between p-4 border-b border-border/40">
              <div className="r69-detail-header-info flex items-center gap-3">
                <span className="r69-detail-emoji text-3xl">{recipe.emoji}</span>
                <div>
                  <h3 className="r69-detail-title text-base font-bold text-foreground">{recipe.name}</h3>
                  <div className="r69-detail-header-meta flex items-center gap-2 mt-0.5">
                    <span className={`r69-detail-diff text-[10px] font-bold px-2 py-0.5 rounded-full ${difficultyCfg.bgClass} ${difficultyCfg.textClass}`}>
                      {difficultyCfg.label}
                    </span>
                    <span className="r69-detail-time text-xs text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {formatPrepTime(recipe.prepTime)}
                    </span>
                    <span className="r69-detail-reviews text-xs text-muted-foreground flex items-center gap-0.5">
                      <Users className="h-3 w-3" />
                      {recipe.reviewCount} avaliações
                    </span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="r69-detail-close h-11 w-11 rounded-full bg-muted/60 border border-border/40 flex items-center justify-center"
                aria-label="Fechar detalhes"
              >
                <X className="r69-detail-close-icon h-5 w-5 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Nutrition summary bar */}
            <div className="r69-nutrition-bar p-4 border-b border-border/40">
              <div className="r69-nutrition-label text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Resumo nutricional
              </div>
              <div className="r69-nutrition-track relative h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((recipe.calories / nutritionMax) * 100, 100)}%` }}
                  transition={prefersReducedMotion() ? { duration: 0 } : { type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.2 }}
                  className="r69-nutrition-fill absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: recipe.calories < 250
                      ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                      : recipe.calories < 450
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(90deg, #ef4444, #f87171)',
                  }}
                />
              </div>
              <div className="r69-nutrition-value flex items-center justify-between mt-1.5">
                <span className="r69-nutrition-cal text-sm font-bold text-foreground">{recipe.calories} kcal</span>
                <span className="r69-nutrition-label-2 text-[10px] text-muted-foreground">
                  {recipe.calories < 250 ? 'Leve' : recipe.calories < 450 ? 'Moderado' : 'Rico'} por porção
                </span>
              </div>
            </div>

            {/* Content grid */}
            <div className="r69-detail-content grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
              {/* Ingredients */}
              <div className="r69-ingredients-section p-4">
                <h4 className="r69-ingredients-title text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <UtensilsCrossed className="r69-ingredients-icon h-3.5 w-3.5 text-primary" />
                  Ingredientes ({recipe.ingredients.length})
                </h4>
                <ul className="r69-ingredients-list space-y-1.5">
                  {recipe.ingredients.map((ing, i) => (
                    <motion.li
                      key={ing}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={prefersReducedMotion() ? { duration: 0 } : { delay: i * 0.04, type: 'spring' as const, stiffness: 300, damping: 22 }}
                      className="r69-ingredient-item flex items-center gap-2 text-xs text-foreground/80"
                    >
                      <div className="r69-ingredient-check h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <div className="r69-ingredient-dot h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                      {ing}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div className="r69-steps-section p-4">
                <h4 className="r69-steps-title text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <BookOpen className="r69-steps-icon h-3.5 w-3.5 text-primary" />
                  Modo de preparo ({recipe.steps.length} passos)
                </h4>
                <ol className="r69-steps-list space-y-3">
                  {recipe.steps.map((step, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={prefersReducedMotion() ? { duration: 0 } : { delay: i * 0.06, type: 'spring' as const, stiffness: 280, damping: 22 }}
                      className="r69-step-item flex gap-2.5 text-xs text-foreground/80 leading-relaxed"
                    >
                      <div className="r69-step-number h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span>{step}</span>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Add to cart footer */}
            <div className="r69-detail-footer p-4 border-t border-border/40">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="r69-add-cart-btn w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingCart className="r69-add-cart-icon h-4 w-4" />
                Adicionar ao carrinho ({recipe.ingredientCount} ingredientes)
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Component — CommunityRecipeHub
   ═══════════════════════════════════════════════════════════════ */

export function CommunityRecipeHub({ className }: CommunityRecipeHubProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set<string>())
  const [activeTab, setActiveTab] = useState<CategoryTab['key']>('todos')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  /* Fetch recipes with cachedFetch, fallback to hardcoded */
  useEffect(() => {
    let cancelled = false

    async function fetchRecipes() {
      try {
        const data = await cachedFetch<Recipe[]>('/api/recipes')
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setRecipes(data)
        } else {
          setRecipes(FALLBACK_RECIPES)
        }
      } catch {
        setRecipes(FALLBACK_RECIPES)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchRecipes()
    return () => { cancelled = true }
  }, [])

  /* Load favorites from localStorage */
  useEffect(() => {
    setFavorites(loadFavorites())
  }, [])

  /* Toggle favorite */
  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      saveFavorites(next)
      return next
    })
  }, [])

  /* Share recipe URL */
  const handleShare = useCallback((id: string) => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/receitas/${id}`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      }).catch(() => {
        // fallback
      })
    }
  }, [])

  /* Add to cart — simulated fetch to /api/products */
  const handleAddToCart = useCallback((id: string) => {
    const recipe = recipes.find((r) => r.id === id)
    if (!recipe) return

    // Simulated: would fetch product IDs from /api/products
    cachedFetch<{ products: Array<{ id: string; name: string }> }>('/api/products?q=' + encodeURIComponent(recipe.ingredients[0]))
      .then(() => {
        // Product data would be processed here
      })
      .catch(() => {
        // Fallback — use recipe ingredients directly as product IDs
      })
  }, [recipes])

  /* Expand recipe detail */
  const handleExpand = useCallback((id: string) => {
    setExpandedRecipeId((prev) => (prev === id ? null : id))
  }, [])

  /* Close detail panel */
  const handleCloseDetail = useCallback(() => {
    setExpandedRecipeId(null)
  }, [])

  /* Filter recipes */
  const filteredRecipes = useMemo(() => {
    let result = recipes

    // Category filter
    if (activeTab !== 'todos') {
      result = result.filter((r) => r.category === activeTab)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((r) => {
        const nameMatch = r.name.toLowerCase().includes(q)
        const ingredientMatch = r.ingredients.some((ing) => ing.toLowerCase().includes(q))
        return nameMatch || ingredientMatch
      })
    }

    return result
  }, [recipes, activeTab, searchQuery])

  /* Featured recipe */
  const featuredRecipe = useMemo(() => {
    return recipes.find((r) => r.isFeatured) ?? recipes[0] ?? null
  }, [recipes])

  return (
    <section
      className={`r69-community-recipe-hub r62-card-lift ${className ?? ''}`}
      aria-label="Hub de Receitas da Comunidade"
    >
      {/* Inject @keyframes via style tag for gradient border animation */}
      <style>{`
        @keyframes r69-gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="r69-container space-y-5"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="r69-header">
          <h2 className="r69-title text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 r62-heading-gradient">
            <TrendingUp className="r69-title-icon h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Receitas da Comunidade
          </h2>
          <p className="r69-subtitle text-sm text-muted-foreground mt-1">
            Descubra as melhores receitas compartilhadas pela nossa comunidade
          </p>
        </motion.div>

        {/* Community stats */}
        <CommunityStatsBar recipes={recipes} favoriteCount={favorites.size} />

        {/* Search input */}
        <motion.div variants={fadeInUp} className="r69-search-wrap relative">
          <Search className="r69-search-icon absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou ingrediente..."
            className="r69-search-input w-full h-11 pl-10 pr-10 rounded-xl bg-muted/50 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-colors"
            aria-label="Buscar receitas por nome ou ingrediente"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="r69-search-clear absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] rounded-full bg-muted-foreground/20 flex items-center justify-center"
              aria-label="Limpar busca"
            >
              <X className="r69-search-clear-icon h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </motion.div>

        {/* Category filter tabs */}
        <motion.div variants={fadeInUp} className="r69-tabs-wrap">
          <div className="r69-tabs flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <motion.button
                  key={tab.key}
                  variants={tabIndicator}
                  initial="idle"
                  animate={isActive ? 'active' : 'idle'}
                  whileHover={prefersReducedMotion() ? {} : { scale: 1.04 }}
                  whileTap={prefersReducedMotion() ? {} : { scale: 0.96 }}
                  onClick={() => setActiveTab(tab.key)}
                  className={`r69-tab h-11 rounded-full px-4 text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'r69-tab-active bg-primary text-primary-foreground'
                      : 'r69-tab-inactive bg-muted/60 text-muted-foreground border border-border/40 hover:bg-muted/80'
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="r69-tab-emoji text-sm">{tab.emoji}</span>
                  {tab.label}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Featured recipe card */}
        {featuredRecipe && activeTab === 'todos' && !searchQuery.trim() && (
          <FeaturedCard
            recipe={featuredRecipe}
            isFavorite={favorites.has(featuredRecipe.id)}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
            onExpand={handleExpand}
          />
        )}

        {/* Copied toast feedback */}
        <AnimatePresence>
          {copiedId && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={prefersReducedMotion() ? { duration: 0 } : { type: 'spring' as const, stiffness: 400, damping: 20 }}
              className="r69-toast fixed top-4 right-4 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-semibold"
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            >
              <Check className="r69-toast-icon h-4 w-4" />
              Link copiado!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        {isLoading && <SkeletonGrid />}

        {/* Recipe grid */}
        {!isLoading && (
          <AnimatePresence mode="wait">
            {filteredRecipes.length === 0 ? (
              <EmptyState query={searchQuery} />
            ) : (
              <motion.div
                key={`${activeTab}-${searchQuery}`}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="r69-recipe-grid grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
              >
                {filteredRecipes.map((recipe, i) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    index={i}
                    isFavorite={favorites.has(recipe.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onShare={handleShare}
                    onExpand={handleExpand}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Expandable recipe detail panel */}
        <RecipeDetailPanel
          recipe={expandedRecipeId ? recipes.find((r) => r.id === expandedRecipeId) ?? null : null}
          isOpen={expandedRecipeId !== null}
          onClose={handleCloseDetail}
        />

        {/* Bottom hint */}
        {!isLoading && filteredRecipes.length > 0 && (
          <motion.div
            variants={fadeInUp}
            className="r69-hint text-center py-2"
          >
            <p className="r69-hint-text text-[11px] text-muted-foreground/60">
              Toque nos cards para ver detalhes completos da receita
            </p>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
