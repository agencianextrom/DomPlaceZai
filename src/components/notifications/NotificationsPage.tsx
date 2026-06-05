'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  ArrowLeft, Bell, Package, Tag, Info, CheckCheck, Trash2, X,
  ChevronRight, ShoppingBag, Star, Clock, AlertCircle, Gift, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useAppStore } from '@/store/useAppStore'

interface Notification {
  id: string
  type: 'ORDER_UPDATE' | 'PROMOTION' | 'SYSTEM' | 'DELIVERY' | 'REVIEW' | 'CHAT'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: Record<string, string> | null
}

// Map API types to display icon
function getNotifIcon(type: string): { component: typeof Package; bg: string; color: string } {
  const config: Record<string, { component: typeof Package; bg: string; color: string }> = {
    ORDER_UPDATE: { component: Package, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
    DELIVERY: { component: ShoppingBag, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
    PROMOTION: { component: Tag, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
    SYSTEM: { component: Info, bg: 'bg-teal-100 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' },
    REVIEW: { component: Star, bg: 'bg-yellow-100 dark:bg-yellow-900/30', color: 'text-yellow-600 dark:text-yellow-400' },
    CHAT: { component: ShoppingBag, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
  }
  return config[type] || config.SYSTEM
}

// Map API type to display category tab
function getTabForType(type: string): string {
  switch (type) {
    case 'ORDER_UPDATE':
    case 'DELIVERY':
    case 'REVIEW':
      return 'order'
    case 'PROMOTION':
      return 'promotion'
    case 'SYSTEM':
    case 'CHAT':
    default:
      return 'system'
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Agora'
  if (mins < 60) return `Há ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Há ${hours}h`
  const days = Math.floor(hours / 24)
  return `Há ${days} dia${days > 1 ? 's' : ''}`
}

function NotificationIcon({ type, isRead }: { type: string; isRead: boolean }) {
  const cfg = getNotifIcon(type)
  const IconComp = cfg.component
  return (
    <div className={`h-10 w-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 ${isRead ? 'opacity-60' : ''}`}>
      <IconComp className={`h-5 w-5 ${cfg.color}`} />
    </div>
  )
}

export function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [displayCount, setDisplayCount] = useState(6)
  const [categoryTab, setCategoryTab] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [total, setTotal] = useState(0)

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (offset = 0, append = false) => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      const params = new URLSearchParams({
        limit: '50',
        offset: String(offset),
      })

      const res = await fetch(`/api/notifications?${params}`)
      if (res.ok) {
        const data = await res.json()
        const mapped: Notification[] = (data.notifications || []).map((n: {
          id: string
          title: string
          message: string
          type: string
          isRead: boolean
          createdAt: string
          data: string | null
        }) => ({
          id: n.id,
          type: n.type as Notification['type'],
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          createdAt: n.createdAt,
          data: n.data ? (typeof n.data === 'string' ? JSON.parse(n.data) : n.data) : null,
        }))

        setNotifications(prev => append ? [...prev, ...mapped] : mapped)
        setTotal(data.total || mapped.length)
      }
    } catch {
      // Graceful degradation
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [user?.id])

  // Initial load
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    // Category filter (map display tabs to API types)
    if (categoryTab !== 'all') {
      filtered = filtered.filter(n => getTabForType(n.type) === categoryTab)
    }

    // Read/unread filter
    if (readFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead)
    } else if (readFilter === 'read') {
      filtered = filtered.filter(n => n.isRead)
    }

    return filtered
  }, [notifications, categoryTab, readFilter])

  const visibleNotifications = filteredNotifications.slice(0, displayCount)
  const hasMore = displayCount < filteredNotifications.length

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success('Todas as notificações marcadas como lidas')
    } catch {
      toast.error('Erro ao marcar notificações')
    }
  }

  const handleDismiss = async (id: string) => {
    const notif = notifications.find(n => n.id === id)
    setNotifications(prev => prev.filter(n => n.id !== id))

    try {
      await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' })
      toast.success('Notificação removida')
    } catch {
      toast.error('Erro ao remover notificação')
    }
  }

  const handleMarkRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
    } catch {
      // Local state already updated
    }
  }

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 6)
  }

  const handleRefresh = () => {
    if (!isRefreshing) {
      setIsRefreshing(true)
      fetchNotifications()
    }
  }

  // Action from notification data
  const handleNotifAction = (notif: Notification) => {
    if (notif.data?.orderNumber) {
      useAppStore.getState().navigate('orders')
      toast.info(`Abrindo pedido ${notif.data.orderNumber}...`)
    } else if (notif.type === 'PROMOTION') {
      useAppStore.getState().navigate('home')
      toast.info('Navegando para promoções...')
    }
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => useAppStore.getState().goBack()} className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold r62-heading-gradient">Notificações</h1>
              {unreadCount > 0 && (
                <motion.div
                  key={unreadCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="h-6 min-w-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center px-1.5"
                >
                  {unreadCount}
                </motion.div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 text-primary"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas
            </Button>
          </div>
        </div>

        {/* Read/Unread filter pills */}
        <div className="flex gap-2 mb-3">
          {[
            { id: 'all' as const, label: 'Todos' },
            { id: 'unread' as const, label: 'Não lidas', count: unreadCount },
            { id: 'read' as const, label: 'Lidas' },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setReadFilter(filter.id)}
              className={`min-h-[44px] px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                readFilter === filter.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {filter.label}
              {filter.count !== undefined && filter.count > 0 && (
                <span className="ml-1">({filter.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-3">
        {/* Category Tabs */}
        <Tabs value={categoryTab} onValueChange={setCategoryTab}>
          <TabsList className="w-full bg-secondary/50 rounded-lg mb-4">
            <TabsTrigger value="all" className="flex-1 rounded-md text-xs sm:text-sm">
              Todos
            </TabsTrigger>
            <TabsTrigger value="order" className="flex-1 rounded-md text-xs sm:text-sm gap-1">
              <Package className="h-3 w-3" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="promotion" className="flex-1 rounded-md text-xs sm:text-sm gap-1">
              <Tag className="h-3 w-3" />
              Promoções
            </TabsTrigger>
            <TabsTrigger value="system" className="flex-1 rounded-md text-xs sm:text-sm gap-1">
              <Info className="h-3 w-3" />
              Sistema
            </TabsTrigger>
          </TabsList>

          {['all', 'order', 'promotion', 'system'].map(tab => (
            <TabsContent key={tab} value={tab}>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="h-6 w-6 text-muted-foreground/40 animate-spin" />
                </div>
              ) : visibleNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="mx-auto mb-4"
                  >
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Bell className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  </motion.div>
                  <h3 className="font-semibold text-base mb-1">Nenhuma notificação</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {readFilter === 'unread'
                      ? 'Todas as suas notificações já foram lidas!'
                      : 'Suas notificações aparecerão aqui.'}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {visibleNotifications.map((notification, idx) => (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100, height: 0, marginBottom: 0, padding: 0 }}
                        transition={{ delay: idx * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                        className="cursor-pointer"
                      >
                        <Card className={`border-border/50 transition-all hover:shadow-sm r62-card-lift ${!notification.isRead ? 'bg-primary/[0.03] border-primary/15' : ''}`}>
                          <CardContent className="p-3 flex items-start gap-3 relative">
                            {/* Unread dot */}
                            {!notification.isRead && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-emerald-500"
                              />
                            )}

                            <NotificationIcon type={notification.type} isRead={notification.isRead} />

                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`font-semibold text-sm leading-tight ${!notification.isRead ? '' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70 mt-1.5 flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {timeAgo(notification.createdAt)}
                              </p>

                              {/* Action button for order notifications */}
                              {notification.data?.orderNumber && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-[10px] mt-2 px-3 gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleNotifAction(notification)
                                  }}
                                >
                                  Ver pedido
                                  <ChevronRight className="h-2.5 w-2.5" />
                                </Button>
                              )}

                              {/* Action for promotions */}
                              {notification.type === 'PROMOTION' && !notification.data?.orderNumber && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-[10px] mt-2 px-3 gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleNotifAction(notification)
                                  }}
                                >
                                  Explorar
                                  <ChevronRight className="h-2.5 w-2.5" />
                                </Button>
                              )}
                            </div>

                            {/* Dismiss button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDismiss(notification.id)
                              }}
                              className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 hover:bg-muted transition-opacity"
                              aria-label="Remover notificação"
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Load more button */}
                  {hasMore && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="pt-3"
                    >
                      <Button
                        variant="outline"
                        className="w-full text-sm gap-2"
                        onClick={handleLoadMore}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Carregar mais notificações
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
