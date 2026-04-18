'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingBag, Store, ChevronRight, RotateCcw, Clock,
  CheckCircle, Truck, Package, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

const storeInitials: Record<string, string> = {
  'Mercado do Ze': 'MZ',
  'Mercado do Zé': 'MZ',
  'Acai da Boa': 'AB',
  'Açaí da Boa': 'AB',
  'Padaria Pao Quente': 'PP',
  'Padaria Pão Quente': 'PP',
  'Farmacia Vida': 'FV',
  'Farmácia Vida': 'FV',
}

const storeGradients: Record<string, string> = {
  'Mercado do Zé': 'from-emerald-500 to-green-600',
  'Açaí da Boa': 'from-purple-500 to-rose-600',
  'Padaria Pão Quente': 'from-amber-500 to-orange-600',
  'Farmácia Vida': 'from-teal-500 to-cyan-600',
}

const defaultGradient = 'from-primary to-emerald-600'

export function RecentOrders() {
  const { navigate, addToCart } = useAppStore()
  const [reorderAnim, setReorderAnim] = useState<string | null>(null)

  // Mock recent orders (last 3)
  const orders: OrderData[] = [
    {
      id: 'ro1',
      orderNumber: 'DP000006',
      storeId: 's1',
      storeName: 'Mercado do Zé',
      status: 'DELIVERED',
      subtotal: 67.80,
      deliveryFee: 5.00,
      discount: 0,
      total: 72.80,
      paymentMethod: 'PIX',
      deliveryType: 'DELIVERY',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      items: [
        { productName: 'Arroz Tio João 5kg', quantity: 1, price: 24.90, total: 24.90 },
        { productName: 'Feijão Carioca 1kg', quantity: 2, price: 8.90, total: 17.80 },
        { productName: 'Óleo de Soja 900ml', quantity: 1, price: 7.49, total: 7.49 },
        { productName: 'Açúcar Cristal 1kg', quantity: 2, price: 5.49, total: 10.98 },
      ],
    },
    {
      id: 'ro2',
      orderNumber: 'DP000005',
      storeId: 's2',
      storeName: 'Açaí da Boa',
      status: 'DELIVERED',
      subtotal: 34.00,
      deliveryFee: 3.00,
      discount: 0,
      total: 37.00,
      paymentMethod: 'PIX',
      deliveryType: 'DELIVERY',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      items: [
        { productName: 'Açaí 500ml', quantity: 1, price: 15.00, total: 15.00 },
        { productName: 'Açaí Premium 700ml', quantity: 1, price: 19.00, total: 19.00 },
      ],
    },
    {
      id: 'ro3',
      orderNumber: 'DP000004',
      storeId: 's5',
      storeName: 'Padaria Pão Quente',
      status: 'DELIVERED',
      subtotal: 47.50,
      deliveryFee: 5.00,
      discount: 0,
      total: 52.50,
      paymentMethod: 'CREDIT_CARD',
      deliveryType: 'DELIVERY',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      items: [
        { productName: 'Pão Francês (6 un)', quantity: 2, price: 6.00, total: 12.00 },
        { productName: 'Bolo de Chocolate', quantity: 1, price: 16.50, total: 16.50 },
        { productName: 'Coxinha de Frango (10 un)', quantity: 1, price: 19.00, total: 19.00 },
      ],
    },
  ]

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

  const getInitials = (storeName: string) => storeInitials[storeName] || storeName.split(' ').map(w => w[0]).join('').slice(0, 2)

  const getGradient = (storeName: string) => storeGradients[storeName] || defaultGradient

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

      {/* Horizontal scrollable cards */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-3 px-3">
        {orders.map((order, idx) => {
          const config = statusConfig[order.status] || statusConfig.PENDING
          const StatusIcon = config.icon
          const initials = getInitials(order.storeName || '')
          const gradient = getGradient(order.storeName || '')
          const itemCount = order.items?.length || 0

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
    </section>
  )
}
