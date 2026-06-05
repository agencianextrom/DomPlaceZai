'use client'

import { useState, useEffect, useCallback } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Sparkles, Tag, ShoppingBag, RefreshCw, Package, Zap, Heart, MessageSquare, TrendingUp } from 'lucide-react'
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
  type: 'purchase' | 'review' | 'new_product' | 'promo' | 'order'
}

// API response shapes
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
}

interface ApiReview {
  id: string
  accountId: string
  accountName: string
  accountAvatar: string | null
  productId: string | null
  storeId: string | null
  rating: number
  comment: string | null
  createdAt: string
  isVerified: boolean
}

interface ApiOrder {
  id: string
  orderNumber: string
  storeName: string
  status: string
  total: number
  createdAt: string
  items: { productName: string }[]
}

// Avatar background colors
const avatarBgs = [
  'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300',
  'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
]

const typeLabels: Record<FeedItem['type'], string> = {
  purchase: 'Compra',
  review: 'Avaliação',
  new_product: 'Novidade',
  promo: 'Promoção',
  order: 'Pedido',
}

const typeBadgeColors: Record<FeedItem['type'], string> = {
  purchase: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  new_product: 'bg-primary/10 text-primary dark:bg-primary/20',
  promo: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  order: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
}

// Transform API data into feed items
function transformProductsToFeed(products: ApiProduct[]): FeedItem[] {
  return products.map((p, i) => {
    const isPromo = p.isOffer || (p.comparePrice && p.comparePrice > p.price)
    const type: FeedItem['type'] = isPromo ? 'promo' : 'new_product'
    const initials = p.storeName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const bgIdx = i % avatarBgs.length

    return {
      id: `product-${p.id}`,
      avatar: initials,
      avatarBg: avatarBgs[bgIdx],
      name: p.storeName,
      action: type === 'promo' ? 'está com oferta em' : 'adicionou',
      detail: p.name,
      timeAgo: getTimeAgo(p.createdAt),
      icon: type === 'promo' ? Tag : Sparkles,
      iconBg: type === 'promo' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: type === 'promo' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
      type,
    }
  })
}

function transformOrdersToFeed(orders: ApiOrder[]): FeedItem[] {
  return orders.map((o, i) => {
    const initials = o.storeName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const bgIdx = (i + 3) % avatarBgs.length
    const firstItem = o.items?.[0]?.productName || 'Produtos'

    return {
      id: `order-${o.id}`,
      avatar: initials,
      avatarBg: avatarBgs[bgIdx],
      name: o.storeName,
      action: 'novo pedido em',
      detail: firstItem,
      timeAgo: getTimeAgo(o.createdAt),
      icon: ShoppingBag,
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
      type: 'purchase',
    }
  })
}

function transformReviewsToFeed(reviews: ApiReview[]): FeedItem[] {
  return reviews.map((r, i) => {
    const nameInitials = (r.accountName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const bgIdx = (i + 5) % avatarBgs.length
    const stars = '⭐'.repeat(r.rating)

    return {
      id: `review-${r.id}`,
      avatar: nameInitials,
      avatarBg: avatarBgs[bgIdx],
      name: r.accountName || 'Cliente',
      action: `avaliou ${stars}`,
      detail: r.comment ? (r.comment.length > 40 ? r.comment.slice(0, 40) + '...' : r.comment) : '',
      timeAgo: getTimeAgo(r.createdAt),
      icon: Star,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      type: 'review',
    }
  })
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.15,
    },
  },
}

// Slide-in from the left with stagger
const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
}

// Timestamp subtle fade-in
const timestampVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.5, duration: 0.6, ease: 'easeOut' as const },
  },
}

// Badge entrance animation — slight pop-in
const badgeVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 20, delay: 0.2 },
  },
}

// Load more button spring entrance
const loadMoreVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
}

// Floating icon variants for empty state
const floatingIconVariants = [
  {
    animate: { y: [0, -8, 0], rotate: [0, 5, -5, 0] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 0 },
  },
  {
    animate: { y: [0, -10, 0], rotate: [0, -6, 4, 0] },
    transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.4 },
  },
  {
    animate: { y: [0, -6, 0], rotate: [0, 3, -3, 0] },
    transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.8 },
  },
  {
    animate: { y: [0, -9, 0], rotate: [0, -4, 6, 0] },
    transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.2 },
  },
  {
    animate: { y: [0, -7, 0], rotate: [0, 6, -2, 0] },
    transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.6 },
  },
]

// Loading skeletons
function FeedSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-3.5 flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-14 rounded" />
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function FeedActivity() {
  const { currentUser } = useAppStore()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visibleCount, setVisibleCount] = useState(5)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchFeed = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      // Fetch newest products as "activity" feed
      const [productsRes, newProductsRes] = await Promise.all([
        fetch('/api/products?isOffer=true&sort=newest&limit=5'),
        fetch('/api/products?isNew=true&sort=newest&limit=5'),
      ])

      const items: FeedItem[] = []

      // Transform offer products
      if (productsRes.ok) {
        const data = await productsRes.json()
        items.push(...transformProductsToFeed(data.products || []))
      }

      // Transform new products
      if (newProductsRes.ok) {
        const data = await newProductsRes.json()
        const newItems = transformProductsToFeed(data.products || [])
        // Deduplicate against existing items
        const existingIds = new Set(items.map(item => item.id))
        newItems.forEach(item => {
          if (!existingIds.has(item.id)) {
            items.push(item)
          }
        })
      }

      // If authenticated, try fetching recent orders as well
      if (currentUser) {
        try {
          const ordersRes = await fetch('/api/orders?limit=3')
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json()
            items.push(...transformOrdersToFeed(ordersData.orders || []))
          }
        } catch {
          // Orders fetch failed silently — we still have product activity
        }
      }

      // Sort by relevance: newest first
      setFeedItems(items.slice(0, 10))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  const handleLoadMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 3, feedItems.length))
      setLoadingMore(false)
    }, 600)
  }

  const visibleItems = feedItems.slice(0, visibleCount)
  const hasMore = visibleCount < feedItems.length

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="w-full feed-bg-animated r62-card-lift"
    >
      {/* Floating notification bell */}
      <motion.div
        className="absolute -top-1 right-1 z-20"
        animate={{ y: [0, -4, 0], rotate: [0, 15, 0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-400/30"
        >
          <span className="text-base leading-none">🔔</span>
        </motion.div>
      </motion.div>

      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          className="h-2.5 w-2.5 rounded-full bg-emerald-500"
        />
        <h3 className="font-semibold text-sm flex items-center gap-1.5 r62-heading-gradient">Atividade Recente</h3>
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 15, delay: 0.3 }}
        >
          <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 feed-live-badge-glow">
            AO VIVO
          </Badge>
        </motion.div>
        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-primary/5 text-primary border-0">
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
          <p className="text-sm text-muted-foreground mb-3">Não foi possível carregar as atividades</p>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs min-h-[44px]" onClick={fetchFeed}>
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty state with floating icons */}
      {!loading && !error && feedItems.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20 overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          {/* Floating background icons */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div className="absolute top-6 left-6" {...floatingIconVariants[0]}>
              <ShoppingBag className="h-6 w-6 text-primary/8" />
            </motion.div>
            <motion.div className="absolute top-8 right-10" {...floatingIconVariants[1]}>
              <Star className="h-5 w-5 text-amber-400/10" />
            </motion.div>
            <motion.div className="absolute bottom-10 left-12" {...floatingIconVariants[2]}>
              <Heart className="h-5 w-5 text-rose-400/10" />
            </motion.div>
            <motion.div className="absolute bottom-8 right-8" {...floatingIconVariants[3]}>
              <MessageSquare className="h-5 w-5 text-teal-400/10" />
            </motion.div>
            <motion.div className="absolute top-1/2 left-4 -translate-y-1/2" {...floatingIconVariants[4]}>
              <TrendingUp className="h-4 w-4 text-emerald-400/10" />
            </motion.div>
          </div>

          {/* Central floating icon cluster */}
          <div className="relative flex items-center justify-center mb-3">
            <motion.div
              className="absolute"
              animate={{ y: [0, -10, 0], x: [0, 4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.2 }}
            >
              <div className="h-10 w-10 rounded-full bg-amber-100/50 dark:bg-amber-900/20 flex items-center justify-center">
                <Tag className="h-5 w-5 text-amber-500/50" />
              </div>
            </motion.div>
            <motion.div
              className="absolute"
              animate={{ y: [0, -8, 0], x: [0, -6, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}
            >
              <div className="h-9 w-9 rounded-full bg-rose-100/50 dark:bg-rose-900/20 flex items-center justify-center">
                <Heart className="h-4.5 w-4.5 text-rose-500/50" />
              </div>
            </motion.div>
            <motion.div
              className="absolute"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.8 }}
            >
              <div className="h-11 w-11 rounded-full bg-teal-100/50 dark:bg-teal-900/20 flex items-center justify-center">
                <Sparkles className="h-5.5 w-5.5 text-teal-500/50" />
              </div>
            </motion.div>
            <motion.div
              className="absolute"
              animate={{ y: [0, -7, 0], x: [0, 5, 0] }}
              transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.0 }}
            >
              <div className="h-8 w-8 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Star className="h-4 w-4 text-emerald-500/50" />
              </div>
            </motion.div>
          </div>

          <h3 className="text-sm font-bold relative z-10">Nenhuma atividade ainda</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[240px] relative z-10">
            Seja o primeiro a deixar uma avaliação!
          </p>
        </motion.div>
      )}

      {/* Mobile: horizontal scroll */}
      {!loading && !error && feedItems.length > 0 && (
        <div className="block md:hidden">
          <ScrollArea className="w-full">
            <motion.div
              className="flex gap-3 pb-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-30px' }}
            >
              {feedItems.map((item, index) => {
                const ItemIcon = item.icon
                return (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    custom={index}
                    className="min-w-[280px] max-w-[300px] shrink-0"
                  >
                    <Card className="border-border/50 hover:shadow-lg hover:border-primary/20 transition-all card-premium-hover py-0 group hover:scale-[1.02] transform-gpu r18-feed-shimmer-border">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Avatar with gradient border ring + pulse for recent items */}
                          <div className="relative r18-avatar-ring-enhanced">
                            <div className="feed-avatar-pulse-ring" />
                            <motion.div
                              className="absolute -inset-[2px] rounded-full"
                              animate={{ opacity: [0.5, 0.8, 0.5] }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                              style={{ background: 'conic-gradient(from 0deg, #10b981, #f59e0b, #ec4899, #10b981)' }}
                            />
                            <div className="absolute -inset-[2px] rounded-full bg-gradient-to-br from-primary to-amber-400 opacity-60" />
                            <Avatar className="h-10 w-10 relative ring-2 ring-background">
                              <AvatarFallback className={`text-xs font-bold ${item.avatarBg}`}>
                                {item.avatar}
                              </AvatarFallback>
                            </Avatar>
                            {item.timeAgo.includes('min') && (
                              <motion.div
                                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
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
                              {/* Activity type badge with entrance animation and glow */}
                              <motion.span
                                variants={badgeVariants}
                                className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md r18-type-badge-glow ${typeBadgeColors[item.type]}`}
                              >
                                {typeLabels[item.type]}
                              </motion.span>
                              <div className={`h-4 w-4 rounded ${item.iconBg} flex items-center justify-center`}>
                                <ItemIcon className={`h-2.5 w-2.5 ${item.iconColor}`} />
                              </div>
                              {/* Timestamp with fade-in and pulse */}
                              <motion.span
                                variants={timestampVariants}
                                className="text-[10px] text-muted-foreground r18-timestamp-pulse"
                              >
                                {item.timeAgo}
                              </motion.span>
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
      )}

      {/* Desktop: vertical list */}
      {!loading && !error && feedItems.length > 0 && (
        <motion.div
          className="hidden md:block"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <div className="space-y-2">
            {visibleItems.map((item, index) => {
              const ItemIcon = item.icon
              return (
                <motion.div key={item.id} variants={itemVariants} custom={index}>
                  <Card className="border-border/50 hover:shadow-lg hover:border-primary/20 transition-all py-0 group cursor-default hover:scale-[1.01] transform-gpu">
                    <CardContent className="p-3.5 flex items-center gap-3">
                      {/* Avatar with gradient border */}
                      <div className="relative">
                        <div className="feed-avatar-pulse-ring" />
                        <div className="absolute -inset-[2px] rounded-full bg-gradient-to-br from-primary/40 to-amber-400/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Avatar className="h-11 w-11 relative ring-2 ring-background">
                          <AvatarFallback className={`text-xs font-bold ${item.avatarBg}`}>
                            {item.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online dot with pulse animation for recent items */}
                        {item.timeAgo.includes('min') && (
                          <>
                            <motion.div
                              className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500/40 border border-emerald-500/30"
                              animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                          </>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">
                          <span className="font-semibold">{item.name}</span>{' '}
                          <span className="text-muted-foreground">{item.action}</span>{' '}
                          <span className="font-semibold text-primary">{item.detail}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {/* Badge with entrance animation and color coding + glow */}
                          <motion.span
                            variants={badgeVariants}
                            className={`text-[9px] font-medium px-1.5 py-0.5 rounded r18-type-badge-glow ${typeBadgeColors[item.type]}`}
                          >
                            {typeLabels[item.type]}
                          </motion.span>
                          <div className={`h-4 w-4 rounded ${item.iconBg} flex items-center justify-center`}>
                            <ItemIcon className={`h-2.5 w-2.5 ${item.iconColor}`} />
                          </div>
                          {/* Timestamp with subtle fade-in and pulse */}
                          <motion.span
                            variants={timestampVariants}
                            className="text-[10px] text-muted-foreground r18-timestamp-pulse"
                          >
                            {item.timeAgo}
                          </motion.span>
                        </div>
                      </div>
                      {/* Hover action with subtle glow */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 min-h-[44px] px-2 text-xs text-primary r18-ver-mais-pulse">
                          Ver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Load more button with spring entrance and hover effect */}
          {hasMore && (
            <motion.div
              variants={loadMoreVariants}
              className="mt-3 flex justify-center"
            >
              <motion.div
                whileTap={{ scale: 0.93 }}
                whileHover={{ scale: 1.04 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="gap-1.5 text-xs border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary/50 hover:shadow-sm transition-shadow r18-ver-mais-pulse"
                >
                  {loadingMore ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                        className="h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent"
                      />
                      Carregando...
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                      >
                        <Package className="h-3.5 w-3.5" />
                      </motion.div>
                      Carregar mais atividades
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.section>
  )
}
