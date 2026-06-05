'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCw, Gift, X, PartyPopper, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Prize {
  label: string
  color: string
  textColor: string
}

const prizes: Prize[] = [
  { label: '10% desconto', color: '#10b981', textColor: '#fff' },
  { label: 'Frete gratis', color: '#f59e0b', textColor: '#fff' },
  { label: 'R$5 off', color: '#ef4444', textColor: '#fff' },
  { label: 'Tente novamente', color: '#6b7280', textColor: '#fff' },
  { label: '15% desconto', color: '#8b5cf6', textColor: '#fff' },
  { label: 'Cupom especial', color: '#ec4899', textColor: '#fff' },
  { label: 'R$10 off', color: '#06b6d4', textColor: '#fff' },
  { label: 'Tente novamente', color: '#78716c', textColor: '#fff' },
]

const SEGMENT_ANGLE = 360 / prizes.length

function getDailySpinKey(): string {
  const today = new Date()
  return `domplace-spin-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
}

function canSpinToday(): boolean {
  if (typeof window === 'undefined') return true
  return !localStorage.getItem(getDailySpinKey())
}

function markSpunToday(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getDailySpinKey(), 'true')
}

function getSpinsRemaining(): { remaining: number; nextSpinIn: string } {
  if (typeof window === 'undefined') return { remaining: 1, nextSpinIn: '' }
  if (!localStorage.getItem(getDailySpinKey())) return { remaining: 1, nextSpinIn: '' }
  // Calculate time until midnight
  const now = new Date()
  const midnight = new Date(now)
  midnight.setDate(midnight.getDate() + 1)
  midnight.setHours(0, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return {
    remaining: 0,
    nextSpinIn: `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`,
  }
}

// Enhanced burst particle with glow trail
function BurstParticle({ index, total }: { index: number; total: number }) {
  const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#fbbf24', '#fff']
  const color = colors[index % colors.length]
  const angle = (index / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
  const velocity = 120 + Math.random() * 250
  const dx = Math.cos(angle) * velocity
  const dy = Math.sin(angle) * velocity - 80
  const rotation = Math.random() * 720 - 360
  const size = 4 + Math.random() * 10
  const shape = Math.random() > 0.4 ? 'circle' : 'rect'

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 pointer-events-none r43-burst-particle"
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0 }}
      animate={{
        x: dx, y: dy, rotate: rotation,
        opacity: [0, 1, 1, 0],
        scale: [0, 1.4, 1, 0.2],
      }}
      transition={{ duration: 1.2 + Math.random() * 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        width: shape === 'circle' ? size : size * 0.4,
        height: shape === 'circle' ? size : size,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : '2px',
        boxShadow: `0 0 ${size * 2}px ${color}50, 0 0 ${size}px ${color}30`,
      }}
    />
  )
}

// Enhanced confetti particle with larger glow and varied shapes
function ConfettiParticle({ index, total }: { index: number; total: number }) {
  const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#fff']
  const color = colors[index % colors.length]
  const angle = (index / total) * Math.PI * 2
  const velocity = 150 + Math.random() * 200
  const dx = Math.cos(angle) * velocity
  const dy = Math.sin(angle) * velocity - 100
  const rotation = Math.random() * 720 - 360
  const size = 6 + Math.random() * 8

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 pointer-events-none r43-confetti-particle"
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
      animate={{
        x: dx,
        y: dy,
        rotate: rotation,
        opacity: [1, 1, 0],
        scale: [1, 1.3, 0.4],
      }}
      transition={{ duration: 1.5 + Math.random() * 0.5, ease: 'easeOut' as const }}
      style={{
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        boxShadow: `0 0 ${size}px ${color}40`,
      }}
    />
  )
}

export function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [wonPrize, setWonPrize] = useState<Prize | null>(null)
  const [canSpin, setCanSpin] = useState(() => canSpinToday())
  const [nextSpinInfo, setNextSpinInfo] = useState(() => getSpinsRemaining())
  const wheelRef = useRef<HTMLDivElement>(null)

  // Refresh timer every minute
  useEffect(() => {
    if (!canSpin) {
      const interval = setInterval(() => {
        const info = getSpinsRemaining()
        setNextSpinInfo(info)
        if (info.remaining > 0) {
          setCanSpin(true)
          clearInterval(interval)
        }
      }, 60000)
      return () => clearInterval(interval)
    }
  }, [canSpin])

  const spin = useCallback(() => {
    if (isSpinning || !canSpin) return

    setIsSpinning(true)
    setShowResult(false)
    setWonPrize(null)

    // Pick a random prize
    const prizeIndex = Math.floor(Math.random() * prizes.length)

    // Calculate the rotation needed
    // The wheel rotates clockwise, so we need to align the segment
    // Segment center angle from the top (0 degrees)
    const segmentCenter = prizeIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
    // We want this segment at the top (0 degrees)
    // The wheel rotates clockwise, so we need to go to (360 - segmentCenter)
    const targetAngle = 360 - segmentCenter
    // Add multiple full rotations for dramatic effect
    const fullRotations = 5 + Math.floor(Math.random() * 3)
    const totalRotation = rotation + fullRotations * 360 + targetAngle - (rotation % 360)

    setRotation(totalRotation)

    // Reveal after spin completes
    setTimeout(() => {
      setIsSpinning(false)
      setWonPrize(prizes[prizeIndex])
      setShowResult(true)
      markSpunToday()
      setCanSpin(false)
      setNextSpinInfo(getSpinsRemaining())

      if (prizes[prizeIndex].label !== 'Tente novamente') {
        toast.success(`Parabens! Voce ganhou: ${prizes[prizeIndex].label}`)
      } else {
        toast('Tente novamente amanha!', { icon: '🎯' })
      }
    }, 4500)
  }, [isSpinning, canSpin, rotation])

  // Generate gradient pairs for enhanced wheel segments
  function getSegmentGradient(baseColor: string, index: number): string {
    // Create a slightly lighter/darker variant for gradient effect
    const lighten = (hex: string, amt: number) => {
      const num = parseInt(hex.replace('#', ''), 16)
      const r = Math.min(255, (num >> 16) + amt)
      const g = Math.min(255, ((num >> 8) & 0x00ff) + amt)
      const b = Math.min(255, (num & 0x0000ff) + amt)
      return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
    }
    return `${baseColor}-${lighten(baseColor, 40)}`
  }

  return (
    <div className="w-full max-w-sm mx-auto r43-wheel-container" style={{ filter: 'drop-shadow(0 0 24px rgba(251,191,36,0.25))' }}>
      {/* Wheel container */}
      <div className="relative">
        {/* Pointer/arrow at top - enhanced with shadow and glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
          <motion.div
            animate={isSpinning ? { y: [0, 4, 0] } : { scale: [1, 1.12, 1], y: [0, 2, 0] }}
            transition={{ duration: isSpinning ? 0.3 : 2, repeat: Infinity, ease: 'easeInOut' as const }}
            className="r43-wheel-pointer"
            style={{
              width: 0,
              height: 0,
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '24px solid #ef4444',
              filter: 'drop-shadow(0 2px 8px rgba(239,68,68,0.5)) drop-shadow(0 0 16px rgba(239,68,68,0.3))',
            }}
          />
        </div>

        {/* Outer glow ring - enhanced with pulse */}
        <motion.div
          className="absolute inset-[-6px] rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 blur-sm r43-wheel-glow-inner"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.02, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
        />
        <motion.div
          className="absolute inset-[-12px] rounded-full bg-gradient-to-r from-amber-300/30 via-orange-400/20 to-red-400/30 blur-md r43-wheel-glow-outer"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.03, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.5 }}
        />

        {/* Wheel */}
        <div className="relative rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl r43-wheel-border">
          <motion.div
            ref={wheelRef}
            className="w-full aspect-square relative"
            animate={{ rotate: rotation }}
            transition={{
              duration: 4.5,
              ease: [0.1, 0.5, 0.1, 1], // Enhanced deceleration: fast start, very slow end
            }}
            style={{
              transformOrigin: 'center center',
            }}
          >
            {/* Enhanced segments with gradient fills and glow dividers */}
            {prizes.map((prize, idx) => {
              const startAngle = idx * SEGMENT_ANGLE
              const endAngle = (idx + 1) * SEGMENT_ANGLE
              const startRad = (startAngle - 90) * (Math.PI / 180)
              const endRad = (endAngle - 90) * (Math.PI / 180)
              const radius = 50
              const x1 = 50 + radius * Math.cos(startRad)
              const y1 = 50 + radius * Math.sin(startRad)
              const x2 = 50 + radius * Math.cos(endRad)
              const y2 = 50 + radius * Math.sin(endRad)
              const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0
              const midRad = ((startAngle + SEGMENT_ANGLE / 2) - 90) * (Math.PI / 180)
              const textX = 50 + 28 * Math.cos(midRad)
              const textY = 50 + 28 * Math.sin(midRad)

              // Gradient definition IDs
              const gradId = `r43-seg-grad-${idx}`
              const lighterColor = getSegmentGradient(prize.color, idx)

              return (
                <svg
                  key={idx}
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={prize.color} />
                      <stop offset="100%" stopColor={lighterColor.split('-')[1] || prize.color} />
                    </linearGradient>
                  </defs>
                  {/* Enhanced segment path with gradient */}
                  <path
                    d={`M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={`url(#${gradId})`}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="0.35"
                    className="r43-wheel-segment"
                  />
                  {/* Segment divider line with glow */}
                  <line
                    x1="50"
                    y1="50"
                    x2={x1}
                    y2={y1}
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.5"
                    className="r43-segment-divider"
                    style={{ filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.4))' }}
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={prize.textColor}
                    fontSize="4.2"
                    fontWeight="bold"
                    transform={`rotate(${startAngle + SEGMENT_ANGLE / 2}, ${textX}, ${textY})`}
                    style={{ fontFamily: 'system-ui, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                    className="r43-segment-text"
                  >
                    {prize.label}
                  </text>
                </svg>
              )
            })}

            {/* Center circle - enhanced */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-[18%] w-[18%] rounded-full bg-gradient-to-br from-amber-300 to-orange-500 border-2 border-white shadow-xl flex items-center justify-center r43-wheel-center">
                <Gift className="h-6 w-6 text-white drop-shadow-sm" style={{ height: '28%', width: '28%' }} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sparkle particles around wheel when idle (outside rotation) */}
        <AnimatePresence>
          {!isSpinning && canSpin && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 8 }).map((_, idx) => {
                const angle = (idx / 8) * Math.PI * 2
                const r = 44
                return (
                  <motion.div
                    key={`sparkle-${idx}`}
                    className="absolute pointer-events-none r43-wheel-sparkle"
                    style={{ left: '50%', top: '50%' }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{
                      x: Math.cos(angle) * r,
                      y: Math.sin(angle) * r,
                      opacity: [0, 1, 0.5, 0],
                      scale: [0, 1.2, 0.6, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      repeat: Infinity,
                      delay: idx * 0.25,
                      ease: 'easeInOut' as const,
                    }}
                  >
                    <Sparkles className="h-3 w-3 text-amber-400" style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.6))' }} />
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Outer decorative dots */}
        <div className="absolute inset-[-2px] rounded-full pointer-events-none">
          {Array.from({ length: 24 }).map((_, idx) => {
            const angle = (idx * 15) * (Math.PI / 180)
            const r = 50.5
            const cx = 50 + r * Math.cos(angle)
            const cy = 50 + r * Math.sin(angle)
            return (
              <div
                key={idx}
                className={`absolute w-1.5 h-1.5 rounded-full shadow-sm r43-outer-dot ${idx % 2 === 0 ? 'r43-outer-dot-alt' : ''}`}
                style={{
                  left: `${cx}%`,
                  top: `${cy}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: idx % 2 === 0 ? '#fbbf24' : '#f59e0b',
                  boxShadow: idx % 2 === 0 ? '0 0 4px rgba(251,191,36,0.5)' : '0 0 3px rgba(245,158,11,0.3)',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Spin button — enhanced with glow pulse and shimmer overlay */}
      <div className="mt-6 text-center">
        <motion.div whileTap={{ scale: 0.95 }}>
          <div className="r43-spin-btn-wrapper">
            <Button
              onClick={spin}
              disabled={isSpinning || !canSpin}
              className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-full gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden shadow-lg shadow-amber-500/25 r43-spin-button"
            >
              {/* Shimmer overlay - always visible when ready */}
              {canSpin && !isSpinning && (
                <motion.span
                  className="absolute inset-0 r43-spin-shimmer"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 0.5 }}
                />
              )}
              {/* Glow pulse ring */}
              {canSpin && !isSpinning && (
                <span className="r43-spin-glow-pulse" />
              )}
              <span className="relative z-10">
              {isSpinning ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                  >
                    <RotateCw className="h-4 w-4" />
                  </motion.div>
                  Girando...
                </>
              ) : !canSpin ? (
                <>
                  <PartyPopper className="h-4 w-4" />
                  Ja girou hoje
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4" />
                  Gire e Ganhe
                </>
              )}
              </span>
            </Button>
          </div>
        </motion.div>

        {/* Spin info */}
        {!canSpin && nextSpinInfo.nextSpinIn && (
          <p className="text-xs text-muted-foreground mt-2">
            Proxima girada em {nextSpinInfo.nextSpinIn}
          </p>
        )}
        {canSpin && (
          <p className="text-xs text-muted-foreground mt-2">
            1 girada gratis por dia
          </p>
        )}
      </div>

      {/* Prize result modal - enhanced with spring entrance and glassmorphism */}
      <AnimatePresence>
        {showResult && wonPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 20 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="rounded-2xl p-6 max-w-xs w-full text-center relative overflow-hidden border border-border/50 shadow-2xl r43-result-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Confetti + burst particles */}
              {wonPrize.label !== 'Tente novamente' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 36 }).map((_, idx) => (
                    <ConfettiParticle key={`confetti-${idx}`} index={idx} total={36} />
                  ))}
                  {Array.from({ length: 24 }).map((_, idx) => (
                    <BurstParticle key={`burst-${idx}`} index={idx} total={24} />
                  ))}
                </div>
              )}

              {/* Close button */}
              <button
                onClick={() => setShowResult(false)}
                className="absolute top-3 right-3 h-8 w-8 min-h-[44px] min-w-[44px] rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors z-10 r43-modal-close-btn"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Prize content - glassmorphism card */}
              <div className="relative z-10 pt-4 r62-card-lift">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, type: 'spring' as const, stiffness: 400, damping: 12 }}
                  className={`h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl r43-prize-icon ${
                    wonPrize.label !== 'Tente novamente'
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}
                  style={{
                    boxShadow: wonPrize.label !== 'Tente novamente'
                      ? '0 0 24px rgba(251,191,36,0.4), 0 0 48px rgba(251,191,36,0.15), 0 4px 16px rgba(0,0,0,0.2)'
                      : '0 0 16px rgba(107,114,128,0.3), 0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {wonPrize.label !== 'Tente novamente' ? (
                    <Gift className="h-10 w-10 text-white" />
                  ) : (
                    <RotateCw className="h-10 w-10 text-white" />
                  )}
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-bold mb-2 r43-prize-title r62-heading-gradient"
                >
                  {wonPrize.label !== 'Tente novamente' ? 'Parabens!' : 'Quase lá!'}
                </motion.h3>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Badge
                    className="text-base px-4 py-1.5 mb-3 border-0 font-bold shadow-sm r43-prize-badge"
                    style={{
                      backgroundColor: wonPrize.color,
                      color: wonPrize.textColor,
                      boxShadow: `0 0 12px ${wonPrize.color}50, 0 2px 8px ${wonPrize.color}25`,
                    }}
                  >
                    {wonPrize.label}
                  </Badge>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-muted-foreground mb-4"
                >
                  {wonPrize.label !== 'Tente novamente'
                    ? 'Seu premio foi adicionado a sua conta. Use no proximo pedido!'
                    : 'Nao desanime! Volte amanha para uma nova chance de ganhar.'}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    className="w-full h-10 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl r43-modal-action-btn"
                    onClick={() => setShowResult(false)}
                  >
                    {wonPrize.label !== 'Tente novamente' ? 'Resgatar Premio' : 'Entendi'}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
