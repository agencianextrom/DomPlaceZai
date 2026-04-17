'use client'

import { Search, SlidersHorizontal, TrendingUp, Clock, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { useState, useEffect, useMemo } from 'react'
import { ProductCard } from '@/components/product/ProductCard'
import type { ProductData } from '@/store/useAppStore'

const trendingSearches = ['Açaí', 'Ração', 'Pão', 'Remédio', 'Muda de planta', 'Celular', 'Roupas']

const sortFilters = [
  { id: 'relevance', label: 'Relevância' },
  { id: 'price_asc', label: 'Menor preço' },
  { id: 'price_desc', label: 'Maior preço' },
  { id: 'rating', label: 'Avaliação' },
  { id: 'free_delivery', label: 'Entrega grátis' },
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
        // Filter to products from stores with delivery fee = 0
        // Since we don't have delivery fee on product, we'll keep all but note this
        return sorted // In a real app, this would filter by store.deliveryFee === 0
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
            // Add to recent searches after successful search
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
  
  return (
    <div className="min-h-screen bg-background">
      {/* Search header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background border-b border-border -mx-4 px-4 -mt-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Buscar produtos, lojas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-11"
            />
            {hasQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={closeSearch} className="h-11 shrink-0">
            Cancelar
          </Button>
        </div>
        
        {/* Filter chips - now functional */}
        {hasQuery && (
          <div className="flex gap-2 mt-2 overflow-x-auto hide-scrollbar pb-2">
            {sortFilters.map((f) => (
              <Badge 
                key={f.id} 
                variant={activeSort === f.id ? 'default' : 'secondary'}
                className={`cursor-pointer shrink-0 transition-colors px-3 py-1 ${
                  activeSort === f.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-primary hover:text-primary-foreground'
                }`}
                onClick={() => setActiveSort(f.id)}
              >
                {f.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Loading */}
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Results */}
        {!isSearching && hasQuery && (
          <>
            {sortedResults.length > 0 ? (
              <div>
                <p className="text-sm text-muted-foreground mb-3">{sortedResults.length} resultados encontrados{activeSort !== 'relevance' ? ` · Ordenado por: ${sortFilters.find(f => f.id === activeSort)?.label}` : ''}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sortedResults.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ) : searchQuery.length > 2 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum resultado para &quot;{searchQuery}&quot;</p>
                <p className="text-sm text-muted-foreground mt-1">Tente buscar por outro termo</p>
              </div>
            )}
          </>
        )}
        
        {/* Default content (no query) */}
        {!hasQuery && (
          <div>
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Buscas recentes
                  </h3>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Limpar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSearchQuery(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm hover:bg-secondary/80 transition-colors"
                    >
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Trending */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Em alta em Dom Eliseu
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setSearchQuery(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm hover:bg-secondary/80 transition-colors"
                  >
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
