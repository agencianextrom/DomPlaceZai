'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Bell,
  Package,
  Tag,
  Truck,
  Star,
  Gift,
  ChevronRight,
  CheckCircle2,
  ShoppingCart,
  Percent,
  Info,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { motion, AnimatePresence } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

type NotificationCategory = 'all' | 'orders' | 'promos' | 'system'

interface Notification {
  id: string
  category: NotificationCategory
  icon: LucideIcon
  iconColor: string
  iconBg: string
  title: string
  description: string
  time: string
  unread: boolean
  data?: Record<string, string> | null
}

// Map API notification types to display categories
function mapApiCategory(type: string): NotificationCategory {
  switch (type) {
    case 'ORDER_UPDATE':
    case 'DELIVERY':
    case 'REVIEW':
      return 'orders'
    case 'PROMOTION':
      return 'promos'
    case 'SYSTEM':
    case 'CHAT':
    default:
      return 'system'
  }
}

// Map API notification types to icons
function mapApiIcon(type: string): { icon: LucideIcon; iconColor: string; iconBg: string } {
  switch (type) {
    case 'ORDER_UPDATE':
      return { icon: Package, iconColor: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40' }
    case 'DELIVERY':
      return { icon: Truck, iconColor: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40' }
    case 'PROMOTION':
      return { icon: Percent, iconColor: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/40' }
    case 'REVIEW':
      return { icon: Star, iconColor: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/40' }
    case 'SYSTEM':
      return { icon: Info, iconColor: 'text-teal-600 dark:text-teal-400', iconBg: 'bg-teal-100 dark:bg-teal-900/40' }
    case 'CHAT':
      return { icon: ShoppingCart, iconColor: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40' }
    default:
      return { icon: Bell, iconColor: 'text-teal-600 dark:text-teal-400', iconBg: 'bg-teal-100 dark:bg-teal-900/40' }
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

const categoryLabels: Record<NotificationCategory, string> = {
  all: 'Todas',
  orders: 'Pedidos',
  promos: 'Promoções',
  system: 'Sistema',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: 20, y: 8 },
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.3, type: 'spring' as const, stiffness: 200, damping: 20 } },
}

function NotificationList({
  notifications,
  onToggleRead,
  onDismiss,
}: {
  notifications: Notification[]
  onToggleRead: (id: string) => void
  onDismiss: (id: string) => void
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center px-4">
        <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">Nenhuma notificação nesta categoria</p>
      </div>
    )
  }

  return (
    <motion.div
      className="max-h-[320px] overflow-y-auto custom-scrollbar"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {notifications.map((notification) => {
        const Icon = notification.icon
        return (
          <motion.div
            key={notification.id}
            variants={itemVariants}
            className="relative group"
            whileHover={{
              scale: 1.01,
              y: -1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              transition: { duration: 0.2 },
            }}
          >
            <button
              onClick={() => onToggleRead(notification.id)}
              className={`w-full flex gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left relative notif-card-glow ${
                notification.unread
                  ? 'bg-primary/[0.03] border-l-[3px] border-l-primary'
                  : 'border-l-[3px] border-l-transparent'
              }`}
            >
              {notification.unread && (
                <motion.div
                  layoutId={`unread-dot-${notification.id}`}
                  className="absolute right-7 top-3 h-2 w-2 rounded-full bg-emerald-500 notif-badge-pulse"
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
                />
              )}
              <div
                className={`h-9 w-9 rounded-full ${notification.iconBg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}
              >
                <Icon className={`h-4 w-4 ${notification.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <p className={`text-sm leading-tight ${notification.unread ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>
                    {notification.title}
                  </p>
                </div>
                <p className={`text-xs mt-0.5 line-clamp-2 ${notification.unread ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                  {notification.description}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{notification.time}</p>
              </div>
              {!notification.unread && (
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/20 self-center shrink-0" />
              )}
            </button>
            {/* Dismiss button (visible on hover) */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDismiss(notification.id)
              }}
              className="absolute top-2 right-1 h-5 w-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
              aria-label="Remover notificação"
            >
              <span className="text-[10px] text-muted-foreground">✕</span>
            </button>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export function NotificationPanel() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const fetchedRef = useRef(false)
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (!user?.id) return

    try {
      if (showLoading) setIsLoading(true)
      const res = await fetch('/api/notifications?limit=15')
      if (res.ok) {
        const data = await res.json()

        // Also fetch unread count
        const countRes = await fetch('/api/notifications?count=true')
        let unread = 0
        if (countRes.ok) {
          const countData = await countRes.json()
          unread = countData.unreadCount || 0
        }

        const mapped: Notification[] = (data.notifications || []).map((n: {
          id: string
          title: string
          message: string
          type: string
          data: string | null
          isRead: boolean
          createdAt: string
        }) => {
          const iconInfo = mapApiIcon(n.type)
          return {
            id: n.id,
            category: mapApiCategory(n.type),
            icon: iconInfo.icon,
            iconColor: iconInfo.iconColor,
            iconBg: iconInfo.iconBg,
            title: n.title,
            description: n.message,
            time: timeAgo(n.createdAt),
            unread: !n.isRead,
            data: n.data ? (typeof n.data === 'string' ? JSON.parse(n.data) : n.data) : null,
          }
        })

        setNotifications(mapped)
        setUnreadCount(unread)
      }
    } catch {
      // If API fails, show empty state (graceful degradation)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [user?.id])

  // Initial fetch + polling
  useEffect(() => {
    if (user?.id && !fetchedRef.current) {
      fetchedRef.current = true
      fetchNotifications(true)
    }
  }, [user?.id, fetchNotifications])

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user?.id) return

    refreshIntervalRef.current = setInterval(() => {
      // Only fetch unread count (lightweight)
      fetch('/api/notifications?count=true')
        .then(res => res.ok ? res.json() : { unreadCount: 0 })
        .then(data => setUnreadCount(data.unreadCount || 0))
        .catch(() => {})
    }, 30000)

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current)
    }
  }, [user?.id])

  // Reset fetched flag when user changes
  useEffect(() => {
    if (!user?.id) {
      fetchedRef.current = false
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user?.id])

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true
    return n.category === activeTab
  })

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
      setUnreadCount(0)
    } catch {
      // Fallback: update locally
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
      setUnreadCount(0)
    }
  }, [])

  const toggleRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
    // Update unread count optimistically
    setUnreadCount((prev) => Math.max(0, prev - 1))

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
    } catch {
      // Local state already updated
    }
  }, [])

  const dismissNotification = useCallback(async (id: string) => {
    const notif = notifications.find(n => n.id === id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (notif?.unread) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
      })
    } catch {
      // Local state already updated
    }
  }, [notifications])

  const handleRefresh = useCallback(() => {
    if (!isRefreshing) {
      setIsRefreshing(true)
      fetchNotifications(false)
    }
  }, [isRefreshing, fetchNotifications])

  const handleOpenMobile = useCallback(() => {
    setMobileOpen(true)
    if (user?.id) fetchNotifications(false)
  }, [user?.id, fetchNotifications])

  const handleCloseMobile = useCallback(() => {
    setMobileOpen(false)
  }, [])

  const tabCounts = {
    all: notifications.length,
    orders: notifications.filter((n) => n.category === 'orders').length,
    promos: notifications.filter((n) => n.category === 'promos').length,
    system: notifications.filter((n) => n.category === 'system').length,
  }

  const sharedContent = (
    <div className="flex flex-col h-full notif-glass">
      {/* Floating bell particles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`bell-particle-${i}`}
          className="notif-bell-float absolute pointer-events-none"
          style={{
            left: `${15 + i * 18}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${4 + i * 0.8}s`,
          }}
        >
          <Bell className="h-2.5 w-2.5 text-primary/10 dark:text-primary/15 rotate-[${i * 30}deg]" />
        </div>
      ))}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <motion.div
              key={unreadCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
            >
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              >
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </Badge>
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary h-7 px-2 hover:bg-primary/10"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as NotificationCategory)}
        className="shrink-0"
      >
        <div className="px-4 pt-2">
          <TabsList className="w-full h-8 p-[2px]">
            {(Object.keys(categoryLabels) as NotificationCategory[]).map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="text-[11px] px-2 h-[26px] flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {categoryLabels[cat]}
                {tabCounts[cat] > 0 && (
                  <span className="ml-1 text-[9px] opacity-60">({tabCounts[cat]})</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="flex-1 min-h-0 mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="h-5 w-5 text-muted-foreground/40 animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                <NotificationList
                  notifications={filteredNotifications}
                  onToggleRead={toggleRead}
                  onDismiss={dismissNotification}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Footer */}
      <button className="w-full flex items-center justify-center gap-1 px-4 py-2.5 text-sm font-medium text-primary hover:bg-secondary/50 transition-colors shrink-0">
        Ver todas as notificações
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop: Popover (lg and above) */}
      <div className="hidden lg:block">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className={`relative h-10 w-10 ${unreadCount > 0 ? 'r38-header-bell-shake' : ''}`}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.div
                  key={unreadCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 600, damping: 12 }}
                  className="absolute -top-0.5 -right-0.5"
                >
                  <Badge className="h-[18px] min-w-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white border-2 border-background shadow-sm r62-notif-bounce">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                  {/* Gentle pulse ring when unread */}
                  <motion.span
                    key={`notif-pulse-${unreadCount}`}
                    animate={{ scale: [1, 1.6, 2], opacity: [0.5, 0.2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' as const }}
                    className="absolute inset-0 rounded-full bg-red-500"
                  />
                </motion.div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0 mr-2" align="end" sideOffset={8}>
            {sharedContent}
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile/Tablet: Sheet (below lg) */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className={`relative h-10 w-10 ${unreadCount > 0 ? 'r38-header-bell-shake' : ''}`}
          onClick={handleOpenMobile}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.div
              key={unreadCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 600, damping: 12 }}
              className="absolute -top-0.5 -right-0.5"
            >
              <Badge className="h-[18px] min-w-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white border-2 border-background shadow-sm r62-notif-bounce">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
              {/* Gentle pulse ring when unread */}
              <motion.span
                key={`notif-pulse-m-${unreadCount}`}
                animate={{ scale: [1, 1.6, 2], opacity: [0.5, 0.2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' as const }}
                className="absolute inset-0 rounded-full bg-red-500"
              />
            </motion.div>
          )}
        </Button>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="w-full sm:max-w-sm p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Notificações</SheetTitle>
              <SheetDescription>Suas notificações recentes</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col h-full pt-0">
              <div className="pt-8">
                {sharedContent}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
