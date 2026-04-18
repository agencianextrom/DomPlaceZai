'use client'

import { useState, useCallback } from 'react'
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
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    category: 'orders',
    icon: Truck,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    title: 'Pedido a caminho!',
    description: 'Seu pedido #DP000005 da Padaria Pão Quente saiu para entrega.',
    time: 'Há 5 min',
    unread: true,
  },
  {
    id: '2',
    category: 'promos',
    icon: Percent,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    title: '30% de desconto',
    description: 'Suco naturais no Mercado do Zé. Válido até amanhã!',
    time: 'Há 15 min',
    unread: true,
  },
  {
    id: '3',
    category: 'system',
    icon: CheckCircle2,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    title: 'Conta verificada com sucesso',
    description: 'Seu e-mail foi confirmado. Agora você pode aproveitar todos os recursos.',
    time: 'Há 1h',
    unread: true,
  },
  {
    id: '4',
    category: 'orders',
    icon: Star,
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    title: 'Avalie seu pedido',
    description: 'Como foi sua experiência com Açaí da Boa? Deixe sua avaliação.',
    time: 'Há 3h',
    unread: false,
  },
  {
    id: '5',
    category: 'orders',
    icon: Package,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    title: 'Pedido confirmado',
    description: 'Seu pedido #DP000003 foi confirmado pela Farmácia Vida.',
    time: 'Ontem',
    unread: false,
  },
  {
    id: '6',
    category: 'promos',
    icon: Tag,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    title: 'Cupom BEMVINDO10',
    description: 'Use o cupom e ganhe 10% de desconto na primeira compra.',
    time: 'Ontem',
    unread: true,
  },
  {
    id: '7',
    category: 'system',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    title: 'Atualização do app',
    description: 'Novos recursos disponíveis: listas de compras e rastreamento de pedidos.',
    time: 'Há 2 dias',
    unread: false,
  },
  {
    id: '8',
    category: 'orders',
    icon: ShoppingCart,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    title: 'Entrega finalizada',
    description: 'Pedido #DP000001 de Mercado do Zé entregue com sucesso.',
    time: 'Há 3 dias',
    unread: false,
  },
]

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
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
}

function NotificationList({
  notifications,
  onToggleRead,
}: {
  notifications: Notification[]
  onToggleRead: (id: string) => void
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
          <motion.button
            key={notification.id}
            variants={itemVariants}
            onClick={() => onToggleRead(notification.id)}
            className={`w-full flex gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left relative group ${
              notification.unread ? 'bg-primary/[0.03]' : ''
            }`}
          >
            {notification.unread && (
              <motion.div
                layoutId={`unread-dot-${notification.id}`}
                className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <div
              className={`h-9 w-9 rounded-full ${notification.iconBg} flex items-center justify-center shrink-0 ml-1.5 transition-transform group-hover:scale-110`}
            >
              <Icon className={`h-4 w-4 ${notification.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm leading-tight ${notification.unread ? 'font-semibold' : 'font-medium'}`}>
                  {notification.title}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {notification.description}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">{notification.time}</p>
            </div>
            {!notification.unread && (
              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/30 self-center shrink-0" />
            )}
          </motion.button>
        )
      })}
    </motion.div>
  )
}

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all')
  const [mobileOpen, setMobileOpen] = useState(false)

  const unreadCount = notifications.filter((n) => n.unread).length

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true
    return n.category === activeTab
  })

  const unreadFilteredCount = filteredNotifications.filter((n) => n.unread).length

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }, [])

  const toggleRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    )
  }, [])

  const handleOpenMobile = useCallback(() => {
    setMobileOpen(true)
  }, [])

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            >
              {unreadCount} nova{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
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
              />
            </motion.div>
          </AnimatePresence>
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
            <Button variant="ghost" size="icon" className="relative h-10 w-10">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-accent text-accent-foreground border-0">
                  {unreadCount}
                </Badge>
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
          className="relative h-10 w-10"
          onClick={handleOpenMobile}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-accent text-accent-foreground border-0">
              {unreadCount}
            </Badge>
          )}
        </Button>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="w-full sm:max-w-sm p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Notificações</SheetTitle>
              <SheetDescription>Suas notificações recentes</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col h-full pt-0">
              {/* Mobile header with close integrated by Sheet */}
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
