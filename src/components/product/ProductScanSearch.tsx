'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanLine as ScanLineIcon,
  Camera,
  Search,
  History,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Clock,
  Star,
  Package,
  Keyboard,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Loader2,
  Zap,
  Image as ImageIcon,
  QrCode,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

/* ══════════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════════ */

interface ScanProduct {
  id: string
  ean: string
  name: string
  price: number
  comparePrice: number | null
  rating: number
  reviews: number
  image: string
  store: string
  category: string
  inStock: boolean
}

interface ScanHistoryEntry {
  id: string
  product: ScanProduct
  scannedAt: Date
  scanMode: 'barcode' | 'qr' | 'photo'
}

type ScanMode = 'barcode' | 'qr' | 'photo'
type ScanState = 'idle' | 'scanning' | 'found' | 'not-found'
type ViewMode = 'scanner' | 'history' | 'manual'

/* ══════════════════════════════════════════════════════════════
   Mock Data — 10 scannable products with EAN codes
   ══════════════════════════════════════════════════════════════ */

const SCAN_PRODUCTS: ScanProduct[] = [
  {
    id: 'scan-001',
    ean: '7891000100103',
    name: 'Café Torrado e Moído Premium 500g',
    price: 32.90,
    comparePrice: 39.90,
    rating: 4.7,
    reviews: 342,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80',
    store: 'Café do Centro',
    category: 'Alimentação',
    inStock: true,
  },
  {
    id: 'scan-002',
    ean: '7891000100110',
    name: 'Azeite Extra Virgem 500ml',
    price: 47.50,
    comparePrice: null,
    rating: 4.9,
    reviews: 218,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    store: 'Empório do Sabor',
    category: 'Alimentação',
    inStock: true,
  },
  {
    id: 'scan-003',
    ean: '7891000100127',
    name: 'Chocolate Belga ao Leite 200g',
    price: 18.90,
    comparePrice: 24.90,
    rating: 4.6,
    reviews: 567,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80',
    store: 'Chocolateria artesanal',
    category: 'Doces',
    inStock: true,
  },
  {
    id: 'scan-004',
    ean: '7891000100134',
    name: 'Detergente Neutro Concentrado 500ml',
    price: 4.29,
    comparePrice: null,
    rating: 4.3,
    reviews: 891,
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
    store: 'Limpeza Total',
    category: 'Limpeza',
    inStock: true,
  },
  {
    id: 'scan-005',
    ean: '7891000100141',
    name: 'Shampoo Revitalizante 400ml',
    price: 29.90,
    comparePrice: 34.90,
    rating: 4.5,
    reviews: 445,
    image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80',
    store: 'Farmácia Vida Saudável',
    category: 'Higiene',
    inStock: true,
  },
  {
    id: 'scan-006',
    ean: '7891000100158',
    name: 'Pão de Queijo Congelado 1kg',
    price: 22.90,
    comparePrice: null,
    rating: 4.8,
    reviews: 1203,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    store: 'Padaria Sabor Mineiro',
    category: 'Padaria',
    inStock: true,
  },
  {
    id: 'scan-007',
    ean: '7891000100165',
    name: 'Vinho Tinto Reserva 750ml',
    price: 89.90,
    comparePrice: 109.90,
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80',
    store: 'Adega Dom Eliseu',
    category: 'Bebidas',
    inStock: true,
  },
  {
    id: 'scan-008',
    ean: '7891000100172',
    name: 'Ração Premium para Cães Adultos 15kg',
    price: 129.90,
    comparePrice: 149.90,
    rating: 4.4,
    reviews: 678,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&q=80',
    store: 'Pet Shop Amigo Fiel',
    category: 'Pet',
    inStock: true,
  },
  {
    id: 'scan-009',
    ean: '7891000100189',
    name: 'Açaí Congelado 1L',
    price: 26.90,
    comparePrice: null,
    rating: 4.6,
    reviews: 934,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80',
    store: 'Açaí do Parque',
    category: 'Alimentação',
    inStock: false,
  },
  {
    id: 'scan-010',
    ean: '7891000100196',
    name: 'Cerveja Artesanal IPA 600ml',
    price: 19.90,
    comparePrice: null,
    rating: 4.3,
    reviews: 287,
    image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80',
    store: 'Cervejaria Artesanal',
    category: 'Bebidas',
    inStock: true,
  },
]

/* ══════════════════════════════════════════════════════════════
   Constants & helpers
   ══════════════════════════════════════════════════════════════ */

const SCAN_MODES: { value: ScanMode; label: string; icon: React.ReactNode }[] = [
  { value: 'barcode', label: 'Código de Barras', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { value: 'qr', label: 'QR Code', icon: <QrCode className="h-3.5 w-3.5" /> },
  { value: 'photo', label: 'Pesquisa por Foto', icon: <ImageIcon className="h-3.5 w-3.5" /> },
]

const SCAN_DURATION_MS = 2200

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Agora mesmo'
  if (diffMin < 60) return `${diffMin}min atrás`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h atrás`
  return `${Math.floor(diffH / 24)}d atrás`
}

function findProductByEan(ean: string): ScanProduct | undefined {
  return SCAN_PRODUCTS.find((p) => p.ean === ean.trim())
}

function simulateRandomProduct(): ScanProduct {
  return SCAN_PRODUCTS[Math.floor(Math.random() * SCAN_PRODUCTS.length)]
}

/* ══════════════════════════════════════════════════════════════
   Animated corner bracket
   ══════════════════════════════════════════════════════════════ */

function CornerBracket({
  position,
  isScanning,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  isScanning: boolean
}) {
  const posClasses: Record<string, string> = {
    'top-left': 'r41-corner-tl top-3 left-3',
    'top-right': 'r41-corner-tr top-3 right-3',
    'bottom-left': 'r41-corner-bl bottom-3 left-3',
    'bottom-right': 'r41-corner-br bottom-3 right-3',
  }

  const borderStyles: Record<string, React.CSSProperties> = {
    'top-left': { borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
    'top-right': { borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
    'bottom-left': { borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
    'bottom-right': { borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },
  }

  return (
    <motion.div
      className={`r41-corner-bracket absolute ${posClasses[position]} w-8 h-8`}
      style={{
        borderStyle: 'solid',
        borderColor: isScanning ? '#10b981' : 'rgba(255,255,255,0.7)',
        ...borderStyles[position],
      }}
      animate={
        isScanning
          ? {
              opacity: [1, 0.4, 1],
              scale: [1, 1.15, 1],
            }
          : { opacity: 1 }
      }
      transition={
        isScanning
          ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
          : { type: 'spring' as const, stiffness: 400, damping: 25 }
      }
    />
  )
}

/* ══════════════════════════════════════════════════════════════
   Scanning line animation
   ══════════════════════════════════════════════════════════════ */

function ScanLineAnim() {
  return (
    <motion.div
      className="r41-scan-line absolute left-4 right-4 h-[2px] z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, transparent, #10b981, #34d399, #10b981, transparent)',
        boxShadow: '0 0 16px rgba(16,185,129,0.6), 0 0 40px rgba(16,185,129,0.2)',
      }}
      animate={{ top: ['12%', '88%'] }}
      transition={{
        duration: 2.2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
    />
  )
}

/* ══════════════════════════════════════════════════════════════
   Scanning progress bar
   ══════════════════════════════════════════════════════════════ */

function ScanProgress({ progress }: { progress: number }) {
  return (
    <div className="r41-scan-progress w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
      <motion.div
        className="r41-scan-progress-bar h-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)',
          boxShadow: '0 0 8px rgba(16,185,129,0.5)',
        }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'spring' as const, stiffness: 120, damping: 22 }}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Star rating mini display
   ══════════════════════════════════════════════════════════════ */

function StarRatingMini({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="r41-star-rating flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-3 w-3"
          style={{ color: i < Math.round(rating) ? '#f59e0b' : 'rgba(255,255,255,0.2)', fill: i < Math.round(rating) ? '#f59e0b' : 'none' }}
        />
      ))}
      <span className="r41-star-rating-count text-[10px] ml-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
        ({reviews})
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Quantity stepper for product card
   ══════════════════════════════════════════════════════════════ */

function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
}: {
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
}) {
  return (
    <div className="r41-qty-stepper flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
      <motion.button
        className="r41-qty-btn-dec w-8 h-8 flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.08)' }}
        whileTap={{ scale: 0.9 }}
        onClick={onDecrement}
        aria-label="Diminuir quantidade"
      >
        <Minus className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} />
      </motion.button>
      <motion.span
        className="r41-qty-value w-10 text-center text-sm font-semibold"
        style={{ color: '#fff' }}
        key={quantity}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
      >
        {quantity}
      </motion.span>
      <motion.button
        className="r41-qty-btn-inc w-8 h-8 flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.08)' }}
        whileTap={{ scale: 0.9 }}
        onClick={onIncrement}
        aria-label="Aumentar quantidade"
      >
        <Plus className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} />
      </motion.button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Success checkmark animation
   ══════════════════════════════════════════════════════════════ */

function SuccessCheckmark() {
  return (
    <motion.div
      className="r41-success-check relative flex items-center justify-center"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 18 }}
    >
      <motion.div
        className="r41-success-ring absolute w-16 h-16 rounded-full"
        style={{ border: '3px solid #10b981' }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.4, 1], opacity: [0, 1, 0.8] }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <motion.div
        className="r41-success-icon w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: '#10b981', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 350, damping: 22, delay: 0.15 }}
      >
        <CheckCircle2 className="h-6 w-6 text-white" />
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Not-found animation
   ══════════════════════════════════════════════════════════════ */

function NotFoundAnimation() {
  return (
    <motion.div
      className="r41-not-found-anim flex flex-col items-center gap-3 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
    >
      <motion.div
        className="r41-not-found-icon w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.12)', boxShadow: '0 0 30px rgba(239,68,68,0.1)' }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <XCircle className="h-8 w-8" style={{ color: '#ef4444' }} />
      </motion.div>
      <div className="text-center">
        <p className="r41-not-found-title text-base font-semibold" style={{ color: '#ef4444' }}>
          Produto não encontrado
        </p>
        <p className="r41-not-found-desc text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Tente escanear novamente ou digite o código manualmente
        </p>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Suggestions row for not-found state
   ══════════════════════════════════════════════════════════════ */

function SuggestionsRow({ onSelect }: { onSelect: (ean: string) => void }) {
  const suggestions = SCAN_PRODUCTS.slice(0, 4)
  return (
    <div className="r41-suggestions mt-4">
      <p className="r41-suggestions-label text-[11px] font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
        Produtos populares para testar:
      </p>
      <div className="r41-suggestions-list flex gap-2 overflow-x-auto pb-1">
        {suggestions.map((p) => (
          <motion.button
            key={p.id}
            className="r41-suggestion-chip shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(p.ean)}
          >
            <Zap className="h-3 w-3" style={{ color: '#f59e0b' }} />
            {p.name.split(' ').slice(0, 3).join(' ')}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Product card after scan
   ══════════════════════════════════════════════════════════════ */

function FoundProductCard({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  addedToCart,
}: {
  product: ScanProduct
  quantity: number
  onQuantityChange: (q: number) => void
  onAddToCart: () => void
  addedToCart: boolean
}) {
  return (
    <motion.div
      className="r41-found-card rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
    >
      {/* Product image with gradient overlay */}
      <div className="r41-found-img-wrap relative h-40 overflow-hidden">
        <motion.img
          src={product.image}
          alt={product.name}
          className="r41-found-img w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 26 }}
        />
        <div
          className="r41-found-img-overlay absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(15,15,15,0.95) 0%, rgba(15,15,15,0.1) 60%)' }}
        />
        {/* Success badge */}
        <motion.div
          className="r41-found-badge absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{ background: 'rgba(16,185,129,0.9)', color: '#fff', boxShadow: '0 2px 10px rgba(16,185,129,0.3)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.2 }}
        >
          <CheckCircle2 className="h-3 w-3" />
          Produto Encontrado
        </motion.div>
        {/* Category badge */}
        <Badge className="r41-found-cat-badge absolute top-3 left-3 text-[10px] font-medium" variant="secondary">
          {product.category}
        </Badge>
      </div>

      {/* Product info */}
      <div className="r41-found-info px-4 pb-4 -mt-6 relative z-10">
        <p className="r41-found-store text-[10px] font-medium" style={{ color: '#10b981' }}>
          {product.store}
        </p>
        <h3 className="r41-found-name text-sm font-semibold mt-0.5 leading-tight" style={{ color: '#fff' }}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="r41-found-rating mt-1.5">
          <StarRatingMini rating={product.rating} reviews={product.reviews} />
        </div>

        {/* Price row */}
        <div className="r41-found-price-row flex items-end justify-between mt-3">
          <div className="r41-found-prices">
            {product.comparePrice && (
              <span className="r41-found-compare-price text-[11px] line-through block" style={{ color: 'rgba(255,255,255,0.35)' }}>
                R$ {product.comparePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
            <span className="r41-found-price text-xl font-bold" style={{ color: '#10b981' }}>
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Quantity stepper */}
          <QuantityStepper
            quantity={quantity}
            onIncrement={() => onQuantityChange(Math.min(quantity + 1, 99))}
            onDecrement={() => onQuantityChange(Math.max(quantity - 1, 1))}
          />
        </div>

        {/* Stock status */}
        {!product.inStock && (
          <motion.div
            className="r41-found-oos mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
          >
            <Package className="h-3 w-3" />
            Produto indisponível no momento
          </motion.div>
        )}

        {/* Add to cart button */}
        <AnimatePresence mode="wait">
          {addedToCart ? (
            <motion.div
              key="added"
              className="r41-added-msg w-full mt-3 py-2.5 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Adicionado ao carrinho!
            </motion.div>
          ) : (
            <motion.div
              key="add-btn"
              className="r41-add-btn-wrap w-full mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
            >
              <Button
                className="r41-add-btn w-full h-11 rounded-xl text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
                onClick={onAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Adicionar {quantity > 1 ? `(${quantity}x)` : ''}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Scan history entry
   ══════════════════════════════════════════════════════════════ */

function HistoryEntry({
  entry,
  index,
  onRescan,
}: {
  entry: ScanHistoryEntry
  index: number
  onRescan: (ean: string) => void
}) {
  const modeLabel: Record<ScanMode, string> = {
    barcode: 'Barras',
    qr: 'QR',
    photo: 'Foto',
  }
  const modeIcon: Record<ScanMode, React.ReactNode> = {
    barcode: <BarChart3 className="h-3 w-3" />,
    qr: <QrCode className="h-3 w-3" />,
    photo: <ImageIcon className="h-3 w-3" />,
  }

  return (
    <motion.div
      className="r41-history-entry flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 24, delay: index * 0.06 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onRescan(entry.product.ean)}
    >
      {/* Thumbnail */}
      <div className="r41-history-thumb w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <img src={entry.product.image} alt={entry.product.name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="r41-history-info flex-1 min-w-0">
        <p className="r41-history-name text-xs font-semibold truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>
          {entry.product.name}
        </p>
        <div className="r41-history-meta flex items-center gap-2 mt-0.5">
          <span className="r41-history-price text-xs font-bold" style={{ color: '#10b981' }}>
            R$ {entry.product.price.toFixed(2)}
          </span>
          <span className="r41-history-separator">·</span>
          <span className="r41-history-time text-[10px] flex items-center gap-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Clock className="h-2.5 w-2.5" />
            {formatTimeAgo(entry.scannedAt)}
          </span>
        </div>
      </div>

      {/* Scan mode badge */}
      <div
        className="r41-history-mode flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
      >
        {modeIcon[entry.scanMode]}
        {modeLabel[entry.scanMode]}
      </div>

      <ChevronRight className="r41-history-arrow h-4 w-4 shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Gradient glow ring for scanner
   ══════════════════════════════════════════════════════════════ */

function ScannerGlowRing({ isScanning }: { isScanning: boolean }) {
  return (
    <motion.div
      className="r41-glow-ring absolute inset-0 rounded-2xl pointer-events-none"
      animate={
        isScanning
          ? {
              boxShadow: [
                '0 0 20px rgba(16,185,129,0.15), 0 0 60px rgba(16,185,129,0.08), inset 0 0 20px rgba(16,185,129,0.03)',
                '0 0 35px rgba(16,185,129,0.3), 0 0 80px rgba(16,185,129,0.12), inset 0 0 30px rgba(16,185,129,0.06)',
                '0 0 20px rgba(16,185,129,0.15), 0 0 60px rgba(16,185,129,0.08), inset 0 0 20px rgba(16,185,129,0.03)',
              ],
            }
          : { boxShadow: '0 0 0 rgba(0,0,0,0)' }
      }
      transition={
        isScanning
          ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
          : { type: 'spring' as const, stiffness: 200, damping: 28 }
      }
      style={{
        border: isScanning ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.06)',
      }}
    />
  )
}

/* ══════════════════════════════════════════════════════════════
   Floating particles in scanner
   ══════════════════════════════════════════════════════════════ */

function ScannerParticles({ isScanning }: { isScanning: boolean }) {
  return (
    <AnimatePresence>
      {isScanning && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="r41-particle absolute w-1 h-1 rounded-full pointer-events-none"
              style={{
                background: '#34d399',
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                boxShadow: '0 0 4px rgba(52,211,153,0.5)',
              }}
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
                y: [0, -20 - Math.random() * 15],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5 + Math.random(),
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  )
}

/* ══════════════════════════════════════════════════════════════
   Viewfinder area
   ══════════════════════════════════════════════════════════════ */

function ScannerViewfinder({ isScanning, scanState }: { isScanning: boolean; scanState: ScanState }) {
  return (
    <div className="r41-viewfinder relative w-full aspect-[4/3] rounded-2xl overflow-hidden" style={{ background: 'rgba(15,15,15,0.9)' }}>
      {/* Background pattern */}
      <div
        className="r41-viewfinder-bg absolute inset-0"
        style={{
          background: `
            repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 30px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 30px)
          `,
        }}
      />

      {/* Glow ring */}
      <ScannerGlowRing isScanning={isScanning} />

      {/* Corner brackets */}
      <CornerBracket position="top-left" isScanning={isScanning} />
      <CornerBracket position="top-right" isScanning={isScanning} />
      <CornerBracket position="bottom-left" isScanning={isScanning} />
      <CornerBracket position="bottom-right" isScanning={isScanning} />

      {/* Scan line */}
      {isScanning && <ScanLineAnim />}

      {/* Particles */}
      <ScannerParticles isScanning={isScanning} />

      {/* Center icon */}
      <AnimatePresence mode="wait">
        {!isScanning && scanState === 'idle' && (
          <motion.div
            key="idle-icon"
            className="r41-idle-icon absolute inset-0 flex flex-col items-center justify-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
          >
            <motion.div
              className="r41-idle-icon-wrap w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '2px dashed rgba(16,185,129,0.3)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            >
              <ScanLineIcon className="h-7 w-7" style={{ color: '#10b981' }} />
            </motion.div>
            <p className="r41-idle-text text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Escaneando Produto
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanning indicator */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            key="scanning-label"
            className="r41-scanning-label absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full z-20"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="r41-scanning-dot w-2 h-2 rounded-full"
              style={{ background: '#10b981' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <span className="r41-scanning-label-text text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Escaneando...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main component — ProductScanSearch
   ══════════════════════════════════════════════════════════════ */

export function ProductScanSearch() {
  /* ── State ── */
  const [scanMode, setScanMode] = useState<ScanMode>('barcode')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [viewMode, setViewMode] = useState<ViewMode>('scanner')
  const [scanProgress, setScanProgress] = useState(0)
  const [foundProduct, setFoundProduct] = useState<ScanProduct | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── Clean up intervals on unmount ── */
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current)
    }
  }, [])

  /* ── Start scanning ── */
  const startScan = useCallback(
    (ean?: string) => {
      if (scanState === 'scanning') return

      setScanState('scanning')
      setScanProgress(0)
      setAddedToCart(false)
      setFoundProduct(null)
      setViewMode('scanner')

      /* Progress simulation */
      progressIntervalRef.current = setInterval(() => {
        setScanProgress((prev) => {
          const next = prev + Math.random() * 15 + 5
          return Math.min(next, 95)
        })
      }, 200)

      /* Complete scan */
      scanTimeoutRef.current = setTimeout(() => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
        setScanProgress(100)

        setTimeout(() => {
          const product = ean ? findProductByEan(ean) : simulateRandomProduct()
          if (product) {
            setFoundProduct(product)
            setScanState('found')
            setQuantity(1)
            /* Add to history */
            setScanHistory((prev) => [
              {
                id: `hist-${Date.now()}`,
                product,
                scannedAt: new Date(),
                scanMode: ean ? 'barcode' : scanMode,
              },
              ...prev,
            ].slice(0, 20))
          } else {
            setScanState('not-found')
          }
        }, 300)
      }, SCAN_DURATION_MS)
    },
    [scanState, scanMode],
  )

  /* ── Reset scanner ── */
  const resetScanner = useCallback(() => {
    setScanState('idle')
    setScanProgress(0)
    setFoundProduct(null)
    setAddedToCart(false)
    setQuantity(1)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current)
  }, [])

  /* ── Handle manual submit ── */
  const handleManualSubmit = useCallback(() => {
    if (!manualInput.trim()) return
    startScan(manualInput.trim())
    setManualInput('')
  }, [manualInput, startScan])

  /* ── Handle keyboard in manual input ── */
  const handleManualKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleManualSubmit()
    },
    [handleManualSubmit],
  )

  /* ── Add to cart (mock) ── */
  const handleAddToCart = useCallback(() => {
    setAddedToCart(true)
    /* Auto-reset after 2s */
    setTimeout(() => setAddedToCart(false), 2500)
  }, [])

  /* ── Rescan from history ── */
  const handleRescan = useCallback(
    (ean: string) => {
      resetScanner()
      setTimeout(() => startScan(ean), 100)
    },
    [resetScanner, startScan],
  )

  /* ── Suggestion select ── */
  const handleSuggestionSelect = useCallback(
    (ean: string) => {
      resetScanner()
      setTimeout(() => startScan(ean), 100)
    },
    [resetScanner, startScan],
  )

  const isScanning = scanState === 'scanning'

  /* ════════════════════════════════════════════════════════════
     Render
     ════════════════════════════════════════════════════════════ */
  return (
    <motion.div
      className="r41-root relative w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 26 }}
    >
      {/* ─── Header ─── */}
      <div className="r41-header flex items-center justify-between mb-4">
        <div className="r41-header-left flex items-center gap-2.5">
          <div
            className="r41-header-icon w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.12)' }}
          >
            <Camera className="h-4.5 w-4.5" style={{ color: '#10b981' }} />
          </div>
          <div>
            <h2 className="r41-header-title text-base font-bold" style={{ color: '#fff' }}>
              Escanear Produto
            </h2>
            <p className="r41-header-subtitle text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Aponte a câmera ou digite o código
            </p>
          </div>
        </div>

        {/* View toggles */}
        <div className="r41-header-actions flex items-center gap-1.5">
          <motion.button
            className="r41-history-toggle w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: isHistoryOpen ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
            }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setIsHistoryOpen(!isHistoryOpen)
              if (!isHistoryOpen) setViewMode('history')
              else setViewMode('scanner')
            }}
            aria-label="Histórico de escaneamentos"
          >
            <History className="h-4 w-4" style={{ color: isHistoryOpen ? '#10b981' : 'rgba(255,255,255,0.5)' }} />
          </motion.button>
          <motion.button
            className="r41-manual-toggle w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: viewMode === 'manual' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
            }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setViewMode(viewMode === 'manual' ? 'scanner' : 'manual')
              setIsHistoryOpen(false)
            }}
            aria-label="Digitar código manualmente"
          >
            <Keyboard className="h-4 w-4" style={{ color: viewMode === 'manual' ? '#10b981' : 'rgba(255,255,255,0.5)' }} />
          </motion.button>
        </div>
      </div>

      {/* ─── Scan Mode Tabs ─── */}
      <div className="r41-tabs-wrap mb-4">
        <Tabs value={scanMode} onValueChange={(v) => setScanMode(v as ScanMode)}>
          <TabsList
            className="r41-tabs-list w-full h-9 rounded-lg p-1"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            {SCAN_MODES.map((mode) => (
              <TabsTrigger
                key={mode.value}
                value={mode.value}
                className="r41-tab-trigger flex-1 h-[calc(100%-4px)] rounded-md text-[11px] font-medium gap-1.5 data-[state=active]:shadow-sm"
                style={{
                  color: scanMode === mode.value ? '#10b981' : 'rgba(255,255,255,0.4)',
                  background: scanMode === mode.value ? 'rgba(16,185,129,0.12)' : 'transparent',
                }}
              >
                {mode.icon}
                <span className="hidden sm:inline">{mode.label}</span>
                <span className="sm:hidden">{mode.label.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* ─── Content Area ─── */}
      <AnimatePresence mode="wait">
        {/* ── History view ── */}
        {viewMode === 'history' && (
          <motion.div
            key="history"
            className="r41-history-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }}
          >
            <div className="r41-history-header flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" style={{ color: '#10b981' }} />
                <h3 className="r41-history-title text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  Histórico de Escaneamentos
                </h3>
              </div>
              {scanHistory.length > 0 && (
                <motion.button
                  className="r41-history-clear text-[10px] font-medium px-2 py-1 rounded-md"
                  style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setScanHistory([])}
                >
                  Limpar
                </motion.button>
              )}
            </div>

            {scanHistory.length === 0 ? (
              <motion.div
                className="r41-history-empty py-10 flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
              >
                <div
                  className="r41-history-empty-icon w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <ScanLineIcon className="h-6 w-6" style={{ color: 'rgba(255,255,255,0.15)' }} />
                </div>
                <p className="r41-history-empty-text text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Nenhum escaneamento realizado ainda.
                  <br />
                  Comece escaneando um produto!
                </p>
              </motion.div>
            ) : (
              <div className="r41-history-list flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                {scanHistory.map((entry, idx) => (
                  <HistoryEntry
                    key={entry.id}
                    entry={entry}
                    index={idx}
                    onRescan={handleRescan}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Manual input view ── */}
        {viewMode === 'manual' && (
          <motion.div
            key="manual"
            className="r41-manual-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }}
          >
            <div className="r41-manual-card rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="r41-manual-header flex items-center gap-2 mb-4">
                <Keyboard className="h-4 w-4" style={{ color: '#10b981' }} />
                <h3 className="r41-manual-title text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  Digitar Código
                </h3>
              </div>
              <p className="r41-manual-desc text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Digite o código EAN do produto para buscar no catálogo
              </p>

              <div className="r41-manual-input-wrap flex gap-2">
                <Input
                  className="r41-manual-input flex-1 h-10 rounded-xl text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                  placeholder="Ex: 7891000100103"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={handleManualKeyDown}
                  maxLength={13}
                />
                <motion.div whileTap={{ scale: 0.93 }}>
                  <Button
                    className="r41-manual-search-btn h-10 px-4 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 2px 12px rgba(16,185,129,0.25)' }}
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>

              {/* Quick-fill EANs for testing */}
              <div className="r41-manual-quick mt-4">
                <p className="r41-manual-quick-label text-[10px] font-medium mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Códigos de teste:
                </p>
                <div className="r41-manual-quick-list flex flex-wrap gap-1.5">
                  {SCAN_PRODUCTS.slice(0, 6).map((p) => (
                    <motion.button
                      key={p.ean}
                      className="r41-quick-chip px-2 py-1 rounded-md text-[10px] font-mono"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.55)',
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setManualInput(p.ean)
                        setViewMode('scanner')
                        resetScanner()
                        setTimeout(() => startScan(p.ean), 150)
                      }}
                    >
                      {p.ean.slice(-4)}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Scanner view ── */}
        {viewMode === 'scanner' && (
          <motion.div
            key="scanner"
            className="r41-scanner-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }}
          >
            {/* Viewfinder */}
            <ScannerViewfinder isScanning={isScanning} scanState={scanState} />

            {/* Progress bar below scanner */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  className="r41-progress-wrap mt-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
                >
                  <ScanProgress progress={scanProgress} />
                  <p className="r41-progress-label text-[10px] mt-1.5 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Reconhecendo produto...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons row */}
            <div className="r41-action-row flex items-center gap-2 mt-4">
              {/* Main scan button */}
              <motion.div className="r41-scan-btn-wrap flex-1" whileTap={{ scale: 0.96 }}>
                <Button
                  className="r41-scan-btn w-full h-12 rounded-xl text-sm font-semibold gap-2"
                  style={{
                    background: isScanning
                      ? 'rgba(255,255,255,0.06)'
                      : 'linear-gradient(135deg, #10b981, #059669)',
                    color: isScanning ? 'rgba(255,255,255,0.5)' : '#fff',
                    boxShadow: isScanning ? 'none' : '0 4px 20px rgba(16,185,129,0.3)',
                  }}
                  onClick={() => (isScanning ? null : startScan())}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Escaneando...
                    </>
                  ) : scanState === 'found' || scanState === 'not-found' ? (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      Escanear Novamente
                    </>
                  ) : (
                    <>
                      <ScanLineIcon className="h-4 w-4" />
                      Iniciar Escaneamento
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Quick scan button */}
              <motion.div whileTap={{ scale: 0.92 }}>
                <Button
                  className="r41-quick-scan-btn h-12 px-4 rounded-xl"
                  variant="outline"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                  onClick={() => startScan()}
                  disabled={isScanning}
                  aria-label="Escaneamento rápido aleatório"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            {/* ── Found product card ── */}
            <AnimatePresence>
              {scanState === 'found' && foundProduct && (
                <motion.div
                  key={`found-${foundProduct.id}`}
                  className="r41-found-wrap mt-5"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: 'spring' as const, stiffness: 240, damping: 22 }}
                >
                  {/* Success animation */}
                  <div className="r41-success-anim flex justify-center mb-4">
                    <SuccessCheckmark />
                  </div>

                  <FoundProductCard
                    product={foundProduct}
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    onAddToCart={handleAddToCart}
                    addedToCart={addedToCart}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Not-found state ── */}
            <AnimatePresence>
              {scanState === 'not-found' && (
                <motion.div
                  key="not-found"
                  className="r41-notfound-wrap mt-5 rounded-2xl p-5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: 'spring' as const, stiffness: 240, damping: 22 }}
                >
                  <NotFoundAnimation />
                  <SuggestionsRow onSelect={handleSuggestionSelect} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── EAN hint at bottom ── */}
            <AnimatePresence>
              {scanState === 'idle' && !isScanning && (
                <motion.div
                  key="ean-hint"
                  className="r41-ean-hint mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: '#f59e0b' }} />
                  <p className="r41-ean-hint-text text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Dica:</span> Clique no ícone{' '}
                    <Keyboard className="inline h-3 w-3" style={{ color: '#10b981' }} /> para digitar o código EAN
                    manualmente, ou toque em{' '}
                    <Sparkles className="inline h-3 w-3" style={{ color: '#f59e0b' }} /> para um escaneamento aleatório.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Scan count badge ─── */}
      <AnimatePresence>
        {scanHistory.length > 0 && (
          <motion.div
            key="scan-count"
            className="r41-scan-count absolute -top-1 -right-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              background: '#10b981',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
          >
            <ScanLineIcon className="h-2.5 w-2.5" />
            {scanHistory.length}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Decorative corner gradient ─── */}
      <div
        className="r41-deco-gradient absolute -top-px -left-px -right-px h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)' }}
      />
    </motion.div>
  )
}
