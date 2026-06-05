'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw, ShoppingCart, Star, Clock, Zap, Package, ChevronRight, Check,
  Plus, Minus, CalendarClock, TrendingUp, Heart, Sparkles, ArrowRight,
  X, AlertCircle, ShoppingBag, History, Layers, Calculator, Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/useAppStore'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

type Freq = 'daily' | 'weekly' | 'monthly' | 'occasional'

interface ReorderItem {
  id: string; productId: string; name: string; price: number
  comparePrice: number | null; image: string | null
  storeName: string; storeId: string; lastOrderedAt: string
  frequency: Freq; orderCount: number; quantity: number
  isFavorite: boolean; autoReorder: boolean
}

interface Bundle { id: string; title: string; description: string; items: ReorderItem[]; savings: number; confidence: number }
interface HistoryEntry { id: string; timestamp: string; itemNames: string[]; total: number; itemCount: number }
interface AutoConfig { enabled: boolean; frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'; nextDate: string | null; itemIds: string[] }

/* ═══════════════════════════════════════════════════════════════
   Constants & Helpers
   ═══════════════════════════════════════════════════════════════ */

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const freqMap: Record<Freq, { label: string; cls: string; icon: React.ElementType }> = {
  daily:     { label: 'Diário',    cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Zap },
  weekly:    { label: 'Semanal',   cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',       icon: CalendarClock },
  monthly:   { label: 'Mensal',    cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Timer },
  occasional:{ label: 'Ocasional', cls: 'bg-muted text-muted-foreground',                                             icon: Package },
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'Agora'
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const days = Math.floor(h / 24)
  return days === 1 ? 'Ontem' : `${days} dias`
}

/* ═══════════════════════════════════════════════════════════════
   localStorage
   ═══════════════════════════════════════════════════════════════ */

function loadSet(key: string): Set<string> {
  try { const s = localStorage.getItem(key); return s ? new Set<string>(JSON.parse(s)) : new Set<string>() } catch { return new Set<string>() }
}
function saveSet(key: string, s: Set<string>) { try { localStorage.setItem(key, JSON.stringify([...s])) } catch { /* */ } }
function loadAuto(): AutoConfig {
  try { const s = localStorage.getItem('domplace-reorder-auto'); return s ? JSON.parse(s) : { enabled: false, frequency: 'weekly' as const, nextDate: null, itemIds: [] } } catch { return { enabled: false, frequency: 'weekly' as const, nextDate: null, itemIds: [] } }
}
function saveAuto(c: AutoConfig) { try { localStorage.setItem('domplace-reorder-auto', JSON.stringify(c)) } catch { /* */ } }

/* ═══════════════════════════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════════════════════════ */

function mkItems(): ReorderItem[] {
  const ago = (d: number) => new Date(Date.now() - d * 86400000).toISOString()
  return [
    { id: 'ri-1', productId: 'p1', name: 'Arroz Tio João 5kg',      price: 24.90, comparePrice: 29.90, image: '/images/grocery.jpg',    storeName: 'Mercado do Zé',     storeId: 's1', lastOrderedAt: ago(2),  frequency: 'weekly',    orderCount: 12, quantity: 1, isFavorite: true,  autoReorder: false },
    { id: 'ri-2', productId: 'p2', name: 'Leite Integral 1L',        price: 5.99,  comparePrice: null,   image: null,                      storeName: 'Mercado do Zé',     storeId: 's1', lastOrderedAt: ago(1),  frequency: 'daily',     orderCount: 28, quantity: 3, isFavorite: true,  autoReorder: true  },
    { id: 'ri-3', productId: 'p5', name: 'Açaí 500ml',               price: 15.00, comparePrice: 18.00, image: '/images/acai.jpg',       storeName: 'Açaí da Boa',       storeId: 's2', lastOrderedAt: ago(3),  frequency: 'weekly',    orderCount: 8,  quantity: 2, isFavorite: false, autoReorder: false },
    { id: 'ri-4', productId: 'p17',name: 'Pão Francês (6 un)',       price: 6.00,  comparePrice: null,   image: '/images/bakery.jpg',     storeName: 'Padaria Pão Quente', storeId: 's5', lastOrderedAt: ago(0.5),frequency: 'daily',     orderCount: 35, quantity: 2, isFavorite: true,  autoReorder: false },
    { id: 'ri-5', productId: 'p13',name: 'Vitamina C 500mg',         price: 35.00, comparePrice: 42.00, image: '/images/pharmacy.jpg',   storeName: 'Farmácia Vida',     storeId: 's4', lastOrderedAt: ago(15), frequency: 'monthly',   orderCount: 4,  quantity: 1, isFavorite: false, autoReorder: false },
    { id: 'ri-6', productId: 'p3', name: 'Óleo de Soja 900ml',       price: 7.49,  comparePrice: 8.99,  image: null,                      storeName: 'Mercado do Zé',     storeId: 's1', lastOrderedAt: ago(7),  frequency: 'monthly',   orderCount: 6,  quantity: 2, isFavorite: false, autoReorder: false },
  ]
}

function mkBundles(items: ReorderItem[]): Bundle[] {
  const g = (id: string) => items.find(i => i.id === id)
  return [
    { id: 'b1', title: 'Café da Manhã Completo', description: 'Você costuma pedir pão + açaí juntos', items: [g('ri-4')!, g('ri-3')!].filter(Boolean), savings: 3.5, confidence: 92 },
    { id: 'b2', title: 'Kit Mercado Básico',    description: 'Arroz, leite e óleo — sua compra semanal', items: [g('ri-1')!, g('ri-2')!, g('ri-6')!].filter(Boolean), savings: 5.2, confidence: 87 },
  ]
}

function mkHistory(): HistoryEntry[] {
  const ago = (d: number) => new Date(Date.now() - d * 86400000).toISOString()
  return [
    { id: 'h1', timestamp: ago(0.5), itemNames: ['Pão Francês (6 un)', 'Leite Integral 1L'], total: 29.97, itemCount: 5 },
    { id: 'h2', timestamp: ago(2),   itemNames: ['Arroz Tio João 5kg', 'Feijão Carioca 1kg'], total: 33.80, itemCount: 3 },
    { id: 'h3', timestamp: ago(5),   itemNames: ['Açaí 500ml'],                               total: 15.00, itemCount: 2 },
    { id: 'h4', timestamp: ago(9),   itemNames: ['Vitamina C 500mg'],                         total: 35.00, itemCount: 1 },
  ]
}

/* ═══════════════════════════════════════════════════════════════
   Shimmer style injector
   ═══════════════════════════════════════════════════════════════ */

function ShimmerCSS() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes r52-shimmer-sweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
      .r52-reorder-shimmer-btn { position:relative;overflow:hidden; }
      .r52-reorder-shimmer-btn::after { content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);animation:r52-shimmer-sweep 2s ease-in-out infinite; }
    ` }} />
  )
}

/* ═══════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════ */

function FreqBadge({ freq }: { freq: Freq }) {
  const c = freqMap[freq]; const Ic = c.icon
  return (
    <span className={`r52-reorder-freq-badge ${c.cls} text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1`}>
      <Ic className="h-2.5 w-2.5" />{c.label}
    </span>
  )
}

function StarBtn({ on, toggle }: { on: boolean; toggle: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.8 }} onClick={toggle}
      className="r52-reorder-star-btn p-1 rounded-lg hover:bg-muted/50 transition-colors">
      <motion.div animate={on ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : { scale: 1 }}
        transition={{ duration: 0.35 }}>
        <Star className={`h-4 w-4 transition-colors ${on ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/40'}`} />
      </motion.div>
    </motion.button>
  )
}

function QtyStepper({ qty, inc, dec }: { qty: number; inc: () => void; dec: () => void }) {
  return (
    <div className="flex items-center gap-1 r52-reorder-qty">
      <motion.button whileTap={{ scale: 0.85 }} onClick={dec}
        className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-md bg-muted/60 hover:bg-muted flex items-center justify-center active:scale-95 transition-transform"><Minus className="h-3 w-3" /></motion.button>
      <span className="w-7 text-center text-xs font-bold tabular-nums">{qty}</span>
      <motion.button whileTap={{ scale: 0.85 }} onClick={inc}
        className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-md bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center active:scale-95 transition-transform"><Plus className="h-3 w-3" /></motion.button>
    </div>
  )
}

/* ─── Success Animation ─── */
function SuccessAnim({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/30">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 15, delay: 0.1 }} className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
              <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.2 }}>
                <Check className="h-5 w-5 text-white" />
              </motion.div>
            </div>
            <motion.div animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ duration: 0.8, repeat: 1 }} className="absolute inset-0 rounded-full border-2 border-emerald-400" />
          </motion.div>
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Adicionado ao carrinho!</p>
            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">Continuando suas compras...</p>
          </div>
          <motion.div initial={{ x: 0, opacity: 1 }} animate={{ x: 20, opacity: 0 }} transition={{ delay: 0.8, duration: 0.5 }}>
            <ShoppingCart className="h-5 w-5 text-emerald-500" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 sm:p-14 flex flex-col items-center justify-center text-center">
      <motion.div animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} className="relative r52-reorder-empty-icon">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-primary/30" />
        </div>
        {[0,1,2,3].map(i => (
          <motion.div key={i} className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: ['rgba(16,185,129,0.3)','rgba(59,130,246,0.3)','rgba(168,85,247,0.3)','rgba(245,158,11,0.3)'][i] }}
            animate={{ y: [0,-12-i*4,0], x: [0, i%2===0?8:-8,0], scale: [0.7,1,0.7], opacity: [0.3,0.8,0.3] }}
            transition={{ duration: 2.5+i*0.3, repeat: Infinity, delay: i*0.4, ease: 'easeInOut' }} />
        ))}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-4 rounded-full border border-dashed border-primary/15" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-base font-bold mt-5 r52-reorder-empty-title">Nenhum reorder ainda</h3>
        <p className="text-xs text-muted-foreground mt-2 max-w-[260px] mx-auto r52-reorder-empty-desc">
          Comece a comprar e seus produtos frequentes aparecerão aqui para reordenar com um toque
        </p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="sm" className="mt-5 gap-1.5 text-xs border-primary/30 hover:bg-primary/5"
            onClick={() => useAppStore.getState().openSearch()}>
            <Package className="h-3.5 w-3.5" />Explorar produtos
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ─── Skeleton ─── */
function LoadingSk() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Skeleton className="h-8 w-8 rounded-xl" /><Skeleton className="h-5 w-36" /></div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 p-3 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-3 w-20" /></div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex items-center justify-between"><Skeleton className="h-5 w-14" /><Skeleton className="h-8 w-24 rounded-lg" /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Reorder Item Card ─── */
function ItemCard({ item, idx, onReorder, onFav, onQty, onAuto, successId, budgetMode }: {
  item: ReorderItem; idx: number; onReorder: (i: ReorderItem) => void; onFav: (id: string) => void
  onQty: (id: string, q: number) => void; onAuto: (id: string) => void; successId: string | null; budgetMode: boolean
}) {
  const ok = successId === item.id
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 280, damping: 22 }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
      className={`r52-reorder-card rounded-xl border bg-card overflow-hidden transition-all group ${
        item.isFavorite ? 'ring-1 ring-amber-400/30' : ''} ${budgetMode ? 'ring-1 ring-primary/30 bg-primary/[0.03]' : ''} ${
        item.autoReorder ? 'ring-1 ring-emerald-400/20' : ''} border-border/60`}>
      {item.autoReorder && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }}
        transition={{ delay: 0.3+idx*0.05, duration: 0.4 }} className="h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400" />}
      <div className="p-3 space-y-2.5">
        <div className="flex items-start gap-2.5">
          <div className="relative h-14 w-14 rounded-lg bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center shrink-0 overflow-hidden r52-reorder-thumb">
            {item.image ? <motion.img src={item.image} alt={item.name} className="h-full w-full object-cover" whileHover={{ scale: 1.08 }} /> : <span className="text-2xl">🛒</span>}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.4+idx*0.06, type: 'spring' as const, stiffness: 350, damping: 20 }}
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center shadow-sm border-2 border-card">
              {item.orderCount}x
            </motion.div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold truncate leading-tight r52-reorder-name">{item.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate r52-reorder-store">{item.storeName}</p>
              </div>
              <StarBtn on={item.isFavorite} toggle={() => onFav(item.id)} />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <FreqBadge freq={item.frequency} />
              <div className="text-right">
                <span className="text-xs font-bold r52-reorder-price">{fmt(item.price)}</span>
                {item.comparePrice && item.comparePrice > item.price && <span className="block text-[9px] text-muted-foreground line-through">{fmt(item.comparePrice)}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <QtyStepper qty={item.quantity} inc={() => onQty(item.id, item.quantity+1)} dec={() => onQty(item.id, Math.max(1, item.quantity-1))} />
          <div className="flex-1" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onAuto(item.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold transition-all r52-reorder-auto-btn ${
              item.autoReorder ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'}`}>
            <motion.div animate={item.autoReorder ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.5 }}>
              <CalendarClock className="h-3 w-3" />
            </motion.div>{item.autoReorder ? 'Auto ON' : 'Auto'}
          </motion.button>
        </div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <button onClick={() => onReorder(item)} disabled={ok}
            className={`w-full h-9 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all r52-reorder-btn ${
              ok ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90 r52-reorder-shimmer-btn'}`}>
            <AnimatePresence mode="wait">
              {ok ? (
                <motion.span key="ok" initial={{ opacity:0,scale:0.5 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.5 }} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />Adicionado!
                </motion.span>
              ) : (
                <motion.span key="re" initial={{ opacity:0,scale:0.5 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.5 }} className="flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" />Reorder
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground"><Clock className="h-2.5 w-2.5" /><span>Último: {timeAgo(item.lastOrderedAt)}</span></div>
      </div>
    </motion.div>
  )
}

/* ─── Bundle Card ─── */
function BundleCard({ bundle, idx, onAll, budgetMode }: { bundle: Bundle; idx: number; onAll: (items: ReorderItem[]) => void; budgetMode: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3+idx*0.1, type: 'spring' as const, stiffness: 260, damping: 22 }}
      whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}
      className={`r52-reorder-bundle rounded-xl border bg-card overflow-hidden ${budgetMode ? 'border-primary/30 ring-1 ring-primary/20' : 'border-primary/20'}`}>
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/15 to-emerald-500/15 flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold">{bundle.title}</h4>
              <Badge variant="secondary" className="text-[8px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">{bundle.confidence}%</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{bundle.description}</p>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4+idx*0.1 }}
          className="mt-2.5 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
          <Sparkles className="h-3 w-3 text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Economia de {fmt(bundle.savings)}</span>
        </motion.div>
        <AnimatePresence>{open && (
          <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }} className="overflow-hidden">
            <div className="mt-2 space-y-1.5">{bundle.items.map(i => (
              <div key={i.id} className="flex items-center justify-between text-[10px] bg-muted/30 rounded-lg px-2.5 py-1.5">
                <span className="font-medium truncate">{i.name}</span><span className="text-muted-foreground font-semibold ml-2">{fmt(i.price)}</span>
              </div>
            ))}</div>
          </motion.div>
        )}</AnimatePresence>
        <div className="flex items-center gap-2 mt-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setOpen(!open)}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">
            {open ? 'Ocultar' : 'Ver itens'}
            <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}><ChevronRight className="h-3 w-3" /></motion.div>
          </motion.button>
          <div className="flex-1" />
          <motion.div whileTap={{ scale: 0.95 }}>
            <button onClick={() => onAll(bundle.items)}
              className="h-8 min-h-[44px] px-4 rounded-lg bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all">
              <ShoppingCart className="h-3.5 w-3.5" />Reorder All
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Timeline Entry ─── */
function TimelineItem({ entry, idx }: { entry: HistoryEntry; idx: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx*0.08, type: 'spring' as const, stiffness: 300, damping: 24 }}
      className="relative pl-6 pb-4 last:pb-0 r52-reorder-timeline-entry">
      <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border/40" />
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.1+idx*0.08, type: 'spring' as const, stiffness: 400, damping: 18 }}
        className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center z-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25+idx*0.08 }}
          className="h-1.5 w-1.5 rounded-full bg-primary" />
      </motion.div>
      <div className="rounded-lg bg-muted/30 p-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5"><History className="h-3 w-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">{timeAgo(entry.timestamp)}</span></div>
          <span className="text-xs font-bold">{fmt(entry.total)}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1 flex-wrap">
          {entry.itemNames.slice(0,2).map((n,i) => <span key={i} className="text-[9px] bg-secondary/60 text-muted-foreground px-1.5 py-0.5 rounded-full">{n.length>20?n.slice(0,20)+'...':n}</span>)}
          <span className="text-[9px] text-muted-foreground">{entry.itemCount} {entry.itemCount===1?'item':'itens'}</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Budget Impact Preview ─── */
function BudgetPreview({ items, qtys, close }: { items: ReorderItem[]; qtys: Record<string,number>; close: () => void }) {
  const total = items.reduce((s,i) => s+i.price*(qtys[i.id]||i.quantity), 0)
  const savings = items.reduce((s,i) => s+((i.comparePrice&&i.comparePrice>i.price)?(i.comparePrice-i.price)*(qtys[i.id]||i.quantity):0), 0)
  return (
    <motion.div initial={{ opacity:0,y:12,scale:0.97 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:-8,scale:0.97 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
      className="rounded-xl border border-primary/20 bg-card p-4 r52-reorder-budget-preview">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /><h4 className="text-xs font-bold">Impacto no Orçamento</h4></div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={close} className="h-6 w-6 min-h-[44px] min-w-[44px] rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center active:scale-95 transition-transform"><X className="h-3 w-3" /></motion.button>
      </div>
      <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
        {items.map(i => { const q=qtys[i.id]||i.quantity; return (
          <div key={i.id} className="flex items-center justify-between text-[10px] py-1 border-b border-border/20 last:border-0">
            <div className="flex items-center gap-2 min-w-0"><span className="text-muted-foreground font-semibold">{q}x</span><span className="truncate font-medium">{i.name}</span></div>
            <span className="font-bold shrink-0 ml-2">{fmt(i.price*q)}</span>
          </div>
        )})}
      </div>
      <div className="border-t border-border/30 pt-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total estimado</span>
          <span className="text-base font-bold text-primary">{fmt(total)}</span>
        </div>
        {savings > 0 && (
          <motion.div initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }}
            className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-2.5 py-1.5">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Economia de {fmt(savings)}</span>
          </motion.div>
        )}
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground"><AlertCircle className="h-3 w-3" /><span>Pode variar com taxas de entrega</span></div>
      </div>
    </motion.div>
  )
}

/* ─── Auto-Reorder Panel ─── */
function AutoPanel({ cfg, items, onToggle, onFreq }: { cfg: AutoConfig; items: ReorderItem[]; onToggle: () => void; onFreq: (f: AutoConfig['frequency']) => void }) {
  const freqOpts: { v: AutoConfig['frequency']; l: string }[] = [
    { v: 'daily', l: 'Diário' }, { v: 'weekly', l: 'Semanal' }, { v: 'biweekly', l: 'Quinzenal' }, { v: 'monthly', l: 'Mensal' }
  ]
  const autoItems = items.filter(i => i.autoReorder)
  const autoTotal = autoItems.reduce((s,i) => s+i.price*i.quantity, 0)
  return (
    <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="rounded-xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-900/10 p-4 r52-reorder-auto-panel">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm"><CalendarClock className="h-4 w-4 text-white" /></div>
          <div><h4 className="text-xs font-bold">Auto-Reorder</h4><p className="text-[9px] text-muted-foreground">Reordenar automaticamente</p></div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onToggle}
          className={`relative h-6 w-11 rounded-full transition-colors ${cfg.enabled ? 'bg-emerald-500' : 'bg-muted'}`}>
          <motion.div animate={{ x: cfg.enabled ? 20 : 2 }} transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
            className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
        </motion.button>
      </div>
      <AnimatePresence>{cfg.enabled && (
        <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }} className="overflow-hidden">
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Frequência</p>
            <div className="flex gap-1">{freqOpts.map(o => (
              <motion.button key={o.v} whileTap={{ scale: 0.9 }} onClick={() => onFreq(o.v)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                  cfg.frequency===o.v ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-background text-muted-foreground border-border/50 hover:border-emerald-500/30'}`}>{o.l}</motion.button>
            ))}</div>
          </div>
          {autoItems.length > 0 && (
            <div className="bg-background/60 rounded-lg p-2.5 border border-border/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground">{autoItems.length} {autoItems.length===1?'item':'itens'} no auto</span>
                <span className="text-xs font-bold text-primary">{fmt(autoTotal)}/pedido</span>
              </div>
              <div className="flex flex-wrap gap-1">{autoItems.map(i => (
                <span key={i.id} className="text-[9px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                  {i.name.length>18?i.name.slice(0,18)+'...':i.name}
                </span>
              ))}</div>
            </div>
          )}
          {cfg.nextDate && (
            <div className="mt-2 flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <Timer className="h-3 w-3" /><span>Próximo: {new Date(cfg.nextDate).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </motion.div>
      )}</AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export function QuickReorderHub() {
  const { currentUser, addToCart, navigate } = useAppStore()
  const [items, setItems] = useState<ReorderItem[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [favs, setFavs] = useState<Set<string>>(new Set())
  const [autoCfg, setAutoCfg] = useState<AutoConfig>(loadAuto)
  const [qtys, setQtys] = useState<Record<string, number>>({})
  const [successId, setSuccessId] = useState<string | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [budgetMode, setBudgetMode] = useState(false)
  const [tab, setTab] = useState<'buy'|'bundles'|'history'|'auto'>('buy')
  const [showBudget, setShowBudget] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Init mock data
  useEffect(() => {
    const t = setTimeout(() => {
      const mi = mkItems()
      setItems(mi); setBundles(mkBundles(mi)); setHistory(mkHistory())
      setFavs(loadSet('domplace-reorder-favs'))
      const q: Record<string,number> = {}; mi.forEach(i => { q[i.id] = i.quantity }); setQtys(q)
      setLoading(false)
    }, 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const selTotal = useMemo(() => items.reduce((s,i) => s+i.price*(qtys[i.id]||i.quantity), 0), [items,qtys])

  const flash = useCallback((id: string | null) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setSuccessId(id); setShowBanner(!!id)
    if (id) timerRef.current = setTimeout(() => { setShowBanner(false); setSuccessId(null) }, 2200)
  }, [])

  const addCart = useCallback((item: ReorderItem) => {
    addToCart({
      id: item.productId, storeId: item.storeId, storeName: item.storeName, name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g,'-'), description: null, price: item.price,
      comparePrice: item.comparePrice, images: item.image ? JSON.stringify([item.image]) : '[]',
      stock: 50, rating: 4.5, totalReviews: 10, isFeatured: false, isNew: false, isOffer: false,
      tags: '[]', variations: null, category: 'FOOD',
    }, item.storeName, qtys[item.id] || item.quantity)
  }, [addToCart, qtys])

  const handleReorder = useCallback((item: ReorderItem) => {
    addCart(item); flash(item.id)
    setHistory(p => [{ id: `rh-${Date.now()}`, timestamp: new Date().toISOString(), itemNames: [item.name], total: item.price*(qtys[item.id]||item.quantity), itemCount: qtys[item.id]||item.quantity }, ...p].slice(0,10))
  }, [addCart, flash, qtys])

  const handleReorderAll = useCallback((list: ReorderItem[]) => {
    list.forEach(addCart); flash(list[0]?.id || 'bundle')
    const tot = list.reduce((s,i) => s+i.price*(qtys[i.id]||i.quantity), 0)
    setHistory(p => [{ id: `rh-${Date.now()}`, timestamp: new Date().toISOString(), itemNames: list.map(i=>i.name), total: tot, itemCount: list.length }, ...p].slice(0,10))
  }, [addCart, flash, qtys])

  const toggleFav = useCallback((id: string) => {
    setFavs(p => { const n = new Set(p); if (n.has(id)) { n.delete(id) } else { n.add(id) } saveSet('domplace-reorder-favs',n); return n })
    setItems(p => p.map(i => i.id===id ? {...i,isFavorite:!i.isFavorite} : i))
  }, [])

  const changeQty = useCallback((id: string, q: number) => { setQtys(p=>({...p,[id]:q})); setItems(p=>p.map(i=>i.id===id?{...i,quantity:q}:i)) }, [])

  const toggleAuto = useCallback((id: string) => {
    setItems(p => p.map(i => i.id===id ? {...i,autoReorder:!i.autoReorder} : i))
    setAutoCfg(p => { const n = {...p,itemIds:[...p.itemIds]}; if (n.itemIds.includes(id)) { n.itemIds=n.itemIds.filter(x=>x!==id) } else { n.itemIds.push(id) } saveAuto(n); return n })
  }, [])

  const toggleGlobalAuto = useCallback(() => {
    setAutoCfg(p => { const n = {...p,enabled:!p.enabled,nextDate:!p.enabled?new Date(Date.now()+7*86400000).toISOString():null}; saveAuto(n); return n })
  }, [])

  const changeAutoFreq = useCallback((f: AutoConfig['frequency']) => {
    setAutoCfg(p => { const d: Record<string,number>={daily:1,weekly:7,biweekly:14,monthly:30}; const n={...p,frequency:f,nextDate:new Date(Date.now()+(d[f]||7)*86400000).toISOString()}; saveAuto(n); return n })
  }, [])

  const tabs: { k: typeof tab; l: string; ic: React.ElementType; c: number }[] = [
    { k:'buy',    l:'Buy Again', ic: RotateCcw,      c: items.length },
    { k:'bundles',l:'Combos',   ic: Layers,          c: bundles.length },
    { k:'history', l:'Histórico',ic: History,          c: history.length },
    { k:'auto',   l:'Auto',     ic: CalendarClock,    c: items.filter(i=>i.autoReorder).length },
  ]

  // Not logged in → empty
  if (!currentUser && !loading) return (
    <section className="mt-6"><ShimmerCSS />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center"><RotateCcw className="h-4 w-4 text-primary" /></div><h2 className="text-base sm:text-lg font-bold r52-reorder-title">Quick Reorder</h2></div>
      </div>
      <EmptyState />
    </section>
  )

  return (
    <section className="mt-6 r62-card-lift"><ShimmerCSS />
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center"><RotateCcw className="h-4 w-4 text-primary" /></div>
          <h2 className="text-base sm:text-lg font-bold r52-reorder-title r62-heading-gradient">Quick Reorder</h2>
          <Badge variant="secondary" className="text-[9px] font-bold">{items.length} itens</Badge>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setBudgetMode(!budgetMode)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border transition-all r52-reorder-budget-toggle ${
              budgetMode ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border/50 hover:border-primary/30'}`}>
            <Calculator className="h-3 w-3" />Orçamento</motion.button>
          <button onClick={() => navigate('orders')} className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5 group">
            Ver pedidos<ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {loading && <LoadingSk />}
      {!loading && items.length===0 && currentUser && <EmptyState />}

      {!loading && items.length > 0 && (
        <div className="space-y-4">
          {/* Success banner */}
          <AnimatePresence>{showBanner && (
            <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }} className="r52-reorder-success-banner">
              <SuccessAnim show={showBanner} />
            </motion.div>
          )}</AnimatePresence>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-muted/40 border border-border/40 rounded-xl p-1 overflow-x-auto hide-scrollbar r52-reorder-tabs">
            {tabs.map((t,i) => { const Ic = t.ic; return (
              <motion.button key={t.k} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
                whileTap={{ scale: 0.96 }} onClick={() => setTab(t.k)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap flex-1 justify-center r52-reorder-tab ${
                  tab===t.k ? 'bg-card text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}>
                <Ic className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t.l}</span>
                {t.c>0 && <span className={`text-[8px] px-1.5 py-0 rounded-full font-bold ${tab===t.k?'bg-primary/15 text-primary':'bg-muted/60 text-muted-foreground'}`}>{t.c}</span>}
              </motion.button>
            )})}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {tab==='buy' && (
              <motion.div key="buy" initial={{ opacity:0,x:-12 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:12 }} transition={{ duration:0.2 }}>
                {/* Favorites section */}
                <AnimatePresence>{items.some(i=>i.isFavorite) && (
                  <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2"><Heart className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /><span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Favoritos</span><span className="text-[9px] text-muted-foreground">({items.filter(i=>i.isFavorite).length})</span></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{items.filter(i=>i.isFavorite).map((item,idx)=>(
                      <ItemCard key={item.id} item={item} idx={idx} onReorder={handleReorder} onFav={toggleFav} onQty={changeQty} onAuto={toggleAuto} successId={successId} budgetMode={budgetMode} />
                    ))}</div>
                  </motion.div>
                )}</AnimatePresence>
                {/* Buy again header */}
                <motion.div initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}
                  className="flex items-center gap-1.5 mb-2.5"><Sparkles className="h-3.5 w-3.5 text-primary" /><span className="text-[10px] font-bold text-primary">Comprar de Novo</span><span className="text-[9px] text-muted-foreground">— Baseado nas suas compras</span></motion.div>
                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 r52-reorder-grid">
                  {items.map((item,idx)=> <ItemCard key={item.id} item={item} idx={idx} onReorder={handleReorder} onFav={toggleFav} onQty={changeQty} onAuto={toggleAuto} successId={successId} budgetMode={budgetMode} />)}
                </div>
                {/* Budget preview */}
                <AnimatePresence>{budgetMode && (
                  <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:12 }} className="mt-4">
                    <BudgetPreview items={items} qtys={qtys} close={() => setBudgetMode(false)} />
                  </motion.div>
                )}</AnimatePresence>
                {/* Quick reorder all bar */}
                <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.4 }} className="mt-4">
                  <div className="rounded-xl border border-primary/20 bg-card p-3 flex items-center justify-between r52-reorder-bar">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><ShoppingCart className="h-4 w-4 text-primary" /></div>
                      <div><p className="text-xs font-bold">Reorder Todos</p><p className="text-[10px] text-muted-foreground">{items.length} itens · <span className="font-bold text-primary">{fmt(selTotal)}</span></p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button whileTap={{ scale:0.9 }} onClick={() => setShowBudget(!showBudget)}
                        className="h-8 px-3 rounded-lg bg-muted/50 text-muted-foreground text-[10px] font-semibold hover:bg-muted transition-colors flex items-center gap-1">
                        <Calculator className="h-3 w-3" />Ver total</motion.button>
                      <motion.div whileTap={{ scale:0.95 }}>
                        <button onClick={() => handleReorderAll(items)}
                          className="h-9 px-5 rounded-lg bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm r52-reorder-shimmer-btn">
                          <Zap className="h-3.5 w-3.5" />Reorder All<ArrowRight className="h-3 w-3" />
                        </button>
                      </motion.div>
                    </div>
                  </div>
                  <AnimatePresence>{showBudget && (
                    <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }} className="mt-2 overflow-hidden">
                      <BudgetPreview items={items} qtys={qtys} close={() => setShowBudget(false)} />
                    </motion.div>
                  )}</AnimatePresence>
                </motion.div>
              </motion.div>
            )}

            {tab==='bundles' && (
              <motion.div key="bun" initial={{ opacity:0,x:-12 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:12 }} transition={{ duration:0.2 }}>
                <div className="flex items-center gap-1.5 mb-3"><Sparkles className="h-3.5 w-3.5 text-amber-500" /><span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Você costuma comprar estes juntos</span></div>
                <div className="space-y-3">{bundles.map((b,i) => <BundleCard key={b.id} bundle={b} idx={i} onAll={handleReorderAll} budgetMode={budgetMode} />)}</div>
                {bundles.length===0 && <div className="text-center py-8"><Layers className="h-8 w-8 text-muted-foreground/30 mx-auto" /><p className="text-xs text-muted-foreground mt-2">Nenhuma sugestão ainda</p></div>}
              </motion.div>
            )}

            {tab==='history' && (
              <motion.div key="his" initial={{ opacity:0,x:-12 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:12 }} transition={{ duration:0.2 }}>
                <div className="flex items-center gap-1.5 mb-3"><History className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[10px] font-bold text-muted-foreground">Histórico de Reorders</span><Badge variant="secondary" className="text-[8px] font-bold">{history.length}</Badge></div>
                {history.length>0 ? <div className="r52-reorder-timeline">{history.map((e,i) => <TimelineItem key={e.id} entry={e} idx={i} />)}</div> :
                  <div className="text-center py-8"><Clock className="h-8 w-8 text-muted-foreground/30 mx-auto" /><p className="text-xs text-muted-foreground mt-2">Sem histórico ainda</p></div>}
              </motion.div>
            )}

            {tab==='auto' && (
              <motion.div key="aut" initial={{ opacity:0,x:-12 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:12 }} transition={{ duration:0.2 }}>
                <AutoPanel cfg={autoCfg} items={items} onToggle={toggleGlobalAuto} onFreq={changeAutoFreq} />
                <div className="mt-4">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-2">Disponíveis para auto-reorder</p>
                  <div className="space-y-2">{items.filter(i=>!i.autoReorder).slice(0,4).map((item,idx) => (
                    <motion.div key={item.id} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1+idx*0.05 }}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-card border border-border/40 hover:border-primary/20 transition-colors">
                      <div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0"><Package className="h-3.5 w-3.5 text-muted-foreground" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium truncate">{item.name}</p>
                        <p className="text-[9px] text-muted-foreground">{fmt(item.price)} · {freqMap[item.frequency].label}</p>
                      </div>
                      <motion.button whileTap={{ scale:0.9 }} onClick={() => toggleAuto(item.id)}
                        className="h-7 min-h-[44px] px-2.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1">
                        <Plus className="h-3 w-3" />Adicionar</motion.button>
                    </motion.div>
                  ))}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 py-2 text-[9px] text-muted-foreground">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
              <Clock className="h-3 w-3" />
            </motion.div>
            <span>Quick Reorder Hub · Atualizado em tempo real</span>
          </div>
        </div>
      )}
    </section>
  )
}

export default QuickReorderHub
