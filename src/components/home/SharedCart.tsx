'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Check,
  Share2,
  CreditCard,
  Truck,
  Zap,
  Bot,
  ChevronDown,
  ChevronUp,
  User,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

/* ─── Animation Variants ─── */
const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 220, damping: 20 },
  },
}
const cardV = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
}
const tapV = { scale: 0.93 }

/* ─── Types ─── */
interface FamilyMember {
  id: string
  emoji: string
  name: string
  color: string
}

interface CartItem {
  id: string
  emoji: string
  name: string
  qty: number
  unitPrice: number
  addedBy: string
  category: 'Mercado' | 'Limpeza'
  purchased: boolean
}

interface DeliveryOption {
  id: string
  emoji: string
  label: string
  price: string
  icon: React.ReactNode
}

/* ─── Mock Data ─── */
const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'carlos', emoji: '👨', name: 'Carlos', color: '#06b6d4' },
  { id: 'ana', emoji: '👩', name: 'Ana', color: '#f472b6' },
  { id: 'pedro', emoji: '👦', name: 'Pedro', color: '#a78bfa' },
  { id: 'maria', emoji: '👧', name: 'Maria', color: '#fb923c' },
]

const INITIAL_ITEMS: CartItem[] = [
  { id: '1', emoji: '🍚', name: 'Arroz Integral 5kg', qty: 2, unitPrice: 24.9, addedBy: 'carlos', category: 'Mercado', purchased: false },
  { id: '2', emoji: '🥛', name: 'Leite Integral 1L', qty: 3, unitPrice: 5.49, addedBy: 'ana', category: 'Mercado', purchased: false },
  { id: '3', emoji: '🍗', name: 'Frango Congelado 1kg', qty: 1, unitPrice: 19.9, addedBy: 'pedro', category: 'Mercado', purchased: false },
  { id: '4', emoji: '🍌', name: 'Banana 1kg', qty: 2, unitPrice: 4.99, addedBy: 'maria', category: 'Mercado', purchased: false },
  { id: '5', emoji: '🫒', name: 'Azeite Extra Virgem 500ml', qty: 1, unitPrice: 32.9, addedBy: 'carlos', category: 'Mercado', purchased: false },
  { id: '6', emoji: '☕', name: 'Café Torrado 250g', qty: 1, unitPrice: 18.9, addedBy: 'ana', category: 'Mercado', purchased: false },
  { id: '7', emoji: '🍝', name: 'Macarrão 500g', qty: 2, unitPrice: 4.79, addedBy: 'pedro', category: 'Mercado', purchased: false },
  { id: '8', emoji: '🧴', name: 'Detergente 500ml', qty: 1, unitPrice: 3.29, addedBy: 'maria', category: 'Limpeza', purchased: false },
  { id: '9', emoji: '🧼', name: 'Sabão em Pó 1kg', qty: 1, unitPrice: 12.9, addedBy: 'carlos', category: 'Limpeza', purchased: false },
  { id: '10', emoji: '🧻', name: 'Papel Higiênico 12un', qty: 1, unitPrice: 15.9, addedBy: 'ana', category: 'Limpeza', purchased: false },
]

const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: 'standard', emoji: '🚚', label: 'Entrega Padrão', price: 'R$8,90', icon: <Truck className="h-4 w-4" /> },
  { id: 'pickup', emoji: '🏃', label: 'Retirada na Loja', price: 'Grátis', icon: <Package className="h-4 w-4" /> },
  { id: 'express', emoji: '📦', label: 'Entrega Expressa', price: 'R$14,90', icon: <Zap className="h-4 w-4" /> },
]

/* ─── Helpers ─── */
function fmtBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getMemberById(id: string): FamilyMember {
  return FAMILY_MEMBERS.find((m) => m.id === id) ?? FAMILY_MEMBERS[0]
}

/* ─── Skeleton ─── */
function SkeletonLoader() {
  return (
    <div className="r89-shared-cart-skeleton space-y-4" data-slot="shared-cart-skeleton">
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 min-w-[72px]">
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
            <div className="h-3 w-12 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  )
}

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <motion.div
      variants={fadeUp}
      className="r89-shared-cart-empty flex flex-col items-center justify-center py-16 text-center"
    >
      <span className="text-6xl mb-4">🎉</span>
      <p className="text-lg font-semibold text-foreground">Todas as compras foram feitas!</p>
      <p className="text-sm text-muted-foreground mt-1">
        Clique em &quot;Compartilhar Lista&quot; para começar uma nova lista com a família.
      </p>
    </motion.div>
  )
}

/* ─── Main Component ─── */
export function SharedCart() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS)
  const [selectedDelivery, setSelectedDelivery] = useState('pickup')
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [suggestionVisible, setSuggestionVisible] = useState(true)

  /* ─── Loading delay ─── */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(t)
  }, [])

  /* ─── Member item counts ─── */
  const memberCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    FAMILY_MEMBERS.forEach((m) => {
      counts[m.id] = items.filter((i) => i.addedBy === m.id).length
    })
    return counts
  }, [items])

  /* ─── Filtered items ─── */
  const filteredItems = useMemo(() => {
    if (!selectedMember) return items
    return items.filter((i) => i.addedBy === selectedMember)
  }, [items, selectedMember])

  /* ─── Cart totals ─── */
  const totals = useMemo(() => {
    const totalQty = items.reduce((s, i) => s + i.qty, 0)
    const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0)
    const economy = 23.4
    const estimated = subtotal - economy
    return { totalQty, subtotal, economy, estimated }
  }, [items])

  /* ─── All purchased? ─── */
  const allPurchased = items.length > 0 && items.every((i) => i.purchased)

  /* ─── Handlers ─── */
  function changeQty(id: string, delta: number) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const next = Math.max(1, item.qty + delta)
        return { ...item, qty: next }
      }),
    )
  }

  function togglePurchased(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, purchased: !item.purchased } : item)),
    )
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    toast({ title: 'Item removido', description: 'O item foi removido do carrinho.' })
  }

  function handleFinish() {
    toast({
      title: '🛒 Compra finalizada!',
      description: 'Seu pedido foi enviado com sucesso.',
    })
  }

  function handleSplitBill() {
    toast({
      title: '💰 Conta dividida',
      description: 'Os valores foram divididos entre os membros da família.',
    })
  }

  function handleShare() {
    toast({
      title: '📋 Lista compartilhada',
      description: 'O link da lista foi copiado para a área de transferência.',
    })
  }

  function handleAddSuggestion() {
    setItems((prev) => [
      ...prev,
      {
        id: 'suggestion-egg',
        emoji: '🥚',
        name: 'Ovo Branco 12un',
        qty: 1,
        unitPrice: 12.9,
        addedBy: 'bot',
        category: 'Mercado',
        purchased: false,
      },
    ])
    setSuggestionVisible(false)
    toast({ title: '🥚 Ovo adicionado!', description: 'O item foi adicionado à lista.' })
  }

  function handleIgnoreSuggestion() {
    setSuggestionVisible(false)
  }

  /* ─── Render ─── */
  if (loading) return <SkeletonLoader />

  return (
    <Card
      className="r89-shared-cart-root overflow-hidden rounded-2xl border-0 r62-card-lift r90-shared-cart-root"
      style={{
        background: 'linear-gradient(135deg, #06b6d4, #0891b2, #0e7490)',
      }}
    >
      {/* ── Header ── */}
      <CardHeader className="r89-shared-cart-header pb-3 pt-5 px-5">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white leading-tight">
                Carrinho Compartilhado
              </CardTitle>
              <p className="text-xs text-white/80 mt-0.5">
                Gerencie as compras da família em um só lugar
              </p>
            </div>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="r89-shared-cart-body bg-background rounded-t-2xl -mt-1 pt-5 px-5 pb-6 space-y-5">
        <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-5">
          {/* ── Family Members Bar ── */}
          <motion.div variants={fadeUp} className="r89-shared-cart-members">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <motion.button
                whileTap={tapV}
                onClick={() => setSelectedMember(null)}
                className={`r89-shared-cart-member-all flex flex-col items-center gap-1 min-w-[68px] min-h-[44px] px-2 py-1.5 rounded-xl transition-colors ${
                  selectedMember === null
                    ? 'bg-cyan-500/15 text-cyan-700 ring-2 ring-cyan-500/40'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                <User className="h-4 w-4" />
                <span className="text-[10px] font-medium">Todos</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 min-w-[18px]">
                  {items.length}
                </Badge>
              </motion.button>

              {FAMILY_MEMBERS.map((member) => (
                <motion.button
                  key={member.id}
                  whileTap={tapV}
                  onClick={() =>
                    setSelectedMember((prev) => (prev === member.id ? null : member.id))
                  }
                  className={`r89-shared-cart-member flex flex-col items-center gap-1 min-w-[68px] min-h-[44px] px-2 py-1.5 rounded-xl transition-colors ${
                    selectedMember === member.id
                      ? 'bg-cyan-500/15 text-cyan-700 ring-2 ring-cyan-500/40'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className="text-xl leading-none">{member.emoji}</span>
                  <span className="text-[10px] font-medium truncate max-w-[56px]">{member.name}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 min-w-[18px]">
                    {memberCounts[member.id]}
                  </Badge>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* ── Cart Items ── */}
          {allPurchased ? (
            <EmptyState />
          ) : (
            <motion.div variants={containerV} className="r89-shared-cart-items space-y-2.5">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => {
                  const member = getMemberById(item.addedBy)
                  return (
                    <motion.div
                      key={item.id}
                      variants={cardV}
                      layout
                      exit={{ opacity: 0, x: -80, transition: { duration: 0.25 } }}
                      className={`r89-shared-cart-item group relative flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                        item.purchased
                          ? 'bg-muted/40 opacity-70'
                          : 'bg-card hover:bg-accent/40'
                      }`}
                      style={{
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                    >
                      {/* Checkbox */}
                      <motion.button
                        whileTap={tapV}
                        onClick={() => togglePurchased(item.id)}
                        className={`r89-shared-cart-check flex h-6 w-6 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          item.purchased
                            ? 'border-cyan-500 bg-cyan-500 text-white'
                            : 'border-muted-foreground/30 hover:border-cyan-400'
                        }`}
                      >
                        {item.purchased && <Check className="h-3.5 w-3.5" />}
                      </motion.button>

                      {/* Emoji */}
                      <span className="text-2xl shrink-0 leading-none">{item.emoji}</span>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-medium truncate ${
                              item.purchased ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {item.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 h-4 ${
                              item.category === 'Mercado'
                                ? 'border-green-300 text-green-700 bg-green-50'
                                : 'border-purple-300 text-purple-700 bg-purple-50'
                            }`}
                          >
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: member.color }}
                          >
                            {member.emoji} {member.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {fmtBRL(item.unitPrice)}/un
                          </span>
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="r89-shared-cart-qty flex items-center gap-1">
                        <motion.button
                          whileTap={tapV}
                          onClick={() => changeQty(item.id, -1)}
                          className="flex h-8 w-8 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </motion.button>
                        <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                        <motion.button
                          whileTap={tapV}
                          onClick={() => changeQty(item.id, 1)}
                          className="flex h-8 w-8 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </motion.button>
                      </div>

                      {/* Subtotal + Delete */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-sm font-bold text-foreground">
                          {fmtBRL(item.qty * item.unitPrice)}
                        </span>
                        <motion.button
                          whileTap={tapV}
                          onClick={() => removeItem(item.id)}
                          className="flex h-7 w-7 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── AI Suggestion Banner ── */}
          <AnimatePresence>
            {suggestionVisible && !allPurchased && (
              <motion.div
                variants={cardV}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                className="r89-shared-cart-suggestion flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-2xl shrink-0 leading-none">🤖</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-cyan-800">
                      <Bot className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                      Sugestão da IA
                    </p>
                    <p className="text-xs text-cyan-700 mt-0.5">
                      Você esqueceu o Ovo! Adicionar à lista?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={handleAddSuggestion}
                    className="h-9 min-h-[44px] text-xs bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                  >
                    Adicionar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleIgnoreSuggestion}
                    className="h-9 min-h-[44px] text-xs text-muted-foreground"
                  >
                    Ignorar
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Separator className="r89-shared-cart-separator" />

          {/* ── Delivery Options (Collapsible) ── */}
          <motion.div variants={fadeUp} className="r89-shared-cart-delivery">
            <motion.button
              whileTap={tapV}
              onClick={() => setDeliveryOpen(!deliveryOpen)}
              className="flex items-center justify-between w-full min-h-[44px] text-sm font-semibold text-foreground"
            >
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-cyan-600" />
                Opções de Entrega
              </span>
              {deliveryOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </motion.button>

            <AnimatePresence>
              {deliveryOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="r89-shared-cart-delivery-options space-y-2 mt-3">
                    {DELIVERY_OPTIONS.map((option) => (
                      <motion.button
                        key={option.id}
                        whileTap={tapV}
                        onClick={() => setSelectedDelivery(option.id)}
                        className={`r89-shared-cart-delivery-opt flex items-center gap-3 w-full min-h-[44px] px-3 py-2.5 rounded-xl border transition-colors ${
                          selectedDelivery === option.id
                            ? 'border-cyan-400 bg-cyan-50 text-cyan-800'
                            : 'border-muted hover:border-muted-foreground/20 bg-card'
                        }`}
                      >
                        <span className="text-xl shrink-0 leading-none">{option.emoji}</span>
                        <div className="flex-1 text-left">
                          <p
                            className={`text-sm font-medium ${
                              selectedDelivery === option.id
                                ? 'text-cyan-800'
                                : 'text-foreground'
                            }`}
                          >
                            {option.label}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            selectedDelivery === option.id
                              ? 'text-cyan-700'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {option.price}
                        </span>
                        <div
                          className={`h-4 w-4 min-h-[44px] min-w-[44px] rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedDelivery === option.id
                              ? 'border-cyan-500 bg-cyan-500'
                              : 'border-muted-foreground/30'
                          }`}
                        >
                          {selectedDelivery === option.id && (
                            <Check className="h-2.5 w-2.5 text-white" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <Separator className="r89-shared-cart-separator" />

          {/* ── Cart Summary (sticky on mobile) ── */}
          <motion.div
            variants={cardV}
            className="r89-shared-cart-summary sticky bottom-0 z-10 -mx-5 px-5 pb-2 pt-4 bg-background/95 backdrop-blur-sm border-t border-border/50"
          >
            <div className="space-y-3">
              {/* Totals */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Total itens: <span className="font-semibold text-foreground">{totals.totalQty}</span>
                </span>
                <span className="font-bold text-lg text-foreground">
                  Estimado: {fmtBRL(totals.estimated)}
                </span>
              </div>

              {/* Economy */}
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                  Economia: {fmtBRL(totals.economy)}
                </Badge>
                <span className="text-[11px] text-muted-foreground">com cupom aplicado</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button
                  onClick={handleFinish}
                  className="r89-shared-cart-btn-finish flex-1 h-11 min-h-[44px] text-sm font-semibold text-white border-0"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2, #0e7490)',
                    boxShadow: '0 4px 14px rgba(6,182,212,0.35)',
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Finalizar Compra
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSplitBill}
                  className="r89-shared-cart-btn-split flex-1 h-11 min-h-[44px] text-sm font-medium"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dividir Conta
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="r89-shared-cart-btn-share flex-1 h-11 min-h-[44px] text-sm font-medium"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar Lista
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  )
}

export default SharedCart
