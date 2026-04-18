'use client'

import { Search, SlidersHorizontal, TrendingUp, Clock, X, ArrowUpDown, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { useState, useEffect, useMemo } from 'react'
import { ProductCard } from '@/components/product/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductData } from '@/store/useAppStore'

const trendingSearches = ['Açaí', 'Ração', 'Pão', 'Remédio', 'Muda de planta', 'Celular', 'Roupas']

const sortFilters = [
  { id: 'relevance', label: 'Relevância', icon: Sparkles },
  { id: 'price_asc', label: 'Menor preço', icon: ArrowUpDown },
  { id: 'price_desc', label: 'Maior preço', icon: ArrowUpDown },
  { id: 'rating', label: 'Avaliação', icon: TrendingUp },
  { id: 'free_delivery', label: 'Entrega grátis', icon: Sparkles },
]

export function SearchView() {
  const { searchQuery, setSearchQuery, closeSearch, addRecentSearch, recentSearches, clearRecentSearches } = useAppStore()
  const [results, setResults] = useState<ProductData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeSort, setActiveSort] = useState<string>('relevance')
  
  // Sort/filter the results based on active filter
  const sortedResults = useMemo(() => {
    const sorted = [...results]
    switch (activeSort) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price)
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating)
      case 'free_delivery':
        return sorted
      default:
        return sorted
    }
  }, [results, activeSort])

  // Track searches in recent searches when user stops typing
  useEffect(() => {
    if (searchQuery.length > 2 && !isSearching) {
      const timer = setTimeout(() => {
        addRecentSearch(searchQuery)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, isSearching, addRecentSearch])
  
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true)
        try {
          const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=20`)
          const data = await res.json()
          if (!cancelled) {
            setResults(data.products || [])
            addRecentSearch(searchQuery)
          }
        } catch {
          if (!cancelled) setResults([])
        }
        if (!cancelled) setIsSearching(false)
      } else {
        if (!cancelled) {
          setResults([])
          setIsSearching(false)
        }
      }
    }, 100)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [searchQuery, addRecentSearch])
  
  const hasQuery = searchQuery.length > 0
  const displayedRecentSearches = recentSearches.slice(0, 5)
  
  return (
    <div className="min-h-screen bg-background">
      {/* Search header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Buscar produtos, lojas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-11 search-pulse"
            />
            {hasQuery && (
              <motion.button 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <X className="h-3 w-3" />
              </motion.button>
            )}
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={closeSearch} className="h-11 shrink-0">
            Cancelar
          </Button>
        </div>
        
        {/* Filter chips - animated slide in when search is active */}
        <AnimatePresence>
          {hasQuery && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mt-2.5 overflow-x-auto hide-scrollbar pb-2.5">
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
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                          : 'bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80 hover:text-foreground'
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
        {/* Loading */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse-soft">Buscando...</p>
          </div>
        )}
        
        {/* Results */}
        {!isSearching && hasQuery && (
          <AnimatePresence mode="wait">
            {sortedResults.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{sortedResults.length}</span> resultado{sortedResults.length !== 1 ? 's' : ''} encontrado{sortedResults.length !== 1 ? 's' : ''}
                  </p>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sortedResults.map((p, index) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : searchQuery.length > 2 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground font-medium">Nenhum resultado para &quot;{searchQuery}&quot;</p>
                <p className="text-sm text-muted-foreground mt-1">Tente buscar por outro termo</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {/* Default content (no query) */}
        {!hasQuery && (
          <div>
            {/* Recent searches */}
            {displayedRecentSearches.length > 0 && (
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Buscas recentes
                  </h3>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary"
                  >
                    Limpar tudo
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {displayedRecentSearches.map((s, i) => (
                      <motion.button
                        key={s}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: i * 0.04 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setSearchQuery(s)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-secondary/80 text-sm hover:bg-secondary transition-colors group"
                      >
                        <Clock className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span>{s}</span>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
            
            {/* Trending / Buscas Populares */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
                Buscas populares
                <span className="text-[10px] font-normal text-muted-foreground">em Dom Eliseu</span>
              </h3>
              <div className="space-y-1">
                {trendingSearches.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSearchQuery(s)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/70 transition-colors group"
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-accent/20 text-accent-foreground' :
                      i === 1 ? 'bg-primary/15 text-primary' :
                      i === 2 ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-sm group-hover:text-primary transition-colors">{s}</span>
                    {i < 3 && (
                      <TrendingUp className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
