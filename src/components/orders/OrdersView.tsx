'use client'

import { useState, useEffect, useMemo } from 'react'
import { ClipboardList, Package, CheckCircle2, XCircle, Clock, ChevronRight, Star, Store, Eye, RotateCcw, StarOff, Truck, MapPin, Filter, ArrowUpDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'
import { StarRating } from '@/components/ui/StarRating'
import { DeliveryTracker } from './DeliveryTracker'
import { OrderMap } from './OrderMap'
import { RateOrderModal } from './RateOrderModal'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { OrderData } from '@/store/useAppStore'

const statusConfig: Record<string, { label: string; color: string; icon: any; gradient: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock, gradient: 'badge-gradient-amber' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', icon: ClipboardList, gradient: 'badge-gradient-emerald' },
  PREPARING: { label: 'Preparando', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Package, gradient: 'badge-gradient-amber' },
  READY: { label: 'Pronto', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2, gradient: 'badge-gradient-emerald' },
  DELIVERING: { label: 'Em entrega', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: Package, gradient: 'badge-gradient-emerald' },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2, gradient: 'badge-gradient-emerald' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, gradient: 'badge-gradient-red' },
}

const statusTimeline = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING']

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Agora'
  if (mins < 60) return `Há ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Ontem'
  return `Há ${days} dias`
}

// Status filter options
const statusFilters = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'DELIVERING', label: 'Entregando' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

// Date range filter options
const dateFilters = [
  { value: 'ALL', label: 'Todos' },
  { value: 'TODAY', label: 'Hoje' },
  { value: 'WEEK', label: 'Esta semana' },
  { value: 'MONTH', label: 'Este mês' },
  { value: 'QUARTER', label: 'Últimos 3 meses' },
]

// Sort options
const sortOptions = [
  { value: 'recent', label: 'Mais recente' },
  { value: 'oldest', label: 'Mais antigo' },
  { value: 'highest', label: 'Maior valor' },
  { value: 'lowest', label: 'Menor valor' },
]

function getDateFilterFn(dateValue: string): ((date: string) => boolean) | null {
  const now = Date.now()
  const dayMs = 86400000
  switch (dateValue) {
    case 'TODAY': return (d) => now - new Date(d).getTime() < dayMs
    case 'WEEK': return (d) => now - new Date(d).getTime() < 7 * dayMs
    case 'MONTH': return (d) => now - new Date(d).getTime() < 30 * dayMs
    case 'QUARTER': return (d) => now - new Date(d).getTime() < 90 * dayMs
    default: return null
  }
}

function getSortFn(sortValue: string): ((a: OrderData, b: OrderData) => number) {
  switch (sortValue) {
    case 'oldest': return (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    case 'highest': return (a, b) => b.total - a.total
    case 'lowest': return (a, b) => a.total - b.total
    default: return (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  }
}

export function OrdersView() {
  const { navigate, selectOrder, selectedOrderTab, addToCart, setSelectedOrderTab } = useAppStore()
  const [ratingOrder, setRatingOrder] = useState<OrderData | null>(null)
  const [orders] = useState<OrderData[]>([
    {
      id: '1', orderNumber: 'DP000001', storeId: '5', storeName: 'Padaria Pão Quente',
      status: 'DELIVERING', subtotal: 47.50, deliveryFee: 5.00, discount: 0, total: 52.50,
      paymentMethod: 'PIX', deliveryType: 'DELIVERY', createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      items: [
        { productName: 'Pão Francês (6 un)', quantity: 2, price: 6.00, total: 12.00 },
        { productName: 'Bolo de Chocolate', quantity: 1, price: 16.50, total: 16.50 },
        { productName: 'Coxinha de Frango (10 un)', quantity: 1, price: 19.00, total: 19.00 },
      ],
    },
    {
      id: '2', orderNumber: 'DP000002', storeId: '1', storeName: 'Mercado do Zé',
      status: 'DELIVERED', subtotal: 84.70, deliveryFee: 5.00, discount: 0, total: 89.70,
      paymentMethod: 'CREDIT_CARD', deliveryType: 'DELIVERY', createdAt: new Date(Date.now() - 86400000).toISOString(),
      items: [
        { productName: 'Arroz Tio João 5kg', quantity: 1, price: 24.90, total: 24.90 },
        { productName: 'Feijão Carioca 1kg', quantity: 2, price: 8.90, total: 17.80 },
        { productName: 'Óleo de Soja 900ml', quantity: 1, price: 7.49, total: 7.49 },
        { productName: 'Açúcar Cristal 1kg', quantity: 2, price: 5.49, total: 10.98 },
        { productName: 'Adubo NPK 20kg', quantity: 1, price: 23.53, total: 23.53 },
      ],
    },
    {
      id: '3', orderNumber: 'DP000003', storeId: '2', storeName: 'Açaí da Boa',
      status: 'PREPARING', subtotal: 34.00, deliveryFee: 3.00, discount: 0, total: 37.00,
      paymentMethod: 'PIX', deliveryType: 'DELIVERY', createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      items: [
        { productName: 'Açaí 500ml', quantity: 1, price: 15.00, total: 15.00 },
        { productName: 'Açaí Premium 700ml', quantity: 1, price: 19.00, total: 19.00 },
      ],
    },
    {
      id: '4', orderNumber: 'DP000004', storeId: '3', storeName: 'Farmácia Vida',
      status: 'CANCELLED', subtotal: 89.90, deliveryFee: 0, discount: 0, total: 0,
      paymentMethod: 'PIX', deliveryType: 'DELIVERY', createdAt: new Date(Date.now() - 172800000).toISOString(),
      items: [{ productName: 'Ração Premium 15kg', quantity: 1, price: 89.90, total: 89.90 }],
    },
    {
      id: '5', orderNumber: 'DP000005', storeId: '8', storeName: 'Salão da Bella',
      status: 'CONFIRMED', subtotal: 95.00, deliveryFee: 0, discount: 0, total: 95.00,
      paymentMethod: 'CREDIT_CARD', deliveryType: 'PICKUP', createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      items: [
        { productName: 'Corte Feminino', quantity: 1, price: 45.00, total: 45.00 },
        { productName: 'Hidratação Capilar', quantity: 1, price: 50.00, total: 50.00 },
      ],
    },
    {
      id: '6', orderNumber: 'DP000006', storeId: '4', storeName: 'Farmácia Vida',
      status: 'PENDING', subtotal: 55.00, deliveryFee: 0, discount: 5.00, total: 50.00,
      paymentMethod: 'PIX', deliveryType: 'DELIVERY', createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      items: [
        { productName: 'Vitamina C 500mg', quantity: 1, price: 35.00, total: 35.00 },
        { productName: 'Pomada Cicatrizante', quantity: 1, price: 20.00, total: 20.00 },
      ],
    },
  ])

  // Filter states
  const [activeStatusFilter, setActiveStatusFilter] = useState('ALL')
  const [activeDateFilter, setActiveDateFilter] = useState('ALL')
  const [activeSort, setActiveSort] = useState('recent')
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = activeStatusFilter !== 'ALL' || activeDateFilter !== 'ALL' || activeSort !== 'recent'

  // Apply filters
  const filteredOrders = useMemo(() => {
    let result = orders

    // Tab filter
    result = result.filter(order => {
      if (selectedOrderTab === 'ongoing') return !['DELIVERED', 'CANCELLED'].includes(order.status)
      if (selectedOrderTab === 'completed') return order.status === 'DELIVERED'
      if (selectedOrderTab === 'cancelled') return order.status === 'CANCELLED'
      return true
    })

    // Status filter
    if (activeStatusFilter !== 'ALL') {
      result = result.filter(o => o.status === activeStatusFilter)
    }

    // Date filter
    const dateFn = getDateFilterFn(activeDateFilter)
    if (dateFn) {
      result = result.filter(o => dateFn(o.createdAt))
    }

    // Sort
    result = [...result].sort(getSortFn(activeSort))

    return result
  }, [orders, selectedOrderTab, activeStatusFilter, activeDateFilter, activeSort])

  const clearFilters = () => {
    setActiveStatusFilter('ALL')
    setActiveDateFilter('ALL')
    setActiveSort('recent')
  }

  const handleReorder = (order: OrderData) => {
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
      navigate('cart')
    }
  }

  const handleRateOrder = (order: OrderData) => {
    setRatingOrder(order)
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-primary" />
          Meus Pedidos
        </h1>

        {/* Filter toggle + results count */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-3 w-3" />
              Filtros
              {hasActiveFilters && (
                <span className="h-4 w-4 rounded-full bg-white text-primary text-[10px] flex items-center justify-center font-bold">
                  {[activeStatusFilter !== 'ALL', activeDateFilter !== 'ALL', activeSort !== 'recent'].filter(Boolean).length}
                </span>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
            </span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Limpar filtros
            </button>
          )}
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                {/* Status filter chips */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {statusFilters.map(filter => (
                      <motion.button
                        key={filter.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveStatusFilter(filter.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          activeStatusFilter === filter.value
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                        }`}
                      >
                        {filter.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Date range filter */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Período</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dateFilters.map(filter => (
                      <motion.button
                        key={filter.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveDateFilter(filter.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          activeDateFilter === filter.value
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                        }`}
                      >
                        {filter.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Ordenar por</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sortOptions.map(opt => (
                      <motion.button
                        key={opt.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveSort(opt.value)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          activeSort === opt.value
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-card text-muted-foreground border-border hover:border-amber-300 hover:text-foreground'
                        }`}
                      >
                        <ArrowUpDown className="h-2.5 w-2.5" />
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs value={selectedOrderTab} onValueChange={(v) => setSelectedOrderTab(v)}>
          <TabsList className="w-full bg-secondary/50 rounded-lg mb-4">
            <TabsTrigger value="ongoing" className="flex-1 rounded-md">Em Andamento</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 rounded-md">Concluídos</TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1 rounded-md">Cancelados</TabsTrigger>
          </TabsList>

          {['ongoing', 'completed', 'cancelled'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p>Nenhum pedido encontrado</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary hover:underline mt-1"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order, idx) => {
                    const config = statusConfig[order.status] || statusConfig.PENDING
                    const StatusIcon = config.icon
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                        className="w-full bg-card rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/15 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Store className="h-4 w-4 text-primary shrink-0" />
                            <span className="font-semibold text-sm truncate">{order.storeName}</span>
                          </div>
                          <Badge className={`${config.gradient} border-0 text-[10px] font-semibold shrink-0 ml-2`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <span>Pedido #{order.orderNumber}</span>
                          <span className="text-border">•</span>
                          <span>{timeAgo(order.createdAt)}</span>
                          <span className="text-border">•</span>
                          <span>{order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'itens'}</span>
                          <span className={`ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 ${order.deliveryType === 'PICKUP' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
                            {order.deliveryType === 'PICKUP' ? <MapPin className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                            <span className="text-[10px] font-medium">{order.deliveryType === 'PICKUP' ? 'Retirada' : 'Entrega'}</span>
                          </span>
                        </div>

                        {/* Mini timeline for active orders */}
                        {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                          <div className="flex items-center gap-1 mb-3 px-1">
                            {statusTimeline.slice(0, 4).map((s, i) => {
                              const stepIdx = statusTimeline.indexOf(order.status)
                              const isActive = i <= stepIdx
                              const isCurrent = s === order.status
                              const StepConfig = statusConfig[s]
                              const StepIcon = StepConfig.icon
                              return (
                                <div key={s} className="flex items-center flex-1">
                                  <motion.div
                                    animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                    className={`relative h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                                      isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                    } ${isCurrent ? 'ring-[3px] ring-primary/20 neon-glow-primary' : ''}`}
                                  >
                                    <StepIcon className="h-2.5 w-2.5" />
                                  </motion.div>
                                  {i < 3 && (
                                    <motion.div
                                      className={`h-[2px] flex-1 rounded-full ${i < stepIdx ? 'bg-primary' : 'bg-muted'}`}
                                      initial={{ scaleX: 0 }}
                                      animate={{ scaleX: 1 }}
                                      transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                                    />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {order.items && (
                          <div className="text-sm text-muted-foreground">
                            {order.items.slice(0, 2).map((item, i) => (
                              <span key={i}>
                                {item.quantity}x {item.productName}{i < Math.min(order.items!.length, 2) - 1 ? ', ' : ''}
                              </span>
                            ))}
                            {order.items.length > 2 && ` e mais ${order.items.length - 2}`}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-primary">{formatBRL(order.total)}</span>
                          <div className="flex gap-2">
                            {order.status === 'DELIVERED' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs gap-1"
                                  onClick={() => handleReorder(order)}
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  Repetir
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 text-xs gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                                  onClick={() => handleRateOrder(order)}
                                >
                                  <Star className="h-3 w-3" />
                                  Avaliar
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => {
                                selectOrder(order)
                                navigate('order-detail')
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Rate Order Modal */}
      <RateOrderModal
        order={ratingOrder!}
        isOpen={!!ratingOrder}
        onClose={() => setRatingOrder(null)}
      />
    </div>
  )
}

export function OrderDetail() {
  const { selectedOrder, goBack, addToCart, navigate } = useAppStore()

  if (!selectedOrder) return null

  const order = selectedOrder
  const config = statusConfig[order.status] || statusConfig.PENDING

  const currentStepIdx = statusTimeline.indexOf(order.status)

  const handleReorder = () => {
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
      navigate('cart')
    }
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-10 w-10">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Pedido #{order.orderNumber}</h1>
            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-4">
        {/* Status */}
        <div className={`${config.color} rounded-xl p-4 flex items-center gap-3`}>
          <config.icon className="h-6 w-6" />
          <div>
            <p className="font-semibold">{config.label}</p>
            {order.status === 'DELIVERING' && <p className="text-xs opacity-80">Seu pedido está a caminho!</p>}
            {order.status === 'DELIVERED' && <p className="text-xs opacity-80">Pedido entregue com sucesso</p>}
            {order.status === 'PREPARING' && <p className="text-xs opacity-80">A loja está preparando seu pedido</p>}
            {order.status === 'CONFIRMED' && <p className="text-xs opacity-80">Pedido confirmado pela loja</p>}
            {order.status === 'CANCELLED' && <p className="text-xs opacity-80">Este pedido foi cancelado</p>}
          </div>
        </div>

        {/* Order Map for DELIVERING orders */}
        {order.status === 'DELIVERING' && (
          <OrderMap
            storeName={order.storeName || 'Loja'}
            estimatedMinutes={25}
          />
        )}

        {/* Delivery Tracker for other active orders */}
        {(order.status === 'PREPARING' || order.status === 'CONFIRMED') && (
          <DeliveryTracker
            orderNumber={order.orderNumber}
            storeName={order.storeName || 'Loja'}
            status={order.status}
            estimatedTime="30-45 min"
          />
        )}

        {/* Timeline */}
        {order.status !== 'CANCELLED' && !['DELIVERING', 'PREPARING', 'CONFIRMED'].includes(order.status) && (
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-4">Acompanhamento</h3>
            <div className="space-y-4">
              {statusTimeline.map((status, idx) => {
                const isActive = idx <= currentStepIdx
                const isCurrent = status === order.status
                const stepConfig = statusConfig[status]
                const StepIcon = stepConfig.icon
                return (
                  <div key={status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                        <StepIcon className="h-4 w-4" />
                      </div>
                      {idx < statusTimeline.length - 1 && (
                        <div className={`h-8 w-0.5 ${isActive ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {stepConfig.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-muted-foreground mt-0.5">Etapa atual</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-secondary/30">
            <Store className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{order.storeName}</span>
          </div>
          <div className="p-4 space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">{item.quantity}x</span>
                  <span className="ml-1">{item.productName}</span>
                </div>
                <span className="font-medium">{formatBRL(item.total)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatBRL(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto</span>
                <span>-{formatBRL(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Entrega</span>
              <span>{order.deliveryFee === 0 ? 'Grátis' : formatBRL(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatBRL(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {order.status === 'DELIVERED' && (
          <div className="space-y-2">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2" onClick={() => {
              selectOrder(order)
              navigate('orders')
            }}>
              <Star className="h-4 w-4" />
              Avaliar Pedido
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={handleReorder}>
              <RotateCcw className="h-4 w-4" />
              Repetir Pedido
            </Button>
          </div>
        )}

        {order.status === 'DELIVERING' && (
          <Button variant="outline" className="w-full gap-2" onClick={() => {
            const phone = '919998887766'
            window.open(`https://wa.me/55${phone}`, '_blank')
          }}>
            Falar com entregador
          </Button>
        )}
      </div>
    </div>
  )
}
