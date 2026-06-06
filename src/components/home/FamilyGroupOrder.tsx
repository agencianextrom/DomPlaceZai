'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Clock, Copy, Check, Plus, UserPlus, ShoppingCart, Sparkles, X,
  ChevronDown, PackageOpen, Share2, Loader2, ArrowRight, Timer, HandCoins,
} from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'

// ─── TYPES ───────────────────────────────────────────────────────────────
interface GroupItem { productId: string; name: string; price: number; quantity: number }
interface GroupMember { id: string; name: string; items: GroupItem[]; joinedAt: number }
type GroupStatus = 'waiting' | 'ordering' | 'ready'
interface FamilyGroup {
  code: string; name: string; createdAt: number; expiresAt: number
  members: GroupMember[]; status: GroupStatus
}
type ViewMode = 'landing' | 'active' | 'creating' | 'joining'

// ─── CONSTANTS ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'r68-family-group'
const EXPIRY_MS = 30 * 60 * 1000
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899']

const STATUS_CFG: Record<GroupStatus, { label: string; color: string; bg: string; border: string }> = {
  waiting:  { label: 'Aguardando membros', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  ordering: { label: 'Montando pedido',    color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/30' },
  ready:    { label: 'Pronto para finalizar', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
}

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const SAMPLE_PRODUCTS: GroupItem[] = [
  { productId: 'sp-1', name: 'Macarrão 500g', price: 4.99, quantity: 1 },
  { productId: 'sp-2', name: 'Molho de Tomate', price: 3.49, quantity: 1 },
  { productId: 'sp-3', name: 'Queijo Mussarela', price: 19.9, quantity: 1 },
  { productId: 'sp-4', name: 'Banana 1kg', price: 5.99, quantity: 1 },
  { productId: 'sp-5', name: 'Sabão em Pó', price: 11.9, quantity: 1 },
  { productId: 'sp-6', name: 'Leite 1L', price: 5.49, quantity: 1 },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────
const genCode = () => Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
const initials = (n: string) => { const p = n.trim().split(/\s+/); return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase() }
const memberTotal = (m: GroupMember) => m.items.reduce((s, i) => s + i.price * i.quantity, 0)
const memberQty = (m: GroupMember) => m.items.reduce((s, i) => s + i.quantity, 0)
const groupTotals = (g: FamilyGroup) => g.members.reduce((acc, m) => m.items.reduce((a, i) => { a.items += i.quantity; a.value += i.price * i.quantity; return a }, acc), { items: 0, value: 0 })

function timerInfo(expiresAt: number) {
  const r = Math.max(0, expiresAt - Date.now())
  return {
    minutes: Math.floor(r / 60000), seconds: Math.floor((r % 60000) / 1000),
    pct: Math.min(100, (r / EXPIRY_MS) * 100), expired: r <= 0,
  }
}

// ─── LOCALSTORAGE ─────────────────────────────────────────────────────────
function loadGroup(): FamilyGroup | null {
  if (typeof window === 'undefined') return null
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) as FamilyGroup : null } catch { return null }
}
function saveGroup(g: FamilyGroup) { if (typeof window === 'undefined') return; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(g)) } catch { /* */ } }
function clearGroup() { if (typeof window === 'undefined') return; try { localStorage.removeItem(STORAGE_KEY) } catch { /* */ } }

// ─── DEMO DATA ───────────────────────────────────────────────────────────
function getDemoGroup(): FamilyGroup {
  const now = Date.now()
  return {
    code: 'FAM9X2', name: 'Família Silva - Compras do Mês',
    createdAt: now - 12 * 60 * 1000, expiresAt: now + 18 * 60 * 1000, status: 'ordering',
    members: [
      { id: 'm1', name: 'Maria Silva', items: [
        { productId: 'p1', name: 'Arroz 5kg', price: 28.9, quantity: 2 },
        { productId: 'p2', name: 'Feijão 1kg', price: 9.49, quantity: 3 },
      ], joinedAt: now - 12 * 60 * 1000 },
      { id: 'm2', name: 'João Silva', items: [
        { productId: 'p4', name: 'Açúcar 1kg', price: 5.29, quantity: 2 },
        { productId: 'p5', name: 'Café 500g', price: 22.9, quantity: 1 },
      ], joinedAt: now - 8 * 60 * 1000 },
      { id: 'm3', name: 'Ana Silva', items: [
        { productId: 'p6', name: 'Leite 1L', price: 5.49, quantity: 6 },
        { productId: 'p7', name: 'Ovos 12un', price: 14.9, quantity: 2 },
        { productId: 'p8', name: 'Papel Higiênico', price: 18.9, quantity: 1 },
      ], joinedAt: now - 3 * 60 * 1000 },
    ],
  }
}

// ─── HOOKS ───────────────────────────────────────────────────────────────
const emptySub = () => () => {}
const useHydrated = () => useSyncExternalStore(emptySub, () => true, () => false)

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────
const sp = 'spring' as const
const ctrV = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const cardV = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: sp, stiffness: 260, damping: 22 } },
  exit: { opacity: 0, scale: 0.94, y: -12, transition: { duration: 0.2 } },
}
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: sp, stiffness: 200, damping: 20 } } }
const scaleIn = { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1, transition: { type: sp, stiffness: 300, damping: 22 } } }
const headerPulse = { animate: { scale: [1, 1.08, 1], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } } }

// ─── SKELETON ──────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <motion.section className="r68-family-group-order rounded-2xl border border-border/40 bg-background/80 p-5"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
        <div className="flex-1 space-y-2"><div className="h-5 w-44 rounded-md bg-muted animate-pulse" /><div className="h-3 w-32 rounded-md bg-muted animate-pulse" /></div>
      </div>
      <div className="h-14 rounded-xl bg-muted animate-pulse mb-5" />
      {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse mb-2" />)}
      <div className="mt-4 h-20 rounded-xl bg-muted animate-pulse" />
    </motion.section>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: GroupStatus }) {
  const c = STATUS_CFG[status]
  const icons: Record<GroupStatus, React.ReactNode> = { waiting: <Clock className="h-3 w-3" />, ordering: <ShoppingCart className="h-3 w-3" />, ready: <Check className="h-3 w-3" /> }
  return (
    <motion.span variants={scaleIn} className={`r68-status-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${c.bg} ${c.border} ${c.color}`}>
      {icons[status]} {c.label}
    </motion.span>
  )
}

// ─── TIMER RING ────────────────────────────────────────────────────────────
function TimerRing({ expiresAt }: { expiresAt: number }) {
  const [t, setT] = useState(() => timerInfo(expiresAt))
  useEffect(() => { const iv = setInterval(() => setT(timerInfo(expiresAt)), 1000); return () => clearInterval(iv) }, [expiresAt])
  const color = t.expired ? '#ef4444' : t.minutes < 5 ? '#f59e0b' : '#10b981'
  const circ = 2 * Math.PI * 40
  const off = circ - (t.pct / 100) * circ
  return (
    <div className="r68-timer-ring relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
      <svg className="absolute inset-0 -rotate-90" width={88} height={88} viewBox="0 0 88 88" aria-hidden="true">
        <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="5" />
        <motion.circle cx="44" cy="44" r="40" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: off }}
          transition={{ duration: 1, ease: 'linear' }} />
      </svg>
      <div className="flex flex-col items-center z-10">
        {t.expired ? (
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity }}><Timer className="h-5 w-5" style={{ color: '#ef4444' }} /></motion.div>
        ) : (
          <>
            <motion.span className="text-lg font-black tabular-nums" style={{ color }} key={`${t.minutes}:${t.seconds}`}
              initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ type: sp, stiffness: 400, damping: 20 }}>
              {String(t.minutes).padStart(2, '0')}:{String(t.seconds).padStart(2, '0')}
            </motion.span>
            <span className="text-[8px] font-semibold text-muted-foreground">restante</span>
          </>
        )}
      </div>
    </div>
  )
}

// ─── GROUP CODE DISPLAY ────────────────────────────────────────────────────
function GroupCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    try { if (navigator?.clipboard) await navigator.clipboard.writeText(code) } catch { /* */ }
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }, [code])
  return (
    <div className="r68-group-code flex items-center gap-2 p-3 rounded-xl bg-secondary/30 border border-border/30">
      <div className="flex-1 text-center">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Código do grupo</p>
        <p className="text-2xl font-black tracking-[0.25em] font-mono text-foreground">{code}</p>
      </div>
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={copy}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 active:scale-95 transition-transform" aria-label="Copiar">
        {copied
          ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: sp, stiffness: 400, damping: 15 }}><Check className="h-5 w-5 text-emerald-500" /></motion.div>
          : <Copy className="h-5 w-5 text-primary" />}
      </motion.button>
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={async () => { if (navigator?.share) try { await navigator.share({ title: 'Pedido Familiar - DomPlace', text: `Junte-se ao nosso pedido! Código: ${code}` }) } catch { /* */ } }}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-secondary/60 border border-border/30 active:scale-95 transition-transform" aria-label="Compartilhar">
        <Share2 className="h-4 w-4 text-muted-foreground" />
      </motion.button>
    </div>
  )
}

// ─── MEMBER CARD ──────────────────────────────────────────────────────────
function MemberCard({ member, idx }: { member: GroupMember; idx: number }) {
  const [open, setOpen] = useState(false)
  const color = COLORS[idx % COLORS.length]
  const qty = memberQty(member)
  const total = memberTotal(member)
  return (
    <motion.div variants={cardV} layout
      className="r68-member-card relative overflow-hidden rounded-xl border border-border/30 bg-background/60 active:scale-[0.98] transition-transform"
      style={{ borderLeft: `4px solid ${color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <button type="button" onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 p-3 text-left">
        <motion.div className="flex items-center justify-center rounded-full text-white font-bold shrink-0"
          style={{ width: 40, height: 40, fontSize: 14, backgroundColor: color, boxShadow: `0 2px 8px ${color}40` }}
          whileHover={{ scale: 1.1 }} transition={{ type: sp, stiffness: 400, damping: 20 }}>
          {initials(member.name)}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{member.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground">{qty} {qty === 1 ? 'item' : 'itens'}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] font-semibold text-foreground tabular-nums">{brl(total)}</span>
          </div>
        </div>
        <motion.div className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
          animate={{ rotate: open ? 180 : 0 }} transition={{ type: sp, stiffness: 300, damping: 20 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>{open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
          <div className="px-3 pb-3 pt-1 border-t border-border/20">
            {member.items.map((item, i) => (
              <motion.div key={item.productId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ type: sp, stiffness: 300, damping: 22, delay: i * 0.04 }} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{item.quantity}x</span>
                  <span className="text-[11px] font-semibold text-foreground truncate">{item.name}</span>
                </div>
                <span className="text-[10px] font-bold text-foreground tabular-nums shrink-0 ml-2">{brl(item.price * item.quantity)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}</AnimatePresence>
    </motion.div>
  )
}

// ─── CART SUMMARY ─────────────────────────────────────────────────────────
function CartSummary({ group, onFinalize }: { group: FamilyGroup; onFinalize: () => void }) {
  const { items: ti, value: tv } = groupTotals(group)
  const mc = group.members.length
  return (
    <motion.div variants={fadeUp} className="relative overflow-hidden rounded-xl border border-border/40 bg-background/80 p-4"
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      <motion.div className="absolute -top-6 -right-6 h-16 w-16 rounded-full blur-2xl opacity-20" style={{ backgroundColor: '#10b981' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 3, repeat: Infinity }} aria-hidden="true" />
      <div className="relative z-10">
        <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-primary" />Resumo do pedido</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {[{ v: mc, l: mc === 1 ? 'membro' : 'membros' }, { v: ti, l: ti === 1 ? 'item' : 'itens' }, { v: tv, l: 'total', fmt: true }].map((c) => (
            <div key={c.l} className="text-center p-2 rounded-lg bg-secondary/30">
              <p className={c.fmt ? 'text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums' : 'text-lg font-black text-foreground tabular-nums'}>
                {c.fmt ? brl(c.v as number) : c.v}
              </p>
              <p className="text-[9px] font-semibold text-muted-foreground">{c.l}</p>
            </div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onFinalize}
          disabled={group.status !== 'ready'}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{
            background: group.status === 'ready' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(148,163,184,0.2)',
            color: group.status === 'ready' ? '#ffffff' : 'rgba(100,116,139,1)',
            boxShadow: group.status === 'ready' ? '0 4px 16px rgba(16,185,129,0.35)' : 'none',
            cursor: group.status === 'ready' ? 'pointer' : 'default',
          }}>
          {group.status === 'ready'
            ? <><HandCoins className="h-4 w-4" />Finalizar pedido<ArrowRight className="h-3.5 w-3.5" /></>
            : <><Clock className="h-4 w-4" />Aguardando pedidos...</>}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── ADD ITEMS MODAL ──────────────────────────────────────────────────────
function AddItemsModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (items: GroupItem[]) => void }) {
  const [sel, setSel] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(false)
  useEffect(() => { if (open) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSel(new Map())
  } }, [open])

  const toggle = useCallback((pid: string) => {
    setSel(prev => { const n = new Map(prev); const q = n.get(pid) ?? 0; void (q > 0 ? n.delete(pid) : n.set(pid, 1)); return n })
  }, [])
  const updQty = useCallback((pid: string, d: number) => {
    setSel(prev => { const n = new Map(prev); const u = Math.max(0, (n.get(pid) ?? 0) + d); void (u === 0 ? n.delete(pid) : n.set(pid, u)); return n })
  }, [])
  const submit = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      const items: GroupItem[] = []
      sel.forEach((qty, pid) => { const p = SAMPLE_PRODUCTS.find(x => x.productId === pid); if (p) items.push({ ...p, quantity: qty }) })
      onAdd(items); setLoading(false)
    }, 600)
  }, [sel, onAdd])

  const cnt = sel.size
  const val = Array.from(sel.entries()).reduce((s, [id, q]) => { const p = SAMPLE_PRODUCTS.find(x => x.productId === id); return s + (p ? p.price * q : 0) }, 0)
  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative z-10 w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl border border-border/50 overflow-hidden max-h-[80vh] flex flex-col"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
          initial={{ y: 100, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: sp, stiffness: 300, damping: 28 }}>
          <div className="flex items-center justify-between p-4 border-b border-border/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><Plus className="h-4 w-4 text-white" /></div>
              <h2 className="text-sm font-bold text-foreground">Adicionar ao grupo</h2>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-secondary/80 active:scale-95 transition-transform">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {SAMPLE_PRODUCTS.map((product, i) => {
              const q = sel.get(product.productId) ?? 0
              return (
                <motion.div key={product.productId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ type: sp, stiffness: 300, damping: 22, delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${q > 0 ? 'border-primary/30 bg-primary/5' : 'border-border/20 bg-background/40'}`}>
                  <button type="button" onClick={() => toggle(product.productId)} className="flex-1 text-left min-h-[44px] flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate">{product.name}</p>
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{brl(product.price)}</p>
                    </div>
                  </button>
                  {q > 0 && (
                    <div className="flex items-center gap-1.5">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => updQty(product.productId, -1)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-secondary/80 text-xs font-bold active:scale-95 transition-transform">-</motion.button>
                      <span className="w-8 text-center text-xs font-bold tabular-nums">{q}</span>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => updQty(product.productId, 1)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-primary/10 text-xs font-bold active:scale-95 transition-transform">+</motion.button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
          <div className="p-4 border-t border-border/30 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-muted-foreground">{cnt} {cnt === 1 ? 'produto selecionado' : 'produtos selecionados'}</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{brl(val)}</span>
            </div>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={submit}
              disabled={cnt === 0 || loading}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform"
              style={{
                background: cnt > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(148,163,184,0.15)',
                color: cnt > 0 ? '#ffffff' : 'rgba(148,163,184,1)',
                boxShadow: cnt > 0 ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
              }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingCart className="h-4 w-4" />Adicionar {cnt} {cnt === 1 ? 'item' : 'itens'} ao grupo</>}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── CREATE GROUP VIEW ─────────────────────────────────────────────────────
function CreateGroupView({ onCreate, onBack }: { onCreate: (g: FamilyGroup) => void; onBack: () => void }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = useCallback(() => {
    if (!name.trim()) return
    setLoading(true)
    cachedFetch<unknown>('/api/family-group/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim() }) })
      .catch(() => {}).finally(() => {
        const now = Date.now()
        onCreate({ code: genCode(), name: name.trim(), createdAt: now, expiresAt: now + EXPIRY_MS, members: [{ id: `m-${now}`, name: 'Você', items: [], joinedAt: now }], status: 'waiting' })
        setLoading(false)
      })
  }, [name, onCreate])
  return (
    <motion.div variants={ctrV} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeUp} className="text-center mb-6">
        <motion.div className="mx-auto mb-4 h-16 w-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.15))', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }}
          animate={headerPulse.animate}><Users className="h-8 w-8" style={{ color: '#10b981' }} /></motion.div>
        <h2 className="text-lg font-black r62-heading-gradient">Criar Grupo Familiar</h2>
        <p className="text-[11px] text-muted-foreground mt-1">Monte um pedido com sua família e economize na entrega</p>
      </motion.div>
      <motion.div variants={fadeUp}>
        <label className="text-[11px] font-semibold text-foreground mb-2 flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-primary" />Nome da família / grupo</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Família Silva" maxLength={40} autoFocus
          className="w-full min-h-[44px] rounded-xl border border-border/50 bg-background/60 px-4 py-3 text-sm font-medium outline-none placeholder:text-muted-foreground/50 focus:border-primary/40 transition-colors"
          onKeyDown={e => { if (e.key === 'Enter') submit() }} />
      </motion.div>
      <motion.div variants={fadeUp} className="flex gap-3">
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onBack}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border/50 text-xs font-semibold text-muted-foreground active:scale-95 transition-transform">Voltar</motion.button>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={submit} disabled={!name.trim() || loading}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform"
          style={{
            background: name.trim() ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(148,163,184,0.15)',
            color: name.trim() ? '#ffffff' : 'rgba(148,163,184,1)',
            boxShadow: name.trim() ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
          }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" />Criar grupo</>}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── JOIN GROUP VIEW ───────────────────────────────────────────────────────
function JoinGroupView({ onJoin, onBack }: { onJoin: (g: FamilyGroup) => void; onBack: () => void }) {
  const [code, setCode] = useState('')
  const [uname, setUname] = useState('')
  const [loading, setLoading] = useState(false)
  const valid = code.trim().length === 6 && uname.trim().length > 0
  const submit = useCallback(() => {
    if (!valid) return
    setLoading(true)
    cachedFetch<unknown>(`/api/family-group/${code.trim().toUpperCase()}`).catch(() => {}).finally(() => {
      const now = Date.now()
      onJoin({ code: code.trim().toUpperCase(), name: `Grupo ${code.trim().toUpperCase()}`, createdAt: now - 5 * 60 * 1000, expiresAt: now + EXPIRY_MS, members: [{ id: `m-${now}`, name: uname.trim(), items: [], joinedAt: now }], status: 'waiting' })
      setLoading(false)
    })
  }, [code, uname, valid, onJoin])
  return (
    <motion.div variants={ctrV} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeUp} className="text-center mb-6">
        <motion.div className="mx-auto mb-4 h-16 w-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))', boxShadow: '0 0 0 3px rgba(59,130,246,0.2)' }}
          animate={headerPulse.animate}><UserPlus className="h-8 w-8" style={{ color: '#3b82f6' }} /></motion.div>
        <h2 className="text-lg font-black r62-heading-gradient">Entrar no Grupo</h2>
        <p className="text-[11px] text-muted-foreground mt-1">Digite o código fornecido pelo organizador</p>
      </motion.div>
      <motion.div variants={fadeUp}>
        <label className="text-[11px] font-semibold text-foreground mb-2 flex items-center gap-1.5"><Copy className="h-3 w-3 text-primary" />Código do grupo (6 caracteres)</label>
        <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))} placeholder="Ex: FAM9X2" maxLength={6} autoFocus
          className="w-full min-h-[44px] rounded-xl border border-border/50 bg-background/60 px-4 py-3 text-lg font-black tracking-[0.25em] font-mono text-center outline-none placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:font-medium placeholder:text-sm focus:border-primary/40 transition-colors" />
      </motion.div>
      <motion.div variants={fadeUp}>
        <label className="text-[11px] font-semibold text-foreground mb-2 flex items-center gap-1.5"><Users className="h-3 w-3 text-primary" />Seu nome</label>
        <input type="text" value={uname} onChange={e => setUname(e.target.value)} placeholder="Ex: Maria" maxLength={30}
          className="w-full min-h-[44px] rounded-xl border border-border/50 bg-background/60 px-4 py-3 text-sm font-medium outline-none placeholder:text-muted-foreground/50 focus:border-primary/40 transition-colors"
          onKeyDown={e => { if (e.key === 'Enter') submit() }} />
      </motion.div>
      <motion.div variants={fadeUp} className="flex gap-3">
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onBack}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border/50 text-xs font-semibold text-muted-foreground active:scale-95 transition-transform">Voltar</motion.button>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={submit} disabled={!valid || loading}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform"
          style={{
            background: valid ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(148,163,184,0.15)',
            color: valid ? '#ffffff' : 'rgba(148,163,184,1)',
            boxShadow: valid ? '0 4px 16px rgba(59,130,246,0.3)' : 'none',
          }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" />Entrar no grupo</>}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── ACTIVE GROUP VIEW ─────────────────────────────────────────────────────
function ActiveGroupView({ group, onUpdate, onLeave }: { group: FamilyGroup; onUpdate: (g: FamilyGroup) => void; onLeave: () => void }) {
  const [showModal, setShowModal] = useState(false)
  const totals = groupTotals(group)

  // Auto-update status
  useEffect(() => {
    let s: GroupStatus = group.status
    if (group.members.length <= 1) s = 'waiting'
    else if (totals.items > 0) s = 'ordering'
    if (totals.items >= 5 && group.members.length >= 2) s = 'ready'
    if (Date.now() >= group.expiresAt) s = 'ready'
    if (s !== group.status) onUpdate({ ...group, status: s })
  }, [group.members.length, totals.items, group.expiresAt, group.status, group, onUpdate])

  const handleAdd = useCallback((items: GroupItem[]) => {
    if (!items.length) return
    onUpdate({ ...group, members: group.members.map((m, i) => i === 0 ? { ...m, items: [...m.items, ...items] } : m), status: 'ordering' })
    setShowModal(false)
  }, [group, onUpdate])

  return (
    <motion.section variants={ctrV} initial="hidden" animate="visible" className="space-y-5">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.15))', boxShadow: '0 0 0 2px rgba(16,185,129,0.3)' }}
            animate={headerPulse.animate}><Users className="h-5 w-5" style={{ color: '#10b981' }} /></motion.div>
          <div>
            <h2 className="text-base font-black r62-heading-gradient truncate max-w-[200px]">{group.name}</h2>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3" />Pedido familiar compartilhado</p>
          </div>
        </div>
        <StatusBadge status={group.status} />
      </motion.div>

      {/* Timer + Code */}
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <TimerRing expiresAt={group.expiresAt} />
        <div className="flex-1"><GroupCodeDisplay code={group.code} /></div>
      </motion.div>

      {/* Members */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Membros ({group.members.length})</h3>
          <span className="r62-badge-glow text-[9px] font-bold text-muted-foreground">{totals.items} {totals.items === 1 ? 'item' : 'itens'} · {brl(totals.value)}</span>
        </div>
        <div className="space-y-2">
          <AnimatePresence>{group.members.map((m, i) => <MemberCard key={m.id} member={m} idx={i} />)}</AnimatePresence>
        </div>
      </motion.div>

      {/* Add items */}
      <motion.button variants={fadeUp} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)}
        className="relative w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-primary/30 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors active:scale-95">
        <ShoppingCart className="h-4 w-4" />Adicionar ao grupo<ArrowRight className="h-3.5 w-3.5" />
      </motion.button>

      {/* Summary */}
      <CartSummary group={group} onFinalize={() => onUpdate({ ...group, status: 'ready' })} />

      {/* Leave */}
      <motion.button variants={fadeUp} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onLeave}
        className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/5 active:scale-95 transition-all">
        <X className="h-4 w-4" />Sair do grupo
      </motion.button>

      <AddItemsModal open={showModal} onClose={() => setShowModal(false)} onAdd={handleAdd} />
    </motion.section>
  )
}

// ─── LANDING VIEW ─────────────────────────────────────────────────────────
function LandingView({ onCreate, onJoin, onDemo }: { onCreate: () => void; onJoin: () => void; onDemo: () => void }) {
  return (
    <motion.div variants={ctrV} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeUp} className="text-center mb-6">
        <motion.div className="mx-auto mb-4 h-16 w-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.15))', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }}
          animate={headerPulse.animate}><Users className="h-8 w-8" style={{ color: '#10b981' }} /></motion.div>
        <h2 className="text-xl font-black r62-heading-gradient">Pedido Familiar</h2>
        <p className="text-[11px] text-muted-foreground mt-1.5 max-w-[280px] mx-auto">Reúna sua família, montem o pedido juntos e economize na entrega</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        {([
          { icon: PackageOpen, label: 'Frete único', desc: '1 entrega para todos' },
          { icon: HandCoins, label: 'Economize', desc: 'Descontos em lote' },
          { icon: Clock, label: '30 min', desc: 'Tempo limitado' },
          { icon: Users, label: 'Até 10', desc: 'Membros por grupo' },
        ] as const).map((b) => (
          <motion.div key={b.label} variants={scaleIn} className="r62-card-lift flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/30 bg-background/60"
            whileHover={{ scale: 1.03 }} transition={{ type: sp, stiffness: 400, damping: 22 }}>
            <b.icon className="h-5 w-5 text-primary" />
            <span className="text-[11px] font-bold text-foreground">{b.label}</span>
            <span className="text-[9px] text-muted-foreground">{b.desc}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onCreate}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
          <Plus className="h-4 w-4" />Criar grupo familiar
        </motion.button>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onJoin}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-primary/30 text-xs font-bold text-primary active:scale-95 transition-transform">
          <UserPlus className="h-4 w-4" />Entrar com código
        </motion.button>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onDemo}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-semibold text-muted-foreground hover:bg-secondary/40 active:scale-95 transition-all">
          <Sparkles className="h-3.5 w-3.5" />Ver demonstração
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export function FamilyGroupOrder() {
  const hydrated = useHydrated()
  const [group, setGroup] = useState<FamilyGroup | null>(null)
  const [view, setView] = useState<ViewMode>('landing')
  const [init, setInit] = useState(false)

  useEffect(() => {
    if (!hydrated || init) return
    const saved = loadGroup()
    if (saved && Date.now() < saved.expiresAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGroup(saved); setView('active')
    }
    setInit(true)
  }, [hydrated, init])

  useEffect(() => { if (!hydrated || !init) return; void (group ? saveGroup(group) : clearGroup()) }, [group, hydrated, init])

  if (!hydrated) return <section className="r68-family-group-order"><Skeleton /></section>

  return (
    <motion.section className="r68-family-group-order rounded-2xl border border-border/40 bg-background/80 p-5"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: sp, stiffness: 260, damping: 22 }}>
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ type: sp, stiffness: 280, damping: 26 }}>
            <LandingView onCreate={() => setView('creating')} onJoin={() => setView('joining')} onDemo={() => { setGroup(getDemoGroup()); setView('active') }} />
          </motion.div>
        )}
        {view === 'creating' && (
          <motion.div key="creating" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ type: sp, stiffness: 280, damping: 26 }}>
            <CreateGroupView onCreate={g => { setGroup(g); setView('active') }} onBack={() => setView('landing')} />
          </motion.div>
        )}
        {view === 'joining' && (
          <motion.div key="joining" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ type: sp, stiffness: 280, damping: 26 }}>
            <JoinGroupView onJoin={g => { setGroup(g); setView('active') }} onBack={() => setView('landing')} />
          </motion.div>
        )}
        {view === 'active' && group && (
          <motion.div key="active" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ type: sp, stiffness: 280, damping: 26 }}>
            <ActiveGroupView group={group} onUpdate={setGroup} onLeave={() => { setGroup(null); setView('landing') }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
