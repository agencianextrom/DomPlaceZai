'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/ProductCard'
import type { ProductData } from '@/store/useAppStore'

interface ProductCarouselProps {
  title: string
  products: ProductData[]
  viewAll?: () => void
}

export function ProductCarousel({ title, products, viewAll }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 280
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }
  
  if (!products.length) return null
  
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
          {viewAll && (
            <Button variant="ghost" size="sm" onClick={viewAll} className="text-primary text-sm h-8 px-3 hover:bg-primary/10">
              Ver todos
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => scroll('left')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => scroll('right')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel with gradient fade edges */}
      <div className="relative carousel-fade-left">
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
    </section>
  )
}
