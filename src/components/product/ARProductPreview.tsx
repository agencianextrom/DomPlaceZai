'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, RotateCcw, Share2, Eye, Ruler, Layers, Palette, Maximize2, Minimize2, X, Info } from 'lucide-react'

/* ────────────── Mock data ────────────── */
const MOCK_PRODUCT = {
  name: 'Poltrona Moderna Lux',
  price: 2899.9,
  image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80',
  dimensions: { w: 85, h: 95, d: 78 },
  colors: [
    { id: 'c1', name: 'Bege Claro', hex: '#d4c5a9' },
    { id: 'c2', name: 'Cinza Sofisticado', hex: '#7a7a7a' },
    { id: 'c3', name: 'Verde Oliva', hex: '#6b7c5e' },
    { id: 'c4', name: 'Terracota', hex: '#c4714a' },
  ],
  hotspots: [
    { id: 'h1', x: 30, y: 28, title: 'Espuma D30', desc: 'Espuma de alta densidade com memória de forma para máximo conforto.' },
    { id: 'h2', x: 72, y: 32, title: 'Tecido Premium', desc: 'Tecido antimanchas 100% poliéster com certificação OEKO-TEX.' },
    { id: 'h3', x: 50, y: 65, title: 'Estrutura Sólida', desc: 'Pernas de madeira maciça de carvalho com acabamento fosco.' },
    { id: 'h4', x: 22, y: 58, title: 'Molas Zigzag', desc: 'Sistema de 8 molas zigzag para suporte duradouro.' },
    { id: 'h5', x: 78, y: 60, title: 'Encosto Reclinável', desc: 'Mecanismo de reclinação em 3 posições com trava de segurança.' },
  ],
}

const ANGLE_VIEWS = [
  { id: 'front', label: 'Frente', deg: 0 },
  { id: 'side', label: 'Lado', deg: 90 },
  { id: 'back', label: 'Verso', deg: 180 },
  { id: 'top', label: 'Topo', deg: 270 },
]

/* ────────────── Skeleton loader ────────────── */
function ARSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden space-y-4 p-4">
      <div className="aspect-square rounded-xl bg-muted/40 animate-pulse" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-8 rounded-full bg-muted/40 animate-pulse" />
        ))}
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-32 rounded-lg bg-muted/40 animate-pulse" />
        <div className="h-9 w-32 rounded-lg bg-muted/40 animate-pulse" />
      </div>
      <div className="h-4 w-40 rounded bg-muted/40 animate-pulse" />
    </div>
  )
}

/* ────────────── Hotspot pulse ring ────────────── */
function HotspotDot({ x, y, label, onClick, isActive }: { x: number; y: number; label: string; onClick: () => void; isActive: boolean }) {
  return (
    <motion.button
      className="absolute z-20 group"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      onClick={onClick}
      whileHover={{ scale: 1.3 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ width: 32, height: 32, left: -8, top: -8 }}
        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />
      <motion.div
        className="relative w-4 h-4 rounded-full border-2 border-white shadow-md"
        style={{ backgroundColor: isActive ? '#e11d48' : '#10b981' }}
        animate={isActive ? { boxShadow: '0 0 12px rgba(225,29,72,0.5), 0 0 24px rgba(225,29,72,0.2)' } : { boxShadow: '0 0 8px rgba(16,185,129,0.4)' }}
      />
      <span className="sr-only">{label}</span>
    </motion.button>
  )
}

/* ────────────── Main component ────────────── */
export function ARProductPreview() {
  const [loading, setLoading] = useState(true)
  const [arMode, setArMode] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedColor, setSelectedColor] = useState(MOCK_PRODUCT.colors[0])
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [showMeasurements, setShowMeasurements] = useState(false)
  const [arScale, setArScale] = useState(1)
  const [arPosition, setArPosition] = useState({ x: 50, y: 50 })
  const [isDraggingAR, setIsDraggingAR] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)

  const viewerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef(0)
  const rotStartRef = useRef(0)
  const arDragStart = useRef({ x: 0, y: 0 })
  const arPosStart = useRef({ x: 0, y: 0 })

  /* Simulate loading */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  /* Auto-rotate */
  useEffect(() => {
    if (!autoRotate || isDragging || arMode) return
    const interval = setInterval(() => {
      setRotation((r) => (r + 0.4) % 360)
    }, 30)
    return () => clearInterval(interval)
  }, [autoRotate, isDragging, arMode])

  /* 3D drag handlers */
  const handleDragStart = useCallback((e: React.PointerEvent) => {
    if (arMode) return
    setIsDragging(true)
    setAutoRotate(false)
    dragStartRef.current = e.clientX
    rotStartRef.current = rotation
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [arMode, rotation])

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || arMode) return
    const delta = e.clientX - dragStartRef.current
    setRotation(rotStartRef.current + delta * 0.5)
  }, [isDragging, arMode])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  /* Snap to angle view */
  const snapToAngle = useCallback((deg: number) => {
    setAutoRotate(false)
    setRotation(deg)
  }, [])

  /* AR drag handlers */
  const handleARDragStart = useCallback((e: React.PointerEvent) => {
    setIsDraggingAR(true)
    arDragStart.current = { x: e.clientX, y: e.clientY }
    arPosStart.current = { ...arPosition }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [arPosition])

  const handleARDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingAR) return
    const rect = viewerRef.current?.getBoundingClientRect()
    if (!rect) return
    const dx = e.clientX - arDragStart.current.x
    const dy = e.clientY - arDragStart.current.y
    setArPosition({
      x: Math.max(10, Math.min(90, arPosStart.current.x + (dx / rect.width) * 100)),
      y: Math.max(10, Math.min(90, arPosStart.current.y + (dy / rect.height) * 100)),
    })
  }, [isDraggingAR])

  const handleARDragEnd = useCallback(() => {
    setIsDraggingAR(false)
  }, [])

  /* Share handler */
  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${MOCK_PRODUCT.name} — Vista AR`,
          text: `Confira este produto em realidade aumentada na DomPlace! ${MOCK_PRODUCT.name} por R$${MOCK_PRODUCT.price.toFixed(2)}`,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        })
      } catch {
        /* user cancelled */
      }
    }
  }, [])

  if (loading) return <ARSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
      className="rounded-2xl overflow-hidden bg-background border border-border shadow-lg"
    >
      {/* ─── Toolbar ─── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Pré-visualização AR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setArMode(!arMode)}
            className="r33-ar-toggle flex items-center gap-1.5 h-8 min-h-[44px] px-3 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: arMode ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.05)',
              color: arMode ? '#059669' : 'rgba(0,0,0,0.6)',
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            {arMode ? 'Sair do AR' : 'Tire no seu espaço'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="r33-ar-share relative overflow-hidden flex items-center gap-1.5 h-8 min-h-[44px] px-3 rounded-lg text-xs font-medium bg-primary/10 text-primary"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Compartilhar vista AR</span>
            {/* shimmer effect */}
            <motion.div
              className="absolute inset-0 -translate-x-full"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            />
          </motion.button>
        </div>
      </div>

      {/* ─── Viewer area ─── */}
      <div
        ref={viewerRef}
        className="relative aspect-[4/3] sm:aspect-square overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={arMode ? handleARDragStart : handleDragStart}
        onPointerMove={arMode ? handleARDragMove : handleDragMove}
        onPointerUp={arMode ? handleARDragEnd : handleDragEnd}
        onPointerLeave={arMode ? handleARDragEnd : handleDragEnd}
      >
        {/* AR grid overlay */}
        <AnimatePresence>
          {arMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-0 r33-ar-grid"
              style={{
                background: `
                  repeating-linear-gradient(0deg, rgba(16,185,129,0.12) 0px, rgba(16,185,129,0.12) 1px, transparent 1px, transparent 40px),
                  repeating-linear-gradient(90deg, rgba(16,185,129,0.12) 0px, rgba(16,185,129,0.12) 1px, transparent 1px, transparent 40px),
                  linear-gradient(180deg, rgba(30,30,30,0.85), rgba(20,20,20,0.95))
                `,
              }}
            >
              {/* Simulated camera info */}
              <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: '#ef4444' }}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] text-white/70 font-mono tracking-wide">AR ATIVO</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background gradient fallback */}
        <div
          className="absolute inset-0"
          style={{
            background: arMode
              ? 'transparent'
              : 'radial-gradient(ellipse at center, rgba(241,245,249,1) 0%, rgba(229,231,235,1) 100%)',
          }}
        />

        {/* ── 3D Product card ── */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: '1200px' }}
        >
          <motion.div
            className="relative"
            animate={{
              rotateY: rotation,
              scale: arMode ? arScale : 1,
              x: arMode ? `${arPosition.x - 50}%` : '0%',
              y: arMode ? `${arPosition.y - 50}%` : '0%',
            }}
            transition={isDragging || isDraggingAR ? { type: 'tween' as const, duration: 0 } : { type: 'spring' as const, stiffness: 120, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Product shadow / reflection in AR mode */}
            {arMode && (
              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: `${70 * arScale}%`,
                  height: 16,
                  background: 'rgba(0,0,0,0.25)',
                  filter: 'blur(8px)',
                }}
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Product image card */}
            <motion.div
              className="relative rounded-2xl overflow-hidden"
              style={{
                width: arMode ? '65%' : 'min(280px, 70%)',
                boxShadow: arMode
                  ? '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)'
                  : '0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
              }}
              animate={{
                rotateX: arMode ? -8 : 0,
              }}
              transition={{ type: 'spring' as const, stiffness: 100, damping: 18 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedColor.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="aspect-square relative"
                >
                  <img
                    src={MOCK_PRODUCT.image}
                    alt={MOCK_PRODUCT.name}
                    className="w-full h-full object-cover"
                    style={{ filter: `hue-rotate(${selectedColor.hex === MOCK_PRODUCT.colors[0].hex ? 0 : 15}deg) saturate(${selectedColor.hex === MOCK_PRODUCT.colors[0].hex ? 1 : 0.8})` }}
                  />
                  {/* Tinted overlay to simulate color change */}
                  <div className="absolute inset-0 mix-blend-multiply" style={{ backgroundColor: selectedColor.hex, opacity: 0.18 }} />
                </motion.div>
              </AnimatePresence>

              {/* Hotspot dots */}
              {!arMode && MOCK_PRODUCT.hotspots.map((hs) => (
                <HotspotDot
                  key={hs.id}
                  x={hs.x}
                  y={hs.y}
                  label={hs.title}
                  onClick={() => setActiveHotspot(activeHotspot === hs.id ? null : hs.id)}
                  isActive={activeHotspot === hs.id}
                />
              ))}

              {/* ── Measurement overlay ── */}
              <AnimatePresence>
                {showMeasurements && !arMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    {/* Width line (bottom) */}
                    <motion.div
                      className="absolute bottom-6 left-[10%] right-[10%] h-px"
                      style={{ background: '#e11d48' }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    />
                    <motion.div
                      className="absolute bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{ background: '#e11d48', color: '#fff' }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      {MOCK_PRODUCT.dimensions.w} cm
                    </motion.div>

                    {/* Height line (right) */}
                    <motion.div
                      className="absolute top-[10%] bottom-[10%] right-6 w-px"
                      style={{ background: '#e11d48' }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    />
                    <motion.div
                      className="absolute top-1/2 right-4 -translate-y-1/2 -rotate-90 px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{ background: '#e11d48', color: '#fff' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      {MOCK_PRODUCT.dimensions.h} cm
                    </motion.div>

                    {/* Depth label */}
                    <motion.div
                      className="absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-medium"
                      style={{ background: 'rgba(225,29,72,0.9)', color: '#fff' }}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                    >
                      P: {MOCK_PRODUCT.dimensions.d} cm
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Hotspot tooltip ── */}
        <AnimatePresence>
          {activeHotspot && !arMode && (
            <motion.div
              key={activeHotspot}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.9 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 z-30 rounded-xl p-3.5 border"
              style={{
                background: 'rgba(255,255,255,0.95)',
                borderColor: 'rgba(0,0,0,0.08)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {(() => {
                const hs = MOCK_PRODUCT.hotspots.find((h) => h.id === activeHotspot)
                if (!hs) return null
                return (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-sm font-semibold leading-tight">{hs.title}</span>
                      </div>
                      <button onClick={() => setActiveHotspot(null)} className="shrink-0 p-0.5 rounded-md hover:bg-black/5 transition-colors">
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">{hs.desc}</p>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveHotspot(null)}
                      className="w-full h-8 rounded-lg text-xs font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                      Ver detalhes
                    </motion.button>
                  </>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Controls bar ─── */}
      <div className="border-t border-border px-4 py-3 space-y-3">
        {/* Angle views (normal mode only) */}
        <AnimatePresence>
          {!arMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-1.5 overflow-x-auto"
            >
              <RotateCcw
                className="h-3.5 w-3.5 text-muted-foreground shrink-0 cursor-pointer p-[15px] rounded-md hover:bg-muted/50 transition-colors"
                onClick={() => { setAutoRotate(true); setRotation(0) }}
              />
              {ANGLE_VIEWS.map((av) => (
                <motion.button
                  key={av.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => snapToAngle(av.deg)}
                  className="r33-ar-angle-btn shrink-0 h-7 min-h-[44px] px-3 rounded-md text-[11px] font-medium transition-colors"
                  style={{
                    background: Math.abs(rotation - av.deg) < 5 ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.04)',
                    color: Math.abs(rotation - av.deg) < 5 ? '#059669' : 'rgba(0,0,0,0.55)',
                  }}
                >
                  {av.label}
                </motion.button>
              ))}
              <div className="flex-1" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMeasurements(!showMeasurements)}
                className="r33-ar-measure-btn flex items-center gap-1.5 h-7 px-3 rounded-md text-[11px] font-medium shrink-0 transition-colors"
                style={{
                  background: showMeasurements ? 'rgba(225,29,72,0.12)' : 'rgba(0,0,0,0.04)',
                  color: showMeasurements ? '#e11d48' : 'rgba(0,0,0,0.55)',
                }}
              >
                <Ruler className="h-3.5 w-3.5" />
                Dimensões
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AR controls */}
        <AnimatePresence>
          {arMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3"
            >
              <Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground shrink-0">Escala:</span>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.05}
                value={arScale}
                onChange={(e) => setArScale(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 ${((arScale - 0.5) / 1.5) * 100}%, rgba(0,0,0,0.1) ${((arScale - 0.5) / 1.5) * 100}%)`,
                }}
              />
              <span className="text-[11px] font-mono text-muted-foreground w-8 text-right">{Math.round(arScale * 100)}%</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Color/material switcher */}
        <div className="flex items-center gap-2.5">
          <Palette className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:inline">Material:</span>
          <div className="flex items-center gap-2">
            {MOCK_PRODUCT.colors.map((c) => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedColor(c)}
                className="relative h-7 w-7 min-h-[44px] min-w-[44px] rounded-full shrink-0 transition-shadow"
                style={{ backgroundColor: c.hex, boxShadow: selectedColor.id === c.id ? `0 0 0 2px #fff, 0 0 0 4px ${c.hex}` : '0 1px 3px rgba(0,0,0,0.15)' }}
                title={c.name}
              >
                {selectedColor.id === c.id && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    style={{ border: `2px solid ${c.hex}` }}
                  />
                )}
                <span className="sr-only">{c.name}</span>
              </motion.button>
            ))}
            <span className="text-[11px] text-muted-foreground ml-1">{selectedColor.name}</span>
          </div>
        </div>

        {/* Product name + dimensions summary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold leading-tight">{MOCK_PRODUCT.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {MOCK_PRODUCT.dimensions.w} × {MOCK_PRODUCT.dimensions.h} × {MOCK_PRODUCT.dimensions.d} cm
            </p>
          </div>
          <span className="text-sm font-bold text-primary">
            R$ {MOCK_PRODUCT.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
