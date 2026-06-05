'use client'
/* ─── HouseholdServicesDirectory ─── "Serviços de Casa" ───
   Local household services directory: electricians, plumbers, cleaners,
   painters, gardeners with ratings, availability, instant booking,
   price estimates, and community reviews. */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Wrench, Star, MapPin, Clock, Phone, MessageCircle, Filter,
  Search, CheckCircle2, BadgeCheck, ChevronRight, Heart,
  Zap, Droplets, Paintbrush, Scissors, Home, Shield
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ServiceProvider {
  id: string
  name: string
  emoji: string
  category: string
  categoryIcon: typeof Wrench
  specialty: string
  rating: number
  reviews: number
  verified: boolean
  distance: string
  responseTime: string
  priceRange: string
  available: boolean
  nextSlot: string
  completedJobs: number
  description: string
  tags: string[]
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const categories = [
  { id: 'Todos', emoji: '🔧', label: 'Todos' },
  { id: 'eletrica', emoji: '⚡', label: 'Elétrica' },
  { id: 'hidraulica', emoji: '💧', label: 'Hidráulica' },
  { id: 'limpeza', emoji: '🧹', label: 'Limpeza' },
  { id: 'pintura', emoji: '🎨', label: 'Pintura' },
  { id: 'jardinagem', emoji: '🌿', label: 'Jardinagem' },
  { id: 'manutencao', emoji: '🏠', label: 'Manutenção' },
]

const providers: ServiceProvider[] = [
  {
    id: '1', name: 'José Eletricista', emoji: '👨‍🔧', category: 'eletrica', categoryIcon: Zap,
    specialty: 'Instalações elétricas, tomadas, fiação', rating: 4.9, reviews: 87, verified: true,
    distance: '1.2 km', responseTime: '15 min', priceRange: 'R$80 – R$200', available: true,
    nextSlot: 'Hoje 14:00', completedJobs: 234,
    description: 'Eletricista com 12 anos de experiência. Especialista em instalações residenciais e comerciais.',
    tags: ['Residencial', 'Comercial', 'Emergência']
  },
  {
    id: '2', name: 'Dona Cleusa', emoji: '👩‍🔧', category: 'limpeza', categoryIcon: Wrench,
    specialty: 'Limpeza residencial, faxina completa, pós-obra', rating: 5.0, reviews: 156, verified: true,
    distance: '0.8 km', responseTime: '10 min', priceRange: 'R$120 – R$250', available: true,
    nextSlot: 'Hoje 10:00', completedJobs: 412,
    description: 'Equipe de limpeza profissional. Serviço completo com produtos próprios.',
    tags: ['Residencial', 'Pós-obra', 'Rotativo']
  },
  {
    id: '3', name: 'Pedro Encanador', emoji: '🧔', category: 'hidraulica', categoryIcon: Droplets,
    specialty: 'Reparos, instalação de torneiras, vazamentos', rating: 4.8, reviews: 63, verified: true,
    distance: '2.1 km', responseTime: '30 min', priceRange: 'R$90 – R$180', available: true,
    nextSlot: 'Amanhã 08:00', completedJobs: 178,
    description: 'Encanador especializado em vazamentos e instalações. Atendimento emergencial.',
    tags: ['Emergência', 'Residencial', 'Instalação']
  },
  {
    id: '4', name: 'Marcos Pintor', emoji: '👨‍🎨', category: 'pintura', categoryIcon: Paintbrush,
    specialty: 'Pintura interna/externa, acabamento, textura', rating: 4.7, reviews: 45, verified: true,
    distance: '3.5 km', responseTime: '1 hora', priceRange: 'R$500 – R$2.000', available: false,
    nextSlot: 'Seg 09:00', completedJobs: 89,
    description: 'Pintor profissional com ampla experiência em acabamentos premium.',
    tags: ['Interna', 'Externa', 'Textura']
  },
  {
    id: '5', name: 'Seu Waldemir', emoji: '👴', category: 'jardinagem', categoryIcon: Scissors,
    specialty: 'Jardins, poda, paisagismo, irrigação', rating: 4.9, reviews: 72, verified: true,
    distance: '4.2 km', responseTime: '2 horas', priceRange: 'R$100 – R$300', available: true,
    nextSlot: 'Amanhã 07:00', completedJobs: 156,
    description: 'Jardineiro com 20 anos de experiência. Especialista em paisagismo tropical.',
    tags: ['Jardim', 'Poda', 'Irrigação']
  },
  {
    id: '6', name: 'Carlos Manutenção', emoji: '👨‍🔧', category: 'manutencao', categoryIcon: Home,
    specialty: 'Reparos gerais, montagem de móveis, gesso', rating: 4.6, reviews: 38, verified: false,
    distance: '1.8 km', responseTime: '45 min', priceRange: 'R$70 – R$150', available: true,
    nextSlot: 'Hoje 16:00', completedJobs: 67,
    description: 'Faz-tudo com experiência em manutenção predial. Montagem de móveis IKEA.',
    tags: ['Reparos', 'Montagem', 'Gesso']
  },
]

const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`
const sp = 'spring' as const

// ─── Component ────────────────────────────────────────────────────────────────
export default function HouseholdServicesDirectory() {
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1100)
    return () => clearTimeout(timer)
  }, [])

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = providers
    .filter(p => activeCategory === 'Todos' || p.category === activeCategory)
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance)
      return 0
    })

  const availableCount = providers.filter(p => p.available).length
  const avgRating = (providers.reduce((s, p) => s + p.rating, 0) / providers.length).toFixed(1)
  const totalJobs = providers.reduce((s, p) => s + p.completedJobs, 0)

  if (loading) return <LoadingSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: sp, stiffness: 260, damping: 24 }}
    >
      <Card className="overflow-hidden border-border/40 r92-services-card r101-section-accent">
        {/* ── Header ── */}
        <CardHeader className="pb-3">
          <div
            className="r92-services-header flex items-center gap-3 px-4 py-4 rounded-xl -mx-6 -mt-6 mb-4"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)',
              boxShadow: '0 4px 16px rgba(139,92,246,0.25)'
            }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-white tracking-tight">Serviços de Casa</h2>
              <p className="text-[11px] text-white/70 font-medium">Profissionais verificados perto de você</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
              <Shield className="h-3.5 w-3.5 text-violet-200" />
              <span className="text-[11px] font-bold text-violet-100">{availableCount} disponíveis</span>
            </div>
          </div>

          {/* ── Stats Bar ── */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            {[
              { label: 'Profissionais', value: String(providers.length), emoji: '👨‍🔧' },
              { label: 'Avaliação média', value: avgRating, emoji: '⭐' },
              { label: 'Serviços feitos', value: String(totalJobs), emoji: '✅' },
            ].map(stat => (
              <div key={stat.label} className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40">
                <span className="text-sm">{stat.emoji}</span>
                <div>
                  <p className="text-xs font-bold">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Search + Category Filters ── */}
          <div className="flex items-center gap-2 mt-3 px-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar profissional ou serviço..."
                className="w-full h-10 pl-8 pr-3 rounded-lg bg-muted/50 border border-border/50 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mt-2 -mx-1 px-1">
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-[11px] font-medium border transition-all min-h-[44px] ${
                  activeCategory === cat.id
                    ? 'border-violet-500 bg-violet-500 text-white'
                    : 'border-border bg-card text-muted-foreground hover:border-violet-300'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </motion.button>
            ))}
          </div>
          {/* Sort */}
          <div className="flex gap-1.5 mt-2">
            {([['rating', 'Melhor avaliação'], ['distance', 'Mais perto'], ['price', 'Menor preço']] as const).map(([val, label]) => (
              <motion.button
                key={val}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy(val)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all min-h-[44px] ${
                  sortBy === val
                    ? 'border-violet-400 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400'
                    : 'border-border bg-muted/40 text-muted-foreground hover:border-violet-200'
                }`}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 space-y-3">
          {/* ── Provider Cards ── */}
          <AnimatePresence mode="popLayout">
            {filtered.map((provider, i) => {
              const Icon = provider.categoryIcon
              return (
                <motion.div
                  key={provider.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: sp, stiffness: 350, damping: 28, delay: i * 0.03 }}
                  className="r92-provider-card relative p-3 rounded-xl border border-border/40 bg-card/60 hover:border-violet-200/50 transition-colors r62-card-lift"
                >
                  {/* Favorite */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => toggleFav(provider.id)}
                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Heart className={`h-4 w-4 transition-colors ${favorites.has(provider.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                  </motion.button>

                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/15 text-2xl shrink-0 r92-provider-avatar">
                      {provider.emoji}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold">{provider.name}</h4>
                        {provider.verified && (
                          <BadgeCheck className="h-3.5 w-3.5 text-violet-500" />
                        )}
                        {!provider.available && (
                          <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-semibold dark:bg-red-900/30 dark:text-red-400">
                            Ocupado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {provider.rating}
                        </span>
                        <span className="text-[10px] text-muted-foreground">({provider.reviews})</span>
                        <span className="text-[10px] text-muted-foreground">· {provider.distance}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{provider.specialty}</p>
                      {/* Tags */}
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {provider.tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[9px] font-medium dark:bg-violet-900/20 dark:text-violet-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="flex items-center gap-2 mt-2.5 px-1">
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Icon className="h-3 w-3 text-violet-500" />
                      {provider.priceRange}
                    </span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3 text-violet-500" />
                      {provider.responseTime}
                    </span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      {provider.completedJobs} serviços
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-2.5">
                    {provider.available ? (
                      <>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 2px 8px rgba(139,92,246,0.2)' }}
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Agendar — {provider.nextSlot}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-violet-200 text-violet-600 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-900/20 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        disabled
                        className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold bg-muted text-muted-foreground cursor-not-allowed"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Próxima vaga: {provider.nextSlot}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* ── Trust Banner ── */}
          <motion.div
            className="r92-trust-card p-4 rounded-xl border border-violet-100 dark:border-violet-800/30"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.04), rgba(109,40,217,0.08))' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/20 shrink-0">
                <Shield className="h-5 w-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold">Garantia DomPlace</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Todos os profissionais são verificados. Se não ficar satisfeito, devolvemos 100% do valor.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              {[
                { icon: BadgeCheck, label: 'Verificados' },
                { icon: Star, label: 'Avaliações reais' },
                { icon: Shield, label: 'Garantia total' },
                { icon: Phone, label: 'Suporte 24h' },
              ].map(item => (
                <div key={item.label} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg bg-white/50 dark:bg-black/10">
                  <item.icon className="h-4 w-4 text-violet-500" />
                  <span className="text-[9px] font-semibold text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Empty State ── */}
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-xs font-semibold text-muted-foreground">Nenhum profissional encontrado</p>
              <p className="text-[10px] text-muted-foreground mt-1">Tente buscar outra categoria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <Card className="overflow-hidden border-border/40">
      <div className="p-4 space-y-4">
        <div className="h-20 rounded-xl bg-muted/50 animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 flex-1 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="h-10 rounded-lg bg-muted/40 animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-9 w-16 rounded-full bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="space-y-2.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    </Card>
  )
}
