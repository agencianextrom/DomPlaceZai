'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Star, Sparkles, Tag, Heart, ShoppingCart, UserPlus, MessageCircle, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface FeedItem {
  id: string
  avatar: string
  avatarBg: string
  name: string
  action: string
  detail: string
  timeAgo: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  type: 'purchase' | 'review' | 'new_product' | 'promo' | 'favorite' | 'follow'
}

const feedItems: FeedItem[] = [
  {
    id: 'f1',
    avatar: 'MA',
    avatarBg: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    name: 'Maria',
    action: 'comprou',
    detail: 'Açaí 500ml na Açaí da Boa',
    timeAgo: '15 min atrás',
    icon: ShoppingBag,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    type: 'purchase',
  },
  {
    id: 'f2',
    avatar: 'JO',
    avatarBg: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    name: 'João',
    action: 'deixou uma avaliação 5⭐ no',
    detail: 'Pão Francês',
    timeAgo: '1h atrás',
    icon: Star,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    type: 'review',
  },
  {
    id: 'f3',
    avatar: 'PQ',
    avatarBg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    name: 'Padaria Pão Quente',
    action: 'adicionou',
    detail: 'Tapioca Recheada',
    timeAgo: '2h atrás',
    icon: Sparkles,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    type: 'new_product',
  },
  {
    id: 'f4',
    avatar: 'FV',
    avatarBg: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    name: 'Farmácia Vida',
    action: 'está com promoção de',
    detail: '20%',
    timeAgo: '3h atrás',
    icon: Tag,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    type: 'promo',
  },
  {
    id: 'f5',
    avatar: 'AN',
    avatarBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    name: 'Ana',
    action: 'favoritou',
    detail: 'Loja do Eletrônico',
    timeAgo: '4h atrás',
    icon: Heart,
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    type: 'favorite',
  },
  {
    id: 'f6',
    avatar: 'LP',
    avatarBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    name: 'Lucas',
    action: 'começou a seguir',
    detail: 'Padaria Pão Quente',
    timeAgo: '5h atrás',
    icon: UserPlus,
    iconBg: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
    type: 'follow',
  },
  {
    id: 'f7',
    avatar: 'CS',
    avatarBg: 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300',
    name: 'Carla',
    action: 'comentou em',
    detail: 'Vitamina C 500mg',
    timeAgo: '6h atrás',
    icon: MessageCircle,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    type: 'review',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
  },
}

// Activity type label map
const typeLabels: Record<FeedItem['type'], string> = {
  purchase: 'Compra',
  review: 'Avaliação',
  new_product: 'Novidade',
  promo: 'Promoção',
  favorite: 'Favorito',
  follow: 'Seguir',
}

const typeBadgeColors: Record<FeedItem['type'], string> = {
  purchase: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  new_product: 'bg-primary/10 text-primary dark:bg-primary/20',
  promo: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  favorite: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  follow: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
}

export function FeedActivity() {
  const [visibleCount, setVisibleCount] = useState(5)
  const [loadingMore, setLoadingMore] = useState(false)
  const visibleItems = feedItems.slice(0, visibleCount)
  const hasMore = visibleCount < feedItems.length

  const handleLoadMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 3, feedItems.length))
      setLoadingMore(false)
    }, 600)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <h3 className="font-semibold text-sm">Atividade da comunidade</h3>
        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-primary/5 text-primary border-0">
          AO VIVO
        </Badge>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="block md:hidden">
        <ScrollArea className="w-full">
          <motion.div
            className="flex gap-3 pb-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-30px' }}
          >
            {feedItems.map((item) => {
              const ItemIcon = item.icon
              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="min-w-[280px] max-w-[300px] shrink-0"
                >
                  <Card className="border-border/50 hover:shadow-lg hover:border-primary/20 transition-all card-premium-hover py-0">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar with gradient border ring */}
                        <div className="relative">
                          <div className="absolute -inset-[2px] rounded-full bg-gradient-to-br from-primary to-amber-400 opacity-60" />
                          <Avatar className="h-10 w-10 relative ring-2 ring-background">
                            <AvatarFallback className={`text-xs font-bold ${item.avatarBg}`}>
                              {item.avatar}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug">
                            <span className="font-semibold">{item.name}</span>{' '}
                            <span className="text-muted-foreground">{item.action}</span>{' '}
                            <span className="font-semibold text-primary">{item.detail}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {/* Activity type badge */}
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md ${typeBadgeColors[item.type]}`}>
                              {typeLabels[item.type]}
                            </span>
                            <div className={`h-4 w-4 rounded ${item.iconBg} flex items-center justify-center`}>
                              <ItemIcon className={`h-2.5 w-2.5 ${item.iconColor}`} />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{item.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Desktop: vertical list */}
      <motion.div
        className="hidden md:block"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <div className="space-y-2">
          {visibleItems.map((item) => {
            const ItemIcon = item.icon
            return (
              <motion.div key={item.id} variants={itemVariants}>
                <Card className="border-border/50 hover:shadow-md hover:border-primary/20 transition-all py-0 group cursor-default">
                  <CardContent className="p-3.5 flex items-center gap-3">
                    {/* Avatar with gradient border */}
                    <div className="relative">
                      <div className="absolute -inset-[2px] rounded-full bg-gradient-to-br from-primary/40 to-amber-400/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Avatar className="h-11 w-11 relative ring-2 ring-background">
                        <AvatarFallback className={`text-xs font-bold ${item.avatarBg}`}>
                          {item.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online-like dot for recent items */}
                      {item.timeAgo.includes('min') && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-semibold">{item.name}</span>{' '}
                        <span className="text-muted-foreground">{item.action}</span>{' '}
                        <span className="font-semibold text-primary">{item.detail}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${typeBadgeColors[item.type]}`}>
                          {typeLabels[item.type]}
                        </span>
                        <div className={`h-4 w-4 rounded ${item.iconBg} flex items-center justify-center`}>
                          <ItemIcon className={`h-2.5 w-2.5 ${item.iconColor}`} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{item.timeAgo}</span>
                      </div>
                    </div>
                    {/* Hover action */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary">
                        Ver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Load more button */}
        {hasMore && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="mt-3 flex justify-center"
          >
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="gap-1.5 text-xs border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary/50"
              >
                {loadingMore ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent"
                    />
                    Carregando...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Carregar mais atividades
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.section>
  )
}
