'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, TrendingDown, Users, ShoppingBag, Gift, Flame, Sparkles,
  Bell, BellOff, X, ChevronRight, Package, Tag, ListChecks, UserPlus, ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
interface TrendingWish {
  id: string
  name: string
  emoji: string
  price: number
  wishCount: number
  store: string
  category: string
}
interface FriendWishlist {
  friendId: string
  friendName: string
  avatarInitial: string
  avatarColor: string
  items: { id: string; name: string; emoji: string }[]
  updatedAt: string
}
interface PriceDropWishItem {
  id: string
  name: string
  emoji: string
  currentPrice: number
  originalPrice: number
  dropPercent: number
  store: string
}
interface SharedWishlist {
  id: string
  title: string
  emoji: string
  itemCount: number
  contributors: { name: string; initial: string }[]
  description: string
}
interface MatchNotification {
  id: string
  friendName: string
  friendInitial: string
  itemName: string
  itemEmoji: string
  timestamp: string
}
type CategoryFilter = 'Todos' | 'Alimentação' | 'Bebidas' | 'Limpeza' | 'Higiene' | 'Padaria' | 'Pet' | 'Hortifruti'
interface WishlistLocalState {
  wishedIds: string[]
  showNotification: boolean
  activeCategory: CategoryFilter
  showEmptyState: boolean
}

/* ═══════════════════════════════════════════════════════════════
   Constants & localStorage
   ═══════════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'domplace-neighborhood-wishlist'
const CATEGORY_OPTIONS: CategoryFilter[] = ['Todos', 'Alimentação', 'Bebidas', 'Limpeza', 'Higiene', 'Padaria', 'Pet', 'Hortifruti']
const CATEGORY_EMOJIS: Record<CategoryFilter, string> = { Todos: '🎯', Alimentação: '🍎', Bebidas: '🥤', Limpeza: '🧹', Higiene: '🧴', Padaria: '🥖', Pet: '🐾', Hortifruti: '🥬' }

const TRENDING_WISHES: TrendingWish[] = [
  { id: 'tw-1', name: 'Queijo Minas Artesanal 500g', emoji: '🧀', price: 34.9, wishCount: 47, store: 'Queijaria do Seu João', category: 'Alimentação' },
  { id: 'tw-2', name: 'Azeite Extra Virgem 500ml', emoji: '🫒', price: 49.9, wishCount: 38, store: 'Empório Sabor da Terra', category: 'Alimentação' },
  { id: 'tw-3', name: 'Cerveja Artesanal IPA 6pk', emoji: '🍺', price: 28.9, wishCount: 35, store: 'Cervejaria LUPA', category: 'Bebidas' },
  { id: 'tw-4', name: 'Pão de Queijo Congelado 1kg', emoji: '🧀', price: 22.9, wishCount: 29, store: 'Padaria Pão Dourado', category: 'Padaria' },
  { id: 'tw-5', name: 'Ração Premium Cães 8kg', emoji: '🐕', price: 89.9, wishCount: 24, store: 'Pet Shop Amigo Fiel', category: 'Pet' },
  { id: 'tw-6', name: 'Tomates Grape 500g Orgânicos', emoji: '🍅', price: 12.5, wishCount: 19, store: 'Horta Vida', category: 'Hortifruti' },
]

const FRIEND_WISHLISTS: FriendWishlist[] = [
  { friendId: 'f-1', friendName: 'Maria Silva', avatarInitial: 'M', avatarColor: 'from-rose-400 to-pink-500', updatedAt: '2h atrás',
    items: [{ id: 'fi-1', name: 'Queijo Minas 500g', emoji: '🧀' }, { id: 'fi-2', name: 'Azeite Extra Virgem', emoji: '🫒' }, { id: 'fi-3', name: 'Geleia de Pimenta', emoji: '🌶️' }] },
  { friendId: 'f-2', friendName: 'Carlos Oliveira', avatarInitial: 'C', avatarColor: 'from-blue-400 to-indigo-500', updatedAt: '5h atrás',
    items: [{ id: 'fi-4', name: 'Cerveja IPA 6pk', emoji: '🍺' }, { id: 'fi-5', name: 'Pão de Queijo 1kg', emoji: '🥖' }, { id: 'fi-6', name: 'Detergente Neutro 2L', emoji: '🧹' }] },
  { friendId: 'f-3', friendName: 'Ana Costa', avatarInitial: 'A', avatarColor: 'from-emerald-400 to-teal-500', updatedAt: '1d atrás',
    items: [{ id: 'fi-7', name: 'Ração Premium 8kg', emoji: '🐕' }, { id: 'fi-8', name: 'Shampoo Vegano 300ml', emoji: '🧴' }, { id: 'fi-9', name: 'Tomates Orgânicos 500g', emoji: '🍅' }] },
]

const PRICE_DROP_ITEMS: PriceDropWishItem[] = [
  { id: 'pd-1', name: 'Queijo Minas Artesanal 500g', emoji: '🧀', currentPrice: 34.9, originalPrice: 42.9, dropPercent: 19, store: 'Queijaria do Seu João' },
  { id: 'pd-2', name: 'Azeite Extra Virgem 500ml', emoji: '🫒', currentPrice: 49.9, originalPrice: 62.0, dropPercent: 20, store: 'Empório Sabor da Terra' },
  { id: 'pd-3', name: 'Cerveja Artesanal IPA 6pk', emoji: '🍺', currentPrice: 28.9, originalPrice: 34.9, dropPercent: 17, store: 'Cervejaria LUPA' },
  { id: 'pd-4', name: 'Shampoo Vegano 300ml', emoji: '🧴', currentPrice: 32.0, originalPrice: 39.9, dropPercent: 20, store: 'Natura Essencial' },
]

const SHARED_WISHLISTS: SharedWishlist[] = [
  { id: 'sw-1', title: 'Churrasco do Bairro', emoji: '🔥', itemCount: 12, description: 'Itens para o churrasco de sábado no parque',
    contributors: [{ name: 'Maria', initial: 'M' }, { name: 'Carlos', initial: 'C' }, { name: 'Ana', initial: 'A' }, { name: 'João', initial: 'J' }, { name: 'Pedro', initial: 'P' }] },
  { id: 'sw-2', title: 'Kit Escolar', emoji: '🎒', itemCount: 8, description: 'Materiais escolares compartilhados entre vizinhos',
    contributors: [{ name: 'Ana', initial: 'A' }, { name: 'Maria', initial: 'M' }, { name: 'Lucia', initial: 'L' }] },
]

const MATCH_NOTIFICATION: MatchNotification = {
  id: 'mn-1', friendName: 'Maria Silva', friendInitial: 'M', itemName: 'Queijo Minas Artesanal 500g', itemEmoji: '🧀', timestamp: '3 min atrás',
}

function loadLocalState(): WishlistLocalState {
  if (typeof window === 'undefined') return { wishedIds: [], showNotification: true, activeCategory: 'Todos' as const, showEmptyState: false }
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw) } catch { /* ignore */ }
  const fresh: WishlistLocalState = { wishedIds: [], showNotification: true, activeCategory: 'Todos' as const, showEmptyState: false }
  saveLocalState(fresh)
  return fresh
}
function saveLocalState(state: WishlistLocalState): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}

/* ═══════════════════════════════════════════════════════════════
   Animation Variants & CSS
   ═══════════════════════════════════════════════════════════════ */
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}
const slideInVariants = {
  hidden: { opacity: 0, x: -30, scale: 0.9 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } },
  exit: { opacity: 0, x: 30, scale: 0.9, transition: { duration: 0.2 } },
}
const heartBurstParticles = Array.from({ length: 8 }, (_, i) => ({
  id: `p-${i}`, angle: (i / 8) * 360, distance: 24 + Math.random() * 12, size: 3 + Math.random() * 3,
}))

const ANIM_CSS = `
/* Floating heart animation for empty state */
@keyframes r49-heart-float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  25% { transform: translateY(-12px) rotate(5deg) scale(1.05); }
  50% { transform: translateY(-6px) rotate(-3deg) scale(1.02); }
  75% { transform: translateY(-16px) rotate(4deg) scale(1.08); }
}
.r49-heart-float { animation: r49-heart-float 3.5s ease-in-out infinite; }

/* Animated gradient text for header */
@keyframes r49-gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.r49-gradient-text {
  background: linear-gradient(135deg, #e11d48, #f43f5e, #fb7185, #f43f5e, #e11d48);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: r49-gradient-shift 4s ease-in-out infinite;
}

/* Pulsing glow on price drop badges */
@keyframes r49-badge-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50% { transform: scale(1.04); box-shadow: 0 0 8px 2px rgba(34,197,94,0.2); }
}
.r49-badge-pulse { animation: r49-badge-pulse 2s ease-in-out infinite; }

/* Soft glow on stat cards */
@keyframes r49-stat-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0.1); }
  50% { box-shadow: 0 0 12px 2px rgba(244,63,94,0.15); }
}
.r49-stat-glow { animation: r49-stat-glow 3s ease-in-out infinite; }

/* Shimmer on match notification border */
@keyframes r49-toast-shimmer {
 0% { border-color: rgba(139,92,246,0.2); }
  50% { border-color: rgba(139,92,246,0.5); }
  100% { border-color: rgba(139,92,246,0.2); }
}
.r49-match-toast { animation: r49-toast-shimmer 2s ease-in-out infinite; }

/* Subtle float for trending card emojis on hover */
@keyframes r49-trending-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
.r49-trending-card:hover span {
  animation: r49-trending-bounce 0.8s ease-in-out infinite;
}

/* Category pill active shimmer */
@keyframes r49-pill-shine {
  0% { background-position: -200% center; }
 100% { background-position: 200% center; }
}
.r49-category-pill { background-size: 200% 100%; }
`

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   Section Header — reusable section title with badge
   ═══════════════════════════════════════════════════════════════ */
function SectionHeader({ icon, title, badgeText, badgeColor }: { icon: React.ReactNode; title: string; badgeText: string; badgeColor: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 px-1">
      {icon}
      <h3 className="text-sm font-bold">{title}</h3>
      <Badge variant="secondary"
        className={`text-[9px] font-bold ml-auto ${badgeColor}`}>
        {badgeText}
      </Badge>
    </div>
  )
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function pluralWish(count: number): string {
  return `${count} pessoa${count === 1 ? '' : 's'} querem`
}

/* ═══════════════════════════════════════════════════════════════
   HeartToggleButton — burst animation on add
   ═══════════════════════════════════════════════════════════════ */
function HeartToggleButton({ isWished, onToggle, size = 'md' }: { isWished: boolean; onToggle: () => void; size?: 'sm' | 'md' }) {
  const [bursting, setBursting] = useState(false)
  const isSm = size === 'sm'
  const handleToggle = () => {
    onToggle()
    if (!isWished) { setBursting(true); setTimeout(() => setBursting(false), 600) }
  }

  return (
    <motion.button whileTap={{ scale: 0.8 }} onClick={handleToggle}
      className={`relative flex items-center justify-center rounded-full transition-colors ${isSm ? 'h-7 w-7' : 'h-9 w-9'} ${
        isWished ? 'bg-rose-500 text-white' : 'bg-white/90 dark:bg-black/50 backdrop-blur-sm border border-border hover:border-rose-300'}`}
      aria-label={isWished ? 'Remover da wishlist' : 'Adicionar à wishlist'}>
      <AnimatePresence mode="wait">
        {isWished ? (
          <motion.div key="filled" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 45 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}>
            <Heart className={`${isSm ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'} fill-white`} />
          </motion.div>
        ) : (
          <motion.div key="outline" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}>
            <Heart className={`${isSm ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'} text-rose-400`} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {bursting && (
          <div className="absolute inset-0 pointer-events-none">
            {heartBurstParticles.map((p) => (
              <motion.div key={p.id} className="absolute rounded-full bg-rose-400"
                style={{ width: p.size, height: p.size, top: '50%', left: '50%' }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{ x: Math.cos((p.angle * Math.PI) / 180) * p.distance, y: Math.sin((p.angle * Math.PI) / 180) * p.distance, scale: 1, opacity: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: 'easeOut' as const }} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TrendingWishCard — product card with wish count badge
   ═══════════════════════════════════════════════════════════════ */
function TrendingWishCard({ item, isWished, onToggleWish }: { item: TrendingWish; isWished: boolean; onToggleWish: () => void }) {
  return (
    <motion.div variants={itemVariants}
      whileHover={{ scale: 1.03, boxShadow: '0 12px 32px -8px rgba(244,63,94,0.18), 0 4px 12px -4px rgba(0,0,0,0.08)' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 22 }}
      className="relative bg-card rounded-xl border border-border overflow-hidden group r49-trending-card">
      <div className="relative h-28 bg-gradient-to-br from-rose-50/60 to-pink-50/60 dark:from-rose-950/20 dark:to-pink-950/20 flex items-center justify-center">
        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{item.emoji}</span>
        <motion.div initial={{ scale: 0, x: 10 }} animate={{ scale: 1, x: 0 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 18, delay: 0.15 }}
          className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/90 backdrop-blur-sm text-white text-[9px] font-bold shadow-md">
          <Flame className="h-2.5 w-2.5" />{pluralWish(item.wishCount)}
        </motion.div>
        <div className="absolute top-2 right-2"><HeartToggleButton isWished={isWished} onToggle={onToggleWish} size="sm" /></div>
      </div>
      <div className="p-3">
        <p className="text-[9px] text-primary font-medium truncate">{item.store}</p>
        <h4 className="text-xs font-semibold line-clamp-2 leading-tight mt-0.5">{item.name}</h4>
        <span className="text-sm font-extrabold text-primary">{formatBRL(item.price)}</span>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FriendWishlistCard — friend name, avatar, 3 wishlist items
   ═══════════════════════════════════════════════════════════════ */
function FriendWishlistCard({ friend }: { friend: FriendWishlist }) {
  return (
    <motion.div variants={itemVariants}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 24px -6px rgba(99,102,241,0.15), 0 4px 12px -4px rgba(0,0,0,0.06)' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 22 }}
      className="bg-card rounded-xl border border-border p-3 r49-friend-card">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${friend.avatarColor} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
          {friend.avatarInitial}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold truncate">{friend.friendName}</h4>
          <p className="text-[9px] text-muted-foreground">{friend.updatedAt}</p>
        </div>
        <motion.div whileTap={{ scale: 0.9 }} className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
          <UserPlus className="h-3.5 w-3.5 text-primary" />
        </motion.div>
      </div>
      <div className="space-y-1.5">
        {friend.items.map((item, idx) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 300, damping: 22 }}
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
            <span className="text-base">{item.emoji}</span>
            <span className="text-[11px] font-medium flex-1 truncate">{item.name}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PriceDropCard — animated green "-XX%" badge + savings
   ═══════════════════════════════════════════════════════════════ */
function PriceDropCard({ item, isWished, onToggleWish }: { item: PriceDropWishItem; isWished: boolean; onToggleWish: () => void }) {
  const savings = item.originalPrice - item.currentPrice
  return (
    <motion.div variants={itemVariants}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 24px -6px rgba(34,197,94,0.15), 0 4px 12px -4px rgba(0,0,0,0.06)' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 22 }}
      className="relative bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 p-3 r49-price-drop-card">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center text-2xl shrink-0">
          {item.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] text-muted-foreground truncate">{item.store}</p>
          <h4 className="text-xs font-semibold line-clamp-1">{item.name}</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatBRL(item.currentPrice)}</span>
            <span className="text-[9px] text-red-400 line-through">{formatBRL(item.originalPrice)}</span>
          </div>
          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            className="r49-badge-pulse inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold mt-1.5">
            <ArrowDown className="h-2.5 w-2.5" />-{item.dropPercent}%
          </motion.div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <TrendingDown className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Economize {formatBRL(savings)}</span>
          </div>
        </div>
        <HeartToggleButton isWished={isWished} onToggle={onToggleWish} size="sm" />
      </div>
      {/* Button wrapped in motion.div — no whileHover on shadcn Button */}
      <motion.div whileTap={{ scale: 0.97 }} className="mt-3">
        <Button className="w-full h-8 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold gap-1.5 rounded-lg">
          <ShoppingBag className="h-3.5 w-3.5" />Comprar agora
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SharedWishlistCard — "Churrasco do Bairro", "Kit Escolar"
   ═══════════════════════════════════════════════════════════════ */
function SharedWishlistCard({ list }: { list: SharedWishlist }) {
  return (
    <motion.div variants={itemVariants}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 24px -6px rgba(139,92,246,0.15), 0 4px 12px -4px rgba(0,0,0,0.06)' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 22 }}
      className="bg-card rounded-xl border border-border p-4 r49-shared-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center text-2xl">
          {list.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold truncate">{list.title}</h4>
          <p className="text-[10px] text-muted-foreground line-clamp-1">{list.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/15">
          <Package className="h-3 w-3 text-violet-500" />
          <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">{list.itemCount} itens</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/15">
          <Users className="h-3 w-3 text-violet-500" />
          <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">{list.contributors.length} contribuintes</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {list.contributors.map((c) => (
          <div key={c.name} className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold border-2 border-card -ml-1 first:ml-0" title={c.name}>
            {c.initial}
          </div>
        ))}
        <motion.div whileTap={{ scale: 0.9 }} className="ml-1 h-7 w-7 rounded-full bg-muted flex items-center justify-center border border-border cursor-pointer hover:bg-muted/80 transition-colors">
          <span className="text-[9px] font-bold text-muted-foreground">+</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EmptyState — floating heart/gift animation
   ═══════════════════════════════════════════════════════════════ */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 text-center">
      <motion.div className="r49-heart-float"
        animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const }}>
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 flex items-center justify-center shadow-lg border border-rose-200/40 dark:border-rose-800/30"
          style={{ boxShadow: '0 8px 24px rgba(244,63,94,0.15)' }}>
          <Gift className="h-10 w-10 text-rose-400" />
        </div>
      </motion.div>
      <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-base font-bold mt-5">
        Nenhum desejo encontrado
      </motion.h3>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="text-xs text-muted-foreground mt-2 max-w-[240px]">
        Explore produtos do seu bairro e toque no coração para criar sua lista de desejos
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-5">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button className="rounded-full px-6 h-9 text-xs font-semibold gap-2">
            <ShoppingBag className="h-3.5 w-3.5" />Explorar Produtos
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MatchNotificationToast — "Maria adicionou o mesmo item"
   ═══════════════════════════════════════════════════════════════ */
function MatchNotificationToast({ notification, onDismiss }: { notification: MatchNotification; onDismiss: () => void }) {
  return (
    <motion.div variants={slideInVariants} initial="hidden" animate="visible" exit="exit"
      className="relative flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200/40 dark:border-violet-800/30 r49-match-toast">
      <div className="relative shrink-0">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
          {notification.friendInitial}
        </div>
        <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-500 border-2 border-card flex items-center justify-center">
          <Heart className="h-2 w-2 text-white fill-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold">
          <span className="text-violet-600 dark:text-violet-400">{notification.friendName}</span> adicionou o mesmo item
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-sm">{notification.itemEmoji}</span>
          <span className="text-[10px] text-muted-foreground truncate">{notification.itemName}</span>
        </div>
        <p className="text-[8px] text-muted-foreground mt-0.5">{notification.timestamp}</p>
      </div>
      <motion.button whileTap={{ scale: 0.85 }} onClick={onDismiss}
        className="h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors shrink-0">
        <X className="h-3 w-3 text-muted-foreground" />
      </motion.button>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   StatCard — "23 itens", "5 listas", "3 amigos compartilharam"
   ═══════════════════════════════════════════════════════════════ */
function StatCard({ icon, label, value, gradient, delay }: { icon: React.ReactNode; label: string; value: string; gradient: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring' as const, stiffness: 300, damping: 22 }}
      whileHover={{ scale: 1.05, boxShadow: '0 8px 20px -6px rgba(244,63,94,0.12)' }}
      className={`r49-stat-glow rounded-xl bg-gradient-to-br ${gradient} border border-border/40 p-3 text-center cursor-default`}>
      <div className="flex items-center justify-center mb-1.5">{icon}</div>
      <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.1, type: 'spring' as const, stiffness: 400, damping: 20 }}
        className="text-lg font-bold tabular-nums">{value}</motion.span>
      <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">{label}</p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CategoryFilterPill — animated filter pills
   ═══════════════════════════════════════════════════════════════ */
function CategoryFilterPill({ category, isActive, onClick }: { category: CategoryFilter; isActive: boolean; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.93 }} onClick={onClick}
      className={`snap-start shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border r49-category-pill ${
        isActive ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-md' : 'bg-card text-muted-foreground border-border hover:border-rose-300/50 hover:text-foreground'}`}
      style={isActive ? { boxShadow: '0 4px 16px rgba(244,63,94,0.3)' } : undefined}>
      <span>{CATEGORY_EMOJIS[category]}</span><span>{category}</span>
      {isActive && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}>
          <Sparkles className="h-2.5 w-2.5" />
        </motion.div>
      )}
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — NeighborhoodWishlist
   Features:
   1. Community Wishlist Header — "Desejos do Bairro" gradient text
   2. Trending Wishes — 6 most-wished products with wish count badges
   3. Friend Wishlists — 3 friends with avatar initial & 3 item preview
   4. Price Drop — animated green "-XX%" badges on wished items
   5. Shared Wishlists — "Churrasco do Bairro", "Kit Escolar"
   6. Heart Toggle — burst animation on toggle
   7. Stats — "23 itens", "5 listas", "3 amigos compartilharam"
   8. Notification — "Maria adicionou o mesmo item" slide-in
   9. Category Filter — animated pills with emoji
   10. Empty State — floating heart animation
   ═══════════════════════════════════════════════════════════════ */
export default function NeighborhoodWishlist() {
  const [localState, setLocalState] = useState<WishlistLocalState>(loadLocalState)
  const [mounted, setMounted] = useState(false)
  const notifTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (mounted) saveLocalState(localState) }, [mounted, localState])

  // Auto-dismiss notification after 8s
  useEffect(() => {
    if (localState.showNotification) {
      notifTimeoutRef.current = setTimeout(() => setLocalState((p) => ({ ...p, showNotification: false })), 8000)
    }
    return () => { if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current) }
  }, [localState.showNotification])

  const toggleWish = useCallback((id: string) => {
    setLocalState((p) => ({ ...p, wishedIds: p.wishedIds.includes(id) ? p.wishedIds.filter((w) => w !== id) : [...p.wishedIds, id] }))
  }, [])
  const setActiveCategory = useCallback((cat: CategoryFilter) => setLocalState((p) => ({ ...p, activeCategory: cat })), [])
  const dismissNotification = useCallback(() => setLocalState((p) => ({ ...p, showNotification: false })), [])
  const resetEmptyState = useCallback(() => setLocalState((p) => ({ ...p, showEmptyState: false })), [])

  const filteredTrending = localState.activeCategory === 'Todos'
    ? TRENDING_WISHES
    : TRENDING_WISHES.filter((item) => item.category === localState.activeCategory)
  const filteredPriceDrops = localState.activeCategory === 'Todos'
    ? PRICE_DROP_ITEMS
    : PRICE_DROP_ITEMS.filter((item) => {
        const match = TRENDING_WISHES.find((tw) => tw.name === item.name)
        return match ? match.category === localState.activeCategory : true
      })

  // Skeleton loading
  if (!mounted) {
    return (
      <section className="w-full">
        <div className="rounded-2xl p-5 bg-card border border-border animate-pulse">
          <div className="h-7 w-48 bg-muted rounded-lg mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="h-20 bg-muted rounded-xl" />
            <div className="h-20 bg-muted rounded-xl" />
            <div className="h-20 bg-muted rounded-xl" />
          </div>
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </section>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIM_CSS }} />
      <section className="w-full bg-gradient-to-br from-rose-50/30 via-background to-violet-50/20 dark:from-rose-950/10 dark:via-background dark:to-violet-950/10 rounded-2xl p-4 sm:p-5">

        {/* ═══ 1. COMMUNITY WISHLIST HEADER — "Desejos do Bairro" ═══ */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2.5">
            <motion.div animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 4px 16px rgba(244,63,94,0.35)' }}>
              <Heart className="h-5 w-5 text-white fill-white" />
            </motion.div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold r49-gradient-text">Desejos do Bairro</h2>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />O que seus vizinhos estão querendo comprar
              </p>
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.9 }}
            onClick={() => setLocalState((p) => ({ ...p, showNotification: !p.showNotification }))}
            className={`h-9 w-9 rounded-xl flex items-center justify-center border cursor-pointer transition-colors ${
              localState.showNotification ? 'bg-rose-500 border-rose-500 text-white' : 'bg-card border-border text-muted-foreground hover:border-primary/30'}`}>
            {localState.showNotification ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </motion.div>
        </div>

        {/* ═══ 7. WISHLIST STATS — "23 itens", "5 listas", "3 amigos" ═══ */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
          <StatCard icon={<Package className="h-4.5 w-4.5 text-rose-500" />} label="itens" value="23"
            gradient="from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20" delay={0} />
          <StatCard icon={<ListChecks className="h-4.5 w-4.5 text-violet-500" />} label="listas" value="5"
            gradient="from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20" delay={0.08} />
          <StatCard icon={<Users className="h-4.5 w-4.5 text-blue-500" />} label="amigos compartilharam" value="3"
            gradient="from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20" delay={0.16} />
        </motion.div>

        {/* ═══ 9. CATEGORY FILTER — animated pills ═══ */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4 mb-4 snap-x snap-mandatory">
          {CATEGORY_OPTIONS.map((cat) => (
            <CategoryFilterPill key={cat} category={cat} isActive={localState.activeCategory === cat}
              onClick={() => setActiveCategory(cat)} />
          ))}
        </div>

        {/* ═══ 8. MATCH NOTIFICATION — "Maria adicionou o mesmo item" ═══ */}
        <AnimatePresence>
          {localState.showNotification && (
            <div className="mb-4">
              <MatchNotificationToast notification={MATCH_NOTIFICATION} onDismiss={dismissNotification} />
            </div>
          )}
        </AnimatePresence>

        {localState.showEmptyState ? (
          /* ═══ 10. EMPTY STATE — floating heart animation ═══ */
          <EmptyState onReset={resetEmptyState} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={localState.activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* ═══ 2. TRENDING WISHES (6 products) — "47 pessoas querem" ═══ */}
              {filteredTrending.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Flame className="h-4 w-4 text-rose-500" />
                    <h3 className="text-sm font-bold">Mais Desejados do Bairro</h3>
                    <Badge variant="secondary"
                      className="text-[9px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30 font-bold ml-auto">
                      {filteredTrending.length} itens
                    </Badge>
                  </div>
                  <motion.div variants={containerVariants} initial="hidden" animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredTrending.map((item) => (
                      <TrendingWishCard key={item.id} item={item}
                        isWished={localState.wishedIds.includes(item.id)}
                        onToggleWish={() => toggleWish(item.id)} />
                    ))}
                  </motion.div>
                </div>
              )}

              {/* ═══ 4. PRICE DROP ON WISHED ITEMS — animated green "-XX%" ═══ */}
              {filteredPriceDrops.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <motion.div animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}>
                      <TrendingDown className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                    <h3 className="text-sm font-bold">Queda de Preço nos seus Desejos</h3>
                    <motion.span animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                      className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                      <Sparkles className="h-2.5 w-2.5" />{filteredPriceDrops.length} itens mais baratos
                    </motion.span>
                  </div>
                  <div className="space-y-3">
                    {filteredPriceDrops.map((item) => (
                      <PriceDropCard key={item.id} item={item}
                        isWished={localState.wishedIds.includes(item.id)}
                        onToggleWish={() => toggleWish(item.id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ 3. FRIEND WISHLISTS (3 friends) — avatar + 3 items ═══ */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-bold">Listas de Amigos</h3>
                  <Badge variant="secondary"
                    className="text-[9px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30 font-bold ml-auto">
                    {FRIEND_WISHLISTS.length} amigos
                  </Badge>
                </div>
                <motion.div variants={containerVariants} initial="hidden" animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {FRIEND_WISHLISTS.map((friend) => (
                    <FriendWishlistCard key={friend.friendId} friend={friend} />
                  ))}
                </motion.div>
              </div>

              {/* ═══ 5. SHARED WISHLISTS — "Churrasco do Bairro", "Kit Escolar" ═══ */}
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Tag className="h-4 w-4 text-violet-500" />
                  <h3 className="text-sm font-bold">Listas Compartilhadas</h3>
                  <Badge variant="secondary"
                    className="text-[9px] bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-800/30 font-bold ml-auto">
                    {SHARED_WISHLISTS.length} listas
                  </Badge>
                </div>
                <motion.div variants={containerVariants} initial="hidden" animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SHARED_WISHLISTS.map((list) => (
                    <SharedWishlistCard key={list.id} list={list} />
                  ))}
                </motion.div>
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </>
  )
}
