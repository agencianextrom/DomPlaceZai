'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface HeroBannerProps {
  banners: { id: string; title: string; subtitle: string | null; image: string; gradient: string }[]
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  
  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length)
  }, [banners.length])
  
  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])
  
  useEffect(() => {
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next])
  
  if (!banners.length) return null
  
  const banner = banners[current]
  
  return (
    <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          className={`relative w-full h-44 sm:h-56 md:h-64 lg:h-72 ${banner.gradient} flex items-center`}
        >
          <div className="relative z-10 p-5 sm:p-8 max-w-lg">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-md">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="text-sm sm:text-base text-white/90 mt-2 drop-shadow-sm">
                {banner.subtitle}
              </p>
            )}
            <Button className="mt-4 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
              Ver Ofertas
            </Button>
          </div>
          {/* Decorative shapes */}
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-20">
            <div className="absolute right-10 top-10 w-32 h-32 rounded-full bg-white/30" />
            <div className="absolute right-0 bottom-0 w-48 h-48 rounded-full bg-white/20" />
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/20 hover:bg-black/40 text-white border-0 rounded-full"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/20 hover:bg-black/40 text-white border-0 rounded-full"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
      
      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
