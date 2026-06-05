'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { ClipboardList, Package, CheckCircle2, XCircle, Clock, ChevronRight, Star, Store, Eye, RotateCcw, StarOff, Truck, MapPin, Filter, ArrowUpDown, X, Loader2, RefreshCw, PackageCheck, AlertTriangle, Ban, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'
import { DeliveryTracker } from './DeliveryTracker'
import { OrderTracker } from './OrderTracker'
import { OrderTimeline } from './OrderTimeline'
import { TipCalculator } from './TipCalculator'
import { OrderMap } from './OrderMap'
import { RateOrderModal } from './RateOrderModal'
import { OrderCancelModal } from './OrderCancelModal'
import { ReturnRequestModal } from './ReturnRequestModal'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { OrderData } from '@/store/useAppStore'
import { OrderInvoiceModal, type InvoiceItem } from './OrderInvoice'

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

// Payment method labels
const paymentLabels: Record<string, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  BOLETO: 'Boleto',
  CASH_ON_DELIVERY: 'Dinheiro na Entrega',
}

// Format date for grouping
function formatOrderDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const orderDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((today.getTime() - orderDay.getTime()) / 86400000)
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `Há ${diffDays} dias`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

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

// Status-based gradient left border (inline style object, no oklch)
function getStatusBorderGradient(status: string): string {
  switch (status) {
    case 'DELIVERED': return 'linear-gradient(180deg, rgba(16, 185, 129, 1), rgba(52, 211, 153, 0.5))'
    case 'CONFIRMED': return 'linear-gradient(180deg, rgba(59, 130, 246, 1), rgba(96, 165, 250, 0.5))'
    case 'DELIVERING': return 'linear-gradient(180deg, rgba(245, 158, 11, 1), rgba(251, 191, 36, 0.5))'
    case 'CANCELLED': return 'linear-gradient(180deg, rgba(239, 68, 68, 1), rgba(248, 113, 113, 0.5))'
    case 'PREPARING': return 'linear-gradient(180deg, rgba(251, 146, 60, 1), rgba(253, 186, 116, 0.5))'
    case 'READY': return 'linear-gradient(180deg, rgba(52, 211, 153, 1), rgba(110, 231, 183, 0.5))'
    case 'PENDING': return 'linear-gradient(180deg, rgba(251, 191, 36, 1), rgba(252, 211, 77, 0.5))'
    default: return 'linear-gradient(180deg, rgba(156, 163, 175, 1), rgba(209, 213, 219, 0.5))'
  }
}

function isActiveStatus(status: string): boolean {
  return !['DELIVERED', 'CANCELLED'].includes(status)
}

function isCompletedStatus(status: string): boolean {
  return status === 'DELIVERED'
}

// Loading skeleton for orders
function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-24" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function OrdersView() {
  const { navigate, selectOrder, selectedOrderTab, addToCart, setSelectedOrderTab, currentUser } = useAppStore()
  const [ratingOrder, setRatingOrder] = useState<OrderData | null>(null)
  const [cancelOrder, setCancelOrder] = useState<OrderData | null>(null)
  const [returnOrder, setReturnOrder] = useState<OrderData | null>(null)
  const [invoiceOrder, setInvoiceOrder] = useState<OrderData | null>(null)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [activeStatusFilter, setActiveStatusFilter] = useState('ALL')
  const [activeDateFilter, setActiveDateFilter] = useState('ALL')
  const [activeSort, setActiveSort] = useState('recent')
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = activeStatusFilter !== 'ALL' || activeDateFilter !== 'ALL' || activeSort !== 'recent'

  // Fetch orders from API
  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('limit', '50')
      if (currentUser?.id) {
        params.set('accountId', currentUser.id)
      }

      const response = await fetch(`/api/orders?${params.toString()}`)
      const data = await response.json() as { orders?: any[]; error?: string }

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar pedidos')
      }

      setOrders(data.orders || [])
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar pedidos')
      setOrders([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

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
      let addedCount = 0
      let totalQty = 0
      const addedProductIds: string[] = []

      order.items.forEach(item => {
        const fakeId = `reorder-${item.productName}-${order.id}`
        addToCart({
          id: fakeId,
          storeId: order.storeId,
          storeName: order.storeName,
          name: item.productName,
          slug: item.productName?.toLowerCase().replace(/\s+/g, '-') || '',
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
        addedProductIds.push(fakeId)
        addedCount++
        totalQty += item.quantity
      })

      if (addedCount > 0) {
        toast.success(`${totalQty} itens adicionados ao carrinho!`, {
          description: `Repetindo pedido #${order.orderNumber}`,
          action: (
            <Button
              size="sm"
              variant="outline"
              className="h-7 min-h-[44px] text-xs gap-1 mt-2"
              onClick={() => {
                toast.dismiss()
                // Undo: remove reordered items from cart
                addedProductIds.forEach(id => {
                  useAppStore.getState().removeFromCart(id)
                })
                toast.info('Itens removidos do carrinho')
              }}
            >
              Desfazer
            </Button>
          ),
          duration: 8000,
        })
      }

      navigate('cart')
    }
  }

  const handleRateOrder = (order: OrderData) => {
    setRatingOrder(order)
  }

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2 r62-heading-gradient">
            <span className="w-1 h-6 rounded-full bg-primary" />
            Meus Pedidos
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[44px] text-xs gap-1 active:scale-95 transition-transform"
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Filter toggle + results count */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              className="min-h-[44px] text-xs gap-1.5 active:scale-95 transition-transform"
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
            {!isLoading && (
              <span className="text-xs text-muted-foreground">
                {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
              </span>
            )}
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
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm r38-orders-pill-active'
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
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm r38-orders-pill-active'
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
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm r38-orders-pill-active'
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

        {/* Animated filter tabs with sliding underline */}
        <div className="relative mb-4">
          <div className="flex w-full bg-secondary/50 rounded-lg p-1 gap-1">
            {([
              { value: 'ongoing', label: 'Em Andamento' },
              { value: 'completed', label: 'Concluídos' },
              { value: 'cancelled', label: 'Cancelados' },
            ] as const).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedOrderTab(tab.value)}
                className={`relative flex-1 rounded-md py-2 text-xs font-semibold transition-colors z-10 r42-orders-tab-underline ${selectedOrderTab === tab.value ? 'r42-tab-active' : ''} ${
                  selectedOrderTab === tab.value
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {selectedOrderTab === tab.value && (
                  <motion.div
                    layoutId="r33-orders-tab-indicator"
                    className="absolute inset-0 bg-background rounded-md shadow-sm"
                    style={{ boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)' }}
                    transition={{ type: 'spring' as const, stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedOrderTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              {/* Loading state */}
              {isLoading && <OrdersSkeleton />}

              {/* Error state */}
              {error && !isLoading && (
                <div className="text-center py-12">
                  <XCircle className="h-12 w-12 mx-auto mb-3 text-destructive/40" />
                  <p className="text-sm font-medium text-destructive mb-2">{error}</p>
                  <Button variant="outline" size="sm" onClick={() => fetchOrders()} className="gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Tentar novamente
                  </Button>
                </div>
              )}

              {/* Empty state with floating icons and animated gradient bg */}
              {!isLoading && !error && filteredOrders.length === 0 && (
                <div className="text-center py-16 text-muted-foreground relative overflow-hidden rounded-xl">
                  {/* Floating icon decorations */}
                  <motion.span
                    className="absolute top-6 left-[15%] text-2xl pointer-events-none select-none"
                    animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >📦</motion.span>
                  <motion.span
                    className="absolute top-12 right-[20%] text-3xl pointer-events-none select-none"
                    animate={{ y: [0, -8, 0], rotate: [0, -8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  >🛒</motion.span>
                  <motion.span
                    className="absolute bottom-16 left-[25%] text-2xl pointer-events-none select-none"
                    animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  >🎁</motion.span>
                  <motion.span
                    className="absolute bottom-20 right-[15%] text-xl pointer-events-none select-none"
                    animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  >✨</motion.span>
                  <motion.span
                    className="absolute top-20 left-[45%] text-lg pointer-events-none select-none"
                    animate={{ y: [0, -8, 0], rotate: [0, -8, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                  >🏷️</motion.span>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative z-10"
                  >
                    <div className="relative inline-block">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ type: 'spring' as const, stiffness: 300, damping: 10, repeat: Infinity, repeatDelay: 0.5 }}
                        className="r42-orders-empty-float"
                      >
                        <motion.span
                          className="block text-5xl"
                          animate={{ rotate: [0, -8, 8, -8, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >📦</motion.span>
                      </motion.div>
                    </div>
                    <p className="font-medium text-base">Nenhum pedido encontrado</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-5">
                      {orders.length === 0
                        ? 'Faça sua primeira compra para ver seus pedidos aqui'
                        : 'Nenhum pedido corresponde aos filtros selecionados'
                      }
                    </p>
                    {orders.length === 0 && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button onClick={() => navigate('home')} size="sm" className="gap-1.5 r33-orders-cta-pulse">
                          <Store className="h-3.5 w-3.5" />
                          Explorar lojas
                        </Button>
                      </motion.div>
                    )}
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="block mx-auto text-sm text-primary hover:underline mt-2"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </motion.div>
                </div>
              )}

              {/* Orders list */}
              {!isLoading && !error && filteredOrders.length > 0 && (
                <div className="space-y-3">
                  {filteredOrders.map((order, idx) => {
                    const config = statusConfig[order.status] || statusConfig.PENDING
                    const StatusIcon = config.icon
                    const isOrderActive = isActiveStatus(order.status)
                    const isOrderCompleted = isCompletedStatus(order.status)
                    const currentStepIdx = statusTimeline.indexOf(order.status)
                    const progressPercent = Math.min(100, Math.round(((currentStepIdx + 1) / statusTimeline.length) * 100))

                    // Date separator: show when date changes
                    const prevOrder = idx > 0 ? filteredOrders[idx - 1] : null
                    const showDateSep = !prevOrder || new Date(order.createdAt).toDateString() !== new Date(prevOrder.createdAt).toDateString()
                    const dateLabel = formatOrderDate(order.createdAt)

                    return (
                      <React.Fragment key={order.id}>
                        {showDateSep && (
                          <div className="r38-orders-date-line">
                            <span className="r38-orders-date-label">{dateLabel}</span>
                          </div>
                        )}
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          type: 'spring' as const,
                          delay: idx * 0.12,
                          stiffness: 120,
                          damping: 14,
                        }}
                        whileHover={{ y: -2, scale: 1.005, transition: { type: 'spring' as const, stiffness: 400, damping: 25 }, boxShadow: '0 8px 24px rgba(16,185,129,0.12), 0 0 40px rgba(16,185,129,0.06)' }}
                        className={`w-full bg-card rounded-xl border border-border p-4 sm:p-5 transition-all r42-orders-card ${getStatusBorderGradient(order.status) ? '' : ''}`}
                        style={{
                          borderLeft: `4px solid transparent`,
                          borderImage: getStatusBorderGradient(order.status),
                          borderImageSlice: 1,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Store className="h-4 w-4 text-primary shrink-0" />
                            <span className="font-semibold text-sm truncate r38-orders-store-name">{order.storeName}</span>
                          </div>
                          <Badge className={`${config.gradient} border-0 text-[10px] font-semibold shrink-0 ml-2 ${isOrderActive ? 'r42-orders-badge-pulse' : ''} ${isOrderCompleted ? 'r33-orders-badge-shimmer' : ''} ${order.status === 'CANCELLED' ? 'r38-orders-badge-glow-red' : ''}`}>
                            <span className="inline-flex items-center">
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </span>
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <span>Pedido #{order.orderNumber}</span>
                          <span className="text-border">•</span>
                          <span>{timeAgo(order.createdAt)}</span>
                          <span className="text-border">•</span>
                          <span>{order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'itens'}</span>
                          {order.paymentMethod && (
                            <>
                              <span className="text-border">•</span>
                              <span>{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
                            </>
                          )}
                          <span className={`ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 ${order.deliveryType === 'PICKUP' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
                            {order.deliveryType === 'PICKUP' ? <MapPin className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                            <span className="text-[10px] font-medium">{order.deliveryType === 'PICKUP' ? 'Retirada' : 'Entrega'}</span>
                          </span>
                        </div>

                        {/* Mini timeline for active orders */}
                        {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                          <div className="mb-3 px-1">
                            <div className="flex items-center gap-1 mb-2">
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
                                      className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 r35-order-status-dot ${
                                        isActive
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted text-muted-foreground'
                                      } ${isCurrent ? 'ring-[3px] ring-primary/20 neon-glow-primary r42-orders-timeline-pulse' : ''}`}
                                    >
                                      <StepIcon className="h-2.5 w-2.5" />
                                    </motion.div>
                                    {i < 3 && (
                                      <motion.div
                                        className={`h-[2px] flex-1 rounded-full overflow-hidden r35-order-timeline-line r38-orders-timeline-connector ${i < stepIdx ? 'bg-gradient-to-r from-primary to-emerald-400' : 'bg-muted'}`}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                                      />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            {/* Delivery progress bar */}
                            <div className="r42-orders-progress-track">
                              <motion.div
                                className="r42-orders-progress-bar"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ type: 'spring' as const, stiffness: 120, damping: 20, delay: 0.3 + idx * 0.12 }}
                              />
                            </div>
                          </div>
                        )}

                        {order.items && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {order.items.slice(0, 2).map((item, i) => {
                              const img = (item as Record<string, unknown>).productImage as string | undefined
                              return img ? (
                                <span key={i} className="r38-orders-item-img-wrap inline-block h-8 w-8 flex-shrink-0">
                                  <img src={img} alt={item.productName} className="h-full w-full object-cover rounded-md" />
                                </span>
                              ) : (
                                <span key={i}>{item.quantity}x {item.productName}{i < Math.min(order.items!.length, 2) - 1 ? ', ' : ''}</span>
                              )
                            })}
                            {order.items.length > 2 && <span className="text-xs">e mais {order.items.length - 2}</span>}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-primary text-gradient-primary text-lg">{formatBRL(order.total)}</span>
                          <div className="flex flex-wrap gap-2">
                            {order.status === 'DELIVERED' && (
                              <>
                                <motion.div whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="min-h-[44px] text-xs gap-1 border-orange-300 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/20"
                                    onClick={() => setReturnOrder(order)}
                                  >
                                    <Undo2 className="h-3 w-3" />
                                    Devolver
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 sm:h-8 min-h-[44px] text-xs gap-1 r42-orders-reorder-btn r62-touch-ripple relative overflow-hidden font-semibold border-2 border-primary text-primary bg-primary/5 sm:bg-transparent"
                                  onClick={() => handleReorder(order)}
                                >
                                  <PackageCheck className="h-3 w-3" />
                                  Repetir
                                </Button>
                                </motion.div>
                                <Button
                                  size="sm"
                                  className="min-h-[44px] text-xs gap-1 bg-amber-500 hover:bg-amber-600 text-white r60-stars-glow"
                                  onClick={() => handleRateOrder(order)}
                                >
                                  <Star className="h-3 w-3" />
                                  Avaliar
                                </Button>
                              </>
                            )}
                            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="min-h-[44px] text-xs gap-1 border-red-300 text-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                                  onClick={() => setCancelOrder(order)}
                                >
                                  <Ban className="h-3 w-3" />
                                  Cancelar
                                </Button>
                              </motion.div>
                            )}
                            <motion.div whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="min-h-[44px] text-xs gap-1 border-primary/30 text-primary hover:bg-primary/5"
                                onClick={() => setInvoiceOrder(order)}
                              >
                                <ClipboardList className="h-3 w-3" />
                                Nota Fiscal
                              </Button>
                            </motion.div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-[44px] text-xs"
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
                      </React.Fragment>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
      </div>

      {/* Rate Order Modal */}
      <RateOrderModal
        order={ratingOrder!}
        isOpen={!!ratingOrder}
        onClose={() => setRatingOrder(null)}
      />

      {/* Cancel Order Modal */}
      <OrderCancelModal
        orderNumber={cancelOrder?.orderNumber || ''}
        orderItems={(cancelOrder?.items || []).map(item => ({
          name: item.productName,
          price: item.price,
          qty: item.quantity,
        }))}
        orderTotal={cancelOrder?.total || 0}
        isOpen={!!cancelOrder}
        onClose={() => setCancelOrder(null)}
        onCancel={(reason) => {
          toast.success('Pedido cancelado com sucesso', {
            description: `Motivo: ${reason}`,
          })
          fetchOrders()
          setCancelOrder(null)
        }}
      />

      {/* Invoice Modal */}
      <OrderInvoiceModal
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        orderNumber={invoiceOrder?.orderNumber || ''}
        items={(invoiceOrder?.items || []).map((item): InvoiceItem => ({ name: item.productName, qty: item.quantity, price: item.price }))}
        total={invoiceOrder?.total || 0}
        discount={invoiceOrder?.discount || 0}
        deliveryFee={invoiceOrder?.deliveryFee || 0}
        paymentMethod={invoiceOrder?.paymentMethod || ''}
        status={invoiceOrder?.status || ''}
        storeName={invoiceOrder?.storeName || ''}
        date={invoiceOrder?.createdAt || ''}
      />

      {/* Return Request Modal */}
      <ReturnRequestModal
        orderNumber={returnOrder?.orderNumber || ''}
        orderItems={(returnOrder?.items || []).map((item, idx) => ({
          id: `${returnOrder!.id}-${idx}`,
          name: item.productName,
          price: item.price,
          qty: item.quantity,
          image: (item as Record<string, unknown>).productImage as string | undefined,
        }))}
        isOpen={!!returnOrder}
        onClose={() => setReturnOrder(null)}
        onSubmit={(data) => {
          toast.success('Solicitação de devolução enviada', {
            description: `${data.items.length} item(ns) · ${formatBRL(data.items.reduce((s, i) => s + i.price * i.qty, 0))}`,
          })
          setReturnOrder(null)
        }}
      />
    </div>
  )
}

export function OrderDetail() {
  const { selectedOrder, goBack, addToCart, navigate, removeFromCart } = useAppStore()

  if (!selectedOrder) return null

  const order = selectedOrder
  const config = statusConfig[order.status] || statusConfig.PENDING

  const currentStepIdx = statusTimeline.indexOf(order.status)

  const handleReorder = () => {
    if (order.items) {
      let addedCount = 0
      let totalQty = 0
      const addedProductIds: string[] = []

      order.items.forEach(item => {
        const fakeId = `reorder-${item.productName}-${order.id}`
        addToCart({
          id: fakeId,
          storeId: order.storeId,
          storeName: order.storeName,
          name: item.productName,
          slug: item.productName?.toLowerCase().replace(/\s+/g, '-') || '',
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
        addedProductIds.push(fakeId)
        addedCount++
        totalQty += item.quantity
      })

      if (addedCount > 0) {
        toast.success(`${totalQty} itens adicionados ao carrinho!`, {
          description: `Repetindo pedido #${order.orderNumber}`,
          action: (
            <Button
              size="sm"
              variant="outline"
              className="h-7 min-h-[44px] text-xs gap-1 mt-2"
              onClick={() => {
                toast.dismiss()
                addedProductIds.forEach(id => {
                  removeFromCart(id)
                })
                toast.info('Itens removidos do carrinho')
              }}
            >
              Desfazer
            </Button>
          ),
          duration: 8000,
        })
      }

      navigate('cart')
    }
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-10 w-10 min-h-[44px] min-w-[44px]">
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

        {/* Payment & Delivery info */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Pagamento</p>
              <p className="font-medium">{paymentLabels[order.paymentMethod || ''] || order.paymentMethod || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tipo de entrega</p>
              <p className="font-medium">{order.deliveryType === 'PICKUP' ? 'Retirada na Loja' : 'Entrega'}</p>
            </div>
            {(order.deliveryType === 'DELIVERY' && order.deliveryAddress) && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Endereço de entrega</p>
                <p className="font-medium text-xs">{order.deliveryAddress}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Tracker for DELIVERING orders — visual map, driver info, timeline */}
        {order.status === 'DELIVERING' && (
          <OrderTracker
            orderNumber={order.orderNumber}
            storeName={order.storeName || 'Loja'}
          />
        )}

        {/* Order Map for DELIVERING orders */}
        {order.status === 'DELIVERING' && (
          <OrderMap
            storeName={order.storeName || 'Loja'}
            estimatedMinutes={25}
            orderId={order.id}
          />
        )}

        {/* Delivery Tracker for other active orders */}
        {(order.status === 'PREPARING' || order.status === 'CONFIRMED') && (
          <DeliveryTracker
            orderNumber={order.orderNumber}
            storeName={order.storeName || 'Loja'}
            status={order.status}
            estimatedTime="30-45 min"
            orderId={order.id}
          />
        )}

        {/* Timeline - Enhanced with OrderTimeline */}
        {order.status !== 'CANCELLED' && !['DELIVERING', 'PREPARING', 'CONFIRMED'].includes(order.status) && (
          <OrderTimeline
            orderNumber={order.orderNumber}
            status={order.status}
            estimatedMinutes={30}
            storeName={order.storeName || undefined}
            createdAt={order.createdAt}
          />
        )}

        {/* OrderTimeline for active orders */}
        {['DELIVERING', 'PREPARING', 'CONFIRMED'].includes(order.status) && (
          <OrderTimeline
            orderNumber={order.orderNumber}
            status={order.status}
            estimatedMinutes={25}
            storeName={order.storeName || undefined}
            createdAt={order.createdAt}
          />
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
              <span className="font-bold text-primary text-gradient-primary">{formatBRL(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {order.status === 'DELIVERED' && (
          <div className="space-y-2">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2" onClick={() => {
              useAppStore.getState().selectOrder(order)
              navigate('orders')
            }}>
              <Star className="h-4 w-4" />
              Avaliar Pedido
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={handleReorder}>
              <PackageCheck className="h-4 w-4" />
              Repetir Pedido
            </Button>
          </div>
        )}

        {order.status === 'DELIVERING' && (
          <>
            <Button variant="outline" className="w-full gap-2" onClick={() => {
              // TODO: Should come from store/driver data (order.driver.phone)
              const WHATSAPP_SUPPORT_PHONE = '919998887766'
              window.open(`https://wa.me/55${WHATSAPP_SUPPORT_PHONE}`, '_blank')
            }}>
              Falar com entregador
            </Button>

            <TipCalculator
              driverName="Carlos Silva"
              driverRating={4.8}
              driverVehicle="Moto Honda CG 160"
              orderTotal={order.total || 0}
            />
          </>
        )}
      </div>
    </div>
  )
}
