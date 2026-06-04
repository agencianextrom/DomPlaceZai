'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { resolveProductImage } from '@/lib/product-images'
import { CategoryIcon } from './ProductCard'
import type { ProductData } from '@/store/useAppStore'

interface ProductGalleryProps {
  product: ProductData
  onImageClick?: () => void
}

export function ProductGallery({ product, onImageClick }: ProductGalleryProps) {
  const images = product.images ? JSON.parse(product.images) as string[] : []
  const mainImage = resolveProductImage({ slug: product.slug, category: product.category, images: product.images })
  const allImages = mainImage ? [mainImage, ...images.filter(i => i !== mainImage)] : images
  
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [showThumbnails, setShowThumbnails] = useState(allImages.length > 1)

  const handlePrev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + allImages.length) % allImages.length)
  }, [allImages.length])

  const handleNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % allImages.length)
  }, [allImages.length])

  // Auto-advance every 5s when not zoomed
  useEffect(() => {
    if (isZoomed || allImages.length <= 1) return
    const timer = setInterval(handleNext, 5000)
    return () => clearInterval(timer)
  }, [isZoomed, allImages.length, handleNext])

  // Keyboard navigation
  useEffect(() => {
    if (!isZoomed) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomed(false)
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isZoomed, handlePrev, handleNext])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  // If no images, show gradient fallback
  if (allImages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="aspect-square rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center relative overflow-hidden"
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <CategoryIcon category={product.category} />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3 relative">
      {/* 4 floating ambient particles */}
      <motion.div className="absolute top-2 right-6 w-1.5 h-1.5 rounded-full bg-primary/20 pointer-events-none z-20" animate={{ y: [0, -10, -20], opacity: [0, 0.5, 0], scale: [0.5, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' as const, delay: 0 }} />
      <motion.div className="absolute top-8 left-4 w-1 h-1 rounded-full bg-accent/25 pointer-events-none z-20" animate={{ y: [0, -12, -24], opacity: [0, 0.6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut' as const, delay: 0.8 }} />
      <motion.div className="absolute bottom-12 right-10 w-2 h-2 rounded-full bg-primary/15 pointer-events-none z-20" animate={{ y: [0, -8, -18], opacity: [0, 0.4, 0], scale: [0.6, 0.9, 0.2] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' as const, delay: 1.5 }} />
      <motion.div className="absolute bottom-20 left-8 w-1 h-1 rounded-full bg-accent/20 pointer-events-none z-20" animate={{ y: [0, -14, -28], opacity: [0, 0.5, 0], scale: [0.4, 0.8, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut' as const, delay: 2.2 }} />

      {/* Main image container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative aspect-square rounded-2xl overflow-hidden bg-muted/30 cursor-zoom-in group"
        onClick={() => { setIsZoomed(true); onImageClick?.() }}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={allImages[activeIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
                setShowThumbnails(false)
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); handlePrev() }}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 r17-gallery-arrow-glow"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); handleNext() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 r17-gallery-arrow-glow"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </>
        )}

        {/* Image counter badge */}
        {allImages.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 right-2 h-6 px-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium flex items-center z-10 r17-gallery-counter-pulse"
          >
            {activeIndex + 1}/{allImages.length}
          </motion.div>
        )}

        {/* Zoom indicator */}
        <motion.div
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          whileHover={{ scale: 1.1 }}
        >
          <ZoomIn className="h-4 w-4 text-white" />
        </motion.div>

        {/* Discount badge */}
        {product.comparePrice && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg z-10"
          >
            -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
          </motion.div>
        )}
      </motion.div>

      {/* Thumbnail strip */}
      <AnimatePresence>
        {showThumbnails && allImages.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {allImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative h-16 w-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all r42-thumb-zoom ${
                    idx === activeIndex
                      ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).parentElement!.style.display = 'none'
                    }}
                  />
                  {idx === activeIndex && (
                    <motion.div
                      layoutId="active-thumb"
                      className="absolute inset-0 bg-primary/20 rounded-xl ring-2 ring-primary/30"
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                      animate={{ boxShadow: '0 0 12px oklch(0.45 0.1 155 / 0.3), 0 0 24px oklch(0.45 0.1 155 / 0.15)' }}
                      style={{ boxShadow: '0 0 12px oklch(0.45 0.1 155 / 0.3), 0 0 24px oklch(0.45 0.1 155 / 0.15)' }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom modal overlay */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            {/* Close button */}
            <motion.button
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center z-10"
            >
              <X className="h-5 w-5 text-white" />
            </motion.button>

            {/* Zoomed image with transform origin at mouse position */}
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-full max-h-[80vh] overflow-hidden rounded-xl"
              onClick={(e) => e.stopPropagation()}
              onMouseMove={handleMouseMove}
              style={{ transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }}
            >
              <img
                src={allImages[activeIndex]}
                alt={product.name}
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
                style={{ transform: 'scale(1.5)', cursor: 'crosshair' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />

              {/* Navigation in zoom view */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbnail strip in zoom view */}
            {allImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-black/40 backdrop-blur-sm">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      idx === activeIndex
                        ? 'bg-white scale-125'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
