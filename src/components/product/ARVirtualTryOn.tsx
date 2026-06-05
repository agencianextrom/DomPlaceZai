'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  RotateCw,
  X,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sun,
  Zap,
  Eye,
  Download,
  Trash2,
  Info,
  Lightbulb,
  UserRound,
  Maximize2,
  Heart,
  MessageCircle,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════
   Types & Interfaces
   ═══════════════════════════════════════════════════════════ */

type ProductCategory = 'glasses' | 'hats' | 'watches' | 'accessories'

type ARQualityLevel = 'green' | 'yellow' | 'red'

interface ProductColorVariant {
  id: string
  name: string
  hex: string
  emoji: string
}

interface ProductStyle {
  id: string
  name: string
  emoji: string
  colors: ProductColorVariant[]
}

interface ARProduct {
  id: string
  name: string
  category: ProductCategory
  price: number
  originalPrice: number
  styles: ProductStyle[]
  overlayEmoji: string
  overlayOffset: { x: number; y: number }
}

interface TakenPhoto {
  id: string
  timestamp: number
  productId: string
  colorVariantId: string
  styleId: string
  rotation: number
  scale: number
  seeOnModel: boolean
}

/* ═══════════════════════════════════════════════════════════
   Product Data
   ═══════════════════════════════════════════════════════════ */

const PRODUCTS: ARProduct[] = [
  {
    id: 'prod-glasses-01',
    name: 'Óculos Aviador Premium',
    category: 'glasses',
    price: 189.9,
    originalPrice: 299.9,
    overlayEmoji: '🕶️',
    overlayOffset: { x: 0, y: -2 },
    styles: [
      {
        id: 'style-g-aviator',
        name: 'Aviador',
        emoji: '🕶️',
        colors: [
          { id: 'gc1', name: 'Dourado', hex: '#c9a96e', emoji: '✨' },
          { id: 'gc2', name: 'Prata', hex: '#a8a8a8', emoji: '🪞' },
          { id: 'gc3', name: 'Preto', hex: '#1a1a1a', emoji: '🖤' },
          { id: 'gc4', name: 'Rose', hex: '#c97a8a', emoji: '🌸' },
        ],
      },
      {
        id: 'style-g-round',
        name: 'Redondo',
        emoji: '🟢',
        colors: [
          { id: 'gr1', name: 'Tortoise', hex: '#8b6914', emoji: '🐢' },
          { id: 'gr2', name: 'Azul', hex: '#2c5f8a', emoji: '🔵' },
          { id: 'gr3', name: 'Transparente', hex: '#d4e5f7', emoji: '💧' },
        ],
      },
      {
        id: 'style-g-wayfarer',
        name: 'Wayfarer',
        emoji: '🕶️',
        colors: [
          { id: 'gw1', name: 'Preto Clássico', hex: '#111111', emoji: '⬛' },
          { id: 'gw2', name: 'Vermelho', hex: '#b33a3a', emoji: '🔴' },
          { id: 'gw3', name: 'Havana', hex: '#a0632e', emoji: '🌰' },
        ],
      },
    ],
  },
  {
    id: 'prod-hat-01',
    name: 'Chapéu Fedora Elegante',
    category: 'hats',
    price: 149.9,
    originalPrice: 229.9,
    overlayEmoji: '🎩',
    overlayOffset: { x: 0, y: -12 },
    styles: [
      {
        id: 'style-h-fedora',
        name: 'Fedora',
        emoji: '🎩',
        colors: [
          { id: 'hf1', name: 'Preto', hex: '#1a1a1a', emoji: '🖤' },
          { id: 'hf2', name: 'Marrom', hex: '#6b4226', emoji: '🤎' },
          { id: 'hf3', name: 'Cinza', hex: '#6b6b6b', emoji: '🩶' },
          { id: 'hf4', name: 'Bordô', hex: '#6b2d3e', emoji: '🍷' },
        ],
      },
      {
        id: 'style-h-bucket',
        name: 'Bucket',
        emoji: '🪣',
        colors: [
          { id: 'hb1', name: 'Branco', hex: '#f5f5f5', emoji: '⚪' },
          { id: 'hb2', name: 'Caqui', hex: '#b8a472', emoji: '🏜️' },
          { id: 'hb3', name: 'Verde', hex: '#4a6b3a', emoji: '🌿' },
        ],
      },
      {
        id: 'style-h-beanie',
        name: 'Touca',
        emoji: '🧢',
        colors: [
          { id: 'ht1', name: 'Roxo', hex: '#6b3fa0', emoji: '💜' },
          { id: 'ht2', name: 'Laranja', hex: '#d4762c', emoji: '🧡' },
          { id: 'ht3', name: 'Cinza', hex: '#888888', emoji: '🩶' },
        ],
      },
    ],
  },
  {
    id: 'prod-watch-01',
    name: 'Relógio Smart Luxo',
    category: 'watches',
    price: 599.9,
    originalPrice: 899.9,
    overlayEmoji: '⌚',
    overlayOffset: { x: 12, y: 8 },
    styles: [
      {
        id: 'style-w-smart',
        name: 'Smart',
        emoji: '⌚',
        colors: [
          { id: 'ws1', name: 'Prata', hex: '#c0c0c0', emoji: '🪙' },
          { id: 'ws2', name: 'Ouro Rosa', hex: '#c9a0a0', emoji: '🌹' },
          { id: 'ws3', name: 'Preto', hex: '#222222', emoji: '🖤' },
          { id: 'ws4', name: 'Azul', hex: '#3a5c8a', emoji: '🫐' },
        ],
      },
      {
        id: 'style-w-classic',
        name: 'Clássico',
        emoji: '🕰️',
        colors: [
          { id: 'wc1', name: 'Couro Marrom', hex: '#8b5e3c', emoji: '🪵' },
          { id: 'wc2', name: 'Couro Preto', hex: '#2a2a2a', emoji: '🖤' },
          { id: 'wc3', name: 'Aço', hex: '#a8b0b8', emoji: '⚙️' },
        ],
      },
    ],
  },
  {
    id: 'prod-acc-01',
    name: 'Colar Pendente Cristal',
    category: 'accessories',
    price: 249.9,
    originalPrice: 399.9,
    overlayEmoji: '📿',
    overlayOffset: { x: 0, y: 6 },
    styles: [
      {
        id: 'style-a-pendant',
        name: 'Pendente',
        emoji: '📿',
        colors: [
          { id: 'ap1', name: 'Ouro', hex: '#d4af37', emoji: '🌟' },
          { id: 'ap2', name: 'Prata', hex: '#b8b8b8', emoji: '✨' },
          { id: 'ap3', name: 'Rosa', hex: '#d4a0a0', emoji: '🩷' },
          { id: 'ap4', name: 'Esmeralda', hex: '#2e8b57', emoji: '💎' },
        ],
      },
      {
        id: 'style-a-choker',
        name: 'Choker',
        emoji: '⭕',
        colors: [
          { id: 'ac1', name: 'Veludo Preto', hex: '#1a1a1a', emoji: '🖤' },
          { id: 'ac2', name: 'Vermelho', hex: '#c62828', emoji: '❤️' },
          { id: 'ac3', name: 'Dourado', hex: '#c9a96e', emoji: '✨' },
        ],
      },
      {
        id: 'style-a-chain',
        name: 'Corrente',
        emoji: '⛓️',
        colors: [
          { id: 'ach1', name: 'Prata', hex: '#b0b0b0', emoji: '🔗' },
          { id: 'ach2', name: 'Ouro', hex: '#c9a96e', emoji: '🔶' },
          { id: 'ach3', name: 'Bicolor', hex: '#9a9a6e', emoji: '🌈' },
        ],
      },
    ],
  },
]

const CATEGORY_META: Record<ProductCategory, { label: string; icon: string; bgColor: string }> = {
  glasses: { label: 'Óculos', icon: '🕶️', bgColor: 'rgba(99,102,241,0.12)' },
  hats: { label: 'Chapéus', icon: '🎩', bgColor: 'rgba(139,92,246,0.12)' },
  watches: { label: 'Relógios', icon: '⌚', bgColor: 'rgba(14,165,233,0.12)' },
  accessories: { label: 'Acessórios', icon: '📿', bgColor: 'rgba(236,72,153,0.12)' },
}

const CATEGORY_TABS: { id: ProductCategory; label: string; icon: string }[] = [
  { id: 'glasses', label: 'Óculos', icon: '🕶️' },
  { id: 'hats', label: 'Chapéus', icon: '🎩' },
  { id: 'watches', label: 'Relógios', icon: '⌚' },
  { id: 'accessories', label: 'Acessórios', icon: '📿' },
]

const LIGHTING_TIPS = [
  { icon: <Sun className="h-4 w-4" style={{ color: '#f59e0b' }} />, tip: 'Fique de frente para uma fonte de luz natural para melhores resultados.' },
  { icon: <Zap className="h-4 w-4" style={{ color: '#3b82f6' }} />, tip: 'Evite luzes muito fortes ou sombras duras no rosto.' },
  { icon: <Eye className="h-4 w-4" style={{ color: '#10b981' }} />, tip: 'Mantenha o rosto a cerca de 40-60cm da câmera.' },
  { icon: <UserRound className="h-4 w-4" style={{ color: '#8b5cf6' }} />, tip: 'Centralize o rosto na tela para melhor rastreamento AR.' },
  { icon: <Lightbulb className="h-4 w-4" style={{ color: '#eab308' }} />, tip: 'Ambientes com iluminação uniforme dão os melhores resultados.' },
]

/* ═══════════════════════════════════════════════════════════
   Helper: simulated AR quality
   ═══════════════════════════════════════════════════════════ */

function getSimulatedQuality(): { level: ARQualityLevel; score: number; label: string } {
  const r = Math.random()
  if (r > 0.6) return { level: 'green', score: 85 + Math.floor(Math.random() * 15), label: 'Excelente' }
  if (r > 0.25) return { level: 'yellow', score: 55 + Math.floor(Math.random() * 30), label: 'Moderado' }
  return { level: 'red', score: 20 + Math.floor(Math.random() * 35), label: 'Baixo' }
}

const QUALITY_COLORS: Record<ARQualityLevel, { bg: string; bar: string; text: string }> = {
  green: { bg: 'rgba(16,185,129,0.12)', bar: '#10b981', text: '#059669' },
  yellow: { bg: 'rgba(245,158,11,0.12)', bar: '#f59e0b', text: '#d97706' },
  red: { bg: 'rgba(239,68,68,0.12)', bar: '#ef4444', text: '#dc2626' },
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: LoadingSkeleton
   ═══════════════════════════════════════════════════════════ */

function LoadingSkeleton() {
  return (
    <div className="r50-artry-skeleton rounded-2xl overflow-hidden border border-border">
      <div className="r50-artry-skeleton-header flex items-center justify-between p-4 border-b border-border">
        <div className="r50-artry-shim h-8 w-36 rounded-lg" />
        <div className="flex gap-2">
          <div className="r50-artry-shim h-8 w-8 rounded-full" />
          <div className="r50-artry-shim h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="aspect-[3/4] sm:aspect-video relative overflow-hidden">
        <div className="absolute inset-0 r50-artry-shim-bg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
          <motion.div
            className="h-16 w-16 rounded-full r50-artry-shim"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="r50-artry-shim h-4 w-32 rounded" />
          <div className="r50-artry-shim h-3 w-20 rounded" />
        </div>
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="r50-artry-shim h-12 w-16 rounded-xl flex-shrink-0" />
          ))}
        </div>
        <div className="r50-artry-shim h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: PulseRing (animated gradient + pulse ring)
   ═══════════════════════════════════════════════════════════ */

function PulseRing({ children }: { children: React.ReactNode }) {
  return (
    <div className="r50-artry-pulse-wrapper relative">
      {/* Outer pulse ring */}
      <motion.div
        className="r50-artry-pulse-ring absolute inset-0 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.15), rgba(14,165,233,0.15))',
          borderRadius: 'inherit',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Inner pulse ring */}
      <motion.div
        className="r50-artry-pulse-ring-inner absolute inset-0 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2))',
          borderRadius: 'inherit',
        }}
        animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: CategoryTabs
   ═══════════════════════════════════════════════════════════ */

function CategoryTabs({
  active,
  onChange,
}: {
  active: ProductCategory
  onChange: (c: ProductCategory) => void
}) {
  return (
    <div className="r50-artry-tabs flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORY_TABS.map((tab) => {
        const isActive = active === tab.id
        return (
          <motion.button
            key={tab.id}
            className="r50-artry-tab flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0"
            style={{
              background: isActive ? CATEGORY_META[tab.id].bgColor : 'rgba(0,0,0,0.03)',
              color: isActive ? '#4f46e5' : 'rgba(0,0,0,0.5)',
              border: isActive ? `1px solid ${CATEGORY_META[tab.id].bgColor.replace('0.12', '0.3')}` : '1px solid rgba(0,0,0,0.06)',
            }}
            onClick={() => onChange(tab.id)}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: ProductCarouselCard
   ═══════════════════════════════════════════════════════════ */

function ProductCarouselCard({
  product,
  isSelected,
  onClick,
}: {
  product: ARProduct
  isSelected: boolean
  onClick: () => void
}) {
  const meta = CATEGORY_META[product.category]
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  return (
    <motion.button
      className="r50-artry-carousel-card flex flex-col items-center gap-2 p-3 rounded-xl min-w-[120px] flex-shrink-0 transition-colors"
      style={{
        background: isSelected ? meta.bgColor : 'rgba(0,0,0,0.02)',
        border: isSelected ? `2px solid ${meta.bgColor.replace('0.12', '0.5')}` : '2px solid transparent',
      }}
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className="r50-artry-card-emoji h-14 w-14 rounded-xl flex items-center justify-center text-3xl"
        style={{ background: isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}
        animate={isSelected ? { rotate: [0, -5, 5, 0] } : {}}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {product.overlayEmoji}
      </motion.div>
      <div className="text-center">
        <p className="text-[11px] font-semibold leading-tight line-clamp-1">{product.name}</p>
        <div className="flex items-center gap-1 mt-0.5 justify-center">
          <span className="text-[11px] font-bold" style={{ color: '#4f46e5' }}>
            R${product.price.toFixed(2).replace('.', ',')}
          </span>
          {discount > 0 && (
            <span className="text-[9px] px-1 py-0.5 rounded font-bold" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              -{discount}%
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: ColorVariantSelector
   ═══════════════════════════════════════════════════════════ */

function ColorVariantSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: ProductColorVariant[]
  selected: ProductColorVariant
  onSelect: (v: ProductColorVariant) => void
}) {
  return (
    <div className="r50-artry-colors flex items-center gap-2 flex-wrap">
      {variants.map((v) => (
        <motion.button
          key={v.id}
          className="r50-artry-color-swatch relative h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: v.hex,
            boxShadow: selected.id === v.id
              ? `0 0 0 2px #ffffff, 0 0 0 4px ${v.hex}, 0 4px 12px rgba(0,0,0,0.2)`
              : '0 1px 4px rgba(0,0,0,0.12)',
          }}
          onClick={() => onSelect(v)}
          whileHover={{ scale: 1.2, y: -2 }}
          whileTap={{ scale: 0.9 }}
          title={v.name}
        >
          <AnimatePresence>
            {selected.id === v.id && (
              <motion.div
                className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center"
                style={{ background: v.hex }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
              >
                <Check className="h-2.5 w-2.5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Pulse ring on selection */}
          <AnimatePresence>
            {selected.id === v.id && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${v.hex}` }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </AnimatePresence>
        </motion.button>
      ))}
      <AnimatePresence mode="wait">
        <motion.span
          key={selected.id}
          className="text-xs font-medium ml-1"
          style={{ color: selected.hex }}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 5 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        >
          {selected.emoji} {selected.name}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: StyleSelector
   ═══════════════════════════════════════════════════════════ */

function StyleSelector({
  styles,
  selected,
  onSelect,
}: {
  styles: ProductStyle[]
  selected: ProductStyle
  onSelect: (s: ProductStyle) => void
}) {
  return (
    <div className="r50-artry-styles flex items-center gap-2">
      {styles.map((s) => {
        const isActive = selected.id === s.id
        return (
          <motion.button
            key={s.id}
            className="r50-artry-style-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: isActive ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.03)',
              color: isActive ? '#4f46e5' : 'rgba(0,0,0,0.45)',
              border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(0,0,0,0.06)',
            }}
            onClick={() => onSelect(s)}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm">{s.emoji}</span>
            <span>{s.name}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: ARQualityIndicator
   ═══════════════════════════════════════════════════════════ */

function ARQualityIndicator({ quality }: { quality: { level: ARQualityLevel; score: number; label: string } }) {
  const colors = QUALITY_COLORS[quality.level]
  return (
    <motion.div
      className="r50-artry-quality flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{ background: colors.bg }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
    >
      <motion.div
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: colors.bar }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <div className="flex items-center gap-2 flex-1">
        <span className="text-[10px] font-bold" style={{ color: colors.text }}>
          {quality.label}
        </span>
        <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: colors.bar }}
            initial={{ width: 0 }}
            animate={{ width: `${quality.score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[10px] font-mono font-bold" style={{ color: colors.text }}>
          {quality.score}%
        </span>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: LightingTipsOverlay
   ═══════════════════════════════════════════════════════════ */

function LightingTipsOverlay({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="r50-artry-tips-overlay absolute inset-0 z-30 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="r50-artry-tips-panel w-full max-w-sm rounded-2xl p-5 space-y-3"
            style={{ background: '#ffffff' }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(234,179,8,0.12)' }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Lightbulb className="h-4 w-4" style={{ color: '#eab308' }} />
                </motion.div>
                <h4 className="text-sm font-bold">Dicas de Iluminação</h4>
              </div>
              <motion.button
                className="min-h-[44px] min-w-[44px] h-7 w-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.06)' }}
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" style={{ color: 'rgba(0,0,0,0.5)' }} />
              </motion.button>
            </div>
            <div className="space-y-2.5">
              {LIGHTING_TIPS.map((tip, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.02)' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,0,0,0.04)' }}>
                    {tip.icon}
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(0,0,0,0.65)' }}>
                    {tip.tip}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: FlashEffect (camera shutter flash)
   ═══════════════════════════════════════════════════════════ */

function FlashEffect({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="r50-artry-flash absolute inset-0 z-20 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.95)' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: ShutterButton (Take Photo)
   ═══════════════════════════════════════════════════════════ */

function ShutterButton({
  isCapturing,
  onClick,
}: {
  isCapturing: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      className="r50-artry-shutter relative h-16 w-16 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 0 0 4px rgba(255,255,255,0.3), 0 4px 16px rgba(0,0,0,0.2)' }}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: isCapturing ? 0.85 : 0.92 }}
    >
      <motion.div
        className="r50-artry-shutter-inner h-12 w-12 rounded-full"
        style={{
          background: isCapturing
            ? 'linear-gradient(135deg, rgba(239,68,68,0.8), rgba(220,38,38,0.9))'
            : 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9))',
        }}
        animate={isCapturing ? { scale: [1, 0.6, 1] } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      />
      {/* Shutter ring animation */}
      {!isCapturing && (
        <motion.div
          className="r50-artry-shutter-ring absolute inset-0 rounded-full"
          style={{ border: '2px solid rgba(99,102,241,0.4)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: SharePhotoModal
   ═══════════════════════════════════════════════════════════ */

function SharePhotoModal({
  visible,
  onClose,
  onShare,
}: {
  visible: boolean
  onClose: () => void
  onShare: (platform: string) => void
}) {
  const shareOptions = [
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="h-5 w-5" />, color: '#25d366' },
    { id: 'instagram', label: 'Instagram', icon: <Camera className="h-5 w-5" />, color: '#e4405f' },
    { id: 'copy', label: 'Copiar Link', icon: <Share2 className="h-5 w-5" />, color: '#4f46e5' },
    { id: 'download', label: 'Baixar', icon: <Download className="h-5 w-5" />, color: '#0ea5e9' },
  ]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="r50-artry-share-overlay absolute inset-0 z-30 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="r50-artry-share-panel w-full max-w-xs rounded-2xl p-5"
            style={{ background: '#ffffff' }}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold mb-4 text-center">Compartilhar Foto</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {shareOptions.map((opt) => (
                <motion.button
                  key={opt.id}
                  className="r50-artry-share-option flex flex-col items-center gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.03)' }}
                  onClick={() => onShare(opt.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <motion.div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ background: `${opt.color}20`, color: opt.color }}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {opt.icon}
                  </motion.div>
                  <span className="text-[10px] font-semibold" style={{ color: 'rgba(0,0,0,0.65)' }}>
                    {opt.label}
                  </span>
                </motion.button>
              ))}
            </div>
            <motion.button
              className="w-full mt-4 py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.5)' }}
              onClick={onClose}
              whileTap={{ scale: 0.97 }}
            >
              Cancelar
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: PhotoGallery
   ═══════════════════════════════════════════════════════════ */

function PhotoGallery({
  photos,
  onSelect,
  onDelete,
  visible,
}: {
  photos: TakenPhoto[]
  onSelect: (photo: TakenPhoto) => void
  onDelete: (id: string) => void
  visible: boolean
}) {
  return (
    <AnimatePresence>
      {visible && photos.length > 0 && (
        <motion.div
          className="r50-artry-gallery absolute bottom-0 left-0 right-0 z-20"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
        >
          <div className="r50-artry-gallery-header flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Galeria ({photos.length})
              </span>
            </div>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Toque para ampliar
            </span>
          </div>
          <div className="r50-artry-gallery-scroll flex items-center gap-2 px-4 pb-4 overflow-x-auto">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                className="r50-artry-gallery-thumb relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25, delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={() => onSelect(photo)}
              >
                <div className="r50-artry-thumb-content w-full h-full flex items-center justify-center">
                  <span className="text-2xl">
                    {PRODUCTS.find((p) => p.id === photo.productId)?.overlayEmoji ?? '📷'}
                  </span>
                </div>
                {/* Delete button */}
                <motion.button
                  className="r50-artry-thumb-delete absolute top-0.5 right-0.5 h-5 w-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.6)' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(photo.id)
                  }}
                  whileTap={{ scale: 0.8 }}
                >
                  <Trash2 className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.8)' }} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: ToastNotification
   ═══════════════════════════════════════════════════════════ */

function ToastNotification({
  message,
  visible,
  icon,
}: {
  message: string
  visible: boolean
  icon: React.ReactNode
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="r50-artry-toast fixed bottom-6 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg"
          style={{
            background: 'rgba(0,0,0,0.85)',
            color: '#ffffff',
            transform: 'translateX(-50%)',
            backdropFilter: 'blur(12px)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
        >
          {icon}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-component: CameraViewOverlay (simulated AR camera)
   ═══════════════════════════════════════════════════════════ */

function CameraViewOverlay({
  product,
  colorVariant,
  styleVariant,
  rotation,
  scale,
  seeOnModel,
  quality,
  isDraggingRot,
  isCapturing,
  flashActive,
  showTips,
  showGallery,
  photos,
  showShareModal,
  onRotationChange,
  onScaleChange,
  onTakePhoto,
  onToggleTips,
  onToggleGallery,
  onPhotoSelect,
  onPhotoDelete,
  onSharePhoto,
  onCloseShare,
  onToggleSeeOnModel,
  onExit,
}: {
  product: ARProduct
  colorVariant: ProductColorVariant
  styleVariant: ProductStyle
  rotation: number
  scale: number
  seeOnModel: boolean
  quality: { level: ARQualityLevel; score: number; label: string }
  isDraggingRot: boolean
  isCapturing: boolean
  flashActive: boolean
  showTips: boolean
  showGallery: boolean
  photos: TakenPhoto[]
  showShareModal: boolean
  onRotationChange: (r: number) => void
  onScaleChange: (s: number) => void
  onTakePhoto: () => void
  onToggleTips: () => void
  onToggleGallery: () => void
  onPhotoSelect: (photo: TakenPhoto) => void
  onPhotoDelete: (id: string) => void
  onSharePhoto: (platform: string) => void
  onCloseShare: () => void
  onToggleSeeOnModel: () => void
  onExit: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef(0)
  const rotStartRef = useRef(0)
  const pinchStartDist = useRef(0)
  const pinchStartScale = useRef(1)

  /* ── Drag to rotate ── */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragStartRef.current = e.clientX
    rotStartRef.current = rotation
  }, [rotation])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.buttons === 1) {
      const delta = e.clientX - dragStartRef.current
      onRotationChange(rotStartRef.current + delta * 0.3)
    }
  }, [onRotationChange])

  /* ── Pinch / scroll to scale ── */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    onScaleChange(Math.max(0.5, Math.min(2.0, scale - e.deltaY * 0.002)))
  }, [scale, onScaleChange])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchStartDist.current = Math.sqrt(dx * dx + dy * dy)
      pinchStartScale.current = scale
    }
  }, [scale])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const newScale = pinchStartScale.current * (dist / pinchStartDist.current)
      onScaleChange(Math.max(0.5, Math.min(2.0, newScale)))
    }
  }, [onScaleChange])

  return (
    <div className="r50-artry-camera relative aspect-[3/4] sm:aspect-video overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Simulated camera background */}
      <div className="absolute inset-0">
        {/* Face placeholder area */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: seeOnModel ? 1 : 0.3 }}
          transition={{ duration: 0.5 }}
        >
          {seeOnModel ? (
            /* Model / avatar representation */
            <div className="r50-artry-model relative">
              <motion.div
                className="h-48 w-36 rounded-[50%] flex items-center justify-center"
                style={{
                  background: 'radial-gradient(ellipse at 50% 30%, rgba(210,180,140,0.3) 0%, rgba(180,150,120,0.15) 60%, transparent 100%)',
                }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <motion.span
                  className="text-7xl"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🧑
                </motion.span>
              </motion.div>
            </div>
          ) : (
            /* Simple face outline */
            <div className="r50-artry-face-outline">
              <motion.div
                className="h-40 w-28 rounded-[50%] flex items-center justify-center"
                style={{ border: '2px dashed rgba(255,255,255,0.15)' }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-4xl" style={{ opacity: 0.3 }}>👤</span>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(99,102,241,0.04) 0px, rgba(99,102,241,0.04) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(99,102,241,0.04) 0px, rgba(99,102,241,0.04) 1px, transparent 1px, transparent 40px)',
          }}
        />
        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(99,102,241,0.1) 0%, transparent 60%)' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Scanning line */}
        <motion.div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.6) 30%, rgba(99,102,241,0.8) 50%, rgba(99,102,241,0.6) 70%, transparent 100%)' }}
          animate={{ top: ['10%', '80%', '10%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Product overlay positioned on face */}
      <div
        ref={containerRef}
        className="r50-artry-overlay-area absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{ perspective: '800px' }}
      >
        <motion.div
          className="r50-artry-product-overlay flex items-center justify-center"
          style={{
            transform: `translate(${product.overlayOffset.x}px, ${product.overlayOffset.y}px) rotateY(${rotation}deg) scale(${scale})`,
            transformStyle: 'preserve-3d',
          }}
          animate={{
            y: [0, -4, 0],
            boxShadow: isDraggingRot
              ? '0 20px 50px rgba(99,102,241,0.25)'
              : '0 8px 30px rgba(0,0,0,0.3)',
          }}
          transition={{ type: 'spring' as const, stiffness: 150, damping: 20 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${styleVariant.id}-${colorVariant.id}`}
              className="r50-artry-emoji-product relative"
              initial={{ opacity: 0, scale: 0.5, rotateZ: -15 }}
              animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotateZ: 15 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            >
              <motion.span
                className="text-7xl sm:text-8xl drop-shadow-lg"
                style={{ filter: `drop-shadow(0 4px 16px ${colorVariant.hex}66)` }}
                animate={{ rotate: [0, rotation * 0.01, 0] }}
                transition={{ duration: 0.3 }}
              >
                {styleVariant.emoji}
              </motion.span>
              {/* Color tint overlay */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${colorVariant.hex}33 0%, transparent 70%)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Top bar ── */}
      <div className="r50-artry-topbar absolute top-0 left-0 right-0 z-10 p-3 flex items-center justify-between">
        <motion.button
          className="h-9 w-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={onExit}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <X className="h-4 w-4" style={{ color: '#ffffff' }} />
        </motion.button>

        <div className="flex items-center gap-2">
          {/* Quality indicator */}
          <ARQualityIndicator quality={quality} />

          {/* See on model toggle */}
          <motion.button
            className="r50-artry-model-toggle flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: seeOnModel ? 'rgba(99,102,241,0.3)' : 'rgba(0,0,0,0.4)',
              color: '#ffffff',
              backdropFilter: 'blur(8px)',
            }}
            onClick={onToggleSeeOnModel}
            whileTap={{ scale: 0.95 }}
          >
            <UserRound className="h-3.5 w-3.5" />
            <span>{seeOnModel ? 'Modelo' : 'Selfie'}</span>
          </motion.button>

          {/* Tips button */}
          <motion.button
            className="h-9 w-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
            onClick={onToggleTips}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Info className="h-4 w-4" style={{ color: '#eab308' }} />
          </motion.button>
        </div>
      </div>

      {/* ── Recording indicator ── */}
      <div className="r50-artry-rec absolute top-14 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
        <motion.div
          className="h-2 w-2 rounded-full"
          style={{ background: '#ef4444' }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[10px] font-mono font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>
          AR TRY-ON ATIVO
        </span>
      </div>

      {/* ── Rotation/Scale controls ── */}
      <div className="r50-artry-controls-left absolute left-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
        <motion.button
          className="h-9 w-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => onRotationChange(rotation - 15)}
          whileTap={{ scale: 0.85 }}
        >
          <ChevronLeft className="h-4 w-4" style={{ color: '#ffffff' }} />
        </motion.button>
        <motion.button
          className="h-9 w-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => onRotationChange(0)}
          whileTap={{ scale: 0.85 }}
        >
          <RotateCw className="h-4 w-4" style={{ color: '#ffffff' }} />
        </motion.button>
        <motion.button
          className="h-9 w-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => onRotationChange(rotation + 15)}
          whileTap={{ scale: 0.85 }}
        >
          <ChevronRight className="h-4 w-4" style={{ color: '#ffffff' }} />
        </motion.button>
        {/* Scale indicator */}
        <motion.div
          className="h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', color: '#ffffff' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {Math.round(scale * 100)}%
        </motion.div>
      </div>

      {/* ── Right side controls ── */}
      <div className="r50-artry-controls-right absolute right-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
        <motion.button
          className="h-9 w-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => onScaleChange(Math.min(2.0, scale + 0.1))}
          whileTap={{ scale: 0.85 }}
        >
          <Maximize2 className="h-4 w-4" style={{ color: '#ffffff' }} />
        </motion.button>
        <motion.button
          className="h-9 w-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => onScaleChange(Math.max(0.5, scale - 0.1))}
          whileTap={{ scale: 0.85 }}
        >
          <span className="text-sm" style={{ color: '#ffffff' }}>🔵</span>
        </motion.button>
      </div>

      {/* ── Product info badge ── */}
      <motion.div
        className="r50-artry-info-badge absolute bottom-20 left-3 right-3 z-10 flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
          style={{ background: CATEGORY_META[product.category].bgColor }}
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {product.overlayEmoji}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{product.name}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold" style={{ color: '#a5b4fc' }}>
              R${product.price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-[9px] line-through" style={{ color: 'rgba(255,255,255,0.4)' }}>
              R${product.originalPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: colorVariant.hex + '22' }}>
          <span className="text-sm">{colorVariant.emoji}</span>
          <span className="text-[10px] font-semibold" style={{ color: colorVariant.hex }}>{colorVariant.name}</span>
        </div>
      </motion.div>

      {/* ── Bottom capture controls ── */}
      <div className="r50-artry-bottom-controls absolute bottom-4 left-0 right-0 z-10 flex items-center justify-center gap-6 px-4">
        {/* Gallery toggle */}
        <motion.button
          className="h-12 w-12 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          onClick={onToggleGallery}
          whileTap={{ scale: 0.9 }}
        >
          <div className="relative">
            <Camera className="h-5 w-5" style={{ color: '#ffffff' }} />
            {photos.length > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: '#ef4444' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
              >
                {photos.length}
              </motion.div>
            )}
          </div>
        </motion.button>

        {/* Shutter button */}
        <ShutterButton isCapturing={isCapturing} onClick={onTakePhoto} />

        {/* Placeholder for symmetry / flip camera */}
        <motion.button
          className="h-12 w-12 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 0.6 }}
          >
            <RotateCw className="h-5 w-5" style={{ color: '#ffffff' }} />
          </motion.div>
        </motion.button>
      </div>

      {/* ── Overlays ── */}
      <FlashEffect active={flashActive} />
      <LightingTipsOverlay visible={showTips} onClose={onToggleTips} />
      <PhotoGallery
        photos={photos}
        onSelect={onPhotoSelect}
        onDelete={onPhotoDelete}
        visible={showGallery}
      />
      <SharePhotoModal
        visible={showShareModal}
        onClose={onCloseShare}
        onShare={onSharePhoto}
      />

      {/* Rotation angle display */}
      <motion.div
        className="absolute bottom-20 right-3 z-10 px-2 py-1 rounded-md text-[10px] font-mono font-bold"
        style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(165,180,252,0.9)', backdropFilter: 'blur(8px)' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {Math.round(((rotation % 360) + 360) % 360)}°
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT: ARVirtualTryOn
   ═══════════════════════════════════════════════════════════ */

export function ARVirtualTryOn() {
  /* ── State ── */
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('glasses')
  const [selectedProduct, setSelectedProduct] = useState<ARProduct>(PRODUCTS[0])
  const [selectedStyle, setSelectedStyle] = useState<ProductStyle>(PRODUCTS[0].styles[0])
  const [selectedColor, setSelectedColor] = useState<ProductColorVariant>(PRODUCTS[0].styles[0].colors[0])
  const [arActive, setArActive] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [seeOnModel, setSeeOnModel] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [flashActive, setFlashActive] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [photos, setPhotos] = useState<TakenPhoto[]>([])
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastIcon, setToastIcon] = useState<React.ReactNode>(null)
  const [quality, setQuality] = useState(() => getSimulatedQuality())
  const [savedToWishlist, setSavedToWishlist] = useState(false)
  const [wishlistAnimating, setWishlistAnimating] = useState(false)

  const carouselRef = useRef<HTMLDivElement>(null)

  /* ── Effects ── */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (toastVisible) {
      const t = setTimeout(() => setToastVisible(false), 2500)
      return () => clearTimeout(t)
    }
  }, [toastVisible])

  // Periodically update simulated quality
  useEffect(() => {
    if (!arActive) return
    const t = setInterval(() => {
      setQuality(getSimulatedQuality())
    }, 4000)
    return () => clearInterval(t)
  }, [arActive])

  /* ── Handlers ── */
  const showToast = useCallback((message: string, icon: React.ReactNode) => {
    setToastMessage(message)
    setToastIcon(icon)
    setToastVisible(true)
  }, [])

  const handleCategoryChange = useCallback((category: ProductCategory) => {
    setActiveCategory(category)
    const filtered = PRODUCTS.filter((p) => p.category === category)
    if (filtered.length > 0) {
      setSelectedProduct(filtered[0])
      setSelectedStyle(filtered[0].styles[0])
      setSelectedColor(filtered[0].styles[0].colors[0])
    }
  }, [])

  const handleProductSelect = useCallback((product: ARProduct) => {
    setSelectedProduct(product)
    setSelectedStyle(product.styles[0])
    setSelectedColor(product.styles[0].colors[0])
  }, [])

  const handleStyleSelect = useCallback((style: ProductStyle) => {
    setSelectedStyle(style)
    setSelectedColor(style.colors[0])
  }, [])

  const handleStartAR = useCallback(() => {
    setArActive(true)
    setRotation(0)
    setScale(1)
    setQuality(getSimulatedQuality())
  }, [])

  const handleExitAR = useCallback(() => {
    setArActive(false)
    setShowGallery(false)
    setShowTips(false)
    setShowShareModal(false)
  }, [])

  const handleTakePhoto = useCallback(() => {
    setIsCapturing(true)
    setFlashActive(true)
    setTimeout(() => {
      setFlashActive(false)
      const photo: TakenPhoto = {
        id: `photo-${Date.now()}`,
        timestamp: Date.now(),
        productId: selectedProduct.id,
        colorVariantId: selectedColor.id,
        styleId: selectedStyle.id,
        rotation,
        scale,
        seeOnModel,
      }
      setPhotos((prev) => [photo, ...prev])
      setIsCapturing(false)
      showToast('Foto capturada! 📸', <Camera className="h-4 w-4" />)
    }, 400)
  }, [selectedProduct.id, selectedColor.id, selectedStyle.id, rotation, scale, seeOnModel, showToast])

  const handlePhotoSelect = useCallback((photo: TakenPhoto) => {
    setShowGallery(false)
    setShowShareModal(true)
  }, [])

  const handlePhotoDelete = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    showToast('Foto removida', <Trash2 className="h-4 w-4" />)
  }, [showToast])

  const handleSharePhoto = useCallback((platform: string) => {
    setShowShareModal(false)
    const messages: Record<string, string> = {
      whatsapp: 'Compartilhado no WhatsApp!',
      instagram: 'Compartilhado no Instagram!',
      copy: 'Link copiado!',
      download: 'Download iniciado!',
    }
    const icons: Record<string, React.ReactNode> = {
      whatsapp: <MessageCircle className="h-4 w-4" />,
      instagram: <Camera className="h-4 w-4" />,
      copy: <Share2 className="h-4 w-4" />,
      download: <Download className="h-4 w-4" />,
    }
    showToast(messages[platform] ?? 'Compartilhado!', icons[platform] ?? <Share2 className="h-4 w-4" />)
  }, [showToast])

  const handleWishlist = useCallback(() => {
    setSavedToWishlist((v) => !v)
    setWishlistAnimating(true)
    setTimeout(() => setWishlistAnimating(false), 600)
    showToast(
      savedToWishlist ? 'Removido dos favoritos' : 'Salvo nos favoritos ❤️',
      <Heart className="h-4 w-4" style={{ color: savedToWishlist ? 'rgba(255,255,255,0.6)' : '#ef4444' }} />
    )
  }, [savedToWishlist, showToast])

  const handleShareProduct = useCallback(async () => {
    const shareData = {
      title: `${selectedProduct.name} — AR Try-On`,
      text: `Experimente ${selectedProduct.name} em realidade aumentada na DomPlace!`,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard?.writeText(shareData.text + ' ' + (shareData.url || ''))
      showToast('Link copiado!', <Share2 className="h-4 w-4" />)
    }
  }, [selectedProduct.name, showToast])

  const carouselScroll = useCallback((dir: 'left' | 'right') => {
    if (!carouselRef.current) return
    carouselRef.current.scrollBy({ left: dir === 'left' ? -140 : 140, behavior: 'smooth' })
  }, [])

  /* ── Loading state ── */
  if (loading) return <LoadingSkeleton />

  /* ── AR Active view ── */
  if (arActive) {
    return (
      <div className="r50-artry-container rounded-2xl overflow-hidden border border-border shadow-xl">
        <CameraViewOverlay
          product={selectedProduct}
          colorVariant={selectedColor}
          styleVariant={selectedStyle}
          rotation={rotation}
          scale={scale}
          seeOnModel={seeOnModel}
          quality={quality}
          isDraggingRot={false}
          isCapturing={isCapturing}
          flashActive={flashActive}
          showTips={showTips}
          showGallery={showGallery}
          photos={photos}
          showShareModal={showShareModal}
          onRotationChange={setRotation}
          onScaleChange={setScale}
          onTakePhoto={handleTakePhoto}
          onToggleTips={() => setShowTips((v) => !v)}
          onToggleGallery={() => setShowGallery((v) => !v)}
          onPhotoSelect={handlePhotoSelect}
          onPhotoDelete={handlePhotoDelete}
          onSharePhoto={handleSharePhoto}
          onCloseShare={() => setShowShareModal(false)}
          onToggleSeeOnModel={() => setSeeOnModel((v) => !v)}
          onExit={handleExitAR}
        />
      </div>
    )
  }

  /* ── Default (pre-AR) view ── */
  const categoryProducts = PRODUCTS.filter((p) => p.category === activeCategory)

  return (
    <div className="r50-artry-container rounded-2xl overflow-hidden border border-border shadow-xl" style={{ background: '#ffffff' }}>
      {/* ═══ TOOLBAR ═══ */}
      <div className="r50-artry-toolbar flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="r50-artry-toolbar-icon h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="text-lg"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              🥽
            </motion.span>
          </motion.div>
          <div>
            <h3 className="text-sm font-bold leading-tight">AR Virtual Try-On</h3>
            <p className="text-[10px]" style={{ color: 'rgba(0,0,0,0.45)' }}>Experimente em realidade aumentada</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Share */}
          <motion.button
            className="min-h-[44px] min-w-[44px] h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.04)' }}
            onClick={handleShareProduct}
            whileTap={{ scale: 0.92 }}
          >
            <Share2 className="h-4 w-4" style={{ color: 'rgba(0,0,0,0.45)' }} />
          </motion.button>
          {/* Wishlist */}
          <motion.button
            className="min-h-[44px] min-w-[44px] h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: savedToWishlist ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.04)' }}
            onClick={handleWishlist}
            whileTap={{ scale: 0.92 }}
          >
            <motion.div animate={wishlistAnimating ? { scale: [1, 1.4, 1] } : {} } transition={{ duration: 0.4 }}>
              <Heart
                className="h-4 w-4"
                style={{
                  color: savedToWishlist ? '#ef4444' : 'rgba(0,0,0,0.4)',
                  fill: savedToWishlist ? '#ef4444' : 'none',
                }}
              />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* ═══ CATEGORY TABS ═══ */}
      <div className="r50-artry-tabbar px-4 pt-3 pb-2">
        <CategoryTabs active={activeCategory} onChange={handleCategoryChange} />
      </div>

      {/* ═══ PRODUCT CAROUSEL ═══ */}
      <div className="r50-artry-carousel-wrapper relative">
        {/* Scroll arrows */}
        <motion.button
          className="r50-artry-carousel-arrow absolute left-1 top-1/2 -translate-y-1/2 z-10 min-h-[44px] min-w-[44px] h-8 w-8 rounded-full flex items-center justify-center shadow-md"
          style={{ background: 'rgba(255,255,255,0.9)' }}
          onClick={() => carouselScroll('left')}
          whileTap={{ scale: 0.85 }}
        >
          <ChevronLeft className="h-4 w-4" style={{ color: 'rgba(0,0,0,0.5)' }} />
        </motion.button>

        <div
          ref={carouselRef}
          className="r50-artry-carousel flex items-center gap-3 px-8 py-3 overflow-x-auto scrollbar-hide"
        >
          {categoryProducts.map((product) => (
            <ProductCarouselCard
              key={product.id}
              product={product}
              isSelected={selectedProduct.id === product.id}
              onClick={() => handleProductSelect(product)}
            />
          ))}
        </div>

        <motion.button
          className="r50-artry-carousel-arrow absolute right-1 top-1/2 -translate-y-1/2 z-10 min-h-[44px] min-w-[44px] h-8 w-8 rounded-full flex items-center justify-center shadow-md"
          style={{ background: 'rgba(255,255,255,0.9)' }}
          onClick={() => carouselScroll('right')}
          whileTap={{ scale: 0.85 }}
        >
          <ChevronRight className="h-4 w-4" style={{ color: 'rgba(0,0,0,0.5)' }} />
        </motion.button>
      </div>

      {/* ═══ PREVIEW AREA ═══ */}
      <div className="r50-artry-preview relative mx-4 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(15,15,25,0.95) 0%, rgba(10,10,18,0.98) 100%)' }}>
        <div className="aspect-[3/4] sm:aspect-video relative flex items-center justify-center">
          {/* Animated background grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(99,102,241,0.04) 0px, rgba(99,102,241,0.04) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(99,102,241,0.04) 0px, rgba(99,102,241,0.04) 1px, transparent 1px, transparent 40px)',
            }}
          />

          {/* Face silhouette */}
          <motion.div
            className="relative"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.span className="text-6xl sm:text-7xl">🧑</motion.span>
            {/* Product overlay preview */}
            <AnimatePresence mode="wait">
              <motion.span
                key={`${selectedStyle.id}-${selectedColor.id}`}
                className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl sm:text-5xl"
                style={{ transform: `translate(-50%, ${selectedProduct.overlayOffset.y}px)` }}
                initial={{ opacity: 0, scale: 0.3, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: 20 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
              >
                {selectedStyle.emoji}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Scanning line */}
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }}
            animate={{ top: ['15%', '75%', '15%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Corner decorations */}
          {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((corner, i) => {
            const isLeft = corner.includes('left')
            const isTop = corner.includes('top')
            return (
              <motion.div
                key={corner}
                className="absolute"
                style={{
                  [isLeft ? 'left' : 'right']: 12,
                  [isTop ? 'top' : 'bottom']: 12,
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: i * 0.1 }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d={isTop && isLeft ? 'M2 8V2H8' : isTop && !isLeft ? 'M12 2H18V8' : isTop ? 'M2 8V2H8' : ''}
                    stroke="rgba(99,102,241,0.7)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform={!isLeft && isTop ? 'translate(0,0)' : !isLeft && !isTop ? 'translate(0,0)' : 'translate(0,0)'}
                  />
                  {isTop && isLeft && <path d="M2 8V2H8" stroke="rgba(99,102,241,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
                  {isTop && !isLeft && <path d="M12 2H18V8" stroke="rgba(99,102,241,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
                  {!isTop && isLeft && <path d="M2 12V18H8" stroke="rgba(99,102,241,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
                  {!isTop && !isLeft && <path d="M18 12V18H12" stroke="rgba(99,102,241,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
                </svg>
              </motion.div>
            )
          })}

          {/* AR label */}
          <motion.div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              className="h-2 w-2 rounded-full"
              style={{ background: '#ef4444' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[10px] font-mono font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>
              AR PREVIEW
            </span>
          </motion.div>

          {/* Category badge */}
          <motion.div
            className="absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold"
            style={{ background: CATEGORY_META[activeCategory].bgColor, color: '#4f46e5' }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {CATEGORY_META[activeCategory].icon} {CATEGORY_META[activeCategory].label}
          </motion.div>
        </div>
      </div>

      {/* ═══ STYLE SELECTOR ═══ */}
      <div className="r50-artry-style-section px-4 pt-3">
        <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(0,0,0,0.6)' }}>Estilo</p>
        <StyleSelector
          styles={selectedProduct.styles}
          selected={selectedStyle}
          onSelect={handleStyleSelect}
        />
      </div>

      {/* ═══ COLOR VARIANT SELECTOR ═══ */}
      <div className="r50-artry-color-section px-4 pt-3">
        <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(0,0,0,0.6)' }}>Cor</p>
        <ColorVariantSelector
          variants={selectedStyle.colors}
          selected={selectedColor}
          onSelect={setSelectedColor}
        />
      </div>

      {/* ═══ START AR BUTTON ═══ */}
      <div className="r50-artry-start-section px-4 pt-4 pb-4">
        <PulseRing>
          <motion.button
            className="r50-artry-start-btn w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9), rgba(236,72,153,0.9))',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            }}
            onClick={handleStartAR}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              className="text-lg"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              🥽
            </motion.span>
            <span>Iniciar AR Try-On</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
          </motion.button>
        </PulseRing>

        {/* Quick info */}
        <div className="r50-artry-quick-info flex items-center justify-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(0,0,0,0.4)' }}>
            <Sun className="h-3 w-3" />
            <span>Arraste para girar</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(0,0,0,0.4)' }}>
            <Maximize2 className="h-3 w-3" />
            <span>Scroll para zoom</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(0,0,0,0.4)' }}>
            <Camera className="h-3 w-3" />
            <span>Tire uma foto</span>
          </div>
        </div>
      </div>

      {/* ═══ TOAST ═══ */}
      <ToastNotification message={toastMessage} visible={toastVisible} icon={toastIcon} />
    </div>
  )
}
