'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Sparkles, Tag, Heart } from 'lucide-react'
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
  },
  {
    id: 'f2',
    avatar: 'JO',
    avatarBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    name: 'João',
    action: 'deixou uma avaliação 5⭐ no',
    detail: 'Pão Francês',
    timeAgo: '1h atrás',
    icon: Star,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
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
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
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
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
}

export function FeedActivity() {
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
                  <Card className="border-border/50 hover:shadow-md transition-shadow py-0">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className={`text-xs font-bold ${item.avatarBg}`}>
                            {item.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug">
                            <span className="font-semibold">{item.name}</span>{' '}
                            <span className="text-muted-foreground">{item.action}</span>{' '}
                            <span className="font-semibold text-primary">{item.detail}</span>
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <div className={`h-5 w-5 rounded-md ${item.iconBg} flex items-center justify-center`}>
                              <ItemIcon className={`h-3 w-3 ${item.iconColor}`} />
                            </div>
                            <span className="text-[11px] text-muted-foreground">{item.timeAgo}</span>
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
        className="hidden md:block space-y-2"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {feedItems.map((item) => {
          const ItemIcon = item.icon
          return (
            <motion.div key={item.id} variants={itemVariants}>
              <Card className="border-border/50 hover:shadow-sm transition-shadow py-0">
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`text-xs font-bold ${item.avatarBg}`}>
                      {item.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold">{item.name}</span>{' '}
                      <span className="text-muted-foreground">{item.action}</span>{' '}
                      <span className="font-semibold text-primary">{item.detail}</span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`h-5 w-5 rounded-md ${item.iconBg} flex items-center justify-center`}>
                        <ItemIcon className={`h-3 w-3 ${item.iconColor}`} />
                      </div>
                      <span className="text-[11px] text-muted-foreground">{item.timeAgo}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.section>
  )
}
