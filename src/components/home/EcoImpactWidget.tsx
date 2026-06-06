'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Share2, ChevronDown, Lock, Trophy } from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'

// ── Interfaces ──────────────────────────────────────────────────────────────

interface EcoStat {
  icon: string
  label: string
  value: number
  unit: string
  color: string
}

interface EcoAchievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  threshold: number
}

interface EcoTip {
  id: string
  title: string
  content: string
  icon: string
}

interface EcoImpactWidgetProps {
  className?: string
}

interface EcoData {
  co2Saved: number
  treesEquivalent: number
  bottlesSaved: number
  kmAvoided: number
  ecoScore: number
  weeklyProgress: number[]
  achievements: EcoAchievement[]
}

// ── Default / Fallback data ─────────────────────────────────────────────────

const FALLBACK_ECO_DATA: EcoData = {
  co2Saved: 12.4,
  treesEquivalent: 3,
  bottlesSaved: 8,
  kmAvoided: 45,
  ecoScore: 72,
  weeklyProgress: [40, 65, 55, 78],
  achievements: [
    { id: 'first-purchase', name: 'Primeira Compra', description: 'Fez sua primeira compra local', icon: '🛒', unlocked: true, threshold: 1 },
    { id: 'local-hero', name: 'Herói Local', description: '10 compras em lojas da região', icon: '🏠', unlocked: true, threshold: 10 },
    { id: 'zero-waste', name: 'Zero Desperdício', description: 'Usou sacola reutilizável 5 vezes', icon: '♻️', unlocked: false, threshold: 5 },
    { id: 'green-streak', name: 'Sequência Verde', description: '7 dias seguidos de compras sustentáveis', icon: '🌿', unlocked: true, threshold: 7 },
    { id: 'eco-champion', name: 'Campeão Ecológico', description: 'Economizou 10kg de CO2', icon: '🏆', unlocked: false, threshold: 10 },
    { id: 'planet-defender', name: 'Defensor do Planeta', description: 'Alcance 100 pontos ecológicos', icon: '🌍', unlocked: false, threshold: 100 },
  ],
}

const ECO_TIPS: EcoTip[] = [
  {
    id: 'tip-bag',
    title: 'Leve sua sacola',
    content: 'Leve sacolas reutilizáveis para o mercado. Cada sacola de plástico evitada ajuda a reduzir a poluição em Dom Eliseu e na região do Pará.',
    icon: '👜',
  },
  {
    id: 'tip-local',
    title: 'Compre do produtor local',
    content: 'Produtos locais viajam menos quilômetros, reduzindo emissões de CO2 e apoiando a economia de Dom Eliseu. Conheça nossos produtores!',
    icon: '🌱',
  },
  {
    id: 'tip-recycle',
    title: 'Separe o lixo reciclável',
    content: 'Se plástico, papel e vidro forem separados corretamente, até 60% do lixo doméstico pode ser reciclado. Faça sua parte!',
    icon: '♻️',
  },
]

// ── SVG circle helpers ──────────────────────────────────────────────────────

const SCORE_RADIUS = 58
const SCORE_CIRCUMFERENCE = 2 * Math.PI * SCORE_RADIUS

// ── Spring transition presets ───────────────────────────────────────────────

const SPRING_MOTION = { type: 'spring' as const, stiffness: 260, damping: 22 }
const SPRING_BOUNCE = { type: 'spring' as const, stiffness: 400, damping: 17 }
const SPRING_GENTLE = { type: 'spring' as const, stiffness: 180, damping: 25 }

// ── Component ──────────────────────────────────────────────────────────────

export function EcoImpactWidget({ className }: EcoImpactWidgetProps) {
  const [ecoData, setEcoData] = useState<EcoData>(FALLBACK_ECO_DATA)
  const [displayScore, setDisplayScore] = useState(0)
  const [expandedTip, setExpandedTip] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // ── Data fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    const loadEcoData = async () => {
      try {
        const stored = localStorage.getItem('r62-eco-data')
        if (stored) {
          const parsed: EcoData = JSON.parse(stored) as EcoData
          if (!cancelled) {
            setEcoData(parsed)
            setLoaded(true)
          }
          return
        }

        // Try fetching from API
        const products = await cachedFetch<Array<{ id: string }>>('/api/products')
        const count = Array.isArray(products) ? products.length : 0

        const computed: EcoData = {
          co2Saved: Math.round((count * 0.8 + FALLBACK_ECO_DATA.co2Saved) * 10) / 10,
          treesEquivalent: Math.max(1, Math.floor(count * 0.25)),
          bottlesSaved: Math.max(2, Math.floor(count * 0.6)),
          kmAvoided: Math.max(10, count * 3),
          ecoScore: Math.min(100, Math.round(count * 3.5 + 30)),
          weeklyProgress: FALLBACK_ECO_DATA.weeklyProgress,
          achievements: FALLBACK_ECO_DATA.achievements,
        }

        if (!cancelled) {
          setEcoData(computed)
          try { localStorage.setItem('r62-eco-data', JSON.stringify(computed)) } catch { /* ignore */ }
          setLoaded(true)
        }
      } catch {
        // Fallback already set as initial state
        if (!cancelled) setLoaded(true)
      }
    }

    loadEcoData()

    return () => { cancelled = true }
  }, [])

  // ── Animated counter ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return
    let current = 0
    const target = ecoData.ecoScore
    const step = Math.max(1, Math.ceil(target / 40))
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      setDisplayScore(current)
    }, 25)
    return () => clearInterval(timer)
  }, [loaded, ecoData.ecoScore])

  // ── Stats builder ─────────────────────────────────────────────────────────
  const stats: EcoStat[] = [
    { icon: '☁️', label: 'CO₂ economizado', value: ecoData.co2Saved, unit: 'kg', color: 'text-emerald-600 dark:text-emerald-400' },
    { icon: '🌳', label: 'Árvores equiv.', value: ecoData.treesEquivalent, unit: 'árvores', color: 'text-green-600 dark:text-green-400' },
    { icon: '🍶', label: 'Garrafas evitadas', value: ecoData.bottlesSaved, unit: 'garrafas', color: 'text-teal-600 dark:text-teal-400' },
    { icon: '🚶', label: 'Km locais evitados', value: ecoData.kmAvoided, unit: 'km', color: 'text-lime-600 dark:text-lime-400' },
  ]

  // ── Share handler ────────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    const text = `🌱 Meu impacto ecológico no DomPlace:\n• ${ecoData.co2Saved} kg de CO₂ economizado\n• ${ecoData.treesEquivalent} árvores equivalentes\n• ${ecoData.bottlesSaved} garrafas de plástico evitadas\n• ${ecoData.kmAvoided} km locais economizados\n• Pontuação ecológica: ${ecoData.ecoScore}/100\n\nCompre local, impacte global! 🌎`

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }, [ecoData])

  // ── Score ring offset ───────────────────────────────────────────────────
  const scoreOffset = SCORE_CIRCUMFERENCE - (displayScore / 100) * SCORE_CIRCUMFERENCE

  // ── Week labels ───────────────────────────────────────────────────────────
  const weekLabels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']

  return (
    <section className={`px-3 sm:px-4 py-6 ${className ?? ''} r62-card-lift`} aria-label="Impacto ecológico">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Section Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={SPRING_MOTION}
          className="flex items-center gap-2"
        >
          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground r62-heading-gradient">Impacto Ecológico</h2>
            <p className="text-xs text-muted-foreground">Suas ações verdes no DomPlace</p>
          </div>
        </motion.div>

        {/* ── Eco Score Card ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={loaded ? { opacity: 1, scale: 1 } : {}}
          transition={SPRING_BOUNCE}
          className="r62-eco-card rounded-2xl p-6 flex flex-col items-center gap-3"
        >
          <div className="relative w-36 h-36 sm:w-40 sm:h-40">
            {/* Background track */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={SCORE_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              {/* Animated score ring */}
              <motion.circle
                cx="64"
                cy="64"
                r={SCORE_RADIUS}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className="r62-eco-score-ring"
                strokeDasharray={SCORE_CIRCUMFERENCE}
                initial={{ strokeDashoffset: SCORE_CIRCUMFERENCE }}
                animate={{ strokeDashoffset: scoreOffset }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
              />
            </svg>
            {/* Score number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={displayScore}
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="text-4xl sm:text-5xl font-extrabold text-emerald-600 dark:text-emerald-400"
              >
                {displayScore}
              </motion.span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                de 100
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {displayScore >= 80
              ? 'Excelente! Você é um defensor do planeta! 🌍'
              : displayScore >= 50
                ? 'Bom progresso! Continue assim! 💪'
                : 'Comece suas compras sustentáveis hoje! 🌱'}
          </p>
        </motion.div>

        {/* ── Impact Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={loaded ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ ...SPRING_MOTION, delay: i * 0.1 }}
              className="r62-eco-card rounded-xl p-3 sm:p-4 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span className="text-2xl sm:text-3xl" role="img" aria-hidden="true">{stat.icon}</span>
              <span className={`text-xl sm:text-2xl font-extrabold ${stat.color}`}>
                {stat.value}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium text-center leading-tight">
                {stat.label}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground/70">{stat.unit}</span>
            </motion.div>
          ))}
        </div>

        {/* ── Achievement Badges ────────────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" />
            Conquistas Ecológicas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
            {ecoData.achievements.map((achievement, i) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={loaded ? { opacity: 1, scale: 1 } : {}}
                transition={{ ...SPRING_BOUNCE, delay: 0.15 + i * 0.08 }}
                whileTap={{ scale: 0.92 }}
                className={`relative flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl min-h-[44px] transition-colors ${
                  achievement.unlocked
                    ? 'r62-eco-badge-unlocked'
                    : 'r62-eco-badge-locked'
                }`}
                role="button"
                aria-label={`${achievement.name}: ${achievement.unlocked ? 'Desbloqueada' : 'Bloqueada'}`}
              >
                <span className="text-xl sm:text-2xl" role="img" aria-hidden="true">{achievement.icon}</span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-center leading-tight line-clamp-1">
                  {achievement.name}
                </span>
                {!achievement.unlocked && (
                  <Lock className="absolute top-1 right-1 h-2.5 w-2.5 text-muted-foreground/40" />
                )}
                {achievement.unlocked && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0)', '0 0 12px 2px rgba(16,185,129,0.25)', '0 0 0 0 rgba(16,185,129,0)'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Weekly Eco Tips ────────────────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Leaf className="h-4 w-4 text-emerald-500" />
            Dicas Verdes da Semana
          </h3>
          <div className="space-y-2">
            {ECO_TIPS.map((tip, i) => {
              const isOpen = expandedTip === tip.id
              return (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={loaded ? { opacity: 1, x: 0 } : {}}
                  transition={{ ...SPRING_GENTLE, delay: 0.3 + i * 0.08 }}
                  className="r62-eco-card rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedTip(isOpen ? null : tip.id)}
                    className="w-full flex items-center gap-3 p-3 sm:p-4 min-h-[44px] active:scale-[0.98] transition-transform"
                    aria-expanded={isOpen}
                    aria-controls={`eco-tip-${tip.id}`}
                  >
                    <span className="text-xl shrink-0" role="img" aria-hidden="true">{tip.icon}</span>
                    <span className="text-sm font-semibold text-foreground flex-1 text-left">{tip.title}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`eco-tip-${tip.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                        className="overflow-hidden"
                      >
                        <div className="r62-eco-tip-expand px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {tip.content}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Monthly Progress Bar ───────────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Progresso Mensal</h3>
          <div className="r62-eco-card rounded-xl p-4 space-y-3">
            <div className="space-y-2.5">
              {ecoData.weeklyProgress.map((value, i) => (
                <div key={weekLabels[i]} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                      {weekLabels[i]}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {value}%
                    </span>
                  </div>
                  <div className="h-2.5 sm:h-3 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={loaded ? { width: `${value}%` } : { width: 0 }}
                      transition={{ ...SPRING_MOTION, delay: 0.5 + i * 0.12 }}
                      className="r62-eco-progress-fill h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Share Button ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ ...SPRING_MOTION, delay: 0.7 }}
          className="flex justify-center"
        >
          <button
            type="button"
            onClick={handleShare}
            className="r62-eco-share-btn flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold active:scale-95 transition-transform"
            aria-label={copied ? 'Impacto copiado!' : 'Compartilhar impacto ecológico'}
          >
            <Share2 className="h-4 w-4" />
            {copied ? 'Copiado! ✅' : 'Compartilhar impacto'}
          </button>
        </motion.div>

      </div>
    </section>
  )
}
