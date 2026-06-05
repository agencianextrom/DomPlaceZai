'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, Phone, MessageCircle, Share2, AlertTriangle, MapPin, Clock,
  Package, CheckCircle2, Circle, ChevronDown, ChevronUp, Star,
  Route, Navigation, History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

/* ═══ Types ═══ */

interface TimelineStep {
  step: string; label: string; time: string; completed: boolean; current?: boolean
}

interface ActiveDelivery {
  orderNumber: string; storeName: string; storeEmoji: string
  driver: { name: string; avatar: string; rating: number; since: string; vehicle: string }
  status: string; eta: string; etaMinutes: number; distance: string
  items: number; total: number; payment: string; timeline: TimelineStep[]
}

interface PastDelivery {
  id: string; store: string; date: string; rated: boolean
}

/* ═══ Mock Data ═══ */

const activeDelivery: ActiveDelivery = {
  orderNumber: '#1234', storeName: 'Padaria Doce Pão', storeEmoji: '🍞',
  driver: { name: 'Roberto Silva', avatar: '🧑', rating: 4.8, since: '2022', vehicle: '🛵 Motocicleta' },
  status: 'in_transit', eta: '15:30', etaMinutes: 25, distance: '2.4 km',
  items: 3, total: 47.8, payment: 'Pagamento na entrega',
  timeline: [
    { step: 'confirmed', label: 'Pedido confirmado', time: '14:30', completed: true },
    { step: 'preparing', label: 'Preparando seu pedido', time: '14:35', completed: true },
    { step: 'dispatched', label: 'Saiu para entrega', time: '14:50', completed: true },
    { step: 'in_transit', label: 'Em trânsito', time: '15:05', completed: false, current: true },
    { step: 'delivered', label: 'Entregue', time: '15:30', completed: false },
  ],
}

const pastDeliveries: PastDelivery[] = [
  { id: '#1230', store: 'Supermercado Bom Preço', date: '03/06', rated: true },
  { id: '#1225', store: 'Farmácia Popular', date: '01/06', rated: false },
  { id: '#1218', store: 'Açougue do Seu João', date: '29/05', rated: true },
]

const ORDER_ITEMS = [
  { name: 'Pão Francês (6 un.)', qty: 'R$ 8,90' },
  { name: 'Bolo de Chocolate', qty: 'R$ 22,40' },
  { name: 'Suco de Laranja Natural', qty: 'R$ 16,50' },
]

/* ═══ Loading Skeleton ═══ */

function LoadingSkeleton() {
  return (
    <Card className="r86-delivery-skeleton overflow-hidden">
      <CardHeader className="pb-2">
        <div className="h-6 w-48 rounded-md bg-muted animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </CardContent>
    </Card>
  )
}

/* ═══ Empty State ═══ */

function EmptyState({ hasData }: { hasData: boolean }) {
  if (hasData) return null
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="r86-delivery-empty flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
        className="text-6xl mb-4"
      >
        🚚
      </motion.div>
      <p className="text-sm font-semibold mb-1">Nenhuma entrega em andamento</p>
      <p className="text-xs text-muted-foreground mb-4">Seus pedidos aparecerão aqui quando enviados</p>
      <Button variant="outline" className="r86-delivery-empty-btn min-h-[44px] text-xs font-semibold">
        Ver pedidos
      </Button>
    </motion.div>
  )
}

/* ═══ Delivery Timeline ═══ */

function DeliveryTimeline({ timeline }: { timeline: TimelineStep[] }) {
  return (
    <div className="r86-delivery-timeline">
      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-indigo-500" />
        Status da entrega
      </h4>
      <div className="relative space-y-0">
        {timeline.map((item, idx) => {
          const isLast = idx === timeline.length - 1
          return (
            <div key={item.step} className="relative flex gap-3">
              {!isLast && (
                <div className="absolute left-[15px] top-[32px] w-[2px] bottom-0 z-0">
                  <motion.div
                    className="w-full rounded-full"
                    style={{
                      background: item.completed
                        ? 'linear-gradient(to bottom, #22c55e, #22c55e)'
                        : 'repeating-linear-gradient(to bottom, #d1d5db, #d1d5db 4px, transparent 4px, transparent 8px)',
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ delay: idx * 0.15, duration: 0.4, ease: 'easeOut' as const }}
                  />
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.12, type: 'spring' as const, stiffness: 300, damping: 22 }}
                className="r86-delivery-timeline-dot relative z-10 flex items-center justify-center h-[30px] w-[30px] rounded-full shrink-0"
                style={{
                  backgroundColor: item.completed ? '#22c55e' : item.current ? 'rgba(99,102,241,0.12)' : 'rgba(148,163,184,0.08)',
                  border: item.current ? '2px solid #6366f1' : 'none',
                }}
              >
                {item.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : item.current ? (
                  <motion.div
                    className="h-3 w-3 rounded-full bg-indigo-500"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                  />
                ) : (
                  <Circle className="h-3 w-3 text-slate-400" />
                )}
                {item.current && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-indigo-400/40"
                    animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' as const }}
                  />
                )}
              </motion.div>
              <div className="pt-1 pb-5 min-w-0">
                <p className={`text-xs font-semibold ${item.completed ? 'text-green-700 dark:text-green-400' : item.current ? 'text-indigo-700 dark:text-indigo-400' : 'text-muted-foreground'}`}>
                  {item.completed ? '✅' : item.current ? '🔄' : '⭕'} {item.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══ Map Placeholder ═══ */

function MapPlaceholder({ eta, etaMinutes, distance }: { eta: string; etaMinutes: number; distance: string }) {
  const [countdown, setCountdown] = useState(etaMinutes)

  useEffect(() => {
    const interval = setInterval(() => setCountdown((prev) => Math.max(0, prev - 1)), 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="r86-delivery-map relative rounded-xl overflow-hidden min-h-[160px] flex flex-col items-center justify-center gap-3"
      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(59,130,246,0.06), rgba(6,182,212,0.04))', border: '1px solid rgba(99,102,241,0.15)' }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
        className="text-4xl"
      >
        📍
      </motion.div>
      <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">Mapa em tempo real</p>
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Previsão: {eta} ({countdown > 0 ? countdown : '<1'} min)
        </span>
        <span className="flex items-center gap-1">
          <Navigation className="h-3 w-3" />
          {distance} de distância
        </span>
      </div>
    </motion.div>
  )
}

/* ═══ Order Details (Collapsible) ═══ */

function OrderDetails({ delivery }: { delivery: ActiveDelivery }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="r86-delivery-order-details">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="r86-delivery-details-toggle w-full min-h-[44px] flex items-center justify-between px-0 hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-semibold">
              {delivery.items} itens • R$ {delivery.total.toFixed(2).replace('.', ',')}
            </span>
            <Badge variant="secondary" className="text-[9px] font-semibold">{delivery.payment}</Badge>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </motion.div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Separator className="my-2" />
              <div className="space-y-2 pt-2 pb-1">
                {ORDER_ITEMS.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{item.qty}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  )
}

/* ═══ Actions Bar ═══ */

function ActionsBar({ driverName }: { driverName: string }) {
  const actions = [
    { icon: Phone, label: 'Ligar para Entregador', msg: `Ligando para ${driverName}...`, gradient: 'from-indigo-500 to-blue-500' },
    { icon: MessageCircle, label: 'Chat com Entregador', msg: 'Abrindo chat...', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Share2, label: 'Compartilhar Status', msg: 'Link copiado!', gradient: 'from-cyan-500 to-teal-500' },
    { icon: AlertTriangle, label: 'Reportar Problema', msg: 'Problema reportado', gradient: 'from-amber-500 to-orange-500' },
  ]

  return (
    <div className="r86-delivery-actions grid grid-cols-2 gap-2">
      {actions.map((action) => (
        <motion.div key={action.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            variant="outline"
            className={`r86-delivery-action-btn min-h-[44px] w-full text-[11px] font-semibold bg-gradient-to-r ${action.gradient} text-white border-0 hover:opacity-90`}
            onClick={() => toast(action.msg)}
          >
            <action.icon className="h-3.5 w-3.5 mr-1.5" />
            {action.label}
          </Button>
        </motion.div>
      ))}
    </div>
  )
}

/* ═══ Delivery History ═══ */

function DeliveryHistory({ deliveries }: { deliveries: PastDelivery[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="r86-delivery-history"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <History className="h-4 w-4 text-indigo-500" />
          Entregas anteriores
        </h4>
      </div>
      <div className="space-y-2">
        {deliveries.map((d, idx) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + idx * 0.08 }}
            className="r86-delivery-history-item flex items-center justify-between rounded-lg border border-border/50 p-3"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{d.id} — {d.store}</p>
              <p className="text-[10px] text-muted-foreground">Entregue em {d.date}</p>
            </div>
            <Button
              variant="ghost" size="sm"
              className="r86-delivery-rate-btn min-h-[44px] text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 shrink-0 ml-2"
              onClick={() => toast(`Avaliando entrega ${d.id}`)}
            >
              <Star className={`h-3 w-3 mr-1 ${d.rated ? 'fill-amber-400 text-amber-400' : ''}`} />
              {d.rated ? 'Avaliado' : 'Avaliar'}
            </Button>
          </motion.div>
        ))}
      </div>
      <Button variant="link" className="r86-delivery-history-link w-full mt-2 text-xs font-semibold text-indigo-600">
        Ver histórico completo
      </Button>
    </motion.div>
  )
}

/* ═══ Main Component ═══ */

export function DeliveryTracker() {
  const [loading, setLoading] = useState(true)
  const [showDelivery] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const statusLabel = useMemo(() => {
    switch (activeDelivery.status) {
      case 'in_transit': return 'Em trânsito'
      case 'delivered': return 'Entregue'
      case 'preparing': return 'Preparando'
      default: return 'Em andamento'
    }
  }, [])

  if (loading) return <LoadingSkeleton />

  return (
    <AnimatePresence mode="wait">
      {!showDelivery ? (
        <EmptyState hasData={false} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
          className="r86-delivery-tracker space-y-4"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6, #06b6d4)' }}
            >
              <Truck className="h-5 w-5 text-white" />
            </div>
            <h2
              className="r62-heading-gradient text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Acompanhar Entrega
            </h2>
          </div>

          {/* Active Delivery Card */}
          <Card className="r62-card-lift r86-delivery-card overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activeDelivery.storeEmoji}</span>
                  <div>
                    <CardTitle className="text-sm">{activeDelivery.storeName}</CardTitle>
                    <p className="text-[10px] text-muted-foreground">Pedido {activeDelivery.orderNumber}</p>
                  </div>
                </div>
                <Badge className="r86-delivery-status-badge text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-0 gap-1">
                  <motion.span
                    className="inline-block h-2 w-2 rounded-full bg-indigo-500"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  {statusLabel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Driver info */}
              <div
                className="r86-delivery-driver flex items-center gap-3 rounded-lg p-3"
                style={{ backgroundColor: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}
              >
                <Avatar className="r86-delivery-driver-avatar h-10 w-10">
                  <AvatarFallback className="text-lg">{activeDelivery.driver.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold truncate">{activeDelivery.driver.name}</p>
                    <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-full px-1.5 py-0.5">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{activeDelivery.driver.rating}★</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    <span>Entregador desde {activeDelivery.driver.since}</span>
                    <span>•</span>
                    <span>{activeDelivery.driver.vehicle}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <DeliveryTimeline timeline={activeDelivery.timeline} />
              <Separator />

              <MapPlaceholder eta={activeDelivery.eta} etaMinutes={activeDelivery.etaMinutes} distance={activeDelivery.distance} />
              <Separator />

              <OrderDetails delivery={activeDelivery} />
              <Separator />

              <ActionsBar driverName={activeDelivery.driver.name} />
            </CardContent>
          </Card>

          {/* Delivery History */}
          <Card className="r62-card-lift r86-delivery-history-card overflow-hidden">
            <CardContent className="pt-6">
              <DeliveryHistory deliveries={pastDeliveries} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DeliveryTracker
