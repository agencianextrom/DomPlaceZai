'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryIcon } from './ProductCard'
import { resolveProductImage, productImageMap } from '@/lib/product-images'

const gradients = [
  'from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30',
  'from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30',
  'from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30',
  'from-rose-100 to-pink-200 dark:from-rose-900/30 dark:to-pink-800/30',
  'from-lime-100 to-green-200 dark:from-lime-900/30 dark:to-green-800/30',
]

interface ProductGalleryProps {
  images?: string[]
  productName?: string
  category?: string
  count?: number
  productSlug?: string
}

export function ProductGallery({ images, productName, category, count = 5, productSlug }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [swipeDir, setSwipeDir] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate gallery images: real images, slug-based map, or placeholders
  const galleryImages = (() => {
    // 1. Real images from product.images field
    if (images && images.length > 0) return images

    // 2. Slug-based mapping from productImageMap
    if (productSlug && productImageMap[productSlug]) {
      return [productImageMap[productSlug]]
    }

    // 3. Fallback placeholders
    return Array.from({ length: count }, (_, i) => `placeholder-${i}`)
  })()

  const gradientForIndex = (idx: number) => gradients[idx % gradients.length]

  const goNext = useCallback(() => {
    setSwipeDir(1)
    setZoomLevel(1)
    setActiveIndex(prev => (prev + 1) % galleryImages.length)
  }, [galleryImages.length])

  const goPrev = useCallback(() => {
    setSwipeDir(-1)
    setZoomLevel(1)
    setActiveIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length)
  }, [galleryImages.length])

  const handleSwipe = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) goNext()
    else if (info.offset.x > 60) goPrev()
  }

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'Escape') {
        setLightboxOpen(false)
        setZoomLevel(1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, goNext, goPrev])

  // Zoom level reset is handled in goNext, goPrev, and thumbnail click handlers

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  const renderPlaceholderContent = (idx: number) => {
    if (category) {
      return (
        <div className="scale-150">
          <CategoryIcon category={category} />
        </div>
      )
    }
    // Decorative shapes
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="h-20 w-20 rounded-2xl border-2 border-white/20 bg-white/20"
      />
    )
  }

  const hasRealImages = galleryImages.length > 0 && !galleryImages[0].startsWith('placeholder-')

  return (
    <>
      {/* Main Image Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <div
          className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-none sm:rounded-2xl cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          <AnimatePresence initial={false} custom={swipeDir} mode="wait">
            <motion.div
              key={activeIndex}
              custom={swipeDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleSwipe}
              className={`absolute inset-0 bg-gradient-to-br ${gradientForIndex(activeIndex)} flex items-center justify-center`}
            >
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }} />
              {/* Decorative floating elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute top-8 right-8 w-20 h-20 rounded-full border border-white/10 hidden sm:block"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute bottom-12 left-8 w-16 h-16 rounded-lg border border-white/10 hidden sm:block"
              />

              <div className="relative z-10">
                {hasRealImages ? (
                  <img
                    src={galleryImages[activeIndex]}
                    alt={`${productName || 'Produto'} - Imagem ${activeIndex + 1}`}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl bg-white/70 dark:bg-black/20 flex items-center justify-center shadow-lg">
                    {renderPlaceholderContent(activeIndex)}
                  </div>
                )}
              </div>

              {/* Image counter */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full z-10">
                {activeIndex + 1}/{galleryImages.length}
              </div>

              {/* Zoom icon */}
              <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full z-10">
                <Maximize2 className="h-4 w-4" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 z-10"
              onClick={(e) => { e.stopPropagation(); goPrev() }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 z-10"
              onClick={(e) => { e.stopPropagation(); goNext() }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </motion.div>

      {/* Thumbnail Strip */}
      {galleryImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar px-1">
          {galleryImages.map((_, idx) => (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSwipeDir(idx > activeIndex ? 1 : -1)
                setZoomLevel(1)
                setActiveIndex(idx)
              }}
              className={`shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden transition-all border-2 ${
                idx === activeIndex
                  ? 'border-primary shadow-md scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <div className={`w-full h-full bg-gradient-to-br ${gradientForIndex(idx)} flex items-center justify-center`}>
                {hasRealImages ? (
                  <img
                    src={galleryImages[idx]}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-white/50">{idx + 1}</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between p-3 safe-area-top">
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-sm font-medium">
                  {activeIndex + 1} / {galleryImages.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {/* Zoom controls */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/10"
                  onClick={() => setZoomLevel(z => Math.max(1, z - 0.5))}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/10"
                  onClick={() => setZoomLevel(z => Math.min(3, z + 0.5))}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/10"
                  onClick={() => { setLightboxOpen(false); setZoomLevel(1) }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Lightbox Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden relative">
              <AnimatePresence initial={false} custom={swipeDir} mode="wait">
                <motion.div
                  key={activeIndex}
                  custom={swipeDir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={handleSwipe}
                  className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transition: zoomLevel > 1 ? 'transform 0.3s ease' : undefined,
                  }}
                >
                  {hasRealImages ? (
                    <img
                      src={galleryImages[activeIndex]}
                      alt={`${productName || 'Produto'} - Imagem ${activeIndex + 1}`}
                      className="max-w-full max-h-full object-contain select-none"
                      draggable={false}
                    />
                  ) : (
                    <div className={`w-64 h-64 sm:w-96 sm:h-96 rounded-3xl bg-gradient-to-br ${gradientForIndex(activeIndex)} flex items-center justify-center shadow-2xl`}>
                      <div className="h-32 w-32 rounded-3xl bg-white/30 dark:bg-black/20 flex items-center justify-center">
                        {renderPlaceholderContent(activeIndex)}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Lightbox Navigation */}
            {galleryImages.length > 1 && (
              <div className="p-4 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={goPrev}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                {/* Dot indicators */}
                <div className="flex gap-1.5">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSwipeDir(idx > activeIndex ? 1 : -1)
                        setZoomLevel(1)
                        setActiveIndex(idx)
                      }}
                      className={`h-2 rounded-full transition-all ${
                        idx === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={goNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
