'use client'

import { useState, useEffect, useCallback } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Sparkles, Tag, ShoppingBag, RefreshCw, Package, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

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
      className="w-full"
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <h3 className="font-semibold text-sm">Atividade Recente</h3>
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
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={fetchFeed}>
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && feedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center">
              <Star className="h-8 w-8 text-primary/40" />
            </div>
          </motion.div>
          <h3 className="text-sm font-bold mt-3">Nenhuma atividade ainda</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
            Seja o primeiro a deixar uma avaliação!
          </p>
        </div>
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
                      <Package className="h-3.5 w-3.5" />
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
