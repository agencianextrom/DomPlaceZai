'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingDown, Target, Bell, BellOff, Mail, Smartphone, Clock, CheckCircle2,
  AlertCircle, Plus, Search, ChevronDown, Sparkles, History, SlidersHorizontal,
  BarChart3, PiggyBank, Calendar, Percent, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
type AlertStatus = 'ativo' | 'alcançado' | 'expirado'
type FilterTab = 'todos' | 'ativos' | 'alcançados' | 'expirados'
type SortOption = 'savings' | 'date' | 'discount'

interface TrackedProduct {
  id: string; name: string; store: string; category: string
  currentPrice: number; originalPrice: number; targetPrice: number
  priceHistory: number[]; status: AlertStatus; createdAt: string
  reachedAt?: string; savings: number; changePercent: number; emoji: string
}

interface AlertHistoryItem {
  id: string; productName: string; oldPrice: number; newPrice: number
  savings: number; date: string; emoji: string
}

interface NotificationSettings { push: boolean; email: boolean; sms: boolean }

/* ═══════════════════════════════════════════════════════════════
   Mock Data — 5 tracked products with different statuses
   ═══════════════════════════════════════════════════════════════ */
const MOCK_PRODUCTS: TrackedProduct[] = [
  { id: 't1', name: 'Azeite Extra Virgem Gallo 500ml', store: 'Supermercado Bom Preço', category: 'Alimentos', currentPrice: 32.90, originalPrice: 49.90, targetPrice: 35.00, priceHistory: [49.9,47.5,45,42.3,40.8,38.5,36.9,35.2,34.5,33.8,32.9,32.5,33.1,33,32.9], status: 'ativo', createdAt: '2024-11-15', savings: 0, changePercent: -34, emoji: '🫒' },
  { id: 't2', name: 'Notebook Samsung Galaxy Book2 15"', store: 'TechBR Oficial', category: 'Eletrônicos', currentPrice: 2499.00, originalPrice: 3199.00, targetPrice: 2600.00, priceHistory: [3199,3100,2999,2850,2750,2699,2599,2550,2499,2480,2499,2520,2510,2500,2499], status: 'alcançado', createdAt: '2024-10-20', reachedAt: '2024-12-02', savings: 700.0, changePercent: -22, emoji: '💻' },
  { id: 't3', name: 'Tênis Nike Air Max 90', store: 'Netshoes Oficial', category: 'Moda', currentPrice: 599.90, originalPrice: 899.90, targetPrice: 650.00, priceHistory: [899.9,875,850,820,799,780,760,740,720,700,680,650,620,610,599.9], status: 'alcançado', createdAt: '2024-11-01', reachedAt: '2024-12-10', savings: 300.0, changePercent: -33, emoji: '👟' },
  { id: 't4', name: 'Café Melitta Extra Forte 500g', store: 'Atacadão Express', category: 'Alimentos', currentPrice: 18.90, originalPrice: 24.90, targetPrice: 20.00, priceHistory: [24.9,24.5,23.9,23.2,22.8,22,21.5,21,20.5,20,19.8,19.5,19.2,19,18.9], status: 'ativo', createdAt: '2024-11-28', savings: 0, changePercent: -24, emoji: '☕' },
  { id: 't5', name: 'Smart TV LG OLED 55" C3', store: 'Magazine Luiza', category: 'Eletrônicos', currentPrice: 3899.00, originalPrice: 4299.00, targetPrice: 3500.00, priceHistory: [4299,4280,4250,4200,4150,4100,4050,4000,3950,3920,3900,3899,3899,3899,3899], status: 'expirado', createdAt: '2024-09-10', savings: 0, changePercent: -9, emoji: '📺' },
]

const MOCK_HISTORY: AlertHistoryItem[] = [
  { id: 'h1', productName: 'Notebook Samsung Galaxy Book2', oldPrice: 3199, newPrice: 2499, savings: 700, date: '2024-12-02', emoji: '💻' },
  { id: 'h2', productName: 'Tênis Nike Air Max 90', oldPrice: 899.9, newPrice: 599.9, savings: 300, date: '2024-12-10', emoji: '👟' },
  { id: 'h3', productName: 'Azeite Extra Virgem Gallo', oldPrice: 49.9, newPrice: 32.9, savings: 17, date: '2024-12-15', emoji: '🫒' },
]

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const formatDate = (s: string) => new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

const STATUS_MAP: Record<AlertStatus, { label: string; bg: string; text: string; border: string }> = {
  ativo: { label: 'Ativo', bg: 'rgba(34,197,94,0.12)', text: '#16a34a', border: 'rgba(34,197,94,0.25)' },
  'alcançado': { label: 'Alcançado', bg: 'rgba(59,130,246,0.12)', text: '#2563eb', border: 'rgba(59,130,246,0.25)' },
  expirado: { label: 'Expirado', bg: 'rgba(156,163,175,0.12)', text: '#6b7280', border: 'rgba(156,163,175,0.25)' },
}

function sparklinePath(data: number[]): string {
  if (data.length < 2) return ''
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const w = 80, h = 28, step = w / (data.length - 1)
  return `M ${data.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * (h - 4) - 2).toFixed(1)}`).join(' L ')}`
}

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */
const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 22 } },
  exit: { opacity: 0, y: -12, scale: 0.96, transition: { duration: 0.2 } },
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } },
}

/* ═══════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════ */

// ── Sparkline Chart (Feature 4) ──────────────────────────────────
function PriceSparkline({ data, isDown }: { data: number[]; isDown: boolean }) {
  const path = sparklinePath(data)
  if (!path) return null
  const c = isDown ? '#ef4444' : '#22c55e'
  const gid = isDown ? 'r48-spark-d' : 'r48-spark-u'
  return (
    <svg width={80} height={28} viewBox="0 0 80 28" className="shrink-0">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.3" />
          <stop offset="100%" stopColor={c} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${path} L 80,28 L 0,28 Z`} fill={`url(#${gid})`} />
    </svg>
  )
}

// ── Status Badge (Feature 1) ────────────────────────────────────
function StatusBadge({ status }: { status: AlertStatus }) {
  const s = STATUS_MAP[status]
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {status === 'ativo' && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
      {status === 'alcançado' && <CheckCircle2 className="h-3 w-3" />}
      {status === 'expirado' && <AlertCircle className="h-3 w-3" />}
      {s.label}
    </motion.span>
  )
}

// ── Animated Counter (Feature 5) ──────────────────────────────────
function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const dur = 1200
    function step(now: number) {
      const p = Math.min((now - start) / dur, 1)
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target])
  return <span className="tabular-nums">{count}</span>
}

// ── Savings Summary (Feature 5) ──────────────────────────────────
function SavingsSummary({ totalSavings }: { totalSavings: number }) {
  return (
    <motion.div variants={fadeUpVariants} className="relative overflow-hidden rounded-xl p-4 r62-card-lift"
      style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(59,130,246,0.08) 50%, rgba(168,85,247,0.06) 100%)', border: '1px solid rgba(34,197,94,0.15)', boxShadow: '0 4px 20px rgba(34,197,94,0.08)' }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)' }} />
      <div className="relative z-10 flex items-center gap-3">
        <motion.div className="h-10 w-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.15)' }}
          animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}>
          <PiggyBank className="h-5 w-5" style={{ color: '#16a34a' }} />
        </motion.div>
        <div>
          <p className="text-xs text-muted-foreground">Você economizou</p>
          <p className="text-lg font-bold" style={{ color: '#16a34a' }}>
            {formatBRL(totalSavings)} <span className="text-xs font-normal text-muted-foreground">com alertas</span>
          </p>
        </div>
        <AnimatedCounter target={Math.round(totalSavings)} />
      </div>
    </motion.div>
  )
}

// ── Alert Statistics (Feature 6) ──────────────────────────────────
function AlertStatistics({ products }: { products: TrackedProduct[] }) {
  const activeCount = products.filter(p => p.status === 'ativo').length
  const reachedCount = products.filter(p => p.status === 'alcançado').length
  const stats = [
    { value: `${activeCount} alertas ativos`, icon: Bell, color: '#22c55e' },
    { value: `${reachedCount} alcançados este mês`, icon: CheckCircle2, color: '#3b82f6' },
    { value: 'Tempo médio: 4 dias', icon: Clock, color: '#f59e0b' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {stats.map((st) => (
        <motion.div key={st.value} variants={fadeUpVariants}
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <st.icon className="h-4 w-4 mx-auto mb-1" style={{ color: st.color }} />
          <p className="text-[10px] text-muted-foreground leading-tight">{st.value}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ── Notification Toggles (Feature 7) ───────────────────────────────
function NotificationToggles({ settings, onToggle }: { settings: NotificationSettings; onToggle: (k: keyof NotificationSettings) => void }) {
  const toggles: { key: keyof NotificationSettings; label: string; icon: typeof Bell; desc: string }[] = [
    { key: 'push', label: 'Push', icon: Bell, desc: 'Notificações no app' },
    { key: 'email', label: 'Email', icon: Mail, desc: 'Alertas por email' },
    { key: 'sms', label: 'SMS', icon: Smartphone, desc: 'Mensagem de texto' },
  ]
  return (
    <div className="space-y-2">
      {toggles.map((t) => (
        <motion.div key={t.key} variants={fadeUpVariants}
          className="flex items-center justify-between rounded-lg p-2.5"
          style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ background: settings[t.key] ? 'rgba(59,130,246,0.12)' : 'rgba(156,163,175,0.12)' }}>
              <t.icon className="h-3.5 w-3.5" style={{ color: settings[t.key] ? '#2563eb' : '#9ca3af' }} />
            </div>
            <div>
              <p className="text-xs font-medium">{t.label}</p>
              <p className="text-[10px] text-muted-foreground">{t.desc}</p>
            </div>
          </div>
          <div className="min-h-[44px] flex items-center">
          <motion.button whileTap={{ scale: 0.92 }} onClick={() => onToggle(t.key)}
            className="relative h-6 w-11 rounded-full transition-colors"
            style={{ backgroundColor: settings[t.key] ? '#3b82f6' : '#d1d5db', boxShadow: settings[t.key] ? '0 2px 8px rgba(59,130,246,0.35)' : '0 1px 3px rgba(0,0,0,0.1)' }}
            aria-label={`Toggle ${t.label}`}>
            <motion.div className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
              animate={{ left: settings[t.key] ? 22 : 2 }}
              transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }} />
          </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Filter Tabs (Feature 10) ──────────────────────────────────────
function FilterTabs({ active, onChange }: { active: FilterTab; onChange: (t: FilterTab) => void }) {
  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'todos', label: 'Todos' }, { key: 'ativos', label: 'Ativos' },
    { key: 'alcançados', label: 'Alcançados' }, { key: 'expirados', label: 'Expirados' },
  ]
  return (
    <div className="relative flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
      {tabs.map((tab) => (
        <motion.button key={tab.key} whileTap={{ scale: 0.96 }} onClick={() => onChange(tab.key)}
          className="relative z-10 min-h-[44px] px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center"
          style={{ color: active === tab.key ? '#ffffff' : '#6b7280' }}>
          {tab.label}
          {active === tab.key && (
            <motion.div layoutId="r48-tab-indicator" className="absolute inset-0 rounded-lg"
              style={{ backgroundColor: '#3b82f6', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}
              transition={{ type: 'spring' as const, stiffness: 350, damping: 30 }} />
          )}
        </motion.button>
      ))}
    </div>
  )
}

// ── Sort Dropdown (Feature 11) ─────────────────────────────────────
function SortDropdown({ active, onChange }: { active: SortOption; onChange: (o: SortOption) => void }) {
  const [open, setOpen] = useState(false)
  const options: { key: SortOption; label: string; icon: typeof Calendar }[] = [
    { key: 'savings', label: 'Economia', icon: PiggyBank },
    { key: 'date', label: 'Data', icon: Calendar },
    { key: 'discount', label: 'Desconto', icon: Percent },
  ]
  return (
    <div className="relative">
      <motion.button whileTap={{ scale: 0.96 }} onClick={() => setOpen(!open)}
        className="min-h-[44px] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
        <SlidersHorizontal className="h-3 w-3" /> Ordenar
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="absolute right-0 top-full mt-1 z-50 rounded-xl p-1.5 min-w-[140px]"
            style={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            {options.map((opt) => (
              <motion.button key={opt.key} whileTap={{ scale: 0.97 }}
                onClick={() => { onChange(opt.key); setOpen(false) }}
                className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[11px] font-medium transition-colors"
                style={{ background: active === opt.key ? 'rgba(59,130,246,0.08)' : 'transparent', color: active === opt.key ? '#2563eb' : '#374151' }}>
                <opt.icon className="h-3.5 w-3.5" /> {opt.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Set Alert Dialog (Feature 2) ──────────────────────────────────
function SetAlertDialog({ onClose, onAdd }: { onClose: () => void; onAdd: (p: TrackedProduct) => void }) {
  const [query, setQuery] = useState('')
  const [targetPrice, setTargetPrice] = useState(50)
  const [selected, setSelected] = useState<number | null>(null)

  const catalog = [
    { id: 1, name: 'Cerveja Heineken Lata 350ml', price: 3.99, emoji: '🍺' },
    { id: 2, name: 'Detergente Ypê 500ml', price: 2.49, emoji: '🧴' },
    { id: 3, name: 'Chocolate Nescau 400g', price: 12.90, emoji: '🍫' },
  ]
  const results = useMemo(() => query.trim() ? catalog.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : [], [query])

  const handleAdd = () => {
    const found = catalog.find(r => r.id === selected)
    onAdd({
      id: `t-new-${Date.now()}`, name: found?.name || 'Novo Produto', store: 'Loja Monitorada',
      category: 'Geral', currentPrice: found?.price || 50, originalPrice: 80, targetPrice,
      priceHistory: [80,75,70,65,60,58,55,53,51,50], status: 'ativo',
      createdAt: new Date().toISOString().split('T')[0] as string, savings: 0, changePercent: -15,
      emoji: found?.emoji || '📦',
    })
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
              <Target className="h-4 w-4" style={{ color: '#2563eb' }} />
            </div>
            <h3 className="text-sm font-bold">Criar Alerta de Preço</h3>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
            className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)' }}>
            <X className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Search (Feature 2) */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Buscar produto..." value={query} onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-lg" />
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
              {results.map((p) => (
                <motion.button key={p.id} whileTap={{ scale: 0.98 }} onClick={() => setSelected(p.id)}
                  className="flex items-center gap-2.5 w-full p-2.5 rounded-lg text-left transition-colors"
                  style={{ background: selected === p.id ? 'rgba(59,130,246,0.08)' : 'rgba(0,0,0,0.02)', border: selected === p.id ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent' }}>
                  <span className="text-lg">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatBRL(p.price)}</p>
                  </div>
                  {selected === p.id && <CheckCircle2 className="h-4 w-4" style={{ color: '#2563eb' }} />}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Target Price Animated Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Preço-alvo</label>
            <motion.span className="text-xs font-bold" key={targetPrice}
              initial={{ scale: 1.2 }} animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              style={{ color: '#2563eb' }}>{formatBRL(targetPrice)}</motion.span>
          </div>
          <input type="range" min={0} max={200} step={5} value={targetPrice}
            onChange={(e) => setTargetPrice(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer r48-slider"
            style={{ background: `linear-gradient(to right, rgba(59,130,246,0.4) ${((targetPrice / 200) * 100).toFixed(0)}%, rgba(0,0,0,0.08) ${((targetPrice / 200) * 100).toFixed(0)}%)` }} />
          <div className="flex justify-between text-[10px] text-muted-foreground"><span>R$ 0</span><span>R$ 200</span></div>
        </div>

        {/* Notification preference */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <Bell className="h-3.5 w-3.5" style={{ color: '#3b82f6' }} />
          <span className="text-[11px] text-muted-foreground">Notificar quando o preço atingir o valor</span>
        </div>

        {/* Action — shadcn Button wrapped in motion.div */}
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button onClick={handleAdd} disabled={selected === null}
            className="w-full h-9 rounded-lg text-xs font-semibold r48-create-btn">
            <Plus className="h-3.5 w-3.5" /> Criar Alerta
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ── Alert History Timeline (Feature 9) ────────────────────────────
function AlertHistoryTimeline({ items }: { items: AlertHistoryItem[] }) {
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <motion.div key={item.id} variants={fadeUpVariants} className="flex gap-3 pb-3 relative">
          {i < items.length - 1 && (
            <div className="absolute left-[11px] top-6 bottom-0 w-px" style={{ backgroundColor: 'rgba(59,130,246,0.15)' }} />
          )}
          <div className="relative z-10 mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle2 className="h-3 w-3" style={{ color: '#16a34a' }} />
          </div>
          <div className="flex-1 min-w-0 rounded-lg p-2.5"
            style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span>{item.emoji}</span>
                <p className="text-[11px] font-medium truncate">{item.productName}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{formatDate(item.date)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-muted-foreground line-through">{formatBRL(item.oldPrice)}</span>
              <span className="text-[10px] font-medium" style={{ color: '#16a34a' }}>{formatBRL(item.newPrice)}</span>
              <Badge className="h-4 px-1 text-[8px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0">
                {formatBRL(item.savings)} economizado
              </Badge>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Tracked Product Card (Features 1, 3, 4) ──────────────────────
function TrackedProductCard({ product }: { product: TrackedProduct }) {
  const isDown = product.changePercent < 0
  const dropColor = Math.abs(product.changePercent) >= 25 ? '#ef4444' : Math.abs(product.changePercent) >= 15 ? '#f59e0b' : '#22c55e'

  return (
    <motion.div variants={cardVariants}
      whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
      className="rounded-xl p-3 relative overflow-hidden group"
      style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <motion.div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-base"
              style={{ background: 'rgba(0,0,0,0.04)' }}
              animate={isDown ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}>
              {product.emoji}
            </motion.div>
            <div className="min-w-0">
              <p className="text-xs font-semibold line-clamp-1 group-hover:text-blue-600 transition-colors">{product.name}</p>
              <p className="text-[10px] text-muted-foreground">{product.store}</p>
            </div>
          </div>
          <StatusBadge status={product.status} />
        </div>

        {/* Prices + drop badge (Feature 3) */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold">{formatBRL(product.currentPrice)}</span>
            <span className="text-[10px] text-muted-foreground line-through">{formatBRL(product.originalPrice)}</span>
          </div>
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const }}
            className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold"
            style={{ backgroundColor: isDown ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: dropColor, border: `1px solid ${isDown ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}` }}>
            <TrendingDown className="h-3 w-3" /> {product.changePercent}% ⬇️
          </motion.div>
        </div>

        {/* Target + Sparkline (Feature 4) */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <Target className="h-3 w-3" style={{ color: '#3b82f6' }} />
            <span className="text-[10px] text-muted-foreground">Alvo: <span className="font-semibold" style={{ color: '#2563eb' }}>{formatBRL(product.targetPrice)}</span></span>
          </div>
          <PriceSparkline data={product.priceHistory} isDown={isDown} />
        </div>

        {/* Savings for reached */}
        {product.status === 'alcançado' && product.savings > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <Sparkles className="h-3 w-3" style={{ color: '#16a34a' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#16a34a' }}>Economia: {formatBRL(product.savings)}</span>
          </motion.div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {product.status === 'alcançado' && product.reachedAt
                ? `Alcançado ${formatDate(product.reachedAt)}`
                : `Desde ${formatDate(product.createdAt)}`}
            </span>
          </div>
          <motion.button whileTap={{ scale: 0.9 }}
            className="h-6 w-6 min-h-[44px] min-w-[44px] rounded-md flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.04)' }} aria-label="Opções">
            <BarChart3 className="h-3 w-3 text-muted-foreground" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — PriceDropAlertEnhanced (Feature 12: staggered entrance)
   ═══════════════════════════════════════════════════════════════ */
export default function PriceDropAlertEnhanced() {
  const [products, setProducts] = useState<TrackedProduct[]>(MOCK_PRODUCTS)
  const [filter, setFilter] = useState<FilterTab>('todos')
  const [sort, setSort] = useState<SortOption>('savings')
  const [showDialog, setShowDialog] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [notifications, setNotifications] = useState<NotificationSettings>({ push: true, email: true, sms: false })
  const [quickAdding, setQuickAdding] = useState(false)

  /* Filter & Sort (Features 10, 11) */
  const filtered = useMemo(() => {
    let r = [...products]
    if (filter === 'ativos') r = r.filter(p => p.status === 'ativo')
    if (filter === 'alcançados') r = r.filter(p => p.status === 'alcançado')
    if (filter === 'expirados') r = r.filter(p => p.status === 'expirado')
    if (sort === 'savings') r.sort((a, b) => b.savings - a.savings)
    if (sort === 'date') r.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (sort === 'discount') r.sort((a, b) => Math.abs(a.changePercent) - Math.abs(b.changePercent))
    return r
  }, [products, filter, sort])

  const totalSavings = useMemo(() => products.reduce((s, p) => s + p.savings, 0), [products])

  const toggleNotif = useCallback((k: keyof NotificationSettings) => {
    setNotifications(p => ({ ...p, [k]: !p[k] }))
  }, [])

  const handleAddProduct = useCallback((p: TrackedProduct) => {
    setProducts(prev => [p, ...prev])
  }, [])

  /* Quick Add simulation (Feature 8) */
  const handleQuickAdd = useCallback(() => {
    setQuickAdding(true)
    setTimeout(() => {
      setProducts(prev => [{
        id: `t-q-${Date.now()}`, name: 'Leite Integral Parmalat 1L', store: 'Mercado do Zé',
        category: 'Alimentos', currentPrice: 5.49, originalPrice: 7.90, targetPrice: 5.50,
        priceHistory: [7.9,7.5,7,6.5,6,5.8,5.6,5.5,5.49,5.49], status: 'ativo',
        createdAt: new Date().toISOString().split('T')[0] as string,
        savings: 0, changePercent: -31, emoji: '🥛',
      }, ...prev])
      setQuickAdding(false)
    }, 800)
  }, [])

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="space-y-4 r48-price-monitor">

      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(59,130,246,0.15) 100%)', boxShadow: '0 4px 12px rgba(239,68,68,0.12)' }}
            animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const }}>
            <TrendingDown className="h-4.5 w-4.5" style={{ color: '#ef4444' }} />
          </motion.div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-1.5 r62-heading-gradient">
              Monitoramento de Preços
              <Badge variant="secondary" className="text-[9px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30 font-bold">
                {products.length} produtos
              </Badge>
            </h2>
            <p className="text-[10px] text-muted-foreground">Configure alertas e acompanhe quedas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* shadcn Buttons wrapped in motion.div */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}
              className="h-8 min-h-[44px] px-3 text-[11px] rounded-lg gap-1.5 r48-history-btn">
              <History className="h-3.5 w-3.5" /> Histórico
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button size="sm" onClick={() => setShowDialog(true)}
              className="h-8 min-h-[44px] px-3 text-[11px] rounded-lg gap-1.5 r48-add-btn">
              <Plus className="h-3.5 w-3.5" /> Novo Alerta
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ═══ Savings Summary (Feature 5) ═══ */}
      <SavingsSummary totalSavings={totalSavings} />

      {/* ═══ Statistics (Feature 6) ═══ */}
      <AlertStatistics products={products} />

      {/* ═══ Filter & Sort (Features 10, 11) ═══ */}
      <div className="flex items-center justify-between gap-3">
        <FilterTabs active={filter} onChange={setFilter} />
        <SortDropdown active={sort} onChange={setSort} />
      </div>

      {/* ═══ Tracked Product Cards (Feature 12: staggered entrance) ═══ */}
      <motion.div variants={containerVariants} initial="hidden" whileInView="visible"
        viewport={{ once: true, margin: '-40px' }} className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <TrackedProductCard key={p.id} product={p} />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-8 text-center">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
              className="h-12 w-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(59,130,246,0.1)' }}>
              <BellOff className="h-5 w-5" style={{ color: '#6b7280' }} />
            </motion.div>
            <p className="text-xs font-medium text-muted-foreground">Nenhum alerta nesta categoria</p>
            <p className="text-[10px] text-muted-foreground mt-1">Crie um novo alerta para começar</p>
          </motion.div>
        )}
      </motion.div>

      {/* ═══ Quick Add (Feature 8) ═══ */}
      <motion.div variants={fadeUpVariants} className="relative overflow-hidden rounded-xl p-3"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(59,130,246,0.08) 100%)', border: '1px dashed rgba(59,130,246,0.25)' }}>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button variant="ghost" onClick={handleQuickAdd} disabled={quickAdding}
            className="w-full h-10 text-xs font-medium gap-2 r48-quick-add">
            <AnimatePresence mode="wait">
              {quickAdding ? (
                <motion.span key="loading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' as const }}>
                    <Sparkles className="h-3.5 w-3.5" />
                  </motion.div>
                  Monitorando produto...
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5" /> Monitorar produto
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>

      {/* ═══ Notification Settings (Feature 7) ═══ */}
      <motion.div variants={fadeUpVariants} className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold">Canais de Notificação</span>
        </div>
        <NotificationToggles settings={notifications} onToggle={toggleNotif} />
      </motion.div>

      {/* ═══ Alert History (Feature 9) ═══ */}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring' as const, stiffness: 260, damping: 25 }} className="overflow-hidden">
            <div className="rounded-xl p-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" style={{ color: '#3b82f6' }} />
                <span className="text-xs font-bold">Histórico de Alertas</span>
              </div>
              <AlertHistoryTimeline items={MOCK_HISTORY} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Set Alert Dialog (Feature 2) ═══ */}
      <AnimatePresence>
        {showDialog && <SetAlertDialog onClose={() => setShowDialog(false)} onAdd={handleAddProduct} />}
      </AnimatePresence>
    </motion.section>
  )
}
