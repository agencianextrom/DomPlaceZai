'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Star, ChevronRight, Users, Sparkles, Heart, Clock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// ==================== TYPES ====================
interface ServiceCategory {
  id: string
  name: string
  icon: string
  gradient: string
  providerCount: number
  avgRating: number
}

interface ServiceProvider {
  id: string
  name: string
  avatar: string
  rating: number
  reviewCount: number
  specialty: string
  categoryId: string
  distance: string
  price: string
  responseTime: string
}

type FilterType = 'all' | 'popular' | 'top_rated' | 'nearby'

// ==================== MOCK DATA ====================
const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'limpeza', name: 'Limpeza', icon: '🧹', gradient: 'from-sky-100 to-blue-200 dark:from-sky-900/30 dark:to-blue-800/30', providerCount: 12, avgRating: 4.7 },
  { id: 'reparos', name: 'Reparos', icon: '🔧', gradient: 'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30', providerCount: 8, avgRating: 4.5 },
  { id: 'beleza', name: 'Beleza', icon: '💅', gradient: 'from-pink-100 to-rose-200 dark:from-pink-900/30 dark:to-rose-800/30', providerCount: 15, avgRating: 4.9 },
  { id: 'pet', name: 'Pet Shop', icon: '🐕', gradient: 'from-lime-100 to-green-200 dark:from-lime-900/30 dark:to-green-800/30', providerCount: 6, avgRating: 4.6 },
  { id: 'aulas', name: 'Aulas', icon: '📚', gradient: 'from-violet-100 to-purple-200 dark:from-violet-900/30 dark:to-purple-800/30', providerCount: 10, avgRating: 4.8 },
  { id: 'tecnologia', name: 'Tecnologia', icon: '💻', gradient: 'from-slate-100 to-gray-200 dark:from-slate-900/30 dark:to-gray-800/30', providerCount: 7, avgRating: 4.4 },
  { id: 'entrega', name: 'Entrega', icon: '🚚', gradient: 'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30', providerCount: 20, avgRating: 4.3 },
  { id: 'eventos', name: 'Eventos', icon: '🎉', gradient: 'from-fuchsia-100 to-pink-200 dark:from-fuchsia-900/30 dark:to-pink-800/30', providerCount: 9, avgRating: 4.8 },
]

const SERVICE_PROVIDERS: ServiceProvider[] = [
  { id: 'p1', name: 'Maria Lima', avatar: '👩‍🦰', rating: 4.9, reviewCount: 87, specialty: 'Faxina residencial completa', categoryId: 'limpeza', distance: '0.8 km', price: 'R$ 120/h', responseTime: '30 min' },
  { id: 'p2', name: 'Carlos Silva', avatar: '👨‍🔧', rating: 4.7, reviewCount: 54, specialty: 'Reparos elétricos e hidráulicos', categoryId: 'reparos', distance: '1.2 km', price: 'R$ 80/visita', responseTime: '1h' },
  { id: 'p3', name: 'Ana Costa', avatar: '👩‍🦱', rating: 4.9, reviewCount: 132, specialty: 'Cortes, coloração e tratamentos', categoryId: 'beleza', distance: '0.3 km', price: 'R$ 90', responseTime: '15 min' },
  { id: 'p4', name: 'Pedro Santos', avatar: '🧑', rating: 4.8, reviewCount: 45, specialty: 'Banho, tosa e veterinária', categoryId: 'pet', distance: '1.5 km', price: 'R$ 60', responseTime: '45 min' },
  { id: 'p5', name: 'Juliana Rocha', avatar: '👩‍🏫', rating: 4.9, reviewCount: 98, specialty: 'Matemática e Física (até vestibular)', categoryId: 'aulas', distance: '0.5 km', price: 'R$ 70/h', responseTime: '20 min' },
  { id: 'p6', name: 'Ricardo Mendes', avatar: '👨‍💻', rating: 4.6, reviewCount: 31, specialty: 'Suporte técnico e formatação', categoryId: 'tecnologia', distance: '2.0 km', price: 'R$ 100/visita', responseTime: '2h' },
  { id: 'p7', name: 'Fernanda Oliveira', avatar: '👩‍🎤', rating: 4.8, reviewCount: 76, specialty: 'Decoração e organização de eventos', categoryId: 'eventos', distance: '0.9 km', price: 'R$ 500+', responseTime: '1h' },
  { id: 'p8', name: 'Lucas Almeida', avatar: '🧑‍🔧', rating: 4.5, reviewCount: 42, specialty: 'Entregas rápidas (moto)', categoryId: 'entrega', distance: '0.2 km', price: 'R$ 12/corrida', responseTime: '5 min' },
]

const FILTER_OPTIONS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'popular', label: 'Mais Populares' },
  { id: 'top_rated', label: 'Melhor Avaliados' },
  { id: 'nearby', label: 'Mais Próximos' },
]

// ==================== SPRING CONFIG ====================
const springCard = { type: 'spring' as const, stiffness: 300, damping: 25 }

// ==================== SKELETON ====================
function ServiceDirectorySkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-4 w-36 mb-4" />
      <Skeleton className="h-10 w-full rounded-xl mb-5" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-xl" />)}
      </div>
      <Skeleton className="h-6 w-32 mb-3" />
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    </div>
  )
}

// ==================== RATING STARS WITH FILL ANIMATION ====================
function AnimatedRating({ rating, size = 12 }: { rating: number; size?: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5

  return (
    <div className="flex items-center gap-px">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05, type: 'spring' as const, stiffness: 400, damping: 20 }}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 24 24" fill={i < fullStars || (i === fullStars && hasHalf) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="text-amber-400">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

// ==================== CATEGORY CARD ====================
function CategoryCard({ category, index, onClick }: { category: ServiceCategory; index: number; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl p-3 sm:p-4 bg-gradient-to-br ${category.gradient} border border-border/50 hover:border-primary/30 transition-all text-left`}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, ...springCard }}
    >
      <motion.span
        className="text-2xl sm:text-3xl block mb-2"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, delay: index * 0.3 }}
      >
        {category.icon}
      </motion.span>
      <p className="text-xs sm:text-sm font-bold">{category.name}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <Users className="h-3 w-3" />
          {category.providerCount}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
          <Star className="h-3 w-3 fill-amber-400" />
          {category.avgRating}
        </span>
      </div>
      <motion.div
        className="mt-2 text-[9px] font-semibold text-primary flex items-center gap-0.5"
        initial={{ opacity: 0.7 }}
        whileHover={{ opacity: 1, x: 2 }}
      >
        Ver Serviços <ChevronRight className="h-3 w-3" />
      </motion.div>
    </motion.button>
  )
}

// ==================== PROVIDER CARD ====================
function ProviderCard({ provider, index }: { provider: ServiceProvider; index: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl bg-card/80 dark:bg-card/50 border border-border/50 hover:border-primary/20 transition-all card-premium-hover"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ...springCard }}
      whileHover={{ y: -2 }}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center text-2xl shadow-sm">
          {provider.avatar}
        </div>
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + index * 0.06, type: 'spring' as const }}
        >
          <span className="text-[8px] text-white font-bold">✓</span>
        </motion.div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{provider.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{provider.specialty}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <AnimatedRating rating={provider.rating} size={10} />
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">{provider.rating}</span>
          </div>
          <span className="text-[9px] text-muted-foreground">({provider.reviewCount})</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="text-xs font-bold text-primary">{provider.price}</span>
        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
          <MapPin className="h-2.5 w-2.5" />
          {provider.distance}
        </span>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button size="sm" className="h-7 text-[10px] px-2.5 bg-primary hover:bg-primary/90 text-primary-foreground btn-glow gap-1">
            Contratar
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ==================== FEATURED CAROUSEL ====================
function FeaturedProviders({ providers }: { providers: ServiceProvider[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const featured = providers.filter((_, i) => i < 4)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % featured.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [featured.length])

  if (featured.length === 0) return null

  return (
    <div className="overflow-hidden rounded-xl">
      <div className="flex gap-3 transition-transform duration-500" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {featured.map((provider) => (
          <div key={provider.id} className="min-w-full">
            <motion.div
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-emerald-500/5 dark:from-primary/10 dark:to-emerald-500/10 border border-primary/10"
              whileHover={{ scale: 1.01 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center text-4xl shrink-0 shadow-inner">
                {provider.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <Badge variant="secondary" className="text-[9px] mb-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30">
                  ⭐ Destaque
                </Badge>
                <p className="text-sm font-bold truncate">{provider.name}</p>
                <p className="text-xs text-muted-foreground truncate">{provider.specialty}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1">
                    <AnimatedRating rating={provider.rating} size={11} />
                    <span className="text-xs font-bold">{provider.rating}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    Responde em {provider.responseTime}
                  </span>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">A partir de</p>
                  <p className="text-lg font-bold text-primary">{provider.price}</p>
                </div>
                <Button size="sm" className="btn-glow bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1">
                  Contratar <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? 'w-5 bg-primary' : 'bg-muted-foreground/30'}`}
          />
        ))}
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================
export function ServiceDirectory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 800)
    return () => clearTimeout(t)
  }, [])

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('domplace-svc-favorites')
      if (stored) setFavorites(new Set(JSON.parse(stored)))
    } catch { /* ignore */ }
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem('domplace-svc-favorites', JSON.stringify(Array.from(next))) } catch { /* ignore */ }
      return next
    })
  }, [])

  const filteredProviders = useMemo(() => {
    let result = [...SERVICE_PROVIDERS]
    if (selectedCategory) result = result.filter(p => p.categoryId === selectedCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q))
    }
    switch (activeFilter) {
      case 'popular': return result.sort((a, b) => b.reviewCount - a.reviewCount)
      case 'top_rated': return result.sort((a, b) => b.rating - a.rating)
      case 'nearby': return result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
      default: return result
    }
  }, [activeFilter, searchQuery, selectedCategory])

  if (!isLoaded) return <ServiceDirectorySkeleton />

  return (
    <section className="glass-card rounded-2xl p-5 r27-service-directory relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md"
          >
            <MessageCircle className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-base font-bold">Serviços Locais</h2>
            <p className="text-[10px] text-muted-foreground">Profissionais da sua região</p>
          </div>
        </div>
        {/* Location badge with pulse */}
        <motion.div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Próximos de Você</span>
        </motion.div>
      </div>

      {/* Search bar */}
      <motion.div
        className="mt-4 relative"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar serviços..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all search-pulse"
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground hover:bg-secondary"
            >
              ×
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Categories grid */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold mb-3">Categorias</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SERVICE_CATEGORIES.map((cat, i) => (
            <div key={cat.id} className="relative">
              <CategoryCard
                category={cat}
                index={i}
                onClick={() => setSelectedCategory(prev => prev === cat.id ? null : cat.id)}
              />
              {selectedCategory === cat.id && (
                <motion.div
                  layoutId="cat-selected-ring"
                  className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none"
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Featured providers carousel */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Profissionais em Destaque
        </h3>
        <FeaturedProviders providers={filteredProviders} />
      </div>

      {/* Filter tabs */}
      <div className="mt-5">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {FILTER_OPTIONS.map((filter) => (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activeFilter === filter.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Provider list */}
      <div className="mt-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredProviders.map((provider, i) => (
            <motion.div
              key={provider.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.04, ...springCard }}
            >
              <div className="relative">
                <ProviderCard provider={provider} index={i} />
                <motion.button
                  onClick={() => toggleFavorite(provider.id)}
                  className="absolute top-2 right-2"
                  whileTap={{ scale: 1.3 }}
                >
                  <Heart
                    className={`h-4 w-4 transition-colors ${favorites.has(provider.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground/40 hover:text-red-400'}`}
                  />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProviders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 text-muted-foreground"
          >
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">Nenhum serviço encontrado</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory(null); setActiveFilter('all') }} className="text-xs text-primary hover:underline mt-1">
              Limpar filtros
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
