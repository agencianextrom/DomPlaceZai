'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, ShoppingCart, Sparkles, ChevronDown, ChevronUp, Clock, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'

/* ── Types ── */
interface OrderItem {
  productName: string
  quantity: number
  price: number
  total: number
  productId?: string
}

interface OrderData {
  id: string
  orderNumber: string
  storeName?: string
  status: string
  total: number
  items: OrderItem[]
  createdAt: string
}

interface ReorderHistory {
  id: string
  orderNumber: string
  storeName: string
  itemCount: number
  timestamp: string
}

/* ── Animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -12, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
}

const confirmVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 350, damping: 24 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: { duration: 0.2 },
  },
}

const cartBounceVariants = {
  bounce: {
    y: [0, -40, 0],
    opacity: [1, 1, 0],
    scale: [1, 0.8, 0.5],
    transition: { duration: 0.8, ease: 'easeOut' as const },
  },
}

const confettiColors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6']

/* ── Confetti particle component ── */
function ConfettiParticle({ color, index }: { color: string; index: number }) {
  const angle = (index / 8) * 360
  const rad = (angle * Math.PI) / 180
  const distance = 40 + Math.random() * 30

  return (
    <motion.div
      key={`confetti-${index}`}
      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
      animate={{
        scale: [0, 1.2, 0],
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance - 20,
        opacity: [0, 1, 0],
        rotate: [0, 180 + Math.random() * 180],
      }}
      transition={{
        duration: 0.7,
        delay: index * 0.03,
        ease: 'easeOut',
      }}
      className="absolute h-2 w-2 rounded-full"
      style={{ backgroundColor: color, left: '50%', top: '50%' }}
    />
  )
}

/* ── Animated shopping cart poof ── */
function CartPoof({ show, originRef }: { show: boolean; originRef: React.RefObject<HTMLButtonElement | null> }) {
  if (!show || !originRef.current) return null

  const rect = originRef.current.getBoundingClientRect()

  return (
    <motion.div
      initial={{ x: rect.left, y: rect.top, opacity: 1, scale: 1 }}
      animate={cartBounceVariants.bounce}
      className="fixed z-[100] pointer-events-none"
      style={{ left: rect.left + rect.width / 2, top: rect.top }}
    >
      <motion.div className="relative">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute -inset-2 rounded-full bg-primary/20"
        />
      </motion.div>
    </motion.div>
  )
}

/* ── Format time helper ── */
function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days} dia${days > 1 ? 's' : ''} atrás`
}

/* ── Props interface ── */
interface OrderReorderProps {
  order: OrderData
  onReorder?: (orderId: string) => void
}

/* ── Main component ── */
export function OrderReorder({ order, onReorder }: OrderReorderProps) {
  const addToCart = useAppStore((s) => s.addToCart)
  const navigate = useAppStore((s) => s.navigate)

  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCartPoof, setShowCartPoof] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [reorderHistory, setReorderHistory] = useState<ReorderHistory[]>([])

  const buttonRef = useRef<HTMLButtonElement>(null)

  // Load reorder history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('reorder-history')
      if (stored) setReorderHistory(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  const isReorderable =
    order.status === 'DELIVERED' ||
    order.status === 'COMPLETED' ||
    order.status === 'CANCELLED'

  const calculateSavings = useCallback((): number => {
    // Simulate potential savings (items with discounts)
    return order.items.reduce((sum, item) => {
      const hasDiscount = Math.random() > 0.6
      return hasDiscount ? sum + item.price * item.quantity * 0.1 : sum
    }, 0)
  }, [order.items])

  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0)
  const savings = calculateSavings()

  const handleReorderClick = () => {
    setShowConfirm(true)
  }

  const handleConfirmReorder = async () => {
    setShowConfirm(false)
    setShowCartPoof(true)

    // Simulate adding items with a brief delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Add items to cart via Zustand
    for (const item of order.items) {
      if (item.productId) {
        // Try to add real product - for demo, use minimal data
        addToCart(
          {
            id: item.productId,
            storeId: order.id,
            storeName: order.storeName || 'Loja',
            name: item.productName,
            slug: '',
            description: null,
            price: item.price,
            comparePrice: null,
            images: '[]',
            stock: 50,
            rating: 4.5,
            totalReviews: 10,
            isFeatured: false,
            isNew: false,
            isOffer: false,
            tags: '[]',
            variations: null,
            category: 'FOOD',
          },
          order.storeName || 'Loja',
          item.quantity
        )
      }
    }

    // Save to reorder history
    const newEntry: ReorderHistory = {
      id: `reorder-${Date.now()}`,
      orderNumber: order.orderNumber,
      storeName: order.storeName || 'Loja',
      itemCount: totalItems,
      timestamp: new Date().toISOString(),
    }
    const updatedHistory = [newEntry, ...reorderHistory].slice(0, 3)
    setReorderHistory(updatedHistory)
    try {
      localStorage.setItem('reorder-history', JSON.stringify(updatedHistory))
    } catch {
      // ignore
    }

    setShowCartPoof(false)
    setShowSuccess(true)
    setShowConfetti(true)

    // Trigger callback
    onReorder?.(order.id)

    // Navigate to cart after a delay
    setTimeout(() => {
      setShowSuccess(false)
      setShowConfetti(false)
      navigate('cart')
    }, 2000)
  }

  const handleCancelReorder = () => {
    setShowConfirm(false)
  }

  if (!isReorderable) return null

  return (
    <div className="relative">
      {/* Reorder button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      >
        <Button
          ref={buttonRef}
          variant="outline"
          size="sm"
          onClick={handleReorderClick}
          disabled={showSuccess}
          className="gap-1.5 text-xs border-primary/30 hover:bg-primary/5 hover:border-primary/50 text-primary font-semibold"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Pedir Novamente
        </Button>
      </motion.div>

      {/* Cart poof animation */}
      <AnimatePresence>
        {showCartPoof && (
          <CartPoof show={showCartPoof} originRef={buttonRef} />
        )}
      </AnimatePresence>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            variants={confirmVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 right-0 top-full mt-2 z-50"
          >
            <Card className="border-primary/20 shadow-xl">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Confirmar re-pedido?</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {totalItems} {totalItems === 1 ? 'item' : 'itens'} ·{' '}
                      {order.storeName || 'Loja'}
                    </p>
                  </div>
                </div>

                {/* Order summary */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-1.5 mb-3 max-h-40 overflow-y-auto"
                >
                  {order.items.map((item, idx) => (
                    <motion.div
                      key={`${item.productName}-${idx}`}
                      variants={itemVariants}
                      className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-muted-foreground">{item.quantity}x</span>
                        <span className="truncate font-medium">{item.productName}</span>
                      </div>
                      <span className="text-muted-foreground shrink-0 ml-2">
                        R$ {item.total.toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Savings message */}
                {savings > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[11px] font-semibold text-emerald-600">
                        Economia de R$ {savings.toFixed(2)}! Alguns itens estão com desconto agora
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelReorder}
                    className="flex-1 h-8 text-xs"
                  >
                    Cancelar
                  </Button>
                  <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button
                      size="sm"
                      onClick={handleConfirmReorder}
                      className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      Adicionar ao Carrinho
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
            className="absolute left-0 right-0 top-full mt-2 z-50"
          >
            <Card className="border-emerald-500/30 shadow-xl bg-emerald-50/50 dark:bg-emerald-950/20">
              <CardContent className="p-3">
                <div className="relative flex items-center gap-2">
                  {/* Confetti burst */}
                  {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {confettiColors.map((color, i) => (
                        <ConfettiParticle key={i} color={color} index={i} />
                      ))}
                    </div>
                  )}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: 2 }}
                    className="relative h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
                  >
                    <PartyPopper className="h-4 w-4 text-white" />
                  </motion.div>
                  <div className="relative">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Itens adicionados ao carrinho!
                    </p>
                    <p className="text-[10px] text-emerald-600/70">
                      Redirecionando para o carrinho...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent reorder history */}
      {reorderHistory.length > 0 && (
        <div className="mt-3">
          <motion.button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            whileTap={{ scale: 0.97 }}
          >
            {showHistory ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            Últimos re-pedidos ({reorderHistory.length})
          </motion.button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-1.5 space-y-1">
                  {reorderHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between text-[10px] p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Pedido #{entry.orderNumber.slice(-4)}
                        </span>
                        <span className="text-muted-foreground">· {entry.storeName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[8px] bg-primary/5 text-primary border-0 px-1.5 py-0"
                        >
                          {entry.itemCount} itens
                        </Badge>
                        <span className="text-muted-foreground">
                          {getTimeAgo(entry.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
