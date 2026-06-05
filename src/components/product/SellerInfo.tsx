'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, Star, Clock, Shield, ChevronDown, ChevronUp, Phone, MessageCircle, Check,
  Package, TrendingUp, Users, Heart, MapPin, Award, BadgeCheck, ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type StoreData } from '@/store/useAppStore'
import { cachedFetch } from '@/lib/api-cache'
import { getStoreImageUrl } from '@/lib/product-images'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
interface SellerInfoProps {
  storeId: string
  storeName?: string
}

interface ExtendedStoreInfo extends StoreData {
  responseTime?: string
  satisfactionRate?: number
  productsCount?: number
  totalOrders?: number
  verified?: boolean
}

/* ═══════════════════════════════════════════════════════════════
   Fallback store data
   ═══════════════════════════════════════════════════════════════ */
const fallbackStores: Record<string, ExtendedStoreInfo> = {
  s1: {
    id: 's1', name: 'Mercado do Zé', slug: 'mercado-do-ze', description: 'O melhor mercado de Dom Eliseu com produtos frescos e preços justos. Atendemos com carinho desde 2015.',
    category: 'FOOD', logo: '/images/grocery.jpg', coverImage: '/images/grocery.jpg',
    phone: '(91) 99999-0001', whatsapp: '(91) 99999-0001', address: 'Rua Principal, 123',
    neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 5.00,
    freeDeliveryAbove: 50, rating: 4.7, totalReviews: 128, opensAt: '07:00',
    closesAt: '21:00', openDays: '1,2,3,4,5,6,7', totalSales: 3500,
    responseTime: '~30min', satisfactionRate: 96, productsCount: 245, totalOrders: 2100, verified: true,
  },
  s2: {
    id: 's2', name: 'Açaí da Boa', slug: 'acai-da-boa', description: 'O mais autêntico açaí paraense, feito com frutas selecionadas da região. Qualidade premium em cada tigela.',
    category: 'FOOD', logo: '/images/acai.jpg', coverImage: '/images/acai.jpg',
    phone: '(91) 99999-0002', whatsapp: '(91) 99999-0002', address: 'Av. Brasil, 456',
    neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 3.00,
    freeDeliveryAbove: 30, rating: 4.9, totalReviews: 256, opensAt: '08:00',
    closesAt: '22:00', openDays: '1,2,3,4,5,6', totalSales: 5200,
    responseTime: '~15min', satisfactionRate: 98, productsCount: 32, totalOrders: 4100, verified: true,
  },
  s3: {
    id: 's3', name: 'Agropecuária São Paulo', slug: 'agropecuaria-sao-paulo', description: 'Tudo para o campo e para a cidade. Ferramentas, sementes e muito mais com atendimento especializado.',
    category: 'AGRICULTURE', logo: '/images/agriculture.jpg', coverImage: '/images/agriculture.jpg',
    phone: '(91) 99999-0003', whatsapp: '(91) 99999-0003', address: 'Rod. PA-279, Km 5',
    neighborhood: 'Zona Rural', city: 'Dom Eliseu', state: 'PA', deliveryFee: 8.00,
    freeDeliveryAbove: 200, rating: 4.5, totalReviews: 67, opensAt: '06:00',
    closesAt: '18:00', openDays: '1,2,3,4,5,6', totalSales: 1200,
    responseTime: '~1h', satisfactionRate: 92, productsCount: 180, totalOrders: 850, verified: true,
  },
  s4: {
    id: 's4', name: 'Farmácia Vida', slug: 'farmacia-vida', description: 'Sua saúde em primeiro lugar. Medicamentos, suplementos e atendimento farmacêutico com profissionais qualificados.',
    category: 'HEALTH', logo: '/images/pharmacy.jpg', coverImage: '/images/pharmacy.jpg',
    phone: '(91) 99999-0004', whatsapp: '(91) 99999-0004', address: 'Rua Pará, 789',
    neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 0,
    freeDeliveryAbove: null, rating: 4.6, totalReviews: 89, opensAt: '07:00',
    closesAt: '22:00', openDays: '1,2,3,4,5,6,7', totalSales: 2800,
    responseTime: '~20min', satisfactionRate: 94, productsCount: 320, totalOrders: 1800, verified: true,
  },
  s5: {
    id: 's5', name: 'Padaria Pão Quente', slug: 'padaria-pao-quente', description: 'Pão fresquinho todo dia! Doces, salgados e muito mais direto do forno para sua mesa.',
    category: 'FOOD', logo: '/images/bakery.jpg', coverImage: '/images/bakery.jpg',
    phone: '(91) 99999-0005', whatsapp: '(91) 99999-0005', address: 'Rua Amazonas, 321',
    neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 3.00,
    freeDeliveryAbove: 25, rating: 4.8, totalReviews: 198, opensAt: '05:00',
    closesAt: '20:00', openDays: '1,2,3,4,5,6,7', totalSales: 6100,
    responseTime: '~10min', satisfactionRate: 97, productsCount: 65, totalOrders: 4800, verified: true,
  },
  s6: {
    id: 's6', name: 'Loja do Eletrônico', slug: 'loja-do-eletronico', description: 'Celulares, acessórios e eletrônicos com as melhores ofertas e garantia.',
    category: 'ELECTRONICS', logo: '/images/electronics.jpg', coverImage: '/images/electronics.jpg',
    phone: '(91) 99999-0006', whatsapp: '(91) 99999-0006', address: 'Rua Tocantins, 654',
    neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 5.00,
    freeDeliveryAbove: 100, rating: 4.3, totalReviews: 45, opensAt: '08:00',
    closesAt: '20:00', openDays: '1,2,3,4,5,6', totalSales: 900,
    responseTime: '~45min', satisfactionRate: 90, productsCount: 150, totalOrders: 600, verified: false,
  },
  s7: {
    id: 's7', name: 'Pet Shop Amigo Fiel', slug: 'pet-shop-amigo-fiel', description: 'Tudo para seu melhor amigo. Rações, banho, tosa e acessórios com muito carinho.',
    category: 'ANIMALS', logo: '/images/pets.jpg', coverImage: '/images/pets.jpg',
    phone: '(91) 99999-0007', whatsapp: '(91) 99999-0007', address: 'Rua Maranhão, 987',
    neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 4.00,
    freeDeliveryAbove: 80, rating: 4.7, totalReviews: 112, opensAt: '08:00',
    closesAt: '19:00', openDays: '1,2,3,4,5,6', totalSales: 2200,
    responseTime: '~25min', satisfactionRate: 95, productsCount: 95, totalOrders: 1500, verified: true,
  },
  s8: {
    id: 's8', name: 'Salão da Bella', slug: 'salao-da-bella', description: 'Beleza e bem-estar para mulheres e homens. Cortes, coloração e tratamentos profissionais.',
    category: 'BEAUTY', logo: '/images/beauty.jpg', coverImage: '/images/beauty.jpg',
    phone: '(91) 99999-0008', whatsapp: '(91) 99999-0008', address: 'Rua Ceará, 147',
    neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 0,
    freeDeliveryAbove: null, rating: 4.9, totalReviews: 210, opensAt: '09:00',
    closesAt: '20:00', openDays: '1,2,3,4,5,6', totalSales: 1800,
    responseTime: '~1h', satisfactionRate: 99, productsCount: 40, totalOrders: 1200, verified: true,
  },
}

/* ═══════════════════════════════════════════════════════════════
   Star rating component (inline)
   ═══════════════════════════════════════════════════════════════ */
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.3 && rating - fullStars < 0.8

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, type: 'spring' as const, stiffness: 400, damping: 20 }}
          className={`${starSize} ${
            i < fullStars
              ? 'text-amber-400'
              : i === fullStars && hasHalf
                ? 'text-amber-400'
                : 'text-muted-foreground/30'
          }`}
        >
          ★
        </motion.span>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   VerifiedBadge — animated verified checkmark
   ═══════════════════════════════════════════════════════════════ */
function VerifiedBadge({ verified }: { verified: boolean }) {
  if (!verified) return null

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 12, delay: 0.3 }}
      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}
      >
        <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
      </motion.div>
      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Verificada</span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ResponseTimeIndicator — "Responde em ~X"
   ═══════════════════════════════════════════════════════════════ */
function ResponseTimeIndicator({ time }: { time?: string }) {
  if (!time) return null

  const isFast = time.includes('10') || time.includes('15') || time.includes('20')
  const isMedium = time.includes('30') || time.includes('45')

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full ${
        isFast
          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
          : isMedium
            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
            : 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400'
      }`}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <Clock className="h-2.5 w-2.5" />
      </motion.div>
      <span>Responde {time}</span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   StoreStats — product count, orders, satisfaction rate
   ═══════════════════════════════════════════════════════════════ */
function StoreStats({ store }: { store: ExtendedStoreInfo }) {
  const stats = [
    {
      icon: Package,
      label: 'Produtos',
      value: store.productsCount || 0,
      format: (v: number) => String(v),
      color: 'text-primary',
      bg: 'bg-primary/5',
    },
    {
      icon: TrendingUp,
      label: 'Pedidos',
      value: store.totalOrders || 0,
      format: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v),
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      icon: Award,
      label: 'Satisfação',
      value: store.satisfactionRate || 0,
      format: (v: number) => `${v}%`,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08, type: 'spring' as const, stiffness: 300, damping: 22 }}
          className={`${stat.bg} rounded-xl p-2.5 text-center relative overflow-hidden`}
        >
          {/* Shimmer effect */}
          <motion.span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 55%, transparent 60%)',
              backgroundSize: '300% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' as const, repeatDelay: 2, delay: i * 0.6 }}
          />
          <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1 relative z-10`} />
          <p className="text-[9px] text-muted-foreground relative z-10">{stat.label}</p>
          <p className={`text-xs font-bold ${stat.color} relative z-10`}>
            {stat.format(stat.value)}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   AboutStoreExpandable — expandable "Sobre a Loja" section
   ═══════════════════════════════════════════════════════════════ */
function AboutStoreExpandable({ description }: { description?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!description) return null

  const isLong = description.length > 100
  const displayText = isLong && !isExpanded ? `${description.slice(0, 100)}...` : description

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-4"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 text-primary" />
            Sobre a Loja
          </h4>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </motion.div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={isExpanded ? 'full' : 'short'}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="text-[11px] text-muted-foreground leading-relaxed"
          >
            {displayText}
          </motion.p>
        </AnimatePresence>
        {isLong && (
          <span className="text-[10px] text-primary font-medium mt-1 inline-block">
            {isExpanded ? 'Ver menos' : 'Ver mais'}
          </span>
        )}
      </button>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ContactButtons — WhatsApp, Chat, Phone
   ═══════════════════════════════════════════════════════════════ */
function ContactButtons({ store }: { store: ExtendedStoreInfo }) {
  const { toggleFavoriteStore, isFavoriteStore } = useAppStore()
  const isFav = isFavoriteStore(store.id)

  const handleWhatsApp = () => {
    const phone = store.whatsapp?.replace(/\D/g, '') || ''
    if (phone) {
      window.open(`https://wa.me/55${phone}`, '_blank')
    }
  }

  const handlePhone = () => {
    const phone = store.phone || ''
    if (phone) {
      window.open(`tel:${phone}`, '_self')
    }
  }

  const contacts = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      action: handleWhatsApp,
      disabled: !store.whatsapp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/30',
      border: 'border-emerald-200/50 dark:border-emerald-800/30',
    },
    {
      icon: Phone,
      label: 'Ligar',
      action: handlePhone,
      disabled: !store.phone,
      color: 'text-primary',
      bg: 'bg-primary/5 hover:bg-primary/10',
      border: 'border-primary/20',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-4"
    >
      <h4 className="text-xs font-bold text-foreground mb-2">Contato</h4>
      <div className="flex gap-2">
        {contacts.map((contact) => (
          <motion.button
            key={contact.label}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={contact.action}
            disabled={contact.disabled}
            className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[11px] font-semibold border transition-all ${
              contact.disabled
                ? 'bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50'
                : `${contact.bg} ${contact.color} ${contact.border}`
            }`}
          >
            <contact.icon className="h-3.5 w-3.5" />
            {contact.label}
          </motion.button>
        ))}
        {/* Favorite store button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={() => toggleFavoriteStore(store.id)}
          className={`h-9 w-9 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
            isFav
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30 text-red-500'
              : 'bg-muted border-border hover:bg-secondary text-muted-foreground'
          }`}
        >
          <motion.div whileTap={{ scale: 1.3 }}>
            <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-red-500' : ''}`} />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════ */
function SellerInfoSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 rounded-lg" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — SellerInfo
   ═══════════════════════════════════════════════════════════════ */
export function SellerInfo({ storeId, storeName }: SellerInfoProps) {
  const { navigate, selectStore } = useAppStore()
  const [storeInfo, setStoreInfo] = useState<ExtendedStoreInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch store info
  useEffect(() => {
    let cancelled = false
    const fetchStore = async () => {
      setIsLoading(true)
      try {
        // First check fallback
        if (fallbackStores[storeId]) {
          if (!cancelled) setStoreInfo(fallbackStores[storeId])
        } else {
          // Fetch from API
          const data = await cachedFetch('/api/stores')
          const stores: StoreData[] = data.stores || []
          const found = stores.find((s) => s.id === storeId)
          if (!cancelled && found) {
            setStoreInfo({ ...found, responseTime: '~30min', satisfactionRate: 94, productsCount: 120, totalOrders: 800, verified: true })
          } else if (!cancelled && storeName) {
            // Create minimal info from store name
            setStoreInfo({
              id: storeId,
              name: storeName,
              slug: storeName.toLowerCase().replace(/\s+/g, '-'),
              description: 'Loja parceira do DomPlace.',
              category: 'OTHER',
              logo: null,
              coverImage: null,
              phone: null,
              whatsapp: null,
              address: 'Dom Eliseu, PA',
              neighborhood: 'Centro',
              city: 'Dom Eliseu',
              state: 'PA',
              deliveryFee: 5,
              freeDeliveryAbove: null,
              rating: 4.5,
              totalReviews: 50,
              opensAt: '08:00',
              closesAt: '20:00',
              openDays: '1,2,3,4,5,6',
              responseTime: '~30min',
              satisfactionRate: 93,
              productsCount: 85,
              totalOrders: 500,
              verified: false,
            })
          }
        }
      } catch {
        // Use fallback
        if (!cancelled && fallbackStores[storeId]) {
          setStoreInfo(fallbackStores[storeId])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchStore()
    return () => { cancelled = true }
  }, [storeId, storeName])

  // Handle "Ver Loja" button
  const handleViewStore = () => {
    if (storeInfo) {
      selectStore(storeInfo)
      navigate('store')
    }
  }

  if (isLoading) return <SellerInfoSkeleton />
  if (!storeInfo) return null

  // Generate store avatar initials
  const initials = storeInfo.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const storeImgUrl = getStoreImageUrl(storeInfo.slug)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 28, delay: 0.1 }}
      className="bg-card border border-border rounded-2xl overflow-hidden relative"
    >
      {/* Top gradient accent */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-emerald-500 to-teal-500 relative overflow-hidden">
        <motion.span
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.35) 55%, transparent 60%)',
            backgroundSize: '300% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' as const, repeatDelay: 1.5 }}
        />
      </div>

      <div className="p-4">
        {/* Store avatar + name + rating row */}
        <div className="flex items-center gap-3">
          {/* Avatar with gradient ring */}
          <motion.div
            className="relative shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.15 }}
          >
            {/* Animated gradient ring */}
            <motion.div
              className="absolute -inset-1 rounded-xl"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(16,185,129,0.3)',
                  '0 0 0 4px rgba(16,185,129,0)',
                  '0 0 0 0 rgba(16,185,129,0.3)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
              style={{
                background: 'conic-gradient(from 0deg, #10b981, #14b8a6, #0d9488, #10b981)',
                borderRadius: '12px',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'xor',
                WebkitMaskComposite: 'xor',
                padding: '2px',
              }}
            />
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-lg font-bold text-white shadow-lg relative overflow-hidden">
              {storeImgUrl ? (
                <img src={storeImgUrl} alt={storeInfo.name} className="absolute inset-0 w-full h-full object-cover rounded-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              ) : null}
              <span className="relative z-10">{storeImgUrl ? '' : initials}</span>
            </div>
          </motion.div>

          {/* Name + rating + verified */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold truncate">{storeInfo.name}</h3>
              <VerifiedBadge verified={storeInfo.verified || false} />
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={storeInfo.rating} size="sm" />
              <span className="text-[10px] text-muted-foreground">
                {storeInfo.rating} ({storeInfo.totalReviews} avaliações)
              </span>
            </div>

            {/* Response time */}
            <div className="mt-1">
              <ResponseTimeIndicator time={storeInfo.responseTime} />
            </div>
          </div>
        </div>

        {/* Address line */}
        {storeInfo.address && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center gap-1.5 mt-3 text-[10px] text-muted-foreground"
          >
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{storeInfo.address}{storeInfo.neighborhood ? ` · ${storeInfo.neighborhood}` : ''} · {storeInfo.city}, {storeInfo.state}</span>
          </motion.div>
        )}

        {/* Store stats */}
        <StoreStats store={storeInfo} />

        {/* "Sobre a Loja" expandable */}
        <AboutStoreExpandable description={storeInfo.description || undefined} />

        {/* Contact buttons */}
        <ContactButtons store={storeInfo} />

        {/* "Ver Loja" CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleViewStore}
            className="w-full h-10 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 transition-colors shadow-md relative overflow-hidden"
          >
            {/* CTA shimmer sweep */}
            <motion.span
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)',
                backgroundSize: '300% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' as const, repeatDelay: 2 }}
            />
            <Store className="h-4 w-4 relative z-10" />
            <span className="relative z-10">Ver Loja Completa</span>
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
              className="relative z-10"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  )
}
