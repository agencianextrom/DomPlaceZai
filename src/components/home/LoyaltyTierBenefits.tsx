'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
  Shield,
  Award,
  Gem,
  Truck,
  Percent,
  Gift,
  Sparkles,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Zap,
  HeadphonesIcon,
  Ticket,
  Package,
  Heart,
  Trophy,
  RotateCcw,
  Calendar,
  Lock,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface TierData {
  id: string
  name: string
  minPoints: number
  maxPoints: number
  emoji: string
  icon: typeof Shield
  color: string
  gradientFrom: string
  gradientTo: string
  textColor: string
  bgLight: string
  bgDark: string
  borderLight: string
  borderDark: string
  multiplier: string
  multiplierValue: number
}

interface Benefit {
  id: string
  icon: typeof Truck
  label: string
  description: string
  availableFromTier: number
}

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  emoji: string
  availableFromTier: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const TIERS: TierData[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    emoji: '🥉',
    icon: Shield,
    color: '#b45309',
    gradientFrom: '#d97706',
    gradientTo: '#b45309',
    textColor: 'text-amber-700 dark:text-amber-400',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/20',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-800/30',
    multiplier: '1x',
    multiplierValue: 1,
  },
  {
    id: 'prata',
    name: 'Prata',
    minPoints: 500,
    maxPoints: 1499,
    emoji: '🥈',
    icon: Award,
    color: '#6b7280',
    gradientFrom: '#9ca3af',
    gradientTo: '#6b7280',
    textColor: 'text-gray-600 dark:text-gray-300',
    bgLight: 'bg-gray-50',
    bgDark: 'dark:bg-gray-900/20',
    borderLight: 'border-gray-200',
    borderDark: 'dark:border-gray-700/30',
    multiplier: '1.5x',
    multiplierValue: 1.5,
  },
  {
    id: 'ouro',
    name: 'Ouro',
    minPoints: 1500,
    maxPoints: 4999,
    emoji: '🥇',
    icon: Crown,
    color: '#ca8a04',
    gradientFrom: '#eab308',
    gradientTo: '#ca8a04',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    bgLight: 'bg-yellow-50',
    bgDark: 'dark:bg-yellow-950/20',
    borderLight: 'border-yellow-200',
    borderDark: 'dark:border-yellow-800/30',
    multiplier: '2x',
    multiplierValue: 2,
  },
  {
    id: 'diamante',
    name: 'Diamante',
    minPoints: 5000,
    maxPoints: 999999,
    emoji: '💎',
    icon: Gem,
    color: '#0891b2',
    gradientFrom: '#22d3ee',
    gradientTo: '#0891b2',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/20',
    borderLight: 'border-cyan-200',
    borderDark: 'dark:border-cyan-800/30',
    multiplier: '3x',
    multiplierValue: 3,
  },
]

const BENEFITS: Benefit[] = [
  {
    id: 'free-shipping',
    icon: Truck,
    label: 'Frete grátis',
    description: 'Em pedidos acima de R$50',
    availableFromTier: 0,
  },
  {
    id: 'exclusive-discount',
    icon: Percent,
    label: 'Desconto exclusivo',
    description: 'Até 10% em lojas parceiras',
    availableFromTier: 0,
  },
  {
    id: 'early-access',
    icon: Clock,
    label: 'Acesso antecipado',
    description: 'Compre antes de todos nas promoções',
    availableFromTier: 1,
  },
  {
    id: 'cashback',
    icon: RotateCcw,
    label: 'Cashback',
    description: 'Receba de volta parte do valor gasto',
    availableFromTier: 1,
  },
  {
    id: 'vip-assistant',
    icon: HeadphonesIcon,
    label: 'Assistente VIP',
    description: 'Suporte prioritário 24 horas',
    availableFromTier: 2,
  },
  {
    id: 'birthday-gift',
    icon: Gift,
    label: 'Presente de aniversário',
    description: 'Surpresa especial no seu dia',
    availableFromTier: 2,
  },
  {
    id: 'exclusive-events',
    icon: Ticket,
    label: 'Eventos exclusivos',
    description: 'Convites para lançamentos e eventos',
    availableFromTier: 2,
  },
  {
    id: 'guaranteed-delivery',
    icon: Package,
    label: 'Entrega garantida',
    description: 'Reembolso automático em caso de atraso',
    availableFromTier: 3,
  },
]

const REWARDS: Reward[] = [
  { id: 'cupom5', name: 'Cupom R$5 OFF', description: 'Desconto de R$5 em qualquer compra', pointsCost: 200, emoji: '🏷️', availableFromTier: 0 },
  { id: 'frete-gratis', name: 'Frete Grátis Premium', description: 'Entrega grátis sem valor mínimo', pointsCost: 500, emoji: '🚚', availableFromTier: 0 },
  { id: 'cupom15', name: 'Cupom 15% OFF', description: 'Desconto de 15% em lojas selecionadas', pointsCost: 800, emoji: '✨', availableFromTier: 1 },
  { id: 'presente-surpresa', name: 'Presente Surpresa', description: 'Caixa de produtos surpresa', pointsCost: 1500, emoji: '🎁', availableFromTier: 1 },
  { id: 'acesso-vip', name: 'Acesso VIP', description: '1 mês de benefícios VIP', pointsCost: 2500, emoji: '👑', availableFromTier: 2 },
  { id: 'produto-exclusivo', name: 'Produto Exclusivo', description: 'Produto premium limitado', pointsCost: 4000, emoji: '⭐', availableFromTier: 2 },
  { id: 'jantar-gourmet', name: 'Jantar Gourmet', description: 'Voucher para restaurante parceiro', pointsCost: 6000, emoji: '🍷', availableFromTier: 3 },
  { id: 'experiencia-unica', name: 'Experiência Única', description: 'Experiência premium exclusiva', pointsCost: 10000, emoji: '🌟', availableFromTier: 3 },
]

const STORAGE_KEY = 'domplace-loyalty-tier-benefits-points'

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 24 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22, delay: i * 0.08 },
  }),
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 220, damping: 20 },
  },
}

const benefitRowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24, delay: i * 0.04 },
  }),
}

const checkPop = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 15 },
  },
}

const shimmerVariants = {
  animate: {
    backgroundPosition: ['200% center', '-200% center'],
    transition: { duration: 3, repeat: Infinity, ease: 'linear' as const },
  },
}

const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 4px rgba(255,255,255,0.05)',
      '0 0 16px rgba(255,255,255,0.15)',
      '0 0 4px rgba(255,255,255,0.05)',
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

function loadUserPoints(): number {
  if (typeof window === 'undefined') return 2350
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    /* ignore */
  }
  return 2350
}

function saveUserPoints(pts: number): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pts))
  } catch {
    /* ignore */
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFETTI PARTICLES
// ═══════════════════════════════════════════════════════════════════════════════

function TierConfetti({ show, tierColor }: { show: boolean; tierColor: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: 20 + Math.random() * 60,
        delay: Math.random() * 0.5,
        color: [tierColor, '#fbbf24', '#10b981', '#ec4899', '#8b5cf6'][i % 5],
        size: 4 + Math.random() * 6,
        rotation: Math.random() * 360,
        driftX: (Math.random() - 0.5) * 160,
      })),
    [tierColor],
  )

  if (!show) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            left: `${p.x}%`,
            top: '5%',
            rotate: p.rotation,
          }}
          initial={{ y: 0, opacity: 1, x: 0, scale: 0 }}
          animate={{
            y: 400,
            opacity: 0,
            x: p.driftX,
            scale: 1,
            rotate: p.rotation + 720,
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: p.delay,
            ease: 'easeOut' as const,
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTDOWN NUMBER
// ═══════════════════════════════════════════════════════════════════════════════

function CountdownNumber({ target, label }: { target: number; label: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const step = Math.max(1, Math.ceil(target / 60))
    const interval = setInterval(() => {
      start += step
      if (start >= target) {
        setDisplay(target)
        clearInterval(interval)
      } else {
        setDisplay(start)
      }
    }, 16)
    return () => clearInterval(interval)
  }, [target])

  return (
    <div className="text-center">
      <motion.span
        className="text-3xl font-black"
        key={target}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
        style={{ color: '#10b981' }}
      >
        {display.toLocaleString('pt-BR')}
      </motion.span>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER ICON WITH GLOW
// ═══════════════════════════════════════════════════════════════════════════════

function TierIconGlow({ tier, isReached, isCurrent }: { tier: TierData; isReached: boolean; isCurrent: boolean }) {
  const TierIcon = tier.icon

  return (
    <motion.div
      className="relative"
      animate={isCurrent ? { scale: [1, 1.08, 1] } : isReached ? { scale: 1 } : { scale: 0.95 }}
      transition={{ duration: 2.5, repeat: isCurrent ? Infinity : 0, ease: 'easeInOut' as const }}
    >
      {/* Glow ring behind the icon for reached tiers */}
      {isReached && (
        <motion.div
          className="absolute -inset-2 rounded-2xl opacity-40 blur-lg"
          style={{ backgroundColor: tier.color }}
          animate={isCurrent ? { opacity: [0.2, 0.5, 0.2], scale: [1, 1.15, 1] } : { opacity: 0.2 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
          aria-hidden="true"
        />
      )}

      <motion.div
        className={`relative h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${
          isReached
            ? ''
            : 'bg-muted'
        }`}
        style={
          isReached
            ? {
                background: `linear-gradient(135deg, ${tier.gradientFrom}, ${tier.gradientTo})`,
                boxShadow: `0 4px 20px ${tier.color}50`,
              }
            : undefined
        }
        animate={isCurrent ? { rotate: [0, 4, -4, 0] } : {}}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <TierIcon className={`h-7 w-7 ${isReached ? 'text-white' : 'text-muted-foreground'}`} />
        {!isReached && (
          <Lock className="absolute h-4 w-4 text-muted-foreground/50" />
        )}
      </motion.div>

      {/* Sparkle dots around current tier */}
      {isCurrent &&
        Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 60) * (Math.PI / 180)
          const dist = 26
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: tier.color }}
              animate={{
                x: [0, Math.cos(angle) * dist, 0],
                y: [0, Math.sin(angle) * dist, 0],
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15, ease: 'easeOut' as const }}
            />
          )
        })}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER CARD
// ═══════════════════════════════════════════════════════════════════════════════

function TierCard({
  tier,
  tierIndex,
  currentTierIndex,
  isExpanded,
  onToggle,
  points,
}: {
  tier: TierData
  tierIndex: number
  currentTierIndex: number
  isExpanded: boolean
  onToggle: () => void
  points: number
}) {
  const isReached = tierIndex <= currentTierIndex
  const isCurrent = tierIndex === currentTierIndex
  const nextThreshold = TIERS[tierIndex + 1]?.minPoints
  const pointsToNext = nextThreshold ? Math.max(0, nextThreshold - points) : 0

  const tierBenefits = BENEFITS.filter((b) => b.availableFromTier <= tierIndex)

  return (
    <motion.div
      custom={tierIndex}
      variants={cardVariants}
      className={`relative group r39-loyalty-tier-card ${isCurrent ? 'r39-loyalty-tier-card-current' : ''}`}
    >
      {/* Animated gradient border for current tier */}
      {isCurrent && (
        <motion.div
          className="absolute -inset-[2px] rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${tier.gradientFrom}, ${tier.gradientTo}, ${tier.gradientFrom})`,
            backgroundSize: '300% 300%',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
          aria-hidden="true"
        />
      )}

      {/* Card body */}
      <motion.div
        className={`relative rounded-2xl overflow-hidden ${
          isReached ? `${tier.bgLight} ${tier.bgDark}` : 'bg-card'
        } border ${isReached ? `${tier.borderLight} ${tier.borderDark}` : 'border-border'}`}
        whileHover={{ y: -3 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
      >
        {/* Background decorative orbs */}
        {isCurrent && (
          <>
            <motion.div
              className="absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl opacity-15"
              style={{ backgroundColor: tier.color }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
              aria-hidden="true"
            />
            <motion.div
              className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full blur-2xl opacity-10"
              style={{ backgroundColor: tier.color }}
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.15, 0.08] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }}
              aria-hidden="true"
            />
          </>
        )}

        {/* "Seu nível" badge */}
        {isCurrent && (
          <motion.div
            className="absolute top-3 right-3 z-10"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.3 }}
          >
            <Badge className="bg-white/20 backdrop-blur-md text-white border-0 text-[10px] font-bold px-2.5 py-0.5 r39-loyalty-badge">
              Seu nível
            </Badge>
          </motion.div>
        )}

        <div className="relative z-10 p-5">
          {/* Tier header: icon + name + range */}
          <div className="flex items-start gap-4 mb-4">
            <TierIconGlow tier={tier} isReached={isReached} isCurrent={isCurrent} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-2xl">{tier.emoji}</span>
                <h3 className={`text-lg font-bold ${isReached ? tier.textColor : 'text-muted-foreground'}`}>
                  {tier.name}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {tier.minPoints === 0 ? '0' : tier.minPoints.toLocaleString('pt-BR')} -{' '}
                {tier.maxPoints >= 999999 ? '∞' : tier.maxPoints.toLocaleString('pt-BR')} pontos
              </p>

              {/* Multiplier badge */}
              <motion.div
                className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold r39-loyalty-multiplier"
                style={{
                  background: isReached
                    ? `linear-gradient(135deg, ${tier.color}15, ${tier.color}08)`
                    : 'rgba(100,116,139,0.08)',
                  border: `1px solid ${isReached ? tier.color + '30' : 'rgba(100,116,139,0.15)'}`,
                  color: isReached ? tier.color : '#64748b',
                }}
                animate={isReached ? { scale: [1, 1.03, 1] } : {}}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
              >
                <Zap className="h-3 w-3" />
                Multiplicador {tier.multiplier}
              </motion.div>
            </div>
          </div>

          {/* Progress bar to next tier */}
          {isCurrent && nextThreshold && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Progresso para {TIERS[tierIndex + 1].name}
                </span>
                <span className="text-[11px] font-bold" style={{ color: tier.color }}>
                  {Math.round(((points - tier.minPoints) / (nextThreshold - tier.minPoints)) * 100)}%
                </span>
              </div>
              <div className="relative h-3 bg-muted rounded-full overflow-hidden r39-loyalty-progress-track">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${tier.gradientFrom}, ${tier.gradientTo})`,
                  }}
                  initial={{ width: '0%' }}
                  animate={{
                    width: `${Math.min(100, ((points - tier.minPoints) / (nextThreshold - tier.minPoints)) * 100)}%`,
                  }}
                  transition={{ duration: 1.4, ease: 'easeOut' as const, delay: 0.3 }}
                />
                {/* Shimmer sweep overlay */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1.5 }}
                  >
                    <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </motion.div>
                </div>
              </div>

              {/* Points needed countdown */}
              <div className="mt-3 flex justify-center">
                <CountdownNumber target={pointsToNext} label="pontos necessários" />
              </div>
            </div>
          )}

          {/* Benefits toggle button */}
          <motion.button
            className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors r39-loyalty-toggle"
            onClick={onToggle}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xs font-semibold text-foreground">
              {tierBenefits.length} benefícios incluídos
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </motion.button>

          {/* Expandable benefits list */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2">
                  {tierBenefits.map((benefit, i) => {
                    const BenefitIcon = benefit.icon
                    const isAvailable = benefit.availableFromTier <= currentTierIndex
                    return (
                      <motion.div
                        key={benefit.id}
                        custom={i}
                        variants={benefitRowVariants}
                        className="flex items-center gap-3 p-2.5 rounded-xl transition-colors r39-loyalty-benefit-row"
                        style={{
                          backgroundColor: isAvailable
                            ? `${tier.color}08`
                            : 'rgba(100,116,139,0.04)',
                        }}
                      >
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: isAvailable ? `${tier.color}15` : 'rgba(100,116,139,0.08)',
                          }}
                        >
                          <BenefitIcon
                            className="h-4 w-4"
                            style={{ color: isAvailable ? tier.color : '#94a3b8' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${isAvailable ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {benefit.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{benefit.description}</p>
                        </div>
                        <motion.div variants={checkPop}>
                          {isAvailable ? (
                            <Check className="h-4 w-4" style={{ color: '#10b981' }} />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER COMPARISON TABLE
// ═══════════════════════════════════════════════════════════════════════════════

function ComparisonTable({ currentTierIndex }: { currentTierIndex: number }) {
  return (
    <motion.div variants={sectionVariants} className="mt-10">
      <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-amber-500" />
        Comparação de Níveis
      </h3>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card r39-loyalty-table-wrap">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Benefício</th>
              {TIERS.map((t) => (
                <th
                  key={t.id}
                  className={`p-3 text-center text-xs font-bold ${
                    TIERS.indexOf(t) === currentTierIndex ? t.textColor : 'text-muted-foreground'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">{t.emoji}</span>
                    <span>{t.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BENEFITS.map((benefit, i) => {
              const BenefitIcon = benefit.icon
              return (
                <motion.tr
                  key={benefit.id}
                  custom={i}
                  variants={benefitRowVariants}
                  className="border-t border-border/50 hover:bg-muted/20 transition-colors r39-loyalty-table-row"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <BenefitIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium">{benefit.label}</span>
                    </div>
                  </td>
                  {TIERS.map((t, ti) => {
                    const hasBenefit = benefit.availableFromTier <= ti
                    return (
                      <td key={t.id} className="p-3 text-center">
                        <motion.div
                          initial={false}
                          animate={hasBenefit ? { scale: [0.8, 1.1, 1] } : {}}
                          transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: i * 0.05 }}
                        >
                          {hasBenefit ? (
                            <motion.div
                              className="inline-flex items-center justify-center h-7 w-7 rounded-full"
                              style={{ backgroundColor: `${t.color}15` }}
                              animate={ti <= currentTierIndex ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const, delay: i * 0.1 }}
                            >
                              <Check className="h-4 w-4" style={{ color: ti <= currentTierIndex ? t.color : '#94a3b8' }} />
                            </motion.div>
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/30 inline-block" />
                          )}
                        </motion.div>
                      </td>
                    )
                  })}
                </motion.tr>
              )
            })}
            {/* Multiplier row */}
            <motion.tr
              variants={benefitRowVariants}
              custom={BENEFITS.length}
              className="border-t border-border/50 bg-muted/30"
            >
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold">Multiplicador</span>
                </div>
              </td>
              {TIERS.map((t) => (
                <td key={t.id} className="p-3 text-center">
                  <motion.span
                    className={`text-sm font-black ${t.textColor}`}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
                  >
                    {t.multiplier}
                  </motion.span>
                </td>
              ))}
            </motion.tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// REWARD CARD
// ═══════════════════════════════════════════════════════════════════════════════

function RewardCard({
  reward,
  currentTierIndex,
  userPoints,
}: {
  reward: Reward
  currentTierIndex: number
  userPoints: number
}) {
  const isAvailable = reward.availableFromTier <= currentTierIndex
  const canAfford = userPoints >= reward.pointsCost
  const tierData = TIERS[reward.availableFromTier]

  return (
    <motion.div
      variants={cardVariants}
      custom={reward.pointsCost}
      className={`relative overflow-hidden rounded-xl p-4 border transition-colors r39-loyalty-reward-card ${
        isAvailable
          ? `${tierData.borderLight} ${tierData.borderDark}`
          : 'border-border'
      } ${isAvailable ? '' : 'opacity-50'}`}
      whileHover={{ scale: 1.04, y: -3 }}
      transition={{ type: 'spring' as const, stiffness: 350, damping: 22 }}
      style={{
        boxShadow: isAvailable && canAfford ? `0 8px 30px ${tierData.color}18` : '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      {/* Glow orb */}
      {isAvailable && canAfford && (
        <motion.div
          className="absolute -top-8 -right-8 h-20 w-20 rounded-full blur-2xl"
          style={{ backgroundColor: tierData.color }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-3">
          <motion.span
            className="text-2xl"
            animate={isAvailable && canAfford ? { scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] } : {}}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            {reward.emoji}
          </motion.span>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-foreground">{reward.name}</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">{reward.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className={`text-xs font-bold ${canAfford ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
              {reward.pointsCost.toLocaleString('pt-BR')} pts
            </span>
          </div>

          {isAvailable ? (
            canAfford ? (
              <motion.button
                className="px-3 py-1 rounded-full text-[10px] font-bold text-white r39-loyalty-redeem-btn"
                style={{
                  background: `linear-gradient(135deg, ${tierData.gradientFrom}, ${tierData.gradientTo})`,
                  boxShadow: `0 2px 8px ${tierData.color}30`,
                }}
                whileTap={{ scale: 0.92 }}
              >
                Resgatar
              </motion.button>
            ) : (
              <span className="text-[10px] text-muted-foreground">Pontos insuficientes</span>
            )
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Lock className="h-3 w-3" />
              {tierData.name}+
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CROWN ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════

function CrownAnimation() {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center r39-loyalty-crown"
      animate={{
        y: [0, -4, 0],
        rotate: [0, 3, -3, 0],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
    >
      <Crown className="h-6 w-6 text-amber-500" />
      {/* Sparkle on crown tip */}
      <motion.div
        className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400"
        animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION HEADER
// ═══════════════════════════════════════════════════════════════════════════════

function SectionHeader() {
  return (
    <motion.div variants={sectionVariants} className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-2">
        <CrownAnimation />
        <h2 className="text-2xl font-black text-foreground tracking-tight">
          Benefícios do Programa
        </h2>
        <CrownAnimation />
      </div>
      <p className="text-sm text-muted-foreground max-w-xl mx-auto">
        Acumule pontos em cada compra e desbloqueie benefícios exclusivos. Quanto mais alto o nível,
        mais vantagens você aproveita!
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENT TIER STATS
// ═══════════════════════════════════════════════════════════════════════════════

function CurrentTierStats({
  currentTier,
  points,
}: {
  currentTier: TierData
  points: number
}) {
  const stats = [
    { icon: <Star className="h-4 w-4" style={{ color: currentTier.color }} />, label: 'Seus pontos', value: points.toLocaleString('pt-BR') },
    { icon: <Zap className="h-4 w-4" style={{ color: currentTier.color }} />, label: 'Multiplicador', value: currentTier.multiplier },
    { icon: <Heart className="h-4 w-4 text-rose-500" />, label: 'Benefícios ativos', value: String(BENEFITS.filter((b) => b.availableFromTier <= TIERS.indexOf(currentTier)).length) },
    { icon: <Gift className="h-4 w-4 text-emerald-500" />, label: 'Prêmios disponíveis', value: String(REWARDS.filter((r) => r.availableFromTier <= TIERS.indexOf(currentTier)).length) },
  ]

  return (
    <motion.div variants={sectionVariants} className="mb-8">
      <div
        className="rounded-2xl p-5 border r39-loyalty-stats-card"
        style={{
          background: `linear-gradient(135deg, ${currentTier.color}08, transparent)`,
          borderColor: `${currentTier.color}20`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{currentTier.emoji}</span>
          <h3 className="text-sm font-bold text-foreground">Seu Resumo — Nível {currentTier.name}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeInUp}
              className="bg-card rounded-xl p-3 text-center border border-border/50 r39-loyalty-stat-item"
            >
              <div className="flex justify-center mb-1.5">{stat.icon}</div>
              <p className="text-base font-black text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function LoyaltyTierBenefits() {
  const [points, setPoints] = useState<number>(() => loadUserPoints())
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Hydration guard
  useEffect(() => {
    setMounted(true)
  }, [])

  // Derive current tier
  const currentTierIndex = useMemo(() => {
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (points >= TIERS[i].minPoints) return i
    }
    return 0
  }, [points])

  const currentTier = TIERS[currentTierIndex]
  const nextTier = TIERS[currentTierIndex + 1]

  // Toggle tier expansion
  const toggleTier = useCallback((tierId: string) => {
    setExpandedTiers((prev) => {
      const next = new Set(prev)
      if (next.has(tierId)) {
        next.delete(tierId)
      } else {
        next.add(tierId)
        // Trigger confetti on first expand of current tier
        if (tierId === currentTier.id && !prev.has(tierId)) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 2500)
        }
      }
      return next
    })
  }, [currentTier.id])

  // Simulate adding points for demo
  const handleAddPoints = useCallback(() => {
    const newPts = points + 250
    setPoints(newPts)
    saveUserPoints(newPts)

    // Check if tier changed
    let newTierIdx = 0
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (newPts >= TIERS[i].minPoints) { newTierIdx = i; break }
    }
    if (newTierIdx > currentTierIndex) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [points, currentTierIndex])

  // Filter available rewards
  const availableRewards = useMemo(
    () => REWARDS.filter((r) => r.availableFromTier <= currentTierIndex),
    [currentTierIndex],
  )

  if (!mounted) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' as const }}
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
          <span className="text-sm">Carregando benefícios...</span>
        </div>
      </div>
    )
  }

  return (
    <section className="relative py-12 px-4 md:px-8 max-w-5xl mx-auto r39-loyalty-section">
      {/* Confetti on tier unlock */}
      <TierConfetti show={showConfetti} tierColor={currentTier.color} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {/* Header */}
        <SectionHeader />

        {/* Current tier stats summary */}
        <CurrentTierStats currentTier={currentTier} points={points} />

        {/* Tier cards grid */}
        <motion.div variants={sectionVariants}>
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Níveis de Fidelidade
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIERS.map((tier, i) => (
              <div key={tier.id} className="relative">
                <TierCard
                  tier={tier}
                  tierIndex={i}
                  currentTierIndex={currentTierIndex}
                  isExpanded={expandedTiers.has(tier.id)}
                  onToggle={() => toggleTier(tier.id)}
                  points={points}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Comparison table */}
        <ComparisonTable currentTierIndex={currentTierIndex} />

        {/* Resgatar prêmios section */}
        <motion.div variants={sectionVariants} className="mt-10">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-emerald-500" />
            Resgatar Prêmios
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Use seus pontos para resgatar prêmios exclusivos. Seu nível desbloqueia mais opções!
          </p>
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {availableRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                currentTierIndex={currentTierIndex}
                userPoints={points}
              />
            ))}
          </motion.div>

          {availableRewards.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Lock className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Complete o primeiro nível para desbloquear prêmios</p>
            </div>
          )}
        </motion.div>

        {/* Demo: Add points button */}
        <motion.div variants={sectionVariants} className="mt-10 flex justify-center">
          <motion.div whileTap={{ scale: 0.95 }}>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white r39-loyalty-add-points-btn"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
              }}
              onClick={handleAddPoints}
            >
              <Sparkles className="h-4 w-4" />
              Adicionar 250 pontos (demo)
            </button>
          </motion.div>
        </motion.div>

        {/* Footer note */}
        <motion.div variants={sectionVariants} className="mt-8 text-center">
          <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Seus pontos não expiram enquanto houver atividade nos últimos 90 dias
          </p>
        </motion.div>
      </motion.div>

      {/* Inline styles for keyframe animations */}
      <style>{`
        .r39-loyalty-badge {
          animation: r39-badge-pulse 2s ease-in-out infinite;
        }
        @keyframes r39-badge-pulse {
          0%, 100% { box-shadow: 0 0 4px rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 12px rgba(255,255,255,0.25); }
        }
        .r39-loyalty-progress-track::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: r39-progress-shimmer 2.5s ease-in-out infinite;
        }
        @keyframes r39-progress-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .r39-loyalty-redeem-btn:hover {
          filter: brightness(1.1);
        }
        .r39-loyalty-add-points-btn:hover {
          filter: brightness(1.08);
        }
        .r39-loyalty-tier-card {
          transition: transform 0.2s;
        }
        .r39-loyalty-tier-card:hover {
          z-index: 2;
        }
      `}</style>
    </section>
  )
}
