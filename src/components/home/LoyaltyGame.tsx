'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gamepad2, Trophy, Flame, Star, Lock, Unlock, Gift, ArrowRight,
  Crown, Medal, CheckCircle2, Circle, Target, Users, Zap,
  ShoppingCart, Heart, Leaf, Sparkles, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

// ─── Data ────────────────────────────────────────────────────────
const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const challenges = [
  { id: 'c1', title: 'Compre em 3 lojas diferentes', current: 2, target: 3, xp: 150, badge: null },
  { id: 'c2', title: 'Deixe 5 avaliações este mês', current: 3, target: 5, xp: 200, badge: null },
  { id: 'c3', title: 'Gaste R$500 em frutas e verduras', current: 340, target: 500, xp: 300, badge: 'Verde Consciente', isCurrency: true },
  { id: 'c4', title: 'Indique 2 amigos', current: 0, target: 2, xp: 500, badge: null },
  { id: 'c5', title: 'Complete seu perfil 100%', current: 80, target: 100, xp: 100, badge: null, isPercent: true },
]

const badges = [
  { emoji: '🛒', name: 'Primeira Compra', earned: true },
  { emoji: '⭐', name: 'Avaliador', earned: true },
  { emoji: '🔥', name: 'Sequência 7', earned: true },
  { emoji: '🏆', name: 'Comprador Mensal', earned: true },
  { emoji: '💎', name: 'Diamante', earned: false },
  { emoji: '🎯', name: 'Desafio Master', earned: false },
  { emoji: '👥', name: 'Influenciador', earned: false },
  { emoji: '🌿', name: 'Eco Warrior', earned: false },
]

const leaderboard = [
  { name: 'Maria Santos', points: 4250, avatar: '👩‍🦰' },
  { name: 'João Silva', points: 3890, avatar: '👨‍💼' },
  { name: 'Ana Oliveira', points: 3420, avatar: '👩‍🎤' },
  { name: 'Carlos Lima', points: 2980, avatar: '👨‍🎓' },
  { name: 'Você', points: 2450, avatar: '🧑', isUser: true },
]

const rewards = [
  { name: 'Frete grátis', cost: 500, icon: <ShoppingCart className="h-4 w-4" /> },
  { name: '10% desconto', cost: 1000, icon: <Star className="h-4 w-4" /> },
  { name: 'Entrega prioritária', cost: 2000, icon: <Zap className="h-4 w-4" /> },
]

const xpBreakdown = [
  { label: 'por compra', amount: 10 },
  { label: 'por avaliação', amount: 25 },
  { label: 'por indicação', amount: 50 },
  { label: 'por desafio', amount: 100 },
]

function getLevelBadge(level: number): string {
  if (level >= 10) return '👑'
  if (level >= 7) return '💎'
  if (level >= 4) return '🌟'
  return '🛒'
}

export function LoyaltyGame() {
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(5)
  const [checkedToday, setCheckedToday] = useState(false)
  const [checkedDays, setCheckedDays] = useState<number[]>([0, 1, 2, 3, 4])
  const [userPoints] = useState(2450)
  const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const level = 7
  const currentXP = 2450
  const nextLevelXP = 3000
  const xpProgress = (currentXP / nextLevelXP) * 100

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])
  const handleCheckIn = () => {
    if (checkedToday) return
    setCheckedToday(true)
    setCheckedDays(prev => [...prev, currentDayIndex])
    setStreak(prev => prev + 1)
    toast.success('Check-in realizado! +20 XP')
  }
  const handleRedeem = (name: string) => {
    toast.success(`Recompensa "${name}" resgatada com sucesso! 🎉`)
  }
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden space-y-4 p-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative z-10 flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)' }}
            >
              <Gamepad2 className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-lg font-extrabold text-white r62-heading-gradient">
                Desafios e Recompensas
              </h2>
              <p className="text-xs text-white/60">Complete desafios, ganhe XP e suba de nível!</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Level / XP */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="r62-card-lift overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 flex flex-col items-center justify-center shrink-0 shadow-lg"
                style={{ boxShadow: '0 4px 20px rgba(139, 92, 246, 0.45)' }}
              >
                <span className="text-2xl">{getLevelBadge(level)}</span>
                <span className="text-[8px] font-bold text-white/80 leading-none mt-0.5">NV {level}</span>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">
                  Nível {level} — Comprador Expert
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {currentXP.toLocaleString('pt-BR')} / {nextLevelXP.toLocaleString('pt-BR')} XP
                </p>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 r83-loyalty-xp-bar"
                    initial={{ width: '0%' }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    animate={{ x: ['-100%', '300%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                    style={{ width: '40%' }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {xpBreakdown.map(item => (
                <Badge key={item.label} variant="secondary" className="text-[10px] gap-1 r83-loyalty-xp-tag">
                  <Sparkles className="h-2.5 w-2.5 text-violet-500" />
                  +{item.amount} {item.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Check-In */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="r62-card-lift overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 r62-heading-gradient">
              <Flame className="h-4 w-4 text-orange-500" />
              Check-in Diário
              <Badge variant="secondary" className="text-[10px] gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-0 ml-auto">
                🔥 Sequência: {streak} dias
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {dayNames.map((day, idx) => {
                const isChecked = checkedDays.includes(idx)
                const isToday = idx === currentDayIndex
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <motion.div
                      animate={isToday && !checkedToday
                        ? { boxShadow: ['0 0 0 0 rgba(139,92,246,0.3)', '0 0 0 6px rgba(139,92,246,0)', '0 0 0 0 rgba(139,92,246,0.3)'] }
                        : {}
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isChecked
                          ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md'
                          : isToday
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 ring-2 ring-violet-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isChecked ? '✅' : day[0]}
                    </motion.div>
                    <span className="text-[9px] text-muted-foreground font-medium">{day}</span>
                  </div>
                )
              })}
            </div>
            <motion.div whileTap={checkedToday ? {} : { scale: 0.95 }}>
              <Button
                className="w-full min-h-[44px] bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl"
                onClick={handleCheckIn}
                disabled={checkedToday}
              >
                {checkedToday ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Check-in feito hoje!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Check-in
                    <Badge className="bg-white/20 text-white border-0 text-[10px]">+20 XP</Badge>
                  </span>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="r62-card-lift overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 r62-heading-gradient">
              <Target className="h-4 w-4 text-violet-500" />
              Desafios Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {challenges.map((ch, idx) => {
              const pct = Math.min((ch.current / ch.target) * 100, 100)
              const done = pct >= 100
              return (
                <motion.div
                  key={ch.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.06 }}
                  className="r83-loyalty-challenge-card rounded-xl border border-border p-3.5 bg-card"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${done ? 'text-emerald-600 dark:text-emerald-400 line-through' : ''}`}>
                        {ch.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {ch.isCurrency
                            ? `R$${ch.current.toLocaleString('pt-BR')} / R$${ch.target.toLocaleString('pt-BR')}`
                            : ch.isPercent
                            ? `${ch.current}% / ${ch.target}%`
                            : `${ch.current} / ${ch.target}`}
                        </span>
                        {ch.badge && (
                          <Badge className="text-[8px] gap-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
                            <Leaf className="h-2.5 w-2.5" />
                            {ch.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className="text-[9px] gap-0.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0 shrink-0">
                      <Sparkles className="h-2.5 w-2.5" />+{ch.xp} XP
                    </Badge>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <motion.div
                      className={`absolute inset-y-0 left-0 rounded-full r83-loyalty-challenge-bar ${done ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-purple-500 to-violet-500'}`}
                      initial={{ width: '0%' }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + idx * 0.08 }}
                    />
                  </div>
                  {!done && (
                    <motion.div whileTap={{ scale: 0.95 }} className="flex justify-end">
                      <Button variant="outline" size="sm" className="min-h-[44px] h-8 text-[10px] gap-1 rounded-lg">
                        <ArrowRight className="h-3 w-3" />
                        Ver detalhes
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>
      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="r62-card-lift overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 r62-heading-gradient">
              <Medal className="h-4 w-4 text-amber-500" />
              Conquistas
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {badges.filter(b => b.earned).length}/{badges.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {badges.map((b, idx) => (
                <motion.div
                  key={b.name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + idx * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                  className={`r83-loyalty-badge relative rounded-xl border p-3 text-center ${
                    b.earned
                      ? 'border-violet-300 dark:border-violet-700/50 bg-violet-50 dark:bg-violet-900/20 shadow-md'
                      : 'border-muted bg-muted/30 grayscale'
                  }`}
                  style={b.earned ? { boxShadow: '0 0 12px rgba(139, 92, 246, 0.2)' } : {}}
                >
                  <motion.span
                    className="text-2xl block mb-1"
                    animate={b.earned ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                  >
                    {b.emoji}
                  </motion.span>
                  <p className="text-[10px] font-semibold truncate">{b.name}</p>
                  {!b.earned && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/50">
                      <Lock className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="r62-card-lift overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 r62-heading-gradient">
              <Trophy className="h-4 w-4 text-amber-500" />
              Ranking Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-2">
              {leaderboard.map((u, idx) => {
                const medals = ['🥇', '🥈', '🥉']
                const rankDisplay = idx < 3 ? medals[idx] : `${idx + 1}º`
                return (
                  <motion.div
                    key={u.name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.07 }}
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 min-h-[44px] rounded-xl px-3 py-2.5 transition-colors ${
                      u.isUser
                        ? 'bg-violet-100 dark:bg-violet-900/30 border border-violet-300 dark:border-violet-700/40'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-lg w-8 text-center shrink-0">{rankDisplay}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">{u.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${u.isUser ? 'text-violet-700 dark:text-violet-300' : ''}`}>
                        {u.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] gap-0.5 shrink-0">
                      <Crown className="h-2.5 w-2.5 text-amber-500" />
                      {u.points.toLocaleString('pt-BR')}
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
            <motion.div whileTap={{ scale: 0.95 }} className="mt-3">
              <Button variant="outline" className="w-full min-h-[44px] text-xs font-semibold rounded-xl gap-2">
                Ver ranking completo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="r62-card-lift overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 r62-heading-gradient">
              <Gift className="h-4 w-4 text-pink-500" />
              Loja de Recompensas
              <Badge variant="secondary" className="text-[10px] ml-auto gap-1">
                <Users className="h-2.5 w-2.5" />
                {userPoints.toLocaleString('pt-BR')} pts
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-2.5">
              {rewards.map((r, idx) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + idx * 0.06 }}
                  className="r83-loyalty-reward-card flex items-center gap-3 rounded-xl border border-border p-3 bg-card"
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shrink-0">
                    {r.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.cost.toLocaleString('pt-BR')} pontos</p>
                  </div>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      className="min-h-[44px] h-9 text-[10px] font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white gap-1"
                      onClick={() => handleRedeem(r.name)}
                    >
                      Resgatar
                    </Button>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default LoyaltyGame
