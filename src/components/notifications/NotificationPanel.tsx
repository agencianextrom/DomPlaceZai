'use client'

import { Bell, Package, Tag, Truck, Star, Gift, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const notifications = [
  {
    id: '1',
    icon: Truck,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    title: 'Pedido a caminho!',
    description: 'Seu pedido da Padaria Pão Quente saiu para entrega.',
    time: 'Há 5 min',
    unread: true,
  },
  {
    id: '2',
    icon: Tag,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    title: 'Oferta relâmpago',
    description: '30% de desconto em sucos naturais no Mercado do Zé.',
    time: 'Há 15 min',
    unread: true,
  },
  {
    id: '3',
    icon: Gift,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    title: 'Bônus de fidelidade',
    description: 'Você ganhou 200 pontos pela última compra. Parabéns!',
    time: 'Há 1h',
    unread: true,
  },
  {
    id: '4',
    icon: Star,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    title: 'Avalie seu pedido',
    description: 'Como foi sua experiência com Açaí da Boa? Deixe sua avaliação.',
    time: 'Há 3h',
    unread: false,
  },
  {
    id: '5',
    icon: Package,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    title: 'Pedido confirmado',
    description: 'Seu pedido #DP000003 foi confirmado pela Farmácia Vida.',
    time: 'Ontem',
    unread: false,
  },
]

export function NotificationPanel() {
  const unreadCount = notifications.filter(n => n.unread).length

  return (
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
      <PopoverContent className="w-80 sm:w-96 p-0 mr-2" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2">
            Marcar tudo como lido
          </Button>
        </div>

        {/* Notification list */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {notifications.map((notification) => {
            const Icon = notification.icon
            return (
              <button
                key={notification.id}
                className="w-full flex gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left relative"
              >
                {notification.unread && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                )}
                <div className={`h-9 w-9 rounded-full ${notification.iconBg} flex items-center justify-center shrink-0 ml-1.5`}>
                  <Icon className={`h-4 w-4 ${notification.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{notification.time}</p>
                </div>
              </button>
            )
          })}
        </div>

        <Separator />

        {/* Footer */}
        <button className="w-full flex items-center justify-center gap-1 px-4 py-2.5 text-sm font-medium text-primary hover:bg-secondary/50 transition-colors">
          Ver todas as notificações
          <ChevronRight className="h-4 w-4" />
        </button>
      </PopoverContent>
    </Popover>
  )
}
