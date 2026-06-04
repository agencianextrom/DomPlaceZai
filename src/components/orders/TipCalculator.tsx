'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Star, Coins, Truck, Clock, ChevronUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatBRL } from '@/lib/format'

/* ────────────────────────── Types ────────────────────────── */

interface TipCalculatorProps {
  driverName: string
  driverRating: number
  driverVehicle: string
  orderTotal: number
}

interface TipHistoryEntry {
  amount: number
  timestamp: number
}

/* ────────────────────────── Preset amounts ────────────────────────── */

const PRESET_TIPS = [2, 5, 10]

/* ────────────────────────── Animation variants ────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 340,
      damping: 22,
    },
  },
}

const coinFloatVariants = {
  hidden: { opacity: 0, y: 0, scale: 0 },
  float: (i: number) => ({
    opacity: [0, 1, 1, 0] as number[],
    y: [40, -60, -80, -120] as number[],
    scale: [0, 1, 0.8, 0] as number[],
    rotate: [0, 180 * (i % 2 === 0 ? 1 : -1), 360 * (i % 2 === 0 ? 1 : -1)] as number[],
    transition: {
      delay: i * 0.15,
      duration: 1.8,
      repeat: Infinity,
      repeatDelay: 4 + i * 0.7,
      ease: 'easeOut' as const,
    },
  }),
}

const totalBounceVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 16,
    },
  },
}

const sliderGlowVariants = {
  inactive: { boxShadow: '0 0 0px rgba(34,197,94,0)' },
  active: { boxShadow: '0 0 12px rgba(34,197,94,0.4)' },
}

/* ────────────────────────── Coin Particle ────────────────────────── */

function CoinParticle({ index }: { index: number }) {
  return (
    <motion.div
      custom={index}
      variants={coinFloatVariants}
      initial="hidden"
      animate="float"
      className="absolute pointer-events-none"
      style={{
        left: `${15 + index * 18}%`,
        bottom: '10%',
      }}
    >
      <Coins className="h-4 w-4 text-amber-400" />
    </motion.div>
  )
}

/* ────────────────────────── Animated Star SVG ────────────────────────── */

function DriverStarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating)
        return (
          <motion.svg
            key={star}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring' as const,
              stiffness: 500,
              damping: 18,
              delay: 0.2 + star * 0.06,
            }}
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={filled ? '#f59e0b' : 'none'}
              stroke={filled ? '#f59e0b' : '#a1a1aa'}
              strokeWidth="1.5"
            />
          </motion.svg>
        )
      })}
    </div>
  )
}

/* ────────────────────────── Animated Counter ────────────────────────── */

function useAnimatedCounter(target: number, duration = 800): number {
  const [count, setCount] = useState(target)
  useEffect(() => {
    let start = target
    const diff = target - start
    if (Math.abs(diff) < 0.01) return
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round((start + diff * eased) * 100) / 100)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return count
}

/* ────────────────────────── localStorage helpers ────────────────────────── */

function loadTipHistory(): TipHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('domplace-tip-history')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveTipHistory(history: TipHistoryEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('domplace-tip-history', JSON.stringify(history))
  } catch {
    // ignore write errors
  }
}

/* ────────────────────────── Main Component ────────────────────────── */

export function TipCalculator({ driverName, driverRating, driverVehicle, orderTotal }: TipCalculatorProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState(0)
  const [isCustom, setIsCustom] = useState(false)
  const [tipSent, setTipSent] = useState(false)
  const [showCoinAnimation, setShowCoinAnimation] = useState(false)
  const [tipHistory, setTipHistory] = useState<TipHistoryEntry[]>([])

  // Load tip history on mount
  useEffect(() => {
    setTipHistory(loadTipHistory())
  }, [])

  const currentTip = useMemo(() => {
    if (isCustom) return customAmount
    return selectedPreset || 0
  }, [isCustom, customAmount, selectedPreset])

  const totalWithTip = useMemo(() => orderTotal + currentTip, [orderTotal, currentTip])
  const animatedTotal = useAnimatedCounter(totalWithTip, 600)

  // Total tip count across history
  const totalTipsReceived = useMemo(() => tipHistory.length, [tipHistory])

  // Handle preset selection
  const handlePresetSelect = useCallback((amount: number) => {
    setSelectedPreset(amount)
    setIsCustom(false)
    setCustomAmount(0)
    setTipSent(false)
  }, [])

  // Handle custom toggle
  const handleCustomToggle = useCallback(() => {
    setIsCustom(true)
    setSelectedPreset(null)
    setTipSent(false)
  }, [])

  // Handle slider change
  const handleSliderChange = useCallback((value: number) => {
    setCustomAmount(value)
  }, [])

  // Send tip
  const handleSendTip = useCallback(() => {
    if (currentTip <= 0) return
    setShowCoinAnimation(true)
    setTipSent(true)

    // Save to history
    const newEntry: TipHistoryEntry = { amount: currentTip, timestamp: Date.now() }
    const updatedHistory = [newEntry, ...tipHistory].slice(0, 10)
    saveTipHistory(updatedHistory)
    setTipHistory(updatedHistory)

    setTimeout(() => setShowCoinAnimation(false), 2000)
  }, [currentTip, tipHistory])

  return (
    <section className="w-full relative">
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
@keyframes slider-thumb-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(34,197,94,0.3); }
  50% { box-shadow: 0 0 16px rgba(34,197,94,0.6); }
}
.tip-slider-thumb {
  animation: slider-thumb-glow 2s ease-in-out infinite;
}
@keyframes glass-border-shimmer {
  0% { border-color: rgba(255,255,255,0.1); }
  50% { border-color: rgba(255,255,255,0.2); }
  100% { border-color: rgba(255,255,255,0.1); }
}
.glass-card-border {
  animation: glass-border-shimmer 4s ease-in-out infinite;
}`,
      }} />

      {/* Glassmorphism card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative rounded-2xl overflow-hidden glass-card-border"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}
      >
        {/* 5 floating coin particles */}
        {Array.from({ length: 5 }).map((_, i) => (
          <CoinParticle key={`coin-${i}`} index={i} />
        ))}

        {/* Coin float animation overlay */}
        <AnimatePresence>
          {showCoinAnimation && (
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`float-coin-${i}`}
                  initial={{ opacity: 0, y: 40, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [40, -120 - Math.random() * 60],
                    x: (Math.random() - 0.5) * 100,
                    scale: [0, 1.2, 0.8, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    delay: i * 0.1,
                    duration: 1.5,
                    ease: 'easeOut' as const,
                  }}
                  className="absolute"
                >
                  <Coins className="h-5 w-5 text-amber-400" />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Header: Driver info */}
        <motion.div variants={itemVariants} className="relative z-10 p-5 pb-4">
          <div className="flex items-center gap-4">
            {/* Driver avatar with gradient ring */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-[2.5px]"
              >
                <div className="h-full w-full rounded-full bg-card flex items-center justify-center text-primary font-bold text-lg">
                  {driverName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
              </motion.div>
              {/* Rating badge */}
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md" style={{ boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}>
                <Star className="h-3 w-3 text-white fill-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{driverName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <DriverStarRating rating={driverRating} />
                <span className="text-[10px] text-muted-foreground font-medium">
                  {driverRating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Truck className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{driverVehicle}</span>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/15"
          >
            <Heart className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              O motorista já recebeu {totalTipsReceived + (tipSent ? 1 : 0)} gorjetas
            </span>
          </motion.div>
        </motion.div>

        {/* Tip amount selection */}
        <motion.div variants={itemVariants} className="relative z-10 px-5 pb-3">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Escolha o valor da gorjeta
          </p>

          {/* Preset buttons */}
          <div className="flex items-center gap-2 mb-3">
            {PRESET_TIPS.map((amount) => (
              <motion.button
                key={`preset-${amount}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePresetSelect(amount)}
                className={`flex-1 h-11 rounded-xl text-sm font-bold transition-all border ${
                  selectedPreset === amount && !isCustom
                    ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white border-emerald-500 shadow-md'
                    : 'bg-card border-border/50 text-foreground hover:border-primary/30'
                }`}
                style={selectedPreset === amount && !isCustom ? { boxShadow: '0 4px 16px rgba(34,197,94,0.3)' } : {}}
              >
                {formatBRL(amount)}
              </motion.button>
            ))}

            {/* Custom button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCustomToggle}
              className={`flex-1 h-11 rounded-xl text-sm font-bold transition-all border ${
                isCustom
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-amber-500 shadow-md'
                  : 'bg-card border-border/50 text-foreground hover:border-primary/30'
              }`}
              style={isCustom ? { boxShadow: '0 4px 16px rgba(245,158,11,0.3)' } : {}}
            >
              Personalizar
            </motion.button>
          </div>

          {/* Custom slider */}
          <AnimatePresence>
            {isCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-card/50 border border-border/30 space-y-3">
                  {/* Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={1}
                      value={customAmount}
                      onChange={(e) => handleSliderChange(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-emerald-500"
                    />
                    {/* Value indicators */}
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-muted-foreground">R$ 0</span>
                      <span className="text-[9px] text-muted-foreground">R$ 25</span>
                      <span className="text-[9px] text-muted-foreground">R$ 50</span>
                    </div>
                  </div>

                  {/* Current custom value */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Valor personalizado:</span>
                    <motion.span
                      key={customAmount}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                      className="text-lg font-extrabold text-amber-500"
                    >
                      {formatBRL(customAmount)}
                    </motion.span>
                  </div>

                  {/* Quick select under slider */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[3, 7, 15, 20, 25, 30].map((val) => (
                      <button
                        key={`quick-${val}`}
                        onClick={() => setCustomAmount(val)}
                        className={`h-7 px-2.5 rounded-lg text-[10px] font-semibold transition-all border ${
                          customAmount === val
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-muted/50 border-border/30 hover:border-amber-300'
                        }`}
                      >
                        R$ {val}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Total display */}
        <motion.div variants={itemVariants} className="relative z-10 px-5 pb-3">
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-green-500/5 border border-emerald-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                  Total do pedido
                </p>
                <p className="text-sm font-semibold line-through text-muted-foreground mt-0.5">
                  {formatBRL(orderTotal)}
                </p>
              </div>
              <ChevronUp className="h-3 w-3 text-emerald-500 mx-1" />
              <div className="text-right">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wide font-medium">
                  {currentTip > 0 ? `Com gorjeta (${formatBRL(currentTip)})` : 'Sem gorjeta'}
                </p>
                <motion.p
                  key={animatedTotal}
                  variants={totalBounceVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400"
                >
                  {formatBRL(animatedTotal)}
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Send tip button */}
        <motion.div variants={itemVariants} className="relative z-10 px-5 pb-4">
          <AnimatePresence mode="wait">
            {tipSent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center gap-2 font-bold text-sm"
                style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 12 }}
                >
                  <Check className="h-4 w-4" strokeWidth={3} />
                </motion.div>
                Gorjeta enviada! Obrigado 🎉
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <motion.div
                  whileHover={currentTip > 0 ? { scale: 1.01 } : {}}
                  whileTap={currentTip > 0 ? { scale: 0.98 } : {}}
                >
                  <Button
                    onClick={handleSendTip}
                    disabled={currentTip <= 0}
                    className={`w-full h-11 rounded-xl font-bold text-sm gap-2 transition-all ${
                      currentTip > 0
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    style={currentTip > 0 ? { boxShadow: '0 4px 16px rgba(34,197,94,0.25)' } : {}}
                  >
                  <Coins className="h-4 w-4" />
                  {currentTip > 0
                    ? `Enviar gorjeta de ${formatBRL(currentTip)}`
                    : 'Selecione um valor'}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Recent tip history */}
        {tipHistory.length > 0 && (
          <motion.div variants={itemVariants} className="relative z-10 px-5 pb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                Histórico de gorjetas
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {tipHistory.slice(0, 5).map((entry, i) => (
                <motion.div
                  key={`history-${entry.timestamp}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 gap-1"
                  >
                    <Coins className="h-2.5 w-2.5 text-amber-400" />
                    {formatBRL(entry.amount)}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
