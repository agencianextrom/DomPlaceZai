'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Clock, Flame, ArrowRight, Zap, Plus, Check, Package, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type ProductData } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { formatBRL, CategoryIcon } from '@/components/product/ProductCard'
import { resolveProductImage } from '@/lib/product-images'
import { fireConfettiFromElement } from '@/lib/confetti'

/* ═══════════════════════════════════════════
   Tab filter categories with counts
   ═══════════════════════════════════════════ */
const tabFilters = [
  { key: 'all', label: 'Todas' },
  { key: 'FOOD', label: 'Alimentos' },
  { key: 'DRINKS', label: 'Bebidas' },
  { key: 'CLEANING', label: 'Limpeza' },
  { key: 'HYGIENE', label: 'Higiene' },
] as const

/* ═══════════════════════════════════════════
   Category map for deal items
   ═══════════════════════════════════════════ */
const dealCategoryMap: Record<string, string> = {
  FOOD: 'FOOD',
  HEALTH: 'HYGIENE',
  AGRICULTURE: 'FOOD',
  ANIMALS: 'FOOD',
}

/* ═══════════════════════════════════════════
   Daily deal data
   ═══════════════════════════════════════════ */
const dailyDeals: ProductData[] = [
  { id: 'dd1', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Arroz Tio João 5kg', slug: 'arroz-tio-joao', description: 'Arroz tipo 1 premium para sua família.', price: 24.90, comparePrice: 29.90, images: '[]', stock: 15, rating: 4.5, totalReviews: 23, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["5kg","1kg"]', category: 'FOOD' },
  { id: 'dd2', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí 500ml', slug: 'acai-500ml', description: 'Açaí cremoso feito com frutas frescas do Pará.', price: 15.00, comparePrice: 18.00, images: '[]', stock: 20, rating: 4.9, totalReviews: 89, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["300ml","500ml","700ml"]', category: 'FOOD' },
  { id: 'dd3', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: null, name: 'Vitamina C 500mg', slug: 'vitamina-c', description: 'Pote com 60 cápsulas.', price: 35.00, comparePrice: 42.00, images: '[]', stock: 8, rating: 4.7, totalReviews: 34, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["500mg","1000mg"]', category: 'HEALTH' },
  { id: 'dd4', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: null, name: 'Bolo de Chocolate', slug: 'bolo-chocolate', description: 'Bolo de chocolate com cobertura de ganache.', price: 32.00, comparePrice: 39.90, images: '[]', stock: 4, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'dd5', storeId: 's3', storeName: 'Agropecuária São Paulo', storeLogo: null, name: 'Muda de Cupuaçu', slug: 'muda-cupuacu', description: 'Muda de cupuaçuzeiro pronta para plantio.', price: 25.00, comparePrice: 35.00, images: '[]', stock: 12, rating: 4.8, totalReviews: 5, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'AGRICULTURE' },
  { id: 'dd6', storeId: 's7', storeName: 'Pet Shop Amigo Fiel', storeLogo: null, name: 'Ração Premium 15kg', slug: 'racao-premium', description: 'Ração super premium para cães adultos.', price: 89.90, comparePrice: 109.90, images: '[]', stock: 3, rating: 4.6, totalReviews: 28, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'ANIMALS' },
]

/* ═══════════════════════════════════════════
   Combo deals ("Compre Junto") section
   ═══════════════════════════════════════════ */
const comboDeals = [
  {
    id: 'combo1',
    name: 'Cesta Básica Econômica',
    items: ['Arroz 5kg', 'Feijão 1kg', 'Óleo 900ml', 'Açúcar 1kg'],
    originalPrice: 62.50,
    comboPrice: 49.90,
    savings: 20,
    emoji: '🛒',
  },
  {
    id: 'combo2',
    name: 'Kit Lanche da Tarde',
    items: ['Bolo de Chocolate', 'Açaí 500ml', 'Suco Natural'],
    originalPrice: 67.00,
    comboPrice: 54.90,
    savings: 18,
    emoji: '🍰',
  },
]

/* ═══════════════════════════════════════════
   Stagger variants
   ═══════════════════════════════════════════ */
const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const gridItemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.88 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 320, damping: 22 },
  },
}

// Simulated sold count
function getSoldCount(id: string, stock: number): number {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return Math.max(1, Math.floor(stock * (0.5 + (hash % 40) / 100)))
}

/* ------------------------------------------------------------------ */
/*  OfertaDoDiaBadge — rotating conic-gradient border badge            */
/* ------------------------------------------------------------------ */
function OfertaDoDiaBadge() {
  return (
    <div className="r59-deals-conic-badge relative">
      <div className="absolute inset-0 rounded-lg animate-[conic-rotate_3s_linear_infinite]" style={{
        background: 'conic-gradient(from 0deg, rgba(245,158,11,0.8), rgba(239,68,68,0.8), rgba(245,158,11,0.8))',
      }} />
      <span className="relative z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card text-[10px] font-bold text-amber-600 dark:text-amber-400">
        <Zap className="h-3 w-3" />
        Oferta do Dia
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  FlipDigit — per-digit vertical flip animation                      */
/* ------------------------------------------------------------------ */
function FlipDigit({ digit }: { digit: string }) {
  return (
    <div className="relative h-8 w-[15px] overflow-hidden rounded-[4px] bg-primary/10 border border-primary/20 shadow-sm" style={{ perspective: '300px' }}>
      <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-[3px] bg-gradient-to-b from-white/30 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/[0.04] to-transparent dark:from-black/20 dark:to-transparent rounded-b-[3px] pointer-events-none" />
      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-border/60 z-10" />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: 12, opacity: 0, rotateX: -90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -12, opacity: 0, rotateX: 90 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25, duration: 0.4 }}
          style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
          className="absolute inset-0 flex items-center justify-center font-mono tabular-nums text-primary text-[13px] font-bold leading-none"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  FlipCountdownTimer — splits HH:MM:SS into individual digits         */
/* ------------------------------------------------------------------ */
function FlipCountdownTimer({ expiry }: { expiry: string }) {
  const [timeStr, setTimeStr] = useState('00:00:00')
  const prevRef = useRef(timeStr)

  useEffect(() => {
    const calculate = () => {
      const now = new Date()
      const end = new Date(expiry)
      const diff = Math.max(0, end.getTime() - now.getTime())
      if (diff <= 0) { setTimeStr('Encerrada'); return }
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeStr(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
    }
    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [expiry])

  if (timeStr === 'Encerrada') {
    return <span className="font-mono text-xs font-bold text-red-500">Encerrada</span>
  }

  const prev = prevRef.current
  prevRef.current = timeStr

  return (
    <div className="flex items-center gap-[2px]">
      <motion.div
        className="absolute inset-0 -inset-x-3 -inset-y-1 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 blur-sm pointer-events-none"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
      />
      {timeStr.split('').map((char, i) => {
        if (char === ':') {
          return (
            <motion.span
              key={`colon-${i}`}
              className="font-mono text-[13px] font-bold text-muted-foreground mx-[2px] relative z-10"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              :
            </motion.span>
          )
        }
        const hasChanged = i < prev.length && prev[i] !== char
        return (
          <div key={`${char}-${i}`} className="relative z-10">
            <FlipDigit digit={char} />
            {hasChanged && (
              <motion.span
                key={`spark-${i}-${Date.now()}`}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' as const }}
                className="absolute inset-0 rounded-[4px] bg-amber-400/25 pointer-events-none"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  "Oferta Relâmpago" — animated gradient badge with fire emoji       */
/* ------------------------------------------------------------------ */
function LightningBadge({ discount }: { discount: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: -8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 500, damping: 15, delay: 0.2 }}
      className="daily-deals-badge-shimmer"
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.6 }}
      >
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-sm bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-white daily-deals-badge-shimmer r61-discount-pulse">
          <Flame className="h-2.5 w-2.5" />
          Oferta Relâmpago
          <span className="ml-0.5">-{discount}%</span>
        </span>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  "Esgotou!" badge for low stock items                               */
/* ------------------------------------------------------------------ */
function SoldOutBadge() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 600, damping: 12 }}
      className="absolute top-2 left-1/2 -translate-x-1/2 z-20"
    >
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-[9px] font-bold shadow-lg">
        <AlertTriangle className="h-2.5 w-2.5" />
        Esgotou!
      </span>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  QuickAddButton — with animated checkmark success state             */
/* ------------------------------------------------------------------ */
function QuickAddButton({ product, onAdd }: { product: ProductData; onAdd: (e: React.MouseEvent, p: ProductData) => void }) {
  const [added, setAdded] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleClick = (e: React.MouseEvent) => {
    onAdd(e, product)
    setAdded(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setAdded(false), 1500)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.04 }}
      onClick={handleClick}
      className="w-full mt-2 h-7 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors r26-shimmer-sweep relative overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {added ? (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold"
          >
            <Check className="h-3 w-3" />
            Adicionado!
          </motion.span>
        ) : (
          <motion.span
            key="plus"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Adicionar
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/*  MiniConfettiBurst — 6 particle micro-burst on add-to-cart          */
/* ------------------------------------------------------------------ */
function MiniConfettiBurst({ x, y }: { x: number; y: number }) {
  const colors = ['#10b981', '#f59e0b', '#f43f5e', '#14b8a6', '#84cc16', '#fbbf24']
  return (
    <div className="fixed pointer-events-none z-[9999]" style={{ left: x, top: y }}>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const distance = 20 + i * 6
        const color = colors[i]
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              width: 4 + (i % 3),
              height: 4 + (i % 3),
              backgroundColor: color,
              left: 0,
              top: 0,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0.4],
            }}
            transition={{ duration: 0.6, delay: i * 0.03 }}
          />
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  AnimatedPrice — spring bounce price on viewport entry               */
/* ------------------------------------------------------------------ */
function AnimatedPrice({ price, comparePrice }: { price: number; comparePrice?: number | null }) {
  return (
    <div className="flex items-baseline gap-1 mt-1.5">
      <motion.span
        className="text-sm font-bold text-primary r59-deals-price-bounce"
        initial={{ y: 8, opacity: 0, scale: 0.9 }}
        whileInView={{ y: 0, opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 12, delay: 0.15 }}
      >
        {formatBRL(price)}
      </motion.span>
      {comparePrice && (
        <motion.span
          className="text-[9px] text-muted-foreground line-through"
          initial={{ x: -4, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          {formatBRL(comparePrice)}
        </motion.span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  DealCard — with 3D tilt on mouse hover                              */
/* ------------------------------------------------------------------ */
function DealCard({
  product,
  index,
  expiry,
  onProductClick,
  onQuickAdd,
}: {
  product: ProductData
  index: number
  expiry: string
  onProductClick: (p: ProductData) => void
  onQuickAdd: (e: React.MouseEvent, p: ProductData) => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const [confettiPos, setConfettiPos] = useState<{ x: number; y: number; key: number } | null>(null)
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0
  const imgUrl = resolveProductImage({ slug: product.slug, category: product.category, images: product.images })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setTilt({
      rotateX: (y - 0.5) * -10,
      rotateY: (x - 0.5) * 10,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 })
  }, [])

  const handleAdd = (e: React.MouseEvent) => {
    onQuickAdd(e, product)
    // Trigger mini confetti burst
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setConfettiPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, key: Date.now() })
    setTimeout(() => setConfettiPos(null), 800)
  }

  return (
    <>
      <motion.div
        ref={cardRef}
        variants={gridItemVariants}
        whileHover={{
          y: -6,
          scale: 1.03,
          boxShadow: '0 8px 24px rgba(16,185,129,0.2), 0 2px 6px rgba(0,0,0,0.08), 0 0 0 1px rgba(251,191,36,0.3)',
        }}
        onClick={() => onProductClick(product)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          perspective: 800,
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className="r42-3d-tilt r42-3d-tilt-inner deal-card-hover r26-card-lift r59-deals-shimmer-sweep bg-card rounded-xl border border-border p-3 cursor-pointer hover:border-amber-300/50 dark:hover:border-amber-700/40 transition-all group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-primary/10 active:scale-[0.98] transition-transform"
      >
        {/* Heat-map gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/[0.06] via-orange-500/[0.03] to-transparent pointer-events-none z-0" />

        {/* Esgotou! badge for low stock */}
        {product.stock < 5 && <SoldOutBadge />}

        {/* Lightning badge */}
        <div className="absolute top-2 left-2 z-10">
          <LightningBadge discount={discount} />
        </div>

        {/* Animated countdown timer */}
        <motion.div
          className="absolute top-2 right-2 z-10 flex items-center gap-0.5 bg-black/60 dark:bg-black/70 backdrop-blur-sm text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full r26-glow-pulse r42-timer-pulse"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + index * 0.06, duration: 0.3 }}
        >
          <Clock className="h-2 w-2 text-amber-400" />
          <FlipCountdownTimer expiry={expiry} />
        </motion.div>

        <div className="relative z-10">
          {/* Image area */}
          <div className="h-16 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center mt-1 mb-2 group-hover:scale-105 transition-transform overflow-hidden relative">
            {imgUrl ? (
              <img src={imgUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            ) : null}
            <CategoryIcon category={product.category} />

            {/* Hover overlay with quick add */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => handleAdd(e)}
                className="h-7 px-3 bg-white dark:bg-card text-primary text-[10px] font-semibold rounded-lg flex items-center gap-1 shadow-lg"
              >
                <Plus className="h-3 w-3" />
                Adicionar
              </motion.button>
            </motion.div>
          </div>

          {/* Oferta do Dia conic badge */}
          <div className="mb-1">
            <OfertaDoDiaBadge />
          </div>

          {/* Info */}
          <p className="text-[10px] text-muted-foreground truncate">{product.storeName}</p>
          <h4 className="text-xs font-semibold line-clamp-1 mt-0.5">{product.name}</h4>
          <AnimatedPrice price={product.price} comparePrice={product.comparePrice} />

          {/* Stock indicator */}
          {product.stock <= 10 && (
            <div className="mt-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(product.stock / 20) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' as const }}
                  className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full r26-stagger-fill relative overflow-hidden"
                />
              </div>
              <p className="text-[9px] text-red-500 font-medium mt-0.5">
                {product.stock < 5 ? `🔥 Apenas ${product.stock} restantes!` : 'Últimas unidades!'}
              </p>
            </div>
          )}

          {/* Quick add button with animated checkmark */}
          <QuickAddButton product={product} onAdd={(e, p) => {
            onQuickAdd(e, p)
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            setConfettiPos({ x: rect.left + rect.width / 2, y: rect.top, key: Date.now() })
            setTimeout(() => setConfettiPos(null), 800)
          }} />

          {/* Sold progress bar */}
          {(() => {
            const sold = getSoldCount(product.id, product.stock)
            const total = product.stock + sold
            const pct = Math.round((sold / total) * 100)
            return (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] text-muted-foreground">
                    <span className="font-semibold text-orange-600 dark:text-orange-400">{sold}</span> vendidos
                  </span>
                  <span className="text-[9px] text-muted-foreground">{product.stock} restantes</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 + index * 0.05, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-500 to-red-500 r26-stagger-fill relative overflow-hidden"
                  />
                </div>
              </div>
            )
          })()}
        </div>
      </motion.div>
      {/* Mini confetti burst */}
      {confettiPos && <MiniConfettiBurst key={confettiPos.key} x={confettiPos.x} y={confettiPos.y} />}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  ComboDealCard — "Compre Junto" combo section                        */
/* ------------------------------------------------------------------ */
function ComboDealCard({ combo }: { combo: typeof comboDeals[number] }) {
  const { addToCart } = useAppStore()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    // Simulate adding combo items
    addToCart(dailyDeals[0], 'Combo')
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(16,185,129,0.15)' }}
      className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 p-4 relative overflow-hidden group"
    >
      {/* Shimmer sweep */}
      <motion.span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(16,185,129,0.06) 45%, rgba(16,185,129,0.12) 50%, rgba(16,185,129,0.06) 55%, transparent 60%)',
          backgroundSize: '250% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{combo.emoji}</span>
            <div>
              <h4 className="font-bold text-sm text-foreground">{combo.name}</h4>
              <Badge variant="secondary" className="text-[9px] mt-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50">
                Compre Junto
              </Badge>
            </div>
          </div>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">-{combo.savings}%</span>
        </div>

        {/* Items list */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {combo.items.map((item, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/20 border border-emerald-200/40 dark:border-emerald-700/30 text-foreground font-medium"
            >
              {item}
            </motion.span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground line-through">{formatBRL(combo.originalPrice)}</span>
            <span className="ml-2 text-base font-bold text-primary">{formatBRL(combo.comboPrice)}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={handleAdd}
            className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-md r26-shimmer-sweep relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="added"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="inline-flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  Adicionado!
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="inline-flex items-center gap-1"
                >
                  <Package className="h-3.5 w-3.5" />
                  Comprar Combo
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main DailyDeals component                                          */
/* ------------------------------------------------------------------ */
export function DailyDeals() {
  const { navigate, selectProduct, addToCart } = useAppStore()
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<string>('all')

  // Auto-rotate featured deal every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % dailyDeals.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  // Calculate deal expiry (end of today)
  const dealExpiry = useCallback(() => {
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    return end.toISOString()
  }, [])

  // Filter deals by active tab
  const filteredDeals = useMemo(() => {
    if (activeTab === 'all') return dailyDeals
    return dailyDeals.filter(d => dealCategoryMap[d.category] === activeTab)
  }, [activeTab])

  // Category counts for tab filters
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: dailyDeals.length }
    for (const deal of dailyDeals) {
      const tabKey = dealCategoryMap[deal.category] || 'FOOD'
      counts[tabKey] = (counts[tabKey] || 0) + 1
    }
    return counts
  }, [])

  const handleProductClick = (product: ProductData) => {
    selectProduct(product)
    navigate('product')
  }

  const handleQuickAdd = (e: React.MouseEvent, product: ProductData) => {
    e.stopPropagation()
    addToCart(product, product.storeName || 'Loja')
  }

  const featured = dailyDeals[featuredIndex]
  const featuredDiscount = featured.comparePrice
    ? Math.round(((featured.comparePrice - featured.price) / featured.comparePrice) * 100)
    : 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="space-y-4 r26-gradient-border rounded-2xl p-3 sm:p-0 sm:border-0"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold r26-shimmer-text r61-deals-shimmer">Ofertas do Dia</h2>
            <p className="text-[10px] text-muted-foreground">Preços exclusivos até às 23:59</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full relative r26-timer-glow r42-timer-pulse">
            <Clock className="h-3.5 w-3.5 r42-timer-gradient-text" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
            <span className="r42-timer-gradient-text">
              <FlipCountdownTimer expiry={dealExpiry()} />
            </span>
          </div>
        </div>
      </div>

      {/* Tab filters with counts */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {tabFilters.map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all relative overflow-hidden r42-tab-indicator ${activeTab === tab.key ? 'r42-tab-active' : ''} ${
              activeTab === tab.key
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-card text-muted-foreground border-border hover:border-amber-300'
            }`}
          >
            <span className="relative z-10">
              {tab.label}
              {tabCounts[tab.key] !== undefined && (
                <span className="ml-1 text-[10px] opacity-75">({tabCounts[tab.key] || 0})</span>
              )}
            </span>
            {activeTab === tab.key && (
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', backgroundSize: '200% 100%' }}
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Compre Junto combo section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {comboDeals.map((combo) => (
          <ComboDealCard key={combo.id} combo={combo} />
        ))}
      </div>

      {/* Featured deal — rotating */}
      <div className="daily-deals-featured-border relative r42-featured-glow">
        <motion.div
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-rose-500/20 blur-xl"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={featured.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' as const }}
            onClick={() => handleProductClick(featured)}
            className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20 rounded-[14px] p-4 cursor-pointer overflow-hidden group hover:shadow-lg transition-shadow"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-tr-full" />

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 500, damping: 14 }}
              className="daily-deals-badge-shimmer inline-flex"
            >
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] font-semibold flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Oferta exclusiva
              </Badge>
            </motion.div>

            <div className="relative flex gap-4 mt-3">
              <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                {(() => {
                  const imgUrl = resolveProductImage({ slug: featured.slug, category: featured.category, images: featured.images })
                  return imgUrl ? (
                    <img src={imgUrl} alt={featured.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : null
                })()}
                <CategoryIcon category={featured.category} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium">{featured.storeName}</p>
                <h3 className="font-bold text-sm mt-0.5 line-clamp-2">{featured.name}</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-lg font-bold text-primary">{formatBRL(featured.price)}</span>
                  {featured.comparePrice && (
                    <span className="text-xs text-muted-foreground line-through">{formatBRL(featured.comparePrice)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {featuredDiscount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 500, damping: 12, delay: 0.1 }}
                      className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded r26-ring-pulse r42-savings-spring"
                    >
                      Economize {featuredDiscount}%
                    </motion.span>
                  )}
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {featured.stock <= 5 ? (
                      <motion.span
                        animate={{ x: [0, -2, 2, -1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                        className="text-red-500 font-bold"
                      >
                        Últimas unidades!
                      </motion.span>
                    ) : (
                      `${featured.stock} disponíveis`
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {dailyDeals.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === featuredIndex ? 16 : 6,
                    opacity: i === featuredIndex ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' as const }}
                  className="h-1.5 rounded-full bg-amber-500"
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Deal cards grid — with 3D tilt */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        variants={gridContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-20px' }}
      >
        {filteredDeals.map((product, index) => {
          const cardExpiry = dealExpiry()
          return (
            <DealCard
              key={product.id}
              product={product}
              index={index}
              expiry={cardExpiry}
              onProductClick={handleProductClick}
              onQuickAdd={handleQuickAdd}
            />
          )
        })}
      </motion.div>

      {/* CTA button — Ver Oferta with gradient sweep and glow pulse */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex justify-center"
      >
        <motion.div
          whileTap={{ scale: 0.97 }}
          animate={{ boxShadow: ['0 0 0px rgba(245,158,11,0)', '0 0 20px rgba(245,158,11,0.3)', '0 0 0px rgba(245,158,11,0)'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <button
            className="daily-deals-cta-btn r26-shimmer-sweep r34-daily-deals-cta-shimmer r59-deals-cta-gradient h-9 px-5 text-xs rounded-full flex items-center gap-1.5 relative overflow-hidden"
            onClick={() => useAppStore.getState().openSearch()}
          >
            <span className="r59-deals-cta-sweep r34-daily-deals-shimmer-bar r42-ver-oferta-shimmer" />
            <span className="relative z-10 inline-flex items-center gap-1.5 font-semibold">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              Ver Oferta
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </button>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
