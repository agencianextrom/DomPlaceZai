'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Sparkles, Star, Clock, Store, Tag, Gift,
  ChevronRight, Flame, Zap, Crown, ShieldAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cachedFetch } from '@/lib/api-cache'
import { toast } from 'sonner'

/* ═══════════════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════════════ */

type Rarity = 'comum' | 'raro' | 'epico' | 'lendario'

interface MysteryDeal {
  id: string
  storeName: string
  category: string
  discount: number
  rarity: Rarity
  expiresAt: string
}

const DAILY_LIMIT = 3
const STORAGE_KEY = 'domplace-mystery-box'

interface BoxState {
  openedToday: number
  date: string
  deals: Array<{ deal: MysteryDeal; openedAt: string }>
}

function getDefaultState(): BoxState {
  return { openedToday: 0, date: '', deals: [] }
}

function loadBoxState(): BoxState {
  if (typeof window === 'undefined') return getDefaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultState()
    const parsed: BoxState = JSON.parse(raw)
    const today = new Date().toISOString().split('T')[0]
    if (parsed.date !== today) {
      return getDefaultState()
    }
    return parsed
  } catch {
    return getDefaultState()
  }
}

function saveBoxState(state: BoxState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

/* ── 6 mystery deals pool ── */
const DEAL_POOL: MysteryDeal[] = [
  { id: 'd1', storeName: 'Mercado Fresco', category: 'Alimentação', discount: 10, rarity: 'comum', expiresAt: '' },
  { id: 'd2', storeName: 'Farmácia Saúde+', category: 'Saúde', discount: 15, rarity: 'comum', expiresAt: '' },
  { id: 'd3', storeName: 'Tech Store', category: 'Eletrônicos', discount: 25, rarity: 'raro', expiresAt: '' },
  { id: 'd4', storeName: 'Bella Moda', category: 'Moda', discount: 30, rarity: 'raro', expiresAt: '' },
  { id: 'd5', storeName: 'Casa & Cia', category: 'Casa & Decor', discount: 40, rarity: 'epico', expiresAt: '' },
  { id: 'd6', storeName: 'Gourmet Premium', category: 'Gourmet', discount: 50, rarity: 'lendario', expiresAt: '' },
]

/* ── Rarity config ── */
const RARITY_CONFIG: Record<Rarity, {
  label: string
  color: string
  bgGradient: string
  glowColor: string
  textColor: string
  borderColor: string
  icon: typeof Star
  sparkle: boolean
}> = {
  comum: {
    label: 'Comum',
    color: 'rgba(34, 197, 94, 1)',
    bgGradient: 'from-emerald-500 to-green-600',
    glowColor: 'rgba(34, 197, 94, 0.35)',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-400/40',
    icon: Zap,
    sparkle: false,
  },
  raro: {
    label: 'Raro',
    color: 'rgba(59, 130, 246, 1)',
    bgGradient: 'from-blue-500 to-indigo-600',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-400/40',
    icon: ShieldAlert,
    sparkle: false,
  },
  epico: {
    label: 'Épico',
    color: 'rgba(139, 92, 246, 1)',
    bgGradient: 'from-purple-500 to-violet-600',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-400/40',
    icon: Star,
    sparkle: true,
  },
  lendario: {
    label: 'Lendário',
    color: 'rgba(245, 158, 11, 1)',
    bgGradient: 'from-amber-400 to-yellow-500',
    glowColor: 'rgba(245, 158, 11, 0.40)',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-400/40',
    icon: Crown,
    sparkle: true,
  },
}

/* ── Weighted random deal selection ── */
function selectRandomDeal(): MysteryDeal {
  const rand = Math.random() * 100
  let rarity: Rarity
  if (rand < 50) rarity = 'comum'
  else if (rand < 80) rarity = 'raro'
  else if (rand < 95) rarity = 'epico'
  else rarity = 'lendario'

  const pool = DEAL_POOL.filter(d => d.rarity === rarity)
  const deal = pool[Math.floor(Math.random() * pool.length)]
  const now = Date.now()
  const expiryMs = now + (2 + Math.random() * 6) * 3600000
  return {
    ...deal,
    rarity,
    expiresAt: new Date(expiryMs).toISOString(),
  }
}

/* ═══════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ── Confetti burst on reveal ── */
function ConfettiParticles({ show, rarity }: { show: boolean; rarity: Rarity }) {
  if (!show) return null

  const config = RARITY_CONFIG[rarity]
  const colors =
    rarity === 'lendario'
      ? ['#f59e0b', '#fbbf24', '#fcd34d', '#f97316', '#ef4444', '#ffffff']
      : rarity === 'epico'
        ? ['#8b5cf6', '#a78bfa', '#c084fc', '#ec4899', '#6366f1']
        : rarity === 'raro'
          ? ['#3b82f6', '#60a5fa', '#93c5fd', '#818cf8']
          : ['#22c55e', '#4ade80', '#86efac', '#a3e635']

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {Array.from({ length: 35 }).map((_, i) => {
        const angle = (i / 35) * 360
        const dist = 60 + Math.random() * 140
        const x = Math.cos((angle * Math.PI) / 180) * dist
        const y = Math.sin((angle * Math.PI) / 180) * dist - 30
        const size = 3 + Math.random() * 8
        const dur = 0.5 + Math.random() * 0.6

        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
            animate={{ opacity: 0, x, y, scale: 0, rotate: Math.random() * 1080 }}
            transition={{ duration: dur, ease: 'easeOut' as const }}
            className="absolute rounded-sm"
            style={{
              backgroundColor: colors[i % colors.length],
              width: size,
              height: size,
              left: '50%',
              top: '50%',
            }}
          />
        )
      })}
    </div>
  )
}

/* ── Sparkle stars around Lendário reveals ── */
function SparkleStars({ show, color }: { show: boolean; color: string }) {
  if (!show) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360
        const radius = 70 + Math.random() * 40
        const x = 50 + Math.cos((angle * Math.PI) / 180) * (radius / 2.2)
        const y = 50 + Math.sin((angle * Math.PI) / 180) * (radius / 2.2)

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 0.6, 1, 0],
              scale: [0, 1.2, 0.8, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut' as const,
            }}
            className="absolute"
            style={{ left: `${x}%`, top: `${y}%`, color }}
          >
            <Star className="w-3 h-3" fill="currentColor" />
          </motion.div>
        )
      })}
    </div>
  )
}

/* ── Expiry countdown ── */
function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function calc() {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Expirado'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return (
    <span className="text-xs font-mono font-semibold text-muted-foreground tabular-nums">
      {timeLeft}
    </span>
  )
}

/* ── Shimmer overlay for box ── */
function BoxShimmer() {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
      <div
        className="r58-mystery-shimmer-sweep absolute inset-0"
      />
    </div>
  )
}

/* ── Progress indicator ── */
function ProgressIndicator({ remaining }: { remaining: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: DAILY_LIMIT }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{
            scale: i < remaining ? 1 : 0.7,
            opacity: i < remaining ? 1 : 0.3,
          }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
          className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
            i < remaining
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-400/30'
              : 'bg-muted-foreground/20'
          }`}
        />
      ))}
      <span className="text-[10px] text-muted-foreground font-medium ml-1">
        {remaining}/{DAILY_LIMIT} hoje
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════ */

const boxContainerVariants = {
  idle: { scale: 1 },
  shaking: {
    x: [-4, 4, -4, 4, -3, 3, -2, 2, 0],
    y: [-2, 2, -1, 1, 0],
    rotate: [-3, 3, -3, 3, -2, 2, -1, 1, 0],
    transition: { duration: 0.6, ease: 'easeInOut' as const },
  },
}

const lidVariants = {
  closed: {
    rotateX: 0,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
  open: {
    rotateX: -110,
    y: -8,
    transition: { type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.6 },
  },
}

const dealCardVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 18, delay: 1.0 },
  },
}

const glowPulseVariants = {
  idle: {
    boxShadow: '0 0 20px rgba(245, 158, 11, 0.15), 0 0 40px rgba(245, 158, 11, 0.05)',
  },
  active: {
    boxShadow: [
      '0 0 20px rgba(245, 158, 11, 0.2), 0 0 40px rgba(245, 158, 11, 0.08)',
      '0 0 30px rgba(245, 158, 11, 0.4), 0 0 60px rgba(245, 158, 11, 0.15)',
      '0 0 20px rgba(245, 158, 11, 0.2), 0 0 40px rgba(245, 158, 11, 0.08)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */

export function MysteryDealBox() {
  const [boxState, setBoxState] = useState<BoxState>(loadBoxState)
  const [phase, setPhase] = useState<'idle' | 'shaking' | 'opening' | 'revealed'>('idle')
  const [currentDeal, setCurrentDeal] = useState<MysteryDeal | null>(null)
  const [stores, setStores] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  const remaining = DAILY_LIMIT - boxState.openedToday
  const canOpen = remaining > 0 && phase === 'idle'

  /* ── Fetch stores data ── */
  useEffect(() => {
    let cancelled = false
    async function fetchStores() {
      try {
        const data = await cachedFetch('/api/stores?limit=6')
        if (!cancelled && data?.stores) {
          setStores(data.stores)
        }
      } catch {
        /* fallback to local data — ignore */
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchStores()
    return () => { cancelled = true }
  }, [])

  /* ── Open box handler ── */
  const handleOpen = useCallback(() => {
    if (!canOpen) return

    const deal = selectRandomDeal()

    setPhase('shaking')
    setCurrentDeal(deal)

    /* Lid opens after shaking */
    setTimeout(() => {
      setPhase('opening')
    }, 700)

    /* Deal revealed */
    setTimeout(() => {
      setPhase('revealed')

      const today = new Date().toISOString().split('T')[0]
      const newState: BoxState = {
        openedToday: boxState.openedToday + 1,
        date: today,
        deals: [...boxState.deals, { deal, openedAt: new Date().toISOString() }],
      }
      setBoxState(newState)
      saveBoxState(newState)

      const rarityLabel = RARITY_CONFIG[deal.rarity].label
      toast.success(`Desconto ${rarityLabel} revelado! 🎁`, {
        description: `${deal.discount}% de desconto em ${deal.category} na ${deal.storeName}`,
      })
    }, 1600)
  }, [canOpen, boxState])

  /* ── Dismiss / try again ── */
  const handleDismiss = useCallback(() => {
    setPhase('idle')
    setCurrentDeal(null)
  }, [])

  /* ── Update deal pool with real store names ── */
  const enrichedPool = useMemo(() => {
    if (stores.length === 0) return DEAL_POOL
    return DEAL_POOL.map((deal, i) => ({
      ...deal,
      storeName: stores[i % stores.length].name,
    }))
  }, [stores])

  const activeDeal = currentDeal
    ? { ...currentDeal, ...(stores.length > 0 ? { storeName: stores[DEAL_POOL.findIndex(d => d.id === currentDeal.id) % stores.length]?.name || currentDeal.storeName } : {}) }
    : null
  const rarityConfig = activeDeal ? RARITY_CONFIG[activeDeal.rarity] : null

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  return (
    <section className="relative" aria-label="Caixa Mistério">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 180, damping: 20 }}
        className="relative rounded-2xl overflow-hidden"
      >
        {/* Outer gradient border */}
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-amber-400 via-orange-500 to-red-500">
          {/* Animated glow ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={canOpen ? glowPulseVariants.active : glowPulseVariants.idle}
          />

          {/* Main card */}
          <div className="relative bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-950 dark:via-card dark:to-amber-950/20 rounded-2xl p-5">
            <ConfettiParticles show={phase === 'revealed'} rarity={activeDeal?.rarity || 'comum'} />
            <SparkleStars show={phase === 'revealed' && (activeDeal?.rarity === 'lendario' || activeDeal?.rarity === 'epico')} color={rarityConfig?.color || '#f59e0b'} />

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 12 }}
                  transition={{ type: 'spring' as const }}
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25"
                >
                  <Package className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    Caixa Mistério
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                    >
                      ✨
                    </motion.span>
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Abra e descubra descontos exclusivos!
                  </p>
                </div>
              </div>
              <ProgressIndicator remaining={remaining} />
            </div>

            {/* ── Box / Reveal area ── */}
            <AnimatePresence mode="wait">
              {(phase === 'idle' || phase === 'shaking' || phase === 'opening') && (
                <motion.div
                  key="box-area"
                  variants={boxContainerVariants}
                  initial="idle"
                  animate={phase === 'shaking' ? 'shaking' : 'idle'}
                  className="relative z-10"
                >
                  {/* 3D Box with perspective lid */}
                  <div className="r58-mystery-box-wrapper">
                    {/* Box body */}
                    <div className="relative r58-mystery-box-body rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 flex flex-col items-center justify-center overflow-hidden">
                      <BoxShimmer />

                      {/* Question mark */}
                      <motion.div
                        animate={phase === 'idle' ? { y: [0, -6, 0], rotate: [0, 5, -5, 0] } : {}}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
                        className="text-5xl font-black text-white/90 select-none"
                        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
                      >
                        ?
                      </motion.div>
                      <p className="text-white/70 text-xs mt-2 font-medium">
                        O que tem dentro?
                      </p>

                      {/* Lid */}
                      <motion.div
                        variants={lidVariants}
                        initial="closed"
                        animate={phase === 'opening' ? 'open' : 'closed'}
                        className="absolute top-0 left-0 right-0 h-12 rounded-t-2xl bg-gradient-to-b from-amber-400 to-orange-500 origin-top z-10"
                        style={{ transformOrigin: 'top center' }}
                      >
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-full bg-amber-300/60" />
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-1.5 rounded-full bg-amber-300/80" />
                      </motion.div>

                      {/* Floating particles around box */}
                      {(phase === 'idle' || phase === 'shaking') && (
                        <>
                          <motion.div
                            className="absolute top-2 left-3 w-2 h-2 rounded-full bg-amber-300/60"
                            animate={{ y: [0, -8, 0], opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                          />
                          <motion.div
                            className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-red-300/60"
                            animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5, ease: 'easeInOut' as const }}
                          />
                          <motion.div
                            className="absolute bottom-3 left-5 w-1 h-1 rounded-full bg-yellow-200/60"
                            animate={{ x: [0, 6, 0], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3.5, repeat: Infinity, delay: 1, ease: 'easeInOut' as const }}
                          />
                          <motion.div
                            className="absolute bottom-2 right-3 w-2 h-2 rounded-full bg-orange-300/50"
                            animate={{ y: [0, -6, 0], x: [0, 4, 0], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 2.8, repeat: Infinity, delay: 0.8, ease: 'easeInOut' as const }}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Open button */}
                  <div className="mt-4 relative z-10">
                    {remaining > 0 ? (
                      <motion.div
                        variants={glowPulseVariants}
                        animate={phase === 'idle' ? 'active' : 'idle'}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleOpen}
                          disabled={phase !== 'idle' || isLoading}
                          className={`w-full h-11 rounded-xl font-semibold text-sm relative overflow-hidden ${
                            phase === 'idle'
                              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {/* Shimmer sweep */}
                          {phase === 'idle' && (
                            <div className="r58-mystery-btn-shimmer absolute inset-0" />
                          )}
                          <span className="relative flex items-center justify-center gap-2">
                            {phase === 'shaking' ? (
                              <>
                                <motion.span
                                  animate={{ rotate: [0, 15, -15, 0] }}
                                  transition={{ duration: 0.4, repeat: Infinity }}
                                >
                                  🎁
                                </motion.span>
                                Abrindo...
                              </>
                            ) : phase === 'opening' ? (
                              <>
                                <motion.span
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                >
                                  ✨
                                </motion.span>
                                Revelando...
                              </>
                            ) : (
                              <>
                                <Gift className="h-4 w-4" />
                                Abrir Mistério
                                <ChevronRight className="h-3.5 w-3.5" />
                              </>
                            )}
                          </span>
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="w-full h-11 rounded-xl bg-muted text-muted-foreground font-semibold text-sm flex items-center justify-center gap-2">
                        <Flame className="h-4 w-4" />
                        Limite diario atingido! Volte amanhã
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Revealed Deal ── */}
              {phase === 'revealed' && activeDeal && rarityConfig && (
                <motion.div
                  key="deal-card"
                  variants={dealCardVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative z-10"
                >
                  {/* Deal card */}
                  <motion.div
                    className={`rounded-2xl border-2 p-5 relative overflow-hidden ${rarityConfig.borderColor}`}
                    style={{ boxShadow: `0 0 30px ${rarityConfig.glowColor}, 0 8px 24px rgba(0,0,0,0.08)` }}
                    animate={{
                      boxShadow: [
                        `0 0 30px ${rarityConfig.glowColor}, 0 8px 24px rgba(0,0,0,0.08)`,
                        `0 0 50px ${rarityConfig.glowColor}, 0 8px 24px rgba(0,0,0,0.12)`,
                        `0 0 30px ${rarityConfig.glowColor}, 0 8px 24px rgba(0,0,0,0.08)`,
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
                  >
                    {/* Rarity badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${rarityConfig.bgGradient} text-white text-[10px] font-bold uppercase tracking-wider shadow-md`}>
                        <rarityConfig.icon className="w-3 h-3" />
                        {rarityConfig.label}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <CountdownTimer expiresAt={activeDeal.expiresAt} />
                      </div>
                    </div>

                    {/* Discount display */}
                    <div className="text-center mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 400, damping: 12, delay: 0.2 }}
                        className="inline-flex items-center justify-center"
                      >
                        <span className={`text-5xl font-black ${rarityConfig.textColor}`} style={{ textShadow: `0 2px 12px ${rarityConfig.glowColor}` }}>
                          {activeDeal.discount}%
                        </span>
                        <span className="text-lg font-bold text-muted-foreground ml-1">OFF</span>
                      </motion.div>
                    </div>

                    {/* Deal details */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-sm">
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{activeDeal.storeName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{activeDeal.category}</span>
                      </div>
                    </div>

                    {/* Shimmer overlay */}
                    <div className="r58-mystery-deal-shimmer absolute inset-0 rounded-2xl pointer-events-none" />
                  </motion.div>

                  {/* Dismiss button */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="mt-3"
                  >
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                      className="w-full h-10 rounded-xl text-sm font-medium"
                    >
                      {remaining > 1 ? (
                        <>
                          <Sparkles className="h-3.5 w-3.5 mr-2" />
                          Abrir outra caixa ({remaining - 1} restante{remaining - 1 > 1 ? 's' : ''})
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-3.5 w-3.5 mr-2 rotate-180" />
                          Fechar
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Previously opened deals list ── */}
            {boxState.deals.length > 0 && phase === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 relative z-10"
              >
                <p className="text-[10px] text-muted-foreground font-medium mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Descontos revelados hoje
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                  {boxState.deals.map((item, idx) => {
                    const rc = RARITY_CONFIG[item.deal.rarity]
                    return (
                      <motion.div
                        key={item.openedAt}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r ${rc.bgGradient.replace('from-', 'from-').replace('to-', 'to-')}/5 border ${rc.borderColor} text-xs`}
                      >
                        <div className="flex items-center gap-2">
                          <rc.icon className="w-3 h-3" style={{ color: rc.color }} />
                          <span className="font-medium">{item.deal.storeName}</span>
                          <span className="text-muted-foreground">· {item.deal.category}</span>
                        </div>
                        <span className="font-bold" style={{ color: rc.color }}>
                          -{item.deal.discount}%
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
