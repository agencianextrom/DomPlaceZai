'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Package, CheckCircle2, XCircle, Clock, ChevronRight, Star, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/useAppStore'
import { formatBRL } from '@/components/product/ProductCard'
import type { OrderData } from '@/store/useAppStore'

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: ClipboardList },
  PREPARING: { label: 'Preparando', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Package },
  READY: { label: 'Pronto', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  DELIVERING: { label: 'Em entrega', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', icon: Package },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
}

const statusTimeline = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING']

export function OrdersView() {
  const { navigate, selectOrder, selectedOrderTab } = useAppStore()
  const [orders, setOrders] = useState<OrderData[]>([
    {
      id: '1', orderNumber: 'DP000001', storeId: '1', storeName: 'Mercado do Zé',
      status: 'DELIVERING', subtotal: 45.90, deliveryFee: 5.00, discount: 0, total: 50.90,
      paymentMethod: 'PIX', deliveryType: 'DELIVERY', createdAt: new Date().toISOString(),
      items: [{ productName: 'Açaí 500ml', quantity: 2, price: 15.00, total: 30.00 }, { productName: 'Granola', quantity: 1, price: 15.90, total: 15.90 }]
    },
    {
      id: '2', orderNumber: 'DP000002', storeId: '2', storeName: 'Padaria Pão Quente',
      status: 'PREPARING', subtotal: 22.50, deliveryFee: 5.00, discount: 0, total: 27.50,
      paymentMethod: 'CASH_ON_DELIVERY', deliveryType: 'DELIVERY', createdAt: new Date(Date.now() - 3600000).toISOString(),
      items: [{ productName: 'Pão Francês (6)', quantity: 1, price: 6.00, total: 6.00 }, { productName: 'Bolo de Chocolate', quantity: 1, price: 16.50, total: 16.50 }]
    },
    {
      id: '3', orderNumber: 'DP000003', storeId: '3', storeName: 'Farmácia Vida',
      status: 'DELIVERED', subtotal: 35.00, deliveryFee: 0, discount: 5.00, total: 30.00,
      paymentMethod: 'CREDIT_CARD', deliveryType: 'PICKUP', createdAt: new Date(Date.now() - 86400000).toISOString(),
      items: [{ productName: 'Vitamina C', quantity: 2, price: 17.50, total: 35.00 }]
    },
    {
      id: '4', orderNumber: 'DP000004', storeId: '4', storeName: 'Pet Shop Amigo Fiel',
      status: 'CANCELLED', subtotal: 89.90, deliveryFee: 0, discount: 0, total: 0,
      paymentMethod: 'PIX', deliveryType: 'DELIVERY', createdAt: new Date(Date.now() - 172800000).toISOString(),
      items: [{ productName: 'Ração Premium 15kg', quantity: 1, price: 89.90, total: 89.90 }]
    },
  ])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Data is initialized in useState above
  }, [])
  
  const filteredOrders = orders.filter(order => {
    if (selectedOrderTab === 'ongoing') return !['DELIVERED', 'CANCELLED'].includes(order.status)
    if (selectedOrderTab === 'completed') return order.status === 'DELIVERED'
    if (selectedOrderTab === 'cancelled') return order.status === 'CANCELLED'
    return true
  })
  
  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold mb-4">Meus Pedidos</h1>
        
        <Tabs value={selectedOrderTab} onValueChange={(v) => useAppStore.getState().setSelectedOrderTab(v)}>
          <TabsList className="w-full bg-secondary/50 rounded-lg mb-4">
            <TabsTrigger value="ongoing" className="flex-1 rounded-md">Em Andamento</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 rounded-md">Concluídos</TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1 rounded-md">Cancelados</TabsTrigger>
          </TabsList>
          
          {['ongoing', 'completed', 'cancelled'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p>Nenhum pedido encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const config = statusConfig[order.status] || statusConfig.PENDING
                    const StatusIcon = config.icon
                    return (
                      <button
                        key={order.id}
                        onClick={() => {
                          selectOrder(order)
                          navigate('order-detail')
                        }}
                        className="w-full bg-card rounded-xl border border-border p-4 text-left hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-sm">{order.storeName}</span>
                          </div>
                          <Badge className={`${config.color} border-0 text-xs`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <span>Pedido #{order.orderNumber}</span>
                          <span>•</span>
                          <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
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
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

export function OrderDetail() {
  const { selectedOrder, goBack } = useAppStore()
  
  if (!selectedOrder) return null
  
  const order = selectedOrder
  const config = statusConfig[order.status] || statusConfig.PENDING
  
  const currentStepIdx = statusTimeline.indexOf(order.status)
  
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
          </div>
        </div>
        
        {/* Timeline */}
        {order.status !== 'CANCELLED' && (
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-4">Acompanhamento</h3>
            <div className="space-y-4">
              {statusTimeline.map((status, idx) => {
                const isActive = idx <= currentStepIdx
                const isCurrent = status === order.status
                return (
                  <div key={status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-4 w-4 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'} ${isCurrent ? 'ring-4 ring-primary/20' : ''}`} />
                      {idx < statusTimeline.length - 1 && (
                        <div className={`h-8 w-0.5 ${isActive ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {statusConfig[status].label}
                      </p>
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
            <Button className="w-full bg-primary text-primary-foreground" onClick={goBack}>
              <Star className="h-4 w-4 mr-2" />
              Avaliar Pedido
            </Button>
            <Button variant="outline" className="w-full">
              Pedir Novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
