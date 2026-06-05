'use client'

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Clock,
  Eye,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  Instagram,
  Youtube,
  MessageCircle,
  TrendingUp,
  Play,
  ThumbsUp,
  BadgeCheck,
  ExternalLink,
  Code2,
  Sparkles,
  Flame,
  Tag,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CreatorProduct {
  id: string
  name: string
  price: number
  comparePrice: number | null
  image: string | null
  category: string
  rating: number
  reviews: number
  isExclusive: boolean
  discountCode: string | null
  discountPercent: number
  expiresAt: number | null
}

interface VideoReel {
  id: string
  thumbnail: string | null
  views: number
  likes: number
  duration: string
  title: string
}

interface CreatorData {
  id: string
  name: string
  handle: string
  avatar: string | null
  bio: string
  bannerGradient: string
  followers: number
  following: number
  verified: boolean
  socialLinks: {
    instagram: string | null
    youtube: string | null
    tiktok: string | null
  }
  engagementStats: {
    totalLikes: number
    totalShares: number
    engagementRate: number
    avgViews: number
  }
  products: CreatorProduct[]
  reels: VideoReel[]
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const CREATORS: CreatorData[] = [
  {
    id: 'creator-1',
    name: 'Caroline Mendes',
    handle: '@carolmendes',
    avatar: null,
    bio: 'Lifestyle & Tech enthusiast compartilhando os melhores achados do mercado. Amo testar produtos novos e mostrar pra vocês o que realmente vale a pena! 🎯',
    bannerGradient: 'from-purple-500 via-pink-500 to-rose-400',
    followers: 1247500,
    following: 342,
    verified: true,
    socialLinks: {
      instagram: 'https://instagram.com/carolmendes',
      youtube: 'https://youtube.com/@carolmendes',
      tiktok: 'https://tiktok.com/@carolmendes',
    },
    engagementStats: {
      totalLikes: 4520000,
      totalShares: 287000,
      engagementRate: 8.7,
      avgViews: 320000,
    },
    products: [
      { id: 'cp1-1', name: 'Fone Bluetooth Pro ANC', price: 189.90, comparePrice: 349.90, image: null, category: 'Eletrônicos', rating: 4.8, reviews: 1247, isExclusive: true, discountCode: 'CAROL20', discountPercent: 20, expiresAt: Date.now() + 86400000 * 2 },
      { id: 'cp1-2', name: 'Smartwatch Fitness Ultra', price: 299.90, comparePrice: 599.90, image: null, category: 'Eletrônicos', rating: 4.7, reviews: 893, isExclusive: true, discountCode: 'CAROL25', discountPercent: 25, expiresAt: Date.now() + 86400000 * 3 },
      { id: 'cp1-3', name: 'Bolsa Tote Premium Couro', price: 249.90, comparePrice: 449.90, image: null, category: 'Moda', rating: 4.9, reviews: 567, isExclusive: false, discountCode: null, discountPercent: 44, expiresAt: null },
      { id: 'cp1-4', name: 'Kit Skincare Completo', price: 159.90, comparePrice: 279.90, image: null, category: 'Beleza', rating: 4.6, reviews: 1890, isExclusive: true, discountCode: 'CAROL15', discountPercent: 15, expiresAt: Date.now() + 86400000 * 5 },
      { id: 'cp1-5', name: 'Luminária LED Inteligente', price: 129.90, comparePrice: 219.90, image: null, category: 'Casa', rating: 4.5, reviews: 432, isExclusive: false, discountCode: null, discountPercent: 41, expiresAt: null },
      { id: 'cp1-6', name: 'Óculos de Sol Polarizado', price: 169.90, comparePrice: 329.90, image: null, category: 'Moda', rating: 4.8, reviews: 756, isExclusive: true, discountCode: 'CAROL10', discountPercent: 10, expiresAt: Date.now() + 86400000 * 1 },
      { id: 'cp1-7', name: 'Carregador Sem Fio 3 em 1', price: 99.90, comparePrice: 189.90, image: null, category: 'Eletrônicos', rating: 4.4, reviews: 1023, isExclusive: false, discountCode: null, discountPercent: 47, expiresAt: null },
      { id: 'cp1-8', name: 'Difusor de Aromas Premium', price: 79.90, comparePrice: 149.90, image: null, category: 'Casa', rating: 4.7, reviews: 654, isExclusive: true, discountCode: 'CAROL30', discountPercent: 30, expiresAt: Date.now() + 86400000 * 4 },
      { id: 'cp1-9', name: 'Paleta de Sombras Matte', price: 89.90, comparePrice: 159.90, image: null, category: 'Beleza', rating: 4.8, reviews: 2100, isExclusive: false, discountCode: null, discountPercent: 44, expiresAt: null },
    ],
    reels: [
      { id: 'r1-1', thumbnail: null, views: 1250000, likes: 89000, duration: '0:30', title: 'Unboxing do Fone Bluetooth' },
      { id: 'r1-2', thumbnail: null, views: 890000, likes: 67000, duration: '0:45', title: 'Minha Rotina Skincare' },
      { id: 'r1-3', thumbnail: null, views: 2100000, likes: 156000, duration: '0:28', title: 'HAUL do Mês' },
      { id: 'r1-4', thumbnail: null, views: 560000, likes: 34000, duration: '0:60', title: 'Setup Escritório' },
      { id: 'r1-5', thumbnail: null, views: 1780000, likes: 123000, duration: '0:35', title: 'Top 5 Tech Barato' },
    ],
  },
  {
    id: 'creator-2',
    name: 'Rafael Costa',
    handle: '@rafacosta',
    avatar: null,
    bio: 'Tech reviewer e gamer. Testo tudo pra você não precisar comprar errado. Promoções e cupons exclusivos todo dia! 🎮💻',
    bannerGradient: 'from-blue-500 via-cyan-400 to-teal-500',
    followers: 892300,
    following: 198,
    verified: true,
    socialLinks: {
      instagram: 'https://instagram.com/rafacosta',
      youtube: 'https://youtube.com/@rafacosta',
      tiktok: null,
    },
    engagementStats: {
      totalLikes: 3200000,
      totalShares: 198000,
      engagementRate: 7.2,
      avgViews: 210000,
    },
    products: [
      { id: 'cp2-1', name: 'Teclado Mecânico RGB', price: 259.90, comparePrice: 459.90, image: null, category: 'Eletrônicos', rating: 4.9, reviews: 1567, isExclusive: true, discountCode: 'RAFA30', discountPercent: 30, expiresAt: Date.now() + 86400000 * 1 },
      { id: 'cp2-2', name: 'Mouse Gamer Wireless', price: 179.90, comparePrice: 329.90, image: null, category: 'Eletrônicos', rating: 4.7, reviews: 2340, isExclusive: true, discountCode: 'RAFA25', discountPercent: 25, expiresAt: Date.now() + 86400000 * 3 },
      { id: 'cp2-3', name: 'Camiseta Streetwear Ed. Ltda', price: 119.90, comparePrice: 199.90, image: null, category: 'Moda', rating: 4.6, reviews: 890, isExclusive: false, discountCode: null, discountPercent: 40, expiresAt: null },
      { id: 'cp2-4', name: 'Headset Gaming 7.1', price: 219.90, comparePrice: 399.90, image: null, category: 'Eletrônicos', rating: 4.8, reviews: 1234, isExclusive: true, discountCode: 'RAFA15', discountPercent: 15, expiresAt: Date.now() + 86400000 * 2 },
      { id: 'cp2-5', name: 'Organizador de Cabos', price: 49.90, comparePrice: 89.90, image: null, category: 'Casa', rating: 4.5, reviews: 567, isExclusive: false, discountCode: null, discountPercent: 44, expiresAt: null },
      { id: 'cp2-6', name: 'Webcam HD 1080p', price: 189.90, comparePrice: 349.90, image: null, category: 'Eletrônicos', rating: 4.6, reviews: 876, isExclusive: true, discountCode: 'RAFA20', discountPercent: 20, expiresAt: Date.now() + 86400000 * 4 },
      { id: 'cp2-7', name: 'Cadeira Ergonômica Gamer', price: 899.90, comparePrice: 1599.90, image: null, category: 'Casa', rating: 4.4, reviews: 345, isExclusive: true, discountCode: 'RAFA40', discountPercent: 40, expiresAt: Date.now() + 86400000 * 6 },
      { id: 'cp2-8', name: 'Hidratante Facial FPS50', price: 69.90, comparePrice: 119.90, image: null, category: 'Beleza', rating: 4.7, reviews: 1890, isExclusive: false, discountCode: null, discountPercent: 42, expiresAt: null },
      { id: 'cp2-9', name: 'Monitor LED 27 Curvo', price: 1199.90, comparePrice: 1899.90, image: null, category: 'Eletrônicos', rating: 4.8, reviews: 567, isExclusive: true, discountCode: 'RAFA35', discountPercent: 35, expiresAt: Date.now() + 86400000 * 5 },
    ],
    reels: [
      { id: 'r2-1', thumbnail: null, views: 980000, likes: 72000, duration: '0:45', title: 'Review Teclado Mecânico' },
      { id: 'r2-2', thumbnail: null, views: 1560000, likes: 112000, duration: '0:55', title: 'Setup Gaming Completo' },
      { id: 'r2-3', thumbnail: null, views: 780000, likes: 56000, duration: '0:30', title: 'Cupons Exclusivos' },
      { id: 'r2-4', thumbnail: null, views: 2340000, likes: 189000, duration: '0:38', title: 'Unboxing Monitor Curvo' },
      { id: 'r2-5', thumbnail: null, views: 1120000, likes: 89000, duration: '0:42', title: 'Mouse Gamer vs Barato' },
    ],
  },
  {
    id: 'creator-3',
    name: 'Mariana Silva',
    handle: '@marisilva',
    avatar: null,
    bio: 'Beleza, moda e organização do lar. Tudo que você precisa pra vida ficar mais bonita e prática. Dicas honestas e cups exclusivos! ✨',
    bannerGradient: 'from-rose-400 via-fuchsia-500 to-violet-500',
    followers: 2100000,
    following: 456,
    verified: true,
    socialLinks: {
      instagram: 'https://instagram.com/marisilva',
      youtube: null,
      tiktok: 'https://tiktok.com/@marisilva',
    },
    engagementStats: {
      totalLikes: 8900000,
      totalShares: 567000,
      engagementRate: 9.3,
      avgViews: 480000,
    },
    products: [
      { id: 'cp3-1', name: 'Sérum Vitamina C 20%', price: 79.90, comparePrice: 149.90, image: null, category: 'Beleza', rating: 4.9, reviews: 3456, isExclusive: true, discountCode: 'MARISILVA20', discountPercent: 20, expiresAt: Date.now() + 86400000 * 2 },
      { id: 'cp3-2', name: 'Vestido Midi Floral', price: 159.90, comparePrice: 289.90, image: null, category: 'Moda', rating: 4.8, reviews: 1230, isExclusive: true, discountCode: 'MARISILVA15', discountPercent: 15, expiresAt: Date.now() + 86400000 * 4 },
      { id: 'cp3-3', name: 'Aspirador Robô Smart', price: 799.90, comparePrice: 1499.90, image: null, category: 'Casa', rating: 4.6, reviews: 789, isExclusive: true, discountCode: 'MARISILVA25', discountPercent: 25, expiresAt: Date.now() + 86400000 * 3 },
      { id: 'cp3-4', name: 'Paleta de Contorno', price: 69.90, comparePrice: 129.90, image: null, category: 'Beleza', rating: 4.7, reviews: 2100, isExclusive: false, discountCode: null, discountPercent: 46, expiresAt: null },
      { id: 'cp3-5', name: 'Conjunto Moletom Unissex', price: 199.90, comparePrice: 349.90, image: null, category: 'Moda', rating: 4.5, reviews: 876, isExclusive: false, discountCode: null, discountPercent: 43, expiresAt: null },
      { id: 'cp3-6', name: 'Kit Organizadores Acrílico', price: 89.90, comparePrice: 169.90, image: null, category: 'Casa', rating: 4.8, reviews: 1560, isExclusive: true, discountCode: 'MARISILVA10', discountPercent: 10, expiresAt: Date.now() + 86400000 * 6 },
      { id: 'cp3-7', name: 'Rímel Volume Extremo', price: 39.90, comparePrice: 69.90, image: null, category: 'Beleza', rating: 4.6, reviews: 2890, isExclusive: false, discountCode: null, discountPercent: 43, expiresAt: null },
      { id: 'cp3-8', name: 'Edredom Plumas Premium', price: 349.90, comparePrice: 599.90, image: null, category: 'Casa', rating: 4.9, reviews: 456, isExclusive: true, discountCode: 'MARISILVA30', discountPercent: 30, expiresAt: Date.now() + 86400000 * 5 },
      { id: 'cp3-9', name: 'Bolsa Crossbody Couro Sintético', price: 139.90, comparePrice: 249.90, image: null, category: 'Moda', rating: 4.7, reviews: 980, isExclusive: false, discountCode: null, discountPercent: 44, expiresAt: null },
    ],
    reels: [
      { id: 'r3-1', thumbnail: null, views: 3400000, likes: 245000, duration: '0:32', title: 'Rotina Skincare Noite' },
      { id: 'r3-2', thumbnail: null, views: 2100000, likes: 178000, duration: '0:48', title: 'Organização do Quarto' },
      { id: 'r3-3', thumbnail: null, views: 4500000, likes: 312000, duration: '0:25', title: 'Tudo por R$100' },
      { id: 'r3-4', thumbnail: null, views: 1890000, likes: 134000, duration: '0:40', title: 'Looks para o Inverno' },
      { id: 'r3-5', thumbnail: null, views: 2780000, likes: 201000, duration: '0:35', title: 'Favoritos do Mês' },
    ],
  },
]

const CATEGORY_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'Eletrônicos', label: 'Eletrônicos' },
  { id: 'Moda', label: 'Moda' },
  { id: 'Beleza', label: 'Beleza' },
  { id: 'Casa', label: 'Casa' },
] as const

const CREATOR_EMOJIS: Record<string, string> = {
  'creator-1': '👩‍💻',
  'creator-2': '👨‍💻',
  'creator-3': '👩‍🎨',
}

const PRODUCT_EMOJIS: Record<string, string> = {
  Eletrônicos: '📱',
  Moda: '👗',
  Beleza: '💄',
  Casa: '🏡',
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const formatCompactNumber = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return String(v)
}

function getTimeRemaining(expiresAt: number) {
  const diff = Math.max(0, expiresAt - Date.now())
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { h, m, s, expired: diff <= 0 }
}

/* ------------------------------------------------------------------ */
/*  Framer Motion Variants                                             */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 20 },
  },
}

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: { duration: 2, repeat: Infinity, ease: 'linear' as const, repeatDelay: 0.8 },
  },
}

const badgeShimmer = {
  initial: { x: '-200%' },
  animate: {
    x: '200%',
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1 },
  },
}

const pulseGlow = {
  animate: {
    scale: [1, 1.03, 1],
    opacity: [0.85, 1, 0.85],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const statCounterVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.2 + i * 0.15,
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  }),
}

const followerSpringConfig = { type: 'spring' as const, stiffness: 400, damping: 25 }

/* ------------------------------------------------------------------ */
/*  Animated Counter Sub-component                                      */
/* ------------------------------------------------------------------ */

function AnimatedStatCounter({
  value,
  label,
  icon,
  color,
  index,
}: {
  value: number
  label: string
  icon: React.ReactNode
  color: string
  index: number
}) {
  const [displayed, setDisplayed] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true
    const target = value
    const duration = 1500
    const startTime = Date.now()
    function tick() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return (
    <motion.div
      custom={index}
      variants={statCounterVariants}
      initial="hidden"
      animate="visible"
      ref={ref}
      className="r40-stat-card flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
    >
      <div
        className="r40-stat-icon flex items-center justify-center h-10 w-10 rounded-full"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <motion.span
        className="r40-stat-value text-xl sm:text-2xl font-bold text-white"
        key={displayed}
      >
        {formatCompactNumber(displayed)}
      </motion.span>
      <span className="r40-stat-label text-xs text-white/60 font-medium">{label}</span>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Countdown Timer Sub-component                                      */
/* ------------------------------------------------------------------ */

function DealCountdown({ expiresAt }: { expiresAt: number }) {
  const [time, setTime] = useState(() => getTimeRemaining(expiresAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(expiresAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (time.expired) {
    return (
      <div className="r40-countdown-expired flex items-center gap-1 text-xs text-red-400 font-semibold">
        <Clock className="h-3 w-3" />
        Oferta expirada
      </div>
    )
  }

  return (
    <div className="r40-countdown flex items-center gap-1.5">
      <Clock className="h-3 w-3 text-amber-400" />
      {[
        { val: time.h, label: 'h' },
        { val: time.m, label: 'm' },
        { val: time.s, label: 's' },
      ].map((unit, i) => (
        <span key={unit.label} className="flex items-center">
          <span className="r40-countdown-num inline-flex items-center justify-center h-6 w-7 rounded-md bg-black/30 text-white text-xs font-bold tabular-nums">
            {String(unit.val).padStart(2, '0')}
          </span>
          {i < 2 && <span className="text-white/40 text-xs mx-0.5">:</span>}
        </span>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Share Creator Sub-component                                       */
/* ------------------------------------------------------------------ */

function ShareCreatorSection({ creator }: { creator: CreatorData }) {
  const [copied, setCopied] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)
  const shareUrl = `https://domplace.com.br/creator/${creator.handle}`

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }, [shareUrl])

  const handleWhatsAppShare = useCallback(() => {
    const text = `Confira a loja do ${creator.name} no DomPlace! 🛍️ ${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }, [creator.name, shareUrl])

  const embedCode = `<iframe src="${shareUrl}/embed" width="600" height="800" frameborder="0" title="Loja do ${creator.name}"></iframe>`

  const handleCopyEmbed = useCallback(() => {
    navigator.clipboard.writeText(embedCode)
  }, [embedCode])

  return (
    <motion.div variants={itemVariants} className="r40-share-section mt-6">
      <h3 className="r40-share-title text-base font-bold text-foreground mb-3 flex items-center gap-2">
        <Share2 className="h-4 w-4 text-primary" />
        Compartilhar Creator
      </h3>
      <div className="r40-share-buttons flex flex-wrap gap-2">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="r40-share-btn gap-2 text-xs rounded-lg"
            onClick={handleCopyLink}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copiado!' : 'Copiar Link'}
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="r40-share-btn gap-2 text-xs rounded-lg"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
            WhatsApp
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="r40-share-btn gap-2 text-xs rounded-lg"
            onClick={() => setShowEmbed((prev) => !prev)}
          >
            <Code2 className="h-3.5 w-3.5" />
            Embed
          </Button>
        </motion.div>
      </div>
      <AnimatePresence>
        {showEmbed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="r40-embed-section overflow-hidden"
          >
            <div className="r40-embed-box mt-3 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="r40-embed-label text-xs font-semibold text-muted-foreground mb-2">Código Embed</p>
              <pre className="r40-embed-code text-xs text-foreground/80 bg-background p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
                {embedCode}
              </pre>
              <motion.div whileTap={{ scale: 0.95 }} className="mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="r40-embed-copy text-xs gap-1 rounded-md"
                  onClick={handleCopyEmbed}
                >
                  <Copy className="h-3 w-3" />
                  Copiar Código
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Product Card Sub-component                                        */
/* ------------------------------------------------------------------ */

function ProductCard({
  product,
  creatorName,
  index,
}: {
  product: CreatorProduct
  creatorName: string
  index: number
}) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0
  const emoji = PRODUCT_EMOJIS[product.category] || '📦'

  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      initial="hidden"
      animate="visible"
    >
      <Card className="r40-product-card group overflow-hidden rounded-xl border border-border/60 hover:border-primary/30 transition-colors">
        <div className="r40-product-img-wrap relative h-44 bg-gradient-to-br from-muted/60 to-muted overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">
            {emoji}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="r40-product-cat-badge text-[10px] px-1.5 py-0 bg-white/90 dark:bg-black/60 backdrop-blur-sm font-medium">
              {product.category}
            </Badge>
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <motion.div
              initial={{ scale: 0, x: 20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.1 + index * 0.05 }}
              className="absolute top-2 right-2"
            >
              <Badge className="r40-discount-badge text-[10px] px-1.5 py-0 bg-red-500 text-white border-0 font-bold">
                -{discount}%
              </Badge>
            </motion.div>
          )}

          {/* Rating */}
          <div className="absolute bottom-2 left-2">
            <div className="r40-rating-badge flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              {product.rating}
            </div>
          </div>

          {/* "Recomendado por" Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.2 + index * 0.05 }}
            className="absolute bottom-2 right-2"
          >
            <div className="r40-rec-badge flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/90 backdrop-blur-sm text-white text-[9px] font-bold">
              <Sparkles className="h-2.5 w-2.5" />
              Rec. por {creatorName.split(' ')[0]}
            </div>
          </motion.div>
        </div>

        <CardContent className="r40-product-info p-3 space-y-2">
          <h4 className="r40-product-name text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h4>

          {/* Exclusive Deal Section */}
          {product.isExclusive && product.discountCode && product.expiresAt && (
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="r40-exclusive-deal space-y-1.5"
            >
              <div className="r40-deal-header flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                <Flame className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Oferta Exclusiva</span>
              </div>
              <div className="r40-coupon-code flex items-center justify-between px-2 py-1 rounded-md bg-primary/5 border border-primary/20 border-dashed">
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-primary" />
                  <span className="r40-code-text text-xs font-bold text-primary tracking-wider">
                    {product.discountCode}
                  </span>
                </div>
                <Badge variant="outline" className="r40-code-badge text-[9px] px-1 py-0 font-bold text-primary border-primary/30">
                  -{product.discountPercent}%
                </Badge>
              </div>
              <DealCountdown expiresAt={product.expiresAt} />
            </motion.div>
          )}

          {/* Price */}
          <div className="r40-prices flex items-baseline gap-2">
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="r40-compare-price text-xs text-muted-foreground line-through">
                {formatBRL(product.comparePrice)}
              </span>
            )}
            <span className="r40-sale-price text-base font-extrabold text-primary">
              {formatBRL(product.price)}
            </span>
          </div>

          {/* Reviews */}
          <div className="r40-reviews-count flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            {product.reviews.toLocaleString('pt-BR')} avaliações
          </div>

          {/* Add to Cart */}
          <motion.div whileTap={{ scale: 0.95 }} className="w-full">
            <Button className="r40-add-cart-btn w-full h-8 min-h-[44px] text-xs font-semibold rounded-lg gap-1.5">
              <ShoppingCart className="h-3 w-3" />
              Adicionar
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Video Reel Card Sub-component                                      */
/* ------------------------------------------------------------------ */

function ReelCard({ reel, index }: { reel: VideoReel; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 22, delay: index * 0.1 }}
      className="r40-reel-card shrink-0 w-36 sm:w-40 cursor-pointer group"
    >
      <div className="r40-reel-thumb relative h-56 sm:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-400/20 border border-border/50">
        {/* Fake gradient thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="r40-reel-play-btn h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
            whileHover={{ scale: 1.15, backgroundColor: 'rgba(255,255,255,0.35)' }}
            whileTap={{ scale: 0.9 }}
          >
            <Play className="h-5 w-5 text-white fill-white ml-0.5" />
          </motion.div>
        </div>

        {/* Duration */}
        <div className="absolute top-2 right-2">
          <span className="r40-reel-duration inline-flex items-center px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium tabular-nums">
            {reel.duration}
          </span>
        </div>

        {/* View count */}
        <div className="absolute bottom-2 left-2 right-2">
          <p className="r40-reel-title text-xs font-semibold text-white line-clamp-2 mb-1.5 drop-shadow-sm">
            {reel.title}
          </p>
          <div className="r40-reel-stats flex items-center gap-2.5">
            <span className="flex items-center gap-0.5 text-[10px] text-white/80">
              <Eye className="h-2.5 w-2.5" />
              {formatCompactNumber(reel.views)}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-white/80">
              <Heart className="h-2.5 w-2.5 fill-red-400 text-red-400" />
              {formatCompactNumber(reel.likes)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

export function InfluencerShopPage() {
  const [activeCreator, setActiveCreator] = useState<CreatorData>(CREATORS[0])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(CREATORS[0].followers)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const reelsContainerRef = useRef<HTMLDivElement>(null)

  // Sync creator data (adjust state during render pattern)
  const [prevCreatorId, setPrevCreatorId] = useState(activeCreator.id)
  if (prevCreatorId !== activeCreator.id) {
    setPrevCreatorId(activeCreator.id)
    const creator = CREATORS.find((c) => c.id === activeCreator.id)
    if (creator) {
      setFollowerCount(creator.followers)
      setIsFollowing(false)
    }
  }

  // Filter products by category
  const filteredProducts = activeCategory === 'all'
    ? activeCreator.products
    : activeCreator.products.filter((p) => p.category === activeCategory)

  // Exclusive deals
  const exclusiveDeals = activeCreator.products.filter(
    (p) => p.isExclusive && p.discountCode && p.expiresAt
  )

  const handleFollow = useCallback(() => {
    setIsFollowing((prev) => {
      const next = !prev
      setFollowerCount((count) => (next ? count + 1 : count - 1))
      return next
    })
  }, [])

  const handlePrevCreator = useCallback(() => {
    const idx = CREATORS.findIndex((c) => c.id === activeCreator.id)
    setActiveCreator(CREATORS[(idx - 1 + CREATORS.length) % CREATORS.length])
    setActiveCategory('all')
  }, [activeCreator.id])

  const handleNextCreator = useCallback(() => {
    const idx = CREATORS.findIndex((c) => c.id === activeCreator.id)
    setActiveCreator(CREATORS[(idx + 1) % CREATORS.length])
    setActiveCategory('all')
  }, [activeCreator.id])

  const scrollReelsLeft = useCallback(() => {
    if (reelsContainerRef.current) {
      reelsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }, [])

  const scrollReelsRight = useCallback(() => {
    if (reelsContainerRef.current) {
      reelsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }, [])

  if (!mounted) return null

  const currentCreator = activeCreator
  const emoji = CREATOR_EMOJIS[currentCreator.id] || '👤'
  const bannerColors = {
    'from-purple-500 via-pink-500 to-rose-400': ['rgba(168,85,247,0.15)', 'rgba(236,72,153,0.15)', 'rgba(251,113,133,0.15)'],
    'from-blue-500 via-cyan-400 to-teal-500': ['rgba(59,130,246,0.15)', 'rgba(34,211,238,0.15)', 'rgba(20,184,166,0.15)'],
    'from-rose-400 via-fuchsia-500 to-violet-500': ['rgba(251,113,133,0.15)', 'rgba(217,70,239,0.15)', 'rgba(139,92,246,0.15)'],
  }
  const colors = bannerColors[currentCreator.bannerGradient as keyof typeof bannerColors] || ['rgba(168,85,247,0.15)', 'rgba(236,72,153,0.15)', 'rgba(251,113,133,0.15)']

  return (
    <section className="r40-influencer-shop w-full space-y-8">
      {/* ============================================================ */}
      {/*  SECTION TITLE                                               */}
      {/* ============================================================ */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="r40-section-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="r40-section-icon h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="r40-section-title text-lg sm:text-xl font-bold text-foreground">Loja do Creator</h2>
            <p className="r40-section-subtitle text-xs text-muted-foreground">Produtos selecionados pelos seus influencers favoritos</p>
          </div>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/*  CREATOR PROFILE HEADER                                       */}
      {/* ============================================================ */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="r40-creator-header relative overflow-hidden rounded-2xl"
      >
        {/* Banner */}
        <div className={`r40-creator-banner relative h-40 sm:h-52 md:h-60 bg-gradient-to-r ${currentCreator.bannerGradient}`}>
          {/* Decorative shapes */}
          <motion.div
            className="r40-banner-shape-1 absolute top-4 right-12 h-24 w-24 rounded-full opacity-20"
            style={{ backgroundColor: colors[2] }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
          />
          <motion.div
            className="r40-banner-shape-2 absolute bottom-8 left-20 h-16 w-16 rounded-full opacity-20"
            style={{ backgroundColor: colors[0] }}
            animate={{ scale: [1, 1.3, 1], y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
          />
          <motion.div
            className="r40-banner-shape-3 absolute top-1/2 right-1/3 h-32 w-32 rounded-full opacity-10"
            style={{ backgroundColor: colors[1] }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' as const }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Creator Info Overlay */}
        <div className="r40-creator-info relative z-10 px-4 sm:px-6 pb-4 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.15 }}
              className="r40-avatar-wrap"
            >
              <Avatar className="r40-creator-avatar h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                <AvatarFallback className="text-3xl sm:text-4xl bg-gradient-to-br from-primary/20 to-primary/10">
                  {emoji}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Name, Bio, Stats */}
            <div className="r40-creator-details flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="r40-creator-name text-xl sm:text-2xl font-bold text-foreground flex items-center gap-1.5">
                  {currentCreator.name}
                  {currentCreator.verified && (
                    <motion.div variants={scaleIn} initial="hidden" animate="visible">
                      <BadgeCheck className="h-5 w-5 text-blue-500 fill-blue-500" />
                    </motion.div>
                  )}
                </h3>
                <span className="r40-creator-handle text-sm text-muted-foreground">@{currentCreator.handle.replace('@', '')}</span>
              </div>
              <p className="r40-creator-bio text-sm text-muted-foreground mt-1 line-clamp-2 max-w-xl">
                {currentCreator.bio}
              </p>

              {/* Follower count & Social Icons */}
              <div className="r40-creator-meta flex items-center gap-4 mt-3 flex-wrap">
                <motion.span
                  className="r40-follower-count text-sm font-semibold text-foreground"
                  key={followerCount}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={followerSpringConfig}
                >
                  {formatCompactNumber(followerCount)} seguidores
                </motion.span>
                <span className="text-xs text-muted-foreground">
                  {currentCreator.following} seguindo
                </span>

                {/* Social Icons */}
                <div className="flex items-center gap-2 ml-auto">
                  {currentCreator.socialLinks.instagram && (
                    <motion.a
                      href={currentCreator.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="r40-social-icon h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md"
                      whileHover={{ scale: 1.15, boxShadow: '0 4px 15px rgba(236,72,153,0.4)' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Instagram className="h-3.5 w-3.5" />
                    </motion.a>
                  )}
                  {currentCreator.socialLinks.youtube && (
                    <motion.a
                      href={currentCreator.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="r40-social-icon h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md"
                      whileHover={{ scale: 1.15, boxShadow: '0 4px 15px rgba(220,38,38,0.4)' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Youtube className="h-3.5 w-3.5" />
                    </motion.a>
                  )}
                  {currentCreator.socialLinks.tiktok && (
                    <motion.a
                      href={currentCreator.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="r40-social-icon h-8 w-8 rounded-full bg-black dark:bg-white dark:text-black flex items-center justify-center text-white shadow-md"
                      whileHover={{ scale: 1.15, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.15V11.7a4.83 4.83 0 01-0-5.01z" />
                      </svg>
                    </motion.a>
                  )}
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <motion.div variants={pulseGlow} animate="animate">
              <motion.div whileTap={{ scale: 0.92 }}>
                <Button
                  className={`r40-follow-btn h-11 px-6 rounded-xl text-sm font-bold shadow-lg transition-all ${
                    isFollowing
                      ? 'bg-secondary text-secondary-foreground border border-border'
                      : 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-rose-600'
                  }`}
                  onClick={handleFollow}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isFollowing ? 'following' : 'follow'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      {isFollowing ? (
                        <>
                          <Check className="h-4 w-4" />
                          Seguindo
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4" />
                          Seguir
                        </>
                      )}
                    </motion.span>
                  </AnimatePresence>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Creator Navigation Dots */}
        <div className="r40-creator-nav-dots flex items-center justify-center gap-2 pb-3">
          {CREATORS.map((c) => (
            <motion.button
              key={c.id}
              onClick={() => {
                setActiveCreator(c)
                setActiveCategory('all')
              }}
              className="relative h-2 w-2 rounded-full"
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.85 }}
            >
              {c.id === currentCreator.id ? (
                <motion.span
                  layoutId="r40-creator-dot"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={followerSpringConfig}
                />
              ) : (
                <span className="absolute inset-0 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/*  ENGAGEMENT STATS                                             */}
      {/* ============================================================ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="r40-engagement-section"
      >
        <div className="r40-engagement-header flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="r40-engagement-title text-base font-bold text-foreground">Engajamento</h3>
        </div>
        <div className="r40-engagement-grid grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AnimatedStatCounter
            value={currentCreator.engagementStats.totalLikes}
            label="Curtidas"
            icon={<Heart className="h-4 w-4 text-rose-400" />}
            color="rgba(251,113,133,0.15)"
            index={0}
          />
          <AnimatedStatCounter
            value={currentCreator.engagementStats.totalShares}
            label="Compartilhamentos"
            icon={<Share2 className="h-4 w-4 text-blue-400" />}
            color="rgba(96,165,250,0.15)"
            index={1}
          />
          <AnimatedStatCounter
            value={currentCreator.engagementStats.engagementRate}
            label="Taxa de Engajamento"
            icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
            color="rgba(52,211,153,0.15)"
            index={2}
          />
          <AnimatedStatCounter
            value={currentCreator.engagementStats.avgViews}
            label="Views Médios"
            icon={<Eye className="h-4 w-4 text-purple-400" />}
            color="rgba(168,85,247,0.15)"
            index={3}
          />
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/*  VIDEO REELS SECTION                                          */}
      {/* ============================================================ */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="r40-reels-section"
      >
        <div className="r40-reels-header flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-primary fill-primary" />
            <h3 className="r40-reels-title text-base font-bold text-foreground">Reels</h3>
            <Badge variant="secondary" className="r40-reels-count text-[10px] px-1.5 py-0 font-medium">
              {currentCreator.reels.length} vídeos
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              onClick={scrollReelsLeft}
              className="r40-reels-nav h-7 w-7 rounded-full bg-muted flex items-center justify-center"
              whileHover={{ backgroundColor: 'rgba(200,200,200,0.5)' }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={scrollReelsRight}
              className="r40-reels-nav h-7 w-7 rounded-full bg-muted flex items-center justify-center"
              whileHover={{ backgroundColor: 'rgba(200,200,200,0.5)' }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Horizontal Reels Carousel */}
        <div className="relative">
          {/* Fade edges */}
          <div className="r40-reels-fade-left pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="r40-reels-fade-right pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

          <div
            ref={reelsContainerRef}
            className="r40-reels-carousel flex gap-3 overflow-x-auto hide-scrollbar pb-2 scroll-smooth"
          >
            {currentCreator.reels.map((reel, i) => (
              <ReelCard key={reel.id} reel={reel} index={i} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/*  EXCLUSIVE DEALS SECTION                                      */}
      {/* ============================================================ */}
      {exclusiveDeals.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="r40-exclusive-section"
        >
          <div className="r40-exclusive-header flex items-center gap-2 mb-3">
            <div className="relative overflow-hidden h-6 px-3 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white relative z-10">Ofertas Exclusivas</span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
              />
            </div>
            <Badge variant="outline" className="r40-deals-count text-[10px] px-1.5 py-0 font-medium border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400">
              {exclusiveDeals.length} ofertas
            </Badge>
          </div>

          <div className="r40-exclusive-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {exclusiveDeals.map((deal, i) => {
              const discount = deal.comparePrice
                ? Math.round(((deal.comparePrice - deal.price) / deal.comparePrice) * 100)
                : 0
              const emoji = PRODUCT_EMOJIS[deal.category] || '📦'

              return (
                <motion.div
                  key={deal.id}
                  variants={itemVariants}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="r40-deal-card overflow-hidden rounded-xl border-amber-300/40 dark:border-amber-700/30 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-900/10 dark:to-orange-900/10">
                    <CardContent className="r40-deal-content p-3 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="r40-deal-thumb h-14 w-14 shrink-0 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center text-2xl">
                          {emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="r40-deal-name text-sm font-semibold text-foreground line-clamp-1">
                            {deal.name}
                          </h4>
                          <div className="r40-deal-prices flex items-baseline gap-2 mt-0.5">
                            {deal.comparePrice && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatBRL(deal.comparePrice)}
                              </span>
                            )}
                            <span className="text-sm font-bold text-primary">{formatBRL(deal.price)}</span>
                            {discount > 0 && (
                              <Badge className="text-[9px] bg-red-500 text-white border-0 px-1 py-0 font-bold">
                                -{discount}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Coupon Code */}
                      <div className="r40-deal-coupon flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-black/30 border border-dashed border-amber-300 dark:border-amber-700">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-amber-500" />
                          <span className="r40-coupon-text text-xs font-bold text-amber-700 dark:text-amber-400 tracking-widest uppercase">
                            {deal.discountCode}
                          </span>
                        </div>
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button variant="ghost" size="sm" className="r40-copy-coupon h-6 min-h-[44px] min-w-[44px] px-2 text-[10px] font-semibold gap-1 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-md active:scale-95 transition-transform">
                            <Copy className="h-3 w-3" />
                            Copiar
                          </Button>
                        </motion.div>
                      </div>

                      {/* Timer */}
                      {deal.expiresAt && <DealCountdown expiresAt={deal.expiresAt} />}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ============================================================ */}
      {/*  CATEGORY TABS                                                */}
      {/* ============================================================ */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="r40-category-tabs"
      >
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar pb-1">
          {CATEGORY_TABS.map((tab) => (
            <motion.div key={tab.id} whileTap={{ scale: 0.92 }}>
              <Button
                variant={activeCategory === tab.id ? 'default' : 'ghost'}
                size="sm"
                className={`r40-tab-btn text-xs font-medium rounded-lg whitespace-nowrap ${
                  activeCategory === tab.id
                    ? 'shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveCategory(tab.id)}
              >
                {tab.label}
                {activeCategory === tab.id && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                    className="ml-1 text-[10px]"
                  >
                    ({filteredProducts.length})
                  </motion.span>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/*  PRODUCT GRID                                                 */}
      {/* ============================================================ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="r40-product-section"
      >
        <div className="r40-product-header flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="r40-products-title text-base font-bold text-foreground">Recomendados</h3>
            <Badge variant="outline" className="r40-products-count text-[10px] px-1.5 py-0 font-medium">
              {filteredProducts.length} produtos
            </Badge>
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="sm" className="r40-view-all text-xs gap-1 text-primary">
              Ver Todos
              <ArrowRight className="h-3 w-3" />
            </Button>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="r40-product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {filteredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                creatorName={currentCreator.name}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="r40-empty-state flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="r40-empty-icon h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <ShoppingCart className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="r40-empty-text text-sm font-medium text-muted-foreground">
              Nenhum produto encontrado nesta categoria
            </p>
            <motion.div whileTap={{ scale: 0.95 }} className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="r40-clear-filter text-xs rounded-lg"
                onClick={() => setActiveCategory('all')}
              >
                Ver todos os produtos
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* ============================================================ */}
      {/*  CREATOR NAVIGATION (Prev / Next)                             */}
      {/* ============================================================ */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="r40-creator-nav flex items-center justify-between"
      >
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="r40-prev-creator text-xs gap-1.5 rounded-lg"
            onClick={handlePrevCreator}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Creator anterior
          </Button>
        </motion.div>
        <span className="r40-creator-indicator text-xs text-muted-foreground font-medium">
          {CREATORS.findIndex((c) => c.id === currentCreator.id) + 1} / {CREATORS.length}
        </span>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="r40-next-creator text-xs gap-1.5 rounded-lg"
            onClick={handleNextCreator}
          >
            Próximo creator
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </motion.div>

      {/* ============================================================ */}
      {/*  SHARE CREATOR SECTION                                        */}
      {/* ============================================================ */}
      <ShareCreatorSection creator={currentCreator} />

      {/* ============================================================ */}
      {/*  ALL CREATORS MINI CARDS                                       */}
      {/* ============================================================ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="r40-all-creators"
      >
        <div className="r40-creators-header flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="r40-creators-title text-base font-bold text-foreground">Todos os Creators</h3>
        </div>
        <div className="r40-creators-list flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {CREATORS.map((c, i) => (
            <motion.button
              key={c.id}
              variants={itemVariants}
              custom={i}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setActiveCreator(c)
                setActiveCategory('all')
              }}
              className={`r40-creator-mini-card shrink-0 w-40 rounded-xl overflow-hidden border transition-colors text-left ${
                c.id === currentCreator.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/30 bg-card'
              }`}
            >
              {/* Mini Banner */}
              <div className={`r40-mini-banner h-16 bg-gradient-to-r ${c.bannerGradient} relative`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                {c.verified && (
                  <BadgeCheck className="absolute top-1.5 right-1.5 h-4 w-4 text-white drop-shadow-sm" />
                )}
              </div>
              <div className="r40-mini-info p-2.5 flex flex-col items-center text-center">
                <Avatar className="r40-mini-avatar h-10 w-10 border-2 border-background -mt-6 mb-1 shadow-sm">
                  <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/10">
                    {CREATOR_EMOJIS[c.id] || '👤'}
                  </AvatarFallback>
                </Avatar>
                <p className="r40-mini-name text-xs font-semibold text-foreground line-clamp-1">{c.name}</p>
                <p className="r40-mini-followers text-[10px] text-muted-foreground">
                  {formatCompactNumber(c.followers)} seguidores
                </p>
                <div className="r40-mini-engagement mt-1 flex items-center gap-0.5">
                  <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    {c.engagementStats.engagementRate}%
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
