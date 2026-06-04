'use client'

import { useState, useEffect, useCallback } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { Star, Sparkles, Tag, ShoppingBag, RefreshCw, MessageSquare, TrendingUp, Heart, Store, Eye } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cachedFetch } from '@/lib/api-cache'

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
  type: 'purchase' | 'review' | 'new_product' | 'promo' | 'order' | 'store_update'
  imageUrl?: string | null
}

interface ApiProduct {
  id: string
  storeId: string
  storeName: string
  name: string
  createdAt: string
  isNew: boolean
  isOffer: boolean
  isFeatured: boolean
  price: number
  comparePrice: number | null
  rating: number
  totalReviews: number
  category: string
  images: string | null
}

interface ApiStore {
  id: string
  name: string
  category: string
  createdAt: string
  rating: number
  logo: string | null
}

const avatarBgs = [
  'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
]

const typeLabels: Record<FeedItem['type'], string> = {
  purchase: 'Compra',
  review: 'Avaliação',
  new_product: 'Novidade',
  promo: 'Promoção',
  order: 'Pedido',
  store_update: 'Loja',
}

const typeBadgeColors: Record<FeedItem['type'], string> = {
  purchase: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  new_product: 'bg-primary/10 text-primary dark:bg-primary/20',
  promo: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  order: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  store_update: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'Ontem' : `${days} dias atrás`
}

function transformProductsToFeed(products: ApiProduct[]): FeedItem[] {
  const items: FeedItem[] = []
  products.forEach((p, i) => {
    const isPromo = p.isOffer || (p.comparePrice && p.comparePrice > p.price)
    const type: FeedItem['type'] = isPromo ? 'promo' : 'new_product'
    const initials = p.storeName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

    items.push({
      id: `product-${p.id}`,
      avatar: initials,
      avatarBg: avatarBgs[i % avatarBgs.length],
      name: p.storeName,
      action: type === 'promo' ? 'está com oferta em' : 'adicionou',
      detail: p.name,
      timeAgo: getTimeAgo(p.createdAt),
      icon: type === 'promo' ? Tag : Sparkles,
      iconBg: type === 'promo' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: type === 'promo' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
      type,
      imageUrl: p.images ? (JSON.parse(p.images) as string[])[0] || null : null,
    })
  })
  return items
}

function transformStoresToFeed(stores: ApiStore[]): FeedItem[] {
  return stores.map((s, i) => ({
    id: `store-${s.id}`,
    avatar: s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    avatarBg: avatarBgs[(i + 2) % avatarBgs.length],
    name: s.name,
    action: 'atualizou a loja',
    detail: `${s.rating.toFixed(1)} ⭐ · Novos produtos disponíveis`,
    timeAgo: getTimeAgo(s.createdAt),
    icon: Store,
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    type: 'store_update' as const,
  }))
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 20, delay: 0.15 },
  },
}

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const floatingIconVariants = [
  { animate: { y: [0, -8, 0], rotate: [0, 5, -5, 0] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 0 } },
  { animate: { y: [0, -10, 0], rotate: [0, -6, 4, 0] }, transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.4 } },
  { animate: { y: [0, -6, 0], rotate: [0, 3, -3, 0] }, transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.8 } },
]

export function NeighborhoodFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visibleCount, setVisibleCount] = useState(5)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchFeed = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [productsRes, storesRes] = await Promise.all([
        cachedFetch('/api/products?sort=newest&limit=5') as { products?: any[] },
        cachedFetch('/api/stores?limit=5&sort=rating') as { stores?: any[] },
      ])

      const items: FeedItem[] = []

      // Transform newest products
      items.push(...transformProductsToFeed(productsRes.products || []))

      // Transform stores
      items.push(...transformStoresToFeed(storesRes.stores || []))

      // Sort by simulated relevance
      setFeedItems(items.slice(0, 15))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  const handleLoadMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 5, feedItems.length))
      setLoadingMore(false)
    }, 500)
  }

  const visibleItems = feedItems.slice(0, visibleCount)
  const hasMore = visibleCount < feedItems.length

  return (
    <section className="w-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center"
          >
            <Heart className="h-4 w-4 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Vizinhança</h2>
            <p className="text-[11px] text-muted-foreground">O que está acontecendo no bairro</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] bg-primary/5 text-primary border-0">
          {feedItems.length > 0 ? `${feedItems.length} atividades` : 'Atualizado'}
        </Badge>
      </div>

      {/* Loading state */}
      {loading && <FeedSkeleton />}

      {/* Error state */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <RefreshCw className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">Não foi possível carregar a vizinhança</p>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={fetchFeed}>
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && feedItems.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20 overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <motion.div className="absolute top-6 left-8" {...floatingIconVariants[0]}>
              <ShoppingBag className="h-5 w-5 text-primary/8" />
            </motion.div>
            <motion.div className="absolute top-8 right-10" {...floatingIconVariants[1]}>
              <Star className="h-4 w-4 text-amber-400/10" />
            </motion.div>
            <motion.div className="absolute bottom-8 left-10" {...floatingIconVariants[2]}>
              <MessageSquare className="h-4 w-4 text-teal-400/10" />
            </motion.div>
          </div>

          <div className="relative flex items-center justify-center mb-3">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-primary/40" />
              </div>
            </motion.div>
          </div>

          <h3 className="text-sm font-bold relative z-10">Nenhuma atividade ainda</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[240px] relative z-10">
            A vizinhança está ficando mais ativa. Volte em breve!
          </p>
        </motion.div>
      )}

      {/* Feed cards */}
      {!loading && !error && feedItems.length > 0 && (
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {visibleItems.map((item, index) => {
            const ItemIcon = item.icon
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                custom={index}
              >
                <Card className="border-border/50 hover:shadow-md hover:border-primary/20 transition-all group cursor-default overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar with gradient ring */}
                      <div className="relative shrink-0">
                        <div className="absolute -inset-[2px] rounded-full bg-gradient-to-br from-primary/40 to-amber-400/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Avatar className="h-11 w-11 relative ring-2 ring-background">
                          <AvatarFallback className={`text-xs font-bold ${item.avatarBg}`}>
                            {item.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {/* Pulse dot for recent */}
                        {item.timeAgo === 'Agora' && (
                          <motion.div
                            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">
                          <span className="font-semibold">{item.name}</span>{' '}
                          <span className="text-muted-foreground">{item.action}</span>{' '}
                          <span className="font-semibold text-primary">{item.detail}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {/* Type badge */}
                          <motion.span
                            variants={badgeVariants}
                            className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md ${typeBadgeColors[item.type]}`}
                          >
                            {typeLabels[item.type]}
                          </motion.span>
                          {/* Icon */}
                          <div className={`h-4 w-4 rounded ${item.iconBg} flex items-center justify-center`}>
                            <ItemIcon className={`h-2.5 w-2.5 ${item.iconColor}`} />
                          </div>
                          {/* Timestamp */}
                          <span className="text-[10px] text-muted-foreground">
                            {item.timeAgo}
                          </span>
                        </div>
                      </div>

                      {/* Hover action */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}

          {/* Load more */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mt-2"
            >
              <motion.div whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.04 }}>
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
                      <Sparkles className="h-3.5 w-3.5" />
                      Ver mais
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </section>
  )
}
