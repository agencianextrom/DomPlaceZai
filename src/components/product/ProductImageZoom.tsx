'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCw, Maximize2, Move } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resolveProductImage } from '@/lib/product-images'
import type { ProductData } from '@/store/useAppStore'

interface ProductImageZoomProps {
  product: ProductData
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
}

export function ProductImageZoom({ product, isOpen, onClose, initialIndex = 0 }: ProductImageZoomProps) {
  const mainImage = resolveProductImage({ slug: product.slug, category: product.category, images: product.images })
  const images = product.images ? JSON.parse(product.images) as string[] : []
  const allImages = mainImage ? [mainImage, ...images.filter(i => i !== mainImage)] : images

  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [imageError, setImageError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastTouchDist = useRef(0)
  const lastTouchCenter = useRef({ x: 0, y: 0 })

  // Reset state when product or index changes
  const [prevProductId, setPrevProductId] = useState(product.id)
  if (product.id !== prevProductId) {
    setActiveIndex(initialIndex)
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
    setImageError(false)
    setPrevProductId(product.id)
  }

  const handlePrev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + allImages.length) % allImages.length)
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
    setImageError(false)
  }, [allImages.length])

  const handleNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % allImages.length)
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
    setImageError(false)
  }, [allImages.length])

  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.5, 5))
  }, [])

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const next = Math.max(prev - 0.5, 1)
      if (next === 1) setPanOffset({ x: 0, y: 0 })
      return next
    })
  }, [])

  const resetZoom = useCallback(() => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-') zoomOut()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, activeIndex])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Mouse/touch panning
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (zoomLevel <= 1) return
    e.preventDefault()
    setIsPanning(true)
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
  }, [zoomLevel, panOffset])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning || zoomLevel <= 1) return
    e.preventDefault()
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    })
  }, [isPanning, panStart, zoomLevel])

  const handlePointerUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Pinch-to-zoom for touch devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy)
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const delta = dist - lastTouchDist.current
      const scale = Math.max(1, Math.min(5, zoomLevel + delta * 0.01))
      setZoomLevel(scale)
      lastTouchDist.current = dist
    }
  }, [zoomLevel])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 10) {
      e.preventDefault()
      setZoomLevel(prev => {
        const next = e.deltaY < 0 ? Math.min(prev + 0.25, 5) : Math.max(prev - 0.25, 1)
        if (next === 1) setPanOffset({ x: 0, y: 0 })
        return next
      })
    }
  }, [])

  const currentImage = allImages[activeIndex] || null

  return (
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Top bar */}
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-sm safe-area-top"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-white/70 font-medium truncate">{product.name}</span>
              <span className="text-xs text-white/40 shrink-0">{activeIndex + 1}/{allImages.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
                <button
                  onClick={zoomOut}
                  className="min-h-[44px] min-w-[44px] h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <ZoomOut className="h-3.5 w-3.5 text-white" />
                </button>
                <span className="text-xs font-mono text-white/80 min-w-[3rem] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={zoomIn}
                  className="min-h-[44px] min-w-[44px] h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <ZoomIn className="h-3.5 w-3.5 text-white" />
                </button>
              </div>

              {zoomLevel > 1 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={resetZoom}
                  className="min-h-[44px] min-w-[44px] h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <RotateCw className="h-3.5 w-3.5 text-white" />
                </motion.button>
              )}

              <button
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </motion.div>

          {/* Image area */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex-1 flex items-center justify-center overflow-hidden relative cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* Pan mode indicator */}
            {zoomLevel > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5"
              >
                <Move className="h-3 w-3 text-white/70" />
                <span className="text-[10px] text-white/70">Arraste para mover</span>
                <Maximize2 className="h-3 w-3 text-white/70" />
                <span className="text-[10px] text-white/70">Scroll para zoom</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25 }}
                className="relative"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                  transition: isPanning ? 'none' : 'transform 0.2s ease-out',
                  cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'zoom-in',
                }}
              >
                {!imageError ? (
                  <img
                    src={currentImage}
                    alt={`${product.name} - Imagem ${activeIndex + 1}`}
                    className="max-w-[90vw] max-h-[70vh] object-contain rounded-lg select-none"
                    draggable={false}
                    onClick={(e) => {
                      if (zoomLevel <= 1) {
                        e.stopPropagation()
                        zoomIn()
                      }
                    }}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-[60vw] max-w-[400px] h-[60vh] max-h-[400px] bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Imagem não disponível</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev() }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors z-10"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors z-10"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}
          </motion.div>

          {/* Bottom thumbnail carousel */}
          {allImages.length > 1 && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 30 }}
              className="px-4 pb-4 pt-3 bg-gradient-to-t from-black/60 to-transparent"
            >
              <div className="flex items-center justify-center gap-2 overflow-x-auto hide-scrollbar pb-1 max-w-lg mx-auto">
                {allImages.map((img, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setActiveIndex(idx)
                      setZoomLevel(1)
                      setPanOffset({ x: 0, y: 0 })
                      setImageError(false)
                    }}
                    className={`relative h-14 w-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      idx === activeIndex
                        ? 'border-white shadow-lg shadow-white/20 ring-2 ring-white/20'
                        : 'border-white/20 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.style.display = 'none'
                      }}
                    />
                  </motion.button>
                ))}
              </div>

              {/* Pinch-to-zoom indicator */}
              <div className="flex items-center justify-center mt-2">
                <p className="text-[10px] text-white/30 flex items-center gap-1">
                  <ZoomIn className="h-2.5 w-2.5" />
                  Clique para ampliar • Scroll ou pinça para zoom
                </p>
              </div>
            </motion.div>
          )}

          {/* Safe area bottom */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
