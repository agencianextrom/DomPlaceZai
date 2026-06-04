'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  Percent,
  Clock,
  Gift,
  Headphones,
  Calculator,
  Users,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TierBenefit {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  bronze: boolean | string
  prata: boolean | string
  ouro: boolean | string
}

interface TierData {
  id: string
  name: string
  price: string
  priceValue: number
  description: string
  gradient: string
  borderGradient: string
  iconBg: string
  iconColor: string
  textColor: string
  shadowColor: string
  popular?: boolean
}

interface TestimonialData {
  id: string
  name: string
  avatar: string
  tier: string
  rating: number
  comment: string
  date: string
}

interface SavingsCalc {
  frequency: string
  bronzeSaving: string
  prataSaving: string
  ouroSaving: string
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const tiers: TierData[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    price: 'Grátis',
    priceValue: 0,
    description: 'Comece sua jornada de benefícios na DomPlace',
    gradient: 'from-amber-700 via-amber-600 to-yellow-600',
    borderGradient: 'from-amber-500 to-yellow-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-700 dark:text-amber-400',
    textColor: 'text-amber-700 dark:text-amber-300',
    shadowColor: 'rgba(217, 119, 6, 0.15)',
  },
  {
    id: 'prata',
    name: 'Prata',
    price: 'R$9,90/mês',
    priceValue: 9.9,
    description: 'Desbloqueie descontos exclusivos e entregas grátis',
    gradient: 'from-slate-600 via-slate-500 to-gray-400',
    borderGradient: 'from-slate-400 to-gray-300',
    iconBg: 'bg-slate-100 dark:bg-slate-800/50',
    iconColor: 'text-slate-600 dark:text-slate-300',
    textColor: 'text-slate-700 dark:text-slate-200',
    popular: true,
    shadowColor: 'rgba(100, 116, 139, 0.2)',
  },
  {
    id: 'ouro',
    name: 'Ouro',
    price: 'R$19,90/mês',
    priceValue: 19.9,
    description: 'Experiência premium com todos os benefícios máximos',
    gradient: 'from-yellow-500 via-amber-500 to-yellow-400',
    borderGradient: 'from-yellow-400 to-amber-400',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    shadowColor: 'rgba(234, 179, 8, 0.2)',
  },
]

const benefits: TierBenefit[] = [
  {
    id: 'free-delivery',
    label: 'Entrega Grátis',
    icon: Truck,
    bronze: false,
    prata: '2x/mês',
    ouro: 'Ilimitado',
  },
  {
    id: 'exclusive-discounts',
    label: 'Descontos Exclusivos',
    icon: Percent,
    bronze: '5%',
    prata: '10%',
    ouro: '20%',
  },
  {
    id: 'early-access',
    label: 'Acesso Antecipado',
    icon: Clock,
    bronze: false,
    prata: true,
    ouro: '48h antes',
  },
  {
    id: 'birthday-bonus',
    label: 'Bônus de Aniversário',
    icon: Gift,
    bronze: false,
    prata: 'R$10 off',
    ouro: 'R$30 off',
  },
  {
    id: 'priority-support',
    label: 'Suporte Prioritário',
    icon: Headphones,
    bronze: false,
    prata: true,
    ouro: true,
  },
  {
    id: 'exclusive-content',
    label: 'Conteúdo Exclusivo',
    icon: Sparkles,
    bronze: false,
    prata: true,
    ouro: true,
  },
  {
    id: 'cashback',
    label: 'Cashback',
    icon: TrendingUp,
    bronze: '1%',
    prata: '3%',
    ouro: '5%',
  },
  {
    id: 'priority-delivery',
    label: 'Entrega Prioritária',
    icon: Zap,
    bronze: false,
    prata: false,
    ouro: true,
  },
]

const testimonials: TestimonialData[] = [
  {
    id: '1',
    name: 'Ana Carolina Silva',
    avatar: 'AC',
    tier: 'Ouro',
    rating: 5,
    comment: 'O plano Ouro se pagou no primeiro mês! As entregas grátis e os 20% de desconto economizaram muito mais do que eu pagava. Super recomendo!',
    date: 'Há 2 dias',
  },
  {
    id: '2',
    name: 'Pedro Henrique Costa',
    avatar: 'PH',
    tier: 'Prata',
    rating: 5,
    comment: 'Excelente custo-benefício no plano Prata. Os descontos exclusivos são ótimos e o suporte prioritário faz toda diferença quando preciso.',
    date: 'Há 5 dias',
  },
  {
    id: '3',
    name: 'Mariana Oliveira Santos',
    avatar: 'MO',
    tier: 'Ouro',
    rating: 4,
    comment: 'Adorei o acesso antecipado às promoções. Consegui produtos com desconto que ninguém mais teve. O bônus de aniversário foi uma surpresa!',
    date: 'Há 1 semana',
  },
  {
    id: '4',
    name: 'Lucas Ferreira Almeida',
    avatar: 'LF',
    tier: 'Prata',
    rating: 5,
    comment: 'Comecei no Bronze e fiz upgrade para Prata. A diferença é enorme! Entregas grátis e descontos reais. Vale cada centavo.',
    date: 'Há 2 semanas',
  },
  {
    id: '5',
    name: 'Juliana Mendes Ribeiro',
    avatar: 'JR',
    tier: 'Bronze',
    rating: 4,
    comment: 'Mesmo no plano gratuito já sinto a diferença com os 5% de desconto. Estou pensando em fazer upgrade para Prata em breve!',
    date: 'Há 3 semanas',
  },
]

const savingsData: SavingsCalc[] = [
  {
    frequency: '1-2 pedidos/mês',
    bronzeSaving: 'R$5',
    prataSaving: 'R$25',
    ouroSaving: 'R$55',
  },
  {
    frequency: '3-5 pedidos/mês',
    bronzeSaving: 'R$12',
    prataSaving: 'R$62',
    ouroSaving: 'R$140',
  },
  {
    frequency: '6-10 pedidos/mês',
    bronzeSaving: 'R$22',
    prataSaving: 'R$115',
    ouroSaving: 'R$260',
  },
  {
    frequency: '10+ pedidos/mês',
    bronzeSaving: 'R$35',
    prataSaving: 'R$180',
    ouroSaving: 'R$420',
  },
]

// ─── Helper Functions ───────────────────────────────────────────────────────

function getTierColor(tierName: string): string {
  switch (tierName) {
    case 'Bronze':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'Prata':
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-200'
    case 'Ouro':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function BenefitCell({ value }: { value: boolean | string }) {
  if (value === false) {
    return (
      <span className="text-muted-foreground/40 flex items-center justify-center">
        <span className="r39-benefit-dash">—</span>
      </span>
    )
  }
  if (value === true) {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
        className="text-emerald-500 dark:text-emerald-400 flex items-center justify-center"
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </motion.span>
    )
  }
  return (
    <motion.span
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-sm font-medium text-foreground"
    >
      {value}
    </motion.span>
  )
}

// ─── Animated Shimmer Button ────────────────────────────────────────────────

function ShimmerButton({ tier, onClick }: { tier: TierData; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
    >
      <Button
        className={`relative overflow-hidden w-full h-12 font-bold text-sm rounded-xl transition-colors ${
          tier.popular
            ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg r39-shimmer-btn-popular'
            : tier.id === 'ouro'
              ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg r39-shimmer-btn-gold'
              : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
        }`}
        onClick={onClick}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {tier.priceValue === 0 ? 'Começar Grátis' : 'Assinar Agora'}
          {tier.priceValue > 0 && <Crown className="h-4 w-4" />}
        </span>
        {(tier.popular || tier.id === 'ouro') && (
          <motion.span
            className="absolute inset-0 r39-shimmer-sweep"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          />
        )}
      </Button>
    </motion.div>
  )
}

// ─── Tier Card Component ────────────────────────────────────────────────────

function TierCard({
  tier,
  index,
  onEnroll,
}: {
  tier: TierData
  index: number
  onEnroll: (tierId: string) => void
}) {
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 22,
        delay: index * 0.15,
      },
    },
  }

  return (
    <motion.div variants={cardVariants} className="relative">
      {/* Popular badge */}
      <AnimatePresence>
        {tier.popular && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 18, delay: 0.3 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
          >
            <Badge className="bg-gradient-to-r from-primary to-emerald-500 text-white border-0 px-4 py-1 text-xs font-bold shadow-lg r39-popular-badge">
              <Sparkles className="h-3 w-3 mr-1" />
              Mais Popular
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-3 w-3 ml-1" />
              </motion.span>
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ y: -6, boxShadow: `0 20px 40px ${tier.shadowColor}` }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
        className={`relative rounded-2xl overflow-hidden bg-card border-2 border-transparent bg-gradient-to-b ${tier.popular ? 'r39-tier-card-popular ring-2 ring-primary/30' : 'hover:ring-2 hover:ring-primary/10'}`}
      >
        {/* Top gradient header */}
        <div className={`relative h-28 bg-gradient-to-br ${tier.gradient} r39-tier-header-${tier.id}`}>
          {/* Decorative circles */}
          <div className="absolute top-2 right-2 w-20 h-20 rounded-full bg-white/10 r39-tier-circle" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5 r39-tier-circle" />
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 18, delay: index * 0.15 + 0.2 }}
              className={`h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg`}
            >
              <Crown className="h-8 w-8 text-white drop-shadow-md" />
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-4">
          {/* Tier name & price */}
          <div className="text-center mb-4">
            <h3 className={`text-xl font-bold ${tier.textColor} mb-1`}>{tier.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">{tier.description}</p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 250, damping: 20, delay: index * 0.15 + 0.3 }}
              className="flex items-baseline justify-center gap-1"
            >
              {tier.priceValue > 0 && (
                <span className="text-sm text-muted-foreground">R$</span>
              )}
              <span className={`text-3xl font-extrabold ${tier.textColor}`}>
                {tier.priceValue === 0 ? 'Grátis' : tier.priceValue.toFixed(2).replace('.', ',')}
              </span>
              {tier.priceValue > 0 && (
                <span className="text-sm text-muted-foreground">/mês</span>
              )}
            </motion.div>
            {tier.priceValue > 0 && (
              <p className="text-[10px] text-muted-foreground mt-1">
                ou {tier.id === 'prata' ? 'R$107,90' : 'R$215,90'}/ano (economia de 10%)
              </p>
            )}
          </div>

          {/* Benefits list with animated checkmarks */}
          <div className="space-y-2.5 mb-5">
            {benefits.slice(0, 5).map((benefit, bi) => {
              const tierValue = benefit[tier.id as keyof typeof benefit] as boolean | string
              if (tierValue === false) return null
              return (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 250, damping: 20, delay: index * 0.15 + bi * 0.06 + 0.4 }}
                  className="flex items-center gap-2.5"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: index * 0.15 + bi * 0.06 + 0.5 }}
                    className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0"
                  >
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                  </motion.div>
                  <span className="text-xs text-foreground flex-1">{benefit.label}</span>
                  {typeof tierValue === 'string' && (
                    <span className="text-[10px] font-semibold text-muted-foreground">{tierValue}</span>
                  )}
                </motion.div>
              )
            })}
            {benefits.length > 5 && (
              <p className="text-[10px] text-center text-muted-foreground pt-1">
                +{benefits.length - 5} mais benefícios
              </p>
            )}
          </div>

          {/* CTA Button */}
          <ShimmerButton tier={tier} onClick={() => onEnroll(tier.id)} />
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Star Rating Display ────────────────────────────────────────────────────

function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i < rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'fill-muted text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Testimonial Card ───────────────────────────────────────────────────────

function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ type: 'spring' as const, stiffness: 250, damping: 25 }}
      className="flex-shrink-0 w-80 sm:w-96 snap-center"
    >
      <Card className="h-full border-border/50 r39-testimonial-card">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`h-10 w-10 rounded-full ${getTierColor(testimonial.tier)} flex items-center justify-center text-sm font-bold shrink-0`}
            >
              {testimonial.avatar}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{testimonial.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className={`text-[10px] px-2 py-0 ${getTierColor(testimonial.tier)} border-0`}>
                  {testimonial.tier}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{testimonial.date}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-2">
            <StarRatingDisplay rating={testimonial.rating} />
          </div>

          {/* Comment */}
          <p className="text-xs text-muted-foreground leading-relaxed">&ldquo;{testimonial.comment}&rdquo;</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function StoreMembershipTiers() {
  // ── State ──
  const [showComparison, setShowComparison] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [selectedCalcFrequency, setSelectedCalcFrequency] = useState(1)
  const [enrolledTier, setEnrolledTier] = useState<string | null>(null)
  const [showEnrollSuccess, setShowEnrollSuccess] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // ── Current tier progress mock ──
  const currentTier = 'bronze'
  const currentSpending = 35
  const nextTierSpending = 50
  const progressPercent = Math.min((currentSpending / nextTierSpending) * 100, 100)
  const remainingAmount = Math.max(nextTierSpending - currentSpending, 0)

  // ── Effects ──
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Check scroll position for carousel arrows
  const checkScroll = useCallback(() => {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 5)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
  }, [])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    return () => el.removeEventListener('scroll', checkScroll)
  }, [checkScroll])

  // ── Handlers ──
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const scrollAmount = 340
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const handleEnroll = (tierId: string) => {
    setEnrolledTier(tierId)
    setShowEnrollSuccess(true)
    setTimeout(() => setShowEnrollSuccess(false), 3000)
  }

  // ── Animation variants ──
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12 },
    },
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 180, damping: 22 },
    },
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 200, damping: 22 },
    },
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* ─── Section Header ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
        className="text-center space-y-3"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 18 }}
          className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 border border-primary/20 r39-header-icon"
        >
          <Shield className="h-7 w-7 text-primary" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground r39-section-title">
          Níveis de Associação
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Escolha o plano ideal para você e aproveite benefícios exclusivos em todas as suas compras na DomPlace
        </p>
      </motion.div>

      {/* ─── Progress Indicator ─────────────────────────────────────── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-emerald-500/5 to-primary/5 r39-progress-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Seu Progresso Atual</p>
                <p className="text-xs text-muted-foreground">
                  Nível atual: <span className="font-semibold text-amber-600 dark:text-amber-400">Bronze</span>
                </p>
              </div>
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-0 shrink-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                {Math.round(progressPercent)}%
              </Badge>
            </div>
            <Progress value={progressPercent} className="h-3 mb-2 r39-progress-bar" />
            <motion.p
              key={remainingAmount}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' as const, stiffness: 250, damping: 20 }}
              className="text-xs text-muted-foreground text-center"
            >
              {remainingAmount > 0
                ? `Você está a R$${remainingAmount.toFixed(2).replace('.', ',')} do nível Prata!`
                : 'Parabéns! Você atingiu o próximo nível!'}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Tier Cards ──────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        {tiers.map((tier, index) => (
          <TierCard key={tier.id} tier={tier} index={index} onEnroll={handleEnroll} />
        ))}
      </motion.div>

      {/* ─── Enrollment Success Toast ─────────────────────────────────── */}
      <AnimatePresence>
        {showEnrollSuccess && enrolledTier && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4"
          >
            <Card className="bg-gradient-to-r from-emerald-600 to-primary text-white border-0 shadow-2xl r39-success-toast">
              <CardContent className="p-4 flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                  className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0"
                >
                  <Check className="h-5 w-5 text-white" strokeWidth={3} />
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Inscrição Realizada!</p>
                  <p className="text-xs text-white/80">
                    Você agora é membro{' '}
                    <span className="font-semibold">
                      {tiers.find((t) => t.id === enrolledTier)?.name}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Tier Comparison Table ───────────────────────────────────── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border/50 r39-comparison-card">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Comparar Planos
              </CardTitle>
              <motion.div
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComparison(!showComparison)}
                  className="text-xs gap-1.5"
                >
                  {showComparison ? 'Ocultar' : 'Ver Tabela'}
                  <motion.div
                    animate={{ rotate: showComparison ? 180 : 0 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AnimatePresence>
              {showComparison && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring' as const, stiffness: 200, damping: 25 }}
                  className="overflow-hidden"
                >
                  {/* Mobile: Cards layout */}
                  <div className="sm:hidden p-4 space-y-4">
                    {tiers.map((tier, ti) => (
                      <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring' as const, stiffness: 250, damping: 20, delay: ti * 0.1 }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Crown className={`h-4 w-4 ${tier.iconColor}`} />
                          <span className={`text-sm font-bold ${tier.textColor}`}>{tier.name}</span>
                          <span className="text-xs text-muted-foreground">{tier.price}</span>
                        </div>
                        <div className="space-y-2">
                          {benefits.map((b) => {
                            const val = b[tier.id as keyof typeof b] as boolean | string
                            return (
                              <div key={b.id} className="flex items-center justify-between text-xs py-1.5 border-b border-border/20 last:border-0">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                  <b.icon className="h-3.5 w-3.5" />
                                  {b.label}
                                </span>
                                <BenefitCell value={val} />
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Desktop: Table layout */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Recurso</th>
                          {tiers.map((tier) => (
                            <th key={tier.id} className="text-center py-3 px-4">
                              <div className={`inline-flex items-center gap-1.5 text-xs font-bold ${tier.textColor}`}>
                                <Crown className="h-3.5 w-3.5" />
                                {tier.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{tier.price}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {benefits.map((benefit, i) => (
                          <motion.tr
                            key={benefit.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.04 }}
                            className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-4 text-xs text-muted-foreground flex items-center gap-2">
                              <benefit.icon className="h-4 w-4 text-primary/60" />
                              {benefit.label}
                            </td>
                            {tiers.map((tier) => (
                              <td key={tier.id} className="text-center py-3 px-4">
                                <BenefitCell value={benefit[tier.id as keyof typeof benefit] as boolean | string} />
                              </td>
                            ))}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Savings Calculator ───────────────────────────────────────── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border/50 r39-savings-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Calculadora de Economia
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Veja quanto você pode economizar em cada plano com base na sua frequência de compras
            </p>
          </CardHeader>
          <CardContent className="p-5">
            {/* Frequency selector */}
            <div className="flex flex-wrap gap-2 mb-5">
              {savingsData.map((item, i) => (
                <motion.button
                  key={item.frequency}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                  onClick={() => setSelectedCalcFrequency(i)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    selectedCalcFrequency === i
                      ? 'bg-primary text-primary-foreground shadow-md r39-calc-active'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {item.frequency}
                </motion.button>
              ))}
            </div>

            {/* Savings display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCalcFrequency}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ type: 'spring' as const, stiffness: 250, damping: 22 }}
                className="grid grid-cols-3 gap-3"
              >
                {tiers.map((tier, ti) => {
                  const saving = savingsData[selectedCalcFrequency][
                    `bronzeSaving` as keyof SavingsCalc
                  ] === savingsData[selectedCalcFrequency].bronzeSaving
                    ? [
                        savingsData[selectedCalcFrequency].bronzeSaving,
                        savingsData[selectedCalcFrequency].prataSaving,
                        savingsData[selectedCalcFrequency].ouroSaving,
                      ][ti]
                    : savingsData[selectedCalcFrequency].bronzeSaving
                  const savingValue = [
                    savingsData[selectedCalcFrequency].bronzeSaving,
                    savingsData[selectedCalcFrequency].prataSaving,
                    savingsData[selectedCalcFrequency].ouroSaving,
                  ][ti]

                  return (
                    <motion.div
                      key={tier.id}
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                      className={`text-center p-4 rounded-xl border border-border/50 ${
                        tier.popular ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-card'
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg ${tier.iconBg} flex items-center justify-center mx-auto mb-2`}>
                        <Crown className={`h-4 w-4 ${tier.iconColor}`} />
                      </div>
                      <p className={`text-xs font-semibold mb-1 ${tier.textColor}`}>{tier.name}</p>
                      <motion.p
                        key={savingValue}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 350, damping: 18 }}
                        className={`text-lg font-extrabold ${tier.textColor}`}
                      >
                        {savingValue}
                      </motion.p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">economia/mês</p>
                      {tier.priceValue > 0 && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                          ROI: +{Math.round(
                            (parseFloat(savingValue.replace('R$', '').replace(',', '.')) / tier.priceValue) * 100
                          )}%
                        </p>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            {/* Insight */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-2.5"
            >
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Dica de Economia</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                  Para quem faz {savingsData[selectedCalcFrequency].frequency}, o plano{' '}
                  <span className="font-semibold text-primary">Prata</span> oferece o melhor custo-benefício com até{' '}
                  {savingsData[selectedCalcFrequency].prataSaving} de economia mensal!
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Benefits Detail Section ──────────────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border/50 r39-benefits-detail-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Todos os Benefícios
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Confira cada benefício disponível nos nossos planos de associação
            </p>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.id}
                  variants={{
                    hidden: { opacity: 0, x: i % 2 === 0 ? -20 : 20 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { type: 'spring' as const, stiffness: 200, damping: 22, delay: i * 0.08 },
                    },
                  }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors r39-benefit-item"
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 18 }}
                    className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
                  >
                    <benefit.icon className="h-4 w-4 text-primary" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{benefit.label}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {tiers.map((tier) => {
                        const val = benefit[tier.id as keyof typeof benefit] as boolean | string
                        return (
                          <span
                            key={tier.id}
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              val === false
                                ? 'bg-muted text-muted-foreground/40'
                                : 'bg-primary/10 text-primary font-medium'
                            }`}
                          >
                            {val === false ? '—' : val === true ? '✓' : val}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Testimonial Carousel ────────────────────────────────────── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border/50 r39-carousel-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  O que nossos membros dizem
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Depoimentos reais de clientes satisfeitos
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 disabled:opacity-30"
                    onClick={() => scrollCarousel('left')}
                    disabled={!canScrollLeft}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 disabled:opacity-30"
                    onClick={() => scrollCarousel('right')}
                    disabled={!canScrollRight}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Carousel */}
            <div className="relative">
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-5 pb-5 pt-2 r39-carousel-scroll"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Fade edge left */}
                <div className="absolute left-0 top-0 bottom-5 w-8 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
                {/* Fade edge right */}
                <div className="absolute right-0 top-0 bottom-5 w-8 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

                {testimonials.map((testimonial, i) => (
                  <AnimatePresence key={testimonial.id}>
                    <TestimonialCard testimonial={testimonial} />
                  </AnimatePresence>
                ))}
              </div>

              {/* Dots indicator */}
              <div className="flex items-center justify-center gap-2 pb-5">
                {testimonials.map((_, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.8 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentTestimonial
                        ? 'w-6 bg-primary r39-dot-active'
                        : 'w-2 bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="border-t border-border/30 px-5 py-3">
              <div className="flex items-center justify-around text-center">
                <div>
                  <p className="text-lg font-extrabold text-primary r39-stat-number">4.8</p>
                  <p className="text-[10px] text-muted-foreground">Avaliação média</p>
                </div>
                <div className="h-8 w-px bg-border/50" />
                <div>
                  <p className="text-lg font-extrabold text-foreground r39-stat-number">2.5k+</p>
                  <p className="text-[10px] text-muted-foreground">Membros ativos</p>
                </div>
                <div className="h-8 w-px bg-border/50" />
                <div>
                  <p className="text-lg font-extrabold text-foreground r39-stat-number">97%</p>
                  <p className="text-[10px] text-muted-foreground">Satisfação</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Bottom CTA ───────────────────────────────────────────────── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <Card className="bg-gradient-to-br from-primary/10 via-emerald-500/10 to-primary/10 border-primary/20 overflow-hidden r39-bottom-cta-card">
          <CardContent className="p-8 relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 250, damping: 18 }}
                className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 shadow-lg mb-4"
              >
                <Crown className="h-6 w-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-extrabold text-foreground mb-2">
                Pronto para começar a economizar?
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
                Junte-se a mais de 2.500 membros que já economizam todos os meses com a DomPlace Membership
              </p>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                className="inline-block"
              >
                <Button className="relative overflow-hidden h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-sm shadow-xl r39-cta-btn-main">
                  <span className="relative z-10 flex items-center gap-2">
                    Assinar Agora
                    <Zap className="h-4 w-4" />
                  </span>
                  <motion.span
                    className="absolute inset-0 r39-shimmer-sweep"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
                  />
                </Button>
              </motion.div>
              <p className="text-[10px] text-muted-foreground mt-3">
                Cancele quando quiser · Sem fidelidade · Pagamento seguro
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Inline Styles ────────────────────────────────────────────── */}
      <style jsx global>{`
        /* ── Shimmer sweep effect ── */
        .r39-shimmer-sweep {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.25) 45%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0.25) 55%,
            transparent 100%
          );
          pointer-events: none;
        }

        /* ── Tier card circles animation ── */
        .r39-tier-circle {
          animation: r39-circle-pulse 6s ease-in-out infinite;
        }

        @keyframes r39-circle-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }

        /* ── Popular badge glow ── */
        .r39-popular-badge {
          animation: r39-badge-glow 2s ease-in-out infinite alternate;
        }

        @keyframes r39-badge-glow {
          0% { box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3); }
          100% { box-shadow: 0 2px 16px rgba(16, 185, 129, 0.5); }
        }

        /* ── Progress bar gradient ── */
        .r39-progress-bar [data-slot="progress-indicator"] {
          background: linear-gradient(90deg, #f59e0b, #10b981);
          border-radius: 9999px;
        }

        /* ── Active calculator button ── */
        .r39-calc-active {
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }

        /* ── Testimonial card hover ── */
        .r39-testimonial-card {
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .r39-testimonial-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        /* ── Carousel scrollbar hide ── */
        .r39-carousel-scroll::-webkit-scrollbar {
          display: none;
        }

        /* ── Shimmer button popular ── */
        .r39-shimmer-btn-popular {
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }

        /* ── Shimmer button gold ── */
        .r39-shimmer-btn-gold {
          box-shadow: 0 4px 20px rgba(234, 179, 8, 0.3);
        }

        /* ── Section title gradient ── */
        .r39-section-title {
          background: linear-gradient(135deg, #0f172a 0%, #10b981 50%, #0f172a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: r39-title-shimmer 4s ease-in-out infinite;
        }

        @keyframes r39-title-shimmer {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }

        /* ── Benefit item hover ── */
        .r39-benefit-item {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .r39-benefit-item:hover {
          transform: translateX(4px);
        }

        /* ── Success toast animation ── */
        .r39-success-toast {
          box-shadow: 0 12px 40px rgba(16, 185, 129, 0.3);
        }

        /* ── Comparison card ── */
        .r39-comparison-card:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        /* ── Savings card ── */
        .r39-savings-card:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        /* ── Benefits detail card ── */
        .r39-benefits-detail-card:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        /* ── Carousel card ── */
        .r39-carousel-card:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        /* ── Progress card ── */
        .r39-progress-card:hover {
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
        }

        /* ── Bottom CTA card ── */
        .r39-bottom-cta-card:hover {
          box-shadow: 0 4px 24px rgba(16, 185, 129, 0.15);
        }

        /* ── Dot active indicator ── */
        .r39-dot-active {
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }

        /* ── Stat number animation ── */
        .r39-stat-number {
          animation: r39-stat-fade 0.6s ease-out;
        }

        @keyframes r39-stat-fade {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── CTA main button ── */
        .r39-cta-btn-main {
          box-shadow: 0 6px 24px rgba(16, 185, 129, 0.35);
          transition: box-shadow 0.3s ease;
        }
        .r39-cta-btn-main:hover {
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.45);
        }

        /* ── Tier popular ring ── */
        .r39-tier-card-popular {
          box-shadow: 0 8px 32px rgba(100, 116, 139, 0.15);
        }

        /* ── Benefit dash styling ── */
        .r39-benefit-dash {
          font-size: 16px;
          line-height: 1;
        }

        /* ── Header icon subtle float ── */
        .r39-header-icon {
          animation: r39-icon-float 3s ease-in-out infinite;
        }

        @keyframes r39-icon-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
