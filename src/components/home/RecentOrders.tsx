'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Store, ChevronRight, RotateCcw, Clock,
  CheckCircle, Truck, Package, Star, ShoppingBag, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type OrderData } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'
import { toast } from 'sonner'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  DELIVERING: { label: 'Em entrega', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  PREPARING: { label: 'Preparando', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Package },
  CONFIRMED: { label: 'Confirmado', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', icon: Clock },
  PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Package },
}

// Map API order items to store OrderData items shape
interface ApiOrderItem {
  id?: string
  productId?: string
  productName: string
  productImage?: string | null
  price: number
  quantity: number
  total: number
}

interface ApiOrder {
  id: string
  orderNumber: string
  storeId: string
  storeName: string
  storeLogo?: string | null
  status: string
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  paymentMethod: string | null
  deliveryType: string
  deliveryAddress?: string | null
  items: ApiOrderItem[]
  estimatedTime?: string | null
  createdAt: string
  paidAt?: string | null
  deliveredAt?: string | null
  cancelledAt?: string | null
  statusHistory?: unknown[]
}

function mapApiToOrder(o: ApiOrder): OrderData {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    storeId: o.storeId,
    storeName: o.storeName,
    status: o.status,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    discount: o.discount,
    total: o.total,
    paymentMethod: o.paymentMethod,
    deliveryType: o.deliveryType,
    deliveryAddress: o.deliveryAddress,
    createdAt: o.createdAt,
    items: o.items.map(item => ({
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    })),
  }
}

const storeGradients: Record<string, string> = {
  'Mercado do Zé': 'from-emerald-500 to-green-600',
  'Açaí da Boa': 'from-purple-500 to-rose-600',
  'Padaria Pão Quente': 'from-amber-500 to-orange-600',
  'Farmácia Vida': 'from-teal-500 to-cyan-600',
}

const defaultGradient = 'from-primary to-emerald-600'

const statusProgress: Record<string, number> = {
  PENDING: 10,
  CONFIRMED: 25,
  PREPARING: 50,
  DELIVERING: 75,
  DELIVERED: 100,
  CANCELLED: 0,
}

// Loading skeleton for order cards
function OrdersSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-3 px-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="min-w-[280px] sm:min-w-[300px] max-w-[320px] shrink-0 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 pb-3 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function RecentOrders() {
  const { currentUser, navigate, addToCart } = useAppStore()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reorderAnim, setReorderAnim] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/orders?limit=5')
      if (!res.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await res.json()
      setOrders((data.orders || []).map(mapApiToOrder))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleReorder = (order: OrderData) => {
    setReorderAnim(order.id)
    if (order.items) {
      order.items.forEach(item => {
        addToCart({
          id: `reorder-${item.productName}`,
          storeId: order.storeId,
          storeName: order.storeName,
          name: item.productName,
          slug: item.productName.toLowerCase().replace(/\s+/g, '-'),
          description: null,
          price: item.price,
          comparePrice: null,
          images: '[]',
          stock: 10,
          rating: 4.5,
          totalReviews: 10,
          isFeatured: false,
          isNew: false,
          isOffer: false,
          tags: '[]',
          variations: null,
          category: 'FOOD',
        }, order.storeName || 'Loja', item.quantity)
      })
      toast.success('Itens adicionados ao carrinho!')
      setTimeout(() => navigate('cart'), 600)
    }
    setTimeout(() => setReorderAnim(null), 1000)
  }

  const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Agora'
    if (hours < 24) return `${hours}h atrás`
    const days = Math.floor(hours / 24)
    return days === 1 ? 'Ontem' : `${days} dias atrás`
  }

  const getInitials = (storeName: string) =>
    storeName.split(' ').map(w => w[0]).join('').slice(0, 2)

  const getGradient = (storeName: string) => storeGradients[storeName] || defaultGradient

  // Not authenticated — show beautiful empty state
  if (!currentUser && !loading) {
    return (
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base sm:text-lg font-bold">Pedidos Recentes</h2>
          </div>
          <button
            onClick={() => navigate('orders')}
            className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5 group"
          >
            Ver todos
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-primary/40" />
            </div>
          </motion.div>
          <h3 className="text-sm font-bold mt-3">Nenhum pedido recente</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
            Faça login para ver seus pedidos e acompanhar suas entregas
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-1.5 text-xs border-primary/30 hover:bg-primary/5"
            onClick={() => useAppStore.getState().openAuthModal()}
          >
            <Store className="h-3.5 w-3.5" />
            Explorar lojas
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-base sm:text-lg font-bold">Pedidos Recentes</h2>
        </div>
        <button
          onClick={() => navigate('orders')}
          className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5 group"
        >
          Ver todos
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && <OrdersSkeleton />}

      {/* Error state */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <RefreshCw className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">Não foi possível carregar seus pedidos</p>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={fetchOrders}>
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty state for authenticated users with no orders */}
      {!loading && !error && orders.length === 0 && currentUser && (
        <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center">
              <Package className="h-8 w-8 text-primary/40" />
            </div>
          </motion.div>
          <h3 className="text-sm font-bold mt-3">Nenhum pedido recente</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
            Explore as lojas e faça seu primeiro pedido!
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-1.5 text-xs border-primary/30 hover:bg-primary/5"
            onClick={() => useAppStore.getState().openSearch()}
          >
            <Store className="h-3.5 w-3.5" />
            Explorar lojas
          </Button>
        </div>
      )}

      {/* Horizontal scrollable cards */}
      {!loading && !error && orders.length > 0 && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-3 px-3">
          {orders.map((order, idx) => {
            const config = statusConfig[order.status] || statusConfig.PENDING
            const StatusIcon = config.icon
            const initials = getInitials(order.storeName || '')
            const gradient = getGradient(order.storeName || '')
            const itemCount = order.items?.length || 0
            const progress = statusProgress[order.status] || 0

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ y: -3 }}
                className="min-w-[280px] sm:min-w-[300px] max-w-[320px] shrink-0 bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
              >
                {/* Card top - store info */}
                <div className="p-4 pb-3">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 + idx * 0.08, type: 'spring', stiffness: 400, damping: 25 }}
                      className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm`}
                    >
                      {initials}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Store className="h-3.5 w-3.5 text-primary shrink-0" />
                        <p className="font-semibold text-sm truncate">{order.storeName}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {timeAgo(order.createdAt)}
                        </span>
                        <span className="text-border">·</span>
                        <span className="text-[10px] text-muted-foreground">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span>
                      </div>
                    </div>
                    <Badge className={`${config.color} text-[9px] px-1.5 py-0 border-0 shrink-0`}>
                      <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                      {config.label}
                    </Badge>
                  </div>

                  {/* Items preview */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(order.items || []).slice(0, 3).map((item, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-secondary/60 text-muted-foreground px-2 py-0.5 rounded-full"
                      >
                        {item.quantity}x {item.productName.length > 18 ? item.productName.slice(0, 18) + '...' : item.productName}
                      </span>
                    ))}
                    {(order.items || []).length > 3 && (
                      <span className="text-[10px] text-primary font-medium px-1 py-0.5">
                        +{(order.items || []).length - 3} mais
                      </span>
                    )}
                  </div>

                  {/* Order progress bar */}
                  {order.status !== 'CANCELLED' && (
                    <div className="h-1 bg-muted/30 rounded-full overflow-hidden mb-3">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: 0.3 + idx * 0.1, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  )}

                  {/* Total and action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Total do pedido</p>
                      <p className="text-lg font-bold text-primary">{formatBRL(order.total)}</p>
                    </div>
                    <motion.div whileTap={{ scale: 0.92 }}>
                      <Button
                        size="sm"
                        className={`h-9 px-4 gap-1.5 text-xs font-semibold ${
                          reorderAnim === order.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                        onClick={() => handleReorder(order)}
                      >
                        <motion.div
                          animate={reorderAnim === order.id ? { rotate: 360 } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </motion.div>
                        {reorderAnim === order.id ? 'Adicionado!' : 'Repetir'}
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Bottom gradient accent line */}
                <div className="h-1 bg-gradient-to-r from-primary via-emerald-500 to-teal-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}
