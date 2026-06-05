'use client'

import { useState, useEffect, useMemo, useSyncExternalStore, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cachedFetch } from '@/lib/cached-fetch'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ServiceProvider {
  id: string
  name: string
  profession: string
  category: string
  neighborhood: string
  avatar: string
  rating: number
  reviewCount: number
  availability: 'disponivel' | 'ocupado' | 'offline'
  priceMin: number
  priceMax: number
  responseTime: number
  skills: string[]
  verified: boolean
  bio: string
  completedJobs: number
}

interface Review {
  id: string
  reviewerName: string
  rating: number
  comment: string
  date: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  'Todos',
  'Encanador',
  'Eletricista',
  'Limpeza',
  'Reparos',
  'Pet Shop',
  'Aulas',
  'Beleza',
  'Delivery',
] as const

type CategoryFilter = (typeof CATEGORIES)[number]

const AVATAR_GRADIENTS = [
  'from-blue-500 to-cyan-400',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-yellow-400',
  'from-emerald-500 to-teal-400',
  'from-violet-500 to-purple-400',
  'from-orange-500 to-red-400',
  'from-sky-500 to-indigo-400',
  'from-lime-500 to-green-400',
  'from-fuchsia-500 to-pink-400',
]

const FALLBACK_REVIEWS: Review[] = [
  {
    id: 'r1',
    reviewerName: 'João Pereira',
    rating: 5,
    comment: 'Maria é simplesmente incrível! Minha casa nunca esteve tão limpa e organizada. Super recomendo para quem busca qualidade e pontualidade.',
    date: '2024-12-15',
  },
  {
    id: 'r2',
    reviewerName: 'Cláudia Mendes',
    rating: 5,
    comment: 'Profissional exemplar. Sempre atenciosa e faz tudo com muito capricho. Melhor investimento para quem quer uma casa impecável.',
    date: '2024-12-08',
  },
  {
    id: 'r3',
    reviewerName: 'Roberto Almeida',
    rating: 4,
    comment: 'Serviço de excelente qualidade. A equipe é muito organizada e eficiente. Só não dou 5 estrelas porque tive um pequeno atraso na primeira visita.',
    date: '2024-11-28',
  },
]

const FALLBACK_SERVICES: ServiceProvider[] = [
  {
    id: 'p1',
    name: 'Carlos Silva',
    profession: 'Encanador',
    category: 'Encanador',
    neighborhood: 'Centro',
    avatar: 'CS',
    rating: 4.8,
    reviewCount: 234,
    availability: 'disponivel',
    priceMin: 80,
    priceMax: 150,
    responseTime: 15,
    skills: ['Reparo de vazamento', 'Instalação hidráulica', 'Torneira'],
    verified: true,
    bio: 'Encanador com mais de 15 anos de experiência em instalações hidráulicas residenciais e comerciais na região de Dom Eliseu.',
    completedJobs: 456,
  },
  {
    id: 'p2',
    name: 'Maria Santos',
    profession: 'Limpeza',
    category: 'Limpeza',
    neighborhood: 'Centro',
    avatar: 'MS',
    rating: 4.9,
    reviewCount: 312,
    availability: 'disponivel',
    priceMin: 120,
    priceMax: 200,
    responseTime: 10,
    skills: ['Limpeza residencial', 'Faxina comercial', 'Organização'],
    verified: true,
    bio: 'Especialista em limpeza e organização de ambientes. Serviço de qualidade com produtos ecológicos e atendimento personalizado.',
    completedJobs: 890,
  },
  {
    id: 'p3',
    name: 'José Oliveira',
    profession: 'Eletricista',
    category: 'Eletricista',
    neighborhood: 'Vila Nova',
    avatar: 'JO',
    rating: 4.7,
    reviewCount: 189,
    availability: 'ocupado',
    priceMin: 90,
    priceMax: 180,
    responseTime: 25,
    skills: ['Instalação elétrica', 'Troca de fiação', 'Tomadas'],
    verified: true,
    bio: 'Eletricista profissional certificado com experiência em projetos elétricos residenciais e comerciais. Atendimento rápido e eficiente.',
    completedJobs: 345,
  },
  {
    id: 'p4',
    name: 'Ana Costa',
    profession: 'Pet Shop',
    category: 'Pet Shop',
    neighborhood: 'Jardim América',
    avatar: 'AC',
    rating: 4.6,
    reviewCount: 156,
    availability: 'disponivel',
    priceMin: 60,
    priceMax: 120,
    responseTime: 20,
    skills: ['Banho e tosa', 'Veterinária', 'Pet taxi'],
    verified: false,
    bio: 'Apaixonada por animais desde a infância. Ofereço banho, tosa e cuidados veterinários básicos para seu melhor amigo.',
    completedJobs: 267,
  },
  {
    id: 'p5',
    name: 'Roberto Lima',
    profession: 'Reparos',
    category: 'Reparos',
    neighborhood: 'Centro',
    avatar: 'RL',
    rating: 4.5,
    reviewCount: 98,
    availability: 'disponivel',
    priceMin: 70,
    priceMax: 140,
    responseTime: 30,
    skills: ['Marcenaria', 'Pintura', 'Montagem'],
    verified: false,
    bio: 'Marceneiro e reparador geral com mais de 20 anos de experiência. Faço de tudo: desde pequenos reparos até reformas completas.',
    completedJobs: 178,
  },
  {
    id: 'p6',
    name: 'Fernanda Alves',
    profession: 'Aulas',
    category: 'Aulas',
    neighborhood: 'Vila Nova',
    avatar: 'FA',
    rating: 4.9,
    reviewCount: 267,
    availability: 'disponivel',
    priceMin: 80,
    priceMax: 150,
    responseTime: 12,
    skills: ['Matemática', 'Português', 'Inglês'],
    verified: true,
    bio: 'Professora com formação em Pedagogia e especialização em Educação Matemática. Aulas particulares personalizadas para todas as idades.',
    completedJobs: 534,
  },
  {
    id: 'p7',
    name: 'Paulo Mendes',
    profession: 'Delivery',
    category: 'Delivery',
    neighborhood: 'Centro',
    avatar: 'PM',
    rating: 4.3,
    reviewCount: 445,
    availability: 'disponivel',
    priceMin: 15,
    priceMax: 30,
    responseTime: 5,
    skills: ['Entrega rápida', 'Documentos', 'Compras'],
    verified: false,
    bio: 'Motoboy experiente e confiável. Faço entregas de documentos, compras e qualquer encomenda com rapidez e segurança.',
    completedJobs: 1230,
  },
  {
    id: 'p8',
    name: 'Lucia Ferreira',
    profession: 'Beleza',
    category: 'Beleza',
    neighborhood: 'Jardim América',
    avatar: 'LF',
    rating: 4.8,
    reviewCount: 201,
    availability: 'ocupado',
    priceMin: 50,
    priceMax: 100,
    responseTime: 18,
    skills: ['Cabelo', 'Manicure', 'Maquiagem'],
    verified: true,
    bio: 'Profissional de beleza com 10 anos de experiência. Especialista em cortes modernos, coloração e maquiagem para eventos.',
    completedJobs: 412,
  },
  {
    id: 'p9',
    name: 'Marcos Souza',
    profession: 'Encanador',
    category: 'Encanador',
    neighborhood: 'Zona Rural',
    avatar: 'MSO',
    rating: 4.4,
    reviewCount: 78,
    availability: 'offline',
    priceMin: 85,
    priceMax: 160,
    responseTime: 45,
    skills: ['Desentupimento', 'Caixa d\'água', 'Reparo geral'],
    verified: false,
    bio: 'Encanador especializado em desentupimento e manutenção de caixa d\'água. Atendo toda a região de Dom Eliseu e zona rural.',
    completedJobs: 145,
  },
]

const FEATURED_ID = 'p2'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function availabilityLabel(status: ServiceProvider['availability']): string {
  switch (status) {
    case 'disponivel':
      return 'Disponível hoje'
    case 'ocupado':
      return 'Ocupado'
    case 'offline':
      return 'Offline'
  }
}

function availabilityColor(status: ServiceProvider['availability']): string {
  switch (status) {
    case 'disponivel':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
    case 'ocupado':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
    case 'offline':
      return 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700'
  }
}

function renderStars(rating: number): React.ReactNode {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-sm leading-none">
          {i < full ? (
            <span className="text-amber-400">★</span>
          ) : i === full && hasHalf ? (
            <span className="text-amber-400">★</span>
          ) : (
            <span className="text-gray-300 dark:text-gray-600">★</span>
          )}
        </span>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {renderStars(rating)}
      <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  )
}

function AvatarCircle({
  initials,
  gradientIdx,
  verified,
  size = 'md',
}: {
  initials: string
  gradientIdx: number
  verified: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const sizeClasses = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl',
  }
  return (
    <div className="relative">
      <div
        className={`rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[gradientIdx % AVATAR_GRADIENTS.length]} flex items-center justify-center font-bold text-white ${sizeClasses[size]} ${verified ? 'r74-avatar-ring' : ''}`}
      >
        {initials}
      </div>
      {verified && (
        <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white dark:border-card flex items-center justify-center">
          <span className="text-white text-[10px] font-bold leading-none">✓</span>
        </div>
      )}
    </div>
  )
}

function QuickStatsBar({ providers }: { providers: ServiceProvider[] }) {
  const totalProviders = providers.length
  const availableToday = providers.filter((p) => p.availability === 'disponivel').length
  const fiveStar = providers.filter((p) => p.rating >= 4.8).length
  const avgResponse = Math.round(
    providers.reduce((acc, p) => acc + p.responseTime, 0) / providers.length
  )

  const stats = [
    {
      icon: '🔧',
      label: 'Total de Profissionais',
      value: totalProviders,
    },
    {
      icon: '✅',
      label: 'Disponíveis Hoje',
      value: availableToday,
    },
    {
      icon: '⭐',
      label: 'Avaliação 5 Estrelas',
      value: fiveStar,
    },
    {
      icon: '⏱️',
      label: 'Tempo Médio de Resposta',
      value: `${avgResponse} min`,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.08, type: 'spring' as const, stiffness: 260, damping: 24 }}
          className="r74-stat-card rounded-xl border border-border/60 bg-card p-4 flex flex-col items-center justify-center gap-1.5 text-center hover:border-primary/20 transition-colors"
        >
          <span className="text-2xl" aria-hidden="true">{stat.icon}</span>
          <span className="text-xl font-bold text-foreground">{stat.value}</span>
          <span className="text-xs text-muted-foreground leading-tight">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  )
}

function FeaturedSpotlight({
  provider,
  reviews,
  prefersReduced,
}: {
  provider: ServiceProvider
  reviews: Review[]
  prefersReduced: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: 'spring' as const, stiffness: 220, damping: 26 }}
      className="r74-featured-card rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 sm:p-8 mb-8 text-white relative overflow-hidden"
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" aria-hidden="true" />

      <div className="relative z-10 flex flex-col sm:flex-row gap-6">
        {/* Avatar & text */}
        <div className="flex-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full mb-4">
            <span className="text-amber-300">★</span>
            Profissional em Destaque
          </span>
          <div className="flex items-center gap-4 mb-3">
            <AvatarCircle
              initials={provider.avatar}
              gradientIdx={FALLBACK_SERVICES.findIndex((p) => p.id === provider.id)}
              verified={provider.verified}
              size="xl"
            />
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold">{provider.name}</h3>
              <p className="text-white/80 text-sm">{provider.profession} · {provider.neighborhood}</p>
            </div>
          </div>
          <p className="text-white/90 text-sm sm:text-base max-w-lg mb-4 leading-relaxed">
            {provider.bio}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mb-5">
            <div className="flex items-center gap-1.5">
              <span className="text-lg" aria-hidden="true">📋</span>
              <div>
                <span className="font-bold text-lg">{provider.completedJobs}</span>
                <span className="text-white/70 text-xs ml-1">serviços</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg" aria-hidden="true">⭐</span>
              <div>
                <span className="font-bold text-lg">{provider.rating.toFixed(1)}</span>
                <span className="text-white/70 text-xs ml-1">avaliação</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg" aria-hidden="true">⚡</span>
              <div>
                <span className="font-bold text-lg">~{provider.responseTime} min</span>
                <span className="text-white/70 text-xs ml-1">resposta</span>
              </div>
            </div>
          </div>

          <motion.div whileTap={{ scale: prefersReduced ? 1 : 0.96 }}>
            <Button
              className="min-h-[44px] min-w-[44px] bg-white text-indigo-600 hover:bg-white/90 font-semibold rounded-xl px-6"
              aria-label="Agendar serviço com Maria Santos"
            >
              Agendar agora
            </Button>
          </motion.div>
        </div>

        {/* Reviews preview */}
        <div className="flex-1 max-w-md w-full">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-3">
            Avaliações Recentes
          </h4>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="r74-review-card bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-colors hover:bg-white/15"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-sm">{review.reviewerName}</span>
                  <span className="text-xs text-white/60">{formatDate(review.date)}</span>
                </div>
                <div className="flex items-center gap-1 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${i < review.rating ? 'text-amber-300' : 'text-white/20'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
          <motion.div whileTap={{ scale: prefersReduced ? 1 : 0.96 }} className="mt-3">
            <Button
              variant="ghost"
              className="min-h-[44px] min-w-[44px] text-white hover:bg-white/10 hover:text-white"
              aria-label="Ver mais avaliações de Maria Santos"
            >
              Ver mais avaliações
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function ServiceProviderCard({
  provider,
  index,
  prefersReduced,
  onContact,
}: {
  provider: ServiceProvider
  index: number
  prefersReduced: boolean
  onContact: (name: string) => void
}) {
  const gradIdx = FALLBACK_SERVICES.findIndex((p) => p.id === provider.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.1 + index * 0.06,
        type: 'spring' as const,
        stiffness: 260,
        damping: 24,
      }}
      className="r74-service-card rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-4 hover:border-primary/20 transition-colors"
    >
      {/* Header: avatar + info */}
      <div className="flex items-start gap-3">
        <AvatarCircle
          initials={provider.avatar}
          gradientIdx={gradIdx}
          verified={provider.verified}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm truncate">{provider.name}</h3>
            {provider.verified && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 text-[10px] px-1.5 py-0">
                ✓ Verificado
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{provider.profession}</p>
          <p className="text-xs text-muted-foreground">{provider.neighborhood}, Dom Eliseu - PA</p>
        </div>
      </div>

      {/* Rating */}
      <StarRating rating={provider.rating} count={provider.reviewCount} />

      {/* Availability badge */}
      <div className="flex items-center gap-2">
        <span
          className={`r74-availability inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${availabilityColor(provider.availability)}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              provider.availability === 'disponivel'
                ? 'bg-emerald-500'
                : provider.availability === 'ocupado'
                  ? 'bg-amber-500'
                  : 'bg-gray-400'
            }`}
            aria-hidden="true"
          />
          {availabilityLabel(provider.availability)}
        </span>
      </div>

      {/* Price range */}
      <div className="flex items-center gap-1.5 text-sm text-foreground">
        <span className="font-semibold">{formatBRL(provider.priceMin)}</span>
        <span className="text-muted-foreground">—</span>
        <span className="font-semibold">{formatBRL(provider.priceMax)}</span>
        <span className="text-xs text-muted-foreground ml-1">por serviço</span>
      </div>

      {/* Response time */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span aria-hidden="true">⏱️</span>
        Responde em ~{provider.responseTime} min
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {provider.skills.map((skill) => (
          <span
            key={skill}
            className="r74-skill-tag text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-secondary/80 text-secondary-foreground border border-border/40 transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto pt-1">
        <motion.div whileTap={{ scale: prefersReduced ? 1 : 0.95 }} className="flex-1">
          <Button
            className="r74-contact-btn w-full min-h-[44px] bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg"
            onClick={() => onContact(provider.name)}
            aria-label={`Contatar ${provider.name}`}
          >
            Contatar
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: prefersReduced ? 1 : 0.95 }} className="flex-1">
          <Button
            variant="ghost"
            className="w-full min-h-[44px] rounded-lg border border-border/60 hover:bg-accent"
            aria-label={`Ver perfil de ${provider.name}`}
          >
            Ver perfil
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function LocalServicesHub() {
  /* -- Reduced motion ---------------------------------------------- */
  const prefersReduced = useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia('(prefers-reduced-motion: reduce)')
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  )

  /* -- State ------------------------------------------------------- */
  const [providers, setProviders] = useState<ServiceProvider[]>(() => FALLBACK_SERVICES)
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [contactToast, setContactToast] = useState<string | null>(null)
  const [reviews] = useState<Review[]>(() => FALLBACK_REVIEWS)

  /* -- Fetch data on mount ----------------------------------------- */
  useEffect(() => {
    let cancelled = false
    async function loadProviders() {
      try {
        const data = await cachedFetch<ServiceProvider[]>('/api/local-services')
        if (!cancelled && data && data.length > 0) {
          setProviders(data)
        }
      } catch {
        // keep fallback
      }
    }
    loadProviders()
    return () => {
      cancelled = true
    }
  }, [])

  /* -- Featured provider ------------------------------------------- */
  const featuredProvider = useMemo(
    () => providers.find((p) => p.id === FEATURED_ID) ?? providers[0],
    [providers]
  )

  /* -- Filtered list ----------------------------------------------- */
  const filteredProviders = useMemo(() => {
    let result = providers
    if (activeCategory !== 'Todos') {
      result = result.filter((p) => p.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.profession.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.skills.some((s) => s.toLowerCase().includes(q))
      )
    }
    return result
  }, [providers, activeCategory, searchQuery])

  /* -- Handlers ---------------------------------------------------- */
  const handleContact = useCallback((name: string) => {
    setContactToast(name)
    setTimeout(() => setContactToast(null), 3000)
  }, [])

  /* -- Animation variants ------------------------------------------ */
  const fadeIn = prefersReduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
      }

  /* -- Render ------------------------------------------------------ */
  return (
    <section
      className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-12 r62-card-lift"
      aria-label="Serviços Locais - Diretório de profissionais em Dom Eliseu"
    >
      {/* ---- Header ---- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
        className="mb-6 mt-2"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight r62-heading-gradient">
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Serviços Locais
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
          Profissionais de confiança na sua vizinhança
        </p>
      </motion.div>

      {/* ---- Featured Provider Spotlight ---- */}
      {featuredProvider && (
        <FeaturedSpotlight
          provider={featuredProvider}
          reviews={reviews}
          prefersReduced={prefersReduced}
        />
      )}

      {/* ---- Quick Stats Bar ---- */}
      <QuickStatsBar providers={providers} />

      {/* ---- Category Filter Bar ---- */}
      <motion.div
        {...fadeIn}
        className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none -mx-1 px-1"
        role="tablist"
        aria-label="Filtro de categorias de serviço"
      >
        {CATEGORIES.map((cat, i) => {
          const isActive = activeCategory === cat
          return (
            <motion.button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: prefersReduced ? 1 : 1.04 }}
              whileTap={{ scale: prefersReduced ? 1 : 0.96 }}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.03, type: 'spring' as const, stiffness: 300, damping: 24 }}
              className={`r74-category-chip shrink-0 min-h-[44px] min-w-[44px] px-4 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : 'bg-card text-muted-foreground border-border/60 hover:border-indigo-300 hover:text-foreground'
              }`}
            >
              {cat}
            </motion.button>
          )
        })}
      </motion.div>

      {/* ---- Search Bar ---- */}
      <motion.div
        {...fadeIn}
        className="relative mb-6"
        transition={{ delay: 0.15 }}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nome ou tipo de serviço..."
          className={`r74-search-input w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30`}
          aria-label="Buscar profissionais por nome ou tipo de serviço"
        />
      </motion.div>

      {/* ---- Service Provider Cards Grid ---- */}
      {filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
          {filteredProviders.map((provider, i) => (
            <div key={provider.id} role="listitem">
              <ServiceProviderCard
                provider={provider}
                index={i}
                prefersReduced={prefersReduced}
                onContact={handleContact}
              />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-3xl" aria-hidden="true">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Nenhum profissional encontrado
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Tente ajustar os filtros de categoria ou buscar por outro termo.
          </p>
          <Button
            variant="outline"
            className="mt-4 min-h-[44px] min-w-[44px]"
            onClick={() => {
              setActiveCategory('Todos')
              setSearchQuery('')
            }}
          >
            Limpar filtros
          </Button>
        </motion.div>
      )}

      {/* ---- Results Count ---- */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs text-muted-foreground mb-3 mt-2"
      >
        {filteredProviders.length}{' '}
        {filteredProviders.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
        {activeCategory !== 'Todos' && ` em ${activeCategory}`}
        {searchQuery.trim() && ` para "${searchQuery.trim()}"`}
      </motion.p>

      {/* ---- Contact Toast ---- */}
      <AnimatePresence>
        {contactToast && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{ transformOrigin: 'center bottom' }}
            role="status"
            aria-live="polite"
          >
            <span className="text-emerald-400" aria-hidden="true">✓</span>
            Mensagem enviada para <span className="font-bold">{contactToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ---- Become a Provider CTA ---- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring' as const, stiffness: 220, damping: 26 }}
        className="mt-10 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20 p-6 sm:p-8 text-center"
      >
        <span className="text-3xl mb-3 block" aria-hidden="true">🤝</span>
        <h3 className="text-lg font-bold text-foreground mb-1">
          Você é profissional de Dom Eliseu?
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          Cadastre-se gratuitamente no DomPlace e alcance mais clientes na sua região.
          Receba solicitações direto no seu celular.
        </p>
        <motion.div whileTap={{ scale: prefersReduced ? 1 : 0.96 }}>
          <Button
            className="min-h-[44px] min-w-[44px] bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl px-6"
          >
            Cadastrar como profissional
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
