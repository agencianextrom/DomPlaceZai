'use client'

import { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } from 'react'
const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Truck,
  Percent,
  Split,
  Clock,
  Copy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  UserPlus,
  ShoppingCart,
  QrCode,
  MessageCircle,
  Sparkles,
  X,
  AlertCircle,
  Loader2,
  Store,
  Hash,
  DollarSign,
  PartyPopper,
  ArrowRight,
  Link2,
} from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'
import { useToast } from '@/hooks/use-toast'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type SplitType = 'igual' | 'por_item' | 'porcentual'
type CategoryType = 'Food' | 'Drinks' | 'Market' | 'Pets' | 'Beauty' | 'Tech'

interface GroupMember {
  id: string
  name: string
  emoji: string
  items: string[]
  shareAmount: number
  isCurrentUser: boolean
}

interface GroupOrder {
  id: string
  name: string
  storeName: string
  storeId: string
  category: CategoryType
  members: GroupMember[]
  maxMembers: number
  estimatedTotal: number
  perPersonSplit: number
  minOrderValue: number
  splitType: SplitType
  deadline: string // ISO date string
  createdAt: string
  creatorName: string
  creatorEmoji: string
}

interface StoreOption {
  id: string
  name: string
  category: string
}

interface GroupState {
  groups: GroupOrder[]
  joinedGroups: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'domplace-group-orders'

const CATEGORY_CONFIG: Record<CategoryType, { label: string; color: string; bg: string; border: string }> = {
  Food: { label: 'Food', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
  Drinks: { label: 'Drinks', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  Market: { label: 'Market', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  Pets: { label: 'Pets', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  Beauty: { label: 'Beauty', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/15', border: 'border-pink-500/30' },
  Tech: { label: 'Tech', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30' },
}

const SPLIT_LABELS: Record<SplitType, string> = {
  igual: 'Igual',
  por_item: 'Por item',
  porcentual: 'Porcentual',
}

const AVATAR_EMOJIS = ['😎', '🧑‍🍳', '🎸', '🦊', '🐱', '🌟', '🍕', '🍔', '🥤', '🍄', '🌮', '🧁']

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

function getDefaultGroups(): GroupOrder[] {
  const now = Date.now()
  return [
    {
      id: 'grp-1',
      name: 'Churrasco do Sábado',
      storeName: 'Açougue do Seu João',
      storeId: 'store-1',
      category: 'Food',
      members: [
        { id: 'm1', name: 'Carlos', emoji: '😎', items: ['Picanha 2kg', 'Linguiça'], shareAmount: 87.5, isCurrentUser: false },
        { id: 'm2', name: 'Ana', emoji: '🧑‍🍳', items: ['Charque', 'Farofa'], shareAmount: 62.5, isCurrentUser: false },
        { id: 'm3', name: 'Você', emoji: '🌟', items: ['Refrigerantes', 'Gelo'], shareAmount: 50.0, isCurrentUser: true },
      ],
      maxMembers: 8,
      estimatedTotal: 350.0,
      perPersonSplit: 50.0,
      minOrderValue: 200.0,
      splitType: 'igual',
      deadline: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      creatorName: 'Carlos',
      creatorEmoji: '😎',
    },
    {
      id: 'grp-2',
      name: 'Cervejada da Turma',
      storeName: 'Empório Bebidas Premium',
      storeId: 'store-2',
      category: 'Drinks',
      members: [
        { id: 'm4', name: 'Rafael', emoji: '🎸', items: ['IPA Craft 6-pack', 'Weiss'], shareAmount: 95.0, isCurrentUser: false },
        { id: 'm5', name: 'Juliana', emoji: '🦊', items: ['Espumante'], shareAmount: 70.0, isCurrentUser: false },
        { id: 'm6', name: 'Você', emoji: '🌟', items: ['Pale Ale 12-pack'], shareAmount: 85.0, isCurrentUser: true },
        { id: 'm7', name: 'Marcos', emoji: '🍕', items: ['Lager', 'Ice'], shareAmount: 60.0, isCurrentUser: false },
        { id: 'm8', name: 'Lúcia', emoji: '🐱', items: ['Suco Natural'], shareAmount: 40.0, isCurrentUser: false },
      ],
      maxMembers: 6,
      estimatedTotal: 420.0,
      perPersonSplit: 70.0,
      minOrderValue: 150.0,
      splitType: 'por_item',
      deadline: new Date(now + 12 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      creatorName: 'Rafael',
      creatorEmoji: '🎸',
    },
    {
      id: 'grp-3',
      name: 'Compras do Mês',
      storeName: 'Supermercado Bom Preço',
      storeId: 'store-3',
      category: 'Market',
      members: [
        { id: 'm9', name: 'Fernanda', emoji: '🍄', items: ['Arroz 5kg', 'Feijão'], shareAmount: 55.0, isCurrentUser: false },
        { id: 'm10', name: 'Você', emoji: '🌟', items: ['Azeite', 'Papel Toalha'], shareAmount: 45.0, isCurrentUser: true },
        { id: 'm11', name: 'Pedro', emoji: '🌮', items: ['Macarrão', 'Molho'], shareAmount: 30.0, isCurrentUser: false },
      ],
      maxMembers: 10,
      estimatedTotal: 180.0,
      perPersonSplit: 45.0,
      minOrderValue: 100.0,
      splitType: 'porcentual',
      deadline: new Date(now + 26 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
      creatorName: 'Fernanda',
      creatorEmoji: '🍄',
    },
  ]
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function loadGroupState(): GroupState {
  if (typeof window === 'undefined') {
    return { groups: getDefaultGroups(), joinedGroups: ['grp-1', 'grp-2', 'grp-3'] }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return { groups: getDefaultGroups(), joinedGroups: ['grp-1', 'grp-2', 'grp-3'] }
}

function saveGroupState(state: GroupState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENCY FORMATTER
// ═══════════════════════════════════════════════════════════════════════════════

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTDOWN HELPER
// ═══════════════════════════════════════════════════════════════════════════════

function getCountdown(deadline: string): { hours: number; minutes: number; seconds: number; label: string } {
  const diff = Math.max(0, new Date(deadline).getTime() - Date.now())
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  let label = ''
  if (hours > 0) label = `${hours}h ${minutes}m`
  else if (minutes > 0) label = `${minutes}m ${seconds}s`
  else label = `${seconds}s`

  return { hours, minutes, seconds, label }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: -16,
    transition: { duration: 0.2 },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
}

const shimmerVariants = {
  initial: { backgroundPosition: '-200% center' },
  animate: {
    backgroundPosition: '200% center',
    transition: { duration: 3, repeat: Infinity, ease: 'linear' as const },
  },
}

const headerIconVariants = {
  animate: {
    scale: [1, 1.15, 1],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER AVATAR STACK
// ═══════════════════════════════════════════════════════════════════════════════

function MemberAvatarStack({ members, maxVisible = 4 }: { members: GroupMember[]; maxVisible?: number }) {
  const visible = members.slice(0, maxVisible)
  const remaining = members.length - maxVisible

  return (
    <div className="flex items-center r37-member-stack">
      {visible.map((member, i) => (
        <motion.div
          key={member.id}
          className="r37-member-avatar relative flex items-center justify-center rounded-full border-2 border-background text-sm"
          style={{
            width: 28,
            height: 28,
            marginLeft: i === 0 ? 0 : -8,
            zIndex: visible.length - i,
            boxShadow: '0 0 0 2px rgba(16,185,129,0.3)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: i * 0.05 }}
          whileHover={{ scale: 1.2, zIndex: 50 }}
          title={member.name}
        >
          <span className="text-xs">{member.emoji}</span>
          {member.isCurrentUser && (
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center border border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-[6px] font-black text-white">✓</span>
            </motion.div>
          )}
        </motion.div>
      ))}
      {remaining > 0 && (
        <motion.div
          className="flex items-center justify-center rounded-full border-2 border-background text-[9px] font-bold text-muted-foreground"
          style={{
            width: 28,
            height: 28,
            marginLeft: -8,
            zIndex: 0,
            background: 'rgba(148,163,184,0.15)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
        >
          +{remaining}
        </motion.div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ═══════════════════════════════════════════════════════════════════════════════

function CountdownTimer({ deadline }: { deadline: string }) {
  const [time, setTime] = useState(getCountdown(deadline))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCountdown(deadline))
    }, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  const isUrgent = time.hours < 1

  return (
    <div className={`flex items-center gap-1 text-[10px] font-bold ${isUrgent ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>
      <motion.div animate={isUrgent ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 1, repeat: Infinity }}>
        <Clock className="h-3 w-3" />
      </motion.div>
      <span className="tabular-nums">{time.label}</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY BADGE
// ═══════════════════════════════════════════════════════════════════════════════

function CategoryBadge({ category }: { category: CategoryType }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Food
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPLIT BADGE
// ═══════════════════════════════════════════════════════════════════════════════

function SplitBadge({ splitType }: { splitType: SplitType }) {
  return (
    <motion.span
      className={`r37-split-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400`}
      whileHover={{ scale: 1.05 }}
    >
      <Split className="h-2.5 w-2.5" />
      {SPLIT_LABELS[splitType]}
    </motion.span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BENEFIT CARD
// ═══════════════════════════════════════════════════════════════════════════════

interface BenefitCardProps {
  icon: typeof Truck
  title: string
  description: string
  gradient: string
  glowColor: string
}

function BenefitCard({ icon: Icon, title, description, gradient, glowColor }: BenefitCardProps) {
  return (
    <motion.div
      variants={scaleIn}
      className="r37-benefit-card relative overflow-hidden rounded-xl p-3.5 border border-border/30 bg-background/60"
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 22 }}
    >
      {/* Glow background */}
      <motion.div
        className="absolute -top-6 -right-6 h-16 w-16 rounded-full blur-2xl opacity-30"
        style={{ backgroundColor: glowColor }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center gap-3">
        <motion.div
          className={`h-10 w-10 rounded-xl ${gradient} flex items-center justify-center shrink-0`}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <Icon className="h-5 w-5 text-white" />
        </motion.div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-foreground">{title}</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP DETAIL VIEW (expandable)
// ═══════════════════════════════════════════════════════════════════════════════

function GroupDetailView({ group, onClose }: { group: GroupOrder; onClose: () => void }) {
  const totalSplit = group.members.reduce((s, m) => s + m.shareAmount, 0)

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-3 pt-3 border-t border-border/30">
        {/* Members list */}
        <p className="text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Users className="h-3 w-3" />
          Membros ({group.members.length}/{group.maxMembers})
        </p>
        <div className="space-y-2 mb-3">
          <AnimatePresence>
            {group.members.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 22, delay: i * 0.06 }}
                className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors ${
                  member.isCurrentUser
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-border/20 bg-background/40 hover:bg-secondary/30'
                }`}
              >
                <div
                  className="r37-member-avatar flex items-center justify-center rounded-full border-2 border-background text-sm shrink-0"
                  style={{
                    width: 30,
                    height: 30,
                    boxShadow: member.isCurrentUser ? '0 0 0 2px rgba(16,185,129,0.4)' : '0 0 0 2px rgba(148,163,184,0.2)',
                  }}
                >
                  {member.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold">{member.name}</span>
                    {member.isCurrentUser && (
                      <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-primary text-primary-foreground">
                        Você
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground truncate">{member.items.join(', ')}</p>
                </div>
                <span className="text-[11px] font-bold text-foreground tabular-nums">{formatBRL(member.shareAmount)}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Split summary */}
        <div className="bg-secondary/30 rounded-lg p-2.5 mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground">Total Estimado</span>
            <span className="text-xs font-bold text-foreground">{formatBRL(group.estimatedTotal)}</span>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground">Valor Mínimo</span>
            <span className="text-[10px] font-medium text-muted-foreground">{formatBRL(group.minOrderValue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground">Divisão Atual</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatBRL(totalSplit)}</span>
          </div>
        </div>

        {/* Add items placeholder */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-primary/30 text-[11px] font-semibold text-primary hover:bg-primary/5 transition-colors mb-3"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Adicionar Itens do Catálogo
          <ArrowRight className="h-3 w-3" />
        </motion.button>

        {/* Confirm order */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2"
          style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
        >
          <CheckCircle2 className="h-4 w-4" />
          Confirmar Pedido do Grupo
        </motion.button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVE GROUP CARD
// ═══════════════════════════════════════════════════════════════════════════════

function ActiveGroupCard({
  group,
  isJoined,
  onJoin,
  index,
}: {
  group: GroupOrder
  isJoined: boolean
  onJoin: () => void
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const progressPct = Math.round((group.members.length / group.maxMembers) * 100)

  return (
    <motion.div
      variants={cardVariants}
      className="r37-group-card r37-group-card-hover relative overflow-hidden rounded-xl border border-border/40 bg-background/80"
      whileHover={{ y: -3 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
    >
      {/* Progress bar top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-secondary/40 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 20, delay: index * 0.1 }}
        />
      </div>

      <div className="p-4">
        {/* Top row: group name + badges */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Creator avatar */}
            <motion.div
              className="shrink-0 flex items-center justify-center rounded-full text-lg"
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(20,184,166,0.1))',
                boxShadow: '0 0 0 2px rgba(16,185,129,0.3)',
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            >
              {group.creatorEmoji}
            </motion.div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{group.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Store className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground truncate">{group.storeName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <CategoryBadge category={group.category} />
          </div>
        </div>

        {/* Members + split */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MemberAvatarStack members={group.members} />
            <span className="text-[10px] font-semibold text-muted-foreground">
              {group.members.length}/{group.maxMembers}
            </span>
          </div>
          <SplitBadge splitType={group.splitType} />
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Total estimado</p>
            <p className="text-sm font-bold text-foreground tabular-nums">{formatBRL(group.estimatedTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Por pessoa</p>
            <motion.div
              className="r37-split-glow text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              {formatBRL(group.perPersonSplit)}
            </motion.div>
          </div>
        </div>

        {/* Deadline + actions */}
        <div className="flex items-center justify-between">
          <CountdownTimer deadline={group.deadline} />

          <div className="flex items-center gap-2">
            {/* Expand toggle */}
            {isJoined && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setExpanded((v) => !v)}
                className="min-h-[44px] min-w-[44px] h-7 w-7 rounded-full bg-secondary/80 flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                >
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </motion.div>
              </motion.button>
            )}

            {/* Join / Joined button */}
            {isJoined ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-3 w-3" />
                No Grupo
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onJoin}
                className="r37-join-btn relative overflow-hidden flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold"
                style={{ boxShadow: '0 2px 10px rgba(16,185,129,0.3)' }}
              >
                {/* Shimmer */}
                <motion.div
                  className="r37-join-shimmer absolute inset-0 pointer-events-none"
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    backgroundSize: '200% 100%',
                  }}
                />
                <span className="relative z-10 flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  Entrar no Grupo
                </span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Expandable detail */}
        <AnimatePresence>
          {expanded && isJoined && <GroupDetailView group={group} onClose={() => setExpanded(false)} />}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE GROUP MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function CreateGroupModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (group: GroupOrder) => void
}) {
  const [groupName, setGroupName] = useState('')
  const [selectedStore, setSelectedStore] = useState<StoreOption | null>(null)
  const [maxMembers, setMaxMembers] = useState(6)
  const [minOrderValue, setMinOrderValue] = useState('200')
  const [splitType, setSplitType] = useState<SplitType>('igual')
  const [loading, setLoading] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [stores, setStores] = useState<StoreOption[]>([])
  const { toast } = useToast()

  // Fetch stores on open
  useEffect(() => {
    if (!open) return
    cachedFetch('/api/stores')
      .then((data) => {
        const list = Array.isArray(data) ? data.slice(0, 8) : []
        const mapped = list.map((s: any) => ({ id: s.id || String(Math.random()), name: s.name || s.storeName || 'Loja', category: s.category || 'Market' }))
        setStores(mapped)
      })
      .catch(() => {
        // Fallback stores
        setStores([
          { id: 'fallback-1', name: 'Supermercado Central', category: 'Market' },
          { id: 'fallback-2', name: 'Açougue Bom Corte', category: 'Food' },
          { id: 'fallback-3', name: 'Empório de Bebidas', category: 'Drinks' },
        ])
      })
  }, [open])

  // Reset form on close via handler instead of effect
  const handleClose = useCallback(() => {
    setGroupName('')
    setSelectedStore(null)
    setMaxMembers(6)
    setMinOrderValue('200')
    setSplitType('igual')
    onClose()
  }, [onClose])

  const handleCreate = useCallback(() => {
    if (!groupName.trim()) {
      toast({ title: 'Nome obrigatório', description: 'Dê um nome para o seu grupo.', variant: 'destructive' })
      return
    }
    if (!selectedStore) {
      toast({ title: 'Loja obrigatória', description: 'Selecione uma loja para o pedido.', variant: 'destructive' })
      return
    }

    setLoading(true)
    setTimeout(() => {
      const newGroup: GroupOrder = {
        id: `grp-${Date.now()}`,
        name: groupName.trim(),
        storeName: selectedStore.name,
        storeId: selectedStore.id,
        category: (selectedStore.category as CategoryType) || 'Market',
        members: [
          { id: 'user', name: 'Você', emoji: '🌟', items: [], shareAmount: 0, isCurrentUser: true },
        ],
        maxMembers,
        estimatedTotal: parseFloat(minOrderValue) || 200,
        perPersonSplit: (parseFloat(minOrderValue) || 200) / maxMembers,
        minOrderValue: parseFloat(minOrderValue) || 200,
        splitType,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        creatorName: 'Você',
        creatorEmoji: '🌟',
      }
      onCreate(newGroup)
      setLoading(false)
      toast({ title: 'Grupo criado!', description: `"${groupName}" está pronto para receber membros.` })
    }, 800)
  }, [groupName, selectedStore, maxMembers, minOrderValue, splitType, onCreate, toast])

  const handleCopyLink = useCallback(async () => {
    const link = typeof window !== 'undefined' ? `${window.location.origin}/group/invite/${Date.now()}` : ''
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(link)
      }
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
      toast({ title: 'Link copiado!', description: 'Compartilhe com seus amigos.' })
    } catch {
      toast({ title: 'Erro ao copiar', variant: 'destructive' })
    }
  }, [toast])

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative z-10 w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl border border-border/50 overflow-hidden max-h-[85vh] overflow-y-auto"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Criar Novo Grupo</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="min-h-[44px] min-w-[44px] h-7 w-7 rounded-full bg-secondary/80 flex items-center justify-center"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.button>
          </div>

          <div className="p-4 space-y-4">
            {/* Group name */}
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Nome do Grupo
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex: Churrasco do Sábado"
                className="w-full rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-xs outline-none placeholder:text-muted-foreground/50 focus:border-primary/40 transition-colors"
                maxLength={40}
              />
            </div>

            {/* Store selector */}
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <Store className="h-3 w-3" />
                Loja
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {stores.map((store) => (
                  <motion.button
                    key={store.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStore(store)}
                    className={`px-2.5 py-2 rounded-lg border text-[10px] font-medium text-left transition-all ${
                      selectedStore?.id === store.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/40 bg-background/40 text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    <span className="block truncate">{store.name}</span>
                    <span className="block text-[8px] mt-0.5 opacity-70">{store.category}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Max members slider */}
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <Users className="h-3 w-3" />
                Máximo de Membros: <span className="text-primary font-bold">{maxMembers}</span>
              </label>
              <input
                type="range"
                min={2}
                max={12}
                value={maxMembers}
                onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-full bg-secondary appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
                <span>2</span>
                <span>12</span>
              </div>
            </div>

            {/* Minimum order value */}
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Valor Mínimo do Pedido
              </label>
              <div className="flex items-center gap-1.5 bg-background/60 border border-border/50 rounded-lg px-3 py-2">
                <span className="text-xs font-semibold text-muted-foreground">R$</span>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-bold outline-none tabular-nums"
                  min={50}
                  step={10}
                />
              </div>
            </div>

            {/* Split options */}
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <Split className="h-3 w-3" />
                Tipo de Divisão
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {(['igual', 'por_item', 'porcentual'] as SplitType[]).map((type) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSplitType(type)}
                    className={`px-2 py-2 rounded-lg border text-[10px] font-bold text-center transition-all ${
                      splitType === type
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/40 bg-background/40 text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    {SPLIT_LABELS[type]}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Invite methods */}
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                Convidar Amigos
              </label>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border/40 bg-background/40 text-[10px] font-semibold text-muted-foreground hover:border-primary/30 transition-colors"
                >
                  <AnimatePresence mode="wait">
                    {linkCopied ? (
                      <motion.span key="copied" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
                      </motion.span>
                    ) : (
                      <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
                        <Copy className="h-3 w-3" />
                        Copiar Link
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border/40 bg-background/40 text-[10px] font-semibold text-muted-foreground hover:border-primary/30 transition-colors"
                >
                  <MessageCircle className="h-3 w-3 text-emerald-500" />
                  WhatsApp
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border/40 bg-background/40 text-[10px] font-semibold text-muted-foreground hover:border-primary/30 transition-colors"
                >
                  <QrCode className="h-3 w-3" />
                  QR Code
                </motion.button>
              </div>
            </div>

            {/* Create button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ boxShadow: '0 6px 20px rgba(16,185,129,0.35)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <PartyPopper className="h-4 w-4" />
                  Criar Grupo
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="text-center py-8 px-4"
    >
      <motion.div
        className="text-5xl mb-3"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        🛒
      </motion.div>
      <h3 className="text-sm font-bold text-foreground mb-1">Nenhum grupo ativo</h3>
      <p className="text-[11px] text-muted-foreground mb-4 max-w-xs mx-auto">
        Reúna seus amigos e economize pedindo juntos. Crie ou entre em um grupo!
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold"
        style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
      >
        <Plus className="h-4 w-4" />
        Criar Primeiro Grupo
      </motion.button>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function GroupOrderCreator() {
  const [groupState, setGroupState] = useState<GroupState>(loadGroupState)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const mounted = useHydrated()
  const { toast } = useToast()

  // Persist state
  useEffect(() => {
    if (mounted) {
      saveGroupState(groupState)
    }
  }, [mounted, groupState])

  // Join a group
  const handleJoinGroup = useCallback((groupId: string) => {
    setGroupState((prev) => {
      if (prev.joinedGroups.includes(groupId)) return prev
      const newJoined = [...prev.joinedGroups, groupId]
      return { ...prev, joinedGroups: newJoined }
    })
    toast({ title: 'Você entrou no grupo!', description: 'Divirta-se pedindo com seus amigos.' })
  }, [toast])

  // Create a new group
  const handleCreateGroup = useCallback((newGroup: GroupOrder) => {
    setGroupState((prev) => ({
      groups: [newGroup, ...prev.groups],
      joinedGroups: [...prev.joinedGroups, newGroup.id],
    }))
    setShowCreateModal(false)
  }, [])

  // Active groups count
  const activeGroupCount = useMemo(() => groupState.groups.length, [groupState.groups])

  // Benefits cards data
  const benefits = useMemo(
    () => [
      {
        icon: Truck,
        title: 'Frete Grátis',
        description: 'Entrega grátis em pedidos feitos em grupo acima do valor mínimo.',
        gradient: 'bg-gradient-to-br from-emerald-500 to-teal-500',
        glowColor: 'rgba(16,185,129,0.4)',
      },
      {
        icon: Percent,
        title: 'Desconto Coletivo',
        description: 'Economize até 30% ao comprar em grupo com seus amigos.',
        gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
        glowColor: 'rgba(245,158,11,0.4)',
      },
      {
        icon: Split,
        title: 'Divida o Pedido',
        description: 'Divida o valor facilmente: igual, por item ou porcentual.',
        gradient: 'bg-gradient-to-br from-violet-500 to-purple-500',
        glowColor: 'rgba(139,92,246,0.4)',
      },
    ],
    [],
  )

  if (!mounted) {
    return (
      <div className="r37-group-card">
        <div className="rounded-2xl p-6 glassmorphism-strong animate-pulse">
          <div className="h-6 w-48 bg-muted rounded mb-4" />
          <div className="h-32 bg-muted rounded-xl mb-3" />
          <div className="h-32 bg-muted rounded-xl mb-3" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="r37-group-card">
      <div className="rounded-2xl overflow-hidden glassmorphism-strong relative r62-card-lift">
        {/* Background mesh */}
        <div className="absolute inset-0 gradient-mesh-2 opacity-20 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10">
          {/* ═══ HEADER ═══ */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-2.5">
              <motion.div
                className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
                style={{ boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                variants={headerIconVariants}
                animate="animate"
              >
                <Users className="h-4.5 w-4.5 text-white" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground r62-heading-gradient">Pedidos em Grupo</h3>
                  <motion.span
                    className="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                  >
                    {activeGroupCount} ativo{activeGroupCount !== 1 ? 's' : ''}
                  </motion.span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Economize até 30% pedindo junto
                </p>
              </div>
            </div>

            {/* Create button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Criar
            </motion.button>
          </div>

          {/* ═══ BENEFITS CARDS ═══ */}
          <div className="px-4 pb-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {benefits.map((benefit) => (
                <BenefitCard key={benefit.title} {...benefit} />
              ))}
            </div>
          </div>

          {/* ═══ ACTIVE GROUPS ═══ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-4 pb-3 space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {groupState.groups.length > 0 ? (
                groupState.groups.map((group, i) => (
                  <ActiveGroupCard
                    key={group.id}
                    group={group}
                    isJoined={groupState.joinedGroups.includes(group.id)}
                    onJoin={() => handleJoinGroup(group.id)}
                    index={i}
                  />
                ))
              ) : (
                <EmptyState onCreate={() => setShowCreateModal(true)} />
              )}
            </AnimatePresence>
          </motion.div>

          {/* ═══ BOTTOM CTA ═══ */}
          {groupState.groups.length > 0 && (
            <div className="px-4 py-3 border-t border-border/30">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 text-xs font-bold text-primary flex items-center justify-center gap-2 hover:from-primary/20 hover:to-emerald-500/20 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Criar Novo Pedido em Grupo
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ CREATE GROUP MODAL ═══ */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateGroupModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateGroup}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default GroupOrderCreator
