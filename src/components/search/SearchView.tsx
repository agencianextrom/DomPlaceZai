'use client'

import {
  Search, SlidersHorizontal, X, ArrowUpDown, Sparkles, Package,
  Mic, MicOff, Store, TrendingUp, Clock, ChevronRight, Star, Truck,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeletonGrid } from '@/components/product/ProductCardSkeleton'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductData, StoreData } from '@/store/useAppStore'

// Sort filter options
const sortFilters = [
  { id: 'relevance', label: 'Relevância', icon: Sparkles },
  { id: 'price_asc', label: 'Menor preço', icon: ArrowUpDown },
  { id: 'price_desc', label: 'Maior preço', icon: ArrowUpDown },
  { id: 'rating', label: 'Melhor avaliado', icon: Star },
  { id: 'free_delivery', label: 'Entrega grátis', icon: Truck },
]

// Trending searches specific to Dom Eliseu
const trendingSearches = [
  { term: 'Açaí', emoji: '🍇' },
  { term: 'Ração', emoji: '🐾' },
  { term: 'Farmácia', emoji: '💊' },
  { term: 'Pão', emoji: '🥖' },
  { term: 'Verduras', emoji: '🥬' },
]

// Category filter pills for search
const categoryFilters = [
  { id: 'FOOD', label: 'Alimentação', emoji: '🍛' },
  { id: 'HEALTH', label: 'Saúde', emoji: '💊' },
  { id: 'AGRICULTURE', label: 'Agricultura', emoji: '🌿' },
  { id: 'ELECTRONICS', label: 'Eletrônicos', emoji: '📱' },
  { id: 'BEAUTY', label: 'Beleza', emoji: '💇' },
  { id: 'ANIMALS', label: 'Animais', emoji: '🐾' },
  { id: 'FASHION', label: 'Moda', emoji: '👗' },
  { id: 'SERVICES', label: 'Serviços', emoji: '🔧' },
  { id: 'HOME_GARDEN', label: 'Casa & Jardim', emoji: '🏠' },
]

// Store card in search results
function StoreResultCard({ store, onSelect }: { store: StoreData; onSelect: (s: StoreData) => void }) {
  const { selectStore, navigate } = useAppStore()
  const handleSelect = () => {
    selectStore(store)
    navigate('store')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSelect}
      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Store icon */}
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
        <Store className="h-5 w-5 text-primary/60" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold line-clamp-1">{store.name}</p>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-0 shrink-0">
            Loja
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1">{store.description}</p>
        <div className="flex items-center gap-2 mt-1">
          {store.rating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span className="text-[11px] font-medium">{store.rating}</span>
            </div>
          )}
          <span className="text-[11px] text-muted-foreground">
            {store.deliveryFee === 0 ? 'Entrega grátis' : `Entrega R$${store.deliveryFee.toFixed(2)}`}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
    </motion.div>
  )
}

export function SearchView() {
  const { searchQuery, setSearchQuery, closeSearch, addRecentSearch, removeRecentSearch, recentSearches, clearRecentSearches, openSearch } = useAppStore()
  const [products, setProducts] = useState<ProductData[]>([])
  const [stores, setStores] = useState<StoreData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeSort, setActiveSort] = useState<string>('relevance')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Mixed sorted results: products + stores
  const mixedResults = useMemo(() => {
    const productItems = products.map(p => ({ type: 'product' as const, data: p }))
    const storeItems = stores.map(s => ({ type: 'store' as const, data: s }))

    let sortedProducts = [...productItems]
    switch (activeSort) {
      case 'price_asc':
        sortedProducts.sort((a, b) => a.data.price - b.data.price)
        break
      case 'price_desc':
        sortedProducts.sort((a, b) => b.data.price - a.data.price)
        break
      case 'rating':
        sortedProducts.sort((a, b) => b.data.rating - a.data.rating)
        break
      case 'free_delivery':
        sortedProducts = sortedProducts.filter(p => p.data.freeDeliveryAbove !== null)
        break
    }

    // Filter by category
    if (activeCategory) {
      return sortedProducts.filter(item => item.data.category === activeCategory)
    }

    return sortedProducts
  }, [products, stores, activeSort, activeCategory])

  const totalResults = mixedResults.length + (activeCategory ? 0 : stores.length)

  // Real-time search with 300ms debounce via both APIs
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true)
        try {
          const params = new URLSearchParams()
          params.set('search', searchQuery)
          params.set('limit', '20')
          if (activeCategory) params.set('category', activeCategory)

          const [productsRes, storesRes] = await Promise.all([
            fetch(`/api/products?${params.toString()}`),
            fetch(`/api/stores?search=${encodeURIComponent(searchQuery)}&limit=5`),
          ])
          if (!cancelled) {
            const productsData = await productsRes.json()
            const storesData = await storesRes.json()
            setProducts(productsData.products || [])
            setStores(storesData.stores || [])
            addRecentSearch(searchQuery)
          }
        } catch {
          if (!cancelled) {
            setProducts([])
            setStores([])
          }
        }
        if (!cancelled) setIsSearching(false)
      } else {
        if (!cancelled) {
          setProducts([])
          setStores([])
          setIsSearching(false)
        }
      }
    }, 300)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [searchQuery, activeCategory, addRecentSearch])

  // Voice search with Web Speech API
  const toggleVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Web Speech API not supported - just focus input
      searchInputRef.current?.focus()
      return
    }

    if (isVoiceActive) {
      setIsVoiceActive(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsVoiceActive(true)
    }

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      if (event.results[event.results.length - 1].isFinal) {
        setSearchQuery(transcript.trim())
        setIsVoiceActive(false)
      }
    }

    recognition.onerror = () => {
      setIsVoiceActive(false)
    }

    recognition.onend = () => {
      setIsVoiceActive(false)
    }

    recognition.start()
  }, [isVoiceActive, setSearchQuery])

  const hasQuery = searchQuery.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Search header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              autoFocus
              placeholder="Buscar produtos, lojas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-20 h-12 text-base search-pulse input-focus-ring rounded-xl"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {/* Voice search button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleVoiceSearch}
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                  isVoiceActive
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
                }`}
                title={isVoiceActive ? 'Parar busca por voz' : 'Buscar por voz'}
              >
                {isVoiceActive ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </motion.button>
              {hasQuery && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchQuery('')}
                  className="h-9 w-9 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </div>
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 rounded-xl">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={closeSearch} className="h-12 shrink-0 text-sm">
            Cancelar
          </Button>
        </div>

        {/* Voice search indicator */}
        <AnimatePresence>
          {isVoiceActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 mt-2 px-1">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs text-red-500 font-medium">Ouvindo... Fale o que deseja buscar</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category filter pills below search bar */}
        <div className="flex gap-2 mt-2.5 overflow-x-auto hide-scrollbar pb-2.5">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !activeCategory
                ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                : 'bg-secondary/70 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground hover:border-border/50'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            Todos
          </motion.button>
          {categoryFilters.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                  : 'bg-secondary/70 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground hover:border-border/50'
              }`}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Sort filter chips - animated slide in when search is active */}
        <AnimatePresence>
          {hasQuery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mt-1 overflow-x-auto hide-scrollbar pb-2">
                {sortFilters.map((f, index) => {
                  const FilterIcon = f.icon
                  return (
                    <motion.button
                      key={f.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.25 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setActiveSort(f.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                        activeSort === f.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                          : 'bg-secondary/70 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground hover:border-border/50'
                      }`}
                    >
                      <FilterIcon className="h-3 w-3" />
                      {f.label}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Loading skeleton */}
        {isSearching && (
          <div className="space-y-6 py-4">
            {/* Store result skeletons */}
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                  <div className="h-12 w-12 rounded-xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                    <div className="flex gap-2 mt-1">
                      <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Product card skeletons */}
            <ProductCardSkeletonGrid count={6} />
          </div>
        )}

        {/* Results */}
        {!isSearching && hasQuery && (
          <AnimatePresence mode="wait">
            {totalResults > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Results counter */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{totalResults}</span> resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    {activeCategory && (
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {categoryFilters.find(c => c.id === activeCategory)?.label}
                        <button
                          onClick={() => setActiveCategory(null)}
                          className="ml-1 hover:text-foreground"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    )}
                    {activeSort !== 'relevance' && (
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {sortFilters.find(f => f.id === activeSort)?.label}
                        <button
                          onClick={() => setActiveSort('relevance')}
                          className="ml-1 hover:text-foreground"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Store results */}
                {!activeCategory && stores.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5" />
                      Lojas ({stores.length})
                    </h3>
                    <div className="space-y-2">
                      {stores.map((s) => (
                        <StoreResultCard key={s.id} store={s} onSelect={() => {}} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Product results */}
                {mixedResults.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" />
                      Produtos ({mixedResults.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {mixedResults.map((item, index) => (
                        <motion.div
                          key={item.type === 'product' ? item.data.id : `store-${item.data.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04, duration: 0.3 }}
                        >
                          <ProductCard product={item.data as ProductData} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : searchQuery.length > 2 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                {/* Animated empty state */}
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center"
                  >
                    <Search className="h-8 w-8 text-primary/40" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
                      <Sparkles className="h-3 w-3 text-accent/60" />
                    </div>
                  </motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0"
                  >
                    <div className="absolute bottom-0 right-0">
                      <Package className="h-3 w-3 text-primary/30" />
                    </div>
                  </motion.div>
                </div>
                <p className="text-muted-foreground font-medium">
                  Nenhum resultado para &quot;{searchQuery}&quot;
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente buscar por outro termo ou categoria
                </p>
                {/* Suggestion chips */}
                <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                  {trendingSearches.map((s) => (
                    <motion.button
                      key={s.term}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSearchQuery(s.term)}
                      className="px-3 py-1.5 rounded-full bg-secondary/80 text-xs font-medium hover:bg-secondary transition-colors flex items-center gap-1"
                    >
                      <span>{s.emoji}</span>
                      {s.term}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}

        {/* Default content (no query) */}
        {!hasQuery && (
          <div>
            {/* Recent searches as chips (deletable) */}
            {recentSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Buscas recentes</h3>
                    <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                      {recentSearches.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                    onClick={clearRecentSearches}
                  >
                    <X className="h-3 w-3" />
                    Limpar tudo
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {recentSearches.slice(0, 8).map((term, index) => (
                      <motion.button
                        key={term}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 20 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSearchQuery(term)}
                        className="group shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-secondary/50 text-sm font-medium hover:bg-secondary transition-colors"
                      >
                        <Clock className="h-3 w-3 text-muted-foreground/60" />
                        <span>{term}</span>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            removeRecentSearch(term)
                          }}
                          className="h-4 w-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity"
                        >
                          <X className="h-2.5 w-2.5" />
                        </motion.button>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Trending / Popular searches */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex items-center gap-1.5 mb-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <TrendingUp className="h-4 w-4 text-primary" />
                </motion.div>
                <h3 className="text-sm font-semibold">Populares em Dom Eliseu</h3>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {trendingSearches.map((item, index) => (
                  <motion.button
                    key={item.term}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.05, duration: 0.25 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSearchQuery(item.term)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/70 transition-colors group"
                  >
                    <span
                      className={`
                        w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                        ${index === 0
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-500/20'
                          : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm'
                            : index === 2
                              ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-sm'
                              : 'bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      {index + 1}
                    </span>
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {item.term}
                    </span>
                    {index < 3 && (
                      <Sparkles className="h-3 w-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Recently viewed */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                Vistos recentemente
              </h3>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
                {[
                  { name: 'Açaí 500ml', store: 'Açaí da Boa' },
                  { name: 'Pão Francês', store: 'Padaria Pão Quente' },
                  { name: 'Ração Premium', store: 'Agropecuária SP' },
                ].map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 0.6, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="shrink-0 w-28"
                  >
                    <div className="h-28 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 flex flex-col items-center justify-center gap-1.5 p-2">
                      <Package className="h-6 w-6 text-primary/30" />
                      <p className="text-[10px] font-medium text-center line-clamp-2 leading-tight">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground">{item.store}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
