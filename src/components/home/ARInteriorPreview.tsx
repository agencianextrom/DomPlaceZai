'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Maximize2,
  Share2,
  ShoppingCart,
  RotateCw,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  Sparkles,
  Lightbulb,
  Home,
  BedDouble,
  CookingPot,
  Monitor,
  ImageIcon,
  Layers,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════ */

type RoomType = 'sala' | 'quarto' | 'cozinha' | 'escritorio'

interface FurnitureColor {
  id: string
  name: string
  hex: string
}

interface FurnitureItem {
  id: string
  name: string
  emoji: string
  price: number
  originalPrice: number
  colors: FurnitureColor[]
  dimensions: { w: number; h: number; d: number }
  rating: number
}

interface RoomTemplate {
  id: RoomType
  label: string
  emoji: string
  description: string
  wallColor: string
  floorColor: string
  defaultW: number
  defaultH: number
}

interface DecorationTip {
  id: number
  title: string
  description: string
  emoji: string
}

const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'sala',
    label: 'Sala de Estar',
    emoji: '🛋️',
    description: 'Ambiente aconchegante para reunir a família',
    wallColor: '#f5f0e8',
    floorColor: '#c4a882',
    defaultW: 5,
    defaultH: 4,
  },
  {
    id: 'quarto',
    label: 'Quarto',
    emoji: '🛏️',
    description: 'Seu refúgio pessoal de descanso',
    wallColor: '#e8edf5',
    floorColor: '#b89e78',
    defaultW: 4,
    defaultH: 4,
  },
  {
    id: 'cozinha',
    label: 'Cozinha',
    emoji: '🍳',
    description: 'Espaço funcional e moderno para cozinhar',
    wallColor: '#f0f5f0',
    floorColor: '#a89888',
    defaultW: 4,
    defaultH: 3,
  },
  {
    id: 'escritorio',
    label: 'Escritório',
    emoji: '💼',
    description: 'Área produtiva para trabalho remoto',
    wallColor: '#f2f0f5',
    floorColor: '#bab0a0',
    defaultW: 3,
    defaultH: 3,
  },
]

const FURNITURE_ITEMS: FurnitureItem[] = [
  {
    id: 'sofa',
    name: 'Sofá Retrátil Premium',
    emoji: '🛋️',
    price: 2899.9,
    originalPrice: 3999.9,
    colors: [
      { id: 'sc1', name: 'Cinza Claro', hex: '#8c8c8c' },
      { id: 'sc2', name: 'Azul Petróleo', hex: '#2d5a6b' },
      { id: 'sc3', name: 'Marrom Café', hex: '#6b4226' },
      { id: 'sc4', name: 'Verde Oliva', hex: '#5c6b3a' },
    ],
    dimensions: { w: 220, h: 90, d: 95 },
    rating: 4.8,
  },
  {
    id: 'mesa',
    name: 'Mesa de Jantar 6 Lugares',
    emoji: '🪑',
    price: 1899.9,
    originalPrice: 2499.9,
    colors: [
      { id: 'mc1', name: 'Nogueira', hex: '#6b4226' },
      { id: 'mc2', name: 'Branco Mate', hex: '#e8e0d4' },
      { id: 'mc3', name: 'Carvalho', hex: '#a08060' },
      { id: 'mc4', name: 'Preto Fosco', hex: '#2a2a2a' },
    ],
    dimensions: { w: 160, h: 76, d: 90 },
    rating: 4.6,
  },
  {
    id: 'cadeira',
    name: 'Poltrona Eames Replica',
    emoji: '💺',
    price: 1299.9,
    originalPrice: 1799.9,
    colors: [
      { id: 'pc1', name: 'Preto', hex: '#1a1a1a' },
      { id: 'pc2', name: 'Caramelo', hex: '#c4813a' },
      { id: 'pc3', name: 'Vermelho', hex: '#b83232' },
      { id: 'pc4', name: 'Navy', hex: '#1e2d4a' },
    ],
    dimensions: { w: 65, h: 85, d: 70 },
    rating: 4.9,
  },
  {
    id: 'estante',
    name: 'Estante Modulável',
    emoji: '📚',
    price: 999.9,
    originalPrice: 1399.9,
    colors: [
      { id: 'ec1', name: 'Madeira Natural', hex: '#a08060' },
      { id: 'ec2', name: 'Branco', hex: '#f0ece4' },
      { id: 'ec3', name: 'Rosa Pastel', hex: '#d4a0a0' },
      { id: 'ec4', name: 'Menta', hex: '#7ab09a' },
    ],
    dimensions: { w: 120, h: 180, d: 35 },
    rating: 4.5,
  },
  {
    id: 'lampada',
    name: 'Luminária Arco Designer',
    emoji: '💡',
    price: 699.9,
    originalPrice: 999.9,
    colors: [
      { id: 'lc1', name: 'Dourado', hex: '#c4a040' },
      { id: 'lc2', name: 'Preto', hex: '#2a2a2a' },
      { id: 'lc3', name: 'Cromado', hex: '#a0a0a8' },
      { id: 'lc4', name: 'Cobre', hex: '#b07040' },
    ],
    dimensions: { w: 150, h: 200, d: 40 },
    rating: 4.7,
  },
  {
    id: 'quadro',
    name: 'Quadro Canvas Abstract',
    emoji: '🖼️',
    price: 349.9,
    originalPrice: 499.9,
    colors: [
      { id: 'qc1', name: 'Multicolorido', hex: '#d45050' },
      { id: 'qc2', name: 'Azul e Branco', hex: '#4080c0' },
      { id: 'qc3', name: 'Preto e Dourado', hex: '#c4a040' },
      { id: 'qc4', name: 'Terracota', hex: '#c07848' },
    ],
    dimensions: { w: 100, h: 70, d: 4 },
    rating: 4.4,
  },
]

const DECORATION_TIPS: DecorationTip[] = [
  {
    id: 1,
    title: 'Regra dos Terços',
    description: 'Divida sua parede em três partes e posicione o móvel principal no terço central para equilíbrio visual.',
    emoji: '📐',
  },
  {
    id: 2,
    title: 'Iluminação é Tudo',
    description: 'Use 3 camadas de luz: geral, tarefa e ambiente. Pendentes sobre mesas criam pontos focais aconchegantes.',
    emoji: '✨',
  },
  {
    id: 3,
    title: 'Proporção é Fundamental',
    description: 'Móveis grandes em espaços pequenos ou vice-versa desequilibram o ambiente. Meça antes de comprar!',
    emoji: '📏',
  },
  {
    id: 4,
    title: 'Cores que Conversam',
    description: 'Combine no máximo 3 cores base. Use a regra 60-30-10: 60% dominante, 30% secundária, 10% destaque.',
    emoji: '🎨',
  },
]

const springConfig = { type: 'spring' as const, stiffness: 350, damping: 25 }

/* ═══════════════════════════════════════════════════════
   Loading Shimmer
   ═══════════════════════════════════════════════════════ */
function LoadingShimmer() {
  return (
    <div className="r48-shimmer-wrapper rounded-2xl overflow-hidden border border-border">
      <div className="r48-shimmer-header flex items-center justify-between p-4 border-b border-border">
        <div className="r48-shimmer-badge h-8 w-40 rounded-lg" />
        <div className="flex gap-2">
          <div className="r48-shimmer-dot h-8 w-8 rounded-full" />
          <div className="r48-shimmer-dot h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="aspect-video relative overflow-hidden">
        <div className="absolute inset-0 r48-shimmer-bg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
          <div className="r48-shimmer-circle h-20 w-20 rounded-full" />
          <div className="r48-shimmer-line h-4 w-48 rounded" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="r48-shimmer-line h-20 flex-1 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="r48-shimmer-swatch h-10 w-10 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Room Card Selector
   ═══════════════════════════════════════════════════════ */
function RoomSelector({
  selected,
  onSelect,
}: {
  selected: RoomType
  onSelect: (room: RoomType) => void
}) {
  const iconMap: Record<RoomType, typeof Home> = {
    sala: Home,
    quarto: BedDouble,
    cozinha: CookingPot,
    escritorio: Monitor,
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {ROOM_TEMPLATES.map((room) => {
        const Icon = iconMap[room.id]
        const isActive = selected === room.id
        return (
          <motion.button
            key={room.id}
            className="r48-room-card relative flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-colors"
            style={{
              background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.03)',
              border: isActive ? '2px solid rgba(16,185,129,0.35)' : '2px solid rgba(0,0,0,0.06)',
            }}
            onClick={() => onSelect(room.id)}
            whileTap={{ scale: 0.96 }}
          >
            <motion.div
              animate={{ scale: isActive ? 1.1 : 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            >
              <span className="text-2xl">{room.emoji}</span>
            </motion.div>
            <span
              className="text-[11px] font-bold leading-tight"
              style={{ color: isActive ? '#059669' : 'rgba(0,0,0,0.6)' }}
            >
              {room.label}
            </span>
            {isActive && (
              <motion.div
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center"
                style={{ background: '#10b981' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
              >
                <Check className="h-2.5 w-2.5 text-white" />
              </motion.div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Furniture Product Grid
   ═══════════════════════════════════════════════════════ */
function FurnitureGrid({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
      {FURNITURE_ITEMS.map((item) => {
        const isActive = selected === item.id
        const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        return (
          <motion.button
            key={item.id}
            className="r48-furniture-card relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors"
            style={{
              background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.02)',
              border: isActive ? '2px solid rgba(16,185,129,0.4)' : '2px solid rgba(0,0,0,0.06)',
            }}
            onClick={() => onSelect(item.id)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="text-3xl"
              animate={{ rotate: isActive ? [0, -8, 8, -8, 0] : 0 }}
              transition={{ duration: 0.5 }}
            >
              {item.emoji}
            </motion.span>
            <span
              className="text-[9px] font-bold leading-tight text-center"
              style={{ color: isActive ? '#059669' : 'rgba(0,0,0,0.5)' }}
            >
              {item.name.split(' ').slice(0, 2).join(' ')}
            </span>
            {discount > 0 && (
              <span
                className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
              >
                -{discount}%
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   AR Room Preview Panel (Simulated)
   ═══════════════════════════════════════════════════════ */
function ARPreviewPanel({
  room,
  furniture,
  selectedColor,
  rotation,
  scale,
  width,
  height,
  showFurniture,
  isPlacing,
}: {
  room: RoomTemplate
  furniture: FurnitureItem | null
  selectedColor: FurnitureColor
  rotation: number
  scale: number
  width: number
  height: number
  showFurniture: boolean
  isPlacing: boolean
}) {
  return (
    <div
      className="r48-room-preview relative aspect-video rounded-xl overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${room.wallColor} 0%, ${room.wallColor} 60%, ${room.floorColor} 60%, ${room.floorColor} 100%)`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      }}
    >
      {/* AR scanning grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(16,185,129,0.04) 0px, rgba(16,185,129,0.04) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(16,185,129,0.04) 0px, rgba(16,185,129,0.04) 1px, transparent 1px, transparent 40px)',
        }}
      />

      {/* AR status badge */}
      <motion.div
        className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
      >
        <motion.div
          className="h-2 w-2 rounded-full"
          style={{ background: '#10b981' }}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[10px] font-mono font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
          AR INTERIOR ATIVO
        </span>
      </motion.div>

      {/* Room dimensions overlay */}
      <motion.div
        className="absolute top-3 right-3 z-10 px-2 py-1 rounded-lg text-[10px] font-mono font-bold"
        style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25, delay: 0.1 }}
      >
        {width}m × {height}m
      </motion.div>

      {/* Dimension lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-5" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Bottom dimension line */}
        <motion.line
          x1="10" y1="95" x2="90" y2="95"
          stroke="rgba(16,185,129,0.4)"
          strokeWidth="0.3"
          strokeDasharray="1 0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        {/* Right dimension line */}
        <motion.line
          x1="95" y1="10" x2="95" y2="60"
          stroke="rgba(16,185,129,0.4)"
          strokeWidth="0.3"
          strokeDasharray="1 0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
        {/* Width label */}
        <text x="50" y="97" textAnchor="middle" fill="rgba(16,185,129,0.6)" fontSize="2" fontFamily="monospace" fontWeight="bold">
          {width}m
        </text>
        {/* Height label */}
        <text x="97" y="38" textAnchor="start" fill="rgba(16,185,129,0.6)" fontSize="2" fontFamily="monospace" fontWeight="bold">
          {height}m
        </text>
      </svg>

      {/* Baseboard line */}
      <div
        className="absolute left-0 right-0 z-2"
        style={{ top: '60%', height: '1px', background: 'rgba(0,0,0,0.08)' }}
      />

      {/* Empty room state */}
      {!showFurniture && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
            className="text-center"
          >
            <span className="text-4xl block mb-2 opacity-30">🏠</span>
            <p className="text-xs font-medium" style={{ color: 'rgba(0,0,0,0.3)' }}>
              Selecione um móvel para posicionar
            </p>
          </motion.div>
        </div>
      )}

      {/* Furniture in room */}
      <AnimatePresence>
        {showFurniture && furniture && (
          <motion.div
            key={`${furniture.id}-${selectedColor.id}`}
            className="absolute z-6 flex flex-col items-center justify-center"
            style={{
              top: '55%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.3, y: 40 }}
            animate={{
              opacity: 1,
              scale: isPlacing ? 1.15 : scale,
              y: 0,
              rotate: rotation,
            }}
            transition={{
              type: 'spring' as const,
              stiffness: isPlacing ? 500 : 300,
              damping: isPlacing ? 15 : 25,
            }}
          >
            {/* Shadow */}
            <motion.div
              className="absolute rounded-full"
              style={{
                bottom: '-4px',
                width: '80%',
                height: '12px',
                background: 'rgba(0,0,0,0.15)',
                filter: 'blur(4px)',
              }}
              animate={{ scaleX: scale * 0.8 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            />
            {/* Furniture emoji */}
            <motion.span
              className="text-6xl sm:text-7xl"
              animate={{ rotate: isPlacing ? [0, 5, -5, 0] : 0 }}
              transition={{ duration: 0.4 }}
            >
              {furniture.emoji}
            </motion.span>
            {/* Color tint overlay */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: selectedColor.hex,
                opacity: 0.12,
                mixBlendMode: 'multiply',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.12 }}
              transition={{ duration: 0.5 }}
            />
            {/* Placement ripple animation */}
            {isPlacing && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: 'rgba(16,185,129,0.5)' }}
                  animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: 'rgba(16,185,129,0.3)' }}
                  animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner brackets */}
      {[
        { top: '6px', left: '6px', borderB: '2px solid rgba(16,185,129,0.6)', borderR: '2px solid rgba(16,185,129,0.6)', w: '16px', h: '16px' },
        { top: '6px', right: '6px', borderB: '2px solid rgba(16,185,129,0.6)', borderL: '2px solid rgba(16,185,129,0.6)', w: '16px', h: '16px' },
        { bottom: '6px', left: '6px', borderT: '2px solid rgba(16,185,129,0.6)', borderR: '2px solid rgba(16,185,129,0.6)', w: '16px', h: '16px' },
        { bottom: '6px', right: '6px', borderT: '2px solid rgba(16,185,129,0.6)', borderL: '2px solid rgba(16,185,129,0.6)', w: '16px', h: '16px' },
      ].map((corner, i) => (
        <motion.div
          key={i}
          className="absolute z-8 pointer-events-none"
          style={{
            top: corner.top,
            left: corner.left,
            right: corner.right,
            bottom: corner.bottom,
            width: corner.w,
            height: corner.h,
            borderBottom: corner.borderB,
            borderRight: corner.borderR,
            borderTop: corner.borderT,
            borderLeft: corner.borderL,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.1 + i * 0.08 }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Color Swatches
   ═══════════════════════════════════════════════════════ */
function FurnitureColorSwatches({
  colors,
  selected,
  onSelect,
}: {
  colors: FurnitureColor[]
  selected: FurnitureColor
  onSelect: (c: FurnitureColor) => void
}) {
  return (
    <div className="r48-color-swatches flex items-center gap-2">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0">
        Cor:
      </span>
      <div className="flex items-center gap-2">
        {colors.map((c) => (
          <motion.button
            key={c.id}
            className="r48-color-swatch relative h-7 w-7 min-h-[44px] min-w-[44px] rounded-full flex-shrink-0"
            style={{
              backgroundColor: c.hex,
              boxShadow: selected.id === c.id
                ? `0 0 0 2px #ffffff, 0 0 0 4px ${c.hex}, 0 3px 10px rgba(0,0,0,0.2)`
                : '0 1px 3px rgba(0,0,0,0.12)',
            }}
            onClick={() => onSelect(c)}
            whileHover={{ scale: 1.2, y: -2 }}
            whileTap={{ scale: 0.9 }}
            title={c.name}
          >
            <AnimatePresence>
              {selected.id === c.id && (
                <motion.div
                  className="absolute inset-0 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                >
                  <Check className="h-3 w-3 text-white drop-shadow" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
        <motion.span
          key={selected.id}
          className="text-[11px] font-medium text-muted-foreground ml-1"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        >
          {selected.name}
        </motion.span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Rotation Slider
   ═══════════════════════════════════════════════════════ */
function RotationSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="r48-rotation-slider space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <RotateCw className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground">Rotação 360°</span>
        </div>
        <span
          className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}
        >
          {Math.round(((value % 360) + 360) % 360)}°
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={360}
          value={Math.round(((value % 360) + 360) % 360)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="r48-range-slider w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(90deg, rgba(16,185,129,0.3) ${((value % 360) + 360) % 360 / 3.6}%, rgba(0,0,0,0.08) ${((value % 360) + 360) % 360 / 3.6}%)`,
          }}
        />
        {/* Compass indicator */}
        <motion.div
          className="absolute -top-1 pointer-events-none"
          style={{ left: `${(((value % 360) + 360) % 360) / 360 * 100}%` }}
          animate={{ left: `${(((value % 360) + 360) % 360) / 360 * 100}%` }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 30 }}
        >
          <div
            className="h-4 w-4 rounded-full border-2 flex items-center justify-center"
            style={{ background: '#10b981', borderColor: '#ffffff', transform: 'translateX(-50%)' }}
          >
            <motion.div
              className="h-1.5 w-0.5 rounded-full"
              style={{ background: '#ffffff' }}
              animate={{ rotate: value }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Scale Control
   ═══════════════════════════════════════════════════════ */
function ScaleControl({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const scales = [1, 1.5, 2] as const
  const label = value === 2 ? '2.0x' : value === 1.5 ? '1.5x' : '1.0x'

  return (
    <div className="r48-scale-control space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground">Escala</span>
        </div>
        <motion.span
          key={label}
          className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
        >
          {label}
        </motion.span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={1}
          max={2}
          step={0.5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="r48-range-slider flex-1 h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(90deg, rgba(16,185,129,0.3) ${((value - 1) / 1) * 100}%, rgba(0,0,0,0.08) ${((value - 1) / 1) * 100}%)`,
          }}
        />
        <div className="flex gap-1">
          {scales.map((s) => (
            <motion.button
              key={s}
              className="px-2 py-1 rounded-md text-[10px] font-bold"
              style={{
                background: value === s ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.04)',
                color: value === s ? '#059669' : 'rgba(0,0,0,0.4)',
                border: value === s ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(0,0,0,0.06)',
              }}
              onClick={() => onChange(s)}
              whileTap={{ scale: 0.92 }}
            >
              {s === 2 ? '2x' : s === 1.5 ? '1.5x' : '1x'}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Room Dimensions Input
   ═══════════════════════════════════════════════════════ */
function RoomDimensionsInput({
  width,
  height,
  onChangeWidth,
  onChangeHeight,
}: {
  width: number
  height: number
  onChangeWidth: (v: number) => void
  onChangeHeight: (v: number) => void
}) {
  return (
    <div className="r48-dimensions-input space-y-2">
      <div className="flex items-center gap-1.5">
        <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold text-muted-foreground">Dimensões do Cômodo</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <span className="text-[10px] text-muted-foreground">Larg.</span>
          <input
            type="number"
            min={2}
            max={12}
            step={0.5}
            value={width}
            onChange={(e) => onChangeWidth(Number(e.target.value))}
            className="w-12 text-center text-sm font-bold bg-transparent outline-none"
          />
          <span className="text-[10px] text-muted-foreground">m</span>
        </div>
        <span className="text-sm font-bold text-muted-foreground">×</span>
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <span className="text-[10px] text-muted-foreground">Alt.</span>
          <input
            type="number"
            min={2}
            max={10}
            step={0.5}
            value={height}
            onChange={(e) => onChangeHeight(Number(e.target.value))}
            className="w-12 text-center text-sm font-bold bg-transparent outline-none"
          />
          <span className="text-[10px] text-muted-foreground">m</span>
        </div>
        <motion.div
          className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-center"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}
          key={`${width}-${height}`}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
        >
          {(width * height).toFixed(1)}m²
        </motion.div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Before / After Comparison Slider
   ═══════════════════════════════════════════════════════ */
function BeforeAfterSlider({
  room,
  furniture,
  selectedColor,
}: {
  room: RoomTemplate
  furniture: FurnitureItem | null
  selectedColor: FurnitureColor
}) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = clientX - rect.left
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100))
    setSliderPos(pct)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    handleMove(e.clientX)
  }, [handleMove])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    handleMove(e.clientX)
  }, [handleMove])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  return (
    <div
      ref={containerRef}
      className="r48-comparison-slider relative aspect-video rounded-xl overflow-hidden cursor-col-resize select-none"
      style={{ border: '1px solid rgba(0,0,0,0.08)' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* After (with furniture) - full background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${room.wallColor} 0%, ${room.wallColor} 60%, ${room.floorColor} 60%, ${room.floorColor} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(16,185,129,0.04) 0px, rgba(16,185,129,0.04) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(16,185,129,0.04) 0px, rgba(16,185,129,0.04) 1px, transparent 1px, transparent 40px)',
          }}
        />
        {/* Furniture */}
        {furniture && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ top: '-5%' }}>
            <span className="text-5xl">{furniture.emoji}</span>
          </div>
        )}
      </div>

      {/* Before (without furniture) - clipped */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
        <div
          className="absolute inset-0"
          style={{
            width: `${(100 / sliderPos) * 100}%`,
            maxWidth: 'none',
            background: `linear-gradient(180deg, ${room.wallColor} 0%, ${room.wallColor} 60%, ${room.floorColor} 60%, ${room.floorColor} 100%)`,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 40px)',
            }}
          />
        </div>
      </div>

      {/* Slider line */}
      <motion.div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${sliderPos}%`, width: 3, background: '#ffffff', transform: 'translateX(-50%)' }}
      >
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}
        >
          <ChevronLeft className="h-3 w-3 text-gray-600 absolute -left-0.5" />
          <ChevronRight className="h-3 w-3 text-gray-600 absolute -right-0.5" />
        </motion.div>
      </motion.div>

      {/* Labels */}
      <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-md text-[9px] font-bold" style={{ background: 'rgba(0,0,0,0.6)', color: '#ffffff' }}>
        SEM MÓVEL
      </div>
      <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-md text-[9px] font-bold" style={{ background: 'rgba(16,185,129,0.85)', color: '#ffffff' }}>
        COM MÓVEL
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Compare Placement Split View
   ═══════════════════════════════════════════════════════ */
function ComparePlacement({
  show,
  room,
  furniture,
  selectedColor,
}: {
  show: boolean
  room: RoomTemplate
  furniture: FurnitureItem | null
  selectedColor: FurnitureColor
}) {
  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-2 gap-3">
        {/* Without furniture */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Original</span>
          <div
            className="aspect-video rounded-xl overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${room.wallColor} 0%, ${room.wallColor} 60%, ${room.floorColor} 60%, ${room.floorColor} 100%)`,
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl opacity-20">🏠</span>
            </div>
          </div>
        </div>
        {/* With furniture */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#059669' }}>
            Com {furniture?.name.split(' ')[0]}
          </span>
          <div
            className="relative aspect-video rounded-xl overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${room.wallColor} 0%, ${room.wallColor} 60%, ${room.floorColor} 60%, ${room.floorColor} 100%)`,
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ top: '-5%' }}
            >
              <motion.span
                className="text-4xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
              >
                {furniture?.emoji}
              </motion.span>
            </div>
            <div
              className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[8px] font-bold"
              style={{ background: 'rgba(16,185,129,0.8)', color: '#ffffff' }}
            >
              + {furniture?.name.split(' ')[0]}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   Tips Carousel
   ═══════════════════════════════════════════════════════ */
function TipsCarousel() {
  const [activeTip, setActiveTip] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % DECORATION_TIPS.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const currentTip = DECORATION_TIPS[activeTip]

  return (
    <div className="r48-tips-section space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="h-3.5 w-3.5" style={{ color: '#f59e0b' }} />
          <span className="text-[11px] font-bold">Dicas de decoração</span>
        </div>
        <div className="flex items-center gap-1">
          {DECORATION_TIPS.map((_, i) => (
            <motion.button
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === activeTip ? '16px' : '6px',
                background: i === activeTip ? '#10b981' : 'rgba(0,0,0,0.12)',
              }}
              onClick={() => setActiveTip(i)}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentTip.id}
          className="r48-tip-card p-3 rounded-xl flex items-start gap-3"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
        >
          <span className="text-2xl flex-shrink-0 mt-0.5">{currentTip.emoji}</span>
          <div className="min-w-0">
            <h4 className="text-xs font-bold mb-0.5" style={{ color: '#92400e' }}>
              {currentTip.title}
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {currentTip.description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-2">
        <motion.button
          className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.04)' }}
          onClick={() => setActiveTip((prev) => (prev - 1 + DECORATION_TIPS.length) % DECORATION_TIPS.length)}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.button>
        <span className="text-[10px] font-medium text-muted-foreground">
          {activeTip + 1} / {DECORATION_TIPS.length}
        </span>
        <motion.button
          className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.04)' }}
          onClick={() => setActiveTip((prev) => (prev + 1) % DECORATION_TIPS.length)}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Price & Add to Cart Overlay
   ═══════════════════════════════════════════════════════ */
function PriceOverlay({
  furniture,
  onAddToCart,
}: {
  furniture: FurnitureItem | null
  onAddToCart: () => void
}) {
  if (!furniture) return null

  const discount = Math.round(((furniture.originalPrice - furniture.price) / furniture.originalPrice) * 100)

  return (
    <AnimatePresence>
      <motion.div
        key={furniture.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        className="r48-price-overlay p-3 rounded-xl"
        style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-bold truncate">{furniture.name}</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {furniture.dimensions.w}×{furniture.dimensions.h}×{furniture.dimensions.d} cm • ⭐ {furniture.rating}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-base font-black" style={{ color: '#059669' }}>
                R$ {furniture.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              {discount > 0 && (
                <motion.span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                >
                  -{discount}% de R$ {furniture.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </motion.span>
              )}
            </div>
          </div>
          <motion.div
            className="flex-shrink-0"
            whileTap={{ scale: 0.95 }}
          >
            <motion.button
              className="r48-add-cart-btn h-10 px-4 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              }}
              onClick={onAddToCart}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Adicionar ao carrinho</span>
              <span className="sm:hidden">Comprar</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════
   Toast Notification
   ═══════════════════════════════════════════════════════ */
function ToastNotification({ message, visible, icon }: { message: string; visible: boolean; icon: React.ReactNode }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="r48-toast fixed bottom-6 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{
            background: 'rgba(0,0,0,0.85)',
            color: '#ffffff',
            transform: 'translateX(-50%)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
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

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT: ARInteriorPreview
   ═══════════════════════════════════════════════════════ */
export default function ARInteriorPreview() {
  /* ─── State ─── */
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('sala')
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string>('sofa')
  const [selectedColorId, setSelectedColorId] = useState<string>('sc1')
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [roomWidth, setRoomWidth] = useState(5)
  const [roomHeight, setRoomHeight] = useState(4)
  const [showCompare, setShowCompare] = useState(false)
  const [showScreenshot, setShowScreenshot] = useState(false)
  const [isPlacing, setIsPlacing] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastIcon, setToastIcon] = useState<React.ReactNode>(null)
  const [showFurniture, setShowFurniture] = useState(true)
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)

  const previewRef = useRef<HTMLDivElement>(null)

  /* ─── Derived ─── */
  const currentRoom = ROOM_TEMPLATES.find((r) => r.id === selectedRoom) || ROOM_TEMPLATES[0] as RoomTemplate
  const currentFurniture = FURNITURE_ITEMS.find((f) => f.id === selectedFurnitureId) || null
  const currentColor = currentFurniture?.colors.find((c) => c.id === selectedColorId) || (currentFurniture?.colors[0] || { id: '', name: '', hex: '#000000' })

  /* ─── Effects ─── */
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

  // Sync room dimensions when room changes
  useEffect(() => {
    setRoomWidth(currentRoom.defaultW)
    setRoomHeight(currentRoom.defaultH)
  }, [currentRoom])

  // Placement animation when furniture changes
  useEffect(() => {
    if (selectedFurnitureId) {
      setIsPlacing(true)
      setShowFurniture(true)
      const t = setTimeout(() => setIsPlacing(false), 600)
      return () => clearTimeout(t)
    }
  }, [selectedFurnitureId])

  /* ─── Handlers ─── */
  const showToast = useCallback((message: string, icon: React.ReactNode) => {
    setToastMessage(message)
    setToastIcon(icon)
    setToastVisible(true)
  }, [])

  const handleScreenshot = useCallback(() => {
    setShowScreenshot(true)
    setTimeout(() => {
      setShowScreenshot(false)
      showToast('Foto salva com sucesso!', <Camera className="h-4 w-4" style={{ color: '#10b981' }} />)
    }, 400)
  }, [showToast])

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `Design de Interior — DomPlace`,
      text: `Confira meu design de ${currentRoom.label} com ${currentFurniture?.name} na DomPlace! Por apenas R$${currentFurniture?.price.toFixed(2)}`,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard?.writeText(shareData.text + ' ' + (shareData.url || ''))
      showToast('Link copiado!', <Copy className="h-4 w-4" style={{ color: '#10b981' }} />)
    }
  }, [currentRoom, currentFurniture, showToast])

  const handleAddToCart = useCallback(() => {
    if (!currentFurniture) return
    showToast(
      `${currentFurniture.name} adicionado ao carrinho!`,
      <ShoppingCart className="h-4 w-4" style={{ color: '#10b981' }} />
    )
  }, [currentFurniture, showToast])

  const handleColorSelect = useCallback((color: FurnitureColor) => {
    setSelectedColorId(color.id)
  }, [])

  const handleRoomSelect = useCallback((room: RoomType) => {
    setSelectedRoom(room)
  }, [])

  const handleFurnitureSelect = useCallback((id: string) => {
    setSelectedFurnitureId(id)
    // Reset color to first
    const item = FURNITURE_ITEMS.find((f) => f.id === id)
    if (item) setSelectedColorId(item.colors[0].id)
  }, [])

  /* ─── Loading ─── */
  if (loading) return <LoadingShimmer />

  /* ─── Render ─── */
  return (
    <section className="r48-container rounded-2xl overflow-hidden border border-border" style={{ background: '#ffffff', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      {/* ═══ TOOLBAR ═══ */}
      <div className="r48-toolbar flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="r48-toolbar-icon h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.12)' }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="h-4 w-4" style={{ color: '#10b981' }} />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold leading-tight">AR Interior Preview</h3>
            <p className="text-[10px] text-muted-foreground">Visualize móveis no seu ambiente</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Screenshot */}
          <motion.button
            className="r48-toolbar-btn h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.04)' }}
            onClick={handleScreenshot}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title="Salvar foto"
          >
            <Camera className="h-4 w-4 text-muted-foreground" />
          </motion.button>
          {/* Share */}
          <motion.button
            className="r48-toolbar-btn h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.04)' }}
            onClick={handleShare}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title="Compartilhar design"
          >
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </motion.button>
          {/* Compare toggle */}
          <motion.button
            className="r48-toolbar-btn h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: showCompare ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.04)' }}
            onClick={() => setShowCompare((v) => !v)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title="Comparar"
          >
            <Layers
              className="h-4 w-4"
              style={{ color: showCompare ? '#10b981' : 'rgba(0,0,0,0.4)' }}
            />
          </motion.button>
          {/* Before/After toggle */}
          <motion.button
            className="r48-toolbar-btn h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: showBeforeAfter ? 'rgba(59,130,246,0.12)' : 'rgba(0,0,0,0.04)' }}
            onClick={() => setShowBeforeAfter((v) => !v)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title="Antes e depois"
          >
            <ImageIcon
              className="h-4 w-4"
              style={{ color: showBeforeAfter ? '#3b82f6' : 'rgba(0,0,0,0.4)' }}
            />
          </motion.button>
        </div>
      </div>

      {/* ═══ ROOM SELECTOR ═══ */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Escolha o ambiente</p>
        <RoomSelector selected={selectedRoom} onSelect={handleRoomSelect} />
      </div>

      {/* ═══ MAIN PREVIEW AREA ═══ */}
      <div className="px-4 py-2" ref={previewRef}>
        <div className="relative">
          {/* Screenshot flash effect */}
          <AnimatePresence>
            {showScreenshot && (
              <motion.div
                className="absolute inset-0 z-20 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.8)' }}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showBeforeAfter ? (
              <motion.div
                key="before-after"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BeforeAfterSlider room={currentRoom} furniture={currentFurniture} selectedColor={currentColor} />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ARPreviewPanel
                  room={currentRoom}
                  furniture={currentFurniture}
                  selectedColor={currentColor}
                  rotation={rotation}
                  scale={scale}
                  width={roomWidth}
                  height={roomHeight}
                  showFurniture={showFurniture}
                  isPlacing={isPlacing}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save screenshot floating button */}
          <motion.div
            className="absolute bottom-3 right-3 z-15"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25, delay: 0.5 }}
          >
            <motion.button
              className="r48-save-btn h-9 px-3 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5"
              style={{
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)',
              }}
              onClick={handleScreenshot}
              whileHover={{ scale: 1.05, background: 'rgba(0,0,0,0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              <Camera className="h-3.5 w-3.5" />
              Salvar foto
            </motion.button>
          </motion.div>

          {/* Furniture toggle button */}
          <motion.div
            className="absolute bottom-3 left-3 z-15"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25, delay: 0.6 }}
          >
            <motion.button
              className="h-9 px-3 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5"
              style={{
                background: showFurniture ? 'rgba(16,185,129,0.75)' : 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(8px)',
              }}
              onClick={() => setShowFurniture((v) => !v)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check className="h-3.5 w-3.5" />
              {showFurniture ? 'Móvel visível' : 'Ocultar móvel'}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ═══ COMPARE PLACEMENT ═══ */}
      <div className="px-4 pb-2">
        <AnimatePresence>
          {showCompare && currentFurniture && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <ComparePlacement
                show={showCompare}
                room={currentRoom}
                furniture={currentFurniture}
                selectedColor={currentColor}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ FURNITURE GRID ═══ */}
      <div className="px-4 py-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Selecione o móvel</p>
        <FurnitureGrid selected={selectedFurnitureId} onSelect={handleFurnitureSelect} />
      </div>

      {/* ═══ CONTROLS PANEL ═══ */}
      <div className="px-4 py-3 space-y-3" style={{ background: 'rgba(0,0,0,0.015)' }}>
        {/* Color swatches */}
        {currentFurniture && (
          <FurnitureColorSwatches
            colors={currentFurniture.colors}
            selected={currentColor}
            onSelect={handleColorSelect}
          />
        )}

        {/* Rotation & Scale side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RotationSlider value={rotation} onChange={setRotation} />
          <ScaleControl value={scale} onChange={setScale} />
        </div>

        {/* Room dimensions */}
        <RoomDimensionsInput
          width={roomWidth}
          height={roomHeight}
          onChangeWidth={setRoomWidth}
          onChangeHeight={setRoomHeight}
        />
      </div>

      {/* ═══ PRICE OVERLAY ═══ */}
      <div className="px-4 py-2">
        <PriceOverlay furniture={currentFurniture} onAddToCart={handleAddToCart} />
      </div>

      {/* ═══ TIPS CAROUSEL ═══ */}
      <div className="px-4 pt-2 pb-4">
        <TipsCarousel />
      </div>

      {/* ═══ TOAST ═══ */}
      <ToastNotification message={toastMessage} visible={toastVisible} icon={toastIcon} />
    </section>
  )
}
