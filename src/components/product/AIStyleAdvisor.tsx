'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'
import { Sparkles, ChevronRight, RotateCcw, Bookmark, Check, Shirt } from 'lucide-react'

/* ────────────── mock data ────────────── */

const QUIZ_STEPS = [
  {
    title: 'Qual é a sua vibe?',
    subtitle: 'Escolha o estilo que mais combina com você',
    options: [
      { id: 'casual', label: 'Casual', emoji: '☕', desc: 'Confortável e descontraído' },
      { id: 'elegante', label: 'Elegante', emoji: '✨', desc: 'Sofisticado e refinado' },
      { id: 'esportivo', label: 'Esportivo', emoji: '🏃', desc: 'Ativo e dinâmico' },
      { id: 'streetwear', label: 'Streetwear', emoji: '🛹', desc: 'Urbano e autêntico' },
    ],
  },
  {
    title: 'Prefência de cores',
    subtitle: 'Qual paleta de cores te define?',
    options: [
      { id: 'neutro', label: 'Neutro', emoji: '🤍', desc: 'Branco, cinza e bege' },
      { id: 'colorido', label: 'Colorido', emoji: '🎨', desc: 'Tons vivos e variados' },
      { id: 'escuro', label: 'Escuro', emoji: '🖤', desc: 'Preto, navy e grafite' },
      { id: 'vibrante', label: 'Vibrante', emoji: '🌈', desc: 'Cores fortes e marcantes' },
    ],
  },
  {
    title: 'Ocasião principal',
    subtitle: 'Para onde você mais usa suas peças?',
    options: [
      { id: 'trabalho', label: 'Trabalho', emoji: '💼', desc: 'Produção profissional' },
      { id: 'lazer', label: 'Lazer', emoji: '🌴', desc: 'Momentos relaxantes' },
      { id: 'festa', label: 'Festa', emoji: '🎉', desc: 'Noites especiais' },
      { id: 'dia-a-dia', label: 'Dia a dia', emoji: '🌤️', desc: 'Do café à rua' },
    ],
  },
]

const STYLE_PROFILES: Record<string, { name: string; emoji: string; desc: string; colors: string[] }> = {
  'casual-neutro-trabalho': { name: 'Minimalista Urbano', emoji: '🏙️', desc: 'Você valoriza a simplicidade com elegância silenciosa. Seus looks são limpos, neutros e perfeitos para ambientes profissionais.', colors: ['#e5e5e5', '#a3a3a3', '#525252'] },
  'casual-neutro-lazer': { name: 'Soft Natural', emoji: '☁️', desc: 'Conforto e leveza definem seu estilo. Cores suaves e peças que fluem naturalmente com o seu dia.', colors: ['#faf5ef', '#d6cfc4', '#8b7e6a'] },
  'casual-neutro-festa': { name: 'Quiet Luxury', emoji: '🥂', desc: 'Elegância discreta que brilha sem esforço. Você investe em qualidade e deixa os detalhes falarem.', colors: ['#f5f5f4', '#c8c0b8', '#6b5e4f'] },
  'casual-neutro-dia-a-dia': { name: 'Cápsula Essencial', emoji: '🌿', desc: 'Prático e versátil, você monta infinitas combinações com poucas peças-chave de qualidade.', colors: ['#e8e4df', '#b0a89e', '#4a4540'] },
}

function getStyleProfile(vibe: string, color: string, occasion: string) {
  const key = `${vibe}-${color}-${occasion}`
  if (STYLE_PROFILES[key]) return STYLE_PROFILES[key]
  const fallback: Record<string, { name: string; emoji: string; desc: string; colors: string[] }> = {
    casual: { name: 'Relax Total', emoji: '🛋️', desc: 'Seu estilo é leve, confortável e perfeito para quem valoriza bem-estar em cada detalhe.', colors: ['#e0d5c7', '#c9a96e', '#6b5b3e'] },
    elegante: { name: 'Clássico Atemporal', emoji: '👑', desc: 'Sofisticação que nunca sai de moda. Você sabe que menos é mais quando a qualidade fala alto.', colors: ['#f0e6d3', '#8b7355', '#2c2416'] },
    esportivo: { name: 'Athleisure Moderno', emoji: '⚡', desc: 'Performance encontra estilo. Cada peça foi pensada para quem vive em movimento.', colors: ['#d4edda', '#5fa872', '#1a472a'] },
    streetwear: { name: 'Cultura Urbana', emoji: '🔥', desc: 'Autêntico e ousado, você usa moda como expressão de identidade e atitude.', colors: ['#fce4ec', '#e53935', '#212121'] },
  }
  return fallback[vibe] || fallback.casual
}

const OUTFIT_SUGGESTIONS = [
  { id: 1, emoji: '👔', name: 'Visual Executivo', pieces: ['Camisa slim', 'Calça chino', 'Cinto couro', 'Sapato oxford'], price: 'R$ 489,90' },
  { id: 2, emoji: '👖', name: 'Casual Fim de Semana', pieces: ['Camiseta premium', 'Jeans selvagem', 'Tênis branco', 'Mochila canvas'], price: 'R$ 357,00' },
  { id: 3, emoji: '🧥', name: 'Layer Perfeito', pieces: ['T-shirt básica', 'Jaqueta bomber', 'Jogger cargo', 'Sneaker chunky'], price: 'R$ 612,50' },
  { id: 4, emoji: '👗', name: 'Noite Elegante', pieces: ['Blazer estruturado', 'Camisa satenada', 'Calça alfaiataria', 'Loafer premium'], price: 'R$ 728,00' },
]

const TRENDING_STYLES = [
  { name: 'Quiet Luxury', emoji: '🤫', popularity: 92 },
  { name: 'Gorpcore', emoji: '⛰️', popularity: 78 },
  { name: 'Old Money', emoji: '💰', popularity: 85 },
  { name: 'Y2K Revival', emoji: '💫', popularity: 71 },
]

/* ────────────── spring variants ────────────── */

const springBounce = { type: 'spring' as const, stiffness: 300, damping: 20 }
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 25 }
const springStiff = { type: 'spring' as const, stiffness: 400, damping: 30 }

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

/* ────────────── sub-components ────────────── */

function SkeletonLoading() {
  return (
    <div className="r34-skeleton space-y-6 p-6">
      <Skeleton className="r34-skeleton-title h-8 w-3/4 mx-auto" />
      <Skeleton className="r34-skeleton-sub h-4 w-1/2 mx-auto" />
      <div className="r34-skeleton-grid grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="r34-skeleton-card h-28 rounded-xl" />
        ))}
      </div>
      <div className="r34-skeleton-prog h-3 w-full rounded-full" />
    </div>
  )
}

function QuizOption({ option, selected, onSelect, index }: {
  option: { id: string; label: string; emoji: string; desc: string }
  selected: boolean
  onSelect: () => void
  index: number
}) {
  return (
    <motion.button
      layout
      transition={springBounce}
      onClick={onSelect}
      whileTap={{ scale: 0.95 }}
      className={`r34-quiz-option relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-colors cursor-pointer w-full ${
        selected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-primary/40 hover:bg-accent/50'
      }`}
      style={{ boxShadow: selected ? '0 4px 20px rgba(124, 58, 237, 0.15)' : 'none' }}
    >
      {selected && (
        <motion.div
          layoutId="r34-quiz-check"
          className="r34-quiz-check absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
          transition={springStiff}
        >
          <Check className="h-3.5 w-3.5" />
        </motion.div>
      )}
      <motion.span
        className="r34-quiz-emoji text-3xl"
        initial={{ rotate: -10 }}
        animate={{ rotate: selected ? 0 : -10 }}
        transition={springGentle}
      >
        {option.emoji}
      </motion.span>
      <motion.span className="r34-quiz-label text-sm font-semibold">{option.label}</motion.span>
      <motion.span className="r34-quiz-desc text-xs text-muted-foreground text-center leading-tight">{option.desc}</motion.span>
      <motion.div
        className="r34-quiz-number absolute bottom-2 right-3 text-[10px] text-muted-foreground/50 font-mono"
        initial={false}
      >
        {index + 1}
      </motion.div>
    </motion.button>
  )
}

function StyleProfileCard({ profile, showConfetti }: {
  profile: { name: string; emoji: string; desc: string; colors: string[] }
  showConfetti: boolean
}) {
  return (
    <motion.div
      className="r34-profile-card relative overflow-hidden rounded-2xl border bg-card p-6"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
      {...scaleIn}
      transition={springBounce}
    >
      <ConfettiBurst active={showConfetti} particleCount={50} spread={180} duration={1200} />
      <div className="r34-profile-header flex items-center gap-3 mb-4">
        <motion.span
          className="r34-profile-emoji text-4xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...springBounce, delay: 0.1 }}
        >
          {profile.emoji}
        </motion.span>
        <div>
          <motion.h3
            className="r34-profile-name text-lg font-bold"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springGentle, delay: 0.15 }}
          >
            {profile.name}
          </motion.h3>
          <motion.p
            className="r34-profile-label text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Seu perfil de estilo
          </motion.p>
        </div>
      </div>

      <motion.div
        className="r34-palette flex gap-3 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.2 }}
      >
        {profile.colors.map((color, i) => (
          <motion.div
            key={i}
            className="r34-palette-circle flex items-center justify-center rounded-full border border-border/50"
            style={{ backgroundColor: color, width: 44, height: 44 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...springBounce, delay: 0.3 + i * 0.08 }}
            title={color}
          >
            <span className="text-[9px] font-mono opacity-70">{color}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        className="r34-profile-desc text-sm text-muted-foreground leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {profile.desc}
      </motion.p>
    </motion.div>
  )
}

function OutfitCard({ outfit, index }: { outfit: typeof OUTFIT_SUGGESTIONS[number]; index: number }) {
  const [added, setAdded] = useState(false)

  return (
    <motion.div
      className="r34-outfit-card flex-shrink-0 w-64 rounded-xl border bg-card overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...springGentle, delay: index * 0.1 }}
    >
      <div className="r34-outfit-visual flex h-32 items-center justify-center bg-gradient-to-br from-accent to-accent/40">
        <motion.span
          className="r34-outfit-emoji text-5xl"
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={springBounce}
        >
          {outfit.emoji}
        </motion.span>
      </div>
      <div className="r34-outfit-body p-4 space-y-3">
        <h4 className="r34-outfit-name text-sm font-semibold">{outfit.name}</h4>
        <ul className="r34-outfit-pieces space-y-1">
          {outfit.pieces.map((piece) => (
            <li key={piece} className="r34-outfit-piece text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-primary/60 flex-shrink-0" />
              {piece}
            </li>
          ))}
        </ul>
        <div className="r34-outfit-footer flex items-center justify-between pt-1">
          <span className="r34-outfit-price text-sm font-bold">{outfit.price}</span>
          <Button
            size="sm"
            variant={added ? 'secondary' : 'default'}
            className="r34-outfit-btn h-7 text-xs px-3"
            onClick={() => setAdded(true)}
          >
            {added ? (
              <><Check className="h-3 w-3 mr-1" /> Adicionado</>
            ) : (
              <><Shirt className="h-3 w-3 mr-1" /> Montar look</>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function TrendingBadge({ trend, index }: { trend: typeof TRENDING_STYLES[number]; index: number }) {
  return (
    <motion.div
      className="r34-trend-card flex items-center gap-3 rounded-lg border bg-card p-3"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay: index * 0.08 }}
    >
      <span className="r34-trend-emoji text-xl">{trend.emoji}</span>
      <div className="r34-trend-info flex-1 min-w-0">
        <div className="r34-trend-header flex items-center justify-between mb-1">
          <span className="r34-trend-name text-xs font-semibold truncate">{trend.name}</span>
          <span className="r34-trend-pct text-[10px] font-mono text-muted-foreground">{trend.popularity}%</span>
        </div>
        <Progress value={trend.popularity} className="r34-trend-bar h-1.5" />
      </div>
    </motion.div>
  )
}

/* ────────────── main component ────────────── */

export function AIStyleAdvisor() {
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window === 'undefined') return 0
    try {
      const raw = localStorage.getItem('r34-style-quiz')
      if (raw) return 3
    } catch { /* ignore */ }
    return 0
  })
  const [selections, setSelections] = useState<Record<number, string>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const raw = localStorage.getItem('r34-style-quiz')
      if (raw) return JSON.parse(raw).selections ?? {}
    } catch { /* ignore */ }
    return {}
  })
  const [showResult, setShowResult] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return !!localStorage.getItem('r34-style-quiz')
    } catch { return false }
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const [saved, setSaved] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return !!localStorage.getItem('r34-style-quiz')
    } catch { return false }
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  const profile = showResult
    ? getStyleProfile(selections[0], selections[1], selections[2])
    : null

  const handleSelect = useCallback((step: number, optionId: string) => {
    setSelections((prev) => ({ ...prev, [step]: optionId }))
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setShowResult(true)
      setTimeout(() => setShowConfetti(true), 300)
      setTimeout(() => setShowConfetti(false), 1500)
    }
  }, [currentStep])

  const handleSave = useCallback(() => {
    localStorage.setItem('r34-style-quiz', JSON.stringify({ selections }))
    setSaved(true)
  }, [selections])

  const handleReset = useCallback(() => {
    setSelections({})
    setCurrentStep(0)
    setShowResult(false)
    setShowConfetti(false)
    setSaved(false)
    localStorage.removeItem('r34-style-quiz')
  }, [])

  if (loading) return <SkeletonLoading />

  return (
    <section className="r34-advisor w-full max-w-2xl mx-auto space-y-6" aria-label="Assistente de Estilo com IA">
      {/* Header */}
      <motion.div className="r34-header flex items-center gap-3 px-1" {...fadeUp} transition={springGentle}>
        <div className="r34-icon-wrap flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="r34-icon h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="r34-title text-lg font-bold leading-tight">Assistente de Estilo IA</h2>
          <p className="r34-subtitle text-xs text-muted-foreground">Descubra seu perfil de moda personalizado</p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!showResult ? (
          /* ─── Quiz ─── */
          <motion.div key={`quiz-${currentStep}`} className="r34-quiz space-y-5" {...fadeUp} exit={{ opacity: 0, y: -10 }} transition={springGentle}>
            {/* Progress indicator */}
            <div className="r34-quiz-progress flex items-center gap-2 px-1">
              {QUIZ_STEPS.map((_, i) => (
                <div key={i} className="r34-step-dot flex-1">
                  <motion.div
                    className={`r34-dot h-1.5 rounded-full ${i <= currentStep ? 'bg-primary' : 'bg-border'}`}
                    animate={{ scaleX: i <= currentStep ? 1 : 0.6 }}
                    transition={springGentle}
                  />
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="r34-step-content">
              <motion.h3 className="r34-step-title text-base font-semibold mb-1" {...fadeUp} transition={springGentle}>
                {QUIZ_STEPS[currentStep].title}
              </motion.h3>
              <motion.p className="r34-step-subtitle text-sm text-muted-foreground mb-4" {...fadeUp} transition={{ ...springGentle, delay: 0.05 }}>
                {QUIZ_STEPS[currentStep].subtitle}
              </motion.p>

              <motion.div className="r34-options-grid grid grid-cols-2 gap-3" layout>
                {QUIZ_STEPS[currentStep].options.map((opt, i) => (
                  <QuizOption
                    key={opt.id}
                    option={opt}
                    selected={selections[currentStep] === opt.id}
                    onSelect={() => handleSelect(currentStep, opt.id)}
                    index={i}
                  />
                ))}
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="r34-nav flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="r34-nav-back"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
              >
                Voltar
              </Button>
              <Button
                size="sm"
                className="r34-nav-next"
                disabled={!selections[currentStep]}
                onClick={handleNext}
              >
                {currentStep < 2 ? (
                  <>Próximo <ChevronRight className="h-4 w-4 ml-1" /></>
                ) : (
                  <>Ver resultado <Sparkles className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          /* ─── Results ─── */
          <motion.div key="results" className="r34-results space-y-5" {...fadeUp} transition={springGentle}>

            {profile && <StyleProfileCard profile={profile} showConfetti={showConfetti} />}

            {/* Outfit suggestions */}
            <div className="r34-outfits-section space-y-3">
              <div className="r34-outfits-header flex items-center justify-between px-1">
                <h3 className="r34-outfits-title text-sm font-semibold">Sugestões de looks</h3>
                <Badge variant="secondary" className="r34-outfits-badge text-[10px]">
                  {OUTFIT_SUGGESTIONS.length} looks
                </Badge>
              </div>
              <div className="r34-outfits-scroll flex gap-4 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
                {OUTFIT_SUGGESTIONS.map((outfit, i) => (
                  <OutfitCard key={outfit.id} outfit={outfit} index={i} />
                ))}
              </div>
            </div>

            {/* Trending styles */}
            <div className="r34-trending-section space-y-3">
              <h3 className="r34-trending-title text-sm font-semibold px-1">Estilos em alta</h3>
              <div className="r34-trending-grid grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRENDING_STYLES.map((trend, i) => (
                  <TrendingBadge key={trend.name} trend={trend} index={i} />
                ))}
              </div>
            </div>

            {/* Save / Reset */}
            <div className="r34-actions flex items-center gap-3 pt-1">
              <Button
                variant={saved ? 'secondary' : 'default'}
                size="sm"
                className="r34-save-btn"
                onClick={handleSave}
                disabled={saved}
              >
                {saved ? (
                  <><Check className="h-4 w-4 mr-1" /> Salvo</>
                ) : (
                  <><Bookmark className="h-4 w-4 mr-1" /> Salvar perfil</>
                )}
              </Button>
              <Button variant="ghost" size="sm" className="r34-reset-btn" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" /> Refazer quiz
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
