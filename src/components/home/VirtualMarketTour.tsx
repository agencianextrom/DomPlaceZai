'use client'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShoppingBag,
  Store,
  Compass,
  ZoomIn,
  ZoomOut,
  Hand,
  Info,
  X,
  ArrowRight,
  BadgePercent,
  Heart,
  Eye,
  Navigation,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

/* ═══════════════════════════════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════════════════════════════ */

interface ProductPin {
  id: string
  name: string
  price: string
  emoji: string
  x: number
  y: number
  rating: number
  description: string
}

interface VirtualStoreLocation {
  id: string
  name: string
  subtitle: string
  category: string
  emoji: string
  rating: number
  reviewCount: number
  openHours: string
  closeHours: string
  isOpen: boolean
  specialties: string[]
  bgGradient: string
  wallColor: string
  floorColor: string
  accentColor: string
  accentRgb: string
  products: ProductPin[]
  description: string
}

const TOTAL_STORES = 5 as const

const STORE_LOCATIONS: VirtualStoreLocation[] = [
  {
    id: 'padaria-dono-joao',
    name: 'Padaria Dom João',
    subtitle: 'Tradicional desde 1987',
    category: 'Padaria',
    emoji: '🥖',
    rating: 4.9,
    reviewCount: 342,
    openHours: '06:00',
    closeHours: '22:00',
    isOpen: true,
    specialties: ['Pão Francês', 'Bolo de Fubá', 'Coxinha', 'Café Coado'],
    bgGradient: 'linear-gradient(180deg, #f5e6d3 0%, #f5e6d3 55%, #c8a882 55%, #c8a882 100%)',
    wallColor: '#f5e6d3',
    floorColor: '#c8a882',
    accentColor: '#d97706',
    accentRgb: '217,119,6',
    products: [
      { id: 'p1', name: 'Pão Francês', price: 'R$ 0,80', emoji: '🥖', x: 20, y: 35, rating: 4.9, description: 'Crosta dourada e macio por dentro. Receita caseira há 3 gerações.' },
      { id: 'p2', name: 'Bolo de Fubá', price: 'R$ 8,90', emoji: '🍰', x: 55, y: 40, rating: 4.8, description: 'Feito com fubá artesanal e ovos caipiras. Textura úmida perfeita.' },
      { id: 'p3', name: 'Coxinha', price: 'R$ 6,50', emoji: '🍗', x: 35, y: 60, rating: 4.7, description: 'Massa leve e recheio de frango desfiado com catupiry. Frita na hora.' },
      { id: 'p4', name: 'Café Coado', price: 'R$ 4,50', emoji: '☕', x: 72, y: 30, rating: 4.9, description: 'Café premium torrado na fazenda, coado no filtro de pano tradicional.' },
    ],
    description: 'A padaria mais querida de Dom Eliseu, com produtos artesanais feitos diariamente com ingredientes selecionados.',
  },
  {
    id: 'mercearia-sabor-da-terra',
    name: 'Mercearia Sabor da Terra',
    subtitle: 'Produtos orgânicos e locais',
    category: 'Mercearia',
    emoji: '🌿',
    rating: 4.7,
    reviewCount: 218,
    openHours: '07:00',
    closeHours: '20:00',
    isOpen: true,
    specialties: ['Produtos Orgânicos', 'Ervas Temperos', 'Geleias Artesanais', 'Queijos Locais'],
    bgGradient: 'linear-gradient(180deg, #e8f0e4 0%, #e8f0e4 55%, #8ba878 55%, #8ba878 100%)',
    wallColor: '#e8f0e4',
    floorColor: '#8ba878',
    accentColor: '#16a34a',
    accentRgb: '22,163,74',
    products: [
      { id: 'p5', name: 'Mel Silvestre', price: 'R$ 32,00', emoji: '🍯', x: 25, y: 32, rating: 4.8, description: 'Mel puro coletado de apiários locais sem agrotóxicos.' },
      { id: 'p6', name: 'Queijo Colonial', price: 'R$ 45,00', emoji: '🧀', x: 60, y: 45, rating: 4.6, description: 'Queijo curado artesanalmente com leite de vacas criadas soltas.' },
      { id: 'p7', name: 'Geleia de Amora', price: 'R$ 18,90', emoji: '🫙', x: 40, y: 55, rating: 4.9, description: 'Geleia sem conservantes feita com amoras orgânicas da região.' },
      { id: 'p8', name: 'Tempos Caseiros', price: 'R$ 12,00', emoji: '🌱', x: 75, y: 35, rating: 4.5, description: 'Conjunto de ervas finas secadas naturalmente: orégano, manjerona e alecrim.' },
    ],
    description: 'Seleção premium de produtos orgânicos direto de produtores rurais da região de Dom Eliseu.',
  },
  {
    id: 'petiscaria-barraca-do-ze',
    name: 'Petiscaria do Zé',
    subtitle: 'O melhor churrasco da região',
    category: 'Restaurante',
    emoji: '🍖',
    rating: 4.8,
    reviewCount: 567,
    openHours: '11:00',
    closeHours: '23:00',
    isOpen: true,
    specialties: ['Picanha na Brasa', 'Costela BBQ', 'Linguica Artesanal', 'Cerveja Gelada'],
    bgGradient: 'linear-gradient(180deg, #e8d5c4 0%, #e8d5c4 55%, #8b6f5e 55%, #8b6f5e 100%)',
    wallColor: '#e8d5c4',
    floorColor: '#8b6f5e',
    accentColor: '#dc2626',
    accentRgb: '220,38,38',
    products: [
      { id: 'p9', name: 'Picanha na Brasa', price: 'R$ 89,90', emoji: '🥩', x: 30, y: 38, rating: 4.9, description: 'Picanha bovina premium ao ponto perfeito na brasa de carvão.' },
      { id: 'p10', name: 'Costela BBQ', price: 'R$ 69,90', emoji: '🍖', x: 65, y: 42, rating: 4.8, description: 'Costela suína com molho barbecue artesanal, assada lentamente por 4 horas.' },
      { id: 'p11', name: 'Linguica Colonial', price: 'R$ 24,90', emoji: '🌭', x: 45, y: 58, rating: 4.7, description: 'Linguica artesanal defumada na madeira, receita centenária da família.' },
      { id: 'p12', name: 'Batata Frita Rústica', price: 'R$ 19,90', emoji: '🍟', x: 20, y: 50, rating: 4.6, description: 'Batatas selecionadas cortadas à mão e fritas em azeite de oliva.' },
    ],
    description: 'Ambiente rústico e acolhedor com o melhor churrasco artesanal de Dom Eliseu, carnaval de sabores!',
  },
  {
    id: 'floricultura-jardim-secreto',
    name: 'Jardim Secreto',
    subtitle: 'Flores e plantas exóticas',
    category: 'Floricultura',
    emoji: '🌺',
    rating: 4.6,
    reviewCount: 156,
    openHours: '08:00',
    closeHours: '18:00',
    isOpen: true,
    specialties: ['Orquídeas', 'Bonsais', 'Arranjos', 'Plantas Medicinais'],
    bgGradient: 'linear-gradient(180deg, #f0e8f0 0%, #f0e8f0 55%, #7a9a6e 55%, #7a9a6e 100%)',
    wallColor: '#f0e8f0',
    floorColor: '#7a9a6e',
    accentColor: '#c026d3',
    accentRgb: '192,38,211',
    products: [
      { id: 'p13', name: 'Orquídea Phalaenopsis', price: 'R$ 120,00', emoji: '🌸', x: 25, y: 30, rating: 4.9, description: 'Orquídea nobre em vaso cerâmico artesanal, florescimento garantido.' },
      { id: 'p14', name: 'Bonsai Pinheiro', price: 'R$ 250,00', emoji: '🌲', x: 60, y: 38, rating: 4.7, description: 'Bonsai de pinheiro com mais de 15 anos, podado por mestre japonês.' },
      { id: 'p15', name: 'Arranho Tropical', price: 'R$ 89,90', emoji: '💐', x: 40, y: 55, rating: 4.8, description: 'Arranjo com helicônias, antúrios e folhagens tropicais nativas.' },
      { id: 'p16', name: 'Alecrim Vaso', price: 'R$ 18,90', emoji: '🌱', x: 72, y: 45, rating: 4.5, description: 'Muda de alecrim em vaso de barro com instruções de cultivo.' },
    ],
    description: 'Oásis verde no centro da cidade com uma coleção curada de flores, plantas e arranjos especiais.',
  },
  {
    id: 'eletronica-tech-dom',
    name: 'TechDom Eletrônicos',
    subtitle: 'Tecnologia e acessórios',
    category: 'Eletrônicos',
    emoji: '📱',
    rating: 4.5,
    reviewCount: 423,
    openHours: '09:00',
    closeHours: '21:00',
    isOpen: true,
    specialties: ['Smartphones', 'Fones Bluetooth', 'Carregadores', 'Capas e Películas'],
    bgGradient: 'linear-gradient(180deg, #e4e8f0 0%, #e4e8f0 55%, #6b7a8d 55%, #6b7a8d 100%)',
    wallColor: '#e4e8f0',
    floorColor: '#6b7a8d',
    accentColor: '#2563eb',
    accentRgb: '37,99,235',
    products: [
      { id: 'p17', name: 'Fone BT Pro', price: 'R$ 189,90', emoji: '🎧', x: 28, y: 35, rating: 4.6, description: 'Fone de ouvido bluetooth com cancelamento de ruído ativo e 30h de bateria.' },
      { id: 'p18', name: 'PowerBank 20000', price: 'R$ 129,90', emoji: '🔋', x: 62, y: 40, rating: 4.8, description: 'Carregador portátil de alta capacidade com carregamento rápido 65W.' },
      { id: 'p19', name: 'Smartband Fit', price: 'R$ 199,90', emoji: '⌚', x: 45, y: 58, rating: 4.5, description: 'Pulseira inteligente com monitor cardíaco, GPS e 14 dias de bateria.' },
      { id: 'p20', name: 'Mini Speaker', price: 'R$ 89,90', emoji: '🔊', x: 18, y: 48, rating: 4.4, description: 'Alto-falante portátil waterproof com som surround 360 graus.' },
    ],
    description: 'A loja de tecnologia mais completa de Dom Eliseu, com os melhores preços e garantia estendida.',
  },
]

/* ═══════════════════════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════════════════════ */

const storeTransitionVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.88,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.88,
  }),
}

const fadeSlideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

const pulseRing = {
  animate: {
    scale: [1, 1.6, 2],
    opacity: [0.6, 0.2, 0],
  },
  transition: {
    duration: 1.8,
    repeat: Infinity,
    ease: 'easeOut' as const,
  },
}

const springConfig = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
}

const springGentle = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Waveform Bar (Audio Guide)
   ═══════════════════════════════════════════════════════════════════════════════ */

function WaveformBar({
  isPlaying,
  index,
  barHeight,
}: {
  isPlaying: boolean
  index: number
  barHeight: number
}) {
  return (
    <motion.div
      className="r53-vtour-waveform-bar rounded-full"
      style={{
        width: 3,
        height: barHeight,
        backgroundColor: isPlaying ? '#10b981' : 'rgba(148,163,184,0.4)',
      }}
      animate={
        isPlaying
          ? {
              scaleY: [1, 0.3 + Math.random() * 0.7, 1],
            }
          : { scaleY: 1 }
      }
      transition={
        isPlaying
          ? {
              duration: 0.4 + Math.random() * 0.4,
              repeat: Infinity,
              repeatType: 'reverse' as const,
              delay: index * 0.06,
              ease: 'easeInOut' as const,
            }
          : { duration: 0.3 }
      }
    />
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Audio Guide Controller
   ═══════════════════════════════════════════════════════════════════════════════ */

function AudioGuideController({
  isPlaying,
  onToggle,
}: {
  isPlaying: boolean
  onToggle: () => void
}) {
  const barHeights = useMemo(() => [12, 20, 16, 24, 14, 22, 18, 26, 15, 20, 12, 18], [])

  return (
    <motion.div
      className="r53-vtour-audio-guide flex items-center gap-3 px-4 py-2.5 rounded-2xl"
      style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springGentle}
    >
      <motion.button
        className="r53-vtour-audio-toggle w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: isPlaying ? '#10b981' : 'rgba(255,255,255,0.15)',
        }}
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isPlaying ? 'Pausar áudio guia' : 'Reproduzir áudio guia'}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isPlaying ? 'pause' : 'play'}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <div className="r53-vtour-waveform flex items-center gap-[3px] h-7">
        {barHeights.map((h, i) => (
          <WaveformBar key={i} isPlaying={isPlaying} index={i} barHeight={h} />
        ))}
      </div>

      <motion.div
        className="r53-vtour-audio-label flex items-center gap-1"
        animate={isPlaying ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
        transition={isPlaying ? { duration: 2, repeat: Infinity } : { duration: 0.3 }}
      >
        {isPlaying ? (
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-slate-400" />
        )}
        <span className="text-[10px] font-medium text-slate-300">
          {isPlaying ? 'Reproduzindo...' : 'Áudio Guia'}
        </span>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Product Pin Marker
   ═══════════════════════════════════════════════════════════════════════════════ */

function ProductPinMarker({
  pin,
  accentColor,
  accentRgb,
  isSelected,
  onClick,
}: {
  pin: ProductPin
  accentColor: string
  accentRgb: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <motion.div
      className="r53-vtour-pin absolute z-20 cursor-pointer"
      style={{
        left: `${pin.x}%`,
        top: `${pin.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isSelected ? 1.3 : 1,
        opacity: 1,
      }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
      onClick={onClick}
      whileHover={{ scale: 1.2, y: -3 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Pulse ring */}
      {isSelected && (
        <motion.div
          className="r53-vtour-pin-pulse absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${accentColor}`,
            width: 36,
            height: 36,
            left: -8,
            top: -8,
          }}
          animate={pulseRing.animate}
          transition={pulseRing.transition}
        />
      )}

      {/* Pin dot */}
      <motion.div
        className="r53-vtour-pin-dot relative rounded-full flex items-center justify-center"
        style={{
          width: 32,
          height: 32,
          background: accentColor,
          boxShadow: isSelected
            ? `0 0 0 3px rgba(${accentRgb},0.25), 0 4px 12px rgba(${accentRgb},0.4)`
            : `0 2px 8px rgba(${accentRgb},0.3)`,
        }}
        animate={
          isSelected
            ? { boxShadow: `0 0 0 6px rgba(${accentRgb},0.15), 0 4px 16px rgba(${accentRgb},0.5)` }
            : {}
        }
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      >
        <span className="text-sm">{pin.emoji}</span>
      </motion.div>

      {/* Label */}
      <motion.div
        className="r53-vtour-pin-label absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.7)',
            color: '#ffffff',
            backdropFilter: 'blur(4px)',
          }}
        >
          {pin.price}
        </span>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Product Pin Expanded Detail
   ═══════════════════════════════════════════════════════════════════════════════ */

function ProductPinDetail({
  pin,
  accentColor,
  onClose,
}: {
  pin: ProductPin
  accentColor: string
  onClose: () => void
}) {
  return (
    <motion.div
      className="r53-vtour-pin-detail absolute z-30"
      style={{
        left: `${pin.x}%`,
        top: `${pin.y}%`,
        transform: 'translate(-50%, -130%)',
      }}
      initial={{ opacity: 0, scale: 0.7, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: 10 }}
      transition={{ type: 'spring' as const, stiffness: 350, damping: 22 }}
    >
      <div
        className="r53-vtour-pin-detail-card relative rounded-2xl p-3 w-56"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(16px)',
          boxShadow: `0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)`,
          border: `1px solid ${accentColor}33`,
        }}
      >
        {/* Close button */}
        <motion.button
          className="r53-vtour-pin-detail-close absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.08)' }}
          onClick={onClose}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
        >
          <X className="w-3 h-3 text-slate-500" />
        </motion.button>

        {/* Connector line */}
        <div
          className="r53-vtour-pin-detail-connector absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        />

        {/* Emoji + name */}
        <div className="flex items-start gap-2.5 mb-2">
          <motion.div
            className="r53-vtour-pin-detail-emoji w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `${accentColor}15`,
            }}
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <span className="text-xl">{pin.emoji}</span>
          </motion.div>
          <div className="min-w-0">
            <h4 className="r53-vtour-pin-detail-name text-sm font-bold text-slate-800 truncate">
              {pin.name}
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-semibold text-slate-600">{pin.rating}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="r53-vtour-pin-detail-desc text-[11px] text-slate-500 leading-relaxed mb-2.5">
          {pin.description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <span className="r53-vtour-pin-detail-price text-base font-bold" style={{ color: accentColor }}>
            {pin.price}
          </span>
          <motion.button
            className="r53-vtour-pin-detail-cta flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[11px] font-semibold"
            style={{ background: accentColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingBag className="w-3 h-3" />
            Ver Produto
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Store Info Card Overlay
   ═══════════════════════════════════════════════════════════════════════════════ */

function StoreInfoOverlay({
  store,
  onEnterStore,
  isCollapsed,
  onToggleCollapse,
}: {
  store: VirtualStoreLocation
  onEnterStore: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}) {
  return (
    <motion.div
      className="r53-vtour-store-info absolute bottom-0 left-0 right-0 z-20"
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 22, delay: 0.2 }}
    >
      <div
        className="r53-vtour-store-info-card relative mx-3 mb-3 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
        }}
      >
        {/* Gradient accent bar */}
        <div
          className="r53-vtour-store-info-accent h-1"
          style={{ background: `linear-gradient(90deg, ${store.accentColor}, transparent)` }}
        />

        <div className="p-4">
          {/* Toggle collapse */}
          <motion.button
            className="r53-vtour-store-info-toggle absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            onClick={onToggleCollapse}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            >
              <ChevronRight className="w-3.5 h-3.5 text-white/70" />
            </motion.div>
          </motion.button>

          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded"
                className="r53-vtour-store-info-expanded"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              >
                {/* Header: emoji + name + rating */}
                <div className="flex items-start gap-3 mb-3">
                  <motion.div
                    className="r53-vtour-store-info-emoji w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${store.accentColor}20` }}
                    animate={{ rotate: [0, 3, -3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                  >
                    <span className="text-2xl">{store.emoji}</span>
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <h3 className="r53-vtour-store-info-name text-base font-bold text-white truncate">
                      {store.name}
                    </h3>
                    <p className="r53-vtour-store-info-subtitle text-[11px] text-white/60 truncate">
                      {store.subtitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-bold text-white">{store.rating}</span>
                        <span className="text-[10px] text-white/50">({store.reviewCount})</span>
                      </div>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: store.isOpen ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                          color: store.isOpen ? '#34d399' : '#f87171',
                        }}
                      >
                        {store.isOpen ? 'ABERTO' : 'FECHADO'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info row */}
                <div className="r53-vtour-store-info-details flex items-center gap-4 mb-3 text-[11px]">
                  <div className="flex items-center gap-1 text-white/70">
                    <Clock className="w-3 h-3" />
                    <span>{store.openHours} - {store.closeHours}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/70">
                    <MapPin className="w-3 h-3" />
                    <span>{store.category}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="r53-vtour-store-info-desc text-[11px] text-white/50 leading-relaxed mb-3">
                  {store.description}
                </p>

                {/* Specialties tags */}
                <div className="r53-vtour-store-info-specialties flex flex-wrap gap-1.5 mb-3">
                  {store.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="r53-vtour-store-info-tag text-[10px] font-medium px-2 py-1 rounded-full"
                      style={{
                        background: `${store.accentColor}20`,
                        color: `${store.accentColor}`,
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* CTA Row */}
                <div className="flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      className="r53-vtour-enter-store-btn flex items-center gap-2 text-white text-sm font-semibold"
                      style={{
                        background: store.accentColor,
                      }}
                      onClick={onEnterStore}
                    >
                      <Store className="w-4 h-4" />
                      Entrar na Loja
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="r53-vtour-fav-store-btn w-10 h-10 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                className="r53-vtour-store-info-collapsed flex items-center gap-3 py-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="text-lg">{store.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{store.name}</h4>
                  <p className="text-[10px] text-white/50">{store.category}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-bold text-white">{store.rating}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Tour Progress Indicator
   ═══════════════════════════════════════════════════════════════════════════════ */

function TourProgressIndicator({
  visitedCount,
  total,
}: {
  visitedCount: number
  total: number
}) {
  const progressPct = (visitedCount / total) * 100

  return (
    <div className="r53-vtour-progress flex items-center gap-3 px-4 py-2 rounded-xl"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center gap-1.5">
        <Compass className="w-4 h-4 text-emerald-400" />
        <span className="text-[11px] font-bold text-white">
          {visitedCount} de {total} visitadas
        </span>
      </div>
      <div className="r53-vtour-progress-bar flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.12)' }}
      >
        <motion.div
          className="r53-vtour-progress-fill h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ type: 'spring' as const, stiffness: 120, damping: 20 }}
        />
      </div>
      <motion.div
        className="r53-vtour-progress-badge flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
        style={{ background: progressPct === 100 ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.1)', color: progressPct === 100 ? '#34d399' : '#ffffff' }}
        animate={progressPct === 100 ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.6, repeat: progressPct === 100 ? Infinity : 0, repeatType: 'reverse' as const }}
      >
        {progressPct === 100 ? '🏆 Completo!' : `${Math.round(progressPct)}%`}
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Minimap
   ═══════════════════════════════════════════════════════════════════════════════ */

function TourMinimap({
  currentStoreIndex,
  visitedSet,
  onGoToStore,
}: {
  currentStoreIndex: number
  visitedSet: Set<number>
  onGoToStore: (index: number) => void
}) {
  return (
    <motion.div
      className="r53-vtour-minimap relative w-full p-3 rounded-2xl"
      style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 250, damping: 22, delay: 0.3 }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Navigation className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Mapa da Rota</span>
      </div>

      {/* Path visualization */}
      <div className="r53-vtour-minimap-path relative flex items-center justify-between px-2 py-3">
        {/* Connecting line */}
        <div
          className="r53-vtour-minimap-line absolute top-1/2 left-6 right-6 h-[2px] -translate-y-1/2"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <motion.div
            className="r53-vtour-minimap-line-fill h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
            animate={{
              width: `${(currentStoreIndex / (TOTAL_STORES - 1)) * 100}%`,
            }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
          />
        </div>

        {/* Store dots */}
        {STORE_LOCATIONS.map((store, i) => {
          const isVisited = visitedSet.has(i)
          const isCurrent = i === currentStoreIndex

          return (
            <motion.button
              key={store.id}
              className="r53-vtour-minimap-dot relative z-10 flex flex-col items-center gap-1"
              onClick={() => onGoToStore(i)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Ir para ${store.name}`}
            >
              <motion.div
                className="r53-vtour-minimap-dot-inner w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: isCurrent
                    ? store.accentColor
                    : isVisited
                      ? 'rgba(16,185,129,0.3)'
                      : 'rgba(255,255,255,0.1)',
                  boxShadow: isCurrent
                    ? `0 0 0 3px ${store.accentColor}40, 0 0 12px ${store.accentColor}60`
                    : 'none',
                }}
                animate={
                  isCurrent
                    ? { scale: [1, 1.15, 1] }
                    : {}
                }
                transition={
                  isCurrent
                    ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }
                    : { duration: 0.3 }
                }
              >
                <span className="text-xs">{store.emoji}</span>
              </motion.div>
              {isCurrent && (
                <motion.div
                  className="r53-vtour-minimap-dot-label absolute -bottom-5"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="text-[8px] font-bold text-white/80 whitespace-nowrap">{store.name.split(' ').slice(0, 2).join(' ')}</span>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Store Interior View with Pan/Zoom + Hotspots
   ═══════════════════════════════════════════════════════════════════════════════ */

function StoreInteriorView({
  store,
  zoom,
  pan,
  onPanStart,
  onPanMove,
  onPanEnd,
  selectedPin,
  onPinClick,
  onClosePin,
}: {
  store: VirtualStoreLocation
  zoom: number
  pan: { x: number; y: number }
  onPanStart: () => void
  onPanMove: (x: number, y: number) => void
  onPanEnd: () => void
  selectedPin: string | null
  onPinClick: (id: string) => void
  onClosePin: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.target !== e.currentTarget) return
      isDragging.current = true
      lastPos.current = { x: e.clientX, y: e.clientY }
      onPanStart()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [onPanStart],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return
      const dx = (e.clientX - lastPos.current.x) / zoom
      const dy = (e.clientY - lastPos.current.y) / zoom
      lastPos.current = { x: e.clientX, y: e.clientY }
      onPanMove(dx, dy)
    },
    [zoom, onPanMove],
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
    onPanEnd()
  }, [onPanEnd])

  // Decorative interior elements based on store type
  const interiorElements = useMemo(() => {
    if (store.category === 'Padaria') {
      return (
        <>
          <div className="absolute bottom-[45%] left-[10%] w-[18%] h-[12%] rounded-lg opacity-20" style={{ background: '#8b6914' }} />
          <div className="absolute bottom-[45%] left-[35%] w-[22%] h-[10%] rounded-lg opacity-15" style={{ background: '#a07830' }} />
          <div className="absolute top-[10%] right-[15%] w-[14%] h-[20%] rounded opacity-10" style={{ background: '#c8a050' }} />
          <div className="absolute top-[8%] left-[40%] w-[8%] h-[6%] rounded-full opacity-15" style={{ background: '#d4a040' }} />
          <div className="absolute bottom-[42%] right-[20%] w-[12%] h-[8%] rounded-lg opacity-12" style={{ background: '#906820' }} />
        </>
      )
    }
    if (store.category === 'Mercearia') {
      return (
        <>
          <div className="absolute top-[15%] left-[8%] w-[15%] h-[35%] rounded opacity-10" style={{ background: '#2d5a1e' }} />
          <div className="absolute top-[15%] left-[30%] w-[15%] h-[35%] rounded opacity-10" style={{ background: '#3a6b2a' }} />
          <div className="absolute top-[15%] right-[30%] w-[15%] h-[35%] rounded opacity-08" style={{ background: '#2a5520' }} />
          <div className="absolute top-[15%] right-[8%] w-[15%] h-[35%] rounded opacity-10" style={{ background: '#1e4a15' }} />
        </>
      )
    }
    if (store.category === 'Restaurante') {
      return (
        <>
          <div className="absolute bottom-[42%] left-[15%] w-[12%] h-[8%] rounded-full opacity-15" style={{ background: '#8b4513' }} />
          <div className="absolute bottom-[42%] left-[40%] w-[12%] h-[8%] rounded-full opacity-15" style={{ background: '#a0522d' }} />
          <div className="absolute bottom-[42%] right-[25%] w-[12%] h-[8%] rounded-full opacity-15" style={{ background: '#6b3410' }} />
          <div className="absolute top-[5%] left-[20%] w-[60%] h-[3%] rounded opacity-08" style={{ background: '#333333' }} />
        </>
      )
    }
    if (store.category === 'Floricultura') {
      return (
        <>
          <div className="absolute bottom-[42%] left-[10%] w-[20%] h-[12%] rounded-lg opacity-12" style={{ background: '#c026d3' }} />
          <div className="absolute bottom-[42%] right-[15%] w-[18%] h-[14%] rounded-lg opacity-12" style={{ background: '#16a34a' }} />
          <div className="absolute top-[10%] right-[10%] w-[10%] h-[18%] rounded opacity-10" style={{ background: '#059669' }} />
        </>
      )
    }
    // Electronics
    return (
      <>
        <div className="absolute top-[12%] left-[10%] w-[20%] h-[25%] rounded-lg opacity-08" style={{ background: '#1e293b' }} />
        <div className="absolute top-[12%] left-[35%] w-[20%] h-[25%] rounded-lg opacity-08" style={{ background: '#1e293b' }} />
        <div className="absolute top-[12%] right-[15%] w-[20%] h-[25%] rounded-lg opacity-08" style={{ background: '#1e293b' }} />
        <div className="absolute bottom-[42%] left-[20%] w-[15%] h-[6%] rounded opacity-10" style={{ background: '#475569' }} />
      </>
    )
  }, [store.category])

  return (
    <div
      ref={containerRef}
      className="r53-vtour-interior relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none rounded-2xl"
      style={{
        background: store.bgGradient,
        border: '2px solid rgba(0,0,0,0.08)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Perspective container */}
      <motion.div
        className="r53-vtour-interior-content absolute inset-0"
        style={{
          transformOrigin: 'center center',
        }}
        animate={{
          scale: zoom,
          x: pan.x,
          y: pan.y,
        }}
        transition={springGentle}
      >
        {/* Interior decoration elements */}
        {interiorElements}

        {/* Grid overlay for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 60px)',
            perspective: '800px',
          }}
        />

        {/* Baseboard line */}
        <div
          className="r53-vtour-baseboard absolute left-0 right-0 pointer-events-none"
          style={{ top: '55%', height: '2px', background: 'rgba(0,0,0,0.08)' }}
        />

        {/* Ceiling lights simulation */}
        {[
          { left: 20 },
          { left: 50 },
          { left: 80 },
        ].map((light, i) => (
          <motion.div
            key={i}
            className="r53-vtour-ceiling-light absolute pointer-events-none"
            style={{
              top: '3%',
              left: `${light.left}%`,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'rgba(255,255,200,0.5)',
              boxShadow: '0 0 20px 8px rgba(255,255,200,0.15)',
            }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' as const }}
          />
        ))}

        {/* Store sign on wall */}
        <div
          className="r53-vtour-store-sign absolute top-[8%] left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl pointer-events-none"
          style={{
            background: `${store.accentColor}15`,
            border: `1px solid ${store.accentColor}30`,
          }}
        >
          <span className="text-[11px] font-bold" style={{ color: store.accentColor }}>
            {store.emoji} {store.name}
          </span>
        </div>

        {/* Counter / Display shelf simulation */}
        <div
          className="r53-vtour-counter absolute bottom-[44%] left-[8%] right-[8%] h-[4%] rounded-lg pointer-events-none"
          style={{
            background: 'rgba(0,0,0,0.06)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        />

        {/* Product Pins (Hotspots) */}
        {store.products.map((pin) => (
          <ProductPinMarker
            key={pin.id}
            pin={pin}
            accentColor={store.accentColor}
            accentRgb={store.accentRgb}
            isSelected={selectedPin === pin.id}
            onClick={() => onPinClick(pin.id)}
          />
        ))}

        {/* Expanded Pin Detail */}
        <AnimatePresence>
          {selectedPin && store.products.find((p) => p.id === selectedPin) && (
            <ProductPinDetail
              pin={store.products.find((p) => p.id === selectedPin)!}
              accentColor={store.accentColor}
              onClose={onClosePin}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Zoom controls overlay */}
      <div className="r53-vtour-zoom-controls absolute bottom-3 right-3 flex flex-col gap-1 z-30">
        <motion.button
          className="r53-vtour-zoom-in w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Aumentar zoom"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </motion.button>
        <motion.button
          className="r53-vtour-zoom-out w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Diminuir zoom"
        >
          <ZoomOut className="w-4 h-4 text-white" />
        </motion.button>
      </div>

      {/* Pan hint indicator */}
      <motion.div
        className="r53-vtour-pan-hint absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg z-30"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, type: 'spring' as const, stiffness: 200, damping: 20 }}
      >
        <Hand className="w-3.5 h-3.5 text-white/70" />
        <span className="text-[9px] font-medium text-white/70">Arraste para explorar</span>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Direction Navigation Arrows
   ═══════════════════════════════════════════════════════════════════════════════ */

function DirectionalArrows({
  canGoLeft,
  canGoRight,
  onLeft,
  onRight,
  accentColor,
}: {
  canGoLeft: boolean
  canGoRight: boolean
  onLeft: () => void
  onRight: () => void
  accentColor: string
}) {
  return (
    <>
      {/* Left arrow */}
      <AnimatePresence>
        {canGoLeft && (
          <motion.button
            className="r53-vtour-arrow-left absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            onClick={onLeft}
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Loja anterior"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Right arrow */}
      <AnimatePresence>
        {canGoRight && (
          <motion.button
            className="r53-vtour-arrow-right absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            onClick={onRight}
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Próxima loja"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   3D Perspective Carousel Thumbnails
   ═══════════════════════════════════════════════════════════════════════════════ */

function PerspectiveCarousel({
  currentIndex,
  onGoTo,
}: {
  currentIndex: number
  onGoTo: (index: number) => void
}) {
  return (
    <div
      className="r53-vtour-carousel relative w-full h-28 overflow-hidden"
      style={{ perspective: '800px' }}
    >
      <div className="r53-vtour-carousel-track flex items-center justify-center h-full">
        {STORE_LOCATIONS.map((store, i) => {
          const offset = i - currentIndex
          const absOffset = Math.abs(offset)
          const isCenter = i === currentIndex

          let translateX = 0
          let translateZ = 0
          let rotateY = 0
          let opacity = 1
          let scale = 1
          let zIndex = 5

          if (absOffset === 0) {
            translateZ = 40
            zIndex = 10
          } else if (absOffset === 1) {
            translateX = offset > 0 ? 85 : -85
            translateZ = -30
            rotateY = offset > 0 ? -18 : 18
            opacity = 0.65
            scale = 0.85
            zIndex = 5
          } else if (absOffset === 2) {
            translateX = offset > 0 ? 155 : -155
            translateZ = -70
            rotateY = offset > 0 ? -28 : 28
            opacity = 0.35
            scale = 0.7
            zIndex = 3
          } else {
            opacity = 0
            zIndex = 1
          }

          return (
            <motion.button
              key={store.id}
              className="r53-vtour-carousel-item absolute w-32 h-20 rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
              style={{
                transformOrigin: 'center center',
                border: isCenter ? `2px solid ${store.accentColor}` : '2px solid rgba(0,0,0,0.08)',
              }}
              animate={{
                translateX,
                translateZ,
                rotateY,
                opacity,
                scale,
              }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
              onClick={() => onGoTo(i)}
              whileHover={{ scale: scale * 1.08, y: -4 }}
              aria-label={`Ir para ${store.name}`}
            >
              <div
                className="absolute inset-0"
                style={{ background: store.bgGradient }}
              >
                {/* Store emoji watermark */}
                <span className="absolute inset-0 flex items-center justify-center text-2xl opacity-30">
                  {store.emoji}
                </span>

                {/* Store label */}
                <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1"
                  style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                >
                  <p className="text-[8px] font-bold text-white truncate text-center">{store.name}</p>
                </div>

                {/* Active indicator glow */}
                {isCenter && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 20px ${store.accentColor}30`,
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Floating Ambient Particles
   ═══════════════════════════════════════════════════════════════════════════════ */

function AmbientParticles({ accentColor }: { accentColor: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 60,
        size: 3 + Math.random() * 5,
        delay: Math.random() * 2,
      })),
    [],
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="r53-vtour-particle absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: accentColor,
            opacity: 0.2,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 6, 0],
            opacity: [0.1, 0.35, 0.1],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut' as const,
          }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Welcome Overlay
   ═══════════════════════════════════════════════════════════════════════════════ */

function WelcomeOverlay({
  onStart,
}: {
  onStart: () => void
}) {
  return (
    <motion.div
      className="r53-vtour-welcome absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="r53-vtour-welcome-card text-center px-8 py-10 rounded-3xl max-w-sm"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 250, damping: 20, delay: 0.1 }}
      >
        <motion.div
          className="r53-vtour-welcome-icon w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
          }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <Compass className="w-10 h-10 text-white" />
        </motion.div>

        <h2 className="r53-vtour-welcome-title text-2xl font-bold text-white mb-2">
          Tour Virtual
        </h2>
        <p className="r53-vtour-welcome-subtitle text-sm text-white/60 mb-2">
          Explore as melhores lojas de Dom Eliseu
        </p>
        <p className="r53-vtour-welcome-desc text-[12px] text-white/40 mb-8 leading-relaxed">
          Navegue por {TOTAL_STORES} lojas incríveis, descubra produtos e conheça cada estabelecimento sem sair de casa.
        </p>

        {/* Feature hints */}
        <div className="r53-vtour-welcome-features flex justify-center gap-4 mb-8">
          {[
            { icon: Hand, label: 'Arraste para explorar' },
            { icon: Eye, label: 'Toque nos pins' },
            { icon: Volume2, label: 'Áudio guia' },
          ].map((feat, i) => {
            const FeatIcon = feat.icon
            return (
              <motion.div
                key={feat.label}
                className="r53-vtour-welcome-feat flex flex-col items-center gap-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div className="r53-vtour-welcome-feat-icon w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <FeatIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[9px] text-white/50 text-center leading-tight">{feat.label}</span>
              </motion.div>
            )
          })}
        </div>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            className="r53-vtour-start-btn w-full py-3 text-base font-bold text-white rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
            }}
            onClick={onStart}
          >
            Começar o Tour
          </Button>
        </motion.div>

        <motion.p
          className="r53-vtour-welcome-skip text-[10px] text-white/30 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Duração aproximada: 2 minutos
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Completion Screen
   ═══════════════════════════════════════════════════════════════════════════════ */

function CompletionScreen({
  onRestart,
  onClose,
}: {
  onRestart: () => void
  onClose: () => void
}) {
  return (
    <motion.div
      className="r53-vtour-completion absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="r53-vtour-completion-card text-center px-8 py-10 rounded-3xl max-w-sm"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        initial={{ scale: 0.7, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 250, damping: 20 }}
      >
        {/* Trophy */}
        <motion.div
          className="r53-vtour-completion-trophy w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
            boxShadow: '0 8px 32px rgba(245,158,11,0.35)',
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <span className="text-3xl">🏆</span>
        </motion.div>

        <h2 className="r53-vtour-completion-title text-2xl font-bold text-white mb-2">
          Tour Completo!
        </h2>
        <p className="r53-vtour-completion-desc text-sm text-white/60 mb-6">
          Você visitou todas as {TOTAL_STORES} lojas de Dom Eliseu. Parabéns!
        </p>

        {/* Store badges */}
        <div className="r53-vtour-completion-badges flex justify-center gap-2 mb-8">
          {STORE_LOCATIONS.map((store, i) => (
            <motion.div
              key={store.id}
              className="r53-vtour-completion-badge w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `${store.accentColor}20`, border: `1px solid ${store.accentColor}40` }}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.3 + i * 0.1 }}
            >
              <span className="text-base">{store.emoji}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="r53-vtour-restart-btn w-full py-3 text-sm font-bold text-white rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
              }}
              onClick={onRestart}
            >
              Fazer o Tour Novamente
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              className="r53-vtour-close-btn w-full py-3 text-sm font-medium text-white/60 rounded-xl"
              onClick={onClose}
            >
              Sair do Tour
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Component: VirtualMarketTour
   ═══════════════════════════════════════════════════════════════════════════════ */

export function VirtualMarketTour() {
  const { navigate } = useAppStore()

  // Tour state
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [currentStoreIndex, setCurrentStoreIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [visitedSet, setVisitedSet] = useState<Set<number>>(new Set([0]))

  // Pan/Zoom state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)

  // UI state
  const [selectedPin, setSelectedPin] = useState<string | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(false)
  const [showTour, setShowTour] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)

  const currentStore = STORE_LOCATIONS[currentStoreIndex]

  // ── Navigation ───────────────────────────────────────────────────────────────

  const goToStore = useCallback(
    (index: number, dir?: number) => {
      if (index < 0 || index >= TOTAL_STORES || index === currentStoreIndex) return
      setDirection(dir ?? (index > currentStoreIndex ? 1 : -1))
      setCurrentStoreIndex(index)
      setSelectedPin(null)
      setZoom(1)
      setPan({ x: 0, y: 0 })
      setIsInfoCollapsed(false)
      setVisitedSet((prev) => {
        const next = new Set(prev)
        next.add(index)
        return next
      })
    },
    [currentStoreIndex],
  )

  const goNext = useCallback(() => {
    if (currentStoreIndex < TOTAL_STORES - 1) {
      goToStore(currentStoreIndex + 1, 1)
    }
  }, [currentStoreIndex, goToStore])

  const goPrev = useCallback(() => {
    if (currentStoreIndex > 0) {
      goToStore(currentStoreIndex - 1, -1)
    }
  }, [currentStoreIndex, goToStore])

  // Check completion when all visited
  useEffect(() => {
    if (visitedSet.size === TOTAL_STORES && started && !completed) {
      const timer = setTimeout(() => setCompleted(true), 800)
      return () => clearTimeout(timer)
    }
  }, [visitedSet, started, completed])

  // ── Pan / Zoom handlers ─────────────────────────────────────────────────────

  const handlePanStart = useCallback(() => {
    setIsPanning(true)
  }, [])

  const handlePanMove = useCallback((dx: number, dy: number) => {
    setPan((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }))
  }, [])

  const handlePanEnd = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Zoom with scroll
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      setZoom((prev) => Math.max(1, Math.min(2.5, prev - e.deltaY * 0.002)))
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!started || completed) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'Escape') {
        setSelectedPin(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [started, completed, goNext, goPrev])

  // ── Pin handlers ────────────────────────────────────────────────────────────

  const handlePinClick = useCallback((pinId: string) => {
    setSelectedPin((prev) => (prev === pinId ? null : pinId))
  }, [])

  const handleClosePin = useCallback(() => {
    setSelectedPin(null)
  }, [])

  // ── Audio toggle ────────────────────────────────────────────────────────────

  const toggleAudio = useCallback(() => {
    setIsAudioPlaying((prev) => !prev)
  }, [])

  // ── Enter store ─────────────────────────────────────────────────────────────

  const handleEnterStore = useCallback(() => {
    navigate('store')
  }, [navigate])

  // ── Tour lifecycle ──────────────────────────────────────────────────────────

  const handleStartTour = useCallback(() => {
    setStarted(true)
    setVisitedSet(new Set([0]))
    setCurrentStoreIndex(0)
    setCompleted(false)
  }, [])

  const handleRestart = useCallback(() => {
    setVisitedSet(new Set([0]))
    setCurrentStoreIndex(0)
    setCompleted(false)
    setDirection(0)
    setSelectedPin(null)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const handleClose = useCallback(() => {
    setShowTour(false)
  }, [])

  if (!showTour) return null

  return (
    <section className="r53-vtour-section w-full" ref={containerRef}>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <motion.div
          className="r53-vtour-header-bar w-1 h-7 rounded-full"
          style={{ background: 'linear-gradient(180deg, #10b981, #06b6d4)' }}
          animate={{ scaleY: [1, 1.4, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
        />
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary" />
          <h2 className="r53-vtour-title text-lg sm:text-xl font-bold text-foreground">
            Tour Virtual do Mercado
          </h2>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <BadgePercent className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-semibold text-primary">Novidade</span>
        </div>
      </div>

      {/* Main tour container */}
      <div className="r53-vtour-container relative rounded-2xl overflow-hidden"
        style={{
          background: '#0f0f14',
          minHeight: 520,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Welcome overlay */}
        <AnimatePresence>
          {!started && (
            <WelcomeOverlay onStart={handleStartTour} />
          )}
        </AnimatePresence>

        {/* Completion screen */}
        <AnimatePresence>
          {completed && (
            <CompletionScreen onRestart={handleRestart} onClose={handleClose} />
          )}
        </AnimatePresence>

        {/* Main tour content */}
        {started && !completed && (
          <>
            {/* Top bar: progress + audio */}
            <div className="r53-vtour-top-bar absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 gap-2">
              <TourProgressIndicator
                visitedCount={visitedSet.size}
                total={TOTAL_STORES}
              />
              <AudioGuideController
                isPlaying={isAudioPlaying}
                onToggle={toggleAudio}
              />
            </div>

            {/* Current store view with pan/zoom */}
            <div className="r53-vtour-viewport relative w-full" style={{ height: 420 }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStore.id}
                  className="absolute inset-0"
                  custom={direction}
                  variants={storeTransitionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: 'spring' as const,
                    stiffness: 250,
                    damping: 28,
                  }}
                >
                  <StoreInteriorView
                    store={currentStore}
                    zoom={zoom}
                    pan={pan}
                    onPanStart={handlePanStart}
                    onPanMove={handlePanMove}
                    onPanEnd={handlePanEnd}
                    selectedPin={selectedPin}
                    onPinClick={handlePinClick}
                    onClosePin={handleClosePin}
                  />

                  {/* Ambient particles */}
                  <AmbientParticles accentColor={currentStore.accentColor} />
                </motion.div>
              </AnimatePresence>

              {/* Direction arrows */}
              <DirectionalArrows
                canGoLeft={currentStoreIndex > 0}
                canGoRight={currentStoreIndex < TOTAL_STORES - 1}
                onLeft={goPrev}
                onRight={goNext}
                accentColor={currentStore.accentColor}
              />

              {/* Store info overlay */}
              <StoreInfoOverlay
                store={currentStore}
                onEnterStore={handleEnterStore}
                isCollapsed={isInfoCollapsed}
                onToggleCollapse={() => setIsInfoCollapsed((prev) => !prev)}
              />
            </div>

            {/* Bottom section: minimap + carousel */}
            <div
              className="r53-vtour-bottom-panel relative z-20"
              style={{
                background: 'linear-gradient(180deg, transparent, rgba(15,15,20,0.95) 20%)',
                paddingTop: 12,
              }}
            >
              {/* 3D perspective carousel */}
              <PerspectiveCarousel
                currentIndex={currentStoreIndex}
                onGoTo={(i) => goToStore(i)}
              />

              {/* Minimap */}
              <div className="r53-vtour-minimap-wrapper px-3 mt-2">
                <TourMinimap
                  currentStoreIndex={currentStoreIndex}
                  visitedSet={visitedSet}
                  onGoToStore={(i) => goToStore(i)}
                />
              </div>
            </div>

            {/* Tour counter badge */}
            <motion.div
              className="r53-vtour-store-counter absolute bottom-3 right-3 z-30 px-3 py-1.5 rounded-full flex items-center gap-1.5"
              style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' as const, stiffness: 300 }}
            >
              <Home className="w-3.5 h-3.5 text-white/60" />
              <span className="text-[11px] font-bold text-white">
                {currentStoreIndex + 1}/{TOTAL_STORES}
              </span>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
