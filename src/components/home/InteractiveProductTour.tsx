'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Search,
  CreditCard,
  Truck,
  Gift,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  SkipForward,
  Star,
  Trophy,
  Package,
  ArrowRight,
  MapPin,
  Heart,
  BadgePercent,
  Eye,
  MousePointer,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'

// ─── Constants ───────────────────────────────────────────────────────────────

const TOUR_STORAGE_KEY = 'domplace-product-tour-completed'
const TOTAL_STEPS = 6 as const
const AUTO_PLAY_DELAY = 5000

// Tour step definitions
type TourStepId = 'welcome' | 'browse' | 'cart' | 'checkout' | 'delivery' | 'rewards'

interface TourStep {
  id: TourStepId
  title: string
  subtitle: string
  mascotMessage: string
  gradient: string
  iconColor: string
  accentColor: string
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao DomPlace!',
    subtitle: 'Vamos te mostrar como funciona o marketplace local mais completo de Dom Eliseu.',
    mascotMessage: 'Olá! Eu sou o Domi, seu guia! Vou te mostrar tudo em 6 passos rápidos!',
    gradient: 'from-emerald-500 to-teal-600',
    iconColor: '#10b981',
    accentColor: 'rgba(16, 185, 129, 0.12)',
  },
  {
    id: 'browse',
    title: 'Explore Produtos',
    subtitle: 'Navegue por categorias, busque por nome e descubra ofertas incríveis perto de você.',
    mascotMessage: 'Use a barra de busca ou explore as categorias. Tem de tudo!',
    gradient: 'from-amber-500 to-orange-600',
    iconColor: '#f59e0b',
    accentColor: 'rgba(245, 158, 11, 0.12)',
  },
  {
    id: 'cart',
    title: 'Adicione ao Carrinho',
    subtitle: 'Encontrou algo que gostou? Adicione ao carrinho com um clique rápido.',
    mascotMessage: 'Toque no botão de adicionar e veja seu carrinho crescer!',
    gradient: 'from-rose-500 to-pink-600',
    iconColor: '#f43f5e',
    accentColor: 'rgba(244, 63, 94, 0.12)',
  },
  {
    id: 'checkout',
    title: 'Finalize a Compra',
    subtitle: 'Escolha o pagamento, confirme o endereço e finalize em poucos cliques.',
    mascotMessage: 'Escolha PIX, cartão ou dinheiro. Super seguro e rápido!',
    gradient: 'from-violet-500 to-purple-600',
    iconColor: '#8b5cf6',
    accentColor: 'rgba(139, 92, 246, 0.12)',
  },
  {
    id: 'delivery',
    title: 'Acompanhe a Entrega',
    subtitle: 'Veja em tempo real onde seu pedido está e quando vai chegar.',
    mascotMessage: 'Acompanhe cada etapa da entrega em tempo real!',
    gradient: 'from-cyan-500 to-blue-600',
    iconColor: '#06b6d4',
    accentColor: 'rgba(6, 182, 212, 0.12)',
  },
  {
    id: 'rewards',
    title: 'Ganhe Recompensas',
    subtitle: 'Check-in diário, pontos em compras e prêmios exclusivos esperam por você.',
    mascotMessage: 'Check-in diário rende pontos e prêmios! Comece hoje mesmo!',
    gradient: 'from-emerald-400 to-amber-500',
    iconColor: '#84cc16',
    accentColor: 'rgba(132, 204, 22, 0.12)',
  },
]

// Step icons mapping
const stepIcons: Record<TourStepId, React.ElementType> = {
  welcome: Sparkles,
  browse: Search,
  cart: ShoppingCart,
  checkout: CreditCard,
  delivery: Truck,
  rewards: Gift,
}

// Mascot expressions per step
const mascotExpressions: Record<TourStepId, string> = {
  welcome: '👋',
  browse: '👀',
  cart: '🛒',
  checkout: '💳',
  delivery: '🚚',
  rewards: '🏆',
}

// ─── Animation variants ──────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 280 : -280,
    opacity: 0,
    scale: 0.94,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 280 : -280,
    opacity: 0,
    scale: 0.94,
  }),
}

const fadeSlideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

const mascotBounce = {
  idle: {
    y: [0, -6, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
  talking: {
    y: [0, -3, 0],
    scale: [1, 1.03, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

const progressFillVariants = {
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 20,
    },
  }),
}

// ─── Confetti colors ─────────────────────────────────────────────────────────

const confettiColors = [
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#14b8a6',
]

// ─── Floating Particle ──────────────────────────────────────────────────────

function FloatingParticle({
  delay,
  color,
  size,
  x,
  y,
}: {
  delay: number
  color: string
  size: number
  x: number
  y: number
}) {
  return (
    <motion.div
      className="r49-tour-particle absolute rounded-full pointer-events-none"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
      }}
      animate={{
        y: [0, -18, 0],
        x: [0, 8, 0],
        opacity: [0.15, 0.5, 0.15],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: 'easeInOut' as const,
      }}
    />
  )
}

// ─── Mascot Character ───────────────────────────────────────────────────────

function TourMascot({ stepId, isTalking }: { stepId: TourStepId; isTalking: boolean }) {
  const expression = mascotExpressions[stepId]
  const animate = isTalking ? mascotBounce.talking : mascotBounce.idle

  return (
    <motion.div
      className="r49-tour-mascot relative flex flex-col items-center"
      animate={animate}
      style={{ transformOrigin: 'center bottom' }}
    >
      {/* Mascot body */}
      <div className="r49-tour-mascot-body relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
        style={{ boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25), 0 2px 8px rgba(16, 185, 129, 0.15)' }}
      >
        {/* Eyes */}
        <div className="r49-tour-mascot-eyes flex gap-3 mt-1">
          <motion.div
            className="r49-tour-mascot-eye w-3 h-3 rounded-full bg-white"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.div
            className="r49-tour-mascot-eye w-3 h-3 rounded-full bg-white"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, delay: 0.05 }}
          />
        </div>
        {/* Mouth */}
        <div className="r49-tour-mascot-mouth absolute bottom-5 w-4 h-2 rounded-full bg-white/80" />
        {/* Expression bubble */}
        <motion.span
          className="r49-tour-mascot-expression absolute -top-2 -right-2 text-xl"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
        >
          {expression}
        </motion.span>
      </div>
      {/* Name tag */}
      <span className="r49-tour-mascot-name mt-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
        Domi
      </span>
    </motion.div>
  )
}

// ─── Speech Bubble ──────────────────────────────────────────────────────────

function SpeechBubble({ message }: { message: string }) {
  return (
    <motion.div
      className="r49-tour-speech-bubble relative bg-card border border-border rounded-2xl px-4 py-3 max-w-[260px] shadow-sm"
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -10 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
    >
      {/* Tail */}
      <div
        className="r49-tour-speech-tail absolute -bottom-1.5 left-8 w-3 h-3 bg-card border-b border-r border-border rotate-45"
      />
      <p className="r49-tour-speech-text text-sm text-foreground leading-relaxed">{message}</p>
    </motion.div>
  )
}

// ─── Welcome Step Demo ───────────────────────────────────────────────────────

function WelcomeDemo() {
  return (
    <div className="r49-tour-demo-welcome relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-4 border border-emerald-200/40 dark:border-emerald-800/30">
      <div className="r49-tour-demo-welcome-inner flex items-center gap-3">
        <motion.div
          className="r49-tour-demo-welcome-icon w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
          style={{ boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>
        <div className="flex-1">
          <h4 className="r49-tour-demo-welcome-title text-sm font-bold text-foreground">DomPlace Marketplace</h4>
          <p className="r49-tour-demo-welcome-desc text-xs text-muted-foreground mt-0.5">
            Compre local, receba rápido!
          </p>
          <div className="r49-tour-demo-welcome-badges flex gap-1.5 mt-2">
            {['🏪', '🛍️', '🚚', '⭐'].map((emoji, i) => (
              <motion.span
                key={i}
                className="r49-tour-demo-welcome-badge text-base"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.15, type: 'spring' as const, stiffness: 400 }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Browse Step Demo ────────────────────────────────────────────────────────

function BrowseDemo({ onDemoClick }: { onDemoClick: () => void }) {
  const categories = [
    { name: 'Alimentação', emoji: '🍕', color: 'bg-orange-100 dark:bg-orange-900/30' },
    { name: 'Bebidas', emoji: '🥤', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { name: 'Padaria', emoji: '🥖', color: 'bg-amber-100 dark:bg-amber-900/30' },
    { name: 'Saúde', emoji: '💊', color: 'bg-green-100 dark:bg-green-900/30' },
    { name: 'Pets', emoji: '🐾', color: 'bg-pink-100 dark:bg-pink-900/30' },
    { name: 'Eletrônicos', emoji: '📱', color: 'bg-violet-100 dark:bg-violet-900/30' },
  ]

  return (
    <div className="r49-tour-demo-browse space-y-3">
      {/* Simulated search bar */}
      <motion.div
        className="r49-tour-demo-search flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5 border border-border"
        animate={{ boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.15), 0 2px 8px rgba(245, 158, 11, 0.08)' }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' as const }}
      >
        <Search className="r49-tour-demo-search-icon w-4 h-4 text-muted-foreground" />
        <motion.span
          className="r49-tour-demo-search-text text-xs text-muted-foreground"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Busque produtos, lojas...
        </motion.span>
      </motion.div>

      {/* Category grid */}
      <div className="r49-tour-demo-categories grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            className={`r49-tour-demo-category ${cat.color} rounded-xl p-3 flex flex-col items-center gap-1 cursor-pointer border border-transparent hover:border-primary/30 transition-colors`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, type: 'spring' as const, stiffness: 300, damping: 22 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDemoClick}
          >
            <span className="r49-tour-demo-cat-emoji text-xl">{cat.emoji}</span>
            <span className="r49-tour-demo-cat-name text-[10px] font-medium text-foreground">{cat.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Cart Step Demo ───────────────────────────────────────────────────────────

function CartDemo({ onDemoClick }: { onDemoClick: () => void }) {
  const [items, setItems] = useState< number[]>([])
  const products = [
    { name: 'Açaí 500ml', price: 'R$ 18,90', emoji: '🍇' },
    { name: 'Pão Francês (6)', price: 'R$ 4,50', emoji: '🥖' },
    { name: 'Suco Natural', price: 'R$ 9,90', emoji: '🧃' },
  ]

  const handleAddItem = useCallback(() => {
    if (items.length < products.length) {
      setItems((prev) => [...prev, prev.length])
      onDemoClick()
    }
  }, [items.length, products.length, onDemoClick])

  return (
    <div className="r49-tour-demo-cart space-y-3">
      {/* Product items to add */}
      <div className="r49-tour-demo-cart-products space-y-2">
        {products.map((product, i) => {
          const isAdded = items.includes(i)
          return (
            <motion.div
              key={product.name}
              className={`r49-tour-demo-cart-item flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                isAdded
                  ? 'bg-primary/5 border-primary/30'
                  : 'bg-card border-border'
              }`}
              animate={isAdded ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <span className="r49-tour-demo-cart-emoji text-lg">{product.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="r49-tour-demo-cart-product-name text-xs font-semibold text-foreground truncate">{product.name}</p>
                <p className="r49-tour-demo-cart-product-price text-[10px] text-muted-foreground">{product.price}</p>
              </div>
              {isAdded ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <button
                    className="r49-tour-demo-cart-add-btn w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
                    onClick={handleAddItem}
                    aria-label={`Adicionar ${product.name}`}
                  >
                    <span className="text-sm">+</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Cart summary */}
      <motion.div
        className="r49-tour-demo-cart-summary flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2"
        animate={items.length > 0 ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <ShoppingCart className="r49-tour-demo-cart-summary-icon w-5 h-5 text-primary" />
            {items.length > 0 && (
              <motion.span
                className="r49-tour-demo-cart-badge absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 500 }}
              >
                {items.length}
              </motion.span>
            )}
          </div>
          <span className="r49-tour-demo-cart-count text-xs text-muted-foreground">
            {items.length === 0
              ? 'Carrinho vazio'
              : `${items.length} ${items.length === 1 ? 'item' : 'itens'} adicionados`}
          </span>
        </div>
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1"
          >
            <ArrowRight className="w-3 h-3 text-primary" />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Checkout Step Demo ───────────────────────────────────────────────────────

function CheckoutDemo({ onDemoClick }: { onDemoClick: () => void }) {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const paymentMethods = [
    { id: 'pix', label: 'PIX', icon: '⚡', desc: 'Aprovação instantânea' },
    { id: 'card', label: 'Cartão', icon: '💳', desc: 'Débito ou crédito' },
    { id: 'cash', label: 'Dinheiro', icon: '💵', desc: 'Na entrega' },
  ]

  const handleSelectPayment = useCallback(
    (id: string) => {
      setSelectedPayment(id)
      onDemoClick()
    },
    [onDemoClick]
  )

  return (
    <div className="r49-tour-demo-checkout space-y-3">
      {/* Order summary mini */}
      <div className="r49-tour-demo-checkout-summary bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-xl p-3 border border-violet-200/30 dark:border-violet-800/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total do pedido:</span>
          <motion.span
            className="font-bold text-foreground"
            animate={selectedPayment ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            R$ 33,30
          </motion.span>
        </div>
      </div>

      {/* Payment methods */}
      <p className="r49-tour-demo-checkout-label text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Forma de pagamento
      </p>
      <div className="r49-tour-demo-checkout-methods space-y-2">
        {paymentMethods.map((method, i) => {
          const isSelected = selectedPayment === method.id
          return (
            <motion.button
              key={method.id}
              className={`r49-tour-demo-checkout-option w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'bg-primary/8 border-primary/40 shadow-sm'
                  : 'bg-card border-border hover:border-primary/20'
              }`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1, type: 'spring' as const, stiffness: 300 }}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectPayment(method.id)}
            >
              <span className="r49-tour-demo-checkout-icon text-lg">{method.icon}</span>
              <div className="flex-1">
                <p className="r49-tour-demo-checkout-option-label text-xs font-semibold text-foreground">
                  {method.label}
                </p>
                <p className="r49-tour-demo-checkout-option-desc text-[10px] text-muted-foreground">
                  {method.desc}
                </p>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Confirm button simulation */}
      {selectedPayment && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
        >
          <div className="r49-tour-demo-checkout-confirm bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-semibold text-center py-2.5 rounded-xl"
            style={{ boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
          >
            Pedido confirmado!
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Delivery Step Demo ──────────────────────────────────────────────────────

function DeliveryDemo({ onDemoClick }: { onDemoClick: () => void }) {
  const [trackingStep, setTrackingStep] = useState(0)

  const deliverySteps = [
    { label: 'Pedido recebido', time: 'Agora', icon: Package },
    { label: 'Preparando', time: '~15 min', icon: Clock },
    { label: 'Saiu para entrega', time: '~30 min', icon: Truck },
    { label: 'Entregue!', time: '~45 min', icon: MapPin },
  ]

  useEffect(() => {
    if (trackingStep < deliverySteps.length - 1) {
      const timer = setTimeout(() => {
        setTrackingStep((prev) => prev + 1)
        onDemoClick()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [trackingStep, deliverySteps.length, onDemoClick])

  return (
    <div className="r49-tour-demo-delivery space-y-3">
      {/* Delivery timeline */}
      <div className="r49-tour-demo-delivery-timeline relative">
        {deliverySteps.map((step, i) => {
          const StepIcon = step.icon
          const isActive = i === trackingStep
          const isCompleted = i < trackingStep
          const isPending = i > trackingStep

          return (
            <div key={step.label} className="r49-tour-demo-delivery-step flex gap-3 relative pb-6 last:pb-0">
              {/* Line connector */}
              {i < deliverySteps.length - 1 && (
                <div className="r49-tour-demo-delivery-line absolute left-[11px] top-6 w-0.5 h-full bg-border">
                  <motion.div
                    className="r49-tour-demo-delivery-line-fill w-full bg-cyan-500 rounded-full"
                    initial={{ height: '0%' }}
                    animate={{ height: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' as const }}
                  />
                </div>
              )}

              {/* Step dot */}
              <motion.div
                className={`r49-tour-demo-delivery-dot relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-cyan-500 text-white'
                    : isActive
                      ? 'bg-cyan-500/20 text-cyan-500 ring-2 ring-cyan-500/40'
                      : 'bg-muted text-muted-foreground'
                }`}
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.8, repeat: isActive ? Infinity : 0, repeatType: 'reverse' as const }}
                style={
                  isActive
                    ? { boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)' }
                    : {}
                }
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <StepIcon className="w-3 h-3" />
                )}
              </motion.div>

              {/* Step info */}
              <div className="r49-tour-demo-delivery-info flex-1 pt-0.5">
                <p className={`r49-tour-demo-delivery-label text-xs font-semibold ${
                  isPending ? 'text-muted-foreground' : 'text-foreground'
                }`}>
                  {step.label}
                </p>
                <p className="r49-tour-demo-delivery-time text-[10px] text-muted-foreground">{step.time}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Map placeholder */}
      <motion.div
        className="r49-tour-demo-delivery-map relative h-24 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200/30 dark:border-cyan-800/30 overflow-hidden flex items-center justify-center"
        animate={{ boxShadow: '0 0 16px rgba(6, 182, 212, 0.1)' }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' as const }}
      >
        <div className="r49-tour-demo-delivery-map-inner flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="text-[10px]">Rastreamento em tempo real</span>
        </div>
        {/* Animated truck icon */}
        <motion.div
          className="r49-tour-demo-delivery-truck absolute bottom-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: ['10%', '80%'], opacity: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <Truck className="w-4 h-4 text-cyan-500" />
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── Rewards Step Demo ────────────────────────────────────────────────────────

function RewardsDemo({ onDemoClick }: { onDemoClick: () => void }) {
  const [checkedDays, setCheckedDays] = useState<number[]>([])
  const rewardDays = [
    { day: 1, reward: 'R$2 off', color: '#10b981' },
    { day: 2, reward: '50 pts', color: '#06b6d4' },
    { day: 3, reward: 'Frete grátis', color: '#8b5cf6' },
    { day: 4, reward: 'R$5 off', color: '#f59e0b' },
    { day: 5, reward: 'R$10 off', color: '#f43f5e' },
    { day: 6, reward: '100 pts', color: '#ec4899' },
    { day: 7, reward: 'SURPRESA', color: '#84cc16' },
  ]

  const handleCheckIn = useCallback(() => {
    const nextDay = checkedDays.length + 1
    if (nextDay <= 7) {
      setCheckedDays((prev) => [...prev, nextDay])
      onDemoClick()
    }
  }, [checkedDays.length, onDemoClick])

  const allDone = checkedDays.length === 7

  return (
    <div className="r49-tour-demo-rewards space-y-3">
      {/* Day grid */}
      <div className="r49-tour-demo-rewards-grid grid grid-cols-7 gap-1.5">
        {rewardDays.map((item) => {
          const isChecked = checkedDays.includes(item.day)
          const isNext = !isChecked && checkedDays.length === item.day - 1
          return (
            <motion.button
              key={item.day}
              className={`r49-tour-demo-rewards-day flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                isChecked
                  ? 'border-primary/40 bg-primary/10'
                  : isNext
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-card'
              }`}
              animate={
                isNext
                  ? { boxShadow: '0 0 8px rgba(16, 185, 129, 0.2)' }
                  : isChecked
                    ? {}
                    : { opacity: 0.5 }
              }
              whileHover={!isChecked ? { scale: 1.05 } : {}}
              whileTap={isNext ? { scale: 0.9 } : {}}
              onClick={isNext ? handleCheckIn : undefined}
              disabled={!isNext}
            >
              <span className="r49-tour-demo-rewards-day-num text-[10px] font-bold text-foreground">
                {item.day}
              </span>
              {isChecked ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 500 }}
                >
                  <Star className="w-3 h-3" style={{ color: item.color }} fill={item.color} />
                </motion.div>
              ) : (
                <span className="r49-tour-demo-rewards-day-dot w-2 h-2 rounded-full bg-muted" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Check-in prompt */}
      {!allDone && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <button
            className="r49-tour-demo-rewards-checkin w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500"
            style={{ boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
            onClick={handleCheckIn}
          >
            {checkedDays.length === 0
              ? 'Fazer check-in diário!'
              : `Dia ${checkedDays.length + 1}/7 — Check-in!`}
          </button>
        </motion.div>
      )}

      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="r49-tour-demo-rewards-complete text-center bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/20 dark:to-amber-950/20 rounded-xl p-3 border border-primary/20"
        >
          <Trophy className="r49-tour-demo-rewards-trophy w-8 h-8 text-amber-500 mx-auto" />
          <p className="r49-tour-demo-rewards-complete-text text-xs font-bold text-foreground mt-1">
            Semana completa!
          </p>
          <p className="r49-tour-demo-rewards-complete-sub text-[10px] text-muted-foreground">
            Prêmio surpresa desbloqueado!
          </p>
        </motion.div>
      )}
    </div>
  )
}

// ─── Step Icon Component ──────────────────────────────────────────────────────

function StepIconDisplay({ stepId, size = 'md' }: { stepId: TourStepId; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = stepIcons[stepId]
  const sizeClasses = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' }
  const iconSizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

  return (
    <div
      className={`r49-tour-step-icon rounded-2xl flex items-center justify-center ${sizeClasses[size]}`}
      style={{
        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2), 0 2px 4px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Icon className={iconSizes[size]} />
    </div>
  )
}

// ─── Completion Badge ────────────────────────────────────────────────────────

function CompletionBadge({ onComplete }: { onComplete: () => void }) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
      onComplete()
    }, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="r49-tour-completion relative flex flex-col items-center justify-center py-8 px-6">
      {/* Confetti burst */}
      <ConfettiBurst
        active={showConfetti}
        particleCount={60}
        duration={2000}
        spread={250}
        origin="center"
      />

      {/* Trophy with glow */}
      <motion.div
        className="r49-tour-completion-trophy relative"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 15, delay: 0.2 }}
      >
        <motion.div
          className="r49-tour-completion-trophy-ring w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
          animate={{
            boxShadow: '0 0 36px rgba(245, 158, 11, 0.4)',
          }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' as const }}
        >
          <Trophy className="w-14 h-14 text-white" />
        </motion.div>

        {/* Star bursts around trophy */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <motion.div
            key={i}
            className="r49-tour-completion-star absolute"
            style={{ transformOrigin: 'center center' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: [deg, deg + 360] }}
            transition={{ delay: 0.5 + i * 0.1, duration: 6, repeat: Infinity, ease: 'linear' as const }}
          >
            <Star
              className="w-3 h-3 text-amber-400"
              fill="#fbbf24"
              style={{
                transform: `rotate(${deg}deg) translateY(-48px)`,
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Badge label */}
      <motion.div
        className="r49-tour-completion-label mt-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring' as const, stiffness: 200 }}
      >
        <h3 className="r49-tour-completion-title text-2xl font-bold text-foreground">
          Tour Completo!
        </h3>
        <p className="r49-tour-completion-desc text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
          Parabéns! Você já conhece tudo sobre o DomPlace. Hora de fazer suas primeiras compras!
        </p>
      </motion.div>

      {/* Reward pills */}
      <motion.div
        className="r49-tour-completion-rewards flex gap-2 mt-4 flex-wrap justify-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {[
          { icon: BadgePercent, label: '10% OFF', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
          { icon: Gift, label: '50 pts', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
          { icon: Truck, label: 'Frete grátis', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' },
        ].map((reward, i) => {
          const RewardIcon = reward.icon
          return (
            <motion.div
              key={reward.label}
              className={`r49-tour-completion-reward-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold ${reward.color}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.15, type: 'spring' as const, stiffness: 300 }}
            >
              <RewardIcon className="w-3.5 h-3.5" />
              {reward.label}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

// ─── Progress Indicator ───────────────────────────────────────────────────────

function ProgressIndicator({
  currentStep,
  totalSteps,
  onStepClick,
}: {
  currentStep: number
  totalSteps: number
  onStepClick: (step: number) => void
}) {
  return (
    <div className="r49-tour-progress w-full">
      {/* Step dots */}
      <div className="r49-tour-progress-dots flex items-center justify-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep

          return (
            <div key={i} className="flex items-center">
              {/* Connecting line */}
              {i > 0 && (
                <div className="r49-tour-progress-connector w-5 h-0.5 rounded-full bg-border relative overflow-hidden">
                  <motion.div
                    className="r49-tour-progress-connector-fill absolute inset-0 rounded-full"
                    style={{ background: isCompleted ? '#10b981' : 'transparent', transformOrigin: 'left' }}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
                    initial={{ scaleX: 0 }}
                  />
                </div>
              )}

              {/* Dot */}
              <motion.button
                className={`r49-tour-progress-dot relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                      ? 'bg-primary/80 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}
                animate={
                  isCurrent
                    ? {
                        boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.15), 0 2px 8px rgba(16, 185, 129, 0.2)',
                      }
                    : {}
                }
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onStepClick(i)}
                aria-label={`Ir para passo ${i + 1}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  i + 1
                )}
                {isCurrent && (
                  <motion.div
                    className="r49-tour-progress-dot-pulse absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' as const }}
                  />
                )}
              </motion.button>
            </div>
          )
        })}
      </div>

      {/* Step counter text */}
      <p className="r49-tour-progress-text text-center text-[10px] text-muted-foreground mt-2 font-medium">
        Passo {currentStep + 1} de {totalSteps}
      </p>
    </div>
  )
}

// ─── Navigation Controls ─────────────────────────────────────────────────────

function NavigationControls({
  currentStep,
  totalSteps,
  isAutoPlaying,
  onBack,
  onNext,
  onSkip,
  onToggleAutoPlay,
  onComplete,
}: {
  currentStep: number
  totalSteps: number
  isAutoPlaying: boolean
  onBack: () => void
  onNext: () => void
  onSkip: () => void
  onToggleAutoPlay: () => void
  onComplete: () => void
}) {
  const isLastStep = currentStep === totalSteps - 1
  const isFirstStep = currentStep === 0

  return (
    <div className="r49-tour-nav flex items-center justify-between gap-2">
      {/* Left: Back or empty */}
      <div className="r49-tour-nav-left flex-1">
        {!isFirstStep ? (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="r49-tour-nav-back text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="r49-tour-nav-skip text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Pular tour
            </Button>
          </motion.div>
        )}
      </div>

      {/* Center: Auto-play toggle */}
      <motion.button
        className={`r49-tour-nav-autoplay w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
          isAutoPlaying
            ? 'bg-primary/10 border-primary/30 text-primary'
            : 'bg-card border-border text-muted-foreground hover:text-foreground'
        }`}
        onClick={onToggleAutoPlay}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isAutoPlaying ? 'Pausar tour automático' : 'Iniciar tour automático'}
      >
        {isAutoPlaying ? (
          <Pause className="w-3.5 h-3.5" />
        ) : (
          <Play className="w-3.5 h-3.5" />
        )}
      </motion.button>

      {/* Right: Next or Complete */}
      <div className="r49-tour-nav-right flex-1 flex justify-end">
        {isLastStep ? (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onComplete}
              className="r49-tour-nav-complete bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white font-semibold rounded-xl px-5 shadow-lg"
              style={{ boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)' }}
            >
              <Trophy className="w-4 h-4 mr-1.5" />
              Concluir
            </Button>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onNext}
              className="r49-tour-nav-next bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white font-semibold rounded-xl px-5 shadow-lg"
              style={{ boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)' }}
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ─── Floating Tour Button ────────────────────────────────────────────────────

export function TourFloatingButton({ onClick }: { onClick: () => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Small delay before showing the button
    const timer = setTimeout(() => setIsVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="r49-tour-float-btn fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 20 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.3 }}
        >
          <motion.button
            className="r49-tour-float-btn-inner group flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-gradient-to-r from-primary to-emerald-600 text-white font-semibold text-sm shadow-xl relative overflow-hidden"
            onClick={onClick}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{ boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), 0 2px 8px rgba(0, 0, 0, 0.1)' }}
          >
            {/* Shimmer sweep */}
            <motion.div
              className="r49-tour-float-btn-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1.5 }}
            />

            {/* Pulse ring */}
            <motion.div
              className="r49-tour-float-btn-ring absolute inset-0 rounded-full border-2 border-white/30"
              animate={{ scale: [1, 1.15], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' as const }}
            />

            <Eye className="r49-tour-float-btn-icon w-5 h-5 relative z-10" />
            <span className="r49-tour-float-btn-text relative z-10 whitespace-nowrap">
              Fazer o Tour
            </span>

            {/* Arrow animation */}
            <motion.div
              className="r49-tour-float-btn-arrow relative z-10"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main InteractiveProductTour Component ─────────────────────────────────────

export function InteractiveProductTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isMascotTalking, setIsMascotTalking] = useState(true)
  const [demoInteractions, setDemoInteractions] = useState(0)
  const [isTourDone, setIsTourDone] = useState(false)
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Check localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY)
      if (stored === 'true') {
        setIsTourDone(true)
      }
    } catch {
      // ignore localStorage errors
    }
  }, [])

  // Reset mascot talking when step changes
  useEffect(() => {
    setIsMascotTalking(true)
    const timer = setTimeout(() => setIsMascotTalking(false), 3000)
    return () => clearTimeout(timer)
  }, [currentStep])

  // Auto-play logic
  useEffect(() => {
    if (isAutoPlaying && !isCompleted && isOpen) {
      autoPlayTimerRef.current = setTimeout(() => {
        handleNext()
      }, AUTO_PLAY_DELAY)
      return () => {
        if (autoPlayTimerRef.current) {
          clearTimeout(autoPlayTimerRef.current)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPlaying, isCompleted, currentStep, isOpen])

  const markTourCompleted = useCallback(() => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    } catch {
      // ignore
    }
    setIsTourDone(true)
    setIsCompleted(true)
  }, [])

  const handleOpenTour = useCallback(() => {
    if (isTourDone) {
      // Allow re-taking the tour but reset completion state
      setIsCompleted(false)
    }
    setCurrentStep(0)
    setDirection(1)
    setIsOpen(true)
    setDemoInteractions(0)
    setIsAutoPlaying(false)
  }, [isTourDone])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setIsAutoPlaying(false)
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current)
    }
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleStepClick = useCallback(
    (step: number) => {
      setDirection(step > currentStep ? 1 : -1)
      setCurrentStep(step)
    },
    [currentStep]
  )

  const handleSkip = useCallback(() => {
    markTourCompleted()
    handleClose()
  }, [markTourCompleted, handleClose])

  const handleComplete = useCallback(() => {
    markTourCompleted()
    // Show completion screen before closing
    setTimeout(() => {
      handleClose()
    }, 3000)
  }, [markTourCompleted, handleClose])

  const handleToggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev) => !prev)
  }, [])

  const handleDemoInteraction = useCallback(() => {
    setDemoInteractions((prev) => prev + 1)
    // Briefly animate mascot
    setIsMascotTalking(true)
    setTimeout(() => setIsMascotTalking(false), 1500)
  }, [])

  const handleCompletionDismiss = useCallback(() => {
    handleClose()
  }, [handleClose])

  // Current step data
  const step = tourSteps[currentStep]
  const stepId = step.id

  // Floating particles
  const floatingParticles = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        delay: i * 0.4,
        color: confettiColors[i % confettiColors.length],
        size: 4 + (i % 4) * 2,
        x: 8 + ((i * 11) % 85),
        y: 8 + ((i * 13) % 75),
      })),
    []
  )

  // Don't render floating button if tour is open or already done
  const showFloatingButton = !isOpen && !isTourDone

  return (
    <>
      {/* Floating "Take the Tour" Button */}
      {showFloatingButton && <TourFloatingButton onClick={handleOpenTour} />}

      {/* Tour Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={overlayRef}
            className="r49-tour-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="r49-tour-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Tour Container */}
            <motion.div
              className="r49-tour-container relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl bg-card border border-border shadow-2xl flex flex-col"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
              style={{
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Floating particles background */}
              <div className="r49-tour-particles-bg absolute inset-0 overflow-hidden pointer-events-none z-0">
                {floatingParticles.map((p) => (
                  <FloatingParticle
                    key={p.id}
                    delay={p.delay}
                    color={p.color}
                    size={p.size}
                    x={p.x}
                    y={p.y}
                  />
                ))}
              </div>

              {/* Close button */}
              <motion.button
                className="r49-tour-close-btn absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center justify-center transition-colors"
                onClick={handleClose}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Fechar tour"
              >
                <X className="w-4 h-4" />
              </motion.button>

              {/* Progress indicator */}
              <div className="r49-tour-progress-container relative z-10 px-5 pt-4">
                <ProgressIndicator
                  currentStep={currentStep}
                  totalSteps={TOTAL_STEPS}
                  onStepClick={handleStepClick}
                />
              </div>

              {/* Content area */}
              <div className="r49-tour-content relative z-10 flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
                <AnimatePresence mode="wait" custom={direction}>
                  {isCompleted ? (
                    <motion.div
                      key="completion"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring' as const, stiffness: 200, damping: 18 }}
                    >
                      <CompletionBadge onComplete={handleCompletionDismiss} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentStep}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
                    >
                      {/* Header: Step icon + mascot */}
                      <div className="r49-tour-step-header flex items-start gap-4 mb-4">
                        {/* Step icon */}
                        <motion.div
                          className="r49-tour-step-icon-wrap flex-shrink-0"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div
                            className={`r49-tour-step-icon-box w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white`}
                            style={{
                              boxShadow: `0 6px 20px ${step.accentColor}, 0 2px 8px ${step.accentColor}`,
                            }}
                          >
                            {(() => {
                              const Icon = stepIcons[stepId]
                              return <Icon className="w-7 h-7" />
                            })()}
                          </div>
                        </motion.div>

                        {/* Mascot + Speech */}
                        <div className="r49-tour-step-mascot-area flex-1 flex flex-col items-end gap-2">
                          <AnimatePresence mode="wait">
                            {isMascotTalking && (
                              <SpeechBubble message={step.mascotMessage} />
                            )}
                          </AnimatePresence>
                          <TourMascot stepId={stepId} isTalking={isMascotTalking} />
                        </div>
                      </div>

                      {/* Title & subtitle */}
                      <div className="r49-tour-step-titles mb-4">
                        <motion.h3
                          className="r49-tour-step-title text-lg font-bold text-foreground"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          {step.title}
                        </motion.h3>
                        <motion.p
                          className="r49-tour-step-subtitle text-sm text-muted-foreground mt-1 leading-relaxed"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {step.subtitle}
                        </motion.p>
                      </div>

                      {/* Interactive demo area */}
                      <motion.div
                        className="r49-tour-demo-area"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {stepId === 'welcome' && <WelcomeDemo />}
                        {stepId === 'browse' && <BrowseDemo onDemoClick={handleDemoInteraction} />}
                        {stepId === 'cart' && <CartDemo onDemoClick={handleDemoInteraction} />}
                        {stepId === 'checkout' && <CheckoutDemo onDemoClick={handleDemoInteraction} />}
                        {stepId === 'delivery' && <DeliveryDemo onDemoClick={handleDemoInteraction} />}
                        {stepId === 'rewards' && <RewardsDemo onDemoClick={handleDemoInteraction} />}
                      </motion.div>

                      {/* Interaction hint */}
                      {demoInteractions === 0 && currentStep > 0 && (
                        <motion.div
                          className="r49-tour-interaction-hint flex items-center justify-center gap-1.5 mt-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                        >
                          <MousePointer className="r49-tour-hint-icon w-3 h-3 text-muted-foreground" />
                          <span className="r49-tour-hint-text text-[10px] text-muted-foreground">
                            Interaja com a demonstração acima!
                          </span>
                        </motion.div>
                      )}

                      {/* Interaction counter badge */}
                      {demoInteractions > 0 && (
                        <motion.div
                          className="r49-tour-interaction-count flex items-center justify-center mt-3"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <motion.div
                            className="r49-tour-interaction-badge flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Heart className="w-3 h-3" />
                            {demoInteractions} {demoInteractions === 1 ? 'interação' : 'interações'}
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auto-play progress bar */}
              {isAutoPlaying && !isCompleted && (
                <div className="r49-tour-autoplay-bar relative h-1 bg-muted/50 z-10">
                  <motion.div
                    className="r49-tour-autoplay-fill absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: AUTO_PLAY_DELAY / 1000, ease: 'linear' as const }}
                    key={`autoplay-${currentStep}`}
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="r49-tour-nav-container relative z-10 px-5 py-3 border-t border-border/60 bg-card/80 backdrop-blur-sm">
                <NavigationControls
                  currentStep={currentStep}
                  totalSteps={TOTAL_STEPS}
                  isAutoPlaying={isAutoPlaying}
                  onBack={handleBack}
                  onNext={handleNext}
                  onSkip={handleSkip}
                  onToggleAutoPlay={handleToggleAutoPlay}
                  onComplete={handleComplete}
                />
              </div>

              {/* Gradient animated border glow */}
              <motion.div
                className="r49-tour-border-glow absolute inset-0 rounded-3xl pointer-events-none z-30"
                animate={{
                  boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.12)',
                }}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' as const }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
