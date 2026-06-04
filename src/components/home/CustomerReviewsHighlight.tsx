'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageCircle, ChevronLeft, ChevronRight, Quote, ShieldCheck, ArrowRight, Heart, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cachedFetch } from '@/lib/api-cache'
import { useAppStore } from '@/store/useAppStore'

/* ────────────────────────── Types ────────────────────────── */

interface FeaturedReview {
  id: string
  name: string
  initial: string
  date: string
  rating: number
  text: string
  storeName: string
  verified: boolean
  likes: number
}

/* ────────────────────────── Mock Reviews ────────────────────────── */

const MOCK_REVIEWS: FeaturedReview[] = [
  {
    id: 'fr-1',
    name: 'Maria Silva',
    initial: 'M',
    date: '15 de Jan, 2025',
    rating: 5,
    text: 'Melhor açaí da cidade! Sempre fresquinho e com muitas frutas. A entrega chega super rápido e sempre quentinho. Recomendo demais!',
    storeName: 'Açaí da Boa',
    verified: true,
    likes: 24,
  },
  {
    id: 'fr-2',
    name: 'João Santos',
    initial: 'J',
    date: '12 de Jan, 2025',
    rating: 5,
    text: 'Pão sempre quentinho saindo do forno. Os doces são maravilhosos, especialmente o bolo de cenoura com cobertura de chocolate. Top demais!',
    storeName: 'Padaria Pão Quente',
    verified: true,
    likes: 18,
  },
  {
    id: 'fr-3',
    name: 'Ana Costa',
    initial: 'A',
    date: '10 de Jan, 2025',
    rating: 4.5,
    text: 'Boa variedade de produtos e preços justos. Entrega sempre no horário combinado. Faz compras do mês todo sem sair de casa.',
    storeName: 'Mercado do Zé',
    verified: true,
    likes: 31,
  },
  {
    id: 'fr-4',
    name: 'Carlos Oliveira',
    initial: 'C',
    date: '8 de Jan, 2025',
    rating: 5,
    text: 'Atendimento impecável e resultado maravilhoso no corte de cabelo. Melhor salão de Dom Eliseu sem dúvida alguma! Equipe super atenciosa.',
    storeName: 'Salão da Bella',
    verified: true,
    likes: 22,
  },
  {
    id: 'fr-5',
    name: 'Fernanda Lima',
    initial: 'F',
    date: '5 de Jan, 2025',
    rating: 4.5,
    text: 'Meu dog amou o banho e tosa! Equipe muito carinhosa e profissional. Voltarei sempre. O atendimento online é super prático.',
    storeName: 'Pet Shop Amigo Fiel',
    verified: true,
    likes: 15,
  },
  {
    id: 'fr-6',
    name: 'Ricardo Mendes',
    initial: 'R',
    date: '3 de Jan, 2025',
    rating: 4.5,
    text: 'Entrega rápida e produtos com ótimo preço. Achei tudo que precisava sem sair de casa. O app é muito fácil de usar.',
    storeName: 'Farmácia Vida',
    verified: false,
    likes: 12,
  },
  {
    id: 'fr-7',
    name: 'Patrícia Souza',
    initial: 'P',
    date: '1 de Jan, 2025',
    rating: 5,
    text: 'Comprei ração e brinquedos pro meu gato. Chegou no mesmo dia! Preços muito melhores que o petshop físico. Super indico!',
    storeName: 'Pet Shop Amigo Fiel',
    verified: true,
    likes: 19,
  },
  {
    id: 'fr-8',
    name: 'Lucas Ferreira',
    initial: 'L',
    date: '28 de Dez, 2024',
    rating: 4,
    text: 'A pizza de calabresa é sensacional! Massa crocante e ingredientes frescos. O tempo de entrega surpreendeu, chegou em menos de 30 minutos.',
    storeName: 'Padaria Pão Quente',
    verified: true,
    likes: 27,
  },
  {
    id: 'fr-9',
    name: 'Juliana Rocha',
    initial: 'J',
    date: '25 de Dez, 2024',
    rating: 5,
    text: 'Fiz toda a compra de natal pelo app. Arroz, feijão, pernil, farofa... Tudo entregou certinho e no prazo. Virei cliente fiel!',
    storeName: 'Mercado do Zé',
    verified: true,
    likes: 35,
  },
  {
    id: 'fr-10',
    name: 'Bruno Almeida',
    initial: 'B',
    date: '22 de Dez, 2024',
    rating: 4.5,
    text: 'O protetor solar chegou rápido e com preço bom. Farmácia com bom atendimento e entrega confiável. Achei remédios que não tinha em outro lugar.',
    storeName: 'Farmácia Vida',
    verified: true,
    likes: 14,
  },
]

/* ────────────────────────── Avatar gradients ────────────────────────── */

const avatarGradients = [
  'from-pink-500 to-rose-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-cyan-500 to-sky-500',
  'from-lime-500 to-green-500',
  'from-red-500 to-pink-600',
  'from-indigo-500 to-blue-500',
  'from-teal-500 to-cyan-500',
  'from-yellow-500 to-amber-500',
]

/* ────────────────────────── Background orb colors ────────────────────────── */

const orbColors = [
  { color: 'bg-amber-300/30', x: '15%', y: '10%', size: 'h-32 w-32' },
  { color: 'bg-emerald-300/25', x: '80%', y: '20%', size: 'h-40 w-40' },
  { color: 'bg-violet-300/20', x: '10%', y: '70%', size: 'h-28 w-28' },
  { color: 'bg-sky-300/25', x: '75%', y: '75%', size: 'h-36 w-36' },
]

/* ────────────────────────── Animation variants ────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const featuredCardVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 28,
    },
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 28,
    },
  }),
}

const previewVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 320,
      damping: 22,
    },
  },
}

const orbFloatVariants = {
  float: (i: number) => ({
    y: [0, -12, 0, 12, 0],
    x: [0, 8, 0, -8, 0],
    transition: {
      duration: 8 + i * 1.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  }),
}

/* ────────────────────────── SVG Star component ────────────────────────── */

function AnimatedStar({ filled, index }: { filled: boolean; index: number }) {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring' as const,
        stiffness: 500,
        damping: 18,
        delay: 0.3 + index * 0.08,
      }}
      className="shrink-0"
    >
      <defs>
        <linearGradient id={`star-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? `url(#star-grad-${index})` : 'none'}
        stroke={filled ? '#f59e0b' : '#d4d4d8'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Animated fill overlay */}
      {filled && (
        <motion.path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#star-grad-full)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
          style={{ filter: 'brightness(1.1)' }}
        />
      )}
    </motion.svg>
  )
}

/* ────────────────────────── Star Rating ────────────────────────── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <AnimatedStar
          key={star}
          filled={star <= Math.round(rating)}
          index={star}
        />
      ))}
    </div>
  )
}

/* ────────────────────────── Gradient Orb ────────────────────────── */

function GradientOrb({ config, index }: { config: { color: string; x: string; y: string; size: string }; index: number }) {
  return (
    <motion.div
      custom={index}
      variants={orbFloatVariants}
      initial="float"
      animate="float"
      className={`absolute rounded-full blur-3xl ${config.color} ${config.size} pointer-events-none`}
      style={{ left: config.x, top: config.y }}
    />
  )
}

/* ────────────────────────── Featured Review Card ────────────────────────── */

function FeaturedReviewCard({ review, direction }: { review: FeaturedReview; direction: number }) {
  const gradient = avatarGradients[parseInt(review.id.replace('fr-', '')) % avatarGradients.length]

  return (
    <motion.div
      custom={direction}
      variants={featuredCardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full"
    >
      <div className="relative rounded-2xl border border-border/50 bg-card p-5 sm:p-6 overflow-hidden r32-card-hover">
        {/* Quote marks decorative */}
        <Quote className="absolute top-4 right-4 h-16 w-16 text-primary/[0.04] rotate-12 pointer-events-none" />

        {/* Shimmer effect on review text */}
        <style dangerouslySetInnerHTML={{
          __html: `
@keyframes review-text-shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}
.review-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 55%, transparent 60%);
  animation: review-text-shimmer 4s ease-in-out infinite;
  pointer-events: none;
  border-radius: inherit;
}`,
        }} />

        {/* Header: avatar + name + store + verified */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-bold shadow-md r32-avatar-ring`}>
              {review.initial}
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
              className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center"
            >
              <ShieldCheck className="h-2.5 w-2.5 text-white" />
            </motion.div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{review.name}</span>
              {review.verified && (
                <Badge className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-1.5 py-0 h-4 gap-0.5">
                  <ShieldCheck className="h-2 w-2" />
                  Compra verificada
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium">
                {review.storeName}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{review.date}</span>
            </div>
          </div>
        </div>

        {/* Star rating */}
        <div className="mb-3 r32-star-glow">
          <StarRating rating={review.rating} />
        </div>

        {/* Review text with shimmer */}
        <div className="relative review-shimmer rounded-lg">
          <p className="text-sm text-foreground/80 leading-relaxed">
            &ldquo;{review.text}&rdquo;
          </p>
        </div>

        {/* Likes */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/30">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1 text-muted-foreground hover:text-rose-500 transition-colors"
          >
            <Heart className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium">{review.likes}</span>
          </motion.button>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            <span className="text-[10px]">Responder</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground ml-auto">
            <ThumbsUp className="h-3 w-3" />
            <span className="text-[10px]">Útil</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ────────────────────────── Preview Card ────────────────────────── */

function PreviewCard({ review, index, onClick }: { review: FeaturedReview; index: number; onClick: () => void }) {
  const gradient = avatarGradients[parseInt(review.id.replace('fr-', '')) % avatarGradients.length]

  return (
    <motion.div
      variants={previewVariants}
      whileHover={{ y: -2 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <div className="p-3 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/20 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
            {review.initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold truncate">{review.name}</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-2.5 w-2.5 ${
                    star <= Math.round(review.rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-muted-foreground/25'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
          &ldquo;{review.text}&rdquo;
        </p>
        <Badge variant="secondary" className="text-[8px] mt-2 px-1.5 py-0 h-4">
          {review.storeName}
        </Badge>
      </div>
    </motion.div>
  )
}

/* ────────────────────────── Main Component ────────────────────────── */

export function CustomerReviewsHighlight() {
  const { navigate } = useAppStore()
  const [reviews, setReviews] = useState<FeaturedReview[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Auto-rotate
  useEffect(() => {
    let cancelled = false
    const loadReviews = async () => {
      try {
        const data = await cachedFetch('/api/reviews?limit=10&featured=true')
        const apiReviews = data?.reviews || []
        if (apiReviews.length > 0 && !cancelled) {
          setReviews(
            apiReviews.map((r: Record<string, unknown>, i: number) => ({
              id: (r.id as string) || `fr-${i + 1}`,
              name: (r.userName as string) || 'Cliente',
              initial: ((r.userName as string) || 'C')[0].toUpperCase(),
              date: (r.date as string) || 'Hoje',
              rating: (r.rating as number) || 4.5,
              text: (r.text as string) || 'Atendimento excelente e entrega rápida!',
              storeName: (r.storeName as string) || 'Loja',
              verified: (r.verified as boolean) ?? true,
              likes: (r.likes as number) || 10,
            }))
          )
        } else if (!cancelled) {
          setReviews(MOCK_REVIEWS)
        }
      } catch {
        if (!cancelled) setReviews(MOCK_REVIEWS)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadReviews()
    return () => { cancelled = true }
  }, [])

  // Auto-rotate carousel
  useEffect(() => {
    if (reviews.length === 0 || loading) return
    const interval = setInterval(() => {
      setDirection(1)
      setFeaturedIndex((prev) => (prev + 1) % reviews.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [reviews.length, loading])

  const goToReview = useCallback((index: number) => {
    setDirection(index > featuredIndex ? 1 : -1)
    setFeaturedIndex(index)
  }, [featuredIndex])

  const goNext = useCallback(() => {
    setDirection(1)
    setFeaturedIndex((prev) => (prev + 1) % reviews.length)
  }, [reviews.length])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setFeaturedIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }, [reviews.length])

  const featuredReview = reviews[featuredIndex]

  // Get preview cards (next 3, excluding featured)
  const previewIndices = useMemo(() => {
    if (reviews.length <= 1) return []
    const indices: number[] = []
    for (let i = 1; i <= Math.min(3, reviews.length - 1); i++) {
      indices.push((featuredIndex + i) % reviews.length)
    }
    return indices
  }, [featuredIndex, reviews.length])

  const handleViewAll = useCallback(() => {
    navigate('stores')
  }, [navigate])

  if (loading || reviews.length === 0) return null

  return (
    <section className="w-full relative overflow-hidden rounded-2xl">
      {/* 4 floating gradient orbs */}
      {orbColors.map((config, i) => (
        <GradientOrb key={`orb-${i}`} config={config} index={i} />
      ))}

      {/* Section header */}
      <div className="relative z-10 flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md"
            style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
          >
            <MessageCircle className="h-4 w-4 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base sm:text-lg font-bold r32-review-shimmer">O que dizem nossos clientes</h2>
            <p className="text-[11px] text-muted-foreground">Avaliações reais de quem usa o DomPlace</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 mr-2">
            <span className="text-xs font-bold text-amber-500">{reviews.length}</span>
            <span className="text-[10px] text-muted-foreground">avaliações</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={goPrev}
            className="h-7 w-7 rounded-full border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={goNext}
            className="h-7 w-7 rounded-full border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Featured review */}
      <div className="relative z-10">
        <AnimatePresence custom={direction} mode="wait">
          {featuredReview && (
            <FeaturedReviewCard
              key={featuredReview.id}
              review={featuredReview}
              direction={direction}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Preview cards — desktop 3-column, mobile scroll */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {previewIndices.map((idx, i) => {
          const review = reviews[idx]
          if (!review) return null
          return (
            <PreviewCard
              key={review.id}
              review={review}
              index={i}
              onClick={() => goToReview(idx)}
            />
          )
        })}
      </motion.div>

      {/* Dots indicator */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 mt-4">
        {reviews.map((_, i) => (
          <motion.button
            key={`dot-${i}`}
            onClick={() => goToReview(i)}
            className="relative h-2 rounded-full overflow-hidden"
            animate={{ width: i === featuredIndex ? 20 : 6 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
          >
            <div
              className={`absolute inset-0 rounded-full transition-colors duration-300 ${
                i === featuredIndex ? 'bg-primary' : 'bg-muted-foreground/20'
              }`}
            />
          </motion.button>
        ))}
      </div>

      {/* CTA Button */}
      <div className="relative z-10 mt-4 flex justify-center">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            onClick={handleViewAll}
            className="gap-2 rounded-xl border-primary/20 hover:bg-primary/5 text-sm font-semibold"
          >
            Ver todas as avaliações
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
