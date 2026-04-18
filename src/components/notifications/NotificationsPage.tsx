'use client'

import { useState, useMemo } from 'react'
import {
  ArrowLeft, Bell, Package, Tag, Info, CheckCheck, Trash2, X,
  ChevronRight, ShoppingBag, Star, Clock, AlertCircle, Gift
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'order' | 'promotion' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  icon: 'package' | 'tag' | 'info' | 'gift' | 'star' | 'alert'
  actionLabel?: string
  actionColor?: string
}

const initialNotifications: Notification[] = [
  {
    id: 'n1', type: 'order', title: 'Pedido entregue!', message: 'Seu pedido #DP000002 do Mercado do Zé foi entregue. Avalie sua experiência!',
    isRead: false, createdAt: new Date(Date.now() - 15 * 60000).toISOString(), icon: 'package', actionLabel: 'Avaliar', actionColor: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  {
    id: 'n2', type: 'order', title: 'Pedido em preparo', message: 'Açaí da Boa está preparando seu pedido #DP000003. Previsão: 30-45 min.',
    isRead: false, createdAt: new Date(Date.now() - 45 * 60000).toISOString(), icon: 'package',
  },
  {
    id: 'n3', type: 'promotion', title: '🔥 Oferta relâmpago!', message: 'Até 40% de desconto em produtos selecionados. Oferta válida até o fim do dia!',
    isRead: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), icon: 'tag', actionLabel: 'Ver ofertas', actionColor: 'bg-red-500 hover:bg-red-600 text-white',
  },
  {
    id: 'n4', type: 'system', title: '50 pontos de fidelidade!', message: 'Você ganhou 50 pontos pelo pedido #DP000002. Seu saldo: 1.250 pontos.',
    isRead: false, createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), icon: 'gift', actionLabel: 'Ver pontos', actionColor: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  {
    id: 'n5', type: 'order', title: 'Pedido confirmado', message: 'Seu pedido #DP000005 do Salão da Bella foi confirmado. Aguardando preparo.',
    isRead: true, createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), icon: 'package',
  },
  {
    id: 'n6', type: 'promotion', title: 'Cupom exclusivo ACAI10', message: 'Use o cupom ACAI10 e ganhe 10% de desconto em pedidos acima de R$30.',
    isRead: true, createdAt: new Date(Date.now() - 8 * 3600000).toISOString(), icon: 'tag',
  },
  {
    id: 'n7', type: 'system', title: 'Novas lojas no DomPlace', message: '3 novas lojas se juntaram ao DomPlace esta semana. Confira!',
    isRead: true, createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), icon: 'info', actionLabel: 'Explorar', actionColor: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  },
  {
    id: 'n8', type: 'system', title: 'Programa de fidelidade', message: 'Você está a apenas 750 pontos do próximo nível! Continue comprando.',
    isRead: true, createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), icon: 'star',
  },
  {
    id: 'n9', type: 'order', title: 'Entrega cancelada', message: 'O pedido #DP000004 foi cancelado. Entre em contato para mais informações.',
    isRead: true, createdAt: new Date(Date.now() - 48 * 3600000).toISOString(), icon: 'alert',
  },
  {
    id: 'n10', type: 'promotion', title: 'Frete grátis esta semana!', message: 'Compras acima de R$30 com frete grátis em lojas selecionadas.',
    isRead: true, createdAt: new Date(Date.now() - 72 * 3600000).toISOString(), icon: 'gift',
  },
]

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

function NotificationIcon({ icon, isRead }: { icon: string; isRead: boolean }) {
  const config: Record<string, { component: typeof Package; bg: string; color: string }> = {
    package: { component: Package, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
    tag: { component: Tag, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' },
    info: { component: Info, bg: 'bg-teal-100 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' },
    gift: { component: Gift, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
    star: { component: Star, bg: 'bg-yellow-100 dark:bg-yellow-900/30', color: 'text-yellow-600 dark:text-yellow-400' },
    alert: { component: AlertCircle, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' },
  }
  const cfg = config[icon] || config.info
  const IconComp = cfg.component
  return (
    <div className={`h-10 w-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 ${isRead ? 'opacity-60' : ''}`}>
      <IconComp className={`h-5 w-5 ${cfg.color}`} />
    </div>
  )
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [displayCount, setDisplayCount] = useState(6)
  const [categoryTab, setCategoryTab] = useState('all')

  const unreadCount = notifications.filter(n => !n.isRead).length

  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    // Category filter
    if (categoryTab !== 'all') {
      filtered = filtered.filter(n => n.type === categoryTab)
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

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    toast.success('Todas as notificações marcadas como lidas')
  }

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success('Notificação removida')
  }

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 6)
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
              <h1 className="text-lg font-bold">Notificações</h1>
              {unreadCount > 0 && (
                <motion.div
                  key={unreadCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="h-6 min-w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center px-1.5"
                >
                  {unreadCount}
                </motion.div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1 text-primary"
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todas
          </Button>
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
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
              {visibleNotifications.length === 0 ? (
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
                        className={`cursor-pointer ${!notification.isRead ? '' : ''}`}
                      >
                        <Card className={`border-border/50 transition-all hover:shadow-sm ${!notification.isRead ? 'bg-primary/[0.03] border-primary/15' : ''}`}>
                          <CardContent className="p-3 flex items-start gap-3 relative">
                            {/* Unread dot */}
                            {!notification.isRead && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-primary"
                              />
                            )}

                            <NotificationIcon icon={notification.icon} isRead={notification.isRead} />

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

                              {/* Action button */}
                              {notification.actionLabel && (
                                <Button
                                  size="sm"
                                  className={`h-7 text-[10px] mt-2 px-3 gap-1 ${notification.actionColor}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toast.success(`Ação: ${notification.actionLabel}`)
                                  }}
                                >
                                  {notification.actionLabel}
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
