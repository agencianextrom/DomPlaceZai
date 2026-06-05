'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Clock,
  Heart,
  ShoppingBag,
  ShoppingCart,
  Eye,
  Tag,
  TrendingDown,
  PartyPopper,
  Settings,
  Sun,
  Moon,
  Coffee,
  Star,
  Store,
  ChevronRight,
  Gift,
  Zap,
  BarChart3,
  Shield,
  UserCheck,
  Package,
  ArrowRight,
  RotateCcw,
  ListChecks,
  LogOut,
  Palette,
  Bell,
  Percent,
  PiggyBank,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RecommendedProduct {
  id: string
  name: string
  price: number
  comparePrice: number | null
  emoji: string
  tag: string
  store: string
}

interface RecentlyViewedProduct {
  id: string
  name: string
  price: number
  emoji: string
  lastVisited: string
  store: string
}

interface FavoriteStore {
  id: string
  name: string
  emoji: string
  hasNewProducts: boolean
  rating: number
}

interface PersonalizedDeal {
  id: string
  title: string
  description: string
  discount: string
  code: string
  emoji: string
  validUntil: string
}

interface InsightCard {
  id: string
  text: string
  emoji: string
  color: string
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_RECOMMENDED: RecommendedProduct[] = [
  { id: 'r1', name: 'Café Especial Artesanal', price: 32.9, comparePrice: 42.0, emoji: '☕', tag: 'Baseado nas suas compras', store: 'Café do Sítio' },
  { id: 'r2', name: 'Mel de Florada Silvestre', price: 28.5, comparePrice: null, emoji: '🍯', tag: 'Popular na sua região', store: 'Sabor da Terra' },
  { id: 'r3', name: 'Geleia de Pimenta Caseira', price: 18.9, comparePrice: 24.0, emoji: '🌶️', tag: 'Loja favorita', store: 'Dona Nena' },
  { id: 'r4', name: 'Queijo Minas Curado', price: 45.0, comparePrice: 55.0, emoji: '🧀', tag: 'Tendência do momento', store: 'Laticínios Serra' },
  { id: 'r5', name: 'Biscoito de Polvilho', price: 12.0, comparePrice: null, emoji: '🍪', tag: 'Quem comprou também comprou', store: 'Padaria Nova' },
  { id: 'r6', name: 'Azeite Extra Virgem 500ml', price: 54.9, comparePrice: 69.9, emoji: '🫒', tag: 'Recomendado para você', store: 'Empório Gourmet' },
]

const MOCK_RECENTLY_VIEWED: RecentlyViewedProduct[] = [
  { id: 'rv1', name: 'Cesta de Frutas Orgânicas', price: 79.9, emoji: '🍎', lastVisited: '2h atrás', store: 'Frutas & Cia' },
  { id: 'rv2', name: 'Pão de Queijo Congelado 1kg', price: 22.5, emoji: '🧀', lastVisited: '5h atrás', store: 'Sabores de Minas' },
  { id: 'rv3', name: 'Tapioca Granulada 500g', price: 8.9, emoji: '🌾', lastVisited: '1 dia atrás', store: 'Nordeste Express' },
  { id: 'rv4', name: 'Suco Natural de Uva 1L', price: 16.0, emoji: '🍇', lastVisited: '2 dias atrás', store: 'Vale das Uvas' },
]

const MOCK_FAVORITE_STORES: FavoriteStore[] = [
  { id: 'fs1', name: 'Café do Sítio', emoji: '☕', hasNewProducts: true, rating: 4.8 },
  { id: 'fs2', name: 'Empório Gourmet', emoji: '🫒', hasNewProducts: true, rating: 4.6 },
  { id: 'fs3', name: 'Dona Nena', emoji: '🌶️', hasNewProducts: false, rating: 4.9 },
]

const MOCK_DEALS: PersonalizedDeal[] = [
  { id: 'd1', title: 'Desconto Exclusivo', description: '10% off em toda a loja Café do Sítio', discount: '10%', code: 'MARIO10', emoji: '🏷️', validUntil: '30/06/2025' },
  { id: 'd2', title: 'Frete Grátis', description: 'Frete grátis acima de R$80 no Empório', discount: 'Frete 0', code: 'MARIOFRETE', emoji: '🚚', validUntil: '28/06/2025' },
  { id: 'd3', title: 'Combo Especial', description: 'Café + Biscoito por apenas R$39,90', discount: '15%', code: 'MARIOCOMBO', emoji: '🎁', validUntil: '25/06/2025' },
]

const MOCK_INSIGHTS: InsightCard[] = [
  { id: 'i1', text: 'Você economizou R$45 este mês', emoji: '💰', color: '#10b981' },
  { id: 'i2', text: 'Seus favoritos estão em promoção', emoji: '❤️', color: '#f43f5e' },
  { id: 'i3', text: '3 lojas têm novidades', emoji: '🆕', color: '#3b82f6' },
  { id: 'i4', text: 'Seu pedido mais rápido chegou em 32min', emoji: '⚡', color: '#f59e0b' },
]

/* ------------------------------------------------------------------ */
/*  Seasonal banners by month                                          */
/* ------------------------------------------------------------------ */

function getSeasonalBanner(): { title: string; emoji: string; gradient: string; description: string } {
  const month = new Date().getMonth()
  switch (month) {
    case 0: return { title: 'Promoções de Ano Novo', emoji: '🎆', gradient: 'linear-gradient(135deg, #fbbf24, #f97316)', description: 'Comece o ano com economia!' }
    case 1: return { title: 'Carnaval na DomPlace', emoji: '🎭', gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)', description: 'Descontos de carnaval!' }
    case 2: return { title: 'Promoções de Páscoa', emoji: '🐇', gradient: 'linear-gradient(135deg, #a78bfa, #6366f1)', description: 'Chocolate com desconto!' }
    case 3: return { title: 'Dia das Mães', emoji: '💐', gradient: 'linear-gradient(135deg, #f472b6, #e11d48)', description: 'Presentes especiais para mamãe' }
    case 4: return { title: 'Maio de Ofertas', emoji: '🔥', gradient: 'linear-gradient(135deg, #f97316, #ef4444)', description: 'As melhores ofertas do mês' }
    case 5: return { title: 'Promoções de Festa Junina', emoji: '🎪', gradient: 'linear-gradient(135deg, #f59e0b, #dc2626)', description: 'Arraiá de descontos!' }
    case 6: return { title: 'Dia dos Pais', emoji: '👔', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', description: 'Presentes incríveis para o papai' }
    case 7: return { title: 'Férias de Julho', emoji: '🏖️', gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)', description: 'Aproveite o frio com boas ofertas' }
    case 8: return { title: 'Primavera de Ofertas', emoji: '🌸', gradient: 'linear-gradient(135deg, #f9a8d4, #f472b6)', description: 'Descontos que florescem' }
    case 9: return { title: 'Promoções de Outubro', emoji: '🎃', gradient: 'linear-gradient(135deg, #f97316, #ea580c)', description: 'Ofertas assustadoras de bom preço!' }
    case 10: return { title: 'Black November', emoji: '🛍️', gradient: 'linear-gradient(135deg, #1e1b4b, #4338ca)', description: 'Prepare-se para a Black Friday!' }
    case 11: return { title: 'Natal na DomPlace', emoji: '🎄', gradient: 'linear-gradient(135deg, #dc2626, #16a34a)', description: 'Presentes com os melhores preços!' }
    default: return { title: 'Ofertas Especiais', emoji: '✨', gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)', description: 'Confira as novidades!' }
  }
}

/* ------------------------------------------------------------------ */
/*  Time-based greeting                                                */
/* ------------------------------------------------------------------ */

function getTimeGreeting(): { text: string; emoji: string; icon: React.ReactNode } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return { text: 'Bom dia', emoji: '☀️', icon: <Sun className="h-5 w-5" /> }
  } else if (hour >= 12 && hour < 18) {
    return { text: 'Boa tarde', emoji: '🌤️', icon: <Coffee className="h-5 w-5" /> }
  } else {
    return { text: 'Boa noite', emoji: '🌙', icon: <Moon className="h-5 w-5" /> }
  }
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemFadeIn = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 340, damping: 26 },
  },
}

const cardHover = {
  rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  hover: {
    scale: 1.03,
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
  },
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */

function PersonalizationSkeleton() {
  return (
    <div className="r46-skeleton-container space-y-8 p-4">
      {/* Greeting skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Banner skeleton */}
      <Skeleton className="h-32 w-full rounded-2xl" />

      {/* Insights skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Products skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-36" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-40 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Loading text */}
      <div className="flex items-center justify-center gap-2 py-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' as const }}
        >
          <Sparkles className="h-4 w-4 text-muted-foreground" />
        </motion.div>
        <p className="text-sm text-muted-foreground">Analisando suas preferências...</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Format BRL                                                         */
/* ------------------------------------------------------------------ */

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

function PersonalizedHomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  const greeting = useMemo(() => getTimeGreeting(), [])
  const seasonal = useMemo(() => getSeasonalBanner(), [])

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  /* ---- Loading state ---- */
  if (isLoading) {
    return <PersonalizationSkeleton />
  }

  /* ---- Non-personalized state ---- */
  if (!personalizationEnabled) {
    return (
      <motion.section
        className="r46-non-personalized p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
      >
        <Card className="r46-non-pers-card">
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2">Modo Anônimo</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              A personalização está desativada. Ative para ver recomendações baseadas nas suas preferências.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => setPersonalizationEnabled(true)}
                className="r46-enable-btn gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Ativar Personalização
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.section>
    )
  }

  /* ---- Main personalized view ---- */
  return (
    <motion.section
      className="r46-personalized-home space-y-8 p-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ──────────────────────────────────────────── */}
      {/* 1. Personalized Greeting                     */}
      {/* ──────────────────────────────────────────── */}
      <motion.div variants={sectionVariants} className="r46-greeting-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="h-12 w-12 rounded-full flex items-center justify-center r46-avatar-ring"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.3)',
              }}
              animate={{ boxShadow: ['0 0 0 3px rgba(139, 92, 246, 0.3)', '0 0 0 6px rgba(139, 92, 246, 0.1)', '0 0 0 3px rgba(139, 92, 246, 0.3)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              <span className="text-xl">M</span>
            </motion.div>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold r46-gradient-text"
                style={{
                  background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% 100%',
                }}
              >
                {greeting.text}, Maria! {greeting.emoji}
              </h1>
              <motion.p
                className="text-sm text-muted-foreground flex items-center gap-1.5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, type: 'spring' as const, stiffness: 200 }}
              >
                {greeting.icon}
                <span>Temos novidades selecionadas para você</span>
              </motion.p>
            </div>
          </div>

          {/* Personalization toggle */}
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={personalizationEnabled}
              onCheckedChange={setPersonalizationEnabled}
              aria-label="Ativar personalização"
              className="r46-pers-switch"
            />
          </div>
        </div>
      </motion.div>

      {/* ──────────────────────────────────────────── */}
      {/* 2. Seasonal Banner                           */}
      {/* ──────────────────────────────────────────── */}
      <motion.div variants={sectionVariants}>
        <motion.div
          className="r46-seasonal-banner relative overflow-hidden rounded-2xl p-6 text-white cursor-pointer"
          style={{ background: seasonal.gradient, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-1/2 w-24 h-24 rounded-full opacity-15" style={{ background: 'rgba(255,255,255,0.2)', transform: 'translate(-50%, 40%)' }} />

          <div className="relative z-10 flex items-center gap-4">
            <motion.span
              className="text-5xl"
              animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              {seasonal.emoji}
            </motion.span>
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold">{seasonal.title}</h3>
              <p className="text-sm opacity-90 mt-1">{seasonal.description}</p>
            </div>
            <ArrowRight className="h-6 w-6 opacity-80" />
          </div>
        </motion.div>
      </motion.div>

      {/* ──────────────────────────────────────────── */}
      {/* 3. Shopping Behavior Insights                */}
      {/* ──────────────────────────────────────────── */}
      <motion.div variants={sectionVariants} className="r46-insights-section">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold">Seus Insights</h2>
        </div>
        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {MOCK_INSIGHTS.map((insight) => (
            <motion.div
              key={insight.id}
              variants={itemFadeIn}
              className="r46-insight-card"
            >
              <Card
                className="overflow-hidden border-0"
                style={{
                  background: `linear-gradient(135deg, ${insight.color}15, ${insight.color}08)`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <CardContent className="p-3 flex items-center gap-2.5">
                  <motion.span
                    className="text-2xl"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const, delay: Math.random() * 1 }}
                  >
                    {insight.emoji}
                  </motion.span>
                  <p className="text-xs font-medium leading-tight">{insight.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ──────────────────────────────────────────── */}
      {/* 4. Quick Actions Row                         */}
      {/* ──────────────────────────────────────────── */}
      <motion.div variants={sectionVariants} className="r46-quick-actions">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {[
            { icon: <ShoppingCart className="h-4 w-4" />, label: 'Continuar compra', gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)', action: 'continue' },
            { icon: <Package className="h-4 w-4" />, label: 'Ver pedidos', gradient: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', action: 'orders' },
            { icon: <Heart className="h-4 w-4" />, label: 'Lista de desejos', gradient: 'linear-gradient(135deg, #f43f5e, #ec4899)', action: 'wishlist' },
          ].map((item) => (
            <motion.div key={item.action} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                className="r46-quick-action-btn gap-2 shrink-0 text-white border-0 shadow-none"
                style={{ background: item.gradient, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
              >
                {item.icon}
                <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ──────────────────────────────────────────── */}
      {/* 5. "Para Você" - Personalized Recommendations */}
      {/* ──────────────────────────────────────────── */}
      <motion.div variants={sectionVariants} className="r46-for-you-section">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              <Sparkles className="h-5 w-5 text-amber-500" />
            </motion.div>
            <h2 className="text-base font-bold">Para Você</h2>
            <Badge className="r46-rec-badge bg-primary/10 text-primary border-0 text-[10px] px-1.5">6 sugestões</Badge>
          </div>
          <button className="flex items-center gap-1 text-xs text-primary hover:underline">
            Ver tudo <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <motion.div
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {MOCK_RECOMMENDED.map((product, idx) => {
            const discount = product.comparePrice
              ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
              : 0

            return (
              <motion.div
                key={product.id}
                variants={itemFadeIn}
                className="r46-person-card shrink-0 w-[155px] sm:w-[175px]"
                initial="rest"
                whileHover="hover"
              >
                <Card className="overflow-hidden h-full" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div
                    className="relative aspect-square flex items-center justify-center r46-card-emoji-bg"
                    style={{
                      background: `linear-gradient(135deg, rgba(139,92,246,0.06), rgba(236,72,153,0.06))`,
                    }}
                  >
                    <motion.span
                      className="text-5xl"
                      variants={{
                        rest: { scale: 1 },
                        hover: { scale: 1.15, rotate: [0, -8, 8, 0], transition: { type: 'spring' as const, stiffness: 300 } },
                      }}
                    >
                      {product.emoji}
                    </motion.span>

                    {discount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-[9px] px-1.5 py-0 font-bold">
                        -{discount}%
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-2.5">
                    <h3 className="text-xs font-semibold line-clamp-2 leading-tight">{product.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5">
                      <Store className="h-2.5 w-2.5" />{product.store}
                    </p>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
                      {product.comparePrice && (
                        <span className="text-[9px] text-muted-foreground line-through">{formatBRL(product.comparePrice)}</span>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/8 text-primary font-medium">
                        {product.tag}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>

      {/* ──────────────────────────────────────────── */}
      {/* 6. "Voltou a ver" - Recently Viewed           */}
      {/* ──────────────────────────────────────────── */}
      <motion.div variants={sectionVariants} className="r46-recently-viewed-section">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <h2 className="text-base font-bold">Voltou a ver</h2>
          </div>
          <button className="flex items-center gap-1 text-xs text-primary hover:underline">
            Histórico <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {MOCK_RECENTLY_VIEWED.map((product) => (
            <motion.div key={product.id} variants={itemFadeIn} className="r46-recent-card">
              <Card className="overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex p-3 gap-3">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 r46-recent-emoji-bg"
                    style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(14,165,233,0.08))' }}
                  >
                    <span className="text-2xl">{product.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold line-clamp-2 leading-tight">{product.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" />
                      Última visita: {product.lastVisited}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-sm font-bold text-primary">{formatBRL(product.price)}</span>
                    </div>
                  </div>
                </div>
                <div className="px-3 pb-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="sm" className="r46-quick-cart-btn w-full text-[11px] h-7 gap-1">
                      <ShoppingCart className="h-3 w-3" />
                      Adicionar rápido
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ──────────────────────────────────────────── */}
      {/* 7. "Lojas Favoritas"                         */}
      {/* ──────────────────────────────────────────── */}
      <motion.div variants={sectionVariants} className="r46-fav-stores-section">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-pink-500" />
          <h2 className="text-base font-bold">Lojas Favoritas</h2>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {MOCK_FAVORITE_STORES.map((store) => (
            <motion.div
              key={store.id}
              variants={itemFadeIn}
              className="r46-store-card"
              initial="rest"
              whileHover="hover"
            >
              <motion.div
                variants={cardHover}
                className="h-full"
              >
                <Card className="overflow-hidden h-full" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(236,72,153,0.1))' }}
                      >
                        <span className="text-2xl">{store.emoji}</span>
                      </div>
                      {store.hasNewProducts && (
                        <motion.div
                          className="absolute -top-1.5 -right-1.5"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                        >
                          <Badge className="r46-new-badge bg-amber-500 text-white border-0 text-[8px] px-1 py-0 font-bold">
                            Novo!
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold">{store.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-[11px] text-muted-foreground">{store.rating}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ──────────────────────────────────────────── */}
      {/* 8. "Ofertas baseadas no seu perfil"          */}
      {/* ──────────────────────────────────────────── */}
      <motion.div variants={sectionVariants} className="r46-personalized-deals">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-green-500" />
          <h2 className="text-base font-bold">Ofertas baseadas no seu perfil</h2>
          <Badge className="r46-profile-badge bg-green-500/10 text-green-600 border-0 text-[9px] px-1.5">
            <Zap className="h-2.5 w-2.5 mr-0.5" /> Exclusivo
          </Badge>
        </div>

        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {MOCK_DEALS.map((deal) => (
            <motion.div key={deal.id} variants={itemFadeIn} className="r46-deal-card">
              <Card
                className="overflow-hidden border-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(59,130,246,0.06))',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <motion.span
                      className="text-3xl shrink-0 mt-0.5"
                      animate={{ rotate: [-3, 3, -3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: Math.random() }}
                    >
                      {deal.emoji}
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold">{deal.title}</h3>
                        <Badge className="r46-deal-discount bg-red-500 text-white border-0 text-[10px] px-1.5 py-0 font-bold">
                          <Percent className="h-2.5 w-2.5 mr-0.5" />
                          {deal.discount}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{deal.description}</p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                            color: '#ffffff',
                            boxShadow: '0 2px 8px rgba(30,27,75,0.3)',
                          }}
                        >
                          <Gift className="h-3 w-3" />
                          {deal.code}
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="r46-copy-code-btn text-[10px] h-6 gap-1"
                            onClick={() => handleCopyCode(deal.code)}
                          >
                            {copiedCode === deal.code ? (
                              <>
                                <PartyPopper className="h-3 w-3 text-green-500" />
                                <span className="text-green-600">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-3 w-3" />
                                Copiar
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        Válido até {deal.validUntil}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ──────────────────────────────────────────── */}
      {/* 9. Additional Quick Insights                  */}
      {/* ──────────────────────────────────────────── */}
      <motion.div variants={sectionVariants} className="r46-extra-insights">
        <div className="flex items-center gap-2 mb-3">
          <PiggyBank className="h-4 w-4 text-amber-500" />
          <h2 className="text-base font-bold">Resumo do Mês</h2>
        </div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { label: 'Economizado', value: 'R$ 45', icon: <TrendingDown className="h-4 w-4" />, color: '#10b981' },
            { label: 'Pedidos', value: '7', icon: <ShoppingBag className="h-4 w-4" />, color: '#3b82f6' },
            { label: 'Favoritos', value: '12', icon: <Heart className="h-4 w-4" />, color: '#f43f5e' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemFadeIn} className="r46-stat-card">
              <Card className="overflow-hidden border-0 h-full" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <CardContent className="p-3 text-center">
                  <div
                    className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center mb-2"
                    style={{ background: `${stat.color}15`, color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ──────────────────────────────────────────── */}
      {/* 10. Personalization Settings                  */}
      {/* ──────────────────────────────────────────── */}
      <motion.div variants={sectionVariants} className="r46-settings-section">
        <Card
          className="overflow-hidden r46-settings-card"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.1))' }}
                >
                  <Settings className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Personalização</h3>
                  <p className="text-[10px] text-muted-foreground">Não é você? Desative a personalização</p>
                </div>
              </div>
              <Switch
                checked={personalizationEnabled}
                onCheckedChange={setPersonalizationEnabled}
                aria-label="Desativar personalização"
                className="r46-pers-switch-main"
              />
            </div>

            <div className="mt-3 pt-3 flex items-center gap-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,88,12,0.1))' }}
              >
                <Palette className="h-4 w-4 text-orange-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-medium">Preferências de tema</h4>
                <p className="text-[10px] text-muted-foreground">Claro, escuro ou automático</p>
              </div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button variant="ghost" size="sm" className="r46-theme-btn text-[10px] gap-1 h-7">
                  <Palette className="h-3 w-3" />
                  Ajustar
                </Button>
              </motion.div>
            </div>

            <div className="mt-3 pt-3 flex items-center gap-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(14,165,233,0.1))' }}
              >
                <Bell className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-medium">Notificações personalizadas</h4>
                <p className="text-[10px] text-muted-foreground">Alertas de preço e novidades</p>
              </div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button variant="ghost" size="sm" className="r46-notif-btn text-[10px] gap-1 h-7">
                  <Bell className="h-3 w-3" />
                  Configurar
                </Button>
              </motion.div>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="mt-3 pt-3 flex items-center gap-2 text-muted-foreground"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
            >
              <LogOut className="h-3.5 w-3.5" />
              <button className="text-[11px] hover:text-foreground transition-colors">
                Trocar conta
              </button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ──────────────────────────────────────────── */}
      {/* 11. Bottom spacing                            */}
      {/* ──────────────────────────────────────────── */}
      <div className="h-4" />
    </motion.section>
  )
}

export default PersonalizedHomePage
