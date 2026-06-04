'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Star, Clock, Truck, Heart, ChevronDown, Store as StoreIcon, MapPin, Package, X, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type StoreData } from '@/store/useAppStore'

// Category labels for store categories
const categoryLabels: Record<string, string> = {
  FOOD: 'Alimentação',
  HEALTH: 'Saúde',
  AGRICULTURE: 'Agricultura',
  ELECTRONICS: 'Eletrônicos',
  BEAUTY: 'Beleza',
  ANIMALS: 'Animais',
  FASHION: 'Moda',
  SERVICES: 'Serviços',
  HOME_GARDEN: 'Casa & Jardim',
  EDUCATION: 'Educação',
  SPORTS: 'Esportes',
  OTHER: 'Outros',
}

const categoryEmojis: Record<string, string> = {
  FOOD: '🍽️',
  HEALTH: '💊',
  AGRICULTURE: '🌿',
  ELECTRONICS: '📱',
  BEAUTY: '💅',
  ANIMALS: '🐾',
  FASHION: '👗',
  SERVICES: '🔧',
  HOME_GARDEN: '🏡',
  EDUCATION: '📚',
  SPORTS: '⚽',
  OTHER: '📦',
}

type SortOption = 'rating' | 'fee' | 'delivery' | 'products'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'rating', label: 'Melhor avaliação' },
  { value: 'fee', label: 'Menor taxa' },
  { value: 'delivery', label: 'Entrega mais rápida' },
  { value: 'products', label: 'Mais produtos' },
]

interface StoreDirectoryProps {
  stores: StoreData[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

export function StoreDirectory({ stores }: StoreDirectoryProps) {
  const { selectStore, navigate, toggleFavoriteStore, isFavoriteStore } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('rating')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Derive categories from stores
  const categories = useMemo(() => {
    const cats = new Set(stores.map(s => s.category))
    return Array.from(cats)
  }, [stores])

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    let result = stores

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.neighborhood?.toLowerCase().includes(q)
      )
    }

    // Category filter
    if (activeCategory) {
      result = result.filter(s => s.category === activeCategory)
    }

    // Sort
    const sorted = [...result]
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case 'fee':
        sorted.sort((a, b) => a.deliveryFee - b.deliveryFee)
        break
      case 'delivery':
        sorted.sort((a, b) => {
          const aClose = a.deliveryFee <= 0 ? 0 : 1
          const bClose = b.deliveryFee <= 0 ? 0 : 1
          return aClose - bClose
        })
        break
      case 'products':
        sorted.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
        break
    }
    return sorted
  }, [stores, searchQuery, activeCategory, sortBy])

  const formatBRL = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const handleViewStore = useCallback(
    (store: StoreData) => {
      selectStore(store)
      navigate('store')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [selectStore, navigate]
  )

  return (
    <div className="space-y-5">
      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 flex-wrap"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <StoreIcon className="h-5 w-5 text-primary" />
          </motion.div>
          <h2 className="text-lg font-bold r18-header-shimmer r30-dir-shimmer">Lojas</h2>
        </div>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <Badge variant="secondary" className="text-xs bg-primary/5 text-primary border-primary/15 r18-stats-badge-pulse r30-stats-pulse">
          {filteredStores.length} {filteredStores.length === 1 ? 'loja' : 'lojas'} em Dom Eliseu
        </Badge>
      </motion.div>
      </motion.div>

      {/* Search Input */}
      <motion.div
        className="relative"
        animate={isSearchFocused ? { scale: 1.02 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className={`relative rounded-xl border-2 transition-colors duration-300 ${
          isSearchFocused
            ? 'border-primary/60 shadow-lg shadow-primary/10'
            : 'border-border/60 hover:border-primary/30'
        }`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar lojas por nome, categoria ou bairro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full pl-10 pr-10 py-3 bg-card text-sm rounded-xl outline-none placeholder:text-muted-foreground/60"
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </motion.button>
          )}
        </div>
        {/* Animated focus glow */}
        <AnimatePresence>
          {isSearchFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-xl border-2 border-primary/30 -z-10 blur-sm r18-search-glow"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
            !activeCategory
              ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 r18-pill-breathing r30-filter-pill'
              : 'bg-card text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground'
          }`}
        >
          Todas ({stores.length})
        </motion.button>
        {categories.map(cat => {
          const count = stores.filter(s => s.category === cat).length
          return (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
                cat === activeCategory
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 r30-filter-pill'
                  : 'bg-card text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground'
              }`}
            >
              <span>{categoryEmojis[cat] || '📦'}</span>
              {categoryLabels[cat] || cat}
              <span className="opacity-70">({count})</span>
            </motion.button>
          )
        })}
      </div>

      {/* Sort Dropdown + Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filteredStores.length} {filteredStores.length === 1 ? 'resultado' : 'resultados'}
          {activeCategory && ` em ${categoryLabels[activeCategory] || activeCategory}`}
          {searchQuery && ` para "${searchQuery}"`}
        </p>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-primary/20"
            onClick={() => {
              const idx = sortOptions.findIndex(o => o.value === sortBy)
              setSortBy(sortOptions[(idx + 1) % sortOptions.length].value)
            }}
          >
            <ArrowUpDown className="h-3 w-3 text-primary" />
            {sortOptions.find(o => o.value === sortBy)?.label}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </div>
      </div>

      {/* Store Cards Grid */}
      {filteredStores.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredStores.map((store) => (
              <motion.div
                key={store.id}
                variants={cardVariants}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <motion.div
                  whileHover={{ y: -4, boxShadow: '0 12px 40px -8px rgba(0,0,0,0.15)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative bg-card rounded-xl border border-border/50 overflow-hidden group cursor-pointer r18-store-card-glow r30-card-hover"
                  onClick={() => handleViewStore(store)}
                >
                  {/* Cover gradient */}
                  <div className="relative h-20 bg-gradient-to-br from-primary/10 via-emerald-50 to-amber-50 dark:from-primary/5 dark:via-emerald-950/20 dark:to-amber-950/20">
                    <div className="absolute inset-0 opacity-[0.06]" style={{
                      backgroundImage: 'linear-gradient(rgba(0,0,0,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.2) 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }} />
                    {/* Category badge */}
                    <div className="absolute top-2 left-2">
                      <span className="text-lg">{categoryEmojis[store.category] || '📦'}</span>
                    </div>
                    {/* Favorite toggle */}
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavoriteStore(store.id)
                      }}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-card transition-colors z-10"
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          isFavoriteStore(store.id)
                            ? 'text-red-500 fill-red-500'
                            : 'text-muted-foreground/60'
                        }`}
                      />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Store logo + name */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                        {store.logo ? (
                          <img src={store.logo} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-primary">
                            {store.name[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {store.name}
                        </h3>
                        {store.neighborhood && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-muted-foreground/60" />
                            <span className="text-[10px] text-muted-foreground">{store.neighborhood}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-full px-2 py-0.5">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                          {store.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        ({store.totalReviews} {store.totalReviews === 1 ? 'avaliação' : 'avaliações'})
                      </span>
                    </div>

                    {/* Info row */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <span>{store.deliveryFee === 0 ? 'Grátis' : formatBRL(store.deliveryFee)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{store.opensAt}–{store.closesAt}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>{store.totalSales || 0} itens</span>
                      </div>
                    </div>

                    {/* Ver loja button */}
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <Button
                        size="sm"
                        className="w-full h-9 text-xs bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded-lg font-medium"
                      >
                        Ver loja
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mb-6"
          >
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 flex items-center justify-center">
              <StoreIcon className="h-10 w-10 text-primary/40" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-3 rounded-full border border-dashed border-primary/15"
            />
          </motion.div>
          <h3 className="text-lg font-bold mb-2">Nenhuma loja encontrada</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            {searchQuery
              ? `Não encontramos lojas para "${searchQuery}". Tente outro termo.`
              : 'Nenhuma loja nesta categoria no momento.'}
          </p>
          <div className="flex gap-2">
            {searchQuery && (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={() => setSearchQuery('')}
                >
                  Limpar busca
                </Button>
              </motion.div>
            )}
            {activeCategory && (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={() => setActiveCategory(null)}
                >
                  Ver todas as categorias
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
