'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Star, Clock, Truck, Store, ChevronRight, Filter, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type StoreData } from '@/store/useAppStore'

const categoryLabels: Record<string, string> = {
  FOOD: 'Alimentação', HEALTH: 'Saúde', AGRICULTURE: 'Agricultura', ELECTRONICS: 'Eletrônicos',
  BEAUTY: 'Beleza', ANIMALS: 'Animais', FASHION: 'Moda', SERVICES: 'Serviços',
  HOME_GARDEN: 'Casa & Jardim', EDUCATION: 'Educação', SPORTS: 'Esportes', OTHER: 'Outros',
}

const categoryColors: Record<string, string> = {
  FOOD: 'bg-orange-100 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300',
  HEALTH: 'bg-rose-100 dark:bg-rose-900/10 text-rose-700 dark:text-rose-300',
  AGRICULTURE: 'bg-green-100 dark:bg-green-900/10 text-green-700 dark:text-green-300',
  ELECTRONICS: 'bg-cyan-100 dark:bg-cyan-900/10 text-cyan-700 dark:text-cyan-300',
  BEAUTY: 'bg-pink-100 dark:bg-pink-900/10 text-pink-700 dark:text-pink-300',
  ANIMALS: 'bg-amber-100 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300',
  FASHION: 'bg-purple-100 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300',
  SERVICES: 'bg-teal-100 dark:bg-teal-900/10 text-teal-700 dark:text-teal-300',
  HOME_GARDEN: 'bg-emerald-100 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300',
  EDUCATION: 'bg-blue-100 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300',
  SPORTS: 'bg-red-100 dark:bg-red-900/10 text-red-700 dark:text-red-300',
  OTHER: 'bg-gray-100 dark:bg-gray-800/10 text-gray-700 dark:text-gray-300',
}

type SortOption = 'relevance' | 'rating' | 'delivery_fee'

export function StoreSearch({ stores }: { stores: StoreData[] }) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openOnly, setOpenOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Check if store is currently open
  const isStoreOpen = (store: StoreData) => {
    if (!store.opensAt || !store.closesAt) return true
    const now = new Date()
    const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Belem' }))
    const hours = brasiliaTime.getHours()
    const minutes = brasiliaTime.getMinutes()
    const currentMinutes = hours * 60 + minutes
    const [openH, openM] = store.opensAt.split(':').map(Number)
    const [closeH, closeM] = store.closesAt.split(':').map(Number)
    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM
    const dayOfWeek = brasiliaTime.getDay() || 7
    const openDays = store.openDays?.split(',').map(Number) || [1,2,3,4,5,6,7]
    return openDays.includes(dayOfWeek) && currentMinutes >= openMinutes && currentMinutes < closeMinutes
  }

  const filtered = useMemo(() => {
    let result = [...stores]

    // Search filter
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(s =>
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

    // Open only filter
    if (openOnly) {
      result = result.filter(s => isStoreOpen(s))
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'delivery_fee':
        result.sort((a, b) => a.deliveryFee - b.deliveryFee)
        break
    }

    return result
  }, [stores, query, activeCategory, openOnly, sortBy])

  // Get unique categories from stores
  const categories = useMemo(() => {
    const cats = new Set(stores.map(s => s.category))
    return Array.from(cats).sort()
  }, [stores])

  const sortLabels: Record<SortOption, string> = {
    relevance: 'Relevância',
    rating: 'Melhor avaliação',
    delivery_fee: 'Menor frete',
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          Encontrar Lojas
        </h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${showFilters ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/30'}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros
        </motion.button>
      </div>

      {/* Search input with glassmorphism */}
      <motion.div
        className="relative glassmorphism-strong rounded-xl overflow-hidden"
        animate={{ boxShadow: isSearchFocused
          ? '0 0 0 3px oklch(0.45 0.1 155 / 0.2), 0 8px 24px oklch(0 0 0 / 0.08)'
          : '0 2px 8px oklch(0 0 0 / 0.04)'
        }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
      >
        {/* Pulsing search icon with gradient ring */}
        <motion.div
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
          animate={isSearchFocused
            ? { scale: [1, 1.15, 1], opacity: 1 }
            : { scale: 1, opacity: 0.7 }
          }
          transition={{ duration: 0.8, repeat: isSearchFocused ? Infinity : 0, ease: 'easeInOut' }}
        >
          <div className="relative">
            <Search className={`h-4 w-4 ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'} transition-colors`} />
            {isSearchFocused && (
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                style={{ background: 'conic-gradient(from 0deg, oklch(0.45 0.1 155 / 0.3), oklch(0.78 0.16 70 / 0.3), oklch(0.45 0.1 155 / 0.3))' }}
              />
            )}
          </div>
        </motion.div>
        <Input
          placeholder="Buscar por nome, categoria ou bairro..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="pl-10 h-10 bg-transparent border-0 focus-visible:ring-0 store-search-expand store-search-shimmer"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-card border border-border/50 space-y-3">
              {/* Category filters */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Categorias</p>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${!activeCategory ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
                  >
                    Todas ({stores.length})
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${cat === activeCategory ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
                    >
                      {categoryLabels[cat] || cat} ({stores.filter(s => s.category === cat).length})
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Open only toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium">Lojas abertas agora</span>
                </div>
                <Switch checked={openOnly} onCheckedChange={setOpenOnly} />
              </div>

              <Separator className="bg-border/30" />

              {/* Sort */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ordenar por</p>
                <div className="flex gap-1.5">
                  {(Object.keys(sortLabels) as SortOption[]).map((opt, optIdx) => (
                    <motion.button
                      key={opt}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 + optIdx * 0.05, type: 'spring' as const, stiffness: 350, damping: 20 }}
                      onClick={() => setSortBy(opt)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${sortBy === opt ? 'bg-primary/10 text-primary border-primary/30' : 'border-border text-muted-foreground hover:border-primary/30'}`}
                    >
                      {sortLabels[opt]}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <motion.p
          key={filtered.length}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
          className="text-xs text-muted-foreground"
        >
          {filtered.length} loja{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          {(query || activeCategory || openOnly) && (
            <button onClick={() => { setQuery(''); setActiveCategory(null); setOpenOnly(false) }} className="text-primary hover:underline ml-1">
              Limpar filtros
            </button>
          )}
        </motion.p>
      </div>

      {/* Store list */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((store, i) => {
            const open = isStoreOpen(store)
            return (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2 }}
                className="p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group card-premium-hover"
                onClick={() => {
                  useAppStore.getState().selectStore(store)
                  useAppStore.getState().navigate('store')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                {/* Store header */}
                <div className="flex items-start gap-3">
                  <div className={`h-11 w-11 rounded-xl ${categoryColors[store.category] || 'bg-muted'} flex items-center justify-center shrink-0 text-sm font-bold`}>
                    {store.name.charAt(0)}{store.name.split(' ').pop()?.charAt(0) || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">{store.name}</p>
                      {open ? (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot shrink-0" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-medium">{store.rating}</span>
                      <span className="text-[10px] text-muted-foreground">({store.totalReviews})</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>

                {/* Info */}
                <div className="mt-2.5 flex items-center gap-3">
                  <Badge variant="secondary" className={`text-[9px] px-1.5 ${categoryColors[store.category] || ''}`}>
                    {categoryLabels[store.category] || store.category}
                  </Badge>
                  <span className={`text-[10px] font-medium ${open ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {open ? 'Aberto' : 'Fechado'}
                  </span>
                </div>

                {/* Delivery info */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Truck className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {store.deliveryFee === 0 ? 'Frete grátis' : formatFee(store.deliveryFee)}
                    </span>
                  </div>
                  {store.freeDeliveryAbove && (
                    <span className="text-[9px] text-primary">Grátis acima de {formatFee(store.freeDeliveryAbove)}</span>
                  )}
                </div>

                {/* Address */}
                {store.address && (
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="line-clamp-1">{store.address}{store.neighborhood ? `, ${store.neighborhood}` : ''}</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Store className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma loja encontrada</p>
          <button onClick={() => { setQuery(''); setActiveCategory(null); setOpenOnly(false) }} className="text-xs text-primary hover:underline mt-1">
            Limpar filtros
          </button>
        </div>
      )}

      {/* Map placeholder */}
      <div className="h-40 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 flex items-center justify-center relative overflow-hidden border border-border/30">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        {/* Fake map markers */}
        {filtered.slice(0, 4).map((store, i) => (
          <motion.div
            key={store.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="absolute"
            style={{
              top: `${20 + i * 18}%`,
              left: `${15 + (i * 22) + (i % 2) * 8}%`,
            }}
          >
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg pulse-dot">
              <Store className="h-3.5 w-3.5 text-white" />
            </div>
          </motion.div>
        ))}
        <div className="text-center relative z-10 mt-8">
          <MapPin className="h-6 w-6 text-primary/50 mx-auto" />
          <p className="text-[10px] text-muted-foreground mt-1">Mapa de lojas em Dom Eliseu</p>
        </div>
      </div>
    </section>
  )
}

function formatFee(fee: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fee)
}
