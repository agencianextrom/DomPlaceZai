'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
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
    <section className="w-full carousel-gradient-bg carousel-shadow-glow bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent rounded-2xl p-4 sm:p-5 relative overflow-hidden r44-section-bg">
      <div className="flex items-center justify-between mb-3 px-1">
        {/* Section title with animated shimmer gradient text */}
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2.5">
          <span className="relative flex items-center">
            <span className="w-1 h-5 rounded-full bg-primary" />
            <span className="w-3 h-5 rounded-full bg-gradient-to-r from-primary to-accent/50 absolute left-0" />
          </span>
          <motion.span
            className="inline-block carousel-title-shimmer bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent r44-section-header"
            animate={{ backgroundPosition: ['0% center', '200% center'] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear' as const,
            }}
          >
            {title}
          </motion.span>
        </h2>
        <div className="flex items-center gap-1">
          {/* "Ver todos" link with arrow */}
          <button
            onClick={handleViewAll}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors group mr-1 r44-view-all-link"
          >
            <span>Ver todos</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          {/* Scroll buttons with bounce/pulse animation - hidden on lg where grid is shown */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 lg:hidden carousel-arrow-btn carousel-arrow-bounce-left r44-arrow-glow"
            onClick={() => scroll('left')}
          >
            <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.9 }}>
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 lg:hidden carousel-arrow-btn carousel-arrow-bounce-right r44-arrow-glow"
            onClick={() => scroll('right')}
          >
            <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.9 }}>
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Mobile: horizontal carousel with animated gradient fade edges (below lg) */}
      <div className="relative carousel-fade-left lg:hidden r44-fade-left">
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2 snap-x snap-mandatory scroll-smooth r44-scroll-snap"
        >
          {products.map((product, idx) => (
            <div key={product.id} className="snap-start shrink-0 w-[170px] sm:w-[200px]">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 16px 40px -8px oklch(0.45 0.1 155 / 0.18), 0 8px 16px -4px oklch(0 0 0 / 0.1)',
                }}
                transition={{
                  type: 'spring' as const,
                  stiffness: 300,
                  damping: 25,
                }}
                className="rounded-xl carousel-card-hover carousel-card-img-zoom r44-card-lift"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <ProductCard product={product} />
              </motion.div>
            </div>
          ))}
        </div>
        {/* Left gradient fade */}
        <div className="absolute top-0 left-0 bottom-2 w-14 carousel-fade-edge-left pointer-events-none z-10 -ml-4" />
        {/* Right gradient fade */}
        <div className="absolute top-0 right-0 bottom-2 w-14 carousel-fade-edge-right pointer-events-none z-10 -mr-4" />
      </div>

      {/* Desktop: 4-column grid (lg+) */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-3 pb-2">
        {products.slice(0, 8).map((product, idx) => (
          <motion.div
            key={product.id}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 16px 40px -8px oklch(0.45 0.1 155 / 0.18), 0 8px 16px -4px oklch(0 0 0 / 0.1)',
            }}
            transition={{
              type: 'spring' as const,
              stiffness: 300,
              damping: 25,
            }}
            className="rounded-xl carousel-card-hover carousel-card-img-zoom r44-card-lift"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {/* Auto-scroll indicator dots */}
      <div className="flex items-center justify-center gap-1.5 mt-2 lg:hidden">
        {products.slice(0, Math.min(products.length, 6)).map((_, idx) => (
          <button
            key={idx}
            className={`carousel-dot r44-dot ${idx === 0 ? 'carousel-dot-active r44-dot-active' : ''}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      {/* Auto-scroll progress indicator */}
      <div className="r44-progress-track lg:hidden">
        <div className="r44-progress-fill" />
      </div>
    </section>
  )
}
