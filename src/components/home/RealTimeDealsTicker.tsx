'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Flame,
  Clock,
  Store,
  Filter,
  Tag,
  ShoppingBag,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/* ────────────────────────────────────────────
   Mock deal data
   ──────────────────────────────────────────── */

interface DealItem {
  id: string
  productName: string
  originalPrice: number
  salePrice: number
  discount: number
  storeName: string
  category: string
  initialSecondsLeft: number
}

const MOCK_DEALS: DealItem[] = [
  { id: 'd1', productName: 'Azeite Extra Virgem 500ml', originalPrice: 42.9, salePrice: 29.9, discount: 30, storeName: 'Mercado do Bairro', category: 'Alimentos', initialSecondsLeft: 1847 },
  { id: 'd2', productName: 'Headset Bluetooth JBL', originalPrice: 189.9, salePrice: 99.9, discount: 47, storeName: 'TechZone', category: 'Eletrônicos', initialSecondsLeft: 542 },
  { id: 'd3', productName: 'Tênis Esportivo Runner', originalPrice: 259.9, salePrice: 159.9, discount: 38, storeName: 'Sapataria Central', category: 'Moda', initialSecondsLeft: 3201 },
  { id: 'd4', productName: 'Café Especial 250g', originalPrice: 34.5, salePrice: 28.9, discount: 16, storeName: 'Café & Cia', category: 'Alimentos', initialSecondsLeft: 7200 },
  { id: 'd5', productName: 'Kit Skincare Completo', originalPrice: 149.9, salePrice: 74.9, discount: 50, storeName: 'Beleza Pura', category: 'Beleza', initialSecondsLeft: 189 },
  { id: 'd6', productName: 'Organic Alface 400g', originalPrice: 12.9, salePrice: 8.9, discount: 31, storeName: 'Horta Viva', category: 'Alimentos', initialSecondsLeft: 4500 },
  { id: 'd7', productName: 'Mochila Impermeável', originalPrice: 119.9, salePrice: 79.9, discount: 33, storeName: 'Aventura Store', category: 'Esportes', initialSecondsLeft: 2103 },
  { id: 'd8', productName: 'Smartwatch Fitness Pro', originalPrice: 399.9, salePrice: 199.9, discount: 50, storeName: 'TechZone', category: 'Eletrônicos', initialSecondsLeft: 274 },
  { id: 'd9', productName: 'Vinho Tinto Reserva', originalPrice: 89.9, salePrice: 54.9, discount: 39, storeName: 'Empório Gourmet', category: 'Bebidas', initialSecondsLeft: 5890 },
  { id: 'd10', productName: 'Camiseta Básica Premium', originalPrice: 59.9, salePrice: 34.9, discount: 42, storeName: 'Moda Urbana', category: 'Moda', initialSecondsLeft: 1230 },
  { id: 'd11', productName: 'Mouse Gamer RGB', originalPrice: 129.9, salePrice: 79.9, discount: 38, storeName: 'TechZone', category: 'Eletrônicos', initialSecondsLeft: 3610 },
  { id: 'd12', productName: 'Mel Puro 500g', originalPrice: 45.0, salePrice: 32.9, discount: 27, storeName: 'Horta Viva', category: 'Alimentos', initialSecondsLeft: 6660 },
]

const CATEGORIES = ['Todas', 'Alimentos', 'Eletrônicos', 'Moda', 'Beleza', 'Esportes', 'Bebidas']

function formatBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function discountColor(d: number): string {
  if (d > 40) return '#ef4444'
  if (d >= 20) return '#f59e0b'
  return '#22c55e'
}

function discountBgClass(d: number): string {
  if (d > 40) return 'bg-red-500/15 text-red-600 dark:text-red-400'
  if (d >= 20) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
  return 'bg-green-500/15 text-green-600 dark:text-green-400'
}

/* ────────────────────────────────────────────
   Countdown hook
   ──────────────────────────────────────────── */

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((p) => (p > 0 ? p - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return { hours: h, minutes: m, seconds: s, total: seconds }
}

/* ────────────────────────────────────────────
   Countdown display with digit animation
   ──────────────────────────────────────────── */

function CountdownDisplay({ total }: { total: number }) {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const isUrgent = total < 300

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <motion.div
      className="flex items-center gap-0.5 font-mono text-[11px] tabular-nums"
      animate={isUrgent ? { color: ['#ef4444', '#fca5a5', '#ef4444'] } : {}}
      transition={isUrgent ? { duration: 1, repeat: Infinity, ease: 'easeInOut' as const } : {}}
    >
      <motion.span
        key={h}
        initial={{ y: -4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
      >
        {pad(h)}
      </motion.span>
      <span className="text-muted-foreground">:</span>
      <motion.span
        key={m}
        initial={{ y: -4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
      >
        {pad(m)}
      </motion.span>
      <span className="text-muted-foreground">:</span>
      <motion.span
        key={s}
        initial={{ y: -4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
      >
        {pad(s)}
      </motion.span>
      <span className="ml-1 text-[9px] text-muted-foreground hidden sm:inline">restantes</span>
    </motion.div>
  )
}

/* ────────────────────────────────────────────
   Deal badge with glow
   ──────────────────────────────────────────── */

function DealBadge({ discount }: { discount: number }) {
  const color = discountColor(discount)

  return (
    <motion.div
      className="relative inline-flex items-center"
      animate={{
        boxShadow: [
          `0 0 0px ${color}`,
          `0 0 12px ${color}`,
          `0 0 0px ${color}`,
        ],
      }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const }}
    >
      <Badge className="gap-1 text-[10px] font-bold px-1.5 border-0" style={{ backgroundColor: color, color: '#ffffff' }}>
        <span>🔥</span> Oferta
      </Badge>
    </motion.div>
  )
}

/* ────────────────────────────────────────────
   Live indicator
   ──────────────────────────────────────────── */

function LiveIndicator({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2.5 w-2.5">
        <motion.span
          className="absolute inset-0 rounded-full bg-green-500"
          animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
        />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
      </span>
      <motion.span
        key={count}
        initial={{ y: -2, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
        className="text-[10px] sm:text-xs font-medium text-muted-foreground"
      >
        {count} pessoas comprando agora
      </motion.span>
    </div>
  )
}

/* ────────────────────────────────────────────
   Single deal card (used in ticker)
   ──────────────────────────────────────────── */

function DealCard({ deal }: { deal: DealItem }) {
  const { total } = useCountdown(deal.initialSecondsLeft)

  return (
    <div className="r34-deal-card shrink-0 flex items-center gap-2.5 bg-card border border-border/60 rounded-xl px-3 py-2.5 min-w-[220px] sm:min-w-[260px] hover:border-primary/30 transition-colors cursor-pointer">
      <DealBadge discount={deal.discount} />

      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <p className="text-xs font-semibold line-clamp-1 leading-tight">{deal.productName}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground line-through">{formatBRL(deal.originalPrice)}</span>
          <span className="text-sm font-bold" style={{ color: discountColor(deal.discount) }}>
            {formatBRL(deal.salePrice)}
          </span>
          <Badge className={`text-[9px] font-bold px-1 border-0 ${discountBgClass(deal.discount)}`}>
            -{deal.discount}%
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
            <Store className="h-2.5 w-2.5" />
            {deal.storeName}
          </span>
          <div className="flex items-center gap-0.5 text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            <CountdownDisplay total={total} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Expanded panel deal card
   ──────────────────────────────────────────── */

function ExpandedDealCard({ deal, index }: { deal: DealItem; index: number }) {
  const { total } = useCountdown(deal.initialSecondsLeft)
  const isUrgent = total < 300

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, type: 'spring' as const, stiffness: 280, damping: 24 }}
      className="r34-expanded-card bg-card border border-border/60 rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer group"
      style={{ boxShadow: isUrgent ? '0 0 20px rgba(239,68,68,0.12)' : '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <DealBadge discount={deal.discount} />
            <Badge variant="outline" className="text-[9px] font-medium">{deal.category}</Badge>
          </div>
          <h4 className="text-sm font-semibold line-clamp-1 mt-1">{deal.productName}</h4>
          <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
            <Store className="h-3 w-3" />
            {deal.storeName}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground line-through">{formatBRL(deal.originalPrice)}</p>
          <p className="text-lg font-bold" style={{ color: discountColor(deal.discount) }}>{formatBRL(deal.salePrice)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <CountdownDisplay total={total} />
        </div>
        <motion.div
          whileTap={{ scale: 0.92 }}
        >
          <Button size="sm" className="h-7 text-[10px] gap-1 rounded-lg" style={{ backgroundColor: discountColor(deal.discount), color: '#ffffff', border: 'none' }}>
            <ShoppingBag className="h-3 w-3" />
            Comprar
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────── */

export function RealTimeDealsTicker() {
  const [isHovered, setIsHovered] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [activeDiscount, setActiveDiscount] = useState('all')
  const [liveCount, setLiveCount] = useState(47)

  // Simulate live counter changes
  useEffect(() => {
    const id = setInterval(() => {
      setLiveCount((p) => Math.max(12, p + Math.floor(Math.random() * 7) - 3))
    }, 3000)
    return () => clearInterval(id)
  }, [])

  const filteredDeals = useMemo(() => {
    return MOCK_DEALS.filter((d) => {
      if (activeCategory !== 'Todas' && d.category !== activeCategory) return false
      if (activeDiscount === '20' && d.discount < 20) return false
      if (activeDiscount === '40' && d.discount < 40) return false
      return true
    })
  }, [activeCategory, activeDiscount])

  const duplicated = useMemo(() => [...MOCK_DEALS, ...MOCK_DEALS], [])

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const scrollDuration = MOCK_DEALS.length * 5

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="r34-ticker-wrapper relative rounded-xl overflow-hidden border border-border/40 bg-gradient-to-r from-card via-card to-card"
    >
      {/* Top bar with live indicator + sound toggle + expand button */}
      <div className="flex items-center justify-between px-3 sm:px-4 pt-2.5 pb-1.5">
        <div className="flex items-center gap-3">
          <LiveIndicator count={liveCount} />
          <Badge variant="secondary" className="text-[9px] font-bold gap-1 hidden sm:inline-flex">
            <Flame className="h-2.5 w-2.5 text-orange-500" />
            Ao vivo
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {/* Sound toggle */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setIsMuted((p) => !p)}
            className="r34-sound-toggle h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isMuted ? 'muted' : 'unmuted'}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              >
                {isMuted ? (
                  <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-foreground" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Expand button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setIsExpanded((p) => !p)}
            className="r34-expand-btn h-7 px-2 rounded-lg flex items-center gap-1 text-[10px] font-medium hover:bg-muted transition-colors"
          >
            <Tag className="h-3 w-3" />
            <span className="hidden sm:inline">Ver todas as ofertas</span>
            <span className="sm:hidden">Ver mais</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
            >
              <ChevronDown className="h-3 w-3" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Ticker strip */}
      <div
        className="r34-ticker-strip relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

        <motion.div
          className="r34-ticker-track flex gap-3 px-3 sm:px-4 py-2"
          animate={
            !prefersReducedMotion && !isHovered
              ? { x: ['0%', '-50%'] }
              : { x: undefined }
          }
          transition={
            !prefersReducedMotion && !isHovered
              ? {
                  x: { duration: scrollDuration, repeat: Infinity, ease: 'linear' as const },
                }
              : {}
          }
        >
          {duplicated.map((deal, i) => (
            <DealCard key={`${deal.id}-${i}`} deal={deal} />
          ))}
        </motion.div>
      </div>

      {/* Expandable panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' as const }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 px-3 sm:px-4 pt-3 pb-3">
              {/* Filter row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                  <Filter className="h-3 w-3" />
                  Categoria:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setActiveCategory(cat)}
                      className={`r34-cat-btn h-6 px-2 rounded-md text-[10px] font-medium transition-colors ${
                        activeCategory === cat
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
                <div className="sm:ml-auto flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-medium">Desconto:</span>
                  {(['all', '20', '40'] as const).map((val) => (
                    <motion.button
                      key={val}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setActiveDiscount(val)}
                      className={`r34-disc-btn h-6 px-2 rounded-md text-[10px] font-medium transition-colors ${
                        activeDiscount === val
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {val === 'all' ? 'Todos' : `≥${val}%`}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Deals grid */}
              {filteredDeals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredDeals.map((deal, i) => (
                    <ExpandedDealCard key={deal.id} deal={deal} index={i} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">Nenhuma oferta encontrada com esses filtros.</p>
                </div>
              )}

              {/* Collapse button */}
              <div className="flex justify-center mt-3">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsExpanded(false)}
                  className="r34-collapse-btn flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded-lg hover:bg-muted"
                >
                  <ChevronUp className="h-3 w-3" />
                  Fechar painel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient accent line */}
      <div className="h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 relative overflow-hidden">
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' as const, repeatDelay: 1 }}
          >
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}
