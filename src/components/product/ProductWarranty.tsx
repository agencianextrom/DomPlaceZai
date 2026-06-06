'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ShieldCheck, ShieldPlus, ShieldAlert, Check, ChevronDown, ChevronUp, Clock, Award, Star, ShoppingCart, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

// ==================== TYPES ====================
interface WarrantyTier {
  id: 'standard' | 'extended' | 'premium'
  name: string
  duration: string
  durationDays: number
  price: number
  priceMonthly: number
  coveragePercent: number
  icon: typeof Shield
  color: string
  gradient: string
  responseTime: string
  features: string[]
}

interface WarrantyAccordionItem {
  id: string
  title: string
  content: string
}

// ==================== PROPS ====================
interface ProductWarrantyProps {
  productId: string
  productName: string
  basePrice: number
}

// ==================== CONSTANTS ====================
const WARRANTY_TIERS: WarrantyTier[] = [
  {
    id: 'standard',
    name: 'Garantia Padrão',
    duration: '90 dias',
    durationDays: 90,
    price: 0,
    priceMonthly: 0,
    coveragePercent: 30,
    icon: Shield,
    color: 'text-slate-500 dark:text-slate-400',
    gradient: 'from-slate-100 to-slate-200 dark:from-slate-900/30 dark:to-slate-800/30',
    responseTime: 'Até 7 dias úteis',
    features: ['Defeitos de fábrica', 'Produto diferente do anúncio', 'Não funcionamento inicial'],
  },
  {
    id: 'extended',
    name: 'Garantia Estendida',
    duration: '12 meses',
    durationDays: 365,
    price: 19.90,
    priceMonthly: 1.66,
    coveragePercent: 60,
    icon: ShieldCheck,
    color: 'text-primary dark:text-primary',
    gradient: 'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
    responseTime: 'Até 3 dias úteis',
    features: ['Defeitos de fábrica', 'Produto diferente do anúncio', 'Não funcionamento inicial', 'Quebra acidental', 'Desgaste prematuro', 'Assistência técnica'],
  },
  {
    id: 'premium',
    name: 'Garantia Premium',
    duration: '24 meses',
    durationDays: 730,
    price: 39.90,
    priceMonthly: 1.66,
    coveragePercent: 100,
    icon: ShieldPlus,
    color: 'text-amber-500 dark:text-amber-400',
    gradient: 'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
    responseTime: 'Até 24 horas',
    features: ['Defeitos de fábrica', 'Produto diferente do anúncio', 'Não funcionamento inicial', 'Quebra acidental', 'Desgaste prematuro', 'Assistência técnica', 'Roubo ou furto', 'Substituição imediata', 'Suporte prioritário 24h'],
  },
]

const ACCORDION_ITEMS: WarrantyAccordionItem[] = [
  {
    id: 'coverage',
    title: 'O que está coberto?',
    content: 'A garantia cobre defeitos de fabricação, falhas no funcionamento e problemas que impossibilitem o uso normal do produto. Coberturas adicionais dependem do plano escolhido. A garantia não cobre danos causados por uso indevido, modificações não autorizadas ou desgaste natural.',
  },
  {
    id: 'claim',
    title: 'Como solicitar?',
    content: 'Para solicitar a garantia, entre em contato conosco pelo chat de suporte ou abra um chamado na seção "Meus Pedidos". Informe o número do pedido e descreva o problema. Enviaremos um código de postagem gratuita para devolução. O prazo de análise é de até 3 dias úteis.',
  },
  {
    id: 'exclusions',
    title: 'Exclusões',
    content: 'Não estão cobertos: danos por uso inadequado, quedas, imersão em líquidos (salvo defeito de fábrica), modificações por terceiros, perda ou extravio, acessórios e componentes consumíveis. A garantia é pessoal e intransferível.',
  },
]

const springGlow = { type: 'spring' as const, stiffness: 350, damping: 25 }

// ==================== HELPERS ====================
function loadWarrantyPreference(productId: string): string {
  if (typeof window === 'undefined') return 'standard'
  try { return localStorage.getItem(`domplace-warranty-${productId}`) || 'standard' } catch { return 'standard' }
}

function saveWarrantyPreference(productId: string, tierId: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(`domplace-warranty-${productId}`, tierId) } catch { /* ignore */ }
}

const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

// ==================== ANIMATED COUNTER ====================
function AnimatedPriceCounter({ target, duration = 800 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const startTime = performance.now()
    const tick = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(target * eased)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return (
    <motion.span
      key={target}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-lg font-bold"
    >
      {formatBRL(display)}
    </motion.span>
  )
}

// ==================== COVERAGE PROGRESS BAR ====================
function CoverageProgress({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
      />
    </div>
  )
}

// ==================== CHECK ANIMATED ====================
function AnimatedCheck({ visible, delay = 0 }: { visible: boolean; delay?: number }) {
  return (
    <motion.div
      initial={false}
      animate={visible ? { scale: [0, 1.2, 1], opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ delay, type: 'spring' as const, stiffness: 400, damping: 20 }}
      className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
    >
      <Check className="h-2.5 w-2.5 text-white" />
    </motion.div>
  )
}

// ==================== SHIELD ICON ====================
function TierShield({ tier, isSelected }: { tier: WarrantyTier; isSelected: boolean }) {
  const Icon = tier.icon
  return (
    <motion.div
      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center relative ${isSelected ? 'shadow-md' : ''}`}
      animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.4 }}
    >
      <Icon className={`h-6 w-6 ${tier.color}`} />
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-primary"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
        />
      )}
      {isSelected && (
        <motion.div
          className="absolute -inset-1 rounded-2xl"
          initial={{ boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(16, 185, 129, 0.4)',
              '0 0 0 8px rgba(16, 185, 129, 0)',
              '0 0 0 0 rgba(16, 185, 129, 0)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {/* Checkmark badge */}
      {isSelected && (
        <motion.div
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
        >
          <Check className="h-3 w-3 text-primary-foreground" />
        </motion.div>
      )}
    </motion.div>
  )
}

// ==================== TIER CARD ====================
function TierCard({ tier, isSelected, onSelect }: { tier: WarrantyTier; isSelected: boolean; onSelect: () => void }) {
  return (
    <motion.button
      onClick={onSelect}
      className={`relative w-full text-left p-4 rounded-xl border-2 transition-all overflow-hidden ${
        isSelected
          ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
          : 'border-border/50 bg-card/60 hover:border-primary/30'
      }`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <TierShield tier={tier} isSelected={isSelected} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold">{tier.name}</h4>
            {tier.price === 0 ? (
              <Badge variant="secondary" className="text-[9px] bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                Grátis
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[9px] bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                +{formatBRL(tier.price)}
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{tier.duration}</p>
          <CoverageProgress
            percent={tier.coveragePercent}
            color={tier.id === 'standard' ? 'bg-slate-400' : tier.id === 'extended' ? 'bg-primary' : 'bg-amber-400'}
          />
          <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" /> Resposta: {tier.responseTime}
          </p>
        </div>
      </div>

      {/* Features list (staggered checkmarks when selected) */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 pt-3 border-t border-border/50 space-y-1.5 overflow-hidden"
          >
            {tier.features.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2"
              >
                <AnimatedCheck visible={true} delay={i * 0.06} />
                <span className="text-[10px] text-foreground">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ==================== ACCORDION ITEM ====================
function AccordionItem({ item }: { item: WarrantyAccordionItem }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">{item.title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== SKELETON ====================
function WarrantySkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <Skeleton className="h-7 w-40 mb-4" />
      <div className="space-y-3 mb-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="space-y-2 mt-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================
export function ProductWarranty({ productId, productName, basePrice }: ProductWarrantyProps) {
  const [selectedTierId, setSelectedTierId] = useState<string>(() => loadWarrantyPreference(productId))
  const [isLoaded, setIsLoaded] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  // Loading animation
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 500)
    return () => clearTimeout(t)
  }, [])

  const selectedTier = useMemo(
    () => WARRANTY_TIERS.find(t => t.id === selectedTierId) || WARRANTY_TIERS[0],
    [selectedTierId]
  )

  const handleTierSelect = useCallback((tierId: string) => {
    setSelectedTierId(tierId)
    saveWarrantyPreference(productId, tierId)
    setAddedToCart(false)
  }, [productId])

  const handleAddToOrder = useCallback(() => {
    setAddedToCart(true)
    toast.success('Garantia adicionada ao pedido!', {
      description: `${selectedTier.name} — ${selectedTier.duration}`,
    })
    setTimeout(() => setAddedToCart(false), 3000)
  }, [selectedTier])

  if (!isLoaded) return <WarrantySkeleton />

  return (
    <section className="glass-card rounded-2xl p-5 r27-warranty relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-md"
        >
          <ShieldAlert className="h-5 w-5 text-white" />
        </motion.div>
        <div>
          <h2 className="text-base font-bold">Garantia do Produto</h2>
          <p className="text-[10px] text-muted-foreground">Proteja sua compra {productName ? `· ${productName}` : ''}</p>
        </div>
      </div>

      {/* Coverage level progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground font-medium">Nível de cobertura</span>
          <motion.span
            key={selectedTier.coveragePercent}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-xs font-bold text-primary"
          >
            {selectedTier.coveragePercent}%
          </motion.span>
        </div>
        <CoverageProgress
          percent={selectedTier.coveragePercent}
          color={selectedTier.id === 'standard' ? 'bg-slate-400' : selectedTier.id === 'extended' ? 'bg-primary' : 'bg-gradient-to-r from-amber-400 to-orange-400'}
        />
        <div className="flex justify-between mt-1">
          {['Básico', 'Completo', 'Total'].map((label, i) => (
            <span key={label} className={`text-[8px] ${i * 50 <= selectedTier.coveragePercent ? 'text-primary font-semibold' : 'text-muted-foreground/40'}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Tier cards */}
      <div className="space-y-2.5 mb-4">
        {WARRANTY_TIERS.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            isSelected={selectedTier.id === tier.id}
            onSelect={() => handleTierSelect(tier.id)}
          />
        ))}
      </div>

      {/* Price breakdown */}
      {selectedTier.price > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30 mb-4"
        >
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            Resumo do custo
          </h4>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Produto</span>
              <span className="font-medium">{formatBRL(basePrice)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{selectedTier.name}</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">+{formatBRL(selectedTier.price)}</span>
            </div>
            <div className="border-t border-amber-200/50 dark:border-amber-800/30 pt-1.5 flex justify-between">
              <span className="text-xs font-semibold">Total</span>
              <AnimatedPriceCounter target={basePrice + selectedTier.price} />
            </div>
            {selectedTier.priceMonthly > 0 && (
              <p className="text-[9px] text-muted-foreground text-right">
                Equivalente a {formatBRL(selectedTier.priceMonthly)}/mês
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Add to order button */}
      <AnimatePresence mode="wait">
        {addedToCart ? (
          <motion.div
            key="added"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <Button
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
              disabled
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' as const }}>
                <Check className="h-4 w-4" />
              </motion.div>
              Garantia Adicionada ao Pedido!
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <Button
              onClick={handleAddToOrder}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 btn-glow"
            >
              <ShoppingCart className="h-4 w-4" />
              Adicionar ao Pedido
              {selectedTier.price > 0 && (
                <span className="text-xs opacity-80">(+{formatBRL(selectedTier.price)})</span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accordion info */}
      <div className="mt-4 space-y-2">
        <h3 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
          <Award className="h-3.5 w-3.5 text-primary" />
          Informações da garantia
        </h3>
        {ACCORDION_ITEMS.map((item) => (
          <AccordionItem key={item.id} item={item} />
        ))}
      </div>

      {/* Trust footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        Garantia processada e gerenciada pelo DomPlace
      </motion.div>
    </section>
  )
}
