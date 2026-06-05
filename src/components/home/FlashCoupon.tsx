'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Clock, Gift, Copy, Check, Sparkles, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'
import { toast } from 'sonner'

// --- Types ---
type CouponRarity = 'common' | 'rare' | 'epic' | 'legendary'

interface CouponDefinition {
  id: string
  code: string
  label: string
  description: string
  rarity: CouponRarity
  color: string
  bgGradient: string
  borderGradient: string
}

interface CollectedCoupon {
  couponId: string
  code: string
  collectedAt: number
  expiresAt: number
}

// --- Coupon definitions ---
const COUPON_DEFINITIONS: CouponDefinition[] = [
  {
    id: 'cp1', code: 'DESC5', label: 'R$ 5 off', description: 'Desconto de R$ 5 em compras acima de R$ 25',
    rarity: 'common', color: 'text-emerald-700 dark:text-emerald-400',
    bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40',
    borderGradient: 'from-emerald-400 to-green-500',
  },
  {
    id: 'cp2', code: 'PERC10', label: '10% off', description: '10% de desconto em qualquer compra',
    rarity: 'rare', color: 'text-sky-700 dark:text-sky-400',
    bgGradient: 'from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40',
    borderGradient: 'from-sky-400 to-blue-500',
  },
  {
    id: 'cp3', code: 'FRETE0', label: 'Frete Grátis', description: 'Frete grátis em compras acima de R$ 30',
    rarity: 'epic', color: 'text-purple-700 dark:text-purple-400',
    bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/40',
    borderGradient: 'from-purple-400 to-violet-500',
  },
  {
    id: 'cp4', code: 'COMBO2', label: 'Compre 2 Leve 3', description: 'Leve 3 produtos e pague apenas 2',
    rarity: 'epic', color: 'text-violet-700 dark:text-violet-400',
    bgGradient: 'from-violet-50 to-fuchsia-50 dark:from-violet-950/40 dark:to-fuchsia-950/40',
    borderGradient: 'from-violet-400 to-fuchsia-500',
  },
  {
    id: 'cp5', code: 'DESC10', label: 'R$ 10 off', description: 'Desconto de R$ 10 em compras acima de R$ 50',
    rarity: 'legendary', color: 'text-amber-700 dark:text-amber-400',
    bgGradient: 'from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40',
    borderGradient: 'from-amber-400 to-yellow-500',
  },
]

const RARITY_LABELS: Record<CouponRarity, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
}

const RARITY_COLORS: Record<CouponRarity, string> = {
  common: 'bg-emerald-500',
  rare: 'bg-sky-500',
  epic: 'bg-purple-500',
  legendary: 'bg-amber-500',
}

const STORAGE_KEY = 'domplace-flash-coupons'
const COUPON_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

// --- Helpers ---
function loadCollectedCoupons(): CollectedCoupon[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCollectedCoupons(coupons: CollectedCoupon[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons))
}

function getTodayStart(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// --- Skeleton ---
function FlashCouponSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-56" />
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-28 rounded-xl shrink-0" />
        ))}
      </div>
      <Skeleton className="h-3 w-full max-w-xs" />
    </div>
  )
}

// --- Main Component ---
export function FlashCoupon() {
  const [collected, setCollected] = useState<CollectedCoupon[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [flippingId, setFlippingId] = useState<string | null>(null)
  const [confettiActive, setConfettiActive] = useState(false)
  const [now, setNow] = useState(Date.now())

  // Load from localStorage
  useEffect(() => {
    setCollected(loadCollectedCoupons())
    setIsLoaded(true)
  }, [])

  // Tick every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Reset expired coupons
  useEffect(() => {
    const todayStart = getTodayStart()
    const valid = collected.filter((c) => c.expiresAt > now)
    if (valid.length !== collected.length) {
      setCollected(valid)
      saveCollectedCoupons(valid)
    }
    void todayStart // used for context
  }, [now])

  const collectedCount = useMemo(
    () => collected.filter((c) => COUPON_DEFINITIONS.some((d) => d.id === c.couponId)).length,
    [collected]
  )

  const expiryEnd = useMemo(() => {
    const todayStart = getTodayStart()
    return todayStart + COUPON_EXPIRY_MS
  }, [])

  const handleCollect = useCallback((coupon: CouponDefinition) => {
    // Check if already collected
    const already = collected.find((c) => c.couponId === coupon.id)
    if (already) {
      toast.info('Você já coletou este cupom!', { description: coupon.label })
      return
    }

    // Start flip animation
    setFlippingId(coupon.id)

    // After flip, mark as collected
    setTimeout(() => {
      const newCollected: CollectedCoupon = {
        couponId: coupon.id,
        code: coupon.code,
        collectedAt: Date.now(),
        expiresAt: getTodayStart() + COUPON_EXPIRY_MS,
      }
      const updated = [...collected, newCollected]
      setCollected(updated)
      saveCollectedCoupons(updated)
      setFlippingId(null)
      setConfettiActive(true)
      toast.success(`Cupom "${coupon.label}" coletado!`, { description: coupon.description })

      // Reset confetti after burst
      setTimeout(() => setConfettiActive(false), 1200)
    }, 600)
  }, [collected])

  const handleUseCoupon = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success('Código copiado!', { description: `Cupom "${code}" copiado para a área de transferência` })
    }).catch(() => {
      toast.success('Cupom: ' + code, { description: 'Copie manualmente o código' })
    })
  }, [])

  const handleResetDaily = useCallback(() => {
    setCollected([])
    saveCollectedCoupons([])
    toast.info('Cupons resetados', { description: 'Colecione novamente!' })
  }, [])

  if (!isLoaded) return <FlashCouponSkeleton />

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20 border border-amber-200/40 dark:border-amber-800/30 r62-card-lift">
      {/* Confetti overlay */}
      <ConfettiBurst active={confettiActive} particleCount={50} spread={250} duration={1000} />

      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
            >
              <Ticket className="h-5 w-5 text-amber-500" />
            </motion.div>
            <h3 className="font-bold text-lg r62-heading-gradient">Cupons Flash</h3>
            <Badge className="text-[10px] bg-amber-500 text-white border-0 font-bold">
              <Sparkles className="h-3 w-3 mr-0.5" />
              Diários
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[44px] min-w-[44px] h-7 text-[10px] text-muted-foreground hover:text-foreground"
            onClick={handleResetDaily}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Resetar
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">
              Progresso diário
            </span>
            <span className="text-xs font-semibold text-primary">
              {collectedCount}/{COUPON_DEFINITIONS.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${(collectedCount / COUPON_DEFINITIONS.length) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          {collectedCount === COUPON_DEFINITIONS.length && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1"
            >
              <Gift className="h-3 w-3" />
              Todos os cupons coletados! 🎉
            </motion.p>
          )}
        </div>

        {/* Countdown to expiry */}
        <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Expiram em: </span>
          <motion.span
            key={Math.floor(now / 1000)}
            className="font-mono font-semibold text-amber-600 dark:text-amber-400"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {formatCountdown(Math.max(0, expiryEnd - now))}
          </motion.span>
        </div>

        {/* Coupon cards — horizontal scrollable */}
        <div className="overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1">
          <div className="flex gap-3">
            {COUPON_DEFINITIONS.map((coupon, i) => {
              const isCollected = collected.some((c) => c.couponId === coupon.id)
              const collectedData = collected.find((c) => c.couponId === coupon.id)
              const isFlipping = flippingId === coupon.id

              return (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.06, type: 'spring' as const, stiffness: 300, damping: 25 }}
                  className="shrink-0 w-28 sm:w-32 perspective-[800px]"
                >
                  <motion.div
                    animate={isFlipping ? { rotateY: [0, 180] } : { rotateY: isCollected ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="relative w-full h-32 rounded-xl"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front face — uncollected */}
                    <div
                      className="absolute inset-0 rounded-xl p-3 flex flex-col justify-between backface-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                      }}
                    >
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${coupon.bgGradient} border-2 border-dashed border-muted-foreground/20`} />

                      {/* Rarity stripe */}
                      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${RARITY_COLORS[coupon.rarity]}`} />

                      <div className="relative z-10 flex flex-col items-center justify-between h-full">
                        {/* Rarity badge */}
                        <Badge className={`text-[8px] px-1.5 py-0 ${RARITY_COLORS[coupon.rarity]} text-white border-0 font-bold`}>
                          {RARITY_LABELS[coupon.rarity]}
                        </Badge>

                        {/* Coupon content */}
                        <div className="text-center">
                          <p className={`text-lg font-bold ${coupon.color}`}>{coupon.label}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2">{coupon.description}</p>
                        </div>

                        {/* Collect button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCollect(coupon)}
                          className="w-full min-h-[44px] py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold flex items-center justify-center gap-1"
                        >
                          {isFlipping ? (
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                            >
                              <Sparkles className="h-3 w-3" />
                            </motion.span>
                          ) : (
                            <>
                              <Gift className="h-3 w-3" />
                              Coletar
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Back face — collected */}
                    <div
                      className="absolute inset-0 rounded-xl p-3 flex flex-col justify-between"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${coupon.bgGradient} relative overflow-hidden`} />

                      {/* Shimmer border animation */}
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2"
                        animate={{
                          borderColor: [
                            'oklch(0.8 0.15 80 / 0.3)',
                            'oklch(0.8 0.15 80 / 0.7)',
                            'oklch(0.8 0.15 80 / 0.3)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      {/* Shimmer sweep */}
                      <motion.span
                        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <motion.span
                          className="absolute inset-0"
                          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          style={{
                            backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                            backgroundSize: '50% 100%',
                          }}
                        />
                      </motion.span>

                      <div className="relative z-10 flex flex-col items-center justify-between h-full">
                        {/* Checkmark */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                          className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>

                        {/* Code */}
                        <div className="text-center">
                          <p className={`text-sm font-bold font-mono ${coupon.color}`}>{coupon.code}</p>
                          <p className="text-[9px] text-muted-foreground">{coupon.label}</p>
                        </div>

                        {/* Use button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUseCoupon(coupon.code)}
                          className="w-full min-h-[44px] py-1.5 rounded-lg bg-gradient-to-r from-primary to-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Usar Cupom
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Collected strip */}
        {collectedCount > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Ticket className="h-3 w-3" />
              Cupons coletados
            </p>
            <div className="flex gap-2 flex-wrap">
              {collected.map((c) => {
                const def = COUPON_DEFINITIONS.find((d) => d.id === c.couponId)
                if (!def) return null
                const remaining = c.expiresAt - now
                return (
                  <motion.div
                    key={c.couponId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border relative overflow-hidden"
                    style={{
                      borderColor: remaining < 3600000 ? 'oklch(0.65 0.2 25 / 0.5)' : 'oklch(0.8 0.1 150 / 0.3)',
                    }}
                  >
                    {/* Shimmer for collected strip */}
                    <motion.span
                      className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                    >
                      <motion.span
                        className="absolute inset-0"
                        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        style={{
                          backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                          backgroundSize: '50% 100%',
                        }}
                      />
                    </motion.span>
                    <span className="relative z-10">{def.label}</span>
                    <span className="relative z-10 font-mono font-bold text-muted-foreground">{c.code}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleUseCoupon(c.code)}
                      className="relative z-10 ml-0.5"
                    >
                      <Copy className="h-3 w-3 text-primary" />
                    </motion.button>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
