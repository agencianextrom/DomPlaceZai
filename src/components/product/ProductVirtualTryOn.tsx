'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, RotateCcw, Share2, ShoppingCart, Sparkles, Maximize2, ChevronLeft, ChevronRight, Check, Ruler, Shirt, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProductData } from '@/store/useAppStore'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'

interface ProductVirtualTryOnProps {
  product: ProductData
}

/* ── Mock silhouette SVG paths per category ── */
const categorySilhouette: Record<string, string> = {
  FASHION: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
  BEAUTY: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 16c-3.31 0-6-2.69-6-6h12c0 3.31-2.69 6-6 6z',
  HOME_GARDEN: 'M2 22h20V2L2 22zm18-2H6.83L20 6.83V20z',
}

const categoryBackgrounds: Record<string, string> = {
  FASHION: 'from-rose-100 to-pink-200 dark:from-rose-900/20 dark:to-pink-800/20',
  BEAUTY: 'from-violet-100 to-purple-200 dark:from-violet-900/20 dark:to-purple-800/20',
  HOME_GARDEN: 'from-amber-100 to-orange-200 dark:from-amber-900/20 dark:to-orange-800/20',
  ELECTRONICS: 'from-sky-100 to-cyan-200 dark:from-sky-900/20 dark:to-cyan-800/20',
  FOOD: 'from-lime-100 to-green-200 dark:from-lime-900/20 dark:to-green-800/20',
  HEALTH: 'from-emerald-100 to-teal-200 dark:from-emerald-900/20 dark:to-teal-800/20',
}

const defaultBackground = 'from-slate-100 to-gray-200 dark:from-slate-900/20 dark:to-gray-800/20'

const categoryLabels: Record<string, string> = {
  FASHION: 'Manequim',
  BEAUTY: 'Rosto',
  HOME_GARDEN: 'Ambiente',
  ELECTRONICS: 'Mesa',
  FOOD: 'Cozinha',
  HEALTH: 'Banheiro',
}

/* ── Particle sparkle component ── */
function SparkleParticle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0.8, 0],
        scale: [0, size, size * 0.5, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2.5,
        delay,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: 'easeInOut',
      }}
    >
      <Sparkles className="text-amber-400" style={{ width: size * 8, height: size * 8 }} />
    </motion.div>
  )
}

/* ── Confetti burst on add-to-cart ── */
function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const particles = useMemo(() =>
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      color: ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'][i % 5],
      vx: (Math.random() - 0.5) * 200,
      vy: -100 - Math.random() * 150,
      rot: Math.random() * 360,
      size: 4 + Math.random() * 6,
    })),
    []
  )

  return (
    <AnimatePresence>
      {trigger && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
              }}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, y: [0, p.vy], x: [0, p.vx], rotate: [0, p.rot], scale: [1, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              exit={{ opacity: 0 }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

/* ── Size selector ── */
function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
}: {
  sizes: string[]
  selectedSize: string | null
  onSelect: (s: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <motion.button
          key={size}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(size)}
          className={`h-9 min-h-[44px] min-w-[40px] px-3 rounded-lg text-sm font-medium border-2 transition-colors ${
            selectedSize === size
              ? 'border-primary bg-primary text-primary-foreground shadow-md'
              : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-foreground'
          }`}
        >
          {size}
        </motion.button>
      ))}
    </div>
  )
}

/* ── Skeleton loader ── */
export function ProductVirtualTryOnSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-56 rounded-lg" />
      <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="flex gap-2 justify-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-12 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
    </div>
  )
}

/* ── Main component ── */
export function ProductVirtualTryOn({ product }: ProductVirtualTryOnProps) {
  const { addToCart } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [showShareToast, setShowShareToast] = useState(false)

  const category = product.category || 'OTHER'
  const bgClass = categoryBackgrounds[category] || defaultBackground
  const silhouettePath = categorySilhouette[category] || categorySilhouette.FASHION
  const categoryLabel = categoryLabels[category] || 'Visualização'

  const clothingSizes = ['PP', 'P', 'M', 'G', 'GG', 'XG']
  const beautySizes = ['15ml', '30ml', '50ml', '100ml']
  const generalSizes = ['Único']

  const displaySizes = useMemo(() => {
    if (category === 'FASHION' || category === 'BEAUTY') {
      return category === 'FASHION' ? clothingSizes : beautySizes
    }
    return generalSizes
  }, [category])

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  // Drag handler for 3D rotation
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return
    setIsDragging(true)
    setDragStartX(e.clientX)
    containerRef.current.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      const delta = e.clientX - dragStartX
      setRotation((prev) => prev + delta * 0.5)
      setDragStartX(e.clientX)
    },
    [isDragging, dragStartX]
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Share look via Web Share API
  const handleShareLook = useCallback(async () => {
    const shareData = {
      title: `Experimente Virtual — ${product.name}`,
      text: `Confira como fica o produto "${product.name}" no experimente virtual do DomPlace!`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Link do look copiado!', {
          description: 'Cole e compartilhe com seus amigos',
        })
      }
    } catch {
      // User cancelled share
    }
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 2000)
  }, [product.name])

  // Add to cart with confetti
  const handleAddToCart = useCallback(() => {
    addToCart(product, product.storeName || 'Loja', 1)
    setIsAddedToCart(true)
    setShowConfetti(true)
    toast.success('Produto adicionado ao carrinho!', {
      description: selectedSize ? `Tamanho: ${selectedSize}` : undefined,
    })
    setTimeout(() => {
      setShowConfetti(false)
      setIsAddedToCart(false)
    }, 2000)
  }, [addToCart, product, selectedSize])

  // Generate sparkle positions
  const sparklePositions = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        size: 0.6 + Math.random() * 0.8,
        delay: i * 0.4,
      })),
    []
  )

  if (isLoading) {
    return <ProductVirtualTryOnSkeleton />
  }

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Eye className="h-5 w-5 text-primary" />
        </motion.div>
        <h3 className="text-lg font-bold">Experimente Virtual</h3>
        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold">
          {categoryLabel}
        </Badge>
        <Badge variant="secondary" className="text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30 font-semibold">
          🆕 Beta
        </Badge>
      </div>

      {/* 3D viewer container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          ref={containerRef}
          className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ perspective: '800px' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${bgClass}`} />

          {/* Grid floor lines for depth */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <svg className="w-full h-full opacity-10" viewBox="0 0 400 133" preserveAspectRatio="none">
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={`h${i}`}
                  x1="0"
                  y1={i * 26}
                  x2="400"
                  y2={i * 26}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-gray-600"
                />
              ))}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <line
                  key={`v${i}`}
                  x1={i * 57}
                  y1="0"
                  x2={200}
                  y2="133"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-gray-600"
                />
              ))}
            </svg>
          </div>

          {/* Product card — rotates on drag */}
          <motion.div
            className="absolute inset-4 flex items-center justify-center"
            style={{
              rotateY: rotation,
              transformStyle: 'preserve-3d',
            }}
            animate={{ boxShadow: isDragging
              ? '0 20px 60px rgba(0,0,0,0.15)'
              : '0 8px 30px rgba(0,0,0,0.08)' }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
          >
            {/* Silhouette overlay */}
            <div className="relative">
              <motion.div
                className="absolute inset-0 flex items-center justify-center opacity-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ delay: 0.3 }}
              >
                <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
                  <path d={silhouettePath} />
                </svg>
              </motion.div>

              {/* Product image placeholder */}
              <motion.div
                className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-white/80 dark:bg-gray-900/80 shadow-lg flex items-center justify-center overflow-hidden border border-white/50"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <span className="text-5xl sm:text-6xl">
                  {{ FASHION: '👕', BEAUTY: '💄', HOME_GARDEN: '🪑', ELECTRONICS: '📱', FOOD: '🍎', HEALTH: '💊' }[category] || '📦'}
                </span>
              </motion.div>

              {/* Label */}
              <motion.div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                  {categoryLabel} · Arraste para girar
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Sparkle particles */}
          {sparklePositions.map((s) => (
            <SparkleParticle key={s.id} delay={s.delay} x={s.x} y={s.y} size={s.size} />
          ))}

          {/* Rotation indicator */}
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <RotateCcw className="h-3 w-3" />
            <span className="font-medium">
              {Math.round(((rotation % 360) + 360) % 360)}°
            </span>
          </motion.div>

          {/* Fullscreen hint */}
          <motion.button
            className="absolute top-3 right-3 min-h-[44px] min-w-[44px] h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/40 transition-colors"
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Maximize2 className="h-4 w-4" />
          </motion.button>

          {/* Category indicator */}
          <motion.div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-sm text-white text-[10px] font-medium"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {category === 'FASHION' ? <Shirt className="h-3 w-3" /> : <User className="h-3 w-3" />}
            Visualização {categoryLabel}
          </motion.div>

          {/* Confetti overlay */}
          <ConfettiBurst trigger={showConfetti} />
        </div>
      </motion.div>

      {/* Controls row */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setRotation((r) => r - 45)}
          className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setRotation(0)}
          className="h-9 min-h-[44px] px-3 rounded-lg bg-card border border-border text-xs font-medium hover:bg-muted transition-colors"
        >
          Resetar
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setRotation((r) => r + 45)}
          className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Size selector (for relevant categories) */}
      {(category === 'FASHION' || category === 'BEAUTY') && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Selecione o tamanho</span>
          </div>
          <SizeSelector sizes={displaySizes} selectedSize={selectedSize} onSelect={setSelectedSize} />
        </motion.div>
      )}

      {/* Product info in try-on context */}
      <motion.div
        className="mt-4 p-3 rounded-xl bg-secondary/50 border border-border/50"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${bgClass} flex items-center justify-center shrink-0`}>
            <span className="text-2xl">
              {{ FASHION: '👕', BEAUTY: '💄', HOME_GARDEN: '🪑', ELECTRONICS: '📱', FOOD: '🍎', HEALTH: '💊' }[category] || '📦'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold line-clamp-1">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.storeName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-primary">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {selectedSize && (
                <Badge variant="outline" className="text-[9px] h-4 px-1.5">
                  {selectedSize}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="mt-4 flex gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
          <Button
            onClick={handleAddToCart}
            className={`w-full h-12 gap-2 rounded-xl text-sm font-semibold transition-all ${
              isAddedToCart
                ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground btn-glow'
            }`}
          >
            {isAddedToCart ? (
              <>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' as const }}>
                  <Check className="h-4 w-4" />
                </motion.div>
                Adicionado!
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Adicionar ao Carrinho
              </>
            )}
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl border-primary/30 hover:bg-primary/5"
            onClick={handleShareLook}
          >
            <Share2 className="h-4 w-4 text-primary" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Share toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-center"
          >
            <p className="text-xs text-primary font-medium">✨ Look compartilhado com sucesso!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper tips */}
      <motion.div
        className="mt-4 p-3 rounded-xl bg-muted/50 border border-border/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <span className="font-medium">Dica:</span> Arraste a imagem para ver o produto de diferentes ângulos.{' '}
          O experimente virtual ajuda a visualizar como o produto fica no uso diário.
        </p>
      </motion.div>
    </div>
  )
}
