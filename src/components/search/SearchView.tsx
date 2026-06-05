'use client'

import {
  Search, SlidersHorizontal, X, ArrowUpDown, Sparkles, Package,
  Mic, MicOff, Store, TrendingUp, Clock, ChevronRight, Star, Truck, Filter,
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
import { SearchHistory } from '@/components/search/SearchHistory'
import { SmartSearchSuggestions } from '@/components/search/SmartSearchSuggestions'

// Sort filter options
const sortFilters = [
  { id: 'relevance', label: 'Relevância', icon: Sparkles },
  { id: 'price_asc', label: 'Menor preço', icon: ArrowUpDown },
  { id: 'price_desc', label: 'Maior preço', icon: ArrowUpDown },
  { id: 'rating', label: 'Melhor avaliação', icon: Star },
  { id: 'newest', label: 'Mais recente', icon: Clock },
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

// Category filter pills for search (matches homepage CategoryBar)
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
  { id: 'EDUCATION', label: 'Educação', emoji: '📚' },
  { id: 'SPORTS', label: 'Esportes', emoji: '⚽' },
  { id: 'OTHER', label: 'Outros', emoji: '📦' },
]

// Rating filter options
const ratingOptions = [5, 4, 3, 2, 1]

// Framer motion animation variants
const categoryPillVariants = {
  hidden: { opacity: 0, scale: 0.6, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.05,
      type: 'spring' as const,
      stiffness: 450,
      damping: 20,
    },
  }),
}

const suggestionChipVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.08,
      type: 'spring' as const,
      stiffness: 400,
      damping: 18,
    },
  }),
}

const searchHistorySlideVariants = {
  hidden: { opacity: 0, x: 50, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      delay: 0.1 + i * 0.06,
      type: 'spring' as const,
      stiffness: 350,
      damping: 22,
    },
  }),
  exit: { opacity: 0, x: -40, scale: 0.85, transition: { duration: 0.2 } },
}

const resultItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  }),
}

const recentSearchVariants = searchHistorySlideVariants

// Sparkle particle component for empty state
function SparkleParticle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0.5],
        rotate: [0, 180],
      }}
      transition={{
        duration: 2.4,
        delay,
        repeat: Infinity,
        repeatDelay: 0.6,
        ease: 'easeInOut' as const,
      }}
    >
      <Sparkles className="text-amber-400" style={{ width: size, height: size }} />
    </motion.div>
  )
}

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
      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group search-result-hover"
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

/* ─── CSS Keyframes for breathing search glow ─── */
const SEARCH_GLOW_STYLES = `
@keyframes search-breathe-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45), 0 0 24px rgba(16, 185, 129, 0.12), 0 0 48px rgba(16, 185, 129, 0.04); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0), 0 0 32px rgba(16, 185, 129, 0.06), 0 0 56px rgba(16, 185, 129, 0.02); }
}
@keyframes gradient-mesh-drift {
  0%, 100% { background-position: 0% 50%; }
  25% { background-position: 100% 0%; }
  50% { background-position: 100% 100%; }
  75% { background-position: 0% 100%; }
}
@keyframes pill-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes search-border-gradient {
  0%, 100% { --search-border-angle: 0deg; }
  25% { --search-border-angle: 90deg; }
  50% { --search-border-angle: 180deg; }
 75% { --search-border-angle: 270deg; }
}
@keyframes result-card-glow {
  0%, 100% { box-shadow: 0 2px 8px rgba(16, 185, 129, 0); }
  50% { box-shadow: 0 4px 20px rgba(16, 185, 129, 0.12); }
}
.search-input-glow {
  animation: search-breathe-glow 2.5s ease-in-out infinite;
}
.search-input-focused-animated {
  background-image: linear-gradient(var(--search-border-angle, #10b981, #f59e0b, #ec4899, #8b5cf6, #10b981);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  animation: search-border-gradient 3s linear infinite;
}
.search-pill-shimmer {
  background-size: 200% 100%;
  animation: pill-shimmer 2.5s ease-in-out infinite;
}
.search-result-hover:hover {
  animation: result-card-glow 1.5s ease-in-out infinite;
}
.gradient-mesh-bg {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, transparent 30%, rgba(99, 102, 241, 0.04) 50%, transparent 70%, rgba(244, 63, 94, 0.03) 100%);
  background-size: 400% 400%;
  animation: gradient-mesh-drift 15s ease-in-out infinite;
}
`

export function SearchView() {
  const { searchQuery, setSearchQuery, closeSearch, addRecentSearch, removeRecentSearch, recentSearches, clearRecentSearches, openSearch } = useAppStore()
  const [products, setProducts] = useState<ProductData[]>([])
  const [stores, setStores] = useState<StoreData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeSort, setActiveSort] = useState<string>('relevance')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // NEW: Price range filter
  const [priceMin, setPriceMin] = useState<number>(0)
  const [priceMax, setPriceMax] = useState<number>(1000)
  const [activeRatingFilter, setActiveRatingFilter] = useState<number>(0) // 0 = no filter

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (activeCategory) count++
    if (activeSort !== 'relevance') count++
    if (activeRatingFilter > 0) count++
    if (priceMin > 0) count++
    if (priceMax < 1000) count++
    return count
  }, [activeCategory, activeSort, activeRatingFilter, priceMin, priceMax])

  const clearAllFilters = useCallback(() => {
    setActiveCategory(null)
    setActiveSort('relevance')
    setActiveRatingFilter(0)
    setPriceMin(0)
    setPriceMax(1000)
  }, [])

  // Mixed sorted results: products + stores
  const mixedResults = useMemo(() => {
    let sortedProducts = products.map(p => ({ type: 'product' as const, data: p }))

    // Apply price filter
    if (priceMin > 0 || priceMax < 1000) {
      sortedProducts = sortedProducts.filter(p => {
        const price = p.data.price
        return price >= priceMin && price <= priceMax
      })
    }

    // Apply rating filter
    if (activeRatingFilter > 0) {
      sortedProducts = sortedProducts.filter(p => p.data.rating >= activeRatingFilter)
    }

    // Apply sort
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
      case 'newest':
        sortedProducts.sort((a, b) => (b.data.isNew ? 1 : 0) - (a.data.isNew ? 1 : 0))
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
  }, [products, activeSort, activeCategory, priceMin, priceMax, activeRatingFilter])

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
    <div className="min-h-screen pb-24 md:pb-6 bg-background relative">
      {/* Subtle gradient mesh background behind search area */}
      <div className="gradient-mesh-bg absolute inset-0 -z-10" />
      {/* Inject search glow keyframes */}
      <style dangerouslySetInnerHTML={{ __html: SEARCH_GLOW_STYLES }} />

      {/* Search header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4 relative overflow-hidden">
        {/* Gradient mesh orbs */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {/* Animated glow ring behind input on focus */}
            <AnimatePresence>
              {isInputFocused && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: [0.5, 1, 0.5], scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -inset-1 rounded-xl bg-emerald-500/25 blur-md pointer-events-none"
                />
              )}
            </AnimatePresence>
            <Input
              ref={searchInputRef}
              autoFocus
              placeholder="Buscar produtos, lojas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { setIsInputFocused(true); setIsSuggestionsOpen(true) }}
              onBlur={(e) => {
                // Delay to allow click on suggestion item to register
                requestAnimationFrame(() => {
                  setIsInputFocused(false)
                  setIsSuggestionsOpen(false)
                })
              }}
              className={`relative z-10 pl-9 pr-20 h-12 min-h-12 text-base rounded-xl border-2 transition-all duration-300 ${
                isInputFocused
                  ? 'border-transparent shadow-[0_0_0_4px_rgba(16,185,129,0.2),0_0_28px_rgba(16,185,129,0.12),0_0_56px_rgba(16,185,129,0.04)] search-input-glow search-input-focused-animated'
                  : 'border-input hover:border-primary/30'
              }`}
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {/* Voice search button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleVoiceSearch}
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                  isVoiceActive
                    ? 'bg-red-500 text-white animate-pulse r42-voice-btn-active'
                    : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground r42-voice-btn'
                }`}
                title={isVoiceActive ? 'Parar busca por voz' : 'Buscar por voz'}
              >
                {isVoiceActive ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </motion.button>
              {/* Clear search button */}
              <AnimatePresence>
                {hasQuery && (
                  <motion.button
                    initial={{ rotate: -90, scale: 0, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0, opacity: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchQuery('')}
                    className="min-h-[44px] min-w-[44px] h-9 w-9 rounded-full bg-secondary hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* SmartSearchSuggestions dropdown below search input */}
            <SmartSearchSuggestions
              query={searchQuery}
              onSelect={(q) => { setSearchQuery(q); setIsSuggestionsOpen(false) }}
              isOpen={isSuggestionsOpen && !isSearching}
              onClose={() => setIsSuggestionsOpen(false)}
            />
          </div>
          {/* Filter toggle button with active count badge */}
          <Button
            variant={activeFilterCount > 0 ? 'default' : 'outline'}
            size="icon"
            className="h-12 w-12 shrink-0 rounded-xl relative"
            onClick={() => {
              // Scroll to filters section
              const el = document.getElementById('search-filters-section')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <motion.span
                key={activeFilterCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center"
              >
                {activeFilterCount}
              </motion.span>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={closeSearch} className="h-12 shrink-0 text-sm r60-touch-feedback">
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

        {/* Category filter pills with stagger entrance animation */}
        <div className="flex flex-nowrap gap-2 mt-2.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2.5">
          <motion.button
            custom={0}
            variants={categoryPillVariants}
            initial="hidden"
            animate="visible"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08, y: -1 }}
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium border transition-all overflow-hidden relative min-h-[44px] ${
              !activeCategory
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 search-filter-pill-active'
                : 'bg-secondary/70 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground hover:border-border/50'
            }`}
          >
            {!activeCategory && (
              <motion.span
                className="absolute inset-0 rounded-full"
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', backgroundSize: '200% 100%' }}
              />
            )}
            <Sparkles className="h-3 w-3 relative z-10" />
            <span className="relative z-10">Todos</span>
          </motion.button>
          {categoryFilters.map((cat, index) => (
            <motion.button
              key={cat.id}
              custom={index + 1}
              variants={categoryPillVariants}
              initial="hidden"
              animate="visible"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.08, y: -1 }}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium border transition-all overflow-hidden relative min-h-[44px] ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 search-filter-pill-active'
                  : 'bg-secondary/70 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground hover:border-border/50'
              }`}
            >
              {activeCategory === cat.id && (
                <motion.span
                  className="absolute inset-0 rounded-full"
                  animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                  style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', backgroundSize: '200% 100%' }}
                />
              )}
              <span className="text-sm relative z-10">{cat.emoji}</span>
              <span className="hidden sm:inline relative z-10">{cat.label}</span>
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
              <div className="flex gap-2 mt-1 overflow-x-auto scrollbar-hide pb-2">
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
        {/* === NEW: Filters Panel (visible when searching) === */}
        <AnimatePresence>
          {hasQuery && (
            <motion.div
              id="search-filters-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                {/* Price Range Filter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <span>💰</span> Faixa de Preço
                    </p>
                    {(priceMin > 0 || priceMax < 1000) && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => { setPriceMin(0); setPriceMax(1000) }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setPriceMin(0); setPriceMax(1000) } }}
                        className="text-[10px] text-primary hover:underline cursor-pointer"
                      >
                        Limpar
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceMin || ''}
                      onChange={(e) => setPriceMin(Number(e.target.value) || 0)}
                      className="h-8 w-24 text-xs text-center"
                      min={0}
                    />
                    <span className="text-muted-foreground text-xs">—</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceMax < 1000 ? priceMax : ''}
                      onChange={(e) => setPriceMax(Number(e.target.value) || 1000)}
                      className="h-8 w-24 text-xs text-center"
                      min={0}
                    />
                  </div>
                  {/* Visual range bar */}
                  <div className="relative h-2 bg-muted rounded-full mt-2 overflow-hidden">
                    <div
                      className="absolute h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                      style={{
                        left: `${Math.min((priceMin / 1000) * 100, 100)}%`,
                        width: `${Math.max(0, ((priceMax - priceMin) / 1000) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <span>⭐</span> Avaliação Mínima
                    </p>
                    {activeRatingFilter > 0 && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveRatingFilter(0)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveRatingFilter(0) } }}
                        className="text-[10px] text-primary hover:underline cursor-pointer"
                      >
                        Limpar
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {ratingOptions.map((rating) => (
                      <motion.button
                        key={rating}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setActiveRatingFilter(activeRatingFilter === rating ? 0 : rating)}
                        className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          activeRatingFilter === rating
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20'
                            : 'bg-secondary/50 text-muted-foreground border-transparent hover:border-amber-300 hover:text-amber-500'
                        }`}
                      >
                        <Star className={`h-3 w-3 ${rating <= activeRatingFilter ? 'fill-amber-400 text-amber-400' : ''}`} />
                        {rating}+
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Clear All Filters Button */}
                {activeFilterCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={clearAllFilters}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Limpar filtros ({activeFilterCount})
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        {isSearching && (
          <div className="space-y-6 py-4">
            {/* Store result skeletons */}
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 r60-skeleton">
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

        {/* Results with staggered fade-in from below */}
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
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setActiveCategory(null)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveCategory(null) } }}
                          className="ml-1 hover:text-foreground cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" />
                        </div>
                      </Badge>
                    )}
                    {activeSort !== 'relevance' && (
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {sortFilters.find(f => f.id === activeSort)?.label}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setActiveSort('relevance')}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveSort('relevance') } }}
                          className="ml-1 hover:text-foreground cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" />
                        </div>
                      </Badge>
                    )}
                    {activeRatingFilter > 0 && (
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {activeRatingFilter}+ ⭐
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setActiveRatingFilter(0)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveRatingFilter(0) } }}
                          className="ml-1 hover:text-foreground cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" />
                        </div>
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Store results with stagger animation */}
                {!activeCategory && stores.length > 0 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    className="mb-4"
                  >
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5 r60-heading-shimmer">
                      <Store className="h-3.5 w-3.5" />
                      Lojas ({stores.length})
                    </h3>
                    <div className="space-y-2">
                      {stores.map((s, index) => (
                        <motion.div
                          key={s.id}
                          custom={index}
                          variants={resultItemVariants}
                        >
                          <StoreResultCard store={s} onSelect={() => {}} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Product results with stagger animation */}
                {mixedResults.length > 0 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                  >
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5 r60-heading-shimmer">
                      <Package className="h-3.5 w-3.5" />
                      Produtos ({mixedResults.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {mixedResults.map((item, index) => (
                        <motion.div
                          key={item.type === 'product' ? item.data.id : `store-${item.data.id}`}
                          custom={index}
                          variants={resultItemVariants}
                          whileHover={{ y: -4, scale: 1.02 }}
                          transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
                        >
                          <div className="search-result-card-wrapper">
                            <ProductCard product={item.data as ProductData} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : searchQuery.length > 2 ? (
              /* ==============================
                 Animated empty state — bouncing magnifying glass + sparkle effects
                 ============================== */
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="relative w-28 h-28 mx-auto mb-6">
                  {/* Sparkle particles scattered around the magnifying glass */}
                  <SparkleParticle delay={0} x="10%" y="5%" size={14} />
                  <SparkleParticle delay={0.6} x="80%" y="0%" size={10} />
                  <SparkleParticle delay={1.2} x="88%" y="35%" size={12} />
                  <SparkleParticle delay={0.3} x="5%" y="45%" size={8} />
                  <SparkleParticle delay={0.9} x="70%" y="80%" size={11} />
                  <SparkleParticle delay={1.5} x="-5%" y="80%" size={9} />

                  {/* Main magnifying glass container with bounce */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 3, -3, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut' as const,
                    }}
                    className="relative w-28 h-28 mx-auto"
                  >
                    {/* Glass circle */}
                    <motion.div
                      className="absolute top-2 left-2 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/30 border-2 border-emerald-300/50 dark:border-emerald-600/40 flex items-center justify-center shadow-lg"
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.1 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'linear' as const }}
                      >
                        <Sparkles className="h-8 w-8 text-emerald-500/50 dark:text-emerald-400/40" />
                      </motion.div>
                    </motion.div>
                    {/* Magnifying glass handle */}
                    <motion.div
                      className="absolute bottom-0 right-0 w-7 h-4 rounded-b-full rounded-l-sm bg-gradient-to-br from-emerald-400 to-emerald-500 dark:from-emerald-600 dark:to-emerald-700 shadow-md"
                      style={{ transform: 'rotate(-45deg)', transformOrigin: 'top left' }}
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
                    />
                  </motion.div>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground font-medium text-lg"
                >
                  Nenhum resultado para &quot;{searchQuery}&quot;
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="text-sm text-muted-foreground mt-1.5"
                >
                  Tente buscar por outro termo ou categoria
                </motion.p>
                {/* Suggestion chips with stagger animation */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  className="flex items-center justify-center gap-2 mt-5 flex-wrap"
                >
                  {trendingSearches.map((s, idx) => (
                    <motion.button
                      key={s.term}
                      custom={idx}
                      variants={suggestionChipVariants}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setSearchQuery(s.term)}
                      className="px-3 py-1.5 rounded-full bg-secondary/80 text-xs font-medium hover:bg-secondary transition-colors flex items-center gap-1 search-suggestion-chip r42-suggestion-chip"
                    >
                      <span>{s.emoji}</span>
                      {s.term}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}

        {/* Default content (no query) */}
        {!hasQuery && (
          <div className="relative">
            {/* Animated empty state — floating product emojis + pulsing search icon + shimmer text */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center py-10 relative overflow-hidden r42-empty-state-container"
            >
              {/* Floating product emojis */}
              <motion.span
                animate={{ y: [0, -18, 0], x: [0, 6, 0], rotate: [0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
                className="absolute top-0 left-[8%] text-3xl pointer-events-none select-none"
              >🛍️</motion.span>
              <motion.span
                animate={{ y: [0, -14, 0], x: [0, -8, 0], rotate: [0, -12, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute top-2 right-[10%] text-2xl pointer-events-none select-none"
              >🧴</motion.span>
              <motion.span
                animate={{ y: [0, -20, 0], x: [0, 4, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                className="absolute top-[30%] left-[3%] text-xl pointer-events-none select-none"
              >📱</motion.span>
              <motion.span
                animate={{ y: [0, -16, 0], x: [0, -5, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="absolute top-[35%] right-[5%] text-2xl pointer-events-none select-none"
              >👗</motion.span>
              <motion.span
                animate={{ y: [0, -12, 0], x: [0, 10, 0], rotate: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
                className="absolute bottom-4 left-[15%] text-lg pointer-events-none select-none"
              >🔪</motion.span>
              <motion.span
                animate={{ y: [0, -22, 0], x: [0, -6, 0], rotate: [0, -15, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
                className="absolute bottom-2 right-[12%] text-2xl pointer-events-none select-none"
              >💊</motion.span>

              {/* Pulsing search icon */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-emerald-100 dark:from-primary/15 dark:to-emerald-900/20 mx-auto mb-5"
              >
                <Search className="h-9 w-9 text-primary/60" />
                {/* Pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                />
              </motion.div>

              {/* Shimmer text effect */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-bold text-foreground relative inline-block"
              >
                <span className="relative">
                  Busque produtos, lojas e mais
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
                    style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}
                  />
                </span>
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-sm text-muted-foreground mt-1.5"
              >
                Encontre o que precisa em Dom Eliseu
              </motion.p>
            </motion.div>

            {/* SearchHistory component — recent searches cloud + trending */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="mb-6 r62-card-lift"
            >
              <SearchHistory
                onSearch={(q) => setSearchQuery(q)}
                maxItems={8}
                showTrending={true}
                compact={false}
              />
            </motion.div>

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
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
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
