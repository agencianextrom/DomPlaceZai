'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Users, ChefHat, Heart, Share2, ChevronDown,
  CheckCircle2, AlertCircle, Play, Pause, RotateCcw,
  Flame, Lightbulb, X, ArrowLeft, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

/* ────────────────────────── Types ────────────────────────── */

type Difficulty = 'Fácil' | 'Médio' | 'Difícil'
type DifficultyFilter = 'Todos' | Difficulty

interface RecipeIngredient {
  name: string
  quantity: string
  inStore: boolean
}

interface RecipeStep {
  instruction: string
  timerMinutes: number
}

interface Recipe {
  id: string
  name: string
  emoji: string
  difficulty: Difficulty
  time: number
  servings: number
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  tips: string[]
  gradient: string
}

/* ────────────────────────── Mock Data (Brazilian / Paraense) ────────────────────────── */

const RECIPES: Recipe[] = [
  {
    id: 'tacaca',
    name: 'Tacacá',
    emoji: '🍲',
    difficulty: 'Médio',
    time: 45,
    servings: 4,
    ingredients: [
      { name: 'Tucupi', quantity: '500ml', inStore: true },
      { name: 'Jambu', quantity: '200g', inStore: true },
      { name: 'Camarão seco', quantity: '100g', inStore: true },
      { name: 'Goma de mandioca', quantity: '300g', inStore: false },
      { name: 'Alho', quantity: '3 dentes', inStore: true },
      { name: 'Sal', quantity: 'a gosto', inStore: true },
    ],
    steps: [
      { instruction: 'Descasque e pique o alho. Deixe o camarão seco de molho por 30 minutos.', timerMinutes: 30 },
      { instruction: 'Ferva o tucupi com alho e sal por 15 minutos para eliminar a toxicidade.', timerMinutes: 15 },
      { instruction: 'Lave bem o jambu e escalde na água fervente. Reserve.', timerMinutes: 3 },
      { instruction: 'Misture a goma de mandioca com água fria e adicione ao tucupi quente, mexendo sem parar.', timerMinutes: 5 },
      { instruction: 'Sirva em cuia com jambu e camarão por cima.', timerMinutes: 0 },
    ],
    tips: ['Use tucupi de boa procedência para evitar intoxicação.', 'O jambu causa um leve formigueiro na língua — é normal e parte da experiência!'],
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 'manicoba',
    name: 'Maniçoba',
    emoji: '🥘',
    difficulty: 'Difícil',
    time: 180,
    servings: 8,
    ingredients: [
      { name: 'Folhas de maniva', quantity: '1kg', inStore: false },
      { name: 'Carne de porco', quantity: '500g', inStore: true },
      { name: 'Linguiça', quantity: '300g', inStore: true },
      { name: 'Bacon', quantity: '200g', inStore: true },
      { name: 'Feijão de corda', quantity: '300g', inStore: false },
      { name: 'Farinha de mandioca', quantity: '200g', inStore: true },
      { name: 'Alho', quantity: '5 dentes', inStore: true },
      { name: 'Cebola', quantity: '2 unidades', inStore: true },
    ],
    steps: [
      { instruction: 'Cozinhe as folhas de maniva por 7 dias trocando a água diariamente para eliminar o ácido cianídrico.', timerMinutes: 60 },
      { instruction: 'Pique as carnes em cubos e refogue com alho e cebola.', timerMinutes: 20 },
      { instruction: 'Adicione a maniva já cozida e o feijão de corda. Cozinhe em fogo baixo.', timerMinutes: 90 },
      { instruction: 'Tempere com sal e pimenta. Sirva com farinha de mandioca.', timerMinutes: 5 },
    ],
    tips: ['A maniva crua é tóxica — nunca pule a etapa de cozimento prolongado.', 'Prato típico do Círio de Nazaré em Belém do Pará.'],
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    id: 'acai-tigela',
    name: 'Açaí na Tigela',
    emoji: '🫐',
    difficulty: 'Fácil',
    time: 15,
    servings: 2,
    ingredients: [
      { name: 'Polpa de açaí', quantity: '400g', inStore: true },
      { name: 'Banana', quantity: '2 unidades', inStore: true },
      { name: 'Granola', quantity: '100g', inStore: true },
      { name: 'Mel', quantity: '2 colheres', inStore: true },
      { name: 'Leite em pó', quantity: '50g', inStore: false },
    ],
    steps: [
      { instruction: 'Bata a polpa de açaí com a banana e o leite em pó no liquidificador até ficar cremoso.', timerMinutes: 3 },
      { instruction: 'Despeje na tigela e adicione granola, mel e fatias de banana por cima.', timerMinutes: 2 },
    ],
    tips: ['Para um açaí mais consistente, congele a banana antes de bater.', 'Adicione guaraná em pó para um toque extra de energia.'],
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'pato-tucupi',
    name: 'Pato no Tucupi',
    emoji: '🍗',
    difficulty: 'Médio',
    time: 120,
    servings: 6,
    ingredients: [
      { name: 'Pato inteiro', quantity: '1,5kg', inStore: true },
      { name: 'Tucupi', quantity: '1 litro', inStore: true },
      { name: 'Jambu', quantity: '300g', inStore: true },
      { name: 'Alho', quantity: '4 dentes', inStore: true },
      { name: 'Cebola', quantity: '2 unidades', inStore: true },
      { name: 'Folha de chicória', quantity: '1 maço', inStore: false },
      { name: 'Pimenta malagueta', quantity: '2 unidades', inStore: true },
    ],
    steps: [
      { instruction: 'Tempere o pato com alho, sal e limão. Deixe marinando por 2 horas.', timerMinutes: 120 },
      { instruction: 'Asse o pato no forno a 180°C por 1 hora até dourar.', timerMinutes: 60 },
      { instruction: 'Ferva o tucupi com alho, cebola e pimenta por 15 minutos.', timerMinutes: 15 },
      { instruction: 'Desfie o pato e misture ao tucupi com jambu. Cozinhe mais 10 minutos.', timerMinutes: 10 },
      { instruction: 'Sirva com arroz branco e farinha de mandioca.', timerMinutes: 0 },
    ],
    tips: ['O pato pode ser substituído por frango para uma versão mais acessível.', 'Acompanhe com arroz branco para completar o prato paraense.'],
    gradient: 'from-red-400 to-rose-500',
  },
  {
    id: 'vatapa',
    name: 'Vatapá',
    emoji: '🍛',
    difficulty: 'Médio',
    time: 60,
    servings: 6,
    ingredients: [
      { name: 'Pão amanhecido', quantity: '400g', inStore: true },
      { name: 'Leite de coco', quantity: '400ml', inStore: false },
      { name: 'Camarão fresco', quantity: '300g', inStore: true },
      { name: 'Dendê', quantity: '3 colheres', inStore: false },
      { name: 'Cebola', quantity: '2 unidades', inStore: true },
      { name: 'Alho', quantity: '4 dentes', inStore: true },
      { name: 'Gengibre', quantity: '1 pedaço', inStore: true },
      { name: 'Amendoim', quantity: '100g', inStore: true },
    ],
    steps: [
      { instruction: 'Esfregue o pão com leite de coco até virar uma pasta homogênea.', timerMinutes: 10 },
      { instruction: 'Refogue cebola, alho e gengibre. Adicione os camarões e tempere.', timerMinutes: 15 },
      { instruction: 'Junte a pasta de pão e o amendoim. Cozinhe em fogo baixo, mexendo sempre.', timerMinutes: 25 },
      { instruction: 'Finalize com azeite de dendê e coentro. Sirva com arroz.', timerMinutes: 5 },
    ],
    tips: ['O vatapá fica ainda melhor no dia seguinte, quando os sabores se integram.', 'Pode ser servido dentro de acarajé para um lamento autêntico baiano.'],
    gradient: 'from-yellow-400 to-amber-500',
  },
  {
    id: 'moqueca-paraense',
    name: 'Moqueca Paraense',
    emoji: '🐟',
    difficulty: 'Médio',
    time: 50,
    servings: 4,
    ingredients: [
      { name: 'Filé de peixe', quantity: '600g', inStore: true },
      { name: 'Tomate', quantity: '3 unidades', inStore: true },
      { name: 'Cebola', quantity: '2 unidades', inStore: true },
      { name: 'Pimentão', quantity: '2 unidades', inStore: true },
      { name: 'Leite de coco', quantity: '200ml', inStore: false },
      { name: 'Coentro', quantity: '1 maço', inStore: true },
      { name: 'Limão', quantity: '2 unidades', inStore: true },
      { name: 'Azeite', quantity: '3 colheres', inStore: true },
    ],
    steps: [
      { instruction: 'Tempere o peixe com limão, sal e pimenta. Deixe descansar 20 minutos.', timerMinutes: 20 },
      { instruction: 'Em uma panela de barro, faça camadas de cebola, tomate, pimentão e peixe.', timerMinutes: 5 },
      { instruction: 'Cubra com leite de coco e cozinhe em fogo médio com tampa por 25 minutos.', timerMinutes: 25 },
      { instruction: 'Finalize com coentro fresco. Sirva com pirão ou arroz.', timerMinutes: 0 },
    ],
    tips: ['Peixe fresco de rio (tambaqui, pirarucu) dá o sabor autêntico paraense.', 'Panela de barro confere sabor especial — se não tiver, use panela de ferro.'],
    gradient: 'from-cyan-400 to-teal-500',
  },
  {
    id: 'bolinho-macaxeira',
    name: 'Bolinho de Macaxeira',
    emoji: '🥔',
    difficulty: 'Fácil',
    time: 40,
    servings: 12,
    ingredients: [
      { name: 'Macaxeira (mandioca)', quantity: '1kg', inStore: true },
      { name: 'Queijo coalho', quantity: '200g', inStore: true },
      { name: 'Manteiga', quantity: '50g', inStore: true },
      { name: 'Ovos', quantity: '2 unidades', inStore: true },
      { name: 'Sal', quantity: 'a gosto', inStore: true },
    ],
    steps: [
      { instruction: 'Cozinhe a macaxeira até ficar macia. Amasse ainda quente.', timerMinutes: 25 },
      { instruction: 'Misture manteiga, ovos e sal à massa. Adicione queijo coalho ralado.', timerMinutes: 5 },
      { instruction: 'Modele bolinhos e frite em óleo quente até dourar por igual.', timerMinutes: 10 },
    ],
    tips: ['Sirva como acompanhamento ou lanche com café da tarde.', 'A massa pode ser feita no dia anterior e guardada na geladeira.'],
    gradient: 'from-orange-400 to-amber-600',
  },
  {
    id: 'cupuacu-gelado',
    name: 'Cupuaçu Gelado',
    emoji: '🧊',
    difficulty: 'Fácil',
    time: 10,
    servings: 4,
    ingredients: [
      { name: 'Polpa de cupuaçu', quantity: '300g', inStore: true },
      { name: 'Leite condensado', quantity: '1 lata', inStore: true },
      { name: 'Água gelada', quantity: '500ml', inStore: true },
      { name: 'Gelo', quantity: 'a gosto', inStore: true },
    ],
    steps: [
      { instruction: 'Bata a polpa de cupuaçu no liquidificador com um pouco de água.', timerMinutes: 3 },
      { instruction: 'Coe, adicione leite condensado, água gelada e gelo. Misture bem.', timerMinutes: 2 },
      { instruction: 'Sirva imediatamente em copos altos.', timerMinutes: 0 },
    ],
    tips: ['Para uma versão alcoólica adulta, adicione rum ou cachaça.', 'O cupuaçu é nativo da Amazônia — prefira polpa congelada de boa qualidade.'],
    gradient: 'from-lime-400 to-green-500',
  },
]

/* ────────────────────────── Difficulty Config ────────────────────────── */

const DIFFICULTY_CONFIG: Record<Difficulty, { bg: string; text: string; badge: string }> = {
  'Fácil': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  'Médio': { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  'Difícil': { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20' },
}

/* ────────────────────────── Animation Variants ────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 22 } },
}

const filterPillVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 20, delay: i * 0.06 } }),
}

const expandVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2 } },
}

const heartPopVariants = {
  idle: { scale: 1 },
  liked: { scale: [1, 1.35, 0.9, 1.15, 1], transition: { duration: 0.5 } },
}

/* ────────────────────────── Helpers ────────────────────────── */

function formatTime(min: number): string {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h${m}min` : `${h}h`
}

function loadFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('r34-recipe-favorites')
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites)
  const toggle = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem('r34-recipe-favorites', JSON.stringify(next))
      return next
    })
  }, [])
  return { favorites, toggle }
}

/* ────────────────────────── Cooking Timer Sub-component ────────────────────────── */

function CookingTimer({ totalMinutes, recipeId, stepIndex }: { totalMinutes: number; recipeId: string; stepIndex: number }) {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [finished, setFinished] = useState(false)
  const totalSec = totalMinutes * 60
  const progress = totalSec > 0 ? Math.min(seconds / totalSec, 1) : 0
  const circumference = 2 * Math.PI * 18
  const offset = circumference * (1 - progress)

  const finishedRef = useRef(false)

  useEffect(() => {
    if (!running || totalSec === 0) return
    let interval: ReturnType<typeof setInterval> | null = null
    interval = setInterval(() => {
      setSeconds(s => {
        if (s + 1 >= totalSec) {
          if (!finishedRef.current) {
            finishedRef.current = true
            setFinished(true)
          }
          return totalSec
        }
        return s + 1
      })
    }, 1000)
    return () => { if (interval) clearInterval(interval) }
  }, [running, totalSec])

  const reset = () => { setSeconds(0); setFinished(false); setRunning(false); finishedRef.current = false }

  if (totalMinutes === 0) return null

  const remaining = totalSec - seconds
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
    >
      <div className="relative h-11 w-11 shrink-0">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
          <motion.circle
            cx="20" cy="20" r="18" fill="none"
            stroke={finished ? '#16a34a' : 'rgba(234,88,12,0.8)'}
            strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${finished ? 'text-green-600' : 'text-orange-600'}`}>
          {finished ? '✓' : display}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => { if (finished) reset(); else setRunning(!running) }}
          className={`h-8 w-8 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-white ${
            finished ? 'bg-green-500' : running ? 'bg-orange-500' : 'bg-muted'
          }`}
        >
          {finished ? <CheckCircle2 className="h-3.5 w-3.5" /> : running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={reset}
          className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ────────────────────────── Skeleton ────────────────────────── */

function RecipesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="min-w-[200px] h-[260px] rounded-2xl border border-border/50 overflow-hidden shrink-0">
            <Skeleton className="h-28 w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <div className="flex gap-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-4 w-14" /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────── Recipe Detail Panel ────────────────────────── */

function RecipeDetail({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const { favorites, toggle } = useFavorites()
  const isFav = favorites.includes(recipe.id)
  const diffCfg = DIFFICULTY_CONFIG[recipe.difficulty]
  const inStoreCount = recipe.ingredients.filter(i => i.inStore).length
  const needBuyCount = recipe.ingredients.filter(i => !i.inStore).length

  const toggleCheck = (name: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name); else next.add(name)
      return next
    })
  }

  const handleShare = async () => {
    const text = `${recipe.name}\nTempo: ${formatTime(recipe.time)} | Porções: ${recipe.servings}\n\nIngredientes:\n${recipe.ingredients.map(i => `- ${i.quantity} ${i.name}`).join('\n')}`
    if (navigator.share) {
      try { await navigator.share({ title: recipe.name, text }) } catch { /* cancelled */ }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring' as const, stiffness: 220, damping: 24 }}
      className="rounded-2xl border border-border/60 bg-card overflow-hidden r62-card-lift r92-recipes-card"
      style={{ boxShadow: '0 8px 32px -4px rgba(0,0,0,0.12)' }}
    >
      {/* Header */}
      <div className={`relative bg-gradient-to-br ${recipe.gradient} p-5`}>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          className="absolute top-3 right-3 min-h-[44px] min-w-[44px] h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white z-10"
        >
          <X className="h-4 w-4" />
        </motion.button>
        <div className="flex items-center gap-3">
          <motion.span
            className="text-4xl"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 12 }}
          >
            {recipe.emoji}
          </motion.span>
          <div>
            <h3 className="text-lg font-bold text-white">{recipe.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${diffCfg.badge} text-[10px] border`}>{recipe.difficulty}</Badge>
              <span className="text-[11px] text-white/80 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTime(recipe.time)}</span>
              <span className="text-[11px] text-white/80 flex items-center gap-1"><Users className="h-3 w-3" /> {recipe.servings} porções</span>
            </div>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4">
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => toggle(recipe.id)}
            className="h-9 min-h-[44px] px-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-1.5 text-white text-xs font-semibold">
            <motion.div variants={heartPopVariants} animate={isFav ? 'liked' : 'idle'} key={isFav ? 'on' : 'off'}>
              <Heart className={`h-4 w-4 ${isFav ? 'fill-red-400 text-red-400' : ''}`} />
            </motion.div>
            {isFav ? 'Salvo' : 'Salvar'}
          </motion.button>
          <motion.button whileTap={{ scale: 0.88 }} onClick={handleShare}
            className="relative h-9 min-h-[44px] px-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-1.5 text-white text-xs font-semibold overflow-hidden r34-share-btn">
            <Share2 className="h-4 w-4" /> Compartilhar
            <span className="r34-shimmer-bar" />
          </motion.button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="max-h-[420px] overflow-y-auto r34-scroll-area">
        {/* Ingredient availability summary */}
        <div className="p-4 flex gap-3">
          <div className="flex-1 rounded-xl bg-emerald-500/10 border border-emerald-500/15 p-3 text-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{inStoreCount} na loja</p>
          </div>
          <div className="flex-1 rounded-xl bg-orange-500/10 border border-orange-500/15 p-3 text-center">
            <AlertCircle className="h-4 w-4 text-orange-500 mx-auto mb-1" />
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400">{needBuyCount} para comprar</p>
          </div>
        </div>

        {/* Ingredients */}
        <div className="px-4 pb-3">
          <h4 className="text-sm font-bold flex items-center gap-1.5 mb-2">
            <Flame className="h-4 w-4 text-orange-500" /> Ingredientes
          </h4>
          <div className="space-y-1.5">
            {recipe.ingredients.map((ing, idx) => {
              const isChecked = checked.has(ing.name)
              return (
                <motion.div
                  key={ing.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, type: 'spring' as const, stiffness: 400, damping: 22 }}
                  className="flex items-center gap-2.5"
                >
                  <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleCheck(ing.name)}
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-border'
                    }`}>
                    {isChecked && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </motion.button>
                  <span className={`text-sm flex-1 ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                    {ing.quantity} {ing.name}
                  </span>
                  {ing.inStore ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Steps */}
        <div className="px-4 pb-3">
          <h4 className="text-sm font-bold flex items-center gap-1.5 mb-2">
            <ChefHat className="h-4 w-4 text-amber-500" /> Modo de Preparo
          </h4>
          <div className="space-y-3">
            {recipe.steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, type: 'spring' as const, stiffness: 300, damping: 22 }}
                className="flex gap-3"
              >
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{step.instruction}</p>
                  {step.timerMinutes > 0 && (
                    <div className="mt-2">
                      <CookingTimer totalMinutes={step.timerMinutes} recipeId={recipe.id} stepIndex={idx} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tips */}
        {recipe.tips.length > 0 && (
          <div className="px-4 pb-4">
            <h4 className="text-sm font-bold flex items-center gap-1.5 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" /> Dicas
            </h4>
            <div className="space-y-2">
              {recipe.tips.map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-xl bg-yellow-500/8 border border-yellow-500/15 p-3 text-sm text-muted-foreground leading-relaxed"
                >
                  {tip}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shimmer styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .r34-shimmer-bar {
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%);
          animation: r34-shimmer-move 2.5s ease-in-out infinite;
        }
        @keyframes r34-shimmer-move {
          0% { left: -100%; } 100% { left: 150%; }
        }
        .r34-scroll-area::-webkit-scrollbar { width: 4px; }
        .r34-scroll-area::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
        .r34-scroll-area::-webkit-scrollbar-track { background: transparent; }
      ` }} />
    </motion.div>
  )
}

/* ────────────────────────── Main Component ────────────────────────── */

export function ProductRecipes() {
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<DifficultyFilter>('Todos')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { favorites, toggle } = useFavorites()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  const filteredRecipes = useMemo(() => {
    if (activeFilter === 'Todos') return RECIPES
    return RECIPES.filter(r => r.difficulty === activeFilter)
  }, [activeFilter])

  const filters: DifficultyFilter[] = ['Todos', 'Fácil', 'Médio', 'Difícil']

  const scrollBy = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: direction === 'left' ? -220 : 220, behavior: 'smooth' })
  }

  const selectedRecipe = useMemo(() => RECIPES.find(r => r.id === expandedId), [expandedId])

  return (
    <section className="w-full">
      {/* Shimmer + scroll styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .r34-card-shimmer::after {
          content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
          animation: r34-card-shimmer 3s ease-in-out infinite;
        }
        @keyframes r34-card-shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .r34-carousel::-webkit-scrollbar { height: 4px; }
        .r34-carousel::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
      ` }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
            style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.25)' }}
          >
            <ChefHat className="h-4.5 w-4.5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Receitas da Região</h2>
            <p className="text-[11px] text-muted-foreground">Sabores amazônicos e paraenses</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground border-0">
          {filteredRecipes.length} receitas
        </Badge>
      </div>

      {/* Difficulty filter pills */}
      <div className="relative flex items-center gap-2 mb-4">
        {filters.map((filter, i) => {
          const isActive = activeFilter === filter
          const isDiff = filter !== 'Todos'
          const cfg = isDiff ? DIFFICULTY_CONFIG[filter as Difficulty] : null
          return (
            <motion.button
              key={filter}
              custom={i}
              variants={filterPillVariants}
              initial="hidden"
              animate="visible"
              whileTap={{ scale: 0.92 }}
              onClick={() => { setActiveFilter(filter); setExpandedId(null) }}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                isActive
                  ? isDiff ? `${cfg!.bg} ${cfg!.text} border-current/20` : 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border/50 hover:border-primary/30'
              }`}
            >
              {filter}
              {isActive && (
                <motion.div
                  layoutId="r34-filter-underline"
                  className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-current rounded-full"
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Skeleton loading */}
      {loading && <RecipesSkeleton />}

      {/* Recipe cards carousel */}
      {!loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          {/* Scroll arrows */}
          <div className="hidden sm:flex absolute -left-3 top-0 bottom-0 z-10 items-center">
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => scrollBy('left')}
              className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-full bg-background border border-border/60 flex items-center justify-center shadow-sm">
              <ArrowLeft className="h-3.5 w-3.5" />
            </motion.button>
          </div>
          <div className="hidden sm:flex absolute -right-3 top-0 bottom-0 z-10 items-center">
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => scrollBy('right')}
              className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-full bg-background border border-border/60 flex items-center justify-center shadow-sm">
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.button>
          </div>

          {/* Cards */}
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto r34-carousel pb-2 snap-x snap-mandatory">
            {filteredRecipes.map((recipe) => {
              const diffCfg = DIFFICULTY_CONFIG[recipe.difficulty]
              const isExpanded = expandedId === recipe.id
              const isFav = favorites.includes(recipe.id)
              return (
                <motion.div
                  key={recipe.id}
                  variants={cardVariants}
                  className="min-w-[220px] sm:min-w-[240px] snap-start shrink-0"
                >
                  <motion.div
                    whileHover={{ y: -6, boxShadow: '0 12px 32px -8px rgba(0,0,0,0.16)' }}
                    transition={{ type: 'spring' as const, stiffness: 320, damping: 22 }}
                    onClick={() => setExpandedId(isExpanded ? null : recipe.id)}
                    className={`relative rounded-2xl border overflow-hidden cursor-pointer transition-colors ${
                      isExpanded ? 'border-primary/40' : 'border-border/50'
                    }`}
                  >
                    {/* Image / Emoji area */}
                    <div className={`relative bg-gradient-to-br ${recipe.gradient} p-6 flex flex-col items-center min-h-[120px]`}>
                      <div className="r34-card-shimmer absolute inset-0" />
                      <motion.span
                        className="text-5xl"
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring' as const, stiffness: 400, damping: 12 }}
                      >
                        {recipe.emoji}
                      </motion.span>

                      {/* Favorite button */}
                      <motion.button
                        whileTap={{ scale: 0.75 }}
                        onClick={(e) => { e.stopPropagation(); toggle(recipe.id) }}
                        className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                      >
                        <motion.div variants={heartPopVariants} animate={isFav ? 'liked' : 'idle'} key={isFav ? 'fav' : 'ufav'}>
                          <Heart className={`h-4 w-4 ${isFav ? 'fill-red-400 text-red-400' : 'text-white'}`} />
                        </motion.div>
                      </motion.button>
                    </div>

                    {/* Info */}
                    <div className="p-3.5 bg-card">
                      <h3 className="text-sm font-bold mb-2 truncate">{recipe.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${diffCfg.badge} text-[10px] border`}>{recipe.difficulty}</Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-3 w-3" /> {formatTime(recipe.time)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                          <Users className="h-3 w-3" /> {recipe.servings} porções
                        </span>
                        <motion.div layout>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Expanded recipe detail */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div className="mt-4" layout>
            <RecipeDetail recipe={selectedRecipe} onClose={() => setExpandedId(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
