'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, ShoppingCart, Heart, CheckCircle2, MessageCircle, ClipboardList,
  Star, Tag, PartyPopper, Plus, UserPlus, BarChart3, ChevronRight,
  Clock, Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

// ── Types ──────────────────────────────────────────────────────────────────
interface FamilyMember {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  online: boolean
}

interface FeedActivity {
  id: string
  memberId: string
  emoji: string
  action: string
  timestamp: string
  type: 'cart' | 'favorite' | 'purchase' | 'comment' | 'list' | 'review' | 'coupon' | 'milestone'
  extra?: string
  amount?: string
  hasImage?: boolean
}

interface SharedList {
  id: string
  name: string
  members: number
  items: number
  updated: string
}

// ── Constants ───────────────────────────────────────────────────────────────
const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'all', name: 'Todos', role: '', emoji: '👨‍👩‍👧‍👦', color: '#6366f1', online: true },
  { id: 'carlos', name: 'Carlos', role: 'Pai', emoji: '👨', color: '#3b82f6', online: true },
  { id: 'ana', name: 'Ana', role: 'Mãe', emoji: '👩', color: '#ec4899', online: true },
  { id: 'pedro', name: 'Pedro', role: 'Filho', emoji: '👦', color: '#f59e0b', online: false },
  { id: 'maria', name: 'Maria', role: 'Filha', emoji: '👧', color: '#8b5cf6', online: true },
]

const ACTIVITIES: FeedActivity[] = [
  { id: 'a1', memberId: 'carlos', emoji: '🛒', action: 'Carlos adicionou 3 itens ao carrinho', timestamp: '5 min atrás', type: 'cart', hasImage: true },
  { id: 'a2', memberId: 'ana', emoji: '❤️', action: 'Ana favoritou Padaria Doce Pão', timestamp: '15 min atrás', type: 'favorite', hasImage: true },
  { id: 'a3', memberId: 'pedro', emoji: '✅', action: 'Pedro completou a compra #1234', timestamp: '1h atrás', type: 'purchase', amount: 'R$ 89,90' },
  { id: 'a4', memberId: 'maria', emoji: '💬', action: 'Maria comentou na lista "Churrasco de Domingo"', timestamp: '2h atrás', type: 'comment' },
  { id: 'a5', memberId: 'carlos', emoji: '📋', action: 'Carlos criou nova lista "Compras do Mês"', timestamp: '3h atrás', type: 'list' },
  { id: 'a6', memberId: 'ana', emoji: '⭐', action: 'Ana avaliou Supermercado Bom Preço — 5 estrelas', timestamp: '4h atrás', type: 'review', extra: '"Atendimento excelente e preços justos!"' },
  { id: 'a7', memberId: 'pedro', emoji: '🏷️', action: 'Pedro resgatou cupom DOMPLACE10', timestamp: '5h atrás', type: 'coupon' },
  { id: 'a8', memberId: 'all', emoji: '🎉', action: 'Família atingiu 5.000 pontos! Parabéns!', timestamp: '1 dia atrás', type: 'milestone' },
]

const SHARED_LISTS: SharedList[] = [
  { id: 'l1', name: 'Compras da Semana', members: 4, items: 12, updated: 'há 10min' },
  { id: 'l2', name: 'Churrasco de Domingo', members: 3, items: 8, updated: 'há 2h' },
]

const FAMILY_STATS = [
  { label: 'Total compras este mês', value: '23', icon: ShoppingCart },
  { label: 'Valor total', value: 'R$ 2.847,50', icon: Tag },
  { label: 'Economia com cupons', value: 'R$ 127,30', icon: Star },
  { label: 'Itens compartilhados', value: '45', icon: ClipboardList },
]

const QUICK_ACTIONS = [
  { id: 'cart', label: 'Adicionar ao Carrinho', icon: ShoppingCart, toast: 'Item adicionado ao carrinho da família!' },
  { id: 'list', label: 'Criar Lista', icon: ClipboardList, toast: 'Nova lista criada com sucesso!' },
  { id: 'invite', label: 'Convidar Membro', icon: UserPlus, toast: 'Convite enviado para o membro!' },
  { id: 'stats', label: 'Ver Estatísticas', icon: BarChart3, toast: 'Relatório de estatísticas carregado!' },
]

// ── Animation variants ─────────────────────────────────────────────────────
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 220, damping: 20 } },
}

const cardV = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
}

const memberBarV = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

const pressV = { scale: 1 }
const tapV = { scale: 0.93 }

// ── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonFeed() {
  return (
    <div className="r85-family-skeleton space-y-4 animate-pulse">
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-11 h-11 rounded-full bg-muted/60" />
            <div className="h-2 w-10 rounded bg-muted/40" />
          </div>
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/30 bg-background/60 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-muted/50 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-muted/40" />
              <div className="h-3 w-1/2 rounded bg-muted/30" />
            </div>
          </div>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map(i => (
          <div key={i} className="h-20 rounded-xl bg-muted/30" />
        ))}
      </div>
    </div>
  )
}

// ── Header ─────────────────────────────────────────────────────────────────
function Header() {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
      <motion.div
        className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.2), rgba(20,184,166,0.2))',
          boxShadow: '0 0 0 2px rgba(59,130,246,0.25)',
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <Users className="h-5 w-5" style={{ color: '#3b82f6' }} />
      </motion.div>
      <div className="min-w-0">
        <h2
          className="text-lg font-black r62-heading-gradient"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4, #14b8a6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Atividade da Família
        </h2>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Activity className="h-3 w-3" />Eventos compartilhados em tempo real
        </p>
      </div>
    </motion.div>
  )
}

// ── Family Members Bar ─────────────────────────────────────────────────────
function FamilyMembersBar({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <motion.div variants={fadeUp} className="mb-5">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {FAMILY_MEMBERS.map((member) => {
          const isSelected = selected === member.id
          return (
            <motion.button
              key={member.id}
              variants={memberBarV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => onSelect(member.id)}
              className={`r85-family-member flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-h-[44px] shrink-0 border transition-all ${
                isSelected
                  ? 'border-primary/40 bg-primary/10 shadow-sm'
                  : 'border-transparent bg-secondary/30 hover:bg-secondary/60'
              }`}
            >
              <div className="relative">
                <span className="text-2xl leading-none">{member.emoji}</span>
                {member.id !== 'all' && (
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                      member.online ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold leading-tight ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {member.name}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Activity Card ──────────────────────────────────────────────────────────
function ActivityCard({ activity, member }: { activity: FeedActivity; member?: FamilyMember }) {
  const isMilestone = activity.type === 'milestone'
  return (
    <motion.div
      variants={cardV}
      layout
      className={`r85-family-activity relative flex items-start gap-3 rounded-xl border p-3 transition-colors ${
        isMilestone
          ? 'border-amber-400/30 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20'
          : 'border-border/40 bg-background/80 hover:bg-secondary/20'
      }`}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback
            className="text-base"
            style={{ backgroundColor: member?.color ? `${member.color}20` : 'rgba(99,102,241,0.15)' }}
          >
            {member?.emoji || activity.emoji}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -top-1 -right-1 text-sm leading-none">{activity.emoji}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-sm font-medium text-foreground leading-snug">{activity.action}</p>
        {activity.amount && (
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{activity.amount}</p>
        )}
        {activity.extra && (
          <p className="text-xs text-muted-foreground italic leading-relaxed">{activity.extra}</p>
        )}
        {activity.hasImage && (
          <div className="mt-1 h-14 w-14 rounded-lg bg-muted/40 border border-border/20 flex items-center justify-center shrink-0">
            <ShoppingCart className="h-5 w-5 text-muted-foreground/40" />
          </div>
        )}
        {isMilestone && (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold gap-1">
            <PartyPopper className="h-3 w-3" /> Marco alcançado
          </Badge>
        )}
      </div>

      {/* Timestamp */}
      <Badge variant="secondary" className="shrink-0 text-[9px] font-semibold gap-1 min-h-[44px] flex items-center">
        <Clock className="h-2.5 w-2.5" />
        {activity.timestamp}
      </Badge>
    </motion.div>
  )
}

// ── Quick Actions Bar ──────────────────────────────────────────────────────
function QuickActionsBar() {
  const { toast } = useToast()
  return (
    <motion.div variants={fadeUp} className="mb-5">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.id}
              whileHover={pressV}
              whileTap={tapV}
            >
              <Button
                variant="outline"
                size="sm"
                className="r85-family-action gap-2 min-h-[44px] shrink-0 rounded-xl text-xs font-semibold border-border/40"
                onClick={() =>
                  toast({
                    title: action.toast,
                    description: 'Ação registrada na atividade da família.',
                  })
                }
              >
                <Icon className="h-4 w-4 text-primary" />
                {action.label}
              </Button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Family Stats Summary ───────────────────────────────────────────────────
function FamilyStatsSummary() {
  return (
    <motion.div variants={fadeUp} className="mb-5">
      <Card className="r85-family-stats border-border/40 bg-background/80">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            Resumo da Família — Este Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FAMILY_STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  className="flex items-center gap-2.5 rounded-lg bg-secondary/30 p-2.5"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
                >
                  <div
                    className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.15))' }}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground leading-tight truncate">{stat.label}</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">{stat.value}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Shared Lists Preview ───────────────────────────────────────────────────
function SharedListsPreview() {
  const { toast } = useToast()
  return (
    <motion.div variants={fadeUp}>
      <h3 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
        <ClipboardList className="h-3.5 w-3.5 text-primary" />
        Listas Compartilhadas
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SHARED_LISTS.map((list) => (
          <motion.div
            key={list.id}
            className="r85-family-list r62-card-lift rounded-xl border border-border/40 bg-background/80 p-4"
            whileHover={{ y: -3 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{list.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Users className="h-2.5 w-2.5" />{list.members} membros
                  </span>
                  <Separator orientation="vertical" className="h-3" />
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <ClipboardList className="h-2.5 w-2.5" />{list.items} itens
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                atualizado {list.updated}
              </span>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}>
                <Button
                  size="sm"
                  variant="outline"
                  className="r85-family-list-btn min-h-[44px] gap-1 text-[11px] font-semibold rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() =>
                    toast({
                      title: `Abrindo lista "${list.name}"`,
                      description: `${list.members} membros, ${list.items} itens.`,
                    })
                  }
                >
                  Ver lista
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export function FamilyActivityFeed() {
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState('all')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredActivities = useMemo(() => {
    if (selectedMember === 'all') return ACTIVITIES
    return ACTIVITIES.filter((a) => a.memberId === selectedMember)
  }, [selectedMember])

  if (loading) {
    return (
      <section className="r85-family-container">
        <Header />
        <SkeletonFeed />
      </section>
    )
  }

  return (
    <motion.section
      className="r85-family-container space-y-5"
      variants={containerV}
      initial="hidden"
      animate="visible"
    >
      <Header />

      {/* Family Members Bar */}
      <FamilyMembersBar selected={selectedMember} onSelect={setSelectedMember} />

      {/* Quick Actions */}
      <QuickActionsBar />

      {/* Activity Feed */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredActivities.map((activity) => {
            const member = FAMILY_MEMBERS.find((m) => m.id === activity.memberId)
            return (
              <ActivityCard key={activity.id} activity={activity} member={member} />
            )
          })}
        </AnimatePresence>
      </div>

      {/* Separator */}
      <Separator className="opacity-40" />

      {/* Family Stats */}
      <FamilyStatsSummary />

      {/* Shared Lists */}
      <SharedListsPreview />
    </motion.section>
  )
}

export default FamilyActivityFeed
