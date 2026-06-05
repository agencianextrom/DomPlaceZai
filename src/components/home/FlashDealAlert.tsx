'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { cachedFetch } from '@/lib/api-cache'

interface FlashDeal {
  id: string
  productName: string
  storeName: string
  originalPrice: number
  salePrice: number
  discountPercent: number
  timeLeftSeconds: number
  productImage: string
}

interface FlashDealAlertProps {
  className?: string
}

const STORAGE_KEY = 'r65-flash-dismissed'
const CYCLE_INTERVAL = 8000
const TICK_INTERVAL = 1000

const fallbackDeals: FlashDeal[] = [
  {
    id: 'fd-1',
    productName: 'Açaí Premium 700ml',
    storeName: 'Açaí da Boa',
    originalPrice: 22.00,
    salePrice: 13.20,
    discountPercent: 40,
    timeLeftSeconds: 420,
    productImage: '/images/acai.jpg',
  },
  {
    id: 'fd-2',
    productName: 'Arroz Tio João 5kg',
    storeName: 'Mercado do Zé',
    originalPrice: 29.90,
    salePrice: 20.93,
    discountPercent: 30,
    timeLeftSeconds: 600,
    productImage: '/images/grocery.jpg',
  },
  {
    id: 'fd-3',
    productName: 'Vitamina C 500mg',
    storeName: 'Farmácia Vida',
    originalPrice: 42.00,
    salePrice: 29.40,
    discountPercent: 30,
    timeLeftSeconds: 350,
    productImage: '/images/pharmacy.jpg',
  },
  {
    id: 'fd-4',
    productName: 'Pão Francês (12 un)',
    storeName: 'Padaria Pão Quente',
    originalPrice: 12.00,
    salePrice: 6.60,
    discountPercent: 45,
    timeLeftSeconds: 510,
    productImage: '/images/bakery.jpg',
  },
]

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function buildDealsFromProducts(products: Array<{
  id: string
  name: string
  storeName: string
  price: number
  comparePrice: number | null
  images: string
}>): FlashDeal[] {
  const shuffled = [...products].sort(() => Math.random() - 0.5).slice(0, 6)
  return shuffled.map((product) => {
    const discount = Math.floor(Math.random() * 36) + 15 // 15-50%
    const basePrice = product.comparePrice && product.comparePrice > product.price
      ? product.comparePrice
      : product.price
    const salePrice = Math.round(basePrice * (1 - discount / 100) * 100) / 100
    const timeLeft = Math.floor(Math.random() * 540) + 120 // 2-11 minutes
    return {
      id: `fd-${product.id}`,
      productName: product.name,
      storeName: product.storeName,
      originalPrice: basePrice,
      salePrice,
      discountPercent: discount,
      timeLeftSeconds: timeLeft,
      productImage: product.images && product.images.length > 0
        ? (JSON.parse(product.images) as string[])[0] ?? '/images/grocery.jpg'
        : '/images/grocery.jpg',
    }
  })
}

export function FlashDealAlert({ className = '' }: FlashDealAlertProps) {
  const [deals, setDeals] = useState<FlashDeal[]>(fallbackDeals)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(fallbackDeals[0].timeLeftSeconds)
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [loaded, setLoaded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch products and build deals
  useEffect(() => {
    cachedFetch<{ products: Array<{
      id: string
      name: string
      storeName: string
      price: number
      comparePrice: number | null
      images: string
    }> }>('/api/products')
      .then((data) => {
        if (data?.products && data.products.length > 0) {
          const built = buildDealsFromProducts(data.products)
          setDeals(built)
          setTimeRemaining(built[0].timeLeftSeconds)
        }
      })
      .catch(() => {
        // Keep fallback deals
      })
      .finally(() => {
        setLoaded(true)
      })
  }, [])

  // Countdown timer for current deal
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Move to next deal
          setCurrentIndex((idx) => {
            const next = (idx + 1) % deals.length
            const nextDeal = deals[next]
            return next
          })
          return deals[(currentIndex + 1) % deals.length]?.timeLeftSeconds ?? 300
        }
        return prev - 1
      })
    }, TICK_INTERVAL)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [deals, currentIndex])

  // Auto-cycle timer
  useEffect(() => {
    if (cycleRef.current) clearInterval(cycleRef.current)
    cycleRef.current = setInterval(() => {
      setCurrentIndex((idx) => {
        const next = (idx + 1) % deals.length
        const nextDeal = deals[next]
        if (nextDeal) setTimeRemaining(nextDeal.timeLeftSeconds)
        return next
      })
    }, CYCLE_INTERVAL)
    return () => {
      if (cycleRef.current) clearInterval(cycleRef.current)
    }
  }, [deals])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // sessionStorage not available
    }
  }, [])

  const handlePrev = useCallback(() => {
    setCurrentIndex((idx) => {
      const next = (idx - 1 + deals.length) % deals.length
      const nextDeal = deals[next]
      if (nextDeal) setTimeRemaining(nextDeal.timeLeftSeconds)
      return next
    })
  }, [deals])

  const handleNext = useCallback(() => {
    setCurrentIndex((idx) => {
      const next = (idx + 1) % deals.length
      const nextDeal = deals[next]
      if (nextDeal) setTimeRemaining(nextDeal.timeLeftSeconds)
      return next
    })
  }, [deals])

  const currentDeal = deals[currentIndex]
  const progressPercent = currentDeal
    ? Math.max(0, Math.min(100, (timeRemaining / currentDeal.timeLeftSeconds) * 100))
    : 0

  if (!loaded || dismissed || !currentDeal) return null

  return (
    <div className={`fixed top-0 left-0 right-0 z-40 ${className}`}>
      <AnimatePresence>
        <motion.div
          key="flash-deal-banner"
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ type: 'spring' as const, stiffness: 260, damping: 30 }}
          className="w-full"
        >
          {/* Banner container */}
          <div className="r65-flash-banner w-full max-w-lg mx-auto px-2 pt-2">
            <div className="r65-flash-card rounded-xl overflow-hidden">
              {/* Progress bar */}
              <div className="r65-flash-progress">
                <div
                  className="r65-flash-progress-bar"
                  style={{ width: `${progressPercent}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Tempo restante da oferta"
                />
              </div>

              {/* Deal content */}
              <div className="p-3">
                <div className="flex items-start gap-3">
                  {/* Product image */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white/10">
                    <img
                      src={currentDeal.productImage}
                      alt={currentDeal.productName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Deal info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
                      <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                        Oferta relâmpago
                      </span>
                      <span className="text-[10px] font-extrabold bg-amber-400/90 text-red-700 px-1.5 py-0.5 rounded-full">
                        -{currentDeal.discountPercent}%
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">
                      {currentDeal.productName}
                    </p>
                    <p className="text-[11px] text-white/70 truncate">{currentDeal.storeName}</p>

                    {/* Prices */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="r65-flash-price-old text-xs">
                        {formatBRL(currentDeal.originalPrice)}
                      </span>
                      <span className="r65-flash-price-new text-lg">
                        {formatBRL(currentDeal.salePrice)}
                      </span>
                    </div>
                  </div>

                  {/* Countdown + CTA */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Countdown */}
                    <div
                      className="flex items-center gap-1 bg-black/20 rounded-lg px-2.5 py-1"
                      aria-label={`Tempo restante: ${formatCountdown(timeRemaining)}`}
                    >
                      <svg
                        className="w-3.5 h-3.5 text-red-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="13" r="8" />
                        <path d="M12 9v4l2.5 1.5" />
                        <path d="M5 3L2 6" />
                        <path d="M22 6l-3-3" />
                        <path d="M12 5v2" />
                      </svg>
                      <span className="text-sm font-mono font-bold text-white tabular-nums">
                        {formatCountdown(timeRemaining)}
                      </span>
                    </div>

                    {/* CTA button */}
                    <button
                      type="button"
                      className="r65-flash-cta rounded-lg px-4 py-2 text-sm"
                      aria-label={`Ver oferta de ${currentDeal.productName}`}
                    >
                      Ver oferta
                    </button>
                  </div>
                </div>

                {/* Navigation + dots row */}
                <div className="flex items-center justify-between mt-2">
                  {/* Prev arrow */}
                  <button
                    type="button"
                    className="r65-flash-nav flex items-center justify-center"
                    onClick={handlePrev}
                    aria-label="Oferta anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Dots */}
                  <div className="flex items-center gap-1.5" role="tablist" aria-label="Seletor de ofertas">
                    {deals.map((deal, idx) => (
                      <button
                        key={deal.id}
                        type="button"
                        role="tab"
                        aria-selected={idx === currentIndex}
                        aria-label={`Oferta ${idx + 1} de ${deals.length}`}
                        className={`r65-flash-dot ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => {
                          setCurrentIndex(idx)
                          const clickedDeal = deals[idx]
                          if (clickedDeal) setTimeRemaining(clickedDeal.timeLeftSeconds)
                        }}
                      />
                    ))}
                  </div>

                  {/* Next arrow */}
                  <button
                    type="button"
                    className="r65-flash-nav flex items-center justify-center"
                    onClick={handleNext}
                    aria-label="Próxima oferta"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dismiss button — absolute positioned over the banner */}
          <button
            type="button"
            className="r65-flash-dismiss absolute top-3 right-3 flex items-center justify-center rounded-full"
            onClick={handleDismiss}
            aria-label="Fechar notificação de ofertas"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
