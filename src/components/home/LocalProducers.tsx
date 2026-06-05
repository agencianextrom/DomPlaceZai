'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Star, Package, TrendingUp, ChevronRight, Sprout, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ─── Types ────────────────────────────────────────────────────────────────
interface Producer {
  id: string
  name: string
  initials: string
  specialty: string
  emoji: string
  category: string
  location: string
  distance: number
  rating: number
  productsCount: number
  gradient: string
}

type SortKey = 'rating' | 'distance' | 'products'

// ─── Mock Data ─────────────────────────────────────────────────────────────
const producers: Producer[] = [
  { id: 'pr1', name: 'Dona Maria Silva', initials: 'MS', specialty: 'Frutas tropicais orgânicas', emoji: '🥭', category: 'Frutas', location: 'Sítio São José', distance: 3.2, rating: 4.9, productsCount: 18, gradient: 'from-orange-400 to-amber-500' },
  { id: 'pr2', name: 'Seu Antônio Ferreira', initials: 'AF', specialty: 'Hortaliças frescas', emoji: '🥬', category: 'Verduras', location: 'Chácara Boa Vista', distance: 5.1, rating: 4.7, productsCount: 24, gradient: 'from-green-400 to-emerald-500' },
  { id: 'pr3', name: 'Fazenda Esperança', initials: 'FE', specialty: 'Queijos artesanais', emoji: '🧀', category: 'Laticínios', location: 'Rod. PA-279, Km 8', distance: 12.4, rating: 4.8, productsCount: 12, gradient: 'from-yellow-400 to-orange-400' },
  { id: 'pr4', name: 'Frigorífico Pará', initials: 'FP', specialty: 'Carnes nobres', emoji: '🥩', category: 'Carnes', location: 'Zona Rural Norte', distance: 8.7, rating: 4.6, productsCount: 15, gradient: 'from-red-400 to-rose-500' },
  { id: 'pr5', name: 'Artesanato Raízes', initials: 'AR', specialty: 'Produtos artesanais regionais', emoji: '🏺', category: 'Artesanato', location: 'Centro, Rua Pará', distance: 0.5, rating: 4.9, productsCount: 32, gradient: 'from-purple-400 to-violet-500' },
  { id: 'pr6', name: 'Apiário Dom Eliseu', initials: 'AD', specialty: 'Mel puro e derivados', emoji: '🍯', category: 'Mel', location: 'Sítio Abelhas', distance: 7.3, rating: 5.0, productsCount: 8, gradient: 'from-amber-400 to-yellow-500' },
  { id: 'pr7', name: 'Padaria Pão da Terra', initials: 'PT', specialty: 'Pães artesanais e bolos', emoji: '🍞', category: 'Panificação', location: 'Av. Brasil, 120', distance: 1.2, rating: 4.8, productsCount: 21, gradient: 'from-amber-300 to-orange-400' },
  { id: 'pr8', name: 'Ervas da Amazônia', initials: 'EA', specialty: 'Ervas medicinais e chás', emoji: '🌿', category: 'Ervas', location: 'Feira Livre, Barraca 4', distance: 0.8, rating: 4.7, productsCount: 14, gradient: 'from-teal-400 to-green-500' },
]

const categories = ['Todos', 'Frutas', 'Verduras', 'Laticínios', 'Carnes', 'Artesanato', 'Mel', 'Panificação', 'Ervas'] as const

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'Avaliação' },
  { key: 'distance', label: 'Distância' },
  { key: 'products', label: 'Produtos' },
]

const stats = [
  { value: producers.length, label: 'Produtores locais', icon: Sprout, color: 'text-emerald-500' },
  { value: 4.9, label: 'km médio', icon: MapPin, color: 'text-blue-500', suffix: '' },
  { value: 78, label: '% produtos locais', icon: TrendingUp, color: 'text-amber-500', suffix: '%' },
]

// ─── Component ─────────────────────────────────────────────────────────────
export function LocalProducers() {
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [sortBy, setSortBy] = useState<SortKey>('rating')

  const filteredProducers = useMemo(() => {
    let list = activeCategory === 'Todos'
      ? [...producers]
      : producers.filter(p => p.category === activeCategory)

    switch (sortBy) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      case 'distance':
        list.sort((a, b) => a.distance - b.distance)
        break
      case 'products':
        list.sort((a, b) => b.productsCount - a.productsCount)
        break
    }
    return list
  }, [activeCategory, sortBy])

  const cycleSort = useCallback(() => {
    const order: SortKey[] = ['rating', 'distance', 'products']
    const idx = order.indexOf(sortBy)
    setSortBy(order[(idx + 1) % order.length])
  }, [sortBy])

  return (
    <section className="r33-producers-section r62-heading-gradient">
      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
        className="mb-6"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-5 r33-stats-banner">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-4 text-4xl">🌱</div>
            <div className="absolute bottom-2 right-4 text-4xl">🌾</div>
            <div className="absolute top-1 right-1/3 text-3xl">🌻</div>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
            <Heart className="h-5 w-5 fill-white" />
            Apoie o Local
          </h2>
          <p className="text-emerald-100 text-xs mb-3">Conheça os produtores da nossa região</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1, type: 'spring' as const, stiffness: 300, damping: 20 }}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"
              >
                <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
                <p className="text-white text-lg font-bold">{stat.value}{stat.suffix}</p>
                <p className="text-emerald-100 text-[10px] leading-tight">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sprout className="h-5 w-5 text-emerald-500" />
          Produtores Locais
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={cycleSort}
          className="h-8 min-h-[44px] text-xs gap-1 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        >
          {sortOptions.find(s => s.key === sortBy)?.label}
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-4">
        <AnimatePresence mode="popLayout">
          {categories.map((cat, i) => {
            const isActive = activeCategory === cat
            return (
              <motion.button
                key={cat}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: i * 0.03, type: 'spring' as const, stiffness: 400, damping: 25 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all r33-cat-pill ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-card text-muted-foreground border-border hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                {cat}
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Producer Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredProducers.map((producer, idx) => (
            <motion.div
              key={producer.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ delay: idx * 0.06, type: 'spring' as const, stiffness: 280, damping: 22 }}
              whileHover={{ y: -6, transition: { type: 'spring' as const, stiffness: 400, damping: 20 } }}
              className="r33-producer-card r62-card-lift group"
            >
              <div className="relative rounded-2xl border border-border/60 bg-card overflow-hidden r33-card-glow">
                {/* Gradient top bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${producer.gradient}`} />

                <div className="p-4">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`h-12 w-12 rounded-full bg-gradient-to-br ${producer.gradient} flex items-center justify-center text-white font-bold text-sm shadow-md r33-avatar-ring`}
                    >
                      {producer.initials}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{producer.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="text-base">{producer.emoji}</span>
                        <span className="truncate">{producer.specialty}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="secondary" className="text-[10px] gap-0.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      {producer.rating.toFixed(1)}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] gap-0.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/30">
                      <MapPin className="h-2.5 w-2.5" />
                      {producer.distance.toFixed(1)} km
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] gap-0.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30">
                      <Package className="h-2.5 w-2.5" />
                      {producer.productsCount} prod.
                    </Badge>
                  </div>

                  {/* Location */}
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="h-3 w-3" />
                    {producer.location}
                  </p>

                  {/* Category */}
                  <Badge className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20 mb-3">
                    {producer.category}
                  </Badge>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs gap-1 border-primary/30 hover:bg-primary/5 r33-btn-hover"
                    >
                      Ver Produtos
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 min-h-[44px] text-xs px-3 bg-emerald-600 hover:bg-emerald-700 text-white r33-btn-glow"
                    >
                      Encomendar
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filteredProducers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm font-medium text-muted-foreground">
            Nenhum produtor encontrado na categoria &quot;{activeCategory}&quot;
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => setActiveCategory('Todos')}
            className="mt-2 text-emerald-600"
          >
            Ver todos os produtores
          </Button>
        </motion.div>
      )}
    </section>
  )
}
