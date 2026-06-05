'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, ShoppingCart, Plus, Check, Copy, Link2, Sparkles, Pencil,
  Trash2, Share2, TrendingDown, MessageCircle, Clock, UserPlus,
  ArrowRight, PackageOpen, PiggyBank, Split, CircleDot, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { useToast } from '@/hooks/use-toast'

// ── Types ──────────────────────────────────────────────────────────────────
interface Member {
  id: string; name: string; initials: string; color: string; online: boolean
}
interface CartItem {
  id: string; name: string; assignee: string; quantity: number; price: number; grabbed: boolean
}
interface ShoppingGroup {
  id: string; name: string; members: Member[]; items: CartItem[]
  total: number; color: string; progress: number
}
interface ActivityEntry {
  id: string; message: string; timestamp: string; avatar: string
}
interface CollaborativeState {
  groups: ShoppingGroup[]; activities: ActivityEntry[]; savings: number
}

// ── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'domplace-collaborative-shopping'
const COLORS = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#ec4899']
const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const timeAgo = (iso: string): string => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 60) return 'agora mesmo'
  if (d < 3600) return `${Math.floor(d / 60)}min atrás`
  if (d < 86400) return `${Math.floor(d / 3600)}h atrás`
  return `${Math.floor(d / 86400)}d atrás`
}

// ── Default Data ────────────────────────────────────────────────────────────
function defaultState(): CollaborativeState {
  const now = new Date().toISOString()
  return {
    savings: 34,
    groups: [
      {
        id: 'g1', name: 'Churrasco do Sábado', color: '#10b981', progress: 65, total: 287,
        members: [
          { id: 'm1', name: 'Carlos', initials: 'CA', color: '#ef4444', online: true },
          { id: 'm2', name: 'Ana', initials: 'AN', color: '#3b82f6', online: true },
          { id: 'm3', name: 'João', initials: 'JO', color: '#f59e0b', online: false },
          { id: 'm4', name: 'Maria', initials: 'MA', color: '#8b5cf6', online: true },
        ],
        items: [
          { id: 'i1', name: 'Picanha 2kg', assignee: 'Carlos', quantity: 1, price: 89.9, grabbed: true },
          { id: 'i2', name: 'Linguiça 1kg', assignee: 'Ana', quantity: 2, price: 32.5, grabbed: true },
          { id: 'i3', name: 'Refrigerantes', assignee: 'João', quantity: 6, price: 48.0, grabbed: false },
          { id: 'i4', name: 'Carvão', assignee: 'Maria', quantity: 3, price: 27.0, grabbed: true },
          { id: 'i5', name: 'Pão de Alho', assignee: 'Carlos', quantity: 20, price: 35.0, grabbed: false },
          { id: 'i6', name: 'Farofa', assignee: 'Ana', quantity: 1, price: 12.9, grabbed: false },
          { id: 'i7', name: 'Queijo Coalho', assignee: 'Maria', quantity: 2, price: 24.0, grabbed: true },
          { id: 'i8', name: 'Milho Verde', assignee: 'João', quantity: 4, price: 17.7, grabbed: false },
        ],
      },
      {
        id: 'g2', name: 'Compras do Mês', color: '#3b82f6', progress: 40, total: 445,
        members: [
          { id: 'm5', name: 'Fernanda', initials: 'FE', color: '#ec4899', online: true },
          { id: 'm6', name: 'Pedro', initials: 'PE', color: '#10b981', online: false },
        ],
        items: [
          { id: 'i9', name: 'Arroz 5kg', assignee: 'Fernanda', quantity: 1, price: 28.9, grabbed: true },
          { id: 'i10', name: 'Feijão Preto', assignee: 'Pedro', quantity: 2, price: 18.5, grabbed: false },
          { id: 'i11', name: 'Azeite Extra Virgem', assignee: 'Fernanda', quantity: 1, price: 45.0, grabbed: true },
          { id: 'i12', name: 'Papel Higiênico', assignee: 'Pedro', quantity: 3, price: 52.0, grabbed: false },
          { id: 'i13', name: 'Detergente', assignee: 'Fernanda', quantity: 2, price: 14.9, grabbed: false },
          { id: 'i14', name: 'Leite Integral', assignee: 'Pedro', quantity: 6, price: 35.9, grabbed: false },
          { id: 'i15', name: 'Café 500g', assignee: 'Fernanda', quantity: 1, price: 22.9, grabbed: true },
          { id: 'i16', name: 'Açúcar 1kg', assignee: 'Pedro', quantity: 2, price: 16.5, grabbed: false },
        ],
      },
      {
        id: 'g3', name: 'Kit Escrita', color: '#8b5cf6', progress: 80, total: 56,
        members: [
          { id: 'm7', name: 'Você', initials: 'V', color: '#f59e0b', online: true },
        ],
        items: [
          { id: 'i17', name: 'Caderno 96 folhas', assignee: 'Você', quantity: 3, price: 24.0, grabbed: true },
          { id: 'i18', name: 'Caneta Bic Azul', assignee: 'Você', quantity: 10, price: 20.0, grabbed: false },
          { id: 'i19', name: 'Borracha', assignee: 'Você', quantity: 2, price: 12.0, grabbed: true },
        ],
      },
    ],
    activities: [
      { id: 'a1', message: 'Maria adicionou 2 itens', timestamp: new Date(Date.now() - 120000).toISOString(), avatar: 'MA' },
      { id: 'a2', message: 'Carlos marcou Picanha como "já peguei"', timestamp: new Date(Date.now() - 600000).toISOString(), avatar: 'CA' },
      { id: 'a3', message: 'Ana atualizou o valor da Linguiça', timestamp: new Date(Date.now() - 1800000).toISOString(), avatar: 'AN' },
      { id: 'a4', message: 'Fernanda criou "Compras do Mês"', timestamp: new Date(Date.now() - 7200000).toISOString(), avatar: 'FE' },
      { id: 'a5', message: 'Pedro se juntou ao grupo', timestamp: new Date(Date.now() - 14400000).toISOString(), avatar: 'PE' },
    ],
  }
}

// ── localStorage helpers ────────────────────────────────────────────────────
function loadState(): CollaborativeState {
  if (typeof window === 'undefined') return defaultState()
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r) } catch { /* */ }
  return defaultState()
}
function saveState(s: CollaborativeState): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* */ }
}

// ── Animation variants ─────────────────────────────────────────────────────
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const cardV = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
  exit: { opacity: 0, scale: 0.94, y: -12, transition: { duration: 0.2 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
}
const slideIn = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
}

// ── MemberAvatar ────────────────────────────────────────────────────────────
function MemberAvatar({ member, size = 32, showStatus = true, idx = 0 }: {
  member: Member; size?: number; showStatus?: boolean; idx?: number
}) {
  return (
    <motion.div
      className="r47-member-avatar relative flex items-center justify-center rounded-full border-2 border-background font-bold text-white shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.35,
        backgroundColor: member.color,
        boxShadow: `0 2px 8px ${member.color}40`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: idx * 0.06 }}
      whileHover={{ scale: 1.15, zIndex: 50 }}
      title={member.name}
    >
      {member.initials}
      {showStatus && (
        <span className={`absolute -bottom-0.5 -right-0.5 ${size < 30 ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full border-2 border-background ${member.online ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      )}
    </motion.div>
  )
}

// ── AvatarStack with invite ───────────────────────────────────────────────
function AvatarStack({ members, onInvite }: { members: Member[]; onInvite: () => void }) {
  const vis = members.slice(0, 4)
  const rem = members.length - 4
  return (
    <div className="r47-avatar-stack flex items-center">
      {vis.map((m, i) => (
        <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: vis.length - i }}>
          <MemberAvatar member={m} size={30} idx={i} />
        </div>
      ))}
      {rem > 0 && (
        <motion.div
          className="flex items-center justify-center rounded-full border-2 border-background text-[9px] font-bold text-muted-foreground"
          style={{ width: 30, height: 30, marginLeft: -8, zIndex: 0, background: 'rgba(148,163,184,0.15)' }}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
        >+{rem}</motion.div>
      )}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onInvite}
        className="ml-1 flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground"
        style={{ width: 30, height: 30 }} title="Convidar membro">
        <UserPlus className="h-3 w-3" />
      </motion.button>
    </div>
  )
}

// ── GroupCard ───────────────────────────────────────────────────────────────
function GroupCard({ group, index, onSelect }: { group: ShoppingGroup; index: number; onSelect: () => void }) {
  const grabbed = group.items.filter(i => i.grabbed).length
  const total = group.items.length
  return (
    <motion.div variants={cardV}
      className="r47-collab-card relative overflow-hidden rounded-xl border border-border/40 bg-background/80 cursor-pointer"
      whileHover={{ y: -3 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} onClick={onSelect}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-secondary/40 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: group.color }}
          initial={{ width: 0 }} animate={{ width: `${group.progress}%` }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 20, delay: index * 0.1 }} />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <motion.div className="shrink-0 flex items-center justify-center rounded-xl"
              style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${group.color}33, ${group.color}15)`, boxShadow: `0 0 0 2px ${group.color}40` }}
              whileHover={{ scale: 1.08 }} transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}>
              <ShoppingCart className="h-4.5 w-4.5" style={{ color: group.color }} />
            </motion.div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{group.name}</h3>
              <span className="text-[10px] text-muted-foreground">{group.members.length} membros · {total} itens</span>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-lg bg-secondary/60 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); onSelect() }}>
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </motion.div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <AvatarStack members={group.members} onInvite={() => {}} />
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="text-sm font-bold text-foreground tabular-nums">{formatBRL(group.total)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden" style={{ width: 80 }}>
              <motion.div className="h-full rounded-full" style={{ backgroundColor: group.color }}
                initial={{ width: 0 }} animate={{ width: total > 0 ? `${(grabbed / total) * 100}%` : '0%' }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }} />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">{grabbed}/{total}</span>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge variant="secondary" className="text-[9px] font-bold"
              style={{ backgroundColor: `${group.color}18`, color: group.color, borderColor: `${group.color}30` }}>
              {formatBRL(group.total / Math.max(1, group.members.length))}/pessoa
            </Badge>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ── SharedCartItems ─────────────────────────────────────────────────────────
function SharedCartItems({ items, onToggle }: { items: CartItem[]; onToggle: (id: string) => void }) {
  return (
    <div className="r47-cart-items space-y-2">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div key={item.id} variants={slideIn} initial="hidden" animate="visible" exit="exit"
            className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${item.grabbed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/20 bg-background/40 hover:bg-secondary/20'}`}>
            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={() => onToggle(item.id)}
              className="h-6 w-6 min-h-[44px] min-w-[44px] rounded-md border-2 flex items-center justify-center shrink-0 transition-colors"
              style={{ borderColor: item.grabbed ? '#10b981' : 'rgba(148,163,184,0.4)', backgroundColor: item.grabbed ? '#10b981' : 'transparent' }}>
              <AnimatePresence>
                {item.grabbed && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}>
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <div className="flex-1 min-w-0">
              <p className={`text-[11px] font-semibold truncate ${item.grabbed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-muted-foreground">Responsável: {item.assignee}</span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <span className="text-[9px] font-semibold text-muted-foreground tabular-nums">{item.quantity}x {formatBRL(item.price)}</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-foreground tabular-nums shrink-0">{formatBRL(item.price * item.quantity)}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── SplitCalculator ──────────────────────────────────────────────────────────
function SplitCalculator({ total, memberCount }: { total: number; memberCount: number }) {
  const [mode, setMode] = useState<'equal' | 'custom'>('equal')
  const [amounts, setAmounts] = useState<number[]>(
    Array(Math.max(1, memberCount)).fill(Math.round((total / Math.max(1, memberCount)) * 100) / 100)
  )
  useEffect(() => {
    const eq = Math.round((total / Math.max(1, memberCount)) * 100) / 100
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAmounts(Array(Math.max(1, memberCount)).fill(eq))
  }, [total, memberCount])
  const equalSplit = memberCount > 0 ? total / memberCount : 0
  const customTotal = amounts.reduce((a, b) => a + b, 0)
  const diff = total - customTotal

  return (
    <div className="r47-split-calc space-y-3">
      <div className="flex items-center gap-1 bg-secondary/40 rounded-lg p-1">
        {(['equal', 'custom'] as const).map((m) => (
          <motion.button key={m} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-md text-[11px] font-semibold transition-all ${mode === m ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <Split className="h-3 w-3" />{m === 'equal' ? 'Igual' : 'Personalizado'}
          </motion.button>
        ))}
      </div>
      {mode === 'equal' ? (
        <motion.div key="eq" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-3 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Dividir {formatBRL(total)} entre {memberCount} pessoas</p>
          <motion.p className="text-2xl font-black tabular-nums" style={{ color: '#10b981' }}
            key={equalSplit.toFixed(2)} initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}>
            {formatBRL(equalSplit)}
          </motion.p>
          <p className="text-[9px] text-muted-foreground mt-1">por pessoa</p>
        </motion.div>
      ) : (
        <motion.div key="cust" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          {amounts.map((amt, i) => (
            <motion.div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/30"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 22, delay: i * 0.05 }}>
              <span className="text-[10px] font-semibold text-muted-foreground w-16">Pessoa {i + 1}</span>
              <div className="flex-1 flex items-center gap-1 bg-background rounded-md px-2 py-1 border border-border/40">
                <span className="text-[10px] text-muted-foreground">R$</span>
                <input type="number" value={amt} onChange={(e) => setAmounts(p => { const n = [...p]; n[i] = parseFloat(e.target.value) || 0; return n })}
                  className="flex-1 bg-transparent text-[11px] font-bold tabular-nums outline-none" step={0.01} />
              </div>
            </motion.div>
          ))}
          <div className={`flex items-center justify-between p-2 rounded-lg text-[11px] font-bold ${Math.abs(diff) < 0.01 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
            <span>{Math.abs(diff) < 0.01 ? 'Divisão correta!' : `Faltam ${formatBRL(Math.abs(diff))}`}</span>
            {Math.abs(diff) < 0.01 && <Check className="h-3.5 w-3.5" />}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ── ActivityFeed ────────────────────────────────────────────────────────────
function ActivityFeed({ activities }: { activities: ActivityEntry[] }) {
  return (
    <div className="r47-activity-feed space-y-2">
      <AnimatePresence mode="popLayout">
        {activities.slice(0, 5).map((a) => (
          <motion.div key={a.id} variants={slideIn} initial="hidden" animate="visible" exit="exit"
            className="flex items-start gap-2.5 p-2 rounded-lg bg-background/40 border border-border/20">
            <div className="r47-member-avatar flex items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0"
              style={{ width: 26, height: 26, backgroundColor: '#8b5cf6' }}>{a.avatar}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground">{a.message}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">{timeAgo(a.timestamp)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── SavingsTracker ──────────────────────────────────────────────────────────
function SavingsTracker({ savings }: { savings: number }) {
  return (
    <motion.div className="r47-savings-tracker relative overflow-hidden rounded-xl p-3.5 border border-emerald-500/20"
      style={{ backgroundColor: 'rgba(16,185,129,0.06)' }} variants={fadeUp}>
      <motion.div className="absolute -top-4 -right-4 h-14 w-14 rounded-full blur-2xl"
        style={{ backgroundColor: 'rgba(16,185,129,0.25)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
      <div className="relative z-10 flex items-center gap-3">
        <motion.div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(20,184,166,0.2))', boxShadow: '0 0 0 2px rgba(16,185,129,0.3)' }}
          animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}>
          <PiggyBank className="h-5 w-5" style={{ color: '#10b981' }} />
        </motion.div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Economia do grupo</p>
          <p className="text-lg font-black tabular-nums" style={{ color: '#10b981' }}>
            <AnimatedCounter value={savings} prefix="R$ " decimals={0} duration={1400} />
          </p>
        </div>
        <motion.div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold"
          style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <TrendingDown className="h-3 w-3" />-12%
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── InviteLink ──────────────────────────────────────────────────────────────
function InviteLink({ groupId }: { groupId: string }) {
  const [copied, setCopied] = useState(false)
  const link = `https://domplace.com.br/compartilhar/${groupId}`
  const handleCopy = useCallback(async () => {
    try { if (typeof navigator !== 'undefined' && navigator.clipboard) await navigator.clipboard.writeText(link) } catch { /* */ }
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }, [link])
  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: 'Lista compartilhada - DomPlace', text: 'Junte-se à minha lista!', url: link }) } catch { /* */ }
    }
  }, [link])

  return (
    <div className="r47-invite-link space-y-2">
      <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border/30">
        <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-[10px] text-muted-foreground truncate flex-1 font-mono">{link}</span>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button size="sm" variant="ghost" className="h-7 min-h-[44px] min-w-[44px] px-2 text-[10px] font-semibold" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
        </motion.div>
      </div>
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <Button variant="outline" className="w-full h-9 min-h-[44px] text-[11px] font-semibold gap-2 rounded-lg" onClick={handleShare}>
          <Share2 className="h-3.5 w-3.5" />Compartilhar lista
        </Button>
      </motion.div>
    </div>
  )
}

// ── CreateNewGroup ─────────────────────────────────────────────────────────
function CreateNewGroup({ onCreate }: { onCreate: (g: ShoppingGroup) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const { toast } = useToast()

  const handleCreate = useCallback(() => {
    if (!name.trim()) { toast({ title: 'Nome obrigatório', variant: 'destructive' }); return }
    onCreate({ id: `grp-${Date.now()}`, name: name.trim(), color, progress: 0, total: 0,
      members: [{ id: 'user', name: 'Você', initials: 'V', color: '#f59e0b', online: true }], items: [] })
    setName(''); setColor(COLORS[0]); setOpen(false)
    toast({ title: 'Lista criada!', description: `"${name.trim()}" está pronta.` })
  }, [name, color, onCreate, toast])

  return (
    <div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3">
            <motion.div className="r47-create-form rounded-xl p-4 border border-primary/20 bg-primary/5"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}>
              <div className="mb-3">
                <label className="text-[11px] font-semibold text-foreground mb-1.5 block">Nome da lista</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Churrasco do Sábado"
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-xs outline-none placeholder:text-muted-foreground/50 focus:border-primary/40 transition-colors"
                  maxLength={40} autoFocus />
              </div>
              <div className="mb-3">
                <label className="text-[11px] font-semibold text-foreground mb-1.5 block">Cor da lista</label>
                <div className="flex items-center gap-2">
                  {COLORS.map((c) => (
                    <motion.button key={c} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={() => setColor(c)}
                      className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-all"
                      style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 3px rgba(255,255,255,0.8), 0 0 0 5px ${c}` : '0 2px 6px rgba(0,0,0,0.15)' }}>
                      {color === c && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}><Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /></motion.div>}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button onClick={handleCreate} className="w-full h-9 min-h-[44px] text-[11px] font-bold gap-2 rounded-lg">
                    <Plus className="h-3.5 w-3.5" />Criar lista
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="h-9 min-h-[44px] px-3 text-[11px] rounded-lg" onClick={() => setOpen(false)}>Cancelar</Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {!open && (
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button variant="outline" className="w-full h-10 text-xs font-semibold gap-2 rounded-xl border-dashed border-primary/30"
            onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 text-primary" />Criar lista compartilhada
          </Button>
        </motion.div>
      )}
    </div>
  )
}

// ── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div className="r47-empty-state flex flex-col items-center justify-center py-16 px-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="relative">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}>
          <PackageOpen className="h-16 w-16 text-muted-foreground/30" />
        </motion.div>
        <motion.div className="absolute -top-4 -left-6" animate={{ y: [0, -6, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.2 }}>
          <ShoppingCart className="h-6 w-6 text-muted-foreground/20" />
        </motion.div>
        <motion.div className="absolute -bottom-2 -right-5" animate={{ y: [0, -8, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}>
          <ShoppingCart className="h-5 w-5 text-muted-foreground/20" />
        </motion.div>
        <motion.div className="absolute -top-2 -right-8" animate={{ y: [0, -5, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.8 }}>
          <ShoppingCart className="h-4 w-4 text-muted-foreground/15" />
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mt-6">
        <p className="text-sm font-semibold text-muted-foreground">Nenhuma lista compartilhada</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Crie uma lista e convide seus amigos para compras em equipe</p>
      </motion.div>
    </motion.div>
  )
}

// ── GroupDetailPanel ────────────────────────────────────────────────────────
function GroupDetailPanel({ group, onClose, onToggleGrab, onDelete }: {
  group: ShoppingGroup; onClose: () => void; onToggleGrab: (itemId: string) => void; onDelete: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 26 }} className="r47-detail-panel space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${group.color}33, ${group.color}15)` }}>
            <ShoppingCart className="h-4.5 w-4.5" style={{ color: group.color }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{group.name}</h3>
            <span className="text-[10px] text-muted-foreground">{group.members.length} membros · {group.items.length} itens</span>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
          className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-full bg-secondary/80 flex items-center justify-center">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.button>
      </div>
      {/* Members */}
      <div>
        <h4 className="text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5"><Users className="h-3 w-3" /> Membros</h4>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {group.members.map((m, i) => (
              <motion.div key={m.id} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-border/20 bg-background/40"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 22, delay: i * 0.05 }}>
                <MemberAvatar member={m} size={26} idx={i} />
                <span className="text-[10px] font-medium">{m.name}</span>
                <span className={`w-2 h-2 rounded-full ${m.online ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      {/* Items */}
      <div>
        <h4 className="text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5">
          <ShoppingCart className="h-3 w-3" /> Itens da lista
          <Badge variant="secondary" className="text-[8px] font-bold ml-1">{formatBRL(group.total)}</Badge>
        </h4>
        <SharedCartItems items={group.items} onToggle={onToggleGrab} />
      </div>
      {/* Split */}
      <div>
        <h4 className="text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5"><Split className="h-3 w-3" /> Dividir conta</h4>
        <SplitCalculator total={group.total} memberCount={group.members.length} />
      </div>
      {/* Invite */}
      <div>
        <h4 className="text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5"><Share2 className="h-3 w-3" /> Convite</h4>
        <InviteLink groupId={group.id} />
      </div>
      {/* Delete */}
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <Button variant="ghost" className="w-full h-9 min-h-[44px] text-[11px] font-semibold gap-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />Excluir lista
        </Button>
      </motion.div>
    </motion.div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function CollaborativeShopping() {
  const [state, setState] = useState<CollaborativeState>(defaultState)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setState(loadState()); setHydrated(true) }, [])
  useEffect(() => { if (hydrated) saveState(state) }, [state, hydrated])

  const selectedGroup = useMemo(() => state.groups.find(g => g.id === selectedId) ?? null, [state.groups, selectedId])

  const handleToggleGrab = useCallback((groupId: string, itemId: string) => {
    setState(p => ({
      ...p,
      groups: p.groups.map(g => g.id === groupId ? {
        ...g,
        items: g.items.map(it => it.id === itemId ? { ...it, grabbed: !it.grabbed } : it),
      } : g),
    }))
  }, [])

  const handleCreate = useCallback((group: ShoppingGroup) => {
    setState(p => ({
      ...p, groups: [...p.groups, group],
      activities: [{ id: `a-${Date.now()}`, message: `Você criou "${group.name}"`, timestamp: new Date().toISOString(), avatar: 'V' }, ...p.activities],
    }))
  }, [])

  const handleDelete = useCallback((groupId: string) => {
    setState(p => {
      const g = p.groups.find(gr => gr.id === groupId)
      return { ...p, groups: p.groups.filter(gr => gr.id !== groupId),
        activities: g ? [{ id: `a-${Date.now()}`, message: `"${g.name}" foi removida`, timestamp: new Date().toISOString(), avatar: 'V' }, ...p.activities] : p.activities }
    })
    setSelectedId(null)
  }, [])

  const toggleSelect = useCallback((id: string) => setSelectedId(p => p === id ? null : id), [])

  if (hydrated && state.groups.length === 0) {
    return (
      <div className="r47-collab-container">
        <EmptyState />
        <div className="mt-4"><CreateNewGroup onCreate={handleCreate} /></div>
      </div>
    )
  }

  return (
    <motion.section className="r47-collab-container r62-card-lift" variants={containerV} initial="hidden" animate="visible">
      {/* 1. Shared Lists Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <motion.div className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.2))', boxShadow: '0 0 0 2px rgba(16,185,129,0.3)' }}
            animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}>
            <Users className="h-5 w-5" style={{ color: '#10b981' }} />
          </motion.div>
          <div>
            <h2 className="text-lg font-black r62-heading-gradient" style={{
              background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Compras em Equipe</h2>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />Listas compartilhadas com sua turma
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[9px] font-bold">{state.groups.length} {state.groups.length === 1 ? 'lista' : 'listas'}</Badge>
      </motion.div>

      {/* 8. Savings Tracker */}
      <motion.div variants={fadeUp} className="mb-4">
        <SavingsTracker savings={state.savings} />
      </motion.div>

      {/* Grid: groups + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 2. Active Shopping Groups */}
        <div className="lg:col-span-1 space-y-3">
          <AnimatePresence mode="popLayout">
            {state.groups.map((g, i) => (
              <motion.div key={g.id} variants={cardV} layout>
                <GroupCard group={g} index={i} onSelect={() => toggleSelect(g.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
          {/* 7. Create New Group */}
          <motion.div variants={fadeUp}><CreateNewGroup onCreate={handleCreate} /></motion.div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedGroup ? (
              <motion.div key={selectedGroup.id} className="r47-detail-wrapper rounded-xl border border-border/40 bg-background/80 p-4"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring' as const, stiffness: 280, damping: 26 }}>
                <GroupDetailPanel group={selectedGroup} onClose={() => setSelectedId(null)}
                  onToggleGrab={(id) => handleToggleGrab(selectedGroup.id, id)} onDelete={() => handleDelete(selectedGroup.id)} />
              </motion.div>
            ) : (
              <motion.div key="none" className="r47-no-selection rounded-xl border border-dashed border-border/40 bg-background/40 p-8 flex flex-col items-center justify-center min-h-[300px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}>
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/20" />
                </motion.div>
                <p className="text-xs text-muted-foreground/60 mt-4 text-center">Selecione uma lista para ver detalhes, itens e divisão de conta</p>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground/40">
                  <ArrowRight className="h-3 w-3" /><span>Clique em um grupo ao lado</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 6. Real-time Activity Feed */}
      <motion.div variants={fadeUp} className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-bold text-foreground">Atividade recente</h3>
          </div>
          <span className="text-[9px] text-muted-foreground font-medium">{state.activities.length} ações</span>
        </div>
        <ActivityFeed activities={state.activities} />
      </motion.div>

      {/* Footer */}
      <motion.div variants={fadeUp} className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground/50 py-2">
        <CircleDot className="h-2.5 w-2.5" style={{ color: '#10b981' }} />
        <span>Atualizações em tempo real entre membros</span>
      </motion.div>
    </motion.section>
  )
}
