'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Crown, Star, Users, ChevronDown, ChevronUp, Check, Sparkles, Calculator, Gift, TrendingUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cachedFetch } from '@/lib/api-cache'

/* ── Subscription tier data ── */
interface TierData {
  id: string
  name: string
  price: number
  period: string
  icon: React.ReactNode
  color: string
  borderColor: string
  bgGlow: string
  badge: string
  badgeColor: string
  products: { emoji: string; name: string; desc: string }[]
  savings: number
  description: string
}

const tiers: TierData[] = [
  {
    id: 'basico',
    name: 'Básico',
    price: 29.90,
    period: '/mês',
    icon: <Package className="h-5 w-5" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgGlow: 'shadow-emerald-500/10',
    badge: 'Popular',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    products: [
      { emoji: '🍚', name: 'Arroz 1kg', desc: 'Arroz selecionado premium' },
      { emoji: '🫘', name: 'Feijão 500g', desc: 'Feijão carioca fresco' },
      { emoji: '🫒', name: 'Óleo 500ml', desc: 'Óleo de soja' },
      { emoji: '🍞', name: 'Pão (6 un)', desc: 'Pão francês fresquinho' },
    ],
    savings: 22,
    description: 'Essenciais do dia a dia com economia garantida.',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49.90,
    period: '/mês',
    icon: <Crown className="h-5 w-5" />,
    color: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/30',
    bgGlow: 'shadow-amber-500/10',
    badge: 'Mais escolhido',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    products: [
      { emoji: '🍚', name: 'Arroz 5kg', desc: 'Arroz tipo 1 premium' },
      { emoji: '🫘', name: 'Feijão 1kg', desc: 'Feijão carioca selecionado' },
      { emoji: '🫒', name: 'Óleo 900ml', desc: 'Óleo de soja puro' },
      { emoji: '🍌', name: 'Frutas 1kg', desc: 'Mix de frutas da estação' },
      { emoji: '🥛', name: 'Leite 1L', desc: 'Leite integral fresco' },
    ],
    savings: 35,
    description: 'Produtos selecionados + frutas e laticínios frescos.',
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 79.90,
    period: '/mês',
    icon: <Star className="h-5 w-5" />,
    color: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-500/30',
    bgGlow: 'shadow-yellow-500/10',
    badge: '⭐ Melhor valor',
    badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    products: [
      { emoji: '🍚', name: 'Arroz 5kg', desc: 'Arroz tipo 1 premium' },
      { emoji: '🫘', name: 'Feijão 1kg', desc: 'Feijão carioca selecionado' },
      { emoji: '🫒', name: 'Óleo 900ml', desc: 'Óleo de soja puro' },
      { emoji: '🍌', name: 'Frutas 2kg', desc: 'Mix premium de frutas' },
      { emoji: '🥛', name: 'Leite 2L', desc: 'Leite integral' },
      { emoji: '🧀', name: 'Queijo 300g', desc: 'Queijo mussarela' },
    ],
    savings: 42,
    description: 'Cesta completa com produtos premium e exclusivos.',
  },
  {
    id: 'familia',
    name: 'Família',
    price: 99.90,
    period: '/mês',
    icon: <Users className="h-5 w-5" />,
    color: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500/30',
    bgGlow: 'shadow-rose-500/10',
    badge: '👨‍👩‍👧‍👦 Família',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    products: [
      { emoji: '🍚', name: 'Arroz 5kg', desc: 'Arroz tipo 1 premium' },
      { emoji: '🫘', name: 'Feijão 2kg', desc: 'Feijão carioca em dobro' },
      { emoji: '🫒', name: 'Óleo 2x900ml', desc: 'Kit duplo de óleo' },
      { emoji: '🍌', name: 'Frutas 3kg', desc: 'Frutas para toda a família' },
      { emoji: '🥛', name: 'Leite 3L', desc: 'Leite integral familiar' },
      { emoji: '🧀', name: 'Queijo 500g', desc: 'Queijo mussarela grande' },
    ],
    savings: 48,
    description: 'Tudo para a família inteira com o melhor custo-benefício.',
  },
]

/* ── Skeleton loader ── */
function SubscriptionBoxSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-48 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-24" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── r37 animated price counter ── */
function R37PriceCounter({ value, delay }: { value: number; delay: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 800
      const start = Date.now()
      const tick = () => {
        const progress = Math.min((Date.now() - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(eased * value)
        if (progress < 1) requestAnimationFrame(tick)
      }
      tick()
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return <span>R$ {display.toFixed(2).replace('.', ',')}</span>
}

/* ── Animated checkmark for subscribed state ── */
function AnimatedCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 15 }}
      className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center"
    >
      <motion.div
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}

/* ── Main component ── */
export function StoreSubscriptionBox() {
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTier, setExpandedTier] = useState<string | null>(null)
  const [subscribingTier, setSubscribingTier] = useState<string | null>(null)
  const [subscribedTier, setSubscribedTier] = useState<string | null>(
    () => (typeof window !== 'undefined' ? localStorage.getItem('domplace_subscription_tier') : null)
  )
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)
  const [storeCount, setStoreCount] = useState(0)

  // Load store count from API
  useEffect(() => {
    let cancelled = false
    const loadData = async () => {
      try {
        const data = await cachedFetch('/api/stores?limit=20')
        if (!cancelled && data.stores) {
          setStoreCount(data.stores.length)
        }
      } catch {
        // Use fallback
        setStoreCount(8)
      }
      if (!cancelled) setIsLoading(false)
    }
    loadData()
    return () => { cancelled = true }
  }, [])

  // Subscribe handler
  const handleSubscribe = async (tierId: string) => {
    setSubscribingTier(tierId)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSubscribedTier(tierId)
    setSubscribingTier(null)
    if (typeof window !== 'undefined') {
      localStorage.setItem('domplace_subscription_tier', tierId)
    }
  }

  const handleUnsubscribe = (tierId: string) => {
    setSubscribedTier(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('domplace_subscription_tier')
    }
  }

  // Toggle accordion
  const toggleAccordion = (tierId: string) => {
    setExpandedTier((prev) => (prev === tierId ? null : tierId))
  }

  if (isLoading) {
    return <SubscriptionBoxSkeleton />
  }

  return (
    <div className="space-y-6 r62-card-lift">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center"
          >
            <Gift className="h-4 w-4 text-primary" />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold r62-heading-gradient">Caixa de Assinatura</h2>
            <p className="text-xs text-muted-foreground">
              Receba produtos selecionados todo mês · <span className="text-primary font-medium">{storeCount} lojas parceiras</span>
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] bg-gradient-to-r from-primary/10 to-amber-500/10 text-primary border-primary/20 font-bold">
          Novo
        </Badge>
      </div>

      {/* Savings calculator banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200/50 dark:border-emerald-800/30"
      >
        <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
          <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Economize até 48% vs compra avulsa</p>
          <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">
            Compare e veja quanto você poupa com a assinatura
          </p>
        </div>
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <TrendingUp className="h-5 w-5 text-emerald-500" />
        </motion.div>
      </motion.div>

      {/* Tier cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiers.map((tier, i) => {
          const isSubscribed = subscribedTier === tier.id
          const isHovered = hoveredTier === tier.id
          const isExpanded = expandedTier === tier.id
          const isSubscribing = subscribingTier === tier.id

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring' as const, stiffness: 200, damping: 20 }}
              className="relative"
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
            >
              {/* Glow ring on hover/select */}
              <motion.div
                className={`absolute -inset-0.5 rounded-xl transition-all duration-300 ${
                  isSubscribed
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 dark:from-emerald-600 dark:to-teal-600'
                    : isHovered
                      ? `bg-gradient-to-r from-primary/30 to-amber-400/30 dark:from-primary/20 dark:to-amber-400/20`
                      : ''
                }`}
                animate={{
                  opacity: isSubscribed ? 1 : isHovered ? 0.8 : 0,
                  scale: isSubscribed ? 1 : isHovered ? 1.01 : 1,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Card */}
              <motion.div
                className={`relative rounded-xl bg-card border r37-sub-card ${isSubscribed ? 'border-emerald-400/50 dark:border-emerald-600/50' : 'border-border'} p-4 overflow-hidden`}
                animate={{
                  y: isHovered ? -4 : 0,
                  boxShadow: isHovered
                    ? '0 12px 32px rgba(0,0,0,0.1)'
                    : isSubscribed
                      ? '0 4px 16px rgba(16,185,129,0.15)'
                      : '0 1px 3px rgba(0,0,0,0.04)',
                }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
              >
                {/* Subscribed badge */}
                {isSubscribed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <AnimatedCheckmark />
                  </motion.div>
                )}

                {/* Tier badge */}
                <div className="mb-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                </div>

                {/* Icon + name */}
                <div className="flex items-center gap-2 mb-1">
                  <div className={`${tier.color}`}>{tier.icon}</div>
                  <h3 className="font-bold text-sm">{tier.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <motion.span
                    className="text-xl font-bold text-primary inline-block"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, type: 'spring' as const, stiffness: 300, damping: 20 }}
                  >
                    <R37PriceCounter value={tier.price} delay={300 + i * 80} />
                  </motion.span>
                  <span className="text-xs text-muted-foreground">{tier.period}</span>
                </div>

                {/* Savings badge */}
                <Badge variant="secondary" className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30 font-semibold mb-3">
                  Economize {tier.savings}%
                </Badge>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-3">{tier.description}</p>

                {/* Product list preview (first 3) */}
                <div className="space-y-1.5 mb-3">
                  {tier.products.slice(0, 3).map((p, pIdx) => (
                    <motion.div
                      key={p.name}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 + pIdx * 0.06, type: 'spring' as const, stiffness: 300, damping: 20 }}
                    >
                      <span className="text-sm">{p.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{p.name}</p>
                      </div>
                    </motion.div>
                  ))}
                  {/* Show more products count */}
                  {tier.products.length > 3 && (
                    <button
                      onClick={() => toggleAccordion(tier.id)}
                      className="flex items-center gap-1 text-[10px] text-primary font-medium hover:underline"
                    >
                      <Sparkles className="h-3 w-3" />
                      +{tier.products.length - 3} mais itens
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </motion.div>
                    </button>
                  )}
                </div>

                {/* Accordion: full product list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mb-3"
                    >
                      <div className="pt-2 border-t border-border/50 space-y-1.5">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          Conteúdo da Caixa
                        </p>
                        {tier.products.map((p) => (
                          <div key={p.name} className="flex items-center gap-2">
                            <span className="text-sm">{p.emoji}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subscribe button */}
                <AnimatePresence mode="wait">
                  {isSubscribed ? (
                    <motion.div
                      key={`subscribed-${tier.id}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnsubscribe(tier.id)}
                        className="w-full min-h-[44px] h-10 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Assinado · Cancelar
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`subscribe-${tier.id}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        onClick={() => handleSubscribe(tier.id)}
                        disabled={isSubscribing}
                        className="w-full min-h-[44px] h-10 text-xs bg-primary hover:bg-primary/90 text-primary-foreground btn-glow gap-1.5 r37-sub-cta relative overflow-hidden"
                      >
                        {!isSubscribing && (
                          <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent r37-sub-shimmer"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1 }}
                          />
                        )}
                        <span className="relative z-10">
                        {isSubscribing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Assinando...
                          </>
                        ) : (
                          <>
                            Assinar Agora
                          </>
                        )}
                        </span>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Info footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-3 rounded-xl bg-muted/30 border border-border/30"
      >
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Como funciona:</span> Escolha seu plano e receba uma caixa
              com produtos selecionados todo mês. Cancele quando quiser, sem multa. Entrega gratuita em Dom Eliseu.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
