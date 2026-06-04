'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Package, Tag, Truck, Star, Gift, ChevronRight, CheckCircle2, Sparkles, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'

export interface LocalNotification {
  id: string
  type: 'order' | 'promo' | 'system'
  title: string
  description: string
  time: string
  read: boolean
}

// Sample notifications for when API is unavailable
const sampleNotifications: LocalNotification[] = [
  {
    id: 'sample-1',
    type: 'promo',
    title: 'Novos produtos disponíveis',
    description: '3 novas lojas acabaram de cadastrar produtos no DomPlace.',
    time: 'Há 5 min',
    read: false,
  },
  {
    id: 'sample-2',
    type: 'promo',
    title: 'Ofertas expirando',
    description: '5 ofertas que você salvou estão terminando em 2 horas.',
    time: 'Há 15 min',
    read: false,
  },
  {
    id: 'sample-3',
    type: 'order',
    title: 'Seu pedido está a caminho',
    description: 'Pedido #1234 saiu para entrega. Previsão: 30 minutos.',
    time: 'Há 1h',
    read: false,
  },
  {
    id: 'sample-4',
    type: 'promo',
    title: 'Desconto exclusivo',
    description: 'Use o código DOMPLACE10 e ganhe 10% de desconto na próxima compra.',
    time: 'Há 2h',
    read: true,
  },
  {
    id: 'sample-5',
    type: 'system',
    title: 'Novo recurso disponível',
    description: 'Agora você pode comparar produtos lado a lado. Experimente!',
    time: 'Há 1 dia',
    read: true,
  },
  {
    id: 'sample-6',
    type: 'order',
    title: 'Entrega concluída',
    description: 'Pedido #1198 foi entregue com sucesso. Avalie a loja!',
    time: 'Há 2 dias',
    read: true,
  },
]

function getNotificationIcon(type: LocalNotification['type']) {
  switch (type) {
    case 'order':
      return { icon: Package, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40' }
    case 'promo':
      return { icon: Tag, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40' }
    case 'system':
      return { icon: Sparkles, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/40' }
  }
}

// Tab filter types
type NotificationTab = 'all' | 'order' | 'promo' | 'system'

const tabConfig: { key: NotificationTab; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'order', label: 'Pedidos' },
  { key: 'promo', label: 'Promoções' },
  { key: 'system', label: 'Sistema' },
]

// Floating particle component for empty state
function R39Particles() {
  const colors = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899']
  return (
    <div className="r39-particles-container">
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          className="r39-particle"
          style={{
            width: `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
            bottom: `${10 + Math.random() * 20}%`,
            left: `${10 + Math.random() * 80}%`,
            backgroundColor: colors[i % colors.length],
            '--r39-drift-x': `${(Math.random() - 0.5) * 40}px`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${2.5 + Math.random() * 2}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// Framer-motion variants — all boxShadow as single string with rgba/hex
const cardVariants = {
  hidden: { opacity: 0, x: 24, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
  exit: {
    opacity: 0,
    x: -16,
    height: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
  },
}

const badgeSpring = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  exit: { scale: 0 },
  transition: { type: 'spring' as const, stiffness: 600, damping: 12 },
}

const headerBadgeSpring = {
  initial: { scale: 0.5 },
  animate: { scale: 1 },
  transition: { type: 'spring' as const, stiffness: 500, damping: 25 },
}

const emptyStateVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export function NotificationCenter() {
  const { currentUser, navigate } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<NotificationTab>('all')
  const [notifications, setNotifications] = useState<LocalNotification[]>(() => {
    if (typeof window === 'undefined') return sampleNotifications
    try {
      const stored = localStorage.getItem('domplace-local-notifications')
      if (stored) return JSON.parse(stored)
    } catch { /* use default */ }
    return sampleNotifications
  })

  // Persist notifications to localStorage
  const isClientRef = useRef(false)
  useEffect(() => {
    isClientRef.current = true
    // Initialize localStorage with defaults if needed
    try {
      const stored = localStorage.getItem('domplace-local-notifications')
      if (!stored) {
        localStorage.setItem('domplace-local-notifications', JSON.stringify(sampleNotifications))
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!isClientRef.current) return
    try {
      localStorage.setItem('domplace-local-notifications', JSON.stringify(notifications))
    } catch {
      // Ignore storage errors
    }
  }, [notifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('Todas as notificações marcadas como lidas')
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const handleNotificationClick = useCallback((notification: LocalNotification) => {
    markAsRead(notification.id)
    if (notification.type === 'order') {
      navigate('orders')
    } else if (notification.type === 'promo') {
      navigate('home')
    }
    setIsOpen(false)
  }, [markAsRead, navigate])

  const addSampleNotification = useCallback(() => {
    const newNotif: LocalNotification = {
      id: `sample-${Date.now()}`,
      type: 'promo',
      title: '⚡ Promoção relâmpago!',
      description: 'Açaí da Boa está com 25% de desconto por tempo limitado.',
      time: 'Agora',
      read: false,
    }
    setNotifications(prev => [newNotif, ...prev])
    toast.success('Nova notificação recebida!')
  }, [])

  // Filtered notifications based on tab
  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeTab)

  // Ref for tab indicator position tracking
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [tabIndicator, setTabIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 })

  useEffect(() => {
    const el = tabRefs.current[activeTab]
    if (el) {
      const parent = el.parentElement
      if (parent) {
        setTabIndicator({
          left: el.offsetLeft,
          width: el.offsetWidth,
        })
      }
    }
  }, [activeTab, isOpen])

  if (!isClientRef.current) {
    return (
      <Button variant="ghost" size="icon" className="relative h-10 w-10">
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 hover-glow">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Bell className="h-5 w-5" />
          </motion.div>

          {/* Unread badge — enhanced with pulse class */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                key={unreadCount}
                initial={badgeSpring.initial}
                animate={badgeSpring.animate}
                exit={badgeSpring.exit}
                transition={badgeSpring.transition}
                className="absolute -top-0.5 -right-0.5"
              >
                <Badge className="h-[18px] min-w-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white border-2 border-background shadow-sm r39-badge-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
                <motion.span
                  key={`nc-pulse-${unreadCount}`}
                  animate={{ scale: [1, 1.6, 2], opacity: [0.5, 0.2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' as const }}
                  className="absolute inset-0 rounded-full bg-red-500"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 sm:w-96 p-0 mr-2"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <motion.div
                key={unreadCount}
                initial={headerBadgeSpring.initial}
                animate={headerBadgeSpring.animate}
                transition={headerBadgeSpring.transition}
              >
                <Badge className="text-[10px] px-1.5 py-0 h-5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 r39-badge-pulse">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </Badge>
              </motion.div>
            )}
          </div>
          {/* Mark all as read — wrapped in motion.div */}
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary h-7 px-2 hover:bg-primary/10"
                  onClick={(e) => { e.stopPropagation(); markAllAsRead() }}
                >
                  Marcar todas
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Tab Bar with animated gradient indicator */}
        <div className="relative border-b border-border">
          <div className="flex px-2 pt-1" role="tablist">
            {tabConfig.map((tab) => (
              <button
                key={tab.key}
                ref={(el) => { tabRefs.current[tab.key] = el }}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-3 py-2 text-xs font-medium transition-colors duration-200 shrink-0
                  ${activeTab === tab.key
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground/70'
                  }`}
              >
                {activeTab === tab.key ? (
                  <span className="r39-tab-active-text">{tab.label}</span>
                ) : (
                  tab.label
                )}
              </button>
            ))}
          </div>
          {/* Animated gradient indicator */}
          <motion.div
            className="r39-tab-indicator"
            animate={{ left: tabIndicator.left, width: tabIndicator.width }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
          />
        </div>

        {/* Notifications list */}
        <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
          <AnimatePresence initial={false} mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div
                key="r39-empty"
                variants={emptyStateVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative flex flex-col items-center justify-center py-12 text-center px-4"
              >
                <R39Particles />
                <div className="r39-bell-bounce">
                  <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
                </div>
                <p className="r39-gradient-text text-sm font-semibold mb-1">
                  {activeTab === 'all'
                    ? 'Nenhuma notificação'
                    : activeTab === 'order'
                      ? 'Nenhum pedido'
                      : activeTab === 'promo'
                        ? 'Nenhuma promoção'
                        : 'Nenhum aviso do sistema'
                  }
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {activeTab === 'all'
                    ? 'Você está por dentro de tudo!'
                    : 'Sem notificações nesta categoria.'
                  }
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const { icon: Icon, color, bg } = getNotificationIcon(notification.type)
                return (
                  <motion.div
                    key={notification.id}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="relative group r39-notif-card"
                  >
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full flex gap-3 px-4 py-3 text-left relative ${
                        !notification.read
                          ? 'bg-primary/[0.03] border-l-[3px] border-l-primary'
                          : 'border-l-[3px] border-l-transparent'
                      }`}
                    >
                      {/* Unread dot with pulse */}
                      {!notification.read && (
                        <motion.div
                          layoutId={`nc-dot-${notification.id}`}
                          className="absolute right-7 top-3 h-2 w-2 rounded-full bg-emerald-500 r39-unread-pulse"
                          transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
                        />
                      )}
                      <div className={`h-9 w-9 rounded-full ${bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className={`text-sm leading-tight ${!notification.read ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-xs mt-0.5 line-clamp-2 ${!notification.read ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                          {notification.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-1 r39-timestamp-fade" title={notification.time}>
                          <Clock className="h-2.5 w-2.5" />
                          {notification.time}
                        </p>
                      </div>
                      {!notification.read && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/20 self-center shrink-0" />
                      )}
                    </button>
                    {/* Dismiss button — enhanced */}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismissNotification(notification.id) }}
                      className="absolute top-2 right-1 h-5 w-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 r39-dismiss-btn"
                      aria-label="Remover notificação"
                    >
                      <span className="text-[10px] text-muted-foreground">✕</span>
                    </button>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Footer — action button with shimmer */}
        <div className="flex items-center gap-1">
          <motion.div
            className="w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              className="w-full flex items-center justify-center gap-1 px-4 py-2.5 text-sm font-medium text-primary hover:bg-secondary/50 transition-colors shrink-0 r39-btn-shimmer"
              onClick={() => { navigate('notifications'); setIsOpen(false) }}
            >
              Ver todas as notificações
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
