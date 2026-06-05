'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Package,
  Tag,
  Truck,
  Star,
  TrendingDown,
  Clock,
  CheckCircle2,
  X,
  Inbox,
  ShoppingBag,
  Percent,
  MapPin,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type NotificationType =
  | 'order_confirmed'
  | 'order_delivered'
  | 'promo_new'
  | 'delivery_update'
  | 'price_drop'

type TabKey = 'todos' | 'pedidos' | 'promocoes' | 'entregas'

interface SmartNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: string
  read: boolean
  actionLabel?: string
}

/* ------------------------------------------------------------------ */
/*  Mock notifications (12 items)                                     */
/* ------------------------------------------------------------------ */

const INITIAL_NOTIFICATIONS: SmartNotification[] = [
  {
    id: 'n-1',
    type: 'order_confirmed',
    title: 'Pedido confirmado!',
    description: 'Seu pedido #4521 na Padaria Pão Quente foi confirmado e está sendo preparado.',
    timestamp: 'Agora mesmo',
    read: false,
    actionLabel: 'Ver pedido',
  },
  {
    id: 'n-2',
    type: 'promo_new',
    title: 'Super promoção do dia',
    description: 'Mercado do Zé: 30% de desconto em todos os laticínios até o final da semana. Aproveite!',
    timestamp: 'Há 5 min',
    read: false,
    actionLabel: 'Ver ofertas',
  },
  {
    id: 'n-3',
    type: 'delivery_update',
    title: 'Entrega a caminho',
    description: 'Seu pedido #4498 do Açaí da Boa saiu para entrega. Previsão: 15 minutos.',
    timestamp: 'Há 10 min',
    read: false,
    actionLabel: 'Rastrear',
  },
  {
    id: 'n-4',
    type: 'price_drop',
    title: 'Queda de preço! 🔥',
    description: 'Vitamina C 500mg caiu de R$ 45,90 para R$ 32,90 na Farmácia Vida. Produto na sua lista de desejos!',
    timestamp: 'Há 20 min',
    read: false,
    actionLabel: 'Comprar',
  },
  {
    id: 'n-5',
    type: 'order_delivered',
    title: 'Entrega concluída',
    description: 'Pedido #4456 do Mercado do Zé foi entregue com sucesso. Avalie a experiência!',
    timestamp: 'Há 1h',
    read: false,
    actionLabel: 'Avaliar',
  },
  {
    id: 'n-6',
    type: 'promo_new',
    title: 'Cupom exclusivo',
    description: 'Use o código DOMPLACE15 e ganhe 15% de desconto na sua próxima compra. Válido por 48h!',
    timestamp: 'Há 2h',
    read: true,
    actionLabel: 'Usar cupom',
  },
  {
    id: 'n-7',
    type: 'order_confirmed',
    title: 'Pedido confirmado',
    description: 'Seu pedido #4430 no Pet Shop Amigo Fiel foi recebido e está sendo separado.',
    timestamp: 'Há 3h',
    read: true,
    actionLabel: 'Ver pedido',
  },
  {
    id: 'n-8',
    type: 'delivery_update',
    title: 'Entrega próxima',
    description: 'O entregador está a 2km do seu endereço. Pedido #4398 do Salão da Bella.',
    timestamp: 'Há 4h',
    read: true,
    actionLabel: 'Rastrear',
  },
  {
    id: 'n-9',
    type: 'price_drop',
    title: 'Preço reduzido',
    description: 'Ração Premium Cães 15kg agora por R$ 89,90 (era R$ 119,90). Economia de R$ 30!',
    timestamp: 'Há 5h',
    read: true,
    actionLabel: 'Ver produto',
  },
  {
    id: 'n-10',
    type: 'order_delivered',
    title: 'Pedido entregue',
    description: 'Pedido #4312 da Padaria Pão Quente foi entregue. Obrigado pela preferência!',
    timestamp: 'Há 8h',
    read: true,
  },
  {
    id: 'n-11',
    type: 'promo_new',
    title: 'Nova loja cadastrada',
    description: 'Loja do Eletrônico acabou de entrar no DomPlace! Conheça os produtos com 10% de desconto.',
    timestamp: 'Há 1 dia',
    read: true,
    actionLabel: 'Conhecer',
  },
  {
    id: 'n-12',
    type: 'delivery_update',
    title: 'Entrega cancelada',
    description: 'Infelizmente o pedido #4299 foi cancelado pela loja. Seu pagamento será devolvido em até 24h.',
    timestamp: 'Há 2 dias',
    read: true,
  },
]

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const TABS: { key: TabKey; label: string; icon: typeof Bell }[] = [
  { key: 'todos', label: 'Todos', icon: Bell },
  { key: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
  { key: 'promocoes', label: 'Promoções', icon: Percent },
  { key: 'entregas', label: 'Entregas', icon: MapPin },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getNotificationMeta(type: NotificationType) {
  switch (type) {
    case 'order_confirmed':
      return {
        icon: CheckCircle2,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-100 dark:bg-emerald-900/40',
        glowClass: 'r40-icon-glow-order',
      }
    case 'order_delivered':
      return {
        icon: Package,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-100 dark:bg-emerald-900/40',
        glowClass: 'r40-icon-glow-order',
      }
    case 'promo_new':
      return {
        icon: Tag,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-100 dark:bg-purple-900/40',
        glowClass: 'r40-icon-glow-promo',
      }
    case 'delivery_update':
      return {
        icon: Truck,
        color: 'text-sky-600 dark:text-sky-400',
        bg: 'bg-sky-100 dark:bg-sky-900/40',
        glowClass: 'r40-icon-glow-delivery',
      }
    case 'price_drop':
      return {
        icon: TrendingDown,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-100 dark:bg-amber-900/40',
        glowClass: 'r40-icon-glow-price',
      }
  }
}

function categorizeTab(type: NotificationType): TabKey[] {
  switch (type) {
    case 'order_confirmed':
    case 'order_delivered':
      return ['todos', 'pedidos']
    case 'promo_new':
    case 'price_drop':
      return ['todos', 'promocoes']
    case 'delivery_update':
      return ['todos', 'entregas']
  }
}

function filterByTab(notifications: SmartNotification[], tab: TabKey) {
  if (tab === 'todos') return notifications
  return notifications.filter((n) => categorizeTab(n.type).includes(tab))
}

/* ------------------------------------------------------------------ */
/*  Framer-motion variants                                             */
/* ------------------------------------------------------------------ */

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
  exit: {
    opacity: 0,
    x: 80,
    scale: 0.92,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

const emptyBounce = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

/* ------------------------------------------------------------------ */
/*  Empty state component                                             */
/* ------------------------------------------------------------------ */

function EmptyTabState({ tab }: { tab: TabKey }) {
  const { label } = TABS.find((t) => t.key === tab)!

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center py-16 text-center px-6 overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
    >
      {/* Floating gradient particles */}
      <div className="r40-empty-particles" aria-hidden="true" />

      <motion.div {...emptyBounce} className="mb-4 relative z-10">
        <Inbox className="h-12 w-12 text-muted-foreground/30" />
      </motion.div>
      <p className="text-sm font-semibold r40-gradient-text-empty relative z-10">
        Sem notificações de {label.toLowerCase()}
      </p>
      <p className="text-xs text-muted-foreground/40 mt-1 relative z-10">
        Quando houver novidades, elas aparecerão aqui.
      </p>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function SmartNotifications() {
  const { navigate } = useAppStore()
  const [notifications, setNotifications] = useState<SmartNotification[]>(INITIAL_NOTIFICATIONS)
  const [activeTab, setActiveTab] = useState<TabKey>('todos')
  const isClientRef = useRef(false)

  // Mark as client-mounted after hydration
  if (typeof window !== 'undefined' && !isClientRef.current) {
    isClientRef.current = true
  }

  /* ---------- Derived data ---------- */
  const filteredNotifications = useMemo(
    () => filterByTab(notifications, activeTab),
    [notifications, activeTab],
  )

  const unreadPerTab = useMemo(() => {
    const counts: Record<TabKey, number> = {
      todos: 0,
      pedidos: 0,
      promocoes: 0,
      entregas: 0,
    }
    notifications.forEach((n) => {
      if (!n.read) {
        categorizeTab(n.type).forEach((t) => {
          counts[t]++
        })
      }
    })
    return counts
  }, [notifications])

  const totalUnread = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  /* ---------- Actions ---------- */
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success('Todas as notificações marcadas como lidas')
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const handleAction = useCallback(
    (notification: SmartNotification) => {
      markAsRead(notification.id)
      if (
        notification.type === 'order_confirmed' ||
        notification.type === 'order_delivered'
      ) {
        navigate('orders')
      } else if (
        notification.type === 'promo_new' ||
        notification.type === 'price_drop'
      ) {
        navigate('home')
      } else if (notification.type === 'delivery_update') {
        navigate('orders')
      }
    },
    [markAsRead, navigate],
  )

  /* ---------- Swipe/slide to mark as read ---------- */
  const [swipingId, setSwipingId] = useState<string | null>(null)
  const swipeStartX = useRef(0)

  const handleTouchStart = useCallback((id: string, x: number) => {
    swipeStartX.current = x
    setSwipingId(id)
  }, [])

  const handleTouchMove = useCallback(
    (id: string, x: number) => {
      const dx = x - swipeStartX.current
      if (dx > 80 && swipingId === id) {
        markAsRead(id)
        setSwipingId(null)
      }
    },
    [markAsRead, swipingId],
  )

  const handleTouchEnd = useCallback(() => {
    setSwipingId(null)
  }, [])

  /* ---------- Render ---------- */
  if (!isClientRef.current) return null

  return (
    <section className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
            <Bell className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold r62-heading-gradient">Notificações</h2>
            {totalUnread > 0 && (
              <motion.p
                className="text-[11px] text-muted-foreground r40-timestamp"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {totalUnread} não lida{totalUnread > 1 ? 's' : ''}
              </motion.p>
            )}
          </div>
        </div>

        {totalUnread > 0 && (
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          >
            <button
              onClick={markAllAsRead}
              className="min-h-[44px] text-xs text-primary font-medium hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors r40-mark-all-btn"
            >
              Marcar todas como lidas
            </button>
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="relative flex items-center gap-1 mb-4 bg-muted/50 rounded-xl p-1">
        {TABS.map((tab) => {
          const TabIcon = tab.icon
          const isActive = activeTab === tab.key
          const unread = unreadPerTab[tab.key]

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors z-10 ${
                isActive
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="smart-notif-tab-indicator"
                  className="absolute inset-0 rounded-lg r40-tab-gradient-pill shadow-sm"
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                />
              )}

              <TabIcon className="h-3.5 w-3.5 relative z-10" />
              <span className={`relative z-10 hidden sm:inline ${isActive ? 'r40-tab-active-text' : ''}`}>{tab.label}</span>

              {/* Unread badge with pulse and glow */}
              {unread > 0 && (
                <motion.span
                  key={`badge-${tab.key}-${unread}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                  className="relative z-10 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-red-500 text-white r40-tab-badge"
                >
                  {unread > 9 ? '9+' : unread}
                  {/* Pulse ring */}
                  <motion.span
                    className="absolute inset-0 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' as const }}
                  />
                </motion.span>
              )}
            </button>
          )
        })}
      </div>

      {/* Notification list */}
      <div className="max-h-[520px] overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <EmptyTabState key="empty" tab={activeTab} />
          ) : (
            <motion.div
              key={activeTab}
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-2"
            >
              {filteredNotifications.map((notification) => {
                const meta = getNotificationMeta(notification.type)
                const Icon = meta.icon
                const isSwiping = swipingId === notification.id

                return (
                  <motion.div
                    key={notification.id}
                    variants={itemVariants}
                    layout
                    exit="exit"
                    onTouchStart={(e) =>
                      handleTouchStart(
                        notification.id,
                        e.touches[0].clientX,
                      )
                    }
                    onTouchMove={(e) =>
                      handleTouchMove(
                        notification.id,
                        e.touches[0].clientX,
                      )
                    }
                    onTouchEnd={handleTouchEnd}
                    className={`relative rounded-xl border overflow-hidden transition-colors r40-notif-card ${
                      notification.read
                        ? 'bg-card border-border'
                        : 'bg-primary/[0.03] border-primary/20'
                    }`}
                    style={{
                      transform: isSwiping
                        ? `translateX(${Math.min(
                            30,
                            swipeStartX.current * 0.01,
                          )}px)`
                        : 'translateX(0)',
                      transition: 'transform 0.15s ease-out',
                    }}
                  >
                    <div className="flex items-start gap-3 p-3.5">
                      {/* Icon with type-specific glow */}
                      <motion.div
                        className={`h-10 w-10 rounded-xl ${meta.bg} ${meta.glowClass} flex items-center justify-center shrink-0 mt-0.5`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
                      >
                        <Icon className={`h-5 w-5 ${meta.color}`} />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`text-sm font-semibold leading-tight ${
                              notification.read
                                ? 'text-muted-foreground'
                                : 'text-foreground'
                            }`}
                          >
                            {notification.title}
                          </h4>

                          {/* Dismiss button */}
                          <motion.button
                            onClick={() => dismissNotification(notification.id)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            className="shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted transition-colors"
                            aria-label="Remover notificação"
                          >
                            <X className="h-3 w-3" />
                          </motion.button>
                        </div>

                        <p
                          className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                            notification.read
                              ? 'text-muted-foreground/60'
                              : 'text-foreground/70'
                          }`}
                        >
                          {notification.description}
                        </p>

                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground/40" />
                            <span className="text-[10px] text-muted-foreground/50 r40-timestamp">
                              {notification.timestamp}
                            </span>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5">
                            {!notification.read && (
                              <motion.button
                                onClick={() => markAsRead(notification.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary px-2 py-1 rounded-full hover:bg-primary/10 transition-colors"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Marcar como lida
                              </motion.button>
                            )}

                            {notification.actionLabel && (
                              <motion.button
                                onClick={() => handleAction(notification)}
                                whileHover={{
                                  scale: 1.05,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="text-[10px] font-semibold text-primary px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/15 transition-colors"
                              >
                                {notification.actionLabel}
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Unread dot with pulse ring */}
                      {!notification.read && (
                        <motion.span
                          layoutId={`dot-${notification.id}`}
                          className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-500 r40-unread-dot"
                          transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
                        >
                          {/* Pulse ring for unread dot */}
                          <motion.span
                            className="absolute inset-0 rounded-full bg-emerald-500"
                            animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' as const }}
                          />
                        </motion.span>
                      )}
                    </div>

                    {/* Swipe hint overlay */}
                    {!notification.read && (
                      <motion.div
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] text-emerald-600 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                      >
                        <span>← Deslize para ler</span>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
