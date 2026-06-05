'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Target, Users, Star, Clock, Flame, ChevronRight, Plus,
  Award, TrendingUp, Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { MobileBottomSheet } from '@/components/ui/MobileBottomSheet'

// ─── Animation variants ──────────────────────────────────────────
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 220, damping: 20 } },
}
const cardV = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
}
const pressV = { scale: 1 }
const tapV = { scale: 0.93 }

// ─── Types ────────────────────────────────────────────────────────
interface FamilyChallenge {
  id: string
  name: string
  emoji: string
  description: string
  progress: number
  progressText: string
  xp: number
  deadline: string
  participants: string[]
  category: string
}

interface LeaderboardFamily {
  rank: number
  name: string
  points: number
  trend: string
  isCurrent: boolean
}

interface CompletedChallenge {
  id: string
  name: string
  completedDate: string
  xp: number
  rating: number
}

// ─── Data ─────────────────────────────────────────────────────────
const challenges: FamilyChallenge[] = [
  { id: '1', name: 'Economia Semanal', emoji: '💰', description: 'Economize R$50 nesta semana', progress: 65, progressText: 'R$32,50 / R$50', xp: 250, deadline: 'Termina em 3 dias', participants: ['👨', '👩', '👧', '👦'], category: 'Economia' },
  { id: '2', name: 'Refeição Saudável', emoji: '🥗', description: 'Prepare 3 refeições saudáveis', progress: 33, progressText: '1 / 3', xp: 150, deadline: 'Termina hoje', participants: ['👩', '👧', '👦'], category: 'Saúde' },
  { id: '3', name: 'Compras Locais', emoji: '🏪', description: 'Compre em 5 lojas locais', progress: 40, progressText: '2 / 5', xp: 200, deadline: '5 dias restantes', participants: ['👨', '👩', '👧'], category: 'Comunidade' },
  { id: '4', name: 'Avaliações Úteis', emoji: '⭐', description: 'Escreva 4 avaliações de produtos', progress: 50, progressText: '2 / 4', xp: 120, deadline: 'Termina em 2 dias', participants: ['👨', '👩', '👦', '👧'], category: 'Comunidade' },
  { id: '5', name: 'Zero Desperdício', emoji: '♻️', description: 'Reduza o desperdício em 20%', progress: 80, progressText: '80%', xp: 180, deadline: '3 dias restantes', participants: ['👩', '👦', '👧'], category: 'Sustentabilidade' },
  { id: '6', name: 'Desafio Verde', emoji: '🌿', description: '10 compras ecológicas', progress: 10, progressText: '1 / 10', xp: 250, deadline: '7 dias restantes', participants: ['👨', '👩', '👧', '👦'], category: 'Sustentabilidade' },
]

const leaderboard: LeaderboardFamily[] = [
  { rank: 1, name: 'Família Oliveira', points: 1420, trend: '↑12', isCurrent: false },
  { rank: 2, name: 'Família Silva', points: 1250, trend: '↑12', isCurrent: true },
  { rank: 3, name: 'Família Santos', points: 1180, trend: '↓3', isCurrent: false },
  { rank: 4, name: 'Família Costa', points: 980, trend: '—', isCurrent: false },
  { rank: 5, name: 'Família Pereira', points: 870, trend: '↑5', isCurrent: false },
]

const completedHistory: CompletedChallenge[] = [
  { id: 'h1', name: 'Desafio da Reciclagem', completedDate: '12 Jun 2025', xp: 300, rating: 5 },
  { id: 'h2', name: 'Maratona de Avaliações', completedDate: '8 Jun 2025', xp: 200, rating: 4 },
  { id: 'h3', name: 'Compras Conscientes', completedDate: '1 Jun 2025', xp: 350, rating: 5 },
]

const statsData = [
  { label: 'Desafios Completos', value: '12', icon: Trophy },
  { label: 'XP Total', value: '3.450', icon: Award },
  { label: 'Melhor Semana', value: 'Semana 22', icon: Calendar },
  { label: 'Sequência', value: '🔥 4 semanas', icon: Flame },
]

const categoryColors: Record<string, string> = {
  Economia: 'bg-emerald-100 text-emerald-700',
  Saúde: 'bg-rose-100 text-rose-700',
  Comunidade: 'bg-amber-100 text-amber-700',
  Sustentabilidade: 'bg-teal-100 text-teal-700',
}

// ─── Helpers ───────────────────────────────────────────────────────
function getProgressColor(p: number): string {
  if (p >= 70) return 'bg-green-500'
  if (p >= 30) return 'bg-amber-500'
  return 'bg-red-500'
}

function getProgressGradient(p: number): string {
  if (p >= 70) return 'from-green-400 to-emerald-500'
  if (p >= 30) return 'from-amber-400 to-orange-500'
  return 'from-red-400 to-rose-500'
}

function getMedalEmoji(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return ''
}

// ─── Skeleton ──────────────────────────────────────────────────────
function SkeletonChallenges() {
  return (
    <div className="r87-challenge-skeleton space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/30 bg-background/60 p-4 space-y-3">
          <div className="h-3 w-3/4 rounded bg-muted/40" />
          <div className="h-2 w-full rounded bg-muted/30" />
          <div className="flex gap-2">
            <div className="h-8 flex-1 rounded bg-muted/30" />
            <div className="h-8 w-20 rounded bg-muted/20" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Header ────────────────────────────────────────────────────────
function Header() {
  return (
    <div className="relative overflow-hidden rounded-t-2xl p-5" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c, #dc2626)' }}>
      <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
      <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="relative z-10 flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.2)', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}
        >
          <Trophy className="h-5 w-5 text-white" />
        </motion.div>
        <div>
          <h3 className="text-base font-bold text-white">Desafios em Família</h3>
          <p className="text-xs text-white/70">Complete desafios juntos e ganhe recompensas</p>
        </div>
      </div>
    </div>
  )
}

// ─── Challenge Card ──────────────────────────────────────────────
function ChallengeCard({ challenge, index }: { challenge: FamilyChallenge; index: number }) {
  const { toast } = useToast()
  const colorClass = getProgressGradient(challenge.progress)
  const barColor = getProgressColor(challenge.progress)

  return (
    <motion.div variants={cardV} whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(249,115,22,0.12)' }}>
      <Card className="r87-challenge-card overflow-hidden border-border/60">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2, ease: 'easeInOut' as const }}
              className="text-2xl shrink-0"
            >
              {challenge.emoji}
            </motion.span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold truncate">{challenge.name}</h4>
                <Badge className={`text-[9px] h-5 px-2 font-semibold border-0 shrink-0 ${categoryColors[challenge.category] ?? 'bg-muted text-muted-foreground'}`}>
                  {challenge.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-muted-foreground">{challenge.progressText}</span>
              <span className="text-[11px] font-bold">{challenge.progress}%</span>
            </div>
            <div className="r87-progress-bar h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${challenge.progress}%` }}
                transition={{ duration: 0.8, type: 'spring' as const, stiffness: 200, damping: 20 }}
              />
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {/* XP badge */}
              <Badge variant="secondary" className="text-[10px] h-6 px-2 font-bold gap-1" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white', border: 'none' }}>
                <Award className="h-3 w-3" />
                {challenge.xp} XP
              </Badge>
              {/* Deadline */}
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {challenge.deadline}
              </span>
            </div>
          </div>

          {/* Participants + Action */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
            <div className="flex items-center gap-1">
              {challenge.participants.map((p, i) => (
                <span key={i} className="text-base" title={`Membro ${i + 1}`}>{p}</span>
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">{challenge.participants.length} membros</span>
            </div>
            <motion.div whileTap={tapV}>
              <Button
                size="sm"
                className="min-h-[44px] min-w-[44px] text-xs px-3 rounded-lg gap-1"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white' }}
                onClick={() => toast({ title: `${challenge.name}`, description: 'Contribuição registrada com sucesso!' })}
              >
                <Plus className="h-3.5 w-3.5" />
                Contribuir
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Weekly Leaderboard ───────────────────────────────────────────
function WeeklyLeaderboard() {
  return (
    <motion.div variants={fadeUp}>
      <div className="r87-leaderboard-row">
        <Card className="overflow-hidden border-border/60">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Ranking Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {leaderboard.map((f) => (
                <motion.div
                  key={f.rank}
                  whileHover={{ x: 3, backgroundColor: 'rgba(0,0,0,0.02)' }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${f.isCurrent ? 'border-2 border-orange-400 bg-orange-50/60' : 'border border-border/40 bg-card'}`}
                >
                  <span className="text-lg w-8 text-center shrink-0">
                    {getMedalEmoji(f.rank) || `#${f.rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${f.isCurrent ? 'text-orange-700' : ''}`}>
                      {f.name}
                      {f.isCurrent && <Badge variant="secondary" className="ml-1.5 text-[8px] h-4 px-1 bg-orange-100 text-orange-700 border-0">Você</Badge>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{f.points.toLocaleString('pt-BR')} pts</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold shrink-0">
                    {f.trend.startsWith('↑') && <TrendingUp className="h-3 w-3 text-green-500" />}
                    <span className={f.trend.startsWith('↑') ? 'text-green-600' : f.trend.startsWith('↓') ? 'text-red-500' : 'text-muted-foreground'}>
                      {f.trend}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// ─── Create Form ──────────────────────────────────────────────────
function CreateForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Economia')

  const handleCreate = () => {
    if (!name.trim()) return
    toast({ title: 'Desafio criado com sucesso!', description: `"${name}" foi adicionado para a família.` })
    setName('')
    setDescription('')
    setCategory('Economia')
    onClose()
  }

  return (
    <MobileBottomSheet isOpen={open} onClose={onClose} title="Criar Novo Desafio">
      <div className="p-4 space-y-4">
        <input
          className="w-full h-11 min-h-[44px] px-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Nome do desafio"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full h-11 min-h-[44px] px-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-2">
          <select
            className="flex-1 h-11 min-h-[44px] px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Economia</option>
            <option>Saúde</option>
            <option>Comunidade</option>
            <option>Sustentabilidade</option>
          </select>
          <input
            className="w-24 h-11 min-h-[44px] px-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="XP"
            type="number"
          />
        </div>
        <div className="flex gap-2">
          <motion.div whileTap={tapV} className="flex-1">
            <Button
              className="r87-create-btn min-h-[44px] min-w-[44px] w-full text-xs font-semibold gap-1 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white' }}
              onClick={handleCreate}
            >
              <Plus className="h-3.5 w-3.5" />
              Criar
            </Button>
          </motion.div>
          <motion.div whileTap={tapV}>
            <Button variant="outline" className="min-h-[44px] min-w-[44px] text-xs rounded-lg" onClick={onClose}>
              Cancelar
            </Button>
          </motion.div>
        </div>
      </div>
    </MobileBottomSheet>
  )
}

// ─── Stats Summary ─────────────────────────────────────────────────
function StatsSummary() {
  return (
    <motion.div variants={fadeUp}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsData.map((s) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} variants={cardV} whileHover={{ y: -2, boxShadow: '0 6px 18px rgba(249,115,22,0.1)' }}>
              <Card className="r87-stat-card overflow-hidden border-border/60 text-center py-3 px-2">
                <CardContent className="p-2 flex flex-col items-center gap-1.5">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.1))' }}>
                    <Icon className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-base font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Challenge History ────────────────────────────────────────────
function ChallengeHistory() {
  return (
    <motion.div variants={fadeUp}>
      <Card className="r87-history-card overflow-hidden border-border/60">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            Histórico de Desafios
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {completedHistory.map((h) => (
            <motion.div
              key={h.id}
              variants={cardV}
              whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-card"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold truncate">{h.name}</p>
                  <Badge className="text-[9px] h-5 px-1.5 bg-green-100 text-green-700 border-0 font-semibold">⭐ Concluído</Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {h.completedDate}
                  </span>
                  <Separator orientation="vertical" className="h-3" />
                  <span className="text-[10px] font-semibold text-orange-600">{h.xp} XP</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < h.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export function FamilyChallengeHub() {
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const activeCount = useMemo(() => challenges.length, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <SkeletonChallenges />
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerV}
      className="rounded-2xl border border-border bg-card overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
    >
      <Header />

      <div className="p-4 space-y-5">
        {/* Stats */}
        <StatsSummary />

        <Separator />

        {/* Active Challenges Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-bold">Desafios Ativos</h3>
            <Badge variant="secondary" className="text-[10px] h-5 px-2 font-semibold bg-orange-100 text-orange-700 border-0">
              {activeCount}
            </Badge>
          </div>
          <motion.div whileTap={tapV}>
            <Button
              variant="outline"
              className="r87-create-btn min-h-[44px] min-w-[44px] text-xs px-3 rounded-lg gap-1 font-semibold"
              onClick={() => setShowCreate((p) => !p)}
            >
              <Plus className="h-3.5 w-3.5" />
              Criar Desafio
            </Button>
          </motion.div>
        </div>

        {/* Create Form */}
        {showCreate && <CreateForm open={showCreate} onClose={() => setShowCreate(false)} />}

        {/* Challenge Cards */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(249,115,22,0.2) transparent' }}>
          {challenges.map((c, i) => (
            <ChallengeCard key={c.id} challenge={c} index={i} />
          ))}
        </div>

        <Separator />

        {/* Leaderboard + History side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WeeklyLeaderboard />
          <ChallengeHistory />
        </div>
      </div>
    </motion.div>
  )
}

export default FamilyChallengeHub
