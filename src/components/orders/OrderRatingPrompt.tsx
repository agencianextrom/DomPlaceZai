'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Star, Camera, X, Sparkles, Package, Clock, MessageSquare, Box } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CategoryRating {
  id: string
  label: string
  icon: typeof Package
  value: number
}

interface OrderRatingPromptProps {
  orderId?: string
  storeName?: string
  isOpen?: boolean
  onComplete?: (rating: number) => void
  onDismiss?: () => void
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'r34_rated_orders'

const EMOJI_MAP: Record<number, string> = { 1: '😞', 2: '😞', 3: '😐', 4: '😊', 5: '🤩' }
const EMOJI_LABEL: Record<number, string> = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
}

const FEEDBACK_TAGS = [
  'Produto bom',
  'Entrega rápida',
  'Bom preço',
  'Recomendo',
  'Loja organizada',
]

const SPRING_STIFF = 350
const SPRING_DAMP = 26

const CATEGORIES_INIT: CategoryRating[] = [
  { id: 'quality', label: 'Qualidade do produto', icon: Package, value: 0 },
  { id: 'delivery', label: 'Tempo de entrega', icon: Clock, value: 0 },
  { id: 'service', label: 'Atendimento', icon: MessageSquare, value: 0 },
  { id: 'packaging', label: 'Embalagem', icon: Box, value: 0 },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function hasRated(orderId: string): boolean {
  try {
    const stored: string | null = localStorage.getItem(STORAGE_KEY)
    if (!stored) return false
    const list: string[] = JSON.parse(stored)
    return list.includes(orderId)
  } catch {
    return false
  }
}

function markRated(orderId: string): void {
  try {
    const stored: string | null = localStorage.getItem(STORAGE_KEY)
    const list: string[] = stored ? JSON.parse(stored) : []
    if (!list.includes(orderId)) {
      list.push(orderId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    }
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OrderRatingPrompt({
  orderId = 'mock-order-001',
  storeName = 'DomPlace Store',
  isOpen = true,
  onComplete,
  onDismiss,
}: OrderRatingPromptProps) {
  const [visible, setVisible] = useState(false)
  const [overallRating, setOverallRating] = useState(0)
  const [hoverStar, setHoverStar] = useState(0)
  const [categories, setCategories] = useState<CategoryRating[]>(CATEGORIES_INIT)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [step, setStep] = useState<'rating' | 'details' | 'success'>('rating')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* Auto-show after brief delay, skip if already rated */
  useEffect(() => {
    if (!isOpen) return
    if (hasRated(orderId)) return
    const t = setTimeout(() => setVisible(true), 600)
    return () => clearTimeout(t)
  }, [isOpen, orderId])

  /* Star display helper */
  const displayRating = hoverStar || overallRating

  /* Category setters */
  const setCategory = useCallback((id: string, val: number) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, value: val } : c)))
  }, [])

  /* Tag toggle */
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }, [])

  /* Photo handling */
  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
    setPhotoFile(file)
  }, [])

  const removePhoto = useCallback(() => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
    setPhotoFile(null)
  }, [photoPreview])

  /* Dismiss */
  const handleDismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      setVisible(false)
      setExiting(false)
      onDismiss?.()
    }, 350)
  }, [onDismiss])

  /* Submit */
  const handleSubmit = useCallback(() => {
    setShowConfetti(true)
    setStep('success')
    markRated(orderId)
    const avg = categories.reduce((s, c) => s + c.value, 0) / categories.length
    const finalRating = Math.round(avg || overallRating)
    onComplete?.(finalRating)
    setTimeout(() => handleDismiss(), 2200)
  }, [orderId, categories, overallRating, onComplete, handleDismiss])

  if (!visible && !exiting) return null

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleDismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card */}
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: exiting ? 120 : 0, opacity: exiting ? 0 : 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: SPRING_STIFF, damping: SPRING_DAMP }}
            className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto r34-prompt-card r62-card-lift"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}
          >
            {/* Confetti layer */}
            <ConfettiBurst
              active={showConfetti}
              particleCount={50}
              spread={220}
              origin="top"
              duration={1400}
              onComplete={() => setShowConfetti(false)}
            />

            {/* ---- Header gradient bar ---- */}
            <div
              className="h-1.5 w-full rounded-t-2xl sm:rounded-t-2xl r34-prompt-header-bar"
              style={{
                background: 'linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)',
              }}
            />

            {/* Close */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 h-8 w-8 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors r34-prompt-close"
              aria-label="Fechar"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>

            <div className="p-5 pt-4">
              {/* ---- Title ---- */}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-5"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-gray-900 r62-heading-gradient">Como foi sua experiência?</h2>
                </div>
                <p className="text-xs text-gray-500">
                  Pedido #{orderId.slice(-6).toUpperCase()} · {storeName}
                </p>
              </motion.div>

              <AnimatePresence mode="wait">
                {/* ============================== */}
                {/* STEP: rating                  */}
                {/* ============================== */}
                {step === 'rating' && (
                  <motion.div
                    key="step-rating"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ type: 'spring' as const, stiffness: SPRING_STIFF, damping: SPRING_DAMP }}
                  >
                    {/* Emoji reaction */}
                    <div className="flex justify-center mb-3">
                      <motion.span
                        key={displayRating || 'none'}
                        initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 400, damping: 16 }}
                        className="text-5xl inline-block select-none r34-prompt-emoji"
                      >
                        {displayRating ? EMOJI_MAP[displayRating] : '🌟'}
                      </motion.span>
                    </div>

                    {/* Star selector */}
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <motion.button
                          key={s}
                          type="button"
                          whileHover={{ scale: 1.25 }}
                          whileTap={{ scale: 0.85 }}
                          onMouseEnter={() => setHoverStar(s)}
                          onMouseLeave={() => setHoverStar(0)}
                          onClick={() => setOverallRating(s)}
                          className="focus:outline-none relative r34-prompt-star"
                          aria-label={`${s} estrela${s > 1 ? 's' : ''}`}
                        >
                          <motion.div
                            animate={{
                              scale: s <= displayRating ? 1 : 0.9,
                              filter:
                                s <= displayRating
                                  ? ['drop-shadow(0 0 0px rgba(234,179,8,0))', 'drop-shadow(0 0 8px rgba(234,179,8,0.5))', 'drop-shadow(0 0 0px rgba(234,179,8,0))']
                                  : 'drop-shadow(0 0 0px rgba(0,0,0,0))',
                            }}
                            transition={{ duration: 0.25 }}
                          >
                            <Star
                              className={`h-9 w-9 transition-colors ${
                                s <= displayRating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                              }`}
                            />
                          </motion.div>
                        </motion.button>
                      ))}
                    </div>

                    {displayRating > 0 && (
                      <motion.p
                        key={displayRating}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-sm font-medium text-gray-600 mb-5"
                      >
                        {EMOJI_LABEL[displayRating]}
                      </motion.p>
                    )}

                    {/* Continue CTA */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => overallRating > 0 && setStep('details')}
                      disabled={overallRating === 0}
                      className="w-full h-11 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed r34-prompt-continue"
                      style={{
                        background: overallRating > 0
                          ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                          : '#e5e7eb',
                        color: overallRating > 0 ? '#ffffff' : '#9ca3af',
                      }}
                    >
                      Continuar
                    </motion.button>
                  </motion.div>
                )}

                {/* ============================== */}
                {/* STEP: details                  */}
                {/* ============================== */}
                {step === 'details' && (
                  <motion.div
                    key="step-details"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ type: 'spring' as const, stiffness: SPRING_STIFF, damping: SPRING_DAMP }}
                  >
                    {/* Category ratings with animated bars */}
                    <div className="space-y-4 mb-5">
                      {categories.map((cat) => {
                        const Icon = cat.icon
                        return (
                          <div key={cat.id} className="r34-prompt-category">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: 'rgba(245,158,11,0.12)' }}
                                >
                                  <Icon className="h-3.5 w-3.5 text-amber-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                              </div>
                              <span className="text-xs font-medium text-gray-400">{cat.value}/5</span>
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-1 mb-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setCategory(cat.id, s)}
                                  className="focus:outline-none"
                                  aria-label={`${cat.label} ${s} estrelas`}
                                >
                                  <Star
                                    className={`h-6 w-6 transition-all duration-200 ${
                                      s <= cat.value
                                        ? 'text-amber-500 fill-amber-500'
                                        : 'text-gray-200 hover:text-gray-400'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>

                            {/* Progress bar */}
                            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: '#f59e0b' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(cat.value / 5) * 100}%` }}
                                transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Feedback tags */}
                    <div className="mb-5">
                      <p className="text-sm font-medium text-gray-700 mb-2">Marcadores rápidos</p>
                      <div className="flex flex-wrap gap-2">
                        {FEEDBACK_TAGS.map((tag) => {
                          const active = selectedTags.has(tag)
                          return (
                            <motion.button
                              key={tag}
                              type="button"
                              whileTap={{ scale: 0.92 }}
                              onClick={() => toggleTag(tag)}
                              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors r34-prompt-tag"
                              style={{
                                borderColor: active ? '#f59e0b' : '#e5e7eb',
                                backgroundColor: active ? 'rgba(245,158,11,0.12)' : '#ffffff',
                                color: active ? '#b45309' : '#6b7280',
                              }}
                              animate={{
                                scale: active ? 1.05 : 1,
                              }}
                              transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
                            >
                              {active ? '✓ ' : ''}{tag}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Photo upload */}
                    <div className="mb-5">
                      <p className="text-sm font-medium text-gray-700 mb-2">Foto (opcional)</p>

                      <AnimatePresence mode="wait">
                        {photoPreview ? (
                          <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ type: 'spring' as const, stiffness: 400, damping: 24 }}
                            className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-amber-300 r34-prompt-photo-thumb"
                          >
                            <img
                              src={photoPreview}
                              alt="Foto da avaliação"
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                              aria-label="Remover foto"
                            >
                              <X className="h-3.5 w-3.5 text-white" />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="dropzone"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onDragOver={(e) => {
                              e.preventDefault()
                              setIsDragging(true)
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault()
                              setIsDragging(false)
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              setIsDragging(false)
                              const file = e.dataTransfer.files?.[0]
                              if (file) processFile(file)
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-1.5 h-24 rounded-xl border-2 border-dashed cursor-pointer transition-colors r34-prompt-dropzone"
                            style={{
                              borderColor: isDragging ? '#f59e0b' : '#e5e7eb',
                              backgroundColor: isDragging ? 'rgba(245,158,11,0.06)' : '#fafafa',
                            }}
                          >
                            <div
                              className="h-9 w-9 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: 'rgba(245,158,11,0.12)' }}
                            >
                              <Camera className="h-4 w-4 text-amber-600" />
                            </div>
                            <span className="text-xs text-gray-400">Arraste ou toque</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) processFile(file)
                        }}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSubmit}
                        className="w-full h-11 rounded-xl font-semibold text-sm text-white transition-all r34-prompt-submit"
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        }}
                      >
                        Enviar avaliação
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleDismiss}
                        className="w-full h-10 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors r34-prompt-skip"
                      >
                        Agora não
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ============================== */}
                {/* STEP: success                  */}
                {/* ============================== */}
                {step === 'success' && (
                  <motion.div
                    key="step-success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring' as const, stiffness: SPRING_STIFF, damping: SPRING_DAMP }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 15, delay: 0.1 }}
                      className="text-6xl mb-3 select-none"
                    >
                      🎉
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="text-xl font-bold text-gray-900 mb-1"
                    >
                      Obrigado pela avaliação!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="text-sm text-gray-500"
                    >
                      Sua opinião é muito importante para nós.
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
