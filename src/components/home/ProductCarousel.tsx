'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeletonCarousel } from '@/components/product/ProductCardSkeleton'
import { useAppStore, type ProductData } from '@/store/useAppStore'

interface ProductCarouselProps {
  title: string
  products: ProductData[]
  viewAll?: () => void
  isLoading?: boolean
}

export function ProductCarousel({ title, products, viewAll, isLoading }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { openSearch, navigate } = useAppStore()
  
  const handleViewAll = viewAll || (() => {
    openSearch()
    navigate('search')
  })
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 280
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }
  
  if (!products.length && !isLoading) return null
  
  // Show skeletons while loading
  if (isLoading) {
    return (
      <section className="w-full">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2.5">
            <span className="relative flex items-center">
              <span className="w-1 h-5 rounded-full bg-primary" />
              <span className="w-3 h-5 rounded-full bg-gradient-to-r from-primary to-accent/50 absolute left-0" />
            </span>
            {title}
          </h2>
        </div>
        <ProductCardSkeletonCarousel count={4} />
      </section>
    )
  }
  
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        {/* Section title with decorative accent */}
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2.5">
          <span className="relative flex items-center">
            <span className="w-1 h-5 rounded-full bg-primary" />
            <span className="w-3 h-5 rounded-full bg-gradient-to-r from-primary to-accent/50 absolute left-0" />
          </span>
          {title}
        </h2>
        <div className="flex items-center gap-1">
          {/* "Ver todos" link with arrow */}
          <button
            onClick={handleViewAll}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors group mr-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          {/* Scroll buttons - hidden on lg where grid is shown */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile: horizontal carousel with gradient fade edges (below lg) */}
      <div className="relative carousel-fade-left lg:hidden">
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2 snap-x snap-mandatory"
        >
          {products.map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-[170px] sm:w-[200px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        {/* Left gradient fade */}
        <div className="absolute top-0 left-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 -ml-4" />
      </div>

      {/* Desktop: 4-column grid (lg+) */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-3 pb-2">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
