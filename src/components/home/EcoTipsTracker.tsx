'use client'
/* ─── EcoTipsTracker ─── "Dicas Verdes" ───
   Sustainability tips tracker: daily eco-tips, personal carbon footprint,
   weekly challenges, gamified eco-score, community leaderboard, and
   product eco-comparison. */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Leaf, Flame, TrendingUp, Award, Users, CheckCircle2,
  Lightbulb, Droplets, Recycle, Bike, Sun, ChevronRight,
  Star, Zap, Target, TreePine
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface EcoTip {
  id: string
  title: string
  emoji: string
  category: string
  impact: 'high' | 'medium' | 'low'
  co2Saved: string
  description: string
  completed: boolean
}

interface Challenge {
  id: string
  title: string
  emoji: string
  progress: number
  target: number
  xp: number
  active: boolean
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const ecoTips: EcoTip[] = [
  { id: '1', title: 'Leve sua sacola reutilizável', emoji: '🛍️', category: 'Redução', impact: 'medium', co2Saved: '0.5 kg', description: 'Ao usar sacolas reutilizáveis no mercado, você evita cerca de 500 sacolas plásticas por ano, reduzindo 0.5 kg de CO2 por semana.', completed: false },
  { id: '2', title: 'Desligue aparelhos em standby', emoji: '🔌', category: 'Energia', impact: 'high', co2Saved: '1.2 kg', description: 'Aparelhos em standby consomem até 15% da energia doméstica. Desligar TVs, carregadores e micro-ondas da tomada economiza até R$30/mês.', completed: false },
  { id: '3', title: 'Compre produtos locais', emoji: '🏡', category: 'Transporte', impact: 'high', co2Saved: '2.0 kg', description: 'Produtos locais viajam menos distância, reduzindo emissões de transporte. Comprar na feira em vez do supermercado grande economiza CO2 e apoia o produtor.', completed: true },
  { id: '4', title: 'Reduza consumo de água', emoji: '💧', category: 'Água', impact: 'medium', co2Saved: '0.8 kg', description: 'Fechar a torneira ao escovar os dentes economiza até 12 litros por dia. No mês, isso equivale a 360 litros de água potável poupada.', completed: false },
  { id: '5', title: 'Separe o lixo reciclável', emoji: '♻️', category: 'Reciclagem', impact: 'high', co2Saved: '1.5 kg', description: 'Reciclar 1 kg de papel salva 20 árvores. Separar lixo orgânico, plástico, papel e vidro é o primeiro passo para um descarte consciente.', completed: true },
  { id: '6', title: 'Use transporte alternativo', emoji: '🚲', category: 'Transporte', impact: 'high', co2Saved: '3.0 kg', description: 'Trocar o carro pela bicicleta em descurtos de até 5 km evita 3 kg de CO2 por viagem e ainda melhora sua saúde.', completed: false },
  { id: '7', title: 'Evite desperdício de alimentos', emoji: '🍌', category: 'Alimentação', impact: 'medium', co2Saved: '1.0 kg', description: 'Planejar as refeições e usar sobras criativamente reduz o desperdício em até 30%. 1/3 dos alimentos produzidos no Brasil vai para o lixo.', completed: false },
  { id: '8', title: 'Troque lâmpadas por LED', emoji: '💡', category: 'Energia', impact: 'medium', co2Saved: '0.6 kg', description: 'Lâmpadas LED consomem até 80% menos energia que incandescentes e duram 25x mais. Uma troca simples com grande impacto.', completed: false },
]

const weeklyChallenges: Challenge[] = [
  { id: '1', title: 'Zero plástico na semana', emoji: '🚫', progress: 4, target: 7, xp: 200, active: true },
  { id: '2', title: 'Compras na feira 3x', emoji: '🥬', progress: 1, target: 3, xp: 150, active: true },
  { id: '3', title: 'Caminhar 10km', emoji: '👟', progress: 6, target: 10, xp: 100, active: true },
  { id: '4', title: 'Cozinhar com sobras 5x', emoji: '🍳', progress: 3, target: 5, xp: 120, active: true },
]

const leaderboard = [
  { rank: 1, name: 'Dona Maria', emoji: '👩‍🌾', score: 2840, trend: 'up' as const },
  { rank: 2, name: 'Seu Joaquim', emoji: '👨‍🌾', score: 2560, trend: 'up' as const },
  { rank: 3, name: 'Você', emoji: '😊', score: 2180, trend: 'same' as const, isUser: true },
  { rank: 4, name: 'Dona Francisca', emoji: '👵', score: 1950, trend: 'down' as const },
  { rank: 5, name: 'Sr. Antônio', emoji: '👴', score: 1720, trend: 'down' as const },
]

const categories = ['Todos', 'Redução', 'Energia', 'Transporte', 'Água', 'Reciclagem', 'Alimentação']

const sp = 'spring' as const

// ─── Component ────────────────────────────────────────────────────────────────
export default function EcoTipsTracker() {
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [completedTips, setCompletedTips] = useState<Set<string>>(new Set(['3', '5']))
  const [ecoScore, setEcoScore] = useState(72)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1100)
    return () => clearTimeout(timer)
  }, [])

  const toggleTip = useCallback((id: string) => {
    setCompletedTips(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); setEcoScore(s => s - 5) }
      else { next.add(id); setEcoScore(s => Math.min(100, s + 5)) }
      return next
    })
  }, [])

  const filteredTips = ecoTips.filter(t => activeCategory === 'Todos' || t.category === activeCategory)
  const completedCount = completedTips.size
  const totalCO2 = ecoTips.filter(t => completedTips.has(t.id)).reduce((sum, t) => sum + parseFloat(t.co2Saved), 0).toFixed(1)
  const weeklyXP = weeklyChallenges.reduce((sum, c) => sum + Math.round((c.progress / c.target) * c.xp), 0)

  const scoreColor = ecoScore >= 80 ? '#22c55e' : ecoScore >= 50 ? '#f59e0b' : '#ef4444'
  const scoreGradient = ecoScore >= 80
    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
    : ecoScore >= 50
      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
      : 'linear-gradient(135deg, #ef4444, #dc2626)'

  if (loading) return <LoadingSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: sp, stiffness: 260, damping: 24 }}
    >
      <Card className="overflow-hidden border-border/40 r93-eco-card r102-section-accent">
        {/* ── Header ── */}
        <CardHeader className="pb-3">
          <div
            className="r93-eco-header flex items-center gap-3 px-4 py-4 rounded-xl -mx-6 -mt-6 mb-4"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669, #047857)',
              boxShadow: '0 4px 16px rgba(16,185,129,0.25)'
            }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-white tracking-tight r62-heading-gradient">Dicas Verdes</h2>
              <p className="text-[11px] text-white/70 font-medium">Ações sustentáveis para o dia a dia</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-200" />
              <span className="text-[11px] font-bold text-emerald-100">{completedCount}/{ecoTips.length}</span>
            </div>
          </div>

          {/* ── Eco Score ── */}
          <div className="flex items-center gap-4 mb-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(4,120,87,0.1))' }}>
            <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="3" />
                <motion.circle
                  cx="18" cy="18" r="15.5" fill="none" stroke={scoreColor} strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="97.4" strokeDashoffset="97.4"
                  animate={{ strokeDashoffset: 97.4 - (97.4 * ecoScore / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <span className="absolute text-sm font-black" style={{ color: scoreColor }}>{ecoScore}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold">Eco-Score: {ecoScore >= 80 ? 'Excelente!' : ecoScore >= 50 ? 'Bom!' : 'Precisa melhorar'}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{completedCount} dicas aplicadas · {totalCO2} kg CO2 economizado</p>
              <div className="flex gap-3 mt-1.5">
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <TreePine className="h-3 w-3 text-emerald-500" /> {totalCO2} kg CO2
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Zap className="h-3 w-3 text-amber-500" /> {weeklyXP} XP
                </span>
              </div>
            </div>
          </div>

          {/* ── Category Filters ── */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            {categories.map(cat => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-2 rounded-full text-[11px] font-medium border transition-all min-h-[44px] ${
                  activeCategory === cat
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-border bg-card text-muted-foreground hover:border-emerald-300'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 space-y-4">
          {/* ── Eco Tips ── */}
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5 mb-2.5">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Dicas de Sustentabilidade
            </h3>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredTips.map((tip, i) => (
                  <motion.div
                    key={tip.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: sp, stiffness: 350, damping: 28, delay: i * 0.03 }}
                    className={`r93-tip-card p-3 rounded-xl border transition-all cursor-pointer r62-card-lift r98-eco-tip ${
                      completedTips.has(tip.id)
                        ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/15 dark:border-emerald-800/40'
                        : 'border-border/40 bg-card/60 hover:border-emerald-200/50'
                    }`}
                    onClick={() => toggleTip(tip.id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/50 text-xl shrink-0">
                        {completedTips.has(tip.id) ? '✅' : tip.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className={`text-xs font-bold ${completedTips.has(tip.id) ? 'line-through text-muted-foreground' : ''}`}>{tip.title}</h4>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                            tip.impact === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            tip.impact === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {tip.impact === 'high' ? 'Alto impacto' : tip.impact === 'medium' ? 'Médio' : 'Baixo'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-medium dark:bg-blue-900/20 dark:text-blue-400">
                            {tip.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{tip.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Leaf className="h-3 w-3" />
                            {tip.co2Saved} CO2 economizado
                          </span>
                          {completedTips.has(tip.id) && (
                            <span className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" /> +5 pontos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Weekly Challenges ── */}
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5 mb-2.5">
              <Target className="h-4 w-4 text-violet-500" />
              Desafios da Semana
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {weeklyChallenges.map((challenge, i) => {
                const pct = Math.round((challenge.progress / challenge.target) * 100)
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="r93-challenge-card p-3 rounded-xl border border-border/40 bg-card/60 r62-card-lift"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{challenge.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold truncate">{challenge.title}</h4>
                        <span className="text-[9px] text-muted-foreground">{challenge.progress}/{challenge.target} · {challenge.xp} XP</span>
                      </div>
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* ── Community Leaderboard ── */}
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5 mb-2.5">
              <Users className="h-4 w-4 text-amber-500" />
              Ranking da Comunidade
            </h3>
            <div className="space-y-1.5">
              {leaderboard.map((user, i) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`r93-leaderboard-row flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    user.isUser ? 'bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/40' : 'hover:bg-muted/40'
                  }`}
                >
                  <span className="text-sm w-6 text-center font-bold">
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                  </span>
                  <span className="text-lg">{user.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{user.name}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {user.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                    {user.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                    <span className="text-xs font-bold">{user.score.toLocaleString()}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
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
        <div className="h-24 rounded-xl bg-muted/40 animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-9 w-14 rounded-full bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map(i => (
            <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    </Card>
  )
}
