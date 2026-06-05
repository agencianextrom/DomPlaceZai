'use client'

import { ArrowLeft, Clock, MapPin, Phone, MessageCircle, ShoppingBag, Heart, Share2, ChevronDown, ChevronUp, Store, Truck, Star, Instagram, Facebook, Globe, Percent, ShieldCheck, Zap, Award, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type StoreData, type ProductData } from '@/store/useAppStore'
import { ProductCard, formatBRL } from '@/components/product/ProductCard'
import { StarRating } from '@/components/ui/StarRating'
import { StoreRatingBreakdown } from './StoreRatingBreakdown'
import { InteractiveStars } from './InteractiveStars'
import { StoreStatusBadge } from './StoreStatusBadge'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

interface StoreProfileProps {
  store: StoreData
}

// --- Types ---
interface ReviewData {
  id: string
  accountName: string | null
  accountAvatar: string | null
  rating: number
  comment: string | null
  images: string | null
  reply: string | null
  isVerified: boolean
  createdAt: string
}

interface RatingDistributionItem {
  rating: number
  count: number
}

interface PromotionData {
  id: string
  code: string
  title: string
  description: string | null
  type: string
  value: number
  minOrderValue: number | null
  endsAt: string
  maxDiscount: number | null
}

const categoryLabels: Record<string, string> = {
  AGRICULTURE: 'Agricultura',
  FOOD: 'Alimentação',
  SERVICES: 'Serviços',
  FASHION: 'Moda',
  ELECTRONICS: 'Eletrônicos',
  HEALTH: 'Saúde',
  HOME_GARDEN: 'Casa & Jardim',
  ANIMALS: 'Animais',
  EDUCATION: 'Educação',
  BEAUTY: 'Beleza',
  SPORTS: 'Esportes',
  OTHER: 'Outros',
}

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const storeInfoCards = [
  { icon: Truck, label: 'Entrega Rápida', value: '30-45 min', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: ShieldCheck, label: 'Pagamento Seguro', value: 'Pix, Cartão', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
  { icon: Award, label: 'Garantia', value: 'Satisfação', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/20' },
]

const tabItems = [
  { value: 'produtos', label: 'Produtos', icon: ShoppingBag },
  { value: 'sobre', label: 'Sobre', icon: Store },
  { value: 'avaliacoes', label: 'Avaliações', icon: Star },
  { value: 'promocoes', label: 'Promoções', icon: Percent },
] as const

type TabValue = typeof tabItems[number]['value']

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays} dias atrás`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''} atrás`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) > 1 ? 'es' : ''} atrás`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getPromoGradient(type: string): string {
  switch (type) {
    case 'PERCENTAGE': return 'from-emerald-500 to-teal-600'
    case 'FIXED_AMOUNT': return 'from-amber-500 to-orange-600'
    case 'FREE_DELIVERY': return 'from-primary to-emerald-600'
    default: return 'from-primary to-emerald-600'
  }
}

function getPromoBadge(type: string, value: number): string {
  switch (type) {
    case 'PERCENTAGE': return `${value}% OFF`
    case 'FIXED_AMOUNT': return `R$${value} OFF`
    case 'FREE_DELIVERY': return 'Frete Grátis'
    default: return `${value}%`
  }
}

export function StoreProfile({ store }: StoreProfileProps) {
  const { goBack, navigate, isFavoriteStore, toggleFavoriteStore } = useAppStore()
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState<TabValue>('produtos')
  const [showWhatsAppFab, setShowWhatsAppFab] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const bannerY = useTransform(scrollY, [0, 300], [0, 80])
  const bannerOverlayOpacity = useTransform(scrollY, [0, 250], [0.55, 0.95])
  const bannerAccentY = useTransform(scrollY, [0, 300], [0, 15])
  const bannerScale = useTransform(scrollY, [0, 300], [1, 1.08])

  // Reviews & Promotions state
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistributionItem[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [promotions, setPromotions] = useState<PromotionData[]>([])
  const [promotionsLoading, setPromotionsLoading] = useState(false)
  
  const isFav = isFavoriteStore(store.id)

  // Fetch products
  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/stores/${store.id}?include=products`)
        const data = await res.json()
        if (!cancelled) setProducts(data.products || [])
      } catch {
        if (!cancelled) setProducts([])
      }
      if (!cancelled) setLoading(false)
    }
    fetchData()
    return () => { cancelled = true }
  }, [store.id])

  // Fetch reviews (lazy — only when reviews tab is active)
  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true)
    try {
      const res = await fetch(`/api/reviews?storeId=${store.id}`)
      const data = await res.json()
      if (res.ok) {
        setReviews(data.reviews || [])
        setRatingDistribution(data.ratingDistribution || [])
      }
    } catch {
      // Silent fail
    } finally {
      setReviewsLoading(false)
    }
  }, [store.id])

  // Fetch promotions (lazy — only when promos tab is active)
  const fetchPromotions = useCallback(async () => {
    setPromotionsLoading(true)
    try {
      const res = await fetch(`/api/promotions?storeId=${store.id}`)
      const data = await res.json()
      if (res.ok) {
        setPromotions(data.promotions || [])
      }
    } catch {
      // Silent fail
    } finally {
      setPromotionsLoading(false)
    }
  }, [store.id])

  // Lazy fetch when switching tabs
  useEffect(() => {
    if (activeTab === 'avaliacoes' && reviews.length === 0 && !reviewsLoading) {
      fetchReviews()
    }
  }, [activeTab, reviews.length, reviewsLoading, fetchReviews])

  useEffect(() => {
    if (activeTab === 'promocoes' && promotions.length === 0 && !promotionsLoading) {
      fetchPromotions()
    }
  }, [activeTab, promotions.length, promotionsLoading, fetchPromotions])

  // Show WhatsApp FAB after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      setShowWhatsAppFab(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const isOpen = store.opensAt && store.closesAt ? (() => {
    const now = new Date()
    const brasiliaOffset = -3
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const brasiliaTime = new Date(utc + brasiliaOffset * 3600000)
    const [h, m] = store.opensAt!.split(':').map(Number)
    const [eh, em] = store.closesAt!.split(':').map(Number)
    const currentMins = brasiliaTime.getHours() * 60 + brasiliaTime.getMinutes()
    const openMins = h * 60 + m
    const closeMins = eh * 60 + em
    return currentMins >= openMins && currentMins <= closeMins
  })() : true

  const openDaysList = store.openDays ? store.openDays.split(',').map(Number) : [1,2,3,4,5,6,7]
  
  const getHoursForDay = (dayNum: number) => {
    const isToday = new Date().getDay() === dayNum
    const isOpenDay = openDaysList.includes(dayNum)
    return {
      day: dayNames[dayNum],
      hours: isOpenDay ? `${store.opensAt} - ${store.closesAt}` : 'Fechado',
      isToday,
      isOpenDay,
    }
  }

  const handleWhatsApp = () => {
    const phone = store.whatsapp?.replace(/\D/g, '') || store.phone?.replace(/\D/g, '')
    if (phone) {
      window.open(`https://wa.me/55${phone}`, '_blank')
    }
  }

  // Loading skeleton for reviews
  const ReviewSkeleton = () => (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-3 w-full mt-3" />
        <Skeleton className="h-3 w-3/4 mt-1" />
      </CardContent>
    </Card>
  )

  // Loading skeleton for promotions
  const PromoSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="flex">
        <Skeleton className="w-24 sm:w-32 h-full" />
        <CardContent className="p-4 flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </div>
    </Card>
  )
  
  return (
    <div className="min-h-screen pb-20 md:pb-4">
      {/* Hero header with premium gradient cover and parallax */}
      <div ref={bannerRef} className="relative h-56 sm:h-72 -mx-4 -mt-4 overflow-hidden r46-banner-parallax">
        {/* Animated gradient background with parallax zoom */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-teal-700 r28-ken-burns r34-store-profile-cover-zoom r35-store-cover-zoom r38-store-cover-shimmer r46-store-header-gradient"
          style={{ y: bannerY, scale: bannerScale }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-emerald-800/50 to-amber-600/20 r42-hero-gradient"
          style={{ y: bannerY, backgroundSize: '200% 200%' }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        {/* Dark gradient overlay for text readability */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
          style={{ opacity: bannerOverlayOpacity }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-amber-500/10"
          style={{ y: bannerAccentY, opacity: bannerOverlayOpacity }}
 />
        
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-12 sm:h-16 fill-background" preserveAspectRatio="none">
            <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,50 1440,40 L1440,60 L0,60 Z" />
          </svg>
        </div>

        {/* Back button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack}
          className="absolute top-4 left-4 h-10 w-10 bg-black/20 hover:bg-black/40 text-white border-0 z-10 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Action buttons on cover */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavoriteStore(store.id)}
            className="h-10 w-10 bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
          >
            <Heart className={`h-5 w-5 transition-all ${isFav ? 'fill-red-400 text-red-400 scale-110' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-sm"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Store name overlay */}
        <div className="absolute bottom-12 left-4 right-4 text-white z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl font-bold text-shadow-lg r42-store-name-shimmer"
          >
            {store.name}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mt-2 flex-wrap"
          >
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
              {categoryLabels[store.category] || store.category}
            </Badge>
            {isOpen ? (
              <span className="flex items-center gap-1.5 text-xs bg-emerald-500/25 text-emerald-100 px-2.5 py-1 rounded-full backdrop-blur-sm">
                <span className="status-dot-open" />
                Aberto agora
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs bg-red-500/25 text-red-100 px-2.5 py-1 rounded-full backdrop-blur-sm">
                <span className="status-dot-closed" />
                Fechado
              </span>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Store info section with glassmorphism */}
      <div className="px-4 -mt-6 relative z-10">
        {/* Glassmorphism card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 25 }}
          className="mb-5 p-5 rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50 shadow-xl r28-store-gradient-border r38-store-info-glass"
        >
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-600/20 border-2 border-background shadow-xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary gradient-border shrink-0 r38-store-avatar-ring"
            >
              {store.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </motion.div>
            <div className="pb-1 min-w-0 flex-1">
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl sm:text-2xl font-bold text-shadow-lg r28-store-name-shimmer r38-store-name-gradient"
              >
                {store.name}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex items-center gap-2 mt-1"
              >
                {/* Animated rating stars with glow pulse */}
                <motion.div
                  animate={{ boxShadow: store.rating > 0
                    ? '0 0 14px rgba(251,191,36,0.3), 0 0 4px rgba(251,191,36,0.15)'
                    : '0 0 0px rgba(251,191,36,0)' }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  className={store.rating > 0 ? 'rating-star-glow rounded-lg r34-store-profile-star-pulse r38-store-star-glow r42-rating-glow r46-rating-star-glow r60-stars-glow' : 'rounded-lg'}
                >
                  <StarRating rating={store.rating} size="sm" showCount count={store.totalReviews} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Store stats cards — premium hover */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
          {[
            { icon: ShoppingBag, label: 'Produtos', value: products.length || 0, bg: 'bg-primary/5 hover:bg-primary/10', iconColor: 'text-primary' },
            { icon: Star, label: 'Avaliação', value: store.rating.toFixed(1), bg: 'bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20', iconColor: 'text-amber-500 fill-amber-500' },
            { icon: MessageCircle, label: 'Avaliações', value: store.totalReviews || 0, bg: 'bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20', iconColor: 'text-emerald-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
            >
              <Card className={`border-0 ${stat.bg} transition-colors cursor-default card-premium-hover r42-stats-glow r46-stats-card`}>
                <CardContent className="p-3 text-center">
                  <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.iconColor}`} />
                  <p className="text-lg font-bold animate-count-up r38-store-stat-counter r46-stats-counter-animate r62-counter-animate">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Store info cards — trust badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          {storeInfoCards.map((info, i) => (
            <motion.div
              key={info.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.06 }}
              whileHover={{ y: -2 }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors cursor-default r46-store-badge-stagger"
            >
              <div className={`h-8 w-8 rounded-lg ${info.bg} flex items-center justify-center ${info.label === 'Entrega Rápida' ? 'r34-store-profile-delivery-shimmer' : ''}`}>
                <info.icon className={`h-4 w-4 ${info.color}`} />
              </div>
              <div className="text-center">
                <p className={`text-[10px] font-semibold ${store.rating > 0 && info.label === 'Avaliação' ? 'r34-store-profile-star-pulse' : ''}`}>{info.label}</p>
                <p className="text-[9px] text-muted-foreground">{info.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Delivery info */}
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex items-center gap-3 mt-4"
        >
          <StoreStatusBadge isOpen={isOpen} closingTime={store.closesAt || undefined} />
          {store.deliveryFee === 0 ? (
            <Badge variant="secondary" className="text-primary bg-primary/10 text-xs r34-store-profile-delivery-shimmer">
              <Truck className="h-3 w-3 mr-1" />
              Entrega grátis
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Truck className="h-4 w-4 text-primary" />
              Entrega: {formatBRL(store.deliveryFee)}
              {store.freeDeliveryAbove && (
                <span className="text-xs"> (grátis acima de {formatBRL(store.freeDeliveryAbove)})</span>
              )}
            </span>
          )}
          <span className="text-xs text-muted-foreground">· 30-45 min</span>
        </motion.div>
        
        {/* Seguir loja + Contact actions */}
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2 mt-4"
        >
          <motion.button
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
            onClick={() => toggleFavoriteStore(store.id)}
            className={`relative overflow-hidden h-11 px-5 rounded-xl font-semibold text-sm flex items-center gap-2 r34-store-profile-follow-btn r35-store-follow-btn r46-follow-btn-gradient active:scale-95 transition-transform ${isFav ? 'bg-primary text-primary-foreground r38-store-follow-active is-following' : 'bg-secondary text-secondary-foreground border border-border'}`}
          >
            <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
            {isFav ? 'Seguindo' : 'Seguir loja'}
            <span className="r34-store-profile-follow-shimmer" />
          </motion.button>
          {(store.whatsapp || store.phone) && (
            <Button 
              className="flex-1 h-11 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white btn-glow rounded-xl r38-store-contact-btn r42-contact-shimmer active:scale-95 transition-transform"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Abrir no WhatsApp
            </Button>
          )}
          {store.phone && (
            <Button variant="outline" className="h-11 px-4 r38-store-contact-btn" onClick={() => {
              window.open(`tel:${store.phone!.replace(/\D/g, '')}`, '_self')
            }}>
              <Phone className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
        
        {/* Address */}
        {store.address && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center gap-2 mt-3 text-sm text-muted-foreground"
          >
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            {store.address}, {store.neighborhood || ''} - {store.city}/{store.state}
          </motion.div>
        )}
        
        {/* Description */}
        {store.description && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-3"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              {showFullDescription || store.description.length < 100
                ? store.description
                : `${store.description.slice(0, 100)}...`}
            </p>
            {store.description.length > 100 && (
              <button 
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm text-primary hover:underline mt-1 flex items-center gap-1 active:scale-95 transition-transform"
              >
                {showFullDescription ? 'Ver menos' : 'Ver mais'}
                {showFullDescription ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Custom Tabs with animated underline indicator */}
      <div className="mt-6 -mx-4 px-4">
        <div className="relative">
          {/* Tab buttons */}
          <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
            {tabItems.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex-1 relative flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm font-medium transition-colors active:scale-95 transition-transform ${
                    isActive 
                      ? 'text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <>
                      <motion.div
                        layoutId="store-tab-bg"
                        className="absolute inset-0 bg-primary rounded-lg r34-store-profile-tab-glow r35-store-tab-indicator r38-store-tab-glow r42-tab-glow"
                        transition={{ type: 'spring' as const, stiffness: 420, damping: 28, mass: 0.8 }}
                      />
                    </>
                  )}
                  <TabIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'produtos' && (
            <motion.div
              key="produtos"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="aspect-square rounded-xl loading-skeleton" />
                      <div className="h-3 w-3/4 rounded loading-skeleton" />
                      <div className="h-3 w-1/2 rounded loading-skeleton" />
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.06,
                      },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  {products.map((p) => (
                    <motion.div
                      key={p.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            type: 'spring' as const,
                            stiffness: 220,
                            damping: 20,
                            duration: 0.45,
                          },
                        },
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="product-card-hover-enhanced r28-grid-hover-shine r35-store-product-hover r38-store-product-card r42-product-hover r46-product-card-hover active:scale-95 transition-transform">
                        <ProductCard product={p} />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 text-muted-foreground"
                >
                  <Store className="h-16 w-16 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="font-medium">Nenhum produto disponível</p>
                  <p className="text-sm mt-1">no momento</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'sobre' && (
            <motion.div
              key="sobre"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-4"
            >
              {/* About */}
              <Card className="border-border/50 card-spotlight hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2">Sobre a loja</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {store.description || 'Nenhuma descrição disponível.'}
                  </p>
                </CardContent>
              </Card>

              {/* Hours */}
              <Card className="border-border/50 card-spotlight hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="px-4 py-3 flex items-center gap-2 border-b border-border/30">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Horário de funcionamento</span>
                  </div>
                  {[0,1,2,3,4,5,6].map((day, idx) => {
                    const info = getHoursForDay(day)
                    return (
                      <div key={day} className={`flex items-center justify-between px-4 py-2.5 transition-colors ${idx < 6 ? 'border-b border-border/30' : ''} ${info.isToday ? 'bg-primary/5' : ''}`}>
                        <span className={`text-sm ${info.isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                          {info.day}{info.isToday ? ' (hoje)' : ''}
                        </span>
                        <span className={`text-sm ${!info.isOpenDay ? 'text-muted-foreground/50' : info.isToday ? 'font-semibold' : ''}`}>
                          {info.hours}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
              
              {/* Contact */}
              <Card className="border-border/50 card-spotlight hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-3">Contato e redes sociais</h3>
                  <div className="space-y-3">
                    {store.phone && (
                      <div className="flex items-center gap-3 text-sm group">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Telefone</p>
                          <p className="font-medium">{store.phone}</p>
                        </div>
                      </div>
                    )}
                    {store.whatsapp && (
                      <div className="flex items-center gap-3 text-sm group">
                        <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MessageCircle className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">WhatsApp</p>
                          <p className="font-medium">{store.whatsapp}</p>
                        </div>
                      </div>
                    )}
                    {store.address && (
                      <div className="flex items-center gap-3 text-sm group">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Endereço</p>
                          <p className="font-medium">{store.address}, {store.neighborhood} - {store.city}/{store.state}</p>
                        </div>
                      </div>
                    )}
                    {/* Social media */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="h-9 min-h-[44px] gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        onClick={() => window.open('https://instagram.com/' + store.name.toLowerCase().replace(/\s+/g, ''), '_blank')}
                      >
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 min-h-[44px] gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        onClick={() => window.open('https://facebook.com/' + store.name.toLowerCase().replace(/\s+/g, ''), '_blank')}
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 min-h-[44px] gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        onClick={() => window.open('https://wa.me/5591999999999', '_blank')}
                      >
                        <Globe className="h-4 w-4" />
                        Site
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery */}
              <Card className="border-primary/20 card-spotlight hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-primary" />
                    Informações de entrega
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa de entrega</span>
                      <span className="font-medium">{store.deliveryFee === 0 ? 'Grátis' : formatBRL(store.deliveryFee)}</span>
                    </div>
                    {store.freeDeliveryAbove && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frete grátis acima de</span>
                        <span className="font-medium text-primary">{formatBRL(store.freeDeliveryAbove)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tempo estimado</span>
                      <span className="font-medium">30-45 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Área de cobertura</span>
                      <span className="font-medium">{store.city} e região</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'avaliacoes' && (
            <motion.div
              key="avaliacoes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-4"
            >
              {/* Rating breakdown with interactive stars */}
              <StoreRatingBreakdown
                rating={store.rating}
                totalReviews={store.totalReviews}
                storeName={store.name}
                ratingDistribution={ratingDistribution}
              />

              {/* Interactive Star Rating */}
              <Card className="border-primary/10 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/5 dark:to-orange-900/5">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    Avalie esta loja
                  </h3>
                  <InteractiveStars
                    rating={store.rating}
                    totalReviews={store.totalReviews}
                    interactive
                    size="lg"
                    showCount
                    layout="horizontal"
                  />
                </CardContent>
              </Card>
              
              {/* Reviews list */}
              {reviewsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ReviewSkeleton key={i} />
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="border-border/50 card-spotlight hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                            {(review.accountName || 'U')[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm">{review.accountName || 'Usuário'}</p>
                              <span className="text-[10px] text-muted-foreground">{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="mt-0.5">
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                        )}
                        {/* Store reply */}
                        {review.reply && (
                          <div className="mt-2 ml-6 p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                            <p className="text-[10px] font-semibold text-primary mb-1">Resposta da loja</p>
                            <p className="text-xs text-muted-foreground">{review.reply}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="font-medium">Nenhuma avaliação ainda</p>
                  <p className="text-sm mt-1">Seja o primeiro a avaliar esta loja!</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'promocoes' && (
            <motion.div
              key="promocoes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-3"
            >
              {/* Promo banner header */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary via-emerald-600 to-teal-600 p-6 text-white">
                <div className="absolute inset-0 dot-pattern opacity-20" />
                <div className="absolute top-2 right-2">
                  <Zap className="h-8 w-8 text-amber-400/40" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Ver todas as promoções
                  </h3>
                  <p className="text-sm text-white/80 mt-1">
                    {promotionsLoading ? 'Carregando...' : `${promotions.length} ofertas ativas nesta loja`}
                  </p>
                </div>
              </div>

              {/* Promo cards */}
              {promotionsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <PromoSkeleton key={i} />
                  ))}
                </div>
              ) : promotions.length > 0 ? (
                promotions.map((promo, i) => (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="overflow-hidden card-spotlight hover:shadow-lg transition-all card-premium-hover">
                      <div className="flex">
                        <div className={`w-24 sm:w-32 bg-gradient-to-br ${getPromoGradient(promo.type)} flex items-center justify-center shrink-0`}>
                          <motion.span 
                            className="text-white font-bold text-sm sm:text-base text-center px-2"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          >
                            {getPromoBadge(promo.type, promo.value)}
                          </motion.span>
                        </div>
                        <CardContent className="p-4 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-sm">{promo.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{promo.description || `Desconto de ${getPromoBadge(promo.type, promo.value)} para pedidos${promo.minOrderValue ? ` acima de R$${promo.minOrderValue}` : ''}`}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5" />
                                  {promo.endsAt ? `Válido até ${new Date(promo.endsAt).toLocaleDateString('pt-BR')}` : 'Sem validade'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <Percent className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="font-medium">Nenhuma promoção ativa</p>
                  <p className="text-sm mt-1">no momento</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating WhatsApp FAB */}
      <AnimatePresence>
        {showWhatsAppFab && (store.whatsapp || store.phone) && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleWhatsApp}
            className="fixed bottom-24 md:bottom-8 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-900/20 flex items-center justify-center fab-ping hover:shadow-2xl hover:shadow-emerald-900/30 transition-shadow duration-300"
            aria-label="Abrir WhatsApp"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
