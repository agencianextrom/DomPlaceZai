'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Shirt,
  Sofa,
  Sparkles,
  Heart,
  Share2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Palette,
  Eye,
  ScanLine,
  Check,
  Copy,
  ZoomIn,
  ZoomOut,
  Layers,
  FlipHorizontal,
  Move,
  X,
  Info,
  User,
  Maximize2,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════ */

type TryOnMode = 'vestir' | 'decorar' | 'testar'

interface ProductColor {
  id: string
  name: string
  hex: string
}

interface BodyMeasurements {
  height: number
  weight: number
  chest: number
  waist: number
}

interface SizeResult {
  recommended: string
  confidence: number
  details: string
}

const MOCK_PRODUCT = {
  id: 'prod-ar-2',
  name: 'Blazer Premium Slim',
  price: 459.9,
  originalPrice: 699.9,
  image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80',
  imageBack: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
  imageSide: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  colors: [
    { id: 'c1', name: 'Preto Elegante', hex: '#1a1a1a' },
    { id: 'c2', name: 'Azul Marinho', hex: '#1e3a5f' },
    { id: 'c3', name: 'Cinza Chumbo', hex: '#4a4a4a' },
    { id: 'c4', name: 'Bordô Clássico', hex: '#6b2d3e' },
    { id: 'c5', name: 'Verde Militar', hex: '#4a5e3a' },
    { id: 'c6', name: 'Areia Quente', hex: '#c4a97d' },
  ] as ProductColor[],
  sizes: ['PP', 'P', 'M', 'G', 'GG', 'XG'],
  category: 'clothing' as const,
}

const TRYON_MODES: { id: TryOnMode; label: string; icon: typeof Shirt; description: string }[] = [
  { id: 'vestir', label: 'Vestir', icon: Shirt, description: 'Experimente roupas virtualmente' },
  { id: 'decorar', label: 'Decorar', icon: Sofa, description: 'Visualize móveis no ambiente' },
  { id: 'testar', label: 'Testar', icon: Sparkles, description: 'Teste beleza e maquiagem' },
]

const SILHOUETTE_PATH =
  'M200 20 C200 20 185 60 185 90 C185 120 175 145 175 165 C175 185 180 200 195 210 L195 220 C195 225 192 228 190 228 L180 235 C175 238 172 245 172 250 L172 280 C172 285 175 290 180 292 L185 295 L185 340 C185 350 190 360 200 365 L200 380 C200 385 198 390 195 392 L190 395 C188 398 190 402 195 402 L205 402 C210 402 212 398 210 395 L205 392 C202 390 200 385 200 380 L200 365 C210 360 215 350 215 340 L215 295 L220 292 C225 290 228 285 228 280 L228 250 C228 245 225 238 220 235 L210 228 C208 228 205 225 205 220 L205 210 C220 200 225 185 225 165 C225 145 215 120 215 90 C215 60 200 20 200 20 Z'

const CORNER_SVG = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8V2H8" stroke="rgba(16,185,129,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CORNER_SVG_R = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2H22V8" stroke="rgba(16,185,129,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ═══════════════════════════════════════════════════════
   Loading Shimmer
   ═══════════════════════════════════════════════════════ */
function LoadingShimmer() {
  return (
    <div className="r42-shimmer-wrapper rounded-2xl overflow-hidden border border-border">
      <div className="r42-shimmer-header flex items-center justify-between p-4 border-b border-border">
        <div className="r42-shimmer-badge h-8 w-32 rounded-lg" />
        <div className="flex gap-2">
          <div className="r42-shimmer-dot h-8 w-8 rounded-full" />
          <div className="r42-shimmer-dot h-8 w-8 rounded-full" />
          <div className="r42-shimmer-dot h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="aspect-[3/4] sm:aspect-video relative overflow-hidden">
        <div className="absolute inset-0 r42-shimmer-bg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
          <div className="r42-shimmer-circle h-20 w-20 rounded-full" />
          <div className="r42-shimmer-line h-4 w-40 rounded" />
          <div className="r42-shimmer-line h-3 w-24 rounded" />
        </div>
        {/* Scanning lines */}
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="r42-shimmer-swatch h-8 w-8 rounded-full flex-shrink-0" />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="r42-shimmer-line h-10 flex-1 rounded-lg" />
          <div className="r42-shimmer-line h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Scanning Viewfinder Corners
   ═══════════════════════════════════════════════════════ */
function ViewfinderCorners({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="absolute inset-4 pointer-events-none z-10">
      {/* Top-left */}
      <motion.div
        className="absolute top-0 left-0"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      >
        {CORNER_SVG}
      </motion.div>
      {/* Top-right */}
      <motion.div
        className="absolute top-0 right-0"
        style={{ transform: 'scaleX(-1)' }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.1 }}
      >
        {CORNER_SVG}
      </motion.div>
      {/* Bottom-left */}
      <motion.div
        className="absolute bottom-0 left-0"
        style={{ transform: 'scaleY(-1)' }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.2 }}
      >
        {CORNER_SVG}
      </motion.div>
      {/* Bottom-right */}
      <motion.div
        className="absolute bottom-0 right-0"
        style={{ transform: 'scale(-1,-1)' }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.3 }}
      >
        {CORNER_SVG}
      </motion.div>
      {/* Scanning animation */}
      <motion.div
        className="absolute left-0 right-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.7) 30%, rgba(16,185,129,0.9) 50%, rgba(16,185,129,0.7) 70%, transparent 100%)' }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Animated Silhouette with Product Overlay
   ═══════════════════════════════════════════════════════ */
function SilhouetteFigure({ mode, overlayOpacity, selectedColor, productImage }: {
  mode: TryOnMode
  overlayOpacity: number
  selectedColor: ProductColor
  productImage: string
}) {
  const figureColor = mode === 'vestir'
    ? selectedColor.hex
    : mode === 'decorar'
      ? '#4a5e3a'
      : '#c4a97d'

  return (
    <div className="r42-silhouette-container relative flex items-center justify-center">
      <motion.svg
        viewBox="0 0 400 420"
        className="r42-silhouette-svg h-full max-h-80 w-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 200, damping: 25 }}
      >
        {/* Base silhouette */}
        <motion.path
          d="M200 20 C200 20 185 60 185 90 C185 120 175 145 175 165 C175 185 180 200 195 210 L195 220 C195 225 192 228 190 228 L180 235 C175 238 172 245 172 250 L172 280 C172 285 175 290 180 292 L185 295 L185 340 C185 350 190 360 200 365 L200 380 C200 385 198 390 195 392 L190 395 C188 398 190 402 195 402 L205 402 C210 402 212 398 210 395 L205 392 C202 390 200 385 200 380 L200 365 C210 360 215 350 215 340 L215 295 L220 292 C225 290 228 285 228 280 L228 250 C228 245 225 238 220 235 L210 228 C208 228 205 225 205 220 L205 210 C220 200 225 185 225 165 C225 145 215 120 215 90 C215 60 200 20 200 20 Z"
          fill="rgba(180,180,180,0.25)"
          stroke="rgba(120,120,120,0.3)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        {/* Product overlay area */}
        <motion.ellipse
          cx="200"
          cy={mode === 'testar' ? 85 : 210}
          rx={mode === 'testar' ? 30 : 55}
          ry={mode === 'testar' ? 25 : 90}
          fill={figureColor}
          opacity={overlayOpacity * 0.6}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 180, damping: 22, delay: 0.3 }}
        />
        {/* Decorate mode furniture shape */}
        {mode === 'decorar' && (
          <motion.rect
            x="145"
            y="230"
            width="110"
            height="80"
            rx="8"
            fill="rgba(74,94,58,0.5)"
            stroke="rgba(74,94,58,0.7)"
            strokeWidth="1.5"
            opacity={overlayOpacity}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: overlayOpacity, y: 0 }}
            transition={{ type: 'spring' as const, stiffness: 150, damping: 20, delay: 0.5 }}
          />
        )}
        {/* Testar mode face overlay */}
        {mode === 'testar' && (
          <motion.circle
            cx="200"
            cy="85"
            r="28"
            fill="none"
            stroke="rgba(196,169,125,0.8)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity={overlayOpacity}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </motion.svg>

      {/* Floating product image overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedColor.id}
          className="r42-product-overlay absolute"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: overlayOpacity, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ type: 'spring' as const, stiffness: 250, damping: 25 }}
          style={{
            top: mode === 'testar' ? '5%' : '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: mode === 'testar' ? '60%' : '55%',
            pointerEvents: 'none',
          }}
        >
          <img
            src={productImage}
            alt="Product overlay"
            className="w-full h-auto rounded-lg"
            style={{ mixBlendMode: 'multiply', filter: `saturate(0.8)` }}
          />
          <div
            className="absolute inset-0 rounded-lg"
            style={{ backgroundColor: selectedColor.hex, opacity: 0.25, mixBlendMode: 'multiply' }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Before / After Comparison Slider
   ═══════════════════════════════════════════════════════ */
function BeforeAfterSlider({ beforeImage, afterImage }: { beforeImage: string; afterImage: string }) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = clientX - rect.left
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100))
    setSliderPos(pct)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    handleMove(e.clientX)
  }, [handleMove])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    handleMove(e.clientX)
  }, [handleMove])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  return (
    <div
      ref={containerRef}
      className="r42-comparison relative aspect-video rounded-xl overflow-hidden cursor-col-resize select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* After image (full background) */}
      <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover" />
      {/* Before image (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
        <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${(100 / sliderPos) * 100}%`, maxWidth: 'none' }} />
      </div>
      {/* Slider line */}
      <motion.div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${sliderPos}%`, width: 3, background: '#ffffff', transform: 'translateX(-50%)' }}
      >
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
          whileHover={{ scale: 1.15 }}
        >
          <ChevronLeft className="h-3 w-3 text-gray-600 absolute -left-0.5" />
          <ChevronRight className="h-3 w-3 text-gray-600 absolute -right-0.5" />
        </motion.div>
      </motion.div>
      {/* Labels */}
      <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-md text-[10px] font-bold" style={{ background: 'rgba(0,0,0,0.6)', color: '#ffffff' }}>
        ANTES
      </div>
      <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded-md text-[10px] font-bold" style={{ background: 'rgba(16,185,129,0.8)', color: '#ffffff' }}>
        DEPOIS
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   360° Product Rotation Viewer
   ═══════════════════════════════════════════════════════ */
function RotationViewer({ images, autoSpin }: { images: string[]; autoSpin: boolean }) {
  const [rotation, setRotation] = useState(0)
  const [isDraggingRot, setIsDraggingRot] = useState(false)
  const dragStartRef = useRef(0)
  const rotStartRef = useRef(0)

  useEffect(() => {
    if (!autoSpin || isDraggingRot) return
    const interval = setInterval(() => {
      setRotation((r) => (r + 0.3) % 360)
    }, 30)
    return () => clearInterval(interval)
  }, [autoSpin, isDraggingRot])

  const imageIndex = Math.floor(((rotation % 360) + 360) % 360 / (360 / images.length))

  const handleRotDown = useCallback((e: React.PointerEvent) => {
    setIsDraggingRot(true)
    dragStartRef.current = e.clientX
    rotStartRef.current = rotation
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [rotation])

  const handleRotMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRot) return
    const delta = e.clientX - dragStartRef.current
    setRotation(rotStartRef.current + delta * 0.5)
  }, [isDraggingRot])

  const handleRotUp = useCallback(() => {
    setIsDraggingRot(false)
  }, [])

  return (
    <div
      className="r42-rotation-viewer relative aspect-square rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
      onPointerDown={handleRotDown}
      onPointerMove={handleRotMove}
      onPointerUp={handleRotUp}
      onPointerLeave={handleRotUp}
      style={{ perspective: '1200px' }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={imageIndex}
          src={images[imageIndex]}
          alt={`Product view ${imageIndex + 1}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        />
      </AnimatePresence>

      {/* Degree indicator */}
      <motion.div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full text-[10px] font-mono font-bold"
        style={{ background: 'rgba(0,0,0,0.65)', color: 'rgba(16,185,129,1)' }}
        animate={{ opacity: isDraggingRot ? 1 : 0.6 }}
      >
        {Math.round(((rotation % 360) + 360) % 360)}°
      </motion.div>

      {/* Auto spin indicator */}
      {autoSpin && !isDraggingRot && (
        <motion.div
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold"
          style={{ background: 'rgba(16,185,129,0.2)', color: 'rgba(16,185,129,1)' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <RotateCw className="h-3 w-3" />
          AUTO SPIN
        </motion.div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Size Recommendation Engine
   ═══════════════════════════════════════════════════════ */
function SizeRecommendation() {
  const [measurements, setMeasurements] = useState<BodyMeasurements>({ height: 170, weight: 70, chest: 96, waist: 82 })
  const [showPanel, setShowPanel] = useState(false)
  const [result, setResult] = useState<SizeResult | null>(null)

  const calculateSize = useCallback(() => {
    const { height, weight, chest, waist } = measurements
    const bmi = weight / Math.pow(height / 100, 2)

    let size = 'M'
    let confidence = 75

    if (chest < 88) { size = 'PP'; confidence = 82 }
    else if (chest < 96) {
      size = bmi > 25 ? 'G' : 'P'
      confidence = 78
    }
    else if (chest < 104) {
      size = bmi > 27 ? 'GG' : 'M'
      confidence = 85
    }
    else if (chest < 112) {
      size = bmi > 25 ? 'XG' : 'G'
      confidence = 80
    }
    else { size = 'XG'; confidence = 72 }

    if (waist > chest * 0.95) {
      const idx = MOCK_PRODUCT.sizes.indexOf(size)
      if (idx < MOCK_PRODUCT.sizes.length - 1) {
        size = MOCK_PRODUCT.sizes[idx + 1]
        confidence = Math.max(confidence - 10, 60)
      }
    }

    const details = bmi > 25
      ? `Com base no IMC de ${bmi.toFixed(1)} e perímetro de ${chest}cm, recomendamos o tamanho ${size} para maior conforto.`
      : `Com base no perímetro de ${chest}cm e cintura de ${waist}cm, o tamanho ${size} oferece o melhor ajuste.`

    setResult({ recommended: size, confidence, details })
  }, [measurements])

  const [isCalcAnim, setIsCalcAnim] = useState(false)

  const handleCalculate = useCallback(() => {
    setIsCalcAnim(true)
    setTimeout(() => {
      calculateSize()
      setIsCalcAnim(false)
    }, 800)
  }, [calculateSize])

  return (
    <div className="r42-size-panel space-y-3">
      <motion.button
        className="r42-size-toggle flex items-center gap-2 w-full text-left"
        onClick={() => setShowPanel(!showPanel)}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2 flex-1">
          <Ruler className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Guia de Tamanho IA</span>
        </div>
        <motion.div
          animate={{ rotate: showPanel ? 180 : 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="r42-size-form p-3 rounded-xl space-y-3" style={{ background: 'rgba(0,0,0,0.02)' }}>
              <p className="text-xs text-muted-foreground">Insira suas medidas para receber a recomendação de tamanho ideal.</p>

              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'height', label: 'Altura (cm)', min: 140, max: 210, step: 1 },
                  { key: 'weight', label: 'Peso (kg)', min: 40, max: 150, step: 1 },
                  { key: 'chest', label: 'Peitoral (cm)', min: 70, max: 140, step: 1 },
                  { key: 'waist', label: 'Cintura (cm)', min: 60, max: 130, step: 1 },
                ] as const).map(({ key, label, min, max, step }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
                    <input
                      type="number"
                      value={measurements[key as keyof BodyMeasurements]}
                      min={min}
                      max={max}
                      step={step}
                      onChange={(e) => setMeasurements((m) => ({ ...m, [key]: Number(e.target.value) }))}
                      className="r42-size-input w-full h-9 px-3 rounded-lg text-sm font-medium border transition-colors focus:outline-none"
                      style={{ borderColor: 'rgba(0,0,0,0.12)' }}
                    />
                  </div>
                ))}
              </div>

              <motion.div
                className="w-full"
                whileTap={{ scale: 0.97 }}
              >
                <motion.button
                  className="r42-calc-btn w-full h-10 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  onClick={handleCalculate}
                  whileTap={{ scale: 0.97 }}
                >
                  {isCalcAnim ? (
                    <motion.div
                      className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Calcular Tamanho Ideal
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    className="r42-size-result p-3 rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-muted-foreground">Tamanho Recomendado</span>
                      <span className="text-xs text-muted-foreground">{result.confidence}% confiança</span>
                    </div>
                    <motion.div
                      className="r42-size-badge text-center py-2 rounded-lg text-2xl font-black mb-2"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#059669' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                    >
                      {result.recommended}
                    </motion.div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{result.details}</p>

                    {/* Size chart quick view */}
                    <div className="mt-2 flex gap-1">
                      {MOCK_PRODUCT.sizes.map((s) => (
                        <motion.div
                          key={s}
                          className="r42-size-chip flex-1 text-center py-1 rounded text-[10px] font-bold"
                          style={{
                            background: s === result.recommended ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0.04)',
                            color: s === result.recommended ? '#059669' : 'rgba(0,0,0,0.4)',
                            border: s === result.recommended ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(0,0,0,0.06)',
                          }}
                        >
                          {s}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Color Variant Selector with Animated Swatches
   ═══════════════════════════════════════════════════════ */
function ColorSwatches({ colors, selected, onSelect }: {
  colors: ProductColor[]
  selected: ProductColor
  onSelect: (c: ProductColor) => void
}) {
  return (
    <div className="r42-color-swatches flex items-center gap-2">
      <Palette className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-xs text-muted-foreground hidden sm:inline flex-shrink-0">Cor:</span>
      <div className="flex items-center gap-2 flex-wrap">
        {colors.map((c) => (
          <motion.button
            key={c.id}
            className="r42-color-swatch relative h-8 w-8 min-h-[44px] min-w-[44px] rounded-full flex-shrink-0 transition-shadow"
            style={{
              backgroundColor: c.hex,
              boxShadow: selected.id === c.id
                ? `0 0 0 2px #ffffff, 0 0 0 4px ${c.hex}, 0 4px 12px rgba(0,0,0,0.2)`
                : '0 1px 3px rgba(0,0,0,0.12)',
            }}
            onClick={() => onSelect(c)}
            whileHover={{ scale: 1.2, y: -2 }}
            whileTap={{ scale: 0.9 }}
            title={c.name}
          >
            {/* Selected ring animation */}
            <AnimatePresence>
              {selected.id === c.id && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${c.hex}` }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center"
                    style={{ background: c.hex }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                  >
                    <Check className="h-2.5 w-2.5 text-white" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            <span className="sr-only">{c.name}</span>
          </motion.button>
        ))}
        <motion.span
          key={selected.id}
          className="text-xs font-medium text-muted-foreground ml-1"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        >
          {selected.name}
        </motion.span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Toast Notification
   ═══════════════════════════════════════════════════════ */
function ToastNotification({ message, visible, icon }: { message: string; visible: boolean; icon: React.ReactNode }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="r42-toast fixed bottom-6 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg"
          style={{
            background: 'rgba(0,0,0,0.85)',
            color: '#ffffff',
            transform: 'translateX(-50%)',
            backdropFilter: 'blur(12px)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
        >
          {icon}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT: ARProductTryOn2
   ═══════════════════════════════════════════════════════ */
export function ARProductTryOn2() {
  /* ─── State ─── */
  const [loading, setLoading] = useState(true)
  const [activeMode, setActiveMode] = useState<TryOnMode>('vestir')
  const [selectedColor, setSelectedColor] = useState<ProductColor>(MOCK_PRODUCT.colors[0])
  const [overlayOpacity, setOverlayOpacity] = useState(0.8)
  const [autoSpin, setAutoSpin] = useState(true)
  const [savedToWishlist, setSavedToWishlist] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [showSizePanel, setShowSizePanel] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastIcon, setToastIcon] = useState<React.ReactNode>(null)
  const [viewfinderActive, setViewfinderActive] = useState(true)

  const viewerRef = useRef<HTMLDivElement>(null)

  /* ─── Effects ─── */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (toastVisible) {
      const t = setTimeout(() => setToastVisible(false), 2500)
      return () => clearTimeout(t)
    }
  }, [toastVisible])

  /* ─── Handlers ─── */
  const showToast = useCallback((message: string, icon: React.ReactNode) => {
    setToastMessage(message)
    setToastIcon(icon)
    setToastVisible(true)
  }, [])

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${MOCK_PRODUCT.name} — Try-On Virtual`,
      text: `Experimente ${MOCK_PRODUCT.name} virtualmente na DomPlace! Por apenas R$${MOCK_PRODUCT.price.toFixed(2)}`,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        /* user cancelled share */
      }
    } else {
      await navigator.clipboard?.writeText(shareData.text + ' ' + (shareData.url || ''))
      showToast('Link copiado!', <Copy className="h-4 w-4" />)
    }
  }, [showToast])

  const handleWishlist = useCallback(() => {
    setSavedToWishlist((v) => !v)
    showToast(
      savedToWishlist ? 'Removido dos favoritos' : 'Salvo nos favoritos',
      <Heart className="h-4 w-4" style={{ color: savedToWishlist ? 'rgba(255,255,255,0.6)' : '#ef4444' }} />
    )
  }, [savedToWishlist, showToast])

  const handleModeChange = useCallback((mode: TryOnMode) => {
    setActiveMode(mode)
    setViewfinderActive(true)
  }, [])

  /* ─── Loading ─── */
  if (loading) return <LoadingShimmer />

  /* ─── Render ─── */
  return (
    <div className="r42-container rounded-2xl overflow-hidden border border-border shadow-xl" style={{ background: '#ffffff' }}>
      {/* ═══ TOOLBAR ═══ */}
      <div className="r42-toolbar flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="r42-toolbar-icon h-8 w-8 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.12)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Camera className="h-4 w-4" style={{ color: '#10b981' }} />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold leading-tight">AR Try-On 2.0</h3>
            <p className="text-[10px] text-muted-foreground">Experimente virtualmente</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Share */}
          <motion.button
            className="r42-toolbar-btn min-h-[44px] min-w-[44px] h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.04)' }}
            onClick={handleShare}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title="Compartilhar"
          >
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </motion.button>
          {/* Wishlist */}
          <motion.button
            className="r42-toolbar-btn min-h-[44px] min-w-[44px] h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: savedToWishlist ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.04)' }}
            onClick={handleWishlist}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title="Salvar nos favoritos"
          >
            <Heart
              className="h-4 w-4"
              style={{
                color: savedToWishlist ? '#ef4444' : 'rgba(0,0,0,0.4)',
                fill: savedToWishlist ? '#ef4444' : 'none',
              }}
            />
          </motion.button>
          {/* Compare */}
          <motion.button
            className="r42-toolbar-btn min-h-[44px] min-w-[44px] h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: showComparison ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.04)' }}
            onClick={() => setShowComparison((v) => !v)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title="Comparar antes/depois"
          >
            <FlipHorizontal className="h-4 w-4" style={{ color: showComparison ? '#10b981' : 'rgba(0,0,0,0.4)' }} />
          </motion.button>
        </div>
      </div>

      {/* ═══ MODE SELECTOR ═══ */}
      <div className="r42-mode-bar px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          {TRYON_MODES.map((mode) => {
            const Icon = mode.icon
            const isActive = activeMode === mode.id
            return (
              <motion.button
                key={mode.id}
                className="r42-mode-btn flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                style={{
                  background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.03)',
                  color: isActive ? '#059669' : 'rgba(0,0,0,0.5)',
                  border: isActive ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(0,0,0,0.06)',
                }}
                onClick={() => handleModeChange(mode.id)}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-4 w-4" />
                <span>{mode.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="r42-mode-indicator"
                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full"
                    style={{ background: '#10b981' }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ═══ MAIN VIEWER ═══ */}
      <div className="relative">
        <div
          ref={viewerRef}
          className="r42-viewer relative aspect-[3/4] sm:aspect-video overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(30,32,35,0.95) 0%, rgba(20,22,25,0.98) 100%)',
          }}
        >
          {/* Mock camera viewfinder background */}
          <div className="absolute inset-0">
            {/* Grid pattern */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(16,185,129,0.06) 0px, rgba(16,185,129,0.06) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(90deg, rgba(16,185,129,0.06) 0px, rgba(16,185,129,0.06) 1px, transparent 1px, transparent 48px)',
              }}
            />
            {/* Ambient glow */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.08) 0%, transparent 70%)',
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Camera status bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="h-2 w-2 rounded-full"
                style={{ background: '#ef4444' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[10px] font-mono tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>
                AR TRY-ON ATIVO
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                className="r42-status-pill flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ScanLine className="h-3 w-3" />
                {activeMode === 'vestir' ? 'ROUPA' : activeMode === 'decorar' ? 'MÓVEL' : 'BELEZA'}
              </motion.div>
              <motion.button
                className="min-h-[44px] min-w-[44px] h-7 w-7 rounded-md flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                onClick={() => setViewfinderActive((v) => !v)}
                whileTap={{ scale: 0.9 }}
                title="Toggle viewfinder"
              >
                <Maximize2 className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} />
              </motion.button>
            </div>
          </div>

          {/* Viewfinder corners */}
          <ViewfinderCorners active={viewfinderActive} />

          {/* ─── Comparison Mode ─── */}
          <AnimatePresence mode="wait">
            {showComparison ? (
              <motion.div
                key="comparison"
                className="absolute inset-8 flex items-center justify-center z-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring' as const, stiffness: 250, damping: 25 }}
              >
                <div className="w-full max-w-sm">
                  <BeforeAfterSlider
                    beforeImage="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=500&q=80"
                    afterImage={MOCK_PRODUCT.image}
                  />
                </div>
              </motion.div>
            ) : (
              /* ─── Main Content ─── */
              <motion.div
                key="main-content"
                className="absolute inset-0 flex items-center justify-center z-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMode}
                    className="flex items-center justify-center w-full h-full"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ type: 'spring' as const, stiffness: 250, damping: 25 }}
                  >
                    <SilhouetteFigure
                      mode={activeMode}
                      overlayOpacity={overlayOpacity}
                      selectedColor={selectedColor}
                      productImage={MOCK_PRODUCT.image}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom info bar */}
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
              >
                <Layers className="h-3.5 w-3.5" style={{ color: 'rgba(16,185,129,1)' }} />
                <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  Overlay: {Math.round(overlayOpacity * 100)}%
                </span>
              </motion.div>
              <motion.button
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}
                onClick={() => setAutoSpin((v) => !v)}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCw className="h-3.5 w-3.5" />
                {autoSpin ? 'Parar' : 'Auto-Spin'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* ═══ PRODUCT OVERLAY OPACITY SLIDER ═══ */}
        <div className="r42-opacity-bar px-4 py-2.5 border-b border-border flex items-center gap-3">
          <Eye className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex-shrink-0">
            Opacidade
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={overlayOpacity * 100}
            onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
            className="r42-opacity-slider flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10b981 ${overlayOpacity * 100}%, rgba(0,0,0,0.1) ${overlayOpacity * 100}%)`,
            }}
          />
          <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
            {Math.round(overlayOpacity * 100)}%
          </span>
        </div>
      </div>

      {/* ═══ COLOR SWATCHES ═══ */}
      <div className="r42-color-section px-4 py-3 border-b border-border">
        <ColorSwatches
          colors={MOCK_PRODUCT.colors}
          selected={selectedColor}
          onSelect={setSelectedColor}
        />
      </div>

      {/* ═══ 360° ROTATION VIEWER ═══ */}
      <div className="r42-rotation-section px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <RotateCw className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Rotação 360°</span>
          </div>
          <motion.button
            className="r42-auto-spin-btn flex items-center gap-1.5 h-7 min-h-[44px] px-2.5 rounded-md text-[10px] font-semibold transition-colors"
            style={{
              background: autoSpin ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.04)',
              color: autoSpin ? '#059669' : 'rgba(0,0,0,0.5)',
            }}
            onClick={() => setAutoSpin((v) => !v)}
            whileTap={{ scale: 0.95 }}
          >
            {autoSpin ? (
              <>
                <motion.div
                  className="h-3 w-3 rounded-full"
                  style={{ background: '#10b981' }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Rodando
              </>
            ) : (
              <>
                <RotateCw className="h-3 w-3" />
                Auto-Spin
              </>
            )}
          </motion.button>
        </div>
        <RotationViewer
          images={[MOCK_PRODUCT.image, MOCK_PRODUCT.imageSide, MOCK_PRODUCT.imageBack, MOCK_PRODUCT.image]}
          autoSpin={autoSpin}
        />
      </div>

      {/* ═══ SIZE RECOMMENDATION ═══ */}
      <div className="r42-size-section px-4 py-3 border-b border-border">
        <SizeRecommendation />
      </div>

      {/* ═══ QUICK ACTIONS ═══ */}
      <div className="r42-actions px-4 py-3 border-b border-border">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <motion.button
            className="r42-action-btn flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-colors"
            style={{ background: 'rgba(0,0,0,0.02)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground">Zoom In</span>
          </motion.button>
          <motion.button
            className="r42-action-btn flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-colors"
            style={{ background: 'rgba(0,0,0,0.02)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Move className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground">Mover</span>
          </motion.button>
          <motion.button
            className="r42-action-btn flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-colors"
            style={{ background: 'rgba(0,0,0,0.02)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground">Perfil</span>
          </motion.button>
        </div>
      </div>

      {/* ═══ PRODUCT INFO FOOTER ═══ */}
      <div className="r42-footer px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold leading-tight truncate">{MOCK_PRODUCT.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-black text-primary">
                R$ {MOCK_PRODUCT.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                R$ {MOCK_PRODUCT.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <motion.span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
              >
                -34%
              </motion.span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.svg
                    key={star}
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: star * 0.05 }}
                  >
                    <path
                      d="M10 1.5l2.5 5.5 6 0.5-4.5 4 1.5 6L10 14.5 4.5 17.5l1.5-6-4.5-4 6-0.5z"
                      fill={star <= 4 ? '#10b981' : 'rgba(0,0,0,0.15)'}
                    />
                  </motion.svg>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">(127 avaliações)</span>
            </div>
          </div>

          {/* Add to cart */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.button
              className="r42-add-cart h-10 px-5 rounded-xl text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              whileTap={{ scale: 0.97 }}
            >
              Adicionar
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ═══ TOAST ═══ */}
      <ToastNotification
        message={toastMessage}
        visible={toastVisible}
        icon={toastIcon}
      />
    </div>
  )
}

export default ARProductTryOn2
